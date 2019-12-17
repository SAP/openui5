/*global QUnit, sinon */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Core",
	"sap/ui/core/HTML",
	"sap/ui/layout/cssgrid/CSSGrid",
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridBasicLayout",
	"sap/ui/layout/cssgrid/GridResponsiveLayout",
	"sap/ui/layout/cssgrid/GridBoxLayout",
	"sap/ui/layout/cssgrid/GridSettings",
	"sap/ui/layout/cssgrid/ResponsiveColumnLayout",
	"sap/ui/layout/cssgrid/ResponsiveColumnItemLayoutData",
	"sap/f/GridList",
	"sap/m/CustomListItem",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device"
], function (
	jQuery,
	Core,
	HTML,
	CSSGrid,
	GridLayoutBase,
	GridBasicLayout,
	GridResponsiveLayout,
	GridBoxLayout,
	GridSettings,
	ResponsiveColumnLayout,
	ResponsiveColumnItemLayoutData,
	GridList,
	CustomListItem,
	Text,
	JSONModel,
	Sorter,
	qutils,
	KeyCodes,
	Device
) {
	"use strict";

	var EDGE_VERSION_WITH_GRID_SUPPORT = 16;
	var bBrowserSupportGrid = !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);

	function getGridSettings() {
		return {
			gridTemplateColumns: "repeat(auto-fit, 10rem)",
			gridTemplateRows: "3rem",
			gridAutoRows: "1fr",
			gridGap: "1rem 1rem",
			gridAutoFlow: "ColumnDense"
		};
	}

	function getExpectedStyles() {
		return {
			"display": "grid",
			"grid-auto-columns": "",
			"grid-auto-flow": "column dense",
			"grid-auto-rows": "1fr",
			"grid-column-gap": "",
			"grid-gap": "1rem 1rem",
			"grid-row-gap": "",
			"grid-template-columns": "repeat(auto-fit, 10rem)",
			"grid-template-rows": "3rem"
		};
	}

	QUnit.module("GridLayoutBase - Basic", {
		beforeEach: function () {
			this.oGridLayoutBase = new GridLayoutBase();
			this.oRenderManagerMock = {
				addStyle: function (sKey, sValue) {
					this.styles[sKey] = sValue;
				},
				styles: {}
			};
		},
		afterEach: function () {
			this.oGridLayoutBase.destroy();
			this.oGridLayoutBase = null;
			this.oRenderManagerMock = null;
		}
	});

	QUnit.test("isResponsive", function (assert) {
		assert.notOk(this.oGridLayoutBase.isResponsive(), "Should NOT be responsive");
	});

	QUnit.test("getActiveGridSettings", function (assert) {
		assert.throws(this.oGridLayoutBase.getActiveGridSettings, "Should throw an error when getActiveGridSettings function is not implemented");
	});

	QUnit.test("renderSingleGridLayout - with non-responsive GridLayout", function (assert) {

		// Arrange
		var oGridLayout = new GridBasicLayout(getGridSettings());
		var oExpectedStyles = getExpectedStyles();

		// Act
		oGridLayout.renderSingleGridLayout(this.oRenderManagerMock);

		// Assert
		for (var sProp in oExpectedStyles) {
			assert.equal(this.oRenderManagerMock.styles[sProp], oExpectedStyles[sProp], "Should have set value '" + oExpectedStyles[sProp] + "' for property " + sProp);
		}
	});

	QUnit.test("renderSingleGridLayout - with responsive GridLayout", function (assert) {

		// Arrange
		var oGridLayout = new GridResponsiveLayout({
			layout: getGridSettings(),
			layoutS: getGridSettings(),
			layoutM: getGridSettings(),
			layoutL: getGridSettings(),
			layoutXL: getGridSettings(),
			containerQuery: true
		});

		// Act
		oGridLayout.renderSingleGridLayout(this.oRenderManagerMock);

		// Assert
		assert.equal(Object.keys(this.oRenderManagerMock.styles).length, 1, "Should have only one property set when the GridLayout is responsive");
		assert.equal(this.oRenderManagerMock.styles["display"], "grid", "Should have 'display' property set to 'grid'");
	});

	QUnit.module("GridLayoutBase - Apply layout", {
		beforeEach: function () {
			var that = this;
			this.oGridLayoutBase = new GridLayoutBase();
			this.oRenderManagerMock = {
				addStyle: function (sKey, sValue) {
					this.styles[sKey] = sValue;
				},
				styles: {}
			};
			this.oHTMLElementMock = {
				style: {
					_styles: {
						"display": "grid",
						"grid-auto-columns": "",
						"grid-auto-flow": "column dense",
						"grid-auto-rows": "1fr",
						"grid-column-gap": "",
						"grid-gap": "1rem 1rem",
						"grid-row-gap": "",
						"grid-template-columns": "repeat(auto-fit, 10rem)",
						"grid-template-rows": "3rem"
					},
					getProperty: function (sKey) {
						return this._styles[sKey];
					},
					setProperty: function (sKey, sValue) {
						this._styles[sKey] = sValue;
					},
					removeProperty: function (sKey) {
						delete this._styles[sKey];
					}
				},
				getDomRef: function () {
					return this;
				}
			};
			this.oControlMock = {
				getDomRef: function () {
					return that.oHTMLElementMock;
				}
			};
			sinon.spy(GridLayoutBase.prototype, "_applySingleGridLayout");
			sinon.spy(GridLayoutBase.prototype, "_setGridLayout");
			sinon.spy(GridLayoutBase.prototype, "_removeGridLayout");
		},
		afterEach: function () {
			this.oGridLayoutBase.destroy();
			this.oGridLayoutBase = null;
			this.oRenderManagerMock = null;
			this.oControlMock = null;
			this.oHTMLElementMock = null;
			GridLayoutBase.prototype._applySingleGridLayout.restore();
			GridLayoutBase.prototype._setGridLayout.restore();
			GridLayoutBase.prototype._removeGridLayout.restore();
		}
	});

	QUnit.test("applyGridLayout - no items", function (assert) {

		// Act
		this.oGridLayoutBase.applyGridLayout();

		// Assert
		assert.ok(GridLayoutBase.prototype._applySingleGridLayout.notCalled, "Should not call _applySingleGridLayout when no items are provided");
	});

	QUnit.test("applyGridLayout - with items and no GridSettings", function (assert) {

		// Arrange
		this.oGridLayoutBase.getActiveGridSettings = function () {
			return null;
		};

		// Act
		this.oGridLayoutBase.applyGridLayout([this.oControlMock]);

		// Assert
		assert.ok(GridLayoutBase.prototype._applySingleGridLayout.calledOnce, "Should call _applySingleGridLayout once");
		assert.ok(GridLayoutBase.prototype._setGridLayout.notCalled, "Should NOT call _setGridLayout");
		assert.ok(GridLayoutBase.prototype._removeGridLayout.calledOnce, "Should call _removeGridLayout once");
		assert.equal(Object.keys(this.oHTMLElementMock.style._styles).length, 1, "Should have one style");
		assert.equal(this.oHTMLElementMock.style._styles["display"], "grid", "Should have display:grid");
	});

	QUnit.test("applyGridLayout - with items and GridSettings", function (assert) {

		// Arrange
		this.oHTMLElementMock.style._styles = {};
		var oExpectedStyles = getExpectedStyles();
		this.oGridLayoutBase.getActiveGridSettings = function () {
			return new GridSettings(getGridSettings());
		};

		// Act
		this.oGridLayoutBase.applyGridLayout([this.oControlMock]);

		// Assert
		assert.ok(GridLayoutBase.prototype._applySingleGridLayout.calledOnce, "Should call _applySingleGridLayout once");
		assert.ok(GridLayoutBase.prototype._setGridLayout.calledOnce, "Should call _setGridLayout once");
		assert.ok(GridLayoutBase.prototype._removeGridLayout.notCalled, "Should NOT call _removeGridLayout");
		assert.equal(Object.keys(this.oHTMLElementMock.style._styles).length, (Object.keys(oExpectedStyles).length - 2), "Should have expected number of styles (all minus 'grid-column-gap' and 'grid-row-gap')");

		for (var sProp in oExpectedStyles) {
			if (sProp == "grid-column-gap" || sProp == "grid-row-gap") {
				continue;
			}
			assert.equal(this.oHTMLElementMock.style._styles[sProp], oExpectedStyles[sProp], "Should have set value '" + oExpectedStyles[sProp] + "' for property " + sProp);
		}
	});

	QUnit.module("GridResponsiveLayout", {
		beforeEach: function () {
			this.fnLayoutChangeHandler = sinon.spy();
			this.oGridLayout = new GridResponsiveLayout({
				layoutChange: this.fnLayoutChangeHandler,
				containerQuery: true
			});
			sinon.spy(this.oGridLayout, "applySizeClass");
		},
		afterEach: function () {
			this.oGridLayout.applySizeClass.restore();
			this.oGridLayout.destroy();
			this.oGridLayout = null;
			this.fnLayoutChangeHandler = null;
		}
	});

	QUnit.test("Init", function (assert) {
		assert.ok(this.oGridLayout.isResponsive(), "Should be responsive");
		assert.equal(this.oGridLayout._sActiveLayout, "layout", "Should have active layout with value 'layout'");
		assert.notOk(this.oGridLayout.getActiveGridSettings(), "Should have no Grid settings");
	});

	QUnit.test("_getLayoutToApply", function (assert) {

		// Arrange
		this.oGridLayout.setLayout(new GridSettings(getGridSettings()));
		this.oGridLayout.setLayoutL(new GridSettings(getGridSettings()));

		// Assert
		assert.equal(this.oGridLayout._getLayoutToApply("layout"), "layout", "Should return 'layout'");
		assert.equal(this.oGridLayout._getLayoutToApply("layoutS"), "layout", "Should fall back to 'layout' when layoutS is empty");
		assert.equal(this.oGridLayout._getLayoutToApply("layoutM"), "layout", "Should fall back to 'layout' when layoutM is empty");
		assert.equal(this.oGridLayout._getLayoutToApply("layoutL"), "layoutL", "Should return 'layoutL' as it is set");
		assert.equal(this.oGridLayout._getLayoutToApply("layoutXL"), "layout", "Should fall back to 'layout' when layoutXL is empty");
	});

	QUnit.test("onGridAfterRendering - active layout not changed", function (assert) {

		// Arrange
		this.oGridLayout.setLayout(new GridSettings(getGridSettings()));
		var $GridMock = jQuery("<div></div>", { width: 500 });
		var oGridMock = {
			$: function () {
				return $GridMock;
			}
		};

		// Act
		this.oGridLayout.onGridAfterRendering(oGridMock);

		// Assert
		assert.ok(this.fnLayoutChangeHandler.notCalled, "Should not trigger layoutChange onAfterRendering of the grid");
		assert.equal(this.oGridLayout._sActiveLayout, "layout", "Should not change the active layout");
		assert.ok(this.oGridLayout.applySizeClass.calledOnce, "Should add size class when layout is applied");
		assert.equal(this.oGridLayout.applySizeClass.getCall(0).args[1], "sapUiLayoutCSSGridS", "Should add class sapUiLayoutCSSGridS for 'S' size");
	});

	QUnit.test("onGridAfterRendering - layout changed from 'layout' to 'layoutS'", function (assert) {

		// Arrange
		this.oGridLayout.setLayout(new GridSettings(getGridSettings()));
		this.oGridLayout.setLayoutS(new GridSettings(getGridSettings()));

		var $GridMock = jQuery("<div></div>", { width: 500 });
		var oGridMock = {
			$: function () {
				return $GridMock;
			}
		};

		// Act
		this.oGridLayout.onGridAfterRendering(oGridMock);

		// Assert
		assert.ok(this.fnLayoutChangeHandler.notCalled, "Should not trigger layoutChange onAfterRendering of the grid");
		assert.equal(this.oGridLayout._sActiveLayout, "layoutS", "Should change the active layout to S");
		assert.ok(this.oGridLayout.applySizeClass.calledOnce, "Should add size class when layout is applied");
		assert.equal(this.oGridLayout.applySizeClass.getCall(0).args[1], "sapUiLayoutCSSGridS", "Should add class sapUiLayoutCSSGridS for 'S' size");
	});

	QUnit.test("onGridAfterRendering - layout changed from 'layoutS' to 'layout'", function (assert) {

		// Arrange
		this.oGridLayout.setLayout(new GridSettings(getGridSettings()));
		this.oGridLayout.setLayoutS(new GridSettings(getGridSettings()));

		var $GridMock = jQuery("<div></div>", { width: 500 });
		var oGridMock = {
			$: function () {
				return $GridMock;
			}
		};

		// Act
		this.oGridLayout.onGridAfterRendering(oGridMock);
		$GridMock.width(1000);
		this.oGridLayout.onGridAfterRendering(oGridMock);

		// Assert
		assert.ok(this.fnLayoutChangeHandler.notCalled, "Should not trigger layoutChange onAfterRendering of the grid");
		assert.equal(this.oGridLayout._sActiveLayout, "layout", "Should change to 'layout'");
		assert.ok(this.oGridLayout.applySizeClass.calledTwice, "Should add size class when layout is applied");
		assert.equal(this.oGridLayout.applySizeClass.getCall(0).args[1], "sapUiLayoutCSSGridS", "Should add class sapUiLayoutCSSGridS for 'S' size");
		assert.equal(this.oGridLayout.applySizeClass.getCall(1).args[1], "sapUiLayoutCSSGridM", "Should add class sapUiLayoutCSSGridM for 'M' size");
	});

	QUnit.test("onGridResize - Resize Event size 0", function (assert) {

		// Arrange
		var oResizeEventMock = {
			size: {
				width: 0
			}
		};
		sinon.spy(GridResponsiveLayout.prototype, "setActiveLayout");

		// Act
		this.oGridLayout.onGridResize(oResizeEventMock);

		// Assert
		assert.ok(GridResponsiveLayout.prototype.setActiveLayout.notCalled, "Should NOT call setActiveLayout when Resize Event size is 0");

		// Cleanup
		GridResponsiveLayout.prototype.setActiveLayout.restore();
	});

	QUnit.test("onGridResize - Resize Event", function (assert) {

		// Arrange
		var $GridMock = jQuery("<div></div>", { width: 1000 });
		var oGridMock = {
			$: function () {
				return $GridMock;
			}
		};
		var oResizeEventMock = {
			size: {
				width: 1000
			},
			control: oGridMock
		};

		this.oGridLayout.setLayoutM(new GridSettings(getGridSettings()));
		sinon.spy(GridResponsiveLayout.prototype, "setActiveLayout");

		// Act
		this.oGridLayout.onGridResize(oResizeEventMock);

		// Assert
		assert.ok(GridResponsiveLayout.prototype.setActiveLayout.calledOnce, "Should call setActiveLayout when the size of the Grid have changed");
		assert.ok(this.fnLayoutChangeHandler.calledOnce, "Should trigger layoutChange onResize of the grid");
		assert.equal(this.oGridLayout._sActiveLayout, "layoutM", "Should change to 'layoutM'");
		assert.ok(this.oGridLayout.applySizeClass.calledOnce, "Should add size class when layout is applied");
		assert.equal(this.oGridLayout.applySizeClass.getCall(0).args[1], "sapUiLayoutCSSGridM", "Should add class sapUiLayoutCSSGridM for 'M' size");

		// Cleanup
		GridResponsiveLayout.prototype.setActiveLayout.restore();
	});

	QUnit.module("GridBoxLayout", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("When Grid (GridList control) is with Grouping", function (assert) {
		var oGridBoxLayout = new GridBoxLayout();
		var data = [
			{ title: "Grid item title 1", subtitle: "Subtitle 1", group: "Group A" },
			{ title: "Grid item title 2", subtitle: "Subtitle 2", group: "Group B" }];
			var model = new JSONModel();
			model.setData(data);
			sap.ui.getCore().setModel(model);
		var oGridList = new GridList("gListGrouping", {
			customLayout: oGridBoxLayout,
			items: {
				path: '/',
				sorter: new Sorter('group', false, true),
				template: new CustomListItem({
					content: [
						new Text({text: "{subtitle}"})
					]
				})
			}
		});

		oGridList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var id = "#" + oGridList.sId + "-listUl";
		var sGridAutoRows = getComputedStyle(document.querySelector(id)).gridAutoRows;
		var isCSSGridSupported = oGridBoxLayout.isGridSupportedByBrowser();
		assert.equal(oGridList.getCustomLayout().getMetadata()._sClassName, "sap.ui.layout.cssgrid.GridBoxLayout", "GridBoxLayout is applied");
		if (isCSSGridSupported) {
			assert.equal(sGridAutoRows, "auto",  "Height of the rows are calculated and CSS Grid property 'grid-auto-rows' is not set.");
		} else {
			assert.equal(sGridAutoRows, undefined,  "CSS Grid is not supported for this browser version. Height of the rows are calculated");
		}
	});


	QUnit.test("When (GridList control) is without Grouping", function (assert) {
		var oGridBoxLayout = new GridBoxLayout();
		var data = [
			{ title: "Grid item title 1", subtitle: "Subtitle 1", group: "Group A" },
			{ title: "Grid item title 2", subtitle: "Subtitle 2", group: "Group B" }];
			var model = new JSONModel();
			model.setData(data);
			sap.ui.getCore().setModel(model);
		var oGridList = new GridList("gListNoGrouping", {
			customLayout: oGridBoxLayout,
			items: {
				path: '/',
				template: new CustomListItem({
					content: [
								new Text({text: "{subtitle}"})
					]
				})
			}
		});

		oGridList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var id = "#" + oGridList.sId + "-listUl";
		var sGridAutoRows = getComputedStyle(document.querySelector(id)).gridAutoRows;
		var isCSSGridSupported = oGridBoxLayout.isGridSupportedByBrowser();
		assert.equal(oGridList.getCustomLayout().getMetadata()._sClassName, "sap.ui.layout.cssgrid.GridBoxLayout", "GridBoxLayout is applied");
		if (isCSSGridSupported) {
			assert.equal(sGridAutoRows, "1fr",  "Height of the rows comes from CSS Grid property 'grid-auto-rows'");
		} else {
			assert.equal(sGridAutoRows, undefined,  "CSS Grid is not supported for this browser version. Height of the rows are calculated");
		}
	});

	QUnit.test("Is class correct depending on CSS Grid support", function (assert) {
		var oGridBoxLayout = new GridBoxLayout();
		var oGridList = new GridList("gListClass", {
			customLayout: oGridBoxLayout
		});

		oGridList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var id = "#" + oGridList.sId + "-listUl";
		var isCSSGridSupported = oGridBoxLayout.isGridSupportedByBrowser();

		if (isCSSGridSupported) {
			assert.equal(document.querySelector(id).classList.contains("sapUiLayoutCSSGridBoxLayoutContainer"), true,  "'sapUiLayoutCSSGridBoxLayoutContainer' class is applied'");
			assert.equal(document.querySelector(id).classList.contains("sapUiLayoutCSSGridBoxLayoutPolyfill"), false,  "'sapUiLayoutCSSGridBoxLayoutPolyfill' class is not applied");
		} else {
			assert.equal(document.querySelector(id).classList.contains("sapUiLayoutCSSGridBoxLayoutPolyfill"), true,  "'sapUiLayoutCSSGridBoxLayoutPolyfill' class is applied'");
			assert.equal(document.querySelector(id).classList.contains("sapUiLayoutCSSGridBoxLayoutContainer"), false,  "'sapUiLayoutCSSGridBoxLayoutContainer' class is not applied'");
		}
	});

	QUnit.test("Is growing works correct", function (assert) {
		var oGridBoxLayout = new GridBoxLayout();
		var data = [
			{ title: "Grid item title 1", subtitle: "Subtitle 1"},
			{ title: "Grid item title 2", subtitle: "Subtitle 2"}];
			var model = new JSONModel();
			model.setData(data);
			sap.ui.getCore().setModel(model);

			var oGridList = new GridList("gListGrowing", {
			customLayout: oGridBoxLayout,
			growing: true,
			growingThreshold: 1,
			items: {
				path: '/',
				template: new CustomListItem({
					content: [
								new Text({text:"{subtitle}"})
					]
				})
			}
		});

		oGridList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var id = oGridList.sId + "-listUl";

		assert.equal(document.getElementById(id).childElementCount, 1,  "there is one item in the list");
		sap.ui.test.qunit.triggerKeydown(document.getElementById("gListGrowing-trigger"), KeyCodes.ENTER);
		assert.equal(document.getElementById(id).childElementCount, 2,  "there are two items in the list");
	});

	QUnit.test("Is boxWidth works correct", function (assert) {
		var data = [
			{ title: "Grid item title 1", subtitle: "Subtitle 1"},
			{ title: "Grid item title 2", subtitle: "Subtitle 2"}];
			var model = new JSONModel();
			model.setData(data);
			sap.ui.getCore().setModel(model);

			var oGridList = new GridList("gListResizing", {
			customLayout: new GridBoxLayout({boxWidth: "100px"}),
			growing: true,
			width: "500px",
			items: {
				path: '/',
				template: new CustomListItem({
					content: [
						new Text({text: "{subtitle}"})
					]
				})
			}
		});

		oGridList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oGridList.getItems()[0].getDomRef().clientWidth, 100, "boxWidth is set correctly to the GridBoxLayout");
	});

	QUnit.module("ResponsiveColumnLayout", {
		beforeEach: function () {
			this.fnLayoutChangeHandler = sinon.spy();
			this.oGridLayout = new ResponsiveColumnLayout({
				layoutChange: this.fnLayoutChangeHandler
			});
			sinon.spy(this.oGridLayout, "_applyLayout");
		},
		afterEach: function () {
			this.oGridLayout._applyLayout.restore();
			this.oGridLayout.destroy();
			this.oGridLayout = null;
			this.fnLayoutChangeHandler = null;
		}
	});

	QUnit.test("Init", function (assert) {
		assert.ok(this.oGridLayout.isResponsive(), "Should be responsive");
		assert.notOk(this.oGridLayout.getActiveGridSettings(), "Should have no Grid settings");
	});

	QUnit.test("onGridAfterRendering", function (assert) {

		// Arrange
		var $GridMock = jQuery("<div></div>", { width: 500 });
		var oGridMock = {
			$: function () {
				return $GridMock;
			},
			isA: function () {
				return false;
			},
			getItems: function () {
				return [];
			},
			removeStyleClass: function () { },
			addStyleClass: function () { }
		};

		// Act
		this.oGridLayout.onGridAfterRendering(oGridMock);

		// Assert
		assert.ok(this.fnLayoutChangeHandler.notCalled, "Should not trigger layoutChange onAfterRendering of the grid");
		assert.ok(this.oGridLayout._applyLayout.calledOnce, "Should add size class when layout is applied");
	});

	QUnit.test("Resize", function (assert) {

		// Arrange
		var $GridMock = jQuery("<div><div id='cssGrid'></div></div>");

		var oGridMock = {
			$: function () {
				return $GridMock.find("#cssGrid");
			},
			isA: function () {
				return false;
			},
			getItems: function () {
				return [];
			},
			removeStyleClass: function () { },
			addStyleClass: function () { }
		};

		var oResizeEventMock = {
			size: {
				width: 1000
			},
			control: oGridMock
		};



		$GridMock.css({padding: 100});
		$GridMock.width(1300);

		this.oGridLayout.onGridResize(oResizeEventMock);
		assert.ok(this.fnLayoutChangeHandler.calledOnce, "Trigger layoutChange onAfterRendering of the grid");
		assert.ok(this.oGridLayout._applyLayout.calledOnce, "Should add size class when layout is applied");
		assert.equal(this.oGridLayout._sCurrentLayoutClassName, "sapUiLayoutCSSResponsiveColumnLayoutXL", "XL class name is correct");

		$GridMock.width(900);
		this.oGridLayout.onGridResize(oResizeEventMock);
		assert.ok(this.fnLayoutChangeHandler.calledTwice, "Trigger layoutChange");
		assert.equal(this.oGridLayout._sCurrentLayoutClassName, "sapUiLayoutCSSResponsiveColumnLayoutL", "L class name is correct");

		$GridMock.width(800);
		this.oGridLayout.onGridResize(oResizeEventMock);
		assert.strictEqual(this.fnLayoutChangeHandler.callCount, 3, "Trigger layoutChange");
		assert.equal(this.oGridLayout._sCurrentLayoutClassName, "sapUiLayoutCSSResponsiveColumnLayoutM", "M class name is correct");

		$GridMock.width(300);
		this.oGridLayout.onGridResize(oResizeEventMock);
		assert.strictEqual(this.fnLayoutChangeHandler.callCount, 4, "Trigger layoutChange");
		assert.equal(this.oGridLayout._sCurrentLayoutClassName, "sapUiLayoutCSSResponsiveColumnLayoutS", "S class name is correct");
	});

	QUnit.module("ResponsiveColumnItemLayoutData", {
		beforeEach: function () {
			this.oGrid = new CSSGrid({
				items: [
					new HTML({ content: "<div></div>" }),
					new HTML({ content: "<div></div>" }),
					new HTML({ content: "<div></div>" })
				]
			});
			this.oLayoutData = new ResponsiveColumnItemLayoutData({
				rows: 4,
				columns: 2
			});
			this.oItem = this.oGrid.getItems()[0];
			this.oGrid.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			if (this.oLayoutData) {
				this.oLayoutData.destroy();
			}
		}
	});

	QUnit.test("Set item layoutData", function (assert) {

		// Arrange
		sinon.spy(GridLayoutBase, "setItemStyles");
		sinon.spy(this.oGrid, "onLayoutDataChange");

		// Act
		this.oItem.setLayoutData(this.oLayoutData);
		Core.applyChanges();

		// Assert
		assert.ok(GridLayoutBase.setItemStyles.calledOnce, "Should update item styles on layout data change");
		assert.ok(this.oGrid.onLayoutDataChange.calledOnce, "Should call layoutDataChange handler");

		if (bBrowserSupportGrid) {
			assert.ok(this.oItem.getDomRef().style.getPropertyValue("grid-row").indexOf("span 4") > -1,"grid-row property is correct");
			assert.ok(this.oItem.getDomRef().style.getPropertyValue("grid-column").indexOf("span 2") > -1, "grid-column property is correct");
		}

		// Cleanup
		GridLayoutBase.setItemStyles.restore();
		this.oGrid.onLayoutDataChange.restore();
	});

	QUnit.test("Remove item layoutData", function (assert) {

		// Arrange
		this.oItem.setLayoutData(this.oLayoutData);
		Core.applyChanges();

		// Act
		this.oItem.setLayoutData(null);

		Core.applyChanges();

		// Assert
		assert.notOk(this.oItem.getDomRef().style.getPropertyValue("grid-row"), "Should NOT have grid-row property");
		assert.notOk(this.oItem.getDomRef().style.getPropertyValue("grid-column"), "Should NOT have grid-column property");
	});

	if (bBrowserSupportGrid) {
		QUnit.test("Change item layoutData", function (assert) {

			// Arrange
			this.oItem.setLayoutData(this.oLayoutData);
			Core.applyChanges();

			// Act
			this.oLayoutData.setRows(5);

			// Assert
			var sGridRow = this.oItem.getDomRef().style.getPropertyValue("grid-row");

			// Check with indexOf as the browser normalizes the property value.
			assert.ok(sGridRow && sGridRow.indexOf("span 5") > -1, "Should have updated the grid-row property");
		});
	}
});