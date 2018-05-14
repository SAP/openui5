/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/rta/command/LREPSerializer',
	'sap/ui/rta/command/Stack',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Utils',
	'sap/ui/fl/Change',
	'sap/ui/fl/ChangePersistence',
	'sap/m/Input',
	'sap/m/Panel',
	'sap/ui/thirdparty/sinon'
], function(
	CommandFactory,
	DesignTimeMetadata,
	CommandSerializer,
	CommandStack,
	ChangeRegistry,
	FlUtils,
	Change,
	ChangePersistence,
	Input,
	Panel,
	sinon
){
	"use strict";
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a Selection plugin and designtime in MultiSelection mode and controls with custom dt metadata to simulate different cases...", {
		beforeEach : function(assert) {
			this.oComponent = new sap.ui.core.UIComponent();
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(this.oComponent);

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Input": {
					"hideControl" : {
						completeChangeContent: function() {},
						applyChange: function() {return Promise.resolve();},
						revertChange: function(){}
					}
				}
			});

			// Create command stack with some commands
			this.oCommandStack = new CommandStack();
			this.oInput1 = new Input({id : "input1"});
			this.oInput2 = new Input({id : "input2"});
			this.oPanel = new Panel({
				id : "panel",
				content : [this.oInput1, this.oInput2]});

			this.oInputDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
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
		afterEach : function(assert) {
			this.oCommandStack.destroy();
			this.oSerializer.destroy();
			this.oPanel.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when 2 Changes get executed at the same time", function(assert) {
		var done = assert.async();

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);
		this.oRemoveCommand2 = CommandFactory.getCommandFor(this.oInput2, "Remove", {
			removedElement : this.oInput2
		}, this.oInputDesignTimeMetadata);

		var iCounter = 0;
		var aInputs = [this.oInput1, this.oInput2];
		this.oCommandStack.attachCommandExecuted(function(oEvent) {
			assert.deepEqual(oEvent.getParameter("command").getElement(), aInputs[iCounter], "then both commands get executed in the correct order");
			iCounter++;

			if (iCounter === 2) {
				done();
			}
		});

		this.oCommandStack.pushAndExecute(this.oRemoveCommand1);
		this.oCommandStack.pushAndExecute(this.oRemoveCommand2);
	});

	QUnit.module("Given an array of dirty changes...", {
		beforeEach : function(assert) {
			this.oComponent = new sap.ui.core.UIComponent("MyComponent");
			var mComponentProperties = {
					name: "MyComponent",
					appVersion: "1.2.3"
				};
			this.oChangePersistence = new ChangePersistence(mComponentProperties);

			this.oChangeDefinition1 = {
				"fileName": "fileName1",
				"selector": {
					"id": "field1",
					"idIsLocal": true
				},
				support: {}
			};
			this.oChangeDefinition2 = {
				"fileName": "fileName2",
				"selector": {
					"id": "field2",
					"idIsLocal": true
				},
				support: {}
			};
			this.oChangeDefinitionForComposite11 = {
				"fileName": "fileName11",
				"selector": {
					"id": "field1",
					"idIsLocal": true
				},
				support: {
					"compositeCommand": "unique_1"
				}
			};
			this.oChangeDefinitionForComposite12 = {
				"fileName": "fileName12",
				"selector": {
					"id": "field2",
					"idIsLocal": true
				},
				support: {
					"compositeCommand": "unique_1"
				}
			};
			this.oChangeDefinitionForComposite21 = {
				"fileName": "fileName21",
				"selector": {
					"id": "field1",
					"idIsLocal": true
				},
				support: {
					"compositeCommand": "unique_2"
				}
			};
			this.oChangeDefinitionForComposite22 = {
				"fileName": "fileName22",
				"selector": {
					"id": "field2",
					"idIsLocal": true
				},
				support: {
					"compositeCommand": "unique_2"
				}
			};

			this.oControl = {id : "a Control"};
			sandbox.stub(sap.ui.fl.ChangePersistenceFactory, "getChangePersistenceForControl").returns(this.oChangePersistence);
			sandbox.stub(FlUtils, "getComponentForControl").returns(this.oComponent);
			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app" : {id: "someApp"}});
		},
		afterEach : function(assert) {
			this.oComponent.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when calling function 'initializeWithChanges' with the array...", function(assert) {
		var aChanges = [new Change(this.oChangeDefinition1), new Change(this.oChangeDefinition2)];
		aChanges[1].setUndoOperations(["undoStack"]);
		sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aChanges));

		return CommandStack.initializeWithChanges(this.oControl, ["fileName1", "fileName2"]).then(function(oStack){
			var aCommands = oStack.getCommands();
			assert.ok(oStack, "an instance of the CommandStack has been created");
			assert.equal(aCommands.length, 2, "the CommandStack contains two commands");
			assert.equal(aCommands[0]._oPreparedChange, aChanges[1], "the first command contains the last change");
			assert.ok(aCommands[0]._aRecordedUndo, "the first command has a recorded undo stack");
			assert.equal(aCommands[1]._oPreparedChange, aChanges[0], "the last command contains the first change");
			assert.notOk(aCommands[1]._aRecordedUndo, "the last command has no recorded undo stack");
		});
	});

	QUnit.test("when calling function 'initializeWithChanges' with the array containing changes from a composite command...", function(assert) {
		var aCompositeChanges = [new Change(this.oChangeDefinitionForComposite11), new Change(this.oChangeDefinitionForComposite12),
		                         new Change(this.oChangeDefinitionForComposite21), new Change(this.oChangeDefinitionForComposite22)];
		sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aCompositeChanges));

		return CommandStack.initializeWithChanges(this.oControl, ["fileName11", "fileName12", "fileName21", "fileName22"]).then(function(oStack){
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

});
