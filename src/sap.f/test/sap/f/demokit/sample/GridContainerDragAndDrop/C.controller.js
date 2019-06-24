sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/dnd/DragInfo',
	'sap/f/dnd/GridDropInfo',
	'sap/ui/integration/widgets/Card'
], function (Controller, JSONModel, DragInfo, GridDropInfo, Card) {
	"use strict";

	return Controller.extend("sap.f.sample.GridContainerDragAndDrop.C", {
		onInit: function () {

			var cardManifests = new JSONModel();

			cardManifests.loadData(sap.ui.require.toUrl("sap/f/sample/GridContainerDragAndDrop/cardManifests.json"));

			this.getView().setModel(cardManifests, "manifests");

			var oGrid = this.byId("grid1");

			oGrid.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));
			oGrid.addDragDropConfig(new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: oGrid.isA("sap.m.List") ? "Vertical" : "Horizontal",
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

		}
	});
});