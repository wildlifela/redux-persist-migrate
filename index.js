var reduxPersist = require('redux-persist')
var createTransform = reduxPersist.createTransform

var versionKey = 'reduxPersistMigration:_stateVersion'

function createMigration(manifest) {

  var stateVersion = null
  var storage = null
  var versionKeys = Object.keys(manifest).sort()
  var preloaded = false
  var processedKeys = []
  var savedLatestVersion = false

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
    if (!savedLatestVersion && versionKeys.length > 0) saveLatestVersion(versionKeys)
    return state
  }

  function saveLatestVersion (versionKeys) {
    savedLatestVersion = true
    storage.setItem(versionKey, versionKeys[versionKeys.length - 1], function (err) {
      if (err && process.env.NODE_ENV !== 'production') console.error(err)
    })
  }

  var transform = createTransform(noop, migrate)
  var preloader = function (config) {
    return new Promise(function (resolve, reject) {
      storage = config.storage
      storage.getItem(versionKey, function (err, version) {
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
