/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Utils",
	"sap/base/util/isEmptyObject",
	"sap/base/i18n/Localization"
], function(
	FlexObjectState,
	ManifestUtils,
	Storage,
	Utils,
	isEmptyObject,
	Localization
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to get source languages, download XLIFF files or upload translations.
	 *
	 * @namespace sap.ui.fl.write.api.TranslationAPI
	 * @since 1.97
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var TranslationAPI = /** @lends sap.ui.fl.write.api.TranslationAPI */ {};

	/**
	 * Determines if an application has changes with translatable texts.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Root control of key user adaptation
	 *
	 * @returns {boolean} <code>true</code> in case translatable texts are present
	 */
	TranslationAPI.hasTranslationRelevantDirtyChanges = function(mPropertyBag) {
		return FlexObjectState.getDirtyFlexObjects(ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector)).some(function(oChange) {
			return !isEmptyObject(oChange.getTexts());
		});
	};

	/**
	 * Downloads the XLIFF file for the given parameters.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Root control of key user adaptation
	 to determine the app component and the reference
	 * @param {string} mPropertyBag.sourceLanguage - Source language for for which the request should be made
	 * @param {string} mPropertyBag.targetLanguage - Target language for for which the request should be made
	 * @param {string} mPropertyBag.layer - Layer for which the texts should be retrieved
	 *
	 * @returns {Promise} Resolves after the download is completed;
	 */
	TranslationAPI.getTexts = function(mPropertyBag) {
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
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Root control of key user adaptation
	 to determine the app component and the reference
	 * @returns {Promise} Resolves after the languages are retrieved;
	 * rejects if an error occurs or parameters are missing
	 */
	TranslationAPI.getSourceLanguages = function(mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		return Storage.translation.getSourceLanguages(mPropertyBag)
		.then(function(aLanguages) {
			var sCurrentLanguage = Localization.getLanguage();
			if (!aLanguages.includes(sCurrentLanguage) && TranslationAPI.hasTranslationRelevantDirtyChanges(mPropertyBag)) {
				aLanguages.push(sCurrentLanguage);
			}
			return aLanguages;
		});
	};

	/**
	 * Uploads an XLIFF file.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.payload - The file to be uploaded
	 * @returns {Promise} Resolves after the file was uploaded;
	 * rejects if an error occurs or a parameter is missing
	 */
	TranslationAPI.uploadTranslationTexts = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.payload) {
			return Promise.reject("No payload was provided");
		}

		return Promise.resolve()
		.then(Storage.translation.postTranslationTexts.bind(undefined, mPropertyBag));
	};

	return TranslationAPI;
});
