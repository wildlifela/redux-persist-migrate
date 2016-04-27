var reduxPersist = require('redux-persist')
var createTransform = reduxPersist.createTransform

var versionKey = 'reduxPersist:_stateVersion'

function createMigration(manifest) {

  var stateVersion = null
  var versionKeys = Object.keys(manifest).sort()
  var preloaded = false
  var processedKeys = []

  function noop (state) {
    return state
  }

  function migrate (state, key) {
    if (!preloaded) throw new Error('redux-persist-migration: migrate not preloaded. check readme.')
    if (processedKeys.indexOf(key) !== -1) return false

    versionKeys.forEach(function (v) {
      if (manifest[v][key]) state = manifest[v][key](state)
    })

    processedKeys.push(key)
    return state
  }

  var transform = createTransform(noop, migrate)
  var preloader = function (config) {
    return new Promise(function (resolve, reject) {
      config.storage.getItem(versionKey, function (err, version) {
        preloaded = true
        versionKeys = _.filter(versionKeys, function (v) { return v > version })
        stateVersion = version
        resolve()
      })
    })
  }

  return {
    transform,
    preloader,
  }
}

module.exports = createMigration
