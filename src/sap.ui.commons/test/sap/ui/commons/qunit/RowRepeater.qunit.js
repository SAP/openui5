/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/RowRepeater",
	"sap/ui/commons/library",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Label",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Title",
	"sap/ui/commons/RowRepeaterFilter",
	"sap/ui/model/Filter",
	"sap/ui/commons/RowRepeaterSorter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/commons/TextView"
], function(
	createAndAppendDiv,
	RowRepeater,
	commonsLibrary,
	TextField,
	Label,
	MatrixLayout,
	JSONModel,
	Title,
	RowRepeaterFilter,
	Filter,
	RowRepeaterSorter,
	Sorter,
	JSONListBinding,
	TextView
) {
	"use strict";

	// shortcut for sap.ui.commons.RowRepeaterDesign
	var RowRepeaterDesign = commonsLibrary.RowRepeaterDesign;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "content"]);
	(function(){
		var elem = document.createElement("A");
		elem.setAttribute("id", "backLink");
		elem.setAttribute("style", "display:none;");
		elem.setAttribute("href", "../RowRepeater.html");
	document.body.appendChild(elem);
	}());


	var oRowRepeater = new RowRepeater("rr1", {
		visible: true,
		numberOfRows: 5,
		currentPage: 2,
		showMoreSteps: 3,
		fixedRowHeight: "25px",
		design: RowRepeaterDesign.Standard
	});
	oRowRepeater.placeAt("uiArea1");

	// create the row repeater control
	var oRowRepeater2 = new RowRepeater({
		currentPage: 1,
		numberOfRows : 10
	});
	oRowRepeater2.placeAt("content");


	QUnit.module("RowRepeater Test - sap.ui.commons.RowRepeater", {
		//beforeEach: function(){
		//}, afterEach: function(){}
	});

	// create data
	var oDataObject = {};
	oDataObject.data = [];
	for (var n = 0; n < 50; n++) {
		oDataObject.data.push( { index:n, name:"Name" + n } );
	}

	// create test template
	var oTextField = new TextField().bindProperty("value", "index");
	var oLabel = new Label().bindProperty("text", "name");
	var oRowTemplate = new MatrixLayout().createRow(oTextField, oLabel);

	// create JSON model
	var oModel = new JSONModel();
	oModel.setData(oDataObject);
	sap.ui.getCore().setModel(oModel);


	QUnit.test("Test Creation, Getters and Setter", function(assert){
		assert.ok( oRowRepeater != null, "RowRepeater created");
		assert.equal( oRowRepeater.getVisible(), true , "visible property correct");
		assert.equal( oRowRepeater.getNumberOfRows(), 5 , "numberOfRows property correct");
		assert.ok( oRowRepeater.setNumberOfRows(10) , "setting numberOfRows to 10");
		assert.equal( oRowRepeater.getNumberOfRows(), 10 , "numberOfRows property still correct");
		assert.equal( oRowRepeater.getCurrentPage(), 1 , "currentPage property correct");
		assert.ok( oRowRepeater.setCurrentPage(2) , "setting currentPage property to 2");
		assert.equal( oRowRepeater.getCurrentPage(), 2 , "currentPage property still correct");
		assert.equal( oRowRepeater.getShowMoreSteps(), 3 , "showMoreSteps property correct");
		assert.equal( oRowRepeater.getFixedRowHeight(), "25px" , "fixedRowHeight property correct");
		assert.equal( oRowRepeater.getDesign(), RowRepeaterDesign.Standard , "design property correct");
		assert.ok( oRowRepeater.setTitle(new Title({text:"RowRepeater"})), "setting a title" );
	});

	QUnit.test("Test Aggregation Binding", function(assert) {
		assert.equal( oRowRepeater.isBound(), false , "not bound yet");
		assert.ok( oRowRepeater.bindRows("/data",oRowTemplate));
		assert.equal( oRowRepeater.isBound(), true , "now it is bound");
	});

	QUnit.test("Test ShowMore Feature (1)", function(assert) {
		var done = assert.async();
		assert.equal( oRowRepeater.getNumberOfRows(), 10, "10 rows are expected to be visible at the start" );
		assert.ok( oRowRepeater.setShowMoreSteps(0), "setting ShowMoreSteps to zero" );
		assert.ok( oRowRepeater.triggerShowMore(), "triggering show more" );
		assert.ok( oRowRepeater.setShowMoreSteps(3), "setting ShowMoreSteps to 3" );
		setTimeout(function() {
			done();
		}, 1500);
	});

	QUnit.test("Test ShowMore Feature (2)", function(assert) {
		var done = assert.async();
		assert.ok( oRowRepeater.triggerShowMore(), "triggering show more" );
		assert.ok( oRowRepeater.triggerShowMore(), "triggering show more" );
		assert.ok( oRowRepeater.triggerShowMore(), "triggering show more" );
		setTimeout(function() {
			assert.equal(oRowRepeater.getNumberOfRows(), 19, "19 rows are expected to be visible at the end");
			done();
		}, 1500);
	});

	QUnit.test("Test Resize Feature", function(assert) {
		var done = assert.async();
		assert.equal( oRowRepeater.getNumberOfRows(), 19, "19 rows are expected to be visible at the start" );
		assert.ok( oRowRepeater.setShowMoreSteps(0), "setting ShowMoreSteps to zero" );
		assert.ok( oRowRepeater.resize(5), "resize to 5 with ShowMoreSteps set to zero" );
		assert.equal( oRowRepeater.getNumberOfRows(), 19, "19 rows are still expected" );
		assert.ok( oRowRepeater.setShowMoreSteps(3), "setting ShowMoreSteps to 3" );
		assert.ok( oRowRepeater.resize(10), "resize to 10" );
		assert.ok( oRowRepeater.resize(20), "resize to 20" );
		assert.ok( oRowRepeater.resize(7), "resize to 7" );
		setTimeout(function() {
			assert.equal(oRowRepeater.getNumberOfRows(), 7, "7 rows are expected to be visible at the end");
			done();
		}, 1500);
	});

	QUnit.test("Test Paging Behaviour", function(assert) {
		var done = assert.async();
		assert.ok( oRowRepeater.gotoPage(5), "try to go to page 5, which should not work" );
		assert.equal( oRowRepeater.getCurrentPage(), 1, "we should still be on page 1" );
		assert.ok( oRowRepeater.setShowMoreSteps(0), "setting ShowMoreSteps to zero" );
		assert.ok( oRowRepeater.gotoPage(5), "go to page 5" );
		assert.ok( oRowRepeater.firstPage(), "go to first page" );
		assert.ok( oRowRepeater.lastPage(), "go to last page" );
		assert.ok( oRowRepeater.firstPage(), "go to first page" );
		assert.ok( oRowRepeater.nextPage(), "go to next page" );
		assert.ok( oRowRepeater.nextPage(), "go to next page" );
		assert.ok( oRowRepeater.nextPage(), "go to next page" );
		assert.ok( oRowRepeater.previousPage(), "go to previous page" );
		assert.ok( oRowRepeater.previousPage(), "go to previous page" );
		assert.ok( oRowRepeater.previousPage(), "go to previous page" );
		setTimeout(function() {
			assert.equal(oRowRepeater.getCurrentPage(), 1, "we should again be on page 1");
			done();
		}, 4000);
	});

	QUnit.test("Test Filter Aggregation", function(assert) {
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
		assert.ok( oRowRepeater.addFilter(new RowRepeaterFilter("test_filter_1",{text:"Test",filters:[new Filter("index", "NE", "Test")],tooltip:"Test"})), "filter added");
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
		assert.ok( oRowRepeater.insertFilter(new RowRepeaterFilter("test_filter_2",{text:"Test",filters:[new Filter("test", "EQ", "Test")],tooltip:"Test"}),0), "filter inserted");
		assert.ok( oRowRepeater.applyFilter("test_filter_1"), "filter 'test_filter_1' applied");
		assert.ok( oRowRepeater.applyFilter("test_filter_2"), "filter 'test_filter_2' applied");
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
		assert.ok( oRowRepeater.removeFilter(1), "filter removed");
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
		assert.equal(oRowRepeater.getFilters()[0].getId(), "test_filter_2", "check filter on position 1");
		assert.ok( oRowRepeater.removeAllFilters(), "all filters removed");
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
		assert.ok( oRowRepeater.addFilter(new RowRepeaterFilter("test_filter_3",{text:"Test",filters:[new Filter("test", "EQ", "Test")],tooltip:"Test"})), "filter added");
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
		assert.ok( oRowRepeater.destroyFilters(), "filters destroyed");
		assert.equal(oRowRepeater.getFilters().length,oRowRepeater.getAggregation("filterToolbar").getItems().length, "number of filters equals number of filter buttons");
	});

	QUnit.test("Test Sorter Aggregation", function(assert) {
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
		assert.ok( oRowRepeater.addSorter(new RowRepeaterSorter("test_sorter_1",{text:"Test",sorter:new Sorter("index",false),tooltip:"Test"})), "sorter added");
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
		assert.ok( oRowRepeater.insertSorter(new RowRepeaterSorter("test_sorter_2",{text:"Test",sorter:new Sorter("index",true),tooltip:"Test"}),0), "sorter inserted");
		assert.ok( oRowRepeater.triggerSort("test_sorter_1"), "sorter 'test_sorter_1' applied");
		assert.ok( oRowRepeater.triggerSort("test_sorter_2"), "sorter 'test_sorter_2' applied");
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
		assert.ok( oRowRepeater.removeSorter(1), "sorter removed");
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
		assert.equal(oRowRepeater.getSorters()[0].getId(), "test_sorter_2", "check sorter on position 1");
		assert.ok( oRowRepeater.removeAllSorters(), "all sorters removed");
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
		assert.ok( oRowRepeater.addSorter(new RowRepeaterSorter("test_sorter_3",{text:"Test",sorter:new Sorter("test")})), "sorter added");
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
		assert.ok( oRowRepeater.destroySorters(), "sorters destroyed");
		assert.equal(oRowRepeater.getSorters().length,oRowRepeater.getAggregation("sorterToolbar").getItems().length, "number of sorters equals number of sorter buttons");
	});

	QUnit.test("Test Thresholding", function(assert){
		var done = assert.async();
		var iCount = 0;
		var iReloadCount = 0;
		var iMaxLoadedContexts = 50;
		var FWsJSONListBinding = JSONListBinding.extend("FWsJSONListBinding", {
			getContexts : function(iStartIndex, iLength, iThreshold) {
				iCount++;
				assert.equal(iThreshold, 50, "Threshold value test");

				// this is only a simple check...if data should be fetched from the server
				// so no check if every data in between was loaded or not when paging backwards.
				if (iStartIndex >= iMaxLoadedContexts) {
					iMaxLoadedContexts = iStartIndex + iThreshold;
					// normally the model would trigger a new read request here
					iReloadCount++;
				}

				return JSONListBinding.prototype.getContexts.apply(this, arguments);
			}
		});
		var FWsJSONModel = JSONModel.extend("FWsJSONModel", {
			bindList : function(sPath, oContext, oSorter, aFilters, mParameters) {
				return new FWsJSONListBinding(this, sPath, oContext, oSorter, aFilters, mParameters);
			}
		});

		function createRows() {
			var rows = [];
			for (var i = 0; i < 400; i++) {
				rows.push({ id : i, name : ["Kermit", "Ms. Piggy"][i % 2] });
			}
			return rows;
		}

		var oModel = new FWsJSONModel();
		oModel.setData({ rows : createRows()});
		// create a template for the row repeater
		var oML = new MatrixLayout();
		var aControls = [];
		jQuery.each(["id", "name"], function(iIndex, sProperty) {
			aControls.push(new TextView({
				text: "{" + sProperty + "}"
			}));
		});
		oML.createRow.apply(oML, aControls);

		oRowRepeater2.setThreshold(50);
		oRowRepeater2.setModel(oModel);
		oRowRepeater2.bindRows("/rows", oML);
		oRowRepeater2.setNoData(new TextView({text: "Sorry, no data available!"}));

		// NOTE: -> some goto pages could be skipped because of animation queue optimization where only the last one is executed and so only for the
		// last one the getContext method will be called...

		assert.ok( oRowRepeater2.gotoPage(2), "go to page 2" ); // should not trigger a reload
		assert.ok( oRowRepeater2.gotoPage(4), "go to page 4" ); // should not trigger a reload -> this could be skipped
		assert.ok( oRowRepeater2.gotoPage(6), "go to page 6" ); // should trigger a reload
		assert.ok( oRowRepeater2.lastPage(), "go to last page" ); // should trigger a reload
		setTimeout(function() {
			assert.ok(iCount >= 4, "iCount test");
			assert.equal(iReloadCount, 2, "iReloadCount test");
			assert.equal(iMaxLoadedContexts, 440 , "iLoadedData test");
			done();
		}, 3000);
	});
});