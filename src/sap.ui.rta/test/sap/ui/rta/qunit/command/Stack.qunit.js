/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/rta/command/Stack",
	"sap/ui/thirdparty/sinon-4",
	"sap/m/Input",
	"sap/m/Panel",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/ui/core/Lib"
], function(
	DesignTimeMetadata,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	BaseCommand,
	CompositeCommand,
	CommandFactory,
	CommandSerializer,
	CommandStack,
	sinon,
	Input,
	Panel,
	RtaQunitUtils,
	MessageBox,
	Lib
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a Selection plugin and designtime in MultiSelection mode and controls with custom dt metadata to simulate different cases...", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			// Create command stack with some commands
			this.oCommandStack = new CommandStack();
			this.oInput1 = new Input({id: "input1"});
			this.oInput2 = new Input({id: "input2"});
			this.oPanel = new Panel({
				id: "panel",
				content: [this.oInput1, this.oInput2]
			});

			this.oInputDesignTimeMetadata = new DesignTimeMetadata({
				data: {
					actions: {
						remove: {
							changeType: "hideControl"
						}
					}
				}
			});

			// Create serializer instance
			this.oSerializer = new CommandSerializer({
				commandStack: this.oCommandStack,
				rootControl: this.oPanel
			});
		},
		afterEach() {
			this.oCommandStack.destroy();
			this.oSerializer.destroy();
			this.oComponent.destroy();
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 2 Changes get executed at the same time", function(assert) {
			var done = assert.async();

			var iCounter = 0;
			var aInputs = [this.oInput1, this.oInput2];
			this.oCommandStack.attachCommandExecuted(function(oEvent) {
				assert.deepEqual(oEvent.getParameter("command").getElement(), aInputs[iCounter], "then both commands get executed in the correct order");
				iCounter++;

				if (iCounter === 2) {
					done();
				}
			});

			// Create commands
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)
			.then(function(oRemoveCommand) {
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))
			.then(CommandFactory.getCommandFor.bind(this, this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata))
			.then(function(oRemoveCommand) {
				this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))
			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		QUnit.test("when execute is called and command.execute fails", function(assert) {
			var fnDone = assert.async();
			var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			sandbox.stub(MessageBox, "error").callsFake(function(sMessage, mOptions) {
				assert.strictEqual(sMessage, oRtaResourceBundle.getText("MSG_GENERIC_ERROR_MESSAGE", ["My Error"]), "then the message text is correct");
				assert.deepEqual(mOptions, {title: oRtaResourceBundle.getText("HEADER_ERROR")}, "then the message title is correct");
				fnDone();
			});
			// Create commands
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)
			.then(function(oRemoveCommand) {
				sandbox.stub(oRemoveCommand, "execute").rejects(new Error("My Error"));
				this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this));
		});

		QUnit.test("when 2 Changes get executed and one gets an error after execution", function(assert) {
			var done = assert.async();
			sandbox.stub(MessageBox, "error");
			var iCounter = 0;
			var aInputs = [this.oInput1, this.oInput2];
			this.oCommandStack.attachCommandExecuted(function(oEvent) {
				var bFirstCommand = oEvent.getParameter("command").getElement() === aInputs[0];
				assert.ok(bFirstCommand, `then command number ${iCounter + 1} gets executed`);
				iCounter++;

				if (iCounter === 2) {
					assert.ok(false, "then catch has not be called");
					done();
				}
			});

			// Create commands
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)
			.then(function(oRemoveCommand) {
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))
			.then(CommandFactory.getCommandFor.bind(this, this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata))
			.then(function(oRemoveCommand) {
				// force an error
				sandbox.stub(this.oCommandStack, "getSubCommands").returns(undefined);
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))
			.catch(function(oError) {
				assert.ok(true, `catch has be called during execution of second command - Error: ${oError}`);
				assert.equal(this.oCommandStack._toBeExecuted, -1, "the Variable '_toBeExecuted' is not descreased a second time");
				done();
			}.bind(this));
		});

		QUnit.test("execute / undo / redo with CommandExecutionHandler", function(assert) {
			var oCommandExecutionHandlerStub = sandbox.stub().resolves();
			this.oCommandStack.addCommandExecutionHandler(oCommandExecutionHandlerStub);
			var oFireExecutedStub = sandbox.stub(this.oCommandStack, "fireCommandExecuted");
			var oFireModifiedStub = sandbox.stub(this.oCommandStack, "fireModified");

			var oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				oCommand = oRemoveCommand;
				sandbox.stub(oCommand, "execute").resolves();
				sandbox.stub(oCommand, "undo").resolves();
				return this.oCommandStack.pushAndExecute(oCommand);
			}.bind(this))
			.then(function() {
				assert.ok(oCommandExecutionHandlerStub.calledBefore(oFireExecutedStub), "the executed event waits for the command execution handler");
				assert.ok(oCommandExecutionHandlerStub.calledBefore(oFireModifiedStub), "the modified event waits for the command execution handler");
				assert.strictEqual(oFireModifiedStub.callCount, 1, "the modified event was fired once");
				assert.strictEqual(oFireExecutedStub.callCount, 1, "the executed event was fired once");
			})
			.then(function() {
				return this.oCommandStack.undo();
			}.bind(this))
			.then(function() {
				assert.ok(oCommandExecutionHandlerStub.calledBefore(oFireExecutedStub), "the executed event waits for the command execution handler");
				assert.ok(oCommandExecutionHandlerStub.calledBefore(oFireModifiedStub), "the modified event waits for the command execution handler");
				assert.strictEqual(oFireModifiedStub.callCount, 2, "the modified event was fired once again");
				assert.strictEqual(oFireExecutedStub.callCount, 2, "the executed event was fired once again");
			});
		});
	});

	QUnit.module("Given an array of dirty changes...", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			this.oChangeDefinition1 = {
				fileName: "fileName1",
				selector: {
					id: "field1",
					idIsLocal: true
				},
				support: {}
			};
			this.oChangeDefinition2 = {
				fileName: "fileName2",
				selector: {
					id: "field2",
					idIsLocal: true
				},
				support: {}
			};
			this.oChangeDefinitionForComposite11 = {
				fileName: "fileName11",
				selector: {
					id: "field1",
					idIsLocal: true
				},
				support: {
					compositeCommand: "unique_1"
				}
			};
			this.oChangeDefinitionForComposite12 = {
				fileName: "fileName12",
				selector: {
					id: "field2",
					idIsLocal: true
				},
				support: {
					compositeCommand: "unique_1"
				}
			};
			this.oChangeDefinitionForComposite21 = {
				fileName: "fileName21",
				selector: {
					id: "field1",
					idIsLocal: true
				},
				support: {
					compositeCommand: "unique_2"
				}
			};
			this.oChangeDefinitionForComposite22 = {
				fileName: "fileName22",
				selector: {
					id: "field2",
					idIsLocal: true
				},
				support: {
					compositeCommand: "unique_2"
				}
			};

			this.oControl = {id: "a Control"};
		},
		afterEach() {
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling function 'initializeWithChanges' with the array...", function(assert) {
			var aChanges = [RtaQunitUtils.createUIChange(this.oChangeDefinition1), RtaQunitUtils.createUIChange(this.oChangeDefinition2)];
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);

			return CommandStack.initializeWithChanges(this.oControl, ["fileName1", "fileName2"]).then(function(oStack) {
				var aCommands = oStack.getCommands();
				assert.ok(oStack, "an instance of the CommandStack has been created");
				assert.equal(aCommands.length, 2, "the CommandStack contains two commands");
				assert.equal(aCommands[0]._oPreparedChange, aChanges[1], "the first command contains the last change");
				assert.equal(aCommands[1]._oPreparedChange, aChanges[0], "the last command contains the first change");
			});
		});

		QUnit.test("when calling function 'initializeWithChanges' with the array containing changes from a composite command...", function(assert) {
			var aCompositeChanges = [
				RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite11), RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite12),
				RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite21), RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite22)
			];
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aCompositeChanges);

			return CommandStack.initializeWithChanges(this.oControl, ["fileName11", "fileName12", "fileName21", "fileName22"]).then(function(oStack) {
				var aCommands = oStack.getCommands();
				var aSubCommands1 = oStack.getSubCommands(aCommands[0]);
				var aSubCommands2 = oStack.getSubCommands(aCommands[1]);
				assert.ok(oStack, "an instance of the CommandStack has been created");
				assert.equal(aCommands.length, 2, "the CommandStack contains two commands");
				assert.equal(aSubCommands1.length, 2, "the first command contains two sub-commands");
				assert.equal(aSubCommands2.length, 2, "the second command contains two sub-commands");
				assert.equal(aSubCommands1[0]._oPreparedChange, aCompositeChanges[2], "the first sub-command of the first composite command contains the last change");
				assert.equal(aSubCommands1[1]._oPreparedChange, aCompositeChanges[3], "the second sub-command of the first composite command contains the last change");
				assert.equal(aSubCommands2[0]._oPreparedChange, aCompositeChanges[0], "the first sub-command of the second composite command contains the last change");
				assert.equal(aSubCommands2[1]._oPreparedChange, aCompositeChanges[1], "the second sub-command of the second composite command contains the last change");
			});
		});

		QUnit.test("when calling function 'initializeWithChanges' for a non existent change...", function(assert) {
			var aChanges = [RtaQunitUtils.createUIChange(this.oChangeDefinition1), RtaQunitUtils.createUIChange(this.oChangeDefinition2)];
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);

			return CommandStack.initializeWithChanges(this.oControl, ["unavailableChangeFileName"]).then(function(oStack) {
				assert.ok(oStack, "an instance of the CommandStack has been created");
				var aCommands = oStack.getCommands();
				assert.equal(aCommands.length, 0, "the CommandStack contains no commands");
			});
		});
	});

	QUnit.module("Given a command stack", {
		beforeEach() {
			this.oCommandStack = new CommandStack();
		},
		afterEach() {
			this.oCommandStack.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("canUndo", function(assert) {
			assert.notOk(this.oCommandStack.canUndo(), "then canUndo returns false when the stack is empty");

			var oBaseCommand = new BaseCommand();
			this.oCommandStack.push(oBaseCommand);
			assert.notOk(this.oCommandStack.canUndo(), "then canUndo returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(function() {
				assert.ok(this.oCommandStack.canUndo(), "then canUndo returns true when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave and all commands are relevant for save", function(assert) {
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the stack is empty");
			var oBaseCommand = new BaseCommand();
			this.oCommandStack.push(oBaseCommand);
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(function() {
				assert.ok(this.oCommandStack.canSave(), "then canSave returns true when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave and only some commands are relevant for save", function(assert) {
			var oBaseCommand = new BaseCommand();
			var oBaseCommand2 = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			this.oCommandStack.push(oBaseCommand);
			this.oCommandStack.push(oBaseCommand2);
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(this.oCommandStack.execute.bind(this.oCommandStack))
			.then(function() {
				assert.ok(this.oCommandStack.canSave(), "then canSave returns true when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave and no commands are relevant for save", function(assert) {
			var oBaseCommand = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			this.oCommandStack.push(oBaseCommand);
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(function() {
				assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave with composite command - some are relevant for save", function(assert) {
			var oBaseCommand = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			var oBaseCommand2 = new BaseCommand();
			var oCompositeCommand = new CompositeCommand();
			oCompositeCommand.addCommand(oBaseCommand);
			oCompositeCommand.addCommand(oBaseCommand2);

			return this.oCommandStack.pushAndExecute(oCompositeCommand)
			.then(function() {
				assert.ok(this.oCommandStack.canSave(), "then canSave returns true when the composite command was executed");
			}.bind(this));
		});

		QUnit.test("canSave with composite command - none are relevant for save", function(assert) {
			var oBaseCommand = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			var oBaseCommand2 = new BaseCommand();
			oBaseCommand2.setRelevantForSave(false);
			var oCompositeCommand = new CompositeCommand();
			oCompositeCommand.addCommand(oBaseCommand);
			oCompositeCommand.addCommand(oBaseCommand2);

			return this.oCommandStack.pushAndExecute(oCompositeCommand)
			.then(function() {
				assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the composite command was executed");
			}.bind(this));
		});

		QUnit.test("compositeLastTwoCommands", function(assert) {
			var oBaseCommand1 = new BaseCommand();
			var oBaseCommand2 = new BaseCommand();
			this.oCommandStack.push(oBaseCommand1);
			this.oCommandStack.push(oBaseCommand2);

			this.oCommandStack.compositeLastTwoCommands();
			var oCompositeCommand = this.oCommandStack.top();
			assert.deepEqual(oCompositeCommand.getCommands(), [oBaseCommand1, oBaseCommand2], "then the composite command was created correctly");
			assert.deepEqual(this.oCommandStack.getCommands().length, 1, "then the stack has only one command");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});