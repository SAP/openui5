/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/rta/command/BaseCommand"
], function(
	SmartVariantManagementWriteAPI,
	BaseCommand
) {
	"use strict";

	/**
	 * Save a new Comp Variant
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.87
	 * @alias sap.ui.rta.command.compVariant.CompVariantSaveAs
	 */
	var CompVariantSaveAs = BaseCommand.extend("sap.ui.rta.command.CompVariantSaveAs", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				newVariantProperties: {
					type: "object"
				},
				previousDirtyFlag: {
					type: "boolean"
				},
				previousVariantId: {
					type: "string"
				},
				previousDefault: {
					type: "string"
				}
			}
		}
	});

	/**
	 * @override
	 */
	CompVariantSaveAs.prototype.prepare = function(mFlexSettings, sVariantManagementReference, sCommand) {
		this.mInformation = {
			layer: mFlexSettings.layer,
			command: sCommand, // used for ChangeVisualization and should end up in the support object in change definition
			generator: sap.ui.rta.GENERATOR_NAME // also to be saved in the support section
		};
		return true;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	CompVariantSaveAs.prototype.execute = function() {
		var oNewVariantProperties = this.getNewVariantProperties();
		var mPropertyBag = {
			changeSpecificData: {
				type: oNewVariantProperties.type,
				texts: {
					variantName: oNewVariantProperties.text
				},
				content: oNewVariantProperties.content,
				executeOnSelect: oNewVariantProperties.executeOnSelect,
				favourite: true,
				layer: this.mInformation.layer
			},
			control: this.getElement(),
			command: this.mInformation.command,
			generator: this.mInformation.generator
		};
		this._oVariant = SmartVariantManagementWriteAPI.addVariant(mPropertyBag);

		if (oNewVariantProperties.default) {
			SmartVariantManagementWriteAPI.setDefaultVariantId(Object.assign({}, this.mInformation, {
				control: this.getElement(),
				defaultVariantId: this._oVariant.getId()
			}));
		}

		this.getElement().addVariant(this._oVariant, oNewVariantProperties.default);
		this.getElement().activateVariant(this._oVariant.getId());
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantSaveAs.prototype.undo = function() {
		SmartVariantManagementWriteAPI.removeVariant({
			id: this._oVariant.getId(),
			control: this.getElement()
		});

		if (this.getNewVariantProperties().default) {
			SmartVariantManagementWriteAPI.setDefaultVariantId(Object.assign({}, this.mInformation, {
				control: this.getElement(),
				defaultVariantId: this.getPreviousDefault()
			}));
		}

		this.getElement().removeWeakVariant({
			previousDirtyFlag: this.getPreviousDirtyFlag(),
			previousVariantId: this.getPreviousVariantId(),
			previousDefault: this.getPreviousDefault(),
			variantId: this._oVariant.getId()
		});

		return Promise.resolve();
	};

	return CompVariantSaveAs;
});
