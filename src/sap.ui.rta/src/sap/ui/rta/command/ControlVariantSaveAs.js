/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library",
	"sap/ui/rta/Utils"
], function(
	JsControlTreeModifier,
	ContextSharingAPI,
	PersistenceWriteAPI,
	flUtils,
	BaseCommand,
	rtaLibrary,
	rtaUtils
) {
	"use strict";

	/**
	 * Saves a control variant under a different name.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.86
	 * @alias sap.ui.rta.command.ControlVariantSaveAs
	 */
	var ControlVariantSaveAs = BaseCommand.extend("sap.ui.rta.command.ControlVariantSaveAs", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				sourceVariantReference: {
					type: "string"
				},
				sourceDefaultVariant: {
					type: "string"
				},
				model: {
					type: "object"
				},
				newVariantParameters: {
					type: "object"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantSaveAs.prototype.prepare = function(mFlexSettings) {
		this.oVariantManagementControl = this.getElement();
		this.oAppComponent = flUtils.getAppComponentForControl(this.oVariantManagementControl);
		this.sVariantManagementReference = JsControlTreeModifier.getSelector(this.oVariantManagementControl, this.oAppComponent).id;
		this.oModel = this.getModel();
		this.setSourceDefaultVariant(this.oModel.getData()[this.sVariantManagementReference].defaultVariant);
		this.sLayer = mFlexSettings.layer;
		var mComponentPropertyBag = mFlexSettings;
		mComponentPropertyBag.variantManagementControl = this.oVariantManagementControl;

		function storeEventParameters(oEvent, oArgs) {
			var mParameters = oEvent.getParameters();
			this.setNewVariantParameters(mParameters);
			this.oVariantManagementControl.detachSave(storeEventParameters, this);
			this.oVariantManagementControl.detachCancel(handleCancel, this);
			oArgs.resolve(true);
		}
		function handleCancel(oEvent, oArgs) {
			this.oVariantManagementControl.detachSave(storeEventParameters, this);
			this.oVariantManagementControl.detachCancel(handleCancel, this);
			oArgs.resolve(false);
		}

		return new Promise(function(resolve) {
			this.oVariantManagementControl.attachSave({resolve}, storeEventParameters, this);
			this.oVariantManagementControl.attachCancel({resolve}, handleCancel, this);
			this.oVariantManagementControl.openSaveAsDialogForKeyUser(rtaUtils.getRtaStyleClassName(),
				ContextSharingAPI.createComponent(mComponentPropertyBag));
		}.bind(this))
		.then(function(bState) {
			return bState;
		});
	};

	ControlVariantSaveAs.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the SaveAs of a variant.
	 * @public
	 * @returns {Promise} Promise that resolves after execution
	 */
	ControlVariantSaveAs.prototype.execute = function() {
		var sSourceVariantReference = this.getSourceVariantReference();
		// once a change is saved to a variant it will automatically be restored by the VariantModel
		this._aControlChangesWithoutVariant = this.oModel.getVariant(sSourceVariantReference, this.sVariantManagementReference)
		.controlChanges
		.filter((oFlexObject) => !oFlexObject.getSavedToVariant());
		var mParams = this.getNewVariantParameters();
		mParams.layer = this.sLayer;
		mParams.newVariantReference = this.sNewVariantReference;
		mParams.generator = rtaLibrary.GENERATOR_NAME;
		return this.oModel._handleSave(this.oVariantManagementControl, mParams)
		.then(function(aDirtyChanges) {
			this._aPreparedChanges = aDirtyChanges;
			[this._oVariantChange] = aDirtyChanges;
			this.sNewVariantReference = this._oVariantChange.getId();
			this._aPreparedChanges.forEach(function(oChange) {
				if (oChange.getFileType() === "change") {
					oChange.setSavedToVariant(true);
				}
			});
			this.getModel().invalidateMap();
		}.bind(this));
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	ControlVariantSaveAs.prototype.undo = async function() {
		if (this._oVariantChange) {
			var aChangesToBeDeleted = [];
			this._aPreparedChanges.forEach(function(oChange) {
				if (oChange.getFileType() === "ctrl_variant_management_change") {
					aChangesToBeDeleted.push(oChange);
				}
			});
			await PersistenceWriteAPI.remove({
				flexObjects: aChangesToBeDeleted,
				selector: this.oAppComponent
			});

			var mPropertyBag = {
				variant: this._oVariantChange,
				sourceVariantReference: this.getSourceVariantReference(),
				variantManagementReference: this.sVariantManagementReference,
				component: this.oAppComponent
			};

			await this.oModel.removeVariant(mPropertyBag, true);
			await this.oModel.addAndApplyChangesOnVariant(this._aControlChangesWithoutVariant);
			this._aPreparedChanges = null;
			this._oVariantChange = null;
		}
	};

	return ControlVariantSaveAs;
});
