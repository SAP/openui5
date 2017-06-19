/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/rta/command/Stack', 'sap/ui/fl/FlexControllerFactory'], function(ManagedObject, CommandStack, FlexControllerFactory) {
	"use strict";
	/**
	 * Basic implementation for the LREP Serializer.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.42
	 * @alias sap.ui.rta.command.LREPSerializer
	 * @experimental Since 1.42. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var LREPSerializer = ManagedObject.extend("sap.ui.rta.command.LREPSerializer", {
		metadata : {
			library : "sap.ui.rta",
			associations : {
				/** The root control which is needed for the Flex Controller */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			properties : {
				"commandStack" : {
					type : "object" // has to be of type sap.ui.rta.command.Stack
				}
			},
			aggregations : {}
		}
	});

	/**
	 * Serializes and saves all changes to LREP
	 *
	 * @returns {Promise} return empty promise
	 * @public
	 */
	LREPSerializer.prototype.saveCommands = function() {
		var oCommandStack = this.getCommandStack();
		var oRootControl = sap.ui.getCore().byId(this.getRootControl());
		if (!oRootControl) {
			throw new Error("Can't save commands without root control instance!");
		}
		var oFlexController = FlexControllerFactory.createForControl(oRootControl);
		var aCommands = oCommandStack.getAllExecutedCommands();
		aCommands.forEach(function(oCommand) {
			oFlexController.addPreparedChange(oCommand.getPreparedChange(), oCommand.getAppComponent());
		});
		return oFlexController.saveAll().then(function() {
			jQuery.sap.log.info("UI adaptation successfully transfered changes to layered repository");
			this.getCommandStack().removeAllCommands();
		}.bind(this));
	};
	return LREPSerializer;
}, /* bExport= */true);
