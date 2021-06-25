/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/includes"
], function (LoaderExtensions, ResourceBundle, includes) {
	"use strict";

	/**
	 * @class
	 * @alias sap.ui.integration.editor.EditorResourceBundles
	 * @author SAP SE
	 * @since 1.94.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.94.0
	 * @ui5-restricted
	 */
	var EditorResourceBundles = (function () {

		var aEditorResourceBundles;

		function init(sResourceBundleURL) {
			aEditorResourceBundles = [];
			//load the language list from languages.json file
			var aLanguageList = LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
				dataType: "json",
				failOnError: false,
				async: false
			});
			//according to the language list, load each resource bundle
			for (var p in aLanguageList) {
				var aFallbacks = [p];
				if (p.indexOf("_") > -1) {
					aFallbacks.push(p.substring(0, p.indexOf("_")));
				}
				//add en into fallbacks
				if (!includes(aFallbacks, "en")) {
					aFallbacks.push("en");
				}
				var oResourceBundleTemp = ResourceBundle.create({
					url: sResourceBundleURL,
					async: false,
					locale: p,
					supportedLocales: aFallbacks,
					fallbackLocale: "en"
				});
				aEditorResourceBundles[p] = {"language": aLanguageList[p], "resourceBundle": oResourceBundleTemp};
			}
			return aEditorResourceBundles;
		}

		return {
			getInstance: function (sResourceBundleURL) {
				if (!aEditorResourceBundles) {
					aEditorResourceBundles = init(sResourceBundleURL);
				}
				return aEditorResourceBundles;
			}
		};

	})();

	return EditorResourceBundles;
});