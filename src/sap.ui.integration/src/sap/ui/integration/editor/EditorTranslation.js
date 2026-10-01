/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/deepClone",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"./EditorResourceBundles"
], function (
	deepClone,
	ResourceBundle,
	ResourceModel,
	EditorResourceBundles
) {
	"use strict";

	/**
	 * Translation helper for the Editor control.
	 * Contains methods for loading and managing translation bundles and per-language text values.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorTranslation
	 * @static
	 * @private
	 */
	var EditorTranslation = {};

	/**
	 * Initialises the EditorResourceBundles instance used for multi-translation support.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oLanguages
	 */
	EditorTranslation.initResourceBundlesForMultiTranslation = function (oEditor, oLanguages) {
		var vI18n = oEditor._oManifest.get("/sap.app/i18n");
		var sResourceBundleURL;
		if (typeof vI18n === "string") {
			sResourceBundleURL = oEditor.getBaseUrl() + vI18n;
		} else if (typeof vI18n === "object" && vI18n.bundleUrl) {
			sResourceBundleURL = oEditor.getBaseUrl() + vI18n.bundleUrl;
		}
		oEditor._oEditorResourceBundles = new EditorResourceBundles({
			url: sResourceBundleURL,
			languages: oLanguages
		});
		oEditor._oEditorResourceBundles.loadResourceBundles();
	};

	/**
	 * Loads the default i18n ResourceModel from the editor's own resource bundle.
	 * Sets the "i18n" named model on the editor.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @returns {Promise}
	 */
	EditorTranslation.loadDefaultTranslations = async function (oEditor) {
		if (oEditor._defaultTranslationsLoaded) {
			return;
		}

		var oResourceModel = new ResourceModel({
			bundle: oEditor._oResourceBundle
		});

		// wait for the promise returned by #getResourceBundle to resolve before accessing model data
		await oResourceModel.getResourceBundle();

		oEditor.setModel(oResourceModel, "i18n");
		oEditor._defaultTranslationsLoaded = true;
	};

	/**
	 * Enhances the "i18n" model with the manifest's own resource bundle if the URL differs.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {sap.base.i18n.ResourceBundle} oResourceBundle
	 * @returns {Promise}
	 */
	EditorTranslation.enhanceI18nModel = async function (oEditor, oResourceBundle) {
		var oResourceModel = oEditor.getModel("i18n");
		if (oResourceModel.getResourceBundle().oUrlInfo.url !== oResourceBundle.oUrlInfo.url) {
			await oResourceModel.enhance(oResourceBundle);
			oEditor._oResourceBundle = await oResourceModel.getResourceBundle();
		}
	};

	/**
	 * Loads the language-specific translation bundle for translation mode.
	 * Result is stored in oEditor._oTranslationBundle.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @returns {Promise}
	 */
	EditorTranslation.loadSpecialTranslations = async function (oEditor) {
		if (oEditor._oTranslationBundle) {
			return;
		}
		var sLanguage = oEditor._language;
		if (!sLanguage) {
			return;
		}
		var vI18n = oEditor._oManifest.get("/sap.app/i18n"),
			sResourceBundleURL,
			aSupportedLocales;
		if (!vI18n) {
			return;
		}
		if (typeof vI18n === "string") {
			sResourceBundleURL = oEditor.getBaseUrl() + vI18n;
		} else if (typeof vI18n === "object") {
			if (vI18n.bundleUrl) {
				sResourceBundleURL = oEditor.getBaseUrl() + vI18n.bundleUrl;
			}
			if (Array.isArray(vI18n.supportedLocales)) {
				aSupportedLocales = vI18n.supportedLocales;
				for (var i = 0; i < aSupportedLocales.length; i++) {
					aSupportedLocales[i] = aSupportedLocales[i].replaceAll('_', '-');
				}
			}
		}
		if (sResourceBundleURL) {
			var aFallbacks = [sLanguage];
			if (sLanguage.indexOf("-") > -1) {
				aFallbacks.push(sLanguage.substring(0, sLanguage.indexOf("-")));
			}
			//add en into fallbacks
			if (!aFallbacks.includes("en")) {
				aFallbacks.push("en");
			}
			aFallbacks = EditorTranslation._filterSupportedFallbackLanguages(aFallbacks, aSupportedLocales);
			// load the ResourceBundle relative to the manifest
			var oResourceBundle = await ResourceBundle.create({
				url: sResourceBundleURL,
				async: true,
				locale: aFallbacks[0],
				supportedLocales: aFallbacks,
				fallbackLocale: "en"
			});

			var oResourceModel = new ResourceModel({
				bundle: oResourceBundle
			});

			// wait for the promise returned by #getResourceBundle to resolve before accessing model data
			oEditor._oTranslationBundle = await oResourceModel.getResourceBundle();
		}
	};

	/**
	 * Filters the fallback language list to only contain locales present in aSupportedLocales.
	 * If aSupportedLocales is not an array the original list is returned unchanged.
	 *
	 * @param {string[]} aFallbacks
	 * @param {string[]|undefined} aSupportedLocales
	 * @returns {string[]}
	 */
	EditorTranslation._filterSupportedFallbackLanguages = function (aFallbacks, aSupportedLocales) {
		if (Array.isArray(aSupportedLocales)) {
			var aSupportedFallbacks = [];
			for (var i = 0; i < aFallbacks.length; i++) {
				if (aSupportedLocales.includes(aFallbacks[i])) {
					aSupportedFallbacks.push(aFallbacks[i]);
				}
			}
			aFallbacks = aSupportedFallbacks;
		}
		return aFallbacks;
	};

	/**
	 * Returns the current language-specific text for a key from the translation bundle,
	 * or "" if the key does not exist.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {string} sKey
	 * @returns {string}
	 */
	EditorTranslation.getCurrentLanguageSpecificText = function (oEditor, sKey) {
		if (oEditor._oTranslationBundle) {
			var sText = oEditor._oTranslationBundle.getText(sKey, [], true);
			if (sText === undefined) {
				return "";
			}
			return sText;
		}
		return "";
	};

	/**
	 * Returns the stored translation text for a given language and manifest path
	 * from the settings model's /texts section.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {string} sLanguage
	 * @param {string} sManifestPath
	 * @returns {string|undefined}
	 */
	EditorTranslation.getTranslationValueInTexts = function (oEditor, sLanguage, sManifestPath) {
		var sTranslationPath = "/texts/" + sLanguage;
		var oProperty = oEditor._oSettingsModel.getProperty(sTranslationPath) || {};
		return oProperty[sManifestPath];
	};

	/**
	 * Removes all stored translation values for a given manifest path from every language
	 * in the settings model's /texts section.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {string} sManifestPath
	 */
	EditorTranslation.deleteAllTranslationValuesInTexts = function (oEditor, sManifestPath) {
		var oData = oEditor._oSettingsModel.getData();
		if (!oData || !oData.texts) {
			return;
		}
		var oTexts = deepClone(oData.texts, 500);
		for (var n in oTexts) {
			if (oTexts[n][sManifestPath]) {
				delete oTexts[n][sManifestPath];
			}
		}
		oEditor._oSettingsModel.setProperty("/texts", oTexts);
	};

	return EditorTranslation;

});
