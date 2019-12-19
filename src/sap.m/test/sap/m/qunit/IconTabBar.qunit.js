/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
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
	"jquery.sap.keycodes",
	"sap/m/library",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/HTML",
	"sap/m/ObjectHeader",
	"sap/ui/Device",
	"jquery.sap.global"
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
	jQuery,
	mobileLibrary,
	ResizeHandler,
	HTML,
	ObjectHeader,
	Device
) {
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

		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Add one item
		oIconTabBar.addItem(
			 new IconTabFilter({
					icon: "sap-icon://task",
					content: new Text({
						text: "Tab Content"
					})
				})
		);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Remove the item
		oIconTabBar.removeItem(0);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oIconTabBarNoText.$("-header-head").hasClass("sapMITBNoText"), "should have class for no-text version");
		assert.ok(!oIconTabBarNoText.$("-header-head").hasClass("sapMITBTextOnly"), "should not have class for text-only version");

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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oIconTabBarTextOnly.$("-header-head").hasClass("sapMITBNoText"), "should not have class for no-text version");
		assert.ok(oIconTabBarTextOnly.$("-header-head").hasClass("sapMITBTextOnly"), "should have class for text-only version");

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().setModel(oModel);

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oIconTabBar.bindElement("/Data/0");
		sap.ui.getCore().applyChanges();
		oIconTabBar.bindElement("/Data/1");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery('.sapMITBFilter').length > 0, 'IconTabFilters are rendered');
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
		sap.ui.getCore().applyChanges();

		// Assert

		var aTabs = oIconTabBar.$().find('.sapMITBFilter');

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
		sap.ui.getCore().applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterDefault"), "color should be default");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");

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

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterPositive"), "color should be positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");

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

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterNegative"), "color should be negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");

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

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterNeutral"), "color should be neutral");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterCritical"), "color is not critical");

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

		// System under test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $itbf = oIconTabBar.getItems()[0].$();
		assert.ok($itbf.hasClass("sapMITBFilterCritical"), "color should be critical");
		assert.ok(!$itbf.hasClass("sapMITBFilterNegative"), "color is not negative");
		assert.ok(!$itbf.hasClass("sapMITBFilterDefault"), "color is not default");
		assert.ok(!$itbf.hasClass("sapMITBFilterPositive"), "color is not positive");
		assert.ok(!$itbf.hasClass("sapMITBFilterNeutral"), "color is not neutral");

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
		sap.ui.getCore().applyChanges();

		// Act
		// now change the text for IconTabFilter
		oIconTabFilter.setText("new text");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oIconTabFilter.getText(), "new text", "the text is changed");
		assert.equal(oIconTabFilter.$("text").html(), "new text", "the new text is rendered");

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
		sap.ui.getCore().applyChanges();

		// Change the button text
		oButton.setText("new button");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Act
		// now change the icon color for one IconTabFilter after it was rendered
		// add IconTabSeparator
		oIconTabFilter.setIconColor(IconColor.Positive);
		oIconTabBar.addItem(new IconTabSeparator());
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().find(".sapMITBCount").length == 3, '3 "counts" texts are displayed');
		assert.ok(jQuery(oIconTabBar.$().find(".sapMITBText")[0]).text() == "Text 1", "The text is correct");

		oIconTabBar.setHeaderMode(IconTabHeaderMode.Inline);

		sap.ui.getCore().applyChanges();

		var bRtl = sap.ui.getCore().getConfiguration().getRTL();
		var sText = bRtl ? "(10) Text 1" : "Text 1 (10)";

		assert.ok(oIconTabBar.$().find(".sapMITBCount").length == 0, '"counts" texts are not displayed');
		assert.equal(jQuery(oIconTabBar.$().find(".sapMITBText")[0]).text(), sText, "The count is attached to the text");

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oIconTabBar.$().hasClass("sapMITBBackgroundDesignTransparent"), "should have class for backgroundDesign: transparent");

		// Clean up
		oIconTabBar.destroy();
	});

	QUnit.test("no flexbox support", function(assert) {
		var	$FlexChild,
			iFlexChildWidth,
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
		sap.ui.getCore().applyChanges();

		$FlexChild = oIconTabBar.$("containerContent");

		iFlexChildHeight = $FlexChild.height();

		// Act
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(Math.abs(iFlexChildHeight - $FlexChild.height()) <= 1, "Height is not changed");

		// Cleanup
		oIconTabBar.destroy();
	});

	QUnit.module("scrolling");

	QUnit.test("initial scrolling - scrollable", function(assert) {
		var oResizeHandler = sap.ui.core.ResizeHandler;
		var oResizeHandlerStub = this.stub(oResizeHandler, "register", jQuery.noop);

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "first"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "middle"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "last"
				})
			]
		});

		// System under Test
		// set width to 200px, to simulate smaller screen size
		jQuery("#qunit-fixture").width("200px");
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oResizeHandlerStub.callArg(1);

		// Assert
		assert.ok(oIconTabBar.$("-header").hasClass("sapMITBScrollable"), "IconTabBar is scrollable");

		// Clean up
		oIconTabBar.destroy();
		oResizeHandler.deregister();
	});

	QUnit.test("initial scrolling - not scrollable", function(assert) {
		var oResizeHandler = sap.ui.core.ResizeHandler;
		var oResizeHandlerStub = this.stub(oResizeHandler, "register", jQuery.noop);

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager"
				})
			]
		});

		// System under Test
		// set width to 200px, to simulate smaller screen size
		jQuery("#qunit-fixture").width("200px");
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oResizeHandlerStub.callArg(1);

		// Assert
		assert.ok(!oIconTabBar.$("-header").hasClass("sapMITBScrollable"), "IconTabBar2 is not scrollable");

		// Clean up
		oIconTabBar.destroy();
		oResizeHandler.deregister();
	});

	QUnit.test("first element is selected / scroll forward arrow is shown", function(assert) {
		var oResizeHandler = sap.ui.core.ResizeHandler;
		var oResizeHandlerStub = this.stub(oResizeHandler, "register", jQuery.noop);

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "first"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "middle"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "last"
				})
			],
			selectedKey: "first"
		});

		// System under Test
		// set width to 200px, to simulate smaller screen size
		jQuery("#qunit-fixture").width("200px");
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oResizeHandlerStub.callArg(1);

		var $itbh = oIconTabBar.$("-header");

		// Assert
		assert.ok($itbh.hasClass("sapMITBScrollable"), "IconTabBar is scrollable, (first selected)");
		assert.ok($itbh.hasClass("sapMITBScrollForward"), "Scroll forward arrow is shown, (first selected)");
		assert.ok($itbh.hasClass("sapMITBNoScrollBack"), "Scroll back arrow is not shown, (first selected)");
		assert.equal(oIconTabBar.$("-header-arrowScrollRight").css("visibility"), "visible", "Right arrow is visible");
		assert.equal(oIconTabBar.$("-header-arrowScrollLeft").css("visibility"), "hidden", "Left arrow is not visible");

		// Clean up
		oIconTabBar.destroy();
		oResizeHandler.deregister();
	});

	QUnit.test("last element is selected  / scroll back arrow is shown", function(assert) {
		var oResizeHandler = sap.ui.core.ResizeHandler;
		var oResizeHandlerStub = this.stub(oResizeHandler, "register", jQuery.noop);

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "first"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "middle"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "last"
				})
			]
		});

		// System under Test
		// set width to 200px, to simulate smaller screen size
		jQuery("#qunit-fixture").width("200px");
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oResizeHandlerStub.callArg(1);
		// if the selected item is outside the view a scrolling takes place after a timeout
		this.clock.tick(1000);

		oIconTabBar.setSelectedKey("last");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		var $itbh = oIconTabBar.$("-header");

		// Assert
		assert.ok($itbh.hasClass("sapMITBScrollable"), "IconTabBar is scrollable, (last selected)");
		assert.ok($itbh.hasClass("sapMITBNoScrollForward"), "Scroll forward arrow is not shown, (last selected)");
		assert.ok($itbh.hasClass("sapMITBScrollBack"), "Scroll back arrow is shown, (last selected)");
		assert.equal(oIconTabBar.$("-header-arrowScrollRight").css("visibility"), "hidden", "Right arrow is not visible");
		assert.equal(oIconTabBar.$("-header-arrowScrollLeft").css("visibility"), "visible", "Left arrow is visible");

		// Clean up
		oIconTabBar.destroy();
		oResizeHandler.deregister();
	});

	QUnit.test("middle element is selected / both arrows are shown", function(assert) {
		var oResizeHandler = sap.ui.core.ResizeHandler;
		var oResizeHandlerStub = this.stub(oResizeHandler, "register", jQuery.noop);

		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "first"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "middle"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "last"
				})
			],
			selectedKey: "middle"
		});

		// System under Test
		// set width to 200px, to simulate smaller screen size
		jQuery("#qunit-fixture").width("200px");
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oResizeHandlerStub.callArg(1);
		//if the selected item is outside the view a scrolling takes place after a timeout
		this.clock.tick(1000);

		var $itbh = oIconTabBar.$("-header");

		// Assert
		assert.equal(oIconTabBar.$("-header-arrowScrollRight").css("visibility"), "visible", "Right arrow is visible");
		assert.equal(oIconTabBar.$("-header-arrowScrollLeft").css("visibility"), "visible", "Left arrow is visible");
		assert.ok($itbh.hasClass("sapMITBScrollable"), "IconTabBar is scrollable, (middle selected)");
		assert.ok($itbh.hasClass("sapMITBScrollForward"), "Scroll forward arrow is shown, (middle selected)");
		assert.ok($itbh.hasClass("sapMITBScrollBack"), "Scroll back arrow is shown, (middle selected)");

		// Clean up
		oIconTabBar.destroy();
		oResizeHandler.deregister();
	});

	QUnit.test("a new item is added / scroll forward arrow is shown", function(assert) {
		var oIconTabBar = new IconTabBar({
			items: [
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "first"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager"
				}),
				new IconTabFilter({
					icon: "sap-icon://manager",
					key: "middle"
				})
			]
		});

		// System under Test
		// set width to 300px, to simulate smaller screen size
		jQuery("#qunit-fixture").width("300px");
		oIconTabBar.placeAt("qunit-fixture");
		// when add a new item the space is not enough
		oIconTabBar.addItem(new IconTabFilter({
			icon: "sap-icon://manager",
			key: "middle"
		}));

		sap.ui.getCore().applyChanges();

		// wait 500ms
		// we need to call this when the iScroll is used
		this.clock.tick(500);

		var $itbh = oIconTabBar.$("-header");

		// Assert
		assert.equal(oIconTabBar.$("-header-arrowScrollRight").css("visibility"), "visible", "Right arrow is visible");
		assert.equal(oIconTabBar.$("-header-arrowScrollLeft").css("visibility"), "hidden", "Left arrow is not visible");
		assert.ok($itbh.hasClass("sapMITBScrollable"), "IconTabBar is scrollable, (first selected)");
		assert.ok($itbh.hasClass("sapMITBScrollForward"), "Scroll forward arrow is shown, (first selected)");
		assert.ok($itbh.hasClass("sapMITBNoScrollBack"), "Scroll back arrow is not shown, (first selected)");

		// Clean up
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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(jQuery.sap.byId("PreserveContent1").length, 1, "The span node \"PreserveContent\" is in the DOM");
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[1]);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(jQuery.sap.byId("PreserveContent2").length, 1, "The span node \"PreserveContent2\" is in the DOM");
		oIconTabBar.setSelectedItem(oIconTabBar.getItems()[0]);
		sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();
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

		$tab1.focus(); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_RIGHT); // trigger Arrow right on first filter
		assert.ok($tab2.is(":focus"), "ARROW_RIGHT is pressed, focus moved on second filter");

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_RIGHT); // trigger Arrow right on second filter
		assert.ok($tab2.is(":focus"), "ARROW_RIGHT is pressed, focus stay on second (last) filter"); // should not loop
	});

	QUnit.test("Arrow Left", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.focus(); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_LEFT); // trigger Arrow left on second filter
		assert.ok($tab1.is(":focus"), "ARROW_LEFT is pressed, focus moved on first filter");

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_LEFT); // trigger Arrow left on first filter
		assert.ok($tab1.is(":focus"), "ARROW_LEFT is pressed, focus stayed on first filter"); // should not loop
	});

	QUnit.test("Arrow Down", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.focus(); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_DOWN); // trigger Arrow down on first filter
		assert.ok($tab2.is(":focus"), "ARROW_DOWN is pressed, focus moved on second filter");

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_DOWN); // trigger Arrow down on second filter
		assert.ok($tab2.is(":focus"), "ARROW_DOWN is pressed, focus stay on second filter"); // should not loop
	});

	QUnit.test("Arrow Up", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.focus(); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.ARROW_UP); // trigger Arrow up on second filter
		assert.ok($tab1.is(":focus"), "ARROW_UP is pressed, focus moved on first filter");

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.ARROW_UP); // trigger Arrow up on first filter
		assert.ok($tab1.is(":focus"), "ARROW_UP is pressed, focus stay on first filter"); // should not loop
	});

	QUnit.test("END", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.focus(); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.END); // trigger End on first filter
		assert.ok($tab2.is(":focus"), "END is pressed, focus moved on last filter");
	});

	QUnit.test("HOME", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.focus(); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.HOME); // trigger Home on second filter
		assert.ok($tab1.is(":focus"), "HOME is pressed, focus moved on first filter");
	});

	QUnit.test("PAGEDOWN", function(assert) {
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab1.focus(); // set focus on first filter

		sap.ui.test.qunit.triggerKeydown($tab1, jQuery.sap.KeyCodes.PAGE_DOWN); // trigger PAGEDOWN on first filter
		assert.ok($tab2.is(":focus"), "PAGEDOWN is pressed, focus moved on last filter");
		});

	QUnit.test("PAGEUP", function(assert) {

	var $tab1 = this.oIconTabBar.getItems()[0].$();
	var $tab2 = this.oIconTabBar.getItems()[1].$();

	$tab2.focus(); // set focus on second filter

	sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.PAGE_UP); // trigger PAGEUP on second filter
	assert.ok($tab1.is(":focus"), "PAGEUP is pressed, focus moved on first filter");
});

	QUnit.test("SPACE", function(assert) {
		var oSelectSpy = sinon.spy(IconTabBar.prototype, "fireSelect");
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.focus(); // set focus on second filter

		sap.ui.test.qunit.triggerKeydown($tab2, jQuery.sap.KeyCodes.SPACE); // trigger Space on second filter
		sap.ui.test.qunit.triggerKeyup($tab2, jQuery.sap.KeyCodes.SPACE); // trigger Space on second filter
		assert.strictEqual(oSelectSpy.callCount, 1, "SPACE is pressed, select event was fired");

		// Clean up
		IconTabBar.prototype.fireSelect.restore();
	});

	QUnit.test("ENTER", function(assert) {
		var oSelectSpy = sinon.spy(IconTabBar.prototype, "fireSelect");
		var $tab1 = this.oIconTabBar.getItems()[0].$();
		var $tab2 = this.oIconTabBar.getItems()[1].$();

		$tab2.focus(); // set focus on second filter

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
		sap.ui.getCore().applyChanges();

		// wait 500ms
		this.clock.tick(500);

		var $tab = oIconTabBar.getItems()[0].$();
		assert.ok($tab.hasClass('sapMITBSelected'), "first tab is selected");

		oIconTabBar.setSelectedKey(oIconTabBar.getItems()[0].getKey());
		sap.ui.getCore().applyChanges();
		assert.ok($tab.hasClass('sapMITBSelected'), "first tab is selected");

		oIconTabBar.setSelectedKey(oIconTabBar.getItems()[1].getKey());
		sap.ui.getCore().applyChanges();
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

		sap.ui.getCore().setModel(oJSONModel);

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().setModel(oJSONModel);

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// change the IconTabFilter text property
		var sNewText = 'New Text';
		var aItems = oIconTabBar.getItems();
		aItems[0].setText(sNewText);

		// wait 500ms
		this.clock.tick(500);

		var $tab = oIconTabBar._getIconTabHeader().$().find('.sapMITBText').first();

		// Assert
		assert.ok($tab.text() == sNewText, "the text is changed");

		// Clean up
		oIconTabBar.destroy();
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
		sap.ui.getCore().applyChanges();

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
		var oIconTabHeader = new IconTabHeader({
				showOverflowSelectList: true,
				items: [
					new IconTabFilter({
						icon: "sap-icon://manager",
						visible: "{/tabVisible}"
					})
				]
			}),
			bTabVisible = false;

		oIconTabHeader.setModel(new JSONModel({tabVisible: bTabVisible}));

		// act
		oIconTabHeader._overflowButtonPress();

		// Assert
		assert.strictEqual(oIconTabHeader._getSelectList().getItems()[0].getVisible(), bTabVisible, "property has propagated");

		// act (reopen)
		oIconTabHeader._overflowButtonPress();

		// Assert
		assert.strictEqual(oIconTabHeader._getSelectList().getItems()[0].getVisible(), bTabVisible, "property has propagated");

		// Clean up
		oIconTabHeader.destroy();
	});

	QUnit.module("tabs");

	QUnit.test("remove selected tab", function(assert) {

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
			]
		});

		// System under Test
		oIconTabBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oButton = oIconTabBar.$().find('.sapMITBContent .sapMBtn')[0];

		// Assert
		assert.ok(jQuery(oButton).text().indexOf("Text 1") > -1, "First button is displayed");

		// remove first tab
		var aItems = oIconTabBar.getItems();
		oIconTabBar.removeItem(aItems[0]);

		oButton = oIconTabBar.$().find('.sapMITBContent .sapMBtn')[0];

		// Assert
		assert.ok(jQuery(oButton).text().indexOf("Text 2") > -1, "Second button is displayed");

		// Clean up
		oIconTabBar.destroy();
	});

	function getIconTabBarWithOverflowList() {
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

		var oIconTabBarOverflowSelectList = new IconTabBar({
			showOverflowSelectList: true,
			items: aTabItems
		});

		return oIconTabBarOverflowSelectList;
	}

	QUnit.module("Overflow Select List",{
		beforeEach: function () {
			this.oIconTabBar = getIconTabBarWithOverflowList();
			this.oIconTabBar.placeAt('qunit-fixture');

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oIconTabBar.destroy();
			this.oIconTabBar = null;
		}
	});

	QUnit.test("Rendering", function (assert) {
		assert.strictEqual(this.oIconTabBar.$().find('.sapMITHOverflowButton button').length, 1, "Overflow button is rendered");

		var oButton = this.oIconTabBar.$().find('.sapMITHOverflowButton button');
		oButton.trigger('tap');

		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery('.sapMITBSelectList').length, 1, "Select list is open");
	});

	QUnit.test("Selection", function (assert) {
		this.oIconTabBar.setSelectedKey('3');

		sap.ui.getCore().applyChanges();

		var oButton = this.oIconTabBar.$().find('.sapMITHOverflowButton button');
		oButton.trigger('tap');

		sap.ui.getCore().applyChanges();
		var selectItems = jQuery('.sapMITBSelectItem');

		assert.strictEqual(jQuery(selectItems[3]).hasClass('sapMITBSelectItemSelected'), true, 'Correct select item is selected');

		jQuery(selectItems[10]).trigger('tap');

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oIconTabBar.getSelectedKey(), '10', 'Correct tab filter is selected');
	});

	QUnit.test("Filters cloning", function (assert) {
		// Arrange
		var oIconTabHeader = this.oIconTabBar.getAggregation("_header"),
			oOverflowButton = this.oIconTabBar.$().find('.sapMITHOverflowButton button'),
			aItems = oIconTabHeader.getItems(),
			aClonedItems;

		// Act
		oOverflowButton.trigger('tap');
		aClonedItems = oIconTabHeader._getSelectList().getItems();

		// Assert
		assert.strictEqual(aItems.length, aClonedItems.length, "Items of the original and cloned filters should be equal");
		assert.strictEqual(aItems[0].getContent().length, 1, "Original filter should have 1 item");
		assert.strictEqual(aClonedItems[0].getContent().length, 0, "Cloned filter should NOT have items");
	});

	QUnit.module("ARIA",{
		beforeEach: function () {
			this.oIconTabBar = getIconTabBarWithOverflowList();
			this.oIconTabBar.getItems()[1].setVisible(false);
			this.oIconTabBar.insertItem(new IconTabSeparator(), 1);
			this.oIconTabBar.placeAt('qunit-fixture');

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oIconTabBar.destroy();
			this.oIconTabBar = null;
		}
	});

	QUnit.test("Posinset and Setsize", function (assert) {

		var $tabFilters = this.oIconTabBar.$().find('.sapMITBFilter');

		assert.strictEqual($tabFilters[1].getAttribute('aria-posinset'), "2", "posinset is set correctly");
		assert.strictEqual($tabFilters[1].getAttribute('aria-setsize'), "29", "setsize is set correctly");

		var oButton = this.oIconTabBar.$().find('.sapMBtn');
		oButton.trigger('tap');

		sap.ui.getCore().applyChanges();

		var $selectList = jQuery('.sapMITBSelectList');
		var $selectItems = $selectList.find('.sapMITBSelectItem');

		assert.strictEqual($selectItems[1].getAttribute('aria-posinset'), "2", "posinset is set correctly");
		assert.strictEqual($selectItems[1].getAttribute('aria-setsize'), "29", "setsize is set correctly");
	});

	QUnit.module("padding");

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new IconTabBar(),
			sContentSelector = ".sapMITBContainerContent > .sapMITBContent",
			sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
			aResponsiveSize = sResponsiveSize.split(" "),
			$container,
			$containerContent;

		// Act
		oContainer.placeAt("content");
		sap.ui.getCore().applyChanges();
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

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oIconTabHeader.destroy();
			this.oIconTabHeader = null;
		}
	});

	QUnit.test("Selection", function (assert) {
		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBSelected').length, 0, "No tab is selected");

		this.oIconTabHeader.setSelectedKey('');
		sap.ui.getCore().applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabHeader.setSelectedKey('InvalidKey');
		sap.ui.getCore().applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBSelected').length, 0, "No tab is selected");
	});

	QUnit.test("ScrollIntoView after initial resize", function (assert) {
		this.oIconTabHeader.setSelectedKey('5');
		sap.ui.getCore().applyChanges();

		this.clock.tick(1000);

		this.oIconTabHeader.$().width('200px');
		this.oIconTabHeader._fnResize();

		this.clock.tick(5000);
		var oTab = this.oIconTabHeader.getItems()[5];

		var bVisible = this.oIconTabHeader._isTabIntoView(oTab.$());

		assert.ok(bVisible, "Selected tab is visible");
	});

	QUnit.module("IconTabBar Selected Key",{
		beforeEach: function () {

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

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oIconTabBar.destroy();
			this.oIconTabBar = null;
		}
	});

	QUnit.test("Selection", function (assert) {
		assert.strictEqual(this.oIconTabBar.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabBar.setSelectedKey('');
		sap.ui.getCore().applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabBar.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabBar.setSelectedKey('InvalidKey');
		sap.ui.getCore().applyChanges();

		this.clock.tick(500);

		assert.strictEqual(this.oIconTabBar.$().find('.sapMITBSelected').length, 1, "A tab is selected");

		this.oIconTabBar.setSelectedKey('9');
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oIconTabBar._getIconTabHeader().oSelectedItem.getText(), 'Tab 9' , "Enabled tab is correctly selected");

		this.oIconTabBar.setSelectedKey('10');
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oIconTabBar._getIconTabHeader().oSelectedItem.getText(), 'Tab 9' , "Disabled tab is not selected");
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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oIconTabHeader.destroy();
			this.oIconTabHeader = null;
		}
	});

	QUnit.test("Remove Tab", function (assert) {
		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBFilter').length, 2, "2 tabs are displayed");

		this.oIconTabHeader.getItems()[0].setVisible(false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oIconTabHeader.$().find('.sapMITBFilter').length, 1, "1 tab are displayed");
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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header is in Cozy mode by default");

		oIconTabHeader.setTabDensityMode(IconTabDensityMode.Compact);
		sap.ui.getCore().applyChanges();
		assert.ok(oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header is in Compact mode");

		oIconTabHeader.setTabDensityMode(IconTabDensityMode.Inherit);
		sap.ui.getCore().applyChanges();
		assert.ok(!oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has to take the global mode which is Cozy");

		jQuery('body').addClass("sapUiSizeCompact");
		sap.ui.getCore().notifyContentDensityChanged();
		sap.ui.getCore().applyChanges();
		assert.ok(oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has to take the Compact mode from global scope");

		jQuery('body').removeClass("sapUiSizeCompact");
		sap.ui.getCore().applyChanges();
		jQuery('body').addClass("sapUiSizeCozy");
		sap.ui.getCore().notifyContentDensityChanged();
		sap.ui.getCore().applyChanges();
		assert.ok(!oIconTabHeader.$().hasClass("sapUiSizeCompact"), "Header has to take the Cozy mode from global scope");

		oIconTabHeader.setTabDensityMode(IconTabDensityMode.Compact);
		sap.ui.getCore().applyChanges();
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
			sap.ui.getCore().applyChanges();

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  sap.ui.getCore().byId("tabReorder1");
						case "droppedControl" :
							return sap.ui.getCore().byId("tabReorder3");
					}
				 }
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  sap.ui.getCore().byId("tabReorder1");
						case "droppedControl" :
							return sap.ui.getCore().byId("tabReorder3");
					}
				}
			};

			this.returnMockEvent = function(iKeyCode, sId) {
				var oMockEventTest = {
					keyCode: iKeyCode,
					srcControl: sap.ui.getCore().byId(sId)
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
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(39, "tabReorder1"));
		this.oIconTabHeader1.ondragrearranging(this.returnMockEvent(39, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right of last element", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Third tab", 'Third Tab is "Third Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(39, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Third tab", 'Third Tab is "Third Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left of first element", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT

		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(37, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Second tab", 'Second Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(37, "tabReorder2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Home", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Second tab", 'Second Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(36, "tabReorder2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + End", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(35, "tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", 'First Tab is "Last Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapincreasemodifiers", function(assert) {
		// Assert
		var oEventSpyIncrease = this.spy(this.oIconTabHeader, "onsapincreasemodifiers");
		assert.ok(oEventSpyIncrease.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapincreasemodifiers(this.returnMockEvent(39, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyIncrease.callCount === 1, "The method is skipped and the event went to the global KH");
	});
	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapdecreasemodifiers", function(assert) {
		// Assert
		var oEventSpyDecrease = this.spy(this.oIconTabHeader, "onsapdecreasemodifiers");
		assert.ok(oEventSpyDecrease.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapdecreasemodifiers(this.returnMockEvent(37, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyDecrease.callCount === 1, "The method is skipped and the event went to the global KH");
	});
	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsaphomemodifiers", function(assert) {
		// Assert
		var oEventSpyHome  = this.spy(this.oIconTabHeader, "onsaphomemodifiers");
		assert.ok(oEventSpyHome.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsaphomemodifiers(this.returnMockEvent(36, "tabReorder2"));
		// Assert
		assert.ok(oEventSpyHome.callCount === 1, "The method is skipped and the event went to the global KH");


	});
	QUnit.test("Drag&Drop Keyboard Handling: Event Calling: onsapendmodifiers", function(assert) {
		// Assert
		var oEventSpyEnd  = this.spy(this.oIconTabHeader, "onsapendmodifiers");
		assert.ok(oEventSpyEnd.callCount === 0, "The method is skipped and the event went to the global KH");
		//ACT
		this.oIconTabHeader.onsapendmodifiers(this.returnMockEvent(35, "tabReorder1"));
		// Assert
		assert.ok(oEventSpyEnd.callCount === 1, "The method is skipped and the event went to the global KH");

	});

	QUnit.module("Drag&Drop: RTL", {
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
			sap.ui.getCore().applyChanges();

			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  sap.ui.getCore().byId("tabReorder1");
						case "droppedControl" :
							return sap.ui.getCore().byId("tabReorder3");
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  sap.ui.getCore().byId("tabReorder1");
						case "droppedControl" :
							return sap.ui.getCore().byId("tabReorder3");
					}
				}
			};

			 this.returnMockEvent = function(iKeyCode, sId) {
				var oMockEventTest = {
					keyCode: iKeyCode,
					srcControl: sap.ui.getCore().byId(sId)
				};

				return oMockEventTest;
			};
			sap.ui.getCore().getConfiguration().setRTL(true);
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oIconTabHeader1 = this.oIconTabBar1.getAggregation("_header");


		},
		afterEach: function() {
			this.oIconTabBar.destroy();
			this.oIconTabHeader.destroy();
			this.oIconTabBar1.destroy();
			this.oIconTabHeader1.destroy();
			this.returnMockEvent = null;
			this.oMockEvent = null;
			this.oMockEvent2 = null;
			sap.ui.getCore().getConfiguration().setRTL(false);
		}
	});


	QUnit.test("Drag&Drop dropPosition: 'After' RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", "'Firs tab' is at last position");
	});

	QUnit.test("Drag&Drop dropPosition: 'Before' RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", "'Firs tab' is at the middle");
	});

	QUnit.test("Drag&Drop accessibility: RTL", function(assert) {
		// Assert
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 3');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-setsize"), "3" , 'Aria-setsize should be 3');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(39,"tabReorder2"));
		this.oIconTabHeader1.ondragrearranging(this.returnMockEvent(39,"tab2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		assert.strictEqual(this.oIconTabBar1.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tab1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Right of last element RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Third tab", 'Third Tab is "Third Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(39,"tabReorder3"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Second tab", 'Third Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder3").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 2');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left of first element RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(37,"tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", 'Second Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Arrow Left RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'Fisrt Tab is "Fisrt Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(37,"tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "First tab", 'First Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + Home RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Second tab", 'Second Tab is "Second Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder2").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(36,"tabReorder2"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Second tab", 'Second Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "2" , 'Aria-pointset should be 1');
	});
	QUnit.test("Drag&Drop Keyboard Handling: CTRL + End RTL", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "First tab", 'First Tab is "First Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "1" , 'Aria-pointset should be 1');
		//ACT
		this.oIconTabHeader.ondragrearranging(this.returnMockEvent(35,"tabReorder1"));
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "First tab", 'First Tab is "Last Tab"');
		assert.strictEqual(sap.ui.getCore().byId("tabReorder1").getDomRef().getAttribute("aria-posinset"), "3" , 'Aria-pointset should be 1');
	});

	QUnit.module("Drag&Drop: Overflow rearranging", {
		beforeEach: function() {
			this.oIconTabBar = getIconTabBarWithOverflowList();

			sap.ui.getCore().applyChanges();
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oSelectList = this.oIconTabHeader._getSelectList();
			this.oIconTabHeader._overflowButtonPress();
			var selectListItems = this.oSelectList.getAggregation("items");


			 function getSelectListId (iElement) {
			   return  selectListItems[iElement].sId;
			}

			this.oIconTabBar.placeAt('qunit-fixture');
			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  sap.ui.getCore().byId(getSelectListId(0));
						case "droppedControl" :
							return sap.ui.getCore().byId(getSelectListId(2));
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  sap.ui.getCore().byId(getSelectListId(0));
						case "droppedControl" :
							return sap.ui.getCore().byId(getSelectListId(2));
					}
				}
			};

			this.returnMockEvent = function(iKeyCode, sId) {
				var oMockEventTest = {
					keyCode: iKeyCode,
					srcControl: sap.ui.getCore().byId(sId)
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
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');

		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Tab 0", "'Tab 0' is at third position");
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), "Tab 0", "'Tab 0' is at third position");
	});
	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 0", 'First Tab is "First Tab"');
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 0", 'First Tab is "First Tab"');
		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Second tab'");
		assert.strictEqual(this.oIconTabBar.getItems()[1].getText(), "Tab 0", "'Firs tab' is at third position");
		assert.strictEqual(this.oSelectList.getItems()[1].getText(), "Tab 0", "'Firs tab' is at third position");
	});

	QUnit.module("Drag&Drop: Between IconTabHeader and overflow list", {
		beforeEach: function() {
			this.oIconTabBar = getIconTabBarWithOverflowList();

			sap.ui.getCore().applyChanges();
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oSelectList = this.oIconTabHeader._getSelectList();
			this.oIconTabHeader._overflowButtonPress();
			var selectListItems = this.oSelectList.getAggregation("items");


			function getSelectListId (iElement) {
				return  selectListItems[iElement].sId;
			}

			this.oIconTabBar.placeAt('qunit-fixture');
			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  sap.ui.getCore().byId(getSelectListId(0));
						case "droppedControl" :
							return sap.ui.getCore().byId("idTab3");
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  sap.ui.getCore().byId(getSelectListId(0));
						case "droppedControl" :
							return sap.ui.getCore().byId("idTab3");
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
		sap.ui.getCore().applyChanges();

		var oOverflowButton = this.oIconTabHeader._getOverflowButton();

		assert.ok(!oOverflowButton.$().hasClass("sapMBtnDragOver"), "Overflow button has default state");
		this.oIconTabHeader._handleOnDragOver({preventDefault: function () {}});
		assert.ok(oOverflowButton.$().hasClass("sapMBtnDragOver"), "Overflow button is in 'drag over' state ");
		this.oIconTabHeader._handleOnDragLeave();
		assert.ok(!oOverflowButton.$().hasClass("sapMBtnDragOver"), "Overflow button has default state");
	});

	QUnit.test("Drag&Drop dropPosition: 'After'", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');

		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oIconTabBar.getItems()[3].getText(), "Tab 0", "'Tab 0' is at last position");
		assert.strictEqual(this.oSelectList.getItems()[3].getText(), "Tab 0", "'Tab 0' is at last position");
	});
	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		// Act
		this.oIconTabHeader._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 1", "In 'Tab 0' position is 'Tab 1'");
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 1", "In 'Tab ' position is 'Tab 1'");
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Tab 0", "'Tab 0' is at third position");
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), "Tab 0", "'Tab 0' is at third position");
	});

	QUnit.module("Drag&Drop: Between overflow list and IconTabHeader", {
		beforeEach: function() {
			this.oIconTabBar = getIconTabBarWithOverflowList();

			sap.ui.getCore().applyChanges();
			this.oIconTabHeader = this.oIconTabBar.getAggregation("_header");
			this.oSelectList = this.oIconTabHeader._getSelectList();
			this.oIconTabHeader._overflowButtonPress();
			var selectListItems = this.oSelectList.getAggregation("items");


			function getSelectListId (iElement) {
				return  selectListItems[iElement].sId;
			}

			this.oIconTabBar.placeAt('qunit-fixture');
			this.oMockEvent = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "After";
						case "draggedControl" :
							return  sap.ui.getCore().byId("idTab0");
						case "droppedControl" :
							return sap.ui.getCore().byId(getSelectListId(3));
					}
				}
			};

			this.oMockEvent2 = {
				getParameter: function(parameter) {
					switch (parameter) {
						case "dropPosition" :
							return "Before";
						case "draggedControl" :
							return  sap.ui.getCore().byId("idTab0");
						case "droppedControl" :
							return sap.ui.getCore().byId(getSelectListId(3));
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
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');

		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oIconTabBar.getItems()[3].getText(), "Tab 0", "'Tab 0' is at forth position");
		assert.strictEqual(this.oSelectList.getItems()[3].getText(), "Tab 0", "'Tab 0' is at forth position");
	});
	QUnit.test("Drag&Drop dropPosition: 'Before'", function(assert) {
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 0", 'First Tab is "Tab 0"');
		// Act
		this.oSelectList._handleDragAndDrop(this.oMockEvent2);
		// Assert
		assert.strictEqual(this.oIconTabBar.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oSelectList.getItems()[0].getText(), "Tab 1", "In 'First tab' position is 'Tab 1'");
		assert.strictEqual(this.oIconTabBar.getItems()[2].getText(), "Tab 0", "'Tab 0' is at third position");
		assert.strictEqual(this.oSelectList.getItems()[2].getText(), "Tab 0", "'Tab 0' is at third position");
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
});