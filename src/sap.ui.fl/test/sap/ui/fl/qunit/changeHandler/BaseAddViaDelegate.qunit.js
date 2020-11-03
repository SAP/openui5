/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseAddViaDelegate",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/layout/form/Form",
	"sap/ui/thirdparty/sinon-4"
],
function(
	BaseAddViaDelegate,
	DelegateMediatorAPI,
	Change,
	JsControlTreeModifier,
	Form,
	sinon
) {
	"use strict";

	function createChangeHandler (bSkipCreateLayout) {
		return BaseAddViaDelegate.createAddViaDelegateChangeHandler({
			addProperty: function () {},
			aggregationName: "formElements",
			parentAlias: "parentFormContainer",
			fieldSuffix: "-field",
			supportsDefault: true,
			skipCreateLayout: bSkipCreateLayout
		});
	}

	var sandbox = sinon.sandbox.create();
	var oComponent = sap.ui.getCore().createComponent({
		name: "testComponent",
		id: "testComponent"
	});
	var mPropertyBag = {modifier: JsControlTreeModifier, appComponent: oComponent};
	var mSpecificChangeInfo = {
		newControlId: "someControlId",
		bindingPath: "some/binding/path",
		parentId: "testForm",
		index: 0
	};

	QUnit.module("sap.ui.fl.changeHandler.BaseAddViaDelegate - Condensing", {
		beforeEach: function () {
			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);
			sandbox.stub(DelegateMediatorAPI, "getDelegateForControl").callsFake(function () {
				return Promise.resolve({instance: this.oDelegate});
			}.bind(this));

			this.oForm = new Form({
				id: "testForm",
				"sap.ui.fl.delegate": {
					name: "path/to/some/delegate"
				}
			});

			this.oChange = new Change({
				selector: JsControlTreeModifier.getSelector(this.oForm, oComponent)
			});
		},
		afterEach: function () {
			this.oForm.destroy();
			delete this.oDelegate;
			delete this.oChange;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when a change handler skips layout creation", function (assert) {
			var oChangeHandler = createChangeHandler(true);
			this.oDelegate = {
				createLayout: function () {}
			};
			oChangeHandler.completeChangeContent(this.oChange, mSpecificChangeInfo, mPropertyBag);

			return oChangeHandler.getCondenserInfo(this.oChange, mPropertyBag).then(function (oCondenserInfo) {
				assert.notEqual(
					oCondenserInfo,
					undefined,
					"then condensing is enabled"
				);
			});
		});

		QUnit.test("when a delegate doesn't create a custom layout", function (assert) {
			var oChangeHandler = createChangeHandler(false);
			this.oDelegate = {};
			oChangeHandler.completeChangeContent(this.oChange, mSpecificChangeInfo, mPropertyBag);

			return oChangeHandler.getCondenserInfo(this.oChange, mPropertyBag).then(function (oCondenserInfo) {
				assert.notEqual(
					oCondenserInfo,
					undefined,
					"then condensing is enabled"
				);
			});
		});

		QUnit.test("when a delegate creates a custom layout", function (assert) {
			var oChangeHandler = createChangeHandler(false);
			this.oDelegate = {
				createLayout: function () {}
			};
			oChangeHandler.completeChangeContent(this.oChange, mSpecificChangeInfo, mPropertyBag);

			return oChangeHandler.getCondenserInfo(this.oChange, mPropertyBag).then(function (oCondenserInfo) {
				assert.strictEqual(
					oCondenserInfo,
					undefined,
					"then condensing is disabled"
				);
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});