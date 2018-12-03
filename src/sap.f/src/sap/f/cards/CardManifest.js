/*!
 * ${copyright}
 */
/**
 * @class CardManifest
 *
 * UI5 independent implementation of a CardManifest reader.
 *
 * Usage Sample with translation
 *
 * 1. Load the Manifest Json
 * 2. Create Instance
 *    var myCardManifest = new CardManifest(oManifestJson);
 * 3. Create and Register a Translator
 *    myCardManifest.get("sap.card/i18n");
 *    //load the resource bundle in the given language and create a translator object
 *    //   the object only needs to implement getText(sKey) which returns the value.
 *    myCardManifest.registerTranslator(oTranslator);
 * 4. Get the title
 *    myCardManifest.get("sap.card/title")
 *
 */
sap.ui.define([], function () {
	"use strict";
	//sap.card section can define local settings for the following entries, if not given the sap.app/sap.ui settings are used as
	//fallback
	var mFallbacks = {
		"sap.card/title": "sap.app/title",
		"sap.card/subtitle": "sap.app/subtitle",
		"sap.card/info": "sap.app/info",
		"sap.card/i18n": "sap.app/i18n",
		"sap.card/description": "sap.app/description",
		"sap.card/icons": "sap.ui/icons",
		"sap.card/view": "sap.ui5/rootView"
	};
	/**
	 * @constructor
	 * @private
	 * @param {*} oManifestJson
	 */
	function CardManifest(oManifestJson) {
		this.oJson = oManifestJson;
	}
	/**
	 * @constructor
	 * @private
	 * @param {*} oManifestJson
	 */
	CardManifest.prototype.registerTranslator = function (oTranslator) {
		this.oTranslator = oTranslator;
	};
	CardManifest.prototype.getJson = function () {
		return this.oJson;
	};
	CardManifest.prototype.get = function (sPath) {
		var aParts = sPath.split("/"),
			iPart = 0,
			sPart = aParts[iPart],
			oNode = this.oJson;
		if (!sPart) {
			return null;
		}
		while (oNode && sPart) {
			oNode = oNode[sPart];
			if (typeof oNode === "string" &&
				this.oTranslator &&
				oNode.indexOf("{{") === 0 &&
				oNode.indexOf("}}") === oNode.length - 2) {
				oNode = this.oTranslator.getText(oNode.substring(2, oNode.length - 2));
			}
			iPart++;
			sPart = aParts[iPart];
		}
		if (mFallbacks[sPath] && (oNode === null || oNode === undefined)) {
			return this.get(mFallbacks[sPath]);
		}
		return oNode;
	};
	return CardManifest;
}, true);