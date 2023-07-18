sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/UploadSetTable",
	"sap/m/upload/UploadSetTableItem",
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
	"sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/model/Sorter",
	"sap/base/util/deepExtend",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, UploadSetTable, UploadSetTableItem, MessageBox, Fragment, MockServer, MessageToast, Dialog, Button, mobileLibrary, Text, coreLibrary, CoreItem, graphUtil, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter, deepExtend, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.m.uploadSetTableDemo.Page", {
		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/uploadSetTableDemo/items.json");

			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.oUploadSetTable = this.byId("UploadSetTable");

			var oStatusData = this._getStatusEnum();
			this.getView().setModel(new JSONModel(oStatusData),"Status");

			this.documentTypes = this.getFileCategories();
			this.graphUtil = graphUtil;

			this._oFilesTobeuploaded = [];
			this._oFileRevisionMapping = {};
			this._oRevisedVersions = {};

			this.loadOverflowMenu();
			this.oMockServer = new MockServer();
			this.oMockServer.oModel = oModel;
			this._registerForPersonalization();
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
		_registerForPersonalization:function() {
            var oUploadSetTable = this.oUploadSetTable;
            var aMetaData = [{key: "fileName",label: "File Name",path:"fileName", sortable: true, groupable: false},
                             {key: "id", label: "ID",path: "id", sortable: false, groupable: false},
                             {key: "revision", label: "Revision", path: "revision", sortable: true, groupable: true},
                             {key: "status", label: "Status", path: "status", sortable: true, groupable: true},
                             {key: "fileSize", label: "File Size", path: "fileSize", sortable:false, groupable:false},
                             {key: "lastModified", label: "Last Modified", path: "lastModifiedBy", sortable:true, groupable: true},
                             {key: "actionButton", label: "Action Button", sortable: false,groupable: false}
							 ];

			this.oMetadataHelper = new MetadataHelper(aMetaData);
            //Register for p13n
            //Singleton instance of Engine
            Engine.getInstance().register(oUploadSetTable, {
                helper: this.oMetadataHelper,
                controller: {
                    Columns: new SelectionController({
                        targetAggregation: "columns",
                        control: oUploadSetTable
                    }),
                    Sorter: new SortController({
                        control: oUploadSetTable
                    }),
                    Groups: new GroupController({
                        control: oUploadSetTable
                    })
                }
            });
            //attaching state change for working on new states
            Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));

        },
		_getStatusEnum: function(){
			return {
				"statuses": ["In work", "Approved", "Rejected"]
			 };
		},
        onPersoButtonPressed: function (oEvent) {
            // personalization code

            //var oUploadSetTable = this.oUploadSetTable;
            //Singleton instance of Engine class
            // Engine.getInstance().show(oUploadSetTable, ["Columns", "Sorter", "Groups"],{
            //     contentHeight: "35rem",
            //     contentWidth: "32rem",
            //     source: oUploadSetTable
            // });
        },

        handleStateChange: function(oEvent) {
            var oState = oEvent.getParameter("state");
            //If no state is present
            if (!oState){
                return;
            }

            var aSorter = [];

            oState.Sorter.forEach(function(oSorter) {
                if (typeof oSorter !== "object") {
                    return;
                }
                aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
            }.bind(this));

            oState.Groups.forEach(function(oGroup) {
				if (typeof oGroup !== "object") {
                    return;
                }
                var oExistingSorter = aSorter.find(function(oSorter) {
                    return oSorter.sPath === oGroup.key;
                });
                if (oExistingSorter){
                    oExistingSorter.vGroup = true;
                } else {
                    aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oGroup.key).path, false, true));
                }
            }.bind(this));
            //Setting visibility of all cols as false
            this.oUploadSetTable.getColumns().forEach(function(oCol) {
                oCol.setVisible(false);
            });

            oState.Columns.forEach(function(oProp, iIndex) {
                if (oProp && oProp.key) {
                    var oCol = this.byId(oProp.key);
                    //Setting visibilty of column to true based on personalization
                    oCol.setVisible(true);
					//Setting ordering of column based on personalization
                    oCol.setOrder(iIndex);
                }
            }.bind(this));
			//Sorting/Grouping the items based on the condition
            this.oUploadSetTable.getBinding("items").sort(aSorter);
            this.oUploadSetTable.invalidate();
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
			var oUploadSet = this.byId("UploadSetTable");
			oUploadSet.downloadItems(oUploadSet.getSelectedItems());
		},
		onBeforeInitiatingItemUpload: function(oEvent) {
			var oUploadSetTableInstance = this.byId("UploadSetTable");
			var oItem = oEvent.getParameter("item");
			var aSelectedItems = oUploadSetTableInstance.getSelectedItems();
			var bEmptyFileSelected = aSelectedItems && aSelectedItems.length === 1 && aSelectedItems[0].getFileName() == "-" ? true : false;
			if (bEmptyFileSelected) {
				var oContext = aSelectedItems[0].getBindingContext();
				var data = oContext && oContext.getObject ? oContext.getObject() : {};
				oItem.addHeaderField(new CoreItem(
					{
						key: "existingDocumentID",
						text: data ? data.id : ""
					}
				));
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
					// setting the header field for custom document type selected
					oItemToUploadRef.addHeaderField(new CoreItem({
						key: "documentType",
						text: oItem.fileCategorySelected
					}));
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

			var aSelectedItems = oUploadSetTableInstance.getSelectedItems();
			var oSelectedItem = aSelectedItems && aSelectedItems.length == 1 ? aSelectedItems[0] : null;
			var bEmptyFileSelected = oSelectedItem && oSelectedItem.getFileName && oSelectedItem.getFileName() === "-";

			if (bEmptyFileSelected) {
				oUploadSetTableInstance.fileSelectionHandler(this.updateEmptyDocument.bind(this));
			} else {
				oUploadSetTableInstance.fileSelectionHandler(this.selectedFilesFromHandler.bind(this));
			}
		},
		selectedFilesFromHandler: function(oItems) {
			this.openFileUploadDialog(oItems);
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
		onOverflowPress: function(oEvent) {
			var oButton = oEvent.getSource();
			this._oMenuFragment.openBy(oButton);
		},
		openPreview: function(oEvent) {
			var clickedControl = oEvent.getSource();
			while (clickedControl && !(clickedControl instanceof UploadSetTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			clickedControl.openPreview();
		},
		onViewDetails: function(oEvent) {
			var clickedControl = oEvent.getSource();
			var oListItem = null;

			// Traverse up the control hierarchy to find the ColumnListItem
			while (clickedControl && !(clickedControl instanceof UploadSetTableItem)) {
				clickedControl = clickedControl.getParent();
			}
			if (clickedControl instanceof UploadSetTableItem) {
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
			var domRefName = sap.ui.getCore().byId('addViaUrlDialog--nameInput'),
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
			var domRefUrl = sap.ui.getCore().byId('addViaUrlDialog--urlInput'),
			domRefName = sap.ui.getCore().byId('addViaUrlDialog--nameInput'),
			domRefDocType = sap.ui.getCore().byId('addViaUrlDialog--docTypeCombobox'),
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
					var oUploadSetTableInstance = this.byId("UploadSetTable");
					oUploadSetTableInstance.uploadItemViaUrl(sName, [ new CoreItem({
						key: 'documentUrl',
						text: sUrl
					}), new CoreItem({
						key: 'documentType',
						text: sDocType
					})]);
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
						sap.ui.getCore().byId('addViaUrlDialog--addViaUrlDialog').setTitle("Edit URL");
						sap.ui.getCore().byId('addViaUrlDialog--addDocumentBtn').setText("Apply");
						sap.ui.getCore().byId('addViaUrlDialog--urlInput').setValue(editFileInfo.url);
						sap.ui.getCore().byId('addViaUrlDialog--nameInput').setValue(editFileInfo.name);
						sap.ui.getCore().byId('addViaUrlDialog--docTypeCombobox').setValue(editFileInfo.docType);
						sap.ui.getCore().byId('addViaUrlDialog--urlInputLabel').setRequired(false);
						sap.ui.getCore().byId('addViaUrlDialog--docTypeComboboxLabel').setRequired(false);
						sap.ui.getCore().byId('addViaUrlDialog--urlInput').setVisible(true);
						sap.ui.getCore().byId('addViaUrlDialog--docTypeCombobox').setVisible(true);

					}
					if (this.bRenameDocument && renameFileInfo) {
						sap.ui.getCore().byId('addViaUrlDialog--addViaUrlDialog').setTitle("Rename");
						sap.ui.getCore().byId('addViaUrlDialog--addViaUrlDialog').setContentHeight("7rem");
						sap.ui.getCore().byId('addViaUrlDialog--addDocumentBtn').setText("Apply");
						sap.ui.getCore().byId('addViaUrlDialog--nameInput').setValue(renameFileInfo.name);
						sap.ui.getCore().byId('addViaUrlDialog--urlInput').setVisible(false);
						sap.ui.getCore().byId('addViaUrlDialog--docTypeCombobox').setVisible(false);
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
			var oUploadSet = this.byId("UploadSetTable"),
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
			var oUploadSet = this.byId("UploadSetTable"),
			 oBidningContextObject = oUploadSet.getSelectedItems()[0].getBindingContext().getObject(),
			 sName = oBidningContextObject.fileName;

			 this.bRenameDocument = true;
			 this.oRenameDocumentInfo = {
				name: sName
			 };
			 this.openAddOrEditDialog();
		},
		updateEmptyDocument: function(oItem) {
			var aSelectedItems = oItem.selectedItems;
			var oUploadSetTableInstance = this.byId("UploadSetTable");
			if (aSelectedItems && aSelectedItems.length === 1) {
				var aFileToBeUploaded = [aSelectedItems[0]];
				oUploadSetTableInstance.uploadItems(aFileToBeUploaded);
			}
		},
		addEmptyDocument: function() {
			var oUploadSetTableInstance = this.byId("UploadSetTable");
			var oData = this._documentWithoutFileFragment.getModel().getData();

			var oHeader = new CoreItem({
				key: "documentType",
				text: oData.fileCategorySelected
			});

			// Invoking public API which creates and uploads document without file and passing optonal additionalparams to be set for the item
			oUploadSetTableInstance.uploadItemWithoutFile([oHeader]);
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
		isSameFileNameCheckSectionVisible: function(sSameFileNameAllowed, aItems) {
			if (sSameFileNameAllowed && aItems &&  aItems.length) {
				return true;
			}
			return false;
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
		}
	});
});