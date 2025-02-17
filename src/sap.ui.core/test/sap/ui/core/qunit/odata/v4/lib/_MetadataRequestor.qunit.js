/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/model/odata/v4/lib/_V2MetadataConverter",
	"sap/ui/model/odata/v4/lib/_V4MetadataConverter",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/jquery"
], function (Log, _Helper, _MetadataConverter, _MetadataRequestor, _V2MetadataConverter,
		_V4MetadataConverter, TestUtils, jQuery) {
	"use strict";

	var mFixture = {
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
				: {source : "metadata.xml"},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json"
				: {source : "metadata.json"}
		},
		fnGetOrCreateRetryAfterPromise = function () {
			return null;
		};

	function mustBeMocked() { throw new Error("Must be mocked"); }

	/**
	 * Creates a mock for jQuery's XHR wrapper.
	 *
	 * @param {object} oPayload
	 *   the response payload
	 * @param {boolean} [bFail]
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
								QUnit.assert.ok(false,
									"unexpected getResponseHeader(" + sName + ")");
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
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			/**
			 * workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			 * resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			 * @deprecated As of version 1.56.0
			 */
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
					"sap-client" : "300"
				},
				oMetadataRequestor,
				sUrl = "/~/";

			this.mock(_Helper).expects("buildQuery")
				.withExactArgs(sinon.match.same(mQueryParams))
				.returns("?...");
			oJQueryMock.expects("ajax")
				.withExactArgs(sUrl + "?...", {
					headers : sinon.match.same(mHeaders),
					method : "GET",
					xhrFields : {withCredentials : true}
				}).returns(createMock(oExpectedXml));
			if (sODataVersion === "4.0") {
				this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata").twice()
					.withExactArgs(sinon.match.same(oExpectedXml), sUrl, false)
					.returns(oExpectedJson);
				this.mock(_V2MetadataConverter.prototype).expects("convertXMLMetadata").never();
			} else {
				this.mock(_V2MetadataConverter.prototype).expects("convertXMLMetadata")
					.withExactArgs(sinon.match.same(oExpectedXml), sUrl, false)
					.returns(oExpectedJson);
				this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata")
					.withExactArgs(sinon.match.same(oExpectedXml), sUrl, false)
					.returns(oExpectedJson);
			}

			// code under test
			oMetadataRequestor = _MetadataRequestor.create(mHeaders, sODataVersion,
				/*bIgnoreAnnotationsFromMetadata*/false, mQueryParams,
				/*bWithCredentials*/true, fnGetOrCreateRetryAfterPromise);

			// code under test
			return oMetadataRequestor.read(sUrl).then(function (oResult) {
				assert.strictEqual(oResult, oExpectedJson);

				oJQueryMock.expects("ajax")
					.withExactArgs(sUrl, {
						headers : sinon.match.same(mHeaders),
						method : "GET",
						xhrFields : {withCredentials : true}
					}).returns(createMock(oExpectedXml));

				// code under test
				return oMetadataRequestor.read(sUrl, true); //no query string
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("read: success with Date, ETag and Last-Modified", async function (assert) {
		var sDate = "Tue, 18 Apr 2017 14:40:29 GMT",
			sETag = 'W/"19700101000000.0000000"',
			sLastModified = "Fri, 07 Apr 2017 11:21:50 GMT",
			oExpectedJson = {
				$Version : "4.0",
				$EntityContainer : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>"
			},
			oExpectedResult = {
				$Version : "4.0",
				$EntityContainer : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>",
				$Date : sDate,
				$ETag : sETag,
				$LastModified : sLastModified
			},
			oExpectedXml = {},
			mHeaders = {},
			fnResolve,
			oRetryAfterPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			oMetadataRequestor = _MetadataRequestor.create(mHeaders, "4.0", undefined, null, false,
				function () {
					return oRetryAfterPromise;
				}),
			sUrl = "/~/";

		const oJQueryMock = this.mock(jQuery);
		oJQueryMock.expects("ajax").never();

		// code under test
		const oPromise = oMetadataRequestor.read(sUrl);

		await new Promise(function (resolve) {
			setTimeout(resolve, 5);
		});

		fnResolve();
		oJQueryMock.expects("ajax")
			.withExactArgs(sUrl, {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oExpectedXml, false, sDate, sLastModified, sETag));
		this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata")
			.withExactArgs(sinon.match.same(oExpectedXml), sUrl, undefined)
			.returns(oExpectedJson);

		const oResult = await oPromise;

		assert.deepEqual(oResult, oExpectedResult);
	});

	//*********************************************************************************************
	QUnit.test("read: oRetryAfterPromise rejects", function (assert) {
		const oMetadataRequestor = _MetadataRequestor.create({}, "4.0", undefined, null, false,
			function () {
				return Promise.reject("~oError~");
			});
		this.mock(jQuery).expects("ajax").never();
		// Note: if oRetryAfterPromise rejects, "app" is broken and we don't care about other
		// features of read()

		// code under test
		return oMetadataRequestor.read("n/a").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
		});
	});

	//*********************************************************************************************
	QUnit.test("read: sap-context-token only used with 1st metadata read", function (assert) {
		var sAnnotationUrl = "/tea_busi_annotation/",
			sCrossServiceReferenceUrl = "/tea_busi_product/$metadata",
			mHeaders = {},
			oHelperMock = this.mock(_Helper),
			oJQueryMock = this.mock(jQuery),
			oMetadataRequestor,
			oPromise0,
			oPromise1,
			oPromise2,
			mQueryParams = {
				"sap-client" : "279",
				"sap-context-token" : "20200716120000",
				"sap-language" : "en"
			},
			sQuery1 = "?sap-client=279&sap-context-token=20200716120000&sap-language=en",
			sQuery2 = "?sap-client=279&sap-language=en",
			sUrl = "/tea_busi/$metadata",
			oV4MetadataConverterMock = this.mock(_V4MetadataConverter.prototype),
			oXml0 = {},
			oXml1 = {},
			oXml2 = {};

		oHelperMock.expects("buildQuery")
			.withExactArgs(sinon.match.same(mQueryParams))
			.returns(sQuery1);
		oMetadataRequestor = _MetadataRequestor.create(mHeaders, "4.0", true, mQueryParams,
			false, fnGetOrCreateRetryAfterPromise);
		oJQueryMock.expects("ajax")
			.withExactArgs(sAnnotationUrl, {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oXml0));
		oV4MetadataConverterMock.expects("convertXMLMetadata")
			.withExactArgs(sinon.match.same(oXml0), sAnnotationUrl, false)
			.returns({});

		// code under test (read annotations before 1st $metadata request)
		oPromise0 = oMetadataRequestor.read(sAnnotationUrl, /*bAnnotations*/true);

		oJQueryMock.expects("ajax")
			.withExactArgs(sUrl + sQuery1, {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oXml1));
		oV4MetadataConverterMock.expects("convertXMLMetadata")
			.withExactArgs(sinon.match.same(oXml1), sUrl, true)
			.returns({});
		oHelperMock.expects("buildQuery")
			.withExactArgs(sinon.match.same(mQueryParams))
			.callsFake(function () {
				assert.deepEqual(mQueryParams, {"sap-client" : "279", "sap-language" : "en"});
				return sQuery2;
			});

		// code under test
		oPromise1 = oMetadataRequestor.read(sUrl);

		oJQueryMock.expects("ajax")
			.withExactArgs(sCrossServiceReferenceUrl + sQuery2, {
				headers : sinon.match.same(mHeaders),
				method : "GET"
			}).returns(createMock(oXml2));
		oV4MetadataConverterMock.expects("convertXMLMetadata")
			.withExactArgs(sinon.match.same(oXml2), sCrossServiceReferenceUrl, true)
			.returns({});

		// code under test
		oPromise2 = oMetadataRequestor.read(sCrossServiceReferenceUrl);

		return Promise.all([oPromise0, oPromise1, oPromise2]);
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
			oMetadataRequestor = _MetadataRequestor.create(mHeaders, "4.0", undefined, null, false,
				fnGetOrCreateRetryAfterPromise),
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
					$Version : "4.0",
					$EntityContainer : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>"
				};

			// "...have at least the same properties as..."
			sinon.assert.match(oResult, sinon.match({
				$Date : sDate,
				$ETag : sETag,
				$LastModified : sLastModified,
				$XML : sinon.match.same(oExpectedXml)
			}));

			assert.throws(function () {
				oMetadataRequestor.read(sUrl, false, true);
			}, new Error("Must not prefetch twice: " + sUrl));

			// Note: no addt'l request
			oConverterMock.expects("convertXMLMetadata")
				.withExactArgs(sinon.match.same(oExpectedXml), sUrl, undefined)
				.returns(oExpectedJson);

			// code under test
			return oMetadataRequestor.read(sUrl, false, false).then(function (oResult0) {
				var oNewExpectedJson = {
						$Version : "4.0",
						$EntityContainer : "NEW!"
					},
					oNewExpectedXml = {};

				assert.deepEqual(oResult0, {
					$Date : sDate,
					$EntityContainer : "<5.1.1 Schema Namespace>.<13.1.1 EntityContainer Name>",
					$ETag : sETag,
					$LastModified : sLastModified,
					$Version : "4.0"
				});

				oJQueryMock.expects("ajax")
					.withExactArgs(sUrl, {
						headers : sinon.match.same(mHeaders),
						method : "GET"
					}).returns(createMock(oNewExpectedXml));
				oConverterMock.expects("convertXMLMetadata")
					.withExactArgs(sinon.match.same(oNewExpectedXml), sUrl, undefined)
					.returns(oNewExpectedJson);

				// code under test
				return oMetadataRequestor.read(sUrl).then(function (oNewResult) {
					assert.deepEqual(oNewResult, oNewExpectedJson);
				});
			});
		});
	});

	//*********************************************************************************************
[404, 503].forEach((iStatus) => {
	QUnit.test("read: failure, status=" + iStatus, function (assert) {
		const oObject = {
			getOrCreateRetryAfterPromise : mustBeMocked
		};
		const oObjectMock = this.mock(oObject);
		oObjectMock.expects("getOrCreateRetryAfterPromise").withExactArgs().returns(null); // get
		const oMetadataRequestor = _MetadataRequestor.create({}, "4.0", false, null, false,
			oObject.getOrCreateRetryAfterPromise);
		const jqXHR = {
			status : iStatus,
			getResponseHeader : mustBeMocked
		};
		this.mock(jqXHR).expects("getResponseHeader").exactly(iStatus === 503 ? 1 : 0)
			.withExactArgs("Retry-After").returns(""); // "" is a very near miss :-)
		this.mock(jQuery).expects("ajax")
			.returns(createMock(jqXHR, true)); // true = fail
		const oExpectedError = new Error("Intentionally failed");
		this.mock(_Helper).expects("createError")
			.withExactArgs(sinon.match.same(jqXHR), "Could not load metadata")
			.returns(oExpectedError);
		this.oLogMock.expects("error")
			.withExactArgs("GET " + "/foo/$metadata", oExpectedError.message,
				"sap.ui.model.odata.v4.lib._MetadataRequestor");

		return oMetadataRequestor.read("/foo/$metadata").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach((bRepeat) => {
	QUnit.test("read: 503 failure, repeat: " + bRepeat, function (assert) {
		const oObject = {
			getOrCreateRetryAfterPromise : mustBeMocked
		};
		const oObjectMock = this.mock(oObject);
		oObjectMock.expects("getOrCreateRetryAfterPromise").withExactArgs().returns(null); // get
		const oMetadataRequestor = _MetadataRequestor.create({}, "4.0", false, null, false,
			oObject.getOrCreateRetryAfterPromise);
		const oJQueryMock = this.mock(jQuery);
		const jqXHR = {
			status : 503,
			getResponseHeader : mustBeMocked
		};
		oJQueryMock.expects("ajax").withExactArgs("/foo/$metadata", sinon.match.object)
			.returns(createMock(jqXHR, true)); // true = fail
		const oRetryAfterError = new Error("DB migration in progress");
		this.mock(_Helper).expects("createError")
			.withExactArgs(sinon.match.same(jqXHR), "Could not load metadata")
			.returns(oRetryAfterError);
		this.mock(jqXHR).expects("getResponseHeader").withExactArgs("Retry-After").returns("42");
		oObjectMock.expects("getOrCreateRetryAfterPromise")
			.withExactArgs(sinon.match.same(oRetryAfterError)).returns("truthy"); // create
		const oRetryAfterPromise = bRepeat ? Promise.resolve() : Promise.reject("~oError~");
		oObjectMock.expects("getOrCreateRetryAfterPromise")
			.withExactArgs().returns(oRetryAfterPromise); // get
		const oExpectedJson = {};
		if (bRepeat) {
			oJQueryMock.expects("ajax").withExactArgs("/foo/$metadata", sinon.match.object)
				.returns(createMock("~oData~"));
			this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata")
				.withExactArgs("~oData~", "/foo/$metadata", false)
				.returns(oExpectedJson);
		} else {
			this.mock(_V4MetadataConverter.prototype).expects("convertXMLMetadata").never();
			// Note: if oRetryAfterPromise rejects, "app" is broken and we don't care about other
			// features of read()
		}

		oRetryAfterPromise.catch(() => {}); // avoid random(?) "global failure"

		// code under test
		return oMetadataRequestor.read("/foo/$metadata").then(function (oResult) {
			assert.ok(bRepeat);
			assert.strictEqual(oResult, oExpectedJson);
		}, function (oError) {
			assert.ok(!bRepeat);
			assert.strictEqual(oError, "~oError~");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("read: test service", function (assert) {
		var oMetadataRequestor = _MetadataRequestor.create({}, "4.0", false, null, false,
				fnGetOrCreateRetryAfterPromise);

		return Promise.all([
			oMetadataRequestor.read(
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"),
			jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: test service; ignoreAnnotationsFromMetadata", function (assert) {
		var oMetadataRequestor = _MetadataRequestor.create({}, "4.0", true, {}, false,
				fnGetOrCreateRetryAfterPromise);

		return Promise.all([
			oMetadataRequestor.read(
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"),
			jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
		]).then(function (aResults) {
			aResults[1]["com.sap.gateway.default.iwbep.tea_busi.v0001."].$Annotations = {};
			assert.deepEqual(aResults[0], aResults[1], "metadata fully intact");
		});
	});
});
