import { REHYDRATE } from 'redux-persist/constants'

export default function createMigration (versionSelector, versionSetter, manifest) {

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
        let migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
        return reducer(migratedState, action)
      }
    }
  }

  function migrate (state, version) {
    if (version === currentVersion) return state
    versionKeys
      .filter((v) => !currentVersion || v > currentVersion)
      .forEach((v) => state = manifest[v](state))
    state = versionSetter(state)
    return state
  }
}
