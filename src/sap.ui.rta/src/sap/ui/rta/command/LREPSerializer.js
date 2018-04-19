/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/command/FlexCommand',
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/command/AppDescriptorCommand',
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

	/**
	 * Promise to ensure that the event triggered methods are executed sequentionally.
	 */
	LREPSerializer.prototype._lastPromise = Promise.resolve();

	LREPSerializer.prototype.setCommandStack = function(oCommandStack) {
		this.setProperty("commandStack", oCommandStack);
		oCommandStack.attachCommandExecuted(function(oEvent) {
			this.handleCommandExecuted(oEvent);
		}.bind(this));
	};

	LREPSerializer.prototype.handleCommandExecuted = function(oEvent) {
		(function (oEvent) {
			var oParams = oEvent.getParameters();
			this._lastPromise = this._lastPromise.catch(function() {
				// _lastPromise chain must not be interupted
			}).then(function() {
				var aCommands = this.getCommandStack().getSubCommands(oParams.command);

				var oFlexController;
				if (oParams.undo) {
					aCommands.forEach(function(oCommand) {
						// for revertable changes which don't belong to LREP (variantSwitch) or runtime only changes
						if (!(oCommand instanceof FlexCommand || oCommand instanceof AppDescriptorCommand)
							|| oCommand.getRuntimeOnly()) {
							return;
						}
						var oChange = oCommand.getPreparedChange();
						var oAppComponent = oCommand.getAppComponent();
						if (oCommand instanceof FlexCommand){
							oFlexController = FlexControllerFactory.createForControl(oAppComponent);
							var oControl = RtaControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
							oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
						} else if (oCommand instanceof AppDescriptorCommand) {
							//other flex controller!
							oFlexController = this._getAppDescriptorFlexController(oAppComponent);
						}
						oFlexController.deleteChange(oChange, oAppComponent);
					}.bind(this));
				} else {
					var aDescriptorCreateAndAdd = [];
					aCommands.forEach(function(oCommand) {
						// Runtime only changes should not be added to the persistence
						if (oCommand.getRuntimeOnly()){
							return;
						}
						if (oCommand instanceof FlexCommand){
							var oAppComponent = oCommand.getAppComponent();
							var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
							oFlexController.addPreparedChange(oCommand.getPreparedChange(), oAppComponent);
						} else if (oCommand instanceof AppDescriptorCommand) {
							aDescriptorCreateAndAdd.push(oCommand.createAndStoreChange());
						}
					});

					return Promise.all(aDescriptorCreateAndAdd);
				}
			}.bind(this));
		}.bind(this))(oEvent);
	};

	/**
	 * Serializes and saves all changes to LREP
	 *
	 * @returns {Promise} return empty promise
	 * @public
	 */
	LREPSerializer.prototype.saveCommands = function() {
		this._lastPromise = this._lastPromise.catch(function() {
			// _lastPromise chain must not be interupted
		}).then(function() {
			var oRootControl = sap.ui.getCore().byId(this.getRootControl());
			if (!oRootControl) {
				throw new Error("Can't save commands without root control instance!");
			}
			var oFlexController = FlexControllerFactory.createForControl(oRootControl);
			return oFlexController.saveAll();
		}.bind(this))

		// needed because the AppDescriptorChanges are stored with a different ComponentName (without ".Component" at the end)
		// -> two different ChangePersistences
		.then(function() {
			var oRootControl = sap.ui.getCore().byId(this.getRootControl());
			var oFlexController = this._getAppDescriptorFlexController(oRootControl);
			return oFlexController.saveAll();
		}.bind(this))

		.then(function() {
			jQuery.sap.log.info("UI adaptation successfully transferred changes to layered repository");
			this.getCommandStack().removeAllCommands();
		}.bind(this));

		return this._lastPromise;
	};

	/**
	 * needed because the AppDescriptorChanges are stored with a different ComponentName (without ".Component" at the end)
	 * -> two different ChangePersistence
	 * @param {sap.ui.base.ManagedObject} oControl control or app component for which the flex controller should be instantiated
	 */
	LREPSerializer.prototype._getAppDescriptorFlexController = function(oControl) {
		var oAppComponent = FlexUtils.getAppComponentForControl(oControl);
		var sComponentName = FlexUtils.getComponentClassName(oAppComponent).replace(".Component", "");
		var sAppVersion = FlexUtils.getAppVersionFromManifest(oAppComponent.getManifest());
		return FlexControllerFactory.create(sComponentName, sAppVersion);
	};
	return LREPSerializer;
}, /* bExport= */true);
