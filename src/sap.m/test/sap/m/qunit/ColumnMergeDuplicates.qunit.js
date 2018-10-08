/*global QUnit */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Icon",
	"sap/ui/model/Sorter",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/ColumnListItem"
], function(JSONModel, Icon, Sorter, Table, Column, Label, ColumnListItem) {
	"use strict";



	var $MergedLabel, $MergedIcon;

	function createSUT(sId, bGrowing, oBindConfig){

		var oTable = new Table(sId, {
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
		var data = {
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
		var oModel = new JSONModel();

		// set the data for the model
		oModel.setData(data);

		// set the model to the core
		sap.ui.getCore().setModel(oModel);

		// define the template
		var oItemTemplate = new ColumnListItem({
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
		oBindConfig = jQuery.extend({
			path : "/teamMembers",
			template : oItemTemplate
		}, oBindConfig);
		oTable.setModel(oModel).bindItems(oBindConfig);

		return oTable;
	}

	QUnit.module("Display");

	QUnit.test("Merge Label and Icon", function(assert) {
			var sut = createSUT("MergeDuplicates");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oTable = sap.ui.getCore().byId("MergeDuplicates");
		$MergedLabel = oTable.getItems()[3].getCells()[2].$();
		$MergedIcon = oTable.getItems()[3].getCells()[0].$();

			assert.ok($MergedLabel.hasClass("sapMListTblCellDupCnt"), "duplicated label should be merged.");
			assert.strictEqual($MergedLabel.text(), "Male", "duplicated label is still available in the dom for screen readers.");

			assert.ok($MergedIcon.hasClass("sapMListTblCellDupCnt"), "duplicated icon should be merged.");

		//clean up
		sut.destroy();
	});

	QUnit.test("Merge in Growing Feature", function(assert) {
		var sut = createSUT("MergeDuplicates", true);
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oDeferred = jQuery.Deferred();
		oDeferred.promise(sut);
		sut.attachUpdateFinished(
			oDeferred.resolve()
		);

		sut._oGrowingDelegate.requestNewPage();
		sut.done(function() {
			var oTable = sap.ui.getCore().byId("MergeDuplicates");
			var $FirstLabelAfterGrowing = oTable.getItems()[5].getCells()[2].$();
			var $FirstIconAfterGrowing =  oTable.getItems()[5].getCells()[0].$();

			assert.ok($FirstLabelAfterGrowing.hasClass("sapMListTblCellDupCnt"), "label of the first item after growing should be merged.");
			assert.strictEqual($FirstLabelAfterGrowing.text(), "Male", "duplicated label is still available in the dom for screen readers.");

			assert.ok($FirstIconAfterGrowing.hasClass("sapMListTblCellDupCnt"), "icon of the first item after growing should be merged.");
		});

		//clean up
		sut.destroy();
	});

	QUnit.test("Merge when Group Header occures", function(assert) {
		var oLastNameSorter = new Sorter("lastName", false, true);

		var sut = createSUT("MergeDuplicates", false, {sorter: oLastNameSorter});
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oTable = sap.ui.getCore().byId("MergeDuplicates");
		var labelBeforeHeader = "before";
		var labelAfterHeader = "after";

		//get label text of the item before header
		labelBeforeHeader = oTable.getItems()[3].getCells()[2].$().text();

		//get label text of the item after header
		labelAfterHeader = oTable.getItems()[5].getCells()[2].$().text();

		assert.ok(labelBeforeHeader == labelAfterHeader, "label value after group header should not be merged.");

		//test for icon value
		var iconAfterHeader = "after";
		//get icon src of the item after header
		iconAfterHeader = oTable.getItems()[5].getCells()[0].getDomRef();

		assert.ok(iconAfterHeader, "icon src after group header should not be merged");

		//clean up
		sut.destroy();
	});

	QUnit.test("Merge when Table Rerendering", function(assert) {
		var sut = createSUT("MergeDuplicates");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var data = {
				teamMembers:[
					{lastName:"Doe" ,gender:"Male"}
				]};

		sut.setModel(new JSONModel(data));
		sap.ui.getCore().applyChanges();

		var oTable = sap.ui.getCore().byId("MergeDuplicates");

		//test for label value
		var labelLastValue = oTable.getColumns()[2].getLastValue();
		//test for icon value
		var iconLastValue = oTable.getColumns()[0].getLastValue();


		//rerender the table
		oTable.rerender();
		sap.ui.getCore().applyChanges();

		var labelAfterRender = oTable.getItems()[0].getCells()[2].$().text();
		var iconAfterRender = oTable.getItems()[0].getCells()[0].getSrc();

		assert.ok(labelLastValue == labelAfterRender, "last value of label should be cleared if there is only one row");
		assert.ok(iconLastValue == iconAfterRender, "last value of icon should be cleared if there is only one row");

		//clean up
		sut.destroy();
	});

	QUnit.test("Merge when Items Rerendering", function(assert) {
		var sut = createSUT("MergeDuplicates");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var data = {
				teamMembers:[
					{lastName:"Doe" ,gender:"Male"},
					{lastName:"Doe" ,gender:"Male"}
				]};

		sut.setModel(new JSONModel(data));
		sap.ui.getCore().applyChanges();

		var oTable = sap.ui.getCore().byId("MergeDuplicates"),
			oFirstItem = oTable.getItems()[0],
			oSecondItem = oTable.getItems()[1];

		var mBeforeRendering = {
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
		oFirstItem.rerender();
		oSecondItem.rerender();
		sap.ui.getCore().applyChanges();

		var mAfterRendering = {
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
		sut.destroy();
	});
});