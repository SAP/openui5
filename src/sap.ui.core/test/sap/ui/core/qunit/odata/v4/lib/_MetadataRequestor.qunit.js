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
	 * @param {boolean} [bFail=false]
	 *   fail if true
	 * @param {string} [sDate=null]
	 *   value of "Date" response header
	 * @param {string} [sLastModified=null]
	 *   value of "Last-Modified" response header
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(oPayload, bFail, sDate, sLastModified) {
		var jqXHR = new jQuery.Deferred();

		setTimeout(function () {
			if (bFail) {
				jqXHR.reject(oPayload);
			} else {
				jqXHR.resolve(oPayload, "OK", { // mock jqXHR for success handler
					getResponseHeader : function (sName) {
						// Note: getResponseHeader treats sName case insensitive!
						// Thus productive code can safely use the nice capitalization only.
						// Mock does not need to implement case insensitivity!
						switch (sName) {
						case "Date":
							return sDate || null;
						case "Last-Modified":
							return sLastModified || null;
						default:
							assert.ok(false, "unexpected getResponseHeader(" + sName + ")");
						}
					}
				});
			}
		}, 0);

		return jqXHR;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._MetadataRequestor", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data", mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			// resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			this.oSandbox.stub(sap.ui, "getVersionInfo");
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
			oJQueryMock = this.mock(jQuery),
			mHeaders = {},
			mQueryParams = {
				"sap-client" :"300"
			},
			oMetadataRequestor,
			sUrl = "/~/";

		this.mock(_Helper).expects("buildQuery")
			.withExactArgs(sinon.match.same(mQueryParams))
			.returns("?...");

		oJQueryMock.expects("ajax")
			.withExactArgs(sUrl + "?...", {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oExpectedXml));

		this.mock(_MetadataConverter).expects("convertXMLMetadata").twice()
			.withExactArgs(sinon.match.same(oExpectedXml))
			.returns(oExpectedJson);

		oMetadataRequestor = _MetadataRequestor.create(mHeaders, mQueryParams);
		assert.strictEqual(typeof oMetadataRequestor, "object");

		return oMetadataRequestor.read(sUrl).then(function (oResult) {
			assert.strictEqual(oResult, oExpectedJson);

			oJQueryMock.expects("ajax")
				.withExactArgs(sUrl, {
					headers : sinon.match.same(mHeaders),
					method : "GET"
				}).returns(createMock(oExpectedXml));

			// code under test
			return oMetadataRequestor.read(sUrl, true); //no query string
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bHasLastModified) {
		var sTitle = bHasLastModified
			? "read: success with Last-Modified"
			: "read: success with Date only, no Last-Modified";

		QUnit.test(sTitle, function (assert) {
			var sDate = "Tue, 18 Apr 2017 14:40:29 GMT",
				oExpectedJson = {
					"$Version" : "4.0",
					"$EntityContainer" : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>"
				},
				oExpectedXml = "xml",
				oJQueryMock = this.mock(jQuery),
				mHeaders = {},
				sLastModified = bHasLastModified ? "Fri, 07 Apr 2017 11:21:50 GMT" : null,
				oMetadataRequestor = _MetadataRequestor.create(mHeaders),
				sUrl = "/~/";

			oJQueryMock.expects("ajax")
				.withExactArgs(sUrl, {
					headers : sinon.match.same(mHeaders),
					method : "GET"
				}).returns(createMock(oExpectedXml, false, sDate, sLastModified));
			this.mock(_MetadataConverter).expects("convertXMLMetadata")
				.withExactArgs(sinon.match.same(oExpectedXml))
				.returns(oExpectedJson);

			// code under test
			return oMetadataRequestor.read(sUrl).then(function (oResult) {
				assert.deepEqual(oResult, {
					"$Version" : "4.0",
					"$EntityContainer" : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>",
					"$LastModified" : bHasLastModified ? sLastModified : sDate
				});
			});
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
