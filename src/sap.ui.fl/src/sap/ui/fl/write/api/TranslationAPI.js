/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Utils"
], function(
	FlexState,
	ManifestUtils,
	Storage,
	Utils
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to get source languages, download XLIFF files or upload translations.
	 *
	 * @namespace sap.ui.fl.write.api.TranslationAPI
	 * @experimental Since 1.97
	 * @since 1.97
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var TranslationAPI = /** @lends sap.ui.fl.write.api.TranslationAPI */ {};

	/**
	 * Downloads the XLIFF file for the given parameters.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - The root control of key user adaptation
	 to determine the app component and the reference
	 * @param {string} mPropertyBag.sourceLanguage - Source language for for which the request should be made
	 * @param {string} mPropertyBag.targetLanguage - Target language for for which the request should be made
	 * @param {string} mPropertyBag.layer - Layer for which the texts should be retrieved
	 *
	 * @returns {Promise} Resolves after the download is completed;
	 */
	TranslationAPI.getTexts = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.sourceLanguage) {
			return Promise.reject("No sourceLanguage was provided");
		}
		if (!mPropertyBag.targetLanguage) {
			return Promise.reject("No targetLanguage was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);

		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		return Promise.resolve()
			.then(Storage.translation.getTexts.bind(undefined, mPropertyBag));
	};

	/**
	 * Gets the source languages for the given application.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - The root control of key user adaptation
	 to determine the app component and the reference
	 * @returns {Promise} Resolves after the languages are retrieved;
	 * rejects if an error occurs or parameters are missing
	 */
	TranslationAPI.getSourceLanguages = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);

		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		return Promise.resolve()
			.then(Storage.translation.getSourceLanguages.bind(undefined, mPropertyBag));
	};

	/* TODO follow up commit
	TranslationAPI.upload = function (mPropertyBag) {
	};

	TranslationAPI.getTranslationRelevantChanges = function (mPropertyBag) {
	};

	TranslationAPI.getDirtyTranslationRelevantChanges = function (mPropertyBag) {
	};
	*/
	return TranslationAPI;
});
