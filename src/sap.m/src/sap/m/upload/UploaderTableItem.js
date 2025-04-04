/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/core/util/File",
	"sap/ui/Device",
	"sap/m/upload/UploaderHttpRequestMethod",
	"sap/m/upload/UploadItem",
	"sap/ui/export/ExportUtils"
], function (Log, MobileLibrary, Element, FileUtil, Device, UploaderHttpRequestMethod, UploadItem, ExportUtils) {
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
	 * @since 1.120
	 * @version ${version}
	 * @alias sap.m.upload.UploaderTableItem
	 */
	var Uploader = Element.extend("sap.m.upload.UploaderTableItem", {
		metadata: {
			library: "sap.m",
			publicMethods: [
				"uploadItem",
				"downloadItem"
			],
			properties: {
				/**
				 * URL where the next file is going to be uploaded to.
				 */
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * URL where the next file is going to be downloaded from.
				 */
				downloadUrl: {type: "string", defaultValue: null},
				/**
				 * HTTP request method chosen for file upload.
				 */
				httpRequestMethod: {type: "sap.m.upload.UploaderHttpRequestMethod", defaultValue: UploaderHttpRequestMethod.Post},
				/**
				* This property decides the type of request. If set to "true", the request gets sent as a multipart/form-data request instead of file only request.
				*/
				useMultipart: { type: "boolean", defaultValue: false }
            },
			events: {
				/**
				 * The event is fired just after the POST request is sent.
				 */
				uploadStarted: {
					parameters: {
						/**
						 * The item {@link sap.m.upload.UploadItem UploadItem} that is going to be uploaded.
						 */
						item: {type: "any"}
					}
				},
				/**
				 * The event is fired every time an XHR request reports progress while uploading.
				 */
				uploadProgressed: {
					parameters: {
						/**
						 * The item {@link sap.m.upload.UploadItem UploadItem} that is being uploaded.
						 */
						item: {type: "any"},
						/**
						 * The number of bytes transferred since the beginning of the operation.
						 * This doesn't include headers and other overhead, but only the content itself
						 */
						loaded: {type: "int"},
						/**
						 * The total number of bytes of content that is transferred during the operation.
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
						 * The item {@link sap.m.upload.UploadItem UploadItem} that was uploaded.
						 */
						item: {type: "any"},
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
				 * The event is fired when an XHR request reports its termination.
				 */
				uploadTerminated: {
					parameters: {
						/**
						 * The item that is going to be deleted.
						 */
						item: {type: "sap.m.upload.UploadItem"}
					}
				}
			}
		}
	});

	Uploader.prototype.init = function () {
		this._mRequestHandlers = {};
	};

	/**
	 * Starts the function for uploading one file object to a given URL. Returns promise that is resolved when the upload is finished, or is rejected when the upload fails.
	 *
	 * @param {File|Blob} oFile File or blob object to be uploaded.
	 * @param {string} sUrl Upload Url.
	 * @param {sap.ui.core.Item[]} [aHeaderFields] Collection of request header fields to be send along.
	 * @returns {Promise} Promise that is resolved when the upload is finished, or is rejected when the upload fails.
	 * @public
	 */
	Uploader.uploadFile = function (oFile, sUrl, aHeaderFields) {
		var oXhr = new window.XMLHttpRequest();
		var sHttpRequestMethod = this.getHttpRequestMethod();

		return new Promise(function(resolve, reject) {
			oXhr.open(sHttpRequestMethod, sUrl, true);

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
	 * @param {sap.m.upload.UploadItem} oItem Item representing the file to be uploaded.
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

		const _isBrowserOffline = () => {
			return !window.navigator.onLine;
		};

		const _fireBrowserOfflineEvent = () => {
			that.fireUploadCompleted({
				item: oItem,
				responseXHR: {
					response: null, // No server response
					responseXML: null,
					responseText: JSON.stringify({
						error: "Internet is offline. Please check your connection and try again."
					}),
					readyState: 4, // Indicates request has been processed (mocking completed state)
					status: 0, // 0 typically indicates a network error
					headers: ""
				}
			});
		};

		oXhr.open(sHttpRequestMethod, sUploadUrl, true);

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
			var oHandler = that._mRequestHandlers[oItem.getId()],
				oResponseXHRParams = {};
			if (this.readyState === window.XMLHttpRequest.DONE && !oHandler.aborted) {
				oResponseXHRParams = {
					"response": this.response,
					"responseXML": this.responseXML,
					"responseText": this.responseText,
					"readyState": this.readyState,
					"status": this.status,
					"headers": this.getAllResponseHeaders()
				};
				that.fireUploadCompleted({item: oItem, responseXHR: oResponseXHRParams});
			}
		};

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

			this._mRequestHandlers[oItem.getId()] = oRequestHandler;
			if (_isBrowserOffline()) {
				this.fireUploadStarted({item: oItem});
				_fireBrowserOfflineEvent();
			} else {
				oXhr.send(oFile);
				this.fireUploadStarted({item: oItem});
			}
		} else {
			this._mRequestHandlers[oItem.getId()] = oRequestHandler;
			if (_isBrowserOffline()) {
				this.fireUploadStarted({item: oItem});
				_fireBrowserOfflineEvent();
			} else {
				oXhr.send(oFile);
				this.fireUploadStarted({item: oItem});
			}
		}

	};

	/**
	 * Starts the process of downloading a file. Plugin uses the URL set in the item or the downloadUrl set in the uploader class to download the file.
	 * If the URL is not set, a warning is logged.
	 * API downloads the file with xhr response of blob type or string type.
	 *
	 * @param {sap.m.upload.UploadItem} oItem Item representing the file to be downloaded.
	 * @param {sap.ui.core.Item[]} aHeaderFields List of header fields to be added to the GET request.
	 * @param {boolean} bAskForLocation If it is true, the location of where the file is to be downloaded is queried by a browser dialog.
	 * @return {boolean} It returns true if the download is processed successfully
	 * @public
	 */
	Uploader.prototype.download = function (oItem, aHeaderFields, bAskForLocation) {
		var sUrl = this.getDownloadUrl() || oItem.getUrl();

		// File.save doesn't work in Safari, however, URLHelper.redirect works.
		// So, this overwrites the value of bAskForLocation in order to make it work.
		if (Device.browser.name === "sf") {
			bAskForLocation = false;
		}
		if (!oItem.getUrl()) {
			Log.warning("Items to download do not have a URL.");
			return false;
		} else if (bAskForLocation) {
			var oResponse = null,
			oXhr = new window.XMLHttpRequest();
			oXhr.open("GET", sUrl);

			aHeaderFields.forEach(function (oHeader) {
				oXhr.setRequestHeader(oHeader.getKey(), oHeader.getText());
			});

			oXhr.responseType = "blob"; // force the HTTP response, response-type header to be blob
			oXhr.onload = function () {
				let targetItem = UploadItem;
				if (oItem instanceof UploadItem) {
					targetItem = UploadItem;
				}
				var sFileName = oItem.getFileName(),
					oSplit = targetItem._splitFileName(sFileName, false);
				oResponse = oXhr.response;
				if (oResponse instanceof window.Blob) {
					const sFullFileName =  `${oSplit.name}.${oSplit.extension}`;
					ExportUtils.saveAsFile(oResponse, sFullFileName);
				} else if (typeof oResponse === "string") {
					FileUtil.save(oResponse, oSplit.name, oSplit.extension, oItem.getMediaType(), "utf-8");
				}
			};
			oXhr.send();
			return true;
		} else {
			MobileLibrary.URLHelper.redirect(sUrl, true);
			return true;
		}
	};

	/**
	 * Attempts to terminate the process of uploading the specified file.
	 *
	 * @param {sap.m.upload.UploadItem} oItem Item representing the file whose ongoing upload process is to be terminated.
	 * @public
	 */
	Uploader.prototype.terminateItem = function (oItem) {
		var oHandler = this._mRequestHandlers[oItem.getId()],
			that = this;

		oHandler.xhr.onabort = function () {
			oHandler.aborted = false;
			that.fireUploadTerminated({item: oItem});
		};
		oHandler.aborted = true;
		oHandler.xhr.abort();
	};

	return Uploader;
});