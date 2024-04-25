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

	return Controller.extend("responsive.table.sample.controller.Page", {
		onInit: function () {
			this.documentTypes = this.getFileCategories();
			this.oMockServer = new MockServer();
			this.oMockServer.oModel = this.byId("table-uploadSet").getModel("documents");
		},
		onBeforeUploadStarts: function() {
			// This code block is only for demonstration purpose to simulate XHR requests, hence starting the mockserver.
			this.oMockServer.start();
		},
		onPluginActivated: function(oEvent) {
			this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
		},
		getIconSrc: function(mediaType, thumbnailUrl) {
			return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
		},
		// Table row selection handler
		onSelectionChange: function(oEvent) {
			const oTable = oEvent.getSource();
			const aSelectedItems = oTable?.getSelectedContexts();
			const oDownloadBtn = this.byId("downloadSelectedButton");
			const oEditUrlBtn = this.byId("editUrlButton");
			const oRenameBtn = this.byId("renameButton");
			const oRemoveDocumentBtn = this.byId("removeDocumentButton");

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
			const oContexts = this.byId("table-uploadSet").getSelectedContexts();
			if (oContexts && oContexts.length) {
				oContexts.forEach((oContext) => this.oUploadPluginInstance.download(oContext, true));
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
			if (oBindingContext && this.oUploadPluginInstance) {
				this.oUploadPluginInstance.openFilePreview(oBindingContext);
			}
		},
		onRenameDocument: function() {
			const oUploadSet = this.byId("table-uploadSet");
			const aSelectedContexts = oUploadSet.getSelectedContexts();
			if (aSelectedContexts?.length === 1) {
				// invoking public API on UploadSetTable
				this.oUploadPluginInstance.renameItem(aSelectedContexts[0]);
			}
		},
		onDocumentRenamedSuccess: function(oEvent) {
			// placeholder event handler to initiate a file name change that gets updated in the backend, and then the message is displayed in the application

			// Toast for sucessful rename.
			MessageToast.show("Document Renamed.", {duration: 2000});
		},
		openAddOrEditDialog: function () {
			if (!this._addViaUrlFragment){
				Fragment.load({
					name: "sap.m.sample.UploadSetwithTablePlugin.ResponsiveTableSimple.view.fragment.AddViaUrl",
					id: "addViaUrlDialog",
					controller: this
				})
				.then(function (oPopover) {
					this._addViaUrlFragment = oPopover;
					this.getView().addDependent(oPopover);
					// if edit is clicked
					const editFileInfo = this.oEditDocumentInfo;
					const renameFileInfo = this.oRenameDocumentInfo;
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
			const oTable = this.byId("table-uploadSet"),
			 oBidningContextObject = oTable.getSelectedContexts()[0].getObject(),
			 sUrl = oBidningContextObject.url,
			 sName = oBidningContextObject.fileName;

			 this.bEditDocument = true;
			 this.oEditDocumentInfo = {
				url: sUrl,
				name: sName
			 };
			 this.openAddOrEditDialog();
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
			const oValidateObject = this._validateAddOrEditUrlDialog(),
			sName = oValidateObject.name,
			sUrl = oValidateObject.url,
			bHasError = oValidateObject.error;
			if (!bHasError) {
				setTimeout(function(){

					let fnResolve, fnReject;
					const oPromise = new Promise(function(resolve, reject) {
						fnResolve = resolve;
						fnReject = reject;
					});
					const oItem = this.oUploadPluginInstance.uploadItemViaUrl(sName, sUrl, oPromise);
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
		_isValidUrl: function (sUrl) {
			const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			return regexp.test(sUrl);
		},
		_isValidName: function () {
			const domRefName = Element.getElementById('addViaUrlDialog--nameInput');
			const sName = domRefName.getValue();
			let bHasError = false;
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
			const domRefUrl = Element.getElementById('addViaUrlDialog--urlInput'),
			domRefName = Element.getElementById('addViaUrlDialog--nameInput'),
			sUrl = domRefUrl.getValue(),
			sName = domRefName.getValue();
			let bFormHasError = !this._isValidName();

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
			const DialogType = mobileLibrary.DialogType;
			const ValueState = coreLibrary.ValueState;
			const ButtonType = mobileLibrary.ButtonType;
			this.oWarningMessageDialog = new Dialog({
				type: DialogType.Message,
				title: "Warning",
				state: ValueState.Warning,
				content: new Text({ text: "You have made changes to this object. What would you like to do?" }),
				buttons: [ new Button({
					type: ButtonType.Emphasized,
					text: "Save",
					press: [function () {
						const oValidateObject = this._validateAddOrEditUrlDialog(),
						sName = oValidateObject.name,
						sUrl = oValidateObject.url,
						oTable = this.byId("table-uploadSet"),
						oBidningContextObject = oTable.getSelectedContexts()[0].getObject();
						const oModel = this.getView().getModel("documents");
						const oData = oModel.getProperty("/items");
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