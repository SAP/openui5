/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/rta/command/AppDescriptorCommand",
	"sap/ui/fl/Utils",
	"sap/ui/dt/ElementUtil",
	"sap/base/Log",
	"sap/ui/fl/write/api/PersistenceWriteAPI"
], function(
	ManagedObject,
	FlexCommand,
	AppDescriptorCommand,
	FlUtils,
	ElementUtil,
	Log,
	PersistenceWriteAPI
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
	 */
	var LREPSerializer = ManagedObject.extend("sap.ui.rta.command.LREPSerializer", {
		metadata: {
			library: "sap.ui.rta",
			associations: {
				/** The root control which is needed for the Flex Persistence */
				rootControl: {
					type: "sap.ui.core.Control"
				}
			},
			properties: {
				commandStack: {
					type: "object" // has to be of type sap.ui.rta.command.Stack
				}
			},
			aggregations: {}
		}
	});

	function getRootControlInstance(vRootControl) {
		return ElementUtil.getElementInstance(vRootControl);
	}

	/**
	 * Promise to ensure that the event triggered methods are executed sequentionally.
	 */
	LREPSerializer.prototype._lastPromise = Promise.resolve();

	LREPSerializer.prototype.setCommandStack = function(oCommandStack) {
		if (this.getCommandStack()) {
			this.getCommandStack().removeCommandExecutionHandler(this._fnHandleCommandExecuted);
		}
		this.setProperty("commandStack", oCommandStack);
		oCommandStack.addCommandExecutionHandler(this._fnHandleCommandExecuted);
	};
	LREPSerializer.prototype.init = function() {
		this._fnHandleCommandExecuted = this.handleCommandExecuted.bind(this);
	};
	LREPSerializer.prototype.exit = function() {
		this.getCommandStack().removeCommandExecutionHandler(this._fnHandleCommandExecuted);
	};
	LREPSerializer.prototype._isPersistedChange = function(oPreparedChange) {
		return !!this.getCommandStack()._aPersistedChanges
			&& this.getCommandStack()._aPersistedChanges.indexOf(oPreparedChange.getId()) !== -1;
	};

	LREPSerializer.prototype.handleCommandExecuted = function(oEvent) {
		return (function(oEvent) {
			var oParams = oEvent;
			this._lastPromise = this._lastPromise.catch(function() {
				// _lastPromise chain must not be interrupted
			}).then(function() {
				var aCommands = this.getCommandStack().getSubCommands(oParams.command);
				var oAppComponent;
				var aFlexObjects = [];
				if (oParams.undo) {
					aCommands.forEach(function(oCommand) {
						// for revertable changes which don't belong to LREP (variantSwitch) or runtime only changes
						if (!(oCommand instanceof FlexCommand || oCommand instanceof AppDescriptorCommand)
							|| oCommand.getRuntimeOnly()) {
							return;
						}
						var oChange = oCommand.getPreparedChange();
						oAppComponent = oCommand.getAppComponent();
						if (oAppComponent) {
							aFlexObjects.push(oChange);
						}
					});
					if (oAppComponent) {
						return PersistenceWriteAPI.remove({
							flexObjects: aFlexObjects,
							selector: oAppComponent
						});
					}
					return Promise.resolve();
				}
				var aDescriptorCreateAndAdd = [];
				aCommands.forEach(function(oCommand) {
					// Runtime only changes should not be added to the persistence
					if (oCommand.getRuntimeOnly()) {
						return;
					}
					if (oCommand instanceof FlexCommand) {
						oAppComponent = oCommand.getAppComponent();
						if (oAppComponent) {
							var oPreparedChange = oCommand.getPreparedChange();
							if (!this._isPersistedChange(oPreparedChange)) {
								aFlexObjects.push(oCommand.getPreparedChange());
							}
						}
					} else if (oCommand instanceof AppDescriptorCommand) {
						aDescriptorCreateAndAdd.push(oCommand.createAndStoreChange());
					}
				}.bind(this));
				if (oAppComponent) {
					PersistenceWriteAPI.add({flexObjects: aFlexObjects, selector: oAppComponent});
				}
				return Promise.all(aDescriptorCreateAndAdd);
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
			return aCommands.some(function(oCommand) {
				return !!oCommand.needsReload;
			});
		}.bind(this));
		return this._lastPromise;
	};
	/**
	 * Serializes and saves all changes to LREP
	 * In case of Base Applications (no App Variants) the App Descriptor Changes
	 * and UI Changes are saved in different Flex Persistence instances,
	 * so we have to call save twice. For App Variants all the changes are saved in one place.
	 * @param {object} mPropertyBag - Property bag
	 * @param {boolean} mPropertyBag.saveAsDraft - save the changes as a draft
	 * @param {string} [mPropertyBag.layer] - Layer for which the changes should be saved
	 * @param {boolean} [mPropertyBag.removeOtherLayerChanges=false] - Whether to remove changes on other layers before saving
	 * @param {string} [mPropertyBag.version] - Version to load into Flex State after saving (e.g. undefined when exiting RTA)
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation to load into Flex State after saving (e.g. undefined when exiting RTA)
	 * @returns {Promise} return empty promise
	 * @public
	 */
	LREPSerializer.prototype.saveCommands = function(mPropertyBag) {
		this._lastPromise = this._lastPromise.catch(function(oError) {
			Log.error(oError);
			// _lastPromise chain must not be interrupted
		}).then(function() {
			var oRootControl = getRootControlInstance(this.getRootControl());
			if (!oRootControl) {
				throw new Error("Can't save commands without root control instance!");
			}
			return PersistenceWriteAPI.save({
				selector: oRootControl,
				skipUpdateCache: false,
				draft: !!mPropertyBag.saveAsDraft,
				layer: mPropertyBag.layer,
				removeOtherLayerChanges: !!mPropertyBag.removeOtherLayerChanges,
				version: mPropertyBag.version,
				adaptationId: mPropertyBag.adaptationId,
				condenseAnyLayer: mPropertyBag.condenseAnyLayer
			});
		}.bind(this))
		.then(function() {
			Log.info("UI adaptation successfully wrote changes to the persistence");
			this.getCommandStack().setSaved(true);
			this.getCommandStack().removeAllCommands();
		}.bind(this));

		return this._lastPromise;
	};

	LREPSerializer.prototype._triggerUndoChanges = function(bRemoveChanges) {
		var oCommandStack = this.getCommandStack();
		var aPromises = [];

		var aCommands = oCommandStack.getAllExecutedCommands();

		if (bRemoveChanges) {
			// Calling "undo" from the stack, the serializer is also informed of the
			// command execution and clears the dirty changes from the persistence
			aCommands.forEach(function() {
				// Undo on the stack already starts from the last command
				aPromises.push(oCommandStack.undo.bind(oCommandStack));
			});
		} else {
			aCommands.forEach(function(oCommand) {
				aPromises.push(oCommand.undo.bind(oCommand));
			});
			// The last command has to be undone first, therefore reversing is required
			aPromises = aPromises.reverse();
		}

		return FlUtils.execPromiseQueueSequentially(aPromises, false, true);
	};

	/**
	 * @description
	 * At this point command stack is not aware if the changes have been already booked for the new app variant.
	 * Therefore if there shall be some UI changes present in command stack, we undo all the changes till the beginning.
	 * In the last when user presses 'Save and Exit', there will be no change registered for the current app.
	 * @param {boolean} bRemoveChanges if LREPSerializer should clear the dirty changes in the persistence
	 * @returns {Promise} returns a promise with true or false
	 */
	LREPSerializer.prototype.clearCommandStack = function(bRemoveChanges) {
		var oCommandStack = this.getCommandStack();

		// Detach the event 'commandExecuted' here to stop the communication of LREPSerializer with Flex
		if (!bRemoveChanges) {
			oCommandStack.detachCommandExecuted(this.handleCommandExecuted.bind(this));
		}
		return this._triggerUndoChanges(bRemoveChanges)
		.then(function() {
			oCommandStack.removeAllCommands();
			// Attach the event 'commandExecuted' here to start the communication of LREPSerializer with Flex
			if (!bRemoveChanges) {
				oCommandStack.attachCommandExecuted(this.handleCommandExecuted.bind(this));
			}
			return true;
		}.bind(this));
	};

	return LREPSerializer;
});
