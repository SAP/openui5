/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/layout/BorderLayout",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Link"
], function(createAndAppendDiv, BorderLayout, TextField, Link) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");



	var oLayout = new BorderLayout("myLayout1");

	var oLayoutInner = new BorderLayout("myLayoutInner");

	oLayoutInner.createArea("top", new TextField("inner_top", {value: "Inner Top" , width: "80px"}));

	oLayoutInner.createArea("begin", new TextField("inner_begin", {value: "Inner Begin" , width: "80px"}));
	oLayoutInner.createArea("center", new TextField("inner_center", {value: "Inner Center" , width: "80px"}));
	oLayoutInner.createArea("end", new TextField("inner_end", {value: "Inner End" , width: "80px"}));
	oLayoutInner.createArea("bottom", new TextField("inner_bottom", {value: "Inner Bottom" , width: "80px"}));

	oLayout.createArea("top", new TextField("top", {value: "Top" , width: "50px"}) );
	oLayout.createArea("begin", new TextField("begin", {value: "Begin" , width: "50px"}) );
	oLayout.createArea("center", new TextField("center", {value: "Center" , width: "50px"}), oLayoutInner );
	oLayout.createArea("end", new TextField("end", {value: "End" , width: "50px"}) );
	oLayout.createArea("bottom", new TextField("bottom", {value: "Bottom" , width: "50px"}) );

	oLayout.setAreaData("top", 		{overflowX: "auto" , overflowY: "auto" ,contentAlign: "center", size: "50px", visible: true});
	oLayout.setAreaData("begin", 	{overflowX: "hidden" , overflowY: "hidden" ,contentAlign: "center", size: "30px", visible: true});
	oLayout.setAreaData("center", 	{contentAlign: "center"});
	oLayout.setAreaData("end", 		{overflowX: "scroll" , overflowY: "scroll" ,contentAlign: "left", size: "78px", visible: true});
	oLayout.setAreaData("bottom", 	{overflowX: "scroll" , overflowY: "hidden" ,contentAlign: "right", size: "66px", visible: true});

	oLayout.placeAt("uiArea1");



	QUnit.module("Parent-Properties");

	QUnit.test("Custom Values", function(assert) {
		assert.equal(oLayout.getRtl()		 , false, "Custom 'rtl': ");
	});

	QUnit.test("Default Values", function(assert) {
		assert.equal(oLayoutInner.getRtl()      , false, "Default 'rtl': ");
	});

	QUnit.module("Area-Properties");

	QUnit.test("Custom Area Values", function(assert) {
		var oData;
		//Top
		assert.equal(oLayout.getTop().getAreaId(), "top", "Top AUTO 'areaId': ");
		oData = oLayout.getAreaData("top");
		assert.equal(oData.overflowX, "auto", "Top Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Top Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "center", "Top Custom 'contentAlign': ");
		assert.equal(oData.size, "50px", "Top Custom 'size': ");
		assert.equal(oData.visible, true, "Top Custom 'visible': ");

		//Begin
		assert.equal(oLayout.getBegin().getAreaId(), "begin", "Begin AUTO 'areaId': ");
		oData = oLayout.getAreaData("begin");
		assert.equal(oData.overflowX, "hidden", "Begin Custom 'overflowX': ");
		assert.equal(oData.overflowY, "hidden", "Begin Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "center", "Begin Custom 'contentAlign': ");
		assert.equal(oData.size, "30px", "Begin Custom 'size': ");
		assert.equal(oData.visible, true, "Begin Custom 'visible': ");

		//Center
		assert.equal(oLayout.getCenter().getAreaId(), "center", "Center AUTO 'areaId': ");
		oData = oLayout.getAreaData("center");
		assert.equal(oData.overflowX, "auto", "Center Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Center Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "center", "Center Custom 'contentAlign': ");
		assert.equal(oData.size, "100px", "Center Custom 'size': ");
		assert.equal(oData.visible, true, "Center Custom 'visible': ");

		//End
		assert.equal(oLayout.getEnd().getAreaId(), "end", "End AUTO 'areaId': ");
		oData = oLayout.getAreaData("end");
		assert.equal(oData.overflowX, "scroll", "End Custom 'overflowX': ");
		assert.equal(oData.overflowY, "scroll", "End Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "left", "End  Custom 'contentAlign': ");
		assert.equal(oData.size, "78px", "Center Custom 'size': ");
		assert.equal(oData.visible, true, "Center Custom 'visible': ");

		//Bottom
		assert.equal(oLayout.getBottom().getAreaId(), "bottom", "Bottom AUTO 'areaId': ");
		oData = oLayout.getAreaData("bottom");
		assert.equal(oData.overflowX, "scroll", "Bottom Custom 'overflowX': ");
		assert.equal(oData.overflowY, "hidden", "Bottom Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "right", "Bottom  Custom 'contentAlign': ");
		assert.equal(oData.size, "66px", "Bottom Custom 'size': ");
		assert.equal(oData.visible, true, "Bottom Custom 'visible': ");
	});

	QUnit.test("Default Area Values", function(assert) {
		var oData;
		//Inner Top
		assert.equal(oLayoutInner.getTop().getAreaId(), "top", "Inner Top AUTO 'areaId': ");
		oData = oLayoutInner.getAreaData("top");
		assert.equal(oData.overflowX, "auto", "Inner Top Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Inner Top Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "left", "Inner Top Custom 'contentAlign': ");
		assert.equal(oData.size, "100px", "Inner Top Custom 'size': ");
		assert.equal(oData.visible, true, "InnerTop Custom 'visible': ");

		//Begin
		assert.equal(oLayoutInner.getBegin().getAreaId(), "begin", "Inner Begin AUTO 'areaId': ");
		oData = oLayoutInner.getAreaData("begin");
		assert.equal(oData.overflowX, "auto", "Inner Begin Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Inner Begin Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "left", "Inner TBegin Custom 'contentAlign': ");
		assert.equal(oData.size, "100px", "Inner Begin Custom 'size': ");
		assert.equal(oData.visible, true, "Inner Begin Custom 'visible': ");

		//Center
		assert.equal(oLayoutInner.getCenter().getAreaId(), "center", "Inner Center AUTO 'areaId': ");
		oData = oLayoutInner.getAreaData("center");
		assert.equal(oData.overflowX, "auto", "Inner Begin Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Inner Begin Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "left", "Inner TBegin Custom 'contentAlign': ");
		assert.equal(oData.size, "100px", "Inner Begin Custom 'size': ");
		assert.equal(oData.visible, true, "Inner Begin Custom 'visible': ");

		//End
		assert.equal(oLayoutInner.getEnd().getAreaId(), "end", "Inner End AUTO 'areaId': ");
		oData = oLayoutInner.getAreaData("end");
		assert.equal(oData.overflowX, "auto", "Inner End Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Inner End Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "left", "Inner End Custom 'contentAlign': ");
		assert.equal(oData.size, "100px", "Inner End Custom 'size': ");
		assert.equal(oData.visible, true, "Inner End Custom 'visible': ");

		//Bottom
		assert.equal(oLayoutInner.getBottom().getAreaId(), "bottom", "Inner Bottom AUTO 'areaId': ");
		oData = oLayoutInner.getAreaData("bottom");
		assert.equal(oData.overflowX, "auto", "Inner Bottom Custom 'overflowX': ");
		assert.equal(oData.overflowY, "auto", "Inner Bottom Custom 'overflowY': ");
		assert.equal(oData.contentAlign, "left", "Inner Bottom Custom 'contentAlign': ");
		assert.equal(oData.size, "100px", "Inner Bottom Custom 'size': ");
		assert.equal(oData.visible, true, "Inner Bottom Custom 'visible': ");
	});

	QUnit.module("BorderLayout Helper Methods");
	var oLink1;
	QUnit.test("Adding Content", function(assert) {
		//Add one Control
		oLink1 = new Link("link1", {text : "Link1 added by addContent"});
		oLayout.addContent("top", oLink1);
		sap.ui.getCore().applyChanges();
		assert.equal(oLayout.getTop().getContent()[1].getId(), "link1", "Top Link1 was added: ");

		//Add more than one Control
		var oLink2 = new Link("link2", {text : "Link2 added by addContent"});
		var oLink3 = new Link("link3", {text : "Link3 added by addContent"});
		oLayout.addContent("end", oLink2, oLink3);
		sap.ui.getCore().applyChanges();

		assert.equal(oLayout.getEnd().getContent()[1].getId(), "link2", "End Link2 was added: ");
		assert.equal(oLayout.getEnd().getContent()[2].getId(), "link3", "End Link3 was added: ");
	});

	QUnit.test("Inserting Content", function(assert) {
		//Insert one Control
		var oLink4 = new Link("link4", {text : "Link4 inserted by insertContent to index 0"});
		oLayout.insertContent("bottom", 0, oLink4);
		sap.ui.getCore().applyChanges();

		assert.equal(oLayout.getBottom().getContent()[0].getId(), "link4", "Bottom Link4 was added to Index 0");

		//Insert more than one Controls
		var oLink5 = new Link("link5", {text : "Link5 inserted by insertContent to index 1"});
		var oLink6 = new Link("link6", {text : "Link6 inserted by insertContent to index 1"});
		oLayout.insertContent("bottom", 1, oLink5, oLink6);
		sap.ui.getCore().applyChanges();

		assert.equal(oLayout.getBottom().getContent()[1].getId(), "link5", "Bottom Link5 and Link6 were added to Index 1");
		assert.equal(oLayout.getBottom().getContent()[2].getId(), "link6", "Bottom Link5 and Link6 were added to Index 1");
	});

	QUnit.test("Removing Content", function(assert) {
		//Remove one Control
		oLayout.removeContent("end", 1);
		sap.ui.getCore().applyChanges();

		assert.equal(oLayout.getEnd().getContent()[1].getId(), "link3", "End Link2 was removed from index 1");

		//Remove all Control
		oLayout.removeAllContent("bottom");
		sap.ui.getCore().applyChanges();

		assert.equal(oLayout.getBottom().getContent().length, 0, "Bottom All content has been removed");
	});

	QUnit.test("Getting Content", function(assert) {
		//Getting Content Object (Array)
		assert.equal(oLayout.getTop().getContent()[0].getId(), "top", "Top Content with index 0");
		assert.equal(oLayout.getTop().getContent()[1].getId(), "link1", "Top Content with index 1");

		assert.equal(oLayout.indexOfContent("center", oLayoutInner), 1, "Center Index of Content (inner BorderLayout)");
		assert.equal(oLayout.indexOfContent("center", sap.ui.getCore().byId("center")), 0, "Center Index of Content (text field)");
	});

	QUnit.test("Destroying Content", function(assert) {
		oLayout.destroyContent("begin");

		assert.equal(oLayout.getBegin().getContent().length, 0, "Begin Aggregations were destroyed");
	});

	QUnit.test("Getting Area Elements", function(assert) {
		var oArea = oLayout.getAreaById("top");
		assert.equal(oArea.getId(), "myLayout1--top", "Area Element Top");

		oArea = oLayout.getAreaById("begin");
		assert.equal(oArea.getId(), "myLayout1--begin", "Area Element Begin");

		oArea = oLayout.getAreaById("center");
		assert.equal(oArea.getId(), "myLayout1--center", "Area Element Center");

		oArea = oLayout.getAreaById("end");
		assert.equal(oArea.getId(), "myLayout1--end", "Area Element End");

		oArea = oLayout.getAreaById("bottom");
		assert.equal(oArea.getId(), "myLayout1--bottom", "Area Element Bottom");
	});

	QUnit.test("Getting Area DOM Elements", function(assert) {
		var oArea = oLayout.getAreaById("top");
		assert.equal(oArea.$().length, 1, "Area Element Top");
		assert.ok(oArea.$().hasClass("sapUiBorderLayoutTop"), "Area Element Top");

		oArea = oLayout.getAreaById("begin");
		assert.equal(oArea.$().length, 1, "Area Element Begin");
		assert.ok(oArea.$().hasClass("sapUiBorderLayoutBegin"), "Area Element Begin");

		oArea = oLayout.getAreaById("center");
		assert.equal(oArea.$().length, 1, "Area Element Center");
		assert.ok(oArea.$().hasClass("sapUiBorderLayoutCenter"), "Area Element Center");

		oArea = oLayout.getAreaById("end");
		assert.equal(oArea.$().length, 1, "Area Element End");
		assert.ok(oArea.$().hasClass("sapUiBorderLayoutEnd"), "Area Element End");

		oArea = oLayout.getAreaById("bottom");
		assert.equal(oArea.$().length, 1, "Area Element Bottom");
		assert.ok(oArea.$().hasClass("sapUiBorderLayoutBottom"), "Area Element Bottom");
	});
});