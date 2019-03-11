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
			// setTimeout(this.showNumbers.bind(this), 5000);

			// Experiment to add the dnd info from outside
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
						var oDragged = oInfo.getParameter("draggedControl").getDomRef();
						var oDropped = oInfo.getParameter("droppedControl").getDomRef();
						var sInsertPosition = oInfo.getParameter("dropPosition");
						if (sInsertPosition === "Before") {
							oDropped.parentNode.insertBefore(oDragged, oDropped);
						} else {
							oDropped.parentNode.insertBefore(oDragged, oDropped.nextSibling);
						}
					}
				}));
			});
		},

		showNumbers: function () {
			jQuery(".sapUiLayoutCSSGrid").each(function (iGrid, oGrid) {
				jQuery(oGrid).find(".sapFCardTitle>span, .sapMGTTitle>span").each(function (iIndex, oElement) {
					jQuery(oElement).html((iIndex + 1) + ". " + jQuery(oElement).html());
				});
			});
		},

		onDenseChange: function (oEvent) {
			if (oEvent.getParameter("state")) {
				jQuery(".sapUiLayoutCSSGrid").css({gridAutoFlow: "row dense"});
			} else {
				jQuery(".sapUiLayoutCSSGrid").css({gridAutoFlow: "row"});
			}
		},

		onRowSpanChange: function (oEvent) {
			if (oEvent.getParameter("state")) {
				jQuery(".sapUiLayoutCSSGrid").css({gridAutoRows: "min-content"});
			} else {
				jQuery(".sapUiLayoutCSSGrid").css({gridAutoRows: "80px"});
			}

			jQuery(".sapUiLayoutCSSGrid").children().each(function (iIndex, oElement) {
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