/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/ui/base/Object",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_ParameterValidator"
], function (extend, isEmptyObject, UI5Object, _OpaLogger, _ParameterValidator) {
	"use strict";

	var WaiterBase = UI5Object.extend("sap.ui.test.autowaiter.WaiterBase", {
		constructor: function () {
			UI5Object.call(this);
			this._mConfig = this._getDefaultConfig();
			this._sName = this.getMetadata().getName();
			this._oLogger = _OpaLogger.getLogger(this._sName);
			this._oHasPendingLogger = _OpaLogger.getLogger(this._sName + "#hasPending");
			this._oConfigValidator = new _ParameterValidator({
				errorPrefix: this._sName + "#extendConfig"
			});
		},
		hasPending: function () {
			return false;
		},
		isEnabled: function () {
			return this._mConfig.enabled;
		},
		extendConfig: function (oConfig) {
			if (!isEmptyObject(oConfig)) {
				this._oConfigValidator.validate({
					inputToValidate: oConfig,
					validationInfo: this._getValidationInfo()
				});
				extend(this._mConfig, oConfig);
			}
		},
		_getDefaultConfig: function () {
			return {
				enabled: true
			};
		},
		_getValidationInfo: function () {
			return {
				enabled: "bool"
			};
		}
	});

	return WaiterBase;
});
