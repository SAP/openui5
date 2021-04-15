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
		 * @param {string} oPropertyBag.id - change Id if not present it will be generated
		 * @param {string} oPropertyBag.codeRef - relative path of code file
		 * @param {string} oPropertyBag.controllerName - controller name
		 * @param {string} oPropertyBag.appVariantId - appVariantId or componentName in which the context is present
		 * @param {string} mOptions.transportId - Id of ABAP Transport which CodeExt change assigned to
		 * @param {string} mOptions.packageName - Name of ABAP Package which CodeExt change assigned to
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
		 * @param {array} aChanges - list of changes need to be created
		 * @param {object} mOptions - Property bag of options for the codeExt change creation
		 * @param {string} mOptions.codeRef - code reference which changes are associated with
		 * @param {string} mOptions.transportId - id of ABAP transport on which the change is assigned to
		 * @param {string} mOptions.packageName - name of ABAP package on which the change is assigned to
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
		 * @param {sap.ui.fl.Change} oChange
		 * @param {string} mOptions.transportId - ID of ABAP Transport which CodeExt change assigned to
		 * @param {string} mOptions.packageName - Name of ABAP Package which CodeExt change assigned to
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
