import { ProfileData } from "@/@types/ProfileData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const username = searchParams.get("username");
        const password = searchParams.get("password");
        const url = searchParams.get("url");

        // Validate parameters
        if (!username || !password || !url) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Clean URL if needed (remove trailing slashes)
        const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;

        // Construct the API URL
        const apiUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        console.log("apiUrl: ", apiUrl)
        // Make the request to the service
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Check if the request was successful
        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to test account: ${response.statusText}` },
                { status: response.status }
            );
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

        return NextResponse.json(profileData);
    } catch (error) {
        console.error("Error testing account:", error);
        return NextResponse.json(
            { error: "Failed to test account" },
            { status: 500 }
        );
    }
}