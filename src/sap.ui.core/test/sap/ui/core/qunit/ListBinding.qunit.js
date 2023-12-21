/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter"
], function(Control, Element, ChangeReason, FilterType, ListBinding, JSONModel, Sorter) {
	"use strict";

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

		oNamedModel = new JSONModel();
		oNamedModel.setData(testData);

		control = new MyList();
		control.setModel(oModel);
		control.setModel(oNamedModel, "NamedModel");
	}

	QUnit.module("sap.ui.model.ListBinding: Integrative Tests", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		}
	});

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
		control.setModel(oModel);

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	/** @deprecated since 1.120, reason ManagedObject does not support retrieval of class c'tor via global in 2.0 */
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
		control.setModel(oModel);

		var items = control.getAggregation("items");
		assert.equal(items.length, testData.teamMembers.length, "number of list items");
		assert.ok(items[0] instanceof MyListItem, "cloned items are list items");
	});

	//**********************************************************************************************
	QUnit.test("getCount: Count is returned", function(assert) {
		var oBinding = {
				getLength : function () {},
				isLengthFinal : function () {}
			};

		sinon.mock(oBinding).expects("isLengthFinal").returns(true);
		sinon.mock(oBinding).expects("getLength").returns("~length");

		// code under test
		assert.strictEqual(ListBinding.prototype.getCount.call(oBinding), "~length");
	});

	//**********************************************************************************************
	QUnit.test("getCount: Length is not final", function(assert) {
		var oBinding = {
				getLength : function () {},
				isLengthFinal : function () {}
			};

		sinon.mock(oBinding).expects("isLengthFinal").returns(false);
		sinon.mock(oBinding).expects("getLength").exactly(0);

		// code under test
		assert.strictEqual(ListBinding.prototype.getCount.call(oBinding), undefined);
	});

	//**********************************************************************************************
	QUnit.test("getFilters", function(assert) {
		var oBinding = {},
			aReturnedFilters;

		assert.throws(function() {
			// code under test
			ListBinding.prototype.getFilters.call(oBinding);
		}, new Error("Invalid FilterType: undefined"));

		oBinding.aApplicationFilters = ["~appfilter~"];

		// code under test
		aReturnedFilters = ListBinding.prototype.getFilters.call(oBinding, FilterType.Application);

		assert.deepEqual(aReturnedFilters, ["~appfilter~"]);
		assert.notStrictEqual(oBinding.aApplicationFilters, aReturnedFilters);

		oBinding.aFilters = ["~filter~"];

		// code under test
		aReturnedFilters = ListBinding.prototype.getFilters.call(oBinding, FilterType.Control);

		assert.deepEqual(aReturnedFilters, ["~filter~"]);
		assert.notStrictEqual(oBinding.aFilters, aReturnedFilters);

		// all models in sap.ui.models have an empty array. but it is not a requirement for other
		// models
		oBinding.aFilters = undefined;
		oBinding.aApplicationFilters = undefined;

		// code under test
		assert.deepEqual(ListBinding.prototype.getFilters.call(oBinding, FilterType.Application),
			[]);
		assert.deepEqual(ListBinding.prototype.getFilters.call(oBinding, FilterType.Control),
			[]);
	});

	//**********************************************************************************************
	QUnit.module("sap.ui.model.Sorter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		}
	});

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
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
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