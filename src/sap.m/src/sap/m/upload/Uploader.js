/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/core/util/File",
	"sap/ui/Device",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/UploaderHttpRequestMethod"
], function (Log, MobileLibrary, Element, FileUtil, Device, UploadSetItem, UploaderHttpRequestMethod) {
	"use strict";

	/**
	 * Constructor for a new Uploader.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A basic implementation for uploading and downloading one or multiple files.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.63
	 * @alias sap.m.upload.Uploader
	 */
	var Uploader = Element.extend("sap.m.upload.Uploader", {
		metadata: {
			library: "sap.m",

			properties: {
				/**
				 * URL where the next file is going to be uploaded to.
				 */
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * URL where the next file is going to be download from.
				 */
				downloadUrl: {type: "string", defaultValue: null},
				/**
				 * HTTP request method chosen for file upload.
				 * @since 1.90
				 */
				httpRequestMethod: {type: "sap.m.upload.UploaderHttpRequestMethod", defaultValue: UploaderHttpRequestMethod.Post},
				/**
				* This property decides the type of request. If set to "true", the request gets sent as a multipart/form-data request instead of file only request.
				* @since 1.92
				*/
				useMultipart: { type: "boolean", defaultValue: false }
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
						loaded: {type: "int"},
						/**
						 * The total number of bytes of content that will be transferred during the operation.
						 * If the total size is unknown, this value is zero.
						 */
						total: {type: "int"}
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
						item: {type: "sap.m.upload.UploadSetItem"},
						/**
						 * A JSON object containing the additional response parameters like response, responseXML, readyState, status and headers.
						 * <i>Sample response object:</i>
						 * <pre><code>
						 * {
						 *    response: "<!DOCTYPE html>\n<html>...</html>\n",
						 *    responseXML: null,
						 *    readyState: 2,
						 *    status: 404,
						 *    headers: "allow: GET, HEAD"
						 * }
						 * </code></pre>
						 */
						responseXHR: {type: "object"}
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
		var sHttpRequestMethod = this.getHttpRequestMethod();

		return new Promise(function(resolve, reject) {
			oXhr.open(sHttpRequestMethod, sUrl, true);

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
			},
			sHttpRequestMethod = this.getHttpRequestMethod(),
			sUploadUrl = oItem.getUploadUrl() || this.getUploadUrl();

		oXhr.open(sHttpRequestMethod, sUploadUrl, true);

		if (aHeaderFields) {
			aHeaderFields.forEach(function (oHeader) {
				oXhr.setRequestHeader(oHeader.getKey(), oHeader.getText());
			});
		}

		if (this.getUseMultipart()) {
			var oFormData = new window.FormData();
			var name = oFile ? oFile.name : null;
			if (oFile instanceof window.Blob && name) {
				oFormData.append(name, oFile, oFile.name);
			} else {
				oFormData.append(name, oFile);
			}
			oFormData.append("_charset_", "UTF-8");
			oFile = oFormData;
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
			var oHandler = that._mRequestHandlers[oItem.getId()],
				oResponseXHRParams = {};
			if (this.readyState === window.XMLHttpRequest.DONE && !oHandler.aborted) {
				oResponseXHRParams = {
					"response": this.response,
					"responseXML": this.responseXML,
					"readyState": this.readyState,
					"status": this.status,
					"headers": this.getAllResponseHeaders()
				};
				that.fireUploadCompleted({item: oItem, responseXHR: oResponseXHRParams});
			}
		};

		this._mRequestHandlers[oItem.getId()] = oRequestHandler;
		oXhr.send(oFile);
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