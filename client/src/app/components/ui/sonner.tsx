"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          closeButton:
            "group-[.toast]:!bg-red-500 group-[.toast]:!text-white group-[.toast]:!border-red-600 group-[.toast]:hover:!bg-red-600 group-[.toast]:hover:shadow-lg group-[.toast]:transition-all group-[.toast]:duration-300 group-[.toast]:!opacity-100 !flex !items-center !justify-center !w-6 !h-6 !rounded-full !absolute !-right-2 !-top-2 !left-auto hover:!scale-110",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

