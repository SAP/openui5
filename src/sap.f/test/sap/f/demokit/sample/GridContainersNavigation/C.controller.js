sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/sample/GridContainer/RevealGrid/RevealGrid",
	"sap/ui/events/KeyCodes",
	"sap/m/MessageToast"
], function (Controller,
			 RevealGrid,
			 KeyCodes,
			 MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.GridContainersNavigation.C", {

		onInit: function () {

		},

		onBorderReached: function (oEvent) {
			var oNextGrid = this._findNextGrid(oEvent),
				iRow = oEvent.getParameter("row"),
				iColumn = oEvent.getParameter("column"),
				sDirection = oEvent.getParameter("direction");

			MessageToast.show(oEvent.getSource().getParent().getHeaderText() + " border reached", { duration: 6000 });

			if (oNextGrid) {
				oNextGrid.focusItemByDirection(sDirection, iRow, iColumn);
			}
		},

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
			RevealGrid.toggle("grid2", this.getView());
			RevealGrid.toggle("grid3", this.getView());
			RevealGrid.toggle("grid4", this.getView());
		},

		onExit: function () {
			RevealGrid.destroy("grid1", this.getView());
			RevealGrid.destroy("grid2", this.getView());
			RevealGrid.destroy("grid3", this.getView());
			RevealGrid.destroy("grid4", this.getView());
		},

		_findNextGrid: function (oEvent) {
			var oCurrentGrid = oEvent.getSource(),
				aGrids = this._getAllGrids(),
				oOriginalEvent = oEvent.getParameter("event"),
				sKeyCode = oOriginalEvent.keyCode,
				oGrid,
				oCurrentGridRect = oCurrentGrid.getDomRef().getBoundingClientRect(),
				oGridRect,
				i;

			for (i = 0; i < aGrids.length; i++) {
				oGrid = aGrids[i];

				if (oGrid === oCurrentGrid) {
					continue;
				}

				oGridRect = oGrid.getDomRef().getBoundingClientRect();

				switch (sKeyCode) {
					case KeyCodes.ARROW_RIGHT:
						if (oCurrentGridRect.right < oGridRect.left &&
							oCurrentGridRect.bottom > oGridRect.top &&
							oCurrentGridRect.top < oGridRect.bottom) {
							return oGrid;
						}
						break;
					case KeyCodes.ARROW_LEFT:
						if (oCurrentGridRect.left > oGridRect.right &&
							oCurrentGridRect.bottom > oGridRect.top &&
							oCurrentGridRect.top < oGridRect.bottom) {
							return oGrid;
						}
						break;
					case KeyCodes.ARROW_DOWN:
						if (oCurrentGridRect.bottom < oGridRect.top &&
							oCurrentGridRect.left < oGridRect.right &&
							oCurrentGridRect.right > oGridRect.left) {
							return oGrid;
						}
						break;
					case KeyCodes.ARROW_UP:
						if (oCurrentGridRect.top > oGridRect.bottom &&
							oCurrentGridRect.left < oGridRect.right &&
							oCurrentGridRect.right > oGridRect.left) {
							return oGrid;
						}
						break;
				}
			}

			return null;
		},

		_getAllGrids: function () {
			return [this.getView().byId("grid1"),
				this.getView().byId("grid2"),
				this.getView().byId("grid3"),
				this.getView().byId("grid4")];
		}
	});
});
