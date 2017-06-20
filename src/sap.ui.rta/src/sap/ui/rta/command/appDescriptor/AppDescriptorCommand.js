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
				}
			},
			events : {}
		}
	});

	return AppDescriptorCommand;

}, /* bExport= */true);
