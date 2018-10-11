/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/App",
	"sap/m/Page"
], function(createAndAppendDiv, jQuery, JSONModel, Sorter, List, StandardListItem, App, Page) {
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
	sap.ui.getCore().setModel(model);

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
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.domById("gl"), "GrowingList should be rendered");
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
		sap.ui.getCore().applyChanges();
		assert.equal($ul().children().length, 12, "GrowingList should have six headers and six items rendered");

		assert.equal(info(0).header, true, "First item should be a header");
		assert.equal(info(0).text, "A", "First item should be titled 'A'");
		assert.equal(info(1).header, false, "Second item should not be a header");
		assert.equal(info(1).text, "Adalbert2", "Second item should be titled 'Adalbert2'");
		assert.equal(info(2).header, true, "Third item should be a header");
		assert.equal(info(2).text, "B", "Third item should be titled 'Adelheid'");
	});

});