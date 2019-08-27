/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel"
], function(
	CommandExecution,
	Component,
	Control,
	JSONModel,
	Panel
) {
	"use strict";

	var oPanel, oInnerPanel, oControl, oInnerControl, oCE, oFakeCommand, oOwnerComponentFake, oStub;

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

	QUnit.test("enabled - false: should not trigger", function(assert) {
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

		//the model normally is created by the component.
		oPanel.setModel(new JSONModel(), "$cmd");
		var oCE_Exit = new CommandExecution({command:"Exit", enabled:true});
		var oCE_Save = new CommandExecution({command:"Save", enabled:true});
		var oCE_InnerSave = new CommandExecution({command:"Save", enabled:false});

		oPanel.addDependent(oCE_Exit);
		oPanel.addDependent(oCE_Save);
		oInnerPanel	.addDependent(oCE_InnerSave);

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
});
