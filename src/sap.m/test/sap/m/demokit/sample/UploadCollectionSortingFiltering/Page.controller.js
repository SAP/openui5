sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/format/FileSizeFormat"
], function(jQuery, Controller, MessageToast, UploadCollectionParameter, Fragment, Filter, Sorter, JSONModel, GroupHeaderListItem, FileSizeFormat) {
	"use strict";

	return Controller.extend("sap.m.sample.UploadCollectionSortingFiltering.Page", {
		_oDialog: null,

		onInit: function() {
			// set mock data
			var sPath = sap.ui.require.toUrl("sap/m/sample/UploadCollectionSortingFiltering") + "/uploadCollection.json";
			this.getView().setModel(new JSONModel(sPath));

			// Sets the text to the label
			this.byId("UploadCollection").addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
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

		onViewSettingsClearFilters: function(oEvent) {
			this.onViewSettingsConfirm(oEvent);
		},

		formatAttribute: function(sValue, sType) {
			if (sType === "size") {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onInfoToolbarPressed: function(oEvent) {
			if (oEvent.getParameters().srcControl === this.byId("icClearFilters")) {
				this.onViewSettingsClearFilters(oEvent);
			} else {
				this.onViewSettingsPressed(oEvent);
			}
		},

		onViewSettingsPressed: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollectionSortingFiltering.Dialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		onViewSettingsConfirm: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
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
			jQuery.each(mParams.filterItems, function(i, oItem) {
				var aSplit = oItem.getKey().split(" ");
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

		getAttachmentTitleText: function() {
			var aItems = this.byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		getGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: (oGroup.text ? oGroup.text : "Version") + ": " + oGroup.key,
				upperCase: false
			});
		}
	});
});