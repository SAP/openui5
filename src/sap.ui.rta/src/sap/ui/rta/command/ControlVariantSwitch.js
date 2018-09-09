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

	ControlVariantSwitch.prototype._getAppComponent = function (bEmbedded) {
		var oElement = this.getElement();
		if (oElement) {
			return bEmbedded ? flUtils.getSelectorComponentForControl(oElement) : flUtils.getAppComponentForControl(oElement);
		} else {
			return this.getSelector().appComponent;
		}
	};


	/**
	 * Template Method to implement execute logic, with ensure precondition Element is available.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantSwitch.prototype.execute = function() {
		var oElement = this.getElement(),
			oComponent = this._getAppComponent(true),
			oAppComponent = this._getAppComponent(),
			sNewVariantReference = this.getTargetVariantReference();

		this.oModel = oAppComponent.getModel(this.MODEL_NAME);
		this.sVariantManagementReference = BaseTreeModifier.getSelector(oElement, oComponent).id;
		return this._updateModelVariant(sNewVariantReference, oComponent);
	};

	/**
	 * Template Method to implement undo logic.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSwitch.prototype.undo = function() {
		var sOldVariantReference = this.getSourceVariantReference();
		var oComponent = this._getAppComponent(true);
		return this._updateModelVariant(sOldVariantReference, oComponent);
	};

	/**
	 * Update variant for the underlying model.
	 * @private
	 * @returns {Promise} Returns promise resolve
	 */
	ControlVariantSwitch.prototype._updateModelVariant = function (sVariantReference, oComponent) {
		if (this.getTargetVariantReference() !== this.getSourceVariantReference()) {
			return Promise.resolve(this.oModel.updateCurrentVariant(this.sVariantManagementReference, sVariantReference, oComponent));
		}
		return Promise.resolve();
	};

	return ControlVariantSwitch;

}, /* bExport= */true);
