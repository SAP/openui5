/*global QUnit sinon */
sap.ui.define([
	'sap/ui/qunit/QUnitUtils',
	"sap/ui/qunit/utils/nextUIUpdate",
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/core/mvc/XMLProcessingMode'
], function(QUnitUtils, nextUIUpdate, Component, ComponentContainer, XMLTemplateProcessor, XMLProcessingMode) {
	"use strict";

	/**
	 * README: Test-Setup
	 *
	 * For each test there is a testdata folder 'testdata.customizing.async.*' including
	 * - the 'sap' folder, which contains base component and
	 * - the 'customer' folder, which contains the extension and customizing
	 *
	 * The customizing configuration is defined either in the component metadata
	 * or in the corresponding manifest.json.
	 */

	QUnit.module("No interface", {

		before: function() {
			this.oXMLTPSpy = sinon.spy(XMLTemplateProcessor, "parseTemplatePromise");
			return new Promise(function (resolve, reject) {
				sap.ui.require(["sap/ui/core/mvc/XMLView"], resolve, reject);
			});
		},
		beforeEach: function() {
			this.oXMLTPSpy.resetHistory();
		},
		after: function() {
			this.oXMLTPSpy.restore();
		}
	});

	QUnit.test("ExtensionPoint contains async View/Fragment", function(assert) {
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/customizing/async/noInterface/customer/manifest.json");
		var oRootComponent;

		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.noInterface.customer",
			manifest: sManifestUrl
		})
		.then(function(oComponent) {
			oRootComponent = oComponent;
			assert.ok(oComponent, "Component created successfully.");

			return oComponent.getRootControl().loaded();
		})
		.then(function(oRootView) {
			assert.equal(this.oXMLTPSpy.callCount, 5, "3 async XMLViews and 2 XML Fragment processed.");
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oRootView._sProcessingMode, XMLProcessingMode.Sequential, "Root view should be processed 'Sequential'");

			var aViewContent = oRootView.getContent();
			assert.equal(aViewContent.length, 6, "Correct amount of top-level controls.");

			assert.equal(aViewContent[0], oRootView.byId("outerView_button_before"), "Button before ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[1], oRootView.byId("extPoint1View"), "View from ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[2], oRootView.byId("myCustomerComponent---mainView--extPoint2Fragment--buttonExtPoint2_1"), "Button from ExtensionPoint2 is at the correct position.");
			assert.equal(aViewContent[3], oRootView.byId("myCustomerComponent---mainView--extPoint2Fragment--buttonExtPoint2_2"), "Button from ExtensionPoint2 is at the correct position.");
			assert.equal(aViewContent[4], oRootView.byId("myCustomerComponent---mainView--extPoint2Fragment--extPoint3View"), "View from ExtensionPoint3 is at the correct position.");
			assert.equal(aViewContent[5], oRootView.byId("outerView_button_after"), "Button after ExtensionPoint is at the correct position.");

			var oExtPoint1View = oRootView.byId("extPoint1View");

			return oExtPoint1View.loaded();
		}.bind(this))
		.then(function(oExtensionView) {
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oExtensionView._sProcessingMode, XMLProcessingMode.Sequential, "ExtPoint1View should be processed 'Sequential'");

			var aExtPoint1Content = oExtensionView.getContent();
			assert.equal(aExtPoint1Content.length, 2, "Correct amount controls inside ExtensionPoint View.");
			assert.equal(aExtPoint1Content[0], oExtensionView.byId("buttonExtPoint1_1"), "Button1 inside ExtensionPoint View is at the correct position.");
			assert.equal(aExtPoint1Content[1], oExtensionView.byId("buttonExtPoint1_2"), "Button2 inside ExtensionPoint View is at the correct position.");


			return oRootComponent.getRootControl()
				.byId("myCustomerComponent---mainView--extPoint2Fragment--extPoint3View").loaded();

		})
		.then(function(oExtPoint3View) {
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oExtPoint3View._sProcessingMode, XMLProcessingMode.Sequential, "ExtPoint3View should be processed 'Sequential'");

			var aExtPoint3Content = oExtPoint3View.getContent();
			assert.equal(aExtPoint3Content[0],
				oExtPoint3View.byId("extPoint4Fragment--buttonExtPoint4_1"),
				"Button1 inside ExtensionPoint View is at the correct position.");
			assert.equal(aExtPoint3Content[1],
				oExtPoint3View.byId("extPoint4Fragment--buttonExtPoint4_2"),
				"Button2 inside ExtensionPoint View is at the correct position.");

			// cleanup
			oRootComponent.destroy();
		});
	});

	QUnit.module("sap.ui.core.IAsyncContentCreation", {
		before: function() {
			this.oXMLTPSpy = sinon.spy(XMLTemplateProcessor, "parseTemplatePromise");
		},
		beforeEach: function() {
			this.oXMLTPSpy.resetHistory();
		},
		after: function() {
			this.oXMLTPSpy.restore();
		}
	});

	QUnit.test("ViewReplacements & ViewModifications", function(assert) {
		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.viewReplacements.customer",
			manifest: false
		})
		.then(function(oComponent) {
			assert.ok(oComponent, "Component created successfully.");
			assert.ok(oComponent.isA("sap.ui.core.IAsyncContentCreation"), "Component implements 'sap.ui.core.IAsyncContentCreation' interface.");
			assert.equal(this.oXMLTPSpy.callCount, 2, "Two async XMLViews processed.");

			var oView = oComponent.getRootControl();
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "Root view should be processed 'Sequential'");

			var aViewContent = oView.getContent();
			assert.equal(aViewContent.length, 1, "Correct amount of top-level controls.");
			assert.equal(aViewContent[0], oView.byId("xmlView1"), "Nested XMLView should be available.");

			var oNestedView = oView.byId("xmlView1");
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oNestedView._sProcessingMode, XMLProcessingMode.Sequential, "Nested view should be processed 'Sequential'");

			var aNestedViewContent = oNestedView.getContent();
			assert.equal(aNestedViewContent.length, 1, "Correct amount of controls inside nested view.");
			assert.equal(aNestedViewContent[0], oNestedView.byId("textXMLView1Replacement"), "ViewReplacement was successful.");

			// view modification available for control with id 'textXMLView1Replacement'
			assert.equal(oNestedView.byId("textXMLView1Replacement").getVisible(), false, "Text control shouldn't be visible through view modification");

			// cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("ExtensionPoints - default content", function(assert) {
		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.viewExtensions.customer",
			manifest: false
		})
		.then(function(oComponent) {
			assert.ok(oComponent, "Component created successfully.");
			assert.ok(oComponent.isA("sap.ui.core.IAsyncContentCreation"), "Component implements 'sap.ui.core.IAsyncContentCreation' interface.");
			assert.equal(this.oXMLTPSpy.callCount, 2, "Two async XMLViews processed.");

			var oView = oComponent.getRootControl();
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "Root view should be processed 'Sequential'");

			var aViewContent = oView.getContent();
			assert.equal(aViewContent.length, 5, "Correct amount of top-level controls.");
			assert.equal(aViewContent[0], oView.byId("outerView_button_before"), "Button before ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[1], oView.byId("outerView_buttonInDefaultContent_before"), "Button before nested View in default content is at the correct position.");
			assert.equal(aViewContent[2], oView.byId("innerView"), "Nested View in default content is at the correct position.");
			assert.equal(aViewContent[3], oView.byId("outerView_buttonInDefaultContent_after"), "Button after nested View in default content is at the correct position.");
			assert.equal(aViewContent[4], oView.byId("outerView_button_after"), "Button after ExtensionPoint is at the correct position.");

			var oNestedView = oView.byId("innerView");
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oNestedView._sProcessingMode, XMLProcessingMode.Sequential, "Nested view should be processed 'Sequential'");

			var aNestedViewContent = oNestedView.getContent();
			assert.equal(aNestedViewContent.length, 1, "Correct amount of controls inside nested view.");
			assert.equal(aNestedViewContent[0], oNestedView.byId("buttonXMLView1"), "Button inside inner view is available.");

			// cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("ExtensionPoint contains async View/Fragment", function(assert) {
		// Create component with manifest containing viewExtensions
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/customizing/async/viewExtensions/customer/manifest.json");

		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.viewExtensions.customer",
			manifest: sManifestUrl
		})
		.then(function(oComponent) {
			assert.ok(oComponent, "Component created successfully.");
			assert.ok(oComponent.isA("sap.ui.core.IAsyncContentCreation"), "Component implements 'sap.ui.core.IAsyncContentCreation' interface.");
			assert.equal(this.oXMLTPSpy.callCount, 3, "2 async XMLViews and 1 XML Fragment processed.");

			var oView = oComponent.getRootControl();
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "Root view should be processed 'Sequential'");

			var aViewContent = oView.getContent();
			assert.equal(aViewContent.length, 5, "Correct amount of top-level controls.");

			assert.equal(aViewContent[0], oView.byId("outerView_button_before"), "Button before ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[1], oView.byId("extPoint1View"), "View from ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[2], oView.byId("myCustomerComponent---mainView--extPoint2Fragment--buttonExtPoint2_1"), "Button from ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[3], oView.byId("myCustomerComponent---mainView--extPoint2Fragment--buttonExtPoint2_2"), "Button from ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[4], oView.byId("outerView_button_after"), "Button after ExtensionPoint is at the correct position.");

			var oExtPoint1View = oView.byId("extPoint1View");
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oExtPoint1View._sProcessingMode, XMLProcessingMode.Sequential, "ExtPoint1View should be processed 'Sequential'");

			var aExtPoint1Content = oExtPoint1View.getContent();
			assert.equal(aExtPoint1Content.length, 2, "Correct amount controls inside ExtensionPoint View.");
			assert.equal(aExtPoint1Content[0], oExtPoint1View.byId("buttonExtPoint1_1"), "Button1 inside ExtensionPoint View is at the correct position.");
			assert.equal(aExtPoint1Content[0].getVisible(), false, "Button1 inside ExtensionPoint View shouldn't be visible.");

			assert.equal(aExtPoint1Content[1], oExtPoint1View.byId("buttonExtPoint1_2"), "Button2 inside ExtensionPoint View is at the correct position.");

			// cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("ControllerReplacements", function(assert) {
		var oComponentContainer;

		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.controllerReplacements.customer",
			manifest: false
		})
		.then(function(oComponent) {
			assert.ok(oComponent, "Component created successfully.");
			assert.ok(oComponent.isA("sap.ui.core.IAsyncContentCreation"), "Component implements 'sap.ui.core.IAsyncContentCreation' interface.");
			assert.equal(this.oXMLTPSpy.callCount, 2, "2 async XMLViews processed.");

			// render component
			oComponentContainer = new ComponentContainer({
				component: oComponent
			}).placeAt("qunit-fixture");

			return oComponent.getRootControl().loaded();
		}.bind(this))
		.then(async function(oRootView) {
			await nextUIUpdate();
			return new Promise(function(res, rej) {
				/**
				 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
				 */
				assert.equal(oRootView._sProcessingMode, XMLProcessingMode.Sequential, "Root view should be processed 'Sequential'");

				var oNestedView = oRootView.byId("xmlView1");
				/**
				 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
				 */
				assert.equal(oRootView._sProcessingMode, XMLProcessingMode.Sequential, "Nested view should be processed 'Sequential'");

				var oButton = oNestedView.byId("buttonXMLView1");

				// triggers press event
				QUnitUtils.triggerEvent("tap", oButton.getDomRef());

				res(oComponentContainer);
			});
		})
		.then(function(oComponentContainer) {
			// cleanup
			oComponentContainer.destroy();
		});
	});

	QUnit.test("Integration - Typed View", function(assert) {
		/**
		 * Test with TypedView, viewExtensions and viewModification
		 */
		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.integration.customer",
			manifest: false
		})
		.then(function(oComponent) {
			assert.ok(oComponent, "Component created successfully.");
			assert.ok(oComponent.isA("sap.ui.core.IAsyncContentCreation"), "Component implements 'sap.ui.core.IAsyncContentCreation' interface.");
			assert.equal(this.oXMLTPSpy.callCount, 3, "2 async XMLViews and 1 XML Fragment processed.");

			var oRootView = oComponent.getRootControl();
			/**
			 * @deprecated because 'Sequential' will be the only mode that is supported in the next major release
			 */
			assert.equal(oRootView._sProcessingMode, XMLProcessingMode.Sequential, "Root view should be processed 'Sequential'");

			var aRootViewContent = oRootView.getContent();
			assert.equal(aRootViewContent.length, 1, "Correct amount of top-level controls");

			var oNestedTypedView = oRootView.byId("myTypedView");
			assert.ok(oNestedTypedView.isA("testdata.customizing.async.integration.sap.views.JSView1"), "Nested view should be typed view");

			var aNestedTypedViewContent = oNestedTypedView.getContent();
			assert.equal(aNestedTypedViewContent.length, 3, "Correct amount of top-level controls");

			// three VerticalLayout controls on top-level
			var oLayout1 = aNestedTypedViewContent[0];
			var oLayout2 = aNestedTypedViewContent[1];
			var oLayout3 = aNestedTypedViewContent[2];

			// Layout1
			var aLayout1Content = oLayout1.getContent();
			assert.equal(aLayout1Content.length, 3, "Correct amount of top-level controls inside layout 1");
			assert.ok(aLayout1Content[0].isA("sap.m.Button"), "Button before ExtensionPoint is at the correct position");

			assert.ok(aLayout1Content[1].isA("sap.ui.core.mvc.XMLView"), "View from ExtensionPoint is at the correct position");
			var oExtPointXMLView = aLayout1Content[1];
			var aExtPointXMLViewContent = oExtPointXMLView.getContent();
			assert.equal(aExtPointXMLViewContent.length, 2, "Correct amount of top-level controls inside layout ExtensionPoint View");
			assert.equal(aExtPointXMLViewContent[0], oExtPointXMLView.byId("buttonExtPoint1_1"), "Button1 inside ExtensionPoint is at the correct position");
			assert.equal(aExtPointXMLViewContent[0].getVisible(), false, "buttonExtPoint1_1 shouldn't be visible through viewModifications");
			assert.equal(aExtPointXMLViewContent[1], oExtPointXMLView.byId("buttonExtPoint1_2"), "Button1 inside ExtensionPoint is at the correct position");

			assert.ok(aLayout1Content[2].isA("sap.m.Button"), "Button after ExtensionPoint is at the correct position");

			// Layout2
			var aLayout2Content = oLayout2.getContent();
			assert.equal(aLayout2Content.length, 2, "Correct amount of top-level controls inside layout 2");
			assert.ok(aLayout2Content[0].getId().includes("buttonExtPoint2_1"), "Button1 from ExtensionPoint is at the correct position");
			assert.equal(aLayout2Content[0].getVisible(), false, "buttonExtPoint2_1 shouldn't be visible through viewModifications");
			assert.ok(aLayout2Content[1].getId().includes("buttonExtPoint2_2"), "Button2 from ExtensionPoint is at the correct position");

			// Layout3
			var aLayout3Content = oLayout3.getContent();
			assert.equal(aLayout3Content.length, 6, "Correct amount of top-level controls inside layout 3");
			assert.equal(aLayout3Content[0].getId(), "customizableText1", "Text control is at the correct position");
			assert.equal(aLayout3Content[0].getVisible(), false, "customizableText1 shouldn't be visible through viewModifications");

			assert.equal(aLayout3Content[1].getId(), "myCustomerComponent---mainView--myTypedView--defaultContentText1", "Text control is at the correct position");
			assert.equal(aLayout3Content[2].getId(), "myCustomerComponent---mainView--myTypedView--defaultContentText2", "Text control is at the correct position");
			assert.equal(aLayout3Content[3].getId(), "myCustomerComponent---mainView--myTypedView--defaultContentText3", "Text control is at the correct position");
			assert.equal(aLayout3Content[4].getId(), "myCustomerComponent---mainView--myTypedView--defaultContentText4", "Text control is at the correct position");
			assert.equal(aLayout3Content[5].getId(), "myCustomerComponent---mainView--myTypedView--defaultContentText5", "Text control is at the correct position");

			// cleanup
			oComponent.destroy();
		}.bind(this));
	});
});