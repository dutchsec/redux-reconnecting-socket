import { AnyAction } from 'redux';
import {
	CANCEL_REQUEST,
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

export function cancelRequest(requestId: number): AnyAction {
	return {
		type: CANCEL_REQUEST,
		requestId
	};
}