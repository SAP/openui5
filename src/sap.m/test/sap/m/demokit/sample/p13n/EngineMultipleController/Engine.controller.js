sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/core/library'
], function (Controller, JSONModel, Engine, SelectionController, MetadataHelper, coreLibrary) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.EngineMultipleController.Page", {

		onInit: function () {
			this._registerForP13n();
		},

		_registerForP13n: function () {
			const oTable = this.byId("persoTable");

			this.oMetadataHelper = new MetadataHelper([{
				key: "id_col",
				label: "ID",
				path: "id"
			},
			{
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

			const _oMetadataHelperRows = new MetadataHelper([{
				key: "P1",
				label: "Peter Müller",
				path: "id"
			},
			{
				key: "P2",
				label: "Petra Maier",
				path: "id"
			},
			{
				key: "P3",
				label: "Thomas Smith",
				path: "id"
			},
			{
				key: "P4",
				label: "John Williams",
				path: "id"
			},
			{
				key: "P5",
				label: "Maria Jones",
				path: "id"
			}
			]);

			Engine.getInstance().register(oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Columns: new SelectionController({
						targetAggregation: "columns",
						control: oTable,
						persistenceIdentifier: "selection-columns"
					}),
					Rows: new SelectionController({
						targetAggregation: "items",
						helper: _oMetadataHelperRows,
						control: oTable,
						persistenceIdentifier: "selection-items",
						enableReorder: false
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function (oEvt) {
			const oTable = this.byId("persoTable");

			Engine.getInstance().show(oTable, ["Columns"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},

		openPersoDialogPeople: function (oEvt) {
			const oTable = this.byId("persoTable");

			Engine.getInstance().show(oTable, ["Rows"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},

		_getKey: function (oControl) {
			return this.getView().getLocalId(oControl.getId());
		},

		handleStateChange: function (oEvt) {
			const oTable = this.byId("persoTable");
			const oState = oEvt.getParameter("state");

			if (!oState) {
				return;
			}

			oTable.getColumns().forEach(function (oColumn, iIndex) {
				oColumn.setVisible(false);
				oColumn.setSortIndicator(coreLibrary.SortOrder.None);
				oColumn.data("grouped", false);
			});

			oState.Columns.forEach(function (oProp, iIndex) {
				const oCol = this.byId(oProp.key);
				if (oCol) {
					oCol.setVisible(true);

					oTable.removeColumn(oCol);
					oTable.insertColumn(oCol, iIndex);
				}
			}.bind(this));

			oTable.getItems().forEach(function (oItem, iIndex) {
				oItem.setVisible(false);
			});

			oState.Rows.forEach(function (oProp, iIndex) {
				const aItems = this.byId("persoTable").getItems();
				// var oRelevantCol = aItems[0].getCells().find((cell) => true);

				// find index of cell with "id", that can be used later
				const oFoundItem = aItems.find((oItem) => oItem.getCells()[0].getText() == oProp.key);

				oFoundItem.setVisible(true);

				oTable.removeItem(oFoundItem);
				oTable.insertItem(oFoundItem, iIndex);
			}.bind(this));
		},

		onColumnMove: function (oEvt) {
			const oDraggedColumn = oEvt.getParameter("draggedControl");
			const oDroppedColumn = oEvt.getParameter("droppedControl");

			if (oDraggedColumn === oDroppedColumn) {
				return;
			}

			const oTable = this.byId("persoTable");
			const sDropPosition = oEvt.getParameter("dropPosition");
			const iDraggedIndex = oTable.indexOfColumn(oDraggedColumn);
			const iDroppedIndex = oTable.indexOfColumn(oDroppedColumn);
			const iNewPos = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);
			const sKey = this._getKey(oDraggedColumn);

			Engine.getInstance().retrieveState(oTable).then(function (oState) {

				const oCol = oState.Columns.find(function (oColumn) {
					return oColumn.key === sKey;
				}) || {
					key: sKey
				};
				oCol.position = iNewPos;

				Engine.getInstance().applyState(oTable, {
					Columns: [oCol]
				});
			});
		}
	});
});