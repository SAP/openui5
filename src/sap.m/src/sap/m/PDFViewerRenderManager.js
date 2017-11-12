/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/MessagePage",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarLayoutData"
], function($, library, Dialog, Button, MessagePage, OverflowToolbar, OverflowToolbarButton, Title,
	ToolbarSpacer, OverflowToolbarLayoutData) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	var oPDFViewerRenderManager = {
		extendPdfViewer: function (PDFViewer) {

			/**
			 * Creates factory method that lazily creates dialog and holds the reference on it.
			 *
			 * @private
			 */
			PDFViewer.prototype._initPopupControl = function () {
				var that = this;
				var oOptions = {
					contentHeight: "100%",
					contentWidth: "100%",
					horizontalScrolling: false,
					verticalScrolling: false,
					showHeader: true,
					buttons: [],
					afterClose: that._onAfterPopupClose.bind(that)
				},
					sPopupId = that.getId() + "-popup",
					sPopupCloseButtonId = sPopupId + "-popupCloseButton",
					sCloseButtonFactoryFunctionName = "getPopupCloseButton",
					sPopupFactoryFunctionName = "getPopup";

				this._objectsRegister[sCloseButtonFactoryFunctionName] = function () {
					var oCloseButton = new Button(sPopupCloseButtonId, {
						text: '',
						press: function () {
							that._objectsRegister.getPopup().close();
						}
					});
					that._objectsRegister[sCloseButtonFactoryFunctionName] = function () {
						return oCloseButton;
					};

					return oCloseButton;
				};

				this._objectsRegister[sPopupFactoryFunctionName] = function (bIsDestroying) {
					// if the constructor getter is called during the destroying, it is not neccessary to create
					// the control and then immediately destroy it
					if (bIsDestroying === true) {
						return null;
					}

					var oPopup = new Dialog(sPopupId, oOptions);
					oPopup.addStyleClass("sapUiPopupWithPadding");

					that._objectsRegister[sPopupFactoryFunctionName] = function () {
						return oPopup;
					};

					return oPopup;
				};
			};

			/**
			 * Setup the popup before opening
			 * @param oPopup
			 * @private
			 */
			PDFViewer.prototype._preparePopup = function (oPopup) {
				var aButtons = $.merge([], this.getPopupButtons()),
					oCloseButton = this._objectsRegister.getPopupCloseButton(),
					oDownloadButton = this._objectsRegister.getPopupDownloadButtonControl();
				oCloseButton.setText(this._getLibraryResourceBundle().getText("PDF_VIEWER_POPUP_CLOSE_BUTTON"));

				if (this.getShowDownloadButton()) {
					aButtons.push(oDownloadButton);
				}
				aButtons.push(oCloseButton);
				oPopup.removeAllButtons();
				aButtons.forEach(function (oButton) {
					oPopup.addButton(oButton);
				});

				oPopup.setShowHeader(true);
				if (!!this.getPopupHeaderTitle()) {
					oPopup.setTitle(this.getPopupHeaderTitle());
				}
				if (!!this.getTitle()) {
					oPopup.setTitle(this.getTitle());
				}
			};

			PDFViewer.prototype._initPlaceholderMessagePageControl = function () {
				var that = this,
				sPlaceholderMessagePageFactoryFunctionName = "getPlaceholderMessagePageControl";

				this._objectsRegister[sPlaceholderMessagePageFactoryFunctionName] = function () {
					var oMessagePage = new MessagePage({
						showHeader: false,
						text: that._getMessagePageErrorMessage(),
						description: ""
					});

					that._objectsRegister[sPlaceholderMessagePageFactoryFunctionName] = function () {
						oMessagePage.setText(that._getMessagePageErrorMessage());

						return oMessagePage;
					};

					return oMessagePage;
				};
			};

			PDFViewer.prototype._initOverflowToolbarControl = function () {
				var that = this,
					sOverflowId = this.getId() + "-overflowToolbar",
					sTitleId = sOverflowId + "-title",
					sOverflowToolbarFactoryFunctionName = "getOverflowToolbarControl";

				this._objectsRegister[sOverflowToolbarFactoryFunctionName] = function (bIsDestroying) {
					// if the constructor getter is called during the destroying, it is not neccessary to create
					// the control and then immediately destroy it
					if (bIsDestroying === true) {
						return null;
					}

					var oOverflowToolbar = new OverflowToolbar(sOverflowId, {}),
						oTitle = new Title(sTitleId, {
						text: that.getTitle()
					}),
						oButton = that._objectsRegister.getToolbarDownloadButtonControl();

					function setup() {
						if (that.getShowDownloadButton()) {
							oOverflowToolbar.addContent(oButton);
						} else {
							oOverflowToolbar.removeContent(oButton);
						}
						oButton.setEnabled(that._bRenderPdfContent);
						oTitle.setText(that.getTitle());
					}

					oOverflowToolbar.addStyleClass("sapUiTinyMarginBottom");

					oOverflowToolbar.addContent(oTitle);
					oOverflowToolbar.addContent(new ToolbarSpacer());
					setup();
					oButton.setLayoutData(new OverflowToolbarLayoutData({
							priority: OverflowToolbarPriority.NeverOverflow
						})
					);

					that._objectsRegister[sOverflowToolbarFactoryFunctionName] = function (bIsDestroying) {
						if (!bIsDestroying) {
							setup();
						}
						return oOverflowToolbar;
					};

					return oOverflowToolbar;
				};
			};

			PDFViewer.prototype._initToolbarDownloadButtonControl = function () {
				var that = this,
					sButtonId = this.getId() + "-toolbarDownloadButton",
					sDownloadButtonFactoryFunctionName = "getToolbarDownloadButtonControl";

				this._objectsRegister[sDownloadButtonFactoryFunctionName] = function (bIsDestroying) {
					if (bIsDestroying) {
						return null;
					}

					var oButton = new OverflowToolbarButton(sButtonId, {
						type: ButtonType.Transparent,
						icon: "sap-icon://download"
					});
					oButton.attachPress(that.downloadPDF.bind(that));
					oButton.setEnabled(that._bRenderPdfContent);

					that._objectsRegister[sDownloadButtonFactoryFunctionName] = function () {
						oButton.setEnabled(that._bRenderPdfContent);
						return oButton;
					};

					return oButton;
				};
			};

			PDFViewer.prototype._initPopupDownloadButtonControl = function () {
				var that = this,
					sButtonId = this.getId() + "-popupDownloadButton",
					sDownloadButtonFactoryFunctionName = "getPopupDownloadButtonControl";

				this._objectsRegister[sDownloadButtonFactoryFunctionName] = function () {
					var oButton = new Button(sButtonId, {
						text: that._getLibraryResourceBundle().getText("PDF_VIEWER_DOWNLOAD_TEXT")
					});
					oButton.attachPress(that.downloadPDF.bind(that));
					oButton.setEnabled(that._bRenderPdfContent);

					that._objectsRegister[sDownloadButtonFactoryFunctionName] = function () {
						oButton.setEnabled(that._bRenderPdfContent);
						return oButton;
					};

					return oButton;
				};

			};
		}
	};

	return oPDFViewerRenderManager;
}, true);



