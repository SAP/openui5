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
	 * Switch Comp Variant
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.87
	 * @alias sap.ui.rta.command.compVariant.CompVariantSwitch
	 */
	var CompVariantSwitch = BaseCommand.extend("sap.ui.rta.command.CompVariantSwitch", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				sourceVariantReference: {
					type: "string"
				},
				targetVariantReference: {
					type: "string"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	CompVariantSwitch.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	CompVariantSwitch.prototype.getPreparedChange = function() {
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	CompVariantSwitch.prototype.execute = function() {
		// TODO call function on control to activate new variant (targetVariantReference)
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantSwitch.prototype.undo = function() {
		// TODO call function on control to activate new variant (sourceVariantReference)
		return Promise.resolve();
	};

	return CompVariantSwitch;
});
