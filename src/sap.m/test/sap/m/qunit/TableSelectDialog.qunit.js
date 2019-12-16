/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/TableSelectDialog",
	"sap/m/Column",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/App",
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(
	qutils,
	createAndAppendDiv,
	Filter,
	FilterOperator,
	JSONModel,
	ColumnListItem,
	Label,
	TableSelectDialog,
	Column,
	Input,
	Button,
	Page,
	App,
	jQuery,
	Device,
	waitForThemeApplied
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");



	var aSearchEvents = [];
	var aLiveChangeEvents = [];

	/* dialog data */
	var dialogData = {
		title: "Choose your tech..",
		noDataMessage: "We do not have any tech to show here and we are very sorry for that!"
	};

	var doSearch = function(oEvent){
		// create an array to hold the filters we create
		var filter = [];
		//Get the value that been entered in the Dialog Search
		var sVal = oEvent.getParameter("value");

		//Get the binded items
		var itemsBinding = oEvent.getParameter("itemsBinding");

		aSearchEvents = [];
		aSearchEvents.push(itemsBinding.iLength);

		if (sVal !== undefined) {
			// create the local filter to apply
			var  selectFilter = new Filter("name", FilterOperator.Contains , sVal);
			filter.push(selectFilter);

			// and apply the filter to the bound items, and the Table Select Dialog will update
			itemsBinding.filter(filter);

			aSearchEvents.push(itemsBinding.iLength);
		}
	};

	var doLiveChange = function(oEvent){
		// create an array to hold the filters we create
		var filter = [];
		//Get the value that been entered in the Dialog Search
		var sVal = oEvent.getParameter("value");

		//Get the binded items
		var itemsBinding = oEvent.getParameter("itemsBinding");

		aLiveChangeEvents = [];
		aLiveChangeEvents.push(itemsBinding.iLength);

		if (sVal !== undefined) {
			// create the local filter to apply
			var  selectFilter = new Filter("name", FilterOperator.Contains , sVal);
			filter.push(selectFilter);

			// and apply the filter to the bound items, and the Table Select Dialog will update
			itemsBinding.filter(filter);

			aLiveChangeEvents.push(itemsBinding.iLength);
		}
	};

	var oModelDialog = new JSONModel();
	oModelDialog.setData(dialogData);

	// create the data to be shown in the table
	var data = {
	navigation : [{
			name : "Headphone",
			qty : "10 EA",
			limit : "15.00 Eur",
			price : "12.00 EUR"
		}, {
			name : "Mouse Pad",
			qty : "1 EA",
			limit : "5.00 Eur",
			price : "3.00 EUR"
		}, {
			name : "Monitor",
			qty : "8 EA",
			limit : "60.00 Eur",
			price : "45.00 EUR"
		}, {
			name : "Optic Mouse",
			qty : "2 EA",
			limit : "40.00 Eur",
			price : "15.00 EUR"
		}, {
			name : "Dock Station",
			qty : "1 EA",
			limit : "90.00 Eur",
			price : "55.00 EUR"
		}]
	};

	// create the model to hold the data
	var oModel = new JSONModel();
	oModel.setData(data);

	// create the template for the items binding
	var template = new ColumnListItem({
		type : "Navigation",
		unread : false,
		cells : [
			new Label({
				text : "{name}"
			}),
			new Label({
				text: "{qty}"
			}), new Label({
				text: "{limit}"
			}), new Label({
				text : "{price}"
			})
		]
	});

	var oTableSelectDialog = new TableSelectDialog("oTableSelectDialog", {
		title: "{dialog>/title}",
		noDataText: "{dialog>/noDataMessage}",
		growingThreshold: 50,
		columns : [
			new Column({
				styleClass : "name",
				hAlign : "Left",
				header : new Label({
					text : "Name"
				})
			}),
			new Column({
				hAlign : "Center",
				styleClass : "qty",
				popinDisplay : "Inline",
				header : new Label({
					text : "Qty"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Right",
				styleClass : "limit",
				width : "30%",
				header : new Label({
					text : "Value"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Right",
				styleClass : "price",
				width : "30%",
				popinDisplay : "Inline",
				header : new Label({
					text : "Price"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			})
		]
	});

	// then set model & bind Aggregation
	oTableSelectDialog.setModel(oModel);
	oTableSelectDialog.bindAggregation("items", "/navigation", template);
	oTableSelectDialog.setModel(oModelDialog,"dialog");

	var oTableSelectDialog1 = new TableSelectDialog("oTableSelectDialog1", {
		title: "Title",
		noDataText: "No Data",
		search : doSearch,
		liveChange : doLiveChange,
		columns : [
			new Column({
				styleClass : "name",
				hAlign : "Left",
				header : new Label({
					text : "Name"
				})
			}),
			new Column({
				hAlign : "Center",
				styleClass : "qty",
				popinDisplay : "Inline",
				header : new Label({
					text : "Qty"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Right",
				styleClass : "limit",
				width : "30%",
				header : new Label({
					text : "Value"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Right",
				styleClass : "price",
				width : "30%",
				popinDisplay : "Inline",
				header : new Label({
					text : "Price"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			})
		]
	});

	// then set model & bind Aggregation
	oTableSelectDialog1.setModel(oModel);
	oTableSelectDialog1.bindAggregation("items", "/navigation", template);

	// attach confirm listener
	oTableSelectDialog1.attachConfirm(function(evt) {
		if (oTableSelectDialog1.getMultiSelect()) {
			var selectedItems = evt.getParameter("selectedItems");
			if (selectedItems) {
				var sel = "";
				//Loop through all selected items
				for (var i = 0; i < selectedItems.length; i++) {
					//Get all the cells and pull back the first one which will be the name content
					var oCells = selectedItems[i].getCells();
					var oCell = oCells[0];
					//Update the text
					sel += oCell.getText();
					if (i < selectedItems.length - 1) {sel += ', ';}
				}
				oInput1.setValue("You selected: " + sel);
			}
		} else {
			var selectedItem = evt.getParameter("selectedItem");
			if (selectedItem) {
				//Get all the cells and pull back the first one which will be the name content
				var oCells = selectedItem.getCells();
				var oCell = oCells[0];
				//Now update the input with the value
				oInput1.setValue("Item selected is : " + oCell.getText());
			}
		}
	});

	// attach Cancel listener
	oTableSelectDialog1.attachCancel(function(evt) {
		oInput1.setValue("Cancel selected");
	});

	var oInput1 = new Input("oInput1" , {
		type: "Text",
		placeholder: "TableSelectDialog1 Selected Item"
	});

	var oButton = new Button({
		text : "Open TableSelectDialog",
		press : function() {
			QUnit.config.current.assert.strictEqual(oTableSelectDialog.open() , oTableSelectDialog , "TableSelectDialog should be chaninable");
		}
	});

	var oButton1 = new Button({
		text : "Open TableSelectDialog1",
		press : function() {
			QUnit.config.current.assert.strictEqual(oTableSelectDialog1.open() , oTableSelectDialog1 , "TableSelectDialog1 should be chaninable");
		}
	});

	var page = new Page("myFirstPage", {
		title : "TableSelectDialog Test",
		content: [oButton, oButton1, oInput1]
	});

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});

	app.addPage(page).placeAt("content");

	QUnit.module("Initial Check", {
		beforeEach : function () {
			sinon.config.useFakeTimers = true;
		},
		afterEach : function () {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Initialization", function(assert) {
		assert.ok(!jQuery.sap.domById("oTableSelectDialog"), "TableSelectDialog is not rendered before it's ever opened.");
		assert.strictEqual(oTableSelectDialog.getTitle(), "Choose your tech..", 'The title should be "Choose your tech.."');
		assert.strictEqual(oTableSelectDialog.getNoDataText(), "We do not have any tech to show here and we are very sorry for that!", '"We do not have any tech to show here and we are very sorry for that!" should be displayed when no data is there');
		assert.strictEqual(oTableSelectDialog.getMultiSelect(), false, 'Multi Select should by default be set to "false"');
		assert.strictEqual(oTableSelectDialog.getGrowingThreshold(), 50, 'The growing threshold should be "50"');
		assert.ok(!jQuery.sap.domById("oTableSelectDialog1"), "TableSelectDialog is not rendered before it's ever opened.");
		assert.strictEqual(oTableSelectDialog1.getTitle(), "Title", 'The title should be "Title"');
		assert.strictEqual(oTableSelectDialog1.getNoDataText(), "No Data", '"No Data" should be displayed when no data is there');
		assert.strictEqual(oTableSelectDialog1.getMultiSelect(), false, 'Multi Select should by default be set to "false"');
		assert.strictEqual(oTableSelectDialog1.getShowClearButton(), false, 'ShowClearButton should by default be set to "false"');
		oTableSelectDialog1.setMultiSelect(true);
		oTableSelectDialog1.setShowClearButton(true);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTableSelectDialog1.getMultiSelect(), true, 'Multi Select should now be updated to  "true"');
		assert.strictEqual(oTableSelectDialog1.getShowClearButton(), true, 'ShowClearButton should now be updated to  "true"');

	});

	QUnit.test("busyIndicatorDelay propagation test", function(assert) {
		var iDelay = 50;
		oTableSelectDialog.setBusyIndicatorDelay(iDelay);

		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTableSelectDialog._oTable.getBusyIndicatorDelay(), iDelay, 'The delay value should be ' + iDelay);
		assert.strictEqual(oTableSelectDialog._oDialog.getBusyIndicatorDelay(), iDelay, 'The delay value of dialog should be ' + iDelay);
		assert.strictEqual(oTableSelectDialog.getBusyIndicatorDelay(), iDelay, 'The delay value should be ' + iDelay);
	});

	QUnit.test("setBusy propagation test", function(assert) {
		var iDelay = 10;
		oTableSelectDialog.setBusyIndicatorDelay(iDelay);
		oTableSelectDialog.open();
		oTableSelectDialog.setBusy(true);

		this.clock.tick(50);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTableSelectDialog.getBusy(), true, 'The Dialog should be in busy state');

		this.clock.tick(1000);
		oTableSelectDialog.setBusy(false);
		assert.strictEqual(oTableSelectDialog.getBusy(), false, 'The Dialog should not be in busy state');
	});

	QUnit.test("setBusy should disable the SearchField", function(assert) {
		oTableSelectDialog.open();
		oTableSelectDialog.setBusy(true);
		sap.ui.getCore().applyChanges();

		var searchFieldEnabled = oTableSelectDialog._oSearchField.getEnabled();
		assert.strictEqual(searchFieldEnabled, false, 'The SearchField should be disabled');

		oTableSelectDialog.setBusy(false);
		searchFieldEnabled = oTableSelectDialog._oSearchField.getEnabled();
		assert.strictEqual(searchFieldEnabled, true, 'The SearchField should be enabled');
	});

	QUnit.test("draggable: true on desktop", function (assert) {
		// Arrange
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};
		this.stub(Device, "system", oSystem);

		// Act
		oTableSelectDialog.setDraggable(true);

		// Assert
		assert.strictEqual(oTableSelectDialog.getDraggable(), true, "draggable is set correctly in the TableSelectDialog");
		assert.strictEqual(oTableSelectDialog._oDialog.getDraggable(), true, "draggable is set correctly in the Dialog");
	});

	QUnit.test("draggable: true on mobile device", function (assert) {
		// Arrange
		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};
		this.stub(Device, "system", oSystem);

		// Act
		oTableSelectDialog1.setDraggable(true);

		// Assert
		assert.strictEqual(oTableSelectDialog1.getDraggable(), true, "draggable is set correctly in the TableSelectDialog");
		assert.strictEqual(oTableSelectDialog1._oDialog.getDraggable(), false, "draggable is set correctly in the Dialog");
	});

	QUnit.test("resizable: true on desktop device", function (assert) {
		// Arrange
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};
		this.stub(Device, "system", oSystem);

		// Act
		oTableSelectDialog.setResizable(true);

		// Assert
		assert.strictEqual(oTableSelectDialog.getResizable(), true, "resizable is set correctly in the TableSelectDialog");
		assert.strictEqual(oTableSelectDialog._oDialog.getResizable(), true, "resizable is set correctly in the Dialog");
	});

	QUnit.test("resizable: true on mobile device", function (assert) {
		// Arrange
		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};
		this.stub(Device, "system", oSystem);

		// Act
		oTableSelectDialog1.setResizable(true);

		// Assert
		assert.strictEqual(oTableSelectDialog1.getResizable(), true, "resizable is set correctly in the TableSelectDialog");
		assert.strictEqual(oTableSelectDialog1._oDialog.getResizable(), false, "resizable is set correctly in the Dialog");
	});



	QUnit.test("confirmButtonText", function(assert) {
		// assert
		assert.equal(oTableSelectDialog._getOkButton().getText(),
			sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SELECT_CONFIRM_BUTTON"),
			'The default confirmation text is set.');

		// act
		oTableSelectDialog.setConfirmButtonText("Save");
		// assert
		assert.equal(oTableSelectDialog._oOkButton.getText(), "Save", 'The confirm button text is changed.');
	});

	QUnit.test("initially set confirmButtonText", function(assert) {
		// setup
		var oTableSelectDialog = new TableSelectDialog({
			confirmButtonText: "Custom Text",
			multiSelect: true
		});

		oTableSelectDialog.open();
		this.clock.tick(500);

		// assert
		assert.equal(oTableSelectDialog._oOkButton.getText(), "Custom Text", 'The confirm button text is set.');

		// clean up
		oTableSelectDialog.destroy();
	});

	QUnit.module("Bindings Check");

	QUnit.test("Bindings", function(assert) {
		assert.strictEqual(oTableSelectDialog.getBinding("items").iLength, 5 , 'TableSelectDialog should have 5 items bound');
		assert.strictEqual(oTableSelectDialog1.getBinding("items").iLength, 5 , 'TableSelectDialog1 should have 5 items bound');
	});

	QUnit.test("setBindingContext - update the internal table", function(assert) {
		// arrange
		var oTableSelectDialog = new TableSelectDialog(),
			oSetBindingContextSpy = sinon.spy(oTableSelectDialog._oTable, "setBindingContext");

		// act
		oTableSelectDialog.setBindingContext({});

		// assert
		assert.ok(oSetBindingContextSpy.calledOnce, "Changing binding context of TableSelectDialog should be reflected on the internal table");

		// clean up
		oSetBindingContextSpy.restore();
		oTableSelectDialog.destroy();
	});

	QUnit.module("Growing property check");

	QUnit.test("true (default)", function(assert) {
		// arrange
		var aData = [];
		for (var i = 0; i < 50; i++) {
			aData.push({text : "Item" + i});
		}

		var oTableSelectDialog23 = new TableSelectDialog({
			columns : [
				new Column({
					header : new Label({text : "Item"})
				})
			],
			growingThreshold: 20
		});

		oTableSelectDialog23.setModel(new JSONModel(aData));
		oTableSelectDialog23.bindItems("/", new ColumnListItem({
			cells : [
				new Label({text : "{text}"})
			]
		}));

		// act
		oTableSelectDialog23.open();

		// assert
		assert.strictEqual(oTableSelectDialog23.getItems().length, 20 , 'There should be only 20 items loaded (out of 50).');
		oTableSelectDialog23._onCancel();

		// cleanup
		oTableSelectDialog23.destroy();
	});

	QUnit.test("false", function(assert) {
		// arrange
		var aData = [];
		for (var i = 0; i < 50; i++) {
			aData.push({text : "Item" + i});
		}

		var oTableSelectDialog24 = new TableSelectDialog({
			columns : [
				new Column({
					header : new Label({text : "Item"})
				})
			],
			growing: false
		});

		oTableSelectDialog24.setModel(new JSONModel(aData));
		oTableSelectDialog24.bindItems("/", new ColumnListItem({
			cells : [
				new Label({text : "{text}"})
			]
		}));

		// act
		oTableSelectDialog24.open();

		// assert
		assert.strictEqual(oTableSelectDialog24.getItems().length, 50 , 'There should be loaded all 50 items.');
		oTableSelectDialog24._onCancel();

		// cleanup
		oTableSelectDialog24.destroy();
	});

	QUnit.module("MultiSelect proper selection reset", {
		beforeEach : function () {
			sinon.config.useFakeTimers = true;
		},
		afterEach : function () {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("TableSelectDialog1 proper selection reset after canceling filtered table with selected items", function(assert) {

		oTableSelectDialog1.setMultiSelect(true);

		oTableSelectDialog1.open();

		var oTable = sap.ui.getCore().byId("oTableSelectDialog1-table");
		var aItems = oTable.getItems();

		aItems[0].setSelected(true);
		aItems[2].setSelected(true);

		assert.equal(oTable.getSelectedItems().length, 2, "Two items selected before cancelling");

		// Executing search that trigger change in the binding model
		// of the table causing a filter to be applied to the model
		oTableSelectDialog1._executeSearch("tt", "search");
		this.clock.tick(500);

		oTableSelectDialog1._onCancel();
		this.clock.tick(500);

		oTableSelectDialog1.open();
		this.clock.tick(500);

		assert.equal(oTable.getItems().length, 5, "Selection after search should be reset nevertheless");
		assert.equal(oTable.getSelectedItems().length, 0, "The selected items array should be empty after canceling ");
		assert.equal(oTable.getBinding("items").aFilters.length, 0, "No filter should be applied to the bindings model of the table");

		oTableSelectDialog1._onCancel();
		this.clock.tick(500);

	});

	QUnit.module("Open and Close");

	QUnit.test("Open TableSelectDialog", function(assert) {
		oButton.firePress();
		assert.ok(jQuery.sap.domById("oTableSelectDialog-dialog"), "TableSelectDialog is opened");
		assert.ok(jQuery.sap.domById("oTableSelectDialog-dialog-title"), "TableSelectDialog title should be rendered");
		assert.ok(jQuery.sap.domById("oTableSelectDialog-searchField"), "TableSelectDialog should have a searchfield");
		assert.ok(jQuery.sap.domById("oTableSelectDialog-cancel"), "TableSelectDialog should have a cancel button");
		assert.ok(!jQuery.sap.domById("oTableSelectDialog-ok"), "TableSelectDialog should not have an ok button");
	});

	QUnit.test("Destroy TableSelectDialog", function(assert){
		var done = assert.async();
		assert.expect(1);
		// simulate close
		oTableSelectDialog._dialog.attachAfterClose(function() {
			oTableSelectDialog.destroy();
			assert.strictEqual(oTableSelectDialog.$().length, 0, "TableSelectDialog is destroyed");
			done();
		});
		oTableSelectDialog._dialog.close();
	});

	QUnit.test("Open TableSelectDialog1", function(assert){
		var done = assert.async();
		//Expect 6 as one comes from the button press for chainabe test
		assert.expect(6);
		setTimeout(function() {
			oButton1.firePress();
			assert.ok(jQuery.sap.domById("oTableSelectDialog1-dialog"), "TableSelectDialog1 is opened");
			assert.ok(jQuery.sap.domById("oTableSelectDialog1-dialog-title"), "TableSelectDialog1 title should be rendered");
			assert.ok(jQuery.sap.domById("oTableSelectDialog1-searchField"), "TableSelectDialog1 should have a searchfield");
			assert.ok(jQuery.sap.domById("oTableSelectDialog1-cancel"), "TableSelectDialog1 should have a cancel button");
			assert.ok(jQuery.sap.domById("oTableSelectDialog1-ok"), "TableSelectDialog1 should have an ok button");
		done();
		}, 10);
	});

	QUnit.test("Destroy beginButton on selection mode change", function (assert) {
		// Arrange
		this.oTableSelectDialog = new TableSelectDialog('selectDialog', {
			title: "my SelectDialog"
		});
		var oDialogDestroyBeginButtonSpy = this.spy(this.oTableSelectDialog._oDialog, "destroyBeginButton");
		this.oTableSelectDialog.setMultiSelect(true);

		// Assert
		assert.ok(this.oTableSelectDialog._oOkButton, "internal property _oOkButton should exist before deletion.");

		//Arrange
		this.oTableSelectDialog.setMultiSelect(false);

		// Assert
		assert.strictEqual(this.oTableSelectDialog._oOkButton, undefined, "internal property _oOkButton is undefined");
		assert.strictEqual(oDialogDestroyBeginButtonSpy.callCount, 1, "DestroyBeginButton method was called.");

		// Cleanup
		oDialogDestroyBeginButtonSpy.restore();
		this.oTableSelectDialog.destroy();
	});

	QUnit.module("Test Dialog Search");

	QUnit.test("TableSelectDialog1 SearchField Set Value 'Mo'", function(assert){
		var done = assert.async();
		assert.expect(0);
		sap.ui.getCore().applyChanges();
		var searchField = sap.ui.getCore().byId("oTableSelectDialog1-searchField");
		searchField.setValue("Mo");
		done();
	});

	QUnit.test("TableSelectDialog1 SearchField Equals 'Mo'", function(assert){
		var done = assert.async();
		assert.expect(1);
		assert.strictEqual(jQuery.sap.domById("oTableSelectDialog1-searchField-I").value, "Mo", "Search Field should Contain 'Mo'");
		done();
	});

	QUnit.test("TableSelectDialog1 SearchField Fire Search Event", function(assert){
		var done = assert.async();
		assert.expect(0);
		var searchField = sap.ui.getCore().byId("oTableSelectDialog1-searchField");
		searchField.fireSearch({query: "Mo"});
		done();
	});

	QUnit.test("TableSelectDialog1 SearchField Fire Search Results", function(assert){
		var done = assert.async();
		assert.expect(3);
		setTimeout(function() {
			assert.equal(aSearchEvents.length, 2, "there should be 2 events in the serach events log");
			assert.equal(aSearchEvents[0], 5, "The first event should equal 5 before the filter applied");
			assert.equal(aSearchEvents[1], 3, "The second event should equal 3 after the filter applied");
		done();
		}, 10);
	});

	QUnit.test("TableSelectDialog1 SearchField Fire Search Event Again with same data", function(assert){
		var done = assert.async();
		assert.expect(0);
		var searchField = sap.ui.getCore().byId("oTableSelectDialog1-searchField");
		searchField.fireSearch({query: "Mo"});
		done();
	});

	QUnit.test("TableSelectDialog1 SearchField Fire Search Results", function(assert){
		var done = assert.async();
		assert.expect(3);
		setTimeout(function() {
			assert.equal(aSearchEvents.length, 2, "there should be 2 events in the serach events log");
			assert.equal(aSearchEvents[0], 3, "The first event should equal 3 before the filter applied");
			assert.equal(aSearchEvents[1], 3, "The second event should equal 3 after the filter applied");
		done();
		}, 10);
	});

	QUnit.test("Search event 'cancelButtonPressed' parameter", function (assert) {
		var done = assert.async(),
			bClearButtonPressed = true,
			oTableSelectDialog = new TableSelectDialog({
				search: function (oEvent) {

					// assert
					assert.strictEqual(bClearButtonPressed, oEvent.getParameter("clearButtonPressed"),
										"clearButtonPressed parameter has the value from the SearchField event.");

					// clean up
					oTableSelectDialog.destroy();
					done();
				}
			});

			// act
			oTableSelectDialog.open();
			oTableSelectDialog._oSearchField.fireSearch({
				clearButtonPressed: bClearButtonPressed
			});
	});

	QUnit.module("Test Dialog Live Change");

	QUnit.test("TableSelectDialog1 SearchField Simulate Live Chnage Clear Text", function(assert){
		var done = assert.async();
		assert.expect(0);
		var searchField = sap.ui.getCore().byId("oTableSelectDialog1-searchField");
		searchField.setValue("");
		searchField.fireLiveChange({newValue: ""});
		done();
	});

	QUnit.test("TableSelectDialog1 SearchField Live Change Results Clear Text", function(assert){
		var done = assert.async();
		assert.expect(3);
		setTimeout(function() {
			assert.equal(aLiveChangeEvents.length, 2, "there should be 2 events in the serach events log");
			assert.equal(aLiveChangeEvents[0], 3, "The first event should equal 3 before the filter applied");
			assert.equal(aLiveChangeEvents[1], 5, "The second event should equal 5 after the filter applied");
		done();
		}, 10);
	});

	QUnit.module("Test Dialog Change to Single Select");

	QUnit.test("TableSelectDialog1 Change to Single Select", function(assert) {
		oTableSelectDialog1.setMultiSelect(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTableSelectDialog1.getMultiSelect(), false, 'Multi Select should now be updated to  "false"');
	});

	QUnit.test("TableSelectDialog1 Single Select Checks", function(assert){
		var done = assert.async();
		assert.expect(2);
		setTimeout(function() {
			assert.ok(jQuery.sap.domById("oTableSelectDialog1-cancel"), "TableSelectDialog1 should have a cancel button");
			assert.ok(!jQuery.sap.domById("oTableSelectDialog1-ok"), "TableSelectDialog1 should not have an ok button");
		done();
		}, 50);
	});

	QUnit.module("Test Dialog Single Select Item");

	QUnit.test("TableSelectDialog1 singleSelection Item 2", function(assert) {
		var oTable = sap.ui.getCore().byId("oTableSelectDialog1-table");
		var aItems = oTable.getItems();
		aItems[2].setSelected(true);
		assert.equal(aItems[0].getSelected(), false, "SingleSelection: Item 0 should not be selected");
		assert.equal(aItems[1].getSelected(), false, "SingleSelection: Item 1 should not be selected");
		assert.equal(aItems[2].getSelected(), true, "SingleSelection: Item 2 should be selected");
		assert.equal(aItems[3].getSelected(), false, "SingleSelection: Item 3 should not be selected");
		assert.equal(aItems[4].getSelected(), false, "SingleSelection: Item 4 should not be selected");
		oTable.fireSelect({ listItem : aItems[2] });
	});

	QUnit.test("TableSelectDialog1 Single Select Check Cancel", function(assert){
		var done = assert.async();
		assert.expect(3);
		oInput1.setValue("");
		oButton1.firePress();
		assert.ok(jQuery.sap.domById("oTableSelectDialog1-cancel"), "TableSelectDialog1 should have a cancel button");
		assert.ok(!jQuery.sap.domById("oTableSelectDialog1-ok"), "TableSelectDialog1 should not have an ok button");
		var oCancel = sap.ui.getCore().byId("oTableSelectDialog1-cancel");
		oCancel.firePress();
		done();
	});

	QUnit.test("Check add/remove/toggle/hasStyleClass methods", function (assert) {
		var done = assert.async();
		var oTableSelectDialog = new TableSelectDialog("TableSelectDialog"),
			sCustomStyleClass = "myStyleClass";

		// add + has
		oTableSelectDialog.addStyleClass(sCustomStyleClass);
		oTableSelectDialog.open();
		assert.ok(oTableSelectDialog._oDialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog now has style class "' + sCustomStyleClass + '"');
		assert.ok(oTableSelectDialog.hasStyleClass(sCustomStyleClass), 'The TableSelectDialog now has style class "' + sCustomStyleClass + '"');

		// remove
		oTableSelectDialog.removeStyleClass(sCustomStyleClass);
		assert.ok(!oTableSelectDialog._oDialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog does not have style class "' + sCustomStyleClass + '" after remove');
		assert.ok(!oTableSelectDialog.hasStyleClass(sCustomStyleClass), 'The TableSelectDialog does not have style class "' + sCustomStyleClass + '" after remove');

		// toggle
		oTableSelectDialog.toggleStyleClass(sCustomStyleClass);
		assert.ok(oTableSelectDialog._oDialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog has style class "' + sCustomStyleClass + '" after toggle');
		assert.ok(oTableSelectDialog.hasStyleClass(sCustomStyleClass), 'The TableSelectDialog has style class "' + sCustomStyleClass + '" after toggle');

		// cleanup
		oTableSelectDialog._oDialog.attachAfterClose(function (oEvent) {
			oTableSelectDialog.destroy();
			done();
		});
		oTableSelectDialog._oDialog.close();
	});

	QUnit.test("Check $ and getDomRef methods", function (assert) {
		var done = assert.async();
		var oTableSelectDialog = new TableSelectDialog("TableSelectDialog");

		oTableSelectDialog.open();

		// $ method
		assert.ok(oTableSelectDialog.$() instanceof jQuery && oTableSelectDialog.$().length === 1, "The inner dialogs jQuery object is returned");

		// getDomRef
		assert.ok(oTableSelectDialog.getDomRef() instanceof Element && oTableSelectDialog.getDomRef().id === oTableSelectDialog.getId() + "-dialog", "The inner dialogs DOM reference is returned");

		// cleanup
		oTableSelectDialog._oDialog.attachAfterClose(function (oEvent) {
			done();
		});
		oTableSelectDialog._oDialog.close();
	});

	/********************************************************************************/
	QUnit.module("Keyboard Handling");
	/********************************************************************************/

	QUnit.test("Initialfocus when there are no rows in the TableSelectDialog's table", function (assert) {
		var done = assert.async();
		assert.expect(1);
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oTableSelectDialog5 = new TableSelectDialog("tableSelectDialog", {
			title: "my TableSelectDialog",
			noDataText: "Sorry, no data is available"
		});

		oTableSelectDialog5.open();

		setTimeout(function(){
			assert.ok(jQuery.sap.byId('tableSelectDialog-searchField-I').is(":focus"), 'SearchField should be focused if there are no rows in the list');
				oTableSelectDialog5._oDialog.close();
				oTableSelectDialog5.destroy();
				done();

		}, 500);

	});

	QUnit.test("InitialFocus when there are rows in the tableSelectDialog's table", function(assert){
		var done = assert.async();
		assert.expect(1);
		var oTableSelectDialog15 = new TableSelectDialog("tableSelectDialog15", {
			title: "my TableSelectDialog",
			noDataText: "Sorry, no data is available",
			columns : [
				new Column({
					styleClass : "name",
					hAlign : "Left",
					header : new Label({
						text : "Name"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "Qty"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "Value"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "Price"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				})
			]
		});


		oTableSelectDialog15.setModel(oModel);
		oTableSelectDialog15.bindAggregation("items", "/navigation", template);
		oTableSelectDialog15.setModel(oModelDialog,"dialog");

		oTableSelectDialog15.open();

		setTimeout(function() {
			assert.strictEqual(oTableSelectDialog15.getItems()[0].$().is(":focus"), true, 'The first row of the table should be focused');
				oTableSelectDialog15._oDialog.close();
				oTableSelectDialog15.destroy();
				done();
		}, 500);

	});

	/********************************************************************************/
	QUnit.module("Accessibility");
	/********************************************************************************/

	QUnit.test("Aria-live attribute of the InfoToolBar should be set to 'polite'", function(assert) {
		oButton1.firePress();
		assert.equal(oTableSelectDialog1._oTable.getInfoToolbar().$().attr("aria-live"), "polite", "The aria-live attribute is set to polite");
		oTableSelectDialog1._oCancelButton.firePress();
	});

	/********************************************************************************/
	QUnit.module("oData v4 support");
	/********************************************************************************/

	QUnit.test("GetSelectedContexts", function(assert) {
		oTableSelectDialog1.open();
		var oTable = sap.ui.getCore().byId("oTableSelectDialog1-table");

		var fnTableGetSelectedContexts = sinon.spy(oTable, "getSelectedContexts");

		oTableSelectDialog1._fireConfirmAndUpdateSelection();
		assert.ok(!fnTableGetSelectedContexts.called, "getSelectedContexts() is no longer called by _fireConfirmAndUpdateSelection()");

		oTableSelectDialog1._oDialog.close();

		oTableSelectDialog1._fireConfirmAndUpdateSelection();
		assert.ok(!fnTableGetSelectedContexts.called, "getSelectedContexts() is no longer called by _fireConfirmAndUpdateSelection()");
	});


	QUnit.module("OpenClose", {
		beforeEach : function () {
			sinon.config.useFakeTimers = true;
		},
		afterEach : function () {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Closing without filtering doesn't re-filter the model", function(assert) {
		oTableSelectDialog1.open();

		var oTable = sap.ui.getCore().byId("oTableSelectDialog1-table");
		var oBindings = oTable.getBinding("items");

		var fnFilter = sinon.spy(oBindings, "filter");

		oTableSelectDialog1._onCancel();

		assert.notOk(fnFilter.called, "model is not re-filtered");
	});

	QUnit.test("LiveSearchUpdates", function(assert) {
		oTableSelectDialog1.open();

		var searchField = oTableSelectDialog1._oSearchField;
		searchField.setValue('m');
		searchField.fireLiveChange({newValue: "m"});

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var oTable = sap.ui.getCore().byId("oTableSelectDialog1-table");

		assert.equal(oTable.getItems().length, 3, 'filtered items are ok');

		oTableSelectDialog1._fireConfirmAndUpdateSelection();
		oTableSelectDialog1._oDialog.close();

		oTableSelectDialog1.open();
		searchField.fireLiveChange({newValue: ""});
		searchField.fireLiveChange({newValue: "m"});

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(oTable.getItems().length, 3, 'filtered items are ok');

		oTableSelectDialog1._oDialog.close();
		oTableSelectDialog1._fireConfirmAndUpdateSelection();
	});

	QUnit.module("Clear functionality", {
		beforeEach : function () {
			sinon.config.useFakeTimers = true;
			var aData = [];
			for (var i = 0; i < 50; i++) {
				aData.push({text : "Item" + i, selected : i === 3});
			}
			 this.oTableSelectDialogClearButton = new TableSelectDialog("clearButtonTableSelectDialog", {
				title: "Title",
				columns : [
					new Column({
						header : new Label({text : "Item"})
					})
				],
				multiSelect : true,
				rememberSelections: true,
				contentWidth: "200px",
				growing: false,
				showClearButton: true
			});

			this.oTableSelectDialogClearButton.setModel(new JSONModel(aData));
			this.oTableSelectDialogClearButton.bindItems("/", new ColumnListItem({
				cells : [
					new Label({text : "{text}"})
				],
				selected : "{selected}"
			}));
			this.oTable = this.oTableSelectDialogClearButton._oTable;

			this.oTableSelectDialogClearButton1 = new TableSelectDialog("clearButtonTableSelectDialog1", {
				title: "Title",
				columns : [
					new Column({
						header : new Label({text : "Item"})
					})
				],
				multiSelect : true,
				rememberSelections: true,
				contentWidth: "200px",
				growing: false,
				showClearButton: true
			});

			this.oTable1 = this.oTableSelectDialogClearButton1._oTable;
			var aData1 = [],
				sTableId = this.oTable1.getId();
			for (var i = 0; i < 50; i++) {
				aData1.push({id: sTableId + i, text : "Item" + i, selected : false});
			}
			this.oTableSelectDialogClearButton1.setModel(new JSONModel(aData1));
			this.oTableSelectDialogClearButton1.bindItems("/", new ColumnListItem({
				cells : [
					new Label({text : "{text}"})
				],
				selected : "{selected}"
			}));

			this.oTableSelectDialogShowClearNot = new TableSelectDialog("clearButtonNotSet", {
				title: "Title",
				columns : [
					new Column({
						header : new Label({text : "Item"})
					})
				],
				multiSelect : true,
				rememberSelections: true,
				contentWidth: "200px",
				growing: false
			});

		},
		afterEach : function () {
			sinon.config.useFakeTimers = false;
			this.oTableSelectDialogClearButton.destroy();
			this.oTableSelectDialogClearButton1.destroy();
			this.oTable1 = null;
			this.oTableSelectDialogShowClearNot.destroy();
		}
	});

	QUnit.test("Initial loading with selected items from previous selection", function(assert) {
		this.oTableSelectDialogClearButton.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(this.oTableSelectDialogClearButton._getClearButton().getEnabled(), true, 'Clear button should be enabled');
	});

	QUnit.test("Initial loading without selected items from previous selection", function(assert) {
		this.oTableSelectDialogClearButton1.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(this.oTableSelectDialogClearButton1._getClearButton().getEnabled(), false, 'Clear button should be disabled');
	});


	QUnit.test("Removing selection should disable button", function(assert) {
		this.oTableSelectDialogClearButton.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(this.oTableSelectDialogClearButton._getClearButton().getEnabled(), true, 'Clear button should be enabled');

		this.oTableSelectDialogClearButton._removeSelection();
		this.oTableSelectDialogClearButton._updateSelectionIndicator();

		assert.equal(this.oTableSelectDialogClearButton._getClearButton().getEnabled(), false, 'Clear button should be disabled');
	});

	QUnit.test("Adding selection should enable button", function(assert) {
		this.oTableSelectDialogClearButton1.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(this.oTableSelectDialogClearButton1._getClearButton().getEnabled(), false, 'Clear button should be disabled');

		this.oTable1.setSelectedItemById(this.oTable1.getAggregation("items")[0].sId);
		this.oTableSelectDialogClearButton1._updateSelectionIndicator();

		assert.equal(this.oTableSelectDialogClearButton1._getClearButton().getEnabled(), true, 'Clear button should be enabled');
	});

	QUnit.test("Clicking on enabled 'Clear' button should clear selection", function(assert) {
		this.oTableSelectDialogClearButton.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(this.oTableSelectDialogClearButton._getClearButton().getEnabled(), true, 'Clear button should be enabled');

		this.oTableSelectDialogClearButton._getClearButton().firePress();


		assert.equal(this.oTableSelectDialogClearButton._getClearButton().getEnabled(), false, 'Clear button should be disabled');
		assert.equal(this.oTable.getSelectedItems().length, 0, 'There should be no selected items');
	});

	QUnit.test("Title of dialog should be also set", function(assert) {
		this.oTableSelectDialogClearButton.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(this.oTableSelectDialogClearButton.getTitle(), "Title", 'Title of TableSelectDialog should be "Title"');
		assert.equal(this.oTableSelectDialogClearButton._oDialog.getTitle(), "Title", 'Title of Dialog  should be "Title"');

	});

	QUnit.test("After clear is preset the focus should be returned to the search field", function(assert) {
		this.oTableSelectDialogClearButton.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		this.oTableSelectDialogClearButton._getClearButton().firePress();
		assert.equal(document.activeElement.getAttribute("id"), this.oTableSelectDialogClearButton._oDialog.getId(), 'After selection is clear the focus should be returned to the TableSelectDialog"');

	});

	QUnit.test("After clear is preset the focus should be returned to the search field", function(assert) {
		this.oTableSelectDialogClearButton.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		this.oTableSelectDialogClearButton._getClearButton().firePress();
		assert.equal(document.activeElement.getAttribute("id"), this.oTableSelectDialogClearButton._oDialog.getId(), 'After selection is clear the focus should be returned to the TableSelectDialog"');

	});

	QUnit.test("Disable already enabled clear button and then enable it again", function(assert) {
		this.oTableSelectDialogClearButton.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var oCustomHeader = this.oTableSelectDialogClearButton._oDialog.getCustomHeader();

		this.oTableSelectDialogClearButton.setShowClearButton(false);
		sap.ui.getCore().applyChanges();

		assert.equal(oCustomHeader.getContentRight()[0].getVisible(), false, 'Clear button is not visible');
		assert.notOk(oCustomHeader.getContentRight()[0].getDomRef(), 'Clear button is not in dom');

		this.oTableSelectDialogClearButton.setShowClearButton(true);
		sap.ui.getCore().applyChanges();

		assert.equal(oCustomHeader.getContentRight()[0].getVisible(), true, 'Clear button is not visible');
		assert.ok(oCustomHeader.getContentRight()[0].getDomRef(), 'Clear button is in dom');
		assert.equal(oCustomHeader.getContentRight()[0].getProperty("text"), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("TABLESELECTDIALOG_CLEARBUTTON"), 'Text of clear button is set');
	});

	QUnit.test("Disable already enabled clear button and then enabled", function(assert) {
		this.oTableSelectDialogShowClearNot.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var oCustomHeader = this.oTableSelectDialogShowClearNot._oDialog.getCustomHeader();
		assert.equal(oCustomHeader.getContentRight().length,  0, 'Clear button is not created');

		this.oTableSelectDialogClearButton.setShowClearButton(false);
		sap.ui.getCore().applyChanges();

		assert.equal(oCustomHeader.getContentRight().length,  0, 'Clear button is not created');

		this.oTableSelectDialogShowClearNot.setShowClearButton(true);
		sap.ui.getCore().applyChanges();

		assert.equal(oCustomHeader.getContentRight()[0].getVisible(), true, 'Clear button is not visible');
		assert.ok(oCustomHeader.getContentRight()[0].getDomRef(), 'Clear button is in dom');
	});

	return waitForThemeApplied();
});