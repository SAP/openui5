/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI"
], function(
	BaseCommand,
	SmartVariantManagementWriteAPI
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
	var CompVariantSwitch = BaseCommand.extend("sap.ui.rta.command.compVariant.CompVariantSwitch", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				sourceVariantId: {
					type: "string"
				},
				targetVariantId: {
					type: "string"
				},
				discardVariantContent: {
					type: "boolean"
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			BaseCommand.apply(this, aArgs);
			this.setRelevantForSave(false);
		}
	});

	/**
	 * Triggers the switch of a variant. If the switch was done from
	 * a variant with changes, the user can decide to discard them on switch.
	 * @public
	 * @returns {Promise} Resolves after execution
	 */
	CompVariantSwitch.prototype.execute = function() {
		this.getElement().activateVariant(this.getTargetVariantId());
		if (this.getDiscardVariantContent()) {
			this.getElement().setModified(false);
			SmartVariantManagementWriteAPI.discardVariantContent({
				control: this.getElement(),
				id: this.getSourceVariantId()
			});
		}
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantSwitch.prototype.undo = function() {
		if (this.getDiscardVariantContent()) {
			SmartVariantManagementWriteAPI.revert({
				control: this.getElement(),
				id: this.getSourceVariantId()
			});
		}
		this.getElement().activateVariant(this.getSourceVariantId());
		if (this.getDiscardVariantContent()) {
			this.getElement().setModified(true);
		}
		return Promise.resolve();
	};

	return CompVariantSwitch;
});
