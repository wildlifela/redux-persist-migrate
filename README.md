## Redux Persist Migrate

Migrate redux state between versions with redux-persist.

#### Usage
```js
import { compose, createStore } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import createMigration from 'redux-persist-migrate'

const manifest = {
 1: (state) => ({...state, staleReducer: undefined})
 2: (state) => ({...state, app: {...state.app, staleKey: undefined}})
}

// reducerKey is the key of the reducer you want to store the state version in
// in this example after migrations run `state.app.version` will equal `2`
let reducerKey = 'app'
const migration = createMigration(manifest, {selector: reducerKey})
const enhancer =  compose(migration, autoRehydrate())

const store = createStore(reducer, null, enhancer)
persistStore(store)
```

In the above example `migration = createMigration(manifest, {selector: 'app'})` is equivalent to the more generalized syntax:
```js
// alternatively with version selector & setter
const migration = createMigration(manifest, {
  selector: (state) => state.app.version,
  setter: (state, version) => state.app.version = version
})
```

You can also use semver to declare your migrations:
```js

const manifest = {
 '0.0.1': (state) => ({...state, staleReducer: undefined})
 '0.0.3-rc.1': (state) => ({...state, app: {...state.app, staleKey: undefined}})
}

const migration = createMigration(manifest, {
  selector: 'app',
  semver: true
})
```
