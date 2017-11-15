sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TreeDnD.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.m.sample.TreeDnD", "/Tree.json"));
			this.getView().setModel(oModel);

			var oTree = this.byId("Tree");
			oTree.setMode("MultiSelect");
		},

		onDragStart : function (oEvent) {
			var oTree = this.byId("Tree");
			var oBinding = oTree.getBinding("items");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedItem = oEvent.getParameter("target");
			var iDraggedItemIndex = oTree.indexOfItem(oDraggedItem);
			var aSelectedIndices = oTree.getBinding("items").getSelectedIndices();
			var aSelectedItems = oTree.getSelectedItems();
			var aDraggedItemContexts = [];

			if (aSelectedItems.length > 0) {
				// If items are selected, do not allow to start dragging from a item which is not selected.
				if (aSelectedIndices.indexOf(iDraggedItemIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (var i = 0; i < aSelectedItems.length; i++) {
						aDraggedItemContexts.push(oBinding.getContextByIndex(aSelectedIndices[i]));
					}
				}
			} else {
				aDraggedItemContexts.push(oBinding.getContextByIndex(iDraggedItemIndex));
			}

			oDragSession.setComplexData("hierarchymaintenance", {
				draggedItemContexts: aDraggedItemContexts
			});
		},

		onDrop: function (oEvent) {
			var oTree = this.byId("Tree");
			var oBinding = oTree.getBinding("items");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedItem = oEvent.getParameter("droppedControl");
			var aDraggedItemContexts = oDragSession.getComplexData("hierarchymaintenance").draggedItemContexts;
			var iDroppedIndex = oTree.indexOfItem(oDroppedItem);
			var oNewParentContext = oBinding.getContextByIndex(iDroppedIndex);

			if (aDraggedItemContexts.length === 0 || !oNewParentContext) {
				return;
			}

			var oModel = oTree.getBinding("items").getModel();
			var oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			for (var i = 0; i < aDraggedItemContexts.length; i++) {
				if (oNewParentContext.getPath().indexOf(aDraggedItemContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}

				// Copy the data to the new parent.
				oNewParent.categories.push(aDraggedItemContexts[i].getProperty());

				// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(aDraggedItemContexts[i].getPath(), undefined, aDraggedItemContexts[i], true);
			}
		}


	});

	return PageController;

});
