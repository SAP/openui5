/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/Collection",
    "sap/ui/core/Item",
    "sap/ui/ux3/ThingViewer",
    "sap/ui/commons/Panel",
    "sap/ui/ux3/CollectionInspector"
], function(
    qutils,
	createAndAppendDiv,
	Collection,
	Item,
	ThingViewer,
	Panel,
	CollectionInspector
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");


	var oCollection1 = new Collection();
	oCollection1.setTitle("collection1");
	oCollection1.addItem(new Item({
		'text' : 'test1'
	}));
	oCollection1.addItem(new Item({
		'text' : 'test2'
	}));

	var oCollection2 = new Collection();
	oCollection2.setTitle("collection2");
	oCollection2.setMultiSelection(true);
	oCollection2.addItem(new Item({
		'text' : 'test4'
	}));
	oCollection2.addItem(new Item({
		'text' : 'test5'
	}));
	oCollection2.addItem(new Item({
		'text' : 'test6'
	}));

	var oCollection3 = new Collection();
	oCollection3.setTitle("collection3");
	oCollection3.addItem(new Item({
		'text' : 'test7'
	}));
	oCollection3.addItem(new Item({
		'text' : 'test8'
	}));
	oCollection3.addItem(new Item({
		'text' : 'test9'
	}));

	var oCollection4 = new Collection();
	oCollection4.setTitle("collection4");
	oCollection4.addItem(new Item({
		'text' : 'test10'
	}));
	oCollection4.addItem(new Item({
		'text' : 'test11'
	}));
	oCollection4.addItem(new Item({
		'text' : 'test12'
	}));

	var oContent1 = new ThingViewer();

	var oContent2 = new Panel();

	var oCollectionInspector = new CollectionInspector();
	oCollectionInspector.addCollection(oCollection1);
	oCollectionInspector.addCollection(oCollection2);
	oCollectionInspector.addCollection(oCollection3);
	oCollectionInspector.setSidebarVisible(false);
	oCollectionInspector.placeAt("uiArea1");
	oCollectionInspector.attachCollectionSelected(function(oEvent) {
		oCollectionInspector.removeAllContent();
		if (oEvent.getParameters().collection.getId() == "__collection0") {
			oCollectionInspector.addContent(oContent1);
		} else if (oEvent.getParameters().collection.getId() == "__collection1") {
			oCollectionInspector.addContent(oContent2);
		}
	});



	QUnit.module("Sidebar");

	QUnit.test("Show/Hide sidebar", function(assert) {
		var done = assert.async();
		qutils.triggerMouseEvent(oCollectionInspector.$("toggleButton"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.equal(oCollectionInspector.$('sidebar').width(), 150, "Sidebar is visible.");
			done();
		}, 600);
	});

	QUnit.test("Hide sidebar", function(assert) {
		var done = assert.async();
		qutils.triggerMouseEvent(oCollectionInspector.$("toggleButton"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.equal(oCollectionInspector.$('sidebar').width(), 0, "Sidebar is invisible.");
			done();
		}, 600);
	});

	QUnit.module("Top Navigation");

	QUnit.test("Show collection two", function(assert) {
		var done = assert.async();
		qutils.triggerMouseEvent(jQuery(document.getElementById("__button2")), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.equal(oCollectionInspector.$('sidebar').width(), 150, "Sidebar is visible.");
			done();
		}, 600);
	});

	QUnit.test("Content", function(assert) {
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection2.getId());
		assert.equal(oCollectionInspector.$('content').find('section').attr('id'), "__panel0");
		assert.equal(oCollectionInspector.$('sidebar').find('li').length, 3);
		qutils.triggerMouseEvent(jQuery(document.getElementById("__button1")), "click", 1, 1, 1, 1);
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection1.getId());
		assert.equal(oCollectionInspector.$('content').find('div').attr('id'), "__viewer0");
		assert.equal(oCollectionInspector.$('sidebar').find('li').length, 2);
		qutils.triggerMouseEvent(jQuery(document.getElementById("__button3")), "click", 1, 1, 1, 1);
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection3.getId());
	});

	QUnit.module("Sidebar Navigation");
	QUnit.test("Select items", function(assert) {
		qutils.triggerMouseEvent(jQuery(document.getElementById("__button1")), "click", 1, 1, 1, 1);
		var oSelectedCollection = sap.ui.getCore().byId(oCollectionInspector.getSelectedCollection());
		oSelectedCollection.addSelectedItem(oSelectedCollection.getItems()[0]);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		oSelectedCollection.addSelectedItem(oSelectedCollection.getItems()[1]);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		qutils.triggerMouseEvent(jQuery(document.getElementById("__button2")), "click", 1, 1, 1, 1);
		oSelectedCollection = sap.ui.getCore().byId(oCollectionInspector.getSelectedCollection());
		oSelectedCollection.addSelectedItem(oSelectedCollection.getItems()[0]);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(3)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		oSelectedCollection.addSelectedItem(oSelectedCollection.getItems()[1]);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(3)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		oSelectedCollection.removeSelectedItem(oSelectedCollection.getItems()[0]);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(3)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		oSelectedCollection.addSelectedItem(oSelectedCollection.getItems()[0]);
		oSelectedCollection.addSelectedItem(oSelectedCollection.getItems()[2]);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(3)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		oSelectedCollection.removeAllSelectedItems();
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(1)').hasClass("sapUiUx3CICollectionListItemSelected"), true);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(2)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
		assert.equal(oCollectionInspector.$('sidebar').find('ul li:nth-child(3)').hasClass("sapUiUx3CICollectionListItemSelected"), false);
	});

	QUnit.module("Setter");

	QUnit.test("Set methods", function(assert){
		oCollectionInspector.setSelectedCollection(oCollection2);
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection2.getId());
		oCollectionInspector.setSelectedCollection(oCollection1);
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection1.getId());
		oCollectionInspector.setSelectedCollection(oCollection3);
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection3.getId());
	});

	QUnit.test("Single/MultiSelections", function(assert){
		oCollectionInspector.setSelectedCollection(oCollection2);
		assert.equal(oCollectionInspector.getSelectedCollection(), oCollection2.getId());
		oCollection2.removeAllSelectedItems();
		oCollection2.setMultiSelection(true);
		oCollection2.addSelectedItem(oCollection2.getItems()[0]);
		oCollection2.addSelectedItem(oCollection2.getItems()[1]);
		oCollection2.addSelectedItem(oCollection2.getItems()[2]);
		assert.deepEqual(oCollection2.getSelectedItems(), [oCollection2.getItems()[0].getId(),oCollection2.getItems()[1].getId(),oCollection2.getItems()[2].getId()]);
		oCollection2.setMultiSelection(false);
		assert.deepEqual(oCollection2.getSelectedItems(), [oCollection2.getItems()[0].getId()]);
	});

	QUnit.test("Editable / Not editable", function(assert){
		assert.equal(oCollection2.getEditable(), false);
		assert.equal(oCollectionInspector.$('sidebar').find('> button').length, 0);
		oCollection2.setEditable(true);
		assert.equal(oCollection2.getEditable(), true);
		assert.equal(oCollectionInspector.$('sidebar').find('> button').length, 1);
	});

	QUnit.module("Collection Operation");
	QUnit.test("Insert collection", function(assert){
			assert.equal(oCollectionInspector.getCollections().length, 3);
			assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
			assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
			assert.equal(oCollectionInspector.getCollections()[2], oCollection3);
			assert.equal(oCollectionInspector.$('selector').find('button').length, 3);
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection3");
			oCollectionInspector.insertCollection(oCollection4, 2);
			assert.equal(oCollectionInspector.getCollections().length, 4);
			assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
			assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
			assert.equal(oCollectionInspector.getCollections()[2], oCollection4);
			assert.equal(oCollectionInspector.getCollections()[3], oCollection3);
			assert.equal(oCollectionInspector.$('selector').find('button').length, 4);
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection4");
			assert.equal(oCollectionInspector.$('selector').find('button:nth-child(4)').html(), "collection3");
		});

	QUnit.test("Remove collection", function(assert){
		assert.equal(oCollectionInspector.getCollections().length, 4);
		assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
		assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
		assert.equal(oCollectionInspector.getCollections()[2], oCollection4);
		assert.equal(oCollectionInspector.getCollections()[3], oCollection3);
		assert.equal(oCollectionInspector.$('selector').find('button').length, 4);
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection4");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(4)').html(), "collection3");
		oCollectionInspector.removeCollection(oCollection4);
		assert.equal(oCollectionInspector.getCollections().length, 3);
		assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
		assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
		assert.equal(oCollectionInspector.getCollections()[2], oCollection3);
		assert.equal(oCollectionInspector.$('selector').find('button').length, 3);
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection3");
	});

	QUnit.test("add collection", function(assert){
		assert.equal(oCollectionInspector.getCollections().length, 3);
		assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
		assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
		assert.equal(oCollectionInspector.getCollections()[2], oCollection3);
		assert.equal(oCollectionInspector.$('selector').find('button').length, 3);
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection3");
		oCollectionInspector.addCollection(oCollection4);
		assert.equal(oCollectionInspector.getCollections().length, 4);
		assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
		assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
		assert.equal(oCollectionInspector.getCollections()[2], oCollection3);
		assert.equal(oCollectionInspector.getCollections()[3], oCollection4);
		assert.equal(oCollectionInspector.$('selector').find('button').length, 4);
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection3");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(4)').html(), "collection4");
	});

	QUnit.test("Remove all collections", function(assert){
		assert.equal(oCollectionInspector.getCollections().length, 4);
		assert.equal(oCollectionInspector.getCollections()[0], oCollection1);
		assert.equal(oCollectionInspector.getCollections()[1], oCollection2);
		assert.equal(oCollectionInspector.getCollections()[2], oCollection3);
		assert.equal(oCollectionInspector.getCollections()[3], oCollection4);
		assert.equal(oCollectionInspector.$('selector').find('button').length, 4);
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(1)').html(), "collection1");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(2)').html(), "collection2");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(3)').html(), "collection3");
		assert.equal(oCollectionInspector.$('selector').find('button:nth-child(4)').html(), "collection4");
		oCollectionInspector.removeAllCollections();
		assert.equal(oCollectionInspector.getCollections().length, 0);
		assert.equal(oCollectionInspector.$('selector').find('button').length, 0);
	});

	QUnit.module("Content Operations");

	QUnit.test("Add content", function(assert){
		assert.equal(oCollectionInspector.getContent().length, 1);
		assert.equal(oCollectionInspector.getContent()[0], oContent2);
		oCollectionInspector.addContent(oContent1);
		assert.equal(oCollectionInspector.getContent().length, 2);
		assert.equal(oCollectionInspector.getContent()[0], oContent2);
		assert.equal(oCollectionInspector.getContent()[1], oContent1);
	});

	QUnit.test("remove content", function(assert){
		assert.equal(oCollectionInspector.getContent().length, 2);
		assert.equal(oCollectionInspector.getContent()[0], oContent2);
		assert.equal(oCollectionInspector.getContent()[1], oContent1);
		oCollectionInspector.removeContent(oContent2);
		assert.equal(oCollectionInspector.getContent().length, 1);
		assert.equal(oCollectionInspector.getContent()[0], oContent1);
	});

	QUnit.test("insert content", function(assert){
		assert.equal(oCollectionInspector.getContent().length, 1);
		assert.equal(oCollectionInspector.getContent()[0], oContent1);
		oCollectionInspector.insertContent(oContent2,0);
		assert.equal(oCollectionInspector.getContent().length, 2);
		assert.equal(oCollectionInspector.getContent()[0], oContent2);
		assert.equal(oCollectionInspector.getContent()[1], oContent1);
	});

	QUnit.test("remove all content", function(assert){
		assert.equal(oCollectionInspector.getContent().length, 2);
		assert.equal(oCollectionInspector.getContent()[0], oContent2);
		assert.equal(oCollectionInspector.getContent()[1], oContent1);
		oCollectionInspector.removeAllContent();
		assert.equal(oCollectionInspector.getContent().length, 0);
	});
});