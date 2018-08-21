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
	'sap/ui/fl/Change',
	'sap/ui/rta/ControlTreeModifier',
	'sap/ui/fl/registry/Settings',
	"sap/base/Log"
], function(
	ManagedObject,
	CommandStack,
	FlexCommand,
	BaseCommand,
	AppDescriptorCommand,
	FlexControllerFactory,
	FlexUtils,
	Change,
	RtaControlTreeModifier,
	Settings,
	Log
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
		if (this.getCommandStack()){
			this.getCommandStack().removeCommandExecutionHandler(this._fnHandleCommandExecuted);
		}
		this.setProperty("commandStack", oCommandStack);
		oCommandStack.addCommandExecutionHandler(this._fnHandleCommandExecuted);
	};
	LREPSerializer.prototype.init = function(){
		this._fnHandleCommandExecuted = this.handleCommandExecuted.bind(this);
	};
	LREPSerializer.prototype.exit = function(){
		this.getCommandStack().removeCommandExecutionHandler(this._fnHandleCommandExecuted);
	};
	LREPSerializer.prototype._isPersistedChange = function(oPreparedChange) {
		return !!this.getCommandStack()._aPersistedChanges && this.getCommandStack()._aPersistedChanges.indexOf(oPreparedChange.getId()) !== -1;
	};

	LREPSerializer.prototype.handleCommandExecuted = function(oEvent) {
		return (function (oEvent) {
			var oParams = oEvent;
			this._lastPromise = this._lastPromise.catch(function() {
				// _lastPromise chain must not be interrupted
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
						if (oAppComponent) {
							if (oCommand instanceof FlexCommand){
								oFlexController = FlexControllerFactory.createForControl(oAppComponent);
								var oControl = RtaControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
								oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
							} else if (oCommand instanceof AppDescriptorCommand) {
								//other flex controller!
								oFlexController = this._getAppDescriptorFlexController(oAppComponent);
							}
							oFlexController.deleteChange(oChange, oAppComponent);
						}
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
							if (oAppComponent) {
								var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
								var oPreparedChange = oCommand.getPreparedChange();
								if (oPreparedChange.getState() === Change.states.DELETED) {
									oPreparedChange.setState(Change.states.NEW);
								}
								if (!this._isPersistedChange(oPreparedChange)) {
									oFlexController.addPreparedChange(oCommand.getPreparedChange(), oAppComponent);
								}
							}
						} else if (oCommand instanceof AppDescriptorCommand) {
							aDescriptorCreateAndAdd.push(oCommand.createAndStoreChange());
						}
					}.bind(this));

					return Promise.all(aDescriptorCreateAndAdd);
				}
			}.bind(this));
			return this._lastPromise;
		}.bind(this))(oEvent);
	};

	/**
	 * Checks if the app needs to restart for the current active changes to be effective
	 *
	 * @returns {Promise} return boolean answer
	 * @public
	 */
	LREPSerializer.prototype.needsReload = function() {
		this._lastPromise = this._lastPromise.catch(function() {
			// _lastPromise chain must not be interrupted
		}).then(function() {
			var aCommands = this.getCommandStack().getAllExecutedCommands();
			return aCommands.some(function(oCommand){
				return !!oCommand.needsReload;
			});
		}.bind(this));
		return this._lastPromise;
	};
	/**
	 * Serializes and saves all changes to LREP
	 *
	 * @returns {Promise} return empty promise
	 * @public
	 */
	LREPSerializer.prototype.saveCommands = function() {
		this._lastPromise = this._lastPromise.catch(function() {
			// _lastPromise chain must not be interrupted
		}).then(function() {
			var oRootControl = sap.ui.getCore().byId(this.getRootControl());
			if (!oRootControl) {
				throw new Error("Can't save commands without root control instance!");
			}
			var oFlexController = FlexControllerFactory.createForControl(oRootControl);
			return oFlexController.saveAll();
		}.bind(this))

		// needed because the AppDescriptorChanges are stored with a different ComponentName (without ".Component" at the end)
		// -> two different ChangePersistence
		.then(function() {
			var oRootControl = sap.ui.getCore().byId(this.getRootControl());
			var oFlexController = this._getAppDescriptorFlexController(oRootControl);
			return oFlexController.saveAll();
		}.bind(this))

		.then(function() {
			Log.info("UI adaptation successfully transfered changes to layered repository");
			this.getCommandStack().removeAllCommands();
		}.bind(this));

		return this._lastPromise;
	};

	/**
	 * needed because the AppDescriptorChanges are stored with a different ComponentName (without ".Component" at the end)
	 * -> two different ChangePersistence
	 * @param {sap.ui.base.ManagedObject} oControl control or app component for which the flex controller should be instantiated
	 * @returns {Promise} Returns AppDescriptorFlexController for given controls
	 */
	LREPSerializer.prototype._getAppDescriptorFlexController = function(oControl) {
		var oOuterAppComponent = FlexUtils.getAppComponentForControl(oControl, true);
		var sComponentName = FlexUtils.getComponentClassName(oOuterAppComponent).replace(".Component", "");
		var sAppVersion = FlexUtils.getAppVersionFromManifest(oOuterAppComponent.getManifest());
		return FlexControllerFactory.create(sComponentName, sAppVersion);
	};

	LREPSerializer.prototype._moveChangeToAppVariant = function(sReferenceAppIdForChanges, oFlexController) {
		return Settings.getInstance().then(function(oSettings) {
			var oPropertyBag = {
				reference: sReferenceAppIdForChanges
			};
			var sNamespace = FlexUtils.createNamespace(oPropertyBag, "changes");

			var aCommands = this.getCommandStack().getAllExecutedCommands();
			aCommands.forEach(function(oCommand) {
				// only commands with 'getPreparedChange' function implemented (like FlexCommand and AppDescriptorCommand)
				// get moved to the new app variant
				// variant commands are not FlexCommands but some still have 'getPreparedChange'
				if (oCommand.getPreparedChange && !oCommand.getRuntimeOnly()) {
					var vChange = oCommand.getPreparedChange();
					if (!Array.isArray(vChange)) {
						vChange = [vChange];
					}

					vChange.forEach(function(oChange) {
						if (oSettings.isAtoEnabled()) {
							oChange.setRequest("ATO_NOTIFICATION");
						}
						oChange.setNamespace(sNamespace);
						oChange.setComponent(sReferenceAppIdForChanges);
					});
				}
			});

			return oFlexController.saveAll(true);
		}.bind(this));
	};

	LREPSerializer.prototype._triggerUndoChanges = function() {
		var oCommandStack = this.getCommandStack();
		var aPromises = [];

		var aCommands = oCommandStack.getAllExecutedCommands();
		aCommands.forEach(function(oCommand) {
			aPromises.push(oCommand.undo.bind(oCommand));
		});

		// The last command has to be undone first, therefore reversing is required
		aPromises = aPromises.reverse();

		return FlexUtils.execPromiseQueueSequentially(aPromises, false, true);
	};

	LREPSerializer.prototype._removeCommands = function(oFlexController) {
		var oCommandStack = this.getCommandStack();
		var aCommands = oCommandStack.getAllExecutedCommands();

		aCommands.forEach(function(oCommand) {
			if (oCommand instanceof FlexCommand){
				var oChange = oCommand.getPreparedChange();
				var oAppComponent = oCommand.getAppComponent();
				var oControl = RtaControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
				oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
			}
		});

		// Once the changes are undone, all commands shall be removed
		oCommandStack.removeAllCommands();
	};

	/**
	 * @description Shall be used to persist the unsaved changes (in the current RTA session) for new app variant;
	 * Once the unsaved changes has been saved for the app variant, the cache (See Cache#update) will not be updated for the current app
	 * and the dirty changes will be spliced;
	 * At this point command stack is not aware if the changes have been booked for the new app variant.
	 * Therefore if there shall be some UI changes present in command stack, we undo all the changes till the beginning. Before undoing we detach the 'commandExecuted' event
	 * Since we detached the commandExecuted event, therefore LRepSerializer would not talk with FlexController and ChangePersistence.
	 * In the last when user presses 'Save and Exit', there will be no change registered for the current app.
	 * @param {string} sReferenceAppIdForChanges - ApplicationId
	 * @returns {Promise} returns a promise with true or false
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

		var oCommandStack = this.getCommandStack();
		return this._moveChangeToAppVariant(sReferenceAppIdForChanges, oFlexController)
			.then(function() {
				// Detach the event 'commandExecuted' here to stop the communication of LREPSerializer with Flex
				oCommandStack.detachCommandExecuted(this.handleCommandExecuted.bind(this));
				return this._triggerUndoChanges();
			}.bind(this))
			.then(function() {
				this._removeCommands(oFlexController);
				// Attach the event 'commandExecuted' here to start the communication of LREPSerializer with Flex
				oCommandStack.attachCommandExecuted(this.handleCommandExecuted.bind(this));
				return true;
			}.bind(this));
	};

	return LREPSerializer;
}, /* bExport= */true);