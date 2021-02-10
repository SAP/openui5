/*
 * ! copyright
 */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/sinon-4"
], function(
	XMLView,
	sinon
) {
	"use strict";
	function _renderComplexView() {
		var oView;
		return XMLView.create({
			id: "idMain1",
			viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
		}).then(function(oViewInstance) {
			oView = oViewInstance;
			oViewInstance.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			return oViewInstance.getController().isDataReady();
		}).then(function() {
			return oView;
		});
	}

	function _setupSharedObjects() {
		return _renderComplexView().then(function(oView) {
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
				mShared.delegate = aArgs[1];
				return mShared;
			});
		});
	}

	var TestUtil = {
		assertElementsEqual: function(mActualAdditionalElement, mExpected, msg, assert) {
			assert.equal(mActualAdditionalElement.selected, mExpected.selected, msg + " -selected");
			assert.equal(mActualAdditionalElement.label, mExpected.label, msg + " -label");
			assert.equal(mActualAdditionalElement.tooltip, mExpected.tooltip, msg + " -tooltip");
			assert.equal(mActualAdditionalElement.type, mExpected.type, msg + " -type");
			assert.equal(mActualAdditionalElement.elementId, mExpected.elementId, msg + " -element id");
			assert.equal(mActualAdditionalElement.elementId, mExpected.elementId, msg + " -element id");
			assert.equal(mActualAdditionalElement.bindingPath, mExpected.bindingPath, msg + " -bindingPath (used for OPA tests and debugging)");
		},

		isFieldPresent: function(oControl, oInvisibleElement) {
			var sLabel = oControl.getLabelText && oControl.getLabelText() || oControl.getLabel();
			return oInvisibleElement.label === sLabel;
		},

		setupSharedObjects: _setupSharedObjects,

		commonHooks: function() {
			return {
				before: function() {
					return _setupSharedObjects().then(function(mShared) {
						//Shared objects for all tests => Don't modify them, it will have side-effects on other tests!
						this.oView = mShared.view;
						this.mAddViaDelegateAction = mShared.mAddViaDelegateAction;
						this.oDelegate = mShared.delegate;
						this.sandbox = sinon.sandbox.create();
					}.bind(this));
				},
				afterEach: function() {
					this.sandbox.restore();
				},
				after: function () {
					this.oView.getController().destroy();
					this.oView.destroy();
				}
			};
		}
	};

	return TestUtil;
});
