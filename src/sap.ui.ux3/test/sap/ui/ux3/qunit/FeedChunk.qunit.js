/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/FeedChunk",
    "sap/ui/commons/MenuItem",
    "sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, FeedChunk, MenuItem, KeyCodes) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("style", "width:80%;");
	createAndAppendDiv("uiArea2").setAttribute("style", "width:80%;");



	var sSender = "Sender";
	var sChunkSender = "Chunk Sender";
	var sTimestamp = "date/time";
	var sEventSourceId = "";
	var sEvent = "";
	var sEventParameter = "";

	function handleDeleted(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "DELETED";
	}

	function handleSenderClicked(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "SenderClicked";
	}

	function handleReferenceClicked(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "ReferenceClicked";
		sEventParameter = oEvent.getParameter('text');
	}

	function handleToggleFlagged(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "ToggleFlagged";
		sEventParameter = oEvent.getParameter('flagged');
	}

	function handleToggleFavorite(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "ToggleFavorite";
		sEventParameter = oEvent.getParameter('favorite');
	}

	function handleToggleShared(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "ToggleShared";
		sEventParameter = oEvent.getParameter('shared');
	}

	function handleInspect(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "Inspect";
	}

	function handleActionItemSelected(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "ActionItemSelected";
		sEventParameter = oEvent.getParameter('itemId');
	}

	function handleCommentAdded(oEvent){
		sEventSourceId = oEvent.oSource.getId();
		sEvent = "CommentAdded";
		sEventParameter = oEvent.getParameter('comment');
	}

	//without comments
	var oChunk1 = new FeedChunk("Chunk1", {
		thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		sender: sSender,
		text: "Text",
		timestamp: sTimestamp,
//		feederThumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/w_01.png",
//		feederSender: 'FeederSender',
		flagged: false,
		favorite: true,
		shared: false,
		deletionAllowed: true,
		actionMenuItems: [
			new MenuItem('MenuItem1',{
				text: 'Item1'
			}),
			new MenuItem('MenuItem2',{
				text: 'Item2'
			})
		],
		deleted: handleDeleted,
		senderClicked: handleSenderClicked,
		referenceClicked: handleReferenceClicked,
		commentAdded: handleCommentAdded,
		toggleFlagged: handleToggleFlagged,
		toggleFavorite: handleToggleFavorite,
		inspect: handleInspect,
		toggleShared: handleToggleShared,
		actionItemSelected: handleActionItemSelected
	}).placeAt("uiArea1");

	// with comments
	var oChunk2 = new FeedChunk("Chunk2", {
//			thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		sender: sSender,
		text: "Line1 \nLine2 with @Reference \nLine3 \nLine4 \nLine5",
		timestamp: sTimestamp,
		feederThumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/w_01.png",
		feederSender: 'FeederSender',
		flagged: true,
		favorite: true,
		shared: true,
		deletionAllowed: false,
		deleted: handleDeleted,
		senderClicked: handleSenderClicked,
		referenceClicked: handleReferenceClicked,
		commentAdded: handleCommentAdded,
		toggleFlagged: handleToggleFlagged,
		toggleFavorite: handleToggleFavorite,
		inspect: handleInspect,
		toggleShared: handleToggleShared,
		actionItemSelected: handleActionItemSelected
	}).placeAt("uiArea2");

	oChunk2.addComment( new FeedChunk("commentChunk1", {
		sender: sChunkSender + "1",
		thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		text: "Comment Text",
		timestamp: sTimestamp,
		deleted: handleDeleted,
		senderClicked: handleSenderClicked,
		referenceClicked: handleReferenceClicked
	}));

	oChunk2.addComment( new FeedChunk("commentChunk2", {
		sender: sChunkSender + "2",
//		thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		text: "Comment Text @Reference1 and @Reference2",
		timestamp: sTimestamp,
		deletionAllowed: true,
		deleted: handleDeleted,
		senderClicked: handleSenderClicked,
		referenceClicked: handleReferenceClicked
	}));

	oChunk2.addComment( new FeedChunk("commentChunk3", {
		sender: sChunkSender + "3",
		thumbnailSrc: "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		text: "Comment Text \nnext Line \nnext line \nlast line",
		timestamp:  sTimestamp,
		deleted: handleDeleted,
		senderClicked: handleSenderClicked,
		referenceClicked: handleReferenceClicked
	}));

	var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.ux3");

	QUnit.module("Appearance");

	QUnit.test("FeedChunk styles", function(assert) {
		//without comments
		assert.ok(!oChunk1.$().children("section").get(0), "No comment section found for Chunk without comments");

		// default comment feeder if comments
		assert.ok(!oChunk1.$().find("#Chunk1-CommentFeeder").get(0), "no Defaut visible comment feeder for chunks without comments");

		//with comments
		assert.ok(oChunk2.$().children("section").get(0), "Comment section found for Chunk with comments");

		// default comment feeder if comments
		assert.ok(oChunk2.$().find("#Chunk2-CommentFeeder").get(0), "Defaut visible comment feeder for chunks with comments");
		assert.equal(sap.ui.getCore().getControl("Chunk2-CommentFeeder").getThumbnailSrc(), "test-resources/sap/ui/ux3/images/feeder/w_01.png", "comment feeder thumbnail source");

		//comment
		assert.ok(!jQuery(document.getElementById("commentChunk1")).children("section").get(0), "No comment section found for comment-Chunk");

	});

	QUnit.test("Output of Attribute", function(assert) {
		// expand button if long text
		oChunk2.addDelegate({
			onAfterRendering: function () {
				// TODO highly suspicious: creates further tests during test execution
				QUnit.test("Expand button rendering", function (assert) {
					assert.ok(oChunk2.$("exp").get(0), "Expand button rendered when the text is long");
				});
			}
		});

		// sender thumb
		assert.equal(oChunk1.$("thumb").attr("src"), "test-resources/sap/ui/ux3/images/feeder/m_01.png", "Sender image rendered for chunk");
		assert.equal(jQuery(document.getElementById("commentChunk3-thumb")).attr("src"), "test-resources/sap/ui/ux3/images/feeder/m_01.png", "Sender image rendered for comment chunk");

		// sender link
		assert.equal(oChunk1.$("sender").text(), "Sender", "Link for sender name is rendered" );

		// @-reference
		assert.equal(oChunk2.$("Ref0").text(), "@Reference", "Link for @-reference is rendered" );

		// date/time (if expand button exists only compate first part of span content)
		assert.equal(oChunk1.$().children(".sapUiFeedChunkByline").text(), sTimestamp, "Timestamp rendered for Chunk without comments");
		assert.equal(oChunk2.$().children(".sapUiFeedChunkByline").text().slice(0,sTimestamp.length), sTimestamp, "Timestamp rendered for Chunk with comments");
		assert.equal(jQuery(document.getElementById("commentChunk2")).children(".sapUiFeedChunkByline").text(), sTimestamp, "Timestamp rendered for comment-Chunk");

		// no expand button if short text
		assert.ok(!oChunk1.$("exp").get(0), "No expand button if text is short");

		// number of comments
		assert.equal(oChunk2.$().find(".sapUiFeedChunkComments").text().slice(0,1), "3", "Number of comments displayed");

		// all comments link
		assert.ok(oChunk2.$("all").get(0), "Link to show all comments displayed");

		// action menu if available
		assert.ok(oChunk1.$("toolsButton").get(0), "Action Menu Button displayed");

		// no action menu if not needen
		assert.ok(!oChunk2.$("toolsButton").get(0), "No action Menu Button displayed if no Items and not deletable");

		// status icon if active
		assert.ok(oChunk2.$().find(".sapUiFeedChunkFlagged").get(0), "Status icon flagged displayed if active");
		assert.ok(oChunk2.$().find(".sapUiFeedChunkFavorite").get(0), "Status icon favorite displayed if active");
		assert.ok(oChunk2.$().find(".sapUiFeedChunkShared").get(0), "Status icon shared displayed if active");

		// no status icon if not active
		assert.ok(!oChunk1.$().find(".sapUiFeedChunkFlagged").get(0), "No Status icon flagged displayed if not active");
		assert.ok(!oChunk1.$().find(".sapUiFeedChunkShared").get(0), "No Status icon shared displayed if not active");

		// delete button is allowed
		assert.ok(jQuery(document.getElementById("commentChunk2-delete")).get(0), "Delete button on comment chunk if deletion is allowed");

		// no delete button if not allowed
		assert.ok(!jQuery(document.getElementById("commentChunk1-delete")).get(0), "No Delete button on comment chunk if deletion is not allowed");

		// comments displayed, by default only 2
		assert.ok(!jQuery(document.getElementById("commentChunk1")).get(0) && jQuery(document.getElementById("commentChunk2")).get(0) && jQuery(document.getElementById("commentChunk3")).get(0), "Only last 2 comments displayed by default");

	});

	QUnit.module("Behaviour");

	QUnit.test("delete function", function(assert) {
		qutils.triggerMouseEvent("commentChunk2-delete", "click");
		assert.equal(sEvent, "DELETED", "Delete event fired on press on comments delete button");
		assert.equal(sEventSourceId, "commentChunk2", "Delete event on right ID");
		sEvent = "";
		sEventSourceId = "";
		qutils.triggerMouseEvent("Chunk1-toolsButton", "click");
		qutils.triggerMouseEvent("Chunk1-actDelete", "click");
		assert.equal(sEvent, "DELETED", "Delete event fired on press delete item on chunk action menu");
		assert.equal(sEventSourceId, "Chunk1", "Delete event on right ID");
		sEvent = "";
		sEventSourceId = "";
	});

	QUnit.test("Click on sender", function(assert) {
		qutils.triggerMouseEvent("Chunk1-sender", "click");
		assert.equal(sEvent, "SenderClicked", "senderClicked event on chunk");
		assert.equal(sEventSourceId, "Chunk1", "Event on right ID");
		sEvent = "";
		sEventSourceId = "";
		qutils.triggerMouseEvent("commentChunk2-sender", "click");
		assert.equal(sEvent, "SenderClicked", "senderClicked event on comment");
		assert.equal(sEventSourceId, "commentChunk2", "Event on right ID");
		sEvent = "";
		sEventSourceId = "";
	});

	QUnit.test("Click on @-reference", function(assert) {
		qutils.triggerMouseEvent("Chunk2-Ref0", "click");
		assert.equal(sEvent, "ReferenceClicked", "@-reference clicked event on chunk");
		assert.equal(sEventSourceId, "Chunk2", "Event on right ID");
		assert.equal(sEventParameter, "@Reference", "@-reference content returned by event");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";
		qutils.triggerMouseEvent("commentChunk2-Ref1", "click");
		assert.equal(sEvent, "ReferenceClicked", "@-reference clicked event on comment");
		assert.equal(sEventSourceId, "commentChunk2", "Event on right ID");
		assert.equal(sEventParameter, "@Reference2", "@-reference content returned by event");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";
	});

	QUnit.test("Click on action buttons", function(assert) {
		var done = assert.async();
		qutils.triggerMouseEvent("Chunk1-ActFlag", "click");
		assert.equal(sEvent, "ToggleFlagged", "Event fired on click on flag action button");
		assert.equal(sEventSourceId, "Chunk1", "Event on right ID");
		assert.equal(sEventParameter, true, "flgged state returned from event");
		assert.equal(oChunk1.getFlagged(), true, "flgged state returned from conrol");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";

		qutils.triggerMouseEvent("Chunk1-ActFavorite", "click");
		assert.equal(sEvent, "ToggleFavorite", "Event fired on click on favorite action button");
		assert.equal(sEventSourceId, "Chunk1", "Event on right ID");
		assert.equal(sEventParameter, false, "favorite state returned from event");
		assert.equal(oChunk1.getFavorite(), false, "favorite state returned from conrol");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";

		qutils.triggerMouseEvent("Chunk1-ActShare", "click");
		assert.equal(sEvent, "ToggleShared", "Event fired on click on share action button");
		assert.equal(sEventSourceId, "Chunk1", "Event on right ID");
		assert.equal(sEventParameter, true, "shared state returned from event");
		assert.equal(oChunk1.getShared(), true, "shared state returned from conrol");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";

		qutils.triggerMouseEvent("Chunk2-ActInspect", "click");
		assert.equal(sEvent, "Inspect", "Event fired on press on inspect action button");
		assert.equal(sEventSourceId, "Chunk2", "Delete event on right ID");
		sEvent = "";
		sEventSourceId = "";

		qutils.triggerMouseEvent("Chunk1-toolsButton", "click");
		qutils.triggerMouseEvent("MenuItem1", "click");
		assert.equal(sEvent, "ActionItemSelected", "event fired on press item on chunk action menu");
		assert.equal(sEventSourceId, "Chunk1", "Event on right ID");
		assert.equal(sEventParameter, "MenuItem1", "item in Action-MenuButton selected");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";

		var delayedCall = function() {
			assert.ok(oChunk1.$().find(".sapUiFeedChunkFlagged").get(0), "Status icon flagged displayed after action");
			assert.ok(!oChunk1.$().find(".sapUiFeedChunkFavorite").get(0), "Status icon favorite not displayed after action");
			assert.ok(oChunk1.$().find(".sapUiFeedChunkShared").get(0), "Status icon shared displayed after action");
			done();
		};
		setTimeout(delayedCall, 0);

	});

	QUnit.test("show feeder", function(assert) {
		var done = assert.async();

		// separate test to do nox mix rerendering of feeder with rerendering for status icons
		qutils.triggerMouseEvent("Chunk1-ActComment", "click");

		var delayedCall = function() {
			assert.ok(oChunk1.$().children("section").get(0), "Comment section visible after showing comment feeder");
			assert.ok(oChunk1.$().find("#Chunk1-CommentFeeder").get(0), "Comment feeder visible after pressing comment button");
			assert.ok(!oChunk1.$("all").get(0), "Link to show all comments not displayed if no comments or lesst than 3");
			done();
		};
		setTimeout(delayedCall, 0);
	});

	QUnit.test("Add comment", function(assert) {
		var done = assert.async();

		window.document.getElementById("Chunk2-CommentFeeder-input").focus();
		oChunk2.$("CommentFeeder-input").text("Test");
		qutils.triggerKeyup("Chunk2-CommentFeeder-input", KeyCodes.T, false, false, false);
		qutils.triggerMouseEvent("Chunk2-CommentFeeder-send", "click");
		assert.equal(sEvent, "CommentAdded", "event fired on adding a new comment");
		assert.equal(sEventSourceId, "Chunk2", "Event on right ID");
		var aComments = oChunk2.getComments();
		var iLastComment = aComments.length - 1;
		assert.equal(sEventParameter.getId(), aComments[iLastComment].getId(), "comment returned from event must be the last one in aggregation");
		assert.equal(aComments[iLastComment].getText(), "Test","Text of the comment");
		assert.equal(aComments[iLastComment].getSender(), "FeederSender","Sender of the comment");
		assert.equal(aComments[iLastComment].getThumbnailSrc(), "test-resources/sap/ui/ux3/images/feeder/w_01.png","Thunmnail source of the comment");
		sEvent = "";
		sEventSourceId = "";
		sEventParameter = "";

		var delayedCall = function() {
			// new comment must be displayed at last one
			aComments = oChunk2.$().children("section").children("article");
			iLastComment = aComments.length - 1;
			assert.equal(aComments.get(iLastComment).id, "Chunk2-new-3", "New comment must be the first one");

			// comment counter must be increased
			assert.equal(oChunk2.$().find(".sapUiFeedChunkComments").text().slice(0,1), "4", "Number of comments increased");

			done();
		};
		setTimeout(delayedCall, 0);
	});

	QUnit.test("show all comments", function(assert) {
		var done = assert.async();

		qutils.triggerMouseEvent("Chunk2-all", "click");

		var delayedCall = function() {
			assert.ok(oChunk2.$("new-3").get(0) && jQuery(document.getElementById("commentChunk1")).get(0) && jQuery(document.getElementById("commentChunk2")).get(0) && jQuery(document.getElementById("commentChunk3")).get(0), "All comments displayed");
			assert.equal(oChunk2.$("all").text(), rb.getText('FEED_MAX_COMMENTS'), "Link to show only max. number of comments if all comments are shown");
			done();
		};
		setTimeout(delayedCall, 0);
	});

	QUnit.test("show max comments", function(assert) {
		var done = assert.async();

		qutils.triggerMouseEvent("Chunk2-all", "click");

		var delayedCall = function() {
			assert.ok(oChunk2.$("new-3").get(0) && !jQuery(document.getElementById("commentChunk1")).get(0) && !jQuery(document.getElementById("commentChunk2")).get(0) && jQuery(document.getElementById("commentChunk3")).get(0), "Only Max. number of comments displayed");
			assert.equal(oChunk2.$("all").text(), rb.getText('FEED_ALL_COMMENTS'), "Link to show only max. number of comments if all comments are shown");
			done();
		};
		setTimeout(delayedCall, 0);
	});

	QUnit.test("expand/collapse text", function(assert) {

		assert.ok(oChunk2.$().children(".sapUiFeedChunkText").get(0).scrollHeight > oChunk2.$().children(".sapUiFeedChunkText").get(0).clientHeight, "initially text ist cut");
		qutils.triggerMouseEvent("Chunk2-exp", "click");
		assert.ok(oChunk2.$().children(".sapUiFeedChunkText").get(0).scrollHeight == oChunk2.$().children(".sapUiFeedChunkText").get(0).clientHeight, "full text is displayed after expand");
		qutils.triggerMouseEvent("Chunk2-exp", "click");
		assert.ok(oChunk2.$().children(".sapUiFeedChunkText").get(0).scrollHeight > oChunk2.$().children(".sapUiFeedChunkText").get(0).clientHeight, "text ist cut after collapse");

	});
});