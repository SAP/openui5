/* global QUnit */

sap.ui.define([
	"sap/ui/fl/util/IFrame",
	"sap/ui/fl/Utils",
	"sap/base/security/URLListValidator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	IFrame,
	Utils,
	URLListValidator,
	JSONModel,
	XMLView,
	nextUIUpdate,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const sTitle = "IFrame Title";
	const sProtocol = "https";
	const sOpenUI5Url = `${sProtocol}://openui5/`;
	const sDefaultSize = "500px";
	const sUserFirstName = "John";
	const sUserLastName = "Doe";
	const sUserFullName = `${sUserFirstName} ${sUserLastName}`;
	const sUserEmail = `${(`${sUserFirstName}.${sUserLastName}`).toLowerCase()}@sap.com`;

	function checkUrl(assert, oIFrame, sExpectedUrl, sDescription) {
		return (oIFrame._oSetUrlPromise || Promise.resolve())
		.then(function() {
			assert.strictEqual(
				oIFrame.getUrl(),
				sExpectedUrl,
				sDescription || "then the url is properly updated"
			);
		});
	}

	QUnit.module("Basic properties", {
		beforeEach() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				useLegacyNavigation: false,
				title: sTitle
			});
			this.oIFrame.placeAt("qunit-fixture");
		},
		afterEach() {
			this.oIFrame.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when trying to set the url to an invalid value", function(assert) {
			// eslint-disable-next-line no-script-url
			this.oIFrame.setUrl("javascript:someJs");
			return checkUrl(assert, this.oIFrame, sOpenUI5Url, "then the value is rejected");
		});

		QUnit.test("when changing a navigation parameter", async function(assert) {
			var sNewUrl = `${sOpenUI5Url}#someNavParameter`;
			const oReplaceLocationSpy = sandbox.spy(this.oIFrame, "_replaceIframeLocation");
			this.oIFrame.setUrl(sNewUrl);
			await checkUrl(assert, this.oIFrame, sNewUrl);
			await nextUIUpdate();
			assert.strictEqual(oReplaceLocationSpy.callCount, 2, "then the iframe location is properly replaced");
			assert.strictEqual(
				oReplaceLocationSpy.firstCall.args[0],
				"about:blank",
				"then the iframe is unloaded"
			);
			assert.strictEqual(
				oReplaceLocationSpy.lastCall.args[0],
				sNewUrl,
				"then the proper url is loaded"
			);
		});

		QUnit.test("when changing a navigation parameter (legacy)", async function(assert) {
			const oSetUrlSpy = sandbox.spy(this.oIFrame, "setProperty").withArgs("url");
			const sNewUrl = `${sOpenUI5Url}#someNavParameter`;
			this.oIFrame.setUseLegacyNavigation(true);
			this.oIFrame.setUrl(sNewUrl);
			await checkUrl(assert, this.oIFrame, sNewUrl);
			await nextUIUpdate();
			assert.strictEqual(oSetUrlSpy.callCount, 2);
			assert.strictEqual(
				oSetUrlSpy.firstCall.args[1],
				"",
				"then the iframe is unloaded"
			);
		});

		QUnit.test("when useLegacyNavigation is not set (legacy changes)", async function(assert) {
			const oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle
			});
			oIFrame.placeAt("qunit-fixture");
			const sNewUrl = `${sOpenUI5Url}someNewPath`;
			const oReplaceLocationSpy = sandbox.spy(oIFrame, "_replaceIframeLocation");
			oIFrame.setUrl(sNewUrl);
			await checkUrl(assert, oIFrame, sNewUrl);
			await nextUIUpdate();
			assert.strictEqual(
				oReplaceLocationSpy.callCount,
				2,
				"then the new useLegacyNavigation approach is chosen by default and the iframe location is properly replaced"
			);
			assert.strictEqual(
				oReplaceLocationSpy.lastCall.args[0],
				sNewUrl,
				"then the iframe is navigated to the proper url"
			);
			assert.strictEqual(
				oIFrame.getDomRef().getAttribute("src"),
				"about:blank",
				"then the src attribute is never touched"
			);
			oIFrame.destroy();
		});
	});

	QUnit.module("Visibility property set to false", {
		async beforeEach() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				visible: false
			});
			this.oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach() {
			this.oIFrame.destroy();
		}
	}, function() {
		QUnit.test("IFrame should not be rendered", function(assert) {
			var oFixtureDom = document.getElementById("qunit-fixture");
			assert.strictEqual(!!oFixtureDom.querySelector("iframe"), false, "No iframe is being rendered");
		});
	});

	QUnit.module("UseLegacyNavigation handling", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when creating a fresh Iframe with useLegacyNavigation set to false", async function(assert) {
			// This test ensures that props are set in the correct order, i.e. first applying the useLegacyNavigation
			// setting and then applying the url setting which depends on it
			const oLegacyNavigationSpy = sandbox.spy(IFrame.prototype, "_setUrlLegacy");
			const oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle,
				useLegacyNavigation: true
			});
			oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
			assert.ok(oLegacyNavigationSpy.called, "then the legacy approach is used to set the initial url");
			oIFrame.destroy();
		});
	});

	QUnit.module("Title Parameter of IFrame is set", {
		async beforeEach() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				title: sTitle
			});
			this.oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach() {
			this.oIFrame.destroy();
		}
	}, function() {
		QUnit.test("Title is rendered", function(assert) {
			var oFixtureDom = document.getElementById("qunit-fixture");
			var oIframe = oFixtureDom.querySelector("iframe");
			var sFrameTitle = oIframe.getAttribute("title");
			assert.strictEqual(sFrameTitle, sTitle, "Title is being rendered correct");
		});
	});

	QUnit.module("Bindings", {
		async beforeEach() {
			this.oIFrame = new IFrame({
				width: "{model>/width}",
				height: "{model>/height}",
				url: "{model>/protocol}://{model>/flavor}/"
			});
			this.oModel = new JSONModel({
				width: sDefaultSize,
				height: sDefaultSize,
				protocol: sProtocol,
				flavor: "openui5"
			});
			this.oIFrame.setModel(this.oModel, "model");
			this.oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach() {
			this.oIFrame.destroy();
			this.oModel.destroy();
		}
	}, function() {
		QUnit.test("getFocusDomRef", function(assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var oFixtureDom = document.getElementById("qunit-fixture");
			var oIframe = oFixtureDom.querySelector("iframe");
			assert.strictEqual(oIframe, oFocusDomRef, "Returns the iframe DOM element");
		});

		QUnit.test("URL should refresh if bound to a changing model without rewriting the iframe", async function(assert) {
			const oFocusDomRef = this.oIFrame.getFocusDomRef();
			const sSapUI5Url = `${sProtocol}://sapui5/`;
			const oReplaceLocationSpy = sandbox.spy(this.oIFrame, "_replaceIframeLocation");
			this.oModel.setProperty("/flavor", "sapui5");

			await checkUrl(assert, this.oIFrame, sSapUI5Url);
			await nextUIUpdate();
			assert.strictEqual(this.oIFrame.getFocusDomRef(), oFocusDomRef, "iframe DOM reference did not change");
			assert.strictEqual(
				oReplaceLocationSpy.lastCall.args[0],
				sSapUI5Url,
				"iframe src has changed to the expected one"
			);
		});

		QUnit.test("URL should refresh if bound to a changing model without rewriting the iframe (legacy)", async function(assert) {
			const oFocusDomRef = this.oIFrame.getFocusDomRef();
			const sSapUI5Url = `${sProtocol}://sapui5/`;
			this.oIFrame.setUseLegacyNavigation(true);
			this.oModel.setProperty("/flavor", "sapui5");

			await checkUrl(assert, this.oIFrame, sSapUI5Url);
			await nextUIUpdate();
			assert.strictEqual(this.oIFrame.getFocusDomRef(), oFocusDomRef, "iframe DOM reference did not change");
			assert.strictEqual(oFocusDomRef.getAttribute("src"), sSapUI5Url, "iframe src has changed to the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service available)", {
		async beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			stubGetUShellService(sUserEmail, sUserFullName, sUserFirstName, sUserLastName);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: `${sOpenUI5Url}?domain={$user>/domain}`
			});
			this.oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
			await this.oIFrame.waitForInit();
		},
		afterEach() {
			this.oIFrame.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("URL should contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), `${sOpenUI5Url}?domain=sap.com`, "URL is the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service available but no email)", {
		async beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			stubGetUShellService(undefined, sUserFullName, sUserFirstName, sUserLastName);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: `${sOpenUI5Url}?domain={$user>/domain}`
			});
			this.oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
			await this.oIFrame.waitForInit();
		},
		afterEach() {
			this.oIFrame.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("URL should contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), `${sOpenUI5Url}?domain=`, "URL is the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service not available)", {
		async beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(false);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: `${sOpenUI5Url}?domain={$user>/domain}`
			});
			this.oIFrame.placeAt("qunit-fixture");
			await nextUIUpdate();
			await this.oIFrame.waitForInit();
		},
		afterEach() {
			this.oIFrame.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("URL should not contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), `${sOpenUI5Url}?domain=`, "URL is the expected one");
		});
	});

	QUnit.module("URL binding in XML view", {
		async beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			stubGetUShellService(sUserEmail, sUserFullName, sUserFirstName, sUserLastName);
			this.myView = await XMLView.create({
				definition: `<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.fl.util">` +
					`<IFrame id="iframe1" url="${sOpenUI5Url}" />` +
					`<IFrame id="iframe2" url="${sOpenUI5Url}?fullName={$user>/fullName}" />` +
					`<IFrame id="iframe3" url="${sOpenUI5Url}?domain={$user>/domain}&amp;{anyModel>/anyProperty}" />` +
					`<IFrame id="iframe4" url="{= '${sOpenUI5Url}?domain=' + \${$user>/domain} }" />` +
					`<IFrame id="iframe5" url="{= '${sOpenUI5Url}?domain=' + (\${$user>/domain}.indexOf('sap.com') !== -1 ? 'SAP' : 'EXTERNAL') }" />` +
				`</mvc:View>`
			});
			var iFrame = this.myView.byId("iframe1");
			this.myView.placeAt("qunit-fixture");
			await nextUIUpdate();
			await iFrame.waitForInit();
		},
		afterEach() {
			this.myView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Non bound URL should be kept as is", function(assert) {
			var iFrame = this.myView.byId("iframe1");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url, "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url, "Settings' URL is correct");
		});
		QUnit.test("Simple binding URL should be reverted back to binding in settings", function(assert) {
			var iFrame = this.myView.byId("iframe2");
			var sExpectedUrl = encodeURI(`${sOpenUI5Url}?fullName=${sUserFullName}`);
			assert.strictEqual(
				iFrame.getUrl(),
				sExpectedUrl,
				"Displayed URL is correct and parameters are properly encoded"
			);
			assert.strictEqual(iFrame.get_settings().url, `${sOpenUI5Url}?fullName={$user>/fullName}`, "Settings' URL is correct");
		});
		QUnit.test("when a passed  url is already encoded", function(assert) {
			var iFrame = this.myView.byId("iframe2");
			var sEncodedUrl = encodeURI(`${sOpenUI5Url}?someParameter=${sUserFullName}`);
			iFrame.setUrl(sEncodedUrl);
			return checkUrl(assert, iFrame, sEncodedUrl, "then it is not encoded again");
		});
		QUnit.test("Simple binding URL (with unexpected reference) should be reverted back to binding in settings", function(assert) {
			var iFrame = this.myView.byId("iframe3");
			assert.strictEqual(iFrame.getUrl(), "", "Displayed URL is empty since the binding can't be resolved");
			assert.strictEqual(iFrame.get_settings().url, `${sOpenUI5Url}?domain={$user>/domain}&{anyModel>/anyProperty}`, "Settings' URL is correct");
		});
		QUnit.test("Complex binding URL is 'converted' to simple binding ('simple' use case)", function(assert) {
			var iFrame = this.myView.byId("iframe4");
			assert.strictEqual(iFrame.getUrl(), `${sOpenUI5Url}?domain=sap.com`, "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, `${sOpenUI5Url}?domain={$user>/domain}`, "Settings' URL is correct");
		});
		QUnit.test("Complex binding URL is 'converted' to simple binding ('advanced' use case)", function(assert) {
			var iFrame = this.myView.byId("iframe5");
			assert.strictEqual(iFrame.getUrl(), `${sOpenUI5Url}?domain=SAP`, "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, `${sOpenUI5Url}?domain=EXTERNAL`, "Settings' URL looks corrupted");
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

	function stubGetUShellService(sEmail, sFullName, sFirstName, sLastName) {
		sandbox.stub(Utils, "getUShellService").resolves({
			getUser() {
				return {
					getEmail() { return sEmail; },
					getFullName() { return sFullName; },
					getFirstName() { return sFirstName; },
					getLastName() { return sLastName; }
				};
			}
		});
	}
});