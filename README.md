## Redux Persist Migrate

Migrate redux state between versions with redux-persist.

#### Usage
```js
import createMigration from 'redux-persist-migrate'

const migrate = {
 0.1: (state) => {...state, staleReducer: undefined}
 0.2: (state) => {...state, app: {...state.app, staleKey: undefined}}
}

const migration = createMigration(manifest, 'app')

// alternatively with version selector & setter
const migration = createMigration(
  manifest,
  (state) => state.app.version,
  (state, version) => state.app.version = version
)

const store = createStore(reducer, null, migration(autoRehydrate()))
persistStore(store)
```
