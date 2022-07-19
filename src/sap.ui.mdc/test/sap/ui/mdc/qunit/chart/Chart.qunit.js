/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/chart/Item",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/ui/core/library",
    "sap/chart/Chart",
	"sap/m/Button",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/ui/mdc/enum/ActionToolbarActionAlignment",
	"sap/m/ToolbarSeparator",
	"sap/ui/fl/variants/VariantManagement"
],
function(
	Core,
	Chart,
	Item,
	UIComponent,
	ComponentContainer,
    CoreLibrary,
    InnerChart,
	Button,
	ActionToolbarAction,
	Alignment,
	ToolbarSeparator,
	VM
) {
    "use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = CoreLibrary.TitleLevel;

    var sDelegatePath = "test-resources/sap/ui/mdc/delegates/ChartDelegate";

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
					return new Chart("IDChart", {delegate: {
                        name: sDelegatePath,
					    payload: {
						collectionPath: "/testPath"
						}},
						propertyInfo: [{name: "name1"}, {name: "name2"}]
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
		}

    });

	QUnit.test("Test exists", function(assert) {
		assert.ok(true);
	});


	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oMDCChart);
		assert.ok(this.oMDCChart.isA("sap.ui.mdc.IxState"));

    });

	QUnit.test("PropertyHelperMixin relevant parts are part of MDC Chart", function(assert) {
		assert.ok(this.oMDCChart.isPropertyHelperFinal);
		assert.ok(this.oMDCChart._getPropertyByNameAsync);
    });

	QUnit.test("PropertyHelper not finalized on startup", function(assert) {
		assert.ok(this.oMDCChart.isPropertyHelperFinal() == false);
    });

	QUnit.test("Init", function(assert) {
		var done = assert.async();

		this.oMDCChart.initialized().then(function() {
			assert.ok(this.oMDCChart, "The chart is created");

			done();
		}.bind(this));

	});

	QUnit.test("_loadDelegate", function(assert) {
		var done = assert.async();

		this.oMDCChart._loadDelegate().then(function(oDelegate){
			assert.ok(oDelegate, "Delegate loaded");
			done();
		});
	});

	QUnit.test("MDC Chart rebind", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			assert.ok(this.oMDCChart.getControlDelegate(), "Control delegate is initialized");
			this.oMDCChart.getControlDelegate().setInnerChartBoundTest(true); //Mock value for inner chart bound

			var getBindingInfoSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "_getBindingInfo");
			var updateBindingInfoSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "updateBindingInfo");
			var rebindSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "rebind");

			this.oMDCChart.rebind();

			assert.ok(this.oMDCChart.getBusy(), "MDC Chart is set busy");
			assert.ok(getBindingInfoSpy.calledOnce, "getBindingInfo called on delegate");
			assert.ok(updateBindingInfoSpy.calledOnce, "updateBindingInfo called on delegate");
			assert.ok(rebindSpy.calledOnce, "rebind called on delegate");

			done();
		}.bind(this));
	});

	QUnit.test("_getToolbar", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			this.oMDCChart.getAggregation("_toolbar").destroy();
			this.oMDCChart.setAggregation("_toolbar", undefined);
			assert.ok(this.oMDCChart.getAggregation("_toolbar") == undefined, "Toolbar aggregation is empty");

			this.oMDCChart._getToolbar();
			assert.ok(this.oMDCChart.getAggregation("_toolbar"), "Toolbar was created");
			assert.ok(this.oMDCChart.getAggregation("_toolbar").isA("sap.ui.mdc.chart.ChartToolbar"), "Toolbar is instance of sap.ui.mdc.chart.ChartToolbar");

			done();

		}.bind(this));
	});

	QUnit.test("_updateToolbar", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var toolbarSpy = sinon.spy(this.oMDCChart.getAggregation("_toolbar"), "updateToolbar");

			this.oMDCChart._updateToolbar();
			assert.ok(toolbarSpy.calledOnce, "_updateToolbar was called on toolbar");

			done();

		}.bind(this));
	});

	QUnit.test("_getInnerChart", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getInnerChart");

			this.oMDCChart._getInnerChart();
			assert.ok(delegateSpy.calledOnce, "getInnerChart was called on innerChart");

			done();

		}.bind(this));
	});

	QUnit.test("zoomIn", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomInSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomIn");

			this.oMDCChart.zoomIn();
			assert.ok(zoomInSpy.calledOnce, "Zoom in was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("zoomOut", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomOutSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomOut");

			this.oMDCChart.zoomOut();
			assert.ok(zoomOutSpy.calledOnce, "Zoom out was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("getZoomState", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getZoomState");

			this.oMDCChart.getZoomState();
			assert.ok(zoomSpy.calledOnce, "Zoom status was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("setLegendVisible", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var legendSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setLegendVisible");
			assert.ok(this.oMDCChart.getLegendVisible() == true, "Property is in initial state");

			this.oMDCChart.setLegendVisible(false);
			assert.ok(legendSpy.calledOnce, "setLegendVisible was called on delegate");
			assert.ok(this.oMDCChart.getLegendVisible() == false, "Property was updated");
			done();

		}.bind(this));
	});

	QUnit.test("setShowChartTooltip", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			assert.ok(this.oMDCChart.getShowChartTooltip(), "Initial value of property is true");
			var tooltipSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setChartTooltipVisibility");

			this.oMDCChart.setShowChartTooltip(false);
			assert.ok(tooltipSpy.calledOnce, "delegate function was called");
			assert.ok(!this.oMDCChart.getShowChartTooltip(), "Property was set");

			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart _propagatePropertiesToInnerChart", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var legendSpy = sinon.spy(this.oMDCChart, "setLegendVisible");
			var tooltipSpy = sinon.spy(this.oMDCChart, "setShowChartTooltip");
			var typeSpy = sinon.spy(this.oMDCChart, "setChartType");

			this.oMDCChart._propagatePropertiesToInnerChart();
			assert.ok(legendSpy.calledOnce, "setLegendVisible was called");
			assert.ok(tooltipSpy.calledOnce, "setShowChartTooltip was called");
			assert.ok(typeSpy.calledOnce, "setChartType was called");

			done();
		}.bind(this));
	});

	QUnit.test("getChartTypeInfo", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getChartTypeInfo");

			var info = this.oMDCChart.getChartTypeInfo();
			assert.ok(delegateSpy.calledOnce, "getChartTypeInfo was called on delegate");
			assert.ok(info, "charttypeinfo is present");

			done();
		}.bind(this));
	});

	QUnit.test("getAvailableChartTypes", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getAvailableChartTypes");

			this.oMDCChart.getAvailableChartTypes();
			assert.ok(delegateSpy.calledOnce, "getAvailableChartTypes was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("setChartType", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setChartType");

			this.oMDCChart.setChartType();
			assert.ok(delegateSpy.calledOnce, "setChartType was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("getCurrentState", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var oState = this.oMDCChart.getCurrentState();
			assert.ok(oState, "p13n state object was returned");
			assert.ok(!oState.items, "p13n state contains no items");
			assert.ok(!oState.sorters, "p13n state contains no sorters");

			this.oMDCChart.setP13nMode(["Sort"]);
			oState = this.oMDCChart.getCurrentState();
			assert.ok(oState.sorters, "p13n state contains sorters");

			this.oMDCChart.setP13nMode(["Item"]);
			oState = this.oMDCChart.getCurrentState();
			assert.ok(oState.items, "p13n state contains items");

			done();
		}.bind(this));
	});

	QUnit.test("_getVisibleProperties", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var oMDCItem = new Item("testItem1", {name: "testName", role: "testRole"});
			this.oMDCChart.insertItem(oMDCItem, 0);

			var aVisibleItems = this.oMDCChart._getVisibleProperties();
			assert.ok(aVisibleItems.length === 1, "Visible Properties contain 1 item");
			assert.ok(aVisibleItems[0].name === "testName", "Item has correct name");
			assert.ok(aVisibleItems[0].role === "testRole", "Item has correct role");

			done();
		}.bind(this));
	});

	QUnit.test("_getPropertyData", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "fetchProperties");

			this.oMDCChart._getPropertyData();
			assert.ok(delegateSpy.calledOnce, "fetchProperties was called on delegate");

			this.oMDCChart._getPropertyData();
			assert.ok(delegateSpy.calledOnce, "fetchProperties was not called again on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("_renderOverlay", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){

			this.oMDCChart._renderOverlay(true);
			var oOverlay = this.oMDCChart.getControlDelegate().getInnerChart().$().find(".sapUiMdcChartOverlay");
			assert.ok(oOverlay, "Overlay was added to inner chart");

			this.oMDCChart._renderOverlay(false);
			oOverlay = this.oMDCChart.getControlDelegate().getInnerChart().$().find(".sapUiMdcChartOverlay");
			assert.ok(oOverlay, "Overlay was removed from inner chart");
			done();
		}.bind(this));
	});


	QUnit.test("_propagateItemChangeToInnerChart", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			//Arrange
			var oMockItem = new Item({name: "testName", label:"testLabel", type:"groupable", role:"category"});
			var oMockChange = {mutation : "insert", child: oMockItem};
			var oMockBreadcrumbs = {updateDrillBreadcrumbs : function(){}};
			this.oMDCChart._oBreadcrumbs = oMockBreadcrumbs;

			this.oMDCChart.addItem(new Item({name: "testName1", label:"testLabel1", type:"groupable", role:"category"}));
			this.oMDCChart.addItem(new Item({name: "testName2", label:"testLabel2", type:"aggregatable", role:"category"}));
			this.oMDCChart.addItem(oMockItem);

			var oInsertItemSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "insertItemToInnerChart");

			//Act
			this.oMDCChart._propagateItemChangeToInnerChart(oMockChange);

			//Assert
			assert.ok(oInsertItemSpy.calledWithExactly(this.oMDCChart, oMockItem, 1), "Item was inserted with correct index");
			done();
		}.bind(this));

	});

		QUnit.test("setNoDataText", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setNoDataText");

			this.oMDCChart.setNoDataText("Test Text 12345");
			assert.ok(delegateSpy.calledOnce, "setNoDataText was called on delegate");
			assert.equal(this.oMDCChart.getNoDataText(), "Test Text 12345", "No data text was updated");

			done();
		}.bind(this));
	});

    /**
     * Not implemented yet
     */
    QUnit.test("setP13nMode", function(assert){

        var done = assert.async();

        this.oMDCChart.initialized().then(function(){

            //1
            var aMode = ['Item', 'Sort', 'Type', 'Filter'];
            var _updateAdaptationStub = sinon.stub(this.oMDCChart,"_updateAdaptation");
            var aModeSorted = ['Item', 'Sort', 'Filter', 'Type'];
            var setPropertySpy = sinon.spy(this.oMDCChart,"setProperty");

            this.oMDCChart.setP13nMode(aMode);

            assert.ok(setPropertySpy.calledWith("p13nMode", aModeSorted, true),"P13nMode property correctly set");
            assert.ok(_updateAdaptationStub.calledWith(aModeSorted),"_updateAdaption called with P13nMode parameters correctly");

            //2
            aMode = ['Item'];

            this.oMDCChart.setP13nMode(aMode);

            assert.ok(setPropertySpy.calledWith("p13nMode", aMode, true),"P13nMode property correctly set");
            assert.ok(_updateAdaptationStub.calledWith(aMode),"_updateAdaption called with P13nMode parameters correctly");

            done();
        }.bind(this));
    });

    QUnit.test("_updateAdaption", function(assert){
        var done = assert.async();

        this.oMDCChart.initialized().then(function(){

            var aMode = ['Item', 'Sort', 'Type', 'Filter'];
            sinon.spy(this.oMDCChart.getEngine(),"registerAdaptation");

            this.oMDCChart._updateAdaptation(aMode);

            assert.equal(this.oMDCChart.getEngine().registerAdaptation.getCall(0).args.length,2,"registerAdaptation correctly called");

            done();
        }.bind(this));
    });

    QUnit.test("isFilteringEnabled", function(assert){
        var done = assert.async();

        this.oMDCChart.initialized().then(function(){

            var aMode = ['Item', 'Sort', 'Type', 'Filter'];

            this.oMDCChart.setP13nMode(aMode);

            assert.equal(this.oMDCChart.isFilteringEnabled(),true, "filtering correctly enabled");

            aMode.pop(); //remove filters

            this.oMDCChart.setP13nMode(aMode);

            assert.equal(this.oMDCChart.isFilteringEnabled(),false, "filtering correctly disabled");

            done();
        }.bind(this));
    });

    QUnit.test("setFilterConditions", function(assert){
        var done = assert.async();

        this.oMDCChart.initialized().then(function(){

            var mConditions = {};
            var setPropertySpy = sinon.spy(this.oMDCChart,"setProperty");
            var setFilterConditionsStub = sinon.stub();
            var getInbuiltFilterStub = sinon.stub(this.oMDCChart,"getInbuiltFilter").returns(
                {setFilterConditions: setFilterConditionsStub}
            );

            this.oMDCChart.setFilterConditions(mConditions);

            assert.ok(setPropertySpy.calledWith("filterConditions", mConditions, true),"filterConditions property correctly set");
            assert.ok(getInbuiltFilterStub.calledOnce, "getInbuiltFilter correctly called once");
            assert.ok(setFilterConditionsStub.calledWith(mConditions),"setFilterConditions correcly called with parameters");

            done();
        }.bind(this));
    });

    QUnit.test("getConditions", function(assert){
        var done = assert.async();

        this.oMDCChart.initialized().then(function(){
            var aConditions = [1, 2, 3];
            var getConditionsStub = sinon.stub().returns(aConditions);
            var getInbuiltFilterStub = sinon.stub(this.oMDCChart,"getInbuiltFilter").returns(
                {getConditions: getConditionsStub}
            );

            var aCon = this.oMDCChart.getConditions();

            assert.equal(aCon, aConditions,"Conditions correctly returned");

            getInbuiltFilterStub.returns(undefined);

            var aCon = this.oMDCChart.getConditions();

            assert.equal(aCon.length,0,"No Conditions correctly returned");

            done();
        }.bind(this));
    });

    QUnit.test("_registerInnerFilter", function(assert){
        var done = assert.async();

        this.oMDCChart.initialized().then(function(){

            var oFilter = {attachSearch:function(){}};
            var attachSearchSpy = sinon.spy(oFilter,"attachSearch");

            this.oMDCChart._registerInnerFilter(oFilter);


            assert.ok(attachSearchSpy.calledOnce,"attachSearch correctly called");
            done();
        }.bind(this));
    });

    QUnit.test("applySettings", function(assert){
        var done = assert.async();

        this.oMDCChart.initialized().then(function(){

            var mSettings = {};
            var oScope = {};

            function isPromise(p) {
                return p && Object.prototype.toString.call(p) === "[object Promise]";
            }

            var _setPropertyHelperClassStub = sinon.stub(this.oMDCChart,"_setPropertyHelperClass");
            var _loadDelegateSpy = sinon.spy(this.oMDCChart,"_loadDelegate");
            var isFilteringEnabledStub = sinon.stub(this.oMDCChart,"isFilteringEnabled").returns(true);
            var retrieveInbuiltFilterSpy = sinon.spy(this.oMDCChart,"retrieveInbuiltFilter");

            this.oMDCChart.applySettings(mSettings,oScope);

            assert.ok(_setPropertyHelperClassStub.calledOnce,"_setPropertyHelperClass correctly called");
            assert.ok(isPromise(this.oMDCChart.initializedPromise),"initializedPromise correctly created");
            assert.ok(isPromise(this.oMDCChart.innerChartBoundPromise),"innerChartBoundPromise correctly created");
            assert.ok(_loadDelegateSpy.calledOnce,"_loadDelegat correctly called");
            assert.ok(isFilteringEnabledStub.calledOnce,"isFilteringEnabled correctly called");
            assert.ok(retrieveInbuiltFilterSpy.calledOnce,"retrieveInbuiltFilter correctly called");

            done();
        }.bind(this));
    });

    QUnit.test("_initInnerControls", function(assert){
        assert.ok(true);
    });

    QUnit.test("_createContentFromPropertyInfos", function(assert){
		var done = assert.async();
        var oMockDelegate = {checkAndUpdateMDCItems : function(){return Promise.resolve();}, createInnerChartContent: function(){return Promise.resolve();}, getDrillableItems: function(){return [];}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		this.oMDCChart._propagatePropertiesToInnerChart = function(){}; //Mock this as it requires an inner chart (which we don't want to test in this case)

		var oCreateCrumbsSpy = sinon.spy(this.oMDCChart, "_createBreadcrumbs");
		var oPropagateSpy = sinon.spy(this.oMDCChart, "_propagatePropertiesToInnerChart");

		this.oMDCChart._createContentfromPropertyInfos();

		this.oMDCChart.innerChartBound().then(function(){
			assert.ok(oCreateCrumbsSpy.calledOnce, "Function was called");
			assert.ok(this.oMDCChart._oObserver, "Observer was created");
			assert.ok(oPropagateSpy.calledOnce, "Function was called");

			done();
		}.bind(this));

    });

    QUnit.test("_createBreadcrumbs", function(assert){
		var oMockDelegate = {getDrillableItems: function(){return [];}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
        this.oMDCChart.setAggregation("_breadcrumbs", null);

		this.oMDCChart._createBreadcrumbs();

		assert.ok(this.oMDCChart.getAggregation("_breadcrumbs"));
    });

    QUnit.test("getAdaptionUI", function(assert){
		var oMockDelegate = {getAdaptionUI : function() {return "Test";}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		var oDelegateSpy = sinon.spy(oMockDelegate,"getAdaptionUI");

		var sResult = this.oMDCChart.getAdaptationUI();

		assert.equal(sResult, "Test", "Correct result returned");
		assert.ok(oDelegateSpy.calledOnce, "Function was called on delegate");
    });

    QUnit.test("_addItems", function(assert){
        assert.ok(true);
    });

    QUnit.test("initialized", function(assert){
        assert.ok(true);
    });

    QUnit.test("innerChartBound", function(assert){
		var done = assert.async();
        var oMockDelegate = {checkAndUpdateMDCItems : function(){return Promise.resolve();}, createInnerChartContent: function(){return Promise.resolve();}, getDrillableItems: function(){return [];}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		this.oMDCChart._propagatePropertiesToInnerChart = function(){}; //Mock this as it requires an inner chart (which we don't want to test in this case)

		this.oMDCChart._createContentfromPropertyInfos();

		this.oMDCChart.innerChartBound().then(function(){
			assert.ok(true, "Promise was resolved during _createContentfromPropertyInfos");

			done();
		});
    });

    QUnit.test("getSelectionHandler", function(assert){
        var done = assert.async();
        this.oMDCChart.initialized().then(function(){

            var getInnerChartSelectionHandlerSpy = sinon.spy(this.oMDCChart.getControlDelegate(),"getInnerChartSelectionHandler");

            this.oMDCChart.getSelectionHandler();


            assert.ok(getInnerChartSelectionHandlerSpy.calledOnce,"getInnerChartSelectionHandler correctly called");
            assert.ok(getInnerChartSelectionHandlerSpy.calledWith(this.oMDCChart),"getInnerChartSelectionHandler params correctly passed");
            done();
        }.bind(this));
    });

    QUnit.test("getChartTypeLayoutConfig", function(assert){
        var oMockDelegate = {getChartTypeLayoutConfig : function() {return "Test";}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		var oDelegateSpy = sinon.spy(oMockDelegate,"getChartTypeLayoutConfig");

		var sResult = this.oMDCChart.getChartTypeLayoutConfig();

		assert.equal(sResult, "Test", "Correct result returned");
		assert.ok(oDelegateSpy.calledOnce, "Function was called on delegate");
    });

    QUnit.test("getAllowedRolesForKinds", function(assert){
		var oMockDelegate = {getAllowedRolesForKinds : function() {return "Test";}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		var oDelegateSpy = sinon.spy(oMockDelegate,"getAllowedRolesForKinds");

		var sResult = this.oMDCChart.getAllowedRolesForKinds();

		assert.equal(sResult, "Test", "Correct result returned");
		assert.ok(oDelegateSpy.calledOnce, "Function was called on delegate");
    });

    QUnit.test("destroy", function(assert){
        var done = assert.async();
        this.oMDCChart.initialized().then(function(){

            this.oMDCChart.destroy();

            assert.ok(this.oMDCChart._bIsDestroyed,"isDestroyed flag correctly set");
            done();
        }.bind(this));
    });

    QUnit.test("_showDrillDown", function(assert){
        assert.ok(true);
    });

    QUnit.test("getManagedObjectModel", function(assert){
        assert.equal(this.oMDCChart.getManagedObjectModel(), this.oMDCChart._oManagedObjectModel, "ManagedObjectModel of chart was returned");
    });

    QUnit.test("_innerChartDataLoadComplete", function(assert){
		//Arrange
		var oMockDelegate = {requestToolbarUpdate: function(){return;}, getInnerChart: function(){return;}};
		this.oMDCChart.getControlDelegate = function(){return oMockDelegate;};
		var setBusySpy = sinon.spy(this.oMDCChart, "setBusy");
		var _checkStyleClassesForDimensionsSpy = sinon.spy(this.oMDCChart, "_checkStyleClassesForDimensions");
		var _renderOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
		var requestToolbarUpdateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "requestToolbarUpdate");

		//Act
		this.oMDCChart._innerChartDataLoadComplete({});

		//Assert
		assert.ok(setBusySpy.calledOnceWith(false), "SetBusy called");
		assert.ok(_checkStyleClassesForDimensionsSpy.calledOnce, "_checkStyleClassesForDimensionsSpy called");
		assert.ok(_renderOverlaySpy.calledOnceWith(false), "_renderOverlaySpy called");
		assert.ok(requestToolbarUpdateSpy.calledOnce, "requestToolbarUpdateSpy called");

    });

	QUnit.test("_checkStyleClassesForDimensions w/o dimension", function(assert){
		//Arrange
		this.oMDCChart.removeAllItems([]);
		this.oMDCChart.addStyleClass("sapUiMDCChartGrid");

		var addStyleClassSpy = sinon.spy(this.oMDCChart, "addStyleClass");
		var removeStyleClassSpy = sinon.spy(this.oMDCChart, "removeStyleClass");

		//Act
		this.oMDCChart._checkStyleClassesForDimensions();

		//Assert
		assert.ok(addStyleClassSpy.calledOnceWith("sapUiMDCChartGridNoBreadcrumbs"), "sapUiMDCChartGridNoBreadcrumbs added");
		assert.ok(removeStyleClassSpy.calledOnceWith("sapUiMDCChartGrid"), "sapUiMDCChartGrid removed");
		assert.ok(this.oMDCChart.hasStyleClass("sapUiMDCChartGridNoBreadcrumbs"), "Styleclass in DOM");
		assert.ok(!this.oMDCChart.hasStyleClass("sapUiMDCChartGrid"), "Styleclass not in DOM");
	});

	QUnit.test("_checkStyleClassesForDimensions with dimension after removal", function(assert){
		//Arrange
		this.oMDCChart.removeAllItems();
		this.oMDCChart.addStyleClass("sapUiMDCChartGrid");
		this.oMDCChart._checkStyleClassesForDimensions();
		this.oMDCChart.addItem(new Item({name: "Test1", type:"groupable"}));

		var addStyleClassSpy = sinon.spy(this.oMDCChart, "addStyleClass");
		var removeStyleClassSpy = sinon.spy(this.oMDCChart, "removeStyleClass");

		//Act
		this.oMDCChart._checkStyleClassesForDimensions();

		//Assert
		assert.ok(addStyleClassSpy.calledOnceWith("sapUiMDCChartGrid"), "sapUiMDCChartGrid added");
		assert.ok(removeStyleClassSpy.calledOnceWith("sapUiMDCChartGridNoBreadcrumbs"), "sapUiMDCChartGridNoBreadcrumbs removed");
		assert.ok(this.oMDCChart.hasStyleClass("sapUiMDCChartGrid"), "Styleclass in DOM");
		assert.ok(!this.oMDCChart.hasStyleClass("sapUiMDCChartGridNoBreadcrumbs"), "Styleclass not in DOM");
	});

    QUnit.test("_getSortedProperties", function(assert){
        this.oMDCChart.setSortConditions({sorters: "ABC"});
		assert.equal(this.oMDCChart._getSortedProperties(), "ABC", "Should return sorters form sortConditions");

		this.oMDCChart.setSortConditions();
		assert.equal(this.oMDCChart._getSortedProperties().length, 0, "Should return empty array");
    });

    QUnit.test("_getTypeBtnActive", function(assert){
        this.oMDCChart.setP13nMode(["Type"]);
		assert.ok(this.oMDCChart._getTypeBtnActive(), "Button is set active");

		this.oMDCChart.setP13nMode(["Item"]);
		assert.ok(!this.oMDCChart._getTypeBtnActive(), "Button is set inactive");
    });

    QUnit.test("_onFiltersChanged", function(assert){
		var oMockDelegate = {getInnerChartBound : function() {return true;}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		this.oMDCChart._renderOverlay = function(){};
		var oOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
		this.oMDCChart._bInnerChartReady = true;

		this.oMDCChart._onFiltersChanged({getParameter: function(){return true;}});

		assert.ok(oOverlaySpy.calledOnce, "Overlay function was called");

    });

	QUnit.test("_onFiltersChanged with invalid event", function(assert){
		var oMockDelegate = {getInnerChartBound : function() {return true;}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		this.oMDCChart._renderOverlay = function(){};
		var oOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
		this.oMDCChart._bInnerChartReady = true;

		this.oMDCChart._onFiltersChanged({getParameter: function(){return false;}});

		assert.ok(!oOverlaySpy.called, "Overlay function was not called");

    });

	QUnit.test("_onFiltersChanged with unbound chart", function(assert){
		var oMockDelegate = {getInnerChartBound : function() {return false;}};
		this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
		this.oMDCChart._renderOverlay = function(){};
		var oOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
		this.oMDCChart._bInnerChartReady = true;

		this.oMDCChart._onFiltersChanged({getParameter: function(){return true;}});

		assert.ok(!oOverlaySpy.called, "Overlay function was not called");

    });

	QUnit.module("sap.ui.mdc.Chart: Toolbar Actions", {

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
							collectionPath: "/testPath" }},
						actions: [new ActionToolbarAction( {
							action: new Button("testButton", {text: "testButtonText"}),
							layoutInformation: {  aggregationName: "end",alignment: Alignment.End }
						})]
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
		}

    });

	QUnit.test("MDC Chart Initial Action is added to toolbar with the correct layout", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){

			assert.ok(this.oMDCChart.getAggregation("_toolbar"), "Toolbar exists");
			assert.equal(this.oMDCChart.getAggregation("_toolbar").getActions().length, 1, "Toolbar has correct amount of actions in actions aggregation");
			assert.equal(this.oMDCChart.getAggregation("_toolbar").getActions()[0].getAction().getText(), "testButtonText", "Action from constructor property is correctly aligned");

			done();
		}.bind(this));
	});

	QUnit.test("setHeaderLevel", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){

			var toolbarSpy = sinon.spy(this.oMDCChart.getAggregation("_toolbar"), "_setHeaderLevel");

			assert.ok(this.oMDCChart.setHeaderLevel(TitleLevel.H3));

			assert.ok(toolbarSpy.calledOnce, "setHeaderLevel called on toolbar");
			assert.equal(this.oMDCChart.getAggregation("_toolbar")._oTitle.getLevel(), sap.ui.core.TitleLevel.H3, "Level set on title");

			done();
		}.bind(this));
	});

	QUnit.test("setVariant", function(assert){
		var oToolbarSpy = sinon.spy(this.oMDCChart.getAggregation("_toolbar"),"addVariantManagement");

		this.oMDCChart.setVariant(new VM());

		assert.ok(oToolbarSpy.called, "Function was called on toolbar");
    });

});