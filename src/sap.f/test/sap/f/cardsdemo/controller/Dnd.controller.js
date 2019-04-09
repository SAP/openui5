sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo'
], function (Controller, JSONModel, jQuery, DragInfo, DropInfo) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.sapFCard", {
		onInit: function () {
			var aGrids = [
				this.getView().byId("cssgrid"),
				this.getView().byId("cssgrid2")
			];

			aGrids.forEach(function (oGrid) {
				oGrid.addDragDropConfig(new DragInfo({
					sourceAggregation: "items"
				}));
				oGrid.addDragDropConfig(new DropInfo({
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

						// NOTE DnD can be done with dom manipulations so that the grid is not rerendered each time.
						// But then for IE special logic should take care of it. Or grid can be rerendered for IE only.
					}
				}));
			});
		},

		onDenseChange: function (oEvent) {
			if (oEvent.getParameter("state")) {
				jQuery(".sapFGridContainer").css({gridAutoFlow: "row dense"});
			} else {
				jQuery(".sapFGridContainer").css({gridAutoFlow: "row"});
			}
		},

		onRowSpanChange: function (oEvent) {
			if (oEvent.getParameter("state")) {
				jQuery(".sapFGridContainer").css({gridAutoRows: "min-content"});
				jQuery(".sapFGridContainer").removeClass("sapFGridContainerSnapToRow");
			} else {
				jQuery(".sapFGridContainer").css({gridAutoRows: "80px"});
				jQuery(".sapFGridContainer").addClass("sapFGridContainerSnapToRow");
			}

			jQuery(".sapFGridContainer").children().each(function (iIndex, oElement) {
				var $element = jQuery(oElement);

				if (oEvent.getParameter("state")) {
					$element.data("original-row-start", $element.css("grid-row-start"));
					$element.css("grid-row-start", "span 1");
				} else {
					$element.css("grid-row-start", $element.data("original-row-start"));
				}
			});
		}
	});
});