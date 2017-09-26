/*
 * ! ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/model/json/JSONModel", "sap/ui/fl/Utils", "sap/ui/fl/changeHandler/BaseTreeModifier"
], function(jQuery, JSONModel, Utils, BaseTreeModifier) {
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
		Object.keys(this.oData).some(function(sKey) {
			return this.oData[sKey].variants.some(function(oVariant) {
				if (oVariant.key === sVariantReference) {
					sVariantManagementReference = sKey;
					return true;
				}
			});
		}.bind(this));
		return sVariantManagementReference;
	};

	VariantModel.prototype.getVariant = function(sVariantReference) {
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference);
		return this.oVariantController.getVariant(sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._addChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference);
		return this.oVariantController.addChangeToVariant(oChange, sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._removeChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference);
		return this.oVariantController.removeChangeFromVariant(oChange, sVariantManagementReference, sVariantReference);
	};

	VariantModel.prototype._duplicateVariant = function(sNewVariantFileName, sSourceVariantFileName) {
		var oSourceVariant = this.getVariant(sSourceVariantFileName);

		var oDuplicateVariant = {
			content: {},
			changes: JSON.parse(JSON.stringify(oSourceVariant.changes))
		};

		Object.keys(oSourceVariant.content).forEach(function(sKey) {
			if (sKey === "fileName") {
				oDuplicateVariant.content[sKey] = sNewVariantFileName;
			}else if (sKey === "variantReference") {
				oDuplicateVariant.content[sKey] = sSourceVariantFileName;
			} else if (sKey === "title") {
				oDuplicateVariant.content[sKey] = oSourceVariant.content[sKey] + " Copy";
			} else {
				oDuplicateVariant.content[sKey] = oSourceVariant.content[sKey];
			}
		});

		//Assuming same layer
		oDuplicateVariant.changes.forEach(function	(oChange) {
			oChange.fileName += "_Copy";
			oChange.variantReference = oDuplicateVariant.content.fileName;
		});

		return oDuplicateVariant;
	};

	VariantModel.prototype._copyVariant = function(oElement, oAppComponent, sNewVariantFileName, sSourceVariantFileName) {
		var oDuplicateVariantData = this._duplicateVariant(sNewVariantFileName, sSourceVariantFileName);
		var	sVariantManagementReference = BaseTreeModifier.getSelector(oElement, oAppComponent).id;
		var oVariantModelData = {
			author: "CUSTOMER",
			key: oDuplicateVariantData.content.fileName,
			layer: oDuplicateVariantData.content.layer,
			originalTitle: oDuplicateVariantData.content.title,
			readOnly: false,
			title: oDuplicateVariantData.content.title,
			toBeDeleted: false
		};

		//Flex Controller
		var oVariant = this.oFlexController.createVariant(oDuplicateVariantData, this.oComponent);
		var aChangesToBeAdded = [oVariant].concat(oVariant.getChanges());
		aChangesToBeAdded.forEach( function (oChange) {
			this.oFlexController._oChangePersistence.addDirtyChange(oChange);
		}.bind(this));

		//Variant Controller
		var iIndex = this.oVariantController.addVariantToVariantManagement(oDuplicateVariantData, sVariantManagementReference);

		//Variant Model
		this.oData[sVariantManagementReference].variants.splice(iIndex, 0, oVariantModelData);
		this.updateCurrentVariant(sVariantManagementReference, oVariant.getId());

		this.checkUpdate(); /*For VariantManagement Control update*/

		return oVariant;
	};

	VariantModel.prototype._removeVariant = function(oVariant, sSourceVariantFileName, sVariantManagementReference) {
		var aChangesToBeDeleted = this.oFlexController._oChangePersistence.getDirtyChanges().filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === oVariant.getId()) ||
					oChange.getKey() === oVariant.getKey();
		});
		aChangesToBeDeleted.forEach( function(oChange) {
			this.oFlexController._oChangePersistence.deleteChange(oChange);
		}.bind(this));
		var iIndex =  this.oVariantController.removeVariantFromVariantManagement(oVariant, sVariantManagementReference);

		this.oData[sVariantManagementReference].variants.splice(iIndex, 1);
		this.updateCurrentVariant(sVariantManagementReference, sSourceVariantFileName);

		this.checkUpdate(); /*For VariantManagement Control update*/
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
