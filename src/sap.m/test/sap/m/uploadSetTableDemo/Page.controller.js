sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"./mockserver",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/ui/core/Item",
	"./GraphUtil",
	"sap/base/util/deepExtend",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function(Element, Controller, JSONModel, UploadSetwithTable, UploadSetwithTableItem, MessageBox, Fragment, MockServer, MessageToast, Dialog, Button, mobileLibrary, Text, coreLibrary, CoreItem, graphUtil, deepExtend, Filter, FilterOperator, Sorter) {
	"use strict";

	return Controller.extend("sap.m.uploadSetTableDemo.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/uploadSetTableDemo/items.json");

			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.oUploadSetTable = this.byId("UploadSetWithTable");

			var oStatusData = this._getStatusEnum();
			this.getView().setModel(new JSONModel(oStatusData),"Status");

			this.documentTypes = this.getFileCategories();
			this.graphUtil = graphUtil;

			this._oFilesTobeuploaded = [];
			this._oFileRevisionMapping = {};
			this._oRevisedVersions = {};
			this.oItemsProcessor = [];

			this.loadOverflowMenu();
			this.oMockServer = new MockServer();
			this.oMockServer.oModel = oModel;
			this.getView().getModel().attachRequestCompleted(function(){
				this._initializeGraph();
			}.bind(this));
		},
		_initializeGraph: function(){
			var oModel = this.getView().getModel();
			var oData = oModel.getProperty("/items");
			oData.forEach(function(oVal){
				this._oFileRevisionMapping[oVal.id] = oVal.revision;
			}.bind(this));
			//For versioning of files we will connect them
			var aEdgeList = oData.map(function(oVal){
				return {
					node1: oVal.id,
					node2: oVal.parentId
				};
			}).filter(function(oVal){
				return oVal.node2 && oVal.node2 !== "";
			});
			this.adjList = this.graphUtil.generateGraph(aEdgeList,oData,"id");
		},
		loadOverflowMenu: function () {
			Fragment.load({
				id: this.getView().getId(),
				name: "sap.m.uploadSetTableDemo.menu",
				controller: this
			}).then(function(oMenu) {
				this._oMenuFragment = oMenu;
			}.bind(this));
		},

		_getStatusEnum: function(){
			return {
				"statuses": ["In work", "Approved", "Rejected"]
			 };
		},

		getIconSrc: function(mediaType, thumbnailUrl) {
			return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
		},
		// Table row selection handler
		onSelectionChange: function(oEvent) {
			var oTable = oEvent.getSource();
			var aSelectedItems = oTable.getSelectedItems();
			var oDownloadBtn = this.byId("downloadSelectedButton");
			var oChangeStatusBtn = this.byId("changeStatusButton");
			var oCreateRevisionBtn = this.byId("createRevisionButton");
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
				oChangeStatusBtn.setEnabled(true);
				oRenameBtn.setEnabled(true);
				oRemoveDocumentBtn.setEnabled(true);
				oCreateRevisionBtn.setEnabled(true);
			} else {
				oRenameBtn.setEnabled(false);
				oChangeStatusBtn.setEnabled(false);
				oEditUrlBtn.setEnabled(false);
				oRemoveDocumentBtn.setEnabled(false);
				oCreateRevisionBtn.setEnabled(false);
			}
		},
		// Download files handler
		onDownloadFiles: function(oEvent) {
			var oUploadSet = this.byId("UploadSetWithTable");
			const oItems = oUploadSet.getSelectedItems();

			oItems.forEach((oItem) => {oItem.download(true);});
		},
		onBeforeInitiatingItemUpload: function(oEvent) {
			// Event triggered before initiating each upload.
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
			var oUploadSet = this.byId("UploadSetWithTable");
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
			var sId = oItem.getBindingContext().getObject().id;
			//Removing all nodes to the connected component
			this.graphUtil.removeConnectedComponent(sId,this.adjList,{});
			delete this._oFileRevisionMapping[sId];
			delete this._oRevisedVersions[sId];


		},
		getFileCategories: function() {
			return [
				{categoryId: "Invoice", categoryText: "Invoice"},
				{categoryId: "Specification", categoryText: "Specification"},
				{categoryId: "Attachment", categoryText: "Attachment"},
				{categoryId: "Legal Document", categoryText: "Legal Document"}
			];
		},
		openFileUploadDialog: function() {
			var items = this.oItemsProcessor;

			if (items && items.length) {

				this._oFilesTobeuploaded = items;

				var oItemsMap = this._oFilesTobeuploaded.map(function(oItemProcessor) {

					return {
						fileName: oItemProcessor.item.getFileName(),
						fileCategorySelected: this.documentTypes[0].categoryId,
						itemInstance: oItemProcessor.item,
						fnResolve: oItemProcessor.resolve,
						fnReject: oItemProcessor.reject
					};
				}.bind(this));
				var oModel = new JSONModel({
					"selectedItems": oItemsMap,
					"types": this.documentTypes

				});
				if (!this._fileUploadFragment) {
					Fragment.load({
						name: "sap.m.uploadSetTableDemo.FileUpload",
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
			this.oItemsProcessor = [];
		},
		handleRemove: function(oEvent) {
			var oSource = oEvent.getSource();
			var oItemInstance = oSource.data().item;
			var fnReject = oSource.data().reject;
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

			// cancel the upload of the current item selected for upload.
			fnReject(oItemInstance);
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
			var oData = this._fileUploadFragment.getModel().getData();
			var oSelectedItems = oData.selectedItems;

			if (oSelectedItems && oSelectedItems.length) {
				oSelectedItems.forEach(function(oItem) {
					var oItemToUploadRef = oItem.itemInstance;
					// setting the header field for custom document type selected
					oItemToUploadRef.addHeaderField(new CoreItem({
						key: "documentType",
						text: oItem.fileCategorySelected
					}));
					oItem.fnResolve(oItemToUploadRef);
				});
			}
			this._fileUploadFragment.destroy();
			this._fileUploadFragment = null;
			this._oFilesTobeuploaded = [];
			this.oItemsProcessor = [];
		},
		uploadFilesHandler: function() {
			var oUploadSetTableInstance = this.byId("UploadSetWithTable");

			oUploadSetTableInstance.fileSelectionHandler();
		},
		itemValidationCallback: function(oItemInfo) {
			const {oItem, iTotalItemsForUpload} = oItemInfo;
			var oUploadSetTableInstance = this.byId("UploadSetWithTable");
			var oSelectedItems = oUploadSetTableInstance.getSelectedItems();
			var oSelectedItemForUpdate = oSelectedItems.length === 1 ? oSelectedItems[0] : null;
			if (oSelectedItemForUpdate && oSelectedItemForUpdate.getFileName() === "-" && iTotalItemsForUpload === 1) {
				return new Promise((resolve) => {
					if (oSelectedItemForUpdate) {
						var oContext = oSelectedItemForUpdate.getBindingContext();
						var data = oContext && oContext.getObject ? oContext.getObject() : {};

						/* Demonstration use case of Setting the header field if required to be passed in API request headers to
			   			inform backend with document type captured through user input */
						oItem.addHeaderField(new CoreItem(
							{
								key: "existingDocumentID",
								text: data ? data.id : ""
							}
						));
					}
					resolve(oItem);
				});
			} else {
				var oItemPromise = new Promise((resolve, reject) => {
					this.oItemsProcessor.push({
						item: oItem,
						resolve: resolve,
						reject: reject
					});
				});
				if (iTotalItemsForUpload === 1) {
					this.openFileUploadDialog();
				} else if (iTotalItemsForUpload === this.oItemsProcessor.length) {
					this.openFileUploadDialog();
				}
				return oItemPromise;
			}
		},
		_openChangeStatusDialog: function(oModel,sModelName){
			if (!this._oChangeStatusDialog) {
				Fragment.load({
					name: "sap.m.uploadSetTableDemo.ChangeStatus",
					id: this.getView().getId() + "-change-status",
					controller: this
				})
					.then(function(oPopover) {
						this._oChangeStatusDialog = oPopover;
						this.getView().addDependent(oPopover);
						oPopover.setModel(oModel,sModelName);
						oPopover.open();
					}.bind(this));
			} else {
				this._oChangeStatusDialog.setModel(oModel,sModelName);
				this._oChangeStatusDialog.open();
			}
		},
		onChangeStatus: function() {
			// Change status handling code
			var aSelectedItems = this.oUploadSetTable.getSelectedItems();
			if (!aSelectedItems || aSelectedItems.length !== 1){
				return;
			}
			var sStatusSelectedItem = aSelectedItems[0].getBindingContext().getObject().status;
			var oModel = this.getView().getModel("Status");
			var aStatuses = oModel.getProperty("/statuses");

			var aStatusData = aStatuses.map(function(oVal){
				if (oVal === sStatusSelectedItem){
					return {
						status: oVal,
						selected: true,
						text: ""
					};
				}
				return {
					status: oVal,
					selected: false,
					text: "Document will be locked"
				};
			});

			var oJSONModel = new JSONModel(aStatusData);
			this._openChangeStatusDialog(oJSONModel,"Status");

		},
		closeChangeStatusFragment: function(){
			this._oChangeStatusDialog.destroy();
			this._oChangeStatusDialog = null;
		},
		sortTable: function(oDialogTable){
			oDialogTable.getBinding("items").sort(new Sorter("revision",false,false,function(a,b){
				var oValA = parseInt(a);
				var oValB = parseInt(b);
				if (oValA < oValB) {
					return -1;
				  } else if (oValA > oValB) {
					return 1;
				  } else {
					return 0;
				  }
			}),new Sorter("creationTimeStamp"));
		},
		_openRevisionDialog:function(oModel,oCustomData){
			if (!this._oChangeStatusDialog) {
				Fragment.load({
					name: "sap.m.uploadSetTableDemo.FileRevision",
					id: this.getView().getId() + "-revision",
					controller: this
				})
					.then(function(oPopover) {
						this._oRevisionDialog = oPopover;
						this.getView().addDependent(oPopover);
						oPopover.setModel(oModel);
						oPopover.open();
						oPopover.addCustomData(oCustomData);
						var oDialogTable = sap.ui.core.Fragment.byId(this.getView().getId() + "-revision", "RevisionTable");
						this.sortTable(oDialogTable);


					}.bind(this));
			} else {
				this._oRevisionDialog.setModel(oModel);
				this._oRevisionDialog.open();
				this._oRevisionDialog.add(oCustomData);
				var oDialogTable = sap.ui.core.Fragment.byId(this.getView().getId() + "-revision", "RevisionTable");
				this.sortTable(oDialogTable);
			}
		},
		closeRevisionDialog: function(){
			this._oRevisionDialog.destroy();
			this._oRevisionDialog = null;
		},
		replaceVersionHandler: function(oEvent){
			var sId = this._oRevisionDialog.data("itemId");
			var oTableItem = this.oUploadSetTable.getItems().filter(function(oVal){
				return oVal.getBindingContext().getObject().id === sId;
			});

			this._oRevisedVersions[sId] = oTableItem[0].getBindingContext().getObject();
			var oModel = this.getView().getModel();
			var sPath = oTableItem[0].getBindingContext().sPath;
			if (sPath.split("/")[2]) {
				var index = sPath.split("/")[2];
				var data = oModel.getProperty("/items");
				var oDialogTable = sap.ui.core.Fragment.byId(this.getView().getId() + "-revision", "RevisionTable");
				data[index] = oDialogTable.getSelectedItem().getBindingContext().getObject();
				oModel.refresh(true);
			}
			this.closeRevisionDialog();
			MessageToast.show("Version Replaced");

		},
		onAddVersion: function(){
			var oDialogTable = sap.ui.core.Fragment.byId(this.getView().getId() + "-revision", "RevisionTable");
			var oSelectedItem = oDialogTable.getSelectedItem();
			if (oSelectedItem){
				var oData = deepExtend({},oSelectedItem.getBindingContext().getObject());
				var iRevision = parseInt(oData.revision) + 1;
				var sId = oData.id;
				oData.isActive = false;
				oData.id = (parseInt(oData.id) + parseInt(Math.random() * 100000)).toString();
				oData.status = "In work";
				oData.isLatestVersion = true;
				oData.revision = iRevision <= 9 ? "0".concat(iRevision) : iRevision.toString();
				oData.creationTimeStamp = Date.now();
				oData.isCurrent = false;
				this.adjList[oData.id] = [];
				this._oFileRevisionMapping[oData.id] = oData.revision;
				this._oRevisedVersions[oData.id] = oData;
				oDialogTable.getModel().setProperty(oSelectedItem.getBindingContext().getPath() + "/isLatestVersion",false);
				this.graphUtil.addEdge(this.adjList,oData.id,sId);
				oDialogTable.getModel().getProperty("/").push(oData);
				oDialogTable.getModel().refresh();
			}
		},
		onCreateRevision: function() {
			// Revision Creation handling code
			//We have to add a new item with revised version
			var aSelectedItems = this.oUploadSetTable.getSelectedItems();
			if (aSelectedItems && aSelectedItems.length){
				var oModel = this.getView().getModel();
				aSelectedItems.forEach(function(oItem){
					var sPath = oItem.getBindingContext().sPath;
					var oData = deepExtend({},oModel.getProperty(sPath));
					var iRevision = parseInt(oData.revision) + 1;
					var sId = oData.id;
					oData.isActive = false;
					oData.id = (parseInt(oData.id) + parseInt(Math.random() * 100000)).toString();
					oData.status = "In work";
					oData.isLatestVersion = true;
					oData.revision = iRevision <= 9 ? "0".concat(iRevision) : iRevision.toString();
					oData.creationTimeStamp = Date.now();
					// oModel.getData().items.push(oData);
					// oModel.refresh(true);
					this.adjList[oData.id] = [];
					this._oFileRevisionMapping[oData.id] = oData.revision;
					this._oRevisedVersions[oData.id] = oData;
					oModel.setProperty(sPath + "/isLatestVersion",false);
					this.graphUtil.addEdge(this.adjList,oData.id,sId);
				}.bind(this));
			}
			MessageToast.show("Revision Created");
		},
		getFileVersion: function(oEvent){
			var oCurrentItem = oEvent.getSource().getParent().getParent();
			if (oCurrentItem){
				var sId = oCurrentItem.getBindingContext().getObject().id;
				var aConnectedComponent = [];
				var oConnectedIds = {};
				//Getting all the subversions
				this.graphUtil.getConditionalNeigbours(sId,this.adjList,{},aConnectedComponent,function(source,dest){
					return parseInt(this._oFileRevisionMapping[source]) < parseInt(this._oFileRevisionMapping[dest]);
				}.bind(this));
				//Getting parent versions
				this.graphUtil.getConditionalNeigbours(sId,this.adjList,{},aConnectedComponent,function(source,dest){
					return parseInt(this._oFileRevisionMapping[source]) > parseInt(this._oFileRevisionMapping[dest]);
				}.bind(this));
				aConnectedComponent.forEach(function(oVal,iIndex){
					oConnectedIds[oVal] = iIndex;
				});
				var oData = this.getView().getModel().getProperty("/items");
				//Adding items from the table for the version
				//Setting deep copy
				var aJsonData = oData.filter(function(oVal){
					return oConnectedIds[oVal.id];
				}).map(function(oVal){
					return deepExtend({},oVal);
				});

				aJsonData[0].isCurrent = true;
				aJsonData[0].isSelected = true;
				aJsonData[0].creationTimeStamp = Date.now();
				delete this._oRevisedVersions[aJsonData[0].id];
				var oCustomData = new sap.ui.core.CustomData({
					key: "itemId",
					value: aJsonData[0].id
				});
				//Other versions of the file
				for (var sKey in oConnectedIds){
					if (this._oRevisedVersions[sKey]){
						this._oRevisedVersions[sKey].isCurrent = false;
						this._oRevisedVersions[sKey].isSelected = false;
						aJsonData.push(this._oRevisedVersions[sKey]);
					}
				}
				var oJsonModel = new JSONModel(aJsonData);
				this._openRevisionDialog(oJsonModel,oCustomData);
			}
		},
		handleChangeStatusConfirm: function(oEvent){
			var oModel = this.getView().getModel();
			var aSelectedItems = this.oUploadSetTable.getSelectedItems();
			if (!aSelectedItems || aSelectedItems.length !== 1){
				return;
			}
			var sSelectedStatus = this._oChangeStatusDialog.getModel("Status").getProperty("/").filter(function(oVal){
				return oVal.selected;
			})[0].status;
			//Modifying the status of the selected item
			oModel.setProperty(aSelectedItems[0].getBindingContext().getPath() + "/status",sSelectedStatus);
			//Closing the Status fragment
			this.closeChangeStatusFragment();
		},
		getFileSizeWithUnits: function(iFileSize) {
			return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
		},
		onOverflowPress: function(oEvent) {
			var oButton = oEvent.getSource();
			this._oMenuFragment.openBy(oButton);
		},
		openPreview: function(oEvent) {
			var clickedControl = oEvent.getSource();
			while (clickedControl && !(clickedControl instanceof UploadSetwithTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			clickedControl.openPreview();
		},
		onViewDetails: function(oEvent) {
			var clickedControl = oEvent.getSource();
			var oListItem = null;

			// Traverse up the control hierarchy to find the ColumnListItem
			while (clickedControl && !(clickedControl instanceof UploadSetwithTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			if (clickedControl instanceof UploadSetwithTableItem) {
				oListItem = clickedControl;
				Fragment.load({
					name: "sap.m.uploadSetTableDemo.FileDetails",
					id: this.getView().getId() + "-file-details-dialog",
					controller: this
				})
					.then(function(oPopover) {
						this._fileDetailsFragment = oPopover;
						this.getView().addDependent(oPopover);
						// oPopover.setModel(oModel);
						oPopover.setBindingContext(oListItem.getBindingContext());
						oPopover.open();
					}.bind(this));
			}
		},
		onViewDetailsClose: function() {
			this._fileDetailsFragment.destroy();
			this._fileUploadFragment = null;
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
			domRefDocType = Element.getElementById('addViaUrlDialog--docTypeCombobox'),
			sUrl = domRefUrl.getValue(),
			sName = domRefName.getValue(),
			sDocType = domRefDocType.getValue(),
			bFormHasError = !this._isValidName();

			if (!sUrl || !this._isValidUrl(sUrl)) {
				domRefUrl.setValueState('Error');
				domRefUrl.setValueStateText('Enter Valid URL');
				bFormHasError = true;
			} else {
				domRefUrl.setValueState('None');
			}
			if (!sDocType) {
				domRefDocType.setValueState('Error');
				domRefDocType.setValueStateText('Invalid option');
				bFormHasError = true;
			} else {
				domRefDocType.setValueState('None');
			}

			return {
				error: bFormHasError,
				name: sName,
				url: sUrl,
				docType: sDocType
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
						sDocType = oValidateObject.docType,
						oUploadSetTable = this.byId("UploadSetWithTable");
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
							url:  sUrl,
							documentType:  sDocType
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
			sDocType = oValidateObject.docType,
			bHasError = oValidateObject.error;
			if (!bHasError) {
				setTimeout(function(){

					var oUploadSetTableInstance = this.byId("UploadSetWithTable");

					let fnResolve, fnReject;
					var oPromise = new Promise(function(resolve, reject) {
						fnResolve = resolve;
						fnReject = reject;
					});
					var oItem = oUploadSetTableInstance.uploadItemViaUrl(sName, sUrl, oPromise);
					if (oItem) {

						/* Demonstration use case of Setting the header field if required to be passed in API request headers to
						inform backend with the file url and document type captured through user input */
						oItem.addHeaderField(new CoreItem({
							key: 'documentUrl',
							text: sUrl
						}));
						oItem.addHeaderField(new CoreItem({
							key: 'documentType',
							text: sDocType
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
					name: "sap.m.uploadSetTableDemo.AddViaUrl",
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
						Element.getElementById('addViaUrlDialog--docTypeCombobox').setValue(editFileInfo.docType);
						Element.getElementById('addViaUrlDialog--urlInputLabel').setRequired(false);
						Element.getElementById('addViaUrlDialog--docTypeComboboxLabel').setRequired(false);
						Element.getElementById('addViaUrlDialog--urlInput').setVisible(true);
						Element.getElementById('addViaUrlDialog--docTypeCombobox').setVisible(true);

					}
					if (this.bRenameDocument && renameFileInfo) {
						Element.getElementById('addViaUrlDialog--addViaUrlDialog').setTitle("Rename");
						Element.getElementById('addViaUrlDialog--addViaUrlDialog').setContentHeight("7rem");
						Element.getElementById('addViaUrlDialog--addDocumentBtn').setText("Apply");
						Element.getElementById('addViaUrlDialog--nameInput').setValue(renameFileInfo.name);
						Element.getElementById('addViaUrlDialog--urlInput').setVisible(false);
						Element.getElementById('addViaUrlDialog--docTypeCombobox').setVisible(false);
					}
					oPopover.open();
				}.bind(this));
			} else {
				this._addViaUrlFragment.open();
			}
		},
		onFilterFiles: function(oEvent){
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("revision", FilterOperator.Contains, sQuery));
			}
			// filter binding
			var oTable = sap.ui.core.Fragment.byId(this.getView().getId() + "-revision", "RevisionTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilter);
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
			var oUploadSet = this.byId("UploadSetWithTable"),
			 oBidningContextObject = oUploadSet.getSelectedItems()[0].getBindingContext().getObject(),
			 sUrl = oBidningContextObject.url,
			 sName = oBidningContextObject.fileName,
			 sDocType = oBidningContextObject.documentType;

			 this.bEditDocument = true;
			 this.oEditDocumentInfo = {
				url: sUrl,
				name: sName,
				docType: sDocType
			 };
			 this.openAddOrEditDialog();
		},
		onRenameDocument: function() {
			var oUploadSet = this.byId("UploadSetWithTable");
			// invoking public API on UploadSetTable
			oUploadSet.renameItem(oUploadSet.getSelectedItems()[0]);
		},
		onDocumentRenamedSuccess: function(oEvent) {
			// placeholder event handler to initiate a file name change that gets updated in the backend, and then the message is displayed in the application

			// Toast for sucessful rename.
			MessageToast.show("Document Renamed.", {duration: 2000});
		},
		addEmptyDocument: function() {
			var oUploadSetTableInstance = this.byId("UploadSetWithTable");
			var oData = this._documentWithoutFileFragment.getModel().getData();

			let fnResolve, fnReject;
			const oPromise = new Promise((resolve, reject) => {
				fnResolve = resolve;
				fnReject = reject;
			});

			/* Demonstration use case of Setting the header field if required to be passed in API request headers to
			   inform backend with document type captured through user input */
			var oItem = oUploadSetTableInstance.uploadItemWithoutFile(oPromise);
			if (oItem) {
				oItem.addHeaderField(new CoreItem({
					key: "documentType",
					text: oData.fileCategorySelected
				}));
				fnResolve(true);
			} else {
				fnReject(true);
			}

			this.closeDocumentWithoutFileUplaodFragment();
		},
		openDocumentWithoutFileDialog: function() {

			var oModel = new JSONModel({
				"types": this.documentTypes,
				"fileCategorySelected": this.documentTypes[0].categoryId
			});
			if (!this._documentWithoutFileFragment) {
				Fragment.load({
					name: "sap.m.uploadSetTableDemo.DocumentWithoutFileDialog",
					id: this.getView().getId() + "-document-without-file-dialog",
					controller: this
				})
					.then(function(oPopover) {
						this._documentWithoutFileFragment = oPopover;
						this.getView().addDependent(oPopover);
						oPopover.setModel(oModel);
						oPopover.open();
					}.bind(this));
			} else {
				this._documentWithoutFileFragment.setModel(oModel);
				this._documentWithoutFileFragment.open();
			}
		},
		closeDocumentWithoutFileUplaodFragment: function() {
			this._documentWithoutFileFragment.destroy();
			this._documentWithoutFileFragment = null;
			this._oFilesTobeuploaded = [];
		},
		onRemoveButtonFromMenuDocumentHandler: function(oEvent) {
			var oUploadSet = this.byId("UploadSetWithTable");
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