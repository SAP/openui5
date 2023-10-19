/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory"
], function(
	BaseCommand,
	AppVariantInlineChangeFactory,
	DescriptorChangeFactory
) {
	"use strict";

	/**
	 * Implementation of a command template for App Descriptor changes
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.49
	 * @alias sap.ui.rta.command.AppDescriptorCommand
	 */
	var AppDescriptorCommand = BaseCommand.extend("sap.ui.rta.command.AppDescriptorCommand", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				reference: {
					type: "string"
				},
				appComponent: {
					type: "object"
				},
				layer: {
					type: "string"
				},
				changeType: {
					type: "string"
				},
				parameters: {
					type: "object"
				},
				texts: {
					type: "object"
				}
			},
			events: {}
		}
	});

	/**
	 * For app descriptor commands to take effect usually the app needs to be restarted as server-side processing is involved.
	 */
	AppDescriptorCommand.prototype.needsReload = true;

	/**
	 * Prepare the app descriptor change, setting the layer.
	 * @param  {object} mFlexSettings - Map of flex settings
	 * @param  {string} mFlexSettings.layer - Layer where the change is applied
	 * @returns {boolean} <code>true</true>
	 */
	AppDescriptorCommand.prototype.prepare = function(mFlexSettings) {
		this.setLayer(mFlexSettings.layer);
		return true;
	};

	/**
	 * Retrieves the prepared change for e.g. undo execution.
	 * @return {sap.ui.fl.apply._internal.flexObjects.UIChange} Returns change after being created and stored
	 */
	AppDescriptorCommand.prototype.getPreparedChange = function() {
		return this._oPreparedChange;
	};

	AppDescriptorCommand.prototype.setCompositeId = function(sCompositeId) {
		this._sCompositeId = sCompositeId;
	};

	/**
	 * Create the change for the app descriptor and adds it to the Flex Persistence.
	 * @return {Promise} Returns Promise resolving after change has been created and stored
	 */
	AppDescriptorCommand.prototype.createAndStoreChange = function() {
		return AppVariantInlineChangeFactory.createDescriptorInlineChange({
			changeType: this.getChangeType(),
			content: this.getParameters(),
			texts: this.getTexts(),
			support: {
				compositeCommand: this._sCompositeId || ""
			}
		})
		.then(function(oAppDescriptorChangeContent) {
			return new DescriptorChangeFactory().createNew(
				this.getReference(),
				oAppDescriptorChangeContent,
				this.getLayer(),
				this.getAppComponent(),
				"sap.ui.rta.AppDescriptorCommand"
			);
		}.bind(this))
		.then(function(oAppDescriptorChange) {
			var oChange = oAppDescriptorChange.store();
			this._oPreparedChange = oChange;
		}.bind(this));
	};
	return AppDescriptorCommand;
});
