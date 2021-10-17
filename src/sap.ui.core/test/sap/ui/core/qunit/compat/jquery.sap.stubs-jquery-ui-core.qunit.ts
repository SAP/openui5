function isStubbed(oTarget, sProperty) {
    var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
    return descriptor && descriptor.get && descriptor.get["jquery.sap.stubs"];
}
QUnit.module("jquery.sap.stubs / jquery-ui-core");
QUnit.test("Should not trigger lazy stubs when loading jquery-ui-core", function (assert) {
    var done = assert.async();
    var oRequireSyncSpy = this.spy(sap.ui, "requireSync");
    assert.equal(sap.ui.require("jquery.sap.stubs"), undefined, "jquery.sap.stubs should not be loaded");
    assert.equal(sap.ui.require("sap/ui/thirdparty/jqueryui/jquery-ui-core"), undefined, "jquery-ui-core should not be loaded");
    sap.ui.require(["jquery.sap.stubs"], function (jQuery) {
        assert.ok(isStubbed(jQuery.fn, "zIndex"), "jQuery.fn.zIndex should be stubbed");
        assert.ok(isStubbed(jQuery.fn, "enableSelection"), "jQuery.fn.enableSelection should be stubbed");
        assert.ok(isStubbed(jQuery.fn, "disableSelection"), "jQuery.fn.disableSelection should be stubbed");
        assert.ok(isStubbed(jQuery.expr.pseudos, "focusable"), "jQuery.expr.pseudos.focusable should be stubbed");
        assert.ok(isStubbed(jQuery.expr[":"], "focusable"), "jQuery.expr[ \":\" ].focusable should be stubbed");
        sap.ui.require(["sap/ui/thirdparty/jqueryui/jquery-ui-core"], function () {
            assert.equal(sap.ui.require("sap/ui/dom/jquery/zIndex"), undefined, "sap/ui/dom/jquery/zIndex should not be loaded");
            assert.equal(sap.ui.require("sap/ui/dom/jquery/Selection"), undefined, "sap/ui/dom/jquery/Selection should not be loaded");
            assert.equal(sap.ui.require("sap/ui/dom/jquery/Selectors"), undefined, "sap/ui/dom/jquery/Selectors should not be loaded");
            assert.equal(typeof jQuery.fn.zIndex, "function", "jQuery.fn.zIndex should be a function");
            assert.equal(typeof jQuery.fn.enableSelection, "function", "jQuery.fn.enableSelection should be a function");
            assert.equal(typeof jQuery.fn.disableSelection, "function", "jQuery.fn.disableSelection should be a function");
            assert.equal(typeof jQuery.expr.pseudos.focusable, "function", "jQuery.expr.pseudos.focusable should be a function");
            assert.equal(typeof jQuery.expr[":"].focusable, "function", "jQuery.expr[ \":\" ].focusable should be a function");
            assert.ok(oRequireSyncSpy.notCalled, "requireSync should not be called");
            done();
        });
    });
});