/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Shortcut",
	"sap/ui/core/Component",
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Control",
	"sap/m/Panel",
	"sap/m/Input"
], function(
	QUtils,
	Shortcut,
	Component,
	CommandExecution,
	Control,
	Panel,
	Input
) {
	"use strict";

	var oPanel, oControl, oCE, oStub, oFakeCommand, oOwnerComponentFake;

	function fnInitControlTree() {
		oPanel = new Panel();
		oControl = new Control({});
		oCE = new CommandExecution({command:"Save", execute: function() {}});
		oPanel.addContent(oControl);
		oFakeCommand = {"Save":{shortcut:"Shift+s", fake:true}};
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
		Shortcut.register(oPanel, "Shift+S", function() {});
		assert.ok(Shortcut.isRegistered(oPanel, "Shift+S"), "Shortcut registered");
		Shortcut.unregister(oPanel, "Shift+S");
		assert.ok(!Shortcut.isRegistered(oPanel, "Shift+S"), "Shortcut unregistered");
	});

	QUnit.test("fnWrapper trigger", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oHTMLElementFocusSpy = sinon.spy(HTMLElement.prototype, "focus");
		var oInput = new Input();

		oInput.addDependent(new CommandExecution({command:"Save", execute:function() {
			assert.ok(true, "triggered");
			assert.equal(oHTMLElementFocusSpy.callCount, 3, "HTMLElement.prototype.focus should be called thrice");
			assert.ok(oInput.getDomRef().contains(document.activeElement), "Focus should be restored correctly");
			assert.notOk(document.getElementById("sap-ui-shortcut-focus"), "span element should be removed again");

			oHTMLElementFocusSpy.restore();
			done();
		}}));

		oInput.placeAt("qunit-fixture");
		oInput.addEventDelegate({"onAfterRendering": function() {
			oInput.focus();
			QUtils.triggerKeydown(oInput.getDomRef(), "s", true, false, false);
		}});
	});
});
