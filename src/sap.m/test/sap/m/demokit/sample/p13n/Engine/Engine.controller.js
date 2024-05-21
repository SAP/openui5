sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/SortController',
	'sap/m/p13n/GroupController',
	'sap/m/p13n/FilterController',
	'sap/m/p13n/MetadataHelper',
	'sap/ui/model/Sorter',
	'sap/m/ColumnListItem',
	'sap/m/Text',
	'sap/ui/core/library',
	'sap/m/table/ColumnWidthController',
	'sap/ui/model/Filter'
], function(Controller, JSONModel, Engine, SelectionController, SortController, GroupController, FilterController, MetadataHelper, Sorter, ColumnListItem, Text, coreLibrary, ColumnWidthController, Filter) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.Engine.Page", {

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
						city: "Walldorf"
					},
					{
						key: "P3",
						firstName: "Thomas",
						lastName: "Smith",
						size: "1.95",
						city: "Heidelberg"
					},
					{
						key: "P4",
						firstName: "John",
						lastName: "Williams",
						size: "1.65",
						city: "Walldorf"
					},
					{
						key: "P5",
						firstName: "Maria",
						lastName: "Jones",
						size: "1.55",
						city: "Walldorf"
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
					}),
					Filter: new FilterController({
						control: oTable
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		openPersoDialog: function(oEvt) {
			this._openPersoDialog(["Columns", "Sorter", "Groups", "Filter"], oEvt.getSource());
		},

		_openPersoDialog: function(aPanels, oSource) {
			var oTable = this.byId("persoTable");

			Engine.getInstance().show(oTable, aPanels, {
				contentHeight: aPanels.length > 1 ? "50rem" : "35rem",
				contentWidth: aPanels.length > 1 ? "45rem" : "32rem",
				source: oSource || oTable
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

			//Update the columns per selection in the state
			this.updateColumns(oState);

			//Create Filters & Sorters
			const aFilter = this.createFilters(oState);
			const aGroups = this.createGroups(oState);
			const aSorter = this.createSorters(oState, aGroups);

			const aCells = oState.Columns.map(function(oColumnState) {
				return new Text({
					text: "{" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
				});
			}.bind(this));

			//rebind the table with the updated cell template
			oTable.bindItems({
				templateShareable: false,
				path: '/items',
				sorter: aSorter.concat(aGroups),
				filters: aFilter,
				template: new ColumnListItem({
					cells: aCells
				})
			});

		},

		createFilters: function(oState) {
			const aFilter = [];
			Object.keys(oState.Filter).forEach((sFilterKey) => {
				const filterPath = this.oMetadataHelper.getProperty(sFilterKey).path;

				oState.Filter[sFilterKey].forEach(function(oConditon) {
					aFilter.push(new Filter(filterPath, oConditon.operator, oConditon.values[0]));
				});
			});

			this.byId("filterInfo").setVisible(aFilter.length > 0);

			return aFilter;
		},

		createSorters: function(oState, aExistingSorter) {
			const aSorter = aExistingSorter || [];
			oState.Sorter.forEach(function(oSorter) {
				const oExistingSorter = aSorter.find(function(oSort) {
					return oSort.sPath === this.oMetadataHelper.getProperty(oSorter.key).path;
				}.bind(this));

				if (oExistingSorter) {
					oExistingSorter.bDescending = !!oSorter.descending;
				} else {
					aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
				}
			}.bind(this));

			oState.Sorter.forEach(function(oSorter) {
				const oCol = this.byId(oSorter.key);
				if (oSorter.sorted !== false) {
					oCol.setSortIndicator(oSorter.descending ? coreLibrary.SortOrder.Descending : coreLibrary.SortOrder.Ascending);
				}
			}.bind(this));

			return aSorter;
		},

		createGroups: function(oState) {
			const aGroupings = [];
			oState.Groups.forEach(function(oGroup) {
				aGroupings.push(new Sorter(this.oMetadataHelper.getProperty(oGroup.key).path, false, true));
			}.bind(this));

			oState.Groups.forEach(function(oSorter) {
				const oCol = this.byId(oSorter.key);
				oCol.data("grouped", true);
			}.bind(this));

			return aGroupings;
		},

		updateColumns: function(oState) {
			const oTable = this.byId("persoTable");

			oTable.getColumns().forEach(function(oColumn, iIndex) {
				oColumn.setVisible(false);
				oColumn.setWidth(oState.ColumnWidth[this._getKey(oColumn)]);
				oColumn.setSortIndicator(coreLibrary.SortOrder.None);
				oColumn.data("grouped", false);
			}.bind(this));

			oState.Columns.forEach(function(oProp, iIndex) {
				const oCol = this.byId(oProp.key);
				oCol.setVisible(true);

				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);
			}.bind(this));
		},

		beforeOpenColumnMenu: function(oEvt) {
			const oMenu = this.byId("menu");
			const oColumn = oEvt.getParameter("openBy");
			const oSortItem = oMenu.getQuickActions()[0].getItems()[0];
			const oGroupItem = oMenu.getQuickActions()[1].getItems()[0];

			oSortItem.setKey(this._getKey(oColumn));
			oSortItem.setLabel(oColumn.getHeader().getText());
			oSortItem.setSortOrder(oColumn.getSortIndicator());

			oGroupItem.setKey(this._getKey(oColumn));
			oGroupItem.setLabel(oColumn.getHeader().getText());
			oGroupItem.setGrouped(oColumn.data("grouped"));
		},

		onColumnHeaderItemPress: function(oEvt) {
			const oColumnHeaderItem = oEvt.getSource();
			let sPanel = "Columns";
			if (oColumnHeaderItem.getIcon().indexOf("group") >= 0) {
				sPanel = "Groups";
			} else if (oColumnHeaderItem.getIcon().indexOf("sort") >= 0) {
				sPanel = "Sorter";
			} else if (oColumnHeaderItem.getIcon().indexOf("filter") >= 0) {
				sPanel = "Filter";
			}

			this._openPersoDialog([sPanel]);
		},

		onFilterInfoPress: function(oEvt) {
			this._openPersoDialog(["Filter"], oEvt.getSource());
		},

		onSort: function(oEvt) {
			const oSortItem = oEvt.getParameter("item");
			const oTable = this.byId("persoTable");
			const sAffectedProperty = oSortItem.getKey();
			const sSortOrder = oSortItem.getSortOrder();

			//Apply the state programatically on sorting through the column menu
			//1) Retrieve the current personalization state
			Engine.getInstance().retrieveState(oTable).then(function(oState) {

				//2) Modify the existing personalization state --> clear all sorters before
				oState.Sorter.forEach(function(oSorter) {
					oSorter.sorted = false;
				});

				if (sSortOrder !== coreLibrary.SortOrder.None) {
					oState.Sorter.push({
						key: sAffectedProperty,
						descending: sSortOrder === coreLibrary.SortOrder.Descending
					});
				}

				//3) Apply the modified personalization state to persist it in the VariantManagement
				Engine.getInstance().applyState(oTable, oState);
			});
		},

		onGroup: function(oEvt) {
			const oGroupItem = oEvt.getParameter("item");
			const oTable = this.byId("persoTable");
			const sAffectedProperty = oGroupItem.getKey();

			//1) Retrieve the current personalization state
			Engine.getInstance().retrieveState(oTable).then(function(oState) {

				//2) Modify the existing personalization state --> clear all groupings before
				oState.Groups.forEach(function(oSorter) {
					oSorter.grouped = false;
				});

				if (oGroupItem.getGrouped()) {
					oState.Groups.push({
						key: sAffectedProperty
					});
				}

				//3) Apply the modified personalization state to persist it in the VariantManagement
				Engine.getInstance().applyState(oTable, oState);
			});
		},

		onColumnMove: function(oEvt) {
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

		onColumnResize: function(oEvt) {
			const oColumn = oEvt.getParameter("column");
			const sWidth = oEvt.getParameter("width");
			const oTable = this.byId("persoTable");

			const oColumnState = {};
			oColumnState[this._getKey(oColumn)] = sWidth;

			Engine.getInstance().applyState(oTable, {
				ColumnWidth: oColumnState
			});
		},

		onClearFilterPress: function(oEvt) {
			const oTable = this.byId("persoTable");
			Engine.getInstance().retrieveState(oTable).then(function(oState) {
				for (var sKey in oState.Filter) {
					oState.Filter[sKey].map((condition) => {
						condition.filtered = false;
					});
				}
				Engine.getInstance().applyState(oTable, oState);
			});
		}
	});
});