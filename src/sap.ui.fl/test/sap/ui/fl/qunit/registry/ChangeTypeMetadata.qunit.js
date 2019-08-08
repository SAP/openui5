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

	QUnit.module("sap.ui.fl.registry.ChangeTypeMetadata", function() {
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
			assert.equal(oChangeTypeMetadata.getChangeHandler(), oValidChangeHandler);
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

		QUnit.test("getChangeHandler", function(assert) {
			var oMissingApply = {
				revertChange: function() {},
				completeChangeContent: function() {}
			};
			var oMissingRevert = {
				applyChange: function() {},
				completeChangeContent: function() {}
			};
			var oMissingCompleteContent = {
				applyChange: function() {},
				revertChange: function() {}
			};

			var oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oMissingApply});
			assert.equal(undefined, oChangeTypeMetadata.getChangeHandler(), "without applyChange function the change handler is not returned");

			oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oMissingRevert});
			assert.equal(undefined, oChangeTypeMetadata.getChangeHandler(), "without revertChange function the change handler is not returned");

			oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oMissingCompleteContent});
			assert.equal(undefined, oChangeTypeMetadata.getChangeHandler(), "without completeChangeContent function the change handler is not returned");

			oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: oValidChangeHandler});
			assert.equal(oChangeTypeMetadata.getChangeHandler(), oValidChangeHandler, "with all functions the correct change handler is returned");

			var sExplicitRegisteredChangeHandlerPath = 'sap.ui.fl.changeHandler.MoveControls';
			oChangeTypeMetadata = new ChangeTypeMetadata({changeHandler: sExplicitRegisteredChangeHandlerPath});
			assert.equal(oChangeTypeMetadata.getChangeHandler(), MoveControlsChangeHandler, "then correct loaded changehandler is returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
