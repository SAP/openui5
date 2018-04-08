/*
 * ! ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/model/json/JSONModel", "sap/ui/fl/Utils", "sap/ui/fl/changeHandler/BaseTreeModifier", "sap/ui/fl/Change", "sap/ui/fl/changeHandler/Base"
], function(jQuery, JSONModel, Utils, BaseTreeModifier, Change, BaseChangeHandler) {
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
			this.bStandardVariantExists = true;
			this.oVariantController = undefined;
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
			if (oFlexController && oFlexController._oChangePersistence) {
				this.oVariantController = oFlexController._oChangePersistence._oVariantController;
			}

			if (oData && typeof oData == "object") {

				Object.keys(oData).forEach(function(sKey) {
					oData[sKey].modified = false;
					oData[sKey].variants.forEach(function(oVariant) {
						if (!oData[sKey].currentVariant && (oVariant.key === oData[sKey].defaultVariant)) {
							oData[sKey].currentVariant = oVariant.key;
						}

						oVariant.toBeDeleted = false;
						oVariant.originalTitle = oVariant.title;

						// TODO: decide favorites handling
						// oVariant.originalFavorite = oVariant.favorite;

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

	VariantModel.prototype._duplicateVariant = function(mPropertyBag) {
		var sNewVariantReference = mPropertyBag.newVariantReference,
			sSourceVariantReference = mPropertyBag.sourceVariantReference,
			oSourceVariant = this.getVariant(sSourceVariantReference);

		var oDuplicateVariant = {
			content: {},
			changes: JSON.parse(JSON.stringify(oSourceVariant.changes)),
			variantChanges: {
				setTitle: []
			}
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

		var aVariantChanges = oDuplicateVariant.changes.slice();

		var oDuplicateChange = {};
		oDuplicateVariant.changes = aVariantChanges.reduce(function (aSameLayerChanges, oChange) {
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
			author: mPropertyBag.layer,
			key: oDuplicateVariantData.content.fileName,
			layer: mPropertyBag.layer,
			originalTitle: oDuplicateVariantData.content.title,
			readOnly: false,
			title: oDuplicateVariantData.content.title,
			toBeDeleted: false
		};

		//Flex Controller
		var oVariant = this.oFlexController.createVariant(oDuplicateVariantData, this.oComponent);

		[oVariant].concat(oVariant.getChanges()).forEach(function(oChange) {
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

	VariantModel.prototype._setVariantProperties = function(sVariantManagementReference, mPropertyBag, bAddChange) {
		var iVariantIndex = this.getVariantManagementReference(mPropertyBag.variantReference).variantIndex;

		var oData = this.getData();
		var mNewChangeData = {
			title : mPropertyBag.title,
			layer : mPropertyBag.layer
		};
		var oChange = null;
		var oVariant = oData[sVariantManagementReference].variants[iVariantIndex];

		oVariant.title = mPropertyBag.title; /*Variant Model*/
		var iSortedIndex = this.oVariantController._setVariantData(mNewChangeData, sVariantManagementReference, iVariantIndex); /*Variant Controller*/

		oData[sVariantManagementReference].variants.splice(iVariantIndex, 1);
		oData[sVariantManagementReference].variants.splice(iSortedIndex, 0, oVariant);

		if (bAddChange) {
			mNewChangeData.changeType = "setTitle";
			mNewChangeData.fileType = "ctrl_variant_change";
			mNewChangeData.fileName = Utils.createDefaultFileName();
			mNewChangeData.variantReference = mPropertyBag.variantReference;
			BaseChangeHandler.setTextInChange(mNewChangeData, "title", mPropertyBag.title, "XFLD");
			oVariant.modified = true;

			oChange = this.oFlexController.createBaseChange(mNewChangeData, mPropertyBag.appComponent);
			this.oFlexController._oChangePersistence.addDirtyChange(oChange);

		} else {
			this.oFlexController._oChangePersistence.deleteChange(mPropertyBag.change);
		}
		this.setData(oData);

		return oChange;
	};

	/**
	 * Returns the variants for a given variant management Ref
	 * @param {String} sVariantManagementReference The variant management Ref
	 * @param {String} sNewVariantReference The newly selected variant Ref
	 * @returns {Promise} Returns Promise that resolves after reverting of old variants and applying of new variants is completed
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

	VariantModel.prototype.ensureStandardEntryExists = function(sVariantManagementReference) {
		var oData = this.getData();
		if (!oData[sVariantManagementReference]) { /*Ensure standard variant exists*/
			this.bStandardVariantExists = false;
			// Set Standard Data to Model
			oData[sVariantManagementReference] = {
				modified: false,
				currentVariant: sVariantManagementReference,
				defaultVariant: sVariantManagementReference,
				variants: [
					{
						//author: "SAP",
						key: sVariantManagementReference,
						//layer: "VENDOR",
						originalTitle: this._oResourceBundle.getText("STANDARD_VARIANT_ORIGINAL_TITLE"),
						readOnly: true,
						title: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
						toBeDeleted: false
					}
				]
			};
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
								variantManagementReference: sVariantManagementReference,
								variantReference: ""
							},
							changes: []
						}
					]
				};
				this.oVariantController._setChangeFileContent(oVariantControllerData);
			}
		}
	};

	return VariantModel;
}, true);
