/*global QUnit*/
sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/base/util/Deferred"
], function (ComponentContainer, Element, Deferred) {
	"use strict";

	QUnit.module("Integration Tests", {
		before: function () {
			// cleanup loader paths registered by default testsuite config
			sap.ui.loader.config({
				paths: {
					"test-resources": null,
					"testdata/core": null,
					"testlibs": null
				}
			});
		}
	});

	QUnit.test("Basic - with terminology 'transportation'", function (assert) {
		var oComponentCreatedDeferred = new Deferred();
		var oResourceBundleLoadedDeferred = new Deferred();

		var oContainer = new ComponentContainer({
			async: true,
			manifest: false,
			name: "terminologies.sample.application",
			componentCreated: function (oParams) {
				var oComponent = oParams.getParameter("component");

				assert.ok(oComponent, "Component should be available.");

				// The first three pages are statically available
				assert.equal(Element.getElementById("__component0---mainView--appContentOnly_label").getText(), 'I am a Transportation text (application)', "The label text should be verticalized.");
				assert.equal(Element.getElementById("__component0---mainView--appContentOnly_button").getText(), 'Transportation Button (application)', "The button text should be verticalized.");
				assert.equal(Element.getElementById("__xmlview0--reuse_component_common_label").getText(), 'I am a Transportation text (reuse-library)', "The label text inside the reuse view should be verticalized.");
				assert.equal(Element.getElementById("__xmlview0--reuse_component_common_button").getText(), 'Transportation Button (reuse-library)', "The button text inside the reuse view should be verticalized.");

				oComponent.getModel("i18n_reuse_lib_async").getResourceBundle().then(function() {
					assert.equal(Element.getElementById("__component0---mainView--reuse_fragment_label").getText(), 'I am a Transportation text (reuse-library)', "The label text inside the reuse fragment should be verticalized.");
					assert.equal(Element.getElementById("__component0---mainView--reuse_fragment_button").getText(), 'Transportation Button (reuse-library)', "The button text inside the reuse fragment should be verticalized.");
					oResourceBundleLoadedDeferred.resolve();
				});

				// Render nested component
				var oToolPage = oComponent.getRootControl().getContent()[0];
				var oNavContainer = oToolPage.getMainContents()[0];
				var oNestedComponentPage = oNavContainer.getPages()[3];

				// Register componentCreated handler to nested component and navigate there
				var oNestedContainer = oNestedComponentPage.getContent()[0];
				oNestedContainer.attachComponentCreated(function(oParams) {
					var oNestedComponent = oParams.getParameter("component");
					assert.ok(oNestedComponent, "Nested component should be available.");
					assert.equal(Element.getElementById("reuseComponent---reuseDefaultView--reuse_label").getText(), 'I am a Transportation text (reuse-component)', "The label text inside the reuse component should be verticalized.");
					assert.equal(Element.getElementById("reuseComponent---reuseDefaultView--reuse_button").getText(), 'Transportation Button (reuse-component)', "The button text inside the reuse component should be verticalized.");
					assert.equal(Element.getElementById("reuseComponent---reuseDefaultView--reuseCommonView--reuse_component_common_label").getText(), 'I am a Transportation text (reuse-library)', "The label text inside the reuse library of the reuse component should be verticalized.");
					assert.equal(Element.getElementById("reuseComponent---reuseDefaultView--reuseCommonView--reuse_component_common_button").getText(), 'Transportation Button (reuse-library)', "The button text inside the reuse library of the reuse component should be verticalized.");

					oComponentCreatedDeferred.resolve();
				});
				oNavContainer.to(oNestedComponentPage);
			}
		});

		oContainer.placeAt("qunit-fixture");

		return Promise.all([oComponentCreatedDeferred.promise, oResourceBundleLoadedDeferred.promise]).then(function() {
			// cleanup
			oContainer.destroy();
		});
	});

});