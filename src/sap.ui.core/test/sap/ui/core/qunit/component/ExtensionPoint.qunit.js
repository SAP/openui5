sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/ExtensionPoint'
], function(Component, ComponentContainer, ExtensionPoint) {

	"use strict";
	/*global QUnit */

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	// UI Construction
	var oComponent, oComponentContainer;

	function createComponentAndContainer(bWithExtensionProvider, bSync, bLoadCustomizingConfiguration, bWithEmptyExtensionProvider) {
		// load and start the customized application
		if (bWithExtensionProvider) {
			ExtensionPoint.registerExtensionProvider(function() {
				return bWithEmptyExtensionProvider ? undefined : "testdata/customizing/customer/ext/ExtensionPointProvider";
			});
		}

		if (bSync) {
			if (bLoadCustomizingConfiguration) {
				sap.ui.requireSync('sap/ui/core/CustomizingConfiguration');
			}

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
			var p = Promise.resolve();
			if (bLoadCustomizingConfiguration) {
				p = new Promise(function(resolve) {
					sap.ui.require(['sap/ui/core/CustomizingConfiguration'], function() {
						resolve();
					});
				});
			}

			return p.then(function() {
				return Component.create({
					name: "testdata.customizing.customer.ext",
					id: "ExtComponent",
					manifest: false
				});
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
		delete ExtensionPoint._fnExtensionProvider;
		oComponent.destroy();
		oComponentContainer.destroy();
	}

	QUnit.module("ExtensionPoints with Provider (Async)", {
		before: createComponentAndContainer.bind(null, true, false, true, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(9);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

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

	QUnit.test("ExtensionPoint on top-level of XMLView", function(assert) {
		assert.expect(26);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

			var aViewContent = oView.getContent();
			assert.strictEqual(aViewContent.length, 15, "Correct # of controls inside View content aggregation");

			// View Content Aggregation
			assert.strictEqual(aViewContent[0].getId(), "ExtComponent---mainView--zero--defaultButton", "EP0 content is in correct order"); // EP0
			assert.strictEqual(aViewContent[1].getId(), "ExtComponent---mainView--button0", "button0 is in correct order"); // Button0
			assert.strictEqual(aViewContent[2].getId(), "ExtComponent---mainView--Panel", "Panel is in correct order"); // Panel
			assert.strictEqual(aViewContent[3].getId(), "ExtComponent---mainView--button5", "button5 is in correct order"); // button5
			assert.strictEqual(aViewContent[4].getId(), "ExtComponent---mainView--button6", "button6 is in correct order"); // button6
			assert.strictEqual(aViewContent[5].getId(), "ExtComponent---mainView--ep99--button0", "EP99 content is in correct order"); // EP99 button0
			assert.strictEqual(aViewContent[6].getId(), "ExtComponent---mainView--ep99--input0", "EP99 content is in correct order"); // EP99 input0
			assert.strictEqual(aViewContent[7].getId(), "ExtComponent---mainView--ep99--input1", "EP99 content is in correct order"); // EP99 input1
			assert.strictEqual(aViewContent[8].getId(), "ExtComponent---mainView--shifty--customButton1", "shifty Fragment content is in correct order"); // shifty Fragment customButton1
			assert.strictEqual(aViewContent[9].getId(), "ExtComponent---mainView--shifty--customButton2", "shifty Fragment content is in correct order"); // shifty Fragment customButton2
			assert.strictEqual(aViewContent[10].getId(), "ExtComponent---mainView--button7", "button7 is in correct order"); // button7
			assert.strictEqual(aViewContent[11].getId(), "ExtComponent---mainView--tn1--customButton1", "tn1 Fragment is in correct order"); // tn1 Fragment customButton1
			assert.strictEqual(aViewContent[12].getId(), "ExtComponent---mainView--tn1--customButton2", "tn1 Fragment is in correct order"); // tn1 Fragment customButton2
			assert.strictEqual(aViewContent[13].getId(), "ExtComponent---mainView--myTable", "Table is in correct order"); // myTable
			assert.strictEqual(aViewContent[14].getId(), "ExtComponent---mainView--myListItem", "ColumnListItem is in correct order"); // myListItem

			var oTable = aViewContent[13];
			var aTableItems = oTable.getItems();
			assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

			// inner control panel
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

	QUnit.module("ExtensionPoints with Provider BUT no module is returned (Async)", {
		before: createComponentAndContainer.bind(null, true, false, true, true),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(22);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.strictEqual(ExtensionPoint._fnExtensionProvider(), undefined, "ExtensionPointProvider exists, but no module returned");

			var aViewContent = oView.getContent();
			assert.strictEqual(aViewContent.length, 13, "Correct # of controls inside View content aggregation");

			assert.strictEqual(aViewContent[0].getId(), "ExtComponent---mainView--zero--defaultButton", "EP0 is not included: default content is in correct order"); // EP0
			assert.strictEqual(aViewContent[1].getId(), "ExtComponent---mainView--button0", "button0 is in correct order"); // Button0
			assert.strictEqual(aViewContent[2].getId(), "ExtComponent---mainView--Panel", "Panel is in correct order"); // Panel
			assert.strictEqual(aViewContent[3].getId(), "ExtComponent---mainView--button5", "button5 is in correct order"); // button5
			assert.strictEqual(aViewContent[4].getId(), "ExtComponent---mainView--button6", "button6 is in correct order"); // button6
			assert.strictEqual(aViewContent[5].getId(), "ExtComponent---mainView--nine_nine--defaultButton", "EP99 is not included: default content is in correct order"); // EP99 button0
			assert.strictEqual(aViewContent[6].getId(), "ExtComponent---mainView--shifty--customButton1", "shifty Fragment content is in correct order"); // shifty Fragment customButton1
			assert.strictEqual(aViewContent[7].getId(), "ExtComponent---mainView--shifty--customButton2", "shifty Fragment content is in correct order"); // shifty Fragment customButton2
			assert.strictEqual(aViewContent[8].getId(), "ExtComponent---mainView--button7", "button7 is in correct order"); // button7
			assert.strictEqual(aViewContent[9].getId(), "ExtComponent---mainView--tn1--customButton1", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton1
			assert.strictEqual(aViewContent[10].getId(), "ExtComponent---mainView--tn1--customButton2", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton2
			assert.strictEqual(aViewContent[11].getId(), "ExtComponent---mainView--myTable", "Table is in correct order"); // myTable
			assert.strictEqual(aViewContent[12].getId(), "ExtComponent---mainView--myListItem", "ColumnListItem is in correct order"); // myListItem

			// table
			var oTable = aViewContent[11];
			var aTableItems = oTable.getItems();
			assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

			// panel
			var aPanelContent = oView.byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main
		});
	});

	QUnit.module("ExtensionPoint w/o Provider (Async)", {
		before: createComponentAndContainer.bind(null, false, false, true, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(22);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.ok(!ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

			var aViewContent = oView.getContent();
			assert.strictEqual(aViewContent.length, 13, "Correct # of controls inside View content aggregation");

			assert.strictEqual(aViewContent[0].getId(), "ExtComponent---mainView--zero--defaultButton", "EP0 is not included: default content is in correct order"); // EP0
			assert.strictEqual(aViewContent[1].getId(), "ExtComponent---mainView--button0", "button0 is in correct order"); // Button0
			assert.strictEqual(aViewContent[2].getId(), "ExtComponent---mainView--Panel", "Panel is in correct order"); // Panel
			assert.strictEqual(aViewContent[3].getId(), "ExtComponent---mainView--button5", "button5 is in correct order"); // button5
			assert.strictEqual(aViewContent[4].getId(), "ExtComponent---mainView--button6", "button6 is in correct order"); // button6
			assert.strictEqual(aViewContent[5].getId(), "ExtComponent---mainView--nine_nine--defaultButton", "EP99 is not included: default content is in correct order"); // EP99 button0
			assert.strictEqual(aViewContent[6].getId(), "ExtComponent---mainView--shifty--customButton1", "shifty Fragment content is in correct order"); // shifty Fragment customButton1
			assert.strictEqual(aViewContent[7].getId(), "ExtComponent---mainView--shifty--customButton2", "shifty Fragment content is in correct order"); // shifty Fragment customButton2
			assert.strictEqual(aViewContent[8].getId(), "ExtComponent---mainView--button7", "button7 is in correct order"); // button7
			assert.strictEqual(aViewContent[9].getId(), "ExtComponent---mainView--tn1--customButton1", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton1
			assert.strictEqual(aViewContent[10].getId(), "ExtComponent---mainView--tn1--customButton2", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton2
			assert.strictEqual(aViewContent[11].getId(), "ExtComponent---mainView--myTable", "Table is in correct order"); // myTable
			assert.strictEqual(aViewContent[12].getId(), "ExtComponent---mainView--myListItem", "ColumnListItem is in correct order"); // myListItem

			// table
			var oTable = aViewContent[11];
			var aTableItems = oTable.getItems();
			assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

			// panel
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
		before: createComponentAndContainer.bind(null, true, true, true, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(9);
		var done = assert.async();

		var oView = oComponent.getRootControl();

		var fnAssert = function() {
			var aPanelContent = oView.byId("Panel").getContent();
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

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

	QUnit.test("ExtensionPoint on top-level of XMLView", function(assert) {
		assert.expect(26);
		var done = assert.async();

		var oView = oComponent.getRootControl();

		var fnAssert = function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider was added");

			var aViewContent = oView.getContent();
			assert.strictEqual(aViewContent.length, 15, "Correct # of controls inside View content aggregation");

			// View Content Aggregation
			assert.strictEqual(aViewContent[0].getId(), "ExtComponent---mainView--zero--defaultButton", "EP0 content is in correct order"); // EP0
			assert.strictEqual(aViewContent[1].getId(), "ExtComponent---mainView--button0", "button0 is in correct order"); // Button0
			assert.strictEqual(aViewContent[2].getId(), "ExtComponent---mainView--Panel", "Panel is in correct order"); // Panel
			assert.strictEqual(aViewContent[3].getId(), "ExtComponent---mainView--button5", "button5 is in correct order"); // button5
			assert.strictEqual(aViewContent[4].getId(), "ExtComponent---mainView--button6", "button6 is in correct order"); // button6
			assert.strictEqual(aViewContent[5].getId(), "ExtComponent---mainView--ep99--button0", "EP99 content is in correct order"); // EP99 button0
			assert.strictEqual(aViewContent[6].getId(), "ExtComponent---mainView--ep99--input0", "EP99 content is in correct order"); // EP99 input0
			assert.strictEqual(aViewContent[7].getId(), "ExtComponent---mainView--ep99--input1", "EP99 content is in correct order"); // EP99 input1
			assert.strictEqual(aViewContent[8].getId(), "ExtComponent---mainView--shifty--customButton1", "shifty Fragment content is in correct order"); // shifty Fragment customButton1
			assert.strictEqual(aViewContent[9].getId(), "ExtComponent---mainView--shifty--customButton2", "shifty Fragment content is in correct order"); // shifty Fragment customButton2
			assert.strictEqual(aViewContent[10].getId(), "ExtComponent---mainView--button7", "button7 is in correct order"); // button7
			assert.strictEqual(aViewContent[11].getId(), "ExtComponent---mainView--tn1--customButton1", "tn1 Fragment is in correct order"); // tn1 Fragment customButton1
			assert.strictEqual(aViewContent[12].getId(), "ExtComponent---mainView--tn1--customButton2", "tn1 Fragment is in correct order"); // tn1 Fragment customButton2
			assert.strictEqual(aViewContent[13].getId(), "ExtComponent---mainView--myTable", "Table is in correct order"); // myTable
			assert.strictEqual(aViewContent[14].getId(), "ExtComponent---mainView--myListItem", "ColumnListItem is in correct order"); // myListItem

			// table
			var oTable = aViewContent[13];
			var aTableItems = oTable.getItems();
			assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

			// inner control panel
			var aPanelContent = oView.byId("Panel").getContent();
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
			var aPanelContent = oView.getContent();
			if (aPanelContent.length == 15) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);

	});

	QUnit.module("ExtensionPoints with Provider BUT no module is returned (Sync)", {
		before: createComponentAndContainer.bind(null, true, true, true, true),
		after: destroyComponentAndContainer
	});

	/**
	 * Note:
	 * Without a provider, we don't need to poll the aggregation for ExtensionPoint content,
	 * since the default content in this test is inserted sync anyway.
	 */
	QUnit.test("simple resolution", function(assert) {
		assert.expect(22);
		var oView = oComponent.getRootControl();

		assert.strictEqual(ExtensionPoint._fnExtensionProvider(), undefined, "ExtensionPointProvider exists, but no module returned");

		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 13, "Correct # of controls inside View content aggregation");

		assert.strictEqual(aViewContent[0].getId(), "ExtComponent---mainView--zero--defaultButton", "EP0 is not included: default content is in correct order"); // EP0
		assert.strictEqual(aViewContent[1].getId(), "ExtComponent---mainView--button0", "button0 is in correct order"); // Button0
		assert.strictEqual(aViewContent[2].getId(), "ExtComponent---mainView--Panel", "Panel is in correct order"); // Panel
		assert.strictEqual(aViewContent[3].getId(), "ExtComponent---mainView--button5", "button5 is in correct order"); // button5
		assert.strictEqual(aViewContent[4].getId(), "ExtComponent---mainView--button6", "button6 is in correct order"); // button6
		assert.strictEqual(aViewContent[5].getId(), "ExtComponent---mainView--nine_nine--defaultButton", "EP99 is not included: default content is in correct order"); // EP99 button0
		assert.strictEqual(aViewContent[6].getId(), "ExtComponent---mainView--shifty--customButton1", "shifty Fragment content is in correct order"); // shifty Fragment customButton1
		assert.strictEqual(aViewContent[7].getId(), "ExtComponent---mainView--shifty--customButton2", "shifty Fragment content is in correct order"); // shifty Fragment customButton2
		assert.strictEqual(aViewContent[8].getId(), "ExtComponent---mainView--button7", "button7 is in correct order"); // button7
		assert.strictEqual(aViewContent[9].getId(), "ExtComponent---mainView--tn1--customButton1", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton1
		assert.strictEqual(aViewContent[10].getId(), "ExtComponent---mainView--tn1--customButton2", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton2
		assert.strictEqual(aViewContent[11].getId(), "ExtComponent---mainView--myTable", "Table is in correct order"); // myTable
		assert.strictEqual(aViewContent[12].getId(), "ExtComponent---mainView--myListItem", "ColumnListItem is in correct order"); // myListItem

		// table
		var oTable = aViewContent[11];
		var aTableItems = oTable.getItems();
		assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

		// panel
		var aPanelContent = oView.byId("Panel").getContent();
		assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

		assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
		assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main
	});


	QUnit.module("ExtensionPoints w/o Provider (Sync)", {
		before: createComponentAndContainer.bind(null, false, true, true, false),
		after: destroyComponentAndContainer
	});

	/**
	 * Note:
	 * Without a provider, we don't need to poll the aggregation for ExtensionPoint content,
	 * since the default content in this test is inserted sync anyway.
	 */
	QUnit.test("simple resolution", function(assert) {
		assert.expect(22);
		var oView = oComponent.getRootControl();

		assert.ok(!ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 13, "Correct # of controls inside View content aggregation");

		assert.strictEqual(aViewContent[0].getId(), "ExtComponent---mainView--zero--defaultButton", "EP0 is not included: default content is in correct order"); // EP0
		assert.strictEqual(aViewContent[1].getId(), "ExtComponent---mainView--button0", "button0 is in correct order"); // Button0
		assert.strictEqual(aViewContent[2].getId(), "ExtComponent---mainView--Panel", "Panel is in correct order"); // Panel
		assert.strictEqual(aViewContent[3].getId(), "ExtComponent---mainView--button5", "button5 is in correct order"); // button5
		assert.strictEqual(aViewContent[4].getId(), "ExtComponent---mainView--button6", "button6 is in correct order"); // button6
		assert.strictEqual(aViewContent[5].getId(), "ExtComponent---mainView--nine_nine--defaultButton", "EP99 is not included: default content is in correct order"); // EP99 button0
		assert.strictEqual(aViewContent[6].getId(), "ExtComponent---mainView--shifty--customButton1", "shifty Fragment content is in correct order"); // shifty Fragment customButton1
		assert.strictEqual(aViewContent[7].getId(), "ExtComponent---mainView--shifty--customButton2", "shifty Fragment content is in correct order"); // shifty Fragment customButton2
		assert.strictEqual(aViewContent[8].getId(), "ExtComponent---mainView--button7", "button7 is in correct order"); // button7
		assert.strictEqual(aViewContent[9].getId(), "ExtComponent---mainView--tn1--customButton1", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton1
		assert.strictEqual(aViewContent[10].getId(), "ExtComponent---mainView--tn1--customButton2", "EP23 is not included: default content is in correct order"); // tn1 Fragment customButton2
		assert.strictEqual(aViewContent[11].getId(), "ExtComponent---mainView--myTable", "Table is in correct order"); // myTable
		assert.strictEqual(aViewContent[12].getId(), "ExtComponent---mainView--myListItem", "ColumnListItem is in correct order"); // myListItem

		// table
		var oTable = aViewContent[11];
		var aTableItems = oTable.getItems();
		assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

		// panel
		var aPanelContent = oView.byId("Panel").getContent();
		assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

		assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
		assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main
	});

});