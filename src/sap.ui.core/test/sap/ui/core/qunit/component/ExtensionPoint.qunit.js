sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/core/ExtensionPoint',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/Fragment',
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Component, ComponentContainer, XMLTemplateProcessor, ExtensionPoint, XMLView, Fragment, nextUIUpdate) {

	"use strict";
	/*global QUnit, sinon */

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	// UI Construction
	var oComponent, oComponentContainer;

	function createComponentAndContainer(bWithExtensionProvider, bWithEmptyExtensionProvider) {
		// load and start the customized application
		if (bWithExtensionProvider) {
			ExtensionPoint.registerExtensionProvider(function() {
				return bWithEmptyExtensionProvider ? undefined : "testdata/customizing/customer/ext/ExtensionPointProvider";
			});
		}

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
		}).then(nextUIUpdate);
	}

	function destroyComponentAndContainer() {
		delete ExtensionPoint._fnExtensionProvider;
		oComponent.destroy();
		oComponentContainer.destroy();
	}

	QUnit.module("ExtensionPoints with Provider (Async)", {
		beforeEach: createComponentAndContainer.bind(null, true, false),
		afterEach: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", async function(assert) {
		assert.expect(31);
		var oView = oComponent.getRootControl();
		await oView.loaded();

		assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

		// panel content
		var oPanel = oView.byId("Panel");
		var aPanelContent = oPanel.getContent();

		assert.strictEqual(aPanelContent.length, 7, "ExtensionView content added to view");

		assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--customFragment--customButton1", "EP1 content is in correct order"); // EP1
		assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--customFragment--customButton2", "EP1 content is in correct order"); // EP1
		assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[5].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
		assert.strictEqual(aPanelContent[6].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main

		// view content on top level
		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 33, "Correct # of controls inside View content aggregation");

		assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[31].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[32].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

		var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
		assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

		// Wait for nested View and its EPs (id: EPinBinding_in_nestedView, s.a.) in nested View should be available
		const oNestedView = aViewContent[32];
		await oNestedView.loaded();
		assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
		assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
	});

	QUnit.test("ExtensionPoint on top-level of XMLView", async function(assert) {
		assert.expect(51);
		var oView = oComponent.getRootControl();
		await oView.loaded();

		assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 33, "Correct # of controls inside View content aggregation");

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
		assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[31].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[32].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

		var oTable = aViewContent[13];
		var aTableItems = oTable.getItems();
		assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

		// inner control panel
		var oPanel = oView.byId("Panel");
		var aPanelContent = oPanel.getContent();
		assert.strictEqual(aPanelContent.length, 7, "ExtensionView content added to view");

		assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--customFragment--customButton1", "EP1 content is in correct order"); // EP1
		assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--customFragment--customButton2", "EP1 content is in correct order"); // EP1
		assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aPanelContent[5].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
		assert.strictEqual(aPanelContent[6].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main

		// check rendering result for top-level extension points
		// EP0
		assert.ok(oView.byId("zero--defaultButton").getDomRef(), "Default Button in EP_Zero is rendered");
		// EP99
		assert.ok(oView.byId("ep99--button0").getDomRef(), "Button 0 from EP99 is rendered");
		assert.ok(oView.byId("ep99--input0").getDomRef(), "Input 0 from EP99 is rendered");
		assert.ok(oView.byId("ep99--input1").getDomRef(), "Input 1 from EP99 is rendered");

		var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
		assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

		// Wait for nested View and its EPs (id: EPinBinding_in_nestedView, s.a.) in nested View should be available
		const oNestedView = aViewContent[32];
		await oNestedView.loaded();
		assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
		assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
	});

	QUnit.module("ExtensionPoints with Provider BUT no module is returned (Async)", {
		before: createComponentAndContainer.bind(null, true, true),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(43);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.strictEqual(ExtensionPoint._fnExtensionProvider(), undefined, "ExtensionPointProvider exists, but no module returned");

			var aViewContent = oView.getContent();
			assert.strictEqual(aViewContent.length, 31, "Correct # of controls inside View content aggregation");

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
			assert.strictEqual(aViewContent[13].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[14].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

			// table
			var oTable = aViewContent[11];
			var aTableItems = oTable.getItems();
			assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

			// panel
			var oPanel = oView.byId("Panel");
			var aPanelContent = oPanel.getContent();
			assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main

			var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
			assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

			// Default content for EPs in nested View should be available
			var oNestedView = aViewContent[30];
			return oNestedView.loaded().then(function() {
				assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
				assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
			});
		});
	});

	QUnit.module("ExtensionPoint w/o Provider (Async)", {
		before: createComponentAndContainer.bind(null, false, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(42);
		var oView = oComponent.getRootControl();
		return oView.loaded().then(function() {
			assert.ok(!ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

			var aViewContent = oView.getContent();
			assert.strictEqual(aViewContent.length, 31, "Correct # of controls inside View content aggregation");

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
			assert.strictEqual(aViewContent[13].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[14].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
			assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

			// table
			var oTable = aViewContent[11];
			var aTableItems = oTable.getItems();
			assert.strictEqual(aTableItems.length, 4, "Number of Table Items is correct");

			// panel
			var oPanel = oView.byId("Panel");
			var aPanelContent = oPanel.getContent();
			assert.strictEqual(aPanelContent.length, 5, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main

			// check rendering result for top-level extension points
			// EP0
			assert.ok(oView.byId("zero--defaultButton").getDomRef(), "Default Button in EP_Zero is rendered");
			// EP99
			assert.ok(oView.byId("nine_nine--defaultButton").getDomRef(), "Default Button in EP99 is rendered");

			var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
			assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

			// Default content for EPs in nested View should be available
			var oNestedView = aViewContent[30];
			return oNestedView.loaded().then(function() {
				assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
				assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
			});
		});
	});

	QUnit.module("ExtensionPoint Provider arguments", {
		before: function() {
			ExtensionPoint.registerExtensionProvider(function() {
				return "testdata/customizing/customer/ext/ExtensionPointProvider";
			});
			return new Promise(function(resolve, reject) {
				// preload ExtensionPoint Provider so we can register a spy
				sap.ui.require([ExtensionPoint._fnExtensionProvider()], function(EPProvider) {
					this.oEPProvider = EPProvider;
					this.oEPSpy = sinon.spy(this.oEPProvider, "applyExtensionPoint");
					resolve();
				}.bind(this), reject);
			}.bind(this));
		},
		beforeEach: function() {
			// make sure tests can check the spy independently
			this.oEPSpy.resetHistory();
		},
		after: function() {
			// unload provider, so that subsequent async tests can reload the module again
			// needed to test the loading of the provider class
			sap.ui.loader._.unloadResources("testdata/customizing/customer/ext/ExtensionPointProvider.js", false, true);
		}
	});

	QUnit.test("via Fragment Factory: async", function(assert) {
		assert.expect(4);

		// create (any) view first, so we can pass it to the Fragment
		return XMLView.create({
			viewName: "testdata.customizing.customer.ext.Main"
		}).then(function(oView) {
			var oNestedView = oView.byId("EPinBinding_in_nestedView");
			return oNestedView.loaded().then(function() {
				// reset the spy before loading the fragment
				this.oEPSpy.resetHistory();

				// should trigger exactly 1 EP Provider call
				return Fragment.load({
					id: "EPInFragment",
					name: "testdata.customizing.customer.ext.FragmentWithEP",
					type: "XML",
					containingView: oView
				}).then(function(oFragmentContent) {
					assert.equal(this.oEPSpy.args.length, 1, "1 Call to the EP Provider");
					// EP in Fragment
					var oArgsEPInFragment = this.oEPSpy.args[0][0];
					assert.equal(oArgsEPInFragment.name, "EPInFragment", "EPInFragment");
					assert.ok(oArgsEPInFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPInFragment: View instance is correct");
					assert.equal(oArgsEPInFragment.fragmentId, "EPInFragment", "Local Fragment-ID is passed for 'EPInFragment'");
					oFragmentContent.destroy();
					oView.destroy();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("via XMLView: async", function(assert) {
		assert.expect(47);

		// load the view
		return XMLView.create({
			viewName: "testdata.customizing.customer.ext.Main",
			id: "myView"
		}).then(function(oView) {
			var oNestedView = oView.byId("EPinBinding_in_nestedView");
			return oNestedView.loaded().then(function() {
				// inspect EP Provider calls
				assert.equal(this.oEPSpy.args.length, 16, "16 Calls to the EP Provider");

				// EP 1
				var oArgsEP1 = this.oEPSpy.args[0][0];
				assert.equal(oArgsEP1.name, "EP1", "EP1");
				assert.ok(oArgsEP1.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP1: View instance is correct");

				// EP 2
				var oArgsEP2 = this.oEPSpy.args[1][0];
				assert.equal(oArgsEP2.name, "EP2", "EP2");
				assert.ok(oArgsEP2.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP2: View instance is correct");

				// Closest Binding Carrier Test: EPinBinding from Fragement
				// EP Product_Table_Cell_Ext
				var oArgsProductTableCellInFragment = this.oEPSpy.args[2][0];
				assert.equal(oArgsProductTableCellInFragment.name, "Product_Table_Cell_Ext", "Product_Table_Cell_Ext");
				assert.ok(oArgsProductTableCellInFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Cell_Ext: View instance is correct");
				assert.equal(oArgsProductTableCellInFragment.closestAggregationBindingCarrier, "myView--EPinBinding--product_table", "BindingCarrier ID set correctly");
				assert.equal(oArgsProductTableCellInFragment.closestAggregationBinding, "items", "BindingCarrier aggregation set cortrectly");

				// EP Product_Table_Column_Ext
				var oArgsProductTableColumnInFragment = this.oEPSpy.args[3][0];
				assert.equal(oArgsProductTableColumnInFragment.name, "Product_Table_Column_Ext", "Product_Table_Column_Ext");
				assert.ok(oArgsProductTableColumnInFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Column_Ext: View instance is correct");
				assert.equal(oArgsProductTableColumnInFragment.closestAggregationBindingCarrier, "myView--EPinBinding--supplier_panel", "BindingCarrier ID set correctly");
				assert.equal(oArgsProductTableColumnInFragment.closestAggregationBinding, "content", "BindingCarrier aggregation set cortrectly");

				// EP Panel_Button_Ext
				var oArgsPanelButtonInFragment = this.oEPSpy.args[4][0];
				assert.equal(oArgsPanelButtonInFragment.name, "Panel_Button_Ext", "Panel_Button_Ext");
				assert.ok(oArgsPanelButtonInFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "Panel_Button_Ext: View instance is correct");
				assert.equal(oArgsPanelButtonInFragment.closestAggregationBindingCarrier, "myView--EPinBinding--supplier_panel", "BindingCarrier ID set correctly");
				assert.equal(oArgsPanelButtonInFragment.closestAggregationBinding, "content", "BindingCarrier aggregation set cortrectly");

				// EP 0
				var oArgsEP0 = this.oEPSpy.args[5][0];
				assert.equal(oArgsEP0.name, "EP0", "EP0");
				assert.ok(oArgsEP0.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP0: View instance is correct");

				// EP 99
				var oArgsEP99 = this.oEPSpy.args[6][0];
				assert.equal(oArgsEP99.name, "EP99", "EP99");
				assert.ok(oArgsEP99.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP99: View instance is correct");

				// EP 23
				var oArgsEP23 = this.oEPSpy.args[7][0];
				assert.equal(oArgsEP23.name, "EP23", "EP23");
				assert.ok(oArgsEP23.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP23: View instance is correct");

				// EP Table
				var oArgsEPTable = this.oEPSpy.args[8][0];
				assert.equal(oArgsEPTable.name, "EPTable", "EPTable");
				assert.ok(oArgsEPTable.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPTable: View instance is correct");

				//EPinEPRoot
				var oArgsEPinEP = this.oEPSpy.args[9][0];
				assert.equal(oArgsEPinEP.name, "EPinEPRoot", "EPinEPRoot");
				assert.ok(oArgsEPinEP.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPinEPRoot: View instance is correct");

				//EPinRootFragmentRoot
				var oArgsEPinRootFragment = this.oEPSpy.args[10][0];
				assert.equal(oArgsEPinRootFragment.name, "EPinRootFragment", "EPinRootFragment");
				assert.ok(oArgsEPinRootFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPinRootFragment: View instance is correct");

				// EP Root
				var oArgsEPRoot = this.oEPSpy.args[11][0];
				assert.equal(oArgsEPRoot.name, "EPRoot", "EPRoot");
				assert.ok(oArgsEPRoot.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPRoot: View instance is correct");
				assert.equal(oArgsEPRoot.fragmentId, "EPRootFragment", "Local Fragment-ID is passed for 'EPRootFragment'");

				// NestingFragment --> EP Root
				var oArgsEPRootNested = this.oEPSpy.args[12][0];
				assert.equal(oArgsEPRootNested.name, "EPRoot", "EPRoot");
				assert.ok(oArgsEPRootNested.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPRoot: View instance is correct");
				assert.equal(oArgsEPRootNested.fragmentId, "NestingFragment--EPRootFragment", "Local Fragment-ID is passed for 'EPRootFragment'");

				// Closest Binding Carrier Test: EPinBinding from nested View
				// EP Product_Table_Cell_Ext_In_View
				var oArgsProductTableCellInView = this.oEPSpy.args[13][0];
				assert.equal(oArgsProductTableCellInView.name, "Product_Table_Cell_Ext_In_View", "Product_Table_Cell_Ext_In_View");
				assert.ok(oArgsProductTableCellInView.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Cell_Ext_In_View: View instance is correct");
				assert.equal(oArgsProductTableCellInView.closestAggregationBindingCarrier, "myView--EPinBinding_in_nestedView--product_table", "BindingCarrier ID set correctly");
				assert.equal(oArgsProductTableCellInView.closestAggregationBinding, "items", "BindingCarrier aggregation set cortrectly");

				// EP Product_Table_Column_Ext_In_View
				var oArgsProductTableColumnInView = this.oEPSpy.args[14][0];
				assert.equal(oArgsProductTableColumnInView.name, "Product_Table_Column_Ext_In_View", "Product_Table_Column_Ext_In_View");
				assert.ok(oArgsProductTableColumnInView.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Column_Ext_In_View: View instance is correct");
				assert.equal(oArgsProductTableColumnInView.closestAggregationBindingCarrier, "myView--EPinBinding_in_nestedView", "BindingCarrier ID set correctly");
				assert.equal(oArgsProductTableColumnInView.closestAggregationBinding, "dependents", "BindingCarrier aggregation set cortrectly");

				// EP Panel_Button_Ext_In_View
				var oArgsPanelButtonInView = this.oEPSpy.args[15][0];
				assert.equal(oArgsPanelButtonInView.name, "Panel_Button_Ext_In_View", "Panel_Button_Ext_In_View");
				assert.ok(oArgsPanelButtonInView.view.getMetadata().isA("sap.ui.core.mvc.View"), "Panel_Button_Ext_In_View: View instance is correct");
				assert.equal(oArgsPanelButtonInView.closestAggregationBindingCarrier, "myView--EPinBinding_in_nestedView", "BindingCarrier ID set correctly");
				assert.equal(oArgsPanelButtonInView.closestAggregationBinding, "dependents", "BindingCarrier aggregation set cortrectly");

				oView.destroy();
			}.bind(this));
		}.bind(this));

	});

	QUnit.module("Delayed Extension Point", {
		before: function () {
			ExtensionPoint.registerExtensionProvider(function () {
				return "testdata/customizing/customer/ext/ExtensionPointProvider";
			});
		},
		after: function () {
			ExtensionPoint.registerExtensionProvider(null);
		}
	});

	QUnit.test("Delayed Extension Point with async factory", function(assert){
		return XMLView.create({
			viewName: "testdata.customizing.customer.ext.DelayedEP",
			id: "myDelayedView"
		}).then(function (oView) {
			assert.strictEqual(oView.getContent().length, 1, "The view content has length 1.");
			var oPanel = oView.getContent()[0];
			assert.strictEqual(oPanel.getContent().length, 3, "The panel content has length 3.");
			assert.strictEqual(oPanel.getContent()[0].getId(), oView.createId("mybuttonA"), "The 'mybuttonA' button is placed at index '0'.");
			assert.strictEqual(oPanel.getContent()[1].getId(), oView.createId("mybuttonB"), "The 'mybuttonB' button is placed at index '1'.");
			assert.strictEqual(oPanel.getContent()[2].getId(), oView.createId("mybuttonC"), "The 'mybuttonC' button is placed at index '2'.");

			oView.destroy();
		});
	});

	/**
	 * @deprecated As of version 1.111
	 */
	QUnit.test("Delayed Extension Point with generic factory (async=true)", function(assert){
		var oView  = sap.ui.xmlview({
			viewName: "testdata.customizing.customer.ext.DelayedEP",
			id: "myDelayedView",
			async: true
		});

		return oView.loaded().then(function (oView) {
			assert.strictEqual(oView.getContent().length, 1, "The view content has length 1.");
			var oPanel = oView.getContent()[0];
			assert.strictEqual(oPanel.getContent().length, 3, "The panel content has length 3.");
			assert.strictEqual(oPanel.getContent()[0].getId(), oView.createId("mybuttonA"), "The 'mybuttonA' button is placed at index '0'.");
			assert.strictEqual(oPanel.getContent()[1].getId(), oView.createId("mybuttonB"), "The 'mybuttonB' button is placed at index '1'.");
			assert.strictEqual(oPanel.getContent()[2].getId(), oView.createId("mybuttonC"), "The 'mybuttonC' button is placed at index '2'.");

			oView.destroy();
		});
	});

	QUnit.module("Async ExtensionPoints", {
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


	QUnit.test("Default content contains Async View/Fragment", function(assert) {
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/extensionPoints/defaultContent/manifest.json");

		return Component.create({
			name: "testdata.extensionPoints",
			manifest: sManifestUrl
		}).then(function(oComponent) {
			var oView = oComponent.getRootControl();
			// check call count of async processing
			assert.equal(this.oXMLTPSpy.callCount, 2, "2 async XMLViews processed.");

			// check content order of outer view
			var aViewContent = oView.getContent();
			assert.equal(aViewContent.length, 5, "Correct amount of top-level controls.");
			assert.equal(aViewContent[0], oView.byId("outerView_button_before"), "Button before ExtensionPoint is at the correct position.");
			assert.equal(aViewContent[1], oView.byId("outerView_buttonInDefaultContent_before"), "Button before nested View in default content is at the correct position.");
			assert.equal(aViewContent[2], oView.byId("innerView"), "Nested View in default content is at the correct position.");
			assert.equal(aViewContent[3], oView.byId("outerView_buttonInDefaultContent_after"), "Button after nested View in default content is at the correct position.");
			assert.equal(aViewContent[4], oView.byId("outerView_button_after"), "Button after ExtensionPoint is at the correct position.");

			// check if inner view exists
			var oInnerView = oView.byId("innerView");
			assert.ok(oInnerView, "Inner view inside ExtensionPoint default content exists.");

			// check if inner view content is available
			var aInnerViewContent = oInnerView.getContent();
			assert.equal(aInnerViewContent.length, 2, "Correct amount of controls inside inner View.");
			assert.ok(oInnerView.byId("buttonInInnerView_1"), "Button inside inner view is available");
			assert.ok(oInnerView.byId("buttonInInnerView_2"), "Button inside inner view is available");

			return oComponent;
		}.bind(this)).then(function(oComponent) {
			oComponent.destroy();
		});
	});

	QUnit.test("ExtensionPoint contains Async View/Fragment", function(assert) {
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/extensionPoints/viewExtensions/manifest.json");

		return Component.create({
			name: "testdata.extensionPoints",
			manifest: sManifestUrl
		}).then(function(oComponent) {

			var oView = oComponent.getRootControl();

			// check call count of XMLTP
			assert.equal(this.oXMLTPSpy.callCount, 3, "3 async XMLViews or Fragments processed.");
			// check async flags of the XMLTP start, arguments order: (0: xmlNode, 1: view/fragment instance, 2: bAsync, 3: oParseConfig)
			assert.strictEqual(this.oXMLTPSpy.args[0][2], true, "Async root View.");
			assert.strictEqual(this.oXMLTPSpy.args[1][2], true, "Async nested View from 'ExtPointFromView'.");
			assert.strictEqual(this.oXMLTPSpy.args[2][2], true, "Async nested Fragment from 'ExtPointFromFragment'.");

			// content amount
			var aViewContent = oView.getContent();
			assert.equal(aViewContent.length, 6, "Correct amount of top-level controls (6)");

			// check content order of outer view
			assert.equal(aViewContent[0], oView.byId("outerView_button_before"), "Button before ExtensionPoint is at the correct position.");

			// nested view from EP
			assert.equal(aViewContent[1], oView.byId("extPointFromView"), "ExtPointFromView content is at the correct position.");

			assert.equal(aViewContent[2], oView.byId("outerView_button_middle"), "Button after ExtensionPoint is at the correct position.");

			// fragment content from EP
			assert.equal(aViewContent[3], oView.byId("extPointFromFragment--buttonExtPointFromFragment_1"), "Button 1 in ExtPointFromFragment is at the correct position.");
			assert.equal(aViewContent[4], oView.byId("extPointFromFragment--buttonExtPointFromFragment_2"), "Button 2 in ExtPointFromFragment is at the correct position.");

			assert.equal(aViewContent[5], oView.byId("outerView_button_after"), "Button after ExtensionPoint is at the correct position.");

			// check if view provided by extension point exists
			var oExtPointView = oView.byId("extPointFromView");
			assert.ok(oExtPointView instanceof XMLView, "The extension point 'ExtPointFromView' exists and is a valid XMLView instance.");

			// check if the extension points view content is available
			var aExtPointViewContent = oExtPointView.getContent();
			assert.equal(aExtPointViewContent.length, 2, "Correct amount of controls inside extension point.");
			assert.ok(oExtPointView.byId("buttonExtPointFromView_1"), "Button 1 inside extension point view is available");
			assert.ok(oExtPointView.byId("buttonExtPointFromView_2"), "Button 2 inside extension point view is available");

			return oComponent;
		}.bind(this)).then(function(oComponent) {
			oComponent.destroy();
		});
	});
});