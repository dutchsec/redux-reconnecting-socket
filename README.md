# Redux reconnecting socket

Redux middleware and reducer for creating a websocket connection. When the
connection drops it will automatically reconnect.

## Usage

### 1. Configure it in your middleware
```
import { reduxReconnectingSocket } from '../../redux-reconnecting-socket/dist';

function configureStore(initialState) {
    return createStore(
        rootReducer(history),
        initialState,
        composeEnhancer(
            applyMiddleware(
                routerMiddleware(history),
                thunkMiddleware
                reduxReconnectingSocket()
            )
        )
    );
}
```

### 2. Configure it in your root reducer (optional)
Only needed if you want to use the `state.connection.connected` boolean.

```
import {
    reduxReconnectingSocketReducer,
    ReduxReconnectingSocketState,
    defaulReduxReconnectingSocketState
} from '../../redux-reconnecting-socket/dist/reducer';

export const rootReducer =  (history: History) => combineReducers({
    authentication: authenticationReducer,
    connection: reduxReconnectingSocketReducer,
    router: connectRouter(history),
});

export interface AppState {
    authentication: AuthenticationState;
    connection: ReduxReconnectingSocketState;
    router: RouterState;
}

export const defaultAppState: AppState = {
    authentication: defaultAuthenticationState,
    connection: defaulReduxReconnectingSocketState,
    router: null,
};
```

### 3. Dispatch a `socketConnect` action in your app component
```
import { socketConnect } from '../../redux-reconnecting-socket/dist/actions';

class App extends React.Component<Props> {
    componentDidMount() {
        const { dispatch  } = this.props;

        dispatch(socketConnect('ws://localhost:4000/ws'));
    }
    ...
```

### 4. Send messages to the server by adding `sendToServer: true` to your action types
```
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
```
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
    () => console.log('Received an error from the server')
);
```

A numeric `requestId` will automatically be generated and added in the message to
the server. When the server sends a message that includes the same `requestId`,
the request promise will be completed.
