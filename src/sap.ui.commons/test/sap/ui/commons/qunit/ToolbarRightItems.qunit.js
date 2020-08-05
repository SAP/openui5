/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Button",
	"sap/ui/commons/ToolbarSeparator",
	"sap/ui/commons/library",
	"sap/ui/commons/TextField",
	"sap/ui/commons/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/commons/Toolbar"
], function(
	createAndAppendDiv,
	Button,
	ToolbarSeparator,
	commonsLibrary,
	TextField,
	ComboBox,
	ListItem,
	Toolbar
) {
	"use strict";

	// shortcut for sap.ui.commons.ToolbarSeparatorDesign
	var ToolbarSeparatorDesign = commonsLibrary.ToolbarSeparatorDesign;


	// prepare DOM
	createAndAppendDiv("uiArea1");



	function addManyItems(oToolbar) {
		var id = oToolbar.getId();

		// 10 buttons
		var aIcons = [
			"test-resources/sap/ui/commons/images/new.png",
			"test-resources/sap/ui/commons/images/open.png",
			"test-resources/sap/ui/commons/images/save.png",
			"test-resources/sap/ui/commons/images/cut.png",
			"test-resources/sap/ui/commons/images/copy.png",
			"test-resources/sap/ui/commons/images/paste2.png",
			null,
			null,
			null,
			null
		];

		var aLabels = [
			"",
			"",
			"",
			"",
			"",
			"",
			"Forward",
			"Process",
			"View All",
			"Approve"
		];

		var i, oButton;

		// create ten buttons
		for (i = 0; i < 10; ++i) {
			oButton = new Button(id + "_b_" + i, {text : aLabels[i]});
			if (aIcons[i]) {
				oButton.setIcon(aIcons[i]);
			}

			// add separators at various positions
			if (i == 2) {
				oToolbar.addItem(new ToolbarSeparator());
			} else if (i == 5) {
				oToolbar.addItem(new ToolbarSeparator({"design":ToolbarSeparatorDesign.FullHeight}));
			} else if (i == 8) {
				oToolbar.addItem(new ToolbarSeparator({"displayVisualSeparator":false}));
			}

			oToolbar.addItem(oButton);
		}

		// input field
		var oTextField = new TextField(id + "_tf", {
			value : "#0"
		});
		oToolbar.addItem(oTextField);

		// combo box for 2nd button's text
		var oComboBox = new ComboBox(id + "_cmb", {
			items: [
				new ListItem({text : "#1"}),
				new ListItem({text : "Do it"}),
				new ListItem({text : "Hello world"}),
				new ListItem({text : "Yet another stupid button text"})
			]
		});
		oToolbar.addItem(oComboBox);

		//Add Right side items
		for (i = 0; i < 4; ++i) {
			oButton = new Button(id + "_bRi_" + i, {text : aLabels[i]});
			if (aIcons[i]) {
			  oButton.setIcon(aIcons[i]);
			}

			// add separators at various positions
			if (i == 1) {
				oToolbar.addRightItem(new ToolbarSeparator({"design":ToolbarSeparatorDesign.FullHeight}));
			} else if (i == 3) {
				oToolbar.addRightItem(new ToolbarSeparator({"design":ToolbarSeparatorDesign.Standard}));
			}
			oToolbar.addRightItem(oButton);
		}
		return oToolbar;
	}


	var oCtrl = new Toolbar("Toolbar", {width:"490px"}).placeAt("uiArea1");
	addManyItems(oCtrl);


	// ========================================================
	// test number of toolbar items on right and left sides
	// ========================================================
	QUnit.test("VisibleItems calculation with images involved", function(assert) {
		var done = assert.async();
		assert.expect(3);
		setTimeout(function(){ // give the Toolbar some time to recognize the change
			assert.equal(oCtrl.getVisibleItemInfo().count, 8, "8 items should be considered visible on the left side (6 Buttons + 2 Separators)");
			assert.equal(oCtrl.iItemDomRefCount, 11, "There should be 11 items considered navigable by the ItemNavigation (6 Left items + 1 overflow button + 4 right items)");
			assert.equal(oCtrl.getRightItems().length, 6, "4 buttons + 2 Separators on the right side");
			done();
		}, 1200);
	});

	// ==================================================
	// test property settings
	// ==================================================


	/**
	 * Tests accessor method for property visible of the whole Toolbar.
	 */
	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(oCtrl.getVisible(), true);
	});

	/**
	 * Tests accessor method for property width of the whole Toolbar.
	 */
	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(oCtrl.getWidth(), "490px");
	});

	QUnit.test("VisibleItems calculation with item size change", function(assert) {
		var done = assert.async();
		assert.expect(3);
		assert.strictEqual(oCtrl.getWidth(), "490px");
		oCtrl.setWidth("350px");
		sap.ui.getCore().applyChanges();
		setTimeout(function(){ // give the Toolbar some time to recognize the change
			assert.equal(oCtrl.getVisibleItemInfo().count, 5, "5 item should be considered visible on the left side");
			assert.equal(oCtrl.iItemDomRefCount, 9, "There should be 9 items considered navigable by the ItemNavigation (4 left items + 1 overflow button + 4 right items)");
			done();
		}, 500);
	});

	QUnit.test("WidthOk after resize", function(assert) {
		assert.strictEqual(sap.ui.getCore().byId("Toolbar").getWidth(), "350px");
	});

});