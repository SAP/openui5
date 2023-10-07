/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Lib",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/BackendConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/core/BusyIndicator",
	"sap/base/Log",
	"sap/m/MessageBox"
], function(
	merge,
	Lib,
	Layer,
	BackendConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils,
	_pick,
	FlexInfoSession,
	BusyIndicator,
	Log,
	MessageBox
) {
	"use strict";

	var PREFIX = "/flex/keyuser";

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
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC
		],

		ROUTES: {
			CHANGES: `${PREFIX + InitialConnector.API_VERSION}/changes/`,
			SETTINGS: `${PREFIX + InitialConnector.API_VERSION}/settings`,
			TOKEN: `${PREFIX + InitialConnector.API_VERSION}/settings`,
			VERSIONS: {
				GET: `${PREFIX + InitialConnector.API_VERSION}/versions/`,
				ACTIVATE: `${PREFIX + InitialConnector.API_VERSION}/versions/activate/`,
				DISCARD: `${PREFIX + InitialConnector.API_VERSION}/versions/draft/`,
				PUBLISH: `${PREFIX + InitialConnector.API_VERSION}/versions/publish/`
			},
			TRANSLATION: {
				UPLOAD: `${PREFIX + InitialConnector.API_VERSION}/translation/texts`,
				DOWNLOAD: `${PREFIX + InitialConnector.API_VERSION}/translation/texts/`,
				GET_SOURCELANGUAGE: `${PREFIX + InitialConnector.API_VERSION}/translation/sourcelanguages/`
			},
			CONTEXTS: `${PREFIX + InitialConnector.API_VERSION}/contexts/`
		},

		isLanguageInfoRequired: true,

		loadFeatures(mPropertyBag) {
			return BackendConnector.loadFeatures.call(KeyUserConnector, mPropertyBag).then(function(oFeatures) {
				oFeatures.isContextSharingEnabled = true;
				return oFeatures;
			});
		},

		getContexts(mPropertyBag) {
			var aParameters = ["type", "$skip", "$filter"];
			var mParameters = _pick(mPropertyBag, aParameters);

			var sContextsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.CONTEXTS, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sContextsUrl, "GET", {initialConnector: InitialConnector}).then(function(oResult) {
				return oResult.response;
			});
		},

		loadContextDescriptions(mPropertyBag) {
			var mParameters = {};
			InitialUtils.addLanguageInfo(mParameters);
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var sContextsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.CONTEXTS, mPropertyBag, mParameters);
			mPropertyBag.payload = JSON.stringify(mPropertyBag.flexObjects);
			mPropertyBag.dataType = "json";
			mPropertyBag.contentType = "application/json; charset=utf-8";
			return WriteUtils.sendRequest(sContextsUrl, "POST", mPropertyBag).then(function(oResult) {
				return oResult.response;
			});
		},

		getFlexInfo(mPropertyBag) {
			return FlexInfoSession.get(mPropertyBag.selector) || {};
		}
	});

	function _enhancePropertyBagWithTokenInfo(mPropertyBag) {
		mPropertyBag.initialConnector = InitialConnector;
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
		load(mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var mParameters = {};
			InitialUtils.addLanguageInfo(mParameters);
			mParameters.limit = mPropertyBag.limit;
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.GET, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sVersionsUrl, "GET", mPropertyBag).then(function(oResult) {
				return oResult.response.versions.map(function(oVersion) {
					return renameVersionNumberProperty(oVersion);
				});
			});
		},
		activate(mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			_enhancePropertyBagForDraftActivation(mPropertyBag);
			var mParameters = {version: mPropertyBag.version};
			InitialUtils.addLanguageInfo(mParameters);
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.ACTIVATE, mPropertyBag, mParameters);
			return WriteUtils.sendRequest(sVersionsUrl, "POST", mPropertyBag).then(function(oResult) {
				var oVersion = oResult.response;
				return renameVersionNumberProperty(oVersion);
			});
		},
		discardDraft(mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.DISCARD, mPropertyBag);
			return WriteUtils.sendRequest(sVersionsUrl, "DELETE", mPropertyBag);
		},
		publish(mPropertyBag) {
			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
			var fnHandleAllErrors = function(oError) {
				BusyIndicator.hide();
				var sMessage = oResourceBundle.getText("MSG_CF_PUBLISH_ERROR", oError ? [oError.message || oError] : undefined);
				var sTitle = oResourceBundle.getText("HEADER_TRANSPORT_ERROR");
				Log.error(`publish version error${oError}`);
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.ERROR,
					title: sTitle,
					styleClass: mPropertyBag.styleClass
				});
				return "Error";
			};

			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var mParameters = {version: mPropertyBag.version};
			var sVersionsUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.PUBLISH, mPropertyBag, mParameters);
			return WriteUtils.sendRequest(sVersionsUrl, "POST", mPropertyBag).then(function() {
				BusyIndicator.hide();
				return oResourceBundle.getText("MSG_CF_PUBLISH_SUCCESS");
			}).catch(fnHandleAllErrors);
		}
	};

	KeyUserConnector.translation = {
		getTexts(mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var mParameters = _pick(mPropertyBag, ["sourceLanguage", "targetLanguage"]);
			var sTranslationUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.TRANSLATION.DOWNLOAD, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sTranslationUrl, "GET", mPropertyBag).then(function(oResult) {
				return oResult.response;
			});
		},

		getSourceLanguages(mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var mParameters = {};
			var sTranslationUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.TRANSLATION.GET_SOURCELANGUAGE, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sTranslationUrl, "GET", mPropertyBag).then(function(oResult) {
				return oResult && oResult.response && oResult.response.sourceLanguages ? oResult.response.sourceLanguages : [];
			});
		},

		postTranslationTexts(mPropertyBag) {
			_enhancePropertyBagWithTokenInfo(mPropertyBag);
			var sTranslationUrl = InitialUtils.getUrl(KeyUserConnector.ROUTES.TRANSLATION.UPLOAD, mPropertyBag, {});
			return InitialUtils.sendRequest(sTranslationUrl, "POST", mPropertyBag);
		}
	};

	KeyUserConnector.initialConnector = InitialConnector;
	return KeyUserConnector;
});
