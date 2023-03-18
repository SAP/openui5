sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon",
	"require"
], function (ManagedObject, jQuery, sinon, require) {
	"use strict";

	return ManagedObject.extend("sap.m.sample.UploadSetCloudUpload.mockserver.mockServer", {
		started: null,
		init: function () {
			this.started = jQuery.get(require.toUrl("./FileShareItems.json")).then(function (data, status, jqXHR) {
				this.mockData = data;
				return jQuery.get(require.toUrl("./metadata.xml"));
			}.bind(this)).then(function (data, status, jqXHR) {
				this.metadata = jqXHR.responseText;

				var oServer = sinon.fakeServer.create();
				oServer.autoRespond = true;
				oServer.xhr.useFilters = true;

				oServer.xhr.addFilter(function (method, url) {
					// whenever the this returns true the request will not faked
					return !url.match(/\/sap\/opu\/odata4\//);
				});
				var metaData = this.metadata;
				var mockData = this.mockData;
				generateResponse(oServer);
				function generateResponse(oServer) {
					oServer.respondWith("GET", RegExp("/sap","i"), function (xhr, id) {
						if (xhr.url.indexOf("metadata") > -1) {
							return xhr.respond(200, {
								"Content-Type": "application/xml",
								"OData-Version": "4.0"
							}, metaData);
						}
					});
					oServer.respondWith("POST", RegExp("/sap","i"), function (xhr, id) {
						var rBatch = new RegExp("\\$batch([?#].*)?");
						var obj = {};
						obj['@odata.context'] = mockData["@odata.context"];
						obj['@odata.metadataEtag'] = mockData["@odata.metadataEtag"];

						if (xhr.requestBody.includes("FileShareItems(FileShare='ZPERSONAL',FileShareItem='0ACGgV1bbQGeXUk9PVA')/_Children")) {
							obj['value'] = mockData['fileShareItemsChildrenValue'];
							fnGetBatchData(xhr, rBatch, obj);
						} else {
							obj['value'] = mockData['value'];
							if (xhr.requestBody.includes("GET FileShares") || xhr.requestBody.includes("GET FileShares('ZPERSONAL')/_Root")) {
								fnGetBatchData(xhr, rBatch, obj);
							}
						}
					});

					function fnGetBatchData(xhr, rBatch, mockData) {
						if (rBatch.test(xhr.url)) {
							var sRequestBody = xhr.requestBody;
							var oBoundaryRegex = new RegExp("--batch_[a-z0-9-]*");
							//Check for boudaries of the request
							var sBoundary = oBoundaryRegex.exec(sRequestBody)[0];
							if (sBoundary) {
								//split requests by boundary
								var aBatchRequests = sRequestBody.split(sBoundary);
								// var sServiceURL = xhr.url.split("$")[0];
								var rGet = new RegExp("GET (.*) HTTP");
								var sRespondData = "--165E5739E3F501AD01EF9E72DC8ED0870";
								//Processing requests
								aBatchRequests.forEach(function (sBatchRequest, index) {
									//Processing GET requests of the batch
									if (rGet.exec(sBatchRequest)) {
										var sResponseString;
										//Getting JSON Data and creating the Response string

										// var oResponse = fnGetResponseData(sServiceURL + rGet.exec(sBatchRequest)[1], oApp);
										var oResponse = mockData;
										if (xhr.url.indexOf("$count") !== -1) {
											sResponseString = fnBuildResponseString(oResponse, "text/plain");
										} else {
											sResponseString = fnBuildResponseString(oResponse);
										}
										// sRespondData =
										// 	`${sRespondData}\r\nContent-Type: application/http\r\n` +
										// 	`Content-Length: ${sResponseString.length}\r\n` +
										// 	`content-transfer-encoding: binary\r\n\r\n${sResponseString}--165E5739E3F501AD01EF9E72DC8ED0870`;
										sRespondData =
											sRespondData + "\r\n" + "Content-Type: application/http" + "\r\n" +
											"Content-Length:" + sResponseString.length + "\r\n" +
											"content-transfer-encoding: binary" + "\r\n\r\n" + sResponseString + "--165E5739E3F501AD01EF9E72DC8ED0870";
									}
								});
								sRespondData += "--";
								//Trigger the final response
								return xhr.respond(
									200,
									{ "Content-Type": "multipart/mixed; boundary=165E5739E3F501AD01EF9E72DC8ED0870", "OData-Version": "4.0" },
									sRespondData
								);
							}
						}
					}
				}

				// Building string for each GET response in $batch request
				function fnBuildResponseString(oResponse, sContentType) {
					var sResponseData;

					sResponseData = JSON.stringify(oResponse) || "";
					// default the content type to application/json
					sContentType = sContentType || "application/json;ieee754compatible=true;odata.metadata=minimal";

					// if a content type is defined we override the incoming response content type
					return (
						'HTTP/1.1 ' +
						'200 OK' +
						'\r\nContent-Type:' + sContentType + '\r\nContent-Length: ' + sResponseData.length + '\r\nodata-version: 4.0' +
						'\r\ncache-control: no-cache, no-store, must-revalidate\r\n\r\n' + sResponseData + '\r\n'
					);
				}
			}.bind(this));
		}
	});
}, true);
