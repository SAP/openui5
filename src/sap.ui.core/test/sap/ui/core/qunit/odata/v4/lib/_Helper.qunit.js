/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/base/util/uid",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/thirdparty/URI"
], function (Log, deepEqual, merge, uid, SyncPromise, _Helper, URI) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._Helper";

	/**
	 * Checks the given cloned error according to the given expectations.
	 *
	 * @param {object} assert - The QUnit assert object
	 * @param {Error} oOriginal - The original error
	 * @param {Error} oClone - The cloned error
	 * @param {object} oExpectedInnerError - The expected inner error
	 * @param {string} sUrl - The expected request URL
	 * @param {string} sResourcePath - The expected resource path
	 * @param {boolean} [bStrictHandlingFailed] - Whether oClone.strictHandlingFailed is present and
	 *   is set to <code>true</code>
	 */
	function checkClonedError(assert, oOriginal, oClone, oExpectedInnerError, sUrl, sResourcePath,
			bStrictHandlingFailed) {
		assert.notStrictEqual(oClone, oOriginal);
		assert.ok(oClone instanceof Error);
		assert.strictEqual(oClone.message, "Message");
		assert.strictEqual(oClone.requestUrl, sUrl);
		assert.strictEqual(oClone.resourcePath, sResourcePath);
		assert.strictEqual(oClone.status, 500);
		assert.strictEqual(oClone.statusText, "Internal Server Error");
		assert.notStrictEqual(oClone.error, oOriginal.error);
		assert.deepEqual(oClone.error, oExpectedInnerError);
		if (bStrictHandlingFailed) {
			assert.strictEqual(oClone.strictHandlingFailed, true);
		} else {
			assert.notOk("strictHandlingFailed" in oClone);
		}
	}

	/**
	 * Returns a mock "fnFetchMetadata" (see _Requestor#getModelInterface) which returns metadata
	 * for a meta path according to the given map.
	 *
	 * @param {object} mMetaPath2Type
	 *   A map from meta path to symbolic type, for example
	 *   <code>{"/Me/A" : "", "/Me/to1" : "1", "/Me/toN" : "N"}</code>, where "" means structural
	 *   property, "N" means collection-valued navigation property and "1" means navigation property
	 * @param {boolean} [bAllowAnnotations]
	 *   Whether it is allowed to ask for annotations
	 * @returns {function}
	 *   "fnFetchMetadata"
	 */
	function getFetchMetadata(mMetaPath2Type, bAllowAnnotations) {
		return function (sMetaPath) {
			var vResult = mMetaPath2Type[sMetaPath];

			if (sMetaPath.includes("@")) {
				if (!bAllowAnnotations) {
					throw new Error(sMetaPath);
				}
				return SyncPromise.resolve(vResult);
			}

			switch (vResult) {
				case "":
					return SyncPromise.resolve({
						$kind : "Property"
					});

				case "1":
					return SyncPromise.resolve({
						$kind : "NavigationProperty"
						// $isCollection : false
					});

				case "N":
					return SyncPromise.resolve({
						$kind : "NavigationProperty",
						$isCollection : true
					});

				default:
					if (vResult && typeof vResult === "object") {
						return SyncPromise.resolve(vResult);
					}
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

		Promise.resolve.restore();
	});

	//*********************************************************************************************
	[{
		message : "CSRF token validation failed",
		response : {
			headers : {
				"Content-Type" : "text/plain;charset=utf-8",
				"x-csrf-token" : "Required"
			},
			responseText : "CSRF token validation failed",
			status : 403,
			statusText : "Forbidden"
		}
	}, {
		message : "message: 401 Unauthorized",
		response : {
			headers : {
				"Content-Type" : "text/html;charset=utf-8"
			},
			responseText : "<html>...</html>",
			status : 401,
			statusText : "Unauthorized"
		}
	}, {
		// OData V4 error response body as JSON
		// "The error response MUST be a single JSON object. This object MUST have a
		// single name/value pair named error. The value must be a JSON object."
		body : {
			error : {
				code : "/IWBEP/CM_V4_RUNTIME/021",
				message :
					// Note: "a human-readable, language-dependent representation of the error"
					"The state of the resource (entity) was already changed (If-Match)",
				"@Common.ExceptionCategory" : "Client_Error",
				"@Common.Application" : {
					ComponentId : "OPU-BSE-BEP",
					ServiceRepository : "DEFAULT",
					ServiceId : "/IWBEP/TEA_BUSI",
					ServiceVersion : "0001"
				},
				"@Common.TransactionId" : "5617D1F235DE73F0E10000000A60180C",
				"@Common.Timestamp" : "20151009142600.103179",
				"@Common.ErrorResolution" : {
					Analysis : "Run transaction /IWFND/ERROR_LOG [...]",
					Note : "See SAP Note 1797736 for error analysis "
						+ "(https://service.sap.com/sap/support/notes/1797736)"
				}
			}
		},
		isConcurrentModification : true,
		message : "The state of the resource (entity) was already changed (If-Match)",
		response : {
			headers : {
				"Content-Type" : "application/json; odata.metadata=minimal;charset=utf-8"
			},
			// "responseText" : JSON.stringify(this.body)
			status : 412,
			statusText : "Precondition Failed"
		}
	}, {
		strictHandlingFailed : true,
		message : "message: 412 Precondition Failed",
		response : {
			headers : {
				// https://datatracker.ietf.org/doc/html/rfc7240#section-3
				// ABNF: "Preference-Applied" ":" token [ BWS "=" BWS word ]
				"Preference-Applied" : "handling\t=  strict"
			},
			status : 412,
			statusText : "Precondition Failed"
		}
	}, {
		message : "message: 999 Invalid JSON",
		response : {
			headers : {
				"Content-Type" : "application/json"
			},
			responseText : "<html>...</html>",
			status : 999,
			statusText : "Invalid JSON"
		},
		warning : sinon.match(/SyntaxError/)
	}, {
		message : "message: 403 Forbidden",
		response : {
			headers : {
				"Content-Type" : "text/plain-not-quite-right"
			},
			status : 403,
			statusText : "Forbidden",
			responseText : "ignore this!"
		}
	}, {
		message : "Network error",
		response : {
			headers : {},
			status : 0,
			statusText : "error"
		}
	}, {
		message : "message: 404 Not Found",
		response : {
			headers : {},
			status : 404,
			statusText : "Not Found"
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
		response : {
			headers : {
				"Content-Type" : "application/json;charset=UTF-8"
			},
			status : 500,
			statusText : "Internal Server Error"
		}
	}, {
		// no need to use UI5Date.getInstance as only the timestamp is relevant
		retryAfter : new Date(1234567890),
		message : "message: 503 Service Unavailable",
		response : {
			headers : {
				"Retry-After" : "0"
			},
			status : 503,
			statusText : "Service Unavailable"
		}
	}, {
		// no need to use UI5Date.getInstance as only the timestamp is relevant
		retryAfter : new Date(1234567890 + 42 * 1000),
		message : "message: 503 Service Unavailable",
		response : {
			headers : {
				"Retry-After" : "42"
			},
			status : 503,
			statusText : "Service Unavailable"
		}
	}, {
		// no need to use UI5Date.getInstance as only the timestamp is relevant
		retryAfter : new Date("Fri, 16 Jul 2021 14:04:39 GMT"),
		message : "message: 503 Service Unavailable",
		response : {
			headers : {
				"Retry-After" : "Fri, 16 Jul 2021 14:04:39 GMT"
			},
			status : 503,
			statusText : "Service Unavailable"
		}
	}].forEach(function (oFixture) {
		QUnit.test("createError: " + oFixture.message, function (assert) {
			var oError,
				jqXHR = {
					getResponseHeader : function (sName) {
						return oFixture.response.headers[sName];
					},
					status : oFixture.response.status,
					statusText : oFixture.response.statusText,
					responseText : oFixture.response.responseText || JSON.stringify(oFixture.body)
				};

			if (oFixture.retryAfter) {
				this.mock(Date).expects("now").atLeast(0).withExactArgs().returns(1234567890);
			}
			if (oFixture.warning) {
				this.oLogMock.expects("warning").withExactArgs(oFixture.warning,
					oFixture.response.responseText, "sap.ui.model.odata.v4.lib._Helper");
			}

			oError = _Helper.createError(jqXHR, "message", "/request/path", "original/path");

			assert.ok(oError instanceof Error);
			assert.deepEqual(oError.error, oFixture.body && oFixture.body.error);
			assert.strictEqual(oError.isConcurrentModification, oFixture.isConcurrentModification);
			assert.strictEqual(oError.strictHandlingFailed, oFixture.strictHandlingFailed);
			assert.strictEqual(oError.message, oFixture.message);
			assert.strictEqual(oError.status, oFixture.response.status);
			assert.strictEqual(oError.statusText, oFixture.response.statusText);
			assert.strictEqual(oError.requestUrl, "/request/path");
			assert.strictEqual(oError.resourcePath, "original/path");
			if (oFixture.retryAfter) {
				assert.strictEqual(oError.retryAfter.getTime(), oFixture.retryAfter.getTime());
			} else {
				assert.notOk("retryAfter" in oError);
			}
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
	QUnit.test("createTechnicalDetails with @$ui5.error, no status", function (assert) {
		var oMessage = new Error();

		oMessage["@$ui5.error"] = {};
		this.mock(_Helper).expects("publicClone").never();

		// code under test
		assert.deepEqual(_Helper.createTechnicalDetails(oMessage), {});
	});

//*********************************************************************************************
// Note: if error has a cause, that cause also has a status; @see _Requestor#processBatch
[false, true].forEach(function (bCause) {
	var sTitle = "createTechnicalDetails with @$ui5.error and status; cause = " + bCause;

	QUnit.test(sTitle, function (assert) {
		var oError = {status : 123},
			oMessage = new Error();

		oMessage["@$ui5.error"] = bCause ? {cause : oError} : oError;
		this.mock(_Helper).expects("publicClone").never();

		// code under test
		assert.deepEqual(_Helper.createTechnicalDetails(oMessage), {httpStatus : 123});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bCause) {
	var sTitle = "createTechnicalDetails: isConcurrentModification; cause = " + bCause;

	QUnit.test(sTitle, function (assert) {
		var oError = {
				isConcurrentModification : true,
				status : 412
			},
			oMessage = new Error();

		oMessage["@$ui5.error"] = bCause ? {cause : oError} : oError;
		this.mock(_Helper).expects("publicClone").never();

		// code under test
		assert.deepEqual(_Helper.createTechnicalDetails(oMessage), {
			httpStatus : 412,
			isConcurrentModification : true
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bCause) {
	var sTitle = "createTechnicalDetails: retryAfter; cause = " + bCause;

	QUnit.test(sTitle, function (assert) {
		var oError = {
				retryAfter : {},
				status : 503
			},
			oMessage = new Error();

		oMessage["@$ui5.error"] = bCause ? {cause : oError} : oError;
		this.mock(_Helper).expects("publicClone").never();

		// code under test
		assert.deepEqual(_Helper.createTechnicalDetails(oMessage), {
			httpStatus : 503,
			retryAfter : oError.retryAfter
		});
	});
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
			sComplexString += String.fromCharCode(i);
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
	QUnit.test("fireChange: no listeners", function () {
		// code under test
		_Helper.fireChange({}, "path/to/property", {});
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bForceUpdate) {
	QUnit.test("fireChange: multiple listeners, forceUpdate:" + bForceUpdate, function () {
		var oChangeListener0 = {onChange : function () {}},
			oChangeListener1 = {onChange : function () {}},
			oChangeListener2 = {onChange : function () {}},
			vValue = {};

		this.mock(oChangeListener0).expects("onChange").withExactArgs(sinon.match.same(vValue),
			bForceUpdate);
		this.mock(oChangeListener1).expects("onChange").withExactArgs(sinon.match.same(vValue),
			bForceUpdate);
		this.mock(oChangeListener2).expects("onChange").withExactArgs(sinon.match.same(vValue),
			bForceUpdate);

		// code under test
		_Helper.fireChange({
				"path/to/property" : [oChangeListener0, oChangeListener1, oChangeListener2]
			}, "path/to/property", vValue, bForceUpdate);
	});
});

	//*********************************************************************************************
	[false, true].forEach(function (bRemove) {
		QUnit.test("fireChanges: null value, bRemove: " + bRemove, function () {
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
	// l: the literal (if different to v)
	// p: the parsed value (if different to v)
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
		{t : "Edm.String", v : "more ''quotes''", l : "'more ''''quotes'''''"},
		{t : "Edm.String", v : "s'om\"e", l : "'s''om\"e'"},
		{t : "Edm.String", v : null, l : "null"},
		{t : "Edm.TimeOfDay", v : "18:59:59.999"},
		// "lenient" handling, format/parse not symmetric here!
		{t : "Edm.String", v : 1234, l : "'1234'", p : "1234"}
	].forEach(function (oFixture) {
		var sTitle = "formatLiteral/parseLiteral: " + oFixture.t + " " + oFixture.v;

		QUnit.test(sTitle, function (assert) {
			var sLiteral = oFixture.l || oFixture.v;

			assert.strictEqual(_Helper.formatLiteral(oFixture.v, oFixture.t), sLiteral);

			switch (oFixture.t) {
				case "Edm.Binary":
				case "Edm.Duration":
					// not supported
					break;
				default:
					assert.strictEqual(_Helper.parseLiteral(sLiteral, oFixture.t, "path"),
						oFixture.p || oFixture.v);
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
	["Edm.Binary", "Edm.Duration", "Edm.bar"].forEach(function (sType) {
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
		QUnit.test("parseLiteral: error: " + oFixture.t + " " + oFixture.l, function (assert) {
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
				code : "42",
				longtextUrl : "any/URL",
				message : "message 1",
				transition : false,
				target : "Foo",
				numericSeverity : 3
			}, {
				code : "17",
				longtextUrl : "any/URL/2",
				message : "message 2",
				transition : true,
				target : "Bar",
				numericSeverity : 4
			}],
			sMessages,
			oCacheData = {
				BusinessPartnerID : "42",
				__CT__FAKE__Message : {
					__FAKE__Messages : aNoMessages
				}
			};

		aNoMessages.$count = aNoMessages.length;
		aMessages.$count = aMessages.length;
		sMessages = JSON.stringify(aMessages);

		// code under test
		_Helper.updateExisting(null, "SO_2_BP", oCacheData, {
			__CT__FAKE__Message : {
				__FAKE__Messages : aMessages
			}
		});

		assert.strictEqual(JSON.stringify(oCacheData["__CT__FAKE__Message"]["__FAKE__Messages"]),
			sMessages);
		assert.strictEqual(oCacheData["__CT__FAKE__Message"]["__FAKE__Messages"].$count, 2);

		// code under test
		_Helper.updateExisting({}, "SO_2_BP", oCacheData, {
			__CT__FAKE__Message : {
				__FAKE__Messages : aNoMessages
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
			.withExactArgs(undefined, undefined);
		this.mock(mChangeListeners["SO_2_BP/Address/Foo/Bar"][0]).expects("onChange")
			.withExactArgs(undefined, undefined);

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
			.withExactArgs("Walldorf", undefined);
		this.mock(mChangeListeners["SO_2_BP/Address/Foo/Bar"][0]).expects("onChange")
			.withExactArgs("Baz", undefined);

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
				Foo : null
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
		var aArray = [0],
			oObject = {},
			aObjects = [oObject];

		assert.deepEqual(_Helper.toArray(), []);
		assert.deepEqual(_Helper.toArray(null), []);
		assert.deepEqual(_Helper.toArray(""), [""]);
		assert.deepEqual(_Helper.toArray("foo"), ["foo"]);
		assert.deepEqual(_Helper.toArray(oObject), aObjects);

		assert.deepEqual(_Helper.toArray(aArray), [0]);
		assert.notStrictEqual(_Helper.toArray(aArray), aArray);
	});

	//*********************************************************************************************
	[{
		sKeyPredicate : "('4%2F2')",
		mKeyProperties : {ID : "'4/2'"}
	}, {
		bKeepSingleProperty : true,
		sKeyPredicate : "(ID='4%2F2')",
		mKeyProperties : {ID : "'4/2'"}
	}, {
		sKeyPredicate : "(Bar=42,Fo%3Do='Walter%22s%20Win''s')",
		mKeyProperties : {Bar : "42", "Fo=o" : "'Walter\"s Win''s'"}
	}, {
		sKeyPredicate : undefined,
		mKeyProperties : undefined
	}].forEach(function (oFixture) {
		QUnit.test("getKeyPredicate: " + oFixture.sKeyPredicate, function (assert) {
			var oEntityInstance = {},
				aKeyProperties = [],
				sMetaPath = "~path~",
				mTypeForMetaPath = {};

			this.mock(_Helper).expects("getKeyProperties")
				.withExactArgs(sinon.match.same(oEntityInstance), sMetaPath,
					sinon.match.same(mTypeForMetaPath), sinon.match.same(aKeyProperties), true)
				.returns(oFixture.mKeyProperties);

			// code under test
			assert.strictEqual(
				_Helper.getKeyPredicate(oEntityInstance, sMetaPath, mTypeForMetaPath,
					aKeyProperties, oFixture.bKeepSingleProperty),
				oFixture.sKeyPredicate);
		});
	});

	//*********************************************************************************************
	[{
		oEntityInstance : {ID : "42"},
		oEntityType : {
			$Key : ["ID"],
			ID : {
				$Type : "Edm.String"
			}
		},
		mKeyProperties : {ID : "'42'"}
	}, {
		oEntityInstance : {
			Bar : 42,
			"Fo=o" : "Walter\"s Win's",
			Baz : "foo"
		},
		oEntityType : {
			$Key : ["Bar", "Fo=o"],
			Bar : {
				$Type : "Edm.Int16"
			},
			"Fo=o" : {
				$Type : "Edm.String"
			}
		},
		mKeyProperties : {
			Bar : "42",
			"Fo=o" : "'Walter\"s Win''s'"
		}
	}, {
		oEntityInstance : {},
		oEntityType : {
			$Key : ["ID"],
			ID : {
				$Type : "Edm.String"
			}
		},
		mKeyProperties : undefined
	}, {
		oEntityInstance : {
			foo : "baz",
			bar : "qux"
		},
		oEntityType : {
			$Key : ["ID"],
			bar : {
				$Type : "Edm.String"
			},
			foo : {
				$Type : "Edm.String"
			}
		},
		mKeyProperties : {
			foo : "'baz'",
			bar : "'qux'"
		},
		aKeyProperties : ["foo", "bar"]

	}].forEach(function (oFixture) {
		QUnit.test("getKeyProperties: " + oFixture.mKeyProperties, function (assert) {
			this.spy(_Helper, "formatLiteral");

			// code under test
			assert.deepEqual(
				_Helper.getKeyProperties(oFixture.oEntityInstance, "~path~", {
					"~path~" : oFixture.oEntityType
				}, oFixture.aKeyProperties),
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
		oResult : {qux : "~1", "bar/baz" : "~2"},
		bReturnAlias : false
	}, {
		oResult : {qux : "~1", foo : "~2"},
		bReturnAlias : true
	}].forEach(function (oFixture) {
		QUnit.test("getKeyProperties: bReturnAlias=" + oFixture.bReturnAlias, function (assert) {
			var oComplexType = {
					baz : {
						$kind : "Property",
						$Type : "Edm.Int16"
					}
				},
				oEntityInstance = {},
				oEntityType = {
					$Key : ["qux", {foo : "bar/baz"}],
					qux : {
						$kind : "Property",
						$Type : "Edm.String"
					}
				},
				oHelperMock = this.mock(_Helper),
				sMetaPath = "~path~",
				mTypeForMetaPath = {
					"~path~" : oEntityType,
					"~path~/bar" : oComplexType
				};

			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oEntityInstance), []).returns({qux : "v1"});
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oEntityInstance), ["bar"]).returns({baz : "v2"});
			oHelperMock.expects("formatLiteral").withExactArgs("v1", "Edm.String").returns("~1");
			oHelperMock.expects("formatLiteral").withExactArgs("v2", "Edm.Int16").returns("~2");

			// code under test
			assert.deepEqual(_Helper.getKeyProperties(oEntityInstance, sMetaPath, mTypeForMetaPath,
				undefined, oFixture.bReturnAlias), oFixture.oResult);
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
	QUnit.test("getKeyProperties: ...@odata.type", function (assert) {
		this.mock(_Helper).expects("drillDown").withExactArgs("~oInstance~", [])
			.returns({ID : 1, "ID@odata.type" : ""}); // exact type must not matter
		// Note: ID's $Type inside mTypeForMetaPath must not play a role here!

		assert.strictEqual(
			// code under test
			_Helper.getKeyProperties("~oInstance~", "~path~", {"~path~" : {$Key : ["ID"]}}),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("getKeyFilter", function (assert) {
		var oHelperMock = this.mock(_Helper),
			oInstance = {},
			aKeyProperties = [],
			sMetaPath = {/*meta path*/},
			mTypeForMetaPath = {};

		oHelperMock.expects("getKeyProperties")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(sMetaPath),
				sinon.match.same(mTypeForMetaPath), sinon.match.same(aKeyProperties))
			.returns({key : 42});

		assert.strictEqual(
			// code under test
			_Helper.getKeyFilter(oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties),
			"key eq 42");

		oHelperMock.expects("getKeyProperties")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(sMetaPath),
				sinon.match.same(mTypeForMetaPath), sinon.match.same(aKeyProperties))
			.returns({key1 : "'a'", key2 : "'b'"});

		assert.strictEqual(
			// code under test
			_Helper.getKeyFilter(oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties),
			"key1 eq 'a' and key2 eq 'b'");

		oHelperMock.expects("getKeyProperties")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(sMetaPath),
				sinon.match.same(mTypeForMetaPath), sinon.match.same(aKeyProperties))
			.returns(undefined); // at least one key property is undefined

		assert.strictEqual(
			// code under test
			_Helper.getKeyFilter(oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("namespace", function (assert) {
		assert.strictEqual(_Helper.namespace("Products"), "");
		assert.strictEqual(_Helper.namespace("zui5_epm_sample.Products"), "zui5_epm_sample");
		assert.strictEqual(_Helper.namespace("zui5_epm_sample.v1.Products"), "zui5_epm_sample.v1");
		assert.strictEqual(_Helper.namespace("zui5_epm_sample.v1.Products/Category/type.cast"),
			"zui5_epm_sample.v1");
		assert.strictEqual(
			_Helper.namespace("zui5_epm_sample.v1.Action(ui5_epm_sample.v1.EntityType)/"),
			"zui5_epm_sample.v1");
		assert.strictEqual(
			_Helper.namespace("zui5_epm_sample.v1.Action(ui5_epm_sample.v1.EntityType)/Country"),
			"zui5_epm_sample.v1");
		assert.strictEqual(
			_Helper.namespace("zui5_epm_sample.v1.Action(Collection"
				+ "(ui5_epm_sample.v1.EntityType))"),
			"zui5_epm_sample.v1");
		assert.strictEqual(
			_Helper.namespace("zui5_epm_sample.v1.Action(Collection(ui5_epm_sample.v1.EntityType))"
				+ "/Country"),
			"zui5_epm_sample.v1");
		assert.strictEqual(
			_Helper.namespace("zui5_epm_sample.v1.Action(Collection(ui5_epm_sample.v1.EntityType))"
				+ "/Address/Country"),
			"zui5_epm_sample.v1");
	});

	//*********************************************************************************************
	QUnit.test("updateNonExisting", function (assert) {
		var oSource = {
				b1 : "n/a",
				b2 : {
					b1 : "b1s",
					s1 : "s1"
				},
				b3 : null,
				b4 : ["s1", "s2", "s3"],
				b5 : {s1 : "s1"},
				s1 : "s1"
			},
			oTarget = {
				b1 : "",
				b2 : {
					b1 : "b1t",
					t1 : "t1"
				},
				b3 : {},
				b4 : ["t1", "t2"],
				b5 : null,
				t1 : "t1"
			},
			oB2 = oTarget.b2,
			oB3 = oTarget.b3;

		// code under test
		_Helper.updateNonExisting(oTarget, oSource);

		assert.deepEqual(oTarget, {
			b1 : "",
			b2 : {
				b1 : "b1t",
				s1 : "s1",
				t1 : "t1"
			},
			b3 : {},
			b4 : ["t1", "t2"],
			b5 : null,
			s1 : "s1",
			t1 : "t1"
		});
		assert.strictEqual(oTarget.b2, oB2, "nested instance remained");
		assert.strictEqual(oTarget.b3, oB3, "nested instance remained");
	});

	//*********************************************************************************************
	QUnit.test("updateSelected: properties & annotations", function (assert) {
		var oCacheValue = {
				"@$ui5._" : {predicate : "('1')"}, // must not get lost
				"editing@$ui5.updating" : true, // must not get lost
				nested : {
					"editing@$ui5.updating" : true // must not get lost
				}
			},
			oHelperMock = this.mock(_Helper),
			oNewValue = {
				ignore : {}, // nothing selected here
				nested : {}
			},
			oNewValueJSON,
			aSelect = [],
			aSelectJSON,
			oUpdatedValue = {
				"@$ui5._" : {predicate : "('1')"},
				"editing@$ui5.updating" : true,
				nested : {
					"editing@$ui5.updating" : true
				}
			};

		function set(oObject, sName, sValue) {
			if (sValue !== undefined) {
				oObject[sName] = sValue;
				oObject.nested[sName] = sValue;
			}
		}

		function property(sName, sOld, sNew, sUpdated, bFire) {
			set(oCacheValue, sName, sOld);
			set(oNewValue, sName, sNew);
			set(oUpdatedValue, sName, sUpdated);
			if (bFire) {
				oHelperMock.expects("fireChange")
					.withExactArgs("~mChangeListener~", "base/path/" + sName, sUpdated);
				oHelperMock.expects("fireChange")
					.withExactArgs("~mChangeListener~", "base/path/nested/" + sName, sUpdated);
			}
		}

		function selected(sName, sOld, sNew, sUpdated, bFire) {
			property(sName, sOld, sNew, sUpdated, bFire);
			aSelect.push(sName);
			aSelect.push("nested/" + sName);
		}

		selected("changed", "old", "new1", "new1", true);
		selected("fromNull", null, "new2", "new2", true);
		selected("missing", "keep", undefined, "keep");
		selected("toNull", "old", null, null, true);
		selected("unchanged", "same", "same", "same");
		selected("editing", "protected", "protected", "protected");
		// TODO no change events as long as collection-valued properties are not supported
		selected("collection", [], ["a", "b"], ["a", "b"]);
		property("unselected", "keep", "new", "keep");
		property("unselectedCollection", ["a", "b"], [], ["a", "b"]);
		property("@odata.etag", "old", "new3", "new3", true);
		property("@new.annotation", undefined, "new4", "new4", true);
		property("@old.annotation", "old", undefined, undefined, true);
		property("@$ui5.client.annotation", "keep", undefined, "keep");
		property("changed@new.annotation", undefined, {value : "new"}, {value : "new"}, true);
		property("changed@old.annotation", {value : "old"}, undefined, undefined, true);
		property("unchanged@new.annotation", undefined, "new5", "new5", true);
		property("unchanged@old.annotation", "old", undefined, undefined, true);
		property("unselected@new.annotation", undefined, "new", undefined);
		property("unselected@old.annotation", "keep", undefined, "keep");
		selected("abc", "old", "new6", "new6", true);
		property("abcd", "keep", "new", "keep"); // "abcd".slice(0, "abcd".indexOf("@")) === "abc"

		oNewValueJSON = JSON.stringify(oNewValue);
		aSelectJSON = JSON.stringify(aSelect);
		oHelperMock.expects("buildSelect").withExactArgs(sinon.match.same(aSelect))
			.callThrough(); // no use in showing the resulting oSelect here

		// code under test
		_Helper.updateSelected("~mChangeListener~", "base/path", oCacheValue, oNewValue, aSelect);

		assert.deepEqual(oCacheValue, oUpdatedValue);
		assert.strictEqual(JSON.stringify(oNewValue), oNewValueJSON);
		assert.strictEqual(JSON.stringify(aSelect), aSelectJSON);
	});

	//*********************************************************************************************
	QUnit.test("updateSelected: empty base path", function (assert) {
		var oOldValue = {};

		this.mock(_Helper).expects("fireChange").withExactArgs("~mChangeListener~", "foo", "bar");

		// code under test
		_Helper.updateSelected("~mChangeListener~", "", oOldValue, {foo : "bar"}, ["foo"]);

		assert.deepEqual(oOldValue, {foo : "bar"});
	});

	//*********************************************************************************************
[false, true].forEach((bUndefined) => {
	QUnit.test("updateSelected: private annotations, undefined: " + bUndefined, function (assert) {
		var oBinding = {},
			oContext = {oBinding : oBinding},
			// oContext is recursive and must not be descended into
			oOldValue = {"@$ui5._" : {context : oContext}};

		if (bUndefined) {
			oOldValue.foo = undefined; // MUST NOT make a difference
		}
		oBinding.oContext = oContext;
		this.mock(_Helper).expects("fireChange").withExactArgs("~mChangeListener~", "foo",
			undefined, true);

		// code under test
		_Helper.updateSelected("~mChangeListener~", "", oOldValue,
			{"@$ui5._" : {predicate : "(1)"}, bar : {}},
			["foo", "bar/*"]);

		assert.deepEqual(oOldValue, bUndefined ? {
			"@$ui5._" : {context : oContext, predicate : "(1)"},
			bar : {},
			foo : undefined,
			"foo@$ui5.noData" : true
		} : {
			"@$ui5._" : {context : oContext, predicate : "(1)"},
			bar : {},
			"foo@$ui5.noData" : true
		});
	});
});

	//*********************************************************************************************
[false, true].forEach((bUndefined) => {
	QUnit.test("updateSelected: create annotation, undefined: " + bUndefined, function (assert) {
		var oBinding = {},
			oHelperMock = this.mock(_Helper),
			oOldValue0 = {},
			oOldValue1 = {};

		if (bUndefined) {
			oOldValue0.foo = undefined; // MUST NOT make a difference
		}
		oBinding.oContext = {oBinding : oBinding};
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListener~", "foo", undefined,
			true);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListener~", "bar", undefined,
			true);

		oHelperMock.expects("buildPath").withExactArgs("", "foo").returns("foo");
		oHelperMock.expects("buildPath").withExactArgs("", "bar").returns("bar");
		oHelperMock.expects("buildPath").twice().withExactArgs("", "baz").returns("baz");
		oHelperMock.expects("buildPath").twice().withExactArgs("baz", "bar").returns("baz/bar");

		// code under test
		_Helper.updateSelected("~mChangeListener~", "", oOldValue0,
			{baz : {bar : {}}}, ["foo", "bar", "baz/bar"]);

		assert.deepEqual(oOldValue0, bUndefined ? {
			"bar@$ui5.noData" : true,
			baz : {bar : {}},
			foo : undefined,
			"foo@$ui5.noData" : true
		} : {
			"bar@$ui5.noData" : true,
			baz : {bar : {}},
			"foo@$ui5.noData" : true
		});

		// code under test (do not create annotation)
		_Helper.updateSelected("~mChangeListener~", "", oOldValue1,
			{baz : {bar : {}}}, ["foo", "bar", "baz/bar"], undefined, /*bOkIfMissing*/ true);

		assert.deepEqual(oOldValue1, {baz : {bar : {}}});
	});
});

	//*********************************************************************************************
	QUnit.test("updateSelected: $postBodyCollection", function (assert) {
		var oNewValue = {
				transient : [{foo : "new"}],
				upcoming : []
			},
			oOldValue = {
				transient : [{foo : "old"}],
				upcoming : null
			};

		oOldValue.transient.$postBodyCollection = true;
		this.mock(_Helper).expects("fireChange").never();

		// code under test
		_Helper.updateSelected("~mChangeListener~", "", oOldValue, oNewValue);

		assert.deepEqual(oOldValue, {
			transient : [{foo : "old"}],
			upcoming : []
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bNull) {
	var sTitle = "updateSelected: complex type was " + (bNull ? "null" : "missing") + " in cache";

	QUnit.test(sTitle, function (assert) {
		var oCacheValue = {},
			oHelperMock = this.mock(_Helper),
			oNewValue = {
				complex : {
					simple1 : "new1",
					simple2 : "new2",
					complex : null
				}
			},
			oNewValueJSON = JSON.stringify(oNewValue),
			aSelect = ["complex/simple1", "complex/simple2", "complex/complex/unseen"],
			aSelectJSON = JSON.stringify(aSelect);

		if (bNull) {
			oCacheValue.complex = null;
		}
		oHelperMock.expects("fireChange")
			.withExactArgs("~mChangeListener~", "base/path/complex/simple1", "new1");
		oHelperMock.expects("fireChange")
			.withExactArgs("~mChangeListener~", "base/path/complex/simple2", "new2");

		// code under test
		_Helper.updateSelected("~mChangeListener~", "base/path", oCacheValue, oNewValue, aSelect);

		assert.deepEqual(oCacheValue, oNewValue);
		assert.strictEqual(JSON.stringify(oNewValue), oNewValueJSON);
		assert.strictEqual(JSON.stringify(aSelect), aSelectJSON);
	});
});

	//*********************************************************************************************
	QUnit.test("updateSelected: complex type becomes null in cache", function (assert) {
		var oCacheValue = {
				toNull : {}
			},
			oHelperMock = this.mock(_Helper),
			oNewValue = {
				toNull : null
			},
			oNewValueJSON = JSON.stringify(oNewValue),
			aSelect = ["toNull/property"],
			aSelectJSON = JSON.stringify(aSelect);

		oHelperMock.expects("fireChanges")
			.withExactArgs("~mChangeListener~", "base/path/toNull",
				sinon.match.same(oCacheValue.toNull), true);

		// code under test
		_Helper.updateSelected("~mChangeListener~", "base/path", oCacheValue, oNewValue, aSelect);

		assert.deepEqual(oCacheValue, oNewValue);
		assert.strictEqual(JSON.stringify(oNewValue), oNewValueJSON);
		assert.strictEqual(JSON.stringify(aSelect), aSelectJSON);
	});

	//*********************************************************************************************
[undefined, ["selected"], ["selected/*"], ["foo", "bar", "*"]].forEach(function (aSelect) {
	var sTitle = "updateSelected: complex type is selected: " + aSelect;

	QUnit.test(sTitle, function (assert) {
		var oCacheValue = {
				selected : {
					changed : "old",
					nested : {
						changed : "old",
						unchanged : "same"
					},
					unchanged : "same"
				}
			},
			oHelperMock = this.mock(_Helper),
			oNewValue = {
				selected : {
					changed : "new1",
					nested : {
						changed : "new3",
						newComplex : {new : "new4"},
						newSimple : "new5",
						unchanged : "same"
					},
					new : "new2",
					unchanged : "same"
				}
			},
			oNewValueJSON = JSON.stringify(oNewValue),
			aSelectJSON = JSON.stringify(aSelect);

		function expectChange(sPath, vValue) {
			oHelperMock.expects("fireChange")
				.withExactArgs("~mChangeListener~", "base/path/" + sPath, vValue);
		}

		expectChange("selected/changed", "new1");
		expectChange("selected/new", "new2");
		expectChange("selected/nested/changed", "new3");
		expectChange("selected/nested/newComplex/new", "new4");
		expectChange("selected/nested/newSimple", "new5");

		// code under test
		_Helper.updateSelected("~mChangeListener~", "base/path", oCacheValue, oNewValue, aSelect);

		assert.deepEqual(oCacheValue, oNewValue);
		assert.strictEqual(JSON.stringify(oNewValue), oNewValueJSON);
		assert.strictEqual(JSON.stringify(aSelect), aSelectJSON);
	});
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
	QUnit.test("updateSelected: check key predicate, unchanged", function (assert) {
		var o = { // only a container for checkPredicate so that we can mock it
				checkKeyPredicate : function () {}
			},
			oMock = this.mock(o),
			oSource = {
				"@$ui5._" : {
					predicate : "('1')"
				},
				property : "new"
			},
			oTarget = {
				"@$ui5._" : {
					predicate : "('1')"
				},
				property : "old"
			};

		oMock.expects("checkKeyPredicate").withExactArgs("path").returns(true);

		// code under test
		_Helper.updateSelected({}, "path", oTarget, oSource, undefined, o.checkKeyPredicate);

		assert.deepEqual(oTarget, oSource);
	});

	//*********************************************************************************************
	QUnit.test("updateSelected: check key predicate, changed", function (assert) {
		var o = { // only a container for checkPredicate so that we can mock it
				checkKeyPredicate : function () {}
			},
			oMock = this.mock(o),
			oSource = {
				"@$ui5._" : {
					predicate : "('1')"
				}
			},
			oTarget = {
				"@$ui5._" : {
					predicate : "('0')"
				}
			};

		this.mock(_Helper).expects("buildPath").twice().withExactArgs("path", "@$ui5._");
		oMock.expects("checkKeyPredicate").withExactArgs("path").returns(true);

		assert.throws(function () {
			// code under test
			_Helper.updateSelected({}, "path", oTarget, oSource, undefined, o.checkKeyPredicate);
		}, new Error("Key predicate of 'path' changed from ('0') to ('1')"));

		oMock.expects("checkKeyPredicate").withExactArgs("path").returns(false);

		_Helper.updateSelected({}, "path", oTarget, oSource, undefined, o.checkKeyPredicate);

		assert.deepEqual(oTarget, oSource);
	});

	//*********************************************************************************************
[true, undefined].forEach(function (bAllowUndefined) {
	var sTitle = "informAll: comparison of old and new value fires all events, "
		+ "bAllowUndefined=" + bAllowUndefined;

	QUnit.test(sTitle, function (assert) {
		var mChangeListeners = {},
			vUndefinedValue = bAllowUndefined ? undefined : null,
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
				falsy : "",
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
				falsy : null,
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
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/deepOld",
				vUndefinedValue);
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/deep/old", vUndefinedValue);
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/getDeep/inside", "value");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/falsy", "");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/getFlat", "now");
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/getFlat/inside",
				vUndefinedValue);
		oHelperMock.expects("fireChange")
			.withExactArgs(sinon.match.same(mChangeListeners), "path/old", vUndefinedValue);

		// code under test
		_Helper.informAll(mChangeListeners, "path", oOld, oNew, bAllowUndefined);

		// assertion - no change on the old and the new value
		assert.strictEqual(JSON.stringify(oOld), sUnchangedOld);
		assert.strictEqual(JSON.stringify(oNew), sUnchangedNew);
	});
});

	//*********************************************************************************************
[{
	sPath : "foo/bar/baz",
	mQueryOptions : undefined,
	bSelected : false
}, {
	sPath : "foo/bar/baz",
	mQueryOptions : {},
	bSelected : true
}, {
	sPath : "foo/bar/baz",
	mQueryOptions : {$select : ["*"]},
	bSelected : true
}, {
	sPath : "foo/bar/baz",
	mQueryOptions : {$select : ["other", "foo/bar/baz"]},
	bSelected : true
}, {
	sPath : "foo/bar/baz",
	mQueryOptions : {$select : ["foo/bar"]},
	bSelected : true
}, {
	sPath : "foo/barbaz",
	mQueryOptions : {$select : ["foo/bar"]},
	bSelected : false
}, {
	sPath : "foo/barbaz/qux",
	mQueryOptions : {
		$expand : {
			"foo/bar" : {
				$select : ["other"]
			},
			"foo/barbaz" : {}
		}
	},
	bSelected : true
}, {
	sPath : "foo/bar/baz",
	mQueryOptions : {
		$expand : {
			"foo/bar" : {
				$select : ["other", "*"]
			}
		}
	},
	bSelected : true
}, {
	sPath : "foo/bar/baz",
	mQueryOptions : {
		$expand : {
			"foo/bar" : {
				$select : ["other"]
			}
		}
	},
	bSelected : false
}].forEach(function (oFixture, i) {
	QUnit.test("isSelected: " + i, function (assert) {
		assert.strictEqual(
			_Helper.isSelected(oFixture.sPath, oFixture.mQueryOptions), oFixture.bSelected);
	});
});

	//*********************************************************************************************
	QUnit.test("makeAbsolute", function (assert) {
		assert.strictEqual(_Helper.makeAbsolute("/foo/bar", "/baz"), "/foo/bar");
		assert.strictEqual(_Helper.makeAbsolute("baz", "/foo/bar"), "/foo/baz");
		assert.strictEqual(_Helper.makeAbsolute("Foo('1')/Bar(baz='2',qux=3)", "/service/"),
			"/service/Foo('1')/Bar(baz='2',qux=3)");
	});

	//*********************************************************************************************
	QUnit.test("makeRelativeUrl", function (assert) {
		assert.strictEqual(_Helper.makeRelativeUrl("/foo/baz", "/foo/bar"), "baz");
		assert.strictEqual(_Helper.makeRelativeUrl("/foo/bar/qux", "/foo/baz"), "bar/qux");
		assert.strictEqual(_Helper.makeRelativeUrl("/foo/baz", "/foo/bar/qux"), "../baz");
		assert.strictEqual(
			_Helper.makeRelativeUrl("/Bar(baz='2',qux=3)", "/Foo"),
			"Bar(baz='2',qux=3)");
	});

	//*********************************************************************************************
	QUnit.test("drillDown", function (assert) {
		var oObject = {
				foo : "bar",
				bar : {
					baz : "qux"
				},
				null : null
			};

		assert.strictEqual(_Helper.drillDown(oObject, []), oObject);
		assert.strictEqual(_Helper.drillDown(oObject, ["foo"]), "bar");
		assert.strictEqual(_Helper.drillDown(oObject, ["bar", "baz"]), "qux");
		assert.strictEqual(_Helper.drillDown(oObject, "bar/baz"), "qux");
		assert.strictEqual(_Helper.drillDown(oObject, ["unknown"]), undefined);
		assert.strictEqual(_Helper.drillDown(oObject, ["unknown", "value"]), undefined);
		assert.strictEqual(_Helper.drillDown(oObject, ["null"]), null);
		assert.strictEqual(_Helper.drillDown(oObject, ["null", "value"]), undefined);
	});

	//*********************************************************************************************
	QUnit.test("deleteProperty", function (assert) {
		var oObject = {
				foo : "foo",
				bar : "bar",
				baz : "baz"
			},
			oDrilledDown = {
				a : "abc",
				qux : "qux",
				x : "xyz"
			},
			oHelperMock = this.mock(_Helper);

		// code under test
		_Helper.deleteProperty(oObject, "bar");

		assert.deepEqual(oObject, {foo : "foo", baz : "baz"});

		oHelperMock.expects("drillDown")
			.withExactArgs(sinon.match.same(oObject), ["foo", "bar", "baz"])
			.returns(oDrilledDown);

		// code under test
		_Helper.deleteProperty(oObject, "foo/bar/baz/qux");

		assert.deepEqual(oDrilledDown, {a : "abc", x : "xyz"});

		[undefined, null].forEach(function (vValue) {
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oObject), ["qux"])
				.returns(vValue);

			// code under test
			_Helper.deleteProperty(oObject, "qux/foo");

			assert.deepEqual(oObject, {foo : "foo", baz : "baz"}, "unchanged");
		});
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
		dataPath : "/Foo(key='value')/" + Date.now() + "/bar(key='value')/" + Date.now(),
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
[false, true].forEach(function (bMissingPredicate) {
	QUnit.test("getPredicates: missing predicate = " + bMissingPredicate, function (assert) {
		var aContexts = [{
				getValue : function () {}
			}, {
				getValue : function () {}
			}, {
				getValue : function () {}
			}],
			oHelperMock = this.mock(_Helper);

		this.mock(aContexts[0]).expects("getValue").withExactArgs().returns("~value0~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~value0~", "predicate")
			.returns("('A')");
		this.mock(aContexts[1]).expects("getValue").withExactArgs().returns("~value1~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~value1~", "predicate")
			.returns(bMissingPredicate ? undefined : "('B')");
		this.mock(aContexts[2]).expects("getValue").withExactArgs().returns("~value2~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~value2~", "predicate")
			.returns("('C')");

		// code under test
		assert.deepEqual(_Helper.getPredicates(aContexts),
			bMissingPredicate ? null : ["('A')", "('B')", "('C')"]);
	});
});

	//*********************************************************************************************
	QUnit.test("getPredicateIndex", function (assert) {
		function success(sPath, sPredicate) {
			assert.strictEqual(sPath.slice(_Helper.getPredicateIndex(sPath)), sPredicate);
		}

		function fail(sPath) {
			assert.throws(function () {
				_Helper.getPredicateIndex(sPath);
			}, new Error("Not a list context path to an entity: " + sPath));
		}

		success("foo('bar')", "('bar')");
		success("foo('bar()')", "('bar()')");
		success("foo('bar')/baz('qux')", "('qux')");
		fail();
		fail("foo");
		fail("foo('bar'");
		fail("foo('bar')/baz)");
	});

	//*********************************************************************************************
	QUnit.test("checkGroupId", function (assert) {
		// valid group IDs
		_Helper.checkGroupId("myGroup");
		_Helper.checkGroupId("$auto");
		_Helper.checkGroupId("$auto.foo");
		_Helper.checkGroupId("$auto.1");
		_Helper.checkGroupId("$direct");
		_Helper.checkGroupId("$single", undefined, /*bAllowSingle*/true);
		_Helper.checkGroupId(undefined);
		_Helper.checkGroupId("myGroup", true);

		// invalid group IDs
		["", "$invalid", "$single", 42, null].forEach(function (vGroupId) {
			assert.throws(function () {
				_Helper.checkGroupId(vGroupId);
			}, new Error("Invalid group ID: " + vGroupId));
		});

		// invalid application group IDs
		["", "$invalid", 42, "$auto", "$direct", undefined].forEach(function (vGroupId) {
			assert.throws(function () {
				_Helper.checkGroupId(vGroupId, true);
			}, new Error("Invalid group ID: " + vGroupId));
		});

		// invalid group with custom message
		assert.throws(function () {
			_Helper.checkGroupId("$invalid", false, false, "Custom error message: ");
		}, new Error("Custom error message: $invalid"));
	});

	//*********************************************************************************************
	QUnit.test("clone", function (assert) {
		var oResult,
			oSource = {k1 : "v1", k2 : "v2"};

		function replacer(sKey, vValue) {
			if (sKey === "") {
				return vValue; // the whole object
			}
			return sKey === "k1" ? "w1" : undefined;
		}

		// code under test
		assert.strictEqual(_Helper.clone(null), null);
		assert.strictEqual(_Helper.clone(null, undefined, true), "null");

		// code under test
		assert.deepEqual(_Helper.clone({}), {});
		assert.strictEqual(_Helper.clone({}, undefined, true), "{}");

		// code under test
		oResult = _Helper.clone(oSource);

		assert.deepEqual(oResult, oSource);
		assert.notStrictEqual(oResult, oSource);

		// code under test
		assert.strictEqual(_Helper.clone(oSource, undefined, true), '{"k1":"v1","k2":"v2"}');

		// code under test
		assert.deepEqual(_Helper.clone(oSource, replacer), {k1 : "w1"});
		assert.deepEqual(_Helper.clone(oSource, replacer, true), '{"k1":"w1"}');

		// code under test
		assert.strictEqual(_Helper.clone(undefined), undefined);
		assert.strictEqual(_Helper.clone(undefined, undefined, true), undefined);

		// code under test
		assert.ok(Number.isNaN(_Helper.clone(NaN))); // no assertions for bAsString

		// code under test
		assert.strictEqual(_Helper.clone(Infinity), Infinity); // no assertions for bAsString

		// code under test
		assert.strictEqual(_Helper.clone(-Infinity), -Infinity); // no assertions for bAsString
	});

	//*********************************************************************************************
	QUnit.test("getPrivateAnnotation", function (assert) {
		var oObject = {
				"@$ui5._" : {
					null : null,
					transient : "foo"
				}
			};

		assert.strictEqual(_Helper.getPrivateAnnotation({}, "foo"), undefined);
		assert.strictEqual(_Helper.getPrivateAnnotation({}, "foo", "~default~"), "~default~");
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "foo"), undefined);
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "foo", "~default~"), "~default~");
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "null", "~default~"), null);
		assert.strictEqual(_Helper.getPrivateAnnotation(oObject, "transient"), "foo");

		assert.throws(function () {
			_Helper.getPrivateAnnotation(null, "foo", "~default~");
		}, TypeError);
	});

	//*********************************************************************************************
	QUnit.test("hasPrivateAnnotation", function (assert) {
		var oObject = {
				"@$ui5._" : {
					transient : undefined
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
	QUnit.test("copyPrivateAnnotation", function (assert) {
		var oHelperMock = this.mock(_Helper),
			oSource = {},
			oTarget = {};

		oHelperMock.expects("hasPrivateAnnotation").withExactArgs(sinon.match.same(oSource), "n/a")
			.returns(false);

		// code under test
		_Helper.copyPrivateAnnotation(oSource, "n/a", null);

		oHelperMock.expects("hasPrivateAnnotation").withExactArgs(sinon.match.same(oSource), "foo")
			.returns(true);
		oHelperMock.expects("hasPrivateAnnotation").withExactArgs(sinon.match.same(oTarget), "foo")
			.returns(false);
		oHelperMock.expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oSource), "foo")
			.returns(42);
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oTarget), "foo", 42);

		// code under test
		_Helper.copyPrivateAnnotation(oSource, "foo", oTarget);

		oHelperMock.expects("hasPrivateAnnotation").withExactArgs(sinon.match.same(oSource), "bar")
			.returns(true);
		oHelperMock.expects("hasPrivateAnnotation").withExactArgs(sinon.match.same(oTarget), "bar")
			.returns(true);

		assert.throws(function () {
			// code under test
			_Helper.copyPrivateAnnotation(oSource, "bar", oTarget);
		}, new Error("Must not overwrite: bar"));
	});

	//*********************************************************************************************
	QUnit.test("setAnnotation", function (assert) {
		var oObject = {};

		// code under test
		_Helper.setAnnotation(oObject, "@$ui5.foo", "go");

		assert.strictEqual(oObject["@$ui5.foo"], "go");

		// code under test
		_Helper.setAnnotation(oObject, "@$ui5.foo", "went");

		assert.strictEqual(oObject["@$ui5.foo"], "went");

		// code under test
		_Helper.setAnnotation(oObject, "@$ui5.foo");

		assert.deepEqual(oObject, {}, "gone");
	});

	//*********************************************************************************************
[false, true].forEach(function (bClientSide) {
	QUnit.test("publicClone: bClientSide=" + bClientSide, function (assert) {
		var oCloneMock = this.mock(_Helper).expects("clone")
				.withExactArgs("~value~", sinon.match.func, "~bAsString~"),
			fnReplacer;

		oCloneMock.returns("~clone~");

		// code under test
		assert.strictEqual(_Helper.publicClone("~value~", bClientSide, "~bAsString~"), "~clone~");

		fnReplacer = oCloneMock.getCall(0).args[1];

		// Check:
		//   - sKey === "@$ui5._" => fnReplacer(sKey, vValue) === undefined for each vValue
		//   - sKey !== "@$ui5._" => fnReplacer(sKey, vValue) === vValue for each vValue
		// code under test
		assert.strictEqual(fnReplacer("@$ui5._", 42), undefined);
		assert.strictEqual(fnReplacer("@$ui5.node.level", 2), bClientSide ? undefined : 2);
		assert.strictEqual(fnReplacer("@$ui5.transient", true), bClientSide ? undefined : true);
		assert.strictEqual(fnReplacer("ui5._", "bar"), "bar");
	});
});

	//*********************************************************************************************
	QUnit.test("cloneNo$", function (assert) {
		var oCloneExpectation = this.mock(_Helper).expects("clone")
				.withExactArgs("~value~", sinon.match.func)
				.returns("~clone~"),
			fnReplacer;

		// code under test
		assert.strictEqual(_Helper.cloneNo$("~value~"), "~clone~");

		fnReplacer = oCloneExpectation.getCall(0).args[1];

		// code under test
		assert.strictEqual(fnReplacer("$foo", 42), undefined);
		assert.strictEqual(fnReplacer("f$oo", 42), 42);
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

			// code under test (bIgnoreETag must not make a difference here)
			mResolvedHeaders = _Helper.resolveIfMatchHeader(oFixture.mHeaders, true);

			assert.strictEqual(mResolvedHeaders, oFixture.mHeaders);
			assert.deepEqual(mResolvedHeaders, oFixture.mResolvedHeader);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetInactiveEntity", function (assert) {
		var oContext = {setInactive : function () {}},
			oHelperMock = this.mock(_Helper),
			oInitialData = {
				foo : "foo",
				complex1 : {CITY : {ZIP : "ZIP"}},
				complex3 : {REGION : "REGION"}
			},
			oPostBody = {
				foo : "n/a", bar : "n/a", baz : "n/a",
				complex1 : {CITY : {NAME : {PARTS : {PART : "n/a"}}, ZIP : "n/a"}, COUNTRY : "n/a"},
				complex2 : {ID : "n/a"},
				complex3 : null
			},
			oExpectedPostBody = {
				foo : "foo",
				complex1 : {CITY : {ZIP : "ZIP"}},
				complex3 : {REGION : "REGION"}
			},
			oEntity = {
				"@$ui5._" : {
					context : oContext,
					initialData : oInitialData,
					postBody : oPostBody
				},
				foo : "n/a", bar : "n/a", baz : "n/a",
				complex1 : {CITY : {NAME : {PARTS : {PART : "n/a"}}, ZIP : "n/a"}, COUNTRY : "n/a"},
				complex2 : {ID : "n/a"},
				complex3 : null
			};

		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "initialData").returns(oInitialData);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "postBody").returns(oPostBody);

		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~", "path/foo", "foo");
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/bar", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/baz", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex1/CITY/NAME/PARTS/PART", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex1/CITY/ZIP", "ZIP");
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex1/COUNTRY", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex2/ID", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex3/REGION", "REGION");

		// fireChange will be called for the following paths, but realistically there will be no
		// change listeners for objects
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex1/CITY/NAME", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex1/CITY/NAME/PARTS", undefined);
		oHelperMock.expects("fireChange").withExactArgs("~mChangeListeners~",
			"path/complex2", undefined);

		oHelperMock.expects("updateAll").withExactArgs("~mChangeListeners~", "path",
			sinon.match.same(oEntity), {"@$ui5.context.isInactive" : true});
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "context")
			.returns(oContext);
		this.mock(oContext).expects("setInactive").withExactArgs();

		// code under test
		_Helper.resetInactiveEntity("~mChangeListeners~", "path", oEntity);

		assert.deepEqual(oEntity, {
			"@$ui5._" : {
				context : oContext,
				initialData : oInitialData,
				postBody : oExpectedPostBody
			},
			foo : "foo",
			complex1 : {CITY : {ZIP : "ZIP"}},
			complex3 : {REGION : "REGION"}
		});

		// to enforce object clone
		oEntity.complex3.REGION = "IGB";
		assert.deepEqual(oInitialData, {
			foo : "foo",
			complex1 : {CITY : {ZIP : "ZIP"}},
			complex3 : {REGION : "REGION"}
		});
		oEntity["@$ui5._"].postBody.complex3.REGION = "IGB";
		assert.deepEqual(oInitialData, {
			foo : "foo",
			complex1 : {CITY : {ZIP : "ZIP"}},
			complex3 : {REGION : "REGION"}
		});
	});

	//*********************************************************************************************
	[{
		mHeaders : {"If-Match" : {}},
		mResolvedHeader : {}
	}, {
		mHeaders : {"If-Match" : {}},
		bIgnoreETag : true,
		mResolvedHeader : {}
	}, {
		mHeaders : {"If-Match" : {"@odata.etag" : "foo"}},
		mResolvedHeader : {"If-Match" : "foo"}
	}, {
		mHeaders : {"If-Match" : {"@odata.etag" : "foo"}},
		bIgnoreETag : true,
		mResolvedHeader : {"If-Match" : "*"}
	}, {
		mHeaders : {"If-Match" : {"@odata.etag" : ""}},
		mResolvedHeader : {"If-Match" : ""}
	}, {
		mHeaders : {"If-Match" : {"@odata.etag" : ""}},
		bIgnoreETag : true,
		mResolvedHeader : {"If-Match" : "*"}
	}].forEach(function (oFixture, i) {
		QUnit.test("resolveIfMatchHeader: copy on write - " + i, function (assert) {
			var mResolvedHeaders;

			// code under test
			mResolvedHeaders
				= _Helper.resolveIfMatchHeader(oFixture.mHeaders, oFixture.bIgnoreETag);

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
		assert.deepEqual(mMap, {path1 : ["item1"]});

		_Helper.addByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {path1 : ["item1"], path2 : ["item2"]});

		_Helper.addByPath(mMap, "path3", undefined);
		assert.deepEqual(mMap, {path1 : ["item1"], path2 : ["item2"]});

		_Helper.addByPath(mMap, "path1", "item3");
		assert.deepEqual(mMap, {path1 : ["item1", "item3"], path2 : ["item2"]});

		_Helper.addByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {path1 : ["item1", "item3"], path2 : ["item2"]});
	});

	//*********************************************************************************************
	QUnit.test("removeByPath", function (assert) {
		var mMap = {path1 : ["item1", "item2"]};

		_Helper.removeByPath(mMap, "path1", "item2");
		assert.deepEqual(mMap, {path1 : ["item1"]});

		_Helper.removeByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {path1 : ["item1"]});

		_Helper.removeByPath(mMap, "path1", "item2");
		assert.deepEqual(mMap, {path1 : ["item1"]});

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
		mChildren : {A : true}
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
[
	{$kind : "Entity"},
	{$kind : "NavigationProperty"},
	{$kind : "NavigationProperty", $isCollection : true}
].forEach(function (oRootMetadata, i) {
	[false, true].forEach(function (bWithMessages) {
		[false, true].forEach(function (bMessagesRequested) {
			[false, true].forEach(function (bMessagesAnnotated) {
				var sTitle = "intersectQueryOptions: real intersection #" + i
						+ "; messages treated specially: " + bWithMessages
						+ "; messages explicitly requested: " + bMessagesRequested
						+ "; messages annotated: " + bMessagesAnnotated;

	QUnit.test(sTitle, function (assert) {
		var aCacheSelects = [/*"A", "B/b", "C", ...*/],
			mCacheQueryOptions = {
				$expand : {to1 : null},
				$select : aCacheSelects,
				"sap-client" : "123"
			},
			sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
			mChildren,
			mExpectedResult = {
				$expand : {to1 : null},
				$select : ["A/a", "B/b"],
				"sap-client" : "123"
			},
			oType = {},
			fnFetchMetadata = getFetchMetadata({
				"/Me/@com.sap.vocabularies.Common.v1.Messages/$Path" :
					bMessagesAnnotated ? "SAP_Messages" : undefined,
				"/Me" : oRootMetadata,
				"/Me/" : oType,
				"/Me/A/a" : "",
				"/Me/B/b" : "",
				"/Me/to1" : "1"
			}, bWithMessages),
			oHelperMock = this.mock(_Helper),
			aPaths = [/*"to1", "A/a", "B"*/];

		if (bMessagesRequested) {
			aPaths = ["to1", "A/a", "SAP_Messages", "B"];
			if (bWithMessages && bMessagesAnnotated) {
				mExpectedResult.$select.push("SAP_Messages");
			}
		}
		oHelperMock.expects("addChildrenWithAncestor")
			.withExactArgs(sinon.match.same(aPaths), sinon.match.same(aCacheSelects), {})
			.callsFake(function (_aChildren, _aAncestors, mChildren0) {
				mChildren = mChildren0;
				mChildren["A/a"] = true;
			});
		oHelperMock.expects("addChildrenWithAncestor")
			.withExactArgs(sinon.match.same(aCacheSelects), sinon.match.same(aPaths),
				sinon.match.object)
			.callsFake(function (_aChildren, _aAncestors, mChildren0) {
				assert.strictEqual(mChildren0, mChildren);
				mChildren["B/b"] = true;
			});
		oHelperMock.expects("addChildrenWithAncestor")
			.withExactArgs(["to1"], sinon.match.same(aPaths), {})
			.callsFake(function (_aChildren, _aAncestors, mSet) {
				mSet.to1 = true;
			});
		oHelperMock.expects("selectKeyProperties").exactly(i % 2)
			.withExactArgs(mExpectedResult, sinon.match.same(oType));

		assert.deepEqual(
			// code under test
			_Helper.intersectQueryOptions(mCacheQueryOptions, aPaths, fnFetchMetadata, "/Me",
				"", bWithMessages),
			mExpectedResult);

		assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions, "unmodified");
	});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: no query options", function (assert) {
		// code under test
		assert.strictEqual(_Helper.intersectQueryOptions(undefined, ["*"]), null);
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: no $select", function (assert) {
		// code under test
		assert.strictEqual(_Helper.intersectQueryOptions({}, ["*"]), null);
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: empty $select", function (assert) {
		// code under test
		assert.strictEqual(_Helper.intersectQueryOptions({$select : []}, ["B"]), null);
	});

	//*********************************************************************************************
	[{
		$expand : {
			toN : null
		},
		aPaths : ["toN/a"],
		sNavigationProperty : "/Me/toN"
	}].forEach(function (oFixture) {
		var sMessage = "Unsupported collection-valued navigation property "
			+ oFixture.sNavigationProperty;

		QUnit.test("intersectQueryOptions: " + sMessage, function (assert) {
			var mCacheQueryOptions = {
					$expand : oFixture.$expand,
					$select : ["A"]
				},
				sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
				mMetaPath2Type = {};

			mMetaPath2Type[oFixture.sNavigationProperty] = "N";
			assert.throws(function () {
				// code under test
				_Helper.intersectQueryOptions(mCacheQueryOptions, oFixture.aPaths,
					getFetchMetadata(mMetaPath2Type), "/Me", {});
				// Note: this error might be used by the caller to resort to other measures...
			}, new Error(sMessage));

			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
		});
	});

	//*********************************************************************************************
	[undefined, "~"].forEach(function (sPrefix) {
		var sTitle = "intersectQueryOptions: collection-valued navigation property"
				+ "; prefix = " + sPrefix;

		QUnit.test(sTitle, function (assert) {
			var mCacheQueryOptions = {
					$expand : {
						"A/toN" : null,
						toN : null
					},
					$select : []
				},
				sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
				mExpectedResult = {$expand : {"A/toN" : null, toN : null}, $select : []},
				oType = {},
				fnFetchMetadata = getFetchMetadata({
					"/Me" : {},
					"/Me/" : oType,
					"/Me/A" : "",
					"/Me/A/toN" : "N",
					"/Me/toN" : "N"
				});

			// code under test
			assert.deepEqual(
				_Helper.intersectQueryOptions(mCacheQueryOptions, ["A", "toN"],
					fnFetchMetadata, "/Me", sPrefix),
				mExpectedResult
			);

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
				toC : null
			},
			$select : ["A"],
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toA", "toC"], // toB omitted
		mResult : {
			$expand : {
				toA : null,
				toC : null
			},
			$select : [],
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toC", "toB", "toB/b", "D"], // Note "toB" is stronger than "toB/b"!
		mResult : {
			$expand : {
				toB : {$select : ["a"]},
				toC : null,
				"D/E/toD" : {$select : ["d"]}
			},
			$select : [],
			"sap-client" : "123"
		}
	}, {
		aPaths : ["toA/a", "toB/z"],
		mResult : {
			$expand : {
				toA : {
					$select : ["a"]
				}
			},
			$select : [],
			"sap-client" : "123"
		},
		mSelectKeyProperties : {
			"/Me/toA/" : {$select : ["a"]}
		}
	}, {
		aPaths : ["A", "toA/a"],
		mResult : {
			$expand : {
				toA : {
					$select : ["a"]
				}
			},
			$select : ["A"],
			"sap-client" : "123"
		},
		mSelectKeyProperties : {
			"/Me/toA/" : {$select : ["a"]}
		}
	}, {
		aPaths : ["toE/e", "toG/g"],
		mResult : {
			$expand : {
				toE : {
					$select : ["e"]
				},
				toG : {
					$select : ["g"]
				}
			},
			$select : [],
			"sap-client" : "123"
		},
		mSelectKeyProperties : {
			"/Me/toE/" : {$select : ["e"]},
			"/Me/toG/" : {$select : ["g"]}
		}
/* eslint-disable no-tabs */
//	}, { //TODO who would need this?
//		aPaths : ["E"],
//		mResult : {
//			$select : ["E/toF"],
//			"sap-client" : "123"
//		}
/* eslint-enable no-tabs */
	}, {
		aPaths : ["X", "*", "Z"],
		mResult : {
			$select : ["A", "B", "C", "E/toF", "SAP_Messages"],
			"sap-client" : "123"
		},
		bWithMessages : true
	}, {
		// Note: this test is using a recursion into "toA", but w/o mCacheQueryOptions the same
		// would happen for "$count" already!
		aPaths : ["toA/$count"], // Note: must not request metadata for $count!
		mResult : {
			$expand : {
				toA : {
					$select : ["$count"]
				}
			},
			$select : [],
			"sap-client" : "123"
		}
	}, {
		aPaths : ["X", "SAP_Messages", "*", "Z"],
		mResult : {
			$select : ["A", "B", "C", "E/toF", "SAP_Messages"],
			"sap-client" : "123"
		},
		bWithMessages : true
	}].forEach(function (o, i) {
		var sTitle = "intersectQueryOptions: " + o.aPaths + ", " + i;

		QUnit.test(sTitle, function (assert) {
			var mCacheQueryOptions = {
					$expand : {
						toA : null,
						toB : {$select : ["a"]},
						toC : null,
						"D/E/toD" : {$select : ["d"]},
						toE : {},
						toG : true
					},
					$select : ["A", "B", "C", "E/toF"],
					"sap-client" : "123"
				},
				sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
				mMetaPath2Type = {
					"/Me/@com.sap.vocabularies.Common.v1.Messages/$Path" : "SAP_Messages",
					"/Me" : {},
					"/Me/" : {},
					"/Me/A" : "",
					"/Me/A/C" : "",
					"/Me/A/to1" : "1",
					"/Me/A/toN" : "N",
					"/Me/B/C/toN" : "N",
					"/Me/B/C" : "",
					"/Me/D/E/toD" : "1",
					"/Me/E/toF" : "1",
					"/Me/toA" : "1",
					"/Me/toA/" : {},
					"/Me/toA/a" : "",
					"/Me/toB" : "1",
					"/Me/toC" : "1",
					"/Me/toE" : "1",
					"/Me/toE/" : {},
					"/Me/toE/e" : "",
					"/Me/toG" : "1",
					"/Me/toG/" : {},
					"/Me/toG/g" : ""
				},
				fnFetchMetadata = getFetchMetadata(mMetaPath2Type, o.bWithMessages),
				oHelperMock = this.mock(_Helper),
				mResult;

			if (o.mSelectKeyProperties) {
				Object.keys(o.mSelectKeyProperties).forEach(function (sEntityPath) {
					oHelperMock.expects("selectKeyProperties")
						.withExactArgs(o.mSelectKeyProperties[sEntityPath],
							sinon.match.same(mMetaPath2Type[sEntityPath]));
				});
			}
			// code under test
			mResult = _Helper.intersectQueryOptions(mCacheQueryOptions, o.aPaths, fnFetchMetadata,
				"/Me", "", o.bWithMessages);

			assert.deepEqual(mResult, o.mResult);
			if (mResult) {
				mResult.$select.length = 0; // show that this doesn't change mCacheQueryOptions
			}
			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
		});
	});

	//*********************************************************************************************
	QUnit.test("intersectQueryOptions: *, SAP_Messages", function (assert) {
		var mCacheQueryOptions = {
				$select : ["A", "SAP_Messages", "C"]
			},
			sCacheQueryOptions = JSON.stringify(mCacheQueryOptions),
			fnFetchMetadata = getFetchMetadata({
				"/Me/@com.sap.vocabularies.Common.v1.Messages/$Path" : "SAP_Messages",
				"/Me" : {}
			}, true);

		assert.deepEqual(
			// code under test
			_Helper.intersectQueryOptions(mCacheQueryOptions, ["*", "SAP_Messages"],
				fnFetchMetadata, "/Me", "", true),
			{$select : ["A", "SAP_Messages", "C"]}
		);

		assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
			"unmodified");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bPrefix) {
		var sPrefix = bPrefix ? "~" : undefined;

		QUnit.test("intersectQueryOptions: recursion; prefix = " + sPrefix, function (assert) {
			var mCacheQueryOptions = {
					$expand : {
						toC : null,
						"D/E/toD" : {$select : ["d"]}
					},
					$select : [],
					"sap-client" : "123"
				},
				mCacheQueryOptions0 = {},
				mCacheQueryOptions1 = {},
				mExpectedResult = {
					$expand : {
						toC : mCacheQueryOptions0,
						"D/E/toD" : mCacheQueryOptions1
					},
					$select : [],
					"sap-client" : "123"
				},
				oType = {},
				fnFetchMetadata = getFetchMetadata({
					"/Me" : {},
					"/Me/" : oType,
					"/Me/D/E/toD" : "1",
					"/Me/toC" : "1"
				}),
				oHelperMock = this.mock(_Helper),
				aPaths = ["toC/d", "D/E/toD/d"],
				aStrippedPaths0 = ["d"],
				aStrippedPaths1 = ["d"];

			oHelperMock.expects("intersectQueryOptions")
				.withExactArgs(sinon.match.same(mCacheQueryOptions),
					sinon.match.same(aPaths), sinon.match.same(fnFetchMetadata), "/Me", sPrefix)
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
					sinon.match.same(fnFetchMetadata), "/Me/toC", bPrefix ? "~/toC" : "toC")
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
					"/Me/D/E/toD", bPrefix ? "~/D/E/toD" : "D/E/toD")
				.returns(mCacheQueryOptions1);

			assert.deepEqual(
				// code under test
				_Helper.intersectQueryOptions(mCacheQueryOptions, aPaths, fnFetchMetadata, "/Me",
					sPrefix),
				mExpectedResult);
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
		this.mock(_Helper);
		var mCacheQueryOptions = {
				$expand : {"n/a" : null},
				$select : ["A", "*", "Z"],
				"sap-client" : "123"
			},
			oType = {},
			fnFetchMetadata = getFetchMetadata({
				"/Me" : {},
				"/Me/" : oType,
				"/Me/B" : "",
				"/Me/B/C" : "",
				"/Me/B/toN" : "N",
				"/Me/D" : "",
				"/Me/toN" : "N"
			});

		function test(mExpectedResult) {
			var sCacheQueryOptions = JSON.stringify(mCacheQueryOptions);

			// code under test
			assert.deepEqual(
				_Helper.intersectQueryOptions(mCacheQueryOptions, ["B/C", "D", "B/toN", "toN"],
					fnFetchMetadata, "/Me"),
				mExpectedResult);

			assert.strictEqual(JSON.stringify(mCacheQueryOptions), sCacheQueryOptions,
				"unmodified");
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
		QUnit.test("selectKeyProperties: " + (bKeys ? "w/" : "w/o") + " keys", function () {
			var aKeyProperties = ["foo", "path/to/key"],
				mQueryOptions = {},
				oType = bKeys ? {$Key : ["foo", {alias : "path/to/key"}]} : {};

			this.mock(_Helper).expects("addToSelect").exactly(bKeys ? 1 : 0)
				.withExactArgs(sinon.match.same(mQueryOptions), aKeyProperties);

			// code under test
			_Helper.selectKeyProperties(mQueryOptions, oType);
		});
	});

	//*********************************************************************************************
	QUnit.test("selectKeyProperties: no type metadata available", function () {
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
				NavigationProperty : {
					$select : ["Property", "Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty/Property",
		childQueryOptions : {},
		expected : {
			$expand : {
				NavigationProperty : {
					$select : ["Property_1", "Property_2", "Property"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty/Property_1",
		childQueryOptions : {},
		expected : {
			$expand : {
				NavigationProperty : {
					$select : ["Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "Property/NavigationProperty",
		childQueryOptions : {},
		expected : {
			$expand : {
				"Property/NavigationProperty" : {
					$select : ["Property_1", "Property_2"]
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
				NavigationProperty_1 : {
					$expand : {
						NavigationProperty_2 : {
							$foo : "bar",
							$select : ["Property_1", "Property_2"]
						}
					},
					$select : ["Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "*",
		childQueryOptions : {},
		expected : {$select : ["*"]}
	}, {
		childPath : "NavigationProperty_1/*",
		childQueryOptions : {},
		expected : {
			$expand : {
				NavigationProperty_1 : {
					$select : ["Property_1", "Property_2", "*"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty_1/namespace.*",
		childQueryOptions : {},
		expected : {
			$expand : {
				NavigationProperty_1 : {
					$select : ["Property_1", "Property_2", "namespace.*"]
				}
			}
		}
	}].forEach(function (oFixture) {
		QUnit.test("wrapChildQueryOptions, " + oFixture.childPath, function (assert) {
			var sChildQueryOptions = JSON.stringify(oFixture.childQueryOptions),
				oMetaModel = {
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

				if (sSegment.endsWith("*")) {
					return; // no metadata available here
				}

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
			assert.strictEqual(JSON.stringify(oFixture.childQueryOptions), sChildQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions: */$ref just fails", function (assert) {
		var oMetaModel = {
				// Note: "this" not needed, save Function#bind below
				fetchObject : function () {}
			};

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/.../*/$ref")
			.returns(SyncPromise.resolve());

		assert.throws(function () {
			// code under test
			_Helper.wrapChildQueryOptions("/...", "*/$ref", {}, oMetaModel.fetchObject);
		}); // don't care about exact failure, don't invent Log.error() message
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
		mQueryOptions : undefined,
		sOrderBy : undefined,
		aFilters : undefined
	}, {
		mQueryOptions : {$orderby : "bar", $select : "Name"},
		sOrderBy : undefined,
		aFilters : [undefined]
	}, {
		mQueryOptions : undefined,
		sOrderBy : "foo",
		aFilters : [""],
		oResult : {$orderby : "foo"}
	}, {
		mQueryOptions : {$orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		aFilters : undefined,
		oResult : {$orderby : "foo,bar", $select : "Name"}
	}, {
		mQueryOptions : {$orderby : "bar", $select : "Name"},
		sOrderBy : "bar",
		aFilters : undefined
	}, {
		mQueryOptions : undefined,
		sOrderBy : undefined,
		aFilters : ["foo"],
		oResult : {$filter : "foo"}
	}, {
		mQueryOptions : {$filter : "bar", $select : "Name"},
		sOrderBy : undefined,
		aFilters : ["foo,bar"],
		oResult : {$filter : "foo,bar", $select : "Name"}
	}, {
		mQueryOptions : {$filter : "bar", $select : "Name"},
		sOrderBy : undefined,
		aFilters : ["bar"]
	}, {
		mQueryOptions : {$filter : "bar", $orderby : "foo", $select : "Name"},
		sOrderBy : "foo",
		aFilters : ["bar"]
	}, {
		mQueryOptions : {$filter : "foo", $orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		aFilters : ["bar,baz"],
		oResult : {$filter : "bar,baz", $orderby : "foo,bar", $select : "Name"}
	}, {
		mQueryOptions : {$filter : "foo", $orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		aFilters : [undefined, "bar"],
		oResult : {
			$$filterBeforeAggregate : "bar",
			$filter : "foo",
			$orderby : "foo,bar",
			$select : "Name"
		}
	}, {
		mQueryOptions : {$filter : "foo", $orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		aFilters : ["", "bar,baz"],
		oResult : {
			$$filterBeforeAggregate : "bar,baz",
			$filter : "foo",
			$orderby : "foo,bar",
			$select : "Name"
		}
	}, {
		mQueryOptions : {$filter : "foo", $orderby : "bar", $select : "Name"},
		sOrderBy : "foo,bar",
		aFilters : ["bar,baz", "foo,bar"],
		oResult : {
			$$filterBeforeAggregate : "foo,bar",
			$filter : "bar,baz",
			$orderby : "foo,bar",
			$select : "Name"
		}
	}, {
		mQueryOptions : {
			$$filterBeforeAggregate : "baz",
			$filter : "foo",
			$orderby : "bar",
			$select : "Name"
		},
		sOrderBy : "foo,bar",
		aFilters : ["bar,baz"],
		oResult : {
			$$filterBeforeAggregate : "baz",
			$filter : "bar,baz",
			$orderby : "foo,bar",
			$select : "Name"
		}
	}].forEach(function (oFixture, i) {
		QUnit.test("mergeQueryOptions, " + i, function (assert) {
			var oResult,
				sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions);

			// code under test
			oResult = _Helper.mergeQueryOptions(oFixture.mQueryOptions, oFixture.sOrderBy,
				oFixture.aFilters);

			assert.strictEqual(JSON.stringify(oFixture.mQueryOptions), sQueryOptionsJSON);
			if ("oResult" in oFixture) {
				assert.deepEqual(oResult, oFixture.oResult, i);
			} else {
				assert.strictEqual(oResult, oFixture.mQueryOptions, i);
			}
			if (oResult) {
				assert.ok(oResult.$orderby || !("$orderby" in oResult), "$orderby");
				assert.ok(oResult.$filter || !("$filter" in oResult), "$filter");
				assert.ok(oResult.$$filterBeforeAggregate
					|| !("$$filterBeforeAggregate" in oResult), "$$filterBeforeAggregate");
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

		// code under test
		assert.strictEqual(_Helper.getRelativePath(oFixture.sPath.slice(1), "foo/bar"),
			oFixture.sResult);
	});
});

	//*********************************************************************************************
	QUnit.test("getRelativePath with empty sBasePath", function (assert) {
		// code under test
		assert.strictEqual(_Helper.getRelativePath("/Teams('42')", ""), "/Teams('42')");
		// code under test
		assert.strictEqual(_Helper.getRelativePath("Teams('42')", ""), "Teams('42')");
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
	QUnit.test("aggregateExpandSelect: " + oFixture.title, function (assert) {
		// code under test
		_Helper.aggregateExpandSelect(oFixture.aggregated, oFixture.additional);

		assert.deepEqual(oFixture.aggregated, oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("hasPathPrefix", function (assert) {
		var oHelperMock = this.mock(_Helper);

		oHelperMock.expects("getRelativePath").withExactArgs("sPath", "sBasePath")
			.returns(undefined);

		// code under test
		assert.strictEqual(_Helper.hasPathPrefix("sPath", "sBasePath"), false);

		oHelperMock.expects("getRelativePath").withExactArgs("sPath", "sBasePath").returns("");

		// code under test
		assert.strictEqual(_Helper.hasPathPrefix("sPath", "sBasePath"), true);
	});

	//*********************************************************************************************
	QUnit.test("aggregateExpandSelect: recursion", function () {
		var mAggregatedQueryOptions = {$expand : {foo : {}}},
			oHelperMock = this.mock(_Helper),
			mQueryOptions = {$expand : {foo : {}}};

		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.same(mAggregatedQueryOptions),
				sinon.match.same(mQueryOptions))
			.callThrough(); // start the recursion
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.same(mAggregatedQueryOptions.$expand.foo),
				sinon.match.same(mQueryOptions.$expand.foo));

		_Helper.aggregateExpandSelect(mAggregatedQueryOptions, mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("trampoline properties", function (assert) {
		assert.strictEqual(_Helper.deepEqual, deepEqual);
		assert.strictEqual(_Helper.merge, merge);
		assert.strictEqual(_Helper.uid, uid);
	});

	//*********************************************************************************************
[{
	// no $kind
}, {
	$kind : "Property"
}, {
	$kind : "NavigationProperty"
}].forEach(function (oFixture, i) {
	QUnit.test("fetchPropertyAndType: " + i, function (assert) {
		var oExpectedResult = oFixture.$kind ? {$kind : oFixture.$kind} : undefined,
			oMetaModel = {
				fetchObject : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel),
			oPromise,
			oSyncPromise = SyncPromise.resolve(oExpectedResult);

		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/resolved/child/metaPath")
			.returns(oSyncPromise);

		if (oFixture.$kind === "NavigationProperty") {
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("/resolved/child/metaPath/")
				.returns(SyncPromise.resolve());
		}

		// code under test
		oPromise = _Helper.fetchPropertyAndType(oMetaModel.fetchObject, "/resolved/child/metaPath");

		assert.strictEqual(oPromise.getResult(), oExpectedResult);
	});
});

	//*********************************************************************************************
	QUnit.test("extractMergeableQueryOptions", function (assert) {
		var mQueryOptions;

		// code under test
		assert.deepEqual(_Helper.extractMergeableQueryOptions({}), {});

		// code under test
		assert.deepEqual(_Helper.extractMergeableQueryOptions({$count : true}), {});

		mQueryOptions = {$expand : "expand"};
		// code under test
		assert.deepEqual(_Helper.extractMergeableQueryOptions(mQueryOptions), {$expand : "expand"});
		assert.deepEqual(mQueryOptions, {$expand : "~"});

		mQueryOptions = {$select : "select"};
		// code under test
		assert.deepEqual(_Helper.extractMergeableQueryOptions(mQueryOptions), {$select : "select"});
		assert.deepEqual(mQueryOptions, {$select : "~"});

		mQueryOptions = {
			$count : true,
			$expand : "expand",
			$select : "select"
		};
		// code under test
		assert.deepEqual(_Helper.extractMergeableQueryOptions(mQueryOptions), {
			$expand : "expand",
			$select : "select"
		});
		assert.deepEqual(mQueryOptions, {
			$count : true,
			$expand : "~",
			$select : "~"
		});
	});

	//*********************************************************************************************
	QUnit.test("createMissing: simple properties", function (assert) {
		var oObject = {bar : undefined};

		// code under test
		_Helper.createMissing(oObject, ["bar"]);

		assert.deepEqual(oObject, {bar : undefined});

		assert.throws(function () {
			// code under test
			_Helper.createMissing(oObject, ["bar", "invalid"]);
		}, TypeError);

		// code under test
		_Helper.createMissing(oObject, ["foo"]);

		assert.deepEqual(oObject, {bar : undefined, foo : null});

		// code under test (idempotency)
		_Helper.createMissing(oObject, ["foo"]);

		assert.deepEqual(oObject, {bar : undefined, foo : null});

		assert.throws(function () {
			// code under test
			_Helper.createMissing(oObject, ["foo", "invalid"]);
		}, TypeError);
	});

	//*********************************************************************************************
	QUnit.test("createMissing: paths", function (assert) {
		var oEmpty = {},
			oObject = {foo : oEmpty};

		// code under test
		_Helper.createMissing(oObject, ["foo"]);

		assert.deepEqual(oObject, {foo : {}});
		assert.strictEqual(oObject.foo, oEmpty);

		// code under test
		_Helper.createMissing(oObject, ["foo", "bar"]);

		assert.deepEqual(oObject, {foo : {bar : null}});
		assert.strictEqual(oObject.foo, oEmpty, "originally empty object has been modified");

		assert.throws(function () {
			// code under test
			_Helper.createMissing(oObject, ["foo", "bar", "invalid"]);
		}, TypeError);

		// code under test
		_Helper.createMissing(oObject, ["a", "b", "c"]);

		assert.deepEqual(oObject, {
			a : {
				b : {
					c : null
				}
			},
			foo : {
				bar : null
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("inheritPathValue: simple properties", function (assert) {
		var oSource = {bar : "<bar>", foo : "<foo>"},
			sSource = JSON.stringify(oSource),
			oTarget = {bar : undefined};

		// code under test
		_Helper.inheritPathValue(["foo"], oSource, oTarget);

		assert.deepEqual(oTarget, {bar : undefined, foo : "<foo>"});

		// code under test
		_Helper.inheritPathValue(["bar"], oSource, oTarget);

		assert.deepEqual(oTarget, {bar : undefined, foo : "<foo>"});
		assert.strictEqual(JSON.stringify(oSource), sSource, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("inheritPathValue: paths", function (assert) {
		var oEmpty = {},
			oSource = {
				foo : {
					bar : "<bar>"
				}
			},
			sSource = JSON.stringify(oSource),
			oTarget0 = {},
			oTarget1 = {
				foo : oEmpty
			},
			oTarget2 = {
				foo : {
					bar : undefined
				}
			};

		// code under test
		_Helper.inheritPathValue(["foo", "bar"], oSource, oTarget0);

		assert.deepEqual(oTarget0, {
			foo : {
				bar : "<bar>"
			}
		});

		// code under test
		_Helper.inheritPathValue(["foo", "baz"], oSource, oTarget0);

		assert.deepEqual(oTarget0, {
			foo : {
				bar : "<bar>",
				baz : undefined // we don't care that "baz" was actually missing in source
			}
		});

		// code under test
		_Helper.inheritPathValue(["foo", "bar"], oSource, oTarget1);

		assert.deepEqual(oTarget1, {
			foo : {
				bar : "<bar>"
			}
		});
		assert.strictEqual(oTarget1.foo, oEmpty, "originally empty object has been modified");

		// code under test
		_Helper.inheritPathValue(["foo", "bar"], oSource, oTarget2);

		assert.deepEqual(oTarget2, {
			foo : {
				bar : undefined
			}
		});

		assert.strictEqual(JSON.stringify(oSource), sSource, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("inheritPathValue: errors", function (assert) {
		var oSource = {
				foo : {
					bar : "<bar>"
				}
			};

		assert.throws(function () {
			// code under test
			_Helper.inheritPathValue(["foo", "bar"], oSource, {foo : null});
		}, TypeError);

		assert.throws(function () {
			// code under test
			_Helper.inheritPathValue(["bar", "foo"], oSource, {});
		}, TypeError);
	});

	//*********************************************************************************************
	QUnit.test("inheritPathValue: bTolerateNull", function (assert) {
		var oSource = {
				bar : "n/a",
				foo : {
					bar : "<bar>"
				}
			},
			oTarget = {
				foo : null
			};

		// code under test
		_Helper.inheritPathValue(["foo", "bar"], oSource, oTarget, true);

		assert.deepEqual(oTarget, {
			foo : {
				bar : "<bar>"
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("decomposeError: w/o ContentID, w/o details, w/o target", function (assert) {
		var oError = new Error("Message"),
			aErrors;

		oError.error = {message : "Top level message"};
		oError.status = 500;
		oError.statusText = "Internal Server Error";
		oError.strictHandlingFailed = true;

		this.mock(_Helper).expects("getContentID").withExactArgs(sinon.match.same(oError.error))
			.returns(undefined);

		// code under test
		aErrors = _Helper.decomposeError(oError, [{
				$ContentID : "0.0",
				$resourcePath : "~path0~",
				url : "~url0~"
			}, {
				$ContentID : "1.0",
				$resourcePath : "~path1~",
				url : "~url1~"
			}], "~serviceURL~/");

		assert.strictEqual(aErrors.length, 2);
		checkClonedError(assert, oError, aErrors[0], {
				message : "Top level message"
			}, "~serviceURL~/~url0~", "~path0~", true);
		checkClonedError(assert, oError, aErrors[1], {
				message : "Top level message",
				$ignoreTopLevel : true
			}, "~serviceURL~/~url1~", "~path1~", true);
	});

	//*********************************************************************************************
["n/a", ""].forEach(function (sTarget) {
	var sTitle = "decomposeError: w/o ContentID, w/ details, w/ + w/o target, top level target: "
			+ sTarget;

	QUnit.test(sTitle, function (assert) {
		var oError = new Error("Message"),
			aErrors,
			oHelperMock = this.mock(_Helper);

		oError.error = {
			message : "Top level message",
			target : sTarget,
			details : [{
				foo : "bar",
				message : "A Message",
				target : "n/a"
			}, {
				foo : "baz",
				message : "Another Message"
			}, {
				foo : "barbaz",
				message : "Yet another Message",
				target : ""
			}]
		};
		oError.status = 500;
		oError.statusText = "Internal Server Error";
		oHelperMock.expects("getContentID").withExactArgs(sinon.match.same(oError.error))
			.returns(undefined);
		oHelperMock.expects("getContentID").withExactArgs(oError.error.details[0])
			.returns(undefined);
		oHelperMock.expects("getContentID").withExactArgs(oError.error.details[1])
			.returns(undefined);
		oHelperMock.expects("getContentID").withExactArgs(oError.error.details[2])
			.returns(undefined);

		// code under test
		aErrors = _Helper.decomposeError(oError, [{
				$ContentID : "0.0",
				$resourcePath : "~path0~",
				url : "~url0~"
			}, {
				$ContentID : "1.0",
				$resourcePath : "~path1~",
				url : "~url1~"
			}, {
				$ContentID : "2.0",
				$resourcePath : "~path2~",
				url : "~url2~"
			}], "~serviceURL~/");

		assert.strictEqual(aErrors.length, 3);
		checkClonedError(assert, oError, aErrors[0], {
				message : sTarget ? "n/a: Top level message" : "Top level message",
				details : [{
					foo : "bar",
					message : "n/a: A Message"
				}, {
					foo : "baz",
					message : "Another Message"
				}, {
					foo : "barbaz",
					message : "Yet another Message"
				}]
			}, "~serviceURL~/~url0~", "~path0~");
		checkClonedError(assert, oError, aErrors[1], {
				message : "Top level message",
				target : sTarget,
				details : [],
				$ignoreTopLevel : true
			}, "~serviceURL~/~url1~", "~path1~");
		checkClonedError(assert, oError, aErrors[2], {
				message : "Top level message",
				target : sTarget,
				details : [],
				$ignoreTopLevel : true
			}, "~serviceURL~/~url2~", "~path2~");
	});
});

	//*********************************************************************************************
	QUnit.test("decomposeError: w/ ContentID", function (assert) {
		var oError = new Error("Message"),
			aErrors,
			oHelperMock = this.mock(_Helper);

		oError.error = {
			message : "Top level message",
			"@SAP__core.ContentID" : "1.0",
			details : [{
				message : "A message",
				"@SAP__core.ContentID" : "1.0"
			}]
		};
		oError.status = 500;
		oError.statusText = "Internal Server Error";
		oError.strictHandlingFailed = true;
		oHelperMock.expects("getContentID").withExactArgs(sinon.match.same(oError.error))
			.callThrough();
		oHelperMock.expects("getContentID").withExactArgs(oError.error.details[0])
			.callThrough();

		// code under test
		aErrors = _Helper.decomposeError(oError, [{
				$ContentID : "0.0",
				$resourcePath : "~path0~",
				url : "~url0~"
			}, {
				$ContentID : "1.0",
				$resourcePath : "~path1~",
				url : "~url1~"
			}], "~serviceURL~/");

		assert.strictEqual(aErrors.length, 2);
		checkClonedError(assert, oError, aErrors[0], {
				message : "Top level message",
				"@SAP__core.ContentID" : "1.0",
				$ignoreTopLevel : true,
				details : []
			}, "~serviceURL~/~url0~", "~path0~", true);
		checkClonedError(assert, oError, aErrors[1], {
				message : "Top level message",
				"@SAP__core.ContentID" : "1.0",
				details : [{
					message : "A message",
					"@SAP__core.ContentID" : "1.0"
				}]
			}, "~serviceURL~/~url1~", "~path1~", true);
	});

	//*********************************************************************************************
	QUnit.test("getAnnotation: success", function (assert) {
		var oMessage = {"~key~" : "~value~"};

		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oMessage), "~sName~").returns("~key~");

		// code under test
		assert.strictEqual(_Helper.getAnnotation(oMessage, "~sName~"), "~value~");
	});

	//*********************************************************************************************
	QUnit.test("getAnnotation: failure", function (assert) {
		var oMessage = {undefined : "~value~"};

		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oMessage), "~sName~").returns(undefined);

		// code under test
		assert.strictEqual(_Helper.getAnnotation(oMessage, "~sName~"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getAnnotationKey", function (assert) {
		// code under test
		assert.strictEqual(_Helper.getAnnotationKey({}, ".AnyAnnotation"), undefined,
			"empty object");

		// code under test
		assert.strictEqual(
			_Helper.getAnnotationKey({"@Foo.NotAnyAnnotation" : "n/a"}, ".AnyAnnotation"),
			undefined, "wrong term");

		// code under test
		assert.strictEqual(_Helper.getAnnotationKey({"@Foo.Bar" : "n/a"}, "bar"), undefined,
			"case matters");

		// code under test
		assert.strictEqual(
			_Helper.getAnnotationKey({"foo@Core.AnyAnnotation" : "n/a"}, ".AnyAnnotation"),
			undefined, "wrong property");

		// code under test
		assert.strictEqual(
			_Helper.getAnnotationKey({"foo@Core.AnyAnnotation" : "1.0"}, ".AnyAnnotation", "foo"),
			"foo@Core.AnyAnnotation", "success");

		// code under test
		assert.strictEqual(
			_Helper.getAnnotationKey({"@SAP__core.AnyAnnotation" : "1.0"}, ".AnyAnnotation"),
			"@SAP__core.AnyAnnotation", "underscores welcome");

		// code under test
		assert.strictEqual(
			_Helper.getAnnotationKey({"foo@Org.OData.Core.V1.AnyAnnotation" : "3.2"},
				".AnyAnnotation", "foo"),
			"foo@Org.OData.Core.V1.AnyAnnotation", "namespace, not alias");

		this.oLogMock.expects("warning")
			.withExactArgs("Cannot distinguish @Core.AnyAnnotation from @Foo.AnyAnnotation",
				undefined, sClassName);
		this.oLogMock.expects("warning")
			.withExactArgs("Cannot distinguish @Foo.AnyAnnotation from @SAP__core.AnyAnnotation",
				undefined, sClassName);

		// code under test
		assert.strictEqual(_Helper.getAnnotationKey({
				"@Core.AnyAnnotation" : "1.0",
				"@Foo.AnyAnnotation" : "1.0",
				"@SAP__core.AnyAnnotation" : "1.0"
			}, ".AnyAnnotation"), undefined, "multiple alias");
	});

	//*********************************************************************************************
	QUnit.test("getContentID", function (assert) {
		var oMessage = {};

		this.mock(_Helper).expects("getAnnotation")
			.withExactArgs(sinon.match.same(oMessage), ".ContentID")
			.returns("~ContentID~");

		assert.strictEqual(_Helper.getContentID(oMessage), "~ContentID~");
	});

	//*********************************************************************************************
	QUnit.test("getAdditionalTargets", function (assert) {
		var oMessage = {};

		this.mock(_Helper).expects("getAnnotation")
			.withExactArgs(sinon.match.same(oMessage), ".additionalTargets")
			.returns("~additionalTargets~");

		assert.strictEqual(_Helper.getAdditionalTargets(oMessage), "~additionalTargets~");
	});

	//*********************************************************************************************
	QUnit.test("filterPaths", function (assert) {
		var aPaths = ["/foo", "/bar/baz"];

		// code under test
		assert.deepEqual(_Helper.filterPaths(aPaths, ["/baz/qux"]), ["/baz/qux"]);

		// code under test
		assert.deepEqual(_Helper.filterPaths(aPaths, ["/foo"]), []);

		// code under test
		assert.deepEqual(_Helper.filterPaths(aPaths, ["/foobar", "/bar/baz/qux"]),
			["/foobar"]);

		// code under test
		assert.deepEqual(_Helper.filterPaths(aPaths, ["/bar(42)/baz", "/qux"]), ["/qux"]);
	});

	//*********************************************************************************************
	QUnit.test("adjustTargetsInError: technical error", function () {
		var oError = {};

		this.mock(_Helper).expects("adjustTargets").never();

		// code under test
		_Helper.adjustTargetsInError(oError, "oOperationMetadata", "sParameterContextPath",
			"sContextPath");
	});

	//*********************************************************************************************
	QUnit.test("adjustTargetsInError: no details", function () {
		var oError = {error : {}};

		this.mock(_Helper).expects("adjustTargets")
			.withExactArgs(sinon.match.same(oError.error), "oOperationMetadata",
				"sParameterContextPath", "sContextPath");

		// code under test
		_Helper.adjustTargetsInError(oError, "oOperationMetadata", "sParameterContextPath",
			"sContextPath");
	});

	//*********************************************************************************************
	QUnit.test("adjustTargetsInError: with details", function () {
		var oDetail0 = {},
			oDetail1 = {},
			oError = {
				error : {
					details : [oDetail0, oDetail1]
				}
			},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("adjustTargets")
			.withExactArgs(sinon.match.same(oError.error), "oOperationMetadata",
				"sParameterContextPath", "sContextPath");
		oHelperMock.expects("adjustTargets")
			.withExactArgs(sinon.match.same(oDetail0), "oOperationMetadata",
				"sParameterContextPath", "sContextPath");
		oHelperMock.expects("adjustTargets")
			.withExactArgs(sinon.match.same(oDetail1), "oOperationMetadata",
					"sParameterContextPath", "sContextPath");

		// code under test
		_Helper.adjustTargetsInError(oError, "oOperationMetadata", "sParameterContextPath",
			"sContextPath");
	});

	//*********************************************************************************************
	QUnit.test("adjustTargets: no target", function (assert) {
		var oMessage = {};

		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oMessage), ".additionalTargets")
			.returns(undefined);
		this.mock(_Helper).expects("getAdjustedTarget").never();

		// code under test
		_Helper.adjustTargets(oMessage, "oOperationMetadata", "sParameterContextPath",
			"sContextPath");

		assert.deepEqual(oMessage, {target : undefined});
	});

	//*********************************************************************************************
	QUnit.test("adjustTargets: without additional targets", function (assert) {
		var oMessage = {target : "target"};

		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oMessage), ".additionalTargets")
			.returns(undefined);
		this.mock(_Helper).expects("getAdjustedTarget")
			.withExactArgs("target", "oOperationMetadata", "sParameterContextPath", "sContextPath")
			.returns("~adjusted~");

		// code under test
		_Helper.adjustTargets(oMessage, "oOperationMetadata", "sParameterContextPath",
			"sContextPath");

		assert.deepEqual(oMessage, {target : "~adjusted~"});
	});

	//*********************************************************************************************
[true, false].forEach(function (bTargetIsValid) {
	var sTitle = "adjustTargets: with additional targets, target is valid: " + bTargetIsValid;

	QUnit.test(sTitle, function (assert) {
		var oHelperMock = this.mock(_Helper),
			oMessage = {
				target : "target",
				"@foo.additionalTargets" : ["additional1", "foo", "additional2"]
			};

		oHelperMock.expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oMessage), ".additionalTargets")
			.returns("@foo.additionalTargets");
		oHelperMock.expects("getAdjustedTarget")
			.withExactArgs("target", "oOperationMetadata", "sParameterContextPath", "sContextPath")
			.returns(bTargetIsValid ? "~adjusted~" : undefined);
		oHelperMock.expects("getAdjustedTarget")
			.withExactArgs("additional1", "oOperationMetadata", "sParameterContextPath",
				"sContextPath")
			.returns("~adjusted1~");
		oHelperMock.expects("getAdjustedTarget")
			.withExactArgs("foo", "oOperationMetadata", "sParameterContextPath",
				"sContextPath")
			.returns(undefined);
		oHelperMock.expects("getAdjustedTarget")
			.withExactArgs("additional2", "oOperationMetadata", "sParameterContextPath",
				"sContextPath")
			.returns("~adjusted2~");

		// code under test
		_Helper.adjustTargets(oMessage, "oOperationMetadata", "sParameterContextPath",
			"sContextPath");

		if (bTargetIsValid) {
			assert.deepEqual(oMessage, {
				target : "~adjusted~",
				"@foo.additionalTargets" : ["~adjusted1~", "~adjusted2~"]
			});
		} else {
			assert.deepEqual(oMessage, {
				target : "~adjusted1~",
				"@foo.additionalTargets" : ["~adjusted2~"]
			});
		}
	});
});

	//*********************************************************************************************
	QUnit.test("getAdjustedTarget: unbound operation", function (assert) {
		var oOperationMetadata = {
				$Parameter : [{$Name : "baz"}, {$Name : "foo"}]
			};

		assert.strictEqual(
			// code under test
			_Helper.getAdjustedTarget("bar", oOperationMetadata, "~parameterContextPath~"),
			undefined);

		assert.strictEqual(
			// code under test
			_Helper.getAdjustedTarget("foo", oOperationMetadata, "~parameterContextPath~"),
			"~parameterContextPath~/foo");

		assert.strictEqual(
			// code under test
			_Helper.getAdjustedTarget("foo/bar", oOperationMetadata, "~parameterContextPath~"),
			"~parameterContextPath~/foo/bar");

		assert.strictEqual(
			// code under test
			_Helper.getAdjustedTarget("$Parameter/foo/bar", oOperationMetadata,
				"~parameterContextPath~"),
			"~parameterContextPath~/foo/bar");
	});

	//*********************************************************************************************
	QUnit.test("getAdjustedTarget: bound operation", function (assert) {
		var oOperationMetadata = {
				$IsBound : true,
				$Parameter : [{$Name : "foo"}]
			};

		assert.strictEqual(
			// code under test
			_Helper.getAdjustedTarget("$Parameter/foo/bar", oOperationMetadata,
				"~parameterContextPath~", "~contextPath~"),
			"~contextPath~/bar");

		assert.strictEqual(
			// code under test
			_Helper.getAdjustedTarget("$Parameter/bar", oOperationMetadata,
				"~parameterContextPath~", "~contextPath~"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("extractMessages w/o oError.error", function (assert) {
		var oError = new Error("Failure"),
			aExpectedMessages = [{
				additionalTargets : undefined,
				code : undefined,
				message : "Failure",
				numericSeverity : 4,
				technical : true,
				transition : true,
				"@$ui5.error" : oError,
				"@$ui5.originalMessage" : oError
			}],
			oResult;

		oError.resourcePath = "some/resource/path"; // required for bound message

		this.mock(_Helper).expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oError));

		// code under test
		oResult = _Helper.extractMessages(oError);

		assert.deepEqual(oResult, aExpectedMessages);
		assert.strictEqual(oResult[0]["@$ui5.error"], oError);
		assert.strictEqual(oResult[0]["@$ui5.originalMessage"], oError);
	});

	//*********************************************************************************************
	QUnit.test("extractMessages with oError.error", function (assert) {
		var oError = new Error(),
			oDataError = {
				code : "code",
				details : [{
					code : "detail-code0",
					message : "detail-message0",
					technical : "~bTechnical0~"
				}, {
					code : "detail-code1",
					message : "detail-message1",
					technical : "~bTechnical1~"
				}, {
					code : "detail-code2",
					message : "detail-message2",
					technical : "~bTechnical2~",
					target : "$filter"
				}, {
					target : "",
					technical : "~bTechnical3~"
				}],
				message : "OData-Error"
			},
			aExpectedMessages = [{
				additionalTargets : "~undefined~",
				code : "code",
				message : "OData-Error",
				numericSeverity : 4,
				technical : true,
				transition : true,
				"@$ui5.error" : oError,
				"@$ui5.originalMessage" : oDataError
			}, {
				additionalTargets : "~add0-undefined~",
				code : "detail-code0",
				message : "detail-message0",
				technical : "~bTechnical0~",
				transition : true,
				numericSeverity : undefined,
				"@$ui5.error" : oError,
				"@$ui5.originalMessage" : oDataError.details[0]
			}, {
				additionalTargets : "~add1-undefined~",
				code : "detail-code1",
				message : "detail-message1",
				technical : "~bTechnical1~",
				transition : true,
				numericSeverity : undefined,
				"@$ui5.error" : oError,
				"@$ui5.originalMessage" : oDataError.details[1]
			}, {
				additionalTargets : "~add2-undefined~",
				code : "detail-code2",
				message : "$filter: detail-message2",
				technical : "~bTechnical2~",
				transition : true,
				numericSeverity : undefined,
				"@$ui5.error" : oError,
				"@$ui5.originalMessage" : oDataError.details[2]
			}, {
				additionalTargets : "~add3~",
				code : undefined,
				message : undefined,
				numericSeverity : undefined,
				target : "",
				technical : "~bTechnical3~",
				transition : true,
				"@$ui5.error" : oError,
				"@$ui5.originalMessage" : oDataError.details[3]
			}],
			oHelperMock = this.mock(_Helper),
			aMessages;

		oError.error = oDataError;
		oError.resourcePath = "some/resource/path"; // required for bound message

		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oDataError)).returns("~undefined~");
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oDataError.details[0])).returns("~add0-undefined~");
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oDataError.details[1])).returns("~add1-undefined~");
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oDataError.details[2])).returns("~add2-undefined~");
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oDataError.details[3])).returns("~add3~");

		// code under test
		aMessages = _Helper.extractMessages(oError);

		assert.deepEqual(aMessages, aExpectedMessages);
		assert.strictEqual(aMessages[0]["@$ui5.error"], oError);
		assert.strictEqual(aMessages[0]["@$ui5.originalMessage"], oDataError);
		assert.strictEqual(aMessages[1]["@$ui5.error"], oError);
		assert.strictEqual(aMessages[1]["@$ui5.originalMessage"], oDataError.details[0]);
		assert.strictEqual(aMessages[2]["@$ui5.error"], oError);
		assert.strictEqual(aMessages[2]["@$ui5.originalMessage"], oDataError.details[1]);
	});

	//*********************************************************************************************
	QUnit.test("extractMessages: special cases", function (assert) {
		// $ignoreTopLevel, numericSeverity, longtextUrl
		var oError = new Error(),
			oHelperMock = this.mock(_Helper),
			aMessages;

		oError.resourcePath = "some/resource/path"; // required for bound message
		oError.requestUrl = "the/requestUrl";
		oError.error = {
			$ignoreTopLevel : true,
			message : "ignored",
			details : [{
				numericSeverity : "does-not-fit",
				"@Common.numericSeverity.somethingElse" : "does-not-fit",
				"@com.sap.vocabularies.Common.v1.numericSeverity" : 1,
				"@Common.numericSeverity" : 2,
				longtextUrl : "does-not-fit",
				"@Common.longtextUrl.somethingElse" : "does-not-fit",
				"@com.sap.vocabularies.Common.v1.longtextUrl" : "some/longtextUrl",
				"@Common.longtextUrl" : "the/only/one/longtextUrl0"
			}, {
				target : "",
				"@Common.numericSeverity" : 42,
				"@.numericSeverity" : 43,
				"@Common.longtextUrl" : "some/longtextUrl",
				"@.longtextUrl" : "the/only/one/longtextUrl1"
			}]
		};

		oHelperMock.expects("makeAbsolute")
			.withExactArgs(oError.error.details[0]["@com.sap.vocabularies.Common.v1.longtextUrl"],
				oError.requestUrl)
			.returns("~willBeOverwritten~");
		oHelperMock.expects("makeAbsolute")
			.withExactArgs(oError.error.details[0]["@Common.longtextUrl"], oError.requestUrl)
			.returns("/absolute/url0");
		oHelperMock.expects("makeAbsolute")
			.withExactArgs(oError.error.details[1]["@Common.longtextUrl"], oError.requestUrl)
			.returns("~willBeOverwritten~");
		oHelperMock.expects("makeAbsolute")
			.withExactArgs(oError.error.details[1]["@.longtextUrl"], oError.requestUrl)
			.returns("/absolute/url1");

		// code under test
		aMessages = _Helper.extractMessages(oError);

		assert.strictEqual(aMessages[0].numericSeverity, 2);
		assert.strictEqual(aMessages[1].numericSeverity, 43);
		assert.strictEqual(aMessages[0].longtextUrl, "/absolute/url0");
		assert.strictEqual(aMessages[1].longtextUrl, "/absolute/url1");

		oError.error.details = [{
			"@Common0.longtextUrl" : undefined,
			"@Common1.longtextUrl" : null,
			"@.longtextUrl" : "",
			"@Core.longtextUrl" : 0
		}];

		oHelperMock.expects("makeAbsolute").never();

		// code under test (falsy longtextUrl)
		aMessages = _Helper.extractMessages(oError);

		assert.strictEqual(aMessages[0].longtextUrl, undefined);
		assert.strictEqual(aMessages.length, 1);

		delete oError.error.details;

		// code under test (no oError.error.details)
		aMessages = _Helper.extractMessages(oError);

		assert.strictEqual(aMessages.length, 0);
	});

	//*********************************************************************************************
	QUnit.test("extractMessages: no resource path -> unbound", function (assert) {
		// a bound message will be reported as unbound if there is no resource path
		var oError = new Error(),
			aMessages;

		oError.error = {
			message : "message",
			target : "target"
		};

		// code under test
		aMessages = _Helper.extractMessages(oError);

		assert.strictEqual(aMessages.length, 1);
		assert.strictEqual(aMessages[0].message, "target: message");
		assert.notOk("target" in aMessages[0]);
	});

	//*********************************************************************************************
	QUnit.test("isDataAggregation", function (assert) {
		// code under test
		assert.strictEqual(_Helper.isDataAggregation(), undefined);

		// code under test
		assert.strictEqual(_Helper.isDataAggregation({}), undefined);

		// code under test
		assert.strictEqual(_Helper.isDataAggregation({$$aggregation : {}}), true);

		// code under test
		assert.strictEqual(_Helper.isDataAggregation({$$aggregation : {hierarchyQualifier : "X"}}),
			false);
	});

	//*********************************************************************************************
	QUnit.test("buildSelect", function (assert) {
		// code under test
		assert.deepEqual(_Helper.buildSelect(undefined), true);

		// code under test
		assert.deepEqual(_Helper.buildSelect(["foo", "bar", "*"]), true);

		assert.deepEqual(
			// code under test
			_Helper.buildSelect([
				"simple1",
				"simple2",
				"complex/simple",
				"complex/all",
				"complex/all/simple", // sub-path in the list -> ignore
				"complex/complex/simple1",
				"complex/complex/simple2",
				"complex2/*",
				"complex2/simple", // already selected through "*"
				"complex3/complex/*",
				"all/simple", // sub-path in the list -> ignore
				"all"
			]), {
				all : true,
				complex : {
					all : true,
					complex : {
						simple1 : true,
						simple2 : true
					},
					simple : true
				},
				complex2 : true,
				complex3 : {
					complex : true
				},
				simple1 : true,
				simple2 : true
			});
	});

	//*********************************************************************************************
	QUnit.test("deleteUpdating", function (assert) {
		var oEntity = {
				foo : "",
				"foo@$ui5.updating" : true,
				keep : "",
				"keep@$ui5.updating" : true,
				sub : {
					bar : "",
					"bar@$ui5.updating" : true,
					subSub : null,
					qux : [0, 1, 2]
				}
			};

		// code under test
		_Helper.deleteUpdating("foo", oEntity);

		assert.deepEqual(oEntity, {
			foo : "",
			keep : "",
			"keep@$ui5.updating" : true,
			sub : {
				bar : "",
				"bar@$ui5.updating" : true,
				subSub : null,
				qux : [0, 1, 2]
			}
		});

		// code under test
		_Helper.deleteUpdating("sub/bar", oEntity);

		assert.deepEqual(oEntity, {
			foo : "",
			keep : "",
			"keep@$ui5.updating" : true,
			sub : {
				bar : "",
				subSub : null,
				qux : [0, 1, 2]
			}
		});

		// code under test
		_Helper.deleteUpdating("sub/subSub/baz", oEntity);

		assert.deepEqual(oEntity, {
			foo : "",
			keep : "",
			"keep@$ui5.updating" : true,
			sub : {
				bar : "",
				subSub : null,
				qux : [0, 1, 2]
			}
		});

		// code under test
		_Helper.deleteUpdating("sub/qux/1", oEntity);

		assert.deepEqual(oEntity, {
			foo : "",
			keep : "",
			"keep@$ui5.updating" : true,
			sub : {
				bar : "",
				subSub : null,
				qux : [0, 1, 2]
			}
		});
	});

	//*********************************************************************************************
[{ // handling undefined old
	oOld : undefined,
	oNew : undefined,
	oRestored : undefined
}, { // straight forward use cases: edited and NON edited properties, on top and nested
	oOld : {
		FirstName : "John",
		Name : "Doe - edited",
		"Name@$ui5.updating" : true,
		Address : {
			City : "Walldorf - edited",
			"City@$ui5.updating" : true,
			PostalCode : 0
		}
	},
	oNew : {
		FirstName : "John - server changed",
		Name : "foo1",
		Address : {
			City : "Walldorf",
			PostalCode : 69190
		}
	},
	oRestored : {
		FirstName : "John - server changed",
		Name : "Doe - edited",
		"Name@$ui5.updating" : true,
		Address : {
			City : "Walldorf - edited",
			"City@$ui5.updating" : true,
			PostalCode : 69190
		}
	}
}, { // special case: complex structure not yet seen on server side
	oOld : {
		Name : "Doe",
		Location : {
			Country : "Germany - edited",
			"Country@$ui5.updating" : true,
			City : {
				CityName : "Walldorf - edited",
				"CityName@$ui5.updating" : true,
				PostalCode : 69190,
				"PostalCode@$ui5.updating" : true
			}
		},
		Messages : [{}, {}, {}]
	},
	oNew : {
		Name : "Doe - server changed",
		Location : null,
		Messages : []
	},
	oRestored : {
		Name : "Doe - server changed",
		Location : {
			Country : "Germany - edited",
			"Country@$ui5.updating" : true,
			City : {
				CityName : "Walldorf - edited",
				"CityName@$ui5.updating" : true,
				PostalCode : 69190,
				"PostalCode@$ui5.updating" : true
			}
		},
		Messages : []
	}
}].forEach(function (oFixture, i) {
	QUnit.test("restoreUpdatingProperties: " + i, function (assert) {
		assert.deepEqual(
			// code under test
			_Helper.restoreUpdatingProperties(oFixture.oOld, oFixture.oNew),
			oFixture.oRestored);
	});
});

	//*********************************************************************************************
	QUnit.test("restoreUpdatingProperties: skip annotations", function () {
		var oCycle = {oBinding : {oContext : null}};

		oCycle.oBinding.oContext = oCycle;

		// code under test (no endless loop, e.g. @$ui5._.context may contain cycles)
		_Helper.restoreUpdatingProperties({"@foo" : oCycle});
	});

	//*********************************************************************************************
	QUnit.test("convertExpandSelectToPaths", function (assert) {
		assert.deepEqual(_Helper.convertExpandSelectToPaths({}), []);
		assert.deepEqual(_Helper.convertExpandSelectToPaths({
				$select : ["foo", "bar"]
			}),
			["foo", "bar"]);
		assert.deepEqual(_Helper.convertExpandSelectToPaths({
				$expand : {foo : {}},
				bar : "baz"
			}),
			[]);
		assert.deepEqual(_Helper.convertExpandSelectToPaths({
				$select : ["foo"],
				$expand : {
					bar : {
						$select : ["baz", "qux"],
						$expand : {
							quux : {$select : ["quuux"]}
						}
					}
				}
			}),
			["foo", "bar/baz", "bar/qux", "bar/quux/quuux"]);
	});

	//*********************************************************************************************
	QUnit.test("setLanguage", function (assert) {
		assert.strictEqual(
			// code under test
			_Helper.setLanguage("/some/path"),
			"/some/path");

		assert.strictEqual(
			// code under test
			_Helper.setLanguage("/some/path?foo=bar&sap-language=XY", "n/a"),
			"/some/path?foo=bar&sap-language=XY");

		assert.strictEqual(
			// code under test
			_Helper.setLanguage("/some/path?foo=bar&sap-language=XY&baz", "n/a"),
			"/some/path?foo=bar&sap-language=XY&baz");

		this.mock(_Helper).expects("encode").thrice().withExactArgs("XY").returns("%58Y");

		assert.strictEqual(
			// code under test
			_Helper.setLanguage("/some/path", "XY"),
			"/some/path?sap-language=%58Y");

		assert.strictEqual(
			// code under test
			_Helper.setLanguage("/some/path?foo=bar", "XY"),
			"/some/path?foo=bar&sap-language=%58Y");

		assert.strictEqual(
			// code under test
			_Helper.setLanguage("/some/path?mysap-language=bar", "XY"),
			"/some/path?mysap-language=bar&sap-language=%58Y");
	});

	//*********************************************************************************************
	QUnit.test("addPromise", function (assert) {
		var oElement = {},
			oPromise;

		// code under test
		oPromise = _Helper.addPromise(oElement);

		assert.strictEqual(oPromise.isPending(), true);
		_Helper.getPrivateAnnotation(oElement, "reject")("~oError~");
		assert.strictEqual(oPromise.isRejected(), true);
		oPromise.catch(function (oError) {
			assert.strictEqual(oError, "~oError~");
		});
	});

	//*********************************************************************************************
	QUnit.test("isMissingProperty", function (assert) {
		var oEntity = {
				collection : [{
					simple : true,
					nested1 : {
						simple : true,
						nested3 : null
					},
					nested2 : null
				}, {
					simple : true,
					nested1 : null,
					nested2 : {
						simple : true
					}
				}, {
					simple : true,
					nested1 : {
						simple : true,
						nested3 : {
							simple : true
						}
					},
					nested2 : null
				}],
				nested : {
					simple : true
				},
				empty : [],
				nulled : null,
				simple : true
			};

		function test(vValue, sPath, bExpected) {
			assert.strictEqual(_Helper.isMissingProperty(vValue, sPath), bExpected, sPath);
		}

		test(oEntity, "missing", true);
		test(oEntity, "simple", false);
		test(oEntity, "nested", false);
		test(oEntity, "nested/missing", true);
		test(oEntity, "nested/simple", false);
		test(oEntity, "nulled", false);
		test(oEntity, "missing/missing/missing", true);
		test(oEntity, "collection", false);
		test(oEntity, "collection/missing", true);
		test(oEntity, "collection/simple", false);
		test(oEntity, "collection/nested1/missing", true);
		test(oEntity, "collection/nested1/simple", false);
		test(oEntity, "collection/nested2/missing", true);
		test(oEntity, "collection/nested2/simple", false);
		test(oEntity, "collection/nested1/nested3/missing", true);
		test(oEntity, "collection/nested1/nested3/simple", false);
		test(oEntity, "empty", false);
		test(oEntity, "empty/simple", false);
		test(oEntity.collection, "missing", true);
		test(oEntity.collection, "simple", false);
		test(oEntity.collection, "nested1/missing", true);
		test(oEntity.collection, "nested1/simple", false);
		test(oEntity.collection, "nested2/missing", true);
		test(oEntity.collection, "nested2/simple", false);
		test(oEntity.collection, "nested1/nested3/missing", true);
		test(oEntity.collection, "nested1/nested3/simple", false);

		assert.throws(function () {
			_Helper.isMissingProperty(oEntity, "nested/*");
		}, new Error("Unsupported property path nested/*"));
	});

	//*********************************************************************************************
	QUnit.test("getMissingPropertyPaths", function (assert) {
		var oHelperMock = this.mock(_Helper),
			mQueryOptions = {
				$select : ["p1", "p2", "p3"],
				$expand : {np1 : true, np2 : true, np3 : true}
			};

		oHelperMock.expects("isMissingProperty").withExactArgs("~value~", "p1").returns(false);
		oHelperMock.expects("isMissingProperty").withExactArgs("~value~", "p2").returns(true);
		oHelperMock.expects("isMissingProperty").withExactArgs("~value~", "p3").returns(false);
		oHelperMock.expects("isMissingProperty").withExactArgs("~value~", "np1").returns(false);
		oHelperMock.expects("isMissingProperty").withExactArgs("~value~", "np2").returns(true);
		oHelperMock.expects("isMissingProperty").withExactArgs("~value~", "np3").returns(false);

		// code under test
		assert.deepEqual(_Helper.getMissingPropertyPaths("~value~", mQueryOptions), ["p2", "np2"]);

		// code under test
		assert.deepEqual(_Helper.getMissingPropertyPaths("~value~", {}), []);
	});

	//*********************************************************************************************
	QUnit.test("cancelNestedCreates", function () {
		var oCreatedElement0 = {},
			oCreatedElement1 = {},
			oElement = {
				SO_2_SOITEM : [oCreatedElement0, oCreatedElement1],
				nulled : null,
				otherCollection : [{}]
			},
			oHelperMock = this.mock(_Helper),
			fnReject0 = sinon.spy(),
			fnReject1 = sinon.spy();

		_Helper.setPrivateAnnotation(oCreatedElement0, "reject", fnReject0);
		_Helper.setPrivateAnnotation(oCreatedElement1, "reject", fnReject1);
		oElement.SO_2_SOITEM.$postBodyCollection = "~postBodyCollection~";
		oHelperMock.expects("cancelNestedCreates")
			.withExactArgs(sinon.match.same(oElement), "Error message")
			.callThrough(); // initial call
		oHelperMock.expects("cancelNestedCreates")
			.withExactArgs(sinon.match.same(oCreatedElement0), "Error message");
		oHelperMock.expects("cancelNestedCreates")
			.withExactArgs(sinon.match.same(oCreatedElement1), "Error message");

		// code under test
		_Helper.cancelNestedCreates(oElement, "Error message");

		[fnReject0, fnReject1].forEach(function (fnReject) {
			sinon.assert.calledOnceWithExactly(fnReject, sinon.match(function (oParameter) {
				return oParameter instanceof Error && oParameter.canceled
					&& oParameter.message === "Error message";
			}));
		});
	});

	//*********************************************************************************************
	QUnit.test("setCount", function () {
		var oHelperMock = this.mock(_Helper);

		oHelperMock.expects("updateExisting")
			.withExactArgs("~mChangeListeners~", "~sPath~", "~aCollection~", {$count : 42});

		// code under test
		_Helper.setCount("~mChangeListeners~", "~sPath~", "~aCollection~", 42);

		oHelperMock.expects("updateExisting")
			.withExactArgs("~mChangeListeners~", "~sPath~", "~aCollection~", {$count : 23});

		// code under test
		_Helper.setCount("~mChangeListeners~", "~sPath~", "~aCollection~", "23");
	});

	//*********************************************************************************************
	QUnit.test("addToCount", function () {
		var aCollection = [];

		aCollection.$count = 42;

		this.mock(_Helper).expects("setCount")
			.withExactArgs("~mChangeListeners~", "~sPath~", aCollection, 41);

		// code under test
		_Helper.addToCount("~mChangeListeners~", "~sPath~", aCollection, -1);

		delete aCollection.$count;

		// code under test
		_Helper.addToCount("~mChangeListeners~", "~sPath~", aCollection, 1);
	});

	//*********************************************************************************************
	QUnit.test("updateNestedCreates: no deep create", function (assert) {
		this.mock(_Helper).expects("getQueryOptionsForPath").twice()
			.withExactArgs("~mQueryOptions~", "path/to/entity")
			.returns({}); // no $expand

		assert.strictEqual(
			// code under test - not even a nested ODLB
			_Helper.updateNestedCreates("~mChangeListeners~", "~mQueryOptions~", "path/to/entity"),
			false);

		assert.strictEqual(
			// code under test - no nested create in foo
			_Helper.updateNestedCreates("~mChangeListeners~", "~mQueryOptions~", "path/to/entity",
				{/*oCacheEntity*/}, {/*oCreatedEntity*/}, {foo : "~$select~"}),
			false);
	});

	//*********************************************************************************************
	QUnit.test("updateNestedCreates: single", function (assert) {
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getQueryOptionsForPath").exactly(3)
			.withExactArgs("~mQueryOptions~", "path/to/entity")
			.returns({$expand : {foo : "~", nested : "~"}});
		oHelperMock.expects("drillDown").exactly(3)
			.withExactArgs("~target~", "foo").returns(undefined);

		oHelperMock.expects("drillDown").withExactArgs("~target~", "nested").returns({});

		assert.deepEqual(
			_Helper.updateNestedCreates("~mChangeListeners~", "~mQueryOptions~", "path/to/entity",
				"~target~", "~created~"),
			true);

		oHelperMock.expects("drillDown").withExactArgs("~target~", "nested").returns([]);

		assert.deepEqual(
			_Helper.updateNestedCreates("~mChangeListeners~", "~mQueryOptions~", "path/to/entity",
				"~target~", "~created~"),
			false);

		oHelperMock.expects("drillDown").withExactArgs("~target~", "nested").returns(undefined);

		assert.deepEqual(
			_Helper.updateNestedCreates("~mChangeListeners~", "~mQueryOptions~", "path/to/entity",
				"~target~", "~created~"),
			false);
	});

	//*********************************************************************************************
	QUnit.test("updateNestedCreates: collections", function (assert) {
		var oCacheEntity = {
				nested1 : ["n/a"],
				nested2 : ["n/a"],
				nested3 : ["n/a"]
			},
			oCreatedEntity = {
				nested1 : ["~created11~", "~created12~"],
				nested2 : ["~created21~"]
			},
			oHelperMock = this.mock(_Helper),
			mSelectForMetaPath = {
				nested1 : "~$select1~",
				"nested1/foo" : "~$select1foo~",
				"nested1/bar" : "~$select1bar~",
				nested2 : undefined,
				"nested2/foo" : "~$select2foo~",
				nested3 : "~$select3~"
			};

		oHelperMock.expects("updateNestedCreates")
			.withExactArgs("~mChangeListeners~", "~mQueryOptions~", "path/to/entity",
				sinon.match.same(oCacheEntity), sinon.match.same(oCreatedEntity),
				sinon.match.same(mSelectForMetaPath))
			.callThrough(); // initial call
		oCacheEntity.nested1.$postBodyCollection = "~postBodyCollection1~";
		// nested1
		oHelperMock.expects("setCount")
			.withExactArgs("~mChangeListeners~", "path/to/entity/nested1",
				sinon.match(function (aEntities) { return aEntities === oCacheEntity.nested1; }),
				2)
			.callsFake(function () {
				assert.strictEqual(oCacheEntity.nested1.$count, undefined);
				assert.ok("$count" in oCacheEntity.nested1);
			});
		// created11
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs("~created11~", "predicate").returns("~predicate11~");
		oHelperMock.expects("updateNestedCreates")
			.withExactArgs("~mChangeListeners~", "~mQueryOptions~",
				"path/to/entity/nested1~predicate11~", "~created11~", "~created11~",
				{foo : "~$select1foo~", bar : "~$select1bar~"});
		// created12
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs("~created12~", "predicate").returns("~predicate12~");
		oHelperMock.expects("updateNestedCreates")
			.withExactArgs("~mChangeListeners~", "~mQueryOptions~",
				"path/to/entity/nested1~predicate12~", "~created12~", "~created12~",
				{foo : "~$select1foo~", bar : "~$select1bar~"});
		// nested2
		oHelperMock.expects("setCount")
			.withExactArgs("~mChangeListeners~", "path/to/entity/nested2",
				sinon.match(function (aEntities) { return aEntities === oCacheEntity.nested2; }),
				1);
		// created21
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs("~created21~", "predicate").returns("~predicate21~");
		oHelperMock.expects("updateNestedCreates")
			.withExactArgs("~mChangeListeners~", "~mQueryOptions~",
				"path/to/entity/nested2~predicate21~", "~created21~", "~created21~",
				{foo : "~$select2foo~"});

		assert.strictEqual(
			// code under test
			_Helper.updateNestedCreates("~mChangeListeners~", "~mQueryOptions~", "path/to/entity",
				oCacheEntity, oCreatedEntity, mSelectForMetaPath),
			true);

		assert.deepEqual(oCacheEntity, {
			nested1 : ["~created11~", "~created12~"],
			nested2 : ["~created21~"]
		});
		assert.strictEqual(oCacheEntity.nested1.$created, 0);
		assert.ok(oCacheEntity.nested1.$transfer, true);
		assert.deepEqual(oCacheEntity.nested1.$byPredicate, {
			"~predicate11~" : "~created11~",
			"~predicate12~" : "~created12~"
		});
		assert.strictEqual(oCacheEntity.nested2.$created, 0);
		assert.deepEqual(oCacheEntity.nested2.$byPredicate, {
			"~predicate21~" : "~created21~"
		});
		assert.notOk("$transfer" in oCacheEntity.nested2);
		assert.notOk("$postBodyCollection" in oCacheEntity.nested1);
	});

	//*********************************************************************************************
	QUnit.test("copySelected", function (assert) {
		let oTarget = {"@$ui5.context.isSelected" : false};

		// code under test
		_Helper.copySelected({foo : true, "@$ui5.context.isSelected" : true}, oTarget);

		assert.deepEqual(oTarget, {"@$ui5.context.isSelected" : true});

		oTarget = {};

		// code under test
		_Helper.copySelected({foo : true, "@$ui5.context.isSelected" : false}, oTarget);

		assert.deepEqual(oTarget, {});
	});

	//*********************************************************************************************
	QUnit.test("makeUpdateData", function (assert) {
		assert.deepEqual(_Helper.makeUpdateData(["Age"], 42), {Age : 42});
		assert.deepEqual(_Helper.makeUpdateData(["Address", "City"], "Walldorf"),
			{Address : {City : "Walldorf"}});
		assert.deepEqual(_Helper.makeUpdateData(["Age"], 42, /*bUpdating*/true), {
			Age : 42,
			"Age@$ui5.updating" : true
		});
		assert.deepEqual(_Helper.makeUpdateData(["Address", "City"], "Walldorf", /*bUpdating*/true),
			{
				Address : {
					City : "Walldorf",
					"City@$ui5.updating" : true
				}
			});
	});
});
