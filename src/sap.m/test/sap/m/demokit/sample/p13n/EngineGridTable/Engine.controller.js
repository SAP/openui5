sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/SortController',
	'sap/m/p13n/GroupController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/model/Sorter',
	'sap/ui/core/library',
	'sap/m/table/ColumnWidthController'
], function(Controller, JSONModel, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter, CoreLibrary, ColumnWidthController) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.EngineGridTable.Page", {

		onInit: function() {
			const oData = {
				items: [{
						firstName: "Peter",
						lastName: "Mueller",
						size: "1.75",
						city: "Walldorf"
					},
					{
						firstName: "Petra",
						lastName: "Maier",
						size: "1.85",
						city: "Walldorf"
					},
					{
						firstName: "Thomas",
						lastName: "Smith",
						size: "1.95",
						city: "Heidelberg"
					},
					{
						firstName: "John",
						lastName: "Williams",
						size: "1.65",
						city: "Walldorf"
					},
					{
						firstName: "Maria",
						lastName: "Jones",
						size: "1.55",
						city: "Walldorf"
					}
				]
			};

			const oModel = new JSONModel(oData);

			this.getView().setModel(oModel);

			this._registerForP13n();
		},

		_registerForP13n: function() {
			const oTable = this.byId("persoTable");

			this.oMetadataHelper = new MetadataHelper([{
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

			this._mIntialWidth = {
				"firstName_col": "11rem",
				"lastName_col": "11rem",
				"city_col": "11rem",
				"size_col": "11rem"
			};

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
					}),
					ColumnWidth: new ColumnWidthController({
						control: oTable
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function(oEvt) {
			const oTable = this.byId("persoTable");

			Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},

		onColumnHeaderItemPress: function(oEvt) {
			const oTable = this.byId("persoTable");
			const sPanel = oEvt.getSource().getIcon().indexOf("sort") >= 0 ? "Sorter" : "Columns";

			Engine.getInstance().show(oTable, [sPanel], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oTable
			});
		},

		onSort: function(oEvt) {
			const oTable = this.byId("persoTable");
			const sAffectedProperty = this._getKey(oEvt.getParameter("column"));
			const sSortOrder = oEvt.getParameter("sortOrder");

			//Apply the state programatically on sorting through the column menu
			//1) Retrieve the current personalization state
			Engine.getInstance().retrieveState(oTable).then(function(oState) {

				//2) Modify the existing personalization state --> clear all sorters before
				oState.Sorter.forEach(function(oSorter) {
					oSorter.sorted = false;
				});
				oState.Sorter.push({
					key: sAffectedProperty,
					descending: sSortOrder === CoreLibrary.SortOrder.Descending
				});

				//3) Apply the modified personalization state to persist it in the VariantManagement
				Engine.getInstance().applyState(oTable, oState);
			});
		},

		onColumnMove: function(oEvt) {
			const oTable = this.byId("persoTable");
			const oAffectedColumn = oEvt.getParameter("column");
			const iNewPos = oEvt.getParameter("newPos");
			const sKey = this._getKey(oAffectedColumn);
			oEvt.preventDefault();

			Engine.getInstance().retrieveState(oTable).then(function(oState) {

				const oCol = oState.Columns.find(function(oColumn) {
					return oColumn.key === sKey;
				}) || {
					key: sKey
				};
				oCol.position = iNewPos;

				Engine.getInstance().applyState(oTable, {
					Columns: [oCol]
				});
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

			oTable.getColumns().forEach(function(oColumn) {

				const sKey = this._getKey(oColumn);
				const sColumnWidth = oState.ColumnWidth[sKey];

				oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

				oColumn.setVisible(false);
				oColumn.setSortOrder(CoreLibrary.SortOrder.None);
			}.bind(this));

			oState.Columns.forEach(function(oProp, iIndex) {
				const oCol = this.byId(oProp.key);
				oCol.setVisible(true);

				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);
			}.bind(this));

			const aSorter = [];
			oState.Sorter.forEach(function(oSorter) {
				const oColumn = this.byId(oSorter.key);
				oColumn.setSortOrder(oSorter.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending);
				aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
			}.bind(this));
			oTable.getBinding("rows").sort(aSorter);
		},

		onColumnResize: function(oEvt) {
			const oColumn = oEvt.getParameter("column");
			const sWidth = oEvt.getParameter("width");
			const oTable = this.byId("persoTable");

			const oColumnState = {};
			oColumnState[this._getKey(oColumn)] = sWidth;

			Engine.getInstance().applyState(oTable, {
				ColumnWidth: oColumnState
			});
		}
	});
});