sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/f/sample/GridContainersNavigation/RevealGrid/RevealGrid",
	"sap/ui/events/KeyCodes",
	"sap/m/MessageToast"
], function (
	Controller,
	JSONModel,
	RevealGrid,
	KeyCodes,
	MessageToast
) {
	"use strict";

	return Controller.extend("sap.f.sample.GridContainersNavigation.C", {

		onInit: function () {
			var oCardManifests = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridContainersNavigation/cardManifests.json"));
			this.getView().setModel(oCardManifests, "manifests");
		},

		onBorderReached: function (oEvent) {
			var oNextGrid = this._findNextGrid(oEvent),
				iRow = oEvent.getParameter("row"),
				iColumn = oEvent.getParameter("column"),
				sDirection = oEvent.getParameter("direction");

			MessageToast.show(oEvent.getSource().getParent().getHeaderText() + " border reached");

			if (oNextGrid) {
				oNextGrid.focusItemByDirection(sDirection, iRow, iColumn);
			}
		},

		onRevealGrid: function () {
			RevealGrid.toggle(["grid1", "grid2", "grid3", "grid4"] , this.getView());
		},

		onExit: function () {
			RevealGrid.destroy(["grid1", "grid2", "grid3", "grid4"] , this.getView());
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
			var oView = this.getView();

			return [
				oView.byId("grid1"),
				oView.byId("grid2"),
				oView.byId("grid3"),
				oView.byId("grid4")
			];
		}
	});
});
