/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/chart/MeasureItem",
	"sap/ui/mdc/chart/DimensionItem",
	"sap/m/Button",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/mdc/chart/ToolbarHandler",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/core/library"
],
function(
	Core,
	Chart,
	MeasureItem,
	DimensionItem,
	Button,
	UIComponent,
	ComponentContainer,
	ToolbarHandler,
	Sorter,
	Filter,
	CoreLibrary
) {
	"use strict";

	var HasPopup = CoreLibrary.aria.HasPopup;

	QUnit.module("sap.ui.mdc.Chart: Simple Properties", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {});
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oChart);
		assert.ok(this.oChart.isA("sap.ui.mdc.IxState"));

	});

	QUnit.test("invoking the .getItemsByKeys() method should return the matching items", function(assert) {

		// arrange
		this.oChart.addItem(new DimensionItem({
			key: "lorem"
		}));
		this.oChart.addItem(new DimensionItem({
			key: "ipsum"
		}));
		this.oChart.addItem(new MeasureItem({
			key: "sunt"
		}));

		// act
		var aItems = this.oChart.getItemsByKeys(["lorem", "ipsum"]);

		// assert
		assert.strictEqual(aItems.length, 2);
		assert.strictEqual(aItems[0].getKey(), "lorem");
		assert.strictEqual(aItems[1].getKey(), "ipsum");
	});

	QUnit.test("Create MDC Chart (default) after initialise", function(assert) {
		var done = assert.async();
		assert.ok(this.oChart, "The chart is created");

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			assert.ok(oChart, "After loading the chart library there is an inner chart");
			assert.ok(this.getAggregation("_toolbar"), "The chart has a toolbar");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Setting the chart type", function(assert) {
		var done = assert.async();

		this.oChart.setChartType("bullet");
		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			assert.ok(oChart, "After loading the chart library there is an inner chart");
			var sChartType = oChart.getChartType();
			assert.equal(sChartType, "bullet", "The chart type is forwarded to the inner chart");
			this.setChartType("column");
			sChartType = oChart.getChartType();
			assert.equal(sChartType, "column", "If the inner chart is there then the type is directly feed");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Setting the p13nMode", function(assert) {

		var done = assert.async();
		assert.equal(this.oChart.getP13nMode(), undefined, "The chart should not use p13nMode by default");
		this.oChart.setP13nMode([
			"Item", "Sort", "Type"
		]);

		this.oChart.initialized().then(function() {
			var aToolbarButtons = this.oChart.getAggregation("_toolbar").getEnd();
			assert.equal(aToolbarButtons[aToolbarButtons.length - 1].getIcon(), "sap-icon://vertical-bar-chart", "correct button has been added to the chart toolbar");
			assert.equal(aToolbarButtons[aToolbarButtons.length - 1].getAriaHasPopup(), HasPopup.ListBox, "button has correct ariaHasPopup value");
			assert.equal(aToolbarButtons[aToolbarButtons.length - 2].getIcon(), "sap-icon://sort", "correct button has been added to the chart toolbar");
			assert.equal(aToolbarButtons[aToolbarButtons.length - 2].getAriaHasPopup(), HasPopup.ListBox, "button has correct ariaHasPopup value");
			assert.equal(aToolbarButtons[aToolbarButtons.length - 3].getIcon(), "sap-icon://action-settings", "correct button has been added to the chart toolbar");
			assert.equal(aToolbarButtons[aToolbarButtons.length - 3].getAriaHasPopup(), HasPopup.ListBox, "button has correct ariaHasPopup value");
			done();
		}.bind(this));

	});

	QUnit.test("Setting the height", function(assert) {
		var done = assert.async();

		this.oChart.setHeight("1300px");
		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			assert.ok(oChart, "After loading the chart library there is an inner chart");
			var iHeight = oChart.getHeight();
			assert.equal(iHeight, "100%", "The inner chart remains in height 100%");
			this.setHeight("700px");
			iHeight = oChart.getHeight();
			assert.equal(iHeight, "100%", "The inner chart remains in height 100%");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Setting the selection mode", function(assert) {
		var done = assert.async();

		// act
		this.oChart.setSelectionMode("SINGLE");

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			assert.ok(oChart, "After loading the chart library there is an inner chart");
			var sSelectionMode = oChart.getSelectionMode();
			assert.equal(sSelectionMode, "SINGLE", "The selection mode is forwarded to the inner chart");
			this.setSelectionMode("NONE");
			sSelectionMode = oChart.getSelectionMode();
			assert.equal(sSelectionMode, "NONE", "If the inner chart is there then the width is directly feed");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Set a custom NoData text", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var sNoData = "This is a test of custom NoData texts";
			this.setNoDataText(sNoData);

			assert.equal(this.getNoDataText(), sNoData, "Custom NoData text successfully set on MDC Chart");
			assert.equal(oChart.getCustomMessages().NO_DATA, sNoData, "Custom NoData text successfully set on the inner Chart");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Test NoData text handling", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			var sTestFilter = "testFilter";
			this.setFilter(sTestFilter);

			//TEST initial setup without FilterBar
			var fIsChartInnerBoundStub = sinon.stub(this, "isInnerChartBound").returns(false);
			var fGetFilterStub = sinon.stub(this, "getFilter").returns("");
			this._updateInnerChartNoDataText();
			assert.equal(oChart.getCustomMessages().NO_DATA, oRb.getText("chart.NO_DATA"), "Initial NoData text from messagebundle correctly set for scenario without FilterBar");

			//TEST initial setup with FilterBar
			fGetFilterStub.restore();
			this._updateInnerChartNoDataText();
			assert.equal(oChart.getCustomMessages().NO_DATA, oRb.getText("chart.NO_DATA_WITH_FILTERBAR"), "Initial NoData text from messagebundle correctly set for scenario with FilterBar");

			//TEST no results after filtering
			fIsChartInnerBoundStub.returns(true);
			this._updateInnerChartNoDataText();
			assert.equal(oChart.getCustomMessages().NO_DATA, oRb.getText("chart.NO_RESULTS"), "NoData text from messagebundle correctly set when no results found");

			fIsChartInnerBoundStub.restore();
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Test rebinding of MDC Chart", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			//Test in case inner chart is not bound yet.
			var fIsChartInnerBoundStub = sinon.stub(this, "isInnerChartBound").returns(false);
			var fBindAggregationStub = sinon.stub(this, "bindAggregation");
			var fUpdateInnerChartNoDataText = sinon.spy(this, "_updateInnerChartNoDataText");
			var fRenderOverlay = sinon.spy(this, "_renderOverlay");

			this.rebind();
			assert.equal(fIsChartInnerBoundStub.calledOnce, true, "isInnerChartBound correctly called once");
			assert.equal(fBindAggregationStub.callCount, 0, "bindAggregation correctly never called");
			assert.equal(fUpdateInnerChartNoDataText.callCount, 0, "_updateInnerChartNoDataText correctly never called");
			assert.equal(fRenderOverlay.callCount, 0, "_renderOverlay correctly never called");

			//Test in case inner Chart is bound already
			fIsChartInnerBoundStub.reset();
			fIsChartInnerBoundStub.returns(true);

			this.oDataInfo = {
				binding: {
					bHasAnalyticalInfo: false
				}
			};

			var oBindingInfo = {
				searchText: "testSearchText",
				filters: [
					new Filter({
						path: "testFilter"
					})
				],
				sorters: [
					new Sorter({
						path: "testSorter"
					})
				]
			};

			var fGetFilterInfoStub = sinon.stub(this.getControlDelegate(), "updateBindingInfo").callsFake(function(oMdcChart, oParamBindingInfo) {
				oParamBindingInfo.filters = oBindingInfo.filters;
			});


			var fGetSortersStub = sinon.stub(this, "_getSorters").returns(oBindingInfo.sorters);

			this.rebind();
			//called in rebind and for NoData text handling
			assert.equal(fIsChartInnerBoundStub.callCount, 2, "isInnerChartBound correctly called twice");
			assert.equal(fBindAggregationStub.callCount, 1, "bindAggregation correctly called once");
			assert.equal(fUpdateInnerChartNoDataText.callCount, 1, "_updateInnerChartNoDataText correctly called once");
			assert.equal(fRenderOverlay.callCount, 1, "_renderOverlay correctly called once");

			assert.ok(fBindAggregationStub.calledWith("data", {
				binding: {
					bHasAnalyticalInfo: true
				},
				filters: oBindingInfo.filters,
				sorter: oBindingInfo.sorters
			}), "bindAggregation called with the correct parameters");

			fBindAggregationStub.restore();
			fIsChartInnerBoundStub.restore();
			fGetFilterInfoStub.restore();
			fGetSortersStub.restore();

			done();
		}.bind(this.oChart));
	});

	QUnit.test(".applySettings() should return the this object to allow method chaining", function(assert) {
		var oReturn = this.oChart.applySettings();
		assert.ok(oReturn === this.oChart);
	});

	// BCP: 2070154256
	QUnit.test(".applySettings() should not raise an exception when action aggregations are provided", function(assert) {

		// system under test + act
		var oChart;

		try {
			oChart = new Chart({
				actions: [
					new Button()
				]
			});
		} catch (oException) {
			assert.notOk(true);
		}

		// assert
		assert.ok(true);

		// cleanup
		oChart.destroy();
	});

	// BCP: 2080249537
	QUnit.test("it should forward the actions to the inner toolbar aggregation", function(assert) {

		// arrange
		var done = assert.async();
		var oButtonAction = new Button();

		// act
		var oChart = new Chart({
			actions: [
				oButtonAction
			]
		});

		// assert
		oChart.initialized().finally(function() {
			assert.ok(oChart.getActions()[0] === oButtonAction);
			assert.ok(oChart.getAggregation("_toolbar").getActions()[0] === oButtonAction);
			done();
		});
	});

	QUnit.test("tooltips set on initialization", function(assert) {
		//arrange
		var done = assert.async();
		var oToggleChartTooltipVisibilitySpy = sinon.spy(this.oChart, "_toggleChartTooltipVisibility");

		//assert
		this.oChart.done().then(function() {
			assert.ok(this.oChart.getShowChartTooltip(), "default value should be true for showChartTooltip property");
			assert.ok(oToggleChartTooltipVisibilitySpy.calledOnce, "_toggleChartTooltipVisibility was called");
			assert.ok(this.oChart._vizTooltip, "Tooltip object should be created");
			done();
		}.bind(this));
	});

	QUnit.test("tooltips can be disabled", function(assert) {
		//arrange
		var done = assert.async();
		var oSetChartTooltipVisiblitySpy = sinon.spy(this.oChart, "_setChartTooltipVisiblity");

		this.oChart.done().then(function() {
			//act
			this.oChart._toggleChartTooltipVisibility(false);

			//assert
			assert.ok(oSetChartTooltipVisiblitySpy.calledTwice, "_setChartTooltipVisiblity should be called twice");
			assert.ok(this.oChart._vizTooltip.bIsDestroyed, "VizTooltip should be destroyed");
			done();
		}.bind(this));

	});

	QUnit.module("sap.ui.mdc.Chart: Items", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {
						chartType: "bullet",
						items: [
							new DimensionItem({
								key: "Name",
								label: "Name",
								role: "category"
							}), new MeasureItem({
								type: "Measure",
								key: "agSalesAmount",
								propertyPath: "SalesAmount",
								label: "Depth",
								role: "axis1",
								aggregationMethod: "sum"
							})
						]
					});
				}
			});

			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test(".bindAggregation() should not raise an exception when invoked", function(assert) {

		try {
			var oBindingInfoMock = {
				path: "/loremIpsum",
				template: {
					key: "{key}",
					label: "{label}",
					type: "{item}"
				}
			};

			var oReturn = this.oChart.bindAggregation("items", oBindingInfoMock);
			assert.ok(oReturn === this.oChart, "it should return the this object to allow method chaining");
		} catch (oException) {
			assert.ok(false);
		}

		assert.ok(true);
	});

	QUnit.test("Items after instantiation", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var aDimension = oChart.getDimensions();
			var aMeasures = oChart.getMeasures();
			assert.equal(aDimension.length, 1, "There is  one dimension in the inner chart");
			assert.equal(aMeasures.length, 1, "There is  one measure in the inner chart");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Adding Items w/o knowledge of existence of the inner chart", function(assert) {
		var done = assert.async();

		this.oChart.addItem(new MeasureItem({
			key: "SalesNumber",
			label: "Width",
			role: "axis2"
		}));

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var aDimension = oChart.getDimensions();
			var aMeasures = oChart.getMeasures();
			assert.equal(aDimension.length, 1, "There is  one dimension in the inner chart");
			assert.equal(aMeasures.length, 2, "There are two measures in the inner chart");

			done();
		}.bind(this.oChart));
	});

	QUnit.test("Adding Items with knowledge of existence of the inner chart", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			//add a new measure
			this.addItem(new MeasureItem({
				key: "SalesNumber",
				label: "Width",
				role: "axis2"
			}));

			var aDimension = oChart.getDimensions();
			var aMeasures = oChart.getMeasures();
			assert.equal(aDimension.length, 1, "There is  one dimension in the inner chart");
			assert.equal(aMeasures.length, 2, "There are two measures in the inner chart");

			done();
		}.bind(this.oChart));
	});

	QUnit.test("Removing items does not remove the item from the inner chart", function(assert) {
		var done = assert.async();

		var oItem = this.oChart.getItems()[1];
		this.oChart.removeItem(oItem);
		assert.equal(1, this.oChart.getItems().length, "The item is removed");

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var aDimension = oChart.getDimensions();
			var aMeasures = oChart.getMeasures();
			assert.equal(aDimension.length, 1, "There is still one dimension in the inner chart");
			assert.equal(aMeasures.length, 1, "There is still one measure in the inner chart");

			oItem = this.getItems()[0];
			this.removeItem(oItem);
			assert.equal(0, this.getItems().length, "The item is removed, there is no longer any item");
			aDimension = oChart.getDimensions();
			aMeasures = oChart.getMeasures();
			assert.equal(aDimension.length, 1, "There is still one dimension in the inner chart");
			assert.equal(aMeasures.length, 1, "There is still one measure in the inner chart");

			done();
		}.bind(this.oChart));
	});

	QUnit.module("sap.ui.mdc.Chart: Visible dimensions and measures (update)", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {
						chartType: "bullet",
						items: [
							new DimensionItem({
								key: "Name",
								label: "Name",
								role: "category"
							}), new MeasureItem({
								name: "agSalesAmount",
								propertyPath: "SalesAmount",
								label: "Depth",
								role: "axis1",
								aggregationMethod: "sum"
							})
						]
					});
				}
			});

			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test("Visibility after instantiation", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var aVisibleDimension = oChart.getVisibleDimensions();
			var aVisibleMeasures = oChart.getVisibleMeasures();
			assert.equal(aVisibleDimension.length, 1, "There is  one visible dimension in the inner chart");
			assert.equal(aVisibleMeasures.length, 1, "There is  one visible measure in the inner chart");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Adding Items w/o knowledge of existence of the inner chart", function(assert) {
		var done = assert.async();

		this.oChart.addItem(new MeasureItem({
			key: "SalesNumber",
			label: "Width",
			role: "axis2"
		}));

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var aVisibleDimension = oChart.getVisibleDimensions();
			var aVisibleMeasures = oChart.getVisibleMeasures();
			assert.equal(aVisibleDimension.length, 1, "There is  one visible dimension in the inner chart");
			assert.equal(aVisibleMeasures.length, 2, "There are visible two measures in the inner chart");

			var oItem = this.getItems()[2];
			this.removeItem(oItem);
			aVisibleDimension = oChart.getVisibleDimensions();
			aVisibleMeasures = oChart.getVisibleMeasures();
			assert.equal(aVisibleDimension.length, 1, "There is still one visible dimension in the inner chart");
			assert.equal(aVisibleMeasures.length, 1, "There is still one visible measure in the inner chart");
			done();
		}.bind(this.oChart));
	});

	QUnit.module("sap.ui.mdc.Chart: Item visibility", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {
						chartType: "bullet",
						items: [
							new DimensionItem({
								key: "Name",
								label: "Name",
								role: "category"
							}), new MeasureItem({
								key: "agSalesAmount",
								propertyPath: "SalesAmount",
								label: "Depth",
								role: "axis1",
								aggregationMethod: "sum"
							}), new MeasureItem({
								key: "SalesNumber",
								label: "Width",
								role: "axis2",
								visible: false
							})
						]
					});
				}
			});

			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test("Only visible items are visible in the chart", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oChart = this.getAggregation("_chart");
			var aDimension = oChart.getDimensions();
			var aMeasures = oChart.getMeasures();
			assert.equal(aDimension.length, 1, "There is one dimension in the inner chart");
			assert.equal(aMeasures.length, 2, "There are two measures in the inner chart");

			// now visiblitity of the measures and dimensions
			var aVisibleDimension = oChart.getVisibleDimensions();
			var aVisibleMeasures = oChart.getVisibleMeasures();
			assert.equal(aVisibleDimension.length, 1, "There is  one visible dimension in the inner chart");
			assert.equal(aVisibleMeasures.length, 1, "There is  one visible measure in the inner chart");

			//set the second measure visible
			var aItems = this.getItems();
			var oSalesNumber = aItems[2];
			oSalesNumber.setVisible(true);
			aVisibleMeasures = oChart.getVisibleMeasures();
			assert.equal(aVisibleMeasures.length, 2, "Now there are two measures visible");
			done();
		}.bind(this.oChart));
	});

	QUnit.test("Toggle InResult property of dimensionsional Item", function(assert) {
		var done = assert.async();

		this.oChart.initialized().then(function() {
			var oInnerChart = this.getAggregation("_chart");
			var oDimension = this.getItems()[0];

			assert.equal(oDimension.getInResult(), false, "Default value of inResult is false");
			assert.equal(oInnerChart.getInResultDimensions().length, 0, "No inResultDimensions set on inner Chart initially");

			// set inResult of dimension instance to true
			oDimension.setInResult(true);
			assert.equal(oInnerChart.getInResultDimensions().length, 1, "inResultDimensions of inner chart contains one dimension");
			assert.equal(oInnerChart.getInResultDimensions()[0], oDimension.getKey(), "Correct dimension successfully set on inResultDimensions of inner chart.");

			// set inResult of dimension instance to false
			oDimension.setInResult(false);
			assert.equal(oInnerChart.getInResultDimensions().length, 0, "inResultDimensions of inner chart removed successfully");

			done();
		}.bind(this.oChart));
	});

	QUnit.test("check the filterChange event handling Chart with FilterBar", function(assert) {
		var done = assert.async();

		sinon.stub(this.oChart, "isInnerChartBound").returns(true);
		sinon.stub(this.oChart, "_renderOverlay");

		sap.ui.require([
			"sap/ui/mdc/FilterBar"
		], function(FilterBar) {
			var oFilter = new FilterBar();
			this.oChart.setFilter(oFilter);

			this.oChart._renderOverlay.reset();

			assert.ok(!this.oChart._renderOverlay.called);

			oFilter.fireFiltersChanged();
			assert.ok(!this.oChart._renderOverlay.called);

			oFilter.fireFiltersChanged({conditionsBased: false});
			assert.ok(!this.oChart._renderOverlay.called);

			oFilter.fireFiltersChanged({conditionsBased: true});
			assert.ok(this.oChart._renderOverlay.called);

			oFilter.destroy();

			done();
		}.bind(this));
	});

	QUnit.test("Details button is visible", function(assert) {
		var done = assert.async();
		var fnTest = function () {
			var oToolBar = this.oChart.getAggregation("_toolbar");
			var oToolBarContent = oToolBar.getContent();
			assert.ok(oToolBarContent.find(function (oControl) {
				return oControl.sId.indexOf("selectionDetails") >= 0;
			}), "selectionDetails are available on ToolBar");
			done();
		}.bind(this);

		this.oChart.initialized().then(function() {
			// the SelectionHandler dependency may not be ready at this time, so we use an internal helper promise
			if (this.oChart._oSelectionHandlerPromise) {
				this.oChart._oSelectionHandlerPromise.then(fnTest);
			} else {
				fnTest();
			}
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.Chart: Events", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {
						chartType: "bullet",
						items: [
							new DimensionItem({
								key: "Name",
								label: "Name",
								role: "category"
							}), new MeasureItem({
								key: "agSalesAmount",
								propertyPath: "SalesAmount",
								label: "Depth",
								role: "axis1",
								aggregationMethod: "sum"
							}), new MeasureItem({
								key: "SalesNumber",
								label: "Width",
								role: "axis2",
								visible: false
							})
						]
					});
				}
			});

			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test("dataPointsSelected event is fired on data selection", function(assert) {
		var done = assert.async();
		var oDataPointsSelectedSpy = sinon.spy(this.oChart, "fireDataPointsSelected");
		this.oChart.initialized().then(function() {
			var oInnerChart = this.oChart.getAggregation("_chart");
			oInnerChart.fireSelectData();
			oInnerChart.fireDeselectData();
			assert.ok(oDataPointsSelectedSpy.calledTwice, "fireDataPointsSelected called on Chart");
			oDataPointsSelectedSpy.restore();
			done();

		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.Chart: Busy Indication", {
		beforeEach: function() {

			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {
						chartType: "bullet",
						items: [],
						data: {path: "/Test"}
					});
				}
			});

			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test("SetBusy False on data load complete", function(assert) {
		var mEventParams = {mParameters: {reason: "change"}};

		this.oChart.setBusy(true);
		this.oChart._onDataLoadComplete(mEventParams);
		assert.ok(!this.oChart.getBusy(), "Busy indication is not active");

	});

	QUnit.test("SetBusy True on data load not complete", function(assert) {
		var mEventParams = {mParameters: {reason: "change", detailedReason: "test"}};

		this.oChart.setBusy(true);
		this.oChart._onDataLoadComplete(mEventParams);
		assert.ok(this.oChart.getBusy(), "Busy indication is active");

	});

	QUnit.test("SetBusy in applySettings", function(assert) {
		var mSettings = {data: {path: "/Test"}};
		var oAddBindingListener = sinon.spy(this.oChart, "_addBindingListener");

		this.oChart.applySettings(mSettings);

		assert.ok(this.oChart.getBusy(), "Busy indication is active");
		assert.ok(oAddBindingListener.calledOnce, "_addBindingListener was called once");

	});

	QUnit.test("_addBindingListener behaviour", function(assert) {
		var oBindingInfo = {path: "/Test"};

		this.oChart._addBindingListener(oBindingInfo, "change", this.oChart._onDataLoadComplete);

		assert.ok(oBindingInfo.events, "Should create event field");
		assert.ok(oBindingInfo.events.change, "Should create change event");
	});

	QUnit.module("sap.ui.mdc.Chart: AutoBindOnInit", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					var oChart = new Chart("IDChart", {header: "Test Header",
					autoBindOnInit: false,
					noDataText: "No Data Test",
					items: [
						new DimensionItem({
							key: "Name",
							label: "Name",
							role: "category"
						})
					]});
					return oChart;
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
	});

	QUnit.test("Toolbar", function(assert) {
		var oToolbar = this.oChart.getAggregation("_toolbar");
		assert.ok(!oToolbar.getEnabled(), "toolbar should be disabled");
		assert.equal(oToolbar.getBegin().length, 1, "Toolbar begin should contain only title");
		assert.equal(oToolbar.getBegin()[0].getText(), "Test Header", "Toolbar header should contain correct text");
		assert.ok(oToolbar.getEnd().length > 0, "Toolbar end should contain buttons");
	});

	QUnit.test("Inner Chart", function(assert) {
		var oCreateChartSpy = sinon.spy(this.oChart, "_createChart");
		var oInnerChart = this.oChart.getAggregation("_chart");

		assert.ok(!oCreateChartSpy.called, "_createChart should not be called");
		assert.ok(!oInnerChart, "Inner chart aggregation should not be created");
	});

	QUnit.test("No Data Text", function(assert) {
		var oNoDataStruct = this.oChart.getAggregation("_noDataStruct");
		assert.ok(oNoDataStruct, "NoDataStruct aggregation is set");
		assert.equal(oNoDataStruct.getItems().length, 1, "Should contain no data text");
		assert.equal(oNoDataStruct.getItems()[0].getText(), "No Data Test", "No data text should be set correctly");
	});

	QUnit.test("Bind the chart", function(assert) {
		var done = assert.async();
		var oCreateChartSpy = sinon.spy(this.oChart, "_createChart");
		var oBindAggregationSpy = sinon.spy(this.oChart, "bindAggregation");
		this.oChart.rebind();


		this.oChart.done().then(function() {
			assert.ok(oCreateChartSpy.calledOnce, "Create chart was called");
			assert.ok(oBindAggregationSpy.calledOnce, "bindAggreagtion was called");
			assert.ok(!this.oChart.getAggregation("_noDataStruct"), "No Data struct was destroyed");
			assert.ok(this.oChart.getAggregation("_chart"), "Inner chart aggreagtion was created");
			assert.ok(this.oChart.getAggregation("_toolbar").getEnabled(), "Toolbar was enabled");
			done();
		}.bind(this));
	});

});
