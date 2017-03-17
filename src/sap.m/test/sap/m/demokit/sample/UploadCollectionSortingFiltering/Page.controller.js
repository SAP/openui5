sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/UploadCollectionParameter',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		'sap/ui/model/json/JSONModel',
		'sap/m/GroupHeaderListItem'
	], function(jQuery, MessageToast, UploadCollectionParameter, Fragment, Controller, Filter, Sorter, JSONModel, GroupHeaderListItem) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.UploadCollectionSortingFiltering.Page", {

		_oDialog: null,

		onInit: function () {
			var sPath,
				oModel,
				aDataCB,
				oModelCB,
				oSelect,
				oFileTypesModel,
				mFileTypesData,
				oFileTypesBox,
				oUploadCollection;

			// set mock data
			sPath = jQuery.sap.getModulePath("sap.m.sample.UploadCollectionSortingFiltering", "/uploadCollection.json");
			oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);

			aDataCB = {
				"items" : [{
					"key" : "All",
					"text" : "sap.m.ListSeparators.All"
				}, {
					"key" : "None",
					"text" : "sap.m.ListSeparators.None"
				}],
				"selectedKey" : "All"
			};

			oModelCB = new JSONModel();
			oModelCB.setData(aDataCB);

			oSelect = this.getView().byId("tbSelect");
			oSelect.setModel(oModelCB);

			oFileTypesModel = new JSONModel();

			mFileTypesData = {
				"items": [
					{
						"key": "jpg",
						"text": "jpg"
					},
					{
						"key": "txt",
						"text": "txt"
					},
					{
						"key": "ppt",
						"text": "ppt"
					},
					{
						"key": "doc",
						"text": "doc"
					},
					{
						"key": "xls",
						"text": "xls"
					},
					{
						"key": "pdf",
						"text": "pdf"
					},
					{
						"key": "png",
						"text": "png"
					}
				],
				"selected" : ["jpg", "txt", "ppt", "doc", "xls", "pdf", "png"]
			};

			oFileTypesModel.setData(mFileTypesData);
			this.getView().setModel(oFileTypesModel, "fileTypes");

			oFileTypesBox = this.getView().byId("fileTypesBox");
			oFileTypesBox.setSelectedItems(oFileTypesBox.getItems());

			oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setFileType(oFileTypesBox.getSelectedKeys());

			// Sets the text to the label
			oUploadCollection.addEventDelegate({
				onBeforeRendering : function () {
					this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});

			this.mGroupFunctions = {
				uploadedBy: function(oContext) {
					return {
						key: oContext.getProperty("attributes")[0].text, //'uploadedBy' value as attribute
						text: "Uploaded By"
					};
				},
				mimeType: function(oContext) {
					return {
						key: oContext.getProperty("mimeType"), //'mimeType' value as property
						text: "Mime Type"
					};
				},
				version: function(oContext) {
					return {
						key: oContext.getProperty("attributes")[3].text, //'version' value as attribute
						text: "Version"
					};
				}
			};
		},

		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}
		},

		onViewSettingsClearFilters : function (oEvent) {
			this.onExit();
			//sort and filter items are empty
			this.onViewSettingsConfirm(oEvent);
		},

		formatAttribute : function (sValue, sType) {
			if (sType === "size") {
				jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
				return sap.ui.core.format.FileSizeFormat.getInstance({
					binaryFilesize : false,
					maxFractionDigits : 1,
					maxIntegerDigits : 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onInfoToolbarPressed : function (oEvent) {
			if (oEvent.getParameters().srcControl === this.getView().byId("icClearFilters")) {
				this.onViewSettingsClearFilters(oEvent);
			} else {
				this.onViewSettingsPressed(oEvent);
			}
		},

		onViewSettingsPressed : function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollectionSortingFiltering.Dialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		onViewSettingsConfirm : function (oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			var oInfoToolbar = oUploadCollection.getInfoToolbar();
			var oBindingItems = oUploadCollection.getBinding("items");
			var mParams = oEvent.getParameters();
			var aSorters = [], sPath, vGroup, bDescending;

			// apply grouping
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			// apply sorting
			if (mParams.sortItem) {
				sPath = mParams.sortItem.getKey();
				bDescending = mParams.sortDescending;
				aSorters.push(new Sorter(sPath, bDescending));
			}
			oBindingItems.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = aSplit[3];
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBindingItems.filter(aFilters);

			// update filter bar
			oInfoToolbar.setVisible(aFilters.length > 0);
			var sFilterString = "";
			if (mParams.filterString) {
				sFilterString = mParams.filterString;
			}
			oInfoToolbar.getContent()[0].setText(sFilterString);
		},

		onSelectChange:  function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},

		onFileTypeChange: function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			var oFileTypesMultiComboBox = this.getView().byId("fileTypesBox");
			oUploadCollection.setFileType(oFileTypesMultiComboBox.getSelectedKeys());
		},

		getAttachmentTitleText: function() {
			var aItems = this.getView().byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		getGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: (oGroup.text ? oGroup.text : "Version") + ": " + oGroup.key,
				upperCase: false
			});
		}
	});

	return PageController;

});