/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/commons/library",
    "sap/ui/ux3/ThingGroup",
    "sap/ui/ux3/Shell",
    "sap/ui/ux3/ThingInspector",
    "sap/ui/ux3/ThingAction",
    "sap/ui/ux3/NavigationItem",
    "sap/ui/thirdparty/jquery",
    "sap/ui/ux3/library",
    "sap/ui/ux3/ActionBar",
    "sap/ui/commons/Label",
    "sap/ui/commons/TextView",
    "sap/ui/commons/layout/MatrixLayoutCell",
    "sap/ui/commons/layout/MatrixLayoutRow",
    "sap/ui/commons/Button",
    "sap/ui/commons/layout/MatrixLayout",
    "sap/ui/events/KeyCodes"
], function(
    qutils,
	createAndAppendDiv,
	commonsLibrary,
	ThingGroup,
	Shell,
	ThingInspector,
	ThingAction,
	NavigationItem,
	jQuery,
	ux3Library,
	ActionBar,
	Label,
	TextView,
	MatrixLayoutCell,
	MatrixLayoutRow,
	Button,
	MatrixLayout,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.commons.layout.VAlign
	var VAlign = commonsLibrary.layout.VAlign;

	// shortcut for sap.ui.commons.layout.HAlign
	var HAlign = commonsLibrary.layout.HAlign;

	// shortcut for sap.ui.ux3.ThingViewerHeaderType
	var ThingViewerHeaderType = ux3Library.ThingViewerHeaderType;

	// shortcut for sap.ui.ux3.FollowActionState
	var FollowActionState = ux3Library.FollowActionState;


	// prepare DOM
	createAndAppendDiv("uiArea1");


	// helper function to create a row with label and text
	function createLMatrixLayoutRowRow(sLabel, sText) {
		var oLabel = new Label({
			text : sLabel + ":"
		});
		var oTextView = new TextView({
			text : sText
		});

		var oMLCell1 = new MatrixLayoutCell({
			hAlign : HAlign.End,
			vAlign : VAlign.Top,
			content : [ oLabel ]
		});
		var oMLCell2 = new MatrixLayoutCell({
			hAlign : HAlign.Begin,
			vAlign : VAlign.Top,
			content : [ oTextView ]
		});

		return new MatrixLayoutRow({
			cells : [ oMLCell1, oMLCell2 ]
		});
	}

	var oThingInspector;
	var action;
	var facet;

	//event handler for facet event, action and standard action events, for close and open event
	function facetSelectedEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "facet select event handler has been executed."); // this test tests by just being counted in the respective test
		var id = oEvent.getParameter("id");
		QUnit.config.current.assert.equal(id, facet, facet + " Facet should be selected");
		var oTG1 = new ThingGroup({
			title : "Block1"
		});
		oTG1.addContent(new Button(oThingInspector.getId() + facet + "FacetButton", {
			text : id
		}));
		oThingInspector.addFacetContent(oTG1);
	}

	function actionSelectedEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "action select event handler has been executed."); // this test tests by just being counted in the respective test
		var id = oEvent.getParameter("id");
		QUnit.config.current.assert.equal(id, action, action + " Action should be selected");
	}
	function feedSubmitEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "feed submit event handler has been executed."); // this test tests by just being counted in the respective test
		var text = oEvent.getParameter("text");
		QUnit.config.current.assert.equal(text, "my feed entry", "Feed text should be 'my feed entry'");
	}
	function closeEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "close event handler has been executed."); // this test tests by just being counted in the respective test
	}
	function openEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "open event handler has been executed."); // this test tests by just being counted in the respective test
	}
	function openNewEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "open new event handler has been executed."); // this test tests by just being counted in the respective test
	}


	var oShell = new Shell("myShell", {
		appTitle : "SAPUI5 UX3 Shell",
		logout : function() {
			alert("Logout Button has been clicked."); // eslint-disable-line no-alert
			oShell.forceInvalidation();
			oShell.destroy();
			oThingInspector();
			oThingInspector = null;
			sap.ui.getCore().applyChanges();
		},
		search : function(oEvent) {
			alert("Search triggered: " + oEvent.getParameter("text")); // eslint-disable-line no-alert
		},
		feedSubmit : function(oEvent) {
			alert("Feed entry submitted: " + oEvent.getParameter("text")); // eslint-disable-line no-alert
		}
	});
	oShell.placeAt("uiArea1");

	oThingInspector = new ThingInspector("myThingInspector", {
		icon : "test-resources/sap/ui/ux3/images/Account_48.png", // put the Account icon
		firstTitle : "My Thing Inspector", // give a title
		type : "Account", // give thing type
		//enableFollowAction:false,
		actions : [ // add some actions
			new ThingAction("survey", {
				text : "Create Survey"
			}), new ThingAction("delete", {
				text : "Delete"
			}), new ThingAction("duplicate", {
				text : "Duplicate"
			}) ],
		facets : [ // add some facets
			new NavigationItem("overview", {
				key : "overview",
				text : "Overview"
			}), new NavigationItem("activities", {
				key : "activities",
				text : "Activities"
			}) ],
		actionSelected : actionSelectedEventHandler,
		feedSubmit : feedSubmitEventHandler,
		close : closeEventHandler,
		openNew : openNewEventHandler
	});

	// set content for the header
	var oTC1 = new ThingGroup({
		title : "About"
	});
	var oTC2 = new ThingGroup({
		title : "Contact"
	});
	var oLayout = new MatrixLayout();
	oLayout.addRow(createLMatrixLayoutRowRow("Status", "active"));
	oLayout.addRow(createLMatrixLayoutRowRow("Owner", "Erwin M."));
	oLayout.addRow(createLMatrixLayoutRowRow("Territory", "a Contact"));
	oLayout.addRow(createLMatrixLayoutRowRow("Prim. Contact", "Hugo"));
	oLayout.addRow(createLMatrixLayoutRowRow("Web Site", "link!!!"));
	oLayout.addRow(createLMatrixLayoutRowRow("Classification", "a classification"));
	oTC1.addContent(oLayout);
	oThingInspector.addHeaderContent(oTC1);

	var oLayout2 = new MatrixLayout();
	oLayout2.addRow(createLMatrixLayoutRowRow("Address", "Irgendwo, Strasse + HNr."));
	oLayout2.addRow(createLMatrixLayoutRowRow("Phone", "06221/23428374"));
	oLayout2.addRow(createLMatrixLayoutRowRow("Fax", "06221/23423432"));
	oLayout2.addRow(createLMatrixLayoutRowRow("Email", "hugo.m@web.de"));
	oTC2.addContent(oLayout2);
	oThingInspector.addHeaderContent(oTC2);

	//TI must be opened after the shell is rendered. Otherwise the sync will not work correctly
	oShell.addDelegate({
		onAfterRendering:function() {
			oThingInspector.open();
			oThingInspector.attachFacetSelected(facetSelectedEventHandler);
			oThingInspector.attachOpen(openEventHandler);
		}
	});


	QUnit.module("Appearance");

	QUnit.test("ThingInspector exists", function(assert) {
		assert.equal(true, true, "...");
		var oDomRef = oThingInspector.getId() ? window.document.getElementById(oThingInspector.getId()) : null;
		assert.ok(oDomRef, "Rendered ThingInspector should exist in the page");
		assert.equal(oDomRef.className, "sapUiUx3Overlay sapUiUx3TI sapUiShd", "Rendered ThingInspector should have the class 'sapUiUx3TI'");
	});

	QUnit.test("Swatch", function(assert) {
		var oSwatch = oThingInspector.getDomRef("thingViewer-swatch");
		assert.ok(oSwatch, "Rendered Swatch should exist in the page");
		assert.equal(oSwatch.className, "sapUiUx3TVIcon", "Rendered Swatch should have the class 'sapUiUx3TVIcon'");
	});

	QUnit.test("Facets", function(assert) {
		//number of navigation items must be the same as number of facets
		var facets = oThingInspector.getFacets();
		for (var i = 0; i < facets.length; i++) {
			assert.ok(facets[i].getDomRef(), "Rendered ThingInspector Facet " + facets[i].getId() + " should exist in the page");
		}
	});

	QUnit.test("Toolbar",	function(assert) {
		var oActionBar = oThingInspector.getActionBar();
		assert.ok(oActionBar, "ActionBar should exist");
		assert.ok(jQuery(".sapUiUx3ActionBar")[0], "ActionBar rendering ok");
		oThingInspector.setActionBar();
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery(".sapUiUx3ActionBar")[0], "ActionBar should be destroyed");
		oThingInspector.setActionBar(oActionBar);
	});

	QUnit.module("Behaviour");

	QUnit.test("OpenNew Event", function(assert) {
		assert.expect(1);
		qutils.triggerMouseEvent(oThingInspector.$("openNew"), "click", 1, 1, 1, 1);
	});

	QUnit.test("OpenNew via Keyboard Event", function(assert) {
		assert.expect(2);
		qutils.triggerKeyboardEvent(oThingInspector.getId() + "-openNew", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyboardEvent(oThingInspector.getId() + "-openNew", KeyCodes.SPACE, false, false, false);
	});

	QUnit.test("ActionSelected Event", function(assert) {
		assert.expect(2);
		action = "delete";
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-deleteButton"), "click", 1, 1, 1, 1);
	});

	QUnit.test("FavoriteSelected Event", function(assert) {
		assert.expect(7);
		assert.ok(!oThingInspector.getFavoriteState(), "Favorite State is false");
		action = "favorite";
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Favorite"), "click", 1, 1, 1, 1);
		assert.ok(oThingInspector.getFavoriteState(), "Favorite State is true");
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Favorite"), "click", 1, 1, 1, 1);
		assert.ok(!oThingInspector.getFavoriteState(), "Favorite State is false");
	});

	QUnit.test("Disable Favorite Action", function(assert) {
		assert.expect(1);
		oThingInspector.setFavoriteActionEnabled(false);
		assert.ok(!oThingInspector.getFavoriteActionEnabled(), "Favorite Action enabled is false");
	});

	QUnit.test("Favorite Action disabled: no event anymore", function(assert) {
		var done = assert.async();
		assert.expect(1);
		action = "favorite";
		setTimeout(function() {
			assert.ok(!oThingInspector.getDomRef("favorite"), "Action not rendered anymore");
			qutils.triggerMouseEvent(oThingInspector.$("favorite"), "click", 1, 1, 1, 1);
			done();
		},500);
	});

	QUnit.test("FlagSelected Event", function(assert) {
		assert.expect(7);
		assert.ok(!oThingInspector.getFlagState(), "Flag State is false");
		action = "flag";
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Flag"), "click", 1, 1, 1, 1);
		assert.ok(oThingInspector.getFlagState(), "Flag State is true");
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Flag"), "click", 1, 1, 1, 1);
		assert.ok(!oThingInspector.getFlagState(), "Flag State is false");
	});

	QUnit.test("FlagSelected via Keyboard Event", function(assert) {
		assert.expect(7);
		assert.ok(!oThingInspector.getFlagState(), "Flag State is false");
		action = "flag";
		//jQuery.sap.byId(oThingInspector.getId() + "-flag").trigger("focus");
		qutils.triggerKeyboardEvent(oThingInspector.getId() + "-actionBar-Flag", KeyCodes.ENTER, false, false, false);
		assert.ok(oThingInspector.getFlagState(), "Flag State is true");
		qutils.triggerKeyboardEvent(oThingInspector.getId() + "-actionBar-Flag", KeyCodes.SPACE, false, false, false);
		assert.ok(!oThingInspector.getFlagState(), "Flag State is false");
	});

	QUnit.test("Disable Flag Action", function(assert) {
		assert.expect(1);
		oThingInspector.setFlagActionEnabled(false);
		assert.ok(!oThingInspector.getFlagActionEnabled(), "Flag Action enabled is false");
	});

	QUnit.test("Flag Action disabled: no event anymore", function(assert) {
		var done = assert.async();
		assert.expect(1);
		action = "flag";
		setTimeout(function() {
			assert.ok(!oThingInspector.getDomRef("actionBar-Flag"), "Action not rendered anymore");
			qutils.triggerMouseEvent(oThingInspector.$("actionBar-Flag"), "click", 1, 1, 1, 1);
			done();
		},500);
	});

	QUnit.test("UpdateSelected Event", function(assert) {
		var done = assert.async();
		assert.expect(2);
		action = "update";
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Update"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.ok(oThingInspector.getDomRef("actionBar-UpdateActionPopup"), "Rendered update popup should exist in the page");
			//click again should hide comment popup
			qutils.triggerMouseEvent(oThingInspector.$("actionBar-Update"), "click", 1, 1, 1, 1);
			setTimeout(function() {
				assert.equal(oThingInspector.$("actionBar-UpdateActionPopup").length, 0,
						"Rendered update popup was removed in the page");
				done();
			}, 500);
		}, 500);
	});

	QUnit.test("FeedSubmit Event", function(assert) {
		var done = assert.async();
		assert.expect(5);
		action = "update";
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Update"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.ok(oThingInspector.getDomRef("actionBar-UpdateActionPopup"), "Rendered update popup should exist in the page");
			jQuery(jQuery(".sapUiFeederInput")[0]).trigger("focus");
			setTimeout(function() {
				jQuery(".sapUiFeederInput")[0].innerHTML = "my feed entry";
				setTimeout(function() {
					jQuery(jQuery(".sapUiFeederInput")[0]).trigger("keyup");
					setTimeout(function() {
						//click on feed submit button should hide comment popup
						qutils.triggerMouseEvent(oThingInspector.$('actionBar-Feeder-send'), "click", 1, 1, 1, 1);
						setTimeout(function() {
							assert.ok(oThingInspector.$("actionBar-UpdateActionPopup"), "Rendered comment popup should exist in the page");
							assert.equal(oThingInspector.$("actionBar-UpdateActionPopup").length, 0,
									"Rendered update popup was removed in the page");
							done();
						}, 500);
					}, 500);
				}, 500);
			}, 500);
		}, 500);
	});

	QUnit.test("Disable Update Action", function(assert) {
		assert.expect(1);
		oThingInspector.setUpdateActionEnabled(false);
		assert.ok(!oThingInspector.getUpdateActionEnabled(), "Flag Action enabled is false");
	});

	QUnit.test("Update Action disabled: no event anymore", function(assert) {
		var done = assert.async();
		assert.expect(1);
		action = "update";
		setTimeout(function() {
			assert.ok(!oThingInspector.getDomRef("update"), "Action not rendered anymore");
			qutils.triggerMouseEvent(oThingInspector.$("update"), "click", 1, 1, 1, 1);
			done();
		},500);
	});

	QUnit.test("Open Method", function(assert) {
		var done = assert.async();
		assert.expect(5);
		facet = "overview";
		oThingInspector.close();
		oThingInspector.setSelectedFacet(null);
		setTimeout(function() {
			oThingInspector.open();
			assert.ok(oThingInspector.isOpen(), "Rendered ThingInspector is open");
			setTimeout(
					function() {
						assert.ok(window.document.getElementById(oThingInspector.getId() + facet + "FacetButton"), "Rendered Facet Content for facet " + facet
								+ " should exist in the page");
						done();
					}, 500);
		}, 500);
	});

	QUnit.test("FacetSelected Event", function(assert) {
		var done = assert.async();
		assert.expect(3);
		facet = "activities";
		qutils.triggerMouseEvent(window.document.getElementById("activities"), "click", 1, 1, 1, 1);
		setTimeout(
				function() {
					assert.ok(window.document.getElementById(oThingInspector.getId() + facet + "FacetButton"), "Rendered Facet Content for facet " + facet
							+ " should exist in the page");
					done();
				}, 500);
	});

	QUnit.test("FollowSelected Event", function(assert) {
		var done = assert.async();
		assert.expect(19);
		assert.equal(oThingInspector.getFollowState(), FollowActionState.Default, "Follow State is sap.ui.ux3.FollowActionState.Default");
		action = "follow";
		// trigger follow
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Follow"), "click", 1, 1, 1, 1);
		assert.equal(oThingInspector.getFollowState(), FollowActionState.Follow, "Follow State is sap.ui.ux3.FollowActionState.Follow");
		// menu must exist after click
		qutils.triggerMouseEvent(oThingInspector.$("actionBar-Follow"), "click", 1, 1, 1, 1);
		assert.ok(oThingInspector.getDomRef("actionBar-followActionMenu"), "Rendered Follow Action menu should exist in the page");

		setTimeout(function() {
			// menu entries with unhold and unfollow must exist
			assert.ok(oThingInspector.getDomRef("actionBar-holdState"), "Rendered Follow Action menu with holdState should exist in the page");
			assert.ok(oThingInspector.getDomRef("actionBar-unfollowState"), "Rendered Follow Action menu with unfollowState should exist in the page");
			// trigger hold
			qutils.triggerMouseEvent(oThingInspector.$("actionBar-holdState"), "click", 1, 1, 1, 1);
			setTimeout(function() {
				assert.equal(oThingInspector.getFollowState(), FollowActionState.Hold, "Follow State is sap.ui.ux3.FollowActionState.Hold");
				// menu must exist after click
				qutils.triggerMouseEvent(oThingInspector.$("actionBar-Follow"), "click", 1, 1, 1, 1);
				assert.ok(oThingInspector.getDomRef("actionBar-followActionMenu"), "Rendered Follow Action menu should exist in the page");

				setTimeout(
						function() {
							// menu entries with unhold and unfollow must exist
							assert.ok(oThingInspector.getDomRef("actionBar-unholdState"),
									"Rendered Follow Action menu with unholdState should exist in the page");
							assert.ok(oThingInspector.getDomRef("actionBar-unfollowState"),
									"Rendered Follow Action menu with unfollowState should exist in the page");
							// trigger unfollow
							qutils.triggerMouseEvent(oThingInspector.getDomRef("actionBar-unfollowState"), "click", 1, 1, 1, 1);
							assert.equal(oThingInspector.getFollowState(), FollowActionState.Default, "Follow State is sap.ui.ux3.FollowActionState.Default");

							setTimeout(function() {

								// menu entries with hold, unhold and unfollow must not exist only follow
								assert.ok(!oThingInspector.getDomRef("actionBar-holdState"),
										"Rendered Follow Action menu with holdState should not exists in the page");
								assert.ok(!oThingInspector.getDomRef("actionBar-unholdState"),
										"Rendered Follow Action menu with unholdState should not exists in the page");
								assert.ok(!oThingInspector.getDomRef("actionBar-unfollowState"),
										"Rendered Follow Action menu with unfollowState should not exists in the page");
								done();
							}, 500);
						}, 500);
			}, 500);
		}, 500);

	});

	QUnit.test("Disable Follow Action", function(assert) {
		assert.expect(1);
		oThingInspector.setFollowActionEnabled(false);
		assert.ok(!oThingInspector.getFollowActionEnabled(), "Follow Action enabled is false");
	});

	QUnit.test("Follow Action disabled: no event anymore", function(assert) {
		var done = assert.async();
		assert.expect(1);
		action = "follow";
		setTimeout(function() {
			assert.ok(!oThingInspector.getDomRef("follow"), "Action not rendered anymore");
			qutils.triggerMouseEvent(oThingInspector.$("follow"), "click", 1, 1, 1, 1);
			done();
		},500);
	});

	// at the end close
	QUnit.test("Close Event", function(assert) {
		var done = assert.async();
		assert.expect(3);
		assert.ok(oThingInspector.isOpen(), "Rendered ThingInspector is open");

		qutils.triggerMouseEvent(oThingInspector.$("close"), "click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.ok(!oThingInspector.isOpen(), "Rendered ThingInspector is not open");
			done();
		}, 500);
	});

	QUnit.test("Destroy and remove control", function(assert) {
		oThingInspector.destroy();
		sap.ui.getCore().applyChanges();
		var oDomRef = oThingInspector.getDomRef();
		assert.ok(!oDomRef, "Rendered ThingInspector should not exist in the page after destruction");
		oShell.destroy();
	});
	QUnit.module("Aggregation overrides", {
		beforeEach : function () {
			this.oTI = new ThingInspector({

			});
			this.oTI.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oTI.destroy();
			this.oTI = null;
		}
	});

	QUnit.test("insertAction",function(assert) {
		var action1 = new ThingAction("survey1", {
			text : "Create Survey"
		});
		var action2 = new ThingAction("survey2", {
			text : "Create Survey"
		});

		this.oTI.insertAction(action1, 0);
		this.oTI.insertAction(action2, 1);

		assert.strictEqual(this.oTI.getActions().indexOf(action1), 0, "action is inserted on the correct position");
		assert.strictEqual(this.oTI.getActions().indexOf(action2), 1, "action is inserted on the correct position");
	});

	QUnit.test("removeAction",function(assert) {
		var action = new ThingAction("survey3", {
			text : "Create Survey"
		});
		this.oTI.insertAction(action, 0);
		this.oTI.removeAction(action);
		assert.strictEqual(this.oTI.getActions().indexOf(action), -1, "action is removed");
	});

	QUnit.test("removeAllActions",function(assert) {
		var action1 = new ThingAction("survey4", {
			text : "Create Survey"
		});

		var action2 = new ThingAction("survey5", {
			text : "Create Survey"
		});

		this.oTI.insertAction(action1, 0);
		this.oTI.insertAction(action2, 1);

		this.oTI.removeAllActions();
		assert.strictEqual(this.oTI.getActions().length, 0, "all actions are removed");
	});

	QUnit.test("destroyActions",function(assert) {
		var action1 = new ThingAction("survey6", {
			text : "Create Survey"
		});

		this.oTI.addAction(action1);

		this.oTI.destroyActions();
		assert.strictEqual(this.oTI.getActions().length, 0, "all actions are destroyed");
	});

	QUnit.test("indexOfAction",function(assert) {
		var action1 = new ThingAction("action1", {
			text : "Create Survey"
		});

		var action2 = new ThingAction("action2", {
			text : "Create Survey"
		});

		var action3 = new ThingAction("action3", {
			text : "Create Survey"
		});

		this.oTI.insertAction(action1, 0);
		this.oTI.insertAction(action2, 1);
		this.oTI.insertAction(action3, 2);

		assert.strictEqual(this.oTI.indexOfAction(action1), 0, "action is inserted on the correct position");
		assert.strictEqual(this.oTI.indexOfAction(action2), 1, "action is inserted on the correct position");
		assert.strictEqual(this.oTI.indexOfAction(action3), 2, "action is inserted on the correct position");
	});

	QUnit.test("getFacets",function(assert) {

		var facet1 = new NavigationItem("overview1", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview2", {
			key: "overview",
			text: "Overview"
		});

		assert.strictEqual(this.oTI.getFacets().length, 0, "there are no facets added");

		this.oTI.addFacet(facet1);
		this.oTI.addFacet(facet2);
		assert.strictEqual(this.oTI.getFacets().length, 2, "there are two facets added");

		var result = this.oTI.getFacets()[0];
		assert.strictEqual(result, facet1, "the added facets exists");

	});

	QUnit.test("insertFacets",function(assert) {

		var facet1 = new NavigationItem("overview3", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview4", {
			key: "overview",
			text: "Overview"
		});

		this.oTI.insertFacet(facet1, 0);
		this.oTI.insertFacet(facet2, 1);

		assert.strictEqual(this.oTI.getFacets().indexOf(facet1), 0, "the inserted facets exists");
		assert.strictEqual(this.oTI.getFacets().indexOf(facet2), 1, "the inserted facets exists");

	});

	QUnit.test("removeFacet",function(assert) {

		var facet1 = new NavigationItem("overview5", {
			key: "overview",
			text: "Overview"
		});

		this.oTI.insertFacet(facet1, 0);
		this.oTI.removeFacet(facet1);

		assert.strictEqual(this.oTI.getFacets().indexOf(facet1), -1, "the facet is removed");
	});

	QUnit.test("removeAllFacets",function(assert) {

		var facet1 = new NavigationItem("overview6", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview7", {
			key: "overview",
			text: "Overview"
		});

		this.oTI.insertFacet(facet1, 0);
		this.oTI.insertFacet(facet2, 1);
		this.oTI.removeAllFacets();

		assert.strictEqual(this.oTI.getFacets().length, 0, "all facets are removed");
	});

	QUnit.test("destroyFacets",function(assert) {

		var facet1 = new NavigationItem("overview8", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview9", {
			key: "overview",
			text: "Overview"
		});

		this.oTI.insertFacet(facet1, 0);
		this.oTI.insertFacet(facet2, 1);
		this.oTI.destroyFacets();

		assert.strictEqual(this.oTI.getFacets().length, 0, "all facets are destroyed");
	});

	QUnit.test("setFollowState",function(assert) {

		assert.strictEqual(this.oTI.getFollowState(), FollowActionState.Default, "follow state is set correctly");

		this.oTI.setFollowState(FollowActionState.Follow);
		assert.strictEqual(this.oTI.getFollowState(FollowActionState.Follow), FollowActionState.Follow, "follow state is set correctly");

	});

	QUnit.test("setFlagState",function(assert) {

		assert.strictEqual(this.oTI.getFlagState(), false, "flag state is set correctly");

		this.oTI.setFlagState(true);
		assert.strictEqual(this.oTI.getFlagState(), true, "flag state is set correctly");
	});

	QUnit.test("setFavoriteState",function(assert) {
		this.oTI.setFavoriteState(false);
		assert.strictEqual(this.oTI.getFavoriteState(), false, "favorite state is set correctly");
	});

	QUnit.test("setIcon",function(assert) {
		this.oTI.setIcon("sap-icon://home");
		assert.strictEqual(this.oTI.getIcon(), "sap-icon://home", "icon is set correctly");
	});

	QUnit.test("setType",function(assert) {

		assert.strictEqual(this.oTI.getType(), "", "type is set correctly - the default value is null");

		this.oTI.setType("Test type");
		assert.strictEqual(this.oTI.getType(), "Test type", "type is set correctly");

	});

	QUnit.test("insertFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview10", {
			title: "Overview"
		});

		this.oTI.insertFacetContent(facet1, 0);
		assert.strictEqual(this.oTI.getFacetContent()[0], facet1, "the content is inserted");
	});

	QUnit.test("addFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview11", {
			title: "Overview"
		});

		this.oTI.addFacetContent(facet1);
		assert.strictEqual(this.oTI.getFacetContent()[0], facet1, "the content is added");
	});

	QUnit.test("removeFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview12", {
			title: "Overview"
		});

		this.oTI.addFacetContent(facet1);
		this.oTI.removeFacetContent(facet1);

		assert.strictEqual(this.oTI.getFacetContent().indexOf(facet1), -1, "the facet content is removed");
	});

	QUnit.test("removeAllFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview13", {
			title: "Overview"
		});
		var facet2 = new ThingGroup("overview14", {
			title: "Overview"
		});

		this.oTI.addFacetContent(facet1);
		this.oTI.addFacetContent(facet2);
		this.oTI.removeAllFacetContent();

		assert.strictEqual(this.oTI.getFacetContent().length, 0, "all facets are removed");
	});

	QUnit.test("destroyFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview15", {
			title: "Overview"
		});

		this.oTI.addFacetContent(facet1);
		this.oTI.destroyFacetContent(facet1);

		assert.strictEqual(this.oTI.getFacetContent().indexOf(facet1), -1, "the facet content is destroyed");
	});

	QUnit.test("indexOfFacetContent",function(assert) {
		var facet1 = new ThingGroup("overview16", {
			title: "Overview"
		});

		var facet2 = new ThingGroup("overview17", {
			title: "Overview"
		});

		var facet3 = new ThingGroup("overview18", {
			title: "Overview"
		});

		this.oTI.insertFacetContent(facet1, 0);
		this.oTI.insertFacetContent(facet2, 1);
		this.oTI.insertFacetContent(facet3, 2);

		assert.strictEqual(this.oTI.indexOfFacetContent(facet1), 0, "facet content is inserted on the correct position");
		assert.strictEqual(this.oTI.indexOfFacetContent(facet2), 1, "facet content is inserted on the correct position");
		assert.strictEqual(this.oTI.indexOfFacetContent(facet3), 2, "facet content is inserted on the correct position");
	});

	QUnit.test("destroyActionBar",function(assert) {

		var facet1 = new ActionBar("overview19", {
		});

		this.oTI.setActionBar(facet1);
		this.oTI.destroyActionBar(facet1);

		assert.strictEqual(this.oTI.getActionBar(), null, "the action bar is destroyed");
	});

	QUnit.test("insertHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview20", {
			title: "Overview"
		});

		this.oTI.insertHeaderContent(facet1, 0);
		assert.strictEqual(this.oTI.getHeaderContent()[0], facet1, "the header content is inserted");
	});

	QUnit.test("addHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview21", {
			title: "Overview"
		});

		this.oTI.addHeaderContent(facet1);
		assert.strictEqual(this.oTI.getHeaderContent()[0], facet1, "the header content is added");
	});

	QUnit.test("removeHeaderContent ",function(assert) {

		var facet1 = new ThingGroup("overview22", {
			title: "Overview"
		});

		this.oTI.addHeaderContent(facet1);
		assert.strictEqual(this.oTI.getHeaderContent()[0], facet1, "the header content is added");

		this.oTI.removeHeaderContent(facet1);
		assert.strictEqual(this.oTI.getHeaderContent().indexOf(facet1), -1, "the header content is removed");
	});

	QUnit.test("removeAllHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview23", {
			title: "Overview"
		});
		var facet2 = new ThingGroup("overview24", {
			title: "Overview"
		});

		this.oTI.addHeaderContent(facet1);
		assert.strictEqual(this.oTI.getHeaderContent()[0], facet1, "the header content is added");

		this.oTI.addHeaderContent(facet2);
		this.oTI.removeAllHeaderContent();

		assert.strictEqual(this.oTI.getHeaderContent().length, 0, "all header content is removed");
	});

	QUnit.test("destroyHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview25", {
			title: "Overview"
		});

		this.oTI.addHeaderContent(facet1);
		assert.strictEqual(this.oTI.getHeaderContent()[0], facet1, "the header content is added");

		this.oTI.destroyHeaderContent(facet1);
		assert.strictEqual(this.oTI.getHeaderContent().indexOf(facet1), -1, "the header content is destroyed");
	});

	QUnit.test("indexOfHeaderContent ",function(assert) {
		var facet1 = new ThingGroup("overview26", {
			title: "Overview"
		});

		var facet2 = new ThingGroup("overview27", {
			title: "Overview"
		});

		var facet3 = new ThingGroup("overview28", {
			title: "Overview"
		});

		this.oTI.insertHeaderContent(facet1, 0);
		this.oTI.insertHeaderContent(facet2, 1);
		this.oTI.insertHeaderContent(facet3, 2);

		assert.strictEqual(this.oTI.indexOfHeaderContent(facet1), 0, "header content is inserted on the correct position");
		assert.strictEqual(this.oTI.indexOfHeaderContent(facet2), 1, "header content is inserted on the correct position");
		assert.strictEqual(this.oTI.indexOfHeaderContent(facet3), 2, "header content is inserted on the correct position");
	});

	QUnit.test("setSelectedFacet",function(assert) {

		assert.strictEqual(this.oTI.getSelectedFacet(), null, "selected facet is set originally empty");

		this.oTI.setSelectedFacet("test facet");
		assert.strictEqual(this.oTI.getSelectedFacet(), "test facet", "selected facet is set correctly");
	});

	QUnit.test("setFavoriteActionEnabled",function(assert) {

		assert.strictEqual(this.oTI.getFavoriteActionEnabled(), true, "favorite state is enabled");

		this.oTI.setFavoriteActionEnabled(false);
		assert.strictEqual(this.oTI.getFavoriteActionEnabled(), false, "favorite state is enabled");
	});

	QUnit.test("setFlagActionEnabled",function(assert) {

		assert.strictEqual(this.oTI.getFlagActionEnabled(), true, "flag action is set enabled");

		this.oTI.setFlagActionEnabled(false);
		assert.strictEqual(this.oTI.getFlagActionEnabled(), false, "flag action is set enabled");
	});

	QUnit.test("setUpdateActionEnabled",function(assert) {

		assert.strictEqual(this.oTI.getUpdateActionEnabled(), true, "update action is enabled");

		this.oTI.setUpdateActionEnabled(false);
		assert.strictEqual(this.oTI.getUpdateActionEnabled(), false, "update action is enabled");
	});

	QUnit.test("setFollowActionEnabled",function(assert) {

		assert.strictEqual(this.oTI.getFollowActionEnabled(), true, "follow action is enabled");

		this.oTI.setFollowActionEnabled(false);
		assert.strictEqual(this.oTI.getFollowActionEnabled(), false, "follow action is enabled");
	});

	QUnit.test("setFirstTitle",function(assert) {

		assert.strictEqual(this.oTI.getFirstTitle(), "", "the default value of the first title is set correctly");

		this.oTI.setFirstTitle("title");
		assert.strictEqual(this.oTI.getFirstTitle(), "title", "first title is set correctly");
	});

	QUnit.test("setSecondTitle",function(assert) {

		assert.strictEqual(this.oTI.getSecondTitle(), "", "the default value of the second title is set correctly");

		this.oTI.setSecondTitle("second title");
		assert.strictEqual(this.oTI.getSecondTitle(), "second title", "second title is set correctly");
	});

	QUnit.test("setHeaderType",function(assert) {
		this.oTI.setHeaderType(ThingViewerHeaderType.Standard);
		assert.strictEqual(this.oTI.getHeaderType(ThingViewerHeaderType.Standard), ThingViewerHeaderType.Standard, "the default value of the header type is set correctly");

		this.oTI.setHeaderType(ThingViewerHeaderType.Horizontal);
		assert.strictEqual(this.oTI.getHeaderType(), ThingViewerHeaderType.Horizontal, "header type is set correctly");
	});
});