sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader",
	"sap/m/StandardListItem",
	"sap/m/MessageToast",
	"sap/m/Button",
	'sap/ui/core/IconPool',
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/ToolbarSpacer",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/ui/core/Icon"
], function (MobileLibrary, Controller, Item, JSONModel, Uploader, ListItem, MessageToast, Button, IconPool, GroupHeaderListItem, Fragment, syncStyleClass,
	Filter, Sorter, ToolbarSpacer, ToolBar, Label, Icon) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadSet.Page", {

		onInit: function () {
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadSetGroupingSortingFiltering/items.json"),
				oUploadSet = this.byId("UploadSet");

			this.getView().setModel(new JSONModel(sPath));

			// Modify "add file" button
			oUploadSet.getDefaultFileUploader().setButtonOnly(false);
			oUploadSet.getDefaultFileUploader().setTooltip("");
			oUploadSet.getDefaultFileUploader().setIconOnly(true);
			oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");

			var overflowToolbar = oUploadSet.getToolbar();
			overflowToolbar.addContent(new Button({
				type:"Transparent",
				icon:IconPool.getIconURI('drop-down-list'),
				tooltip:"View settings",
				press: [this.onViewSettingsPressed, this]
			}));

			// Attach infotoolbar to list to display filtering information if filters applied
			var oList = oUploadSet.getList();
			var oInfoToolBar = new ToolBar('idInfoToolbarUploadSet', {
				active: true,
				visible: false,
				press:[this.onInfoToolbarPressed, this],
				content: [new Label('idInfoToolbarLabel'), new ToolbarSpacer(), new Icon('icClearFilters',  {
					width:'2rem',
					src:'sap-icon://sys-cancel'
				})]
			});
			oList.setInfoToolbar(oInfoToolBar);

			this.mGroupFunctions = {
				uploadedBy: function(oContext) {
					return {
						key: oContext.getProperty("uploadedBy"), //'uploadedBy' value as attribute
						text: "Uploaded By"
					};
				},
				mimeType: function(oContext) {
					return {
						key: oContext.getProperty("mimeType"), //'mimeType' value as property
						text: "Mime Type"
					};
				},
				fileName: function(oContext) {
					return {
						key: oContext.getProperty("fileName"), //'uploadedBy' value as attribute
						text: "File name"
					};
				}
			};

			this.oDialogRef = null;
		},
		onViewSettingsClearFilters: function(oEvent) {
			this.onViewSettingsConfirm(oEvent);
			// reset dialog content to initial state
			if (this.oDialogRef && this.oDialogRef._resetButton) {
				this.oDialogRef._resetButton.firePress();
			}
		},

		onInfoToolbarPressed: function(oEvent) {
			if (oEvent.getParameters().srcControl.sId === "icClearFilters") {
				this.onViewSettingsClearFilters(oEvent);
			} else {
				this.onViewSettingsPressed(oEvent);
			}
		},

		onViewSettingsPressed: function(oEvent) {
			var oView = this.getView();

			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.UploadSetGroupingSortingFiltering.Dialog",
					controller: this
				});
			}

			var that = this;
			this._pDialog.then(function(oDialog){
				that.oDialogRef = oDialog;
				// toggle compact style
				syncStyleClass("sapUiSizeCompact", oView, oDialog);
				oDialog.open();
			});

		},

		onViewSettingsConfirm: function(oEvent) {
			var oUploadSet = this.byId("UploadSet");
			var oInfoToolbar = oUploadSet.getList().getInfoToolbar();
			var oBindingItems = oUploadSet.getBinding("items");
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
			if (mParams && mParams.filterItems) {
				mParams.filterItems.forEach(function(oItem, i) {
					var aSplit = oItem.getKey().split(" ");
					var sPath = aSplit[0];
					var sOperator = aSplit[1];
					var sValue1 = aSplit[2];
					var sValue2 = aSplit[3];
					var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
					aFilters.push(oFilter);
				});
			}
			oBindingItems.filter(aFilters);

			// update filter bar
			oInfoToolbar.setVisible(aFilters.length > 0);
			var sFilterString = "";
			if (mParams.filterString) {
				sFilterString = mParams.filterString;
			}
			oInfoToolbar.getContent()[0].setText(sFilterString);
		},
		getGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: oGroup ? (oGroup.text ? oGroup.text : "Uploaded By") + ": " + oGroup.key : ''
			});
		},
		onMediaTypeMismatch: function(oEvent) {
			MessageToast.show("Media Type Missmatch event triggered.");
		},
		onFileTypeMismatch: function(oEvent) {
			var oUploadSet = this.byId("UploadSet");
			oUploadSet.removeIncompleteItem(oEvent.getParameter("item"));
			MessageToast.show("File Type Missmatch event triggered.");
		}
	});
});