export interface ProfileData {
    id: string;
    name: string;
    username: string;
    password: string;
    url: string;
    maxConnections?: string;
    activeConnections?: string;
    expirationDate?: string;
    status?: string;
    avatar?: string;
    serverInfo?: {
        xui?: boolean;
        version?: string;
        revision?: number;
        url?: string;
        port?: string;
        https_port?: string;
        server_protocol?: string;
        rtmp_port?: string;
        timestamp_now?: number;
        time_now?: string;
        timezone?: string;
        [key: string]: unknown;
    };
    createdAt: number;
    updatedAt: number;
}