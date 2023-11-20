/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/Sample.controller",
	"sap/ui/documentation/sdk/util/Resources"
],
function (
	SampleController,
	ResourcesUtil
) {
	"use strict";

	var sSampleId = 'sample.id';

	QUnit.module("_initIframeURL", {
		beforeEach: function () {
			this.controller = new SampleController();
			this.controller._sId = sSampleId;
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("url resource origin", function (assert) {
		var sResourceOrigin = 'https://dkorigin.com',
			sResourcesBaseUrl = sResourceOrigin + "/path",
			oIFrameUrl;

		this.stub(ResourcesUtil, "getConfig").returns(sResourcesBaseUrl);
		this.stub(ResourcesUtil, "getResourceOrigin").returns(sResourceOrigin);

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl);
		assert.strictEqual(oIFrameUrl.origin, sResourceOrigin);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-origin"), sResourcesBaseUrl);
	});

	QUnit.test("url contains demokit version", function (assert) {
		var sVersion = '1.71.0',
			oIFrameUrl;

		this.stub(ResourcesUtil, "getResourcesVersion").returns(sVersion);

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-origin"), "." + sVersion); // current output
	});

	QUnit.test("url contains sample id", function (assert) {
		var oIFrameUrl;

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-id"), sSampleId, "sample id is correct");
	});

    QUnit.test("url contains sample origin", function (assert) {
		var sSampleOrigin = ResourcesUtil.getConfig(),
			oIFrameUrl;

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-origin"), sSampleOrigin, "sample origin is correct");
	});

	QUnit.test("url contains sample library", function (assert) {
		var sSampleLib = "",
			oIFrameUrl;

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-lib"), sSampleLib, "sample origin is correct");
	});

});