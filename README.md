# 🍱 LeftOverLink

### Connecting Surplus Food with People Who Need It

**LeftOverLink** is a food-waste reduction platform designed to connect people or organizations with surplus food to individuals who need it. The platform provides a simple way for **food providers** to share available food and for **receivers** to discover and collect it.

By combining a **map-based interface, role-based access, chatbot assistance, and real-time food availability**, LeftOverLink aims to reduce food waste while supporting communities in need.

---

## 🌍 Problem Statement

A significant amount of edible food is wasted every day while many people struggle to access sufficient food.

The major challenges include:

* Surplus food is often not communicated to people nearby.
* Food providers may not have an easy platform to share excess food.
* People in need may not know where food is available.
* Lack of location-based information makes food distribution difficult.
* Food donation processes can be time-consuming and unorganized.

### 💡 Our Solution

LeftOverLink provides a centralized platform where:

**Providers → Post surplus food → Receivers discover nearby food → Food is collected → Food waste is reduced**

---

## 🎯 Objectives

* ♻️ Reduce food wastage.
* 🍱 Connect surplus food providers with receivers.
* 📍 Provide location-based food discovery.
* 🤝 Encourage community-based food sharing.
* 🤖 Provide chatbot assistance to users.
* 🔐 Provide secure authentication and role-based access.
* 📊 Provide useful information through map-based visualization.
* 🌱 Promote sustainable food management.

---

## ✨ Key Features

### 👤 Role-Based Access

Users can choose their role based on their requirement:

* **I Have Food** — Food Provider
* **I Need Food** — Food Receiver

The role determines the features and interface available to the user.

---

### 🍱 Food Provider

Providers can:

* Create an account.
* Log in securely.
* Post available surplus food.
* Provide food details.
* Specify the available quantity.
* Provide pickup/location information.
* Make surplus food visible to nearby receivers.

---

### 🥗 Food Receiver

Receivers can:

* Create an account.
* Log in securely.
* Discover available food.
* View food locations on the map.
* Check available food information.
* Find suitable pickup locations.
* Collect available surplus food.

---

### 🗺️ Interactive Map

LeftOverLink uses a map-based interface to help users discover food availability based on location.

The map helps users:

* Locate available food.
* Understand the geographical distribution of food.
* Find nearby food resources.
* Visualize food availability.

---

### 🔥 Heatmap Visualization

The application includes a heatmap visualization to represent food availability and distribution geographically.

This can help identify:

* Areas with higher food availability.
* Food distribution patterns.
* Locations where surplus food is concentrated.

---
### 🤖 Chatbot

LeftOverLink includes a chatbot to assist users with common questions and navigation.

The chatbot can help users understand:

* How the platform works.
* How to use the application.
* How providers can share food.
* How receivers can find food.
* General platform-related information.

---

### 🔐 Authentication

The platform provides user authentication to protect user accounts and support role-based functionality.

Users can:

* Register.
* Log in.
* Access role-specific functionality.
* Manage their account.

---

### 📊 Data Management

The backend manages application data such as:

* User information.
* Food posts.
* Food availability.
* Location information.
* Authentication-related data.

MongoDB is used for database management.

---

## 🏗️ System Architecture

```text
                   ┌──────────────────────┐
                   │      User            │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   React Frontend     │
                   │  Vite + TypeScript   │
                   └──────────┬───────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
       ┌─────────────────┐        ┌─────────────────┐
       │   Map / UI      │        │    Chatbot      │
       │   Interface     │        │    Assistant    │
       └─────────────────┘        └─────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   Node.js Backend    │
                   │   Express Server     │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │      MongoDB         │
                   │      Database        │
                   └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Leaflet / Map components

### Backend

* Node.js
* Express.js
* JavaScript

### Database

* MongoDB
* MongoDB Atlas

### Authentication

* Role-based authentication
* Secure backend authentication middleware

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

### Deployment

* Vercel

---

## 📂 Project Structure

```text
LeftOverLink/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   └── ...
│   │   │
│   │   ├── ...
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vercel.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   └── app.js
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package-lock.json
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/LeftOverLink-Team/LeftOverLink.git
```

### 2. Navigate to the Project

```bash
cd LeftOverLink
```

---

## 💻 Frontend Setup

Navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available through the local Vite development URL shown in the terminal.

---

## 🖥️ Backend Setup

Open another terminal and navigate to:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

The backend server will start using the configured development port.

---

## 🔐 Environment Variables

Create a `.env` file inside the appropriate backend directory.

Example:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
```

Add any other environment variables required by your local configuration.

### ⚠️ Important

Never commit your `.env` file to GitHub.

Add it to `.gitignore`:

```text
.env
```

---

## 🗄️ Database

LeftOverLink uses **MongoDB** for storing application data.

The application can be connected to **MongoDB Atlas** using a MongoDB connection string.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

Replace the example values with your own credentials.

---

## 🔄 Application Workflow

### Provider Workflow

```text
Register / Login
       ↓
Select "I Have Food"
       ↓
Provider Interface
       ↓
Post Surplus Food
       ↓
Add Food Details & Location
       ↓
Food Becomes Available
       ↓
Receiver Finds Food
```

### Receiver Workflow

```text
Register / Login
       ↓
Select "I Need Food"
       ↓
Receiver Interface
       ↓
View Available Food
       ↓
Check Map / Location
       ↓
Select Suitable Food
       ↓
Pickup / Collection
```

---

## 🌱 Social Impact

LeftOverLink aims to create a positive social and environmental impact by:

* Reducing edible food waste.
* Improving access to surplus food.
* Encouraging food sharing.
* Supporting local communities.
* Connecting providers and receivers efficiently.
* Promoting sustainable consumption.

---

## 🔮 Future Enhancements

Possible future improvements include:

* 📱 Dedicated mobile application.
* 🔔 Real-time notifications.
* 📍 Improved location-based matching.
* 🚚 Volunteer-based food delivery.
* 📊 Advanced analytics dashboard.
* 🤖 More intelligent chatbot capabilities.
* ⭐ Provider/receiver ratings and feedback.
* 🏢 Organization and NGO partnerships.
* 📈 Food-waste reduction statistics.
* 🔔 Expiry-time notifications for food posts.

---

## 👥 Team Members

| Team Member                 | GitHub                                                                 | Role                     |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| **Saranya Mutham**          | [@saranya101984](https://github.com/saranya101984)                     | Backend Development      |
| **Madineni Pavani**         | [@pavanimadineni2007-byte](https://github.com/pavanimadineni2007-byte) | Chatbot Development      |
| **Bhavya Keerthi Kodidala** | [@bhavya-kodidala](https://github.com/bhavya-kodidala)                 | Deployment & Integration |
| **Sofiya**                  | [@Sofiya977](https://github.com/Sofiya977)                             | Frontend Development     |

---

## 🤝 Contribution

We welcome ideas and improvements that can help make LeftOverLink more useful for communities.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push the branch.
6. Create a Pull Request.

---

## 📜 License

This project is developed as an educational and community-focused project for reducing food waste and improving food accessibility.

---

## ❤️ Our Mission

> **"Don't waste food. Share it with someone who needs it."**

LeftOverLink aims to turn surplus food into an opportunity to help others while building a more sustainable and connected community.

---

### ⭐ Support the Project

If you find LeftOverLink useful or meaningful, consider giving the repository a ⭐ on GitHub.

**Repository:** [https://github.com/LeftOverLink-Team/LeftOverLink](https://github.com/LeftOverLink-Team/LeftOverLink)


