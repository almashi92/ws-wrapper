USAGE

Server:

import * as http from 'http';
import { default as WebSocket } from './components/websocketWrapper';
import { default as registerListeners } from './listeners';
const server = http.createServer();
const webSocketServer = new WebSocket({ isServer: true, config: { server } });
webSocketServer.onConnect((client) => {
    client.emitter.on('ping', () => {
      webSocketServer.emit('pong', {}, client);
    });
  });
server.listen(8080);

Client:

let counter = 0;

import { default as WebSocket } from './components/websocketWrapper';
const webSocket = new WebSocket({ url: 'ws://localhost:8080' });

webSocket.onConnect(() => {
  console.log(new Date());
  console.log('connected');
  webSocket.emit('ping', { timestamp: Date.now() });
});

webSocket.onDisconnect(() => {
  console.log('disconnected');
  console.log(new Date());
  console.log(counter);
});

webSocket.on('pong', (data: any) => {
  counter += 1;
  webSocket.emit('ping', { timestamp: Date.now() });
});

