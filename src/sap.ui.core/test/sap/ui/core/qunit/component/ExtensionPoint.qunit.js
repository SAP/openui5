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

	QUnit.test("simple resolution", function(assert) {
		assert.expect(32);
		var oView = oComponent.getRootControl();

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
		assert.strictEqual(aViewContent.length, 34, "Correct # of controls inside View content aggregation");

		assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--Panel_With_Nested_View", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[31].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[32].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[33].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

		var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
		assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

		const oNestedView = oView.byId("EPinBinding_in_nestedView");

		assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
		assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
	});

	QUnit.test("ExtensionPoint on top-level of XMLView", function(assert) {
		assert.expect(52);
		var oView = oComponent.getRootControl();

		assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 34, "Correct # of controls inside View content aggregation");

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

		assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--Panel_With_Nested_View", "ColumnListItem is in correct order"); // myListItem

		assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[31].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[32].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[33].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

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

		const oNestedView = oView.byId("EPinBinding_in_nestedView");
		assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
		assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
	});

	QUnit.module("ExtensionPoints with Provider BUT no module is returned (Async)", {
		before: createComponentAndContainer.bind(null, true, true),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(44);
		var oView = oComponent.getRootControl();

		assert.strictEqual(ExtensionPoint._fnExtensionProvider(), undefined, "ExtensionPointProvider exists, but no module returned");

		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 32, "Correct # of controls inside View content aggregation");

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

		// panel with a nested view
		assert.strictEqual(aViewContent[13].getId(), "ExtComponent---mainView--Panel_With_Nested_View", "ColumnListItem is in correct order"); // myListItem

		assert.strictEqual(aViewContent[14].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[31].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

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
		var oNestedView = oView.byId("EPinBinding_in_nestedView");
		assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
		assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
	});

	QUnit.module("ExtensionPoint w/o Provider (Async)", {
		before: createComponentAndContainer.bind(null, false, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(43);
		var oView = oComponent.getRootControl();

		assert.ok(!ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

		var aViewContent = oView.getContent();
		assert.strictEqual(aViewContent.length, 32, "Correct # of controls inside View content aggregation");

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

		// Panel with nested view
		assert.strictEqual(aViewContent[13].getId(), "ExtComponent---mainView--Panel_With_Nested_View", "Main.view content is in correct order"); // Main

		assert.strictEqual(aViewContent[14].getId(), "ExtComponent---mainView--ButtonInRootEP", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[15].getId(), "ExtComponent---mainView--EPinEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[16].getId(), "ExtComponent---mainView--EPinEPButton2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[17].getId(), "ExtComponent---mainView--EPinEPButton3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[18].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[19].getId(), "ExtComponent---mainView--EPinEPButtonDeepNesting2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[20].getId(), "ExtComponent---mainView--ButtonInRootEP2", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[21].getId(), "ExtComponent---mainView--ButtonInRootEP3", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[22].getId(), "ExtComponent---mainView--EPinEPButton4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[23].getId(), "ExtComponent---mainView--ButtonInRootEP4", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[24].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[25].getId(), "ExtComponent---mainView--EPinEPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[26].getId(), "ExtComponent---mainView--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[27].getId(), "ExtComponent---mainView--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[28].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButton", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[29].getId(), "ExtComponent---mainView--NestingFragment--EPRootFragment--extEPButtonChild", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[30].getId(), "ExtComponent---mainView--EPinBinding--supplier_panel", "Main.view content is in correct order"); // Main
		assert.strictEqual(aViewContent[31].getId(), "ExtComponent---mainView--EPinBinding_in_nestedView", "Main.view content is in correct order"); // Main (nested view with EPs)

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
		var oNestedView = oView.byId("EPinBinding_in_nestedView");

		assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
		assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");
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


	// matches if the "view" property in the EP info object for flex is of type "sap.ui.core.mvc.View"
	const oViewClassMatcher = sinon.match((v) => {return v?.getMetadata().isA("sap.ui.core.mvc.View");});

	// matches the control against the given ID
	const idMatcher = (sId) => {
		return sinon.match((v) => {return v?.getId() === sId;});
	};

	/**
	 * Asserts if we made the correct calls to the registered ExtensionPointProvider.
	 * This includes information about the targetControl, closestBindingCarrier,
	 * the target aggregation and the index therein.
	 *
	 * @param {function} assert the QUnit assert function
	 */
	function assertExtensionPointProviderSpies(assert, oView) {

		// inspect EP Provider calls
		assert.equal(this.oEPSpy.getCalls().length, 21, "21 Calls to the EP Provider");

		// EP 1
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP1",
			view: oViewClassMatcher
		})), "EP 'EP1' registered");

		// EP 2
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP2",
			view: oViewClassMatcher
		})), "EP 'EP2' registered");

		// Closest Binding Carrier Test: EPinBinding from Fragement
		// EP Product_Table_Cell_Ext
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "Product_Table_Cell_Ext",
			view: oViewClassMatcher,
			closestAggregationBindingCarrier: "myView--EPinBinding--product_table",
			closestAggregationBinding: "items"
		})), "EP 'Product_Table_Cell_Ext' registered");

		// EP Product_Table_Column_Ext
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "Product_Table_Column_Ext",
			view: oViewClassMatcher,
			closestAggregationBindingCarrier: "myView--EPinBinding--supplier_panel",
			closestAggregationBinding: "content"
		})), "EP 'Product_Table_Column_Ext' registered");

		// EP Panel_Button_Ext
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "Panel_Button_Ext",
			view: oViewClassMatcher,
			closestAggregationBindingCarrier: "myView--EPinBinding--supplier_panel",
			closestAggregationBinding: "content"
		})), "EP 'Panel_Button_Ext' registered");

		// EP 0
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP0",
			view: oViewClassMatcher
		})), "EP 'EP0' registered");

		// EP 99
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP99",
			view: oViewClassMatcher
		})), "EP 'EP99' registered");

		// EP 23
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP23",
			view: oViewClassMatcher
		})), "EP 'EP23' registered");

		// EP Table
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EPTable",
			view: oViewClassMatcher
		})), "EP 'EPTable' registered");

		// --- 5 EPs contained in EPinNestedView.view.xml ---
		assertNestedViewExtensionPoints.call(this, assert);

		//EPinEPRoot
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EPinEPRoot",
			view: oViewClassMatcher
		})), "EP 'EPinEPRoot' registered");

		//EPinRootFragmentRoot
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EPinRootFragment",
			view: oViewClassMatcher
		})), "EP 'EPinRootFragment' registered");

		// EP Root
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EPRoot",
			view: oViewClassMatcher,
			fragmentId: "EPRootFragment"
		})), "EP 'EPRoot' registered");

		// NestingFragment --> EP Root
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EPRoot",
			view: oViewClassMatcher,
			fragmentId: "NestingFragment--EPRootFragment"
		})), "EP 'EPRoot' in NestingFragment registered");

		// Closest Binding Carrier Test: EPinBinding from nested View
		// EP Product_Table_Cell_Ext_In_View
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "Product_Table_Cell_Ext_In_View",
			view: oViewClassMatcher,
			closestAggregationBindingCarrier: "myView--EPinBinding_in_nestedView--product_table",
			closestAggregationBinding: "items"
		})), "EP 'Product_Table_Cell_Ext_In_View' registered");

		// EP Product_Table_Column_Ext_In_View
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "Product_Table_Column_Ext_In_View",
			view: oViewClassMatcher,
			closestAggregationBindingCarrier: "myView--EPinBinding_in_nestedView",
			closestAggregationBinding: "dependents"
		})), "EP 'Product_Table_Column_Ext_In_View' registered");

		// EP Panel_Button_Ext_In_View
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "Panel_Button_Ext_In_View",
			view: oViewClassMatcher,
			closestAggregationBindingCarrier: "myView--EPinBinding_in_nestedView",
			closestAggregationBinding: "dependents"
		})), "EP 'Panel_Button_Ext_In_View' registered");

	}

	/**
	 * Asserts the EPs inside the nested view.
	 *
	 * @param {function} assert the QUnit assert function
	 */
	function assertNestedViewExtensionPoints(assert) {
		// EP_In_Product_Table_Column - 1st
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP_In_Product_Table_Column",
			view: idMatcher("myView--EPs_In_Nested_View"),
			aggregationName: "header",
			targetControl: idMatcher("myView--EPs_In_Nested_View--column_0")
		})), "EP 'EPinNestedView > EP_In_Product_Table_Column' (1) registered");

		// EP_In_Product_Table_Column - 2nd
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP_In_Product_Table_Column",
			view: idMatcher("myView--EPs_In_Nested_View"),
			aggregationName: "header",
			targetControl: idMatcher("myView--EPs_In_Nested_View--column_1")
		})), "EP 'EPinNestedView > EP_In_Product_Table_Column' (2) registered");

		// EP_In_Product_Table_Cell_Not_Found
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP_In_Product_Table_Cell_Not_Found",
			view: idMatcher("myView--EPs_In_Nested_View"),
			aggregationName: "cells",
			targetControl: idMatcher("myView--EPs_In_Nested_View--list_item_0")
		})), "EP 'EPinNestedView > EP_In_Product_Table_Cell_Not_Found' registered");

		// EP_In_Product_Table_Cell_Found
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP_In_Product_Table_Cell_Found",
			view: idMatcher("myView--EPs_In_Nested_View"),
			aggregationName: "cells",
			targetControl: idMatcher("myView--EPs_In_Nested_View--list_item_1")
		})), "EP 'EPinNestedView > EP_In_Product_Table_Cell_Found' registered");

		// EP_in_Panel
		assert.ok(this.oEPSpy.calledWith(sinon.match({
			name: "EP_in_Panel",
			view: idMatcher("myView--EPs_In_Nested_View"),
			aggregationName: "content",
			targetControl: idMatcher("myView--EPs_In_Nested_View") // target is the "content" aggr. of the nested view
		})), "EP 'EPinNestedView > EP_in_Panel' registered");
	}

	/**
	 * Evaluates if the control tree of the given View is correct.
	 * We test if nested Views, Fragments and ExtensionPoints resolve in the correct
	 * order and the controls are correctly aggregated.
	 *
	 * @param {function} assert the QUnit assert function
	 */
	function assertControlTreeCorrectness(assert, oView) {
		// the Main View
		const aActualContentAggregationOfOuterView = oView.getContent().map((oChild) => {
			return oChild.getId();
		});
		const aExpectedContentAggregationOfOuterView = [
			"myView--zero--defaultButton",
			"myView--button0",
			"myView--Panel",
			"myView--button5",
			"myView--button6",
			"myView--ep99--button0",
			"myView--ep99--input0",
			"myView--ep99--input1",
			"myView--shifty--customButton1",
			"myView--shifty--customButton2",
			"myView--button7",
			"myView--tn1--customButton1",
			"myView--tn1--customButton2",
			"myView--myTable",
			"myView--myListItem",
			"myView--Panel_With_Nested_View",
			"myView--ButtonInRootEP",
			"myView--EPinEPButton",
			"myView--EPinEPButton2",
			"myView--EPinEPButton3",
			"myView--EPinEPButtonDeepNesting",
			"myView--EPinEPButtonDeepNesting2",
			"myView--ButtonInRootEP2",
			"myView--ButtonInRootEP3",
			"myView--EPinEPButton4",
			"myView--ButtonInRootEP4",
			"myView--EPinEPRootFragment--extEPButton",
			"myView--EPinEPRootFragment--extEPButtonChild",
			"myView--EPRootFragment--extEPButton",
			"myView--EPRootFragment--extEPButtonChild",
			"myView--NestingFragment--EPRootFragment--extEPButton",
			"myView--NestingFragment--EPRootFragment--extEPButtonChild",
			"myView--EPinBinding--supplier_panel",
			"myView--EPinBinding_in_nestedView"
		];

		assert.deepEqual(aActualContentAggregationOfOuterView, aExpectedContentAggregationOfOuterView, "Content Aggregation of View is correct.");

		// check the nested View's content
		const oNestedView = oView.byId("EPs_In_Nested_View");
		assert.ok(oNestedView.isA("sap.ui.core.mvc.XMLView"), "Nested View is available");

		// top level content
		const aActualContentAggregationOfNestedView = oNestedView.getContent().map((oChild) => {
			return oChild.getId();
		});
		const aExpectedContentAggregationOfNestedView = ['myView--EPs_In_Nested_View--product_table', 'myView--EPs_In_Nested_View--PanelButton'];

		assert.deepEqual(aActualContentAggregationOfNestedView, aExpectedContentAggregationOfNestedView, "Nested Views' top-level content is correct.");

		// Table content
		const oTable = oNestedView.byId("product_table");

		// -- columns
		const aColumns = oTable.getColumns();

		assert.deepEqual(aColumns.map((oCol) => {
			return oCol.getId();
		}), ["myView--EPs_In_Nested_View--column_0", "myView--EPs_In_Nested_View--column_1"],
		"Columns are correctly ordered, including their nested EPs.");

		assert.equal(aColumns[0].getHeader().getText(), "Table Header Text from EP Fragment: EP_In_Product_Table_Column.fragment.xml", "sap.m.Text from EP 'EP_In_Product_Table_Column' is correctly inserted into Column's 'header' aggregation.");
		assert.equal(aColumns[1].getHeader().getText(), "Table Header Text from EP Fragment: EP_In_Product_Table_Column.fragment.xml", "sap.m.Text from EP 'EP_In_Product_Table_Column' is correctly inserted into Column's 'header' aggregation.");

		// -- items
		const aItems = oTable.getItems();

		assert.deepEqual(aItems.map((oCLI) => {
			return oCLI.getId();
		}), ["myView--EPs_In_Nested_View--list_item_0", "myView--EPs_In_Nested_View--list_item_1"], "ColumnListItems are correctly ordered.");

		// -- items -- cells

		// 1st Item must have a cell with an EP's default content
		const oCell0 = aItems[0].getCells()[0];
		assert.ok(oCell0.isA("sap.m.Button"), "1st CLI's cell content is a 'sap.m.Button'.");
		assert.equal(oCell0.getId(), "myView--EPs_In_Nested_View--TableRowButton", "1st CLI's cell is correct Button control with correct ID.");

		// 2nd Item must have a cell with an EP's resolved content (a sap.m.Input field)
		const oCell1 = aItems[1].getCells()[0];
		assert.ok(oCell1.isA("sap.m.Input"), "2nd CLI's cell content is a 'sap.m.Input'.");
		assert.equal(oCell1.getId(), "myView--EPs_In_Nested_View--column_list_item_fragment--Input_From_EP", "2nd CLI's cell is correct Input control with correct ID.");
	}

	QUnit.test("via XMLView: async", async function(assert) {
		assert.expect(33);

		// load the view
		const oView = await XMLView.create({
			viewName: "testdata.customizing.customer.ext.Main",
			id: "myView"
		});

		assertExtensionPointProviderSpies.bind(this)(assert, oView);

		assertControlTreeCorrectness.bind(this)(assert, oView);

		oView.destroy();
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