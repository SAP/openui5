sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/m/MessageBox",
	"./test/mockserver",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, UploadSetwithTable, UploadSetwithTableItem, MessageBox, MockServer, MessageToast,CoreItem, Filter, FilterOperator)  {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSetwithTableFilePreview.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSetwithTable/UploadSetwithTableFilePreview/test/items.json");

			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.oUploadSetTable = this.byId("UploadSetTable");

			this.oItemsProcessor = [];
			this.oMockServer = new MockServer();
			this.oMockServer.oModel = oModel;
		},
		getIconSrc: function(mediaType, thumbnailUrl) {
			return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
		},
		// Table row selection handler
		onSelectionChange: function(oEvent) {
			var oTable = oEvent.getSource();
			var aSelectedItems = oTable.getSelectedItems();
			var oDownloadBtn = this.byId("downloadSelectedButton");
			var oEditUrlBtn = this.byId("editUrlButton");
			var oRenameBtn = this.byId("renameButton");
			var oRemoveDocumentBtn = this.byId("removeDocumentButton");

			if (aSelectedItems.length > 0) {
				oDownloadBtn.setEnabled(true);
			} else {
				oDownloadBtn.setEnabled(false);
			}
			if (aSelectedItems.length === 1){
				oEditUrlBtn.setEnabled(true);
				oRenameBtn.setEnabled(true);
				oRemoveDocumentBtn.setEnabled(true);
			} else {
				oRenameBtn.setEnabled(false);
				oEditUrlBtn.setEnabled(false);
				oRemoveDocumentBtn.setEnabled(false);
			}
		},
		// Download files handler
		onDownloadFiles: function(oEvent) {
			var oUploadSet = this.byId("UploadSetTable");
			const oItems = oUploadSet.getSelectedItems();

			oItems.forEach((oItem) => {oItem.download(true);});
		},
		onBeforeInitiatingItemUpload: function(oEvent) {
			var oUploadSetTableInstance = this.byId("UploadSetTable");
			var oItem = oEvent.getParameter("item");

			/** Demonstration of Updating the Document without file with actual file.
			 * Note:- This is just demonstration of idea how the feature can be acheived by setting the hederfield data of empty documentId on the UploadSetwithTableItem instance.
			 * Please check mockserver.js for the logic to simulate how the empty document is updated with file selected for upload using the existing document id.
			 */
			var oSelectedItems = oUploadSetTableInstance.getSelectedItems();
			var oSelectedItemForUpdate = oSelectedItems.length === 1 ? oSelectedItems[0] : null;
			if (oSelectedItemForUpdate && oSelectedItemForUpdate.getFileName() === "-") {
				if (oSelectedItemForUpdate) {
					var oContext = oSelectedItemForUpdate.getBindingContext();
					var data = oContext && oContext.getObject ? oContext.getObject() : {};
					oItem.addHeaderField(new CoreItem(
						{
							key: "existingDocumentID",
							text: data ? data.id : ""
						}
					));
				}
			}
		},
		// UploadCompleted event handler
		onUploadCompleted: function(oEvent) {
			var oModel = this.getView().getModel();
			var iResponseStatus = oEvent.getParameter("status");

			// check for upload is sucess
			if (iResponseStatus === 201) {
				oModel.refresh(true);
				setTimeout(function() {
					MessageToast.show("Document Added");
				}, 1000);
			}
			// This code block is only for demonstration purpose to simulate XHR requests, hence restoring the server to not fake the xhr requests.
			this.oMockServer.restore();
		},
		onRemoveHandler: function(oEvent) {
			var clickedControl = oEvent.getSource();
			var olistItemTobeRemoved = null;

			// Traverse up the control hierarchy to find the ColumnListItem
			while (clickedControl && !(clickedControl instanceof UploadSetwithTableItem)) {
				clickedControl = clickedControl.getParent();
			}

			if (clickedControl instanceof UploadSetwithTableItem) {
				olistItemTobeRemoved = clickedControl;
			}
			this.removeItem(olistItemTobeRemoved);
		},
		removeItem: function(oItem) {
			var oModel = this.getView().getModel();
			var oUploadSet = this.byId("UploadSetTable");
			MessageBox.warning(
				"Are you sure you want to remove the document" + " " + oItem.getFileName() + " " + "?",
				{
					icon: MessageBox.Icon.WARNING,
					actions: ["Remove", MessageBox.Action.CANCEL],
					emphasizedAction: "Remove",
					styleClass: "sapMUSTRemovePopoverContainer",
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function(sAction) {
						if (sAction !== "Remove") {
							return;
						}
						var spath = oItem.getBindingContext().sPath;
						if (spath.split("/")[2]) {
							var index = spath.split("/")[2];
							var data = oModel.getProperty("/items");
							data.splice(index, 1);
							oModel.refresh(true);
							if (oUploadSet && oUploadSet.removeSelections) {
								oUploadSet.removeSelections();
							}
						}
					}
				}
			);
		},
		getFileSizeWithUnits: function(iFileSize) {
			return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
		},
		openPreview: function(oEvent) {
			var clickedControl = oEvent.getSource();
			while (clickedControl && !(clickedControl instanceof UploadSetwithTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			clickedControl.openPreview();
		},
		onBeforeUploadStarts: function() {
			// This code block is only for demonstration purpose to simulate XHR requests, hence starting the mockserver.
			this.oMockServer.start();
		},
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("fileName", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var oUploadSet = this.byId("UploadSetTable");
			var oBinding = oUploadSet.getBinding("items");
			oBinding.filter(aFilters, "Application");
		}
	});
});