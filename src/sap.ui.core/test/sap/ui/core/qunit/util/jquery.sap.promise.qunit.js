/* global QUnit, ES6Promise */

sap.ui.define(["sap/ui/Device", "sap/ui/core/Core"], function(Device, Core) {
	"use strict";

	function hasNativePromise() {
		return Promise.toString().indexOf("[native code]") > -1;
	}

	QUnit.test("Verify Expectations reg. Native Support", function(assert) {
		/**
		 * Check our knowledge regarding native Promise support against reality.
		 */
		var knownToSupportPromisesNatively =
				Device.browser.firefox && Device.browser.version > 28
				|| Device.browser.chrome && Device.browser.version > 32
				|| Device.browser.safari && Device.browser.version >= 7.1 && !Device.os.ios
				|| Device.browser.safari && Device.os.version >= 8 && Device.os.ios
				|| Device.browser.edge
				;

		if ( knownToSupportPromisesNatively ) {
			assert.ok(hasNativePromise(), "All browsers except IE11 support Promises natively.");
		} else {
			assert.ok(!hasNativePromise(), "IE11 does not support Promises natively.");
		}
	});

	if ( hasNativePromise() ) {
		testPromise(Promise, "Native: ");
	}
	if ( typeof ES6Promise !== "undefined" ) {
		testPromise(ES6Promise.Promise, "Polyfill: ");
	}

	function testPromise(P, sTestPrefix) {

		/////////////////////////////////////////////// Helper Functions ///////////////////////////////////////////////

		function asyncAction(bFail, oObj, iDelay){
			return new P(function(fResolve, fReject) {
				var f = bFail ? fReject : fResolve;
				setTimeout(function(){
					f(oObj);
				}, iDelay || 10);
			});
		}

		function asyncAction_Deferred(bFail, oObj, iDelay){
			var d = new jQuery.Deferred();
			(function(fResolve, fReject) {
				var f = bFail ? fReject : fResolve;
				setTimeout(function(){
					f(oObj);
				}, iDelay || 10);
			})(function(o){d.resolve(o);}, function(o){d.reject(o);});
			return d.promise();
		}

		function createLog(){
			var aLog = [];
			return function(txt, flush){
				aLog.push(txt);
				if (flush){
					var s = aLog.join(" -> ");
					return s;
				}
			};
		}




		///////////////////////////////////////////////// Actual Tests /////////////////////////////////////////////////

		// qutils.delayTestStart();

		QUnit.module(sTestPrefix + "Basics");

		var bNative = P.toString().indexOf("[native code]") > -1;

		QUnit.test((bNative ? "Native" : "Custom") + " API tested", function(assert) {
			var p = new P(function(res, rej) {
				rej();
			});
			assert.ok(!p._subscribers && bNative || p._subscribers && !bNative , (bNative ? "Native" : "Custom") + " Promise implementation active.");
		});


		QUnit.module(sTestPrefix + "promise.then");

		QUnit.test("API available", function(assert) {
			var p = new P(function(res, rej){rej();});
			assert.ok(typeof (p.then) == "function", "promise.then is a function");
		});

		QUnit.test("promise.then", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			p1.then(function(oVal){
				assert.equal(oVal, "X", "Success Case - promise.then");
			}, function(oVal){
				assert.ok(false, "Success Case - promise.then, Fail should not be called");
			});

			var p2 = asyncAction(true, "Y", 10);
			p2.then(function(oVal){
				assert.ok(false, "Fail Case - promise.then, Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "Y", "Fail Case - Promise.then");
				done();
			});
		});

		QUnit.test("promise.then after resolve/reject", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			setTimeout(function(){
				p1.then(function(oVal){
					assert.equal(oVal, "X", "Success Case - promise.then");
				}, function(oVal){
					assert.ok(false, "Success Case - promise.then, Fail should not be called");
				});
			}, 30);

			var p2 = asyncAction(true, "Y", 10);
			setTimeout(function(){
				p2.then(function(oVal){
					assert.ok(false, "Fail Case - promise.then, Success should not be called");
					done();
				}, function(oVal){
					assert.equal(oVal, "Y", "Fail Case - Promise.then");
					done();
				});
			}, 40);
		});

		QUnit.test("Promise then always asynchronous", function(assert) {
			var done = assert.async();
			assert.expect(4);

			var iCounter = 0;

			var pResolvedDirectly = P.resolve();
			var fnResolveSecondPromise;
			var pResolvedLater = new Promise(function(fnResolve /*, fnReject */) {
				fnResolveSecondPromise = fnResolve;
			});

			assert.equal(iCounter++, 0, "Synchronous Before");

			pResolvedDirectly.then(function() {
				assert.equal(iCounter++, 2, "First promise.then() - Resolved after synchronous code");
			});

			pResolvedLater.then(function() {
				assert.equal(iCounter++, 3, "Second promise.then() - Resolved after first promise.then()");
				done();
			});

			fnResolveSecondPromise();

			assert.equal(iCounter++, 1, "Synchronous After - befor promise.then()");
		});


		QUnit.module(sTestPrefix + "promise.catch");

		QUnit.test("API available", function(assert) {
			var p = new P(function(res, rej){rej();});
			assert.ok(typeof (p["catch"]) == "function", "promise.catch is a function");
		});

		QUnit.test("promise.catch", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			p1["catch"](function(oVal){
				assert.ok(false, "Success Case - promise.catch, Fail should not be called");
			});

			var p2 = asyncAction(true, "Y", 10);
			p2["catch"](function(oVal){
				assert.equal(oVal, "Y", "Fail Case - Promise.catch");
				done();
			});
		});

		QUnit.test("promise.catch after resolve/reject", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			setTimeout(function(){
				p1["catch"](function(oVal){
					assert.ok(false, "Success Case - promise.catch, Fail should not be called");
				});
			}, 30);

			var p2 = asyncAction(true, "Y", 10);
			setTimeout(function(){
				p2["catch"](function(oVal){
					assert.equal(oVal, "Y", "Fail Case - Promise.catch");
					done();
				});
			}, 40);
		});


		QUnit.module(sTestPrefix + "promise.finally");

		QUnit.test("API available", function(assert) {
			var p = new P(function(res, rej){rej();});
			assert.ok(typeof (p["finally"]) == "function", "promise.finally is a function");
		});

		QUnit.test("promise.finally on resolved promise", function(assert) {
			var done = assert.async();
			var p = asyncAction(false, "X", 10);
			assert.expect(4);
			var r = p.finally(function(oVal){
				assert.ok(true, "finally callback should be called on resolution");
			});
			assert.ok(r instanceof P, "finally should return a promise");
			assert.notStrictEqual(r, p, "finally should return a new promise");
			r.then(function(v) {
				assert.equal(v, "X", "finally callback should not modify fulfillment");
				done();
			}, function(v) {
				assert.ok(false, "promise returned by finally on a resolved promise shouldn't fail");
				done();
			});
		});

		QUnit.test("promise.finally on rejected promise", function(assert) {
			var done = assert.async();
			assert.expect(4);
			var p = asyncAction(true, "Y", 10);
			var r = p.finally(function(oVal){
				assert.ok(true, "finally callback should be called on rejection");
			});
			assert.ok(r instanceof P, "finally should return a promise");
			assert.notStrictEqual(r, p, "finally should return a new promise");
			r.then(function(v) {
				assert.ok(false, "promise returned by finally on a rejected promise shouldn't succeed");
				done();
			}, function(v) {
				assert.equal(v, "Y", "finally callback should not modify rejection reason");
				done();
			});
		});

		QUnit.test("promise.finally on resolved promise w/o callback", function(assert) {
			var done = assert.async();
			var p = asyncAction(false, "X", 10);
			assert.expect(3);
			var r = p.finally();
			assert.ok(r instanceof P, "finally should return a promise");
			assert.notStrictEqual(r, p, "finally should return a new promise");
			r.then(function(v) {
				assert.equal(v, "X", "finally w/o callback should not modify fulfillment");
				done();
			}, function(v) {
				assert.ok(false, "promise returned by finally on a resolved promise shouldn't fail");
				done();
			});
		});

		QUnit.test("promise.finally on rejected promise w/o callback", function(assert) {
			var done = assert.async();
			assert.expect(3);
			var p = asyncAction(true, "Y", 10);
			var r = p.finally();
			assert.ok(r instanceof P, "finally should return a promise");
			assert.notStrictEqual(r, p, "finally should return a new promise");
			r.then(function(v) {
				assert.ok(false, "promise returned by finally on a rejected promise shouldn't succeed");
				done();
			}, function(v) {
				assert.equal(v, "Y", "finally w/o callback should not modify rejection reason");
				done();
			});
		});


		QUnit.module(sTestPrefix + "Promise.resolve");

		QUnit.test("API available", function(assert) {
			assert.ok(typeof (P.resolve) == "function", "Promise.resolve is a function");
		});

		QUnit.test("Promise.resolve(promise)", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			var p2 = P.resolve(p1);
			if (!bNative || !Device.browser.safari) {
				assert.ok(p1 == p2, "Promise.resolve(promise) == promise");
			}

			p2.then(function(oVal){
				assert.equal(oVal, "X", "Success Case - Promise.resolve(Thenable)");
			}, function(oVal){
				assert.ok(false, "Success Case - Promise.resolve(Thenable), Fail should not be called");
			});

			var p3 = asyncAction_Deferred(true, "Y", 10);
			var p4 = P.resolve(p3);
			p4.then(function(oVal){
				assert.ok(false, "Fail Case - Promise.resolve(Thenable), Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "Y", "Fail Case - Promise.resolve(Thenable)");
				done();
			});
		});

		QUnit.test("Promise.resolve(thenable)", function(assert) {
			var done = assert.async();
			var d1 = asyncAction_Deferred(false, "X", 10);
			var p1 = P.resolve(d1);
			p1.then(function(oVal){
				assert.equal(oVal, "X", "Success Case - Promise.resolve(Thenable)");
			}, function(oVal){
				assert.ok(false, "Success Case - Promise.resolve(Thenable), Fail should not be called");
			});

			var d2 = asyncAction_Deferred(true, "Y", 10);
			var p2 = P.resolve(d2);
			p2.then(function(oVal){
				assert.ok(false, "Fail Case - Promise.resolve(Thenable), Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "Y", "Fail Case - Promise.resolve(Thenable)");
				done();
			});
		});

		QUnit.test("Promise.resolve(obj)", function(assert) {
			var done = assert.async();
			function check(oValue, bStart){
				var p = P.resolve(oValue);
				p.then(function(oVal){
					assert.equal(oVal, oValue, "Success Case - Promise.resolve(" + oValue + ")");
					if (bStart){
						done();
					}
				}, function(oVal){
					assert.ok(false, "Promise.resolve(" + oValue + "), Fail should not be called");
					if (bStart){
						done();
					}
				});
			}

			check("");
			check("Hello");
			check(null);
			check(undefined);
			check(5);
			check(function(){});
			check(new Error());
			check({}, true);
		});

		QUnit.test("then: resolve/reject called multiple times - 1", function(assert){
			var done = assert.async();
			var oError = new Error("error"),
				iSuccessCount = 0,
				iFailCount = 0,
				thenable = {
					then: function(resolve, reject){
						resolve("X");
						reject(oError);
					}
				};

			P.resolve(thenable).then(function(oVal){
				assert.equal(oVal, "X", "Success with correct value");
				iSuccessCount++;
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				iFailCount++;
			});

			setTimeout(function(){
				assert.equal(iSuccessCount, 1, "Success only called once");
				assert.equal(iFailCount, 0, "Fail must not be called");
				done();
			}, 10);
		});

		QUnit.test("then: resolve/reject called multiple times - 2", function(assert){
			var done = assert.async();
			var iSuccessCount = 0,
				iFailCount = 0,
				thenable = {
					then: function(resolve, reject){
						resolve("X");
						resolve("Y");
					}
				};

			P.resolve(thenable).then(function(oVal){
				assert.equal(oVal, "X", "Success with correct value");
				iSuccessCount++;
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				iFailCount++;
			});

			setTimeout(function(){
				assert.equal(iSuccessCount, 1, "Success only called once");
				assert.equal(iFailCount, 0, "Fail must not be called");
				done();
			}, 10);
		});

		QUnit.test("then: resolve/reject called multiple times - 3", function(assert){
			var done = assert.async();
			var oError = new Error("error"),
				iSuccessCount = 0,
				iFailCount = 0,
				thenable = {
					then: function(resolve, reject){
						reject(oError);
						resolve("X");
					}
				};

			P.resolve(thenable).then(function(oVal){
				assert.ok(false, "Success should not be called");
				iSuccessCount++;
			}, function(oVal){
				assert.ok(oVal === oError, "Failed with the correct error");
				iFailCount++;
			});

			setTimeout(function(){
				assert.equal(iSuccessCount, 0, "Success must not be called");
				assert.equal(iFailCount, 1, "Fail only called once");
				done();
			}, 10);
		});

		QUnit.test("then: resolve/reject called multiple times - 4", function(assert){
			var done = assert.async();
			var oError = new Error("error"),
				iSuccessCount = 0,
				iFailCount = 0,
				thenable = {
					then: function(resolve, reject){
						reject(oError);
						reject(new Error("error2"));
					}
				};

			P.resolve(thenable).then(function(oVal){
				assert.ok(false, "Success should not be called");
				iSuccessCount++;
			}, function(oVal){
				assert.ok(oVal === oError, "Failed with the correct error");
				iFailCount++;
			});

			setTimeout(function(){
				assert.equal(iSuccessCount, 0, "Success must not be called");
				assert.equal(iFailCount, 1, "Fail only called once");
				done();
			}, 10);
		});


		QUnit.module(sTestPrefix + "Promise.reject");

		QUnit.test("API available", function(assert) {
			assert.ok(typeof (P.reject) == "function", "Promise.reject is a function");
		});

		QUnit.test("Promise.reject(obj)", function(assert) {
			var done = assert.async();
			function check(oValue, bStart){
				var p = P.reject(oValue);
				p.then(function(oVal){
					assert.ok(false, "Promise.resolve(" + oValue + "), Success should not be called");
					if (bStart){
						done();
					}
				}, function(oVal){
					assert.equal(oVal, oValue, "Promise.resolve(" + oValue + "), Success Case");
					if (bStart){
						done();
					}
				});
			}

			check("");
			check("Hello");
			check(null);
			check(undefined);
			check(5);
			check(function(){});
			check(new Error());
			check(asyncAction(false, "X", 10, false));
			check(asyncAction_Deferred(false, "X", 10, false));
			check({}, true);
		});


		QUnit.module(sTestPrefix + "Promise.all");

		QUnit.test("API available", function(assert) {
			assert.ok(typeof (P.all) == "function", "Promise.all is a function");
		});

		QUnit.test("Promise.all - Success Case", function(assert) {
			var done = assert.async();
			var p = P.all([asyncAction(false, "X", 10, false), asyncAction(false, "Y", 10, false)]);
			p.then(function(oVal){
				assert.ok(Array.isArray(oVal), "Result is array");
				assert.equal(oVal.length, 2, "Result has length 2");
				assert.equal(oVal[0], "X", "Result[0] is 'X'");
				assert.equal(oVal[1], "Y", "Result[1] is 'Y'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("Promise.all - Fail Case 1", function(assert) {
			var done = assert.async();
			var p = P.all([asyncAction(true, "X", 10, false), asyncAction(false, "Y", 10, false)]);
			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "X", "Result is 'X'");
				done();
			});
		});

		QUnit.test("Promise.all - Fail Case 2", function(assert) {
			var done = assert.async();
			var p = P.all([asyncAction(false, "X", 10, false), asyncAction(true, "Y", 10, false)]);
			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "Y", "Result is 'Y'");
				done();
			});
		});

		QUnit.test("Promise.all - Fail Case 3", function(assert) {
			var done = assert.async();
			var p = P.all([asyncAction(true, "X", 10, false), asyncAction(true, "Y", 10, false)]);
			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "X", "Result is 'X'");
				done();
			});
		});

		QUnit.test("Promise.all - empty array", function (assert) {
			var done = assert.async();
			var p = P.all([]);
			assert.ok(p instanceof P);

			p.then(function(val) {
				assert.deepEqual([], val);
				done();
			}, function(val) {
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("Promise.all - no array parameter", function(assert){
			var done = assert.async();
			P.all({}).then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.ok(oVal instanceof Error, "Fail should be called with an Error");
				done();
			});
		});

		QUnit.test("Promise.all - non-promise array content", function(assert){
			var done = assert.async();
			P.all(["X", new P(function(resolve, reject){resolve("Y");})]).then(function(oVal){
				assert.ok(Array.isArray(oVal), "Result is array");
				assert.equal(oVal.length, 2, "Result has length 2");
				assert.equal(oVal[0], "X", "Result[0] is 'X'");
				assert.equal(oVal[1], "Y", "Result[1] is 'Y'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});


		QUnit.module(sTestPrefix + "Promise.race");

		QUnit.test("API available", function(assert) {
			assert.ok(typeof (P.race) == "function", "Promise.race is a function");
		});

		QUnit.test("Promise.race - Fail Case 1", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(true, "X", 10, false), asyncAction(true, "Y", 20, false)]);
			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "X", "Result is 'X'");
				done();
			});
		});

		QUnit.test("Promise.race - Fail Case 2", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(true, "X", 20, false), asyncAction(true, "Y", 10, false)]);
			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "Y", "Result is 'Y'");
				done();
			});
		});

		QUnit.test("Promise.race - Fail Case 3", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(false, "X", 20, false), asyncAction(true, "Y", 10, false)]);
			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.equal(oVal, "Y", "Result is 'Y'");
				done();
			});
		});

		QUnit.test("Promise.race - Success Case 1", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(false, "X", 10, false), asyncAction(false, "Y", 20, false)]);
			p.then(function(oVal){
				assert.equal(oVal, "X", "Result is 'X'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("Promise.race - Success Case 2", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(false, "X", 20, false), asyncAction(false, "Y", 10, false)]);
			p.then(function(oVal){
				assert.equal(oVal, "Y", "Result is 'Y'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("Promise.race - Success Case 3", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(false, "X", 10, false), asyncAction(true, "Y", 20, false)]);
			p.then(function(oVal){
				assert.equal(oVal, "X", "Result is 'X'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("Promise.race - Success Case 4", function(assert) {
			var done = assert.async();
			var p = P.race([asyncAction(true, "X", 20, false), asyncAction(false, "Y", 10, false)]);
			p.then(function(oVal){
				assert.equal(oVal, "Y", "Result is 'Y'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("Promise.race - empty array", function(assert){
			var done = assert.async();
			P.race([]).then(function(oVal){
				sCallbackCalled = "Success";
			}, function(oVal){
				sCallbackCalled = "Fail";
			});

			var sCallbackCalled = null;

			setTimeout(function(){
				assert.ok(!sCallbackCalled, "No callback should not be called: " + sCallbackCalled);
				done();
			}, 30);
		});

		QUnit.test("Promise.race - no array parameter", function(assert){
			var done = assert.async();
			P.race({}).then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.ok(oVal instanceof TypeError, "Fail should be called with an TypeError");
				done();
			});
		});

		QUnit.test("Promise.race - non-promise array content", function(assert){
			var done = assert.async();
			var p = P.race(["X", new P(function(resolve, reject){
				setTimeout(function(){reject("Y");}, 10);
			})]);
			p.then(function(oVal){
				assert.equal(oVal, "X", "Success Result is 'X'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called " + oVal);
				done();
			});
		});


		QUnit.module(sTestPrefix + "then chaining");

		QUnit.test("Chain Test 1", function(assert) {
			var done = assert.async();
			var log = createLog();
			asyncAction(false, "1", 10, false).then(function(oVal){
				log("A: " + oVal);
				return "X";
			}).then(function(oVal){
				log("B: " + oVal);
				return asyncAction(false, "2", 10);
			}).then(function(oVal){
				var sRes = log("C: " + oVal, true);
				assert.equal(sRes, "A: 1 -> B: X -> C: 2", "Result is: " + sRes);
				done();
			});
		});


		/*
		see http://www.html5rocks.com/en/tutorials/es6/promises/

			   [1]---------+
				|ok        |
			   [2]-----------[4]------[6]--[FAIL]
				|ok		   |  |        |      |
			   [3]---------+  |        |      |
				|ok			  |ok      |      |
		[FAIL]-[5]------------+        |ok    |
		  |     |ok                    |      |
		  +-[SUCCESS]------------------+------+

		*/
		function checkChain(done, aResults, fSuccessCallback, fFailCallback, bExpectFail){
			var log = createLog();
			asyncAction(aResults[0], "1", 10, false).then(function(oVal) {
				log("A: " + oVal);
				return asyncAction(aResults[1], "2", 10);
			}).then(function(oVal) {
				log("B: " + oVal);
				return asyncAction(aResults[2], "3", 10);
			})["catch"](function(oVal) {
				log("C: " + oVal);
				return asyncAction(aResults[3], "4", 10);
			}).then(function(oVal) {
				log("D: " + oVal);
				return asyncAction(aResults[4], "5", 10);
			}, function(oVal) {
				log("E: " + oVal);
				return asyncAction(aResults[5], "6", 10);
			})["catch"](function(oVal) {
				var sRes = log("FAIL: " + oVal, true);
				fFailCallback(sRes);
				if (!bExpectFail){
					done();
				}
			}).then(function(oVal) {
				var sRes = log("SUCCESS: " + oVal, true);
				fSuccessCallback(sRes);
				done();
			});
		}

		QUnit.test("Chain Test 2", function(assert) {
			var done = assert.async();
			checkChain(done, [false, false, false, false, false, false], function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> D: 3 -> SUCCESS: 5", "Result is: " + sResult);
			}, function(sResult){
				assert.ok(false, "Fail should not be called");
			});
		});

		QUnit.test("Chain Test 3", function(assert) {
			var done = assert.async();
			checkChain(done, [true, false, false, false, false, false], function(sResult){
				assert.equal(sResult, "C: 1 -> D: 4 -> SUCCESS: 5", "Result is: " + sResult);
			}, function(sResult){
				assert.ok(false, "Fail should not be called");
			});
		});

		QUnit.test("Chain Test 4", function(assert) {
			var done = assert.async();
			checkChain(done, [false, true, false, false, false, false], function(sResult){
				assert.equal(sResult, "A: 1 -> C: 2 -> D: 4 -> SUCCESS: 5", "Result is: " + sResult);
			}, function(sResult){
				assert.ok(false, "Fail should not be called");
			});
		});

		QUnit.test("Chain Test 5", function(assert) {
			var done = assert.async();
			checkChain(done, [false, false, true, false, false, false], function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> C: 3 -> D: 4 -> SUCCESS: 5", "Result is: " + sResult);
			}, function(sResult){
				assert.ok(false, "Fail should not be called");
			});
		});

		QUnit.test("Chain Test 6", function(assert) {
			var done = assert.async();
			checkChain(done, [false, false, true, true, false, false], function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> C: 3 -> E: 4 -> SUCCESS: 6", "Result is: " + sResult);
			}, function(sResult){
				assert.ok(false, "Fail should not be called");
			});
		});

		QUnit.test("Chain Test 7", function(assert) {
			var done = assert.async();
			checkChain(done, [false, false, true, true, false, true], function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> C: 3 -> E: 4 -> FAIL: 6 -> SUCCESS: undefined", "Success-Result is: " + sResult);
			}, function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> C: 3 -> E: 4 -> FAIL: 6", "Fail-Result is: " + sResult);
			}, true);
		});

		QUnit.test("Chain Test 8", function(assert) {
			var done = assert.async();
			checkChain(done, [false, false, false, false, true, false], function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> D: 3 -> FAIL: 5 -> SUCCESS: undefined", "Success-Result is: " + sResult);
			}, function(sResult){
				assert.equal(sResult, "A: 1 -> B: 2 -> D: 3 -> FAIL: 5", "Fail-Result is: " + sResult);
			}, true);
		});

		QUnit.test("Chain Test 9", function(assert) {
			var done = assert.async();
			checkChain(done, [false, true, false, false, true, false], function(sResult){
				assert.equal(sResult, "A: 1 -> C: 2 -> D: 4 -> FAIL: 5 -> SUCCESS: undefined", "Success-Result is: " + sResult);
			}, function(sResult){
				assert.equal(sResult, "A: 1 -> C: 2 -> D: 4 -> FAIL: 5", "Fail-Result is: " + sResult);
			}, true);
		});

		QUnit.test("Chain Test 10", function (assert){
			var done = assert.async();
			var resolveP1, rejectP2;
			var log = createLog();

			var p1 = new P(function(resolve, reject){
				resolveP1 = resolve;
			});
			var p2 = new P(function(resolve, reject){
				rejectP2 = reject;
			});

			rejectP2("B");
			resolveP1("A");

			setTimeout(function(){
				p1.then(function(val) {
					log(val);
				});

				p2["catch"](function(val){
					log(val);
				}).then(function(){
					var res = log("C", true);
					assert.equal(res, "A -> B -> C", "Chaining is: " + res);
				}).then(function(){
					done();
				})["catch"](function(){
					done();
				});
			}, 0);
		});


		QUnit.module(sTestPrefix + "error handling");

		QUnit.test("throw error in promise.then", function(assert) {
			var done = assert.async();
			var p = asyncAction(false, "1", 10);
			p.then(function(oVal){
				throw new Error("error");
			}).then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.ok(oVal instanceof Error, "Fail-Result is an error");
				assert.equal(oVal.message, "error", "Fail-Result message is: " + oVal.message);
				done();
			});
		});

		QUnit.test("throw error in promise.catch", function(assert) {
			var done = assert.async();
			var p = asyncAction(true, "1", 10);
			p["catch"](function(oVal){
				throw new Error("error");
			}).then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.ok(oVal instanceof Error, "Fail-Result is an error");
				assert.equal(oVal.message, "error", "Fail-Result message is: " + oVal.message);
				done();
			});
		});

		QUnit.test("throw error in action (sync)", function(assert) {
			var done = assert.async();
			var log = createLog();
			log("A");

			var p = new P(function(fResolve, fReject) {
				log("B");
				throw new Error("error");
			});

			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				var res = log("D", true);
				assert.ok(oVal instanceof Error, "Fail-Result is an error");
				assert.equal(oVal.message, "error", "Fail-Result message is: " + oVal.message);
				assert.equal(res, "A -> B -> C -> D", "Success-Result is: " + res);
				done();
			});

			log("C");
		});

		QUnit.test("throw error in action (async)", function(assert) {
			var done = assert.async();
			var log = createLog();
			log("A");

			var p = new P(function(fResolve, fReject) {
				log("B");
				setTimeout(function () {
					log("D");
					//throw new Error("error"),
					//fResolve();
				}, 10);
			});

			var sCallbackCalled = null;

			p.then(function(oVal){
				sCallbackCalled = "Success";
			}, function(oVal){
				sCallbackCalled = "Fail";
			});

			log("C");

			setTimeout(function(){
				var res = log("E", true);
				assert.ok(!sCallbackCalled, "No callback should not be called: " + sCallbackCalled);
				assert.equal(res, "A -> B -> C -> D -> E", "Result is: " + res);
				done();
			}, 30);
		});

		QUnit.test("Wrong argument in constructor", function(assert) {
			assert.throws(function(){
				new P("not callable");
			}, Error);
		});

		QUnit.test("Error in then: resolve/reject already called", function(assert){
			var done = assert.async();
			var thenable = {
				then: function(resolve, reject){
					resolve("X");
					throw new Error("error");
				}
			};

			P.resolve(thenable).then(function(oVal){
				assert.equal(oVal, "X", "Success with correct value");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		// This test was broken in Chrome 66 and has been fixed with Chrome 66.0.3359.181
		// https://bugs.chromium.org/p/chromium/issues/detail?id=830565
		QUnit.test("Error in then: resolve/reject not yet called", function(assert){
			var done = assert.async();
			var oError = new Error("error");
			var thenable = {
				then: function(resolve, reject){
					throw oError;
				}
			};

			P.resolve(thenable).then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				assert.ok(oVal === oError, "Failed with the correct error");
				done();
			});
		});

		QUnit.module(sTestPrefix + "sync");

		QUnit.test("sync resolve inside executor", function(assert) {
			var done = assert.async();
			var log = createLog();
			log("A");

			var p = new P(function(fResolve, fReject) {
				log("B");
				fResolve("X");
			});

			p.then(function(oVal){
				var res = log("D " + oVal, true);
				assert.equal(res, "A -> B -> C -> D X", "Success-Result is: " + res);
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});

			log("C");
		});

		QUnit.test("sync reject inside executor", function(assert) {
			var done = assert.async();
			var log = createLog();
			log("A");

			var p = new P(function(fResolve, fReject) {
				log("B");
				fReject("X");
			});

			p.then(function(oVal){
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal){
				var res = log("D " + oVal, true);
				assert.equal(res, "A -> B -> C -> D X", "Fail-Result is: " + res);
				done();
			});

			log("C");
		});


		QUnit.module(sTestPrefix + "Assimilation");

		QUnit.test("resolve called with a successful promise", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			var p2 = asyncAction(false, p1, 10);

			p2.then(function(oVal) {
				assert.equal(oVal, "X", "Success called with the correct value");
				done();
			}, function(oVal) {
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("resolve called with a rejected promise", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(true, "X", 10);
			var p2 = asyncAction(false, p1, 10);

			p2.then(function(oVal) {
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal) {
				assert.equal(oVal, "X", "Fail called with the correct value");
				done();
			});
		});

		QUnit.test("resolve called with a successful thenable", function(assert) {
			var done = assert.async();
			var p1 = asyncAction_Deferred(false, "X", 10);
			var p2 = asyncAction(false, p1, 10);

			p2.then(function(oVal) {
				assert.equal(oVal, "X", "Success called with the correct value");
				done();
			}, function(oVal) {
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("resolve called with a rejected thenable", function(assert) {
			var done = assert.async();
			var p1 = asyncAction_Deferred(true, "X", 10);
			var p2 = asyncAction(false, p1, 10);

			p2.then(function(oVal) {
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal) {
				assert.equal(oVal, "X", "Fail called with the correct value");
				done();
			});
		});

		QUnit.test("resolve called with a successful promise (multi-level)", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			var p2 = asyncAction(false, p1, 10);
			var p3 = asyncAction(false, p2, 10);

			p3.then(function(oVal) {
				assert.equal(oVal, "X", "Success called with the correct value");
				done();
			}, function(oVal) {
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("resolve called with a rejected promise (multi-level)", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(true, "X", 10);
			var p2 = asyncAction(false, p1, 10);
			var p3 = asyncAction(false, p2, 10);

			p3.then(function(oVal) {
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal) {
				assert.equal(oVal, "X", "Fail called with the correct value");
				done();
			});
		});

		QUnit.test("resolve called with a successful promise (multi-level, mix with thenables)", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			var p2 = asyncAction(false, p1, 10);
			var p3 = asyncAction(false, p2, 10);

			p3.then(function(oVal) {
				assert.equal(oVal, "X", "Success called with the correct value");
				done();
			}, function(oVal) {
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

		QUnit.test("resolve called with a rejected promise (multi-level, mix with thenables)", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(true, "X", 10);
			var p2 = asyncAction_Deferred(false, p1, 10);
			var p3 = asyncAction(false, p2, 10);

			p3.then(function(oVal) {
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal) {
				assert.equal(oVal, "X", "Fail called with the correct value");
				done();
			});
		});

		QUnit.test("reject called with a successful promise", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "X", 10);
			var p2 = asyncAction(true, p1, 0);

			p2.then(function(oVal) {
				assert.ok(false, "Success should not be called");
				done();
			}, function(oVal) {
				assert.ok(oVal === p1, "Fail called with the correct value");
				done();
			});
		});

		QUnit.test("Promise.all", function(assert) {
			var done = assert.async();
			var p1 = asyncAction(false, "Y", 10);
			var p2 = asyncAction(false, p1, 10);

			var p = P.all([asyncAction(false, "X", 10, false), p2]);
			p.then(function(oVal){
				assert.ok(Array.isArray(oVal), "Result is array");
				assert.equal(oVal.length, 2, "Result has length 2");
				assert.equal(oVal[0], "X", "Result[0] is 'X'");
				assert.equal(oVal[1], "Y", "Result[1] is 'Y'");
				done();
			}, function(oVal){
				assert.ok(false, "Fail should not be called");
				done();
			});
		});

	}
});
