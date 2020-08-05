/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/core/util/File",
	"sap/ui/Device",
	"sap/ui/core/Item",
	"sap/m/upload/UploadSetItem"
], function (Log, MobileLibrary, Element, FileUtil, Device, HeaderField, UploadSetItem) {
	"use strict";

	/**
	 * Constructor for a new Uploader.
	 *
	 * @class
	 * A basic implementation for uploading and downloading one or multiple files.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.62
	 * @alias sap.m.upload.Uploader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Uploader = Element.extend("sap.m.upload.Uploader", {
		metadata: {
			library: "sap.m",
			publicMethods: [
				"uploadItem",
				"terminateItem",
				"downloadItem"
			],
			properties: {
				/**
				 * URL where the next file is going to be uploaded to.
				 */
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * URL where the next file is going to be download from.
				 */
				downloadUrl: {type: "string", defaultValue: null}
			},
			events: {
				/**
				 * The event is fired just after the POST request was sent.
				 */
				uploadStarted: {
					parameters: {
						/**
						 * The item that is going to be uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * The event is fired every time an XHR request reports progress in uploading.
				 */
				uploadProgressed: {
					parameters: {
						/**
						 * The item that is being uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetItem"},
						/**
						 * The number of bytes transferred since the beginning of the operation.
						 * This doesn't include headers and other overhead, but only the content itself
						 */
						loaded: {type: "long"},
						/**
						 * The total number of bytes of content that will be transferred during the operation.
						 * If the total size is unknown, this value is zero.
						 */
						total: {type: "long"}
					}
				},
				/**
				 * The event is fired when an XHR request reports successful completion of upload process.
				 */
				uploadCompleted: {
					parameters: {
						/**
						 * The item that was uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * The event is fired when an XHR request reports its abortion.
				 */
				uploadAborted: {
					parameters: {
						/**
						 * The item that is going to be deleted.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				}
			}
		}
	});

	Uploader.prototype.init = function () {
		this._mRequestHandlers = {};
	};

	/**
	 * Starts function for uploading one file object to given url. Returns promise that resolves when the upload is finished or rejects when the upload fails.
	 *
	 * @param {File|Blob} oFile File or Blob object to be uploaded.
	 * @param {string} sUrl Upload Url.
	 * @param {sap.ui.core.Item[]} [aHeaderFields] Collection of request header fields to be send along.
	 * @returns {Promise} Promise that resolves when the upload is finished or rejects when the upload fails.
	 * @public
	 */
	Uploader.uploadFile = function (oFile, sUrl, aHeaderFields) {
		var oXhr = new window.XMLHttpRequest();

		return new Promise(function(resolve, reject) {
			oXhr.open("POST", sUrl, true);

			if ((Device.browser.edge || Device.browser.internet_explorer) && oFile.type && oXhr.readyState === 1) {
				oXhr.setRequestHeader("Content-Type", oFile.type);
			}

			if (aHeaderFields) {
				aHeaderFields.forEach(function (oHeader) {
					oXhr.setRequestHeader(oHeader.getKey(), oHeader.getText());
				});
			}

			oXhr.onreadystatechange = function () {
				if (this.readyState === window.XMLHttpRequest.DONE) {
					if (this.status === 200) {
						resolve(this);
					} else {
						reject(this);
					}
				}
			};

			oXhr.send(oFile);
		});
	};

	/**
	 * Starts the process of uploading the specified file.
	 *
	 * @param {sap.m.upload.UploadSetItem} oItem Item representing the file to be uploaded.
	 * @param {sap.ui.core.Item[]} [aHeaderFields] Collection of request header fields to be send along.
	 * @public
	 */
	Uploader.prototype.uploadItem = function (oItem, aHeaderFields) {
		var oXhr = new window.XMLHttpRequest(),
			oFile = oItem.getFileObject(),
			that = this,
			oRequestHandler = {
				xhr: oXhr,
				item: oItem
			};

		oXhr.open("POST", this.getUploadUrl(), true);

		if ((Device.browser.edge || Device.browser.internet_explorer) && oFile.type && oXhr.readyState === 1) {
			oXhr.setRequestHeader("Content-Type", oFile.type);
		}

		if (aHeaderFields) {
			aHeaderFields.forEach(function (oHeader) {
				oXhr.setRequestHeader(oHeader.getKey(), oHeader.getText());
			});
		}

		oXhr.upload.addEventListener("progress", function (oEvent) {
			that.fireUploadProgressed({
				item: oItem,
				loaded: oEvent.loaded,
				total: oEvent.total,
				aborted: false
			});
		});

		oXhr.onreadystatechange = function () {
			var oHandler = that._mRequestHandlers[oItem.getId()];
			if (this.readyState === window.XMLHttpRequest.DONE && !oHandler.aborted) {
				that.fireUploadCompleted({item: oItem});
			}
		};

		this._mRequestHandlers[oItem.getId()] = oRequestHandler;
		oXhr.send(oItem.getFileObject());
		this.fireUploadStarted({item: oItem});
	};

	/**
	 * Attempts to terminate the process of uploading the specified file.
	 *
	 * @param {sap.m.upload.UploadSetItem} oItem Item representing the file whose ongoing upload process is to be terminated.
	 * @public
	 */
	Uploader.prototype.terminateItem = function (oItem) {
		var oHandler = this._mRequestHandlers[oItem.getId()],
			that = this;

		oHandler.xhr.onabort = function () {
			oHandler.aborted = false;
			that.fireUploadAborted({item: oItem});
		};
		oHandler.aborted = true;
		oHandler.xhr.abort();
	};

	/**
	 * Starts the process of downloading a file.
	 *
	 * @param {sap.m.upload.UploadSetItem} oItem Item representing the file to be downloaded.
	 * @param {sap.ui.core.Item[]} aHeaderFields List of header fields to be added to the GET request.
	 * @param {boolean} bAskForLocation True if the location to where download the file should be first queried by a browser dialog.
	 * @return {boolean} True if the download process successfully
	 * @public
	 */
	Uploader.prototype.downloadItem = function (oItem, aHeaderFields, bAskForLocation) {
		var sUrl = this.getDownloadUrl() || oItem.getUrl();

		// File.save doesn't work in Safari but URLHelper.redirect does work.
		// So, this overwrites the value of bAskForLocation in order to make it work.
		if (Device.browser.name === "sf") {
			bAskForLocation = false;
		}
		if (!oItem.getUrl()) {
			Log.warning("Items to download do not have a URL.");
			return false;
		} else if (bAskForLocation) {
			var oBlob = null,
				oXhr = new window.XMLHttpRequest();
			oXhr.open("GET", sUrl);

			aHeaderFields.forEach(function (oHeader) {
				oXhr.setRequestHeader(oHeader.getKey(), oHeader.getText());
			});

			oXhr.responseType = "blob"; // force the HTTP response, response-type header to be blob
			oXhr.onload = function () {
				var sFileName = oItem.getFileName(),
					oSplit = UploadSetItem._splitFileName(sFileName, false);
				oBlob = oXhr.response;
				FileUtil.save(oBlob, oSplit.name, oSplit.extension, oItem.getMediaType(), "utf-8");
			};
			oXhr.send();
			return true;
		} else {
			MobileLibrary.URLHelper.redirect(sUrl, true);
			return true;
		}
	};

	return Uploader;
});