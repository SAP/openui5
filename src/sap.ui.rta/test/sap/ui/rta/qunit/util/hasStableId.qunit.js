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

	QUnit.module("Control in binding template (template has stable ID, control has stable ID)", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var oModel = new JSONModel([
				{ text: "item1-bound" },
				{ text: "item2-bound" }
			]);

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new XMLView({
						id: "myView",
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">' +
								'<m:List id="layout" items="{path: \'/\'}">' +
									'<m:CustomListItem id="itemTpl">' +
										'<m:Text id="text" text="{text}" />' +
									'</m:CustomListItem>' +
								'</m:List>' +
							'</mvc:View>'
					});
				}
			});

			this.oComponent = new FixtureComponent();
			this.oView = this.oComponent.getRootControl();
			this.oComponent.getRootControl().setModel(oModel);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oText1 = this.oView.byId("layout").getItems()[0].getContent()[0];

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oComponent
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oText1Overlay = OverlayRegistry.getOverlay(this.oText1);
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
			assert.strictEqual(hasStableId(this.oText1Overlay), true);
		});
	});

	QUnit.module("Control in binding template (template has stable ID, control has unstable ID)", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var oModel = new JSONModel([
				{ text: "item1-bound" },
				{ text: "item2-bound" }
			]);

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new XMLView({
						id: "myView",
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">' +
								'<m:List id="layout" items="{path: \'/\'}">' +
									'<m:CustomListItem id="itemTpl">' +
										'<m:Text text="{text}" />' +
									'</m:CustomListItem>' +
								'</m:List>' +
							'</mvc:View>'
					});
				}
			});

			this.oComponent = new FixtureComponent();
			this.oView = this.oComponent.getRootControl();
			this.oComponent.getRootControl().setModel(oModel);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oText1 = this.oView.byId("layout").getItems()[0].getContent()[0];

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oComponent
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oText1Overlay = OverlayRegistry.getOverlay(this.oText1);
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
			assert.strictEqual(hasStableId(this.oText1Overlay), false);
		});
	});

	QUnit.module("Control in binding template (template has unstable ID, control has stable ID)", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var oModel = new JSONModel([
				{ text: "item1-bound" },
				{ text: "item2-bound" }
			]);

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new XMLView({
						id: "myView",
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">' +
								'<m:List id="layout" items="{path: \'/\'}">' +
									'<m:CustomListItem id="itemTpl">' +
										'<m:Text text="{text}" />' +
									'</m:CustomListItem>' +
								'</m:List>' +
							'</mvc:View>'
					});
				}
			});

			this.oComponent = new FixtureComponent();
			this.oView = this.oComponent.getRootControl();
			this.oComponent.getRootControl().setModel(oModel);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oText1 = this.oView.byId("layout").getItems()[0].getContent()[0];

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oComponent
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oText1Overlay = OverlayRegistry.getOverlay(this.oText1);
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
			assert.strictEqual(hasStableId(this.oText1Overlay), false);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
