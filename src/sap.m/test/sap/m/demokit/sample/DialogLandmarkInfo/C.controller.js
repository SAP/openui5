sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/DialogAccessibleLandmarkInfo",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/library"
], function (Controller, Dialog, DialogAccessibleLandmarkInfo, Page, PageAccessibleLandmarkInfo, Button, Text, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.m.sample.DialogLandmarkInfo.C", {

		// Default Dialog - Header, Content and Footer are exposed as region landmarks.
		onDefaultPress: function () {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Available Products",
					content: new Text({ text: "The Header, Content and Footer regions are all exposed as landmarks." }).addStyleClass("sapUiSmallMargin"),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Close",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					})
				});
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
		},

		// Dialog embedding a Page that declares its own landmarks.
		// The Dialog's Content landmark is suppressed to avoid nesting the Page's
		// banner/region landmarks inside a redundant Content region. With showHeader
		// set to false, the embedded Page title labels the Dialog.
		onEmbeddedPagePress: function () {
			if (!this.oEmbeddedPageDialog) {
				this.oEmbeddedPageDialog = new Dialog({
					showHeader: false,
					landmarkInfo: new DialogAccessibleLandmarkInfo({
						showContentLandmark: false
					}),
					content: new Page({
						title: "Product details",
						landmarkInfo: new PageAccessibleLandmarkInfo(),
						content: new Text({ text: "The embedded Page provides its own landmarks, so the Dialog's Content region is suppressed." }).addStyleClass("sapUiSmallMargin")
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Close",
						press: function () {
							this.oEmbeddedPageDialog.close();
						}.bind(this)
					})
				});
				this.getView().addDependent(this.oEmbeddedPageDialog);
			}

			this.oEmbeddedPageDialog.open();
		},

		// Small dialog with no region landmarks at all - all three regions suppressed.
		onNoRegionsPress: function () {
			if (!this.oNoRegionsDialog) {
				this.oNoRegionsDialog = new Dialog({
					title: "Delete item?",
					landmarkInfo: new DialogAccessibleLandmarkInfo({
						showHeaderLandmark: false,
						showContentLandmark: false,
						showFooterLandmark: false
					}),
					content: new Text({ text: "This small dialog exposes no region landmarks." }).addStyleClass("sapUiSmallMargin"),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Delete",
						press: function () {
							this.oNoRegionsDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oNoRegionsDialog.close();
						}.bind(this)
					})
				});
				this.getView().addDependent(this.oNoRegionsDialog);
			}

			this.oNoRegionsDialog.open();
		}

	});
});
