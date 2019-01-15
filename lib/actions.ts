import { AnyAction } from 'redux';
import {
	SOCKET_CLOSE,
	SOCKET_CONNECT, SOCKET_ERROR,
	SOCKET_RECEIVE,
	SOCKET_SEND
} from './constants';

export function socketConnect(uri: string): AnyAction {
	return {
		type: SOCKET_CONNECT,
		payload: {
			uri
		}
	};
}

export function socketSend(action: any): AnyAction {
	return {
		type: SOCKET_SEND,
		payload: {
			action
		}
	};
}

export function socketReceive(action: any): AnyAction {
	return {
		type: SOCKET_RECEIVE,
		payload: {
			action
		}
	};
}

export function socketError(message: string): AnyAction {
	return {
		type: SOCKET_ERROR,
		payload: {
			message
		}
	}
}

export function socketClose(): AnyAction {
	return {
		type: SOCKET_CLOSE,
	}
}