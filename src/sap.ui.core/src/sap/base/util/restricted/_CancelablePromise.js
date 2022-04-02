// ##### BEGIN: MODIFIED BY SAP
/*!
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 * Version 2.0.0, see https://github.com/sindresorhus/p-cancelable/tree/v2.0.0
 */

/* global Symbol,Reflect,Proxy,Map */
/* eslint-disable */

/**
 * Cancelable promise.
 *
 * This file contains an integration of p-cancelable library.
 * For usage examples please @see https://github.com/sindresorhus/p-cancelable/tree/v2.0.0#readme
 *
 * How to update:
 * 1. Take resources of p-cancelable package from npm. E.g. using unpkg: https://unpkg.com/browse/p-cancelable@2.0.0/index.js (normally it's just a single file — `index.js`);
 * 2. Transpile the file to make it compatible with IE11. To do so, Babel.js REPL can be used:
 * 2.1. Open https://babeljs.io/repl/#?browsers=ie%2011
 * 2.2. Unselect all presets except ENV preset.
 * 2.3. Set browser to "ie 11" if it's not set
 * 2.4. Paste index.js from the package to get a transpiled version.
 * 3. Update this file. Please pay attention to the modified parts by SAP.
 *
 * @constructor
 * @alias module:sap/base/util/restricted/_CancelablePromise
 * @author SAP SE
 * @since 1.79
 * @version ${version}
 * @private
 * @ui5-restricted
*/
// ---------------
sap.ui.define(function() {
// ##### END: MODIFIED BY SAP

'use strict';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var CancelError = /*#__PURE__*/function (_Error) {
  _inherits(CancelError, _Error);

  var _super = _createSuper(CancelError);

  function CancelError(reason) {
    var _this;

    _classCallCheck(this, CancelError);

    _this = _super.call(this, reason || 'Promise was canceled');
    _this.name = 'CancelError';
    return _this;
  }

  _createClass(CancelError, [{
    key: "isCanceled",
    get: function get() {
      return true;
    }
  }]);

  return CancelError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var PCancelable = /*#__PURE__*/function () {
  _createClass(PCancelable, null, [{
    key: "fn",
    value: function fn(userFn) {
      return function () {
        for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
          arguments_[_key] = arguments[_key];
        }

        return new PCancelable(function (resolve, reject, onCancel) {
          arguments_.push(onCancel); // eslint-disable-next-line promise/prefer-await-to-then

          userFn.apply(void 0, arguments_).then(resolve, reject);
        });
      };
    }
  }]);

  function PCancelable(executor) {
    var _this2 = this;

    _classCallCheck(this, PCancelable);

    this._cancelHandlers = [];
    this._isPending = true;
    this._isCanceled = false;
    this._rejectOnCancel = true;
    this._promise = new Promise(function (resolve, reject) {
      _this2._reject = reject;

      var onResolve = function onResolve(value) {
        _this2._isPending = false;
        resolve(value);
      };

      var onReject = function onReject(error) {
        _this2._isPending = false;
        reject(error);
      };

      var onCancel = function onCancel(handler) {
        if (!_this2._isPending) {
          throw new Error('The `onCancel` handler was attached after the promise settled.');
        }

        _this2._cancelHandlers.push(handler);
      };

      Object.defineProperties(onCancel, {
        shouldReject: {
          get: function get() {
            return _this2._rejectOnCancel;
          },
          set: function set(boolean) {
            _this2._rejectOnCancel = boolean;
          }
        }
      });
      return executor(onResolve, onReject, onCancel);
    });
  }

  _createClass(PCancelable, [{
    key: "then",
    value: function then(onFulfilled, onRejected) {
      // eslint-disable-next-line promise/prefer-await-to-then
      return this._promise.then(onFulfilled, onRejected);
    }
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      return this._promise.catch(onRejected);
    }
  }, {
    key: "finally",
    value: function _finally(onFinally) {
      return this._promise.finally(onFinally);
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      if (!this._isPending || this._isCanceled) {
        return;
      }

      if (this._cancelHandlers.length > 0) {
        try {
          var _iterator = _createForOfIteratorHelper(this._cancelHandlers),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var handler = _step.value;
              handler();
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        } catch (error) {
          this._reject(error);
        }
      }

      this._isCanceled = true;

      if (this._rejectOnCancel) {
        this._reject(new CancelError(reason));
      }
    }
  }, {
    key: "isCanceled",
    get: function get() {
      return this._isCanceled;
    }
  }]);

  return PCancelable;
}();

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

// ##### BEGIN: MODIFIED BY SAP
// module.exports = PCancelable;
// module.exports.CancelError = CancelError;
	PCancelable.CancelError = CancelError;

	return PCancelable;
});
/* eslint-enable */
// ##### END: MODIFIED BY SAP