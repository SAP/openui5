sap.ui.define([
], function (
) {
	"use strict";

	return {
		/**
		 * Converts the mandatory ["sap.app"].id to a name for file.
		 * @param {object} oManifest manifest.json file of the current example in JSON format.
		 * @returns {string} The formatted name.
		 */
		_formatExampleName: function (oManifest) {
			return oManifest["sap.app"].id.replace(/\./g,"-");
		}
	};
});