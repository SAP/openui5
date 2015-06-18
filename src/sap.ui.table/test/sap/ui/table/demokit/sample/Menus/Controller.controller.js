sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(Controller, TableExampleUtils, JSONModel, Menu, MenuItem) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Menus.Controller", {
		
		onInit : function () {
			var oView = this.getView();
			
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			oView.setModel(oJSONModel);
			
			oView.setModel(new JSONModel({
				showVisibilityMenuEntry: false,
				showFreezeMenuEntry: false,
				enableCellFilter: false
			}), "ui");
		},
		
		onColumnSelect : function (oEvent) {
			var oCurrentColumn = oEvent.getParameter("column");
			var oImageColumn = this.getView().byId("image");
			if (oCurrentColumn != oImageColumn) {
				return;
			}
			
			//Just skip opening the column Menu on column "Image"
			oEvent.preventDefault();
		},
		
		onProductIdCellContextMenu : function (oEvent) {
			if (sap.ui.Device.support.touch) {
				return; //Do not use context menus on touch devices
			}
			
			var iColumnIndex = oEvent.getParameter("columnIndex");
			var iRowIndex = oEvent.getParameter("rowIndex");
			var oTable = this.getView().byId("table");
			var aColumns = oTable.getColumns();
			
			var oColumn;
			var iVisibleIndex = -1;
			for (var i=0; i<aColumns.length; i++) {
				if (aColumns[i].getVisible()) {
					iVisibleIndex++;
				}
				if (iVisibleIndex == iColumnIndex) {
					oColumn = aColumns[i];
					break;
				}
			}
			
			if (oColumn != this.getView().byId("productId")) {
				return;
			}
			
			oEvent.preventDefault();
			
			if (!this._oIdContextMenu) {
				this._oIdContextMenu = new Menu();
				this.getView().addDependent(this._oIdContextMenu);
			}
			
			this._oIdContextMenu.destroyItems();
			this._oIdContextMenu.addItem(new MenuItem({
				text: "My Custom Cell Action",
				select: function(oEvent) {
					var sId = oTable.getContextByIndex(iRowIndex).getProperty("ProductId");
					alert("Context action triggered on Column 'Product ID' on id '" + sId + "'.");
				}.bind(this)
			}));
			
			var oRelatedControl = oEvent.getParameter("cellControl");

			//Open the menu on the cell
			var eDock = sap.ui.core.Popup.Dock;
			this._oIdContextMenu.open(false, oRelatedControl, eDock.BeginTop, eDock.BeginBottom, oRelatedControl, "none none");
		},
		
		onQuantityCustomItemSelect : function(oEvent) {
			alert("Some custom action triggered on column 'Quantity'.");
		},
		
		onQuantitySort : function(oEvent) {
			var bAdd = oEvent.getParameter("ctrlKey") === true;
			var oColumn = this.getView().byId("quantity");
			var sOrder = oColumn.getSortOrder() == "Ascending" ? "Descending" : "Ascending";
			
			this.getView().byId("table").sort(oColumn, sOrder, bAdd);
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.Menus", "/info.json"), oEvent.getSource());
		}
		
	});

});
