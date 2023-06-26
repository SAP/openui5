sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/SortController',
	'sap/m/p13n/GroupController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/table/library'
], function(Controller, JSONModel, Engine, SelectionController, SortController, GroupController, MetadataHelper, tableLibrary) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.EngineGridTable.Page", {

		onInit: function() {
			var oData = {
				items: [
					{firstName: "Peter", lastName: "Mueller", size: "1.75", city: "Walldorf"},
					{firstName: "Petra", lastName: "Maier", size: "1.85", city: "Walldorf"},
					{firstName: "Thomas", lastName: "Smith", size: "1.95", city: "Walldorf"},
					{firstName: "John", lastName: "Williams", size: "1.65", city: "Walldorf"},
					{firstName: "Maria", lastName: "Jones", size: "1.55", city: "Walldorf"}
				]
			};

			var oModel = new JSONModel(oData);

			this.getView().setModel(oModel);

			this._registerForP13n();
		},

		_registerForP13n: function() {
			var oTable = this.byId("persoTable");

			this.oMetadataHelper = new MetadataHelper([
				{key: "firstName", label: "First Name", path: "firstName"},
				{key: "lastName", label: "Last Name", path: "lastName"},
				{key: "city", label: "City", path: "city"},
				{key: "size", label: "Size", path: "size"}
			]);

			Engine.getInstance().register(oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Columns: new SelectionController({
						targetAggregation: "columns",
						control: oTable
					}),
					Sorter: new SortController({
						control: oTable
					}),
					Groups: new GroupController({
						control: oTable
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function(oEvt) {
			var oTable = this.byId("persoTable");

			Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},

		onSort: function(oEvt) {

			var oTable = this.byId("persoTable");
			var sAffectedProperty = oEvt.getParameter("column").getSortProperty();
			var sSortOrder = oEvt.getParameter("sortOrder");

			//Apply the state programatically on sorting through the column menu
			//1) Retrieve the current personalization state
			Engine.getInstance().retrieveState(oTable).then(function(oState){

				//2) Modify the existing personalization state
				oState.Sorter.forEach(function(oSorter){
					oSorter.sorted = false;
				});
				oState.Sorter.push({
					key: sAffectedProperty,
					descending: sSortOrder === tableLibrary.SortOrder.Descending
				});

				//3) Apply the modified personalization state to persist it in the VariantManagement
				Engine.getInstance().applyState(oTable, oState);
			});
		},

		_getKey: function(oControl) {
			return this.getView().getLocalId(oControl.getId());
		},

		handleStateChange: function(oEvt) {
			var oTable = this.byId("persoTable");
			var oState = oEvt.getParameter("state");

			oTable.getColumns().forEach(function(oColumn, iIndex){
				oColumn.setVisible(false);
			});
			oState.Columns.forEach(function(oProp, iIndex){
				var oCol = this.byId(oProp.key);
				oCol.setVisible(true);

				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);
			}.bind(this));

			oTable.sort();
			oState.Sorter.forEach(function(oSorter) {
				oTable.sort(this.byId(oSorter.key), oSorter.descending ? tableLibrary.SortOrder.Descending : tableLibrary.SortOrder.Ascending, false);
			}.bind(this));

		}
	});
});