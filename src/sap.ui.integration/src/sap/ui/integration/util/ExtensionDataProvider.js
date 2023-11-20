/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/util/DataProvider"], function (DataProvider) {
	"use strict";

	/**
	 * Constructor for a new <code>ExtensionDataProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.util.DataProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.79
	 * @alias sap.ui.integration.util.ExtensionDataProvider
	 */
	var ExtensionDataProvider = DataProvider.extend("sap.ui.integration.util.ExtensionDataProvider", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oConfig, oExtension) {
			DataProvider.call(this, oConfig);
			this._oExtension = oExtension;
		}
	});

	ExtensionDataProvider.prototype.destroy = function () {
		DataProvider.prototype.destroy.apply(this, arguments);
		this._oExtension = null;
	};

	/**
	 * @override
	 * @returns {Promise} A promise resolved when the data is available and rejected in case of an error.
	 */
	ExtensionDataProvider.prototype.getData = function () {
		var oExtensionSettings = this.getSettings().extension;

		if (!this._oExtension) {
			return Promise.reject("The extension module is not loaded properly or doesn't export a correct value.");
		}

		if (!this._oExtension[oExtensionSettings.method]) {
			return Promise.reject("Extension doesn't implement " + oExtensionSettings.method + " method.");
		}

		return this._oExtension[oExtensionSettings.method].apply(this._oExtension, oExtensionSettings.args);
	};

	/**
 	 * @override
 	 */
	ExtensionDataProvider.prototype.getDetails = function () {
		return "Load data from Extension. Method: " + this.getSettings().extension.method;
	};

	return ExtensionDataProvider;
});