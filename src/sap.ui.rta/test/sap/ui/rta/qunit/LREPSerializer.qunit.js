/* global waitForChangesToReachedLrepAtTheEnd */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	//internal:
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/rta/command/LREPSerializer',
	'sap/ui/rta/command/Stack',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/fl/FakeLrepConnectorLocalStorage',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/rta/qunit/RtaQunitUtils',
	//should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function(
	CommandFactory,
	DesignTimeMetadata,
	CommandSerializer,
	CommandStack,
	FakeLrepLocalStorage,
	FakeLrepConnectorLocalStorage,
	ChangeRegistry
) {
	"use strict";

	// QUnit to be started explicitly
    QUnit.config.autostart = false;

	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		}
	};
	sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	FakeLrepConnectorLocalStorage.enableFakeConnector();

	QUnit.module("Given a command serializer loaded with an RTA command stack containing commands", {
		beforeEach : function(assert) {
			// Prepare fake LRep
			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Input": {
					"hideControl" : { completeChangeContent: function() {} }
				}
			});

			// Create command stack with some commands
			this.oCommandStack = new CommandStack();
			this.oInput1 = new sap.m.Input({id : "input1"});
			this.oInput2 = new sap.m.Input({id : "input2"});
			this.oPanel = new sap.m.Panel({
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
			FakeLrepLocalStorage.deleteChanges();
		}
	});


	QUnit.test("when the LREPSerializer.saveCommands gets called with 2 remove commands created via CommandFactory", function(assert) {
		// then two changes are expected to be written in LREP
		waitForChangesToReachedLrepAtTheEnd(2, assert);

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);
		this.oRemoveCommand2 = CommandFactory.getCommandFor(this.oInput2, "Remove", {
			removedElement : this.oInput2
		}, this.oInputDesignTimeMetadata);

		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand2);

		// Save the commands
		return this.oSerializer.saveCommands().then(function() {
			assert.ok( true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal( this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
		}.bind(this));
	});

	QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 remove command for a destroyed control", function(assert) {
		// then one are expected to be written in LREP
		waitForChangesToReachedLrepAtTheEnd(1, assert);

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);

		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);

		this.oInput1.destroy();

		var aCommands = this.oCommandStack.getAllExecutedCommands();
		assert.strictEqual(aCommands[0].getElement(), undefined, "then oInput1 cannot be found");
		assert.strictEqual(aCommands[0].getSelector().id, "input1", "then oRemoveCommand1 selector was set");

		//Save the commands
		return this.oSerializer.saveCommands().then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
		}.bind(this));
	});

	// Start QUnit tests
	QUnit.start();
});