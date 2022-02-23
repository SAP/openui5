/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/util/isEmptyObject",
	"sap/ui/fl/Utils"
], function(
	Core,
	ChangesController,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Storage,
	ChangePersistenceFactory,
	isEmptyObject,
	Utils
) {
	"use strict";

	function getDirtyChangesFromPersistence(sReference) {
		if (!sReference) {
			return [];
		}
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
		return oChangePersistence.getDirtyChanges();
	}

	// TODO remove as soon as the flexReferences with and without .Component are aligned
	function getDirtyDescriptorChanges(mPropertyBag) {
		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		var sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		return getDirtyChangesFromPersistence(Utils.normalizeReference(sFlexReference));
	}

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
	 * Determines if an application has changes with translatable texts.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Root control of key user adaptation
	 *
	 * @returns {boolean} <code>true</code> in case translatable texts are present
	 */
	TranslationAPI.hasTranslationRelevantDirtyChanges = function(mPropertyBag) {
		return [].concat(
			FlexObjectState.getDirtyFlexObjects(mPropertyBag),
			getDirtyDescriptorChanges(mPropertyBag)
		).some(function (oChange) {
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
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Root control of key user adaptation
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

		return Storage.translation.getSourceLanguages(mPropertyBag)
			.then(function (aLanguages) {
				var sCurrentLanguage = Core.getConfiguration().getLanguage();
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
	TranslationAPI.uploadTranslationTexts = function (mPropertyBag) {
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
