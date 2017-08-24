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

	ControlVariantDuplicate.prototype._performVariantDuplicate = function(sNewVariantFileName) {
		var oElement = this.getElement(),
			oAppComponent = this._getAppComponent(oElement),
			oModel = oAppComponent.getModel(this.MODEL_NAME),
			sVariantManagementReference = BaseTreeModifier.getSelector(oElement, oAppComponent).id,
			sSourceVariantReference = this.getSourceVariantReference();

		var oSourceVariant = oModel.getVariant(sSourceVariantReference);

		var oDuplicateVariant = {
			content: {},
			changes: JSON.parse(JSON.stringify(oSourceVariant.changes))
		};

		Object.keys(oSourceVariant.content).forEach(function(sKey) {
			if (sKey === "fileName") {
				oDuplicateVariant.content[sKey] = sNewVariantFileName;
			}else if (sKey === "variantReference") {
				oDuplicateVariant.content[sKey] = sSourceVariantReference;
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

		return Promise.resolve(oModel._addVariant(oDuplicateVariant, sVariantManagementReference))
			.then(function (oVariant) {
				this.setDuplicateVariant(oVariant);
				oModel.updateCurrentVariant(sVariantManagementReference, oVariant.getId());
			}.bind(this));
	};

	/**
	 * @public Template Method to implement execute logic, with ensure precondition Element is available
	 * @returns {promise} Returns resolve after execution
	 */
	ControlVariantDuplicate.prototype.execute = function() {
		var sNewVariantFileName = flUtils.createDefaultFileName(this.getSourceVariantReference() + "_Copy");
		return Promise.resolve(this._performVariantDuplicate(sNewVariantFileName));
	};

	/**
	 * @public Template Method to implement undo logic
	 * @returns {promise} Returns resolve after undo
	 */
	ControlVariantDuplicate.prototype.undo = function() {
		var oElement = this.getElement(),
		oAppComponent = this._getAppComponent(oElement),
		oModel = oAppComponent.getModel(this.MODEL_NAME),
		sVariantManagementReference = BaseTreeModifier.getSelector(oElement, oAppComponent).id;

		if (this.getDuplicateVariant()) {
			return Promise.resolve(oModel._removeVariant(this.getDuplicateVariant(), sVariantManagementReference));
		}
	};

	return ControlVariantDuplicate;

}, /* bExport= */true);
