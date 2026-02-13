import { createStore } from 'redux';
import { persistStore } from 'redux-persist';

import rootPersistedReducer from './index';

const store = createStore(rootPersistedReducer);
const persistor = persistStore(store);

export { store, persistor };
