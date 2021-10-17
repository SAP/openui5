import Mobile from "sap/ui/util/Mobile";
import Device from "sap/ui/Device";
var fnRemoveViewort = function () {
    jQuery("meta").filter("[name=viewport]").remove();
};
QUnit.module("sap/ui/util/Mobile", {
    beforeEach: fnRemoveViewort,
    afterEach: fnRemoveViewort
});
QUnit.test("Test init with default settings", function (assert) {
    Mobile.init();
    var $v = jQuery("meta").filter("[name=viewport]");
    assert.equal($v.length, 1, "There should be a viewport meta tag");
    assert.ok($v.attr("content").length > 0, "viewport meta tag has content");
    if (Device.os.ios) {
        var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
        var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
        assert.equal($amwac.length, 1, "There should be an apple-mobile-web-app-capable meta tag");
        assert.equal($amwac.attr("content"), "yes", "The apple-mobile-web-app-capable meta tag content should be correct");
        assert.equal($mwac.length, 0, "There shouldn't be any mobile-web-app-capable meta tag due to compatibility");
    }
    if (Device.os.ios) {
        var $sb = jQuery("meta").filter("[name=apple-mobile-web-app-status-bar-style]");
        assert.equal($sb.length, 1, "There should be an apple-mobile-web-app-status-bar-style meta tag");
        assert.equal($sb.attr("content"), "default", "The apple-mobile-web-app-status-bar-style meta tag content should be correct");
    }
    var $ti = jQuery("link").filter("[rel=apple-touch-icon]");
    assert.equal($ti.length, 0, "There should be no apple-touch-icon tag");
    assert.equal(window.innerHeight, Device.resize.height, "Device.resize.height is set correctly.");
    assert.equal(window.innerWidth, Device.resize.width, "Device.resize.width is set correctly.");
});
QUnit.test("Test init with custom settings", function (assert) {
    Mobile.init({
        viewport: false,
        statusBar: "black",
        homeIcon: "home.png",
        homeIconPrecomposed: true
    });
    var $v = jQuery("meta").filter("[name=viewport]");
    assert.equal($v.length, 0, "There should be no viewport meta tag");
    var $ti = jQuery("link").filter("[rel=apple-touch-icon-precomposed]");
    assert.equal($ti.length, 4, "There should be four apple-touch-icon-precomposed link tags");
    assert.equal($ti.attr("href"), "home.png", "The apple-touch-icon-precomposed link tag href should be correct");
});
QUnit.module("sap/ui/util/Mobile (tablet)", {
    beforeEach: function () {
        var oSystem = {
            tablet: true
        };
        (function (newValue) {
            var _orig = Device.system;
            Device.system = newValue;
            Device.system.restore = function () {
                Device.system = _orig;
            };
        })(oSystem);
        fnRemoveViewort();
    },
    afterEach: function () {
        Device.system.restore();
        fnRemoveViewort();
    }
});
QUnit.test("Test setWebAppCapable", function (assert) {
    Mobile.setWebAppCapable(true);
    var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
    var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
    assert.equal($amwac.length, 1, "There should be one apple-mobile-web-app-capable meta tag");
    assert.equal($amwac.attr("content"), "yes", "content is set to yes");
    assert.equal($mwac.length, 1, "There should be one mobile-web-app-capable meta tag");
    assert.equal($mwac.attr("content"), "yes", "content is set to yes");
    Mobile.setWebAppCapable(true);
    $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
    $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
    assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
    assert.equal($amwac.attr("content"), "yes", "content is set to yes");
    assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
    assert.equal($mwac.attr("content"), "yes", "content is set to yes");
    Mobile.setWebAppCapable(false);
    $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
    $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
    assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
    assert.equal($amwac.attr("content"), "no", "content is set to no");
    assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
    assert.equal($mwac.attr("content"), "no", "content is set to no");
});
QUnit.module("sap/ui/util/Mobile (retina)", {
    beforeEach: function () {
        this.retina = jQuery.support.retina;
        jQuery.support.retina = true;
        fnRemoveViewort();
    },
    afterEach: function () {
        jQuery.support.retina = this.retina;
        fnRemoveViewort();
    }
});
QUnit.test("Test init with resolution-specific home icons", function (assert) {
    Mobile.init({
        homeIcon: {
            "phone": "phone-icon.png",
            "phone@2": "phone-retina.png",
            "tablet": "tablet-icon.png",
            "tablet@2": "tablet-retina.png",
            "icon": "desktop.ico"
        },
        homeIconPrecomposed: false
    });
    var $ti = jQuery("link").filter("[rel=apple-touch-icon-precomposed]");
    assert.equal($ti.length, 0, "There should be no apple-touch-icon-precomposed link tag");
    $ti = jQuery("link").filter("[rel=apple-touch-icon]");
    assert.equal($ti.length, 4, "There should be four apple-touch-icon link tags");
    assert.equal($ti.filter(":eq(0)").attr("href"), "phone-icon.png", "The apple-touch-icon link tag href should be correct");
    assert.equal($ti.filter(":eq(1)").attr("href"), "tablet-icon.png", "The apple-touch-icon link tag href should be correct");
    assert.equal($ti.filter(":eq(2)").attr("href"), "phone-retina.png", "The apple-touch-icon link tag href should be correct");
    assert.equal($ti.filter(":eq(3)").attr("href"), "tablet-retina.png", "The apple-touch-icon link tag href should be correct");
    var $si = jQuery("link").filter("[rel=icon]");
    assert.equal($si.length, 1, "There should be one icon tag");
    assert.equal($si.attr("href"), "desktop.ico", "The icon link tag href should be correct");
});