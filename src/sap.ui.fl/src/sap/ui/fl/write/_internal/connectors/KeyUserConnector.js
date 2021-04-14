/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/BackendConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	merge,
	BackendConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils
) {
	"use strict";

	var PREFIX = "/flex/keyuser";
	var API_VERSION = "/v1";

	function _enhancePropertyBagWithTokenInfo(mPropertyBag) {
		mPropertyBag.initialConnector = InitialConnector;
		mPropertyBag.xsrfToken = InitialConnector.xsrfToken;
		mPropertyBag.tokenUrl = KeyUserConnector.ROUTES.TOKEN;
	}

	function _enhancePropertyBagForDraftActivation(mPropertyBag) {
		var oPayload = {
			title: mPropertyBag.title
		};
		mPropertyBag.payload = JSON.stringify(oPayload);
		mPropertyBag.dataType = "json";
		mPropertyBag.contentType = "application/json; charset=utf-8";
	}

	function renameVersionNumberProperty(oVersion) {
		oVersion.version = oVersion.versionNumber;
		delete oVersion.versionNumber;
		return oVersion;
	}

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var KeyUserConnector = merge({}, BackendConnector, /** @lends sap.ui.fl.write._internal.connectors.KeyUserConnector */ {
		layers: InitialConnector.layers,

		ROUTES: {
			CHANGES: PREFIX + API_VERSION + "/changes/",
			SETTINGS: PREFIX + API_VERSION + "/settings",
			TOKEN: PREFIX + API_VERSION + "/settings",
			VERSIONS: {
				GET: PREFIX + API_VERSION + "/versions/",
				ACTIVATE: PREFIX + API_VERSION + "/versions/activate/",
				DISCARD: PREFIX + API_VERSION + "/versions/draft/"
			}
		},
		isLanguageInfoRequired: true
	});

	KeyUserConnector.versions = {
		load: function (mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var mParameters = {};
			InitialUtils.addLanguageInfo(mParameters);
			mParameters.limit = mPropertyBag.limit;
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.GET, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sVersionsUrl, "GET", mPropertyBag).then(function (oResult) {
				return oResult.response.map(function (oVersion) {
					return renameVersionNumberProperty(oVersion);
				});
			});
		},
		activate: function (mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			_enhancePropertyBagForDraftActivation(mPropertyBag);
			var mParameters = {version: mPropertyBag.version};
			InitialUtils.addLanguageInfo(mParameters);
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.ACTIVATE, mPropertyBag, mParameters);
			return WriteUtils.sendRequest(sVersionsUrl, "POST", mPropertyBag).then(function (oResult) {
				var oVersion = oResult.response;
				return renameVersionNumberProperty(oVersion);
			});
		},
		discardDraft: function (mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.DISCARD, mPropertyBag);
			return WriteUtils.sendRequest(sVersionsUrl, "DELETE", mPropertyBag);
		}
	};

	KeyUserConnector.initialConnector = InitialConnector;
	return KeyUserConnector;
});
