/*global QUnit*/
sap.ui.define([
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/m/upload/FilePreviewDialog",
	"./UploadSetwithTableTestUtils"
], function (UploadSetwithTable, UploadSetwithTableItem, JSONModel, oCore, FilePreviewDialog, TestUtils) {
	"use strict";


	QUnit.module("FilePreviewDialog general functionality", {
		beforeEach: function () {
			this.oUploadSetwithTable = new UploadSetwithTable("UploadSetwithTable", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			});
			this.oUploadSetwithTable.setModel(new JSONModel(TestUtils.getData()));
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("Test for FilePreviewDialog Instance Creation", function (assert) {
		const associatedControl = new FilePreviewDialog();

		this.oUploadSetwithTable.setPreviewDialog(associatedControl);

		const oAssociatedControlRef = oCore.byId(this.oUploadSetwithTable.getPreviewDialog());
		assert.ok(oAssociatedControlRef, "FilePreviewDialog Instance created successfully");
	});

	QUnit.test("Test for FilePreviewDialog Properties getter/setters", function (assert) {
		const associatedControl = new FilePreviewDialog();

		this.oUploadSetwithTable.setPreviewDialog(associatedControl);

		const oAssociatedControlRef = oCore.byId(this.oUploadSetwithTable.getPreviewDialog());
		assert.equal(oAssociatedControlRef.getShowCarouselArrows(), true, "showCarouselArrows is true by default");
		oAssociatedControlRef.setShowCarouselArrows(false);
		assert.equal(oAssociatedControlRef.getShowCarouselArrows(), false, "showCarouselArrows is set to false");

		assert.equal(oAssociatedControlRef.getMaxFileSizeforPreview(), 0, "MaxFileSizeforPreview is 0 or null by default");
		oAssociatedControlRef.setMaxFileSizeforPreview(1024);
		assert.equal(oAssociatedControlRef.getMaxFileSizeforPreview(), 1024, "MaxFileSizeforPreview is set to 1024 units");
	});

	QUnit.test("Test for method _openFilePreview", function (assert) {
		var fnDone = assert.async();

		var oItem = this.oUploadSetwithTable.getItems()[0];
		const oAssociatedPreviewDialog = new FilePreviewDialog();
		oAssociatedPreviewDialog.attachEventOnce("beforePreviewDialogOpen", function (oEvent) {
			var oPreviewDialogRef = oEvent.getSource();

			oPreviewDialogRef._oDialog.attachEventOnce("afterOpen",function(oEvent){
				var oBeginButton = oPreviewDialogRef._oDialog.getButtons()[1];
				oBeginButton.firePress();
				fnDone();
			});

			assert.equal(oPreviewDialogRef._items.length, 8, "FilePreviewDialog have all the items to preview");
			assert.equal(oPreviewDialogRef._previewItem, oItem, "FilePreviewDialog previewed correct item");
			assert.equal(oPreviewDialogRef._oDialog.getButtons().length, 2, "FilePreviewDialog have 2 buttons by default");

		});

		this.oUploadSetwithTable.setPreviewDialog(oAssociatedPreviewDialog);
		this.oUploadSetwithTable._openFilePreview(oItem);
		oCore.applyChanges();
	});

	QUnit.test("Test for supported media type and Illustrated Messages", function (assert) {
		var fnDone = assert.async();

		var oItem = this.oUploadSetwithTable.getItems()[0];
		const oAssociatedPreviewDialog = new FilePreviewDialog();
		oAssociatedPreviewDialog.attachEventOnce("beforePreviewDialogOpen", function (oEvent) {
			var aItems = oEvent.getSource()._items;
			var oPreviewDialog = oEvent.getSource()._oDialog;
			var oCarousel = oPreviewDialog.getContent()[0];
			var aPages = oCarousel.getPages();

			oPreviewDialog.attachEventOnce("afterOpen",function(oEvent){

			for (let i = 0; i < aPages.length; i++) {
				assert.equal(oPreviewDialog.getTitle(), aItems[i].getFileName(), "First previewed document's title is correct on the dialog");
				assert.equal(oCarousel.getActivePage(), aPages[i].getId(), "First previewed document's title is correct on the dialog");

				switch (aItems[i].getMediaType()) {
					case "application/msword":
						assert.equal(aPages[i].getTitle(), aItems[i].getFileName(), "Title is correct for file on page");
						assert.equal(aPages[i].getDescription(), 'Preview not available for this file.', "Description for the page is correct on page");
						assert.equal(aPages[i].getIllustrationType(), 'sapIllus-NoData', "IllustrationType for not supported file type is correct");
						break;
					case "application/vnd.ms-excel":
						assert.equal(aPages[i].getTitle(), aItems[i].getFileName(), "Title is correct for file on page");
						assert.equal(aPages[i].getDescription(), 'Preview not available for this file.', "Description for the page is correct on page");
						assert.equal(aPages[i].getIllustrationType(), 'sapIllus-NoData', "IllustrationType for not supported file type is correct");
						break;
					case "video/mp4":
						assert.equal(aPages[i].getContent(), "<video controls width='100%' height='100%' src='uploadSetTableDemo/SampleFiles/Video.mp4'>", "IllustrationType for not supported file type is correct");
						break;
					case "text/plain":
						assert.equal(aPages[i].getEditorType(), "TinyMCE6", "Editor type is correct for media type text/plain on page");
						assert.ok(aPages[i].getButtonGroups(), "Group of buttons are present for the editor");
						break;
					case "image/png":
						assert.equal(aPages[i].getSrc(), aItems[i].getUrl(), "Source of the media type image is same as expected");
						break;
					case  "image/gif":
						assert.equal(aPages[i].getSrc(), aItems[i].getUrl(), "Source of the media type image is same as expected");
						break;
					case "application/zip":
						assert.equal(aPages[i].getTitle(), aItems[i].getFileName(), "Title is correct for file on page");
						assert.equal(aPages[i].getDescription(), 'Preview not available for this file.', "Description for the page is correct on page");
						assert.equal(aPages[i].getIllustrationType(), 'sapIllus-NoData', "IllustrationType for not supported file type is correct");
						break;
					case "model/vnd.sap.vds":
						assert.equal(aPages[i].getTitle(), aItems[i].getFileName(), "Title is correct for file on page");
						assert.equal(aPages[i].getDescription(), 'Preview not available for this file.', "Description for the page is correct on page");
						assert.equal(aPages[i].getIllustrationType(), 'sapIllus-NoData', "IllustrationType for not supported file type is correct");
						break;
					default:
						break;
				}
				if (i < aPages.length - 1) {
					oCarousel._changeActivePage(i + 1);
				}
			}

			var oBeginButton = oPreviewDialog.getButtons()[1];
			oBeginButton.firePress();
			fnDone();
			});

		});

		this.oUploadSetwithTable.setPreviewDialog(oAssociatedPreviewDialog);
		this.oUploadSetwithTable._openFilePreview(oItem);
		oCore.applyChanges();
	});
});