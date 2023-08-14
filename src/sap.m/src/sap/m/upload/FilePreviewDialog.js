/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/PDFViewer",
	"sap/m/Dialog",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/Carousel",
	"sap/base/Log"
], function (Core, Element, HTML, Button, Image, PDFViewer, Dialog,
		IllustratedMessage, IllustratedMessageType, Carousel, Log) {
	"use strict";

	// get resource translation bundle;
	var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * Media types that can be previewed.
	 * @enum {string}
	 */
	var PreviewableMediaType = {
		Png: "image/png",
		Bmp: "image/bmp",
		Jpeg: "image/jpeg",
		Gif: "image/gif",
		Txt: "text/plain",
		Pdf: "application/pdf",
		ChromePdf: "application/x-google-chrome-pdf",
		Mpeg: "video/mpeg",
		Mp4: "video/mp4",
		Quicktime: "video/quicktime",
		MsVideo: "video/x-msvideo",
		Vds: "model/vnd.sap.vds"
	};

	/**
	 * The file preview dialog.
	 *
   * @class Dialog with a carousel to preview files uploaded using the UploadSet control.
	 * @param {sap.m.upload.UploadSetTableItem} oPreviewItem The initial active UploadSetTableItem to be previewed.
   * @private
   * @extends sap.ui.core.Element
   * @name sap.m.upload.FilePreviewDialog
   */
	var FilePreviewDialog = Element.extend("sap.m.upload.FilePreviewDialog", {
		library: "sap.m",
		metadata: {
			properties: {
				/**
				Current item being previwed in the carousel dialog.
				*/
				previewItem: {type: "sap.m.upload.UploadSetTableItem", defaultValue: null},
				/**
				 * Items set to build the preview carousel.
				 * */
				items: {type: "sap.m.upload.UploadSetTableItem[]", defaultValue: []},

				/**
				 * Show or hide carousel's arrows.
				 */
				showCarouselArrows: {type: "boolean", defaultValue: true},
				/**
				 * Size limit of the file in megabytes that is allowed to be previewed
				 * <br>If set to <code>null</code> or <code>0</code>, files of any size can be previewed.
				 */
				maxFileSizeforPreview: {type: "float", defaultValue: 0}
			},
			aggregations: {
				/**
				 * Custom buttons, to be displayed in the preview dialog footer.
				 */
				additionalFooterButtons: {type: "sap.m.Button", multiple: true}
			}
		},

		init: function () {
			this._oRichTextEditor = null;
			this._oDialog = null;
			this._oViewer = null;
			this._oContentResource = null;
		},

		/**
		 * Opens the {@link sap.m.upload.FilePreviewDialog}.
	 	*/
		open: async function () {
			var aItems = this.getItems();
			if (aItems?.length && this.getPreviewItem()) {
				this._oCarousel = await this._createCarousel();
				if (!this._oDialog) {
					this._oDialog = this._createDialog();
				} else {
					// Sets the title of the dialog to the currently previewed item filename.
					this._oDialog.setTitle(this.getPreviewItem()?.getFileName() || "");
					// Removes all the existing content and set the new content on the dialog.
					this._oDialog.removeAllContent();
					this._oDialog.insertContent(this._oCarousel);
				}
				this._oDialog.open();
			}
		},

		/**
		 * Dynamically require Vds Viewer Control
		 * @return {Promise} Promise that resolves on sucessful load of Viewer control
		 * @private
		 */
		_loadVkDependency: function() {
			return new Promise(function (resolve, reject) {
				Core.loadLibrary("sap.ui.vk", { async: true })
					.then(function() {
						sap.ui.require(["sap/ui/vk/Viewer", "sap/ui/vk/ContentResource"], function(viewer, contentResource) {
							resolve({ viewer, contentResource});
						}, function (error) {
							reject(error);
						});
					})
					.catch(function () {
						reject("sap.ui.vk.Viewer Control not available.");
					});
			});
		},

		/**
		 * Dynamically require RichTextEditor Control
		 * @return {Promise} Promise that resolves on sucessful load of RichTextEditor control
		 * @private
		 */
		_loadRichTextEditorDependency: function() {
			return new Promise(function (resolve, reject) {
				Core.loadLibrary("sap.ui.richtexteditor", { async: true })
					.then(function() {
						sap.ui.require(["sap/ui/richtexteditor/RichTextEditor"], function(richTextEditor) {
							resolve(richTextEditor);
						}, function (error) {
							reject(error);
						});
					})
					.catch(function () {
						reject("RichTextEditor Control not available.");
					});
			});
		},

		/**
		 * Creates an illustrated message for when no preview is available
		 * @param {string} sFileName The name of the file to be previewed
		 * @return {sap.m.IllustratedMessage} An illustrated message instance
		 * @private
		 */
		_createIllustratedMessage: function (sFileName) {
			const oIllustratedMessage = new IllustratedMessage({
				illustrationType: IllustratedMessageType.NoData,
				title: sFileName,
				description: oLibraryResourceBundle.getText("FILE_PREVIEW_DIALOG_NO_PREVIEW_AVAILABLE_MSG"),
				enableVerticalResponsiveness: true
			});
			return oIllustratedMessage;
		},

		/**
		 * Creates a viewer for .vds files
		 * @param {sap.m.upload.UploadSetTableItem} oItem The UploadSetTableItem to be previewed
		 * @return {sap.ui.vk.Viewer} A vds viewer instance or undefined if dependency unavailable
		 * @private
		 */
		_createVdsViewer: async function (oItem) {
			if (!this.oViewer || !this._oContentResource) {
				try {
					const oVkDependency = await this._loadVkDependency();
					this._oViewer = oVkDependency.viewer;
					this._oContentResource = oVkDependency.contentResource;
				} catch (error) {
					Log.error(error);
					return null;
				}
			}

			const oVdsViewer = new this._oViewer({
				contentResources: [
					new this._oContentResource({
						source: oItem.getUrl(),
						sourceType: "vds"
					})
				]
			});

			return oVdsViewer;
		},

		/**
		 * Creates a rich text viewer
		 * @param {sap.m.upload.UploadSetTableItem} oItem The UploadSetTableItem to be previewed
		 * @return {sap.ui.richtexteditor.RichTextEditor} A rich text editor instance or undefined if dependency unavailable
		 * @private
		 */
		_createRichTextEditor: async function (oItem) {
			if (!this._oRichTextEditor) {
				try {
					const oRichTextEditor = await this._loadRichTextEditorDependency();
					this._oRichTextEditor = oRichTextEditor;
				} catch (error) {
					Log.error(error);
					return null;
				}
			}

			const oRte = new this._oRichTextEditor({
				height: "100%",
				width: "100%",
				editable: false,
				busy: true
			});

			oRte.attachReady(function () {
				oRte.setBusy(false);
			});

			const oRequest = new XMLHttpRequest();
			oRequest.open("GET", oItem.getUrl(), false);
			oRequest.send(null);
			const sText = oRequest.responseText;
			oRte.setValue(sText);

			return oRte;
		},

		/**
     	* Creates a {@link sap.m.Carousel} of uploaded files.
		* @return {sap.m.Carousel} The {@link sap.m.Carousel} control.
     	* @private
     	*/
		_createCarousel: async function () {
			const oPreviewItem = this.getPreviewItem();
			const aItems = !this.getShowCarouselArrows() ? [this.getPreviewItem()] : this.getItems();
			var sActivePageId = "";
			var aPagePromises = aItems.map(async (oItem) => {
				var sMediaType = oItem.getMediaType();

				var sFileName = oItem.getFileName();
				var oPage = this._createIllustratedMessage(sFileName);

				if (oItem.getPreviewable() && this.isFileSizeWithinMaxLimit(oItem)) {
					switch (sMediaType?.toLowerCase()) {
						case PreviewableMediaType.Png:
						case PreviewableMediaType.Bmp:
						case PreviewableMediaType.Jpeg:
						case PreviewableMediaType.Gif: {
							oPage = new Image({
								src: oItem.getUrl()
							});
							break;
						}
						case PreviewableMediaType.Txt: {
							const oRte = await this._createRichTextEditor(oItem);
							if (oRte) {
								oPage = oRte;
							}
							break;
						}
						case PreviewableMediaType.Pdf:
						case PreviewableMediaType.ChromePdf: {
							oPage = new PDFViewer({
								source: oItem.getUrl(),
								showDownloadButton: false
							});
							oPage.setBusy(true);
							break;
						}
						case PreviewableMediaType.Mpeg:
						case PreviewableMediaType.Mp4:
						case PreviewableMediaType.Quicktime:
						case PreviewableMediaType.MsVideo: {
							oPage = new HTML({
								content: "<video controls width='100%' height='100%' src='" + oItem.getUrl() + "'>"
							});
							break;
						}
						case PreviewableMediaType.Tiff:
						case PreviewableMediaType.Vds: {
							const oVdsViewer = await this._createVdsViewer(oItem);
							if (oVdsViewer) {
								oPage = oVdsViewer;
							}
							break;
						}
						default:
							break;
					}
				}

				oPage = !this.isFileSizeWithinMaxLimit(oItem) ? this._getMaxSizePageIllustration(oItem) : oPage;

				sActivePageId = oItem?.getId() === oPreviewItem?.getId() ? oPage?.getId() : sActivePageId;

				return oPage;
			});

			const aPages = await Promise.all(aPagePromises);

			const oCarousel = new Carousel({
				showPageIndicator: this.getShowCarouselArrows() ? true : false,
				pages: [
					aPages
				],
				activePage: sActivePageId,
				height: "85vh",
				pageChanged: (oEvent) => {
					var iIndex = aPages.findIndex(function(oPage) {
						return oPage.sId === oEvent.getParameter("newActivePageId");
					});
					var sNewDialogTitle = aItems[iIndex].getFileName();
					this._oDialog.setTitle(sNewDialogTitle);
				}
			});

			// prevent all swipe related events so carousel movement is disabled.
			if (!this.getShowCarouselArrows()) {
				oCarousel.ontouchstart = oCarousel.ontouchmove = oCarousel.ontouchend = (oEvent) => {
					oEvent.preventDefault();
				};
			}

			return oCarousel;
		},

		/**
	 	* Creates a {@link sap.m.Dialog} with {@link sap.m.Carousel} for previewing uploaded files.
		* @return {sap.m.Dialog} The {@link sap.m.Dialog} control.
	 	* @private
		*/
		_createDialog: function() {
			var that = this;
			var oActiveItem = this._getActiveUploadSetTableItem();
			var oDialog = new Dialog({
				title: oActiveItem.getFileName(),
				content: that._oCarousel,
				horizontalScrolling: false,
				verticalScrolling: false,
				contentWidth: "100%",
				contentHeight: "100%",
				buttons: [
					that.getAdditionalFooterButtons(),
					new Button({
						text: oLibraryResourceBundle.getText("UPLOAD_SET_TABLE_FILE_PREVIEW_DIALOG_DOWNLOAD"),
						press: function () {
							that._getActiveUploadSetTableItem().download(true);
						}
					}),
					new Button({
						text: oLibraryResourceBundle.getText("UPLOAD_SET_TABLE_FILE_PREVIEW_DIALOG_CLOSE"),
						press: function () {
							that._oDialog.close();
						}
					})
				]
			});

			return oDialog;
		},

		/**
     	* Creates a {@link sap.m.Carousel} of uploaded files.
		* @return {sap.m.upload.UploadSetTableItem} The currently active UploadSetTableItem.
     	* @private
     	*/
		_getActiveUploadSetTableItem: function () {
			var sActivePageId = this._oCarousel.getActivePage();
			var aPages = this._oCarousel.getPages();
			var iIndex = aPages.findIndex(function (oPage) {
				return oPage.sId === sActivePageId;
			});
			return this.getItems()[iIndex];
		},
		isFileSizeWithinMaxLimit: function(oItem) {
			let maxFileSize = this.getMaxFileSizeforPreview();
			const iFileSize = oItem && oItem.getFileSize ? oItem.getFileSize() : 0; // if no file size

			// if maxfilesize or filesize is not defined any file size can be previwed.
			if (!maxFileSize || !iFileSize) {
				return true;
			}

			maxFileSize = maxFileSize * (FilePreviewDialog.MEGABYTE);

			return iFileSize <= maxFileSize;

		},
		_getMaxSizePageIllustration: function(oItem) {
			const oIllustratedMessage = new IllustratedMessage({
				illustrationType: IllustratedMessageType.NoData,
				title: oItem?.getFileName(),
				description: oLibraryResourceBundle.getText("FILE_PREVIEW_DIALOG_MAX_PREVIEW_SIZE_EXCEEDED", this.getMaxFileSizeforPreview()),
				enableVerticalResponsiveness: true
			});
			return oIllustratedMessage;
		}
	});

	FilePreviewDialog.MEGABYTE = 1048576;

  return FilePreviewDialog;
});