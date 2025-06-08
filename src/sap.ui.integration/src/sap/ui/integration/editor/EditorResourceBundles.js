/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log"
], function (ManagedObject, ResourceBundle, Log) {
	"use strict";

	/**
	 * Constructor for a new <code>EditorResourceBundles</code>.
	 *
	 * @class Resource Bundles of Editor
	 * @alias sap.ui.integration.editor.EditorResourceBundles
	 * @author SAP SE
	 * @since 1.94.0
	 * @version ${version}
	 * @private
	 */
	var EditorResourceBundles = ManagedObject.extend("sap.ui.integration.editor.EditorResourceBundles", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				url: {
					type: "string",
					defaultValue: ""
				},
				languages: {
					type: "object"
				},
				supportedLocales: {
					type: "array"
				}
			},
			events: {
				ready: {}
			}
		}
	});

	EditorResourceBundles.prototype.loadResourceBundles = function () {
		var that = this;
		var sUrl = that.getUrl();
		var aSupportedLocales = that.getSupportedLocales();
		var aLanguages = that.getLanguages();
		that._ready = false;
		that._aResourceBundles = [];
		that._aResourceBundleReadyPromise = [];
		// according to the language list, load each resource bundle
		Object.keys(aLanguages).forEach(function (language) {
			if (sUrl) {
				var aFallbacks = [language];
				if (language.indexOf("-") > -1) {
					aFallbacks.push(language.substring(0, language.indexOf("-")));
				}
				// add en into fallbacks
				if (!aFallbacks.includes("en")) {
					aFallbacks.push("en");
				}
				that._aResourceBundles[language] = "";
				var oResourceBundleReadyPromie = ResourceBundle.create({
					url: sUrl,
					async: true,
					locale: language,
					supportedLocales: aFallbacks
				}).then(function (oResourceBundle) {
					var oResourceBundleObject = {
						"language": aLanguages[language],
						"resourceBundle": oResourceBundle,
						"isSupportedLocale": true
					};
					if (Array.isArray(aSupportedLocales) && !aSupportedLocales.includes(language) && !aSupportedLocales.includes(language.replace('-', '_'))) {
						oResourceBundleObject.isSupportedLocale = false;
					}
					that._aResourceBundles[language] = oResourceBundleObject;
				});
				that._aResourceBundleReadyPromise.push(oResourceBundleReadyPromie);
			} else {
				// i18n not defined in card manifest
				var oResourceBundleObject = {
					"language": aLanguages[language],
					"isSupportedLocale": true
				};
				if (Array.isArray(aSupportedLocales) && !aSupportedLocales.includes(language) && !aSupportedLocales.includes(language.replace('-', '_'))) {
					oResourceBundleObject.isSupportedLocale = false;
				}
				that._aResourceBundles[language] = oResourceBundleObject;
			}
		});
		if (that._aResourceBundleReadyPromise.length > 0) {
			Promise.all(that._aResourceBundleReadyPromise).then(function () {
				Object.keys(aLanguages).forEach(function (language) {
					// add missing languages
					if (that._aResourceBundles[language] == "") {
						var oResourceBundleObject = {
							"language": aLanguages[language],
							"isSupportedLocale": true
						};
						if (Array.isArray(aSupportedLocales) && !aSupportedLocales.includes(language) && !aSupportedLocales.includes(language.replace('-', '_'))) {
							oResourceBundleObject.isSupportedLocale = false;
						}
						that._aResourceBundles[language] = oResourceBundleObject;
					}
				});
				Log.info("sap.ui.integration.editor.EditorResourceBundles: resource bundles loaded.");
				that._ready = true;
				that.fireReady();
			});
		} else {
			Log.info("sap.ui.integration.editor.EditorResourceBundles: no resource bundles.");
			that._ready = true;
			that.fireReady();
		}
	};

	EditorResourceBundles.prototype.isReady = function () {
		return this._ready;
	};

	EditorResourceBundles.prototype.getResourceBundles = function () {
		return this._aResourceBundles;
	};

	return EditorResourceBundles;
});