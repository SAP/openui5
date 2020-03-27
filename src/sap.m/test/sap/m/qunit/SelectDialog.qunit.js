/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */

sap.ui.define([
	"sap/m/SelectDialog",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/m/StandardListItemRenderer",
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
],
	function(
		SelectDialog,
		Filter,
		FilterOperator,
		StandardListItem,
		JSONModel,
		qutils,
		KeyCodes,
		Device,
		StandardListItemRenderer
	) {
		"use strict";


		function generateData() {
			return {
				items : [
					{
						Title : "Title1",
						Description: "Description1",
						Selected: false
					}, {
						Title : "Title2",
						Description: "Description2",
						Selected: true
					}, {
						Title : "Title3",
						Description: "Description3",
						Selected: true
					}, {
						Title : "Title4",
						Description: "Description4",
						Selected: true
					}, {
						Title : "Title5",
						Description: "Description5",
						Selected: false
					}, {
						Title : "Title6",
						Description: "Description6",
						Selected: false
					}, {
						Title : "Title7",
						Description: "Description7",
						Selected: false
					}, {
						Title : "Title8",
						Description: "Description8",
						Selected: true
					}, {
						Title : "Title9",
						Description: "Description9",
						Selected: false
					}, {
						Title : "Title10",
						Description: "Description10",
						Selected: false
					}
				]
			};
		}

		// create a bindable list item
		function createTemplateListItem() {
			return new StandardListItem({
				title: "{Title}",
				description: "{Description}",
				selected: "{Selected}"
			});
		}

		function bindItems(oSelectDialog, oConfiguration) {
			var oModel = new JSONModel();
			oModel.setData(oConfiguration.oData);

			// growing list does not support two way binding
			oModel.setDefaultBindingMode("OneWay");
			oSelectDialog.setModel(oModel);

			oSelectDialog.bindAggregation("items", oConfiguration);
		}

		QUnit.module("API", {
			beforeEach: function() {
				this.oSelectDialog = new SelectDialog("selectDialog", {
					title: "my SelectDialog",
					noDataText: "Sorry, no data is available",
					growingThreshold: 50,
					multiSelect: true
				});
			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
			}
		});

		QUnit.test("Initialization", function (assert) {
			// assert
			assert.ok(!document.getElementById("selectDialog"), "Dialog is not rendered before it's ever opened.");
			assert.strictEqual(this.oSelectDialog.getTitle(), "my SelectDialog", 'The title should be "my SelectDialog"');
			assert.strictEqual(this.oSelectDialog.getNoDataText(), "Sorry, no data is available", '"Sorry, no data is available" should be displayed when no data is there');
			assert.strictEqual(this.oSelectDialog.getGrowingThreshold(), 50, 'The growing threshold should be "50"');
			assert.strictEqual(this.oSelectDialog.getMultiSelect(), true, 'The multiSelect mode should be "true"');
			assert.strictEqual(this.oSelectDialog.getShowClearButton(), false, 'There is no clear button');
			assert.strictEqual(this.oSelectDialog.getDraggable(), false, 'The draggable property should be false');
			assert.strictEqual(this.oSelectDialog.getResizable(), false, 'The resizable property should be false');
		});

		QUnit.test("setBusy", function (assert) {
			this.oSelectDialog.open();
			this.clock.tick(1000);

			var oDialogRef2 = this.oSelectDialog.setBusy(true);
			this.clock.tick(1500);

			assert.strictEqual(this.oSelectDialog, oDialogRef2, "Should return the object itself. Ready for method chaining");
			assert.strictEqual(oDialogRef2.getBusy(), true, "Should return dialog's proper busy state");
			assert.strictEqual(this.oSelectDialog.getBusy(), true, "Should return dialog's proper busy state");
			assert.strictEqual(this.oSelectDialog.$("busyIndicator").length, 1, "To have busy indicator activated inside the real dialog");

			oDialogRef2 = this.oSelectDialog.setBusy(false);
			this.clock.tick(1000);

			assert.strictEqual(oDialogRef2.getBusy(), false, "Should return dialog's proper busy state");
			assert.strictEqual(this.oSelectDialog.getBusy(), false, "Should return dialog's proper busy state");
			assert.strictEqual(this.oSelectDialog.$("busyIndicator").length, 0, "To have busy indicator deactivated inside the real dialog");
		});

		QUnit.test("busyIndicatorDelay propagation to internal List and Dialog controls", function (assert) {
			var iDelay = 50;
			this.oSelectDialog.setBusyIndicatorDelay(iDelay);

			sap.ui.getCore().applyChanges();
			assert.strictEqual(this.oSelectDialog._oList.getBusyIndicatorDelay(), iDelay, 'The List delay value should be ' + iDelay);
			assert.strictEqual(this.oSelectDialog._oDialog.getBusyIndicatorDelay(), iDelay, 'The Dialog delay value should be ' + iDelay);
			assert.strictEqual(this.oSelectDialog.getBusyIndicatorDelay(), iDelay, 'The SelectDialog delay value should be ' + iDelay);
		});

		QUnit.module("Growing Behavior", {
			beforeEach: function() {
				this.oSelectDialog = new SelectDialog("selectDialog", {
					title: "my SelectDialog",
					growingThreshold: 5,
					multiSelect: true
				});
				this.mockupData = generateData();
			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});

		QUnit.test("growing: true (default)", function (assert) {
			// arrange
			bindItems(this.oSelectDialog, { oData: this.mockupData, path: "/items", template: createTemplateListItem() });
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oSelectDialog._oList.getSelectedContextPaths(true).length, 3,
				"The selected items, should be equal to the number of loaded selected items in the list");
			assert.strictEqual(this.oSelectDialog.getItems().length, 5,
				"The number of items should be equal to the growingThreshold property value");
		});

		QUnit.test("growing: false", function (assert) {
			// arrange
			this.oSelectDialog.setGrowing(false);
			bindItems(this.oSelectDialog, { oData: this.mockupData, path: "/items", template: createTemplateListItem() });
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oSelectDialog._oList.getSelectedContextPaths(true).length, 4,
				"The selected items, should be equal to the number of the selected items in the list");
			assert.strictEqual(this.oSelectDialog.getItems().length, 10,
				"The number of items, should be equal to the number of items in the list");
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
			this.oSelectDialog.setDraggable(true);

			// Assert
			assert.strictEqual(this.oSelectDialog.getDraggable(), true, "draggable is set correctly in the SelectDialog");
			assert.strictEqual(this.oSelectDialog._oDialog.getDraggable(), true, "draggable is set correctly in the Dialog");
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
			this.oSelectDialog.setDraggable(true);

			// Assert
			assert.strictEqual(this.oSelectDialog.getDraggable(), true, "draggable is set correctly in the SelectDialog");
			assert.strictEqual(this.oSelectDialog._oDialog.getDraggable(), false, "draggable is set correctly in the Dialog");
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
			this.oSelectDialog.setResizable(true);

			// Assert
			assert.strictEqual(this.oSelectDialog.getResizable(), true, "resizable is set correctly in the SelectDialog");
			assert.strictEqual(this.oSelectDialog._oDialog.getResizable(), true, "resizable is set correctly in the Dialog");
		});

		QUnit.test("resizable: true on desktop device", function (assert) {
			// Arrange
			var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};
			this.stub(Device, "system", oSystem);

			// Act
			this.oSelectDialog.setResizable(true);

			// Assert
			assert.strictEqual(this.oSelectDialog.getResizable(), true, "resizable is set correctly in the SelectDialog");
			assert.strictEqual(this.oSelectDialog._oDialog.getResizable(), false, "resizable is set correctly in the Dialog");
		});

		QUnit.test("confirmButtonText", function(assert) {
			// assert
			assert.equal(this.oSelectDialog._oOkButton.getText(),
				sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SELECT_CONFIRM_BUTTON"),
				'The default confirmation text is set.');

			// act
			this.oSelectDialog.setConfirmButtonText("Save");
			// assert
			assert.equal(this.oSelectDialog._oOkButton.getText(), "Save", 'The confirm button text is changed.');
		});

		QUnit.test("initially set confirmButtonText", function(assert) {
			// setup
			var oSelectDialog = new SelectDialog({
				confirmButtonText: "Custom Text",
				multiSelect: true
			});

			this.oSelectDialog.open();
			this.clock.tick(500);

			// assert
			assert.equal(oSelectDialog._oOkButton.getText(), "Custom Text", 'The confirm button text is set.');

			// clean up
			oSelectDialog.destroy();
		});

		QUnit.module("Rendering", {
			beforeEach: function() {
				this.oSelectDialog = new SelectDialog("selectDialog");
				this.mockupData = generateData();
			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});

		QUnit.test("Open SelectDialog without a parent (should be added to static area)", function (assert) {
			var that = this;
			assert.strictEqual(this.oSelectDialog.getParent(), null, "Dialog has no parent before opening");
			assert.strictEqual(this.oSelectDialog.getUIArea(), null, "Dialog has no ui area before opening");

			jQuery.when(this.oSelectDialog.open()).then(function (oEvent) {
				assert.ok(document.getElementById("selectDialog-dialog"), "Dialog is opened");
				assert.ok(that.oSelectDialog.getParent() instanceof sap.ui.core.UIArea, "Dialog is now a direct child of the UI Area");
				assert.strictEqual(that.oSelectDialog.getParent().getRootNode().attributes.getNamedItem("id").value, "sap-ui-static", "Dialog's UI area is the static UI Area");
			});
		});

		QUnit.test("Aria-live attribute of the InfoToolBar should be set to 'polite' and added to the dialog aria-labelledby", function (assert) {
			var that = this;
			this.oSelectDialog.setMultiSelect(true);
			bindItems(this.oSelectDialog, { oData: this.mockupData, path: "/items", template: createTemplateListItem() });

			this.oSelectDialog.open();
			sap.ui.getCore().applyChanges();
			assert.strictEqual(that.oSelectDialog._oList.getInfoToolbar().$().attr("aria-live"), "polite", "The aria-live attribute is set to polite");

			assert.ok(that.oSelectDialog.$().attr("aria-labelledby").indexOf(that.oSelectDialog._oList.getInfoToolbar().getId()) > -1, "the info toolbar id is added to the dialog aria-labelledby");
		});

		QUnit.test("No InfoToolbar should be shown in single select mode even if there is a selected option", function (assert) {
			var that = this;
			bindItems(this.oSelectDialog, { oData: {
				items : [
					{
						Title : "Title1",
						Description: "Description1",
						Selected: false
					}, {
						Title : "Title2",
						Description: "Description2",
						Selected: false
					}, {
						Title : "Title3",
						Description: "Description3",
						Selected: true
					}
				]
			}, path: "/items", template: createTemplateListItem() });

			this.oSelectDialog.open();
			sap.ui.getCore().applyChanges();
			assert.strictEqual(that.oSelectDialog._oList.getInfoToolbar().getVisible(), false, "The should be no toolbar shown");
		});

		QUnit.test("ClearSelection selection should clear the selection from the SelectDialog and the list", function (assert) {
			var that = this,
				done = assert.async(),
				oRemoveSelectionSpy = new sinon.spy(this.oSelectDialog, "_removeSelection"),
				oUpdateSelectionIndicatorSpy = new sinon.spy(this.oSelectDialog, "_updateSelectionIndicator");

			// Arrange
			bindItems(this.oSelectDialog, { oData: this.mockupData, path: "/items", template: createTemplateListItem() });
			sap.ui.getCore().applyChanges();

			this.oSelectDialog._oDialog.attachAfterOpen(function () {
				// Reset call count of spy
				oUpdateSelectionIndicatorSpy.reset();

				// Assert
				assert.strictEqual(that.oSelectDialog._aInitiallySelectedContextPaths.length, 1, "There is one selected item");

				// Act
				that.oSelectDialog.clearSelection();

				// Assert
				assert.strictEqual(oRemoveSelectionSpy.callCount, 1, "Selection was removed.");
				assert.strictEqual(oUpdateSelectionIndicatorSpy.callCount, 1, "Indicator was updated.");
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths(true).length, 0, "There are no selected context paths in the list");

				// Clean
				that.oSelectDialog._oDialog.close();
				that.clock.tick(350);
				done();
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});


		QUnit.module("XML Rendering", {
			beforeEach: function() {
				this.oSelectDialog = null;

			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
				this.oXmlViewOrFragment.destroy();
			}
		});

		QUnit.test("Open SelectDialog that is defined within an XML view without parent (has no UI area, temporary fix: will be added to static area)", function (assert) {
			var xml = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'      <SelectDialog id="xmlSelectDialog"></SelectDialog>' +
			'    </mvc:View>',
				that = this;

			this.oXmlViewOrFragment = sap.ui.xmlview({viewContent:xml});
			this.oSelectDialog = this.oXmlViewOrFragment.byId("xmlSelectDialog");

			assert.ok(this.oSelectDialog.getParent() instanceof sap.ui.core.mvc.XMLView, "Dialog's parent is instance of XML view");
			assert.strictEqual(this.oSelectDialog.getParent(), this.oXmlViewOrFragment, "Dialog's parent is an XML view");
			assert.strictEqual(this.oSelectDialog.getParent().getParent(), null, "The XML view has no parent");
			assert.strictEqual(this.oSelectDialog.getUIArea(), null, "Dialog has no ui area before opening");

			jQuery.when(this.oSelectDialog.open()).then(function (oEvent) {
				assert.ok(document.getElementById(that.oXmlViewOrFragment.createId("xmlSelectDialog-dialog")), "Dialog is opened");
				assert.ok(that.oSelectDialog.getParent() instanceof sap.ui.core.UIArea, "Dialog is now a direct child of the UI Area");
				assert.strictEqual(that.oSelectDialog.getParent().getRootNode().attributes.getNamedItem("id").value, "sap-ui-static", "Dialog's UI area is the static UI Area");
			});
		});

		QUnit.test("Open SelectDialog that is defined within a fragment", function (assert) {
			var sFragmentText = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
			 '      <SelectDialog id="fragmentSelectDialog"></SelectDialog>' +
			 '    </core:FragmentDefinition>',
				that = this;

			this.oXmlViewOrFragment = sap.ui.xmlfragment({fragmentContent: sFragmentText});
			this.oSelectDialog = sap.ui.getCore().byId("fragmentSelectDialog");

			assert.strictEqual(this.oSelectDialog.getParent(), null, "Dialog's parent is null");
			assert.strictEqual(this.oSelectDialog.getUIArea(), null, "Dialog has no ui area before opening");

			jQuery.when(this.oSelectDialog.open()).then(function (oEvent) {
				assert.ok(document.getElementById("fragmentSelectDialog-dialog"), "Dialog is opened");
				assert.ok(that.oSelectDialog.getParent() instanceof sap.ui.core.UIArea, "Dialog is now a direct child of the UI Area");
				assert.strictEqual(that.oSelectDialog.getParent().getRootNode().attributes.getNamedItem("id").value, "sap-ui-static", "Dialog's UI area is the static UI Area");
			});
		});

		QUnit.module("Multiselection", {
			beforeEach: function() {
				// arrange
				this.oSelectDialog = new SelectDialog('selectDialog', {
					multiSelect: true,
					title: "my SelectDialog",
					noDataText: "Sorry, no data is available",
					growingThreshold: 50
				});
				this.mockupData = generateData();
			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});

		QUnit.test("Remember Selections after Cancel", function (assert) {
			var done = assert.async();

			// arrange
			this.oSelectDialog.setRememberSelections(true);

			bindItems(this.oSelectDialog, { oData: this.mockupData, path: "/items", template: createTemplateListItem() });
			sap.ui.getCore().applyChanges();

			this.oSelectDialog._oDialog.attachAfterOpen(function() {

				var aInitiallySelectedItems = this.oSelectDialog._oList.getSelectedItems();
				this.oSelectDialog._resetSelection();
				assert.strictEqual(aInitiallySelectedItems.length, this.oSelectDialog._oList.getSelectedItems().length, 'Selected items after cancelling are the same');
				done();
			}, this);

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.test("Remember Selections false mode", function (assert) {
			// arrange
			this.oSelectDialog.setRememberSelections(false);
			var fnListGetSelectedContexts = sinon.spy(this.oSelectDialog._oList, "getSelectedContexts");

			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});
			sap.ui.getCore().applyChanges();

			this.oSelectDialog.open();

			assert.strictEqual(this.oSelectDialog._oList.getSelectedItems().length, 4, '4 items are selected initially');
			this.oSelectDialog._fireConfirmAndUpdateSelection();
			assert.ok(!fnListGetSelectedContexts.called, "getSelectedContexts() is no longer called by _fireConfirmAndUpdateSelection()");
			this.oSelectDialog._oDialog.close();

			this.oSelectDialog.open();

			assert.strictEqual(this.oSelectDialog._oList.getSelectedItems().length, 0, '0 items are selected after opening the dialog the second time');
			this.oSelectDialog._oDialog.close();
			this.oSelectDialog._fireConfirmAndUpdateSelection();
			assert.ok(!fnListGetSelectedContexts.called, "getSelectedContexts() is no longer called by _fireConfirmAndUpdateSelection()");

			this.oSelectDialog.open();

			assert.strictEqual(this.oSelectDialog._oList.getSelectedItems().length, 0, '0 items are selected after opening the dialog the third time');
			this.oSelectDialog._oDialog.close();

			this.clock.tick(350);
		});


		QUnit.test("Remember Selections true mode", function (assert) {
			// arrange
			this.oSelectDialog.setRememberSelections(true);
			var fnListGetSelectedContexts = sinon.spy(this.oSelectDialog._oList, "getSelectedContexts");

			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});
			sap.ui.getCore().applyChanges();

			this.oSelectDialog.open();

			assert.strictEqual(this.oSelectDialog._oList.getSelectedItems().length, 4, '4 items are selected initially');
			this.oSelectDialog._fireConfirmAndUpdateSelection();
			assert.ok(!fnListGetSelectedContexts.called, "getSelectedContexts() is no longer called by _fireConfirmAndUpdateSelection()");
			this.oSelectDialog._oDialog.close();

			this.oSelectDialog.open();

			assert.strictEqual(this.oSelectDialog._oList.getSelectedItems().length, 4, '4 items are selected after opening the dialog the second time');
			this.oSelectDialog._oDialog.close();
			this.oSelectDialog._fireConfirmAndUpdateSelection();
			assert.ok(!fnListGetSelectedContexts.called, "getSelectedContexts() is no longer called by _fireConfirmAndUpdateSelection()");

			this.oSelectDialog.open();

			assert.strictEqual(this.oSelectDialog._oList.getSelectedItems().length, 4, '4 items are selected after opening the dialog the third time');
			this.oSelectDialog._oDialog.close();

			this.clock.tick(350);
		});

		QUnit.module("Open and Close", {
			beforeEach: function() {
				// arrange
				this.oSelectDialog = new SelectDialog('selectDialog', {
					title: "my SelectDialog",
					noDataText: "Sorry, no data is available"
				});
				this.mockupData = generateData();
			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});

		QUnit.test("Open Dialog", function (assert) {
			jQuery.when(this.oSelectDialog.open()).then(function (oEvent) {
				// assert
				assert.ok(document.getElementById("selectDialog-dialog"), "Dialog is opened");
				assert.ok(document.getElementById("selectDialog-dialog-title"), "Dialog title should be rendered");
				assert.ok(document.getElementById("selectDialog-searchField"), "Dialog should have a searchfield");
				assert.ok(document.getElementById("selectDialog-list"), "Dialog should have a list");
				assert.ok(!document.getElementById("selectDialog-ok"), "Dialog should not have an ok button");
			});
		});

		QUnit.test("Open with string and filter", function (assert) {
			var that = this,
				oFilter = new Filter("Title", FilterOperator.Contains , "Title1");

			this.oSelectDialog.bindAggregation("items", {
				path: "/items",
				template: createTemplateListItem()
			});

			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem(), filters: oFilter});
			sap.ui.getCore().applyChanges();

			jQuery.when(this.oSelectDialog.open('Chuck')).then(function (oEvent) {
				assert.strictEqual(that.oSelectDialog._oSearchField.getValue(), "Chuck", 'The search field value is "Title1" after passing "Title1" to the open method');
				assert.strictEqual(that.oSelectDialog._oList.getItems().length, 2, 'There are 2 items filtered and displayed in the list ');
				assert.strictEqual(that.oSelectDialog._oList.getItems()[0].getTitle(), "Title1", 'The first item in the list is "Title1"');
				assert.strictEqual(that.oSelectDialog._oList.getItems()[1].getTitle(), "Title10", 'The second item in the list is "Title10"');
			});
		});

		QUnit.module("Event testing", {
			beforeEach: function() {
				// arrange
				this.oSelectDialog = new SelectDialog('selectDialog', {
					title: "my SelectDialog"
				});
				this.mockupData = generateData();
			},
			afterEach: function() {
				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});

		QUnit.test("Search event", function (assert) {
			// Arrange
			var fnFireSelectSpy = sinon.spy(),
				that = this;
			this.oSelectDialog.attachSearch(fnFireSelectSpy);

			jQuery.when(this.oSelectDialog.open()).then(function (oEvent) {
				that.oSelectDialog._oSearchField.fireSearch();
				assert.strictEqual(fnFireSelectSpy.callCount, 1, 'Search event is fired once');
			});
		});

		QUnit.test("liveChange event", function (assert) {
			// Arrange
			var fnFireLiveChangeSpy = sinon.spy(function(oEvent) {
				// Asert
				assert.strictEqual(oEvent.getParameter('value'), 'abc');
			}),
			that = this,
			clock = this.clock;
			this.oSelectDialog.attachLiveChange(fnFireLiveChangeSpy);

			jQuery.when(this.oSelectDialog.open()).then(function(oEvent) {
				// Act
				that.oSelectDialog._oSearchField.$('I').focus().val("abc").trigger("input");
				// liveChange is triggered after 300ms
				clock.tick(400);
			});
		});

		QUnit.test("Confirm Event", function (assert) {
			var done = assert.async(),
				that = this;

			this.oSelectDialog.setMultiSelect(true);
			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});
			sap.ui.getCore().applyChanges();

			this.oSelectDialog.attachConfirm(function (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem"),
					aSelectedItems = oEvent.getParameter("selectedItems"),
					aSelectedContexts = oEvent.getParameter("selectedContexts");

				// items 2,3,4,8 are selected in the model
				assert.ok(true, 'The event "confirm" has been fired');
				assert.strictEqual(oSelectedItem.getTitle(), that.oSelectDialog.getItems()[1].getTitle(), 'The selected item property of the event should be "Title2"');
				assert.strictEqual(aSelectedItems.length, 4, '4 items where selected');
				assert.strictEqual(aSelectedItems[0].getTitle(), that.oSelectDialog.getItems()[1].getTitle(), 'The first selectedItems entry should be "Title2"');
				assert.strictEqual(aSelectedItems[1].getTitle(), that.oSelectDialog.getItems()[2].getTitle(), 'The second selectedItems entry should be "Title3"');
				assert.strictEqual(aSelectedItems[2].getTitle(), that.oSelectDialog.getItems()[3].getTitle(), 'The third selectedItems entry should be "Title4"');
				assert.strictEqual(aSelectedItems[3].getTitle(), that.oSelectDialog.getItems()[7].getTitle(), 'The fourth selectedItems entry should be "Title8"');
				assert.strictEqual(aSelectedContexts[0].getObject().Title, "Title2", 'The first selectedContexts entry should be "Title2"');
				assert.strictEqual(aSelectedContexts[1].getObject().Title, "Title3", 'The second selectedContexts entry should be "Title3"');
				assert.strictEqual(aSelectedContexts[2].getObject().Title, "Title4", 'The third selectedContexts entry should be "Title4"');
				assert.strictEqual(aSelectedContexts[3].getObject().Title, "Title8", 'The fourth selectedContexts entry should be "Title8"');
				done();
			});

			jQuery.when(this.oSelectDialog.open()).then(function () {
				that.oSelectDialog._getOkButton().firePress();
				that.clock.tick(350);
			});
		});

		QUnit.test("Cancel Event with unfiltered selection", function (assert) {
			var done = assert.async(),
				that = this;

			this.oSelectDialog.setMultiSelect(true);
			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});

			this.oSelectDialog.attachCancel(function (oEvent) {
				assert.ok(true, 'The event "cancel" has been fired');

				assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths().length, 4, 'After cancelling there should be 4 items selected again');
				done();
			});

			// simulate open and close
			this.oSelectDialog._oDialog.attachAfterOpen(function(oEvent) {
				// make a change to the selection
				that.oSelectDialog._oList.getItems()[1].setSelected(false);
				that.oSelectDialog._oList.getItems()[3].setSelected(false);
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths().length, 2, 'Before cancelling there should be 2 items selected');
				that.oSelectDialog._getCancelButton().firePress();
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.test("Cancel Event with pre-filtered selection", function (assert) {
			var done = assert.async(),
				that = this,
				oFilter = new Filter("Title", FilterOperator.Contains , "Title4");

			this.oSelectDialog.setMultiSelect(true);

			// reset binding
			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem(), filters: oFilter});

			this.oSelectDialog.attachCancel(function (oEvent) {
				assert.ok(true, 'The event "cancel" has been fired');

				// the selection is reset immediately ater the cancel event so we do it with clock.tick
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths().length, 1, 'After cancelling there should be 1 visible item selected again');
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContexts(true).length, 1, 'After cancelling there should be 4 invisible item selected again (prefiltered items are not added to the contexts initially)');
				done();
			});


			// simulate open and close
			this.oSelectDialog._oDialog.attachAfterOpen(function(oEvent) {
				// make a change to the selection (uncheck "Title4" item)
				that.oSelectDialog._oList.getItems()[0].setSelected(false);
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths().length, 0, 'Before cancelling there should be 0 visible items selected');
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContexts(true).length, 0, 'Before cancelling there should be 0 invisible contexts selected (prefiltered items are not added to the contexts initially)');
				that.oSelectDialog._getCancelButton().firePress();
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.test("Cancel Event with user-filtered selection", function (assert) {
			var done = assert.async(),
				that = this,
				oFilter = new Filter("Title", FilterOperator.Contains , "Title4");

			this.oSelectDialog.setMultiSelect(true);
			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});

			// simulate open and close
			this.oSelectDialog._oDialog.attachAfterOpen(function(oEvent) {
				// make a change to the selection
				that.oSelectDialog._oList.getItems()[1].setSelected(false);
				that.oSelectDialog._oList.getItems()[3].setSelected(false);
				that.oSelectDialog._oList.getBinding("items").filter(oFilter);
				assert.strictEqual(that.oSelectDialog._oList.getSelectedItems().length, 0, 'Before cancelling there should be 0 visible items selected');
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContexts(true).length, 2, 'Before cancelling there should be 2 invisible items selected');
				that.oSelectDialog._getCancelButton().firePress();
				that.clock.tick(350);
			});

			this.oSelectDialog.attachCancel(function (oEvent) {
				assert.ok(true, 'The event "cancel" has been fired');
				assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths().length, 4, 'After cancelling there should be 4 invisible items selected again');
				done();
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.test("Cancel on key ESCAPE event", function (assert) {
			this.oSelectDialog.setMultiSelect(true);

			var done = assert.async(),
				that = this,
				fnChecks = function () {
					assert.ok(true, "Event cancel was fired");
					assert.strictEqual(that.oSelectDialog._oList.getSelectedContextPaths().length, 4, 'After cancelling there should be 4 items selected again');
					done();
				};

			// bind items
			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});

			// attach dialog cancel event
			this.oSelectDialog.attachCancel(fnChecks);

			// simulate open and close
			this.oSelectDialog._oDialog.attachAfterOpen(function(oEvent) {
				// make a change to the selection
				that.oSelectDialog._oList.getItems()[1].setSelected(false);
				that.oSelectDialog._oList.getItems()[3].setSelected(false);
				assert.strictEqual(that.oSelectDialog._oList.getSelectedItems().length, 2, 'Before cancelling there should be 2 items selected');

				qutils.triggerKeydown(that.oSelectDialog._oDialog.getDomRef(), KeyCodes.ESCAPE);
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.test("Single select mode and custom item preventing change", function (assert) {
			// Setup
			var done = assert.async(),
				CustomItem = StandardListItem.extend("sap.my.custom.SelectDialogListItem", {
					metadata: {},
					renderer: function () {
						StandardListItemRenderer.render.apply(this, arguments);
					}
				}),
				oSelectionChangeSpy = this.spy(this.oSelectDialog._oList, "fireSelectionChange");

			CustomItem.prototype.ontap = function (oEvent) {
				oEvent.preventDefault();
				return StandardListItem.prototype.ontap.apply(this, arguments);
			};
			bindItems(this.oSelectDialog, {
				oData: this.mockupData,
				path: "/items",
				template: new CustomItem({title: "{Title}", description: "{Description}", selected: "{Selected}"})
			});

			this.oSelectDialog.setRememberSelections(true);
			sap.ui.getCore().applyChanges();

			// Act
			this.oSelectDialog.open();
			this.clock.tick(350);

			this.oSelectDialog.getItems()[0].$().trigger("tap");
			sap.ui.getCore().applyChanges();
			this.clock.tick(350);

			// Assert
			assert.ok(this.oSelectDialog._oDialog.isOpen() === false, "The Dialog got closed...");
			assert.strictEqual(oSelectionChangeSpy.callCount, 1, "...because a new item has been selected");

			// Act
			this.oSelectDialog.open();
			this.clock.tick(350);

			this.oSelectDialog.getItems()[0].$().trigger("tap");
			this.clock.tick(350);

			// Assert
			assert.ok(this.oSelectDialog._oDialog.isOpen(), "The Dialog remains open...");
			assert.strictEqual(oSelectionChangeSpy.callCount, 1, "...because the same item has been selected and preventDefault has been used");

			// Act
			qutils.triggerKeydown(this.oSelectDialog.getItems()[0].getDomRef(), KeyCodes.ENTER);
			this.clock.tick(350);

			// Assert
			assert.ok(this.oSelectDialog._oDialog.isOpen() === false, "Dialog is closed. It was not prevented in the Custom List Item");
			assert.strictEqual(oSelectionChangeSpy.callCount, 1, "The same item has been selected");

			// Act
			this.oSelectDialog.open();
			this.clock.tick(350);

			qutils.triggerKeydown(this.oSelectDialog.getItems()[1].getDomRef(), KeyCodes.ENTER);
			this.clock.tick(350);

			// Assert
			assert.ok(this.oSelectDialog._oDialog.isOpen() === false, "Dialog is closed. It was not prevented in the Custom List Item");
			assert.strictEqual(oSelectionChangeSpy.callCount, 2, "The same item has been selected");
			done();
		});

		QUnit.test("Single select mode and item selection - _selectionChange", function (assert) {
			// Arrange
			var oDialogAttachSpy = this.spy(this.oSelectDialog._oDialog, "attachEventOnce");
			var oDialogCloseSpy = this.spy(this.oSelectDialog._oDialog, "close");

			// Act
			this.oSelectDialog._selectionChange();

			// Assert
			assert.strictEqual(oDialogAttachSpy.callCount, 1, "Event was attached once.");
			assert.strictEqual(oDialogAttachSpy.firstCall.args[0], "afterClose", "Correct delegate event was used.");
			assert.strictEqual(oDialogAttachSpy.firstCall.args[1], this.oSelectDialog._resetAfterClose, "Correct method was attached.");
			assert.strictEqual(oDialogAttachSpy.firstCall.args[2], this.oSelectDialog, "Correct context was passed to the event delegate.");
			assert.strictEqual(oDialogCloseSpy.callCount, 1, "Dialog close method was called once.");

			// Cleanup
			oDialogAttachSpy.restore();
			oDialogCloseSpy.restore();
		});

		QUnit.test("Single select mode and item selection - _resetAfterClose", function (assert) {
			// Arrange
			var oListGetItemSpy = this.stub(this.oSelectDialog._oList, "getSelectedItem").returns("selectedItem"),
				oListGetItemsSpy = this.stub(this.oSelectDialog._oList, "getSelectedItems").returns("arrayOfItems"),
				oFireConfirmSpy = this.spy(this.oSelectDialog, "_fireConfirmAndUpdateSelection"),
				oConfirmEventSpy = this.spy(this.oSelectDialog, "fireConfirm");

			// Act
			this.oSelectDialog._resetAfterClose();

			// Assert
			assert.strictEqual(oListGetItemSpy.callCount, 1, "List's selectedItem property was taken.");
			assert.strictEqual(oListGetItemsSpy.callCount, 1, "List's selectedItems property was taken.");
			assert.strictEqual(oFireConfirmSpy.callCount, 1, "_fireConfirmAndUpdateSelection was fired once.");
			assert.strictEqual(oConfirmEventSpy.callCount, 1, "Confirm event was fired once.");
			assert.strictEqual(oConfirmEventSpy.firstCall.args[0].selectedItem, "selectedItem", "selectedItem event parameter was passed.");
			assert.strictEqual(oConfirmEventSpy.firstCall.args[0].selectedItems, "arrayOfItems", "selectedItems event parameter was passed.");

			// Cleanup
			oConfirmEventSpy.restore();
			oListGetItemSpy.restore();
			oListGetItemsSpy.restore();
			oFireConfirmSpy.restore();
		});

		QUnit.test("Single select mode and item selection - _resetAfterClose should be attached only once", function (assert) {
			// Arrange
			var oAttachEventOnceSpy = this.spy(this.oSelectDialog._oDialog, "attachEventOnce");

			bindItems(this.oSelectDialog, {
				oData: this.mockupData,
				path: "/items",
				template: new StandardListItem({title: "{Title}", description: "{Description}", selected: "{Selected}"})
			});

			// Act
			this.oSelectDialog.open();
			this.clock.tick(350);

			this.oSelectDialog.getItems()[7].$().trigger("tap");
			this.clock.tick(350);

			// Assert
			assert.strictEqual(oAttachEventOnceSpy.callCount, 1, "_resetAfterClose was called once.");

			// Act
			this.oSelectDialog.open();
			this.clock.tick(350);

			this.oSelectDialog.getItems()[7].$().trigger("tap");
			this.clock.tick(350);

			// Assert
			assert.strictEqual(oAttachEventOnceSpy.callCount, 2, "_resetAfterClose was called twice.");

			// Act
			this.oSelectDialog.open();
			this.clock.tick(350);

			this.oSelectDialog.getItems()[0].$().trigger("tap");
			this.clock.tick(350);

			// Assert
			assert.strictEqual(oAttachEventOnceSpy.callCount, 3, "_resetAfterClose was called 3 times.");

			// Cleanup
			oAttachEventOnceSpy.restore();
		});

		QUnit.test("Multi select mode and item selection - _selectionChange", function (assert) {
			// Arrange
			var oUpdateSelectionSpy = this.spy(this.oSelectDialog, "_updateSelectionIndicator");
			var oDialogCloseSpy = this.spy(this.oSelectDialog._oDialog, "close");
			this.oSelectDialog.setMultiSelect(true);

			// Act
			this.oSelectDialog._selectionChange();

			// Assert
			assert.strictEqual(oUpdateSelectionSpy.callCount, 1, "Selection indicator was updated once.");
			assert.strictEqual(oDialogCloseSpy.callCount, 0, "Dialog close method was NOT called.");

			// Cleanup
			oUpdateSelectionSpy.restore();
			oDialogCloseSpy.restore();
		});

		QUnit.test("Destroy beginButton on selection mode change", function (assert) {
			// Arrange
			var oDialogDestroyBeginButtonSpy = this.spy(this.oSelectDialog._oDialog, "destroyBeginButton");
			this.oSelectDialog.setMultiSelect(true);

			// Assert
			assert.ok(this.oSelectDialog._oOkButton, "internal property _oOkButton should exist before deletion.");

			//Arrange
			this.oSelectDialog.setMultiSelect(false);

			// Assert
			assert.strictEqual(this.oSelectDialog._oOkButton, undefined, "internal property _oOkButton is undefined");
			assert.strictEqual(oDialogDestroyBeginButtonSpy.callCount, 1, "DestroyBeginButton method was called.");

			// Cleanup
			oDialogDestroyBeginButtonSpy.restore();
		});

		QUnit.test("Event delegates returned by _getListItemsEventDelegates should be the correct ones", function (assert) {
			// Arrange
			var oSelectionChangeSpy = this.spy(this.oSelectDialog, "_selectionChange"),
				oDelegates;

			// Act
			oDelegates = this.oSelectDialog._getListItemsEventDelegates();

			// Assert
			assert.strictEqual(oDelegates.hasOwnProperty("onsapselect"), true, "onsapselect is present in the returned delegates object.");
			assert.strictEqual(oDelegates.hasOwnProperty("ontap"), true, "ontap is present in the returned delegates object.");

			// Act
			oDelegates.onsapselect();

			// Assert
			assert.strictEqual(oSelectionChangeSpy.calledOnce, true, "Correct method was attached to onsapselect");

			// Act
			oDelegates.ontap();

			// Assert
			assert.deepEqual(oSelectionChangeSpy.calledTwice, true, "Correct method was attached to ontap");

			// Clean
			oSelectionChangeSpy.restore();
		});

		QUnit.module("Destroy", {
			beforeEach: function() {

				// arrange
				this.oSelectDialog = new SelectDialog('selectDialog');
				this.mockupData = generateData();
			}, afterEach: function() {

				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});

		QUnit.test("Destroy SelectDialog", function (assert) {
			var done = assert.async(),
				that = this;

			this.oSelectDialog.setMultiSelect(true);

			// init list
			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});

			// attach dialog close event
			this.oSelectDialog._oDialog.attachAfterClose(function () {
				// store poiners to internal controls
				var olist = that.oSelectDialog._oList,
					oSearchField = that.oSelectDialog._oSearchField,
					sSubHeader = that.oSelectDialog._oSubHeader,
					oBusyIndicator = that.oSelectDialog._oBusyIndicator,
					oDialog = that.oSelectDialog._oDialog,
					oOkButton = that.oSelectDialog._oOkButton;

				that.oSelectDialog.destroy();

				// check if internal controls are destroyed correctly (when initialized they must be destroyed)
				assert.strictEqual(that.oSelectDialog.$().length, 0, "There is no Domref for the SelectDialog");

				// check if all internal controls are destroyed successfully
				assert.strictEqual(olist.bIsDestroyed, true, "internal property _olist is destroyed successfully");
				assert.strictEqual(oSearchField.bIsDestroyed, true, "internal property _oSearchField is destroyed successfully");
				assert.strictEqual(sSubHeader.bIsDestroyed, true, "internal property _sSubHeader is destroyed successfully");
				assert.strictEqual(oBusyIndicator.bIsDestroyed, true, "internal property _oBusyIndicator is destroyed successfully");
				assert.strictEqual(oDialog.bIsDestroyed, true, "internal property _oDialog is destroyed successfully");
				assert.strictEqual(oOkButton.bIsDestroyed, true, "internal property _oOkButton is destroyed successfully");

				// check if all controls are set to null correctly
				assert.strictEqual(that.oSelectDialog._oList, null, "internal property _olist is null");
				assert.strictEqual(that.oSelectDialog._oSearchField, null, "internal property _oSearchField is null");
				assert.strictEqual(that.oSelectDialog._oSubHeader, null, "internal property _oSubHeader is null");
				assert.strictEqual(that.oSelectDialog._oBusyIndicator, null, "internal property _oBusyIndicator is null");
				assert.strictEqual(that.oSelectDialog._sSearchFieldValue, null, "internal property _sSearchFieldValue is null");
				assert.strictEqual(that.oSelectDialog._oDialog, null, "internal property _oDialog is null");
				assert.strictEqual(that.oSelectDialog._oOkButton, null, "internal property _oOkButton is null");
				assert.strictEqual(that.oSelectDialog._oSelectedItem, null, "internal property _oSelectedItem is null");
				assert.strictEqual(that.oSelectDialog._aSelectedItems, null, "internal property _aSelectedItems is null");

				// simple types
				assert.strictEqual(that.oSelectDialog._iListUpdateRequested, 0, "internal parameter _iListUpdateRequested is reset correctly");
				assert.strictEqual(that.oSelectDialog._bFirstRequest, false, "internal parameter _bFirstRequest is reset correctly");
				assert.strictEqual(that.oSelectDialog._bInitBusy, false, "internal parameter _bInitBusy is reset correctly");
				assert.strictEqual(that.oSelectDialog._bFirstRender, false, "internal parameter _bFirstRender is reset correctly");

				// compatibility pointers (these were renamed in release 1.20)
				assert.strictEqual(that.oSelectDialog._list, null, "internal compatibility parameter _list is null");
				assert.strictEqual(that.oSelectDialog._searchField, null, "internal compatibility parameter _searchField is null");
				assert.strictEqual(that.oSelectDialog._dialog, null, "internal compatibility parameter _dialog is null");
				done();
			});

			// simulate open and close
			this.oSelectDialog._oDialog.attachAfterOpen(function(oEvent) {
				that.oSelectDialog._oDialog.close();
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.test("Check add/remove/toggle/hasStyleClass methods", function (assert) {
			var	sCustomStyleClass = "myStyleClass";

			// add + has
			this.oSelectDialog.addStyleClass(sCustomStyleClass);
			this.oSelectDialog.open();
			assert.ok(this.oSelectDialog._oDialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog now has style class "' + sCustomStyleClass + '"');
			assert.ok(this.oSelectDialog.hasStyleClass(sCustomStyleClass), 'The SelectDialog now has style class "' + sCustomStyleClass + '"');

			// remove
			this.oSelectDialog.removeStyleClass(sCustomStyleClass);
			assert.ok(!this.oSelectDialog._oDialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog does not have style class "' + sCustomStyleClass + '" after remove');
			assert.ok(!this.oSelectDialog.hasStyleClass(sCustomStyleClass), 'The SelectDialog does not have style class "' + sCustomStyleClass + '" after remove');

			// toggle
			this.oSelectDialog.toggleStyleClass(sCustomStyleClass);
			assert.ok(this.oSelectDialog._oDialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog has style class "' + sCustomStyleClass + '" after toggle');
			assert.ok(this.oSelectDialog.hasStyleClass(sCustomStyleClass), 'The SelectDialog has style class "' + sCustomStyleClass + '" after toggle');

			this.oSelectDialog._oDialog.close();
			this.clock.tick(350);
		});

		QUnit.test("Check getDomRef method", function (assert) {
			this.oSelectDialog.open();

			// getDomRef
			assert.ok(this.oSelectDialog.getDomRef() instanceof Element && this.oSelectDialog.getDomRef().id === this.oSelectDialog.getId() + "-dialog", "The inner dialogs DOM reference is returned");

			this.oSelectDialog._oDialog.close();
			this.clock.tick(350);
		});

		QUnit.test("Check height of content", function(assert) {
			var done = assert.async(),
				that = this;

			this.oSelectDialog.setContentHeight("150px");
			sap.ui.getCore().applyChanges();

			this.oSelectDialog._oDialog.attachAfterOpen(function (oEvent) {
				assert.strictEqual(jQuery("#selectDialog-dialog-cont").height(), 150, "content in Dialog should have height of 150px.");
				assert.strictEqual(jQuery("#selectDialog-dialog-cont").height(), 150, "content in Dialog should have height of 150px.");
				that.oSelectDialog.setContentHeight("286px");
				sap.ui.getCore().applyChanges();

				var browserCalculatedHeight = Math.round(parseFloat(window.getComputedStyle(jQuery("#selectDialog-dialog-cont")[0]).height));
				assert.strictEqual(browserCalculatedHeight, 286, "content in Dialog should have height of 286px.");
				done();

				// Clean
				that.oSelectDialog._oDialog.close();
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.module("Keyboard and focus Handling", {
			beforeEach: function() {

				// arrange
				this.oSelectDialog = new SelectDialog('selectDialog');
				this.mockupData = generateData();
			}, afterEach: function() {

				// cleanup
				this.oSelectDialog.destroy();
				delete this.mockupData;
			}
		});


		QUnit.test("Initialfocus when there are no items in the SelectDialog's list", function (assert) {
			var oSystem = {
					desktop: true,
					phone: false,
					tablet: false
				},
				that = this;

			this.stub(Device, "system", oSystem);

			jQuery.when(that.oSelectDialog.open(), that.oSelectDialog._updateFinished() ).then(function(){
				assert.ok(jQuery('#selectDialog-searchField-I').is(":focus"), 'SearchField should be focused if there are no items in the list');

				that.oSelectDialog._oDialog.close();
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
		});

		QUnit.test("Initialfocus when there are items in the SelectDialog's list", function (assert) {
			var oSystem = {
					desktop: true,
					phone: false,
					tablet: false
				},
				that = this;

			this.stub(Device, "system", oSystem);

			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});
			sap.ui.getCore().applyChanges();

			jQuery.when(that.oSelectDialog.open(), that.oSelectDialog._updateFinished() ).then(function(){
				assert.ok(that.oSelectDialog.getItems()[0].$().is(':focus'), 'The first item of the list should be focused');

				// Clean
				that.oSelectDialog._oDialog.close();
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
		});

		QUnit.test("focus on SearchField after liveChange", function (assert) {
			var done = assert.async();

			// Arrange
			var fnFireLiveChangeSpy = sinon.spy(function(oEvent) {
				var sValue = oEvent.getParameter("value");
				var oFilter = new Filter("Title", FilterOperator.Contains, sValue);

				oEvent.getSource().getBinding("items").filter([oFilter]);
				sap.ui.getCore().applyChanges();

				assert.strictEqual(jQuery('#selectDialog-searchField-I')[0], document.activeElement, 'Focus should stay on the searchfield after liveChange');
				done();

			}),
			that = this;

			this.oSelectDialog.attachLiveChange(fnFireLiveChangeSpy);

			bindItems(this.oSelectDialog, {oData: this.mockupData, path: "/items", template: createTemplateListItem()});

			this.oSelectDialog._oDialog.attachAfterOpen(function(oEvent) {
				that.oSelectDialog._oSearchField.$('I').focus().val("1").trigger("input");
				that.clock.tick(350);
			});

			this.oSelectDialog.open();
			this.clock.tick(350);
		});

		QUnit.module("Clear functionality", {
			beforeEach : function () {

				//arrange
				sinon.config.useFakeTimers = true;
				this.oSelectDialog = new SelectDialog("clearButtonSelectDialog", {
				title: "Very very very very very very very very long title",
				multiSelect : true,
				rememberSelections: true,
				contentWidth: "200px",
				growing: false,
				showClearButton: true
				});

				this.mockupData = generateData();
				bindItems(this.oSelectDialog, { oData: this.mockupData, path: "/items", template: createTemplateListItem() });

				this.oSelectDialog1 = new SelectDialog("clearButtonSelectDialog1", {
				title: "Very very very very very very very very long title",
				multiSelect : true,
				rememberSelections: true,
				contentWidth: "200px",
				growing: false,
				showClearButton: true
				});

				bindItems(this.oSelectDialog1, { oData: {
					items : [
						{
							Title : "Title1",
							Description: "Description1",
							Selected: false
						}, {
							Title : "Title2",
							Description: "Description2",
							Selected: false
						}, {
							Title : "Title3",
							Description: "Description3",
							Selected: false
						}
					]
				}, path: "/items", template: createTemplateListItem() });

				this.oSelectDialog2 = new SelectDialog("clearButtonSelectDialog2", {
					title: "Select Dialog without Clear button",
					multiSelect : true,
					rememberSelections: true,
					contentWidth: "200px",
					growing: false
				});

				bindItems(this.oSelectDialog2, { oData: {
					items : [
						{
							Title : "Title4",
							Description: "Description4",
							Selected: false
						}, {
							Title : "Title5",
							Description: "Description5",
							Selected: false
						}, {
							Title : "Title6",
							Description: "Description6",
							Selected: false
						}
					]
				}, path: "/items", template: createTemplateListItem() });


			},
			afterEach : function () {

				//cleanup
				sinon.config.useFakeTimers = false;
				this.oSelectDialog.destroy();
				delete this.mockupData;
				this.oSelectDialog1.destroy();
				this.oSelectDialog2.destroy();
			}
		});

	QUnit.test("Initial loading with selected items from previous selection", function(assert) {
		this.oSelectDialog.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//assert
		assert.equal(this.oSelectDialog._getClearButton().getEnabled(), true, 'Clear button should be enabled');
	});

	QUnit.test("Initial loading without selected items from previous selection", function(assert) {
		this.oSelectDialog1.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//assert
		assert.equal(this.oSelectDialog1._getClearButton().getEnabled(), false, 'Clear button should be disabled');
	});

	QUnit.test("Removing selection should disable button", function(assert) {
		this.oSelectDialog.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//assert
		assert.equal(this.oSelectDialog._getClearButton().getEnabled(), true, 'Clear button should be enabled');

		//arrange
		this.oSelectDialog._removeSelection();
		this.oSelectDialog._updateSelectionIndicator();

		//assert
		assert.equal(this.oSelectDialog._getClearButton().getEnabled(), false, 'Clear button should be disabled');
	});

	QUnit.test("Adding selection should enable button", function(assert) {
		this.oSelectDialog1.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//assert
		assert.equal(this.oSelectDialog1._getClearButton().getEnabled(), false, 'Clear button should be disabled');

		//arrange
		this.oSelectDialog1._oList.getItems()[1].setSelected(true);
		this.oSelectDialog1._updateSelectionIndicator();

		assert.equal(this.oSelectDialog1._oClearButton.getEnabled(), true, 'Clear button should be enabled');
	});

	QUnit.test("Clicking on enabled 'Clear' button should clear selection", function(assert) {
		this.oSelectDialog.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//assert
		assert.equal(this.oSelectDialog._oClearButton.getEnabled(), true, 'Clear button should be enabled');

		//arrange
		this.oSelectDialog._oClearButton.firePress();

		//assert
		assert.equal(this.oSelectDialog._oClearButton.getEnabled(), false, 'Clear button should be disabled');
		assert.equal(this.oSelectDialog._oList.getSelectedItems().length, 0, 'There should be no selected items');
	});
	QUnit.test("Disable already enabled clear button and then enable it again", function(assert) {
		this.oSelectDialog.open();

		sap.ui.getCore().applyChanges();

		var oCustomHeader = this.oSelectDialog._oDialog.getCustomHeader();
		var oClearButton = this.oSelectDialog._getClearButton();
		this.oSelectDialog.setShowClearButton(false);
		sap.ui.getCore().applyChanges();


		//assert
		assert.equal(oClearButton.getVisible(), false, 'Clear button is not visible');
		assert.notOk(oClearButton.getDomRef(), 'Clear button is not in dom');

		this.oSelectDialog.setShowClearButton(true);
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(oClearButton.getVisible(), true, 'Clear button is not visible');
		assert.ok(oClearButton.getDomRef(), 'Clear button is in dom');
		assert.equal(oClearButton.getProperty("text"), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SELECTDIALOG_CLEARBUTTON"), 'Text of clear button is set');
	});

	QUnit.test("There is no content in the contentRight aggregation of the header", function(assert) {
		this.oSelectDialog2.open();

		sap.ui.getCore().applyChanges();

		var oCustomHeader = this.oSelectDialog2._oDialog.getCustomHeader();
		var oClearButton = this.oSelectDialog2._getClearButton();
		assert.equal(oCustomHeader.getContentRight().length,  0, 'Clear button is not created');

		this.oSelectDialog2.setShowClearButton(false);
		sap.ui.getCore().applyChanges();

		assert.equal(oCustomHeader.getContentRight().length,  0, 'Clear button is not created');

		this.oSelectDialog2.setShowClearButton(true);
		sap.ui.getCore().applyChanges();

		assert.equal(oClearButton.getVisible(), true, 'Clear button is visible');
		assert.ok(oClearButton.getDomRef(), 'Clear button is in dom');
	});

	QUnit.test("After selection reset the focus should be returned to the dialog", function(assert) {
		this.oSelectDialog.open();
		sap.ui.getCore().applyChanges();

		this.oSelectDialog._oClearButton.firePress();
		assert.equal(document.activeElement.getAttribute("id"), this.oSelectDialog._oDialog.getId(), 'After selection is reset the focus should be returned to the dialog"');
	});

	QUnit.test("Clear button pressed should fire search event with the correct clearButtonPressed value passed from SearchField", function (assert) {
		// Arrange
		var fnFireSelectSpy = sinon.spy(this.oSelectDialog, 'fireSearch'),
			that = this;

		jQuery.when(this.oSelectDialog.open()).then(function () {
			// Act
			that.oSelectDialog._oSearchField.fireSearch({clearButtonPressed: true});

			// Assert
			assert.strictEqual(fnFireSelectSpy.callCount, 1, 'Search event is fired once');
			assert.strictEqual(fnFireSelectSpy.args[0][0].clearButtonPressed, true, 'Search event is fired with the correct clearButtonPressed value');
		});
	});

	QUnit.module("Search", {
		beforeEach: function() {

			 var _handleValueHelpSearch =  function (evt) {
				var sValue = evt.getParameter("value");
				var oFilter = new Filter(
					"Title",
					FilterOperator.Contains,
					sValue
				);
				evt.getSource().getBinding("items").filter([oFilter]);
			};
			// arrange
			this.oSelectDialog = new SelectDialog("clearButtonSelectDialog1", {
				title: "Very title",
				multiSelect : true,
				rememberSelections: true,
				contentWidth: "200px",
				search: _handleValueHelpSearch
			});

			bindItems(this.oSelectDialog, { oData: {
				items : [
					{
						Title : "Title1",
						Description: "Description4",
						Selected: true
					}, {
						Title : "Test",
						Description: "Description4",
						Selected: false
					}, {
						Title : "Title3",
						Description: "Description4",
						Selected: false
					}
				]
			}, path: "/items", template: createTemplateListItem() });
		}, afterEach: function() {
			// cleanup
			this.oSelectDialog.destroy();
		}
	});

	QUnit.test("Selected items after search have to be all the selected items", function (assert) {
		// Arrange
		var that = this,
			done = assert.async();

		this.oSelectDialog.attachConfirm(function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems");

			assert.strictEqual(aSelectedItems.length, 2, '2 items where selected');
			done();
		});

		jQuery.when(this.oSelectDialog.open()).then(function () {
			// Act
			that.oSelectDialog._executeSearch("Tes", false, "search");
			that.oSelectDialog.getItems()[0].setSelected(true);
			that.oSelectDialog._getOkButton().firePress();
		});


	});
});
