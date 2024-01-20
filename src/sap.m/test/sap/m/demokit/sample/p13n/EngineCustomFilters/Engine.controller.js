sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/FilterController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/model/Filter',
	'sap/m/Token',
	'sap/m/MultiInput',
	'sap/ui/core/Item'
], function(Controller, JSONModel, Engine, FilterController, MetadataHelper, Filter, Token, MultiInput, Item) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.EngineCustomFilters.Page", {

		onInit: function() {
			const oData = {
				items: [{
						key: "P1",
						firstName: "Peter",
						lastName: "Mueller",
						size: "1.75",
						city: "Walldorf"
					},
					{
						key: "P2",
						firstName: "Petra",
						lastName: "Maier",
						size: "1.85",
						city: "Berlin"
					},
					{
						key: "P3",
						firstName: "Thomas",
						lastName: "Smith",
						size: "1.95",
						city: "Berlin"
					},
					{
						key: "P4",
						firstName: "John",
						lastName: "Mueller",
						size: "1.65",
						city: "Walldorf"
					},
					{
						key: "P5",
						firstName: "Maria",
						lastName: "Jones",
						size: "1.55",
						city: "Walldorf"
					},
					{
						key: "P6",
						firstName: "Christine",
						lastName: "Smith",
						size: "1.95",
						city: "Manchester"
					},
					{
						key: "P7",
						firstName: "Hobin",
						lastName: "Rood",
						size: "1.85",
						city: "Manchester"
					},
					{
						key: "P8",
						firstName: "Nils",
						lastName: "Mueller",
						size: "1.75",
						city: "Walldorf"
					},
					{
						key: "P9",
						firstName: "Helga",
						lastName: "Maier",
						size: "1.85",
						city: "Berlin"
					},
					{
						key: "P10",
						firstName: "Torsten",
						lastName: "Smith",
						size: "1.95",
						city: "Berlin"
					},
					{
						key: "P11",
						firstName: "Yannick",
						lastName: "Mueller",
						size: "1.65",
						city: "London"
					},
					{
						key: "P12",
						firstName: "Peter",
						lastName: "Jones",
						size: "1.75",
						city: "Walldorf"
					},
					{
						key: "P13",
						firstName: "Christine",
						lastName: "Jones",
						size: "1.65",
						city: "Dresden"
					},
					{
						key: "P14",
						firstName: "Nils",
						lastName: "Maier",
						size: "1.65",
						city: "Manchester"
					}
				]
			};

			const oModel = new JSONModel(oData);
			this._oModel = oModel;

			this.getView().setModel(oModel);

			this._registerForP13n();
		},

		_registerForP13n: function() {
			const oTable = this.byId("persoTable");

			const oMetadataHelper = new MetadataHelper([{
					key: "firstName_col",
					label: "First Name",
					path: "firstName"
				},
				{
					key: "lastName_col",
					label: "Last Name",
					path: "lastName"
				},
				{
					key: "city_col",
					label: "City",
					path: "city"
				},
				{
					key: "size_col",
					label: "Size",
					path: "size"
				}
			]);

			this.oMetadataHelper = oMetadataHelper;

			Engine.getInstance().register(oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Filter: new FilterController({
						control: oTable,
						itemFactory: function(oItem, oFilterPanel) {
							const oP13nItem = oFilterPanel.getItemByKey(oItem.name);

							const multiInput = new MultiInput({
								showValueHelp: false,
								showClearIcon: true,
								tokenUpdate: function(oEvt) {
									oEvt.getParameter("addedTokens").forEach(function(oToken) {
										oP13nItem.conditions.push({
											operator: "EQ",
											values: [oToken.getText()]
										});
									});

									oEvt.getParameter("removedTokens").forEach(function(oToken) {
										const oRemoveCondition = oP13nItem.conditions.find(function(oConditon) {
											return oConditon.values[0] == oToken.getText();
										});
										const iConditionIndex = oP13nItem.conditions.indexOf(oRemoveCondition);
										oP13nItem.conditions.splice(iConditionIndex, 1);
									});

									// Use FilterPanel#setP13nData to update the FilterPanel model to create personalization changes
									let aUdatedP13nData = oFilterPanel.getP13nData();
									aUdatedP13nData = aUdatedP13nData.map((oFilterPanelItem) => {
										return oFilterPanelItem.name == oP13nItem.name ? oP13nItem : oFilterPanelItem;
									});
									oFilterPanel.setP13nData(aUdatedP13nData);
								},
								// Use FilterPanel#getP13nData & FilterPanel#getItemByKey to retrieve the existing conditions
								tokens: oP13nItem.conditions.map((oConditon) => new Token({
									text: oConditon.values[0]
								})),
								suggestionItems: {
									path: "/items",
									factory: function(sId, oContext) {
										return new Item({
											key: oContext.getProperty("key"),
											text: `${oContext.getProperty(oMetadataHelper.getPath(oItem.name))}`
										});
									}
								}
							});

							return multiInput;
						}
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function(oEvt) {
			const oTable = this.byId("persoTable");

			Engine.getInstance().show(oTable, ["Filter"], {
				title: "Custom Filter Settings",
				contentHeight: "50rem",
				contentWidth: "45rem",
				source: oEvt.getSource()
			});
		},

		_getKey: function(oControl) {
			return this.getView().getLocalId(oControl.getId());
		},

		handleStateChange: function(oEvt) {
			const oTable = this.byId("persoTable");
			const oState = oEvt.getParameter("state");

			if (!oState) {
				return;
			}

			//Create Filters & Sorters
			const aFilter = this.createFilters(oState);

			//rebind the table with the updated cell template
			oTable.getBinding("items").filter(aFilter);

		},

		createFilters: function(oState) {
			const aFilter = [];
			Object.keys(oState.Filter).forEach((sFilterKey) => {
				const filterPath = this.oMetadataHelper.getProperty(sFilterKey).path;

				oState.Filter[sFilterKey].forEach(function(oConditon) {
					aFilter.push(new Filter(filterPath, oConditon.operator, oConditon.values[0]));
				});
			});

			return aFilter;
		}
	});
});