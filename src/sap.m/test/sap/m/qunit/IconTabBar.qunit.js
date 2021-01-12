/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/m/IconTabHeader",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/m/library",
	"sap/ui/core/HTML",
	"sap/ui/core/Core",
	"sap/m/ObjectHeader",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(
	qutils,
	createAndAppendDiv,
	IconTabBar,
	IconTabFilter,
	IconTabSeparator,
	Button,
	Label,
	Text,
	JSONModel,
	IconTabHeader,
	List,
	CustomListItem,
	coreLibrary,
	KeyCodes,
	mobileLibrary,
	HTML,
	Core,
	ObjectHeader,
	Device,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.IconTabDensityMode
	var IconTabDensityMode = mobileLibrary.IconTabDensityMode;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	// shortcut for sap.m.IconTabHeaderMode
	var IconTabHeaderMode = mobileLibrary.IconTabHeaderMode;

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = mobileLibrary.IconTabFilterDesign;

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;

	createAndAppendDiv("content");


	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function() {
		return Date.now();
	};

	QUnit.module("default values");

	QUnit.test("IconTabBar", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar();

		// Assert
		assert.ok(oIconTabBar.getShowSelection(), "showSelection is set to true");
		assert.ok(oIconTabBar.getExpandable(), "expandable is set to true");
		assert.ok(oIconTabBar.getExpanded(), "expanded is set to true");
		assert.ok(oIconTabBar.getVisible(), "visible is set to true");
		assert.ok(!oIconTabBar.getUpperCase(), "upperCase is set to false");
		assert.strictEqual(oIconTabBar.getSelectedKey(), "", "selectedKey is empty string");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("IconTabFilter", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter();

		// Assert
		assert.strictEqual(oIconTabFilter.getCount(), "", "count is empty string");
		assert.ok(!oIconTabFilter.getShowAll(), "showAll is set to false");
		assert.strictEqual(oIconTabFilter.getDesign(), "Vertical", "design is \"Vertical\"");
		assert.ok(oIconTabFilter.getVisible(), "visible is set to true");
		assert.strictEqual(oIconTabFilter.getIcon(), "", "icon is empty string");
		assert.strictEqual(oIconTabFilter.getIconColor(), "Default", "iconColor is \"Default\"");
		assert.ok(oIconTabFilter.getIconDensityAware(), "iconDensityAware is set to true");

		// Clean up
		oIconTabFilter.destroy();
	});

	QUnit.test("IconTabSeparator", function(assert) {

		// Arrange
		var oIconTabSeparator = new IconTabSeparator();

		// Assert
		assert.strictEqual(oIconTabSeparator.getIcon(), "", "icon is empty string");
		assert.ok(oIconTabSeparator.getIconDensityAware(), "iconDensityAware is set to true");

		// Clean up
		oIconTabSeparator.destroy();
	});

	QUnit.module("overwritten Aggregation methods");

	QUnit.test("addAggregation()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar();
		var oIconTabFilter = new IconTabFilter({ icon: "sap-icon://instance" });

		// Act
		oIconTabBar.addAggregation("items", oIconTabFilter);

		// Assert
		var oFirstItem = oIconTabBar.getItems()[0];
		assert.deepEqual(oIconTabFilter, oFirstItem, "aggregation is added");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("destroyAggregation()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance"
				})
			]
		});

		// Act
		oIconTabBar.destroyAggregation("items");

		// Assert
		assert.strictEqual(oIconTabBar.getItems().length, 0, "aggregation \"items\" is destroyed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("removeAllAggregation()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance"
				})
			]
		});

		// Act
		oIconTabBar.removeAllAggregation("items");

		// Assert
		assert.strictEqual(oIconTabBar.getItems().length, 0, "aggregation \"items\" is removed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("removeAggregation()", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter();
		var oIconTabBar = new IconTabBar({
			items: [ oIconTabFilter	]
		});

		// Act
		oIconTabBar.removeAggregation("items", oIconTabFilter);

		// Assert
		assert.strictEqual(oIconTabBar.getItems().length, 0, "removes oIconTabFilter from the aggregation \"items\"");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("getAggregation()", function(assert) {

		// Arrange
		var aContent = [new Button({ text: "btn1" })];
		var oIconTabBar = new IconTabBar({ content : aContent });

		// Assert
		assert.deepEqual(oIconTabBar.getAggregation("content"), aContent, "aggregation is properly returned");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("indexOfAggregation()", function(assert) {

		// Arrange
		var oButton1 = new Button({ text: "btn1" });
		var oButton2 = new Button({ text: "btn2" });
		var oIconTabBar = new IconTabBar({ content : [oButton1] });

		// Assert
		assert.strictEqual(oIconTabBar.indexOfAggregation("content", oButton1), 0, "aggregation \"content\" contains oButton1 at index 0");
		assert.strictEqual(oIconTabBar.indexOfAggregation("content", oButton2), -1, "aggregation \"content\" does not contain oButton2");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("insertAggregation()", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter();

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter(),
				new IconTabFilter()
			]
		});

		// Act
		oIconTabBar.insertAggregation("items", oIconTabFilter, 1);

		// Assert
		assert.strictEqual(oIconTabBar.getItems().indexOf(oIconTabFilter), 1, "aggregation is inserted at correct index");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("overwritten getter/setter methods");

	QUnit.test("getSelectedKey()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				})
			],
			selectedKey: "key1"
		});

		// Assert
		assert.strictEqual(oIconTabBar.getSelectedKey(), "key1", "getSelectedKey() is correct");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("setSelectedKey()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({key: "key1"}),
				new IconTabFilter({key: "key2"})
			]
		});

		// Act
		oIconTabBar.setSelectedKey("key2");

		// Assert
		assert.strictEqual(oIconTabBar.getSelectedKey(), "key2", "selected item is set correctly");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("setEmptySelectedKey()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			selectedKey: 'key2',
			items: [
				new IconTabFilter({key: "key1"}),
				new IconTabFilter({key: "key2"})
			]
		});

		// Assert
		assert.strictEqual(oIconTabBar.getSelectedKey(), "key2", "getSelectedKey() is correct");

		// Act
		oIconTabBar.setSelectedKey("");

		Core.applyChanges();

		// Assert
		assert.strictEqual(oIconTabBar.getSelectedKey(), "key1", "selected item is set correctly");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("getShowSelection()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			showSelection: false
		});

		// Assert
		assert.ok(!oIconTabBar.getShowSelection(), "getShowSelection is correct");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("setShowSelection()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar();

		// Act
		oIconTabBar.setShowSelection(false);

		// Assert
		assert.ok(!oIconTabBar.getShowSelection(), "showSelection is set to false");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("setExpandable()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar();

		// Act
		oIconTabBar.setExpandable(false);

		// Assert
		assert.ok(!oIconTabBar.getExpandable(), "expandable is set to false");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("setExpanded()", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar();

		// Act
		oIconTabBar.setExpanded(false);

		// Assert
		assert.ok(!oIconTabBar.getExpanded(), "expanded is set to false");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("setSelectedItem()", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter({key: "key2"});

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({key: "key1"}),
				oIconTabFilter
			]
		});

		// Act
		oIconTabBar.setSelectedItem(oIconTabFilter);

		// Assert
		assert.strictEqual(oIconTabBar.getSelectedKey(), "key2", "selected item is set correctly");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("item aggregation methods");

	QUnit.test("add IconTabFilter", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar();

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Add one item
		oIconTabBar.addItem(
			 new IconTabFilter({
					icon: "sap-icon://task",
					content: new Text({
						text: "Tab Content"
					})
				})
		);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oIconTabBar.getItems().length, 1, "The IconTabBar contains 1 item");
		assert.ok(oIconTabBar.getItems()[0].$().hasClass("sapMITBFilter"), "Filter has class sapMITBFilter");
		assert.strictEqual(oIconTabBar.$().find('.sapMITBContent').text(), "Tab Content", "content is rendered");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("remove IconTabFilter", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter({
			icon: "sap-icon://task"

		});
		var oIconTabBar = new IconTabBar({
			items: [
				oIconTabFilter
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Remove the item
		oIconTabBar.removeItem(0);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oIconTabBar.getItems().length, 0, "The bar contains 0 items");
		assert.strictEqual(oIconTabBar.getItems().indexOf(oIconTabFilter), -1, "The bar does not contain oIconTabFilter");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("rendering");

	QUnit.test("basic rendering", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task"
				}),
				new IconTabSeparator()
			],
			content: [new Label({text: "label"})]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().hasClass("sapMITB"), "IconTabBar has class sapMITB");
		assert.ok(oIconTabBar.getItems()[0].$().hasClass("sapMITBFilter"), "First IconTabBarFilter has class sapMITBFilter");
		assert.ok(!oIconTabBar.getItems()[0].$().hasClass("sapMITBSep"), "First IconTabBarFilter does not have class sapMITBSep");
		assert.ok(oIconTabBar.getItems()[1].$().hasClass("sapMITBSep"), "IconTabSeparator has class sapMITBSep");
		assert.ok(!oIconTabBar.getItems()[1].$().hasClass("sapMITBFilter"), "IconTabSeparator does not have class sapMITBFilter");
		assert.ok(oIconTabBar.$("content").hasClass("sapMITBContent"), "IconTabBar content is rendered");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("icons only", function(assert) {

		// Arrange
		var oIconTabBarNoText = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance"
				})
			]
		});

		// System under Test
		oIconTabBarNoText.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBarNoText.$("-header").hasClass("sapMITBNoText"), "should have class for no-text version");
		assert.ok(!oIconTabBarNoText.$("-header").hasClass("sapMITBTextOnly"), "should not have class for text-only version");

		// Clean up
		oIconTabBarNoText.destroy();
	});

	QUnit.test("text only", function(assert) {

		// Arrange
		var oIconTabBarTextOnly = new IconTabBar({
			items: [
					new IconTabFilter({
						text: "text1"
					}),
					new IconTabFilter({
						text: "text2"
					})
				]
		});

		// System under Test
		oIconTabBarTextOnly.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(!oIconTabBarTextOnly.$("-header").hasClass("sapMITBNoText"), "should not have class for no-text version");
		assert.ok(oIconTabBarTextOnly.$("-header").hasClass("sapMITBTextOnly"), "should have class for text-only version");

		// Clean up
		oIconTabBarTextOnly.destroy();
	});

	QUnit.test("UpperCase filter text", function(assert) {

		// Arrange
		var oIconTabBarTextOnly = new IconTabBar({
			items: [
					new IconTabFilter({
						text: "text1"
					})
				],
				upperCase: true
		});

		// System under Test
		oIconTabBarTextOnly.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBarTextOnly.$("-header").hasClass("sapMITBTextUpperCase"), "IconTabBar has class sapMITBTextUpperCase");

		// Clean up
		oIconTabBarTextOnly.destroy();
	});

	QUnit.test("IconTabFilter without content", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key2"
				})
			],
			content: new Label({text: "info info info"}),
			selectedKey: "key1"
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		//Assert
		// Verify that a filter without content shows the IconTabBar content
		var $itbf = oIconTabBar.$("content");
		assert.equal($itbf.children(0).text(), "info info info", "showing default IconTabBar content");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("IconTabFilter with content", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					content: new Text({text: "icon tab filter content"}),
					key: "key2"
				})
			],
			content: new Label({text: "info info info"}),
			selectedKey: "key1"
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		//Assert
		// Verify that the newly added content is rendered and overwrites the IconTabBar content
		var $itbf = oIconTabBar.$("content");
		assert.equal($itbf.children(0).text(), "icon tab filter content", "showing the IconTabFilter content");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("IconTabFilter with content and model update", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					visible: "{TabOneVisible}",
					icon: "sap-icon://instance",
					content: new Text({ text: "{TabOne}" }),
					key: "key1"
				}),
				new IconTabFilter({
					icon: "sap-icon://activity-items",
					content: new Text({ text: "{TabTwo}" }),
					key: "key2"
				})
			],
			selectedKey: "key1"
		});

		var oModel = new JSONModel();
		oModel.setData({
			"Data": [
				{
					"TabOne": "Item 1 tab one",
					"TabTwo": "Item 1 tab two"
				},
				{
					"TabOne": "Item 2 tab one",
					"TabTwo": "Item 2 tab two",
					"TabOneVisible": false
				}
			]
		});

		Core.setModel(oModel);

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oIconTabBar.bindElement("/Data/0");
		Core.applyChanges();
		oIconTabBar.bindElement("/Data/1");
		Core.applyChanges();

		// Assert
		var $itbf = oIconTabBar.$("content");
		assert.equal($itbf.children(0).text(), "Item 2 tab two", "IconTabFilter content should be rendered after the selected tab is updated by a model");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("IconTabBar without one content no rerendering of content", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key2"
				})
			],
			content: new Label({text: "info info info"}),
			selectedKey: "key1"
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();
		var oSelectSpy = sinon.spy(IconTabBar.prototype, "_rerenderContent");

		// Assert
		assert.strictEqual(oSelectSpy.callCount, 0, "content is not rerendered");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("standalone IconTabHeader", function(assert) {

		// Arrange
		var oIconTabHeader = new IconTabHeader({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					text : 'Open',
					count: '5545'
				}),
				new IconTabSeparator({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				})
			]
		});

		// System under Test
		oIconTabHeader.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabHeader.$().hasClass("sapMITH"), "oIconTabHeader has class sapMITH");
		assert.ok(oIconTabHeader.getItems()[0].$().hasClass("sapMITBFilter"), "First IconTabBarFilter has class sapMITBFilter");
		assert.ok(!oIconTabHeader.getItems()[0].$().hasClass("sapMITBSep"), "First IconTabBarFilter does not have class sapMITBSep");
		assert.ok(oIconTabHeader.getItems()[1].$().hasClass("sapMITBSep"), "IconTabSeparator has class sapMITBSep");
		assert.ok(!oIconTabHeader.getItems()[1].$().hasClass("sapMITBFilter"), "IconTabSeparator does not have class sapMITBFilter");
		assert.ok(oIconTabHeader.getItems()[0].$().hasClass("sapMITBSelected"), "First IconTabBarFilter has class sapMITBSelected");

		// Clean up
		oIconTabHeader.destroy();
	});

	QUnit.test("IconTabBar is sap.m.List", function(assert) {

		var oModel = new JSONModel({
			records: [
				{
					text: 'a'
				},
				{
					text: 'b'
				}
			]
		});

		var oListItemTemplate = new IconTabBar({
			items: [
				new IconTabFilter({
					text: '{text}',
					content: new Label({
						text: '{text}'
					})
				}),
				new IconTabFilter({
					text: '{text}',
					content: new Label({
						text: '{text}'
					})
				}),
				new IconTabFilter({
					text: '{text}',
					content: new Label({
						text: '{text}'
					})
				})
			]
		});

		var oList = new List({
			items: {
				path: '/records',
				template: new CustomListItem({
					content: oListItemTemplate
				})
			}
		});
		oList.setModel(oModel);

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(jQuery('.sapMITBHead .sapMITBFilter').length > 0, 'IconTabFilters are rendered');

		oList.destroy();
	});

	QUnit.test("disabled tab", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance",
					enabled: false
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert

		var aTabs = oIconTabBar.$().find('.sapMITBHead .sapMITBFilter');

		assert.ok(!aTabs[0].hasAttribute('aria-disabled'), "First item is not disabled");
		assert.ok(aTabs[1].hasAttribute('aria-disabled'), "Second item is disabled");

		// Clean up
		oIconTabBar.destroy();
	});


	QUnit.module("icon color");

	QUnit.test("Default", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task"
				})
			]
		});

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterDefault"), "color should be default");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");
		assert.strictEqual($itbf.text(), "", "icon color text is not set for type 'Default'");

		// Clean up
		oIconTabBar.destroy();

	});

	QUnit.test("Positive", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task",
					iconColor: IconColor.Positive
				})
			]
		});

		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterPositive"), "color should be positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");
		assert.strictEqual($itbf.text(), oResourceBundle.getText('ICONTABBAR_ICONCOLOR_POSITIVE'), "icon color text is correct");

		// Clean up
		oIconTabBar.destroy();

	});

	QUnit.test("Negative", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task",
					iconColor: IconColor.Negative
				})
			]
		});

		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterNegative"), "color should be negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");
		assert.strictEqual($itbf.text(), oResourceBundle.getText('ICONTABBAR_ICONCOLOR_NEGATIVE'), "icon color text is correct");

		// Clean up
		oIconTabBar.destroy();

	});

	QUnit.test("Neutral", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task",
					iconColor: IconColor.Neutral
				})
			]
		});

		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterNeutral"), "color should be neutral");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");
		assert.strictEqual($itbf.text(), oResourceBundle.getText('ICONTABBAR_ICONCOLOR_NEUTRAL'), "icon color text is correct");

		// Clean up
		oIconTabBar.destroy();

	});

	QUnit.test("Critical", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task",
					iconColor: IconColor.Critical
				})
			]
		});

		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterCritical"), "color should be critical");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");
		assert.strictEqual($itbf.text(), oResourceBundle.getText('ICONTABBAR_ICONCOLOR_CRITICAL'), "icon color text is correct");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("Disabled tab should not show its icon color", function (assert) {
		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					enabled: false,
					iconColor: IconColor.Positive
				}),
				new IconTabFilter({
					enabled: false,
					iconColor: IconColor.Negative
				}),
				new IconTabFilter({
					enabled: false,
					iconColor: IconColor.Neutral
				}),
				new IconTabFilter({
					enabled: false,
					iconColor: IconColor.Critical
				})
			]
		});

		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		oIconTabBar.getItems().forEach(function (oTab) {
			var $Tab = oTab.$(),
				sIconColor = oTab.getIconColor(),
				sIconColorLabel = oResourceBundle.getText("ICONTABBAR_ICONCOLOR_" + sIconColor.toUpperCase());

			// Assert
			assert.strictEqual(oTab.getEnabled(), false, "tab is disabled");
			assert.strictEqual($Tab.hasClass("sapMITBFilter" + sIconColor), false, "iconColor class is not set on the tab");
			assert.strictEqual($Tab.find(".sapMITBFilter" + sIconColor).length, 0, "iconColor class is not set on any element in the tab");
			// debugger
			assert.strictEqual($Tab.text().includes(sIconColorLabel), false, "iconColor text is not conveyed");
		});

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("rerendering");

	QUnit.test("filter text changing", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter({
			icon: "sap-icon://task",
			text: "default text"
		});
		var oIconTabBar = new IconTabBar({
			items: [
				oIconTabFilter
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		// now change the text for IconTabFilter
		oIconTabFilter.setText("new text");
		Core.applyChanges();

		// Assert
		assert.equal(oIconTabFilter.getText(), "new text", "the text is changed");
		assert.equal(document.getElementsByClassName("sapMITHTextContent")[0].textContent, "new text", "the new text is rendered");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("change content", function(assert) {

		// Arrange
		var oButton = new Button("button", {text: "click me"});

		var oIconTabFilter = new IconTabFilter({
			icon: "sap-icon://task",
			content: oButton,
			key: "key1"
		});

		var oIconTabFilter2 = new IconTabFilter({
			icon: "sap-icon://instance",
			key: "key2"
		});

		var oIconTabBar = new IconTabBar({
			items: [
				oIconTabFilter,
				oIconTabFilter2
			],
			content: new Label({text: "info info info"}),
			selectedKey: "key1"
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Change the button text
		oButton.setText("new button");
		Core.applyChanges();

		// Verify that the new text is rendered
		var $itbf = oIconTabBar.$("content");
		assert.equal($itbf.children(0).text(), "new button", "the text is \"new button\"");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("change several things", function(assert) {

		// Arrange
		var oIconTabFilter = new IconTabFilter({
			icon: "sap-icon://task",
			iconColor: IconColor.Neutral
		});

		var oIconTabBar = new IconTabBar({
			items: [
				oIconTabFilter
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		// now change the icon color for one IconTabFilter after it was rendered
		// add IconTabSeparator
		oIconTabFilter.setIconColor(IconColor.Positive);
		oIconTabBar.addItem(new IconTabSeparator());
		this.clock.tick(500);
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabFilter.$().hasClass("sapMITBFilterPositive"), "color is changed to positive");
		assert.ok(oIconTabBar.getItems()[1].$().hasClass("sapMITBSep"), "separator is rendered");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("public methods");

	QUnit.test("expandable set to false", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: false,
			expanded: false,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				})
			],
			selectedKey: "key1",
			content: new Label({text:"label"})
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		// Try to expand the IconTabBar by pressing SPACE key
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(1000);

		// Assert
		// Content shoud remain collapsed because expandable is set to false
		assert.ok(oIconTabBar.$("containerContent").hasClass("sapMITBContentClosed"), "IconTabBar content has class sapMITBContentClosed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("expandable set to true", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: false,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				})
			],
			selectedKey: "key1",
			content: new Label({text:"label"})
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		// Try to expand the IconTabBar by pressing SPACE key
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(1000);

		// Assert
		// Content shoud collapsed because expandable is set to true
		assert.ok(!oIconTabBar.$("containerContent").hasClass("sapMITBContentClosed"), "IconTabBar content has class sapMITBContentClosed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("collapse", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: true,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				})
			],
			selectedKey: "key1",
			content: new Label({text:"label"})
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		// Collapse the IconTabBar by pressing SPACE key
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(1000);

		// Assert
		assert.ok(oIconTabBar.$("containerContent").hasClass("sapMITBContentClosed"), "IconTabBar content has class sapMITBContentClosed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("expand", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: false,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				})
			],
			selectedKey: "key1",
			content: new Label({text:"label"})
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		// Expand the IconTabBar by pressing SPACE key
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(500);

		// Assert
		assert.ok(!oIconTabBar.$("containerContent").hasClass("sapMITBContentClosed"), "IconTabBar content does not have class sapMITBContentClosed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("layout");

	QUnit.test("vertical / horizontal", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://task"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance",
					design: IconTabFilterDesign.Horizontal
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.getItems()[0].$().hasClass("sapMITBVertical"), "default design should be vertical");
		assert.ok(!oIconTabBar.getItems()[0].$().hasClass("sapMITBHorizontal"), "default design should not be horizontal");
		assert.ok(oIconTabBar.getItems()[1].$().hasClass("sapMITBHorizontal"), "design should be horizontal");
		assert.ok(!oIconTabBar.getItems()[1].$().hasClass("sapMITBVertical"), "design should not be vertical");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("showAll Filter", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					showAll: true
				}),
				new IconTabFilter({
					icon: "sap-icon://task"
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.getItems()[0].$().hasClass("sapMITBAll"), "should have class for showAll property");
		assert.ok(!oIconTabBar.getItems()[1].$().hasClass("sapMITBAll"), "should not have class for showAll property");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("Inline Mode", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					text: "Text 1",
					count: "10",
					content: [
						new Label({
							text: "info info info"
						})
					]
				}),
				new IconTabFilter({
					text: "Text 2",
					count: "20",
					content: [
						new Label({
							text: "info info info"
						})
					]
				}),
				new IconTabFilter({
					text: "Text 3",
					count: "30",
					content: [
						new Label({
							text: "info info info"
						})
					]
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().find(".sapMITBHead .sapMITBCount").length == 3, '3 "counts" texts are displayed');
		assert.ok(jQuery(oIconTabBar.$().find(".sapMITBHead .sapMITBText")[0]).text() == "Text 1", "The text is correct");

		oIconTabBar.setHeaderMode(IconTabHeaderMode.Inline);

		Core.applyChanges();

		var bRtl = Core.getConfiguration().getRTL();
		var sText = bRtl ? "(10) Text 1" : "Text 1 (10)";

		assert.ok(oIconTabBar.$().find(".sapMITBHead .sapMITBCount").length == 0, '"counts" texts are not displayed');
		assert.equal(jQuery(oIconTabBar.$().find(".sapMITBHead .sapMITBText")[0]).text(), sText, "The count is attached to the text");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("stretchContentHeight", function (assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			stretchContentHeight: true,
			items: [
				new IconTabFilter({
					icon: "sap-icon://task"
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().hasClass("sapMITBStretch"), "should have class for stretchContentHeight property");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("applyContentPadding", function (assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			applyContentPadding: false,
			items: [
				new IconTabFilter({
					icon: "sap-icon://task"
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().hasClass("sapMITBNoContentPadding"), "should have class for applyContentPadding property");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("backgroundDesign transparent", function (assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			backgroundDesign: BackgroundDesign.Transparent,
			items: [
				new IconTabFilter({
					icon: "sap-icon://task"
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().hasClass("sapMITBBackgroundDesignTransparent"), "should have class for backgroundDesign: transparent");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("no flexbox support", function(assert) {
		var	$FlexChild,
			iFlexChildHeight;

		// Arrange
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				})
			],
			selectedKey: "key1",
			content: new Label({text:"label"})
		});

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		$FlexChild = oIconTabBar.$("containerContent");

		iFlexChildHeight = $FlexChild.height();

		// Act
		Core.applyChanges();

		// Assert
		assert.ok(Math.abs(iFlexChildHeight - $FlexChild.height()) <= 1, "Height is not changed");

		// Cleanup
		oIconTabBar.destroy();
	});

	QUnit.module("preserve dom");

	// test case for: [openui5] sap.m.IconTabBar doesn't support PreserveContent functionality (#26)
	QUnit.test("preserve dom", function(assert) {

		// Arrange
		// prepare dom content
		var oSpan1 = document.createElement("SPAN");
		oSpan1.id = "PreserveContent1";
		oSpan1.innerHTML = "Test1";
		var oHtml1 = new HTML();
		oHtml1.setDOMContent(oSpan1);

		// prepare dom content
		var oSpan2 = document.createElement("SPAN");
		oSpan2.id = "PreserveContent2";
		oSpan2.innerHTML = "Test2";
		var oHtml2 = new HTML();
		oHtml2.setDOMContent(oSpan2);

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://media-play",
					content: [oHtml1]
				}),
				new IconTabFilter({
					icon: "sap-icon://media-reverse",
					content: [oHtml2]
				})
			]
		});

		// System under test - add item to page & render
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(jQuery.sap.byId("PreserveContent1").length, 1, "The span node \"PreserveContent\" is in the DOM");
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[1]);
		Core.applyChanges();
		assert.strictEqual(jQuery.sap.byId("PreserveContent2").length, 1, "The span node \"PreserveContent2\" is in the DOM");
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[0]);
		Core.applyChanges();
		assert.strictEqual(jQuery.sap.byId("PreserveContent1").length, 1, "The span node \"PreserveContent1\" is in the DOM");
		assert.strictEqual(jQuery.sap.byId("PreserveContent2").length, 1, "The span node \"PreserveContent2\" is in the DOM");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("events");

	QUnit.test("select", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: true,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key2"
				})
			],
			selectedKey: "key1"
		});

		var oSelectSpy = sinon.spy(IconTabBar.prototype, "fireSelect");

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Press SPACE key on second IconTabFilter to expand
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[1].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[1].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oSelectSpy.callCount, 1, "select is fired");
		assert.strictEqual(oSelectSpy.lastCall.args[0].key, "key2", "second filter key is passed as select event arg");

		// Clean up
		IconTabBar.prototype.fireSelect.restore();
		oIconTabBar.destroy();
	});

	QUnit.test("expand: shoud not expand(already expanded)", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: true,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key2"
				})
			],
			selectedKey: "key1"
		});

		var oExpandSpy = sinon.spy(IconTabBar.prototype, "fireExpand");

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Press SPACE key on second IconTabFilter to expand
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[1].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[1].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oExpandSpy.callCount, 0, "content is already expanded and expand is not fired");

		// Clean up
		IconTabBar.prototype.fireExpand.restore();
		oIconTabBar.destroy();
	});

	QUnit.test("expand after selecting twice", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: true,
			items: [
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key1"
				}),
				new IconTabFilter({
					icon: "sap-icon://instance",
					key: "key2"
				})
			],
			selectedKey: "key1"
		});

		var oExpandSpy = sinon.spy(IconTabBar.prototype, "fireExpand");

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Press SPACE key on first IconTabFilter to expand
		sap.ui.test.qunit.triggerKeydown(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oIconTabBar.getItems()[0].$(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oExpandSpy.callCount, 1, "select first filter again - expand is fired");
		assert.ok(oExpandSpy.lastCall.args[0].collapse, "collapse = true is passed as expand event arg");
		assert.ok(!oExpandSpy.lastCall.args[0].expand, "expand = false is passed as expand event arg");

		// Clean up
		IconTabBar.prototype.fireExpand.restore();
		oIconTabBar.destroy();
	});

	QUnit.module("keyboard", {
		beforeEach: function() {
			this.oIconTabBar = createIconTabBar();
			this.oIconTabBar.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oIconTabBar.destroy();
		}
	});

	function createIconTabBar() {
	   return new IconTabBar({
		   expandable: true,
		   expanded: true,
		   items: [
			   new IconTabFilter({
				   icon: "sap-icon://instance"
			   }),
			   new IconTabFilter({
				   icon: "sap-icon://instance"
			   })
		   ]
	   });
   }

	QUnit.test("Arrow Right", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.trigger("focus"); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_RIGHT); // trigger Arrow right on first filter
		assert.ok($tab2.is(":focus"), "ARROW_RIGHT is pressed, focus moved on second filter");

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_RIGHT); // trigger Arrow right on second filter
		assert.ok($tab2.is(":focus"), "ARROW_RIGHT is pressed, focus stay on second (last) filter"); // should not loop
	});

	QUnit.test("Arrow Left", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.trigger("focus"); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_LEFT); // trigger Arrow left on second filter
		assert.ok($tab1.is(":focus"), "ARROW_LEFT is pressed, focus moved on first filter");

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_LEFT); // trigger Arrow left on first filter
		assert.ok($tab1.is(":focus"), "ARROW_LEFT is pressed, focus stayed on first filter"); // should not loop
	});

	QUnit.test("Arrow Down", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.trigger("focus"); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_DOWN); // trigger Arrow down on first filter
		assert.ok($tab2.is(":focus"), "ARROW_DOWN is pressed, focus moved on second filter");

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_DOWN); // trigger Arrow down on second filter
		assert.ok($tab2.is(":focus"), "ARROW_DOWN is pressed, focus stay on second filter"); // should not loop
	});

	QUnit.test("Arrow Up", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.trigger("focus"); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_UP); // trigger Arrow up on second filter
		assert.ok($tab1.is(":focus"), "ARROW_UP is pressed, focus moved on first filter");

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_UP); // trigger Arrow up on first filter
		assert.ok($tab1.is(":focus"), "ARROW_UP is pressed, focus stay on first filter"); // should not loop
	});

	QUnit.test("END", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.trigger("focus"); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.END); // trigger End on first filter
		assert.ok($tab2.is(":focus"), "END is pressed, focus moved on last filter");
	});

	QUnit.test("HOME", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.trigger("focus"); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.HOME); // trigger Home on second filter
		assert.ok($tab1.is(":focus"), "HOME is pressed, focus moved on first filter");
	});

	QUnit.test("PAGEDOWN", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.trigger("focus"); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.PAGE_DOWN); // trigger PAGEDOWN on first filter
		assert.ok($tab2.is(":focus"), "PAGEDOWN is pressed, focus moved on last filter");
		});

	QUnit.test("PAGEUP", function(assert) {

	var $tab1 = this.oIconTabBar.getItems()[0].$();
	var $tab2 = this.oIconTabBar.getItems()[1].$();

	$tab2.trigger("focus"); // set focus on second filter

	sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.PAGE_UP); // trigger PAGEUP on second filter
	assert.ok($tab1.is(":focus"), "PAGEUP is pressed, focus moved on first filter");
});

	QUnit.test("SPACE", function(assert) {
		var oSelectSpy = sinon.spy(IconTabBar.prototype, "fireSelect");
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.trigger("focus"); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.SPACE); // trigger Space on second filter
		sap.ui.test.qunit.triggerKeyup($tab2, jQuery.sap.KeyCodes.SPACE); // trigger Space on second filter
		assert.strictEqual(oSelectSpy.callCount, 1, "SPACE is pressed, select event was fired");

		// Clean up
		IconTabBar.prototype.fireSelect.restore();
	});

	QUnit.test("ENTER", function(assert) {
		var oSelectSpy = sinon.spy(IconTabBar.prototype, "fireSelect");
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.trigger("focus"); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ENTER); // trigger Enter on second filter

		assert.strictEqual(oSelectSpy.callCount, 1, "Enter is pressed, select event was fired");

		// Clean up
		IconTabBar.prototype.fireSelect.restore();
	});

	QUnit.module("tab selection");

	QUnit.test("API Selection", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
			expandable: true,
			expanded: true,
			items: [
				new IconTabFilter({
					text: 'Tab 1',
					key: "key1"
				}),
				new IconTabFilter({
					text: 'Tab 2',
					key: "key2"
				}),
				new IconTabFilter({
					text: 'Tab 3',
					key: "key3"
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		var $tab = oIconTabBar.getItems()[0].$();
		assert.ok($tab.hasClass('sapMITBSelected'), "first tab is selected");

		oIconTabBar.setSelectedKey(oIconTabBar.getItems()[0].getKey());
		Core.applyChanges();
		assert.ok($tab.hasClass('sapMITBSelected'), "first tab is selected");

		oIconTabBar.setSelectedKey(oIconTabBar.getItems()[1].getKey());
		Core.applyChanges();
		$tab = oIconTabBar.getItems()[1].$();
		assert.ok($tab.hasClass('sapMITBSelected'), "second tab is selected");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.module("updating data");

	QUnit.test("keep the selected tab", function(assert) {

		// BCP: 1482007468

		// Arrange
		var oIconTabBar = new IconTabBar({
		});

		oIconTabBar.bindAggregation('items', {
			path: '/datasets',
			template: new IconTabFilter({
				icon: "sap-icon://instance",
				text: '{id}'
			})
		});

		var oData = {
			"datasets": [
				{ "id": "A", "values": [{ "id": "A1", value: Math.random() }] },
				{ "id": "B", "values": [{ "id": "B1", value: Math.random() }] }
			]
		};

		var oJSONModel = new JSONModel();
		oJSONModel.setData(oData);

		Core.setModel(oJSONModel);

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Select the second item
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[1]);

		// Update the data
		oData = {
			"datasets": [
				{ "id": "A", "values": [{ "id": "A1", value: Math.random() }] },
				{ "id": "B", "values": [{ "id": "B1", value: Math.random() }] }
			]
		};

		oJSONModel.setData(oData, true);

		// wait 500ms
		this.clock.tick(500);

		var $selectedItem  = oIconTabBar.$().find('.sapMITBSelected');

		// Assert
		assert.ok($selectedItem.find('.sapMITBText').text() == 'B', "the second item is selected");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("keep the last selected tab", function(assert) {

		// Arrange
		var oIconTabBar = new IconTabBar({
		});

		oIconTabBar.bindAggregation('items', {
			path: '/datasets',
			template: new IconTabFilter({
				key: "{firstName}",
				text: "{lastName}"
			})
		});

		var oData = {
			"datasets": [
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Maria", lastName: "Jones"}
			]
		};

		var oJSONModel = new JSONModel();
		oJSONModel.setData(oData);

		Core.setModel(oJSONModel);

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// Select the last item
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[4]);

		// Update the data
		oData = {
			"datasets": [
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Maria", lastName: "Jones"}
			]
		};

		oJSONModel.setData(oData);

		// wait 500ms
		this.clock.tick(500);

		var $selectedItem  = oIconTabBar.$().find('.sapMITBSelected');

		// Assert
		assert.ok($selectedItem.find('.sapMITBText').text() == 'Jones', "the last item is selected");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("Selected tabs count shouldn't exceed 1", function (assert) {
		// Arrange
		var oIconTabBar = new IconTabBar({
			items: {
				path: "/items",
				template: new IconTabFilter({
					key: "{key}",
					text: "{title}",
					content: [
						new Text({text: "{text}"})
					]
				}),
				templateShareable: false
			}
		});

		var oModel = new JSONModel({
			items: [{
				key: "T1",
				title: "Test 1",
				text: "text1"
			}, {
				key: "T2",
				title: "Test 2",
				text: "text2"
			}]
		});

		oIconTabBar.setModel(oModel);
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		var oSelectedItem = oIconTabBar._getIconTabHeader().oSelectedItem;
		var oContext = oSelectedItem.getBindingContext();
		var oItemCopy = Object.assign({}, oContext.getObject());
		oItemCopy.text = "text1 - updated";

		// Act
		oModel.setProperty(oContext.getPath(), oItemCopy); // update the first tab content through binding
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[1]); // select the second tab
		this.clock.tick(500);

		// Assert
		var $selectedItem  = oIconTabBar.$().find('.sapMITBSelected');
		assert.strictEqual($selectedItem.length, 1, "There should NOT be more than one tab selected.");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("keep the current content when change IconTabFilter count property", function(assert) {

		// create
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					text: "Test 1",
					count: "1",
					content: [
						new Label({
							text: "Content"
						})
					]
				}),
				new IconTabFilter({
					text: "Test 2",
					count: "2",
					content: [
						new Label({
							text: "Content"
						})
					]
				}),
				new IconTabFilter({
					text: "Test 3",
					count: "3",
					content: [
						new Label({
							text: "Content"
						})
					]
				})
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		var oContent = oIconTabBar._getIconTabHeader().oSelectedItem.getContent()[0];
		var domContent = oContent.$()[0];

		// change the IconTabFilter count property
		var aItems = oIconTabBar.getItems();
		aItems[0].setCount('New');

		// wait 500ms
		this.clock.tick(500);

		oContent = oIconTabBar._getIconTabHeader().oSelectedItem.getContent()[0];
		var domContentNew = oContent.$()[0];

		// Assert
		assert.ok(domContent == domContentNew, "the contents are the same");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("update ObjectHeader with IconTabBar ", function(assert) {

		// create
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					text: "Test 1",
					count: "1",
					content: [
						new Label({
							text: "Content"
						})
					]
				}),
				new IconTabFilter({
					text: "Test 2",
					count: "2",
					content: [
						new Label({
							text: "Content"
						})
					]
				}),
				new IconTabFilter({
					text: "Test 3",
					count: "3",
					content: [
						new Label({
							text: "Content"
						})
					]
				})
			]
		});

		var oObjectHeader = new ObjectHeader({
			responsive : true,
			title: 'Some Title',
			headerContainer: oIconTabBar
		});

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		Core.applyChanges();

		// change the IconTabFilter text property
		var sNewText = 'New Text';
		var aItems = oIconTabBar.getItems();
		aItems[0].setText(sNewText);

		// wait 500ms
		this.clock.tick(500);

		var $tab = oIconTabBar._getIconTabHeader().$().find('.sapMITBHead .sapMITBText').first();

		// Assert
		assert.ok($tab.text() == sNewText, "the text is changed");

		// Clean up
		oIconTabBar.destroy();
		oObjectHeader.destroy();
	});

	QUnit.test("change the current content when change IconTabFilter content aggregation", function(assert) {

		// create
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					text: "Lorem",
					count: "3",
					content: [
						new Button({ text: "Text 1" })
					]
				}),
				new IconTabFilter({
					text: "Ipsum",
					count: "1",
					content: [
						new Button({ text: "Text 2" })
					]
				}),
				new IconTabFilter({
					text: "Lorem",
					count: "Count",
					content: [
						new Button({ text: "Text 3" })
					]
				})
			],
			content: [
				new Button({ text: "Main Text" })
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		var oButton = oIconTabBar.$().find('.sapMITBContent .sapMBtn')[0];

		// Assert
		assert.ok(jQuery(oButton).text().indexOf("Text 1") > -1, "the tab content is displayed");

		// remove the IconTabFilter contents
		var aItems = oIconTabBar.getItems();
		aItems[0].removeAllContent();

		// wait 500ms
		this.clock.tick(500);

		oButton = oIconTabBar.$().find('.sapMITBContent .sapMBtn')[0];

		// Assert
		assert.ok(jQuery(oButton).text().indexOf("Main Text") > -1, "the default content is displayed");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("IconTabHeader propagates properties to its child items", function(assert) {
		// Arrange
		var aTabs = [];
		for (var i = 0; i < 100; i++) {
			aTabs.push(new IconTabFilter({
				icon: "sap-icon://collaborate"
			}));
		}

		aTabs.push(new IconTabFilter({
			icon: "sap-icon://manager",
			enabled: "{/tabEnabled}"
		}));

		var oITH = new IconTabHeader({ items: aTabs }),
			bTabEnabled = false;

		oITH.setModel(new JSONModel({ tabEnabled: bTabEnabled }));

		oITH.placeAt("qunit-fixture");
		Core.applyChanges();

		// act
		oITH._getOverflow()._expandButtonPress();

		// Assert
		var oSelectList = oITH._getSelectList().getItems();
		assert.strictEqual(oSelectList.pop().getEnabled(), bTabEnabled, "property has propagated");

		// act (reopen)
		oITH._getOverflow()._expandButtonPress();
		Core.applyChanges();

		// Assert
		oSelectList = oITH._getSelectList().getItems();
		assert.strictEqual(oSelectList.pop().getEnabled(), bTabEnabled, "property has propagated");

		// Clean up
		oITH.destroy();
	});

	QUnit.module("Tabs", {
		beforeEach: function () {
			this.oIconTabBar = new IconTabBar({
				items: [
					new IconTabFilter({
						text: "Lorem",
						count: "3",
						content: [
							new Button({ text: "Text 1" })
						]
					}),
					new IconTabFilter({
						text: "Ipsum",
						count: "1",
						content: [
							new Button({ text: "Text 2" })
						]
					}),
					new IconTabFilter({
						text: "Lorem",
						count: "Count",
						content: [
							new Button({ text: "Text 3" })
						]
					})
				]
			});

			this.oIconTabBar.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oIconTabBar.destroy();
		}
	});

	QUnit.test("Remove selected tab", function(assert) {
		var oButton = this.oIconTabBar.$().find('.sapMITBContent .sapMBtn')[0];

		// Assert
		assert.ok(jQuery(oButton).text().indexOf("Text 1") > -1, "First button is displayed");

		// remove first tab
		var aItems = this.oIconTabBar.getItems();
		this.oIconTabBar.removeItem(aItems[0]);

		oButton = this.oIconTabBar.$().find('.sapMITBContent .sapMBtn')[0];

		// Assert
		assert.ok(jQuery(oButton).text().indexOf("Text 2") > -1, "Second button is displayed");
	});

	QUnit.test("Enabled state of the tab should be propagated to its content", function(assert) {
		// Arrange
		var oItem = this.oIconTabBar.getItems()[0],
			oButton = oItem.getContent()[0];

		// Assert
		assert.notOk(oButton.$().hasClass("sapMBtnDisabled"), "Content is initially enabled");

		// Act & Assert
		oItem.setEnabled(false);
		Core.applyChanges();
		assert.ok(oButton.$().hasClass("sapMBtnDisabled"), "Content is disabled when the tab is disabled");

		// Act & Assert
		oItem.setEnabled(true);
		Core.applyChanges();
		assert.notOk(oButton.$().hasClass("sapMBtnDisabled"), "Content is enabled when the tab is enabled again");
	});

	function getIconTabBar() {
		var aTabItems = [];
		for (var i = 0; i < 30; i++) {
			aTabItems.push(new IconTabFilter({
				key: i.toString(),
				id: 'idTab' + i,
				text : 'Tab ' + i,
				content: new Text({
					text: 'Content ' + i
				})
			}));
		}

		var oIconTabBar = new IconTabBar({
			items: aTabItems
		});

		return oIconTabBar;
	}

	QUnit.module("Overflow Select List",{
		beforeEach: function () {
			this.oIconTabBar = getIconTabBar();
			this.oIconTabBar.$().width("500px");
			this.oIconTabBar.placeAt('qunit-fixture');

			Core.applyChanges();
		},
		afterEach: function () {
			this.oIconTabBar.destroy();
			this.oIconTabBar = null;
		}
	});

	QUnit.test("Rendering", function (assert) {
		assert.strictEqual(this.oIconTabBar.$().find('.sapMITHOverflow .sapMITHShowSubItemsIcon').length, 1, "Overflow button is rendered");

		this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

		assert.strictEqual(jQuery('.sapMITBSelectList').length, 1, "Select list is open");
	});

	QUnit.test("Selected Item should not be in the overflow list", function (assert) {
		// Arrange
		this.oIconTabBar.setSelectedKey('3');

		Core.applyChanges();

		// Assert
		assert.strictEqual(document.querySelector(".sapMITBSelectList .sapMITBSelectItemSelected"), null, "Selected item should not be in the overflow list");
	});

	QUnit.test("Selection must result in the tab filter to show up in the strip", function (assert) {
		// Arrange
		this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

		var selectItems = document.querySelectorAll(".sapMITBSelectList .sapMITBSelectItem");

		// Act
		var itemToSelect = selectItems[10];
		var selectedControl = Core.byId(itemToSelect.id);
		jQuery(itemToSelect).trigger('tap');

		Core.applyChanges();

		var tabInStrip = this.oIconTabBar._getIconTabHeader().getDomRef("head").querySelector("#" + selectedControl._getRealTab().getId());

		// Assert
		assert.ok(tabInStrip, "Selected item's corresponding tab should appear on the tab strip");
	});

	QUnit.test("Filters cloning", function (assert) {
		// Arrange
		var oIconTabHeader = this.oIconTabBar.getAggregation("_header"),
			aItems = oIconTabHeader.getItems(),
			aItemsInStrip = oIconTabHeader._getItemsInStrip(),
			aClonedItems;

		// Act
		this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();
		aClonedItems = oIconTabHeader._getSelectList().getItems();

		var iOverflowListItems = aItems.length - aItemsInStrip.length; // delta

		// Assert
		assert.strictEqual(aClonedItems.length, iOverflowListItems, "Items of the select list should represent the delta between the total items and the items already in the tab strip");
		assert.strictEqual(aItems.pop().getContent().length, 1, "Original filter should have 1 item");
		assert.strictEqual(aClonedItems.pop().getContent().length, 0, "Cloned filter should NOT have items");
	});

	QUnit.test("Selection after re-opening the Select List", function (assert) {
		// Arrange
		var oIconTabHeader = this.oIconTabBar.getAggregation("_header"),
			oOverflowButton = oIconTabHeader._getOverflow(),
			oSelectList = oIconTabHeader._getSelectList();

		// Act
		oOverflowButton._expandButtonPress();
		this.clock.tick(500);

		// Assert - check initial focus
		assert.strictEqual(oSelectList._oItemNavigation.getFocusedIndex(), 0, "The first item in the Select List should be focused.");

		// Act - focus the 5th item in the Select List, then close and open it again
		oSelectList._oItemNavigation.setSelectedIndex(5);
		oSelectList.getItems()[0]._getRealTab().setVisible(false);
		oOverflowButton._closePopover();
		oOverflowButton._expandButtonPress();
		this.clock.tick(500);

		// Assert - check initial focus again
		assert.strictEqual(oOverflowButton._oPopover.getInitialFocus(), oSelectList.getVisibleItems()[0].getId(), "The first visible item in the Select List should be focused.");
	});

	QUnit.module("ARIA",{
		beforeEach: function () {
			this.oIconTabBar = getIconTabBar();
			this.oIconTabBar.getItems()[1].setVisible(false);
			this.oIconTabBar.insertItem(new IconTabSeparator(), 1);
			this.oIconTabBar.$().width("500px");
			this.oIconTabBar.placeAt('qunit-fixture');

			Core.applyChanges();
		},
		afterEach: function () {
			this.oIconTabBar.destroy();
			this.oIconTabBar = null;
		}
	});

	QUnit.test("Posinset, Setsize, Level", function (assert) {
		var $tabFilters = this.oIconTabBar.$().find('.sapMITBHead .sapMITBFilter');

		assert.strictEqual($tabFilters[1].getAttribute('aria-posinset'), "2", "posinset is set correctly");
		assert.strictEqual($tabFilters[1].getAttribute('aria-setsize'), "29", "setsize is set correctly");
		assert.strictEqual($tabFilters[1].getAttribute('aria-level'), null, "level is not set while tab is in tab strip");

		this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

		var $selectList = jQuery('.sapMITBSelectList');
		var $selectItems = $selectList.find('.sapMITBSelectItem');

		var iDelta = this.oIconTabBar._getIconTabHeader()._getItemsInStrip().length;

		assert.strictEqual($selectItems[1].getAttribute('aria-posinset'), iDelta + 1 + "", "posinset is set correctly");
		assert.strictEqual($selectItems[1].getAttribute('aria-setsize'), "29", "setsize is set correctly");
		assert.strictEqual($selectItems[1].getAttribute('aria-level'), "1", "level is set correctly");
	});

	QUnit.test("ariaTexts", function (assert) {
		var oITH = this.oIconTabBar._getIconTabHeader();

		assert.notOk(oITH.$().attr("aria-label"), "'aria-label' attribute should NOT be set.");
		assert.notOk(oITH.$("head").attr("aria-describedby"), "'aria-describedby' attribute should NOT be set.");

		this.oIconTabBar.setAriaTexts({
			headerLabel: "Available spaces",
			headerDescription: "Select tab to show a space"
		});
		Core.applyChanges();

		assert.strictEqual(oITH.$().attr("aria-label"), "Available spaces", "'aria-label' attribute should be set");
		assert.strictEqual(oITH.$("head").attr("aria-describedby"), oITH._getInvisibleHeadText().getId(), "'aria-describedby' attribute should be set.");
	});

	QUnit.module("Padding");

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new IconTabBar(),
			sContentSelector = ".sapMITBContainerContent > .sapMITBContent",
			sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
			aResponsiveSize = sResponsiveSize.split(" "),
			$containerContent;

		// Act
		oContainer.placeAt("content");
		Core.applyChanges();
		oContainer.addStyleClass("sapUiNoContentPadding");
		$containerContent = oContainer.$().find(sContentSelector);

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.module("IconTabHeader Selected Key",{
		beforeEach: function () {

			var aTabItems = [];
			for (var i = 0; i < 30; i++) {
				aTabItems.push(new IconTabFilter({
					key: i.toString(),
					text : 'Tab ' + i,
					content: new Text({
						text: 'Content ' + i
					})
				}));
			}

			var oIconTabHeader = new IconTabHeader({
				items: aTabItems,
				selectedKey : 'invalidKey'
			});

			this.oIconTabHeader = oIconTabHeader;
			this.oIconTabHeader.placeAt('qunit-fixture');

			Core.applyChanges();
		},
		afterEach: function () {
			this.oIconTabHeader.destroy();
			this.oIconTabHeader = null;
		}
	});

	QUnit.test("Selection", function (assert) {
		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBSelected').length, 0, "No tab is selected");

		this.oIconTabHeader.setSelectedKey('');
		Core.applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabHeader.setSelectedKey('InvalidKey');
		Core.applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBSelected').length, 0, "No tab is selected");
	});

	QUnit.module("IconTabBar Selected Key");

	QUnit.test("Selection", function (assert) {
		// arrange
		var aTabItems = [];
		for (var i = 0; i < 30; i++) {
			aTabItems.push(new IconTabFilter({
				key: i.toString(),
				text : 'Tab ' + i,
				enabled: i % 10 != 0,
				content: new Text({
					text: 'Content ' + i
				})
			}));
		}

		var oIconTabBar = new IconTabBar({
			items: aTabItems,
			expandable: false,
			selectedKey : 'invalidKey'
		});

		this.oIconTabBar = oIconTabBar;
		this.oIconTabBar.placeAt('qunit-fixture');
		Core.applyChanges();

		// assert
		assert.strictEqual(this.oIconTabBar.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabBar.setSelectedKey('');
		Core.applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabBar.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabBar.setSelectedKey('InvalidKey');
		Core.applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabBar.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabBar.setSelectedKey('9');
		Core.applyChanges();

		assert.strictEqual(this.oIconTabBar._getIconTabHeader().oSelectedItem.getText(), 'Tab 9' , "Enabled tab is correctly selected");

		this.oIconTabBar.setSelectedKey('10');
		Core.applyChanges();

		assert.strictEqual(this.oIconTabBar._getIconTabHeader().oSelectedItem.getText(), 'Tab 9' , "Disabled tab is not selected");

		// clean up
		this.oIconTabBar.destroy();
		this.oIconTabBar = null;
	});

	QUnit.test("Initially set selectedKey to nested item", function (assert) {
		// arrange
		var oNestedItem = new IconTabFilter({ key: "nested" }),
			oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter(),
				new IconTabFilter({
					items: [
						new IconTabFilter(),
						oNestedItem
					]
				})
			],
			selectedKey : "nested"
		});

		oIconTabBar.placeAt("qunit-fixture");
		Core.applyChanges();

		// assert
		assert.strictEqual(oIconTabBar._getIconTabHeader().oSelectedItem, oNestedItem, "Nested item should be found and set as selected");

		// clean up
		oIconTabBar.destroy();
	});

	QUnit.module("IconTabHeader Tabs",{
		beforeEach: function () {
			this.oIconTabHeader = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: 'Filter 1'
					}),
					new IconTabFilter({
						text: 'Filter 2'
					})
				]
			});
			this.oIconTabHeader.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oIconTabHeader.destroy();
			this.oIconTabHeader = null;
		}
	});

	QUnit.test("Remove Tab", function (assert) {
		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBHead .sapMITBFilter').length, 2, "2 tabs are displayed");

		this.oIconTabHeader.getItems()[0].setVisible(false);
		Core.applyChanges();

		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBHead .sapMITBFilter').length, 1, "1 tab are displayed");
	});

	QUnit.module("IconTabHeader Tab density mode");
	QUnit.test("Classes should respond to the mode", function(assert) {
		// Arrange
		var oIconTabHeader = new IconTabHeader({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					text : 'Open',
					count: '5545'
				}),
				new IconTabSeparator({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				})
			]
		});

		// System under Test
		oIconTabHeader.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(!oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header is in Cozy mode by default");

		oIconTabHeader.setTabDensityMode(IconTabDensityMode.Compact);
		Core.applyChanges();
		assert.ok(oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header is in Compact mode");

		oIconTabHeader.setTabDensityMode(IconTabDensityMode.Inherit);
		Core.applyChanges();
		assert.ok(!oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has to take the global mode which is Cozy");

		jQuery('body').addClass("sapUiSizeCompact");
		Core.notifyContentDensityChanged();
		Core.applyChanges();
		assert.ok(oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has to take the Compact mode from global scope");

		jQuery('body').removeClass("sapUiSizeCompact");
		Core.applyChanges();
		jQuery('body').addClass("sapUiSizeCozy");
		Core.notifyContentDensityChanged();
		Core.applyChanges();
		assert.ok(!oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has to take the Cozy mode from global scope");

		oIconTabHeader.setTabDensityMode(IconTabDensityMode.Compact);
		Core.applyChanges();
		assert.ok(oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has forced Compact density mode independent of global scope");

		// Clean up
		oIconTabHeader.destroy();
	});

	QUnit.module("Drag&Drop", {
		beforeEach: function() {
			this.oIconTabBar = new IconTabBar({
				enableTabReordering: true,
				items: [
					new IconTabFilter({
						id: 'tabReorder1',
						text: "First tab",
						count: "3",
						content: [
							new Button({ text: "Text 1" })
						]
					}),
					new IconTabFilter({
						id: 'tabReorder2',
						text: "Second tab",
						count: "1",
						content: [
							new Button({ text: "Text 2" })
						]
					}),
					new IconTabFilter({
						id: 'tabReorder3',
						text: "Third tab",
						count: "Count",
						content: [
							new Button({ text: "Text 3" })
						]
					})
				]
			});
			this.oIconTabBar1 = new IconTabBar({
				items: [
					new IconTabFilter({
						id: 'tab1',
						text: "First tab",
						count: "3",
						content: [
							new Button({ text: "Text 1" })
						]
					}),
					new IconTabFilter({
						id: 'tab2',
						text: "Second tab",
						count: "1",
						content: [
							new Button({ text: "Text 2" })
						]
					})
				]
			});
			this.oIconTabBar.placeAt('qunit-fixture');
			this.oIconTabBar1.placeAt('qunit-fixture');
			Core.applyChanges();

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  Core.byId("tabReorder1");
						case "droppedControl" :
							return Core.byId("tabReorder3");
					}
				 }
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  Core.byId("tabReorder1");
						case "droppedControl" :
							return Core.byId("tabReorder3");
					}
				}
			};

			this.returnMockEvent = function(iKeyCode, sId) {
				var oMockEventTest = {
					keyCode: iKeyCode,
					srcControl: Core.byId(sId)
				};

				return oMockEventTest;
			};
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oIconTabHeader1 = this.oIconTabBar1.getAggregation("_header");
		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.oIconTabBar1.destroy();
			this.oIconTabHeader1.destroy();
			this.oMockEvent = null;
			this.oMockEvent2 = null;
			this.returnMockEvent = null;

		}
	});
	QUnit.test("Drag&Drop initializing" , function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabHeader.getEnableTabReordering(), true, 'IconTabBar is enabled for reordering"');
		assert.strictEqual(this.oIconTabHeader.getAggregation("dragDropConfig").length, 2, 'Drag&Drop aggregation configuration should be added');
		assert.strictEqual(this.oIconTabHeader1.getEnableTabReordering(), false, 'IconTabBar is not enabled for reordering"');
		assert.strictEqual(this.oIconTabHeader1.getAggregation("dragDropConfig").length, 0, 'Drag&Drop aggregation configuration should be empty');
	});

	QUnit.test("Drag&Drop dropPosition: 'After'", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", "'Firs tab' is at last position");
	});

	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", "'Firs tab' is at the middle");
	});

	QUnit.test("Drag&Drop accessibility:", function(assert) {
		// Assert
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		this.oIconTabHeader1.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right of last element", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Third tab", 'Third Tab is "Third Tab"');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Third tab", 'Third Tab is "Third Tab"');
		assert.strictEqual(Core.byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left of first element", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT

		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_LEFT, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Second tab", 'Second Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_LEFT, "tabReorder2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Home", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Second tab", 'Second Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.HOME, "tabReorder2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: CTRL + End", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.END, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", 'First Tab is "Last Tab"');
		assert.strictEqual(Core.byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
	});

	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapincreasemodifiers", function(assert) {
		// Assert
		var oEventSpyIncrease = this.spy(this.oIconTabHeader, "onsapincreasemodifiers");
		assert.ok(oEventSpyIncrease.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapincreasemodifiers(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyIncrease.callCount === 1, "The method is skipped and the event went to the global KH");
	});

	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapdecreasemodifiers", function(assert) {
		// Assert
		var oEventSpyDecrease = this.spy(this.oIconTabHeader, "onsapdecreasemodifiers");
		assert.ok(oEventSpyDecrease.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapdecreasemodifiers(this.returnMockEvent(KeyCodes.ARROW_LEFT, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyDecrease.callCount === 1, "The method is skipped and the event went to the global KH");
	});

	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsaphomemodifiers", function(assert) {
		// Assert
		var oEventSpyHome  = this.spy(this.oIconTabHeader, "onsaphomemodifiers");
		assert.ok(oEventSpyHome.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsaphomemodifiers(this.returnMockEvent(KeyCodes.HOME, "tabReorder2"));
		// Assert
		assert.ok(oEventSpyHome.callCount === 1, "The method is skipped and the event went to the global KH");
	});

	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapendmodifiers", function(assert) {
		// Assert
		var oEventSpyEnd  = this.spy(this.oIconTabHeader, "onsapendmodifiers");
		assert.ok(oEventSpyEnd.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapendmodifiers(this.returnMockEvent(KeyCodes.END, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyEnd.callCount === 1, "The method is skipped and the event went to the global KH");
	});

	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapincreasemodifiers", function(assert) {
		// Assert
		var oEventSpyIncrease = this.spy(this.oIconTabHeader, "onsapincreasemodifiers");
		assert.ok(oEventSpyIncrease.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapincreasemodifiers(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyIncrease.callCount === 1, "The method is skipped and the event went to the global KH");
	});

	QUnit.test("Drag&Drop Keyboard Handling: Drag through hidden tabs", function(assert) {
		// arrange
		this.oIconTabBar.$().width("150px");
		this.oIconTabHeader.invalidate();
		Core.applyChanges();
		// assert
		assert.strictEqual(this.oIconTabHeader._getItemsInStrip().length, 1, "There should be 1 visible item and 2 in the 'More' menu");
		// act
		this.oIconTabHeader.onsapincreasemodifiers(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		// assert
		assert.strictEqual(this.oIconTabHeader.indexOfItem(Core.byId("tabReorder1")), 0, "The item should remain on the same position.");
	});

	QUnit.test("Drag&Drop Keyboard Handling: Drag through invisible tab", function(assert) {
		// arrange
		this.oIconTabHeader.getItems()[1].setVisible(false);
		Core.applyChanges();
		// act
		this.oIconTabHeader.onsapincreasemodifiers(this.returnMockEvent(KeyCodes.ARROW_RIGHT, "tabReorder1"));
		// assert
		assert.strictEqual(this.oIconTabHeader.indexOfItem(Core.byId("tabReorder1")), 2, "Tab index should have changed from 0 to 2.");
	});

	QUnit.module("Drag&Drop: Overflow rearranging", {
		beforeEach: function() {
			this.oIconTabBar = getIconTabBar();
			this.oIconTabBar.placeAt('qunit-fixture');
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oSelectList = this.oIconTabHeader._getSelectList();
			this.oIconTabHeader.setEnableTabReordering(true);
			Core.applyChanges();

			this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

			var selectListItems = this.oSelectList.getAggregation("items");

			function getSelectListId (iElement) {
				return selectListItems[iElement].sId;
			}

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  Core.byId(getSelectListId(0));
						case "droppedControl" :
							return Core.byId(getSelectListId(2));
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  Core.byId(getSelectListId(0));
						case "droppedControl" :
							return Core.byId(getSelectListId(2));
					}
				}
			};

			this.returnMockEvent = function(iKeyCode, sId) {
				var oMockEventTest = {
					keyCode: iKeyCode,
					srcControl: Core.byId(sId)
				};

				return oMockEventTest;
			};

		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.returnMockEvent = null;
			this.oMockEvent = null;
			this.oMockEvent2 = null;
			this.oSelectList = null;
		}
	});

	QUnit.test("Drag&Drop dropPosition: 'After'", function(assert) {
		// length of items in tab strip used to offset the index of items aggregation with
		var iDelta = this.oIconTabHeader._getItemsInStrip().length;

		var aTabs = this.oIconTabBar.getItems(),
			oTab0 = aTabs[iDelta + 0], // 12
			oTab1 = aTabs[iDelta + 1], // 13
			oTab2 = aTabs[iDelta + 2]; // 14

		var aSelectListItems = this.oSelectList.getItems(),
			oListItem0 = aSelectListItems[0],
			oListItem1 = aSelectListItems[1],
			oListItem2 = aSelectListItems[2];

		// Assert
		assert.strictEqual(oListItem0.getText(), oTab0.getText(), "First Tab in Overflow is - " + oTab0.getText());
		assert.strictEqual(oListItem1.getText(), oTab1.getText(), "Second Tab in Overflow is - " + oTab1.getText());
		assert.strictEqual(oListItem2.getText(), oTab2.getText(), "Third Tab in Overflow is - " + oTab2.getText());

		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent);
		this.clock.tick(500);
		Core.applyChanges();

		iDelta = this.oIconTabHeader._getItemsInStrip().length;
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 0].getText(), oTab1.getText(), "Tab at index " + (iDelta + 0) + " in items aggregation is now - " + oTab1.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 1].getText(), oTab2.getText(), "Tab at index " + (iDelta + 1) + " in items aggregation is now - " + oTab2.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 2].getText(), oTab0.getText(), "Tab at index " + (iDelta + 2) + " in items aggregation is now - " + oTab0.getText());

		aSelectListItems = this.oSelectList.getItems();
		oListItem0 = aSelectListItems[0];
		oListItem1 = aSelectListItems[1];
		oListItem2 = aSelectListItems[2];

		// Assert
		assert.strictEqual(oListItem0.getText(), oTab1.getText(), "First Tab in Overflow is now - " + oTab1.getText());
		assert.strictEqual(oListItem1.getText(), oTab2.getText(), "Second Tab in Overflow is now - " + oTab2.getText());
		assert.strictEqual(oListItem2.getText(), oTab0.getText(), "Third Tab in Overflow is now - " + oTab0.getText());
	});

	QUnit.test("Drag&Drop with Arrow Up outside of the SelectList", function(assert) {
		// Arrange
		var oFirstTabInSelectList = this.oSelectList.getItems()[0];
		var iIndexBeforeMove = this.oIconTabHeader.indexOfItem(oFirstTabInSelectList._getRealTab());

		// Act
		this.oSelectList.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_UP, oFirstTabInSelectList.getId()));

		// Assert
		assert.strictEqual(this.oIconTabHeader.indexOfItem(oFirstTabInSelectList._getRealTab()), iIndexBeforeMove, "First item in the select list should NOT be able to move up.");
	});

	QUnit.test("Drag&Drop: Select item from overflow, then move it with Arrow Left", function(assert) {
		// Arrange
		var oSixthTabInSelectList = this.oSelectList.getItems()[5],
			sIndexBeforeMove = this.oIconTabHeader.indexOfItem(oSixthTabInSelectList._getRealTab()),
			iPositionAfterJump = sIndexBeforeMove - 6; // should jump over the 5 hidden items before it

		// Act - select and move the item left
		this.oSelectList.ontap({
			srcControl: oSixthTabInSelectList,
			preventDefault: jQuery.noop
		});
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_LEFT, oSixthTabInSelectList._getRealTab().getId()));

		// Assert
		assert.strictEqual(this.oIconTabHeader.indexOfItem(oSixthTabInSelectList._getRealTab()), iPositionAfterJump - 1, "Item should have moved enough to be able to drag it by pressing arrow left once.");
	});

	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		// Arrange

		// length of items in tab strip used to offset the index of items aggregation with
		var iDelta = this.oIconTabHeader._getItemsInStrip().length;

		var aTabs = this.oIconTabBar.getItems(),
			oTab0 = aTabs[iDelta + 0],
			oTab1 = aTabs[iDelta + 1],
			oTab2 = aTabs[iDelta + 2];

		var aSelectListItems = this.oSelectList.getItems(),
			oListItem0 = aSelectListItems[0],
			oListItem1 = aSelectListItems[1],
			oListItem2 = aSelectListItems[2];

		// Assert
		assert.strictEqual(oListItem0.getText(), oTab0.getText(), "First Tab in Overflow is - " + oTab0.getText());
		assert.strictEqual(oListItem1.getText(), oTab1.getText(), "Second Tab in Overflow is - " + oTab1.getText());
		assert.strictEqual(oListItem2.getText(), oTab2.getText(), "Third Tab in Overflow is - " + oTab2.getText());

		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent2);
		this.clock.tick(500);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 0].getText(), oTab1.getText(), "Tab at index " + (iDelta + 0) + " in items aggregation is now - " + oTab1.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 1].getText(), oTab0.getText(), "Tab at index " + (iDelta + 1) + " in items aggregation is now - " + oTab0.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 2].getText(), oTab2.getText(), "Tab at index " + (iDelta + 2) + " in items aggregation is now - " + oTab2.getText());

		aSelectListItems = this.oSelectList.getItems();
		oListItem0 = aSelectListItems[0];
		oListItem1 = aSelectListItems[1];
		oListItem2 = aSelectListItems[2];

		assert.strictEqual(oListItem0.getText(), oTab1.getText(), "First Tab in Overflow is now - " + oTab1.getText());
		assert.strictEqual(oListItem1.getText(), oTab0.getText(), "Second Tab in Overflow is now - " + oTab0.getText());
		assert.strictEqual(oListItem2.getText(), oTab2.getText(), "Third Tab in Overflow is now - " + oTab2.getText());

	});

	QUnit.module("Drag&Drop: From Overflow list to Tab Strip", {
		beforeEach: function() {
			this.oIconTabBar = getIconTabBar();
			this.oIconTabBar.placeAt('qunit-fixture');
			Core.applyChanges();

			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oSelectList = this.oIconTabHeader._getSelectList();

			this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

			var selectListItems = this.oSelectList.getAggregation("items");

			function getSelectListId (iElement) {
				return selectListItems[iElement].sId;
			}

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition":
							return "After";
						case "draggedControl":
							return Core.byId(getSelectListId(0));
						case "droppedControl":
							return Core.byId("idTab3");
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition":
							return "Before";
						case "draggedControl":
							return Core.byId(getSelectListId(0));
						case "droppedControl":
							return Core.byId("idTab3");
					}
				}
			};
		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.oMockEvent = null;
			this.oMockEvent2 = null;
			this.oSelectList = null;
		}
	});


	QUnit.test("Overflow button", function(assert) {
		var oOverflow = this.oIconTabHeader._getOverflow();
		var aItems = this.oIconTabHeader.getItems();
		var oOverflowDomRef = oOverflow.getDomRef();
		assert.ok(!oOverflowDomRef.classList.contains("sapMITHDragOver"), "Overflow button has default state");

		oOverflow._handleOnDragOver({
			preventDefault: function () {},
			dragSession: {
				getDragControl: function () {
					return aItems[1];
				}
			}
		});

		assert.ok(oOverflowDomRef.classList.contains("sapMITHDragOver"), "Overflow button is in 'drag over' state ");

		oOverflow._handleOnDragLeave();

		assert.ok(!oOverflowDomRef.classList.contains("sapMITHDragOver"), "Overflow button has default state");
	});

	QUnit.test("Overflow button - selected tab", function(assert) {
		var oOverflow = this.oIconTabHeader._getOverflow();
		var aItems = this.oIconTabHeader.getItems();
		var oOverflowDomRef = oOverflow.getDomRef();
		assert.ok(!oOverflowDomRef.classList.contains("sapMITHDragOver"), "Overflow button has default state");

		oOverflow._handleOnDragOver({
			preventDefault: function () {},
			dragSession: {
				getDragControl: function () {
					return aItems[0];
				}
			}
		});

		assert.notOk(oOverflowDomRef.classList.contains("sapMITHDragOver"), "Overflow button is not in 'drag over' state ");

		oOverflow._handleOnDragLeave();

		assert.ok(!oOverflowDomRef.classList.contains("sapMITHDragOver"), "Overflow button has default state");
	});

	QUnit.test("Drag&Drop dropPosition: 'After'", function(assert) {
		// length of items in tab strip used to offset the index of items aggregation with
		var aTabsInStrip = this.oIconTabHeader._getItemsInStrip(),
			iDelta = aTabsInStrip.length;

		var aItems = this.oIconTabHeader.getItems(),
			oTabInOverflow = aItems[iDelta + 0],
			oTabInStrip3 = aItems[3],
			oTabInStrip4 = aItems[4];

		// Assert
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), oTabInOverflow.getText(), "First Tab in Overflow is - " + oTabInOverflow.getText());
		assert.strictEqual(aTabsInStrip[3].getText(), oTabInStrip3.getText(), "Fourth tab in Tab Strip is - " + oTabInStrip3.getText());
		assert.strictEqual(aTabsInStrip[4].getText(), oTabInStrip4.getText(), "Fifth tab in Tab Strip is - " + oTabInStrip4.getText());

		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		this.clock.tick(500);
		Core.applyChanges();

		aTabsInStrip = this.oIconTabHeader._getItemsInStrip();

		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[3].getText(), oTabInStrip3.getText(), "Tab at index " + (3) + " in items aggregation is now - " + oTabInStrip3.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[4].getText(), oTabInOverflow.getText(), "Tab at index " + (4) + " in items aggregation is now - " + oTabInOverflow.getText());

		// Arrange
		this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

		// Assert
		assert.notStrictEqual(this.oSelectList.getItems()[0].getText(), oTabInOverflow.getText(), "First Tab in Overflow is not '" + oTabInOverflow.getText() + "' anymore after it was moved");
		assert.strictEqual(aTabsInStrip[3].getText(), oTabInStrip3.getText(), "Fourth tab in Tab Strip is now - " + oTabInStrip3.getText());
		assert.strictEqual(aTabsInStrip[4].getText(), oTabInOverflow.getText(), "Fifth tab in Tab Strip is now - " + oTabInOverflow.getText());
	});

	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		var aTabsInStrip = this.oIconTabHeader._getItemsInStrip(),
			iDelta = aTabsInStrip.length;

		var aItems = this.oIconTabHeader.getItems(),
			oTabInOverflow = aItems[iDelta + 0],
			oTabInStrip3 = aItems[3],
			oTabInStrip4 = aItems[4];

		// Assert
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), oTabInOverflow.getText(), "First Tab in Overflow is - " + oTabInOverflow.getText());
		assert.strictEqual(aTabsInStrip[3].getText(), oTabInStrip3.getText(), "Fourth tab in Tab Strip is - " + oTabInStrip3.getText());
		assert.strictEqual(aTabsInStrip[4].getText(), oTabInStrip4.getText(), "Fifth tab in Tab Strip is - " + oTabInStrip4.getText());

		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		this.clock.tick(500);
		Core.applyChanges();

		aTabsInStrip = this.oIconTabHeader._getItemsInStrip();

		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[3].getText(), oTabInOverflow.getText(), "Tab at index " + (3) + " in items aggregation is now - " + oTabInOverflow.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[4].getText(), oTabInStrip3.getText(), "Tab at index " + (4) + " in items aggregation is now - " + oTabInStrip3.getText());

		// Arrange
		this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

		// Assert
		assert.notStrictEqual(this.oSelectList.getItems()[0].getText(), oTabInOverflow.getText(), "First Tab in Overflow is not '" + oTabInOverflow.getText() + "' anymore after it was moved");
		assert.strictEqual(aTabsInStrip[3].getText(), oTabInOverflow.getText(), "Fifth tab in Tab Strip is now - " + oTabInOverflow.getText());
		assert.strictEqual(aTabsInStrip[4].getText(), oTabInStrip3.getText(), "Fourth tab in Tab Strip is now - " + oTabInStrip3.getText());
	});

	QUnit.module("Drag&Drop: From Tab Strip to Overflow list", {
		beforeEach: function() {
			this.oIconTabBar = getIconTabBar();
			this.oIconTabBar.placeAt('qunit-fixture');
			Core.applyChanges();

			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oSelectList = this.oIconTabHeader._getSelectList();

			this.oIconTabBar._getIconTabHeader()._getOverflow()._expandButtonPress();

			var selectListItems = this.oSelectList.getAggregation("items");

			function getSelectListId (iElement) {
				return selectListItems[iElement].sId;
			}

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  Core.byId("idTab2");
						case "droppedControl" :
							return Core.byId(getSelectListId(3));
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  Core.byId("idTab2");
						case "droppedControl" :
							return Core.byId(getSelectListId(3));
					}
				}
			};


		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.oMockEvent = null;
			this.oMockEvent2 = null;
			this.oSelectList = null;
		}
	});

	QUnit.test("Drag&Drop dropPosition: 'After'", function(assert) {
		// length of items in tab strip used to offset the index of items aggregation with
		var aTabsInStrip = this.oIconTabHeader._getItemsInStrip(),
			iDelta = aTabsInStrip.length;

		var aItems = this.oIconTabHeader.getItems(),
			oTabInStrip2 = aItems[2],
			oTabInOverflow2 = aItems[iDelta + 2],
			oTabInOverflow3 = aItems[iDelta + 3];

		assert.strictEqual(this.oIconTabHeader._getItemsInStrip()[2].getText(), oTabInStrip2.getText(), "Third tab in Tab Strip is - " + oTabInStrip2.getText());
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), oTabInOverflow2.getText(), "Third Tab in Overflow is - " + oTabInOverflow2.getText());
		assert.strictEqual(this.oSelectList.getItems()[3].getText(), oTabInOverflow3.getText(), "Fourth Tab in Overflow is - " + oTabInOverflow3.getText());

		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent);
		this.clock.tick(500);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 2].getText(), oTabInOverflow3.getText(), "Tab at index " + (iDelta + 2) + " in items aggregation is now - " + oTabInOverflow3.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 3].getText(), oTabInStrip2.getText(), "Tab at index " + (iDelta + 3) + " in items aggregation is now - " + oTabInStrip2.getText());

		// Assert
		assert.notStrictEqual(this.oIconTabHeader._getItemsInStrip()[2].getText(), oTabInStrip2.getText(), "Third Tab in Tab Strip is not '" + oTabInStrip2.getText() + "' anymore after it was moved");
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), oTabInOverflow3.getText(), "Third Tab in Overflow is now - " + oTabInOverflow3.getText());
		assert.strictEqual(this.oSelectList.getItems()[3].getText(), oTabInStrip2.getText(), "Fourth Tab in Overflow is now - " + oTabInStrip2.getText());
	});

	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		// length of items in tab strip used to offset the index of items aggregation with
		var aTabsInStrip = this.oIconTabHeader._getItemsInStrip(),
			iDelta = aTabsInStrip.length;

		var aItems = this.oIconTabHeader.getItems(),
			oTabInStrip2 = aItems[2],
			oTabInOverflow2 = aItems[iDelta + 2],
			oTabInOverflow3 = aItems[iDelta + 3];

		assert.strictEqual(this.oIconTabHeader._getItemsInStrip()[2].getText(), oTabInStrip2.getText(), "Third tab in Tab Strip is - " + oTabInStrip2.getText());
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), oTabInOverflow2.getText(), "Third Tab in Overflow is - " + oTabInOverflow2.getText());
		assert.strictEqual(this.oSelectList.getItems()[3].getText(), oTabInOverflow3.getText(), "Fourth Tab in Overflow is - " + oTabInOverflow3.getText());

		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent2);
		this.clock.tick(500);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 2].getText(), oTabInStrip2.getText(), "Tab at index " + (iDelta + 2) + " in items aggregation is now - " + oTabInStrip2.getText());
		assert.strictEqual(this.oIconTabBar.getItems()[iDelta + 3].getText(), oTabInOverflow3.getText(), "Tab at index " + (iDelta + 3) + " in items aggregation is now - " + oTabInOverflow3.getText());

		// Assert
		assert.notStrictEqual(this.oIconTabHeader._getItemsInStrip()[2].getText(), oTabInStrip2.getText(), "Third Tab in Tab Strip is not '" + oTabInStrip2.getText() + "' anymore after it was moved");
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), oTabInStrip2.getText(), "Fourth Tab in Overflow is now - " + oTabInStrip2.getText());
		assert.strictEqual(this.oSelectList.getItems()[3].getText(), oTabInOverflow3.getText(), "Third Tab in Overflow is now - " + oTabInOverflow3.getText());
	});

	QUnit.module("Drag&Drop: Nesting", {
		beforeEach: function() {
		this.oIconTabBar = new IconTabBar({
			enableTabReordering: true,
			maxNestingLevel: 3,
			items: [
				new IconTabFilter({
					id: 'tabReorder1',
					text: "First tab",
					count: "3",
					content: [
						new Text({ text: "Text 1" })
					],
					items: [
						new IconTabFilter({ id: 'subItem1', text: "child 1", content: new Text({ text: "text 1" })}),
						new IconTabFilter({  id: 'subItem2',text: "child 2", content: new Text({ text: "text 2" })})
					]
				}),
				new IconTabFilter({
					id: 'tabReorder2',
					text: "Second tab",
					count: "1",
					content: [
						new Text({ text: "Text 2" })
					]
				}),
				new IconTabFilter({
					id: 'tabReorder3',
					text: "Third tab",
					count: "Count",
					content: [
						new Text({ text: "Text 3" })
					]
				})
			]
		});

		this.oIconTabBar1 = new IconTabBar({
			enableTabReordering: true,
			maxNestingLevel: 3,
			items: [
				new IconTabFilter({
					id: 'tab1',
					text: "First tab",
					count: "3",
					content: [
						new Text({ text: "Text 1" })
					]
				}),
				new IconTabFilter({
					id: 'tab2',
					text: "Second tab",
					count: "1",
					content: [
						new Text({ text: "Text 2" })
					]
				}),
				new IconTabFilter({
					id: 'tab3',
					text: "Third tab",
					count: "Count",
					content: [
						new Text({ text: "Text 3" })
					]
				}),
				new IconTabFilter({
					id: 'tab4',
					text: "Fourth tab",
					count: "Count",
					content: [
						new Text({ text: "Text 4" })
					],
					items: [
						new IconTabFilter({
							id: 'subtab4',
							text: "child 1",
							content: new Text({ text: "text 1" }),
							items: [
								new IconTabFilter({
									id: 'subsubtab4',
									text: "child 2",
									content: new Text({ text: "text 2" }),
									items:[]
								})
							]
						})
					]
				})
			]
		});
		this.oIconTabBar.placeAt('qunit-fixture');
		this.oIconTabBar1.placeAt('qunit-fixture');
		Core.applyChanges();

		this.oMockEventOn = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "On";
					case "draggedControl" :
						return  Core.byId("tabReorder3");
					case "droppedControl" :
						return Core.byId("tabReorder1");
				}
			}
		};

		this.oMockEventDropOnOwnChild = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "On";
					case "draggedControl" :
						return  Core.byId("tabReorder1");
					case "droppedControl" :
						return Core.byId("subItem1");
				}
			}
		};

		this.oMockEventOnSubItem = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "On";
					case "draggedControl" :
						return  Core.byId("tabReorder3");
					case "droppedControl" :
						return Core.byId("subItem1");
				}
			}
		};

		this.oMockEventOnSubItemSuccess = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "On";
					case "draggedControl" :
						return  Core.byId("tab3");
					case "droppedControl" :
						return Core.byId("subtab4");
				}
			}
		};

		this.oMockEventOnSubItemSuccess1 = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "On";
					case "draggedControl" :
						return  Core.byId("tab2");
					case "droppedControl" :
						return Core.byId("tab3");
				}
			}
		};

			this.oMockEventOnSubItemFail = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "On";
						case "draggedControl" :
							return  Core.byId("tab1");
						case "droppedControl" :
							return Core.byId("tab2");
					}
				}
			};

		this.oMockEventSubItemBeforeMainItem = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "Before";
					case "draggedControl" :
						return  Core.byId("subItem1");
					case "droppedControl" :
						return Core.byId("tabReorder3");
				}
			}
		};

		this.returnMockEvent = function(iKeyCode, sId) {
			var oMockEventTest = {
				keyCode: iKeyCode,
				srcControl: Core.byId(sId)
			};

			return oMockEventTest;
		};
		this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
		this.oIconTabHeader1 = this.oIconTabBar1.getAggregation("_header");
	},
	afterEach: function() {
		this.oIconTabBar.destroy();
		this.oIconTabHeader.destroy();
		this.oIconTabBar1.destroy();
		this.oIconTabHeader1.destroy();

		this.oMockEventOn = null;
		this.oMockEventOnSubItem = null;
		this.oMockEventOnSubItemFail = null;
		this.oMockEventOnSubItemSuccess1 = null;
		this.oMockEventOnSubItemSuccess = null;
		this.returnMockEvent = null;

	}
});

	QUnit.test("Drag&Drop on Tab with own content and sub items", function(assert) {

		var aItems = this.oIconTabHeader.getItems(),
			oIconTabFilterWithChildren = aItems[0],
			oMockEvent = {
				preventDefault: function () {},
				dragSession: {
					getDragControl: function () {
						return aItems[1];
					}
				}
			};

		assert.ok(!oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "The filter has default state");

		oIconTabFilterWithChildren._handleOnDragOver(oMockEvent);

		assert.ok(oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "The filter is in 'drag over' state ");

		oIconTabFilterWithChildren._handleOnDragLeave();

		assert.ok(!oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "The filter has default state");
		assert.ok(!oIconTabFilterWithChildren._oPopover, "There is no popover before long drag over");

		oIconTabFilterWithChildren._handleOnLongDragOver(oMockEvent);

		assert.ok(oIconTabFilterWithChildren._oPopover, "There is a popover on long drag over");
	});

	QUnit.test("Drag&Drop on Tab with own content and sub items over itself", function(assert) {

		var aItems = this.oIconTabHeader.getItems(),
			oIconTabFilterWithChildren = aItems[0],
			oMockEvent = {
				preventDefault: function () {},
				dragSession: {
					getDragControl: function () {
						return oIconTabFilterWithChildren;
					}
				}
			};

		assert.ok(!oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "The filter has default state");

		oIconTabFilterWithChildren._handleOnDragOver(oMockEvent);

		assert.notOk(oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "The filter is not in 'drag over' state ");

		oIconTabFilterWithChildren._handleOnDragLeave();

		assert.ok(!oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "The filter has default state");
		assert.ok(!oIconTabFilterWithChildren._oPopover, "There is no popover before long drag over");

		oIconTabFilterWithChildren._handleOnLongDragOver(oMockEvent);

		assert.notOk(oIconTabFilterWithChildren._oPopover, "There is no popover on long drag over");
	});

	QUnit.test("Drag&Drop on Tab with no own content and sub items", function(assert) {
		var aItems = this.oIconTabHeader.getItems(),
			oIconTabFilterWithChildren = aItems[0],
			oMockEvent = {
				preventDefault: function () {},
				dragSession: {
					getDragControl: function () {
						return aItems[1];
					}
				}
			};

		oIconTabFilterWithChildren.destroyContent();

		assert.ok(!oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "Expand button has default state");

		oIconTabFilterWithChildren._handleOnDragOver(oMockEvent);

		assert.ok(oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "Expand button is in 'drag over' state ");

		oIconTabFilterWithChildren._handleOnDragLeave();

		assert.ok(!oIconTabFilterWithChildren.$().hasClass("sapMITHDragOver"), "Expand button has default state");
		assert.ok(!oIconTabFilterWithChildren._oPopover, "There is no popover before long drag over");

		oIconTabFilterWithChildren._handleOnLongDragOver(oMockEvent);

		assert.ok(oIconTabFilterWithChildren._oPopover, "There is a popover on long drag over");

	});

	QUnit.test("Drag&Drop dropPosition: 'On' items in header", function(assert) {

		assert.strictEqual(this.oIconTabHeader.getItems().length, 3, "There are three tabs in IconTabHeader strip");
		assert.strictEqual(this.oIconTabHeader.getItems()[0].getItems().length, 2, "There are two items in the IconTabHeader first tab of the IconTabHeader");

		this.oIconTabHeader._handleDragAndDrop(this.oMockEventOn);

		assert.strictEqual( this.oIconTabHeader.getItems().length, 2, "There are two tabs in IconTabHeader strip");
		assert.strictEqual(this.oIconTabHeader.getItems()[0].getItems().length, 3, "There are three items in the IconTabHeader first tab of the IconTabHeader");
	});

	QUnit.test("Drag&Drop dropPosition: 'On' sub sub items ", function(assert) {

		this.oIconTabBar1.setMaxNestingLevel(3);
		this.oIconTabHeader1._handleDragAndDrop(this.oMockEventOnSubItemSuccess);

		assert.strictEqual(this.oIconTabHeader1.getItems()[2].getItems()[0].getItems().length, 2, "There is one sub item in the third item of the third tab");

		this.oIconTabHeader1._handleDragAndDrop(this.oMockEventOnSubItemSuccess1);

		this.oIconTabHeader1._handleDragAndDrop(this.oMockEventOnSubItemFail);


		assert.strictEqual(this.oIconTabHeader1.getItems().length, 2, "Tab one should not be nested");
	});

	QUnit.test("Drag&Drop dropPosition: 'On' sub items ", function(assert) {

		var aFirstItem = this.oIconTabHeader.getItems()[0].getItems()[0];

		assert.strictEqual(aFirstItem.getItems().length, 0, "There are no sub items in the first item of the first tab");

		this.oIconTabHeader._handleDragAndDrop(this.oMockEventOnSubItem);

		assert.strictEqual(aFirstItem.getItems().length, 1, "There is one sub item in the first item of the first tab");
	});

	QUnit.test("Drag&Drop: Can't drop on own child item", function(assert) {

		var aFirstItem = this.oIconTabHeader.getItems()[0].getItems()[0];

		assert.strictEqual(this.oIconTabHeader.getItems().length, 3, "There are three tabs in IconTabHeader strip");
		assert.strictEqual(aFirstItem.getItems().length, 0, "There are no sub items in the first item of the first tab");

		this.oIconTabHeader._handleDragAndDrop(this.oMockEventDropOnOwnChild);

		assert.strictEqual(aFirstItem.getItems().length, 0, "There are still no sub items in the first item of the first tab");
		assert.strictEqual(this.oIconTabHeader.getItems().length, 3, "There are  still three tabs in IconTabHeader strip");

	});

	QUnit.test("Drag&Drop: Dropping a sub item between header items", function (assert) {

		assert.strictEqual(this.oIconTabHeader.getItems()[this.oIconTabHeader.getItems().length - 1].getText(), "Third tab", "The item with text 'Third tab' is the last item");
		assert.strictEqual(this.oIconTabHeader.getItems()[this.oIconTabHeader.getItems().length - 2].getText(), "Second tab", "The item with text 'Second tab' is the item before the last");

		this.oIconTabHeader._handleDragAndDrop(this.oMockEventSubItemBeforeMainItem);

		assert.strictEqual(this.oIconTabHeader.getItems()[this.oIconTabHeader.getItems().length - 1].getText(), "Third tab", "The item with text 'Third tab' is the last item");
		assert.strictEqual(this.oIconTabHeader.getItems()[this.oIconTabHeader.getItems().length - 2].getText(), "child 1", "The item with text 'child 1' is the item before the last");
		assert.strictEqual(this.oIconTabHeader.getItems()[this.oIconTabHeader.getItems().length - 3].getText(), "Second tab", "The item with text 'Second tab' is the second to last item");

	});

	QUnit.module("Drag&Drop: moving items via keyboard interaction", {
		beforeEach: function() {
		this.oIconTabBar = new IconTabBar({
			enableTabReordering: true,
			tabNestingViaInteraction: true,
			items: [
				new IconTabFilter({
					id: 'tabReorder1',
					text: "First tab",
					count: "3",
					content: [
						new Text({ text: "Text 1" })
					],
					items: [
						new IconTabFilter({ id: 'subItem1', text: "child 1", content: new Text({ text: "text 1" }),
							items: [
							new IconTabFilter({ id: 'subItem1Level2', text: "child 1.1", content: new Text({ text: "text 1.1" })})
						]}),
						new IconTabFilter({  id: 'subItem2',text: "child 2", content: new Text({ text: "text 2" })})
					]
				}),
				new IconTabFilter({
					id: 'tabReorder2',
					text: "Second tab",
					count: "1",
					content: [
						new Text({ text: "Text 2" })
					]
				}),
				new IconTabFilter({
					id: 'tabReorder3',
					text: "Third tab",
					count: "Count",
					content: [
						new Text({ text: "Text 3" })
					]
				})
			]
		});

		this.oIconTabBar.placeAt('qunit-fixture');
		Core.applyChanges();

		this.oMockEvent = {
			getParameter: function(parameter) {
				switch (parameter) {
					case "dropPosition" :
						return "After";
					case "draggedControl" :
						return  Core.byId("subItem1");
					case "droppedControl" :
						return Core.byId("subItem2");
				}
			 }
		};

		this.returnMockEvent = function(iKeyCode, sId) {
			var oMockEventTest = {
				keyCode: iKeyCode,
				srcControl: Core.byId(sId)
			};

			return oMockEventTest;
		};
		this.itemWithSubItems = this.oIconTabBar.getItems()[0];
		this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");

		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.oMockEventOn = null;
			this.returnMockEvent = null;

		}
	});

	QUnit.test("Drag&Drop: Moving item with nested items on the strip moves the item and its nested tabs", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabHeader.getItems()[0].getText(), "First tab", 'First tab is "First tab"');
		assert.strictEqual(this.oIconTabHeader.getItems()[0].getItems().length, 2, 'First tab has two nested items');
		assert.strictEqual(this.oIconTabHeader.getItems()[1].getText(), "Second tab", 'Second tab is "Second tab"');
		assert.strictEqual(this.oIconTabHeader.getItems()[1].getItems().length, 0, 'Second tab has no nested items');

		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT, this.itemWithSubItems.sId));

		// Assert
		assert.strictEqual(this.oIconTabHeader.getItems()[0].getText(), "Second tab", 'First tab is "Second tab"');
		assert.strictEqual(this.oIconTabHeader.getItems()[0].getItems().length, 0, 'First tab has no nested items');
		assert.strictEqual(this.oIconTabHeader.getItems()[1].getText(), "First tab", 'Second tab is "First tab"');
		assert.strictEqual(this.oIconTabHeader.getItems()[1].getItems().length, 2, 'Second tab has two nested item');
	});

	QUnit.test("Drag&Drop: Moving item with nested items via within drop down list moves the item and its nested tabs", function(assert) {
		// Assert
		assert.strictEqual(this.itemWithSubItems.getItems()[0].getText(), "child 1", 'First nested item in the first tab is "child 1"');
		assert.strictEqual(this.itemWithSubItems.getItems()[0].getItems().length, 1, 'First nested item has one sub item');
		assert.strictEqual(this.itemWithSubItems._getAllSubItems().length, 3, 'First Tab has three sub items');
		assert.strictEqual(this.itemWithSubItems.getItems()[0].getItems()[0], this.itemWithSubItems._getAllSubItems()[1], 'First nested item on sub level two is at index 1 of all items in the first tab');

		//ACT
		this.itemWithSubItems._expandButtonPress();
		this.itemWithSubItems._getSelectList().ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_RIGHT, this.itemWithSubItems._getSelectList().getItems()[0].sId));

		// Assert
		assert.strictEqual(this.itemWithSubItems.getItems()[1].getText(), "child 1", 'Second nested item in the first tab is "child 1"');
		assert.strictEqual(this.itemWithSubItems.getItems()[1].getItems().length, 1, 'First Tab has one nested item1');
		assert.strictEqual(this.itemWithSubItems.getItems()[1].getItems()[0], this.itemWithSubItems._getAllSubItems()[2], 'First nested item on sub level two is at index 3 of all items in the first tab');
	});

	QUnit.test("Moving an item over an item with sub items skips the sub items", function(assert) {
		//Assert
		assert.strictEqual(this.itemWithSubItems.getItems()[0].getText(), "child 1", 'First nested item in the first tab is "child 1"');
		assert.strictEqual(this.itemWithSubItems.getItems()[0].getItems()[0].getText(), "child 1.1", 'The nested item on sub level two of the first item in the first tab is "child 1.1"');
		//ACT
		this.itemWithSubItems._expandButtonPress();
		this.itemWithSubItems._getSelectList().ondragrearranging(this.returnMockEvent(KeyCodes.ARROW_LEFT, this.itemWithSubItems._getSelectList().getItems()[2].sId));
		// Assert
		assert.strictEqual(this.itemWithSubItems.getItems()[0].getText(), "child 2", 'First nested item in the first tab is "child 2"');
		assert.strictEqual(this.itemWithSubItems.getItems()[1].getItems()[0].getText(), "child 1.1", 'The nested item on sub level two of the second item in the first tab is "child 1.1"');
	});

	QUnit.module("Sticky Content Support");

	QUnit.test("IconTabHeader's classes when taken for sticky header content", function (assert) {
		// Arrange
		var oIconTabBar = createIconTabBar();

		// Act
		oIconTabBar.addStyleClass("sapUiResponsiveContentPadding");
		oIconTabBar.addStyleClass("sapUiNoContentPadding");
		oIconTabBar.addStyleClass("sapUiContentPadding");
		oIconTabBar.addStyleClass("someClass");

		var oIconTabHeader = oIconTabBar._getStickyContent();

		// Assert
		assert.ok(oIconTabHeader.hasStyleClass("sapUiResponsiveContentPadding"), "Should have copied .sapUiResponsiveContentPadding to the header.");
		assert.ok(oIconTabHeader.hasStyleClass("sapUiNoContentPadding"), "Should have copied .sapUiNoContentPadding to the header.");
		assert.ok(oIconTabHeader.hasStyleClass("sapUiContentPadding"), "Should have copied .sapUiContentPadding to the header.");
		assert.notOk(oIconTabHeader.hasStyleClass("someClass"), "Should have NOT copied .someClass to the header.");

		// Clean Up
		oIconTabBar.destroy();
	});

	QUnit.module("Responsive padding support");

	QUnit.test("Correct Responsive padding is applied", function (assert) {
		// Arrange
		var oITB = getIconTabBar();
		oITB.addStyleClass("sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer");

		oITB.placeAt("qunit-fixture");
		Core.applyChanges();

		this.clock.tick(500);

		var fnHasClass = function (sSelector, sClass) {
			return oITB.$().find(sSelector).hasClass(sClass);
		};
		var fnAssertCorrectPaddingsAppliedOnBreakpoint = function (sBreakpoint) {
			var sClass = "sapUi-Std-Padding" + sBreakpoint;
			assert.ok(fnHasClass(".sapMITH", sClass), "Header has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
			assert.ok(fnHasClass(".sapMITBContent", sClass), "Content has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
		};
		this.clock.tick(500);

		// Act
		oITB.$().width("350px"); // set S breakpoint width

		this.clock.tick(500);

		// Assert
		fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

		// Act
		oITB.$().width("800px"); // set M breakpoint width
		this.clock.tick(500);

		// Assert
		fnAssertCorrectPaddingsAppliedOnBreakpoint("M");

		// Act
		oITB.$().width("350px"); // set it back to S breakpoint width
		this.clock.tick(500);

		// Assert
		fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

		// Clean up
		oITB.destroy();
	});

	QUnit.module("Unselectable tabs");

	QUnit.test("On initial rendering, an ITB with a 'unselectable' tab as first tab should render it's first available child item", function (assert) {
		// Arrange
		var oTab = new IconTabFilter({
			text: "unselectable area tab",
			content: [], // explicitly has no content
			items: [
				new IconTabFilter({ text: "child 1", content: new Text({ text: "text 1" })}),
				new IconTabFilter({ text: "child 2", content: new Text({ text: "text 2" })})
			]
		});

		var oITB = new IconTabBar({
			content: [], // explicitly has no content
			items: oTab
		});

		oITB.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oITB.getSelectedKey(), oTab.getItems()[0].getId(), "Selected item is first available child that has content");

		// Clean-up
		oITB.destroy();
	});

	QUnit.test("Selecting on a tab that has no content set, but has sub items, opens its overflow list", function (assert) {
		// Arrange
		var oTab = new IconTabFilter({
			text: "unselectable tab",
			content: [], // explicitly has no content
			items: [
				new IconTabFilter({ text: "child 1", content: new Text({ text: "text 1" })}),
				new IconTabFilter({ text: "child 2", content: new Text({ text: "text 2" })})
			]
		});

		var oITB = new IconTabBar({
			content: [], // explicitly has no content
			items: oTab
		});

		oITB.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oTab.$(), KeyCodes.ENTER);

		// Assert
		assert.strictEqual(oTab._oPopover.isOpen(), true, "Tab's popover has been opened");
		assert.ok(oTab._oPopover.$().find(".sapMITBSelectList").length, "Tab has its select list shown");

		// Clean-up
		oITB.destroy();
	});

	QUnit.test("Choosing an unselectable item from IconTabBarSelectList doesn't change anything", function (assert) {
		// Arrange
		var aTabs = [];
		for (var i = 1; i < 100; i++) {
			aTabs.push(new IconTabFilter({
				text: "Tab " + i,
				key: i,
				content: new Text({ text: "Content " + i})
			}));
		}
		var oUnselectableTab = new IconTabFilter({
			text: "unselectable tab",
			key: "unselectable",
			content: [], // explicitly has no content
			items: [
				new IconTabFilter({ text: "child 1", content: new Text({ text: "text 1" })}),
				new IconTabFilter({ text: "child 2", content: new Text({ text: "text 2" })})
			]
		});
		aTabs.push(oUnselectableTab);

		var oITB = new IconTabBar({
			content: [], // explicitly has no content
			items: aTabs
		});
		oITB.placeAt("qunit-fixture");
		Core.applyChanges();

		var oITH = oITB._getIconTabHeader();
		var oSetSelectedItemSpy = this.spy(oITH, "setSelectedItem");
		var oOverflow = oITH._getOverflow();
		var oFireSelectionChangeSpy = this.spy(oOverflow._getSelectList(), "fireSelectionChange");
		// open overflow

		oITB._getIconTabHeader()._getOverflow()._expandButtonPress();

		// Assert
		assert.strictEqual(oOverflow._oPopover.isOpen(), true, "ITB overflow's popover has been opened");
		assert.ok(oOverflow._oPopover.$().find(".sapMITBSelectList").length, "ITB has its overflow select list shown");
		assert.strictEqual(oITB.getSelectedKey(), "1", "At start, first tab is selected");

		var aITHItems = oITH.getItems();
		var oLastItem = aITHItems.pop();

		assert.strictEqual(oLastItem.getKey(), oUnselectableTab.getKey(), "Last item in overflow is the unselectable item");

		// Act
		qutils.triggerEvent("tap", oLastItem.$());

		assert.strictEqual(oITB.getSelectedKey(), "1", "Selected item should not have changed");
		assert.strictEqual(oFireSelectionChangeSpy.callCount, 0, "IconTabBarSelectList#fireSelectionChange should not have been called");
		assert.strictEqual(oSetSelectedItemSpy.callCount, 0, "IconTabHeader#setSelectedItem should not have been called");

		// Clean-up
		oFireSelectionChangeSpy.restore();
		oSetSelectedItemSpy.restore();
		oITB.destroy();
	});

});
