/*
 * ! ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/model/json/JSONModel", "sap/ui/fl/Utils"
], function(jQuery, JSONModel, Utils) {
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
	 * @private
	 */
	VariantModel.prototype.updateCurrentVariant = function(sVariantManagementReference, sNewVariantReference) {
		this._switchToVariant(sVariantManagementReference, sNewVariantReference);
		this.oData[sVariantManagementReference].currentVariant = sNewVariantReference;
		this.refresh(true);
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

	/**
	 * Returns the variants for a given variant management Ref
	 * @param {String} sVariantManagementReference The variant management Ref
	 * @param {String} sNewVariantReference The newly selected variant Ref
	 * @returns {promise} Returns promise that resolves after reverting of old variants and applying of new variants is completed
	 * @public
	 */
	VariantModel.prototype._switchToVariant = function(sVariantManagementReference, sNewVariantReference) {
		var sCurrentVariantReference = this.oData[sVariantManagementReference].currentVariant;
		var mChangesToBeSwitched = this.oFlexController._oChangePersistence.loadSwitchChangesMapForComponent(sVariantManagementReference, sCurrentVariantReference, sNewVariantReference);

		var oAppComponent = Utils.getAppComponentForControl(this.oComponent);

		this.oFlexController.revertChangesOnControl(mChangesToBeSwitched.aRevert, oAppComponent);
		this.oFlexController.applyVariantChanges(mChangesToBeSwitched.aNew, this.oComponent);
	};

	VariantModel.prototype.ensureStandardEntryExists = function(sVariantManagementReference) {
		var oData = this.getData();
		if (!oData[sVariantManagementReference]) {
			// Set Standard Data to Model
			oData[sVariantManagementReference] = {
				modified: false,
				currentVariant: "Standard",
				defaultVariant: "Standard",
				variants: [
					{
						author: "SAP",
						key: "Standard",
						layer: "CUSTOMER",
						originalTitle: "Standard",
						readOnly: true,
						title: "Standard",
						toBeDeleted: false
					}
				]
			};
			this.setData(oData);

			// Set Standard Data to VariantController
			if (this.oVariantController) {
				var oVariantControllerData = {changes: { variantSection: {}}};
				oVariantControllerData.changes.variantSection[sVariantManagementReference] = {
					defaultVariant: "Standard",
					variants: [
						{
							content: {
								fileName: sVariantManagementReference,
								title: "Standard",
								fileType: "variant",
								variantMgmtRef: sVariantManagementReference
							}
						}
					]
				};
				this.oVariantController._setChangeFileContent(oVariantControllerData);
			}
		}
	};

	return VariantModel;
}, true);
