/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/rta/command/AddXMLAtExtensionPoint",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ControlVariantSwitch",
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
	AddXMLAtExtensionPointCommand,
	BaseCommand,
	CompositeCommand,
	CommandFactory,
	ControlVariantSwitchCommand,
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

	const sandbox = sinon.createSandbox();

	QUnit.module("Given a Selection plugin and designtime in MultiSelection mode and controls with custom dt metadata...", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

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
		QUnit.test("when 2 Changes get executed", async function(assert) {
			const oAddSpy = sandbox.spy(PersistenceWriteAPI, "add");

			const oRemoveCommand = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			const oRemoveCommandExecuteSpy = sandbox.spy(oRemoveCommand, "execute");
			await this.oCommandStack.pushAndExecute(oRemoveCommand);
			assert.ok(oAddSpy.calledOnce, "then the add function was called once");
			assert.ok(oAddSpy.calledBefore(oRemoveCommandExecuteSpy), "then the add function was called before the execute function");
			assert.ok(oRemoveCommandExecuteSpy.calledOnce, "then the execute function was called once");
			assert.ok(oAddSpy.calledWith({
				flexObjects: [oRemoveCommand.getPreparedChange()],
				selector: oRemoveCommand.getAppComponent()
			}), "then the PersistenceWriteAPI add function was called with the right parameters");

			const oRemoveCommand2 = await CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata);
			const oRemoveCommand2ExecuteSpy = sandbox.spy(oRemoveCommand2, "execute");
			assert.ok(oAddSpy.calledBefore(oRemoveCommand2ExecuteSpy), "then the add function was called before the execute function");
			await this.oCommandStack.pushAndExecute(oRemoveCommand2);
			assert.ok(oRemoveCommand2ExecuteSpy.calledOnce, "then the execute function was called once");
			assert.strictEqual(oAddSpy.callCount, 2, "then the add function was called again");
			assert.ok(oAddSpy.calledWith({
				flexObjects: [oRemoveCommand2.getPreparedChange()],
				selector: oRemoveCommand2.getAppComponent()
			}), "then the PersistenceWriteAPI add function was called with the right parameters");
		});

		QUnit.test("when execute is called and command.execute fails", function(assert) {
			const fnDone = assert.async();
			const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			const oRemoveSpy = sandbox.spy(PersistenceWriteAPI, "remove");
			sandbox.stub(MessageBox, "error").callsFake(function(sMessage, mOptions) {
				assert.strictEqual(
					sMessage,
					oRtaResourceBundle.getText("MSG_GENERIC_ERROR_MESSAGE", ["My Error"]),
					"then the message text is correct"
				);
				assert.deepEqual(mOptions, {title: oRtaResourceBundle.getText("HEADER_ERROR")}, "then the message title is correct");
				fnDone();
			});
			// Create commands
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)
			.then(function(oRemoveCommand) {
				sandbox.stub(oRemoveCommand, "execute").rejects(new Error("My Error"));
				this.oCommandStack.pushAndExecute(oRemoveCommand).catch(() => {
					assert.ok(oRemoveSpy.calledWith({
						flexObjects: [oRemoveCommand.getPreparedChange()],
						selector: oRemoveCommand.getAppComponent()
					}), "then the PersistenceWriteAPI remove function was called with the right parameters");
				});
			}.bind(this));
		});

		QUnit.test("when execute is called and command.execute fails, and the error was in a AddXMLAtExtensionPoint command", function(assert) {
			const fnDone = assert.async();
			const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			const oRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove").resolves();
			sandbox.stub(MessageBox, "error").callsFake(function(sMessage, mOptions) {
				assert.ok(oRemoveStub.calledOnce, "then the remove function was called once");
				assert.strictEqual(
					sMessage,
					"My Error",
					"then only the actual error message is shown without the generic error message prefix"
				);
				assert.deepEqual(mOptions, {title: oRtaResourceBundle.getText("HEADER_ERROR")}, "then the message title is correct");
				fnDone();
			});
			// Create commands
			const oAddXmlAtExtensionPointCommand = new AddXMLAtExtensionPointCommand();
			sandbox.stub(oAddXmlAtExtensionPointCommand, "getAppComponent").returns(this.oComponent);
			sandbox.stub(oAddXmlAtExtensionPointCommand, "execute").rejects(new Error("My Error"));
			this.oCommandStack.pushAndExecute(oAddXmlAtExtensionPointCommand).catch(() => assert.ok(true, "error expected"));
		});

		QUnit.test("when 2 Changes get executed and one gets an error after execution", async function(assert) {
			sandbox.stub(MessageBox, "error");

			const oRemoveCommand = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			const oRemoveCommandExecuteSpy = sandbox.spy(oRemoveCommand, "execute");
			await this.oCommandStack.pushAndExecute(oRemoveCommand);
			const oRemoveCommand2 = await CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata);
			// force an error
			sandbox.stub(oRemoveCommand2, "execute").rejects(new Error("My Error"));
			const oRemoveSpy = sandbox.spy(PersistenceWriteAPI, "remove");
			try {
				await this.oCommandStack.pushAndExecute(oRemoveCommand2);
			} catch (oError) {
				assert.ok(true, `catch has be called during execution of second command - Error: ${oError}`);
				assert.equal(this.oCommandStack._toBeExecuted, -1, "the Variable '_toBeExecuted' is not decreased a second time");
				assert.ok(oRemoveSpy.calledWith({
					flexObjects: [oRemoveCommand2.getPreparedChange()],
					selector: oRemoveCommand2.getAppComponent()
				}), "then the PersistenceWriteAPI remove function was called for the second command");
				assert.ok(oRemoveCommandExecuteSpy.calledOnce, "then the execute function was called for the first command");
			}
		});

		QUnit.test("stack with a 'remove' command and its change gets discarded by another command", async function(assert) {
			const oDummyChange = {
				getId: () => {
					return "dummyChangeId";
				}
			};
			const oCommand = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			sandbox.stub(oCommand, "execute").resolves();
			sandbox.stub(oCommand, "getPreparedChange").returns(oDummyChange);
			await this.oCommandStack.pushAndExecute(oCommand);
			const oDiscardingCommand = new ControlVariantSwitchCommand();
			sandbox.stub(oDiscardingCommand, "getDiscardedChanges").returns([oDummyChange]);
			sandbox.stub(oDiscardingCommand, "execute").resolves();
			sandbox.stub(oDiscardingCommand, "undo").resolves();
			await this.oCommandStack.pushAndExecute(oDiscardingCommand);
			assert.strictEqual(this.oCommandStack.canSave(), false, "then 'save' is disabled because the remove command was discarded");
			await this.oCommandStack.undo();
			assert.strictEqual(this.oCommandStack.canSave(), true, "then after undo the 'save' is enabled");
			await this.oCommandStack.redo();
			assert.strictEqual(this.oCommandStack.canSave(), false, "then after redo the 'save' is disabled again");
		});

		QUnit.test("stack with a 'remove' command and its change gets discarded by another command but 'getPreparedChange' returns an Array", async function(assert) {
			const oDummyChange = {
				getId: () => {
					return "dummyChangeId";
				}
			};
			const oCommand = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			sandbox.stub(oCommand, "execute").resolves();
			sandbox.stub(oCommand, "getPreparedChange").returns([oDummyChange]);
			await this.oCommandStack.pushAndExecute(oCommand);
			const oDiscardingCommand = new ControlVariantSwitchCommand();
			sandbox.stub(oDiscardingCommand, "getDiscardedChanges").returns([oDummyChange]);
			sandbox.stub(oDiscardingCommand, "execute").resolves();
			sandbox.stub(oDiscardingCommand, "undo").resolves();
			await this.oCommandStack.pushAndExecute(oDiscardingCommand);
			assert.strictEqual(this.oCommandStack.canSave(), false, "then 'save' is disabled because the remove command was discarded");
			await this.oCommandStack.undo();
			assert.strictEqual(this.oCommandStack.canSave(), true, "then after undo the 'save' is enabled");
			await this.oCommandStack.redo();
			assert.strictEqual(this.oCommandStack.canSave(), false, "then after redo the 'save' is disabled again");
		});

		QUnit.test("stack with with a 'remove' command with a change that gets discarded and one that doesn't", async function(assert) {
			const oDummyChange = {
				getId: () => {
					return "dummyChangeId";
				}
			};
			const oDiscardedChange = {
				getId: () => {
					return "discardedChangeId";
				}
			};
			const oCommand = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			sandbox.stub(oCommand, "execute").resolves();
			sandbox.stub(oCommand, "getPreparedChange").returns(oDummyChange);
			await this.oCommandStack.pushAndExecute(oCommand);
			const oCommandToBeDiscarded = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			sandbox.stub(oCommandToBeDiscarded, "execute").resolves();
			sandbox.stub(oCommandToBeDiscarded, "getPreparedChange").returns(oDiscardedChange);
			await this.oCommandStack.pushAndExecute(oCommandToBeDiscarded);
			const oDiscardingCommand = new ControlVariantSwitchCommand();
			sandbox.stub(oDiscardingCommand, "getDiscardedChanges").returns([oDiscardedChange]);
			sandbox.stub(oDiscardingCommand, "execute").resolves();
			sandbox.stub(oDiscardingCommand, "undo").resolves();
			await this.oCommandStack.pushAndExecute(oDiscardingCommand);
			assert.strictEqual(this.oCommandStack.canSave(), true, "then 'save' is enabled because only one command was discarded");
			await this.oCommandStack.undo();
			assert.strictEqual(this.oCommandStack.canSave(), true, "then after undo the 'save' is still enabled");
			await this.oCommandStack.redo();
			assert.strictEqual(this.oCommandStack.canSave(), true, "then after redo the 'save' is still enabled");
		});

		QUnit.test("stack with a 'remove' command and a posterior 'discarding' command does not affect its change", async function(assert) {
			const oDummyChange = {
				getId: () => {
					return "dummyChangeId";
				}
			};
			const oCommand = await CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata);
			sandbox.stub(oCommand, "execute").resolves();
			sandbox.stub(oCommand, "getPreparedChange").returns(oDummyChange);
			await this.oCommandStack.pushAndExecute(oCommand);
			const oDiscardingCommand = new ControlVariantSwitchCommand();
			sandbox.stub(oDiscardingCommand, "getDiscardedChanges").returns([]);
			sandbox.stub(oDiscardingCommand, "execute").resolves();
			sandbox.stub(oDiscardingCommand, "undo").resolves();
			await this.oCommandStack.pushAndExecute(oDiscardingCommand);
			assert.strictEqual(
				this.oCommandStack.canSave(),
				true,
				"then 'save' is enabled because the change from the 'remove' command was not discarded"
			);
			await this.oCommandStack.undo();
			assert.strictEqual(this.oCommandStack.canSave(), true, "then after undo the 'save' is still enabled");
			await this.oCommandStack.redo();
			assert.strictEqual(this.oCommandStack.canSave(), true, "then after redo the 'save' is still enabled");
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
		QUnit.test("when calling function 'initializeWithChanges' with the array...", async function(assert) {
			const aChanges = [RtaQunitUtils.createUIChange(this.oChangeDefinition1), RtaQunitUtils.createUIChange(this.oChangeDefinition2)];
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);

			const oStack = await CommandStack.initializeWithChanges(this.oControl, ["fileName1", "fileName2"]);
			const aCommands = oStack.getCommands();
			assert.ok(oStack, "an instance of the CommandStack has been created");
			assert.equal(aCommands.length, 2, "the CommandStack contains two commands");
			assert.equal(aCommands[0]._oPreparedChange, aChanges[1], "the first command contains the last change");
			assert.equal(aCommands[1]._oPreparedChange, aChanges[0], "the last command contains the first change");
		});

		QUnit.test("when calling function 'initializeWithChanges' with the array containing changes from a composite command...", function(assert) {
			const aCompositeChanges = [
				RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite11),
				RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite12),
				RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite21),
				RtaQunitUtils.createUIChange(this.oChangeDefinitionForComposite22)
			];
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aCompositeChanges);

			return CommandStack.initializeWithChanges(
				this.oControl, ["fileName11", "fileName12", "fileName21", "fileName22"]
			).then(function(oStack) {
				const aCommands = oStack.getCommands();
				const aSubCommands1 = oStack.getSubCommands(aCommands[0]);
				const aSubCommands2 = oStack.getSubCommands(aCommands[1]);
				assert.ok(oStack, "an instance of the CommandStack has been created");
				assert.equal(aCommands.length, 2, "the CommandStack contains two commands");
				assert.equal(aSubCommands1.length, 2, "the first command contains two sub-commands");
				assert.equal(aSubCommands2.length, 2, "the second command contains two sub-commands");
				assert.equal(
					aSubCommands1[0]._oPreparedChange,
					aCompositeChanges[2],
					"the first sub-command of the first composite command contains the last change"
				);
				assert.equal(
					aSubCommands1[1]._oPreparedChange,
					aCompositeChanges[3],
					"the second sub-command of the first composite command contains the last change"
				);
				assert.equal(
					aSubCommands2[0]._oPreparedChange, aCompositeChanges[0],
					"the first sub-command of the second composite command contains the last change"
				);
				assert.equal(
					aSubCommands2[1]._oPreparedChange,
					aCompositeChanges[1],
					"the second sub-command of the second composite command contains the last change"
				);
			});
		});

		QUnit.test("when calling function 'initializeWithChanges' for a non existent change...", function(assert) {
			const aChanges = [RtaQunitUtils.createUIChange(this.oChangeDefinition1), RtaQunitUtils.createUIChange(this.oChangeDefinition2)];
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);

			return CommandStack.initializeWithChanges(this.oControl, ["unavailableChangeFileName"]).then(function(oStack) {
				assert.ok(oStack, "an instance of the CommandStack has been created");
				const aCommands = oStack.getCommands();
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

			const oBaseCommand = new BaseCommand();
			this.oCommandStack.push(oBaseCommand);
			assert.notOk(this.oCommandStack.canUndo(), "then canUndo returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(function() {
				assert.ok(this.oCommandStack.canUndo(), "then canUndo returns true when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave and all commands are relevant for save", function(assert) {
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the stack is empty");
			const oBaseCommand = new BaseCommand();
			this.oCommandStack.push(oBaseCommand);
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(function() {
				assert.ok(this.oCommandStack.canSave(), "then canSave returns true when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave and only some commands are relevant for save", function(assert) {
			const oBaseCommand = new BaseCommand();
			const oBaseCommand2 = new BaseCommand();
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
			const oBaseCommand = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			this.oCommandStack.push(oBaseCommand);
			assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was not executed");

			return this.oCommandStack.execute()
			.then(function() {
				assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the command was executed");
			}.bind(this));
		});

		QUnit.test("canSave with composite command - some are relevant for save", function(assert) {
			const oBaseCommand = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			const oBaseCommand2 = new BaseCommand();
			const oCompositeCommand = new CompositeCommand();
			oCompositeCommand.addCommand(oBaseCommand);
			oCompositeCommand.addCommand(oBaseCommand2);

			return this.oCommandStack.pushAndExecute(oCompositeCommand)
			.then(function() {
				assert.ok(this.oCommandStack.canSave(), "then canSave returns true when the composite command was executed");
			}.bind(this));
		});

		QUnit.test("canSave with composite command - none are relevant for save", function(assert) {
			const oBaseCommand = new BaseCommand();
			oBaseCommand.setRelevantForSave(false);
			const oBaseCommand2 = new BaseCommand();
			oBaseCommand2.setRelevantForSave(false);
			const oCompositeCommand = new CompositeCommand();
			oCompositeCommand.addCommand(oBaseCommand);
			oCompositeCommand.addCommand(oBaseCommand2);

			return this.oCommandStack.pushAndExecute(oCompositeCommand)
			.then(function() {
				assert.notOk(this.oCommandStack.canSave(), "then canSave returns false when the composite command was executed");
			}.bind(this));
		});

		QUnit.test("compositeLastTwoCommands", function(assert) {
			const oBaseCommand1 = new BaseCommand();
			const oBaseCommand2 = new BaseCommand();
			this.oCommandStack.push(oBaseCommand1);
			this.oCommandStack.push(oBaseCommand2);

			this.oCommandStack.compositeLastTwoCommands();
			const oCompositeCommand = this.oCommandStack.top();
			assert.deepEqual(
				oCompositeCommand.getCommands(),
				[oBaseCommand1, oBaseCommand2],
				"then the composite command was created correctly"
			);
			assert.deepEqual(this.oCommandStack.getCommands().length, 1, "then the stack has only one command");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});