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
	var CompVariantSaveAs = BaseCommand.extend("sap.ui.rta.command.compVariant.CompVariantSaveAs", {
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

	CompVariantSaveAs.prototype.getPreparedChange = function() {
		return this._oVariant;
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
				// in case of redo the variant is still saved and the ID should be reused
				id: this._oVariant ? this._oVariant.getId() : undefined,
				type: oNewVariantProperties.type,
				texts: {
					variantName: oNewVariantProperties.text
				},
				content: oNewVariantProperties.content,
				executeOnSelection: oNewVariantProperties.executeOnSelection,
				favorite: true,
				contexts: oNewVariantProperties.contexts,
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
			control: this.getElement(),
			revert: true
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
