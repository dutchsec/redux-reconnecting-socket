import { AnyAction } from 'redux';
import { SOCKET_CLOSED, SOCKET_OPENED } from './constants';

export interface ReduxReconnectingSocketState {
	connected: boolean;
}

export const defaulReduxReconnectingSocketState: ReduxReconnectingSocketState = {
	connected: false
};

export function reduxReconnectingSocketReducer(
	state: ReduxReconnectingSocketState = defaulReduxReconnectingSocketState,
	action: AnyAction
): ReduxReconnectingSocketState {
	switch (action.type) {
		case SOCKET_OPENED: {
			return {
				...state,
				connected: true
			};
		}

		case SOCKET_CLOSED: {
			return {
				...state,
				connected: false
			};
		}

		default: {
			return state;
		}
	}
}