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
		}
	});

	Destinations.prototype.setHost = function(oHost) {
		this._oHost = oHost;
	};

	Destinations.prototype.process = function (oConfig) {
		var sUrl = oConfig.url,
			oClonedConfig;

		if (!sUrl || typeof sUrl !== "string") {
			return Promise.resolve(oConfig);
		}

		if (!this._hasDestination(sUrl)) {
			return Promise.resolve(oConfig);
		}

		oClonedConfig = jQuery.extend(true, {}, oConfig);

		return this._processString(sUrl)
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
		var oConfig = this._oConfiguration ? this._oConfiguration[sKey] : null,
			sName,
			sDefaultUrl;

		if (!oConfig) {
			return Promise.reject("Configuration for destination '" + sKey + "' was not found in the manifest.");
		}

		sName = oConfig.name;
		sDefaultUrl = oConfig.defaultUrl;

		if (!sName) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. There is no 'name' property.");
		}

		if (!this._oHost && !sDefaultUrl) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. There is no 'host' and no defaultUrl specified.");
		}

		if (!this._oHost && sDefaultUrl) {
			return Promise.resolve(sDefaultUrl);
		}

		return this._oHost.getDestination(sName);
	};

	Destinations.prototype._hasDestination = function (sString) {
		return !!sString.match(rPattern);
	};

	Destinations.prototype._processString = function (sString) {
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

	Destinations.prototype._replaceUrl = function (sString, sKey, sUrl) {
		var sSanitizedUrl = sUrl.trim().replace(/\/$/, ""); // remove any trailing spaces and slashes

		return sString.replace("{{destinations." + sKey + "}}", sSanitizedUrl);
	};

	return Destinations;
});
