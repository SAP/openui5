/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/rta/command/BaseCommand',
				'sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory',
				'sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory'],
	function(BaseCommand,
		DescriptorInlineChangeFactory,
		DescriptorChangeFactory) {
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
	 * @experimental Since 1.49. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AppDescriptorCommand = BaseCommand.extend("sap.ui.rta.command.AppDescriptor", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				reference : {
					type : "string"
				},
				appComponent: {
					type: "object"
				},
				layer : {
					type : "string"
				},
				changeType : {
					type : "string"
				},
				parameters : {
					type : "object"
				},
				texts : {
					type : "object"
				}
			},
			events : {}
		}
	});

	/**
	 * Prepare the app descriptor change, setting the layer.
	 * @param  {object} mFlexSettings Map of flex Settings
	 * @param  {string} mFlexSettings.layer Layer where the change is applied
	 */
	AppDescriptorCommand.prototype.prepare = function(mFlexSettings){
		this.setLayer(mFlexSettings.layer);
	};

	/**
	 * Template method to execute the app descriptor change in runtime.
	 * If the runtime change is done by a Flex Command, implementing this method is not necessary
	 */
	AppDescriptorCommand.prototype.execute = function(){};

	/**
	 * Create the change for the app descriptor and add it to the ChangePersistence.
	 * @return {Promise} resolving after all changes have been created and stored
	 */
	AppDescriptorCommand.prototype.createAndStore = function(){
			return DescriptorInlineChangeFactory.createDescriptorInlineChange(
				this.getChangeType(), this.getParameters(), this.getTexts())
			.then(function(oAppDescriptorChangeContent){
				return new DescriptorChangeFactory().createNew(this.getReference(),
					oAppDescriptorChangeContent, this.getLayer(), this.getAppComponent());
			}.bind(this))
			.then(function(oAppDescriptorChange){
				return oAppDescriptorChange.store();
			});
	};
	return AppDescriptorCommand;

}, /* bExport= */true);
