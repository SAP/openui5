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
		oCE = new CommandExecution({command:"Save", execute:function() {}});
		oPanel.addContent(oControl);
		oFakeCommand = {"Save":{shortcut:"Shift+S", fake:true}};
		oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
	}

	function cleanup() {
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

	QUnit.test("register twice", function(assert) {
		assert.expect(2);
		Shortcut.register(oPanel, "Shift+S", function() {});
		assert.ok(Shortcut.isRegistered(oPanel, "Shift+S"), "Shortcut registered");
		assert.throws(Shortcut.register.bind(null, oPanel, "Shift+S", function() {}), "Can't register the same shortcut twice");
	});

	QUnit.test("register w/o callback", function(assert) {
		assert.expect(1);
		assert.throws(Shortcut.register.bind(null, oPanel, "Shift+S" /*,no callback function */), "No callback function given");
	});

	QUnit.test("register w/o scopecontrol", function(assert) {
		assert.expect(1);
		assert.throws(Shortcut.register.bind(null, null /*no scope control*/, "Shift+S", function() {}), "No scope control given");
	});

	QUnit.test("unregister w/o scopecontrol", function(assert) {
		assert.expect(1);
		assert.throws(Shortcut.unregister.bind(null, null /*no scope control*/, "Shift+S"), "no scope control given");
	});

	QUnit.test("unregister a not registered shortcut", function(assert) {
		assert.expect(2);
		oPanel.addDependent(oCE);
		assert.ok(!Shortcut.unregister(oPanel, "Ctrl+R"), "Shortcut not unregistered");
		assert.ok(Shortcut.unregister(oPanel, "Shift+S"), "Shortcut unregistered");
	});

	QUnit.test("fnWrapper trigger", function(assert) {
		assert.expect(6);
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

			// wrap the assertion in a 0 timeout to make sure that the shift of focus to the internal "span"
			// is done by using a 0 timeout
			setTimeout(function() {
				assert.ok(oInput.getDomRef().contains(document.activeElement), "Focus should be within the input after a 0 timeout");
			});

			QUtils.triggerKeydown(oInput.getDomRef(), "s", true, false, false);
			assert.ok(oInput.getDomRef().contains(document.activeElement), "Focus should be within the input directly after triggering the shortcut");
		}});
	});
});
