/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/command/FlexCommand',
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/command/appDescriptor/AppDescriptorCommand',
	'sap/ui/fl/FlexControllerFactory',
	'sap/ui/fl/Utils',
	'sap/ui/rta/ControlTreeModifier'
], function(
	ManagedObject,
	CommandStack,
	FlexCommand,
	BaseCommand,
	AppDescriptorCommand,
	FlexControllerFactory,
	FlexUtils,
	RtaControlTreeModifier
) {
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

	LREPSerializer.prototype.setCommandStack = function(oCommandStack) {
		this.setProperty("commandStack", oCommandStack);
		oCommandStack.attachCommandExecuted(function(oEvent) {
			this.handleCommandExecuted(oEvent);
		}.bind(this));
	};

	LREPSerializer.prototype.handleCommandExecuted = function(oEvent) {
		var oParams = oEvent.getParameters();
		var aCommands = this.getCommandStack().getSubCommands(oParams.command);

		if (oParams.undo) {
			var oFlexController;
			aCommands.forEach(function(oCommand) {
				// for revertable changes which don't belong to lrep
				// (e.g. variantSwitch)
				if (!(oCommand instanceof FlexCommand)) {
					return;
				}
				var oChange = oCommand.getPreparedChange();
				var oAppComponent = oCommand.getAppComponent();
				oFlexController = FlexControllerFactory.createForControl(oAppComponent);
				if (oCommand instanceof FlexCommand){
					var oControl = RtaControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
					oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
				}
				oFlexController.deleteChange(oChange, oAppComponent);
			});
		} else {
			var aDescriptorCreateAndAdd = [];
			aCommands.forEach(function(oCommand) {
				if (oCommand instanceof FlexCommand){
					var oAppComponent = oCommand.getAppComponent();
					var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
					oFlexController.addPreparedChange(oCommand.getPreparedChange(), oAppComponent);
				} else if (oCommand instanceof AppDescriptorCommand) {
					aDescriptorCreateAndAdd.push(oCommand.createAndStore());
				}
			});

			return Promise.all(aDescriptorCreateAndAdd);
		}

	};

	/**
	 * Serializes and saves all changes to LREP
	 *
	 * @returns {Promise} return empty promise
	 * @public
	 */
	LREPSerializer.prototype.saveCommands = function() {
		var oRootControl = sap.ui.getCore().byId(this.getRootControl());
		if (!oRootControl) {
			throw new Error("Can't save commands without root control instance!");
		}
		var oFlexController = FlexControllerFactory.createForControl(oRootControl);
		return oFlexController.saveAll()

		// needed because the AppDescriptorChanges are stored with a different ComponentName (without ".Component" at the end)
		// -> two different ChangePersistences
		.then(function() {
			var sComponentName = FlexUtils.getComponentClassName(sap.ui.getCore().byId(this.getRootControl())).replace(".Component", "");
			var oRootControl = sap.ui.getCore().byId(this.getRootControl());
			var sAppVersion = FlexUtils.getAppVersionFromManifest(FlexUtils.getAppComponentForControl(oRootControl).getManifest());
			oFlexController = FlexControllerFactory.create(sComponentName, sAppVersion);
			return oFlexController.saveAll();
		}.bind(this))

		.then(function() {
			jQuery.sap.log.info("UI adaptation successfully transfered changes to layered repository");
			this.getCommandStack().removeAllCommands();
		}.bind(this));
	};
	return LREPSerializer;
}, /* bExport= */true);
