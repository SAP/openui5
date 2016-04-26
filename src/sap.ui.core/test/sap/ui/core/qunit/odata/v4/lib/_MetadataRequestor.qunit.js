/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/test/TestUtils"
], function (jQuery, _Helper, _MetadataConverter, _MetadataRequestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mFixture = {
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
				: {source : "metadata.xml"},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json"
				: {source : "metadata.json"}
		};

	/**
	 * Creates a mock for jQuery's XHR wrapper.
	 *
	 * @param {object} oPayload
	 *   the response payload
	 * @param {boolean} bFail
	 *   fail if true
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(oPayload, bFail) {
		var jqXHR = new jQuery.Deferred();

		setTimeout(function () {
			if (bFail) {
				jqXHR.reject(oPayload);
			} else {
				jqXHR.resolve(oPayload);
			}
		}, 0);

		return jqXHR;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._MetadataRequestor", {
		beforeEach : function () {
			// workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			// resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			sap.ui.getVersionInfo();

			this.oSandbox = sinon.sandbox.create();
			TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data", mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("_MetadataRequestor is not a constructor", function (assert) {
		assert.strictEqual(typeof _MetadataRequestor, "object");
	});

	//*********************************************************************************************
	QUnit.test("read: success", function (assert) {
		var oExpectedJson = {},
			oExpectedXml = "xml",
			oHeaders = {},
			oQueryParams = {
				"sap-client" :"300"
			},
			oMetadataRequestor,
			sUrl = "/~/";

		this.mock(_Helper).expects("buildQuery")
			.withExactArgs(sinon.match.same(oQueryParams))
			.returns("?...");

		this.mock(jQuery).expects("ajax")
			.withExactArgs(sUrl + "?...", {
				headers : sinon.match.same(oHeaders),
				method : "GET"
			}).returns(createMock(oExpectedXml));

		this.mock(_MetadataConverter).expects("convertXMLMetadata")
			.withExactArgs(sinon.match.same(oExpectedXml))
			.returns(oExpectedJson);

		oMetadataRequestor = _MetadataRequestor.create(oHeaders, oQueryParams);
		assert.strictEqual(typeof oMetadataRequestor, "object");

		return oMetadataRequestor.read(sUrl).then(function (oResult) {
			assert.strictEqual(oResult, oExpectedJson);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: failure", function (assert) {
		var jqXHR = {},
			oExpectedError = {},
			oMetadataRequestor = _MetadataRequestor.create();

		this.mock(jQuery).expects("ajax")
			.returns(createMock(jqXHR, true)); // true  = fail
		this.mock(_Helper).expects("createError")
			.withExactArgs(sinon.match.same(jqXHR))
			.returns(oExpectedError);

		return oMetadataRequestor.read("/").then(function (oResult) {
			assert.ok(false);
		})
		.catch(function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: test service", function (assert) {
		var oMetadataRequestor = _MetadataRequestor.create();

		return Promise.all([
			oMetadataRequestor.read(
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"),
			jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});
});
