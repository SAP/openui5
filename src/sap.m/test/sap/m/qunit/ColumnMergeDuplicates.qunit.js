/*global QUnit,sinon */
sap.ui.define([
	"sap/base/util/extend",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Table",
	"sap/ui/core/Icon",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/test/TestUtils"
], function(extend, Column, ColumnListItem, Label, Table, Icon, Sorter, JSONModel, ODataV4Model, nextUIUpdate, TestUtils) {
	"use strict";

	let $MergedLabel, $MergedIcon;

	async function ui5Event(sEventName, oControl) {
		return await new Promise((fnResolve) => {
			oControl?.attachEventOnce(sEventName, fnResolve);
		});
	}

	function createTable(sId, bGrowing, oBindConfig) {

		const oTable = new Table(sId, {
			growing : bGrowing,
			growingThreshold : 5,
			columns : [
				new Column({
					mergeDuplicates : true,
					mergeFunctionName : "getSrc"
				}),
				new Column({
					header : new Label({
						text : "Last Name"
					})
				}),
				new Column({
					header : new Label({
						text : "Gender"
					}),
					mergeDuplicates : true
				})
			]
		});

		// JSON sample data
		const data = {
			teamMembers:[
				{lastName:"Doe",gender:"Male"},
				{lastName:"Ali",gender:"Female"},
				{lastName:"Benson",gender:"Male"},
				{lastName:"Don",gender:"Male"},
				{lastName:"Bumon",gender:"Male"},
				{lastName:"Allegro",gender:"Male"},
				{lastName:"Dufke",gender:"Fale"},
				{lastName:"Alioli",gender:"Male"},
				{lastName:"Delorean",gender:"Female"},
				{lastName:"Botticelli",gender:"Female"}
			]};

		// create JSON model instance
		const oModel = new JSONModel();

		// set the data for the model
		oModel.setData(data);

		// define the template
		const oItemTemplate = new ColumnListItem({
			cells : [
				new Icon({
					src : {
						path: "gender",
						formatter: function(sGender) {
							return (sGender === "Male" ? "sap-icon://wrench" : "sap-icon://show");
						}
					}
				}),
				new Label({
					text: "{lastName}"
				}),
				new Label({
					text: "{gender}"
				})
			]
		});

		// build binding confing
		oBindConfig = extend({
			path : "/teamMembers",
			template : oItemTemplate
		}, oBindConfig);
		oTable.setModel(oModel).bindItems(oBindConfig);

		return oTable;
	}

	QUnit.module("Display");

	QUnit.test("Merge Label and Icon", async function(assert) {
		const oTable = createTable("MergeDuplicates");

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		$MergedLabel = oTable.getItems()[3].getCells()[2].$();
		$MergedIcon = oTable.getItems()[3].getCells()[0].$();

		assert.ok($MergedLabel.hasClass("sapMListTblCellDupCnt"), "duplicated label should be merged.");
		assert.strictEqual($MergedLabel.text(), "Male", "duplicated label is still available in the dom for screen readers.");
		assert.ok($MergedIcon.hasClass("sapMListTblCellDupCnt"), "duplicated icon should be merged.");

		oTable.destroy();
	});

	QUnit.test("Merge in Growing Feature", async function(assert) {
		const oTable = createTable("MergeDuplicates", true);

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		oTable._oGrowingDelegate.requestNewPage();
		await ui5Event("updateFinished", oTable);

		const $FirstLabelAfterGrowing = oTable.getItems()[5].getCells()[2].$();
		const $FirstIconAfterGrowing =  oTable.getItems()[5].getCells()[0].$();

		assert.ok($FirstLabelAfterGrowing.hasClass("sapMListTblCellDupCnt"), "label of the first item after growing should be merged.");
		assert.strictEqual($FirstLabelAfterGrowing.text(), "Male", "duplicated label is still available in the dom for screen readers.");

		assert.ok($FirstIconAfterGrowing.hasClass("sapMListTblCellDupCnt"), "icon of the first item after growing should be merged.");

		oTable.destroy();
	});

	QUnit.test("Merge when Group Header occures", async function(assert) {
		const oLastNameSorter = new Sorter("lastName", false, true);
		const oTable = createTable("MergeDuplicates", false, {sorter: oLastNameSorter});

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const labelBeforeHeader = oTable.getItems()[3].getCells()[2].$().text();
		const labelAfterHeader = oTable.getItems()[5].getCells()[2].$().text();

		assert.ok(labelBeforeHeader == labelAfterHeader, "label value after group header should not be merged.");

		const iconAfterHeader = oTable.getItems()[5].getCells()[0].getDomRef();

		assert.ok(iconAfterHeader, "icon src after group header should not be merged");

		oTable.destroy();
	});

	QUnit.test("Merge when Table Rerendering", async function(assert) {
		const oTable = createTable("MergeDuplicates");

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const data = {
				teamMembers:[
					{lastName:"Doe" ,gender:"Male"}
				]};

		oTable.setModel(new JSONModel(data));
		await nextUIUpdate();

		const labelLastValue = oTable.getColumns()[2].getLastValue();
		const iconLastValue = oTable.getColumns()[0].getLastValue();

		oTable.invalidate();
		await nextUIUpdate();

		const labelAfterRender = oTable.getItems()[0].getCells()[2].$().text();
		const iconAfterRender = oTable.getItems()[0].getCells()[0].getSrc();

		assert.ok(labelLastValue == labelAfterRender, "last value of label should be cleared if there is only one row");
		assert.ok(iconLastValue == iconAfterRender, "last value of icon should be cleared if there is only one row");

		oTable.destroy();
	});

	QUnit.test("Merge when Items Rerendering", async function(assert) {
		const oTable = createTable("MergeDuplicates");

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const data = {
				teamMembers:[
					{lastName:"Doe" ,gender:"Male"},
					{lastName:"Doe" ,gender:"Male"}
				]};

		oTable.setModel(new JSONModel(data));
		await nextUIUpdate();

		const oFirstItem = oTable.getItems()[0],
			oSecondItem = oTable.getItems()[1];

		const mBeforeRendering = {
			firstItem: {
				label: oFirstItem.getCells()[2].$().text(),
				icon: oFirstItem.getCells()[0].getSrc()
			},
			secondItem: {
				label: oSecondItem.getCells()[2].$().text(),
				icon: oSecondItem.getCells()[0].getSrc()
			}
		};

		//rerender the items
		oFirstItem.invalidate();
		oSecondItem.invalidate();
		await nextUIUpdate();

		const mAfterRendering = {
			firstItem: {
				label: oFirstItem.getCells()[2].$().text(),
				icon: oFirstItem.getCells()[0].getSrc()
			},
			secondItem: {
				label: oSecondItem.getCells()[2].$().text(),
				icon: oSecondItem.getCells()[0].getSrc()
			}
		};

		assert.deepEqual(mBeforeRendering, mAfterRendering, "Items rendering does not change the merging status");

		//clean up
		oTable.destroy();
	});

	QUnit.module("OData V4", {
		before: function() {
			// The TestUtils FakeServer Cannot be used together with the sap.ui.core.util.MockServer!
			this.oFakeServer = TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/demokit/sample/odata/v4/Products/data", {
				"/MyService/$metadata": {
					source: "metadata.xml"
				},
				"/MyService/ProductList(ProductID='DD402')/PRODUCT_2_BP?$skip=0&$top=2": {
					message: {value: [{CompanyName: "SAP"}, {CompanyName: "SAP"}]}
				},
				"/MyService/ProductList(ProductID='DD402')/PRODUCT_2_BP?$skip=2&$top=2": {
					message: {value: [{CompanyName: "SAP"}, {CompanyName: "SAP"}]}
				},
				"/MyService/ProductList(ProductID='DD402')/PRODUCT_2_BP?$skip=4&$top=2": {
					message: {value: [{CompanyName: "ABC"}, {CompanyName: "CBA"}]}
				}
			});
		},
		beforeEach: async function() {
			this.oModel = new ODataV4Model({
				serviceUrl: "/MyService/",
				operationMode: "Server"
			});

			this.oTable = new Table({
				growing: true,
				growingThreshold: 2,
				columns : new Column({
					header : new Label({
						text : "CompanyName"
					}),
					mergeDuplicates : true
				}),
				items: {
					path: "",
					template: new ColumnListItem({
						cells: new Label({ text: "{CompanyName}" })
					})
				},
				models: this.oModel,
				bindingContexts: this.oModel.createBindingContext("/ProductList(ProductID='DD402')/PRODUCT_2_BP")
			});

			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oTable.destroy();
		},
		after: function() {
			this.oFakeServer.restore();
		}
	});

	QUnit.test("Merge cells", async function(assert) {
		const oTable = this.oTable;
		const that = this;

		await ui5Event("updateFinished", oTable);

		assert.notOk(oTable.getItems()[0].getCells()[0].$().hasClass("sapMListTblCellDupCnt"));
		assert.ok(oTable.getItems()[1].getCells()[0].$().hasClass("sapMListTblCellDupCnt"));
		assert.ok(oTable._oGrowingDelegate._bApplyChunkAsync);

		oTable.$("trigger").trigger("tap");
		await ui5Event("updateFinished", oTable);

		assert.ok(that.oTable.getItems()[2].getCells()[0].$().hasClass("sapMListTblCellDupCnt"));
		assert.ok(that.oTable.getItems()[3].getCells()[0].$().hasClass("sapMListTblCellDupCnt"));

		oTable.$("trigger").trigger("tap");
		await ui5Event("updateStarted", oTable);

		oTable._oGrowingDelegate._aChunk = [new ColumnListItem({
			cells: new Label({ text: "My Company" })
		})];
		oTable._oGrowingDelegate.applyChunkAsync(0);
		await ui5Event("updateFinished", oTable);

		assert.equal(that.oTable.getItems().length, 6);
		assert.equal(that.oTable.getItemsContainerDomRef().childElementCount, 6);
		assert.equal(that.oTable.getItems()[0].getCells()[0].getText(), "SAP");
	});
});