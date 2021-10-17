import Device from "sap/ui/Device";
QUnit.module("Test initMobile");
QUnit.test("Test initMobile with default settings", function (assert) {
    jQuery.sap.initMobile();
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
});
QUnit.test("Test setWebAppCapable ", function (assert) {
    var oSystem = {
        tablet: true
    };
    this.stub(Device, "system").value(oSystem);
    jQuery.sap.setMobileWebAppCapable(true);
    var $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
    var $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
    assert.equal($amwac.length, 1, "There should be one apple-mobile-web-app-capable meta tag");
    assert.equal($amwac.attr("content"), "yes", "content is set to yes");
    assert.equal($mwac.length, 1, "There should be one mobile-web-app-capable meta tag");
    assert.equal($mwac.attr("content"), "yes", "content is set to yes");
    jQuery.sap.setMobileWebAppCapable(true);
    $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
    $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
    assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
    assert.equal($amwac.attr("content"), "yes", "content is set to yes");
    assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
    assert.equal($mwac.attr("content"), "yes", "content is set to yes");
    jQuery.sap.setMobileWebAppCapable(false);
    $amwac = jQuery("meta").filter("[name=apple-mobile-web-app-capable]");
    $mwac = jQuery("meta").filter("[name=mobile-web-app-capable]");
    assert.equal($amwac.length, 1, "There should still be one apple-mobile-web-app-capable meta tag");
    assert.equal($amwac.attr("content"), "no", "content is set to no");
    assert.equal($mwac.length, 1, "There should still be one mobile-web-app-capable meta tag");
    assert.equal($mwac.attr("content"), "no", "content is set to no");
});