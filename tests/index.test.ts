import { reduxReconnectingSocket } from '../lib';
import { AnyAction } from 'redux';

const create = () => {
	const store = {
		getState: jest.fn(() => ({})),
		dispatch: jest.fn()
	};

	const next = jest.fn();
	const invoke = (action: AnyAction) => reduxReconnectingSocket()(store)(next)(action);

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