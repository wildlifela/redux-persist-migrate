import SemVer from 'semver'
import { REHYDRATE } from 'redux-persist/constants'

const processKey = (key) => {
  let int = parseInt(key)
  if (isNaN(int)) throw new Error('redux-persist-migrate: migrations must be keyed with integer values')
  return int
}

export default function createMigration (manifest, {selector, setter, semver = false}) {
  if (typeof selector === 'string') {
    let reducerKey = selector
    selector = (state) => state && state[reducerKey] && state[reducerKey].version
    setter = (state, version) => {
      if (['undefined', 'object'].indexOf(typeof state[reducerKey]) === -1) {
        console.error('redux-persist-migrate: state for setter key must be an object or undefined')
        return state
      }
      state[reducerKey] = state[reducerKey] || {}
      state[reducerKey].version = version
      return state
    }
  }

  const versionKeys = !semver ? Object.keys(manifest).map(processKey).sort() : SemVer.sort(Object.keys(manifest))
  const currentVersion = versionKeys[versionKeys.length - 1]

  const migrationDispatch = (next) => (action) => {
    if (action.type === REHYDRATE) {
      let incomingState = action.payload
      let incomingVersion = selector(incomingState)
      if (incomingVersion !== currentVersion) {
        let migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
      }
    }
    return next(action)
  }

  const migrate = (state, version) => {
    versionKeys
      .filter((v) => !version || (semver ? SemVer.gt(v, version) : v > version))
      .forEach((v) => { state = manifest[v](state) })
    state = setter(state, currentVersion)
    return state
  }

  return (next) => (reducer, initialState, enhancer) => {
    const store = next(reducer, initialState, enhancer)
    return {
      ...store,
      dispatch: migrationDispatch(store.dispatch)
    }
  }
}
