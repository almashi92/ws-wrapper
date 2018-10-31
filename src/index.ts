import * as ws from 'ws';
import { EventEmitter } from 'events';

class WebSocket {

  private static instance: WebSocket = null;
  private eventEmitter: EventEmitter = null;
  private ws: any = null;
  private isServer: boolean = null;

  public constructor(data: any) {
    this.eventEmitter = new EventEmitter();
    this.isServer = !!data.isServer;
    if (data.isServer) {
      this.ws = new ws.Server({ ...data.config });
      this.initializeServer();
    } else {
      this.ws = new ws(data.url, data.opts || {});
      this.initializeClient();
    }
  }

  public static getInstance(config: any) {
    if (!this.instance) {
      this.instance = new this(config);
    }
    return this.instance;
  }

  public onConnect(callback: any): void {
    if (this.isServer) {
      this.eventEmitter.on('connection', (client) => {
        client.emitter = new EventEmitter();
        client.on('message', (data) => {
          const message = JSON.parse(data);
          client.emitter.emit(message.type, message.data);
        });
        client.on('close', () => {
          this.eventEmitter.emit('close', client);
        });
        callback(client);
      });
    } else {
      this.eventEmitter.on('connection', () => {
        callback();
      });
    }
  }

  public emit(type: string, data: any, recipient: any = null) {
    const message = JSON.stringify({ type, data });
    if (this.isServer && recipient) {
      if (recipient === typeof Array) {
        recipient.map((client) => {
          this.sendToClient(message, client);
        });
      } else {
        this.sendToClient(message, recipient);
      }
    } else {
      this.sendToServer(message);
    }
  }

  private sendToClient(message: string, client: any): void {
    client.send(message);
  }

  private sendToServer(message: string): void {
    this.ws.send(message);
  }

  public onDisconnect(callback: any): void {
    if (this.isServer) {
      this.eventEmitter.on('close', (client) => {
        callback(client);
      });
    } else {
      this.eventEmitter.on('close', () => {
        callback();
      });
    }
  }

  public on(event: string, callback: any): void {
    this.eventEmitter.on(event, callback);
  }

  private initializeClient() {
    this.ws.on('open', () => {
      this.eventEmitter.emit('connection');
    });
    this.ws.on('close', () => {
      this.eventEmitter.emit('close');
    });
    this.ws.on('message', (data: any) => {
      const message = JSON.parse(data);
      if (message && message.type && message.type !== 'connection' && message.type !== 'close') {
        this.eventEmitter.emit(message.type, message.data);
      }
    });
  }

  private initializeServer() {
    this.ws.on('connection', (client) => {
      this.eventEmitter.emit('connection', client);
    });
  }

}

export default WebSocket;

