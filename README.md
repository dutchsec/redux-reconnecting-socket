# Redux reconnecting socket

Redux middleware and reducer for creating a websocket connection.

Features
* Send messages to the server simply by adding `sendToServer: true` to
your actions.
* Messages received from the server are automatically dispatched as
actions.
* Automatically tries to reconnect when the connection drops.
* The `state.connection.connected` boolean is available in your store.
* **Optional:** Use promises if you are expecting a response from the
server after a certain message.

## Installation

```
npm install --save redux-reconnecting-socket
```

## Usage

### 1. Configure it in your middleware
```js
import { applyMiddleware, createStore } from 'redux';
import { reduxReconnectingSocket } from 'redux-reconnecting-socket';

const store = createStore(
	rootReducer,
	applyMiddleware(
	    // ... other middleware
		reduxReconnectingSocket()
	)
);
```

### 2. Configure it in your root reducer (optional)
Only needed if you want to use the `state.connection.connected` boolean.

```js
import { combineReducers } from 'redux';
import {
    reduxReconnectingSocketReducer,
    defaulReduxReconnectingSocketState
} from 'redux-reconnecting-socket';

export const rootReducer =  (history) => combineReducers({
    // ... other reducers
    connection: reduxReconnectingSocketReducer,
});

export const defaultAppState = {
    // ... other reducers
    connection: defaulReduxReconnectingSocketState,
};
```

### 3. Dispatch a `socketConnect` action in your app component
```js
import { socketConnect } from 'redux-reconnecting-socket';

class App extends React.Component {
    componentDidMount() {
        const { dispatch  } = this.props;

        dispatch(socketConnect('ws://localhost:4000/ws'));
    }
    ...
```

### 4. Send messages to the server by adding `sendToServer: true` to your action types
```js
dispatch({
    sendToServer: true,
    type: 'MY_ACTION',
    payload: {
        message: 'Hello server!'
    }
});
```

### 5. Listen to server messages in your own middlewares and reducers
Whenever the server sends a message over the web socket, the message is
automatically dispatched as an action.

### 6. Emulate request/responses by adding `promise: true` to your action types
```js
const request = dispatch({
    sendToServer: true,
    promise: true,
    type: 'MY_ACTION',
    payload: {
        message: 'Hello server!'
    }
});

request.then(
    (actionFromServer) => console.log('Success, received this action from the server', actionFromServer),
    (actionFromServer) => console.log('Received a message with type: \'ERROR\' from the server:', actionFromServer)
);
```

Whether the promise will be resolved or rejected depends on the error
boolean in the message from the server:
```js
{
    type: 'MY_SERVER_RESPONSE',
    requestId: 1, // the same request id that was sent to the server
    error: true, // true would cause the promise to be rejected
}
```

A numeric `requestId` will automatically be generated and added in the message to
the server. When the server sends a message that includes the same `requestId`,
the request promise will be completed.

Additionally, you have the option to cancel requests:
```js
const request = dispatch({
    sendToServer: true,
    promise: true,
    type: 'MY_ACTION',
    payload: {
        message: 'Hello server!'
    }
});

request.cancel();
```

Three things will happen when you `cancel` a request:
1. The message from the server with this `requestId` will be ignored. It will not be dispatched.
2. The `request` promise will be rejected.
3. A `CANCEL_REQUEST` message will be sent to the server:
```js
{
    type: 'CANCEL_REQUEST',
    requestId: 1
}
```