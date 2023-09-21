/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Sorter",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/Core",
	"sap/ui/test/TestUtils"
], function(createAndAppendDiv, jQuery, JSONModel, ODataV4Model, Sorter, List, StandardListItem, App, Page, oCore, TestUtils) {
	"use strict";
	createAndAppendDiv("content");


	var data = {persons:[
		{name:"Adalbert"},
		{name:"Anna"},
		{name:"Karl"},
		{name:"Berta"},
		{name:"Maik"},
		{name:"Franz"},
		{name:"Andrea"},
		{name:"Paula"},
		{name:"Karl"},
		{name:"Adelheid"},
		{name:"Brimborium"},
		{name:"Astrid"},
		{name:"Bernd"},
		{name:"Britta"},
		{name:"Friedrich"},
		{name:"Fritz"},
		{name:"Ede"},
		{name:"Eduard"},
		{name:"Nicolas"}
	]};

	var data2 = {persons:[
		{name:"Adalbert2"},
		{name:"Berta2"},
		{name:"Caesar2"},
		{name:"Dora2"},
		{name:"Ede2"},
		{name:"Franz2"},
		{name:"Gerald2"},
		{name:"Hermann2"},
		{name:"Iwona2"},
		{name:"Joker2"},
		{name:"Konrad2"}
	]};

	var model = new JSONModel();
	model.setData(data);
	oCore.setModel(model);

	// the List
	var gl = new List("gl", {
		growingThreshold: 3,
		growing : true
	});

	var oTemplate = new StandardListItem({
		title: "{name}"
	});

	var oSorter = new Sorter("name", false, function(oContext){
		return oContext.getProperty("name").charAt(0); // group by first letter of name
	});

	gl.bindItems({
		path:"/persons",
		template:oTemplate,
		sorter:oSorter
	});


	var app = new App("myApp", {
		initialPage: "page1",
		pages: [
			new Page("page1", {
				title: "GrowingList",
				content: gl
			})
		]
	});

	function $ul() {
		return jQuery("#gl-listUl");
	}

	function info(index) {
		var $Item = $ul().children(":eq(" + index + ")");
		var bHeader = $Item.hasClass("sapMGHLI");
		var sText = bHeader ? $Item.find(".sapMGHLITitle").text() : $Item.find(".sapMSLITitleOnly").text();
		return {
			header: bHeader,
			text: sText
		};
	}


	// Tests

	QUnit.test("GrowingList rendered", function(assert) {
		gl.addEventDelegate({
			onAfterRendering: function(){
				assert.ok("Complete rendering happened");
			}
		});

		assert.expect(10); // incl. rendering
		app.placeAt("content");
		oCore.applyChanges();
		assert.ok(document.getElementById("gl"), "GrowingList should be rendered");
		assert.equal($ul().length, 1, "GrowingList should have its list rendered");
		assert.equal($ul().children().length, 4, "GrowingList should have one header and three items rendered");

		assert.equal(info(0).header, true, "First item should be a header");
		assert.equal(info(0).text, "A", "First item should be titled 'A'");
		assert.equal(info(1).header, false, "Second item should not be a header");
		assert.equal(info(1).text, "Adalbert", "Second item should be titled 'Adalbert'");
		assert.equal(info(2).header, false, "Third item should not be a header");
		assert.equal(info(2).text, "Adelheid", "Third item should be titled 'Adelheid'");
	});

	QUnit.test("Grow Tap", function(assert){
		var done = assert.async();
		assert.expect(5); // no rerendering
		gl._oGrowingDelegate.requestNewPage(); // this context should be the trigger list item
		window.setTimeout(function(){
			assert.equal($ul().children().length, 8, "GrowingList should have two headers and six items rendered");

			assert.equal(info(6).header, true, "Sixth item should be a header");
			assert.equal(info(6).text, "B", "Sixth item should be titled 'B'");
			assert.equal(info(7).header, false, "Seventh item should not be a header");
			assert.equal(info(7).text, "Bernd", "Seventh item should be titled 'Bernd'");

			done();
		}, 0);
	});

	QUnit.test("change data property", function(assert){
		var done = assert.async();
		assert.expect(5);
		model.setProperty("name", "Adx", gl.getItems()[1].getBindingContext());

		window.setTimeout(function(){
			assert.equal($ul().children().length, 8, "GrowingList should still have two headers and six items rendered");

			assert.equal(info(1).header, false, "Second item should not be a header");
			assert.equal(info(1).text, "Adelheid", "Second item should be titled 'Adelheid'");
			assert.equal(info(2).header, false, "Third item should not be a header");
			assert.equal(info(2).text, "Adx", "Third item should be titled 'Adx'");

			done();
		}, 0);
	});

	QUnit.test("New Data", function(assert) {
		assert.expect(7);
		model.setData(data2);
		oCore.applyChanges();
		assert.equal($ul().children().length, 12, "GrowingList should have six headers and six items rendered");

		assert.equal(info(0).header, true, "First item should be a header");
		assert.equal(info(0).text, "A", "First item should be titled 'A'");
		assert.equal(info(1).header, false, "Second item should not be a header");
		assert.equal(info(1).text, "Adalbert2", "Second item should be titled 'Adalbert2'");
		assert.equal(info(2).header, true, "Third item should be a header");
		assert.equal(info(2).text, "B", "Third item should be titled 'Adelheid'");
	});

	QUnit.test("Group/Ungroup", function(assert) {
		var oBinding = gl.getBinding("items");
		oBinding.sort(new Sorter("", false, function(oContext){
			return oContext.getProperty("name").charAt(0);
		}));
		oCore.applyChanges();
		assert.ok(info(0).header, "First item should be a group header");

		oBinding.sort();
		oCore.applyChanges();
		assert.notOk(info(0).header, "The group header should be removed");
	});

	QUnit.module("OData V4", {
		before: function() {
			// The TestUtils FakeServer Cannot be used together with the sap.ui.core.util.MockServer!
			this.oFakeServer = TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/demokit/sample/odata/v4/Products/data", {
				"/MyService/$metadata": {
					source: "metadata.xml"
				},
				"/MyService/ProductList(ProductID='DD402')/PRODUCT_2_BP?$skip=0&$top=2": {
					message: {value: [{CompanyName: "Super Corp."}, {CompanyName: "International Fraud Ltd."}]}
				},
				"/MyService/ProductList(ProductID='DD424')/PRODUCT_2_BP?$skip=0&$top=2": {
					message: {value: [{CompanyName: "Food Store"}, {CompanyName: "Fishing Shop"}]}
				},
				"/MyService/ProductList(ProductID='DD522')/PRODUCT_2_BP?$skip=0&$top=2": {
					code: 500,
					message: {error: {code: "010", message: {value: "The requested entity does not exist."}}}
				}
			});
		},
		beforeEach: function() {
			this.oModel = new ODataV4Model({
				serviceUrl: "/MyService/",
				operationMode: "Server"
			});
			this.oList = new List({
				growing: true,
				growingThreshold: 2,
				items: {
					path: "",
					template: new StandardListItem({title: "{CompanyName}"})
				},
				models: this.oModel,
				bindingContexts: this.oModel.createBindingContext("/ProductList(ProductID='DD402')/PRODUCT_2_BP")
			});

			this.oList.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oList.destroy();
		},
		after: function() {
			this.oFakeServer.restore();
		}
	});

	QUnit.test("Change binding context", function(assert) {
		var that = this;

		return new Promise(function(resolve) {
			that.oList.attachEventOnce("updateFinished", resolve);
		}).then(function() {
			assert.ok(that.oList.getItems().length === 2, "List has items");
			assert.ok(!that.oList.getDomRef("nodata"), "NoData not visible");
			return new Promise(function(resolve) {
				that.oList.setBindingContext(that.oModel.createBindingContext("/ProductList(ProductID='DD522')/PRODUCT_2_BP"));
				that.oList.attachEventOnce("updateFinished", resolve);
			});
		}).then(function() {
			assert.ok(that.oList.getItems().length === 0, "List has no items");
			assert.ok(that.oList.getDomRef("nodata"), "NoData visible");
			return new Promise(function(resolve) {
				that.oList.setBindingContext(that.oModel.createBindingContext("/ProductList(ProductID='DD424')/PRODUCT_2_BP"));
				that.oList.attachEventOnce("updateFinished", resolve);
			});
		}).then(function() {
			assert.ok(that.oList.getItems().length === 2, "List has items");
		});
	});
});