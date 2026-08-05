import api from '../app/api/axios';

export interface ChatMessage {
    id: string;
    orderId: string;
    senderId: string;
    senderRole: 'provider' | 'receiver';
    text: string;
    timestamp: number;
}

// In-memory cache to store polling results for UI components to read synchronously
let messageCache: Record<string, ChatMessage[]> = {};
let pollingIntervals: Record<string, ReturnType<typeof setInterval>> = {};
let globalPollingInterval: ReturnType<typeof setInterval> | null = null;

export const chatSyncService = {
    /**
     * Synchronous getter for UI components. Relies on the active polling cache.
     */
    getMessages: (orderId: string): ChatMessage[] => {
        return messageCache[orderId] || [];
    },

    /**
     * Asynchronous getter to explicitly force a server fetch and cache update.
     * Useful for initial mounts before polling cycles establish.
     */
    fetchMessagesExplicitly: async (orderId: string): Promise<ChatMessage[] | null> => {
        try {
            const res = await api.get(`/chat/${orderId}`);
            messageCache[orderId] = res.data;
            
            window.dispatchEvent(new CustomEvent('local-chat-update', { 
                detail: { orderId } 
            }));

            await api.put(`/chat/${orderId}/read`);
            return res.data;
        } catch (err) {
            console.error("Failed explicit chat fetch", err);
            return null;
        }
    },

    /**
     * Starts background HTTP polling against MongoDB and triggers DOM updates
     */
    startPolling: (orderId: string) => {
        if (pollingIntervals[orderId]) return; // Already polling

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${orderId}`);
                messageCache[orderId] = res.data;
                
                // Trigger UI update
                window.dispatchEvent(new CustomEvent('local-chat-update', { 
                    detail: { orderId } 
                }));

                // Mark as read upon accessing
                await api.put(`/chat/${orderId}/read`);
            } catch (err) {
                console.error("Failed to fetch chat messages from DB", err);
            }
        };

        fetchMessages(); // initial grab
        pollingIntervals[orderId] = setInterval(fetchMessages, 5000); // Poll every 5s
    },

    /**
     * Cleans up the background HTTP polling
     */
    stopPolling: (orderId: string) => {
        if (pollingIntervals[orderId]) {
            clearInterval(pollingIntervals[orderId]);
            delete pollingIntervals[orderId];
        }
    },

    /**
     * Starts background polling for ANY unread messages across provided orders
     */
    startGlobalPolling: (orderIds: string[]) => {
        chatSyncService.stopGlobalPolling();
        
        if (!orderIds || orderIds.length === 0) return;

        const checkUnread = async () => {
            try {
                const res = await api.post('/chat/unread', { orderIds });
                
                if (res.data.hasUnread) {
                    localStorage.setItem('chat_has_unread', 'true');
                    window.dispatchEvent(new Event('chat_unread_update'));
                } else {
                    localStorage.setItem('chat_has_unread', 'false');
                    window.dispatchEvent(new Event('chat_unread_update'));
                }
            } catch (err) {
                console.error("Failed to check global unread status", err);
            }
        };

        checkUnread();
        globalPollingInterval = setInterval(checkUnread, 30000); // Poll every 30s for unread badge
    },

    stopGlobalPolling: () => {
        if (globalPollingInterval) {
            clearInterval(globalPollingInterval);
            globalPollingInterval = null;
        }
    },

    sendMessage: async (orderId: string, senderId: string, senderRole: 'provider' | 'receiver', text: string) => {
        try {
            // Optimistic UI update
            const optimisticMsg: ChatMessage = {
                id: `temp_${Date.now()}`,
                orderId,
                senderId,
                senderRole,
                text,
                timestamp: Date.now()
            };
            
            if (!messageCache[orderId]) messageCache[orderId] = [];
            messageCache[orderId].push(optimisticMsg);
            
            window.dispatchEvent(new CustomEvent('local-chat-update', { 
                detail: { orderId } 
            }));

            // Actual DB Post
            const res = await api.post(`/chat/${orderId}`, {
                senderId,
                senderRole,
                text
            });
            
            // Re-fetch to ensure sync completeness
            const refetchRes = await api.get(`/chat/${orderId}`);
            messageCache[orderId] = refetchRes.data;
            
            window.dispatchEvent(new CustomEvent('local-chat-update', { 
                detail: { orderId } 
            }));

            return res.data;
        } catch (e) {
            console.error("Failed to save chat message to DB", e);
            return null;
        }
    }
};
