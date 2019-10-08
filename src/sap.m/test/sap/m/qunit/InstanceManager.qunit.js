/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/InstanceManager",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/ScrollContainer",
	"sap/m/Popover",
	"sap/m/library",
	"sap/m/Dialog",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/App"
], function(
	qutils,
	createAndAppendDiv,
	InstanceManager,
	List,
	StandardListItem,
	JSONModel,
	ScrollContainer,
	Popover,
	mobileLibrary,
	Dialog,
	HTML,
	Button,
	Page,
	App
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	var IMAGE_PATH = "test-resources/sap/m/images/";


	//prepare DOM
	createAndAppendDiv("content");



	var oList2 = new List({
		inset : true
	});

	var data = {
		navigation : [ {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			icon : IMAGE_PATH + "travel_expend.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			icon : IMAGE_PATH + "travel_expense_report.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			icon : IMAGE_PATH + "travel_request.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			icon : IMAGE_PATH + "wounds_doc.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel worflow settings",
			icon : IMAGE_PATH + "settings.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		} ]
	};

	var oItemTemplate1 = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		iconInset : "{iconInset}",
		type : "{type}"
	});

	function bindListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		oModel.setData(data);
		list.setModel(oModel);
		list.bindAggregation("items", "/navigation", itemTemplate);
	}

	bindListData(data, oItemTemplate1, oList2);

	var oScrollContainer = new ScrollContainer({
		horizontal: false,
		vertical: true,
		content: oList2
	});

	var oPopover = new Popover("popover", {
		placement: PlacementType.Bottom,
		title: "Popover",
		showHeader: true,
		content: [
			oScrollContainer
		]
	});

	var oDialog = new Dialog("dialog", {
		title: "World Domination",
		content: [
			new HTML({content:"<p>Do you want to start a new world domination campaign?</p>"})
		],
		icon: IMAGE_PATH + "SAPUI5Icon.png",
		leftButton:
			new Button("leftButton", {
				text: "Reject",
				type: ButtonType.Reject,
				press : function() {
					oDialog.close();
				}
			}),
		rightButton:
			new Button("rightButton", {
				text: "Accept",
				type: ButtonType.Accept,
				press : function() {
					oDialog.close();
				}
			})
	});

	var oButton = new Button({
		text : "Open"
	});

	var page = new Page("myFirstPage", {
		title : "Instance Mananger Test",
		showNavButton : true,
		enableScrolling : true,
		content : oButton
	});

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});
	app.addPage(page).placeAt("content");

	var sCategoryId = "_category_",
		oInstance = {property: "Property"};



	QUnit.module("Add and remove normal object");
	QUnit.test("Add object", function(assert){
		assert.ok(InstanceManager.isCategoryEmpty(sCategoryId), "Category is empty now");
		InstanceManager.addInstance(sCategoryId, oInstance);
		assert.ok(!InstanceManager.isCategoryEmpty(sCategoryId), "Category is not empty anymore");
		assert.equal(InstanceManager.getInstancesByCategoryId(sCategoryId).length, 1, "Intance array is not empty and length should equal 1");
		assert.ok(InstanceManager.isInstanceManaged(sCategoryId, oInstance), "Instance is managed");
		// add the same instance again
		InstanceManager.addInstance(sCategoryId, oInstance);
		assert.equal(InstanceManager.getInstancesByCategoryId(sCategoryId).length, 1, "Intance shouldn't be added again");
		assert.ok(InstanceManager.isInstanceManaged(sCategoryId, oInstance), "Instance is still managed");
	});

	QUnit.test("Remove object", function(assert){
		InstanceManager.removeInstance(sCategoryId, oInstance);
		assert.ok(InstanceManager.isCategoryEmpty(sCategoryId), "Category is empty now");
		assert.ok(!InstanceManager.isInstanceManaged(sCategoryId, oInstance), "Instance is not managed any more");
		assert.ok(InstanceManager.getInstancesByCategoryId(sCategoryId).length === 0, "Intance array is empty");
	});


	QUnit.module("Open and close Dialog");
	QUnit.test("Open Dialog", function(assert){
		assert.expect(3);

		var done = assert.async();
		oDialog.attachAfterOpen(function handler() {
			assert.ok(InstanceManager.hasOpenDialog(), "There is dialog open");
			assert.ok(InstanceManager.isDialogOpen(this), "This dialog is open");
			assert.equal(InstanceManager.getOpenDialogs().length, 1, "There is one dialog open");
			this.detachAfterOpen(handler);
			done();
		});

		oDialog.open();
	});

	QUnit.test("Close Dialog", function(assert){
		assert.expect(3);

		var done = assert.async();
		oDialog.attachAfterClose(function handler() {
			assert.ok(!InstanceManager.hasOpenDialog(), "There is dialog open");
			assert.ok(!InstanceManager.isDialogOpen(this), "This dialog isn't open");
			assert.strictEqual(InstanceManager.getOpenDialogs().length, 0, "There is no dialog open");
			this.detachAfterClose(handler);
			done();
		});

		InstanceManager.closeAllDialogs();
	});


	QUnit.module("callbacks");

	QUnit.test("Should close all dialogs and trigger a callback", function(assert) {

		//Arrange

		var callback  = this.spy(),
			closeSpy = this.spy(),
			events = [],
			fakeDialog = {
				close : closeSpy,
				getCloseOnNavigation: function () {
					return true;
				},
				attachEvent : function(eventName, fnFireEvent){
						events.push(fnFireEvent);
				}
			},
			dialogs = [ fakeDialog , fakeDialog ];


		this.stub(InstanceManager, "getOpenDialogs").returns(dialogs);


		//System under Test + Act
		InstanceManager.closeAllDialogs(callback);


		//Assert
		assert.strictEqual(events.length, dialogs.length, "registered to event");
		assert.strictEqual(closeSpy.callCount, dialogs.length, "close was called");


		//fire first close event
		events[0]();
		assert.strictEqual(callback.callCount, 0, "callback was not executed yet");

		//fire second close event
		events[1]();
		assert.strictEqual(callback.callCount, 1, "callback was executed");
	});


	QUnit.module("Open and close Popover");
	QUnit.test("Open Dialog", function(assert){
		assert.expect(3);

		var done = assert.async();
		oPopover.attachAfterOpen(function handler() {
			assert.ok(InstanceManager.hasOpenPopover(), "There is popover open");
			assert.ok(InstanceManager.isPopoverOpen(this), "This popover is open");
			assert.equal(InstanceManager.getOpenPopovers().length, 1, "There is one popover open");
			this.detachAfterOpen(handler);
			done();
		});

		oPopover.openBy(oButton);
	});

	QUnit.test("Close Dialog", function(assert){
		assert.expect(3);

		var done = assert.async();
		oPopover.attachAfterClose(function handler() {
			assert.ok(!InstanceManager.hasOpenPopover(), "There is popover open");
			assert.ok(!InstanceManager.isPopoverOpen(this), "This Popover isn't open");
			assert.equal(InstanceManager.getOpenPopovers().length, 0, "There is no dialog open");
			this.detachAfterClose(handler);
			done();
		});

		InstanceManager.closeAllPopovers();
	});
});