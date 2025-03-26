'use server'

import { ProfileData } from "@/@types/ProfileData";

export async function testAccount(username: string, password: string, url: string): Promise<{
    success: boolean;
    data?: ProfileData;
    error?: string;
}> {
    try {
        // Validate parameters
        if (!username || !password || !url) {
            return {
                success: false,
                error: "Missing required parameters"
            };
        }

        // Clean URL if needed (remove trailing slashes)
        const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;

        // Construct the API URL
        const apiUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        // Make the request to the service
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Check if the request was successful
        if (!response.ok) {
            return {
                success: false,
                error: `Failed to test account: ${response.statusText}`
            };
        }

        // Parse the response
        const data = await response.json();

        // Format the response according to ProfileData interface
        const profileData: ProfileData = {
            id: data.user_info?.auth || data.user_id || String(Date.now()),
            name: data.user_info?.username || username,
            username: username,
            password: password,
            url: url,
            maxConnections: data.user_info?.max_connections || undefined,
            activeConnections: data.user_info?.active_cons || undefined,
            expirationDate: data.user_info?.exp_date || undefined,
            status: data.user_info?.status || "active",
            serverInfo: {
                // Map any server info from the response
                timestamp_now: Date.now(),
                time_now: new Date().toISOString(),
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        return {
            success: true,
            data: profileData
        };
    } catch (error) {
        console.error("Error testing account:", error);
        return {
            success: false,
            error: "Failed to test account"
        };
    }
}