/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Message",
	"sap/ui/commons/library",
	"sap/ui/commons/MessageBar",
	"sap/ui/thirdparty/jquery"
], function(
	createAndAppendDiv,
	Message,
	commonsLibrary,
	MessageBar,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.commons.MessageType
	var MessageType = commonsLibrary.MessageType;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	/****************************************************
	* CREATION OF MESSAGES
	*****************************************************/
	var meliError   = new Message("meliError",   {type:MessageType.Error, text:"Error 5", longText:"Error 5 Details"});
	var meliWarning = new Message("meliWarning", {type:MessageType.Warning, text:"Warning 5", longText:"Warning 5 Details"});
	var meliSuccess = new Message("meliSuccess", {type:MessageType.Success, text:"Success 5", longText:"Success 5 Details"});

	var aMeliMelos = [];
		aMeliMelos.push(meliError);
		aMeliMelos.push(meliWarning);
		aMeliMelos.push(meliSuccess);
	var aMeliMeloIdsB = [];
		aMeliMeloIdsB.push("meliError");
		aMeliMeloIdsB.push("meliWarning");
		aMeliMeloIdsB.push("meliSuccess");

	/****************************************************
	* CREATION OF THE MESSAGEBAR
	*****************************************************/
	var msgBar = new MessageBar("msgBar");
	// There is no "sap.ui.setRoot()", as the MessageBar positions itself!
	//msgBar.placeAt("message");
	msgBar.setAnchorID("uiArea1");



	QUnit.module("MessageBar Control");
	QUnit.test("Initial Conditions", function(assert) {
		assert.equal(msgBar.getAnchorID()              ,"uiArea1","AnchorID");
		assert.equal(msgBar.getVisible()               ,true     ,"Visible");
		assert.equal(msgBar.getMaxToasted()            ,3        ,"MaxToasted");
		assert.equal(msgBar.getMaxListed()             ,7        ,"MaxListed");

		// The "uiArea1" anchor should be visible, but not the Bar nor the List:
		var jAnchor = jQuery("#uiArea1");
		var jBar    = jQuery("#msgBar");
		var jList   = jQuery("#msgBar__List");
		assert.equal((jAnchor.css('display') == "block") ,true   ,"Anchor displayed");
		assert.equal((jBar.css('display') == "block")    ,false  ,"Bar not displayed");
		assert.equal((jList.css('display') == "block")   ,false  ,"List not displayed");
	});

	QUnit.test("Messages added", function(assert) {
		// Injecting Messages:
		msgBar.addMessages(aMeliMelos);
		// Anchor and Bar should be visible, but not the List:
		var jAnchor = jQuery("#uiArea1");
		var jBar    = jQuery("#msgBar");
		var jList   = jQuery("#msgBar__List");
		assert.equal((jAnchor.css('display') == "block") ,true   ,"Anchor displayed");
		assert.equal((jBar.css('display') == "block")    ,true   ,"Bar displayed");
		assert.equal((jList.css('display') == "block")   ,false  ,"List not displayed");

		// Can't simulate a click-open of the List with some code like
		// since JavaScript checks for the "pointer" cursor being rendered!
		jQuery("msgBar__arrowImg").trigger("focus").trigger("click");
		assert.equal((jList.css('display') == "block")   ,false  ,"List not displayed");
	});

	QUnit.test("Messages removed", function(assert) {
		// Removing the previous Messages:
		msgBar.deleteMessages(aMeliMeloIdsB);
		// The "uiArea1" anchor should be visible, but not the Bar nor the List:
		var jAnchor = jQuery("#uiArea1");
		var jBar    = jQuery("#msgBar");
		var jList   = jQuery("#msgBar__List");
		assert.equal((jAnchor.css('display') == "block") ,true   ,"Anchor displayed");
		assert.equal((jBar.css('display') == "block")    ,false  ,"Bar not displayed");
		assert.equal((jList.css('display') == "block")   ,false  ,"List not displayed");
	});

	QUnit.test("Delete all messages", function (assert) {
		msgBar.addMessages(aMeliMelos);
		assert.ok(msgBar.aErrors.length > 0, "The errors should be greater than 0");
		assert.ok(msgBar.aWarnings.length > 0, "The warnings should be greater than 0");
		assert.ok(msgBar.aSuccesses.length > 0, "The successes should be greater than 0");

		msgBar.deleteAllMessages();
		assert.equal(msgBar.aErrors.length, 0, "The errors should be 0");
		assert.equal(msgBar.aWarnings.length, 0, "The warnings should be 0");
		assert.equal(msgBar.aSuccesses.length, 0, "The successes should be 0");
	});

	QUnit.test("Toggle the list", function (assert) {
		msgBar.toggleList();
		assert.ok(msgBar.oList instanceof sap.ui.commons.MessageList, "The list should be an instance of sap.ui.commons.MessageList");
		assert.ok(msgBar.$().hasClass("sapUiMsgBarOpen"));
		msgBar.toggleList();
		assert.ok(!msgBar.$().hasClass("sapUiMsgBarOpen"));
	});

	QUnit.test("Hide the MessageBar", function (assert) {
		msgBar.setVisible(false);
		assert.equal(msgBar.oPopup.isOpen(), false, "The popup should be closed");
	});

	QUnit.test("Destroy the MessageBar", function (assert) {
		msgBar.destroy();
		assert.equal(msgBar.oPopup, null, "The Popup should be destroyed");
		assert.equal(msgBar.oToast, null, "The Toast should be destroyed");
		assert.equal(msgBar.oList, null, "The List should be destroyed");
	});
});