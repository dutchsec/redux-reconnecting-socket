import { Middleware, AnyAction } from 'redux';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { SOCKET_CONNECT, SOCKET_SEND } from './constants';
import { socketReceive } from './actions';

export function tsReduxSocket(uri: string): Middleware {
	return ({ dispatch }) => {
		let socket: SocketAbstraction;

		function onOpen() {
			console.log('opened');
		}

		function onMessage(action: any) {
			dispatch(socketReceive(action));
		}

		function onError() {

		}

		return next => action => {
			switch (action.type) {
				case SOCKET_CONNECT: {
					socket = new SocketAbstraction(onOpen, onMessage, onError, uri);
					break;
				}

				case SOCKET_SEND: {
					if (!socket) {
						throw new Error('Tried to send a socket message before connecting.');
					}

					socket.send(action.payload);
					break;
				}
			}

			return next(action);
		};
	}
}

class SocketAbstraction {
	private socket: Promise<ReconnectingWebSocket>;

	constructor(
		private onOpen: () => void,
		private onMessage: (action: any) => void,
		private onError: () => void,
		uri: string
	) {
		this.socket = new Promise(resolve => {
			const socket = new ReconnectingWebSocket(uri, [], {
				connectionTimeout: 5000,
				debug: false
			});

			resolve(socket);

			socket.addEventListener('message', this.onMessage);
		});
	}

	send(action: any) {
		this.socket.then(socket => {
			socket.send(action);
		});
	}
}
