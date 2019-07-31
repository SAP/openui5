/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/m/Panel"
], function(
	CommandExecution,
	Component,
	Control,
	Panel
) {
	"use strict";

	var oPanel, oControl, oCE, oFakeCommand, oOwnerComponentFake, oStub;

	function fnInitControlTree() {
		oPanel = new Panel();
		oControl = new Control({});
		oCE = new CommandExecution({command:"Save"});
		oPanel.addContent(oControl);
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

		var oFakeCommand = {fake:true};
		var oOwnerComponentFake = {getCommand: function() {return oFakeCommand;}};
		var oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		assert.deepEqual(oCommandExecution.getCommandInfo(), oFakeCommand, "Command Info returned properly");
		oStub.restore();
	});
});
