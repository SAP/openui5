/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/Utils",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/core/BusyIndicator",
	"sap/ui/fl/variants/util/VariantUtil",
	"sap/base/util/merge"
], function(
	jQuery,
	JSONModel,
	Utils,
	JsControlTreeModifier,
	Change,
	BaseChangeHandler,
	BusyIndicator,
	VariantUtil,
	fnBaseMerge
) {
	"use strict";

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
	 * @private
	 * @ui5-restricted
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
				this.sVariantTechnicalParameterName = this.oVariantController.sVariantTechnicalParameterName;
			}

			//initialize hash register
			VariantUtil.initializeHashRegister.call(this);

			if (oData && typeof oData == "object") {
				Object.keys(oData).forEach(function(sKey) {
					oData[sKey].variants.forEach(function(oVariant) {
						if (!oData[sKey].currentVariant && (oVariant.key === oData[sKey].defaultVariant)) { /*Case when initial variant is not set from URL*/
							oData[sKey].currentVariant = oVariant.key;
						}
						oVariant.originalTitle = oVariant.title;
						oVariant.originalFavorite = oVariant.favorite;
					});
					oData[sKey].originalCurrentVariant = oData[sKey].currentVariant;
					oData[sKey].originalDefaultVariant = oData[sKey].defaultVariant;
				});

				this.setData(oData);
			}
		}
	});

	/**
	 * Updates the storage of the current variant for a given variant management control
	 * @param {String} sVariantManagementReference - Variant management reference
	 * @param {String} sNewVariantReference - Newly selected variant reference
	 * @param {sap.ui.core.Component} [oControlComponent] - Component responsible for the variant management reference
	 *
	 * @returns {Promise} Returns Promise that resolves after the variant is updated
	 * @private
	 */
	VariantModel.prototype.updateCurrentVariant = function(sVariantManagementReference, sNewVariantReference, oControlComponent) {
		var sCurrentVariantReference, mChangesToBeSwitched;
		var aVariantControlChanges;

		sCurrentVariantReference = this.oData[sVariantManagementReference].originalCurrentVariant;

		// Delete dirty personalized changes
		// Triggered from _handleCurrentVariantChange
		if (this.oData[sVariantManagementReference].modified) {
			aVariantControlChanges = this.oVariantController.getVariantChanges(sVariantManagementReference, sCurrentVariantReference);
			this._removeDirtyChanges(aVariantControlChanges, sVariantManagementReference, sCurrentVariantReference, oControlComponent);
			this.oData[sVariantManagementReference].modified = false;
		}

		var mPropertyBag = {
			variantManagementReference: sVariantManagementReference,
			currentVariantReference: sCurrentVariantReference,
			newVariantReference: sNewVariantReference,
			// passed control component OR embedded components with application component OR model component
			component: oControlComponent // passed control component
			|| (
				Array.isArray(this._oEmbeddedComponents)
					? this._oEmbeddedComponents.concat([this.oComponent]) // embedded components with application component
					: this.oComponent // model component
			)
		};
		mChangesToBeSwitched = this.oFlexController._oChangePersistence.loadSwitchChangesMapForComponent(mPropertyBag);

		return Promise.resolve()
			.then(this.oFlexController.revertChangesOnControl.bind(this.oFlexController, mChangesToBeSwitched.aRevert, mChangesToBeSwitched.component))
			.then(this.oFlexController.applyVariantChanges.bind(this.oFlexController, mChangesToBeSwitched.aNew, mChangesToBeSwitched.component))
			.then(function() {
				this.oData[sVariantManagementReference].originalCurrentVariant = sNewVariantReference;
				this.oData[sVariantManagementReference].currentVariant = sNewVariantReference;
				if (this.oData[sVariantManagementReference].updateVariantInURL) {
					this._updateVariantInURL(sVariantManagementReference, sNewVariantReference);
					this.oVariantController.updateCurrentVariantInMap(sVariantManagementReference, sNewVariantReference);
				}
				this.checkUpdate();
			}.bind(this));
	};

	VariantModel.prototype._updateVariantInURL = function (sVariantManagementReference, sNewVariantReference) {
		var mTechnicalParametersWithIndex = this.getVariantIndexInURL(sVariantManagementReference);

		if (!mTechnicalParametersWithIndex.parameters) {
			// Case when app is in standalone mode
			return;
		}

		// Check if variant parameters already exist
		var aParameterValues = Array.isArray(mTechnicalParametersWithIndex.parameters[this.sVariantTechnicalParameterName])
			? mTechnicalParametersWithIndex.parameters[this.sVariantTechnicalParameterName].slice(0)
			: [];
		var iIndex = mTechnicalParametersWithIndex.index;

		// Default variant should not be added as parameter to the URL (no parameter => default)
		if (sNewVariantReference === this.oData[sVariantManagementReference].defaultVariant) {
			if (iIndex === -1) {
				return; //Since no parameter is there for the control, the function can return
			}
			aParameterValues.splice(iIndex, 1);
		} else {
			iIndex === -1
				? aParameterValues.push(sNewVariantReference)
				: (aParameterValues[iIndex] = sNewVariantReference);
		}

		this.updateHasherEntry({
			parameters: aParameterValues,
			updateURL: !this._bAdaptationMode
		});
	};

	VariantModel.prototype.updateHasherEntry = function() {
		VariantUtil.updateHasherEntry.apply(this, arguments);
	};

	VariantModel.prototype.getVariantIndexInURL = function (sVariantManagementReference) {
		// if ushell container is not present an empty object is returned
		var mHashParameters = Utils.getParsedURLHash().params;
		var iParamIndex = -1;

		if (mHashParameters) {
			// in UI Adaptation the parameters are empty, so the current URL parameters are retrieved from hash register
			if (this._bAdaptationMode) {
				mHashParameters = {};
				mHashParameters[this.sVariantTechnicalParameterName] = VariantUtil.getCurrentHashParamsFromRegister.call(this);
			}

			if (!jQuery.isEmptyObject(mHashParameters) && Array.isArray(mHashParameters[this.sVariantTechnicalParameterName])) {
				mHashParameters[this.sVariantTechnicalParameterName] = mHashParameters[this.sVariantTechnicalParameterName].reduce(function (aVariantParameters, sParam, iIndex) {
					var sParamDecoded = decodeURIComponent(sParam);
					// if parameter index has not been found and a variant exists for the combination of variant reference and variant parameter
					if (iParamIndex === -1
						&& !!this.oVariantController.getVariant(sVariantManagementReference, sParamDecoded)) {
						iParamIndex = iIndex;
					}
					// return decoded parameter values
					return aVariantParameters.concat(sParamDecoded);
				}.bind(this), []);
			}
		}

		return {
			parameters: mHashParameters,
			index: iParamIndex
		};
	};

	/**
	 * Returns the current variant for a given variant management control
	 * @param {string} sVariantManagementReference The variant management reference
	 * @returns {string} The current variant reference
	 * @public
	 */
	VariantModel.prototype.getCurrentVariantReference = function(sVariantManagementReference){
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

	VariantModel.prototype.getVariant = function(sVariantReference, sVariantManagementReference) {
		return this.oVariantController.getVariant(
			sVariantManagementReference
				? sVariantManagementReference
				: this.getVariantManagementReference(sVariantReference).variantManagementReference,
			sVariantReference
		);
	};

	VariantModel.prototype.getVariantProperty = function(sVariantReference, sProperty) {
		return this.getVariant(sVariantReference).content.content[sProperty];
	};

	VariantModel.prototype._addChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		//*marker for VariantManagement control
		this.oData[sVariantManagementReference].modified = !!this.oData[sVariantManagementReference].variantsEditable;
		this.checkUpdate(true);
		return this.oVariantController.addChangeToVariant(oChange, sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._removeChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		return this.oVariantController.removeChangeFromVariant(oChange, sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._removeDirtyChanges = function(aVariantControlChanges, sVariantManagementReference, sVariantReference, oControlComponent) {
		var aChanges = aVariantControlChanges.map(function(oChange) {
			return oChange.fileName;
		});

		var bFiltered;
		var aDirtyChanges = this.oFlexController._oChangePersistence.getDirtyChanges().filter(function(oChange) {
			bFiltered = aChanges.indexOf(oChange.getDefinition().fileName) > -1;
			if (bFiltered) {
				this.oVariantController.removeChangeFromVariant(oChange, sVariantManagementReference, sVariantReference);
			}
			return bFiltered;
		}.bind(this));

		aDirtyChanges.forEach(function(oChange) {
			this.oFlexController.deleteChange(oChange, oControlComponent);
		}.bind(this));

		return this.oFlexController.revertChangesOnControl(aDirtyChanges.reverse(), oControlComponent);
	};

	VariantModel.prototype._getVariantTitleCount = function(sNewText, sVariantManagementReference) {
		var oData = this.getData();
		return oData[sVariantManagementReference].variants.reduce( function (iCount, oVariant) {
			if (sNewText.toLowerCase() === oVariant.title.toLowerCase() && oVariant.visible) {
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

		var iCurrentLayerComp = Utils.compareAgainstCurrentLayer(oSourceVariant.content.layer);

		Object.keys(oSourceVariant.content).forEach(function(sKey) {
			if (sKey === "fileName") {
				oDuplicateVariant.content[sKey] = sNewVariantReference;
			} else if (sKey === "variantReference") {
				if (iCurrentLayerComp === 0) {
					oDuplicateVariant.content[sKey] = oSourceVariant.content["variantReference"];
				} else if (iCurrentLayerComp === -1)  {
					oDuplicateVariant.content[sKey] = sSourceVariantReference;
				}
			} else if (sKey === "content") {
				oDuplicateVariant.content[sKey] = JSON.parse(JSON.stringify(oSourceVariant.content[sKey]));
				oDuplicateVariant.content.content.title = mPropertyBag.title;
			} else {
				oDuplicateVariant.content[sKey] = oSourceVariant.content[sKey];
			}
		});
		oDuplicateVariant.content["layer"] = mPropertyBag.layer;

		var aVariantChanges = oDuplicateVariant.controlChanges.slice();

		var oDuplicateChange = {};
		oDuplicateVariant.controlChanges = aVariantChanges.reduce(function (aSameLayerChanges, oChange) {
			if (Utils.compareAgainstCurrentLayer(oChange.layer) === 0) {
				oDuplicateChange = fnBaseMerge({}, oChange);
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
		var oVariantModelData = {
			key: oDuplicateVariantData.content.fileName,
			layer: mPropertyBag.layer,
			title: oDuplicateVariantData.content.content.title,
			originalTitle: oDuplicateVariantData.content.content.title,
			favorite: true,
			originalFavorite: true,
			rename: true,
			change: true,
			remove: true,
			visible: true
		};

		//Flex Controller
		var oVariant = this.oFlexController.createVariant(oDuplicateVariantData, mPropertyBag.appComponent);

		var aChanges = [];
		[oVariant].concat(oVariant.getControlChanges()).forEach(function(oChange) {
			aChanges.push(this.oFlexController._oChangePersistence.addDirtyChange(oChange));
		}.bind(this));

		//Variant Controller
		var iIndex = this.oVariantController.addVariantToVariantManagement(oVariant.getDefinitionWithChanges(), mPropertyBag.variantManagementReference);

		//Variant Model
		this.oData[mPropertyBag.variantManagementReference].variants.splice(iIndex, 0, oVariantModelData);
		return this.updateCurrentVariant(mPropertyBag.variantManagementReference, oVariant.getId(), mPropertyBag.appComponent).then( function () {
			return aChanges;
		});
	};

	VariantModel.prototype.removeVariant = function(mPropertyBag) {
		var aChangesToBeDeleted = this.oFlexController._oChangePersistence.getDirtyChanges().filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === mPropertyBag.variant.getId()) ||
					oChange.getId() === mPropertyBag.variant.getId();
		});
		aChangesToBeDeleted.forEach( function(oChange) {
			this.oFlexController._oChangePersistence.deleteChange(oChange);
		}.bind(this));

		return this.updateCurrentVariant(mPropertyBag.variantManagementReference, mPropertyBag.sourceVariantReference, mPropertyBag.component).then( function () {
			var iIndex =  this.oVariantController.removeVariantFromVariantManagement(mPropertyBag.variant, mPropertyBag.variantManagementReference); /* VariantController */
			this.oData[mPropertyBag.variantManagementReference].variants.splice(iIndex, 1); /* VariantModel */
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
			oVariantManagementControl.attachManage({
				resolve: resolve,
				variantManagementReference: sVariantManagementReference,
				layer: sLayer
			}, this.fnManageClickRta, this);
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
				mAdditionalChangeContent.createdByReset = false; // 'createdbyReset' is used by the backend to distinguish between setVisible change created via reset and delete
				//Update Variant Model
				oVariant.visible = mPropertyBag.visible;
				break;
			case "setDefault":
				mAdditionalChangeContent.defaultVariant = mPropertyBag.defaultVariant;
				//Update Variant Model
				oData[sVariantManagementReference].defaultVariant = mPropertyBag.defaultVariant;
				oData[sVariantManagementReference].originalDefaultVariant = oData[sVariantManagementReference].defaultVariant;
				//Update hash register
				var aHashParameters = VariantUtil.getCurrentHashParamsFromRegister.call(this);
				if (aHashParameters) {
					if (
						oData[sVariantManagementReference].defaultVariant !== oData[sVariantManagementReference].currentVariant
						&& aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant) === -1
					) {
						// if default variant is changed from the current variant, then add the current variant id as a variant URI parameter
						this.updateHasherEntry({
							parameters: aHashParameters.concat(oData[sVariantManagementReference].currentVariant),
							updateURL: !this._bAdaptationMode
						});
					} else if (
						oData[sVariantManagementReference].defaultVariant === oData[sVariantManagementReference].currentVariant
						&& aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant) > -1
					) {
						// if current variant is now the default variant, then remove the current variant id as a variant URI parameter
						aHashParameters.splice(aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant), 1);
						this.updateHasherEntry({
							parameters: aHashParameters,
							updateURL: !this._bAdaptationMode
						});
					}
				}
				break;
			default:
				break;
		}

		if (iVariantIndex > -1) {
			// set data in variant controller map - which returns the variant index
			var iSortedIndex = this.oVariantController._setVariantData(mAdditionalChangeContent, sVariantManagementReference, iVariantIndex);
			// modify data variable
			oData[sVariantManagementReference].variants.splice(iVariantIndex, 1);
			oData[sVariantManagementReference].variants.splice(iSortedIndex, 0, oVariant);
		} else if (this.oVariantController._mVariantManagement[sVariantManagementReference]) {
			// for 'setDefault'
			this.oVariantController._mVariantManagement[sVariantManagementReference].defaultVariant = mPropertyBag.defaultVariant;
		}

		// add change
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
			// delete change
			if (mPropertyBag.change) {
				//update VariantController and write change to ChangePersistence
				this.oVariantController._updateChangesForVariantManagementInMap(mPropertyBag.change.getDefinition(), sVariantManagementReference, false);
				this.oFlexController._oChangePersistence.deleteChange(mPropertyBag.change);
			}
		}
		// set data to variant model
		this.setData(oData);
		this.checkUpdate(true);

		return oChange;
	};

	VariantModel.prototype._ensureStandardVariantExists = function(sVariantManagementReference) {
		var oData = this.getData();
		if (!oData[sVariantManagementReference]) { /*Ensure standard variant exists*/
			// Set Standard Data to VariantModel
			oData[sVariantManagementReference] = {
				currentVariant: sVariantManagementReference,
				originalCurrentVariant: sVariantManagementReference,
				defaultVariant: sVariantManagementReference,
				originalDefaultVariant: sVariantManagementReference,
				variants: [
					{
						key: sVariantManagementReference,
						title: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
						originalTitle: this._oResourceBundle.getText("STANDARD_VARIANT_ORIGINAL_TITLE"),
						favorite: true,
						originalFavorite: true,
						visible: true
					}
				]
			};
			this.setData(oData);

			if (this.oVariantController) {
				var oVariantControllerData = {changes: { variantSection: {}}};

				var oDefaultObj = {
					defaultVariant: sVariantManagementReference,
					variantManagementChanges: {},
					variants: [
						{
							content: {
								fileName: sVariantManagementReference,
								fileType: "ctrl_variant",
								variantManagementReference: sVariantManagementReference,
								variantReference: "",
								content: {
									title: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE")
								}
							},
							controlChanges: [],
							variantChanges: {}
						}
					]
				};
				// Set Standard Data to VariantController
				oVariantControllerData.changes.variantSection[sVariantManagementReference] = oDefaultObj;
				this.oVariantController._setChangeFileContent(oVariantControllerData, {});
			}
		}
	};

	VariantModel.prototype._setModelPropertiesForControl = function(sVariantManagementReference, bAdaptationMode, oControl) {
		var fnRemove = function(oVariant, sVariantManagementReference, bAdaptationMode) {
			if ((oVariant.layer === Utils.getCurrentLayer(!bAdaptationMode)) && (oVariant.key !== sVariantManagementReference)) {
				return true;
			} else {
				return false;
			}
		};

		this.oData[sVariantManagementReference].modified = false;
		this.oData[sVariantManagementReference].showFavorites = true;

		// only first time - should not be executed for each variant management control
		if (this._bAdaptationMode !== bAdaptationMode) {
			var mPropertyBag = {};
			if (bAdaptationMode) {
				// Clear the URL parameter on adaptation mode (set to default variant = clear)
				mPropertyBag = {
					parameters: [],
					updateURL: true,
					ignoreRegisterUpdate: true
				};
			} else if (this._bAdaptationMode) { // initially this._bAdaptationMode is undefined
				mPropertyBag = {
					parameters: VariantUtil.getCurrentHashParamsFromRegister.call(this),
					updateURL: true,
					ignoreRegisterUpdate: true
				};
			}
			this.updateHasherEntry(mPropertyBag);
			this._bAdaptationMode = bAdaptationMode;
		}

		if (!(typeof this.fnManageClick === "function" && typeof this.fnManageClickRta === "function")) {
			this._initializeManageVariantsEvents();
		}
		oControl.detachManage(this.fnManageClick, this); /* attach done below */
		oControl.detachManage(this.fnManageClickRta, this); /* attach done in this.manageVariants() */

		if (bAdaptationMode) {
			// Runtime Adaptation Settings
			this.oData[sVariantManagementReference].variantsEditable = false;

			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.rename = true;
				oVariant.change = true;
				oVariant.remove = fnRemove(oVariant, sVariantManagementReference, bAdaptationMode);
			});
		} else {
			// Personalization Settings
			if (this.oData[sVariantManagementReference]._isEditable) {
				oControl.attachManage({
					variantManagementReference: sVariantManagementReference
				}, this.fnManageClick, this);

				this.oData[sVariantManagementReference].variantsEditable = true;
				this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
					oVariant.remove = fnRemove(oVariant, sVariantManagementReference, bAdaptationMode);
					// Check for end-user variant
					if (oVariant.layer === Utils.getCurrentLayer(true)) {
						oVariant.rename = true;
						oVariant.change = true;
					} else {
						oVariant.rename = false;
						oVariant.change = false;
					}
				});
			} else {
				this.oData[sVariantManagementReference].variantsEditable = false;
				this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
					oVariant.remove = false;
					oVariant.rename = false;
					oVariant.change = false;
				});
			}
		}
	};

	VariantModel.prototype._initializeManageVariantsEvents = function() {
		this.fnManageClickRta = function(oEvent, oData) {
			var aConfiguredChanges = this.collectModelChanges(oData.variantManagementReference, oData.layer);
			oData.resolve(aConfiguredChanges);
		};

		this.fnManageClick = function(oEvent, oData) {
			if (!this.oFlexController || !this.oVariantController) {
				return;
			}
			var aConfigurationChanges = this.collectModelChanges(oData.variantManagementReference, Utils.getCurrentLayer(true));
			aConfigurationChanges.forEach(function(oChangeProperties) {
				oChangeProperties.appComponent = this.oComponent;
				this._setVariantProperties(oData.variantManagementReference, oChangeProperties, true);
			}.bind(this));
			this.oFlexController._oChangePersistence.saveDirtyChanges();
		};
	};

	VariantModel.prototype._handleCurrentVariantChange = function(oEvent, mControl) {
		var oPropertyBinding = oEvent.getSource();
		var sVariantManagementReference = oPropertyBinding.getContext().getPath().replace(/^\//, '');

		if (this.oData[sVariantManagementReference].currentVariant !== this.oData[sVariantManagementReference].originalCurrentVariant) {
			this.updateCurrentVariant(sVariantManagementReference, oPropertyBinding.getValue(), Utils.getSelectorComponentForControl(mControl.control));
		}
	};

	VariantModel.prototype._handleSave = function(oEvent) {
		var oVariantManagementControl = oEvent.getSource();
		var bSetDefault = oEvent.getParameter("def");
		var oComponent = Utils.getSelectorComponentForControl(oVariantManagementControl);
		var sVariantManagementReference = this._getLocalId(oVariantManagementControl.getId(), oComponent);
		var sSourceVariantReference = this.getCurrentVariantReference(sVariantManagementReference);
		var aVariantChanges = this.oVariantController.getVariantChanges(sVariantManagementReference, sSourceVariantReference);

		if (oEvent.getParameter("overwrite")) {
			// handle triggered "Save" button
			var aAllDirtyChanges = this.oFlexController._oChangePersistence.getDirtyChanges();
			var aChangeIds = aVariantChanges.map(function(oChange) {
				return oChange.fileName;
			});
			var aDirtyChanges = aAllDirtyChanges.reduce(function(aReducedDirtyChanges, oDirtyChange) {
				if (aChangeIds.indexOf(oDirtyChange.getId()) > -1) {
					return aReducedDirtyChanges.concat(oDirtyChange);
				} else {
					return aReducedDirtyChanges;
				}
			}, []);
			this.oFlexController._oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges);
			this.oData[sVariantManagementReference].modified = false;
			this.checkUpdate(true);
			return Promise.resolve();
		} else {
			// handle triggered "SaveAs" button
			var sNewVariantReference = Utils.createDefaultFileName("Copy");
			var mPropertyBag = {
					variantManagementReference: sVariantManagementReference,
					appComponent: oComponent,
					layer: Utils.getCurrentLayer(true),
					title: oEvent.getParameter("name"),
					sourceVariantReference: sSourceVariantReference,
					newVariantReference: sNewVariantReference
			};

			return this._copyVariant(mPropertyBag).then(function(aDirtyChanges) {
				return this._removeDirtyChanges(aVariantChanges, sVariantManagementReference, sSourceVariantReference, mPropertyBag.appComponent).then(function() {
					if (bSetDefault) {
						var mPropertyBagSetDefault = {
							changeType: "setDefault",
							defaultVariant: sNewVariantReference,
							originalDefaultVariant: this.oData[sVariantManagementReference].defaultVariant,
							appComponent: oComponent,
							layer: Utils.getCurrentLayer(true),
							variantManagementReference: sVariantManagementReference
						};
						var oSetDefaultChange = this._setVariantProperties(sVariantManagementReference, mPropertyBagSetDefault, true);
						aDirtyChanges.push(oSetDefaultChange);
					}
					this.oFlexController._oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges);
					this.oData[sVariantManagementReference].modified = false;
					this.checkUpdate(true);
					return Promise.resolve();
				}.bind(this));
			}.bind(this));
		}
	};

	VariantModel.prototype._getLocalId = function(sId, oAppComponent) {
		return JsControlTreeModifier.getSelector(sId, oAppComponent).id;
	};

	VariantModel.prototype.switchToDefaultForVariantManagement = function (sVariantManagementReference) {
		BusyIndicator.show(200);
		this.updateCurrentVariant(sVariantManagementReference, this.oData[sVariantManagementReference].defaultVariant)
			.then(function () {
				BusyIndicator.hide();
			});
	};

	VariantModel.prototype.switchToDefaultForVariant = function(sVariantId) {
		Object.keys(this.oData).forEach(function (sVariantManagementReference) {
			// set default variant only if passed variant id matches the current variant, or
			// if no variant id passed, set to default variant
			if (!sVariantId || this.oData[sVariantManagementReference].currentVariant === sVariantId) {
				this.switchToDefaultForVariantManagement.call(this, sVariantManagementReference);
			}
		}.bind(this));
	};

	VariantModel.prototype.registerToModel = function(oVariantManagementControl) {
		var sVariantManagementReference =
			this._getLocalId(oVariantManagementControl, Utils.getSelectorComponentForControl(oVariantManagementControl));

		this._ensureStandardVariantExists(sVariantManagementReference);

		if (oVariantManagementControl) {
			//original setting of control parameter 'editable' is needed
			this.oData[sVariantManagementReference]._isEditable = oVariantManagementControl.getEditable();

			//attach binding change event on VariantManagement control title
			oVariantManagementControl.getTitle().getBinding("text").attachEvent("change", {control: oVariantManagementControl}, this._handleCurrentVariantChange, this);

			this._setModelPropertiesForControl(sVariantManagementReference, false, oVariantManagementControl);

			oVariantManagementControl.attachSave(this._handleSave, this);

			//control property updateVariantInURL set initially
			if (oVariantManagementControl.getUpdateVariantInURL()) {
				this.oData[sVariantManagementReference].updateVariantInURL = true;
				VariantUtil.attachHashHandlers.call(this, sVariantManagementReference);
			}
		}
	};

	VariantModel.prototype.addEmbeddedComponent = function (oComponent) {
		if (!Array.isArray(this._oEmbeddedComponents)) {
			this._oEmbeddedComponents = [];
		}
		this._oEmbeddedComponents.push(oComponent);
	};

	return VariantModel;
}, true);