declare class WebSocket {
    private static instance;
    private eventEmitter;
    private ws;
    private isServer;
    constructor(data: any);
    static getInstance(config: any): WebSocket;
    onConnect(callback: any): void;
    emit(type: string, data: any, recipient?: any): void;
    private sendToClient;
    private sendToServer;
    onDisconnect(callback: any): void;
    on(event: string, callback: any): void;
    private initializeClient;
    private initializeServer;
}
export default WebSocket;
