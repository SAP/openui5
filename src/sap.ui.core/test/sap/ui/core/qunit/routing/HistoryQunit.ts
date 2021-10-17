import createUID from "sap/base/util/uid";
import HashChanger from "sap/ui/core/routing/HashChanger";
import History from "sap/ui/core/routing/History";
import coreLibrary from "sap/ui/core/library";
import Device from "sap/ui/Device";
var HistoryDirection = coreLibrary.routing.HistoryDirection;
var sHashPrefix = window.sHashPrefix || "";
var HashChangeEvent = function (sHash) {
    this.getParameter = function () {
        return sHash;
    };
};
QUnit.test("Should record a hash change", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    assert.strictEqual(sut.aHistory.length, 3, "should have 3 entries in the history");
    assert.strictEqual(sut.aHistory[0], "", "the first entry is the initial hash");
    assert.strictEqual(sut.aHistory[1], "foo");
    assert.strictEqual(sut.aHistory[2], "bar");
});
QUnit.test("Should not record a hash replace", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.replaceHash("bar");
    assert.strictEqual(sut.aHistory.length, 2, "should have 2 entries in the history");
    assert.strictEqual(sut.aHistory[0], "", "should have the initial value first");
    assert.strictEqual(sut.aHistory[1], "bar", "should have the replace value");
});
QUnit.test("Should replace an entry in the history if replace takes place", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.replaceHash("bar");
    assert.strictEqual(sut.aHistory.length, 1, "should have 1 entry in the history");
    assert.strictEqual(sut.aHistory[0], "bar", "should have bar as value");
});
QUnit.test("Should return newPage if a page was added to the history", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var uid = createUID();
    var sut = History.getInstance();
    oHashChanger.setHash(uid);
    assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should be a new entry");
});
QUnit.test("Should return Unknown if the navigation direction is still unknown", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    assert.strictEqual(sut.getDirection(), undefined);
    assert.strictEqual(sut.getDirection("biz"), undefined);
    sut._hashChange("foo");
    assert.strictEqual(sut.getDirection(""), HistoryDirection.Unknown);
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown);
    sut._hashChange("bar");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown);
    assert.strictEqual(sut.getDirection("foo"), HistoryDirection.Unknown);
    sut._hashChange("foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown);
    assert.strictEqual(sut.getDirection("foo"), HistoryDirection.Unknown);
});
QUnit.test("Should return NewEntry if the navigation direction is undefined but hashChanger triggered it", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    sut._hashSet(new HashChangeEvent("foo"));
    sut._hashChange("foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should be a new entry");
});
QUnit.test("Should return Unknown if the hash changes to something unexpected", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    sut._hashSet(new HashChangeEvent("foo"));
    sut._hashChange("bar");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be unknown");
});
QUnit.test("Should return undefined if the first hash is only an replacement", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.replaceHash("foo");
    assert.strictEqual(sut.getDirection(), undefined, "should be undefined");
});
QUnit.test("Should return Unknown after a hash replacement", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    hasher.replaceHash(sHashPrefix + "foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be backwards");
    oHashChanger.replaceHash("baz");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be unknown");
});
QUnit.test("Should return Backwards if the hash was replaced before", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.replaceHash("bar");
    oHashChanger.setHash("baz");
    hasher.replaceHash(sHashPrefix + "bar");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be backwards because we changed to bar");
    assert.strictEqual(sut.getDirection(""), HistoryDirection.Backwards, "should be backwards because it was the initial");
    assert.strictEqual(sut.getDirection("baz"), HistoryDirection.Forwards, "should be forwards");
    assert.strictEqual(sut.getDirection("foo"), HistoryDirection.Unknown, "should be unknown");
});
QUnit.test("Should return Backwards if the hash was replaced before with the latest hash also in the history back", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("baz");
    oHashChanger.replaceHash("bar");
    oHashChanger.setHash("baz");
    hasher.replaceHash(sHashPrefix + "bar");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be backwards because we were going back");
    assert.strictEqual(sut.getDirection("foo"), HistoryDirection.Backwards, "should be backwards because it was the last hash");
    assert.strictEqual(sut.getDirection("baz"), HistoryDirection.Forwards, "should be unknown");
});
QUnit.test("Should return NewEntry if the navigation direction is still unknown but hashChanger triggered it", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    sut._hashChange("bar");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be Unknown");
    oHashChanger.setHash("foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should be a new entry");
});
QUnit.test("Should detect a backward navigation", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    hasher.replaceHash(sHashPrefix + "foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be a forwards navigation");
});
QUnit.test("Should detect a forward navigation", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    hasher.replaceHash(sHashPrefix + "foo");
    hasher.replaceHash(sHashPrefix + "bar");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Forwards, "should be a forwards navigation");
});
QUnit.test("Should detect unknown navigation after initialization", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    sut._hashSet(new HashChangeEvent("foo"));
    sut._hashChange("foo");
    sut._hashChange("bar");
    sut._hashSet(new HashChangeEvent("foo"));
    sut._hashChange("foo");
    sut._hashChange("bar");
    sut._hashChange("foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be an unknown navigation");
    assert.strictEqual(sut.aHistory.length, 1, "history should be cleaned after unknown occured");
    sut._hashChange("any");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be an unknown navigation");
    sut._hashSet(new HashChangeEvent("thing"));
    sut._hashChange("thing");
    assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should add a newpage again");
    assert.strictEqual(sut.aHistory.length, 2, "should have 2 entries in the history");
    assert.strictEqual(sut.aHistory[1], "thing");
});
QUnit.test("Should clean up the history", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    hasher.replaceHash(sHashPrefix + "foo");
    oHashChanger.setHash("biz");
    assert.strictEqual(sut.iHistoryPosition, 2, "should be at entry 2 of the history");
    assert.strictEqual(sut.aHistory.length, 3, "should have 3 entries in the history");
    hasher.replaceHash(sHashPrefix + "foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be a forwards navigation");
    assert.strictEqual(sut.iHistoryPosition, 1, "should be at entry one of the history");
    assert.strictEqual(sut.aHistory.length, 3, "should have 2 entries in the history");
});
QUnit.test("Should get the previous hash if there was no history before", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    assert.strictEqual(sut.getPreviousHash(), undefined, "should have foo as the previous page");
});
QUnit.test("Should get the previous hash if there was a replacement before", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.replaceHash("bar");
    oHashChanger.setHash("baz");
    assert.strictEqual(sut.getPreviousHash(), "bar", "should have foo as the previous page");
});
QUnit.test("Should get the previous hash if the unknown state occures", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    oHashChanger.setHash("foo");
    hasher.replaceHash(sHashPrefix + "bar");
    hasher.replaceHash(sHashPrefix + "foo");
    assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be a forwards navigation");
    assert.strictEqual(sut.getPreviousHash(), undefined, "should not have a previous page");
});
QUnit.test("Should get the previous hash when going backwards", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = new History(oHashChanger);
    oHashChanger.setHash("foo");
    oHashChanger.setHash("bar");
    oHashChanger.setHash("baz");
    hasher.replaceHash(sHashPrefix + "bar");
    assert.strictEqual(sut.getPreviousHash(), "foo", "should have foo as the previous page");
});
QUnit.test("Should return new Entry if the browser history length increases", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var oHistory = new History(oHashChanger);
    oHistory._iHistoryLength = history.length - 1;
    oHashChanger.fireEvent("hashSet", { sHash: "foo" });
    oHashChanger.fireHashChanged("foo");
    assert.strictEqual(oHistory.getDirection(), HistoryDirection.NewEntry, "should detect a forward navigation");
    assert.strictEqual(oHistory._iHistoryLength, history.length, "should detect a forward navigation");
});
QUnit.test("Should set the hashChanger", function (assert) {
    var oInitialHashChanger = new HashChanger();
    var oSecondHashChanger = new HashChanger();
    oInitialHashChanger.init();
    oSecondHashChanger.init();
    var oHistory = new History(oInitialHashChanger);
    oInitialHashChanger.setHash("foo");
    oHistory._setHashChanger(oSecondHashChanger);
    assert.strictEqual(oHistory.aHistory[1], "foo", "should reflect changes of the first hashchanger");
    oInitialHashChanger.fireHashChanged("bar");
    assert.strictEqual(oHistory.aHistory.length, 2, "should still have 2 entries in the history");
    oSecondHashChanger.setHash("bar");
    assert.strictEqual(oHistory.aHistory.length, 3, "should have 3 entries in the history");
    assert.strictEqual(oHistory.aHistory[2], "bar", "Did add an entry bar to the history");
});
QUnit.test("Should return forward if you go back and ask for the direction of the next hash, before the hash is actually set", function (assert) {
    var oHashChanger = new HashChanger();
    oHashChanger.init();
    var oHistory = new History(oHashChanger);
    oHashChanger.fireEvent("hashSet", { sHash: "foo" });
    oHashChanger.fireHashChanged("foo");
    oHashChanger.fireEvent("hashSet", { sHash: "bar" });
    oHashChanger.fireHashChanged("bar");
    oHashChanger.fireHashChanged("foo");
    oHashChanger.fireEvent("hashSet", { sHash: "bar" });
    var sDirection = oHistory.getDirection("bar");
    assert.strictEqual(sDirection, "Forwards", "After going back to foo, bar should be forwards");
});
QUnit.test("Should attach listener to each of the history relevant event names", function (assert) {
    var oHashChanger = new HashChanger(), aEventsInfo = [{ name: "foo" }, { name: "bar" }];
    oHashChanger.getRelevantEventsInfo = function () {
        return aEventsInfo;
    };
    oHashChanger.init();
    aEventsInfo.forEach(function (oEventInfo) {
        assert.ok(!oHashChanger.hasListeners(oEventInfo.name), "HashChanger doesn't have listener for event " + oEventInfo.name + " before History is attached to it");
    });
    assert.ok(!oHashChanger.hasListeners("hashChanged"), "HashChanger doesn't have listener for event hashChanged");
    var oHistory = new History(oHashChanger);
    aEventsInfo.forEach(function (oEventInfo) {
        assert.ok(oHashChanger.hasListeners(oEventInfo.name), "HashChanger has listener for event " + oEventInfo.name + " after History is attached to it");
    });
    assert.ok(!oHashChanger.hasListeners("hashChanged"), "HashChanger doesn't have listener for event hashChanged");
    oHistory.destroy();
    oHashChanger.destroy();
});
QUnit.test("Should save the initial hash without slash", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var iStateHistoryLength = History._aStateHistory.length;
    new History(oHashChanger);
    if (!History._bUsePushState) {
        assert.strictEqual(History._aStateHistory.length, iStateHistoryLength, "The push state isn't supported therefore no hash is stored");
    }
    else {
        assert.ok(History._aStateHistory[History._aStateHistory.length - 1].charAt(0) !== "#", "The hash with no leading # is inserted");
    }
});