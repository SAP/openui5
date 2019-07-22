/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/rta/command/Stack",
	"sap/ui/fl/FakeLrepSessionStorage",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/registry/ChangeRegistry",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/VariantManagement",
	"sap/m/Input",
	"sap/m/Panel",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/thirdparty/sinon-4"
], function(
	CommandFactory,
	DesignTimeMetadata,
	CommandSerializer,
	CommandStack,
	FakeLrepSessionStorage,
	FakeLrepConnectorSessionStorage,
	ChangeRegistry,
	RtaQunitUtils,
	flUtils,
	VariantModel,
	VariantManagement,
	Input,
	Panel,
	PersistenceWriteAPI,
	ChangesController,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var COMPONENT_NAME = "someName";
	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		addPropagationListener: function () {

		},
		getPropagationListeners: function () {
			return [];
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return COMPONENT_NAME;
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					},
					id: COMPONENT_NAME
				}
			};
		},
		getModel: function () {return oModel;} // eslint-disable-line no-use-before-define
	};
	var oGetAppComponentForControlStub = sinon.stub(flUtils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	FakeLrepConnectorSessionStorage.enableFakeConnector();

	var oData = {
		variantMgmtId1: {
			defaultVariant: "variant0",
			variants: [
				{
					author: "SAP",
					key: "variantMgmtId1",
					layer: "VENDOR",
					visible: true,
					title: "Standard"
				}, {
					author: "Me",
					key: "variant0",
					layer: "CUSTOMER",
					visible: true,
					title: "variant A"
				}
			]
		}
	};

	var oVariant = {
		content: {
			fileName:"variant0",
			fileType:"ctrl_variant",
			variantManagementReference:"variantMgmtId1",
			variantReference:"variantMgmtId1",
			content:{
				title:"variant A"
			},
			selector:{},
			layer:"CUSTOMER",
			namespace:"Dummy.Component"
		},
		controlChanges: [],
		variantChanges: {}
	};

	var oModel = new VariantModel(oData, undefined, oMockedAppComponent);
	sandbox.stub(ChangesController.getFlexControllerInstance(oMockedAppComponent), "checkForOpenDependenciesForControl").returns(false);

	QUnit.module("Given a command serializer loaded with an RTA command stack", {
		beforeEach : function(assert) {
			// Prepare fake LRep
			FakeLrepSessionStorage.deleteChanges();
			assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "Local storage based LREP is empty");

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Input": {
					hideControl : {
						completeChangeContent: function() {},
						applyChange: function() {return Promise.resolve();},
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				// Create command stack with some commands
				this.oCommandStack = new CommandStack();
				this.oInput1 = new Input("input1");
				this.oInput2 = new Input("input2");
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
			}.bind(this));
		},
		afterEach : function() {
			return this.oSerializer.saveCommands().then(function() {
				this.oCommandStack.destroy();
				this.oSerializer.destroy();
				this.oPanel.destroy();
				this.oInputDesignTimeMetadata.destroy();
				FakeLrepSessionStorage.deleteChanges();
				sandbox.restore();
			}.bind(this));
		}
	});

	QUnit.test("when two commands get undone, redone and saved while the element of one command is not available", function(assert) {
		// then two changes are expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(2, assert, "save");

		var oInput3 = new Input("input3");
		var oDeleteChangeSpy = sandbox.spy(PersistenceWriteAPI, "remove");
		var oAddChangeSpy = sandbox.spy(PersistenceWriteAPI, "add");
		var oSettingsCommand1;
		var oSettingsCommand2;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Settings", {
			changeType: "hideControl"
		}, this.oInputDesignTimeMetadata)

		.then(function(oSettingsCommand) {
			oSettingsCommand1 = oSettingsCommand;
			return this.oCommandStack.pushAndExecute(oSettingsCommand1);
		}.bind(this))

		.then(function() {
			return CommandFactory.getCommandFor(oInput3, "Settings", {
				changeType: "hideControl"
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oSettingsCommand) {
			oSettingsCommand2 = oSettingsCommand;
			assert.equal(oAddChangeSpy.callCount, 1, "1. change got added");
			return this.oCommandStack.pushAndExecute(oSettingsCommand2);
		}.bind(this))

		.then(function() {
			// simulate command having no app component
			sandbox.stub(oSettingsCommand2, "getAppComponent");
			assert.equal(oAddChangeSpy.callCount, 2, "until now 2 changes got added");
			assert.equal(oDeleteChangeSpy.callCount, 0, "until now no changes got deleted");
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			assert.equal(oDeleteChangeSpy.callCount, 0, "no change without app component got deleted");
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			assert.equal(oDeleteChangeSpy.callCount, 1, "2. change got deleted");
			return this.oCommandStack.redo();
		}.bind(this))

		.then(function() {
			return this.oCommandStack.redo();
		}.bind(this))

		.then(function() {
			assert.equal(oAddChangeSpy.callCount, 3, "only one more change got added");
			assert.equal(oDeleteChangeSpy.callCount, 1, "only one change got deleted");

			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("when a command with an already persisted change gets executed and saved", function(assert) {
		var oInput = new Input("input");
		var oAddChangeSpy = sandbox.spy(PersistenceWriteAPI, "add");

		// Create command
		return CommandFactory.getCommandFor(oInput, "Settings", {
			changeType: "hideControl"
		}, this.oInputDesignTimeMetadata)

		.then(function(oSettingsCommand) {
			this.oCommandStack.push(oSettingsCommand);
			this.oCommandStack._aPersistedChanges = [oSettingsCommand.getPreparedChange().getId()];
			return this.oCommandStack.execute(oSettingsCommand);
		}.bind(this))

		// simulate the change as persisted change in stack
		.then(function() {
			assert.equal(oAddChangeSpy.callCount, 0, "no change got added");

			return this.oSerializer.saveCommands();
		}.bind(this))
		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
		}.bind(this))
		.catch(function(oError) {
			return Promise.reject(oError);
		});
	});

	QUnit.test("when the LREPSerializer.saveCommands gets called with 2 remove commands created via CommandFactory", function(assert) {
		// then two changes are expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(2, assert, "save");
		var oRemoveCommand1;
		var oRemoveCommand2;

		var oAddChangeSpy = sandbox.spy(PersistenceWriteAPI, "add");

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oRemoveCommand) {
			oRemoveCommand1 = oRemoveCommand;
			return CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement : this.oInput2
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oRemoveCommand) {
			oRemoveCommand2 = oRemoveCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand1);
		}.bind(this))

		.then(function() {
			assert.equal(oAddChangeSpy.callCount, 1, "now 1. change got added directly after execute");
			return this.oCommandStack.pushAndExecute(oRemoveCommand2);
		}.bind(this))

		.then(function() {
			assert.equal(oAddChangeSpy.callCount, 2, "now 2. change got added directly after execute");
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("when the LREPSerializer.saveCommands gets called with 2 remove commands created via CommandFactory, but one is relevant for runtime only", function(assert) {
		// then one change is expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oRemoveCommand) {
			return this.oCommandStack.pushAndExecute(oRemoveCommand);
		}.bind(this))

		.then(function() {
			return CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement : this.oInput2,
				runtimeOnly : true
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oRemoveCommand) {
			return this.oCommandStack.pushAndExecute(oRemoveCommand);
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 'remove' command for a destroyed control", function(assert) {
		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oRemoveCommand) {
			return this.oCommandStack.pushExecutedCommand(oRemoveCommand);
		}.bind(this))

		.then(function() {
			this.oInput1.destroy();

			var aCommands = this.oCommandStack.getAllExecutedCommands();
			assert.strictEqual(aCommands[0].getElement(), undefined, "then oInput1 cannot be found");
			assert.strictEqual(aCommands[0].getSelector().id, "input1", "then oRemoveCommand1 selector was set");

			//Save the commands
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
		}.bind(this));
	});

	QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 'remove' command and 2 App Descriptor 'add library' commands", function(assert) {
		// then all changes are expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(3, assert, "save");
		var oRemoveCommand1;
		var oAddLibraryCommand;
		var oAddLibraryCommand2;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oRemoveCommand) {
			oRemoveCommand1 = oRemoveCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oAddLibraryCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oAddLibraryCommand2 = oCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand1);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oAddLibraryCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oAddLibraryCommand2);
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("Execute and undo a composite command with 1 'remove' command and 1 App Descriptor 'add library' command and execute another remove command", function(assert) {
		// then one change is expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");
		var oRemoveCommand;
		var oRemoveCommand2;
		var oAddLibraryCommand;
		var oCompositeCommand;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oRemoveCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement : this.oInput2
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oCommand) {
			oRemoveCommand2 = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oAddLibraryCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "composite");
		}.bind(this))

		.then(function(oCommand) {
			oCompositeCommand = oCommand;
			oCompositeCommand.addCommand(oRemoveCommand);
			oCompositeCommand.addCommand(oAddLibraryCommand);

			return this.oCommandStack.pushAndExecute(oRemoveCommand2);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oCompositeCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("Execute 1 'remove' command and 1 App Descriptor 'add library' command, undo the 'add library' command and call saveCommands", function(assert) {
		// then one change is expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");
		var oRemoveCommand;
		var oAddLibraryCommand;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oRemoveCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oAddLibraryCommand = oCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oAddLibraryCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});



	QUnit.test("Execute undo and redo on 1 App Descriptor 'add library' command and call saveCommands", function(assert) {
		// then one change is expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");
		var oCreateAndStoreChangeSpy;
		var oDeleteChangeSpy;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
			reference : COMPONENT_NAME,
			parameters: {
				libraries : {
					"sap.ui.rta" : {
						lazy:false,
						minVersion:"1.48"
					}
				}
			},
			appComponent : oMockedAppComponent
		}, {}, {layer : "CUSTOMER"})

		.then(function(oAddLibraryCommand) {
			oCreateAndStoreChangeSpy = sandbox.spy(oAddLibraryCommand, "createAndStoreChange");
			oDeleteChangeSpy = sandbox.spy(PersistenceWriteAPI, "remove");
			return this.oCommandStack.pushAndExecute(oAddLibraryCommand);
		}.bind(this))

		.then(function() {
			assert.equal(oCreateAndStoreChangeSpy.callCount, 1, "now app descriptor change got created directly after execute");
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			assert.equal(oDeleteChangeSpy.callCount, 1, "now app descriptor change got removed directly after undo");
			return this.oCommandStack.redo();
		}.bind(this))

		.then(function() {
			assert.equal(oCreateAndStoreChangeSpy.callCount, 2, "now app descriptor change got created directly after redo");
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});


	QUnit.test("Execute 1 'remove' command and 1 App Descriptor 'add library' command," +
				"undo the 'add library' command and call saveCommands which rejects", function(assert) {
		var oSaveChangesStub = sandbox.stub(PersistenceWriteAPI, "save").rejects();
		var oRemoveCommand;
		var oAddLibraryCommand;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oRemoveCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oAddLibraryCommand = oCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oAddLibraryCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.notOk(true, "then return promise shouldn't be resolved");
		})

		.catch(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets rejected");
			assert.equal(this.oCommandStack.getCommands().length, 2, "and the command stack has not been cleared");
		}.bind(this))

		.then(function() {
			// clean up dirty canges
			oSaveChangesStub.restore();
			this.oSerializer.saveCommands();
		}.bind(this));
	});

	QUnit.test("when needs restart is asked for normal commands", function(assert) {
		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oAnyFlexCommand) {
			return this.oCommandStack.pushAndExecute(oAnyFlexCommand);
		}.bind(this))

		.then(function() {
			//trigger function
			return this.oSerializer.needsReload();
		}.bind(this))

		.then(function(bNeedsRestart) {
			assert.notOk(bNeedsRestart, "then restart is not necessary");
		});
	});

	QUnit.test("when needs restart is asked for app descriptor commands and a normal commands", function(assert) {
		var oAnyFlexCommand;
		var oAnyAppDescriptorCommand;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oAnyFlexCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"}
			);
		}.bind(this))

		.then(function(oCommand) {
			oAnyAppDescriptorCommand = oCommand;
			return this.oCommandStack.pushAndExecute(oAnyFlexCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oAnyAppDescriptorCommand);
		}.bind(this))

		.then(function() {
			//trigger function
			return this.oSerializer.needsReload();
		}.bind(this))

		.then(function(bNeedsRestart) {
			assert.ok(bNeedsRestart, "then restart is necessary");
		});
	});

	QUnit.test("when needs restart is asked for undone app descriptor commands and a normal commands", function(assert) {
		var oAnyFlexCommand;
		var oAnyAppDescriptorCommand;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oAnyFlexCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference : COMPONENT_NAME,
				parameters: {
					libraries : {
						"sap.ui.rta" : {
							lazy:false,
							minVersion:"1.48"
						}
					}
				},
				appComponent : oMockedAppComponent
			}, {}, {layer : "CUSTOMER"}
			);
		}.bind(this))

		.then(function(oCommand) {
			oAnyAppDescriptorCommand = oCommand;
			return this.oCommandStack.pushAndExecute(oAnyFlexCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oAnyAppDescriptorCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			//trigger function
			return this.oSerializer.needsReload();
		}.bind(this))

		.then(function(bNeedsRestart) {
			assert.notOk(bNeedsRestart, "then restart is not necessary");
		});
	});

	QUnit.test("Execute 1 'Remove' command and 1 'ControlVariantSwitch' command and save commands", function(assert) {
		// And then only one change should be saved in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");
		var oControlVariantSwitchCommand;
		var oRemoveCommand;

		var oSwitchCommandData = {
			targetVariantReference : "variantReference",
			sourceVariantReference : "variantReference"
		};
		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "switch", oSwitchCommandData)

		.then(function(oCommand) {
			oControlVariantSwitchCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement : this.oInput1
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oCommand) {
			oRemoveCommand = oCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oControlVariantSwitchCommand);
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("Execute 1 'Remove' command, 1 'ControlVariantSwitch' command, undo and call saveCommands", function(assert) {
		// And then only one change should be saved in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");
		var oControlVariantSwitchCommand;
		var oRemoveCommand;

		var oSwitchCommandData = {
			targetVariantReference : "variantReference",
			sourceVariantReference : "variantReference"
		};

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "switch", oSwitchCommandData)

		.then(function(oCommand) {
			oControlVariantSwitchCommand = oCommand;
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement : this.oInput1
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oCommand) {
			oRemoveCommand = oCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oControlVariantSwitchCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("when changes belonging to a variant management are executed/partially undone and later saved ", function(assert) {
		// then two changes are expected to be written in LREP -> the remove which was not undone + the variant
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(1, assert, "save");
		var oRemoveCommand1;
		var oRemoveCommand2;
		var oAddChangeSpy;
		var oRemoveChangeSpy;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oRemoveCommand1 = oCommand;
			return CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement : this.oInput2
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oCommand) {
			oRemoveCommand2 = oCommand;
			sandbox.stub(oRemoveCommand1.getPreparedChange(), "getVariantReference").returns("test-variant");
			sandbox.stub(oRemoveCommand2.getPreparedChange(), "getVariantReference").returns("test-variant");
			sandbox.stub(oMockedAppComponent, "getModel").returns({
				removeChange: function() {},
				addChange: function() {},
				getVariant: function() {
					return {
						content : {
							fileName: "idOfVariantManagementReference",
							title: "Standard",
							fileType: "variant",
							reference: "dummyReference",
							variantManagementReference: "idOfVariantManagementReference"
						}
					};
				}
			});
			oAddChangeSpy = sandbox.spy(oMockedAppComponent.getModel(), "addChange");
			oRemoveChangeSpy = sandbox.spy(oMockedAppComponent.getModel(), "removeChange");

			return this.oCommandStack.pushAndExecute(oRemoveCommand1);
		}.bind(this))

		.then(function() {
			assert.equal(oAddChangeSpy.callCount, 1, "then variant model's addChange is called for both changes as VariantManagement Change is detected");
			return this.oCommandStack.pushAndExecute(oRemoveCommand2);
		}.bind(this))

		.then(function() {
			assert.equal(oAddChangeSpy.callCount, 2, "then variant model's addChange is called for both changes as VariantManagement Change is detected");
			return this.oCommandStack.undo();
		}.bind(this))

		.then(function() {
			assert.equal(oRemoveChangeSpy.callCount, 1, "then variant model's removeChange is called as VariantManagement Change is detected");
			return this.oSerializer.saveCommands();
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.test("when the LREPSerializer.clearCommandStack gets called with 2 remove commands created via CommandFactory and these are booked for a new app variant whose id is different from the id of the current running app", function(assert) {
		// then two changes are expected to be written in LREP
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(2, assert, "save");
		var oRemoveCommand1;
		var oRemoveCommand2;

		// Create commands
		return CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata)

		.then(function(oCommand) {
			oRemoveCommand1 = oCommand;
			return CommandFactory.getCommandFor(this.oInput2, "Remove", {
				removedElement : this.oInput2
			}, this.oInputDesignTimeMetadata);
		}.bind(this))

		.then(function(oCommand) {
			oRemoveCommand2 = oCommand;
			return this.oCommandStack.pushAndExecute(oRemoveCommand1);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oRemoveCommand2);
		}.bind(this))

		.then(function() {
			var aUIChanges = ChangesController.getFlexControllerInstance(oMockedAppComponent)
				._oChangePersistence.getDirtyChanges();
			aUIChanges.forEach(function(oChange) {
				// Change the reference of UI changes
				oChange.setNamespace("APP_VARIANT_NAMESPACE");
				oChange.setComponent("APP_VARIANT_REFERENCE");
			});

			// Simulate that the UI changes are saved in the persistence with the new reference
			return PersistenceWriteAPI.save(oMockedAppComponent, true);
		})

		.then(function() {
			return this.oSerializer.clearCommandStack("customer.sap.test");
		}.bind(this))

		.then(function() {
			assert.ok(true, "then the promise for LREPSerializer.clearCommandStack() gets resolved");
			assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			fnCleanUp();
		}.bind(this))

		.catch(function(oError) {
			fnCleanUp();
			return Promise.reject(oError);
		});
	});

	QUnit.module("Given a command serializer loaded with an RTA command stack and ctrl variant commands", {
		beforeEach : function(assert) {
			// Prepare fake LRep
			FakeLrepSessionStorage.deleteChanges();
			assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "Local storage based LREP is empty");

			// Create command stack
			this.oCommandStack = new CommandStack();

			// Create Variant Management Control
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);
			this.oDesignTimeMetadata = new DesignTimeMetadata({ data : {} });

			// Create serializer instance
			this.oSerializer = new CommandSerializer({
				commandStack: this.oCommandStack,
				rootControl: this.oVariantManagement
			});

			// Stub Variant Model and Variant Controller functions
			var oVariant = {
				content: {
					fileName:"variant0",
					content: {
						title:"variant A"
					},
					layer:"CUSTOMER",
					variantReference:"variant00",
					reference: "Dummy.Component"
				},
				controlChanges : []
			};
			sandbox.stub(oModel, "getVariant").returns(oVariant);
			sandbox.stub(oModel.oVariantController, "_setVariantData").returns(1);
			sandbox.stub(oModel.oVariantController, "_updateChangesForVariantManagementInMap");
			sandbox.stub(oModel.oVariantController, "addVariantToVariantManagement");
			sandbox.stub(oModel.oVariantController, "removeVariantFromVariantManagement");
		},
		afterEach : function() {
			this.oCommandStack.destroy();
			this.oSerializer.destroy();
			this.oVariantManagement.destroy();
			this.oDesignTimeMetadata.destroy();
			FakeLrepSessionStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when the LREPSerializer.clearCommandStack gets called with 4 different ctrl variant commands created containing one or more changes and this is booked for a new app variant with different id", function(assert) {
		sandbox.stub(oModel.oVariantController, "getVariant").returns(oVariant);
		var done = assert.async();
		// then five changes are expected to be written in LREP, the switch command is ignored
		var fnCleanUp = RtaQunitUtils.waitForExactNumberOfChangesInLrep(5, assert, "save");
		var oControlVariantConfigureCommand;
		var oControlVariantSwitchCommand;
		var oControlVariantDuplicateCommand;
		var oControlVariantSetTitleCommand;

		// Create control variant configure command
		var oTitleChange = {
			appComponent : oMockedAppComponent,
			changeType : "setTitle",
			layer : "CUSTOMER",
			originalTitle : "variant A",
			title : "test",
			variantReference : "variant0"
		};
		var oFavoriteChange = {
			appComponent : oMockedAppComponent,
			changeType : "setFavorite",
			favorite : false,
			layer : "CUSTOMER",
			originalFavorite : true,
			variantReference : "variant0"
		};
		var oVisibleChange = {
			appComponent : oMockedAppComponent,
			changeType : "setVisible",
			layer : "CUSTOMER",
			variantReference : "variant0",
			visible : false
		};
		var aChanges = [oTitleChange, oFavoriteChange, oVisibleChange];

		return CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
			control : this.oVariantManagement,
			changes : aChanges
		}, this.oDesignTimeMetadata, {layer: "CUSTOMER"})

		.then(function(oCommand) {
			oControlVariantConfigureCommand = oCommand;
			// create control variant switch command
			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", {
				targetVariantReference : "newVariantReference",
				sourceVariantReference : "oldVariantReference"
			});
		}.bind(this))

		.then(function(oCommand) {
			oControlVariantSwitchCommand = oCommand;
			// create control variant duplicate command
			return CommandFactory.getCommandFor(this.oVariantManagement, "duplicate", {
				sourceVariantReference: "variant0",
				newVariantTitle: "newTitle"
			}, this.oDesignTimeMetadata, {layer: "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oControlVariantDuplicateCommand = oCommand;
			// create control variant setTitle command
			return CommandFactory.getCommandFor(this.oVariantManagement, "setTitle", {
				newText : "newText"
			}, this.oDesignTimeMetadata, {layer: "CUSTOMER"});
		}.bind(this))

		.then(function(oCommand) {
			oControlVariantSetTitleCommand = oCommand;
			this.oCommandStack.attachCommandExecuted(function(oEvent) {
				if (oEvent.getParameters().command === oControlVariantSetTitleCommand) {
					var aUIChanges = ChangesController.getFlexControllerInstance(oMockedAppComponent)
						._oChangePersistence.getDirtyChanges();
					aUIChanges.forEach(function(oChange) {
						// Change the reference of UI changes
						oChange.setNamespace("APP_VARIANT_NAMESPACE");
						oChange.setComponent("APP_VARIANT_REFERENCE");
					});

					// Simulate that the UI changes are saved in the persistence with the new reference
					return PersistenceWriteAPI.save(oMockedAppComponent, true)
						.then(function() {
							return this.oSerializer.clearCommandStack("customer.sap.test")
							.then(function() {
								assert.ok(true, "then the promise for LREPSerializer.clearCommandStack() gets resolved");
								assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
								fnCleanUp();
								done();
							}.bind(this));
						}.bind(this));
				}
			}.bind(this));

			return this.oCommandStack.pushAndExecute(oControlVariantConfigureCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oControlVariantSwitchCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oControlVariantDuplicateCommand);
		}.bind(this))

		.then(function() {
			return this.oCommandStack.pushAndExecute(oControlVariantSetTitleCommand);
		}.bind(this));
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
