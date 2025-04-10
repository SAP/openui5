/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/PDFViewer",
	"sap/m/Dialog",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/Carousel",
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/m/VBox",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/ui/core/Control"
], function(Element, HTML, Button, Image, PDFViewer, Dialog, IllustratedMessage, IllustratedMessageType, Carousel, Log, Library, VBox, Bar, Title, Control) {
	"use strict";

	// get resource translation bundle;
	const oLibraryResourceBundle = Library.getResourceBundleFor("sap.m");

	/**
	 * Media types that can be previewed.
	 * @enum {string}
	 */
	const PreviewableMediaType = {
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
	 * Constructor for a new FilePreviewDialog.
	 *
	 * @class
	 * <h3>Overview</h3>
	 *
	 * Dialog with a carousel to preview files uploaded using the UploadSetwithTable control.
	 * This Element should only be used within the {@link sap.m.upload.UploadSetwithTable UploadSetwithTable} control or {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} Plugin as an association.
	 *
	 * <h3>Supported File Types for Preview</h3>
	 *
	 * Following are the supported file types that can be previewed:
	 *
	 * <ul><li>Image (PNG, JPEG, BMP, GIF)</li>
	 * <li>PDF </li>
	 * <li>Text (Txt)</li>
	 * <li>Video (MP4, MPEG, Quicktime, MsVideo)</li>
	 * <li>SAP 3D Visual models (VDS)</li></ul>
	 *
	 * @author SAP SE
	 * @param {string} [sId] Id for the new control, it is generated automatically if no id is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @constructor
	 * @public
	 * @since 1.120
	 * @version ${version}
	 * @extends sap.ui.core.Element
	 * @name sap.m.upload.FilePreviewDialog
	 */
	const FilePreviewDialog = Element.extend("sap.m.upload.FilePreviewDialog", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Show or hide carousel's arrows.
				 */
				showCarouselArrows: {type: "boolean", defaultValue: true},
				/**
				 * Size limit of the file in megabytes that is allowed to be previewed.
				 * <br>If not set, files of any size can be previewed.
				 */
				maxFileSizeforPreview: {type: "float", defaultValue: null},
				/**
				 * Callback function to insert custom content into the preview dialog using a control to display the preview of unsupported file types.
				 * <br>Use this property as callback function to insert a control with the content into the preview dialog.
				 * <br>Callback function returns a promise that resolves with a control that is displayed in the preview dialog. Reject the promise to display the default illustrated message.
				 * <br>Callback function is invoked with {@link sap.m.upload.UploadItem item} for each unsupported file type.
				 * <br>
				 * <br>Example: There is a file with an xml extension and you want to display the content inside a codeeditor control for the file type.
				 *
				 * <pre><code>
				 * 	&lt;UploadSetwithTable&gt;
				 * 		&lt;upload:FilePreviewDialog customPageContentHandler="{onCustomContentHandler}"&gt;&lt;/upload:FilePreviewDialog&gt;
				 * 	&lt;/UploadSetwithTable&gt;
				 * </code></pre>
				 *
				 * <pre><code>
				 * 	onCustomContentHandler: function(oItem) {
				 *
				 * 			return new Promise(function(resolve, reject) {
				 *
				 * 				switch (oItem.getMediaType().toLowerCase()) {
				 *
				 * 					case "application/xml":
				 *
				 * 						var oCodeEditor = new CodeEditor({
				 * 							value: "XML content",
				 * 							width: "100%",
				 * 							height: "100%"
				 * 						});
				 *
				 * 						resolve(oCodeEditor);
				 * 						break;
				 *
				 * 					default:
				 * 						reject(); // reject the promise to display the default illustrated message.
				 * 						break;
				 * 				}
				 * 			});
				 * 	}
				 * </code></pre>
				 *
				 * @since 1.135
				 **/
				customPageContentHandler: {type: "function", defaultValue: null}
			},
			defaultAggregation: "additionalFooterButtons",
			aggregations: {
				/**
				 * Custom buttons, to be displayed in the preview dialog footer.
				 * <br>Control by default adds two buttons (download and close).
				 */
				additionalFooterButtons: {type: "sap.m.Button", multiple: true}
			}
		},

		_previewItem: null,

		_items: [],

		_aCachedPageIndexs: [],

		init: function () {
			this._oRichTextEditor = null;
			this._oDialog = null;
			this._oViewer = null;
			this._oContentResource = null;
			this._oCarouselItems = null;
		},

		exit: function () {
			this._oRichTextEditor = null;
			this._oDialog = null;
			this._oViewer = null;
			this._oContentResource = null;
			this._oCarouselItems = null;
			this._aCachedPageIndexs = [];
		},

		/**
		 * Opens the {@link sap.m.upload.FilePreviewDialog}.
		 * @private
	 	 */
		_open: async function () {
			const aItems = this._items;
			if (aItems?.length && this._previewItem) {
				this._oCarousel = await this._createCarousel();
				if (!this._oDialog) {
					this._oDialog = this._createDialog();
				} else {
					var oTitle = this._oDialog?.getCustomHeader()?.getContentLeft()[0];
					// Sets the title of the dialog to the currently previewed item filename.
					oTitle?.setText(this._previewItem?.getFileName() || "");
					// Removes all the existing content and set the new content on the dialog.
					this._oDialog.removeAllContent();
					this._oDialog.insertContent(this._oCarousel);
				}
				this.fireEvent("beforePreviewDialogOpen", {oDialog: this._oDialog});

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
				Library.load("sap.ui.vk")
					.then(() => {
						sap.ui.require(["sap/ui/vk/Viewer", "sap/ui/vk/ContentResource"], (viewer, contentResource) => {
							resolve({ viewer, contentResource});
						}, (error) => {
							reject(error);
						});
					})
					.catch(() => {
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
			return new Promise((resolve, reject) => {
				Library.load("sap.ui.richtexteditor")
					.then(() => {
						sap.ui.require(["sap/ui/richtexteditor/RichTextEditor"], (richTextEditor) => {
							resolve(richTextEditor);
						}, (error) => {
							reject(error);
						});
					})
					.catch(() => {
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
		 * @param {sap.m.upload.UploadSetwithTableItem | sap.m.upload.UploadItem} oItem The UploadSetwithTableItem or UploadItem to be previewed
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
		 * @param {sap.m.upload.UploadSetwithTableItem | sap.m.upload.UploadItem} oItem The UploadSetwithTableItem or UploadItem to be previewed
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
			const oPreviewItem = this._previewItem;
			let aItems = this._oCarouselItems = !this.getShowCarouselArrows() ? [this._previewItem] : this._items;
			let sActivePageId = "";
			let oActivePage = null;
			aItems = aItems?.filter((oItem) => oItem?.isA("sap.m.upload.UploadSetwithTableItem") || oItem?.isA("sap.m.upload.UploadItem"));
			const aPagePromises = aItems.map(async (oItem) => {

				let oPage = null;

				if (oItem?.getId() === oPreviewItem.getId() && oItem.getPreviewable() && this.isFileSizeWithinMaxLimit(oItem)) {
					const oPageContent  = await this.getPageContent(oItem);
					oPage = this._getContainerControl(oPageContent);
				} else {
					const oPlaceHolderControl = this._getPlaceHolderControl(oItem);
					oPage = this._getContainerControl(oPlaceHolderControl);
				}

				oPage = !this.isFileSizeWithinMaxLimit(oItem) ? this._getMaxSizePageIllustration(oItem) : oPage;

				sActivePageId = oItem?.getId() === oPreviewItem?.getId() ? oPage?.getId() : sActivePageId;

				oActivePage =  oItem?.getId() === oPreviewItem?.getId() ? oPage : oActivePage;

				if (oItem?.getId() === oPreviewItem?.getId()) {
					this._aCachedPageIndexs.push(this.get);
				}

				return oPage;
			});

			const aPages = await Promise.all(aPagePromises);

			const oCarousel = new Carousel({
				showPageIndicator: this.getShowCarouselArrows() ? true : false,
				pages: [
					aPages
				],
				activePage: sActivePageId,
				pageChanged: async (oEvent) => {
					const iIndex = aPages.findIndex(function(oPage) {
						return oPage.sId === oEvent.getParameter("newActivePageId");
					});
					const oTargetPage = oCarousel.getPages()[iIndex];
					// if the page is not cached, load the content and cache it.
					if (!this._aCachedPageIndexs.includes(iIndex)) {
						const oControl = await this.getPageContent(aItems[iIndex], aPages[iIndex]);
						oTargetPage.removeAllItems();
						oTargetPage.addItem(oControl);
						this._aCachedPageIndexs.push(iIndex);
					 }
					// oCarousel.setActivePage(oTargetPage);

					const sNewDialogTitle = aItems[iIndex].getFileName();

					var oTitle = this._oDialog?.getCustomHeader()?.getContentLeft()[0];
					oTitle?.setText(sNewDialogTitle);
				}
			});

			if (oActivePage && sActivePageId) {
				const sActivePageIndex = oCarousel?.indexOfPage(oActivePage);
				if (sActivePageIndex > -1) {
					this._aCachedPageIndexs?.push(sActivePageIndex);
				}
			}

			// prevent all swipe related events so carousel movement is disabled.
			if (!this.getShowCarouselArrows()) {
				oCarousel.ontouchstart = oCarousel.ontouchmove = oCarousel.ontouchend = (oEvent) => {
					oEvent.preventDefault();
				};
			}

			oCarousel.addStyleClass("sapMFilePreviewDialogCarousel");

			return oCarousel;
		},

		getPageContent: async function(oItem, oNewPage) {

			const sMediaType = oItem.getMediaType();

			let oPage = this._createIllustratedMessage(oItem.getFileName());

			switch (sMediaType?.toLowerCase()) {
				case PreviewableMediaType.Png:
				case PreviewableMediaType.Bmp:
				case PreviewableMediaType.Jpeg:
				case PreviewableMediaType.Gif: {
					const oPage = new Image({
						src: oItem.getUrl()
					});

					return oPage;
				}
				case PreviewableMediaType.Txt: {
					const oRte = await this._createRichTextEditor(oItem);
					if (oRte) {
						oPage = oRte;
					}
					return oPage;
				}
				case PreviewableMediaType.Pdf:
				case PreviewableMediaType.ChromePdf: {
					oPage = new PDFViewer({
						source: oItem.getUrl(),
						showDownloadButton: false,
						isTrustedSource: oItem?.getIsTrustedSource()
					});
					oPage.setBusy(true);
					return oPage;
				}
				case PreviewableMediaType.Mpeg:
				case PreviewableMediaType.Mp4:
				case PreviewableMediaType.Quicktime:
				case PreviewableMediaType.MsVideo: {
					const oPage = new HTML({
						content: `<video controls width='100%' height='100%' src=${oItem.getUrl()}>`
					});
					return oPage;
				}
				case PreviewableMediaType.Tiff:
				case PreviewableMediaType.Vds: {
					const oVdsViewer = await this._createVdsViewer(oItem);
					if (oVdsViewer) {
						oPage = oVdsViewer;
						return oPage;
					}
					break;
				}
				default:
					if (this.getCustomPageContentHandler() && typeof this.getCustomPageContentHandler() === "function") {
						const oPromise = this.getCustomPageContentHandler()(oItem);
						if (oPromise && oPromise instanceof Promise) {
							try {
								const oControl = await oPromise;
								if (oControl instanceof Element || oControl instanceof Control) {
									oPage = oControl;
								}
							} catch (error) {
								return oPage;
							}
						}
					}
					return oPage;
			}

			return oPage;
		},

		_getPlaceHolderControl: function(oItem) {
			return this._createIllustratedMessage(oItem.getFileName());
		},

		_getContainerControl: function(oItem) {
			const oContainer = new VBox({
				items: [
					oItem
				],
				fitContainer: true,
				alignItems: "Center",
				justifyContent: "Center",
				alignContent: "Center",
				renderType: "Bare"
			});
			return oContainer;
		},

		/**
		 * Creates a {@link sap.m.Dialog} with {@link sap.m.Carousel} for previewing uploaded files.
		 * @return {sap.m.Dialog} The {@link sap.m.Dialog} control.
		 * @private
		 */
		_createDialog: function() {
			const oActiveItem = this._getActiveUploadSetwithTableItem();
			const oDialog = new Dialog({
				customHeader: new Bar({
					contentLeft: [new Title({ text:  oActiveItem.getFileName()}).addStyleClass("sapMDialogTitle")]
				}),
				content: this._oCarousel,
				horizontalScrolling: false,
				verticalScrolling: false,
				contentWidth: "auto",
				contentHeight: "80vh",
				buttons: [
					this.getAdditionalFooterButtons(),
					new Button({
						text: oLibraryResourceBundle.getText("UPLOAD_SET_TABLE_FILE_PREVIEW_DIALOG_DOWNLOAD"),
						press: () => {
							this._getActiveUploadSetwithTableItem().download(true);
						}
					}),
					new Button({
						text: oLibraryResourceBundle.getText("UPLOAD_SET_TABLE_FILE_PREVIEW_DIALOG_CLOSE"),
						press: () => {
							this._oCarousel.destroyPages();
							this._oDialog.close();
							this._aCachedPageIndexs = [];
						}
					})
				]
			});

			return oDialog;
		},

		/**
		 * Creates a {@link sap.m.Carousel} of uploaded files.
		 * @return {sap.m.upload.UploadSetwithTableItem | sap.m.upload.UploadItem} The currently active UploadSetwithTableItem.
		 * @private
		 */
		_getActiveUploadSetwithTableItem: function () {
			const sActivePageId = this._oCarousel.getActivePage();
			const aPages = this._oCarousel.getPages();
			const iIndex = aPages.findIndex((oPage) => {
				return oPage.sId === sActivePageId;
			});
			return this._oCarouselItems[iIndex];
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
				description: oLibraryResourceBundle.getText("FILE_PREVIEW_DIALOG_MAX_PREVIEW_SIZE_EXCEEDED", [this.getMaxFileSizeforPreview()]),
				enableVerticalResponsiveness: true
			});
			return oIllustratedMessage;
		}
	});

	FilePreviewDialog.MEGABYTE = 1048576;

	return FilePreviewDialog;
});