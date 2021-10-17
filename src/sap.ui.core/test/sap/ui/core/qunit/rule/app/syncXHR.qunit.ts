import Log from "sap/base/Log";
import Control from "sap/ui/core/Control";
import Component from "sap/ui/core/Component";
import IconPool from "sap/ui/core/IconPool";
import AppCacheBuster from "sap/ui/core/AppCacheBuster";
import Manifest from "sap/ui/core/Manifest";
import Fragment from "sap/ui/core/Fragment";
import XMLComposite from "sap/ui/core/XMLComposite";
import sinon from "sap/ui/thirdparty/sinon";
import jQuery from "sap/ui/thirdparty/jquery";
import testRule from "test-resources/sap/ui/support/TestHelper";
import createAndAppendDiv from "sap/ui/qunit/utils/createAndAppendDiv";
Log.setLevel(4);
createAndAppendDiv("content");
var iIncrement = 0;
var fnIncrement = function (iNumber) {
    return function () {
        iIncrement += iNumber;
        return iIncrement;
    };
};
QUnit.module("Renderer", {
    beforeEach: function (assert) {
        assert.ok(sap.ui.getCore().isInitialized(), "Core must be initialized");
        return new Promise(function (resolve) {
            var No = Control.extend("NoRendererControl", {
                metadata: {
                    properties: {}
                }
            });
            var n = new No();
            n.placeAt("content");
            try {
                sap.ui.getCore().applyChanges();
            }
            catch (e) {
                assert.ok(e, "404 should be fired for '" + e.message + "'");
                resolve();
            }
        });
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "globalSyncXHR",
    async: true,
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("IconPool.getIconInfo", {
    beforeEach: function () {
        this.jQueryAjaxStub = sinon.stub(jQuery, "ajax").returns();
        var oTNTConfig = {
            fontFamily: "SAP-icons-TNT",
            fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
        };
        IconPool.registerFont(oTNTConfig);
        IconPool.getIconInfo("sap-icon://SAP-icons-TNT/technicalsystem");
    },
    afterEach: function (assert) {
        assert.equal(this.jQueryAjaxStub.callCount, 2, "1 for IconPool.registerFont, 1 for IconPool.getIconInfo");
        this.jQueryAjaxStub.restore();
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "globalSyncXHR",
    async: true,
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("Manifest.load", {
    beforeEach: function () {
        this.jQueryAjaxStub = sinon.stub(jQuery, "ajax").returns();
        Manifest.load({ manifestUrl: "my/manifest.json" });
    },
    afterEach: function (assert) {
        assert.equal(this.jQueryAjaxStub.callCount, 1);
        this.jQueryAjaxStub.restore();
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "globalSyncXHR",
    async: true,
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("Core#getTemplate", {
    beforeEach: function () {
        this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
        sap.ui.getCore().getTemplate();
    },
    afterEach: function (assert) {
        assert.equal(this.requireSyncStub.callCount, 1);
        this.requireSyncStub.restore();
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "globalSyncXHR",
    async: true,
    expectedNumberOfIssues: fnIncrement(1)
});
QUnit.module("Core#getEventBus", {
    beforeEach: function () {
        this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
        this.requireStub = sinon.stub(sap.ui, "require").returns(undefined);
        sap.ui.getCore().getEventBus();
        this.requireSyncStub.restore();
        this.requireStub.restore();
    },
    afterEach: function (assert) {
        assert.equal(this.requireSyncStub.callCount, 1);
        this.requireSyncStub.restore();
        this.requireStub.restore();
    }
});
testRule({
    executionScopeType: "global",
    libName: "sap.ui.core",
    ruleId: "globalSyncXHR",
    async: true,
    expectedNumberOfIssues: fnIncrement(1)
});