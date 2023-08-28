sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon",
	"require",
	"sap/base/util/UriParameters"
], function(ManagedObject, sinon, require, UriParameters) {
	"use strict";

	// mockserver to intercept the XMLHTTP requests and respond with custom data
	return ManagedObject.extend("sap.m.sample.UploadSetTable.mockServer", {
		started: null,
		init: function () {

			var fServer = sinon.fakeServer.create();
				fServer.autoRespond = true;
				fServer.xhr.useFilters = true;

				/**
				 * Adding filters to only intercept and fake "/upload" API requests and to ignore other requests
				 */
				fServer.xhr.addFilter(function (method, url) {
					// whenever this returns true the request will not faked
					return !url.match(/\/upload/); // request url's not matching path "/upload" will be ignored
				});

			/**
			 * Intercepting file upload requests for the purpose of mocking the response.
			 * Please note this is mocked response to simulate sucessful file uploads and the structure of the response is for demonstration purpose.
			 */
			fServer.respondWith("POST", RegExp("/upload","i"), function (xhr) {
				// intercepting the request body sent to the request and extracting the details for the mocked response.
				var oFile = xhr.requestBody ? xhr.requestBody.file : null;
				var url = URL.createObjectURL(oFile);
				var aAdditionalFileInfo = xhr.requestBody ? xhr.requestBody.additionalFileInfo : '[]';
				try {
					aAdditionalFileInfo = JSON.parse(aAdditionalFileInfo);
				} catch (error) {
					aAdditionalFileInfo = [];
				}

				var reponseObject = {
					fileName: oFile && oFile.name ? oFile.name : "",
					fileUrl: url,
					fileSize: oFile && oFile.size ? oFile.size : 0,
					fileType: oFile && oFile.type ? oFile.type : "",
					additionalFileInfo: aAdditionalFileInfo
				};
				return xhr.respond(201, { "Content-Type": "application/json" },
				JSON.stringify(reponseObject));
			});
		}
	});
}, true);
