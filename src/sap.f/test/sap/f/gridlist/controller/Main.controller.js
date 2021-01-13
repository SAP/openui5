sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, KeyCodes, Log, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.gridlist.controller.Main", {
		onInit: function () {
			var sDataUrl = sap.ui.require.toUrl("sap/f/gridlist/model/data.json"); // resolve the correct path for GridListVisualTests
			var model = new JSONModel(sDataUrl);
			this.getView().setModel(model);

			this.attachBorderReached();
		},
		onLayoutChange: function (oEvent) {
			Log.error("[TEST] Layout Changed to " + oEvent.getParameter("layout"));
		},
		onSliderMoved: function (oEvent) {
			var value = oEvent.getParameter("value");
			this.getView().byId("growingGridListBoxes").getDomRef().style.width = value + "%";
		},
		attachBorderReached: function () {
			var aGridLists = this.getView().findAggregatedObjects(
				false,
				function (oElem) { return oElem.isA("sap.f.GridList"); }
			);

			aGridLists.forEach(function (oGridList) {
				oGridList.attachBorderReached(this.onBorderReached.bind(this));
			}.bind(this));
		},
		onBorderReached: function (oEvent) {
			MessageToast.show(oEvent.getSource().getHeaderText() + " border reached");

			var oNextGrid = this._findNextGrid(oEvent),
				iRow = oEvent.getParameter("row"),
				iColumn = oEvent.getParameter("column"),
				sDirection = oEvent.getParameter("direction");

			if (oNextGrid) {
				oNextGrid.focusItemByDirection(sDirection, iRow, iColumn);
			} else {
				Log.warning("Couldn't find next grid");
			}
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
			return this.getView().findAggregatedObjects(
				false,
				function (oElem) { return oElem.isA("sap.f.GridList"); }
			);
		}
	});

});

