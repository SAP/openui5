/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function (ManagedObject, ChangeReason, Context, Model, ODataListBinding, ODataModel, Olingo) {
	/*global odatajs, QUnit, sinon */
	/*eslint max-nested-callbacks: 4, no-warning-comments: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataListBinding", {
		metadata : {
			aggregations : {
				items : {multiple : true, type : "test.sap.ui.model.odata.v4.ODataListBinding"}
			}
		}
	});

	/**
	 * Creates a jQuery promise as mock for DataCache.readRange which is fulfilled
	 * asynchronously with the given vResult. vResult either holds a number determining the length
	 * of the array with which the promise is resolved or an Error object with which it is rejected.
	 * iStart determines the start index for the records contained in the result.
	 *
	 * @param {number|Error} vResult
	 *   array length if the promise is to be resolved or Error object if it is to be rejected
	 * @param {number} [iStart=0]
	 *   start index
	 * @return {jQuery.Promise}
	 *   the jQuery promise which is fulfilled as specified
	 */
	function createDeferredResult(vResult, iStart) {
		var oDeferred = odatajs.deferred.createDeferred();

		iStart = iStart || 0;
		setTimeout(function () {
			var oData,
				i;

			if (vResult instanceof Error) {
				oDeferred.reject(vResult);
				return;
			}

			oData = {value : []};
			for (i = 0; i < vResult; i += 1) {
				oData.value[i] = {
					Name : "Name " + (iStart + i),
					LOCATION : {
						COUNTRY : "COUNTRY " + (iStart + i)
					},
					NullValue : null
				};
			}
			oDeferred.resolve(oData);
		}, 0);
		return oDeferred.promise();
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataListBinding", {
		beforeEach : function () {
			var oDataCache = {readRange : function() {}, count : function() {}};

			this.oSandbox = sinon.sandbox.create();

			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// create ODataModel and mock Olingo DataCache for source /service/EMPLOYEES
			this.oModel = new ODataModel("/service/");
			this.oModel.setSizeLimit(3);
			this.oDataCacheMock = this.oSandbox.mock(oDataCache);
			this.oDataCacheMock.expects("count").never(); // do not use the build in count function
			this.oSandbox.stub(odatajs.cache, "createDataCache").returns(oDataCache);
		},
		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("getContexts creates cache once", function (assert) {
		this.oDataCacheMock.expects("readRange").returns(createDeferredResult(0));

		this.oModel.bindList("/EMPLOYEES").getContexts();

		assert.ok(odatajs.cache.createDataCache.calledWithExactly({
			mechanism : "memory",
			name : "/service/EMPLOYEES",
			source : "/service/EMPLOYEES"
		}), odatajs.cache.createDataCache.printf("cache creation settings %C"));
	});

	//*********************************************************************************************
	// fixture with range for aggregation binding info (default {}) and
	//              number of entities (default is length requested to readRange)
	[
		{range : {}},
		{range : {startIndex : 1, length : 3}},
		{range : {startIndex : 1, length : 3}, entityCount : 2}
	].forEach(function (oFixture) {
		QUnit.test("getContexts satisfies contract of ManagedObject#bindAggregation "
			+ JSON.stringify(oFixture),
		function (assert) {
			var oControl = new TestControl(),
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
					sExpectedPath = "/EMPLOYEES[" + (i + iStartIndex) + "];list=" + iListIndex;
					assert.strictEqual(aChildControls[i].getBindingContext().getPath(),
						sExpectedPath, "child control binding path: " + sExpectedPath);
				}
				done();
			}

			if (iEntityCount < iLength) {
				this.oDataCacheMock.expects("readRange")
					.withExactArgs(iStartIndex, iLength)
					// readRange is called twice because contexts are created asynchronously
					.twice()
					.returns(createDeferredResult(iEntityCount));
			} else {
				this.oDataCacheMock.expects("readRange")
					.withExactArgs(iStartIndex, iLength)
					.returns(createDeferredResult(iEntityCount));
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
			oContext = new Context(this.oModel, "/TEAMS[0];list=0"),
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
			assert.ok(!odatajs.cache.createDataCache.called, "no cache created");

			// code under test
			oControl.getBinding("items").setContext();
			assert.strictEqual(oControl.getBinding("items").aContexts.length, 0, "reset context");
			done();
		}

		oControl.setModel(this.oModel);

		this.oDataCacheMock.expects("readRange").never();

		this.oSandbox.mock(this.oModel).expects("read")
			.withExactArgs(oContext.getPath() + "/" + sPath, true)
			.returns(createDeferredResult(oRange.length));

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

		this.oDataCacheMock.expects("readRange").never();
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
	QUnit.test("listbinding with immutable expand, encoded URLs", function (assert) {
		var sExpand = "TEAM_2_EMPLOYEES($expand=EMPLOYEES_2_EQUIPMENTS)",
			mParameters = { "$expand": sExpand },
			sEncodedUrl = "/service/TEAMS?$expand=" + encodeURIComponent(sExpand),
			oListBinding = this.oModel.bindList("/TEAMS",  undefined, undefined, undefined,
					mParameters);

		this.oDataCacheMock.expects("readRange").returns(createDeferredResult(0));

		mParameters["$expand"] = "bar";

		oListBinding.getContexts();
		assert.ok(odatajs.cache.createDataCache.calledWithExactly({
			mechanism : "memory",
			name : sEncodedUrl,
			source : sEncodedUrl
		}), odatajs.cache.createDataCache.printf("cache creation settings %C"));
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
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			iSizeLimit = this.oModel.iSizeLimit,
			iRangeIndex = 0;

		// fixture with array of ranges for getContexts calls with
		//   start, length - determine the range
		//   sync - array with flags which indexes are to return a context synchronously to
		//     simulate previous calls to getContexts
		var oFixture  = [
			{sync: []},
			{start : iSizeLimit, length : 1, sync : []}, // completely new contexts
			{start : iSizeLimit, length : 2, sync : [true]}, // partially new contexts
			{start : iSizeLimit, length : 2, sync : [true, true]}
				// completely existing contexts
			],
			that = this;

		// call getContexts for current range; considers previously accessed indexes
		// only if used to check synchronous return value of getContexts.
		function checkContexts(bSync) {
			var aContexts,
				i,
				iLength = oFixture[iRangeIndex].length || iSizeLimit,
				iStart = oFixture[iRangeIndex].start || 0,
				sMessage;

			if (bSync && iRangeIndex < oFixture.length - 1) {
				that.oDataCacheMock.expects("readRange")
					.withExactArgs(iStart, iLength)
					.returns(createDeferredResult(iLength));
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
						"/EMPLOYEES[" + (iStart + i)  + "];list=" + oListBinding.iIndex,
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
	QUnit.test("getContexts sends no change event on failure of DataCache#readRange and logs error",
			function (assert) {
		var done = assert.async(),
			oError = new Error("Intentionally failed"),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oPromise = createDeferredResult(oError);

		function onChange() {
			var aContexts;

			aContexts = oListBinding.getContexts(1, 2); // failing readRange
			assert.strictEqual(aContexts.length, 1, "contexts from first read still exist");
			oPromise.then(undefined, function () { done(); }); // wait until readRange rejects
		}

		this.oDataCacheMock.expects("readRange").once().returns(createDeferredResult(2));
		this.oDataCacheMock.expects("readRange").once().returns(oPromise);
		this.oLogMock.expects("error")
			.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 1 and "
					+ "length 2",
				oError, "sap.ui.model.odata.v4.ODataListBinding");

		oListBinding.attachChange(onChange);
		oListBinding.getContexts(0, 2); // successful readRange

		//TODO implement faultTolerant setting on list binding which keeps existing contexts?
	});

	//*********************************************************************************************
	//TODO unclear how to handle errors in jQuery.Deferred success handlers, open issue on Olingo
	// to use promises
	QUnit.skip("getContexts handles error in change event handler", function (assert) {
		var done = assert.async(),
			oError = new SyntaxError("Intentionally failed"),
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		this.oDataCacheMock.expects("readRange").once().returns(createDeferredResult(1));
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
		var iIndex = Math.floor(Math.random() * 10), // some index
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		this.oDataCacheMock.expects("readRange")
			.withExactArgs(0, 10)
			.returns(createDeferredResult(10));
		this.oDataCacheMock.expects("readRange")
			.withExactArgs(iIndex, 1)
			.exactly(4)
			.returns(createDeferredResult(1, iIndex));
		this.oLogMock.expects("warning")
			.withExactArgs("Invalid segment Bar",
				"path: Foo1/Bar" , "sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.getContexts(0, 10); // creates cache

		return Promise.all([
			oListBinding.readValue(iIndex, "LOCATION/COUNTRY").then(function (oValue) {
				assert.strictEqual(oValue, "COUNTRY " + iIndex, "LOCATION/COUNTRY");
			}),
			oListBinding.readValue(iIndex, "Foo").then(function (oValue) {
				assert.strictEqual(oValue, undefined, "Foo");
			}),
			oListBinding.readValue(iIndex, "Foo1/Bar").then(function (oValue) {
				assert.strictEqual(oValue, undefined, "Foo1/Bar");
			}),
			oListBinding.readValue(iIndex, "NullValue").then(function (oValue) {
				assert.strictEqual(oValue, null, "NullValue");
			})
		]);
	});

	//*********************************************************************************************
	QUnit.test("readValue rejects when accessing cached record", function (assert) {
		//TODO the test's title is misleading, this is not "readValue() should reject when..."
		// but it's about how readValue() behaves if readRange() fails
		var oError = new Error(),
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		//TODO it is hard to understand why we succeed for (0, 10) 1st and then fail for (0, 1)
		this.oDataCacheMock.expects("readRange")
			.withExactArgs(0, 10)
			.returns(createDeferredResult(10));
		this.oDataCacheMock.expects("readRange")
			.withExactArgs(0, 1)
			.returns(createDeferredResult(oError));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value with index 0 for /service/EMPLOYEES and "
				+ "path foo/bar",
				oError, "sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.getContexts(0, 10); // creates cache

		return oListBinding.readValue(0, "foo/bar").then(
			function () { assert.ok(false, "Unexpected success"); },
			function (oError0) { assert.strictEqual(oError0, oError); }
		);
	});

	//*********************************************************************************************
	QUnit.test("readValue rejects when accessing non-primitive value", function (assert) {
		var sMessage = "Accessed value is not primitive",
			oError = new Error(sMessage),
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		this.oDataCacheMock.expects("readRange")
			.withExactArgs(0, 10)
			.returns(createDeferredResult(10));
		this.oDataCacheMock.expects("readRange")
			.withExactArgs(0, 1)
			.returns(createDeferredResult(1));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value with index 0 for /service/EMPLOYEES and "
					+ "path LOCATION",
				oError, "sap.ui.model.odata.v4.ODataListBinding");
		oListBinding.getContexts(0, 10); // creates cache

		return oListBinding.readValue(0, "LOCATION").then(
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
		{start : 0, result: 0, isFinal: true, length: 0, text: "no data"},
		{start : 20, result: 29, isFinal: true, length: 49, text: "less data than requested"},
		{start : 20, result: 0, isFinal: false, length: 10, text: "no data for given start > 0"},
		{start : 20, result: 30, isFinal: false, length: 60, text: "maybe more data"}
	].forEach(function (oFixture) {
		QUnit.test("paging: " + oFixture.text, function (assert) {
			var oListBinding = this.oModel.bindList("/EMPLOYEES"),
				done = assert.async();

			assert.strictEqual(oListBinding.isLengthFinal(), false, "Length is not yet final");
			assert.strictEqual(oListBinding.getLength(), 10, "Initial estimated length is 10");

			this.oDataCacheMock.expects("readRange").withExactArgs(oFixture.start, 30)
				.returns(createDeferredResult(oFixture.result));

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
		{start : 40, result: 5, isFinal: true, length: 45, text: "greater than before"},
		{start : 20, result: 5, isFinal: true, length: 25, text: "less than before"},
		{start : 0, result: 30, isFinal: true, length: 35, text: "full read before"},
		{start : 20, result: 30, isFinal: false, length: 60, text: "full read after"},
		{start : 15, result: 0, isFinal: true, length: 15, text: "empty read before"},
		{start : 40, result: 0, isFinal: true, length: 35, text: "empty read after"}
	].forEach(function (oFixture) {
		QUnit.test("paging: adjust final length: " + oFixture.text, function (assert) {
			var oListBinding = this.oModel.bindList("/EMPLOYEES"),
				i, n,
				done = assert.async();

			this.oDataCacheMock.expects("readRange").withExactArgs(20, 30)
				.returns(createDeferredResult(15));
			this.oDataCacheMock.expects("readRange").withExactArgs(oFixture.start, 30)
				.returns(createDeferredResult(oFixture.result));

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
							"/EMPLOYEES[" + i + "];list=0", "check content");
					}
					done();
				}, 10);
			}, 10);
		});
	});

	//*********************************************************************************************
	QUnit.test("paging: full read before length; length at boundary", function (assert) {
		var oListBinding = this.oModel.bindList("/EMPLOYEES"),
			done = assert.async();

		// 1. read and get [20..50) -> estimated length 60
		this.oDataCacheMock.expects("readRange").withExactArgs(20, 30)
			.returns(createDeferredResult(30));
		// 2. read and get [0..30) -> length still 60
		this.oDataCacheMock.expects("readRange").withExactArgs(0, 30)
			.returns(createDeferredResult(30));
		// 3. read [50..80) get no entries -> length is now final 50
		this.oDataCacheMock.expects("readRange").withExactArgs(50, 30)
			.returns(createDeferredResult(0));

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
		var oListBinding = this.oModel.bindList("/EMPLOYEES"),
			done = assert.async();

		// 1. read [20..50) and get [20..35) -> final length 35
		this.oDataCacheMock.expects("readRange").withExactArgs(20, 30)
			.returns(createDeferredResult(15));
		// 2. read [30..60) and get no entries -> estimated length 10 (after lower boundary reset)
		this.oDataCacheMock.expects("readRange").withExactArgs(30, 30)
			.returns(createDeferredResult(0));
		// 3. read [35..65) and get no entries -> estimated length still 10
		this.oDataCacheMock.expects("readRange").withExactArgs(35, 30)
			.returns(createDeferredResult(0));

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
		var oListBinding = this.oModel.bindList("/EMPLOYEES"),
			done = assert.async();

		// 1. read [20..50) and get [20..35) -> final length 35
		this.oDataCacheMock.expects("readRange").withExactArgs(20, 30)
			.returns(createDeferredResult(15));
		// 2. read [20..50) and get [20..34) -> final length 34
		this.oDataCacheMock.expects("readRange").withExactArgs(20, 30)
			.returns(createDeferredResult(14));
		// 3. read [35..65) and get no entries -> final length still 34
		this.oDataCacheMock.expects("readRange").withExactArgs(35, 30)
			.returns(createDeferredResult(0));

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
		var iIndex = Math.floor(Math.random() * 10), // some index
			oListBinding = this.oModel.bindList("/EMPLOYEES");

		this.oDataCacheMock.expects("readRange")
			.withExactArgs(0, 10)
			.returns(createDeferredResult(10));
		this.oDataCacheMock.expects("readRange")
			.withExactArgs(iIndex, 1)
			.returns(createDeferredResult(1, iIndex));
		oListBinding.getContexts(0, 10); // creates cache

		return oListBinding.readValue(iIndex, undefined, true).then(function (oValue) {
				assert.deepEqual(oValue, {
					Name : "Name " + iIndex,
					LOCATION : {
						COUNTRY : "COUNTRY " + iIndex
					},
					NullValue : null
				});
			});
	});
});
//TODO to avoid complete re-rendering of lists implement bUseExtendedChangeDetection support
//The implementation of getContexts needs to provide next to the resulting context array a diff
//array with information which entry has been inserted or deleted (see jQuery.sap.arrayDiff and
//sap.m.GrowingEnablement)
//TODO refresh, reset the list binding
//TODO jsdoc: {@link sap.ui.model.odata.v4.ODataModel#bindList bindList} generates no link as
//  there is no jsdoc for v4.ODataModel
//TODO lists within lists for deferred navigation or structural properties
//TODO (how to) get rid of global cache objects when model is garbage collected
//TODO integration test for cache eviction if size exceeds cacheSize (1MB per default)
//TODO (how to) set pageSize, prefetchSize, cacheSize of cache?
//TODO setContext() must delete this.oCache when it has its own cache (e.g. scenario
//  where listbinding is not nested but has a context. This is currently not possible but
//  if you think on a relative binding "TEAMS" which becomes context "/" -> here the relative
//  binding must create the it's own cache which has to be deleted with setContext()
//TODO custom headers for readRange(), e.g. "X-CSRF-Token": "Fetch"

//TODO integration: 2 entity sets with same $expand, but different $select
