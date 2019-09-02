/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/registry/ChangeTypeMetadata",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	MoveControlsChangeHandler,
	ChangeTypeMetadata,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	var oValidChangeHandler = {
		applyChange: function() {},
		revertChange: function() {},
		completeChangeContent: function() {}
	};

	QUnit.module("sap.ui.fl.registry.ChangeTypeMetadata", {
		beforeEach: function () {
			this.sErrorMessageInMissingChangeHandlerCase =
				"The ChangeHandler is either not available or does not fulfill all needed requirements";
		}
	}, function() {
		QUnit.test("constructor - required params and their getter", function(assert) {
			//Arrange
			var mParam = {
				name: "ABC",
				changeHandler: oValidChangeHandler
			};

			//Act
			var oChangeTypeMetadata = new ChangeTypeMetadata(mParam);

			//Assert
			assert.equal(oChangeTypeMetadata.getName(), "ABC");
			return oChangeTypeMetadata.getChangeHandler()
				.then(function (oReturnedChangeHandler) {
					assert.equal(oReturnedChangeHandler, oValidChangeHandler);
				});
		});

		QUnit.test("constructor - shall log error messages for missing mandatory parameters", function(assert) {
			//Arrange
			var oErrorLogStub = sandbox.stub(Log, "error");

			//Act
			/*eslint-disable no-new*/
			new ChangeTypeMetadata({});
			/*eslint-enable no-new*/

			//Assert
			assert.equal(oErrorLogStub.callCount, 2, "two errors were logged");
			sandbox.restore();
		});

		QUnit.test("constructor - all params and their getter", function(assert) {
			//Arrange
			var mParam = {
				name: "ABC",
				changeHandler: oValidChangeHandler,
				labelKey: "myLabelKey",
				tooltipKey: "myTooltipKey",
				iconKey: "myIconKey",
				sortIndex: 5
			};

			//Act
			var oChangeTypeMetadata = new ChangeTypeMetadata(mParam);

			//Assert
			assert.equal(oChangeTypeMetadata.getName(), "ABC");
			assert.equal(oChangeTypeMetadata.getLabel(), "myLabelKey");
			assert.equal(oChangeTypeMetadata.getTooltip(), "myTooltipKey");
			assert.equal(oChangeTypeMetadata.getIcon(), "myIconKey");
			assert.equal(oChangeTypeMetadata.getSortIndex(), 5);
		});

		QUnit.test("getChangeHandler without applyChange function", function (assert) {
			var oMissingApply = {
				revertChange: function() {},
				completeChangeContent: function() {}
			};
			var oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oMissingApply});
			return oChangeTypeMetadata.getChangeHandler()
				.catch(function (oError) {
					assert.equal(this.sErrorMessageInMissingChangeHandlerCase, oError.message, "then the change handler is not returned");
				}.bind(this));
		});

		QUnit.test("getChangeHandler without revertChange function", function (assert) {
			var oMissingRevert = {
				applyChange: function() {},
				completeChangeContent: function() {}
			};
			var oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oMissingRevert});
			return oChangeTypeMetadata.getChangeHandler()
				.catch(function (oError) {
					assert.equal(this.sErrorMessageInMissingChangeHandlerCase, oError.message, "then the change handler is not returned");
				}.bind(this));
		});

		QUnit.test("getChangeHandler without completeChangeContent function", function (assert) {
			var oMissingCompleteContent = {
				applyChange: function() {},
				revertChange: function() {}
			};
			var oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oMissingCompleteContent});
			return oChangeTypeMetadata.getChangeHandler()
				.catch(function (oError) {
					assert.equal(this.sErrorMessageInMissingChangeHandlerCase, oError.message, "then the change handler is not returned");
				}.bind(this));
		});

		QUnit.test("getChangeHandler with all functions", function (assert) {
			var oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oValidChangeHandler});
			return oChangeTypeMetadata.getChangeHandler()
				.then(function (oReturnedChangeHandler) {
					assert.equal(oReturnedChangeHandler, oValidChangeHandler, "then the correct change handler is returned");
				});
		});

		QUnit.test("getChangeHandler with explicit registered changeHandler path", function(assert) {
			var sExplicitRegisteredChangeHandlerPath = 'sap.ui.fl.changeHandler.MoveControls';
			var oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: sExplicitRegisteredChangeHandlerPath});
			return oChangeTypeMetadata.getChangeHandler()
				.then(function (oReturnedChangeHandler) {
					assert.equal(oReturnedChangeHandler, MoveControlsChangeHandler, "then correct loaded changehandler is returned");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
