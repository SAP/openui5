sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon",
	"require",
	'sap/base/util/uid'
], function (ManagedObject, sinon, require, uid) {
	"use strict";

	// mockserver to intercept the XMLHTTP requests and respond with custom data
	return ManagedObject.extend("responsiveFileDialogs.table.model.mockServer", {
		started: null,
		oModel: null,
		server: null,
		init: function () {
		},
		_updateModelWithData: function(oResponse, oExistingModelDataToUpdate, sMode, oFile, sUrl, oData) {
			switch (sMode) {

				case "Create":
					this.oModel.getProperty("/items").unshift(
						{
							"id": oResponse && oResponse.id ? oResponse.id : uid(), // generate random id if no id sent from response.
							"fileName": oResponse.fileName,
							"mediaType": oResponse.fileType,
							"url": oResponse.fileUrl,
							"uploadState": "Complete",
							"revision": "00",
							"status": "In work",
							"fileSize": oResponse.fileSize,
							"lastModifiedBy": "Jane Burns",
							"lastmodified": "10/03/21, 10:03:00 PM",
							"documentType": oResponse && oResponse.documentType ? oResponse.documentType : "Invoice"
						}
					);
					break;

				case "update":
					if (oExistingModelDataToUpdate) {
						oExistingModelDataToUpdate.fileName = oFile && oFile.name ? oFile.name : "";
						oExistingModelDataToUpdate.url = sUrl;
						oExistingModelDataToUpdate.fileSize = oFile && oFile.size ? oFile.size : 0;
						oExistingModelDataToUpdate.mediaType = oFile && oFile.type ? oFile.type : "";
						this.oModel.setData(oData);
					}
					break;

				default:
					break;
			}
		},
		start: function() {
			this.server = sinon.fakeServer.create();
			var that = this;

			this.server = sinon.fakeServer.create();
				this.server.autoRespond = true;
				this.server.xhr.useFilters = true;

				/**
				 * Adding filters to only intercept and fake "/upload" API requests and to ignore other requests
				 */
				this.server.xhr.addFilter(function (method, url) {
					// whenever this returns true the request will not faked
					return !url.match(/\/uploadFiles/); // request url's not matching path "/upload" will be ignored
				});

			/**
			 * Intercepting file upload requests for the purpose of mocking the response.
			 * Please note this is mocked response to simulate sucessful file uploads and the structure of the response is for demonstration purpose.
			 */
			this.server.respondWith("POST", RegExp("/uploadFiles","i"), function (xhr) {
				// intercepting the request body sent to the request and extracting the details for the mocked response.
				var oFile = xhr.requestBody ? xhr.requestBody : null;
				var aRequestArray = [];
				var requestHeaders = xhr.requestHeaders || {};
				// extract request headers
				for (var key in requestHeaders) {
					if (requestHeaders.hasOwnProperty(key)) {
					  var newObj = {};
					  newObj[key] = requestHeaders[key];
					  aRequestArray.push(newObj);
					}
				}

				var iExistingDocumentId = requestHeaders.existingDocumentID;
				var data = that.oModel && that.oModel.getData ? that.oModel.getData() : {};
				var oExistingfileObjectData = null;

				if (data && data.items && iExistingDocumentId) {
					oExistingfileObjectData = data.items.find(function(item){
						return item.id === iExistingDocumentId;
					});
				}

				// if uploading document via URL then set the URL set by the user to the document else simulate creating the URL with file object.
				var url = requestHeaders && requestHeaders.documentUrl ? requestHeaders.documentUrl : URL.createObjectURL(oFile);
				var fileId = uid(); // generating random id

				if (fileId) {
					fileId = fileId.split("-")[1]; // extracting the timestamp for the ID
				}

				var reponseObject = {
					id: fileId ? fileId : uid(),
					fileName: oFile && oFile.name ? oFile.name : "",
					fileUrl: url,
					fileSize: oFile && oFile.size ? oFile.size : 0,
					fileType: oFile && oFile.type ? oFile.type : "",
					documentType: requestHeaders && requestHeaders.documentType ? requestHeaders.documentType : null
				};

				// Updating the model simulating the backend process
				if (!oExistingfileObjectData) {
					that._updateModelWithData(reponseObject, null, "Create", oFile, url, data);
				} else {
					//this scenario is to simulate the upload of the empty document.
					that._updateModelWithData(reponseObject, oExistingfileObjectData, "update", oFile, url, data);
				}

				return xhr.respond(201, { "Content-Type": "application/json" },
				JSON.stringify(reponseObject));
			});
		},
		restore: function() {
			this.server.restore();
		}
	});
});
