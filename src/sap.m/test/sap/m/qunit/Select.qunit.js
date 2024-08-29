/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/base/strings/capitalize",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/SelectRenderer",
	"sap/ui/core/ListItem",
	"sap/m/Label",
	"sap/m/ComboBoxTextField",
	"sap/m/SelectList",
	"sap/m/OverflowToolbar",
	"sap/ui/core/Element",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/ui/core/SeparatorItem",
	"sap/ui/core/ValueStateSupport",
	"sap/ui/dom/getFirstEditableInput",
	"sap/uxap/HierarchicalSelect",
	"sap/ui/base/Event",
	// side effect: provides jQuery.Event.prototype.isMarked
	"sap/ui/events/jquery/EventExtension"

],
	function(
		Library,
		nextUIUpdate,
		jQuery,
		qutils,
		createAndAppendDiv,
		Capitalize,
		Log,
		KeyCodes,
		Select,
		Item,
		coreLibrary,
		JSONModel,
		SelectRenderer,
		ListItem,
		Label,
		ComboBoxTextField,
		SelectList,
		OverflowToolbar,
		Element,
		mobileLibrary,
		IconPool,
		Device,
		SeparatorItem,
		ValueStateSupport,
		getFirstEditableInput,
		HierarchicalSelect,
		Event
	) {
		"use strict";

		// shortcut for sap.ui.core.OpenState
		var OpenState = coreLibrary.OpenState;

		// shortcut for sap.m.SelectType
		var SelectType = mobileLibrary.SelectType;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		createAndAppendDiv("content").className = "content";

		var mTestModelData = {
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
				},

				{
					"key": "CA",
					"text": "Canada"
				},

				{
					"key": "CL",
					"text": "Chile"
				},

				{
					"key": "CO",
					"text": "Colombia"
				},

				{
					"key": "HR",
					"text": "Croatia"
				},

				{
					"key": "CU",
					"text": "Cuba"
				},

				{
					"key": "CZ",
					"text": "Czech Republic"
				},

				{
					"key": "DK",
					"text": "Denmark"
				},

				{
					"key": "EG",
					"text": "Egypt"
				},

				{
					"key": "EE",
					"text": "Estonia"
				},

				{
					"key": "FI",
					"text": "Finland"
				},

				{
					"key": "FR",
					"text": "France"
				},

				{
					"key": "GH",
					"text": "Ghana"
				},

				{
					"key": "GR",
					"text": "Greece"
				},

				{
					"key": "HK",
					"text": "Hong Kong"
				},

				{
					"key": "HU",
					"text": "Hungary"
				},

				{
					"key": "IN",
					"text": "India"
				},

				{
					"key": "ID",
					"text": "Indonesia"
				},

				{
					"key": "IE",
					"text": "Ireland"
				},

				{
					"key": "IL",
					"text": "Israel"
				},

				{
					"key": "IT",
					"text": "Italy"
				},

				{
					"key": "JP",
					"text": "Japan"
				},

				{
					"key": "JO",
					"text": "Jordan"
				},

				{
					"key": "KE",
					"text": "Kenya"
				},

				{
					"key": "KW",
					"text": "Kuwait"
				},

				{
					"key": "LV",
					"text": "Latvia"
				},

				{
					"key": "LT",
					"text": "Lithuania"
				},

				{
					"key": "MK",
					"text": "Macedonia"
				},

				{
					"key": "MY",
					"text": "Malaysia"
				},

				{
					"key": "MX",
					"text": "Mexico"
				},

				{
					"key": "ME",
					"text": "Montenegro"
				},

				{
					"key": "MA",
					"text": "Morocco"
				},

				{
					"key": "NL",
					"text": "Netherlands"
				},

				{
					"key": "NZ",
					"text": "New Zealand"
				},

				{
					"key": "NG",
					"text": "Nigeria"
				},

				{
					"key": "NO",
					"text": "Norway"
				},

				{
					"key": "OM",
					"text": "Oman"
				},

				{
					"key": "PE",
					"text": "Peru"
				},

				{
					"key": "PH",
					"text": "Philippines"
				},

				{
					"key": "PL",
					"text": "Poland"
				},

				{
					"key": "PT",
					"text": "Portugal"
				},

				{
					"key": "QA",
					"text": "Qatar"
				},

				{
					"key": "RO",
					"text": "Romania"
				},

				{
					"key": "RU",
					"text": "Russia"
				},

				{
					"key": "SA",
					"text": "Saudi Arabia"
				},

				{
					"key": "SN",
					"text": "Senegal"
				},

				{
					"key": "RS",
					"text": "Serbia"
				},

				{
					"key": "SG",
					"text": "Singapore"
				},

				{
					"key": "SK",
					"text": "Slovakia"
				},

				{
					"key": "SI",
					"text": "Slovenia"
				},

				{
					"key": "ZA",
					"text": "South Africa"
				},

				{
					"key": "KR",
					"text": "South Korea"
				},

				{
					"key": "ES",
					"text": "Spain"
				},

				{
					"key": "SE",
					"text": "Sweden"
				},

				{
					"key": "CH",
					"text": "Switzerland"
				},

				{
					"key": "TW",
					"text": "Taiwan"
				},

				{
					"key": "TN",
					"text": "Tunisia"
				},

				{
					"key": "TR",
					"text": "Turkey"
				},

				{
					"key": "UG",
					"text": "Uganda"
				},

				{
					"key": "UA",
					"text": "Ukraine"
				},

				{
					"key": "AE",
					"text": "United Arab Emirates"
				},

				{
					"key": "GB",
					"text": "United Kingdom"
				},

				{
					"key": "YE",
					"text": "Yemen"
				}
			]
		};

		// helper functions
		var fnTestControlProperty = function (mOptions) {
			var sProperty = Capitalize(mOptions.property);

			QUnit.test("get" + sProperty + "()", function (assert) {
				assert.strictEqual(mOptions.control["get" + sProperty](), mOptions.output, mOptions.description);
			});
		};

		var fnToMobileMode = function () {
			jQuery("html").removeClass("sapUiMedia-Std-Desktop")
				.removeClass("sapUiMedia-Std-Tablet")
				.addClass("sapUiMedia-Std-Phone");
			Device.system.desktop = false;
			Device.system.tablet = false;
			Device.system.phone = true;
		};
		var fnToDesktopMode = function () {
			jQuery("html").removeClass("sapUiMedia-Std-Phone")
				.removeClass("sapUiMedia-Std-Tablet")
				.addClass("sapUiMedia-Std-Desktop");
			Device.system.desktop = true;
			Device.system.tablet = false;
			Device.system.phone = false;
		};
		var fnToTabletMode = function () {
			jQuery("html").removeClass("sapUiMedia-Std-Desktop")
				.removeClass("sapUiMedia-Std-Phone")
				.addClass("sapUiMedia-Std-Tablet");
			Device.system.desktop = false;
			Device.system.phone = false;
			Device.system.tablet = true;
		};

		QUnit.module("default values");

		QUnit.test("default values", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						id: "item-id",
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1",
						enabled: false
					}),

					new Item({
						key: "2",
						text: "item 2"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getName(), "", 'Default name is ""');
			assert.strictEqual(oSelect.getVisible(), true, "By default the Select control is visible");
			assert.strictEqual(oSelect.getEnabled(), true, "By default the Select control is enabled");
			assert.strictEqual(oSelect.getEditable(), true, "By default the Select control is editable");
			assert.strictEqual(oSelect.getWidth(), "auto", 'By default the "width" of the Select control is "auto"');
			assert.strictEqual(oSelect.getMaxWidth(), "100%", 'By default the "max-width" of the Select control is "100%"');
			assert.ok(oSelect.getSelectedItem() === oSelect.getFirstItem(), "By default the selected items of the Select control is the first item");
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id", "By default the selected items id of the Select control is the id of the first item");
			assert.strictEqual(oSelect.getSelectedKey(), "0", "By default the selected key of the Select control is the key property of the first item");
			assert.strictEqual(oSelect.getTextAlign(), TextAlign.Initial, "By default textAlign is set to Initial");
			assert.strictEqual(oSelect.getTextDirection(), TextDirection.Inherit, "By default textDirection is set to Inherit");
			assert.strictEqual(oSelect.$().attr("aria-invalid"), undefined);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getName()");

		fnTestControlProperty({
			control: new Select({
				visible: false
			}),
			property: "name",
			output: "",
			description: 'The name is ""'
		});

		fnTestControlProperty({
			control: new Select({
				name: "my-select",
				items: [
					new Item({
						key: "1",
						text: "item 1"
					})
				]
			}),
			property: "name",
			output: "my-select",
			description: 'The name is ""'
		});

		QUnit.module("getVisible()");

		fnTestControlProperty({
			control: new Select({
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
			description: "Is not visible"
		});

		fnTestControlProperty({
			control: new Select(),
			property: "visible",
			output: true,
			description: "Is visible"
		});

		QUnit.module("getEnabled()");

		fnTestControlProperty({
			control: new Select(),
			property: "enabled",
			output: true,
			description: "Is enable"
		});

		fnTestControlProperty({
			control: new Select({
				enabled: false
			}),
			property: "enabled",
			output: false,
			description: "Is disabled"
		});

		QUnit.module("getEditable()");

		fnTestControlProperty({
			control: new Select(),
			property: "editable",
			output: true,
			description: "Is editable"
		});

		fnTestControlProperty({
			control: new Select({
				editable: false
			}),
			property: "editable",
			output: false,
			description: "Isn't editable"
		});

		QUnit.module("getWidth()");

		fnTestControlProperty({
			control: new Select({
				width: "50%"
			}),
			property: "width",
			output: "50%",
			description: 'The "width" is "50%"'
		});

		fnTestControlProperty({
			control: new Select({
				width: "13rem"
			}),
			property: "width",
			output: "13rem",
			description: 'The "width" is "13rem"'
		});

		fnTestControlProperty({
			control: new Select({
				width: "200px"
			}),
			property: "width",
			output: "200px",
			description: 'The "width" is "200px"'
		});

		fnTestControlProperty({
			control: new Select({
				width: "4em"
			}),
			property: "width",
			output: "4em",
			description: 'The "width" is "4em"'
		});

		fnTestControlProperty({
			control: new Select(),
			property: "width",
			output: "auto",
			description: 'The "width" is "auto"'
		});

		fnTestControlProperty({
			control: new Select({
				width: "2in"
			}),
			property: "width",
			output: "2in",
			description: 'The "width" is "2in"'
		});

		fnTestControlProperty({
			control: new Select({
				width: "3cm"
			}),
			property: "width",
			output: "3cm",
			description: 'The "width" is "3cm"'
		});

		fnTestControlProperty({
			control: new Select({
				width: "125pt"
			}),
			property: "width",
			output: "125pt",
			description: 'The "width" is "125pt"'
		});

		QUnit.module("getMaxWidth()");

		fnTestControlProperty({
			control: new Select({
				maxWidth: "50%"
			}),
			property: "maxWidth",
			output: "50%",
			description: 'The "maxWidth" is "50%"'
		});

		fnTestControlProperty({
			control: new Select({
				maxWidth: "13rem"
			}),
			property: "maxWidth",
			output: "13rem",
			description: 'The "maxWidth" is "13rem"'
		});

		fnTestControlProperty({
			control: new Select({
				maxWidth: "200px"
			}),
			property: "maxWidth",
			output: "200px",
			description: 'The "maxWidth" is "200px"'
		});

		fnTestControlProperty({
			control: new Select({
				maxWidth: "4em"
			}),
			property: "maxWidth",
			output: "4em",
			description: 'The "maxWidth" is "4em"'
		});

		fnTestControlProperty({
			control: new Select(),
			property: "maxWidth",
			output: "100%",
			description: 'The "maxWidth" is "100%"'
		});

		fnTestControlProperty({
			control: new Select({
				maxWidth: "2in"
			}),
			property: "maxWidth",
			output: "2in",
			description: 'The "maxWidth" is "2in"'
		});

		fnTestControlProperty({
			control: new Select({
				maxWidth: "3cm"
			}),
			property: "maxWidth",
			output: "3cm",
			description: 'The "maxWidth" is "3cm"'
		});

		fnTestControlProperty({
			control: new Select({
				maxWidth: "125pt"
			}),
			property: "maxWidth",
			output: "125pt",
			description: 'The "maxWidth" is "125pt"'
		});

		QUnit.module("getTextDirection()");

		fnTestControlProperty({
			control: new Select({
				textDirection: TextDirection.RTL
			}),
			property: "textDirection",
			output: "RTL",
			description: "Text direction is RTL"
		});

		fnTestControlProperty({
			control: new Select({
				textDirection: TextDirection.LTR
			}),
			property: "textDirection",
			output: "LTR",
			description: "Text direction is LTR"
		});

		QUnit.module("getTextAlign()");

		fnTestControlProperty({
			control: new Select({
				textAlign: TextAlign.Left
			}),
			property: "textAlign",
			output: "Left",
			description: "Text align is left"
		});

		fnTestControlProperty({
			control: new Select({
				textAlign: TextAlign.Right
			}),
			property: "textAlign",
			output: "Right",
			description: "Text align is right"
		});

		QUnit.module("getSelectedItem");

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id1");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id1");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id1");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id1");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({

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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oSelect = new Select({
				items: []
			});

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedKey: ""
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly (forceSelection = false)", function (assert) {

			// system under test
			var oSelect = new Select({
				forceSelection: false,
				items: [
					new Item({
						key: "0",
						text: "item 0"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getSelectedItemId");

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedItemId: undefined
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedItemId: ""
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						id: "item-id",
						key: "0",
						text: "item 0"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "3");
			assert.strictEqual(oSelect.getSelectedIndex(), 3);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "3");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oSelect = new Select({
				items: []
			});

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedItemId: ""
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getSelectedKey");

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedKey: undefined
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						id: "item-id",
						key: "0",
						text: "item 0"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "3");
			assert.strictEqual(oSelect.getSelectedIndex(), 3);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "3");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oSelect = new Select({
				items: []
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedItemId: undefined
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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

				selectedItemId: ""
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly when the item aggregation is bound to a JSON model and the selectedKey property is not bound", function (assert) {

			// system under test
			var oSelect = new Select({
				items: {
					path: "/items",
					template: new Item({
						key: "{key}",
						text: "{text}"
					})
				}
			});

			// arrange
			var oModel = new JSONModel();
			var mData = {
				"items": [
					{
						"key": "GER",
						"text": "Germany"
					},

					{
						"key": "CU",
						"text": "Cuba"
					}
				]
			};

			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "GER");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "GER");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.strictEqual(oSelect.$("label").text(), "Germany");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly when the item aggregation and the selectedKey property are bound to a JSON model", function (assert) {

			// system under test
			var oSelect = new Select({
				selectedKey: {
					path: "/selected"
				},
				items: {
					path: "/items",
					template: new Item({
						key: "{key}",
						text: "{text}"
					})
				}
			});

			// arrange
			var oModel = new JSONModel();
			var mData = {
				"items": [
					{
						"key": "GER",
						"text": "Germany"
					},
					{
						"key": "CU",
						"text": "Cuba"
					}
				],
				"selected": "CU"
			};

			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "CU");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "CU");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.strictEqual(oSelect.$("label").text(), "Cuba");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		// unit test for CSN 0120061532 0001300097 2014
		QUnit.test("update the selection when the model has changed", function (assert) {

			// system under test
			var oSelect = new Select({
				items: {
					path: "/contries",
					template: new Item({
						key: "{code}",
						text: "{name}"
					})
				}
			});

			// arrange + act
			var oModel = new JSONModel();
			var mData = {
				"contries": [
					{
						"code": "GER",
						"name": "Germany"
					},
					{
						"code": "CU",
						"name": "Cuba"
					}
				]
			};

			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			mData.contries.shift();	// remove the first item of the model
			oModel.setData(mData);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "CU");
			assert.strictEqual(oSelect.getSelectedItem().getKey(), "CU");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.strictEqual(oSelect.getList().getSelectedKey(), "CU");
			assert.strictEqual(oSelect.getList().getSelectedItem().getKey(), "CU");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		// BCP 1570296493
		QUnit.test("it should synchronize property changes of items to the select control", function (assert) {

			// system under test
			var oItem;
			var oSelect = new Select({
				items: [
					oItem = new Item({
						key: "CU",
						text: "Cuba"
					})
				],
				selectedKey: "CU"
			});

			// act
			oItem.setKey("GER");
			oItem.setText("Germany");

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "GER");
			assert.strictEqual(oSelect.getSelectedItem().getText(), "Germany");

			// cleanup
			oSelect.destroy();
		});

		// BCP 1670351685
		QUnit.test("it should select the selected item after the dropdown is open", function (assert) {

			// system under test
			var oModel = new JSONModel();

			oModel.setData(mTestModelData);

			var oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			var oSelect = new Select({
				items: {
					path: "/items",
					template: oItemTemplate
				}
			}).setModel(oModel);

			// arrange
			oSelect.placeAt("content");
			var oScrollToItemSpy = this.spy(oSelect, "scrollToItem");
			oSelect.setSelectedKey("YE");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			// assert
			assert.ok(oScrollToItemSpy.withArgs(oSelect.getSelectedItem()).calledOnce,
				"after the dropdown is opened the scrollToItem is called");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		// BCP 1570472488
		QUnit.test("it should not fire the change event after the selection has changed (via keyboard) and the scrollbar is pressed", function (assert) {

			// system under test
			var oModel = new JSONModel();

			oModel.setData(mTestModelData);

			var oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			var oSelect = new Select({
				items: {
					path: "/items",
					template: oItemTemplate
				},

				change: function (oControlEvent) {
					Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
				}
			}).setModel(oModel);

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed
			var oPickerDomRef = oSelect.getPicker().getDomRef("cont");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
			qutils.triggerEvent("mousedown", oPickerDomRef, {
				target: oPickerDomRef
			});

			oPickerDomRef.focus();

			qutils.triggerEvent("mouseup", oPickerDomRef, {
				target: oPickerDomRef
			});

			qutils.triggerEvent("click", oPickerDomRef, {
				target: oPickerDomRef
			});

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0);

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.module("Update selection on item changes BCP: 1870551736", {
			assertCurrentItemIsSelected: function (oSelect, oItem, assert) {
				var sItemId = oItem.getId();

				assert.strictEqual(oSelect.getAssociation("selectedItem"), sItemId,
					"Expected item is assigned to the 'selectedItem' association");
				assert.strictEqual(oSelect.getSelectedItemId(), sItemId,
					"Expected item is assigned to the 'selectedItemId' property");
				assert.strictEqual(oSelect.getSelectedKey(), oItem.getKey(),
					"'key' of the selected item is equal to the select 'selectedKey' property");
			}
		});

		QUnit.test("We update the select properly when it`s item change", function (assert) {

			// Arrange
			var oItem1,
				oItem2,
				oItem3,
				oSelect = new Select({
					items: [
						oItem1 = new Item({
							key: "one"
						}),
						oItem2 = new Item({
							key: "two"
						}),
						oItem3 = new Item({
							key: "three"
						})
					],
					selectedKey: "one"
				});

			// Assert

			// Current items list status should be
			// oItem1.key = one [selected]
			// oItem2.key = two
			// oItem3.key = three
			this.assertCurrentItemIsSelected(oSelect, oItem1, assert);

			// Act - we change the selected key
			oSelect.setSelectedKey("two");

			// Assert

			// Current items list status should be
			// oItem1.key = one
			// oItem2.key = two [selected]
			// oItem3.key = three
			this.assertCurrentItemIsSelected(oSelect, oItem2, assert);

			// Act - we change the "key" of the first item in the list
			oItem1.setKey("two");

			// Assert

			// Current items list status should be
			// oItem1.key = two [selected]
			// oItem2.key = two
			// oItem3.key = three
			this.assertCurrentItemIsSelected(oSelect, oItem1, assert);

			// Act - we change the "key" of the second item in the list
			oItem2.setKey("one");

			// Assert

			// Current items list status should be
			// oItem1.key = two [selected]
			// oItem2.key = one
			// oItem3.key = three
			this.assertCurrentItemIsSelected(oSelect, oItem1, assert);

			// Act - we change the "key" of the third item in the list
			oItem3.setKey("two");

			// Assert

			// Current items list status should be
			// oItem1.key = two [selected]
			// oItem2.key = one
			// oItem3.key = two
			this.assertCurrentItemIsSelected(oSelect, oItem1, assert);

			// Act - we change the "key" of the first item in the list
			oItem1.setKey("new");

			// Assert

			// Current items list status should be
			// oItem1.key = new
			// oItem2.key = one
			// oItem3.key = two [selected]
			this.assertCurrentItemIsSelected(oSelect, oItem3, assert);

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("insertItem at index 0 with the same 'key' as current 'selectedKey' and current list contains item with " +
			"the same 'key'", function (assert) {

			// Arrange
			var oItem3 = new Item({
					key: "two"
				}),
				oSelect = new Select({
					items: [
						new Item({
							key: "one"
						}),
						new Item({
							key: "two"
						})
					],
					selectedKey: "two"
				}).placeAt("content");

			// Act - insert oItem3 at index 0 of the aggregation
			oSelect.insertItem(oItem3, 0);

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem3.key = two [selected]
			// oItem1.key = one
			// oItem2.key = two
			this.assertCurrentItemIsSelected(oSelect, oItem3, assert);

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("insertItem at last index should update the selected item when current list does not contain item " +
			"with the same 'key'", function (assert) {

			// Arrange
			var oItem3 = new Item({
					key: "three"
				}),
				oSelect = new Select({
					items: [
						new Item({
							key: "one"
						}),
						new Item({
							key: "two"
						})
					],
					selectedKey: "three"
				}).placeAt("content");

			// Act - insert oItem3 as last item in the aggregation
			oSelect.insertItem(oItem3, 2);

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem1.key = one
			// oItem2.key = two
			// oItem3.key = three [selected]
			this.assertCurrentItemIsSelected(oSelect, oItem3, assert);

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("insertItem at last index and current list contains item with the same 'key'", function (assert) {
			// Arrange
			var oItem2,
				oSelect = new Select({
					items: [
						new Item({
							key: "one"
						}),
						oItem2 = new Item({
							key: "two"
						})
					],
					selectedKey: "two"
				}).placeAt("content");

			// Act - insert oItem3 as last item in the aggregation
			oSelect.insertItem(new Item({
				key: "two"
			}), 2);

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem1.key = one
			// oItem2.key = two [selected]
			// oItem3.key = two
			this.assertCurrentItemIsSelected(oSelect, oItem2, assert);

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("addItem at with the same 'key' as current 'selectedKey' and current list does not contain item with the " +
			"same 'key'", function (assert) {
			// Arrange
			var oItem3 = new Item({
					key: "three"
				}),
				oSelect = new Select({
					items: [
						new Item({
							key: "one"
						}),
						new Item({
							key: "two"
						})
					],
					selectedKey: "three"
				}).placeAt("content");

			// Act - insert oItem3 at index 0 of the aggregation
			oSelect.addItem(oItem3);

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem1.key = one
			// oItem2.key = two
			// oItem3.key = three [selected]
			this.assertCurrentItemIsSelected(oSelect, oItem3, assert);

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("addItem at last index and current list contains item with the same 'key'", function (assert) {
			// Arrange
			var oItem2,
				oSelect = new Select({
					items: [
						new Item({
							key: "one"
						}),
						oItem2 = new Item({
							key: "two"
						})
					],
					selectedKey: "two"
				}).placeAt("content");

			// Act - insert oItem3 at index 0 of the aggregation
			oSelect.addItem(new Item({
				key: "two"
			}));

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem1.key = one
			// oItem2.key = two [selected]
			// oItem3.key = two
			this.assertCurrentItemIsSelected(oSelect, oItem2, assert);

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("remove the current selected item should update the selected item and list contains item with the same key",
			function (assert) {

			// Arrange
			var oItem1,
				oItem2,
				oSelect = new Select({
					items: [
						oItem1 = new Item({
							key: "two"
						}),
						oItem2 = new Item({
							key: "two"
						}),
						new Item({
							key: "three"
						})
					],
					selectedKey: "two"
				}).placeAt("content");

			this.assertCurrentItemIsSelected(oSelect, oItem1, assert);

			// Act - remove oItem1 from the aggregation
			oSelect.removeItem(oItem1);

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem2.key = two [selected]
			// oItem3.key = three
			this.assertCurrentItemIsSelected(oSelect, oItem2, assert);

			// Cleanup
			oSelect.destroy();
			oItem1.destroy(); // oItem1 removed from the select aggregation
		});

		QUnit.test("remove the current selected item should update the selected item and list does not contain item " +
			"with the same 'key'", function (assert) {

			// Arrange
			var oItem1,
				oItem2,
				oSelect = new Select({
					items: [
						oItem1 = new Item({
							key: "one"
						}),
						oItem2 = new Item({
							key: "two"
						}),
						new Item({
							key: "three"
						})
					],
					selectedKey: "one"
				}).placeAt("content");

			this.assertCurrentItemIsSelected(oSelect, oItem1, assert);

			// Act - insert oItem3 at index 0 of the aggregation
			oSelect.removeItem(oItem1);

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Current items list status should be
			// oItem2.key = two [selected]
			// oItem3.key = three
			this.assertCurrentItemIsSelected(oSelect, oItem2, assert);

			// Cleanup
			oSelect.destroy();
			oItem1.destroy(); // oItem1 removed from the select aggregation
		});

		QUnit.module("setName()");

		QUnit.test("it should render an input field with the value of the selected key", function (assert) {

			// system under test
			var oSelectDomRef,
				oSelect = new Select({
				name: "lorem ipsum",
				items: [
					new Item({
						key: "lorem",
						text: "lorem ipsum"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setName("select-name0");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelectDomRef = oSelect._getHiddenInput();

			// assert
			assert.strictEqual(oSelectDomRef.attr("name"), "select-name0", 'The attribute name is "select-name0"');
			assert.strictEqual(oSelectDomRef.attr("value"), "lorem");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("setWidth()");

		QUnit.test("setWidth()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setWidth("400px");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.$().outerWidth() + "px", "400px");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("setEnabled()");

		QUnit.test("setEnabled()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setEnabled(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Disabled"), 'If the select control is disabled, it should have the CSS class "' + SelectRenderer.CSS_CLASS + "Disabled");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("Editable property", {
			beforeEach: function () {
				this.oSelect = new Select({
					items: [
						new Item({
							key: "0",
							text: "item 0"
						})
					]
				});

				this.oSelect.placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;
			},
			afterEach: function () {
				this.oSelect.destroy();
				this.oSelect = null;
			}
		});

		QUnit.test("Setting Editable property to false", function (assert) {

			// act
			this.oSelect.setEditable(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(this.oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Readonly"), 'If the select control is not editable, it should have the CSS class "' + SelectRenderer.CSS_CLASS + 'Readonly".');
		});

		QUnit.test("Enabled should have precedence over Editable", function (assert) {

			// act
			this.oSelect.setEditable(false);
			this.oSelect.setEnabled(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.notOk(this.oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Readonly"), 'If the select control is not editable and it is disabled, it should not have the CSS class "' + SelectRenderer.CSS_CLASS + 'Readonly".');
			assert.ok(this.oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Disabled"), 'If the select control is disabled, it should have the CSS class "' + SelectRenderer.CSS_CLASS + 'Disabled".');
		});

		QUnit.module("two column layout");

		QUnit.test("it should forward the value of the showSecondaryValues to the list", function (assert) {

			// system under test
			var oSelect = new Select({
				showSecondaryValues: true,
				items: [
					new ListItem({
						key: "lorem",
						text: "lorem ipsum",
						additionalText: "lorem"
					})
				]
			});

			// assert
			assert.ok(oSelect.getList().getShowSecondaryValues());

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should returns the this reference to allow method chaining", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new ListItem({
						key: "lorem",
						text: "lorem ipsum",
						additionalText: "lorem"
					})
				]
			});

			// arrange
			var fnSetShowSecondaryValuesSpy = this.spy(oSelect, "setShowSecondaryValues");

			// act
			oSelect.setShowSecondaryValues(true);

			// assert
			assert.ok(fnSetShowSecondaryValuesSpy.returned(oSelect));

			// cleanup
			oSelect.destroy();
		});

		// github #1177
		QUnit.test("it should adjust the width of the field to the size of its content", function (assert) {

			// system under test
			var oSelect = new Select({
				width: "auto",
				items: [
					new ListItem({
						key: "lorem",
						text: "lorem",
						additionalText: "lorem"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var sWidth = oSelect.getDomRef().offsetWidth;

			// act
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed
			oSelect.setShowSecondaryValues(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getDomRef().offsetWidth > sWidth);

			// cleanup
			oSelect.destroy();
		});

		/* ------------------------------ */
		/* getLabels()					*/
		/* ------------------------------ */

		QUnit.test("it should return an array with one object which is the current target of the ariaLabelledBy association", function (assert) {

			// system under test
			var oLabel = new Label();
			var oSelect = new ComboBoxTextField({
				ariaLabelledBy: [
					oLabel
				]
			});

			// assertions
			assert.strictEqual(oSelect.getLabels().length, 1);
			assert.ok(oSelect.getLabels()[0] === oLabel);

			// cleanup
			oSelect.destroy();
			oLabel.destroy();
		});

		QUnit.test("it should return an array with one object which is the label referencing the text field", function (assert) {

			// system under test
			var oSelect = new ComboBoxTextField();
			var oLabel = new Label({
				labelFor: oSelect
			});

			// assertions
			assert.strictEqual(oSelect.getLabels().length, 1);
			assert.ok(oSelect.getLabels()[0] === oLabel);

			// cleanup
			oSelect.destroy();
			oLabel.destroy();
		});

		QUnit.test("it should return an array of objects which are the current targets of the ariaLabelledBy association and the labels referencing the text field", function (assert) {

			// system under test
			var oSelect;
			var oLabel1 = new Label({
				id: "lorem-ipsum-label",
				labelFor: oSelect
			});
			oSelect = new ComboBoxTextField({
				ariaLabelledBy: [
					"lorem-ipsum-label"
				]
			});
			var oLabel2 = new Label({
				labelFor: oSelect
			});

			// assertions
			assert.strictEqual(oSelect.getLabels().length, 2);
			assert.ok(oSelect.getLabels()[0] === oLabel1);
			assert.ok(oSelect.getLabels()[1] === oLabel2);

			// cleanup
			oSelect.destroy();
			oLabel1.destroy();
			oLabel2.destroy();
		});

		QUnit.module("addItem()");

		QUnit.test("addItem()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var fnAddItemSpy = this.spy(oSelect, "addItem");
			var oItem = new Item({
				key: "0",
				text: "item 0"
			});

			// act
			oSelect.addItem(oItem);

			// assert
			assert.ok(oSelect.getFirstItem() === oItem);
			assert.ok(oSelect.getList().getFirstItem() === oItem);
			assert.ok(fnAddItemSpy.returned(oSelect));
			assert.ok(oItem.hasListeners("_change"));
			// assert.ok(oItem.data(sap.m.SelectRenderer.CSS_CLASS + "ItemVisible"), "The item is marked as visible");	TODO

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should not throw an exeption", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var fnAddItemSpy = this.spy(oSelect, "addItem");

			// act
			oSelect.addItem(null);

			// assert
			assert.ok(fnAddItemSpy.returned(oSelect));

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("insertItem()");

		QUnit.test("insertItem()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var fnInsertAggregation = this.spy(oSelect, "insertAggregation");
			var fnInsertItem = this.spy(oSelect, "insertItem");
			var oItem = new Item({
				key: "0",
				text: "item 0"
			});

			// act
			oSelect.insertItem(oItem, 0);

			// assert
			assert.ok(oSelect.getFirstItem() === oItem);
			assert.ok(oSelect.getList().getFirstItem() === oItem);
			assert.ok(fnInsertAggregation.calledWith("items", oItem, 0), "insertAggregation() method was called with the expected arguments");
			assert.ok(fnInsertItem.returned(oSelect), 'oSelect.insertAggregation() returns this to allow method chaining');
			assert.ok(oItem.hasListeners("_change"));
			// assert.ok(oItem.data(sap.m.SelectRenderer.CSS_CLASS + "ItemVisible"), "The item is marked as visible");	TODO

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("insertItem() it should not throw an exeption", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var fnInsertItemSpy = this.spy(oSelect, "insertItem");

			// act
			oSelect.insertItem(null);

			// assert
			assert.ok(fnInsertItemSpy.returned(oSelect));

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("SelectList _tabIndex");

		QUnit.test("SelectList should have tabidnex='-1'", function (assert) {
			// system under test
			var oSelect = new Select(),
				oList = oSelect.getList();

			assert.strictEqual(oList.getProperty("_tabIndex"), "-1", "SelectList _tabIndex property is set to -1");
		});

		QUnit.module("setSelectedItem()");

		QUnit.test("setSelectedItem() should give a warning when called with faulty parameter", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var fnSetPropertySpy = this.spy(oSelect, "setProperty"),
				fnFireChangeSpy = this.spy(oSelect, "fireChange"),
				fnSetSelectedItemSpy = this.spy(oSelect, "setSelectedItem");

			// act
			oSelect.setSelectedItem({});

			// assert
			assert.strictEqual(fnSetPropertySpy.callCount, 0, "sap.m.Select.prototype.setProperty() method was not called");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
			assert.ok(fnSetSelectedItemSpy.returned(oSelect), 'sap.m.Select.prototype.setSelectedItem() returns this to allow method chaining');
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedItem()", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			var fnSetPropertySpy = this.spy(SelectList.prototype, "setProperty"),
				fnSetAssociationSpy = this.spy(SelectList.prototype, "setAssociation"),
				fnFireChangeSpy = this.spy(oSelect, "fireChange"),
				fnSetSelectedItemSpy = this.spy(oSelect, "setSelectedItem");

			// act
			oSelect.setSelectedItem(oExpectedItem);

			// assert
			assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
			assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
			assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			assert.ok(fnSetSelectedItemSpy.returned(oSelect), 'sap.m.Select.prototype.setSelectedItem() returns this to allow method chaining');
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedItem()", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			var fnSetPropertySpy = this.spy(SelectList.prototype, "setProperty"),
				fnSetAssociationSpy = this.spy(SelectList.prototype, "setAssociation"),
				fnFireChangeSpy = this.spy(oSelect, "fireChange"),
				fnSetSelectedItemSpy = this.spy(oSelect, "setSelectedItem");

			// act
			oSelect.setSelectedItem("item-id");

			// assert
			assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
			assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
			assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			assert.ok(fnSetSelectedItemSpy.returned(oSelect), 'sap.m.Select.prototype.setSelectedItem() returns this to allow method chaining');
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedItem()", function (assert) {

			//system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedItem(oExpectedItem);

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");
			assert.strictEqual(oSelect.$("label").text(), "item 2");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedItem()", function (assert) {

			//system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedItem(null);

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly when the dropdown list is open", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
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
				],

				selectedKey: "2"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelect.open();
			this.clock.tick(500);

			// act
			oSelect.setSelectedItem(null);

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), oExpectedItem.getId());
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), oExpectedItem.getId());
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("setSelectedItemId()");

		QUnit.test("setSelectedItemId()", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			var fnFireChangeSpy = this.spy(oSelect, "fireChange"),
				fnSetSelectedItemIdSpy = this.spy(oSelect, "setSelectedItemId");

			// act
			oSelect.setSelectedItemId("item-id");

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
			assert.ok(fnSetSelectedItemIdSpy.returned(oSelect), 'sap.m.Select.prototype.setSelectedItemId() returns this to allow method chaining');
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedItemId()", function (assert) {

			//system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedItemId("item-id");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");
			assert.strictEqual(oSelect.$("label").text(), "item 2");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedItemId()", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedItemId("");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly when the dropdown list is open", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
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
				],

				selectedKey: "2"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelect.open();
			this.clock.tick(500);

			// act
			oSelect.setSelectedItemId("");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), oExpectedItem.getId());
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), oExpectedItem.getId());
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the value even if the corresponding item doesn't exist", function (assert) {

			// system under test
			var oSelect = new Select({
				selectedItemId: "item-id"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assertions
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("setSelectedKey");

		QUnit.test("it should set the selection correctly (initial rendering)", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({

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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");
			assert.strictEqual(oSelect.$("label").text(), "item 2");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly (before rendering)", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.strictEqual(oSelect.$("label").text(), "item 1");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly after the initial rendering", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			var fnSetPropertySpy = this.spy(SelectList.prototype, "setProperty"),
				fnSetAssociationSpy = this.spy(SelectList.prototype, "setAssociation"),
				fnFireChangeSpy = this.spy(oSelect, "fireChange"),
				fnSetSelectedKeySpy = this.spy(oSelect, "setSelectedKey");

			// act
			oSelect.setSelectedKey("1");

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
			assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
			assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
			assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
			assert.ok(fnSetSelectedKeySpy.returned(oSelect), 'sap.m.Select.prototype.setSelectedKey() returns this to allow method chaining');
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			assert.strictEqual(oSelect.$("label").text(), "item 1");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setSelectedKey()", function (assert) {

			//system under test
			var oExpectedItem;
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedKey("");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly when the dropdown list is open", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
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
				],

				selectedKey: "2"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelect.open();
			this.clock.tick(500);

			// act
			oSelect.setSelectedKey("");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), oExpectedItem.getId());
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedIndex(), 0);
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), oExpectedItem.getId());
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set the selection correctly when forceSelection=false and the item's keys are not provided", function (assert) {

			// system under test
			var oSelect = new Select({
				forceSelection: false,
				items: [
					new Item()
				]
			});

			// act
			oSelect.setSelectedKey("");

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should reset selection if key is missing", function (assert) {

			var itemA = new Item({
				key: "A",
				text: "Item A"
			});

			var itemB = new Item({
				key: "B",
				text: "Item B"
			});

			var itemX = new Item({
				key: "X",
				text: "Item X"
			});

			// system under test
			var oSelect = new Select({
				forceSelection: false,
				resetOnMissingKey: true,
				items: [
					itemA,
					itemB
				]
			});

			var missingKey = "X";
			var existingKey = "B";
			var defaultSelectedItemId = "";

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedKey(missingKey);

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), defaultSelectedItemId);
			assert.strictEqual(oSelect.getSelectedKey(), missingKey);
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), defaultSelectedItemId);
			assert.strictEqual(oSelect.getList().getSelectedKey(), missingKey);

			// act
			oSelect.setSelectedKey(existingKey);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			assert.ok(oSelect.getSelectedItem() !== null);
			assert.strictEqual(oSelect.getSelectedItemId(), itemB.getId());
			assert.strictEqual(oSelect.getSelectedKey(), existingKey);
			assert.strictEqual(oSelect.getSelectedIndex(), 1);
			assert.strictEqual(oSelect.$("label").text(), "Item B");
			assert.ok(oSelect.getList().getSelectedItem() !== null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), itemB.getId());
			assert.strictEqual(oSelect.getList().getSelectedKey(), existingKey);

			/**
			 * The effect of checking "resetOnMissingKey: true" starts here
			 */

			 // act
			oSelect.setSelectedKey(missingKey);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), defaultSelectedItemId);
			assert.strictEqual(oSelect.getSelectedKey(), missingKey);
			assert.strictEqual(oSelect.getSelectedIndex(), -1);
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), defaultSelectedItemId);
			assert.strictEqual(oSelect.getList().getSelectedKey(), missingKey);

			// act
			oSelect.addItem(itemX);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.getSelectedItem() !== null);
			assert.strictEqual(oSelect.getSelectedItemId(), itemX.getId());
			assert.strictEqual(oSelect.getSelectedKey(), itemX.getKey());
			assert.strictEqual(oSelect.getSelectedIndex(), 2);
			assert.strictEqual(oSelect.$("label").text(), itemX.getText());
			assert.ok(oSelect.getList().getSelectedItem() !== null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), itemX.getId());
			assert.strictEqual(oSelect.getList().getSelectedKey(), itemX.getKey());

			// cleanup
			oSelect.destroy();
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		});

		QUnit.test("it should render placeholders right when forceSelection=false and item is not provided initialy", function (assert) {

			// system under test
			var oSelect = new Select({
				forceSelection: false,
				items: [
					new Item({
						key: "1",
						text: "First item"
					}),
					new ListItem({
						key: "2",
						text: "Second item",
						icon: "sap-icon://competitor"
					})
				]
			});
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.setSelectedItem(null);

			// assert
			assert.ok(oSelect.getSelectedItem() === null, "no item selected");
			assert.strictEqual(!!oSelect.$("label").find(".sapMSelectListItemText").text(), false, "text placeholder is empty");
			assert.strictEqual(oSelect.$("label").find("[id*=-labelIcon]").hasClass("sapUiHiddenPlaceholder"), true, "icon placeholder is hidden");

			oSelect.setSelectedKey("1");
			this.clock.tick();
			assert.strictEqual(oSelect.$("label").find(".sapMSelectListItemText").text(), "First item", "text placeholder was filled right");
			assert.strictEqual(oSelect.$("label").find("[id*=-labelIcon]").hasClass("sapUiHiddenPlaceholder"), true, "icon placeholder is hidden");

			oSelect.setSelectedKey("2");
			this.clock.tick();
			assert.strictEqual(oSelect.$("label").find(".sapMSelectListItemText").text(), "Second item", "text placeholder was filled right");
			assert.strictEqual(oSelect.$("label").find("[id*=-labelIcon]").hasClass("sapMSelectListItemIcon"), true, "icon placeholder was filled right");
			assert.strictEqual(oSelect._getValueIcon().getSrc(), "sap-icon://competitor", "icon was set right");

			oSelect.setSelectedKey("1");
			this.clock.tick();
			assert.strictEqual(oSelect.$("label").find(".sapMSelectListItemText").text(), "First item", "text placeholder was filled right");
			assert.strictEqual(oSelect.$("label").find("[id*=-labelIcon]").hasClass("sapUiHiddenPlaceholder"), true, "icon placeholder is hidden");

			oSelect.setSelectedItem(null);
			this.clock.tick();
			assert.ok(oSelect.getSelectedItem() === null, "no item selected");
			assert.strictEqual(!!oSelect.$("label").find(".sapMSelectListItemText").text(), false, "text placeholder is empty");
			assert.strictEqual(oSelect.$("label").find("[id*=-labelIcon]").hasClass("sapUiHiddenPlaceholder"), true, "icon placeholder is hidden");
			// cleanup
			oSelect.destroy();
		});

		QUnit.test("icon should be destroyed", function (assert) {

			// system under test
			var oSelect = new Select({
				forceSelection: false,
				items: [
					new Item({
						key: "1",
						text: "First item"
					}),
					new ListItem({
						key: "2",
						text: "Second item",
						icon: "sap-icon://competitor"
					})
				]
			});

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.destroy();

			// assert
			assert.strictEqual(oSelect._getValueIcon(), null, "icon is destroyed");
		});

		// BCP 1580101530
		QUnit.test("it should correctly synchronize the selection after the properties (models and bindingContext) are propagated", function (assert) {

			// system under test
			var oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			var oSelect = new Select({
				selectedKey: {
					path: "/selected"
				},
				items: {
					path: "/items",
					template: oItemTemplate
				}
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
					}
				],
				"selected": "AR"
			};

			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "AR");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		// BCP 1780153332
		QUnit.test("it should not fire the select event after losing focus, when the selection was changed while the select was focused", function (assert) {

			// system under test
			var oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			var oSelect = new Select({
				selectedKey: {
					path: "/selected"
				},
				items: {
					path: "/items",
					template: oItemTemplate
				}
			});

			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

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
					}
				],
				"selected": "AR"
			};

			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act - focus, change the selection while focused, then blur
			oSelect.focus();
			oSelect.setSelectedKey("DZ");
			oSelect.getFocusDomRef().blur();

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0);

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.module("Altering the model");

		QUnit.test("Changing selected item's data model of sap.m.Select should fire _itemTextChange event", function (assert) {

			// system under test
			var oModel, spy;
			var oSelect = new Select({
				autoAdjustWidth: true,
				items: [
					new Item({id: "idItem1", text: "{/}"})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oModel = new JSONModel();
			oModel.setData("text");
			oSelect.setModel(oModel);
			spy = this.spy(Element.prototype, "fireEvent");

			// act
			oModel.setData("extremely long text");
			oSelect.setModel(oModel);

			// assert
			assert.ok(spy.calledWithExactly("_itemTextChange"), "fireEvent is called with exactly '_itemTextChange' argument");
			assert.ok(spy.withArgs("_itemTextChange").calledOnce, "fireEvent is called only once");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("value state");

		QUnit.test("it should add the value state CSS classes (initial rendering)", function (assert) {

			// system under test
			var oSelectDomRef,
				oSelect = new Select({
				valueState: ValueState.Error
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

			oSelectDomRef = oSelect._getHiddenSelect();

			// assert
			assert.strictEqual(oSelectDomRef.attr("aria-invalid"), "true");
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "Error"));
			assert.ok(oSelect.$("label").hasClass(CSS_CLASS + "LabelState"));
			assert.ok(oSelect.$("label").hasClass(CSS_CLASS + "LabelError"));
			assert.ok(oSelect.$("arrow").hasClass(CSS_CLASS + "ArrowState"));

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should add the value state CSS classes", function (assert) {

			// system under test
			var oSelectDomRef,
				oSelect = new Select();

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

			oSelectDomRef = oSelect._getHiddenSelect();

			// act
			oSelect.setValueState(ValueState.Error);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelectDomRef.attr("aria-invalid"), "true");
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "Error"));
			assert.ok(oSelect.$("label").hasClass(CSS_CLASS + "LabelState"));
			assert.ok(oSelect.$("label").hasClass(CSS_CLASS + "LabelError"));
			assert.ok(oSelect.$("arrow").hasClass(CSS_CLASS + "ArrowState"));

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should remove the value state CSS classes", function (assert) {

			// system under test
			var oSelect = new Select({
				valueState: ValueState.Error
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

			// act
			oSelect.setValueState(ValueState.None);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.$().attr("aria-invalid"), undefined);
			assert.notOk(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.notOk(oSelect.$().hasClass(CSS_CLASS + "Error"));
			assert.notOk(oSelect.$("label").hasClass(CSS_CLASS + "LabelState"));
			assert.notOk(oSelect.$("label").hasClass(CSS_CLASS + "LabelError"));
			assert.notOk(oSelect.$("arrow").hasClass(CSS_CLASS + "ArrowState"));

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should contain the value state text id in the aria-labelledby attribute", function (assert) {
			var oSuccessSelect = new Select({ valueState: ValueState.Success }),
				oWarningSelect = new Select({ valueState: ValueState.Warning }),
				oErrorSelect = new Select({ valueState: ValueState.Error }),
				oInformationSelect = new Select({ valueState: ValueState.Information }),
				fnCheckValueStateText = function (oSelect) {
					var oValueStateTextDomRef = document.getElementById(oSelect.getValueStateMessageId() + "-sr"),
						sExpectedValueStateText = ValueStateSupport.getAdditionalText(oSelect);

					return oValueStateTextDomRef && (oValueStateTextDomRef.textContent.indexOf(sExpectedValueStateText) > -1);
				};

			// arrange
			oSuccessSelect.placeAt("content");
			oWarningSelect.placeAt("content");
			oErrorSelect.placeAt("content");
			oInformationSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(fnCheckValueStateText(oSuccessSelect), "success select is labelled by invisible text");
			assert.ok(fnCheckValueStateText(oWarningSelect), "warning select is labelled by invisible text");
			assert.ok(fnCheckValueStateText(oErrorSelect), "error select should not be labelled by invisible text since it has aria-invalid set");
			assert.ok(fnCheckValueStateText(oInformationSelect), "Information select is labelled by invisible text");

			// act
			oSuccessSelect.setValueState("None");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.notOk(fnCheckValueStateText(oSuccessSelect), "success select is no longer labelled by success invisible text");

			// act
			oErrorSelect.setValueState("Success");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(fnCheckValueStateText(oErrorSelect), "error select is now labelled by success invisible text");

			// act
			oWarningSelect.setValueState("Error");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(fnCheckValueStateText(oWarningSelect), "warning select is not labelled by the error invisible text");

			// cleanup
			oSuccessSelect.destroy();
			oWarningSelect.destroy();
			oErrorSelect.destroy();
			oInformationSelect.destroy();
		});

		QUnit.test("valueState with enabled and editable set to false", function(assert) {
			// system under test
			var oSelect = new Select({
				enabled: false,
				valueState: ValueState.Error

			}),
			CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

			// act
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;


			// assert
			assert.notOk(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.notOk(oSelect.$().hasClass(CSS_CLASS + "Error"));

			// act
			oSelect.setEnabled(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "Error"));

			// act
			oSelect.setEditable(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.notOk(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.notOk(oSelect.$().hasClass(CSS_CLASS + "Error"));

			// act
			oSelect.setEditable(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "State"));
			assert.ok(oSelect.$().hasClass(CSS_CLASS + "Error"));

			// cleanup
			oSelect.destroy();

		});

		QUnit.module("setTooltip()");

		QUnit.test("it should display the default tooltip of the icon if control toolitp is not set", function (assert) {

			// system under test
			var oSelect = new Select({
				type: SelectType.IconOnly,
				icon: IconPool.getIconURI("filter")
			}),
			oSelectDomRef,
			oIconInfo = IconPool.getIconInfo(oSelect.getIcon()),
			sIconText = oIconInfo && oIconInfo.text;

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelectDomRef = oSelect.getFocusDomRef();
			// assert
			assert.strictEqual(oSelectDomRef.getAttribute("title"), sIconText);
			assert.strictEqual(oSelect.$("icon").attr("title"), sIconText);

			// cleanup
			oSelect.destroy();
		});

		// BCP 1580232802
		QUnit.test("it should display the control tooltip instead of the default tooltip of the icon", function (assert) {

			// system under test
			var oSelect = new Select({
				tooltip: "lorem ipsum",
				type: SelectType.IconOnly,
				icon: IconPool.getIconURI("filter")
			}),
			oSelectDomRef;

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelectDomRef = oSelect.getFocusDomRef();
			// assert
			assert.strictEqual(oSelectDomRef.getAttribute("title"), "lorem ipsum");
			assert.strictEqual(oSelect.$("icon").attr("title"), oSelect.getTooltip_AsString());

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should display the control tooltip when the select has value state", function (assert) {
			// system under test
			var sSampleText = "lorem ipsum",
				oSelect = new Select({
					tooltip: sSampleText
				}),
				oSuccessSelect = new Select({
					tooltip: sSampleText,
					valueState: ValueState.Success
				}),
				oWarningSelect = new Select({
					tooltip: sSampleText,
					valueState: ValueState.Warning
				}),
				oErrorSelect = new Select({
					tooltip: sSampleText,
					valueState: ValueState.Error
				}),
				oInformationSelect = new Select({
					tooltip: sSampleText,
					valueState: ValueState.Information
				});

			// arrange
			oSelect.placeAt("content");
			oSuccessSelect.placeAt("content");
			oWarningSelect.placeAt("content");
			oErrorSelect.placeAt("content");
			oInformationSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSuccessSelect.getFocusDomRef().getAttribute("title"), sSampleText, "select title attribute is correct");
			assert.strictEqual(oWarningSelect.getFocusDomRef().getAttribute("title"), sSampleText, "select title attribute is correct");
			assert.strictEqual(oErrorSelect.getFocusDomRef().getAttribute("title"), sSampleText, "select title attribute is correct");
			assert.strictEqual(oInformationSelect.getFocusDomRef().getAttribute("title"), sSampleText, "select title attribute is correct");
			// since focusable element has sapUiPseudoInvisibleText class the tooltip is also set to the label element to be visually displayed
			assert.strictEqual(oSelect.$("label").attr("title"), sSampleText, "select title attribute is correct");

			// cleanup
			oSuccessSelect.destroy();
			oWarningSelect.destroy();
			oErrorSelect.destroy();
			oInformationSelect.destroy();
		});

		QUnit.module("removeItem()");

		QUnit.test("it should return null when called with an invalid input argument value", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var fnRemoveAggregationSpy = this.spy(oSelect.getList(), "removeAggregation");
			var fnRemoveItemSpy = this.spy(oSelect, "removeItem");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			oSelect.removeItem(undefined);

			// assert
			assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.SelectList.prototype.removeAggregation() method was called");
			assert.ok(fnRemoveAggregationSpy.calledWith("items", undefined), "sap.m.SelectList.prototype.removeAggregation() method was called with the expected argument");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(fnRemoveItemSpy.returned(null), "sap.m.Select.prototype.removeItem() method returns null");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should remove the selected item and change the selection to the first enabled item will be selected if any (test case 1)", function (assert) {

			// system under test
			var oSelect = new Select({
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
			var fnRemoveAggregationSpy = this.spy(oSelect.getList(), "removeAggregation");
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
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			var oSelectedItem = oSelect.getItemByKey("8");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.removeItem(8);

			// assert
			assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.SelectList.prototype.removeAggregation() method was called");
			assert.ok(fnRemoveAggregationSpy.calledWith("items", 8), "sap.m.SelectList.prototype.removeAggregation() method was called with the expected argument");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.strictEqual(oSelect.getSelectedItem().getText(), "item 0");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.getList().getSelectedItem().getText(), "item 0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(oSelectedItem.hasListeners("_change"), false);

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.test("it should remove the selected item and change the selection to the first enabled item will be selected if any (test case 2)", function (assert) {

			// system under test
			var oSelect = new Select({

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
			oSelect.setModel(oModel);

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.removeItem(0);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedItem().getId(), oSelect.getSelectedItemId());
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.strictEqual(oSelect.getSelectedItem().getText(), "item 1");
			assert.strictEqual(oSelect.getList().getSelectedItem().getId(), oSelect.getSelectedItemId());
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			assert.strictEqual(oSelect.getList().getSelectedItem().getText(), "item 1");
			assert.strictEqual(oSelect.$("label").text(), "item 1");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.test("it should remove the selected item and change the selection to null (test case 3)", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						key: "0",
						text: "item 0"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.removeItem(0);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.ok(oExpectedItem.getDomRef() === null);
			assert.strictEqual(oExpectedItem.hasListeners("_change"), false);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("removeAllItems()");

		QUnit.test("removeAllItems()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var fnRemoveAllItemsSpy = this.spy(oSelect, "removeAllItems");
			var fnRemoveAllAggregationSpy = this.spy(oSelect.getList(), "removeAllAggregation");
			var fnListRemoveAllItemsSpy = this.spy(oSelect.getList(), "removeAllItems");

			// act
			var oRemovedItems = oSelect.removeAllItems();

			// assert
			assert.ok(fnRemoveAllAggregationSpy.calledWith("items"), "sap.m.Select.prototype.removeAllAggregation() method was called with the expected argument");
			assert.strictEqual(fnListRemoveAllItemsSpy.callCount, 1, "sap.m.List.prototype.removeAllItems() method was called");
			assert.ok(fnRemoveAllItemsSpy.returned(aItems), "sap.m.Select.prototype.removeAllItems() method returns an array of the removed items");
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(oSelect.$("select").children().length, 0);

			for (var i = 0; i < oRemovedItems.length; i++) {
				assert.strictEqual(oRemovedItems[i].hasListeners("_change"), false);
			}

			// cleanup
			oSelect.destroy();
		});

		// BCP 1680168526
		QUnit.test("it should clear the label value when the items are removed and the control is invalidated", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "li",
						text: "lorem ipsum"
					})
				],
				selectedKey: "li"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.removeAllItems();
			oSelect.invalidate();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "li");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("destroyItems()");

		QUnit.test("destroyItems()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var fnDestroyItemsSpy = this.spy(oSelect, "destroyItems");

			// act
			oSelect.destroyItems();

			// assert
			assert.ok(fnDestroyItemsSpy.returned(oSelect), "sap.m.Select.prototype.destroyItems() returns this to allow method chaining");
			assert.ok(oSelect.getSelectedItem() === null);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(oSelect.$().children("." + oSelect.getList().getRenderer().CSS_CLASS).length, 1);
			assert.strictEqual(oSelect.$().children("." + oSelect.getList().getRenderer().CSS_CLASS).children().length, 0);

			for (var i = 0; i < aItems.length; i++) {
				assert.strictEqual(aItems[i].hasListeners("_change"), false);
			}

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("open()");

		QUnit.test("open() on desktop", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.open();
			this.clock.tick(1000);

			// assert
			assert.ok(oSelect.isOpen(), "the dropdown list is open");
			assert.ok(oSelect.hasStyleClass(SelectRenderer.CSS_CLASS + "Pressed"));
			assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "the text field should get the focus");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("open() on phone", function (assert) {

			this.stub(Device, "system").value({
				desktop: false,
				phone: true,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			document.documentElement.style.overflow = "hidden"; // hide scrollbar during test

			// act
			oSelect.open();
			this.clock.tick(1000);

			// assert
			assert.ok(oSelect.isOpen(), "Select is open");
			assert.ok(oSelect.hasStyleClass(SelectRenderer.CSS_CLASS + "Pressed"));

			// cleanup
			oSelect.destroy();
			document.documentElement.style.overflow = ""; // restore scrollbar after test
		});

		QUnit.test("open() on tablet", function (assert) {

			this.stub(Device, "system").value({
				desktop: false,
				phone: false,
				tablet: true
			});

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.open();
			this.clock.tick(1000);

			// assert
			assert.ok(oSelect.isOpen(), "the dropdown list is open");
			assert.ok(oSelect.hasStyleClass(SelectRenderer.CSS_CLASS + "Pressed"));
			assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "the text field should get the focus");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("open() check whether the active state persist after re-rendering", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelect.open();
			this.clock.tick(500);

			// act
			oSelect.invalidate();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSelect.hasStyleClass(SelectRenderer.CSS_CLASS + "Pressed"));

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("open() the picker popup (dropdown list) should automatically size itself to fit its content", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				width: "100px",
				items: [
					new Item({
						text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.open();
			this.clock.tick(500);

			// assert
			assert.ok(oSelect.getPicker().getDomRef().offsetWidth > 100);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("open() function should focus the select, before opening the picker", function (assert) {
			//Arrange
			var oSelect = new Select(),
				fnOpenPicker = oSelect.getPicker().open,
				oSpy = this.spy(oSelect, "focus");

			oSelect.getPicker().open = function() {
				//Assert
				assert.ok(oSpy.calledOnce, "Select is focused, before the popup is open");
				fnOpenPicker.call(this, arguments);
			};
			oSelect.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Act
			oSelect.open();

			//Clean
			oSelect.destroy();
		});

		QUnit.module("close()");

		QUnit.test("close() on phone restores focus to the select", function (assert) {

			this.stub(Device, "system").value({
				desktop: false,
				phone: true,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			document.documentElement.style.overflow = "hidden"; // hide scrollbar during test

			// act
			qutils.triggerTouchEvent("tap", oSelect.getDomRef(), {
				srcControl: oSelect
			});

			this.clock.tick(1000);

			// assert
			assert.ok(oSelect.isOpen(), "Select is open");

			// act
			oSelect.close();
			this.clock.tick(1000);

			// assert
			assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "Focus was successfully restored to the Select");

			// cleanup
			oSelect.destroy();
			document.documentElement.style.overflow = ""; // restore scrollbar after test
		});

		QUnit.module("findFirstEnabledItem()");

		QUnit.test("findFirstEnabledItem()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oFirstEnabledItem = oSelect.findFirstEnabledItem(aItems);

			// assert
			assert.ok(oFirstEnabledItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findFirstEnabledItem()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oFirstEnabledItem = oSelect.findFirstEnabledItem(aItems);

			// assert
			assert.ok(oFirstEnabledItem === null, 'The first enabled item is "null"');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findFirstEnabledItem()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oFirstEnabledItem = oSelect.findFirstEnabledItem([]);

			// assert
			assert.ok(oFirstEnabledItem === null, 'The first enabled item is "null"');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("findLastEnabledItem()");

		QUnit.test("findLastEnabledItem()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oLastEnabledItem = oSelect.findLastEnabledItem(aItems);

			// assert
			assert.ok(oLastEnabledItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findLastEnabledItem()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oLastEnabledItem = oSelect.findLastEnabledItem(aItems);

			// assert
			assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findLastEnabledItem()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oLastEnabledItem = oSelect.findLastEnabledItem([]);

			// assert
			assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("findNextItemByFirstCharacter()");

		QUnit.test("searchNextItemByText() returns the correct item", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						text: "Albania"
					}),

					new Item({
						text: "Algeria"
					})
				]
			});

			// arrange
			oSelect.setSelectedItem(oSelect.getFirstItem());

			// act
			var oCurrItem = oSelect.searchNextItemByText("al");

			// assert
			assert.ok(oCurrItem === oExpectedItem,
				"If the user is still typing and the input matches the currently selected item, we don't forward to the next one.");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findNextItemByFirstCharacter() test case 1", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Algeria"
					}),

					oExpectedItem = new Item({
						text: "Argentina"
					}),

					new Item({
						text: "Australia"
					})
				]
			});

			// arrange
			oSelect.setSelectedItem(oSelect.getFirstItem());

			// act
			var oNextItem = oSelect.searchNextItemByText("a");

			// assert
			assert.ok(oNextItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findNextItemByFirstCharacter() test case 2", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria"
					}),

					new Item({
						key: "AR",
						text: "Argentina"
					}),

					oExpectedItem = new Item({
						key: "AU",
						text: "Australia"
					})
				]
			});

			// arrange
			oSelect.setSelectedKey("AR");

			// act
			var oNextItem = oSelect.searchNextItemByText("a");

			// assert
			assert.ok(oNextItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findNextItemByFirstCharacter() test case 3", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
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
				]
			});

			// arrange
			oSelect.setSelectedKey("AU");

			// act
			var oNextItem = oSelect.searchNextItemByText("a");

			// assert
			assert.ok(oNextItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findNextItemByFirstCharacter() test case 4", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria"
					}),

					new Item({
						key: "AR",
						text: "Argentina",
						enabled: false
					}),

					oExpectedItem = new Item({
						key: "AU",
						text: "Australia"
					}),

					new Item({
						key: "AT",
						text: "Austria"
					})
				]
			});

			// arrange
			oSelect.setSelectedKey("DZ");

			// act
			var oNextItem = oSelect.searchNextItemByText("a");

			// assert
			assert.ok(oNextItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findNextItemByFirstCharacter() test case 5", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria"
					}),

					new SeparatorItem(),

					oExpectedItem = new Item({
						key: "AU",
						text: "Australia"
					}),

					new Item({
						key: "AT",
						text: "Austria"
					})
				]
			});

			// arrange
			oSelect.setSelectedItem(oSelect.getFirstItem());

			// act
			var oNextItem = oSelect.searchNextItemByText("a");

			// assert
			assert.ok(oNextItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("findNextItemByFirstCharacter() test case 6", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria"
					}),

					new Item({
						key: "AU",
						text: "Australia"
					}),

					new Item({
						key: "AT",
						text: "Austria"
					})
				]
			});

			// arrange
			oSelect.setSelectedKey("DZ");

			// act
			var oNextItem = oSelect.searchNextItemByText("b");

			// assert
			assert.ok(oNextItem === null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("setSelectedIndex()");

		var setSelectedIndexTestCase = function (sTestName, mOptions) {
			QUnit.test("setSelectedIndex()", function (assert) {

				// system under test
				var oSelect = mOptions.control;

				// act
				oSelect.setSelectedIndex(mOptions.input);

				// assert
				assert.ok(oSelect.getSelectedItem() === mOptions.output, sTestName);

				// cleanup
				oSelect.destroy();
			});
		};

		(function () {
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
				control: new Select({
					items: aItems
				}),
				input: 2,
				output: oExpectedItem
			});
		}());

		setSelectedIndexTestCase("", {
			control: new Select(),
			input: 2,
			output: null
		});

		(function () {
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
				control: new Select({
					items: aItems
				}),
				input: 10,
				output: oExpectedItem
			});
		}());

		QUnit.module("getItemAt()");

		QUnit.test("getItemAt()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oItem = oSelect.getItemAt(2),
				oItem1 = oSelect.getItemAt(6);

			// assert
			assert.ok(oItem === oExpectedItem);
			assert.ok(oItem1 === null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getFirstItem()");

		QUnit.test("getFirstItem()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oItem = oSelect.getFirstItem();

			// assert
			assert.ok(oItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("getFirstItem()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oExpectedItem = oSelect.getFirstItem();

			// assert
			assert.ok(oExpectedItem === null, "There are no items");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getLastItem()");

		QUnit.test("getLastItem()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oItem = oSelect.getLastItem();

			// assert
			assert.ok(oItem === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("getLastItem()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oItem = oSelect.getLastItem();

			// assert
			assert.ok(oItem === null, "There are no items");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getItemByKey()");

		QUnit.test("getItemByKey()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			var oItem0 = oSelect.getItemByKey("0"),
				oItem1 = oSelect.getItemByKey("1"),
				oItem2 = oSelect.getItemByKey("2"),
				oItem3 = oSelect.getItemByKey("3");

			// assert
			assert.ok(oItem0 === oExpectedItem0);
			assert.ok(oItem1 === oExpectedItem1);
			assert.ok(oItem2 === oExpectedItem2);
			assert.ok(oItem3 === null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getEnabledItems()");

		QUnit.test("getEnabledItems()", function (assert) {

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

			var oSelect = new Select({
				items: aItems
			});

			// assert + act
			assert.ok(oSelect.getEnabledItems()[0] === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("destroy()");

		QUnit.test("destroy()", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var fnDestroySpy = this.spy(oSelect.getValueStateMessage(), "destroy");

			// act
			oSelect.destroy();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getItems().length, 0);
			assert.strictEqual(fnDestroySpy.callCount, 1, "value state message is destroyed");
			assert.ok(oSelect.getDomRef() === null);
			assert.ok(oSelect.getPicker() === null);
			assert.ok(oSelect.getList() === null);
			assert.strictEqual(oSelect._oValueStateMessage, null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("calling destroy() when the Select's picker popup is open", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelect.open();
			this.clock.tick(1000);

			// act
			oSelect.destroy();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getItems().length, 0);
			assert.ok(oSelect.getDomRef() === null);
			assert.ok(oSelect.getPicker() === null);
			assert.ok(oSelect.getList() === null);
		});

		QUnit.test("update valueState during destroy", function (assert) {
			var oSelect = new Select({
				valueState: "Error"
			});
			// Setup: trigger destroy
			oSelect.destroy();

			// Act: reset valueState
			var oResult = oSelect.setValueState("None");

			// Check
			assert.ok(oResult, "valueState can be reset during destroy");
		});

		// Tests for methods borrowed from class sap.ui.core.Control

		// Tests for methods borrowed from class sap.ui.core.Element

		// Tests for methods borrowed from class sap.ui.base.ManagedObject

		QUnit.module("addAggregation() + getAggregation()");

		QUnit.test("addAggregation() + getAggregation()", function (assert) {

			// system under test
			var oSelect = new Select();
			var oItem = new Item({
				key: "GER",
				text: "Germany"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var fnAddAggregationSpy = this.spy(oSelect, "addAggregation");
			var fnInvalidateSpy = this.spy(oSelect, "invalidate");

			// act
			oSelect.addAggregation("items", oItem);

			// assert
			assert.ok(fnAddAggregationSpy.returned(oSelect), "sap.m.Select.prototype.addAggregation() returns this to allow method chaining");
			assert.ok(fnInvalidateSpy.calledWithExactly(oItem));
			assert.ok(oSelect.getAggregation("items")[0] === oItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("addAggregation()", function (assert) {

			// system under test
			var oSelect = new Select();
			var oItem = new Item({
				key: "GER",
				text: "Germany"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			var fnAddAggregationSpy = this.spy(oSelect, "addAggregation");
			var fnInvalidateSpy = this.spy(oSelect, "invalidate");

			// act
			oSelect.addAggregation("items", oItem, true);

			// assert
			assert.ok(fnAddAggregationSpy.returned(oSelect), "sap.m.Select.prototype.addAggregation() returns this to allow method chaining");
			assert.ok(!fnInvalidateSpy.calledWithExactly(oItem));
			assert.ok(oSelect.getAggregation("items")[0] === oItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("setAssociation() + getAssociation()");

		QUnit.test("setAssociation() + getAssociation()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "CU",
						text: "Cuba"
					}),
					new Item({
						id: "item-id",
						key: "GER",
						text: "Germany"
					})
				]
			});

			// arrange
			var fnSetAssociationSpy = this.spy(oSelect, "setAssociation");

			// act
			oSelect.setAssociation("selectedItem", "item-id");

			// assert
			assert.ok(fnSetAssociationSpy.returned(oSelect), "sap.m.Select.prototype.setAssociation() returns this to allow method chaining");
			assert.ok(oSelect.getAssociation("selectedItem") === "item-id");
			assert.ok(oSelect.getList().getAssociation("selectedItem") === "item-id");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("setAssociation() + getAssociation()", function (assert) {

			// system under test
			var oItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "CU",
						text: "Cuba"
					}),
					oItem = new Item({
						id: "item-id",
						key: "GER",
						text: "Germany"
					})
				]
			});

			// arrange
			var fnSetAssociationSpy = this.spy(oSelect, "setAssociation");

			// act
			oSelect.setAssociation("selectedItem", oItem);

			// assert
			assert.ok(fnSetAssociationSpy.returned(oSelect), "sap.m.Select.prototype.setAssociation() returns this to allow method chaining");
			assert.ok(oSelect.getAssociation("selectedItem") === "item-id");
			assert.ok(oSelect.getList().getAssociation("selectedItem") === "item-id");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("updateItems()");

		// BCP 1570150535
		QUnit.test('it should not dispatch the change event when the binding of the item aggregation is updated', function (assert) {

			// system under test
			var oSelect = new Select({
				items: {
					path: "/contries",
					template: new Item({
						text: "{name}"
					})
				},
				change: function (oControlEvent) {
					Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
				}
			});

			// arrange
			var oModel = new JSONModel();
			var mData = {
				"contries": [
					{
						"name": "Germany"
					},
					{
						"name": "Cuba"
					}
				]
			};
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");
			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.updateItems("change");

			// act
			oSelect.getFocusDomRef().blur();

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event should not be fired");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.module("ariaLabelledBy()");
		QUnit.test("aria-labelledby content", function (assert) {

			// system under test
			var oHiddenSelect,
				aActualAriaLabelledByIDs,
				oLabel = new Label({
					id: "label"
				}),
				oSelect = new Select({
					ariaLabelledBy: oLabel
				}),
				aExpectedAriaLabelledByIDs = [
					"label"
				];

			// arrange
			oLabel.placeAt("content");
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oHiddenSelect = oSelect._getHiddenSelect();

			// assert
			aActualAriaLabelledByIDs = oHiddenSelect.attr("aria-labelledby").split(" ");

			// aria-labelledby should consist of (separated by space)
			// - external label ID
			// - internal label ID
			assert.strictEqual(aExpectedAriaLabelledByIDs.length, aActualAriaLabelledByIDs.length, "The number of actual arria-labelledby IDs correspond to the expected IDs' one");
			aExpectedAriaLabelledByIDs.forEach(function (sExpectedID) {
				assert.ok(aActualAriaLabelledByIDs.indexOf(sExpectedID) !== -1, "aria-labelledby includes ID " + sExpectedID);
			});

			// cleanup
			oSelect.destroy();
			oLabel.destroy();
		});

		QUnit.module("destroyAggregation()");

		QUnit.test("destroyAggregation()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "GER",
						text: "Germany"
					})
				]
			});

			// arrange
			var fnDestroyAggregationSpy = this.spy(oSelect, "destroyAggregation");
			var fnInvalidateSpy = this.spy(oSelect, "invalidate");

			// act
			oSelect.destroyAggregation("items");

			// assert
			assert.ok(fnDestroyAggregationSpy.returned(oSelect), "sap.m.Select.prototype.destroyAggregation() returns this to allow method chaining");
			assert.ok(fnInvalidateSpy.calledOnce);
			assert.strictEqual(oSelect.getItems().length, 0);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("destroyAggregation()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "GER",
						text: "Germany"
					})
				]
			});

			// arrange
			var fnDestroyAggregationSpy = this.spy(oSelect, "destroyAggregation");
			var fnInvalidateSpy = this.spy(oSelect, "invalidate");

			// act
			oSelect.destroyAggregation("items", true);

			// assert
			assert.ok(fnDestroyAggregationSpy.returned(oSelect), "sap.m.Select.prototype.destroyAggregation() returns this to allow method chaining");
			assert.ok(!fnInvalidateSpy.calledOnce);
			assert.strictEqual(oSelect.getItems().length, 0);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("findAggregatedObjects()");

		QUnit.test("findAggregatedObjects()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "GER",
						text: "Germany"
					})
				]
			});

			// arrange
			var fnFindAggregatedObjectsSpy = this.spy(oSelect, "findAggregatedObjects");

			// act
			oSelect.findAggregatedObjects();

			// assert
			assert.ok(fnFindAggregatedObjectsSpy.returned(oSelect.getItems()));

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("getBinding() + getBindingInfo() + getBindingPath()");

		QUnit.test("getBinding() + getBindingInfo() + getBindingPath()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var oModel = new JSONModel();
			var mData = {
				"countries": [
					{
						"value": "GER",
						"text": "Germany"
					}
				],
				"selected": "GER"
			};
			var oItemTemplate = new Item({
				key: "{select-model>value}",
				text: "{select-model>text}"
			});

			oModel.setData(mData);
			oSelect.setModel(oModel, "select-model");

			// act
			oSelect.bindItems({
				path: "select-model>/countries",
				template: oItemTemplate
			});

			oSelect.bindProperty("selectedKey", {
				path: "select-model>/selected"
			});

			// assert
			assert.ok(oSelect.getBinding("selectedKey"));
			assert.ok(oSelect.getBinding("items"));
			assert.ok(oSelect.getBindingInfo("selectedKey"));
			assert.ok(oSelect.getBindingInfo("items"));
			assert.strictEqual(oSelect.getBindingPath("selectedKey"), "/selected");
			assert.strictEqual(oSelect.getBindingPath("items"), "/countries");
			assert.ok(oSelect.isBound("selectedKey"));
			assert.ok(oSelect.isBound("items"));

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.module("setProperty() + getProperty()");

		QUnit.test('setProperty() + getProperty() test for "selectedKey" property', function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "CU",
						text: "Cuba"
					}),
					new Item({
						key: "GER",
						text: "Germany"
					})
				]
			});

			// arrange
			var fnInvalidateSpy = this.spy(oSelect, "invalidate");

			// act
			oSelect.setProperty("selectedKey", "GER");

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "GER");
			assert.strictEqual(oSelect.getProperty("selectedKey"), "GER");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "GER");
			assert.strictEqual(oSelect.getList().getProperty("selectedKey"), "GER");
			assert.ok(fnInvalidateSpy.called);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('setProperty() + getProperty() test for "selectedItemId" property', function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						id: "item-cu",
						key: "CU",
						text: "Cuba"
					}),
					new Item({
						id: "item-ger",
						key: "GER",
						text: "Germany"
					})
				]
			});

			// act
			oSelect.setProperty("selectedItemId", "item-ger", true);

			// assert
			assert.strictEqual(oSelect.getSelectedItemId(), "item-ger");
			assert.strictEqual(oSelect.getProperty("selectedItemId"), "item-ger");
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-ger");
			assert.strictEqual(oSelect.getList().getProperty("selectedItemId"), "item-ger");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("indexOfAggregation()");

		QUnit.test("indexOfAggregation()", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Cuba"
					}),
					oExpectedItem = new Item({
						text: "Germany"
					})
				]
			});

			// assert
			assert.strictEqual(oSelect.indexOfAggregation("items", oExpectedItem), 1);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("insertAggregation()");

		QUnit.test("insertAggregation()", function (assert) {

			// system under test
			var oSelect = new Select();
			var oItem = new Item({
				text: "Germany"
			});

			// act
			oSelect.insertAggregation("items", oItem);

			// assert
			assert.ok(oSelect.getItems()[0] === oItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("removeAggregation()");

		QUnit.test("removeAggregation()", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "GER",
						text: "Germany"
					})
				]
			});

			// act
			oSelect.removeAggregation("items", 0);

			// assert
			assert.strictEqual(oSelect.getItems().length, 0);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("removeAllAggregation()");

		QUnit.test("removeAllAggregation()", function (assert) {

			// system under test
			var oSelect = new Select({
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

			// act
			oSelect.removeAllAggregation("items");

			// assert
			assert.strictEqual(oSelect.getItems().length, 0);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("removeAllAssociation()");

		QUnit.test("removeAllAssociation()", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						id: "ger-id",
						key: "GER",
						text: "Germany"
					}),
					oExpectedItem = new Item({
						id: "cu-id",
						key: "CU",
						text: "Cuba"
					})
				],

				selectedItem: oExpectedItem
			});

			// arrange
			var fnRemoveAllAssociationSpy = this.spy(oSelect, "removeAllAssociation");

			// act
			oSelect.removeAllAssociation("selectedItem");

			// assert
			assert.ok(oSelect.getSelectedItem() === null);
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.ok(fnRemoveAllAssociationSpy.returned("cu-id"));

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("unbindProperty()");

		QUnit.test("unbindProperty()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var oModel = new JSONModel();
			var mData = {
				"countries": [
					{
						"code": "GER",
						"name": "Germany"
					},
					{
						"code": "CU",
						"name": "Cuba"
					}
				],
				"selected": "CU"
			};

			var oItemTemplate = new Item({
				key: "{code}",
				text: "{name}"
			});

			oSelect.bindItems({
				path: "/countries",
				template: oItemTemplate
			});

			oSelect.bindProperty("selectedKey", {
				path: "/selected"
			});

			oModel.setData(mData);
			oSelect.setModel(oModel);

			// act
			oSelect.unbindProperty("selectedKey");

			// assert
			assert.strictEqual(oSelect.isBound("selectedKey"), false, "The property is not bound");
			assert.strictEqual(oSelect.getProperty("selectedKey"), "GER", 'Property "selectedKey" is reset to the default value');

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.module("unbindAggregation()");

		QUnit.test("unbindAggregation()", function (assert) {

			// system under test
			var oSelect = new Select();

			// arrange
			var oModel = new JSONModel();
			var mData = {
				"countries": [
					{
						"code": "GER",
						"name": "Germany"
					},
					{
						"code": "CU",
						"name": "Cuba"
					}
				],
				"selected": "CU"
			};

			var oItemTemplate = new Item({
				key: "{code}",
				text: "{name}"
			});

			oSelect.bindItems({
				path: "/countries",
				template: oItemTemplate
			});

			oModel.setData(mData);
			oSelect.setModel(oModel);

			// act
			oSelect.unbindAggregation("items");

			// assert
			assert.strictEqual(oSelect.isBound("items"), false, 'The aggregation "items" is not bound');
			assert.strictEqual(oSelect.getAggregation("items", []).length, 0, 'The aggregation "items" must be reset');

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		QUnit.module("updateAggregation()");

		// unit test for CSN 0120061532 0001266189 2014
		//
		// Do not clear the selection when items are destroyed.
		// When using Two-Way Data Binding and the binding are refreshed,
		// the items will be destroyed and the aggregation items is filled again.
		QUnit.test("updateAggregation() do not clear the selection when items are destroyed", function (assert) {

			// system under test
			var oSelect = new Select({
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
					},
					{
						"code": "CU",
						"name": "Cuba"
					}
				],

				// path : selectedKey
				"selected": "CU"
			};

			oModel.setData(mData);
			oSelect.setModel(oModel);
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.updateAggregation("items");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.getSelectedKey(), "CU");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "CU");

			// cleanup
			oSelect.destroy();
			oModel.destroy();
		});

		/* ------------------------------------ */
		/* setBindingContext()				  */
		/* ------------------------------------ */

		/* ------------------------------------ */
		/* unbindContext()					  */
		/* ------------------------------------ */

		/* ------------------------------------ */
		/* unbindObject()					   */
		/* ------------------------------------ */

		QUnit.module("clone()");

		// BCP 1580183712
		QUnit.test('it should modify the cloned "selectedItem" association to point to the new item', function (assert) {

			// system under test
			var oExpectedItem = new Item({
				text: "lorem ipsum 2"
			});

			var oSelect = new Select({
				items: [
					new Item({
						text: "lorem ipsum 1"
					}),

					oExpectedItem
				],
				selectedItem: oExpectedItem
			});

			// act
			var oSelectClone = oSelect.clone();

			// assert
			assert.ok(oSelectClone.getSelectedItem().getText() === oExpectedItem.getText());

			// cleanup
			oSelect.destroy();
			oSelectClone.destroy();
		});

		// BCP 1580183712
		QUnit.test("it should set the selection correctly after the control is cloned", function (assert) {

			// system under test
			var oSelect = new Select({
				forceSelection: false,
				items: [
					new Item({
						text: "lorem ipsum 1"
					}),

					new Item({
						text: "lorem ipsum 2"
					})
				]
			});

			// act
			var oSelectClone = oSelect.clone();

			// assert
			assert.ok(oSelectClone.getSelectedItem() === null);

			// cleanup
			oSelect.destroy();
			oSelectClone.destroy();
		});

		QUnit.module("_isShadowListRequired()");

		QUnit.test("_isShadowListRequired() it should return true when the width property is set to auto", function (assert) {

			// system under test
			var oSelect = new Select({
				width: "auto"
			});

			// assert
			assert.strictEqual(oSelect._isShadowListRequired(), true);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("_isShadowListRequired() it should return false when the autoAdjustWidth property is set to true", function (assert) {

			// system under test
			var oSelect = new Select({
				autoAdjustWidth: true
			});

			// assert
			assert.strictEqual(oSelect._isShadowListRequired(), false);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("_isShadowListRequired() it should return false", function (assert) {

			// system under test
			var oSelect = new Select({
				width: "15rem"
			});

			// assert
			assert.strictEqual(oSelect._isShadowListRequired(), false);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("HTML");

		QUnit.test("rendering", function (assert) {
			var oSelect1 = new Select({
				width: "50%",
				items: [
					new Item({
						key: "3",
						text: "item 3 item is not visible"
					})
				],
				visible: false
			});

			var oSelect2 = new Select({
				items: [
					new Item({
						key: "4",
						text: "item 4"
					}),

					new Item({
						key: "5",
						text: "item 5"
					}),

					new Item({
						key: "6",
						text: "item 6"
					}),

					new Item({
						key: "7",
						text: "item 7"
					}),

					new Item({
						key: "8",
						text: "item 8"
					})
				]
			});

			var oSelect3 = new Select({
				items: [
					new Item({
						key: "9",
						text: "item 9"
					})
				]
			});

			var oSelect4 = new Select({
				items: [
					new Item({
						key: "10",
						text: "item 10"
					}),

					new Item({
						key: "11",
						text: "item 11"
					}),

					new Item({
						key: "12",
						text: "item 12"
					}),

					new Item({
						key: "13",
						text: "item 13"
					})
				],

				selectedKey: "13"
			});

			var oSelect5 = new Select({
				width: "13rem",
				items: [
					new Item({
						key: "14",
						text: "item 14"
					}),

					new Item({
						key: "15",
						text: "item 15"
					}),

					new Item({
						key: "16",
						text: "item 16"
					}),

					new Item({
						key: "17",
						text: "item 17"
					})
				]
			});

			var oSelect6 = new Select({
				width: "200px",

				items: [
					new Item({
						key: "18",
						text: "item 18"
					}),

					new Item({
						key: "19",
						text: "item 19"
					}),

					new Item({
						key: "20",
						text: "item 20"
					}),

					new Item({
						key: "21",
						text: "item 21"
					})
				]
			});

			var oSelect7 = new Select({

				items: [
					new Item({
						key: "22",
						text: "item 22"
					}),

					new Item({
						key: "23",
						text: "item 23"
					}),

					new Item({
						key: "24",
						text: "item 24"
					})
				]
			});

			var oSelect8 = new Select({
				type: SelectType.IconOnly,
				icon: IconPool.getIconURI("add"),
				items: [
					new Item({
						key: "52",
						text: "item 52"
					}),

					new Item({
						key: "53",
						text: "item 53"
					}),

					new Item({
						key: "54",
						text: "item 54"
					})
				]
			});

			var aSelects = [oSelect1, oSelect2, oSelect3, oSelect4, oSelect5, oSelect6, oSelect7, oSelect8];

			// arrange
			oSelect1.placeAt("content");
			oSelect2.placeAt("content");
			oSelect3.placeAt("content");
			oSelect4.placeAt("content");
			oSelect5.placeAt("content");
			oSelect6.placeAt("content");
			oSelect7.placeAt("content");
			oSelect8.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			aSelects.forEach(function (oSelect) {
				var CSS_CLASS = SelectRenderer.CSS_CLASS;

				if (!oSelect.getVisible()) {
					return;
				}

				assert.ok(oSelect.$("label").is("span"), "The HTML element of the Select's label is with span tag.");

				if (oSelect.getType() === SelectType.Default) {
					assert.ok(oSelect.$().length, "The HTML div container html element exists");
					assert.ok(oSelect.$("label").length, "The HTML label first-child element exists");
					assert.ok(oSelect.$("arrow").length, "The HTML span element for the arrow exists");

					assert.strictEqual(oSelect.$("label").attr('aria-hidden'), "true", "The HTML label element has an aria-hidden set to true");
					assert.strictEqual(oSelect.$("arrow").attr('aria-hidden'), "true", "The HTML arrow element has an aria-hidden set to true");

					assert.strictEqual(getComputedStyle(
						oSelect.$("arrow")[0]).pointerEvents,
						"auto",
						"The HTML span element for the arrow has pointer-events = 'auto' in all other browsers");
				} else if (oSelect.getType() === SelectType.IconOnly) {
					assert.ok(oSelect.$("icon").length, "The HTML span element for the icon exists");
				}

				if (oSelect._isShadowListRequired() && oSelect.getItems().length) {
					assert.ok(oSelect.$().children("." + oSelect.getList().getRenderer().CSS_CLASS).length, "The shadow list element exists");
					var oShadowListDomRef = oSelect.getDomRef().querySelector("." + oSelect.getList().getRenderer().CSS_CLASS);

					// BCP: 1770084557 avoid duplicated IDs in the DOM when the select control is rendered inside a dialog
					assert.strictEqual(oShadowListDomRef.firstElementChild.id, "", "it should not render the IDs of the items in the shadow list");
				}

				if (oSelect.getType() === SelectType.Default) {
					assert.ok(oSelect.$().hasClass(CSS_CLASS), 'The select container html element "must have" the CSS class "' + CSS_CLASS + '"');
					assert.ok(oSelect.$("label").hasClass(CSS_CLASS + "Label"), 'The select first-child html label element "must have" the CSS class "' + CSS_CLASS + 'Label"');
					assert.ok(oSelect.$("arrow").hasClass(CSS_CLASS + "Arrow"), 'The select html span element "must have" the CSS class "' + CSS_CLASS + 'Arrow"');

				} else if (oSelect.getType() === SelectType.IconOnly) {
					assert.equal(oSelect.$().hasClass(CSS_CLASS + "MinWidth"), false, 'The select has not min-width when it`s of IconOnly type');
					assert.ok(oSelect.$("icon").hasClass(CSS_CLASS + "Icon"), 'The select html span element must have the CSS class "' + CSS_CLASS + 'Icon"');
					assert.equal(oSelect.$().attr("aria-readonly"), undefined, 'The IconOnly select should not have aria-readonly defined');
				}

				if (oSelect.getType() === SelectType.Default) {
					assert.strictEqual(oSelect.getFocusDomRef().getAttribute("role"), "combobox");
				} else if (oSelect.getType() === SelectType.IconOnly) {
					assert.strictEqual(oSelect.getFocusDomRef().getAttribute("role"), "button");
				}

				assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-expanded"), "false");

				// cleanup
				oSelect.destroy();
			});
		});

		QUnit.module("Rendering - min width");

		QUnit.test("min-width added/removed", function (assert) {
			var oSel1 = new Select({
				width: "10%"
			}),
			oSel2 = new Select({
				width: "auto"
			}),
			oSel3 = new Select({
				autoAdjustWidth: true
			}),
			oSel4 = new Select({
					width: "10rem"
			}),
			oSel5 = new Select({
				width: "2px"
			}),
			oSel6 = new Select({
				width: "4rem",
				autoAdjustWidth: true
			});

			// Arrange
			oSel1.placeAt("content");
			oSel2.placeAt("content");
			oSel3.placeAt("content");
			oSel4.placeAt("content");
			oSel5.placeAt("content");
			oSel6.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.equal(oSel1.$().hasClass("sapMSltMinWidth"), true, 'The select has min-width');
			assert.equal(oSel2.$().hasClass("sapMSltMinWidth"), true, 'The select has min-width');
			assert.equal(oSel3.$().hasClass("sapMSltMinWidth"), true, 'The select has min-width');

			assert.equal(oSel4.$().hasClass("sapMSltMinWidth"), false, 'The select has no min-width');
			assert.equal(oSel5.$().hasClass("sapMSltMinWidth"), false, 'The select has no min-width');
			assert.equal(oSel6.$().hasClass("sapMSltMinWidth"), true,
				'The select has min-width, the width is ignored if autoAdjustWidth is enabled');

			// Clean up
			oSel1.destroy();
			oSel2.destroy();
			oSel3.destroy();
			oSel4.destroy();
			oSel5.destroy();
			oSel6.destroy();
		});

		QUnit.module("Rendering - wrapping items text");

		QUnit.test("Wrapped/truncated", function (assert) {
			var oSelect = new Select({wrapItemsText: true});

			// Arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.equal(oSelect.getList().hasStyleClass("sapMSelectListWrappedItems"), true, 'text is wrapped');

			// Act
			oSelect.setWrapItemsText(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.equal(oSelect.getList().hasStyleClass("sapMSelectListWrappedItems"), false, 'text is truncated');

			// Act
			oSelect.setWrapItemsText(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.equal(oSelect.getList().hasStyleClass("sapMSelectListWrappedItems"), true, 'text is wrapped');

			// Clean up
			oSelect.destroy();
		});

		QUnit.module("touchstart");

		QUnit.test("touchstart", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			qutils.triggerTouchEvent("touchstart", oSelect.getDomRef(), {
				touches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				},

				targetTouches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				}
			});

			// assert
			assert.ok(oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Pressed"), 'The select must have the css class “' + SelectRenderer.CSS_CLASS + 'Pressed”');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("touchend");

		QUnit.test("touchend", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			qutils.triggerTouchEvent("touchstart", oSelect.getDomRef(), {
				touches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				},

				targetTouches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				}
			});

			qutils.triggerTouchEvent("touchend", oSelect.getDomRef(), {
				targetTouches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				}
			});

			// assert
			assert.ok(!oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Pressed"), 'The select must not have the CSS class “' + SelectRenderer.CSS_CLASS + 'Pressed”');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("tap");

		QUnit.test("tap", function (assert) {

			// system under test
			var oSelect = new Select({
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
			var fnTapSpy = this.spy(oSelect, "ontap"),
				fnPickerCloseSpy,
				fnOpenSpy;

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			qutils.triggerTouchEvent("touchstart", oSelect.getDomRef(), {
				touches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				},

				targetTouches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				}
			});

			fnOpenSpy = this.spy(oSelect.getPicker(), "open");
			fnPickerCloseSpy = this.spy(oSelect.getPicker(), "close");

			qutils.triggerTouchEvent("touchend", oSelect.getDomRef(), {
				targetTouches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				}
			});

			qutils.triggerTouchEvent("tap", oSelect.getDomRef(), {
				targetTouches: {
					0: {
						pageX: 10,
						length: 1
					},

					length: 1
				}
			});

			// assert
			assert.ok(fnTapSpy.calledOnce, "ontap() event handler must be called exactly once on " + oSelect);
			assert.strictEqual(fnPickerCloseSpy.callCount, 0, "close() method of the popover must not be called");
			assert.strictEqual(fnOpenSpy.callCount, 1, "open() method was called exactly once");
			assert.ok(oSelect.$().hasClass(SelectRenderer.CSS_CLASS + "Pressed"), 'The select must have the css class “' + SelectRenderer.CSS_CLASS + 'Pressed”');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("tap on pre-selected item with keyboard keys should fire change event", function (assert) {
			var oItem2 = new Item({text : "2"}),
				oSelect = new Select({
					items: [new Item({text : "1"}), oItem2]
				}),
				fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();

			// act
			// move to the second item with ARROW_DOWN (pre-select item) and execute tap.
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
			qutils.triggerEvent("tap", oItem2.getDomRef());

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired once");

			// cleanup
			oSelect.destroy();
		});


		QUnit.module("onkeypress");

		var fnKeypressTestCase = function (mOptions) {
			QUnit.test("onkeypress", function (assert) {

				// system under test
				var oSelect = mOptions.control;

				// arrange
				oSelect.placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;
				oSelect.focus();

				// act
				qutils.triggerKeypress(oSelect.getDomRef(), mOptions.character);

				// assert
				assert.ok(oSelect.getSelectedItem() === mOptions.output);
				assert.ok(oSelect.getList().getSelectedItem() === mOptions.output);

				// cleanup
				oSelect.destroy();
			});
		};

		(function () {
			var oExpectedItem;

			fnKeypressTestCase({
				control: new Select({
					items: [
						new Item({
							key: "0",
							text: "a item 0"
						}),

						oExpectedItem = new Item({
							key: "1",
							text: "A item 1"
						})
					]
				}),

				character: "A",
				output: oExpectedItem
			});

			fnKeypressTestCase({
				control: new Select({
					items: [
						new Item({
							key: "0",
							text: "A item 0"
						}),

						oExpectedItem = new Item({
							key: "1",
							text: "a item 1"
						})
					]
				}),

				character: "A",
				output: oExpectedItem
			});

			fnKeypressTestCase({
				control: new Select({
					items: [
						new Item({
							key: "0",
							text: "0 item 0"
						}),

						oExpectedItem = new Item({
							key: "1",
							text: "1 item 1"
						})
					]
				}),

				character: "1",
				output: oExpectedItem
			});
		}());

		QUnit.test("onkeypress if the selected item changes when a key is pressed", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria"
					}),

					oExpectedItem = new Item({
						id: "item-id",
						key: "BE",
						text: "Belgium"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "B");

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "BE");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "BE");
			assert.strictEqual(oSelect.$("label").text(), "Belgium");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("selection change with tab", function (assert) {
			// system under test
			var oExpectedItem,
				oSelect = new Select({
				items: [
						new Item({
							text: "First item"
						}),
						oExpectedItem = new Item({
							text: "Second item"
						})
					]
				});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeyup(oSelect.getDomRef(), KeyCodes.SPACE);
			this.clock.tick(1000); // wait 1s after the open animation is completed
			assert.strictEqual(oSelect.isOpen(), true);

			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.TAB);
			assert.strictEqual(oSelect.getSelectedItem().getText(), oExpectedItem.getText());

			this.clock.tick(1000); // wait 1s after the close animation is completed
			assert.strictEqual(oSelect.isOpen(), false);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Germany", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Argentina"
					}),
					oExpectedItem = new Item({
						text: "Germany"
					}),
					new Item({
						text: "Ghana"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "E");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Gglorem", function (assert) {

			// system under test
			var oExpectedItem,
				oSelect = new Select({
				items: [
					new Item({
						text: "Argentina"
					}),
					new Item({
						key: "GER",
						text: "Germany"
					}),
					oExpectedItem = new Item({
						text: "Gglorem"
					})
				],
				selectedKey: "GER"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "L");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Gglorem", function (assert) {

			// system under test
			var oExpectedItem,
				oExpectedItem2,
				oExpectedItem3,
				oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						key: "AR",
						text: "Argentina"
					}),
					oExpectedItem = new Item({
						text: "Germany"
					}),
					oExpectedItem2 = new Item({
						"text": "Ghana"
					}),
					oExpectedItem3 = new Item({
						text: "Gglorem"
					})
				],
				selectedKey: "GER"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem2);

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "L");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem3);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Greece", function (assert) {

			// system under test
			var oExpectedItem,
				oExpectedItem2,
				oExpectedItem3,
				oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						key: "AR",
						text: "Argentina"
					}),
					oExpectedItem = new Item({
						text: "Germany"
					}),
					oExpectedItem2 = new Item({
						"text": "Ghana"
					}),
					oExpectedItem3 = new Item({
						"text": "Greece"
					})
				],
				selectedKey: "GER"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem2);

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem3);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Ghana", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Argentina"
					}),
					new Item({
						text: "Germany"
					}),
					oExpectedItem = new Item({
						text: "Ghana"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			this.clock.tick(3000);
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Greece", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Argentina"
					}),
					new Item({
						text: "Germany"
					}),
					new Item({
						text: "Ghana"
					}),
					oExpectedItem = new Item({
						text: "Greece"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Gglorem", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Argentina"
					}),
					new Item({
						text: "Germany"
					}),
					oExpectedItem = new Item({
						text: "Gglorem"
					}),
					new Item({
						text: "Ghana"
					}),
					new Item({
						text: "Greece"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should select Greece", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						text: "Argentina"
					}),
					new Item({
						text: "Germany"
					}),
					new Item({
						key: "gg",
						text: "Gglorem"
					}),
					new Item({
						text: "Ghana"
					}),
					oExpectedItem = new Item({
						text: "Greece"
					})
				],
				selectedKey: "gg"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeypress(oSelect.getDomRef(), "G");
			qutils.triggerKeypress(oSelect.getDomRef(), "G");

			// assert
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapshow");

		QUnit.test("onsapshow F4 - the picker popup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnShowSpy = this.spy(oSelect, "onsapshow");
			var sOpenState = OpenState.OPENING;

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.F4);

			// assert
			assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");
			assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is opening");
			assert.ok(oSelect.isOpen(), "Control's picker popup is open");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapshow Alt + DOWN - open control's picker the popup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnShowSpy = this.spy(oSelect, "onsapshow");
			var sOpenState = OpenState.OPENING;

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN, false, true);

			// assert
			assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");
			assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is opening");
			assert.ok(oSelect.isOpen(), "Control's picker popup is open");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapshow F4 - close control's picker popup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnShowSpy = this.spy(oSelect, "onsapshow");
			var sOpenState = OpenState.CLOSING;

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.F4);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.F4);

			// assert
			assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
			assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is closing");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapshow Alt + DOWN - close control's picker popup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnShowSpy = this.spy(oSelect, "onsapshow");
			var sOpenState = OpenState.CLOSING;

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN, false, true);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN, false, true);

			// assert
			assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
			assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is closing");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsaphide");

		QUnit.test("onsaphide Alt + UP - open control's picker popup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnHideSpy = this.spy(oSelect, "onsaphide");
			var sOpenState = OpenState.OPENING;

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP, false, true, false);

			// assert
			assert.strictEqual(fnHideSpy.callCount, 1, "onsaphide() method was called exactly once");
			assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is opening");
			assert.ok(oSelect.isOpen(), "Control's picker popup is open");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsaphide Alt + UP - close control's picker popup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnHideSpy = this.spy(oSelect, "onsaphide");
			var sOpenState = OpenState.CLOSING;

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP, false, true, false);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP, false, true, false);

			// assert
			assert.strictEqual(fnHideSpy.callCount, 2, "onsaphide() method was called twice");
			assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is closing");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapspace");

		QUnit.test("onsapspace the spacebar key is pressed and the picker popup is close", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeyup(oSelect.getDomRef(), KeyCodes.SPACE);
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			// assert
			assert.ok(oSelect.isOpen(), "Control's picker popup is open");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event should not be fired");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapspace the spacebar key is pressed and the picker popup is open", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);

			// act
			qutils.triggerKeyup(oSelect.getDomRef(), KeyCodes.SPACE);
			this.clock.tick(1000);

			// assert
			assert.strictEqual(oSelect.isOpen(), false, "Control's picker popup is close");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapspace when spacebar key is pressed and the selection has changed", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);	// change the selection
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeyup(oSelect.getDomRef(), KeyCodes.SPACE);

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapspace the spacebar key is released while holding the shift key", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			qutils.triggerKeyup(oSelect.getDomRef(), KeyCodes.SPACE, true); // trigger SPACE up while holding the SHIFT key
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			// assert
			assert.notOk(oSelect.isOpen(), "Control's picker popup is not open - action has been aborted by user");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapescape");

		QUnit.test("onsapescape - close the picker popup if it is open", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnEscapeSpy = this.spy(oSelect, "onsapescape");
			var fnCloseSpy = this.spy(oSelect, "close");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ESCAPE);

			// assert
			assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
			assert.strictEqual(fnCloseSpy.callCount, 0, "close() method is not called");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapescape - don't close the picker popup if SPACE is hold", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			var fnEscapeSpy = this.spy(oSelect, "onsapescape");
			var fnCloseSpy = this.spy(oSelect, "close");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ESCAPE);

			// assert
			assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
			assert.ok(fnCloseSpy.notCalled, "close() method is not called");

			// cleanup
			oSelect.destroy();
		});


		QUnit.test("onsapescape - close the control's picker popup if it is open", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);

			var fnEscapeSpy = this.spy(oSelect, "onsapescape");
			var fnCloseSpy = this.spy(oSelect, "close");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ESCAPE);

			// assert
			assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
			assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapescape when escape key is pressed and the selection has changed with select list opened", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);	// change the selection

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ESCAPE);

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired as escape reverts any changes");
			assert.strictEqual(oSelect.getSelectedKey(), "GER", "The selection is reverted on escape");
			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapescape when escape key is pressed and the selection has changed with select list closed", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			this.clock.tick(1000);	// wait 1s after the open animation is completed
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);	// change the selection

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ESCAPE);

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired as escape reverts any changes");
			assert.strictEqual(oSelect.getSelectedKey(), "GER", "The selection is reverted on escape");
			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapenter");

		QUnit.test("onsapenter - close list box", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnEnterSpy = this.spy(oSelect, "onsapenter");
			var fnCloseSpy = this.spy(oSelect, "close");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ENTER);

			// assert
			assert.strictEqual(fnEnterSpy.callCount, 1, "onsapenter() method was called exactly once");
			assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapenter - marking of event", function (assert) {

			// System under test
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			}),
			fnEnterSpy = this.spy(oSelect, "onsapenter");

			// Arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// Act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ENTER);

			// Assert
			assert.notOk(fnEnterSpy.args[0][0].isMarked(), "The event should not be marked, since the picker is not opened.");

			// Act
			fnEnterSpy.resetHistory();
			oSelect.open();
			this.clock.tick(1000);

			// Act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ENTER);

			// Assert
			assert.ok(fnEnterSpy.args[0][0].isMarked(), "The event should be marked, since the picker is opened.");

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapenter when enter key is pressed and the selection has changed", function (assert) {

			// system under test
			var oSelect = new Select({
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
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);	// change the selection
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ENTER);

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapenter when enter key is pressed the default Browser behavior is prevented", function (assert) {

			// System under test
			var oSelect = new Select({
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
			}),
			oEvent = {
				preventDefault: function() {},
				setMarked: function() {}
			},
			oSpy = this.spy(oEvent, "preventDefault");

			// Arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Act
			oSelect.onsapenter(oEvent);

			// Assert
			assert.ok(oSpy.called, "Default event is prevented for Enter press");

			// Cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapdown");

		QUnit.test("onsapdown", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1",
						enabled: false
					}),

					oExpectedItem = new Item({
						id: "item-id",
						key: "2",
						text: "item 2"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyDownSpy = this.spy(oSelect, "onsapdown");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);

			// assert
			assert.strictEqual(fnKeyDownSpy.callCount, 1, "onsapdown() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");
			assert.strictEqual(oSelect.$("label").text(), "item 2");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapdown", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
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
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyDownSpy = this.stub(oSelect, "onsapdown");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);

			// assert
			assert.strictEqual(fnKeyDownSpy.callCount, 1, "onsapdown() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event not fired");
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapdown", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						id: "item-id",
						key: "0",
						text: "item 0"
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
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyDownSpy = this.spy(oSelect, "onsapdown");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);

			// assert
			assert.strictEqual(fnKeyDownSpy.callCount, 1, "onsapdown() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('it should set the attribute "aria-activedescendant" after the picker popup is opened', function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item(),
					oExpectedItem = new Item({
						text: "Germany"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait after the open animation is completed and the list is rendered

			// act
			qutils.triggerKeydown(oSelect.getFocusDomRef(), KeyCodes.ARROW_DOWN);

			// assert
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should be scrolled the the newly selected item using arrow navigation", function (assert) {

			// Arrange
			var oSelect = new Select({autoAdjustWidth: true}),
				oEvent = new Event("", oSelect, {which: "ARROW_DOWN"});

			oEvent.setMarked = function(){return true;};

			for (let i = 0; i < 50; i++) {
				//we want to make sure we trigger change of Select`s width, applying the option text
				if (i % 2) {
					oSelect.addItem(new Item({text: "VeryLongTextField", id: `id-${i}`}));
				} else {
					oSelect.addItem(new Item({text: "Short", id: `id-${i}`}));
				}
			}

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);

			// Act
			//Make sure we tab-navigated low enough to get scrollbar
			for (let j = 0; j < 31; j++) {
				oSelect.onsapdown(oEvent);
			}

			nextUIUpdate.runSync()/*fake timer is used in module*/;
			this.clock.tick(3000);

			// assert
			assert.ok(oSelect.getPicker().getDomRef().querySelector('.sapUiSimpleFixFlexFlexContent').scrollTop != 0, "Scrolled corectly to the selected element");
			oSelect.close();
			oSelect.destroy();
		});

		QUnit.module("Keyboard handling", {
			beforeEach: function () {
				// system under test
				this.oSelect = new Select({
					items: [
						new Item(),
						new Item({
							text: "Germany"
						})
					]
				});

				// arrange
				this.oSelect.placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;
				this.oSelect.focus();
			},
			afterEach: function () {
				// cleanup
				this.oSelect.destroy();
			}
		});

		QUnit.test("it should take action on SPACE key up", function (assert) {
			//arrange
			var oSpy = this.spy(this.oSelect, "toggleOpenState");

			//act
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.SPACE);

			//assert
			assert.ok(oSpy.notCalled, "Action not called on keydown");

			//act
			qutils.triggerKeyup(this.oSelect.getDomRef(), KeyCodes.SPACE);

			//assert
			assert.ok(oSpy.called, "Action called on keyup");
		});

		QUnit.test("it should not take action if SHIFT is pressed during space action", function (assert) {
			//arrange
			var oSpy = this.spy(this.oSelect, "toggleOpenState");

			// act
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.SHIFT);
			qutils.triggerKeyup(this.oSelect.getDomRef(), KeyCodes.SHIFT);
			qutils.triggerKeyup(this.oSelect.getDomRef(), KeyCodes.SPACE);

			// assert
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("it should not take action if ESCAPE is pressed during space action", function (assert) {
			//arrange
			var oSpy = this.spy(this.oSelect, "toggleOpenState");

			// act
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.ESCAPE);
			qutils.triggerKeyup(this.oSelect.getDomRef(), KeyCodes.ESCAPE);
			qutils.triggerKeyup(this.oSelect.getDomRef(), KeyCodes.SPACE);

			// assert
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("it should not take action if ESCAPE is hold during space action", function (assert) {
			//arrange
			var oSpy = this.spy(this.oSelect, "toggleOpenState");

			// act
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.ESCAPE);
			qutils.triggerKeyup(this.oSelect.getDomRef(), KeyCodes.SPACE);

			// assert
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("it should fire liveChange event on ARROW Key navigation if a new item is selected", function (assert) {
			//arrange
			var fnFireSelectionChangeSpy = this.spy(this.oSelect, "fireEvent");

			// act
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.ARROW_DOWN);

			// assert
			assert.ok(fnFireSelectionChangeSpy.calledOnce, "liveChange fired once on successful item navigation");
			assert.ok(fnFireSelectionChangeSpy.calledWithExactly("liveChange",
				{selectedItem: this.oSelect.getItems()[1], id: this.oSelect.getId()}), "the correct item is passed with the event");
		});

		QUnit.test("it shouldn't fire liveChange event on ARROW Key navigation if no new item is selected", function (assert) {
			//arrange
			var fnFireSelectionChangeSpy = this.spy();
			this.oSelect.attachLiveChange(fnFireSelectionChangeSpy);

			// act
			qutils.triggerKeydown(this.oSelect.getDomRef(), KeyCodes.ARROW_UP);

			// assert
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "liveChange isn't fired on unsuccessful item navigation");
		});

		QUnit.test("it should fire liveChange event on Character Key press if a new item is selected", function (assert) {
			//arrange
			var fnFireSelectionChangeSpy = this.spy(this.oSelect, "fireEvent");

			// act
			qutils.triggerKeypress(this.oSelect.getDomRef(), "G");

			// assert
			assert.ok(fnFireSelectionChangeSpy.calledOnce, "liveChange fired once on successful item navigation");
			assert.ok(fnFireSelectionChangeSpy.calledWithExactly("liveChange",
				{selectedItem: this.oSelect.getItems()[1], id: this.oSelect.getId()}), "the correct item is passed with the event");
		});

		QUnit.test("it should fire liveChange event on revert selection", function (assert) {
			//arrange
			var fnFireSelectionChangeSpy;

			// act
			qutils.triggerKeypress(this.oSelect.getDomRef(), "G");
			fnFireSelectionChangeSpy = this.spy(this.oSelect, "fireEvent");
			this.oSelect._revertSelection();

			// assert
			assert.ok(fnFireSelectionChangeSpy.calledOnce, "liveChange fired once on revert item navigation");
			assert.ok(fnFireSelectionChangeSpy.calledWithExactly("liveChange",
				{selectedItem: this.oSelect.getItems()[0], id: this.oSelect.getId()}), "the correct item is passed with the event");
		});

		QUnit.module("onsapfocusleave");

		QUnit.test("it should restore the focus to select if select list item gets the focus", function (assert) {
			// system under test
			var oItem1 = new Item({
					text: "Bulgaria",
					key: "BG"
				}),
				oItem2 = new Item({
					text: "Germany",
					key: "GER"
				}),
				oSelect = new Select({
				items: [ oItem1, oItem2 ]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			// act
			oItem1.focus();

			// assert
			assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "Focus was successfully restored to the Select");
			oSelect.destroy();
		});

		QUnit.module("onfocusout");

		QUnit.test("it should not fire the change event if re-rendering occurs (test case 1)", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item(),
					new Item({
						text: "Germany"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			oSelect.invalidate();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should not fire the change event if re-rendering occurs (test case 2)", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item(),
					new Item({
						text: "Germany"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
			oSelect.invalidate();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0);

			// cleanup
			oSelect.destroy();
		});

		// BCP 1570819144
		QUnit.test("it should not fire the change event after the selected item is removed and re-added again", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item()
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.getFocusDomRef().blur();
			oSelect.removeAllItems();
			oSelect.addItem(new Item());
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			oSelect.getFocusDomRef().blur();

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it checks if _handleFocusout works as expected", function (assert) {

			// arrange
			var oSelect = new Select(),
					oPicker = oSelect.getPicker(),
					oCheckSelectionChangeSpy = this.spy(oSelect, "_checkSelectionChange"),
					oRevertSelectionSpy = this.spy(oSelect, "_revertSelection"),
					oMockEventPickerTarget = {
						target: oPicker
					},
					oMockEventRandomTarget = {
						target: false
					};

			// we are mocking the isOpen function
			oPicker.isOpen = function() {
				return true;
			};

			// act - call the function with picker target
			oSelect._bProcessChange = true; // Force processing of focus out
			oSelect._handleFocusout(oMockEventPickerTarget);

			// assert
			assert.strictEqual(oCheckSelectionChangeSpy.callCount, 1);
			assert.strictEqual(oRevertSelectionSpy.callCount, 0);

			// act - call the function with random target
			oSelect._bProcessChange = true; // Force processing of focus out
			oCheckSelectionChangeSpy.resetHistory();
			oRevertSelectionSpy.resetHistory();
			oSelect._handleFocusout(oMockEventRandomTarget);

			// assert
			assert.strictEqual(oCheckSelectionChangeSpy.callCount, 0);
			assert.strictEqual(oRevertSelectionSpy.callCount, 1);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should fire the change event", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item(),
					new Item({
						text: "Germany"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
			oSelect.invalidate();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.getFocusDomRef().blur();

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 1);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should not fire the change event", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item()
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			oSelect.getFocusDomRef().blur();

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 0);

			// cleanup
			oSelect.destroy();
		});

		// BCP 0020079747 0000194079 2016
		QUnit.test("it should not fire the change event twice", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oItem;
			var oSelect = new Select({
				items: [
					oItem = new Item({
						text: "lorem ipsum foo"
					}),
					new Item({
						text: "lorem ipsum bar"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000); // wait after the open animation is completed and the list is rendered
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");
			var oItemDomRef = oItem.getDomRef();

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN); // navigate to next selectable item

			qutils.triggerEvent("mousedown", oItemDomRef, {
				target: oItemDomRef
			});

			qutils.triggerEvent("mouseup", oItemDomRef, {
				target: oItemDomRef
			});

			qutils.triggerEvent("click", oItemDomRef, {
				target: oItemDomRef
			});

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 1);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapup");

		QUnit.test("onsapup", function (assert) {

			// system under test
			var oItem;
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						id: "item-id",
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1",
						enabled: false
					}),

					oItem = new Item({
						key: "2",
						text: "item 2"
					})
				],

				selectedItem: oItem
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyUpSpy = this.spy(oSelect, "onsapup");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);

			// assert
			assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapup", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
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
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyUpSpy = this.spy(oSelect, "onsapup");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);

			// assert
			assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === null);
			assert.strictEqual(oSelect.getSelectedItemId(), "");
			assert.strictEqual(oSelect.getSelectedKey(), "");
			assert.ok(oSelect.getList().getSelectedItem() === null);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "");
			assert.strictEqual(oSelect.$("label").text(), "");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapup", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
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
						id: "item-id",
						key: "2",
						text: "item 2"
					})
				],

				selectedItem: oExpectedItem
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyUpSpy = this.stub(oSelect, "onsapup");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);

			// assert
			assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "2");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "2");
			assert.strictEqual(oSelect.$("label").text(), "item 2");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('it should set the attribute "aria-activedescendant" after the picker popup is opened', function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						text: "Germany"
					}),
					new Item({
						key: "AR",
						text: "Argentina"
					})
				],
				selectedKey: "AR"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait after the open animation is completed and the list is rendered

			// act
			qutils.triggerKeydown(oSelect.getFocusDomRef(), KeyCodes.ARROW_UP);

			// assert
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsaphome");

		QUnit.test("onsaphome", function (assert) {

			// system under test
			var oExpectedItem;
			var oItem;
			var oSelect = new Select({
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
						text: "item 2",
						enabled: false
					}),

					oItem = new Item({
						key: "3",
						text: "item 3"
					}),

					new Item({
						key: "4",
						text: "item 4",
						enabled: false
					})
				],

				selectedItem: oItem
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyHomeSpy = this.spy(oSelect, "onsaphome");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.HOME);

			// assert
			assert.strictEqual(fnKeyHomeSpy.callCount, 1, "onsaphome() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "0");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "0");
			assert.strictEqual(oSelect.$("label").text(), "item 0");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsaphome", function (assert) {

			// system under test
			var oExpectedItem;
			var oItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0",
						enabled: false
					}),

					oExpectedItem = new Item({
						id: "item-id",
						key: "1",
						text: "item 1"
					}),

					new Item({
						key: "2",
						text: "item 2"
					}),

					new Item({
						key: "3",
						text: "item 3"
					}),

					oItem = new Item({
						key: "4",
						text: "item 4"
					})
				],

				selectedItem: oItem
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyHomeSpy = this.spy(oSelect, "onsaphome");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.HOME);

			// assert
			assert.strictEqual(fnKeyHomeSpy.callCount, 1, "onsaphome() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			assert.strictEqual(oSelect.$("label").text(), "item 1");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsaphome when the Home key is pressed", function (assert) {

			// system under test
			var oExpectedItem;
			var oItem;
			var oSelect = new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0",
						enabled: false
					}),

					oExpectedItem = new Item({
						id: "item-id",
						key: "1",
						text: "item 1"
					}),

					new Item({
						key: "2",
						text: "item 2"
					}),

					new Item({
						key: "3",
						text: "item 3"
					}),

					oItem = new Item({
						key: "4",
						text: "item 4"
					})
				],

				selectedItem: oItem
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyHomeSpy = this.spy(oSelect, "onsaphome");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.HOME);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.HOME);

			// assert
			assert.strictEqual(fnKeyHomeSpy.callCount, 2, "onsaphome() method was called exactly twice");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "1");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "1");
			assert.strictEqual(oSelect.$("label").text(), "item 1");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('it should set the attribute "aria-activedescendant" after the picker popup is opened', function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item({
						enabled: false
					}),

					oExpectedItem = new Item({
						text: "expected"
					}),

					new Item(),

					new Item({
						key: "3"
					})
				],

				selectedKey: "3"
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait after the open animation is completed

			// act
			qutils.triggerKeydown(oSelect.getFocusDomRef(), KeyCodes.HOME);

			// assert
			assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-activedescendant"), oExpectedItem.getId());

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onsapend");

		QUnit.test("onsapend", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
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
						key: "2",
						text: "item 2"
					}),

					new Item({
						key: "3",
						text: "item 3"
					}),

					oExpectedItem = new Item({
						id: "item-id",
						key: "4",
						text: "item 4"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyEndSpy = this.spy(oSelect, "onsapend");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.END);

			// assert
			assert.strictEqual(fnKeyEndSpy.callCount, 1, "onsapend() method was called exactly once");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "4");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "4");
			assert.strictEqual(oSelect.$("label").text(), "item 4");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("onsapend when the End key is pressed", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
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
						key: "2",
						text: "item 2"
					}),

					new Item({
						key: "3",
						text: "item 3"
					}),

					oExpectedItem = new Item({
						id: "item-id",
						key: "4",
						text: "item 4"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			var fnKeyEndSpy = this.spy(oSelect, "onsapend");
			var fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// act
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.END);
			qutils.triggerKeydown(oSelect.getDomRef(), KeyCodes.END);

			// assert
			assert.strictEqual(fnKeyEndSpy.callCount, 2, "onsapend() method was called exactly twice");
			assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
			assert.ok(oSelect.getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getSelectedKey(), "4");
			assert.ok(oSelect.getList().getSelectedItem() === oExpectedItem);
			assert.strictEqual(oSelect.getList().getSelectedItemId(), "item-id");
			assert.strictEqual(oSelect.getList().getSelectedKey(), "4");
			assert.strictEqual(oSelect.$("label").text(), "item 4");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('it should set the attribute "aria-activedescendant" after the picker popup is opened', function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					new Item(),
					new Item(),
					oExpectedItem = new Item({
						text: "expected"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();
			this.clock.tick(1000);	// wait after the open animation is completed

			// act
			qutils.triggerKeydown(oSelect.getFocusDomRef(), KeyCodes.END);

			// assert
			assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-activedescendant"), oExpectedItem.getId());

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("onAfterOpen");

		QUnit.test("onAfterOpen test case 1", function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						text: "expected"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			// assert
			assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-expanded"), "true");
			assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-controls"), oSelect.getList().getId(), 'the attribute "aria-controls" is set after the list is rendered');
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('it should set the attribute "aria-activedescendant" after the picker popup is opened', function (assert) {

			// system under test
			var oExpectedItem;
			var oSelect = new Select({
				items: [
					oExpectedItem = new Item({
						text: "expected"
					})
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();

			// act
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed and the list is rendered

			// assert
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.test('title alignment is handled properly', function (assert) {
			fnToMobileMode();

			// setup
			var oSelect = new Select(),
				oHeader = oSelect.getPicker()._getAnyHeader();

			// assert
			assert.equal(oHeader.getTitleAlignment(), mobileLibrary.TitleAlignment.Auto, 'Title alignment is set correctly to "Auto"');

			// cleanup
			oSelect.destroy();
			fnToDesktopMode();
		});

		QUnit.module("onAfterClose");

		QUnit.test("onAfterClose", function (assert) {

			// system under test
			var item2 = new Item({text : "2"});
			var oSelect = new Select({
				items: [
					new Item({text : "1"}),
					item2
				]
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();

			this.clock.tick(1000);

			// act
			qutils.triggerEvent("tap", item2.getDomRef());

			this.clock.tick(1000);

			// assert
			assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-expanded"), "false");
			assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("Events");

		QUnit.test("change of selected item onChange should not re-trigger change event", function (assert) {
			var oItem1 =  new Item({key: "1", text : "1"}),
				oItem2 = new Item({key: "2", text : "2"}),
				oSelect = new Select({
					items: [oItem1, oItem2],
					change: function () {
						oSelect.setSelectedKey("1");
					}
				}),
				fnFireChangeSpy = this.spy(oSelect, "fireChange");

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();

			// act
			// select the second item
			qutils.triggerEvent("tap", oItem2.getDomRef());

			// assert
			assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired once");
			assert.strictEqual(oSelect.getSelectedItem(), oItem1, "The selected item is correct");

			// cleanup
			oSelect.destroy();
		});


		QUnit.test("Tab handling shouldn't mark the event", function(assert) {
			var oSelect = new Select(),
				$oTabNextEvent = jQuery.Event("tabNextTestEvent"),
				$oTabPreviousEvent = jQuery.Event("tabPreviousTestEvent");

			oSelect.onsaptabnext($oTabNextEvent);
			assert.notOk($oTabNextEvent.isMarked(), "The event isn't marked by the onsaptabnext method");

			oSelect.onsaptabprevious($oTabPreviousEvent);
			assert.notOk($oTabPreviousEvent.isMarked(), "The event isn't marked by the onsaptabprevious method");

			oSelect.destroy();
		});

		QUnit.test("'change' event is triggered with two params - selectedItem and previousSelectedItem", function (assert) {
			var oItem1 =  new Item({key: "1", text : "1"}),
				oItem2 = new Item({key: "2", text : "2"}),
				oSelect = new Select({
					items: [oItem1, oItem2]
				}),
				fnFireChangeSpy = this.spy(oSelect, "fireEvent");

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			oSelect.open();

			// act
			// select the second item
			qutils.triggerEvent("tap", oItem2.getDomRef());

			// assert
			assert.ok(fnFireChangeSpy.calledWith("change", { selectedItem: oItem2, previousSelectedItem: oItem1, id: oSelect.getId() }),
				"The change event is fired with selectedItem and previousSelectedItem");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("Text direction");

		QUnit.test("textDirection set to RTL", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						text: "(+359) 111 222 333"
					}),
					new Item({
						text: "20/06/1983 11:30"
					})
				],
				textDirection: TextDirection.RTL
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.$("label").attr("dir"), "rtl", "Dir attribute is rendered and is set to 'rtl'");

			// cleanup
			oSelect.destroy();

		});

		QUnit.test("textDirection set to LTR", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						text: "(+359) 111 222 333"
					}),
					new Item({
						text: "20/06/1983 11:30"
					})
				],
				textDirection: TextDirection.LTR
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oSelect.$("label").attr("dir"), "ltr", "Dir attribute is rendered and is set to 'ltr'");

			// cleanup
			oSelect.destroy();

		});

		QUnit.test("textDirection set to RTL and textAlign set to BEGIN", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						text: "(+359) 111 222 333"
					}),
					new Item({
						text: "20/06/1983 11:30"
					})
				],
				textDirection: TextDirection.RTL,
				textAlign: TextAlign.Begin
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			var $SelectLabel = oSelect.$("label");

			assert.strictEqual($SelectLabel.attr("dir"), "rtl", "Dir attribute is rendered and is set to 'rtl'");
			assert.strictEqual($SelectLabel.css("text-align"), "right", "Text align style is shifted to right");

			// cleanup
			oSelect.destroy();

		});

		QUnit.test("textDirection set to LTR and textAlign set to END", function (assert) {

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						text: "(+359) 111 222 333"
					}),
					new Item({
						text: "20/06/1983 11:30"
					})
				],
				textDirection: TextDirection.LTR,
				textAlign: TextAlign.End
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			var $SelectLabel = oSelect.$("label");

			assert.strictEqual($SelectLabel.attr("dir"), "ltr", "Dir attribute is rendered and is set to 'ltr'");
			assert.strictEqual($SelectLabel.css("text-align"), "right", "Text align style is shifted to right");

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("Accessibility");

		QUnit.test("Referencing labels enhancing", function(assert) {
			// system under test
			var oSpy = this.spy(Select.prototype, "_handleReferencingLabels"),
				oSpyHandler = this.spy(Select.prototype, "focus"),
				oLabel = new Label({
					text: "referencing label",
					labelFor: 'selectTest1'
				}),
				oItemA = new Item({key: "Item1", text: "Item1"}),
				oItemB = new Item({key: "Item2", text: "Item2"}),
				oSelect = new Select('selectTest1', {
					items: [oItemA, oItemB],
					forceSelection: false
				});

			// act
			oLabel.placeAt("content");
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oSpy.called, "Enhancing function is called on onAfterRendering");

			qutils.triggerEvent("tap", oLabel.getId());

			// assert
			assert.ok(oSpyHandler.calledOnce, "Handler function is called");

			// cleanup
			oLabel.destroy();
			oSelect.destroy();
		});

		QUnit.test("Referencing labels focusing on tap when selection type is not a range", function (assert) {
			var oLabel = new Label({ text: "referencing label", labelFor: 'selectTest1' }),
				oItemA = new Item({ key: "Item1", text: "Item1" }),
				oItemB = new Item({ key: "Item2", text: "Item2" }),
				oSelect = new Select('selectTest1', {
					items: [oItemA, oItemB]
				});

			// Arrange
			oLabel.placeAt("content");
			oSelect.placeAt("content");

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			var oOriginalGetSelection = window.getSelection;
			window.getSelection = function() {
				return { type: "DummyType" };
			};

			// Act
			qutils.triggerEvent("tap", oLabel.getId());

			// Assert
			assert.equal(oSelect._isFocused(), true, "Focus is received after tap when selection type is not a range");

			// Cleanup
			window.getSelection = oOriginalGetSelection;

			oLabel.destroy();
			oSelect.destroy();
		});

		QUnit.test("Referencing labels not focusing on tap when selection type is a range", function (assert) {
			var oLabel = new Label({ text: "referencing label", labelFor: 'selectTest1' }),
				oItemA = new Item({ key: "Item1", text: "Item1" }),
				oItemB = new Item({ key: "Item2", text: "Item2" }),
				oSelect = new Select('selectTest1', {
					items: [oItemA, oItemB]
				});

			// Arrange
			oLabel.placeAt("content");
			oSelect.placeAt("content");

			nextUIUpdate.runSync()/*fake timer is used in module*/;

			var oOriginalGetSelection = window.getSelection;
			window.getSelection = function () {
				return { type: "Range" };
			};

			// Act
			qutils.triggerEvent("tap", oLabel.getId());

			// Assert
			assert.equal(oSelect._isFocused(), false, "Focus is not received after tap when selection type is a range");

			// Cleanup
			window.getSelection = oOriginalGetSelection;

			oLabel.destroy();
			oSelect.destroy();
		});

		QUnit.test("Should have correct value for aria-activedescendant after invalidation", function (assert) {
			var oItemA = new Item({key: "Item1", text: "Item1"}),
				oItemB = new Item({key: "Item2", text: "Item2"}),
				oIconOnlySelect = new Select("iconOnlySelect", {
					icon: "sap-icon://search",
					type: "IconOnly",
					items: [oItemA, oItemB]
				});

			oIconOnlySelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oIconOnlySelect.open();
			oIconOnlySelect.setSelectedKey(oItemB.getKey());
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			assert.strictEqual(oIconOnlySelect.getFocusDomRef().getAttribute('aria-activedescendant'), oItemB.getId(),
				"Correct aria-activedescendant value");

			oIconOnlySelect.invalidate();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			assert.strictEqual(oIconOnlySelect.getFocusDomRef().getAttribute('aria-activedescendant'), oItemB.getId(),
				"Correct aria-activedescendant value");

			oIconOnlySelect.destroy();
		});

		QUnit.test("Visual focus should be set on first item if there is no selectedItem when popover opens", function (assert) {
			var oItemA = new Item({key: "Item1", text: "Item1"}),
				oItemB = new Item({key: "Item2", text: "Item2"}),
				oSelect = new Select({
					items: [oItemA, oItemB],
					forceSelection: false
				});

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oSelect.open();
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			assert.strictEqual(oItemA.getDomRef().classList.contains('sapMSelectListItemBase'), true,
				"Visual focus set correctly");

			oSelect.destroy();
		});

		QUnit.test("Label for IconOnly Select", function (assert) {
			var aItems = [
				new Item({key: "Item1", text: "Item1"}),
				new Item({key: "Item2", text: "Item2"})
			];
			var aItems2 = [
				new Item({key: "Item1", text: "Item1"}),
				new Item({key: "Item2", text: "Item2"})
			];

			var oIconOnlySelect = new Select("iconOnlySelect", {
				icon: "sap-icon://search",
				type: "IconOnly",
				items: aItems
			});

			var oStandardSelect = new Select("standardSelect", {
				items: aItems2
			});

			oIconOnlySelect.placeAt("content");
			oStandardSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			assert.strictEqual(document.getElementById("iconOnlySelect-label").innerHTML, "", "No label text is rendered for IconOnly select");
			assert.strictEqual(oIconOnlySelect.$().attr("aria-labelledby"), undefined, "IconOnly select should not have aria-labelledby attribute");
			assert.notStrictEqual(document.getElementById("standardSelect-label").innerHTML, "", "Label text is rendered for standard select");

			oStandardSelect.setType("IconOnly");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.strictEqual(oStandardSelect.$().attr("aria-labelledby"), undefined, "Select set to IconOnly should not have aria-labelledby attribute");

			oIconOnlySelect.destroy();
			oStandardSelect.destroy();
		});

		QUnit.test("getAccessibilityInfo", function (assert) {
			var oSelect = new Select({
				icon: "sap-icon://search",
				type: "IconOnly",
				tooltip: "Tooltip",
				items: [
					new Item({key: "Item1", text: "Item1"}),
					new Item({key: "Item2", text: "Item2"}),
					new Item({key: "Item3", text: "Item3"})
				]
			});
			assert.ok(!!oSelect.getAccessibilityInfo, "Select has a getAccessibilityInfo function");
			var oInfo = oSelect.getAccessibilityInfo();
			assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");

			assert.strictEqual(oInfo.role, "button", "AriaRole");
			assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
			assert.strictEqual(oInfo.description, "Tooltip", "Description");
			assert.strictEqual(oInfo.focusable, true, "Focusable");
			assert.strictEqual(oInfo.enabled, true, "Enabled");
			assert.strictEqual(oInfo.readonly, undefined, "IconOnly");

			oSelect.setTooltip("");
			var oIconInfo = IconPool.getIconInfo(oSelect.getIcon());
			oInfo = oSelect.getAccessibilityInfo();
			assert.strictEqual(oInfo.role, "button", "AriaRole");
			assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
			assert.strictEqual(oInfo.description, oIconInfo && oIconInfo.text ? oIconInfo.text : "", "Description");

			oSelect.setType("Default");
			oInfo = oSelect.getAccessibilityInfo();
			assert.strictEqual(oInfo.role, "combobox", "AriaRole");
			assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("SELECT_ROLE_DESCRIPTION"), "Type");
			assert.strictEqual(oInfo.description, "Item1", "Description");
			assert.strictEqual(oInfo.readonly, false, "Editable");

			oSelect.setSelectedKey("Item2");
			oInfo = oSelect.getAccessibilityInfo();
			assert.strictEqual(oInfo.role, "combobox", "AriaRole");
			assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("SELECT_ROLE_DESCRIPTION"), "Type");
			assert.strictEqual(oInfo.description, "Item2", "Description");

			oSelect.setEditable(false);
			oInfo = oSelect.getAccessibilityInfo();
			assert.strictEqual(oInfo.readonly, true, "Read-only");

			oSelect.setRequired(true);
			oInfo = oSelect.getAccessibilityInfo();
			assert.strictEqual(oInfo.description.indexOf("Required") > -1, true, "Required");

			oSelect.destroy();
		});

		QUnit.test("Enabled/Disabled state", function (assert) {
			var oEnabledSelect = new Select({ enabled: true }),
				oDisabledSelect = new Select({ enabled: false });

			oEnabledSelect.placeAt("content");
			oDisabledSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assertion
			assert.strictEqual(oEnabledSelect._getHiddenSelect().attr("aria-disabled"), undefined, "Enabled Select isn't indicated as disabled");
			assert.strictEqual(oDisabledSelect._getHiddenSelect().attr("aria-disabled"), "true", "Disabled Select is indicated as disabled appropriately");

			// Cleanup
			oEnabledSelect.destroy();
			oDisabledSelect.destroy();
		});

		QUnit.test("Required state", function (assert) {
			var oSelect = new Select({ required: true }),
				oHiddenSelect;

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oHiddenSelect = oSelect._getHiddenSelect();

			// Assertion
			assert.strictEqual(oHiddenSelect.attr("aria-required"), "true", "Required Select required attribute is set");

			// Act
			oSelect.setRequired(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oHiddenSelect = oSelect._getHiddenSelect();

			// Assertion
			assert.strictEqual(oHiddenSelect.attr("aria-required"), undefined, "Required Select required attribute is not set");

			// Cleanup
			oSelect.destroy();
		});

		QUnit.test("Aria attributes", function (assert) {
			// arrange
			var oSelect = new Select(),
				oHiddenSelect;
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oHiddenSelect = oSelect._getHiddenSelect();

			// assert
			assert.strictEqual(oHiddenSelect.attr("aria-haspopup"), "listbox", "aria-haspopup is correct");
			assert.ok(oHiddenSelect.attr("aria-roledescription") !== undefined, "aria-roledescription is correct");

			// act
			oSelect.setType(SelectType.IconOnly);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(oHiddenSelect.attr("aria-roledescription") === undefined, "aria-roledescription is correct");

			oSelect.setEditable(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assertion
			assert.strictEqual(oHiddenSelect.attr("aria-haspopup"), undefined, "Non editable Select aria-haspopup attribute is not set");

			// clean
			oSelect.destroy();
		});

		QUnit.test("Picker aria-labelledby attribute", function (assert) {
			// arrange
			var oSelect = new Select(),
				sPickerValueStateId = oSelect.getValueStateTextInvisibleText().getId(),
				oPicker = oSelect.getPicker();
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.equal(oPicker.getAriaLabelledBy().indexOf(sPickerValueStateId), -1, "Value state content ID is not added");

			// arrange
			oSelect.setValueState(ValueState.Success);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.notEqual(oPicker.getAriaLabelledBy().indexOf(sPickerValueStateId), -1, "Value state content ID is added ");

			// clean
			oSelect.destroy();
		});


		QUnit.test("Picker aria-labelledby attribute initial", function (assert) {
			// arrange
			var oSelect = new Select({valueState: ValueState.Success}),
				sPickerValueStateId = oSelect.getValueStateTextInvisibleText().getId(),
				oPicker = oSelect.getPicker();
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.notEqual(oPicker.getAriaLabelledBy().indexOf(sPickerValueStateId), -1, "Value state content ID is added ");

			// clean
			oSelect.destroy();
		});

		QUnit.module("value state");

		QUnit.test("it should open the value state message popup on focusin", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				valueState: ValueState.Warning
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.focus();
			this.clock.tick(101);

			// assert
			var oValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
			assert.ok(oValueStateMessageDomRef);
			assert.strictEqual(getComputedStyle(oValueStateMessageDomRef).getPropertyValue("display"), "block");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should open the value state message popup when the dropdown list is closed", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						text: "lorem ipsum"
					})
				],
				valueState: ValueState.Error
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			this.clock.tick(101);
			oSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			// act
			oSelect.close();

			// assert
			var oValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
			assert.ok(oValueStateMessageDomRef);
			assert.strictEqual(getComputedStyle(oValueStateMessageDomRef).getPropertyValue("display"), "block");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should not open the value state message when it is already opened", function (assert) {

			// system under test
			var oSelect = new Select({
					valueState: ValueState.Warning
				}),
				oValueState,
				oSpy;

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.openValueStateMessage();
			this.clock.tick(101);

			oValueState = oSelect.getValueStateMessage();
			oSpy = this.spy(oValueState, "open");
			oSelect.openValueStateMessage();

			// assert
			assert.strictEqual(oSpy.callCount, 0, "Value state message is not opened again");
			assert.strictEqual(oSelect._bValueStateMessageOpened, true, "_bValueStateMessageOpened is true");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should close the value state message popup on focusout", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				valueState: ValueState.Warning
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			this.clock.tick(101);

			// act
			oSelect.getFocusDomRef().blur();

			// assert
			var vValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
			assert.ok(vValueStateMessageDomRef === null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should close the value state message popup when the dropdown list is opened", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				items: [
					new Item({
						text: "lorem ipsum"
					})
				],
				valueState: ValueState.Error
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oSelect.focus();
			this.clock.tick(101);

			// act
			oSelect.open();

			// assert
			var vValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
			assert.strictEqual(vValueStateMessageDomRef, null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should not close the value state message when it is already closed", function (assert) {

			// system under test
			var oSelect = new Select({
					valueState: ValueState.Warning
				}),
				oValueState,
				oSpy;

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.openValueStateMessage();
			this.clock.tick(101);

			oSelect.closeValueStateMessage();
			this.clock.tick(101);

			oValueState = oSelect.getValueStateMessage();
			oSpy = this.spy(oValueState, "close");
			oSelect.closeValueStateMessage();

			// assert
			assert.strictEqual(oSpy.callCount, 0, "Value state message is not closed again");
			assert.strictEqual(oSelect._bValueStateMessageOpened, false, "_bValueStateMessageOpened is false");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should open the value state message popup on setValueState to Error", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				valueState: ValueState.None
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.focus();
			oSelect.setValueState(ValueState.Error);
			this.clock.tick(101);

			// assert
			var oValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
			assert.ok(oValueStateMessageDomRef);
			assert.strictEqual(getComputedStyle(oValueStateMessageDomRef).getPropertyValue("display"), "block");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should close the value state message popup on setValueState to None", function (assert) {

			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			// system under test
			var oSelect = new Select({
				valueState: ValueState.Error
			});

			// arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.focus();
			oSelect.setValueState(ValueState.None);
			this.clock.tick(101);

			// assert
			var oValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
			assert.strictEqual(oValueStateMessageDomRef, null);

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("shouldValueStateMessageBeOpened returns correct value, based on _bValueStateMessageOpened property", function (assert) {

			// system under test
			var oSelect = new Select({
					valueState: ValueState.Error,
					enabled: true,
					editable: true
				}),
				bShouldOpenValueStateMessage;

			// arrange
			oSelect._bValueStateMessageOpened = true;
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			bShouldOpenValueStateMessage = oSelect.shouldValueStateMessageBeOpened();

			//assert
			assert.strictEqual(bShouldOpenValueStateMessage, false,
				"Value state message popup should not be opened again when it already opened");

			// act
			oSelect._bValueStateMessageOpened = false;
			bShouldOpenValueStateMessage = oSelect.shouldValueStateMessageBeOpened();

			// assert
			assert.strictEqual(bShouldOpenValueStateMessage, true,
				"Value state message popup should be opened if it is currently closed");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("_updatePickerAriaLabelledBy call is postponed when the picker is closing", function (assert) {

			// system under test,
			var oItem,
				oSelect = new Select({
					items: [
						new Item({
							text: "lorem ipsum foo"
						}),
						oItem = new Item({
							text: "lorem ipsum bar"
						})
					]
				}),
				oPicker = oSelect.getPicker(),
				oPickerCloseSpy = this.spy(oSelect.getPicker(), "fireAfterClose"),
				fnDone = assert.async(),
				oUpdatePickerAriaLabelledByStub = this.stub(oSelect, "_updatePickerAriaLabelledBy").callsFake(function() {
					oUpdatePickerAriaLabelledByStub.restore(); // avoid endless recursion
					// assert
					assert.ok(oPickerCloseSpy.calledOnce, "after close event is fired once");
					assert.ok(true, "_updatePickerAriaLabelledBy is called after the picker closing animation is done");

					// cleanup
					oPickerCloseSpy.restore();
					oSelect.destroy();
					fnDone();
				});

			oSelect.attachEventOnce("change", function(oEvent) {
				// act
				// change value state on change / while closing picker
				// _updatePickerAriaLabelledBy call will follow the setValueState method
				oSelect.setValueState(ValueState.Error);

			}, this);

			oPicker.attachEventOnce("afterOpen", function(oEvent) {
				// act
				// Close the Select's picker by mocking user click selection on a new item
				oSelect.getList()._activateItem(oItem);

			}, this);

			oPicker.attachEventOnce("beforeClose", function(oEvent) {
				// assert
				assert.strictEqual(oUpdatePickerAriaLabelledByStub.callCount, 0,
					"_updatePickerAriaLabelledBy isn't called before the picker closing animation is finished.");
			}, this);

			// act
			// Open the Select's picker
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// act
			oSelect.open();
			this.clock.tick(1000); // give some time for the picker to open
		});

		QUnit.module("Value State accessibility");

		QUnit.test("Aria-describedby reference element should have a separate persistent DOM node other than the visible value state popup", function(assert) {
			//Arrange
			var oSelect = new Select({
					valueState: ValueState.Warning
				});
			var oAccDomRef;

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oAccDomRef = document.getElementById(oSelect.getValueStateMessageId() + "-sr");

			//Assert
			assert.strictEqual(oSelect.getDomRef().contains(oAccDomRef), true, "Accessibility DOM is created");

			//Clean up
			oSelect.destroy();
		});

		QUnit.test("Aria-describedby attribute should persists even if the message popup is not opened", function(assert) {
			//Arrange
			var oSelect = new Select({
				valueState: "Warning",
				valueStateText: "This is a value state with warning message"
			});

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-describedby"), oSelect.getValueStateMessageId() + "-sr", "Input has static aria-describedby reference pointing to the correct ID");

			//Clean up
			oSelect.destroy();
		});

		QUnit.module("Picker's header", {
			beforeEach: function () {
				fnToMobileMode(); // Enter mobile mode

				this.oLabel = new Label({
					text: "Label's text",
					labelFor: "theSelect"
				}).placeAt("content");

				this.oSelect = new Select("theSelect", {
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
				}).placeAt("content");

				nextUIUpdate.runSync()/*fake timer is used in module*/;
			},
			afterEach: function () {
				this.oSelect.destroy();
				this.oLabel.destroy();
			}
		});

		QUnit.test("Text of the picker's title", function(assert) {
			assert.expect(2);

			var fnDone = assert.async(),
				oDialog = this.oSelect.getAggregation("picker");

			oDialog.attachBeforeOpen(function () {
				// Checks the picker title after opening the dialog, since the title is updated in beforeOpen
				assert.strictEqual(this.oSelect._getPickerTitle().getText(), this.oLabel.getText(), "The title of the picker is the same as the label referencing the Select");

				fnDone();
			}.bind(this));

			// Checks the picker title before opening (the default one)
			assert.strictEqual(this.oSelect._getPickerTitle().getText(), 'Select', "The default value of the picker's title");

			// Open the Select, in order for the title to be updated.
			this.oSelect.open();
		});

		QUnit.module("Hidden select element", {
			beforeEach: function () {
				this.oSelect = new Select({
					items: [
						new ListItem({
							key: "1",
							text: "Competitor"
						}),
						new ListItem({
							key: "2",
							text: "Paper Plane"
						})
					]
				}).placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;

				this.$oHiddenSelectRef = this.oSelect.$("hiddenSelect");
			},
			afterEach: function () {
				this.oSelect.destroy();
			}
		});

		QUnit.test("Hidden select native dropdown is not showing", function (assert) {
			// arrange
			var fnMouseDownOrigin = Select.prototype.onmousedown,
				fnKeydownDownOrigin = Select.prototype.onkeydown,
				oSpy,
				oSelect = this.oSelect,
				thatSpy = this.spy,
				fnOverride = function (fnOrigin) {
					return function (oEvent) {
						oSpy = thatSpy(oEvent, "preventDefault");
						fnOrigin.call(oSelect, oEvent);

						// assert
						assert.ok(oSpy.called, "Default browser behavior is prevented");
						oSpy.restore();
					};
				};

			oSelect.onmousedown = fnOverride(fnMouseDownOrigin);
			oSelect.onkeydown = fnOverride(fnKeydownDownOrigin);

			// act
			qutils.triggerEvent("mousedown", this.oSelect.getFocusDomRef());

			[KeyCodes.ARROW_DOWN, KeyCodes.ARROW_UP, KeyCodes.SPACE].forEach(function(sKeyCode) {
				qutils.triggerKeydown(oSelect.getFocusDomRef(), sKeyCode);
			});
		});

		QUnit.test("Hidden select rendering", function (assert) {
			assert.ok(this.$oHiddenSelectRef.length > 0, "Hidden select is rendered in the DOM");
			assert.ok(this.$oHiddenSelectRef.hasClass("sapUiPseudoInvisibleText"), "Hidden select isn't visible to the user");
		});

		QUnit.test("Hidden select referencing", function (assert) {
			assert.strictEqual(this.oSelect.hasLabelableHTMLElement(), this.$oHiddenSelectRef.attr("id"), "hasLabelableHTMLElement() returns the hidden select ID");
		});

		QUnit.test("Hidden select value is changed", function (assert) {
			var oHiddenInput = this.oSelect._getHiddenInput();
			// assert
			assert.strictEqual(oHiddenInput.attr("value"), "1", "Value is set to first item key when forceSelection is set to true");

			// act
			this.oSelect.setSelectedKey("2");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oHiddenInput.attr("value"), "2", "Value is correctly changed");

			// act
			this.oSelect.setForceSelection(false);
			this.oSelect.setSelectedKey(null);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.strictEqual(oHiddenInput.attr("value"), "", "Value is set to default when forceSelection is set to false");
		});

		QUnit.module("OverflowToolbar configuration");

		QUnit.test("OverflowToolbar configuration is set correctly", function (assert) {
			var oSelect = new Select(),
				oConfig = oSelect.getOverflowToolbarConfig();

			assert.equal(typeof oConfig.onBeforeEnterOverflow, "function", "onBeforeEnterOverflow function is set");
			assert.equal(typeof oConfig.onAfterExitOverflow, "function", "onAfterExitOverflow function is set");
			assert.ok(oConfig.propsUnrelatedToSize.indexOf("selectedItemId") > -1, "selectedItemId is in the propsUnrelatedToSize array");
		});

		QUnit.module("Select with icons");

		QUnit.test("Item's icon changing ", function(assert) {
			var COMPETITOR = "sap-icon://competitor",
				PAPER_PLANE = "sap-icon://paper-plane",
				oSelect = new Select({
				items: [
					new ListItem({
						key: "1",
						text: "Competitor",
						icon: COMPETITOR
					}),
					new ListItem({
						key: "1",
						text: "Paper Plane",
						icon: PAPER_PLANE
					})
				]
			});

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			var oValueIcon = oSelect._getValueIcon();

			assert.strictEqual(oSelect.getItems()[0].getIcon(), COMPETITOR, "Select item icon was set.");
			assert.strictEqual(oValueIcon.getSrc(), COMPETITOR, "Icon was set in internal aggregation.");

			oSelect.setSelectedItem(oSelect.getItems()[1].getId());

			assert.strictEqual(oValueIcon.getSrc(), PAPER_PLANE, "Icon was changed, when the selected item was changed.");
			assert.strictEqual(oValueIcon.getSrc(), oSelect.getSelectedItem().getIcon(), "Icon was changed in internal aggregation.");

			oSelect.destroy();
		});

		QUnit.module("Value state text", {
			beforeEach: function () {
				var sWarningText = "lorem ipsum";
				this.oSelect = new Select("theSelect", {
					valueStateText: sWarningText,
					valueState: ValueState.Warning,
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
				}).placeAt("content");

				nextUIUpdate.runSync()/*fake timer is used in module*/;
			},
			afterEach: function () {
				this.oSelect.destroy();
			},
			getPickerValueStateContent: function(oPicker) {
				return oPicker.getContent()[0].getFixContent();
			}
		});

		QUnit.test(
			"setValueStateText should allow method chaining",
			function (assert) {
				//Arrange
				var oTestSelect = new Select("testSelect", {
					valueStateText: "lorem ipsum",
					valueState: ValueState.Warning,
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
				}),

				//Act
				oTestValueStateStatic = oTestSelect.setValueStateText("new Text"),
				oTestValueStateInsideDom = this.oSelect.setValueStateText("new Text");

			//Assert
			assert.equal(oTestValueStateStatic, oTestSelect, "setValueStateText returns instance of sap.m.Select," +
				" when no DOM element is rendered, to allow method chaining");

			assert.equal(oTestValueStateInsideDom, this.oSelect, "setValueStateText returns instance of sap.m.Select," +
				" when DOM element is rendered, to allow method chaining");

			//Cleanup
				oTestSelect.destroy();

		});
		QUnit.test(
			"it should show the value state text in the value state content when the dropdown list is opened",
			function (assert) {

			// arrange
			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});
			var oWarningSelect = this.oSelect,
				sWarningText = oWarningSelect.getValueStateText(),
				oPicker;

			// act
			oWarningSelect.open();
			this.clock.tick(1000);

			// assert
			oPicker = oWarningSelect.getPicker();
			assert.strictEqual(this.getPickerValueStateContent(oPicker).getText(), sWarningText,
					"The value state text should be present.");
		});

		QUnit.test(
			"it should change the CSS class of the value state text in the value state content when the value state is changed",
			function (assert) {
			// arrange
			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});
			var oWarningSelect = this.oSelect,
				mValueState = ValueState,
				sNoneState = mValueState.None,
				oPicker,
				oValueStateContent;

			Object.keys(mValueState).forEach(function(key) {
				//arrange
				oWarningSelect.setValueState(key);

				//act
				oWarningSelect.open();
				this.clock.tick(1000);

				//assert
				oPicker = oWarningSelect.getPicker();
				assert.ok(oPicker, "The picker should be present.");

				oValueStateContent = this.getPickerValueStateContent(oPicker).$();
				if (key === sNoneState) {
					assert.ok(oValueStateContent.css("display"), "none",
							"The picker does not have a value state content.");
				} else {
					assert.ok(oValueStateContent.hasClass("sapMSltPicker" + key + "State"),
							"The value state content has the correct CSS class.");
				}

				oWarningSelect.close();
				this.clock.tick(1000);
			}, this);
		});

		QUnit.test(
			"it should change the value state text in the value state content when the value state text is changed", function (assert) {
			// arrange
			this.stub(Device, "system").value({
				desktop: true,
				phone: false,
				tablet: false
			});

			var oWarningSelect = this.oSelect,
				sWarningText = oWarningSelect.getValueStateText(),
				sChangedWarningText = "ipsum lorem",
				oPicker;

			// act
			oWarningSelect.open();
			this.clock.tick(1000);

			// assert
			oPicker = oWarningSelect.getPicker();
			assert.ok(oPicker, "The picker should be present.");
			assert.strictEqual(this.getPickerValueStateContent(oPicker).getText(), sWarningText,
					"The correct value state text should be shown.");

			// act
			oWarningSelect.close();
			this.clock.tick(1000);

			oWarningSelect.setValueStateText(sChangedWarningText);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			oWarningSelect.open();
			this.clock.tick(1000);

			assert.strictEqual(this.getPickerValueStateContent(oPicker).getText(), sChangedWarningText,
			"The correct value state text should be shown.");
		});

		QUnit.module("Select list width");

		QUnit.test("it should set select list max width of 100% on desktop when wrapItemsText property is true", function (assert) {
			fnToDesktopMode(); // Enter desktop mode

			// system under test
			var oSelect = new Select({
				items: [ new Item({ key: "1", text: "item 1" }) ],
				wrapItemsText: true
			});

			// assert
			assert.strictEqual(oSelect._oList.getMaxWidth(), "100%", "Select List max width is correct");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set select list max width of 100% on tablet when wrapItemsText property is true", function (assert) {
			fnToTabletMode(); // Enter tabled mode

			// system under test
			var oSelect = new Select({
				items: [ new Item({ key: "1", text: "item 1" }) ],
				wrapItemsText: true
			});

			// assert
			assert.strictEqual(oSelect._oList.getMaxWidth(), "100%", "Select List max width is correct");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set select list max width of 100% on phone", function (assert) {
			fnToMobileMode(); // Enter phone mode

			// system under test
			var oSelect = new Select({
				items: [ new Item({ key: "1", text: "item 1" }) ]
			});

			// assert
			assert.strictEqual(oSelect._oList.getMaxWidth(), "100%", "Select List max width is correct");

			// cleanup
			oSelect.destroy();
		});

		QUnit.test("it should set to select list`s picker class 'sapMPickerWrappedItems' on desktop when wrapItemsText property is true", function (assert) {
			fnToDesktopMode(); // Enter desktop mode

			// system under test
			var oSelect = new Select({
				items: [ new Item({ key: "1", text: "item 1" }) ],
				wrapItemsText: true
			});

			//act
			var oPicker = oSelect.getPicker();

			// assert
			assert.ok(oPicker.hasStyleClass("sapMPickerWrappedItems"), 'sapMPickerWrappedItems is set ');


			// cleanup
			oSelect.destroy();
		});


		QUnit.test("it should not set to select list`s picker class 'sapMPickerWrappedItems' on phone when wrapItemsText property is true", function (assert) {
			fnToMobileMode(); // Enter mobile mode

			// system under test
			var oSelect = new Select({
				items: [ new Item({ key: "1", text: "item 1" }) ],
				wrapItemsText: true
			});

			//act
			var oPicker = oSelect.getPicker();

			// assert
			assert.notOk(oPicker.hasStyleClass("sapMPickerWrappedItems"), 'sapMPickerWrappedItems is not set');


			// cleanup
			oSelect.destroy();
		});

		QUnit.module("Select in OverflowToolbar", {
			beforeEach: function () {
				this.oSelect = new Select({
					items : [
						new Item({
							key: "0",
							text: "Footer Select 1"
						}),
						new Item({
							key: "1",
							text: "Footer Select 2"
						})
					]
				});
				this.OTB = new OverflowToolbar();
				this.OTB.addContent(this.oSelect);
				this.OTB.placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;

			},
			afterEach: function () {
				this.OTB.destroyContent();
				this.oSelect.destroy();
			}
		});

		QUnit.test("Hidden select focus class attached on 'focus()' called on the control", function (assert) {
			//Arrange
			var oSelect = this.oSelect;
			//Act
			oSelect.focus();
			//Assert
			assert.equal(oSelect.$().hasClass("sapMSltFocused"), true);
			oSelect.destroy();
		});

		QUnit.test("Hidden select focus class attached on 'focus()' called on the control, after rerendering from OTB",
			function (assert) {
				//Arrange
				var oSelect = this.oSelect,
					oItemToSelect;
				//Act
				oSelect.open();
				this.clock.tick(1000);

				oItemToSelect = oSelect.getItems()[1];
				oSelect.setSelectedItem(oItemToSelect);

				oSelect.close();
				this.clock.tick(1000);

				//Assert
				assert.equal(oSelect.$().hasClass("sapMSltFocused"), true);

			});

		QUnit.module("IconOnly Select");

		QUnit.test("When Select is of iconOnly type, it should have its autoAdjustWidth property set to true.", function (assert) {

			// system under test
			var oSelect = new Select({
				type: "IconOnly",
				icon: "sap-icon://search"
			});

			// Arrange
			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.equal(oSelect.$().hasClass("sapMSltAutoAdjustedWidth"), true);

			// cleanup
			oSelect.destroy();
		});

		QUnit.module("columnRatio property", {
			beforeEach: function () {
				this.oSelect = new Select({
					items : [
						new ListItem({
							text: "First item text",
							additionalText: "First item additional text"
						}),
						new ListItem({
							text: "Second item text",
							additionalText: "Second item additional text"
						})
					]
				});
				this.oSelect.placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;

			},
			afterEach: function () {
				this.oSelect.destroy();
			}
		});

		QUnit.test("columnRatio value is propagated correctly", function (assert) {
			//Arrange
			var oList = this.oSelect.getList(),
				oSelect = this.oSelect;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), undefined, "List's columnRatio property is not set by default");

			//Act
			oSelect.setShowSecondaryValues(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), oSelect.getColumnRatio(), "List's columnRatio property is synced correctly");

			//Act
			oSelect.setShowSecondaryValues(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), undefined, "List's columnRatio property is synced correctly");
		});

		QUnit.test("columnRatio value is synced correctly", function (assert) {
			//Arrange
			var oList = this.oSelect.getList(),
				oSelect = this.oSelect;

			//Act
			oSelect.setShowSecondaryValues(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), oSelect.getColumnRatio(), "List's columnRatio property is synced correctly");

			//Act
			oSelect.setColumnRatio("5:1");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), oSelect.getColumnRatio(), "List's columnRatio property is synced correctly");

			//Act
			oSelect.setColumnRatio(null);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), oSelect.getColumnRatio(), "List's columnRatio property is synced correctly");

			//Act
			oSelect.setColumnRatio("1:1");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), oSelect.getColumnRatio(), "List's columnRatio property is synced correctly");

			//Act
			oSelect.setColumnRatio(undefined);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.equal(oList.getProperty("_columnRatio"), oSelect.getColumnRatio(), "List's columnRatio property is synced correctly");
		});
		QUnit.module("ISemanticFormContent methods");

		QUnit.test("Select with selected item", function (assert) {
			var oSelectedItem,
				oSelect = new Select({
					forceSelection: false,
					items: [
						oSelectedItem = new Item({text: "First item text"})
					],
					selectedItem: oSelectedItem
				});

			oSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.strictEqual(oSelect.getFormFormattedValue(), oSelectedItem.getText(), "OK");

			oSelect.setSelectedItem(null);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			//Assert
			assert.strictEqual(oSelect.getFormFormattedValue(), "", "OK");
		});

		QUnit.module("getFirstEditableInput", {
			beforeEach: function () {
				this.oSelect = new Select({
					items: [
						new Item({text: "First item text"}),
						new Item({text: "Second item text"})
					]
				});
				this.oSelect.placeAt("content");
				nextUIUpdate.runSync()/*fake timer is used in module*/;
			},
			afterEach: function () {
				this.oSelect.destroy();
			}
		});

		QUnit.test("test getFirstEditableInput finds enabled select", function (assert) {
			assert.ok(getFirstEditableInput(this.oSelect.getDomRef()), "getFirstEditableInput returns the input");
		});

		QUnit.test("test getFirstEditableInput doesn't find disabled select", function (assert) {
			this.oSelect.setEnabled(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.notOk(getFirstEditableInput(this.oSelect.getDomRef()), "getFirstEditableInput returns the input");
		});

		QUnit.test("test getFirstEditableInput doesn't find readonly select", function (assert) {
			this.oSelect.setEditable(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.notOk(getFirstEditableInput(this.oSelect.getDomRef()), "getFirstEditableInput returns the input");
		});

		QUnit.test("test getFirstEditableInput finds readonly select with includeReadOnly", function (assert) {
			this.oSelect.setEditable(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.ok(getFirstEditableInput(this.oSelect.getDomRef(), { includeReadOnly: true }), "getFirstEditableInput returns the input");
		});

		QUnit.test("test getFirstEditableInput doesn't find readonly and disabled select with includeReadOnly", function (assert) {
			this.oSelect.setEditable(false);
			this.oSelect.setEnabled(false);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			assert.notOk(getFirstEditableInput(this.oSelect.getDomRef(), { includeReadOnly: true }), "getFirstEditableInput returns the input");
		});

		QUnit.module("HierarchicalSelect tests");

		QUnit.test("onsapenter - open the control`s popup", function (assert) {

			// system under test
			var oHierarchicalSelect = new HierarchicalSelect({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oHierarchicalSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oHierarchicalSelect.focus();

			var fnEnterSpy = this.spy(oHierarchicalSelect, "onsapenter");
			var fnOpenSpy = this.spy(oHierarchicalSelect, "open");

			// act
			qutils.triggerKeydown(oHierarchicalSelect.getDomRef(), KeyCodes.ENTER);

			// assert
			assert.strictEqual(fnEnterSpy.callCount, 1, "onsapenter() method was called exactly once");
			assert.strictEqual(fnOpenSpy.callCount, 1, "open() method was called exactly once");

			// cleanup
			oHierarchicalSelect.destroy();
		});

		QUnit.test("onsapenter - close the control`s popup if it is open", function (assert) {

			// system under test
			var oHierarchicalSelect = new HierarchicalSelect({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),

					new Item({
						key: "1",
						text: "item 1"
					})
				]
			});

			// arrange
			oHierarchicalSelect.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			oHierarchicalSelect.focus();
			oHierarchicalSelect.open();
			this.clock.tick(1000);	// wait 1s after the open animation is completed

			var fnEnterSpy = this.spy(oHierarchicalSelect, "onsapenter");
			var fnCloseSpy = this.spy(oHierarchicalSelect, "close");

			// act
			qutils.triggerKeydown(oHierarchicalSelect.getDomRef(), KeyCodes.ENTER);

			// assert
			assert.strictEqual(fnEnterSpy.callCount, 1, "onsapenter() method was called exactly once");
			assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

			// cleanup
			oHierarchicalSelect.destroy();
		});
	});
