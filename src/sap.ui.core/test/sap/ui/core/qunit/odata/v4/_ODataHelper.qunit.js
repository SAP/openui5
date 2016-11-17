/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_SyncPromise"
], function (jQuery, Context, Filter, FilterOperator, _ODataHelper, _Cache, _Helper, _Parser,
		_SyncPromise) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0 */
	"use strict";

	/**
	 * Clones the given object
	 *
	 * @param {any} v the object
	 * @returns {any} the clone
	 */
	function clone(v) {
		return v && JSON.parse(JSON.stringify(v));
	}

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
		sKeyPredicate : "('42')",
		oEntityInstance : {"ID" : "42"},
		oEntityType : {
			"$Key" : ["ID"],
			"ID" : {
				"$Type" : "Edm.String"
			}
		}
	}, {
		sKeyPredicate : "('Walter%22s%20Win''s')",
		oEntityInstance : {"ID" : "Walter\"s Win's"},
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
		sDescription : "one key property",
		oEntityInstance : {},
		oEntityType : {
			"$Key" : ["ID"],
			"ID" : {
				"$Type" : "Edm.String"
			}
		}
	}, {
		sDescription : "multiple key properties",
		oEntityInstance : {"Sector" : "DevOps"},
		oEntityType : {
			"$Key" : ["Sector", "ID"],
			"Sector" : {
				"$Type" : "Edm.String"
			},
			"ID" : {
				"$Type" : "Edm.String"
			}
		}
	}].forEach(function (oFixture) {
		QUnit.test("getKeyPredicate: missing key, " + oFixture.sDescription, function (assert) {
			var sError = "Missing value for key property 'ID'";

			assert.throws(function () {
				_ODataHelper.getKeyPredicate(oFixture.oEntityType, oFixture.oEntityInstance);
			}, new Error(sError));
		});
	});

	//*********************************************************************************************
	QUnit.test("getKeyPredicate: no instance", function (assert) {
		var sError = "No instance to calculate key predicate";

		assert.throws(function () {
			_ODataHelper.getKeyPredicate({
				$Key : ["ID"]
			}, undefined);
		}, new Error(sError));
	});

	//*********************************************************************************************
	[{
		mModelOptions : {"sap-client" : "111"},
		mOptions : {"$expand" : {"foo" : null}, "$select" : ["bar"], "custom" : "baz"},
		bSystemQueryOptionsAllowed : true
	}, {
		mOptions : {
			"$apply" : "apply",
			"$filter" : "foo eq 42",
			"$orderby" : "bar",
			"$search" : '"foo bar" AND NOT foobar'
		},
		bSystemQueryOptionsAllowed : true
	}, {
		mModelOptions : {"custom" : "bar"},
		mOptions : {"custom" : "foo"}
	}, {
		mModelOptions : undefined,
		mOptions : undefined
	}, {
		mModelOptions : null,
		mOptions : {"sap-client" : "111"},
		bSapAllowed : true
	}].forEach(function (o) {
		QUnit.test("buildQueryOptions success " + JSON.stringify(o), function (assert) {
			var mOptions,
				mOriginalModelOptions = clone(o.mModelOptions),
				mOriginalOptions = clone(o.mOptions);

			mOptions = _ODataHelper.buildQueryOptions(o.mModelOptions, o.mOptions,
				o.bSystemQueryOptionsAllowed, o.bSapAllowed);

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
		}, true), {
			$expand : oExpand,
			$select : aSelect
		});
	});

	//*********************************************************************************************
	[{
		mModelOptions : {},
		mOptions : {"$foo" : "foo"},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $foo is not supported"
	}, {
		mModelOptions : {},
		mOptions : {"@alias" : "alias"},
		bSystemQueryOptionsAllowed : true,
		error : "Parameter @alias is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"$expand" : {"foo" : true}},
		error : "System query option $expand is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"$expand" : {"foo" : {"$unknown" : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $unknown is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"$expand" : {"foo" : {"select" : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option select is not supported"
	}, {
		mModelOptions : undefined,
		mOptions : {"sap-foo" : "300"},
		error : "Custom query option sap-foo is not supported"
	}].forEach(function (o) {
		QUnit.test("buildQueryOptions error " + JSON.stringify(o), function (assert) {
			assert.throws(function () {
				_ODataHelper.buildQueryOptions(o.mModelOptions, o.mOptions,
					o.bSystemQueryOptionsAllowed);
			}, new Error(o.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$groupId", function (assert) {
		var aAllowedParams = ["$$groupId"];

		assert.deepEqual(_ODataHelper.buildBindingParameters(undefined), {});
		assert.deepEqual(_ODataHelper.buildBindingParameters({}), {});
		assert.deepEqual(_ODataHelper.buildBindingParameters({$$groupId : "$auto"}, aAllowedParams),
			{$$groupId : "$auto"});
		assert.deepEqual(_ODataHelper.buildBindingParameters(
			{$$groupId : "$direct", custom : "foo"}, aAllowedParams), {$$groupId : "$direct"});

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$unsupported : "foo"});
		}, new Error("Unsupported binding parameter: $$unsupported"));

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$groupId : ""}, aAllowedParams);
		}, new Error("Unsupported value '' for binding parameter '$$groupId'"));
		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$groupId : "~invalid"}, aAllowedParams);
		}, new Error("Unsupported value '~invalid' for binding parameter '$$groupId'"));
		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$groupId : "$auto"});
		}, new Error("Unsupported binding parameter: $$groupId"));
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$operationMode", function (assert) {
		var aAllowedParams = ["$$operationMode"];

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$operationMode : "Client"}, aAllowedParams);
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$operationMode : "Auto"}, aAllowedParams);
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$operationMode : "any"}, aAllowedParams);
		}, new Error("Unsupported operation mode: any"));

		assert.deepEqual(_ODataHelper.buildBindingParameters({$$operationMode : "Server"},
				aAllowedParams),
			{$$operationMode : "Server"});
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$updateGroupId", function (assert) {
		var aAllowedParams = ["$$updateGroupId"];

		assert.deepEqual(_ODataHelper.buildBindingParameters({$$updateGroupId : "myGroup"},
				aAllowedParams),
			{$$updateGroupId : "myGroup"});
		assert.deepEqual(_ODataHelper.buildBindingParameters(
			{$$updateGroupId : "$direct", custom : "foo"}, aAllowedParams),
			{$$updateGroupId : "$direct"});

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$unsupported : "foo"}, aAllowedParams);
		}, new Error("Unsupported binding parameter: $$unsupported"));

		assert.throws(function () {
			_ODataHelper.buildBindingParameters({$$updateGroupId : "~invalid"}, aAllowedParams);
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
	[
		["/canonical1", undefined], //set context
		[undefined, "foo eq 42"], //set filter
		["/canonical2", "foo eq 42"] //set context and filter
	].forEach(function (oFixture) {
		QUnit.test("createCache: proxy interface, " + oFixture[0] + ", " + oFixture[1],
			function (assert) {
				var oBinding = {},
					oFilterPromise = oFixture[1] && Promise.resolve(oFixture[1]),
					oPathPromise = oFixture[0] && Promise.resolve(oFixture[0]),
					oCache = {
						read : function () {}
					},
					oCacheProxy,
					oReadResult = {};

				function createCache(sPath, sFilter) {
					assert.strictEqual(sPath, oFixture[0]);
					assert.strictEqual(sFilter, oFixture[1]);
					return oCache;
				}

				this.mock(oCache).expects("read").withExactArgs("$auto", "foo")
					.returns(Promise.resolve(oReadResult));

				// code under test
				oCacheProxy = _ODataHelper.createCache(oBinding, createCache, oPathPromise,
					oFilterPromise);

				assert.strictEqual(oCacheProxy.hasPendingChanges(), false);
				assert.strictEqual(typeof oCacheProxy.resetChanges, "function");
				assert.strictEqual(typeof oCacheProxy.setActive, "function");
				assert.throws(function () {
					oCacheProxy.post();
				}, "POST request not allowed");
				assert.throws(function () {
					oCacheProxy.update();
				}, "PATCH request not allowed");

				return oCacheProxy.read("$auto", "foo").then(function (oResult) {
					assert.strictEqual(oBinding.oCache, oCache);
					assert.strictEqual(oCache.$canonicalPath, oFixture[0]);
					assert.strictEqual(oResult, oReadResult);
				});
			});
	});

	//*********************************************************************************************
	QUnit.test("createCache: deactivates previous cache", function (assert) {
		var oBinding = {};

		// code under test
		_ODataHelper.createCache(oBinding, function () {});

		oBinding.oCache = { setActive : function () {} };
		this.mock(oBinding.oCache).expects("setActive").withExactArgs(false);

		// code under test
		_ODataHelper.createCache(oBinding, function () {});
	});

	//*********************************************************************************************
	QUnit.test("createCache: use same cache for same path, async", function (assert) {
		var oBinding = {},
			oCache = {
				setActive : function () {},
				read : function () { return Promise.resolve({}); }
			},
			oCacheMock = this.mock(oCache),
			oPathPromise = Promise.resolve("p"),
			createCache = this.spy(function () { return oCache; });

		// code under test
		_ODataHelper.createCache(oBinding, createCache, oPathPromise);

		return oBinding.oCache.read().then(function () {
			assert.strictEqual(oBinding.oCache, oCache);

			oCacheMock.expects("setActive").withExactArgs(false);
			oCacheMock.expects("setActive").withExactArgs(true);
			// code under test
			_ODataHelper.createCache(oBinding, createCache, oPathPromise);

			return oBinding.oCache.read().then(function () {
				assert.strictEqual(oBinding.oCache, oCache);
				assert.strictEqual(createCache.callCount, 1);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: use same cache for same path, sync", function (assert) {
		var oBinding = {},
			oCache = {setActive : function () {}},
			oCacheMock = this.mock(oCache),
			oPathPromise = _SyncPromise.resolve("p"),
			createCache = this.spy(function () { return oCache; });

		// code under test
		_ODataHelper.createCache(oBinding, createCache, oPathPromise);

		assert.strictEqual(oBinding.oCache, oCache);

		oCacheMock.expects("setActive").withExactArgs(false);
		oCacheMock.expects("setActive").withExactArgs(true);

		// code under test
		_ODataHelper.createCache(oBinding, createCache, oPathPromise);

		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(createCache.callCount, 1);
	});

	//*********************************************************************************************
	QUnit.test("createCache: create new cache for empty canonical path", function (assert) {
		var oBinding = {},
			oCache = {setActive : function () {}},
			createCache = this.spy(function () { return oCache; });

		// code under test
		_ODataHelper.createCache(oBinding, createCache, undefined);

		// code under test
		_ODataHelper.createCache(oBinding, createCache, undefined);

		assert.strictEqual(createCache.callCount, 2);
	});

	//*********************************************************************************************
	QUnit.test("createCache: cache proxy !== binding's cache", function (assert) {
		var oBinding = {},
			oCache = {read : function () {}},
			oPromise,
			oReadResult = {};

		this.mock(oCache).expects("read").returns(Promise.resolve(oReadResult));

		// create a binding asynchronously and read from it
		_ODataHelper.createCache(oBinding, function () {
			return {/*cache*/};
		}, Promise.resolve("Employees('42')"));
		oPromise = oBinding.oCache.read();

		// create a binding synchronously afterwards (overtakes the first one, but must win)
		_ODataHelper.createCache(oBinding, function () {
			return oCache;
		});

		assert.strictEqual(oBinding.oCache, oCache);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oBinding.oCache, oCache);
			assert.strictEqual(oResult, oReadResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: fetchCanonicalPath fails", function (assert) {
		var oBinding = {
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			},
			oError = new Error("canonical path failure");

		function unexpected () {
			assert.ok(false, "unexpected call");
		}

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4._ODataHelper", sinon.match.same(oError));

		// code under test
		_ODataHelper.createCache(oBinding, unexpected, Promise.reject(oError));

		// code under test
		return oBinding.oCache.read("$auto", "foo").catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: fetchFilter fails", function (assert) {
		var oBinding = {
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			},
			oError = new Error("request filter failure");

		function unexpected () {
			assert.ok(false, "unexpected call");
		}

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4._ODataHelper", sinon.match.same(oError));

		// code under test
		_ODataHelper.createCache(oBinding, unexpected, undefined, Promise.reject(oError));

		// code under test
		return oBinding.oCache.read("$auto", "foo").catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	[
		{mQueryOptions : undefined, sPath : "foo", sQueryPath : "delegate/to/context"},
		{mQueryOptions : undefined, sPath : "foo", sQueryPath : undefined}
	].forEach(function (oFixture, i) {
		QUnit.test("getQueryOptions - delegating - " + i, function (assert) {
			var oBinding = {
					mQueryOptions : oFixture.mQueryOptions,
					sPath : oFixture.sPath
				},
				oContext = {
					getQueryOptions : function () {}
				},
				mResultingQueryOptions = {},
				sResultPath = "any/path";

			this.mock(_Helper).expects("buildPath")
				.withExactArgs(oBinding.sPath, oFixture.sQueryPath).returns(sResultPath);
			this.mock(oContext).expects("getQueryOptions")
				.withExactArgs(sResultPath)
				.returns(mResultingQueryOptions);

			// code under test
			assert.strictEqual(
				_ODataHelper.getQueryOptions(oBinding, oFixture.sQueryPath, oContext),
				mResultingQueryOptions, "sQueryPath:" + oFixture.sQueryPath);

			// code under test
			assert.strictEqual(
				_ODataHelper.getQueryOptions(oBinding, oFixture.sQueryPath, undefined),
				undefined, "no query options and no context");
		});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions ignores base context", function (assert) {
		var oBaseContext = {},
			oBinding = {
				mQueryOptions : undefined,
				sPath : "foo"
			};


		// code under test
		assert.strictEqual(_ODataHelper.getQueryOptions(oBinding, "", oBaseContext), undefined,
			"no query options and base context ignored");
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions - query options and no path", function (assert) {
		var oBinding = {
				mQueryOptions : {}
			},
			oContext = {
				getQueryOptions : function () {}
			};

		this.mock(_Helper).expects("buildPath").never();
		this.mock(oContext).expects("getQueryOptions").never();

		// code under test
		assert.strictEqual(_ODataHelper.getQueryOptions(oBinding), oBinding.mQueryOptions,
			oContext);
		assert.strictEqual(_ODataHelper.getQueryOptions(oBinding, ""), oBinding.mQueryOptions,
			oContext);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions - find in query options", function (assert) {
		var mEmployee2EquipmentOptions = {
				$orderby : "EquipmentId"
			},
			mTeam2EmployeeOptions = {
				"$expand" : {
					"Employee_2_Equipment" : mEmployee2EquipmentOptions
				},
				$orderby : "EmployeeId"
			},
			mParameters = {
				"$expand" : {
					"Team_2_Employees" : mTeam2EmployeeOptions,
					"Team_2_Manager" : null,
					"Team_2_Equipments" : true
				},
				"$orderby" : "TeamId",
				"sap-client" : "111"
			},
			oBinding = {
				oModel : {
					mUriParameters : {"sap-client" : "111"}
				},
				mQueryOptions : mParameters,
				sPath : "any/path"
			},
			oContext = {
				getQueryOptions : function () {}
			},
			oODataHelperMock = this.mock(_ODataHelper),
			mResultingQueryOptions = {}; // content not relevant

		this.mock(_Helper).expects("buildPath").never();
		this.mock(oContext).expects("getQueryOptions").never();

		[
			{sQueryPath : "foo", mResult : undefined},
			{sQueryPath : "Team_2_Employees", mResult : mTeam2EmployeeOptions},
			{
				sQueryPath : "Team_2_Employees/Employee_2_Equipment",
				mResult : mEmployee2EquipmentOptions
			},
			{sQueryPath : "Team_2_Employees/Employee_2_Equipment/foo", mResult : undefined},
			{sQueryPath : "Team_2_Employees/foo/Employee_2_Equipment", mResult : undefined},
			{sQueryPath : "Team_2_Manager", mResult : undefined},
			{sQueryPath : "Team_2_Equipments", mResult : undefined},
			{
				sQueryPath : "Team_2_Employees(2)/Employee_2_Equipment('42')",
				mResult : mEmployee2EquipmentOptions
			},
			{
				sQueryPath : "15/Team_2_Employees/2/Employee_2_Equipment/42",
				mResult : mEmployee2EquipmentOptions
			}
		].forEach(function (oFixture, i) {
			oODataHelperMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(oBinding.oModel.mUriParameters),
					oFixture.mResult ? sinon.match.same(oFixture.mResult) : undefined, true)
				.returns(mResultingQueryOptions);
			// code under test
			assert.strictEqual(_ODataHelper.getQueryOptions(oBinding, oFixture.sQueryPath),
				mResultingQueryOptions, "sQueryPath:" + oFixture.sQueryPath);
		});
	});
	//TODO handle encoding in getQueryOptions

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(sPath): with cache", function (assert) {
		var oBinding = {
				oCache : {
					hasPendingChanges : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oResult = {};

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("hasPendingChanges").withExactArgs(sPath).returns(oResult);

			assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, sPath), oResult,
				"path=" + sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(sPath): without cache", function (assert) {
		var oBinding = {
				sPath : "relative"
			},
			sBuildPath = "~/foo",
			oContext = {
				hasPendingChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper),
			oResult = {};

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, "foo"), false);
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, ""), false);

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("hasPendingChanges").withExactArgs(sBuildPath).returns(oResult);

			//code under test
			assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, sPath), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(sPath): without cache, base context", function (assert) {
		assert.strictEqual(
			_ODataHelper.hasPendingChanges({oContext : {}}, undefined, "foo"),
			false);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(bAskParent): with cache", function (assert) {
		var oChild1 = {},
			oChild2 = {},
			oBinding = {
				oCache : {
					hasPendingChanges : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oHelperMock = this.mock(_ODataHelper),
			// remember the function, so that we can call it and nevertheless mock it to place
			// assertions on recursive calls
			fnHasPendingChanges = _ODataHelper.hasPendingChanges;

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2]);
		[false, true].forEach(function (bAskParent) {
			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(true);
			oHelperMock.expects("hasPendingChanges").never();

			// code under test
			assert.strictEqual(fnHasPendingChanges(oBinding, bAskParent), true,
				"cache returns true, bAskParent=" + bAskParent);

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(false);
			oHelperMock.expects("hasPendingChanges").withExactArgs(sinon.match.same(oChild1), false)
				.returns(true);

			// code under test
			assert.strictEqual(fnHasPendingChanges(oBinding, bAskParent), true,
				"child1 returns true, bAskParent=" + bAskParent);

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(false);
			oHelperMock.expects("hasPendingChanges").withExactArgs(sinon.match.same(oChild1), false)
				.returns(false);
			oHelperMock.expects("hasPendingChanges").withExactArgs(sinon.match.same(oChild2), false)
				.returns(false);

			// code under test
			assert.strictEqual(fnHasPendingChanges(oBinding, bAskParent), false,
					"all return false, bAskParent=" + bAskParent);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(bAskParent): without cache", function (assert) {
		var oBinding = {
				sPath : "relative",
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oContext = {
				hasPendingChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oResult = {};

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([]);

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, false), false);
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, true), false);

		oBinding.oContext = oContext;
		oContextMock.expects("hasPendingChanges").never();

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, false), false);

		oContextMock.expects("hasPendingChanges").withExactArgs(oBinding.sPath).returns(oResult);

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, true), oResult);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): with cache", function (assert) {
		var oBinding = {
				oCache : {
					resetChanges : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache);

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("resetChanges").withExactArgs(sPath);

			_ODataHelper.resetChanges(oBinding, undefined, sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): without cache", function (assert) {
		var oBinding = {
				sPath : "relative"
			},
			sBuildPath = "~/foo",
			oContext = {
				resetChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper);

		//code under test
		_ODataHelper.resetChanges(oBinding, undefined, "foo");
		_ODataHelper.resetChanges(oBinding, undefined, "");

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("resetChanges").withExactArgs(sBuildPath);

			//code under test
			_ODataHelper.resetChanges(oBinding, undefined, sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): without cache, base context", function (assert) {
		_ODataHelper.resetChanges({oContext : {}}, undefined, "foo");
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): with cache", function (assert) {
		var oChild1 = {},
			oChild2 = {},
			oBinding = {
				oCache : {
					resetChanges : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oHelperMock = this.mock(_ODataHelper),
			// remember the function, so that we can call it and nevertheless mock it to place
			// assertions on recursive calls
			fnResetChanges = _ODataHelper.resetChanges;

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2]);
		[false, true].forEach(function (bAskParent) {
			oCacheMock.expects("resetChanges").withExactArgs("");
			oHelperMock.expects("resetChanges").withExactArgs(sinon.match.same(oChild1), false);
			oHelperMock.expects("resetChanges").withExactArgs(sinon.match.same(oChild2), false);

			// code under test
			fnResetChanges(oBinding, bAskParent);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): without cache", function (assert) {
		var oBinding = {
				sPath : "relative",
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oContext = {
				resetChanges : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([]);

		//code under test
		_ODataHelper.resetChanges(oBinding, false);
		_ODataHelper.resetChanges(oBinding, true);

		oBinding.oContext = oContext;
		oContextMock.expects("resetChanges").never();

		//code under test
		_ODataHelper.resetChanges(oBinding, false);

		oContextMock.expects("resetChanges").withExactArgs(oBinding.sPath);

		//code under test
		_ODataHelper.resetChanges(oBinding, true);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): without cache, base context", function (assert) {
		var oBinding = {
				oContext : {},
				oModel : {
					getDependentBindings : function () {
						return [];
					}
				}
			};

		//code under test
		_ODataHelper.resetChanges(oBinding, true);
	});

	//*********************************************************************************************
	QUnit.test("isRefreshable", function (assert) {
		assert.strictEqual(_ODataHelper.isRefreshable({bRelative : false}), true, "absolute");
		assert.strictEqual(_ODataHelper.isRefreshable({bRelative : true}), undefined,
			"relative - no context");
		assert.strictEqual(_ODataHelper.isRefreshable(
			{bRelative : true, oContext : {getBinding : function () {}}}), false,
			"relative - V4 context");
		assert.strictEqual(_ODataHelper.isRefreshable({bRelative : true, oContext : {}}), true,
			"relative - base context");
	});
});
