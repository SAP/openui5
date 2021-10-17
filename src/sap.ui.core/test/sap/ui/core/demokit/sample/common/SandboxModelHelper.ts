import UriParameters from "sap/base/util/UriParameters";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import TestUtils from "sap/ui/test/TestUtils";
import sinon from "sap/ui/thirdparty/sinon-4";
export class SandboxModelHelper {
    static adaptModelParameters(mParameters: any, sUpdateGroupId: any) {
        var oUriParameters = UriParameters.fromQuery(window.location.search);
        return Object.assign({}, mParameters, {
            earlyRequests: oUriParameters.get("earlyRequests") !== "false",
            groupId: oUriParameters.get("$direct") ? "$direct" : mParameters.groupId,
            serviceUrl: mParameters.serviceUrl,
            updateGroupId: sUpdateGroupId || oUriParameters.get("updateGroupId") || mParameters.updateGroupId
        });
    }
    static adaptModelParametersAndCreateModel(mModelParameters: any, oMockData: any) {
        return SandboxModelHelper.createModel(SandboxModelHelper.adaptModelParameters(mModelParameters), oMockData);
    }
    static createModel(mModelParameters: any, oMockData: any) {
        var oModel, oSandbox;
        if (!TestUtils.isRealOData()) {
            oSandbox = sinon.sandbox.create();
            TestUtils.setupODataV4Server(oSandbox, oMockData.mFixture, oMockData.sSourceBase, oMockData.sFilterBase);
        }
        oModel = new ODataModel(mModelParameters);
        if (oSandbox) {
            oModel.destroy = function () {
                if (oSandbox) {
                    oSandbox.restore();
                    oSandbox = undefined;
                }
                return ODataModel.prototype.destroy.apply(this, mModelParameters);
            };
        }
        return oModel;
    }
}