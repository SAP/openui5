/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/Settings",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/rta/util/showMessageBox",
	"sap/ui/core/Core"
], function(
	ManagedObject,
	PersistenceWriteAPI,
	FlUtils,
	Settings,
	CompositeCommand,
	JsControlTreeModifier,
	showMessageBox,
	Core
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
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Stack = ManagedObject.extend("sap.ui.rta.command.Stack", {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			aggregations: {
				commands: {
					type: "sap.ui.rta.command.BaseCommand",
					multiple: true
				}
			},
			events: {
				modified: {},
				commandExecuted: {
					parameters: {
						command: {type: "object"},
						undo: {type: "boolean"}
					}
				}
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

	/**
	* @param {function} fnHandler Handler are called when commands are executed or undone. They get parameter
	* like the commandExecuted event and the stack will wait for any processing
	* until they are done.
	*/
	Stack.prototype.addCommandExecutionHandler = function(fnHandler) {
		this._aCommandExecutionHandler.push(fnHandler);
	};
	Stack.prototype.removeCommandExecutionHandler = function(fnHandler) {
		var i = this._aCommandExecutionHandler.indexOf(fnHandler);
		if (i > -1) {
			this._aCommandExecutionHandler.splice(i, 1);
		}
	};
	Stack.prototype.init = function() {
		this._aCommandExecutionHandler = [];
		this._toBeExecuted = -1;
		this._oLastCommand = Promise.resolve();
	};

	Stack.prototype._waitForCommandExecutionHandler = function(mParam) {
		return Promise.all(this._aCommandExecutionHandler.map(function(fnHandler) {
			return fnHandler(mParam);
		}));
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
		this.fireModified();
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
		this.fireModified();
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

	Stack.prototype.execute = function() {
		this._oLastCommand = this._oLastCommand.catch(function() {
			//continue also if previous command failed
		}).then(function() {
			var oCommand = this._getCommandToBeExecuted();
			if (oCommand) {
				var mParam = {
					command: oCommand,
					undo: false
				};
				return oCommand.execute()

				.then(this._waitForCommandExecutionHandler.bind(this, mParam))

				.then(function() {
					this._toBeExecuted--;
					this.fireCommandExecuted(mParam);
					this.fireModified();
				}.bind(this))

				.catch(function(oError) {
					oError = oError || new Error("Executing of the change failed.");
					oError.index = this._toBeExecuted;
					oError.command = this.removeCommand(this._toBeExecuted); // remove failing command
					this._toBeExecuted--;
					var oRtaResourceBundle = Core.getLibraryResourceBundle("sap.ui.rta");
					showMessageBox(
						oRtaResourceBundle.getText("MSG_GENERIC_ERROR_MESSAGE", oError.message),
						{title: oRtaResourceBundle.getText("HEADER_ERROR")},
						"error"
					);
					return Promise.reject(oError);
				}.bind(this));
			}
			return undefined;
		}.bind(this));
		return this._oLastCommand;
	};

	Stack.prototype._unExecute = function() {
		if (this.canUndo()) {
			this._bUndoneCommands = true;
			this._toBeExecuted++;
			var oCommand = this._getCommandToBeExecuted();
			if (oCommand) {
				var mParam = {
					command: oCommand,
					undo: true
				};
				return oCommand.undo()

				.then(this._waitForCommandExecutionHandler.bind(this, mParam))

				.then(function() {
					this.fireCommandExecuted(mParam);
					this.fireModified();
				}.bind(this));
			}
			return Promise.resolve();
		}
		return Promise.resolve();
	};

	Stack.prototype.canUndo = function() {
		return (this._toBeExecuted + 1) < this.getCommands().length;
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

	return Stack;
});