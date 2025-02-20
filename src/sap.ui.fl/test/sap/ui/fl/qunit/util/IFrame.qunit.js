/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/base/security/URLWhitelist",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Core",
	"sap/ui/fl/util/IFrame",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	URLWhitelist,
	XMLView,
	Core,
	IFrame,
	JSONModel,
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
		assert.strictEqual(
			oIFrame.getUrl(),
			sExpectedUrl,
			"then the url is properly updated" || sDescription
		);
	}

	QUnit.module("Basic properties", {
		beforeEach : function () {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle
			});
			this.oIFrame.placeAt("qunit-fixture");
		},
		afterEach : function () {
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
			checkUrl(assert, this.oIFrame, sOpenUI5Url);
		});

		QUnit.test("title", function (assert) {
			assert.equal(this.oIFrame.getTitle(), sTitle, "Title is correct using 'equals()'!");
		});

		QUnit.test("when trying to set the url to an invalid value", function(assert) {
			this.oIFrame.setUrl("javascript:someJs"); // eslint-disable-line no-script-url
			checkUrl(assert, this.oIFrame, sOpenUI5Url, "then the value is rejected");
		});

		QUnit.test("when changing a navigation parameter only", function(assert) {
			var sNewUrl = sOpenUI5Url + "#someNavParameter";
			var oReplaceLocationSpy = sandbox.spy(this.oIFrame, "_replaceIframeLocation");
			this.oIFrame.setUrl(sNewUrl);
			var sTestUrlRegex = new RegExp(sOpenUI5Url + "\\?sap-ui-xx-fl-forceEmbeddedContentRefresh=([\\d-]+)#someNavParameter");
			assert.ok(
				sTestUrlRegex.test(this.oIFrame.getUrl()),
				"then the url is properly updated"
			);
			var sFrameRefreshSearchParameter = sTestUrlRegex.exec(this.oIFrame.getUrl())[1];
			Core.applyChanges();
			assert.strictEqual(oReplaceLocationSpy.callCount, 1, "then the iframe location is properly replaced");
			assert.ok(
				sTestUrlRegex.test(oReplaceLocationSpy.lastCall.args[0]),
				"then the proper url is loaded and a frame refresh search parameter is added"
			);

			// Change the navigation parameter again
			this.oIFrame.setUrl(sOpenUI5Url + "#someNavParameter,someOtherNavParameter");
			assert.ok(
				sTestUrlRegex.test(this.oIFrame.getUrl()),
				"then the url still contains a frame refresh search parameter"
			);
			var sNewFrameRefreshSearchParameter = sTestUrlRegex.exec(this.oIFrame.getUrl())[1];
			assert.notStrictEqual(
				sFrameRefreshSearchParameter,
				sNewFrameRefreshSearchParameter,
				"then the frame refresh search parameter is updated"
			);
		});

		QUnit.test("when the iframe parent changes resulting in the re-creation of the contentWindow", function(assert) {
			Core.applyChanges();
			var oReplaceLocationSpy = sandbox.spy(this.oIFrame, "_replaceIframeLocation");

			// Move the iframe to a new parent
			var oNewDiv = document.createElement("div");
			document.getElementById("qunit-fixture").appendChild(oNewDiv);
			oNewDiv.appendChild(this.oIFrame.getDomRef());
			Core.applyChanges();

			assert.strictEqual(
				oReplaceLocationSpy.lastCall.args[0],
				sOpenUI5Url,
				"then the iframe retains its url"
			);
			assert.strictEqual(
				oReplaceLocationSpy.callCount,
				1,
				"then the iframe location is only set again once"
			);
		});
	});

	QUnit.module("Visibility property set to false", {
		beforeEach : function() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				visible: false
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
		}
	}, function () {
		QUnit.test("IFrame should not be rendered", function (assert) {
			var $iframe = jQuery("#qunit-fixture iframe");
			assert.strictEqual($iframe.length, 0, "No iframe is being rendered");
		});
	});

	QUnit.module("Title Parameter of IFrame is set", {
		beforeEach : function() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
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
		beforeEach : function() {
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
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
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
			checkUrl(assert, this.oIFrame, sOpenUI5Url);
		});

		QUnit.test("getFocusDomRef", function (assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var $iframe = jQuery("#qunit-fixture iframe");
			assert.strictEqual($iframe[0], oFocusDomRef, "Returns the iframe DOM element");
		});

		QUnit.test("URL should refresh if bound to a changing model without rewriting the iframe", function(assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var sSapUI5Url = sProtocol + "://sapui5." + sServer + "/";
			var oReplaceLocationSpy = sandbox.spy(this.oIFrame, "_replaceIframeLocation");
			this.oModel.setProperty("/flavor", "sapui5");

			checkUrl(assert, this.oIFrame, sSapUI5Url);
			Core.applyChanges();
			assert.strictEqual(this.oIFrame.getFocusDomRef(), oFocusDomRef, "iframe DOM reference did not change");
			assert.strictEqual(
				oReplaceLocationSpy.lastCall.args[0],
				sSapUI5Url,
				"iframe src has changed to the expected one"
			);
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
					return {
						getUser: function () {
							return {
								getEmail: function () { return vUserEmail; },
								getFullName: function () { return sUserFullName; },
								getFirstName: function () { return sUserFirstName; },
								getLastName: function () { return sUserLastName; }
							};
						}
					};
				}
			};
		} else {
			fnGetService = function () {
				return null;
			};
		}
		sap.ushell = {
			Container: {
				getService: fnGetService
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
		beforeEach : function() {
			this.oUShellMock = mockUserInfoService(true);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should contain user information", function(assert) {
			checkUrl(assert, this.oIFrame, sOpenUI5Url + "?domain=sap.com");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service available but no email)", {
		beforeEach : function() {
			this.oUShellMock = mockUserInfoService(true, /*bNoEmail*/ true);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should contain user information", function(assert) {
			checkUrl(assert, this.oIFrame, sOpenUI5Url + "?domain=");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service not available)", {
		beforeEach : function() {
			this.oUShellMock = mockUserInfoService(false);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should not contain user information", function(assert) {
			checkUrl(assert, this.oIFrame, sOpenUI5Url + "?domain=");
		});
	});

	QUnit.module("URL binding in XML view", {
		beforeEach : function (assert) {
			var done = assert.async();
			this.oUShellMock = mockUserInfoService(true);
			XMLView.create({
				definition: '<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.fl.util">' +
					'<IFrame id="iframe1" url="' + sOpenUI5Url + '" />' +
					'<IFrame id="iframe2" url="' + sOpenUI5Url + '?fullName={$user>/fullName}" />' +
					'<IFrame id="iframe3" url="' + sOpenUI5Url + '?domain={$user>/domain}&amp;{anyModel>/anyProperty}" />' +
					'<IFrame id="iframe4" url="{= \'' + sOpenUI5Url + '?domain=\' + ${$user>/domain} }" />' +
					'<IFrame id="iframe5" url="{= \'' + sOpenUI5Url + '?domain=\' + (${$user>/domain}.indexOf(\'sap.com\') !== -1 ? \'SAP\' : \'EXTERNAL\') }" />' +
				'</mvc:View>'
			}).then(function (oView) {
				this.myView = oView;
				this.myView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach : function () {
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
			checkUrl(assert, iFrame, sEncodedUrl, "then it is not encoded again");
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

	QUnit.module("URL validation", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when providing a valid url", function(assert) {
			assert.ok(IFrame.isValidUrl("https://example.com"));
			assert.ok(IFrame.isValidUrl("someRelativeUrl.html"));
		});

		QUnit.test("when providing an invalid url", function(assert) {
			assert.notOk(IFrame.isValidUrl("https://example."));
		});

		QUnit.test("when embedding the javascript pseudo protocol", function(assert) {
			assert.notOk(IFrame.isValidUrl("javascript:someJs")); // eslint-disable-line no-script-url
		});

		QUnit.test("when embedding a protocol that is blocked by the URLWhitelist", function(assert) {
			assert.notOk(IFrame.isValidUrl("about:blank"));
		});

		QUnit.test("when allowing the javascript pseudo protocol", function(assert) {
			URLWhitelist.add("javascript");
			assert.notOk(IFrame.isValidUrl("javascript:someJs")); // eslint-disable-line no-script-url
			URLWhitelist.clear();
		});

		QUnit.test("when allowing a non-critical protocol", function(assert) {
			URLWhitelist.add("about");
			assert.ok(IFrame.isValidUrl("about:blank"));
			URLWhitelist.clear();
		});

		QUnit.test("when embedding http content from a https document", function(assert) {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "https:",
				href: "https://example.com"
			});
			assert.notOk(IFrame.isValidUrl("http://example.com"));
		});

		QUnit.test("when embedding https content from a https document", function(assert) {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "https:",
				href: "https://example.com"
			});
			assert.ok(IFrame.isValidUrl("https://example.com"));
		});

		QUnit.test("when embedding http content from a http document", function(assert) {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "http:",
				href: "http://example.com"
			});
			assert.ok(IFrame.isValidUrl("http://example.com"));
		});

		QUnit.test("when embedding https content from a http document", function(assert) {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "http:",
				href: "http://example.com"
			});
			assert.ok(IFrame.isValidUrl("https://example.com"));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
