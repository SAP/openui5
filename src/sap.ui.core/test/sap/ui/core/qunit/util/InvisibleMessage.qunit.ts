import Core from "sap/ui/core/Core";
import coreLibrary from "sap/ui/core/library";
import InvisibleMessage from "sap/ui/core/InvisibleMessage";
import Log from "sap/base/Log";
import sinon from "sap/ui/thirdparty/sinon";
var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;
QUnit.test("Element creation", function (assert) {
    var oInstance = InvisibleMessage.getInstance(), oSecondInstance = new InvisibleMessage();
    assert.ok(oInstance, "element must have been created");
    assert.ok(oInstance === oSecondInstance, "There should be a single instance of the class.");
});
QUnit.test("Element announcing", function (assert) {
    var oInvisibleMessage = InvisibleMessage.getInstance(), oStatic = Core.getStaticAreaRef(), fnInfoSpy = this.spy(Log, "info"), oPoliteMarkup, oAssertiveMarkup;
    oInvisibleMessage.announce("Announcement", "invalidMode");
    oInvisibleMessage.announce("Announcement", InvisibleMessageMode.Assertive);
    oInvisibleMessage.announce("<script>alert('xss')</script>", InvisibleMessageMode.Polite);
    oPoliteMarkup = oStatic.querySelector(".sapUiInvisibleMessagePolite");
    oAssertiveMarkup = oStatic.querySelector(".sapUiInvisibleMessageAssertive");
    assert.strictEqual(oPoliteMarkup.innerHTML, "&lt;script&gt;alert('xss')&lt;/script&gt;", "HTML tags are escaped");
    assert.strictEqual(oAssertiveMarkup.textContent, "Announcement", "The text of the assertive span should have been changed.");
    assert.ok(fnInfoSpy.called, "An info message should be displayed when calling the method with invalid mode.");
});
QUnit.test("Clearing of element content", function (assert) {
    var oInvisibleMessage = InvisibleMessage.getInstance(), oStatic = Core.getStaticAreaRef(), oAssertiveMarkup;
    this.clock = sinon.useFakeTimers();
    oInvisibleMessage.announce("Announcement", InvisibleMessageMode.Assertive);
    oAssertiveMarkup = oStatic.querySelector(".sapUiInvisibleMessageAssertive");
    assert.strictEqual(oAssertiveMarkup.textContent, "Announcement", "The text of the assertive span should have been changed.");
    this.clock.tick(4000);
    sap.ui.getCore().applyChanges();
    assert.strictEqual(oAssertiveMarkup.textContent, "", "The text of the assertive span should be cleared out.");
});