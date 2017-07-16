/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta]");
}

sap.ui.define([
	'sap/m/Button',
	'sap/m/Input',
	'sap/m/ObjectHeader',
	'sap/m/ObjectAttribute',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/table/Column',
	'sap/uxap/ObjectPageLayout',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/command/FlexCommand',
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/command/Remove',
	'sap/ui/rta/command/CompositeCommand',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/Utils',
	'sap/ui/fl/changeHandler/Base',
	'sap/ui/fl/changeHandler/MoveControls',
	'sap/ui/fl/changeHandler/PropertyChange',
	'sap/ui/fl/changeHandler/PropertyBindingChange',
	'sap/ui/fl/changeHandler/HideControl',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/registry/SimpleChanges',
	'sap/ui/model/json/JSONModel',
	'sap/ui/fl/Utils',
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
	ObjectPageLayout,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	CommandFactory,
	FlexCommand,
	BaseCommand,
	Remove,
	CompositeCommand,
	Stack,
	RTAUtils,
	Base,
	MoveControls,
	PropertyChange,
	PropertyBindingChange,
	HideControl,
	ChangeRegistry,
	SimpleChanges,
	JSONModel,
	FLUtils
) {
	"use strict";

	var oChangeRegistry = ChangeRegistry.getInstance();

	oChangeRegistry.registerControlsForChanges({
		"sap.m.Button": [
			SimpleChanges.hideControl,
			SimpleChanges.unhideControl
		],
		"sap.m.ObjectHeader": [SimpleChanges.moveControls],
		"sap.ui.layout.VerticalLayout": [SimpleChanges.moveControls]
	});

	var oCommandFactory = new CommandFactory({
		flexSettings: {
			layer: "VENDOR"
		}
	});

	var sandbox = sinon.sandbox.create();

	var ERROR_INTENTIONALLY = new Error("this command intentionally failed");

	var oComponent = sap.ui.getCore().createComponent({
		name : "sap.ui.rta.test.additionalElements",
		id : "testcomponent",
		settings : {
			componentData : {
				"showAdaptButton" : false
			}
		}
	});

	QUnit.module("Given a command factory", {
		beforeEach : function(assert) {
			sandbox.stub(FLUtils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);
			this.oButton = new Button(oComponent.createId("myButton"));
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oButton.destroy();
		}
	});

	QUnit.test("when getting a property change command for button,", function(assert) {
		var oCommand = oCommandFactory.getCommandFor(this.oButton, "property", {
			propertyName : "visible",
			oldValue : this.oButton.getVisible(),
			newValue : false
		});
		assert.ok(oCommand, "then command without flex settings is available");
		assert.strictEqual(oCommand.getNewValue(), false, "and its settings are merged correctly");

		var oFlexSettings = {
			layer: "VENDOR",
			developerMode: true
		};
		var oCommand2 = oCommandFactory.getCommandFor(this.oButton, "property", {
			propertyName : "visible",
			oldValue : this.oButton.getVisible(),
			newValue : false
		}, undefined, oFlexSettings);
		assert.ok(oCommand2, "then command with flex settings is available");
		assert.strictEqual(oCommand2.getNewValue(), false, "and its settings are merged correctly");
	});

	QUnit.module("Given a flex command", {
		beforeEach : function(assert) {
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);
			this.fnApplyChangeSpy = sandbox.spy(HideControl, "applyChange");
			this.oFlexCommand = new FlexCommand({
				element : new Button(),
				changeHandler : HideControl,
				changeType : "hideControl"
			});
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oFlexCommand.destroy();
		}
	});

	QUnit.test("when executing the command,", function(assert) {
		var done = assert.async();
		assert.ok(this.oFlexCommand.isEnabled(), "then command is enabled");
		this.oFlexCommand.execute().then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
			done();
		}.bind(this));
	});

	QUnit.module("Given a command stack", {
		beforeEach : function(assert) {
			this.stack = new Stack();
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);
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
	});

	QUnit.test("when un-doing the empty stack, ", function(assert) {
		var done = assert.async();
		assert.ok(!this.stack.canUndo(), "then stack cannot be undone");
		this.stack.undo()

		.then(function() {
			assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
					" the to be executed index is in range");
			done();
		}.bind(this));
	});

	QUnit.test("when re-doing the empty stack, ", function(assert) {
		var done = assert.async();
		assert.ok(!this.stack.canRedo(), "then stack cannot be redone");

		this.stack.redo()

		.then(function() {
			assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
							" the to be executed index is in range");
			done();
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
		var done = assert.async();
		this.stack.push(this.command);
		this.stack.push(this.command2);

		this.stack.execute()

		.then(function() {
			var oTopCommand = this.stack.pop();
			assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
			assert.equal(this.stack.getCommands().length, 1, "  only first commmand is on the stack");
			assert.equal(this.stack.getCommands()[0].getId(), this.command.getId(), "  only first commmand is on the stack");
			assert.equal(oTopCommand.getId(), this.command2.getId(), " the correct command is returned");
			done();
		}.bind(this));
	});

	QUnit.test("when calling pushAndExecute with an failing command as the only command", function(assert) {
		var done = assert.async();
		var fnStackModifiedSpy = sinon.spy();
		this.stack.attachModified(fnStackModifiedSpy);
		this.stack.pushAndExecute(this.failingCommand)

		.catch(function(oError) {
			assert.ok(this.stack.isEmpty(), "and the command stack is still empty");
			assert.strictEqual(oError, ERROR_INTENTIONALLY, " an error is rejected and catched");
			assert.equal(fnStackModifiedSpy.callCount, 2, " the modify stack listener is called twice, onence for push and once for pop");
			setTimeout(function() {
				done();
			}, 0);
		}.bind(this));
	});

	QUnit.test("when calling pushAndExecute with an failing command and afterwards with a succeeding command", function(assert) {
		var done = assert.async();
		this.stack.pushAndExecute(this.failingCommand)

		.catch(function(oError) {
			assert.strictEqual(oError, ERROR_INTENTIONALLY, " an error is rejected and catched");
		})

		.then(this.stack.pushAndExecute.bind(this.stack, this.command))

		.then(function() {
			var oTopCommand = this.stack.pop();
			assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
			assert.ok(this.stack.isEmpty(), "and the command stack is empty");
			assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
			done();
		}.bind(this));
	});

	QUnit.test("when calling pop at the command stack with an already executed and a not executed command at it's top, ",
	function(assert) {
		var done = assert.async();
		this.stack.pushAndExecute(this.command)

		.then(function() {
			var oTopCommand = this.stack.pop();
			assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
			assert.ok(this.stack.isEmpty(), "and the command stack is empty");
			assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
			done();
		}.bind(this));
	});

	QUnit.test("when pushing and executing a command, ", function(assert) {
		var done = assert.async();
		this.stack.pushAndExecute(this.command)

		.then(function() {
			var oTopCommand = this.stack.top();
			assert.equal(oTopCommand.getId(), this.command.getId(), "then it is on the top of stack");
			assert.ok(this.stack.canUndo(), "then a command can be undone");
			assert.ok(!this.stack.canRedo(), "then stack cannot be redone");
			done();
		}.bind(this));
	});

	QUnit.test("when undoing and redo an empty stack, then no exception should come", function(assert) {
		assert.expect(0);
		this.stack.undo();
		this.stack.redo();
	});

	QUnit.module("Given a property command", {
		beforeEach : function(assert) {
			sandbox.stub(FLUtils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);

			this.OLD_VALUE = '2px';
			this.NEW_VALUE = '5px';
			this.oControl = new Column(oComponent.createId("control"), {
				width : this.OLD_VALUE
			});
			this.oPropertyCommand = CommandFactory.getCommandFor(this.oControl, "Property", {
				propertyName : "width",
				newValue : this.NEW_VALUE,
				oldValue : this.OLD_VALUE,
				semanticMeaning : "resize"
			});
			this.oPropertyCommandWithOutOldValueSet = CommandFactory.getCommandFor(this.oControl, "Property", {
				propertyName : "width",
				newValue : this.NEW_VALUE,
				semanticMeaning : "resize"
			});
			this.fnApplyChangeSpy = sandbox.spy(this.oPropertyCommand.getChangeHandler(), "applyChange");
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oControl.destroy();
			this.oPropertyCommand.destroy();
		}
	});

	QUnit.test("when executing the property command for a property named 'width'", function(assert) {
		var done = assert.async();
		this.oPropertyCommand.execute()

		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
			assert.equal(this.oControl.getWidth(), this.NEW_VALUE, "then the controls text changed accordingly");

			this.oPropertyCommand.undo();
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called, because undo is done via rta ControlTreeModifier!");
			assert.equal(this.oControl.getWidth(), this.OLD_VALUE, "then the controls text changed accordingly");

			return this.oPropertyCommand.execute();
		}.bind(this))

		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
			assert.equal(this.oControl.getWidth(), this.NEW_VALUE, "then the controls text changed accordingly");
			done();
		}.bind(this));

	});

	QUnit.module("Given a bind property command", {
		beforeEach : function(assert) {
			sandbox.stub(FLUtils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);

			this.OLD_BOOLEAN_VALUE = false;
			this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS = "{= ( ${/field1} === 'critical' ) &&  ( ${/field2} > 100 ) }";
			this.NEW_BOOLEAN_VALUE = true;
			this.OLD_VALUE = "critical";
			this.OLD_VALUE_BINDING = "{path:'/field1'}";
			this.NEW_VALUE_BINDING = "{path:'namedModel>/numberAsString', type:'sap.ui.model.type.Integer'}";
			this.NEW_VALUE = "20";
			this.oInput = new Input(oComponent.createId("input"), {
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
				newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS,
				oldValue : this.OLD_BOOLEAN_VALUE
			});
			this.oBindShowValueHelpCommandWithoutOldValueSet = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				element : this.oInput,
				propertyName : "showValueHelp",
				newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS
			});
			this.oBindValuePropertyCommand = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				propertyName : "value",
				newBinding : this.NEW_VALUE_BINDING,
				oldBinding : this.OLD_VALUE_BINDING
			});
			this.oBindValuePropertyCommandWithoutOldBindingSet = CommandFactory.getCommandFor(this.oInput, "BindProperty", {
				propertyName : "value",
				newBinding : this.NEW_VALUE_BINDING
			});
			this.fnApplyChangeSpy = sandbox.spy(this.oBindShowValueHelpCommand.getChangeHandler(), "applyChange");
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oInput.destroy();
			this.oBindShowValueHelpCommand.destroy();
			this.oBindValuePropertyCommand.destroy();
			this.oBindValuePropertyCommandWithoutOldBindingSet.destroy();
		}
	});

	QUnit.test("when executing the bind property command for a boolean property 'showValueHelp' with an old value and with a new binding containing special character  ", function(assert) {
		var done = assert.async();
		this.oBindShowValueHelpCommandWithoutOldValueSet.execute()

		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
			assert.equal(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "then the controls property changed accordingly");

			this.oBindShowValueHelpCommandWithoutOldValueSet.undo();
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called for the undo.");
			assert.equal(this.oInput.getShowValueHelp(), this.OLD_BOOLEAN_VALUE, "then the controls property changed accordingly");

			this.oBindShowValueHelpCommandWithoutOldValueSet.execute();
		}.bind(this))

		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
			assert.equal(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "then the controls property changed accordingly");
			done();
		}.bind(this));
	});

	QUnit.test("when executing the bind property command for a property 'value' with an old binding and with a new binding", function(assert) {
		var done = assert.async();
		this.oBindValuePropertyCommandWithoutOldBindingSet.execute()

		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
			assert.equal(this.oInput.getValue(), this.NEW_VALUE, "then the controls property changed accordingly");

			this.oBindValuePropertyCommandWithoutOldBindingSet.undo();
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called for the undo.");
			assert.equal(this.oInput.getValue(), this.OLD_VALUE, "then the controls property changed accordingly");

			this.oBindValuePropertyCommandWithoutOldBindingSet.execute();
		}.bind(this))

		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
			assert.equal(this.oInput.getValue(), this.NEW_VALUE, "then the controls property changed accordingly");
			done();
		}.bind(this));
	});

	QUnit.module("Given remove command", {
		beforeEach : function(assert) {
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);
			this.oButton = new Button(oComponent.createId("button"));
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
	});

	QUnit.test("when prepare() of remove command is called", function(assert) {
		this.oCommand.prepare();
		assert.deepEqual(this.oCommand.getSelector(), {
			appComponent: oComponent,
			controlType: "sap.m.Button",
			id: "testcomponent---button"
		}, "then selector is properly set for remove command");
		assert.ok(this.oCommand.getPreparedChange(), "then change is successfully prepared");
	});

	QUnit.module("Given a command stack with multiple already executed commands", {
		beforeEach : function(assert) {
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.renamedButton = new Button();
			this.stack = new Stack();
			this.command = new BaseCommand();
			this.command2 = new BaseCommand();
			var done = assert.async();
			var fnStackModifiedSpy = sinon.spy();

			this.stack.attachModified(fnStackModifiedSpy);
			this.stack.pushAndExecute(this.command)

			.then(this.stack.pushAndExecute.bind(this.stack, this.command2))

			.then(function() {
				done();
			});
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.command.destroy();
			this.command2.destroy();
			this.stack.destroy();
		}
	});

	QUnit.test("initially", function(assert) {
		var oTopCommand = this.stack.top();
		assert.equal(oTopCommand.getId(), this.command2.getId(), " the last is the top of stack");
	});

	QUnit.test("when undo,", function(assert) {
		var done = assert.async();
		var fnLastCommandUndo = sinon.spy(this.command2, "undo");
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		this.stack.undo()

		.then(function() {
			assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
					" the to be executed index is in range");
			assert.equal(fnLastCommandUndo.callCount, 1, " the last command was undone");
			assert.equal(fnStackModified.callCount, 1, " the modify stack listener is called");

			assert.ok(this.stack.canRedo(), "then stack can be redone");
			done();
		}.bind(this));
	});

	QUnit.test("when second time undo, then", function(assert) {
		var done = assert.async();
		var fnLastCommandUndo = sinon.spy(this.command2, "undo");
		var fnFirstCommandUndo = sinon.spy(this.command, "undo");
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		Promise.resolve()

		.then(this.stack.undo.bind(this.stack))

		.then(this.stack.undo.bind(this.stack))

		.then(function() {
			assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
					" the to be executed index is in range");
			assert.equal(fnLastCommandUndo.callCount, 1, " the last command was undone");
			assert.equal(fnFirstCommandUndo.callCount, 1, " the first command was undone");
			assert.ok(fnLastCommandUndo.calledBefore(fnFirstCommandUndo), " the last is called before the first");
			assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called");
			done();
		}.bind(this));
	});

	QUnit.test("when undo and redo, then", function(assert) {
		var done = assert.async();
		var fnUndo = sinon.spy(this.command2, "undo");
		var fnExecute = sinon.spy(this.command2, "execute");
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		Promise.resolve()

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
			done();
		}.bind(this));
	});

	QUnit.test("when having nothing to redo, redo shouldn't do anything, next command to execute will be still the top command, then",
	function (assert) {
		var done = assert.async();
		var fnRedo1 = sinon.spy(this.command, "execute");
		var fnRedo2 = sinon.spy(this.command2, "execute");
		this.stack.redo()

		.then(function() {
			assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length))
				&& (this.stack._toBeExecuted >= -1), 0, " the to be executed index is in range");
			assert.equal(fnRedo1.callCount, 0, " the command command was not called");
			assert.equal(fnRedo2.callCount, 0, " the command command2 was not called");
			done();
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

	QUnit.module("Given an empty command stack and commands", {
		beforeEach : function(assert) {
			this.stack = new Stack();
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);
			this.command = new BaseCommand();
			this.command2 = new BaseCommand();
			this.compositeCommand = new CompositeCommand();
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.command.destroy();
			this.command2.destroy();
			this.compositeCommand.destroy();
			this.stack.destroy();
		}
	});

	QUnit.test("initially", function(assert) {
		assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
	});

	QUnit.test("After pushing one command", function(assert) {
		this.stack.push(this.command);
		assert.equal(this.stack._toBeExecuted, 0, " the top of stack is to be executed");
	});

	QUnit.test("After pushing one command and executing the top of stack", function(assert) {
		var done = assert.async();
		var fnStackModified = sinon.spy(this.stack, "fireModified");
		this.stack.push(this.command);
		assert.equal(fnStackModified.callCount, 1, " the modify stack listener called on push");

		this.stack.execute()

		.then(function() {
			assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called on execute");
			assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
			done();
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
		var done = assert.async();
		this.stack.pushAndExecute(this.command)

		.then(this.stack.undo.bind(this.stack))

		.then(function() {
			this.stack.push(this.command2);
			assert.equal(this.stack.getCommands().length, 1, " only second command on the stack");
			assert.equal(this.stack._getCommandToBeExecuted().getId(), this.command2.getId(), " 2. command to be executed");
			assert.equal(this.stack._toBeExecuted, 0, " one command to be executed");
			done();
		}.bind(this));
	});

	QUnit.test("when pushing an executed command, ", function(assert) {
		this.stack.pushExecutedCommand(this.rename);

		assert.ok(!this.stack._getCommandToBeExecuted(), " no command to be executed by the stack");

	});

	QUnit.test("After adding commands to composite command, when executing the composite and undoing it",
	function(assert) {
		var done = assert.async();
		var fnCommand1Execute = sinon.spy(this.command, "execute");
		var fnCommand2Execute = sinon.spy(this.command2, "execute");
		var fnCommand1Undo = sinon.spy(this.command, "undo");
		var fnCommand2Undo = sinon.spy(this.command2, "undo");

		this.compositeCommand.addCommand(this.command);
		this.compositeCommand.addCommand(this.command2);

		Promise.resolve()

		.then(this.compositeCommand.execute.bind(this.compositeCommand))

		.then(function() {
			assert.ok(fnCommand1Execute.calledBefore(fnCommand2Execute), "commands are executed in the forward order");
		})

		.then(this.compositeCommand.undo.bind(this.compositeCommand))

		.then(function() {
			assert.ok(fnCommand2Undo.calledBefore(fnCommand1Undo), "commands are undone in the backward order");
			done();
		});
	});

	QUnit.module("Given controls and designTimeMetadata", {
		beforeEach : function(assert){
			sandbox.stub(FLUtils, "getAppComponentForControl").returns(oComponent);
			this.oMovable = new ObjectAttribute(oComponent.createId("attribute"));
			this.oSourceParent = new ObjectHeader(oComponent.createId("header"), {
				attributes : [this.oMovable]
			});
			this.oTargetParent = new ObjectHeader(oComponent.createId("targetHeader"));

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
	});

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

	QUnit.test("when asking for a move command for control or aggregation without move action registration", function(assert){
		var oMoveCmd = CommandFactory.getCommandFor(this.oMovable, "Move", {
			movedElements : [{
				id : this.oMovable.getId(),
				sourceIndex : 0,
				targetIndex : 1
			}],
			source : {
				publicAggregation : "fakeAggreagtionWithoutMove"
			}
		}, this.oSourceParentDesignTimeMetadata );
		assert.ok(!oMoveCmd, "then no command is returned");

		var oMoveCmd2 = CommandFactory.getCommandFor(this.oRootElement, "Move", {
			movedElements : [{
				element : this.oMovable,
				sourceIndex : 0,
				targetIndex : 1
			}],
			source : {
				publicAggregation : "content"
			}
		}, this.oOtherParentDesignTimeMetadata);
		assert.ok(!oMoveCmd2, "then no command is returned");
	});
});
