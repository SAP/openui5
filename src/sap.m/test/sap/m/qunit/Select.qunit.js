/*global QUnit,sinon*/

(function () {
	"use strict";

	sinon.config.useFakeTimers = true;
	QUnit.config.autostart = false;
	sap.ui.test.qunit.delayTestStart();

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
		var sProperty = jQuery.sap.charToUpperCase(mOptions.property);

		QUnit.test("get" + sProperty + "()", function (assert) {
			assert.strictEqual(mOptions.control["get" + sProperty](), mOptions.output, mOptions.description);
		});
	};

	var fnStartMockServer = function (sUri, iAutoRespondAfter) {
		var sMetadataUrl = "data/metadata.xml";
		sUri = sUri || "/service/";

		// configure respond to requests delay
		sap.ui.core.util.MockServer.config({
			autoRespond: true,
			autoRespondAfter: iAutoRespondAfter || 10
		});

		// create mock server
		var oMockServer = new sap.ui.core.util.MockServer({
			rootUri: sUri
		});

		// start and return
		oMockServer.simulate(sMetadataUrl, "data");
		oMockServer.start();
		return oMockServer;
	};

	var fnToMobileMode = function () {
		jQuery("html").removeClass("sapUiMedia-Std-Desktop")
			.removeClass("sapUiMedia-Std-Tablet")
			.addClass("sapUiMedia-Std-Phone");
		sap.ui.Device.system.desktop = false;
		sap.ui.Device.system.tablet = false;
		sap.ui.Device.system.phone = true;
	};

	QUnit.test("default values", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.getName(), "", 'Default name is ""');
		assert.strictEqual(oSelect.getVisible(), true, "By default the Select control is visible");
		assert.strictEqual(oSelect.getEnabled(), true, "By default the Select control is enabled");
		assert.strictEqual(oSelect.getWidth(), "auto", 'By default the "width" of the Select control is "auto"');
		assert.strictEqual(oSelect.getMaxWidth(), "100%", 'By default the "max-width" of the Select control is "100%"');
		assert.ok(oSelect.getSelectedItem() === oSelect.getFirstItem(), "By default the selected items of the Select control is the first item");
		assert.strictEqual(oSelect.getSelectedItemId(), "item-id", "By default the selected items id of the Select control is the id of the first item");
		assert.strictEqual(oSelect.getSelectedKey(), "0", "By default the selected key of the Select control is the key property of the first item");
		assert.strictEqual(oSelect.getTextAlign(), sap.ui.core.TextAlign.Initial, "By default textAlign is set to Initial");
		assert.strictEqual(oSelect.getTextDirection(), sap.ui.core.TextDirection.Inherit, "By default textDirection is set to Inherit");
		assert.strictEqual(oSelect.$().attr("aria-invalid"), undefined);

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("getName()");

	fnTestControlProperty({
		control: new sap.m.Select({
			visible: false
		}),
		property: "name",
		output: "",
		description: 'The name is ""'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			name: "my-select",
			items: [
				new sap.ui.core.Item({
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
		control: new sap.m.Select({
			items: [
				new sap.ui.core.Item({
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
		control: new sap.m.Select(),
		property: "visible",
		output: true,
		description: "Is visible"
	});

	QUnit.module("getEnabled()");

	fnTestControlProperty({
		control: new sap.m.Select(),
		property: "enabled",
		output: true,
		description: "Is enable"
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			enabled: false
		}),
		property: "enabled",
		output: false,
		description: "Is disabled"
	});

	QUnit.module("getWidth()");

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "50%"
		}),
		property: "width",
		output: "50%",
		description: 'The "width" is "50%"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "13rem"
		}),
		property: "width",
		output: "13rem",
		description: 'The "width" is "13rem"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "200px"
		}),
		property: "width",
		output: "200px",
		description: 'The "width" is "200px"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "4em"
		}),
		property: "width",
		output: "4em",
		description: 'The "width" is "4em"'
	});

	fnTestControlProperty({
		control: new sap.m.Select(),
		property: "width",
		output: "auto",
		description: 'The "width" is "auto"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "2in"
		}),
		property: "width",
		output: "2in",
		description: 'The "width" is "2in"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "3cm"
		}),
		property: "width",
		output: "3cm",
		description: 'The "width" is "3cm"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			width: "125pt"
		}),
		property: "width",
		output: "125pt",
		description: 'The "width" is "125pt"'
	});

	QUnit.module("getMaxWidth()");

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "50%"
		}),
		property: "maxWidth",
		output: "50%",
		description: 'The "maxWidth" is "50%"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "13rem"
		}),
		property: "maxWidth",
		output: "13rem",
		description: 'The "maxWidth" is "13rem"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "200px"
		}),
		property: "maxWidth",
		output: "200px",
		description: 'The "maxWidth" is "200px"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "4em"
		}),
		property: "maxWidth",
		output: "4em",
		description: 'The "maxWidth" is "4em"'
	});

	fnTestControlProperty({
		control: new sap.m.Select(),
		property: "maxWidth",
		output: "100%",
		description: 'The "maxWidth" is "100%"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "2in"
		}),
		property: "maxWidth",
		output: "2in",
		description: 'The "maxWidth" is "2in"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "3cm"
		}),
		property: "maxWidth",
		output: "3cm",
		description: 'The "maxWidth" is "3cm"'
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			maxWidth: "125pt"
		}),
		property: "maxWidth",
		output: "125pt",
		description: 'The "maxWidth" is "125pt"'
	});

	QUnit.module("getTextDirection()");

	fnTestControlProperty({
		control: new sap.m.Select({
			textDirection: sap.ui.core.TextDirection.RTL
		}),
		property: "textDirection",
		output: "RTL",
		description: "Text direction is RTL"
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			textDirection: sap.ui.core.TextDirection.LTR
		}),
		property: "textDirection",
		output: "LTR",
		description: "Text direction is LTR"
	});

	QUnit.module("getTextAlign()");

	fnTestControlProperty({
		control: new sap.m.Select({
			textAlign: sap.ui.core.TextAlign.Left
		}),
		property: "textAlign",
		output: "Left",
		description: "Text align is left"
	});

	fnTestControlProperty({
		control: new sap.m.Select({
			textAlign: sap.ui.core.TextAlign.Right
		}),
		property: "textAlign",
		output: "Right",
		description: "Text align is right"
	});

	QUnit.module("getSelectedItem");

	QUnit.test("it should set the selection correctly", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id1",
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({

			selectedItem: "item-id",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			selectedKey: "1",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: ""
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			forceSelection: false,
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			selectedItem: "item-id",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			selectedKey: "1",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: undefined
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			selectedItem: "item-id",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			selectedKey: "1",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: []
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "0"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: {
				path: "/items",
				template: new sap.ui.core.Item({
					key: "{key}",
					text: "{text}"
				})
			}
		});

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.getSelectedKey(), "GER");
		assert.strictEqual(oSelect.getList().getSelectedKey(), "GER");
		assert.strictEqual(oSelect.getSelectedIndex(), 0);
		assert.strictEqual(oSelect.$("label").text(), "Germany");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should set the selection correctly when the item aggregation is bound to a OData model and the selectedKey property is not bound", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: {
				path: "/Products",
				template: new sap.ui.core.Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			}
		});

		// arrange
		var sUri = "/service/";
		var oMockServer = fnStartMockServer(sUri, 10);
		var oModel = new sap.ui.model.odata.ODataModel(sUri, true);
		oSelect.setModel(oModel);
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		// assert
		assert.strictEqual(oSelect.getSelectedKey(), "id_1");
		assert.strictEqual(oSelect.getList().getSelectedKey(), "id_1");
		assert.strictEqual(oSelect.$("label").text(), "Gladiator MX");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oSelect.destroy();
	});

	QUnit.test("it should set the selection correctly when the item aggregation is bound to a OData model and the selectedKey property is not bound", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			selectedKey: "id_14",
			items: {
				path: "/Products",
				template: new sap.ui.core.Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			}
		});

		// arrange
		var sUri = "/service/";
		var oMockServer = fnStartMockServer(sUri, 10);
		var oModel = new sap.ui.model.odata.ODataModel(sUri, true);
		oSelect.setModel(oModel);
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		// assert
		assert.strictEqual(oSelect.getSelectedKey(), "id_14");
		assert.strictEqual(oSelect.getList().getSelectedKey(), "id_14");
		assert.strictEqual(oSelect.$("label").text(), "High End Laptop 2b");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oSelect.destroy();
	});

	// BCP 1580006106
	QUnit.test("it should not override the selection if the items aggregation is bound to a OData model and filters are used", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: {
				path: "/Products",
				template: new sap.ui.core.Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new sap.ui.model.odata.ODataModel(sUri, true);
		oSelect.setModel(oModel);

		// IDs and names of the products in the model:
		//
		// id_1  Gladiator MX
		// id_2  Psimax
		// id_3  Hurricane GX
		// id_4  Webcam
		// id_5  Monitor Locking Cable
		// id_6  Laptop Case
		// id_7  Removable CD/DVD
		// id_8  USB Stick 16 GByte
		// id_9  Deskjet Super Highspeed
		// id_10 Laser Allround Pro
		// id_11 Flat S
		// id_12 Flat Medium
		// id_13 Flat X-large II
		// id_14 High End Laptop 2b
		// id_15 Very Natural Keyboard
		// id_16 Hardcore Hacker

		oSelect.getBinding("items").filter(new sap.ui.model.Filter([
			new sap.ui.model.Filter({
				path: "Name",
				operator: sap.ui.model.FilterOperator.StartsWith,
				value1: "F"
			}),
			new sap.ui.model.Filter({
				path: "Name",
				operator: sap.ui.model.FilterOperator.EndsWith,
				value1: "S"
			})
		], true));

		oSelect.setSelectedKey("id_5");
		oSelect.placeAt("content");

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// enforces an immediate update of the visible UI (aka "rendering")
		sap.ui.getCore().applyChanges();

		oSelect.getBinding("items").filter(new sap.ui.model.Filter([
			new sap.ui.model.Filter({
				path: "Name",
				operator: sap.ui.model.FilterOperator.StartsWith,
				value1: "F"
			})
		], true));
		oSelect.setSelectedKey("id_12");	// in this scenario, this call to .setSelectedKey() triggers re-rendering
		this.clock.tick(1);	// tick the clock ahead some ms millisecond after the re-rendering occur

		// assert
		assert.strictEqual(oSelect.getSelectedKey(), "id_12");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oSelect.destroy();
	});

	QUnit.test("it should set the selection correctly when the item aggregation and the selectedKey property are bound to a JSON model", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			selectedKey: {
				path: "/selected"
			},
			items: {
				path: "/items",
				template: new sap.ui.core.Item({
					key: "{key}",
					text: "{text}"
				})
			}
		});

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: {
				path: "/contries",
				template: new sap.ui.core.Item({
					key: "{code}",
					text: "{name}"
				})
			}
		});

		// arrange + act
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().applyChanges();
		mData.contries.shift();	// remove the first item of the model
		oModel.setData(mData);
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oItem = new sap.ui.core.Item({
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
		var oModel = new sap.ui.model.json.JSONModel();

		oModel.setData(mTestModelData);
		sap.ui.getCore().setModel(oModel);

		var oItemTemplate = new sap.ui.core.Item({
			key: "{key}",
			text: "{text}"
		});

		var oSelect = new sap.m.Select({
			items: {
				path: "/items",
				template: oItemTemplate
			}
		});

		// arrange
		oSelect.placeAt("content");
		var oScrollToItemSpy = this.spy(oSelect, "scrollToItem");
		oSelect.setSelectedKey("YE");
		sap.ui.getCore().applyChanges();
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
		var oModel = new sap.ui.model.json.JSONModel();

		oModel.setData(mTestModelData);
		sap.ui.getCore().setModel(oModel);

		var oItemTemplate = new sap.ui.core.Item({
			key: "{key}",
			text: "{text}"
		});

		var oSelect = new sap.m.Select({
			items: {
				path: "/items",
				template: oItemTemplate
			},

			change: function (oControlEvent) {
				jQuery.sap.log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
			}
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		var oPickerDomRef = oSelect.getPicker().getDomRef("cont");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerEvent("mousedown", oPickerDomRef, {
			target: oPickerDomRef
		});

		oPickerDomRef.focus();

		sap.ui.test.qunit.triggerEvent("mouseup", oPickerDomRef, {
			target: oPickerDomRef
		});

		sap.ui.test.qunit.triggerEvent("click", oPickerDomRef, {
			target: oPickerDomRef
		});

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oSelect.destroy();
		oModel.destroy();
	});

	QUnit.module("setName()");

	QUnit.test("it should render an input field with the value of the selected key", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			name: "lorem ipsum",
			items: [
				new sap.ui.core.Item({
					key: "lorem",
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.setName("select-name0");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.$("input").attr("name"), "select-name0", 'The attribute name is "select-name0"');
		assert.strictEqual(oSelect.$("input").attr("value"), "lorem");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("setWidth()");

	QUnit.test("setWidth()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.setWidth("400px");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.$().outerWidth() + "px", "400px");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("setEnabled()");

	QUnit.test("setEnabled()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelect.$().hasClass(sap.m.SelectRenderer.CSS_CLASS + "Disabled"), 'If the select control is disabled, it should have the CSS class "' + sap.m.SelectRenderer.CSS_CLASS + "Disabled");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("two column layout");

	QUnit.test("it should forward the value of the showSecondaryValues to the list", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			showSecondaryValues: true,
			items: [
				new sap.ui.core.ListItem({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.ListItem({
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
		var oSelect = new sap.m.Select({
			width: "auto",
			items: [
				new sap.ui.core.ListItem({
					key: "lorem",
					text: "lorem",
					additionalText: "lorem"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sWidth = oSelect.getDomRef().offsetWidth;

		// act
		oSelect.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		oSelect.setShowSecondaryValues(true);
		sap.ui.getCore().applyChanges();

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
		var oLabel = new sap.m.Label();
		var oSelect = new sap.m.ComboBoxTextField({
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
		var oSelect = new sap.m.ComboBoxTextField();
		var oLabel = new sap.m.Label({
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
		var oLabel1 = new sap.m.Label({
			id: "lorem-ipsum-label",
			labelFor: oSelect
		});
		oSelect = new sap.m.ComboBoxTextField({
			ariaLabelledBy: [
				"lorem-ipsum-label"
			]
		});
		var oLabel2 = new sap.m.Label({
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
		var oSelect = new sap.m.Select();

		// arrange
		var fnAddItemSpy = this.spy(oSelect, "addItem");
		var oItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select();

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
		var oSelect = new sap.m.Select();

		// arrange
		var fnInsertAggregation = this.spy(oSelect, "insertAggregation");
		var fnInsertItem = this.spy(oSelect, "insertItem");
		var oItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select();

		// arrange
		var fnInsertItemSpy = this.spy(oSelect, "insertItem");

		// act
		oSelect.insertItem(null);

		// assert
		assert.ok(fnInsertItemSpy.returned(oSelect));

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("setSelectedItem()");

	QUnit.test("setSelectedItem() should give a warning when called with faulty parameter", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnSetPropertySpy = this.spy(sap.m.SelectList.prototype, "setProperty"),
			fnSetAssociationSpy = this.spy(sap.m.SelectList.prototype, "setAssociation"),
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnSetPropertySpy = this.spy(sap.m.SelectList.prototype, "setProperty"),
			fnSetAssociationSpy = this.spy(sap.m.SelectList.prototype, "setAssociation"),
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
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oSelect.$("label").text(), "");
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("setSelectedItem()", function (assert) {

		//system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
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
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oSelect.$("label").text(), "");
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("setSelectedItemId()", function (assert) {

		//system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			selectedItemId: "item-id"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({

			selectedKey: "2",

			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
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
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oSelect.$("label").text(), "item 1");
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should set the selection correctly after the initial rendering", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnSetPropertySpy = this.spy(sap.m.SelectList.prototype, "setProperty"),
			fnSetAssociationSpy = this.spy(sap.m.SelectList.prototype, "setAssociation"),
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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			forceSelection: false,
			items: [
				new sap.ui.core.Item()
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

	// BCP 1580101530
	QUnit.test("it should correctly synchronize the selection after the properties (models and bindingContext) are propagated", function (assert) {

		// system under test
		var oItemTemplate = new sap.ui.core.Item({
			key: "{key}",
			text: "{text}"
		});

		var oSelect = new sap.m.Select({
			selectedKey: {
				path: "/selected"
			},
			items: {
				path: "/items",
				template: oItemTemplate
			}
		});

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().setModel(oModel);
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.getSelectedKey(), "AR");

		// cleanup
		oSelect.destroy();
		oModel.destroy();
	});

	// BCP 1780153332
	QUnit.test("it should not fire the select event after losing focus, when the selection was changed while the select was focused", function (assert) {

		// system under test
		var oItemTemplate = new sap.ui.core.Item({
			key: "{key}",
			text: "{text}"
		});

		var oSelect = new sap.m.Select({
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
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().setModel(oModel);
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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

	QUnit.module("value state");

	QUnit.test("it should add the value state CSS classes (initial rendering)", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			valueState: sap.ui.core.ValueState.Error
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

		// assert
		assert.strictEqual(oSelect.$().attr("aria-invalid"), "true");
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
		var oSelect = new sap.m.Select();

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

		// act
		oSelect.setValueState(sap.ui.core.ValueState.Error);

		// assert
		assert.strictEqual(oSelect.$().attr("aria-invalid"), "true");
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
		var oSelect = new sap.m.Select({
			valueState: sap.ui.core.ValueState.Error
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var CSS_CLASS = oSelect.getRenderer().CSS_CLASS;

		// act
		oSelect.setValueState(sap.ui.core.ValueState.None);

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

	QUnit.module("setTooltip()");

	// BCP 1580232802
	QUnit.test("it should display the control tooltip instead of the default tooltip of the icon", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			tooltip: "lorem ipsum",
			type: sap.m.SelectType.IconOnly,
			icon: sap.ui.core.IconPool.getIconURI("filter")
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.$().attr("title"), "lorem ipsum");
		assert.strictEqual(oSelect.$("icon").attr("title"), undefined);

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("removeItem()");

	QUnit.test("it should return null when called with an invalid input argument value", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();

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
		var oSelect = new sap.m.Select({
			items: {
				path: "/items",
				template: new sap.ui.core.Item({
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
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().setModel(oModel);
		oSelect.placeAt("content");
		var oSelectedItem = oSelect.getItemByKey("8");
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({

			items: {
				path: "/items",
				template: new sap.ui.core.Item({
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
		var oModel = new sap.ui.model.json.JSONModel();

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

		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.removeItem(0);
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.removeItem(0);
		sap.ui.getCore().applyChanges();

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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "li",
					text: "lorem ipsum"
				})
			],
			selectedKey: "li"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.removeAllItems();
		oSelect.invalidate();
		sap.ui.getCore().applyChanges();

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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.open();
		this.clock.tick(1000);

		// assert
		assert.ok(oSelect.isOpen(), "the dropdown list is open");
		assert.ok(oSelect.hasStyleClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"));
		assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "the text field should get the focus");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("open() on phone", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		document.documentElement.style.overflow = "hidden"; // hide scrollbar during test

		// act
		oSelect.open();
		this.clock.tick(1000);

		// assert
		assert.ok(oSelect.isOpen(), "Select is open");
		assert.ok(oSelect.hasStyleClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"));

		// cleanup
		oSelect.destroy();
		document.documentElement.style.overflow = ""; // restore scrollbar after test
	});

	QUnit.test("open() on tablet", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: false,
			tablet: true
		});

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.open();
		this.clock.tick(1000);

		// assert
		assert.ok(oSelect.isOpen(), "the dropdown list is open");
		assert.ok(oSelect.hasStyleClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"));
		assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "the text field should get the focus");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("open() check whether the active state persist after re-rendering", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		oSelect.open();
		this.clock.tick(500);

		// act
		oSelect.rerender();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSelect.hasStyleClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"));

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("open() the picker popup (dropdown list) should automatically size itself to fit its content", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			width: "100px",
			items: [
				new sap.ui.core.Item({
					text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.open();
		this.clock.tick(500);

		// assert
		assert.ok(oSelect.getPicker().getDomRef().offsetWidth > 100);

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("close()");

	QUnit.test("close() on phone restores focus to the select", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		var fnFocusSpy = this.spy(oSelect, "focus");

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		document.documentElement.style.overflow = "hidden"; // hide scrollbar during test

		// act
		sap.ui.test.qunit.triggerTouchEvent("tap", oSelect.getDomRef(), {
			srcControl: oSelect
		});
		this.clock.tick(1000);

		// assert
		assert.ok(oSelect.isOpen(), "Select is open");

		assert.equal(fnFocusSpy.callCount, 1, "Focus was called");

		// act
		oSelect.close();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(document.activeElement, oSelect.getDomRef(), "Focus was successfully restored to the Select");

		// cleanup
		oSelect.destroy();
		document.documentElement.style.overflow = ""; // restore scrollbar after test
	});

	QUnit.module("findFirstEnabledItem()");

	QUnit.test("findFirstEnabledItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oSelect.findFirstEnabledItem(aItems);

		// assert
		assert.ok(oFirstEnabledItem === null, 'The first enabled item is "null"');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("findFirstEnabledItem()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			oExpectedItem = new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oSelect.findLastEnabledItem(aItems);

		// assert
		assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("findLastEnabledItem()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oSelect.findLastEnabledItem([]);

		// assert
		assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("findNextItemByFirstCharacter()");

	QUnit.test("findNextItemByFirstCharacter() test case 1", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Algeria"
				}),

				oExpectedItem = new sap.ui.core.Item({
					text: "Argentina"
				}),

				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "DZ",
					text: "Algeria"
				}),

				new sap.ui.core.Item({
					key: "AR",
					text: "Argentina"
				}),

				oExpectedItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					key: "DZ",
					text: "Algeria"
				}),

				new sap.ui.core.Item({
					key: "AR",
					text: "Argentina"
				}),

				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "DZ",
					text: "Algeria"
				}),

				new sap.ui.core.Item({
					key: "AR",
					text: "Argentina",
					enabled: false
				}),

				oExpectedItem = new sap.ui.core.Item({
					key: "AU",
					text: "Australia"
				}),

				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "DZ",
					text: "Algeria"
				}),

				new sap.ui.core.SeparatorItem(),

				oExpectedItem = new sap.ui.core.Item({
					key: "AU",
					text: "Australia"
				}),

				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "DZ",
					text: "Algeria"
				}),

				new sap.ui.core.Item({
					key: "AU",
					text: "Australia"
				}),

				new sap.ui.core.Item({
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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem = new sap.ui.core.Item({
				key: "3",
				text: "item 3"
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		setSelectedIndexTestCase("", {
			control: new sap.m.Select({
				items: aItems
			}),
			input: 2,
			output: oExpectedItem
		});
	}());

	setSelectedIndexTestCase("", {
		control: new sap.m.Select(),
		input: 2,
		output: null
	});

	(function () {
		var oExpectedItem;
		var aItems = [
			new sap.ui.core.Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			new sap.ui.core.Item({
				key: "3",
				text: "item 3"
			}),

			oExpectedItem = new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		setSelectedIndexTestCase("The provided index is bigger than the last item's index", {
			control: new sap.m.Select({
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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			oExpectedItem = new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			oExpectedItem = new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oSelect.getFirstItem();

		// assert
		assert.ok(oItem === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("getFirstItem()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem = new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oSelect.getLastItem();

		// assert
		assert.ok(oItem === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("getLastItem()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			oExpectedItem0 = new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			oExpectedItem1 = new sap.ui.core.Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem2 = new sap.ui.core.Item({
				key: "2",
				text: "item 2"
			})
		];

		var oSelect = new sap.m.Select({
			items: aItems
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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
			oExpectedItem = new sap.ui.core.Item({
				key: "0",
				text: "item 0"
			}),

			new sap.ui.core.Item({
				key: "1",
				text: "item 1",
				enabled: false
			})
		];

		var oSelect = new sap.m.Select({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnDestroySpy = this.spy(oSelect.getValueStateMessage(), "destroy");

		// act
		oSelect.destroy();
		sap.ui.getCore().applyChanges();

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		oSelect.open();
		this.clock.tick(1000);

		// act
		oSelect.destroy();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.getItems().length, 0);
		assert.ok(oSelect.getDomRef() === null);
		assert.ok(oSelect.getPicker() === null);
		assert.ok(oSelect.getList() === null);
	});

	// Tests for methods borrowed from class sap.ui.core.Control

	// Tests for methods borrowed from class sap.ui.core.Element

	// Tests for methods borrowed from class sap.ui.base.ManagedObject

	QUnit.module("addAggregation() + getAggregation()");

	QUnit.test("addAggregation() + getAggregation()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select();
		var oItem = new sap.ui.core.Item({
			key: "GER",
			text: "Germany"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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
		var oSelect = new sap.m.Select();
		var oItem = new sap.ui.core.Item({
			key: "GER",
			text: "Germany"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				}),
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				}),
				oItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: {
				path: "/contries",
				template: new sap.ui.core.Item({
					text: "{name}"
				})
			},
			change: function (oControlEvent) {
				jQuery.sap.log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
			}
		});

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().applyChanges();
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

	QUnit.test("it should set the value of the aria-labelledby attribute to the id of the label concatenated with the id of the internal label element separated by a space", function (assert) {

		// system under test
		var oLabel = new sap.m.Label({
			id: "label"
		});

		var oSelect = new sap.m.Select({
			ariaLabelledBy: oLabel
		});

		// arrange
		oLabel.placeAt("content");
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sExpectedLabelledBy = "label " + oSelect.getId() + "-label";

		// assert
		assert.strictEqual(oSelect.getDomRef().getAttribute("aria-labelledby"), sExpectedLabelledBy);

		// cleanup
		oSelect.destroy();
		oLabel.destroy();
	});

	QUnit.module("destroyAggregation()");

	QUnit.test("destroyAggregation()", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select();

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
		var mData = {
			"countries": [
				{
					"value": "GER",
					"text": "Germany"
				}
			],
			"selected": "GER"
		};
		var oItemTemplate = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				}),
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					id: "item-cu",
					key: "CU",
					text: "Cuba"
				}),
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Cuba"
				}),
				oExpectedItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select();
		var oItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					id: "ger-id",
					key: "GER",
					text: "Germany"
				}),
				oExpectedItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select();

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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

		var oItemTemplate = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select();

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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

		var oItemTemplate = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: {
				path: "/contries",
				template: new sap.ui.core.Item({
					key: "{code}",
					text: "{name}"
				})
			},
			selectedKey: {
				path: "/selected"
			}
		});

		// arrange
		var oModel = new sap.ui.model.json.JSONModel();
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
		sap.ui.getCore().applyChanges();

		// act
		oSelect.updateAggregation("items");
		sap.ui.getCore().applyChanges();

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
		var oExpectedItem = new sap.ui.core.Item({
			text: "lorem ipsum 2"
		});

		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			forceSelection: false,
			items: [
				new sap.ui.core.Item({
					text: "lorem ipsum 1"
				}),

				new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			width: "auto"
		});

		// assert
		assert.strictEqual(oSelect._isShadowListRequired(), true);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("_isShadowListRequired() it should return false when the autoAdjustWidth property is set to true", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			autoAdjustWidth: true
		});

		// assert
		assert.strictEqual(oSelect._isShadowListRequired(), false);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("_isShadowListRequired() it should return false", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			width: "15rem"
		});

		// assert
		assert.strictEqual(oSelect._isShadowListRequired(), false);

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("HTML");

	QUnit.test("rendering", function (assert) {

		var oSelect1 = new sap.m.Select({
			width: "50%",
			items: [
				new sap.ui.core.Item({
					key: "3",
					text: "item 3 item is not visible"
				})
			],
			visible: false
		});

		var oSelect2 = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "4",
					text: "item 4"
				}),

				new sap.ui.core.Item({
					key: "5",
					text: "item 5"
				}),

				new sap.ui.core.Item({
					key: "6",
					text: "item 6"
				}),

				new sap.ui.core.Item({
					key: "7",
					text: "item 7"
				}),

				new sap.ui.core.Item({
					key: "8",
					text: "item 8"
				})
			]
		});

		var oSelect3 = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "9",
					text: "item 9"
				})
			]
		});

		var oSelect4 = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "10",
					text: "item 10"
				}),

				new sap.ui.core.Item({
					key: "11",
					text: "item 11"
				}),

				new sap.ui.core.Item({
					key: "12",
					text: "item 12"
				}),

				new sap.ui.core.Item({
					key: "13",
					text: "item 13"
				})
			],

			selectedKey: "13"
		});

		var oSelect5 = new sap.m.Select({
			width: "13rem",
			items: [
				new sap.ui.core.Item({
					key: "14",
					text: "item 14"
				}),

				new sap.ui.core.Item({
					key: "15",
					text: "item 15"
				}),

				new sap.ui.core.Item({
					key: "16",
					text: "item 16"
				}),

				new sap.ui.core.Item({
					key: "17",
					text: "item 17"
				})
			]
		});

		var oSelect6 = new sap.m.Select({
			width: "200px",

			items: [
				new sap.ui.core.Item({
					key: "18",
					text: "item 18"
				}),

				new sap.ui.core.Item({
					key: "19",
					text: "item 19"
				}),

				new sap.ui.core.Item({
					key: "20",
					text: "item 20"
				}),

				new sap.ui.core.Item({
					key: "21",
					text: "item 21"
				})
			]
		});

		var oSelect7 = new sap.m.Select({

			items: [
				new sap.ui.core.Item({
					key: "22",
					text: "item 22"
				}),

				new sap.ui.core.Item({
					key: "23",
					text: "item 23"
				}),

				new sap.ui.core.Item({
					key: "24",
					text: "item 24"
				})
			]
		});

		var oSelect8 = new sap.m.Select({
			type: sap.m.SelectType.IconOnly,
			icon: sap.ui.core.IconPool.getIconURI("add"),
			items: [
				new sap.ui.core.Item({
					key: "52",
					text: "item 52"
				}),

				new sap.ui.core.Item({
					key: "53",
					text: "item 53"
				}),

				new sap.ui.core.Item({
					key: "54",
					text: "item 54"
				})
			]
		});

		var aSelects = [oSelect1, oSelect2, oSelect3, oSelect4, oSelect5, oSelect6, oSelect7, oSelect8];

		var SelectType = sap.m.SelectType;

		// arrange
		oSelect1.placeAt("content");
		oSelect2.placeAt("content");
		oSelect3.placeAt("content");
		oSelect4.placeAt("content");
		oSelect5.placeAt("content");
		oSelect6.placeAt("content");
		oSelect7.placeAt("content");
		oSelect8.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		aSelects.forEach(function (oSelect) {
			var CSS_CLASS = sap.m.SelectRenderer.CSS_CLASS;

			if (!oSelect.getVisible()) {
				return;
			}

			if (oSelect.getType() === SelectType.Default) {
				assert.ok(oSelect.$().length, "The HTML div container html element exists");
				assert.ok(oSelect.$("label").length, "The HTML label first-child element exists");
				assert.ok(oSelect.$("arrow").length, "The HTML span element for the arrow exists");
			} else if (oSelect.getType() === sap.m.SelectType.IconOnly) {
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
			}

			if (oSelect.getType() === SelectType.Default) {
				assert.strictEqual(oSelect.getDomRef().getAttribute("role"), "combobox");
			} else if (oSelect.getType() === SelectType.IconOnly) {
				assert.strictEqual(oSelect.getDomRef().getAttribute("role"), "button");
			}

			assert.strictEqual(oSelect.getDomRef().getAttribute("aria-expanded"), "false");
			assert.strictEqual(oSelect.$("label").attr("aria-live"), "polite");

			// cleanup
			oSelect.destroy();
		});
	});

	QUnit.module("Rendering - min width");

	QUnit.test("min-width added/removed", function (assert) {
		var oSel1 = new sap.m.Select({
			width: "10%"
		}),
		oSel2 = new sap.m.Select({
			width: "auto"
		}),
		oSel3 = new sap.m.Select({
			autoAdjustWidth: true
		}),
		oSel4 = new sap.m.Select({
				width: "10rem"
		}),
		oSel5 = new sap.m.Select({
			width: "2px"
		}),
		oSel6 = new sap.m.Select({
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
		sap.ui.getCore().applyChanges();

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

	QUnit.module("touchstart");

	QUnit.test("touchstart", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelect.getDomRef(), {
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
		assert.ok(oSelect.$().hasClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"), 'The select must have the css class “' + sap.m.SelectRenderer.CSS_CLASS + 'Pressed”');

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("touchend");

	QUnit.test("touchend", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelect.getDomRef(), {
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

		sap.ui.test.qunit.triggerTouchEvent("touchend", oSelect.getDomRef(), {
			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		});

		// assert
		assert.ok(!oSelect.$().hasClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"), 'The select must not have the CSS class “' + sap.m.SelectRenderer.CSS_CLASS + 'Pressed”');

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("tap");

	QUnit.test("tap", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
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
		sap.ui.getCore().applyChanges();

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSelect.getDomRef(), {
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

		sap.ui.test.qunit.triggerTouchEvent("touchend", oSelect.getDomRef(), {
			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		});

		sap.ui.test.qunit.triggerTouchEvent("tap", oSelect.getDomRef(), {
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
		assert.ok(oSelect.$().hasClass(sap.m.SelectRenderer.CSS_CLASS + "Pressed"), 'The select must have the css class “' + sap.m.SelectRenderer.CSS_CLASS + 'Pressed”');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("tap on pre-selected item with keyboard keys should fire change event", function (assert) {
		var oItem2 = new sap.ui.core.Item({text : "2"}),
			oSelect = new sap.m.Select({
				items: [new sap.ui.core.Item({text : "1"}), oItem2]
			}),
			fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();

		// act
		// move to the second item with ARROW_DOWN (pre-select item) and execute tap.
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerEvent("tap", oItem2.getDomRef());

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
			sap.ui.getCore().applyChanges();
			oSelect.focus();

			// act
			sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), mOptions.character);

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
			control: new sap.m.Select({
				items: [
					new sap.ui.core.Item({
						key: "0",
						text: "a item 0"
					}),

					oExpectedItem = new sap.ui.core.Item({
						key: "1",
						text: "A item 1"
					})
				]
			}),

			character: "A",
			output: oExpectedItem
		});

		fnKeypressTestCase({
			control: new sap.m.Select({
				items: [
					new sap.ui.core.Item({
						key: "0",
						text: "A item 0"
					}),

					oExpectedItem = new sap.ui.core.Item({
						key: "1",
						text: "a item 1"
					})
				]
			}),

			character: "A",
			output: oExpectedItem
		});

		fnKeypressTestCase({
			control: new sap.m.Select({
				items: [
					new sap.ui.core.Item({
						key: "0",
						text: "0 item 0"
					}),

					oExpectedItem = new sap.ui.core.Item({
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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "DZ",
					text: "Algeria"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "BE",
					text: "Belgium"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "B");

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

	QUnit.test("it should select Germany", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Argentina"
				}),
				oExpectedItem = new sap.ui.core.Item({
					text: "Germany"
				}),
				new sap.ui.core.Item({
					text: "Ghana"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "E");

		// assert
		assert.ok(oSelect.getSelectedItem() === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should select Gglorem", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Argentina"
				}),
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),
				oExpectedItem = new sap.ui.core.Item({
					text: "Gglorem"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");

		// assert
		assert.ok(oSelect.getSelectedItem() === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should select Ghana", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Argentina"
				}),
				new sap.ui.core.Item({
					text: "Germany"
				}),
				oExpectedItem = new sap.ui.core.Item({
					text: "Ghana"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		this.clock.tick(3000);
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");

		// assert
		assert.ok(oSelect.getSelectedItem() === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should select Greece", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Argentina"
				}),
				new sap.ui.core.Item({
					text: "Germany"
				}),
				new sap.ui.core.Item({
					text: "Ghana"
				}),
				oExpectedItem = new sap.ui.core.Item({
					text: "Greece"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");

		// assert
		assert.ok(oSelect.getSelectedItem() === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should select Gglorem", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Argentina"
				}),
				new sap.ui.core.Item({
					text: "Germany"
				}),
				oExpectedItem = new sap.ui.core.Item({
					text: "Gglorem"
				}),
				new sap.ui.core.Item({
					text: "Ghana"
				}),
				new sap.ui.core.Item({
					text: "Greece"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");

		// assert
		assert.ok(oSelect.getSelectedItem() === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should select Greece", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "Argentina"
				}),
				new sap.ui.core.Item({
					text: "Germany"
				}),
				new sap.ui.core.Item({
					key: "gg",
					text: "Gglorem"
				}),
				new sap.ui.core.Item({
					text: "Ghana"
				}),
				oExpectedItem = new sap.ui.core.Item({
					text: "Greece"
				})
			],
			selectedKey: "gg"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");
		sap.ui.test.qunit.triggerKeypress(oSelect.getDomRef(), "G");

		// assert
		assert.ok(oSelect.getSelectedItem() === oExpectedItem);

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsapshow");

	QUnit.test("onsapshow F4 - the picker popup", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnShowSpy = this.spy(oSelect, "onsapshow");
		var sOpenState = !jQuery.support.cssAnimations ? sap.ui.core.OpenState.OPEN : sap.ui.core.OpenState.OPENING;	// no animation on ie9

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.F4);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");
		assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is opening");
		assert.ok(oSelect.isOpen(), "Control's picker popup is open");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - open control's picker the popup", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnShowSpy = this.spy(oSelect, "onsapshow");
		var sOpenState = !jQuery.support.cssAnimations ? sap.ui.core.OpenState.OPEN : sap.ui.core.OpenState.OPENING;	// no animation on ie9

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, true);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");
		assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is opening");
		assert.ok(oSelect.isOpen(), "Control's picker popup is open");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapshow F4 - close control's picker popup", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnShowSpy = this.spy(oSelect, "onsapshow");
		var sOpenState = !jQuery.support.cssAnimations ? sap.ui.core.OpenState.CLOSED : sap.ui.core.OpenState.CLOSING;	// no animation on ie9

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.F4);
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.F4);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
		assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is closing");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - close control's picker popup", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnShowSpy = this.spy(oSelect, "onsapshow");
		var sOpenState = !jQuery.support.cssAnimations ? sap.ui.core.OpenState.CLOSED : sap.ui.core.OpenState.CLOSING;	// no animation on ie9

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, true);
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, true);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
		assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is closing");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsaphide");

	QUnit.test("onsaphide Alt + UP - open control's picker popup", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnHideSpy = this.spy(oSelect, "onsaphide");
		var sOpenState = !jQuery.support.cssAnimations ? sap.ui.core.OpenState.OPEN : sap.ui.core.OpenState.OPENING;	// no animation on ie9

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, true, false);

		// assert
		assert.strictEqual(fnHideSpy.callCount, 1, "onsaphide() method was called exactly once");
		assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is opening");
		assert.ok(oSelect.isOpen(), "Control's picker popup is open");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsaphide Alt + UP - close control's picker popup", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnHideSpy = this.spy(oSelect, "onsaphide");
		var sOpenState = !jQuery.support.cssAnimations ? sap.ui.core.OpenState.CLOSED : sap.ui.core.OpenState.CLOSING;	// no animation on ie9

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, true, false);
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, true, false);

		// assert
		assert.strictEqual(fnHideSpy.callCount, 2, "onsaphide() method was called twice");
		assert.strictEqual(oSelect.getPicker().oPopup.getOpenState(), sOpenState, "Control's picker popup is closing");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsapspace");

	QUnit.test("onsapspace the spacebar key is pressed and the picker popup is close", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),

				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// assert
		assert.ok(oSelect.isOpen(), "Control's picker popup is open");
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event should not be fired");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapspace the spacebar key is pressed and the picker popup is open", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),

				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oSelect.isOpen(), false, "Control's picker popup is close");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapspace when spacebar key is pressed and the selection has changed", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),

				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);	// change the selection
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.SPACE);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsapescape");

	QUnit.test("onsapescape - close the picker popup if it is open", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnEscapeSpy = this.spy(oSelect, "onsapescape");
		var fnCloseSpy = this.spy(oSelect, "close");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 0, "close() method is not called");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapescape - close the control's picker popup if it is open", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);

		var fnEscapeSpy = this.spy(oSelect, "onsapescape");
		var fnCloseSpy = this.spy(oSelect, "close");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapescape when escape key is pressed and the selection has changed", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),

				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);	// change the selection

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired as escape reverts any changes");
		assert.strictEqual(oSelect.getSelectedKey(), "GER", "The selection is reverted on escape");
		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsapenter");

	QUnit.test("onsapenter - close list box", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnEnterSpy = this.spy(oSelect, "onsapenter");
		var fnCloseSpy = this.spy(oSelect, "close");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnEnterSpy.callCount, 1, "onsapenter() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("onsapenter when enter key is pressed and the selection has changed", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "GER",
					text: "Germany"
				}),

				new sap.ui.core.Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);	// change the selection
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsapdown");

	QUnit.test("onsapdown", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyDownSpy = this.spy(oSelect, "onsapdown");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyDownSpy = this.stub(oSelect, "onsapdown");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyDownSpy = this.spy(oSelect, "onsapdown");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item(),
				oExpectedItem = new sap.ui.core.Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait after the open animation is completed and the list is rendered

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getFocusDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onfocusout");

	QUnit.test("it should not fire the change event if re-rendering occurs (test case 1)", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item(),
				new sap.ui.core.Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		oSelect.rerender();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should not fire the change event if re-rendering occurs (test case 2)", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item(),
				new sap.ui.core.Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		oSelect.rerender();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oSelect.destroy();
	});

	// BCP 1570819144
	QUnit.test("it should not fire the change event after the selected item is removed and re-added again", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item()
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.getFocusDomRef().blur();
		oSelect.removeAllItems();
		oSelect.addItem(new sap.ui.core.Item());
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		oSelect.getFocusDomRef().blur();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should fire the change event", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item(),
				new sap.ui.core.Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		oSelect.rerender();
		sap.ui.getCore().applyChanges();

		// act
		oSelect.getFocusDomRef().blur();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1);

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should not fire the change event", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item()
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oItem;
		var oSelect = new sap.m.Select({
			items: [
				oItem = new sap.ui.core.Item({
					text: "lorem ipsum foo"
				}),
				new sap.ui.core.Item({
					text: "lorem ipsum bar"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000); // wait after the open animation is completed and the list is rendered
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");
		var oItemDomRef = oItem.getDomRef();

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN); // navigate to next selectable item

		sap.ui.test.qunit.triggerEvent("mousedown", oItemDomRef, {
			target: oItemDomRef
		});

		sap.ui.test.qunit.triggerEvent("mouseup", oItemDomRef, {
			target: oItemDomRef
		});

		sap.ui.test.qunit.triggerEvent("click", oItemDomRef, {
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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				oItem = new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: oItem
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyUpSpy = this.spy(oSelect, "onsapup");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyUpSpy = this.spy(oSelect, "onsapup");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: oExpectedItem
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyUpSpy = this.stub(oSelect, "onsapup");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					text: "Germany"
				}),
				new sap.ui.core.Item({
					key: "AR",
					text: "Argentina"
				})
			],
			selectedKey: "AR"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait after the open animation is completed and the list is rendered

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getFocusDomRef(), jQuery.sap.KeyCodes.ARROW_UP);

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
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2",
					enabled: false
				}),

				oItem = new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				}),

				new sap.ui.core.Item({
					key: "4",
					text: "item 4",
					enabled: false
				})
			],

			selectedItem: oItem
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyHomeSpy = this.spy(oSelect, "onsaphome");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.HOME);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				}),

				oItem = new sap.ui.core.Item({
					key: "4",
					text: "item 4"
				})
			],

			selectedItem: oItem
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyHomeSpy = this.spy(oSelect, "onsaphome");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.HOME);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				}),

				oItem = new sap.ui.core.Item({
					key: "4",
					text: "item 4"
				})
			],

			selectedItem: oItem
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyHomeSpy = this.spy(oSelect, "onsaphome");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.HOME);
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.HOME);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					enabled: false
				}),

				oExpectedItem = new sap.ui.core.Item({
					text: "expected"
				}),

				new sap.ui.core.Item(),

				new sap.ui.core.Item({
					key: "3"
				})
			],

			selectedKey: "3"
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait after the open animation is completed

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getFocusDomRef(), jQuery.sap.KeyCodes.HOME);

		// assert
		assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-activedescendant"), oExpectedItem.getId());

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onsapend");

	QUnit.test("onsapend", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "4",
					text: "item 4"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyEndSpy = this.spy(oSelect, "onsapend");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.END);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new sap.ui.core.Item({
					key: "1",
					text: "item 1"
				}),

				new sap.ui.core.Item({
					key: "2",
					text: "item 2"
				}),

				new sap.ui.core.Item({
					key: "3",
					text: "item 3"
				}),

				oExpectedItem = new sap.ui.core.Item({
					id: "item-id",
					key: "4",
					text: "item 4"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		var fnKeyEndSpy = this.spy(oSelect, "onsapend");
		var fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.END);
		sap.ui.test.qunit.triggerKeydown(oSelect.getDomRef(), jQuery.sap.KeyCodes.END);

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
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item(),
				new sap.ui.core.Item(),
				oExpectedItem = new sap.ui.core.Item({
					text: "expected"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();
		this.clock.tick(1000);	// wait after the open animation is completed

		// act
		sap.ui.test.qunit.triggerKeydown(oSelect.getFocusDomRef(), jQuery.sap.KeyCodes.END);

		// assert
		assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-activedescendant"), oExpectedItem.getId());

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onAfterOpen");

	QUnit.test("onAfterOpen test case 1", function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					text: "expected"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		oSelect.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// assert
		assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-expanded"), "true");
		assert.strictEqual(oSelect.getDomRef().getAttribute("aria-owns"), oSelect.getList().getId(), 'the attribute "aria-owns" is set after the list is rendered');
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.test('it should set the attribute "aria-activedescendant" after the picker popup is opened', function (assert) {

		// system under test
		var oExpectedItem;
		var oSelect = new sap.m.Select({
			items: [
				oExpectedItem = new sap.ui.core.Item({
					text: "expected"
				})
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();

		// act
		oSelect.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed and the list is rendered

		// assert
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), oExpectedItem.getId(), 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("onAfterClose");

	QUnit.test("onAfterClose", function (assert) {

		// system under test
		var item2 = new sap.ui.core.Item({text : "2"});
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({text : "1"}),
				item2
			]
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();

		if (jQuery.support.cssAnimations) {	// no animation on ie9
			this.clock.tick(1000);
		}

        // act
		sap.ui.test.qunit.triggerEvent("tap", item2.getDomRef());

		if (jQuery.support.cssAnimations) {	// no animation on ie9
			this.clock.tick(1000);
		}

		// assert
		assert.strictEqual(oSelect.getFocusDomRef().getAttribute("aria-expanded"), "false");
		assert.strictEqual(jQuery(oSelect.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("Events");

	QUnit.test("change of selected item onChange should not re-trigger change event", function (assert) {
		var oItem1 =  new sap.ui.core.Item({key: "1", text : "1"}),
			oItem2 = new sap.ui.core.Item({key: "2", text : "2"}),
			oSelect = new sap.m.Select({
				items: [oItem1, oItem2],
				change: function () {
					oSelect.setSelectedKey("1");
				}
			}),
			fnFireChangeSpy = this.spy(oSelect, "fireChange");

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSelect.focus();
		oSelect.open();

		// act
		// select the second item
		sap.ui.test.qunit.triggerEvent("tap", oItem2.getDomRef());

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired once");
		assert.strictEqual(oSelect.getSelectedItem(), oItem1, "The selected item is correct");

		// cleanup
		oSelect.destroy();
	});


	QUnit.test("Tab handling shouldn't mark the event", function(assert) {
		var oSelect = new sap.m.Select(),
			$oTabNextEvent = jQuery.Event("tabNextTestEvent"),
			$oTabPreviousEvent = jQuery.Event("tabPreviousTestEvent");

		oSelect.onsaptabnext($oTabNextEvent);
		assert.notOk($oTabNextEvent.isMarked(), "The event isn't marked by the onsaptabnext method");

		oSelect.onsaptabprevious($oTabPreviousEvent);
		assert.notOk($oTabPreviousEvent.isMarked(), "The event isn't marked by the onsaptabprevious method");

		oSelect.destroy();
	});

	QUnit.module("Text direction");

	QUnit.test("textDirection set to RTL", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "(+359) 111 222 333"
				}),
				new sap.ui.core.Item({
					text: "20/06/1983 11:30"
				})
			],
			textDirection: sap.ui.core.TextDirection.RTL
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.$("label").attr("dir"), "rtl", "Dir attribute is rendered and is set to 'rtl'");

		// cleanup
		oSelect.destroy();

	});

	QUnit.test("textDirection set to LTR", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "(+359) 111 222 333"
				}),
				new sap.ui.core.Item({
					text: "20/06/1983 11:30"
				})
			],
			textDirection: sap.ui.core.TextDirection.LTR
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSelect.$("label").attr("dir"), "ltr", "Dir attribute is rendered and is set to 'ltr'");

		// cleanup
		oSelect.destroy();

	});

	QUnit.test("textDirection set to RTL and textAlign set to BEGIN", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "(+359) 111 222 333"
				}),
				new sap.ui.core.Item({
					text: "20/06/1983 11:30"
				})
			],
			textDirection: sap.ui.core.TextDirection.RTL,
			textAlign: sap.ui.core.TextAlign.Begin
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		var $SelectLabel = oSelect.$("label");

		assert.strictEqual($SelectLabel.attr("dir"), "rtl", "Dir attribute is rendered and is set to 'rtl'");
		assert.strictEqual($SelectLabel.css("text-align"), "right", "Text align style is shifted to right");

		// cleanup
		oSelect.destroy();

	});

	QUnit.test("textDirection set to LTR and textAlign set to END", function (assert) {

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "(+359) 111 222 333"
				}),
				new sap.ui.core.Item({
					text: "20/06/1983 11:30"
				})
			],
			textDirection: sap.ui.core.TextDirection.LTR,
			textAlign: sap.ui.core.TextAlign.End
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		var $SelectLabel = oSelect.$("label");

		assert.strictEqual($SelectLabel.attr("dir"), "ltr", "Dir attribute is rendered and is set to 'ltr'");
		assert.strictEqual($SelectLabel.css("text-align"), "right", "Text align style is shifted to right");

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("Label for IconOnly Select", function (assert) {
		var aItems = [
			new sap.ui.core.Item({key: "Item1", text: "Item1"}),
			new sap.ui.core.Item({key: "Item2", text: "Item2"})
		];

		var oIconOnlySelect = new sap.m.Select("iconOnlySelect", {
			icon: "sap-icon//search",
			type: "IconOnly",
			items: aItems
		});

		var oStandardSelect = new sap.m.Select("standardSelect", {
			items: aItems
		});

		oIconOnlySelect.placeAt("content");
		oStandardSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(document.getElementById("iconOnlySelect-label").innerHTML, "", "No label text is rendered for IconOnly select");
		assert.notStrictEqual(document.getElementById("standardSelect-label").innerHTML, "", "Label text is rendered for standard select");

		oIconOnlySelect.destroy();
		oStandardSelect.destroy();
	});

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oSelect = new sap.m.Select({
			icon: "sap-icon://search",
			type: "IconOnly",
			tooltip: "Tooltip",
			items: [
				new sap.ui.core.Item({key: "Item1", text: "Item1"}),
				new sap.ui.core.Item({key: "Item2", text: "Item2"}),
				new sap.ui.core.Item({key: "Item3", text: "Item3"})
			]
		});
		assert.ok(!!oSelect.getAccessibilityInfo, "Select has a getAccessibilityInfo function");
		var oInfo = oSelect.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");

		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, "Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, undefined, "Editable");

		oSelect.setTooltip("");
		var oIconInfo = sap.ui.core.IconPool.getIconInfo(oSelect.getIcon());
		oInfo = oSelect.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, oIconInfo && oIconInfo.text ? oIconInfo.text : "", "Description");

		oSelect.setType("Default");
		oInfo = oSelect.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "combobox", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO"), "Type");
		assert.strictEqual(oInfo.description, "Item1", "Description");

		oSelect.setSelectedKey("Item2");
		oInfo = oSelect.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "combobox", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO"), "Type");
		assert.strictEqual(oInfo.description, "Item2", "Description");

		oSelect.destroy();
	});

	QUnit.module("value state");

	QUnit.test("it should open the value state message popup on focusin", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			valueState: sap.ui.core.ValueState.Warning
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

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

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "lorem ipsum"
				})
			],
			valueState: sap.ui.core.ValueState.Error
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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

	QUnit.test("it should close the value state message popup on focusout", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			valueState: sap.ui.core.ValueState.Warning
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			items: [
				new sap.ui.core.Item({
					text: "lorem ipsum"
				})
			],
			valueState: sap.ui.core.ValueState.Error
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();
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

	QUnit.test("it should open the value state message popup on setValueState to Error", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			valueState: sap.ui.core.ValueState.None
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.focus();
		oSelect.setValueState(sap.ui.core.ValueState.Error);
		this.clock.tick(101);

		// assert
		var oValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
		assert.ok(oValueStateMessageDomRef);
		assert.strictEqual(getComputedStyle(oValueStateMessageDomRef).getPropertyValue("display"), "block");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should close the value state message popup on setValueState to None", function (assert) {

		this.stub(sap.ui.Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oSelect = new sap.m.Select({
			valueState: sap.ui.core.ValueState.Error
		});

		// arrange
		oSelect.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSelect.focus();
		oSelect.setValueState(sap.ui.core.ValueState.None);
		this.clock.tick(101);

		// assert
		var oValueStateMessageDomRef = document.getElementById(oSelect.getValueStateMessageId());
		assert.strictEqual(oValueStateMessageDomRef, null);

		// cleanup
		oSelect.destroy();
	});

	QUnit.module("Picker's header", {
		beforeEach: function () {
			fnToMobileMode(); // Enter mobile mode

			this.oLabel = new sap.m.Label({
				text: "Label's text",
				labelFor: "theSelect"
			}).placeAt("content");

			this.oSelect = new sap.m.Select("theSelect", {
				items: [
					new sap.ui.core.Item({
						key: "0",
						text: "item 0"
					}),

					new sap.ui.core.Item({
						key: "1",
						text: "item 1"
					}),

					new sap.ui.core.Item({
						key: "2",
						text: "item 2"
					})
				]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSelect.destroy();
			this.oLabel.destroy();
		}
	});

	QUnit.test("Text of the picker's title", 2, function(assert) {

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
}());