/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, ODataModel) {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, sinon, start, strictEqual, stop, test, throws
	*/
	"use strict";

	var oGlobalSandbox,
		TestControl = ManagedObject.extend("sap.ui.core.test.TestControl", {
			metadata: {
				properties: {
					text: "string"
				}
			}
		}),
		oModelMock,
		oLogMock;

	/**
	 * Creates a test control bound to a v4.ODataModel. Initializes the control's text property
	 * asynchronously. Waits for the value to be present and passes the property binding for "text"
	 * to the resolve handler.
	 *
	 * Note: This function mocks the model and holds the mock in the global variable oModelMock.
	 *
	 * @returns {Promise}
	 *   a promise to be resolved when the control's text property has been initialized. The
	 *   resolve function passes the text binding as parameter.
	 */
	function createTextBinding() {
		return new Promise(function (fnResolve, fnReject) {
			var oBinding,
				oModel = new ODataModel("/service"),
				oControl = new TestControl({models: oModel});

			oModelMock = oGlobalSandbox.mock(oModel);
			oModelMock.expects("read").withExactArgs("/EntitySet('foo')/property")
				.returns(Promise.resolve({value: "value"}));

			oControl.bindProperty("text", "/EntitySet('foo')/property");

			strictEqual(oControl.getText(), undefined, "synchronous: no value yet");
			oBinding = oControl.getBinding("text");
			oBinding.attachChange(function () {
				strictEqual(oControl.getText(), "value", "initialized");
				fnResolve(oBinding);
			});
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.v4.ODataPropertyBinding", {
		beforeEach : function () {
			oGlobalSandbox = sinon.sandbox.create();
			oLogMock = oGlobalSandbox.mock(jQuery.sap.log);
			oLogMock.expects("warning").never();
			oLogMock.expects("error").never();
		},
		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			oGlobalSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		test("checkUpdate(" + bForceUpdate + "): unchanged", function () {
			return createTextBinding().then(function (oBinding) {
				var bGotChangeEvent = false;

				oModelMock.expects("read")
					.withExactArgs("/EntitySet('foo')/property")
					.returns(Promise.resolve({value: "value"}));
				oBinding.attachChange(function () {
					bGotChangeEvent = true;
				});

				// code under test
				oBinding.checkUpdate(bForceUpdate).then(function () {
					strictEqual(bGotChangeEvent, bForceUpdate, "got change event as expected");
				});
			});
		});
	});

	//*********************************************************************************************
	test("checkUpdate(): read error", function () {
		return createTextBinding().then(function (oBinding) {
			var sValue = oBinding.getValue();

			oModelMock.expects("read")
				.withExactArgs("/EntitySet('foo')/property")
				.returns(Promise.reject());
			oBinding.attachChange(function () {
				ok(false, "unexpected change event");
			})

			// code under test
			oBinding.checkUpdate(false).then(function () {
				strictEqual(oBinding.getValue(), sValue, "read error treated as unchanged value");
			}, function () {
				ok(false, "unexpected failure");
			});
		});
	});

	//*********************************************************************************************
	test("ManagedObject.bindProperty w/ relative path, then bindObject", function (oAssert) {
		var fnDone = oAssert.async(),
			oModel = new ODataModel("/service"),
			oModelMock = oGlobalSandbox.mock(oModel),
			oControl = new TestControl({models: oModel});

		oModelMock.expects("read").never();
		oControl.bindProperty("text", "property");
		oControl.getBinding("text").attachChange(function () {
			strictEqual(oControl.getText(), "value");
			fnDone();
		});

		oModelMock.expects("read").withExactArgs("/EntitySet('foo')/property")
			.returns(Promise.resolve({value: "value"}));

		// This creates and initializes a context binding at the control (and causes the first
		// read). The change handler of the context binding calls setContext at the property's
		// binding which completes the path and triggers a checkUpdate (resulting in the second
		// read). This then fires a change event at the property binding.
		oControl.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	test("setContext on resolved binding", function (oAssert) {
		var oModel = new ODataModel("/service"),
			oModelMock = oGlobalSandbox.mock(oModel),
			oBinding = oModel.bindProperty("/EntitySet('foo')/property");

		oModelMock.expects("read").never(); // no read expected due to absolute path

		oBinding.setContext(oModel.getContext("/EntitySet('bar')"));

		strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')", "stored nevertheless");
	});

	// TODO bSuspended? In v2 it is ignored (check with core)
	// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.
});
