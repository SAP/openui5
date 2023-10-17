/*!
* ${copyright}
*/
sap.ui.define([
	"sap/base/config/MemoryConfigurationProvider",
	"ui5loader-autoconfig"
], (
	MemoryConfigurationProvider
	/*autoconfig*/
) => {
	"use strict";

	/**
	 * The base Configuration.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
	 * @alias module:sap/base/config
	 * @borrows module:sap/base/config/_Configuration.get as get
	 * @borrows module:sap/base/config/_Configuration.Type as Type
	 * @namespace
	 */

	const _Configuration = sap.ui.require("sap/base/config/_Configuration");

	/**
	 * Returns a writable base configuration instance
	 * @returns {module:sap/base/config} The writable base configuration
	 * @private
	 * @ui5-restricted sap.ui.core, sap.fl
	 */
	_Configuration.getWritableInstance = () => {
		const oProvider = new MemoryConfigurationProvider();

		return {
			set(sName, vValue) {
				const rValidKey = /^[a-z][A-Za-z0-9]*$/;
				if (rValidKey.test(sName)) {
					oProvider.set(sName, vValue);
					_Configuration._.invalidate();
				} else {
					throw new TypeError(
						"Invalid configuration key '" + sName + "'!"
					);
				}
			},
			get(mOptions) {
				mOptions.provider = oProvider;
				return _Configuration.get(mOptions);
			},
			Type: _Configuration.Type
		};
	};

	return _Configuration;
});