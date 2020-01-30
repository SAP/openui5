sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/ExtensionPoint',
	"testdata/customizing/customer/ext/ExtensionPointProvider"
], function(Component, ComponentContainer, ExtensionPoint, ExtensionPointProvider) {

	"use strict";
	/*global QUnit */

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	// UI Construction
	var oComponent, oComponentContainer;

	function createComponentAndContainer(bWithExtensionProvider, bSync) {
		// load and start the customized application
		if (bWithExtensionProvider) {
			ExtensionPoint.registerExtensionProvider("testdata/customizing/customer/ext/ExtensionPointProvider");
		}

		if (bSync) {
			oComponent = sap.ui.component({
				name: "testdata.customizing.customer.ext.sync",
				id: "ExtComponent",
				manifest: false,
				async: false
			});
			oComponentContainer = new ComponentContainer({
				component: oComponent
			});
			oComponentContainer.placeAt("content");
			sap.ui.getCore().applyChanges();
		} else {
			return Component.create({
				name: "testdata.customizing.customer.ext",
				id: "ExtComponent",
				manifest: false
			}).then(function(_oComp) {
				oComponent = _oComp;
				oComponentContainer = new ComponentContainer({
					component: oComponent
				});
				oComponentContainer.placeAt("content");
				return oComponent.getRootControl().loaded();
			}).then(function() {
				sap.ui.getCore().applyChanges();
			});
		}
	}

	function destroyComponentAndContainer() {
		delete ExtensionPoint._sExtensionProvider;
		oComponent.destroy();
		oComponentContainer.destroy();
	}

	QUnit.module("ExtensionPoints with Provider (Async)", {
		before: createComponentAndContainer.bind(null, true, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("CustomizingConfiguration available", function(assert) {
		assert.expect(1);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.ok(!CustomizingConfiguration, "No CustomizingConfiguration should be available");
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(9);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.ok(ExtensionPoint._sExtensionProvider, "ExtensionPointProvider added");

			var aPanelContent = oView.byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 7, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--customFragment--customButton1", "EP1 content is in correct order"); // EP1
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--customFragment--customButton2", "EP1 content is in correct order"); // EP1
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[5].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[6].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main
		});

	});

	QUnit.module("ExtensionPoint w/o Provider (Async)", {
		before: createComponentAndContainer.bind(null, false, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(7);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.ok(!ExtensionPoint._sExtensionProvider, "ExtensionPointProvider added");

			var aPanelContent = oView.byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main
		});
	});


	QUnit.module("ExtensionPoints with Provider (Sync)", {
		before: createComponentAndContainer.bind(null, true, true),
		after: destroyComponentAndContainer
	});

	QUnit.test("CustomizingConfiguration available", function(assert) {
		assert.expect(1);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.ok(!CustomizingConfiguration, "No CustomizingConfiguration should be available");
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(9);
		var done = assert.async();

		var oView = oComponent.getRootControl();

		var fnAssert = function() {
			var aPanelContent = oView.byId("Panel").getContent();
			assert.ok(ExtensionPoint._sExtensionProvider, "ExtensionPointProvider added");

			assert.strictEqual(aPanelContent.length, 7, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--customFragment--customButton1", "EP1 content is in correct order"); // EP1
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--customFragment--customButton2", "EP1 content is in correct order"); // EP1
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[5].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[6].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent = oView.byId("Panel").getContent();
			if (aPanelContent.length == 7) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);

	});

	QUnit.module("ExtensionPoints w/o Provider (Sync)", {
		before: createComponentAndContainer.bind(null, false, true),
		after: destroyComponentAndContainer
	});

	/**
	 * Note:
	 * Without a provider, we don't need to poll the aggregation for ExtensionPoint content,
	 * since the default content in this test is inserted sync anyway.
	 */
	QUnit.test("simple resolution", function(assert) {
		assert.expect(7);
		var oView = oComponent.getRootControl();

		assert.ok(!ExtensionPoint._sExtensionProvider, "ExtensionPointProvider added");

		var aPanelContent = oView.byId("Panel").getContent();
		assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

		assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
		assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main
	});

});