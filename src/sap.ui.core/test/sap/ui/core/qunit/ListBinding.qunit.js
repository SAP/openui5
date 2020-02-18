/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/Sorter"
], function(
	Element,
	Control,
	ChangeReason,
	JSONModel,
	JSONListBinding,
	Sorter
) {
	"use strict";

	//add divs for control tests
	var oContent = document.createElement("div");
	oContent.setAttribute("id", "content");
	document.body.appendChild(oContent);

	var oModel, oNamedModel;
	var testData;
	var control;

	var MyListItem = Element.extend("MyListItem", {
		// the control API:
		metadata : {
			properties : {
				"text" : "string"
			}
		}
	});

	var MyList = Control.extend("MyList", {

		// the control API:
		metadata : {
			aggregations : {
				"items" : {type: "MyListItem", multiple: true}
			}
		},

		// the part creating the HTML:
		renderer : function(oRm, oControl) {
			oRm.write("<ul");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oControl.getItems().forEach(function(oItem) {
				oRm.write("<li");
				if (oItem.getTooltip_AsString()) {
					oRm.writeAttributeEscaped("title", oItem.getTooltip_AsString());
				}
				oRm.write(">");
				oRm.writeEscaped(oItem.getText());
				oRm.write("</li>");
			});
			oRm.write("</ul>");
		}

	});

	function setup(){
		testData = {
			teamMembers:[
				{firstName:"Andreas", lastName:"Klark", gender:"male"},
				{firstName:"Peter", lastName:"Miller", gender:"male"},
				{firstName:"Gina", lastName:"Rush", gender:"female"},
				{firstName:"Steave", lastName:"Ander", gender:"male"},
				{firstName:"Michael", lastName:"Spring", gender:"male"},
				{firstName:"Marc", lastName:"Green", gender:"male"},
				{firstName:"Frank", lastName:"Wallace", gender:"male"}
			]
		};
		oModel = new JSONModel();
		oModel.setData(testData);
		sap.ui.getCore().setModel(oModel);

		oNamedModel = new JSONModel();
		oNamedModel.setData(testData);
		sap.ui.getCore().setModel(oNamedModel,"NamedModel");

		control = new MyList();
		control.placeAt("content");
	}

	QUnit.test("ListBinding with Template (classical)", function(assert) {
		setup();
		control.bindAggregation("items", "/teamMembers", new MyListItem({text:"{lastName}"}));

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("Named model: ListBinding with Template (classical)", function(assert) {
		setup();
		control.bindAggregation("items", "NamedModel>/teamMembers", new MyListItem({text:"{NamedModel>firstName}"}));

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("ListBinding with Factory (classical)", function(assert) {
		setup();
		control.bindAggregation("items", "/teamMembers", function(sId, oContext) {
			var gender = oContext.getProperty("gender"),
				li = new MyListItem(sId, {text:"{lastName}"});
			if (gender == "female") {
				li.setTooltip("w");
			}
			return li;
		});

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("Named model: ListBinding with Factory (classical)", function(assert) {
		setup();
		control.bindAggregation("items", "NamedModel>/teamMembers", function(sId, oContext) {
			var gender = oContext.getProperty("gender"),
				li = new MyListItem(sId, {text:"{NamedModel>firstName}"});
			if (gender == "female") {
				li.setTooltip("w");
			}
			return li;
		});

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("ListBinding with Template", function(assert) {
		setup();
		control.bindAggregation("items", {
			path: "/teamMembers",
			template: new MyListItem({text:"{lastName}"})
		});

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("ListBinding with Factory", function(assert) {
		setup();
		control.bindAggregation("items", {
			path: "/teamMembers",
			factory: function(sId, oContext) {
				var gender = oContext.getProperty("gender"),
					li = new MyListItem(sId, {text:"{lastName}"});
				if (gender == "female") {
					li.setTooltip("w");
				}
				return li;
			}
		});

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("ListBinding with bindElement", function(assert) {
		setup();
		oModel = new JSONModel();
		oModel.setData({modelData:testData});
		control.setModel(oModel);
		control.bindAggregation("items", {
			path: "teamMembers",
			template: new MyListItem({text:"{lastName}"})
		});
		control.bindElement("/modelData");
		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("Named model: ListBinding with bindElement", function(assert) {
		setup();
		oNamedModel = new JSONModel();
		oNamedModel.setData({modelData:testData});
		control.setModel(oNamedModel,"NamedModel");
		control.bindAggregation("items", {
			path: "NamedModel>teamMembers",
			template: new MyListItem({text:"{NamedModel>firstName}"})
		});
		control.bindElement("NamedModel>/modelData");
		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("ListBinding with Template (constructor)", function(assert) {
		setup();
		control.destroy();
		control = new MyList({
			items: {
				path: "/teamMembers",
				template: new MyListItem({text:"{lastName}"})
			}
		});
		control.placeAt("content");

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.test("ListBinding with Template (constructor, json)", function(assert) {
		setup();
		control.destroy();
		control = new MyList({
			items: {
				path: "/teamMembers",
				template: {
					Type: "MyListItem",
					text: "{lastName}"
				}
			}
		});
		control.placeAt("content");

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	QUnit.module("Sorter");

	QUnit.test("getGroupFunction", function(assert) {
		var oSorter = new Sorter("myProperty", false);
		assert.equal(oSorter.getGroupFunction(), undefined, "sorter without group configuration should return undefined group function");
		oSorter = new Sorter("myProperty", false, function() { return this;});
		assert.equal(typeof oSorter.getGroupFunction(), 'function', "sorter with group configuration should return a group function");
		assert.strictEqual(oSorter.getGroupFunction().call(window), oSorter, "invocation of the group function should use the sorter as this context");
		oSorter = new Sorter("myProperty", false, true);
		assert.equal(typeof oSorter.getGroupFunction(), 'function', "sorter with group configuration 'true' should return a group function");
	});

	QUnit.module("detailedReason in change event", {
		beforeEach: function() {
			this.oList = new MyList({
				items: {
					path: '/data',
					template: new MyListItem()
				},
				models: new JSONModel({
					data: [
						{ id: "1" }
					]
				})
			});
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("with generic update method", function(assert) {
		// setup
		var oList = this.oList,
			oBinding = oList.getBinding("items");

		this.spy(oList, "updateAggregation");

		// act
		oBinding._fireChange({
			reason: ChangeReason.Change,
			detailedReason: "RemoveVirtualContext"
		});

		// assert
		assert.ok(oList.updateAggregation.calledWith(
				sinon.match.any,
				ChangeReason.Change,
				sinon.match({detailedReason: "RemoveVirtualContext"})),
				"generic 'updateAggregation' method was called with detailed change reason");
	});

	QUnit.test("with named update method", function(assert) {
		// setup
		var oList = this.oList,
			oBinding = oList.getBinding("items");

		oList.updateItems = this.stub();

		// act
		oBinding._fireChange({
			reason: ChangeReason.Change,
			detailedReason: "RemoveVirtualContext"
		});

		// assert
		assert.ok(oList.updateItems.calledWith(
				ChangeReason.Change,
				sinon.match({detailedReason: "RemoveVirtualContext"})),
				"named 'updateItems' method was called with detailed change reason");
	});

});