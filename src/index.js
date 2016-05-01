import { REHYDRATE } from 'redux-persist/constants'

export default function createMigration (manifest, versionSelector, versionSetter) {
  if (typeof versionSelector === 'string') {
    let versionString = versionSelector
    versionSelector = (state) => state[versionString].version
    versionSetter = (state, version) => {
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
        let incomingVersion = versionSelector(incomingState)
        if (incomingVersion === currentVersion) return reducer(state, action)

        let incomingState = action.payload
        let migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
        return reducer(migratedState, action)
      }
    }
  }

  function migrate (state, version) {
    versionKeys
      .filter((v) => !currentVersion || v > currentVersion)
      .forEach((v) => { state = manifest[v](state) })
    state = versionSetter(state, currentVersion)
    return state
  }
}
