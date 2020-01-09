sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/dnd/DragInfo",
	"sap/f/dnd/GridDropInfo",
	"sap/f/sample/GridContainerDragAndDrop/RevealGrid/RevealGrid"
], function (Controller, JSONModel, DragInfo, GridDropInfo, RevealGrid) {
	"use strict";

	return Controller.extend("sap.f.sample.GridContainerDragAndDrop.C", {

		onInit: function () {
			var oCardManifests = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridContainerDragAndDrop/cardManifests.json"));
			var oGrid = this.byId("grid1");

			this.getView().setModel(oCardManifests, "manifests");

			oGrid.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));

			oGrid.addDragDropConfig(new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Horizontal",
				drop: function (oInfo) {
					var oDragged = oInfo.getParameter("draggedControl"),
						oDropped = oInfo.getParameter("droppedControl"),
						oDragParent = oDragged.getParent(),
						oDropParent = oDropped.getParent(),
						sInsertPosition = oInfo.getParameter("dropPosition"),
						iDragPosition = oDragParent.indexOfItem(oDragged),
						iDropPosition = oDropParent.indexOfItem(oDropped);

					oDragParent.removeItem(oDragged);

					if (oDragParent === oDropParent && iDragPosition < iDropPosition) {
						iDropPosition--;
					}

					if (sInsertPosition === "Before") {
						oDropParent.insertItem(oDragged, iDropPosition);
					} else {
						oDropParent.insertItem(oDragged, iDropPosition + 1);
					}
				}
			}));

			// Use smaller margin around grid when on smaller screens
			oGrid.attachLayoutChange(function (oEvent) {
				var sLayout = oEvent.getParameter("layout");

				if (sLayout === "layoutXS" || sLayout === "layoutS") {
					oGrid.removeStyleClass("sapUiSmallMargin");
					oGrid.addStyleClass("sapUiTinyMargin");
				} else {
					oGrid.removeStyleClass("sapUiTinyMargin");
					oGrid.addStyleClass("sapUiSmallMargin");
				}
			});
		},

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
		},

		onExit: function () {
			RevealGrid.destroy("grid1", this.getView());
		}

	});
});