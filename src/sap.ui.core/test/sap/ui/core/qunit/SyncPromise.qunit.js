/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/test/TestUtils"
], function (jQuery, SyncPromise, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks:[1,5], no-warning-comments: 0 */
	"use strict";

	function assertFulfilled(assert, oSyncPromise, vExpectedResult) {
		function checkEqual(vResult) {
			if (Array.isArray(vExpectedResult)) {
				assert.deepEqual(vResult, vExpectedResult);
			} else {
				assert.strictEqual(vResult, vExpectedResult);
			}
		}

		assert.strictEqual(oSyncPromise.isFulfilled(), true);
		assert.strictEqual(oSyncPromise.isPending(), false);
		assert.strictEqual(oSyncPromise.isRejected(), false);
		checkEqual(oSyncPromise.getResult(), vExpectedResult);
		oSyncPromise.then(function (vResult) {
			checkEqual(vResult, vExpectedResult);
		}, function (vReason) {
			assert.ok(false, "unexpected failure: " + vReason);
		});
	}

	function assertPending(assert, oSyncPromise) {
		assert.strictEqual(oSyncPromise.isFulfilled(), false);
		assert.strictEqual(oSyncPromise.isPending(), true);
		assert.strictEqual(oSyncPromise.isRejected(), false);
		assert.strictEqual(typeof oSyncPromise.getResult().then, "function",
			"pending on a thenable: " + oSyncPromise.getResult());
	}

	function assertRejected(assert, oSyncPromise, vExpectedReason) {
		assert.strictEqual(oSyncPromise.isFulfilled(), false);
		assert.strictEqual(oSyncPromise.isPending(), false);
		assert.strictEqual(oSyncPromise.isRejected(), true);
		if (arguments.length > 2) {
			assert.strictEqual(oSyncPromise.getResult(), vExpectedReason);
			oSyncPromise.catch(function (vReason) {
				assert.strictEqual(vReason, vExpectedReason);
			});
			oSyncPromise.then(function () {
				assert.ok(false, "unexpected success");
			}, function (vReason) {
				assert.strictEqual(vReason, vExpectedReason);
			});
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.base.SyncPromise", {
		before : function () {
			// save optional listener
			this.listener = SyncPromise.listener;
		},

		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		after : function () {
			// restore optional listener
			SyncPromise.listener = this.listener;
		}
	});

	//*********************************************************************************************
	[42, undefined, {then : 42}, [SyncPromise.resolve()]
	].forEach(function (vResult) {
		QUnit.test("SyncPromise.resolve with non-Promise value: " + vResult, function (assert) {
			assertFulfilled(assert, SyncPromise.resolve(vResult), vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("access to state and result: fulfills", function (assert) {
		var oNewPromise,
			oPromise = Promise.resolve(42),
			oSyncPromise;

		oSyncPromise = SyncPromise.resolve(oPromise);

		assertPending(assert, oSyncPromise);

		assert.strictEqual(SyncPromise.resolve(oSyncPromise), oSyncPromise,
			"resolve() does not wrap a SyncPromise again");

		oNewPromise = oSyncPromise.then(function (iResult) {
			assertFulfilled(assert, oSyncPromise, iResult);
		});

		assertPending(assert, oNewPromise);

		return oPromise.then(function (iResult) {
			// SyncPromise fulfills as soon as Promise fulfills
			assertFulfilled(assert, oSyncPromise, iResult);
			return oNewPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("'then' on a fulfilled SyncPromise", function (assert) {
		var bCalled = false,
			oNewSyncPromise,
			oSyncPromise = SyncPromise.resolve(42);

		oNewSyncPromise = oSyncPromise
			.then(/* then w/o fnOnFulfilled does not change result */)
			.then("If onFulfilled is not a function, it must be ignored")
			.then(undefined, function () {
				assert.ok(false, "unexpected call to reject callback");
			})
			.then(function (iResult) {
				assertFulfilled(assert, oSyncPromise, iResult);
				assert.strictEqual(bCalled, false, "then called exactly once");
				bCalled = true;
				return "*" + iResult + "*";
			});

		assertFulfilled(assert, oNewSyncPromise, "*42*");
		assert.strictEqual(bCalled, true, "called synchronously");

		oNewSyncPromise.then(function (sResult) {
			assert.strictEqual(sResult, oNewSyncPromise.getResult(), "*42*");
		});
	});
	//TODO make sure SyncPromise#then returns new instance?
	// https://promisesaplus.com/#notes 3.3. allows to return same instance

	//*********************************************************************************************
	[
		{wrap : false, reject : false},
		{wrap : true, reject : false},
		{wrap : false, reject : true},
		{wrap : true, reject : true}
	].forEach(function (oFixture) {
		QUnit.test("sync -> async: " + JSON.stringify(oFixture), function (assert) {
			var oPromise = oFixture.reject ? Promise.reject() : Promise.resolve(),
				oSyncPromise = SyncPromise.resolve(oPromise);

			return oPromise[oFixture.reject ? "catch" : "then"](function () {
				var oFulfillment = {},
					oNewSyncPromise,
					oResult = new Promise(function (resolve, reject) {
						setTimeout(function () {
							assertPending(assert, oNewSyncPromise); // not yet
						}, 0);
						setTimeout(function () {
							resolve(oFulfillment);
						}, 10);
					});

				function callback() {
					return oResult; // returning a promise makes us async again
				}

				function fail() {
					assert.ok(false, "unexpected call");
				}

				if (oFixture.wrap) {
					oResult = SyncPromise.resolve(oResult);
				}

				// 'then' on a settled SyncPromise is called synchronously
				oNewSyncPromise = oFixture.reject
					? oSyncPromise.then(fail, callback)
					: oSyncPromise.then(callback, fail);

				assertPending(assert, oNewSyncPromise);
				assert.notStrictEqual(oNewSyncPromise, oResult, "'then' returns a new promise");

				return oNewSyncPromise.then(function (vResult) {
					assertFulfilled(assert, oNewSyncPromise, oFulfillment);
					assert.strictEqual(vResult, oFulfillment);
				});
			});
		});
	});

	//*********************************************************************************************
	[
		{initialReject : false, thenReject : false},
		{initialReject : false, thenReject : true},
		{initialReject : true, thenReject : false},
		{initialReject : true, thenReject : true}
	].forEach(function (oFixture) {
		QUnit.test("sync -> sync: " + JSON.stringify(oFixture), function (assert) {
			var oResult = {},
				oInitialPromise = oFixture.initialReject ? Promise.reject() : Promise.resolve(),
				oInitialSyncPromise = SyncPromise.resolve(oInitialPromise),
				sMethod = oFixture.initialReject || oFixture.thenReject ? "catch" : "then",
				oThenPromise = oFixture.thenReject
					? Promise.reject(oResult)
					: Promise.resolve(oResult),
				oThenSyncPromise = SyncPromise.resolve(oThenPromise);

			return Promise.all([oInitialPromise, oThenPromise])[sMethod](function () {
				// 'then' on a settled SyncPromise is called synchronously
				var oNewSyncPromise = oFixture.initialReject
					? oInitialSyncPromise.then(fail, callback)
					: oInitialSyncPromise.then(callback, fail);

				function callback() {
					// returning a settled SyncPromise keeps us sync
					return oThenSyncPromise;
				}

				function fail() {
					assert.ok(false, "unexpected call");
				}

				if (oFixture.thenReject) {
					assertRejected(assert, oNewSyncPromise, oResult);
					// avoid "Uncaught (in promise)"
					assertRejected(assert, oThenSyncPromise, oResult);
				} else {
					assertFulfilled(assert, oNewSyncPromise, oResult);
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("sync -> sync: throws", function (assert) {
		var oError = new Error(),
			oInitialSyncPromise = SyncPromise.resolve(),
		// 'then' on a settled SyncPromise is called synchronously
			oNewSyncPromise = oInitialSyncPromise.then(callback, fail);

		function callback() {
			throw oError;
		}

		function fail() {
			assert.ok(false, "unexpected call");
		}

		assertRejected(assert, oNewSyncPromise, oError);
	});

	//*********************************************************************************************
	QUnit.test("access to state and result: rejects", function (assert) {
		var oNewPromise,
			oReason = {},
			oPromise = Promise.reject(oReason),
			oSyncPromise;

		oSyncPromise = SyncPromise.resolve(oPromise);

		assertPending(assert, oSyncPromise);

		oNewPromise = oSyncPromise.then(function () {
			assert.ok(false);
		}, function (vReason) {
			assert.strictEqual(vReason, oReason);
		});

		assertPending(assert, oNewPromise);

		return oPromise.catch(function () {
			assertRejected(assert, oSyncPromise, oReason);
			return oNewPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("'then' on a rejected SyncPromise", function (assert) {
		var oReason = {},
			oPromise = Promise.reject(oReason),
			oSyncPromise = SyncPromise.resolve(oPromise);

		return oPromise.catch(function () {
			var bCalled = false,
				oNewSyncPromise;

			oNewSyncPromise = oSyncPromise
				.then(/* then w/o callbacks does not change result */)
				.then(null, "If onRejected is not a function, it must be ignored")
				.then(function () {
					assert.ok(false);
				}, function (vReason) {
					assertRejected(assert, oSyncPromise, oReason);
					assert.strictEqual(vReason, oReason);
					assert.strictEqual(bCalled, false, "then called exactly once");
					bCalled = true;
					return "OK";
				});

			assertFulfilled(assert, oNewSyncPromise, "OK");
			assert.strictEqual(bCalled, true, "called synchronously");

			oNewSyncPromise.then(function (sResult) {
				assert.strictEqual(sResult, oNewSyncPromise.getResult(), "OK");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: simple values", function (assert) {
		assertFulfilled(assert, SyncPromise.all([]), []);
		assertFulfilled(assert, SyncPromise.all([null]), [null]);
		assertFulfilled(assert, SyncPromise.all([42]), [42]);
		assertFulfilled(assert, SyncPromise.all([SyncPromise.resolve(42)]), [42]);

		// 1st arg not an array
		//TODO is there a way to throw TypeError for such cases?
		// "The iterable protocol" is an ECMAScript 2015 (6th Edition, ECMA-262) feature
		assertFulfilled(assert, SyncPromise.all({}), []);

		(function () {
			// not exactly an array (Note: checkEqual() currently cannot handle this)
			assertFulfilled(assert, SyncPromise.all(arguments), [42]/*arguments*/);
		})(42);

		// "An iterable object such as an Array or String."
		assertFulfilled(assert, SyncPromise.all("42"), ["4", "2"]);

		return SyncPromise.all([42]).then(function (aAnswers) {
			assert.deepEqual(aAnswers, [42]);
		});
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: performance", function (assert) {
		this.mock(SyncPromise).expects("resolve").never();

		assertFulfilled(assert, SyncPromise.all("42"), ["4", "2"]);
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: missing array", function (assert) {
		var oSyncPromise = SyncPromise.all();

		assertRejected(assert, oSyncPromise);
		oSyncPromise.catch(function (vReason) {
			assert.ok(vReason instanceof TypeError);
		});
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: then", function (assert) {
		var oPromiseAll = SyncPromise.all([Promise.resolve(42)]),
			oThenResult,
			done = assert.async();

		assertPending(assert, oPromiseAll);

		// code under test: "then" on a SyncPromise.all()
		oThenResult = oPromiseAll.then(function (aAnswers) {
			assert.strictEqual(aAnswers[0], 42);
			assertFulfilled(assert, oPromiseAll, [42]);
			done();
		});

		assertPending(assert, oThenResult);
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: catch", function (assert) {
		var oCatchResult,
			oReason = {},
			oPromiseAll = SyncPromise.all([Promise.reject(oReason)]),
			done = assert.async();

		assertPending(assert, oPromiseAll);

		// code under test: "catch" on a SyncPromise.all()
		oCatchResult = oPromiseAll.catch(function (oReason0) {
			assert.strictEqual(oReason0, oReason);
			assertRejected(assert, oPromiseAll, oReason);
			done();
		});

		assertPending(assert, oCatchResult);
	});

	//*********************************************************************************************
	[true, false].forEach(function (bWrap) {
		QUnit.test("SyncPromise.all: one Promise resolves, wrap = " + bWrap, function (assert) {
			var oPromise = Promise.resolve(42),
				oPromiseAll;

			if (bWrap) {
				oPromise = SyncPromise.resolve(oPromise);
			}

			oPromiseAll = SyncPromise.all([oPromise]);

			assertPending(assert, oPromiseAll);
			return oPromise.then(function () {
				assertFulfilled(assert, oPromiseAll, [42]);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: two Promises resolve", function (assert) {
		var oPromiseAll,
			oPromise0 = Promise.resolve(42), // timeout 0
			oPromise1 = new Promise(function (resolve, reject) {
				setTimeout(function () {
					assertPending(assert, oPromiseAll); // not yet
				}, 5);
				setTimeout(function () {
					resolve("OK");
				}, 10);
			}),
			aPromises = [oPromise0, oPromise1];

		oPromiseAll = SyncPromise.all(aPromises);

		assertPending(assert, oPromiseAll);
		return Promise.all(aPromises).then(function () {
			assertFulfilled(assert, oPromiseAll, [42, "OK"]);
			assert.deepEqual(aPromises, [oPromise0, oPromise1], "caller's array unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: one Promise rejects", function (assert) {
		var oReason = {},
			oPromise = Promise.reject(oReason),
			oPromiseAll;

		oPromiseAll = SyncPromise.all([oPromise]);

		assertPending(assert, oPromiseAll);
		return oPromise.catch(function () {
			assertRejected(assert, oPromiseAll, oReason);
		});
	});

	//*********************************************************************************************
	QUnit.test("SyncPromise.all: two Promises reject", function (assert) {
		var oReason = {},
			oPromiseAll,
			oPromise0 = Promise.reject(oReason), // timeout 0
			oPromise1 = new Promise(function (resolve, reject) {
				setTimeout(function () {
					assertRejected(assert, oPromiseAll, oReason);
				}, 5);
				setTimeout(function () {
					reject("Unexpected");
				}, 10);
			}),
			aPromises = [oPromise0, oPromise1];

		oPromiseAll = SyncPromise.all(aPromises);

		assertPending(assert, oPromiseAll);
		return oPromise1.catch(function () { // wait for the "slower" promise
			assertRejected(assert, oPromiseAll, oReason); // rejection reason does not change
			assert.deepEqual(aPromises, [oPromise0, oPromise1], "caller's array unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("'catch' delegates to 'then'", function (assert) {
		var oNewPromise = {},
			fnOnRejected = function () {},
			oSyncPromise = SyncPromise.resolve();

		this.mock(oSyncPromise).expects("then")
			.withExactArgs(undefined, sinon.match.same(fnOnRejected))
			.returns(oNewPromise);

		assert.strictEqual(oSyncPromise.catch(fnOnRejected), oNewPromise);
	});

	//*********************************************************************************************
	QUnit.test("Promise.resolve on SyncPromise", function (assert) {
		return Promise.resolve(SyncPromise.resolve(42)).then(function (iResult) {
			assert.strictEqual(iResult, 42);
		});
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oError = new Error("rejected"),
			oPromise;

		assert.strictEqual(SyncPromise.resolve("/EMPLOYEES").toString(), "/EMPLOYEES");
		assert.strictEqual(SyncPromise.resolve().toString(), "undefined");
		assert.strictEqual(SyncPromise.resolve(null).toString(), "null");
		assert.strictEqual(SyncPromise.resolve(42).toString(), "42");

		assert.strictEqual(SyncPromise.all([
				SyncPromise.resolve(42),
				"Foo",
				true
			]).toString(), "42,Foo,true");

		oPromise = SyncPromise.reject(oError);
		assert.strictEqual(oPromise.toString(), "Error: rejected");
		// avoid "Uncaught (in promise)"
		assertRejected(assert, oPromise, oError);


		oPromise = SyncPromise.resolve(Promise.reject(oError));
		assert.strictEqual(oPromise.toString(), "SyncPromise: pending");
		return oPromise.catch(function () {
			assert.strictEqual(oPromise.toString(), "Error: rejected");
		});
	});

	//*********************************************************************************************
	[undefined, new Error()].forEach(function (vReason) {
		QUnit.test("SyncPromise.reject", function (assert) {
			assertRejected(assert, SyncPromise.reject(vReason), vReason);
		});
	});

	//*********************************************************************************************
	QUnit.test("'then' on a SyncPromise.reject()", function (assert) {
		var bCalled = false,
			oNewSyncPromise,
			oReason = {},
			oSyncPromise = SyncPromise.reject(oReason);

		oNewSyncPromise = oSyncPromise
			.then(/* then w/o callbacks does not change result */)
			.then(null, "If onRejected is not a function, it must be ignored")
			.then(function () {
				assert.ok(false);
			}, function (vReason) {
				assertRejected(assert, oSyncPromise, oReason);
				assert.strictEqual(vReason, oReason);
				assert.strictEqual(bCalled, false, "then called exactly once");
				bCalled = true;
				return "OK";
			});

		assertFulfilled(assert, oNewSyncPromise, "OK");
		assert.strictEqual(bCalled, true, "called synchronously");
	});

	//*********************************************************************************************
	QUnit.test("new SyncPromise", function (assert) {
		var oFulfilledPromise,
			oPendingPromise,
			oPromise = Promise.resolve(42),
			vReason = {};

		assertPending(assert, new SyncPromise(function (resolve, reject) {
			return "ignored";
		}));

		oFulfilledPromise = new SyncPromise(function (resolve, reject) {
			resolve("OK");
			resolve("Unexpected");
			reject("Unexpected");
			return "ignored";
		});
		assertFulfilled(assert, oFulfilledPromise, "OK");

		assertFulfilled(assert, new SyncPromise(function (resolve, reject) {
			resolve(oFulfilledPromise);
			throw new Error("ignored");
		}), "OK");

		assertRejected(assert, new SyncPromise(function (resolve, reject) {
			reject(vReason);
			resolve("Unexpected");
			reject("Unexpected");
			return "ignored";
		}), vReason);

		assertRejected(assert, new SyncPromise(function (resolve, reject) {
			throw vReason;
		}), vReason);

		oPendingPromise = new SyncPromise(function (resolve, reject) {
			resolve(oPromise);
			return "ignored";
		});
		assertPending(assert, oPendingPromise);

		return oPromise.then(function (vResult) {
			assertFulfilled(assert, oPendingPromise, vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("A promise cannot be resolved with itself.", function (assert) {
		var fnResolve,
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				fnResolve = resolve;
			});

		assertPending(assert, oSyncPromise);

		// code under test
		fnResolve(oSyncPromise);

		assertRejected(assert, oSyncPromise);
		return oSyncPromise.catch(function (vReason) {
			assert.ok(vReason instanceof TypeError);
			// behavior for Promise varies:
			// - Chrome: "Chaining cycle detected for promise #<Promise>"
			// - Edge, IE: "You cannot resolve a promise with itself"
			// - FF: "A promise cannot be resolved with itself."
			assert.strictEqual(vReason.message, "A promise cannot be resolved with itself.");
		});
	});

	//*********************************************************************************************
	QUnit.test("Pending on native Promise", function (assert) {
		var oEverPendingPromise = new Promise(function () {}),
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				// Note: wrapping via resolve() must not make a difference here!
				resolve(SyncPromise.resolve(oEverPendingPromise));
			});

		assertPending(assert, oSyncPromise);
	});

	//*********************************************************************************************
	QUnit.test("Resolved, but not yet settled", function (assert) {
		var oSyncPromise = new SyncPromise(function (resolve, reject) {
				resolve(Promise.resolve(42));
				resolve("Unexpected");
				reject("Unexpected");
			});

		assertPending(assert, oSyncPromise);

		return oSyncPromise.then(function (vResult) {
			assert.strictEqual(vResult, 42);
		});
	});

	//*********************************************************************************************
	QUnit.test("thenables: fulfilled", function (assert) {
		var oThenable = {
				then : function (resolve, reject) {
					resolve(42);
					resolve("Unexpected");
					reject("Unexpected");
				}
			},
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				resolve(oThenable);
				resolve("Unexpected");
				reject("Unexpected");
			});

		assertFulfilled(assert, oSyncPromise, 42);
		assertFulfilled(assert, SyncPromise.all([oThenable]), [42]);
	});

	//*********************************************************************************************
	QUnit.test("thenables: rejected", function (assert) {
		var oThenable = {
				then : function (resolve, reject) {
					reject(42);
					resolve("Unexpected");
					reject("Unexpected");
				}
			},
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				resolve(oThenable);
				resolve("Unexpected");
				reject("Unexpected");
			});

		assertRejected(assert, oSyncPromise, 42);
		assertRejected(assert, SyncPromise.all([oThenable]), 42);
	});

	//*********************************************************************************************
	QUnit.test("thenables: cannot get 'then'", function (assert) {
		var oError = new Error("This call intentionally failed"),
			oThenable = Object.defineProperty({}, "then", {
				get : function () {
					throw oError;
				}
			}),
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				resolve(oThenable);
				resolve("Unexpected");
				reject("Unexpected");
			});

		assertRejected(assert, oSyncPromise, oError);
		assertRejected(assert, SyncPromise.all([oThenable]), oError);
	});

	//*********************************************************************************************
	QUnit.test("thenables: function", function (assert) {
		var oSyncPromise,
			fnThenable = function () {};

		fnThenable.then = function (resolve, reject) {
			resolve(42);
			resolve("Unexpected");
			reject("Unexpected");
		};

		oSyncPromise = new SyncPromise(function (resolve, reject) {
			resolve(fnThenable);
			resolve("Unexpected");
			reject("Unexpected");
		});

		assertFulfilled(assert, oSyncPromise, 42);
		assertFulfilled(assert, SyncPromise.all([fnThenable]), [42]);
	});

	//*********************************************************************************************
	QUnit.test("Pending on a thenable", function (assert) {
		var oEverPendingThenable = {
				then : function () {}
			},
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				// Note: wrapping via resolve() must not make a difference here!
				resolve(SyncPromise.resolve(oEverPendingThenable));
			});

		assertPending(assert, oSyncPromise);
		assertPending(assert, SyncPromise.all([oEverPendingThenable]));
	});

	//*********************************************************************************************
//	QUnit.skip("Why does this hang?", function (assert) {
//		// Note: looks like a QUnit issue, not a (Sync)Promise issue
//		return Promise.all([
//			SyncPromise.resolve()
//		]); // Note: .then(function () {}) heals it!
//	});

	//*********************************************************************************************
	QUnit.test("Uncaught (in promise): listener", function (assert) {
		var oMock = this.mock(SyncPromise),
			fnReject,
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				fnReject = reject;
			});

		SyncPromise.listener = function () {};
		oMock.expects("listener").withExactArgs(oSyncPromise, false);

		// code under test
		// Note: qunit.js cannot handle rejection with undefined reason!
		fnReject(0);

		oMock.expects("listener").withExactArgs(oSyncPromise, true);

		// code under test
		oSyncPromise.catch(function () {});

		// code under test (must not call listener again)
		oSyncPromise.catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("Uncaught (in promise): listen on rejected promises only", function (assert) {
		var oSyncPromise = new SyncPromise(function () {});

		SyncPromise.listener = function () {};
		this.mock(SyncPromise).expects("listener").never();

		// code under test
		oSyncPromise.catch(function () {});

		// code under test
		SyncPromise.resolve().then(function () {});
	});

	//*********************************************************************************************
	QUnit.test("caught: a posteriori", function (assert) {
		var oSyncPromise;

		SyncPromise.listener = function () {};
		oSyncPromise = SyncPromise.reject();
		this.mock(SyncPromise).expects("listener").withExactArgs(oSyncPromise, true);

		// code under test
		oSyncPromise.caught();
	});

	//*********************************************************************************************
	QUnit.test("caught: a priori", function (assert) {
		var fnReject,
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				fnReject = reject;
			});

		SyncPromise.listener = function () {};
		this.mock(SyncPromise).expects("listener").never();

		// code under test
		oSyncPromise.caught();

		fnReject();
	});

	//*********************************************************************************************
	QUnit.test("Uncaught (in promise): no listener", function (assert) {
		delete SyncPromise.listener;

		// code under test
		return SyncPromise.reject(0).catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("Uncaught (in promise)", function (assert) {
//		// Note: it's as simple as this...
//		Promise.reject(42); // logs "Uncaught (in promise) 42" and this call's stack
//
//		var done = assert.async(),
//			p = Promise.reject(23); // this logs an error which may later be removed ;-)
//		setTimeout(function () {
//			p.catch(function () {}); // it does not matter when you attach the "catch" handler
//			done();
//		}, 1000);

		// Note: When a SyncPromise wraps a native Promise which is rejected, no native
		// "Uncaught (in promise)" appears anymore!
		return SyncPromise.all([
			// code under test
			SyncPromise.reject(0).catch(function () {}),
			SyncPromise.resolve(Promise.reject(1)).catch(function () {}),
			SyncPromise.resolve(Promise.reject(2)).then().catch(function () {}),
			new SyncPromise(function (resolve, reject) {
				resolve(SyncPromise.resolve(Promise.reject(3)));
			}).catch(function () {}),
			new SyncPromise(function (resolve, reject) {
				resolve(SyncPromise.reject(4));
			}).catch(function () {})
		]);
	});
});
//TODO Promise.race
//TODO Promise.prototype.finally
//TODO treat rejection via RangeError, ReferenceError, SyntaxError(?), TypeError, URIError specially?!
// --> vReason instanceof Error && vReason.constructor !== Error
// Error itself is often used during testing!