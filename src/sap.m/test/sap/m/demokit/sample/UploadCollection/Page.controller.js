sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/ObjectMarker",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/m/library",
	"sap/m/ObjectAttribute",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/FileSizeFormat",
	"sap/ui/Device"
], function(jQuery, Controller, ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary, ObjectAttribute,
			JSONModel, FileSizeFormat, Device) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadCollection.Page", {
		onInit: function() {
			// set mock data
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadCollection") + "/uploadCollection.json";
			this.getView().setModel(new JSONModel(sPath));

			this.getView().setModel(new JSONModel(Device), "device");

			this.getView().setModel(new JSONModel({
				"maximumFilenameLength": 55,
				"maximumFileSize": 500,
				"mode": MobileLibrary.ListMode.SingleSelectMaster,
				"uploadEnabled": true,
				"uploadButtonVisible": true,
				"enableEdit": true,
				"enableDelete": true,
				"visibleEdit": true,
				"visibleDelete": true,
				"listSeparatorItems": [
					MobileLibrary.ListSeparators.All,
					MobileLibrary.ListSeparators.None
				],
				"showSeparators": MobileLibrary.ListSeparators.All,
				"listModeItems": [
					{
						"key": MobileLibrary.ListMode.SingleSelectMaster,
						"text": "Single"
					}, {
						"key": MobileLibrary.ListMode.MultiSelect,
						"text": "Multi"
					}
				]
			}), "settings");

			this.getView().setModel(new JSONModel({
				"items": ["jpg", "txt", "pdf", "png", "mp4"],
				"selected": ["jpg", "txt", "pdf", "png", "mp4"],
				"mime": ["text/plain", "video/mp4", "image/jpg", "application/msword"]
			}), "fileTypes");

			this.oUC = this.byId("UploadCollection");

			// Sets the text to the label
			this.oUC.addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});

			this.oUC.attachAfterItemAdded(function (oEvent) {
				var oNewItem = oEvent.getParameter("item");
				this.updateItemButtons(oNewItem, this.oUC.getMode() !== MobileLibrary.ListMode.MultiSelect);
				this._oLastItemAdded = oNewItem;
			}.bind(this));
		},

		updateItemButtons: function (oItem, bButtonsVisible) {
			oItem.setEnableEdit(bButtonsVisible);
			oItem.setVisibleEdit(bButtonsVisible);
			oItem.setEnableDelete(bButtonsVisible);
			oItem.setVisibleDelete(bButtonsVisible);
		},

		createObjectMarker: function(sId, oContext) {
			var mSettings = null;

			if (oContext.getProperty("type")) {
				mSettings = {
					type: "{type}",
					press: this.onMarkerPress
				};
			}
			return new ObjectMarker(sId, mSettings);
		},

		formatAttribute: function(sValue) {
			if (jQuery.isNumeric(sValue)) {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onFileDeleted: function() {
			MessageToast.show("FileDeleted event triggered.");
		},

		deleteMultipleItems: function(aItemsToDelete) {
			var oUploadCollection = this.byId("UploadCollection");
			aItemsToDelete.forEach(function (oItem) {
				oUploadCollection.removeAggregation("items", oItem, true);
			});
			oUploadCollection.invalidate();
		},

		onFilenameLengthExceed: function() {
			MessageToast.show("FilenameLengthExceed event triggered.");
		},

		onFileRenamed: function(oEvent) {
			var oData = this.byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			var sDocumentId = oEvent.getParameter("documentId");
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					aItems[index].fileName = oEvent.getParameter("item").getFileName();
				}
			});
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			MessageToast.show("FileRenamed event triggered.");
		},

		onFileSizeExceed: function() {
			MessageToast.show("FileSizeExceed event triggered.");
		},

		onTypeMissmatch: function() {
			MessageToast.show("TypeMismatch event triggered.");
		},

		onUploadComplete: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			if (oItem) {
				oItem.setDocumentId(jQuery.now().toString());
				// Remove default no-title size attribute and add them fresh
				oItem.removeAllAttributes();
				oItem.removeAllAggregation("_propertyAttributes", true);
				oItem.addAggregation("attributes", new ObjectAttribute({title: "Uploaded By", text: "You", active: false}, true));
				oItem.addAggregation("attributes", new ObjectAttribute({title: "Uploaded On", text: new Date(jQuery.now()).toLocaleDateString(), active: false}, true));
				oItem.addAggregation("attributes", new ObjectAttribute({title: "File Size", text: this._oLastItemAdded._getFileObject().size, active: false}, true));
				oItem.invalidate();
			}

			// Sets the text to the label
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());

			// delay the success message for to notice onChange message
			setTimeout(function() {
				MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			MessageToast.show("BeforeUploadStarts event triggered.");
		},

		onFileTypeChange: function(oEvent) {
			this.byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
		},

		onSelectAllPress: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			if (!oEvent.getSource().getPressed()) {
				this.deselectAllItems(oUploadCollection);
				oEvent.getSource().setPressed(false);
				oEvent.getSource().setText("Select all");
			} else {
				this.deselectAllItems(oUploadCollection);
				oUploadCollection.selectAll();
				oEvent.getSource().setPressed(true);
				oEvent.getSource().setText("Deselect all");
			}
			this.onSelectionChange(oEvent);
		},

		deselectAllItems: function(oUploadCollection) {
			var aItems = oUploadCollection.getItems();
			for (var i = 0; i < aItems.length; i++) {
				oUploadCollection.setSelectedItem(aItems[i], false);
			}
		},

		getAttachmentTitleText: function() {
			var aItems = this.byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		onModeChange: function(oEvent) {
			var bMulti = (oEvent.getParameters().selectedItem.getProperty("key") === MobileLibrary.ListMode.MultiSelect);
			this.oUC.getItems().forEach(function (oItem) {
				this.updateItemButtons(oItem, !bMulti);
			}.bind(this));
			this.enableToolbarItems(bMulti);
		},

		enableToolbarItems: function(status) {
			this.byId("selectAllButton").setVisible(status);
			this.byId("deleteSelectedButton").setVisible(status);
			this.byId("selectAllButton").setEnabled(status);
			// This is only enabled if there is a selected item in multi-selection mode
			if (this.byId("UploadCollection").getSelectedItems().length > 0) {
				this.byId("deleteSelectedButton").setEnabled(true);
			}
		},

		onDeleteSelectedItems: function() {
			var aSelectedItems = this.byId("UploadCollection").getSelectedItems();
			this.deleteMultipleItems(aSelectedItems);
			if (this.byId("UploadCollection").getSelectedItems().length < 1) {
				this.byId("selectAllButton").setPressed(false);
				this.byId("selectAllButton").setText("Select all");
			}
			MessageToast.show("Delete selected items button press.");
		},

		onSearch: function() {
			MessageToast.show("Search feature isn't available in this sample");
		},

		onSelectionChange: function() {
			var oUploadCollection = this.byId("UploadCollection");
			// Only it is enabled if there is a selected item in multi-selection mode
			if (oUploadCollection.getMode() === MobileLibrary.ListMode.MultiSelect) {
				if (oUploadCollection.getSelectedItems().length > 0) {
					this.byId("deleteSelectedButton").setEnabled(true);
				} else {
					this.byId("deleteSelectedButton").setEnabled(false);
				}
			}
		},

		onAttributePress: function(oEvent) {
			MessageToast.show("Attribute press event - " + oEvent.getSource().getTitle() + ": " + oEvent.getSource().getText());
		},

		onMarkerPress: function(oEvent) {
			MessageToast.show("Marker press event - " + oEvent.getSource().getType());
		},

		onOpenAppSettings: function(oEvent) {
			if (!this.oSettingsDialog) {
				this.oSettingsDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollection.AppSettings", this);
				this.getView().addDependent(this.oSettingsDialog);
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oSettingsDialog);
			this.oSettingsDialog.open();
		},

		onDialogCloseButton: function() {
			this.oSettingsDialog.close();
		}
	});
});