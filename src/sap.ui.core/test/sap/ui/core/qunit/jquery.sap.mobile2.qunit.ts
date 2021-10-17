QUnit.test("Test initMobile with custom settings", function (assert) {
    jQuery.sap.initMobile({
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