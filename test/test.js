import { createStore } from 'redux'
import { REHYDRATE } from 'redux-persist/constants'
import assert from 'assert'
import createMigration from '../src/index'

describe('createMigration', () => {
  it('should create a proper migration with integers', () => {
    const manifest = {
      3: (state) => {
        return Object.assign(state, {test: [...state.test, 3]})
      },
      2: (state) => {
        return Object.assign(state, {test: [...state.test, 2]})
      },
      1: (state) => {
        return Object.assign(state, {test: [1]})
      }
    }

    const initialState = {}
    function test (state = initialState, action) {
      switch (action.type) {
        case REHYDRATE:
          return action.payload
      }
      return state
    }

    const migration = createMigration(manifest, 'app', undefined)
    const store = createStore(test, migration)

    store.dispatch({
      type: REHYDRATE,
      payload: {}
    })

    assert.deepEqual(store.getState(), { test: [ 1, 2, 3 ], app: { version: 3 } })
  })

  it('should create a proper migration with semver', () => {
    const manifest = {
      '0.0.3': (state) => {
        return Object.assign(state, {test: [...state.test, 3]})
      },
      '0.0.3-rc.1': (state) => {
        return Object.assign(state, {test: [...state.test, 2]})
      },
      '0.0.1': (state) => {
        return Object.assign(state, {test: [1]})
      }
    }

    const initialState = {}
    function test (state = initialState, action) {
      switch (action.type) {
        case REHYDRATE:
          return action.payload
      }
      return state
    }

    const migration = createMigration(manifest, 'app', undefined, true)
    const store = createStore(test, migration)

    store.dispatch({
      type: REHYDRATE,
      payload: {}
    })

    assert.deepEqual(store.getState(), { test: [ 1, 2, 3 ], app: { version: '0.0.3' } })
  })
})
