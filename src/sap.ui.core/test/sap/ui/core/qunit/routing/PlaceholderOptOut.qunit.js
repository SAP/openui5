/*global QUnit, sinon, hasher*/
sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Placeholder",
	"sap/m/NavContainer",
	"sap/m/routing/TargetHandler",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/routing/Router" /* need to require this module to correctly resolve router class in manifest */
	], function(
		LoaderExtensions,
		ComponentContainer,
		Placeholder,
		NavContainer,
		MTargetHandler,
		nextUIUpdate
	) {

	"use strict";

	QUnit.module("Configuration", {
		beforeEach: function() {
			hasher.setHash("");
		}
	});

	QUnit.test("xx-placeholder config set to 'false'", async function(assert) {
		var oNavConShowPlaceholderSpy = sinon.spy(NavContainer.prototype, "showPlaceholder");
		var oMTargetHandlerSpy = sinon.spy(MTargetHandler.prototype, "showPlaceholder");

		var oRouter;
		var oComponentContainer = new ComponentContainer({
			async: true,
			name: "qunit.placeholder.component.NavContainerOptOut"
		});

		oComponentContainer.placeAt("qunit-fixture");

		await nextUIUpdate();

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