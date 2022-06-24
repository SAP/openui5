sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/SortController',
	'sap/m/p13n/GroupController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/model/Sorter'
], function(Controller, JSONModel, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.Engine.Page", {

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
				{key: "__xmlview0--firstName", label: "First Name", path: "firstName"},
				{key: "__xmlview0--lastName", label: "Last Name", path: "lastName"},
				{key: "__xmlview0--city", label: "City", path: "city"},
				{key: "__xmlview0--size", label: "Size", path: "size"}
			]);

			Engine.register(oTable, {
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

			Engine.attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function(oEvt) {
			var oTable = this.byId("persoTable");

			Engine.show(oTable, ["Columns", "Sorter", "Groups"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
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

				var iOldIndex = oTable.getColumns().indexOf(oCol);

				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);

				oTable.getItems().forEach(function(oItem){
					if (oItem.isA("sap.m.ColumnListItem")) {
						var oCell = oItem.getCells()[iOldIndex];
						oItem.removeCell(oCell);
						oItem.insertCell(oCell, iIndex);
					}
				});
			}.bind(this));

			var aSorter = [];
			oState.Sorter.forEach(function(oSorter) {
				aSorter.push(new Sorter(this.oMetadataHelper.getPath(oSorter.key), oSorter.descending));
			}.bind(this));

			oState.Groups.forEach(function(oGroup) {
				aSorter.push(new Sorter(this.oMetadataHelper.getPath(oGroup.key), oGroup.descending, true));
			}.bind(this));

			oTable.getBinding("items").sort(aSorter);
		}
	});
});
