// The functionality of the sap.ui.core.routing.History heavily depends on the events of the HashChanger.
// The HashChanger allows to replace the default instance with a custom implementation to intercept the logic -
// this is currently done by the unified shell in order to handle cross-application navigation.
// Factoring out the unit tests into this module allows to execute the same test suite in the shell context
//
// The sinon-qunit-bridge isn't available in ushell therefore the sinon sandbox isn't available in each test

/*global QUnit, hasher*/
sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History",
	"sap/ui/core/library",
	"sap/ui/Device"
], function(createUID, HashChanger, History, coreLibrary, Device) {
	"use strict";

	var HistoryDirection = coreLibrary.routing.HistoryDirection;

	// allow the shell navigation test to set a prefix; relevant for the cases when we directly set the hash via hasher
	var sHashPrefix = window.sHashPrefix || "";

	var HashChangeEvent = function(sHash) {
		this.getParameter = function () {
			return sHash;
		};
	};

	QUnit.test("Should record a hash change", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.setHash("bar");

		//Assert
		assert.strictEqual(sut.aHistory.length, 3, "should have 3 entries in the history");
		assert.strictEqual(sut.aHistory[0], "", "the first entry is the initial hash");
		assert.strictEqual(sut.aHistory[1], "foo");
		assert.strictEqual(sut.aHistory[2], "bar");
	});

	QUnit.test("Should not record a hash replace", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo"); // get rid of the unknown state
		oHashChanger.replaceHash("bar"); //replace with bar

		//Assert
		assert.strictEqual(sut.aHistory.length, 2, "should have 2 entries in the history");
		assert.strictEqual(sut.aHistory[0], "", "should have the initial value first");
		assert.strictEqual(sut.aHistory[1], "bar", "should have the replace value");
	});

	QUnit.test("Should replace an entry in the history if replace takes place", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.replaceHash("bar"); //replace with bar

		//Assert
		assert.strictEqual(sut.aHistory.length, 1, "should have 1 entry in the history");
		assert.strictEqual(sut.aHistory[0], "bar", "should have bar as value");
	});

	QUnit.test("Should return newPage if a page was added to the history", function(assert) {
		var oHashChanger = HashChanger.getInstance();
		//Arrange
		var uid = createUID();

		//System under Test
		var sut = History.getInstance();

		//Act
		oHashChanger.setHash(uid);

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should be a new entry");
	});

	QUnit.test("Should return Unknown if the navigation direction is still unknown", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act + Assert
		assert.strictEqual(sut.getDirection(), undefined); //since we did not navigate yet
		assert.strictEqual(sut.getDirection("biz"), undefined); //since we did not navigate yet

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

	QUnit.test("Should return NewEntry if the navigation direction is undefined but hashChanger triggered it", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		sut._hashSet(new HashChangeEvent("foo")); // get rid of the unknown state

		//Act
		sut._hashChange("foo");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should be a new entry");
	});

	QUnit.test("Should return Unknown if the hash changes to something unexpected", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		sut._hashSet(new HashChangeEvent("foo")); // get rid of the unknown state

		//Act
		sut._hashChange("bar");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be unknown");
	});

	QUnit.test("Should return undefined if the first hash is only an replacement", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.replaceHash("foo");

		//Assert
		assert.strictEqual(sut.getDirection(), undefined, "should be undefined");
	});

	QUnit.test("Should return Unknown after a hash replacement", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.setHash("bar"); // add a new entry

		//simulate browser back
		hasher.replaceHash(sHashPrefix + "foo");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be backwards");

		//Act
		oHashChanger.replaceHash("baz");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be unknown");
	});

	QUnit.test("Should return Backwards if the hash was replaced before", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo"); // no unknown state
		oHashChanger.replaceHash("bar"); //replace to bar
		oHashChanger.setHash("baz"); // add a new entry

		//simulate browser back
		hasher.replaceHash(sHashPrefix + "bar");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be backwards because we changed to bar");
		assert.strictEqual(sut.getDirection(""), HistoryDirection.Backwards, "should be backwards because it was the initial");
		assert.strictEqual(sut.getDirection("baz"), HistoryDirection.Forwards, "should be forwards");
		assert.strictEqual(sut.getDirection("foo"), HistoryDirection.Unknown, "should be unknown");
	});

	QUnit.test("Should return Backwards if the hash was replaced before with the latest hash also in the history back", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo"); // no unknown state
		oHashChanger.setHash("baz"); // add a new entry that matches the backwards entrie
		oHashChanger.replaceHash("bar"); //replace to bar
		oHashChanger.setHash("baz"); // add the same new entry again - browser history now looks like this foo - baz

		//simulate browser back - use replace here so the history plugin will not think it is a new entry because the window.history.length increased
		hasher.replaceHash(sHashPrefix + "bar");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be backwards because we were going back");
		assert.strictEqual(sut.getDirection("foo"), HistoryDirection.Backwards, "should be backwards because it was the last hash");
		assert.strictEqual(sut.getDirection("baz"), HistoryDirection.Forwards, "should be unknown");
	});

	QUnit.test("Should return NewEntry if the navigation direction is still unknown but hashChanger triggered it", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		sut._hashChange("bar"); //make the state unknown
		assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be Unknown");

		//Act
		oHashChanger.setHash("foo");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should be a new entry");
	});

	QUnit.test("Should detect a backward navigation", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.setHash("bar");

		//Simulate a backwards navigation
		hasher.replaceHash(sHashPrefix + "foo");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be a forwards navigation");
	});

	QUnit.test("Should detect a forward navigation", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.setHash("bar");

		//Simulate a backwards navigation
		hasher.replaceHash(sHashPrefix + "foo");
		//Simulate a forwards navigation
		hasher.replaceHash(sHashPrefix + "bar");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Forwards, "should be a forwards navigation");
	});

	QUnit.test("Should detect unknown navigation after initialization", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		sut._hashSet(new HashChangeEvent("foo")); // get rid of the unknown state

		//Act
		sut._hashChange("foo");
		sut._hashChange("bar");
		sut._hashSet(new HashChangeEvent("foo")); //explicity tell the app that foo is added again
		sut._hashChange("foo");

		//now we have a history that looks like this : foo - bar(current position) - foo
		sut._hashChange("bar");

		//now we navigate to fee and we don't know which direction we took...
		sut._hashChange("foo");

		//Assert
		assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be an unknown navigation");
		assert.strictEqual(sut.aHistory.length, 1, "history should be cleaned after unknown occured");

		//since the app did not navigate again its still unknown
		sut._hashChange("any");

		assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be an unknown navigation");

		sut._hashSet(new HashChangeEvent("thing")); // get rid of the unknown state
		sut._hashChange("thing");
		assert.strictEqual(sut.getDirection(), HistoryDirection.NewEntry, "should add a newpage again");

		assert.strictEqual(sut.aHistory.length, 2, "should have 2 entries in the history");
		assert.strictEqual(sut.aHistory[1], "thing");
	});

	QUnit.test("Should clean up the history", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.setHash("bar");

		hasher.replaceHash(sHashPrefix + "foo");
		oHashChanger.setHash("biz");

		//Assert
		assert.strictEqual(sut.iHistoryPosition, 2, "should be at entry 2 of the history");
		assert.strictEqual(sut.aHistory.length, 3, "should have 3 entries in the history");

		hasher.replaceHash(sHashPrefix + "foo");

		assert.strictEqual(sut.getDirection(), HistoryDirection.Backwards, "should be a forwards navigation");
		assert.strictEqual(sut.iHistoryPosition, 1, "should be at entry one of the history");
		assert.strictEqual(sut.aHistory.length, 3, "should have 2 entries in the history");
	});

	QUnit.test("Should get the previous hash if there was no history before", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Assert + Act
		assert.strictEqual(sut.getPreviousHash(), undefined, "should have foo as the previous page");
	});

	QUnit.test("Should get the previous hash if there was a replacement before",  function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		oHashChanger.setHash("foo"); // no unknown state
		oHashChanger.replaceHash("bar"); //replace to bar
		oHashChanger.setHash("baz"); // add a new entry

		//Assert + Act
		assert.strictEqual(sut.getPreviousHash(), "bar", "should have foo as the previous page");
	});

	QUnit.test("Should get the previous hash if the unknown state occures",   function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		oHashChanger.setHash("foo");
		oHashChanger.setHash("bar");
		oHashChanger.setHash("foo");
		hasher.replaceHash(sHashPrefix + "bar"); //replace to bar - back
		hasher.replaceHash(sHashPrefix + "foo"); //replace to foo - unknown

		//Assert + Act
		assert.strictEqual(sut.getDirection(), HistoryDirection.Unknown, "should be a forwards navigation");
		assert.strictEqual(sut.getPreviousHash(), undefined, "should not have a previous page");
	});

	QUnit.test("Should get the previous hash when going backwards",   function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = new History(oHashChanger);

		//Arrange
		oHashChanger.setHash("foo"); // no unknown state
		oHashChanger.setHash("bar"); //replace to bar
		oHashChanger.setHash("baz"); // add a new entry

		//simulate browser back
		hasher.replaceHash(sHashPrefix + "bar");

		//Assert + Act
		assert.strictEqual(sut.getPreviousHash(), "foo", "should have foo as the previous page");
	});

	QUnit.test("Should return new Entry if the browser history length increases",   function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var oHistory = new History(oHashChanger);

		// Make the History think the history length is very small to make the test independent from the actual history of the browser
		oHistory._iHistoryLength = history.length - 1;

		// Act -> fire hash changed to simulate a browser forward or backwards button
		oHashChanger.fireEvent("hashSet", { sHash : "foo" });
		oHashChanger.fireHashChanged("foo");

		//Assert
		assert.strictEqual(oHistory.getDirection(), HistoryDirection.NewEntry, "should detect a forward navigation");
		assert.strictEqual(oHistory._iHistoryLength, history.length, "should detect a forward navigation");
	});

	QUnit.test("Should set the hashChanger", function (assert) {
		//System under Test + Arrange
		var oInitialHashChanger = new HashChanger();
		var oSecondHashChanger = new HashChanger();
		oInitialHashChanger.init();
		oSecondHashChanger.init();
		var oHistory = new History(oInitialHashChanger);

		oInitialHashChanger.setHash("foo");

		// Act
		oHistory._setHashChanger(oSecondHashChanger);
		assert.strictEqual(oHistory.aHistory[1], "foo", "should reflect changes of the first hashchanger");

		// Should not be added to the hisotry
		oInitialHashChanger.fireHashChanged("bar");
		assert.strictEqual(oHistory.aHistory.length, 2, "should still have 2 entries in the history");

		// Should be added
		oSecondHashChanger.setHash("bar");

		//Assert
		assert.strictEqual(oHistory.aHistory.length, 3, "should have 3 entries in the history");
		assert.strictEqual(oHistory.aHistory[2], "bar", "Did add an entry bar to the history");

	});

	QUnit.test("Should return forward if you go back and ask for the direction of the next hash, before the hash is actually set", function (assert) {
		var oHashChanger = new HashChanger();
		oHashChanger.init();

		// System under test
		var oHistory = new History(oHashChanger);

		// Arrange - setup a history
		oHashChanger.fireEvent("hashSet", { sHash : "foo" });
		oHashChanger.fireHashChanged("foo");

		oHashChanger.fireEvent("hashSet", { sHash : "bar" });
		oHashChanger.fireHashChanged("bar");

		// go back
		oHashChanger.fireHashChanged("foo");

		// Simulate hash is changing to bar again
		oHashChanger.fireEvent("hashSet", { sHash : "bar" });

		// Act
		var sDirection = oHistory.getDirection("bar");

		assert.strictEqual(sDirection, "Forwards", "After going back to foo, bar should be forwards");
	});

	QUnit.test("Should attach listener to each of the history relevant event names", function(assert) {
		var oHashChanger = new HashChanger(),
			aEventsInfo = [{name: "foo"}, {name: "bar"}];

		oHashChanger.getRelevantEventsInfo = function() {
			return aEventsInfo;
		};

		oHashChanger.init();

		aEventsInfo.forEach(function(oEventInfo) {
			assert.ok(!oHashChanger.hasListeners(oEventInfo.name), "HashChanger doesn't have listener for event " + oEventInfo.name + " before History is attached to it");
		});
		assert.ok(!oHashChanger.hasListeners("hashChanged"), "HashChanger doesn't have listener for event hashChanged");

		var oHistory = new History(oHashChanger);

		aEventsInfo.forEach(function(oEventInfo) {
			assert.ok(oHashChanger.hasListeners(oEventInfo.name), "HashChanger has listener for event " + oEventInfo.name + " after History is attached to it");
		});
		assert.ok(!oHashChanger.hasListeners("hashChanged"), "HashChanger doesn't have listener for event hashChanged");

		oHistory.destroy();
		oHashChanger.destroy();
	});


	QUnit.test("Should save the initial hash without slash", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var iStateHistoryLength = History._aStateHistory.length;

		// eslint-disable-next-line no-new
		new History(oHashChanger);

		if (!History._bUsePushState) {
			assert.strictEqual(History._aStateHistory.length, iStateHistoryLength, "The push state isn't supported therefore no hash is stored");
		} else {
			assert.ok(History._aStateHistory[History._aStateHistory.length - 1].charAt(0) !== "#", "The hash with no leading # is inserted");
		}
	});

});
