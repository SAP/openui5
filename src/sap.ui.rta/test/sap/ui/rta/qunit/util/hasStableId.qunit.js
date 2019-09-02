/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/hasStableId",
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/m/List",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/sinon-4"
],
function (
	hasStableId,
	Log,
	UIComponent,
	ComponentContainer,
	DesignTime,
	OverlayRegistry,
	VerticalLayout,
	JSONModel,
	List,
	XMLView,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Default parameters", function () {
		QUnit.test("when hasStableId is called without parameters", function (assert) {
			assert.strictEqual(hasStableId(), false);
		});
	});

	QUnit.module("Control with unstable ID", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new VerticalLayout();
				}
			});

			this.oComponent = new FixtureComponent();
			this.oLayout = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when hasStableId is called", function (assert) {
			assert.strictEqual(hasStableId(this.oLayoutOverlay), false);
		});
	});

	QUnit.module("Control with stable ID", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new VerticalLayout("layout");
				}
			});

			this.oComponent = new FixtureComponent();
			this.oLayout = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when hasStableId is called", function (assert) {
			assert.strictEqual(hasStableId(this.oLayoutOverlay), true);
		});
		QUnit.test("when Overlay is destroyed", function (assert) {
			this.oLayoutOverlay.destroy();
			assert.strictEqual(hasStableId(this.oLayoutOverlay), false);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
