/*global QUnit */
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
	"sap/m/Input"
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
	Input
) {
	// shortcut for sap.m.LabelDesign
	var LabelDesign = mobileLibrary.LabelDesign;

	createAndAppendDiv("content");



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

	QUnit.module("Custom tabs", {
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

	QUnit.test("Buttons for all custom tabs should be rendered", function (assert) {
		var sId = this.oVSD.getId();

		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory('taxi-settings'));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory('other-tab'));
		this.oVSD.open();
		assert.ok(jQuery.sap.domById(sId + "-custom-button-taxi-settings"), "Button is rendered custom tab.");
		assert.ok(jQuery.sap.domById(sId + "-custom-button-other-tab"), "Button is rendered custom tab.");
	});

	QUnit.test("Check if all tabs contents are rendered when tab is focused.", function (assert) {
		this.oVSD.insertAggregation('customTabs', new ViewSettingsCustomTab({
			id	 	: 'taxi-settings',
			content : [
				new Button({
					id	: 'taxi-settings-button-content2',
					text: 'test'
				}),
				new CheckBox({
					name: 'test',
					text: 'test4'
				})
			]

		}));

		this.oVSD.open();
		assert.ok(jQuery.sap.domById('taxi-settings-button-content2'), "Custom page contents are rendered.");
	});

	QUnit.test("Make sure 'reset' button is rendered when on custom page.", function (assert) {
		var sId = this.oVSD.getId();
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory('taxi-settings'));

		this.oVSD.open();
		assert.ok(jQuery.sap.domById(sId + "-resetbutton"), "Reset button should be rendered");
	});

	/* [start]  Actual unit tests of custom tabs */
	QUnit.test("Check the _isValidPredefinedPageId method for correctly invalidating page ids.", function (assert) {
		var	sFirstCustomTabId	= 'taxi-settings5',
			sSecondCustomTabId 	= 'other-tab5',
			sSuccessMsg,
			sPageId,
			sSuccessMsgPrefix;

		var bEmptyContent = true;
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId, bEmptyContent));

		sPageId 			= 'sort';
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is NOT a valid predefined page id when no ' + sPageId + ' items are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , false, sSuccessMsgPrefix + sSuccessMsg);

		sPageId 			= 'filter';
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is NOT a valid predefined page id when no ' + sPageId + ' items are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , false, sSuccessMsgPrefix + sSuccessMsg);

		sPageId 			= 'group';
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is NOT a valid predefined page id when no custom tabs are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , false, sSuccessMsgPrefix + sSuccessMsg);

		sPageId 			= sFirstCustomTabId;
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is NOT a valid predefined page id when no custom tabs are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , false, sSuccessMsgPrefix + sSuccessMsg);

		sPageId 			= sSecondCustomTabId;
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is NOT a valid predefined page id.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , false, sSuccessMsgPrefix + sSuccessMsg);
	});

	QUnit.test("Check the _isValidPredefinedPageId method for correctly validating page ids.", function (assert) {
		var sFirstCustomTabId	= 'taxi-settings5',
			sSuccessMsg,
			sPageId,
			sSuccessMsgPrefix;

		oVsdConfig.addSortItems(this.oVSD);
		sPageId 			= 'sort';
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is a valid predefined page id after ' + sPageId + ' items are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , true, sSuccessMsgPrefix + sSuccessMsg);

		oVsdConfig.addFilterItems(this.oVSD);
		sPageId 			= 'filter';
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is a valid predefined page id after ' + sPageId + ' items are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , true, sSuccessMsgPrefix + sSuccessMsg);


		oVsdConfig.addGroupItems(this.oVSD);
		sPageId 			= 'group';
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is a valid predefined page id after ' + sPageId + ' items are added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , true, sSuccessMsgPrefix + sSuccessMsg);


		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));

		sPageId 			= sFirstCustomTabId;
		sSuccessMsgPrefix 	= '"' + sPageId + '"';
		sSuccessMsg 		= ' is a valid predefined page id after it was added.';
		assert.strictEqual(this.oVSD._isValidPredefinedPageId(sPageId) , false, sSuccessMsgPrefix + sSuccessMsg);
	});

	QUnit.test("Check the _fetchValidPagesIds method for correctness.", function (assert) {
		var	sFirstCustomTabId	= 'taxi-settings6',
			sSecondCustomTabId 	= 'other-tab6',
			bEmptyContent 		= true,
			sSuccessMsg;

		var aVsd10ValidPageIds 	= [];
		sSuccessMsg 			= 'No valid page ids correctly determined.';
		assert.deepEqual(this.oVSD._fetchValidPagesIds(), aVsd10ValidPageIds, sSuccessMsg);


		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId, bEmptyContent));
		aVsd10ValidPageIds 	= [sFirstCustomTabId].sort();
		sSuccessMsg 		= 'Only one custom tab valid page id correctly determined.';
		assert.deepEqual(this.oVSD._fetchValidPagesIds().sort(), aVsd10ValidPageIds, sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');

		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId));
		aVsd10ValidPageIds 	= [sFirstCustomTabId, sSecondCustomTabId].sort();
		sSuccessMsg			= 'All custom tabs valid page ids correctly determined.';
		assert.deepEqual(this.oVSD._fetchValidPagesIds().sort(), aVsd10ValidPageIds, sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');

		oVsdConfig.addSortItems(this.oVSD);
		oVsdConfig.addFilterItems(this.oVSD);
		oVsdConfig.addPresetFilterItems(this.oVSD);
		oVsdConfig.addGroupItems(this.oVSD);
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId));
		aVsd10ValidPageIds 	= ['sort', 'group', 'filter', sFirstCustomTabId, sSecondCustomTabId].sort();
		sSuccessMsg			= 'All valid page ids are correctly determined.';
		assert.deepEqual(this.oVSD._fetchValidPagesIds().sort(), aVsd10ValidPageIds, sSuccessMsg);
	});

	QUnit.test("Check the _determineValidPageId method for correctness.", function (assert) {
		var	sFirstCustomTabId	= 'taxi-settings6',
			sSecondCustomTabId 	= 'other-tab6',
			bEmptyContent 		= true,
			sSuccessMsg,
			sPageId,
			sSuccessMsgPrefix,
			sExpectedPageId;

		// give nothing, expect sort
		sExpectedPageId 	= 'sort';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		// give filter, expect sort (no filter items yet)
		sExpectedPageId 	= 'sort';
		sPageId				= 'filter';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		// give random string, expect sort
		sExpectedPageId 	= 'sort';
		sPageId				= 'invalidstring';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		// add custom tab, give nothing, expect custom tab
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		sExpectedPageId 	=
		sPageId				= sFirstCustomTabId;
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when nothing given.';
		assert.equal(this.oVSD._determineValidPageId(), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');

		// add custom tab, give custom tab id, expect custom tab id
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		sExpectedPageId 	=
		sPageId				= sFirstCustomTabId;
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');



		// 6
		oVsdConfig.addSortItems(this.oVSD);
		sExpectedPageId 	=
		sPageId 			= 'sort';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('sortItems');

		//7
		sExpectedPageId 	= 'sort';
		sPageId 			= 'filter';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		//8
		oVsdConfig.addFilterItems(this.oVSD);
		sExpectedPageId 	=
		sPageId 			= 'filter';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);

		// 9
		sExpectedPageId 	= 'filter';
		sPageId 			= 'sort';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('filterItems');


		// 10
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		sExpectedPageId 	=
		sPageId 			= sFirstCustomTabId;
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');


		// 11 first custom tab has empty content
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId, bEmptyContent));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId));
		sExpectedPageId 	= sSecondCustomTabId;
		sPageId 			= sSecondCustomTabId;
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');


		// 12
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId));
		sExpectedPageId 	= sSecondCustomTabId;
		sPageId 			= sSecondCustomTabId;
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
		this.oVSD.destroyAggregation('customTabs');



		// 13
		oVsdConfig.addSortItems(this.oVSD);
		oVsdConfig.addFilterItems(this.oVSD);
		oVsdConfig.addGroupItems(this.oVSD);
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId));
		sExpectedPageId 	= sSecondCustomTabId;
		sPageId 			= sSecondCustomTabId;
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		// 14
		sExpectedPageId 	=
		sPageId 			= 'taxi-settings6';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		// 15
		this.oVSD.destroyAggregation('sortItems');
		sExpectedPageId 	= 'filter';
		sPageId 			= 'sort';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);


		// 16
		this.oVSD.destroy();
		this.oVSD 			= new ViewSettingsDialog("vsdCustomTabs");
		oVsdConfig.addGroupItems(this.oVSD);
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sFirstCustomTabId));
		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sSecondCustomTabId));
		sExpectedPageId 	= 'group';
		sPageId 			= 'sort';
		sSuccessMsgPrefix 	= '"' + sExpectedPageId + '"';
		sSuccessMsg			= '" is correctly resolved as the valid page id when "' + sPageId + '" given.';
		assert.equal(this.oVSD._determineValidPageId(sPageId), sExpectedPageId, sSuccessMsgPrefix + sSuccessMsg);
	});

	QUnit.test("Check if reserved tab ids are properly handled.", function (assert) {
		var oTab = new ViewSettingsCustomTab('sort');
		var hasError = false;
		try {
			this.oVSD.addCustomTab(oTab);
		} catch (e) {
			hasError = true;
		}

		assert.equal(hasError, true, 'Error is properly thrown when reserved tab id is used.');
	});

	QUnit.test("Back button on filter detail should work after reopen.", function (assert) {
		var delay = 1000,
			done = assert.async(),
			sId = this.oVSD.getId(),
			that = this;

		oVsdConfig.addSortItems(this.oVSD);
		oVsdConfig.addFilterItems(this.oVSD);
		oVsdConfig.addPresetFilterItems(this.oVSD);
		oVsdConfig.addGroupItems(this.oVSD);

		setTimeout(function () {
			that.oVSD.open();
			that.oVSD._switchToPage(3, that.oVSD.getFilterItems()[0]); // name details page
			jQuery.sap.delayedCall(0, that.oVSD._navContainer, "to", [sId + '-page2', "show"]);
			that.oVSD._onConfirm();
		}, 0);

		setTimeout(function () {
			that.oVSD.open();
			assert.ok(jQuery.sap.domById(sId + "-page2-cont"), "Page 2 (filter detail content) should be rendered");

			setTimeout(function () {
				that.oVSD._pressBackButton();

				setTimeout(function () {
					assert.ok(jQuery.sap.byId(sId + "-filterbutton").hasClass("sapMSegBBtnSel"), "Segmented 'filter' button should be selected after 'back' is pressed.");
					done();
				}, delay);
			}, delay);
		}, delay);
	});

	// this test is important because the 'content' aggregation of custom tabs is
	// being set to the vsd page instance and then back to the custom tab
	QUnit.test("Make sure right content is loaded upon reopening a dialog with single custom tab.", function (assert) {
		var delay = 1000,
			done = assert.async(),
			sTitle = 'taxi-settings',
			that = this;

		this.oVSD.insertAggregation('customTabs', oVsdConfig.customTabsFactory(sTitle));

		setTimeout(function () {
			that.oVSD.open();

			setTimeout(function () {
				that.oVSD._dialog.getEndButton().firePress();

				setTimeout(function () {
					that.oVSD.open();
					assert.strictEqual(jQuery('#' + that.oVSD.getId() + '-title').text(), sTitle, "The title should be " + sTitle);
					done();
				}, delay);
			}, delay);
		}, delay);
	});

	QUnit.test("Test model data binding", function (assert){
		var delay = 1000,
			done = assert.async(),
			that = this;

		var oCheckboxTemplate = new CheckBox({
			name : "test",
			text : "{/customTabData/checkbox_label}"
		});

		var oCustomTab = new ViewSettingsCustomTab({
			id: "taxi-settings",
			content: {
				path: '/customTabData',
				template: oCheckboxTemplate
			}
		});

		var oCustomTab2 = new ViewSettingsCustomTab({
			id: "taxi-settings2",
			content: {
				path: '/customTabData',
				template: oCheckboxTemplate
			}
		});

		this.oVSD.addAggregation("customTabs", oCustomTab);
		this.oVSD.addAggregation("customTabs", oCustomTab2);

		setTimeout(function () {
			that.oVSD.open();
			that.oVSD._switchToPage('taxi-settings2');
			// the text of the second control on the page is binded to a model
			assert.strictEqual(that.oVSD._getPage1().getContent()[0].getText(), 'lorem ipsum checkbox label');
			setTimeout(function () {
				that.oVSD._switchToPage('taxi-settings');
				// the text of the second control on the page is binded to a model
				assert.strictEqual(that.oVSD._getPage1().getContent()[0].getText(), 'lorem ipsum checkbox label');
				done();
			}, delay);
		}, delay);
	});


	// test is needed because the VSD does some internal managing of the aggregations
	QUnit.test("Remove tab aggregation after tab was opened", function (assert) {
		var ct = new ViewSettingsCustomTab({content : [new Input({value: 'test1'}),new Input({value: 'test2'})]});
			this.oVSD.addCustomTab(ct);
		// open first dialog - that will trigger switching the content parent from vsd custom tab aggregation to vsd page contet aggregation
		this.oVSD.open();
		// assert the content of the custom tab aggregation has been transferred to the page
		assert.strictEqual(this.oVSD.getAggregation('customTabs')[0].getContent().length, 0, 'First VSD instance custom tab aggregation has no content');
		assert.strictEqual(this.oVSD._getPage1().getAggregation('content').length, 2, 'First VSD instance page has two contents');
		this.oVSD.removeAggregation('customTabs', ct);
		// assert that the aggregation is removed and the page has no contents
		assert.strictEqual(this.oVSD.getAggregation('customTabs').length, 0, 'First VSD instance has no custom tabs');
		assert.strictEqual(this.oVSD._getPage1().getAggregation('content').length, 0, 'First VSD instance page has no contents');
	});

	// test is needed because the VSD does some internal managing of the aggregations
	QUnit.test("Remove all aggregations after tab was opened", function (assert) {
		var ct = new ViewSettingsCustomTab({content : [new Input({value: 'test1'}),new Input({value: 'test2'})]});
		this.oVSD.addCustomTab(ct);
		// open first dialog - that will trigger switching the content parent from vsd custom tab aggregation to vsd page contet aggregation
		this.oVSD.open();
		// assert the content of the custom tab aggregation has been transferred to the page
		assert.strictEqual(this.oVSD.getAggregation('customTabs')[0].getContent().length, 0, 'First VSD instance custom tab aggregation has no content');
		assert.strictEqual(this.oVSD._getPage1().getAggregation('content').length, 2, 'First VSD instance page has two contents');
		this.oVSD.removeAllAggregation('customTabs');
		// assert that the aggregation is removed and the pag has no contents
		assert.strictEqual(this.oVSD.getAggregation('customTabs'), null, 'First VSD instance has no custom tabs aggregation');
		assert.strictEqual(this.oVSD._getPage1().getAggregation('content').length, 0, 'First VSD instance page has no contents');
	});

	// test is needed because the VSD does some internal managing of the aggregations
	QUnit.test("Destroy tab aggregation after tab was opened", function (assert) {
		var ct = new ViewSettingsCustomTab({content : [new Input({value: 'test1'}),new Input({value: 'test2'})]});
		this.oVSD.addCustomTab(ct);
		// open first dialog - that will trigger switching the content parent from vsd custom tab aggregation to vsd page contet aggregation
		this.oVSD.open();
		// assert the content of the custom tab aggregation has been transferred to the page
		assert.strictEqual(this.oVSD.getAggregation('customTabs')[0].getContent().length, 0, 'First VSD instance custom tab aggregation has no content');
		assert.strictEqual(this.oVSD._getPage1().getAggregation('content').length, 2, 'First VSD instance page has two contents');
		this.oVSD.destroyAggregation('customTabs', ct);
		// assert that the aggregation is removed and the page has no contents
		assert.strictEqual(this.oVSD.getAggregation('customTabs'), null, 'First VSD instance has no custom tabs aggregation');
		assert.strictEqual(this.oVSD._getPage1().getAggregation('content').length, 0, 'First VSD instance page has no contents');
	});
});