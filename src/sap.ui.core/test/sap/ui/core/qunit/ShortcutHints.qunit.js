/*global sinon, QUnit, lib */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/Fragment",
	"sap/ui/Device"
], function(
	Component,
	ShortcutHintsMixin,
	Fragment,
	Device
) {
	"use strict";

	sap.ui.define("my/hints/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.hints.Component", {
			metadata: {
				manifest: {
					"sap.app": {
						"id": "my.hints"
					},
					"sap.ui5": {
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
							"Create": {
								"shortcut": "Ctrl+D"
							}
						},
						"rootView": {
							"viewName": "my.hints.ShortcutHints",
							"type": "XML",
							"async": true
						}
					}
				}
			}
		});
	});

	sap.ui.define("my/hints/ShortcutHints.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
		return Controller.extend("my.hints.ShortcutHints", {
			onSave: function() {},
			onDelete: function() {}
		});
	});

	sap.ui.define("lib/my/MyControl", ["sap/ui/core/Control"], function(Control) {
		var MyControl = Control.extend("lib.my.MyControl", {
			library: "lib.my",
			metadata: {
				events: {
					myEvent: {}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div", oControl);
					oRm.openEnd();

					oRm.openStart("div", oControl.getId() + "-inner");
					oRm.openEnd();
					oRm.close("div");

					oRm.close("div");
				}
			}
		});

		return MyControl;
	});

	var sView = '<mvc:View xmlns:my="lib.my" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" controllerName="my.hints.ShortcutHints" displayBlock="true">'
		+ '<App id="commands">'
		+ '<Page id="page" title="Commands">'
		+ ' <dependents>'
		+ '  <core:CommandExecution id="CE_SAVE" command="Save" enabled="true" execute=".onSave" />'
		+ ' </dependents>'
		+ ' <Panel id="myPanel">'
		+ '  <my:MyControl id="myControl" myEvent="cmd:MyCommand" />'
		+ '  <my:MyControl id="myControl2" myEvent="cmd:Save" />'
		+ '  <Button id="b1" icon="sap-icon://save" press="cmd:Save" />'
		+ '  <Button id="b2" text="Save" tooltip="User Tooltip" press="cmd:Save" />'
		+ '  <Button id="b3" icon="sap-icon://save" tooltip="User Tooltip" press="cmd:Save" />'
		+ ' </Panel>'
		+ '</Page>'
		+ '</App>'
		+ '</mvc:View>';

	sap.ui.require.preload({
		"my/hints/ShortcutHints.view.xml": sView
	}, "my/hints/ShortcutHints-preload");

	function waitForViewReady() {
		return Component.create({
			name: "my.hints",
			manifest: false
		}).then(function(myComponent) {
			return myComponent.getRootControl().loaded();
		});
	}

	QUnit.module("API");

	QUnit.test("add command then add config", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oCtrl = oView.byId("myControl");

			assert.ok(!ShortcutHintsMixin.isControlRegistered(oCtrl.getId()),
				"The control is not registered to show a shortcut");
			assert.ok(!ShortcutHintsMixin.isDOMIDRegistered(oCtrl.getId()),
				"The root DOM node is not registered to show a shortcut");

			ShortcutHintsMixin.addConfig(oCtrl, { event: "myEvent" }, oCtrl);

			assert.ok(ShortcutHintsMixin.isControlRegistered(oCtrl.getId()),
				"The control is registered to show a shortcut");
			assert.ok(ShortcutHintsMixin.isDOMIDRegistered(oCtrl.getId()),
				"The correct DOM node is registered to show a shortcut");
		});
	});
	QUnit.test("ShortcutHintsMixin instances is not created for mobile phone", function(assert){
		// arrange
		var oMyControl = new lib.my.MyControl({ myEvent: function() { } });
		var oSandbox = sinon.sandbox.create();

		oSandbox.stub(Device.system, "desktop").value(false);
		oSandbox.stub(Device.system, "phone").value(true);
		oSandbox.stub(Device.system, "tablet").value(false);

		// act
		ShortcutHintsMixin.addConfig(oMyControl, { event: "myEvent" }, oMyControl);

		// assert
		assert.notOk(oMyControl.hasOwnProperty("_shortcutHintsMixin"));

		// clean
		oMyControl.destroy();
		oSandbox.restore();

	});

	QUnit.test("add config then add command", function(assert) {
		var oComponent;

		//with command shortcut hints this use case is only possible
		//when the control receives config before the command execution
		//event handler is attached
		//in other words - when the config is added inside init
		var oStub = sinon.stub(lib.my.MyControl.prototype, "init").callsFake(
			function() {
				ShortcutHintsMixin.addConfig(this, { event: "myEvent" }, this);
			}
		);

		return Component.create({
			name: "my.hints",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}, function() {
			oStub.restore();
		}).then(function(oView) {
			var oCtrl = oView.byId("myControl");

			assert.ok(ShortcutHintsMixin.isControlRegistered(oCtrl.getId()),
				"The control is registered to show a shortcut");
			assert.ok(ShortcutHintsMixin.isDOMIDRegistered(oCtrl.getId()),
				"The correct DOM node is registered to show a shortcut");

			oStub.restore();
		}, function() {
			oStub.restore();
		});
	});

	QUnit.test("add config with an event that already has event handlers", function(assert) {
		// arrange
		var oMyControl = new lib.my.MyControl({ myEvent: function() { } });

		// act
		ShortcutHintsMixin.addConfig(oMyControl, { event: "myEvent" }, oMyControl);

		// assert
		assert.ok(true, "no exception");

		// clean
		oMyControl.destroy();
	});

	QUnit.test("add config then add command with an event that already has event handlers", function(assert) {
		// arrange
		var oMyControl = new lib.my.MyControl({ myEvent: function() { } });
		var fnFakeCommandHandler = function() { };
		fnFakeCommandHandler._sapui_commandName = "Save";

		// act
		ShortcutHintsMixin.addConfig(oMyControl, { event: "myEvent" }, oMyControl);
		oMyControl.attachEvent("myEvent", fnFakeCommandHandler);

		// assert
		assert.ok(ShortcutHintsMixin.isControlRegistered(oMyControl.getId()),
			"The control is registered to show a shortcut");

		// clean
		oMyControl.destroy();
	});

	QUnit.test("DOM events", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oCtrl = oView.byId("myControl");

			assert.equal(oCtrl.aDelegates.length, 0, "no delegates are attached");

			ShortcutHintsMixin.addConfig(oCtrl, { event: "myEvent" }, oCtrl);

			assert.equal(oCtrl.aDelegates.length, 1, "a delegate is attached");
			assert.ok(oCtrl.aDelegates[0].oDelegate["onfocusin"], "has onfocusin handler");
			assert.ok(oCtrl.aDelegates[0].oDelegate["onfocusout"], "has onfocusout handler");
			assert.ok(oCtrl.aDelegates[0].oDelegate["onmouseover"], "has onmouseover handler");
			assert.ok(oCtrl.aDelegates[0].oDelegate["onmouseout"], "has onmouseout handler");
		});
	});

	QUnit.test("DOM events when control is destroyed and re-created", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oCtrl = oView.byId("myControl");
			ShortcutHintsMixin.addConfig(oCtrl, { event: "myEvent" }, oCtrl);

			oCtrl.destroy();

			assert.notOk(ShortcutHintsMixin.isControlRegistered(oCtrl.getId()),
				"the control id is removed from the hints registry");

			assert.notOk(ShortcutHintsMixin.isDOMIDRegistered(oCtrl.getId()),
				"the dom node id is removed from the hints dom registry");

			Fragment.load({
				type: "XML",
				definition: '<my:MyControl xmlns:my="lib.my" id="' + oView.getId() + '--myControl" myEvent="cmd:MyCommand" />'
			}).then(function(oCtrl) {
				oView.byId("myPanel").addContent(oCtrl);
				ShortcutHintsMixin.addConfig(oCtrl, { event: "myEvent" }, oCtrl);

				assert.equal(oCtrl.aDelegates.length, 1, "a delegate is attached");
			});
		});
	});

	QUnit.test("focusin", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oCtrl2 = oView.byId("myControl2");
			var oSpy = sinon.spy(ShortcutHintsMixin.prototype, "showShortcutHint");

			//render
			oView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			ShortcutHintsMixin.addConfig(oCtrl2, { event: "myEvent" }, oCtrl2);
			oCtrl2._handleEvent({
				type: "focusin",
				target: oCtrl2.getDomRef(),
				isImmediateHandlerPropagationStopped: function() {
					return false;
				}
			});

			assert.ok(oSpy.called, "the focusin event handler shows the hint");
			assert.ok(oSpy.calledOn(oCtrl2._shortcutHintsMixin), "the focusin event handler shows the hint");

			oSpy.restore();
		});
	});

	QUnit.test("popup content", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oCtrl2 = oView.byId("myControl2");

			var oEl = document.createElement('div');
			oEl.setAttribute('id', 'container');
			document.querySelector('body').appendChild(oEl);

			//render
			oView.placeAt('container');
			sap.ui.getCore().applyChanges();

			ShortcutHintsMixin.addConfig(oCtrl2, { event: "myEvent" }, oCtrl2);
			oCtrl2._handleEvent({
				type: "focusin",
				target: oCtrl2.getDomRef(),
				isImmediateHandlerPropagationStopped: function() {
					return false;
				}
			});

			assert.equal(ShortcutHintsMixin._popup.oContent.textContent, "Ctrl+S", "the popup content is right");

			//with tooltip
			oCtrl2.setTooltip("some tooltip");
			sap.ui.getCore().applyChanges();

			oCtrl2._handleEvent({
				type: "focusin",
				target: oCtrl2.getDomRef(),
				isImmediateHandlerPropagationStopped: function() {
					return false;
				}
			});

			assert.equal(ShortcutHintsMixin._popup.oContent.textContent, "some tooltip (Ctrl+S)", "the popup content is right");
		});
	});

	QUnit.module("config options");

	QUnit.test("use id suffix", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oCtrl = oView.byId("myControl");

			ShortcutHintsMixin.addConfig(oCtrl, {
				event: "myEvent",
				domrefid_suffix: "-inner"
			}, oCtrl);

			assert.ok(ShortcutHintsMixin.isControlRegistered(oCtrl.getId()),
				"The control is registered to show a shortcut");
			assert.ok(ShortcutHintsMixin.isDOMIDRegistered(oCtrl.getId() + "-inner"),
				"The correct DOM node is registered to show a shortcut");
		});
	});

	QUnit.test("use different hint provider", function(assert) {
		//common usecase - composition
		//the inner control wants to show a hint for the command
		//of the outer control

		return waitForViewReady().then(function(oView) {
			var oCtrl = oView.byId("myControl");
			var oButton1 = oView.byId("b1");

			ShortcutHintsMixin.addConfig(oCtrl, {
				event: "press"
			}, oButton1);

			oView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(ShortcutHintsMixin.isDOMIDRegistered(oCtrl.getId()),
				"The control is registered to show a shortcut");

			assert.equal(
				oCtrl.getDomRef().getAttribute("aria-keyshortcuts"),
				"Ctrl+S",
				"The hint provider is OK"
			);
		});
	});

	QUnit.module("integration");

	QUnit.test("sap.m.Button accessibility", function(assert) {
		return waitForViewReady().then(function(oView) {
			var oButton1 = oView.byId("b1"); //icon-only
			var oButton2 = oView.byId("b2"); //text with user tooltip
			var oButton3 = oView.byId("b3"); //icon-only with user tooltip

			//render
			oView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			assert.ok(!oButton1.getDomRef().getAttribute('title'),
				"no native tooltip");
			assert.equal(oButton1.getDomRef().getAttribute('aria-keyshortcuts'),
				"Ctrl+S", "has hint accessibility");
			assert.ok(!oButton2.getDomRef().getAttribute('title'),
				"no native tooltip");
			assert.equal(oButton2.getDomRef().getAttribute('aria-keyshortcuts'),
				"Ctrl+S", "has hint accessibility");
			assert.ok(!oButton3.getDomRef().getAttribute('title'),
				"no native tooltip");
			assert.equal(oButton3.getDomRef().getAttribute('aria-keyshortcuts'),
				"Ctrl+S", "has hint accessibility");
		});
	});
});
