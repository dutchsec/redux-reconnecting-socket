# Redux reconnecting socket

Redux middleware and reducer for creating a websocket connection. When the
connection drops it will automatically reconnect.

## Installation

```
npm install --save redux-reconnecting-socket
```

## Usage

### 1. Configure it in your middleware
```js
import { reduxReconnectingSocket } from 'redux-reconnecting-socket';

function configureStore(initialState) {
    return createStore(
        rootReducer(history),
        initialState,
        composeEnhancer(
            applyMiddleware(
                routerMiddleware(history),
                reduxReconnectingSocket()
            )
        )
    );
}
```

### 2. Configure it in your root reducer (optional)
Only needed if you want to use the `state.connection.connected` boolean.

```js
import {
    reduxReconnectingSocketReducer,
    defaulReduxReconnectingSocketState
} from 'redux-reconnecting-socket';

export const rootReducer =  (history) => combineReducers({
    connection: reduxReconnectingSocketReducer,
    router: connectRouter(history),
});

export const defaultAppState = {
    connection: defaulReduxReconnectingSocketState,
    router: null,
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

## Config

You can configure the reduxReconnectingSocket middleware like this:
```js
import { reduxReconnectingSocket } from 'redux-reconnecting-socket';

function configureStore(initialState) {
    return createStore(
        rootReducer(history),
        initialState,
        composeEnhancer(
            applyMiddleware(
                routerMiddleware(history),
                reduxReconnectingSocket({
                    errorType: 'MY_ERROR_TYPE'
                })
            )
        )
    );
}
```

### Configuration options

#### `errorType`: `string`

Default: `ERROR`

Used for rejecting promises when you're using the `promise: true` setting when
sending messages to the server.

For example: if you send dispatch this action:
```js
const promise = dispatch({
    sendToServer: true,
    promise: true,
    type: 'MY_ACTION',
    payload: {
        message: 'Hello server!'
    },
    // The numeric property requestId will automatically be generated and sent to the server
})
```

And the server responds with:
```js
{
    requestId: 1, // The same request id that was sent in the request
    type: 'ERROR', // The configurable errorType
    payload: {
        message: 'Hello client! Something went wrong.'
    }
}
```

Then the promise will be rejected.
