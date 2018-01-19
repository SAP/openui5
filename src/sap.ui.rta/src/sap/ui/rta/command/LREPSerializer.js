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

				if (oParams.undo) {
					var oFlexController;
					aCommands.forEach(function(oCommand) {
						// for revertable changes which don't belong to LREP (variantSwitch) or runtime only changes
						if (!(oCommand instanceof FlexCommand || oCommand instanceof AppDescriptorCommand)
							|| oCommand.getRuntimeOnly()) {
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
			var sComponentName = FlexUtils.getComponentClassName(sap.ui.getCore().byId(this.getRootControl())).replace(".Component", "");
			var oRootControl = sap.ui.getCore().byId(this.getRootControl());
			var sAppVersion = FlexUtils.getAppVersionFromManifest(FlexUtils.getAppComponentForControl(oRootControl).getManifest());
			var oFlexController = FlexControllerFactory.create(sComponentName, sAppVersion);
			return oFlexController.saveAll();
		}.bind(this))

		.then(function() {
			jQuery.sap.log.info("UI adaptation successfully transfered changes to layered repository");
			this.getCommandStack().removeAllCommands();
		}.bind(this));

		return this._lastPromise;
	};

	/**
	 *
	 * @param {string} sReferenceAppIdForChanges
	 * @returns {promise} returns a promise with true or false
	 * @description Shall be used to persist the unsaved changes (in the current RTA session) for new app variant;
	 * Once the unsaved changes has been saved for the app variant, the cache (See Cache#update) will not be updated for the current app
	 * and the dirty changes will be spliced;
	 * At this point command stack is not aware if the changes have been booked for the new app variant.
	 * Therefore if there shall be some UI changes present in command stack, we undo all the changes till the beginning.
	 * Undo operation calls ChangePersistence#deleteChange and for this change we mark the change's state to 'PERSISTED'.(See ChangePersistence#deleteChange -> Change#markForDeletion)
	 * In the last when user presses 'Save and Exit', this change will be automatically ignored because the state was already set to 'PERSISTED'.
	 */
	LREPSerializer.prototype.saveAsCommands = function(sReferenceAppIdForChanges) {
		if (!sReferenceAppIdForChanges) {
			throw new Error("The id of the new app variant is required");
		}

		var oRootControl = sap.ui.getCore().byId(this.getRootControl());

		if (!oRootControl) {
			throw new Error("Can't save commands without root control instance!");
		}

		var oRunningAppDescriptor = FlexUtils.getAppDescriptor(oRootControl);
		// In case the id of the current running app is equal to the app variant id
		if (oRunningAppDescriptor["sap.app"].id === sReferenceAppIdForChanges) {
			throw new Error("The id of the app variant should be different from the current app id");
		}

		var oFlexController = FlexControllerFactory.createForControl(oRootControl);

		return oFlexController.saveAs(sReferenceAppIdForChanges).then(function() {
			while (this.getCommandStack().canUndo()) {
				this.getCommandStack().undo();
			}

			// Once the changes are undoed, all commands shall be removed
			this.getCommandStack().removeAllCommands();

			return Promise.resolve(true);
		}.bind(this));
	};

	return LREPSerializer;
}, /* bExport= */true);
