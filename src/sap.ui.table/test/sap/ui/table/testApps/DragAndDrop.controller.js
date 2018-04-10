sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	var TABLESETTINGS = window.TABLESETTINGS;

	return Controller.extend("sap.ui.table.testApps.DragAndDrop", {
		onInit: function () {
			var oTable = this.byId("table");
			var oTreeTable = this.byId("treetable");
			var oModel = new JSONModel();

			oModel.setData({
				listData: TABLESETTINGS.listTestData,
				treeData: TABLESETTINGS.treeTestData
			});

			oTable.setModel(oModel);
			oTreeTable.setModel(oModel);

			oTable.addExtension(new sap.m.Toolbar());
			TABLESETTINGS.init(oTable, function(oButton) {
				oTable.getExtension()[0].addContent(oButton);
			});

			oTreeTable.addExtension(new sap.m.Toolbar());
			// TODO: Make table settings interoperable with multi table pages
			//TABLESETTINGS.init(oTreeTable, function(oButton) {
			//	oTreeTable.getExtension()[0].addContent(oButton);
			//});

			window.oTable = oTable;
			window.oTreeTable = oTreeTable;
		},

		tableDragStart: function(oEvent) {
			var oRow = oEvent.getParameter("target");
			var oRowContext = oRow.getBindingContext();
			var oModelProperty = oRowContext.getModel().getProperty(oRowContext.getPath());
			var sStatus = oModelProperty && oModelProperty.objStatusState != null ? oModelProperty.objStatusState : "";

			if (sStatus !== "Success") {
				oEvent.preventDefault();
			}

			this.showDragStartEventInfo(oEvent, "Table");
		},

		tableReorderDragEnter: function(oEvent) {
			var oRow = oEvent.getParameter("target");
			var oRowContext = oRow.getBindingContext();
			var oModelProperty = oRowContext.getModel().getProperty(oRowContext.getPath());
			var sStatus = oModelProperty && oModelProperty.objStatusState != null ? oModelProperty.objStatusState : "";

			if (sStatus !== "Success") {
				oEvent.preventDefault();
			}

			this.showDragEnterEventInfo(oEvent, "Table Reorder");
		},

		tableReorderDrop: function(oEvent) {
			this.showDropEventInfo(oEvent, "Table Reorder");
		},

		tableToTreeTableDragEnter: function(oEvent) {
			this.showDragEnterEventInfo(oEvent, "Table to TreeTable");
		},

		tableToTreeTableDrop: function(oEvent) {
			this.showDropEventInfo(oEvent, "Table to TreeTable");
		},

		treeTableDragStart: function(oEvent) {
			this.showDragStartEventInfo(oEvent, "TreeTable");
		},

		treeTableReorderDragEnter: function(oEvent) {
			this.showDragEnterEventInfo(oEvent, "TreeTable Reorder");
		},

		treeTableReorderDrop: function(oEvent) {
			this.showDropEventInfo(oEvent, "TreeTable Reorder");
		},

		treeTableToTableDragEnter: function(oEvent) {
			this.showDragEnterEventInfo(oEvent, "TreeTable to Table");
		},

		treeTableToTableDrop: function(oEvent) {
			this.showDropEventInfo(oEvent, "TreeTable to Table");
		},

		showDragStartEventInfo: function(oEvent, sTitle) {
			sap.m.MessageToast.show(
				sTitle + " (" + "DragStart parameters" + ")"
				+ "\nDrag target: " + oEvent.getParameter("target").getId()
				+ "\nDrag session: " + (oEvent.getParameter("dragSession") ? "available" : "not available")
				+ "\nBrowser event: " + oEvent.getParameter("browserEvent").type,
				{
					width: "25rem"
				}
			);
		},

		showDragEnterEventInfo: function(oEvent, sTitle) {
			sap.m.MessageToast.show(
				sTitle + " (" + "DragEnter parameters" + ")"
				+ "\nDrop target: " + oEvent.getParameter("target").getId()
				+ "\nDrag session: " + (oEvent.getParameter("dragSession") ? "available" : "not available")
				+ "\nBrowser event: " + oEvent.getParameter("browserEvent").type,
				{
					width: "25rem"
				}
			);
		},

		showDropEventInfo: function(oEvent, sTitle) {
			sap.m.MessageToast.show(
				sTitle + " (" + "Drop parameters" + ")"
				+ "\nDragged control: " + oEvent.getParameter("draggedControl").getId()
				+ "\nDropped control: " + oEvent.getParameter("droppedControl").getId()
				+ "\nDrop position: " + oEvent.getParameter("dropPosition")
				+ "\nDrag session: " + (oEvent.getParameter("dragSession") ? "available" : "not available")
				+ "\nBrowser event: " + oEvent.getParameter("browserEvent").type,
				{
					duration: 8000,
					width: "25rem"
				}
			);
		},

		getProgress: function(sValue) {
			sValue = sValue || "";
			return (sValue.length * 10) % 100;
		},

		getRating: function(sValue) {
			sValue = sValue || "";
			return sValue.length % 5;
		}
	});
});
