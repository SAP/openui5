/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/core/Shortcut",
	"sap/ui/core/Component",
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Control",
	"sap/m/Panel"
], function(
	Shortcut,
	Component,
	CommandExecution,
	Control,
	Panel
) {
	"use strict";

	var oPanel, oControl, oCE, oStub, oFakeCommand, oOwnerComponentFake;

	function fnInitControlTree() {
		oPanel = new Panel();
		oControl = new Control({});
		oCE = new CommandExecution({command:"Save"});
		oPanel.addContent(oControl);
		oFakeCommand = {"Save":{shortcut:"Ctrl+s", fake:true}};
		oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
	}

	function cleanup() {
		oCE.destroy();
		oPanel.destroy();
		oStub.restore();
	}

	QUnit.module("Shourtcut API", {
		beforeEach: fnInitControlTree,
		afterEach: cleanup
	});

	QUnit.test("register/unregister/isRegistered", function(assert) {
		assert.expect(2);
		Shortcut.register(oPanel, "Ctrl+S", function() {});
		assert.ok(Shortcut.isRegistered(oPanel, "Ctrl+S"), "Shortcut registered");
		Shortcut.unregister(oPanel, "Ctrl+S");
		assert.ok(!Shortcut.isRegistered(oPanel, "Ctrl+S"), "Shortcut unregistered");
	});
});
