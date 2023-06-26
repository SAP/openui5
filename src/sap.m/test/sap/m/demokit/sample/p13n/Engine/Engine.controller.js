sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/SortController',
	'sap/m/p13n/GroupController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/model/Sorter',
	'sap/m/ColumnListItem',
	'sap/m/Text'
], function(Controller, JSONModel, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter, ColumnListItem, Text) {
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

			Engine.getInstance().show(oTable, ["Columns", "Sorter", "Groups"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},

		_getKey: function(oControl) {
			return this.getView().getLocalId(oControl.getId());
		},

		handleStateChange: function(oEvt) {
			var oTable = this.byId("persoTable");
			var oState = oEvt.getParameter("state");

			if (!oState) {
				return;
			}

			var aSorter = [];
			oState.Sorter.forEach(function(oSorter) {
				aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
			}.bind(this));

			oState.Groups.forEach(function(oGroup) {
				var oExistingSorter = aSorter.find(function(oSorter){
					return oSorter.sPath === oGroup.key;
				});

				if (oExistingSorter) {
					oExistingSorter.vGroup = true;
				} else {
					aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oGroup.key).path, false, true));
				}
			}.bind(this));

			oTable.getColumns().forEach(function(oColumn, iIndex){
				oColumn.setVisible(false);
			});

			oState.Columns.forEach(function(oProp, iIndex){
				var oCol = this.byId(oProp.key);
				oCol.setVisible(true);

				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);
			}.bind(this));

			var aCells = oState.Columns.map(function(oColumnState) {
				return new Text({
					text: "{" + oColumnState.key + "}"
				});
			});

			oTable.bindItems({
				templateShareable: false,
				path: '/items',
				sorter: aSorter,
				template: new ColumnListItem({
					cells: aCells
				})
			});

		}
	});
});