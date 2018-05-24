sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"unitTests/utils/browser",
		"sap/ui/test/actions/Press"
	], function (Opa5, opaTest, browser, Press) {

		QUnit.module("IFrame utils");

		var mUtils = {
			getPlugin: function (window) {
				return new window.sap.ui.test.OpaPlugin("sap.ui.test.Opa5")
			},
			getJQuery: function (window) {
				return window.$;
			},
			getWindow: function (window) {
				return window;
			},
			getUtils: function (window) {
				return window.sap.ui.qunit.QUnitUtils;
			},
			getHashChanger: function (window) {
				return window.sap.ui.core.routing.HashChanger.getInstance();
			}
		};

		Object.keys(mUtils).forEach(function (sGetter) {
			QUnit.test("Should " + sGetter + " in an IFrame", function (assert) {
				var done = assert.async(),
					oOpa5 = new Opa5();

				assert.deepEqual(Opa5[sGetter](), mUtils[sGetter](window), "Initially the outer context utils are returned");

				oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");
				oOpa5.waitFor({
					success: function () {
						var oFrame = document.getElementById("OpaFrame");
						assert.ok(Opa5[sGetter](), "IFrame utils are returned when IFrame is started");
						assert.deepEqual(Opa5[sGetter](), mUtils[sGetter](oFrame.contentWindow), "IFrame utils are returned after IFrame is started");
					}
				});
				oOpa5.iTeardownMyAppFrame();
				oOpa5.waitFor({
					success: function () {
						assert.deepEqual(Opa5[sGetter](), mUtils[sGetter](window), "After teardown the outer context utils are returned again");
					}
				});

				Opa5.emptyQueue().done(done);
			});
		});

		QUnit.module("IFrame");

		QUnit.test("Should find an IFrame in the dom instead of creating it", function(assert) {
			// System under Test
			var oOpa5 = new Opa5(),
				done = assert.async();
			jQuery("body").append('<iframe id="OpaFrame" src="../testdata/emptySite.html"></iframe>');
			var oFrame = document.getElementById("OpaFrame");

			// Act
			oOpa5.iStartMyAppInAFrame().done(function() {

				// Act + Assert
				assert.ok(oFrame === document.getElementById("OpaFrame"), "did not re-create the frame");

			});

			oOpa5.iTeardownMyAppFrame().done(function () {

				assert.ok(!jQuery("#OpaFrame").length, "did remove the frame");
				done();

			});

			oOpa5.emptyQueue();
		});

		// TODO: check why the following tests do not work
		// Answer from tobias: our bootstrap does not work if the UI5 script tag is included in an async way when serving with grunt.
		// The page we test includes UI5 after some time so its not a test issue.
		if (window["sap-ui-bootstrap-tests"]) {

			QUnit.test("Should be able to defer the loading of ui5 and replace the hashchanger", function(assert) {
				// System under Test
				var oOpa5 = new Opa5(),
					done = assert.async();

				// Act
				oOpa5.iStartMyAppInAFrame("../testdata/emptySiteDeferredUi5Load.html").done(function() {
					var oWindow = Opa5.getWindow();

					// Act
					var oNewHashChanger = new oWindow.sap.ui.core.routing.HashChanger();
					var fnSetHash = oNewHashChanger.setHash;
					oWindow.sap.ui.core.routing.HashChanger.replaceHashChanger(oNewHashChanger);

					// Assert
					assert.notStrictEqual(oNewHashChanger.setHash, fnSetHash, "did modify the hashchanger");

				});

				oOpa5.iTeardownMyAppFrame().done(done);

				oOpa5.emptyQueue();
			});

			QUnit.test("Should Create and destroy an IFrame", function(assert) {
				// System under Test
				var oOpa5 = new Opa5(),
					done = assert.async(),
					oWindowOpaPlugin = Opa5.getPlugin();

				// Act
				oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html").done(function() {
					// Act + Assert
					assert.strictEqual(jQuery("#OpaFrame").length, 1, "did create the frame");
					assert.ok(Opa5.getWindow(), "initalized the window of the frame");
					assert.ok(oWindowOpaPlugin !== Opa5.getPlugin(), "initalized the plugin");
					assert.ok(Opa5.getJQuery(), "initalized jQuery");
					assert.ok(Opa5.getUtils(), "initalized the utils");
					assert.ok(Opa5.getHashChanger(), "initalized the hashChanger");

				});

				oOpa5.iTeardownMyAppFrame().done(function () {

					assert.ok(!jQuery("#OpaFrame").length, "did remove the frame");
					assert.strictEqual(Opa5.getWindow(), null, "purged the window of the frame");
					assert.strictEqual(Opa5.getPlugin(), oWindowOpaPlugin, "purged the plugin");
					assert.strictEqual(Opa5.getJQuery(), null, "purged jQuery");
					assert.strictEqual(Opa5.getUtils(), null, "purged the utils");
					assert.strictEqual(Opa5.getHashChanger(), null, "purged the hashChanger");

					done();

				});

				oOpa5.emptyQueue();
			});
		}

		QUnit.test("Should use default iFrame scale", function (assert) {
			var done = assert.async();
			var oOpa5 = new Opa5();

			oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html").done(function() {
				assert.ok(jQuery("#OpaFrame").hasClass("default-scale-both"), "Applied default size and scale");
			});

			oOpa5.iTeardownMyAppFrame();
			oOpa5.emptyQueue().done(done);
		});

		QUnit.test("Should apply user's iFrame width and height", function (assert) {
			var done = assert.async();
			var oOpa5 = new Opa5();

			oOpa5.iStartMyAppInAFrame({source: "../testdata/emptySite.html", width: 700, height: 400}).done(function() {
				assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame", "Should not scale frame");
				assert.strictEqual(jQuery("#OpaFrame").css("width"), "700px", "Should have desired frame width");
				assert.strictEqual(jQuery("#OpaFrame").css("height"), "400px", "Should have desired frame height");
			});

			oOpa5.iTeardownMyAppFrame();

			oOpa5.iStartMyAppInAFrame({source: "../testdata/emptySite.html", width: 700}).done(function() {
				assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame default-scale-y", "Should scale only frame height");
				assert.strictEqual(jQuery("#OpaFrame").css("width"), "700px", "Should have desired frame width");
				assert.strictEqual(jQuery("#OpaFrame").css("height"), jQuery("body").css("height"), "Should have default frame height");
			});

			oOpa5.iTeardownMyAppFrame();
			oOpa5.emptyQueue().done(done);
		});

		QUnit.test("Should apply iFrame width and height from OPA config", function (assert) {
			var done = assert.async();
			var oOpa5 = new Opa5();
			Opa5.extendConfig({frameWidth: 700, frameHeight: 400});

			oOpa5.iStartMyAppInAFrame({source: "../testdata/emptySite.html", height: 500}).done(function() {
				assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame", "Should not scale frame");
				assert.strictEqual(jQuery("#OpaFrame").css("width"), "700px", "Should have desired frame width");
				assert.strictEqual(jQuery("#OpaFrame").css("height"), "500px", "Should have desired frame height");
			});

			oOpa5.iTeardownMyAppFrame();
			oOpa5.emptyQueue().done(done);
		});

		QUnit.test("Should always load opaPlugin of the same OPA version running the test and not from the version running in the app (it might not have OPA available)", function(assert) {
			var done = assert.async();
			// System under Test
			var oOpa5 = new Opa5();
			var oPluginWithoutIFrame = Opa5.getPlugin();

			// Act
			oOpa5.iStartMyAppInAFrame("../testdata/noOPA.html").done(function() {
				// Act + Assert
				var oOpaPlugin = Opa5.getPlugin();

				assert.ok(oOpaPlugin, "could load Opa Plugin, even if not available in app");
				assert.notDeepEqual(oOpaPlugin, oPluginWithoutIFrame, "Opa Plugin should come from the IFrame now");

			});

			oOpa5.iTeardownMyAppFrame();

			oOpa5.emptyQueue().done(done);
		});

		QUnit.test("Should throw error if the iFrame throws an error", function (assert) {
			var done = assert.async();

			jQuery("body").append('<iframe id="OpaFrame" src="../testdata/uncaughtError.html"></iframe>');

			// browsers don't have a standard way of forming error message => ignore the prefix in error name (eg: IE: "TestUncaughtError"; Chrome: "Uncaught Error: TestUncaughtError")
			var $Frame = jQuery("#OpaFrame").on("load", function () {
				var fnOnErrorSpy = sinon.spy();
				$Frame[0].contentWindow.onerror = fnOnErrorSpy;

				var fnOriginalOnError = window.onerror;
				window.onerror = function (sErrorMsg, sUrl, iLine, iColumn, oError) {
					assert.ok(sErrorMsg.match(/Error in launched application iFrame:.* TestUncaughtError/));
					assert.ok(sErrorMsg.match("uncaughtError.html\nline: 33\ncolumn: [0-9]*"));
					if (oError) {
						assert.ok(sErrorMsg.match("\niFrame error:.* TestUncaughtError"), "Should include error object if browser supports it");
						assert.ok(sErrorMsg.match("onPress"), "Should contain iFrame stack trace");
					}
				};

				var oOpa5 = new Opa5();

				oOpa5.iStartMyAppInAFrame("../testdata/uncaughtError.html");

				oOpa5.waitFor({
					viewName: "myView",
					id: "myButton",
					// pressing the button will cause an uncaught error inside the iframe
					actions: new Press()
				});

				oOpa5.iTeardownMyAppFrame();

				oOpa5.emptyQueue().done(function () {
					sinon.assert.calledOnce(fnOnErrorSpy, "Should call iFrame onerror once");
					sinon.assert.calledWithMatch(fnOnErrorSpy, "TestUncaughtError");
					// restore window objects before test end
					window.onerror = fnOriginalOnError;
					done();
				});
			});
		});

		QUnit.module("IFrame navigation", {
			beforeEach: function () {
				this.oOpa5 = new Opa5();
				this.oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

				this.oOpa5.waitFor({
					success: function () {
						this.oHashChanger = Opa5.getHashChanger();
						this.oHashChanger.init();
					}.bind(this)
				});
			}
		});

		QUnit.test("Should be able to set and replace hashes in an IFrame", function(assert) {

			this.oOpa5.waitFor({
				success: function () {
					// Act + Assert
					assert.strictEqual(this.oHashChanger.getHash(), "", "the initial hash is empty");

					this.oHashChanger.setHash("buz");
					assert.strictEqual(this.oHashChanger.getHash(), "buz", "recorded one hash set");

					this.oHashChanger.replaceHash("baz");
					this.oHashChanger.replaceHash("foo");
					assert.strictEqual(this.oHashChanger.getHash(), "foo", "recorded two replacements");

					this.oHashChanger.setHash("bar");
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "recorded a setting after replacements");
				}.bind(this)
			});

			this.oOpa5.iTeardownMyAppFrame();

			return new Promise(function (fnResolve) {
				Opa5.emptyQueue().done(fnResolve);
			});

		});

		QUnit.test("Should be able to go back in an IFrame", function(assert) {
			// Arrange
			var bAssertionDone = false;

			// Act
			this.oOpa5.waitFor({
				success: function () {
					// Act + Assert
					this.oHashChanger.setHash("bar");

					this.oHashChanger.attachEventOnce("hashChanged", function () {
						assert.strictEqual(this.oHashChanger.getHash(), "", "went back in the history");
						bAssertionDone = true;
					}, this);

					Opa5.getWindow().history.back();
				}.bind(this)
			});

			this.oOpa5.waitFor({
				check: function () {
					return bAssertionDone;
				}
			});

			this.oOpa5.iTeardownMyAppFrame();

			return new Promise(function (fnResolve) {
				Opa5.emptyQueue().done(fnResolve);
			});

		});

		QUnit.test("Should be able to go newHash back sameNewHash in an IFrame", function(assert) {
			// Arrange
			var fnChangedSpy = sinon.spy(),
				bAssertionDone = false;

			// Act
			this.oOpa5.waitFor({
				success: function () {
					this.oHashChanger.setHash("foo");
					this.oHashChanger.setHash("baz");

					this.oHashChanger.attachEventOnce("hashChanged", function () {
						assert.strictEqual(this.oHashChanger.getHash(), "foo", "went back in the history");

						// test for a bug - baz back forward to baz didn't fire the changed event of hasher
						// this is problematic since the old hash cannot be determined, so it will not work for app to app navigation in the ushell
						Opa5.getWindow().hasher.changed.addOnce(fnChangedSpy);
						this.oHashChanger.setHash("baz");

						assert.strictEqual(fnChangedSpy.callCount, 1, "Dispatched the changed signal of hasher");
						assert.strictEqual(fnChangedSpy.getCall(0).args[0], "baz", "the new hash is baz");
						assert.strictEqual(fnChangedSpy.getCall(0).args[1], "foo", "the old hash is foo");
						bAssertionDone = true;
					}, this);

					Opa5.getWindow().history.go(-1);
				}.bind(this)
			});

			this.oOpa5.waitFor({
				check: function () {
					return bAssertionDone;
				}
			});

			this.oOpa5.iTeardownMyAppFrame();

			return new Promise(function (fnResolve) {
				Opa5.emptyQueue().done(fnResolve);
			});

		});

		QUnit.test("Should Navigate forwards in an IFrame", function(assert) {
			// Act
			this.oOpa5.waitFor({
				success: function () {
					// Act + Assert
					this.oHashChanger.setHash("buz");
					this.oHashChanger.setHash("foo");
					this.oHashChanger.replaceHash("baz");
					assert.strictEqual(this.oHashChanger.getHash(), "baz", "replaced to baz");
					Opa5.getWindow().history.go(-1);
					Opa5.getWindow().history.go(1);
					assert.strictEqual(this.oHashChanger.getHash(), "baz", "go(-1) and go(1) resulted in the same entry");

					this.oHashChanger.setHash("bar");
					Opa5.getWindow().history.back();
					Opa5.getWindow().history.forward();
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "back and forward resulted in the same entry");
				}.bind(this)
			});
			this.oOpa5.iTeardownMyAppFrame();

			return new Promise(function (fnResolve) {
				Opa5.emptyQueue().done(fnResolve);
			});
		});

		QUnit.module("IFrame navigation - with window.location", {
			beforeEach: function () {
				this.oOpa5 = new Opa5();
				this.oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

				this.oOpa5.waitFor({
					success: function () {
						this.oHashChanger = Opa5.getHashChanger();
						this.oHashChanger.init();
					}.bind(this)
				});
			}
		});

		function windowLocationTest (fnTestBody, assert) {
			var fnOpaDone = assert.async(),
				bHashChangeDone = false;

			// Act
			this.oOpa5.waitFor({
				success: function () {
					fnTestBody.call(this, function () {
						bHashChangeDone = true;
					});
				}.bind(this)
			});

			this.oOpa5.waitFor({
				check: function () {
					return bHashChangeDone;
				}
			});

			this.oOpa5.iTeardownMyAppFrame();

			Opa5.emptyQueue().done(fnOpaDone);
		}

		QUnit.test("Should react to hashChanges with no initial hash", function(assert) {
			windowLocationTest.call(this, function (fnHashChanged) {
				// Act + Assert
				this.oHashChanger.attachEventOnce("hashChanged", function () {
					setTimeout(function () {
						assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
						fnHashChanged();
					}.bind(this),100)
				}.bind(this));

				// trigger a hashchange without notifying hasher
				Opa5.getWindow().location.hash = "bar";
			}, assert);
		});

		QUnit.test("Should react to hashChanges with a set hash call", function(assert) {
			windowLocationTest.call(this, function (fnHashChanged) {
				// Act + Assert
				this.oHashChanger.setHash("foo");

				this.oHashChanger.attachEventOnce("hashChanged", function () {
					setTimeout(function () {
						assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
						fnHashChanged();
					}.bind(this),100)
				}.bind(this));

				// trigger a hashchange without notifying hasher
				Opa5.getWindow().location.hash = "bar";
			}, assert);
		});

		QUnit.test("Should react to hashChanges with a replace hash call", function(assert) {
			windowLocationTest.call(this, function (fnHashChanged) {
				// Act + Assert
				this.oHashChanger.replaceHash("foo");

				this.oHashChanger.attachEventOnce("hashChanged", function () {
					setTimeout(function () {
						assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
						fnHashChanged();
					}.bind(this),100)
				}.bind(this));

				// trigger a hashchange without notifying hasher
				Opa5.getWindow().location.hash = "bar";
			}, assert);
		});

		QUnit.test("Should react to hashChanges by window.location.hash = ''", function(assert) {
			windowLocationTest.call(this, function (fnHashChanged) {
				// Act + Assert
				this.oHashChanger.setHash("foo");
				this.oHashChanger.replaceHash("baz");

				this.oHashChanger.attachEventOnce("hashChanged", function () {
					setTimeout(function () {
						assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
						fnHashChanged();
					}.bind(this),100)
				}.bind(this));

				// trigger a hashchange without notifying hasher
				Opa5.getWindow().location.hash = "bar";
			}, assert);
		});

		QUnit.test("Should react to hashChanges by window.location.hash = '' combined with back and forward", function(assert) {
			windowLocationTest.call(this, function (fnHashChanged) {
				// Act + Assert
				this.oHashChanger.setHash("foo");
				this.oHashChanger.replaceHash("baz");
				this.oHashChanger.setHash("biz");
				Opa5.getWindow().history.go(-1);
				Opa5.getWindow().history.go(1);

				this.oHashChanger.attachEventOnce("hashChanged", function () {
					setTimeout(function () {
						assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
						Opa5.getWindow().history.go(-1);
						assert.strictEqual(this.oHashChanger.getHash(), "biz", "window.location.hash changed the hash");
						fnHashChanged();
					}.bind(this),100)
				}.bind(this));

				// trigger a hashchange without notifying hasher
				Opa5.getWindow().location.hash = "bar";
			}, assert);
		});

		QUnit.module("ControlType", {
			beforeEach: function () {
				this.oOpa5 = new Opa5();
				this.oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");
			},
			afterEach: function () {
			}
		});

		opaTest("Should wait for lazy stubs", function () {
			var fnVisibleStub = sinon.stub(Opa5.getWindow().sap.ui.test.matchers.Visible.prototype, "isMatching");
			fnVisibleStub.returns(true);

			this.oOpa5.waitFor({
				success: function () {
					setTimeout(function () {
						new (Opa5.getWindow().sap.ui.commons.Button)().placeAt("body");
					}, 1000);
				}
			});

			this.oOpa5.waitFor({
				controlType: "sap.ui.commons.Button",
				success: function (aButtons) {
					Opa5.assert.strictEqual(aButtons.length, 1, "Did find the button after a while");
					fnVisibleStub.restore();
				}
			});

			this.oOpa5.iTeardownMyAppFrame();
		});

		opaTest("Should get an array of controls that is an instance of array of the executing document", function () {
			this.oOpa5.waitFor({
				success: function () {
					new (Opa5.getWindow().sap.ui.commons.Button)().placeAt("body");
				}
			});

			this.oOpa5.waitFor({
				controlType: "sap.ui.commons.Button",
				success: function (aButtons) {
					Opa5.assert.ok(aButtons instanceof Array, "It is an array out the outer document");
				}
			});

			this.oOpa5.iTeardownMyAppFrame();
		});

		QUnit.module("Regexp ID in an IFrame", {
			beforeEach: function () {
				this.oOpa5 = new Opa5();
			},
			afterEach: function () {
			}
		});

		QUnit.test("Should not call success if a regex does not find controls", function (assert) {
			var fnSuccessSpy = sinon.spy(),
				fnErrorSpy = sinon.spy(),
				fnDone = assert.async();

			this.oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

			this.oOpa5.waitFor({
				id: /bar/,
				timeout: 1,
				success: fnSuccessSpy,
				error: fnErrorSpy
			});

			Opa5.emptyQueue().always(function () {
				sinon.assert.notCalled(fnSuccessSpy);
				sinon.assert.calledOnce(fnErrorSpy);

				this.oOpa5.iTeardownMyAppFrame();
				Opa5.emptyQueue().always(fnDone);
			}.bind(this));
		});

		var iTestIndex = 0;
		// In this module a site full of errors is launched and the error messages are checked
		// for each test, a full module of the tested site is loaded
		// test sequence here should correspond to the sequence of tests in the erronous site's test module
		QUnit.module("Tests with errors");

		function createMatcherForTestMessage (oOptions) {
			var bIncreased = false;
			return function () {
				// increase the test index once per matcher
				if (!bIncreased) {
					iTestIndex++;
					bIncreased = true;
				}
				var $Test = Opa5.getJQuery()("#qunit-tests").children(":nth-child(" + iTestIndex + ")");
				return $Test.hasClass(oOptions.passed ? "pass" : "fail") && $Test.find("li>.test-message");
			}
		}

		function startApp (oOpa, sUrl) {
			oOpa.iStartMyAppInAFrame(sUrl);
		}


		opaTest("Should empty the queue if QUnit times out", function (oOpa) {
			var qunitversion = parseInt(QUnit.version, 10) || 1;
			startApp(oOpa, "../testdata/failingOpaTest.html?sap-ui-qunitversion=" + qunitversion + "&sap-ui-qunittimeout=4000&module=Timeouts");

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					QUnit.assert.strictEqual($Messages.eq(0).text(), "Test timed out");
					var sOpaMessage = $Messages.eq(1).text();
					QUnit.assert.contains(sOpaMessage, /QUnit timeout after 4 seconds/);
					QUnit.assert.contains(sOpaMessage, /This is what Opa logged/);
					QUnit.assert.contains(sOpaMessage, /Executing OPA check function on controls null/);
					QUnit.assert.contains(sOpaMessage, /Check function is:/);
					QUnit.assert.contains(sOpaMessage, /Result of check function is: false/);
					QUnit.assert.contains(sOpaMessage, /Callstack:/);
					if (browser.supportsStacktraces()) {
						QUnit.assert.contains(sOpaMessage, /failingOpaTest/);
					}
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: true
				}),
				success: function ($Messages) {
					QUnit.assert.strictEqual($Messages.eq(0).text(), "Ok from test 2");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: true
				}),
				success: function ($Messages) {
					QUnit.assert.strictEqual($Messages.eq(0).text(), "Ok from test 3");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					QUnit.assert.strictEqual($Messages.eq(0).text(), "Test timed out");
					var sOpaMessage = $Messages.eq(1).text();
					QUnit.assert.contains(sOpaMessage, "QUnit timeout after 4 seconds");
					QUnit.assert.contains(sOpaMessage, "global ID 'myGlobalId'");
					QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					var sOpaMessage = $Messages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Opa timeout after 1 seconds");
					QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
					QUnit.assert.contains(sOpaMessage, "global ID 'myGlobalId'");
					QUnit.assert.contains(sOpaMessage, "Callstack:");
					QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					var sOpaMessage = $Messages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Opa timeout after 1 seconds");
					QUnit.assert.contains(sOpaMessage, "bad luck no button was found");
					QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
					QUnit.assert.contains(sOpaMessage, "global ID 'myGlobalId'");
					QUnit.assert.contains(sOpaMessage, "Callstack:");
					QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					var sOpaMessage = $Messages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Queue was stopped manually");
					QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
					QUnit.assert.contains(sOpaMessage, "Callstack:");
					QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
				}
			});

			oOpa.iTeardownMyApp();
		});

		opaTest("Should log exceptions in callbacks currectly", function (oOpa) {

			var qunitversion = parseInt(QUnit.version, 10) || 1;
			startApp(oOpa, "../testdata/failingOpaTest.html?sap-ui-qunitversion=" + qunitversion + "&sap-ui-qunittimeout=4000&module=Exceptions");

			function assertException ($Messages, sCallbackName) {
				var sOpaMessage = $Messages.eq(0).text();
				var sFailureReason = ["success", "actions"].indexOf(sCallbackName) > -1 ? "success" : "check";
				Opa5.assert.contains(sOpaMessage, "Failure in Opa " + sFailureReason + " function");
				Opa5.assert.contains(sOpaMessage, "Exception thrown by the testcode:");
				Opa5.assert.contains(sOpaMessage, "Doh! An exception in '" + sCallbackName + "'.");
			}

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					assertException($Messages, "check");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					assertException($Messages, "matchers");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					assertException($Messages, "actions");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					assertException($Messages, "success");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function ($Messages) {
					assertException($Messages, "success");
				}
			});

			oOpa.iTeardownMyApp();
		});

		opaTest("Should write log messages from an iFrame startup", function (oOpa) {
			var qunitversion = parseInt(QUnit.version, 10) || 1;
			startApp(oOpa, "../testdata/failingOpaTest.html?sap-ui-qunitversion=" + qunitversion + "&sap-ui-qunittimeout=90000&module=IFrame");

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function (aMessages) {
					var sOpaMessage = aMessages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Opa timeout after 1 seconds");
					QUnit.assert.contains(sOpaMessage, "0 out of 1 controls met the matchers pipeline requirements -  sap.ui.test.pipelines.MatcherPipeline");
					QUnit.assert.contains(sOpaMessage, "Matchers found no controls so check function will be skipped -  sap.ui.test.Opa5");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function (aMessages) {
					var sOpaMessage = aMessages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Opa timeout after 2 seconds");
					QUnit.assert.contains(sOpaMessage, "There are 0 open XHRs and 1 open FakeXHRs.");
					QUnit.assert.doesNotContain(sOpaMessage, "Should not happen");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					passed: false
				}),
				success: function (aMessages) {
					var sOpaMessage = aMessages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Opa timeout after 2 seconds");
					QUnit.assert.contains(sOpaMessage, "Control 'Element sap.m.Button#__xmlview0--myButton' is busy -  sap.ui.test.matchers.Interactable");
					QUnit.assert.contains(sOpaMessage, "0 out of 1 controls met the matchers pipeline requirements -  sap.ui.test.pipelines.MatcherPipeline");
					QUnit.assert.contains(sOpaMessage, "Matchers found no controls so check function will be skipped -  sap.ui.test.Opa5");
					QUnit.assert.doesNotContain(sOpaMessage, "Should not happen");
				}
			});

			oOpa.iTeardownMyApp();
		});
	}
);
