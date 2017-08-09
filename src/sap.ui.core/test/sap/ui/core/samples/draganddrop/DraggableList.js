sap.ui.define(['sap/m/List'], function(List) {
		"use strict";

	// LIST extension
	var DraggableList = List.extend("my.DraggableList", {
		metadata : {
			properties: {
				dropPosition : {type : "sap.ui.core.dnd.DropPosition", defaultValue : sap.ui.core.dnd.DropPosition.Between},
				dropEffect : {type : "sap.ui.core.dnd.DropEffect", defaultValue : sap.ui.core.dnd.DropEffect.Move}
			},
			aggregations : {
				dragDropConfig : {name : "dragDropConfig", type : "sap.ui.core.dnd.DragDropBase", multiple : true}
			},
			events: {
				itemMove : {
					parameters : {
						movedItem : {type : "sap.m.ListItemBase"},
						sourceIndex : {type : "int"},
						targetIndex : {type : "int"}
					}
				}
			}
		},
		renderer: {},
		applySettings: function() {
			List.prototype.applySettings.apply(this, arguments);
			this.addDragDropConfig(new sap.ui.core.dnd.DragDropInfo({
				sourceAggregation: "items",
				targetAggregation: "items",
				drop: this.handleReorderDrop.bind(this),
				dropEffect: this.getDropEffect(),
				dropPosition: this.getDropPosition()
			}));
		},
		handleReorderDrop: function (oEvent) {
			var oDraggedControl = oEvent.getParameter("draggedControl"),
				oDroppedControl = oEvent.getParameter("droppedControl");

			this.fireItemMove({
				movedItem: oDraggedControl,
				sourceIndex: this.indexOfItem(oDraggedControl),
				targetIndex: this.indexOfItem(oDroppedControl)
			});
		}
	});

	return DraggableList;

}, /* bExport= */ true);