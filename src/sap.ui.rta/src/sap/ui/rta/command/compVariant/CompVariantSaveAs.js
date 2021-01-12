/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand"
], function(
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
				variantReference: {
					type: "string"
				},
				variantName: {
					type: "string"
				},
				variantProperties: {
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
	CompVariantSaveAs.prototype.prepare = function(mFlexSettings) {
		this._sLayer = mFlexSettings.layer;
		return true;
	};

	CompVariantSaveAs.prototype.getPreparedChange = function() {
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	CompVariantSaveAs.prototype.execute = function() {
		// TODO: call function on control

		/* this works, but does not update the control
		var oVariant = SmartVariantManagementWriteAPI.addVariant({
			changeSpecificData: {
				type: this.getVariantProperties().type,
				texts: {
					variantName: this.getVariantName()
				},
				content: this.getVariantProperties().content,
				layer: this._sLayer
			},
			control: this.getElement()
		});
		this.setVariantReference(oVariant.getFileName());
		*/
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantSaveAs.prototype.undo = function() {
		// TODO come up with concept for undo
		return Promise.resolve();
	};

	return CompVariantSaveAs;
});
