/*global QUnit, sinon */
sap.ui.define([
	"sap/m/App",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/StandardListItem",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/jquery"
], function(App, List, Page, StandardListItem, Sorter, JSONModel, ODataV4Model, createAndAppendDiv, nextUIUpdate, TestUtils, jQuery) {
	"use strict";
	createAndAppendDiv("content");

	async function timeout(iDuration) {
		await new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	async function ui5Event(sEventName, oControl) {
		return await new Promise((fnResolve) => {
			oControl?.attachEventOnce(sEventName, fnResolve);
		});
	}

	const data = {persons:[
		{name:"Adalbert"},
		{name:"Anna"},
		{name:"Karl"},
		{name:"Berta"},
		{name:"Maik"},
		{name:"Franz"},
		{name:"Andrea"},
		{name:"Paula"},
		{name:"Karl"},
		{name:"Adelheid"},
		{name:"Brimborium"},
		{name:"Astrid"},
		{name:"Bernd"},
		{name:"Britta"},
		{name:"Friedrich"},
		{name:"Fritz"},
		{name:"Ede"},
		{name:"Eduard"},
		{name:"Nicolas"}
	]};

	const data2 = {persons:[
		{name:"Adalbert2"},
		{name:"Berta2"},
		{name:"Caesar2"},
		{name:"Dora2"},
		{name:"Ede2"},
		{name:"Franz2"},
		{name:"Gerald2"},
		{name:"Hermann2"},
		{name:"Iwona2"},
		{name:"Joker2"},
		{name:"Konrad2"}
	]};

	const model = new JSONModel();
	model.setData(data);

	// the List
	const oList = new List("gl", {
		mode: "MultiSelect",
		growingThreshold: 3,
		growing : true
	});

	const oTemplate = new StandardListItem({
		title: "{name}"
	});

	const oSorter = new Sorter("name", false, function(oContext){
		return oContext.getProperty("name").charAt(0); // group by first letter of name
	});

	oList.bindItems({
		path:"/persons",
		template:oTemplate,
		sorter:oSorter
	});


	const app = new App("myApp", {
		initialPage: "page1",
		pages: [
			new Page("page1", {
				title: "GrowingList",
				content: oList
			})
		],
		models: model
	});

	function $ul() {
		return jQuery("#gl-listUl");
	}

	function info(index) {
		const $Item = $ul().children(":eq(" + index + ")");
		const bHeader = $Item.hasClass("sapMGHLI");
		const sText = bHeader ? $Item.find(".sapMGHLITitle").text() : $Item.find(".sapMSLITitleOnly").text();
		return {
			header: bHeader,
			text: sText
		};
	}


	// Tests

	QUnit.test("GrowingList rendered", async function(assert) {
		oList.addEventDelegate({
			onAfterRendering: function(){
				assert.ok("Complete rendering happened");
			}
		});

		assert.expect(10); // incl. rendering
		app.placeAt("content");
		await nextUIUpdate();
		assert.ok(document.getElementById("gl"), "GrowingList should be rendered");
		assert.equal($ul().length, 1, "GrowingList should have its list rendered");
		assert.equal($ul().children().length, 4, "GrowingList should have one header and three items rendered");

		assert.equal(info(0).header, true, "First item should be a header");
		assert.equal(info(0).text, "A", "First item should be titled 'A'");
		assert.equal(info(1).header, false, "Second item should not be a header");
		assert.equal(info(1).text, "Adalbert", "Second item should be titled 'Adalbert'");
		assert.equal(info(2).header, false, "Third item should not be a header");
		assert.equal(info(2).text, "Adelheid", "Third item should be titled 'Adelheid'");
	});

	QUnit.test("Grow Tap", async function(assert){
		assert.expect(5); // no rerendering
		oList._oGrowingDelegate.requestNewPage(); // this context should be the trigger list item
		await timeout();

		assert.equal($ul().children().length, 8, "GrowingList should have two headers and six items rendered");
		assert.equal(info(6).header, true, "Sixth item should be a header");
		assert.equal(info(6).text, "B", "Sixth item should be titled 'B'");
		assert.equal(info(7).header, false, "Seventh item should not be a header");
		assert.equal(info(7).text, "Bernd", "Seventh item should be titled 'Bernd'");
	});

	QUnit.test("change data property", async function(assert){
		assert.expect(5);
		model.setProperty("name", "Adx", oList.getItems()[1].getBindingContext());
		await timeout();

		assert.equal($ul().children().length, 8, "GrowingList should still have two headers and six items rendered");
		assert.equal(info(1).header, false, "Second item should not be a header");
		assert.equal(info(1).text, "Adelheid", "Second item should be titled 'Adelheid'");
		assert.equal(info(2).header, false, "Third item should not be a header");
		assert.equal(info(2).text, "Adx", "Third item should be titled 'Adx'");
	});

	QUnit.test("New Data", async function(assert) {
		assert.expect(7);
		model.setData(data2);
		await nextUIUpdate();

		assert.equal($ul().children().length, 12, "GrowingList should have six headers and six items rendered");
		assert.equal(info(0).header, true, "First item should be a header");
		assert.equal(info(0).text, "A", "First item should be titled 'A'");
		assert.equal(info(1).header, false, "Second item should not be a header");
		assert.equal(info(1).text, "Adalbert2", "Second item should be titled 'Adalbert2'");
		assert.equal(info(2).header, true, "Third item should be a header");
		assert.equal(info(2).text, "B", "Third item should be titled 'Adelheid'");
	});

	QUnit.test("Group/Ungroup", async function(assert) {
		const oBinding = oList.getBinding("items");
		oBinding.sort(new Sorter("", false, function(oContext){
			return oContext.getProperty("name").charAt(0);
		}));
		await nextUIUpdate();

		assert.ok(info(0).header, "First item should be a group header");

		const fnUpdateSelectedPathsSpy = sinon.spy(oList, "_updateSelectedPaths");
		const nextSelectionChangeEvent = ui5Event("selectionChange", oList);

		oList.selectAll(true);
		const oEvent = await nextSelectionChangeEvent;

		assert.equal(oList.getItems().length, 6, "The list has 6 items");
		assert.ok(oList.isAllSelectableSelected(), "Select all executed only for selectable items");
		assert.equal(oEvent.getParameter("listItems").length, 3, "Selection is changed for 3 items");
		assert.notOk(oEvent.getParameter("listItems").some((oLI) => oLI.isA("sap.m.GroupHeaderListItem")), "No group header is informed in the event");

		assert.ok(fnUpdateSelectedPathsSpy.neverCalledWith(oList.getItems()[0]), "GroupHeaders do not participate in selection remembering");

		fnUpdateSelectedPathsSpy.restore();

		oBinding.sort();
		await nextUIUpdate();

		assert.notOk(info(0).header, "The group header should be removed");
		assert.ok(oList.isAllSelectableSelected(), "Select all worked correctly even after binding update");
	});

	QUnit.module("OData V4", {
		before: function() {
			// The TestUtils FakeServer Cannot be used together with the sap.ui.core.util.MockServer!
			this.oFakeServer = TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/demokit/sample/odata/v4/Products/data", {
				"/MyService/$metadata": {
					source: "metadata.xml"
				},
				"/MyService/ProductList(ProductID='DD402')/PRODUCT_2_BP?$skip=0&$top=2": {
					message: {value: [{CompanyName: "Super Corp."}, {CompanyName: "International Fraud Ltd."}]}
				},
				"/MyService/ProductList(ProductID='DD424')/PRODUCT_2_BP?$skip=0&$top=2": {
					message: {value: [{CompanyName: "Food Store"}, {CompanyName: "Fishing Shop"}]}
				},
				"/MyService/ProductList(ProductID='DD522')/PRODUCT_2_BP?$skip=0&$top=2": {
					code: 500,
					message: {error: {code: "010", message: {value: "The requested entity does not exist."}}}
				}
			});
		},
		beforeEach: async function() {
			this.oModel = new ODataV4Model({
				serviceUrl: "/MyService/",
				operationMode: "Server"
			});
			this.oList = new List({
				growing: true,
				growingThreshold: 2,
				mode: "MultiSelect",
				items: {
					path: "",
					template: new StandardListItem({title: "{CompanyName}"})
				},
				models: this.oModel,
				bindingContexts: this.oModel.createBindingContext("/ProductList(ProductID='DD402')/PRODUCT_2_BP")
			});

			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oList.destroy();
		},
		after: function() {
			this.oFakeServer.restore();
		}
	});

	QUnit.test("Change binding context", async function(assert) {
		const oList = this.oList;

		await ui5Event("updateFinished", oList);

		assert.ok(oList.getItems().length === 2, "List has items");
		assert.ok(!oList.getDomRef("nodata"), "NoData not visible");

		oList.setBindingContext(oList.getModel().createBindingContext("/ProductList(ProductID='DD522')/PRODUCT_2_BP"));
		await ui5Event("updateFinished", oList);

		assert.ok(oList.getItems().length === 0, "List has no items");
		assert.ok(oList.getDomRef("nodata"), "NoData visible");

		oList.setBindingContext(oList.getModel().createBindingContext("/ProductList(ProductID='DD424')/PRODUCT_2_BP"));
		await ui5Event("updateFinished", oList);

		assert.ok(oList.getItems().length === 2, "List has items");
	});

	QUnit.test("rememberSelections", async function(assert) {
		const oList = this.oList;
		const oBinding = oList.getBinding("items");

		await ui5Event("updateFinished", oList);

		assert.equal(oList.getItems().length, 2, "List has 2 items");
		const aContexts = oBinding.getAllCurrentContexts();
		const fnContextClass = aContexts[0].constructor.prototype;
		const oContextSetSelectedSpy = this.spy(fnContextClass, "setSelected");
		const oGetAllCurrentContextsSpy = this.spy(oBinding, "getAllCurrentContexts");

		oList.selectAll();
		assert.ok(oContextSetSelectedSpy.firstCall.calledOn(aContexts[0]), "setSelected is called on the first context");
		assert.ok(oContextSetSelectedSpy.firstCall.calledWith(true), "setSelected(true) is called on the first context");
		assert.ok(oContextSetSelectedSpy.secondCall.calledOn(aContexts[1]), "setSelected is called on the second context");
		assert.ok(oContextSetSelectedSpy.secondCall.calledWith(true), "setSelected(true) is called on the second context");
		oContextSetSelectedSpy.resetHistory();

		oList.getSelectedContexts();
		assert.ok(oGetAllCurrentContextsSpy.notCalled, "getAllCurrentContexts is not called since bAll parameter is not set");

		assert.deepEqual(oList.getSelectedContexts(true), aContexts, "all contexts are selected");
		assert.ok(oGetAllCurrentContextsSpy.called, "getAllCurrentContexts is called to retrieve selected contexts");
		oGetAllCurrentContextsSpy.resetHistory();

		oList.removeSelections();
		assert.ok(oGetAllCurrentContextsSpy.notCalled, "getAllCurrentContexts is not called since bAll parameter is not set");

		oList.removeSelections(true);
		assert.ok(oContextSetSelectedSpy.firstCall.calledOn(aContexts[0]), "setSelected is called on the first context");
		assert.ok(oContextSetSelectedSpy.firstCall.calledWith(false), "setSelected(false) is called on the first context");
		assert.ok(oContextSetSelectedSpy.secondCall.calledOn(aContexts[1]), "setSelected is called on the second context");
		assert.ok(oContextSetSelectedSpy.secondCall.calledWith(false), "setSelected(false) is called on the second context");
		assert.ok(oGetAllCurrentContextsSpy.called, "getAllCurrentContexts is called to retrieve selected contexts");
		oGetAllCurrentContextsSpy.resetHistory();
		oContextSetSelectedSpy.resetHistory();

		oList.getItems()[1].setSelected(true);
		assert.ok(oContextSetSelectedSpy.calledOn(aContexts[1]), "setSelected is called on the second context");
		assert.ok(oContextSetSelectedSpy.calledWith(true), "setSelected(true) is called on the second context");
		oContextSetSelectedSpy.resetHistory();

		assert.deepEqual(
			oList.getSelectedContexts(true),
			oBinding.getAllCurrentContexts().filter((oContext) => oContext.isSelected()),
			"The list and the binding reports the same selected contexts"
		);

		oList.getItems()[1].setSelected(false);
		assert.ok(oContextSetSelectedSpy.calledOn(aContexts[1]), "setSelected is called on the second context");
		assert.ok(oContextSetSelectedSpy.calledWith(false), "setSelected(false) is called on the second context");
		oContextSetSelectedSpy.resetHistory();

		assert.deepEqual(
			oList.getSelectedContexts(true),
			oBinding.getAllCurrentContexts().filter((oContext) => oContext.isSelected()),
			"The list and the binding reports the same selected contexts"
		);
	});
});