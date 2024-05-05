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
	const sOpenUI5Url = `${sProtocol}://openui5.com/`;
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
			const sTestUrlRegex = new RegExp(`${sOpenUI5Url}\\?sap-ui-xx-fl-forceEmbeddedContentRefresh=\\d+#someNavParameter`);
			assert.ok(
				sTestUrlRegex.test(this.oIFrame.getUrl()),
				"then the url is properly updated"
			);
			await nextUIUpdate();
			assert.strictEqual(oReplaceLocationSpy.callCount, 1, "then the iframe location is properly replaced");
			assert.ok(
				sTestUrlRegex.test(oReplaceLocationSpy.lastCall.args[0]),
				"then the proper url is loaded and a frame buster search parameter is added"
			);
		});

		QUnit.test("when iframe is created with default advanced settings", async function(assert) {
			await nextUIUpdate();
			assert.strictEqual(
				this.oIFrame.getDomRef().sandbox.value,
				"allow-forms allow-popups allow-scripts allow-modals allow-same-origin",
				"then the default sandbox attributes are set correctly"
			);
		});

		QUnit.test("when iframe is updated with advanced settings", async function(assert) {
			this.oIFrame.setAdvancedSettings({
				additionalSandboxParameters: ["allow-downloads-without-user-activation"],
				"allow-forms": true,
				"allow-popups": false,
				"allow-scripts": false,
				"allow-modals": false,
				"allow-same-origin": false
			});
			await nextUIUpdate();
			assert.strictEqual(
				this.oIFrame.getDomRef().sandbox.value,
				"allow-forms allow-downloads-without-user-activation",
				"then the custom sandbox attributes are set correctly"
			);
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

	QUnit.module("URL validation", {
		afterEach() {
			sandbox.restore();
		}
	}, () => {
		QUnit.test("when providing a valid url", function(assert) {
			const { result, error } = IFrame.isValidUrl("https://example.com");
			assert.strictEqual(result, true, "then the url is allowed");
			assert.strictEqual(error, undefined, "then no error message is returned");
			assert.strictEqual(IFrame.isValidUrl("someRelativeUrl.html").result, true);
		});

		QUnit.test("when providing an invalid url", function(assert) {
			const { result, error } = IFrame.isValidUrl("https://");
			assert.strictEqual(result, false);
			assert.strictEqual(error, IFrame.VALIDATION_ERROR.INVALID_URL);
		});

		QUnit.test("when embedding the javascript pseudo protocol", function(assert) {
			// eslint-disable-next-line no-script-url
			const { result, error } = IFrame.isValidUrl("javascript:someJs");
			assert.strictEqual(result, false);
			assert.strictEqual(error, IFrame.VALIDATION_ERROR.UNSAFE_PROTOCOL);
		});

		QUnit.test("when embedding a protocol that is blocked by the URLListValidator", function(assert) {
			const { result, error } = IFrame.isValidUrl("about:blank");
			assert.strictEqual(result, false);
			assert.strictEqual(error, IFrame.VALIDATION_ERROR.FORBIDDEN_URL);
		});

		QUnit.test("when allowing the javascript pseudo protocol in the URLListValidator", function(assert) {
			URLListValidator.add("javascript");
			// eslint-disable-next-line no-script-url
			const { result, error } = IFrame.isValidUrl("javascript:someJs");
			assert.strictEqual(result, false, "then it is still forbidden for the iframe");
			assert.strictEqual(error, IFrame.VALIDATION_ERROR.UNSAFE_PROTOCOL);
			URLListValidator.clear();
		});

		QUnit.test("when allowing a non-critical protocol", function(assert) {
			URLListValidator.add("about");
			assert.strictEqual(IFrame.isValidUrl("about:blank").result, true);
			URLListValidator.clear();
		});

		QUnit.test("when embedding http content from a https document", (assert) => {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "https:",
				href: "https://example.com"
			});
			const { result, error } = IFrame.isValidUrl("http://example.com");
			assert.strictEqual(result, false);
			assert.strictEqual(error, IFrame.VALIDATION_ERROR.MIXED_CONTENT);
		});

		QUnit.test("when embedding https content from a https document", (assert) => {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "https:",
				href: "https://example.com"
			});
			assert.strictEqual(IFrame.isValidUrl("https://example.com").result, true);
		});

		QUnit.test("when embedding http content from a http document", (assert) => {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "http:",
				href: "http://example.com"
			});
			assert.strictEqual(IFrame.isValidUrl("http://example.com").result, true);
		});

		QUnit.test("when embedding https content from a http document", (assert) => {
			sandbox.stub(IFrame, "_getDocumentLocation").returns({
				protocol: "http:",
				href: "http://example.com"
			});
			assert.strictEqual(IFrame.isValidUrl("https://example.com").result, true);
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