/*global QUnit */

sap.ui.define([
	"sap/ui/fl/util/IFrame",
	"sap/base/security/URLListValidator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	IFrame,
	URLListValidator,
	JSONModel,
	Core,
	XMLView,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var sTitle = "IFrame Title";
	var sProtocol = "https";
	var sFlavor = "openui5";
	var sServer = "hana.ondemand.com";
	var sOpenUI5Url = sProtocol + "://" + sFlavor + "." + sServer + "/";
	var sDefaultSize = "500px";
	var sUserFirstName = "John";
	var sUserLastName = "Doe";
	var sUserFullName = sUserFirstName + " " + sUserLastName;
	var sUserEmail = (sUserFirstName + "." + sUserLastName).toLowerCase() + "@sap.com";

	function checkUrl(assert, oIFrame, sExpectedUrl, sDescription) {
		return (oIFrame._oSetUrlPromise || Promise.resolve())
			.then(function() {
				assert.strictEqual(
					oIFrame.getUrl(),
					sExpectedUrl,
					"then the url is properly updated" || sDescription
				);
			});
	}

	QUnit.module("Basic properties", {
		beforeEach: function () {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle
			});
			return this.oIFrame._oSetUrlPromise;
		},
		afterEach: function () {
			this.oIFrame.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("width", function (assert) {
			assert.equal(this.oIFrame.getWidth(), sDefaultSize, "Width is correct using 'equals()'!");
		});

		QUnit.test("height", function (assert) {
			assert.equal(this.oIFrame.getHeight(), sDefaultSize, "Height is correct using 'equals()'!");
		});

		QUnit.test("url", function (assert) {
			return checkUrl(assert, this.oIFrame, sOpenUI5Url);
		});

		QUnit.test("title", function (assert) {
			assert.equal(this.oIFrame.getTitle(), sTitle, "Title is correct using 'equals()'!");
		});

		QUnit.test("when trying to set the url to an invalid value", function(assert) {
			// eslint-disable-next-line no-script-url
			this.oIFrame.setUrl("javascript:someJs");
			return checkUrl(assert, this.oIFrame, sOpenUI5Url, "then the value is rejected");
		});

		QUnit.test("when changing a navigation parameter", function(assert) {
			var oSetUrlSpy = sandbox.spy(this.oIFrame, "setProperty").withArgs("url");
			var sNewUrl = sOpenUI5Url + "#someNavParameter";
			this.oIFrame.setUrl(sNewUrl);
			return checkUrl(assert, this.oIFrame, sNewUrl)
				.then(function() {
					assert.strictEqual(oSetUrlSpy.callCount, 2);
					assert.strictEqual(
						oSetUrlSpy.firstCall.args[1],
						"",
						"then the iframe is unloaded"
					);
				});
		});
	});

	QUnit.module("Visibility property set to false", {
		beforeEach: function() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				visible: false
			});
			this.oIFrame.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oIFrame.destroy();
		}
	}, function () {
		QUnit.test("IFrame should not be rendered", function (assert) {
			var $iframe = jQuery("#qunit-fixture iframe");
			assert.strictEqual($iframe.length, 0, "No iframe is being rendered");
		});
	});

	QUnit.module("Title Parameter of IFrame is set", {
		beforeEach: function() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle
			});
			this.oIFrame.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oIFrame.destroy();
		}
	}, function () {
		QUnit.test("Title is rendered", function (assert) {
			var $iframe = jQuery("#qunit-fixture iframe");
			var sFrameTitle = $iframe.get()[0].getAttribute("title");
			assert.strictEqual(sFrameTitle, sTitle, "Title is being rendered correct");
		});
	});

	QUnit.module("Bindings", {
		beforeEach: function() {
			this.oIFrame = new IFrame({
				width: "{model>/width}",
				height: "{model>/height}",
				url: "{model>/protocol}://{model>/flavor}.{model>/server}/"
			});
			this.oModel = new JSONModel({
				width: sDefaultSize,
				height: sDefaultSize,
				protocol: sProtocol,
				flavor: "openui5",
				server: sServer
			});
			this.oIFrame.setModel(this.oModel, "model");
			this.oIFrame.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oIFrame.destroy();
			this.oModel.destroy();
		}
	}, function () {
		QUnit.test("width", function (assert) {
			assert.equal(this.oIFrame.getWidth(), sDefaultSize, "Width is correct using 'equals()'!");
		});

		QUnit.test("height", function (assert) {
			assert.equal(this.oIFrame.getHeight(), sDefaultSize, "Height is correct using 'equals()'!");
		});

		QUnit.test("url", function (assert) {
			return checkUrl(assert, this.oIFrame, sOpenUI5Url);
		});

		QUnit.test("getFocusDomRef", function (assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var $iframe = jQuery("#qunit-fixture iframe");
			assert.strictEqual($iframe[0], oFocusDomRef, "Returns the iframe DOM element");
		});

		QUnit.test("URL should refresh if bound to a changing model without rewriting the iframe", function(assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var sSapUI5Url = sProtocol + "://sapui5." + sServer + "/";

			this.oModel.setProperty("/flavor", "sapui5");

			return checkUrl(assert, this.oIFrame, sSapUI5Url)
				.then(function() {
					Core.applyChanges();
					assert.strictEqual(this.oIFrame.getFocusDomRef(), oFocusDomRef, "iframe DOM reference did not change");
					assert.strictEqual(oFocusDomRef.getAttribute("src"), sSapUI5Url, "iframe src has changed to the expected one");
				}.bind(this));
		});
	});

	function mockUserInfoService (bEnabled, bNoEmail) {
		var oFormerUShell = sap.ushell;
		var fnGetService;
		if (bEnabled) {
			var vUserEmail;
			if (!bNoEmail) {
				vUserEmail = sUserEmail;
			}
			fnGetService = function (sServiceName) {
				if (sServiceName === "UserInfo") {
					return Promise.resolve({
						getUser: function () {
							return {
								getEmail: function () { return vUserEmail; },
								getFullName: function () { return sUserFullName; },
								getFirstName: function () { return sUserFirstName; },
								getLastName: function () { return sUserLastName; }
							};
						}
					});
				}
				return Promise.resolve();
			};
		} else {
			fnGetService = function () {
				return Promise.resolve();
			};
		}
		sap.ushell = {
			Container: {
				getServiceAsync: fnGetService
			}
		};
		return {
			restore: function () {
				if (oFormerUShell) {
					sap.ushell = oFormerUShell;
				} else {
					delete sap.ushell;
				}
			}
		};
	}

	QUnit.module("UserInfo binding (UserInfo service available)", {
		beforeEach: function() {
			this.oUShellMock = mockUserInfoService(true);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			Core.applyChanges();
			return this.oIFrame.waitForInit();
		},
		afterEach: function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), sOpenUI5Url + "?domain=sap.com", "URL is the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service available but no email)", {
		beforeEach: function() {
			this.oUShellMock = mockUserInfoService(true, /*bNoEmail*/ true);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			Core.applyChanges();
			return this.oIFrame.waitForInit();
		},
		afterEach: function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), sOpenUI5Url + "?domain=", "URL is the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service not available)", {
		beforeEach: function() {
			this.oUShellMock = mockUserInfoService(false);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			Core.applyChanges();
			return this.oIFrame.waitForInit();
		},
		afterEach: function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should not contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), sOpenUI5Url + "?domain=", "URL is the expected one");
		});
	});

	QUnit.module("URL binding in XML view", {
		beforeEach: function () {
			this.oUShellMock = mockUserInfoService(true);
			return XMLView.create({
				definition: '<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.fl.util">' +
					'<IFrame id="iframe1" url="' + sOpenUI5Url + '" />' +
					'<IFrame id="iframe2" url="' + sOpenUI5Url + '?fullName={$user>/fullName}" />' +
					'<IFrame id="iframe3" url="' + sOpenUI5Url + '?domain={$user>/domain}&amp;{anyModel>/anyProperty}" />' +
					'<IFrame id="iframe4" url="{= \'' + sOpenUI5Url + '?domain=\' + ${$user>/domain} }" />' +
					'<IFrame id="iframe5" url="{= \'' + sOpenUI5Url + '?domain=\' + (${$user>/domain}.indexOf(\'sap.com\') !== -1 ? \'SAP\' : \'EXTERNAL\') }" />' +
				'</mvc:View>'
			}).then(function (oView) {
				this.myView = oView;
				var iFrame = this.myView.byId("iframe1");
				this.myView.placeAt("qunit-fixture");
				Core.applyChanges();
				return iFrame.waitForInit();
			}.bind(this));
		},
		afterEach: function () {
			this.myView.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("Non bound URL should be kept as is", function(assert) {
			var iFrame = this.myView.byId("iframe1");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url, "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url, "Settings' URL is correct");
		});
		QUnit.test("Simple binding URL should be reverted back to binding in settings", function(assert) {
			var iFrame = this.myView.byId("iframe2");
			var sExpectedUrl = encodeURI(sOpenUI5Url + "?fullName=" + sUserFullName);
			assert.strictEqual(
				iFrame.getUrl(),
				sExpectedUrl,
				"Displayed URL is correct and parameters are properly encoded"
			);
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?fullName={$user>/fullName}", "Settings' URL is correct");
		});
		QUnit.test("when a passed  url is already encoded", function(assert) {
			var iFrame = this.myView.byId("iframe2");
			var sEncodedUrl = encodeURI(sOpenUI5Url + "?someParameter=" + sUserFullName);
			iFrame.setUrl(sEncodedUrl);
			return checkUrl(assert, iFrame, sEncodedUrl, "then it is not encoded again");
		});
		QUnit.test("Simple binding URL (with unexpected reference) should be reverted back to binding in settings", function(assert) {
			var iFrame = this.myView.byId("iframe3");
			assert.strictEqual(iFrame.getUrl(), "", "Displayed URL is empty since the binding can't be resolved");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain={$user>/domain}&{anyModel>/anyProperty}", "Settings' URL is correct");
		});
		QUnit.test("Complex binding URL is 'converted' to simple binding ('simple' use case)", function(assert) {
			var iFrame = this.myView.byId("iframe4");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url + "?domain=sap.com", "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain={$user>/domain}", "Settings' URL is correct");
		});
		QUnit.test("Complex binding URL is 'converted' to simple binding ('advanced' use case)", function(assert) {
			var iFrame = this.myView.byId("iframe5");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url + "?domain=SAP", "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain=EXTERNAL", "Settings' URL looks corrupted");
		});
	});

	QUnit.module("URL validation", function() {
		QUnit.test("when providing a valid url", function(assert) {
			assert.ok(IFrame.isValidUrl("https://example.com"));
			assert.ok(IFrame.isValidUrl("someRelativeUrl.html"));
		});

		QUnit.test("when providing an invalid url", function(assert) {
			assert.notOk(IFrame.isValidUrl("https://example."));
		});

		QUnit.test("when using a pseudo protocol", function(assert) {
			assert.notOk(IFrame.isValidUrl("about:blank"));
			// eslint-disable-next-line no-script-url
			assert.notOk(IFrame.isValidUrl("javascript:someJs"));
		});

		QUnit.test("when allowing the javascript pseudo protocol", function(assert) {
			URLListValidator.add("javascript");
			// eslint-disable-next-line no-script-url
			assert.notOk(IFrame.isValidUrl("javascript:someJs"));
			URLListValidator.clear();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
