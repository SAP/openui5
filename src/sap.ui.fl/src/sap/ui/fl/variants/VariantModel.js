/*
 * ! ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/BaseTreeModifier",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/Base"
], function(
	jQuery,
	JSONModel,
	Utils,
	BaseTreeModifier,
	Change,
	BaseChangeHandler
) {
	"use strict";

	/**
	/**
	 * Constructor for a new sap.ui.fl.variants.VariantModel model.
	 * @class Variant Model implementation for JSON format
	 * @extends sap.ui.model.json.JSONModel
	 * @author SAP SE
	 * @version ${version}
	 * @param {object} oData either the URL where to load the JSON from or a JS object
	 * @param {object} oFlexController the FlexController instance for the component which uses the variant model
	 * @param {object} oComponent Component instance that is currently loading
	 * @param {boolean} bObserve whether to observe the JSON data for property changes (experimental)
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.ui.fl.variants.VariantModel
	 * @experimental Since 1.50. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var VariantModel = JSONModel.extend("sap.ui.fl.variants.VariantModel", /** @lends sap.ui.fl.variants.VariantModel.prototype */
	{
		constructor: function(oData, oFlexController, oComponent, bObserve) {
			this.pSequentialImportCompleted = Promise.resolve();
			JSONModel.apply(this, arguments);

			this.bObserve = bObserve;
			this.oFlexController = oFlexController;
			this.oComponent = oComponent;
			this.oVariantController = undefined;
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
			if (oFlexController && oFlexController._oChangePersistence) {
				this.oVariantController = oFlexController._oChangePersistence._oVariantController;
			}

			if (oData && typeof oData == "object") {
				Object.keys(oData).forEach(function(sKey) {
					oData[sKey].modified = false;
					oData[sKey].showFavorites = true;
					oData[sKey].variantsEditable = true;

					if (!oData[sKey].originalDefaultVariant) {
						oData[sKey].originalDefaultVariant = oData[sKey].defaultVariant;
					}

					oData[sKey].variants.forEach(function(oVariant) {
						if (!oData[sKey].currentVariant && (oVariant.key === oData[sKey].defaultVariant)) {
							oData[sKey].currentVariant = oVariant.key;
						}
						oVariant.rename = false;
						oVariant.originalTitle = oVariant.title;
						oVariant.originalFavorite = oVariant.favorite;

						// TODO: decide about execute on selection flag
						// oVariant.originalExecuteOnSelect = oVariant.executeOnSelect;

						// TODO: decide about lifecycle information (shared variants)

					});
				});

				this.setData(oData);
			}
		}
	});

	/**
	 * Updates the storage of the current variant for a given variant management control
	 * @param {String} sVariantManagementReference The variant management Ref
	 * @param {String} sNewVariantReference The newly selected variant Ref
	 * @returns {Promise} Returns Promise that resolves after the variant is updated
	 * @private
	 */
	VariantModel.prototype.updateCurrentVariant = function(sVariantManagementReference, sNewVariantReference) {
		return this._switchToVariant(sVariantManagementReference, sNewVariantReference)
		.then(function() {
			this.oData[sVariantManagementReference].currentVariant = sNewVariantReference;
			this.refresh(true);
		}.bind(this));
	};

	/**
	 * Returns the current variant for a given variant management control
	 * @param {String} sVariantManagementReference The variant management Ref
	 * @returns {String} sVariantReference The current variant Ref
	 * @public
	 */
	VariantModel.prototype.getCurrentVariantReference = function(sVariantManagementReference) {
		return this.oData[sVariantManagementReference].currentVariant;
	};

	VariantModel.prototype.getVariantManagementReference = function(sVariantReference) {
		var sVariantManagementReference = "";
		var iIndex = -1;
		Object.keys(this.oData).some(function(sKey) {
			return this.oData[sKey].variants.some(function(oVariant, index) {
				if (oVariant.key === sVariantReference) {
					sVariantManagementReference = sKey;
					iIndex = index;
					return true;
				}
			});
		}.bind(this));
		return {
				variantManagementReference : sVariantManagementReference,
				variantIndex : iIndex
		};
	};

	VariantModel.prototype.getVariant = function(sVariantReference) {
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		return this.oVariantController.getVariant(sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype.getVariantProperty = function(sVariantReference, sProperty) {
		return this.getVariant(sVariantReference).content[sProperty];
	};

	VariantModel.prototype._addChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		return this.oVariantController.addChangeToVariant(oChange, sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._removeChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		return this.oVariantController.removeChangeFromVariant(oChange, sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._getVariantLabelCount = function(sNexText, sVariantManagementReference) {
		var oData = this.getData();
		return oData[sVariantManagementReference].variants.reduce( function (iCount, oVariant) {
			if (sNexText === oVariant.title) {
				iCount++;
			}
			return iCount;
		}, 0);
	};

	VariantModel.prototype._duplicateVariant = function(mPropertyBag) {
		var sNewVariantReference = mPropertyBag.newVariantReference,
			sSourceVariantReference = mPropertyBag.sourceVariantReference,
			oSourceVariant = this.getVariant(sSourceVariantReference);

		var oDuplicateVariant = {
			content: {},
			controlChanges: JSON.parse(JSON.stringify(oSourceVariant.controlChanges)),
			variantChanges: {}
		};

		var iCurrentLayerComp = Utils.isLayerAboveCurrentLayer(oSourceVariant.content.layer);

		Object.keys(oSourceVariant.content).forEach(function(sKey) {
			if (sKey === "fileName") {
				oDuplicateVariant.content[sKey] = sNewVariantReference;
			} else if (sKey === "variantReference") {
				if (iCurrentLayerComp === 0) {
					oDuplicateVariant.content[sKey] = oSourceVariant.content["variantReference"];
				} else if (iCurrentLayerComp === -1)  {
					oDuplicateVariant.content[sKey] = sSourceVariantReference;
				}
			} else if (sKey === "layer") {
				oDuplicateVariant.content[sKey] = mPropertyBag.layer;
			} else if (sKey === "title") {
				oDuplicateVariant.content[sKey] = oSourceVariant.content[sKey] + " Copy";
			} else {
				oDuplicateVariant.content[sKey] = oSourceVariant.content[sKey];
			}
		});

		var aVariantChanges = oDuplicateVariant.controlChanges.slice();

		var oDuplicateChange = {};
		oDuplicateVariant.controlChanges = aVariantChanges.reduce(function (aSameLayerChanges, oChange) {
			if (Utils.isLayerAboveCurrentLayer(oChange.layer) === 0) {
				oDuplicateChange = jQuery.extend(true, {}, oChange);
				oDuplicateChange.fileName = Utils.createDefaultFileName(oChange.changeType);
				oDuplicateChange.variantReference = oDuplicateVariant.content.fileName;
				if (!oDuplicateChange.support) {
					oDuplicateChange.support = {};
				}
				oDuplicateChange.support.sourceChangeFileName = oChange.fileName;
				aSameLayerChanges.push(oDuplicateChange);
			}
			return aSameLayerChanges;
		}, []);

		return oDuplicateVariant;
	};

	/**
	 * Copies a variant
	 * @param {Object} mPropertyBag with the following properties:
	 * variantManagementControl : oVariantManagementControl
	 * appComponent : oAppComponent
	 * layer : sLayer
	 * newVariantReference : sNewVariantReference
	 * sourceVariantReference : sSourceVariantReference
	 * @returns {sap.ui.fl.Variant} Returns the copied variant
	 * @private
	 */
	VariantModel.prototype._copyVariant = function(mPropertyBag) {
		var oDuplicateVariantData = this._duplicateVariant(mPropertyBag);
		var sVariantManagementReference = BaseTreeModifier.getSelector(mPropertyBag.variantManagementControl, mPropertyBag.appComponent).id;
		var oVariantModelData = {
//			author: mPropertyBag.layer,
			key: oDuplicateVariantData.content.fileName,
			layer: mPropertyBag.layer,
			title: oDuplicateVariantData.content.title,
			originalTitle: oDuplicateVariantData.content.title,
			favorite: true,
			originalFavorite: true,
			rename: true,
			remove: true,
			visible: true
		};

		//Flex Controller
		var oVariant = this.oFlexController.createVariant(oDuplicateVariantData, this.oComponent);

		[oVariant].concat(oVariant.getControlChanges()).forEach(function(oChange) {
			this.oFlexController._oChangePersistence.addDirtyChange(oChange);
		}.bind(this));

		//Variant Controller
		var iIndex = this.oVariantController.addVariantToVariantManagement(oDuplicateVariantData, sVariantManagementReference);

		//Variant Model
		this.oData[sVariantManagementReference].variants.splice(iIndex, 0, oVariantModelData);
		return this.updateCurrentVariant(sVariantManagementReference, oVariant.getId()).then( function () {
			this.checkUpdate(); /*For VariantManagement Control update*/
			return oVariant;
		}.bind(this));
	};

	VariantModel.prototype._removeVariant = function(oVariant, sSourceVariantFileName, sVariantManagementReference) {
		var aChangesToBeDeleted = this.oFlexController._oChangePersistence.getDirtyChanges().filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === oVariant.getId()) ||
					oChange.getId() === oVariant.getId();
		});
		aChangesToBeDeleted.forEach( function(oChange) {
			this.oFlexController._oChangePersistence.deleteChange(oChange);
		}.bind(this));
		var iIndex =  this.oVariantController.removeVariantFromVariantManagement(oVariant, sVariantManagementReference);

		this.oData[sVariantManagementReference].variants.splice(iIndex, 1);
		return this.updateCurrentVariant(sVariantManagementReference, sSourceVariantFileName).then( function () {
			this.checkUpdate(); /*For VariantManagement Control update*/
		}.bind(this));
	};

	VariantModel.prototype.collectModelChanges = function(sVariantManagementReference, sLayer) {
		var oData = this.getData()[sVariantManagementReference];
		var aModelVariants = oData.variants;
		var aChanges = [];
		var mPropertyBag = {};

		aModelVariants.forEach(function(oVariant) {
			if (oVariant.originalTitle !== oVariant.title) {
				mPropertyBag = {
						variantReference : oVariant.key,
						changeType : "setTitle",
						title : oVariant.title,
						originalTitle : oVariant.originalTitle,
						layer : sLayer
				};
				aChanges.push(mPropertyBag);
			}
			if (oVariant.originalFavorite !== oVariant.favorite) {
				mPropertyBag = {
						variantReference : oVariant.key,
						changeType : "setFavorite",
						favorite : oVariant.favorite,
						originalFavorite : oVariant.originalFavorite,
						layer : sLayer
				};
				aChanges.push(mPropertyBag);
			}
			if (!oVariant.visible) {
				mPropertyBag = {
						variantReference : oVariant.key,
						changeType : "setVisible",
						visible : false,
						layer : sLayer
				};
				aChanges.push(mPropertyBag);
			}
		});
		if (oData.originalDefaultVariant !== oData.defaultVariant) {
			mPropertyBag = {
					variantManagementReference : sVariantManagementReference,
					changeType : "setDefault",
					defaultVariant : oData.defaultVariant,
					originalDefaultVariant : oData.originalDefaultVariant,
					layer : sLayer
			};
			aChanges.push(mPropertyBag);
		}

		return aChanges;
	};

	VariantModel.prototype.manageVariants = function(oVariantManagementControl, sVariantManagementReference, sLayer) {
		return new Promise(function(resolve) {
			oVariantManagementControl.attachManage(function(oEvent) {
				var aConfigurationChanges = this.collectModelChanges(sVariantManagementReference, sLayer);
				return resolve(aConfigurationChanges);
			}.bind(this));
			oVariantManagementControl.openManagementDialog(true);
		}.bind(this));
	};

	VariantModel.prototype._setVariantProperties = function(sVariantManagementReference, mPropertyBag, bAddChange) {
		var iVariantIndex = -1;
		var oVariant;
		var oChange = null;
		var oData = this.getData();
		if (mPropertyBag.variantReference) {
			iVariantIndex = this.getVariantManagementReference(mPropertyBag.variantReference).variantIndex;
			oVariant = oData[sVariantManagementReference].variants[iVariantIndex];
		}
		var mNewChangeData = {};
		var mAdditionalChangeContent = {};

		switch (mPropertyBag.changeType) {
			case "setTitle":
				mAdditionalChangeContent.title = mPropertyBag.title;
				//Update Variant Model
				oVariant.title = mPropertyBag.title;
				oVariant.originalTitle = oVariant.title;
				break;
			case "setFavorite":
				mAdditionalChangeContent.favorite = mPropertyBag.favorite;
				//Update Variant Model
				oVariant.favorite = mPropertyBag.favorite;
				oVariant.originalFavorite = oVariant.favorite;
				break;
			case "setVisible":
				mAdditionalChangeContent.visible = mPropertyBag.visible;
				//Update Variant Model
				oVariant.visible = mPropertyBag.visible;
				break;
			case "setDefault":
				mAdditionalChangeContent.defaultVariant = mPropertyBag.defaultVariant;
				//Update Variant Model
				oData[sVariantManagementReference].defaultVariant = mPropertyBag.defaultVariant;
				oData[sVariantManagementReference].originalDefaultVariant = oData[sVariantManagementReference].defaultVariant;
				break;
			default:
				break;
		}

		if (iVariantIndex > -1) {
			var iSortedIndex = this.oVariantController._setVariantData(mNewChangeData, sVariantManagementReference, iVariantIndex);
			oData[sVariantManagementReference].variants.splice(iVariantIndex, 1);
			oData[sVariantManagementReference].variants.splice(iSortedIndex, 0, oVariant);
		} else {
			this.oVariantController._mVariantManagement[sVariantManagementReference].defaultVariant = mPropertyBag.defaultVariant;
		}

		if (bAddChange) {
			//create new change object
			mNewChangeData.changeType = mPropertyBag.changeType;
			mNewChangeData.layer = mPropertyBag.layer;

			if (mPropertyBag.changeType === "setDefault") {
				mNewChangeData.fileType = "ctrl_variant_management_change";
				mNewChangeData.selector = {id : sVariantManagementReference};
			} else {
				if (mPropertyBag.changeType === "setTitle") {
					BaseChangeHandler.setTextInChange(mNewChangeData, "title", mPropertyBag.title, "XFLD");
				}
				mNewChangeData.fileType = "ctrl_variant_change";
				mNewChangeData.selector = {id : mPropertyBag.variantReference};
			}

			oChange = this.oFlexController.createBaseChange(mNewChangeData, mPropertyBag.appComponent);
			//update change with additional content
			oChange.setContent(mAdditionalChangeContent);

			//update VariantController and write change to ChangePersistence
			this.oVariantController._updateChangesForVariantManagementInMap(oChange.getDefinition(), sVariantManagementReference, true);
			this.oFlexController._oChangePersistence.addDirtyChange(oChange);
		} else {
			if (mPropertyBag.change) {
				//update VariantController and write change to ChangePersistence
				this.oVariantController._updateChangesForVariantManagementInMap(mPropertyBag.change.getDefinition(), sVariantManagementReference, false);
				this.oFlexController._oChangePersistence.deleteChange(mPropertyBag.change);
			}
		}

		this.setData(oData);
		this.checkUpdate();

		return oChange;
	};

	/**
	 * Returns the variants for a given variant management Ref
	 * @param {String} sVariantManagementReference The variant management Ref
	 * @param {String} sNewVariantReference The newly selected variant Ref
	 * @returns {promise} Returns Promise that resolves after reverting of old variants and applying of new variants is completed
	 * @public
	 */
	VariantModel.prototype._switchToVariant = function(sVariantManagementReference, sNewVariantReference) {
		var sCurrentVariantReference = this.oData[sVariantManagementReference].currentVariant;
		var mChangesToBeSwitched = this.oFlexController._oChangePersistence.loadSwitchChangesMapForComponent(sVariantManagementReference, sCurrentVariantReference, sNewVariantReference);

		var oAppComponent = Utils.getAppComponentForControl(this.oComponent);

		return Promise.resolve()
		.then(this.oFlexController.revertChangesOnControl.bind(this.oFlexController, mChangesToBeSwitched.aRevert, oAppComponent))
		.then(this.oFlexController.applyVariantChanges.bind(this.oFlexController, mChangesToBeSwitched.aNew, this.oComponent));
	};

	VariantModel.prototype._setModelPropertiesForControl = function(sVariantManagementReference, bAdaptationMode) {
		this.oData[sVariantManagementReference].modified = false;
		this.oData[sVariantManagementReference].showFavorites = true;

		if (bAdaptationMode) {
			this.oData[sVariantManagementReference].variantsEditable = false;
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.rename = true;
			});
		} else {
			this.oData[sVariantManagementReference].variantsEditable = true;
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				//TODO: Check for end-user variant and set to true
				oVariant.rename = false;
			});
		}
	};

	VariantModel.prototype.ensureStandardEntryExists = function(sVariantManagementReference) {
		var oData = this.getData();
		if (!oData[sVariantManagementReference]) { /*Ensure standard variant exists*/
			// Set Standard Data to Model
			oData[sVariantManagementReference] = {
				currentVariant: sVariantManagementReference,
				defaultVariant: sVariantManagementReference,
				originalDefaultVariant: sVariantManagementReference,
				variants: [
					{
//						author: "SAP",
						key: sVariantManagementReference,
						layer: "VENDOR",
						title: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
						originalTitle: this._oResourceBundle.getText("STANDARD_VARIANT_ORIGINAL_TITLE"),
						favorite: true,
						originalFavorite: true,
						rename: false,
						remove: false,
						visible: true
					}
				]
			};
			this._setModelPropertiesForControl(sVariantManagementReference, false);
			this.setData(oData);

			// Set Standard Data to VariantController
			if (this.oVariantController) {
				var oVariantControllerData = {changes: { variantSection: {}}};
				oVariantControllerData.changes.variantSection[sVariantManagementReference] = {
					defaultVariant: sVariantManagementReference,
					variants: [
						{
							content: {
								fileName: sVariantManagementReference,
								title: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
								fileType: "ctrl_variant",
								layer: "VENDOR",
								variantManagementReference: sVariantManagementReference,
								variantReference: "",
								content: {}
							},
							controlChanges: [],
							variantChanges: {}
						}
					]
				};
				this.oVariantController._setChangeFileContent(oVariantControllerData);
			}
		}
	};

	return VariantModel;
}, true);