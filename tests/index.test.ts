import { reduxReconnectingSocket } from '../lib/middleware';
import { AnyAction } from 'redux';
import { SOCKET_CONNECT, SOCKET_SEND } from '../lib/constants';

const create = () => {
	const store = {
		getState: jest.fn(() => ({})),
		dispatch: jest.fn()
	};

	const next = jest.fn();
	const invoke = (action: AnyAction) => reduxReconnectingSocket(store)(next)(action);

	return { store, next, invoke };
};

it('should call next function', () => {
	const { store, invoke, next } = create();

	const action = {
		type: 'TEST_ACTION'
	};

	invoke(action);

	expect(next).toHaveBeenCalledWith(action);
});

it('should throw error when sending before connecting', () => {
	const { invoke } = create();

	const action = {
		type: SOCKET_SEND,
		payload: {
			type: 'SOME_SERVER_ACTION'
		}
	};

	expect(() => {
		invoke(action);
	}).toThrowError();
});