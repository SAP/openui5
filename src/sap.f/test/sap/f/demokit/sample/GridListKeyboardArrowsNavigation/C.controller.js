sap.ui.define([
	"./RevealGrid/RevealGrid",
	"sap/ui/core/mvc/Controller",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (RevealGrid, Controller, KeyCodes, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListKeyboardArrowsNavigation.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridListKeyboardArrowsNavigation/model/data.json"));
			this.getView().setModel(oModel);
		},

		onExit: function () {
			RevealGrid.destroy(this._getAllGrids().map(function (oGridList) { return oGridList.getId(); }), this.getView());
		},

		onRevealGrids: function (oEvent) {
			RevealGrid.toggle(this._getAllGrids().map(function (oGridList) { return oGridList.getId(); }), this.getView());
		},

		onBorderReached: function (oEvent) {
			MessageToast.show("Reached border of " + oEvent.getSource().getHeaderText());

			var oNextGrid = this._findNextGrid(oEvent),
				iRow = oEvent.getParameter("row"),
				iColumn = oEvent.getParameter("column"),
				sDirection = oEvent.getParameter("direction");

			if (oNextGrid) {
				oNextGrid.focusItemByDirection(sDirection, iRow, iColumn);
			}
		},

		onSliderMoved: function (oEvent) {
			this.byId("container").setWidth(oEvent.getParameter("value") + "%");
		},

		_findNextGrid: function (oEvent) {
			var oOriginalEvent = oEvent.getParameter("event"),
				oCurrentlyFocusedItemRect = oOriginalEvent.target.getBoundingClientRect(),
				oCurrentGrid = oEvent.getSource(),
				aGrids = this._getAllGrids(),
				sKeyCode = oOriginalEvent.keyCode,
				oGrid,
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
						if (oCurrentlyFocusedItemRect.right < oGridRect.left &&
							oCurrentlyFocusedItemRect.bottom > oGridRect.top &&
							oCurrentlyFocusedItemRect.top < oGridRect.bottom) {
							return oGrid;
						}
						break;
					case KeyCodes.ARROW_LEFT:
						if (oCurrentlyFocusedItemRect.left > oGridRect.right &&
							oCurrentlyFocusedItemRect.bottom > oGridRect.top &&
							oCurrentlyFocusedItemRect.top < oGridRect.bottom) {
							return oGrid;
						}
						break;
					case KeyCodes.ARROW_DOWN:
						if (oCurrentlyFocusedItemRect.bottom < oGridRect.top &&
							oCurrentlyFocusedItemRect.left < oGridRect.right &&
							oCurrentlyFocusedItemRect.right > oGridRect.left) {
							return oGrid;
						}
						break;
					case KeyCodes.ARROW_UP:
						if (oCurrentlyFocusedItemRect.top > oGridRect.bottom &&
							oCurrentlyFocusedItemRect.left < oGridRect.right &&
							oCurrentlyFocusedItemRect.right > oGridRect.left) {
							return oGrid;
						}
						break;
				}
			}

			return null;
		},

		_getAllGrids: function () {
			return this.getView().findAggregatedObjects(
				true,
				function (oElem) {
					return oElem.isA("sap.f.GridList");
				}
			);
		}

	});
});