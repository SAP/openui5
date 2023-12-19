/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/ui/Device",
	"sap/ui/model/ClientListBinding",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/json/JSONModel"
], function(Log, deepEqual, Device, ClientListBinding, Filter, FilterOperator, Sorter,
		JSONListBinding, JSONModel) {
	/*global QUnit */
	"use strict";

	var oModel;
	var testData;
	var bindings;

	function setup(){
		// reset bindings
		bindings = [];
		testData = {
			teamMembers:[
				{firstName:"Andreas", lastName:"Klark", gender:"male"},
				{firstName:"Peter", lastName:"Miller", gender:"male"},
				{firstName:"Gina", lastName:"Rush", gender:"female"},
				{firstName:"Steave", lastName:"Ander", gender:"male"},
				{firstName:"Michael", lastName:"Spring", gender:"male"},
				{firstName:"Marc", lastName:"Green", gender:"male"},
				{firstName:"Frank", lastName:"Wallace", gender: null}
			],
			notTeamMembers:[
				{firstName:"Andreas", lastName:"Klark", gender:"male"},
				{firstName:"Peter", lastName:"Miller", gender:"male"},
				{firstName:"Gina", lastName:"Rush", gender:"female"},
				{firstName:"Steave", lastName:"Ander", gender:"male"},
				{firstName:"Michael", lastName:"Spring", gender:"male"},
				{firstName:"Marc", lastName:"Green", gender:"male"},
				{firstName:"Frank", lastName:"Wallace", gender: null},
				{firstName:"Mario", lastName:"Bross", gender:"male"},
				{firstName:"Luigi", lastName:"Brossers", gender:"male"},
				{firstName:"Sandra", lastName:"Millers", gender:"female"}
			],
			teamMembersNew:[
				{firstName:"Andreas", lastName:"Klark", gender:"male"},
				{firstName:"Gina", lastName:"Rush", gender:"female"},
				{firstName:"Steave", lastName:"Ander", gender:"male"},
				{firstName:"Michael", lastName:"Grey", gender:"male"},
				{firstName:"Michael", lastName:"Spring", gender:"male"},
				{firstName:"Marc", lastName:"Green", gender:"male"},
				{firstName:"Peter", lastName:"Franklin", gender:"male"}
			],
			filterData:[
				{form:"Original", string:"ẛ̣", representation:"\\u1E9B\\u0323"},
				{form:"NFC", string:"ẛ̣", representation:"\\u1E9B\\u0323"},
				{form:"NFD", string:"ẛ̣", representation:"\\u017F\\u0323\\u0307"},
				{form:"NFKC", string:"ṩ", representation:"\\u1E69"},
				{form:"NFKD", string:"ṩ", representation:"\\u0073\\u0323\\u0307"}
			],
			dataWithNullValues:[
				{value: 4},
				{value: 2},
				{value: null},
				{value: 1},
				{value: 3}
			],
			sortData:[
				{word: "Fuß"},
				{word: "Füssen"},
				{word: "Füße"},
				{word: "Fußball"},
				{word: "Fussel"},
				{word: "Funzel"}
			],
			caseSensitive:[
				{firstName:"Andreas", lastName:"Klark", gender:"male"},
				{firstName:"Peter", lastName:"Miller", gender:"male"},
				{firstName:"ANDREAS", lastName:"KLARK", gender:"MALE"},
				{firstName:"PETER", lastName:"MILLER", gender:"MALE"}
			],
			flatNumbers: [
				4, 6, 3, 0, 1, 2, 5
			],
			flatStrings: [
				"Andreas", "Peter", "", "Marc"
			],
			"root":[
				{
					"name": "item1",
					"nodes": [
						{
							"name": "subitem1",
							"nodes": [
								{ "name": "subsubitem1" },
								{ "name": "subsubitem2" }
							]
						},
						{
							"name": "subitem2",
							"collapsed": true,
							"nodes": [
								{ "name": "subsubitem3" }
							]
						}
					]
				},
				{
					"name": "item2",
					"nodes": [
						{ "name": "subitem3" }
					]
				}
			],
			map : {
				first : {lastName : "Dente", name : "Al", checked : true, linkText : "www.sap.com", href : "http://www.sap.com", rating : 4},
				second : {lastName : "Friese", name : "Andy", checked : true, linkText : "www.spiegel.de", href : "http://www.spiegel.de", rating : 2},
				third : {lastName : "Mann", name : "Anita", checked : false, linkText : "www.kicker.de", href : "http://www.kicker.de", rating : 3}
			},
			changeTestProperty: "SAPUI5",
			changingArray: [1, 2, "hi", "b"]
		};
		oModel = new JSONModel();
		oModel.setData(testData);

	}

	function createListBinding(sPath, oContext){
		// create binding
		bindings = [];
		if (typeof sPath === "object") {
			bindings[0] = oModel.bindList(sPath.path, sPath.context, sPath.sorters, sPath.filters, sPath.parameters, sPath.events);
		} else {
			bindings[0] = oModel.bindList(sPath, oContext);
		}
	}

	QUnit.module("sap.ui.model.json.JSONListbinding: getContexts", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
			createListBinding("/teamMembers", "");
		}
	});

	QUnit.test("method", function(assert) {
		assert.equal(bindings.length, 1, "amount of ListBindings");
		var listBinding = bindings[0];
		assert.equal(listBinding.getPath(), "/teamMembers", "ListBinding path");
		assert.equal(listBinding.getModel(), oModel, "ListBinding model");
		assert.equal(listBinding.getLength(), 7, "ListBinding getLength");
		assert.equal(listBinding.isLengthFinal(), true, "ListBinding isLengthFinal");

		listBinding.getContexts().forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/" + i, "ListBinding context");
		});

	});

	QUnit.test("wrong path", function(assert) {
		createListBinding("/xyz", "");
		assert.ok(bindings);
		assert.equal(bindings.length, 1, "amount of ListBindings");
		var listBinding = bindings[0];
		assert.ok(listBinding);
		assert.equal(listBinding.getPath(), "/xyz", "ListBinding path");
		assert.equal(listBinding.getModel(), oModel, "ListBinding model");
		assert.equal(listBinding.getContexts().length, 0, "ListBinding get Contexts with wrong path");
	});

	QUnit.test("wrong path and checkUpdate", function(assert) {
		createListBinding("teamMembers", "");

		assert.equal(bindings.length, 1, "amount of ListBindings");
		var listBinding = bindings[0];
		assert.equal(listBinding.getPath(), "teamMembers", "ListBinding path");
		assert.equal(listBinding.getModel(), oModel, "ListBinding model");

		listBinding.getModel().createBindingContext("/xyz",null, function(oContext){
			listBinding.setContext(oContext);
			listBinding.checkUpdate();
			assert.equal(listBinding.getPath(), "teamMembers", "ListBinding path");
			assert.ok(listBinding.getContext() == oContext, "ListBinding context");
			assert.equal(listBinding.getContexts().length, 0, "ListBinding contexts");
		});
	});

	QUnit.test("getCurrentContexts", function(assert) {
		var listBinding = bindings[0],
			currentContexts;

		listBinding.getContexts(0,5);
		currentContexts = listBinding.getCurrentContexts();
		assert.equal(currentContexts.length, 5, "Current contexts should contain 5 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/" + i, "ListBinding context");
		});
	});

	QUnit.test("extended change detection", function(assert) {
		var listBinding = bindings[0];
		listBinding.enableExtendedChangeDetection();

		var	contexts = listBinding.getContexts(0,5),
			currentContexts = listBinding.getCurrentContexts();

		assert.equal(currentContexts.length, 5, "Current contexts should contain 5 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/" + i, "ListBinding context");
		});

		testData.teamMembers[4].gender = "female";
		listBinding.checkUpdate();

		currentContexts = listBinding.getCurrentContexts();
		assert.equal(currentContexts.length, 5, "Current contexts should contain 5 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/" + i, "ListBinding context");
		});

		contexts = listBinding.getContexts(0,5);
		assert.equal(contexts.diff.length, 2, "Delta information is available");
	});

	QUnit.test("extended change detection with grouping", function(assert) {
		var listBinding = bindings[0];
		listBinding.sort([
			new Sorter("gender", false, true),
			new Sorter("lastName")
		]);
		listBinding.enableExtendedChangeDetection(false, "lastName");

		var	contexts = listBinding.getContexts(),
			newContexts;

		assert.equal(contexts.length, 7, "Current contexts should contain 7 items");

		// Change the gender in a way that the sort order is not affected
		testData.teamMembers[4].gender = null;
		testData.teamMembers[6].firstName = "Paul";
		listBinding.checkUpdate();

		newContexts = listBinding.getContexts();
		assert.equal(newContexts.length, 7, "Current contexts should contain 7 items");
		assert.ok(deepEqual(contexts, newContexts), "Old and new contexts array is equal");

		// Although a key is used with extended change detection, the diff must contain
		// an update, as grouping is enabled on this binding.
		assert.equal(newContexts.diff.length, 2, "Delta information is available");
	});

	QUnit.module("sap.ui.model.json.JSONListbinding: refresh", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
			createListBinding("/teamMembers", "");
			this.oBinding = oModel.bindList("/teamMembers");
			this.oBinding.initialize();
		},
		afterEach: function() {
			this.oBinding.destroy();
		}
	});

	QUnit.test("method", function(assert) {
		assert.expect(3);
		assert.equal(this.oBinding.getLength(), 7, "ListBinding returns correct length");
		this.oBinding.attachChange(function() {
			assert.ok(true, "ListBinding fires change event when changed");
		});
		testData.teamMembers.push({firstName:"Jonas", lastName:"Janus", gender:"male"});
		this.oBinding.refresh();
		assert.equal(this.oBinding.getLength(), 8, "ListBinding returns changed length");
	});

	QUnit.test("getContexts", function(assert) {
		assert.expect(1);
		var aContexts = this.oBinding.getContexts(0,5);
		assert.equal(aContexts.length, 5, "ListBinding returns correct amount of contexts");
		this.oBinding.attachChange(function() {
			assert.ok(false, "ListBinding fires no change event, as changed data is outside visible range");
		});
		testData.teamMembers[6].firstName = "Jonas";
		this.oBinding.refresh();
	});

	QUnit.test("extended change detection and getContexts", function(assert) {
		assert.expect(1);
		this.oBinding.enableExtendedChangeDetection();
		var aContexts = this.oBinding.getContexts(0,5);
		assert.equal(aContexts.length, 5, "ListBinding returns correct amount of contexts");
		this.oBinding.attachChange(function() {
			assert.ok(false, "ListBinding fires no change event, as changed data is outside visible range");
		});
		testData.teamMembers[6].firstName = "Jonas";
		this.oBinding.refresh();
	});

	QUnit.test("getContexts und length change", function(assert) {
		assert.expect(3);
		var aContexts = this.oBinding.getContexts(0,5);
		assert.equal(aContexts.length, 5, "ListBinding returns correct amount of contexts");
		this.oBinding.attachChange(function() {
			assert.ok(true, "ListBinding fires change event, as length has changed");
		});
		testData.teamMembers.push({firstName:"Jonas", lastName:"Janus", gender:"male"});
		this.oBinding.refresh();
		assert.equal(this.oBinding.getLength(), 8, "ListBinding returns changed length");
	});

	QUnit.test("extended change detection, getContexts und length change", function(assert) {
		assert.expect(3);
		this.oBinding.enableExtendedChangeDetection();
		var aContexts = this.oBinding.getContexts(0,5);
		assert.equal(aContexts.length, 5, "ListBinding returns correct amount of contexts");
		this.oBinding.attachChange(function() {
			assert.ok(true, "ListBinding fires change event, as length has changed");
		});
		testData.teamMembers.push({firstName:"Jonas", lastName:"Janus", gender:"male"});
		this.oBinding.refresh();
		assert.equal(this.oBinding.getLength(), 8, "ListBinding returns changed length");
	});

	QUnit.module("sap.ui.model.json.JSONListbinding: sort", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
		}
	});

	// should also work with other ListBinding implementations
	QUnit.test("method", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		assert.equal(listBinding.oList[0].firstName, "Andreas", "ListBinding before sort");
		assert.equal(listBinding.oList[1].firstName, "Peter", "ListBinding before sort");
		assert.equal(listBinding.oList[2].firstName, "Gina", "ListBinding before sort");
		assert.equal(listBinding.oList[3].firstName, "Steave", "ListBinding before sort");
		assert.equal(listBinding.oList[4].firstName, "Michael", "ListBinding before sort");
		assert.equal(listBinding.oList[5].firstName, "Marc", "ListBinding before sort");
		assert.equal(listBinding.oList[6].firstName, "Frank", "ListBinding before sort");

		var oSorter = new Sorter("firstName", false);
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("firstName");
		});

		assert.equal(sorted[0], "Andreas", "ListBinding after sort");
		assert.equal(sorted[1], "Frank", "ListBinding after sort");
		assert.equal(sorted[2], "Gina", "ListBinding after sort");
		assert.equal(sorted[3], "Marc", "ListBinding after sort");
		assert.equal(sorted[4], "Michael", "ListBinding after sort");
		assert.equal(sorted[5], "Peter", "ListBinding after sort");
		assert.equal(sorted[6], "Steave", "ListBinding after sort");

		//descending
		oSorter = new Sorter("firstName", true);
		listBinding.sort(oSorter);

		sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("firstName");
		});

		assert.equal(sorted[0], "Steave", "ListBinding after sort");
		assert.equal(sorted[1], "Peter", "ListBinding after sort");
		assert.equal(sorted[2], "Michael", "ListBinding after sort");
		assert.equal(sorted[3], "Marc", "ListBinding after sort");
		assert.equal(sorted[4], "Gina", "ListBinding after sort");
		assert.equal(sorted[5], "Frank", "ListBinding after sort");
		assert.equal(sorted[6], "Andreas", "ListBinding after sort");

	});

	QUnit.test("invalid binding", function(assert) {
		createListBinding("/unknown");

		var listBinding = bindings[0];
		listBinding.sort();
		assert.expect(0);
	});

	QUnit.test("null values", function(assert) {
		createListBinding("/dataWithNullValues");
		var listBinding = bindings[0], sorted;
		listBinding.sort(new Sorter("value"));

		sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("");
		});
		assert.equal(sorted.length, 5, "ListBinding sorted length");
		assert.equal(sorted[0].value, 1, "ListBinding sort value");
		assert.equal(sorted[1].value, 2, "ListBinding sort value");
		assert.equal(sorted[2].value, 3, "ListBinding sort value");
		assert.equal(sorted[3].value, 4, "ListBinding sort value");
		assert.equal(sorted[4].value, null, "ListBinding sort value");

		listBinding.sort(new Sorter("value", true));

		sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("");
		});
		assert.equal(sorted.length, 5, "ListBinding sorted length");
		assert.equal(sorted[0].value, null, "ListBinding sort value");
		assert.equal(sorted[1].value, 4, "ListBinding sort value");
		assert.equal(sorted[2].value, 3, "ListBinding sort value");
		assert.equal(sorted[3].value, 2, "ListBinding sort value");
		assert.equal(sorted[4].value, 1, "ListBinding sort value");
	});

	// should also work with other ListBinding implementations
	QUnit.test("locale sort", function(assert) {
		createListBinding("/sortData");

		var listBinding = bindings[0];

		var oSorter = new Sorter("word", false);
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("word");
		});

		assert.equal(sorted[0], "Funzel", "ListBinding after sort");
		assert.equal(sorted[1], "Fuß", "ListBinding after sort");
		assert.equal(sorted[2], "Fußball", "ListBinding after sort");
		// browsers have differnt ideas about lexical sorting
		if (Device.browser.chrome && Device.browser.version < 24.0) {
			assert.equal(sorted[3], "Fussel", "ListBinding after sort");
			assert.equal(sorted[4], "Füße", "ListBinding after sort");
		} else {
			assert.equal(sorted[3], "Füße", "ListBinding after sort");
			assert.equal(sorted[4], "Fussel", "ListBinding after sort");
		}
		assert.equal(sorted[5], "Füssen", "ListBinding after sort");

	});

	QUnit.test("multi sort", function(assert) {
		createListBinding("/teamMembersNew");

		var listBinding = bindings[0];

		var oSorter = [
			new Sorter("firstName", false),
			new Sorter("lastName", false)
		];
		listBinding.sort(oSorter);

		var sortedContexts = listBinding.getContexts();
		var sortedFirstName = [];
		var sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("firstName");
			sortedLastName[i] = context.getProperty("lastName");
		});

		assert.equal(sortedFirstName[0], "Andreas", "ListBinding after multi sort");
		assert.equal(sortedLastName[0], "Klark", "ListBinding after multi sort");
		assert.equal(sortedFirstName[1], "Gina", "ListBinding after multi sort");
		assert.equal(sortedLastName[1], "Rush", "ListBinding after multi sort");
		assert.equal(sortedFirstName[2], "Marc", "ListBinding after multi sort");
		assert.equal(sortedLastName[2], "Green", "ListBinding after multi sort");
		assert.equal(sortedFirstName[3], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[3], "Grey", "ListBinding after multi sort");
		assert.equal(sortedFirstName[4], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[4], "Spring", "ListBinding after multi sort");
		assert.equal(sortedFirstName[5], "Peter", "ListBinding after multi sort");
		assert.equal(sortedLastName[5], "Franklin", "ListBinding after multi sort");
		assert.equal(sortedFirstName[6], "Steave", "ListBinding after multi sort");
		assert.equal(sortedLastName[6], "Ander", "ListBinding after multi sort");

		oSorter = [
			new Sorter("firstName", false),
			new Sorter("lastName", true)
		];
		listBinding.sort(oSorter);

		sortedContexts = listBinding.getContexts();
		sortedFirstName = [];
		sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("firstName");
			sortedLastName[i] = context.getProperty("lastName");
		});


		assert.equal(sortedFirstName[0], "Andreas", "ListBinding after multi sort");
		assert.equal(sortedLastName[0], "Klark", "ListBinding after multi sort");
		assert.equal(sortedFirstName[1], "Gina", "ListBinding after multi sort");
		assert.equal(sortedLastName[1], "Rush", "ListBinding after multi sort");
		assert.equal(sortedFirstName[2], "Marc", "ListBinding after multi sort");
		assert.equal(sortedLastName[2], "Green", "ListBinding after multi sort");
		assert.equal(sortedFirstName[3], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[3], "Spring", "ListBinding after multi sort");
		assert.equal(sortedFirstName[4], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[4], "Grey", "ListBinding after multi sort");
		assert.equal(sortedFirstName[5], "Peter", "ListBinding after multi sort");
		assert.equal(sortedLastName[5], "Franklin", "ListBinding after multi sort");
		assert.equal(sortedFirstName[6], "Steave", "ListBinding after multi sort");
		assert.equal(sortedLastName[6], "Ander", "ListBinding after multi sort");

		oSorter = [
			new Sorter("firstName", true),
			new Sorter("lastName", false)
		];
		listBinding.sort(oSorter);

		sortedContexts = listBinding.getContexts();
		sortedFirstName = [];
		sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("firstName");
			sortedLastName[i] = context.getProperty("lastName");
		});

		assert.equal(sortedFirstName[0], "Steave", "ListBinding after multi sort");
		assert.equal(sortedLastName[0], "Ander", "ListBinding after multi sort");
		assert.equal(sortedFirstName[1], "Peter", "ListBinding after multi sort");
		assert.equal(sortedLastName[1], "Franklin", "ListBinding after multi sort");
		assert.equal(sortedFirstName[2], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[2], "Grey", "ListBinding after multi sort");
		assert.equal(sortedFirstName[3], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[3], "Spring", "ListBinding after multi sort");
		assert.equal(sortedFirstName[4], "Marc", "ListBinding after multi sort");
		assert.equal(sortedLastName[4], "Green", "ListBinding after multi sort");
		assert.equal(sortedFirstName[5], "Gina", "ListBinding after multi sort");
		assert.equal(sortedLastName[5], "Rush", "ListBinding after multi sort");
		assert.equal(sortedFirstName[6], "Andreas", "ListBinding after multi sort");
		assert.equal(sortedLastName[6], "Klark", "ListBinding after multi sort");

		oSorter = [
			new Sorter("gender", false),
			new Sorter("firstName", true),
			new Sorter("lastName", true)
		];
		listBinding.sort(oSorter);

		sortedContexts = listBinding.getContexts();
		sortedFirstName = [];
		sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("firstName");
			sortedLastName[i] = context.getProperty("lastName");
		});

		assert.equal(sortedFirstName[0], "Gina", "ListBinding after multi sort");
		assert.equal(sortedLastName[0], "Rush", "ListBinding after multi sort");
		assert.equal(sortedFirstName[1], "Steave", "ListBinding after multi sort");
		assert.equal(sortedLastName[1], "Ander", "ListBinding after multi sort");
		assert.equal(sortedFirstName[2], "Peter", "ListBinding after multi sort");
		assert.equal(sortedLastName[2], "Franklin", "ListBinding after multi sort");
		assert.equal(sortedFirstName[3], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[3], "Spring", "ListBinding after multi sort");
		assert.equal(sortedFirstName[4], "Michael", "ListBinding after multi sort");
		assert.equal(sortedLastName[4], "Grey", "ListBinding after multi sort");
		assert.equal(sortedFirstName[5], "Marc", "ListBinding after multi sort");
		assert.equal(sortedLastName[5], "Green", "ListBinding after multi sort");
		assert.equal(sortedFirstName[6], "Andreas", "ListBinding after multi sort");
		assert.equal(sortedLastName[6], "Klark", "ListBinding after multi sort");
	});

	// test for custom compare function
	QUnit.test("custom sort", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];
		var oSorter = new Sorter("firstName", false, false, function(a, b) {
			a = a.substr(1);
			b = b.substr(1);
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		});
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("firstName");
		});
		assert.equal(sorted[0], "Marc", "ListBinding after sort");
		assert.equal(sorted[1], "Peter", "ListBinding after sort");
		assert.equal(sorted[2], "Michael", "ListBinding after sort");
		assert.equal(sorted[3], "Gina", "ListBinding after sort");
		assert.equal(sorted[4], "Andreas", "ListBinding after sort");
		assert.equal(sorted[5], "Frank", "ListBinding after sort");
		assert.equal(sorted[6], "Steave", "ListBinding after sort");
	});

	QUnit.test("flat arrays", function(assert) {
		var listBinding, sorted;

		createListBinding("/flatNumbers");
		listBinding = bindings[0];
		listBinding.sort(new Sorter(""));
		sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("");
		});
		assert.deepEqual(sorted, [0,1,2,3,4,5,6], "sorted array of numbers");

		createListBinding("/flatStrings");
		listBinding = bindings[0];
		listBinding.sort(new Sorter(""));
		sorted = listBinding.getContexts().map(function(oContext, i) {
			return oContext.getProperty("");
		});
		assert.deepEqual(sorted, ["", "Andreas", "Marc", "Peter"], "sorted array of strings");

	});

	QUnit.test("change event test", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];
		var attach = false;
		listBinding.attachChange(myFnCallback);

		var oSorter = new Sorter("firstName", true);
		listBinding.sort(oSorter, true);

		function myFnCallback(oEvent){
			var sReason = oEvent.getParameter('reason');
			if (sReason === "sort"){
				attach = true;
			}
		}

		listBinding.detachChange(myFnCallback);

		assert.ok(attach, "change event fired with sorter");
	});

	QUnit.module("sap.ui.model.json.JSONListbinding: filter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
			createListBinding("/teamMembers", "");
		}
	});

	QUnit.test("method", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		//check EQ
		var oFilter = new Filter("gender", FilterOperator.EQ, null);
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0].gender, null, "ListBinding filter value");

		// NE, contains
		oFilter = new Filter("firstName", FilterOperator.NE, "Peter");
		var oFilter2 = new Filter("lastName", FilterOperator.Contains, "a");
		listBinding.filter([oFilter, oFilter2]);

		filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 3, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Andreas", "ListBinding filter value");
		assert.equal(filtered[1].firstName, "Steave", "ListBinding filter value");
		assert.equal(filtered[2].firstName, "Frank", "ListBinding filter value");

		// between
		oFilter = new Filter("firstName", FilterOperator.BT, "A","G");
		listBinding.filter([oFilter]);

		filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Andreas", "ListBinding filter value");
		assert.equal(filtered[1].firstName, "Frank", "ListBinding filter value");

		// startsWith, endsWith
		oFilter = new Filter("firstName", FilterOperator.StartsWith, "M");
		oFilter2 = new Filter("lastName", FilterOperator.EndsWith, "n");
		listBinding.filter([oFilter, oFilter2]);

		filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Marc", "ListBinding filter value");

	});

	QUnit.test("null values", function(assert) {
		createListBinding("/dataWithNullValues");
		var listBinding = bindings[0], filtered;
		listBinding.sort(new Sorter("value"));

		listBinding.filter([new Filter("value", "GT", 2)]);

		filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0].value, 3, "ListBinding filter value");
		assert.equal(filtered[1].value, 4, "ListBinding filter value");

		listBinding.filter([new Filter("value", "LT", 3)]);

		filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0].value, 1, "ListBinding filter value");
		assert.equal(filtered[1].value, 2, "ListBinding filter value");

	});

	QUnit.test("invalid binding", function(assert) {
		createListBinding("/unknown");

		var listBinding = bindings[0];
		listBinding.filter([]);
		assert.expect(0);
	});

	QUnit.test("without array", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		//check EQ
		var oFilter = new Filter("firstName", FilterOperator.EQ, "Peter");
		listBinding.filter(oFilter);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});

		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Peter", "ListBinding filter value");

		// between
		oFilter = new Filter("firstName", FilterOperator.BT, "A","G");
		listBinding.filter(oFilter);
		filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Andreas", "ListBinding filter value");
		assert.equal(filtered[1].firstName, "Frank", "ListBinding filter value");

	});

	QUnit.test("complex filters", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		//check OR
		var oFilter1 = new Filter("firstName", FilterOperator.EQ, "Peter");
		var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Frank");
		listBinding.filter([oFilter1, oFilter2]);
		var filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Peter", "ListBinding filter value");
		assert.equal(filtered[1].firstName, "Frank", "ListBinding filter value");

		//check OR & AND
		var oFilter3 = new Filter("lastName", FilterOperator.EQ, "Wallace");
		var oFilter4 = new Filter("lastName", FilterOperator.EQ, "Rush");
		listBinding.filter([oFilter1, oFilter2, oFilter3, oFilter4]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Frank", "ListBinding filter value");

	});

	QUnit.test("multi filters", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		//check (gender != female AND (lastName = Green OR (firstName = Peter OR firstName = Frank OR firstName = Gina)))
		var oFilter1 = new Filter("firstName", FilterOperator.EQ, "Peter");
		var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Frank");
		var oFilter3 = new Filter("firstName", FilterOperator.EQ, "Gina");
		var oMultiFilter1 = new Filter([oFilter1, oFilter2, oFilter3], false);
		var oFilter4 = new Filter("lastName", FilterOperator.EQ, "Green");
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter4], false);
		var oFilter5 = new Filter("gender", FilterOperator.NE, "female");
		var oMultiFilter3 = new Filter([oMultiFilter2, oFilter5], true);
		listBinding.filter(oMultiFilter3);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 3, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Peter", "ListBinding filter value");
		assert.equal(filtered[1].firstName, "Marc", "ListBinding filter value");
		assert.equal(filtered[2].firstName, "Frank", "ListBinding filter value");

		var oEmptyMultiFilterWithAND = new Filter([], true);
		listBinding.filter(oEmptyMultiFilterWithAND);
		assert.equal(listBinding.getContexts().length, 7, "empty AND multifilter should match all entries");

		var oEmptyMultiFilterWithOR = new Filter([], false);
		listBinding.filter(oEmptyMultiFilterWithOR);
		assert.equal(listBinding.getContexts().length, 0, "empty OR multifilter should match no entry");
	});

	QUnit.test("test function", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		var oFilter = new Filter("firstName", function(sValue) {
			return (sValue.indexOf("A") !== -1 && sValue.indexOf("G") === 0);
		});

		listBinding.filter(oFilter);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0].firstName, "Gina", "ListBinding filter value");
	});

	QUnit.test("change event", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];
		var attach = false;
		listBinding.attachChange(myFnCallback);

		var oFilter = new Filter("lastName", FilterOperator.EQ, "Wallace");
		var oFilter2 = new Filter("lastName", FilterOperator.EQ, "Rush");
		listBinding.filter([oFilter, oFilter2]);

		function myFnCallback(oEvent){
			var sReason = oEvent.getParameter("reason");
			if (sReason === "filter"){
				attach = true;
			}
		}

		listBinding.detachChange(myFnCallback);

		assert.ok(attach, "change event fired with filter");
	});

	QUnit.test("filter - NotContains", function(assert) {
		createListBinding("/notTeamMembers");

		var listBinding = bindings[0];

		// not contains
		var oFilter = new Filter("lastName", FilterOperator.NotContains, "l");
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});

		var iIndex = 0;
		assert.equal(filtered.length, 6, "ListBinding filtered length");
		assert.equal(filtered[iIndex++].firstName, "Gina", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Steave", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Michael", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Marc", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Mario", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Luigi", "ListBinding filter value");
		assert.equal(filtered.length, iIndex);
	});

	QUnit.test("filter - NotStartsWith", function(assert) {
		createListBinding("/notTeamMembers");

		var listBinding = bindings[0];

		// not contains
		var oFilter = new Filter("firstName", FilterOperator.NotStartsWith, "Mar");
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 8, "ListBinding filtered length");
		var iIndex = 0;
		assert.equal(filtered[iIndex++].firstName, "Andreas", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Peter", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Gina", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Steave", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Michael", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Frank", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Luigi", "ListBinding filter value");
		assert.equal(filtered[iIndex++].firstName, "Sandra", "ListBinding filter value");
		assert.equal(filtered.length, iIndex);
	});

	QUnit.test("filter - NotEndsWith", function(assert) {
		createListBinding("/notTeamMembers");

		var listBinding = bindings[0];

		// not contains
		var oFilter = new Filter("lastName", FilterOperator.NotEndsWith, "er");
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 8, "ListBinding filtered length");
		var iIndex = 0;
		assert.equal(filtered[iIndex++].lastName, "Klark", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Rush", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Spring", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Green", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Wallace", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Bross", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Brossers", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Millers", "ListBinding filter value");
		assert.equal(filtered.length, iIndex);
	});


	QUnit.test("filter - NotBetween", function(assert) {
		createListBinding("/notTeamMembers");

		var listBinding = bindings[0];

		// not contains
		var oFilter = new Filter("lastName", FilterOperator.NB, "Bross", "Miller");
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		var iIndex = 0;
		assert.equal(filtered.length, 5, "ListBinding filtered length");
		assert.equal(filtered[iIndex++].lastName, "Rush", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Ander", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Spring", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Wallace", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Millers", "ListBinding filter value");
		assert.equal(filtered.length, iIndex);
	});


	QUnit.test("filter - Between", function(assert) {
		createListBinding("/notTeamMembers");

		var listBinding = bindings[0];

		// not contains
		var oFilter = new Filter("lastName", FilterOperator.BT, "Bross", "Miller");
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});
		var iIndex = 0;
		assert.equal(filtered.length, 5, "ListBinding filtered length");
		assert.equal(filtered[iIndex++].lastName, "Klark", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Miller", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Green", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Bross", "ListBinding filter value");
		assert.equal(filtered[iIndex++].lastName, "Brossers", "ListBinding filter value");
		assert.equal(filtered.length, iIndex);
	});

	// only relevant for browsers supporting this
	if (String.prototype.normalize) {
		QUnit.test("normalization", function(assert) {
			createListBinding("/filterData");

			var listBinding = bindings[0];
			var mFilters = {
				"NFC": new Filter("string", FilterOperator.EQ, "\u1E9B\u0323"),
				"NFD": new Filter("string", FilterOperator.EQ, "\u017F\u0323\u0307"),
				"NFKC": new Filter("string", FilterOperator.EQ, "\u1E69"),
				"NFKD": new Filter("string", FilterOperator.EQ, "\u0073\u0323\u0307")
			};

			Object.keys(mFilters).forEach(function(sProp) {
				listBinding.filter(mFilters[sProp]);
				assert.equal(listBinding.getContexts().length, 5, "Filter working for " + sProp);
			});
		});
	}

	QUnit.module("sap.ui.model.json.JSONListbinding: filter case sensitive", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
			createListBinding("/caseSensitive", "");
		}
	});

	QUnit.test("Simple Filter with case sensitive", function(assert) {
		var oFilter = new Filter({
			path: "firstName",
			operator: FilterOperator.EQ,
			value1: "Andreas",
			caseSensitive: true
		});
		var oListBinding = bindings[0];

		oListBinding.filter(oFilter);
		assert.equal(oListBinding.getContexts().length, 1, "One filtered item should be returned");

		var oData = oListBinding.getContexts()[0].getObject();
		assert.strictEqual(oData.firstName, "Andreas", "FirstName should be the same");
	});

	QUnit.test("Simple Filter with comparator and case sensitive", function(assert) {
		var fnTest = function(oValue1) {
			var mNames = {
				"Peter": true,
				"Andreas": true
			};
			return oValue1 in mNames;
		};
		var oFilter = new Filter({
			path: "firstName",
			operator: FilterOperator.EQ,
			test: fnTest,
			caseSensitive: true
		});
		var oListBinding = bindings[0];

		oListBinding.filter(oFilter);
		assert.equal(oListBinding.getContexts().length, 2, "Two filtered item should be returned");

		var oData = oListBinding.getContexts()[0].getObject();
		assert.strictEqual(oData.firstName, "Andreas", "FirstName should be the same");

		oData = oListBinding.getContexts()[1].getObject();
		assert.strictEqual(oData.firstName, "Peter", "FirstName should be the same");
	});

	QUnit.module("sap.ui.model.json.JSONListbinding: Unsupported Filters", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		getErrorWithMessage: function(sFilter) {
			return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
		}
	});

	QUnit.test("constructor - Any/All are rejected", function (assert) {
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});

				var oMultiFilter = new Filter([oFilter, oFilter2], true);

				oModel.bindList("/teamMembers", undefined, undefined, [oMultiFilter]);
			},
			this.getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

	});

	QUnit.test("filter() - Any/All are rejected", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		// "Any" at last position fails
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.GT, "Wallace");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});
				listBinding.filter([oFilter, oFilter2]);
			},
			this.getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// "All" at first position fails
		assert.throws(
			function() {
				var oFilter = new Filter({path: "lastName", operator: FilterOperator.All, variable: "id2", condition: new Filter()});
				var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Rush");
				listBinding.filter([oFilter, oFilter2]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// Multifilter containing "All" or "Any" fails
		assert.throws(
			function() {
				var oFilter = new Filter({path: "lastName", operator: FilterOperator.All, variable: "id3", condition:new Filter()});
				var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Bar");

				var oMultiFilter = new Filter({
					filters: [oFilter, oFilter2],
					and: false
				});

				listBinding.filter([oMultiFilter]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// Multifilter containing "All" or "Any" fails
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id4", condition: new Filter()});

				var oMultiFilter = new Filter([oFilter, oFilter2], true);

				listBinding.filter([oMultiFilter]);
			},
			this.getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("Multi Filters (Complex) 1 - Unsupported are not OK", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter({path: "y", operator: FilterOperator.All, variable: "id1", condition: new Filter()});
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter({
			filters: [oMultiFilter2, oFilter4],
			and: true
		});

		assert.throws(
			function() {
				listBinding.filter([oMultiFilter3]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if  multi-filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function(assert) {
		createListBinding("/teamMembers");

		var listBinding = bindings[0];

		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter({
			path: "y",
			operator: FilterOperator.All,
			variable: "id1",
			condition: new Filter([
				new Filter("t", FilterOperator.GT, 66),
				new Filter({path: "g", operator: FilterOperator.Any, variable: "id2", condition: new Filter("f", FilterOperator.NE, "hello")})
			], true)
		});
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter({
			filters: [oMultiFilter2, oFilter4],
			and: true
		});

		assert.throws(
			function() {
				listBinding.filter([oMultiFilter3]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if  multi-filter instances contain an unsupported FilterOperator"
		);
	});


	QUnit.module("sap.ui.model.json.JSONListbinding: general", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
		}
	});


	QUnit.test("with map, not array", function(assert) {
		var aKeysInMap = ["first", "second", "third"];
		createListBinding("/map");

		assert.equal(bindings.length, 1, "amount of ListBindings");
		var listBinding = bindings[0];
		assert.equal(listBinding.getPath(), "/map", "ListBinding path");
		assert.equal(listBinding.getModel(), oModel, "ListBinding model");
		assert.equal(listBinding.getLength(), 3, "ListBinding getLength");
		assert.equal(listBinding.isLengthFinal(), true, "ListBinding isLengthFinal");

		listBinding.getContexts().forEach(function(context, i) {
			assert.equal(context.getPath(), "/map/" + aKeysInMap[i], "ListBinding context");
		});

	});

	QUnit.test("nested array structure", function(assert) {
		createListBinding("/root");
		var binding = bindings[0];
		var contexts = binding.getContexts();
		assert.ok(Array.isArray(contexts));
		assert.equal(contexts.length, 2);
		assert.equal(oModel.getProperty("name",contexts[0]), "item1");
		assert.equal(oModel.getProperty("nodes",contexts[0]).length, 2);
		assert.equal(oModel.getProperty("/root/0/nodes/0/nodes/1").name, "subsubitem2");
		assert.ok(oModel.getProperty("/root/0/nodes/1").collapsed);
		assert.equal(oModel.getProperty("name",contexts[1]), "item2");
		assert.equal(oModel.getProperty("nodes",contexts[1]).length, 1);
		assert.equal(oModel.getProperty("nodes/0",contexts[1]).name, "subitem3");
	});

	QUnit.test("nested array structure", function(assert) {
		bindings[0] = oModel.bindList("/root");
		bindings[1] = oModel.bindList("/root/0/nodes");
		bindings[2] = oModel.bindList("/root/1/nodes");

		var binding = bindings[1];
		var contexts = binding.getContexts();
		assert.ok(Array.isArray(contexts));
		assert.equal(contexts.length, 2);
		assert.equal(oModel.getProperty("name",contexts[0]), "subitem1");
		assert.equal(oModel.getProperty("name",contexts[1]), "subitem2");

		binding = bindings[2];
		contexts = binding.getContexts();
		assert.equal(contexts.length, 1);
		assert.equal(oModel.getProperty("name", contexts[0]), "subitem3");

		// check if nodes from different listbindings are the same/have the same reference
		assert.equal(oModel.getProperty("nodes/0/name", bindings[0].getContexts()[0]), "subitem1");
		assert.equal(oModel.getProperty("name",bindings[1].getContexts()[0]), "subitem1");
		assert.ok(deepEqual(bindings[0].oList[0].nodes[0], bindings[1].oList[0]));

		assert.equal(oModel.getProperty("nodes/0/name",bindings[0].getContexts()[1]), "subitem3");
		assert.equal(oModel.getProperty("name",bindings[2].getContexts()[0]), "subitem3");
		assert.ok(deepEqual(bindings[0].oList[1].nodes[0], bindings[2].oList[0]));
	});

	QUnit.test("getDistinctValues", function(assert) {
		createListBinding("/teamMembers");
		var binding = bindings[0],
			distinctValues;

		distinctValues = binding.getDistinctValues("firstName");
		assert.ok(Array.isArray(distinctValues), "Result is an array");
		assert.equal(distinctValues.length, 7, "Number of distinct values");
		assert.equal(distinctValues[0], "Andreas", "Distinct value content");
		assert.equal(distinctValues[6], "Frank", "Distinct value content");

		distinctValues = binding.getDistinctValues("gender");
		assert.ok(Array.isArray(distinctValues), "Result is an array");
		assert.equal(distinctValues.length, 3, "Number of distinct values");
		assert.equal(distinctValues[0], "male", "Distinct value content");
		assert.equal(distinctValues[1], "female", "Distinct value content");
		assert.equal(distinctValues[2], null, "Distinct value content");

	});

	QUnit.test("setSizeLimit", function(assert) {
		var aManyItems = [];
		for (var i = 0; i < 200; i++) {
			aManyItems.push(i);
		}
		var oModel = new JSONModel(aManyItems),
			oListBinding = oModel.bindList("/"),
			aContexts;

		aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 100, "Default size limit 100");

		oModel.setSizeLimit(150);
		aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 150, "Custom size limit 150");
	});

	QUnit.test("getLength", function(assert) {
		createListBinding("/teamMembers");

		assert.equal(bindings.length, 1, "amount of ListBindings");
		var listBinding = bindings[0];
		assert.equal(listBinding.getPath(), "/teamMembers", "ListBinding path");
		assert.equal(listBinding.getModel(), oModel, "ListBinding model");

		assert.equal(listBinding.getLength(), testData.teamMembers.length, "ListBinding length");

	});

	QUnit.test("set new data with no merge and check update and getContexts test", function(assert) {
		var newData = {
			test: [
				{firstName:"Andreas", lastName:"Klark", gender:"male" }
			]
		};

		createListBinding("/teamMembers", "");
		assert.equal(bindings.length, 1, "amount of ListBindings");
		var listBinding = bindings[0];

		function fnFunc(){
			assert.equal(listBinding.getPath(), "/teamMembers", "ListBinding path");
			assert.equal(listBinding.getContexts().length, 0, "ListBinding contexts length");
			assert.equal(listBinding.getModel().oData, newData, "ListBinding model");
			assert.equal(listBinding.getModel().getProperty("/test/0/firstName"), "Andreas", "model new property value");
			listBinding.detachChange(fnFunc);
		}
		listBinding.attachChange(fnFunc);

		assert.equal(listBinding.getPath(), "/teamMembers", "ListBinding path");
		assert.ok(listBinding.getModel() === oModel, "ListBinding model");
		// does not work...recursion because binding is set on model
		//assert.equal(listBinding.getModel(), oModel, "ListBinding model");
		listBinding.getModel().setData(newData, false);
	});

	QUnit.test("No wrong 'Change' event after unrelated property change", function (assert) {
		createListBinding("/unknown", "");

		var oListBinding = bindings[0];
		oListBinding.attachChange(function () {
			throw new Error("wrongfully called fired change event");
		});

		// Changing an unrelated property on the model should not trigger the
		// ListBinding to fire a change event.
		oModel.setProperty("/changeTestProperty", "OpenUI5");
		assert.ok(true, "no 'change' event was fired for unrelated property change");
	});

	QUnit.test("'Change' event is fired if list content changes, but length does not", function (assert) {
		createListBinding("/changingArray", "");

		var oListBinding = bindings[0];
		oListBinding.attachChange(function () {
			assert.ok(true, "'change' event was fired after list content change (no length change)");
		});

		oModel.setProperty("/changingArray", [1, 2, 3, 4]);
	});

	QUnit.module("sap.ui.model.json.JSONListbinding: diff calculation", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
			this.oModel = new JSONModel(testData.teamMembers);
			this.oListBinding = this.oModel.bindList("/");
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oListBinding.destroy();
		}
	});

	QUnit.test("setData delta", function(assert) {
		this.oListBinding.enableExtendedChangeDetection();
		var aContexts = this.oListBinding.getContexts(0, 10);
		this.oModel.setData(testData.teamMembersNew);
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [
			{ index : 1, type : "delete" },
			{ index : 3, type : "insert" },
			{ index : 6, type : "delete" },
			{ index : 6, type : "insert" }
		], "Replace new data");
	});

	QUnit.test("setProperty delta", function(assert) {
		this.oListBinding.enableExtendedChangeDetection();
		var aContexts = this.oListBinding.getContexts(0, 10);
		this.oModel.setProperty("/4/firstName", "Paul");
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [
			{ index : 4, type : "delete" },
			{ index : 4, type : "insert" }
		], "Replace one property");
		this.oModel.setProperty("/4", {
			firstName : "Peter",
			lastName : "Johnson",
			gender : "male"
		});
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [
			{ index : 4, type : "delete" },
			{ index : 4, type : "insert" }
		], "Replace whole entry");
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [], "Nothing changed");
	});

	QUnit.test("setProperty delta with cyclic references", function(assert) {
		this.oListBinding.enableExtendedChangeDetection();
		var aContexts = this.oListBinding.getContexts(0, 10);

		var oCyclic = {};
		oCyclic.a = oCyclic;

		this.oModel.setProperty("/4/firstName", oCyclic);
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.equal(aContexts.diff, undefined, "No diff for data with cyclic references");
		this.oModel.setProperty("/4/firstName", "Peter");
	});

	QUnit.test("setProperty delta with key", function(assert) {
		this.oListBinding.enableExtendedChangeDetection(false, "lastName");
		var aContexts = this.oListBinding.getContexts(0, 10);
		this.oModel.setProperty("/4/firstName", "Paul");
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [], "No diff detected, as key didn't change");
		this.oModel.setProperty("/4", {
			firstName : "Peter",
			lastName : "Johnson",
			gender : "male"
		});
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [
			{ index : 4, type : "delete" },
			{ index : 4, type : "insert" }
		], "Replace whole entry");
		aContexts = this.oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [], "Nothing changed");
	});


	QUnit.module("sap.ui.model.json.JSONListbinding: suspend/resume", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			setup();
			this.oData = testData.teamMembers.slice(0);
			this.oModel = new JSONModel(this.oData);
			this.oListBinding = this.oModel.bindList("/");
			this.oListBinding.attachChange(function() {});
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oListBinding.destroy();
		}
	});

	QUnit.test("suspend/resume", function(assert) {
		var oLB = this.oListBinding;
		assert.equal(oLB.getContexts().length, 7, "Binding has length 7 initially");
		this.oData.push({firstName:"Peter", lastName:"Franklin", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 8, "Binding has length 8 after adding an entry");
		oLB.suspend();
		this.oData.push({firstName:"Michael", lastName:"Peterson", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 8, "Binding still has length 8 as it is suspended");
		oLB.resume();
		assert.equal(oLB.getContexts().length, 9, "Binding has length 9 after calling resume");
	});

	QUnit.test("suspend/resume with filter/sort", function(assert) {
		var oLB = this.oListBinding;
		assert.equal(oLB.getContexts().length, 7, "Binding has length 7 initially");
		this.oData.push({firstName:"Peter", lastName:"Franklin", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 8, "Binding has length 8 after adding an entry");
		oLB.suspend();
		this.oData.push({firstName:"Michael", lastName:"Peterson", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 8, "Binding still has length 8 as it is suspended");
		oLB.sort(new Sorter("firstName"));
		assert.equal(oLB.getContexts().length, 9, "Binding has length 9 after sorting");
		this.oData.push({firstName:"Michael", lastName:"Bubble", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 9, "Binding still has length 9 as it is suspended");
		oLB.filter([new Filter("firstName", "EQ", "Michael")]);
		assert.equal(oLB.getContexts().length, 3, "Binding has length 3 after filtering");
		oLB.resume();
		assert.equal(oLB.getContexts().length, 3, "Binding still has length 3 after calling resume");
	});

	QUnit.test("suspend/resume with refresh", function(assert) {
		var oLB = this.oListBinding;
		assert.equal(oLB.getContexts().length, 7, "Binding has length 7 initially");
		this.oData.push({firstName:"Peter", lastName:"Franklin", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 8, "Binding has length 8 after adding an entry");
		oLB.suspend();
		this.oData.push({firstName:"Michael", lastName:"Peterson", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 8, "Binding still has length 8 as it is suspended");
		this.oModel.refresh(true);
		assert.equal(oLB.getContexts().length, 9, "Binding has length 9 after force refresh");
		this.oData.push({firstName:"Michael", lastName:"Peterson", gender:"male"});
		this.oModel.refresh();
		assert.equal(oLB.getContexts().length, 9, "Binding still has length 9 as it is suspended");
		oLB.resume();
		assert.equal(oLB.getContexts().length, 10, "Binding still has length 10 after calling resume");
	});

	//**********************************************************************************************
	QUnit.test("_getContexts: calls getResolvedPath", function (assert) {
		var oBinding = this.oListBinding;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("getContext").withExactArgs("~resolvedPath/1")
			.returns("~context");

		// code under test
		assert.deepEqual(oBinding._getContexts(1, 1), ["~context"]);
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.json.JSONListBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//**********************************************************************************************
	QUnit.test("getAllCurrentContexts: Returns contexts", function (assert) {
		var oBinding = {
				_getContexts : function () {}
			};

		this.mock(oBinding).expects("_getContexts").withExactArgs(0, Infinity)
			.returns("~aContexts");

		// code under test
		assert.strictEqual(JSONListBinding.prototype.getAllCurrentContexts.call(oBinding),
			"~aContexts");
	});

	//**********************************************************************************************
	QUnit.test("getContexts: implemented in ClientListBinding", function (assert) {
		assert.strictEqual(JSONListBinding.prototype.getContexts,
			ClientListBinding.prototype.getContexts);
	});

	//**********************************************************************************************
	QUnit.test("getCurrentContexts: implemented in ClientListBinding", function (assert) {
		assert.strictEqual(JSONListBinding.prototype.getCurrentContexts,
			ClientListBinding.prototype.getCurrentContexts);
	});
});