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
				duplicateVariant : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});

	ControlVariantDuplicate.prototype.MODEL_NAME = "$FlexVariants";

	ControlVariantDuplicate.prototype._getAppComponent = function(oElement) {
		if (!this._oControlAppComponent) {
			this._oControlAppComponent = oElement ? flUtils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
		}
		return this._oControlAppComponent;
	};

	/**
	 * @public Template Method to implement execute logic, with ensure precondition Element is available
	 * @returns {promise} Returns resolve after execution
	 */
	ControlVariantDuplicate.prototype.execute = function() {
		var oElement = this.getElement(),
			oAppComponent = this._getAppComponent(oElement),
			sSourceVariantReference = this.getSourceVariantReference(),
			sNewVariantFileReference = this.getNewVariantReference();

		if (!sNewVariantFileReference) {
			sNewVariantFileReference = flUtils.createDefaultFileName(sSourceVariantReference + "_Copy");
			this.setNewVariantReference(sNewVariantFileReference);
		}

		this.sVariantManagementReference = BaseTreeModifier.getSelector(oElement, oAppComponent).id;
		this.oModel = oAppComponent.getModel(this.MODEL_NAME);

		return Promise.resolve(this.oModel._copyVariant(oElement, oAppComponent, sNewVariantFileReference, sSourceVariantReference))
			.then(function(oVariant){
				this.setDuplicateVariant(oVariant);
			}.bind(this));
	};

	/**
	 * @public Template Method to implement undo logic
	 * @returns {promise} Returns resolve after undo
	 */
	ControlVariantDuplicate.prototype.undo = function() {
		if (this.getDuplicateVariant()) {
			return Promise.resolve(this.oModel._removeVariant(this.getDuplicateVariant(), this.getSourceVariantReference(), this.sVariantManagementReference))
				.then(function() {
					this.setDuplicateVariant(null);
				}.bind(this));
		}
	};

	return ControlVariantDuplicate;

}, /* bExport= */true);
