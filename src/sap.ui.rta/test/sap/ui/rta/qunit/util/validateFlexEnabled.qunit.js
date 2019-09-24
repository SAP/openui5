/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/validateFlexEnabled",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function (
	validateFlexEnabled,
	UIComponent,
	ComponentContainer,
	RuntimeAuthoring,
	VerticalLayout,
	Button,
	MessageBox,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("flexEnabled set to `true` and there is unstable control", {
		beforeEach: function () {
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						},
						"sap.ui5": {
							flexEnabled: true
						}
					}
				},
				createContent: function() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							})
						]
					});
				}
			});

			this.oComponent = new CustomComponent("comp");

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();


			this.oLogStub = sandbox.stub(Log, "error")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.startsWith("Control ID was generated dynamically by SAPUI5.");
					})
				)
				.returns();

			this.oMessageBoxStub = sandbox.stub(MessageBox, "show");

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			return this.oRta.start().then(function () {
				this.oLogStub.resetHistory();
				this.oMessageBoxStub.resetHistory();
			}.bind(this));
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("base functionality", function (assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(this.oLogStub.callCount, 1);
			assert.strictEqual(this.oMessageBoxStub.callCount, 1);
		});
	});

	QUnit.module("flexEnabled set to `true` and there are no unstable controls", {
		beforeEach: function () {
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						},
						"sap.ui5": {
							flexEnabled: true
						}
					}
				},
				createContent: function() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId"))
						]
					});
				}
			});

			this.oComponent = new CustomComponent("comp");

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();


			this.oLogStub = sandbox.stub(Log, "error")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.startsWith("Control ID was generated dynamically by SAPUI5.");
					})
				)
				.returns();

			this.oMessageBoxStub = sandbox.stub(MessageBox, "show");

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			return this.oRta.start().then(function () {
				this.oLogStub.resetHistory();
				this.oMessageBoxStub.resetHistory();
			}.bind(this));
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("base functionality", function (assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(this.oLogStub.callCount, 0);
			assert.strictEqual(this.oMessageBoxStub.callCount, 0);
		});
	});

	QUnit.module("flexEnabled is not set and there is an unstable control", {
		beforeEach: function () {
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						},
						"sap.ui5": {}
					}
				},
				createContent: function() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							})
						]
					});
				}
			});

			this.oComponent = new CustomComponent("comp");

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();


			this.oLogStub = sandbox.stub(Log, "error")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.startsWith("Control ID was generated dynamically by SAPUI5.");
					})
				)
				.returns();

			this.oMessageBoxStub = sandbox.stub(MessageBox, "show");

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			return this.oRta.start().then(function () {
				this.oLogStub.resetHistory();
				this.oMessageBoxStub.resetHistory();
			}.bind(this));
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("base functionality", function (assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(this.oLogStub.callCount, 0);
			assert.strictEqual(this.oMessageBoxStub.callCount, 0, "No warning dialog should be shown");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
