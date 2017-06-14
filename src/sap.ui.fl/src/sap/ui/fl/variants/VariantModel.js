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
	 * @param {String} sVariantMgmtRef The variant management Ref
	 * @param {String} sNewVariantRef The newly selected variant Ref
	 * @private
	 */
	VariantModel.prototype._updateCurrentVariant = function(sVariantMgmtRef, sNewVariantRef) {
		this.oData[sVariantMgmtRef].currentVariant = sNewVariantRef;
	};

	/**
	 * Returns the current variant for a given variant management control
	 * @param {String} sVariantMgmtRef The variant management Ref
	 * @returns {String} sVariantRef The current variant Ref
	 * @public
	 */
	VariantModel.prototype.getCurrentVariantRef = function(sVariantMgmtRef) {
		return this.oData[sVariantMgmtRef].currentVariant;
	};

	/**
	 * Returns the variants for a given variant management Ref
	 * @param {String} sVariantMgmtRef The variant management Ref
	 * @param {String} sNewVariantRef The newly selected variant Ref
	 * @returns {promise} Returns promise that resolves after reverting of old variants and applying of new variants is completed
	 * @public
	 */
	VariantModel.prototype.switchToVariant = function(sVariantMgmtRef, sNewVariantRef) {
		var sCurrentVariantRef = this.oData[sVariantMgmtRef].currentVariant;
		var mChangesToBeSwitched = this.oFlexController._oChangePersistence.loadSwitchChangesMapForComponent(sVariantMgmtRef, sCurrentVariantRef, sNewVariantRef);

		var oAppComponent = Utils.getAppComponentForControl(this.oComponent);

		return Promise.resolve()

		.then(this.oFlexController.revertChangesOnControl(mChangesToBeSwitched.aRevert, oAppComponent))

		.then(this.oFlexController.applyVariantChanges(mChangesToBeSwitched.aNew, this.oComponent))

		.then(this._updateCurrentVariant(sVariantMgmtRef, sNewVariantRef));
	};

	return VariantModel;
}, true);
