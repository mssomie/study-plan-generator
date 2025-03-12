"use client"; // Required for client-side hooks

import { Signika } from "next/font/google";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import "./globals.css";
import { useEffect } from "react";

const signika = Signika({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  useEffect(() => {
    let intervalId = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Refresh token every 10 minutes (corrected interval)
        intervalId = setInterval(async () => {
          try {
            await user.getIdToken(true);
            console.log("Token refreshed successfully");
          } catch (error) {
            console.error("Session refresh failed: ", error);
            // Handle token refresh failure
            await auth.signOut();
            window.location.href = '/';
          }
        }, 10 * 60 * 1000); // 600,000 ms = 10 minutes
      } else {
        // Clear interval if user logs out
        if (intervalId) clearInterval(intervalId);
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <html lang="en">
      <body className={signika.className}>
        {children}
      </body>
    </html>
  );
}