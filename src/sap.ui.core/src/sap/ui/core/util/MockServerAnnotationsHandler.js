/*
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/util/MockServer', 'sap/ui/model/odata/ODataModel', 'jquery.sap.xml'],
	function(MockServer, ODataModel) {
		"use strict";
		return {

			parse: function(oMetadata, sMetadata) {
				if (!this._index) {
					this._index = 0;
				}
				var sUri = "/annotationhandler" + this._index++ + "/";
				var oMockStub = new MockServer({
					rootUri: sUri,
					requests: [{
						method: "GET",
						path: new RegExp("\\$metadata"),
						response: function(oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, sMetadata);
						}
					}]
				});
				oMockStub.start();

				var mModelOptions = {
					annotationURI: [
						sUri + "$metadata"
					],
					json: true
				};

				var oModel = new ODataModel(sUri, mModelOptions);
				var oAnnotations = oModel.getServiceAnnotations();
				oMockStub.destroy();
				return oAnnotations;
			}
		};

	}, /* bExport= */ true);