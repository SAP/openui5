/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant"
], function (jQuery, Utils, Change, Variant) {
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
		this._mVariantManagement = {};
		if (oChangeFileContent && oChangeFileContent.changes && oChangeFileContent.changes.variantSection) {
			Object.keys(oChangeFileContent.changes.variantSection).forEach(function (sVariantManagementReference) {
				var oVariantManagementReference = oChangeFileContent.changes.variantSection[sVariantManagementReference];
				var aVariants = oVariantManagementReference.variants.concat().sort(this.compareVariants);

				var iIndex = -1;
				aVariants.some(function (oVariant, index) {
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
				this._mVariantManagement[sVariantManagementReference] = {
					variants : aVariants,
					defaultVariant : oVariantManagementReference.defaultVariant
				};
			}.bind(this));
		}
	};

	VariantController.prototype.compareVariants = function (oVariantData1, oVariantData2) {
		if (oVariantData1.content.title.toLowerCase() < oVariantData2.content.title.toLowerCase()) {
			return -1;
		} else if (oVariantData1.content.title.toLowerCase() > oVariantData2.content.title.toLowerCase()) {
			return 1;
		} else {
			return 0;
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
		var aVariants = this._mVariantManagement[sVariantManagementReference] && this._mVariantManagement[sVariantManagementReference].variants;
		return aVariants ? aVariants : [];
	};

	VariantController.prototype.getVariant = function (sVariantManagementReference, sVariantReference) {
		var oVariant;
		var aVariants = this.getVariants(sVariantManagementReference);
		aVariants.some(function(oCurrentVariant, iIndex) {
			if (oCurrentVariant.content.fileName === sVariantReference) {
				oVariant = oCurrentVariant;
				return true;
			}
		});
		return oVariant;
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
		var aNewChanges = this.getVariantChanges(sVariantManagementReference, sVariantReference);

		aNewChanges.forEach(function (oCurrentChangeContent, iIndex) {
			var oCurrentChange = new Change(oCurrentChangeContent);
			if (oCurrentChange.getKey
				&& (oCurrentChange.getKey() === oChange.getKey())) {
				aNewChanges.splice(iIndex, 1);
			}
		});

		return this.setVariantChanges(sVariantManagementReference, sVariantReference, aNewChanges);
	};

	VariantController.prototype.addVariantToVariantManagement = function (oVariantData, sVariantManagementReference) {
		var aVariants = this._mVariantManagement[sVariantManagementReference].variants.slice().splice(1),
			iIndex = 0;
		aVariants.some(function (oExistingVariantData, index) {
			if (this.compareVariants(oVariantData, aVariants[index]) < 0) {
				iIndex = index;
				return true;
			}
			//insert to the end of array
			iIndex = index + 1;
		}.bind(this)); /*Return index of inserted variant*/

		//Skipping standard variant with iIndex + 1
		this._mVariantManagement[sVariantManagementReference].variants.splice(iIndex + 1, 0, oVariantData);
		return iIndex + 1;
	};

	VariantController.prototype.removeVariantFromVariantManagement = function (oVariant, sVariantManagementReference) {
		var iIndex;
		var bFound = this._mVariantManagement[sVariantManagementReference].variants.some(function(oCurrentVariantContent, index) {
			var oCurrentVariant = new Variant(oCurrentVariantContent);
			if (oCurrentVariant.getKey() === oVariant.getKey()) {
				iIndex = index;
				return true;
			}
		});
		if (bFound) {
			this._mVariantManagement[sVariantManagementReference].variants.splice(iIndex, 1);
		}
		return iIndex;
	};

	return VariantController;
}, true);
