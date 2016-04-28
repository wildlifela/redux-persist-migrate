## Redux Persist Migrate

Migrate redux state between versions with redux-persist.

#### Usage
```js
import createMigration from 'redux-persist-migrate'

const migration = createMigration({
 0.1: {
   reducerA: (state) => {...state, foo: 'bar'}
 },
 0.2: {
   reducerA: (state) => {...state, baz: undefined}
 }
})

persistStore(store, { preloaders: [migration.preloader], transforms: [migration.transform] })
```
