## Redux Persist Migrate

Migrate redux state between versions with redux-persist.

#### Usage
```js
import { compose, createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import createMigration from 'redux-persist-migrate'

// VERSION_REDUCER_KEY is the key of the reducer you want to store the state version in.
// You _must_ create this reducer, redux-persist-migrate will not create it for you.
// In this example after migrations run, `state.app.version` will equal `2`
const VERSION_REDUCER_KEY = 'app'

// This is a list of changes to make to the state being rehydrated.
// The keys must be integers, and migrations will be performed in ascending key order.
// Note: blacklisted reducers will not be present in this state.
const manifest = {
  1: (state) => ({...state, staleReducer: undefined})
  2: (state) => ({...state, app: {...state.app, staleKey: undefined}})
}

const migration = createMigration(manifest, VERSION_REDUCER_KEY)
const enhancer =  compose(migration, autoRehydrate())

const reducer = combineReducers({
    [VERSION_REDUCER_KEY]: (state = {}) => state, // This reducer will be used to store the version
    otherReducer1,
    otherReducer2,
    // ...
})

const store = createStore(reducer, null, enhancer)
persistStore(store)
```

In the above example `migration = createMigration(manifest, VERSION_REDUCER_KEY)` is equivalent to the more generalized syntax:
```js
// alternatively with version selector & setter
const migration = createMigration(
  manifest,
  (state) => state.app.version,
  (state, version) => {
    return { ...state, app: { ...state.app, version: version } }
  }
)
```
