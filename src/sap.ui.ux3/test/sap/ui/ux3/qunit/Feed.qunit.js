/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/Feed",
    "sap/ui/core/ListItem",
    "sap/ui/ux3/FeedChunk",
    "sap/ui/commons/MenuItem",
    "sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	Feed,
	ListItem,
	FeedChunk,
	MenuItem,
	KeyCodes
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("style", "width:80%;");



	var sEvent = "";
	var sEventParameter = "";

	function handleToggleLive(oEvent){
		sEvent = "ToggleLive";
		sEventParameter = oEvent.getParameter('live');
	}

	function handleToolsItemSelected(oEvent){
		sEvent = "ToolsItemSelected";
		sEventParameter = oEvent.getParameter('itemId');
	}

	function handleFilterChange(oEvent){
		sEvent = "FilterChange";
		sEventParameter = oEvent.getParameter('newValue');
	}

	function handleSearch(oEvent){
		sEvent = "Search";
		sEventParameter = oEvent.getParameter('query');
	}

	function handleChunkAdded(oEvent){
		sEvent = "ChunkAdded";
		sEventParameter = oEvent.getParameter('chunk');
	}

	var oFeed = new Feed("Feed1",{
		feederThumbnailSrc: 'test-resources/sap/ui/ux3/images/feeder/w_01.png',
		feederSender: 'FeederSender',
		filterItems: [ new ListItem('FilterItem1',{
										key: 'item1',
										text: 'Filter1'
										}),
									 new ListItem('FilterItem2',{
										key: 'item2',
										text: 'Filter2'
										})],
		filterChange: handleFilterChange,
		search: handleSearch,
		chunkAdded: handleChunkAdded,
		toggleLive: handleToggleLive,
		toolsItemSelected: handleToolsItemSelected,
		chunks: [ new FeedChunk("Chunk1", {
								thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
							sender: "Sender",
							text: "Text",
								timestamp: "date",
								flagged: true,
								favorite: true,
								shared: true}),
							new FeedChunk("Chunk2", {
								//thumbnailSrc: "images/feeder/male.jpg",
							sender: "Sender",
							text: "Text",
								timestamp: "date",
								flagged: false,
								favorite: true,
								shared: false,
								deletionAllowed: true,
								comments: [ new FeedChunk("commentChunk1", {
															sender: "CommentSender",
														text: "Comment",
														timestamp: "date"})
										   ]
								})
				 ]
		}).placeAt("uiArea1");


	QUnit.module("Appearance");

	QUnit.test("Output of elements", function(assert) {
		// feeder
		assert.ok(jQuery(document.getElementById("Feed1")).children(".sapUiFeeder").get(0), "Feeder rendered");
		assert.equal(sap.ui.getCore().getControl("Feed1-Feeder").getThumbnailSrc(), "test-resources/sap/ui/ux3/images/feeder/w_01.png", "ThumbnailSrc of feeder");

		// no menu button if no items
		assert.ok(!jQuery(document.getElementById("Feed1-toolsButton")).get(0), "No Menu button if no items");

		// live button
		assert.ok(jQuery(document.getElementById("Feed1-liveButton")).get(0), "Live button rendered");

		// filter
		assert.ok(jQuery(document.getElementById("Feed1-filter")).get(0), "filter rendered");
		assert.equal(sap.ui.getCore().getControl("Feed1-filter").getItems().length, 2, "Number of filter items");
		assert.equal(sap.ui.getCore().getControl("Feed1-filter").getItems()[0].getId(), "FilterItem1", "Id of first filter item");

		//search field
		assert.ok(jQuery(document.getElementById("Feed1-search")).get(0), "searchField rendered");

		// chunks
		assert.ok(jQuery(document.getElementById("Feed1")).children("section").get(0), "chunk section rendered");
		assert.ok(jQuery(document.getElementById("Chunk1")).get(0), "First Chunk rendered rendered");
		assert.ok(jQuery(document.getElementById("Chunk2")).get(0), "Second Chunk rendered rendered");
		assert.equal(jQuery(document.getElementById("Feed1")).children("section").children("article").get(0).id, "Chunk1", "first chunk rendered at first");

	});

	QUnit.test("add menu items", function(assert) {
		var done = assert.async();
		oFeed.addToolsMenuItem(new MenuItem('MenuItem1',{ text: 'Item1' }));
		oFeed.addToolsMenuItem(new MenuItem('MenuItem2',{ text: 'Item2' }));

		var delayedCall = function() {
			assert.ok(jQuery(document.getElementById("Feed1-toolsButton")).get(0), "Menu button rendered");
			assert.equal(sap.ui.getCore().getControl("Feed1-toolsButton").getMenu().getItems().length, 2, "Number of menu items");
			done();
		};
		setTimeout(delayedCall, 0);
	});

	QUnit.module("Behaviour");

	QUnit.test("live button", function(assert) {
		qutils.triggerMouseEvent("Feed1-liveButton", "click");
		assert.equal(sEvent, "ToggleLive", "Event by clicking live button");
		assert.equal(sEventParameter, false, "live state after click on live button");
		sEvent = "";
		sEventParameter = "";

		qutils.triggerMouseEvent("Feed1-liveButton", "click");
		assert.equal(sEvent, "ToggleLive", "Event by clicking live button");
		assert.equal(sEventParameter, true, "live state after click on live button");
		sEvent = "";
		sEventParameter = "";

		// if toggle button available test for toggle state
	});

	QUnit.test("menu button", function(assert) {
		qutils.triggerMouseEvent("Feed1-toolsButton", "click");
		qutils.triggerMouseEvent("MenuItem1", "click");
		assert.equal(sEvent, "ToolsItemSelected", "Event by clicking fist item of menu button");
		assert.equal(sEventParameter, "MenuItem1", "ID of clicked menu item");
		sEvent = "";
		sEventParameter = "";

	});

	QUnit.test("filter", function(assert) {
		var done = assert.async();
		window.document.getElementById("Feed1-filter").focus();
		qutils.triggerKeyboardEvent("Feed1-filter", KeyCodes.ARROW_DOWN, false, false, false);
		qutils.triggerKeyboardEvent("Feed1-filter", KeyCodes.ENTER, false, false, false);
		var delayedCall = function() {
			assert.equal(sEvent, "FilterChange", "Event by changing filter value");
			assert.equal(sEventParameter, "Filter2", "New value of filter");
			sEvent = "";
			sEventParameter = "";
			done();
		};
		setTimeout(delayedCall,0);

	});

	QUnit.test("search field", function(assert) {
		var oSearchDomRef = sap.ui.getCore().getControl("Feed1-search").getFocusDomRef();
		qutils.triggerCharacterInput(oSearchDomRef, "Test");
		qutils.triggerKeyEvent("keyup", oSearchDomRef, KeyCodes.T);
		qutils.triggerKeyboardEvent(oSearchDomRef, KeyCodes.ENTER, false, false, false);
		assert.equal(sEvent, "Search", "Event by entering value in search field");
		assert.equal(sEventParameter, "Test", "search query");
		sEvent = "";
		sEventParameter = "";

	});

	QUnit.test("Add chunk", function(assert) {
		var done = assert.async();

		window.document.getElementById("Feed1-Feeder-input").focus();
		jQuery(document.getElementById("Feed1-Feeder-input")).text("Test");
		qutils.triggerKeyup("Feed1-Feeder-input", KeyCodes.T, false, false, false);
		qutils.triggerMouseEvent("Feed1-Feeder-send", "click");
		assert.equal(sEvent, "ChunkAdded", "event fired on adding a new chunk");
		assert.equal(sEventParameter.getId(), oFeed.getChunks()[0].getId(), "chunk returned from event must be the first one in aggregation");
		assert.equal(oFeed.getChunks()[0].getText(), "Test","Text of the chunk");
		assert.equal(oFeed.getChunks()[0].getSender(), "FeederSender","Sender of the chunk");
		assert.equal(oFeed.getChunks()[0].getThumbnailSrc(), "test-resources/sap/ui/ux3/images/feeder/w_01.png","Thunmnail source of the chunk");
		sEvent = "";
		sEventParameter = "";

		var delayedCall = function() {
			var aChunks = jQuery(document.getElementById("Feed1")).children("section").children("article");
			assert.equal(aChunks.get(0).id, "Feed1-new-2", "New chunk must be the first one");
			done();
		};
		setTimeout(delayedCall, 0);
	});
});