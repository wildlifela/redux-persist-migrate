'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = createMigration;

var _constants = require('redux-persist/constants');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var processKey = function processKey(key) {
  var int = parseInt(key);
  if (isNaN(int)) throw new Error('redux-persist-migrate: migrations must be keyed with integer values');
  return int;
};

var isKeyValid = function isKeyValid(key) {
  if (['undefined', 'object'].indexOf(typeof key === 'undefined' ? 'undefined' : _typeof(key)) === -1) {
    console.error('redux-persist-migrate: state for versionSetter key must be an object or undefined');
    return false;
  }
  return true;
};

var getVersionSelector = function getVersionSelector(reducerKey) {
  return function (state) {
    var reduced = null;
    if (_immutable2.default.Map.isMap(state)) {
      reduced = state.get(reducerKey, null);
    } else {
      reduced = state[reducerKey];
    }
    if (!reduced) {
      return null;
    } else if (_immutable2.default.Map.isMap(reduced)) {
      return reduced.get('version');
    }
    return reduced.version;
  };
};

var getVersionSetter = function getVersionSetter(reducerKey) {
  return function (state, version) {
    var reduced = _immutable2.default.Map.isMap(state) ? state.get(reducerKey) : state[reducerKey];
    if (!isKeyValid(reduced)) {
      return state;
    }
    if (_immutable2.default.Map.isMap(reduced)) {
      reduced = reduced.set('version', version);
    } else {
      reduced = _extends({}, reduced, { version: version });
    }
    if (_immutable2.default.Map.isMap(state)) {
      return state.set(reducerKey, reduced);
    }
    return _extends({}, state, _defineProperty({}, reducerKey, reduced));
  };
};

function createMigration(manifest, versionSelector, versionSetter) {
  if (typeof versionSelector === 'string') {
    var reducerKey = versionSelector;
    versionSelector = getVersionSelector(reducerKey);
    versionSetter = getVersionSetter(reducerKey);
  }

  var versionKeys = Object.keys(manifest).map(processKey).sort(function (a, b) {
    return a - b;
  });
  var currentVersion = versionKeys[versionKeys.length - 1];
  if (!currentVersion) currentVersion = -1;

  var migrationDispatch = function migrationDispatch(next) {
    return function (action) {
      if (action.type === _constants.REHYDRATE) {
        var incomingState = action.payload;
        var incomingVersion = parseInt(versionSelector(incomingState));
        if (isNaN(incomingVersion)) incomingVersion = null;

        if (incomingVersion !== currentVersion) {
          var migratedState = migrate(incomingState, incomingVersion);
          action.payload = migratedState;
        }
      }
      return next(action);
    };
  };

  var migrate = function migrate(state, version) {
    if (version != null) {
      versionKeys.filter(function (v) {
        return v > version;
      }).forEach(function (v) {
        state = manifest[v](state);
      });
    }
    state = versionSetter(state, currentVersion);
    return state;
  };

  return function (next) {
    return function (reducer, initialState, enhancer) {
      var store = next(reducer, initialState, enhancer);
      return _extends({}, store, {
        dispatch: migrationDispatch(store.dispatch)
      });
    };
  };
}