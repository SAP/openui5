sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"./test/mockserver",
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
], function (Controller, JSONModel, UploadSetwithTable, UploadSetwithTableItem, MessageBox, Fragment, MockServer, MessageToast, Dialog, Button, mobileLibrary, Text, coreLibrary, CoreItem, Filter, FilterOperator, Element)  {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSetwithTableGrowing.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSetwithTable/UploadSetwithTableGrowing/test/items.json");

			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.oUploadSetTable = this.byId("UploadSetTable");

			this.documentTypes = this.getFileCategories();
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
			var clickedControl = oEvent.getSource();
			while (clickedControl && !(clickedControl instanceof UploadSetwithTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			clickedControl.openPreview();
		},
		_isValidUrl: function (sUrl) {
			var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			return regexp.test(sUrl);
		},
		_isValidName: function () {
			var domRefName = Element.getElementById('addViaUrlDialog--nameInput'),
			sName = domRefName.getValue(),
			bHasError = false;
			if (!sName) {
				domRefName.setValueState('Error');
				domRefName.setValueStateText('Text is either empty or contains special characters');
				bHasError = true;
			} else {
				domRefName.setValueState('None');
				bHasError = false;
			}
			return !bHasError;
		},
		_validateAddOrEditUrlDialog:  function () {
			var domRefUrl = Element.getElementById('addViaUrlDialog--urlInput'),
			domRefName = Element.getElementById('addViaUrlDialog--nameInput'),
			sUrl = domRefUrl.getValue(),
			sName = domRefName.getValue(),
			bFormHasError = !this._isValidName();

			if (!sUrl || !this._isValidUrl(sUrl)) {
				domRefUrl.setValueState('Error');
				domRefUrl.setValueStateText('Enter Valid URL');
				bFormHasError = true;
			} else {
				domRefUrl.setValueState('None');
			}

			return {
				error: bFormHasError,
				name: sName,
				url: sUrl
			};
		},
		showEditConfirmation: function () {
			// validate name and set valueState.
			var DialogType = mobileLibrary.DialogType;
			var ValueState = coreLibrary.ValueState;
			var ButtonType = mobileLibrary.ButtonType;
			this.oWarningMessageDialog = new Dialog({
				type: DialogType.Message,
				title: "Warning",
				state: ValueState.Warning,
				content: new Text({ text: "You have made changes to this object. What would you like to do?" }),
				buttons: [ new Button({
					type: ButtonType.Emphasized,
					text: "Save",
					press: [function () {
						var oValidateObject = this._validateAddOrEditUrlDialog(),
						sName = oValidateObject.name,
						sUrl = oValidateObject.url,
						oUploadSetTable = this.byId("UploadSetTable");
						var oBidningContextObject = oUploadSetTable.getSelectedItem().getBindingContext().getObject();
						var oModel = this.getView().getModel();
						var oData = oModel.getProperty("/items");
						var iUpdateIndex, item;
						oData.filter( function (obj, index) {
							if (obj.id === oBidningContextObject.id) {
								iUpdateIndex = index;
								item = obj;
							}
						});
						oData[iUpdateIndex] = Object.assign(item, !this.bRenameDocument ? {
							fileName: sName,
							url:  sUrl
						} : { fileName: sName });
						oModel.setProperty("/items", oData);
						this.oWarningMessageDialog.close();
						this.closeAddViaUrlFragment();

					},this]
				}), new Button({
					text: "DiscardChanges",
					press: [function () {
						this.oWarningMessageDialog.close();
					},this]
				})]
			});
			this.oWarningMessageDialog.open();
		},
		handleAddViaUrl: function (){
			if (this.bEditDocument) {
				if (this._isValidName()){
					this.showEditConfirmation();
				} else {
					MessageToast.show("No Changes found");
				}
				return;
			} else if (this.bRenameDocument) {
				this.showEditConfirmation();
				return;
			}
			var oValidateObject = this._validateAddOrEditUrlDialog(),
			sName = oValidateObject.name,
			sUrl = oValidateObject.url,
			bHasError = oValidateObject.error;
			if (!bHasError) {
				setTimeout(function(){

					var oUploadSetTableInstance = this.byId("UploadSetTable");

					let fnResolve, fnReject;
					var oPromise = new Promise(function(resolve, reject) {
						fnResolve = resolve;
						fnReject = reject;
					});
					var oItem = oUploadSetTableInstance.uploadItemViaUrl(sName, sUrl, oPromise);
					if (oItem) {

						/* Demonstration use case of Setting the header field if required to be passed in API request headers to
						inform backend with the file url captured through user input */
						oItem.addHeaderField(new CoreItem({
							key: 'documentUrl',
							text: sUrl
						}));
						// resolve to initiate the upload.
						fnResolve(true);
					} else {
						fnReject(true);
					}
					this._addViaUrlFragment.destroy();
					this._addViaUrlFragment = null;

				}.bind(this), 1000);
			}
		},
		openAddOrEditDialog: function () {
			if (!this._addViaUrlFragment){
				Fragment.load({
					name: "sap.m.sample.UploadSetwithTable.UploadSetwithTableGrowing.fragments.AddViaUrl",
					id: "addViaUrlDialog",
					controller: this
				})
				.then(function (oPopover) {
					this._addViaUrlFragment = oPopover;
					this.getView().addDependent(oPopover);
					// if edit is clicked
					var editFileInfo = this.oEditDocumentInfo;
					var renameFileInfo = this.oRenameDocumentInfo;
					if (this.bEditDocument && this.oEditDocumentInfo) {
						Element.getElementById('addViaUrlDialog--addViaUrlDialog').setTitle("Edit URL");
						Element.getElementById('addViaUrlDialog--addDocumentBtn').setText("Apply");
						Element.getElementById('addViaUrlDialog--urlInput').setValue(editFileInfo.url);
						Element.getElementById('addViaUrlDialog--nameInput').setValue(editFileInfo.name);
						Element.getElementById('addViaUrlDialog--urlInputLabel').setRequired(false);
						Element.getElementById('addViaUrlDialog--urlInput').setVisible(true);

					}
					if (this.bRenameDocument && renameFileInfo) {
						Element.getElementById('addViaUrlDialog--addViaUrlDialog').setTitle("Rename");
						Element.getElementById('addViaUrlDialog--addViaUrlDialog').setContentHeight("7rem");
						Element.getElementById('addViaUrlDialog--addDocumentBtn').setText("Apply");
						Element.getElementById('addViaUrlDialog--nameInput').setValue(renameFileInfo.name);
						Element.getElementById('addViaUrlDialog--urlInput').setVisible(false);
					}
					oPopover.open();
				}.bind(this));
			} else {
				this._addViaUrlFragment.open();
			}
		},
		closeAddViaUrlFragment: function () {
			this.bEditDocument = false;
			this.oEditDocumentInfo = null;
			this.bRenameDocument = false;
			this.oRenameDocumentInfo = null;
			this._addViaUrlFragment.destroy();
			this._addViaUrlFragment = null;
		},
		onEditUrl: function(oEvent) {
			var oUploadSet = this.byId("UploadSetTable"),
			 oBidningContextObject = oUploadSet.getSelectedItems()[0].getBindingContext().getObject(),
			 sUrl = oBidningContextObject.url,
			 sName = oBidningContextObject.fileName;

			 this.bEditDocument = true;
			 this.oEditDocumentInfo = {
				url: sUrl,
				name: sName
			 };
			 this.openAddOrEditDialog();
		},
		onRenameDocument: function() {
			var oUploadSet = this.byId("UploadSetTable");
			// invoking public API on UploadSetTable
			oUploadSet.renameItem(oUploadSet.getSelectedItems()[0]);
		},
		onDocumentRenamedSuccess: function(oEvent) {
			// placeholder event handler to initiate a file name change that gets updated in the backend, and then the message is displayed in the application

			// Toast for sucessful rename.
			MessageToast.show("Document Renamed.", {duration: 2000});
		},
		openDocumentWithoutFileDialog: function() {

			var oUploadSetTableInstance = this.byId("UploadSetTable");

			let fnResolve, fnReject;
			const oPromise = new Promise((resolve, reject) => {
				fnResolve = resolve;
				fnReject = reject;
			});


			var oItem = oUploadSetTableInstance.uploadItemWithoutFile(oPromise);
			if (oItem) {
				fnResolve(true);
			} else {
				fnReject(true);
			}
		},
		onRemoveButtonFromMenuDocumentHandler: function(oEvent) {
			var oUploadSet = this.byId("UploadSetTable");
			var aSelectedItems = oUploadSet && oUploadSet.getSelectedItems ? oUploadSet.getSelectedItems() : [];
			if (aSelectedItems && aSelectedItems.length == 1) {
				this.removeItem(aSelectedItems[0]);
			}
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