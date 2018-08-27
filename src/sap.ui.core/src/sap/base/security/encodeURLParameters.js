/*!
 * ${copyright}
 */
sap.ui.define(
	["./encodeURL"],
	function(encodeURL) {
	"use strict";


	/**
	 * Encode a map of parameters into a combined URL parameter string.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/security/encodeURLParameters
	 * @param {Object} mParams The map of parameters to encode
	 * @returns {string} The URL encoded parameter string
	 * @SecValidate {0|return|XSS} validates the given string for a URL context
	 * @example
	 * sap.ui.require(["sap/base/security/encodeURLParameters"]), function(encodeURLParameters) {
	 *  encodeURLParameters({{a:true, b:"d e"}}) === "a=true&b=d%20e";
	 * });
	 * @public
	 */
	var fnEncodeURLParameters = function(mParams) {
		if (!mParams) {
			return "";
		}
		var aUrlParams = [];

		Object.keys(mParams).forEach(function(sName) {
			var oValue = mParams[sName];
			if (oValue instanceof String || typeof oValue === "string") {
				oValue = encodeURL(oValue);
			}
			aUrlParams.push(encodeURL(sName) + "=" + oValue);
		});
		return aUrlParams.join("&");
	};
	return fnEncodeURLParameters;
});