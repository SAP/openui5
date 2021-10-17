import Popup from "sap/ui/core/Popup";
import Log from "sap/base/Log";
import isMouseEventDelayed from "sap/ui/events/isMouseEventDelayed";
import Device from "sap/ui/Device";
import jQuery from "sap/ui/thirdparty/jquery";
import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import EventProvider from "sap/ui/base/EventProvider";
import QUnitUtils from "sap/ui/qunit/QUnitUtils";
import Panel from "sap/m/Panel";
import Button from "sap/m/Button";
import Text from "sap/m/Text";
import ResizeHandler from "sap/ui/core/ResizeHandler";
var oDomRef;
var $Ref;
var oPopup = null;
var lastFocusedId = null;
if (Device.browser.safari) {
    jQuery(document).on("focusin", function (oEvent) {
        var target = oEvent.target;
        lastFocusedId = target.id;
    });
    jQuery(document).on("focusout", function () {
        lastFocusedId = null;
    });
}
QUnit.test("Initial Check", function (assert) {
    assert.ok((Popup !== undefined) && (Popup != null), "Popup class does not exist after being required");
    oDomRef = jQuery.sap.domById("popup");
    assert.ok((oDomRef !== undefined) && (oDomRef != null), "popup div not found");
    $Ref = jQuery.sap.byId("popup");
    assert.ok(($Ref !== undefined) && ($Ref != null), "popup jQuery object not found");
    assert.equal($Ref.length, 1, "popup jQuery object has not exactly one item");
    assert.equal(oPopup, null, "oPopup must be null initially (order of execution problem?)");
});
QUnit.module("Basics", {
    beforeEach: function () {
        this.oDomRef = jQuery.sap.domById("popup");
        this.oPopup = new Popup(this.oDomRef);
        this.$Ref = jQuery.sap.byId("popup");
    },
    afterEach: function () {
        this.oPopup.destroy();
    }
});
QUnit.test("Check If PopupSupport Was Loaded Properly", function (assert) {
    var aMethods = this.oPopup.getMetadata().getPublicMethods();
    assert.ok(aMethods.indexOf("getParentPopup"), "'getParentPopup' was added as public method");
    assert.ok(aMethods.indexOf("isInPopup"), "'isInPopup' was added as public method");
    assert.ok(aMethods.indexOf("getParentPopupId"), "'getParentPopupId' was added as public method");
    assert.ok(aMethods.indexOf("addToPopup"), "'addToPopup' was added as public method");
    assert.ok(aMethods.indexOf("removeFromPopup"), "'removeFromPopup' was added as public method");
    assert.ok(aMethods.indexOf("focusOpener"), "'focusOpener' was added as public method");
});
QUnit.test("Check Amount of Public Methods", function (assert) {
    var oPopup1DomRef = jQuery.sap.domById("popup1");
    var oPopup1 = new Popup(oPopup1DomRef);
    var iMethodsCount1 = oPopup1.getMetadata()._aPublicMethods.length;
    var oPopup2DomRef = jQuery.sap.domById("popup2");
    var oPopup2 = new Popup(oPopup2DomRef);
    var iMethodsCount2 = oPopup2.getMetadata()._aPublicMethods.length;
    assert.equal(iMethodsCount1, iMethodsCount2, "Both Popups must have the same amount of public methods");
});
QUnit.test("Open Popup", function (assert) {
    assert.expect(7);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.$Ref.css("display"), "block", "Popup should be 'display:block' after opening");
        assert.equal(this.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' after opening");
        assert.equal(this.$Ref.css("opacity"), "1", "Popup should be 'opacity:1' after opening");
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    assert.equal(this.oPopup.isOpen(), false, "Popup should not be open initially");
    assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' initially");
    assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' initially");
    this.oPopup.open();
});
QUnit.test("Open Popup with of element set to window", function (assert) {
    assert.expect(8);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.$Ref.css("display"), "block", "Popup should be 'display:block' after opening");
        assert.equal(this.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' after opening");
        assert.equal(this.$Ref.css("opacity"), "1", "Popup should be 'opacity:1' after opening");
        window.setTimeout(function () {
            assert.ok(this.oPopup.isOpen(), "The Popup is still open");
            done();
        }.bind(this), 300);
    };
    this.oPopup.attachOpened(fnOpened, this);
    assert.equal(this.oPopup.isOpen(), false, "Popup should not be open initially");
    assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' initially");
    assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' initially");
    this.oPopup.setFollowOf(true);
    this.oPopup.open(0, undefined, undefined, window);
});
QUnit.test("Open Popup with a control which already has a not rendered parent", function (assert) {
    var oPanel = new sap.m.Panel(), oButton = new sap.m.Button(), done = assert.async(), fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.ok(oButton.getDomRef(), "The button is rendered");
        assert.ok(oButton.getUIArea(), "The button is attached to an UIArea");
        assert.equal(oButton.getParent(), oPanel, "The button is still aggregated by its previous parent");
        this.oPopup.close();
    }, fnClosed = function () {
        assert.ok(!oButton.getUIArea(), "The button is not attached to any UIArea after closed");
        oPanel.destroy();
        done();
    };
    oPanel.addContent(oButton);
    this.oPopup.setContent(oButton);
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.test("Close Popup", function (assert) {
    assert.expect(3);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.close(0);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed);
        assert.equal(this.oPopup.isOpen(), false, "Popup should be closed after closing");
        assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' after closing");
        assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' after closing");
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open(0);
});
QUnit.test("Check 'onAfterRendering' with control and DOM element", function (assert) {
    var done = assert.async();
    var MyControl = Control.extend("MyControl", {
        metadata: {
            properties: {
                "counter": {
                    type: "int",
                    defaultValue: 0
                }
            }
        },
        onAfterRendering: function () {
            if (this.getCounter() > 0) {
                this.$().css("height", "200px");
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                oRm.openStart("div", oControl).style("height", "100px").openEnd().close("div");
            }
        }
    });
    var oControl = new MyControl();
    var oSpyControlAfterRendering = sinon.spy(oControl, "onAfterRendering");
    var oSpyPopAfterRendering = sinon.spy(this.oPopup, "onAfterRendering");
    this.oPopup.setContent(oControl);
    var fnOpened = function () {
        assert.equal(oSpyControlAfterRendering.callCount, 1, "'onAfterRendering' of control was called");
        assert.equal(oControl.$().css("height"), "100px", "Initial height set (100px)");
        assert.equal(oSpyPopAfterRendering.callCount, 0, "'onAfterRendering' of Popup wasn't called yet");
        this.oPopup.setContent(oControl.getDomRef());
        oControl.setCounter(1);
        Core.applyChanges();
        assert.equal(oSpyControlAfterRendering.callCount, 2, "'onAfterRendering' of control was called");
        assert.equal(oControl.$().css("height"), "200px", "Height changed to 200px");
        assert.equal(oSpyPopAfterRendering.callCount, 1, "'onAfterRendering' of Popup wasn't called yet");
        oControl.destroy();
        done();
    };
    this.oPopup.attachEventOnce("opened", fnOpened, this);
    this.oPopup.open();
});
QUnit.module("Focus", {
    beforeEach: function () {
        this.oDomRef = jQuery.sap.domById("popup");
        this.oPopup = new Popup(this.oDomRef);
        this.$Ref = jQuery.sap.byId("popup");
    },
    afterEach: function () {
        this.oPopup.destroy();
    },
    getFocusedElementId: function () {
        if (Device.browser.safari) {
            return lastFocusedId;
        }
        else {
            var $activeElement = jQuery(document.activeElement);
            var sId = $activeElement.length > 0 ? $activeElement.get(0).id : null;
            if (sId === "focusableElement2" || sId === "secondpopupcontent" || sId === "popupcontent" || sId === "popup") {
                return sId;
            }
            else {
                return null;
            }
        }
    }
});
QUnit.test("Initial Focus in non-modal mode, auto", function (assert) {
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.getFocusedElementId(), null, "no element should be focused");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.test("Initial Focus in non-modal mode, set", function (assert) {
    var done = assert.async();
    var oFocusedElement = document.getElementById("focusableElement2");
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(oBlurSpy.callCount, 0, "The previous focused element isn't blurred actively");
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.getFocusedElementId(), "secondpopupcontent", "second popup content element should be focused");
        this.oPopup.close();
        this.oPopup.setInitialFocusId(null);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        done();
    };
    var oBlurSpy = this.spy(oFocusedElement, "blur");
    oFocusedElement.focus();
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.setInitialFocusId("secondpopupcontent");
    this.oPopup.open(50);
    if (this.oPopup.touchEnabled) {
        assert.equal(document.activeElement.id, "focusableElement2", "The previous DOM element should not be blurred after calling open method");
    }
    else {
        assert.notEqual(document.activeElement.id, "focusableElement2", "The previous DOM element should be blurred after calling open method");
    }
});
QUnit.test("Initial Focus in modal mode, auto", function (assert) {
    var done = assert.async();
    var oFocusedElement = document.getElementById("focusableElement2");
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(oBlurSpy.callCount, 0, "The previous focused element isn't blurred");
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.getFocusedElementId(), "popupcontent", "first popup content element should be focused");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.setModal(true);
    var oBlurSpy = this.spy(oFocusedElement, "blur");
    oFocusedElement.focus();
    this.oPopup.open();
    if (this.oPopup.touchEnabled) {
        assert.equal(document.activeElement.id, "focusableElement2", "The previous DOM element should not be blurred after calling open method");
    }
    else {
        assert.notEqual(document.activeElement.id, "focusableElement2", "The previous DOM element should be blurred after calling open method");
    }
});
QUnit.test("Initial Focus in modal mode with no open animation, auto", function (assert) {
    var done = assert.async();
    var oFocusedElement = document.getElementById("focusableElement2");
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(oBlurSpy.callCount, 0, "The previous focused element isn't blurred");
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.getFocusedElementId(), "popupcontent", "first popup content element should be focused");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.setModal(true);
    var oBlurSpy = this.spy(oFocusedElement, "blur");
    oFocusedElement.focus();
    this.oPopup.open(0);
    if (this.oPopup.touchEnabled) {
        assert.equal(document.activeElement.id, "focusableElement2", "The previous DOM element should not be blurred after calling open method");
    }
    else {
        assert.notEqual(document.activeElement.id, "focusableElement2", "The previous DOM element should be blurred after calling open method");
    }
});
QUnit.test("Initial Focus in modal mode, set", function (assert) {
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.getFocusedElementId(), "secondpopupcontent", "second popup content element should be focused");
        this.oPopup.close();
        this.oPopup.setModal(false);
        this.oPopup.setInitialFocusId(null);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.setInitialFocusId("secondpopupcontent");
    this.oPopup.open();
});
QUnit.test("Initial Focus in autoclose mode, auto", function (assert) {
    var done = assert.async();
    var oFocusedElement = document.getElementById("focusableElement2");
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(oBlurSpy.callCount, 0, "The previous focused element isn't blurred");
        assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
        assert.equal(this.getFocusedElementId(), "popupcontent", "first popup content element should be focused");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.setAutoClose(true);
    var oBlurSpy = this.spy(oFocusedElement, "blur");
    oFocusedElement.focus();
    this.oPopup.open();
    if (this.oPopup.touchEnabled) {
        assert.equal(document.activeElement.id, "focusableElement2", "The previous DOM element should not be blurred after calling open method");
    }
    else {
        assert.notEqual(document.activeElement.id, "focusableElement2", "The previous DOM element should be blurred after calling open method");
    }
});
QUnit.test("Check if focus is inside the Popup", function (assert) {
    assert.expect(2);
    var done = assert.async();
    var oPopupDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oPopupDomRef);
    var oButtonInside = jQuery.sap.domById("popupcontent");
    var oButtonOustide = jQuery.sap.domById("focusableElement");
    var fnOpened = function () {
        oPopup.detachOpened(fnOpened, this);
        oButtonInside.focus();
        assert.ok(this.oPopup._isFocusInsidePopup(), "Focus is inside the Popup");
        oButtonOustide.focus();
        assert.ok(!oPopup._isFocusInsidePopup(), "Focus is outside of the Popup");
        oPopup.close(0);
        done();
    };
    oPopup.attachOpened(fnOpened, this);
    oPopup.open();
});
QUnit.test("Check if focus is set back to the opener after closing", function (assert) {
    var done = assert.async();
    var sLeftTop = Popup.Dock.LeftTop;
    var sRightTop = Popup.Dock.RightTop;
    var oAutoCloseDOM = document.createElement("div");
    oAutoCloseDOM.style.height = "100px";
    oAutoCloseDOM.style.width = "100px";
    oAutoCloseDOM.style.backgroundColor = "red";
    var oAutoCloseButton = document.createElement("button");
    oAutoCloseButton.id = "autocloseButton";
    oAutoCloseDOM.appendChild(oAutoCloseButton);
    var oAutoClosePopup = new Popup(oAutoCloseDOM, false, false, true);
    var fnAutoCloseOpened = function () {
        oAutoClosePopup.detachOpened(fnAutoCloseOpened, this);
        this.oPopup.open(0);
    };
    var oOpenButton = jQuery("#popup1-btn");
    jQuery.sap.focus(oOpenButton);
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        this.oPopup.close(0);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        setTimeout(function () {
            assert.equal(document.activeElement.id, oAutoCloseButton.id, "Focus is set back to button inside autoclose Popup");
            oAutoClosePopup.destroy();
            oAutoCloseDOM.parentNode.removeChild(oAutoCloseDOM);
            done();
        }, 200);
    };
    oAutoClosePopup.attachOpened(fnAutoCloseOpened, this);
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.setModal(true);
    oAutoClosePopup.open(0, sLeftTop, sRightTop, oOpenButton);
});
QUnit.test("Open two modal popups and close the second one, the focus should stay in the first popup after block layer gets focus", function (assert) {
    var done = assert.async();
    var sandbox = sinon.sandbox.create();
    sandbox.stub(Device, "system").value({
        desktop: true
    });
    var oSecondPopup = new Popup(jQuery.sap.domById("popup1"));
    var fnAfterSecondPopupClosed = function () {
        oSecondPopup.destroy();
        assert.ok(this.oPopup.isOpen(), "the first popup is still open");
        var $BlockLayer = jQuery.sap.byId("sap-ui-blocklayer-popup");
        assert.equal($BlockLayer.length, 1, "there's 1 blocklayer");
        jQuery.sap.focus($BlockLayer[0]);
        window.setTimeout(function () {
            assert.ok(jQuery.sap.containsOrEquals(this.oPopup.getContent(), document.activeElement), "The focus is set back to the popup");
            this.oPopup.attachClosed(function () {
                sandbox.restore();
                done();
            });
            this.oPopup.close();
        }.bind(this), 10);
    }.bind(this);
    var fnAfterSecondPopupOpen = function () {
        oSecondPopup.detachOpened(fnAfterSecondPopupOpen);
        oSecondPopup.attachClosed(fnAfterSecondPopupClosed);
        oSecondPopup.close();
    };
    this.oPopup.setModal(true);
    oSecondPopup.setModal(true);
    oSecondPopup.attachOpened(fnAfterSecondPopupOpen);
    this.oPopup.open(0);
    oSecondPopup.open(0);
});
QUnit.test("Open two modal popups and close the first one, the focus should stay in the second popup after block layer gets focus", function (assert) {
    var done = assert.async();
    var sandbox = sinon.sandbox.create();
    sandbox.stub(Device, "system").value({
        desktop: true
    });
    var oSecondPopup = new Popup(jQuery.sap.domById("popup1"));
    var fnAfterFirstPopupClosed = function () {
        assert.ok(oSecondPopup.isOpen(), "the second popup is still open");
        var $BlockLayer = jQuery.sap.byId("sap-ui-blocklayer-popup");
        assert.equal($BlockLayer.length, 1, "there's 1 blocklayer");
        jQuery.sap.focus($BlockLayer[0]);
        window.setTimeout(function () {
            assert.ok(jQuery.sap.containsOrEquals(oSecondPopup.getContent(), document.activeElement), "The focus is set back to the popup");
            oSecondPopup.attachClosed(function () {
                sandbox.restore();
                oSecondPopup.destroy();
                done();
            });
            oSecondPopup.close();
        }, 10);
    };
    var fnAfterSecondPopupOpen = function () {
        oSecondPopup.detachOpened(fnAfterSecondPopupOpen);
        this.oPopup.attachClosed(fnAfterFirstPopupClosed);
        this.oPopup.close();
    }.bind(this);
    this.oPopup.setModal(true);
    oSecondPopup.setModal(true);
    oSecondPopup.attachOpened(fnAfterSecondPopupOpen);
    this.oPopup.open(0);
    oSecondPopup.open(0);
});
QUnit.test("Check if no scrolling happens when a popup is opened and closed", function (assert) {
    var done = assert.async();
    var oExpectedScrollPosition;
    var fnGetCurrentScrollPosition = function () {
        return {
            x: Math.round(window.pageXOffset),
            y: Math.round(window.pageYOffset)
        };
    };
    var oTestContent = document.getElementById("testContent");
    var oAppDom = document.createElement("div");
    oAppDom.style.height = "1000px";
    oAppDom.style.width = "100px";
    oAppDom.style.backgroundColor = "red";
    var oButton = document.createElement("button");
    oButton.innerText = "My Button";
    var oPopupDom = document.createElement("div");
    oPopupDom.innerText = "My Popup Content";
    oTestContent.appendChild(oButton);
    oTestContent.appendChild(oAppDom);
    var oPopup = new Popup(oPopupDom, false, true, true);
    var fnOpened = function () {
        var oCurrentScrollPosition = fnGetCurrentScrollPosition();
        assert.equal(oCurrentScrollPosition.y, oExpectedScrollPosition.y, "The Y-dimension of the visible screen area was not changed by the focus change");
        assert.equal(oCurrentScrollPosition.x, oExpectedScrollPosition.x, "The X-dimension of the visible screen area was not changed by the focus change");
        oExpectedScrollPosition = fnGetCurrentScrollPosition();
        oPopup.close();
    };
    var fnClosed = function () {
        var oCurrentScrollPosition = fnGetCurrentScrollPosition();
        assert.equal(oCurrentScrollPosition.y, oExpectedScrollPosition.y, "The Y-dimension of the visible screen area was not changed by the focus change");
        assert.equal(oCurrentScrollPosition.x, oExpectedScrollPosition.x, "The X-dimension of the visible screen area was not changed by the focus change");
        oTestContent.removeChild(oButton);
        oTestContent.removeChild(oAppDom);
        oPopup.destroy();
        done();
    };
    oPopup.attachOpened(fnOpened);
    oPopup.attachClosed(fnClosed);
    oButton.focus();
    window.scrollTo(0, window.screen.availHeight);
    oExpectedScrollPosition = fnGetCurrentScrollPosition();
    oPopup.open();
});
QUnit.module("Animation", {
    beforeEach: function () {
        this.oDomRef = jQuery.sap.domById("popup");
        this.oPopup = new Popup(this.oDomRef);
        this.$Ref = jQuery.sap.byId("popup");
        this.oSpyOpened = sinon.spy(this.oPopup, "_opened");
        this.oSpyDuringOpen = sinon.spy(this.oPopup, "_duringOpen");
        this.oSpyClosed = sinon.spy(this.oPopup, "_closed");
        this.oSpyDuringClose = sinon.spy(this.oPopup, "_duringClose");
    },
    afterEach: function () {
        this.oSpyOpened.restore();
        this.oSpyDuringOpen.restore();
        this.oSpyClosed.restore();
        this.oSpyDuringClose.restore();
        this.oPopup.destroy();
    }
});
QUnit.test("Open Popup Without Animation", function (assert) {
    assert.expect(4);
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(this.oPopup.isOpen(), true, "Popup should be immediately open after opening without animation");
        assert.equal(this.$Ref.css("display"), "block", "Popup should be immediately 'display:block' after opening without animation");
        assert.equal(this.$Ref.css("visibility"), "visible", "Popup should be immediately 'visibility:visible' after opening without animation");
        assert.equal(this.$Ref.css("opacity"), "1", "Popup should be immediately 'opacity:1' after opening without animation");
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.open(0);
});
QUnit.test("Close Popup Without Animation", function (assert) {
    assert.expect(3);
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        this.oPopup.close(0);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        assert.equal(this.oPopup.isOpen(), false, "Popup should be closed immediately after closing without animation");
        assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' immediately after closing without animation");
        assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' immediately after closing without animation");
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open(0);
});
QUnit.test("Open Animation", function (assert) {
    assert.expect(4);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        this.oPopup.close(0);
        done();
    };
    var that = this;
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.open(2000);
    setTimeout(function () {
        assert.equal(that.oPopup.isOpen(), true, "Popup should be 'open' while opening");
        assert.equal(that.$Ref.css("display"), "block", "Popup should be 'display:block' while opening");
        assert.equal(that.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' while opening");
        var opacity = parseFloat(that.$Ref.css("opacity"));
        assert.ok((opacity > 0.1 && opacity < 0.9), "Popup opacity should be somewhere between 0.1 and 0.9 in the middle of the opening animation, but was: " + opacity);
    }, 1000);
});
QUnit.test("Closing Animation", function (assert) {
    assert.expect(8);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        var that = this;
        assert.equal(this.$Ref.css("opacity"), "1", "Popup must be 'opacity:1' when open");
        this.oPopup.close(2000);
        setTimeout(function () {
            assert.equal(that.oPopup.isOpen(), true, "Popup should still be 'open' while closing");
            assert.equal(that.$Ref.css("display"), "block", "Popup should be 'display:block' while closing");
            assert.equal(that.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' while closing");
            var opacity = parseFloat(that.$Ref.css("opacity"));
            assert.ok((opacity > 0.1 && opacity < 0.9), "Popup opacity should be somewhere between 0.1 and 0.9 in the middle of the closing animation, but was: " + opacity);
        }, 1000);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed, this);
        assert.equal(this.oPopup.isOpen(), false, "Popup should not be 'open' after closing");
        assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' after closing");
        assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' after closing");
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open(0);
});
QUnit.test("Check the order of function calls during open/close - with animation", function (assert) {
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened);
        assert.ok(this.oSpyDuringOpen.calledBefore(this.oSpyOpened), "Function for 'before/during' open called before '_opened'");
        assert.ok(this.oSpyOpened.calledOnce, "Popup.prototype._opened function should have been called");
        assert.ok(this.oSpyDuringOpen.calledOnce, "Popup.prototype._duringOpen function should have been called");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed);
        assert.ok(this.oSpyDuringClose.calledBefore(this.oSpyClosed), "Function for 'before/during' open called before '_closed'");
        assert.ok(this.oSpyClosed.calledOnce, "Popup.prototype._closed function should have been called");
        assert.ok(this.oSpyDuringClose.calledOnce, "Popup.prototype._duringClose function should have been called");
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.test("Check the order of function calls during open/close - with no animation", function (assert) {
    assert.expect(6);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened);
        assert.ok(this.oSpyDuringOpen.calledBefore(this.oSpyOpened), "Function for 'before/during' open called before 'opened'");
        assert.ok(this.oSpyOpened.calledOnce, "Popup.prototype._opened function should have been called");
        assert.ok(this.oSpyDuringOpen.calledOnce, "Popup.prototype._duringOpen function should have been called");
        this.oPopup.close(0);
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed);
        assert.ok(this.oSpyDuringClose.calledBefore(this.oSpyClosed), "Function for 'before/during' open called before 'opened'");
        assert.ok(this.oSpyClosed.calledOnce, "Popup.prototype._close function should have been called");
        assert.ok(this.oSpyDuringClose.calledOnce, "no further call before/during opening should have happened");
        done();
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open(0);
});
QUnit.test("Check the order of function calls during open/close with custom animations", function (assert) {
    assert.expect(8);
    var done = assert.async();
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened);
        assert.ok(this.oSpyDuringOpen.calledBefore(this.oSpyOpened), "Function for 'before/during' open called before '_opened'");
        assert.ok(this.oSpyOpened.calledOnce, "Popup.prototype._opened function should be called now");
        assert.ok(this.oSpyDuringOpen.calledOnce, "no further call before/during opening should have happened");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed);
        assert.ok(this.oSpyDuringClose.calledBefore(this.oSpyClosed), "Function for 'before/during' close called before '_closed'");
        assert.ok(this.oSpyClosed.calledOnce, "Popup.prototype._closed function should be called now");
        assert.ok(this.oSpyDuringClose.calledOnce, "no further call before/during closing should have happened");
        done();
    };
    this.oPopup.setAnimations(function ($Ref, iRealDuration, fnOpenCallback) {
        assert.ok(typeof fnOpenCallback === "function", "OpenCallback handler is provided");
        fnOpenCallback();
    }, function ($Ref, iRealDuration, fnCloseCallback) {
        assert.ok(typeof fnCloseCallback === "function", "CloseCallback handler is provided");
        fnCloseCallback();
    });
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.module("Event", {
    beforeEach: function () {
        this.oDomRef = jQuery.sap.domById("popup");
        this.oPopup = new Popup(this.oDomRef);
        this.$Ref = jQuery.sap.byId("popup");
    },
    afterEach: function () {
        this.oPopup.destroy();
    }
});
QUnit.test("Event registration and deregistration", function (assert) {
    var done = assert.async();
    var oSpyEventProviderAttach = sinon.spy(EventProvider.prototype, "attachEvent");
    var oSpyEventProviderDetach = sinon.spy(EventProvider.prototype, "detachEvent");
    this.fnOpened = function (oEvent) {
        assert.ok(this.oSpyOpened.calledOnce, "Opened callback called");
        assert.ok(!this.oSpyClosed.calledOnce, "Closed callback not called yet");
        this.oPopup.close(0);
    };
    this.oSpyOpened = sinon.spy(this, "fnOpened");
    this.fnClosed = function (oEvent) {
        this.oPopup.detachOpened(this.fnOpened, this);
        this.oPopup.detachClosed(this.fnClosed, this);
        assert.ok(oSpyEventProviderDetach.callCount >= 2, "EventProvider.attachEvent called at least two times");
        assert.ok(oSpyEventProviderDetach.calledWith("opened", this.fnOpened), "EventProvider called with correct 'open' values");
        assert.ok(oSpyEventProviderDetach.calledWith("closed", this.fnClosed), "EventProvider called with correct 'close' values");
        assert.ok(this.oSpyOpened.calledOnce, "Opened callback called");
        assert.ok(this.oSpyClosed.calledOnce, "Closed callback called");
        assert.ok(!this.oPopup.mEventRegistry.length, "Event registries should have been removed for 'opened' & 'closed'");
        this.oSpyOpened.restore();
        delete this.oSpyOpened;
        this.oSpyClosed.restore();
        delete this.oSpyClosed;
        done();
    };
    this.oSpyClosed = sinon.spy(this, "fnClosed");
    this.oPopup.attachOpened(this.fnOpened, this);
    this.oPopup.attachClosed(this.fnClosed, this);
    assert.equal(oSpyEventProviderAttach.callCount, 2, "EventProvider.attachEvent called");
    assert.ok(oSpyEventProviderAttach.calledWith("opened", this.fnOpened), "EventProvider called with correct 'open' values");
    assert.ok(oSpyEventProviderAttach.calledWith("closed", this.fnClosed), "EventProvider called with correct 'close' values");
    this.oPopup.open(0);
});
QUnit.test("Opened / closed", function (assert) {
    assert.expect(2);
    var done = assert.async();
    var fnOpened = function (oEvent) {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(oEvent.sId, "opened", "the last event should have been 'opened'");
        this.oPopup.close();
    };
    var fnClosed = function (oEvent) {
        this.oPopup.detachClosed(fnClosed, this);
        assert.equal(oEvent.sId, "closed", "the last event should have been 'closed'");
        done();
    };
    this.oPopup.setDurations(0, 20);
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.test("Destroy popup before open animation finishes", function (assert) {
    this.oPopup.setDurations(20, 0);
    var done = assert.async();
    var fnOpened = function (oEvent) {
        assert.ok(false, "'opened' event should be fired");
    };
    var fnClosed = function (oEvent) {
        assert.ok(true, "close event should be fired when destroy");
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
    this.oPopup.destroy();
    setTimeout(function () {
        assert.ok(!this.oPopup.isOpen(), "Popup is closed");
        done();
    }.bind(this), 50);
});
QUnit.module("Parent / Child Popups", {
    beforeEach: function () {
        this.oChildOpener = jQuery.sap.domById("popup2-btn");
        oDomRef = jQuery.sap.domById("popup");
        this.oChildPop = new Popup(oDomRef);
        oDomRef = jQuery.sap.domById("popup2");
        this.oParentPop = new Popup(oDomRef);
    },
    afterEach: function () {
        delete this.oChildOpener;
        this.oChildPop.destroy();
        this.oParentPop.destroy();
    }
});
QUnit.test("Autoclose popup opened from another autoclose popup", function (assert) {
    var done = assert.async();
    var oPopup1DomRef = jQuery.sap.domById("popup1");
    var oPopup2DomRef = jQuery.sap.domById("popup2");
    var oPopup1 = new Popup(oPopup1DomRef);
    var oPopup2 = new Popup(oPopup2DomRef);
    oPopup1.setAutoClose(true);
    oPopup1.setPosition(Popup.Dock.CenterCenter, Popup.Dock.CenterCenter, window, "0 0", "fit");
    oPopup1.setDurations(0, 0);
    oPopup1.open();
    assert.ok(oPopup1.isOpen(), "Popup1 is open");
    var oButtonRef = jQuery.sap.domById("popup1-btn");
    oPopup2.setAutoClose(true);
    oPopup2.setPosition(Popup.Dock.RightCenter, Popup.Dock.LeftCenter, oButtonRef, "0 0", "fit");
    oPopup2.setDurations(0, 0);
    oPopup2.open();
    assert.ok(oPopup2.isOpen(), "Popup2 is open");
    oPopup1.close();
    setTimeout(function () {
        assert.ok(!oPopup1.isOpen(), "Popup1 is closed");
        assert.ok(!oPopup2.isOpen(), "Popup2 is closed");
        oPopup1.destroy();
        oPopup2.destroy();
        done();
    }, 200);
});
QUnit.test("Child registered at parent", function (assert) {
    var that = this;
    var done = assert.async();
    var fnParentOpened = function () {
        that.oParentPop.detachOpened(fnParentOpened);
        that.oChildPop.open(0, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, that.oChildOpener, "0 0", "fit");
    };
    var fnChildOpened = function () {
        that.oChildPop.detachOpened(fnChildOpened);
        assert.ok(that.oChildPop.isInPopup(that.oChildPop._oPosition.of), "Child belongs to parent");
        assert.ok(that.oParentPop.getChildPopups().length, "Parent got child");
        that.oChildPop.close(0);
    };
    var fnChildClosed = function () {
        that.oChildPop.detachClosed(fnChildClosed);
        assert.ok(!that.oParentPop.getChildPopups().length, "Parent has no child");
        done();
    };
    this.oParentPop.attachOpened(fnParentOpened);
    this.oChildPop.attachOpened(fnChildOpened);
    this.oChildPop.attachClosed(fnChildClosed);
    this.oParentPop.open();
});
QUnit.test("Increase z-index: Child must not be re-rendered", function (assert) {
    var done = assert.async();
    var oDelegate = {
        onBeforeRendering: function () { }
    };
    this.oRenderingStub = sinon.stub(oDelegate, "onBeforeRendering");
    var oButton = new Button({
        text: "Sis is se dschaild"
    }).addDelegate(oDelegate, this);
    var oChildPop = new Popup(oButton);
    this.oMouseSpy = sinon.spy(this.oParentPop, "onmousedown");
    var fnGetZIndexFromDomRef = function (oDomRef) {
        if (oDomRef) {
            return parseInt(jQuery(oDomRef).css("z-index"));
        }
        else {
            return -1;
        }
    };
    var fnParentOpened = function () {
        this.oParentPop.detachOpened(fnParentOpened);
        oChildPop.open(0, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, this.oChildOpener, "0 0", "fit");
    }.bind(this);
    var fnChildOpened = function () {
        oChildPop.detachOpened(fnParentOpened);
        assert.equal(this.oRenderingStub.callCount, 1, "'onBeforeRendering' should have been called once for rendering for child");
        var oDomRef = this.oParentPop._$(false, true);
        var iParentOldIndex = fnGetZIndexFromDomRef(oDomRef);
        oDomRef = oChildPop._$(false, true);
        var iChildOldIndex = fnGetZIndexFromDomRef(oDomRef);
        assert.ok(iParentOldIndex < iChildOldIndex, "Child should have a bigger z-index that its parent");
        QUnitUtils.triggerMouseEvent(this.oParentPop, "onmousedown", 0, 0, 0, 0, 0);
        assert.equal(this.oMouseSpy.callCount, 1, "'onmousedown' should have been called at parent Popup");
        oDomRef = this.oParentPop._$(false, true);
        var iParentNewIndex = fnGetZIndexFromDomRef(oDomRef);
        oDomRef = oChildPop._$(false, true);
        var iChildNewIndex = fnGetZIndexFromDomRef(oDomRef);
        assert.ok(iParentNewIndex < iChildNewIndex, "Child should still have a bigger z-index that its parent");
        assert.ok(iChildOldIndex < iChildNewIndex, "Child z-index should have been increased");
        assert.ok(iParentOldIndex < iParentNewIndex, "Parent z-index should have been increased");
        assert.equal(this.oRenderingStub.callCount, 1, "'onBeforeRendering' shouldn't have been called after increasing the z-index for child");
        oChildPop.destroy();
        done();
    }.bind(this);
    this.oParentPop.attachOpened(fnParentOpened);
    oChildPop.attachOpened(fnChildOpened);
    this.oParentPop.open();
});
QUnit.module("BlockLayer", {
    beforeEach: function () {
        this.oPopup = new Popup(jQuery.sap.domById("popup"), true);
    },
    afterEach: function () {
        this.oPopup.destroy();
    }
});
QUnit.test("Check if the BlockLayer is displayed", function (assert) {
    var done = assert.async();
    this.oSpyShowBL = sinon.spy(this.oPopup, "_showBlockLayer");
    this.oSpyHideBL = sinon.spy(this.oPopup, "_hideBlockLayer");
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened);
        assert.ok(this.oSpyShowBL.calledOnce, "_showBlockLayer called within Popup");
        assert.ok(jQuery("html").hasClass("sapUiBLyBack"), "CSS class added to HTML-tag");
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        var $oPopup = this.oPopup._$(false, true);
        assert.ok($oDomRefBL.length, "BlockLayer added to DOM");
        var iBLIndex = parseInt($oDomRefBL.css("z-index"));
        var iPopupIndex = parseInt($oPopup.css("z-index"));
        assert.ok(iBLIndex && iPopupIndex && iBLIndex < iPopupIndex, "Z-index of BlockLayer must be smaller than the popup's z-index");
        this.oPopup.close();
    };
    var fnClosed = function () {
        this.oPopup.detachClosed(fnClosed);
        assert.ok(this.oSpyHideBL.calledOnce, "_showBlockLayer called within Popup");
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        setTimeout(function () {
            assert.ok(!jQuery("html").hasClass("sapUiBLyBack"), "CSS class removed from HTML-tag");
            assert.equal($oDomRefBL.css("visibility"), "hidden", "BlockLayer should be hidden");
            done();
        }, 1);
    };
    this.oPopup.setDurations(0, 0);
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.test("Check when the layer is being removed", function (assert) {
    var done = assert.async();
    var oSpyClose = sinon.spy(this.oPopup, "close");
    var oSpyClosed = sinon.spy(this.oPopup, "_closed");
    var oSpyHideBlocklayer = sinon.spy(this.oPopup, "_hideBlockLayer");
    var fnOpened = function () {
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        assert.equal($oDomRefBL.length, 1, "BlockLayer added to DOM");
        setTimeout(function () {
            $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
            assert.equal($oDomRefBL.length, 1, "BlockLayer still in DOM during close");
            assert.equal(oSpyClose.callCount, 1, "'close' has been called");
            assert.equal(oSpyClosed.callCount, 0, "'_closed' hasn't been called yet during closing");
            assert.equal(oSpyHideBlocklayer.callCount, 0, "'_hideBlockLayer' hasn't been called yet during closing");
        }, 200);
        this.oPopup.close();
    }.bind(this);
    var fnClosed = function () {
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        assert.equal($oDomRefBL.css("visibility"), "hidden", "BlockLayer should be hidden");
        assert.equal(oSpyClose.callCount, 1, "'close' has been called");
        assert.equal(oSpyClosed.callCount, 1, "'_closed' has been called after closing");
        assert.equal(oSpyHideBlocklayer.callCount, 1, "'_hideBlockLayer' has been called after closing");
        assert.ok(oSpyHideBlocklayer.calledAfter(oSpyClosed), "'_hideBlockLayer' was called after '_closed'");
        done();
    };
    this.oPopup.setDurations(0, 500);
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.attachClosed(fnClosed, this);
    this.oPopup.open();
});
QUnit.test("Destroy an opened modal popup should hide blocklayer synchronously", function (assert) {
    this.oPopup.open();
    this.oPopup.destroy();
    assert.equal(jQuery("#sap-ui-blocklayer-popup").css("visibility"), "hidden", "BlockLayer should be hidden");
});
QUnit.test("Stacked Modal Popups Should Change Z-Index of BlockLayer", function (assert) {
    var oPopup1DomRef = jQuery.sap.domById("popup1");
    var oPopup2DomRef = jQuery.sap.domById("popup2");
    var oPopup1 = new Popup(oPopup1DomRef, true);
    var oPopup2 = new Popup(oPopup2DomRef, true);
    var done = assert.async();
    var fnOpened = function () {
        var $oPop1 = oPopup1._$(false, true);
        var iZIndex1 = parseInt($oPop1.css("z-index"));
        var $oPop2 = oPopup2._$(false, true);
        var iZIndex2 = parseInt($oPop2.css("z-index"));
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        var iZIndexBL = parseInt($oDomRefBL.css("z-index"));
        assert.ok($oDomRefBL.length, "BlockLayer should be added to DOM");
        assert.ok(iZIndex1 && iZIndex2 && iZIndex1 < iZIndex2, "Z-Index of Popup1 must be smaller z-index of Popup2's");
        assert.ok(iZIndexBL && iZIndex1 < iZIndexBL < iZIndex2, "Z-Index of BlockLayer must be between Popup1 and Popup2");
        oPopup2.close();
    };
    var fnClosed1 = function () {
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        setTimeout(function () {
            assert.equal($oDomRefBL.css("visibility"), "hidden", "BlockLayer should be hidden");
            assert.ok(!jQuery("html").hasClass("sapUiBLyBack"), "CSS class should be removed from HTML-tag");
            oPopup1.destroy();
            oPopup2.destroy();
            done();
        }, 1);
    };
    var fnClosed2 = function () {
        var $oPop1 = oPopup1._$(false, true);
        var iZIndex1 = parseInt($oPop1.css("z-index"));
        var $oDomRefBL = jQuery("#sap-ui-blocklayer-popup");
        var iZIndexBL = parseInt($oDomRefBL.css("z-index"));
        assert.ok($oDomRefBL.length, "BlockLayer should still in DOM");
        assert.ok(iZIndex1 && iZIndexBL && iZIndexBL < iZIndex1, "Z-Index of BlockLayer must be smaller than z-index of Popup1 now");
        oPopup1.close();
    };
    oPopup1.setDurations(0, 0);
    oPopup1.attachClosed(fnClosed1);
    oPopup1.open();
    oPopup2.setDurations(0, 0);
    oPopup2.attachOpened(fnOpened);
    oPopup2.attachClosed(fnClosed2);
    oPopup2.open();
});
QUnit.test("Should mark only the highest popup content as user selectable - only modal popups", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oPopup3 = new Popup(oPopup3DomRef, true);
    var oPopup4 = new Popup(oPopup4DomRef, true);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("OpenPopup"), "The selected text should be correct 'OpenPopup'.");
        oPopup4.open();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be markded explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiUserSelectable"), "The content of the whole html document should not be marked explicitly as user selectable.");
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            oPopup3.destroy();
            oPopup4.destroy();
            done();
        }, 0);
    };
    var fnOpened4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as not user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("Button"), "The selected text should be correct 'Button'.");
        oPopup4.close();
    };
    var fnClosed4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        oPopup3.close();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.open();
});
QUnit.test("Should mark the modal and sub non modal popup as user selectable", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oPopup3 = new Popup(oPopup3DomRef, true);
    var oPopup4 = new Popup(oPopup4DomRef, false);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("OpenPopup"), "The selected text should be correct 'OpenPopup'.");
        oPopup4.open();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiUserSelectable"), "The content of the whole html document should not be marked explicitly as user selectable.");
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            oPopup3.destroy();
            oPopup4.destroy();
            done();
        }, 0);
    };
    var fnOpened4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("OpenPopupButton"), "The selected text should be correct 'Open PopupButton'.");
        oPopup4.close();
    };
    var fnClosed4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        oPopup3.close();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.open();
});
QUnit.test("Should mark the non modal and sub modal popup as user selectable", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oPopup3 = new Popup(oPopup3DomRef, false);
    var oPopup4 = new Popup(oPopup4DomRef, true);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup4.open();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiUserSelectable"), "The content of the whole html document should not be marked explicitly as user selectable.");
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            oPopup3.destroy();
            oPopup4.destroy();
            done();
        }, 0);
    };
    var fnOpened4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("Button"), "The selected text should be correct 'Button'.");
        oPopup4.close();
    };
    var fnClosed4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
            assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            oPopup3.close();
        }, 0);
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.open();
});
QUnit.test("Should mark the whole window as user selectable because only non modal popups are placed", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oPopup3 = new Popup(oPopup3DomRef, false);
    var oPopup4 = new Popup(oPopup4DomRef, false);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup4.open();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiUserSelectable"), "The content of the whole html document should not be marked explicitly as user selectable.");
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            oPopup3.destroy();
            oPopup4.destroy();
            done();
        }, 0);
    };
    var fnOpened4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        oPopup4.close();
    };
    var fnClosed4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        oPopup3.close();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.open();
});
QUnit.test("Should mark specific window areas as user selectable depending on setting the 'modal'-property dynamically", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oPopup3 = new Popup(oPopup3DomRef, false);
    var oPopup4 = new Popup(oPopup4DomRef, true);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup3.setModal(true);
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("OpenPopup"), "The selected text should be correct 'OpenPopup'.");
        oPopup3.setModal(false);
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup3.close();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiUserSelectable"), "The content of the whole html document should not be marked explicitly as user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        oPopup4.open();
    };
    var fnOpened4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("Button"), "The selected text should be correct 'Button'.");
        oPopup4.setModal(false);
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup4.setModal(true);
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("Button"), "The selected text should be correct 'Button'.");
        oPopup4.close();
    };
    var fnClosed4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup4DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        oPopup3.destroy();
        oPopup4.destroy();
        done();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
    assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
    assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.setModal(true);
    assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
    assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
    assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.setModal(false);
    oPopup3.open();
});
QUnit.test("Should mark specific window areas as user selectable depending on setting the integrated popup content and external content - full scenario", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oCustomDialogFirst = document.getElementById("customDialog1");
    var oCustomDialogSecond = document.getElementById("customDialog2");
    var oPopup3 = new Popup(oPopup3DomRef, true);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        Popup.addExternalContent("[data-custom-popup-content-2]", true);
        assert.ok(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should be marked explicitly as user selectable.");
        assert.ok(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should be marked explicitly as user selectable.");
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        Popup.removeExternalContent("[data-custom-popup-content-2]", true);
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup3.close();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            oPopup3.destroy();
            done();
        }, 0);
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
    assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
    assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as user selectable.");
    assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
    assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as user selectable.");
    assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
    assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
    oCustomDialogFirst.setAttribute("data-sap-ui-integration-popup-content", "");
    oCustomDialogSecond.setAttribute("data-custom-popup-content-2", "");
    oPopup3.open();
});
QUnit.test("Should mark specific window areas as user selectable depending on setting the integrated popup content and external content - popup is closed before removing external content", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oCustomDialogFirst = document.getElementById("customDialog1");
    var oCustomDialogSecond = document.getElementById("customDialog2");
    var oPopup3 = new Popup(oPopup3DomRef, true);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.ok(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should be marked explicitly as user selectable.");
        assert.ok(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oPopup3.close();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oPopup3DomRef).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogFirst).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogFirst.id + " should not be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery(oCustomDialogSecond).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oCustomDialogSecond.id + " should not be marked explicitly as not user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        }, 0);
        oCustomDialogFirst.removeAttribute("data-sap-ui-integration-popup-content");
        oCustomDialogSecond.removeAttribute("data-custom-popup-content-2");
        oPopup3.destroy();
        done();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oCustomDialogFirst.setAttribute("data-sap-ui-integration-popup-content", "");
    oCustomDialogSecond.setAttribute("data-custom-popup-content-2", "");
    Popup.addExternalContent("[data-custom-popup-content-2]");
    assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
    QUnitUtils.triggerSelectAll();
    assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
    oPopup3.open();
});
QUnit.test("Should set the user selection correctly when popup content is invalidated - modal popup", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oText = new Text("myText", { text: "ThisIsTheInitialText" });
    var oPopup3 = new Popup(oPopup3DomRef, true);
    oPopup3.setContent(oText);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
        oText.setText("NewText");
        setTimeout(function () {
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            assert.ok(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
            assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
            assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as not user selectable.");
            QUnitUtils.triggerSelectAll();
            assert.ok(QUnitUtils.isSelectedTextEqual(), "There should be any text selected.");
            oPopup3.close();
        }, 0);
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        setTimeout(function () {
            assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
            oText.destroy();
            oPopup3.destroy();
            done();
        }, 0);
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup3.open();
});
QUnit.test("Should set the user selection correctly when popup content is invalidated - two modal popups", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oText = new Text("myText", { text: "ThisIsTheInitialText" });
    var oPopup3 = new Popup(oPopup3DomRef, true);
    var oPopup4 = new Popup(oPopup4DomRef, true);
    oPopup3.setContent(oText);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        oPopup4.open();
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        oText.destroy();
        oPopup3.destroy();
        oPopup4.destroy();
        done();
    };
    var fnOpened4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.ok(jQuery(oText.getDomRef()).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as not user selectable.");
        assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("Button"), "There should be 'Button' selected.");
        oText.setText("NewText");
        setTimeout(function () {
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            assert.ok(jQuery(oPopup4DomRef).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup4.getId() + " should be marked explicitly as user selectable.");
            assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
            assert.ok(jQuery(oText.getDomRef()).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as not user selectable.");
            assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
            QUnitUtils.triggerSelectAll();
            assert.ok(QUnitUtils.isSelectedTextEqual("Button"), "There should be 'Button' selected.");
            oPopup4.close();
        }, 0);
    };
    var fnClosed4 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.ok(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should be marked explicitly as user selectable.");
        assert.ok(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should be marked explicitly as not user selectable.");
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.isSelectedTextEqual("NewText"), "There should be 'NewText' selected.");
        oPopup3.close();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    oPopup3.open();
});
QUnit.test("Should set the user selection correctly when popup content is invalidated - one non modal popup", function (assert) {
    var oPopup3DomRef = document.getElementById("popup3");
    var oText = new Text("myText", { text: "ThisIsTheInitialText" });
    var oPopup3 = new Popup(oPopup3DomRef, false);
    oPopup3.setContent(oText);
    var done = assert.async();
    var fnOpened3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        QUnitUtils.triggerSelectAll();
        assert.ok(QUnitUtils.includesSelectedText(["ThisIsTheInitialText", "sap.ui.core.Popup"]), "The whole content of the html document should be selected.");
        oText.setText("NewText");
        setTimeout(function () {
            assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            QUnitUtils.triggerSelectAll();
            assert.ok(QUnitUtils.includesSelectedText(["NewText", "sap.ui.core.Popup"]), "The whole content of the html document should be selected.");
            oPopup3.close();
        }, 0);
    };
    var fnClosed3 = function () {
        assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
        assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oPopup3.getId() + " should not be marked explicitly as user selectable.");
        assert.notOk(jQuery("html").hasClass("sapUiNotUserSelectable"), "The content of the whole html document should not be marked explicitly as not user selectable.");
        oText.destroy();
        oPopup3.destroy();
        done();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup3.open();
});
QUnit.test("Should set the user selection correctly when non modal popup content is invalidated - two modal popups, non-modal popup is associated with the last opened one", function (assert) {
    var oPopup1DomRef = document.getElementById("popup1");
    var oPopup3DomRef = document.getElementById("popup3");
    var oPopup4DomRef = document.getElementById("popup4");
    var oText = new Text("myText", { text: "ThisIsTheInitialText" });
    var oPopup3 = new Popup(oPopup3DomRef, true);
    var oPopup4 = new Popup(oPopup4DomRef, true);
    var oNonModalPopup = new Popup(oPopup1DomRef, false);
    oNonModalPopup.setContent(oText);
    var done = assert.async();
    var fnOpened3 = function () {
        oPopup4.open();
    };
    var fnClosed3 = function () {
        oText.destroy();
        oNonModalPopup.destroy();
        oPopup3.destroy();
        oPopup4.destroy();
        done();
    };
    var fnOpened4 = function () {
        oNonModalPopup.open();
    };
    var fnClosed4 = function () {
        oPopup3.close();
    };
    var fnOpenedNonModalPopup = function () {
        oText.setText("NewText");
        setTimeout(function () {
            assert.ok(jQuery(oText.getDomRef()).hasClass("sapUiUserSelectable"), "The content of popup with ID: " + oNonModalPopup.getId() + " should be marked explicitly as user selectable.");
            assert.notOk(jQuery(oText.getDomRef()).hasClass("sapUiNotUserSelectable"), "The content of popup with ID: " + oNonModalPopup.getId() + " should not be marked explicitly as not user selectable.");
            assert.notOk(QUnitUtils.isSelectedTextEqual(), "There should not be any text selected.");
            QUnitUtils.triggerSelectAll();
            assert.ok(QUnitUtils.includesSelectedText(["Button", "NewText"]), "There should be 'Button' and 'NewText' selected.");
            oNonModalPopup.close();
        }, 0);
    };
    var fnClosedNonModalPopup = function () {
        oPopup4.close();
    };
    oPopup3.setDurations(0, 0);
    oPopup3.attachOpened(fnOpened3);
    oPopup3.attachClosed(fnClosed3);
    oPopup4.setDurations(0, 0);
    oPopup4.attachOpened(fnOpened4);
    oPopup4.attachClosed(fnClosed4);
    oNonModalPopup.setDurations(0, 0);
    oNonModalPopup.attachOpened(fnOpenedNonModalPopup);
    oNonModalPopup.attachClosed(fnClosedNonModalPopup);
    oPopup3.open();
});
QUnit.module("ShieldLayer", {
    beforeEach: function (assert) {
        var oPopupDomRef = jQuery.sap.domById("popup");
        this.oPopup = new Popup(oPopupDomRef, true);
        this._Device_browser_mobile = Device.browser.mobile;
        this._Device_browser_chrome = Device.browser.chrome;
        this._Device_os_ios = Device.os.ios;
        Device.browser.mobile = true;
        Device.os.ios = false;
        Device.browser.chrome = false;
        assert.ok(isMouseEventDelayed(), "Using the above Device mocks 'isMouseEventDelayed' should return true");
    },
    afterEach: function () {
        Device.browser.mobile = this._Device_browser_mobile;
        Device.os.ios = this._Device_os_ios;
        Device.browser.chrome = this._Device_browser_chrome;
        this.oPopup.destroy();
    }
});
QUnit.test("Creation And Destruction of ShieldLayer", function (assert) {
    var done = assert.async();
    var oSpyShieldBorrowObject = sinon.spy(this.oPopup.oShieldLayerPool, "borrowObject");
    var oSpyShieldReturnObject = sinon.spy(this.oPopup.oShieldLayerPool, "returnObject");
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened, this);
        assert.equal(oSpyShieldBorrowObject.callCount, 1, "Calling the ShieldLayer factory");
        assert.ok(this.oPopup._oTopShieldLayer, "ShieldLayer was created");
        assert.ok(this.oPopup._iTopShieldRemoveTimer, "Timeout was started");
        setTimeout(function () {
            assert.equal(oSpyShieldReturnObject.callCount, 1, "ShieldLayer was returned");
            assert.ok(!this.oPopup._oTopShieldLayer, "ShieldLayer was removed");
            assert.ok(!this.oPopup._iTopShieldRemoveTimer, "Timeout has passed");
            oSpyShieldBorrowObject.restore();
            oSpyShieldReturnObject.restore();
            done();
        }.bind(this), 510);
    };
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.open();
});
QUnit.test("Destroy popup during open/close should also clear the close timer of ShieldLayer", function (assert) {
    var oSpyShieldBorrowObject = sinon.spy(this.oPopup.oShieldLayerPool, "borrowObject"), oSpyShieldReturnObject = sinon.spy(this.oPopup.oShieldLayerPool, "returnObject");
    this.oPopup.open();
    this.oPopup.close();
    this.oPopup.destroy();
    assert.equal(oSpyShieldBorrowObject.callCount, 2, "ShieldLayer is created twice");
    assert.equal(oSpyShieldReturnObject.callCount, 2, "All ShieldLayers are returned");
    oSpyShieldReturnObject.restore();
    oSpyShieldBorrowObject.restore();
});
QUnit.module("Autoclose Area", {
    beforeEach: function () {
        this.CustomInput = Control.extend("CustomInput", {
            metadata: {
                events: {
                    change: {
                        parameters: {
                            value: { type: "string" }
                        }
                    }
                }
            },
            renderer: {
                apiVersion: 2,
                render: function (oRm, oControl) {
                    oRm.openStart("div", oControl).openEnd();
                    oRm.voidStart("input", oControl.getId() + "-input").voidEnd();
                    oRm.close("div");
                }
            },
            getFocusDomRef: function () {
                return this.getDomRef("input");
            },
            onsapenter: function () {
                this.fireChange({ value: "zzz" });
            }
        });
        var oPopupDomRef = jQuery.sap.domById("popup1");
        this.oPopup = new Popup(oPopupDomRef);
        this.oPopup.setAutoClose(true);
    },
    afterEach: function () {
        this.oPopup.destroy();
        this.oInput.destroy();
    }
});
QUnit.test("The DOM element of Autoclose area should be updated when it's rerendered", function (assert) {
    assert.expect(4);
    var that = this, done = assert.async();
    this.oInput = new this.CustomInput({
        change: function () {
            that.oPopup.open();
        }
    }).placeAt("uiarea");
    Core.applyChanges();
    var fnClosed = function () {
        assert.ok(true, "Popup is closed through autoclose");
        done();
    };
    var fnOpened = function () {
        this.oPopup.detachOpened(fnOpened);
        this.oPopup.attachClosed(fnClosed);
        this.oInput.invalidate();
        Core.applyChanges();
        this.oInput.focus();
        var oDOM = jQuery.sap.byId("focusableElement2");
        if (this.oPopup.touchEnabled) {
            QUnitUtils.triggerEvent("touchstart", oDOM);
        }
        else {
            oDOM.focus();
        }
    }.bind(this);
    this.oPopup.attachOpened(fnOpened);
    this.oPopup.setAutoCloseAreas([this.oInput]);
    this.oInput.focus();
    assert.ok(jQuery.sap.containsOrEquals(this.oInput.getDomRef(), document.activeElement), "focus is inside input");
    QUnitUtils.triggerKeydown(this.oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);
    QUnitUtils.triggerKeyup(this.oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);
    assert.ok(!jQuery.sap.containsOrEquals(this.oInput.getDomRef(), document.activeElement), "The input is blurred after calling popup.open");
    assert.ok(this.oPopup.isOpen(), "Popup should be opened");
});
QUnit.test("The previous active element isn't blurred before the opening animation, if it's the same element which gets the focus after popup open", function (assert) {
    var done = assert.async(), that = this, oFocusDomElement, oBlurSpy;
    this.oInput = new this.CustomInput({
        change: function () {
            that.oPopup.open();
        }
    }).placeAt("uiarea");
    Core.applyChanges();
    var fnOpened = function () {
        assert.equal(oBlurSpy.callCount, 0, "The document.activeElement isn't blurred");
        assert.ok(jQuery.sap.containsOrEquals(that.oInput.getDomRef(), document.activeElement), "focus is still inside input");
        oBlurSpy.restore();
        done();
    };
    this.oPopup.attachOpened(fnOpened);
    this.oPopup.setInitialFocusId(this.oInput.getId());
    this.oInput.focus();
    assert.ok(jQuery.sap.containsOrEquals(this.oInput.getDomRef(), document.activeElement), "focus is inside input");
    oFocusDomElement = document.activeElement;
    oBlurSpy = sinon.spy(oFocusDomElement, "blur");
    QUnitUtils.triggerKeydown(this.oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);
    QUnitUtils.triggerKeyup(this.oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);
    assert.ok(jQuery.sap.containsOrEquals(this.oInput.getDomRef(), document.activeElement), "The input is still focused after calling popup.open");
    assert.ok(this.oPopup.isOpen(), "Popup should be opened");
});
QUnit.test("autoclose area delegate should be removed when popup is destroyed", function (assert) {
    this.oInput = new this.CustomInput({
        change: function () {
            this.oPopup.open();
        }.bind(this)
    }).placeAt("uiarea");
    this.oRemoveDelegateSpy = this.spy(this.oInput, "removeEventDelegate");
    Core.applyChanges();
    this.oPopup.setAutoCloseAreas([this.oInput]);
    this.oPopup.destroy();
    assert.equal(this.oRemoveDelegateSpy.callCount, 1, "Delegate is removed after destroy popup");
});
QUnit.test("autoclose area delegate should be added once even when the same control is added again", function (assert) {
    this.oInput = new this.CustomInput({
        change: function () {
            this.oPopup.open();
        }.bind(this)
    }).placeAt("uiarea");
    Core.applyChanges();
    this.oPopup.setAutoCloseAreas([this.oInput]);
    this.oPopup.setAutoCloseAreas([this.oInput]);
    assert.equal(this.oInput.aDelegates.length, 1, "there's only 1 delegate added");
    assert.equal(this.oPopup._aExtraContent.length, 1, "the same control is only added once as autoclose area");
});
QUnit.module("Extra Popup Content Seletor", {
    before: function () {
        document.getElementById("focusableElementWithAttribute").setAttribute("data-sap-ui-integration-popup-content", "");
        document.getElementById("notFocusableElementWithAttribute").setAttribute("data-sap-ui-integration-popup-content", "");
        document.getElementById("focusableElementWithCustomAttribute").setAttribute("data-custom-popup-content", "");
        document.getElementById("focusableElementWithCustomAttributeParent").setAttribute("data-custom-popup-content-1", "");
    },
    after: function () {
        document.getElementById("focusableElementWithAttribute").removeAttribute("data-sap-ui-integration-popup-content");
        document.getElementById("notFocusableElementWithAttribute").removeAttribute("data-sap-ui-integration-popup-content");
        document.getElementById("focusableElementWithCustomAttribute").removeAttribute("data-custom-popup-content");
        document.getElementById("focusableElementWithCustomAttributeParent").removeAttribute("data-custom-popup-content-1");
    },
    beforeEach: function () {
        var oPopupDomRef = jQuery.sap.domById("popup1");
        this.oPopup = new Popup(oPopupDomRef);
    },
    afterEach: function () {
        this.oPopup.destroy();
    }
});
QUnit.test("External DOM element marked with data-sap-ui-integration-popup-content is part of the Popup", function (assert) {
    var oExternalPopupContent = document.getElementById("focusableElementWithAttribute");
    var oFocusableElement = document.getElementById("focusableElement");
    assert.strictEqual(this.oPopup._contains(oFocusableElement), false, "The element without the attribute isn't part of the popup");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), true, "The element with the attribute is part of the popup");
});
QUnit.test("External DOM element whose parent is marked with data-sap-ui-integration-popup-content is part of the Popup", function (assert) {
    var oExternalPopupContent = document.getElementById("focusableElementWithAttributeInParent");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), true, "The element with the attribute in parent is part of the popup");
});
QUnit.test("External DOM element marked with registerd custom attribute is part of the Popup", function (assert) {
    var oExternalPopupContent = document.getElementById("focusableElementWithCustomAttribute");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), false, "The element with the custom attribute isn't part of the popup before the selector is registered");
    Popup.addExternalContent("[data-custom-popup-content]");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), true, "The element with the custom attribute is part of the popup after the selector is registered");
    Popup.removeExternalContent("[data-custom-popup-content]");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), false, "The element with the custom attribute isn't part of the popup after the selector is removed");
});
QUnit.test("External DOM element whose parent is marked with custom attribute  is part of the Popup", function (assert) {
    var oExternalPopupContent = document.getElementById("focusableElementWithCustomAttributeInParent");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), false, "The element with the attribute in parent isn't part of the popup before the attribute is registered");
    Popup.addExternalContent("[data-custom-popup-content-1]");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), true, "The element with the custom attribute is part of the popup after the selector is registered");
    Popup.removeExternalContent("[data-custom-popup-content-1]");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), false, "The element with the custom attribute isn't part of the popup after the selector is removed");
});
QUnit.test("The default selector can't be deleted", function (assert) {
    var oExternalPopupContent = document.getElementById("focusableElementWithAttributeInParent");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), true, "The element with the attribute in parent is part of the popup");
    Popup.removeExternalContent("[data-sap-ui-integration-popup-content]");
    assert.strictEqual(this.oPopup._contains(oExternalPopupContent), true, "The element with the attribute in parent is still part of the popup");
});
QUnit.module("bug fixes", {
    beforeEach: function () {
        var oPopupDomRef = jQuery.sap.domById("popup1");
        this.oPopup = new Popup(oPopupDomRef);
    },
    afterEach: function () {
        this.oPopup.destroy();
    }
});
QUnit.test("RTL with 'my' set to 'CenterBottom', changing position again after popup is opened should work", function (assert) {
    var oStub = sinon.stub(Core.getConfiguration(), "getRTL").callsFake(function () {
        return true;
    });
    var done = assert.async();
    var my = Popup.Dock.CenterBottom;
    var at = Popup.Dock.LeftTop;
    var of = document;
    var iOffsetX = 300;
    var iOffsetY = 300;
    var iRight;
    var fnOpened = function () {
        iRight = parseInt(this.oPopup.getContent().style.right);
        assert.ok(!isNaN(iRight));
        this.oPopup.setPosition(my, at, of, (iOffsetX + 10) + " " + iOffsetY);
        assert.notEqual(parseInt(this.oPopup.getContent().style.right), iRight, "The position should be changed");
        oStub.restore();
        done();
    };
    this.oPopup.setPosition(my, at, of, iOffsetX + " " + iOffsetY);
    this.oPopup.attachOpened(fnOpened, this);
    this.oPopup.open();
});
QUnit.test("Open two modal popups and destroy the second one. Blocklayer should stay", function (assert) {
    var done = assert.async();
    this.oPopup.setModal(true);
    var oPopup2 = new Popup(jQuery.sap.domById("popup2"));
    oPopup2.setModal(true);
    var fnOpened = function () {
        oPopup2.destroy();
    };
    var fnClosed = function () {
        var $DomRefBL = jQuery.sap.byId("sap-ui-blocklayer-popup");
        assert.equal($DomRefBL.css("visibility"), "visible", "blocklayer is still visible");
        done();
    };
    oPopup2.attachOpened(fnOpened);
    oPopup2.attachClosed(fnClosed);
    this.oPopup.open();
    oPopup2.open();
});
QUnit.test("Open wrapped autoclose popup from a modal popup", function (assert) {
    var done = assert.async();
    var sandbox = sinon.sandbox.create();
    sandbox.stub(Device, "system").value({
        desktop: true
    });
    var oModalPopup = new Popup(jQuery("<div id='modalPopup'><button id='modalButton'>open modal popup</button></div>")[0]);
    oModalPopup.setModal(true);
    var fnOpened = function () {
        assert.ok(true, "the first modal popup is opened");
        var oPopupDomRef = jQuery("<div id='autoclosePopup'><button id='autocloseButton'>open</button></div>")[0];
        var oPopup = new Popup(oPopupDomRef);
        oPopup.setAutoClose(true);
        oPopup.setPosition(Popup.Dock.BeginTop, Popup.Dock.BeginBottom, jQuery.sap.domById("modalButton"));
        var fnOpened1 = function () {
            assert.ok(true, "the second popup is opened");
            var oPopupDomRef = jQuery("<div id='autoclosePopup1'><button id='autocloseButton1'>open</button></div>")[0];
            var oPopup1 = new Popup(oPopupDomRef);
            oPopup1.setAutoClose(true);
            oPopup1.setPosition(Popup.Dock.BeginTop, Popup.Dock.BeginBottom, jQuery.sap.domById("autocloseButton"));
            oPopup1.attachOpened(function () {
                assert.ok(true, "the third popup is finally opened");
                setTimeout(function () {
                    assert.ok(oPopup1.isOpen(), "the third popup should still be opened");
                    oPopup.destroy();
                    oPopup1.destroy();
                    oModalPopup.destroy();
                    sandbox.restore();
                    done();
                }, 50);
            });
            oPopup1.open(0);
        };
        oPopup.attachOpened(fnOpened1);
        oPopup.open(0);
    };
    oModalPopup.attachOpened(fnOpened);
    oModalPopup.open(0);
});
QUnit.test("The previous active element isn't blurred if the popup is opened within a popup", function (assert) {
    var done = assert.async();
    var oParentPopup = new Popup(jQuery("<div id='modalPopup'><button id='modalButton'>open modal popup</button></div>")[0]);
    oParentPopup.setModal(true);
    var fnOpened = function () {
        assert.ok(true, "the first popup is opened");
        var oPopupDomRef = jQuery("<div id='autoclosePopup'><button id='autocloseButton'>open</button></div>")[0];
        var oPopup = new Popup(oPopupDomRef);
        oPopup.setAutoClose(true);
        oPopup.setPosition(Popup.Dock.BeginTop, Popup.Dock.BeginBottom, jQuery.sap.domById("modalButton"));
        assert.equal(document.activeElement.id, "modalButton", "the focus is set into the first popup");
        var oBlurSpy = sinon.spy(document.activeElement, "blur");
        var fnOpened1 = function () {
            assert.ok(true, "the second popup is opened");
            assert.equal(oBlurSpy.callCount, 0, "the previous focus element isn't blurred");
            oPopup.destroy();
            oParentPopup.destroy();
            done();
        };
        oPopup.attachOpened(fnOpened1);
        oPopup.open(0);
    };
    oParentPopup.attachOpened(fnOpened);
    oParentPopup.open(0);
});
QUnit.test("Avoid calling getBoundingClientRect if the 'of' DOM element is removed from DOM tree", function (assert) {
    var done = assert.async();
    var my = Popup.Dock.CenterBottom;
    var at = Popup.Dock.LeftTop;
    var of = document.createElement("input");
    document.body.appendChild(of);
    this.oPopup.setPosition(my, at, of);
    this.oPopup.setFollowOf(true);
    this.oPopup.open();
    try {
        this.oPopup._oLastPosition.of = document.createElement("input");
        var oSpy = this.spy(Popup, "checkDocking");
        window.setTimeout(function () {
            assert.ok(oSpy.callCount > 0, "checkDocking method is called");
            done();
        }, 300);
    }
    catch (e) {
        assert.ok(false, "Error occurred during check docking");
        done();
    }
});
QUnit.test("Verify blockLayerChange event", function (assert) {
    var fnDone = assert.async();
    var oPopup1DomRef = document.getElementById("popup1"), oPopup1 = new Popup(oPopup1DomRef, true), oPopup2DomRef = document.getElementById("popup2"), oPopup2 = new Popup(oPopup2DomRef, true);
    var oFireBlockLayerChangeSpy;
    var fnClosingHandler = function () {
        Popup.detachBlockLayerStateChange(fnClosingHandler);
        var oSecondCallParams = oFireBlockLayerChangeSpy.getCall(1).args[1];
        assert.ok(oFireBlockLayerChangeSpy.calledTwice, "blockLayerChange event called twice");
        assert.equal(oSecondCallParams.visible, false, "Block layer should be set hidden after all popups have been closed");
        assert.ok(oSecondCallParams.zIndex, "Contains popup zIndex for setting blocking layer");
        oFireBlockLayerChangeSpy.restore();
        fnDone();
    };
    var fnOpeningHandler = function () {
        Popup.detachBlockLayerStateChange(fnOpeningHandler);
        var oFirstCallParams = oFireBlockLayerChangeSpy.getCall(0).args[1];
        assert.equal(oFirstCallParams.visible, true, "Block layer should be set visible after first popup got opened");
        assert.ok(oFirstCallParams.zIndex, "Contains blocking layer zIndex of last popup");
        Popup.attachBlockLayerStateChange(fnClosingHandler);
    };
    Popup.attachBlockLayerStateChange(fnOpeningHandler);
    oFireBlockLayerChangeSpy = sinon.spy(Popup._blockLayerStateProvider, "fireEvent");
    oPopup1.open();
    oPopup2.open();
    oPopup2.close();
    oPopup1.close();
    oPopup1.destroy();
    oPopup2.destroy();
});
QUnit.test("Align the popup correctly in cases where position is more precisely than one pixel", function (assert) {
    var done = assert.async();
    var oButton = new Button("buttonOpenPopup", { text: "Open Popup" });
    var oText = new Text("myText", { text: "This is the text shown inside the Popup." });
    var oPopup = new Popup(oText);
    var fnOpened = function (oEvent) {
        var oTextDomRef = oEvent.getSource().getContent().getDomRef();
        var sActualCSSRight = oTextDomRef.style.right;
        var fpExpectedCSSRight = jQuery(window).width() - oTextDomRef.getBoundingClientRect().width - jQuery(oTextDomRef).offset().left;
        if (sActualCSSRight.indexOf(".") > -1) {
            var iNumberOfDecimals = sActualCSSRight.split(".")[1].split("px")[0].length;
            fpExpectedCSSRight = fpExpectedCSSRight.toFixed(iNumberOfDecimals);
        }
        assert.strictEqual(sActualCSSRight, fpExpectedCSSRight + "px", "The 'right' style property is correctly calculated with value '" + sActualCSSRight + "'.");
        oText.destroy();
        oPopup.destroy();
        oButton.destroy();
        done();
    };
    oPopup.attachOpened(fnOpened);
    oButton.placeAt(document.getElementById("uiarea"));
    Core.applyChanges();
    oPopup.open("end top", "end bottom", oButton);
});
function waitTillOpen(oPopup) {
    return new Promise(function (resolve, reject) {
        var fnOpened = function () {
            oPopup.detachOpened(fnOpened);
            resolve();
        };
        oPopup.attachOpened(fnOpened);
    });
}
function waitTillClose(oPopup) {
    return new Promise(function (resolve, reject) {
        var fnClosed = function () {
            oPopup.detachClosed(fnClosed);
            resolve();
        };
        oPopup.attachClosed(fnClosed);
    });
}
function getBlockLayer() {
    return document.getElementById("sap-ui-blocklayer-popup");
}
function waitTillResize(oDomRef, iTimeout) {
    return new Promise(function (resolve, reject) {
        var sHandlerId;
        sHandlerId = ResizeHandler.register(oDomRef, function (oEvent) {
            ResizeHandler.deregister(sHandlerId);
            resolve(oEvent.target);
        });
        if (iTimeout !== undefined) {
            setTimeout(function () {
                ResizeHandler.deregister(sHandlerId);
                resolve({
                    timeout: true,
                    dom: oDomRef
                });
            }, iTimeout);
        }
    });
}
function waitTillBlockLayerResize(iTimeout) {
    return waitTillResize(getBlockLayer(), iTimeout);
}
QUnit.module("Within Area", {
    before: function () {
        Popup._bNewOffset = true;
    },
    after: function () {
        delete Popup._bNewOffset;
    }
});
QUnit.test("getWithinArea should return undefined before custom within area is set", function (assert) {
    assert.equal(Popup.getWithinArea(), undefined, "no within area is set");
    assert.equal(Popup.getWithinAreaDomRef(), window, "window is returned from getWithinAreaDomRef");
});
QUnit.test("set/getWithinArea query selector", function (assert) {
    var sSelector = "#withinArea";
    Popup.setWithinArea(sSelector);
    assert.equal(Popup.getWithinArea(), sSelector, "getter should return the same as the parameter in setter");
    assert.equal(Popup.getWithinAreaDomRef(), document.querySelector(sSelector), "Correct Dom Element is returned");
});
QUnit.test("set/getWithinArea DOM Element", function (assert) {
    var oDomRef = document.getElementById("withinArea");
    Popup.setWithinArea(oDomRef);
    assert.equal(Popup.getWithinArea(), oDomRef, "getter should return the same as the parameter in setter");
    assert.equal(Popup.getWithinAreaDomRef(), oDomRef, "Correct Dom Element is returned");
});
QUnit.test("set/getWithinArea window object", function (assert) {
    Popup.setWithinArea(window);
    assert.equal(Popup.getWithinArea(), window, "getter should return the window object");
    assert.equal(Popup.getWithinAreaDomRef(), window, "window is returned");
});
QUnit.test("set/getWithinArea sap.ui.core.Element", function (assert) {
    var oControl = new Button("withinButton", { text: "within" });
    Popup.setWithinArea(oControl);
    assert.equal(Popup.getWithinArea(), oControl, "getter should return the same as the parameter in setter");
    assert.equal(Popup.getWithinAreaDomRef(), window, "window is returned before the control is rendered");
    oControl.placeAt("uiarea");
    sap.ui.getCore().applyChanges();
    assert.equal(Popup.getWithinAreaDomRef(), oControl.getDomRef(), "Correct Dom Element returned");
});
QUnit.test("Global within is forwarded to jQuery.ui.position", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef);
    var oPositionSpy = this.spy(jQuery.fn, "position");
    Popup.setWithinArea(document.getElementById("withinArea"));
    var oWithinDomRef = Popup.getWithinAreaDomRef();
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.equal(oPositionSpy.callCount, 1, "function is called once");
        var oArgument = oPositionSpy.getCall(0).args[0];
        assert.equal(oArgument.within, oWithinDomRef, "Correct within DOM is forwarded to jQuery.ui.position");
        oPopup.destroy();
    });
    oPopup.open();
    return pPromise;
});
QUnit.test("One Popup's own within is forwarded to jQuery.ui.position", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef);
    var oPositionSpy = this.spy(jQuery.fn, "position");
    Popup.setWithinArea(document.getElementById("withinArea"));
    var oWithinDomRef = document.getElementById("withinArea1");
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.equal(oPositionSpy.callCount, 1, "function is called once");
        var oArgument = oPositionSpy.getCall(0).args[0];
        assert.equal(oArgument.within, oWithinDomRef, "Popup's own within DOM is forwarded to jQuery.ui.position");
        oPopup.destroy();
    });
    oPopup.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinDomRef);
    return pPromise;
});
QUnit.test("Blocklayer: one modal Popup with own within has the correct position", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    Popup.setWithinArea(document.getElementById("withinArea"));
    var oWithinDomRef = Popup.getWithinAreaDomRef();
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinDomRef.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        oPopup.destroy();
        Popup.setWithinArea(null);
    });
    oPopup.open();
    return pPromise;
});
QUnit.test("Blocklayer: one modal Popup with 'window' within has the correct position", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    Popup.setWithinArea(window);
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect().width, document.documentElement.clientWidth, "The blocklayer covers the entire screen width");
        assert.deepEqual(getBlockLayer().getBoundingClientRect().height, document.documentElement.clientHeight, "The blocklayer covers the entire screen height");
        oPopup.destroy();
        Popup.setWithinArea(null);
    });
    oPopup.open();
    return pPromise;
});
QUnit.test("Blocklayer: multiple modal Popup with own within have the correct position, Closing Scenario 1", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    var oWithinArea = document.getElementById("withinArea");
    var oDomRef1 = jQuery.sap.domById("popup1");
    var oPopup1 = new Popup(oDomRef1, true);
    var oWithinArea1 = document.getElementById("withinArea1");
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopup1OpenPromise = waitTillOpen(oPopup1);
        oPopup1.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea1);
        return oPopup1OpenPromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea1.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopupClosePromise = waitTillClose(oPopup);
        oPopup.close();
        return oPopupClosePromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea1.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopup1ClosePromise = waitTillClose(oPopup1);
        oPopup1.close();
        return oPopup1ClosePromise;
    }).then(function () {
        assert.strictEqual(getBlockLayer().style.visibility, "hidden", "The blocklayer is hidden from the ui.");
        oPopup.destroy();
        oPopup1.destroy();
    });
    oPopup.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea);
    return pPromise;
});
QUnit.test("Blocklayer: multiple modal Popup with own within have the correct position, Closing Scenario 2", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    var oWithinArea = document.getElementById("withinArea");
    var oDomRef1 = jQuery.sap.domById("popup1");
    var oPopup1 = new Popup(oDomRef1, true);
    var oWithinArea1 = document.getElementById("withinArea1");
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopup1OpenPromise = waitTillOpen(oPopup1);
        oPopup1.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea1);
        return oPopup1OpenPromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea1.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopup1ClosePromise = waitTillClose(oPopup1);
        oPopup1.close();
        return oPopup1ClosePromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopupClosePromise = waitTillClose(oPopup);
        oPopup.close();
        return oPopupClosePromise;
    }).then(function () {
        assert.strictEqual(getBlockLayer().style.visibility, "hidden", "The blocklayer is hidden from the ui.");
        oPopup.destroy();
        oPopup1.destroy();
    });
    oPopup.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea);
    return pPromise;
});
QUnit.test("Blocklayer: open modal popup with within and then Popup without within", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    var oWithinArea = document.getElementById("withinArea");
    var oDomRef1 = jQuery.sap.domById("popup1");
    var oPopup1 = new Popup(oDomRef1, true);
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopup1OpenPromise = waitTillOpen(oPopup1);
        oPopup1.open();
        return oPopup1OpenPromise;
    }).then(function () {
        var oClientRect = getBlockLayer().getBoundingClientRect();
        assert.equal(oClientRect.width, document.documentElement.clientWidth, "The blocklayer covers the entire screen width");
        assert.equal(oClientRect.height, document.documentElement.clientHeight, "The blocklayer covers the entire screen height");
        var oPopup1ClosePromise = waitTillClose(oPopup1);
        oPopup1.close();
        return oPopup1ClosePromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopupClosePromise = waitTillClose(oPopup);
        oPopup.close();
        return oPopupClosePromise;
    }).then(function () {
        assert.strictEqual(getBlockLayer().style.visibility, "hidden", "The blocklayer is hidden from the ui.");
        oPopup.destroy();
        oPopup1.destroy();
    });
    oPopup.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea);
    return pPromise;
});
QUnit.test("Blocklayer: open modal popup without within and then Popup with within", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    var oWithinArea = document.getElementById("withinArea");
    var oDomRef1 = jQuery.sap.domById("popup1");
    var oPopup1 = new Popup(oDomRef1, true);
    var pPromise = waitTillOpen(oPopup).then(function () {
        var oClientRect = getBlockLayer().getBoundingClientRect();
        assert.equal(oClientRect.width, document.documentElement.clientWidth, "The blocklayer covers the entire screen width");
        assert.equal(oClientRect.height, document.documentElement.clientHeight, "The blocklayer covers the entire screen height");
        var oPopup1OpenPromise = waitTillOpen(oPopup1);
        oPopup1.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea);
        return oPopup1OpenPromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopup1ClosePromise = waitTillClose(oPopup1);
        oPopup1.close();
        return oPopup1ClosePromise;
    }).then(function () {
        var oClientRect = getBlockLayer().getBoundingClientRect();
        assert.equal(oClientRect.width, document.documentElement.clientWidth, "The blocklayer covers the entire screen width");
        assert.equal(oClientRect.height, document.documentElement.clientHeight, "The blocklayer covers the entire screen height");
        var oPopupClosePromise = waitTillClose(oPopup);
        oPopup.close();
        return oPopupClosePromise;
    }).then(function () {
        assert.strictEqual(getBlockLayer().style.visibility, "hidden", "The blocklayer is hidden from the ui.");
        oPopup.destroy();
        oPopup1.destroy();
    });
    oPopup.open();
    return pPromise;
});
QUnit.test("Blocklayer: multiple modal Popup with own within have the correct position on a overflowed page", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    var oWithinArea = document.getElementById("withinArea");
    var oDomRef1 = jQuery.sap.domById("popup1");
    var oPopup1 = new Popup(oDomRef1, true);
    var oWithinArea1 = document.getElementById("withinArea1");
    var oTestContent = document.getElementById("testContent");
    var oAppDom = document.createElement("div");
    oAppDom.style.height = "1000px";
    oAppDom.style.width = "100px";
    oAppDom.style.backgroundColor = "red";
    oTestContent.appendChild(oAppDom);
    oAppDom.style.height = "2000px";
    window.scrollTo(0, 2000);
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        assert.deepEqual(getBlockLayer().style.width, "300px", "The blocklayer has the same width as the defined within area.");
    }).then(function () {
        var pBlockLayerResized = waitTillBlockLayerResize().then(function (oBlockLayerDomRef) {
            assert.deepEqual(oBlockLayerDomRef.style.width, "200px", "The blocklayer has the same width as the defined within area.");
        });
        oWithinArea.style.width = "200px";
        return pBlockLayerResized;
    }).then(function () {
        var oPopup1OpenPromise = waitTillOpen(oPopup1);
        oPopup1.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea1);
        return oPopup1OpenPromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea1.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
    }).then(function () {
        var pBlockLayerResized = waitTillBlockLayerResize(200).then(function (oTimeout) {
            assert.ok(oTimeout.timeout, "No size change on block layer");
            assert.deepEqual(oTimeout.dom.style.width, "400px", "The blocklayer has the same width as the defined within area.");
        });
        oWithinArea.style.width = "700px";
        return pBlockLayerResized;
    }).then(function () {
        var pBlockLayerResized = waitTillBlockLayerResize().then(function (oBlockLayerDomRef) {
            assert.deepEqual(oBlockLayerDomRef.style.width, "500px", "The blocklayer has the same width as the defined within area.");
        });
        oWithinArea1.style.width = "500px";
        return pBlockLayerResized;
    }).then(function () {
        var oPopup1ClosePromise = waitTillClose(oPopup1);
        oPopup1.close();
        return oPopup1ClosePromise;
    }).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinArea.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var oPopupClosePromise = waitTillClose(oPopup);
        oPopup.close();
        return oPopupClosePromise;
    }).then(function () {
        assert.strictEqual(getBlockLayer().style.visibility, "hidden", "The blocklayer is hidden from the ui.");
        oTestContent.removeChild(oAppDom);
        oPopup.destroy();
        oPopup1.destroy();
    });
    oPopup.open(undefined, undefined, undefined, undefined, undefined, undefined, oWithinArea);
    return pPromise;
});
QUnit.test("Blocklayer: resize blocklayer when within area is resized", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef, true);
    assert.expect(2);
    Popup.setWithinArea(document.getElementById("withinArea"));
    var oWithinDomRef = Popup.getWithinAreaDomRef();
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.deepEqual(getBlockLayer().getBoundingClientRect(), oWithinDomRef.getBoundingClientRect(), "The blocklayer has the same dimensions as the defined within area.");
        var pBlockLayerResized = waitTillBlockLayerResize().then(function (oBlockLayerDomRef) {
            assert.deepEqual(oBlockLayerDomRef.style.width, "300px", "The blocklayer has the same width as the defined within area.");
            oPopup.destroy();
            Popup.setWithinArea(null);
        });
        oWithinDomRef.style.width = "300px";
        return pBlockLayerResized;
    });
    oPopup.open();
    return pPromise;
});
QUnit.test("Global within is updated after a popup is opened and open the popup again to check", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef);
    var oPositionSpy = this.spy(jQuery.fn, "position");
    var oWithinDomRef = document.getElementById("withinArea");
    Popup.setWithinArea(oWithinDomRef);
    var oWithinDomRef1 = document.getElementById("withinArea1");
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.equal(oPositionSpy.callCount, 1, "function is called once");
        var oArgument = oPositionSpy.getCall(0).args[0];
        assert.equal(oArgument.within, oWithinDomRef, "Global within DOM is forwarded to jQuery.ui.position");
    }).then(function () {
        Popup.setWithinArea(oWithinDomRef1);
        assert.equal(oPositionSpy.callCount, 1, "Popup is not positioned again");
        var oClosedPromise = waitTillClose(oPopup);
        oPopup.close();
        return oClosedPromise;
    }).then(function () {
        var oOpenedPromise = waitTillOpen(oPopup);
        oPopup.open();
        return oOpenedPromise;
    }).then(function () {
        assert.equal(oPositionSpy.callCount, 2, "Popup is positioned again");
        var oArgument = oPositionSpy.getCall(1).args[0];
        assert.equal(oArgument.within, oWithinDomRef1, "Updated global within DOM is forwarded to jQuery.ui.position");
        oPopup.destroy();
    });
    oPopup.open();
    return pPromise;
});
QUnit.test("Global within is updated after a popup that has its own within is opened and open the popup again to check", function (assert) {
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef);
    var oPositionSpy = this.spy(jQuery.fn, "position");
    var oWithinDomRef = document.getElementById("withinArea");
    var oWithinDomRef1 = document.getElementById("withinArea1");
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.equal(oPositionSpy.callCount, 1, "function is called once");
        var oArgument = oPositionSpy.getCall(0).args[0];
        assert.equal(oArgument.within, oWithinDomRef, "Popup's own within DOM is forwarded to jQuery.ui.position");
    }).then(function () {
        Popup.setWithinArea(oWithinDomRef1);
        assert.equal(oPositionSpy.callCount, 1, "Popup is not positioned again");
        var oClosedPromise = waitTillClose(oPopup);
        oPopup.close();
        return oClosedPromise;
    }).then(function () {
        var oOpenedPromise = waitTillOpen(oPopup);
        oPopup.open();
        return oOpenedPromise;
    }).then(function () {
        assert.equal(oPositionSpy.callCount, 2, "Popup is positioned again");
        var oArgument = oPositionSpy.getCall(1).args[0];
        assert.equal(oArgument.within, oWithinDomRef, "Popup's own within DOM is forwarded to jQuery.ui.position");
        oPopup.destroy();
    });
    oPopup.setPosition(Popup.Dock.BeginTop, Popup.Dock.BeginBottom, undefined, undefined, undefined, oWithinDomRef);
    oPopup.open();
    return pPromise;
});
QUnit.test("Global within set with a control and check after the control is rendered", function (assert) {
    var MyCustomControl = Control.extend("MyCustomControl", {
        renderer: function (oRM, oControl) {
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.addStyle("width", "400px");
            oRM.addStyle("height", "400px");
            oRM.writeStyles();
            oRM.write(">");
            oRM.write("</div>");
        }
    });
    var oControl = new MyCustomControl();
    oControl.placeAt("uiarea");
    sap.ui.getCore().applyChanges();
    var oDomRef = jQuery.sap.domById("popup");
    var oPopup = new Popup(oDomRef);
    var oPositionSpy = this.spy(jQuery.fn, "position");
    var pPromise = waitTillOpen(oPopup).then(function () {
        assert.equal(oPositionSpy.callCount, 1, "function is called once");
        var oArgument = oPositionSpy.getCall(0).args[0];
        assert.equal(oArgument.within, oControl.getDomRef(), "Correct DOM element is forwarded to jQuery.ui.position");
    }).then(function () {
        var oClosedPromise = waitTillClose(oPopup);
        oPopup.close();
        return oClosedPromise;
    }).then(function () {
        oControl.rerender();
        var oOpenedPromise = waitTillOpen(oPopup);
        oPopup.open();
        return oOpenedPromise;
    }).then(function () {
        assert.equal(oPositionSpy.callCount, 2, "Popup is positioned again");
        var oArgument = oPositionSpy.getCall(1).args[0];
        assert.equal(oArgument.within, oControl.getDomRef(), "Rerendered DOM element is forwarded to jQuery.ui.position");
        oPopup.destroy();
    });
    oPopup.setPosition(Popup.Dock.BeginTop, Popup.Dock.BeginBottom, undefined, undefined, undefined, oControl);
    oPopup.open();
    return pPromise;
});