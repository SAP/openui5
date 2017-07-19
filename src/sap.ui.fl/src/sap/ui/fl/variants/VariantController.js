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
		this._setChangeFileContent(oChangeFileContent);

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

	VariantController.prototype._setChangeFileContent = function (oChangeFileContent) {
		if (!oChangeFileContent || !oChangeFileContent.changes || !oChangeFileContent.changes.variantSection) {
			this._mVariantManagement = {};
		} else {
			this._mVariantManagement = oChangeFileContent.changes.variantSection;
		}
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

		function compareVariants(variant1, variant2) {
			if (variant1.title < variant2.title) {
				return -1;
			} else if (variant1.title > variant2.title) {
				return 1;
			} else {
				return 0;
			}
		}

		if (this._mVariantManagement[sVariantManagementId]) {
			aVariants = this._mVariantManagement[sVariantManagementId].variants.sort(compareVariants);

			var iIndex = -1;
			aVariants.some(function(oVariant, index) {
				if (oVariant.content.fileName === sVariantManagementId) {
					iIndex = index;
					return true;
				}
				return false;
			});
			if (iIndex > -1) {
				var oStandardVariant = aVariants.splice(iIndex, 1)[0];
				aVariants.splice(0, 0, oStandardVariant);
			}
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
			var aFiltered = aVariants.filter(function(oVariant) {
				if (oVariant.content.fileName === sVarId) {
					return true;
				}
			});

		 return aFiltered.reduce(function(aResult, oVariant) {
			return aResult.concat(oVariant.changes);
		 },[]);
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

	/**
	 * Returns the map with all changes to be reverted and applied when switching variants
	 *
	 * @param {String} sVariantManagementId The variant management id
	 * @param {String} sCurrentVariant The id of the currently used variant
	 * @param {String} sNewVariant The id of the newly selected variant
	 * @returns {Object} The map containing all changes to be reverted and all new changes
	 * @public
	 */
	VariantController.prototype.getChangesForVariantSwitch = function(sVariantManagementId, sCurrentVariant, sNewVariant) {
		var aCurrentChanges = this.getVariantChanges(sVariantManagementId, sCurrentVariant).map(function(oChangeContent) {
			return new Change(oChangeContent);
		});
		var aNewChanges = this.getVariantChanges(sVariantManagementId, sNewVariant).map(function(oChangeContent) {
			return new Change(oChangeContent);
		});
		var aRevertChanges = aCurrentChanges.slice();
		aCurrentChanges.some(function(oChange) {
			if (oChange.getKey() === aNewChanges[0].getKey()) {
				aNewChanges.shift();
				aRevertChanges.shift();
			} else {
				return true;
			}
		});

		var mSwitches = {
			aRevert : aRevertChanges.reverse(),
			aNew : aNewChanges
		};

		return mSwitches;
	};

	/**
	 * Creates the data for the variant model
	 *
	 * @returns {Object} oVariantData The JSON object for the Variant Model
	 * @private
	 */
	VariantController.prototype._fillVariantModel = function() {
		var oVariantData = {};
		Object.keys(this._mVariantManagement).forEach(function(sKey) {
			oVariantData[sKey] = {
				defaultVariant : this._mVariantManagement[sKey].defaultVariant,
				variants : []
			};
			this.getVariants(sKey).forEach(function(oVariant, index) {
				oVariantData[sKey].variants[index] = {
					key : oVariant.content.fileName,
					title : oVariant.content.title,
					author : oVariant.content.support.user,
					layer : oVariant.content.layer,
					readOnly : oVariant.content.fileName === sKey
				};
			});
		}.bind(this));

		return oVariantData;
	};

	return VariantController;
}, true);
