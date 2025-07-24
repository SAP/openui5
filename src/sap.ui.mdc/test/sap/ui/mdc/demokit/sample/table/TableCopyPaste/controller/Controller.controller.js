sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("mdc.sample.controller.Controller", {
		onPaste: function(oEvent) {
			const aData = oEvent.getParameter("data");

			MessageBox.information(`Pasted data:\n ${aData.map((aRow) => aRow.join(" | ")).join("\n")}`);
		},

		onBeforeOpenContextMenu: function(oEvent) {
			const oTable = oEvent.getSource();
			const aSelectedContexts = oTable.getSelectedContexts();

			if (aSelectedContexts.length === 0) {
				oEvent.preventDefault();
			} else {
				const oRightClickedRowContext = oEvent.getParameter("bindingContext");
				const bContextMenuOpenedOnSelectedRow = aSelectedContexts.includes(oRightClickedRowContext);

				this.byId("contextMenuSetting").setScope(bContextMenuOpenedOnSelectedRow ? "Selection" : "Default");
			}
		},

		copySelectionData: function() {
			this.byId("copyProvider").copySelectionData();
		}
	});

});
