sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/ExtensionPoint',
	"sap/ui/qunit/utils/nextUIUpdate",
	// Load ExtensionPointProvider in advance because Controller expects some extensions to be processed sync
	'testdata/customizing/customer/ext/ExtensionPointProvider'
], function(Component, ComponentContainer, ExtensionPoint, nextUIUpdate, ExtensionPointProvider) {

	"use strict";
	/*global QUnit, sinon */

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	// UI Construction
	var oComponent, oComponentContainer;

	async function createComponentAndContainer(bWithExtensionProvider, bWithEmptyExtensionProvider) {
		// load and start the customized application
		if (bWithExtensionProvider) {
			ExtensionPoint.registerExtensionProvider(function() {
				return bWithEmptyExtensionProvider ? undefined : "testdata/customizing/customer/ext/ExtensionPointProvider";
			});
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
		await nextUIUpdate();
	}

	function destroyComponentAndContainer() {
		delete ExtensionPoint._fnExtensionProvider;
		oComponent.destroy();
		oComponentContainer.destroy();
	}


	QUnit.module("ExtensionPoint Provider arguments", {
		before: function() {
			ExtensionPoint.registerExtensionProvider(function() {
				return "testdata/customizing/customer/ext/ExtensionPointProvider";
			});
			this.oEPProvider = ExtensionPointProvider;
			this.oEPSpy = sinon.spy(this.oEPProvider, "applyExtensionPoint");
		},
		beforeEach: function() {
			// make sure tests can check the spy independently
			this.oEPSpy.resetHistory();
		}
	});

	QUnit.test("via Fragment Factory: sync", function(assert) {
		assert.expect(4);

		// create (any) view first, so we can pass the controller to the Fragment
		var oView = sap.ui.xmlview({
			viewName: "testdata.customizing.customer.ext.sync.Main"
		});

		// reset the spy before loading the fragment
		this.oEPSpy.resetHistory();

		// should trigger exactly 1 EP Provider call
		var oFragmentContent = sap.ui.xmlfragment("EPInFragment", "testdata.customizing.customer.ext.FragmentWithEP", oView.getController());

		assert.equal(this.oEPSpy.args.length, 1, "1 Call to the EP Provider");
		// EP in Fragment
		var oArgsEPInFragment = this.oEPSpy.args[0][0];
		assert.equal(oArgsEPInFragment.name, "EPInFragment", "EPInFragment");
		assert.ok(oArgsEPInFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPInFragment: View instance is correct");
		assert.equal(oArgsEPInFragment.fragmentId, "EPInFragment", "Local Fragment-ID is passed for 'EPInFragment'");

		oFragmentContent.destroy();
	});

	QUnit.test("via XMLView: sync", function(assert) {
		assert.expect(47);

		// load the view
		var oView = sap.ui.xmlview({
			viewName: "testdata.customizing.customer.ext.sync.Main",
			id: "myView"
		});

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
		// EP Product_Table_Cell_Ext
		var oArgsProductTableCell = this.oEPSpy.args[2][0];
		assert.equal(oArgsProductTableCell.name, "Product_Table_Cell_Ext", "Product_Table_Cell_Ext");
		assert.ok(oArgsProductTableCell.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Cell_Ext: View instance is correct");
		assert.equal(oArgsProductTableCell.closestAggregationBindingCarrier, "myView--EPinBinding--product_table", "BindingCarrier ID set correctly");
		assert.equal(oArgsProductTableCell.closestAggregationBinding, "items", "BindingCarrier aggregation set cortrectly");
		// EP Product_Table_Column_Ext
		var oArgsProductTableColumn = this.oEPSpy.args[3][0];
		assert.equal(oArgsProductTableColumn.name, "Product_Table_Column_Ext", "Product_Table_Column_Ext");
		assert.ok(oArgsProductTableColumn.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Column_Ext: View instance is correct");
		assert.equal(oArgsProductTableColumn.closestAggregationBindingCarrier, "myView--EPinBinding--supplier_panel", "BindingCarrier ID set correctly");
		assert.equal(oArgsProductTableColumn.closestAggregationBinding, "content", "BindingCarrier aggregation set cortrectly");
		// EP Panel_Button_Ext
		var oArgsPanelButton = this.oEPSpy.args[4][0];
		assert.equal(oArgsPanelButton.name, "Panel_Button_Ext", "Panel_Button_Ext");
		assert.ok(oArgsPanelButton.view.getMetadata().isA("sap.ui.core.mvc.View"), "Panel_Button_Ext: View instance is correct");
		assert.equal(oArgsPanelButton.closestAggregationBindingCarrier, "myView--EPinBinding--supplier_panel", "BindingCarrier ID set correctly");
		assert.equal(oArgsPanelButton.closestAggregationBinding, "content", "BindingCarrier aggregation set cortrectly");
		// Closest Binding Carrier Test: EPinBinding from nested View
		// EP Product_Table_Cell_Ext_In_View
		var oArgsProductTableCellInView = this.oEPSpy.args[5][0];
		assert.equal(oArgsProductTableCellInView.name, "Product_Table_Cell_Ext_In_View", "Product_Table_Cell_Ext_In_View");
		assert.ok(oArgsProductTableCellInView.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Cell_Ext_In_View: View instance is correct");
		assert.equal(oArgsProductTableCellInView.closestAggregationBindingCarrier, "myView--EPinBinding_in_nestedView--product_table", "BindingCarrier ID set correctly");
		assert.equal(oArgsProductTableCellInView.closestAggregationBinding, "items", "BindingCarrier aggregation set cortrectly");

		// EP Product_Table_Column_Ext_In_View
		var oArgsProductTableColumnInView = this.oEPSpy.args[6][0];
		assert.equal(oArgsProductTableColumnInView.name, "Product_Table_Column_Ext_In_View", "Product_Table_Column_Ext_In_View");
		assert.ok(oArgsProductTableColumnInView.view.getMetadata().isA("sap.ui.core.mvc.View"), "Product_Table_Column_Ext_In_View: View instance is correct");
		assert.equal(oArgsProductTableColumnInView.closestAggregationBindingCarrier, "myView--EPinBinding_in_nestedView", "BindingCarrier ID set correctly");
		assert.equal(oArgsProductTableColumnInView.closestAggregationBinding, "dependents", "BindingCarrier aggregation set cortrectly");

		// EP Panel_Button_Ext_In_View
		var oArgsPanelButtonInView = this.oEPSpy.args[7][0];
		assert.equal(oArgsPanelButtonInView.name, "Panel_Button_Ext_In_View", "Panel_Button_Ext_In_View");
		assert.ok(oArgsPanelButtonInView.view.getMetadata().isA("sap.ui.core.mvc.View"), "Panel_Button_Ext_In_View: View instance is correct");
		assert.equal(oArgsPanelButtonInView.closestAggregationBindingCarrier, "myView--EPinBinding_in_nestedView", "BindingCarrier ID set correctly");
		assert.equal(oArgsPanelButtonInView.closestAggregationBinding, "dependents", "BindingCarrier aggregation set cortrectly");
		// EP 0
		var oArgsEP0 = this.oEPSpy.args[8][0];
		assert.equal(oArgsEP0.name, "EP0", "EP0");
		assert.ok(oArgsEP0.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP0: View instance is correct");
		// EP 99
		var oArgsEP99 = this.oEPSpy.args[9][0];
		assert.equal(oArgsEP99.name, "EP99", "EP99");
		assert.ok(oArgsEP99.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP99: View instance is correct");
		// EP 23
		var oArgsEP23 = this.oEPSpy.args[10][0];
		assert.equal(oArgsEP23.name, "EP23", "EP23");
		assert.ok(oArgsEP23.view.getMetadata().isA("sap.ui.core.mvc.View"), "EP23: View instance is correct");
		// EP Table
		var oArgsEPTable = this.oEPSpy.args[11][0];
		assert.equal(oArgsEPTable.name, "EPTable", "EPTable");
		assert.ok(oArgsEPTable.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPTable: View instance is correct");
		//EPinEPRoot
		var oArgsEPinEP = this.oEPSpy.args[12][0];
		assert.equal(oArgsEPinEP.name, "EPinEPRoot", "EPinEPRoot");
		assert.ok(oArgsEPinEP.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPinEPRoot: View instance is correct");
		//EPinRootFragmentRoot
		var oArgsEPinRootFragment = this.oEPSpy.args[13][0];
		assert.equal(oArgsEPinRootFragment.name, "EPinRootFragment", "EPinRootFragment");
		assert.ok(oArgsEPinRootFragment.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPinRootFragment: View instance is correct");
		// EP Root
		var oArgsEPRoot = this.oEPSpy.args[14][0];
		assert.equal(oArgsEPRoot.name, "EPRoot", "EPRoot");
		assert.ok(oArgsEPRoot.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPRoot: View instance is correct");
		assert.equal(oArgsEPRoot.fragmentId, "EPRootFragment", "Local Fragment-ID is passed for 'EPRootFragment'");
		// NestingFragment --> EP Root
		var oArgsEPRootNested = this.oEPSpy.args[15][0];
		assert.equal(oArgsEPRootNested.name, "EPRoot", "EPRoot");
		assert.ok(oArgsEPRootNested.view.getMetadata().isA("sap.ui.core.mvc.View"), "EPRoot: View instance is correct");
		assert.equal(oArgsEPRootNested.fragmentId, "NestingFragment--EPRootFragment", "Local Fragment-ID is passed for 'EPRootFragment'");

		oView.destroy();
	});

	QUnit.module("ExtensionPoints with Provider (Sync)", {
		before: createComponentAndContainer.bind(null, true, false),
		after: destroyComponentAndContainer
	});

	QUnit.test("simple resolution", function(assert) {
		assert.expect(27);
		var done = assert.async();

		var oView = oComponent.getRootControl();

		var fnAssert = function() {
			var oPanel = oView.byId("Panel");
			var aViewContent = oView.getContent();
			var aPanelContent = oPanel.getContent();
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

			assert.strictEqual(aPanelContent.length, 7, "ExtensionView content added to view");

			assert.strictEqual(aPanelContent[0].getId(), "ExtComponent---mainView--customFragment--customButton1", "EP1 content is in correct order"); // EP1
			assert.strictEqual(aPanelContent[1].getId(), "ExtComponent---mainView--customFragment--customButton2", "EP1 content is in correct order"); // EP1
			assert.strictEqual(aPanelContent[2].getId(), "ExtComponent---mainView--button1", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), "ExtComponent---mainView--button2", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[4].getId(), "ExtComponent---mainView--button3", "Main.view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[5].getId(), "ExtComponent---mainView--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[6].getId(), "ExtComponent---mainView--button4", "Main.view content is in correct order"); // Main

			// view Content
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

			var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
			assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent = oView.byId("Panel").getContent();
			var oNestedView = oView.byId("EPinBinding_in_nestedView");
			var oControl1 = oNestedView.byId("TableRowButton");
			var oControl2 = oNestedView.byId("PanelButton");
			if (aPanelContent.length == 7 && oView.getContent().length === 33 && oControl1 && oControl2) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);

	});

	QUnit.test("ExtensionPoint on top-level of XMLView", function(assert) {
		assert.expect(44);
		var done = assert.async();

		var oView = oComponent.getRootControl();

		var fnAssert = function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider was added");

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

			// table
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

			var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
			assert.strictEqual(oOwnerComponent.getId(), "ExtComponent", "Panel has the correct OwnerComponent");

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aViewContent = oView.getContent();
			var oNestedView = oView.byId("EPinBinding_in_nestedView");
			var oControl1 = oNestedView.byId("TableRowButton");
			var oControl2 = oNestedView.byId("PanelButton");
			if (aViewContent.length == 33 && oControl1 && oControl2) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);

	});

	QUnit.module("ExtensionPoints with Provider BUT no module is returned (Sync)", {
		before: createComponentAndContainer.bind(null, true, true),
		after: destroyComponentAndContainer
	});

	/**
	 * Note:
	 * Without a provider, we don't need to poll the aggregation for ExtensionPoint content,
	 * since the default content in this test is inserted sync anyway.
	 */
	QUnit.test("simple resolution", function(assert) {
		assert.expect(43);

		var done = assert.async();
		var oView = oComponent.getRootControl();

		function fnAssert() {
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

			// Default content for EPs in nested View should be available
			var oNestedView = aViewContent[30];
			assert.ok(oNestedView.byId("TableRowButton") != null, "Default Content 'TableRowButton' in nested View is available");
			assert.ok(oNestedView.byId("PanelButton") != null, "Default Content 'PanelButton' in nested View is available");

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

			done();
		}

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent = oView.byId("Panel").getContent();
			var oNestedView = oView.byId("EPinBinding_in_nestedView");
			var oControl1 = oNestedView.byId("TableRowButton");
			var oControl2 = oNestedView.byId("PanelButton");
			if (aPanelContent.length == 5 && oView.getContent().length === 31 && oControl1 && oControl2) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);
	});


	QUnit.module("ExtensionPoints w/o Provider (Sync)", {
		before: createComponentAndContainer.bind(null, false, false),
		after: destroyComponentAndContainer
	});

	/**
	 * Note:
	 * Without a provider, we don't need to poll the aggregation for ExtensionPoint content,
	 * since the default content in this test is inserted sync anyway.
	 */
	QUnit.test("simple resolution", function(assert) {
		assert.expect(41);
		var oView = oComponent.getRootControl();

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

	QUnit.test("Delayed Extension Point with generic factory (async=false)", function(assert){
		var oView  = sap.ui.xmlview({
			viewName: "testdata.customizing.customer.ext.DelayedEP",
			id: "myDelayedView",
			async: false
		});

		assert.strictEqual(oView.getContent().length, 1, "The view content has length 1.");
		var oPanel = oView.getContent()[0];
		assert.strictEqual(oPanel.getContent().length, 2, "The panel content has length 2.");
		assert.strictEqual(oPanel.getContent()[0].getId(), oView.createId("mybuttonA"), "The 'mybuttonA' button is placed at index '0'.");
		assert.strictEqual(oPanel.getContent()[1].getId(), oView.createId("mybuttonC"), "The 'mybuttonC' button is placed at index '1'.");
		// 'mybuttonC' will be added asynchronously at a later point in time.
		// Using the synchronous factory the application has no way to capture this point in time

		oView.destroy();
	});

});