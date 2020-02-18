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
	 * @param {sap.ui.integration.util.Manifest} oManifest The manifest containing destinations configuration.
	 * @private
	 * @alias sap.ui.integration.util.Destinations
	 */
	var Destinations = BaseObject.extend("sap.ui.integration.util.Destinations", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oHost, oManifest) {
			BaseObject.call(this);
			this._oHost = oHost;
			this._oManifest = oManifest;
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

	Destinations.prototype._hasDestination = function (sString) {
		return !!sString.match(rPattern);
	};

	Destinations.prototype._processString = function (sString) {
		var aMatches = sString.match(rPattern),
			sKey,
			sName;

		if (!aMatches) {
			return Promise.resolve(sString); // no destinations to process
		}

		sKey = aMatches[1];

		sName = this._getName(sKey);

		if (!sName) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. Problem with configuration in the manifest.");
		}

		if (!this._oHost) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. There is no 'host' specified.");
		}

		return this._oHost.getDestination(sName)
			.then(function (sUrl) {
				return this._replaceUrl(sString, sKey, sUrl);
			}.bind(this));
	};

	Destinations.prototype._replaceUrl = function (sString, sKey, sUrl) {
		var sSanitizedUrl = sUrl.trim().replace(/\/$/, ""); // remove any trailing spaces and slashes

		return sString.replace("{{destinations." + sKey + "}}", sSanitizedUrl);
	};

	Destinations.prototype._getName = function (sKey) {
		var oConfig = this._oManifest.get("/sap.card/configuration/destinations/" + sKey),
			sName;

		if (!oConfig) {
			Log.error("Config for destination '" + sKey + "' was not found in manifest.");
			return;
		}

		sName = oConfig.name;

		if (!sName) {
			Log.error("Configuration for destination '" + sKey + "' is missing a 'name'.");
			return;
		}

		return oConfig.name;
	};

	return Destinations;
});
