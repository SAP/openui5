sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.TreeTable.HierarchyMaintenanceJSONTreeBinding.Controller", {
		onInit: function() {
			const oModel = new JSONModel("test-resources/sap/ui/table/demokit/sample/TreeTable/HierarchyMaintenanceJSONTreeBinding/Clothing.json");

			this.getView().setModel(oModel);
			this._aClipboardData = [];
		},

		onCollapseAll: function() {
			const oTreeTable = this.byId("TreeTable");
			oTreeTable.collapseAll();
		},

		onExpandFirstLevel: function() {
			const oTreeTable = this.byId("TreeTable");
			oTreeTable.expandToLevel(1);
		},

		onDragStart: function(oEvent) {
			const oTreeTable = this.byId("TreeTable");
			const oDragSession = oEvent.getParameter("dragSession");
			const oDraggedRow = oEvent.getParameter("target");
			const iDraggedRowIndex = oDraggedRow.getIndex();
			const aSelectedIndices = oTreeTable.getSelectedIndices();
			const aDraggedRowContexts = [];

			if (aSelectedIndices.length > 0) {
				// If rows are selected, do not allow to start dragging from a row which is not selected.
				if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (let i = 0; i < aSelectedIndices.length; i++) {
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
			const oTreeTable = this.byId("TreeTable");
			const oDragSession = oEvent.getParameter("dragSession");
			const oDroppedRow = oEvent.getParameter("droppedControl");
			const aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;
			const oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());

			if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
				return;
			}

			const oModel = oTreeTable.getBinding().getModel();
			const oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			for (let i = 0; i < aDraggedRowContexts.length; i++) {
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
			const oTreeTable = this.byId("TreeTable");
			const aSelectedIndices = oTreeTable.getSelectedIndices();
			const oModel = oTreeTable.getBinding().getModel();

			if (aSelectedIndices.length === 0) {
				MessageToast.show("Select at least one row first.");
				return;
			}

			// Cut the data.
			for (let i = 0; i < aSelectedIndices.length; i++) {
				const oContext = oTreeTable.getContextByIndex(aSelectedIndices[i]);
				const oData = oContext.getProperty();

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
			const oTreeTable = this.byId("TreeTable");
			const aSelectedIndices = oTreeTable.getSelectedIndices();
			const oModel = oTreeTable.getBinding().getModel();

			if (aSelectedIndices.length !== 1) {
				MessageToast.show("Select exactly one row first.");
				return;
			}

			const oNewParentContext = oTreeTable.getContextByIndex(aSelectedIndices[0]);
			const oNewParent = oNewParentContext.getProperty();

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