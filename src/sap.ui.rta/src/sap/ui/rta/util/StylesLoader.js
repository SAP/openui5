/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery", "sap/ui/core/Configuration"
], function(jQuery, Configuration) {
	"use strict";

	var module = {};

	/**
	 * Loads styles from the specified file
	 * @param {string} sFileName - Name of the file
	 * @return {jqXHR} - returns jqXHR object which can be thenable
	 */
	module.loadStyles = function (sFileName) {
		return jQuery.get(sap.ui.require.toUrl(('sap.ui.rta.assets.' + sFileName).replace(/\./g, "/")) + '.css')
				.then(function (sData) {
					// TODO: check if it's possible to use UI5 standard mechanism for styles adjustments
					if (Configuration.getRTL()) {
						return sData.replace(/right/g, 'left');
					}
					return sData;
				});
	};

	return module;
}, true);