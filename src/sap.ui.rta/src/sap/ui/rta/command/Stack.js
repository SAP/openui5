/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Lib",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/rta/command/ManifestCommand",
	"sap/ui/rta/command/Settings",
	"sap/ui/rta/util/showMessageBox"
], function(
	ManagedObject,
	JsControlTreeModifier,
	Lib,
	PersistenceWriteAPI,
	FlUtils,
	CompositeCommand,
	FlexCommand,
	ManifestCommand,
	Settings,
	showMessageBox
) {
	"use strict";

	function toAvailableChanges(mChanges, aChanges, sFileName) {
		var oChange = mChanges[sFileName];
		if (oChange) {
			aChanges.push(oChange);
		}
		return aChanges;
	}

	function pushToStack(oComponent, mComposite, oStack, oChange) {
		var oSelector = oChange.getSelector && oChange.getSelector();
		var oCommand = new Settings({
			selector: oSelector,
			changeType: oChange.getChangeType(),
			element: JsControlTreeModifier.bySelector(oSelector, oComponent)
		});
		oCommand._oPreparedChange = oChange;
		// check if change belongs to a composite command
		var sCompositeId = oChange.getSupportInformation().compositeCommand;
		if (sCompositeId) {
			if (!mComposite[sCompositeId]) {
				mComposite[sCompositeId] = new CompositeCommand();
				oStack.pushExecutedCommand(mComposite[sCompositeId]);
			}
			mComposite[sCompositeId].addCommand(oCommand);
		} else {
			oStack.pushExecutedCommand(oCommand);
		}
	}

	// If changes are discarded (e.g. after a variant switch), the corresponding commands are not relevant for save
	function handleDiscardedChanges(aDiscardedChanges, bSaveRelevant) {
		const aAllExecutedCommands = this.getAllExecutedCommands();
		aDiscardedChanges.forEach((oChange) => {
			aAllExecutedCommands.some((oExecutedCommand) => {
				// As the getPreparedChange method can return an array or a object, we need to
				// check for type and handle accordingly
				// for example, the ControlVariantSaveAs command returns an array of changes
				const vPreparedChange = oExecutedCommand.getPreparedChange?.();
				if (Array.isArray(vPreparedChange)) {
					return vPreparedChange.some((oPreparedChangeItem) => {
						if (oPreparedChangeItem.getId() === oChange.getId()) {
							oExecutedCommand.setRelevantForSave(bSaveRelevant);
							return true;
						}
						return false;
					});
				} else if (vPreparedChange) {
					if (vPreparedChange.getId() === oChange.getId()) {
						oExecutedCommand.setRelevantForSave(bSaveRelevant);
						return true;
					}
					return false;
				}
				return false;
			});
		});
	}

	/**
	 * Basic implementation for the command stack pattern.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Stack
	 */
	var Stack = ManagedObject.extend("sap.ui.rta.command.Stack", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				/**
				 * If the stack was saved at least once
				 */
				saved: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Promise is resolved when last command of the stack is executed
				 */
				lastCommandExecuted: {
					type: "object",
					defaultValue: Promise.resolve()
				},

				/**
				 * Promise is resolved when last command of the stack is unexecuted
				 */
				lastCommandUnExecuted: {
					type: "object",
					defaultValue: Promise.resolve()
				}

			},
			aggregations: {
				commands: {
					type: "sap.ui.rta.command.BaseCommand",
					multiple: true
				}
			},
			events: {
				/**
				 * Fired if the Stack changes because of a change execution or if commands get removed.
				 */
				modified: {}
			}
		}
	});

	/**
	 * Creates a stack prefilled with Settings commands. Every command contains a change from the given file name list
	 *
	 * @param {sap.ui.base.ManagedObject} oControl - Used to get the component
	 * @param {string[]} aFileNames - Array of file names of changes the stack should be initialized with
	 * @returns {Promise} Resolves with a stack as parameter
	 */
	Stack.initializeWithChanges = function(oControl, aFileNames) {
		var oStack = new Stack();
		oStack._aPersistedChanges = aFileNames;
		if (aFileNames && aFileNames.length > 0) {
			var oComponent = FlUtils.getAppComponentForControl(oControl);
			var mPropertyBag = {
				selector: oComponent,
				invalidateCache: false
			};
			return PersistenceWriteAPI._getUIChanges(mPropertyBag)

			.then(function(aChanges) {
				var mComposite = {};
				var mChanges = {};
				aChanges.forEach(function(oChange) {
					mChanges[oChange.getId()] = oChange;
				});
				aFileNames
				.reduce(toAvailableChanges.bind(null, mChanges), [])
				.forEach(pushToStack.bind(null, oComponent, mComposite, oStack));
				return oStack;
			});
		}
		return Promise.resolve(oStack);
	};

	Stack.prototype.init = function() {
		this._aCommandExecutionHandler = [];
		this._toBeExecuted = -1;
	};

	Stack.prototype._getCommandToBeExecuted = function() {
		return this.getCommands()[this._toBeExecuted];
	};

	/**
	 * Allows to push a command on the stack that has already been executed and shouldn't be executed next
	 *
	 * @param {sap.ui.rta.command.FlexCommand} oCommand command to push to the stack
	 * @public
	 */
	Stack.prototype.pushExecutedCommand = function(oCommand) {
		this.push(oCommand, true);
		this.fireModified();
	};

	Stack.prototype.push = function(oCommand, bExecuted) {
		// undone commands have to be removed as a new command is added
		if (this._bUndoneCommands) {
			this._bUndoneCommands = false; // distinguish undone commands from not yet executed commands
			while (this._toBeExecuted > -1) {
				this.pop();
			}
		}
		this.insertCommand(oCommand, 0);
		if (!bExecuted) {
			this._toBeExecuted++;
		}
	};

	Stack.prototype.top = function() {
		return this.getCommands()[0];
	};

	Stack.prototype.pop = function() {
		if (this._toBeExecuted > -1) {
			this._toBeExecuted--;
		}
		return this.removeCommand(0);
	};

	Stack.prototype.removeCommand = function(vObject, bSuppressInvalidate) {
		var oRemovedCommand = this.removeAggregation("commands", vObject, bSuppressInvalidate);
		return oRemovedCommand;
	};

	Stack.prototype.removeAllCommands = function(bSuppressInvalidate) {
		var aCommands = this.removeAllAggregation("commands", bSuppressInvalidate);
		this._toBeExecuted = -1;
		this.fireModified();
		return aCommands;
	};

	Stack.prototype.isEmpty = function() {
		return this.getCommands().length === 0;
	};

	async function addCommandChangesToPersistence(oCommand) {
		let oAppComponent;
		const aSubCommands = this.getSubCommands(oCommand);
		const aManifestPromises = [];
		let aChanges = aSubCommands.map((oSubCommand) => {
			// Filter out runtime only changes
			if (oSubCommand.getRuntimeOnly()) {
				return undefined;
			}
			// Manifest changes are stored separately
			if (oSubCommand instanceof ManifestCommand) {
				aManifestPromises.push(oSubCommand.createAndStoreChange());
				return undefined;
			}
			if (oSubCommand instanceof FlexCommand) {
				oAppComponent = oSubCommand.getAppComponent();
				if (oAppComponent) {
					return oSubCommand.getPreparedChange();
				}
			}
			return undefined;
		}).filter(Boolean);
		await Promise.all(aManifestPromises);
		// Filter out persisted changes
		if (this._aPersistedChanges) {
			aChanges = aChanges.filter((oChange) => this._aPersistedChanges.indexOf(oChange.getId()) === -1);
		}
		if (oAppComponent) {
			PersistenceWriteAPI.add({
				flexObjects: aChanges,
				selector: oAppComponent
			});
		}
	}

	function removeCommandChangesFromPersistence(oCommand) {
		let oAppComponent;
		const aFlexObjects = [];
		const aSubCommands = this.getSubCommands(oCommand);
		aSubCommands.forEach((oSubCommand) => {
			// for revertable changes which don't belong to LREP (variantSwitch) or runtime only changes
			if (!(oSubCommand instanceof FlexCommand || oSubCommand instanceof ManifestCommand)
				|| oSubCommand.getRuntimeOnly()) {
				return;
			}
			const oChange = oSubCommand.getPreparedChange();
			oAppComponent = oSubCommand.getAppComponent();
			if (oAppComponent) {
				aFlexObjects.push(oChange);
			}
		});
		if (oAppComponent) {
			PersistenceWriteAPI.remove({
				flexObjects: aFlexObjects,
				selector: oAppComponent
			});
		}
	}

	Stack.prototype.execute = function() {
		this.setLastCommandExecuted(
			this.getLastCommandExecuted().catch(() => {
			// continue also if previous command failed
			}).then(async () => {
				var oCommand = this._getCommandToBeExecuted();
				if (oCommand) {
					try {
						await addCommandChangesToPersistence.call(this, oCommand);
						await oCommand.execute();
						this._toBeExecuted--;
						const aDiscardedChanges = oCommand.getDiscardedChanges?.();
						if (aDiscardedChanges) {
							handleDiscardedChanges.call(this, aDiscardedChanges, false);
						}
						this.fireModified();
					} catch (oCaughtError) {
						const oError = oCaughtError || new Error("Executing of the change failed.");
						oError.index = this._toBeExecuted;
						oError.command = this.removeCommand(this._toBeExecuted); // remove failing command
						this._toBeExecuted--;
						// Remove Flex Changes for failed command from persistence
						removeCommandChangesFromPersistence.call(this, oError.command);
						var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
						// AddXMLAtExtensionPoint errors explain to the user what they did wrong, so they shouldn't open an incident
						const sErrorMessage = oCommand.isA("sap.ui.rta.command.AddXMLAtExtensionPoint") ?
							oError.message : oRtaResourceBundle.getText("MSG_GENERIC_ERROR_MESSAGE", [oError.message]);
						showMessageBox(
							sErrorMessage,
							{title: oRtaResourceBundle.getText("HEADER_ERROR")},
							"error"
						);
						throw oError;
					}
				}
				return undefined;
			})
		);
		return this.getLastCommandExecuted();
	};

	Stack.prototype._unExecute = function() {
		this.setLastCommandUnExecuted(
			this.getLastCommandUnExecuted().catch(() => {
			// continue also if previous undo failed
			}).then(async () => {
				if (this.canUndo()) {
					this._bUndoneCommands = true;
					this._toBeExecuted++;
					var oCommand = this._getCommandToBeExecuted();
					const aDiscardedChanges = oCommand.getDiscardedChanges?.();
					if (oCommand) {
						await oCommand.undo();
						removeCommandChangesFromPersistence.call(this, oCommand);
						if (aDiscardedChanges) {
							handleDiscardedChanges.call(this, aDiscardedChanges, true);
						}
						this.fireModified();
					}
				}
			})
		);
		return this.getLastCommandUnExecuted();
	};

	Stack.prototype.canUndo = function() {
		return (this._toBeExecuted + 1) < this.getCommands().length;
	};

	Stack.prototype.canSave = function() {
		return this.canUndo() && this.getAllExecutedCommands().some(function(oCommand) {
			return oCommand.getRelevantForSave();
		});
	};

	Stack.prototype.undo = function() {
		return this._unExecute();
	};

	Stack.prototype.canRedo = function() {
		return !!this._getCommandToBeExecuted();
	};

	Stack.prototype.redo = function() {
		return this.execute();
	};

	Stack.prototype.pushAndExecute = function(oCommand) {
		this.push(oCommand);
		return this.execute();
	};

	/**
	 * Decomposite all executed commands from the stack
	 *
	 * @returns {object} list of all executed commands
	 * @public
	 */
	Stack.prototype.getAllExecutedCommands = function() {
		var aAllExecutedCommands = [];
		var aCommands = this.getCommands();
		for (var i = aCommands.length - 1; i > this._toBeExecuted; i--) {
			var aSubCommands = this.getSubCommands(aCommands[i]);
			aAllExecutedCommands = aAllExecutedCommands.concat(aSubCommands);
		}
		return aAllExecutedCommands;
	};

	/**
	 * Decomposite command to subcommands (composite commands will be splitted into array of regular commands)
	 *
	 * @param {sap.ui.rta.command.FlexCommand} oCommand command to push to the stack
	 * @returns {object} aCommands - list of sub commands
	 * @private
	 */
	Stack.prototype.getSubCommands = function(oCommand) {
		var aCommands = [];
		if (oCommand.getCommands) {
			oCommand.getCommands().forEach(function(oSubCommand) {
				var aSubCommands = this.getSubCommands(oSubCommand);
				aCommands = aCommands.concat(aSubCommands);
			}, this);
		} else {
			aCommands.push(oCommand);
		}

		return aCommands;
	};

	/**
	 * Combines the last two commands into a composite command
	 *
	 * @private
	 */
	Stack.prototype.compositeLastTwoCommands = function() {
		var oLastCommand = this.pop();
		var oSecondLastCommand = this.pop();

		var oCompositeCommand = new CompositeCommand();
		oCompositeCommand.addCommand(oSecondLastCommand);
		oCompositeCommand.addCommand(oLastCommand);
		this.push(oCompositeCommand);
	};

	return Stack;
});