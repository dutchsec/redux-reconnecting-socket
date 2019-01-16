import { AnyAction } from 'redux';
import {
	SERVER_ERROR,
	SOCKET_CLOSE, SOCKET_CLOSED,
	SOCKET_CONNECT, SOCKET_ERROR, SOCKET_OPENED,
} from './constants';

export function socketConnect(uri: string): AnyAction {
	return {
		type: SOCKET_CONNECT,
		payload: {
			uri
		}
	};
}

export function socketError(code: number, message: string): AnyAction {
	return {
		type: SOCKET_ERROR,
		payload: {
			code,
			message
		}
	}
}

export function serverError(payload: any) {
	return {
		type: SERVER_ERROR,
		payload
	};
}

export function socketClose(): AnyAction {
	return {
		type: SOCKET_CLOSE,
	}
}

export function socketOpened(): AnyAction {
	return {
		type: SOCKET_OPENED
	};
}

export function socketClosed(): AnyAction {
	return {
		type: SOCKET_CLOSED
	};
}