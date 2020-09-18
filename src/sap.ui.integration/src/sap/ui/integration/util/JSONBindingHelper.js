/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/util/BindingHelper",
	"sap/base/util/isPlainObject"
], function (
	BindingHelper,
	isPlainObject
) {
	"use strict";

	/**
	 * Helper class for working with bindings for json objects.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.JSONBindingHelper
	 */
	var JSONBindingHelper = {};

	/**
	 * Creates a json with binding infos from the given object.
	 * Can be used to resolve in depth data binding for objects with unknown structure.
	 *
	 * @param {Object} oValue The object for which we want to create binding infos.
	 * @return {string} The json stringified object with the binding infos.
	 */
	JSONBindingHelper.createJsonWithBindingInfos = function (oValue) {
		if (!oValue) {
			return oValue;
		}

		var sJson = this._createBindableJson(oValue),
			vBindingInfos = BindingHelper.createBindingInfos(sJson);

		// if there is no binding, the result is string, but the json is not escaped anymore.
		if (typeof vBindingInfos === "string") {
			vBindingInfos = this._escape(vBindingInfos);
		}

		return vBindingInfos;
	};

	JSONBindingHelper._createBindableJson = function (oValue) {
		var sResult;

		sResult = JSON.stringify(oValue, function (sKey, sValue) {
			if (typeof sValue === "string") {
				sValue = this._encodeBindingString(sValue);
			}
			return sValue;
		  }.bind(this));

		sResult = this._escape(sResult);

		sResult = this._decodeBindingString(sResult);

		return sResult;
	};

	JSONBindingHelper._escape = function (sValue) {
		return sValue.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
	};

	JSONBindingHelper._encodeBindingString = function (sValue) {
		return sValue.replace(/\{/g, "BINDING_START").replace(/\}/g, "BINDING_END");
	};

	JSONBindingHelper._decodeBindingString = function (sValue) {
		return sValue.replace(/BINDING_START/g, "{").replace(/BINDING_END/g, "}");
	};

	return JSONBindingHelper;
});

