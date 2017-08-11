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
	 * @param {String} sVariantManagementReference The variant management id
	 * @returns {Array} The array containing all variants of the variant management control
	 * @public
	 */
	VariantController.prototype.getVariants = function (sVariantManagementReference) {
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

		if (this._mVariantManagement[sVariantManagementReference]) {
			aVariants = this._mVariantManagement[sVariantManagementReference].variants.sort(compareVariants);

			var iIndex = -1;
			aVariants.some(function(oVariant, index) {
				if (oVariant.content.fileName === sVariantManagementReference) {
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
	 * @param {String} sVariantManagementReference The variant management id
	 * @param {String} sVariantReference The id of the variant
	 * @returns {Array} The array containing all changes of the variant
	 * @public
	 */
	VariantController.prototype.getVariantChanges = function(sVariantManagementReference, sVariantReference) {
		var sVarRef = sVariantReference || this._mVariantManagement[sVariantManagementReference].defaultVariant;
		var aVariants = this.getVariants(sVariantManagementReference);
		var aFiltered = aVariants.filter(function(oVariant) {
			return oVariant.content.fileName === sVarRef;
		});

		return aFiltered.reduce(function(aResult, oVariant) {
			return oVariant.changes ? aResult.concat(oVariant.changes) : aResult;
		},[]);
	};

	VariantController.prototype.setVariantChanges = function(sVariantManagementReference, sVariantReference, aChanges) {
		if (!sVariantManagementReference || !sVariantReference || !jQuery.isArray(aChanges)) {
			Utils.log.error("Cannot set variant changes without Variant reference");
			return;
		}

		return this._mVariantManagement[sVariantManagementReference].variants
			.some(function (oVariant, iIndex) {
				if (oVariant.content.fileName === sVariantReference) {
					oVariant.changes = aChanges;
					return true;
				}
			});
	};

	/**
	 * Loads the default changes of all variants
	 *
	 * @returns {Array} The array containing all changes of the default variants
	 * @public
	 */
	VariantController.prototype.loadDefaultChanges = function() {
		var sVariantReference;
		var aDefaultChanges = [];
		for (var sVariantManagementReference in this._mVariantManagement) {
			sVariantReference = this._mVariantManagement[sVariantManagementReference].defaultVariant;
			aDefaultChanges = aDefaultChanges.concat(this.getVariantChanges(sVariantManagementReference, sVariantReference));
		}

		return aDefaultChanges;
	};

	/**
	 * Returns the map with all changes to be reverted and applied when switching variants
	 *
	 * @param {String} sVariantManagementReference The variant management id
	 * @param {String} sCurrentVariant The id of the currently used variant
	 * @param {String} sNewVariant The id of the newly selected variant
	 * @param {Object} mChanges The changes inside the current changes map
	 * @returns {Object} The map containing all changes to be reverted and all new changes
	 * @public
	 */
	VariantController.prototype.getChangesForVariantSwitch = function(sVariantManagementReference, sCurrentVariant, sNewVariant, mChanges) {
		var aCurrentChangeKeys = this.getVariantChanges(sVariantManagementReference, sCurrentVariant).map(function(oChangeContent) {
			return new Change(oChangeContent).getKey();
		});

		var aCurrentVariantChanges = Object.keys(mChanges).reduce(function(aChanges, sControlId) {
			var aCurrentFilteredChanges = [];
			mChanges[sControlId].forEach(function(oChange) {
				var iChangeIndex = aCurrentChangeKeys.indexOf(oChange.getKey());
				if (iChangeIndex !== -1) {
					aCurrentFilteredChanges.push(oChange);
				}
			});
			return aChanges.concat(aCurrentFilteredChanges);
		}, []);

		var aNewChanges = this.getVariantChanges(sVariantManagementReference, sNewVariant).map(function(oChangeContent) {
			return new Change(oChangeContent);
		});

		var aRevertChanges = [];
		if (aNewChanges.length > 0) {
			aRevertChanges = aCurrentVariantChanges.slice();
			aCurrentVariantChanges.some(function (oChange) {
				if (oChange.getKey() === aNewChanges[0].getKey()) {
					aNewChanges.shift();
					aRevertChanges.shift();
				} else {
					return true;
				}
			});
		} else {
			aRevertChanges = aCurrentVariantChanges;
		}

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

	VariantController.prototype.addChangeToVariant = function (oChange, sVariantManagementReference, sVariantReference) {
		var aNewChanges = this.getVariantChanges(sVariantManagementReference, sVariantReference);
		var aChangeFileNames = aNewChanges.map(function (oChange) {
			return oChange.fileName;
		});
		var iIndex = aChangeFileNames.indexOf(oChange.getDefinition().fileName);
		if (iIndex === -1) {
			aNewChanges.push(oChange.getDefinition());
			return this.setVariantChanges(sVariantManagementReference, sVariantReference, aNewChanges);
		}
		return false;
	};

	VariantController.prototype.removeChangeFromVariant = function (oChange, sVariantManagementReference, sVariantReference) {
		var aNewChanges = this.getVariantChanges(sVariantManagementReference , sVariantReference);

		aNewChanges.forEach(function (oCurrentChangeContent, iIndex) {
			var oCurrentChange = new Change(oCurrentChangeContent);
			if (oCurrentChange.getKey
				&& (oCurrentChange.getKey() === oChange.getKey())) {
				aNewChanges.splice(iIndex, 1);
			}
		});

		return this.setVariantChanges(sVariantManagementReference, sVariantReference, aNewChanges);
	};

	return VariantController;
}, true);
