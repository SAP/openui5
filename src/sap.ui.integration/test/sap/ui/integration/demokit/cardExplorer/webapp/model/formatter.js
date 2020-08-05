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
		formatExampleName: function (oManifest) {
			return oManifest["sap.app"].id.replace(/\./g,"-");
		},

		/**
		 * Turns error into more readable text. Each error is displayed on new line.
		 * @param {array|string} vErrors Errors provided by Ajv validation.
		 * @returns {string} All formatted errors concatenated.
		 */
		formatSchemaErrors: function (vErrors) {

			if (!vErrors) {
				return "";
			}

			if (typeof vErrors === "string") {
				return vErrors;
			}

			return vErrors.reduce(function (sAccumulatedErrors, oError, i) {
				var sError = (i + 1)  + " - " + oError.message;

				sError += ', path: "sap.card"';

				if (oError.dataPath) {
					sError += oError.dataPath;
				}

				if (oError.params.additionalProperty) {
					sError += ", property: " + oError.params.additionalProperty;
				}

				if (oError.params.allowedValues) {
					sError += ", allowedValues: " + oError.params.allowedValues.join(", ");
				}

				return sAccumulatedErrors + sError +  "\n";
			}, "Schema Validation Error:\n");
		}
	};
});