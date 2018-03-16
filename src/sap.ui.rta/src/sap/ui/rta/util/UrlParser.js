/*!
 * ${copyright}
 */

sap.ui.define([
],
function(jQuery) {
	"use strict";

	var module = {};

	/**
	 * Get URL Param by name
	 * @param {string} sParamName - Parameter name
	 * @return {string|undefined} - Returns value of the specified param or undefined if not found
	 */
	module.getParam = function (sParamName) {
		return module.getParams()[sParamName];
	};

	module.getParams = function () {
		return document.location.search
			.replace(/^\?/, '')
			.split('&')
			.reduce(function (mParams, sParam) {
				var aParts = sParam.split('='); //split on key/value
				var sValue = aParts[1];

				switch (sValue) {
					case 'true':
						sValue = true;
						break;
					case 'false':
						sValue = false;
						break;
				}

				mParams[aParts[0]] = sValue;
				return mParams;
			}, {});
	};

	return module;
}, true);
