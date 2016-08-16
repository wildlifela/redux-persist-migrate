## Redux Persist Migrate

Migrate redux state between versions with redux-persist.

#### Usage
```js
import { persistStore, autoRehydrate } from 'redux-persist'
import createMigration from 'redux-persist-migrate'

const manifest = {
 0.1: (state) => ({...state, staleReducer: undefined})
 0.2: (state) => ({...state, app: {...state.app, staleKey: undefined}})
}

// reducerKey is the key of the reducer you want to store the state version in
// in this example after migrations run `state.app.version` will equal `0.2`
let reducerKey = 'app'
const migration = createMigration(manifest, reducerKey)

const store = createStore(reducer, null, migration(autoRehydrate()))
persistStore(store)
```

In the above example `migration = createMigration(manfiest, 'app')` is equivalent to the more generalized syntax:
```js
// alternatively with version selector & setter
const migration = createMigration(
  manifest,
  (state) => state.app.version,
  (state, version) => state.app.version = version
)
```
