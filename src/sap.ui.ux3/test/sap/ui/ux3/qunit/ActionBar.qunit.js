/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/ThingAction",
	"sap/ui/ux3/ActionBar",
	"sap/ui/commons/Panel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/ux3/library"
], function(
	qutils,
	createAndAppendDiv,
	ThingAction,
	ActionBar,
	Panel,
	jQuery,
	Device,
	ux3Library
) {
	"use strict";

	// shortcut for sap.ui.ux3.FollowActionState
	var FollowActionState = ux3Library.FollowActionState;


	// prepare DOM
	createAndAppendDiv("uiArea1");



	//Specify business actions "create", "delete" and "duplicate"
	var oCreateAction = new ThingAction({
		id : "create",
		text : "Create Survey"
	});

	var oDeleteAction =  new ThingAction({
		id : "delete",
		text : "Delete"
	});

	var oDuplicateAction = new ThingAction({
		id : "duplicate",
		text : "Duplicate"
	});


	var oActionBar1 = new ActionBar({
		id : "ActionBar0001",
		businessActions: [ oCreateAction, oDeleteAction, oDuplicateAction ]
	});


	var oEventData = {};

	//event handler for standard and business actions
	oActionBar1.attachActionSelected(function(oControlEvent) {
		oEventData.action = oControlEvent.getParameters().id;
		oEventData.state = oControlEvent.getParameters().state;
	});



	//event handler for submitted feeds
	oActionBar1.attachFeedSubmit(function(oEvent) {
		QUnit.config.current.assert.ok(true, "feed submit event handler has been executed."); // this test tests by just being counted in the respective test
		var text = oEvent.getParameter("text");
		QUnit.config.current.assert.equal(text, "my feed entry", "Feed text should be 'my feed entry'");
	});

	//Create a panel instance
	var oPanel1 = new Panel("panel1");
	//Add actionBar to the panel's content area
	oPanel1.addContent(oActionBar1);
	oPanel1.placeAt("uiArea1");

	// TEST functions
	QUnit.module("Appearance");
	//Test social action
	QUnit.test("Set thing icon", function(assert) {
		oActionBar1.setThingIconURI("test-resources/sap/ui/ux3/images/Account_48.png");
		assert.ok(oActionBar1.getThingIconURI() == "test-resources/sap/ui/ux3/images/Account_48.png", "Thin icon uri: " + oActionBar1.getThingIconURI());
	});


	// TEST functions
	QUnit.module("Social Actions");
	//Test social action
	QUnit.test("Count visible social actions", function(assert) {
		var iVisibleChildCount = oActionBar1.$("socialActions").children(":visible").length;
		assert.ok(iVisibleChildCount == 5, iVisibleChildCount + " social actions visible");
	});

	QUnit.test("Open Feed and close it again", function(assert) {
		var done = assert.async();
		assert.expect(2);
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Update"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.equal(oActionBar1.$("UpdateActionPopup").length, 1,
				"Rendered update popup should be available in the page");
			oActionBar1.closePopups();
			setTimeout(function() {
				assert.equal(oActionBar1.$("UpdateActionPopup").length, 0,
				"Rendered update popup should have been removed from the page");
				done();
			}, 500);
		}, 500);
	});

	QUnit.test("Press \"Create an Update\" (Feed)", function(assert) {
		var done = assert.async();
		assert.expect(4);
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Update"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.ok(oActionBar1.getDomRef("UpdateActionPopup"), "Rendered update popup should exist in the page");
			jQuery(jQuery(".sapUiFeederInput")[0]).trigger("focus");
			setTimeout(function() {
				jQuery(".sapUiFeederInput")[0].innerHTML = "my feed entry";
				setTimeout(function() {
					jQuery(jQuery(".sapUiFeederInput")[0]).trigger("keyup");
					setTimeout(function() {
						//click on feed submit button should hide comment popup
						qutils.triggerMouseEvent(oActionBar1.getDomRef('Feeder-send'), "click", 1, 1, 1, 1);
						setTimeout(function() {
							assert.equal(oActionBar1.$("UpdateActionPopup").length, 0,
								"Rendered update popup should have been removed from the page");
							done();
						}, 500);
					}, 500);
				}, 500);
			}, 500);
		}, 500);
	});

	// Following test case has caused occasional trouble when being executed on internet explorer 9
	// What is being tested works on ie. To be save for automatic tests, the timeout for internet explorer
	// tests is twice as big as usual.
	var iTimeOut = 500;
	if (Device.browser.msie) {
		iTimeOut = 1000;
	}


	QUnit.test("Press \"Follow Toggle\" ", function(assert) {
		var done = assert.async();
		assert.expect(14);
		assert.equal(oActionBar1.getFollowState(), FollowActionState.Default, "Follow State is sap.ui.ux3.FollowActionState.Default");
		// trigger follow
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Follow"), "click", 1, 1, 1, 1);
		assert.equal(oActionBar1.getFollowState(), FollowActionState.Follow, "Follow State is sap.ui.ux3.FollowActionState.Follow");
		// menu must exist after click
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Follow"), "click", 1, 1, 1, 1);
		assert.ok(oActionBar1.getDomRef("followActionMenu"), "Rendered Follow Action menu should exist in the page");

		setTimeout(function() {
			// menu entries with unhold and unfollow must exist
			assert.ok(oActionBar1.getDomRef("holdState"), "Rendered Follow Action menu with holdState should exist in the page");
			assert.ok(oActionBar1.getDomRef("unfollowState"), "Rendered Follow Action menu with unfollowState should exist in the page");
			// trigger hold
			qutils.triggerMouseEvent(oActionBar1.getDomRef("holdState"), "click", 1, 1, 1, 1);
			assert.equal(oActionBar1.getFollowState(), FollowActionState.Hold, "Follow State is sap.ui.ux3.FollowActionState.Hold");
			// menu must exist after click
			qutils.triggerMouseEvent(oActionBar1.getDomRef("Follow"), "click", 1, 1, 1, 1);
			assert.ok(oActionBar1.getDomRef("followActionMenu"), "Rendered Follow Action menu should exist in the page");

			setTimeout(
					function() {
						// menu entries with unhold and unfollow must exist
						assert.ok(oActionBar1.getDomRef("unholdState"),
								"Rendered Follow Action menu with unholdState should exist in the page");
						assert.ok(oActionBar1.getDomRef("unfollowState"),
								"Rendered Follow Action menu with unfollowState should exist in the page");
						// trigger unfollow
						qutils.triggerMouseEvent(oActionBar1.getDomRef("unfollowState"), "click", 1, 1, 1, 1);
						assert.ok(oActionBar1.$("Follow").hasClass("sapUiUx3ActionBarAction"), "Follow Icon has class sapUiUx3ActionBarAction");
						assert.equal(oActionBar1.getFollowState(), FollowActionState.Default, "Follow State is sap.ui.ux3.FollowActionState.Default");

						setTimeout(function() {
							// menu entries with hold, unhold and unfollow must not exist only follow
							assert.ok(!oActionBar1.getDomRef("holdState"),
									"Rendered Follow Action menu with holdState should not exist in the page");
							assert.ok(!oActionBar1.getDomRef("unholdState"),
									"Rendered Follow Action menu with unholdState should not exist in the page");
							assert.ok(!oActionBar1.getDomRef("unfollowState"),
									"Rendered Follow Action menu with unfollowState should not exist in the page");
							done();
						}, iTimeOut);
					}, iTimeOut);
		}, iTimeOut);

	});



	QUnit.test("Press \"Follow Up Toggle Pressed\" ", function(assert) {
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Flag"), "click");
		assert.ok(oEventData.action == "Flag" && oEventData.state == true,
				"ActionId: " + oEventData.action + ", State: " + oEventData.state);
	});

	QUnit.test("Press \"Follow Up Toggle Default\" ", function(assert) {
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Flag"), "click");
		assert.ok(oEventData.action == "Flag" && oEventData.state == false,
				"ActionId: " + oEventData.action + ", State: " + oEventData.state);
	});

	QUnit.test("Press \"Favorite Toggle Pressed\" ", function(assert) {
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Favorite"), "click");
		assert.ok(oEventData.action == "Favorite" && oEventData.state == true,
				"ActionId: " + oEventData.action + ", State: " + oEventData.state);
	});

	QUnit.test("Press \"Favorite Toggle Default\" ", function(assert) {
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Favorite"), "click");
		assert.ok(oEventData.action == "Favorite" && oEventData.state == false,
				"ActionId: " + oEventData.action + ", State: " + oEventData.state);
	});

	QUnit.test("Press \"Open Thing\" ", function(assert) {
		qutils.triggerMouseEvent(oActionBar1.getDomRef("Open"), "click");
		assert.ok(oEventData.action == "Open", "ActionId: " + oEventData.action);
	});



	QUnit.test("Hide social actions using \"setShow...\" properties", function(assert) {

		oActionBar1.setShowUpdate(false);
		oActionBar1.setShowFollow(false);
		oActionBar1.setShowFlag(false);
		oActionBar1.setShowFavorite(false);
		oActionBar1.setShowOpen(false);
		var iVisibleChildCount = oActionBar1.$("socialActions").children(":visible").length;
		assert.ok(iVisibleChildCount == 0, iVisibleChildCount + " social actions visible");
	});

	QUnit.test("Show social actions using \"setShow...\" properties", function(assert) {

		oActionBar1.setShowUpdate(true);
		oActionBar1.setShowFollow(true);
		oActionBar1.setShowFlag(true);
		oActionBar1.setShowFavorite(true);
		oActionBar1.setShowOpen(true);
		var iVisibleChildCount = oActionBar1.$("socialActions").children(":visible").length;
		assert.ok(iVisibleChildCount == 5, iVisibleChildCount + " social actions visible");
	});

	QUnit.test("Press social actions programmatically using setter function", function(assert) {
		var done = assert.async();
		assert.expect(3);
		oActionBar1.setFollowState(FollowActionState.Follow);
		oActionBar1.setFlagState(true);
		oActionBar1.setFavoriteState(true);


		setTimeout(function() {
			assert.ok(oActionBar1.$("Follow").hasClass("Follow"),
					"Follow Icon is set");
			assert.ok(oActionBar1.$("Flag").hasClass("Selected"),
				"Flag Icon is set");
			assert.ok(oActionBar1.$("Favorite").hasClass("Selected"),
				"Favorite Icon is set");
			done();
		}, iTimeOut);
	});



	QUnit.module("Business Actions");

	//Test business action events
	QUnit.test("Test business action events", function(assert) {
		qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenuButton"), "click");
		qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenu-MenuItem-create"), "click");
		assert.ok(oEventData.action == "create", "ActionId: " + oEventData.action );

		qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenuButton"), "click");
		qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenu-MenuItem-delete"), "click");
		assert.ok(oEventData.action == "delete", "ActionId: " + oEventData.action );

		qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenuButton"), "click");
		qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenu-MenuItem-duplicate"), "click");
		assert.ok(oEventData.action == "duplicate", "ActionId: " + oEventData.action );

	});

	QUnit.test("Disable a business action in \"More\" menu", function(assert) {
		var done = assert.async();
		assert.expect(1);
		oCreateAction.setEnabled(false);
		setTimeout(function() {
			qutils.triggerMouseEvent(oActionBar1.getDomRef("MoreMenuButton"), "click");
			var bIsDisabled = oActionBar1.$("MoreMenu-MenuItem-create").hasClass("sapUiMnuItmDsbl");
			assert.ok(bIsDisabled, "Create action is disabled");
			done();
		}, 500);
	});



	QUnit.test("Show business action buttons in \"action bar\"", function(assert) {
		var done = assert.async();
		assert.expect(1);
		oActionBar1.setAlwaysShowMoreMenu(false);
		setTimeout(function() {
			var iVisibleChildCount = oActionBar1.$("businessActions").children(":visible").length;
			assert.ok(iVisibleChildCount == 3, iVisibleChildCount + " business action buttons visible");
			done();
		}, 500);
	});

	QUnit.test("Remove two business actions: one directly, one by its Id", function(assert) {
		oActionBar1.removeBusinessAction(oCreateAction);
		oActionBar1.removeBusinessAction('duplicate');
		var iVisibleChildCount = oActionBar1.$("businessActions").children(":visible").length;
		assert.ok(iVisibleChildCount == 1, iVisibleChildCount + " business action buttons visible");
	});

	QUnit.test("Remove all business actions", function(assert) {
		oActionBar1.removeAllBusinessActions();
		var iVisibleChildCount = oActionBar1.$("businessActions").children(":visible").length;
		assert.ok(iVisibleChildCount == 0, iVisibleChildCount + " business action buttons visible");
	});

	QUnit.test("Add three business actions", function(assert) {
		oActionBar1.addBusinessAction(oCreateAction);
		oActionBar1.addBusinessAction(oDuplicateAction);
		oActionBar1.addBusinessAction(oDeleteAction);

		var iVisibleChildCount = oActionBar1.$("businessActions").children(":visible").length;
		assert.ok(iVisibleChildCount == 3, iVisibleChildCount + " business action buttons visible");

	});


	QUnit.test("Disable a business action in toolbar", function(assert) {
		var done = assert.async();
		assert.expect(1);
		oDeleteAction.setEnabled(false);
		setTimeout(function() {
			var bIsDisabled = oActionBar1.$("deleteButton").hasClass("sapUiBtnDsbl");
			assert.ok(bIsDisabled, "Delete action is disabled");
			done();
		}, 500);
	});


	QUnit.test("Hide business action buttons from \"action bar\"", function(assert) {
		var done = assert.async();
		assert.expect(2);
		oActionBar1.setAlwaysShowMoreMenu(true);
		setTimeout(function() {
			var iVisibleChildCount = oActionBar1.$("businessActions").children(":visible").length;
			assert.ok(iVisibleChildCount == 1, iVisibleChildCount + " business action buttons visible");
			var bVisible = oActionBar1.$("MoreMenuButton").is(":visible");
			assert.ok(bVisible, "More Menu Button is visible");
			done();
		}, 500);
	});

	QUnit.test("Show business action's buttons on \"action bar\" again and destroy them afterwards", function(assert) {
		var done = assert.async();
		assert.expect(1);
		oActionBar1.setAlwaysShowMoreMenu(false);
		oActionBar1.destroyBusinessActions();
		setTimeout(function() {
			var iVisibleChildCount = oActionBar1.$("businessActions").children(":visible").length;
			assert.ok(iVisibleChildCount == 0, iVisibleChildCount + " business action buttons visible");
			done();
		}, 500);
	});

	QUnit.test("Destroy actionBar", function(assert) {
		oActionBar1.destroy();
		assert.ok(true, "Action Bar successfully destroyed");

	});
});