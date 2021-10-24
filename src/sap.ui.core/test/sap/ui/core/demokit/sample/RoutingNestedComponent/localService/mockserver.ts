import MockServer from "sap/ui/core/util/MockServer";
import JSONModel from "sap/ui/model/json/JSONModel";
import Log from "sap/base/Log";
import UriParameters from "sap/base/util/UriParameters";
export class oMockServerInterface {
    static init(oOptionsParameter: any) {
        var oOptions = oOptionsParameter || {};
        return new Promise(function (fnResolve, fnReject) {
            var sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"), oManifestModel = new JSONModel(sManifestUrl);
            oManifestModel.attachRequestCompleted(function () {
                var oUriParameters = new UriParameters(window.location.href), sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath), oMainDataSource = oManifestModel.getProperty("/sap.app/dataSources/mainService"), sMetadataUrl = sap.ui.require.toUrl(_sAppPath + oMainDataSource.settings.localUri), sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";
                if (!oMockServer) {
                    oMockServer = new MockServer({
                        rootUri: sMockServerUrl
                    });
                }
                else {
                    oMockServer.stop();
                }
                MockServer.config({
                    autoRespond: true,
                    autoRespondAfter: (oOptions.delay || oUriParameters.get("serverDelay") || 500)
                });
                oMockServer.simulate(sMetadataUrl, {
                    sMockdataBaseUrl: sJsonFilesUrl,
                    bGenerateMissingMockData: true
                });
                var aRequests = oMockServer.getRequests();
                var fnResponse = function (iErrCode, sMessage, aRequest) {
                    aRequest.response = function (oXhr) {
                        oXhr.respond(iErrCode, { "Content-Type": "text/plain;charset=utf-8" }, sMessage);
                    };
                };
                if (oOptions.metadataError || oUriParameters.get("metadataError")) {
                    aRequests.forEach(function (aEntry) {
                        if (aEntry.path.toString().indexOf("$metadata") > -1) {
                            fnResponse(500, "metadata Error", aEntry);
                        }
                    });
                }
                var sErrorParam = oOptions.errorType || oUriParameters.get("errorType"), iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
                if (sErrorParam) {
                    aRequests.forEach(function (aEntry) {
                        fnResponse(iErrorCode, sErrorParam, aEntry);
                    });
                }
                oMockServer.setRequests(aRequests);
                oMockServer.start();
                Log.info("Running the app with mock data");
                fnResolve();
            });
            oManifestModel.attachRequestFailed(function () {
                var sError = "Failed to load application manifest";
                Log.error(sError);
                fnReject(new Error(sError));
            });
        });
    }
    static getMockServer(...args: any) {
        return oMockServer;
    }
}
var oMockServer, _sAppPath = "sap/ui/core/sample/RoutingNestedComponent/", _sJsonFilesPath = _sAppPath + "localService/mockdata";