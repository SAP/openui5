import History from "sap/ui/core/routing/History";
import HashChanger from "sap/ui/core/routing/HashChanger";
import Deferred from "sap/base/util/Deferred";
import EventProvider from "sap/ui/base/EventProvider";
var oReady = new Deferred();
var oHashChanger = HashChanger.getInstance();
oHashChanger.init();
var oHistory = History.getInstance();
var oHashSynchronizer = new EventProvider();
var iFrameId = "iframe1";
var mActions = {
    updateHash: function (oEvent) {
        var sHash = oEvent.data.hash, sDirection = oEvent.data.direction;
        if (sHash === oHashChanger.getHash()) {
            oHashSynchronizer.fireEvent("finish");
        }
        else {
            oHashChanger.replaceHash(sHash, sDirection);
        }
    },
    iFrameInit: function (oEvent) {
        var sHash = oHashChanger.getHash();
        document.getElementById(iFrameId).contentWindow.postMessage({
            action: "updateHash",
            hash: sHash
        }, "*");
    },
    iFrameReady: function (oEvent) {
        oReady.resolve();
    }
};
window.addEventListener("message", function (oEvent) {
    var oData = oEvent.data;
    if (oData.action && mActions[oData.action]) {
        mActions[oData.action](oEvent);
    }
});
oHashChanger.attachEvent("hashChanged", function (oEvent) {
    var sHash = oEvent.getParameter("newHash");
    document.getElementById(iFrameId).contentWindow.postMessage({
        action: "updateHash",
        hash: sHash,
        direction: oHistory.getDirection()
    }, "*");
});
var oParentDOM = document.getElementById("qunit-fixture");
var oIFrame = document.createElement("iframe");
oIFrame.width = "100%";
oIFrame.height = "400px";
oIFrame.src = "fixture/historyIframe/iframe/index.html";
oIFrame.id = iFrameId;
oParentDOM.appendChild(oIFrame);