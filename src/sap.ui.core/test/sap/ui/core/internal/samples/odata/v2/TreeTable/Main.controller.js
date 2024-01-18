/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/OperationMode"
], function (MessageToast, Messaging, Controller, Filter, FilterOperator, FilterType, CountMode,
		OperationMode) {
	"use strict";
	return Controller.extend("sap.ui.core.internal.samples.odata.v2.TreeTable.Main", {
		clearPersistentMessages : function (bUnboundOnly) {
			var aMessages = this.getView().getModel("messages").getObject("/");

			Messaging.removeMessages(aMessages.filter(function (oMessage) {
				return (oMessage.technical || oMessage.persistent)
					&& (!bUnboundOnly || !oMessage.target);
			}));
		},

		formatMessageDescription : function (oMessage) {
			var sMessageDescription = oMessage.description,
				sResult = sMessageDescription ? sMessageDescription + "\n\n" : "";

			return sResult + "See technical details for more information.";
		},

		formatMessageTargets : function (aTargets) {
			return aTargets && aTargets.join("\n");
		},

		onBindTable : function () {
			var oView = this.getView(),
				oModel = oView.getModel(),
				oUiModel = oView.getModel("ui"),
				iExpandedLevels = oUiModel.getProperty("/expandedLevels"),
				oTable = oView.byId("treetable"),
				oRowsBinding = oTable.getBinding("rows");

			oTable.unbindRows();
			if (oRowsBinding) {
				// workaround: change listener should be removed before unbindRows, but not all
				// change listeners are automatically removed, that means the binding stays in the
				// list of active bindings in the model. Detaching the change handler at this point,
				// when the event listener map is already cleared, also removes the binding from the
				// models list of active bindings
				oRowsBinding.detachChange(this.onCheckPendingChanges, this);
			}

			oModel.setRefreshAfterChange(oUiModel.getProperty("/refreshAfterChange"));

			oTable.bindRows({
				path : "/ErhaOrder('1')/to_Item",
				parameters : {
					countMode : CountMode.Inline,
					numberOfExpandedLevels : iExpandedLevels,
					operationMode : OperationMode.Server,
					restoreTreeStateAfterChange : oUiModel.getProperty("/restoreState"),
					select : "ErhaOrderItem,ErhaOrderItemName,HierarchySiblingRank,ErhaOrder,"
						+ "ParentItem,CreatedByUser,CreationDateTime,"
						// technical properties
						+ "HierarchyDrillState,HierarchyDistanceFromRoot,HierarchyDescendantCount,"
						+ "HierarchyNode,HierarchyParentNode,HierarchyPreorderRank,"
						+ "HierarchySiblingRank",
					threshold : 10,
					treeAnnotationProperties : undefined
				}
			});
			oTable.getBinding("rows").attachChange(this.onCheckPendingChanges, this);
			oUiModel.setProperty("/tableBound", true);
		},

		onCancelCreateItem : function () {
			this.getView().byId("createItem").close();
		},

		onCheckPendingChanges : function () {
			var oView = this.getView(),
				oModel = oView.getModel(),
				oUiModel = oView.getModel("ui");

			oUiModel.setProperty("/pendingChanges", oModel.hasPendingChanges());
		},

		onCloseMessageDetails : function (oEvent) {
			var oMessageDetails = this.byId("messageDetails");

			oMessageDetails.setBindingContext(null);
			oMessageDetails.close();
		},

		onCollapseAll : function () {
			this.getView().byId("treetable").collapseAll();
		},

		onCreate : function () {
			this.getView().byId("createItem").open();
		},

		onCreateItem : function () {
			var oView = this.getView(),
				sItemName = oView.byId("newItemName").getValue(),
				oTable = oView.byId("treetable"),
				oBinding = oTable.getBinding("rows"),
				oContext = oBinding.createEntry();

			oBinding.getModel().setProperty("ErhaOrderItemName", sItemName, oContext);
			oBinding.addContexts(oTable.getContextByIndex(oTable.getSelectedIndices()[0]),
				[oContext]);
			oView.byId("createItem").close();
		},

		onCut : function () {
			var aClipboardEntries, oRemovedContext,
				oView = this.getView(),
				oClipboardModel = oView.getModel("clipboard"),
				oTable = oView.byId("treetable"),
				oBinding = oTable.getBinding("rows"),
				iSelectedIndex = oTable.getSelectedIndices()[0];

			oRemovedContext = oBinding.removeContext(oTable.getContextByIndex(iSelectedIndex));
			// use a copy to force a change event
			aClipboardEntries = oClipboardModel.getProperty("/nodes").slice();
			aClipboardEntries.push({
				key : oBinding.getModel().getKey(oRemovedContext),
				context : oRemovedContext
			});
			oClipboardModel.setProperty("/nodes", aClipboardEntries);
			this.resetTableSelection();
		},

		onDelete : function () {
			var oTable = this.byId("treetable");

			oTable.getBinding("rows")
				.removeContext(oTable.getContextByIndex(oTable.getSelectedIndices()[0]));
			this.resetTableSelection();
		},

		onDragStart : function (oEvent) {
			oEvent.getParameter("dragSession").setComplexData("moveItem", {
				draggedRowContext : this.getView().byId("treetable")
					.getContextByIndex(oEvent.getParameter("target").getIndex())
			});
		},

		onDrop : function (oEvent) {
			var oNewParentContext,
				iDroppedIndex = oEvent.getParameter("droppedControl").getIndex(),
				oDraggedRowContext = oEvent.getParameter("dragSession").getComplexData("moveItem")
					.draggedRowContext,
				oTable = this.getView().byId("treetable"),
				oBinding = oTable.getBinding("rows");

			if (oDraggedRowContext) {
				oNewParentContext = oTable.getContextByIndex(iDroppedIndex);

				if (oNewParentContext) {
					oBinding.removeContext(oDraggedRowContext);
					oBinding.addContexts(oNewParentContext, oDraggedRowContext);
				}
			}
		},

		onExpandAll : function () {
			this.getView().byId("treetable").expandToLevel(99);
		},

		onFilterByCreator : function () {
			var oView = this.getView(),
				sFilterValue = oView.getModel("ui").getProperty("/createdByFilter");

			// use application filter type as the ODataTreeBinding supports control filter only if
			// operation mode is client or auto (if all data is on the client)
			oView.byId("treetable").getBinding("rows").filter(sFilterValue
				? new Filter("CreatedByUser", FilterOperator.Contains, sFilterValue.toUpperCase())
				: [], FilterType.Application);
		},

		onInit : function () {
			this.getView().getModel().attachPropertyChange(this.onCheckPendingChanges.bind(this));
		},

		onInsertFromClipboard : function (oEvent) {
			var oNewParentContext,
				oClipboardEntry = oEvent.getParameter("selectedContexts")[0].getProperty(""),
				oView = this.getView(),
				oClipboardModel = oView.getModel("clipboard"),
				oTable = oView.byId("treetable");

			//TODO: support inserting multiple entries from clipboard
			oNewParentContext = oTable.getContextByIndex(oTable.getSelectedIndices()[0]);
			oTable.getBinding("rows").addContexts(oNewParentContext, oClipboardEntry.context);
			oClipboardModel.setProperty("/nodes",
				oClipboardModel.getProperty("/nodes").filter(function(oEntry) {
					return oEntry !== oClipboardEntry;
				}));

			MessageToast.show("Item '" + oClipboardEntry.key + "' was re-inserted.");
		},

		onMessagePopoverClosed : function () {
			this.clearPersistentMessages(true);
		},

		onMessagePopoverPress : function (oEvent) {
			this.getView().byId("messagePopover").toggle(oEvent.getSource());
		},

		onPaste : function () {
			this.getView().byId("pasteDialog").open();
		},

		onRefresh : function () {
			this.getView().byId("treetable").getBinding("rows").refresh();
		},

		onReset : function () {
			this.getView().getModel().resetChanges();
		},

		onRowSelection : function () {
			var oView = this.getView();

			oView.getModel("ui").setProperty("/rowSelected",
				!!oView.byId("treetable").getSelectedIndices().length);
		},

		onSave : function () {
			var oTable = this.getView().byId("treetable");

			MessageToast.show("Submitting changes...");

			oTable.getBinding("rows").getModel().submitChanges();
			oTable.setFirstVisibleRow(0); // scroll to top after submitting
		},

		onShowMessageDetails : function (oEvent) {
			var oContext = oEvent.getSource().getObjectBinding("messages").getBoundContext(),
				oMessageDetails = this.byId("messageDetails");

			oMessageDetails.setBindingContext(oContext, "messages");
			oMessageDetails.open();
		},

		resetTableSelection : function () {
			var oView = this.getView();

			oView.byId("treetable").clearSelection();
			oView.getModel("ui").setProperty("/rowSelected", false);
		},

		updateMessageCount : function () {
			var oView = this.getView(),
				oMessagePopoverBinding = oView.byId("messagePopover").getBinding("items");

			oView.getModel("ui").setProperty("/messageCount", oMessagePopoverBinding.getLength());
		}
	});
});