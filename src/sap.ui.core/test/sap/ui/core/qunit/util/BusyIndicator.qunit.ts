import BusyIndicator from "sap/ui/core/BusyIndicator";
QUnit.module("BusyIndicatorTests", {
    beforeEach: function () {
        this.iPopupDelay = 10;
        this.oSpyShow = sinon.spy(BusyIndicator, "show");
        this.oSpyShowNowIfRequested = sinon.spy(BusyIndicator, "_showNowIfRequested");
        this.oSpyOnOpen = sinon.spy(BusyIndicator, "_onOpen");
        this.sClass = ".sapUiLocalBusyIndicator";
        if (jQuery.sap.getUriParameters().get("sap-ui-theme") == "sap_goldreflection") {
            this.sClass = ".sapUiBusy";
        }
    },
    afterEach: function () {
        BusyIndicator.hide();
        this.oSpyShow.restore();
        this.oSpyShowNowIfRequested.restore();
        this.oSpyOnOpen.restore();
    }
});
QUnit.test("Check existance", function (assert) {
    var done = assert.async();
    assert.equal(jQuery(".sapUiBusy").length, 0, "BusyIndicator should not exist initially");
    BusyIndicator.show();
    var oBusyDOM = jQuery(this.sClass).get(0);
    assert.equal(oBusyDOM, undefined, "BusyIndicator DOM must not exist before the default timeout of 1000ms is reached");
    setTimeout(function () {
        assert.equal(jQuery(this.sClass).length, 1, "BusyIndicator should exist after 1000ms delay");
        done();
    }.bind(this), 1200);
});
QUnit.test("Check DOM structure", function (assert) {
    BusyIndicator.show(0);
    assert.equal(jQuery(this.sClass).length, 1, "BusyIndicator should exist after immediate show");
    assert.equal(BusyIndicator.oDomRef.children.length, 2, "DOM contains container and busy element");
    var $Container = jQuery(BusyIndicator.oDomRef.children[0]);
    assert.ok($Container.hasClass("sapUiBusy"), "DOM contains the busy container");
    var oStatic = sap.ui.getCore().getStaticAreaRef();
    oStatic = sap.ui.getCore().getUIArea(oStatic);
    assert.equal(oStatic.getRootNode(), $Container.parent().parent().get(0), "Busy indicator attached to static UI-area");
    var $BusyElement = jQuery(BusyIndicator.oDomRef.children[1]);
    assert.ok($BusyElement.hasClass("sapUiLocalBusyIndicator"), "DOM contains the busy element");
    var $AnimationContainer = jQuery($BusyElement.children());
    assert.ok($AnimationContainer.hasClass("sapUiLocalBusyIndicatorAnimation"), "Animation container exists");
    assert.equal($AnimationContainer.children().length, 3, "Elements for animation exist");
});
QUnit.test("Close Before Opening", function (assert) {
    BusyIndicator.hide();
    var done = assert.async();
    setTimeout(function () {
        assert.ok(true, "");
        done();
    }, this.iPopupDelay);
});
QUnit.test("Check BusyIndicator Opened", function (assert) {
    BusyIndicator.show(0);
    var done = assert.async();
    setTimeout(function () {
        var $oLocalBI = jQuery(".sapUiLocalBusyIndicator");
        assert.equal($oLocalBI.length, 1, "'Pulsating Circles' BusyIndicator should exist in DOM after opening");
        assert.ok($oLocalBI.hasClass("sapUiLocalBusyIndicatorFade"), "'Pulsating Circles' BusyIndicator should be visible after opening");
        assert.ok($oLocalBI.hasClass("sapUiLocalBusyIndicatorSizeBig"), "Big Animation should be shown");
        var $Busy = jQuery(this.sClass);
        var bVisible = $Busy.is(":visible") && ($Busy.css("visibility") == "visible");
        assert.ok(bVisible, "BusyIndicator should be visible after opening");
        assert.ok($Busy.css("top") === "0px", "BusyIndicator is positioned at the top of the window");
        done();
    }.bind(this), this.iPopupDelay);
});
QUnit.test("Check BusyIndicator Delay", function (assert) {
    BusyIndicator.show(200);
    var done = assert.async();
    setTimeout(function () {
        assert.expect(2);
        var bHidden = jQuery(this.sClass).css("visibility") == "hidden";
        assert.ok(bHidden, "BusyIndicator should be still invisible directly after opening it with delay");
        setTimeout(function () {
            var bVisible = jQuery(this.sClass).is(":visible") && (jQuery(this.sClass).css("visibility") == "visible");
            assert.ok(bVisible, "BusyIndicator should be visible 600ms after opening with delay=400ms");
            done();
        }.bind(this), 300);
    }.bind(this), 100);
});
QUnit.test("Check BusyIndicator DefaultDelay", function (assert) {
    BusyIndicator.show();
    var done = assert.async();
    setTimeout(function () {
        assert.expect(2);
        var bHidden = jQuery(this.sClass).css("visibility") == "hidden";
        assert.ok(bHidden, "BusyIndicator should be still invisible directly after opening it with delay");
        setTimeout(function () {
            var bVisible = jQuery(this.sClass).is(":visible") && (jQuery(this.sClass).css("visibility") == "visible");
            assert.ok(bVisible, "BusyIndicator should be visible 600ms after opening with delay=400ms");
            done();
        }.bind(this), 1200);
    }.bind(this), 800);
});
QUnit.test("Check BusyIndicator Closed", function (assert) {
    var done = assert.async();
    var fnOpened = function () {
        BusyIndicator.detachOpen(fnOpened, this);
        BusyIndicator.hide();
        setTimeout(function () {
            assert.equal(jQuery(this.sClass).length, 1, "BusyIndicator should exist after first usage");
            var bHidden = jQuery(this.sClass).css("visibility") == "hidden";
            assert.ok(bHidden, "BusyIndicator should be invisible after closing");
            done();
        }.bind(this), this.iPopupDelay);
    };
    BusyIndicator.attachOpen(fnOpened, this);
    BusyIndicator.show(0);
});
QUnit.test("Check Opening Is Idempotent", function (assert) {
    assert.expect(2);
    BusyIndicator.show(0);
    var done = assert.async();
    setTimeout(function () {
        BusyIndicator.show(0);
        setTimeout(function () {
            BusyIndicator.show(0);
            setTimeout(function () {
                assert.equal(jQuery(this.sClass).length, 1, "BusyIndicator should exist once even after opening multiple times");
                var bVisible = jQuery(this.sClass).is(":visible") && (jQuery(this.sClass).css("visibility") == "visible");
                assert.ok(bVisible, "BusyIndicator should be visible after opening (multiple times)");
                done();
            }.bind(this), this.iPopupDelay);
        }.bind(this), this.iPopupDelay);
    }.bind(this), this.iPopupDelay);
});
QUnit.test("Check BusyIndicator Closed After Opened Multiple Times", function (assert) {
    assert.expect(2);
    var done = assert.async();
    BusyIndicator.hide();
    setTimeout(function () {
        assert.equal(jQuery(this.sClass).length, 1, "BusyIndicator should exist once after opening multiple times and closing once");
        var bHidden = jQuery(this.sClass).css("visibility") == "hidden";
        assert.ok(bHidden, "BusyIndicator should be invisible after opening multiple times and closing once");
        done();
    }.bind(this), this.iPopupDelay);
});
QUnit.test("Check Closing Multiple Times", function (assert) {
    assert.expect(1);
    var done = assert.async();
    BusyIndicator.hide();
    setTimeout(function () {
        assert.ok(true);
        done();
    }, this.iPopupDelay);
});
QUnit.test("Check When Opened Event Was Fired", function (assert) {
    var bPopupOpened = false;
    var bBusyOpened = false;
    var done = assert.async();
    var fnBusyOpened = function () {
        BusyIndicator.detachOpen(fnBusyOpened);
        bBusyOpened = true;
        assert.ok(!bPopupOpened && bBusyOpened, "BusyIndicator open-event was fired first");
        setTimeout(function () {
            done();
        }, 0);
    };
    var fnPopupOpened = function () {
        BusyIndicator.oPopup.detachOpened(fnPopupOpened);
        bPopupOpened = true;
        assert.ok(bPopupOpened && bBusyOpened, "Popup open-event was fired second");
    };
    BusyIndicator.show(100);
    BusyIndicator.oPopup.attachOpened(fnPopupOpened);
    BusyIndicator.attachOpen(fnBusyOpened);
});
QUnit.test("Check order of function during open", function (assert) {
    var done = assert.async();
    var fnOpened = function () {
        BusyIndicator.detachOpen(fnOpened, this);
        assert.ok(this.oSpyShow.calledOnce, "'show' was called'");
        assert.ok(this.oSpyShowNowIfRequested.calledOnce, "'_showNowIfRequested' was called'");
        assert.ok(this.oSpyOnOpen.calledOnce, "'_onOpen' was called'");
        assert.ok(this.oSpyShow.calledBefore(this.oSpyShowNowIfRequested), "'show' was called before '_showNowIfRequested'");
        assert.ok(this.oSpyShowNowIfRequested.calledBefore(this.oSpyOnOpen), "'_showNowIfRequested' was called before '_onOpen'");
        done();
    };
    BusyIndicator.attachOpen(fnOpened, this);
    BusyIndicator.show(0);
});