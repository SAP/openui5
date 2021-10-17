import _LogCollector from "sap/ui/test/_LogCollector";
import _OpaLogger from "sap/ui/test/_OpaLogger";
import _resourceWaiter from "sap/ui/test/autowaiter/_resourceWaiter";
import Image from "sap/m/Image";
import Text from "sap/m/Text";
import Panel from "sap/m/Panel";
import BlockLayout from "sap/ui/layout/BlockLayout";
import BlockLayoutRow from "sap/ui/layout/BlockLayoutRow";
import BlockLayoutCell from "sap/ui/layout/BlockLayoutCell";
var oLogCollector = _LogCollector.getInstance();
QUnit.module("ResourceWaiter", {
    beforeEach: function () {
        this.defaultLogLevel = _OpaLogger.getLevel();
        _OpaLogger.setLevel("trace");
        var sBase = "test-resources/sap/ui/core/images/";
        this.sExistingImageSrc = sBase + "Mobile.png";
        this.sNestedImageSrc = sBase + "PC.png";
        this.sReplacerImageSrc = sBase + "Notebook.png";
        this.sNotFoundSrc = sBase + "noSuchImage.jpg";
    },
    afterEach: function () {
        _OpaLogger.setLevel(this.defaultLogLevel);
        oLogCollector.getAndClearLog();
    }
});
function assertPendingStartedAndFinished(sSrc, bPass, assert) {
    var bHasPending = _resourceWaiter.hasPending();
    var sLogs = oLogCollector.getAndClearLog();
    assert.ok(!bHasPending, "Shoud not have pending images");
    assert.ok(sLogs.match("Image with src '.*" + sSrc + "' is pending") || sLogs.match("Image with src '.*" + sSrc + "' is updated and pending again"), "Should have start pending log for image with src " + sSrc);
    assert.ok(sLogs.match("Image with src '.*" + sSrc + (bPass ? "' loaded successfully" : "' failed to load")), "Should have stop pending log for image with src " + sSrc);
}
QUnit.test("Should wait for image to load", function (assert) {
    var fnDone = assert.async();
    var bCompleted = false;
    this.oImageExistingSrc = new Image({
        src: this.sExistingImageSrc,
        load: fnOnComplete.bind(this)
    });
    this.oImageExistingSrc.placeAt("qunit-fixture");
    sap.ui.getCore().applyChanges();
    function fnOnComplete() {
        if (bCompleted) {
            return;
        }
        bCompleted = true;
        setTimeout(function () {
            assertPendingStartedAndFinished(this.sExistingImageSrc, true, assert);
            this.oImageExistingSrc.destroy();
            sap.ui.getCore().applyChanges();
            fnDone();
        }.bind(this), 50);
    }
});
QUnit.test("Should wait for image to load - nested image", function (assert) {
    var fnDone = assert.async();
    var bCompleted = false;
    this.oNestedImage = new Image("nestedImage", {
        src: this.sNestedImageSrc,
        load: fnOnComplete.bind(this)
    });
    this.oText = new Text("headline", {
        text: "Headline"
    });
    this.oPanel = new Panel({
        content: [new BlockLayout({
                content: [new BlockLayoutRow({
                        content: [new BlockLayoutCell({
                                content: [
                                    this.oNestedImage,
                                    this.oText
                                ]
                            })]
                    })]
            })]
    });
    this.oPanel.placeAt("qunit-fixture");
    sap.ui.getCore().applyChanges();
    function fnOnComplete() {
        if (bCompleted) {
            return;
        }
        bCompleted = true;
        setTimeout(function () {
            assertPendingStartedAndFinished(this.sNestedImageSrc, true, assert);
            this.oPanel.destroy();
            sap.ui.getCore().applyChanges();
            fnDone();
        }.bind(this), 50);
    }
});
QUnit.test("Should wait for image to complete with error", function (assert) {
    var bFailed = false;
    var fnDone = assert.async();
    this.oImageWrongSrc = new Image({
        src: this.sNotFoundSrc,
        error: fnOnError.bind(this)
    });
    this.oImageWrongSrc.placeAt("qunit-fixture");
    sap.ui.getCore().applyChanges();
    function fnOnError() {
        if (bFailed) {
            return;
        }
        bFailed = true;
        setTimeout(function () {
            assertPendingStartedAndFinished(this.sNotFoundSrc, false, assert);
            this.oImageWrongSrc.destroy();
            sap.ui.getCore().applyChanges();
            fnDone();
        }.bind(this), 50);
    }
});
QUnit.test("Should wait for image to load when src is changed", function (assert) {
    var fnDone = assert.async();
    var bCompleted = false;
    var bFailed = false;
    this.oImageWrongSrc = new Image({
        src: this.sNotFoundSrc,
        error: fnOnError.bind(this),
        load: fnOnComplete.bind(this)
    });
    this.oImageWrongSrc.placeAt("qunit-fixture");
    sap.ui.getCore().applyChanges();
    function fnOnError() {
        if (bFailed) {
            return;
        }
        bFailed = true;
        setTimeout(function () {
            assertPendingStartedAndFinished(this.sNotFoundSrc, false, assert);
            this.oImageWrongSrc.setSrc(this.sReplacerImageSrc);
            sap.ui.getCore().applyChanges();
        }.bind(this), 50);
    }
    function fnOnComplete() {
        if (bCompleted) {
            return;
        }
        bCompleted = true;
        setTimeout(function () {
            assertPendingStartedAndFinished(this.sReplacerImageSrc, true, assert);
            this.oImageWrongSrc.destroy();
            sap.ui.getCore().applyChanges();
            fnDone();
        }.bind(this), 50);
    }
});