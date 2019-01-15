import { Middleware } from 'redux';

const yolo: string = 'wat';

console.log(yolo);

export function derp() {
	return 'derp';
}

export const middleware: Middleware = ({ dispatch }) => {
	console.log('start');

	return next => action => {


		return next(action);
	};
};