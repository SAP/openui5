sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/plugins/UploadSetwithTable",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"../model/mockserver",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/ui/core/Item",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Element"
], function (Controller, UploadSetwithTable, MessageBox, Fragment, MockServer, MessageToast, Dialog, Button, mobileLibrary, Text, coreLibrary, CoreItem, Filter, FilterOperator, Element)  {
	"use strict";

	return Controller.extend("multiplePluginInstances.table.sample.controller.Page", {
		onInit: function () {
			this.documentTypes = this.getFileCategories();
			this.oMockServer = new MockServer();
			this.oMockServer.oModel = this.byId("table-uploadSet").getModel("documents");
		},
		onBeforeUploadStarts: function(oEvent) {
			const itemsPath = oEvent.getSource().data("itemsPath");
			this.oMockServer.instancePath = itemsPath;
			// This code block is only for demonstration purpose to simulate XHR requests, hence starting the mockserver.
			this.oMockServer.start();
		},
		onPluginActivated: function(oEvent) {
			const oTable = oEvent.getSource().getParent();
			if (oTable.sId.includes("instance2")) {
				this.oUploadPluginInstance2 = oEvent.getParameter("oPlugin");
			} else if (oTable.sId.includes("instance3")) {
				this.oUploadPluginInstance3 = oEvent.getParameter("oPlugin");
			} else {
				this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
			}
		},
		getIconSrc: function(mediaType, thumbnailUrl) {
			return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
		},
		// Table row selection handler
		onSelectionChange: function (oEvent) {
			const oTable = oEvent.getSource();
			const aSelectedItems = oTable?.getSelectedContexts();
			const oDownloadBtn = this.byId("downloadSelectedButton");

			if (oTable && oTable.sId.includes("instance2")) {
				const oDonwloadBtn2 = this.byId("downloadSelectedButton-instance2");
				if (aSelectedItems.length > 0) {
					oDonwloadBtn2.setEnabled(true);
				} else {
					oDonwloadBtn2.setEnabled(false);
				}
			} else if ( oTable && oTable.sId.includes("instance3") ) {
				const oDonwloadBtn3 = this.byId("downloadSelectedButton-instance3");
				if (aSelectedItems.length > 0) {
					oDonwloadBtn3.setEnabled(true);
				} else {
					oDonwloadBtn3.setEnabled(false);
				}
			} else {
				return aSelectedItems.length ? oDownloadBtn.setEnabled(true) : oDownloadBtn.setEnabled(false);
			}
			return true;
		},
		// Download files handler
		onDownloadFiles: function(oEvent) {
			const oTable = oEvent.getSource().getParent().getParent();
			const oTableId = oTable.getParent().getId();
			if (oTableId.includes("instance2")) {
				const oContexts = oTable.getSelectedContexts();
				if (oContexts && oContexts.length) {
					oContexts.forEach((oContext) => this.oUploadPluginInstance2.download(oContext, true));
				}
			} else if (oTableId.includes("instance3")) {
				const oContexts = oTable.getSelectedContexts();
				if (oContexts && oContexts.length) {
					oContexts.forEach((oContext) => this.oUploadPluginInstance3.download(oContext, true));
				}
			} else {
				const oContexts = oTable.getSelectedContexts();
				if (oContexts && oContexts.length) {
					oContexts.forEach((oContext) => this.oUploadPluginInstance.download(oContext, true));
				}
			}
		},
		// UploadCompleted event handler
		onUploadCompleted: function(oEvent) {
			const oModel = this.byId("table-uploadSet").getModel("documents");
			const iResponseStatus = oEvent.getParameter("status");

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
		onRemoveButtonPress: function(oEvent) {
			var oTable = this.byId("table-uploadSet");
			const aContexts = oTable.getSelectedContexts();
			this.removeItem(aContexts[0]);
		},
		onRemoveHandler: function(oEvent) {
			var oSource = oEvent.getSource();
			const oContext = oSource.getBindingContext("documents");
			this.removeItem(oContext);
		},
		removeItem: function(oContext) {
			const oModel = this.getView().getModel("documents");
			const oTable = this.byId("table-uploadSet");
			MessageBox.warning(
				"Are you sure you want to remove the document" + " " + oContext.getProperty("fileName") + " " + "?",
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
						var spath = oContext.getPath();
						if (spath.split("/")[2]) {
							var index = spath.split("/")[2];
							var data = oModel.getProperty("/items");
							data.splice(index, 1);
							oModel.refresh(true);
							if (oTable && oTable.removeSelections) {
								oTable.removeSelections();
							}
						}
					}
				}
			);
		},
		getFileCategories: function() {
			return [
				{categoryId: "Invoice", categoryText: "Invoice"},
				{categoryId: "Specification", categoryText: "Specification"},
				{categoryId: "Attachment", categoryText: "Attachment"},
				{categoryId: "Legal Document", categoryText: "Legal Document"}
			];
		},
		getFileSizeWithUnits: function(iFileSize) {
			return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
		},
		openPreview: function(oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext("documents");
			if (oSource?.sId.includes("instance2")) {
				if (oBindingContext && this.oUploadPluginInstance2) {
					this.oUploadPluginInstance2?.openFilePreview(oBindingContext);
				}
			} else if (oSource?.sId.includes("instance3")) {
				if (oBindingContext && this.oUploadPluginInstance3) {
					this.oUploadPluginInstance3?.openFilePreview(oBindingContext);
				}
			} else {
				return oBindingContext && this.oUploadPluginInstance ?  this.oUploadPluginInstance?.openFilePreview(oBindingContext) : null;
			}
			return true;
		},
		onSearch: function (oEvent) {
			// add filter for search
			const aFilters = [];
			const sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				const filter = new Filter("fileName", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			const oTable = this.byId("table-uploadSet");
			const oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
		}
	});
});