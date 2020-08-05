/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TablePersoDialog",
	"sap/m/Table",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/Column",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/m/TablePersoController",
	"sap/m/Page",
	"sap/m/App",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	TablePersoDialog,
	Table,
	Toolbar,
	Label,
	ToolbarSpacer,
	Button,
	Column,
	JSONModel,
	ColumnListItem,
	TablePersoController,
	Page,
	App,
	jQuery
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");

	var iDialogDuration = sap.ui.getCore().getConfiguration().getAnimationMode() === "none" ? 15 : 500;

	/**
	* Set up a test data environment. Need a table for the perso dialog
	*/
	var oData = {
		items: [
			{ name: "Michelle", color: "orange", number: 3.14 },
			{ name: "Joseph", color: "blue", number: 1.618 },
			{ name: "David", color: "green", number: 0 }
		],
		cols: ["Name", "Color", "Number"]
	};

	var oData1 = {
			items: [
				{ name: "Michelle"},
				{ name: "Joseph"},
				{ name: "David"}
			],
			cols: ["Name"]
		};


	var oTable = new Table("idRandomDataTable", {
		headerToolbar: new Toolbar({
			content: [
				new Label({text: "Random Data"}),
				new ToolbarSpacer({}),
				new Button("idPersonalizationButton", {
					icon: "sap-icon://person-placeholder"
				})
			]
		}),
		columns: oData.cols.map(function (colname) {
			return new Column( "column" + colname, { header: new Label({ text: colname })});
		})
	});

	oTable.setModel(new JSONModel(oData));
	oTable.bindAggregation("items", "/items", new ColumnListItem({
		cells: oData.cols.map(function (colname) {
			return new Label({ text: "{" + colname.toLowerCase() + "}" });
		})
	}));

	var oTable1 = new Table("idRandomDataTable1", {
		headerToolbar: new Toolbar({
			content: [
				new Label({text: "Random Data"}),
				new ToolbarSpacer({}),
				new Button("idPersonalizationButton1", {
					icon: "sap-icon://person-placeholder"
				})
			]
		}),
		columns: oData1.cols.map(function (colname) {
			return new Column( "column1" + colname, { header: new Label({ text: colname })});
		})
	});

	oTable1.setModel(new JSONModel(oData1), "dataModel1");
	oTable1.bindAggregation("items", "dataModel1>/items", new ColumnListItem({
		cells: oData1.cols.map(function (colname) {
			return new Label({ text: "{" + colname.toLowerCase() + "}" });
		})
	}));


	var oPersoService = {

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		getCaption : function(oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if ( oColumn.getHeader().getText() == "Color") {
					return "Modified Color";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if ( oColumn.getHeader().getText() == "Color") {
					return "Primary Group";
				}
			}
			return "Secondary Group";
		}

	};

	var oPersoService1 = {
			getPersData : function () {
				var oDeferred = new jQuery.Deferred();
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData : function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			}
		};



	var oTPC;

	var page = new Page("myFirstPage", {
		title : "TablePersoDialog Test",
		content : [oTable, oTable1]
	});

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});

	app.addPage(page).placeAt("content");

	var oTablePersoDialog = null;

	var fnInit = function() {
		oTPC = new TablePersoController({
			table: oTable,
			persoService: oPersoService,
			hasGrouping: false
		}).activate();
		oTablePersoDialog = oTPC.getAggregation("_tablePersoDialog");
	};

	var fnExit = function() {
		oTPC.destroy();
		oTPC = undefined;
		oTablePersoDialog = null;
	};

	QUnit.module("Initial Check", {
		beforeEach: fnInit,
		afterEach: fnExit
	});


	QUnit.test("Initialization", function(assert) {
		oTablePersoDialog = oTPC.getAggregation("_tablePersoDialog");
		assert.ok(!jQuery.sap.domById(oTablePersoDialog.getId()), "TablePersoDialog is not rendered before it's ever opened.");
		assert.strictEqual(oTablePersoDialog.getPersoDialogFor(), "idRandomDataTable", "TablePersoDialog is linked to the correct table");
		var oPersData = oTablePersoDialog.retrievePersonalizations();
		assert.strictEqual(oPersData.aColumns, undefined, "No personalization data until dialog opened");
	});

	QUnit.test("Duplicate TablePersoDialog", function(assert) {

		var oTPD1 = new TablePersoDialog("TPD");
		var oTPD2;
		var oException;

		try {
			oTPD2 = new TablePersoDialog("TPD");
		} catch (oError) {
			oException = oError;
		}

		assert.ok(oException, "Exception fired");
		assert.equal(oException.message, "Error: adding TablePersoDialog with duplicate id 'TPD'");
		assert.notOk(oTPD2, "No duplicate created");

		oTPD1.destroy();

	});


	QUnit.module("Open, 'Reset All'-, 'Select All' Visibility", {
		beforeEach: fnInit,
		afterEach: fnExit
	});

	QUnit.test("Open Dialog", function(assert) {
		oTPC.setShowResetAll(false);
		oTPC.setShowSelectAll(false);
		//oTPC.setHasGrouping(true);
		oTPC.openDialog();
		assert.ok(sap.ui.getCore().byId(oTablePersoDialog.getId() + "-Dialog"), "Columns dialog exists after open() called");
		assert.ok(jQuery.sap.domById(oTablePersoDialog.getId() + "-Dialog-title"), "Columns dialog has a title rendered");
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var sTitle = sap.ui.getCore().byId(oTablePersoDialog.getId() + "-Dialog").getTitle();
		assert.strictEqual(sTitle, oRb.getText("PERSODIALOG_COLUMNS_TITLE"), "Columns dialog title is 'Columns'");
		//Check if Reset ALL Button is invisible
		assert.ok(jQuery('#' + oTPC.getAggregation("_tablePersoDialog")._oDialog.getId() + '-header-BarRight').children().length == 0, 'Reset All button should be hidden');
		//Check if Select All is invisible
		assert.ok(!jQuery('.sapMPersoDialogLIHeader').is(':visible'), 'Select All Header should be hidden');

		oTPC.setShowResetAll(true);
		oTPC.setShowSelectAll(true);
		sap.ui.getCore().applyChanges();
		//Check if Reset ALL Button is visible
		assert.ok(oTPC.getAggregation("_tablePersoDialog")._oDialog.getCustomHeader().getContentRight()[0].$().length  > 0, 'Reset All should be shown');
		//Check if Select All is visible
		assert.ok(oTPC.getAggregation("_tablePersoDialog")._oDialog.getContent()[0].getMode(), "MultiSelect", 'Select All Checkbox should be shown');
	});


	QUnit.module("Personalizations", {
		beforeEach: fnInit,
		afterEach: fnExit
	});

	QUnit.test("Initial Column Info", function(assert) {
		oTPC.openDialog();
		var oPersData = oTablePersoDialog.retrievePersonalizations();
		assert.ok(oPersData.aColumns, "Column personalization information available");
		assert.strictEqual(oPersData.aColumns.length, 3, "Column personalization information for 3 columns");
		assert.strictEqual(oPersData.aColumns[0].id, "empty_component-idRandomDataTable-columnName", "Column 0 ID is correct");
		assert.strictEqual(oPersData.aColumns[1].id, "empty_component-idRandomDataTable-columnColor", "Column 1 ID is correct");
		assert.strictEqual(oPersData.aColumns[2].id, "empty_component-idRandomDataTable-columnNumber", "Column 2 ID is correct");
		assert.strictEqual(oPersData.aColumns[0].order, 0, "Column 0 order is correct");
		assert.strictEqual(oPersData.aColumns[1].order, 1, "Column 1 order is correct");
		assert.strictEqual(oPersData.aColumns[2].order, 2, "Column 2 order is correct");
		assert.strictEqual(oPersData.aColumns[0].text, "Name", "Column 0 text is correct");
		assert.strictEqual(oPersData.aColumns[1].text, "Modified Color", "Column 1 text is correct");
		assert.strictEqual(oPersData.aColumns[2].text, "Number", "Column 2 text is correct");
		assert.strictEqual(oPersData.aColumns[0].visible, true, "column 0 visibility is correct");
		assert.strictEqual(oPersData.aColumns[1].visible, true, "Column 1 visibility is correct");
		assert.strictEqual(oPersData.aColumns[2].visible, true, "Column 2 visibility is correct");
	});

	QUnit.test("En/-disable Arrow Buttons", function(assert) {
		oTPC.setShowResetAll(false);
		oTPC.setShowSelectAll(false);
		oTPC.openDialog();
		var oDataList = oTablePersoDialog._oDialog.getContent()[0];
		var oButtonUp = sap.ui.getCore().byId(oTablePersoDialog.getId() + "-buttonUp");
		var oButtonDown = sap.ui.getCore().byId(oTablePersoDialog.getId() + "-buttonDown");
		var length = oDataList.getItems().length;

//			first item is selected => the Down button must be enabled
		assert.ok(!oButtonUp.getEnabled(), "first item is selected: Button Arrow Up is disabled => OK!");
		assert.ok(!oButtonDown.getEnabled(), "first item is selected: Button Arrow Down is enabled => OK!");

		if (length > 0) {
			oTablePersoDialog._oSelectedItem = oDataList.getItems()[0];
			oTablePersoDialog._fnUpdateArrowButtons.call(oTablePersoDialog);
			sap.ui.getCore().applyChanges();
			assert.ok(oButtonUp.$().hasClass('sapMBtnDisabled'), "More than one item in List, first item is selected: Button Arrow Up is disabled => OK!");
			assert.ok(!oButtonDown.$().hasClass('sapMBtnDisabled'), "More than one item in List, first item is selected: Button Arrow Down is enabled => OK!");

			oTablePersoDialog._oSelectedItem = oDataList.getItems()[length - 1];
			oTablePersoDialog._fnUpdateArrowButtons();
			sap.ui.getCore().applyChanges();
			assert.ok(oButtonDown.$().hasClass('sapMBtnDisabled'), "More than one item in List, last item is selected: Button Arrow Down is disabled => OK!");
			assert.ok(!oButtonUp.$().hasClass('sapMBtnDisabled'), "More than one item in List, last item is selected: Button Arrow Up is enabled => OK!");
		}

		var oTPC1 = new TablePersoController({
			table: oTable1,
			persoService: oPersoService1,
			hasGrouping: false
		}).activate();

		var oTablePersoDialog1 = oTPC1.getTablePersoDialog();
		oTPC1.openDialog();

		var oDataList1 = oTablePersoDialog1._oDialog.getContent()[0];
		var oButtonUp1 = sap.ui.getCore().byId(oTablePersoDialog1.getId() + "-buttonUp");
		var oButtonDown1 = sap.ui.getCore().byId(oTablePersoDialog1.getId() + "-buttonDown");
//			only one item in list is available(selected) => both buttons have to be disabled!
		if (oDataList1.getItems().length == 1) {
			oDataList1.setSelectedItem(oDataList1.getItems()[0], true, true);
			sap.ui.getCore().applyChanges();
			assert.ok(oButtonUp1.$().hasClass('sapMBtnDisabled'), "One item available(selected): Button Arrow Up is disabled => OK!");
			assert.ok(oButtonDown1.$().hasClass('sapMBtnDisabled'), "One item available(selected): Button Arrow Down is disabled => OK!");
		}

			oTPC1.destroy();
	});



	QUnit.test("After Personalization but OK pressed", function(assert) {
		// Re open dialog
		oTPC.openDialog();

		// Set the 1st column to invisible and switch the last two around
		var oButtonDown = sap.ui.getCore().byId("idRandomDataTable-PersoDialog-buttonDown");
		var oButtonOk = sap.ui.getCore().byId("idRandomDataTable-PersoDialog-buttonOk");

		// 1st column invisible
		sap.ui.getCore().byId("idRandomDataTable-PersoDialog-cli-idRandomDataTable-PersoDialog-colTable-0").setSelected(false);

		// Switch last two around
		sap.ui.getCore().byId("idRandomDataTable-PersoDialog-cli-idRandomDataTable-PersoDialog-colTable-1").setSelected(true);
		oTablePersoDialog._oSelectedItem = sap.ui.getCore().byId("idRandomDataTable-PersoDialog-cli-idRandomDataTable-PersoDialog-colTable-1");
		oButtonDown.firePress();
		sap.ui.getCore().applyChanges();

		// Press OK
		oButtonOk.firePress();
		var fnDone = assert.async();
		setTimeout(function () {
			sap.ui.getCore().applyChanges();

			var oPersData = oTablePersoDialog.retrievePersonalizations();

			assert.strictEqual(oPersData.aColumns[0].visible, false, "column 0 visibility is now false");
			assert.strictEqual(oPersData.aColumns[1].text, "Number", "Column 1 (Color) order is now 2");
			assert.strictEqual(oPersData.aColumns[2].text, "Modified Color", "Column 2 (Number) is now 1");
			fnDone();
		}, 500);
	});

	QUnit.module("Many columns", {
		beforeEach: fnInit,
		afterEach: fnExit
	});

	QUnit.test("Table has more than 100 columns", function(assert){
		//Arrange
		var oData2 = {
			cols: (function(){
				var cols = [];
				for ( var i = 0; i < 110; i++) {
					cols.push("Cols" + i);
				}
				return cols;
			}())
		};
		var oTable2 = new Table("idRandomDataTable2", {
			headerToolbar: new Toolbar({
				content: [
					new Label({text: "Random Data"}),
					new ToolbarSpacer({}),
					new Button("idPersonalizationButton2", {
						icon: "sap-icon://person-placeholder"
					})
				]
			}),
			columns: oData2.cols.map(function (colname) {
				return new Column( "column1" + colname, { header: new Label({ text: colname })});
			})
		});

		oTable2.setModel(new JSONModel(oData2), "dataModel2");

		var oTPC2 = new TablePersoController({
			table: oTable2,
			persoService: oPersoService,
			hasGrouping: false
		}).activate();

		//Act
		page.addContent(oTable2);
		sap.ui.getCore().applyChanges();
		oTPC2.openDialog();
		sap.ui.getCore().applyChanges();

		//Assert
		var oTablePersoDialog2 = oTPC2.getTablePersoDialog();
		assert.strictEqual(oTablePersoDialog2._oInnerTable.getItems().length == 110, true, "TablePersoDialog displays 110 rows");

		//Clean up
		oTPC2.destroy();
		oTable2.destroy();
	});

	QUnit.test("Arrow buttons and scrolling", function(assert){
		//Arrange
		var oData3 = {
				cols: (function(){
					var cols = [];
					for ( var i = 0; i < 20; i++) {
						cols.push("Cols" + i);
					}
					return cols;
				}())
			},
			oTable3 = new Table("idRandomDataTable3", {
				headerToolbar: new Toolbar({
					content: [
						new Label({text: "Random Data"}),
						new ToolbarSpacer({}),
						new Button("idPersonalizationButton3", {
							icon: "sap-icon://person-placeholder"
						})
					]
				}),
				columns: oData3.cols.map(function (colname) {
					return new Column( "column3" + colname, { header: new Label({ text: colname })});
				})
			}).setModel(new JSONModel(oData3), "dataModel3"),
			oTPC3 = new TablePersoController({
				table: oTable3,
				persoService: oPersoService,
				hasGrouping: false
			}).activate();


		page.addContent(oTable3);
		sap.ui.getCore().applyChanges();
		oTPC3.openDialog();
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		setTimeout( function(){

			var oTablePersoDialog3 = oTPC3.getTablePersoDialog(),
			oButtonUp = oTablePersoDialog3._oButtonUp,
			oButtonDown = oTablePersoDialog3._oButtonDown;

			//Act
			//Select first item
			oTablePersoDialog3._oInnerTable.setSelectedItem(oTablePersoDialog3._oInnerTable.getItems()[0]);
			sap.ui.getCore().applyChanges();

			var spyScrollTo = sinon.spy(oTablePersoDialog3._oInnerTable, "scrollToIndex");
			//press 'Down button 8 times to trigger scroll down --> the item will be at the top
			for (var i = 0; i < 9; i++) {
				oButtonDown.firePress();
				sap.ui.getCore().applyChanges();
			}
			assert.equal(spyScrollTo.callCount, 2, "scrollToIndex should be called once when moving down");
			//Now press up to check if the scrolls up as the item is at the top
			for (var i = 0; i < 1; i++) {
				oButtonUp.firePress();
				sap.ui.getCore().applyChanges();
			}
			assert.equal(spyScrollTo.callCount, 3, "scrollToIndex should be called once when moving up");
			oTPC3.destroy();
			oTable3.destroy();
			fnDone();
		}, iDialogDuration); // to wait until dialog is open
	});

	QUnit.module("Reset All", {
		beforeEach: fnInit,
		afterEach: fnExit
	});

	QUnit.test("Check column captions after Reset All", function(assert){
		//Arrange
		var oData4 = {
				cols: (function(){
					var cols = [];
					for ( var i = 0; i < 4; i++) {
						cols.push("Cols" + i);
					}
					return cols;
				}())
			},
			oTable4 = new Table("idRandomDataTable4", {
				headerToolbar: new Toolbar({
					content: [
						new Label({text: "Random Data"}),
						new ToolbarSpacer({}),
						new Button("idPersonalizationButton4", {
							icon: "sap-icon://person-placeholder"
						})
					]
				}),
				columns: oData4.cols.map(function (colname) {
					return new Column( "column4" + colname, { header: new Label({ text: colname })});
				})
			}).setModel(new JSONModel(oData4), "dataModel4"),
			oTPC4 = new TablePersoController({
				table: oTable4,
				persoService: oPersoService,
				hasGrouping: false
			}).activate();


		page.addContent(oTable4);
		sap.ui.getCore().applyChanges();

		//Change title of first table column
		oTable4.getColumns()[0].getHeader().setText('Bingo!');
		sap.ui.getCore().applyChanges();

		oTPC4.openDialog();
		sap.ui.getCore().applyChanges();
		var oTablePersoDialog4 = oTPC4.getTablePersoDialog(),
			oResetButton = oTablePersoDialog4._oDialog.getCustomHeader().getContentRight()[0],
			oButtonDown = oTablePersoDialog4._oButtonDown,
			oList = oTablePersoDialog4._oInnerTable;

		//Act
		//Press 'Reset All'
		oResetButton.firePress();
		sap.ui.getCore().applyChanges();
		assert.equal(oList.getItems()[0].getCells()[0].getText(), 'Bingo!', 'Even after reset, label should be the last rendered column name');
		oList.setSelectedItem(oList.getItems()[0]);
		oButtonDown.firePress();
		sap.ui.getCore().applyChanges();
		oResetButton.firePress();
		sap.ui.getCore().applyChanges();
		var fnDone = assert.async();
		setTimeout(function () {
			assert.equal(oList.getSelectedItem(), oList.getItems()[0], 'After repositioning and after reset, the last selected item is still selected');

			oTPC4.destroy();
			oTable4.destroy();
			fnDone();
		}, 1);
	});



	QUnit.module("Close", {
		beforeEach: fnInit,
		afterEach: fnExit
	});

	QUnit.test("Destroy TablePersoDialog", function(assert){
		var oTablePersoDialog = new TablePersoDialog({
			persoDialogFor: oTable
		});
		oTablePersoDialog.destroy();
		assert.strictEqual(oTablePersoDialog._oColumnItemTemplate, null, "ListItem template is destroyed");
		assert.strictEqual(oTablePersoDialog._oDialog, null, "Dialog is destroyed");
		assert.strictEqual(oTablePersoDialog._oRb, null, "Resource bundle is nulled");
		assert.strictEqual(oTablePersoDialog._oP13nModel, null, "Model bundle is nulled");
	});

	QUnit.module("Keyboard handling");

	QUnit.test("Test Initial focus", function (assert) {
		// arrange
		var oTable1 = new Table("testInitialFocusTable", {
			columns: [
				new Column("col0", {
					header : new Label({text : "Column 0"}),
					visible : true
				}),
				new Column("col1", {
					header: new Label({text: "Column 1"}),
					visible : true
				}),
				new Column("col2", {
					header: new Label({text: "Column 2"}),
					visible : true
				})]
		});

		var oPersoService = {
			oPersoData : {
				_persoSchemaVersion: "1.0",
				aColumns : []
			},
			getPersData : function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oPersoData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},
			setPersData : function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			}
		};

		var oTPC1 = new TablePersoController({
			table: oTable1,
			persoService: oPersoService
		}).activate();

		oTable1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oTPC1.openDialog();
		sap.ui.getCore().applyChanges();
		var fnDone = assert.async();
		setTimeout(function () {
			// assert
			var actual = oTPC1.getTablePersoDialog()._oInnerTable.getSelectedItem().getId();
			var expected = oTPC1.getTablePersoDialog()._oInnerTable.getItems()[0].getId();
			assert.strictEqual(actual, expected, 'The focus should be on the first list item.');
			oTPC1.destroy();
			oTable1.destroy();
			fnDone();
		}, 1);

	});

	QUnit.test("Test Initial focus with grouping", function (assert) {
		// arrange
		var oTable1 = new Table("testInitialFocusTable", {
			columns: [
				new Column("col0", {
					header : new Label({text : "Column 0"}),
					visible : true
				}),
				new Column("col1", {
					header: new Label({text: "Column 1"}),
					visible : true
				}),
				new Column("col2", {
					header: new Label({text: "Column 2"}),
					visible : true
				})]
		});

		var oPersoService = {
			oPersoData : {
				_persoSchemaVersion: "1.0",
				aColumns : []
			},
			getPersData : function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oPersoData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},
			setPersData : function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			getGroup : function(oColumn) {
				if (oColumn.getHeader() && oColumn.getHeader().getText) {
					if ( oColumn.getHeader().getText() == "Column 0") {
						return "Primary Group";
					}
				}
				return "Secondary Group";
			}
		};

		var oTPC1 = new TablePersoController({
			table: oTable1,
			persoService: oPersoService,
			hasGrouping: true
		}).activate();

		oTable1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oTPC1.openDialog();
		sap.ui.getCore().applyChanges();
		var fnDone = assert.async();
		setTimeout(function () {
			// assert
			var actual = oTPC1.getTablePersoDialog()._oInnerTable.getSelectedItem().getId();
			var expected = oTPC1.getTablePersoDialog()._oInnerTable.getItems()[1].getId();
			assert.strictEqual(actual, expected, 'The focus should be on the first list item.');
			oTPC1.destroy();
			oTable1.destroy();
			fnDone();
		}, 1);
	});
});