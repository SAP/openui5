/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, Context, Model, Cache, Requestor, Helper,
		ODataListBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataListBinding", {
		metadata : {
			aggregations : {
				items : {multiple : true, type : "test.sap.ui.model.odata.v4.ODataListBinding"}
			}
		}
	});

	/**
	 * Creates a promise as mock for Cache.read which is fulfilled asynchronously with a result of
	 * the given length.
	 * iStart determines the start index for the records contained in the result.
	 *
	 * @param {number} iLength
	 *   array length
	 * @param {number} [iStart=0]
	 *   start index
	 * @return {Promise}
	 *   the promise which is fulfilled as specified
	 */
	function createResult(iLength, iStart) {
		return new Promise(function (resolve, reject) {
			var oData,
				i;

			iStart = iStart || 0;
			oData = {value : []};
			for (i = 0; i < iLength; i += 1) {
				oData.value[i] = {
					Name : "Name " + (iStart + i),
					LOCATION : {
						COUNTRY : "COUNTRY " + (iStart + i)
					},
					NullValue : null
				};
			}
			resolve(oData);
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataListBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();

			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// create ODataModel and mock Cache
			this.oModel = new ODataModel("/service/?sap-client=111");
			this.oModel.setSizeLimit(3);
		},
		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		},

		/**
		 * Creates a sinon mock for a cache object with read and refresh methods.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getCacheMock : function () {
			var oCache = {
					read : function () {},
					refresh : function () {},
					toString : function () { return "/service/EMPLOYEES"; }
				};

			this.oSandbox.mock(Cache).expects("create").returns(oCache);
			return this.oSandbox.mock(oCache);
		}
	});

	//*********************************************************************************************
	QUnit.test("bindList with parameters", function (assert) {
		var oBinding,
			oContext = {},
			oError = new Error("Unsupported ..."),
			oHelperMock,
			mParameters = {"$expand" : "foo", "$select" : "bar", "custom" : "baz"},
			mQueryOptions = {};

		oHelperMock = this.mock(Helper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(this.oModel.mUriParameters, mParameters, ["$expand", "$select"])
			.returns(mQueryOptions);
		this.mock(Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				sinon.match.same(mQueryOptions));

		oBinding = this.oModel.bindList("/EMPLOYEES", oContext, undefined, undefined, mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), "/EMPLOYEES");
		assert.strictEqual(oBinding.iIndex, 0, "list binding unique index");
		assert.strictEqual(this.oModel.aRoots[0], oBinding, "model stores list bindings");
		assert.deepEqual(oBinding.aContexts, []);
		assert.strictEqual(oBinding.iMaxLength, Infinity);
		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.mParameters, undefined);

		//no call to buildQueryOptions for binding with relative path and no parameters
		oBinding = this.oModel.bindList("EMPLOYEE_2_TEAM");
		assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache property is set");
		assert.strictEqual(oBinding.oCache, undefined, "oCache property is undefined");

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", null, undefined, undefined, mParameters);
		}, oError);

		//error for relative paths
		assert.throws(function () {
			this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS", null, undefined, undefined, mParameters);
		}, new Error("Bindings with a relative path do not support parameters"));

		//TODO parameter aSorters and aFilters
	});

	//*********************************************************************************************
	// fixture with range for aggregation binding info (default {}) and
	//              number of entities (default is length requested to read)
	[
		{range : {}},
		{range : {startIndex : 1, length : 3}},
		{range : {startIndex : 1, length : 3}, entityCount : 2}
	].forEach(function (oFixture) {
		QUnit.test("getContexts satisfies contract of ManagedObject#bindAggregation "
			+ JSON.stringify(oFixture),
		function (assert) {
			var oCacheMock = this.getCacheMock(),
				oControl = new TestControl(),
				done = assert.async(),
				oRange = oFixture.range || {},
				iLength = oRange.length || this.oModel.iSizeLimit,
				iEntityCount = oFixture.entityCount || iLength,
				iStartIndex = oRange.startIndex || 0;

			// check that given spy is called with exact arguments
			function checkCall(oSpy) {
				assert.ok(
					oSpy.calledWithExactly.apply(oSpy, Array.prototype.slice.call(arguments, 1)),
					oSpy.printf("%n call %C"));
			}

			// change event handler for initial read for list binding
			function onChange() {
				var aChildControls = oControl.getItems(),
					sExpectedPath,
					iListIndex = oControl.getBinding("items").iIndex,
					i;

				assert.strictEqual(aChildControls.length, iEntityCount, "# child controls");
				for (i = 0; i < iEntityCount; i += 1) {
					sExpectedPath = "/EMPLOYEES[" + (i + iStartIndex) + "];root=" + iListIndex;
					assert.strictEqual(aChildControls[i].getBindingContext().getPath(),
						sExpectedPath, "child control binding path: " + sExpectedPath);
				}
				done();
			}

			if (iEntityCount < iLength) {
				oCacheMock.expects("read")
					.withArgs(iStartIndex, iLength)
					// read is called twice because contexts are created asynchronously
					.twice()
					.returns(createResult(iEntityCount));
			} else {
				oCacheMock.expects("read")
					.withArgs(iStartIndex, iLength)
					.returns(createResult(iEntityCount));
			}
			// spies to check and document calls to model and binding methods from ManagedObject
			this.spy(this.oModel, "bindList");
			this.spy(ODataListBinding.prototype, "checkUpdate");
			this.spy(ODataListBinding.prototype, "getContexts");

			// code under test
			oControl.setModel(this.oModel);
			oControl.bindAggregation("items", jQuery.extend({
				path : "/EMPLOYEES",
				template : new TestControl()
			}, oRange));

			// check v4 ODataModel APIs are called as expected from ManagedObject
			checkCall(this.oModel.bindList, "/EMPLOYEES", undefined, undefined, undefined,
				undefined);
			checkCall(ODataListBinding.prototype.checkUpdate, true);
			checkCall(ODataListBinding.prototype.getContexts, oRange.startIndex, oRange.length);

			oControl.getBinding("items").attachChange(onChange);
			assert.deepEqual(oControl.getItems(), [], "initial synchronous result");
		});
	});

	//*********************************************************************************************
	QUnit.test("nested listbinding", function (assert) {
		var oControl = new TestControl(),
			done = assert.async(),
			oContext = new Context(this.oModel, "/TEAMS[0];root=0"),
			sPath = "TEAM_2_EMPLOYEES",
			oRange = {startIndex : 1, length : 3};

		// change event handler for initial read for list binding
		function onChange() {
			var aChildControls = oControl.getItems(),
			sExpectedPath,
			i;

			assert.strictEqual(aChildControls.length, 3, "# child controls");
			for (i = 0; i < 3; i += 1) {
				sExpectedPath = oContext.getPath() + "/" + sPath + "/" + (i + oRange.startIndex);
				assert.strictEqual(aChildControls[i].getBindingContext().getPath(),
					sExpectedPath, "child control binding path: " + sExpectedPath);
			}

			// code under test
			oControl.getBinding("items").setContext();
			assert.strictEqual(oControl.getBinding("items").aContexts.length, 0, "reset context");
			done();
		}

		oControl.setModel(this.oModel);

		this.oSandbox.mock(this.oModel).expects("read")
			.withExactArgs(oContext.getPath() + "/" + sPath, true)
			.returns(createResult(oRange.length));

		// code under test
		oControl.setBindingContext(oContext);

		oControl.bindAggregation("items", jQuery.extend({
				path : sPath,
				template : new TestControl()
			}, oRange));

		oControl.getBinding("items").attachEventOnce("change", onChange);
	});

	//*********************************************************************************************
	QUnit.test("nested listbinding (context not yet set)", function (assert) {
		var oControl = new TestControl(),
			oRange = {startIndex : 1, length : 3},
			done = assert.async();

		// change event handler for initial read for list binding
		function onChange() {
			assert.ok(false, "unexpected event called");
		}

		oControl.setModel(this.oModel);

		this.oSandbox.mock(this.oModel).expects("read").never();

		// code under test
		oControl.bindAggregation("items", jQuery.extend({
				path : "TEAM_2_EMPLOYEES",
				template : new TestControl()
			}, oRange));

		oControl.getBinding("items").attachChange(onChange);
		assert.deepEqual(oControl.getBinding("items").getContexts(), [],
			"list binding contexts not set");
		setTimeout(done, 10); //TODO Is there a better way to finalize the test after console log?
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate fires change event", function () {
		var oListBinding = this.oModel.bindList("/Products");

		this.mock(oListBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change}).twice();

		oListBinding.checkUpdate();
		oListBinding.checkUpdate(true);
		//TODO check last read range for an update and only send change event then
	});

	//*********************************************************************************************
	QUnit.test("getContexts called directly provides contexts as return value and in change event",
		function (assert) {
		var done = assert.async(),
			oCacheMock = this.getCacheMock(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			iSizeLimit = this.oModel.iSizeLimit,
			iRangeIndex = 0;

		// fixture with array of ranges for getContexts calls with
		//   start, length - determine the range
		//   sync - array with flags which indexes are to return a context synchronously to
		//     simulate previous calls to getContexts
		var oFixture  = [
			{sync : []},
			{start : iSizeLimit, length : 1, sync : []}, // completely new contexts
			{start : iSizeLimit, length : 2, sync : [true]}, // partially new contexts
			{start : iSizeLimit, length : 2, sync : [true, true]}
				// completely existing contexts
			];

		// call getContexts for current range; considers previously accessed indexes
		// only if used to check synchronous return value of getContexts.
		function checkContexts(bSync) {
			var aContexts,
				i,
				iLength = oFixture[iRangeIndex].length || iSizeLimit,
				iStart = oFixture[iRangeIndex].start || 0,
				sMessage;

			if (bSync && iRangeIndex < oFixture.length - 1) {
				oCacheMock.expects("read").withArgs(iStart, iLength).returns(createResult(iLength));
			}

			// code under test, read synchronously with previous range
			aContexts = oListBinding.getContexts(iStart, iLength);

			for (i = 0; i < iLength; i += 1) {
				sMessage = (bSync ? "Synchronous" : "Asynchronous") + " result"
					+ "/EMPLOYEES[" + (iStart + i) + "], getContexts("
					+ iStart + "," + iLength + ")";
				if (bSync && !oFixture[iRangeIndex].sync[i]) {
					assert.strictEqual(aContexts[i], undefined, sMessage);
				} else {
					assert.strictEqual(aContexts[i].getPath(),
						"/EMPLOYEES[" + (iStart + i)  + "];root=" + oListBinding.iIndex,
						sMessage);
				}
			}
		}

		// change event handler for list binding
		function onChange() {
			checkContexts();
			iRangeIndex += 1;
			checkContexts(true);
			// only the last range in the fixture triggers no change event
			if (iRangeIndex === oFixture.length - 1) {
				done();
			}
		}

		checkContexts(true);
		oListBinding.attachChange(onChange);
	});

	//*********************************************************************************************
	QUnit.test("getContexts sends no change event on failure of Cache#read and logs error",
			function (assert) {
		var oCacheMock = this.getCacheMock(),
			oError = new Error("Intentionally failed"),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oPromise = Promise.reject(oError);

		oCacheMock.expects("read").once().returns(createResult(2));
		oCacheMock.expects("read").once().returns(oPromise);
		this.oLogMock.expects("error")
			.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 1 and "
					+ "length 2",
				oError, "sap.ui.model.odata.v4.ODataListBinding");

		oListBinding.attachChange(function () {
			var aContexts = oListBinding.getContexts(1, 2); // failing read
			assert.strictEqual(aContexts.length, 1, "contexts from first read still exist");
		});
		oListBinding.getContexts(0, 2); // successful read

		return oPromise["catch"](function () {
			assert.ok(true);
		});
		//TODO implement faultTolerant setting on list binding which keeps existing contexts?
	});

	//*********************************************************************************************
	//TODO QUnit.test!
	QUnit.skip("getContexts handles error in change event handler", function (assert) {
		var done = assert.async(),
			oError = new SyntaxError("Intentionally failed"),
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		this.getCacheMock().expects("read").once().returns(createResult(1));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 0 and "
					+ "length 1",
				oError, "sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.attachChange(function () {
			throw oError;
		});

		oListBinding.getContexts(0, 1);

		setTimeout(done, 10); //TODO Is there a better way to finalize the test after console log?
	});

	//*********************************************************************************************
	QUnit.test("readValue accesses path with one segment on cached record", function (assert) {
		var oCacheMock = this.getCacheMock(),
			iIndex = Math.floor(Math.random() * 10), // some index
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		oCacheMock.expects("read").withArgs(0, 10).returns(createResult(10));
		oCacheMock.expects("read")
			.withExactArgs(iIndex, 1)
			.exactly(4)
			.returns(createResult(1, iIndex));
		this.oLogMock.expects("warning")
			.withExactArgs("Invalid segment Bar",
				"path: Foo1/Bar" , "sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.getContexts(0, 10); // creates cache

		return Promise.all([
			oListBinding.readValue("LOCATION/COUNTRY", false, iIndex).then(function (oValue) {
				assert.strictEqual(oValue, "COUNTRY " + iIndex, "LOCATION/COUNTRY");
			}),
			oListBinding.readValue("Foo", false, iIndex).then(function (oValue) {
				assert.strictEqual(oValue, undefined, "Foo");
			}),
			oListBinding.readValue("Foo1/Bar", false, iIndex).then(function (oValue) {
				assert.strictEqual(oValue, undefined, "Foo1/Bar");
			}),
			oListBinding.readValue("NullValue", false, iIndex).then(function (oValue) {
				assert.strictEqual(oValue, null, "NullValue");
			})
		]);
	});

	//*********************************************************************************************
	QUnit.test("readValue rejects when accessing cached record", function (assert) {
		//TODO the test's title is misleading, this is not "readValue() should reject when..."
		// but it's about how readValue() behaves if read() fails
		var oCacheMock = this.getCacheMock(),
			oError = new Error(),
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		//TODO it is hard to understand why we succeed for (0, 10) 1st and then fail for (0, 1)
		oCacheMock.expects("read").withArgs(0, 10).returns(createResult(10));
		oCacheMock.expects("read")
			.withExactArgs(0, 1)
			.returns(Promise.reject(oError));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value with index 0 for /service/EMPLOYEES and "
				+ "path foo/bar",
				oError, "sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.getContexts(0, 10); // creates cache

		return oListBinding.readValue("foo/bar", false, 0).then(
			function () { assert.ok(false, "Unexpected success"); },
			function (oError0) { assert.strictEqual(oError0, oError); }
		);
	});

	//*********************************************************************************************
	QUnit.test("readValue rejects when accessing non-primitive value", function (assert) {
		var oCacheMock = this.getCacheMock(),
			sMessage = "Accessed value is not primitive",
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		oCacheMock.expects("read").withArgs(0, 10).returns(createResult(10));
		oCacheMock.expects("read")
			.withExactArgs(0, 1)
			.returns(createResult(1));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value with index 0 for /service/EMPLOYEES and "
					+ "path LOCATION",
				// custom matcher because mobile Safari adds line and column properties to Error
				sinon.match(function (oError) {
					return oError instanceof Error && oError.message === sMessage;
				}),
				"sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.getContexts(0, 10); // creates cache

		return oListBinding.readValue("LOCATION", false, 0).then(
			function () {
				assert.ok(false, "Unexpected success");
			},
			function (oError0) {
				assert.strictEqual(oError0.message, sMessage);
			}
		);
	});

	//*********************************************************************************************
	[
		{start : 0, result : 0, isFinal : true, length : 0, text : "no data"},
		{start : 20, result : 29, isFinal : true, length : 49, text : "less data than requested"},
		{start : 20, result : 0, isFinal : false, length : 10,
			text : "no data for given start > 0"},
		{start : 20, result : 30, isFinal : false, length : 60, text : "maybe more data"}
	].forEach(function (oFixture) {
		QUnit.test("paging: " + oFixture.text, function (assert) {
			var oListBinding,
				done = assert.async();

			this.getCacheMock().expects("read").withArgs(oFixture.start, 30)
				.returns(createResult(oFixture.result));
			oListBinding = this.oModel.bindList("/EMPLOYEES");
			assert.strictEqual(oListBinding.isLengthFinal(), false, "Length is not yet final");
			assert.strictEqual(oListBinding.getLength(), 10, "Initial estimated length is 10");

			oListBinding.getContexts(oFixture.start, 30); // creates cache

			setTimeout(function () {
				// if there are less entries returned than requested then final length is known
				assert.strictEqual(oListBinding.isLengthFinal(), oFixture.isFinal);
				assert.strictEqual(oListBinding.getLength(), oFixture.length);
				done();
			}, 10);
		});
	});

	//*********************************************************************************************
	[
		{start : 40, result : 5, isFinal : true, length : 45, text : "greater than before"},
		{start : 20, result : 5, isFinal : true, length : 25, text : "less than before"},
		{start : 0, result : 30, isFinal : true, length : 35, text : "full read before"},
		{start : 20, result : 30, isFinal : false, length : 60, text : "full read after"},
		{start : 15, result : 0, isFinal : true, length : 15, text : "empty read before"},
		{start : 40, result : 0, isFinal : true, length : 35, text : "empty read after"}
	].forEach(function (oFixture) {
		QUnit.test("paging: adjust final length: " + oFixture.text, function (assert) {
			var oCacheMock = this.getCacheMock(),
				oListBinding = this.oModel.bindList("/EMPLOYEES"),
				i, n,
				done = assert.async();

			oCacheMock.expects("read").withArgs(20, 30).returns(createResult(15));
			oCacheMock.expects("read").withArgs(oFixture.start, 30)
				.returns(createResult(oFixture.result));

			oListBinding.getContexts(20, 30); // creates cache

			setTimeout(function () {
				assert.strictEqual(oListBinding.isLengthFinal(), true);
				assert.strictEqual(oListBinding.getLength(), 35);
				oListBinding.getContexts(oFixture.start, 30);

				setTimeout(function () {
					assert.strictEqual(oListBinding.isLengthFinal(), oFixture.isFinal, "final");
					assert.strictEqual(oListBinding.getLength(), oFixture.length);
					assert.strictEqual(oListBinding.aContexts.length,
						oFixture.length - (oFixture.isFinal ? 0 : 10), "Context array length");
					for (i = oFixture.start, n = oFixture.start + oFixture.result; i < n; i++) {
						assert.strictEqual(oListBinding.aContexts[i].sPath,
							"/EMPLOYEES[" + i + "];root=0", "check content");
					}
					done();
				}, 10);
			}, 10);
		});
	});

	//*********************************************************************************************
	QUnit.test("paging: full read before length; length at boundary", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			done = assert.async();

		// 1. read and get [20..50) -> estimated length 60
		oCacheMock.expects("read").withArgs(20, 30).returns(createResult(30));
		// 2. read and get [0..30) -> length still 60
		oCacheMock.expects("read").withArgs(0, 30).returns(createResult(30));
		// 3. read [50..80) get no entries -> length is now final 50
		oCacheMock.expects("read").withArgs(50, 30).returns(createResult(0));

		oListBinding.getContexts(20, 30);

		setTimeout(function () {
			assert.strictEqual(oListBinding.isLengthFinal(), false);
			assert.strictEqual(oListBinding.getLength(), 60);

			oListBinding.getContexts(0, 30); // read more data from beginning

			setTimeout(function () {
				assert.strictEqual(oListBinding.isLengthFinal(), false, "still not final");
				assert.strictEqual(oListBinding.getLength(), 60, "length not reduced");

				oListBinding.getContexts(50, 30); // no more data; length at paging boundary

				setTimeout(function () {
					assert.strictEqual(oListBinding.isLengthFinal(), true, "now final");
					assert.strictEqual(oListBinding.getLength(), 50, "length at boundary");
					done();
				}, 10);
			}, 10);
		}, 10);
	});

	//*********************************************************************************************
	QUnit.test("paging: lower boundary reset", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			done = assert.async();

		// 1. read [20..50) and get [20..35) -> final length 35
		oCacheMock.expects("read").withArgs(20, 30).returns(createResult(15));
		// 2. read [30..60) and get no entries -> estimated length 10 (after lower boundary reset)
		oCacheMock.expects("read").withArgs(30, 30).returns(createResult(0));
		// 3. read [35..65) and get no entries -> estimated length still 10
		oCacheMock.expects("read").withArgs(35, 30).returns(createResult(0));

		oListBinding.getContexts(20, 30);

		setTimeout(function () {
			assert.strictEqual(oListBinding.isLengthFinal(), true);
			assert.strictEqual(oListBinding.getLength(), 35);
			assert.strictEqual(oListBinding.aContexts.length, 35);

			oListBinding.getContexts(30, 30);

			setTimeout(function () {
				assert.strictEqual(oListBinding.isLengthFinal(), true, "new lower boundary");
				assert.strictEqual(oListBinding.getLength(), 30,
					"length 10 (after lower boundary reset)");
				assert.strictEqual(oListBinding.aContexts.length, 30, "contexts array reduced");

				oListBinding.getContexts(35, 30);

				setTimeout(function () {
					assert.strictEqual(oListBinding.isLengthFinal(), true, "still estimated");
					assert.strictEqual(oListBinding.getLength(), 30, "still 30");
					done();
				}, 10);
			}, 10);
		}, 10);
	});

	//*********************************************************************************************
	QUnit.test("paging: adjust max length got from server", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			done = assert.async();

		// 1. read [20..50) and get [20..35) -> final length 35
		oCacheMock.expects("read").withArgs(20, 30).returns(createResult(15));
		// 2. read [20..50) and get [20..34) -> final length 34
		oCacheMock.expects("read").withArgs(20, 30).returns(createResult(14));
		// 3. read [35..65) and get no entries -> final length still 34
		oCacheMock.expects("read").withArgs(35, 30).returns(createResult(0));

		oListBinding.getContexts(20, 30);

		setTimeout(function () {
			assert.strictEqual(oListBinding.isLengthFinal(), true);
			assert.strictEqual(oListBinding.getLength(), 35);

			oListBinding.getContexts(20, 30);

			setTimeout(function () {
				assert.strictEqual(oListBinding.isLengthFinal(), true, "final 34");
				assert.strictEqual(oListBinding.getLength(), 34, "length 34");

				oListBinding.getContexts(35, 30);

				setTimeout(function () {
					assert.strictEqual(oListBinding.isLengthFinal(), true, "still final");
					assert.strictEqual(oListBinding.getLength(), 34, "length still 34");
					done();
				}, 10);
			}, 10);
		}, 10);
	});

	//*********************************************************************************************
	QUnit.test("readValue: bAllowObjectAccess", function (assert) {
		var oCacheMock = this.getCacheMock(),
			iIndex = Math.floor(Math.random() * 10), // some index
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		oCacheMock.expects("read").withArgs(0, 10).returns(createResult(10));
		oCacheMock.expects("read")
			.withExactArgs(iIndex, 1)
			.returns(createResult(1, iIndex));
		oListBinding.getContexts(0, 10); // creates cache

		return oListBinding.readValue(undefined, true, iIndex).then(function (oValue) {
				assert.deepEqual(oValue, {
					Name : "Name " + iIndex,
					LOCATION : {
						COUNTRY : "COUNTRY " + iIndex
					},
					NullValue : null
				});
			});
	});

	//*********************************************************************************************
	QUnit.test("refresh", function (assert) {
		var oCacheMock = this.getCacheMock(),
			done = assert.async(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oListBindingMock = this.oSandbox.mock(oListBinding);

		// change event during getContexts
		oListBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		// refresh event during refresh
		oListBindingMock.expects("_fireRefresh")
			.withExactArgs({reason : ChangeReason.Refresh});
		oCacheMock.expects("read").withArgs(0, 10).returns(createResult(9));
		oCacheMock.expects("refresh");

		oListBinding.getContexts(0, 10);

		setTimeout(function () {
			var oCache = oListBinding.oCache;
			assert.strictEqual(oListBinding.iMaxLength, 9);
			assert.strictEqual(oListBinding.isLengthFinal(), true);

			//code under test
			assert.throws(function () {
				oListBinding.refresh();
			}, new Error("Falsy values for bForceUpdate are not supported"));
			assert.throws(function () {
				oListBinding.refresh(false);
			}, new Error("Falsy values for bForceUpdate are not supported"));
			oListBinding.refresh(true);

			assert.strictEqual(oListBinding.oCache, oCache);
			assert.deepEqual(oListBinding.aContexts, []);
			assert.strictEqual(oListBinding.iMaxLength, Infinity);
			assert.strictEqual(oListBinding.isLengthFinal(), false);
			done();
		}, 10); //wait until read is finished
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oListBinding = this.oModel.bindList("EMPLOYEES"),
			oListBindingMock = this.oSandbox.mock(oListBinding);

		this.oSandbox.mock(Cache).expects("create").never();
		// refresh event during refresh
		oListBindingMock.expects("_fireRefresh").never();

		//code under test
		//error for relative paths
		assert.throws(function () {
			oListBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending getContexts", function (assert) {
		var oCacheMock = this.getCacheMock(),
			done = assert.async(),
			oError = new Error(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oListBindingMock = this.oSandbox.mock(oListBinding);

		// change event during getContexts
		oListBindingMock.expects("_fireChange").never();
		oError.canceled = true;
		oCacheMock.expects("read").withArgs(0, 10).returns(Promise.reject(oError));
		oCacheMock.expects("refresh");

		oListBinding.getContexts(0, 10);
		oListBinding.refresh(true);

		setTimeout(function () {
			// log mock checks there is no console error from canceling processing of getContexts
			done();
		}, 10); //wait until read is finished
	});

	//*********************************************************************************************
	QUnit.test("getContexts fires dataRequested and dataReceived events", function (assert) {
		var iDataReceivedCount = 0,
			iDataRequestedCount = 0,
			done = assert.async(),
			oListBinding;

		this.oSandbox.stub(Cache, "create", function (oRequestor, sUrl, mQueryOptions) {
			return {
				read: function (iIndex, iLength, fnDataRequested) {
					fnDataRequested(); // synchronously
					return createResult(iLength, iIndex);
				}
			};
		});
		oListBinding = this.oModel.bindList("/EMPLOYEES");

		oListBinding.attachDataRequested(function (oEvent) {
			assert.strictEqual(oEvent.getSource(), oListBinding, "dataRequested - correct source");
			iDataRequestedCount++;
		});
		oListBinding.attachDataReceived(function (oEvent) {
			assert.strictEqual(oEvent.getSource(), oListBinding, "dataReceived - correct source");
			iDataReceivedCount++;
			assert.strictEqual(iDataReceivedCount, 1, "dataReceived event fired once");
			assert.strictEqual(oListBinding.aContexts.length, 10, "data already processed");
			done();
		});
		oListBinding.attachChange(function (oEvent) {
			assert.strictEqual(iDataReceivedCount, 0, "change event before dataReceived event");
		});
		oListBinding.getContexts(0, 10);
		assert.strictEqual(iDataRequestedCount, 1, "dataRequested event fired synchrounously");
		assert.strictEqual(iDataReceivedCount, 0, "dataReceived not yet fired");
		assert.strictEqual(oListBinding.aContexts.length, 0, "data is not yet available");
	});

	//*********************************************************************************************
	QUnit.test("getContexts - error handling for dataRequested/dataReceived", function (assert) {
		var done = assert.async(),
			oError = new Error("Expected Error"),
			oListBinding;

		this.oLogMock.expects("error")
			.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 0 and "
				+ "length 10", oError, "sap.ui.model.odata.v4.ODataListBinding");

		this.oSandbox.stub(Cache, "create", function (oRequestor, sUrl, mQueryOptions) {
			return {
				read: function (iIndex, iLength, fnDataRequested) {
					fnDataRequested();
					return Promise.reject(oError);
				}
			};
		});
		oListBinding = this.oModel.bindList("/EMPLOYEES");

		oListBinding.attachDataReceived(function (oEvent) {
			assert.strictEqual(oEvent.getSource(), oListBinding, "oEvent.getSource()");
			assert.strictEqual(oEvent.getParameter("error"), oError,
				"error is passed to event handler");
			done();
		});
		oListBinding.getContexts(0, 10);
	});

	//*********************************************************************************************
	QUnit.test("getContexts - concurrent call with read errors", function (assert) {
		var iDataReceivedCount = 0,
			iDataRequestedCount = 0,
			done = assert.async(),
			oError = new Error("Expected Error"),
			oListBinding,
			oPromise = Promise.reject(oError),
			iReadCount = 0;

		this.oLogMock.expects("error").twice()
			.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 0 and "
				+ "length 10", oError, "sap.ui.model.odata.v4.ODataListBinding");

		this.oSandbox.stub(Cache, "create", function (oRequestor, sUrl, mQueryOptions) {
			return {
				read: function (iIndex, iLength, fnDataRequested) {
					iReadCount++;
					if (iReadCount === 1) {
						fnDataRequested();
					}
					// Cache implementation returns new Promise based on reused Promise for the
					// request
					return oPromise.then();
				}
			};
		});
		oListBinding = this.oModel.bindList("/EMPLOYEES");

		oListBinding.attachDataRequested(function (oEvent) {
			iDataRequestedCount++;
		});
		oListBinding.attachDataReceived(function (oEvent) {
			iDataReceivedCount++;
			assert.strictEqual(iDataRequestedCount, 1, "dataRequested event fired once");
			assert.strictEqual(iDataReceivedCount, 1, "dataReceived event fired once");
			assert.strictEqual(oEvent.getParameter("error"), oError,
				"error is passed to event handler");
			Promise.resolve().then(function () {
				// wait until second getContext call is completed
				done();
			});
		});
		oListBinding.getContexts(0, 10);
		// call it again in parallel
		oListBinding.getContexts(0, 10);
	});
});
//TODO to avoid complete re-rendering of lists implement bUseExtendedChangeDetection support
//The implementation of getContexts needs to provide next to the resulting context array a diff
//array with information which entry has been inserted or deleted (see jQuery.sap.arrayDiff and
//sap.m.GrowingEnablement)
//TODO lists within lists for deferred navigation or structural properties

//TODO setContext() must delete this.oCache when it has its own cache (e.g. scenario
//  where listbinding is not nested but has a context. This is currently not possible but
//  if you think on a relative binding "TEAMS" which becomes context "/" -> here the relative
//  binding must create the it's own cache which has to be deleted with setContext()

//TODO integration: 2 entity sets with same $expand, but different $select
//TODO support suspend/resume
