/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	XMLView,
	sinon,
	nextUIUpdate
) {
	"use strict";
	async function renderComplexView() {
		const oViewInstance = await XMLView.create({
			id: "idMain1",
			viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
		});
		oViewInstance.placeAt("qunit-fixture");
		await nextUIUpdate();
		await oViewInstance.getController().isDataReady();
		return oViewInstance;
	}

	function _setupSharedObjects() {
		return renderComplexView().then(function(oView) {
			var mShared = {
				view: oView,
				group: oView.byId("GroupEntityType01"),
				mAddViaDelegateAction: undefined,
				delegate: undefined
			};
			return Promise.all([
				mShared.group.getMetadata().loadDesignTime(),
				new Promise(function(resolve) {
					sap.ui.require(["sap/ui/rta/test/additionalElements/V2StackDelegate"], resolve);
				})
			]).then(function(aArgs) {
				mShared.mAddViaDelegateAction = aArgs[0].aggregations.formElements.actions.add.delegate;
				[, mShared.delegate] = aArgs;
				return mShared;
			});
		});
	}

	var TestUtil = {
		assertElementsEqual(mActualAdditionalElement, mExpected, msg, assert) {
			assert.equal(mActualAdditionalElement.selected, mExpected.selected, `${msg} -selected`);
			assert.equal(mActualAdditionalElement.label, mExpected.label, `${msg} -label`);
			assert.equal(mActualAdditionalElement.tooltip, mExpected.tooltip, `${msg} -tooltip`);
			assert.equal(mActualAdditionalElement.type, mExpected.type, `${msg} -type`);
			assert.equal(mActualAdditionalElement.elementId, mExpected.elementId, `${msg} -element id`);
			assert.equal(mActualAdditionalElement.bindingPath, mExpected.bindingPath,
				`${msg} -bindingPath (used for OPA tests and debugging)`);
		},

		isFieldPresent(oControl, oInvisibleElement) {
			var sLabel = oControl.getLabelText && oControl.getLabelText() || oControl.getLabel();
			return oInvisibleElement.label === sLabel;
		},

		setupSharedObjects: _setupSharedObjects,

		commonHooks() {
			return {
				before() {
					return _setupSharedObjects().then(function(mShared) {
						// Shared objects for all tests => Don't modify them, it will have side-effects on other tests!
						this.oView = mShared.view;
						this.mAddViaDelegateAction = mShared.mAddViaDelegateAction;
						this.oDelegate = mShared.delegate;
						this.sandbox = sinon.createSandbox();
					}.bind(this));
				},
				afterEach() {
					this.sandbox.restore();
				},
				after() {
					this.oView.getController().destroy();
					this.oView.destroy();
				}
			};
		}
	};

	return TestUtil;
});
