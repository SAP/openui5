/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/SelectList",
	"sap/ui/core/ListItem",
	"sap/ui/core/Item",
	"sap/ui/core/SeparatorItem",
	"sap/m/SelectListRenderer",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Select",
	"sap/ui/model/Filter",
	"sap/ui/events/jquery/EventExtension"
], function(
	qutils,
	createAndAppendDiv,
	SelectList,
	ListItem,
	Item,
	SeparatorItem,
	SelectListRenderer,
	mobileLibrary,
	JSONModel,
	Select,
	Filter,
	EventExtension
) {
	// shortcut for sap.m.SelectListKeyboardNavigationMode
	var SelectListKeyboardNavigationMode = mobileLibrary.SelectListKeyboardNavigationMode;

	createAndAppendDiv("content");



	var fnTestControlProperty = function(mOptions) {
		var sProperty = mOptions.property.charAt(0).toUpperCase() + mOptions.property.slice(1);

		QUnit.test("get" + sProperty + "()", function(assert) {
			assert.strictEqual(mOptions.control["get" + sProperty](), mOptions.output, mOptions.description);
		});
	};

	/* --------------------------------- */
	/* tests for default property values */
	/* --------------------------------- */

	QUnit.test("default property values", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0",
					tooltip: "first item"
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),
				new SeparatorItem()
			],
			ariaLabelledBy: "hiddenTextId"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelectList.getVisible(), true, "By default the Select control is visible");
		assert.strictEqual(oSelectList.getEnabled(), true, "By default the SelectList control is enabled");
		assert.strictEqual(oSelectList.getWidth(), "auto", 'By default the "width" of the SelectList control is "auto"');
		assert.strictEqual(oSelectList.getMaxWidth(), "100%", 'By default the "max-width" of the SelectList control is "100%"');
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "", "By default the selected items id of the SelectList control is the id of the first item");
		assert.strictEqual(oSelectList.getSelectedKey(), "", "By default the selected key of the SelectList control is the key property of the first item");
		assert.strictEqual(oSelectList.getFirstItem().getDomRef().getAttribute("title"), "first item", "The tooltip is shown");
		assert.strictEqual(oSelectList.getDomRef().getAttribute("role"), "listbox");
		assert.strictEqual(oSelectList.getFirstItem().getDomRef().getAttribute("role"), "option");
		assert.strictEqual(oSelectList.getLastItem().getDomRef().getAttribute("role"), "separator");
		assert.strictEqual(oSelectList.getFirstItem().getDomRef().getAttribute("aria-selected"), "false");
		assert.strictEqual(oSelectList.getDomRef().getAttribute("aria-labelledby"), "hiddenTextId");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("SelectList item with icon");

	QUnit.test("icon property", function(assert) {

		var oSelectList = new SelectList({
			items: [
				new ListItem({
					key: "1",
					text: "Competitor",
					icon: "sap-icon://competitor"
				})
			]
		});

		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSelectList.$().find("li>span.sapMSelectListItemIcon").length > 0, true, "Icon was rendered on the right place");

		oSelectList.destroy();
	});

	QUnit.module("rendering");

	QUnit.test("rendering", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				})
			],
			selectedKey: "AU"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelectList.getItems()[0].getDomRef().getAttribute("aria-setsize"), "3");
		assert.strictEqual(oSelectList.getItems()[1].getDomRef().getAttribute("aria-setsize"), "3");
		assert.strictEqual(oSelectList.getItems()[2].getDomRef().getAttribute("aria-setsize"), "3");

		assert.strictEqual(oSelectList.getItems()[0].getDomRef().getAttribute("aria-posinset"), "1");
		assert.strictEqual(oSelectList.getItems()[1].getDomRef().getAttribute("aria-posinset"), "2");
		assert.strictEqual(oSelectList.getItems()[2].getDomRef().getAttribute("aria-posinset"), "3");

		assert.strictEqual(oSelectList.getItems()[0].getDomRef().getAttribute("aria-selected"), "false");
		assert.strictEqual(oSelectList.getItems()[1].getDomRef().getAttribute("aria-selected"), "false");
		assert.strictEqual(oSelectList.getItems()[2].getDomRef().getAttribute("aria-selected"), "true");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getVisible");

	fnTestControlProperty({
		control: new SelectList({
			items: [
				new Item({
					key: "1",
					text: "item 1"
				})
			],
			visible: false
		}),
		property: "visible",
		output: false,
		description: "The control is not visible"
	});

	fnTestControlProperty({
		control: new SelectList(),
		property: "visible",
		output: true,
		description: "The control is visible"
	});

	QUnit.module("getEnabled");

	fnTestControlProperty({
		control: new SelectList(),
		property: "enabled",
		output: true,
		description: "The control is enable"
	});

	fnTestControlProperty({
		control: new SelectList({
			enabled: false
		}),
		property: "enabled",
		output: false,
		description: "The control is disabled"
	});

	QUnit.module("getWidth()");

	fnTestControlProperty({
		control: new SelectList({
			width: "50%"
		}),
		property: "width",
		output: "50%",
		description: 'The "width" is "50%"'
	});

	fnTestControlProperty({
		control: new SelectList({
			width: "13rem"
		}),
		property: "width",
		output: "13rem",
		description: 'The "width" is "13rem"'
	});

	fnTestControlProperty({
		control: new SelectList({
			width: "200px"
		}),
		property: "width",
		output: "200px",
		description: 'The "width" is "200px"'
	});

	fnTestControlProperty({
		control: new SelectList({
			width: "4em"
		}),
		property: "width",
		output: "4em",
		description: 'The "width" is "4em"'
	});

	fnTestControlProperty({
		control: new SelectList(),
		property: "width",
		output: "auto",
		description: 'The "width" is "auto"'
	});

	fnTestControlProperty({
		control: new SelectList({
			width: "2in"
		}),
		property: "width",
		output: "2in",
		description: 'The "width" is "2in"'
	});

	fnTestControlProperty({
		control: new SelectList({
			width: "3cm"
		}),
		property: "width",
		output: "3cm",
		description: 'The "width" is "3cm"'
	});

	fnTestControlProperty({
		control: new SelectList({
			width: "125pt"
		}),
		property: "width",
		output: "125pt",
		description: 'The "width" is "125pt"'
	});

	QUnit.module("getMaxWidth()");

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "50%"
		}),
		property: "maxWidth",
		output: "50%",
		description: 'The "maxWidth" is "50%"'
	});

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "13rem"
		}),
		property: "maxWidth",
		output: "13rem",
		description: 'The "maxWidth" is "13rem"'
	});

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "200px"
		}),
		property: "maxWidth",
		output: "200px",
		description: 'The "maxWidth" is "200px"'
	});

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "4em"
		}),
		property: "maxWidth",
		output: "4em",
		description: 'The "maxWidth" is "4em"'
	});

	fnTestControlProperty({
		control: new SelectList(),
		property: "maxWidth",
		output: "100%",
		description: 'The "maxWidth" is "100%"'
	});

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "2in"
		}),
		property: "maxWidth",
		output: "2in",
		description: 'The "maxWidth" is "2in"'
	});

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "3cm"
		}),
		property: "maxWidth",
		output: "3cm",
		description: 'The "maxWidth" is "3cm"'
	});

	fnTestControlProperty({
		control: new SelectList({
			maxWidth: "125pt"
		}),
		property: "maxWidth",
		output: "125pt",
		description: 'The "maxWidth" is "125pt"'
	});

	QUnit.module("getSelectedItem()");

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id1",
					key: "0",
					text: "item 0"
				})
			],

			selectedItem: oExpectedItem
		});

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id1");
		assert.strictEqual(oSelectList.getSelectedKey(), "0");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id1",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id1"
		});

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id1");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedItem: "item-id",
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedKey: "1",
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: []
		});

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: ""
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getSelectedKey()");

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: undefined
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedItem: "item-id",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "3");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedKey: "1",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: []
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedKey()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "0"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "0");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getSelectedItemId()");

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedItem: "item-id",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "3");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedKey: "1",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: []
		});

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: undefined
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getSelectedItemId()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: ""
		});

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("setWidth()");

	QUnit.test("setWidth()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setWidth("400px");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelectList.$().outerWidth() + "px", "400px");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("setEnabled()");

	QUnit.test("setEnabled()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.$().hasClass(SelectListRenderer.CSS_CLASS + "Disabled"), 'If the sap.m.SelectList control is disabled, it should have the CSS class "' + SelectListRenderer.CSS_CLASS + "Disabled");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("addItem()");

	QUnit.test("addItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		var fnAddItemSpy = this.spy(oSelectList, "addItem");
		var oItem = new Item({
			key: "0",
			text: "item 0"
		});

		// act
		oSelectList.addItem(oItem);

		// assert
		assert.ok(oSelectList.getFirstItem() === oItem);
		assert.ok(fnAddItemSpy.returned(oSelectList));

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should not throw an error when showSecondaryValues property is set to true", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			showSecondaryValues: true,
			items: [
				new SeparatorItem(),
				new Item()
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getFirstItem().isActive());
		assert.ok(oSelectList.getFirstItem().$().hasClass(oSelectList.getRenderer().CSS_CLASS + "SeparatorItem"));
		assert.ok(oSelectList.getFirstItem().$().hasClass(oSelectList.getRenderer().CSS_CLASS + "Row"));

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("insertItem()");

	QUnit.test("insertItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		var fnInsertAggregation = this.spy(oSelectList, "insertAggregation");
		var fnInsertItem = this.spy(oSelectList, "insertItem");
		var oItem = new Item({
			key: "0",
			text: "item 0"
		});

		// act
		oSelectList.insertItem(oItem, 0);

		// assert
		assert.ok(oSelectList.getFirstItem() === oItem);
		assert.ok(fnInsertAggregation.calledWith("items", oItem, 0), "insertAggregation() method was called with the expected arguments");
		assert.ok(fnInsertItem.returned(oSelectList), 'oSelectList.insertAggregation() method return the "this" reference');

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("setSelectedItem()");

	QUnit.test("setSelectedItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		var fnSetPropertySpy = this.spy(oSelectList, "setProperty"),
			fnSetAssociationSpy = this.spy(oSelectList, "setAssociation"),
			fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange"),
			fnSetSelectedItemSpy = this.spy(oSelectList, "setSelectedItem");

		// act
		oSelectList.setSelectedItem({});

		// assert
		assert.strictEqual(fnSetPropertySpy.callCount, 0, "sap.m.SelectList.prototype.setProperty() method was not called");
		assert.strictEqual(fnSetAssociationSpy.callCount, 0, "sap.m.SelectList.prototype.setAssociation() method was not called");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selectionChange event was not fired");
		assert.ok(fnSetSelectedItemSpy.returned(oSelectList), 'sap.m.SelectList.prototype.setSelectedItem() method return the "this" reference');
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnSetPropertySpy = this.spy(oSelectList, "setProperty"),
			fnSetAssociationSpy = this.spy(oSelectList, "setAssociation"),
			fnSetSelectedItemSpy = this.spy(oSelectList, "setSelectedItem"),
			fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange");

		// act
		oSelectList.setSelectedItem(oExpectedItem);

		// assert
		assert.strictEqual(fnSetPropertySpy.callCount, 2, 'setProperty() method was called twice, once for the "id" and once for the "key"');
		assert.strictEqual(fnSetAssociationSpy.callCount, 1, "setAssociation() method was called");
		assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
		assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
		assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");
		assert.ok(fnSetSelectedItemSpy.returned(oSelectList), 'sap.m.SelectList.prototype.setSelectedItem() method return the "this" reference');
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selectionChange event was not fired");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnSetPropertySpy = this.spy(oSelectList, "setProperty"),
			fnSetAssociationSpy = this.spy(oSelectList, "setAssociation"),
			fnSetSelectedItemSpy = this.spy(oSelectList, "setSelectedItem"),
			fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange");

		// act
		oSelectList.setSelectedItem("item-id");

		// assert
		assert.strictEqual(fnSetPropertySpy.callCount, 2, 'setProperty() method was called twice, once for the "id" and once for the "key"');
		assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
		assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
		assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");
		assert.ok(fnSetSelectedItemSpy.returned(oSelectList), 'sap.m.SelectList.prototype.setSelectedItem() method return the "this" reference');
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selectionChange event was not fired");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItem()", function(assert) {

		//system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setSelectedItem(oExpectedItem);

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "true");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setSelectedItem(null);

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "false");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("setSelectedItemId()");

	QUnit.test("setSelectedItemId()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange"),
			fnSetSelectedItemIdSpy = this.spy(oSelectList, "setSelectedItemId");

		// act
		oSelectList.setSelectedItemId("item-id");

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selectionChange event was not fired");
		assert.ok(fnSetSelectedItemIdSpy.returned(oSelectList), 'sap.m.SelectList.prototype.setSelectedItemId() method return the "this" reference');
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItemId()", function(assert) {

		//system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setSelectedItemId("item-id");

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "true");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItemId()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setSelectedItemId("");

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "false");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedItemId() should set the value even if the corresponding item doesn't exist on the list", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			selectedItemId: "item-id"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("setSelectedKey()");

	QUnit.test("setSelectedKey() first rendering", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			selectedKey: "2",
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "2");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "true");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedKey() no rendering", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "1"
		});

		// assert
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedKey() after the initial rendering", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnSetPropertySpy = this.spy(oSelectList, "setProperty"),
			fnSetAssociationSpy = this.spy(oSelectList, "setAssociation"),
			fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange"),
			fnSetSelectedKeySpy = this.spy(oSelectList, "setSelectedKey");

		// act
		oSelectList.setSelectedKey("1");

		// assert
		assert.strictEqual(fnSetPropertySpy.callCount, 2, 'setProperty() method was called twice, once for the "id" and once for the "key"');
		assert.strictEqual(fnSetAssociationSpy.callCount, 1, "setAssociation() method was called");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selectionChange event was not fired");
		assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
		assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
		assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
		assert.ok(fnSetSelectedKeySpy.returned(oSelectList), 'sap.m.SelectList.prototype.setSelectedKey() method return the "this" reference');
		assert.ok(oSelectList.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oSelectList.getSelectedItemId(), "item-id");
		assert.strictEqual(oSelectList.getSelectedKey(), "1");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "true");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("setSelectedKey()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setSelectedKey("");

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");
		assert.strictEqual(oExpectedItem.getDomRef().getAttribute("aria-selected"), "false");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("keyboard navigation mode");

	QUnit.test("it should not enable the item navigation (initial rendering)", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			keyboardNavigationMode: SelectListKeyboardNavigationMode.None,
			items: [
				new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getItemNavigation() === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should not enable the item navigation", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			keyboardNavigationMode: SelectListKeyboardNavigationMode.Delimited,
			items: [
				new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.setKeyboardNavigationMode(SelectListKeyboardNavigationMode.None);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getItemNavigation() === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("When keyboardNavigationMode is set to Delimited, it shouldn't prevent browser from navigating to previous or next page.", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oModifiers = oSelectList._oItemNavigation.getDisabledModifiers();

		// assert
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "forward item navigation is not handled when altKey is pressed");
		assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "forward item navigation on MacOS is not handled when metaKey is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "backward item navigation is not handled when altKey is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "backward item navigation on MacOS is not handled when metaKey is pressed");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("removeItem()");

	QUnit.test("it should give a warning when called with faulty parameter", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		var fnRemoveAggregationSpy = this.spy(oSelectList, "removeAggregation");
		var fnRemoveItemSpy = this.spy(oSelectList, "removeItem");
		var fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange");

		// act
		oSelectList.removeItem(undefined);

		// assert
		assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.SelectList.prototype.removeAggregation() method was called");
		assert.ok(fnRemoveAggregationSpy.calledWith("items", undefined), "sap.m.SelectList.prototype.removeAggregation() method was called with the expected argument");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selectionChange event is not fired");
		assert.ok(fnRemoveItemSpy.returned(null), "sap.m.SelectList.prototype.removeItem() method returns null");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("removeItem() remove the selected item", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: {
				path: "/items",
				template: new Item({
					key: "{value}",
					text: "{text}"
				})
			},

			selectedKey: {
				path: "/selected",
				template: "{selected}"
			}
		});

		// arrange
		var oModel = new JSONModel();
		var fnRemoveAggregationSpy = this.spy(oSelectList, "removeAggregation");
		var mData = {
			"items": [
				{
					"value": "0",
					"text": "item 0"
				},

				{
					"value": "1",
					"text": "item 1"
				},

				{
					"value": "2",
					"text": "item 2"
				},

				{
					"value": "3",
					"text": "item 3"
				},

				{
					"value": "4",
					"text": "item 4"
				},

				{
					"value": "5",
					"text": "item 5"
				},

				{
					"value": "6",
					"text": "item 6"
				},

				{
					"value": "7",
					"text": "item 7"
				},

				{
					"value": "8",
					"text": "item 8"
				}
			],

			"selected": "8"
		};

		oModel.setData(mData);
		sap.ui.getCore().setModel(oModel);
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.removeItem(8);

		// assert
		assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.SelectList.prototype.removeAggregation() method was called");
		assert.ok(fnRemoveAggregationSpy.calledWith("items", 8), "sap.m.SelectList.prototype.removeAggregation() method was called with the expected argument");
		assert.strictEqual(oSelectList.getSelectedKey(), "");
		assert.ok(oSelectList.getSelectedItem() === null);

		// cleanup
		oSelectList.destroy();
		oModel.destroy();
	});

	QUnit.test("removeItem() remove the selected item", function(assert) {

		// system under test
		var oSelectList = new SelectList({

			items: {
				path: "/items",
				template: new Item({
					key: "{value}",
					text: "{text}"
				})
			},

			selectedKey: {
				path: "/selected",
				template: "{selected}"
			}
		});

		// arrange
		var oModel = new JSONModel();

		var mData = {
			"items": [
				{
					"value": "0",
					"text": "item 0"
				},

				{
					"value": "1",
					"text": "item 1"
				},

				{
					"value": "2",
					"text": "item 2"
				},

				{
					"value": "3",
					"text": "item 3"
				}
			],

			"selected": "0"
		};

		oModel.setData(mData);
		sap.ui.getCore().setModel(oModel);

		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.removeItem(0);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedKey(), "");
		assert.strictEqual(oSelectList.getSelectedItemId(), "");

		// cleanup
		oSelectList.destroy();
		oModel.destroy();
	});

	QUnit.test("removeItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var oSelectList = new SelectList({
			items: [
				oExpectedItem = new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.removeItem(0);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelectList.getSelectedKey(), "");
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.ok(oExpectedItem.getDomRef() === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("removeAllItems()");

	QUnit.test("removeAllItems()", function(assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnRemoveAllItemsSpy = this.spy(oSelectList, "removeAllItems");
		var fnRemoveAllAggregationSpy = this.spy(oSelectList, "removeAllAggregation");

		// act
		oSelectList.removeAllItems();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(fnRemoveAllAggregationSpy.calledWith("items"), "sap.m.SelectList.prototype.removeAllAggregation() method was called with the expected argument");
		assert.ok(fnRemoveAllItemsSpy.returned(aItems), "sap.m.SelectList.prototype.removeAllItems() method returns an array of the removed items");
		assert.ok(oSelectList.getSelectedItem() === null);
		assert.strictEqual(oSelectList.getSelectedItemId(), "");
		assert.strictEqual(oSelectList.getSelectedKey(), "");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("destroyItems()");

	QUnit.test("destroyItems()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnDestroyItemsSpy = this.spy(oSelectList, "destroyItems");

		// act
		oSelectList.destroyItems();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(fnDestroyItemsSpy.returned(oSelectList), "sap.m.SelectList.prototype.destroyItems() method returns the Select instance");
		assert.ok(oSelectList.getSelectedItem() === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should only remove the items, but not the busy indicator", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item()
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelectList.setBusyIndicatorDelay(0);
		oSelectList.setBusy(true);

		// act
		oSelectList.destroyItems();

		// assert
		assert.strictEqual(oSelectList.getDomRef().childElementCount, 1);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("findFirstEnabledItem()");

	QUnit.test("findFirstEnabledItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oSelectList.findFirstEnabledItem(aItems);

		// assert
		assert.ok(oFirstEnabledItem === oExpectedItem);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("findFirstEnabledItem()", function(assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oSelectList.findFirstEnabledItem(aItems);

		// assert
		assert.ok(oFirstEnabledItem === null, 'The first enabled item is "null"');

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("findFirstEnabledItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oSelectList.findFirstEnabledItem([]);

		// assert
		assert.ok(oFirstEnabledItem === null, 'The first enabled item is "null"');

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("findLastEnabledItem()");

	QUnit.test("findLastEnabledItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oSelectList.findLastEnabledItem(aItems);

		// assert
		assert.ok(oLastEnabledItem === oExpectedItem);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("findLastEnabledItem()", function(assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oSelectList.findLastEnabledItem(aItems);

		// assert
		assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("findLastEnabledItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oSelectList.findLastEnabledItem([]);

		// assert
		assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("setSelectedIndex()");

	var setSelectedIndexTestCase = function(sTestName, mOptions) {
		QUnit.test("setSelectedIndex()", function(assert) {

			// system under test
			var oSelectList = mOptions.control;

			// act
			oSelectList._setSelectedIndex(mOptions.input);

			// assert
			assert.ok(oSelectList.getSelectedItem() === mOptions.output, sTestName);

			// cleanup
			oSelectList.destroy();
		});
	};

	(function() {
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem = new Item({
				key: "3",
				text: "item 3"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		setSelectedIndexTestCase("", {
			control: new SelectList({
				items: aItems
			}),
			input: 2,
			output: oExpectedItem
		});
	}());

	setSelectedIndexTestCase("", {
		control: new SelectList(),
		input: 2,
		output: null
	});

	(function() {
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "3",
				text: "item 3"
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		setSelectedIndexTestCase("The provided index is bigger than the last item's index", {
			control: new SelectList({
				items: aItems
			}),
			input: 10,
			output: oExpectedItem
		});
	}());

	QUnit.module("getItemAt()");

	QUnit.test("getItemAt()", function(assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oSelectList.getItemAt(2),
			oItem1 = oSelectList.getItemAt(6);

		// assert
		assert.ok(oItem === oExpectedItem);
		assert.ok(oItem1 === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getFirstItem()");

	QUnit.test("getFirstItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oSelectList.getFirstItem();

		// assert
		assert.ok(oItem === oExpectedItem);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getFirstItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oExpectedItem = oSelectList.getFirstItem();

		// assert
		assert.ok(oExpectedItem === null, "There are no items");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getLastItem()");

	QUnit.test("getLastItem()", function(assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oSelectList.getLastItem();

		// assert
		assert.ok(oItem === oExpectedItem);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("getLastItem()", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oSelectList.getLastItem();

		// assert
		assert.ok(oItem === null, "There are no items");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getItemByKey()");

	QUnit.test("getItemByKey()", function(assert) {

		// system under test
		var oExpectedItem0;
		var oExpectedItem1;
		var oExpectedItem2;
		var aItems = [
			oExpectedItem0 = new Item({
				key: "0",
				text: "item 0"
			}),

			oExpectedItem1 = new Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem2 = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem0 = oSelectList.getItemByKey("0"),
			oItem1 = oSelectList.getItemByKey("1"),
			oItem2 = oSelectList.getItemByKey("2"),
			oItem3 = oSelectList.getItemByKey("3");

		// assert
		assert.ok(oItem0 === oExpectedItem0);
		assert.ok(oItem1 === oExpectedItem1);
		assert.ok(oItem2 === oExpectedItem2);
		assert.ok(oItem3 === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("getEnabledItems()");

	QUnit.test("getEnabledItems()", function(assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			})
		];

		var oSelectList = new SelectList({
			items: aItems
		});

		// assert + act
		assert.ok(oSelectList.getEnabledItems()[0] === oExpectedItem);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("updateAggregation()");

	// unit test for CSN 0120061532 0001266189 2014
	//
	// Do not clear the selection when items are destroyed.
	// When using Two-Way Data Binding and the binding are refreshed,
	// the items will be destroyed and the aggregation items is filled again.
	QUnit.test("updateAggregation() do not clear the selection when items are destroyed", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: {
				path: "/contries",
				template: new Item({
					key: "{code}",
					text: "{name}"
				})
			},
			selectedKey: {
				path: "/selected"
			}
		});

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"contries": [
				{
					"code": "GER",
					"name": "Germany"
				}, {
					"code": "CU",
					"name": "Cuba"
				}
			],

			// path : selectedKey
			"selected": "CU"
		};

		oModel.setData(mData);
		oSelectList.setModel(oModel);
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.updateAggregation("items");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelectList.getSelectedKey(), "CU");

		// cleanup
		oSelectList.destroy();
		oModel.destroy();
	});

	// BCP 1570825099
	QUnit.test("it should synchronize the selection (synchronous) after the items are filtered", function(assert) {

		// system under test
		var oSelectList = new Select({
			items: {
				path: "/items",
				template: new Item({
					key: "{key}",
					text: "{text}"
				})
			},
			selectedKey: "BH"
		});

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"items": [
				{
					"key": "DZ",
					"text": "Algeria"
				},

				{
					"key": "AR",
					"text": "Argentina"
				},

				{
					"key": "AU",
					"text": "Australia"
				},

				{
					"key": "AT",
					"text": "Austria"
				},

				{
					"key": "BH",
					"text": "Bahrain"
				},

				{
					"key": "BE",
					"text": "Belgium"
				},

				{
					"key": "BA",
					"text": "Bosnia and Herzegovina"
				},

				{
					"key": "BR",
					"text": "Brazil"
				},

				{
					"key": "BG",
					"text": "Bulgaria"
				}
			]
		};

		oModel.setData(mData);
		oSelectList.setModel(oModel);
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.getBinding("items").filter(new Filter("text", "Contains", "b"));

		// assert
		assert.ok(oSelectList.isSelectionSynchronized());

		// cleanup
		oSelectList.destroy();
		oModel.destroy();
	});

	QUnit.module("destroy()");

	QUnit.test("destroy()", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelectList.destroy();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelectList.getItems().length, 0);
		assert.ok(oSelectList.getDomRef() === null);
		assert.ok(oSelectList._oItemNavigation === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("_queryEnabledItemsDomRefs()");

	QUnit.test("_queryEnabledItemsDomRefs()", function(assert) {

		// system under test
		var oEnabledItem;
		var oSelectList = new SelectList({
			items: [
				oEnabledItem = new Item({
					key: "GER",
					text: "Germany"
				}),

				new SeparatorItem(),

				new Item({
					key: "CU",
					text: "Cuba",
					enabled: false
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var aDomRefs = oSelectList._queryEnabledItemsDomRefs();

		// assert
		assert.strictEqual(aDomRefs.length, 1);
		assert.ok(oEnabledItem === sap.ui.getCore().byId(aDomRefs[0].id));

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("rendering");

	QUnit.test("list", function(assert) {

		// system under test
		var oSelectList = new SelectList();

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.$().length, "The list is rendered");
		assert.strictEqual(oSelectList.$().attr("tabindex"), "0", "The tabindex attribute is rendered with the correct value");
		assert.ok(oSelectList.$().hasClass(SelectListRenderer.CSS_CLASS), "The list css class is rendered");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("list disabled", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			enabled: false
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelectList.$().hasClass(SelectListRenderer.CSS_CLASS + "Disabled"), "The disabled css class is rendered");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("list item", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oItem.$().hasClass(SelectListRenderer.CSS_CLASS + "Item"), "The list item css class is rendered");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("list item disabled", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					key: "GER",
					text: "Germany",
					enabled: false
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oItem.$().attr("tabindex"), undefined, "The tabindex attribute is rendered");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("list item separator", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new SeparatorItem({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(!(oItem.$().hasClass(SelectListRenderer.CSS_CLASS + "Item")), "The list item css class is rendered");
		assert.ok(oItem.$().hasClass(SelectListRenderer.CSS_CLASS + "SeparatorItem"), "The list item separator css class is rendered");
		assert.strictEqual(oItem.$().attr("tabindex"), undefined, "The tabindex attribute is rendered");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should display the item", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(getComputedStyle(oItem.getDomRef()).getPropertyValue("display"), "list-item");
		assert.strictEqual(oSelectList.getVisibleItems().length, 1);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should display the item", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: "lorem ipsum"
				})
			]
		});

		// act
		oItem.bVisible = true;

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(getComputedStyle(oItem.getDomRef()).getPropertyValue("display"), "list-item");
		assert.strictEqual(oSelectList.getVisibleItems().length, 1);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should not display the item", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: "lorem ipsum"
				})
			]
		});

		// act
		oItem.bVisible = false;

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(getComputedStyle(oItem.getDomRef()).getPropertyValue("display"), "none");
		assert.ok(oItem.$().hasClass(oSelectList.getRenderer().CSS_CLASS + "ItemBaseInvisible"));
		assert.strictEqual(oSelectList.getVisibleItems().length, 0);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("touchstart");

	QUnit.test("it should set the active state", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: ""
				})
			]
		});

		// arrange
		var CSS_CLASS = SelectListRenderer.CSS_CLASS + "ItemBasePressed";
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelectList.getDomRef(), {
			srcControl: oItem,
			touches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			}
		});

		this.clock.tick(101);

		// assert
		assert.ok(oItem.$().hasClass(CSS_CLASS), "The CSS class " + CSS_CLASS + " should be added");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should not set the active state", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: ""
				})
			]
		});

		// arrange
		var CSS_CLASS = SelectListRenderer.CSS_CLASS + "ItemPressed";
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelectList.getDomRef(), {
			srcControl: oItem,
			touches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			}
		});

		// assert
		assert.ok(!oItem.$().hasClass(CSS_CLASS), "The CSS class " + CSS_CLASS + " should not be added");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should set and remove the active state (there is a movement)", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: ""
				})
			]
		});

		// arrange
		var CSS_CLASS = SelectListRenderer.CSS_CLASS + "ItemPressed";
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelectList.getDomRef(), {
			srcControl: oItem,
			touches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			}
		});

		this.clock.tick(101);

		sap.ui.test.qunit.triggerTouchEvent("touchmove", oSelectList.getDomRef(), {
			srcControl: oItem,
			touches: {
				0: {
					pageX: 1,
					pageY: 19,	// vertical movement
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			changedTouches: {
				0: {
					pageX: 1,
					pageY: 19,	// vertical movement
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			}
		});

		// assert
		assert.ok(!oItem.$().hasClass(CSS_CLASS), "The CSS class " + CSS_CLASS + " should not be added");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("touchend");

	QUnit.test("it should set and remove the active state (no movement)", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		var CSS_CLASS = SelectListRenderer.CSS_CLASS + "ItemPressed";
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelectList.focus();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelectList.getDomRef(), {
			srcControl: oItem,
			touches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			}
		});

		sap.ui.test.qunit.triggerTouchEvent("touchend", oSelectList.getDomRef(), {
			srcControl: oItem,
			changedTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		});

		this.clock.tick(101);

		// assert
		assert.ok(!oItem.$().hasClass(CSS_CLASS), "The CSS class " + CSS_CLASS + " should not be added");

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("tap");

	QUnit.test("it should fire the press and selectionChange events", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange");
		var fnFireItemPressSpy = this.spy(oSelectList, "fireItemPress");

		// act
		sap.ui.test.qunit.triggerTouchEvent("tap", oSelectList.getDomRef(), {
			srcControl: oItem,
			changedTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		});

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(fnFireItemPressSpy.callCount, 1, 'The "press" event is fired');
		assert.ok(oSelectList.getSelectedItem() === oItem);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.test("it should not fire the press and selectionChange events", function(assert) {

		// system under test
		var oItem;
		var oSelectList = new SelectList({
			items: [
				oItem = new Item({
					enabled: false,
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange");
		var fnFireItemPressSpy = this.spy(oSelectList, "fireItemPress");

		// act
		sap.ui.test.qunit.triggerTouchEvent("tap", oSelectList.getDomRef(), {
			srcControl: oItem,
			changedTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItem.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		});

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0);
		assert.strictEqual(fnFireItemPressSpy.callCount, 0);
		assert.ok(oSelectList.getSelectedItem() === null);

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("onsapselect");

	QUnit.test("onsapselect activates a item", function(assert) {

		// system under test
		var oSelectList = new SelectList({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireSelectionChangeSpy = this.spy(oSelectList, "fireSelectionChange");

		// act
		oSelectList.onsapselect(jQuery.Event("sapselect", {
			srcControl: oSelectList.getLastItem()
		}));

		// assert
		assert.ok(oSelectList.getSelectedItem() === oSelectList.getLastItem());
		assert.strictEqual(oSelectList.getSelectedKey(), "CU");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');

		// cleanup
		oSelectList.destroy();
	});

	QUnit.module("aria-setsize and aria-posinset");

	QUnit.test("Behavior with SeparatorItem in the items", function (assert) {
		var oSelectList = new SelectList({
			items: [
				new Item("firstItem", {
					key: "item0",
					text: "Item 0"
				}),
				new SeparatorItem("separator"),
				new Item("secondItem", {
					key: "item1",
					text: "Item 1"
				})
			]
		});

		oSelectList.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery("#firstItem").attr("aria-posinset"), "1", "First item has correct aria-posinset");
		assert.notOk(jQuery("#separator").attr("aria-posinset"), "Separator shouldn't have attribute aria-posinset");
		assert.strictEqual(jQuery("#secondItem").attr("aria-posinset"), "2", "aria-posinset was skipped for separator and now continues");

		// Loop through each item and check the aria-setsize attribute on it's DOM reference
		oSelectList.getItems().forEach(function (oItem) {
			assert.strictEqual(oItem.$().attr("aria-setsize"), "2", "aria-setsize does not include separators");
		});

		oSelectList.destroy();
	});
});
