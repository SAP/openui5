/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, ODataModel) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	/*... max-nested-callbacks: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataContextBinding", {
			metadata: {
				properties: {
					text: "string"
				},
				aggregations: {
					child: {multiple: false, type: "test.sap.ui.model.odata.v4.ODataContextBinding"}
				}
			}
		});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		},

		/**
		 * Initializes the control's text property asynchronously. Waits for the bound context
		 * to be present and passes the context binding to the resolve handler.
		 *
		 * Note: This function mocks the model and holds the mock in this.oModelMock.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @returns {Promise}
		 *   a promise to be resolved when the control's bound context has been initialized.
		 *   The resolve function passes the context binding as parameter.
		 */
		createContextBinding : function (assert) {
			var oModel = new ODataModel("/service/"),
				oControl = new TestControl({models: oModel});

			this.oModelMock = this.oSandbox.mock(oModel);
			this.oModelMock.expects("read").never();
			return new Promise(function (fnResolve, fnReject) {
				var oBinding;

				oControl.bindObject("/EntitySet('foo')/child");
				oBinding = oControl.getObjectBinding();
				assert.strictEqual(oBinding.getBoundContext(), null,
					"synchronous: no bound context yet");
				oBinding.attachChange(function () {
					assert.strictEqual(oBinding.getBoundContext().getPath(),
						"/EntitySet('foo')/child", "after initialize");
					fnResolve(oBinding);
				});
			});
		}
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdate(" + bForceUpdate + "): unchanged", function (assert) {
			return this.createContextBinding(assert).then(function (oBinding) {
				var bGotChangeEvent = false;

				oBinding.attachChange(function () {
					bGotChangeEvent = true;
				});

				// code under test
				oBinding.checkUpdate(bForceUpdate).then(function () {
					assert.strictEqual(bGotChangeEvent, bForceUpdate,
						"got change event as expected");
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("ManagedObject.bindObject on child (relative), then on parent", function (assert) {
		var oBinding,
			oChild = new TestControl(),
			done = assert.async(),
			oModel = new ODataModel("/service/"),
			oParent = new TestControl({models: oModel, child: oChild});

		// This should not trigger anything yet
		oChild.bindObject("child");

		oBinding = oChild.getObjectBinding();
		oBinding.attachChange(function () {
			assert.strictEqual(oBinding.getBoundContext().getPath(), "/EntitySet('foo')/child");

			done();
		});

		// This creates and initializes a context binding at the parent. The change handler of the
		// context binding calls setContext at the child's context binding which completes the path
		// and triggers a checkUpdate. This then fires a change event at the child's context
		// binding.
		oParent.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oModel = new ODataModel("/service/"),
			oModelMock = this.oSandbox.mock(oModel),
			oBinding = oModel.bindContext("/EntitySet('foo')/child");

		oModelMock.expects("read").never(); // no read expected due to absolute path

		oBinding.setContext(oModel.getContext("/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	// TODO events dataRequested, dataReceived
	// TODO bSuspended? In v2 it is ignored (check with core)
});
