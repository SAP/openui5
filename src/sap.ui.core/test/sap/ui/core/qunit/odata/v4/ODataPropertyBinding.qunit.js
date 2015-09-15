/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, TypeString, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataPropertyBinding", {
			metadata: {
				properties: {
					text: "string"
				}
			}
		});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataPropertyBinding", {
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
		 * Creates a test control bound to a v4.ODataModel. Initializes the control's text property
		 * asynchronously. Waits for the value to be present and passes the property binding for
		 * "text" to the resolve handler.
		 *
		 * Note: This function mocks the model and holds the mock in this.oModelMock.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @returns {Promise}
		 *   a promise to be resolved when the control's text property has been initialized. The
		 *   resolve function passes the text binding as parameter.
		 */
		createTextBinding : function (assert) {
			var oModel = new ODataModel("/service/"),
				oControl = new TestControl({models: oModel});

			this.oModelMock = this.oSandbox.mock(oModel);
			this.oModelMock.expects("read").withExactArgs("/EntitySet('foo')/property")
				.returns(Promise.resolve({value: "value"}));

			return new Promise(function (fnResolve, fnReject) {
				var oBinding;

				oControl.bindProperty("text", {
					path : "/EntitySet('foo')/property",
					type : new TypeString()
				});

				assert.strictEqual(oControl.getText(), undefined, "synchronous: no value yet");
				oBinding = oControl.getBinding("text");
				oBinding.attachChange(function () {
					assert.strictEqual(oControl.getText(), "value", "initialized");
					fnResolve(oBinding);
				});
			});
		}
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdate(" + bForceUpdate + "): unchanged", function (assert) {
			var that = this;

			return this.createTextBinding(assert).then(function (oBinding) {
				var bGotChangeEvent = false;

				that.oModelMock.expects("read")
					.withExactArgs("/EntitySet('foo')/property")
					.returns(Promise.resolve({value: "value"}));
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
	QUnit.test("checkUpdate(): read error", function (assert) {
		var that = this;

		return this.createTextBinding(assert).then(function (oBinding) {
			var sValue = oBinding.getValue();

			that.oModelMock.expects("read")
				.withExactArgs("/EntitySet('foo')/property")
				.returns(Promise.reject());
			oBinding.attachChange(function () {
				assert.ok(false, "unexpected change event");
			});

			// code under test
			oBinding.checkUpdate(false).then(function () {
				assert.strictEqual(oBinding.getValue(), sValue,
					"read error treated as unchanged value");
			}, function () {
				assert.ok(false, "unexpected failure");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("ManagedObject.bindProperty w/ relative path, then bindObject", function (assert) {
		var done = assert.async(),
			oModel = new ODataModel("/service/"),
			oModelMock = this.oSandbox.mock(oModel),
			oControl = new TestControl({models: oModel});

		oModelMock.expects("read").never();
		oControl.bindProperty("text",{
			path : "property",
			type : new TypeString()
		});
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "value");
			done();
		});

		oModelMock.expects("read").withExactArgs("/EntitySet('foo')/property")
			.returns(Promise.resolve({value: "value"}));

		// This creates and initializes a context binding at the control. The change handler of the
		// context binding calls setContext at the property's binding which completes the path and
		// triggers a checkUpdate (resulting in the read). This then fires a change event at the
		// property binding.
		oControl.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oModel = new ODataModel("/service/"),
			oModelMock = this.oSandbox.mock(oModel),
			oBinding = oModel.bindProperty("/EntitySet('foo')/property");

		oModelMock.expects("read").never(); // no read expected due to absolute path

		oBinding.setContext(oModel.getContext("/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes", function (assert) {
		var oModel = new ODataModel("/service/"),
			oControl = new TestControl({models: oModel}),
			sPath = "/EntitySet('foo')/property",
			oType = new TypeString(),
			done = assert.async();

		this.oSandbox.mock(oModel).expects("read").withExactArgs(sPath)
			.returns(Promise.resolve({value: "foo"}));
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
			.withExactArgs(sPath)
			.returns(Promise.resolve(oType));
		this.oSandbox.mock(oType).expects("formatValue").withExactArgs("foo", "string");

		oControl.bindProperty("text", sPath);
		var oBinding = oControl.getBinding("text");
		oBinding.attachChange(function () {
			assert.strictEqual(oBinding.getType(), oType);
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: type already set by app", function (assert) {
		var oModel = new ODataModel("/service/"),
			oControl = new TestControl({models: oModel}),
			sPath = "/EntitySet('foo')/property",
			done = assert.async();

		this.oSandbox.mock(oModel).expects("read").withExactArgs(sPath)
			.returns(Promise.resolve({value: "foo"}));
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type").never();

		oControl.bindProperty("text", {
			path: sPath,
			type: new sap.ui.model.type.String()
		});
		var oBinding = oControl.getBinding("text");
		oBinding.attachChange(function () {
			assert.strictEqual(oControl.getText(), "foo");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: formatter set by app", function (assert) {
		var oModel = new ODataModel("/service/"),
			oControl = new TestControl({models: oModel}),
			sPath = "/EntitySet('foo')/property",
			oType = new TypeString(),
			done = assert.async();

		this.oSandbox.mock(oModel).expects("read").withExactArgs(sPath)
			.returns(Promise.resolve({value: "foo"}));
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
			.withExactArgs(sPath)
			.returns(Promise.resolve(oType));
		this.oSandbox.mock(oType).expects("formatValue")
			.withExactArgs("foo", "string")
			.returns("*foo*");

		oControl.bindProperty("text", {
			path: sPath,
			formatter: function (sValue) {
				return "~" + sValue + "~";
			}
		});
		var oBinding = oControl.getBinding("text");
		oBinding.attachChange(function () {
			assert.strictEqual(oBinding.getType(), oType);
			assert.strictEqual(oControl.getText(), "~*foo*~");
			done();
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("automaticTypes: failed type, bForceUpdate = " + bForceUpdate,
			function (assert) {
				var oBinding,
					iCalls = bForceUpdate ? 2 : 1,
					oError = new Error("failed type"),
					done = assert.async(),
					oModel = new ODataModel("/service/"),
					oModelMock = this.oSandbox.mock(oModel),
					oControl = new TestControl({models: oModel}),
					sPath = "/EntitySet('foo')/property";

				oModelMock.expects("read").withExactArgs(sPath)
					.returns(Promise.resolve({value: "foo"}));
				oModelMock.expects("read").withExactArgs(sPath)
					.returns(Promise.resolve({value: "update"})); // 2nd read gets an update
				this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
					.exactly(iCalls).withExactArgs(sPath)
					.returns(Promise.reject(oError)); // UI5 type not found
				this.oLogMock.expects("warning").exactly(iCalls)
					.withExactArgs("failed type", sPath,
						"sap.ui.model.odata.v4.ODataPropertyBinding");

				function onChange() {
					oBinding.detachChange(onChange);
					oBinding.attachChange(done);
					setTimeout(function () {
						// only with force update, failed type is requested again
						oBinding.checkUpdate(bForceUpdate);
					}, 0);
				}

				// initially, type is requested
				oControl.bindProperty("text", sPath);
				oBinding = oControl.getBinding("text");
				oBinding.attachChange(onChange);
			}
		);
	});

	// TODO bSuspended? In v2 it is ignored (check with core)
	// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.
});
