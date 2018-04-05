/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

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
	//should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
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
	Panel
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

	QUnit.module("Given an array of two dirty changes...", {
		beforeEach : function(assert) {
			var oComponent = new sap.ui.core.UIComponent("MyComponent");
			var mComponentProperties = {
					name: "MyComponent",
					appVersion: "1.2.3"
				};
			var oChangePersistence = new ChangePersistence(mComponentProperties);

			var oChangeContent1 = {
				"fileName": "fileName1",
				"selector": {
					"id": "field1",
					"idIsLocal": true
				}
			};
			var oChangeContent2 = {
				"fileName": "fileName2",
				"selector": {
					"id": "field2",
					"idIsLocal": true
				}
			};
			this.aChanges = [new Change(oChangeContent1), new Change(oChangeContent2)];
			this.aChanges[1].setUndoOperations(["undoStack"]);
			this.oControl = {id : "a Control"};
			sandbox.stub(sap.ui.fl.ChangePersistenceFactory, "getChangePersistenceForControl").returns(oChangePersistence);
			sandbox.stub(FlUtils, "getComponentForControl").returns(oComponent);
			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app" : {id: "someApp"}});
			sandbox.stub(oChangePersistence, "getChangesForComponent").returns(Promise.resolve(this.aChanges));
		},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when calling function 'initializeWithChanges' with the array...", function(assert) {
		return CommandStack.initializeWithChanges(this.oControl, ["fileName1", "fileName2"]).then(function(oStack){
			var aCommands = oStack.getCommands();
			assert.ok(oStack, "an instance of the CommandStack has been created");
			assert.equal(aCommands.length, 2, "the CommandStack contains two commands");
			assert.equal(aCommands[0]._oPreparedChange, this.aChanges[1], "the first command contains the last change");
			assert.ok(aCommands[0]._aRecordedUndo, "the first command has a recorded undo stack");
			assert.equal(aCommands[1]._oPreparedChange, this.aChanges[0], "the last command contains the first change");
			assert.notOk(aCommands[1]._aRecordedUndo, "the last command has no recorded undo stack");
		}.bind(this));
	});

});
