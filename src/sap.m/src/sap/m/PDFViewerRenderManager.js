/*!
 * ${copyright}
 */

sap.ui.define("sap/m/PDFViewerRenderManager", [
	"jquery.sap.global",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/MessagePage"
], function ($, Dialog, Button, Link, MessagePage) {
	"use strict";

	var oPDFViewerRenderManager = {
		extendPdfViewer: function (PDFViewer) {

			/**
			 * Creates factory method that lazily creates dialog and holds the reference on it.
			 *
			 * @param oOptions
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

				this._objectsRegister[sPopupFactoryFunctionName] = function () {
					var oPopup = new Dialog(sPopupId, oOptions);

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
					oCloseButton = this._objectsRegister.getPopupCloseButton();
				oCloseButton.setText(this._getLibraryResourceBundle().getText("PDF_VIEWER_POPUP_CLOSE_BUTTON"));

				aButtons.push(oCloseButton);
				oPopup.removeAllButtons();
				aButtons.forEach(function (oButton) {
					oPopup.addButton(oButton);
				});

				if (this.getPopupHeaderTitle()) {
					// show header only when header title is set
					oPopup.setShowHeader(true);
					oPopup.setTitle(this.getPopupHeaderTitle());
				} else {
					oPopup.setShowHeader(false);
				}
			};

			PDFViewer.prototype._initPlaceholderLinkControl = function () {
				var that = this,
					sLinkFactoryFunctionName = "getPlaceholderLinkControl";

				this._objectsRegister[sLinkFactoryFunctionName] = function () {
					var oLink = new Link({
						href: that.getSource(),
						text: that._getLibraryResourceBundle().getText("PDF_VIEWER_DOWNLOAD_TEXT")
					});

					that._objectsRegister[sLinkFactoryFunctionName] = function () {
						oLink.setHref(that.getSource());

						return oLink;
					};

					return oLink;
				};
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
		}
	};


	return oPDFViewerRenderManager;
}, true);



