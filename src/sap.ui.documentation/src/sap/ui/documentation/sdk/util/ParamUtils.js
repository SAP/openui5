/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 */
sap.ui.define(["sap/base/util/UriParameters"], function (UriParameters) {
	"use strict";

	/**
	 * @namespace
	 * @since 1.104
	 * @private
	 * @ui5-restricted sap.ui.documentation
	 */
	var ParamUtils = {
		/**
		* Verifies the presence of a given query parameter key.
		* @param {string} sKey The parameter key
		* @returns {boolean} Whether the parameter key is in the current URL
		* @private
		*/
		containsKey: function (sKey) {
			// directly access mParams to obtain object keys
			// in order to detect key-only query parameters
			var oUriParams = UriParameters.fromQuery(window.location.search).mParams;
			var aUriKeys = Object.keys(oUriParams);
			var fnIncludesKey = function (sParam) {
				return sParam.includes(sKey);
			};

			return aUriKeys.some(fnIncludesKey);
		}
	};

	return ParamUtils;

});
