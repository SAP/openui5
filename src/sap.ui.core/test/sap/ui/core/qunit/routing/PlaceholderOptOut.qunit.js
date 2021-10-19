/*global QUnit, sinon, hasher*/
sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Placeholder",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/HashChanger",
	"sap/m/Button",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/m/routing/TargetHandler"
	], function(
		LoaderExtensions,
		ComponentContainer,
		Placeholder,
		UIComponent,
		View,
		HashChanger,
		Button,
		NavContainer,
		Page,
		MTargetHandler
	) {

	"use strict";

	QUnit.module("Configuration", {
		beforeEach: function() {
			hasher.setHash("");
		}
	});

	QUnit.test("xx-placeholder config set to 'false", function(assert) {
		// sample js views
		sap.ui.predefine("sap/ui/sample/navigationContainer/NavContainerView", ["sap/ui/core/mvc/View", "sap/m/NavContainer"],
			function(View, NavContainer) {
			return View.extend("sap.ui.sample.navigationContainer.NavContainerView", {
				createContent: function() {
					return new NavContainer(this.createId("navContainer"));
				}
			});
		});

		sap.ui.predefine("sap/ui/sample/navigationContainer/sampleView", ["sap/ui/core/mvc/View", "sap/m/Panel"],
			function(View, Panel) {
			return View.extend("sap.ui.sample.navigationContainer.sampleView", {
				createContent: function() {
					return new Panel(this.createId("panel"));
				}
			});
		});

		sap.ui.predefine("sap/ui/sample/navigationContainer/sampleView2", ["sap/ui/core/mvc/View", "sap/m/Panel"],
			function(View, Panel) {
			return View.extend("sap.ui.sample.navigationContainer.sampleView2", {
				createContent: function() {
					return new Panel(this.createId("panel"));
				}
			});
		});

		// sample component with navigation container
		sap.ui.predefine("sap/ui/sample/navigationcontainer/Component", [], function() {
			return UIComponent.extend("sap.ui.sample.navigationcontainer", {
				metadata : {
					rootView: {
						viewName: "module:sap/ui/sample/navigationContainer/NavContainerView",
						async: true
					},
					routing: {
						config: {
							async: true,
							controlId: "navContainer",
							controlAggregation: "pages",
							routerClass: "sap.m.routing.Router",
							viewType: "JS"
						},
						routes: [{
							pattern: ":?query:",
							name: "home",
							target: {
								name: "home",
								placeholder: {
									autoClose: true,
									html: "my/placeholder.fragment.html"
								}
							}
						},
						{
							pattern: "route1",
							name: "route1",
							target: {
								name: "target1",
								placeholder: {
									autoClose: false,
									html: "my/placeholder.fragment.html"
								}
							}
						}],
						targets: {
							home: {
								name: "module:sap/ui/sample/navigationContainer/sampleView",
								type: "View",
								id: "sampleView"
							},
							target1: {
								name: "module:sap/ui/sample/navigationContainer/sampleView2",
								type: "View",
								id: "sampleView2"
							}
						}
					}
				}
			});
		});

		var oNavConShowPlaceholderSpy = sinon.spy(NavContainer.prototype, "showPlaceholder");
		var oMTargetHandlerSpy = sinon.spy(MTargetHandler.prototype, "showPlaceholder");

		var oRouter;
		var oComponentContainer = new ComponentContainer({
			async: true,
			name: "sap.ui.sample.navigationcontainer"
		});

		oComponentContainer.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		return new Promise(function(resolve, reject) {
			oComponentContainer.attachEvent("componentCreated", function(oEvent) {
				resolve(oEvent.getParameter("component"));
			});
		}).then(function(oComponent) {
			oRouter = oComponent.getRouter();
			oRouter.initialize();

			return new Promise(function(resolve, reject) {
				oRouter.attachEventOnce("routeMatched", function(oEvent) {
					assert.equal(oNavConShowPlaceholderSpy.callCount, 0, "NavContainer.showPlaceholder shouldn't be called");
					assert.equal(oMTargetHandlerSpy.callCount, 0, "TargetHandler.showPlaceholder shouldn't be called");

					oNavConShowPlaceholderSpy.resetHistory();
					resolve(oEvent.getParameter("targetControl"));
				});
			});
		}).then(function(oNavContainer) {
			oRouter.navTo("route1");

			return new Promise(function(resolve, reject) {
				oRouter.attachEventOnce("routeMatched", function(oEvent) {
					assert.equal(oNavConShowPlaceholderSpy.callCount, 0, "NavContainer.showPlaceholder shouldn't be called");
					assert.equal(oMTargetHandlerSpy.callCount, 0, "TargetHandler.showPlaceholder shouldn't be called");
					resolve(oEvent.getParameter("targetControl"));
				});
			});
		}).then(function(oNavContainer) {

			var oLoaderExtensionSpy = sinon.spy(LoaderExtensions, "loadResource");
			oNavContainer.showPlaceholder({
				placeholder: new Placeholder({
					html: "my/placeholder.fragment.html"
				})
			});

			assert.equal(oLoaderExtensionSpy.callCount, 0, "No placeholder should be loaded.");

			oNavContainer.showPlaceholder();
			assert.ok(oNavContainer, "Should not break after showPlaceholder is called");

			oNavContainer.hidePlaceholder();
			assert.ok(oNavContainer, "Should not break after hidePlaceholder is called");

			// cleanup
			oComponentContainer.destroy();
			oNavConShowPlaceholderSpy.restore();
			oMTargetHandlerSpy.restore();
			oLoaderExtensionSpy.restore();
		});
	});
});