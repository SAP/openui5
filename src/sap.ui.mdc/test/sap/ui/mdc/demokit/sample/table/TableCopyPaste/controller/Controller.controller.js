sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("mdc.sample.controller.Controller", {
		onPaste: function(oEvent) {
			const aData = oEvent.getParameter("data");

			MessageBox.information(`Pasted data:\n ${aData.map((aRow) => aRow.join(" | ")).join("\n")}`);
		}
	});

});
