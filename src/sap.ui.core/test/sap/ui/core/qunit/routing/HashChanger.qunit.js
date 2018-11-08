/*global QUnit, hasher */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History",
	"sap/ui/thirdparty/signals"
], function (Log, HashChanger, History) {
	"use strict";


	QUnit.module("Lifecycle Basics");

	// NEEDS TO BE THE FIRST TEST - tests the initial state of a global singleton in a closure
	QUnit.test("Should always overwrite the hashchanger", function (assert) {
		// this function must not be called before this test is executed so it acutally tests something
		// HashChanger.getInstance()

		// System under Test
		var oHashChanger = new HashChanger();

		// Act
		HashChanger.replaceHashChanger(oHashChanger);

		// Assert
		assert.strictEqual(oHashChanger, HashChanger.getInstance(), "did change the hashCHanger");
	});

	QUnit.test("ShouldInitAndDestroyCorrectly", function (assert) {
		//Arrange
		var calls = [],
			hashChanged = function (evt) {
				calls.push({ newHash: evt.getParameter("newHash"), oldHash: evt.getParameter("oldHash") });
			};

		//System under Test
		var sut = new HashChanger();

		sut.attachEvent("hashChanged", hashChanged);
		sut.init();
		assert.strictEqual(hasher.changed.getNumListeners(), 1, "did register for the hashChangedEvent");

		//Act
		sut.destroy();
		assert.notOk(sut.hasOwnProperty("_initialized"), "the initialized flag is reset");
		sut.setHash("foo");

		//Assert
		assert.strictEqual(hasher.changed.getNumListeners(), 0, "did unregister for the hashChangedEvent");
		assert.strictEqual(calls.length, 1, "only dipatched the initial event");
	});

	QUnit.test("Should not init hasher twice", function (assert) {
		//Arrange
		var calls = [],
			initSpy = this.spy(hasher, "init"),
			warningSpy = this.spy(Log, "info"),
			hashChanged = function (evt) {
				calls.push({ newHash: evt.getParameter("newHash"), oldHash: evt.getParameter("oldHash") });
			};

		//System under Test
		var sut = new HashChanger();
		sut.attachEvent("hashChanged", hashChanged);

		//Act
		sut.init();
		sut.init();

		//Assert
		assert.strictEqual(calls.length, 1, "did dispatch an initial hashchange event");
		assert.strictEqual(warningSpy.callCount, 1, "did warn the user because of dublicate initialization");
		assert.strictEqual(initSpy.callCount, 0, "did not init hasher again");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should not init hasher twice when init is called in hashChange event", function(assert) {
		// System under test
		var sut = new HashChanger();

		// Arrange
		var initSpy = this.spy(sut, "init"),
			hashChanged = function(evt) {
				sut.init();
			};
		sut.attachEvent("hashChanged", hashChanged);

		// Act
		sut.init();

		// Assert
		assert.equal(initSpy.callCount, 2, "The init method should only be called twice");
		assert.strictEqual(initSpy.returnValues[0], false, "The first call is returned with true");
		assert.strictEqual(initSpy.returnValues[1], true, "The second call is returned with false");

		// Cleanup
		sut.destroy();
	});

	QUnit.test("Should set the Hash", function (assert) {
		//Arrange
		var aCalls = [],
			fmHashChanged = function (evt) {
				aCalls.push({ newHash: evt.getParameter("newHash"), oldHash: evt.getParameter("oldHash") });
			};


		//System under Test
		var oHashChanger = new HashChanger();
		oHashChanger.init();
		oHashChanger.attachEvent("hashChanged", fmHashChanged);


		//Act
		oHashChanger.setHash("one");
		oHashChanger.setHash("two");

		//Assert
		assert.strictEqual(aCalls.length, 2, "did change the Hash two times");

		assert.strictEqual(aCalls[0].newHash, "one", "first event was correct");
		assert.strictEqual(aCalls[1].newHash, "two", "second event was correct");
		assert.strictEqual(oHashChanger.getHash(), "two", "the current hash is correct");

		//Cleanup
		oHashChanger.destroy();
	});

	QUnit.test("Should replace the Hash", function (assert) {
		//Arrange
		var aCalls = [],
			fnHashChanged = function (evt) {
				aCalls.push({ newHash: evt.getParameter("newHash"), oldHash: evt.getParameter("oldHash") });
			};


		//System under Test
		var oHashChanger = new HashChanger();
		oHashChanger.init();
		oHashChanger.attachEvent("hashChanged", fnHashChanged);


		//Act
		oHashChanger.replaceHash("one");
		oHashChanger.replaceHash("two");

		//Assert
		assert.strictEqual(aCalls.length, 2, "did change the Hash two times");

		assert.strictEqual(aCalls[0].newHash, "one", "first event was correct");
		assert.strictEqual(aCalls[1].newHash, "two", "second event was correct");
		assert.strictEqual(oHashChanger.getHash(), "two", "the current hash is correct");

		//Cleanup
		oHashChanger.destroy();
	});

	QUnit.test("Should use a Singleton ", function (assert) {
		//System under Test + Act

		//Since this is the first call it should work
		HashChanger.replaceHashChanger(undefined);

		var sut = HashChanger.getInstance();


		//Assert
		assert.strictEqual(sut, HashChanger.getInstance(), "did return the same instance");
	});


	QUnit.test("Should replace the Singleton and add all events to the new one", function (assert) {
		//System under Test + Act
		var firstInstance = HashChanger.getInstance(),
			hashChanged = this.spy();

		firstInstance.attachEvent("hashChanged", hashChanged);


		//System under Test
		var oSecondHashChanger = new HashChanger();
		oSecondHashChanger.attachEvent("hashChanged", hashChanged);

		HashChanger.replaceHashChanger(oSecondHashChanger);

		var retrievedInstance = HashChanger.getInstance();

		retrievedInstance.fireHashChanged("one");
		assert.strictEqual(hashChanged.callCount, 2, "did call all the listener");
		//Should not add another call since all events need to be deregistered
		firstInstance.fireHashChanged("two");

		//Assert
		assert.strictEqual(retrievedInstance, oSecondHashChanger, "retrieved the correct instance");
		assert.strictEqual(hashChanged.callCount, 2, "did not add calls");
	});

	QUnit.test("Should copy events correctly", function (assert) {
		// System under Test
		var oFirstHashCHanger = HashChanger.getInstance(),
			fnHashChanged = this.spy();

		// only add this event to the original hashchanger
		oFirstHashCHanger.attachEvent("hashChanged", fnHashChanged);

		// System under Test
		var oSecondHashChanger = new HashChanger();

		// Act
		HashChanger.replaceHashChanger(oSecondHashChanger);
		// no event listener was added to the second hashchanger
		oSecondHashChanger.fireHashChanged("one");

		// Assert
		assert.strictEqual(fnHashChanged.callCount, 1, "did call all the listener from the first hashchanger");

	});

	QUnit.test("Should not overwrite deleted events", function (assert) {
		// System under Test
		var oFirstHashCHanger = HashChanger.getInstance(),
			fnHashChanged = this.spy();

		// only add this event to the original hashchanger
		oFirstHashCHanger.attachEvent("hashChanged", fnHashChanged);
		//  detach an event so there is an empty entry in the event registry
		oFirstHashCHanger.detachEvent("hashChanged", fnHashChanged);

		// System under Test
		var oSecondHashChanger = new HashChanger();
		// add an event handler again
		oSecondHashChanger.attachEvent("hashChanged", fnHashChanged);

		// Act - see if the event handler is overwritten
		HashChanger.replaceHashChanger(oSecondHashChanger);

		// spy should not be informed since the event is deregisterwd
		oFirstHashCHanger.fireHashChanged("one");

		// Assert
		assert.strictEqual(fnHashChanged.callCount, 0, "did not call the spy");

		// spy has to be informed
		oSecondHashChanger.fireHashChanged("one");
		assert.strictEqual(fnHashChanged.callCount, 1, "did add a call");
	});

	QUnit.test("Should not duplicate History events", function (assert) {
		// Arrange
		var oHistory = History.getInstance(),
			oFirstHashCHanger = HashChanger.getInstance(),
			oHistoryChangeStub = this.stub(oHistory, "_hashChange");

		// Check if the history gut the current hashchanger
		oFirstHashCHanger.fireHashChanged("one");
		assert.strictEqual(oHistoryChangeStub.callCount, 1, "History is connected to the first hashchanger");

		// System under Test
		var oSecondHashChanger = new HashChanger();

		// Act
		HashChanger.replaceHashChanger(oSecondHashChanger);

		// the stub should be called a second time
		oSecondHashChanger.fireHashChanged("two");
		assert.strictEqual(oHistoryChangeStub.callCount, 2, "History is connected to the second hashchanger");


		oFirstHashCHanger.fireHashChanged("one");
		assert.strictEqual(oHistoryChangeStub.callCount, 2, "History is disconnected from the first hashchanger");
	});

	QUnit.module("Synchronous hash setting");

	QUnit.test("Should not omit a history entry when hash is set again in a handler", function (assert) {
		var done = assert.async();
		//Arrange
		var aCalls = [],
			fnAssert = function (oEvt) {
				var sNewHash = oEvt.getParameter("newHash");

				assert.strictEqual(sNewHash, "firstChange", "The hash got set to the firstChange and did not get ommited by hasher");
				assert.strictEqual(aCalls.length, 3, "initial , first second where executed");

				//Cleanup
				oHashChanger.destroy();
				done();
			},
			fnHashChanged = function (oEvt) {
				var sNewHash = oEvt.getParameter("newHash");
				aCalls.push({ sNewHash: sNewHash });

				if (sNewHash === "initial") {
					oHashChanger.setHash("firstChange");
				}

				if (sNewHash === "firstChange") {
					oHashChanger.setHash("secondChange");
				}

				if (sNewHash === "secondChange") {
					oHashChanger.detachEvent("hashChanged", fnHashChanged);
					window.history.back();
					oHashChanger.attachEvent("hashChanged", fnAssert);
				}
			};

		//System under Test
		var oHashChanger = new HashChanger();
		oHashChanger.setHash("initial");
		oHashChanger.attachEvent("hashChanged", fnHashChanged);

		//Act
		oHashChanger.init();
	});
});
