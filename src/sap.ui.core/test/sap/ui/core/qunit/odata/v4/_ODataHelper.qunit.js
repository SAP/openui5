/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/Sorter"
], function (jQuery, Context, _ODataHelper, _Helper, _Parser, Sorter) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._ODataHelper", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	[{
		sKeyPredicate : "(ID='42')",
		oEntityInstance : {"ID" : "42"},
		oEntityType : {
			"$Key" : ["ID"],
			"ID" : {
				"$Type" : "Edm.String"
			}
		}
	}, {
		sKeyPredicate : "(Sector='DevOps',ID='42')",
		oEntityInstance : {"ID" : "42", "Sector" : "DevOps"},
		oEntityType : {
			"$Key" : ["Sector", "ID"],
			"Sector" : {
				"$Type" : "Edm.String"
			},
			"ID" : {
				"$Type" : "Edm.String"
			}
		}
	}, {
		sKeyPredicate : "(Bar=42,Fo%3Do='Walter%22s%20Win''s')",
		oEntityInstance : {
			"Bar" : 42,
			"Fo=o" : "Walter\"s Win's"
		},
		oEntityType : {
			"$Key" : ["Bar", "Fo=o"],
			"Bar" : {
				"$Type" : "Edm.Int16"
			},
			"Fo=o" : {
				"$Type" : "Edm.String"
			}
		}
	}].forEach(function (oFixture) {
		QUnit.test("getKeyPredicate: " + oFixture.sKeyPredicate, function (assert) {
			var sProperty;

			this.spy(_Helper, "formatLiteral");

			assert.strictEqual(
				_ODataHelper.getKeyPredicate(oFixture.oEntityType, oFixture.oEntityInstance),
				oFixture.sKeyPredicate);

			// check that _Helper.formatLiteral() is called for each property
			for (sProperty in oFixture.oEntityType) {
				if (sProperty[0] !== "$") {
					assert.ok(
						_Helper.formatLiteral.calledWithExactly(
							oFixture.oEntityInstance[sProperty],
							oFixture.oEntityType[sProperty].$Type),
						_Helper.formatLiteral.printf(
							"_Helper.formatLiteral('" + sProperty + "',...) %C"));
				}
			}
		});
	});
	//TODO handle keys with aliases!

	//*********************************************************************************************
	[{
		mModelOptions : {"sap-client" : "111"},
		mOptions : {"$expand" : {"foo" : null}, "$select" : ["bar"], "custom" : "baz"},
		aAllowed : ["$expand", "$select"]
	}, {
		mModelOptions : {"custom" : "bar"},
		mOptions : {"custom" : "foo"},
		aAllowed : []
	}, {
		mModelOptions : undefined,
		mOptions : undefined,
		aAllowed : undefined
	}, {
		mModelOptions : null,
		mOptions : {"sap-client" : "111"},
		aAllowed : null,
		bSapAllowed : true
	}].forEach(function (o) {
		QUnit.test("buildQueryOptions success " + JSON.stringify(o), function (assert) {
			var mOptions,
				mOriginalModelOptions =
					o.mModelOptions && JSON.parse(JSON.stringify(o.mModelOptions)),
				mOriginalOptions = o.mOptions && JSON.parse(JSON.stringify(o.mOptions));

			mOptions = _ODataHelper.buildQueryOptions(o.mModelOptions, o.mOptions, o.aAllowed,
				o.bSapAllowed);

			assert.deepEqual(mOptions, jQuery.extend({}, o.mModelOptions, o.mOptions));
			assert.deepEqual(o.mModelOptions, mOriginalModelOptions);
			assert.deepEqual(o.mOptions, mOriginalOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("buildQueryOptions with $$ options", function (assert) {
		assert.deepEqual(_ODataHelper.buildQueryOptions({}, {$$groupId : "$direct"}), {});
	});

	//*********************************************************************************************
	QUnit.test("buildQueryOptions: parse system query options", function (assert) {
		var oExpand = {"foo" : true},
			oParserMock = this.mock(_Parser),
			aSelect = ["bar"];

		oParserMock.expects("parseSystemQueryOption")
			.withExactArgs("$expand=foo").returns({"$expand" : oExpand});
		oParserMock.expects("parseSystemQueryOption")
			.withExactArgs("$select=bar").returns({"$select" : aSelect});

		assert.deepEqual(_ODataHelper.buildQueryOptions({}, {
			$expand : "foo",
			$select : "bar"
		}, ["$expand", "$select"]), {
			$expand : oExpand,
			$select : aSelect
		});
	});

	//*********************************************************************************************
	[{
		mModelOptions : {},
		mOptions : {"$foo" : "foo"},
		aAllowed : ["$expand", "$select"],
		error : "System query option $foo is not supported"
	}, {
		mModelOptions : {},
		mOptions : {"@alias" : "alias"},
		aAllowed : ["$expand", "$select"],
		error : "Parameter @alias is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"$expand" : {"foo" : true}},
		aAllowed : undefined,
		error : "System query option $expand is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"$expand" : {"foo" : {"$select" : "bar"}}},
		aAllowed : ["$expand"],
		error : "System query option $select is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"$expand" : {"foo" : {"select" : "bar"}}},
		aAllowed : ["$expand", "$select"],
		error : "System query option select is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"sap-foo" : "300"},
		aAllowed : undefined,
		error : "Custom query option sap-foo is not supported"
	}].forEach(function (o) {
		QUnit.test("buildQueryOptions error " + JSON.stringify(o), function (assert) {
			assert.throws(function () {
				_ODataHelper.buildQueryOptions(o.mModelOptions, o.mOptions, o.aAllowed);
			}, new Error(o.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$groupId", function (assert) {
		assert.deepEqual(_ODataHelper.buildBindingParameters(undefined), {});
		assert.deepEqual(_ODataHelper.buildBindingParameters({}), {});
		assert.deepEqual(_ODataHelper.buildBindingParameters({$$groupId : "$auto"}),
			{$$groupId : "$auto"});
		assert.deepEqual(_ODataHelper.buildBindingParameters(
			{$$groupId : "$direct", custom : "foo"}), {$$groupId : "$direct"});

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$unsupported : "foo"});
		}, new Error("Unsupported binding parameter: $$unsupported"));

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$groupId : ""});
		}, new Error("Unsupported value '' for binding parameter '$$groupId'"));
		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$groupId : "~invalid"});
		}, new Error("Unsupported value '~invalid' for binding parameter '$$groupId'"));
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$updateGroupId", function (assert) {
		assert.deepEqual(_ODataHelper.buildBindingParameters({$$updateGroupId : "myGroup"}),
				{$$updateGroupId : "myGroup"});
		assert.deepEqual(_ODataHelper.buildBindingParameters(
				{$$updateGroupId : "$direct", custom : "foo"}), {$$updateGroupId : "$direct"});

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$unsupported : "foo"});
		}, new Error("Unsupported binding parameter: $$unsupported"));

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$updateGroupId : "~invalid"});
		}, new Error("Unsupported value '~invalid' for binding parameter '$$updateGroupId'"));
	});

	//*********************************************************************************************
	QUnit.test("checkGroupId", function (assert) {
		// valid group IDs
		_ODataHelper.checkGroupId("myGroup");
		_ODataHelper.checkGroupId("$auto");
		_ODataHelper.checkGroupId("$direct");
		_ODataHelper.checkGroupId(undefined);
		_ODataHelper.checkGroupId("myGroup", true);

		// invalid group IDs
		["", "$invalid", 42].forEach(function (vGroupId) {
			assert.throws(function () {
				_ODataHelper.checkGroupId(vGroupId);
			}, new Error("Invalid group ID: " + vGroupId));
		});

		// invalid application group IDs
		["", "$invalid", 42, "$auto", "$direct", undefined].forEach(function (vGroupId) {
			assert.throws(function () {
				_ODataHelper.checkGroupId(vGroupId, true);
			}, new Error("Invalid group ID: " + vGroupId));
		});

		// invalid group with custom message
		assert.throws(function () {
			_ODataHelper.checkGroupId("$invalid", false, "Custom error message: ");
		}, new Error("Custom error message: $invalid"));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bHasCache) {
		QUnit.test("createCacheProxy, cache creation, bHasCache=" + bHasCache, function (assert) {
			var oBinding = {},
				oCache = {},
				oCache2 = {},
				oCacheProxy1,
				oCacheProxy1a,
				oCacheProxy2,
				oCacheProxy3,
				oContext = {
					requestCanonicalPath : function () {}
				},
				oContext2 = {
					requestCanonicalPath : function () {}
				},
				oContext3 = {
					requestCanonicalPath : function () {}
				},
				oPathPromise = Promise.resolve("/canonical"),
				oPathPromise2 = Promise.resolve("/canonical2"),
				oPathPromise3 = Promise.resolve("/canonical3");

			if (bHasCache) {
				oBinding.oCache = {
					deregisterChange : function () {}
				};
				this.mock(oBinding.oCache).expects("deregisterChange").withExactArgs();
			}
			this.mock(oContext).expects("requestCanonicalPath").withExactArgs().twice()
				.returns(oPathPromise);
			this.mock(oContext2).expects("requestCanonicalPath").withExactArgs()
				.returns(oPathPromise2);
			this.mock(oContext3).expects("requestCanonicalPath").withExactArgs()
				.returns(oPathPromise3);

			// code under test
			oBinding.oCache = oCacheProxy1 =
				_ODataHelper.createCacheProxy(oBinding, oContext, function (sCanonicalPath) {
					assert.strictEqual(sCanonicalPath, "/canonical");
					return oCache;
				});

			return oCacheProxy1.promise.then(function (oC1) {
				assert.strictEqual(oC1, oCache);

				// code under test
				oBinding.oCache = oCacheProxy2 =
					_ODataHelper.createCacheProxy(oBinding, oContext2, function (sCanonicalPath) {
						assert.strictEqual(sCanonicalPath, "/canonical2");
						return oCache2;
					});
				return oCacheProxy2.promise.then(function (oC2) {
					assert.strictEqual(oC2, oCache2);

					// code under test: two calls to createCacheProxy; the last sets binding's cache
					oCacheProxy3 = _ODataHelper.createCacheProxy(oBinding, oContext3, function () {
						assert.ok(false, "binding cache !== cache proxy: must not create cache");
					});
					oBinding.oCache = oCacheProxy1a =
						_ODataHelper.createCacheProxy(oBinding, oContext, function () {
							assert.ok(false, "must not recreate cache for context");
						});

					oCacheProxy3.promise.then(function (oC3) {
						assert.strictEqual(oC3, oBinding.oCache);
					});
					oCacheProxy1a.promise.then(function (oC1a) {
						assert.strictEqual(oC1a, oCache);
						assert.strictEqual(oBinding.mCacheByContext["/canonical"], oCache);
						assert.strictEqual(oBinding.mCacheByContext["/canonical2"], oCache2);
						oBinding.oCache = oC1a;
					});
					return Promise.all([oCacheProxy1a.promise, oCacheProxy3.promise]);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createCacheProxy, cache methods", function (assert) {
		var oBinding = {
				oModel : {
					requestCanonicalPath : function () {}
				}
			},
			oCache = {
				read : function () {}
			},
			oCacheProxy,
			oContext = {
				requestCanonicalPath : function () {}
			},
			oPathPromise = Promise.resolve("/canonical"),
			oReadResult = {},
			oReadPromise = Promise.resolve(oReadResult);

		this.mock(oContext).expects("requestCanonicalPath").withExactArgs().returns(oPathPromise);
		this.mock(oCache).expects("read").withExactArgs("$auto", "foo")
			.returns(oReadPromise);

		// code under test
		oBinding.oCache = oCacheProxy =
			_ODataHelper.createCacheProxy(oBinding, oContext, function (sCanonicalPath) {
				return oCache;
			});

		assert.strictEqual(typeof oCacheProxy.deregisterChange, "function");
		assert.strictEqual(oCacheProxy.hasPendingChanges(), false);
		assert.strictEqual(typeof oCacheProxy.refresh, "function");
		assert.throws(function () {
			oCacheProxy.post();
		}, "POST request not allowed");
		assert.throws(function () {
			oCacheProxy.update();
		}, "PATCH request not allowed");
		return oCacheProxy.read("$auto", "foo").then(function (oResult) {
			assert.strictEqual(oResult, oReadResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCacheProxy, cache read rejects or throws", function (assert) {
		var oBinding = {
				oModel : {
					reportError : function () {},
					requestCanonicalPath : function () {}
				}
			},
			oCache = {
				read : function () {},
				toString : function () { return "~Cache~"; }
			},
			oCacheProxy,
			oContext = {
				requestCanonicalPath : function () {}
			},
			oError = {},
			oPathPromise = Promise.resolve("/canonical"),
			oReadPromise = Promise.reject(oError);

		this.mock(oContext).expects("requestCanonicalPath").withExactArgs().returns(oPathPromise);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs(
				"Failed to delegate read to cache ~Cache~ with arguments [\"$auto\",\"foo\"]",
				"sap.ui.model.odata.v4._ODataHelper",
				sinon.match.same(oError)
			);
		this.mock(oCache).expects("read").withExactArgs("$auto", "foo")
			.returns(oReadPromise);

		// code under test
		oBinding.oCache = oCacheProxy =
			_ODataHelper.createCacheProxy(oBinding, oContext, function (sCanonicalPath) {
				return oCache;
			});
		return oCacheProxy.read("$auto", "foo").catch(function(oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("buildOrderbyOption", function (assert) {
		var sOrderby = "bar desc";

		// empty sorters
		assert.strictEqual(_ODataHelper.buildOrderbyOption([]), "");
		// array of sorters
		assert.strictEqual(_ODataHelper.buildOrderbyOption([new Sorter("foo")]), "foo",
			"Sorter array, no query option");
		assert.strictEqual(_ODataHelper.buildOrderbyOption([new Sorter("foo"),
			new Sorter("bar", true)]), "foo,bar desc");

		// with system query option $orderby
		// empty sorters
		assert.strictEqual(_ODataHelper.buildOrderbyOption([], sOrderby), sOrderby);
		// array of sorters
		assert.strictEqual(_ODataHelper.buildOrderbyOption([new Sorter("foo")], sOrderby),
			"foo," + sOrderby, "Sorter array, with query option");
		assert.strictEqual(_ODataHelper.buildOrderbyOption([new Sorter("foo"),
			new Sorter("baz", true)], sOrderby), "foo,baz desc," + sOrderby);
	});

	//*********************************************************************************************
	QUnit.test("buildOrderbyOption - error", function (assert) {
		// non Sorter instances throw error
		assert.throws(function () {
			_ODataHelper.buildOrderbyOption(["foo"]);
		}, new Error("Unsupported sorter: 'foo' (string)"));
		assert.throws(function () {
			_ODataHelper.buildOrderbyOption([new Sorter("foo"), "", new Sorter("bar", true)]);
		}, new Error("Unsupported sorter: '' (string)"));
		assert.throws(function () {
			_ODataHelper.buildOrderbyOption([new Sorter("foo"), 42, new Sorter("bar", true)]);
		}, new Error("Unsupported sorter: '42' (number)"));
	});

	//*********************************************************************************************
	QUnit.test("toArray", function (assert) {
		var oSorter = new Sorter("foo", true),
			aSorters = [oSorter];

		assert.deepEqual(_ODataHelper.toArray(), []);
		assert.deepEqual(_ODataHelper.toArray(null), []);
		assert.deepEqual(_ODataHelper.toArray(""), [""]);
		assert.deepEqual(_ODataHelper.toArray("foo"), ["foo"]);
		assert.deepEqual(_ODataHelper.toArray(oSorter), aSorters);
		assert.strictEqual(_ODataHelper.toArray(aSorters), aSorters);
	});
});
