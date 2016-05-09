import { REHYDRATE } from 'redux-persist/constants'

export default function createMigration (manifest, versionSelector, versionSetter) {
  if (typeof versionSelector === 'string') {
    let versionString = versionSelector
    versionSelector = (state) => state && state[versionString] && state[versionString].version
    versionSetter = (state, version) => {
      if (['undefined', 'object'].indexOf(typeof state[versionString]) === -1) {
        console.error('redux-persist-migrate: state for versionSetter key must be an object or undefined')
        return state
      }
      state[versionString] = state[versionString] || {}
      state[versionString].version = version
      return state
    }
  }

  const versionKeys = Object.keys(manifest).sort()
  const currentVersion = versionKeys[versionKeys.length - 1]

  const migrationDispatch = (next) => (action) => {
    if (action.type === REHYDRATE) {
      let incomingState = action.payload
      let incomingVersion = versionSelector(incomingState)
      if (incomingVersion !== currentVersion) {

        let migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
      }
    }
    return next(action)
  }

  const migrate = (state, version) => {
    versionKeys
      .filter((v) => !version || v > version)
      .forEach((v) => { state = manifest[v](state) })
    state = versionSetter(state, currentVersion)
    return state
  }

  return (createStore) => (reducer, initialState, enhancer) => {
    var store = createStore(reducer, initialState, enhancer)
    return {
      ...store,
      dispatch: migrationDispatch(store.dispatch)
    }
  }
}
