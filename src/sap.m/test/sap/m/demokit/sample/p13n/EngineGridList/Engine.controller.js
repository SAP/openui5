sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/MetadataHelper'
], function(Controller, JSONModel, Engine, SelectionController, MetadataHelper) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.EngineGridList.Page", {

		onInit: function() {
			const oData = {
				items: [{
						key: "person1",
						firstName: "Peter",
						lastName: "Mueller",
						size: "1.75",
						city: "Walldorf"
					},
					{
						key: "person2",
						firstName: "Petra",
						lastName: "Maier",
						size: "1.85",
						city: "Walldorf"
					},
					{
						key: "person3",
						firstName: "Thomas",
						lastName: "Smith",
						size: "1.95",
						city: "Walldorf"
					},
					{
						key: "person4",
						firstName: "Maria",
						lastName: "Jones",
						size: "1.55",
						city: "Walldorf"
					},
					{
						key: "person5",
						firstName: "John",
						lastName: "Williams",
						size: "1.65",
						city: "Walldorf"
					}
				]
			};

			const oModel = new JSONModel(oData);

			this.getView().setModel(oModel);

			this._registerForP13n();
		},

		_registerForP13n: function() {
			const oGridList = this.byId("persoList");

			this.oMetadataHelper = new MetadataHelper([{
					key: "person1",
					label: "Peter Mueller"
				},
				{
					key: "person2",
					label: "Petra Maier"
				},
				{
					key: "person3",
					label: "Thomas Smith"
				},
				{
					key: "person4",
					label: "Maria Jones"
				},
				{
					key: "person5",
					label: "John Williams"
				}
			]);

			Engine.getInstance().register(oGridList, {
				helper: this.oMetadataHelper,
				controller: {
					Items: new SelectionController({
						targetAggregation: "items",
						getKeyForItem: function(oListItem) {
							return oListItem.getBindingContext().getProperty("key");
						},
						control: oGridList
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function(oEvt) {
			const oGridList = this.byId("persoList");

			Engine.getInstance().show(oGridList, ["Items"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},

		handleStateChange: function(oEvt) {
			const oState = oEvt.getParameter("state");

			const aPersonData = this.getView().getModel().getProperty("/items");

			const aUpdatedPersonData = [];
			oState.Items.forEach(function(oStateItem, iIndex) {
				const oModelItem = aPersonData.find(function(oModelItem) {
					return oModelItem.key === oStateItem.key;
				});
				aUpdatedPersonData.push(oModelItem);
			});

			this.getView().getModel().setProperty("/items", aUpdatedPersonData);
		}
	});
});