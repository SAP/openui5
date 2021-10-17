import BusyIndicator from "sap/ui/core/BusyIndicator";
QUnit.module("RTL-mode", {
    beforeEach: function () {
    },
    afterEach: function () {
        BusyIndicator.hide(0);
    }
});
QUnit.test("Check If Animation is Centered in RTL-mode", function (assert) {
    var done = assert.async();
    BusyIndicator.show(100);
    setTimeout(function () {
        var $Popup = jQuery("#sapUiBusyIndicator");
        assert.equal($Popup.length, 1, "BusyIndicator should be visible");
        var $Animation = $Popup.find(".sapUiLocalBusyIndicatorAnimation");
        assert.equal($Animation.length, 1, "BusyIndicator animation should be visible");
        var oClientRects = $Animation.get(0).getClientRects()[0];
        var iAnimationRight = parseInt(oClientRects.right);
        var iDocWidth = document.body.offsetWidth;
        var iDocLeftPosition = parseInt(iDocWidth / 2);
        var bCentered = iDocLeftPosition - 10 < iAnimationRight && iDocLeftPosition + 10 > iAnimationRight;
        assert.ok(bCentered, "Animation should be centered at +/- 10 of " + iDocLeftPosition + " and is at left-position " + iAnimationRight);
        done();
    }, 500);
});