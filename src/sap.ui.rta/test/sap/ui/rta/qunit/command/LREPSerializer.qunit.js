/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/m/Input",
	"sap/m/Panel",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/rta/command/Stack",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	RtaQunitUtils,
	Input,
	Panel,
	DesignTimeMetadata,
	Version,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	Settings,
	Layer,
	CommandFactory,
	CommandSerializer,
	CommandStack,
	sinon,
	FlexTestAPI
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var COMPONENT_NAME = "someName";
	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	var oData = {
		variantMgmtId1: {
			defaultVariant: "variant0",
			variants: [
				{
					author: "SAP",
					key: "variantMgmtId1",
					layer: Layer.VENDOR,
					visible: true,
					title: "Standard"
				}, {
					author: "Me",
					key: "variant0",
					layer: Layer.CUSTOMER,
					visible: true,
					title: "variant A"
				}
			]
		}
	};

	QUnit.module("Given a command serializer loaded with an RTA command stack", {
		async before() {
			await RtaQunitUtils.clear(oMockedAppComponent);
			this.oModel = await FlexTestAPI.createVariantModel({
				data: oData,
				appComponent: oMockedAppComponent
			});
		},
		async beforeEach() {
			await RtaQunitUtils.clear(oMockedAppComponent);

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			this.oCommandStack = new CommandStack();
			this.oInput1 = new Input("input1");
			this.oInput2 = new Input("input2");
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

			this.oSerializer = new CommandSerializer({
				commandStack: this.oCommandStack,
				rootControl: this.oPanel
			});

			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isKeyUser() {
					return true;
				},
				isCondensingEnabled() {
					return false;
				},
				hasPersoConnector() {
					return false;
				},
				getUserId() {}
			});
		},
		async afterEach() {
			await this.oSerializer.saveCommands({saveAsDraft: false});
			this.oCommandStack.destroy();
			this.oSerializer.destroy();
			this.oPanel.destroy();
			this.oInput1.destroy();
			this.oInput2.destroy();
			this.oInputDesignTimeMetadata.destroy();
			sandbox.restore();
			await RtaQunitUtils.clear(oMockedAppComponent);
		},
		after() {
			this.oModel.destroy();
		}
	}, function() {
		QUnit.test("when two commands get undone, redone and saved while the element of one command is not available", function(assert) {
			var oInput3 = new Input("input3");
			var oRemoveChangeSpy = sandbox.spy(PersistenceWriteAPI, "remove");
			var oAddChangeSpy = sandbox.spy(PersistenceWriteAPI, "add");
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			var oSettingsCommand2;

			return CommandFactory.getCommandFor(this.oInput1, "Settings", {
				changeType: "hideControl"
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, oInput3, "Settings", {
				changeType: "hideControl"
			}, this.oInputDesignTimeMetadata))

			.then(function(oSettingsCommand) {
				oSettingsCommand2 = oSettingsCommand;
				assert.equal(oAddChangeSpy.callCount, 1, "1. change got added");
				return this.oCommandStack.pushAndExecute(oSettingsCommand2);
			}.bind(this))

			.then(function() {
				// simulate command having no app component
				sandbox.stub(oSettingsCommand2, "getAppComponent");
				assert.equal(oAddChangeSpy.callCount, 2, "until now 2 changes got added");
				assert.equal(oRemoveChangeSpy.callCount, 0, "until now no changes got deleted");
				return this.oCommandStack.undo();
			}.bind(this))

			.then(function() {
				assert.equal(oRemoveChangeSpy.callCount, 0, "no change without app component got deleted");
				return this.oCommandStack.undo();
			}.bind(this))

			.then(function() {
				assert.equal(oRemoveChangeSpy.callCount, 1, "2. change got deleted");
				return this.oCommandStack.redo();
			}.bind(this))

			.then(this.oCommandStack.redo.bind(this.oCommandStack))

			.then(function() {
				assert.equal(oAddChangeSpy.callCount, 3, "only one more change got added");
				assert.equal(oRemoveChangeSpy.callCount, 1, "only one change got deleted");

				return this.oSerializer.saveCommands({saveAsDraft: false});
			}.bind(this))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this))

			.catch(function(oError) {
				return Promise.reject(oError);
			});
		});

		QUnit.test("when a command with an already persisted change gets executed and saved", function(assert) {
			var oInput = new Input("input");
			var oAddChangeSpy = sandbox.spy(PersistenceWriteAPI, "add");
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");

			return CommandFactory.getCommandFor(oInput, "Settings", {
				changeType: "hideControl"
			}, this.oInputDesignTimeMetadata)

			.then(function(oSettingsCommand) {
				this.oCommandStack.push(oSettingsCommand);
				this.oCommandStack._aPersistedChanges = [oSettingsCommand.getPreparedChange().getId()];
				return this.oCommandStack.execute(oSettingsCommand);
			}.bind(this))

			.then(function() {
				assert.equal(oAddChangeSpy.lastCall.args[0].flexObjects.length, 0, "no change got added");
			})

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("when the LREPSerializer.saveCommands gets called with 2 remove commands created via CommandFactory", function(assert) {
			var oAddChangeSpy = sandbox.spy(PersistenceWriteAPI, "add");
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");

			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(function() {
				assert.equal(oAddChangeSpy.callCount, 1, "now 1. change got added directly after execute");
			})

			.then(CommandFactory.getCommandFor.bind(null, this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(function() {
				assert.equal(oAddChangeSpy.callCount, 2, "now 2. change got added directly after execute");
			})

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("when the LREPSerializer.saveCommands gets called with 2 remove commands created via CommandFactory, but one is relevant for runtime only", function(assert) {
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput2, "Remove", {
				removedElement: this.oInput2,
				runtimeOnly: true
			}, this.oInputDesignTimeMetadata))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 'remove' command for a destroyed control", function(assert) {
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(function() {
				this.oInput1.destroy();

				var aCommands = this.oCommandStack.getAllExecutedCommands();
				assert.strictEqual(aCommands[0].getElement(), undefined, "then oInput1 cannot be found");
				assert.strictEqual(aCommands[0].getSelector().id, "input1", "then oRemoveCommand1 selector was set");

				return this.oSerializer.saveCommands({saveAsDraft: false});
			}.bind(this))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("when the LREPSerializer.saveCommands gets called with a command stack with 1 'remove' command and 2 App Descriptor 'add library' commands", function(assert) {
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("Execute and undo a composite command with 1 'remove' command and 1 App Descriptor 'add library' command and execute another remove command", function(assert) {
			var oRemoveCommand;
			var oAddLibraryCommand;
			var oCompositeCommand;
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");

			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(function(oCommand) {
				oRemoveCommand = oCommand;
				return CommandFactory.getCommandFor(this.oInput2, "Remove", {
					removedElement: this.oInput2
				}, this.oInputDesignTimeMetadata);
			}.bind(this))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(function(oCommand) {
				oAddLibraryCommand = oCommand;
				return CommandFactory.getCommandFor(this.oInput1, "composite");
			}.bind(this))

			.then(function(oCommand) {
				oCompositeCommand = oCommand;
				oCompositeCommand.addCommand(oRemoveCommand);
				oCompositeCommand.addCommand(oAddLibraryCommand);
			})

			.then(function() {
				return this.oCommandStack.pushAndExecute(oCompositeCommand);
			}.bind(this))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))
			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("Execute 1 'remove' command and 1 App Descriptor 'add library' command, undo the 'add library' command and call saveCommands", function(assert) {
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("Execute undo and redo on 1 App Descriptor 'add library' command and call saveCommands", function(assert) {
			var oDeleteChangeSpy = sandbox.spy(PersistenceWriteAPI, "remove");
			var oCreateAndStoreChangeSpy;
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");

			return CommandFactory.getCommandFor(this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER})

			.then(function(oAddLibraryCommand) {
				oCreateAndStoreChangeSpy = sandbox.spy(oAddLibraryCommand, "createAndStoreChange");
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
				return this.oSerializer.saveCommands({saveAsDraft: false});
			}.bind(this))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("Execute 1 'remove' command and 1 App Descriptor 'add library' command, undo the 'add library' command and call saveCommands which rejects", function(assert) {
			var oSaveChangesStub = sandbox.stub(PersistenceWriteAPI, "save").rejects();

			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.notOk(true, "then return promise shouldn't be resolved");
			})

			.catch(function() {
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets rejected");
				assert.equal(this.oCommandStack.getCommands().length, 2, "and the command stack has not been cleared");
			}.bind(this))

			.then(function() {
				// clean up dirty changes
				oSaveChangesStub.restore();
				this.oSerializer.saveCommands({saveAsDraft: false});
			}.bind(this));
		});

		QUnit.test("Execute 1 'remove' command and save in a system where versioning is disabled and condensing param is true", function(assert) {
			var oSaveChangesStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)
			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))
			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false, condenseAnyLayer: true}))
			.then(function() {
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.strictEqual(oSaveChangesStub.getCall(0).args[0].condenseAnyLayer, true, "then the condense parameter is passed");
				assert.strictEqual(oSaveChangesStub.getCall(0).args[0].draft, false, "then the save on the persistence API is called with a draft flag, default value is false");
			});
		});

		QUnit.test("Execute 1 'remove' command and save in a system where versioning is enabled", function(assert) {
			var oSaveChangesStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)
			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))
			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: true, version: Version.Number.Draft}))
			.then(function() {
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(oSaveChangesStub.getCall(0).args[0].draft, true, "then the save on the persistence API is called with a draft flag");
				assert.equal(oSaveChangesStub.getCall(0).args[0].version, Version.Number.Draft, "then the save on the persistence API is called with a draft flag");
			});
		});

		QUnit.test("when needs restart is asked for normal commands", function(assert) {
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oSerializer.needsReload.bind(this.oSerializer))

			.then(function(bNeedsRestart) {
				assert.notOk(bNeedsRestart, "then restart is not necessary");
			});
		});

		QUnit.test("when needs restart is asked for app descriptor commands and a normal commands", function(assert) {
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oSerializer.needsReload.bind(this.oSerializer))

			.then(function(bNeedsRestart) {
				assert.ok(bNeedsRestart, "then restart is necessary");
			});
		});

		QUnit.test("when needs restart is asked for undone app descriptor commands and a normal commands", function(assert) {
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "addLibrary", {
				reference: COMPONENT_NAME,
				parameters: {
					libraries: {
						"sap.ui.rta": {
							lazy: false,
							minVersion: "1.48"
						}
					}
				},
				appComponent: oMockedAppComponent
			}, {}, {layer: Layer.CUSTOMER}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(this.oSerializer.needsReload.bind(this.oSerializer))

			.then(function(bNeedsRestart) {
				assert.notOk(bNeedsRestart, "then restart is not necessary");
			});
		});

		QUnit.test("Execute 1 'Remove' command and 1 'ControlVariantSwitch' command and save commands", function(assert) {
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			return CommandFactory.getCommandFor(this.oInput1, "switch", {
				targetVariantReference: "variantReference",
				sourceVariantReference: "variantReference"
			})

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("Execute 1 'Remove' command, 1 'ControlVariantSwitch' command, undo and call saveCommands", function(assert) {
			var oSaveChangeSpy = sandbox.spy(PersistenceWriteAPI, "save");
			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput1, "switch", {
				targetVariantReference: "variantReference",
				sourceVariantReference: "variantReference"
			}))

			.then(this.oCommandStack.pushAndExecute.bind(this.oCommandStack))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(this.oSerializer.saveCommands.bind(this.oSerializer, {saveAsDraft: false}))

			.then(function() {
				assert.ok(oSaveChangeSpy.called, "then 'save' is called on the persistence");
				assert.ok(true, "then the promise for LREPSerializer.saveCommands() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("when the LREPSerializer.clearCommandStack gets called with 2 remove commands created via CommandFactory and these are booked for a new app variant whose id is different from the id of the current running app", function(assert) {
			var oRemoveCommand1;
			var oRemoveCommand2;
			var oRemoveStub;

			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(function(oCommand) {
				oRemoveCommand1 = oCommand;
				return this.oCommandStack.pushAndExecute(oRemoveCommand1);
			}.bind(this))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata))

			.then(function(oCommand) {
				oRemoveCommand2 = oCommand;
				return this.oCommandStack.pushAndExecute(oRemoveCommand2);
			}.bind(this))

			.then(function() {
				var aUIChanges = [oRemoveCommand1.getPreparedChange(), oRemoveCommand2.getPreparedChange()];
				aUIChanges.forEach(function(oChange) {
					var oFlexObjectMetadata = oChange.getFlexObjectMetadata();
					oFlexObjectMetadata.namespace = "APP_VARIANT_NAMESPACE";
					oFlexObjectMetadata.reference = "APP_VARIANT_REFERENCE";
					oChange.setFlexObjectMetadata(oFlexObjectMetadata);
				});

				return PersistenceWriteAPI.save({selector: oMockedAppComponent, skipUpdateCache: true});
			})

			.then(function() {
				oRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove");
				return this.oSerializer.clearCommandStack();
			}.bind(this))

			.then(function() {
				assert.ok(oRemoveStub.notCalled, "then 'remove' was not called");
				assert.ok(true, "then the promise for LREPSerializer.clearCommandStack() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});

		QUnit.test("when the LREPSerializer.clearCommandStack gets called with bRemoveChanges = true", function(assert) {
			var oRemoveCommand1;
			var oRemoveCommand2;
			var oRemoveStub;

			return CommandFactory.getCommandFor(this.oInput1, "Remove", {
				removedElement: this.oInput1
			}, this.oInputDesignTimeMetadata)

			.then(function(oCommand) {
				oRemoveCommand1 = oCommand;
				return this.oCommandStack.pushAndExecute(oRemoveCommand1);
			}.bind(this))

			.then(CommandFactory.getCommandFor.bind(null, this.oInput2, "Remove", {
				removedElement: this.oInput2
			}, this.oInputDesignTimeMetadata))

			.then(function(oCommand) {
				oRemoveCommand2 = oCommand;
				return this.oCommandStack.pushAndExecute(oRemoveCommand2);
			}.bind(this))

			.then(function() {
				var aUIChanges = [oRemoveCommand1.getPreparedChange(), oRemoveCommand2.getPreparedChange()];
				aUIChanges.forEach(function(oChange) {
					var oFlexObjectMetadata = oChange.getFlexObjectMetadata();
					oFlexObjectMetadata.namespace = "APP_VARIANT_NAMESPACE";
					oFlexObjectMetadata.reference = "APP_VARIANT_REFERENCE";
					oChange.setFlexObjectMetadata(oFlexObjectMetadata);
				});

				return PersistenceWriteAPI.save({selector: oMockedAppComponent, skipUpdateCache: true});
			})

			.then(function() {
				oRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove");
				return this.oSerializer.clearCommandStack(true);
			}.bind(this))
			.then(function() {
				assert.ok(oRemoveStub.called, "then 'remove' from PersistenceWriteAPI was called");
				assert.ok(true, "then the promise for LREPSerializer.clearCommandStack() gets resolved");
				assert.equal(this.oCommandStack.getCommands().length, 0, "and the command stack has been cleared");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});