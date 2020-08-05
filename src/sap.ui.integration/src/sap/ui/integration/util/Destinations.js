/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/Log"
], function (
	BaseObject,
	Log
) {
	"use strict";
	/* global Map */

	var rPattern = /\{\{destinations.([^\}]+)/;

	/**
	 * Constructor for a new <code>Destinations</code>.
	 *
	 * @class
	 * Processes and resolves destinations configuration.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {sap.ui.integration.Host} oHost The Host which will be used for resolving destinations.
	 * @param {object} oConfiguration The destinations configuration.
	 * @private
	 * @alias sap.ui.integration.util.Destinations
	 */
	var Destinations = BaseObject.extend("sap.ui.integration.util.Destinations", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oHost, oConfiguration) {
			BaseObject.call(this);
			this._oHost = oHost;
			this._oConfiguration = oConfiguration;
			this._mResolved = new Map();
		}
	});

	/**
	 * Sets the host which is used to resolve destinations.
	 * @param {sap.ui.integration.Host} oHost The host.
	 */
	Destinations.prototype.setHost = function(oHost) {
		this._oHost = oHost;
		this._mResolved.clear();
	};

	/**
	 * Process destination placeholders inside a configuration object.
	 * @param {Object} oConfig The configuration object.
	 * @returns {Promise} A promise which resolves with the processed object.
	 */
	Destinations.prototype.process = function (oConfig) {
		var sUrl = oConfig.url,
			oClonedConfig;

		if (!sUrl || typeof sUrl !== "string") {
			return Promise.resolve(oConfig);
		}

		if (!this.hasDestination(sUrl)) {
			return Promise.resolve(oConfig);
		}

		oClonedConfig = jQuery.extend(true, {}, oConfig);

		return this.processString(sUrl)
			.then(function (sProcessedUrl) {
				oClonedConfig.url = sProcessedUrl;
				return oClonedConfig;
			});
	};

	/**
	 * Resolves the destination and returns its URL.
	 * @param {string} sKey The destination's key used in the configuration.
	 * @returns {Promise} A promise which resolves with the URL of the destination.
	 * @public
	 */
	Destinations.prototype.getUrl = function (sKey) {
		var oResult;

		if (this._mResolved.has(sKey)) {
			return this._mResolved.get(sKey);
		}

		oResult = this._resolveUrl(sKey);

		this._mResolved.set(sKey, oResult);

		return oResult;
	};

	/**
	 * @private
	 */
	Destinations.prototype._resolveUrl = function (sKey) {
		var oConfig = this._oConfiguration ? this._oConfiguration[sKey] : null,
			sName,
			sDefaultUrl,
			pResult;

		if (!oConfig) {
			return Promise.reject("Configuration for destination '" + sKey + "' was not found in the manifest.");
		}

		sName = oConfig.name;
		sDefaultUrl = oConfig.defaultUrl;

		if (!sName && !sDefaultUrl) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. Neither 'name' nor 'defaultUrl' is configured.");
		}

		if (!sName && sDefaultUrl) {
			return Promise.resolve(sDefaultUrl);
		}

		if (!this._oHost && !sDefaultUrl) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. There is no 'host' and no defaultUrl specified.");
		}

		if (!this._oHost && sDefaultUrl) {
			return Promise.resolve(sDefaultUrl);
		}

		pResult = this._oHost.getDestination(sName);

		if (sDefaultUrl) {
			return pResult.catch(function (sMessage) {
				Log.error(sMessage + " Fallback to default url.");
				return sDefaultUrl;
			});
		}

		return pResult;
	};

	/**
	 * Returns true if the given string contains destination placeholder.
	 * @param {string} sString The string to check.
	 * @returns {boolean} True if the string contains a destination.
	 */
	Destinations.prototype.hasDestination = function (sString) {
		return !!sString.match(rPattern);
	};

	/**
	 * Process a string and replaces a destination placeholder with the resolved destination.
	 * @param {string} sString The string to process.
	 * @returns {Promise} A Promise which resolves with the processed string.
	 */
	Destinations.prototype.processString = function (sString) {
		var aMatches = sString.match(rPattern),
			sKey;

		if (!aMatches) {
			return Promise.resolve(sString); // no destinations to process
		}

		sKey = aMatches[1];

		return this.getUrl(sKey)
			.then(function (sUrl) {
				return this._replaceUrl(sString, sKey, sUrl);
			}.bind(this));
	};

	/**
	 * @private
	 */
	Destinations.prototype._replaceUrl = function (sString, sKey, sUrl) {
		var sSanitizedUrl = sUrl.trim().replace(/\/$/, ""); // remove any trailing spaces and slashes

		return sString.replace("{{destinations." + sKey + "}}", sSanitizedUrl);
	};

	return Destinations;
});
