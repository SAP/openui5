/* global QUnit */

sap.ui.define([
	"sap/ui/rta/util/validateStableIds",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/dt/DesignTime",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/ui/core/mvc/XMLView",
	"sap/base/util/includes",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
],
function(
	validateStableIds,
	UIComponent,
	ComponentContainer,
	DesignTime,
	VerticalLayout,
	Button,
	XMLView,
	includes,
	LoaderExtensions,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Freestyle application", {
		beforeEach(assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.rta.test.Component", {
				createContent() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							}),
							new XMLView({ // Missing ID for view and implicit missing IDs for controls inside
								viewContent:
									'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
										'<l:VerticalLayout id="layout">' +
											'<m:Button text="Button 1" id="button1" />' +
										"</l:VerticalLayout>" +
									"</mvc:View>"
							})
						]
					});
				}
			});

			this.oComponent = new CustomComponent(); // Missing ID

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oComponent
				]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("base functionality", function(assert) {
			assert.strictEqual(
				validateStableIds(this.oDesignTime.getElementOverlays(), this.oComponent).length,
				5
			);
		});
	});

	QUnit.module("Fiori Elements Application with extension", {
		beforeEach(assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							// These controls considered as Fiori Elements templates:
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							}),
							new XMLView({ // Missing ID for view and implicit missing IDs for controls inside
								viewContent:
									'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
										'<l:VerticalLayout id="layout">' +
											'<m:Button text="Button 1" id="button1" />' +
										"</l:VerticalLayout>" +
									"</mvc:View>"
							}),

							// This view considered as a custom extension:
							new XMLView("reviewView", { // Missing ID for view and implicit missing IDs for controls inside
								viewName: "fixture.application.ext.view.ProductDetailReview"
							})
						]
					});
				}
			});

			var oParser = new DOMParser();

			sandbox.stub(LoaderExtensions, "loadResource")
			.callThrough()
			.withArgs(
				sinon.match(function(sResourceName) {
					return typeof sResourceName === "string" && sResourceName.endsWith("fixture/application/ext/view/ProductDetailReview.view.xml");
				})
			)
			.returns(
				oParser.parseFromString(
					'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
							'<l:VerticalLayout id="layout">' +
								'<m:Button text="Button 1"/>' +
							"</l:VerticalLayout>" +
						"</mvc:View>",
					"text/xml"
				)
			);

			this.oComponent = new CustomComponent(); // Missing ID

			sandbox.stub(this.oComponent, "getManifest").returns(
				{
					"sap.app": {
						id: "fixture.application"
					},
					"sap.ui5": {
						"extends": {
							extensions: {
								"sap.ui.viewExtensions": {
									"sap.suite.ui.generic.template.ObjectPage.view.Details": {
										"ReplaceFacet|SEPMRA_C_PD_Product|ProductReviewFacetID": {
											className: "sap.ui.core.mvc.View",
											viewName: "fixture.application.ext.view.ProductDetailReview",
											type: "XML",
											id: "reviewView",
											"sap.ui.generic.app": {
												title: "Reviews"
											}
										}
									}
								}
							}
						}
					},
					"sap.ui.generic.app": {}
				}
			);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oComponent
				]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("base functionality", function(assert) {
			assert.strictEqual(
				validateStableIds(this.oDesignTime.getElementOverlays(), this.oComponent).length,
				1
			);
		});
	});

	var mManifest = {};

	QUnit.module("Fiori Elements Applications without extensions", {
		beforeEach() {
			this.aDummyOverlays = ["overlay1", "overlay2"];
			this.oComponent = {
				getManifest() {
					return mManifest;
				}
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("V2", function(assert) {
			mManifest = {
				"sap.ui.generic.app": {}
			};

			assert.strictEqual(
				validateStableIds(this.aDummyOverlays, this.oComponent).length,
				0,
				"no unstable overlays returned"
			);
		});

		QUnit.test("V4", function(assert) {
			mManifest = {
				"sap.ui5": {
					dependencies: {
						libs: {
							dummyLibrary: {},
							"sap.fe.templates": {},
							anotherDummyLibrary: {}
						}
					}
				}
			};

			assert.strictEqual(
				validateStableIds(this.aDummyOverlays, this.oComponent).length,
				0,
				"no unstable overlays returned"
			);
		});

		QUnit.test("OVP", function(assert) {
			mManifest = {
				"sap.ovp": {}
			};

			assert.strictEqual(
				validateStableIds(this.aDummyOverlays, this.oComponent).length,
				0,
				"no unstable overlays returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
