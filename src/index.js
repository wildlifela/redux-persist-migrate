import { REHYDRATE } from 'redux-persist/constants'
import Immutable from 'immutable'

const processKey = (key) => {
  const int = parseInt(key)
  if (isNaN(int)) throw new Error('redux-persist-migrate: migrations must be keyed with integer values')
  return int
}

const isKeyValid = (key) => {
  if (['undefined', 'object'].indexOf(typeof key) === -1) {
    console.error('redux-persist-migrate: state for versionSetter key must be an object or undefined')
    return false
  }
  return true
}

const getVersionSelector = (reducerKey) => {
  return (state) => {
    if (Immutable.Map.isMap(state)) {
      return state.getIn([reducerKey, 'version'], null)
    }
    if (reducerKey in state && 'version' in state[reducerKey]) {
      return state[reducerKey].version
    }
    return null
  }
}

const getVersionSetter = (reducerKey) => {
  return (state, version) => {
    if (Immutable.Map.isMap(state)) {
      const reduced = state.get(reducerKey)
      if (!isKeyValid(reduced)) {
        return state
      }
      if (!state.has(reducerKey)) {
        state.set(reducerKey, Immutable.Map())
      }
      return state.setIn([reducerKey, 'version'], version)
    }
    if (!isKeyValid(state[reducerKey])) {
      return state
    }
    return {
      ...state,
      [reducerKey]: {
        ...state[reducerKey],
        version: version
      }
    }
  }
}

export default function createMigration (manifest, versionSelector, versionSetter) {
  if (typeof versionSelector === 'string') {
    const reducerKey = versionSelector
    versionSelector = getVersionSelector(reducerKey)
    versionSetter = getVersionSetter(reducerKey)
  }

  const versionKeys = Object.keys(manifest).map(processKey).sort((a, b) => a - b)
  let currentVersion = versionKeys[versionKeys.length - 1]
  if (!currentVersion) currentVersion = -1

  const migrationDispatch = (next) => (action) => {
    if (action.type === REHYDRATE) {
      const incomingState = action.payload
      let incomingVersion = parseInt(versionSelector(incomingState))
      if (isNaN(incomingVersion)) incomingVersion = null

      if (incomingVersion !== currentVersion) {
        const migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
      }
    }
    return next(action)
  }

  const migrate = (state, version) => {
    if (version != null) {
      versionKeys
        .filter((v) => v > version)
        .forEach((v) => {
          state = manifest[v](state)
        })
    }
    state = versionSetter(state, currentVersion)
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
