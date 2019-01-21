import { Middleware, AnyAction } from 'redux';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { SOCKET_CLOSE, SOCKET_CONNECT } from './constants';
import {
	socketClosed,
	socketError,
	socketOpened
} from './actions';

interface UnfinishedRequests {
	[requestId: string]: {
		resolve: (value?: any) => void;
		reject: (reason?: any) => void;
	};
}

export interface SocketConfig {
	errorType: string;
}

const defaultConfig: SocketConfig = {
	errorType: 'ERROR'
};

export function reduxReconnectingSocket(config: SocketConfig = defaultConfig): Middleware {
	config = {
		...defaultConfig,
		...config
	};

	return ({ dispatch }) => {
		let socket: SocketAbstraction;
		const unfinishedRequests: UnfinishedRequests = {};
		let requestId: number = 0;

		function onOpen() {
			dispatch(socketOpened());
		}

		function onMessage(action: any) {
			const data = JSON.parse(action.data);

			if (data.requestId) {
				const request = unfinishedRequests[data.requestId];

				if (request) {
					if (data.type === config.errorType) {
						request.reject(data);
					} else {
						request.resolve(data);
					}
				}
			}

			dispatch(data);
		}

		function onError(code: number, message: string) {
			dispatch(socketError(code, message));
		}

		function onClose() {
			dispatch(socketClosed());
		}

		return next => action => {
			if (action.sendToServer) {
				if (!socket) {
					throw new Error('Tried to send a message before connecting.');
				}

				action = { ...action };

				if (typeof action.requestId === 'undefined') {
					action.requestId = requestId;
					requestId ++;
				}

				let promise;

				if (action.promise) {
					promise = new Promise((resolve, reject) =>
						unfinishedRequests[action.requestId] = {
							resolve,
							reject
						}
					);
				}

				delete action.sendToServer;
				delete action.promise;

				console.log('Send', action);
				socket.send(JSON.stringify(action));

				if (promise) {
					return promise;
				}
			}

			switch (action.type) {
				case SOCKET_CONNECT: {
					socket = new SocketAbstraction(
						onOpen,
						onMessage,
						onError,
						onClose,
						action.payload.uri
					);

					break;
				}

				case SOCKET_CLOSE: {
					if (!socket) {
						throw new Error('Tried to close before connecting.');
					}

					socket.close();
					break;
				}
			}

			return next(action);
		};
	};
}

class SocketAbstraction {
	private socket: Promise<ReconnectingWebSocket>;

	constructor(
		private onOpen: () => void,
		private onMessage: (action: any) => void,
		private onError: (code: number, message: string) => void,
		private onClose: () => void,
		uri: string
	) {
		this.socket = new Promise(resolve => {
			console.log('Trying to connect to ' + uri);

			const socket = new ReconnectingWebSocket(uri, [], {
				connectionTimeout: 5000,
				debug: false
			});

			socket.addEventListener('message', this.onMessage);
			socket.addEventListener('error', this.onErrorWrapper.bind(this));
			socket.addEventListener('close', this.onConnectionLost.bind(this));
			socket.addEventListener('open', () => {
				console.log('Successfully connected to ' + uri);
				resolve(socket);
				this.onOpen();
			});
		});
	}

	send(action: any) {
		this.socket.then(socket =>
			socket.send(action)
		);
	}

	close() {
		this.socket.then(socket =>
			socket.close()
		);
	}

	onErrorWrapper(closeEvent: any) {
		this.onError(closeEvent.code, getCloseMessage(closeEvent.code));
	}

	onConnectionLost(event: any) {
		this.onClose();

		if (!event.wasClean) {
			setTimeout(() => {
				this.socket.then(socket =>
					socket.reconnect(event.code, event.reason)
				)
			}, 1000);
		}
	}
}


function getCloseMessage(code: number): string {
	switch (code) {
		case 1000:
			return 'Normal closure, meaning that the purpose for which the connection was established has been fulfilled.';
		case 1001:
			return 'An endpoint is \'going away\', such as a server going down or a browser having navigated away from a page.';
		case 1002:
			return 'An endpoint is terminating the connection due to a protocol error';
		case 1003:
			return 'An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).';
		case 1004:
			return 'Reserved. The specific meaning might be defined in the future.';
		case 1005:
			return 'No status code was actually present.';
		case 1006:
			return 'The connection was closed abnormally, e.g., without sending or receiving a Close control frame';
		case 1007:
			return 'An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).';
		case 1008:
			return 'An endpoint is terminating the connection because it has received a message that \'violates its policy\'. This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
		case 1009:
			return 'An endpoint is terminating the connection because it has received a message that is too big for it to process.';
		case 1010: // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead:
			return 'An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn\'t return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: ';
		case 1011:
			return 'A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.';
		case 1015:
			return 'The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can\'t be verified).';
		default:
			return 'Unknown reason';
	}
}