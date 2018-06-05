/*global QUnit sinon*/

sap.ui.require([
	'sap/m/Button',
	'sap/m/Input',
	'sap/m/ObjectHeader',
	'sap/m/ObjectAttribute',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/table/Column',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/command/FlexCommand',
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/command/Remove',
	'sap/ui/rta/command/CompositeCommand',
	'sap/ui/rta/command/Stack',
	'sap/ui/fl/changeHandler/MoveControls',
	'sap/ui/fl/changeHandler/HideControl',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/registry/SimpleChanges',
	'sap/ui/fl/Change',
	'sap/ui/model/json/JSONModel',
	'sap/ui/fl/Utils',
	'sap/ui/rta/ControlTreeModifier',
	'sap/ui/fl/FlexControllerFactory',
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	Button,
	Input,
	ObjectHeader,
	ObjectAttribute,
	VerticalLayout,
	Column,
	ElementDesignTimeMetadata,
	CommandFactory,
	FlexCommand,
	BaseCommand,
	Remove,
	CompositeCommand,
	Stack,
	MoveControls,
	HideControl,
	ChangeRegistry,
	SimpleChanges,
	Change,
	JSONModel,
	FlexUtils,
	RtaControlTreeModifier,
	FlexControllerFactory
) {
	"use strict";

	var oCommandFactory = new CommandFactory({
		flexSettings: {
			layer: "VENDOR"
		}
	});

	var sandbox = sinon.sandbox.create();
	sinon.stub(FlexUtils, "getCurrentLayer").returns("VENDOR");
	var ERROR_INTENTIONALLY = new Error("this command intentionally failed");

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
		},
		getModel: function () {},
		createId : function(sId) {
			return 'testcomponent---' + sId;
		}
	};

	QUnit.module("Given a command factory", {
		beforeEach : function(assert) {
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.oButton = new Button(oMockedAppComponent.createId("myButton"));
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when getting a property change command for button,", function(assert) {
			var oCommand = oCommandFactory.getCommandFor(this.oButton, "property", {
				propertyName : "visible",
				oldValue : this.oButton.getVisible(),
				newValue : false
			});
			assert.ok(oCommand, "then command without flex settings is available");
			assert.strictEqual(oCommand.getNewValue(), false, "and its settings are merged correctly");

			oCommandFactory.setFlexSettings({
				layer: "VENDOR",
				developerMode: true
			});
			var oCommand2 = oCommandFactory.getCommandFor(this.oButton, "property", {
				propertyName : "visible",
				oldValue : this.oButton.getVisible(),
				newValue : false
			});
			assert.ok(oCommand2, "then command with flex settings is available");
			assert.strictEqual(oCommand2.getNewValue(), false, "and its settings are merged correctly");

			oCommandFactory.setFlexSettings({
				layer: "VENDOR",
				developerMode: false
			});
		});

		QUnit.test("when getting a property change command for button with a static call to getCommandFor,", function(assert) {
			var oFlexSettings = {
				layer: "VENDOR",
				developerMode: true,
				scenario: sap.ui.fl.Scenario.AppVariant,
				projectId: "projectId",
				baseId: "baseId"
			};

			var oPrepareStub = sandbox.stub(FlexCommand.prototype, "prepare");

			CommandFactory.getCommandFor(this.oButton, "property", {
				propertyName : "visible",
				oldValue : this.oButton.getVisible(),
				newValue : false
			}, null, oFlexSettings);

			assert.equal(oPrepareStub.callCount, 1, "the _getCommandFor method was called");
			assert.ok(oPrepareStub.lastCall.args[0].namespace, "and the namespace got added to the flexSettings");
			assert.ok(oPrepareStub.lastCall.args[0].rootNamespace, "and the rootNamespace got added to the flexSettings");
		});
	});

	QUnit.module("Given a flex command", {
		beforeEach : function(assert) {
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.fnApplyChangeSpy = sandbox.spy(HideControl, "applyChange");
			this.oFlexCommand = new FlexCommand({
				element : new Button(),
				changeType : "hideControl"
			});
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oFlexCommand.destroy();
		}
	}, function() {
		QUnit.test("when executing the command,", function(assert) {
			assert.ok(this.oFlexCommand.isEnabled(), "then command is enabled");
			return this.oFlexCommand.execute().then(function() {
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
			}.bind(this));
		});
	});

	QUnit.module("Given a command stack", {
		beforeEach : function(assert) {
			this.stack = new Stack();
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.command = new BaseCommand();
			this.failingCommand = this.command.clone();
			this.failingCommand.execute = function(oElement) {
				return Promise.reject(ERROR_INTENTIONALLY);
			};
			this.command2 = new BaseCommand();
		},
		afterEach : function(assert) {
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
			}.bind(this));
		});

		QUnit.test("when re-doing the empty stack, ", function(assert) {
			assert.ok(!this.stack.canRedo(), "then stack cannot be redone");

			return this.stack.redo()

			.then(function() {
				assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
								" the to be executed index is in range");
			}.bind(this));
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
				assert.equal(this.stack.getCommands()[0].getId(), this.command.getId(), "  only first commmand is on the stack");
				assert.equal(oTopCommand.getId(), this.command2.getId(), " the correct command is returned");
			}.bind(this));
		});

		QUnit.test("when calling pushAndExecute with an failing command as the only command", function(assert) {
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

		QUnit.test("when calling pushAndExecute with an failing command as the only command and no error is passed", function(assert) {
			assert.expect(5);
			var fnStackModifiedSpy = sinon.spy();
			this.stack.attachModified(fnStackModifiedSpy);
			this.failingCommand.execute = function(oElement) {
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

		QUnit.test("when calling pushAndExecute with an failing command and afterwards with a succeeding command", function(assert) {
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
			}.bind(this));
		});

		QUnit.test("when calling pop at the command stack with an already executed and a not executed command at it's top, ", function(assert) {
			return this.stack.pushAndExecute(this.command)

			.then(function() {
				var oTopCommand = this.stack.pop();
				assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
				assert.ok(this.stack.isEmpty(), "and the command stack is empty");
				assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
			}.bind(this));
		});

		QUnit.test("when pushing and executing a command, ", function(assert) {
			return this.stack.pushAndExecute(this.command)

			.then(function() {
				var oTopCommand = this.stack.top();
				assert.equal(oTopCommand.getId(), this.command.getId(), "then it is on the top of stack");
				assert.ok(this.stack.canUndo(), "then a command can be undone");
				assert.ok(!this.stack.canRedo(), "then stack cannot be redone");
			}.bind(this));
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
			}.bind(this));
		});

		QUnit.test("when undoing and redo an empty stack, then no exception should come", function(assert) {
			assert.expect(0);
			this.stack.undo();
			this.stack.redo();
		});
	});

	QUnit.module("Given a property command", {
		beforeEach : function(assert) {
			var oFlexSettings = {
				developerMode: true,
				layer: "VENDOR"
			};
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.OLD_VALUE = '2px';
			this.NEW_VALUE = '5px';
			this.oControl = new Column(oMockedAppComponent.createId("control"), {
				width : this.OLD_VALUE
			});
			this.oPropertyCommand = CommandFactory.getCommandFor(this.oControl, "Property", {
				propertyName : "width",
				newValue : this.NEW_VALUE,
				oldValue : this.OLD_VALUE,
				semanticMeaning : "resize"
			}, null, oFlexSettings);
			this.oPropertyCommandWithOutOldValueSet = CommandFactory.getCommandFor(this.oControl, "Property", {
				propertyName : "width",
				newValue : this.NEW_VALUE,
				semanticMeaning : "resize"
			}, null, oFlexSettings);
			this.fnApplyChangeSpy = sandbox.spy(FlexCommand.prototype, "_applyChange");
		},
		afterEach : function(assert) {
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
			}.bind(this));
		});
	});

	QUnit.module("Given a bind property command", {
		beforeEach : function(assert) {
			var oFlexSettings = {
				developerMode: true,
				layer: "VENDOR"
			};
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
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

			this.oBindShowValueHelpCommand = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				propertyName : "showValueHelp",
				newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS
			}, null, oFlexSettings);
			this.oBindShowValueHelpCommandWithoutOldValueSet = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				element : this.oInput,
				propertyName : "showValueHelp",
				newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS
			}, null, oFlexSettings);
			this.oBindValuePropertyCommand = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				propertyName : "value",
				newBinding : this.NEW_VALUE_BINDING
			}, null, oFlexSettings);
			this.oBindValuePropertyCommandWithoutOldBindingSet = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				propertyName : "value",
				newBinding : this.NEW_VALUE_BINDING
			}, null, oFlexSettings);
			this.fnApplyChangeSpy = sandbox.spy(FlexCommand.prototype, "_applyChange");
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oInput.destroy();
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
			}.bind(this));
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
			}.bind(this));
		});
	});

	QUnit.module("Given remove command", {
		beforeEach : function(assert) {
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.oButton = new Button(oMockedAppComponent.createId("button"));
			this.oCommand = CommandFactory.getCommandFor(this.oButton, "Remove", {
				removedElement: this.oButton
			}, new ElementDesignTimeMetadata({
					data : {
						actions : {
							remove : {
								changeType : "hideControl"
							}
						}
					}
				}));

			this.oCommand.prepare();
		},
		afterEach : function (assert) {
			sandbox.restore();
			this.oCommand.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when prepare() of remove command is called", function(assert) {
			this.oCommand.prepare();
			assert.deepEqual(this.oCommand.getSelector(), {
				appComponent: oMockedAppComponent,
				controlType: "sap.m.Button",
				id: "testcomponent---button"
			}, "then selector is properly set for remove command");
			assert.ok(this.oCommand.getPreparedChange(), "then change is successfully prepared");
		});
	});

	QUnit.module("Given a command stack with multiple already executed commands", {
		beforeEach : function(assert) {
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.renamedButton = new Button();
			this.stack = new Stack();
			this.command = new BaseCommand();
			this.command2 = new BaseCommand();
			var fnStackModifiedSpy = sinon.spy();

			this.stack.attachModified(fnStackModifiedSpy);
			return this.stack.pushAndExecute(this.command)

			.then(this.stack.pushAndExecute.bind(this.stack, this.command2))

			.then(function() {
			});
		},
		afterEach : function(assert) {
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
			}.bind(this));
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
			}.bind(this));
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
			}.bind(this));
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
		beforeEach : function(assert) {
			this.stack = new Stack();
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.command = new BaseCommand();
			this.command2 = new BaseCommand();
			this.command3 = new BaseCommand();
			this.command4 = new FlexCommand();
			this.command5 = new FlexCommand();
			this.compositeCommand = new CompositeCommand();
		},
		afterEach : function(assert) {
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
			}.bind(this));
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
			}.bind(this));
		});

		QUnit.test("when pushing an executed command, ", function(assert) {
			this.stack.pushExecutedCommand(this.rename);

			assert.ok(!this.stack._getCommandToBeExecuted(), " no command to be executed by the stack");

		});

		QUnit.test("when inserting a command into a composite command, ", function(assert) {
			var oChangeContent1 = {
				"fileName": "fileName1",
				"selector": {
					"id": "field1",
					"idIsLocal": true
				},
				support: {}
			};
			var oChangeContent2 = {
					"fileName": "fileName2",
					"selector": {
						"id": "field2",
						"idIsLocal": true
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
				"fileName": "fileName1",
				"selector": {
					"id": "field1",
					"idIsLocal": true
				},
				support: {}
			};
			var oChangeContent2 = {
				"fileName": "fileName2",
				"selector": {
					"id": "field2",
					"idIsLocal": true
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
			var oCommand3ExecuteSpy = sinon.spy(this.command3, "execute");
			var oCommand4ExecuteSpy = sinon.spy(this.command4, "execute");
			// workaround for phantomJS, as the normal spy like for command3 doesn't work..
			var iCommand1UndoSpyCallCount = 0;
			sinon.stub(this.command, "undo").returns(new Promise(function(fnResolve) {
				iCommand1UndoSpyCallCount++;
				fnResolve();
			}));
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
				assert.equal(oStackCommandExecutedSpy.callCount, 0, "and the commandExecuted event didn't get thrown");
				assert.equal(oCommand1ExecuteSpy.callCount, 1, "and the first command got executed");
				assert.equal(iCommand1UndoSpyCallCount, 1, "and undone");
				assert.equal(oCommand3ExecuteSpy.callCount, 0, "and the third command didn't get executed");
				assert.equal(oCommand3UndoSpy.callCount, 1, "but undone");
				assert.equal(oCommand4ExecuteSpy.callCount, 0, "and the forth command didn't get executed");
				assert.equal(oCommand4UndoSpy.callCount, 0, "and not undone");
			});
		});
	});

	QUnit.module("Given controls and designTimeMetadata", {
		beforeEach : function(assert){
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			ChangeRegistry.getInstance().registerControlsForChanges({
				"sap.m.ObjectHeader": [SimpleChanges.moveControls]
			});
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
		},
		afterEach : function(){
			sandbox.restore();
			this.oRootElement.destroy();
			this.oSourceParentDesignTimeMetadata.destroy();
			this.oOtherParentDesignTimeMetadata.destroy();
		}
	}, function() {
		QUnit.test("when asking for a move command", function(assert){
			var oMoveCmd = CommandFactory.getCommandFor(this.oSourceParent, "Move", {
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
			}, this.oSourceParentDesignTimeMetadata );

			assert.equal(oMoveCmd.getChangeType(), "moveControls", "then the command with corresponding changeType is returned");

			oMoveCmd.destroy();
		});
	});

	QUnit.module("Given a command stack with a hideControl flex command", {
		beforeEach : function(assert) {
			this.oCommandStack = new Stack();
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			var oButton = new Button(oMockedAppComponent.createId("button"));
			this.oLayout = new VerticalLayout(oMockedAppComponent.createId("layout"), {
				content : [oButton]
			});
			this.oCompositeCommand = new CompositeCommand();
			this.oFlexCommand = new FlexCommand({
				element: oButton,
				changeType: "hideControl"
			});
			this.fnApplyChangeSpy = sandbox.spy(FlexCommand.prototype, "_applyChange");
			this.fnRtaStartRecordingStub = sandbox.stub(RtaControlTreeModifier, "startRecordingUndo");
			this.fnPerformUndoStub = sandbox.stub(RtaControlTreeModifier, "performUndo");
			this.fnRtaStopRecordingStub = sandbox.stub(RtaControlTreeModifier, "stopRecordingUndo", function() {
				return ["undoOperation1", "undoOperation2"];
			});

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
		afterEach : function(assert) {
			sandbox.restore();
			this.oFlexCommand.destroy();
			this.oCompositeCommand.destroy();
			this.oCommandStack .destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("when change handler is revertible and command is executed", function (assert) {
			assert.expect(10);
			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent);
			var fnRevertChangesOnControlStub = sandbox.spy(oFlexController, "revertChangesOnControl");
			sandbox.stub(ChangeRegistry.getInstance(), "getChangeHandler").returns(this.fnChangeHandler);

			this.oCommandStack.push(this.oFlexCommand);

			return this.oCommandStack.execute()
				.then( function () {
					var oChange = this.oFlexCommand.getPreparedChange();
					assert.ok(true, "then a Promise.resolve() is returned on Stack.execute()");
					assert.equal(this.fnApplyChangeSpy.callCount, 1, "then Command._applyChange called once");
					assert.deepEqual(oChange.getRevertData(), {
						data: "testdata"
					}, "then revert data set correctly");

					return this.oCommandStack.undo()
						.then( function () {
							assert.ok(true, "then a Promise.resolve() is returned on Stack.undo()");
							assert.ok(fnRevertChangesOnControlStub.calledWith([oChange], oMockedAppComponent), "then FlexController.revertChangesOnControl called with required parameters");
							assert.equal(this.fnRtaStartRecordingStub.callCount, 0, "then recording of rta undo operations not started");
							assert.equal(this.fnRtaStopRecordingStub.callCount, 0, "then recording of rta undo operations not stopped");
						}.bind(this));
				}.bind(this));
		});

		QUnit.test("when change handler is not revertible and command is executed", function (assert) {
			assert.expect(8);
			delete this.fnChangeHandler.revertChange;
			sandbox.stub(ChangeRegistry.getInstance(), "getChangeHandler").returns(this.fnChangeHandler);
			this.oCommandStack.push(this.oFlexCommand);

			return this.oCommandStack.execute()
				.then( function () {
					var oChange = this.oFlexCommand.getPreparedChange();
					assert.equal(this.fnApplyChangeSpy.callCount, 1, "then Command._applyChange called once");
					assert.notOk(oChange.getRevertData(), "then no revert data set for change");

					return this.oCommandStack.undo()
						.then( function () {
							assert.ok(true, "then a Promise.resolve() is returned on Stack.undo()");
							assert.equal(this.fnRtaStartRecordingStub.callCount, 1, "then recording of rta undo operations is started");
							assert.equal(this.fnRtaStopRecordingStub.callCount, 1, "then recording of rta undo operations is stopped");
							assert.ok(this.fnPerformUndoStub.calledWith(["undoOperation1", "undoOperation2"]), "then undo operation is performed with the correct operations");
						}.bind(this));
				}.bind(this));
		});

		QUnit.test("when change handler is not available", function (assert) {
			assert.expect(1);
			sandbox.stub(ChangeRegistry.getInstance(), "getChangeHandler").returns(undefined);
			this.oCommandStack.push(this.oFlexCommand);

			return this.oCommandStack.execute()
				.then(
					function () {},
					function () {
						assert.ok(true, "then Promise reject returned");
					});
		});
	});
});