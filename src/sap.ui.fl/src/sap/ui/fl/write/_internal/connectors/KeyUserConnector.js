/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/BackendConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/write/_internal/FlexInfoSession"
], function (
	merge,
	BackendConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils,
	_pick,
	FlexInfoSession
) {
	"use strict";

	var PREFIX = "/flex/keyuser";
	var API_VERSION = {
		V1: "/v1",
		V2: "/v2"
	};

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
			CHANGES: PREFIX + API_VERSION.V1 + "/changes/",
			SETTINGS: PREFIX + API_VERSION.V1 + "/settings",
			TOKEN: PREFIX + API_VERSION.V1 + "/settings",
			VERSIONS: {
				GET: PREFIX + API_VERSION.V2 + "/versions/",
				ACTIVATE: PREFIX + API_VERSION.V1 + "/versions/activate/",
				DISCARD: PREFIX + API_VERSION.V1 + "/versions/draft/"
			},
			TRANSLATION: {
				UPLOAD: PREFIX + API_VERSION.V1 + "/translation/texts",
				DOWNLOAD: PREFIX + API_VERSION.V1 + "/translation/texts/",
				GET_SOURCELANGUAGE: PREFIX + API_VERSION.V1 + "/translation/sourcelanguages/"
			},
			CONTEXTS: PREFIX + API_VERSION.V1 + "/contexts/"
		},
		isLanguageInfoRequired: true,
		loadFeatures: function (mPropertyBag) {
			return BackendConnector.loadFeatures.call(KeyUserConnector, mPropertyBag).then(function (oFeatures) {
				// in case the variants can be adapted via RTA, the public option should not be offered
				oFeatures.isPublicLayerAvailable = oFeatures.isPublicLayerAvailable && !oFeatures.isVariantAdaptationEnabled;
				return oFeatures;
			});
		},

		getContexts: function (mPropertyBag) {
			var aParameters = ["type", "$skip", "$filter"];
			var mParameters = _pick(mPropertyBag, aParameters);

			var sContextsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.CONTEXTS, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sContextsUrl).then(function (oResult) {
				return oResult.response;
			});
		},

		loadContextDescriptions: function (mPropertyBag) {
			var mParameters = {};
			InitialUtils.addLanguageInfo(mParameters);
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var sContextsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.CONTEXTS, mPropertyBag, mParameters);
			mPropertyBag.payload = JSON.stringify(mPropertyBag.flexObjects);
			mPropertyBag.dataType = "json";
			mPropertyBag.contentType = "application/json; charset=utf-8";
			return WriteUtils.sendRequest(sContextsUrl, "POST", mPropertyBag);
		},

		isContextSharingEnabled: function () {
			return Promise.resolve(true);
		},

		getFlexInfo: function (mPropertyBag) {
			return FlexInfoSession.get(mPropertyBag.selector) || {};
		}
	});

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
		oVersion.version = oVersion.versionNumber.toString();
		delete oVersion.versionNumber;
		return oVersion;
	}

	KeyUserConnector.versions = {
		load: function (mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var mParameters = {};
			InitialUtils.addLanguageInfo(mParameters);
			mParameters.limit = mPropertyBag.limit;
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.GET, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sVersionsUrl, "GET", mPropertyBag).then(function (oResult) {
				return oResult.response.versions.map(function (oVersion) {
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

	KeyUserConnector.translation = {
		getTexts: function (mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["sourceLanguage", "targetLanguage"]);
			var sTranslationUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.TRANSLATION.DOWNLOAD, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sTranslationUrl, "GET", mPropertyBag).then(function(oResult) {
				return oResult.response;
			});
		},

		getSourceLanguages: function (mPropertyBag) {
			var mParameters = {};
			var sTranslationUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.TRANSLATION.GET_SOURCELANGUAGE, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sTranslationUrl, "GET", mPropertyBag).then(function(oResult) {
				return oResult && oResult.response && oResult.response.sourceLanguages ? oResult.response.sourceLanguages : [];
			});
		},

		postTranslationTexts: function (mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var sTranslationUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.TRANSLATION.UPLOAD, mPropertyBag, {});
			return InitialUtils.sendRequest(sTranslationUrl, "POST", mPropertyBag);
		}
	};


	KeyUserConnector.initialConnector = InitialConnector;
	return KeyUserConnector;
});
