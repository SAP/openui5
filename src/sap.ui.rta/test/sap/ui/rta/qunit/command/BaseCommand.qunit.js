/*global QUnit*/

sap.ui.define([
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/ObjectHeader",
	"sap/m/ObjectAttribute",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/table/Column",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/rta/command/Stack",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/SimpleChanges",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Button,
	Input,
	Text,
	VBox,
	List,
	CustomListItem,
	ObjectHeader,
	ObjectAttribute,
	VerticalLayout,
	Column,
	DesignTime,
	OverlayRegistry,
	ElementDesignTimeMetadata,
	CommandFactory,
	FlexCommand,
	BaseCommand,
	CompositeCommand,
	Stack,
	MoveControls,
	HideControl,
	UnhideControl,
	PropertyChange,
	ChangeRegistry,
	SimpleChanges,
	ChangesWriteAPI,
	Change,
	Layer,
	JSONModel,
	flUtils,
	flLayerUtils,
	sinon
) {
	"use strict";

	var oCommandFactory = new CommandFactory({
		flexSettings: {
			layer: Layer.VENDOR
		}
	});

	var sandbox = sinon.sandbox.create();
	sinon.stub(flLayerUtils, "getCurrentLayer").returns(Layer.VENDOR);
	var ERROR_INTENTIONALLY = new Error("this command intentionally failed");

	var oMockedAppComponent = {
		getLocalId: sandbox.stub(),
		getManifestObject: sandbox.stub(),
		getManifestEntry: sandbox.stub(),
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
					type: "application",
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {},
		createId : function(sId) {
			return "testcomponent---" + sId;
		}
	};

	function prepareAndExecute(oFlexCommand) {
		return Promise.resolve()
		.then(oFlexCommand.prepare.bind(oFlexCommand))
		.then(oFlexCommand.execute.bind(oFlexCommand));
	}

	QUnit.module("Given a command factory", {
		beforeEach : function() {
			this.oButton = new Button(oMockedAppComponent.createId("myButton"));
			sandbox.stub(flUtils, "_getComponentForControl")
				.callThrough()
				.withArgs(this.oButton)
				.returns(oMockedAppComponent);
		},
		afterEach : function() {
			sandbox.restore();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when getting a property change command for button,", function(assert) {
			return oCommandFactory.getCommandFor(this.oButton, "property", {
				propertyName : "visible",
				oldValue : this.oButton.getVisible(),
				newValue : false
			})

			.then(function(oCommand) {
				assert.ok(oCommand, "then command without flex settings is available");
				assert.strictEqual(oCommand.getNewValue(), false, "and its settings are merged correctly");
			})

			.then(function() {
				oCommandFactory.setFlexSettings({
					layer: Layer.VENDOR,
					developerMode: true
				});
				return oCommandFactory.getCommandFor(this.oButton, "property", {
					propertyName : "visible",
					oldValue : this.oButton.getVisible(),
					newValue : false
				});
			}.bind(this))

			.then(function(oCommand) {
				assert.ok(oCommand, "then command with flex settings is available");
				assert.strictEqual(oCommand.getNewValue(), false, "and its settings are merged correctly");
			})

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when getting a property change command for button with a static call to getCommandFor,", function(assert) {
			var oFlexSettings = {
				layer: Layer.VENDOR,
				developerMode: true,
				scenario: sap.ui.fl.Scenario.AppVariant,
				projectId: "projectId",
				baseId: "baseId"
			};

			var oPrepareStub = sandbox.stub(FlexCommand.prototype, "prepare");

			return CommandFactory.getCommandFor(this.oButton, "property", {
				propertyName : "visible",
				oldValue : this.oButton.getVisible(),
				newValue : false
			}, null, oFlexSettings)

			.then(function() {
				assert.equal(oPrepareStub.callCount, 1, "the _getCommandFor method was called");
				assert.ok(oPrepareStub.lastCall.args[0].namespace, "and the namespace got added to the flexSettings");
				assert.ok(oPrepareStub.lastCall.args[0].rootNamespace, "and the rootNamespace got added to the flexSettings");
			})

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});
	});

	QUnit.module("Given a flex command", {
		beforeEach : function() {
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.oButton = new Button("mockButton");
			this.fnApplyChangeSpy = sandbox.spy(HideControl, "applyChange");
			this.oFlexCommand = new FlexCommand({
				element : this.oButton,
				changeType : "hideControl"
			});
		},
		afterEach : function() {
			sandbox.restore();
			this.oFlexCommand.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when executing the command,", function(assert) {
			assert.ok(this.oFlexCommand.isEnabled(), "then command is enabled");

			return prepareAndExecute(this.oFlexCommand)
				.then(function() {
					assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
				}.bind(this))
				.catch(function (oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});

		QUnit.test("when executing a command that fails", function(assert) {
			sandbox.stub(ChangesWriteAPI, "apply").rejects();
			return prepareAndExecute(this.oFlexCommand)
				.then(function() {
					assert.ok(false, "then must never be called. An Exception should be thrown");
				})
				.catch(function() {
					assert.ok(true, "the promise gets rejected if the apply fails");
				});
		});
	});

	QUnit.module("Given a command stack", {
		beforeEach : function() {
			this.stack = new Stack();
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.command = new BaseCommand();
			this.failingCommand = this.command.clone();
			this.failingCommand.execute = function() {
				return Promise.reject(ERROR_INTENTIONALLY);
			};
			this.command2 = new BaseCommand();
		},
		afterEach : function() {
			sandbox.restore();
			this.command.destroy();
			this.command2.destroy();
			this.stack.destroy();
		}
	}, function() {
		QUnit.test("when un-doing the empty stack, ", function(assert) {
			assert.ok(!this.stack.canUndo(), "then stack cannot be undone");
			return this.stack.undo()

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
						" the to be executed index is in range");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when re-doing the empty stack, ", function(assert) {
			assert.ok(!this.stack.canRedo(), "then stack cannot be redone");

			return this.stack.redo()

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
								" the to be executed index is in range");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when pushing a command, ", function(assert) {
			this.stack.push(this.command);

			var oTopCommand = this.stack.top();
			assert.equal(oTopCommand.getId(), this.command.getId(), "then it is on the top of stack");
		});

		QUnit.test("when calling pop at the command stack with a command at it's top, ", function(assert) {
			this.stack.push(this.command);

			var oTopCommand = this.stack.pop();

			assert.equal(oTopCommand.getId(), this.command.getId(), "then the command is returned");
			assert.ok(this.stack.isEmpty(), "and the command stack is empty");
		});

		QUnit.test("when calling pop at the command stack with an already executed command at it's top, ", function(assert) {
			this.stack.push(this.command);
			this.stack.push(this.command2);

			return this.stack.execute()

			.then(function() {
				var oTopCommand = this.stack.pop();
				assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
				assert.equal(this.stack.getCommands().length, 1, "  only first commmand is on the stack");
				assert.equal(this.stack.getCommands()[0].getId(), this.command.getId(), "only first commmand is on the stack");
				assert.equal(oTopCommand.getId(), this.command2.getId(), " the correct command is returned");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when calling pushAndExecute with a failing command as the only command", function(assert) {
			assert.expect(4);
			var fnStackModifiedSpy = sinon.spy();
			this.stack.attachModified(fnStackModifiedSpy);
			return this.stack.pushAndExecute(this.failingCommand)

			.catch(function(oError) {
				assert.ok(this.stack.isEmpty(), "and the command stack is still empty");
				assert.strictEqual(oError, ERROR_INTENTIONALLY, "an error is rejected and catched");
				assert.strictEqual(oError.command, this.failingCommand, "and the command is part of the error");
				assert.equal(fnStackModifiedSpy.callCount, 2, " the modify stack listener is called twice, onence for push and once for pop");
			}.bind(this));
		});

		QUnit.test("when calling pushAndExecute with a failing command as the only command and no error is passed", function(assert) {
			assert.expect(5);
			var fnStackModifiedSpy = sinon.spy();
			this.stack.attachModified(fnStackModifiedSpy);
			this.failingCommand.execute = function() {
				return Promise.reject();
			};
			var oStandardError = new Error("Executing of the change failed.");
			return this.stack.pushAndExecute(this.failingCommand)

			.catch(function(oError) {
				assert.ok(this.stack.isEmpty(), "and the command stack is still empty");
				assert.equal(oError.message, oStandardError.message, "an error is rejected and catched");
				assert.strictEqual(oError.command, this.failingCommand, "and the command is part of the error");
				assert.equal(oError.index, 0, "and the index is part of the error");
				assert.equal(fnStackModifiedSpy.callCount, 2, " the modify stack listener is called twice, onence for push and once for pop");
			}.bind(this));
		});

		QUnit.test("when calling pushAndExecute with a failing command and afterwards with a succeeding command", function(assert) {
			return this.stack.pushAndExecute(this.failingCommand)

			.catch(function(oError) {
				assert.strictEqual(oError, ERROR_INTENTIONALLY, " an error is rejected and catched");
			})

			.then(this.stack.pushAndExecute.bind(this.stack, this.command))

			.then(function() {
				var oTopCommand = this.stack.pop();
				assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
				assert.ok(this.stack.isEmpty(), "and the command stack is empty");
				assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when calling pop at the command stack with an already executed and a not executed command at it's top, ", function(assert) {
			return this.stack.pushAndExecute(this.command)

			.then(function() {
				var oTopCommand = this.stack.pop();
				assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
				assert.ok(this.stack.isEmpty(), "and the command stack is empty");
				assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when pushing and executing a command, ", function(assert) {
			return this.stack.pushAndExecute(this.command)

			.then(function() {
				var oTopCommand = this.stack.top();
				assert.equal(oTopCommand.getId(), this.command.getId(), "then it is on the top of stack");
				assert.ok(this.stack.canUndo(), "then a command can be undone");
				assert.ok(!this.stack.canRedo(), "then stack cannot be redone");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when pushing a failing command and a working command to the stack and calling execute, ", function(assert) {
			this.stack.push(this.failingCommand);
			this.stack.push(this.command);
			return this.stack.execute()

			.catch(function(oError) {
				var aCommands = this.stack.getCommands();
				assert.equal(aCommands.length, 1, "the CommandStack contains one command afterwards");
				assert.equal(aCommands[0].getId(), this.command.getId(), "the remaining command is the one which has been pushed last");
				assert.equal(this.stack._getCommandToBeExecuted().getId(), this.command.getId(), "the variable '_toBeExecuted' points to the remaining command");
				assert.equal(oError.command.getId(), this.failingCommand.getId(), "the error object contains the failing command");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when undoing and redo an empty stack, then no exception should come", function(assert) {
			assert.expect(0);
			this.stack.undo();
			this.stack.redo();
		});
	});

	QUnit.module("Given a property command", {
		beforeEach : function() {
			var oFlexSettings = {
				developerMode: true,
				layer: Layer.VENDOR
			};
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.OLD_VALUE = "2px";
			this.NEW_VALUE = "5px";
			this.oControl = new Column(oMockedAppComponent.createId("control"), {
				width : this.OLD_VALUE
			});
			return CommandFactory.getCommandFor(this.oControl, "Property", {
				propertyName : "width",
				newValue : this.NEW_VALUE,
				oldValue : this.OLD_VALUE,
				semanticMeaning : "resize"
			}, null, oFlexSettings)

			.then(function(oCommand) {
				this.oPropertyCommand = oCommand;
				this.fnApplyChangeSpy = sandbox.spy(FlexCommand.prototype, "_applyChange");
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oControl.destroy();
			this.oPropertyCommand.destroy();
		}
	}, function() {
		QUnit.test("when executing the property command for a property named 'width'", function(assert) {
			return this.oPropertyCommand.execute()

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
				assert.equal(this.oControl.getWidth(), this.NEW_VALUE, "then the controls text changed accordingly");
				return this.oPropertyCommand.undo();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called, because undo is done via rta ControlTreeModifier!");
				assert.equal(this.oControl.getWidth(), this.OLD_VALUE, "then the controls text changed accordingly");

				return this.oPropertyCommand.execute();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
				assert.equal(this.oControl.getWidth(), this.NEW_VALUE, "then the controls text changed accordingly");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});
	});

	QUnit.module("Given a bind property command", {
		beforeEach : function(assert) {
			var oFlexSettings = {
				developerMode: true,
				layer: Layer.VENDOR
			};
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.OLD_BOOLEAN_VALUE = false;
			this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS = "{= ( ${/field1} === 'critical' ) &&  ( ${/field2} > 100 ) }";
			this.NEW_BOOLEAN_VALUE = true;
			this.OLD_VALUE = "critical";
			this.OLD_VALUE_BINDING = "{path:'/field1'}";
			this.NEW_VALUE_BINDING = "{path:'namedModel>/numberAsString', type:'sap.ui.model.type.Integer'}";
			this.NEW_VALUE = "20";
			this.oInput = new Input(oMockedAppComponent.createId("input"), {
				showValueHelp: this.OLD_BOOLEAN_VALUE,
				value: this.OLD_VALUE_BINDING
			});
			var oModel = new JSONModel({
				field1 : this.OLD_VALUE,
				field2 : 15000
			});
			var oNamedModel = new JSONModel({
				numberAsString : this.NEW_VALUE
			});
			this.oInput.setModel(oModel);
			this.oInput.setModel(oNamedModel, "namedModel");

			return CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				propertyName : "showValueHelp",
				newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS
			}, null, oFlexSettings)

			.then(function(oCommand) {
				this.oBindShowValueHelpCommand = oCommand;
				return CommandFactory.getCommandFor(this.oInput, "BindProperty", {
					element : this.oInput,
					propertyName : "showValueHelp",
					newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS
				}, null, oFlexSettings);
			}.bind(this))

			.then(function(oCommand) {
				this.oBindShowValueHelpCommandWithoutOldValueSet = oCommand;
				return CommandFactory.getCommandFor(this.oInput, "BindProperty", {
					propertyName : "value",
					newBinding : this.NEW_VALUE_BINDING
				}, null, oFlexSettings);
			}.bind(this))

			.then(function(oCommand) {
				this.oBindValuePropertyCommand = oCommand;
				return CommandFactory.getCommandFor(this.oInput, "BindProperty", {
					propertyName : "value",
					newBinding : this.NEW_VALUE_BINDING
				}, null, oFlexSettings);
			}.bind(this))

			.then(function(oCommand) {
				this.oBindValuePropertyCommandWithoutOldBindingSet = oCommand;
				this.fnApplyChangeSpy = sandbox.spy(FlexCommand.prototype, "_applyChange");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		},
		afterEach : function() {
			sandbox.restore();
			this.oInput.destroy();
			this.oBindShowValueHelpCommandWithoutOldValueSet.destroy();
			this.oBindShowValueHelpCommand.destroy();
			this.oBindValuePropertyCommand.destroy();
			this.oBindValuePropertyCommandWithoutOldBindingSet.destroy();
		}
	}, function() {
		QUnit.test("when executing the bind property command for a boolean property 'showValueHelp' with an old value and with a new binding containing special character  ", function(assert) {
			return this.oBindShowValueHelpCommandWithoutOldValueSet.execute()

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
				assert.equal(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "then the controls property changed accordingly");
				return this.oBindShowValueHelpCommandWithoutOldValueSet.undo();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called for the undo.");
				assert.equal(this.oInput.getShowValueHelp(), this.OLD_BOOLEAN_VALUE, "then the controls property changed accordingly");
				return this.oBindShowValueHelpCommandWithoutOldValueSet.execute();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
				assert.equal(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "then the controls property changed accordingly");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when executing the bind property command for a property 'value' with an old binding and with a new binding", function(assert) {
			return this.oBindValuePropertyCommandWithoutOldBindingSet.execute()

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
				assert.equal(this.oInput.getValue(), this.NEW_VALUE, "then the controls property changed accordingly");
				return this.oBindValuePropertyCommandWithoutOldBindingSet.undo();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called for the undo.");
				assert.equal(this.oInput.getValue(), this.OLD_VALUE, "then the controls property changed accordingly");
				return this.oBindValuePropertyCommandWithoutOldBindingSet.execute();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
				assert.equal(this.oInput.getValue(), this.NEW_VALUE, "then the controls property changed accordingly");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});
	});

	QUnit.module("Given remove command", {
		beforeEach : function() {
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.oButton = new Button(oMockedAppComponent.createId("button"));

			return CommandFactory.getCommandFor(this.oButton, "Remove", {
				removedElement: this.oButton
			}, new ElementDesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			}))
			.then(function(oCommand) {
				this.oCommand = oCommand;
				return this.oCommand.prepare();
			}.bind(this));
		},
		afterEach : function () {
			sandbox.restore();
			this.oCommand.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when prepare() of remove command is called", function(assert) {
			return this.oCommand.prepare()
				.then(function() {
					assert.deepEqual(this.oCommand.getSelector(), {
						appComponent: oMockedAppComponent,
						controlType: "sap.m.Button",
						id: "testcomponent---button"
					}, "then selector is properly set for remove command");
					assert.ok(this.oCommand.getPreparedChange(), "then change is successfully prepared");
				}.bind(this));
		});
	});

	QUnit.module("Given variant model, variant management reference and flex settings for a rename command", {
		beforeEach: function () {
			var sVariantManagementReference = "dummyVariantManagementReference";
			this.sCurrentVariantReference = "dummyVariantReference";
			this.oFLexSettings = {
				layer: Layer.VENDOR,
				developerMode: false
			};

			this.fnOriginalGetModel = oMockedAppComponent.getModel;
			oMockedAppComponent.getModel = function (sModelName) {
				if (sModelName === flUtils.VARIANT_MODEL_NAME) {
					return {
						getCurrentVariantReference: function (sVariantManagementRef) {
							if (sVariantManagementRef === sVariantManagementReference) {
								return this.sCurrentVariantReference;
							}
						}.bind(this)
					};
				}
			}.bind(this);

			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			sandbox.spy(FlexCommand.prototype, "prepare");

			this.oButton = new Button(oMockedAppComponent.createId("button"));

			this.oCommandFactory = new CommandFactory({
				flexSettings: this.oFLexSettings
			});

			return oCommandFactory.getCommandFor(this.oButton, "Rename", {
				renamedElement: this.oButton
			}, new ElementDesignTimeMetadata({
				data: {
					actions: {
						rename: {
							changeType: "rename"
						}
					}
				}
			}), "dummyVariantManagementReference")
				.then(function (oCommand) {
					this.oCommand = oCommand;
				}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oCommand.destroy();
			this.oButton.destroy();
			this.oCommandFactory.destroy();
			oMockedAppComponent.getModel = this.fnOriginalGetModel;
			delete this.fnOriginalGetModel;
			delete this.oFLexSettings;
			delete this.sCurrentVariantReference;
		}
	}, function () {
		QUnit.test("when prepare() of remove command is called", function (assert) {
			assert.ok(FlexCommand.prototype.prepare.calledOnce, "then FlexCommand.prepare() called once");
			assert.strictEqual(this.oCommand.getPreparedChange().getVariantReference(), this.sCurrentVariantReference, "then correct variant reference set to the prepared change");
			assert.strictEqual(this.oCommand.getPreparedChange().getLayer(), this.oFLexSettings.layer, "then correct layer was set to the prepared change");
			assert.deepEqual(this.oCommandFactory.getFlexSettings(), this.oFLexSettings, "then correct flex settings were set to the commandfactory");
		});
	});

	QUnit.module("Given a command stack with multiple already executed commands", {
		beforeEach : function(assert) {
			sandbox.stub(flUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.renamedButton = new Button();
			this.stack = new Stack();
			this.command = new BaseCommand();
			this.command2 = new BaseCommand();
			var fnStackModifiedSpy = sinon.spy();

			this.stack.attachModified(fnStackModifiedSpy);
			return this.stack.pushAndExecute(this.command)

			.then(this.stack.pushAndExecute.bind(this.stack, this.command2))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		},
		afterEach : function() {
			sandbox.restore();
			this.command.destroy();
			this.command2.destroy();
			this.stack.destroy();
		}
	}, function() {
		QUnit.test("initially", function(assert) {
			var oTopCommand = this.stack.top();
			assert.equal(oTopCommand.getId(), this.command2.getId(), " the last is the top of stack");
		});

		QUnit.test("when undo,", function(assert) {
			var fnLastCommandUndo = sinon.spy(this.command2, "undo");
			var fnStackModified = sinon.spy();
			this.stack.attachModified(fnStackModified);

			return this.stack.undo()

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
						" the to be executed index is in range");
				assert.equal(fnLastCommandUndo.callCount, 1, " the last command was undone");
				assert.equal(fnStackModified.callCount, 1, " the modify stack listener is called");

				assert.ok(this.stack.canRedo(), "then stack can be redone");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when second time undo, then", function(assert) {
			var fnLastCommandUndo = sinon.spy(this.command2, "undo");
			var fnFirstCommandUndo = sinon.spy(this.command, "undo");
			var fnStackModified = sinon.spy();
			this.stack.attachModified(fnStackModified);

			return Promise.resolve()

			.then(this.stack.undo.bind(this.stack))

			.then(this.stack.undo.bind(this.stack))

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
						" the to be executed index is in range");
				assert.equal(fnLastCommandUndo.callCount, 1, " the last command was undone");
				assert.equal(fnFirstCommandUndo.callCount, 1, " the first command was undone");
				assert.ok(fnLastCommandUndo.calledBefore(fnFirstCommandUndo), " the last is called before the first");
				assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when undo and redo, then", function(assert) {
			var fnUndo = sinon.spy(this.command2, "undo");
			var fnExecute = sinon.spy(this.command2, "execute");
			var fnStackModified = sinon.spy();
			this.stack.attachModified(fnStackModified);

			return Promise.resolve()

			.then(this.stack.undo.bind(this.stack))

			.then(function() {
				assert.ok(this.stack.canUndo(), "then a command can be undone");
				assert.ok(this.stack.canRedo(), "then stack can be redone");
			}.bind(this))

			.then(this.stack.redo.bind(this.stack))

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
					" the to be executed index is in range");
				assert.equal(fnUndo.callCount, 1, " the command was undone");
				assert.equal(fnExecute.callCount, 1, " the command was redone");
				assert.ok(fnUndo.calledBefore(fnExecute), " undo was called before execute");

				assert.ok(this.stack.canUndo(), "then a command can be undone");
				assert.ok(!this.stack.canRedo(), "then stack cannot be redone");
				assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called for undo and redo");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when having nothing to redo, redo shouldn't do anything, next command to execute will be still the top command, then", function (assert) {
			var fnRedo1 = sinon.spy(this.command, "execute");
			var fnRedo2 = sinon.spy(this.command2, "execute");
			return this.stack.redo()

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length))
					&& (this.stack._toBeExecuted >= -1), 0, " the to be executed index is in range");
				assert.equal(fnRedo1.callCount, 0, " the command command was not called");
				assert.equal(fnRedo2.callCount, 0, " the command command2 was not called");
			}.bind(this));
		});

		QUnit.test("when emptying the stack, then", function(assert) {
			var fnModifiedSpy = sinon.spy();

			this.stack.attachModified(fnModifiedSpy);

			this.stack.removeAllCommands();

			assert.ok(this.stack.isEmpty(), " the stack is empty");
			assert.equal(this.stack._toBeExecuted, -1, " the toBeExecuted pointer is reset");
			assert.ok(fnModifiedSpy.called, " the modify event was thrown");
		});
	});

	QUnit.module("Given an empty command stack and commands", {
		beforeEach : function() {
			this.stack = new Stack();
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.command = new BaseCommand();
			this.command2 = new BaseCommand();
			this.command3 = new BaseCommand();
			this.command4 = new FlexCommand();
			this.command5 = new FlexCommand();
			this.compositeCommand = new CompositeCommand();
		},
		afterEach : function() {
			sandbox.restore();
			this.command.destroy();
			this.command2.destroy();
			this.command3.destroy();
			this.command4.destroy();
			this.command5.destroy();
			this.compositeCommand.destroy();
			this.stack.destroy();
		}
	}, function() {
		QUnit.test("initially", function(assert) {
			assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
		});

		QUnit.test("After pushing one command", function(assert) {
			this.stack.push(this.command);
			assert.equal(this.stack._toBeExecuted, 0, " the top of stack is to be executed");
		});

		QUnit.test("After pushing one command and executing the top of stack", function(assert) {
			var fnStackModified = sinon.spy(this.stack, "fireModified");
			this.stack.push(this.command);
			assert.equal(fnStackModified.callCount, 1, " the modify stack listener called on push");

			return this.stack.execute()

			.then(function() {
				assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called on execute");
				assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("After pushing one command and calling pushAndExecute the top of stack, then", function(assert) {
			var done = assert.async();
			var fnStackModified = sinon.spy(function() {
				if (fnStackModified.calledOnce) {
					assert.equal(this.stack._toBeExecuted, 0, "command pushed but not executed");
				} else if (fnStackModified.calledTwice) {
					assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
					done();
				}
			}.bind(this));
			this.stack.attachModified(fnStackModified);
			this.stack.pushAndExecute(this.command);
		});

		QUnit.test("When pushing after undone, then", function(assert) {
			return this.stack.pushAndExecute(this.command)

			.then(this.stack.undo.bind(this.stack))

			.then(function() {
				this.stack.push(this.command2);
				assert.equal(this.stack.getCommands().length, 1, " only second command on the stack");
				assert.equal(this.stack._getCommandToBeExecuted().getId(), this.command2.getId(), " 2. command to be executed");
				assert.equal(this.stack._toBeExecuted, 0, " one command to be executed");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when pushing an executed command, ", function(assert) {
			this.stack.pushExecutedCommand(this.rename);

			assert.ok(!this.stack._getCommandToBeExecuted(), " no command to be executed by the stack");
		});

		QUnit.test("when inserting a command into a composite command, ", function(assert) {
			var oChangeContent1 = {
				fileName: "fileName1",
				selector: {
					id: "field1",
					idIsLocal: true
				},
				support: {}
			};
			var oChangeContent2 = {
				fileName: "fileName2",
				selector: {
					id: "field2",
					idIsLocal: true
				},
				support: {}
			};
			var oChange1 = new Change(oChangeContent1);
			var oChange2 = new Change(oChangeContent2);
			this.command4._oPreparedChange = oChange1;
			this.command5._oPreparedChange = oChange2;

			assert.notOk(this.compositeCommand._sCompositeId, "there is no private composite id set initially");
			this.compositeCommand.insertCommand(this.command4, 0);
			assert.ok(this.compositeCommand._sCompositeId, "there is a private composite id set after adding the first command");
			assert.equal(this.command4._oPreparedChange.getDefinition().support.compositeCommand, this.compositeCommand._sCompositeId, "the id is written to the prepared change");
			this.compositeCommand.insertCommand(this.command5, 0);
			assert.equal(this.command5._oPreparedChange.getDefinition().support.compositeCommand, this.compositeCommand._sCompositeId, "the id is written to any further prepared change of an added command");
		});

		QUnit.test("when adding a command to a composite command, ", function(assert) {
			var oChangeContent1 = {
				fileName: "fileName1",
				selector: {
					id: "field1",
					idIsLocal: true
				},
				support: {}
			};
			var oChangeContent2 = {
				fileName: "fileName2",
				selector: {
					id: "field2",
					idIsLocal: true
				},
				support: {}
			};
			var oChange1 = new Change(oChangeContent1);
			var oChange2 = new Change(oChangeContent2);
			this.command4._oPreparedChange = oChange1;
			this.command5._oPreparedChange = oChange2;

			assert.notOk(this.compositeCommand._sCompositeId, "there is no private composite id set initially");
			this.compositeCommand.addCommand(this.command4);
			assert.ok(this.compositeCommand._sCompositeId, "there is a private composite id set after adding the first command");
			assert.equal(this.command4._oPreparedChange.getDefinition().support.compositeCommand, this.compositeCommand._sCompositeId, "the id is written to the prepared change");
			this.compositeCommand.addCommand(this.command5);
			assert.equal(this.command5._oPreparedChange.getDefinition().support.compositeCommand, this.compositeCommand._sCompositeId, "the id is written to any further prepared change of an added command");
		});

		QUnit.test("After adding commands to composite command, when executing the composite and undoing it", function(assert) {
			var fnCommand1Execute = sinon.spy(this.command, "execute");
			var fnCommand2Execute = sinon.spy(this.command2, "execute");
			var fnCommand1Undo = sinon.spy(this.command, "undo");
			var fnCommand2Undo = sinon.spy(this.command2, "undo");

			this.compositeCommand.addCommand(this.command);
			this.compositeCommand.addCommand(this.command2);

			return Promise.resolve()

			.then(this.compositeCommand.execute.bind(this.compositeCommand))

			.then(function() {
				assert.ok(fnCommand1Execute.calledBefore(fnCommand2Execute), "commands are executed in the forward order");
			})

			.then(this.compositeCommand.undo.bind(this.compositeCommand))

			.then(function() {
				assert.ok(fnCommand2Undo.calledBefore(fnCommand1Undo), "commands are undone in the backward order");
			})

			.catch(function(oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("When executing a failing command", function(assert) {
			var oCommandExecutedSpy = sinon.spy(this.stack, "fireCommandExecuted");
			sinon.stub(this.command, "execute").returns(Promise.reject());

			this.stack.push(this.command);
			return this.stack.execute()

			.catch(function() {
				assert.ok(true, "then the command returns a failing promise");
				assert.equal(oCommandExecutedSpy.callCount, 0, "and no command got executed");
			});
		});

		QUnit.test("When executing a composite Command with the second command (of four) inside failing", function(assert) {
			var oStackCommandExecutedSpy = sinon.spy(this.stack, "fireCommandExecuted");
			var oCommand1ExecuteSpy = sinon.spy(this.command, "execute");
			var oCommand1UndoSpy = sinon.spy(this.command, "undo");
			var oCommand3ExecuteSpy = sinon.spy(this.command3, "execute");
			var oCommand4ExecuteSpy = sinon.spy(this.command4, "execute");
			var oCommand3UndoSpy = sinon.spy(this.command3, "undo");
			var oCommand4UndoSpy = sinon.spy(this.command4, "undo");
			this.compositeCommand.addCommand(this.command);
			this.compositeCommand.addCommand(this.command2);
			this.compositeCommand.addCommand(this.command3);
			this.compositeCommand.addCommand(this.command4);
			sinon.stub(this.command2, "execute").returns(Promise.reject());

			this.stack.push(this.compositeCommand);
			return this.stack.execute()

			.catch(function() {
				assert.ok(true, "then the command returns a failing promise");
				assert.ok(oStackCommandExecutedSpy.notCalled, "and the commandExecuted event didn't get thrown");
				assert.ok(oCommand1ExecuteSpy.calledOnce, "and the first command got executed");
				assert.ok(oCommand1UndoSpy.calledOnce, "and undone");
				assert.ok(oCommand3ExecuteSpy.notCalled, "and the third command didn't get executed");
				assert.ok(oCommand3UndoSpy.calledOnce, "but undone");
				assert.ok(oCommand4ExecuteSpy.notCalled, "and the forth command didn't get executed");
				assert.ok(oCommand4UndoSpy.notCalled, "and not undone");
			});
		});
	});

	QUnit.module("Given controls and designTimeMetadata", {
		beforeEach : function () {
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			return ChangeRegistry.getInstance().registerControlsForChanges({
				"sap.m.ObjectHeader": [SimpleChanges.moveControls]
			})
			.then(function() {
				this.oMovable = new ObjectAttribute(oMockedAppComponent.createId("attribute"));
				this.oSourceParent = new ObjectHeader(oMockedAppComponent.createId("header"), {
					attributes : [this.oMovable]
				});
				this.oTargetParent = new ObjectHeader(oMockedAppComponent.createId("targetHeader"));

				this.oRootElement = new VerticalLayout({
					content : [this.oSourceParent, this.oTargetParent]
				});

				this.oSourceParentDesignTimeMetadata = new ElementDesignTimeMetadata({
					data : {
						actions : {
							move : "moveControls"
						},
						fakeAggreagtionWithoutMove : {

						}
					}
				});
				this.oOtherParentDesignTimeMetadata = new ElementDesignTimeMetadata({
					data : {
						actions : {
							move : undefined
						}
					}
				});
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oRootElement.destroy();
			this.oSourceParentDesignTimeMetadata.destroy();
			this.oOtherParentDesignTimeMetadata.destroy();
		}
	}, function() {
		QUnit.test("when asking for a move command", function(assert) {
			return CommandFactory.getCommandFor(this.oSourceParent, "Move", {
				movedElements : [{
					id : this.oMovable.getId(),
					sourceIndex : 0,
					targetIndex : 1
				}],
				source : {
					id : this.oSourceParent.getId(),
					aggregation : "attributes",
					publicAggregation : "attributes"
				},
				target : {
					id : this.oTargetParent.getId(),
					aggregation : "attributes",
					publicAggregation : "attributes"
				}
			}, this.oSourceParentDesignTimeMetadata)

			.then(function(oMoveCommand) {
				assert.equal(oMoveCommand.getChangeType(), "moveControls", "then the command with corresponding changeType is returned");
				oMoveCommand.destroy();
			})

			.catch(function(oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});
	});

	QUnit.module("Given a command stack with a hideControl flex command", {
		beforeEach : function(assert) {
			this.oCommandStack = new Stack();
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);
			this.oButton = new Button(oMockedAppComponent.createId("button"));
			this.oLayout = new VerticalLayout(oMockedAppComponent.createId("layout"), {
				content : [this.oButton]
			});
			this.oCompositeCommand = new CompositeCommand();
			this.oFlexCommand = new FlexCommand({
				element: this.oButton,
				changeType: "hideControl"
			});
			this.fnApplyChangeSpy = sandbox.spy(FlexCommand.prototype, "_applyChange");

			this.fnChangeHandler = {
				applyChange: function (oChange) {
					if (this.revertChange) {
						oChange.setRevertData({
							data: "testdata"
						});
					}
					assert.ok(true, "then change handler's applyChange() called");
				},
				completeChangeContent: function () {
					assert.ok(true, "then change handler's completeChangeContent() called");
				},
				revertChange: function () {
					assert.ok(true, "then change handler's revertChange() called instead of undo");
				}
			};
		},
		afterEach : function () {
			sandbox.restore();
			this.oFlexCommand.destroy();
			this.oCompositeCommand.destroy();
			this.oCommandStack .destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("when command is executed and undo is called", function (assert) {
			assert.expect(8);
			var fnRevertChangesOnControlStub = sandbox.spy(ChangesWriteAPI, "revert");
			sandbox.stub(ChangeRegistry.getInstance(), "getChangeHandler").resolves(this.fnChangeHandler);

			this.oCommandStack.push(this.oFlexCommand);

			return Promise.resolve()
				.then(this.oFlexCommand.prepare.bind(this.oFlexCommand))
				.then(this.oCommandStack.execute.bind(this.oCommandStack))
				.then(function () {
					var oChange = this.oFlexCommand.getPreparedChange();
					assert.ok(true, "then a Promise.resolve() is returned on Stack.execute()");
					assert.equal(this.fnApplyChangeSpy.callCount, 1, "then Command._applyChange called once");
					assert.deepEqual(oChange.getRevertData(), {
						data: "testdata"
					}, "then revert data set correctly");

					return this.oCommandStack.undo()
						.then(function () {
							assert.ok(true, "then a Promise.resolve() is returned on Stack.undo()");
							assert.ok(fnRevertChangesOnControlStub.calledWithExactly({change: oChange, element: this.oButton}), "then PersistenceWriteAPI.remove called with required parameters");
						}.bind(this));
				}.bind(this))
				.catch(function(oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});

		QUnit.test("when change handler is not available", function (assert) {
			assert.expect(1);
			sandbox.stub(ChangeRegistry.getInstance(), "getChangeHandler").returns(undefined);
			this.oCommandStack.push(this.oFlexCommand);

			return this.oCommandStack.execute()
				.catch(function () {
					assert.ok(true, "then Promise reject returned");
				});
		});
	});

	QUnit.module("Given a command factory and a bound control containing a template binding", {
		beforeEach : function(assert) {
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);

			var done = assert.async();

			var aTexts = [{text1: "Text 1", text2: "More Text 1"}, {text1: "Text 2", text2: "More Text 2"}, {text1: "Text 3", text2: "More Text 3"}];
			var oModel = new JSONModel({
				texts : aTexts
			});

			this.oItemTemplate = new CustomListItem("item", {
				content : new VBox("vbox1", {
					items : [
						new VBox("vbox2", {
							items : [
								new VBox("vbox3", {
									items : [
										new Text("text1", {text : "{text1}"}),
										new Text("text2", {text : "{text2}"})
									]
								})
							]
						})
					]
				})
			});
			this.oList = new List("list", {
				items : {
					path : "/texts",
					template : this.oItemTemplate,
					templateShareable : true
				}
			}).setModel(oModel);

			this.oList.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oVBox31 = this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0];
			this.oText1 = this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[0];
			this.oText2 = this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[1];
			this.oDesignTime = new DesignTime({
				rootElements : [this.oList]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oListOverlay = OverlayRegistry.getOverlay(this.oList);
				this.oVbox31Overlay = OverlayRegistry.getOverlay(this.oVBox31);
				this.oText1Overlay = OverlayRegistry.getOverlay(this.oText1);
				this.oText2Overlay = OverlayRegistry.getOverlay(this.oText2);
				done();
			}.bind(this));

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.removeRegistryItem({controlType : "sap.m.List"});
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.VBox" : {
					moveControls: "default"
				},
				"sap.m.Text" : {
					hideControl : "default",
					unhideControl : "default",
					rename : sap.ui.fl.changeHandler.BaseRename.createRenameChangeHandler({
						propertyName: "text",
						translationTextType: "XTXT"
					})
				}
			});
		},
		afterEach : function() {
			sandbox.restore();
			this.oList.destroy();
			this.oItemTemplate.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when getting a move change command for a bound control deep inside a bound list control,", function(assert) {
			var oCreateChangeFromDataSpy = sandbox.spy(FlexCommand.prototype, "_createChangeFromData");
			var oCompleteChangeContentSpy = sandbox.spy(MoveControls, "completeChangeContent");
			var oApplyChangeSpy = sandbox.spy(MoveControls, "applyChange");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.CUSTOMER,
					developerMode: false
				}
			});

			var oMovedElement = this.oText1;
			var oRelevantContainer = oMovedElement.getParent();
			var oSource = {
				parent : oRelevantContainer,
				aggregation: "items"
			};
			var oTarget = oSource;
			var oSourceParentDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						move : "moveControls"
					}
				}
			});

			var oExpectedFlexSettings = {
				layer: Layer.CUSTOMER,
				developerMode: false,
				originalSelector : "vbox3",
				templateSelector : "list",
				content : {
					boundAggregation : "items"
				}
			};
			return oCommandFactory.getCommandFor(oRelevantContainer, "move", {
				movedElements : [{
					element : oMovedElement,
					sourceIndex : 0,
					targetIndex : 1
				}],
				source : oSource,
				target : oTarget
			}, oSourceParentDesignTimeMetadata)

			.then(function(oMoveCommand) {
				assert.ok(oMoveCommand, "then command is available");
				assert.equal(oCreateChangeFromDataSpy.callCount, 1, "and '_createChangeFromData' is called once");
				assert.deepEqual(oCreateChangeFromDataSpy.args[0][1], oExpectedFlexSettings, "and '_createChangeFromData' is called with the enriched set of flex settings");
				assert.strictEqual(oMoveCommand.getPreparedChange().getDefinition().dependentSelector.originalSelector.id, oExpectedFlexSettings.originalSelector, "and the prepared change contains the original selector as dependency");
				assert.strictEqual(oMoveCommand.getPreparedChange().getContent().boundAggregation, "items", "and the bound aggegation is written to the change content");
				assert.strictEqual(oMoveCommand.getPreparedChange().getContent().source.selector.id, oMoveCommand.getPreparedChange().getDefinition().dependentSelector.source.id, "and the content of the change is also adjusted");
				assert.strictEqual(oMoveCommand.getPreparedChange().getContent().target.selector.id, oMoveCommand.getPreparedChange().getDefinition().dependentSelector.target.id, "and the content of the change is also adjusted");
				assert.strictEqual(oMoveCommand.getPreparedChange().getContent().movedElements[0].selector.id, oMoveCommand.getPreparedChange().getDefinition().dependentSelector.movedElements[0].id, "and the content of the change is also adjusted");
				assert.notEqual(oMoveCommand.getMovedElements()[0].element.getId(), this.oText1.getId(), "and the moved element is not the UI control anymore");
				var oTextItem = this.oItemTemplate.getContent()[0].getItems()[0].getItems()[0].getItems()[0];
				assert.strictEqual(oMoveCommand.getMovedElements()[0].element, oTextItem, "the moved element is the corresponding control in the template");
				return oMoveCommand.execute();
			}.bind(this))

			.then(function() {
				assert.equal(oCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(oApplyChangeSpy.callCount, 1, "then applyChange is called once");
				assert.equal(this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getText(), "More Text 1", "and text control in first item has been moved");
				assert.equal(this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].getItems()[1].getText(), "Text 1", "and text control in first item has been moved");
				assert.equal(this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getText(), "More Text 2", "and text control in second item has been moved");
				assert.equal(this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[1].getText(), "Text 2", "and text control in second item has been moved");
				assert.equal(this.oList.getItems()[2].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getText(), "More Text 3", "and text control in third item has been moved");
				assert.equal(this.oList.getItems()[2].getContent()[0].getItems()[0].getItems()[0].getItems()[1].getText(), "Text 3", "and text control in third item has been moved");
			}.bind(this));
		});

		QUnit.test("when getting a reveal change command for an invisible bound control deep inside a bound list control,", function(assert) {
			var oCreateChangeFromDataSpy = sandbox.spy(FlexCommand.prototype, "_createChangeFromData");
			var oCompleteChangeContentSpy = sandbox.spy(UnhideControl, "completeChangeContent");
			var oApplyChangeSpy = sandbox.spy(UnhideControl, "applyChange");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.CUSTOMER,
					developerMode: false
				}
			});

			var oRevealedElement = this.oText1;
			var oRelevantContainer = oRevealedElement.getParent();
			var oSourceParentDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						reveal : "unhideControl"
					}
				}
			});

			var oExpectedFlexSettings = {
				layer: Layer.CUSTOMER,
				developerMode: false,
				originalSelector : "text1",
				templateSelector : "list",
				content : {
					boundAggregation : "items"
				}
			};

			var oTextItem = this.oItemTemplate.getContent()[0].getItems()[0].getItems()[0].getItems()[0];
			oTextItem.setVisible(false);
			this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].getItems()[0].setVisible(false);
			this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[0].setVisible(false);
			this.oList.getItems()[2].getContent()[0].getItems()[0].getItems()[0].getItems()[0].setVisible(false);

			return oCommandFactory.getCommandFor(oRevealedElement, "reveal", {
				revealedElementId : oRevealedElement.getId(),
				directParent : oRelevantContainer
			}, oSourceParentDesignTimeMetadata)

			.then(function(oRevealCommand) {
				assert.ok(oRevealCommand, "then command is available");
				assert.equal(oCreateChangeFromDataSpy.callCount, 1, "and '_createChangeFromData' is called once");
				assert.deepEqual(oCreateChangeFromDataSpy.args[0][1], oExpectedFlexSettings, "and '_createChangeFromData' is called with the enriched set of flex settings");
				assert.strictEqual(oRevealCommand.getPreparedChange().getDefinition().dependentSelector.originalSelector.id, oExpectedFlexSettings.originalSelector, "and the prepared change contains the original selector as dependency");
				assert.strictEqual(oRevealCommand.getPreparedChange().getContent().boundAggregation, "items", "and the bound aggegation is written to the change content");
				assert.strictEqual(oRevealCommand._getChangeSpecificData().revealedElementId, oTextItem.getId(), "and the change specific content of the change is also adjusted");
				return oRevealCommand.execute();
			})

			.then(function() {
				assert.equal(oCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(oApplyChangeSpy.callCount, 1, "then applyChange is called once");
				assert.equal(this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getVisible(), true, "and text control in first item is visible again");
				assert.equal(this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getVisible(), true, "and text control in second item is visible again");
				assert.equal(this.oList.getItems()[2].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getVisible(), true, "and text control in third item is visible again");
			}.bind(this));
		});

		QUnit.test("when getting a property change command for a bound control deep inside a bound list control,", function(assert) {
			var oCreateChangeFromDataSpy = sandbox.spy(FlexCommand.prototype, "_createChangeFromData");
			var oCompleteChangeContentSpy = sandbox.spy(PropertyChange, "completeChangeContent");
			var oApplyChangeSpy = sandbox.spy(PropertyChange, "applyChange");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR,
					developerMode: true
				}
			});

			var oElement = this.oText1;
			var oTextItem = this.oItemTemplate.getContent()[0].getItems()[0].getItems()[0].getItems()[0];

			var oExpectedFlexSettings = {
				layer: Layer.VENDOR,
				developerMode: true,
				originalSelector : "text1",
				templateSelector : "list",
				content : {
					boundAggregation : "items"
				}
			};

			return oCommandFactory.getCommandFor(oElement, "property", {
				element : oElement,
				changeType: "propertyChange",
				newValue: false,
				propertyName: "visible"
			})

			.then(function(oPropertyCommand) {
				assert.ok(oPropertyCommand, "then command is available");
				assert.equal(oCreateChangeFromDataSpy.callCount, 1, "and '_createChangeFromData' is called once");
				assert.deepEqual(oCreateChangeFromDataSpy.args[0][1], oExpectedFlexSettings, "and '_createChangeFromData' is called with the enriched set of flex settings");
				assert.strictEqual(oPropertyCommand.getPreparedChange().getDefinition().dependentSelector.originalSelector.id, oExpectedFlexSettings.originalSelector, "and the prepared change contains the original selector as dependency");
				assert.strictEqual(oPropertyCommand.getPreparedChange().getContent().boundAggregation, "items", "and the bound aggegation is written to the change content");
				assert.strictEqual(oPropertyCommand._getChangeSpecificData().selector.id, oTextItem.getId(), "and the change specific content of the change is also adjusted");
				return oPropertyCommand.execute();
			})

			.then(function() {
				assert.equal(oCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(oApplyChangeSpy.callCount, 1, "then applyChange is called once");
				assert.equal(this.oList.getItems()[0].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getVisible(), false, "and visibility property of text control in first item is set to invisible");
				assert.equal(this.oList.getItems()[1].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getVisible(), false, "and visibility property of text control in second item is set to invisible");
				assert.equal(this.oList.getItems()[2].getContent()[0].getItems()[0].getItems()[0].getItems()[0].getVisible(), false, "and visibility property of text control in third item is set to invisible");
			}.bind(this));
		});
	});

	QUnit.module("Given a command factory and a bound control containing multiple template bindings", {
		beforeEach : function(assert) {
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);

			var done = assert.async();

			var aInnerTexts = [{text: "More Text 1"}, {text: "More Text 2"}, {text: "More Text 3"}];
			var aTexts1 = [{text: "Text 1", inner: aInnerTexts}, {text: "Text 2", inner: aInnerTexts}, {text: "Text 3", inner: aInnerTexts}];
			var oModel = new JSONModel({
				texts1 : aTexts1
			});

			this.oItemTemplate = new CustomListItem("item", { //binding context /texts1
				content : new VBox(oMockedAppComponent.createId("vbox1"), {
					items : [
						new Text({id: oMockedAppComponent.createId("text"), text: "{text}"}), //binding context /texts1
						new VBox(oMockedAppComponent.createId("vbox2"), {
							items : {
								path : "inner",
								template : new Text({id: oMockedAppComponent.createId("inner-text"), text:"{text}"}), //binding context /texts1/inner
								templateShareable : false
							}
						})
					]
				})
			});
			this.oList = new List(oMockedAppComponent.createId("list"), {
				items : {
					path : "/texts1",
					template : this.oItemTemplate,
					templateShareable : true
				}
			}).setModel(oModel);

			this.oList.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.removeRegistryItem({controlType : "sap.m.List"});
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.VBox" : {
					moveControls: "default"
				},
				"sap.m.Text" : {
					hideControl : "default",
					rename : sap.ui.fl.changeHandler.BaseRename.createRenameChangeHandler({
						propertyName: "text",
						translationTextType: "XTXT"
					})
				}
			})
			.then(function() {
				this.oDesignTime = new DesignTime({
					rootElements : [this.oList]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oListOverlay = OverlayRegistry.getOverlay(this.oList);
					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oList.destroy();
			this.oItemTemplate.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when getting a rename change command for a bound control deep inside a bound list control,", function(assert) {
			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.CUSTOMER,
					developerMode: false
				}
			});

			var oRenamedElement = this.oList.getItems()[2].getContent()[0].getItems()[1].getItems()[1];

			return oCommandFactory.getCommandFor(oRenamedElement, "rename", {
				renamedElement : oRenamedElement,
				newValue : "new"
			}, new ElementDesignTimeMetadata())

			.then(function() {
				assert.notOk(true, "then getCommandFor should reject an error promise but has resolved command");
			})

			.catch(function(oError) {
				assert.equal(oError.message, "Multiple template bindings are not supported",
					"an error message is raised that multiple bindings are not supported");
			});
		});
	});

	QUnit.module("Given a command factory and a bound control containing an aggregation binding with a factory function", {
		beforeEach : function(assert) {
			sandbox.stub(flUtils, "_getComponentForControl").returns(oMockedAppComponent);

			var done = assert.async();

			var aTexts = [{text1: "Text 1", text2: "More Text 1"}, {text1: "Text 2", text2: "More Text 2"}, {text1: "Text 3", text2: "More Text 3"}];
			var oModel = new JSONModel({
				texts : aTexts
			});

			this.oList = new List("list").setModel(oModel);
			this.oList.bindAggregation("items", "/texts", function(sId, oContext) {
				var oItem;
				if (oContext.getProperty("text1").charAt(5) % 2 === 0) {
					oItem = new CustomListItem(sId, {
						content : new VBox(sId + "--vbox", {
							items : [
								new Text(sId + "--text1", {text : "{text1}"}),
								new Text(sId + "--text2", {text : "{text2}"})
							]
						})
					});
				} else {
					oItem = new CustomListItem(sId, {
						content : new VBox(sId + "--vbox", {
							items : [
								new Button(sId + "--button1", {text : "{text1}"}),
								new Button(sId + "--button2", {text : "{text2}"})
							]
						})
					});
				}
				return oItem;
			});

			this.oList.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oText1 = this.oList.getItems()[1].getContent()[0].getItems()[0];
			var oDesignTime = new DesignTime({
				rootElements : [this.oList]
			});

			oDesignTime.attachEventOnce("synced", done);
		},
		afterEach : function() {
			sandbox.restore();
			this.oList.destroy();
		}
	}, function() {
		QUnit.test("when getting a property change command for a bound control inside a bound list control,", function(assert) {
			var oCreateChangeFromDataSpy = sandbox.spy(FlexCommand.prototype, "_createChangeFromData");
			var oCompleteChangeContentSpy = sandbox.spy(PropertyChange, "completeChangeContent");
			var oApplyChangeSpy = sandbox.spy(PropertyChange, "applyChange");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR,
					developerMode: true
				}
			});

			var oExpectedFlexSettings = {
				layer: Layer.VENDOR,
				developerMode: true
			};

			return oCommandFactory.getCommandFor(this.oText1, "property", {
				element : this.oText1,
				changeType: "propertyChange",
				newValue: false,
				propertyName: "visible"
			})

			.then(function(oPropertyCommand) {
				assert.ok(oPropertyCommand, "then command is available");
				assert.equal(oCreateChangeFromDataSpy.callCount, 1, "and '_createChangeFromData' is called once");
				assert.deepEqual(oCreateChangeFromDataSpy.args[0][1], oExpectedFlexSettings, "and '_createChangeFromData' is called with the enriched set of flex settings");
				assert.strictEqual(oPropertyCommand._getChangeSpecificData().selector.id, this.oText1.getId(), "and the change specific content has the selected element as selector");
				return oPropertyCommand.execute();
			}.bind(this))

			.then(function() {
				assert.equal(oCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(oApplyChangeSpy.callCount, 1, "then applyChange is called once");
				assert.equal(this.oList.getItems()[0].getContent()[0].getItems()[0].getVisible(), true, "and visibility property of the control in first item is not set to invisible");
				assert.equal(this.oList.getItems()[1].getContent()[0].getItems()[0].getVisible(), false, "and visibility property of the control in second item is set to invisible");
				assert.equal(this.oList.getItems()[2].getContent()[0].getItems()[0].getVisible(), true, "and visibility property of the control in third item is not set to invisible");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});