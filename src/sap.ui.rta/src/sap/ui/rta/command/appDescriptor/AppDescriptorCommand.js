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
	 * @alias sap.ui.rta.command.appDescriptor.AppDescriptorCommand
	 * @experimental Since 1.49. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AppDescriptorCommand = BaseCommand.extend("sap.ui.rta.command.AppDescriptorCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				reference : {
					type : "string"
				},
				appComponent: {
					type: "object"
				}
			},
			events : {}
		}
	});

	AppDescriptorCommand.prototype.getPreparedChange = function() {
		return this._oPreparedChange;
	};

	/**
	 * Template method to create the app descriptor change which is used in the createAndStore function
	 * @return {Promise} with app descriptor inline change content e.g. from DescriptorInlineChangeFactory.create_xyz
	 */
	AppDescriptorCommand.prototype._create = function(){};

	/**
	 * Create the change for the app descriptor and add it to the ChangePersistence
	 * @return {Promise} resolving after all changes have been created
	 */
	AppDescriptorCommand.prototype.createAndStore = function(){
			return this._create()
			.then(function(oAppDescriptorChangeContent){
				return new DescriptorChangeFactory().createNew(this.getReference(),
					oAppDescriptorChangeContent, this.getLayer(), this.getAppComponent());
			}.bind(this))
			.then(function(oAppDescriptorChange){
				var oChange = oAppDescriptorChange.store();
				this._oPreparedChange = oChange;
			}.bind(this));
	};
	return AppDescriptorCommand;

}, /* bExport= */true);
