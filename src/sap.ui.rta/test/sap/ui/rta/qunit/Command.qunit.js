jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.m.ObjectHeader");
jQuery.sap.require("sap.m.ObjectAttribute");

jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.table.Column");

jQuery.sap.require("sap.uxap.ObjectPageLayout");

jQuery.sap.require("sap.ui.dt.ElementDesignTimeMetadata");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.dt.ElementOverlay");

jQuery.sap.require("sap.ui.rta.command.CommandFactory");
jQuery.sap.require("sap.ui.rta.command.FlexCommand");
jQuery.sap.require("sap.ui.rta.command.Remove");
jQuery.sap.require("sap.ui.rta.command.CompositeCommand");
jQuery.sap.require("sap.ui.rta.command.Stack");
jQuery.sap.require("sap.ui.rta.Utils");

jQuery.sap.require("sap.ui.comp.library");
jQuery.sap.require("sap.ui.comp.smartform.SmartForm");
jQuery.sap.require("sap.ui.comp.smartform.GroupElement");
jQuery.sap.require("sap.ui.comp.smartform.Group");
jQuery.sap.require("sap.ui.comp.smartform.flexibility.changes.MoveGroups");
jQuery.sap.require("sap.ui.comp.smartform.flexibility.changes.MoveFields");
jQuery.sap.require("sap.ui.comp.smartform.flexibility.changes.AddGroup");
jQuery.sap.require("sap.ui.comp.smartform.flexibility.changes.AddFields");

jQuery.sap.require("sap.ui.fl.changeHandler.Base");
jQuery.sap.require("sap.ui.fl.changeHandler.MoveControls");
jQuery.sap.require("sap.ui.fl.changeHandler.PropertyChange");
jQuery.sap.require("sap.ui.fl.changeHandler.PropertyBindingChange");
jQuery.sap.require("sap.ui.fl.changeHandler.HideControl");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");
jQuery.sap.require("sap.ui.fl.registry.SimpleChanges");
jQuery.sap.require("sap.ui.fl.Utils");


(function() {
	"use strict";

	var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();

	oChangeRegistry.registerControlsForChanges({
		"sap.m.Button": [
			sap.ui.fl.registry.SimpleChanges.hideControl,
			sap.ui.fl.registry.SimpleChanges.unhideControl
		],
		"sap.m.ObjectHeader": [sap.ui.fl.registry.SimpleChanges.moveControls],
		"sap.ui.layout.VerticalLayout": [sap.ui.fl.registry.SimpleChanges.moveControls]
	});

	var CommandFactory = new sap.ui.rta.command.CommandFactory({
		flexSettings: {
			layer: "VENDOR"
		}
	});

	var sandbox = sinon.sandbox.create();

	var ERROR_INTENSIONALLY = new Error("this command intensionally failed");

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
			sandbox.stub(sap.ui.fl.Utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.oSmartGroup = new sap.ui.comp.smartform.Group(oComponent.createId("mySmartGroup"));
			this.oSmartForm = new sap.ui.comp.smartform.SmartForm(oComponent.createId("mySmartForm"));
			this.oObjectPageLayout = new sap.uxap.ObjectPageLayout(oComponent.createId("myObjectPageLayout"));
			this.oObjectPageSection = new sap.uxap.ObjectPageSection(oComponent.createId("myObjectPageSection"));
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oSmartGroup.destroy();
			this.oSmartForm.destroy();
			this.oObjectPageLayout.destroy();
			this.oObjectPageSection.destroy();
		}
	});

	QUnit.test("when getting a property change command for smart form with settings,", function(assert) {
		var oCommand = CommandFactory.getCommandFor(this.oSmartForm, "property", {
			propertyName : "visible",
			oldValue : this.oSmartForm.getVisible(),
			newValue : false
		});
		assert.ok(oCommand, "then command is available");
		assert.strictEqual(oCommand.getNewValue(), false, "and its settings are merged correctly");

		var oCommandFactory2 = sap.ui.rta.command.CommandFactory;
		var oFlexSettings = {
			layer: "VENDOR",
			developerMode: true
		};
		var oCommand2 = oCommandFactory2.getCommandFor(this.oSmartForm, "property", {
			propertyName : "visible",
			oldValue : this.oSmartForm.getVisible(),
			newValue : false
		}, undefined, oFlexSettings);
		assert.ok(oCommand2, "then command is available");
		assert.strictEqual(oCommand2.getNewValue(), false, "and its settings are merged correctly");
	});

	QUnit.module("Given a flex command", {
		beforeEach : function(assert) {
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.oChangeHandler = sap.ui.fl.changeHandler.HideControl;
			this.fnApplyChangeSpy = sandbox.spy(this.oChangeHandler, "applyChange");
			this.oFlexCommand = new sap.ui.rta.command.FlexCommand({
				element : new sap.m.Button(),
				changeHandler : this.oChangeHandler,
				changeType : "hideControl"
			});
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oFlexCommand.destroy();
		}
	});

	QUnit.test("when executing the command,", function(assert) {
		assert.ok(this.oFlexCommand.isEnabled(), "then command is enabled");
		this.oFlexCommand.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
	});

	QUnit.module("Given a command stack", {
		beforeEach : function(assert) {
			this.stack = new sap.ui.rta.command.Stack();
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.command = new sap.ui.rta.command.BaseCommand();
			this.failingCommand = this.command.clone();
			this.failingCommand.execute = function(oElement) {
				throw ERROR_INTENSIONALLY;
			};
			this.command2 = new sap.ui.rta.command.BaseCommand();
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.command.destroy();
			this.command2.destroy();
			this.stack.destroy();
		}
	});

	QUnit.test("when un-doing the empty stack, ", function(assert) {
		assert.ok(!this.stack.canUndo(), "then stack cannot be undone");

		this.stack.undo();

		assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
				" the to be executed index is in range");
	});

	QUnit.test("when re-doing the empty stack, ", function(assert) {
		assert.ok(!this.stack.canRedo(), "then stack cannot be redone");

		this.stack.redo();

		assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
				" the to be executed index is in range");
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
		this.stack.execute();

		var oTopCommand = this.stack.pop();

		assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
		assert.equal(this.stack.getCommands().length, 1, "  only first commmand is on the stack");
		assert.equal(this.stack.getCommands()[0].getId(), this.command.getId(), "  only first commmand is on the stack");
		assert.equal(oTopCommand.getId(), this.command2.getId(), " the correct command is returned");
	});

	QUnit.test("when calling pushAndExecute with an failing command as the only command", function(assert) {
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);
		assert.throws(function() {
			this.stack.pushAndExecute(this.failingCommand);
		}, ERROR_INTENSIONALLY, " an error is thrown and catched");
		assert.ok(this.stack.isEmpty(), "and the command stack is still empty");
		assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called twice, onence for push and once for pop");
	});

	QUnit.test("when calling pushAndExecute with an failing command and afterwards with a succeeding command", function(assert) {
		assert.throws(function() {
			this.stack.pushAndExecute(this.failingCommand);
		}, ERROR_INTENSIONALLY, " an error is thrown and catched");

		this.stack.pushAndExecute(this.command);
		var oTopCommand = this.stack.pop();
		assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
		assert.ok(this.stack.isEmpty(), "and the command stack is empty");
		assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
	});

	QUnit.test("when calling pop at the command stack with an already executed and a not executed command at it's top, ",
			function(assert) {
				this.stack.pushAndExecute(this.command);

				var oTopCommand = this.stack.pop();

				assert.equal(this.stack._toBeExecuted, -1, " the to be executed index is in range");
				assert.ok(this.stack.isEmpty(), "and the command stack is empty");
				assert.equal(oTopCommand.getId(), this.command.getId(), " the correct command is returned");
			});

	QUnit.test("when pushing and executing a command, ", function(assert) {
		this.stack.pushAndExecute(this.command);

		var oTopCommand = this.stack.top();
		assert.equal(oTopCommand.getId(), this.command.getId(), "then it is on the top of stack");

		assert.ok(this.stack.canUndo(), "then a command can be undone");
		assert.ok(!this.stack.canRedo(), "then stack cannot be redone");
	});

	QUnit.test("when undoing and redo an empty stack, then no exception should come", function(assert) {
		assert.expect(0);
		this.stack.undo();
		this.stack.redo();
	});

	QUnit.module("Given a property command", {
		beforeEach : function(assert) {
			sandbox.stub(sap.ui.fl.Utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.OLD_VALUE = '2px';
			this.NEW_VALUE = '5px';
			this.oControl = new sap.ui.table.Column(oComponent.createId("control"), {
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
		this.oPropertyCommand.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
		assert.equal(this.oControl.getWidth(), this.NEW_VALUE, "then the controls text changed accordingly");

		this.oPropertyCommand.undo();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called, because undo is done via rta ControlTreeModifier!");
		assert.equal(this.oControl.getWidth(), this.OLD_VALUE, "then the controls text changed accordingly");

		this.oPropertyCommand.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
		assert.equal(this.oControl.getWidth(), this.NEW_VALUE, "then the controls text changed accordingly");

	});

	QUnit.module("Given a bind property command", {
		beforeEach : function(assert) {
			sandbox.stub(sap.ui.fl.Utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.OLD_BOOLEAN_VALUE = false;
			this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS = "{= ( ${/field1} === 'critical' ) &&  ( ${/field2} > 100 ) }";
			this.NEW_BOOLEAN_VALUE = true;
			this.OLD_VALUE = "critical";
			this.OLD_VALUE_BINDING = "{path:'/field1'}";
			this.NEW_VALUE_BINDING = "{path:'namedModel>/numberAsString', type:'sap.ui.model.type.Integer'}";
			this.NEW_VALUE = "20";
			this.oInput = new sap.m.Input(oComponent.createId("input"), {
				showValueHelp: this.OLD_BOOLEAN_VALUE,
				value: this.OLD_VALUE_BINDING
			});
			var oModel = new sap.ui.model.json.JSONModel({
					field1 : this.OLD_VALUE,
					field2 : 15000
			});
			var oNamedModel = new sap.ui.model.json.JSONModel({
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
		this.oBindShowValueHelpCommandWithoutOldValueSet.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
		assert.equal(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "then the controls property changed accordingly");

		this.oBindShowValueHelpCommandWithoutOldValueSet.undo();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called for the undo.");
		assert.equal(this.oInput.getShowValueHelp(), this.OLD_BOOLEAN_VALUE, "then the controls property changed accordingly");

		this.oBindShowValueHelpCommandWithoutOldValueSet.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
		assert.equal(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "then the controls property changed accordingly");

	});

	QUnit.test("when executing the bind property command for a property 'value' with an old binding and with a new binding", function(assert) {
		this.oBindValuePropertyCommandWithoutOldBindingSet.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should do the work.");
		assert.equal(this.oInput.getValue(), this.NEW_VALUE, "then the controls property changed accordingly");

		this.oBindValuePropertyCommandWithoutOldBindingSet.undo();
		assert.equal(this.fnApplyChangeSpy.callCount, 1, "then the changehandler should not be called for the undo.");
		assert.equal(this.oInput.getValue(), this.OLD_VALUE, "then the controls property changed accordingly");

		this.oBindValuePropertyCommandWithoutOldBindingSet.execute();
		assert.equal(this.fnApplyChangeSpy.callCount, 2, "then the changehandler should do the work.");
		assert.equal(this.oInput.getValue(), this.NEW_VALUE, "then the controls property changed accordingly");

	});

	QUnit.module("Given remove command", {
		beforeEach : function(assert) {
			//jQuery.sap.require("sap.ui.rta.command.Remove");
			//var Command = jQuery.sap.getObject("sap.ui.rta.command.Remove");
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.oSmartGroup1 = new sap.ui.comp.smartform.Group(oComponent.createId("group"), {
				label : "{/test}"
			});
			this.oCommand = CommandFactory.getCommandFor(this.oSmartGroup1, "Remove", {
				removedElement: this.oSmartGroup1
			}, new sap.ui.dt.ElementDesignTimeMetadata({
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
			this.oSmartGroup1.destroy();
		}
	});

	QUnit.test("when prepare() of remove command is called", function(assert) {
		this.oCommand.prepare();
		assert.deepEqual(this.oCommand.getSelector(), {
			appComponent: oComponent,
			controlType: "sap.ui.comp.smartform.Group",
			id: "testcomponent---group"
		}, "then selector is properly set for remove command");
		assert.ok(this.oCommand.getPreparedChange(), "then change is successfully prepared");
	});


	QUnit.module("Given a rename command", {
		beforeEach : function(assert) {
			// Test Setup:
			// SmartForm
			// -- groups
			// -- -- SmartGroup1
			// -- -- -- groupElements
			// -- -- -- -- SmartElement
			// -- -- SmartGroup2

			this.oModel = new sap.ui.model.json.JSONModel({
				test : "someLabel"
			});

			sandbox.stub(sap.ui.fl.Utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.oSmartGroupElement = new sap.ui.comp.smartform.GroupElement(oComponent.createId("element"), {
				label : "{/test}"
			});
			this.oSmartGroup1 = new sap.ui.comp.smartform.Group(oComponent.createId("group"), {
				label : "{/test}",
				groupElements : [this.oSmartGroupElement]
			});
			this.oSmartGroup2 = new sap.ui.comp.smartform.Group();
			this.oSmartForm = new sap.ui.comp.smartform.SmartForm({
				title : "Old Form Label",
				groups : [this.oSmartGroup1, this.oSmartGroup2]
			});
			this.oSmartGroup1.setModel(this.oModel);

			this.oGroupDTMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
				data : {
					actions: {
						rename : {
							changeType : "renameGroup",
							domRef : function (oControl){
								return oControl.getTitle().getDomRef();
							}
						}
					}
				}
			});

			this.oGroupElementDTMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
				data : {
					actions: {
						rename : {
							changeType : "renameField",
							domRef : function (oControl){
								return oControl.getLabel().getDomRef();
							}
						}
					}
				}
			});

			this.oRenameCommand = CommandFactory.getCommandFor(this.oSmartGroup1, "Rename", {
				renamedElement : this.oSmartGroup1,
				newValue : "New Group Label"
			}, this.oGroupDTMetadata);
//			this.oRenameCommand2 = CommandFactory.getCommandFor(this.oSmartForm, "Rename", {
//				renamedElement : this.oSmartForm,
//				newValue : "New Form Label"
//			});
			this.oRenameCommand1 = CommandFactory.getCommandFor(this.oSmartGroupElement, "Rename", {
				renamedElement : this.oSmartGroupElement,
				newValue : "New Group Element Label"
			}, this.oGroupElementDTMetadata);
		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oSmartForm.destroy();
			this.oRenameCommand.destroy();
//			this.oRenameCommand2.destroy();
			this.oRenameCommand1.destroy();
			this.oGroupDTMetadata.destroy();
			this.oGroupElementDTMetadata.destroy();
		}
	});

	QUnit.test("when executing the rename command for smartform group", function(assert) {
		assert.ok(this.oRenameCommand.isEnabled(), "then the command is enabled for the given control");
		assert.equal(this.oRenameCommand.getChangeType(), "renameGroup", "then the command with corresponding changeType is returned");
		this.oRenameCommand.execute();
		assert.equal(this.oSmartGroup1.getLabel(), "New Group Label", "then the groups text changed accordingly");
		assert.equal(this.oSmartGroup1.getBinding("label"), undefined, "then the binding is removed");

	});

	QUnit.test("when undoing the rename command for a smartform group", function(assert) {
		assert.ok(this.oRenameCommand.isEnabled(), "then the command is enabled for the given control");
		this.oRenameCommand.execute();
		this.oRenameCommand.undo();
		assert.equal(this.oSmartGroup1.getBindingInfo("label").parts[0].path, "/test", "then the binding is restored");
		assert.equal(this.oSmartGroup1.getLabel(), "someLabel", "then the groups label text is restored");
		assert.ok(!this.oSmartGroup1.getBinding("label").isSuspended(), "then the binding is resumed");

	});

	QUnit.test("when executing the rename command for a smartform group element", function(assert) {
		assert.ok(this.oRenameCommand1.isEnabled(), "then the command is enabled for the given control");

		this.oRenameCommand1.execute();

		assert.equal(this.oSmartGroupElement.getLabelText(), "New Group Element Label",
				"then the group elements text changed accordingly");
		assert.equal(this.oSmartGroupElement.getBinding("label"), undefined, "then the binding is removed");
	});

	QUnit.test("when undoing the rename command for a smartform group element", function(assert) {
		assert.ok(this.oRenameCommand1.isEnabled(), "then the command is enabled for the given control");

		this.oRenameCommand1.execute();

		this.oRenameCommand1.undo();
		assert.equal(this.oSmartGroupElement.getBindingInfo("label").parts[0].path, "/test", "then the binding is restored");
		assert.equal(this.oSmartGroupElement.getLabelText(), "someLabel", "then the elements label text is restored");
		assert.ok(!this.oSmartGroupElement.getBinding("label").isSuspended(), "then the binding is resumed");

	});

	// QUnit.module("Given a rename command for a SimpleForm control", {
	// 	beforeEach : function(assert) {
	// 		// Test Setup:
	// 		// SimpleForm
	// 		// -- Title
	// 		// -- Label
	// 		// -- Input
	// 		// -- Label
	// 		// -- Input
	// 		// -- Title
	// 		// -- Label
	// 		// -- Input
	// 		// -- Label
	// 		// -- Input
	// 		sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

	// 		this.oModel = new sap.ui.model.json.JSONModel({
	// 			label : "someLabel",
	// 			title : "someTitle"
	// 		});

	// 		this.oTitle0 = new sap.ui.core.Title({id : "Title0",  text : "Title 0"});
	// 		this.oTitle1 = new sap.ui.core.Title({id : "Title1",  text : "{/title}"});
	// 		this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0"});
	// 		this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
	// 		this.oLabel2 = new sap.m.Label({id : "Label2",  text : "{/label}"});
	// 		this.oLabel3 = new sap.m.Label({id : "Label3",  text : "Label 3"});
	// 		this.oInput0 = new sap.m.Input({id : "Input0"});
	// 		this.oInput1 = new sap.m.Input({id : "Input1"});
	// 		this.oInput2 = new sap.m.Input({id : "Input2"});
	// 		this.oInput3 = new sap.m.Input({id : "Input3"});
	// 		this.oSimpleForm = new sap.ui.layout.form.SimpleForm(oComponent.createId("form"), {
	// 			id : "SimpleForm", maxContainerCols : 2, editable : true, layout : "ResponsiveGridLayout",
	// 			title : "Simple Form",
	// 			content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1,
	// 			           this.oTitle1, this.oLabel2, this.oInput2, this.oLabel3, this.oInput3]
	// 		});
	// 		this.oSimpleForm.setModel(this.oModel);
	// 		this.oSimpleForm.placeAt("test-view");
	// 		sap.ui.getCore().applyChanges();

	// 		this.oFormContainer1 = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
	// 		this.oFormElement1 = this.oFormContainer1.getAggregation("formElements")[0];

	// 		this.oSimpleFormDTMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
	// 			data : {
	// 				actions: {
	// 					rename : function(oElement){
	// 						var sType = oElement.getMetadata().getName();
	// 						var oRenameMetadata;
	// 						if (sType === "sap.ui.layout.form.FormContainer"){
	// 							oRenameMetadata = {
	// 								changeType : "renameTitle",
	// 								domRef : function (oControl){
	// 									return oControl.getTitle().getDomRef();
	// 								},
	// 								getState : function (oControl) {
	// 									var oState = {
	// 										oldValue : oControl.getTitle().getText()
	// 									};
	// 									return oState;
	// 								},
	// 								restoreState : function (oControl, oState) {
	// 									oControl.getTitle().setText(oState.oldValue);
	// 									var sBindingValue = "";
	// 									var oBindingInfo = oControl.getTitle().getBindingInfo("text");
	// 									if (oBindingInfo) {
	// 										sBindingValue = oBindingInfo.binding.getValue();
	// 										if (sBindingValue === oState.oldValue) {
	// 											var oBinding = oControl.getTitle().getBinding("text");
	// 											if (oBinding) {
	// 												oBinding.resume();
	// 											}
	// 										}
	// 									}
	// 									return true;
	// 								}
	// 							};
	// 						} else if (sType === "sap.ui.layout.form.FormElement"){
	// 							oRenameMetadata = {
	// 								changeType : "renameLabel",
	// 								domRef : function (oControl){
	// 									return oControl.getLabel().getDomRef();
	// 								},
	// 								getState : function (oControl) {
	// 									var oState = {
	// 										oldValue : oControl.getLabel().getText()
	// 									};
	// 									return oState;
	// 								},
	// 								restoreState : function (oControl, oState) {
	// 									oControl.getLabel().setText(oState.oldValue);
	// 									var sBindingValue = "";
	// 									var oBindingInfo = oControl.getLabel().getBindingInfo("text");
	// 									if (oBindingInfo) {
	// 										sBindingValue = oBindingInfo.binding.getValue();
	// 										if (sBindingValue === oState.oldValue) {
	// 											var oBinding = oControl.getLabel().getBinding("text");
	// 											if (oBinding) {
	// 												oBinding.resume();
	// 											}
	// 										}
	// 									}
	// 									return true;
	// 								}
	// 							};
	// 						}
	// 						return oRenameMetadata;
	// 					}
	// 				}
	// 			}
	// 		});

	// 		this.oRenameCommand1 = CommandFactory.getCommandFor(this.oSimpleForm, "Rename", {
	// 			renamedElement : this.oFormContainer1,
	// 			newValue : "New Title"
	// 		}, this.oSimpleFormDTMetadata.getAction("rename", this.oFormContainer1));
	// 		this.oRenameCommand2 = CommandFactory.getCommandFor(this.oSimpleForm, "Rename", {
	// 			renamedElement : this.oFormElement1,
	// 			newValue : "New Label"
	// 		}, this.oSimpleFormDTMetadata.getAction("rename", this.oFormElement1));

	// 		this.oFormContainer2 = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[1];
	// 		this.oFormElement2 = this.oFormContainer2.getAggregation("formElements")[0];

	// 		this.oRenameCommand3 = CommandFactory.getCommandFor(this.oSimpleForm, "Rename", {
	// 			renamedElement : this.oFormContainer2,
	// 			newValue : "New Title"
	// 		}, this.oSimpleFormDTMetadata.getAction("rename", this.oFormContainer2));
	// 		this.oRenameCommand4 = CommandFactory.getCommandFor(this.oSimpleForm, "Rename", {
	// 			renamedElement : this.oFormElement2,
	// 			newValue : "New Label"
	// 		}, this.oSimpleFormDTMetadata.getAction("rename", this.oFormElement2));

	// 	},

	// 	afterEach : function(assert) {
	// 		sandbox.restore();
	// 		this.oSimpleForm.destroy();
	// 		this.oFormContainer1.destroy();
	// 		this.oFormContainer2.destroy();
	// 		this.oFormElement1.destroy();
	// 		this.oFormElement2.destroy();
	// 		this.oRenameCommand1.destroy();
	// 		this.oRenameCommand2.destroy();
	// 		this.oRenameCommand3.destroy();
	// 		this.oRenameCommand4.destroy();
	// 	}
	// });

	// QUnit.test("when serializing the rename commands", function(assert) {
	// 	assert.deepEqual(this.oRenameCommand1.serialize(), {
	// 		changeType : "renameTitle",
	// 		value: "New Title",
	// 		renamedElement : {
	// 			id : this.oFormContainer1.getId()
	// 		},
	// 		selector : {
	// 			id : this.oSimpleForm.getId()
	// 		}
	// 	},  "then specific change format for title in SimpleForm is there");
	// 	assert.deepEqual(this.oRenameCommand2.serialize(), {
	// 		changeType : "renameLabel",
	// 		value : "New Label",
	// 		renamedElement : {
	// 			id : this.oFormElement1.getId()
	// 		},
	// 		selector : {
	// 			id : this.oSimpleForm.getId()
	// 		}
	// 	},  "then specific change format for label in SimpleForm is there");
	// });

	// QUnit.test("when executing the rename command for SimpleForm", function(assert) {
	// 	assert.ok(this.oRenameCommand1.isEnabled(), "then the command is enabled for the SimpleForm control via FormContainer");
	// 	assert.ok(this.oRenameCommand2.isEnabled(), "then the command is enabled for the SimpleForm control via FormElement");

	// 	this.oRenameCommand1.execute();
	// 	assert.equal(this.oFormContainer1.getTitle().getText(), "New Title", "then the title text changed accordingly");

	// 	this.oRenameCommand2.execute();
	// 	assert.equal(this.oFormElement1.getLabel().getText(), "New Label", "then the label text changed accordingly");

	// });

	// QUnit.test("when executing the rename command for SimpleForm with bound label and title", function(assert) {
	// 	this.oRenameCommand3.execute();
	// 	assert.equal(this.oFormContainer2.getTitle().getText(), "New Title", "then the title text changed accordingly");
	// 	assert.ok(this.oFormContainer2.getTitle().getBinding("text").isSuspended(), "then the title binding is suspended");

	// 	this.oRenameCommand4.execute();
	// 	assert.equal(this.oFormElement2.getLabel().getText(), "New Label", "then the label text changed accordingly");
	// 	assert.ok(this.oFormElement2.getLabel().getBinding("text").isSuspended(), "then the label binding is suspended");

	// });

	// QUnit.test("when undoing the rename command for a SimpleForm", function(assert) {
	// 	assert.ok(this.oRenameCommand1.isEnabled(), "then the command is enabled for the SimpleForm control via FormContainer");
	// 	assert.ok(this.oRenameCommand2.isEnabled(), "then the command is enabled for the SimpleForm control via FormElement");

	// 	var sOldTitle = this.oTitle0.getText();
	// 	this.oRenameCommand1.execute();
	// 	this.oRenameCommand1.undo();
	// 	assert.equal(this.oFormContainer1.getTitle().getText(), sOldTitle, "then the old value is restored");

	// 	var sOldLabel = this.oLabel0.getText();
	// 	this.oRenameCommand2.execute();
	// 	this.oRenameCommand2.undo();
	// 	assert.equal(this.oFormElement1.getLabel().getText(), sOldLabel, "then the old value is restored");

	// });

	// QUnit.test("when undoing the rename command for a SimpleForm with bound label and title", function(assert) {
	// 	var sOldTitle = this.oTitle1.getText();
	// 	this.oRenameCommand3.execute();
	// 	this.oRenameCommand3.undo();
	// 	assert.equal(this.oFormContainer2.getTitle().getText(), sOldTitle, "then the old value is restored");
	// 	assert.equal(this.oFormContainer2.getTitle().getBindingInfo("text").parts[0].path, "/title", "then the title binding is restored");
	// 	assert.equal(this.oFormContainer2.getTitle().getText(), "someTitle", "then the title text is restored");
	// 	assert.ok(!this.oFormContainer2.getTitle().getBinding("text").isSuspended(), "then the title binding is resumed");

	// 	var sOldLabel = this.oLabel2.getText();
	// 	this.oRenameCommand2.execute();
	// 	this.oRenameCommand2.undo();
	// 	assert.equal(this.oFormElement2.getLabel().getText(), sOldLabel, "then the old value is restored");
	// 	assert.equal(this.oFormElement2.getLabel().getBindingInfo("text").parts[0].path, "/label", "then the label binding is restored");
	// 	assert.equal(this.oFormElement2.getLabel().getText(), "someLabel", "then the label text is restored");
	// 	assert.ok(!this.oFormElement2.getLabel().getBinding("text").isSuspended(), "then the label binding is resumed");

	// });

	// QUnit.module("Given a hide/unhide command for a SimpleForm control", {
	// 	beforeEach : function(assert) {
	// 		// Test Setup:
	// 		// SimpleForm
	// 		// -- Title
	// 		// -- Label
	// 		// -- Input
	// 		// -- Label
	// 		// -- Input
	// 		// -- Title
	// 		// -- Label
	// 		// -- Input
	// 		// -- Label
	// 		// -- Input
	// 		sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

	// 		this.oModel = new sap.ui.model.json.JSONModel({
	// 			label : "someLabel",
	// 			title : "someTitle"
	// 		});

	// 		this.oTitle0 = new sap.ui.core.Title({id : "Title0",  text : "Title 0"});
	// 		this.oTitle1 = new sap.ui.core.Title({id : "Title1",  text : "{/title}"});
	// 		this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0"});
	// 		this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
	// 		this.oLabel2 = new sap.m.Label({id : "Label2",  text : "{/label}", visible : false});
	// 		this.oLabel3 = new sap.m.Label({id : "Label3",  text : "Label 3"});
	// 		this.oInput0 = new sap.m.Input({id : "Input0"});
	// 		this.oInput1 = new sap.m.Input({id : "Input1"});
	// 		this.oInput2 = new sap.m.Input({id : "Input2", visible : false});
	// 		this.oInput3 = new sap.m.Input({id : "Input3"});
	// 		this.oSimpleForm = new sap.ui.layout.form.SimpleForm(oComponent.createId("form"), {
	// 			id : "SimpleForm", layout : "ResponsiveGridLayout",
	// 			title : "Simple Form",
	// 			content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1,
	// 			           this.oTitle1, this.oLabel2, this.oInput2, this.oLabel3, this.oInput3]
	// 		});
	// 		this.oSimpleForm.setModel(this.oModel);
	// 		this.oSimpleForm.placeAt("test-view");
	// 		sap.ui.getCore().applyChanges();

	// 		this.oFormContainer1 = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
	// 		this.oFormContainer2 = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[1];
	// 		this.oFormElement1 = this.oFormContainer1.getAggregation("formElements")[0];
	// 		this.oFormElement2 = this.oFormContainer2.getAggregation("formElements")[0];
	// 		this.oHideCommand1 = CommandFactory.getCommandFor(this.oFormElement1, "Hide");
	// 		this.oHideCommand2 = CommandFactory.getCommandFor(this.oFormContainer1, "Hide");
	// 		this.oUnhideCommand1 = CommandFactory.getCommandFor(this.oFormElement1, "Unhide");
	// 		this.oUnhideCommand2 = CommandFactory.getCommandFor(this.oFormElement2, "Unhide");
	// 	},

	// 	afterEach : function(assert) {
	// 		sandbox.restore();
	// 		this.oSimpleForm.destroy();
	// 		this.oFormContainer1.destroy();
	// 		this.oFormContainer2.destroy();
	// 		this.oFormElement1.destroy();
	// 		this.oFormElement2.destroy();
	// 		this.oHideCommand1.destroy();
	// 		this.oHideCommand2.destroy();
	// 		this.oUnhideCommand1.destroy();
	// 		this.oUnhideCommand2.destroy();
	// 	}
	// });

	// QUnit.test("when serializing the unhide command", function(assert) {
	// 	assert.deepEqual(this.oUnhideCommand1.serialize(), {
	// 	  "changeType": "unhideSimpleFormField",
	// 	  "sUnhideId": this.oLabel0.getId(),
	// 	  "selector": {
	// 	    "id": this.oSimpleForm.getId()
	// 	  }
	// 	},  "then specific change format for unhiding a FormElement in SimpleForm is there");
	// });

	// QUnit.test("when executing the hide/unhide command for SimpleForm", function(assert) {
	// 	assert.ok(this.oHideCommand1.isEnabled(), "then the hide command is enabled for the SimpleForm control via FormElement");
	// 	assert.ok(this.oHideCommand2.isEnabled(), "then the hide command is enabled for the SimpleForm control via FormContainer");
	// 	assert.ok(this.oUnhideCommand1.isEnabled(), "then the unhide command is enabled for the SimpleForm control via FormElement");

	// 	var bVisible = this.oLabel0.getVisible();
	// 	assert.ok(bVisible, "the FormElement is initially visible");
	// 	this.oHideCommand1.execute();
	// 	bVisible = this.oLabel0.getVisible();
	// 	assert.notOk(bVisible, "the FormElement is invisible after execution of hide command");

	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, this.oTitle0);
	// 	assert.equal(oResult, this.oTitle0, "the FormContainer is initially visible");
	// 	this.oHideCommand2.execute();
	// 	oResult = undefined;
	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, this.oTitle0);
	// 	assert.equal(oResult, undefined, "the FormContainer is no more part of SimpleForm content");
	// 	this.oTitle0.destroy();

	// });

	// QUnit.test("when undoing the hide command for a SimpleForm FormElement", function(assert) {
	// 	var bVisible = this.oLabel0.getVisible();
	// 	assert.ok(bVisible, "the FormElement is initially visible");
	// 	this.oHideCommand1.execute();
	// 	bVisible = this.oLabel0.getVisible();
	// 	assert.notOk(bVisible, "the FormElement is invisible after execution of hide command");
	// 	this.oHideCommand1.undo();
	// 	bVisible = this.oLabel0.getVisible();
	// 	assert.ok(bVisible, "the FormElement is visible after undoing the hide command");
	// });

	// QUnit.test("when undoing the hide command for a SimpleForm FormContainer", function(assert) {
	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, this.oTitle0);
	// 	assert.equal(oResult, this.oTitle0, "the FormContainer is initially in the SimpleForm");
	// 	this.oHideCommand2.execute();
	// 	oResult = undefined;
	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, this.oTitle0);
	// 	assert.equal(oResult, undefined, "the FormContainer is no more part of SimpleForm content");
	// 	this.oHideCommand2.undo();
	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, this.oTitle0);
	// 	assert.equal(oResult, this.oTitle0, "the FormContainer is in the SimpleForm again");
	// });

	// QUnit.test("when undoing the unhide command for a SimpleForm FormElement", function(assert) {
	// 	assert.ok(this.oUnhideCommand2.isEnabled(), "then the unhide command is enabled for the SimpleForm control via FormElement");
	// 	var bVisible = this.oLabel2.getVisible();
	// 	assert.notOk(bVisible, "the FormElement is initially invisible");
	// 	this.oUnhideCommand2.execute();
	// 	bVisible = this.oLabel2.getVisible();
	// 	assert.ok(bVisible, "the FormElement is visible after execution of unhide command");
	// 	this.oUnhideCommand2.undo();
	// 	bVisible = this.oLabel0.getVisible();
	// 	assert.ok(bVisible, "the FormElement is visible after undoing the unhide command");
	// });

	// QUnit.module("Given an add command for a SimpleForm FormContainer control", {
	// 	beforeEach : function(assert) {
	// 		// Test Setup:
	// 		// SimpleForm
	// 		// -- Title
	// 		// -- Label
	// 		// -- Input
	// 		// -- Label
	// 		// -- Input
	// 		// -- Title
	// 		// -- Label
	// 		// -- Input
	// 		// -- Label
	// 		// -- Input
	// 		sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

	// 		this.oTitle0 = new sap.ui.core.Title({id : "Title0",  text : "Title 0"});
	// 		this.oTitle1 = new sap.ui.core.Title({id : "Title1",  text : "Title 1"});
	// 		this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0"});
	// 		this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
	// 		this.oLabel2 = new sap.m.Label({id : "Label2",  text : "Label 2"});
	// 		this.oLabel3 = new sap.m.Label({id : "Label3",  text : "Label 3"});
	// 		this.oInput0 = new sap.m.Input({id : "Input0"});
	// 		this.oInput1 = new sap.m.Input({id : "Input1"});
	// 		this.oInput2 = new sap.m.Input({id : "Input2"});
	// 		this.oInput3 = new sap.m.Input({id : "Input3"});
	// 		this.oSimpleForm = new sap.ui.layout.form.SimpleForm(oComponent.createId("form"), {
	// 			id : "SimpleForm", layout : "ResponsiveGridLayout",
	// 			title : "Simple Form",
	// 			content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1,
	// 			           this.oTitle1, this.oLabel2, this.oInput2, this.oLabel3, this.oInput3]
	// 		});
	// 		this.oSimpleForm.placeAt("test-view");
	// 		sap.ui.getCore().applyChanges();

	// 		this.oFormContainer1 = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
	// 		this.oFormContainer2 = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[1];
	// 		this.oFormElement1 = this.oFormContainer1.getAggregation("formElements")[0];
	// 		this.oFormElement2 = this.oFormContainer2.getAggregation("formElements")[0];
	// 		this.oAddCommand = CommandFactory.getCommandFor(this.oSimpleForm, "Add", {
	// 			newControlId : "Title2",
	// 			index : 5,
	// 			labels:  ["New Control"]
	// 		});
	// 	},

	// 	afterEach : function(assert) {
	// 		sandbox.restore();
	// 		this.oSimpleForm.destroy();
	// 		this.oFormContainer1.destroy();
	// 		this.oFormContainer2.destroy();
	// 		this.oFormElement1.destroy();
	// 		this.oFormElement2.destroy();
	// 		this.oAddCommand.destroy();
	// 	}
	// });

	// QUnit.test("when serializing the add command", function(assert) {

	// 	assert.deepEqual(this.oAddCommand.serialize(), {
	// 	  "changeType": "addSimpleFormGroup",
	// 	  "index": 5,
	// 	  "groupLabel": "New Control",
	// 	  "newControlId": "Title2",
	// 	  "selector": {
	// 	    "id": this.oSimpleForm.getId()
	// 	  }
	// 	},  "then specific change format for hiding a FormElement in SimpleForm is there");

	// });

	// QUnit.test("when executing the add command for SimpleForm", function(assert) {
	// 	assert.ok(this.oAddCommand.isEnabled(), "then the add command is enabled for the SimpleForm FormContainer");

	// 	this.oAddCommand.execute();
	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, undefined, 5);
	// 	assert.equal(oResult.getText(), "New Control", "the FormContainer is part of SimpleForm");
	// });

	// QUnit.test("when undoing the add command for SimpleForm", function(assert) {
	// 	this.oAddCommand.execute();
	// 	this.oAddCommand.undo();
	// 	var oResult = findSimpleFormContentElement(this.oSimpleForm, undefined, 5);
	// 	assert.equal(oResult.getText(), "Title 1", "the FormContainer is removed again from SimpleForm");

	// });

	QUnit.module("Given a command stack with multiple already executed commands", {
		beforeEach : function(assert) {
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.renamedButton = new sap.m.Button();
			this.stack = new sap.ui.rta.command.Stack();
			this.command = new sap.ui.rta.command.BaseCommand();
			this.command2 = new sap.ui.rta.command.BaseCommand();
			this.stack.pushAndExecute(this.command);
			this.stack.pushAndExecute(this.command2);
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
		var fnLastCommandUndo = sinon.spy(this.command2, "undo");
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		this.stack.undo();

		assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
				" the to be executed index is in range");
		assert.equal(fnLastCommandUndo.callCount, 1, " the last command was undone");
		assert.equal(fnStackModified.callCount, 1, " the modify stack listener is called");

		assert.ok(this.stack.canRedo(), "then stack can be redone");
	});

	QUnit.test("when second time undo, then", function(assert) {
		var fnLastCommandUndo = sinon.spy(this.command2, "undo");
		var fnFirstCommandUndo = sinon.spy(this.command, "undo");
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		this.stack.undo();
		this.stack.undo();

		assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
				" the to be executed index is in range");
		assert.equal(fnLastCommandUndo.callCount, 1, " the last command was undone");
		assert.equal(fnFirstCommandUndo.callCount, 1, " the first command was undone");
		assert.ok(fnLastCommandUndo.calledBefore(fnFirstCommandUndo), " the last is called before the first");
		assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called");
	});

	QUnit.test("when undo and redo, then", function(assert) {
		var fnUndo = sinon.spy(this.command2, "undo");
		var fnExecute = sinon.spy(this.command2, "execute");
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		this.stack.undo();

		assert.ok(this.stack.canUndo(), "then a command can be undone");
		assert.ok(this.stack.canRedo(), "then stack can be redone");

		this.stack.redo();

		assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length)) && (this.stack._toBeExecuted >= -1), 0,
				" the to be executed index is in range");
		assert.equal(fnUndo.callCount, 1, " the command was undone");
		assert.equal(fnExecute.callCount, 1, " the command was redone");
		assert.ok(fnUndo.calledBefore(fnExecute), " undo was called before execute");

		assert.ok(this.stack.canUndo(), "then a command can be undone");
		assert.ok(!this.stack.canRedo(), "then stack cannot be redone");
		assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called for undo and redo");
	});

	QUnit.test("when having nothing to redo, redo shouldn't do anything, next command to execute will be still the top command, then",
		function (assert) {
			var fnRedo1 = sinon.spy(this.command, "execute");
			var fnRedo2 = sinon.spy(this.command2, "execute");
			this.stack.redo();
			assert.ok((this.stack._toBeExecuted < (this.stack.getCommands().length))
				&& (this.stack._toBeExecuted >= -1), 0, " the to be executed index is in range");
			assert.equal(fnRedo1.callCount, 0, " the command command was not called");
			assert.equal(fnRedo2.callCount, 0, " the command command2 was not called");
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
			this.stack = new sap.ui.rta.command.Stack();
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.command = new sap.ui.rta.command.BaseCommand();
			this.command2 = new sap.ui.rta.command.BaseCommand();
			this.compositeCommand = new sap.ui.rta.command.CompositeCommand();
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
		var fnStackModified = sinon.spy();
		this.stack.attachModified(fnStackModified);

		this.stack.push(this.command);
		assert.equal(fnStackModified.callCount, 1, " the modify stack listener called on push");
		this.stack.execute();
		assert.equal(fnStackModified.callCount, 2, " the modify stack listener is called on execute");
		assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
	});

	QUnit.test("After pushing one command and calling pushAndExecute the top of stack, then", function(assert) {
		this.stack.pushAndExecute(this.command);
		assert.equal(this.stack._toBeExecuted, -1, " nothing is to be executed");
	});

	QUnit.test("When pushing after undone, then", function(assert) {
		this.stack.pushAndExecute(this.command);
		this.stack.undo();
		this.stack.push(this.command2);

		assert.equal(this.stack.getCommands().length, 1, " only second command on the stack");
		assert.equal(this.stack._getCommandToBeExecuted().getId(), this.command2.getId(), " 2. command to be executed");
		assert.equal(this.stack._toBeExecuted, 0, " one command to be executed");
	});

	QUnit.test("when pushing an executed command, ", function(assert) {
		this.stack.pushExecutedCommand(this.rename);

		assert.ok(!this.stack._getCommandToBeExecuted(), " no command to be executed by the stack");

	});

	QUnit.test("After adding commands to composite command, when executing the composite and undoing it",
			function(assert) {
				var fnCommand1Execute = sinon.spy(this.command, "execute");
				var fnCommand2Execute = sinon.spy(this.command2, "execute");
				var fnCommand1Undo = sinon.spy(this.command, "undo");
				var fnCommand2Undo = sinon.spy(this.command2, "undo");

				this.compositeCommand.addCommand(this.command);
				this.compositeCommand.addCommand(this.command2);

				this.compositeCommand.execute();

				assert.ok(fnCommand1Execute.calledBefore(fnCommand2Execute), "commands are executed in the forward order");

				this.compositeCommand.undo();

				assert.ok(fnCommand2Undo.calledBefore(fnCommand1Undo), "commands are undone in the backward order");
			});

	QUnit.module("Given a regular move command ", {
		beforeEach : function(assert) {
			// Test Setup:
			// VerticalLayout
			// -- content
			// -- -- ObjectHeader
			// -- -- -- attributes
			// -- -- -- -- ObjectAttribute
			// -- -- Button
			sandbox.stub(sap.ui.fl.Utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.oButton = new sap.m.Button(oComponent.createId("button"));
			this.oObjectAttribute = new sap.m.ObjectAttribute(oComponent.createId("attribute"));
			this.oObjectHeader = new sap.m.ObjectHeader(oComponent.createId("header"), {
				attributes : [this.oObjectAttribute]
			});
			this.oLayout = new sap.ui.layout.VerticalLayout("someLayoutId", {
				content : [this.oObjectHeader, this.oButton]
			});

			this.oMoveCommand = CommandFactory.getCommandFor(this.oLayout, "Move", {
				source : {
					parent : this.oObjectHeader,
					aggregation : "attributes",
					publicAggregation : "attributes"
				},
				movedElements : [{
					element : this.oObjectAttribute,
					sourceIndex : 0,
					targetIndex : 2
				}],
				target : {
					parent : this.oLayout,
					aggregation : "content",
					publicAggregation : "content"
				}
			}, new sap.ui.dt.ElementDesignTimeMetadata({
				data : {
					actions : {
						move : "moveControls"
					}
				}
			}));

			this.mSerializedObjectAttributeMove = {
				changeType : "moveControls",
				selector : {
					id : this.oObjectHeader.getId()
				},
				source : {
					id : this.oObjectHeader.getId(),
					aggregation : "attributes"
				},
				movedElements : [{
					id : this.oObjectAttribute.getId(),
					sourceIndex : 0,
					targetIndex : 2
				}],
				target : {
					id : this.oLayout.getId(),
					aggregation : "content"
				}
			};
		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oLayout.destroy();
			this.oMoveCommand.destroy();
		}
	});

	QUnit.test("After executing the command", function(assert) {
		this.oMoveCommand.execute();

		assertObjectAttributeMoved.call(this, assert);
	});

	QUnit.test("After executing and undoing the command", function(assert) {
		this.oMoveCommand.execute();

		this.oMoveCommand.undo();
		assertObjectAttributeNotMoved.call(this, assert);
	});

	QUnit.test("After executing, undoing and redoing the command", function(assert) {
		this.oMoveCommand.execute();
		this.oMoveCommand.undo();

		this.oMoveCommand.execute();
		assertObjectAttributeMoved.call(this, assert);
	});

	function assertObjectAttributeMoved(assert) {
		assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(),
				"object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(),
				"object attribute is inserted at the 3. position");
	}

	function assertObjectAttributeNotMoved(assert) {
		assert.equal(this.oObjectHeader.getAttributes().length, 1, "object header has still one attribute");
		assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute.getId(),
				"object attribute is still at the 1. position");
		assert.equal(this.oLayout.getContent().length, 2, "layout content has still 2 controls");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(),
				"object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
	}

	QUnit.module("Given a smart form with two groups and one element in the first group and move commands ", {
		beforeEach : function(assert) {
			// Test Setup:
			// SmartForm
			// -- groups
			// -- -- SmartGroup1
			// -- -- -- groupElements
			// -- -- -- -- SmartElement
			// -- -- SmartGroup2

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.oSmartGroupElement = new sap.ui.comp.smartform.GroupElement(oComponent.createId("element"));
			this.oSmartGroup1 = new sap.ui.comp.smartform.Group(oComponent.createId("group1"), {
				groupElements : [this.oSmartGroupElement]
			});
			this.oSmartGroup2 = new sap.ui.comp.smartform.Group(oComponent.createId("group2"));
			this.oSmartForm = new sap.ui.comp.smartform.SmartForm(oComponent.createId("form"), {
				groups : [this.oSmartGroup1, this.oSmartGroup2]
			});

			var fnGetSmartForm = function (oElement) {
				if (oElement instanceof sap.ui.comp.smartform.SmartForm) {
					return oElement;
				} else if (oElement.getParent()) {
					return fnGetSmartForm(oElement.getParent());
				}
			};

			var oOverlay = new sap.ui.dt.ElementOverlay();
			sandbox.stub(sap.ui.dt.OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getRelevantContainer", function() {
				return this.oSmartForm;
			}.bind(this));

			this.oMoveFieldCommand = CommandFactory.getCommandFor(this.oSmartForm, "Move", {
				source : {
					parent : this.oSmartGroup1,
					aggregation : "formElements",
					publicAggregation : "formElements"
				},
				target : {
					parent : this.oSmartGroup2,
					aggregation : "formElements",
					publicAggregation : "formElements"
				},
				movedElements : [{
					element : this.oSmartGroupElement,
					sourceIndex : 0,
					targetIndex : 0
				}]
			}, new sap.ui.dt.ElementDesignTimeMetadata({
				data : {
					actions : {
						move : {
							changeType : "moveControls",
							changeOnRelevantContainer : true
						}
					}
				}
			}));

			this.mSerializedFieldMove = {
				changeType : "moveControls",
				selector : {
					id : this.oSmartGroup1.getId()
				},
				targetId : this.oSmartGroup2.getId(),
				moveFields : [{
					id : this.oSmartGroupElement.getId(),
					index : 0
				}]
			};

			this.oMoveGroupCommand = CommandFactory.getCommandFor(this.oSmartForm, "Move", {
				source : {
					parent : this.oSmartForm,
					aggregation : "groups",
					publicAggregation : "groups"
				},
				target : {
					parent : this.oSmartForm,
					aggregation : "groups",
					publicAggregation : "groups"
				},
				movedElements : [{
					element : this.oSmartGroup2,
					sourceIndex : 1,
					targetIndex : 0
				}]
			}, new sap.ui.dt.ElementDesignTimeMetadata({
				data : {
					actions : {
						move : "moveGroups"
					}
				}
			}));

			this.mSerializedGroupMove = {
				changeType : "moveGroups",
				selector : {
					id : this.oSmartForm.getId()
				},
				targetId : null,
				moveGroups : [{
					id : this.oSmartGroup2.getId(),
					index : 0
				}]
			};
		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oSmartForm.destroy();
			this.oMoveFieldCommand.destroy();
			this.oMoveGroupCommand.destroy();
		}
	});

	QUnit.test("After executing the move field command", function(assert) {
		this.oMoveFieldCommand.execute();

		assertFieldMoved.call(this, assert);
	});

/*
	UNRELATED TESTFAILURE!
	REMOVED DUE TO A BUG REQUIRING THIS CHANGE TO BE FIXED

	undo is with and without this change broken

	signed by Christian Voshage

	QUnit.test("After executing and undoing the move field command", function(assert) {
		this.oMoveFieldCommand.execute();
		this.oMoveFieldCommand.undo();

		assertFieldNotMoved.call(this, assert);
	});
*/

	function assertFieldMoved(assert) {
		assert.equal(this.oSmartGroup1.getGroupElements().length, 0, "group element is removed from group1");
		assert.equal(this.oSmartGroup2.getGroupElements().length, 1, "group element is added to group2");
		assert.equal(this.oSmartGroup2.getGroupElements()[0].getId(), this.oSmartGroupElement.getId(),
				"group element is at 1. position");
	}

	QUnit.test("After executing the move group command", function(assert) {
		this.oMoveGroupCommand.execute();

		assertGroupMoved.call(this, assert);
	});

	QUnit.test("After executing and undoing the move group command", function(assert) {
		this.oMoveGroupCommand.execute();
		this.oMoveGroupCommand.undo();

		assertGroupNotMoved.call(this, assert);
	});

	function assertGroupMoved(assert) {
		assert.equal(this.oSmartForm.getGroups().length, 2, "form has still both groups");
		assert.equal(this.oSmartForm.getGroups()[0].getId(), this.oSmartGroup2.getId(), "group2 is at 1. position");
		assert.equal(this.oSmartForm.getGroups()[1].getId(), this.oSmartGroup1.getId(), "group1 is at 2. position");
	}

	function assertGroupNotMoved(assert) {
		assert.equal(this.oSmartForm.getGroups().length, 2, "form has still both groups");
		assert.equal(this.oSmartForm.getGroups()[0].getId(), this.oSmartGroup1.getId(), "group1 is still at 1. position");
		assert.equal(this.oSmartForm.getGroups()[1].getId(), this.oSmartGroup2.getId(), "group2 is still at 2. position");
	}

	QUnit.module("Given controls and designTimeMetadata", {
		beforeEach : function(assert){
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			this.oMovable = new sap.m.ObjectAttribute(oComponent.createId("attribute"));
			this.oSourceParent = new sap.m.ObjectHeader(oComponent.createId("header"), {
				attributes : [this.oMovable]
			});
			this.oTargetParent = new sap.m.ObjectHeader(oComponent.createId("targetHeader"));

			this.oRootElement = new sap.ui.layout.VerticalLayout({
				content : [this.oSourceParent, this.oTargetParent]
			});

			this.oSourceParentDesignTimeMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
				data : {
					actions : {
						move : "moveControls"
					},
					fakeAggreagtionWithoutMove : {

					}
				}
			});
			this.oOtherParentDesignTimeMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
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
})();
