/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/ui/core/Shortcut",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel"
], function(
	CommandExecution,
	Component,
	Control,
	Shortcut,
	JSONModel,
	Panel
) {
	"use strict";

	var oPanel, oInnerPanel, oControl, oInnerControl, oCE, oFakeCommand, oOwnerComponentFake, oStub;

	sap.ui.define("my/command/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.command.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.command.constructor"
					},
					"sap.ui5": {
						"models": {
							"test": {
								"type": "sap.ui.model.json.JSONModel"
							}
						},
						"dependencies": {
							"libs": {
								"sap.ui.core": {},
								"sap.m": {}
							}
						},
						"commands": {
							"Save": {
								"shortcut": "Ctrl+S"
							},
							"Exit": {
								"shortcut": "Ctrl+E"
							}
						},
						"config": {
							"sample": {
								"files": [
									"Component.js",
									"Commands.view.xml",
									"Commands.controller.js",
									"manifest.json"
								]
							}
						},
						"rootView": {
							"viewName": "my.command.Command",
							"type": "XML",
							"async": true
						}
					}
				}
			}
		});
	});

	sap.ui.define("my/command/Command.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
		return Controller.extend("my.command.Command", {
			onSave: function() {

			},
			onExit: function() {

			}
		});
	});


	var sView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" controllerName="my.command.Command" displayBlock="true">'
	+  	'<App id="commands">'
	+  	'<Page id="page" title="Commands">'
	+  '<dependents>'
	+  '<core:CommandExecution id="CE_SAVE" command="Save" enabled="true" execute=".onSave" />'
	+  '<core:CommandExecution id="CE_EXIT" command="Exit" enabled="true" execute=".onExit" />'
	+  '<Popover '
	+  'id="popoverCommand" '
	+  'title="Popover" '
	+  'class="sapUiContentPadding"> '
	+  '<dependents>'
	+  '<core:CommandExecution id="CE_SAVE_POPOVER" enabled="false" command="Save" execute=".onSave" />'
	+  '</dependents>'
	+  '<footer>'
	+  '<Toolbar>'
	+  '<Button text="Delete" press="cmd:Exit" enabled="{$cmd>Delete/enabled}" />'
	+  '<ToolbarSpacer />'
	+  '<Button text="Save" press="cmd:Save" enabled="{$cmd>Save/enabled}" />'
	+  '</Toolbar>'
	+  '</footer>'
	+  '<Input value="{viewModel>/value}" />'
	+  '</Popover>'
	+  '</dependents>'
	+  '<Panel headerText="Button">'
	+  '<Button text="Save" press="cmd:Save" />'
	+  '</Panel>'
	+  '<Panel headerText="sap.m.Input">'
	+  '<Input id="myInput" value="{viewModel>/value}" />'
	+  '</Panel>'
	+  '</Page>'
	+  '</App>'
	+  '</mvc:View>';

	sap.ui.require.preload({
		"my/command/Command.view.xml": sView
	},"my/command/Command-preload");

	function fnInitControlTree() {
		oPanel = new Panel();
		oInnerPanel = new Panel();
		oControl = new Control({});
		oInnerControl = new Control({});
		oCE = new CommandExecution({command:"Save"});
		oPanel.addContent(oControl);
		oPanel.addContent(oInnerPanel);
		oInnerPanel.addContent(oInnerControl);
		oFakeCommand = {"Save":{shortcut:"Shift+s", fake:true}};
		oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
	}

	function fnCleanup() {
		oCE.destroy();
		oPanel.destroy();
		oStub.restore();
	}

	QUnit.module("CommandExecution API");

	QUnit.test("constructor", function(assert) {
		assert.expect(1);
		function fnExecute() {}

		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		assert.strictEqual(oCommandExecution.getCommand(), "save", "getCommand properly returns command");
	});

	QUnit.test("trigger", function(assert) {
		assert.expect(2);
		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		function fnExecute() {
			assert.ok(true, "execute function triggered");
			assert.strictEqual(this, oCommandExecution, "context set to command execution");
		}

		oCommandExecution.trigger();
	});

	QUnit.test("find", function(assert) {
		fnInitControlTree();
		assert.expect(2);
		var oFCE = CommandExecution.find(oControl, "Save");
		assert.ok(!oFCE, "No CommandExecution exists");
		oPanel.addDependent(oCE);
		oFCE = CommandExecution.find(oControl, "Save");
		assert.strictEqual(oCE, oFCE, "CommandExecution found");
		fnCleanup();
	});

	QUnit.test("getCommandInfo", function(assert) {
		assert.expect(1);
		function fnExecute() {}

		//restore before redefine
		oStub.restore();
		var oFakeCommand = {fake:true};
		var oOwnerComponentFake = {getCommand: function() {return oFakeCommand;}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		assert.deepEqual(oCommandExecution._getCommandInfo(), oFakeCommand, "Command Info returned properly");
		oStub.restore();
	});

	QUnit.test("setCommand", function(assert) {
		assert.expect(2);

		fnInitControlTree();
		oPanel.addDependent(oCE);

		var oFCE = CommandExecution.find(oControl, "Save");
		assert.equal(oFCE.getCommand(), "Save", "Command set correctly");
		oFCE.setCommand("Exit");
		assert.equal(oFCE.getCommand(), "Save", "Command name is not changeable");
		fnCleanup();
	});

	QUnit.test("enabled", function(assert) {
		assert.expect(2);

		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecuteNOK, enabled: false});

		function fnExecuteNOK() {
			assert.ok(false, "disabled CommandExecution should not be triggered");
		}

		function fnExecuteOK() {
			assert.ok(true, "execute function triggered");
			assert.strictEqual(this, oCommandExecution, "context set to command execution");
		}

		oCommandExecution.trigger();
		oCommandExecution.detachExecute(fnExecuteNOK);
		oCommandExecution.attachExecute(fnExecuteOK);
		oCommandExecution.trigger();
		oCommandExecution.setEnabled(true);
		oCommandExecution.trigger();
	});

	QUnit.module("CommandExecution integration:");

	QUnit.test("enabled $cmd model", function(assert) {
		assert.expect(10);

		//create control tree
		fnInitControlTree();
		oStub.restore();

		//stub component calls
		var oFakeCommand = {
			"Save": {
				"shortcut": "Ctrl+S"
			},
			"Exit": {
				"shortcut": "Ctrl+E"
			}
		};
		var oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		//restore before redefine
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);

		var oCE_Exit = new CommandExecution({command:"Exit", enabled:true});
		var oCE_Save = new CommandExecution({command:"Save", enabled:true});
		var oCE_InnerSave = new CommandExecution({command:"Save", enabled:false});

		oPanel.addDependent(oCE_Exit);
		oPanel.addDependent(oCE_Save);
		oInnerPanel	.addDependent(oCE_InnerSave);

		//set dummy model for testing
		oPanel.setModel(new JSONModel(), "dummy");
		//the model normally is created by the component.
		oPanel.setModel(new JSONModel(), "$cmd");

		//check CommandExecutions in Control tree
		assert.equal(oCE_InnerSave, CommandExecution.find(oInnerControl, "Save"));
		assert.equal(oCE_Exit, CommandExecution.find(oInnerControl, "Exit"));
		assert.equal(oCE_Save, CommandExecution.find(oControl, "Save"));
		assert.equal(oCE_Exit, CommandExecution.find(oControl, "Exit"));

		//check model data
		var oModel = oPanel.getModel("$cmd");
		var oContext = oPanel.getBindingContext("$cmd");
		var oInnerContext = oInnerPanel.getBindingContext("$cmd");
		assert.equal(oInnerContext.getPath(), "/" + oInnerPanel.getId(), "Context to prototype set correctly");
		assert.equal(oContext.getPath(), "/" + oPanel.getId(), "Context to prototype set correctly");

		assert.equal(oModel.getProperty("Save/enabled", oInnerContext), false, "enabled correctly set in  model");
		assert.equal(oModel.getProperty("Exit/enabled", oInnerContext), true, "enabled correctly set in  model");
		assert.equal(oModel.getProperty("Save/enabled", oContext), true, "enabled correctly set in  model");
		assert.equal(oModel.getProperty("Exit/enabled", oContext), true, "enabled correctly set in  model");
		fnCleanup();
	});

	QUnit.test("via Component instantiation", function(assert) {
		assert.expect(6);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oModel = oComponent.getModel("$cmd");
			var oPage = oView.byId("page");
			var oPopover = oView.byId("popoverCommand");
			var oPageContext = oPage.getBindingContext("$cmd");
			var oPagePopoverContext = oPopover.getBindingContext("$cmd");

			assert.equal(oPagePopoverContext.getPath(), "/" + oPopover.getId(), "Context to prototype set correctly");
			assert.equal(oPageContext.getPath(), "/" + oPage.getId(), "Context to prototype set correctly");

			assert.equal(oModel.getProperty("Save/enabled", oPagePopoverContext), false, "enabled correctly set in  model");
			assert.equal(oModel.getProperty("Exit/enabled", oPagePopoverContext), true, "enabled correctly set in  model");
			assert.equal(oModel.getProperty("Save/enabled", oPageContext), true, "enabled correctly set in  model");
			assert.equal(oModel.getProperty("Exit/enabled", oPageContext), true, "enabled correctly set in  model");
			oComponent.destroy();
		});
	});

	QUnit.test("remove CommandExecution", function(assert) {
		assert.expect(2);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oPage = oView.byId("page");

			assert.notEqual(oPopover.getBindingContext("$cmd"), oPage.getBindingContext("$cmd"), "different contexts");
			oPopover.removeAllAggregation("dependents");
			assert.equal(oPopover.getBindingContext("$cmd"), oPage.getBindingContext("$cmd"), "equal contexts");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandInfo", function(assert) {
		assert.expect(3);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oCE = oPopover.getDependents()[0];
			var oCE2 = new CommandExecution({command:"Save"});
			assert.ok(oCE._getCommandInfo(), "command info found");
			assert.ok(!oCE2._getCommandInfo(), "no command info found");
			assert.strictEqual(oCE2._getCommandInfo(), null, "null returned");
			oComponent.destroy();
		});
	});

	QUnit.test("add CommandExecution without owner", function(assert) {
		assert.expect(1);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oCE = new CommandExecution({command:"Exit"});
			oPopover.addDependent(oCE);
			assert.ok(oCE._getCommandInfo(), "command info found");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution remove from aggregation and destro", function(assert) {
		assert.expect(2);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oCE = new CommandExecution({command:"Exit", execute:function() {assert.ok(false, "should not happen");}});
			oPopover.addDependent(oCE);
			assert.ok(oCE._getCommandInfo(), "command info found");
			oCE = oPopover.removeAllDependents()[0];
			oCE.trigger();
			assert.equal(oCE.getParent(), null, "successfully removed from aggregation");
			oComponent.destroy();
			oCE.destroy();
		});
	});

	QUnit.test("CommandExecution change parent", function(assert) {
		assert.expect(3);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oPage = oView.byId("page");
			var oCE = new CommandExecution({command:"Exit", execute:function() {assert.ok(true, "should happen");}});
			oPopover.addDependent(oCE);
			oPage.addDependent(oCE);
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "shortcut deregistered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "shortcut registered");
			oCE.trigger();
			oComponent.destroy();
			oCE.destroy();
		});
	});
});
