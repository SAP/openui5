/* global QUnit */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/changeHandler/BaseAddViaDelegate",
	"sap/ui/fl/Utils",
	"sap/ui/layout/form/Form",
	"sap/ui/thirdparty/sinon-4"
], function(
	JsControlTreeModifier,
	Component,
	UIChange,
	DelegateMediatorAPI,
	BaseAddViaDelegate,
	Utils,
	Form,
	sinon
) {
	"use strict";

	function createChangeHandler(bSkipCreateLayout) {
		return BaseAddViaDelegate.createAddViaDelegateChangeHandler({
			addProperty() {},
			aggregationName: "formElements",
			parentAlias: "parentFormContainer",
			fieldSuffix: "-field",
			supportsDefault: true,
			skipCreateLayout: bSkipCreateLayout
		});
	}

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.changeHandler.BaseAddViaDelegate - Condensing", {
		before() {
			return Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.mPropertyBag = {modifier: JsControlTreeModifier, appComponent: oComponent};
				this.mSpecificChangeInfo = {
					newControlId: "someControlId",
					bindingPath: "some/binding/path",
					parentId: "testForm",
					index: 0
				};
			}.bind(this));
		},
		beforeEach() {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
			sandbox.stub(DelegateMediatorAPI, "getDelegateForControl").callsFake(function() {
				return Promise.resolve({instance: this.oDelegate});
			}.bind(this));

			this.oForm = new Form({
				id: "testForm",
				"sap.ui.fl.delegate": {
					name: "path/to/some/delegate"
				}
			});

			this.oChange = new UIChange({
				selector: JsControlTreeModifier.getSelector(this.oForm, this.oComponent)
			});
		},
		afterEach() {
			this.oForm.destroy();
			delete this.oDelegate;
			delete this.oChange;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a change handler skips layout creation", function(assert) {
			var oChangeHandler = createChangeHandler(true);
			this.oDelegate = {
				createLayout() {}
			};
			oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);

			return oChangeHandler.getCondenserInfo(this.oChange, this.mPropertyBag).then(function(oCondenserInfo) {
				assert.notEqual(
					oCondenserInfo,
					undefined,
					"then condensing is enabled"
				);
			});
		});

		QUnit.test("when a delegate doesn't create a custom layout", function(assert) {
			var oChangeHandler = createChangeHandler(false);
			this.oDelegate = {};
			oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);

			return oChangeHandler.getCondenserInfo(this.oChange, this.mPropertyBag).then(function(oCondenserInfo) {
				assert.notEqual(
					oCondenserInfo,
					undefined,
					"then condensing is enabled"
				);
			});
		});

		QUnit.test("when a delegate creates a custom layout", function(assert) {
			var oChangeHandler = createChangeHandler(false);
			this.oDelegate = {
				createLayout() {}
			};
			oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);

			return oChangeHandler.getCondenserInfo(this.oChange, this.mPropertyBag).then(function(oCondenserInfo) {
				assert.strictEqual(
					oCondenserInfo,
					undefined,
					"then condensing is disabled"
				);
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});