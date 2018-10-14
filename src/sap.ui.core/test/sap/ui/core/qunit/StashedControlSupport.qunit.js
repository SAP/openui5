sap.ui.define([
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/base/Log",
	"sap/ui/qunit/utils/createAndAppendDiv"],
function(StashedControlSupport, Component, XMLView, Button, Panel, Log, createAndAppendDiv) {
	/* global QUnit */
	"use strict";

	createAndAppendDiv("content");

	var sViewContent =
		'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Panel id="Panel">' +
				'<content>' +
					'<Button id="StashedButton" stashed="true"/>' +
					'<Button id="Button"/>' +
				'</content>' +
			'</Panel>' +
		'</mvc:View>';

	QUnit.module("Control mixin", {
		beforeEach: function() {
			this.Button = Button.extend("Button");
		}
	});

	QUnit.test("class", function(assert) {
		var fnClone = this.Button.prototype.clone,
			fnDestroy = this.Button.prototype.destroy;
		StashedControlSupport.mixInto(this.Button);
		assert.ok(this.Button.getMetadata().hasSpecialSetting("stashed"), "Control class has 'stashed' special setting");
		assert.ok(this.Button.prototype.getStashed, "Control class has method 'getStashed'");
		assert.ok(this.Button.prototype.setStashed, "Control class has method 'setStashed'");
		assert.notStrictEqual(this.Button.prototype.destroy, fnClone, "Control class method 'clone' overwritten'");
		assert.notStrictEqual(this.Button.prototype.destroy, fnDestroy, "Control class method 'destroy' overwritten'");
	});

	QUnit.test("instance", function(assert) {
		StashedControlSupport.mixInto(this.Button);
		var oButton = new this.Button();
		assert.ok(!oButton.mProperties.stashed, "Control instance has 'stashed' property");
		assert.ok(oButton.getStashed, "Control instance has method 'getStashed'");
		assert.ok(oButton.setStashed, "Control instance has method 'setStashed'");
		assert.strictEqual(oButton.getStashed(), undefined, "'stashed' property default value is undefined");
		oButton.destroy();
	});

	QUnit.module("StashedControl", {
		beforeEach: function() {
			this.Button = Button.extend("Button");
			StashedControlSupport.mixInto(this.Button);
			this.create = function() {
				// uses the stashed control's id
				this.oButton = new this.Button(this.sId);
				return [this.oButton];
			}.bind(this);
			this.mSettings = {
					sParentId: "parent",
					sParentAggregationName: "content",
					fnCreate: this.create
				};
			this.sId = "control";
			this.oPanel = new Panel("parent");
		},
		afterEach: function() {
			if (this.oButton) {
				this.oButton.destroy();
			}
			this.oPanel.destroy();
		}
	});

	QUnit.test("factory", function(assert) {
		this.oStashedControl = StashedControlSupport.createStashedControl(this.sId, this.mSettings);
		assert.strictEqual(this.oStashedControl.getId(), this.sId, "id is set");
		assert.strictEqual(this.oStashedControl.sParentId, this.mSettings.sParentId, "sParentId is set");
		assert.strictEqual(this.oStashedControl.sParentAggregationName, this.mSettings.sParentAggregationName, "sParentAggregationName is set");
		assert.strictEqual(this.oStashedControl.fnCreate, this.create, "fnCreate hook is set");
		assert.ok(this.oStashedControl.setStashed, "setStashed method is available");
		assert.ok(this.oStashedControl.getStashed, "getStashed method is available");
		assert.ok(this.oStashedControl.clone, "clone method is available");
		assert.ok(this.oStashedControl.destroy, "destroy method is available");
		assert.strictEqual(this.oStashedControl.getStashed(), true, "'stashed' is true");
		this.oStashedControl.destroy();
	});

	QUnit.test("factory - error", function(assert) {
		var oSpy = this.spy(Log, "error");
		assert.notOk(StashedControlSupport.createStashedControl(this.sId, {}), "Should not return a StashedControl");
		assert.ok(oSpy.calledWithExactly("Cannot create a StashedControl without a parent with stable ID.", "sap.ui.core.StashedControlSupport"), "log error");
	});

	QUnit.test("setParent", function(assert) {
		var oSpy = this.spy(Log, "error");
		this.oStashedControl = StashedControlSupport.createStashedControl(this.sId, this.mSettings);
		this.oStashedControl.setParent("parent");
		assert.ok(oSpy.calledWithExactly("Cannot set parent on a StashedControl", this.sId), "log error");
	});

	QUnit.test("stash", function(assert) {
		var oSpy = this.spy(Log, "warning");
		this.oButton = new this.Button(this.sId);
		this.oPanel.addAggregation("content", this.oButton);
		assert.ok(this.oButton.getParent(), "Control has a parent");
		this.oButton.setStashed(true);
		assert.ok(oSpy.calledWithExactly("Cannot re-stash a control", this.sId), "log warning");
	});

	QUnit.test("unstash", function(assert) {
		this.oStashedControl = StashedControlSupport.createStashedControl(this.sId, this.mSettings);
		assert.strictEqual(sap.ui.getCore().byId(this.sId), this.oStashedControl, "Control is still a StashedControl");
		this.oStashedControl.setStashed(false);
		assert.strictEqual(sap.ui.getCore().byId(this.sId), this.oButton, "StashedControl has been replaced");
		assert.ok(!this.oButton.getStashed(), "Control is not stashed");
		assert.strictEqual(this.oStashedControl.getStashed(), false, "StashedControl is not stashed");
		assert.ok(this.oStashedControl.bIsDestroyed, "StashedControl is destroyed");
	});

	QUnit.test("clone", function(assert) {
		var oSpy = this.spy(Log, "error");
		this.oStashedControl = StashedControlSupport.createStashedControl(this.sId, this.mSettings);
		this.oStashedControl.clone();
		assert.ok(oSpy.calledWithExactly("Cannot clone a StashedControl", this.sId), "log error");
	});

	QUnit.test("destroy", function(assert) {
		this.oButton = new this.Button(this.sId, {stashed: true});
		this.oPanel.addAggregation("content", this.oButton);
		this.oPanel.destroy();
		assert.strictEqual(StashedControlSupport.getStashedControls().length, 0, "Stashed control has been destroyed");
	});

	QUnit.module("XML", {
		beforeEach: function() {
			if (!Button.prototype.getStashed) {
				// extend the real sap.m.Button for test purposes - once!
				StashedControlSupport.mixInto(Button);
			}
			this.oView = sap.ui.xmlview("view", {
				viewContent: sViewContent
			}).placeAt("content");
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("StashedControl support", function(assert) {
		var done = assert.async();
		this.oView.onAfterRendering = function() {
			assert.strictEqual(jQuery("#view--StashedButton").length, 0, "Stashed button is not rendered");
			var oButton = sap.ui.getCore().byId("view--StashedButton");
			assert.ok(sap.ui.getCore().byId("view--StashedButton"), "Stashed button is available by id");
			assert.ok(sap.ui.getCore().byId("view--StashedButton") instanceof sap.ui.core._StashedControl, "Stashed button is a StashedControl");
			assert.strictEqual(jQuery("#view--Button").length, 1, "Button is rendered");
			assert.ok(sap.ui.getCore().byId("view--Button") instanceof Button, "Button is a Button");
			this.oView.onAfterRendering = function() {
				assert.strictEqual(jQuery("#view--StashedButton").length, 1, "Stashed button is rendered");
				assert.ok(sap.ui.getCore().byId("view--StashedButton") instanceof Button, "StashedButton is now a Button");
				done();
			};
			oButton.setStashed(false);
			this.oView.invalidate();
		}.bind(this);
		this.oView.invalidate(); // ensure a rerendering
	});

	QUnit.test("getStashedControls", function(assert) {
		assert.strictEqual(StashedControlSupport.getStashedControls().length, 1, "One stashed control existent");
		assert.strictEqual(StashedControlSupport.getStashedControls("Panel")[0], sap.ui.getCore().byId("control11"), "One stashed controls in parent1");
	});

	QUnit.test("getStashedControlIds", function(assert) {
		assert.strictEqual(StashedControlSupport.getStashedControlIds().length, 1, "One stashed control existent");
		assert.strictEqual(StashedControlSupport.getStashedControlIds("view--Panel")[0], "view--StashedButton", "One stashed controls in parent1");
	});

	QUnit.module("Component integration");

	QUnit.test("owner component", function(assert) {
		var oView;
		function createView() {
			oView = sap.ui.xmlview("view", {
				viewContent: sViewContent
			}).placeAt("content");
		}
		new Component("comp").runAsOwner(createView.bind(this));

		sap.ui.getCore().byId("view--StashedButton").setStashed(false);
		var oButtonComponent = Component.getOwnerComponentFor(oView.byId("view--StashedButton"));
		var oStashedButtonComponent = Component.getOwnerComponentFor(oView.byId("view--StashedButton"));

		assert.strictEqual(oStashedButtonComponent, oButtonComponent, "Buttons have same owner");
		assert.equal(oStashedButtonComponent.getId(), "comp", "Buttons have the right owner");

		oView.destroy();
	});

	QUnit.module("Async XMLView", {
		beforeEach: function() {
			if (!Button.prototype.getStashed) {
				// extend the real sap.m.Button for test purposes - once!
				StashedControlSupport.mixInto(Button);
			}
			return XMLView.create({
				id: "view",
				viewName: 'test.StashedControl'
			}).then(function(oView) {
				this.oView = oView;
				oView.placeAt("content");
			}.bind(this));
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("StashedControl support", function(assert) {
		var done = assert.async();
		var oView = this.oView;

		var fnTest = function () {
			oView.onAfterRendering = function() {
				assert.strictEqual(jQuery("#view--StashedButton").length, 0, "Stashed button is not rendered");
				var oButton = sap.ui.getCore().byId("view--StashedButton");
				assert.ok(sap.ui.getCore().byId("view--StashedButton"), "Stashed button is available by id");
				assert.ok(sap.ui.getCore().byId("view--StashedButton") instanceof sap.ui.core._StashedControl, "Stashed button is a StashedControl");
				assert.strictEqual(jQuery("#view--Button").length, 1, "Button is rendered");
				assert.ok(sap.ui.getCore().byId("view--Button") instanceof Button, "Button is a Button");
				oView.onAfterRendering = function() {
					assert.strictEqual(jQuery("#view--StashedButton").length, 1, "Stashed button is rendered");
					assert.ok(sap.ui.getCore().byId("view--StashedButton") instanceof Button, "StashedButton is now a Button");
					done();
				};
				oButton.setStashed(false);
				oView.invalidate();
			};
			oView.invalidate();
		};

		oView.loaded().then(fnTest);
	});

});