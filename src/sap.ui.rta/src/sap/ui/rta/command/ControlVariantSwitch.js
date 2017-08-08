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
	 * @since 1.50
	 * @alias sap.ui.rta.command.ControlVariantSwitch
	 */
	var ControlVariantSwitch = BaseCommand.extend("sap.ui.rta.command.ControlVariantSwitch", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				targetVariantReference : {
					type : "string"
				},
				sourceVariantReference : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	ControlVariantSwitch.prototype.MODEL_NAME = "$FlexVariants";

	ControlVariantSwitch.prototype._getAppComponent = function(oElement) {
		if (!this._oControlAppComponent) {
			this._oControlAppComponent = oElement ? flUtils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
		}
		return this._oControlAppComponent;
	};

	ControlVariantSwitch.prototype._performVariantSwitch = function(sVariantReference) {
		var oElement = this.getElement(),
			oAppComponent = this._getAppComponent(oElement),
			oModel = oAppComponent.getModel(this.MODEL_NAME),
			sVariantManagementReference = BaseTreeModifier.getSelector(oElement, oAppComponent).id;

			if (this.getTargetVariantReference() !== this.getSourceVariantReference()) {
			return Promise.resolve(oModel.updateCurrentVariant(sVariantManagementReference, sVariantReference));
		}
		return Promise.resolve();
	};

	/**
	 * @public Template Method to implement execute logic, with ensure precondition Element is available
	 * @returns {promise} Returns resolve after execution
	 */
	ControlVariantSwitch.prototype.execute = function() {
		var sNewVariantReference = this.getTargetVariantReference();
		return Promise.resolve(this._performVariantSwitch(sNewVariantReference));
	};

	/**
	 * @public Template Method to implement undo logic
	 * @returns {promise} Returns resolve after undo
	 */
	ControlVariantSwitch.prototype.undo = function() {
		var sOldVariantReference = this.getSourceVariantReference();
		return Promise.resolve(this._performVariantSwitch(sOldVariantReference));
	};

	return ControlVariantSwitch;

}, /* bExport= */true);
