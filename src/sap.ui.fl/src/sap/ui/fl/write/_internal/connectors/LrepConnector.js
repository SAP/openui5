/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyConnector,
	ApplyUtils,
	WriteUtils,
	_pick
) {
	"use strict";

	var ROUTES = {
		FLEX_INFO: "/flex/info/",
		PUBLISH: "/actions/make_changes_transportable/",
		CHANGES: "/changes/",
		VARIANTS: "/variants/",
		SETTINGS: "/flex/settings",
		TOKEN: "/actions/getcsrftoken/",
		APPVARIANTS: "/appdescr_variants/",
		APPVARIANTS_OVERVIEW: "/app_variant_overview/"
	};

	/**
	 * Write flex data into LRep back end or update an existing flex data stored in LRep back end
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {string} mPropertyBag.method POST for writing new data and PUT for update an existing data
	 * @param {object[]} [mPropertyBag.flexObjects] Objects to be written (i.e. change definitions, variant definitions etc.)
	 * @param {object} [mPropertyBag.flexObject] Object to be updated
	 * @param {string} mPropertyBag.url Configured url for the connector
	 * @param {string} [mPropertyBag.transport] The transport ID
	 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
	 * @param {boolean} [mPropertyBag.isAppVariant] indicator whether this is an app variant
	 * @param {boolean} [mPropertyBag.skipIam=false] - Indicates whether the default IAM item creation and registration is skipped. This is S4/Hana specific flag passed by only Smart Business
	 * @private
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	var _doWrite = function(mPropertyBag) {
		var sRoute;
		if (mPropertyBag.isLegacyVariant) {
			sRoute = ROUTES.VARIANTS;
		} else if (mPropertyBag.isAppVariant) {
			sRoute = ROUTES.APPVARIANTS;
		} else {
			sRoute = ROUTES.CHANGES;
		}

		var mParameters = _pick({
			changelist: mPropertyBag.transport,
			skipIam: mPropertyBag.skipIam
		}, ["changelist", "skipIam"]);

		ApplyConnector._addClientAndLanguageInfo(mParameters);
		//single update --> fileName needs to be in the url
		if (mPropertyBag.flexObject && !mPropertyBag.isAppVariant) {
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
		}
		var sWriteUrl = ApplyUtils.getUrl(sRoute, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		delete mPropertyBag.fileName;
		var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			sTokenUrl,
			mPropertyBag.flexObjects || mPropertyBag.flexObject,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sWriteUrl, mPropertyBag.method, oRequestOption);
	};

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.LrepConnector
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var LrepConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.LrepConnector */ {

		layers: [
			"ALL"
		],

		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		reset: function (mPropertyBag) {
			var aParameters = ["reference", "layer", "appVersion", "changelist", "generator"];
			var mParameters = _pick(mPropertyBag, aParameters);

			ApplyConnector._addClientAndLanguageInfo(mParameters);

			if (mPropertyBag.selectorIds) {
				mParameters.selector = mPropertyBag.selectorIds;
			}
			if (mPropertyBag.changeTypes) {
				mParameters.changeType = mPropertyBag.changeTypes;
			}

			delete mPropertyBag.reference;
			var sResetUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);
			var oRequestOption = WriteUtils.getRequestOptions(
				this.applyConnector,
				sTokenUrl
			);
			return WriteUtils.sendRequest(sResetUrl, "DELETE", oRequestOption);
		},


		/**
		 * Publish flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.package] ABAP package (mandatory when layer is 'VENDOR')
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as the publish has completed
		 */
		//TODO Need to be removed/aligned. This function is not used but a direct request triggered from sap/ui/fl/Transport
		publish: function (mPropertyBag) {
			var aParameters = ["reference", "layer", "appVersion", "changelist", "package"];
			var mParameters = _pick(mPropertyBag, aParameters);

			ApplyConnector._addClientAndLanguageInfo(mParameters);

			delete mPropertyBag.reference;
			var sPublishUrl = ApplyUtils.getUrl(ROUTES.PUBLISH, mPropertyBag, mParameters);
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);
			var oRequestOption = WriteUtils.getRequestOptions(
				this.applyConnector,
				sTokenUrl
			);
			return WriteUtils.sendRequest(sPublishUrl, "POST", oRequestOption);
		},

		/**
		 * Gets the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as flex info has been retrieved
		 */
		getFlexInfo: function (mPropertyBag) {
			var aParameters = ["layer", "appVersion"];
			var mParameters = _pick(mPropertyBag, aParameters);

			ApplyConnector._addClientAndLanguageInfo(mParameters);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.FLEX_INFO, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl);
		},

		/**
		 * Called to get the flex features.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function (mPropertyBag) {
			if (ApplyConnector.settings) {
				return Promise.resolve(ApplyConnector.settings);
			}
			var mParameters = {};

			ApplyConnector._addClientAndLanguageInfo(mParameters);

			var sFeaturesUrl = ApplyUtils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sFeaturesUrl).then(function (oResult) {
				return oResult.response;
			});
		},

		/**
		 * Write flex data into LRep back end; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		write:function (mPropertyBag) {
			mPropertyBag.method = "POST";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Update an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be updated
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		update: function (mPropertyBag) {
			if (mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.isLegacyVariant = true;
			}
			mPropertyBag.method = "PUT";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Delete an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be deleted
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the deletion is completed without data
		 */
		remove: function (mPropertyBag) {
			var mParameters = {
				namespace: mPropertyBag.flexObject.namespace,
				layer: mPropertyBag.flexObject.layer
			};
			if (mPropertyBag.transport) {
				mParameters.changelist = mPropertyBag.transport;
			}
			ApplyConnector._addClientAndLanguageInfo(mParameters);
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
			var sRoute = mPropertyBag.flexObject.fileType === "variant" ? ROUTES.VARIANTS : ROUTES.CHANGES;
			var sDeleteUrl = ApplyUtils.getUrl(sRoute, mPropertyBag, mParameters);
			//decode url before sending to ABAP back end which does not expect encoded special character such as "/" in the namespace
			sDeleteUrl = decodeURIComponent(sDeleteUrl);
			delete mPropertyBag.fileName;
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
		}
	});
	LrepConnector.applyConnector = ApplyConnector;

	LrepConnector.appVariant.getManifest = function(mPropertyBag) {
		var sAppVariantManifestUrl = mPropertyBag.appVarUrl;
		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			undefined,
			undefined,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sAppVariantManifestUrl, "GET", oRequestOption);
	};

	LrepConnector.appVariant.load = function(mPropertyBag) {
		var sAppVariantUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag);
		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			undefined,
			undefined,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sAppVariantUrl, "GET", oRequestOption);
	};

	LrepConnector.appVariant.create = function(mPropertyBag) {
		mPropertyBag.method = "POST";
		mPropertyBag.isAppVariant = true;
		return _doWrite(mPropertyBag);
	};

	LrepConnector.appVariant.assignCatalogs = function(mPropertyBag) {
		var mParameters = {};
		mParameters.action = mPropertyBag.action;
		delete mPropertyBag.action;
		mParameters.assignFromAppId = mPropertyBag.assignFromAppId;
		delete mPropertyBag.assignFromAppId;

		var sCatalogAssignmentUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			sTokenUrl,
			undefined,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sCatalogAssignmentUrl, "POST", oRequestOption);
	};

	LrepConnector.appVariant.unassignCatalogs = function(mPropertyBag) {
		var mParameters = {};
		mParameters.action = mPropertyBag.action;
		delete mPropertyBag.action;

		var sCatalogUnAssignmentUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			sTokenUrl,
			undefined,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sCatalogUnAssignmentUrl, "POST", oRequestOption);
	};

	LrepConnector.appVariant.update = function(mPropertyBag) {
		mPropertyBag.method = "PUT";
		mPropertyBag.isAppVariant = true;
		return _doWrite(mPropertyBag);
	};

	LrepConnector.appVariant.remove = function(mPropertyBag) {
		var mParameters = {};
		if (mPropertyBag.transport) {
			mParameters.changelist = mPropertyBag.transport;
		}

		var sDeleteUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			sTokenUrl,
			undefined,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
	};

	LrepConnector.appVariant.list = function(mPropertyBag) {
		var mParameters = {};

		mParameters.layer = mPropertyBag.layer;
		mParameters["sap.app/id"] = mPropertyBag["sap.app/id"];

		delete mPropertyBag.layer;
		delete mPropertyBag["sap.app/id"];

		var sAppVarOverviewUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS_OVERVIEW, mPropertyBag, mParameters);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			undefined,
			undefined,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sAppVarOverviewUrl, "GET", oRequestOption);
	};

	return LrepConnector;
}, true);
