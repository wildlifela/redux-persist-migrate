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

  return (next) => (reducer, initialState, enhancer) => {
    return next(createMigrationReducer(reducer), initialState, enhancer)
  }

  function createMigrationReducer (reducer) {
    return (state, action) => {
      if (action.type !== REHYDRATE) return reducer(state, action)
      else {
        let incomingState = action.payload
        let incomingVersion = versionSelector(incomingState)
        if (incomingVersion === currentVersion) return reducer(state, action)

        let migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
        return reducer(migratedState, action)
      }
    }
  }

  function migrate (state, version) {
    versionKeys
      .filter((v) => !version || v > version)
      .forEach((v) => { state = manifest[v](state) })
    state = versionSetter(state, currentVersion)
    return state
  }
}
