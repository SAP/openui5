/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/Chart",
    "sap/ui/mdc/chart/Item",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
    "sap/chart/Chart",
    "sap/m/VBox"
],
function(
	Core,
	Chart,
    Item,
	UIComponent,
	ComponentContainer,
    ChartDelegate,
    SapChart,
    VBox

) {
    "use strict";

    var sandbox;
    var sDelegatePath = "test-resources/sap/ui/mdc/delegates/ChartDelegate";

    var getLayoutConfig = function() {

        return [
            {
                "key": "column",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "bar",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "line",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "pie",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "donut",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_column",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_bar",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_line",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "stacked_bar",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "scatter",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "bubble",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "axis3",
                    "category",
                    "series"
                ]
            },
            {
                "key": "heatmap",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "category2"
                ]
            },
            {
                "key": "bullet",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "vertical_bullet",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_stacked_bar",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "100_stacked_bar",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "stacked_column",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_stacked_column",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "100_stacked_column",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_horizontal_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_horizontal_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_stacked_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "dual_horizontal_stacked_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "axis2",
                    "category",
                    "series"
                ]
            },
            {
                "key": "stacked_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "100_dual_stacked_bar",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "100_dual_stacked_column",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "horizontal_stacked_combination",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ]
            },
            {
                "key": "waterfall",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "category2"
                ]
            },
            {
                "key": "horizontal_waterfall",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "category2"
                ]
            }
        ];
    };

	QUnit.module("sap.ui.mdc.delegate.odata.v4.vizChart.ChartDelegate: State Handling", {

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
					return new Chart("IDChart", {delegate: {
                        name: sDelegatePath,
					    payload: {
						collectionPath: "/testPath"
						}}
					});
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oMDCChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();

		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();

            ChartDelegate._deleteState(this.oMDCChart);
		}

    });

	QUnit.test("exit", function(assert) {
		assert.ok(true);
	});

    QUnit.test("_getState", function(assert) {
		assert.equal(ChartDelegate._getState(this.oMDCChart), undefined, "Undefined returned for empty state");
	});

    QUnit.test("_setState", function(assert) {
		assert.equal(ChartDelegate._getState(this.oMDCChart), undefined, "Undefined returned for empty state");

        var testData = {test: "Test123"};
        ChartDelegate._setState(this.oMDCChart, testData);
        assert.equal(ChartDelegate._getState(this.oMDCChart), testData, "State correctly set");
	});

    QUnit.test("_setInnerStructure", function(assert) {
		assert.equal(ChartDelegate._getState(this.oMDCChart), undefined, "Undefined returned for empty state");

        var testData = {test: "Test123"};
        ChartDelegate._setInnerStructure(this.oMDCChart, testData);
        assert.equal(ChartDelegate._getState(this.oMDCChart).innerStructure, testData, "State correctly set");
	});

    QUnit.test("_setBindingInfoForState", function(assert) {
		assert.equal(ChartDelegate._getState(this.oMDCChart), undefined, "Undefined returned for empty state");

        var testData = {test: "Test123"};
        ChartDelegate._setBindingInfoForState(this.oMDCChart, testData);
        assert.equal(ChartDelegate._getState(this.oMDCChart).bindingInfo, testData, "State correctly set");
	});

    QUnit.test("_setUpChartObserver", function(assert) {
		assert.equal(ChartDelegate._getState(this.oMDCChart), undefined, "Undefined returned for empty state");

        ChartDelegate._setState(this.oMDCChart, {});
        ChartDelegate._setUpChartObserver(this.oMDCChart);
        assert.equal(ChartDelegate._getState(this.oMDCChart).observer.getMetadata()._sClassName, 'sap.ui.base.ManagedObjectObserver', "Observer is setup");
	});

    QUnit.module("sap.ui.mdc.delegate.odata.v4.vizChart.ChartDelegate: General Functions", {

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
					return new Chart("IDChart", {delegate: {
                        name: sDelegatePath,
					    payload: {
						collectionPath: "/testPath"
						}}
					});
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oMDCChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();

            this.oInnerStructure = new VBox();
            this.oInnerChart = new SapChart();

            var oState = {
                innerStructure: this.oInnerStructure,
                innerChart: this.oInnerChart
            };

            ChartDelegate._setState(this.oMDCChart, oState);

            sandbox = sinon.sandbox.create();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();

            ChartDelegate._deleteState(this.oMDCChart);
            sandbox.restore();
		}

    });

    QUnit.test("exit", function(assert) {
		var oInnerDestroySpy = sinon.spy(this.oInnerStructure, "destroy");
        var oDeleteSpy = sinon.spy(ChartDelegate, "_deleteState");

        ChartDelegate.exit(this.oMDCChart);
        ChartDelegate.exit({getId: function(){}});

        assert.ok(oInnerDestroySpy.calledOnce, "Inner structure destroy was called once");
        assert.ok(oDeleteSpy.calledTwice, "State deletion was called twice");
	});

    QUnit.test("zoomIn zoomOut getZoomState", function(assert) {
		var oZoomSpy = sinon.spy(this.oInnerChart, "zoom");
        var oZoomInfoSpy = sinon.spy(this.oInnerChart, "getZoomInfo");

        ChartDelegate.zoomIn(this.oMDCChart);
        assert.ok(oZoomSpy.calledOnce, "Zoom was called once");

        ChartDelegate.zoomOut(this.oMDCChart);
        assert.ok(oZoomSpy.calledTwice, "Zoom was called twice");

        ChartDelegate.getZoomState(this.oMDCChart);
        assert.ok(oZoomInfoSpy.calledOnce, "getZoomState called on inner chart");

        //Should not call anything with missing MDC Chart reference
        ChartDelegate.zoomIn();
        ChartDelegate.zoomOut();
        ChartDelegate.getZoomState();
        assert.ok(oZoomSpy.calledTwice, "Zoom was called twice");
        assert.ok(oZoomInfoSpy.calledOnce, "getZoomState called on inner chart");
	});

    QUnit.test("getAdaptionUI", function(assert) {
        var done = assert.async();

        assert.ok(ChartDelegate._aChartTypeLayout === undefined, "No layout config cached initially");
		assert.equal(JSON.stringify(ChartDelegate.getChartTypeLayoutConfig()), JSON.stringify(getLayoutConfig()), "Layout config is correct");
        assert.ok(ChartDelegate._aChartTypeLayout, "Layout config now cached");

        ChartDelegate.getAdaptionUI(this.oMDCChart).then(function(oChartPanel){
            var oExpPanelConfig = {
                "key": "column",
                "allowedLayoutOptions": [
                    "axis1",
                    "category",
                    "series"
                ],
                "templateConfig": [
                    {
                        "kind": "Groupable"
                    },
                    {
                        "kind": "Aggregatable"
                    }
                ]
            };

            assert.ok(oChartPanel, "Panel was returned");
            assert.equal(JSON.stringify(oChartPanel.getPanelConfig()), JSON.stringify(oExpPanelConfig), "Panel config is correct");

            done();
        });
	});

    QUnit.test("setLegendVisible", function(assert) {
        ChartDelegate.setLegendVisible(this.oMDCChart, false);
        assert.ok(!this.oInnerChart.getVizProperties().legend.visible, "Legend is set invisible");
        assert.ok(!this.oInnerChart.getVizProperties().sizeLegend.visible, "Legend is set invisible");

        ChartDelegate.setLegendVisible(this.oMDCChart, true);
        assert.ok(this.oInnerChart.getVizProperties().legend.visible, "Legend is set visible");
        assert.ok(this.oInnerChart.getVizProperties().sizeLegend.visible, "Legend is set visible");
    });

    QUnit.test("getSorterForItem", function(assert) {
        var oAggrItem = new Item("aggrItem", {name: "Item1", type: "aggregatable"});
        var oGroupItem = new Item("groupItem", {name: "Item2", type: "groupable"});

        this.oMDCChart.addItem(oAggrItem);
        this.oMDCChart.addItem(oGroupItem);

        var oAggrSorter = ChartDelegate.getSorterForItem(oAggrItem, {descending: true});
        var oGroupSorter = ChartDelegate.getSorterForItem(oGroupItem, {name: "Item2", descending: true});
        assert.ok(oAggrSorter, "Sorter returned");
        assert.ok(oGroupSorter, "Sorter returned");

    });

    /*
    QUnit.test("insertItemToInnerChart function", function(assert) {
        assert.ok(this.oInnerChart.getVisibleDimensions().length === 0, "Visible dimensions are empty");
        assert.ok(this.oInnerChart.getVisibleMeasures().length === 0, "Visible dimensions are empty");

        var oAggrItem = new Item("aggrItem", {name: "Item1", type: "aggregatable", label: "Label"});
        var oGroupItem = new Item("groupItem", {name: "Item2", type: "groupable", label: "Label"});

        this.oMDCChart.addItem(oAggrItem);
        this.oMDCChart.addItem(oGroupItem);

        ChartDelegate.insertItemToInnerChart(this.oMDCChart, oAggrItem, 0);
        ChartDelegate.insertItemToInnerChart(this.oMDCChart, oGroupItem, 0);

        assert.ok(this.oInnerChart.getVisibleDimensions().includes("Item2"), "Visible dimensions are set up correctly");
        assert.ok(this.oInnerChart.getVisibleDimensions().length === 1, "Visible dimensions are set up correctly");
        assert.ok(this.oInnerChart.getVisibleMeasures().includes("Item1"), "Visible measures are set up correctly");
        assert.ok(this.oInnerChart.getVisibleMeasures().length === 1, "Visible measures are set up correctly");
    });*/

    /*
    QUnit.test("_createMDCChartItem function", function(assert) {
        var done = assert.async();

        var oFetchPromise = new Promise(function(resolve){
           var aMockedProps = [
               {
                   name: "Item1",
                   groupable: true,
                   label: "Label 1"
               },
               {
                name: "Item2",
                aggregatable: true,
                label: "Label 2"
            }
           ];

           resolve(aMockedProps);
        });


        sinon.stub(ChartDelegate, "fetchProperties").returns(oFetchPromise);

        ChartDelegate._createMDCChartItem("Item1", this.oMDCChart).then(function(oItemGroup){
            ChartDelegate._createMDCChartItem("Item2", this.oMDCChart).then(function(oItemAggr){
                assert.ok(oItemGroup, "Grouped Item was created");
                assert.equal(oItemGroup.getName(), "Item1", "Name is correct");
                assert.equal(oItemGroup.getType(), "groupable", "Type is correct");
                assert.equal(oItemGroup.getLabel(), "Label 1", "Label is correct");
                assert.ok(oItemAggr, "Aggregated Item was created");
                assert.equal(oItemAggr.getName(), "Item2", "Name is correct");
                assert.equal(oItemAggr.getType(), "aggregatable", "Type is correct");
                assert.equal(oItemAggr.getLabel(), "Label 2", "Label is correct");

                done();
            });
        }.bind(this));
    });
    */

    QUnit.test("getInnerChart", function(assert) {
        assert.equal(ChartDelegate.getInnerChart(this.oMDCChart), this.oInnerChart, "Inner chart is returned");
    });

    QUnit.test("getChartTypeInfo", function(assert) {

        var oExpectedChartTypeInfo = {
            "icon": "sap-icon://vertical-bar-chart",
            "text": "Selected Chart Type: column"
        };

        assert.equal(JSON.stringify(ChartDelegate.getChartTypeInfo(this.oMDCChart)), JSON.stringify(oExpectedChartTypeInfo), "Inner chart is returned");
    });

    QUnit.test("getDrillableItems", function(assert) {

        var oAggrItem = new Item("aggrItem", {name: "Item1", type: "aggregatable"});
        var oGroupItem = new Item("groupItem1", {name: "Item2", type: "groupable"});
        var oGroupItem2 = new Item("groupItem2", {name: "Item3", type: "groupable"});

        this.oMDCChart.addItem(oAggrItem);
        this.oMDCChart.addItem(oGroupItem);
        this.oMDCChart.addItem(oGroupItem2);

        var aDrillableItems = ChartDelegate.getDrillableItems(this.oMDCChart);
        assert.equal(aDrillableItems.length, 2, "Two items should be returned");
        assert.equal(aDrillableItems[0], oGroupItem, "Correct item returned");
        assert.equal(aDrillableItems[1], oGroupItem2, "Correct item returned");
    });

    QUnit.test("setChartType", function(assert) {

        var oSetSpy = sinon.spy(this.oInnerChart, "setChartType");

        ChartDelegate.setChartType(this.oMDCChart, "bar");

        assert.ok(oSetSpy.calledWith("bar"), "bar", "SetChart type was called on inner chart");
    });

    QUnit.test("requestToolbarUpdate", function(assert) {
        //MDC Chart with no item should result in avoiding to call renderComplete
        ChartDelegate.requestToolbarUpdate(this.oMDCChart);

        assert.ok(!ChartDelegate._getState(this.oMDCChart).toolbarUpdateRequested, "Request not set");

        //MDC Chart with items should result in request being set
        var oAggrItem = new Item("aggrItem", {name: "Item1", type: "aggregatable"});
        var oGroupItem = new Item("groupItem", {name: "Item2", type: "groupable"});

        this.oMDCChart.addItem(oAggrItem);
        this.oMDCChart.addItem(oGroupItem);

        ChartDelegate.requestToolbarUpdate(this.oMDCChart);

        assert.ok(ChartDelegate._getState(this.oMDCChart).toolbarUpdateRequested, "Request successfully set");
    });

    QUnit.test("_getBindingInfo", function(assert) {
        var oDelegate = {
            payload: {
                collectionName: "TestCollection"
            }
        };
        sandbox.stub(this.oMDCChart, "getDelegate").returns(oDelegate);

        assert.equal(ChartDelegate._getBindingInfo(this.oMDCChart).path, "/TestCollection", "Correct path returned");
    });

    /**Not implemented yet**/

    QUnit.test("getTypeUtil", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getFilterDelegate", function(assert) {
        assert.ok(true);
    });

    QUnit.test("addCondition", function(assert) {
        assert.ok(true);
    });

    QUnit.test("removeCondition", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("setChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_getInnerStructure", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getInnerChartSelectionHandler", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getChartTypeLayoutConfig", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_setAdaptionUI", function(assert) {
        assert.ok(true);
    });

    QUnit.test("removeItemFromInnerChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("addItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("removeItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("checkAndUpdateMDCItems", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createMDCChartItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createMDCItemFromProperty", function(assert) {
        assert.ok(true);
    });

    QUnit.test("initializeInnerChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createInitialChartContent", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createContentFromItems", function(assert) {
        assert.ok(true);
    });

    QUnit.test("prepareColoringForItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getAdditionalColoringMeasuresForItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_addCriticality", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_updateColoring", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_updateSemanticalPattern", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getAvailableChartTypes", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getDrillStack", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getDrillStackInfo", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getSortedDimensions", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_sortPropertyDimensions", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createInnerChartContent", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_performInitialBind", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_getHeights", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createInnerDimension", function(assert) {
        assert.ok(true);
    });

    QUnit.test("createInnerMeasure", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_addInnerDimension", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_addInnerMeasure", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getAggregatedMeasureNameForProperty", function(assert) {
        assert.ok(true);
    });

    QUnit.test("rebindChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("rebind", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getInnerChartBound", function(assert) {
        assert.ok(true);
    });

    QUnit.test("updateBindingInfo", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getSorters", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getAggregatedMeasureNameForMDCItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getInternalChartNameFromPropertyNameAndKind", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getPropertyFromNameAndKind", function(assert) {
        assert.ok(true);
    });

    QUnit.test("addInnerItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("insertInnerItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("removeInnerItem", function(assert) {
        assert.ok(true);
    });

    QUnit.test("setChartTooltipVisibility", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_loadChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("getPropertyHelperClass", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_formatText", function(assert) {
        assert.ok(true);
    });

    QUnit.test("setNoDataText", function(assert) {
        assert.ok(true);
    });

    QUnit.test("fetchProperties", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_createPropertyInfos", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_createPropertyInfosForAggregatable", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_getPropertyInfosByName", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_getModel", function(assert) {
        assert.ok(true);
    });

    //existing as commented function already
    QUnit.test("insertItemToInnerChart", function(assert) {
        assert.ok(true);
    });

    QUnit.test("_addBindingListener", function(assert) {
        assert.ok(true);
    });

    //state related
    QUnit.test("_deleteState", function(assert) {
        assert.ok(true);
    });
    QUnit.test("_getBindingInfoFromState", function(assert) {
        assert.ok(true);
    });

});