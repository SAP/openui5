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
	 * Configure Comp Variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.87
	 * @alias sap.ui.rta.command.compVariant.CompVariantConfigure
	 */
	var CompVariantConfigure = BaseCommand.extend("sap.ui.rta.command.CompVariantConfigure", {
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
	CompVariantConfigure.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	CompVariantConfigure.prototype.getPreparedChange = function() {
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	CompVariantConfigure.prototype.execute = function() {
		// TODO call function on control
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantConfigure.prototype.undo = function() {
		// TODO come up with concept for undo
		return Promise.resolve();
	};

	return CompVariantConfigure;
});
