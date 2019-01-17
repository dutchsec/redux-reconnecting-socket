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
                thunkMiddleware,
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
    authentication: authenticationReducer,
    connection: reduxReconnectingSocketReducer,
    router: connectRouter(history),
});

export const defaultAppState = {
    authentication: defaultAuthenticationState,
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
    () => console.log('Success'),
    () => console.log('Received a message with type: \'ERROR\' from the server')
);
```

A numeric `requestId` will automatically be generated and added in the message to
the server. When the server sends a message that includes the same `requestId`,
the request promise will be completed.

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
                thunkMiddleware,
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

When the server sends a message with this `type`, the middleware will
dispatch an action with the type `SERVER_ERROR`.

Additionally, this setting is used for rejecting promises when you're using the
`promise: true` setting when sending messages to the server.