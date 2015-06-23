/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, ODataModel) {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, sinon, start, strictEqual, stop, test, throws,
	*/
	"use strict";

	var oGlobalSandbox,
		TestControl = ManagedObject.extend("sap.ui.core.test.TestControl", {
			metadata: {
				properties: {
					text: "string"
				},
				aggregations: {
					child: {multiple: false, type: "sap.ui.core.test.TestControl"}
				}
			}
		}),
		oLogMock,
		oModelMock;

	/**
	 * Initializes the control's text property asynchronously. Waits for the bound context to be
	 * present and passes the context binding to the resolve handler.
	 * @returns {Promise}
	 *   a promise to be resolved when the control's bound context has been initialized
	 */
	function createContextBinding() {
		return new Promise(function (fnResolve, fnReject) {
			var oBinding,
				oModel = new ODataModel("/service"),
				oControl = new TestControl({models: oModel});

			oModelMock = oGlobalSandbox.mock(oModel);
			oModelMock.expects("read").never();
			oControl.bindObject("/EntitySet('foo')/child");
			oBinding = oControl.getObjectBinding();
			strictEqual(oBinding.getBoundContext(), null, "synchronous: no bound context yet");
			oBinding.attachChange(function () {
				strictEqual(oBinding.getBoundContext().getPath(), "/EntitySet('foo')/child",
					"after initialize");
				fnResolve(oBinding);
			});
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.v4.ODataContextBinding", {
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
		test("checkUpdate(" + bForceUpdate + "): unchanged", function (oAssert) {
			return createContextBinding().then(function (oBinding) {
				var bGotChangeEvent = false;

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
	test("ManagedObject.bindObject on child (relative), then on parent", function (oAssert) {
		var oBinding,
			oChild = new TestControl(),
			fnDone = oAssert.async(),
			oModel = new ODataModel("/service"),
			oModelMock = oGlobalSandbox.mock(oModel),
			oParent = new TestControl({models: oModel, child: oChild});

		// This should not trigger anything yet
		oChild.bindObject("child");

		oBinding = oChild.getObjectBinding();
		oBinding.attachChange(function () {
			strictEqual(oBinding.getBoundContext().getPath(), "/EntitySet('foo')/child");

			fnDone();
		});

		// This creates and initializes a context binding at the parent. The change handler of the
		// context binding calls setContext at the child's context binding which completes the path
		// and triggers a checkUpdate. This then fires a change event at the child's context
		// binding.
		oParent.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	test("setContext on resolved binding", function (oAssert) {
		var oModel = new ODataModel("/service"),
			oModelMock = oGlobalSandbox.mock(oModel),
			oBinding = oModel.bindContext("/EntitySet('foo')/child");

		oModelMock.expects("read").never(); // no read expected due to absolute path

		oBinding.setContext(oModel.getContext("/EntitySet('bar')"));

		strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')", "stored nevertheless");
	});

	// TODO events dataRequested, dataReceived
	// TODO bSuspended? In v2 it is ignored (check with core)
});
