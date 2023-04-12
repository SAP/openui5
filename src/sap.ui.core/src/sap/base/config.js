/*!
* ${copyright}
*/
sap.ui.define([
	"sap/base/config/MemoryConfigurationProvider",
	"ui5loader-autoconfig"
], function(
	MemoryConfigurationProvider
	/*autoconfig*/
) {
	"use strict";

	/**
	 * The base Configuration.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias module:sap/base/config
	 * @namespace
	 */

	var _Configuration = sap.ui.require("sap/base/config/_Configuration");

	/**
	 * Returns a writable base configuration instance
	 * @returns {sap.base.config} The writable base configuration
	 */
	_Configuration.getWritableInstance = function() {
		var oProvider = new MemoryConfigurationProvider();

		return {
			set: oProvider.set.bind(oProvider),
			get: function(mOptions) {
				mOptions.provider = oProvider;
				return _Configuration.get(mOptions);
			},
			Type: _Configuration.Type
		};
	};

	return _Configuration;
});