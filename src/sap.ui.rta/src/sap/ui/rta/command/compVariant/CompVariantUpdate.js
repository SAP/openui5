/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/each",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/rta/command/BaseCommand"
], function(
	each,
	SmartVariantManagementWriteAPI,
	BaseCommand
) {
	"use strict";

	/**
	 * Update Comp Variants. Can be triggered via the Manage Views dialog or a rename.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.87
	 * @alias sap.ui.rta.command.compVariant.CompVariantUpdate
	 */
	var CompVariantUpdate = BaseCommand.extend("sap.ui.rta.command.compVariant.CompVariantUpdate", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				newVariantProperties: {
					type: "object"
				},
				newDefaultVariantId: {
					type: "string"
				},
				oldDefaultVariantId: {
					type: "string"
				},
				onlySave: {
					type: "boolean"
				}
			}
		}
	});

	/**
	 * Save all necessary information to the command, as in execute this information is not available
	 *
	 * @override
	 */
	CompVariantUpdate.prototype.prepare = function(mFlexSettings, sVariantManagementReference, sCommand) {
		this.mInformation = {
			layer: mFlexSettings.layer,
			command: sCommand, // used for ChangeVisualization and should end up in the support object in change definition
			generator: sap.ui.rta.GENERATOR_NAME // also to be saved in the support section
		};
		return true;
	};

	function callFlAPIFunction(sFunctionName, sKey, oValue) {
		var mPropertyBag = Object.assign({}, oValue, this.mInformation, {
			id: sKey,
			control: this.getElement()
		});
		return SmartVariantManagementWriteAPI[sFunctionName](mPropertyBag);
	}

	/**
	 * Triggers the update of a variant.
	 * @public
	 * @returns {Promise} Resolves after execution
	 */
	CompVariantUpdate.prototype.execute = function() {
		if (this.getOnlySave()) {
			this.getElement().setModified(false);
			var sKey = Object.keys(this.getNewVariantProperties())[0];
			callFlAPIFunction.call(this, "updateVariant", sKey, this.getNewVariantProperties()[sKey]);
		} else {
			each(this.getNewVariantProperties(), function(sVariantId, oValue) {
				if (oValue.deleted) {
					callFlAPIFunction.call(this, "removeVariant", sVariantId, {});
					this.getElement().removeVariant({variantId: sVariantId});
				} else {
					var oVariant = callFlAPIFunction.call(this, "updateVariant", sVariantId, oValue);
					this.getElement().updateVariant(oVariant);
				}
			}.bind(this));
			if (this.getNewDefaultVariantId()) {
				callFlAPIFunction.call(this, "setDefaultVariantId", undefined, {defaultVariantId: this.getNewDefaultVariantId()});
				this.getElement().setDefaultVariantId(this.getNewDefaultVariantId());
			}
		}
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	CompVariantUpdate.prototype.undo = function() {
		if (this.getOnlySave()) {
			this.getElement().setModified(true);
			var sVariantId = Object.keys(this.getNewVariantProperties())[0];
			callFlAPIFunction.call(this, "revert", sVariantId, {});
		} else {
			each(this.getNewVariantProperties(), function(sVariantId, oValue) {
				var oVariant = callFlAPIFunction.call(this, "revert", sVariantId, {});
				if (oValue.deleted) {
					this.getElement().addVariant(oVariant);
				} else {
					this.getElement().updateVariant(oVariant);
				}
			}.bind(this));
			if (this.getNewDefaultVariantId()) {
				callFlAPIFunction.call(this, "revertSetDefaultVariantId", this.getOldDefaultVariantId());
				this.getElement().setDefaultVariantId(this.getOldDefaultVariantId());
			}
		}
		return Promise.resolve();
	};

	return CompVariantUpdate;
});
