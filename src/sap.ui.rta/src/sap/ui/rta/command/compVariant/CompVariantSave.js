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
	 * Save Comp Variant
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.87
	 * @alias sap.ui.rta.command.compVariant.CompVariantSave
	 */
	var CompVariantSave = BaseCommand.extend("sap.ui.rta.command.CompVariantSave", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				variantReference: {
					type: "string"
				},
				content: {
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
	CompVariantSave.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	CompVariantSave.prototype.getPreparedChange = function() {
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	CompVariantSave.prototype.execute = function() {
		// TODO call function on control
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantSave.prototype.undo = function() {
		// TODO come up with concept for undo
		return Promise.resolve();
	};

	return CompVariantSave;
});
