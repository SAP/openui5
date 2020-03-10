/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/base/util/ObjectPath",
	"sap/base/util/includes",
	"sap/base/util/merge",
	"sap/base/Log"
], function (
	Utils,
	LayerUtils,
	Change,
	Variant,
	ObjectPath,
	includes,
	merge,
	Log
) {
	"use strict";

	var _fnResetMapListener = function() {};

	/**
	 * Helper object to handle variants and their changes.
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
		this._mVariantManagement = {};
		this.setChangeFileContent(oChangeFileContent, {});
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
		this.DEFAULT_AUTHOR = "SAP";
	};

	/**
	 * Returns the component name of the <code>VariantController</code>.
	 *
	 * @returns {String} Name of the component
	 * @public
	 */
	VariantController.prototype.getComponentName = function () {
		return this._sComponentName;
	};

	/**
	 * Returns the application version of the <code>VariantController</code>.
	 *
	 * @returns {String} Application version
	 * @public
	 */
	VariantController.prototype.getAppVersion = function () {
		return this._sAppVersion;
	};

	VariantController.prototype.setChangeFileContent = function (oChangeFileContent) {
		if (ObjectPath.get("changes.variantSection", oChangeFileContent)) {
			Object.keys(oChangeFileContent.changes.variantSection).forEach(function(sVMReference) {
				if (!this._mVariantManagement[sVMReference]) {
					this._mVariantManagement[sVMReference] = oChangeFileContent.changes.variantSection[sVMReference];
				}
			}.bind(this));
		}
	};

	VariantController.prototype.getChangeFileContent = function () {
		return this._mVariantManagement;
	};

	VariantController.prototype.compareVariants = function (oVariantData1, oVariantData2) {
		if (oVariantData1.content.content.title.toLowerCase() < oVariantData2.content.content.title.toLowerCase()) {
			return -1;
		} else if (oVariantData1.content.content.title.toLowerCase() > oVariantData2.content.content.title.toLowerCase()) {
			return 1;
		}
		return 0;
	};

	/**
	 * Returns the variants for a given variant management reference.
	 *
	 * @param {String} sVariantManagementReference - Variant management reference
	 * @returns {Array} All variants of the variant management control
	 * @public
	 */
	VariantController.prototype.getVariants = function (sVariantManagementReference) {
		var aVariants = this._mVariantManagement[sVariantManagementReference] && this._mVariantManagement[sVariantManagementReference].variants;
		return aVariants || [];
	};

	VariantController.prototype.getVariant = function (sVariantManagementReference, sVariantReference) {
		var oVariant;
		var aVariants = this.getVariants(sVariantManagementReference);
		aVariants.some(function(oCurrentVariant) {
			if (oCurrentVariant.content.fileName === sVariantReference) {
				oVariant = oCurrentVariant;
				return true;
			}
		});
		return oVariant;
	};

	/**
	 * Gets the changes of a given variant.
	 *
	 * @param {String} sVariantManagementReference - Variant management reference
	 * @param {String} sVariantReference - ID of the variant
	 * @param {boolean} [bChangeInstance] <code>true</code> if each change has to be an instance of <code>sap.ui.fl.Change</code>
	 * @returns {Array} All changes of the variant
	 * @public
	 */
	VariantController.prototype.getVariantChanges = function(sVariantManagementReference, sVariantReference, bChangeInstance) {
		sVariantReference = sVariantReference || this._mVariantManagement[sVariantManagementReference].defaultVariant;
		var aResult = [];
		if (sVariantReference && typeof sVariantReference === "string") {
			var oVariant = this.getVariant(sVariantManagementReference, sVariantReference);
			aResult = oVariant.controlChanges;

			if (bChangeInstance) {
				aResult = aResult.map(function (oChange, index) {
					var oChangeInstance;
					if (!oChange.getDefinition) {
						oChangeInstance = new Change(oChange);
						oVariant.controlChanges.splice(index, 1, oChangeInstance);
					} else {
						oChangeInstance = oChange;
					}
					return oChangeInstance;
				});
			}
		}
		return aResult;
	};

	VariantController.prototype._getReferencedChanges = function(sVariantManagementReference, oCurrentVariant) {
		var aReferencedVariantChanges = [];
		if (oCurrentVariant.content.variantReference) {
			aReferencedVariantChanges = this.getVariantChanges(sVariantManagementReference, oCurrentVariant.content.variantReference, true);
			return aReferencedVariantChanges.filter(function(oReferencedChange) {
				return LayerUtils.compareAgainstCurrentLayer(oReferencedChange.getDefinition().layer, oCurrentVariant.content.layer) === -1; /* Referenced change layer below current layer*/
			});
		}
		return aReferencedVariantChanges;
	};

	VariantController.prototype.setVariantChanges = function(sVariantManagementReference, sVariantReference, aChanges) {
		if (!sVariantManagementReference || !sVariantReference || !Array.isArray(aChanges)) {
			Log.error("Cannot set variant changes without Variant reference");
			return undefined;
		}

		return this._mVariantManagement[sVariantManagementReference].variants
			.some(function (oVariant) {
				if (oVariant.content.fileName === sVariantReference) {
					oVariant.controlChanges = aChanges;
					return true;
				}
			});
	};

	VariantController.prototype._setVariantData = function(mChangedData, sVariantManagementReference, iPreviousIndex) {
		var aVariants = this._mVariantManagement[sVariantManagementReference].variants;
		var oVariantData = aVariants[iPreviousIndex];
		Object.keys(mChangedData).forEach(function (sProperty) {
			if (oVariantData.content.content[sProperty]) {
				oVariantData.content.content[sProperty] = mChangedData[sProperty];
			}
		});

		//Standard variant should always be at the first position, all others are sorted alphabetically
		if (oVariantData.content.fileName !== sVariantManagementReference) {
			//remove element
			aVariants.splice(iPreviousIndex, 1);

			//slice to skip first element, which is the standard variant
			var iSortedIndex = this._getIndexToSortVariant(aVariants.slice(1), oVariantData);

			//add at sorted index (+1 to accommodate standard variant)
			aVariants.splice(iSortedIndex + 1, 0, oVariantData);

			return iSortedIndex + 1;
		}

		aVariants.splice(iPreviousIndex, 1, oVariantData);
		return iPreviousIndex;
	};

	VariantController.prototype._updateChangesForVariantManagementInMap = function(oContent, sVariantManagementReference, bAdd) {
		var oVariantManagement = this._mVariantManagement[sVariantManagementReference];
		var sChangeType = oContent.changeType;
		if (oContent.fileType === "ctrl_variant_change") {
			oVariantManagement.variants.some(function(oVariant) {
				if (oVariant.content.fileName === oContent.selector.id) {
					if (!oVariant.variantChanges[sChangeType]) {
						oVariant.variantChanges[sChangeType] = [];
					}
					if (bAdd) {
						oVariant.variantChanges[sChangeType].push(oContent);
					} else {
						oVariant.variantChanges[sChangeType].some(function (oExistingContent, iIndex) {
							if (oExistingContent.fileName === oContent.fileName) {
								oVariant.variantChanges[sChangeType].splice(iIndex, 1);
								return true; /*inner some*/
							}
						});
					}
					return true; /*outer some*/
				}
			});
		} else if (oContent.fileType === "ctrl_variant_management_change") {
			if (!oVariantManagement.variantManagementChanges) {
				oVariantManagement.variantManagementChanges = {};
			}
			if (!oVariantManagement.variantManagementChanges[sChangeType]) {
				oVariantManagement.variantManagementChanges[sChangeType] = [];
			}
			if (bAdd) {
				oVariantManagement.variantManagementChanges[sChangeType].push(oContent);
			} else {
				oVariantManagement.variantManagementChanges[sChangeType].some(function(oExistingContent, iIndex) {
					if (oExistingContent.fileName === oContent.fileName) {
						oVariantManagement.variantManagementChanges[sChangeType].splice(iIndex, 1);
						return true;
					}
				});
			}
		}
	};

	/**
	 * Loads the initial changes of all variants.
	 * If the application is started with valid variant references, they are used.
	 * If no references or invalid references were passed, the changes are loaded from
	 * the default variant.
	 *
	 * @param {object} oComponent - Component instance used to get the technical parameters
	 * @returns {Array} All changes of the default variants
	 * @public
	 */
	VariantController.prototype.loadInitialChanges = function() {
		return Object.keys(this._mVariantManagement)
			.reduce(function (aInitialChanges, sVariantManagementReference) {
				var sCurrentOrDefaultVariant = this._mVariantManagement[sVariantManagementReference].currentVariant ? "currentVariant" : "defaultVariant";
				var oInitialVariant = this.getVariant(sVariantManagementReference, this._mVariantManagement[sVariantManagementReference][sCurrentOrDefaultVariant]);

				// if variant doesn't exist and visible property is unset - fallback to standard variant
				if (!oInitialVariant || !oInitialVariant.content.content.visible) {
					this._mVariantManagement[sVariantManagementReference][sCurrentOrDefaultVariant] = sVariantManagementReference;
				}

				// Concatenate with the previous flex changes
				return aInitialChanges.concat(
					this.getVariantChanges(sVariantManagementReference, this._mVariantManagement[sVariantManagementReference][sCurrentOrDefaultVariant], false)
				);
			}.bind(this), []);
	};

	/**
	 * Returns the map with all changes to be reverted and applied when switching variants.
	 *
	 * @param {object} mPropertyBag - Additional properties for variant switch
	 * @param {string} mPropertyBag.variantManagementReference - Variant management ID
	 * @param {string} mPropertyBag.currentVariantReference - The ID of the currently used variant
	 * @param {string} mPropertyBag.newVariantReference - ID of the newly selected variant
	 * @param {object} mPropertyBag.changesMap - Changes inside the current changes map
	 *
	 * @typedef {object} sap.ui.fl.variants.SwitchChanges
	 * @property {array} changesToBeReverted - Array of changes to be reverted
	 * @property {array} changesToBeApplied - Array of changes to be applied
	 *
	 * @returns {sap.ui.fl.variants.SwitchChanges} Map containing all changes to be reverted and all new changes
	 * @public
	 */
	VariantController.prototype.getChangesForVariantSwitch = function(mPropertyBag) {
		var aCurrentVariantChanges = this.getVariantChanges(mPropertyBag.variantManagementReference, mPropertyBag.currentVariantReference, true);
		var aMapChanges = [];
		var aChangeKeysFromMap = [];
		Object.keys(mPropertyBag.changesMap).forEach(function(sControlId) {
			mPropertyBag.changesMap[sControlId].forEach(function(oMapChange) {
				aMapChanges = aMapChanges.concat(oMapChange);
				aChangeKeysFromMap = aChangeKeysFromMap.concat(oMapChange.getId());
			});
		});

		aCurrentVariantChanges = aCurrentVariantChanges.reduce(function(aFilteredChanges, oChange) {
			var iMapIndex = aChangeKeysFromMap.indexOf(oChange.getDefinition().fileName);
			if (iMapIndex > -1) {
				aFilteredChanges = aFilteredChanges.concat(aMapChanges[iMapIndex]);
			}
			return aFilteredChanges;
		}, []);

		var aNewChanges = this.getVariantChanges(mPropertyBag.variantManagementReference, mPropertyBag.newVariantReference, true);

		var aRevertChanges = [];
		if (aNewChanges.length > 0) {
			aRevertChanges = aCurrentVariantChanges.slice();
			aCurrentVariantChanges.some(function (oChange) {
				if (aNewChanges[0] && oChange.getId() === aNewChanges[0].getId()) {
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
			changesToBeReverted : aRevertChanges.reverse(),
			changesToBeApplied : aNewChanges
		};

		return mSwitches;
	};

	VariantController.prototype._applyChangesOnVariant = function(oVariant) {
		var mVariantChanges = oVariant.variantChanges;
		var oActiveChange;
		Object.keys(mVariantChanges).forEach(function(sChangeType) {
			switch (sChangeType) {
				case "setTitle":
					oActiveChange = this._getActiveChange(sChangeType, mVariantChanges);
					if (oActiveChange) {
						oVariant.content.content.title = oActiveChange.getText("title");
					}
					break;
				case "setFavorite":
					oActiveChange = this._getActiveChange(sChangeType, mVariantChanges);
					if (oActiveChange) {
						oVariant.content.content.favorite = oActiveChange.getContent().favorite;
					}
					break;
				case "setVisible":
					oActiveChange = this._getActiveChange(sChangeType, mVariantChanges);
					if (oActiveChange) {
						oVariant.content.content.visible = oActiveChange.getContent().visible;
					}
					break;
				default:
					Log.error("No valid changes on variant " + oVariant.content.content.title + " available");
			}
		}.bind(this));
	};

	VariantController.prototype._applyChangesOnVariantManagement = function(oVariantManagement) {
		var mVariantManagementChanges = oVariantManagement.variantManagementChanges;
		var oActiveChange;
		if (Object.keys(mVariantManagementChanges).length > 0) {
			oActiveChange = this._getActiveChange("setDefault", mVariantManagementChanges);
			if (oActiveChange) {
				oVariantManagement.defaultVariant = oActiveChange.getContent().defaultVariant;
			}
		}
	};

	VariantController.prototype._getActiveChange = function(sChangeType, mChanges) {
		var iLastIndex = mChanges[sChangeType].length - 1;
		if (iLastIndex > -1) {
			return new Change(mChanges[sChangeType][iLastIndex]);
		}
		return false;
	};

	/**
	 * Creates the data for the variant model.
	 *
	 * @returns {Object} JSON object for the variant model
	 * @private
	 */
	VariantController.prototype.fillVariantModel = function() {
		var oVariantData = {};

		Object.keys(this._mVariantManagement).forEach(function(sKey) {
			oVariantData[sKey] = {
				//in case of no variant management change the standard variant is set as default
				defaultVariant : this._mVariantManagement[sKey].defaultVariant,
				variants : []
			};
			//if a current variant is set in the map, it should be set in the model
			if (this._mVariantManagement[sKey].currentVariant) {
				oVariantData[sKey].currentVariant = this._mVariantManagement[sKey].currentVariant;
			}
			this.getVariants(sKey).forEach(function(oVariant, index) {
				oVariantData[sKey].variants[index] =
					//JSON.parse(JSON.stringify()) used to remove undefined properties e.g. standard variant layer
					JSON.parse(
						JSON.stringify({
							key : oVariant.content.fileName,
							title : oVariant.content.content.title,
							layer : oVariant.content.layer,
							favorite : oVariant.content.content.favorite,
							visible : oVariant.content.content.visible,
							author : ObjectPath.get("content.support.user", oVariant)
						})
					);
			});
		}.bind(this));

		return oVariantData;
	};

	VariantController.prototype.updateCurrentVariantInMap = function(sVariantManagementReference, sNewVariantReference) {
		this._mVariantManagement[sVariantManagementReference].currentVariant = sNewVariantReference;
	};

	VariantController.prototype.addChangeToVariant = function (oChange, sVariantManagementReference, sVariantReference) {
		var aNewChanges = this.getVariantChanges(sVariantManagementReference, sVariantReference, true);
		var aChangeFileNames = aNewChanges.map(function (oChange) {
			return oChange.getDefinition().fileName;
		});
		var iIndex = aChangeFileNames.indexOf(oChange.getDefinition().fileName);
		if (iIndex === -1) {
			aNewChanges.push(oChange);
			return this.setVariantChanges(sVariantManagementReference, sVariantReference, aNewChanges);
		}
		return false;
	};

	VariantController.prototype.removeChangeFromVariant = function (oChange, sVariantManagementReference, sVariantReference) {
		var aControlChanges = this.getVariantChanges(sVariantManagementReference, sVariantReference, true);

		aControlChanges = aControlChanges.filter(function (oCurrentChange) {
			return oCurrentChange.getId() !== oChange.getId();
		});

		return this.setVariantChanges(sVariantManagementReference, sVariantReference, aControlChanges);
	};

	VariantController.prototype.addVariantToVariantManagement = function (oVariantData, sVariantManagementReference) {
		var aVariants = this._mVariantManagement[sVariantManagementReference].variants.slice().splice(1);
		var iIndex = this._getIndexToSortVariant(aVariants, oVariantData);

		//Set the whole list of changes to the variant
		if (oVariantData.content.variantReference) {
			var aReferencedVariantChanges = this._getReferencedChanges(sVariantManagementReference, oVariantData);
			oVariantData.controlChanges = aReferencedVariantChanges.concat(oVariantData.controlChanges);
		}

		//Skipping standard variant with iIndex + 1
		this._mVariantManagement[sVariantManagementReference].variants.splice(iIndex + 1, 0, oVariantData);
		return iIndex + 1;
	};

	VariantController.prototype._getIndexToSortVariant = function (aVariants, oVariantData) {
		var iIndex = 0;
		aVariants.some(function (oExistingVariantData, index) {
			if (this.compareVariants(oVariantData, oExistingVariantData) < 0) {
				iIndex = index;
				return true;
			}
			//insert to the end of array
			iIndex = index + 1;
		}.bind(this));
		return iIndex;
	};

	VariantController.prototype.removeVariantFromVariantManagement = function (oVariant, sVariantManagementReference) {
		var iIndex;
		var bFound = this._mVariantManagement[sVariantManagementReference].variants.some(function(oCurrentVariantContent, index) {
			var oCurrentVariant = new Variant(oCurrentVariantContent);
			if (oCurrentVariant.getId() === oVariant.getId()) {
				iIndex = index;
				return true;
			}
		});
		if (bFound) {
			this._mVariantManagement[sVariantManagementReference].variants.splice(iIndex, 1);
		}
		return iIndex;
	};

	/**
	 * Assigns a listener, which is called when variant controller's map is reset at runtime.
	 * @param {function} fnListener - Listener function
	 * @private
	 * @restricted sap.ui.fl.variants.VariantModel
	 */
	VariantController.prototype.assignResetMapListener = function (fnListener) {
		_fnResetMapListener = fnListener;
	};

	/**
	 * Clears variant controller map.
	 * @param {boolean} bResetAtRuntime - Indicates whether the map is reset at runtime
	 * @returns {Promise} Promise which resolves when changes for the current variants are reverted
	 * @public
	 */
	VariantController.prototype.resetMap = function (bResetAtRuntime) {
		if (bResetAtRuntime) {
			return Promise.resolve(_fnResetMapListener());
		}
		this._mVariantManagement = {};
		return Promise.resolve();
	};

	/**
	 * Checks if variant content is required and sets the new content if validated.
	 * @param {object} oChangeFileContent - Changes response object
	 * @param {object} mTechnicalParameters - Technical parameters from the app component
	 * @private
	 * @restricted sap.ui.fl.ChangePersistence
	 */
	VariantController.prototype.checkAndSetVariantContent = function(oChangeFileContent, mTechnicalParameters) {
		var oVariantControllerContent = this.getChangeFileContent();
		var bSetVariantContentCheck = Object.keys(oVariantControllerContent).length === 0 // no content in the variant controller
			|| Object.keys(oVariantControllerContent).every(function (sVariantManagementReference) {
				var aVariants = oVariantControllerContent[sVariantManagementReference].variants;
				return aVariants.length === 1  // there exists only one variant per variant management reference
					&& !aVariants[0].content.layer // standard variant
					&& aVariants[0].controlChanges.length === 0 // no control changes
					&& Object.keys(aVariants[0].variantChanges).length === 0; // no variant changes
			});
		if (bSetVariantContentCheck) {
			this.setChangeFileContent(oChangeFileContent, mTechnicalParameters);
		}
	};

	return VariantController;
}, true);