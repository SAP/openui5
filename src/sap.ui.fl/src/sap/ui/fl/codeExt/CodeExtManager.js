/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Change"
], function(
	Storage,
	Change
) {
	"use strict";

	/**
	 * Helper object to process code extension changes
	 *
	 * @namespace
	 * @alias sap.ui.fl.codeExt.CodeExtManager
	 * @since 1.40.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var CodeExtManager;

	CodeExtManager = {
		/**
		 * @param {object} oPropertyBag - Object with properties
		 * @param {string} oPropertyBag.id - Change ID. Will be generated if not present.
		 * @param {string} oPropertyBag.codeRef - Relative path of code file
		 * @param {string} oPropertyBag.controllerName - Controller name
		 * @param {string} oPropertyBag.appVariantId - <code>AppVariantId</code> or <code>componentName</code> in which the context is present
		 * @param {object} mOptions - Property bag of options for the codeExt change creation
		 * @param {string} mOptions.transportId - Id of ABAP Transport which CodeExt change assigned to
		 * @param {string} mOptions.packageName - Name of ABAP Package which CodeExt change assigned to
		 * @returns {Promise} Resolves as soon as the writing was completed
		 */
		createOrUpdateCodeExtChange: function(oPropertyBag, mOptions) {
			if (!oPropertyBag.content || !oPropertyBag.content.codeRef) {
				throw new Error("no code reference passed for the code extension change");
			}
			if (!oPropertyBag.selector || !oPropertyBag.selector.id) {
				throw new Error("no controller name passed for the code extension change");
			}

			if (!oPropertyBag.reference) {
				throw new Error("no reference passed for the code extension change");
			}

			oPropertyBag.changeType = oPropertyBag.changeType || "codeExt";

			var oChange = Change.createInitialFileContent(oPropertyBag);

			return Storage.write({
				layer: oChange.layer,
				transport: mOptions.transportId,
				flexObjects: [oChange]
			});
		},

		/**
		 * @param {array} aChanges - List of changes need to be created
		 * @param {object} mOptions - Property bag of options for the codeExt change creation
		 * @param {string} mOptions.codeRef - Code reference which changes are associated with
		 * @param {string} mOptions.transportId - ID of the ABAP transport to which the change is assigned
		 * @param {string} mOptions.packageName - Name of the ABAP transport to which the change is assigned
		 * @returns {Promise} Resolves as soon as the writing is completed
		 */
		createCodeExtChanges: function(aChanges, mOptions) {
			aChanges = aChanges || [];
			if (aChanges.length === 0) {
				return Promise.resolve();
			}

			var aPreparedChanges = [];
			aChanges.forEach(function(oChange) {
				oChange.changeType = oChange.changeType || "codeExt";
				oChange.packageName = mOptions.packageName;
				oChange.content = {
					codeRef: mOptions.codeRef
				};
				aPreparedChanges.push(Change.createInitialFileContent(oChange));
			});

			return Storage.write({
				layer: aPreparedChanges[0].layer,
				transport: mOptions.transportId,
				flexObjects: aPreparedChanges
			});
		},

		/**
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 * @param {object} mOptions - Property bag of options for the codeExt change creation
		 * @param {string} mOptions.transportId - ID of ABAP Transport which CodeExt change assigned to
		 * @param {string} mOptions.packageName - Name of ABAP Package which CodeExt change assigned to
		 * @returns {Promise} Resolves as soon as the deletion is completed
		 */
		deleteCodeExtChange: function(oChange, mOptions) {
			if (oChange.changeType !== "codeExt" || oChange.fileType !== "change") {
				throw new Error("the change is not of type 'code extension'");
			}

			if (!oChange.fileName) {
				throw new Error("the extension does not contains a file name");
			}

			if (oChange.namespace === undefined) {
				throw new Error("the extension does not contains a namespace");
			}

			return Storage.remove({
				layer: oChange.layer,
				transport: mOptions.transportId,
				flexObject: oChange
			});
		}
	};

	return CodeExtManager;
});
