/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/util/uid",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI"
], function (jQuery, Log, merge, uid, SyncPromise, _Helper, TestUtils, URI) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._Helper";

	/**
	 * Returns a mock "fnFetchMetadata" (see _Requestor#getModelInterface) which returns metadata
	 * for a meta path according to the given map.
	 *
	 * @param {object} mMetaPath2Type
	 *   A map from meta path to symbolic type, for example
	 *   <code>{"/Me/A" : "", "/Me/to1" : "1", "/Me/toN" : "N"}</code>, where "" means structural
	 *   property, "N" means collection-valued navigation property and "1" means navigation property
	 * @returns {function}
	 *   "fnFetchMetadata"
	 */
	function getFetchMetadata(mMetaPath2Type) {
		return function (sMetaPath) {
			switch (mMetaPath2Type[sMetaPath]) {
				case "":
					return SyncPromise.resolve({
						$kind : "Property"
					});

				case "1":
					return SyncPromise.resolve({
						$kind : "NavigationProperty"
//						$isCollection : false
					});

				case "N":
					return SyncPromise.resolve({
						$kind : "NavigationProperty",
						$isCollection : true
					});

				default:
					throw new Error(sMetaPath);
			}
		};
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Helper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("createGetMethod, not throwing", function (assert) {
		var aArguments = ["foo", "bar"],
			oResult = {},
			oSyncPromise = SyncPromise.resolve(oResult),
			oContext = {
				fetch : function () {
					assert.strictEqual(this, oContext);
					assert.deepEqual(Array.prototype.slice.call(arguments), aArguments);
					return oSyncPromise;
				}
			},
			fnGet;

		// code under test
		// Note: passing the function's name instead of reference allows for dynamic dispatch, thus
		// making a mock for "fetch*" possible in the first place
		fnGet = _Helper.createGetMethod("fetch");

		assert.strictEqual(fnGet.apply(oContext, aArguments), oResult);
		this.mock(oSyncPromise).expects("isFulfilled").returns(false);
		assert.strictEqual(fnGet.apply(oContext, aArguments), undefined);
	});

	//*********************************************************************************************
	QUnit.test("createGetMethod, throwing", function (assert) {
		var aArguments = ["foo", "bar"],
			oResult = {},
			oSyncPromise = SyncPromise.resolve(oResult),
			oContext = {
				fetch : function () {
					assert.strictEqual(this, oContext);
					assert.deepEqual(Array.prototype.slice.call(arguments), aArguments);
					return oSyncPromise;
				}
			},
			fnGet,
			oSyncPromiseMock = this.mock(oSyncPromise);

		// code under test
		fnGet = _Helper.createGetMethod("fetch", true);

		// fulfilled
		assert.strictEqual(fnGet.apply(oContext, aArguments), oResult);

		// pending
		oSyncPromiseMock.expects("isFulfilled").returns(false);
		oSyncPromiseMock.expects("isRejected").returns(false);
		assert.throws(function () {
			fnGet.apply(oContext, aArguments);
		}, new Error("Result pending"));

		// verify and restore
		oSyncPromiseMock.verify();
		oSyncPromiseMock = this.mock(oSyncPromise);

		// rejected
		oSyncPromiseMock.expects("isFulfilled").returns(false);
		oSyncPromiseMock.expects("isRejected").returns(true);
		oSyncPromiseMock.expects("caught");
		assert.throws(function () {
			fnGet.apply(oContext, aArguments);
		}, oResult);
	});

	//*********************************************************************************************
	QUnit.test("createRequestMethod", function (assert) {
		var aArguments = ["foo", "bar"],
			oResult = {},
			oSyncPromise = SyncPromise.resolve(),
			oContext = {
				fetch : function () {
					assert.strictEqual(this, oContext);
					assert.deepEqual(Array.prototype.slice.call(arguments), aArguments);
					return oSyncPromise;
				}
			},
			fnRequest;

		this.mock(Promise).expects("resolve")
			.withExactArgs(sinon.match.same(oSyncPromise)).returns(oResult);

		// code under test
		fnRequest = _Helper.createRequestMethod("fetch");

		assert.strictEqual(fnRequest.apply(oContext, aArguments), oResult);
	});

	//*********************************************************************************************
	[{
		message : "CSRF token validation failed",
		"response" : {
			"headers" : {
				"Content-Type" : "text/plain;charset=utf-8",
				"x-csrf-token" : "Required"
			},
			"responseText" : "CSRF token validation failed",
			"status" : 403,
			"statusText" : "Forbidden"
		}
	}, {
		message : "message: 401 Unauthorized",
		"response" : {
			"headers" : {
				"Content-Type" : "text/html;charset=utf-8"
			},
			"responseText" : "<html>...</html>",
			"status" : 401,
			"statusText" : "Unauthorized"
		}
	}, {
		// OData V4 error response body as JSON
		// "The error response MUST be a single JSON object. This object MUST have a
		// single name/value pair named error. The value must be a JSON object."
		body : {
			"error" : {
				"code" : "/IWBEP/CM_V4_RUNTIME/021",
				"message" :
					// Note: "a human-readable, language-dependent representation of the error"
					"The state of the resource (entity) was already changed (If-Match)",
				"@Common.ExceptionCategory" : "Client_Error",
				"@Common.Application" : {
					"ComponentId" : "OPU-BSE-BEP",
					"ServiceRepository" : "DEFAULT",
					"ServiceId" : "/IWBEP/TEA_BUSI",
					"ServiceVersion" : "0001"
				},
				"@Common.TransactionId" : "5617D1F235DE73F0E10000000A60180C",
				"@Common.Timestamp" : "20151009142600.103179",
				"@Common.ErrorResolution" : {
					"Analysis" : "Run transaction /IWFND/ERROR_LOG [...]",
					"Note" : "See SAP Note 1797736 for error analysis "
						+ "(https://service.sap.com/sap/support/notes/1797736)"
				}
			}
		},
		isConcurrentModification : true,
		message : "The state of the resource (entity) was already changed (If-Match)",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json; odata.metadata=minimal;charset=utf-8"
			},
//			"responseText" : JSON.stringify(this.body)
			"status" : 412,
			"statusText" : "Precondition Failed"
		}
	}, {
		message : "message: 999 Invalid JSON",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json"
			},
			"responseText" : "<html>...</html>",
			"status" : 999,
			"statusText" : "Invalid JSON"
		},
		warning : sinon.match(/SyntaxError/)
	}, {
		message : "message: 403 Forbidden",
		"response" : {
			"headers" : {
				"Content-Type" : "text/plain-not-quite-right"
			},
			"status" : 403,
			"statusText" : "Forbidden",
			"responseText" : "ignore this!"
		}
	}, {
		message : "Network error",
		"response" : {
			"headers" : {},
			"status" : 0,
			"statusText" : "error"
		}
	}, {
		message : "message: 404 Not Found",
		"response" : {
			"headers" : {},
			"status" : 404,
			"statusText" : "Not Found"
		}
	}, {
		// V2 error
		body : {
			error : {
				code : "0050569259751EE4BA9710043F8A5115",
				message : {
					lang : "en",
					value : "An unknown internal server error occurred"
				}
			}
		},
		message : "An unknown internal server error occurred",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json;charset=UTF-8"
			},
			"status" : 500,
			"statusText" : "Internal Server Error"
		}
	}].forEach(function (oFixture) {
		QUnit.test("createError: " + oFixture.message, function (assert) {
			var oError,
				jqXHR = {
					getResponseHeader : function (sName) {
						return oFixture.response.headers[sName];
					},
					"status" : oFixture.response.status,
					"statusText" : oFixture.response.statusText,
					"responseText" : oFixture.response.responseText || JSON.stringify(oFixture.body)
				};

			if (oFixture.warning) {
				this.oLogMock.expects("warning").withExactArgs(oFixture.warning,
					oFixture.response.responseText, "sap.ui.model.odata.v4.lib._Helper");
			}

			oError = _Helper.createError(jqXHR, "message", "/request/path", "original/path");

			assert.ok(oError instanceof Error);
			assert.deepEqual(oError.error, oFixture.body && oFixture.body.error);
			assert.strictEqual(oError.isConcurrentModification, oFixture.isConcurrentModification);
			assert.strictEqual(oError.message, oFixture.message);
			assert.strictEqual(oError.status, oFixture.response.status);
			assert.strictEqual(oError.statusText, oFixture.response.statusText);
			assert.strictEqual(oError.requestUrl, "/request/path");
			assert.strictEqual(oError.resourcePath, "original/path");
		});
	});

	//*********************************************************************************************
[
	{message : {/* any original message */}},
	{"@$ui5.originalMessage" : {message : {/* any original message */}}}
].forEach(function (oFixture, i) {
	QUnit.test("createTechnicalDetails," + i, function (assert) {
		var oClone = {foo : "bar"},
			oResult;

		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(i === 0 ? oFixture : oFixture["@$ui5.originalMessage"]))
			.returns(oClone);

		// code under test
		oResult = _Helper.createTechnicalDetails(oFixture);

		assert.deepEqual(oResult, {originalMessage : oClone});

		// code under test
		assert.strictEqual(oResult.originalMessage, oClone);

		// code under test (take care that further accesses point to the same object)
		assert.strictEqual(oResult.originalMessage, oClone);
	});
});

	//*********************************************************************************************
	QUnit.test("createTechnicalDetails with a JS Error instance", function (assert) {
		this.mock(_Helper).expects("publicClone").never();

		// code under test
		assert.deepEqual(_Helper.createTechnicalDetails(new Error()), {});

		// code under test
		assert.deepEqual(_Helper.createTechnicalDetails({"@$ui5.originalMessage" : new Error()}),
			{});
	});

	//*********************************************************************************************
	QUnit.test("encode", function (assert) {
		var sUnchanged = "foo$,/:?@();";

		assert.strictEqual(_Helper.encode(sUnchanged, false), sUnchanged);
		assert.strictEqual(_Helper.encode(sUnchanged, true), sUnchanged);

		assert.strictEqual(_Helper.encode("€_&_=_#_+", false), "%E2%82%AC_%26_=_%23_%2B");
		assert.strictEqual(_Helper.encode("€_&_=_#_+", true), "%E2%82%AC_%26_%3D_%23_%2B");
	});

	//*********************************************************************************************
	QUnit.test("encodePair", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("encode").withExactArgs("key", true).returns("~key~");
		oHelperMock.expects("encode").withExactArgs("value", false).returns("~value~");

		sEncoded = _Helper.encodePair("key", "value");
		assert.strictEqual(sEncoded, "~key~=~value~");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: no query", function (assert) {
		assert.strictEqual(_Helper.buildQuery(), "");
		assert.strictEqual(_Helper.buildQuery({}), "");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: query", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("encodePair").withExactArgs("a", "b").returns("a=b");
		oHelperMock.expects("encodePair").withExactArgs("c", "d").returns("c=d");
		oHelperMock.expects("encodePair").withExactArgs("c", "e").returns("c=e");

		sEncoded = _Helper.buildQuery({a : "b", c : ["d", "e"]});
		assert.strictEqual(sEncoded, "?a=b&c=d&c=e");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery and decoding via URI.js", function (assert) {
		var sComplexString = "",
			i,
			mParameters = {},
			sUri;

		for (i = 32; i < 127; i += 1) {
			sComplexString = sComplexString + String.fromCharCode(i);
		}

		sUri = "/" + _Helper.buildQuery({foo : sComplexString});

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true).foo, sComplexString);

		mParameters[sComplexString] = "foo";
		sUri = "/" + _Helper.buildQuery(mParameters);

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true)[sComplexString], "foo");
	});

	//*********************************************************************************************
	QUnit.test("isSafeInteger", function (assert) {
		function localTest(sNumber, bValue) {
			assert.strictEqual(_Helper.isSafeInteger(sNumber), bValue, sNumber);
		}
		localTest(0, true);
		localTest((Math.pow(2, 53) - 1), true);
		localTest(Math.pow(2, 53), false);
		localTest(1 - Math.pow(2, 53), true);
		localTest(-Math.pow(2, 53), false);
		localTest("foo", false);
		localTest(3.14, false);
		localTest(null, false);
		localTest(undefined, false);
		localTest(NaN, false);
		localTest(Infinity, false);
		localTest(-Infinity, false);
	});

	//*********************************************************************************************
	QUnit.test("fireChange: no listeners", function (assert) {
		// code under test
		_Helper.fireChange({}, "path/to/property", {});
	});

	//*********************************************************************************************
	QUnit.test("fireChange: multiple listeners", function (assert) {
		var oChangeListener0 = {onChange : function () {}},
			oChangeListener1 = {onChange : function () {}},
			oChangeListener2 = {onChange : function () {}},
			vValue = {};

		this.mock(oChangeListener0).expects("onChange").withExactArgs(sinon.match.same(vValue));
		this.mock(oChangeListener1).expects("onChange").withExactArgs(sinon.match.same(vValue));
		this.mock(oChangeListener2).expects("onChange").withExactArgs(sinon.match.same(vValue));

		// code under test
		_Helper.fireChange({
				"path/to/property" : [oChangeListener0, oChangeListener1, oChangeListener2]
			}, "path/to/property", vValue);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRemove) {
		QUnit.test("fireChanges: null value, bRemove: " + bRemove, function (assert) {
			var mChangeListeners = {},
				oHelperMock = this.mock(_Helper),
				oValue = {Foo : null};

			oHelperMock.expects("fireChange")
				.withExactArgs(sinon.match.same(mChangeListeners), "path/to/object/Foo",
					bRemove ? undefined : null);
			oHelperMock.expects("fireChange")
				.withExactArgs(sinon.match.same(mChangeListeners), "path/to/object",
					bRemove ? undefined : sinon.match.same(oValue));

			// code under test
			_Helper.fireChanges(mChangeListeners, "path/to/object", oValue, bRemove);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatLiteral", function (assert) {
		assert.throws(function () {
			_Helper.formatLiteral();
		}, new Error("Illegal value: undefined"));

		assert.strictEqual(_Helper.formatLiteral(null), "null"); // type must not matter
	});

	//*********************************************************************************************
	// t: the tested type
	// v: the value to format
	// e: the literal (if different to v)
	[
		{t : "Edm.Binary", v : "1qkYNh/P5uvZ0zA+siScD=", l : "binary'1qkYNh/P5uvZ0zA+siScD='"},
		{t : "Edm.Boolean", v : true, l : "true"},
		{t : "Edm.Byte", v : 255, l : "255"},
		{t : "Edm.Date", v : "2016-01-19"},
		{t : "Edm.DateTimeOffset", v : "2016-01-13T14:08:31Z"},
		{t : "Edm.Decimal", v : "-255.55"},
		{t : "Edm.Double", v : 3.14, l : "3.14"},
		{t : "Edm.Double", v : "INF"},
		{t : "Edm.Duration", v : "P1DT0H0M0S", l : "duration'P1DT0H0M0S'"},
		{t : "Edm.Guid", v : "936DA01F-9ABD-4D9D-80C7-02AF85C822A8"},
		{t : "Edm.Int16", v : -32768, l : "-32768"},
		{t : "Edm.Int32", v : 2147483647, l : "2147483647"},
		{t : "Edm.Int64", v : "12345678901234568"},
		{t : "Edm.SByte", v : -128, l : "-128"},
		// Note: the internal representation of NaN/Infinity/-Infinity in the ODataModel
		// is "NaN", "INF" and "-INF".
		// That is how it comes from the server and it is not possible to change the model values
		// to the JS representation Infinity,-Infinity or NaN
		{t : "Edm.Single", v : "NaN"},
		{t : "Edm.Single", v : "-INF"},
		{t : "Edm.String", v : "foo", l : "'foo'"},
		{t : "Edm.String", v : "string with 'quote'", l : "'string with ''quote'''"},
		{t : "Edm.String", v : null, l : "null"},
		{t : "Edm.TimeOfDay", v : "18:59:59.999"}
	].forEach(function (oFixture) {
		var sTitle = "formatLiteral/parseLiteral: " + oFixture.t + " " +  oFixture.v;
		QUnit.test(sTitle, function (assert) {
			var sLiteral = oFixture.l || oFixture.v;

			assert.strictEqual(_Helper.formatLiteral(oFixture.v, oFixture.t), sLiteral);

			switch (oFixture.t) {
				case "Edm.Binary":
				case "Edm.Duration":
				case "Edm.String":
					// not supported
					break;
				default:
					assert.strictEqual(_Helper.parseLiteral(sLiteral, oFixture.t, "path"),
						oFixture.v);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("formatLiteral: error case", function (assert) {
		assert.throws(
			function () { _Helper.formatLiteral("foo", "Edm.bar"); },
			new Error("Unsupported type: Edm.bar")
		);
	});

	//*********************************************************************************************
	QUnit.test("parseLiteral: null", function (assert) {
		assert.strictEqual(_Helper.parseLiteral("null", "Any.Type"), null);
	});

	//*********************************************************************************************
	["Edm.Binary", "Edm.Duration", "Edm.String", "Edm.bar"].forEach(function (sType) {
		QUnit.test("parseLiteral: unsupported " + sType, function (assert) {
			assert.throws(function () {
				_Helper.parseLiteral("foo", sType, "path/to/property");
			}, new Error("path/to/property: Unsupported type: " + sType));
		});
	});

	//*********************************************************************************************
	// t: the tested type
	// l: the literal to parse
	[
		{t : "Edm.Byte", l : "ten"},
		{t : "Edm.Int16", l : "ten"},
		{t : "Edm.Int32", l : "ten"},
		{t : "Edm.SByte", l : "ten"},
		{t : "Edm.Double", l : "Pi"},
		{t : "Edm.Double", l : "Infinity"},
		{t : "Edm.Single", l : "Pi"},
		{t : "Edm.Single", l : "-Infinity"}
	].forEach(function (oFixture) {
		QUnit.test("parseLiteral: error: " + oFixture.t + " " +  oFixture.l, function (assert) {
			assert.throws(function () {
				_Helper.parseLiteral(oFixture.l, oFixture.t, "path/to/property");
			}, new Error("path/to/property: Not a valid " + oFixture.t + " literal: "
				+ oFixture.l));
		});
	});

	//*********************************************************************************************
	QUnit.test("buildPath", function (assert) {
		assert.strictEqual(_Helper.buildPath(), "");
		assert.strictEqual(_Helper.buildPath("base"), "base");
		assert.strictEqual(_Helper.buildPath("base", "relative"), "base/relative");
		assert.strictEqual(_Helper.buildPath("base", ""), "base");
		assert.strictEqual(_Helper.buildPath("", "relative"), "relative");
		assert.strictEqual(_Helper.buildPath("base", undefined, "relative"), "base/relative");
		assert.strictEqual(_Helper.buildPath("base", 42, "relative"), "base/42/relative");
		assert.strictEqual(_Helper.buildPath("base", 0, "relative"), "base/0/relative");
		assert.strictEqual(_Helper.buildPath("/", "relative"), "/relative");
		assert.strictEqual(_Helper.buildPath("/base", "relative"), "/base/relative");
		assert.strictEqual(_Helper.buildPath("base", "('predicate')"), "base('predicate')");
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: simple", function (assert) {
		var oCacheData = {
				"@$ui5._" : {predicate : "('1')"},
				DeliveryDate : null,
				SalesOrderItemID : "000100",
				Note : "old",
				AnotherNote : null
			},
			mChangeListeners = {},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "SO_2_SOITEM/Note", "new");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "SO_2_SOITEM/AnotherNote",
				"newAnotherNote");

		// code under test
		_Helper.updateExisting(mChangeListeners, "SO_2_SOITEM", oCacheData, {
			DeliveryDate : null,
			Note : "new",
			Foo : "bar",
			AnotherNote : "newAnotherNote"
		});

		assert.deepEqual(oCacheData, {
			"@$ui5._" : {predicate : "('1')"},
			DeliveryDate : null,
			SalesOrderItemID : "000100",
			Note : "new",
			AnotherNote : "newAnotherNote"
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: structured", function (assert) {
		var oAdvertisedAction = {title : "My Title"},
			oCacheData = {
				BusinessPartnerID : "42",
				Address : {
					City : "Walldorf",
					PostalCode : "69190"
				}
			},
			mChangeListeners = {},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("fireChange").withExactArgs(sinon.match.same(mChangeListeners),
			"SO_2_BP/Address/City", "Heidelberg");

		// code under test: update cache with the value the user entered
		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {
			Address : {
				City : "Heidelberg"
			}
		});

		assert.deepEqual(oCacheData, {
			BusinessPartnerID : "42",
			Address : {
				City : "Heidelberg",
				PostalCode : "69190"
			}
		});

		oHelperMock.expects("fireChange").withExactArgs(sinon.match.same(mChangeListeners),
			"SO_2_BP/Address/PostalCode", "69115");
		oHelperMock.expects("fireChanges").withExactArgs(sinon.match.same(mChangeListeners),
			"SO_2_BP/#foo.bar.AcBaz", sinon.match.same(oAdvertisedAction), false);

		// code under test: update cache with the patch result
		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {
			"#foo.bar.AcBaz" : oAdvertisedAction,
			BusinessPartnerID : "42",
			Address : {
				City : "Heidelberg",
				PostalCode : "69115"
			}
		});

		assert.deepEqual(oCacheData, {
			"#foo.bar.AcBaz" : oAdvertisedAction,
			BusinessPartnerID : "42",
			Address : {
				City : "Heidelberg",
				PostalCode : "69115"
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: changed advertised action", function (assert) {
		var oAdvertisedAction = {title : "My Title"},
			oCacheData = {"#foo.bar.AcBaz" : oAdvertisedAction},
			mChangeListeners = {},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("fireChange").withExactArgs(sinon.match.same(mChangeListeners),
			"SO_2_BP/#foo.bar.AcBaz/title", "My New Title");
		oHelperMock.expects("fireChanges").never();

		// code under test: update cache with the patch result
		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {
			"#foo.bar.AcBaz" : {title : "My New Title"}
		});

		assert.deepEqual(oCacheData, {
			"#foo.bar.AcBaz" : {title : "My New Title"}
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: removed advertised action", function (assert) {
		var oAdvertisedAction = {title : "My Title"},
			oCacheData = {"#foo.bar.AcBaz" : oAdvertisedAction},
			mChangeListeners = {},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("fireChanges").withExactArgs(sinon.match.same(mChangeListeners),
			"SO_2_BP/#foo.bar.AcBaz", sinon.match.same(oAdvertisedAction), true);

		// code under test: update cache with the patch result
		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {});

		assert.deepEqual(oCacheData, {
			"#foo.bar.AcBaz" : undefined
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: collection valued properties (messages)", function (assert) {
		var aNoMessages = [],
			aMessages = [{
				"code" : "42",
				"longtextUrl" : "any/URL",
				"message" : "message 1",
				"transition" : false,
				"target" : "Foo",
				"numericSeverity" : 3
			}, {
				"code" : "17",
				"longtextUrl" : "any/URL/2",
				"message" : "message 2",
				"transition" : true,
				"target" : "Bar",
				"numericSeverity" : 4
			}],
			sMessages,
			oCacheData = {
				BusinessPartnerID : "42",
				"__CT__FAKE__Message" : {
					"__FAKE__Messages" : aNoMessages
				}
			};

		aNoMessages.$count = aNoMessages.length;
		aMessages.$count = aMessages.length;
		sMessages = JSON.stringify(aMessages);

		// code under test
		_Helper.updateExisting(null, "SO_2_BP", oCacheData, {
			"__CT__FAKE__Message" : {
				"__FAKE__Messages" : aMessages
			}
		});

		assert.strictEqual(JSON.stringify(oCacheData["__CT__FAKE__Message"]["__FAKE__Messages"]),
			sMessages);
		assert.strictEqual(oCacheData["__CT__FAKE__Message"]["__FAKE__Messages"].$count, 2);

		// code under test
		_Helper.updateExisting({}, "SO_2_BP", oCacheData, {
			"__CT__FAKE__Message" : {
				"__FAKE__Messages" : aNoMessages
			}
		});

		assert.deepEqual(oCacheData["__CT__FAKE__Message"]["__FAKE__Messages"], []);
		assert.strictEqual(oCacheData["__CT__FAKE__Message"]["__FAKE__Messages"].$count, 0);

		//TODO change handling for collection valued properties (not supported yet)
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: remove structured attribute", function (assert) {
		var mChangeListeners = {
				"SO_2_BP/Address/City" : [{onChange : function () {}}],
				"SO_2_BP/Address/Foo/Bar" : [{onChange : function () {}}]
			},
			oCacheData = {
				BusinessPartnerID : "42",
				Address : {
					City : "Walldorf",
					PostalCode : "69190",
					Foo : {
						Bar : "Baz"
					}
				}
			};

		this.mock(mChangeListeners["SO_2_BP/Address/City"][0]).expects("onChange")
			.withExactArgs(undefined);
		this.mock(mChangeListeners["SO_2_BP/Address/Foo/Bar"][0]).expects("onChange")
			.withExactArgs(undefined);

		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {
			BusinessPartnerID : "42",
			Address : null
		});

		assert.deepEqual(oCacheData, {
			BusinessPartnerID : "42",
			Address : null
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: add structured attribute", function (assert) {
		var mChangeListeners = {
				"SO_2_BP/Address/City" : [{onChange : function () {}}],
				"SO_2_BP/Address/Foo/Bar" : [{onChange : function () {}}]
			},
			oCacheData = {
				BusinessPartnerID : "42",
				Address : null
			};

		this.mock(mChangeListeners["SO_2_BP/Address/City"][0]).expects("onChange")
			.withExactArgs("Walldorf");
		this.mock(mChangeListeners["SO_2_BP/Address/Foo/Bar"][0]).expects("onChange")
			.withExactArgs("Baz");

		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {
			BusinessPartnerID : "42",
			Address : {
				City : "Walldorf",
				PostalCode : "69190",
				Foo : {
					Bar : "Baz"
				}
			}
		});

		assert.deepEqual(oCacheData, {
			BusinessPartnerID : "42",
			Address : {
				City : "Walldorf",
				PostalCode : "69190",
				Foo : {
					Bar : "Baz"
				}
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: check cache value in change handler", function (assert) {
		var oCacheData = {
				BusinessPartnerID : "42",
				Address : {
					City : "Walldorf",
					Foo : {
						Bar : "Baz"
					}
				}
			},
			mChangeListeners = {
				"SO_2_BP/Address/City" : [{onChange : function () {
					assert.strictEqual(oCacheData.Address.City, "St. Ingbert");
				}}],
				"SO_2_BP/Address/Foo/Bar" : [{onChange : function () {
					assert.strictEqual(oCacheData.Address.Foo, null);
				}}]
			};

		// code under test
		_Helper.updateExisting(mChangeListeners, "SO_2_BP", oCacheData, {
			BusinessPartnerID : "42",
			Address : {
				City : "St. Ingbert",
				Foo : null
			}
		});

		assert.deepEqual(oCacheData, {
			BusinessPartnerID : "42",
			Address : {
				City : "St. Ingbert",
				Foo :  null
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("updateExisting: empty value from PATCH response", function (assert) {
		var oCacheData = {
				SalesOrderItemID : "000100"
			};

		// code under test
		_Helper.updateExisting({/*mChangeListeners*/}, "SO_2_SOITEM", oCacheData,
			/*empty PATCH response*/undefined);

		assert.deepEqual(oCacheData, {
			SalesOrderItemID : "000100"
		});
	});

	//*********************************************************************************************
	QUnit.test("toArray", function (assert) {
		var oObject = {},
			aObjects = [oObject];

		assert.deepEqual(_Helper.toArray(), []);
		assert.deepEqual(_Helper.toArray(null), []);
		assert.deepEqual(_Helper.toArray(""), [""]);
		assert.deepEqual(_Helper.toArray("foo"), ["foo"]);
		assert.deepEqual(_Helper.toArray(oObject), aObjects);
		assert.strictEqual(_Helper.toArray(aObjects), aObjects);
	});

	//*********************************************************************************************
	// Integration tests with real backend
	if (TestUtils.isRealOData()) {
		QUnit.test("Integration test for formatLiteral", function (assert) {
			var done = assert.async(),
			sResolvedServiceUrl = TestUtils.proxy(
				"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/");

			jQuery.ajax(sResolvedServiceUrl + "BusinessPartnerList?"
				+ "$filter=CompanyName eq + " + _Helper.formatLiteral("Becker Berlin", "Edm.String")
				, { method : "GET"}
			).then(function (oData, sTextStatus, jqXHR) {
				assert.strictEqual(oData.value[0].CompanyName, "Becker Berlin");
				done();
			});
		});
	}

	//*********************************************************************************************
	[{
		sKeyPredicate : "('4%2F2')",
		mKeyProperties : {"ID" : "'4/2'"}
	}, {
		sKeyPredicate : "(Bar=42,Fo%3Do='Walter%22s%20Win''s')",
		mKeyProperties : {"Bar" : "42","Fo=o" : "'Walter\"s Win''s'"}
	}, {
		sKeyPredicate: undefined,
		mKeyProperties: undefined
	}].forEach(function (oFixture) {
		QUnit.test("getKeyPredicate: " + oFixture.sKeyPredicate, function (assert) {
			var oEntityInstance = {},
				sMetaPath = "~path~",
				mTypeForMetaPath = {};

			this.mock(_Helper).expects("getKeyProperties")
				.withExactArgs(sinon.match.same(oEntityInstance), sMetaPath,
					sinon.match.same(mTypeForMetaPath), true)
				.returns(oFixture.mKeyProperties);

			// code under test
			assert.strictEqual(
				_Helper.getKeyPredicate(oEntityInstance, sMetaPath, mTypeForMetaPath),
				oFixture.sKeyPredicate);
		});
	});

	//*********************************************************************************************
	[{
		oEntityInstance : {"ID" : "42"},
		oEntityType : {
			"$Key" : ["ID"],
			"ID" : {
				"$Type" : "Edm.String"
			}
		},
		mKeyProperties : {"ID" : "'42'"}
	}, {
		oEntityInstance : {
			"Bar" : 42,
			"Fo=o" : "Walter\"s Win's",
			"Baz" : "foo"
		},
		oEntityType : {
			"$Key" : ["Bar", "Fo=o"],
			"Bar" : {
				"$Type" : "Edm.Int16"
			},
			"Fo=o" : {
				"$Type" : "Edm.String"
			}
		},
		mKeyProperties : {
			"Bar" : "42",
			"Fo=o" : "'Walter\"s Win''s'"
		}
	}, {
		oEntityInstance : {},
		oEntityType : {
			"$Key" : ["ID"],
			"ID" : {
				"$Type" : "Edm.String"
			}
		},
		mKeyProperties : undefined
	}].forEach(function (oFixture) {
		QUnit.test("getKeyProperties: " + oFixture.mKeyProperties, function (assert) {
			this.spy(_Helper, "formatLiteral");

			// code under test
			assert.deepEqual(
				_Helper.getKeyProperties(oFixture.oEntityInstance, "~path~", {
					"~path~" : oFixture.oEntityType
				}),
				oFixture.mKeyProperties);

			// check that formatPropertyAsLiteral() is called for each key property
			oFixture.oEntityType.$Key.forEach(function (sProperty) {
				if (sProperty in oFixture.oEntityInstance) {
					sinon.assert.calledWithExactly(_Helper.formatLiteral,
						sinon.match.same(oFixture.oEntityInstance[sProperty]),
						sinon.match.same(oFixture.oEntityType[sProperty].$Type));
				}
			});
		});
	});

	//*********************************************************************************************
	[{
		oResult : {"qux" : "~1", "bar/baz" : "~2"},
		bReturnAlias : false
	}, {
		oResult : {qux : "~1", foo : "~2"},
		bReturnAlias : true
	}].forEach(function (oFixture) {
		QUnit.test("getKeyProperties: bReturnAlias=" + oFixture.bReturnAlias, function (assert) {
			var oComplexType = {
					"baz": {
						"$kind": "Property",
						"$Type": "Edm.Int16"
					}
				},
				oEntityInstance = {},
				oEntityType = {
					"$Key": ["qux", {"foo": "bar/baz"}],
					"qux": {
						"$kind": "Property",
						"$Type": "Edm.String"
					}
				},
				oHelperMock = this.mock(_Helper),
				sMetaPath = "~path~",
				mTypeForMetaPath = {
					"~path~": oEntityType,
					"~path~/bar": oComplexType
				};

			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oEntityInstance), ["qux"]).returns("v1");
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oEntityInstance), ["bar", "baz"]).returns("v2");
			oHelperMock.expects("formatLiteral").withExactArgs("v1", "Edm.String").returns("~1");
			oHelperMock.expects("formatLiteral").withExactArgs("v2", "Edm.Int16").returns("~2");

			// code under test
			assert.deepEqual(_Helper.getKeyProperties(oEntityInstance, sMetaPath, mTypeForMetaPath,
				oFixture.bReturnAlias), oFixture.oResult);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bReturnAlias) {
		QUnit.test("getKeyProperties throws, bReturnAlias = " + bReturnAlias, function (assert) {
			assert.throws(function () {
				// code under test
				_Helper.getKeyProperties({}, "~path~", {"~path~" : {/*no $Key*/}}, bReturnAlias);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getKeyFilter", function (assert) {
		var oHelperMock = this.mock(_Helper),
			oInstance = {},
			sMetaPath = {/*meta path*/},
			mTypeForMetaPath = {};

		oHelperMock.expects("getKeyProperties")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(sMetaPath),
				sinon.match.same(mTypeForMetaPath))
			.returns({key : 42});

		assert.strictEqual(
			// code under test
			_Helper.getKeyFilter(oInstance, sMetaPath, mTypeForMetaPath),
			"key eq 42");

		oHelperMock.expects("getKeyProperties")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(sMetaPath),
				sinon.match.same(mTypeForMetaPath))
			.returns({key1 : "'a'", key2 : "'b'"});

		assert.strictEqual(
			// code under test
			_Helper.getKeyFilter(oInstance, sMetaPath, mTypeForMetaPath),
			"key1 eq 'a' and key2 eq 'b'");

		oHelperMock.expects("getKeyProperties")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(sMetaPath),
				sinon.match.same(mTypeForMetaPath))
			.returns(undefined); // at least one key property is undefined

		assert.strictEqual(
			// code under test
			_Helper.getKeyFilter(oInstance, sMetaPath, mTypeForMetaPath),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("namespace", function (assert) {
		assert.strictEqual(_Helper.namespace("Products"), "");
		assert.strictEqual(_Helper.namespace("zui5_epm_sample.Products"), "zui5_epm_sample");
		assert.strictEqual(_Helper.namespace("zui5_epm_sample.v1.Products"), "zui5_epm_sample.v1");
		assert.strictEqual(_Helper.namespace("zui5_epm_sample.v1.Products/Category/type.cast"),
			"zui5_epm_sample.v1");
	});

	//*********************************************************************************************
	QUnit.test("updateSelected: simple/complex and not wanted properties", function (assert) {
		var oCacheBefore = {
				"@odata.etag" : "Old ETag",
				Address : {
					City : "Walldorf"
				},
				ComplexNullable : null
			},
			oCacheAfter = {
				"@$ui5._" : {
					predicate : "('4711')"
				},
				"@odata.etag" : "New ETag",
				PartnerId : "4711",
				Address : {
					City : "Walldorf",
					GeoLocation : {
						Latitude : "49.3",
						Longitude : "8.6"
					},
					PostalCode : "69190",
					Nullable : null
				},
				ComplexNullable : {
					bar : null,
					baz : null,
					foo : "foo"
				}
			},
			oChangeListener = {},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/Address/GeoLocation/Latitude", "49.3");
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/Address/GeoLocation/Longitude", "8.6");
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/Address/Nullable", null);
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/Address/PostalCode", "69190");
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/ComplexNullable/bar", null);
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/ComplexNullable/foo", "foo");
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/PartnerId", "4711");
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/@$ui5._/predicate", "('4711')").never();
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/@odata.etag", "New ETag");

		// code under test
		_Helper.updateSelected(oChangeListener, "SO_2_BP", oCacheBefore, {
			"@$ui5._" : {
				predicate : "('4711')"
			},
			"@odata.etag" : "New ETag",
			PartnerId : "4711",
			Address : {
				City : "Walldorf",
				GeoLocation : {
					Latitude : "49.3",
					Longitude : "8.6"
				},
				notWanted : "foo",
				Nullable : null,
				PostalCode : "69190"
			},
			ComplexNullable : {
				bar : null,
				baz : null,
				foo : "foo"
			},
			notWanted : "bar"
		}, [
			"Address/City",
			"Address/Foo/Bar",
			"Address/GeoLocation/Latitude",
			"Address/GeoLocation/Longitude",
			"Address/Nullable",
			"Address/PostalCode",
			"ComplexNullable/bar",
			"ComplexNullable/baz/belowBaz",
			"ComplexNullable/foo",
			"PartnerId"
		]);

		assert.deepEqual(oCacheBefore, oCacheAfter);

		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/CompanyName", "SAP");
		oHelperMock.expects("fireChange")
			.withExactArgs(oChangeListener, "SO_2_BP/@$ui5._/predicate", "('4711')").never();
		oCacheBefore = {};
		oCacheAfter = {CompanyName : "SAP"};

		// code under test (without predicate)
		_Helper.updateSelected(oChangeListener, "SO_2_BP", oCacheBefore, {CompanyName : "SAP" },
			["CompanyName"]);

		assert.deepEqual(oCacheBefore, oCacheAfter);
	});

	//*********************************************************************************************
	QUnit.test("updateSelected", function (assert) {
		var mChangeListener = {},
			oHelperMock = this.mock(_Helper),
			oNewValue = {
				"@odata.etag" : "new",
				"@$ui5._" : {
					predicate : "('1')",
					ignore : true
				},
				changed : "new",
				unchanged : "same",
				fromNull : "new",
				toNull : null,
				unselected : "new",
				collection : [],
				nested : {
					changed : "new",
					unchanged : "same",
					fromNull : "new",
					toNull : null,
					unselected : "new"
				},
				structuredFromNull : {
					changed : "new",
					toNull : null,
					nested : {
						changed : "new"
					},
					structuredToNull : null,
					unselected : "new",
					collection : []
				},
				structuredNull : null,
				structuredToNull : null
			},
			oOldValue = {
				"@odata.etag" : "old",
				changed : "old",
				unchanged : "same",
				fromNull : null,
				toNull : "old",
				collection : [],
				nested : {
					changed : "old",
					unchanged : "same",
					fromNull : null,
					toNull : "old"
				},
				structuredFromNull : null,
				structuredNull : null,
				structuredToNull : {
					changed : "old",
					fromNull : null,
					nested : {
						changed : "old"
					}
				}
			},
			aSelect = [
				"changed",
				"collection",
				"fromNull",
				"toNull",
				"unchanged",
				"nested/changed",
				"nested/fromNull",
				"nested/toNull",
				"nested/unchanged",
				"structuredFromNull/changed",
				"structuredFromNull/collection",
				"structuredFromNull/toNull",
				"structuredFromNull/structuredToNull/unseen",
				"structuredFromNull/nested/changed",
				"structuredNull/unseen",
				"structuredToNull/changed",
				"structuredToNull/fromNull",
				"structuredToNull/nested/changed",
				"structuredToNull/nested/unseen"
			],
			oUpdatedValue = {
				"@odata.etag" : "new",
				"@$ui5._" : {predicate : "('1')"},
				changed : "new",
				unchanged : "same",
				fromNull : "new",
				toNull : null,
				collection : [],
				nested : {
					changed : "new",
					unchanged : "same",
					fromNull : "new",
					toNull : null
				},
				structuredFromNull : {
					changed : "new",
					toNull : null,
					collection : [],
					nested : {
						changed : "new"
					},
					structuredToNull : null
				},
				structuredNull : null,
				structuredToNull : null
			};

		function expectChange(sPath, vValue) {
			oHelperMock.expects("fireChange")
				.withExactArgs(sinon.match.same(mChangeListener), "base/path/" + sPath, vValue);
		}

		expectChange("@odata.etag", "new");
		expectChange("changed", "new");
		expectChange("fromNull", "new");
		expectChange("toNull", null);
		expectChange("nested/changed", "new");
		expectChange("nested/fromNull", "new");
		expectChange("nested/toNull", null);
		expectChange("structuredFromNull/changed", "new");
		expectChange("structuredFromNull/toNull", null);
		expectChange("structuredFromNull/nested/changed", "new");
		expectChange("structuredToNull", undefined); // side effect from _Helper.fireChanges
		expectChange("structuredToNull/changed", undefined);
		expectChange("structuredToNull/fromNull", undefined);
		expectChange("structuredToNull/nested", undefined); // side effect from _Helper.fireChanges
		expectChange("structuredToNull/nested/changed", undefined);

		// code under test
		_Helper.updateSelected(mChangeListener, "base/path", oOldValue, oNewValue, aSelect);

		assert.deepEqual(oOldValue, oUpdatedValue);
		assert.strictEqual(oOldValue.collection, oNewValue.collection);
		assert.strictEqual(oOldValue.structuredFromNull.collection,
			oNewValue.structuredFromNull.collection);
	});

	//*********************************************************************************************
	QUnit.test("updateSelected: no predicate", function (assert) {
		var oCache = {foo : "bar"};

		_Helper.updateSelected({}, "base/path", oCache, {foo : "baz"}, ["foo"]);

		assert.deepEqual(oCache, {foo : "baz"});
	});

	//*********************************************************************************************
	QUnit.test("updateSelected: update all", function (assert) {
		var mChangeListeners = {},
			oSource = {},
			oTarget = {};

		this.mock(_Helper).expects("updateAll").twice()
			.withExactArgs(sinon.match.same(mChangeListeners), "base/path",
				sinon.match.same(oTarget), sinon.match.same(oSource));

		// code under test
		_Helper.updateSelected(mChangeListeners, "base/path", oTarget, oSource);
		_Helper.updateSelected(mChangeListeners, "base/path", oTarget, oSource,
			["foo", "bar", "*", "baz"]);
	});

	//*********************************************************************************************
	QUnit.test("updateAll: properties", function (assert) {
		var mChangeListeners = {},
			oHelperMock = this.mock(_Helper),
			oSource = {
				"@$ui5._" : {
					predicate : "('1')",
					ignore : true
				},
				changed : "new",
				fromNull : "new",
				unchanged : "same"
			},
			oTarget = {
				changed : "old",
				fromNull : null,
				unchanged : "same"
			},
			oUpdatedTarget = {
				"@$ui5._" : {predicate : "('1')"},
				changed : "new",
				fromNull : "new",
				unchanged : "same"
			};

		oHelperMock.expects("buildPath").withExactArgs("path", "@$ui5._");
		oHelperMock.expects("buildPath").withExactArgs("path", "changed").returns("~changed");
		oHelperMock.expects("buildPath").withExactArgs("path", "fromNull").returns("~fromNull");
		oHelperMock.expects("buildPath").withExactArgs("path", "unchanged");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "~changed", "new");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "~fromNull", "new");

		// code under test
		_Helper.updateAll(mChangeListeners, "path", oTarget, oSource);

		assert.deepEqual(oTarget, oUpdatedTarget);
	});

	//*********************************************************************************************
	QUnit.test("updateAll: recursion", function (assert) {
		var aAdded = [],
			mChangeListeners = {},
			oHelperMock = this.mock(_Helper),
			oSource = {
				updated : {},
				added : {}
			},
			oTarget = {
				updated : {}
			};

		oHelperMock.expects("updateAll") // obviously :-)
			.withExactArgs(sinon.match.same(mChangeListeners), "path", sinon.match.same(oTarget),
				sinon.match.same(oSource))
			.callThrough();
		oHelperMock.expects("buildPath").withExactArgs("path", "updated").returns("~updated");
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(mChangeListeners), "~updated",
				sinon.match.same(oTarget.updated), sinon.match.same(oSource.updated));
		oHelperMock.expects("buildPath").withExactArgs("path", "added").returns("~added");
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(mChangeListeners), "~added", {},
				sinon.match.same(oSource.added))
			.returns(aAdded);

		// code under test
		_Helper.updateAll(mChangeListeners, "path", oTarget, oSource);

		assert.strictEqual(oTarget.added, aAdded);
	});

	//*********************************************************************************************
	QUnit.test("updateAll: source property is null", function (assert) {
		var mChangeListeners = {},
			oHelperMock = this.mock(_Helper),
			oSource = {
				changed : null,
				unchanged : null,
				structure : null
			},
			oTarget = {
				changed : "old",
				unchanged : null,
				structure : {}
			};

		oHelperMock.expects("buildPath").withExactArgs("path", "changed").returns("~changed");
		oHelperMock.expects("buildPath").withExactArgs("path", "unchanged");
		oHelperMock.expects("buildPath").withExactArgs("path", "structure").returns("~structure");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "~changed", null);
		oHelperMock.expects("fireChanges")
			.withExactArgs(sinon.match.same(mChangeListeners), "~structure",
				sinon.match.same(oTarget.structure), true);

		// code under test
		_Helper.updateAll(mChangeListeners, "path", oTarget, oSource);

		assert.deepEqual(oTarget, oSource);
	});

	//*********************************************************************************************
	QUnit.test("updateAll: array", function (assert) {
		var mChangeListeners = {},
			oSource = {
				array : []
			},
			oTarget = {};

		this.mock(_Helper).expects("fireChange").never();

		// code under test
		_Helper.updateAll(mChangeListeners, "path", oTarget, oSource);

		assert.strictEqual(oTarget.array, oSource.array);
	});

	//*********************************************************************************************
	QUnit.test("updateAll: add/change advertised action", function (assert) {
		var mChangeListeners = {},
			oHelperMock = this.mock(_Helper),
			oSource = {
				"#added" : {value : "new"},
				"#changed" : {value : "new"}
			},
			oTarget = {
				"#changed" : {value : "old"}
			};

		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/#added/value", "new");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/#changed/value", "new");

		// code under test
		_Helper.updateAll(mChangeListeners, "path", oTarget, oSource);

		assert.deepEqual(oTarget, oSource);
	});

	//*********************************************************************************************
	QUnit.test("informAll: comparison of old and new value fires all events", function (assert) {
		var mChangeListeners = {},
			oHelperMock = this.mock(_Helper),
			oNew = {
				add : "new",
				changed : "changed",
				deep : {
					add : "new",
					blank : {
						add : "new"
					},
					changed : "changed",
					unchanged : "same"
				},
				getDeep : {
					inside : "value"
				},
				getFlat : "now",
				unchanged : "same"
			},
			oOld = {
				changed : "init",
				deep : {
					changed : "init",
					deepOld : {},
					old : "old",
					unchanged : "same"
				},
				getDeep : "value",
				getFlat : {
					inside : "any"
				},
				old : "old",
				unchanged : "same"
			},
			sUnchangedNew = JSON.stringify(oNew),
			sUnchangedOld = JSON.stringify(oOld);

		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/add", "new");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/changed", "changed");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/add", "new");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/blank/add", "new");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/changed", "changed");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/deepOld", null);
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/old", null);
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/getDeep/inside", "value");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/getFlat", "now");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/getFlat/inside", null);
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/old", null);

		// code under test
		_Helper.informAll(mChangeListeners, "path", oOld, oNew);

		// assertion - no change on the old and the new value
		assert.strictEqual(JSON.stringify(oOld), sUnchangedOld);
		assert.strictEqual(JSON.stringify(oNew), sUnchangedNew);
	});

	//*********************************************************************************************
	QUnit.test("makeAbsolute", function (assert) {
		assert.strictEqual(_Helper.makeAbsolute("/foo/bar", "/baz"), "/foo/bar");
		assert.strictEqual(_Helper.makeAbsolute("baz", "/foo/bar"), "/foo/baz");
		assert.strictEqual(_Helper.makeAbsolute("Foo('1')/Bar(baz='2',qux=3)", "/service/"),
			"/service/Foo('1')/Bar(baz='2',qux=3)");
	});

	//*********************************************************************************************
	QUnit.test("drillDown", function (assert) {
		var oObject = {
				"foo" : "bar",
				"bar" : {
					"baz" : "qux"
				},
				"null" : null
			};

		assert.strictEqual(_Helper.drillDown(oObject, []), oObject);
		assert.strictEqual(_Helper.drillDown(oObject, ["foo"]), "bar");
		assert.strictEqual(_Helper.drillDown(oObject, ["bar", "baz"]), "qux");
		assert.strictEqual(_Helper.drillDown(oObject, ["unknown"]), undefined);
		assert.strictEqual(_Helper.drillDown(oObject, ["unknown", "value"]), undefined);
		assert.strictEqual(_Helper.drillDown(oObject, ["null"]), null);
		assert.strictEqual(_Helper.drillDown(oObject, ["null", "value"]), undefined);
	});

	//*********************************************************************************************
	[{
		dataPath : "/Foo",
		metaPath : "/Foo"
	}, { // e.g. function call plus key predicate
		dataPath : "/Foo/name.space.bar_42(key='value')(key='value')",
		metaPath : "/Foo/name.space.bar_42"
	}, {
		dataPath : "/Foo(key='value')(key='value')/bar",
		metaPath : "/Foo/bar"
	}, { // any segment with digits only
		dataPath : "/Foo/" + Date.now(),
		metaPath : "/Foo"
	}, {
		dataPath : "/Foo/" + Date.now() + "/bar",
		metaPath : "/Foo/bar"
	}, { // global removal needed
		dataPath : "/Foo(key='value')/" + Date.now() + "/bar(key='value')/"  + Date.now(),
		metaPath : "/Foo/bar"
	}, { // transient entity
		dataPath : "/Foo($uid=id-1-23)/bar",
		metaPath : "/Foo/bar"
	}, { // empty path
		dataPath : "",
		metaPath : ""
	}, { // relative with key predicate
		dataPath : "Foo('42')",
		metaPath : "Foo"
	}, { // relative, only key predicate
		dataPath : "('42')",
		metaPath : ""
	}, { // relative, leading key predicate
		dataPath : "('42')/bar",
		metaPath : "bar"
	}, { // relative, only index
		dataPath : "42",
		metaPath : ""
	}, { // relative, leading index
		dataPath : "42/bar",
		metaPath : "bar"
	}].forEach(function (oFixture) {
		QUnit.test("getMetaPath: " + oFixture.dataPath, function (assert) {
			var sMetaPath = _Helper.getMetaPath(oFixture.dataPath);

			assert.strictEqual(sMetaPath, oFixture.metaPath);
		});
	});
	//TODO $all, $count, $crossjoin, $ref, $value
	// Q: Do we need to keep signatures to resolve overloads?
	// A: Most probably not. The spec says "All bound functions with the same function name and
	//    binding parameter type within a namespace MUST specify the same return type."
	//    "All unbound functions with the same function name within a namespace MUST specify the
	//    same return type." --> We can find the return type (from the binding parameter type).
	//    If it comes to annotations, the signature might make a difference, but then "unordered
	//    set of (non-binding) parameter names" is unique.

	//*********************************************************************************************
	QUnit.test("clone", function (assert) {
		var vClone = {},
			oJsonMock = this.mock(JSON),
			sStringified = "{}",
			vValue = {};

		// code under test
		assert.strictEqual(_Helper.clone(null), null);

		oJsonMock.expects("stringify").withExactArgs(sinon.match.same(vValue))
			.returns(sStringified);
		oJsonMock.expects("parse").withExactArgs(sStringified).returns(vClone);

		// code under test
		assert.strictEqual(_Helper.clone(vValue), vClone);

		// code under test
		assert.strictEqual(_Helper.clone(undefined), undefined);

		// code under test
		assert.ok(isNaN(_Helper.clone(NaN)));

		// code under test
		assert.strictEqual(_Helper.clone(Infinity), Infinity);

		// code under test
		assert.strictEqual(_Helper.clone(-Infinity), -Infinity);
	});

	//*********************************************************************************************
	QUnit.test("getPrivateAnnotation", function (assert) {
		var oObject = {
				"@$ui5._" : {
					"transient" : "foo"
				}
			};

		assert.strictEqual(_Helper.getPrivateAnnotation({}, "foo"), undefined);
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "foo"), undefined);
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "transient"), "foo");
	});

	//*********************************************************************************************
	QUnit.test("hasPrivateAnnotation", function (assert) {
		var oObject = {
				"@$ui5._" : {
					"transient" : undefined
				}
			};

		assert.strictEqual(_Helper.hasPrivateAnnotation({}, "foo"), false);
		assert.strictEqual(_Helper.hasPrivateAnnotation(oObject, "foo"), false);
		assert.strictEqual(_Helper.hasPrivateAnnotation(oObject, "transient"), true);
	});

	//*********************************************************************************************
	QUnit.test("setPrivateAnnotation", function (assert) {
		var oObject = {};

		// code under test
		_Helper.setPrivateAnnotation(oObject, "transient", "foo");

		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "transient"), "foo");

		// code under test
		_Helper.setPrivateAnnotation(oObject, "transient", "bar");

		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "transient"), "bar");
	});

	//*********************************************************************************************
	QUnit.test("deletePrivateAnnotation", function (assert) {
		var oObject = {};

		// code under test
		_Helper.deletePrivateAnnotation(oObject, "transient");

		// code under test
		_Helper.setPrivateAnnotation(oObject, "transient", undefined);

		assert.strictEqual(_Helper.hasPrivateAnnotation(oObject, "transient"), true);
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "transient"), undefined);

		// code under test
		_Helper.deletePrivateAnnotation(oObject, "transient");

		assert.strictEqual(_Helper.hasPrivateAnnotation(oObject, "transient"), false);
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "transient"), undefined);
	});

	//*********************************************************************************************
	[undefined, null, {"@$ui5._" : {}}].forEach(function (vClone, i) {
		QUnit.test("publicClone: " + i, function (assert) {
			var vValue = {};

			this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(vValue))
				.returns(vClone);

			// code under test
			assert.strictEqual(_Helper.publicClone(vValue), vClone);

			if (vClone) {
				assert.notOk("@$ui5._" in vClone, "private namespace object deleted from clone");
			}
		});
	});

	//*********************************************************************************************
	[{
		mHeaders : {},
		mResolvedHeader : {}
	}, {
		mHeaders : {"If-Match" : "foo"},
		mResolvedHeader : {"If-Match" : "foo"}
	}, {
		mHeaders : undefined,
		mResolvedHeader : undefined
	}, {
		mHeaders : {"If-Match" : null},
		mResolvedHeader : {"If-Match" : null}
	}].forEach(function (oFixture, i) {
		QUnit.test("resolveIfMatchHeader: no clone - " + i, function (assert) {
			var mResolvedHeaders;

			// code under test
			mResolvedHeaders = _Helper.resolveIfMatchHeader(oFixture.mHeaders);

			assert.strictEqual(mResolvedHeaders, oFixture.mHeaders);
			assert.deepEqual(mResolvedHeaders, oFixture.mResolvedHeader);
		});
	});

	//*********************************************************************************************
	[{
		mHeaders : {"If-Match" : {}},
		mResolvedHeader : {}
	}, {
		mHeaders : {"If-Match" : {"@odata.etag" : "foo"}},
		mResolvedHeader : {"If-Match" : "foo"}
	}, {
		mHeaders : {"If-Match" : {"@odata.etag" : ""}},
		mResolvedHeader : {"If-Match" : ""}
	}].forEach(function (oFixture, i) {
		QUnit.test("resolveIfMatchHeader: copy on write - " + i, function (assert) {
			var mResolvedHeaders;

			// code under test
			mResolvedHeaders = _Helper.resolveIfMatchHeader(oFixture.mHeaders);

			assert.notStrictEqual(mResolvedHeaders, oFixture.mHeaders);
			assert.deepEqual(mResolvedHeaders, oFixture.mResolvedHeader);
		});
	});

	//*********************************************************************************************
	[{
		sTransientPredicate : "($uid=1)",
		mExpectedMap : {
			"('23')/Team_Id" : ["listener0"],
			"('23')/Name" : ["listener1"],
			"('23')/TEAM_2_EMPLOYEES($uid=2)/EMPLOYEE_2_EQUIPMENTS($uid=4)/ID" : ["listener2"],
			"('23')/TEAM_2_EMPLOYEES($uid=2)/EMPLOYEE_2_EQUIPMENTS($uid=4)/Category"
				: ["listener3"],
			"('23')/TEAM_2_EMPLOYEES($uid=2)/ID" : ["listener4"],
			"('23')/TEAM_2_EMPLOYEES('47')/ID" : ["listener5"],
			"('42')/Team_Id" : ["listener6"],
			"('42')/Name" : ["listener7"],
			"('42')/TEAM_2_EMPLOYEES($uid=3)/ID" : ["listener8"]
		}
	}, {
		sTransientPredicate : "($uid=2)",
		mExpectedMap : {
			"($uid=1)/Team_Id" : ["listener0"],
			"($uid=1)/Name" : ["listener1"],
			"($uid=1)/TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS($uid=4)/ID" : ["listener2"],
			"($uid=1)/TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS($uid=4)/Category"
				: ["listener3"],
			"($uid=1)/TEAM_2_EMPLOYEES('23')/ID" : ["listener4"],
			"($uid=1)/TEAM_2_EMPLOYEES('47')/ID" : ["listener5"],
			"('42')/Team_Id" : ["listener6"],
			"('42')/Name" : ["listener7"],
			"('42')/TEAM_2_EMPLOYEES($uid=3)/ID" : ["listener8"]
		}
	}].forEach(function (oFixture) {
		var sTitle = "update transient path, transient predicate: " + oFixture.sTransientPredicate;

		QUnit.test(sTitle, function (assert) {
			var mMap = {
					"($uid=1)/Team_Id" : ["listener0"],
					"($uid=1)/Name" : ["listener1"],
					"($uid=1)/TEAM_2_EMPLOYEES($uid=2)/EMPLOYEE_2_EQUIPMENTS($uid=4)/ID"
						: ["listener2"],
					"($uid=1)/TEAM_2_EMPLOYEES($uid=2)/EMPLOYEE_2_EQUIPMENTS($uid=4)/Category"
						: ["listener3"],
					"($uid=1)/TEAM_2_EMPLOYEES($uid=2)/ID" : ["listener4"],
					"($uid=1)/TEAM_2_EMPLOYEES('47')/ID" : ["listener5"],
					"('42')/Team_Id" : ["listener6"],
					"('42')/Name" : ["listener7"],
					"('42')/TEAM_2_EMPLOYEES($uid=3)/ID" : ["listener8"]
				};

			// code under test
			_Helper.updateTransientPaths(mMap, oFixture.sTransientPredicate, "('23')");

			assert.deepEqual(mMap, oFixture.mExpectedMap);
		});
	});

	//*********************************************************************************************
	QUnit.test("addByPath", function (assert) {
		var mMap = {};

		_Helper.addByPath(mMap, "path1", "item1");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		_Helper.addByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"], "path2" : ["item2"]});

		_Helper.addByPath(mMap, "path3", undefined);
		assert.deepEqual(mMap, {"path1" : ["item1"], "path2" : ["item2"]});

		_Helper.addByPath(mMap, "path1", "item3");
		assert.deepEqual(mMap, {"path1" : ["item1", "item3"], "path2" : ["item2"]});

		_Helper.addByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1", "item3"], "path2" : ["item2"]});
	});

	//*********************************************************************************************
	QUnit.test("removeByPath", function (assert) {
		var mMap = {"path1": ["item1", "item2"]};

		_Helper.removeByPath(mMap, "path1", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		_Helper.removeByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		_Helper.removeByPath(mMap, "path1", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		_Helper.removeByPath(mMap, "path1", "item1");
		assert.deepEqual(mMap, {});
	});

	//*********************************************************************************************
	[{
		aChildren : [],
		aAncestors : [],
		mChildren : {}
	}, {
		aChildren : ["A"],
		aAncestors : ["B"],
		mChildren : {}
	}, {
		aChildren : ["A", "B"],
		aAncestors : ["C", "A"],
		mChildren : {"A" : true}
	}, {
		aChildren : ["Address/City"],
		aAncestors : ["Address"],
		mChildren : {"Address/City" : true}
	}, {
		aChildren : ["Address/City/Block"],
		aAncestors : ["Address"],
		mChildren : {"Address/City/Block" : true}
	}, {
		aChildren : ["Address/City/Block"],
		aAncestors : ["Address/City"],
		mChildren : {"Address/City/Block" : true}
	}].forEach(function (o, i) {
		QUnit.test("addChildrenWithAncestor: " + i, function (assert) {
			var sAncestors = JSON.stringify(o.aAncestors),
				mChildren = {},
				sChildren = JSON.stringify(o.aChildren);

			// code under test
			assert.strictEqual(
				_Helper.addChildrenWithAncestor(o.aChildren, o.aAncestors, mChildren),
				undefined, "no return value");

			assert.deepEqual(mChildren, o.mChildren);
			assert.strictEqual(JSON.stringify(o.aAncestors), sAncestors, "children unmodified");
			assert.strictEqual(JSON.stringify(o.aChildren), sChildren, "ancestors unmodified");
		});
	});

	//*********************************************************************************************
	QUnit.test("addChildrenWithAncestor: no ancestors", function (assert) {
		var aAncestors = [],
			mChildren = {};

		this.mock(aAncestors).expects("indexOf").never(); // no need to ask :-)

		// code under test
		_Helper.addChildrenWithAncestor(["A"], aAncestors, mChildren);

		assert.deepEqual(mChildren, {});
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: real intersection", function (assert) {
		var aCacheSelects = [/*"A", "B/b", "C", ...*/],
			mCacheQueryOptions = {
				$expand : {"to1" : null},
				$select : aCacheSelects,
				"sap-client" : "123"
			},
			sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
			mChildren,
			fnFetchMetadata = getFetchMetadata({
				"/Me/A/a" : "",
				"/Me/B/b" : "",
				"/Me/to1" : "1"
			}),
			oHelperMock = this.mock(_Helper),
			mNavigationPropertyPaths = {},
			aPaths = [/*"to1", "A/a", "B"*/];

		oHelperMock.expects("addChildrenWithAncestor")
			.withExactArgs(sinon.match.same(aPaths), sinon.match.same(aCacheSelects), {})
			.callsFake(function (aChildren, aAncestors, mChildren0) {
				mChildren = mChildren0;
				mChildren["A/a"] = true;
			});
		oHelperMock.expects("addChildrenWithAncestor")
			.withExactArgs(sinon.match.same(aCacheSelects), sinon.match.same(aPaths),
				sinon.match.object)
			.callsFake(function (aChildren, aAncestors, mChildren0) {
				assert.strictEqual(mChildren0, mChildren);
				mChildren["B/b"] = true;
			});
		oHelperMock.expects("addChildrenWithAncestor")
			.withExactArgs(["to1"], sinon.match.same(aPaths), {})
			.callsFake(function (aChildren, aAncestors, mSet) {
				mSet.to1 = true;
			});

		assert.deepEqual(
			// code under test
			_Helper.intersectQueryOptions(mCacheQueryOptions, aPaths, fnFetchMetadata, "/Me",
				mNavigationPropertyPaths),
			{$expand : {"to1" : null}, $select : ["A/a", "B/b"], "sap-client" : "123"});

		assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions, "unmodified");
		assert.deepEqual(mNavigationPropertyPaths, {});
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: empty $select", function (assert) {
		// code under test
		assert.strictEqual(_Helper.intersectQueryOptions({$select : []}, ["B"]), null);
	});

	//*********************************************************************************************
	[{
		$expand : {
			"toN" : null
		},
		aPaths : ["toN/a"],
		sNavigationProperty : "/Me/toN"
	}].forEach(function (o, i) {
		var sMessage = "Unsupported collection-valued navigation property " + o.sNavigationProperty;

		QUnit.test("intersectQueryOptions: " + sMessage, function (assert) {
			var mCacheQueryOptions = {
					$expand : o.$expand,
					$select : ["A"]
				},
				sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
				mMetaPath2Type = {};

			mMetaPath2Type[o.sNavigationProperty] = "N";
			assert.throws(function () {
				// code under test
				_Helper.intersectQueryOptions(mCacheQueryOptions, o.aPaths,
					getFetchMetadata(mMetaPath2Type), "/Me", {});
				// Note: this error might be used by the caller to resort to other measures...
			}, new Error(sMessage));

			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
		});
	});

	//*********************************************************************************************
	[{
		sPrefix : undefined,
		mExpectedNavigationPropertyPaths : {"A/toN" : true, "toN" : true}
	}, {
		sPrefix : "~",
		mExpectedNavigationPropertyPaths : {"~/A/toN" : true, "~/toN" : true}
	}].forEach(function (oFixture) {
		var sTitle = "intersectQueryOptions: collection-valued navigation property"
				+ "; prefix = " + oFixture.sPrefix;

		QUnit.test(sTitle, function (assert) {
			var mNavigationPropertyPaths = {}, // a map w/o values is a set ;-)
				mCacheQueryOptions = {
					$expand : {
						"A/toN" : null,
						"toN" : null
					},
					$select : []
				},
				sCacheQueryOptions = JSON.stringify(mCacheQueryOptions);

			// code under test
			assert.deepEqual(
				_Helper.intersectQueryOptions(mCacheQueryOptions, ["A", "toN"],
					getFetchMetadata({"/Me/A" : "", "/Me/A/toN" : "N", "/Me/toN" : "N"}), "/Me",
					mNavigationPropertyPaths, oFixture.sPrefix),
				{$expand : {"A/toN" : null, "toN" : null}, $select : ["A/toN"]}
			);

			assert.deepEqual(mNavigationPropertyPaths, oFixture.mExpectedNavigationPropertyPaths);
			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
		});
	});

	//*********************************************************************************************
	[{
		aPaths : [],
		mResult : null // nothing to do
	}, {
		aPaths : ["X", "Y", "Z"],
		mResult : null // nothing to do
	}, {
		aPaths : ["A/to1"],
		mResult : null // nothing to do, only navigation property has changed, but it is unused
	}, {
		aPaths : ["A/toN"],
		mResult : null // nothing to do, only navigation property has changed, but it is unused
	}, {
		aPaths : ["A/to1/D", "B/C/toN", "X"],
		mResult : null // nothing to do, only navigation property has changed, but it is unused
	}, {
		aPaths : ["A/C"],
		mResult : {
			$select : ["A/C"], // only structural properties
			"sap-client" : "123"
		}
	}, {
		aPaths : ["A", "toC"],
		mResult : {
			$expand : {
				"toC" : null
			},
			$select : ["A"],
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toA", "toC"], // toB omitted
		mResult : {
			$expand : {
				"toA" : null,
				"toC" : null
			},
			$select : ["toA"], // avoid $select= in URL, use any navigation property
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toC", "toB", "toB/b", "D"], // Note "toB" is stronger than "toB/b"!
		mResult : {
			$expand : {
				"toB" : {$select : ["a"]},
				"toC" : null,
				"D/E/toD" : {$select : ["d"]}
			},
			$select : ["toB"], // avoid $select= in URL, use any navigation property
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toA/a", "toB/z"],
		mResult : {
			$expand : {
				"toA" : {
					$select : ["a"]
				}
			},
			$select : ["toA"], // avoid $select= in URL, use any navigation property
			"sap-client" : "123"
		}
	}, {
		aPaths : ["A", "toA/a"],
		mResult : {
			$expand : {
				"toA" : {
					$select : ["a"]
				}
			},
			$select : ["A"],
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toE/e", "toG/g"],
		mResult : {
			$expand : {
				"toE" : {
					$select : ["e"]
				},
				"toG" : {
					$select : ["g"]
				}
			},
			$select : ["toE"], // avoid $select= in URL, use any navigation property
			"sap-client" : "123"
		}
//	}, { //TODO who would need this?
//		aPaths : ["E"],
//		mResult : {
//			$select : ["E/toF"],
//			"sap-client" : "123"
//		}
	}].forEach(function (o, i) {
		var sTitle = "intersectQueryOptions: " + o.aPaths + ", " + i;

		QUnit.test(sTitle, function (assert) {
			var mCacheQueryOptions = {
					$expand : {
						"toA" : null,
						"toB" : {$select : ["a"]},
						"toC" : null,
						"D/E/toD" : {$select : ["d"]},
						"toE" : {},
						"toG" : true
					},
					$select : ["A", "B", "C", "E/toF"],
					"sap-client" : "123"
				},
				sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
				fnFetchMetadata = getFetchMetadata({
					"/Me/A" : "",
					"/Me/A/C" : "",
					"/Me/A/to1" : "1",
					"/Me/A/toN" : "N",
					"/Me/B/C/toN" : "N",
					"/Me/B/C" : "",
					"/Me/D/E/toD" : "1",
					"/Me/E/toF" : "1",
					"/Me/toA" : "1",
					"/Me/toA/a" : "",
					"/Me/toB" : "1",
					"/Me/toC" : "1",
					"/Me/toE" : "1",
					"/Me/toE/e" : "",
					"/Me/toG" : "1",
					"/Me/toG/g" : ""
				}),
				mNavigationPropertyPaths = {};

			assert.deepEqual(
				// code under test
				_Helper.intersectQueryOptions(mCacheQueryOptions, o.aPaths, fnFetchMetadata, "/Me",
					mNavigationPropertyPaths),
				o.mResult);

			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
			assert.deepEqual(mNavigationPropertyPaths, {});
		});
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions with empty $select allowed", function (assert) {
		var mCacheQueryOptions = {
				$expand : {
					"toA" : null
				},
				$select : ["A"],
				"sap-client" : "123"
			},
			sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
			fnFetchMetadata = getFetchMetadata({
				"/Me/toA" : "1"
			}),
			mNavigationPropertyPaths = {};

		assert.deepEqual(
			// code under test
			_Helper.intersectQueryOptions(mCacheQueryOptions, ["toA"], fnFetchMetadata, "/Me",
				mNavigationPropertyPaths, "", true),
			{
				$expand : {
					"toA" : null
				},
				$select : [],
				"sap-client" : "123"
			});

		assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
			"unmodified");
		assert.deepEqual(mNavigationPropertyPaths, {});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bPrefix) {
		var sPrefix = bPrefix ? "~" : undefined;

		QUnit.test("intersectQueryOptions: recursion; prefix = " + sPrefix, function (assert) {
			var mCacheQueryOptions = {
					$expand : {
						"toC" : null,
						"D/E/toD" : {$select : ["d"]}
					},
					$select : [],
					"sap-client" : "123"
				},
				mCacheQueryOptions0 = {},
				mCacheQueryOptions1 = {},
				fnFetchMetadata = getFetchMetadata({
					"/Me/D/E/toD" : "1",
					"/Me/toC" : "1"
				}),
				oHelperMock = this.mock(_Helper),
				mNavigationPropertyPaths = {},
				aPaths = ["toC/d", "D/E/toD/d"],
				aStrippedPaths0 = ["d"],
				aStrippedPaths1 = ["d"];

			oHelperMock.expects("intersectQueryOptions")
				.withExactArgs(sinon.match.same(mCacheQueryOptions),
					sinon.match.same(aPaths), sinon.match.same(fnFetchMetadata), "/Me",
					sinon.match.same(mNavigationPropertyPaths), sPrefix)
				.callThrough(); // for code under test
			// intersect for $select tested already above - no sinon.match.same tests
			oHelperMock.expects("addChildrenWithAncestor").withExactArgs(aPaths, [], {});
			oHelperMock.expects("addChildrenWithAncestor").withExactArgs([], aPaths, {});
			// first navigation property
			oHelperMock.expects("addChildrenWithAncestor")
				.withExactArgs(["toC"], sinon.match.same(aPaths), {});
			oHelperMock.expects("stripPathPrefix").withExactArgs("toC", sinon.match.same(aPaths))
				.returns(aStrippedPaths0);
			oHelperMock.expects("intersectQueryOptions")
				.withExactArgs({}, sinon.match.same(aStrippedPaths0),
					sinon.match.same(fnFetchMetadata), "/Me/toC",
					sinon.match.same(mNavigationPropertyPaths), bPrefix ? "~/toC" : "toC")
				.returns(mCacheQueryOptions0);
			// second navigation property
			oHelperMock.expects("addChildrenWithAncestor")
				.withExactArgs(["D/E/toD"], sinon.match.same(aPaths), {});
			oHelperMock.expects("stripPathPrefix")
				.withExactArgs("D/E/toD", sinon.match.same(aPaths))
				.returns(aStrippedPaths1);
			oHelperMock.expects("intersectQueryOptions")
				.withExactArgs(sinon.match.same(mCacheQueryOptions.$expand["D/E/toD"]),
					sinon.match.same(aStrippedPaths1), sinon.match.same(fnFetchMetadata),
					"/Me/D/E/toD", sinon.match.same(mNavigationPropertyPaths),
					bPrefix ? "~/D/E/toD" : "D/E/toD")
				.returns(mCacheQueryOptions1);

			assert.deepEqual(
				// code under test
				_Helper.intersectQueryOptions(mCacheQueryOptions, aPaths, fnFetchMetadata, "/Me",
					mNavigationPropertyPaths, sPrefix),
				{
					$expand : {
						"toC" : mCacheQueryOptions0,
						"D/E/toD" : mCacheQueryOptions1
					},
					$select : ["toC"], // avoid $select= in URL, use any navigation property
					"sap-client" : "123"
				});
			assert.deepEqual(mNavigationPropertyPaths, {});
		});
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: empty navigation property path", function (assert) {
		// Note: this is just self-guarding, the method must not be used in this case
		assert.throws(function () {
			// code under test
			_Helper.intersectQueryOptions({}, [""]);
		}, new Error("Unsupported empty navigation property path"));
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: * inside $select", function (assert) {
		var  mCacheQueryOptions = {
				$expand : {"n/a" : null},
				$select : ["A", "*", "Z"],
				"sap-client" : "123"
			},
			fnFetchMetadata = getFetchMetadata({
				"/Me/B" : "",
				"/Me/B/C" : "",
				"/Me/B/toN" : "N",
				"/Me/D" : "",
				"/Me/toN" : "N"
			});

		function test(mExpectedResult) {
			var sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
				mNavigationPropertyPaths = {};

			// code under test
			assert.deepEqual(
				_Helper.intersectQueryOptions(mCacheQueryOptions, ["B/C", "D", "B/toN", "toN"],
					fnFetchMetadata, "/Me", mNavigationPropertyPaths),
				mExpectedResult);

			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
			assert.deepEqual(mNavigationPropertyPaths, {});
		}

		test({$select : ["B/C", "D"], "sap-client" : "123"});
		delete mCacheQueryOptions.$select; // missing $select means *
		test({$select : ["B/C", "D"], "sap-client" : "123"});
		mCacheQueryOptions = undefined; // query options are optional
		test({$select : ["B/C", "D"]});
	});

	//*********************************************************************************************
	QUnit.test("stripPathPrefix", function (assert) {
		var aResult,
			aPaths = [];

		// code under test
		aResult = _Helper.stripPathPrefix("A", aPaths);

		assert.deepEqual(aResult, []);
		assert.notStrictEqual(aResult, aPaths);

		// code under test
		assert.deepEqual(_Helper.stripPathPrefix("A", ["A"]), [""]);

		// code under test
		assert.deepEqual(_Helper.stripPathPrefix("", ["A", "B"]), ["A", "B"]);

		aPaths = ["Z", "A/B", "AA", "A/C/D/C"];

		// code under test
		aResult = _Helper.stripPathPrefix("A", aPaths);

		assert.deepEqual(aResult, ["B", "C/D/C"]);
		assert.deepEqual(aPaths, ["Z", "A/B", "AA", "A/C/D/C"]);
	});

	//*********************************************************************************************
	[{
		before : [],
		merge : ["foo"],
		after : ["foo"]
	}, {
		before : ["foo"],
		merge : ["bar"],
		after : ["foo", "bar"]
	}, {
		before : ["foo", "bar"],
		merge : ["bar", "baz"],
		after : ["foo", "bar", "baz"]
	}, {
		before : undefined,
		merge : ["foo", "bar"],
		after : ["foo", "bar"]
	}].forEach(function (oFixture) {
		QUnit.test("addToSelect", function (assert) {
			var mQueryOptions = {$foo : "bar", $select : oFixture.before};

			// code under test
			_Helper.addToSelect(mQueryOptions, oFixture.merge);

			assert.deepEqual(mQueryOptions.$select, oFixture.after);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bKeys) {
		QUnit.test("selectKeyProperties: " + (bKeys ? "w/" : "w/o") + " keys", function (assert) {
			var aKeyProperties = ["foo", "path/to/key"],
				mQueryOptions = {},
				oType = bKeys ? {$Key : ["foo", {"alias" : "path/to/key"}]} : {};

			this.mock(_Helper).expects("addToSelect").exactly(bKeys ? 1 : 0)
				.withExactArgs(sinon.match.same(mQueryOptions), aKeyProperties);

			// code under test
			_Helper.selectKeyProperties(mQueryOptions, oType);
		});
	});

	//*********************************************************************************************
	QUnit.test("selectKeyProperties: no type metadata available", function (assert) {
		this.mock(_Helper).expects("addToSelect").never();

		// code under test
		_Helper.selectKeyProperties({});
	});

	//*********************************************************************************************
	[{
		childPath : "Property",
		childQueryOptions : {},
		expected : {$select : ["Property"]}
	}, {
		childPath : "NavigationProperty",
		childQueryOptions : {
			$select : ["Property"]
		},
		expected : {
			$expand : {
				"NavigationProperty" : {
					$select: ["Property", "Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty/Property",
		childQueryOptions : {},
		expected : {
			$expand : {
				"NavigationProperty" : {
					$select: ["Property_1", "Property_2", "Property"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty/Property_1",
		childQueryOptions : {},
		expected : {
			$expand : {
				"NavigationProperty" : {
					$select: ["Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "Property/NavigationProperty",
		childQueryOptions : {},
		expected : {
			$expand : {
				"Property/NavigationProperty" : {
					$select: ["Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "Property_1/Property_2",
		childQueryOptions : {},
		expected : {$select : ["Property_1/Property_2"]}
	}, {
		childPath : "NavigationProperty_1/NavigationProperty_2",
		childQueryOptions : {$foo : "bar"}, // will be taken as is
		expected : {
			$expand : {
				"NavigationProperty_1" : {
					$expand : {
						"NavigationProperty_2" : {
							$foo : "bar",
							$select: ["Property_1", "Property_2"]
						}
					},
					$select: ["Property_1", "Property_2"]
				}
			}
		}
	}].forEach(function (oFixture) {
		QUnit.test("wrapChildQueryOptions, " + oFixture.childPath, function (assert) {
			var oMetaModel = {
					// Note: "this" not needed, save Function#bind below
					fetchObject : function () {}
				},
				aMetaPathSegments = oFixture.childPath === ""
					? []
					: oFixture.childPath.split("/"),
				mWrappedQueryOptions,
				oMetaModelMock = this.mock(oMetaModel);

			aMetaPathSegments.forEach(function (sSegment, j, aMetaPathSegments) {
				var sPropertyMetaPath = "/EMPLOYEES/" + aMetaPathSegments.slice(0, j + 1).join("/"),
					sKind = sSegment.split("_")[0];

				oMetaModelMock.expects("fetchObject")
					.withExactArgs(sPropertyMetaPath)
					.returns(SyncPromise.resolve({$kind : sKind}));
				if (sKind === "NavigationProperty") {
					oMetaModelMock.expects("fetchObject")
						.withExactArgs(sPropertyMetaPath + "/")
						.returns(SyncPromise.resolve({$Key : ["Property_1", "Property_2"]}));
				}
			});

			// code under test
			mWrappedQueryOptions = _Helper.wrapChildQueryOptions("/EMPLOYEES", oFixture.childPath,
				oFixture.childQueryOptions, oMetaModel.fetchObject);

			assert.deepEqual(mWrappedQueryOptions, oFixture.expected);
		});
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions: empty path", function (assert) {
		var mChildQueryOptions = {};

		// code under test
		assert.strictEqual(
			_Helper.wrapChildQueryOptions("/...", "", mChildQueryOptions),
			mChildQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions, returns undefined if $apply is present", function (assert) {
		var mChildQueryOptions = {
				$apply : "filter(Amount gt 3)"
			},
			oMetaModel = {
				// Note: "this" not needed, save Function#bind below
				fetchObject : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel);

		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/EMPLOYEES/NavigationProperty")
			.returns(SyncPromise.resolve({$kind : "NavigationProperty"}));
		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/EMPLOYEES/NavigationProperty/")
			.returns(SyncPromise.resolve({}));
		this.oLogMock.expects("debug").withExactArgs(
			"Cannot wrap $apply into $expand: NavigationProperty",
			JSON.stringify(mChildQueryOptions), sClassName
		);

		// code under test
		assert.strictEqual(
			_Helper.wrapChildQueryOptions("/EMPLOYEES", "NavigationProperty", mChildQueryOptions,
				oMetaModel.fetchObject),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions, child path with bound function", function (assert) {
		var oMetaModel = {
				// Note: "this" not needed, save Function#bind below
				fetchObject : function () {}
			};

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/EMPLOYEES/name.space.boundFunction")
			.returns(SyncPromise.resolve({$kind : "Function"}));

		// code under test
		assert.strictEqual(
			_Helper.wrapChildQueryOptions("/EMPLOYEES", "name.space.boundFunction/Property", {},
				oMetaModel.fetchObject),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions, structural property w/ query options", function (assert) {
		var oMetaModel = {
				// Note: "this" not needed, save Function#bind below
				fetchObject : function () {}
			},
			mChildLocalQueryOptions = {$apply : "filter(AGE gt 42)"};

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/EMPLOYEES/Property")
			.returns(SyncPromise.resolve({$kind : "Property"}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to enhance query options for auto-$expand/$select as the child "
				+ "binding has query options, but its path 'Property' points to a "
				+ "structural property",
			JSON.stringify(mChildLocalQueryOptions), sClassName);

		// code under test
		assert.strictEqual(
			_Helper.wrapChildQueryOptions("/EMPLOYEES", "Property", mChildLocalQueryOptions,
				oMetaModel.fetchObject),
			undefined);
	});

	//*********************************************************************************************
	[{
		mQueryOptions: undefined,
		sOrderBy : undefined,
		sFilter : undefined
	}, {
		mQueryOptions: {$orderby : "bar", $select : "Name"},
		sOrderBy : undefined,
		sFilter : undefined
	}, {
		mQueryOptions: undefined,
		sOrderBy : "foo",
		sFilter : undefined,
		oResult : {$orderby : "foo"}
	}, {
		mQueryOptions: {$orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		sFilter : undefined,
		oResult : {$orderby : "foo,bar", $select : "Name"}
	}, {
		mQueryOptions: {$orderby : "bar", $select : "Name"},
		sOrderBy : "bar",
		sFilter : undefined
	}, {
		mQueryOptions: undefined,
		sOrderBy : undefined,
		sFilter : "foo",
		oResult : {$filter : "foo"}
	}, {
		mQueryOptions: {$filter : "bar", $select : "Name"},
		sOrderBy : undefined,
		sFilter : "foo,bar",
		oResult : {$filter : "foo,bar", $select : "Name"}
	}, {
		mQueryOptions: {$filter: "bar", $select : "Name"},
		sOrderBy : undefined,
		sFilter : "bar"
	}, {
		mQueryOptions: {$filter: "bar", $orderby : "foo", $select : "Name"},
		sOrderBy : "foo",
		sFilter : "bar"
	}, {
		mQueryOptions: {$filter: "foo", $orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		sFilter : "bar,baz",
		oResult : {$filter : "bar,baz", $orderby : "foo,bar", $select : "Name"}
	}].forEach(function (oFixture, i) {
		QUnit.test("mergeQueryOptions, " + i, function (assert) {
			var oResult,
				sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions);

			// code under test
			oResult = _Helper.mergeQueryOptions(oFixture.mQueryOptions, oFixture.sOrderBy,
				oFixture.sFilter);

			assert.strictEqual(JSON.stringify(oFixture.mQueryOptions), sQueryOptionsJSON);
			if ("oResult" in oFixture) {
				assert.deepEqual(oResult, oFixture.oResult, i);
			} else {
				assert.strictEqual(oResult, oFixture.mQueryOptions, i);
			}
			if (oResult) {
				assert.ok(oResult.$orderby || !("$orderby" in oResult), i + ": $orderby");
				assert.ok(oResult.$filter || !("$filter" in oResult), i + ": $filter");
			}
		});
	});

	//*********************************************************************************************
[{ // $select=Bar
	mQueryOptions : {
		$select : "Bar"
	},
	sPath : "",
	mQueryOptionsForPath : {
		$select : "Bar"
	}
}, { // mQueryOptions has to be optional
	mQueryOptions : undefined,
	sPath : "",
	mQueryOptionsForPath : {}
}, { // mQueryOptions has to be optional
	mQueryOptions : undefined,
	sPath : "FooSet",
	mQueryOptionsForPath : {}
}, { // $select=Bar
	mQueryOptions : {
		$select : "Bar"
	},
	sPath : "FooSet/WithoutExpand",
	mQueryOptionsForPath : {}
}, { // $expand(FooSet=$expand(BarSet=$select(Baz)))
	mQueryOptions : {
		$expand : {
			FooSet : {
				$expand : {
					BarSet : {
						$select : ["Baz"]
					}
				}
			}
		}
	},
	sPath : "15/FooSet('0815')/BarSet",
	mQueryOptionsForPath : {
		$select : ["Baz"]
	}
}, { // $expand(ExpandWithoutOptions)
	mQueryOptions : {
		$expand : {
			ExpandWithoutOptions : true
		}
	},
	sPath : "ExpandWithoutOptions",
	mQueryOptionsForPath : {}
}, { // $expand(FooSet=$select(Bar,Baz))
	mQueryOptions : {
		$expand : {
			FooSet : {
				$select : ["Bar", "Baz"]
			}
		}
	},
	sPath : "FooSet('0815')",
	mQueryOptionsForPath : {
		$select : ["Bar", "Baz"]
	}
}, {// $expand(FooSet=$expand(BarSet=$select(Baz)))
	mQueryOptions : {
		$expand : {
			FooSet : {
				$expand : {
					BarSet : {
						$select : ["Baz"]
					}
				}
			}
		}
	},
	// combination of key predicate and index is unrealistic ;-)
	sPath : "FooSet($uid=id-1-23)/12/BarSet",
	mQueryOptionsForPath : {
		$select : ["Baz"]
	}
}, {
	mQueryOptions : {
		$expand : {
			BarSet : {
				$select : ["Param1", "Param2"]
			}
		},
		$select : ["Param3", "Param4"]
	},
	sPath : "('42')/BarSet",
	mQueryOptionsForPath : {
		$select : ["Param1", "Param2"]
	}
}, {
	mQueryOptions : {
		$select : ["Param3", "Param4"]
	},
	sPath : "('42')",
	mQueryOptionsForPath : {
		$select : ["Param3", "Param4"]
	}
}].forEach(function (oFixture) {
	QUnit.test("getQueryOptionsForPath " + oFixture.sPath, function (assert) {
		this.mock(_Helper).expects("getMetaPath").withExactArgs(oFixture.sPath).callThrough();

		// code under test
		assert.deepEqual(
			_Helper.getQueryOptionsForPath(oFixture.mQueryOptions, oFixture.sPath),
			oFixture.mQueryOptionsForPath);
	});
});

	//*********************************************************************************************
[
	{sPath : "/foo/bar/baz", sResult : "baz"},
	{sPath : "/foo/bar('baz')", sResult : "('baz')"},
	{sPath : "/foo/bar", sResult : ""},
	{sPath : "/foo", sResult : undefined},
	{sPath : "/foo/barolo", sResult : undefined}
].forEach(function (oFixture) {
	QUnit.test("getRelativePath: " + oFixture.sPath, function (assert) {
		// code under test
		assert.strictEqual(_Helper.getRelativePath(oFixture.sPath, "/foo/bar"), oFixture.sResult);
	});
});

	//*********************************************************************************************
[{
	aggregated : {$select : ["Name"]},
	additional : {$select : ["ID"]},
	result : {$select : ["Name", "ID"]},
	title : "merge $select"
}, {
	aggregated : {},
	additional : {$select : ["ID"]},
	result : {$select : ["ID"]},
	title : "add $select"
}, {
	aggregated : {$select : ["Name"]},
	additional : {},
	result : {$select : ["Name"]},
	title : "no additional $select"
}, {
	aggregated : {$select : ["ID", "Name"]},
	additional : {$select : ["ID"]},
	result : {$select : ["ID", "Name"]},
	title : "$select unchanged"
}, {
	aggregated : {foo : "bar", $select : ["ID"]},
	additional : {foo : "bar", $select : ["ID"]},
	result : {foo : "bar", $select : ["ID"]},
	title : "custom query option"
}, {
	aggregated : {},
	additional : {$expand : {foo : null}},
	result : {$expand : {foo : null}},
	title : "added $expand"
}, {
	aggregated : {$expand : {foo : null}},
	additional : {$expand : {bar : null, baz : null}},
	result : {$expand : {foo : null, bar : null, baz : null}},
	title : "added $expand path"
}].forEach(function (oFixture) {
	QUnit.test("aggregateQueryOptions: " + oFixture.title, function (assert) {
		// code under test
		_Helper.aggregateQueryOptions(oFixture.aggregated, oFixture.additional);

		assert.deepEqual(oFixture.aggregated, oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("aggregateQueryOptions: recursion", function (assert) {
		var mAggregatedQueryOptions = {$expand : {foo : {}}},
			oHelperMock = this.mock(_Helper),
			mQueryOptions = {$expand : {foo : {}}};

		oHelperMock.expects("aggregateQueryOptions")
			.withExactArgs(sinon.match.same(mAggregatedQueryOptions),
				sinon.match.same(mQueryOptions))
			.callThrough(); // start the recursion
		oHelperMock.expects("aggregateQueryOptions")
			.withExactArgs(sinon.match.same(mAggregatedQueryOptions.$expand.foo),
				sinon.match.same(mQueryOptions.$expand.foo));

		_Helper.aggregateQueryOptions(mAggregatedQueryOptions, mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("merge", function (assert) {
		assert.strictEqual(_Helper.merge, merge);
	});

	//*********************************************************************************************
	QUnit.test("uid", function (assert) {
		assert.strictEqual(_Helper.uid, uid);
	});
});