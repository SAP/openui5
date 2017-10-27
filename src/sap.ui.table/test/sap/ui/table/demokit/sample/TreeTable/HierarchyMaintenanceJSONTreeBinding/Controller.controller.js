sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.TreeTable.HierarchyMaintenanceJSONTreeBinding.Controller", {
		onInit: function() {
			var oModel = new JSONModel("test-resources/sap/ui/table/demokit/sample/TreeTable/HierarchyMaintenanceJSONTreeBinding/Clothing.json");

			this.getView().setModel(oModel);
			this._aClipboardData = [];
		},

		onCollapseAll: function() {
			var oTreeTable = this.byId("TreeTable");
			oTreeTable.collapseAll();
		},

		onExpandFirstLevel: function() {
			var oTreeTable = this.byId("TreeTable");
			oTreeTable.expandToLevel(1);
		},

		onDragStart: function(oEvent) {
			var oTreeTable = this.byId("TreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRow = oEvent.getParameter("target");
			var iDraggedRowIndex = oDraggedRow.getIndex();
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var aDraggedRowContexts = [];

			if (aSelectedIndices.length > 0) {
				// If rows are selected, do not allow to start dragging from a row which is not selected.
				if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (var i = 0; i < aSelectedIndices.length; i++) {
						aDraggedRowContexts.push(oTreeTable.getContextByIndex(aSelectedIndices[i]));
					}
				}
			} else {
				aDraggedRowContexts.push(oTreeTable.getContextByIndex(iDraggedRowIndex));
			}

			oDragSession.setComplexData("hierarchymaintenance", {
				draggedRowContexts: aDraggedRowContexts
			});
		},

		onDrop: function(oEvent) {
			var oTreeTable = this.byId("TreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedRow = oEvent.getParameter("droppedControl");
			var aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;
			var oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());

			if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
				return;
			}

			var oModel = oTreeTable.getBinding("rows").getModel();
			var oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			for (var i = 0; i < aDraggedRowContexts.length; i++) {
				if (oNewParentContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}

				// Copy the data to the new parent.
				oNewParent.categories.push(aDraggedRowContexts[i].getProperty());

				// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(aDraggedRowContexts[i].getPath(), undefined, aDraggedRowContexts[i], true);
			}
		},

		onCut: function(oEvent) {
			var oTreeTable = this.byId("TreeTable");
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var oModel = oTreeTable.getBinding("rows").getModel();

			if (aSelectedIndices.length === 0) {
				MessageToast.show("Select at least one row first.");
				return;
			}

			// Cut the data.
			for (var i = 0; i < aSelectedIndices.length; i++) {
				var oContext = oTreeTable.getContextByIndex(aSelectedIndices[i]);
				var oData = oContext.getProperty();

				if (oData) {
					this._aClipboardData.push(oContext.getProperty());

					// The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
					oModel.setProperty(oContext.getPath(), undefined, oContext, true);
				}
			}

			if (this._aClipboardData.length > 0) {
				this.byId("paste").setEnabled(true);
			}
		},

		onPaste: function(oEvent) {
			var oTreeTable = this.byId("TreeTable");
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var oModel = oTreeTable.getBinding("rows").getModel();

			if (aSelectedIndices.length !== 1) {
				MessageToast.show("Select exactly one row first.");
				return;
			}

			var oNewParentContext = oTreeTable.getContextByIndex(aSelectedIndices[0]);
			var oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			// Paste the data to the new parent.
			oNewParent.categories = oNewParent.categories.concat(this._aClipboardData);

			this._aClipboardData = [];
			this.byId("paste").setEnabled(false);
			oModel.refresh();
		}
	});
});

