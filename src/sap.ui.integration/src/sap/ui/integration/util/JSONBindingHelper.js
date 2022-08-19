/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/ui/integration/util/BindingHelper"
], function (
	BindingParser,
	BindingHelper
) {
	"use strict";

	/**
	 * @const {Array} A map of chars used in binding syntax which needs to be encoded.
	 */
	var aBindingCharsMap = [
		// code, regex, char
		["ESCAPED_BINDING_START", /\\{/g, "\\{"],
		["ESCAPED_BINDING_END", /\\}/g, "\\}"],
		["BINDING_START", /{/g, "{"],
		["BINDING_END", /}/g, "}"]
	];

	/**
	 * Helper class for working with bindings for json objects.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @alias sap.ui.integration.util.JSONBindingHelper
	 */
	var JSONBindingHelper = {};

	/**
	 * Creates a json with binding infos from the given object.
	 * Can be used to resolve in depth data binding for objects with unknown structure.
	 *
	 * @param {object} oValue The object for which we want to create binding infos.
	 * @param {object} mLocalBindingNamespaces Local binding functions
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @return {string|sap.ui.base.ManagedObject.PropertyBindingInfo} The json stringified object if there are no binding infos, or a binding info.
	 */
	JSONBindingHelper.createJsonWithBindingInfos = function (oValue, mLocalBindingNamespaces) {
		if (!oValue) {
			return oValue;
		}

		var sJson = this._createBindableJson(oValue),
			vBindingInfos = BindingHelper.createBindingInfos(sJson, mLocalBindingNamespaces);

		// if there is no binding, the result is string, but the json is not escaped anymore.
		if (typeof vBindingInfos === "string") {
			vBindingInfos = this._escape(vBindingInfos);
		}

		return vBindingInfos;
	};

	JSONBindingHelper._createBindableJson = function (oValue) {
		var sResult;

		sResult = JSON.stringify(oValue, function (sKey, vValue) {
			if (typeof vValue === "string") {
				return this._encodeBindingString(vValue);
			}

			return vValue;
		}.bind(this));

		sResult = this._escape(sResult);

		sResult = this._decodeBindingString(sResult);

		return sResult;
	};

	JSONBindingHelper._escape = function (sValue) {
		return BindingParser.complexParser.escape(sValue);
	};

	JSONBindingHelper._encodeBindingString = function (sValue) {
		aBindingCharsMap.forEach(function (aCharMap) {
			var sCode = aCharMap[0],
				rRegex = aCharMap[1];

			sValue = sValue.replace(rRegex, sCode);
		});

		return sValue;
	};

	JSONBindingHelper._decodeBindingString = function (sValue) {
		aBindingCharsMap.forEach(function (aCharMap) {
			var sCode = aCharMap[0],
				sChar = aCharMap[2];

			sValue = sValue.replace(new RegExp(sCode, "g"), sChar);
		});

		return sValue;
	};

	return JSONBindingHelper;
});

