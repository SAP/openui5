/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/signals"
], function (Log, HashChanger, History, hasher) {
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

	QUnit.test("Should only replace the hash with the existence of a base tag", function(assert) {
		// create a base tag and insert into head tag
		var oHeadTag = document.getElementsByTagName("head").item(0);
		var oBaseTag = document.createElement("base");
		oBaseTag.setAttribute("href", "/foo/bar");
		oHeadTag.appendChild(oBaseTag);

		var sPath = window.location.pathname,
			sNewHash = "newHashWithBaseHref",
			aCalls = [];
		var fnHashChanged = function(oEvent) {
			aCalls.push(oEvent.getParameter("newHash"));
		};
		var done = assert.async();

		var oHashChanger = new HashChanger();
		oHashChanger.init();
		oHashChanger.attachEvent("hashChanged", fnHashChanged);

		// Act
		// If the base tag were taken into consideration during replacing hash, the whole site would be
		// redirected to an invalid url, and the test would not run to the end.
		oHashChanger.replaceHash(sNewHash);

		// A timeout is needed because changing the url is async
		setTimeout(function() {
			assert.equal(aCalls.length, 1, "hash is changed once");
			assert.strictEqual(aCalls[0], sNewHash, "The hashChanged event parameter is correct");
			assert.strictEqual(window.location.pathname, sPath, "replaceHash should keep the location path unchanged");

			oHeadTag.removeChild(oBaseTag);
			done();
		}, 100);
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

		firstInstance.attachEvent("newEvent", function(){});
		firstInstance.attachEvent("hashChanged", hashChanged);


		//System under Test
		var oSecondHashChanger = new HashChanger();
		oSecondHashChanger.attachEvent("hashChanged", hashChanged);

		HashChanger.replaceHashChanger(oSecondHashChanger);

		var retrievedInstance = HashChanger.getInstance();
		assert.ok(retrievedInstance.hasListeners("newEvent"), "The listener to newEvent is transported to the new instance");

		retrievedInstance.fireHashChanged("one");
		assert.strictEqual(hashChanged.callCount, 2, "did call all the listener");
		//Should not add another call since all events need to be deregistered
		firstInstance.fireHashChanged("two");

		//Assert
		assert.strictEqual(retrievedInstance, oSecondHashChanger, "retrieved the correct instance");
		assert.strictEqual(hashChanged.callCount, 2, "did not add calls");
	});

	QUnit.test("Should replace the Singleton and add all events to the new one with RouterHashChanger", function (assert) {
		//System under Test + Act
		var firstInstance = HashChanger.getInstance();

		var oOnHashModifiedSpy = this.spy(HashChanger.prototype, "_onHashModified");
		var oRouterHashChanger = firstInstance.createRouterHashChanger();

		var oSecondHashChanger = new HashChanger();

		HashChanger.replaceHashChanger(oSecondHashChanger);

		var retrievedInstance = HashChanger.getInstance();
		assert.strictEqual(retrievedInstance, oSecondHashChanger, "The replacing is done correctly");
		assert.strictEqual(retrievedInstance.createRouterHashChanger(), oRouterHashChanger, "The router hashChanger is transported to the second hash changer");

		oRouterHashChanger.fireEvent("hashSet", {
			hash: "foo.bar"
		});

		assert.equal(oOnHashModifiedSpy.callCount, 1, "The _onHashModified handler is called");
		assert.ok(oOnHashModifiedSpy.getCall(0).calledOn(oSecondHashChanger), "The _onHashModified method is called on the new HashChanger instance");

		oRouterHashChanger.fireEvent("hashReplaced", {
			hash: "foo.bar1"
		});

		assert.equal(oOnHashModifiedSpy.callCount, 2, "The _onHashModified handler is called");
		assert.ok(oOnHashModifiedSpy.getCall(1).calledOn(oSecondHashChanger), "The _onHashModified method is called on the new HashChanger instance");
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

	QUnit.test("Should keep the event order between History and RouterHashChanger", function(assert) {
		var oHashChanger = HashChanger.getInstance();

		// attach a lister to the "hashChanged" event for the History
		var oHistory = History.getInstance();
		var oHistoryHashChangedSpy = this.spy(oHistory, "_hashChange");

		// attach a listener to the "hashChanged" event for the RouterHashChanger
		var oRouterHashChanger = oHashChanger.createRouterHashChanger();
		var oRouterHashChangerHashChangedSpy = this.spy(oRouterHashChanger, "fireHashChanged");

		oHashChanger.fireHashChanged("newHash", "oldHash");

		assert.equal(oRouterHashChangerHashChangedSpy.callCount, 1, "event listener called");
		assert.equal(oHistoryHashChangedSpy.callCount, 1, "event listener called");
		assert.ok(oHistoryHashChangedSpy.calledBefore(oRouterHashChangerHashChangedSpy), "The call order is correct");


		var oNewHashChanger = new HashChanger();
		HashChanger.replaceHashChanger(oNewHashChanger);

		oRouterHashChangerHashChangedSpy.resetHistory();
		oHistoryHashChangedSpy.resetHistory();

		oNewHashChanger.fireHashChanged("veryNewHash", "newHash");

		assert.equal(oRouterHashChangerHashChangedSpy.callCount, 1, "event listener called");
		assert.equal(oHistoryHashChangedSpy.callCount, 1, "event listener called");
		assert.ok(oHistoryHashChangedSpy.calledBefore(oRouterHashChangerHashChangedSpy), "The call order is correct");
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

	QUnit.module("API", {
		beforeEach: function(assert) {
			hasher.setHash("");
			this.oHashChanger = new HashChanger();
		},
		afterEach: function(assert) {
			this.oHashChanger.destroy();
		}
	});

	QUnit.test("#createSubHashChanger", function(assert) {
		assert.strictEqual(this.oHashChanger._oRouterHashChanger, undefined, "initial child RouterHashChanger is empty");
		var oRouterHashChanger = this.oHashChanger.createRouterHashChanger();
		oRouterHashChanger.init();
		assert.equal(this.oHashChanger._oRouterHashChanger, oRouterHashChanger, "child is registered to parent");
		assert.ok(oRouterHashChanger.hasListeners("hashSet"), "hashSet listener is set");
		assert.ok(oRouterHashChanger.hasListeners("hashReplaced"),"hashReplaced listener is set");
		assert.strictEqual(oRouterHashChanger.hash, "", "initial hash of SubHashChanger is empty");

		var oRouterHashChangerDuplicate = this.oHashChanger.createRouterHashChanger();
		assert.strictEqual(oRouterHashChangerDuplicate, oRouterHashChanger, "The same instance should be returned for the same prefix");
	});

	QUnit.test("#createSubHashChanger with non-empty browser hash", function(assert) {
		hasher.setHash("foo/bar&/s/abc");

		var oRouterHashChanger = this.oHashChanger.createRouterHashChanger();

		assert.equal(oRouterHashChanger.getHash(), "foo/bar", "The browser hash is forwarded to RouterHashChanger");
		assert.deepEqual(oRouterHashChanger.subHashMap, {s: "abc"}, "The subHashMap is also forwarded to RouterHashChanger");
	});

	QUnit.module("_reconstructHash", {
		beforeEach: function(assert) {
			this.oHashChanger = new HashChanger();
		},
		afterEach: function(assert) {
			this.oHashChanger.destroy();
		}
	});

	QUnit.test("Change the top level hash", function(assert) {
		this.oHashChanger.setHash("oldHash");

		var sHash = this.oHashChanger._reconstructHash([undefined], ["newHash"], []);
		assert.equal(sHash, "newHash");
	});

	QUnit.test("Change the top level hash to undefined", function(assert) {
		this.oHashChanger.setHash("oldHash");

		var sHash = this.oHashChanger._reconstructHash([undefined], [undefined], []);
		assert.equal(sHash, "undefined");
	});

	QUnit.test("Change the top level hash and delete sub hash(es)", function(assert) {
		this.oHashChanger.setHash("root&/comment/0");

		var sHash = this.oHashChanger._reconstructHash([undefined], ["newHash"], ["comment"]);
		assert.equal(sHash, "newHash");
	});

	QUnit.test("Change the top level hash and delete sub hash(es)", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0&/notification/1");

		var sHash = this.oHashChanger._reconstructHash([undefined], ["newHash"], ["comment"]);
		assert.equal(sHash, "newHash&/notification/1");
	});

	QUnit.test("Add new subhash", function(assert) {
		this.oHashChanger.setHash("root");

		var sHash = this.oHashChanger._reconstructHash(["comment"], ["123"], []);
		assert.equal(sHash, "root&/comment/123");
	});

	QUnit.test("Change subHash", function(assert) {
		this.oHashChanger.setHash("root&/comment/0");

		var sHash = this.oHashChanger._reconstructHash(["comment"], ["123"], []);
		assert.equal(sHash, "root&/comment/123");
	});

	QUnit.test("Add new subHash and delete sub hash(es)", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0");

		var sHash = this.oHashChanger._reconstructHash(["notification"], ["234"], ["comment"]);
		assert.equal(sHash, "notification&/notification/234");
	});

	QUnit.test("Add new subHash and delete sub hash(es) with overlap in between", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0");

		var sHash = this.oHashChanger._reconstructHash(["notification"], ["234"], ["comment", "notification"]);
		assert.equal(sHash, "notification&/notification/234");
	});

	QUnit.test("Change the subHash and delete sub hash(es)", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0&/notification/1");

		var sHash = this.oHashChanger._reconstructHash(["notification"], ["234"], ["comment"]);
		assert.equal(sHash, "notification&/notification/234");
	});

	QUnit.test("Change the subHash and delete sub hash(es) with overlap in between", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0&/notification/1");

		var sHash = this.oHashChanger._reconstructHash(["notification"], ["234"], ["comment", "notification"]);
		assert.equal(sHash, "notification&/notification/234");
	});

	QUnit.test("Add new subHash, change existing subHash and delete sub hash(es)", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0");

		var sHash = this.oHashChanger._reconstructHash(["notification", "comment"], ["234", "commentId"]);
		assert.equal(sHash, "notification&/comment/commentId&/notification/234");
	});

	QUnit.test("Add new subHash, change existing subHash and delete sub hash(es) with overlap in between", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0&/comment1/1");

		var sHash = this.oHashChanger._reconstructHash(["notification", "comment"], ["234", "commentId"], ["comment1", "comment"]);
		assert.equal(sHash, "notification&/comment/commentId&/notification/234");
	});

	QUnit.test("Delete subhash", function(assert) {
		this.oHashChanger.setHash("notification&/comment/0&/notification/1");

		var sHash = this.oHashChanger._reconstructHash(["notification"], [undefined], []);
		assert.equal(sHash, "notification&/comment/0");
	});

	QUnit.module("_parseHash", {
		beforeEach: function(assert) {
			this.oHashChanger = new HashChanger();
		},
		afterEach: function(assert) {
			this.oHashChanger.destroy();
		}
	});

	QUnit.test("Parse a top level hash", function(assert) {
		var sHash = "notifications";
		var oParsedHash = this.oHashChanger._parseHash(sHash);
		assert.deepEqual(oParsedHash, {
			hash: "notifications",
			subHashMap: {}
		}, "top level hash parsed");
	});

	QUnit.test("Parse a top level hash with subhashes", function(assert) {
		var sHash = "notifications&/comments/1&/notifications/2";
		var oParsedHash = this.oHashChanger._parseHash(sHash);
		assert.deepEqual(oParsedHash, {
			hash: "notifications",
			subHashMap: {
				comments: "1",
				notifications: "2"
			}
		}, "full hash parsed");

	});

	QUnit.test("Parse subhashes without top level hash", function(assert) {
		var sHash = "&/comments/1&/notifications/2";
		var oParsedHash = this.oHashChanger._parseHash(sHash);
		assert.deepEqual(oParsedHash, {
			hash: "",
			subHashMap: {
				comments: "1",
				notifications: "2"
			}
		}, "full hash parsed");
	});

	QUnit.test("Parse subhashes that contain emtpy string value", function(assert) {
		var sHash = "notifications&/comments&/notifications/2&/comments1/&/comments2";
		var oParsedHash = this.oHashChanger._parseHash(sHash);
		assert.deepEqual(oParsedHash, {
			hash: "notifications",
			subHashMap: {
				comments: "",
				notifications: "2",
				comments1: "",
				comments2: ""
			}
		}, "full hash parsed");
	});

	QUnit.module("getRelevantEventsInfo", {
		beforeEach: function(assert) {
			this.oHashChanger = new HashChanger();
			this.oHashChanger.getRelevantEventsInfo = function() {
				return [
					{
						name: "eventA",
						paramMapping: {
							newHash: "myHash",
							fullHash: "completeHash"
						}
					},
					{
						name: "eventB",
						paramMapping: {
							oldHash: "previousHash"
						}
					},
					{
						name: "eventC",
						updateHashOnly: true
					}
				];
			};
		},
		afterEach: function(assert) {
			this.oHashChanger.destroy();
		}
	});

	QUnit.test("Should attach event listener to every event which is returned from getRelevantEventsInfo", function(assert) {
		var aEventsInfo = this.oHashChanger.getRelevantEventsInfo();

		aEventsInfo.forEach(function(oEventInfo) {
			assert.notOk(this.oHashChanger.hasListeners(oEventInfo.name), "There's no listener attached to the event " + oEventInfo.name + "before createRouterHashChanger is called");
		}.bind(this));

		// Act
		this.oHashChanger.createRouterHashChanger();

		aEventsInfo.forEach(function(oEventInfo) {
			assert.ok(this.oHashChanger.hasListeners(oEventInfo.name), "There's listener attached to the event " + oEventInfo.name);
		}.bind(this));
	});

	QUnit.test("Should get the correct parameter from the paramMapping when forwarding the event to RouterHashChanger", function(assert) {
		// Act
		var oRouterHashChanger = this.oHashChanger.createRouterHashChanger();

		var oFireHashChangedSpy = sinon.spy(oRouterHashChanger, "fireHashChanged");

		this.oHashChanger.fireEvent("eventA", {
			myHash: "foo.bar"
		});

		assert.equal(oFireHashChangedSpy.callCount, 1, "fireHashChanged function is called");
		assert.equal(oFireHashChangedSpy.args[0][0], "foo.bar", "The correct parameter is passed");

		this.oHashChanger.fireEvent("eventB", {
			newHash: "foo.bar1"
		});

		assert.equal(oFireHashChangedSpy.callCount, 2, "fireHashChanged function is called");
		assert.equal(oFireHashChangedSpy.args[1][0], "foo.bar1", "The correct parameter is passed");

		oFireHashChangedSpy.restore();
	});

	QUnit.test("Should respect the 'updateHashOnly' option", function(assert) {
		// Act
		var oRouterHashChanger = this.oHashChanger.createRouterHashChanger(),
			oHashChangedSpy = sinon.spy();

		oRouterHashChanger.attachEvent("hashChanged", oHashChangedSpy);

		this.oHashChanger.fireEvent("eventC", {
			newHash: "updateHashOnly"
		});

		assert.equal(oHashChangedSpy.callCount, 0, "The hashChanged event isn't fired on the RouterHashChanger");
		assert.equal(oRouterHashChanger.getHash(), "updateHashOnly", "The new hash is saved in the RouterHashChanger");
	});

	QUnit.module("Integration: RouterHashChanger and HashChanger", {
		beforeEach: function(assert) {
			hasher.setHash("");

			this.oHashChanger = new HashChanger();
			this.oRHC = this.oHashChanger.createRouterHashChanger();
			this.oRHC.init();

			this.oHashChangedSpy = sinon.spy();
			this.oHashChanger.attachEvent("hashChanged", this.oHashChangedSpy);

			this.oChildHashChangedSpy = sinon.spy();
			this.oRHC.attachEvent("hashChanged", this.oChildHashChangedSpy);
		},
		afterEach: function(assert) {
			this.oRHC.destroy();
			this.oHashChanger.destroy();
		}
	});

	QUnit.test("set hash on the child", function(assert) {
		this.oRHC.setHash("Child1");
		assert.equal(this.oHashChangedSpy.callCount, 1, "hashChanged event is fired on HashChanger");
		assert.strictEqual(this.oHashChangedSpy.args[0][0].getParameter("newHash"), "Child1", "The new hash is included in the event");
		assert.equal(this.oChildHashChangedSpy.callCount, 1, "hashChanged event is fired on RouterHashChanger");
		assert.strictEqual(this.oChildHashChangedSpy.args[0][0].getParameter("newHash"), "Child1", "The new hash is included in the event for RouterHashChanger");
	});

	QUnit.test("set hash on the child with collecting hash from the deeper nested children - no active prefix collection", function(assert) {
		var oNestedRHC = this.oRHC.createSubHashChanger("nested1"),
			aDeletePrefixes = ["foo"],
			oSetSubHashSpy = sinon.spy(this.oHashChanger, "_setSubHash");

		oNestedRHC._collectActiveDescendantPrefix = function() {
			return aDeletePrefixes;
		};
		// attach a dummy event handler to let the RouterHashChanger propagate the hashSet to HashChanger
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.setHash("child1", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		}), /* suppress active prefix collection */true).then(function() {
			assert.equal(oSetSubHashSpy.callCount, 1, "Top level hashChanger received the hash change info");
			assert.deepEqual(oSetSubHashSpy.args[0][0], [undefined, "nested1"]);
			assert.deepEqual(oSetSubHashSpy.args[0][1], ["child1", "nestedHash"]);
			assert.deepEqual(oSetSubHashSpy.args[0][2], aDeletePrefixes);

			oNestedRHC.destroy();
		});
	});

	QUnit.test("set hash on the child with collecting hash from the deeper nested children - with active prefix collection", function(assert) {
		var oNestedRHC = this.oRHC.createSubHashChanger("nested1"),
			aDeletePrefixes = ["foo"],
			oSetSubHashSpy = sinon.spy(this.oHashChanger, "_setSubHash");

		oNestedRHC._collectActiveDescendantPrefix = function() {
			return aDeletePrefixes;
		};
		// attach a dummy event handler to let the RouterHashChanger propagate the hashSet to HashChanger
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.setHash("child1", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		})).then(function() {
			assert.equal(oSetSubHashSpy.callCount, 1, "Top level hashChanger received the hash change info");
			assert.deepEqual(oSetSubHashSpy.args[0][0], [undefined, "nested1"]);
			assert.deepEqual(oSetSubHashSpy.args[0][1], ["child1", "nestedHash"]);
			assert.deepEqual(oSetSubHashSpy.args[0][2], ["nested1"].concat(aDeletePrefixes));

			oNestedRHC.destroy();
		});
	});

	QUnit.test("replace hash on the child", function(assert) {
		this.oRHC.replaceHash("Child1");
		assert.equal(this.oHashChangedSpy.callCount, 1, "hashChanged event is fired on HashChanger");
		assert.strictEqual(this.oHashChangedSpy.args[0][0].getParameter("newHash"), "Child1", "The new hash is included in the event");
		assert.equal(this.oChildHashChangedSpy.callCount, 1, "hashChanged event is fired on RouterHashChanger");
		assert.strictEqual(this.oChildHashChangedSpy.args[0][0].getParameter("newHash"), "Child1", "The new hash is included in the event for RouterHashChanger");
	});

	QUnit.test("replace hash on the child with collecting hash from the deeper nested children - no active prefix collection", function(assert) {
		var oNestedRHC = this.oRHC.createSubHashChanger("nested1"),
			aDeletePrefixes = ["foo"],
			oReplaceSubHashSpy = sinon.spy(this.oHashChanger, "_replaceSubHash");

		oNestedRHC._collectActiveDescendantPrefix = function() {
			return aDeletePrefixes;
		};
		// attach a dummy event handler to let the RouterHashChanger propagate the hashSet to HashChanger
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.replaceHash("child1", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		}), /* suppress active prefix collection */true).then(function() {
			assert.equal(oReplaceSubHashSpy.callCount, 1, "Top level hashChanger received the hash change info");
			assert.deepEqual(oReplaceSubHashSpy.args[0][0], [undefined, "nested1"]);
			assert.deepEqual(oReplaceSubHashSpy.args[0][1], ["child1", "nestedHash"]);
			assert.deepEqual(oReplaceSubHashSpy.args[0][2], aDeletePrefixes);

			oNestedRHC.destroy();
		});
	});

	QUnit.test("replace hash on the child with collecting hash from the deeper nested children - with active prefix collection", function(assert) {
		var oNestedRHC = this.oRHC.createSubHashChanger("nested1"),
			aDeletePrefixes = ["foo"],
			oReplaceSubHashSpy = sinon.spy(this.oHashChanger, "_replaceSubHash");

		oNestedRHC._collectActiveDescendantPrefix = function() {
			return aDeletePrefixes;
		};
		// attach a dummy event handler to let the RouterHashChanger propagate the hashSet to HashChanger
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.replaceHash("child1", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		})).then(function() {
			assert.equal(oReplaceSubHashSpy.callCount, 1, "Top level hashChanger received the hash change info");
			assert.deepEqual(oReplaceSubHashSpy.args[0][0], [undefined, "nested1"]);
			assert.deepEqual(oReplaceSubHashSpy.args[0][1], ["child1", "nestedHash"]);
			assert.deepEqual(oReplaceSubHashSpy.args[0][2], ["nested1"].concat(aDeletePrefixes));

			oNestedRHC.destroy();
		});
	});
	QUnit.module("Destroy: RouterHashChanger and HashChanger", {
		beforeEach: function(assert) {
			this.oHashChanger = new HashChanger();
			this.oRHC = this.oHashChanger.createRouterHashChanger();
		}
	});

	QUnit.test("Destroy", function(assert) {
		var oDestroySpy = sinon.spy(this.oRHC, "destroy");
		this.oHashChanger.destroy();

		assert.equal(this.oHashChanger._oRouterHashChanger, undefined, "The RouterHashChanger is reset");
		assert.equal(oDestroySpy.callCount, 1, "The RouterHashChanger is also destroyed");
	});

	QUnit.test("Destroy the RouterHashChanger", function(assert) {
		this.oRHC.destroy();

		assert.equal(this.oHashChanger._oRouterHashChanger, undefined, "The RouterHashChanger is reset");
		this.oHashChanger.destroy();
	});
});
