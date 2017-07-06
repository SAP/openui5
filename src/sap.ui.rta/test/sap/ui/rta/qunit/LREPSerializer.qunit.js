/* global QUnit */

// QUnit to be started explicitly
QUnit.config.autostart = false;
sap.ui.require([
	//internal:
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/rta/command/LREPSerializer',
	'sap/ui/rta/command/Stack',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/fl/FakeLrepConnectorLocalStorage',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/rta/qunit/RtaQunitUtils',
	'sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory',
	'sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory',
	'sap/ui/fl/FlexControllerFactory',
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
	ChangeRegistry,
	RtaQunitUtils,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	FlexControllerFactory,
	sinon
) {
	"use strict";

	// Start QUnit tests
	QUnit.start();

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
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(2, assert);

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);
		this.oRemoveCommand2 = CommandFactory.getCommandFor(this.oInput2, "Remove", {
			removedElement : this.oInput2
		}, this.oInputDesignTimeMetadata);

		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand2);

		var oComponent = this.oRemoveCommand1.getAppComponent();
		var oFlexController = FlexControllerFactory.createForControl(oComponent);
		oFlexController.addPreparedChange(this.oRemoveCommand1.getPreparedChange(), oComponent);
		oFlexController.addPreparedChange(this.oRemoveCommand2.getPreparedChange(), oComponent);

		// Save the commands
		return this.oSerializer.saveCommands().then(function() {
			assert.ok( true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal( this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
		}.bind(this));
	});

	QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 'remove' command for a destroyed control", function(assert) {
		// then one is expected to be written in LREP
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);

		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
		var oComponent = this.oRemoveCommand1.getAppComponent();
		var oFlexController = FlexControllerFactory.createForControl(oComponent);
		oFlexController.addPreparedChange(this.oRemoveCommand1.getPreparedChange(), oComponent);

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

	QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 'remove' command and 2 App Descriptor 'add library' commands", function(assert) {
		// then only the flex change is expected to be written in LREP
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);
		this.oAddLibraryCommand = CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
			reference : "dummyReference",
			requiredLibraries : {
				"sap.ui.dummy" : {
					lazy:false,
					minVersion:"1.48"
				}
			}
		}, {}, {"layer" : "dummyLayer"});
		this.oAddLibraryCommand2 = CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
			reference : "dummyReference2",
			requiredLibraries : {
				"sap.ui.dummy2" : {
					lazy:false,
					minVersion:"1.48"
				}
			}
		}, {}, {"layer" : "dummyLayer"});


		this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
		this.oCommandStack.pushExecutedCommand(this.oAddLibraryCommand);
		this.oCommandStack.pushExecutedCommand(this.oAddLibraryCommand2);

		var oComponent = this.oRemoveCommand1.getAppComponent();
		var oFlexController = FlexControllerFactory.createForControl(oComponent);
		var aDescriptorSubmitPromises = [];
		oFlexController.addPreparedChange(this.oRemoveCommand1.getPreparedChange(), oComponent);
		aDescriptorSubmitPromises.push(this.oAddLibraryCommand.createAndStore());
		aDescriptorSubmitPromises.push(this.oAddLibraryCommand2.createAndStore());

		var done = assert.async();

		var iCalled = 0;

		var oMockDescriptorChange = {
			store : function() {
				iCalled++;
				if (iCalled === 2){
					assert.ok(true, "then the two add library commands are stored");
					done();
				}
			}
		};

		var oMockAddLibraryInlineChange = { };

		sinon.stub(DescriptorInlineChangeFactory, "create_ui5_addLibraries").returns(Promise.resolve(oMockAddLibraryInlineChange));
		sinon.stub(DescriptorChangeFactory.prototype, "createNew").returns(Promise.resolve(oMockDescriptorChange));

		//Save the commands
		return Promise.all(aDescriptorSubmitPromises)
		.then(this.oSerializer.saveCommands())
		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
		}.bind(this));
	});

});
