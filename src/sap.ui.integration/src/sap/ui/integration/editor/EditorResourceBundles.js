/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/i18n/ResourceBundle"
], function (ManagedObject, ResourceBundle) {
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
			}
		}
	});

	EditorResourceBundles.prototype.loadResourceBundles = function () {
		var sUrl = this.getUrl();
		var aSupportedLocales = this.getSupportedLocales();
		var aLanguages = this.getLanguages();
		this._aEditorResourceBundles = [];
		//according to the language list, load each resource bundle
		for (var p in aLanguages) {
			var oResourceBundleTemp;
			if (sUrl) {
				var aFallbacks = [p];
				if (p.indexOf("-") > -1) {
					aFallbacks.push(p.substring(0, p.indexOf("-")));
				}
				//add en into fallbacks
				if (!aFallbacks.includes("en")) {
					aFallbacks.push("en");
				}
				oResourceBundleTemp = ResourceBundle.create({
					url: sUrl,
					async: false,
					locale: p,
					supportedLocales: aFallbacks
				});
			}
			var oResourceBundleObject = {
				"language": aLanguages[p],
				"resourceBundle": oResourceBundleTemp,
				"isSupportedLocale": true
			};
			if (Array.isArray(aSupportedLocales) && !aSupportedLocales.includes(p) && !aSupportedLocales.includes(p.replace('-', '_'))) {
				oResourceBundleObject.isSupportedLocale = false;
			}
			this._aEditorResourceBundles[p] = oResourceBundleObject;
		}
	};

	EditorResourceBundles.prototype.getResourceBundles = function () {
		if (!this._aEditorResourceBundles) {
			this.loadResourceBundles();
		}
		return this._aEditorResourceBundles;
	};

	return EditorResourceBundles;
});