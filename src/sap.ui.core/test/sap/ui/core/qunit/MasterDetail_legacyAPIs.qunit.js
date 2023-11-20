/*global QUnit*/
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/xml/XMLModel",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/StandardListItem"
], function(
	JSONModel,
	XMLModel,
	Label,
	List,
	ListItem
) {
	"use strict";
	//add divs for control tests
	var oTarget1 = document.createElement("div");
	oTarget1.setAttribute("id", "target1");
	document.body.appendChild(oTarget1);
	var oTarget2 = document.createElement("div");
	oTarget2.setAttribute("id", "target2");
	document.body.appendChild(oTarget2);

	var testdata = {
		teamMembers:[
			{firstName:"Andreas", lastName:"Klark",
				items: [{name:"Snippix"}, {name:"Chili Plants"}]},
			{firstName:"Peter", lastName:"Miller",
				items: [{name:"Android"}]},
			{firstName:"Gina", lastName:"Rush",
				items: []},
			{firstName:"Steave", lastName:"Ander",
				items: [{name:"Game1"}, {name:"Game2"}, {name:"Iron Maiden"}]},
			{firstName:"Michael", lastName:"Spring",
				items: [{name:"QueenLP"}, {name:"QueenDoll"}]},
			{firstName:"Marc", lastName:"Green",
				items: [{name:"Rioja Wine"}, {name:"Ribera del Duero Wine"}]},
			{firstName:"Frank", lastName:"Wallace",
				items: [{name:"Hair Gel"}, {name:"Shampoo"}]},
			{firstName:"Malte", lastName:"Wedel",
				items: [{name:"Ricola"}, {name:"flu shot"}]}
			],
		buddies:[
			{firstName:"John", lastName:"Doe"},
			{firstName:"Max", lastName:"Mustermann"},
			{firstName:"Lucky", lastName:"Luke"},
			{firstName:"Luke", lastName:"Skywalker"}
		]
	};

	var testdataXML = "<root><teamMembers>" +
		"<member firstName=\"Andreas\" lastName=\"Klark\" gender=\"male\">" +
			"<items><item name=\"Snippix\"></item><item name=\"Chili Plants\"></item></items></member>" +
		"<member firstName=\"Peter\" lastName=\"Miller\" gender=\"male\">" +
			"<items><item name=\"Android\"></item></items></member>" +
		"<member firstName=\"Gina\" lastName=\"Rush\" gender=\"female\">" +
			"<items></items></member>" +
		"<member firstName=\"Steave\" lastName=\"Ander\" gender=\"male\">" +
			"<items><item name=\"Game1\"></item><item name=\"Game2\"></item><item name=\"Iron Maiden\"></item></items></member>" +
		"<member firstName=\"Michael\" lastName=\"Spring\" gender=\"male\"></member>" +
		"<member firstName=\"Marc\" lastName=\"Green\" gender=\"male\"></member>" +
		"<member firstName=\"Frank\" lastName=\"Wallace\" gender=\"male\"></member>" +
	"</teamMembers> </root>";

	QUnit.test("test bind Context with JSON model and property binding", function(assert) {
		var oLabel = new Label();
		oLabel.setText("testText");
		oLabel.placeAt("target1");
		var oModel = new JSONModel();
		oModel.setData(testdata);
		sap.ui.getCore().setModel(oModel);
		assert.equal(oLabel.getText(),"testText", "old text value");
		// bind with relative path
		oLabel.bindProperty("text", "firstName");
		assert.equal(oLabel.getText(), "", "text value from model");
		oLabel.bindContext("/teamMembers/2");
		assert.equal(oLabel.getText(), "Gina", "new text value from model");
		oLabel.destroy();

	});

	QUnit.test("test2 bind Context with JSON model and property binding", function(assert) {
		var oLabel = new Label();
		oLabel.setText("testText");
		oLabel.placeAt("target1");
		var oModel = new JSONModel();
		oModel.setData(testdata);
		sap.ui.getCore().setModel(oModel);
		assert.equal(oLabel.getText(),"testText", "old text value");
		// bind with relative path
		oLabel.bindProperty("text", "lastName");
		assert.equal(oLabel.getText(), "", "text value from model");
		oLabel.bindContext("/buddies/3");
		assert.equal(oLabel.getText(), "Skywalker", "new text value from model");
		oLabel.unbindProperty("text");
		oLabel.unbindContext();
		oLabel.setText("testText");
		assert.equal(oLabel.getText(), "testText", "text value from model");
		oLabel.bindProperty("text", "firstName");
		assert.equal(oLabel.getText(), "", "text value from model");
		oLabel.bindContext("/teamMembers/4");
		assert.equal(oLabel.getText(), "Michael", "text value from model");
		oLabel.destroy();
	});

	QUnit.test("test bind Context with XML model and property binding", function(assert) {
		var oLabel = new Label();
		oLabel.setText("testText");
		oLabel.placeAt("target1");
		var oModel = new XMLModel();
		oModel.setXML(testdataXML);
		sap.ui.getCore().setModel(oModel);
		assert.equal(oLabel.getText(),"testText", "old text value");
		// bind with relative path
		oLabel.bindProperty("text", "@lastName");
		assert.equal(oLabel.getText(),"", "old text value");
		oLabel.bindContext("/teamMembers/member/3");
		assert.equal(oLabel.getText(), "Ander", "new text value from model");
		oLabel.destroy();

	});

	QUnit.test("test2 bind Context with XML model and property binding", function(assert) {
		var oLabel = new Label();
		oLabel.setText("testText");
		oLabel.placeAt("target1");
		var oModel = new XMLModel();
		oModel.setXML(testdataXML);
		sap.ui.getCore().setModel(oModel);
		assert.equal(oLabel.getText(),"testText", "old text value");
		// bind with relative path
		oLabel.bindProperty("text", "@lastName");
		assert.equal(oLabel.getText(), "", "text value from model");
		oLabel.bindContext("/teamMembers/member/3");
		assert.equal(oLabel.getText(), "Ander", "new text value from model");
		oLabel.unbindProperty("text");
		oLabel.unbindContext();
		oLabel.setText("testText");
		assert.equal(oLabel.getText(), "testText", "text value from model");
		oLabel.bindProperty("text", "@firstName");
		assert.equal(oLabel.getText(), "", "text value from model");
		oLabel.bindContext("/teamMembers/member/4");
		assert.equal(oLabel.getText(), "Michael", "text value from model");
		oLabel.destroy();
	});

	QUnit.test("test bind Context with JSON model and aggregation binding", function(assert) {
		var oLB = new List("myLb", {height:"200px"});
		var oItemTemplate = new ListItem();
		oLB.placeAt("target2");
		var oModel = new JSONModel();
		oModel.setData(testdata);
		sap.ui.getCore().setModel(oModel);
		oItemTemplate.bindProperty("title", "name");
		oLB.bindAggregation("items", "items", oItemTemplate);

		oLB.bindContext("/teamMembers/0");
		var listItems = oLB.getItems();
		assert.equal(listItems.length, 2, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[0].items[i].name, "item name");
		});
		oLB.bindContext("/teamMembers/1");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 1, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[1].items[i].name, "item name");
		});
		oLB.bindContext("/teamMembers/2");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 0, "length of items");

		oLB.bindContext("/teamMembers/3");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 3, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[3].items[i].name, "item name");
		});
		oLB.bindContext("/teamMembers/4");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 2, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[4].items[i].name, "item name");
		});
		oLB.bindContext("/teamMembers/5");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 2, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[5].items[i].name, "item name");
		});
		oLB.bindContext("/teamMembers/6");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 2, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[6].items[i].name, "item name");
		});
		oLB.bindContext("/teamMembers/7");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 2, "length of items");
		listItems.forEach( function(item, i){
			assert.equal(item.getTitle(), testdata.teamMembers[7].items[i].name, "item name");
		});
		oLB.unbindContext();
		oLB.destroy();

	});

	QUnit.test("test bind Context with JSON model and aggregation binding with wrong path", function(assert) {
		var oLB = new List("myLb", {height:"200px"});
		var oItemTemplate = new ListItem();
		oLB.placeAt("target2");
		var oModel = new JSONModel();
		oModel.setData(testdata);
		sap.ui.getCore().setModel(oModel);
		oItemTemplate.bindProperty("title", "name");
		oLB.bindAggregation("items", "items", oItemTemplate);

		oLB.bindContext("/teamMembers/yxz");
		var listItems = oLB.getItems();
		assert.equal(listItems.length, 0, "length of items");

		oLB.bindContext("xyz");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 0, "length of items");

		oLB.unbindContext();
		oLB.destroy();

	});

	QUnit.test("test bind Context with XML model and aggregation binding", function(assert) {
		var oLB = new List("myLb", {height:"200px"});
		var oItemTemplate = new ListItem();
		oLB.placeAt("target2");
		var oModel = new XMLModel();
		oModel.setXML(testdataXML);
		sap.ui.getCore().setModel(oModel);
		oItemTemplate.bindProperty("title", "@name");
		oLB.bindAggregation("items", "items/item", oItemTemplate);

		oLB.bindContext("/teamMembers/member/0");
		var listItems = oLB.getItems();
		assert.equal(listItems.length, 2, "length of items");
		assert.equal(listItems[0].getTitle(), "Snippix", "item name");
		assert.equal(listItems[1].getTitle(), "Chili Plants", "item name");

		oLB.bindContext("/teamMembers/member/1");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 1, "length of items");
		assert.equal(listItems[0].getTitle(), "Android", "item name");

		oLB.bindContext("/teamMembers/member/2");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 0, "length of items");

		oLB.bindContext("/teamMembers/member/3");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 3, "length of items");
		assert.equal(listItems[0].getTitle(), "Game1", "item name");
		assert.equal(listItems[1].getTitle(), "Game2", "item name");
		assert.equal(listItems[2].getTitle(), "Iron Maiden", "item name");

		oLB.unbindContext();
		oLB.destroy();

	});

	QUnit.test("test bind Context with XML model and aggregation binding with wrong path", function(assert) {
		var oLB = new List("myLb", {height:"200px"});
		var oItemTemplate = new ListItem();
		oLB.placeAt("target2");
		var oModel = new JSONModel();
		oModel.setData(testdata);
		sap.ui.getCore().setModel(oModel);
		oItemTemplate.bindProperty("title", "@name");
		oLB.bindAggregation("items", "items/item", oItemTemplate);

		oLB.bindContext("/teamMembers/member/3/yxz");
		var listItems = oLB.getItems();
		assert.equal(listItems.length, 0, "length of items");

		oLB.bindContext("/yxz");
		listItems = oLB.getItems();
		assert.equal(listItems.length, 0, "length of items");

		oLB.unbindContext();
		oLB.destroy();

	});
});