/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/Utils'
], function(BaseCommand, BaseTreeModifier, flUtils) {
	"use strict";

	/**
	 * Switch control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.command.ControlVariantDuplicate
	 */
	var ControlVariantDuplicate = BaseCommand.extend("sap.ui.rta.command.ControlVariantDuplicate", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				sourceVariantReference : {
					type : "string"
				},
				newVariantReference : {
					type : "string"
				},
				newVariantTitle : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	ControlVariantDuplicate.prototype.MODEL_NAME = "$FlexVariants";

	/**
	 * @override
	 */
	ControlVariantDuplicate.prototype.prepare = function(mFlexSettings, sVariantManagementReference) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantDuplicate.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * @public Triggers the duplication of a variant
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantDuplicate.prototype.execute = function() {
		var oVariantManagementControl = this.getElement(),
		sSourceVariantReference = this.getSourceVariantReference(),
		sNewVariantReference = this.getNewVariantReference();
		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);

		if (!sNewVariantReference) {
			sNewVariantReference = flUtils.createDefaultFileName("Copy");
			this.setNewVariantReference(sNewVariantReference);
		}

		this.sVariantManagementReference = BaseTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;
		this.oModel = this.oAppComponent.getModel(this.MODEL_NAME);

		var mPropertyBag = {
				variantManagementReference : this.sVariantManagementReference,
				appComponent : this.oAppComponent,
				layer : this.sLayer,
				newVariantReference : sNewVariantReference,
				sourceVariantReference : sSourceVariantReference,
				title: this.getNewVariantTitle()
		};

		return this.oModel._copyVariant(mPropertyBag)
			.then(function(aChanges){
				this._oVariantChange = aChanges[0];
				this._aPreparedChanges = aChanges;
			}.bind(this));
	};

	/**
	 * @public Undo logic for the execution
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantDuplicate.prototype.undo = function() {
		if (this._oVariantChange) {
			return this.oModel.removeVariant(this._oVariantChange, this.getSourceVariantReference(), this.sVariantManagementReference)
				.then(function() {
					this._oVariantChange = null;
					this._aPreparedChanges = null;
				}.bind(this));
		}
	};

	return ControlVariantDuplicate;

}, /* bExport= */true);
