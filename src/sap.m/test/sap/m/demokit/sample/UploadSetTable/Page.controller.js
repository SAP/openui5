sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/UploadSetTable",
	"sap/m/upload/UploadSetTableItem",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"./mockserver",
	"sap/m/MessageToast"
], function (Controller, JSONModel, UploadSetTable, UploadSetTableItem, MessageBox, Fragment, MockServer, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSetTable.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSetTable/items.json");

			this.getView().setModel(new JSONModel(sPath));

			this.documentTypes = this.getFileCategories();

			this._oFilesTobeuploaded = [];

			var oMockServer = new MockServer();
			oMockServer.init();
		},
		onPersoButtonPressed: function () {
			// personalization code
		},
		getIconSrc: function(mediaType, thumbnailUrl) {
			return UploadSetTable.getIconForFileType(mediaType, thumbnailUrl);
		},
		// Table row selection handler
		onSelectionChange: function(oEvent) {
			var oTable = oEvent.getSource();
			var aSelectedItems = oTable.getSelectedItems();
			var oDownloadBtn = this.byId("downloadSelectedButton");
			var oChangeStatusBtn = this.byId("changeStatusButton");
			var oCreateRevisionBtn = this.byId("createRevisionButton");

			if (aSelectedItems.length > 0) {
				oDownloadBtn.setEnabled(true);
				oChangeStatusBtn.setEnabled(true);
				oCreateRevisionBtn.setEnabled(true);
			} else {
				oDownloadBtn.setEnabled(false);
				oChangeStatusBtn.setEnabled(false);
				oCreateRevisionBtn.setEnabled(false);
			}
		},
		// Download files handler
		onDownloadFiles: function(oEvent) {
			var oUploadSet = this.byId("UploadSetTable");
			oUploadSet.downloadItems(oUploadSet.getSelectedItems());
		},
		onOverflowPress: function(oEvent) {
			var oButton = oEvent.getSource(),
			oView = this.getView();

		// create menu
		if (!this._oMenuFragment) {
			this._oMenuFragment = Fragment.load({
				id: oView.getId(),
				name: "sap.m.sample.UploadSetTable.menu",
				controller: this
			}).then(function(oMenu) {
				oMenu.openBy(oButton);
						this._oMenuFragment = oMenu;
						return this._oMenuFragment;
			}.bind(this));
		} else {
			this._oMenuFragment.openBy(oButton);
		}
		},
		// UploadCompleted event handler
		onUploadCompleted: function(oEvent) {
			var oModel = this.getView().getModel();
			var oData = oModel.getProperty("/items");

			var oItem = oEvent.getParameter("item");
			var iResponseStatus = oEvent.getParameter("status");
			var sResponseText = oEvent.getParameter("responseText");
			var oResponseBody = null;
			// try catch block to perform response parsing
			try {
				oResponseBody = sResponseText ? JSON.parse(sResponseText) : null;
			} catch (error) {
				oResponseBody = null;
			}
			// extracting additional file info
			var aAdditionalInfo = oResponseBody && oResponseBody.additionalFileInfo ? oResponseBody.additionalFileInfo : [];
			var oSelectedDoumentMap = aAdditionalInfo.find(function(oInfo) {
				return oInfo.key === "documentType";
			});

			// check for upload is sucess
			if (iResponseStatus === 201) {
				oData.unshift(
					{
						"id": "23004569",
						"fileName": oItem.getFileName(),
						"mediaType": oItem.getMediaType(),
						"url": oResponseBody ? oResponseBody.fileUrl : "",
						"uploadState": "Complete",
						"revision": "00",
						"status": "In work",
						"fileSize": oResponseBody && oResponseBody.fileSize ? oResponseBody.fileSize : 0,
						"lastModifiedBy": "Jane Burns",
						"lastmodified": "10/03/21, 10:03:00 PM",
						"documentType": oSelectedDoumentMap && oSelectedDoumentMap.key ? oSelectedDoumentMap.value : "Invoice"
					}
				);
				oModel.setProperty("/items", oData);
				setTimeout(function() {
					MessageToast.show("Document Added");
				}, 1000);
			}
		},
		onRemoveHandler: function(oEvent) {
			var clickedControl = oEvent.getSource();
			var olistItemTobeRemoved = null;

			// Traverse up the control hierarchy to find the ColumnListItem
			while (clickedControl && !(clickedControl instanceof UploadSetTableItem)) {
				clickedControl = clickedControl.getParent();
			}

			if (clickedControl instanceof UploadSetTableItem) {
				olistItemTobeRemoved = clickedControl;
			}
			this.removeItem(olistItemTobeRemoved);
		},
		removeItem: function(oItem) {
			var oModel = this.getView().getModel();
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
						}
					}
				}
			);
		},
		getFileCategories: function() {
			return [
				{categoryId: "Invoice", categoryText: "Invoice"},
				{categoryId: "Specification", categoryText: "Specification"},
				{categoryId: "Attachment", categoryText: "Attachment"}
			];
		},
		openFileUploadDialog: function(oItems) {
			var oUploadSet = this.byId("UploadSetTable");
			if (oItems && oItems.selectedItems && oItems.selectedItems.length) {
				var isSameFileNameFound = false;

				this._oFilesTobeuploaded = this._oFilesTobeuploaded.concat(oItems.selectedItems);
				// check for same filename upload, perform check only if UploadSetTable multiple is turned off
				if (oUploadSet && !oUploadSet.getMultiple() && this._oFilesTobeuploaded.length === 1) {
					isSameFileNameFound = this.checkForSameFileName(oItems.selectedItems[0].getFileName());
				}
				var oItemsMap = this._oFilesTobeuploaded.map(function(oItem) {
					return {
						fileName: oItem.getFileName(),
						fileCategorySelected: this.documentTypes[0].categoryId,
						itemInstance: oItem
					};
				}.bind(this));
				var oModel = new JSONModel({
					"selectedItems": oItemsMap,
					"types": this.documentTypes,
					"sameFileNameFound": isSameFileNameFound,
					"sameFileNameUploadChoice": "Create Copy"

				});
				if (!this._fileUploadFragment) {
					Fragment.load({
						name: "sap.m.sample.UploadSetTable.FileUpload",
						id: this.getView().getId() + "-file-upload-dialog",
						controller: this
					})
						.then(function(oPopover) {
							this._fileUploadFragment = oPopover;
							this.getView().addDependent(oPopover);
							oPopover.setModel(oModel);
							oPopover.open();
						}.bind(this));
				} else {
					this._fileUploadFragment.setModel(oModel);
					this._fileUploadFragment.open();
				}
			}
		},
		closeFileUplaodFragment: function() {
			this._fileUploadFragment.destroy();
			this._fileUploadFragment = null;
			this._oFilesTobeuploaded = [];
		},
		handleRemove: function(oEvent) {
			var oSource = oEvent.getSource();
			var oItemInstance = oSource.data().item;
			var oFragmentModel = this._fileUploadFragment.getModel();
			var oSelectedItems = oFragmentModel.getData().selectedItems;
			var iSelectedItemIndex = oSelectedItems.findIndex(function(oItem){
				return oItem.itemInstance.getId() === oItemInstance.getId();
			});
			oSelectedItems.splice(iSelectedItemIndex, 1);
			this._oFilesTobeuploaded.splice(iSelectedItemIndex, 1);
			var oModel = new JSONModel({
				"selectedItems": oSelectedItems,
				"types": this.documentTypes

			});
			this._fileUploadFragment.setModel(oModel);
		},
		isAddButtonEnabled: function(aSelectedItems) {
			if (aSelectedItems && aSelectedItems.length) {
				if (aSelectedItems.some(function(item){
					return !item.fileCategorySelected;
				})) {
					return false;
				}
				return true;
			} else {
				return false;
			}
		},
		onDocumentTypeChange: function(oEvent) {
			var isAddButtnEnabled = this.isAddButtonEnabled(oEvent.getSource().getModel().getData().selectedItems);
			this._fileUploadFragment.getBeginButton().setEnabled(isAddButtnEnabled);
		},
		handleConfirmation: function() {
			var aFileToBeUploaded = [];
			var oUploadSetTableInstance = this.byId("UploadSetTable");
			var oData = this._fileUploadFragment.getModel().getData();
			var oSelectedItems = oData.selectedItems;
			if (oData && oData.sameFileNameFound) {
				switch (oData.sameFileNameUploadChoice) {
					case "Create Copy": // continue with default upload and model updates the version of the same files through backend.
						break;
					case "Replace": // logic to replace items
					default:
						break;
				}
			}
			if (oSelectedItems && oSelectedItems.length) {
				oSelectedItems.forEach(function(oItem) {
					var oItemToUploadRef = oItem.itemInstance;
					var oSelectedDocumentType = {
						key: "documentType",
						value: oItem.fileCategorySelected
					};
					oItemToUploadRef.setAdditionalFileInfo(oItemToUploadRef.getAdditionalFileInfo().concat([
						oSelectedDocumentType
					]));
					aFileToBeUploaded.push(oItemToUploadRef);
				});
			}
			if (aFileToBeUploaded.length) {
				oUploadSetTableInstance.uploadItems(aFileToBeUploaded);
			}
			this._fileUploadFragment.destroy();
			this._fileUploadFragment = null;
			this._oFilesTobeuploaded = [];
		},
		uploadFilesHandler: function() {
			var oUploadSetTableInstance = this.byId("UploadSetTable");
			oUploadSetTableInstance.fileSelectionHandler(this.selectedFilesFromHandler.bind(this));
		},
		selectedFilesFromHandler: function(oItems) {
			this.openFileUploadDialog(oItems);
		},
		onChangeStatus: function() {
			// Change status handling code
		},
		onCreateRevision: function() {
			// Revision Creation handling code
		},
		getFileSizeWithUnits: function(iFileSize) {
			return UploadSetTable.getFileSizeWithUnits(iFileSize);
		},
		// Util method to check if same filename exists in the uploaded items
		// Check performed at the application level as the control might be limited to uploaded items to current page delegate and not have actualy items untill loaded
		checkForSameFileName: function(sFilename) {
			var oUploadedItems = this.getView().getModel().getData().items; // fetching all the data for the check

			if (oUploadedItems.length === 0 || !sFilename) {
				return false;
			}

			var iLength = oUploadedItems.length;
			sFilename = sFilename.replace(/^\s+/, "");

			for (var i = 0; i < iLength; i++) {
				if (sFilename === oUploadedItems[i].fileName) {
					return true;
				}
			}
			return false;
		},
		onChoiceChange: function(oEvent) {
			var oModelData = oEvent.getSource().getModel();
			if (oEvent.getSource().getSelected()) {
				oModelData.setProperty("/sameFileNameUploadChoice", oEvent.getSource().getText());
			}
		},
		openPreview: function(oEvent) {
			var clickedControl = oEvent.getSource();
			while (clickedControl && !(clickedControl instanceof UploadSetTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			clickedControl.openPreview();
		}
	});
});