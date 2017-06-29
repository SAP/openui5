/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change"
], function (jQuery, Utils, Change) {
	"use strict";

	/**
	 * Helper object to handle variants and their changes
	 *
	 * @param {string} sComponentName - Component name the flexibility controller is responsible for
	 * @param {string} sAppVersion - Current version of the application
	 * @param {object} oChangeFileContent - Object containing file content from Lrep response
	 * @constructor
	 * @class
	 * @alias sap.ui.fl.variants.VariantController
	 * @experimental Since 1.50.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var VariantController = function (sComponentName, sAppVersion, oChangeFileContent) {
		this._sComponentName = sComponentName || "";
		this._sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;

		if (!oChangeFileContent || !oChangeFileContent.changes || !oChangeFileContent.changes.variantSection) {
			this._mVariantManagement = {};
		} else {
			this._mVariantManagement = oChangeFileContent.changes.variantSection;
		}
	};

	/**
	 * Returns the component name of the VariantController
	 *
	 * @returns {String} the name of the component
	 * @public
	 */
	VariantController.prototype.getComponentName = function () {
		return this._sComponentName;
	};

	/**
	 * Returns the application version of the VariantController
	 *
	 * @returns {String} Application version
	 * @public
	 */
	VariantController.prototype.getAppVersion = function () {
		return this._sAppVersion;
	};

	/**
	 * Returns the variants for a given variant management id
	 *
	 * @param {String} sVariantManagementId The variant management id
	 * @returns {Array} The array containing all variants of the variant management control
	 * @public
	 */
	VariantController.prototype.getVariants = function (sVariantManagementId) {
		var aVariants = [];
		if (this._mVariantManagement[sVariantManagementId]) {
			aVariants = this._mVariantManagement[sVariantManagementId].variants;
		}

		return aVariants;
	};

	/**
	 * Gets the changes of a given variant
	 *
	 * @param {String} sVariantManagementId The variant management id
	 * @param {String} sVariantId The id of the variant
	 * @returns {Array} The array containing all changes of the variant
	 * @public
	 */
	VariantController.prototype.getVariantChanges = function(sVariantManagementId, sVariantId) {
		var sVarId = sVariantId || this._mVariantManagement[sVariantManagementId].defaultVariant;
		var aVariants = this.getVariants(sVariantManagementId);
		if (aVariants.length === 0) {
			return aVariants;
		} else {
			var aFiltered = [];
			aFiltered = aVariants.filter(function(oVariant) {
				if (oVariant.fileName === sVarId) {
					return true;
				}
			});

			if (aFiltered.length > 0) {
			 return aFiltered.map(function(oVariant) {
				return oVariant.changes;
			 }).reduce(function(aResult, aChanges) {
				return aResult.concat(aChanges);
			 });
			} else {
				return aFiltered;
			}
		}
	};

	/**
	 * Loads the default changes of all variants
	 *
	 * @returns {Array} The array containing all changes of the default variants
	 * @public
	 */
	VariantController.prototype.loadDefaultChanges = function() {
		var sVarId;
		var aDefaultChanges = [];
		for (var sVarMgmtId in this._mVariantManagement) {
			sVarId = this._mVariantManagement[sVarMgmtId].defaultVariant;
			aDefaultChanges = aDefaultChanges.concat(this.getVariantChanges(sVarMgmtId, sVarId));
		}

		return aDefaultChanges;
	};

	return VariantController;
}, true);
