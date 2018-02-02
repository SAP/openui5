/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/model/odata/v4/lib/_V2MetadataConverter",
	"sap/ui/model/odata/v4/lib/_V4MetadataConverter",
	"sap/ui/test/TestUtils"
], function (jQuery, _Helper, _MetadataConverter, _MetadataRequestor, _V2MetadataConverter,
		_V4MetadataConverter, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
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
	 * @param {string} [sETag=null]
	 *   value of "ETag" response header
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(oPayload, bFail, sDate, sLastModified, sETag) {
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
						case "ETag":
							return sETag || null;
						case "Last-Modified":
							return sLastModified || null;
						default:
							QUnit.assert.ok(false, "unexpected getResponseHeader(" + sName + ")");
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
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", mFixture);
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			// resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			this.mock(sap.ui).expects("getVersionInfo").atLeast(0);
		}
	});

	//*********************************************************************************************
	QUnit.test("_MetadataRequestor is not a constructor", function (assert) {
		assert.strictEqual(typeof _MetadataRequestor, "object");
	});

	//*********************************************************************************************
	["4.0", "2.0"].forEach(function (sODataVersion) {
		QUnit.test("read: success, sODataVersion=" + sODataVersion, function (assert) {
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
			if (sODataVersion === "4.0") {
				this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata").twice()
					.withExactArgs(sinon.match.same(oExpectedXml), sUrl)
					.returns(oExpectedJson);
				this.mock(_V2MetadataConverter.prototype).expects("convertXMLMetadata").never();
			} else {
				this.mock(_V2MetadataConverter.prototype).expects("convertXMLMetadata")
					.withExactArgs(sinon.match.same(oExpectedXml), sUrl)
					.returns(oExpectedJson);
				this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata")
					.withExactArgs(sinon.match.same(oExpectedXml), sUrl)
					.returns(oExpectedJson);
			}

			// code under test
			oMetadataRequestor = _MetadataRequestor.create(mHeaders, sODataVersion, mQueryParams);

			// code under test
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
	});

	//*********************************************************************************************
	QUnit.test("read: success with Date, ETag and Last-Modified", function (assert) {
		var sDate = "Tue, 18 Apr 2017 14:40:29 GMT",
			sETag = 'W/"19700101000000.0000000"',
			sLastModified = "Fri, 07 Apr 2017 11:21:50 GMT",
			oExpectedJson = {
				"$Version" : "4.0",
				"$EntityContainer" : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>"
			},
			oExpectedResult = {
				"$Version" : "4.0",
				"$EntityContainer" : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>",
				"$Date" : sDate,
				"$ETag" : sETag,
				"$LastModified" : sLastModified
			},
			oExpectedXml = {},
			mHeaders = {},
			oMetadataRequestor = _MetadataRequestor.create(mHeaders, "4.0"),
			sUrl = "/~/";

		this.mock(jQuery).expects("ajax")
			.withExactArgs(sUrl, {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oExpectedXml, false, sDate, sLastModified, sETag));
		this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata")
			.withExactArgs(sinon.match.same(oExpectedXml), sUrl)
			.returns(oExpectedJson);

		// code under test
		return oMetadataRequestor.read(sUrl).then(function (oResult) {
			assert.deepEqual(oResult, oExpectedResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: bPrefetch", function (assert) {
		var oConverterMock = this.mock(_MetadataConverter.prototype),
			sDate = "Tue, 18 Apr 2017 14:40:29 GMT",
			sETag = 'W/"19700101000000.0000000"',
			oJQueryMock = this.mock(jQuery),
			sLastModified = "Fri, 07 Apr 2017 11:21:50 GMT",
			oExpectedXml = {},
			mHeaders = {},
			oMetadataRequestor = _MetadataRequestor.create(mHeaders, "4.0"),
			sUrl = "/~/";

		oJQueryMock.expects("ajax")
			.withExactArgs(sUrl, {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oExpectedXml, false, sDate, sLastModified, sETag));
		oConverterMock.expects("convertXMLMetadata").never();

		// code under test
		return oMetadataRequestor.read(sUrl, false, true).then(function (oResult) {
			var oExpectedJson = {
					"$Version" : "4.0",
					"$EntityContainer" : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>"
				};

			// "...have at least the same properties as..."
			sinon.assert.match(oResult, sinon.match({
				"$Date" : sDate,
				"$ETag" : sETag,
				"$LastModified" : sLastModified,
				"$XML" : sinon.match.same(oExpectedXml)
			}));

			assert.throws(function () {
				oMetadataRequestor.read(sUrl, false, true);
			}, new Error("Must not prefetch twice: " + sUrl));

			// Note: no addt'l request
			oConverterMock.expects("convertXMLMetadata")
				.withExactArgs(sinon.match.same(oExpectedXml), sUrl)
				.returns(oExpectedJson);

			// code under test
			return oMetadataRequestor.read(sUrl, false, false).then(function (oResult) {
				var oNewExpectedJson = {
						"$Version" : "4.0",
						"$EntityContainer" : "NEW!"
					},
					oNewExpectedXml = {};

				assert.deepEqual(oResult, {
					"$Date" : sDate,
					"$EntityContainer" : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>",
					"$ETag" : sETag,
					"$LastModified" : sLastModified,
					"$Version" : "4.0"
				});

				oJQueryMock.expects("ajax")
					.withExactArgs(sUrl, {
						headers : sinon.match.same(mHeaders),
						method : "GET"
					}).returns(createMock(oNewExpectedXml));
				oConverterMock.expects("convertXMLMetadata")
					.withExactArgs(sinon.match.same(oNewExpectedXml), sUrl)
					.returns(oNewExpectedJson);

				// code under test
				return oMetadataRequestor.read(sUrl).then(function (oNewResult) {
					assert.deepEqual(oNewResult, oNewExpectedJson);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("read: failure", function (assert) {
		var jqXHR = {},
			oExpectedError = new Error("404 Not Found"),
			oMetadataRequestor = _MetadataRequestor.create({}, "4.0"),
			sUrl = "/foo/$metadata";

		this.mock(jQuery).expects("ajax")
			.returns(createMock(jqXHR, true)); // true  = fail
		this.mock(_Helper).expects("createError")
			.withExactArgs(sinon.match.same(jqXHR))
			.returns(oExpectedError);
		this.oLogMock.expects("error")
			.withExactArgs("GET " + sUrl, oExpectedError.message,
				"sap.ui.model.odata.v4.lib._MetadataRequestor");

		return oMetadataRequestor.read(sUrl).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: test service", function (assert) {
		var oMetadataRequestor = _MetadataRequestor.create({}, "4.0");

		return Promise.all([
			oMetadataRequestor.read(
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"),
			jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});
});
