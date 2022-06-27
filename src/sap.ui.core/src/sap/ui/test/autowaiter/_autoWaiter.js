/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Object",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/ui/test/autowaiter/_navigationContainerWaiter",
	"sap/ui/test/autowaiter/_cssTransitionWaiter",
	"sap/ui/test/autowaiter/_cssAnimationWaiter",
	"sap/ui/test/autowaiter/_jsAnimationWaiter",
	"sap/ui/test/autowaiter/_UIUpdatesWaiter",
	"sap/ui/test/autowaiter/_moduleWaiter",
	"sap/ui/test/autowaiter/_resourceWaiter"
], function(
	jQueryDOM,
	UI5Object,
	_OpaLogger,
	_XHRWaiter,
	_timeoutWaiter,
	_promiseWaiter,
	_navigationContainerWaiter,
	_cssTransitionWaiter,
	_cssAnimationWaiter,
	_jsAnimationWaiter,
	_UIUpdatesWaiter,
	_moduleWaiter,
	_resourceWaiter
) {
	"use strict";

	var aWaiters = [];
	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._autoWaiter");
	var AutoWaiter = UI5Object.extend("sap.ui.test.autowaiter._autoWaiter", {
		registerWaiter: function (sName, vWaiter) {
			return new Promise(function (fnResolve, fnReject) {
				if (typeof vWaiter === "string") {
					sap.ui.require([vWaiter], this._addWaiter(sName, fnResolve, fnReject), function (error) {
						fnReject("Failed to load waiter " + sName + ": " + error);
					});
				} else if (typeof vWaiter === "object") {
					this._addWaiter(sName, fnResolve, fnReject)(vWaiter);
				}
			}.bind(this));
		},
		hasToWait: function () {
			var result = false;
			// execute wait helpers in sequence and stop on the first that returns true
			// eg: there's no use to call _timeoutWaiter if _UIUpdatesWaiter is true
			aWaiters.forEach(function (mWaiter) {
				if (!result && mWaiter.waiter.isEnabled() && mWaiter.waiter.hasPending()) {
					result = true;
				}
			});
			if (!result) {
				oLogger.timestamp("opa.autoWaiter.syncPoint");
				oLogger.debug("AutoWaiter syncpoint");
			}
			return result;
		},
		extendConfig: function (oConfig) {
			if (!jQueryDOM.isEmptyObject(oConfig)) {
				aWaiters.forEach(function (mWaiter) {
					if (mWaiter.waiter.extendConfig) {
						mWaiter.waiter.extendConfig(oConfig[mWaiter.name]);
					}
				});
			}
		},
		getWaiters: function () {
			return aWaiters.slice();
		},
		_addWaiter: function (sName, fnSuccess, fnError) {
			fnSuccess = fnSuccess || function () {};
			fnError = fnError || function () {};
			return function (oWaiter) {
				if (typeof oWaiter.hasPending !== "function") {
					fnError("Waiter " + sName + " should have a hasPending method");
				} else if (typeof oWaiter.isEnabled !== "function") {
					fnError("Waiter " + sName + " should have an isEnabled method");
				} else {
					var bExists;
					aWaiters.forEach(function (mWaiter) {
						if (mWaiter.name === sName) {
							oLogger.debug("Waiter with name " + sName + " will be overridden!");
							bExists = true;
							mWaiter.waiter = oWaiter;
						}
					});
					if (!bExists) {
						aWaiters.push({
							name: sName,
							waiter: oWaiter
						});
					}
					fnSuccess(oWaiter);
				}
			};
		}
	});

	var oAutoWaiter = new AutoWaiter();
	var mDefaultWaiters = {
		xhrWaiter: _XHRWaiter,
		timeoutWaiter: _timeoutWaiter,
		promiseWaiter: _promiseWaiter,
		navigationWaiter: _navigationContainerWaiter,
		cssTransitionWaiter: _cssTransitionWaiter,
		cssAnimationWaiter: _cssAnimationWaiter,
		jsAnimationWaiter: _jsAnimationWaiter,
		uiUpdatesWaiter: _UIUpdatesWaiter,
		moduleWaiter: _moduleWaiter,
		resourceWaiter: _resourceWaiter
	};

	Object.keys(mDefaultWaiters).forEach(function (sWaiter) {
		return oAutoWaiter._addWaiter(sWaiter)(mDefaultWaiters[sWaiter]);
	});

	return oAutoWaiter;

}, true);
