/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ClientListBinding",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/xml/XMLListBinding",
	"sap/ui/model/xml/XMLModel",
	"sap/ui/thirdparty/jquery"
], function(Log, Device, ChangeReason, ClientListBinding, Filter, FilterOperator, Sorter,
		XMLListBinding, XMLModel, jQuery) {
	/*global QUnit */
	"use strict";

	var testData =
		"<root>" +
			"<name>Peter</name>" +
			"<teamMembers>" +
				"<member firstName=\"Andreas\" lastName=\"Klark\" gender=\"male\">1</member>" +
				"<member firstName=\"Peter\" lastName=\"Miller\" gender=\"male\">2</member>" +
				"<member firstName=\"Gina\" lastName=\"Rush\" gender=\"female\">3</member>" +
				"<member firstName=\"Steave\" lastName=\"Ander\" gender=\"male\">4</member>" +
				"<member firstName=\"Michael\" lastName=\"Spring\" gender=\"male\">5</member>" +
				"<member firstName=\"Marc\" lastName=\"Green\" gender=\"male\">6</member>" +
				"<member firstName=\"Frank\" lastName=\"Wallace\" gender=\"male\">7</member>" +
			"</teamMembers>" +
			"<teamMembersNew>" +
				"<member firstName=\"Andreas\" lastName=\"Klark\" gender=\"male\">1</member>" +
				"<member firstName=\"Gina\" lastName=\"Rush\" gender=\"female\">2</member>" +
				"<member firstName=\"Steave\" lastName=\"Ander\" gender=\"male\">3</member>" +
				"<member firstName=\"Michael\" lastName=\"Grey\" gender=\"male\">4</member>" +
				"<member firstName=\"Michael\" lastName=\"Spring\" gender=\"male\">5</member>" +
				"<member firstName=\"Marc\" lastName=\"Green\" gender=\"male\">6</member>" +
				"<member firstName=\"Peter\" lastName=\"Franklin\" gender=\"male\">7</member>" +
			"</teamMembersNew>" +
			"<sortData>" +
				"<entry word=\"Fuß\">1</entry>" +
				"<entry word=\"Füssen\">1</entry>" +
				"<entry word=\"Füße\">1</entry>" +
				"<entry word=\"Fußball\">1</entry>" +
				"<entry word=\"Fussel\">1</entry>" +
				"<entry word=\"Funzel\">1</entry>" +
			"</sortData>" +
			"<root>" +
				"<nodes0 name=\"item1\">" +
					"<nodes1 name=\"subitem1\">" +
						"<nodes2 name=\"subsubitem1\">" +
							"<nodes3>subsubsubitem1</nodes3>" +
							"<nodes3>subsubsubitem2</nodes3>" +
						"</nodes2>" +
						"<nodes2 name=\"subsubitem2\" collapsed=\"true\">" +
							"<nodes3>subsubsubitem3</nodes3>" +
						"</nodes2>" +
					"</nodes1>" +
				"</nodes0>" +
				"<nodes0 name=\"item2\">" +
					"<nodes1>subitem3</nodes1>" +
				"</nodes0>" +
			"</root>" +
			"<changeTestProperty>SAPUI5</changeTestProperty>" +
			"<changingArray><entry>1</entry><entry>2</entry><entry>3</entry><entry>4</entry></changingArray>" +
		"</root>";

	QUnit.module("sap.ui.model.xml.XMLListBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			this.oModel = new XMLModel();
			this.oModel.setXML(testData);
		},
		afterEach: function() {
			this.oModel.destroy();
		},
		createListBinding: function(sPath, oContext){
			// create binding
			if (typeof sPath === "object") {
				return this.oModel.bindList(sPath.path, sPath.context, sPath.sorters, sPath.filters, sPath.parameters, sPath.events);
			} else {
				return this.oModel.bindList(sPath, oContext);
			}
		}
	});

	QUnit.test("ListBinding getContexts", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		assert.ok(listBinding, "ListBinding should have been created");
		assert.equal(listBinding.getPath(), "/teamMembers/member", "ListBinding path");
		assert.equal(listBinding.getModel(), this.oModel, "ListBinding model");
		assert.equal(listBinding.getLength(), 7, "ListBinding getLength");
		assert.equal(listBinding.isLengthFinal(), true, "ListBinding isLengthFinal");

		listBinding.getContexts().forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/member/" + i, "ListBinding context");
		});

	});

	QUnit.test("ListBinding getCurrentContexts", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member"),
			currentContexts;

		listBinding.getContexts(0,5); // request contexts
		currentContexts = listBinding.getCurrentContexts();

		assert.equal(currentContexts.length, 5, "Current contexts should contain 5 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/member/" + i, "ListBinding context");
		});
	});

	QUnit.test("ListBinding getCurrentContexts and extended change detection", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member", "");
		listBinding.enableExtendedChangeDetection();

		var	contexts = listBinding.getContexts(0,5),
			currentContexts = listBinding.getCurrentContexts();

		assert.equal(currentContexts.length, 5, "Current contexts should contain 5 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/member/" + i, "ListBinding context");
		});

		this.oModel.getData().firstChild.childNodes[1].childNodes[4].setAttribute("gender", "female");
		listBinding.checkUpdate();

		currentContexts = listBinding.getCurrentContexts();
		assert.equal(currentContexts.length, 5, "Current contexts should contain 5 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/teamMembers/member/" + i, "ListBinding context");
		});

		contexts = listBinding.getContexts(0,5);
		assert.equal(contexts.diff.length, 2, "Delta information is available");
	});

	QUnit.test("ListBinding refresh", function(assert) {
		var oBinding = this.oModel.bindList("/teamMembers/member"),
			iChangeCount = 0,
			oDoc;

		oBinding.initialize();
		assert.strictEqual(oBinding.getLength(), 7, "ListBinding returns correct length");
		oBinding.attachChange(function() {
			iChangeCount += 1;
		});
		oDoc = this.oModel.getData();
		oDoc.firstChild.childNodes[1].appendChild(oDoc.createElement("member"));

		// code under test
		oBinding.refresh();

		assert.strictEqual(iChangeCount, 1, "ListBinding fires change event when changed");
		assert.strictEqual(oBinding.getLength(), 8, "ListBinding returns changed length");
	});

	QUnit.test("ListBinding refresh with getContexts", function(assert) {
		var oBinding = this.oModel.bindList("/teamMembers/member"),
			iChangeCount = 0,
			aContexts, oDoc;

		oBinding.initialize();
		aContexts = oBinding.getContexts(0,5);
		assert.strictEqual(aContexts.length, 5, "ListBinding returns correct amount of contexts");
		oBinding.attachChange(function() {
			iChangeCount += 1;
			assert.ok(false, "No change event, as changed data is outside visible range");
		});
		oDoc = this.oModel.getData();
		oDoc.firstChild.childNodes[1].childNodes[6].setAttribute("firstName", "Jonas");

		// code under test
		oBinding.refresh();

		assert.strictEqual(iChangeCount, 0, "ListBinding fires change event when changed");
	});

	QUnit.test("ListBinding refresh with getContexts and length change", function(assert) {
		var oBinding = this.oModel.bindList("/teamMembers/member"),
			iChangeCount = 0,
			aContexts = oBinding.getContexts(0,5),
			oDoc;

		assert.strictEqual(aContexts.length, 5, "ListBinding returns correct amount of contexts");
		oBinding.attachChange(function() {
			assert.ok(true, "ListBinding fires change event, as length has changed");
			iChangeCount += 1;
		});
		oDoc = this.oModel.getData();
		oDoc.firstChild.childNodes[1].appendChild(oDoc.createElement("member"));

		// code under test
		oBinding.refresh();

		assert.strictEqual(oBinding.getLength(), 8, "ListBinding returns changed length");
		assert.strictEqual(iChangeCount, 1, "ListBinding fires change event when changed");
	});

	QUnit.test("ListBinding getContexts with wrong path", function(assert) {
		var listBinding = this.createListBinding("xyz");
		assert.ok(listBinding, "ListBinding should have been created");
		assert.equal(listBinding.getPath(), "xyz", "ListBinding path");
		assert.equal(listBinding.getModel(), this.oModel, "ListBinding model");
		assert.equal(listBinding.getContexts().length, 0, "ListBinding get Contexts with wrong path");
	});

	QUnit.test("ListBinding getContexts with wrong path and checkUpdate", function(assert) {

		var listBinding = this.createListBinding("teamMembers/member");

		assert.ok(listBinding, "ListBinding should have been created");
		assert.equal(listBinding.getPath(), "teamMembers/member", "ListBinding path");
		assert.equal(listBinding.getModel(), this.oModel, "ListBinding model");

		var done = assert.async();
		listBinding.getModel().createBindingContext("/xyz", null, function(oContext){
			listBinding.setContext(oContext);
			listBinding.checkUpdate();
			assert.equal(listBinding.getPath(), "teamMembers/member", "ListBinding path");
			assert.ok(listBinding.getContext() == oContext, "ListBinding context");
			assert.equal(listBinding.getContexts().length, 0, "ListBinding contexts");
			done();
		});

	});

	QUnit.test("ListBinding set new data with no merge and check update and getContexts test", function(assert) {

		var listBinding = this.createListBinding("/teamMembers/member");

		function onChange() {
			assert.equal(listBinding.getPath(), "/teamMembers/member", "ListBinding path");
			assert.equal(listBinding.getContexts().length, 0, "ListBinding contexts length");
			assert.equal(listBinding.getModel().getProperty("/"), "xx", "model new property value");
			listBinding.detachChange(onChange);
		}

		assert.ok(listBinding, "ListBinding should have been created");
		listBinding.attachChange(onChange);
		assert.equal(listBinding.getPath(), "/teamMembers/member", "ListBinding path");
		assert.ok(listBinding.getModel() === this.oModel, "ListBinding model");
		// does not work...recursion because bining is set on model
		//assert.equal(listBinding.getModel(), this.oModel, "ListBinding model");
		var newData = "<blubb>xx</blubb>";
		listBinding.getModel().setXML(newData);
	});

	QUnit.test("XMLListBinding getLength", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		assert.ok(listBinding, "ListBinding should have been created");
		assert.equal(listBinding.getPath(), "/teamMembers/member", "ListBinding path");
		assert.equal(listBinding.getModel(), this.oModel, "ListBinding model");
		assert.equal(listBinding.getLength(), 7, "ListBinding length");

	});

	// should also work with other ListBinding implementations
	QUnit.test("ListBinding sort", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		assert.equal(listBinding.oList[0].getAttribute("firstName"), "Andreas", "ListBinding before sort");
		assert.equal(listBinding.oList[1].getAttribute("firstName"), "Peter", "ListBinding before sort");
		assert.equal(listBinding.oList[2].getAttribute("firstName"), "Gina", "ListBinding before sort");
		assert.equal(listBinding.oList[3].getAttribute("firstName"), "Steave", "ListBinding before sort");
		assert.equal(listBinding.oList[4].getAttribute("firstName"), "Michael", "ListBinding before sort");
		assert.equal(listBinding.oList[5].getAttribute("firstName"), "Marc", "ListBinding before sort");
		assert.equal(listBinding.oList[6].getAttribute("firstName"), "Frank", "ListBinding before sort");

		var oSorter = new Sorter("@firstName", false);
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(sorted[0], "Andreas", "ListBinding after sort");
		assert.equal(sorted[1], "Frank", "ListBinding after sort");
		assert.equal(sorted[2], "Gina", "ListBinding after sort");
		assert.equal(sorted[3], "Marc", "ListBinding after sort");
		assert.equal(sorted[4], "Michael", "ListBinding after sort");
		assert.equal(sorted[5], "Peter", "ListBinding after sort");
		assert.equal(sorted[6], "Steave", "ListBinding after sort");

		//descending
		oSorter = new Sorter("@firstName", true);
		listBinding.sort(oSorter);

		sorted = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(sorted[0], "Steave", "ListBinding after sort");
		assert.equal(sorted[1], "Peter", "ListBinding after sort");
		assert.equal(sorted[2], "Michael", "ListBinding after sort");
		assert.equal(sorted[3], "Marc", "ListBinding after sort");
		assert.equal(sorted[4], "Gina", "ListBinding after sort");
		assert.equal(sorted[5], "Frank", "ListBinding after sort");
		assert.equal(sorted[6], "Andreas", "ListBinding after sort");

	});

	QUnit.test("ListBinding sort invalid binding", function(assert) {
		var listBinding = this.createListBinding("/unknown");

		listBinding.sort();
	});

	// test for locale dependent sort order
	QUnit.test("ListBinding locale sort", function(assert) {
		var listBinding = this.createListBinding("/sortData/entry");

		var oSorter = new Sorter("@word", false);
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(context) {
			return context.getProperty("@word");
		});

		assert.equal(sorted[0], "Funzel", "ListBinding after sort");
		assert.equal(sorted[1], "Fuß", "ListBinding after sort");
		assert.equal(sorted[2], "Fußball", "ListBinding after sort");
		// browsers have different ideas about lexical sorting
		if (Device.browser.chrome  && Device.browser.version < 24.0) {
			assert.equal(sorted[3], "Fussel", "ListBinding after sort");
			assert.equal(sorted[4], "Füße", "ListBinding after sort");
		} else {
			assert.equal(sorted[3], "Füße", "ListBinding after sort");
			assert.equal(sorted[4], "Fussel", "ListBinding after sort");
		}
		assert.equal(sorted[5], "Füssen", "ListBinding after sort");

	});

	QUnit.test("ListBinding multi sort", function(assert) {
		var listBinding = this.createListBinding("/teamMembersNew/member");

		var oSorter = [
			new Sorter("@firstName", false),
			new Sorter("@lastName", false)
		];
		listBinding.sort(oSorter);

		var sortedContexts = listBinding.getContexts();
		var sortedFirstName = [];
		var sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("@firstName");
			sortedLastName[i] = context.getProperty("@lastName");
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
			new Sorter("@firstName", false),
			new Sorter("@lastName", true)
		];
		listBinding.sort(oSorter);

		sortedContexts = listBinding.getContexts();
		sortedFirstName = [];
		sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("@firstName");
			sortedLastName[i] = context.getProperty("@lastName");
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
			new Sorter("@firstName", true),
			new Sorter("@lastName", false)
		];
		listBinding.sort(oSorter);

		sortedContexts = listBinding.getContexts();
		sortedFirstName = [];
		sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("@firstName");
			sortedLastName[i] = context.getProperty("@lastName");
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
			new Sorter("@gender", false),
			new Sorter("@firstName", true),
			new Sorter("@lastName", true)
		];
		listBinding.sort(oSorter);

		sortedContexts = listBinding.getContexts();
		sortedFirstName = [];
		sortedLastName = [];
		sortedContexts.forEach(function(context, i) {
			sortedFirstName[i] = context.getProperty("@firstName");
			sortedLastName[i] = context.getProperty("@lastName");
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
	QUnit.test("ListBinding custom sort", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		var oSorter = new Sorter("@firstName", false);
		oSorter.fnCompare = function(a, b) {
			a = a.substr(1);
			b = b.substr(1);
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		};
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(sorted[0], "Marc", "ListBinding after sort");
		assert.equal(sorted[1], "Peter", "ListBinding after sort");
		assert.equal(sorted[2], "Michael", "ListBinding after sort");
		assert.equal(sorted[3], "Gina", "ListBinding after sort");
		assert.equal(sorted[4], "Andreas", "ListBinding after sort");
		assert.equal(sorted[5], "Frank", "ListBinding after sort");
		assert.equal(sorted[6], "Steave", "ListBinding after sort");
	});

	// should also work with other ListBinding implementations
	QUnit.test("ListBinding sort node text", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		assert.equal(jQuery(listBinding.oList[0]).text(), "1", "ListBinding before sort");
		assert.equal(jQuery(listBinding.oList[1]).text(), "2", "ListBinding before sort");
		assert.equal(jQuery(listBinding.oList[2]).text(), "3", "ListBinding before sort");
		assert.equal(jQuery(listBinding.oList[3]).text(), "4", "ListBinding before sort");
		assert.equal(jQuery(listBinding.oList[4]).text(), "5", "ListBinding before sort");
		assert.equal(jQuery(listBinding.oList[5]).text(), "6", "ListBinding before sort");
		assert.equal(jQuery(listBinding.oList[6]).text(), "7", "ListBinding before sort");

		var oSorter = new Sorter("text()", false);
		listBinding.sort(oSorter);

		var sorted = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});

		assert.equal(sorted[0], "1", "ListBinding after sort");
		assert.equal(sorted[1], "2", "ListBinding after sort");
		assert.equal(sorted[2], "3", "ListBinding after sort");
		assert.equal(sorted[3], "4", "ListBinding after sort");
		assert.equal(sorted[4], "5", "ListBinding after sort");
		assert.equal(sorted[5], "6", "ListBinding after sort");
		assert.equal(sorted[6], "7", "ListBinding after sort");

		//descending
		oSorter = new Sorter("text()", true);
		listBinding.sort(oSorter);

		sorted = listBinding.getContexts().map(function(context, i) {
			return context.getProperty("");
		});


		assert.equal(sorted[0], "7", "ListBinding after sort");
		assert.equal(sorted[1], "6", "ListBinding after sort");
		assert.equal(sorted[2], "5", "ListBinding after sort");
		assert.equal(sorted[3], "4", "ListBinding after sort");
		assert.equal(sorted[4], "3", "ListBinding after sort");
		assert.equal(sorted[5], "2", "ListBinding after sort");
		assert.equal(sorted[6], "1", "ListBinding after sort");

	});

	QUnit.test("ListBinding change event sorter test", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		var attach = false;
		listBinding.attachChange(myFnCallback);

		var oSorter = new Sorter("@firstName", true);
		listBinding.sort(oSorter);

		function myFnCallback(oEvent){
			var sReason = oEvent.getParameter('reason');
			if (sReason === ChangeReason.Sort){
				attach = true;
			}
		}

		listBinding.detachChange(myFnCallback);

		assert.ok(attach, "change event fired with sorter");
	});

	QUnit.test("ListBinding filter", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member"),
			oFilter, oFilter2, filtered;

		//check EQ
		oFilter = new Filter("@firstName", FilterOperator.EQ, "Peter");
		listBinding.filter([oFilter]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0], "Peter", "ListBinding filter value");

		// NE, contains
		oFilter = new Filter("@firstName", FilterOperator.NE, "Peter");
		oFilter2 = new Filter("@lastName", FilterOperator.Contains, "a");
		listBinding.filter([oFilter, oFilter2]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});
		assert.equal(filtered.length, 3, "ListBinding filtered length");
		assert.equal(filtered[0], "Andreas", "ListBinding filter value");
		assert.equal(filtered[1], "Steave", "ListBinding filter value");
		assert.equal(filtered[2], "Frank", "ListBinding filter value");

		// between
		oFilter = new Filter("@firstName", FilterOperator.BT, "A","G");
		listBinding.filter([oFilter]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});
		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0], "Andreas", "ListBinding filter value");
		assert.equal(filtered[1], "Frank", "ListBinding filter value");

		// startsWith, endsWith
		oFilter = new Filter("@firstName", FilterOperator.StartsWith, "M");
		oFilter2 = new Filter("@lastName", FilterOperator.EndsWith, "n");
		listBinding.filter([oFilter, oFilter2]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0], "Marc", "ListBinding filter value");

	});

	QUnit.test("ListBinding filter invalid binding", function(assert) {
		var listBinding = this.createListBinding("/unknown");

		listBinding.filter([]);
	});

	QUnit.test("ListBinding filter (without array)", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member"),
			oFilter, filtered;

		//check EQ
		oFilter = new Filter("@firstName", FilterOperator.EQ, "Peter");
		listBinding.filter(oFilter);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0], "Peter", "ListBinding filter value");

		// between
		oFilter = new Filter("@firstName", FilterOperator.BT, "A","G");
		listBinding.filter(oFilter);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0], "Andreas", "ListBinding filter value");
		assert.equal(filtered[1], "Frank", "ListBinding filter value");

	});

	QUnit.test("ListBinding filter node text", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		//check EQ
		var oFilter = new Filter("text()", FilterOperator.EQ, "5");
		listBinding.filter([oFilter]);
		var filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("");
		});
		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0], "5", "ListBinding filter value");

	});

	QUnit.test("ListBinding complex filters", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member"),
			oFilter1, oFilter2, oFilter3, oFilter4, filtered;

		//check OR
		oFilter1 = new Filter("@firstName", FilterOperator.EQ, "Peter");
		oFilter2 = new Filter("@firstName", FilterOperator.EQ, "Frank");
		listBinding.filter([oFilter1, oFilter2]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(filtered.length, 2, "ListBinding filtered length");
		assert.equal(filtered[0], "Peter", "ListBinding filter value");
		assert.equal(filtered[1], "Frank", "ListBinding filter value");

		//check OR & AND
		oFilter3 = new Filter("@lastName", FilterOperator.EQ, "Wallace");
		oFilter4 = new Filter("@lastName", FilterOperator.EQ, "Rush");
		listBinding.filter([oFilter1, oFilter2, oFilter3, oFilter4]);
		filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0], "Frank", "ListBinding filter value");

	});

	QUnit.test("ListBinding multi filters", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		//check (gender=male AND (lastName = Green OR (firstName = Peter OR firstName = Frank OR firstName = Gina)))
		var oFilter1 = new Filter("@firstName", FilterOperator.EQ, "Peter");
		var oFilter2 = new Filter("@firstName", FilterOperator.EQ, "Frank");
		var oFilter3 = new Filter("@firstName", FilterOperator.EQ, "Gina");
		var oMultiFilter1 = new Filter([oFilter1, oFilter2, oFilter3], false);
		var oFilter4 = new Filter("@lastName", FilterOperator.EQ, "Green");
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter4], false);
		var oFilter5 = new Filter("@gender", FilterOperator.EQ, "male");
		var oMultiFilter3 = new Filter([oMultiFilter2, oFilter5], true);
		listBinding.filter(oMultiFilter3);
		var filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(filtered.length, 3, "ListBinding filtered length");
		assert.equal(filtered[0], "Peter", "ListBinding filter value");
		assert.equal(filtered[1], "Marc", "ListBinding filter value");
		assert.equal(filtered[2], "Frank", "ListBinding filter value");

	});

	QUnit.test("ListBinding with test function", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		var oFilter = new Filter("@firstName", function(sValue, oContext) {
			return (sValue.indexOf("A") !== -1 && sValue.indexOf("G") === 0);
		});

		listBinding.filter(oFilter);
		var filtered = listBinding.getContexts().map(function(context) {
			return context.getProperty("@firstName");
		});

		assert.equal(filtered.length, 1, "ListBinding filtered length");
		assert.equal(filtered[0], "Gina", "ListBinding filter value");
	});

	QUnit.test("ListBinding change event filter test", function(assert) {
		var listBinding = this.createListBinding("/teamMembers/member");

		var attach = false;
		listBinding.attachChange(myFnCallback);

		var oFilter1 = new Filter("@firstName", FilterOperator.EQ, "Peter");
		var oFilter2 = new Filter("@firstName", FilterOperator.EQ, "Frank");
		listBinding.filter([oFilter1, oFilter2]);

		function myFnCallback(oEvent){
			var sReason = oEvent.getParameter("reason");
			if (sReason === ChangeReason.Filter){
				attach = true;
			}
		}

		listBinding.detachChange(myFnCallback);

		assert.ok(attach, "change event fired with filter");
	});

	QUnit.test("ListBinding nested array structure and createbindingcontexts", function(assert) {
		var binding = this.createListBinding("/root/nodes0");
		var contexts = binding.getContexts();
		assert.ok(Array.isArray(contexts));
		assert.equal(contexts.length, 2);
		assert.equal(this.oModel.getProperty("@name",contexts[0]), "item1");
		var context;
		this.oModel.createBindingContext("/root/nodes0/0/nodes1/0/nodes2/0/nodes3/1", null, function(newContext){
			context = newContext;
		});
		assert.equal(this.oModel.getProperty("", context), "subsubsubitem2");
		assert.equal(this.oModel.getProperty("/root/nodes0/0/nodes1/0/nodes2/0/nodes3/1"), "subsubsubitem2");
		assert.ok(this.oModel.getProperty("/root/nodes0/0/nodes1/0/nodes2/1/@collapsed"), true);

		assert.equal(this.oModel.getProperty("@name", contexts[1]), "item2");

		this.oModel.createBindingContext("nodes1/0", contexts[1], function(newContext){
			context = newContext;
		});
		assert.equal(context.getPath(), "/root/nodes0/1/nodes1/0");
		assert.equal(this.oModel.getProperty("", context), "subitem3");
	});

	QUnit.test("ListBinding nested array structure", function(assert) {
		var binding0 = this.oModel.bindList("/root/nodes0",""),
			binding1 = this.oModel.bindList("/root/nodes0/0/nodes1/0/nodes2",""),
			binding2 = this.oModel.bindList("/root/nodes0/1/",""),
			contexts;

		contexts = binding1.getContexts();
		assert.ok(Array.isArray(contexts));
		assert.equal(contexts.length, 2);
		assert.equal(this.oModel.getProperty("@name", contexts[0]), "subsubitem1");
		assert.equal(this.oModel.getProperty("@name", contexts[1]), "subsubitem2");

		contexts = binding2.getContexts();
		assert.equal(contexts.length, 1);
		assert.equal(this.oModel.getProperty("nodes1/0",contexts[0]), "subitem3");

		// check if nodes from different listbindings are the same/have the same reference
		assert.equal(this.oModel.getProperty("nodes1/0/nodes2/0/@name", binding0.getContexts()[0]), "subsubitem1");
		assert.equal(this.oModel.getProperty("@name", binding1.getContexts()[0]), "subsubitem1");
		assert.ok(binding0.oList[0].childNodes[0].childNodes[0].isEqualNode(binding1.oList[0]));

		assert.equal(this.oModel.getProperty("nodes1/0", binding0.getContexts()[1]), "subitem3");
		assert.equal(this.oModel.getProperty("", binding2.getContexts()[0]), "subitem3");
		assert.ok(binding0.oList[1].childNodes[0].isEqualNode(binding2.oList[0].childNodes[0]));
	});

	QUnit.test("ListBinding getDistinctValues", function(assert) {
		var binding = this.createListBinding("/teamMembers/member"),
			distinctValues;

		distinctValues = binding.getDistinctValues("@firstName");
		assert.ok(Array.isArray(distinctValues), "Result is an array");
		assert.equal(distinctValues.length, 7, "Number of distinct values");
		assert.equal(distinctValues[0], "Andreas", "Distinct value content");
		assert.equal(distinctValues[6], "Frank", "Distinct value content");

		distinctValues = binding.getDistinctValues("@gender");
		assert.ok(Array.isArray(distinctValues), "Result is an array");
		assert.equal(distinctValues.length, 2, "Number of distinct values");
		assert.equal(distinctValues[0], "male", "Distinct value content");
		assert.equal(distinctValues[1], "female", "Distinct value content");

	});

	QUnit.test("ListBinding setSizeLimit", function(assert) {
		var sManyItems = "<root>";
		for (var i = 0; i < 200; i++) {
			sManyItems += "<item>" + i + "</item>";
		}
		sManyItems += "</root>";
		var oModel = new XMLModel();
		oModel.setXML(sManyItems);

		var oListBinding = oModel.bindList("/item"),
			aContexts;

		aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 100, "Default size limit 100");

		oModel.setSizeLimit(150);
		aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 150, "Custom size limit 150");
	});

	QUnit.test("ListBinding setProperty delta", function(assert) {
		var oListBinding = this.createListBinding("/teamMembers/member");

		oListBinding.enableExtendedChangeDetection();
		var aContexts = oListBinding.getContexts(0, 10);
		this.oModel.setProperty("/teamMembers/member/4/@firstName", "Paul");
		aContexts = oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [
			{ index: 4, type: "delete" },
			{ index: 4, type: "insert" }
		], "Replace one property");
		aContexts = oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [], "Nothing changed");
	});

	QUnit.test("setProperty delta with key", function(assert) {
		var oListBinding = this.createListBinding("/teamMembers/member");

		oListBinding.enableExtendedChangeDetection(false, "@lastName");
		var aContexts = oListBinding.getContexts(0, 10);
		this.oModel.setProperty("/teamMembers/member/4/@firstName", "Paul");
		aContexts = oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [], "No diff detected, as key didn't change");
		this.oModel.setProperty("/teamMembers/member/4/@lastName", "Smith");
		aContexts = oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [
			{ index : 4, type : "delete" },
			{ index : 4, type : "insert" }
		], "Key property was changed");
		aContexts = oListBinding.getContexts(0, 10);
		assert.deepEqual(aContexts.diff, [], "Nothing changed");
	});

	QUnit.test("No wrong 'Change' event after unrelated property change", function (assert) {
		var oListBinding = this.createListBinding("/unknown", "");

		oListBinding.attachChange(function () {
			throw new Error("wrongfully called fired change event");
		});

		// Changing an unrelated property on the model should not trigger the
		// ListBinding to fire a change event.
		this.oModel.setProperty("/changeTestProperty", "OpenUI5");

		assert.ok("no 'change' event was fired for unrelated property change");
	});

	//Test fails because jQuery.sap.equal does not work correctly for XML DOM nodes
	QUnit.skip("'Change' event is fired if list content changes, but length does not", function (assert) {
		var oListBinding = this.createListBinding("/changingArray", "");

		oListBinding.attachChange(function () {
			assert.ok(true, "'change' event was fired after list content change (no length change)");
		});

		this.oModel.setProperty("/changingArray", [1, 2, 3, 4]);
	});

	//**********************************************************************************************
	QUnit.test("getContexts: implemented in ClientListBinding", function (assert) {
		assert.strictEqual(XMLListBinding.prototype.getContexts,
			ClientListBinding.prototype.getContexts);
	});

	//**********************************************************************************************
	QUnit.test("getCurrentContexts: implemented in ClientListBinding", function (assert) {
		assert.strictEqual(XMLListBinding.prototype.getCurrentContexts,
			ClientListBinding.prototype.getCurrentContexts);
	});
});