sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit"
	], function (Opa5, opaTest) {
		QUnit.module("IFrame getters");

		QUnit.test("Should get the QUnit utils in an IFrame", function(assert) {
			// Arrange
			var done = assert.async(),
				oOpa5 = new Opa5();

			assert.strictEqual(Opa5.getUtils(), null, "Initially null is returned");

			// Act
			oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");
			oOpa5.waitFor({
				success: function () {
					assert.ok(Opa5.getUtils, "IFrame utils are available");
				}
			});
			oOpa5.iTeardownMyAppFrame();
			oOpa5.waitFor({
				success: function () {
					assert.strictEqual(Opa5.getUtils(), null, "After tearing everything down null is returned again");
				}
			});

			Opa5.emptyQueue().done(done);
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

		// For IE 9 errors in frame are disabled see comment in OPA5.js
		if (!(sap.ui.Device.browser.msie && sap.ui.Device.browser.version === 9)) {
			QUnit.asyncTest("Should throw error if the IFrame throws an error", function (assert) {
				// Arrange
				jQuery("body").append('<iframe id="OpaFrame" src="../testdata/emptySite.html"></iframe>');
				var $Frame = jQuery("#OpaFrame").on("load", function () {
					var fnSpy = sinon.spy();
					$Frame[0].contentWindow.onerror = fnSpy;

					// System under Test
					var oOpa5 = new Opa5();

					oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html").done(function() {
						// Act + Assert
						assert.throws(function () {
							Opa5.getWindow().onerror("Errormessage", "Url", 31);
						},"OpaFrame error message: Errormessage url: Url line: 31" , "Did throw an error");

						assert.strictEqual(fnSpy.callCount, 1, "Did call the app onerror");
					});

					oOpa5.iTeardownMyAppFrame();

					oOpa5.emptyQueue().done(function () {
						QUnit.start();
					});
				});

			});
		}

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

		QUnit.test("Should be able to set and replace hashes in an IFrame", function() {

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


		QUnit.module("ControlType", {
			beforeEach: function () {
				this.oOpa5 = new Opa5();
				this.oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");
			},
			afterEach: function () {
			}
		});

		opaTest("Should wait for lazy stubs", function () {
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
				fnDoneTesting = assert.async(),
				fnIFrameTeardown = assert.async();

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
				fnDoneTesting();
			});

			this.oOpa5.iTeardownMyAppFrame();

			 Opa5.emptyQueue().always(fnIFrameTeardown);
		});

		QUnit.module("Tests that timeout");

		opaTest("Should empty the queue if QUnit times out", function (oOpa) {
			function createMatcherForTestMessage (oOptions) {
				return function () {
					var $Test = Opa5.getJQuery()("#qunit-tests").children(":nth-child(" + oOptions.testIndex + ")");
					return $Test.hasClass(oOptions.passed ? "pass" : "fail") && $Test.find(".test-message");
				}
			}

			oOpa.iStartMyAppInAFrame("../testdata/failingOpaTest.html?sap-ui-qunittimeout=2000");

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					testIndex: 1,
					passed: false
				}),
				success: function (aMessages) {
					QUnit.assert.strictEqual(aMessages.eq(0).text(), "Test timed out");
					var sOpaMessage = aMessages.eq(1).text();
					QUnit.assert.contains(sOpaMessage, /QUnit timeout/);
					QUnit.assert.contains(sOpaMessage, /This is what Opa logged/);
					QUnit.assert.contains(sOpaMessage, /Opa is executing the check:/);
					QUnit.assert.contains(sOpaMessage, /Opa check was false/);
					QUnit.assert.contains(sOpaMessage, /Callstack:/);
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					testIndex: 2,
					passed: true
				}),
				success: function (aMessages) {
					QUnit.assert.strictEqual(aMessages.eq(0).text(), "Ok from test 2");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					testIndex: 3,
					passed: true
				}),
				success: function (aMessages) {
					QUnit.assert.strictEqual(aMessages.eq(0).text(), "Ok from test 3");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					testIndex: 4,
					passed: false
				}),
				success: function (aMessages) {
					QUnit.assert.strictEqual(aMessages.eq(0).text(), "Test timed out");
					var sOpaMessage = aMessages.eq(1).text();
					QUnit.assert.contains(sOpaMessage, "global id: 'myGlobalId'");
					QUnit.assert.doesNotContain(sOpaMessage,"Log message that should not appear in the error");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					testIndex: 5,
					passed: false
				}),
				success: function (aMessages) {
					var sOpaMessage = aMessages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Opa timeout");
					QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
					QUnit.assert.contains(sOpaMessage, "global id: 'myGlobalId'");
					QUnit.assert.contains(sOpaMessage, "Callstack:");
					QUnit.assert.doesNotContain(sOpaMessage,"Log message that should not appear in the error");
				}
			});

			oOpa.waitFor({
				matchers: createMatcherForTestMessage({
					testIndex: 6,
					passed: false
				}),
				success: function (aMessages) {
					var sOpaMessage = aMessages.eq(0).text();
					QUnit.assert.contains(sOpaMessage, "Queue was stopped manually");
					QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
					QUnit.assert.contains(sOpaMessage, "Callstack:");
					QUnit.assert.doesNotContain(sOpaMessage,"Log message that should not appear in the error");
				}
			});

			oOpa.iTeardownMyApp();
		});
	}
);
