/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/rta/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/ContextSharingAPI"
], function(
	BaseCommand,
	rtaLibrary,
	JsControlTreeModifier,
	rtaUtils,
	flUtils,
	ContextSharingAPI
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
			this.oVariantManagementControl.attachSave({resolve: resolve}, storeEventParameters, this);
			this.oVariantManagementControl.attachCancel({resolve: resolve}, handleCancel, this);
			this.oVariantManagementControl.openSaveAsDialogForKeyUser(rtaUtils.getRtaStyleClassName(),
				ContextSharingAPI.createComponent(mFlexSettings));
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
		this._aControlChanges = this.oModel.getVariant(sSourceVariantReference, this.sVariantManagementReference).controlChanges;
		var mParams = this.getNewVariantParameters();
		mParams.layer = this.sLayer;
		mParams.newVariantReference = this.sNewVariantReference;
		mParams.generator = rtaLibrary.GENERATOR_NAME;
		return this.oModel._handleSave(this.oVariantManagementControl, mParams)
			.then(function(aDirtyChanges) {
				this._aPreparedChanges = aDirtyChanges;
				this._oVariantChange = aDirtyChanges[0];
				this.sNewVariantReference = this._oVariantChange.getId();
				this._aPreparedChanges.forEach(function(oChange) {
					if (oChange.getFileType() === "change") {
						oChange.assignedToVariant = true;
					}
				});
				// Assigning changes to the variant might have an impact on the modified state
				// Call the check again to make sure it is up to date
				this.getModel().checkDirtyStateForControlModels([this.sVariantManagementReference]);
			}.bind(this));
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	ControlVariantSaveAs.prototype.undo = function() {
		if (this._oVariantChange) {
			this._aPreparedChanges.forEach(function(oChange) {
				if (oChange.getFileType() === "ctrl_variant_management_change") {
					this.oModel.oFlexController.deleteChange(oChange, this.oAppComponent);
				}
			}.bind(this));

			var mPropertyBag = {
				variant: this._oVariantChange,
				sourceVariantReference: this.getSourceVariantReference(),
				variantManagementReference: this.sVariantManagementReference,
				component: this.oAppComponent
			};

			return this.oModel.removeVariant(mPropertyBag, true)
				.then(function() {
					this._aControlChanges.forEach(function(oChange) {
						this.oModel.oFlexController.addPreparedChange(oChange, this.oAppComponent);
						var oControl = sap.ui.getCore().byId(JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), this.oAppComponent));
						this.oModel.oFlexController.applyChange(oChange, oControl);
					}.bind(this));
					this.oModel.getData()[this.sVariantManagementReference].defaultVariant = this.getSourceDefaultVariant();
					this.oModel.getData()[this.sVariantManagementReference].originalDefaultVariant = this.getSourceDefaultVariant();
					this._aPreparedChanges = null;
					this._oVariantChange = null;
					this.getModel().checkUpdate(true);
				}.bind(this));
		}
		return Promise.resolve();
	};

	return ControlVariantSaveAs;
});
