/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/Cache"
], function (
	jQuery,
	Utils,
	Change,
	Variant,
	Cache
) {
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
		this._mVariantManagement = {};
		this._setChangeFileContent(oChangeFileContent, {});
		this.sVariantTechnicalParameterName = "sap-ui-fl-control-variant-id";
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
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

	VariantController.prototype._setChangeFileContent = function (oChangeFileContent, oComponent) {
		var oCacheEntry = Cache.getEntry(this.getComponentName(), this.getAppVersion());
		if (Object.keys(this._mVariantManagement).length === 0) {
			this._mVariantManagement = {};
		}
		if (oChangeFileContent && oChangeFileContent.changes && oChangeFileContent.changes.variantSection) {
			Object.keys(oChangeFileContent.changes.variantSection).forEach(function (sVariantManagementReference) {
				this._mVariantManagement[sVariantManagementReference] = {};
				var oVariantManagementReference = oChangeFileContent.changes.variantSection[sVariantManagementReference];
				var aVariants = oVariantManagementReference.variants.concat();
				var sVariantFromUrl;
				var mTechnicalParameters = Utils.getTechnicalParametersForComponent(oComponent);

				var iIndex = -1;
				aVariants.forEach(function (oVariant, index) {
					if (oVariant.content.fileName === sVariantManagementReference) {
						iIndex = index;
					}
					if (!oVariant.content.content.favorite) {
						oVariant.content.content.favorite = true;
					}
					if (!oVariant.content.content.visible) {
						oVariant.content.content.visible = true;
					}
					var aTitleKeyMatch = oVariant.content.content.title.match(/.i18n>(\w+)./);
					if (aTitleKeyMatch) {
						oVariant.content.content.title = this._oResourceBundle.getText(aTitleKeyMatch[1]);
					}

					this._applyChangesOnVariant(oVariant);

					if (mTechnicalParameters && Array.isArray(mTechnicalParameters[this.sVariantTechnicalParameterName])) {
						// Only the first valid reference for that variant management id passed in the parameters is used to load the changes
						mTechnicalParameters[this.sVariantTechnicalParameterName].some(function (sURLVariant) {
							if (oVariant.content.fileName === sURLVariant) {
								sVariantFromUrl = oVariant.content.fileName;
								return true;
							}
						});
					}

				}.bind(this));
				if (iIndex > -1) {
					var oStandardVariant = aVariants.splice(iIndex, 1)[0];
					aVariants.sort(this.compareVariants);
					aVariants.splice(0, 0, oStandardVariant);
				}
				this._mVariantManagement[sVariantManagementReference].variants = aVariants;
				this._mVariantManagement[sVariantManagementReference].defaultVariant = sVariantManagementReference;
				if (sVariantFromUrl){
					this._mVariantManagement[sVariantManagementReference].currentVariant = sVariantFromUrl;
				}
				this._mVariantManagement[sVariantManagementReference].variantManagementChanges =
					oChangeFileContent.changes.variantSection[sVariantManagementReference].variantManagementChanges;

				//to set default variant from setDefault variantManagement changes
				this._applyChangesOnVariantManagement(this._mVariantManagement[sVariantManagementReference]);
			}.bind(this));
			// Reference cache entry with map - to keep in sync
			oCacheEntry.file.changes.variantSection = this._mVariantManagement;
		}
	};

	VariantController.prototype._getChangeFileContent = function () {
		return this._mVariantManagement;
	};

	VariantController.prototype.compareVariants = function (oVariantData1, oVariantData2) {
		if (oVariantData1.content.content.title.toLowerCase() < oVariantData2.content.content.title.toLowerCase()) {
			return -1;
		} else if (oVariantData1.content.content.title.toLowerCase() > oVariantData2.content.content.title.toLowerCase()) {
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
			return oVariant.controlChanges ? aResult.concat(oVariant.controlChanges) : aResult;
		},[]);
	};

	VariantController.prototype._getReferencedChanges = function(sVariantManagementReference, oCurrentVariant) {
		var aReferencedVariantChanges = [];
		if (oCurrentVariant.content.variantReference) {
			aReferencedVariantChanges = this.getVariantChanges(sVariantManagementReference, oCurrentVariant.content.variantReference);
			return aReferencedVariantChanges.filter( function(oReferencedChange) {
				return Utils.isLayerAboveCurrentLayer(oReferencedChange.layer) === -1; /* Referenced change layer below current layer*/
			});
		}
		return aReferencedVariantChanges;
	};

	VariantController.prototype.setVariantChanges = function(sVariantManagementReference, sVariantReference, aChanges) {
		if (!sVariantManagementReference || !sVariantReference || !jQuery.isArray(aChanges)) {
			Utils.log.error("Cannot set variant changes without Variant reference");
			return;
		}

		return this._mVariantManagement[sVariantManagementReference].variants
			.some(function (oVariant, iIndex) {
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
		} else {
			aVariants.splice(iPreviousIndex, 1, oVariantData);

			return iPreviousIndex;
		}
	};

	VariantController.prototype._updateChangesForVariantManagementInMap = function(oContent, sVariantManagementReference, bAdd) {
		var oVariantManagement = this._mVariantManagement[sVariantManagementReference];
		var sChangeType = oContent.changeType;
		if (oContent.fileType === "ctrl_variant_change") {
			oVariantManagement.variants.some( function(oVariant) {
				if (oVariant.content.fileName === oContent.selector.id) {
					if (!oVariant.variantChanges[sChangeType]) {
						oVariant.variantChanges[sChangeType] = [];
					}
					if (bAdd) {
						oVariant.variantChanges[sChangeType].push(oContent);
					} else {
						oVariant.variantChanges[sChangeType].some( function (oExistingContent, iIndex) {
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
	 * Load the initial changes of all variants
	 * If the application is started with valid variant references, use them
	 * If no references or invalid references were passed, load the changes from
	 * the default variant
	 *
	 * @param {object} oComponent - Component instance used to get the technical parameters
	 * @returns {Array} The array containing all changes of the default variants
	 * @public
	 */
	VariantController.prototype.loadInitialChanges = function() {
		var aInitialChanges = [];

		Object.keys(this._mVariantManagement).forEach(function (sVariantManagementReference) {
			var aInitialVMChanges = [];
			var sVariantReference;

			if (this._mVariantManagement[sVariantManagementReference].currentVariant){
				sVariantReference = this._mVariantManagement[sVariantManagementReference].currentVariant;
			} else {
				sVariantReference = this._mVariantManagement[sVariantManagementReference].defaultVariant;
			}

			//check for visibility of the variant, else use standard variant
			var sVisible = this.getVariant(sVariantManagementReference, sVariantReference).content.content.visible;
			if (!sVisible) {
				if (this._mVariantManagement[sVariantManagementReference].currentVariant) {
					this._mVariantManagement[sVariantManagementReference].currentVariant = sVariantManagementReference;
				} else {
					this._mVariantManagement[sVariantManagementReference].defaultVariant = sVariantManagementReference;
				}
				sVariantReference = sVariantManagementReference;
			}

			aInitialVMChanges = this.getVariantChanges(sVariantManagementReference, sVariantReference);

			// Concatenate the changes for all valid or default variants of all variant management references
			aInitialChanges = aInitialChanges.concat(aInitialVMChanges);
		}.bind(this));

		return aInitialChanges;
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
		var aCurrentVariantChanges = this.getVariantChanges(sVariantManagementReference, sCurrentVariant);
		var aMapChanges = [], aChangeKeysFromMap = [];
		Object.keys(mChanges).forEach(function(sControlId) {
			mChanges[sControlId].forEach(function(oMapChange) {
				aMapChanges = aMapChanges.concat(oMapChange);
				aChangeKeysFromMap = aChangeKeysFromMap.concat(oMapChange.getId());
			});
		});

		aCurrentVariantChanges = aCurrentVariantChanges.reduce(function(aFilteredChanges, oChangeContent, index) {
			var iMapIndex = aChangeKeysFromMap.indexOf(oChangeContent.fileName);
			if (iMapIndex > -1) {
				aFilteredChanges = aFilteredChanges.concat(aMapChanges[iMapIndex]);
			}
			return aFilteredChanges;
		}, []);

		var aNewChanges = this.getVariantChanges(sVariantManagementReference, sNewVariant).map(function(oChangeContent) {
			return new Change(oChangeContent);
		});

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
			aRevert : aRevertChanges.reverse(),
			aNew : aNewChanges
		};

		return mSwitches;
	};

	VariantController.prototype._applyChangesOnVariant = function(oVariant) {
		var mVariantChanges = oVariant.variantChanges,
			oActiveChange;
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
					Utils.log.error("No valid changes on variant " + oVariant.content.content.title + " available");
			}
		}.bind(this));
	};

	VariantController.prototype._applyChangesOnVariantManagement = function(oVariantManagement) {
		var mVariantManagementChanges = oVariantManagement.variantManagementChanges,
			oActiveChange;
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
	 * Creates the data for the variant model
	 *
	 * @returns {Object} oVariantData The JSON object for the Variant Model
	 * @private
	 */
	VariantController.prototype._fillVariantModel = function() {
		var oVariantData = {};

		Object.keys(this._mVariantManagement).forEach(function(sKey) {
			oVariantData[sKey] = {
				//in case of no variant management change the standard variant is set as default
				defaultVariant : this._mVariantManagement[sKey].defaultVariant,
				variants : []
			};
			//if a current variant is set in the map, it should be set in the model
			if (this._mVariantManagement[sKey].currentVariant){
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
							visible : oVariant.content.content.visible
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
			if (oCurrentChange.getId
				&& (oCurrentChange.getId() === oChange.getId())) {
				aNewChanges.splice(iIndex, 1);
			}
		});

		return this.setVariantChanges(sVariantManagementReference, sVariantReference, aNewChanges);
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

	return VariantController;
}, true);