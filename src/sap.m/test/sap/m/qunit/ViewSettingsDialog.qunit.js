/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/FilterOperator",
	"sap/m/VBox",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Slider",
	"sap/ui/model/json/JSONModel",
	"sap/m/ViewSettingsCustomTab",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ViewSettingsItem",
	"sap/m/ViewSettingsFilterItem",
	"sap/m/ViewSettingsCustomItem",
	"sap/m/ViewSettingsDialog",
	"jquery.sap.global",
	"sap/m/Input",
	"sap/ui/base/ManagedObject",
	"sap/base/Log",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	FilterOperator,
	VBox,
	Label,
	mobileLibrary,
	Slider,
	JSONModel,
	ViewSettingsCustomTab,
	Button,
	CheckBox,
	ViewSettingsItem,
	ViewSettingsFilterItem,
	ViewSettingsCustomItem,
	ViewSettingsDialog,
	jQuery,
	Input,
	ManagedObject,
	Log,
	waitForThemeApplied
) {
	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.StringFilterOperator
	var StringFilterOperator = mobileLibrary.StringFilterOperator;

	// shortcut for sap.m.LabelDesign
	var LabelDesign = mobileLibrary.LabelDesign;

	createAndAppendDiv("content");



	var Log = sap.ui.require("sap/base/Log");


	/* definition of a custom control */

	var customPriceFilter = new VBox({
		items: [
			new Label("minLabel", {
				design: LabelDesign.Bold,
				text: "Minimum price:"
			}),
			new Slider("minSlider", {
				value: 0,
				min: 0,
				max: 100,
				step: 10,
				progress: true,
				liveChange: function (oEvent) {
					oEvent.getSource().getParent().getItems()[0].setText("Minimum price >= " + oEvent.getParameter("value"));
				}
			}),
			new Label("maxLabel", {
				design: LabelDesign.Bold,
				text: "Maximum price:"
			}),
			new Slider("maxSlider", {
				value: 100,
				min: 0,
				max: 100,
				step: 10,
				progress: true,
				liveChange: function (oEvent) {
					oEvent.getSource().getParent().getItems()[2].setText("Maximum price <= " + oEvent.getParameter("value"));
				}
			})
		]
	}).addStyleClass("customPriceFilter");

	/* helper function to compare the filter state */

	var compareFilterKeys = function(o1, o2) {
		var sKey = "",
			result = true;

		for (sKey in o1) {
			if (o1.hasOwnProperty(sKey)) {
				if (!o2[sKey] || o2[sKey] !== o1[sKey]) {
					result = false;
				}
			}
		}
		for (sKey in o2) {
			if (o2.hasOwnProperty(sKey)) {
				if (!o1[sKey] || o1[sKey] !== o2[sKey]) {
					result = false;
				}
			}
		}
		return result;
	};

	var model = new JSONModel();
	model.setData({
		customTabData : {
			checkbox_label : "lorem ipsum checkbox label"
		}
	});
	sap.ui.getCore().setModel(model);

	var oVsdConfig = {
		// Factory for the 'content' aggregation for custom tabs - with or without items in it.
		customTabsFactory: function (sId, bEmptyContent) {
			var oInst = new ViewSettingsCustomTab({
				id	 	: sId,
				title	: sId,
				content : []
			});
			if (!bEmptyContent) {
				oInst.addContent( new Button({
					text: 'test'
				}));
				oInst.addContent( new CheckBox({
					name: 'test',
					text: '{/customTabData/checkbox_label}'
				}));
			}
			return oInst;
		},

		addSortItems: function (oVsdInst) {
			oVsdInst.addSortItem(new ViewSettingsItem({
				key: "myNameSorter",
				text: "Name"
			}));
			oVsdInst.addSortItem(new ViewSettingsItem({
				key: "myStatusSorter",
				text: "Status"
			}));
			oVsdInst.addSortItem(new ViewSettingsItem({
				key: "myValueSorter",
				text: "Value"
			}));
			oVsdInst.addSortItem(new ViewSettingsItem({
				key: "myPriceSorter",
				text: "Price"
			}));
		},

		addFilterItems: function (oVsdInst) {
			oVsdInst.addFilterItem(new ViewSettingsFilterItem({
				key: "myNameFilter",
				text: "Name",
				items: [
					new ViewSettingsItem({
						key: "name1",
						text: "Headphone"
					}),
					new ViewSettingsItem({
						key: "name2",
						text: "Mousepad"
					}),
					new ViewSettingsItem({
						key: "name3",
						text: "Monitor"
					}),
					new ViewSettingsItem({
						key: "name4",
						text: "Backpack"
					}),
					new ViewSettingsItem({
						key: "name5",
						text: "Printer"
					}),
					new ViewSettingsItem({
						key: "name6",
						text: "Optic Mouse"
					}),
					new ViewSettingsItem({
						key: "name7",
						text: "Dock Station"
					})
				]
			}));

			oVsdInst.addFilterItem(new ViewSettingsFilterItem({
				key: "myStatusFilter",
				text: "Status",
				items: [
					new ViewSettingsItem({
						key: "status1",
						text: "Approved"
					}),
					new ViewSettingsItem({
						key: "status2",
						text: "Open"
					}),
					new ViewSettingsItem({
						key: "status3",
						text: "Denied"
					})
				]
			}));

			oVsdInst.addFilterItem(new ViewSettingsFilterItem({
				key: "myValueFilter",
				text: "Value",
				items: [
					new ViewSettingsItem({
						key: "value1",
						text: "< 10 EUR"
					}),
					new ViewSettingsItem({
						key: "value2",
						text: "10 - 30 EUR"
					}),
					new ViewSettingsItem({
						key: "value3",
						text: "30 - 50 EUR"
					}),
					new ViewSettingsItem({
						key: "value4",
						text: "50 - 70 EUR"
					}),
					new ViewSettingsItem({
						key: "value5",
						text: "> 70 EUR"
					})
				]
			}));

			// custom price control filter
			oVsdInst.addFilterItem(new ViewSettingsCustomItem({
				key: "myPriceFilter",
				text: "Price",
				customControl: customPriceFilter.clone()
			}));


			oVsdInst.addFilterItem(new ViewSettingsFilterItem({
				key: "myValueFilter",
				text: "Empty Filter"
			}));

			oVsdInst.addFilterItem(new ViewSettingsFilterItem({
				key: "myNameFilter2",
				text: "Name with no multiselect",
				multiSelect: false,
				items: [
					new ViewSettingsItem({
						key: "name21",
						text: "Headphone"
					}),
					new ViewSettingsItem({
						key: "name22",
						text: "Mousepad"
					}),
					new ViewSettingsItem({
						key: "name23",
						text: "Monitor"
					}),
					new ViewSettingsItem({
						key: "name24",
						text: "Backpack"
					}),
					new ViewSettingsItem({
						key: "name25",
						text: "Printer"
					}),
					new ViewSettingsItem({
						key: "name26",
						text: "Optic Mouse"
					}),
					new ViewSettingsItem({
						key: "name27",
						text: "Dock Station"
					})
				]
			}));
		},

		addPresetFilterItems: function(oVsdInst) {
			// preset filters
			oVsdInst.addPresetFilterItem(new ViewSettingsItem({
				key: "myPresetFilter1",
				text: "A very complex filter"
			}));
			oVsdInst.addPresetFilterItem(new ViewSettingsItem({
				key: "myPresetFilter2",
				text: "Ridiculously complex filter"
			}));
			oVsdInst.addPresetFilterItem(new ViewSettingsItem({
				key: "myPresetFilter3",
				text: "Expensive stuff"
			}));
		},

		addGroupItems: function (oVsdInst) {
			// init grouping (some simple sorters with default grouping and some with a custom grouping)
			oVsdInst.addGroupItem(new ViewSettingsItem({
				key: "myNameGrouper",
				text: "Name"
			}));
			oVsdInst.addGroupItem(new ViewSettingsItem({
				key: "myStatusGrouper",
				text: "Status"
			}));
			oVsdInst.addGroupItem(new ViewSettingsItem({
				key: "myValueGrouper",
				text: "Value"
			}));
			oVsdInst.addGroupItem(new ViewSettingsItem({
				key: "myPriceGrouper",
				text: "Price"
			}));

		}
	};

	QUnit.module("Initial Check", {
		beforeEach : function () {
			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this.oVSD = new ViewSettingsDialog();
			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Initialization", function (assert) {
		assert.ok(!jQuery.sap.domById(this.oVSD.getId()), "Dialog is not rendered before it's ever opened.");
		assert.strictEqual(this.oVSD.getTitle(), "", 'The default title is empty and will be filled by "' + this.oResourceBundle.getText("VIEWSETTINGS_TITLE") + '" later');
		assert.strictEqual(this.oVSD.getSortDescending(), false, 'The default value for sortDescending should be "false"');
		assert.strictEqual(this.oVSD.getGroupDescending(), false, 'The default value for groupDescending should be "false"');
		assert.strictEqual(this.oVSD.getSelectedSortItem(), null, 'The default value for selectedSortItem should be "null"');
		assert.strictEqual(this.oVSD.getSelectedGroupItem(), null, 'The default value for selectedGroupItem should be "null"');
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), null, 'The default value for selectedPresetFilterItem should be "null"');
	});

	QUnit.module("States", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();
			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});


	QUnit.test("Setting busy state", function (assert) {
		var done = assert.async();

		this.oVSD.open();
		setTimeout(function() {
			assert.strictEqual(this.oVSD.$().find('.sapUiLocalBusyIndicator').length, 0, 'No busy indicator is shown');

			this.oVSD.setBusy(true);

			setTimeout(function() {
				assert.strictEqual(this.oVSD.$().find('.sapUiLocalBusyIndicator').length, 1,'Busy indicator is shown');

				this.oVSD.setBusy(false);
				assert.strictEqual(this.oVSD.$().find('.sapUiLocalBusyIndicator').length, 0, 'No busy indicator is shown');

				this.oVSD.exit();
				done();
			}.bind(this), 1000);
		}.bind(this), 10);
	});

	QUnit.module("getter/setter", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();
			this.oFilterState = {
				"name1": true,
				"name2": true,
				"name5": true,
				"name6": true,
				"status1": true,
				"status2": true,
				"status3": true,
				"value3": true
			};

			oVsdConfig.addSortItems(this.oVSD);
			oVsdConfig.addFilterItems(this.oVSD);
			oVsdConfig.addPresetFilterItems(this.oVSD);
			oVsdConfig.addGroupItems(this.oVSD);

			this.oSelectedSortItem = this.oVSD.getSortItems()[0];
			this.oSelectedGroupItem = this.oVSD.getGroupItems()[1];
			this.oSelectedPresetFilterItem = this.oVSD.getPresetFilterItems()[1];

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("set dialog state via API", function (assert) {
		var oCore = sap.ui.getCore();

		/* set dialog state (solely by API instead of selected flag) */
		this.oVSD.setTitle("TestTitle");
		this.oVSD.setSelectedSortItem(this.oSelectedSortItem);
		this.oVSD.setSortDescending(true);
		this.oVSD.setSelectedGroupItem(this.oSelectedGroupItem);
		this.oVSD.setGroupDescending(true);
		this.oVSD.setSelectedPresetFilterItem(this.oSelectedPresetFilterItem);

		// title
		assert.strictEqual(this.oVSD.getTitle(), "TestTitle", "The title should be 'TestTitle'");

		// sort / group / preset filter
		assert.strictEqual(this.oVSD.getSelectedSortItem(), this.oSelectedSortItem.getId(), "The selected sort item should be '" + this.oSelectedSortItem.getId() + "'");
		assert.strictEqual(oCore.byId(this.oVSD.getSelectedSortItem()).getSelected(), true, "The selected sort item should have the selected flag set to true");
		assert.strictEqual(this.oVSD.getSortDescending(), true, "sort descending should now be true");
		assert.strictEqual(this.oVSD.getSelectedGroupItem(), this.oSelectedGroupItem.getId(), "The selected group item should be '" + this.oSelectedGroupItem.getId() + "'");
		assert.strictEqual(oCore.byId(this.oVSD.getSelectedGroupItem()).getSelected(), true, "The selected group item should have the selected flag set to true");
		assert.strictEqual(this.oVSD.getGroupDescending(), true, "group descending should now be true");
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), this.oSelectedPresetFilterItem.getId(), "The selected preset filter item should be '" + this.oSelectedPresetFilterItem.getId() + "'");
		assert.strictEqual(oCore.byId(this.oVSD.getSelectedPresetFilterItem()).getSelected(), true, "The selected preset filter item should have the selected flag set to true");

		// filters
		this.oVSD.setSelectedFilterKeys(this.oFilterState);
		assert.ok(compareFilterKeys(this.oFilterState, this.oVSD.getSelectedFilterKeys()), "The computed filter keys should have the same structure as the passed one");

		this.oVSD.setSelectedPresetFilterItem(null);
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), null, "The selected preset filter item should be null");
	});

	QUnit.test("setSelectedSortItem via string key throws error if the key is wrong, but does not prevent dialog open", function (assert) {
		assert.ok(Log, "Log module should be available");
		var oErrorLogSpy = sinon.spy(Log, "error"),
			sErrorMessage,
			sNonExistentItemKey = "non_existent_key";

		//act
		this.oVSD.setSelectedSortItem(sNonExistentItemKey);
		//assert
		assert.strictEqual(oErrorLogSpy.callCount, 1, "Item could not be set");
		sErrorMessage = oErrorLogSpy.args[0][0];
		assert.ok(sErrorMessage.indexOf(sNonExistentItemKey) > -1, "Error message shows the item key which is problematic");

		//act
		this.oVSD.open();
		//assert
		assert.ok(this.oVSD._getDialog().isOpen(), "Dialog is still functional");

		//clean
		Log.error.restore();
	});

	QUnit.test("setSelectedSortItem does not throw error if the item is null or undefined", function (assert) {
		assert.ok(Log, "Log module should be available");
		var oErrorLogSpy = sinon.spy(Log, "error");

		//act
		this.oVSD.setSelectedSortItem(undefined);
		//assert
		assert.strictEqual(oErrorLogSpy.callCount, 0, "setSelectedSortItem does not throw an error.");

		//clean
		Log.error.restore();
	});

	QUnit.test("setFilter count doe not throw an error when filter item type is sap.m.ViewSettingsCustomItem", function (assert) {
		var done = assert.async(),
				oVSD = new ViewSettingsDialog({
					filterItems: [
						new ViewSettingsCustomItem({
							text: "Material",
							key: "MaterialID",
							customControl: new Input({width: "100%", placeholder: "{i18n>ENTER_FILTER}"})
						}),
						new ViewSettingsCustomItem({
							text: "Material Description",
							key: "MaterialDescription",
							customControl: new Input({width: "100%", placeholder: "{i18n>ENTER_FILTER}"})
						})
					],
					confirm: function () {
						var oItem0 = oVSD.getFilterItems()[0];
						oItem0.setFilterCount(1);
						oItem0.setSelected(true);

						assert.strictEqual(oItem0.getFilterCount(), 1, "To have set filter count properly");
						assert.strictEqual(oItem0.getSelected(), true, "To set property selected to TRUE");

						oVSD.destroy();
						oVSD = null;
						done();
					}
				});

		oVSD.open();
		oVSD._filterList.getItems()[0].firePress();
		oVSD._dialog.getBeginButton().firePress();
	});

	QUnit.module("Performance", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();
			this.oFilterState = {
				"name1": true,
				"name2": true,
				"name5": true,
				"name6": true,
				"status1": true,
				"status2": true,
				"status3": true,
				"value3": true
			};

			oVsdConfig.addSortItems(this.oVSD);
			oVsdConfig.addFilterItems(this.oVSD);
			oVsdConfig.addPresetFilterItems(this.oVSD);
			oVsdConfig.addGroupItems(this.oVSD);

			this.oSelectedSortItem = this.oVSD.getSortItems()[0];
			this.oSelectedGroupItem = this.oVSD.getGroupItems()[1];
			this.oSelectedPresetFilterItem = this.oVSD.getPresetFilterItems()[1];

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("The control is not invalidated on setting sort, group or filter Items", function (assert) {

		sinon.spy(this.oVSD, "invalidate");

		this.oVSD.setSelectedSortItem(this.oSelectedSortItem);

		assert.ok(!this.oVSD.invalidate.called, "The control is not invalidated on setting selected Sort Item");

		this.oVSD.setSelectedGroupItem(this.oSelectedGroupItem);
		assert.ok(!this.oVSD.invalidate.called, "The control is not invalidated on setting selected Group Item");

		this.oVSD.setSelectedPresetFilterItem(this.oSelectedPresetFilterItem);
		assert.ok(!this.oVSD.invalidate.called, "The control is not invalidated on setting preset Filter Item");

		this.oVSD.setSelectedFilterKeys(this.oFilterState);
		assert.ok(!this.oVSD.invalidate.called, "The control is not invalidated on setting Filter keys");

		this.oVSD.invalidate.restore();
	});

	QUnit.module("Open and Close", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();

			oVsdConfig.addSortItems(this.oVSD);
			oVsdConfig.addFilterItems(this.oVSD);
			oVsdConfig.addPresetFilterItems(this.oVSD);

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Open ViewSettingsDialog", function (assert) {
		var sId = this.oVSD.getId();
		this.oVSD.open();

		assert.ok(jQuery.sap.domById(sId + "-dialog"), "Dialog should be rendered");
		assert.ok(jQuery.sap.domById(sId + "-navcontainer"), "Nav container should be rendered");
		assert.ok(jQuery.sap.domById(sId + "-page1-cont"), "Page 1 (sort/group/filter content) should be rendered");
		assert.ok(!jQuery.sap.domById(sId + "-page2-cont"), "Page 2 (filter detail content) should not be rendered");
		assert.ok(jQuery.sap.byId(sId + "-sortbutton").hasClass("sapMSegBBtnSel"), "Segmented 'sort' button should be selected");
	});

	QUnit.test("Open predefined tab", function(assert){
		this.oVSD.open("filter");

		assert.ok(jQuery.sap.byId(this.oVSD.getId() + "-filterbutton").hasClass("sapMSegBBtnSel"), "Segmented 'filter' button should be selected");
	});

	QUnit.test("Close ViewSettingsDialog", function (assert) {
		var done = assert.async(),
			that = this;

		this.oVSD.open();
		this.oVSD._dialog.close();
		setTimeout(function() {
			assert.ok(!that.oVSD._dialog.isOpen(), "Dialog should be in closed state");
			done();
		}, 1000);
	});
	QUnit.module("Last Opened Page", {
/* The use of sinon clock requires isolated environment, otherwise it will interfere the async tests */
		beforeEach: function () {
			this.oVSD = new ViewSettingsDialog();
			oVsdConfig.addFilterItems(this.oVSD);
			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Last Opened Page is correct on Cancel on second opening of the filter detail view", function (assert) {
		function openAndNavigateToFilterDetailsPage(oVSD) {
			oVSD.open("filter");
			var oItem = oVSD._filterList.getItems()[1].data("item"); //since the header is the 0 element, get the actual first item
			//this is a simulation of click on the single filter item, that provokes slide to the nav container's page2
			oVSD._switchToPage(3, oItem);
			oVSD._prevSelectedFilterItem = oItem;
			oVSD._navContainer.to(oVSD.getId() + '-page2', "slide");
		}

		openAndNavigateToFilterDetailsPage(this.oVSD);
		sap.ui.getCore().applyChanges();

		this.oVSD._filterDetailList.getItems()[0].data("item").setSelected(true);
		this.oVSD._dialog.getBeginButton().firePress();
		sap.ui.getCore().applyChanges();

		openAndNavigateToFilterDetailsPage(this.oVSD);
		sap.ui.getCore().applyChanges();

		this.oVSD._filterDetailList.getItems()[1].data("item").setSelected(true);
		this.oVSD._dialog.getEndButton().firePress();
		sap.ui.getCore().applyChanges();

		this.oVSD.open("filter");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		setTimeout(function () {
			assert.equal(this.oVSD._navContainer.getCurrentPage().getId(), this.oVSD._getPage1().getId(), "NavContainer should be on the first page");
			done();
		}.bind(this), 1750);
	});

	QUnit.module("Events", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();
			this.oFilterState = {
				"name1": true,
				"name2": true,
				"name5": true,
				"name6": true,
				"status1": true,
				"status2": true,
				"status3": true,
				"value3": true
			};

			oVsdConfig.addSortItems(this.oVSD);
			oVsdConfig.addFilterItems(this.oVSD);
			oVsdConfig.addPresetFilterItems(this.oVSD);
			oVsdConfig.addGroupItems(this.oVSD);

			this.oSelectedSortItem = this.oVSD.getSortItems()[0];
			this.oSelectedGroupItem = this.oVSD.getGroupItems()[1];
			this.oSelectedPresetFilterItem = this.oVSD.getPresetFilterItems()[1];

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("ViewSettingsFilterItem event handlers are attached", function (assert) {
		var oVSD = new ViewSettingsDialog(),
				oVSItem = new ViewSettingsItem({
					key: "name1",
					text: "Headphone"
				}),
				oVSFilterItem1 = new ViewSettingsFilterItem({
					key: "myNameFilter",
					text: "Name",
					items: [oVSItem]
				}),
				oVSFilterItem2 = oVSFilterItem1.clone();

		//Assert
		assert.ok(!oVSFilterItem1.hasListeners("itemPropertyChanged"), "Initially no 'itemPropertyChanged' event handler should be attached to the ViewSettingsFilterItem 1");
		assert.ok(!oVSFilterItem2.hasListeners("itemPropertyChanged"), "Initially no 'itemPropertyChanged' event handler should be attached to the ViewSettingsFilterItem 2");

		assert.ok(!oVSFilterItem1.hasListeners("filterDetailItemsAggregationChange"), "Initially no 'filterDetailItemsAggregationChange' event handler should be attached to the ViewSettingsFilterItem 1");
		assert.ok(!oVSFilterItem2.hasListeners("filterDetailItemsAggregationChange"), "Initially no 'filterDetailItemsAggregationChange' event handler should be attached to the ViewSettingsFilterItem 2");

		//Act
		oVSD.addFilterItem(oVSFilterItem1);

		//Assert
		assert.ok(oVSFilterItem1.hasListeners("itemPropertyChanged"), "addFilterItem should attach 'itemPropertyChanged' event handler to the ViewSettingsFilterItem");
		assert.ok(oVSFilterItem1.hasListeners("filterDetailItemsAggregationChange"), "addFilterItem should attach 'filterDetailItemsAggregationChange' event handler to the ViewSettingsFilterItem");

		//Act
		oVSD.insertFilterItem(oVSFilterItem2);

		//Assert
		assert.ok(oVSFilterItem2.hasListeners("itemPropertyChanged"), "insertFilterItem should attach 'itemPropertyChanged' event handler to the ViewSettingsFilterItem");
		assert.ok(oVSFilterItem2.hasListeners("filterDetailItemsAggregationChange"), "insertFilterItem should attach 'filterDetailItemsAggregationChange' event handler to the ViewSettingsFilterItem");

		oVSD.destroy();
	});


	QUnit.test("Cancel on cancel button press event", function (assert){
		var core = sap.ui.getCore(),
				done = assert.async(),
				that = this,
				fnChecks = function () {
					// check if dialog is still in the previous state
					assert.ok(true, "Event cancel was fired");
					assert.strictEqual(this.getSelectedSortItem(), that.oSelectedSortItem.getId(), "The selected sort item should be '" + that.oSelectedSortItem.getId() + "'");
					assert.strictEqual(core.byId(this.getSelectedSortItem()).getSelected(), true, "The selected sort item should have the selected flag set to true");
					assert.strictEqual(this.getSortDescending(), true, "sort descending should now be true");
					assert.strictEqual(this.getSelectedGroupItem(), that.oSelectedGroupItem.getId(), "The selected group item should be '" + that.oSelectedGroupItem.getId() + "'");
					assert.strictEqual(core.byId(this.getSelectedGroupItem()).getSelected(), true, "The selected group item should have the selected flag set to true");
					assert.strictEqual(this.getGroupDescending(), true, "group descending should now be true");
					assert.ok(compareFilterKeys(that.oFilterState, this.getSelectedFilterKeys()), "The computed filter keys should have the same structure as the passed one");
					this.detachCancel(fnChecks);
					done();
				};

		this.oVSD.setSelectedSortItem(this.oSelectedSortItem);
		this.oVSD.setSelectedGroupItem(this.oSelectedGroupItem);
		this.oVSD.setSortDescending(true);
		this.oVSD.setGroupDescending(true);
		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		// open dialog to store previous state
		this.oVSD.open();
		this.oVSD.attachCancel(fnChecks);

		// set everything to unselected / false and fire cancel request
		this.oVSD.setSelectedSortItem();
		this.oVSD.setSortDescending(false);
		this.oVSD.setSelectedGroupItem();
		this.oVSD.setGroupDescending(false);
		this.oVSD.setSelectedFilterKeys([]);
		//press cancel
		this.oVSD._dialog.getEndButton().firePress();
	});


	QUnit.test("Cancel on key ESCAPE event", function (assert){
		var core = sap.ui.getCore(),
			that = this,
			done = assert.async(),
			fnChecks = function () {
				// check if dialog is still in the previous state
				assert.ok(true, "Event cancel was fired");
				assert.strictEqual(this.getSelectedSortItem(), that.oSelectedSortItem.getId(), "The selected sort item should be '" + that.oSelectedSortItem.getId() + "'");
				assert.strictEqual(core.byId(this.getSelectedSortItem()).getSelected(), true, "The selected sort item should have the selected flag set to true");
				assert.strictEqual(this.getSortDescending(), true, "sort descending should now be true");
				assert.strictEqual(this.getSelectedGroupItem(), that.oSelectedGroupItem.getId(), "The selected group item should be '" + that.oSelectedGroupItem.getId() + "'");
				assert.strictEqual(core.byId(this.getSelectedGroupItem()).getSelected(), true, "The selected group item should have the selected flag set to true");
				assert.strictEqual(this.getGroupDescending(), true, "group descending should now be true");
				assert.ok(compareFilterKeys(that.oFilterState, this.getSelectedFilterKeys()), "The computed filter keys should have the same structure as the passed one");
				this.detachCancel(fnChecks);
				done();
			};

		this.oVSD.setSelectedSortItem(this.oSelectedSortItem);
		this.oVSD.setSelectedGroupItem(this.oSelectedGroupItem);
		this.oVSD.setSortDescending(true);
		this.oVSD.setGroupDescending(true);
		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		// open dialog to store previous state
		this.oVSD.open();
		this.oVSD.attachCancel(fnChecks);

		// set everything to unselected / false and fire ESC key
		this.oVSD.setSelectedSortItem();
		this.oVSD.setSortDescending(false);
		this.oVSD.setSelectedGroupItem();
		this.oVSD.setGroupDescending(false);
		this.oVSD.setSelectedFilterKeys([]);
		sap.ui.test.qunit.triggerKeydown(this.oVSD._getDialog().getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
	});


	QUnit.test("Back on key [SHIFT]+[ENTER] event", function (assert) {
		this.oVSD.open();

		this.oVSD._switchToPage(0);
		this.oVSD._switchToPage(1);
		this.oVSD._switchToPage(2);
		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3,this.oVSD.getFilterItems()[0]); // name details page

		sap.ui.test.qunit.triggerKeyboardEvent(this.oVSD._getDialog().getDomRef(), jQuery.sap.KeyCodes.ENTER, true, false, false);
		assert.equal(this.oVSD._vContentPage, 2, "Internal page state should be on the second page");
		assert.equal(this.oVSD._navContainer.getCurrentPage(), this.oVSD._getPage1(), "NavContainer should be on the first page");
	});


	QUnit.test("Confirm event", function (assert){
		var done = assert.async(),
			that = this;

		this.oVSD.setSelectedSortItem(this.oSelectedSortItem);
		this.oVSD.setSelectedGroupItem(this.oSelectedGroupItem);
		this.oVSD.setSortDescending(true);
		this.oVSD.setGroupDescending(true);
		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		// open dialog to store previous state
		this.oVSD.open();
		this.oVSD.attachConfirm(function(oEvent) {
			var oParams = oEvent.getParameters();
			assert.ok(oParams, "Event applySettings was fired and has event parameters");
			assert.ok(oParams.sortItem, "Event has a sort item");
			assert.ok(oParams.groupItem, "Event has a group item");
			assert.ok(oParams.sortDescending, "Event has sort order true");
			assert.strictEqual(oParams.sortItem.getId(), that.oSelectedSortItem.getId(), "The selected sort item should be '" + that.oSelectedSortItem.getId() + "'");
			assert.strictEqual(oParams.sortDescending, true, "Sort descending should be true");
			assert.strictEqual(oParams.groupItem.getId(), that.oSelectedGroupItem.getId(), "The selected group item should be '" + that.oSelectedGroupItem.getId() + "'");
			assert.strictEqual(oParams.groupDescending, true, "group descending should be true");
			assert.strictEqual(oParams.selectedPresetFilterItem, undefined, "The selected preset filter item should be 'undefined'");
			assert.ok(compareFilterKeys(that.oFilterState, oParams.filterKeys), "The event filter keys should have the same structure as the passed one");
			assert.ok(oParams.filterString.length > 0, "The filter string is not empty");
			assert.strictEqual(oParams.filterItems.length, 8, "There are 8 selected filters");
			done();
		});

		//Act
		this.oVSD._dialog.getBeginButton().firePress();
	});

	QUnit.test("Reset event", function (assert) {
		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		assert.strictEqual(this.oVSD.getSelectedFilterItems().length, 8, "Selected filters are 8 before reset event");

		this.oVSD.open();
		this.oVSD.attachResetFilters(function(oEvent) {
			assert.strictEqual(this.getSelectedFilterItems().length, 0, "Selected filters are empty after reset event");
			assert.strictEqual(this.getSelectedPresetFilterItem(), null, "Preset filter item is null after reset event");
		});

		this.oVSD._resetButton.firePress();
	});

	QUnit.test("filterDetailPageOpened event", function (assert) {
		var done = assert.async(),
			oFilterItem = this.oVSD.getFilterItems()[0];

		assert.strictEqual(typeof this.oVSD.fireFilterDetailPageOpened, 'function', 'fireFilterDetailPageOpened exists');

		var fnFireItemPressSpy = sinon.spy(this.oVSD, "fireFilterDetailPageOpened");

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, oFilterItem); // name details page


		setTimeout(function() {
			assert.strictEqual(fnFireItemPressSpy.calledOnce, true, "filterDetailPageOpened event is fired when filter detial page is opened");
			done();
		}, 10);
	});

	QUnit.test("Grouping items selection", function (assert) {
		var sSelectedGroupItem,
			clock = sinon.useFakeTimers(),
			fnOnConfirmObject = sinon.spy(function (oEvent) {
				assert.ok(typeof oEvent.getParameter("groupItem") == "object", "Group Item is an object");
			}),
			fnOnConfirmUndefined = sinon.spy(function (oEvent) {
				assert.ok(typeof oEvent.getParameter("groupItem") == "undefined", "'None' Item is undefined");
			});

		//Act
		this.oVSD.attachConfirm(fnOnConfirmObject);
		this.oVSD.open("group");
		this.oVSD.setSelectedGroupItem(this.oVSD.getGroupItems()[0]);
		this.oVSD._getDialog().getBeginButton().firePress();
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		//Check
		assert.ok(fnOnConfirmObject.calledOnce, "Event handler is being called");

		// Act
		this.oVSD.detachConfirm(fnOnConfirmObject);
		this.oVSD.attachConfirm(fnOnConfirmUndefined);
		this.oVSD.open("group");
		this.oVSD.setSelectedGroupItem();
		this.oVSD._getDialog().getBeginButton().firePress();
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		//Check
		assert.ok(fnOnConfirmUndefined.calledOnce, "Event handler is being called");
		sSelectedGroupItem = this.oVSD.getSelectedGroupItem();
		assert.equal(sap.ui.getCore().byId(sSelectedGroupItem), this.oVSD._oGroupingNoneItem, "GroupingNoneItem is selected when setSelectedGroupItem is called without params");

		clock.restore();
	});

	QUnit.test("Selectting Grouping None item by empty string", function (assert) {
		var sSelectedGroupItem,
			clock = sinon.useFakeTimers();

		//Act
		this.oVSD.open("group");
		this.oVSD.setSelectedGroupItem("");
		this.oVSD._getDialog().getBeginButton().firePress();
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		//Check
		sSelectedGroupItem = this.oVSD.getSelectedGroupItem();
		assert.equal(sap.ui.getCore().byId(sSelectedGroupItem), this.oVSD._oGroupingNoneItem, "GroupingNoneItem is selected when setSelectedGroupItem is called with empty string param");

		clock.restore();
	});

	QUnit.module("Construction/Destruction", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();
			this.oFilterState = {
				"name1": true,
				"name2": true,
				"name5": true,
				"name6": true,
				"status1": true,
				"status2": true,
				"status3": true,
				"value3": true
			};

			oVsdConfig.addSortItems(this.oVSD);
			oVsdConfig.addFilterItems(this.oVSD);
			oVsdConfig.addPresetFilterItems(this.oVSD);
			oVsdConfig.addGroupItems(this.oVSD);

			this.oSelectedSortItem = this.oVSD.getSortItems()[0];
			this.oSelectedGroupItem = this.oVSD.getGroupItems()[1];
			this.oSelectedPresetFilterItem = this.oVSD.getPresetFilterItems()[1];

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Destroy ViewSettingsDialog after all pages have been visited", function (assert) {
		var done = assert.async(),
			that = this;

		// open
		this.oVSD.open();

		// go to all pages again to init controls
		this.oVSD._switchToPage(0);
		this.oVSD._switchToPage(1);
		this.oVSD._switchToPage(2);
		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3,this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function () {
			// store poiners to internal controls
			var sortList = that.oVSD._sortList,
				ariaSortListInvisibleText = that.oVSD._ariaSortListInvisibleText,
				sortOrderList = that.oVSD._sortOrderList,
				ariaSortOrderInvisibleText = that.oVSD._ariaSortOrderInvisibleText,
				groupList = that.oVSD._groupList,
				ariaGroupListInvisibleText = that.oVSD._ariaGroupListInvisibleText,
				groupOrderList = that.oVSD._groupOrderList,
				ariaGroupOrderInvisibleText = that.oVSD._ariaGroupOrderInvisibleText,
				presetFilterList = that.oVSD._presetFilterList,
				filterList = that.oVSD._filterList,
				filterDetailList = that.oVSD._filterDetailList,
				titleLabel = that.oVSD._titleLabel,
				detailTitleLabel = that.oVSD._detailTitleLabel,
				resetButton = that.oVSD._resetButton,
				header = that.oVSD._header,
				sortButton = that.oVSD._sortButton,
				groupButton = that.oVSD._groupButton,
				filterButton = that.oVSD._filterButton,
				segmentedButton = that.oVSD._segmentedButton,
				page1 = that.oVSD._page1,
				page2 = that.oVSD._page2,
				navContainer = that.oVSD._navContainer,
				dialog = that.oVSD._dialog,
				subHeader = that.oVSD._subHeader;

			that.oVSD.destroy();

			// check if internal controls are destroyed correctly (when initialized they must be destroyed)
			assert.strictEqual(that.oVSD.$().length, 0, "There is no Domref for ViewSettingsDialog");

			// check if all internal controls are destroyed successfully
			assert.strictEqual(sortList.bIsDestroyed, true, "sort list is destroyed successfully");
			assert.strictEqual(ariaSortListInvisibleText.bIsDestroyed, true, "sort list aria label is destroyed successfully");
			assert.strictEqual(sortOrderList.bIsDestroyed, true, "sort order list is destroyed successfully");
			assert.strictEqual(ariaSortOrderInvisibleText.bIsDestroyed, true, "sort order list aria label is destroyed successfully");
			assert.strictEqual(groupList.bIsDestroyed, true, "group list is destroyed successfully");
			assert.strictEqual(ariaGroupListInvisibleText.bIsDestroyed, true, "group list aria label is destroyed successfully");
			assert.strictEqual(groupOrderList.bIsDestroyed, true, "group order list is destroyed successfully");
			assert.strictEqual(ariaGroupOrderInvisibleText.bIsDestroyed, true, "group order list aria label is destroyed successfully");
			assert.strictEqual(presetFilterList.bIsDestroyed, true, "preset filter list is destroyed successfully");
			assert.strictEqual(filterList.bIsDestroyed, true, "filter list is destroyed successfully");
			assert.strictEqual(filterDetailList.bIsDestroyed, true, "filter detail list is destroyed successfully");
			assert.strictEqual(titleLabel.bIsDestroyed, true, "title label is destroyed successfully");
			assert.strictEqual(detailTitleLabel.bIsDestroyed, true, "detail title label is destroyed successfully");
			assert.strictEqual(resetButton.bIsDestroyed, true, "reset button is destroyed successfully");
			assert.strictEqual(header.bIsDestroyed, true, "header is destroyed successfully");
			assert.strictEqual(sortButton.bIsDestroyed, true, "sortButton is destroyed successfully");
			assert.strictEqual(groupButton.bIsDestroyed, true, "groupButton is destroyed successfully");
			assert.strictEqual(filterButton.bIsDestroyed, true, "filterButton is destroyed successfully");
			assert.strictEqual(segmentedButton.bIsDestroyed, true, "segmentedButton is destroyed successfully");
			assert.strictEqual(page1.bIsDestroyed, true, "page1 is destroyed successfully");
			assert.strictEqual(page2.bIsDestroyed, true, "page2 is destroyed successfully");
			assert.strictEqual(navContainer.bIsDestroyed, true, "navContainer is destroyed successfully");
			assert.strictEqual(dialog.bIsDestroyed, true, "dialog is destroyed successfully");
			assert.strictEqual(subHeader.bIsDestroyed, true, "subHeader is destroyed successfully");

			// check if all controls are set to null correctly
			assert.strictEqual(that.oVSD._sortList, null, "sort list is null");
			assert.strictEqual(that.oVSD._ariaSortListInvisibleText, null, "sort list aria text is null");
			assert.strictEqual(that.oVSD._sortOrderList, null, "sort order list is null");
			assert.strictEqual(that.oVSD._ariaSortOrderInvisibleText, null, "sort order list aria text is null");
			assert.strictEqual(that.oVSD._groupList, null, "group list is null");
			assert.strictEqual(that.oVSD._ariaGroupListInvisibleText, null, "group list aria text is null");
			assert.strictEqual(that.oVSD._groupOrderList, null, "group order list is null");
			assert.strictEqual(that.oVSD._ariaGroupOrderInvisibleText, null, "group order list aria text is null");
			assert.strictEqual(that.oVSD._presetFilterList, null, "preset filter list is null");
			assert.strictEqual(that.oVSD._filterList, null, "filter list is null");
			assert.strictEqual(that.oVSD._filterDetailList, null, "filter detail list is null");
			assert.strictEqual(that.oVSD._titleLabel, null, "title label is null");
			assert.strictEqual(that.oVSD._detailTitleLabel, null, "detail title label is null");
			assert.strictEqual(that.oVSD._resetButton, null, "reset button is null");
			assert.strictEqual(that.oVSD._header, null, "header is null");
			assert.strictEqual(that.oVSD._sortButton, null, "sortButton is null");
			assert.strictEqual(that.oVSD._groupButton, null, "groupButton is null");
			assert.strictEqual(that.oVSD._filterButton, null, "filterButton is null");
			assert.strictEqual(that.oVSD._segmentedButton, null, "segmentedButton is null");
			assert.strictEqual(that.oVSD._page1, null, "page1 is null");
			assert.strictEqual(that.oVSD._page2, null, "page2 is null");
			assert.strictEqual(that.oVSD._navContainer, null, "navContainer is null");
			assert.strictEqual(that.oVSD._dialog, null, "dialog is null");
			assert.strictEqual(that.oVSD._subHeader, null, "subHeader is null");
			done();
		}, 10);
	});

	QUnit.test("Destroy ViewSettingsDialog that has never been opened/rendered", function (assert) {
		// store poiners to internal controls
		var sortList = this.oVSD._sortList,
			ariaSortListInvisibleText = this.oVSD._ariaSortListInvisibleText,
			sortOrderList = this.oVSD._sortOrderList,
			ariaSortOrderInvisibleText = this.oVSD._ariaSortOrderInvisibleText,
			groupList = this.oVSD._groupList,
			ariaGroupListInvisibleText = this.oVSD._ariaGroupListInvisibleText,
			groupOrderList = this.oVSD._groupOrderList,
			ariaGroupOrderInvisibleText = this.oVSD._ariaGroupOrderInvisibleText,
			presetFilterList = this.oVSD._presetFilterList,
			filterList = this.oVSD._filterList,
			filterDetailList = this.oVSD._filterDetailList,
			titleLabel = this.oVSD._titleLabel,
			detailTitleLabel = this.oVSD._detailTitleLabel,
			resetButton = this.oVSD._resetButton,
			header = this.oVSD._header,
			sortButton = this.oVSD._sortButton,
			groupButton = this.oVSD._groupButton,
			filterButton = this.oVSD._filterButton,
			segmentedButton = this.oVSD._segmentedButton,
			page1 = this.oVSD._page1,
			page2 = this.oVSD._page2,
			navContainer = this.oVSD._navContainer,
			dialog = this.oVSD._dialog,
			subHeader = this.oVSD._subHeader;

		// check if all internal controls are not initialized yet
		assert.notEqual(sortList, undefined, "sort list was initialized");
		assert.strictEqual(ariaSortListInvisibleText, undefined, "sort list aria label is not initialized yet");
		assert.strictEqual(sortOrderList, undefined, "sort order list is not initialized yet");
		assert.strictEqual(ariaSortOrderInvisibleText, undefined, "sort order list aria label is not initialized yet");
		assert.strictEqual(groupList, undefined, "group list is not initialized yet");
		assert.strictEqual(ariaGroupListInvisibleText, undefined, "group list aria label is not initialized yet");
		assert.strictEqual(groupOrderList, undefined, "group order list is not initialized yet");
		assert.strictEqual(ariaGroupOrderInvisibleText, undefined, "group order list aria label is not initialized yet");
		assert.strictEqual(presetFilterList, undefined, "preset filter list is not initialized yet");
		assert.strictEqual(filterList, undefined, "filter list is not initialized yet");
		assert.strictEqual(filterDetailList, undefined, "filter detail list is not initialized yet");
		assert.strictEqual(titleLabel, undefined, "title label is not initialized yet");
		assert.strictEqual(detailTitleLabel, undefined, "detail title label is not initialized yet");
		assert.strictEqual(resetButton, undefined, "reset button is not initialized yet");
		assert.strictEqual(header, undefined, "header is not initialized yet");
		assert.strictEqual(sortButton, undefined, "sortButton is not initialized yet");
		assert.strictEqual(groupButton, undefined, "groupButton is not initialized yet");
		assert.strictEqual(filterButton, undefined, "filterButton is not initialized yet");
		assert.strictEqual(segmentedButton, undefined, "segmentedButton is not initialized yet");
		assert.strictEqual(page1, undefined, "page1 is not initialized yet");
		assert.strictEqual(page2, undefined, "page2 is not initialized yet");
		assert.strictEqual(navContainer, undefined, "navContainer is not initialized yet");
		assert.strictEqual(dialog, undefined, "dialog is not initialized yet");
		assert.strictEqual(subHeader, undefined, "subHeader is not initialized yet");

		this.oVSD.destroy();

		// check if internal controls are destroyed correctly (when initialized they must be destroyed)
		assert.strictEqual(this.oVSD.$().length, 0, "There is no Domref for ViewSettingsDialog");
	});

	QUnit.test("Remove all filter/sort/group items ViewSettingsDialog that has no filter/sort/group items", function (assert) {
		//prepare
		var oVSD = new ViewSettingsDialog();

		//act
		oVSD.removeAllFilterItems();
		oVSD.removeAllGroupItems();
		oVSD.removeAllSortItems();

		//assert
		assert.ok("Filter/Group/Sort items should be removed without throwing an exception");
	});

	QUnit.module("Sort tab only checks", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog({
				sortItems: [
					new ViewSettingsItem({
						key: "myNameSorter",
						text: "Name",
						selected: true
					}),
					new ViewSettingsItem({
						key: "myStatusSorter",
						text: "Status",
						selected: true
					}),
					new ViewSettingsItem({
						key: "myValueSorter",
						text: "Value",
						selected: false
					}),
					new ViewSettingsItem({
						key: "myPriceSorter",
						text: "Price",
						selected: false
					})
				]
			});
			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Check sort tab only mode", function  (assert){
		this.oVSD.open();
		assert.strictEqual(this.oVSD.getSelectedSortItem(), this.oVSD.getSortItems()[1].getId(), "Second selected sort item is set successfully by selected flag");
		assert.strictEqual(this.oVSD.getSelectedGroupItem(), null, "Selected group item is null");
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), null, "Selected preset filter item is null");
		assert.strictEqual(this.oVSD._sortContent.length, 4, "Sort content is initialized and has two items");
		assert.strictEqual(this.oVSD._groupContent, undefined, "Group content is not initialized");
		assert.strictEqual(this.oVSD._filterContent, undefined, "Filter content is not initialized");
		assert.strictEqual(this.oVSD._page1.getSubHeader(), null, "Subheader with segmented button is not set on first page");

		// Aria sort list and sort order list labels and ariaLabelledBy
		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-sortOrderLabel"), "Sort order list aria label should be rendered");
		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-sortListLabel"), "Sort list aria label should be rendered");
		assert.strictEqual(this.oVSD._sortOrderList.getAriaLabelledBy().length, 1, "Sort order list should have aria ariaLabelledBy set");
		assert.strictEqual(this.oVSD._sortList.getAriaLabelledBy().length, 1, "Sort list should have aria ariaLabelledBy set");

		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-resetbutton"), "Filter reset button should be rendered");
});

	QUnit.module("Group tab only checks", {
			beforeEach : function () {
				this.oVSD = new ViewSettingsDialog({
					groupItems: [
						new ViewSettingsItem({
							key: "myNameGrouper",
							text: "Name",
							selected: true
						}),
						new ViewSettingsItem({
							key: "myStatusGrouper",
							text: "Status",
							selected: true
						}),
						new ViewSettingsItem({
							key: "myValueGrouper",
							text: "Value",
							selected: false
						}),
						new ViewSettingsItem({
							key: "myPriceGrouper",
							text: "Price",
							selected: false
						})
					]
				});
				this.oVSD.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach : function () {
				this.oVSD.destroy();
				this.oVSD = null;
			}
		});

	QUnit.test("Check group tab only mode", function  (assert){
		this.oVSD.open();
		assert.strictEqual(this.oVSD.getSelectedSortItem(), null, "Selected sort item is null");
		assert.strictEqual(this.oVSD.getSelectedGroupItem(), this.oVSD.getGroupItems()[1].getId(), "Second selected group item is set successfully by selected flag");
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), null, "Selected preset filter item is null");
		assert.strictEqual(this.oVSD._sortContent, undefined, "Group content is not initialized");
		assert.strictEqual(this.oVSD._groupContent.length, 4, "Group content is initialized and has two items");
		assert.strictEqual(this.oVSD._filterContent, undefined, "Filter content is not initialized");
		assert.strictEqual(this.oVSD._page1.getSubHeader(), null, "Subheader with segmented button is not set on first page");

		// Aria sort list and sort order list labels and ariaLabelledBy
		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-groupOrderLabel"), "Group order list aria label should be rendered");
		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-groupListLabel"), "Group list aria label should be rendered");
		assert.strictEqual(this.oVSD._groupOrderList.getAriaLabelledBy().length, 1, "Group order list should have aria ariaLabelledBy set");
		assert.strictEqual(this.oVSD._groupList.getAriaLabelledBy().length, 1, "Group list should have aria ariaLabelledBy set");

		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-resetbutton"), "Filter reset button should be rendered");
	});

	QUnit.module("Preset Filter only checks", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog({
				presetFilterItems: [
					new ViewSettingsItem({
						key: "myPresetFilter1",
						text: "A very complex filter",
						selected: true
					}),
					new ViewSettingsItem({
						key: "myPresetFilter2",
						text: "Ridiculously complex filter",
						selected: true
					}),
					new ViewSettingsItem({
						key: "myPresetFilter3",
						text: "Expensive stuff",
						selected: false
					})
				]
			});
			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Check preset filter only mode", function  (assert){
		this.oVSD.open();
		assert.strictEqual(this.oVSD.getSelectedSortItem(), null, "Selected sort item is null");
		assert.strictEqual(this.oVSD.getSelectedGroupItem(), null, "Selected group item is null");
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), this.oVSD.getPresetFilterItems()[1].getId(), "Second preset filter item is set successfully by selected flag");
		assert.strictEqual(this.oVSD._sortContent, undefined, "Group content is not initialized");
		assert.strictEqual(this.oVSD._groupContent, undefined, "Group content is not initialized");
		assert.strictEqual(this.oVSD._filterContent.length, 2, "Filter content is initalized and has two items");
		assert.strictEqual(this.oVSD._page1.getSubHeader(), null, "Subheader with segmented button is not set on first page");
		assert.strictEqual(this.oVSD.getSelectedFilterItems().length, 0, "There are no selected filter items");
		assert.ok(jQuery.sap.domById(this.oVSD.getId() + "-resetbutton"), "Filter reset button should be rendered");
	});

	QUnit.module("Filter details rendering", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();

			this.oFilterState = {
				"name1": true,
				"name2": true,
				"name5": true,
				"name6": true,
				"status1": true,
				"status2": false,
				"status3": true,
				"value3": true
			};

			oVsdConfig.addFilterItems(this.oVSD);

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	QUnit.test("Check filter detail page and buttons render correctly", function (assert) {
		var done = assert.async(),
				that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			assert.ok(jQuery.sap.domById(that.oVSD.getId() + "-page2"), "Page 2 is rendered");
			assert.ok(jQuery.sap.domById(that.oVSD.getId() + "-detailresetbutton"), "Filter detail reset button should be rendered");
			assert.ok(jQuery.sap.domById(that.oVSD.getId() + "-backbutton"), "Back button should be rendered");
			done();
		}, 10);

	});

	QUnit.test("setSelectedFilterKeys with duplicate keys but different parents", function (assert) {
		var aSelectedItems;

		//arrange

		// the vsd instance already has a filter sub-item
		// with key 'name1' with parent with key 'myNameFilter'
		// this sub-item's key is the same 'name1'
		this.oVSD.addFilterItem(new ViewSettingsFilterItem({
			key: "mySecondNameFilter",
			text: "Name 2",
			items: [
				new ViewSettingsItem({
					key: "name1",
					text: "Headphone 2"
				})
			]
		}));

		//act
		this.oVSD.setSelectedFilterCompoundKeys({
			"myNameFilter": {
				"name1": true,
				"name2": true
			},
			"mySecondNameFilter": {
				"name1": true
			}
		});

		aSelectedItems = this.oVSD.getSelectedFilterItems();

		//assert
		assert.equal(Object.getOwnPropertyNames(this.oVSD.getSelectedFilterCompoundKeys()).length, 2, "right number of selected keys");
		assert.equal(Object.getOwnPropertyNames(this.oVSD.getSelectedFilterCompoundKeys()["myNameFilter"]).length, 2, "right number of selected keys");
		assert.equal(aSelectedItems[0].getKey(), "name1");
		assert.equal(aSelectedItems[0].getParent().getKey(), "myNameFilter");
		assert.equal(aSelectedItems[1].getKey(), "name2");
		assert.equal(aSelectedItems[1].getParent().getKey(), "myNameFilter");
		assert.equal(aSelectedItems[2].getKey(), "name1");
		assert.equal(aSelectedItems[2].getParent().getKey(), "mySecondNameFilter");
	});

	QUnit.test("Select and deselect a filter detail item works correctly", function (assert) {
		var done = assert.async(),
			that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[1]); // name details page

		setTimeout(function() {
			assert.strictEqual(this.oVSD._filterDetailList.getItems()[0].getSelected(),  true, 'The first item is initially selected');

			//Act
			this.oVSD._filterDetailList.getItems()[0].$().trigger('tap');

			setTimeout(function () {
					assert.strictEqual(that.oVSD._filterDetailList.getItems()[0].getSelected(), false, 'The first item is not selected');
					done();
			}, 10);
		}.bind(this), 10);
	});

	QUnit.test("Show Only Selected button toggled on displays only selected items", function (assert) {

		var oShowOnlySelected,
			aItems,
			iItems,
			iVisibleItems,
			iSelectedItems,
			oFirstSelected;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();
		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		oShowOnlySelected = this.oVSD._showOnlySelectedButton;
		aItems = this.oVSD._filterDetailList.getItems();
		iItems = aItems.length;

		sap.ui.getCore().applyChanges();

		getItemsInfo(aItems);

		// get initial state: 7 items total, 7 displayed, 4 of them selected
		assert.equal(iItems, 7, "There are 7 items initially");
		assert.equal(iVisibleItems, 7, "There are 7 items displayed initially");
		assert.equal(iSelectedItems, 4, "There are 4 items selected initially");

		// Action 1
		// simulate button press
		oShowOnlySelected.setPressed(true);
		oShowOnlySelected.firePress();
		sap.ui.getCore().applyChanges();

		getItemsInfo(aItems);

		// get state after the toggle button press: only selected items are displayed (4)
		assert.equal(iVisibleItems, 4, "There are 4 items displayed");
		assert.equal(iSelectedItems, 4, "There are 4 items selected");

		// Action 2
		// unselect one of the selected items
		oFirstSelected.setSelected(false);

		getItemsInfo(aItems);

		// get state after the item unselect: 4 items displayed, 3 of them - selected
		assert.equal(iVisibleItems, 4, "There are 4 items displayed");
		assert.equal(iSelectedItems, 3, "There are 3 items selected");

		// Action 3
		// simulate button press
		oShowOnlySelected.setPressed(false);
		oShowOnlySelected.firePress();
		sap.ui.getCore().applyChanges();

		getItemsInfo(aItems);

		// get state after second button toggle: 7 items are displayed, 3 of them - selected
		assert.equal(iVisibleItems, 7, "There are 7 items displayed");
		assert.equal(iSelectedItems, 3, "There are 3 items selected");

		// Action 4
		// simulate button press
		oShowOnlySelected.setPressed(true);
		oShowOnlySelected.firePress();
		sap.ui.getCore().applyChanges();

		getItemsInfo(aItems);

		// get state after the third toggle button press: only selected items are displayed (3)
		assert.equal(iVisibleItems, 3, "There are 3 items displayed");
		assert.equal(iSelectedItems, 3, "There are 3 items selected");

		// Helper function for getting the counts of visible and selected items
		function getItemsInfo(aItems) {
			iVisibleItems = 0;
			iSelectedItems = 0;
			aItems.forEach(function(oItem){
				if (oItem.getSelected()) {
					iSelectedItems++;
					if (!oFirstSelected) {
						oFirstSelected = oItem;
					}
				}
				if (oItem.getVisible()) {
					iVisibleItems++;
				}
			});
		}
	});

	QUnit.test("Select All checkbox works correctly", function (assert) {
		var done = assert.async(),
				that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			var oSelectAllCheckbox = that.oVSD._selectAllCheckBox,
				bAllSelected = that.oVSD._filterDetailList.getItems().every(function(oItem) { return oItem.getSelected(); }),
				bNoItemsSelected;

			that.oVSD.addFilterItem(new ViewSettingsFilterItem({
				key: "myNameFilter11",
				text: "Name 11",
				items: [
					new ViewSettingsFilterItem({
						key: "name11",
						text: "Station"
					})
				]
			}));

			assert.ok(!bAllSelected, "Not all list items are selected at first");

			//Act
			oSelectAllCheckbox.setSelected(true);
			oSelectAllCheckbox.fireSelect({ selected: true });

			bAllSelected = that.oVSD._filterDetailList.getItems().every(function(oItem) { return oItem.getSelected(); });

			//Assert
			assert.ok(bAllSelected, "After check select all - all list items are selected");

			//Act
			oSelectAllCheckbox.setSelected(false);
			oSelectAllCheckbox.fireSelect({ selected: false });

			bNoItemsSelected = that.oVSD._filterDetailList.getItems().every(function(oItem) { return !oItem.getSelected(); });
			//Assert
			assert.ok(bNoItemsSelected, "After uncheck select all - no items are selected");

			done();
		}, 10);
	});

	QUnit.test("Query filter search field works correctly", function (assert) {
		var done = assert.async(),
			that = this,
			fnIsVisible = function(oItem) {
				return oItem.getVisible();
			};


		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			var oSearchField = that.oVSD._filterSearchField,
				aFilteredItems;

			//Act
			oSearchField.setValue("Mo"); // Matches: Mousepad, Monitor
			oSearchField.fireLiveChange();
			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(fnIsVisible);
			//Assert
			assert.equal(aFilteredItems.length, 2, "After filter search there are 2 visible items in the list.");

			//Act
			that.oVSD.setFilterSearchOperator(StringFilterOperator.Contains);
			oSearchField.setValue("Mo"); // Matches: Mousepad, Monitor
			oSearchField.fireLiveChange();

			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(fnIsVisible);
			//Assert
			assert.equal(aFilteredItems.length, 3, "After filter search with 'contains', there are 3 visible items in the list.");

			//Act
			that.oVSD.setFilterSearchOperator(StringFilterOperator.Equals);
			oSearchField.setValue("Mouse"); // Matches: None
			oSearchField.fireLiveChange();

			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(fnIsVisible);
			//Assert
			assert.equal(aFilteredItems.length, 0, "After filter search with 'equals', there are 0 visible items in the list.");

			//Act
			oSearchField.setValue("Mousepad"); // Matches: Mousepad
			oSearchField.fireLiveChange();

			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(fnIsVisible);
			//Assert
			assert.equal(aFilteredItems.length, 1, "After filter search with 'equals', there is 1 visible item in the list.");

			//Act
			that.oVSD.setFilterSearchOperator(StringFilterOperator.AnyWordStartsWith);
			oSearchField.setValue("mou"); // Matches: Mousepad, Optical Mouse
			oSearchField.fireLiveChange();

			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(fnIsVisible);
			//Assert
			assert.equal(aFilteredItems.length, 2, "After filter search with 'anywordstartswith', there are 2 visible items in the list.");

			//Act
			oSearchField.setValue("ou"); // Matches: None
			oSearchField.fireLiveChange();

			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(fnIsVisible);
			//Assert
			assert.equal(aFilteredItems.length, 0, "After filter search with 'anywordstartswith', there are 0 visible items in the list.");

			//Act
			oSearchField.setValue(""); // Matches: All
			oSearchField.fireLiveChange();
			aFilteredItems = that.oVSD._filterDetailList.getItems().filter(function(oItem) {
				return oItem.getVisible();
			});
			//Assert
			assert.equal(aFilteredItems.length, 7, "Empty query in filter search shows all items.");

			//Act
			oSearchField.fireLiveChange(); // Matches: none

			//Assert
			Log.info(that.oVSD._createSelectAllCheckbox(), that.oVSD._createSelectAllCheckbox().getSelected());
			assert.equal(that.oVSD._selectAllCheckBox.getSelected(), false, "Select all not checked");

			//Act
			that.oVSD._switchToPage(3, that.oVSD.getFilterItems()[4]); // empty page

			//Assert
			assert.equal(that.oVSD._selectAllCheckBox.getSelected(), false, "Select all not checked");

			done();
		}, 10);
	});

	QUnit.test("Query filter search field works correctly when the FilterItem has multiSelect set to false", function (assert) {
		var done = assert.async(),
			that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[5]); // name2 details page

		setTimeout(function() {
			var oSearchField = that.oVSD._filterSearchField,
				aFilteredItems;

			//Assert
			assert.ok(oSearchField, "There is a search field when multiSelect is set to false");

			done();
		}, 10);
	});

	QUnit.test("StringFilter", function (assert) {
		var fnStringFilter = this.oVSD._getStringFilter();

		//Assert
		assert.ok(!fnStringFilter("ab", ""), "filtering an empty string is always false");
		assert.ok(!fnStringFilter("ab"), "filtering an empty string is always false");
		assert.ok(!fnStringFilter("ab", null), "filtering an empty string is always false");
		assert.ok(fnStringFilter("", ""), "unless the query is also empty");

		this.oVSD.setFilterSearchOperator(StringFilterOperator.AnyWordStartsWith);
		fnStringFilter = this.oVSD._getStringFilter();

		//Assert
		assert.ok(fnStringFilter("mou", "mousepad"), "'anywordstartswith' matches correctly the beginning of the first word");
		assert.ok(fnStringFilter("mou", "optical mouse"), "'anywordstartswith' matches correctly the beginning of the second word");
		assert.ok(!fnStringFilter("ou", "mousepad"), "'anywordstartswith' does not match strings in the middle of the first word");
		assert.ok(!fnStringFilter("ou", "mousepad mousepad"), "'anywordstartswith' does not match strings in the middle of the second word");
	});

	QUnit.test("setFilterSearchCallback", function (assert) {
		var done = assert.async(),
			oCallbackSpy = {
				callCount: 0,
				args: []
			},
			fnFilterSearchCallback = function() {
				oCallbackSpy.callCount++;
				oCallbackSpy.args.push([ arguments[0], arguments[1] ]);
				return true;
			};

		this.oVSD.setSelectedFilterKeys(this.oFilterState);
		this.oVSD.setFilterSearchOperator(StringFilterOperator.Contains);
		this.oVSD.setFilterSearchCallback(fnFilterSearchCallback);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			var oSearchField = this.oVSD._filterSearchField,
				sSearchString = "Mo";

			//Act
			oSearchField.setValue(sSearchString);
			oSearchField.fireLiveChange();

			//Assert
			assert.equal(oCallbackSpy.callCount, 7, "filter function is called as many times as it should");
			assert.equal(oCallbackSpy.args[0][0], sSearchString, "filter function is called with the right first argument");
			assert.equal(oCallbackSpy.args[0][1], this.oVSD.getFilterItems()[0].getItems()[0].getText(), "filter function is called with the right second argument");

			done();
		}.bind(this), 10);
	});

	QUnit.test("Query filter search field updates the select all checkbox", function (assert){
		var done = assert.async(),
			that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			var oSearchField = that.oVSD._filterSearchField,
				oSelectAllCheckbox = that.oVSD._selectAllCheckBox;

			assert.ok(!oSelectAllCheckbox.getSelected(), "At first the select all checkbox is not selected.");

			//Act
			oSearchField.setValue("H"); // Matches: Headphone
			oSearchField.fireLiveChange();
			//Assert
			assert.ok(oSelectAllCheckbox.getSelected(), "After filter search with selected results only, the select all checkbox is also selected.");

			done();
		}, 10);
	});

	QUnit.test("Select All checkbox updates only the filtered items", function (assert) {
		var done = assert.async(),
			that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			var oSearchField = that.oVSD._filterSearchField,
				oSelectAllCheckbox = that.oVSD._selectAllCheckBox,
				aSelectedItems;

			aSelectedItems = that.oVSD._filterDetailList.getItems().filter(function (oItem) {
				return oItem.getSelected();
			});

			assert.equal(aSelectedItems.length, 4, "At first the selected items are 4.");

			//Act
			oSearchField.setValue("H"); // Matches: Headphone
			oSearchField.fireLiveChange(); // Matches: Headphone
			oSelectAllCheckbox.setSelected(false);
			oSelectAllCheckbox.fireSelect({ selected: false });

			oSearchField.fireLiveChange({ newValue: "" }); // Matches: All items
			aSelectedItems = that.oVSD._filterDetailList.getItems().filter(function(oItem) {
				return oItem.getSelected();
			});

			//Assert
			assert.equal(aSelectedItems.length, 3, "After deselecting select all checkbox, on a filtered list with 1 selected result, the selected items are only decreased by 1.");

			done();
		}, 10);
	});

	QUnit.test("Select All checkbox is disabled when no items matched the search query", function (assert) {
		var done = assert.async(),
			that = this;

		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]); // name details page

		setTimeout(function() {
			var oSearchField = that.oVSD._filterSearchField,
				oSelectAllCheckbox = that.oVSD._selectAllCheckBox,
				aVisibleItems,
				bAllEnabled;

			// Initial state: nothing in the Search box
			aVisibleItems = that.oVSD._filterDetailList.getItems().filter(function (oItem) {
				return oItem.getVisible();
			});
			bAllEnabled = oSelectAllCheckbox.getEnabled();

			// Assert
			assert.equal(aVisibleItems.length, 7, "At first the displayed items are 7.");
			assert.equal(bAllEnabled, true, "At first the Select all checkbox is enabled.");

			// Act: Type "Z" in the Search box
			oSearchField.setValue("Z"); // Matches: (nothing)
			oSearchField.fireLiveChange();
			aVisibleItems = that.oVSD._filterDetailList.getItems().filter(function (oItem) {
				return oItem.getVisible();
			});
			bAllEnabled = oSelectAllCheckbox.getEnabled();

			// Assert
			assert.equal(aVisibleItems.length, 0, "Now the displayed items are 0.");
			assert.equal(bAllEnabled, false, "Now the Select all checkbox is disabled.");

			// Back to initial state: nothing in the Search box
			oSearchField.setValue(""); // Matches: All items
			oSearchField.fireLiveChange();
			aVisibleItems = that.oVSD._filterDetailList.getItems().filter(function (oItem) {
				return oItem.getVisible();
			});
			bAllEnabled = oSelectAllCheckbox.getEnabled();

			// Assert
			assert.equal(aVisibleItems.length, 7, "Now the displayed items are 7 again.");
			assert.equal(bAllEnabled, true, "Now the Select all checkbox is enabled again.");

			done();
		}, 10);
	});

	QUnit.test("Select All checkbox is disabled when there are no detail items", function (assert) {
		// prepare
		var oFilterItem = new  sap.m.ViewSettingsFilterItem({
				text: "oFixedFilter",
				key: "oFixedFilter",
				multiSelect: true
			}),
			oVSD = new ViewSettingsDialog({
				title: "Filter",
				filterItems: [oFilterItem]
			});

		//act
		oVSD._initFilterDetailItems(oFilterItem);

		//assert
		assert.equal(oVSD._selectAllCheckBox.getEnabled(), false, "When there are no items, Select All is disabled");

		//destroy
		oVSD.destroy();
	});


	QUnit.module("Filter only checks", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();

			this.oFilterState = {
				"name1": true,
				"name2": true,
				"name5": true,
				"name6": true,
				"status1": true,
				"status2": true,
				"status3": true,
				"value3": true
			};

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		}
	});

	//BCP: 1570899196
	QUnit.test("removeFilterItem works with index as a parameter", function(assert) {
		oVsdConfig.addFilterItems(this.oVSD);

		var iFilterItemsCount = this.oVSD.getFilterItems().length;

		this.oVSD.removeFilterItem(0);

		assert.ok(true, "removeFilterItem does not throw errors when called with item index");
		assert.strictEqual(this.oVSD.getFilterItems().length, iFilterItemsCount - 1, "a filter item is removed");
	});

	QUnit.test("Check filter only mode", function  (assert){
		var	sId = this.oVSD.getId();

		oVsdConfig.addFilterItems(this.oVSD);
		oVsdConfig.addPresetFilterItems(this.oVSD);
		this.oVSD.getFilterItems()[2].setMultiSelect(false);
		this.oVSD.setSelectedFilterKeys(this.oFilterState);

		this.oVSD.open();

		// overview page
		assert.strictEqual(this.oVSD.getSelectedSortItem(), null, "Selected sort item is null");
		assert.strictEqual(this.oVSD.getSelectedGroupItem(), null, "Selected group item is null");
		assert.strictEqual(this.oVSD.getSelectedPresetFilterItem(), null, "Selected preset filter item is null");
		assert.strictEqual(this.oVSD._sortContent, undefined, "Group content is not initialized");
		assert.strictEqual(this.oVSD._groupContent, undefined, "Group content is not initialized");
		assert.strictEqual(this.oVSD._filterContent.length, 2, "Filter content is initialized and has two items");
		assert.strictEqual(this.oVSD._page1.getSubHeader(), null, "Sub-header with segmented button is not set on first page");
		assert.ok(compareFilterKeys(this.oFilterState, this.oVSD.getSelectedFilterKeys()), "The computed filter keys should have the same structure as the passed one");
		assert.ok(jQuery.sap.domById(sId + "-resetbutton"), "Filter reset button should be rendered");
		assert.strictEqual(this.oVSD._filterList.getItems()[1].getCounter(), 4, "Filter counter for name is 4"); //since the header is the 0 element, get the actual first item

		this.oVSD._switchToPage(3,this.oVSD.getFilterItems()[2]); // value details page
		assert.strictEqual(this.oVSD._filterDetailList.getMode(), ListMode.SingleSelectLeft, "The value detail list is in single select left mode");
		assert.strictEqual(this.oVSD._filterDetailList.getSelectedItem().data("item"), this.oVSD.getFilterItems()[2].getItems()[2], "The item 'value3' is selected");
	});

	QUnit.test("Check add/remove/toggle/hasStyleClass methods", function (assert) {
		var	sCustomStyleClass = "myStyleClass";

		// add + has
		this.oVSD.addStyleClass(sCustomStyleClass);
		this.oVSD.open();
		assert.ok(this.oVSD._dialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog now has style class "' + sCustomStyleClass + '"');
		assert.ok(this.oVSD.hasStyleClass(sCustomStyleClass), 'The ViewSettingsDialog now has style class "' + sCustomStyleClass + '"');

		// remove
		this.oVSD.removeStyleClass(sCustomStyleClass);
		assert.ok(!this.oVSD._dialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog does not have style class "' + sCustomStyleClass + '" after remove');
		assert.ok(!this.oVSD.hasStyleClass(sCustomStyleClass), 'The ViewSettingsDialog does not have style class "' + sCustomStyleClass + '" after remove');

		// toggle
		this.oVSD.toggleStyleClass(sCustomStyleClass);
		assert.ok(this.oVSD._dialog.hasStyleClass(sCustomStyleClass), 'The internal Dialog has style class "' + sCustomStyleClass + '" after toggle');
		assert.ok(this.oVSD.hasStyleClass(sCustomStyleClass), 'The ViewSettingsDialog has style class "' + sCustomStyleClass + '" after toggle');
	});

	QUnit.test("Check $ and getDomRef methods", function (assert) {
		this.oVSD.open();
		assert.ok(this.oVSD.$().length === 1, "The inner dialogs jQuery object is returned");
		assert.ok(this.oVSD.getDomRef().id === this.oVSD.getId() + "-dialog", "The inner dialogs DOM reference is returned");
	});

	QUnit.module("Re-rendering after changing selections", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();

			this.oVSD.addSortItem(new ViewSettingsItem({
				key: "myStatusSorter",
				text: "Status"
			}));

			this.oVSD.addSortItem(new ViewSettingsItem({
				key: "myOtherSorter",
				text: "Other"
			}));

			this.oVSD.addGroupItem(new ViewSettingsItem({
				key: "myGrouper",
				text: "Grouping"
			}));

			this.oVSD.addGroupItem(new ViewSettingsItem({
				key: "myOtherGrouper",
				text: "Other"
			}));

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Test for re-rendering after changing selections", function (assert) {
		var delay = 10,
				done1 = assert.async(),
				that = this;

		this.oVSD.open();
		setTimeout(function () {
			var listOfSortDirectionItems = that.oVSD._getPage1().getContent()[1];
			var oListItemDescending = listOfSortDirectionItems.getItems()[2];
			var listOfOtherItems = that.oVSD._getPage1().getContent()[3];
			var oListItemOther = listOfOtherItems.getItems()[1];
			var vsdSortItem = that.oVSD.getSortItems()[1];
			var spySortItem = sinon.spy(vsdSortItem, "setProperty");
			var spyVsd = sinon.spy(that.oVSD, "setProperty");

			oListItemDescending._oSingleSelectControl.fireSelect({selected : true});
			oListItemOther._oSingleSelectControl.fireSelect({selected : true});

			assert.ok(spySortItem.calledOnce, "setSelected should be called only once");

			assert.ok(spyVsd.calledWithExactly('sortDescending', true, true), "Set sort item as as selected should be called with suppress Invalidation flag=true");

			assert.ok(spyVsd.calledOnce, "setSelected should be called only once");

			that.oVSD._switchToPage(1);
			setTimeout(function () {
				var list 						= that.oVSD._getPage1().getContent()[1];
				var listOfGroupItems 			= list.getItems()[2];
				var listOfGroupDirectionItems	= that.oVSD._getPage1().getContent()[3];
				var vsdGroupDirectionDesc 		= listOfGroupDirectionItems.getItems()[2];
				var vsdGroupItem 				= that.oVSD.getGroupItems()[1];
				var spyGroupItem 				= sinon.spy(vsdGroupItem, "setProperty");

				listOfGroupItems._oSingleSelectControl.fireSelect({selected : true});
				vsdGroupDirectionDesc._oSingleSelectControl.fireSelect({selected : true});

				assert.ok(spyGroupItem.calledWithExactly('selected', true, true), "Set group item as selected should be called with suppress Invalidation flag=true");
				assert.ok(spyGroupItem.calledTwice, "setSelected should be called twice");

				assert.ok(spyVsd.calledWithExactly('groupDescending', true, true), "Set group item as as selected should be called with suppress Invalidation flag=true");

				assert.ok(spyVsd.calledTwice, "setSelected should be called twice");

				done1();

				that.oVSD.destroy();
				delete that.oVSD;

			}, delay);
		}, delay);
	});

	QUnit.module("Changing items after open", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();

			this.oVSD.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		},
		getFirstModelData: function() {
			return {
				sortData: [
					{
						myKey: "key1",
						myText: "Sort text 1"
					}],
				groupData: [
					{
						myKey: "groupKey1",
						myText: "Group text 1"
					}],
				filterData: [
					{
						myKey: "filterKey1",
						myText: "Filter text 1",
						myItems: [
							{
								myKey: 'item1',
								myText: 'item2'
							}
						]
					},
					{
						myKey: "filterKey2",
						myText: "Filter text 2"
					},
					{
						myKey: "filterKey3",
						myText: "Filter text 3"
					}]
			};
		},
		getSecondModelData: function() {
			return {
				sortData: [
					{
						myKey: "key1",
						myText: "2 Sort text 1"
					}],
				groupData: [
					{
						myKey: "groupKey1",
						myText: "2 Group text 1"
					}],
				filterData: [
					{
						myKey: "filterKey22",
						myText: "2 Filter text 2"
					}]
			};
		},
		bindAggregations: function(oVsdInst) {
			var template1 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}"
			});
			var template2 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}"
			});
			var template3 = new ViewSettingsFilterItem({
				key: "{myKey}",
				text: "{myText}",
				items: [
					new ViewSettingsItem({
						key: "{myItems/0/myKey}",
						text: "{myItems/0/myText}"
					})
				]
			});
			oVsdInst.bindAggregation("sortItems", "/sortData", template1);
			oVsdInst.bindAggregation("groupItems", "/groupData", template2);
			oVsdInst.bindAggregation("filterItems", "/filterData", template3);
		}
	});

	QUnit.test("Reopening filter detail page of a removed detail", function (assert) {
		var delay = 10,
			done = assert.async(),
			that = this;

		var filter = new ViewSettingsFilterItem({
			key: "myGFilter",
			text: "Filtering",
			items: [
				new ViewSettingsItem({
					key: "test",
					text: "2"
				})
			]
		});
		this.oVSD.addFilterItem(filter);

		this.oVSD.addFilterItem(new ViewSettingsFilterItem({
			key: "myOtherFilter",
			text: "Other"
		}));
		this.oVSD.open();

		setTimeout(function () {
			var vsdFilterItem = that.oVSD.getFilterItems()[0];
			that.oVSD._switchToPage(3, vsdFilterItem);
			jQuery.sap.delayedCall(0, that.oVSD._getNavContainer(), "to", [ that.oVSD.getId() + '-page2', "slide" ]);
			setTimeout(function () {
				that.oVSD._dialog.getBeginButton().firePress();
				that.oVSD.removeFilterItem(vsdFilterItem);
				that.oVSD.open();
				setTimeout(function () {
					assert.strictEqual(that.oVSD._vContentPage, 2, "Once filter details item is removed, " +
						"the filter parent page should be the current page");
					done();
				}, delay);
			}, delay);
		}, delay);
	});

	QUnit.test("Reopening filter detail page after all filters are removed", function (assert) {
		var delay = 10,
			done = assert.async(),
			that = this;

		var filter = new ViewSettingsFilterItem({
			key: "myGFilter",
			text: "Filtering",
			items: [
				new ViewSettingsItem({
					key: "test",
					text: "2"
				})
			]
		});
		this.oVSD.addFilterItem(filter);

		this.oVSD.addFilterItem(new ViewSettingsFilterItem({
			key: "myOtherFilter",
			text: "Other"
		}));
		this.oVSD.open();

		setTimeout(function () {
			var vsdFilterItem = that.oVSD.getFilterItems()[0];
			that.oVSD._switchToPage(3, vsdFilterItem);
			jQuery.sap.delayedCall(0, that.oVSD._getNavContainer(), "to", [ that.oVSD.getId() + '-page2', "slide" ]);
			setTimeout(function () {
				that.oVSD._dialog.getBeginButton().firePress();
				that.oVSD.removeAllFilterItems();
				that.oVSD.open();
				setTimeout(function () {
					assert.strictEqual(that.oVSD._vContentPage, 0, "If all filter items are removed, the first available" +
					" page should be current(in that case 'Sort/0')");
					done();
				}, delay);
			}, delay);
		}, delay);
	});

	QUnit.test("Reopening filter detail page of a removed detail with model change - remove single filter", function (assert) {
		var delay = 10,
			done = assert.async(),
			that = this;

		this.oVSD.setSortDescending(false);
		this.oVSD.setGroupDescending(true);
		var modelData = this.getFirstModelData();
		var modelData2 = this.getSecondModelData();
		var oModel = new JSONModel();
		oModel.setData(modelData);
		var model2 = new JSONModel();
		model2.setData(modelData2);
		this.oVSD.setModel(oModel);

		this.bindAggregations(this.oVSD);
		this.oVSD.open();

		setTimeout(function () {
			var vsdFilterItem = that.oVSD.getFilterItems()[0];
			that.oVSD._switchToPage(3, vsdFilterItem);
			jQuery.sap.delayedCall(0, that.oVSD._getNavContainer(), "to", [ that.oVSD.getId() + '-page2', "slide" ]);
			setTimeout(function () {
				that.oVSD._dialog.getBeginButton().firePress();
				that.oVSD.setModel(model2);
				that.oVSD.open();
				setTimeout(function () {
					assert.strictEqual(that.oVSD._vContentPage, 2, "If no given 'filter details item' exists in a model, " +
						"the current page should be the parent filters page.");
					done();
				}, delay);
			}, delay);
		}, delay);
	});

	QUnit.test("Reopening filter detail page of a removed detail with model change - remove all filters", function (assert) {
		var delay = 10,
			done = assert.async(),
			that = this;

		this.oVSD.setSortDescending(false);
		this.oVSD.setGroupDescending(true);
		var modelData = this.getFirstModelData();
		var modelData2 = this.getSecondModelData();
		delete modelData2.filterData;
		var oModel = new JSONModel();
		oModel.setData(modelData);
		var model2 = new JSONModel();
		model2.setData(modelData2);
		this.oVSD.setModel(oModel);

		this.bindAggregations(this.oVSD);
		this.oVSD.open();

		setTimeout(function () {
			var vsdFilterItem = that.oVSD.getFilterItems()[0];
			that.oVSD._switchToPage(3, vsdFilterItem);
			jQuery.sap.delayedCall(0, that.oVSD._getNavContainer(), "to", [ that.oVSD.getId() + '-page2', "slide" ]);
			setTimeout(function () {
				that.oVSD._dialog.getBeginButton().firePress();
				that.oVSD.setModel(model2);
				that.oVSD.open();
				setTimeout(function () {
					assert.strictEqual(that.oVSD._vContentPage, 0, "If no filters item inside the new model, the first" +
						" available page should be current(in that case 'Sort/0')");
					done();
				}, delay);
			}, delay);
		}, delay);
	});

	QUnit.test("Reopening filter detail page after cancel button click", function (assert) {
		var that = this,
			done = assert.async(),
			filter = new ViewSettingsFilterItem({
				multiSelect: true,
				key: "STATUS",
				text: "STATUS",
				items: [
					new ViewSettingsItem({
						key: "key1",
						text: "Text 1",
						selected: false
					}),
					new ViewSettingsItem({
						key: "key2",
						text: "Text 2",
						selected: true
					})
				]
			});

		that.oVSD.addFilterItem(filter);

		// Step 1
		// Open ViewSettingsDialog
		that.oVSD.open();
		this.oVSD._dialog.attachAfterOpen(afterFirstOpen);

		function afterFirstOpen() {
			// Step 2
			// Simulate navigation to filter details page of STATUS filter item
			var vsdFilterItem = that.oVSD.getFilterItems()[0];
			that.oVSD._switchToPage(3, vsdFilterItem);

			// Assert selected items
			var aFilterItems = that.oVSD._filterDetailList.getItems();
			assert.strictEqual(aFilterItems[0].getSelected(), false, "First item initially should be not selected");
			assert.strictEqual(aFilterItems[1].getSelected(), true, "Second item initially should be selected");

			// Simulate confirm button click
			that.oVSD._onConfirm();
			that.oVSD._dialog.detachAfterOpen(afterFirstOpen);

			// Open ViewSettingsDialog
			that.oVSD.open();
			that.oVSD._dialog.attachAfterOpen(afterSecondOpen);
		}

		function afterSecondOpen() {
			// Step 3
			// Simulate cancel button click
			that.oVSD._onCancel();

			that.oVSD._dialog.detachAfterOpen(afterSecondOpen);
			that.oVSD._dialog.attachAfterClose(afterClose);
		}

		function afterClose() {
			// Step 4
			// Assert selected items
			var aFilterItems = that.oVSD._filterDetailList.getItems();
			assert.strictEqual(aFilterItems[0].getSelected(), false, "First item should be not selected after cancel button click");
			assert.strictEqual(aFilterItems[1].getSelected(), true, "Second item should should be selected after cancel button click");

			that.oVSD._dialog.detachAfterClose(afterClose);

			done();
		}
	});

	QUnit.test("Reopening filter detail page after reset + cancel buttons click", function (assert) {
		var that = this,
			done = assert.async(),
			oVSDFilterItem = new ViewSettingsFilterItem({
				multiSelect: true,
				key: "STATUS",
				text: "STATUS",
				items: [
					new ViewSettingsItem({
						key: "key1",
						text: "Text 1",
						selected: false
					}),
					new ViewSettingsItem({
						key: "key2",
						text: "Text 2",
						selected: false
					})
				]
			});
		// navigates to the details page of the first filter item and calls the given callback once navigation completes
		function navigateToFirstFilterItemsDetailPage(fnCallback) {
			that.oVSD._getNavContainer().attachEventOnce("afterNavigate", fnCallback);
			that.oVSD._filterList.getItems()[1].$().trigger('tap'); //since the header is the 0 element, get the actual first item
		}

		that.oVSD.addFilterItem(oVSDFilterItem);

		// Act
		// - Step 1: go to filter details page, select first item, press ok
		// - Step 2: go to the same details page, select second item, press "reset" button, then press "Cancel" button
		// - Step 3: go to the same details page, deselect first item, select the second item
		// Expectation - confirm event should contain second item as 'filterItems' parameter.


		// Step 1
		// Open ViewSettingsDialog
		// There is no dialog, so we cannot attach to its even "afterOpen", so the only option is to delay the execution
		setTimeout(afterFirstOpen);
		that.oVSD.open();

		function afterFirstOpen() {
			that.oVSD._dialog.detachAfterOpen(afterFirstOpen);

			navigateToFirstFilterItemsDetailPage(function () {
				// pre-assert selected items
				var aFilterItems = that.oVSD._filterDetailList.getItems();
				assert.strictEqual(aFilterItems[0].getSelected(), false, "After first opening of VSD, first item should not be selected");
				assert.strictEqual(aFilterItems[1].getSelected(), false, "After first opening of VSD, ssecond item should not be selected");

				// "Select" first item
				that.oVSD._filterDetailList.getItems()[0].$().trigger('tap');

				// Simulate confirm button click
				that.oVSD._dialog.attachEventOnce("afterClose", afterFirstClose);
				that.oVSD._onConfirm();
			});
		}

		function afterFirstClose() {
			that.oVSD._dialog.attachEventOnce("afterOpen", afterSecondOpen);

			// Step 2
			// Open ViewSettingsDialog
			that.oVSD.open();
		}

		function afterSecondOpen() {
			var aFilterItems = oVSDFilterItem.getItems();
			// pre-asserts
			assert.strictEqual(that.oVSD._getNavContainer().getCurrentPage().getId(), that.oVSD.getId() + "-page2",
				"Filter Details page should be opened after second opening of the VSD");

			assert.strictEqual(aFilterItems[0].getSelected(), true, "After second opening of VSD, first item should be selected");
			assert.strictEqual(aFilterItems[1].getSelected(), false, "After second opening of VSD, second item should not be selected");

			// Simulate Clear filters button click
			that.oVSD.clearFilters();
			// Simulate Cancel Button click
			that.oVSD.attachEventOnce("cancel", cancelHandler);
			that.oVSD._onCancel();
		}

		function cancelHandler() {
			// Step 3
			// Open ViewSettingsDialog
			that.oVSD._dialog.attachEventOnce("afterOpen", afterThirdOpen);
			that.oVSD.open();
		}


		function afterThirdOpen() {
			var aInternalFilterDetailItems = that.oVSD._filterDetailList.getItems(),
				aPublicFilterDetailItems = that.oVSD.getFilterItems()[0].getItems();

			// pre-asserts
			assert.strictEqual(that.oVSD._getNavContainer().getCurrentPage().getId(), that.oVSD.getId() + "-page2",
				"Filter Details page should be opened after third opening of the VSD");

			assert.strictEqual(aInternalFilterDetailItems[0].getSelected(), true, "After third opening of VSD, " +
				"first internal item should be selected");
			assert.strictEqual(aInternalFilterDetailItems[1].getSelected(), false, "After third opening of VSD, " +
				"second internal item should not be selected");

			assert.strictEqual(aPublicFilterDetailItems[0].getSelected(), true, "After third opening of VSD, " +
				"first public item should be selected when dialog opened for the third time");
			assert.strictEqual(aPublicFilterDetailItems[1].getSelected(), false, "After third opening of VSD, " +
				"second public item should not be selected when dialog opened for the third time");

			// deselect the first item
			that.oVSD._filterDetailList.getItems()[0].$().trigger('tap');
			// select the second item
			that.oVSD._filterDetailList.getItems()[1].$().trigger('tap');

			that.oVSD.attachEventOnce('confirm', function (oEvent) {
				assert.ok(oEvent.getParameter("filterItems"), "The confirm event contains values in parameter 'filterItem'");
				assert.deepEqual(oEvent.getParameter("filterItems")[0].getText(), oVSDFilterItem.getItems()[1].getText(),
					".. and only the selected filter sub-item is given as value");
				done();
			});

			// Act
			that.oVSD._onConfirm();
		}
	});


	QUnit.test("_oPreviousState.contentItem is properly cloned when it is bound to a model", function (assert) {
	var that = this,
		done = assert.async(),
		modelData = this.getFirstModelData(),
		oModel = new JSONModel();

	oModel.setData(modelData);
	this.oVSD.setModel(oModel);
	this.bindAggregations(this.oVSD);

	// Step 1
	// Open ViewSettingsDialog
	this.oVSD.open();
	this.oVSD._dialog.attachAfterOpen(afterFirstOpen);

	function afterFirstOpen() {
		// Step 2
		// Simulate navigation to filter details page of STATUS filter item
		var vsdFilterItem = that.oVSD.getFilterItems()[0];
		that.oVSD._switchToPage(3, vsdFilterItem);

		// Assert items text
		var aFilterItems = that.oVSD._filterDetailList.getItems();
		assert.strictEqual(aFilterItems[0].getTitle(), "item2", "Text of the item is properly set");

		// Simulate confirm button click
		that.oVSD._onConfirm();
		that.oVSD._dialog.detachAfterOpen(afterFirstOpen);

		// Open ViewSettingsDialog
		that.oVSD.open();
		that.oVSD._dialog.attachAfterOpen(afterSecondOpen);
	}

	function afterSecondOpen() {
		// Step 3
		// Assert
		var aFilterItems = that.oVSD._oPreviousState.contentItem.getItems();
		assert.strictEqual(aFilterItems[0].getText(), "item2", "Text of the previous state content item is properly set");

		that.oVSD._dialog.detachAfterOpen(afterSecondOpen);

		done();
	}
});

	QUnit.test("Reset Button is available on second open of the ViewSettinsDialog", function (assert) {
		var modelData = this.getFirstModelData();
		var modelData2 = this.getSecondModelData();
		var oModel = new JSONModel();
		oModel.setData(modelData);
		var model2 = new JSONModel();
		model2.setData(modelData2);
		this.oVSD.setModel(oModel);

		this.bindAggregations(this.oVSD);

		this.oVSD.open();
		this.oVSD._switchToPage(2);
		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3,this.oVSD.getFilterItems()[0]);

		assert.strictEqual(this.oVSD._getSubHeader().getContentRight().length, 0, "Reset Button should be removed from page1 on going to filter details view");

		this.oVSD._dialog.getBeginButton().firePress();

		this.oVSD.setModel(model2);
		this.oVSD.open();
		assert.strictEqual(this.oVSD._getHeader().getContentRight().length, 1, "Reset Button should be available on page1 when the dialog is opened again");
	});

	QUnit.test("Reset group items selection on cancel", function (assert) {
		var delay = 1000,
			done = assert.async(),
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		var aGroupItems = [
			new ViewSettingsItem({
				key: "test1",
				text: "test1"
			}),
			new ViewSettingsItem({
				key: "test2",
				text: "test2"
			}),
			new ViewSettingsItem({
				key: "test3",
				text: "test3"
			})];

		aGroupItems.forEach(function (oItem) {
			this.oVSD.addGroupItem(oItem);
		}, this);
		this.oVSD.open();
		sap.ui.getCore().applyChanges();

		assert.strictEqual(sap.ui.getCore().byId(this.oVSD.getSelectedGroupItem()).getText(),
				oResourceBundle.getText("VIEWSETTINGS_NONE_ITEM"),
				"Should have None button selected");

		this.oVSD.setSelectedGroupItem(aGroupItems[0]);
		sap.ui.getCore().applyChanges();
		assert.notStrictEqual(sap.ui.getCore().byId(this.oVSD.getSelectedGroupItem()).getText(),
				oResourceBundle.getText("VIEWSETTINGS_NONE_ITEM"),
				"Should have changed the selection");

		this.oVSD._dialog.getEndButton().firePress();
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			this.oVSD.open();
			assert.strictEqual(sap.ui.getCore().byId(this.oVSD.getSelectedGroupItem()).getText(),
				oResourceBundle.getText("VIEWSETTINGS_NONE_ITEM"),
				"Previous selection should have been reset");
			done();
		}.bind(this), delay);
	});

	QUnit.module("Data binding", {
		beforeEach : function () {
			this.oVSD = new ViewSettingsDialog();
			this.bindAggregations(this.oVSD);

			this.oVSD.placeAt("content");
			sap.ui.getCore().applyChanges();

		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		},
		getFirstModelData: function() {
			return {
				sortData: [
					{
						myKey: "key1",
						myText: "Sort text 1 A"
					},
					{
						myKey: "key2",
						myText: "Sort text 2 A"
					}],
				groupData: [
					{
						myKey: "groupKey1",
						myText: "Group text A"
					},
					{
						myKey: "groupKey2",
						myText: "Group text 2 A"
					}],
				filterData: [
					{
						myKey: "filterKey1",
						myText: "Filter text A",
						myItems: [
							{
								myKey: 'item1',
								myText: 'item A'
							}
						]
					},
					{
						myKey: "filterKey2",
						myText: "Filter text 2 A"
					}]
			};
		},
		getSecondModelData: function() {
			return {
				sortData: [
					{
						myKey: "key2",
						myText: "Sort text 1 B"
					}],
				groupData: [
					{
						myKey: "groupKey2",
						myText: "Group text B"
					}],
				filterData: [
					{
						myKey: "filterKey1",
						myText: "Filter text B",
						myItems: [
							{
								myKey: 'item2',
								myText: 'item B'
							}
						]
					}]
			};
		},
		bindAggregations: function(oVsdInst) {
			var template1 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}"
			});
			var template2 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}"
			});
			var template3 = new ViewSettingsFilterItem({
				key: "{myKey}",
				text: "{myText}",
				items: {
					path: 'myItems',
					template: new ViewSettingsItem({
						key: "{myKey}",
						text: "{myText}",
						selected: "{selected}"
					}),
					templateShareable: true
				}
			});

			var oModel = new JSONModel();
			oModel.setData(this.getFirstModelData());

			this.oVSD.setModel(oModel);

			this.oVSD.bindAggregation("sortItems", "/sortData", template1);
			this.oVSD.bindAggregation("groupItems", "/groupData", template2);
			this.oVSD.bindAggregation("filterItems", "/filterData", template3);
		}
	});

	QUnit.test("Change sort items in the model", function (assert) {
		var done = assert.async();
		this.oVSD.open();

		var aItems = this.oVSD._sortList.getItems();
		var oItem = aItems[1]; //since the header is the 0 element, get the actual first item
		var sFirstItemId = oItem.getId();
		var sTitleSelector = "#" + this.oVSD._getDialog().getId() + " .sapMSLITitleOnly";

		setTimeout(function () {
			assert.strictEqual(oItem.getTitle(), 'Sort text 1 A', 'Correct item is being asserted.');
			assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before mode property change.');

			var oSecondData = this.getSecondModelData()['sortData'];
			this.oVSD.getModel().setProperty('/sortData', oSecondData);

			setTimeout(function () {
				var aItems = this.oVSD._sortList.getItems();
				var oItem = aItems[1]; //since the header is the 0 element, get the actual first item
				var sSecondItemId = oItem.getId();

				assert.strictEqual(oItem.getTitle(), 'Sort text 1 B', 'Correct item is being asserted.');
				assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');
				oSecondData.push({
					myKey: 'test1',
					myText: 'test1'
				});

				this.oVSD.getModel().setProperty('/sortData', oSecondData);

				setTimeout(function () {
					assert.strictEqual(jQuery(sTitleSelector).length, 4, 'Item was successfully added.');
					oSecondData.unshift({
						myKey: 'test2',
						myText: 'test2'
					});
					this.oVSD.getModel().setProperty('/sortData', oSecondData);
					setTimeout(function () {
						assert.strictEqual(jQuery(sTitleSelector).length, 5, 'Item was successfully inserted.');
						done();
					}, 10);
				}.bind(this), 10);
			}.bind(this), 10);

		}.bind(this), 10);
	});


	QUnit.test("Change filter items in the model", function (assert) {
		var done = assert.async();

		this.oVSD.open();
		this.oVSD._switchToPage(2);

		var aItems = this.oVSD._filterList.getItems();
		var oItem = aItems[1]; //since the header is the 0 element, get the actual first item
		var sFirstItemId = oItem.getId();
		var sTitleSelector = "#" + this.oVSD._getDialog().getId() + " .sapMSLITitleOnly";

		setTimeout(function () {
			assert.strictEqual(oItem.getTitle(), 'Filter text A', 'Correct item is being asserted.');
			assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before mode property change.');

			var oSecondData = this.getSecondModelData()['filterData'];
			this.oVSD.getModel().setProperty('/filterData', oSecondData);

			setTimeout(function () {
				var aItems = this.oVSD._filterList.getItems();
				var oItem = aItems[1]; //since the header is the 0 element, get the actual first item
				var sSecondItemId = oItem.getId();

				assert.strictEqual(oItem.getTitle(), 'Filter text B', 'Correct item is being asserted.');
				assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');

				oSecondData.push({
					myKey: 'test1',
					myText: 'test1'
				});

				this.oVSD.getModel().setProperty('/filterData', oSecondData);

				assert.strictEqual(jQuery(sTitleSelector).length, 1, 'Starting with one item.');
				setTimeout(function () {
					assert.strictEqual(jQuery(sTitleSelector).length, 2, 'Item was successfully added.');
					oSecondData.unshift({
						myKey: 'test2',
						myText: 'test2'
					});
					this.oVSD.getModel().setProperty('/filterData', oSecondData);
					setTimeout(function () {
						assert.strictEqual(jQuery(sTitleSelector).length, 3, 'Item was successfully inserted.');
						done();
					}, 10);
				}.bind(this), 10);
			}.bind(this), 10);

		}.bind(this), 10);
	});



	QUnit.test("Change filter detail items in the model", function (assert) {
		var done = assert.async();

		this.oVSD.open();

		this.oVSD._getPage2().getCustomHeader().getContentMiddle();

		jQuery.sap.delayedCall(0, this.oVSD._navContainer, "to", [this.oVSD.getId() + '-page2', "show"]);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]);

		var aItems = this.oVSD._filterDetailList.getItems();
		var oItem = aItems[0];
		var sFirstItemId = oItem.getId();
		var sTitleSelector = "#" + this.oVSD._getDialog().getId() + " .sapMSLITitleOnly";


		setTimeout(function () {
			assert.strictEqual(oItem.getTitle(), 'item A', 'Correct item is being asserted.');
			assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before mode property change.');

			var oSecondData = this.getSecondModelData()['filterData'];
			this.oVSD.getModel().setProperty('/filterData', oSecondData);

			setTimeout(function () {
				var aItems = this.oVSD._filterDetailList.getItems();
				var oItem = aItems[0];
				var sSecondItemId = oItem.getId();

				assert.strictEqual(oItem.getTitle(), 'item B', 'Correct item is being asserted.');
				assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');

				assert.strictEqual(this.oVSD._getPage2().getCustomHeader().getContentMiddle()[0].getText(),
						sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("VIEWSETTINGS_TITLE_FILTERBY") + " Filter text B",
						'Title correctly changed in the header.');

				oSecondData[0].myItems.push({
					myKey: 'test1',
					myText: 'test1'
				});

				this.oVSD.getModel().setProperty('/filterData', oSecondData);

				setTimeout(function () {
					assert.strictEqual(jQuery(sTitleSelector).length, 2, 'Item was successfully added.');
					oSecondData[0].myItems.unshift({
						myKey: 'test2',
						myText: 'test2'
					});
					this.oVSD.getModel().setProperty('/filterData', oSecondData);
					setTimeout(function () {
						assert.strictEqual(jQuery(sTitleSelector).length, 3, 'Item was successfully inserted.');
						done();
					}, 10);
				}.bind(this), 10);
			}.bind(this), 10);
		}.bind(this), 10);
	});

	QUnit.test("Change filter detail items in the model when user is at filter page", function (assert) {
		//Prepare
		var oClock = sinon.useFakeTimers(),
			$Counter;

		this.oVSD.open("filter");
		oClock.tick(100);
		$Counter = this.oVSD.$().find(".sapMLIBCounter");
		assert.equal($Counter.length, 0, "No Facet Filter Item counter, as there is no selected subitems yet");

		//Act
		setTimeout(function() {
			this.oVSD.getModel().setProperty('/filterData/0/myItems', [
				{myKey: "k1", myText: "Filter subitem 1, selected", selected: true },
				{myKey: "k2", myText: "Filter subitem 2, selected", selected: true }
			]);
			sap.ui.getCore().applyChanges();

			//Assert
			$Counter = this.oVSD.$().find(".sapMLIBCounter");
			assert.equal($Counter.length, 1, "There should be a Facet Filter Item counter");
			assert.equal($Counter.text(), "2", "The counter should display '2' as there are 2 sub-items selected");

			//Cleanup
			oClock.restore();
		}.bind(this), 10);

		oClock.tick(15);
	});
	QUnit.test("Change group items in the model", function (assert) {
		var done = assert.async();

		this.oVSD.open();
		this.oVSD._switchToPage(1);

		var aItems = this.oVSD._groupList.getItems();
		var oItem = aItems[1]; //since the header is the 0 element, get the actual first item
		var sFirstItemId = oItem.getId();
		var sTitleSelector = "#" + this.oVSD._getDialog().getId() + " .sapMSLITitleOnly";

		setTimeout(function () {
			assert.strictEqual(oItem.getTitle(), 'Group text A', 'Correct item is being asserted.');
			assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before mode property change.');

			var oSecondData = this.getSecondModelData()['groupData'];
			this.oVSD.getModel().setProperty('/groupData', oSecondData);

			setTimeout(function () {
				var aItems = this.oVSD._groupList.getItems();
				var oItem = aItems[1]; //since the header is the 0 element, get the actual first item
				var sSecondItemId = oItem.getId();

				assert.strictEqual(oItem.getTitle(), 'Group text B', 'Correct item is being asserted.');
				assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');

				oSecondData.push({
					myKey: 'test1',
					myText: 'test1'
				});

				this.oVSD.getModel().setProperty('/groupData', oSecondData);

				assert.strictEqual(jQuery(sTitleSelector).length, 4, 'Starting with four items.');

				setTimeout(function () {
					assert.strictEqual(jQuery(sTitleSelector).length, 5, 'Item was successfully added.');
					oSecondData.unshift({
						myKey: 'test2',
						myText: 'test2'
					});
					this.oVSD.getModel().setProperty('/groupData', oSecondData);
					setTimeout(function () {
						assert.strictEqual(jQuery(sTitleSelector).length, 6, 'Item was successfully inserted.');
						done();
					}, 10);
				}.bind(this), 10);
			}.bind(this), 10);
		}.bind(this), 10);
	});


	QUnit.module("Others");

	QUnit.test("customControl is cloned as expected", function (assert) {
		var oViewSettingsCustomItem = new ViewSettingsCustomItem({
			text     : "SomeText",
			key      : "SomeKey",
			customControl : new Input()
		});

		var oClone = oViewSettingsCustomItem.clone();
		assert.ok(!!oClone.getCustomControl(), "Custom control is cloned");
	});

	QUnit.test("_initFilterDetailItems does not throw exception with custom item", function(assert) {
		var oViewSettingsCustomItem = new ViewSettingsCustomItem({
			text: "SomeText",
			key: "SomeKey",
			customControl: new Input()
		});

		new ViewSettingsDialog()._initFilterDetailItems(oViewSettingsCustomItem);
		assert.ok(true, "does not throw exception");

		oViewSettingsCustomItem.destroy();
	});

	QUnit.test("model is propagated to the dialog", function(assert){
		var oVSD = new ViewSettingsDialog(),
				sData = "this is the model",
				oModel = new JSONModel({ data: sData});

		oVSD.setModel(oModel);
		assert.equal(oVSD._getDialog().getModel().oData["data"], sData, "the model is propagated to the dialog");
	});

	// BCP: 1770477750
	QUnit.test("Navigating between custom tabs works as expected", function (assert) {
		var done = assert.async(),
			oCustomTab1Content = new Button("button1", { text: "Custom Tab 1" }),
			oCustomTab2Content = new Button("button2", { text: "Custom Tab 2" }),
			oViewSettingsDialog = new ViewSettingsDialog({
				customTabs: [
					new ViewSettingsCustomTab({icon:"sap-icon://action-settings", content: oCustomTab1Content }),
					new ViewSettingsCustomTab({icon:"sap-icon://settings", content: oCustomTab2Content })
				]
			});

		oViewSettingsDialog.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oViewSettingsDialog.open();

		oViewSettingsDialog._dialog.attachAfterOpen(function () {
			assert.equal(oViewSettingsDialog._vContentPage, "__tab0", "First Custom tab is opened");
			assert.equal(oViewSettingsDialog._getPage1().getContent()[0].getId(), "button1", "content of the page is the same as the first tab's content");

			// act: change custom tab to the second tab
			oViewSettingsDialog._getSegmentedButton().getButtons()[1].firePress();

			assert.equal(oViewSettingsDialog._vContentPage, "__tab1", "Second Custo tab is opened");
			assert.equal(oViewSettingsDialog._getPage1().getContent()[0].getId(), "button2", "content of the page is the same as the second tab's content");

			oViewSettingsDialog.destroy();
			oViewSettingsDialog = null;
			done();
		});
	});

	QUnit.test("none preset filter item has unique id", function(assert) {
		//arrange
		var oVSD1 = new ViewSettingsDialog(),
			aVSD1Items;

		oVsdConfig.addPresetFilterItems(oVSD1);

		//act
		oVSD1.open();
		aVSD1Items = oVSD1._presetFilterList.getItems();

		//assert
		assert.ok(aVSD1Items[aVSD1Items.length - 1].getId(), oVSD1._presetFilterList.getId() + "-none-list-item", "none preset filter item has correct id");

		//clean
		oVSD1.destroy();
	});

	QUnit.test("Item selection does not trigger re-rendering", function (assert) {
		//arrange
		var oSetPropertySpy = sinon.spy(ManagedObject.prototype, "setProperty"),
			oItem = new ViewSettingsItem({
				key: "test",
				text: "2",
				selected: false
			});

		oSetPropertySpy.reset();

		//act
		oItem.setSelected(true);

		//assert
		assert.ok(oSetPropertySpy.calledOnce, "called once");
		assert.strictEqual(oSetPropertySpy.thisValues[0], oItem, "called on the right item");
		assert.strictEqual(oSetPropertySpy.args[0][0], "selected", "called with the right property name");
		assert.strictEqual(oSetPropertySpy.args[0][2], true, "called with suppressinvalidate");

		//clean
		oItem.destroy();
	});

	QUnit.test("ViewSettingsDialog opens every time after destroy", function (assert) {
		//arrange
		var oVSD,
			fnCreateDialog = function() {
				oVSD = new ViewSettingsDialog("testVsd", {
					title: "View Setting Dialog"
				});
				oVSD.open();
			};

		//act
		fnCreateDialog();
		oVSD.open();
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(jQuery(sap.ui.getCore().getStaticAreaRef()).find(".sapMVSD").length, 1, "ViewSettingsDialog is rendered first time");

		//act
		oVSD._dialog.getEndButton().firePress();
		sap.ui.getCore().applyChanges();
		oVSD.destroy();
		fnCreateDialog();
		oVSD.open();
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(jQuery(sap.ui.getCore().getStaticAreaRef()).find(".sapMVSD").length, 1, "ViewSettingsDialog is rendered second time");

		//clean
		oVSD.destroy();
	});

	QUnit.skip("ViewSettingsDialog escapes Filter items on creation", function (assert) {
		//arrange
		var oEscapeSpy = this.spy(ManagedObject, "escapeSettingsValue"),
			filterItems = [
				new ViewSettingsFilterItem({
				text : "aaa { bbb"
				})
			],
			oVSD = new ViewSettingsDialog("testVsd", {
						title: "View Setting Dialog",
						filterItems : filterItems
					});

		//act
		oVSD.open();
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oEscapeSpy.callCount, 1, "escape was called once for the setted Filter Item");

		//clean
		oVSD.destroy();
	});

	QUnit.skip("ViewSettingsDialog escapes Filter Detail items on creation", function (assert) {
		//arrange
		var oEscapeSpy = this.spy(ManagedObject, "escapeSettingsValue"),
			filterItems = [
				new ViewSettingsFilterItem({
				text : "filter item",
				items : [
						new ViewSettingsItem({
							text : "aaa { bbb"
						})
					]
				})
			],
			oVSD = new ViewSettingsDialog("testVsd", {
						title: "View Setting Dialog",
						filterItems : filterItems
					});

		//act
		oVSD.open();
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oEscapeSpy.callCount, 1, "escape was called once for the setted Filter Detail Item");

		//clean
		oVSD.destroy();
	});

	QUnit.skip("ViewSettingsDialog escapes Group items on creation", function (assert) {
		//arrange
		var oEscapeSpy = this.spy(ManagedObject, "escapeSettingsValue"),
			groupItems = [
				new ViewSettingsItem({
						text : "aaa { bbb"
				})
			],
			oVSD = new ViewSettingsDialog("testVsd", {
						title: "View Setting Dialog",
						groupItems : groupItems
					});

		//act
		oVSD.open();
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oEscapeSpy.callCount, 1, "escape was called once for the setted Group Item");

		//clean
		oVSD.destroy();
	});

	QUnit.test("ViewSettingsItem from filterItems should pass tooltip to the ListItem", function (assert) {
		// Arrange
		var aResult = [],
			oViewSettingsItem = new ViewSettingsFilterItem({
				text: "oFixedFilter",
				key: "oFixedFilter",
				tooltip: "oFixedFilter"
			}),
			oViewSettingsDialog = new ViewSettingsDialog({
			filterItems: oViewSettingsItem
		});
		oViewSettingsDialog._presetFilterList = oViewSettingsDialog._filterList = {
			destroy: function () {},
			destroyItems: function () {},
			addItem: function (oItem) { aResult.push(oItem); }
		};

		// Act
		oViewSettingsDialog._initFilterItems();

		// Assert
		assert.equal(aResult[1].getTooltip(), oViewSettingsItem.getTooltip(),
				"Tooltip from ViewSettingsItem is passed to StandardListItem"); //since the header is the 0 element, get the actual first item

		// Cleanup
		oViewSettingsDialog.destroy();
	});

	QUnit.test("ViewSettingsItem from presetFilterItems should pass tooltip to the ListItem", function (assert) {
		// Arrange
		var aResult = [],
			oViewSettingsItem = new ViewSettingsFilterItem({
				text: "oFixedFilter",
				key: "oFixedFilter",
				tooltip: "oFixedFilter"
			}),
			oViewSettingsDialog = new ViewSettingsDialog({
				presetFilterItems: oViewSettingsItem
			});
		oViewSettingsDialog._presetFilterList = oViewSettingsDialog._filterList = {
			getId: function () {},
			destroy: function () {},
			destroyItems: function () {},
			addItem: function (oItem) { aResult.push(oItem); }
		};

		// Act
		oViewSettingsDialog._initFilterItems();

		// Assert
		assert.equal(aResult[0].getTooltip(), oViewSettingsItem.getTooltip(), "Tooltip from ViewSettingsItem is passed to StandardListItem");

		// Cleanup
		oViewSettingsDialog.destroy();
	});

	QUnit.test("ViewSettingsItem from groupItems should pass tooltip to the ListItem", function (assert) {
		// Arrange
		var aResult = [],
			oViewSettingsItem = new ViewSettingsFilterItem({
				text: "oFixedFilter",
				key: "oFixedFilter",
				tooltip: "oFixedFilter"
			}),
			oViewSettingsDialog = new ViewSettingsDialog({
				groupItems: oViewSettingsItem
			});
		oViewSettingsDialog._groupList = oViewSettingsDialog._ariaGroupListInvisibleText = {
			getId: function () {},
			destroy: function () {},
			destroyItems: function () {},
			addItem: function (oItem) { aResult.push(oItem); }
		};

		// Act
		oViewSettingsDialog._initGroupItems();

		// Assert
		assert.equal(aResult[1].getTooltip(), oViewSettingsItem.getTooltip(),
				"Tooltip from ViewSettingsItem is passed to StandardListItem"); //since the header is the 0 element, get the actual first item

		// Cleanup
		oViewSettingsDialog.destroy();
	});

	QUnit.test("ViewSettingsItem from sortItems should pass it's tooltip to the StandardListItem", function (assert) {
		// Arrange
		var oViewSettingsItem = new ViewSettingsItem({
			text: "Sort item",
			tooltip: "Tooltip for the sort item"
		}),
		oViewSettingsDialog = new ViewSettingsDialog({
			sortItems: oViewSettingsItem
		});

		//Assert
		//since the header is the 0 element, get the actual first item
		assert.ok(oViewSettingsDialog._sortList.getItems()[1].getTooltip(),
			"Tooltip from ViewSettingsItem is passed to the StandardListItem");

		// Cleanup
		oViewSettingsDialog.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach : function () {
			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this.oVSD = new ViewSettingsDialog();
			this.bindAggregations(this.oVSD);

			this.oVSD.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		},
		getFirstModelData: function() {
			return {
				sortData: [
					{
						myKey: "key1",
						myText: "Sort text 1 A"
					},
					{
						myKey: "key2",
						myText: "Sort text 2 A"
					}],
				groupData: [
					{
						myKey: "groupKey1",
						myText: "Group text A"
					},
					{
						myKey: "groupKey2",
						myText: "Group text 2 A"
					}],
				filterData: [
					{
						myKey: "filterKey1",
						myText: "Filter text A",
						myItems: [
							{
								myKey: 'item1',
								myText: 'item A'
							}
						]
					},
					{
						myKey: "filterKey2",
						myText: "Filter text 2 A"
					}]
			};
		},
		bindAggregations: function(oVsdInst) {
			var template1 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}"
			});
			var template2 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}"
			});
			var template3 = new ViewSettingsFilterItem({
				key: "{myKey}",
				text: "{myText}",
				items: {
					path: 'myItems',
					template: new ViewSettingsItem({
						key: "{myKey}",
						text: "{myText}"
					}),
					templateShareable: true
				}
			});

			var oModel = new JSONModel();
			oModel.setData(this.getFirstModelData());

			this.oVSD.setModel(oModel);

			this.oVSD.bindAggregation("sortItems", "/sortData", template1);
			this.oVSD.bindAggregation("groupItems", "/groupData", template2);
			this.oVSD.bindAggregation("filterItems", "/filterData", template3);
		},
		focusItem: function (sItemId) {
			jQuery("#" + sItemId).focus();
		},
		checkItemFocus: function (sItemId) {
			assert.strictEqual(document.activeElement.id, sItemId, "The proper item is focused");
		}
	});

	QUnit.test("Focus on sortItems is being preserved on re-rendering", function (assert) {
		var aSortItems, sItemToSelect,
				done = assert.async();

		this.oVSD.open();
		this.oVSD._switchToPage(0);
		aSortItems = this.oVSD.getSortItems();
		oListItem = this.oVSD._getListItem("sort", aSortItems[1]);

		setTimeout(function () {
			this.focusItem(oListItem.getId());
			this.oVSD._dialog.rerender();
			this.checkItemFocus(oListItem.getId());
			done();
		}.bind(this), 500);
	});

	QUnit.test("Focus on groupItems is being preserved on re-rendering", function (assert) {
		var aSortItems, sItemToSelect,
				done = assert.async();

		this.oVSD.open();
		this.oVSD._switchToPage(1);
		aSortItems = this.oVSD.getGroupItems();
		sItemToSelect = aSortItems[1].getId();

		setTimeout(function () {
			this.focusItem(sItemToSelect + "-list-item");
			this.oVSD._dialog.rerender();
			this.checkItemFocus(sItemToSelect + "-list-item");
			done();
		}.bind(this), 500);
	});

	QUnit.test("ViewSettingsDialog sets ariaLabelledBy of the Dialog to the title id", function (assert) {
		// Prepare
		var sExpectedId = this.oVSD._sTitleLabelId,
			aDialogAriaLabelledBy = this.oVSD._getDialog().getAriaLabelledBy();

		// Assert
		assert.strictEqual(this.oVSD._getTitleLabel().getId(), sExpectedId, "id of the Dialog title is equal to the 'dialogId + -title' suffix");
		assert.strictEqual(aDialogAriaLabelledBy[0], sExpectedId, "ariaLabeledBy attribute of the Dialog is equal to the Dialog title id");
		assert.strictEqual(aDialogAriaLabelledBy.indexOf(this.oVSD._sFilterDetailTitleLabelId), -1,
			"VSD's filter detail title isn't referenced when the filter detail page isn't currently opened");
	});

	QUnit.test("VSD sets adjusts Dialog's ariaLabelledBy for the detailed filter page", function (assert) {
		// Prepare
		var aAriaLabelledBy;

		function openAndNavigateToFilterDetailsPage(oVSD) {
			oVSD.open("filter");
			var oItem = oVSD._filterList.getItems()[1].data("item"); //since the header is the 0 element, get the actual first item
			//this is a simulation of click on the single filter item, that provokes slide to the nav container's page2
			oVSD._switchToPage(3, oItem);
			oVSD._prevSelectedFilterItem = oItem;
			oVSD._navContainer.to(oVSD.getId() + '-page2', "slide");
		}

		// Act
		openAndNavigateToFilterDetailsPage(this.oVSD);
		sap.ui.getCore().applyChanges();

		aAriaLabelledBy = this.oVSD._getDialog().getAriaLabelledBy();

		// Assert
		assert.strictEqual(aAriaLabelledBy[0], this.oVSD._sFilterDetailTitleLabelId,  "The filter detail title is applied");
		assert.strictEqual(aAriaLabelledBy.indexOf(this.oVSD._sTitleLabelId), -1,
			"VSD's standard title isn't referenced in aria-labelledby for the filter details");

	});

	QUnit.module("Reset Button", {
		beforeEach : function () {
			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this.oVSD = new ViewSettingsDialog();
			this.bindAggregations(this.oVSD);

			this.oVSD.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oVSD.destroy();
			this.oVSD = null;
		},
		getFirstModelData: function() {
			return {
				sortData: [
					{
						myKey: "key1",
						myText: "Sort text 1 A",
						selected: true
					},
					{
						myKey: "key2",
						myText: "Sort text 2 A"
					}],
				groupData: [
					{
						myKey: "groupKey1",
						myText: "Group text A",
						selected: true
					},
					{
						myKey: "groupKey2",
						myText: "Group text 2 A"
					}],
				filterData: [
					{
						myKey: "filterKey1",
						myText: "Filter text A",
						myItems: [
							{
								myKey: 'item1',
								myText: 'item A'
							}
						]
					},
					{
						myKey: "filterKey2",
						myText: "Filter text 2 A"
					}]
			};
		},
		bindAggregations: function(oVsdInst) {
			var template1 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}",
				selected: "{selected}"
			});
			var template2 = new ViewSettingsItem({
				key: "{myKey}",
				text: "{myText}",
				selected: "{selected}"
			});
			var template3 = new ViewSettingsFilterItem({
				key: "{myKey}",
				text: "{myText}",
				items: {
					path: 'myItems',
					template: new ViewSettingsItem({
						key: "{myKey}",
						text: "{myText}"
					}),
					templateShareable: true
				}
			});

			var oModel = new JSONModel();
			oModel.setData(this.getFirstModelData());

			this.oVSD.setModel(oModel);

			this.oVSD.bindAggregation("sortItems", "/sortData", template1);
			this.oVSD.bindAggregation("groupItems", "/groupData", template2);
			this.oVSD.bindAggregation("filterItems", "/filterData", template3);
		},
		focusItem: function (sItemId) {
			jQuery("#" + sItemId).focus();
		},
		checkItemFocus: function (sItemId) {
			assert.strictEqual(document.activeElement.id, sItemId, "The proper item is focused");
		}
	});

	QUnit.test("Enabled/disabled state", function (assert) {

		this.oVSD.open();
		sap.ui.getCore().applyChanges();

		// Check initial Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), false, "Reset button is initially disabled");

		// Select second Sort item
		this.oVSD.setSelectedSortItem(this.oVSD.getSortItems()[1]);
		this.oVSD._switchToPage(0);
		// Check Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), true, "Select second Sort By item - Reset button is enabled");

		// Select first Sort item
		this.oVSD.setSelectedSortItem(this.oVSD.getSortItems()[0]);
		this.oVSD._switchToPage(0);
		// Check Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), false, "Select first Sort By item - Reset button is disabled");

		// Select second Group item
		this.oVSD.setSelectedGroupItem(this.oVSD.getGroupItems()[1]);
		this.oVSD._switchToPage(1);
		// Check Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), true, "Select second Group By item - Reset button is enabled");

		// Select first Group item
		this.oVSD.setSelectedGroupItem(this.oVSD.getGroupItems()[0]);
		this.oVSD._switchToPage(1);
		// Check Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), false, "Select first Group By item - Reset button is disabled");

		// Select first Filter item
		this.oVSD.getFilterItems()[0].getItems()[0].setSelected(true);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]);
		// Check Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), true, "Select first available Filter item - Reset button is enabled");

		// Deselect first Filter item
		this.oVSD.getFilterItems()[0].getItems()[0].setSelected(false);
		this.oVSD._switchToPage(3, this.oVSD.getFilterItems()[0]);
		// Check Reset button state
		assert.strictEqual(this.oVSD._getResetButton().getEnabled(), false, "Unselect first available Filter item - Reset button is disabled");

	});

	QUnit.test("Reset functionality", function (assert) {

		// open the VSD
		this.oVSD.open();
		var spy = this.spy(this.oVSD, "_globalReset");

		// get initial Sort, Group and Filters
		var sSortInitial = this.oVSD.getSelectedSortItem();
		var sGroupInitial = this.oVSD.getSelectedGroupItem();
		var sFiltersInitial = this.oVSD.getSelectedFilterItems();

		// do some changes
		this.oVSD.setSelectedSortItem(this.oVSD.getSortItems()[1]);
		this.oVSD.setSelectedGroupItem(this.oVSD.getGroupItems()[1]);
		this.oVSD.getFilterItems()[0].getItems()[0].setSelected(true);

		// get Sort, Group and Filters that are just set
		var sSortBefore = this.oVSD.getSelectedSortItem();
		var sGroupBefore = this.oVSD.getSelectedGroupItem();
		var sFiltersBefore = this.oVSD.getSelectedFilterItems();

		// Check if the values are really changed
		assert.strictEqual(sSortInitial !== sSortBefore && sGroupInitial !== sGroupBefore && sFiltersInitial.length !== sFiltersBefore.length, true, "New Sort, Group and Filter items are selected successfully");

		this.oVSD._getResetButton().firePress();
		assert.equal(spy.callCount, 1, "Reset button Press handler is called");

		// get Sort, Group and Filters after the reset
		var sSortAfter = this.oVSD.getSelectedSortItem();
		var sGroupAfter = this.oVSD.getSelectedGroupItem();
		var sFiltersAfter = this.oVSD.getSelectedFilterItems();

		// Check if the values are reset to their initial values
		assert.strictEqual(sSortInitial === sSortAfter && sGroupInitial === sGroupAfter && sFiltersInitial.length === sFiltersAfter.length, true, "After the Reset, Sort, Group and Filter items are restored to initial values successfully");

	});

	return waitForThemeApplied();
});