sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/layout/sample/GridAutoRows/RevealGrid/RevealGrid"
], function (Controller, RevealGrid) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridAutoRows.GridAutoRows", {

		onRevealGrid: function () {
			RevealGrid.toggle(["grid1", "grid2"], this.getView());
		},

		onExit: function() {
			RevealGrid.destroy(["grid1", "grid2"], this.getView());
		}

	});
});