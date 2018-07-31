/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/registry/ChangeTypeMetadata",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	ChangeTypeMetadata,
	sinon
) {
	"use strict";

	QUnit.module("sap.ui.fl.registry.ChangeTypeMetadata", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	}, function() {
		QUnit.test("constructor - required params and their getter", function(assert) {
			//Arrange
			var mParam = {
				name: "ABC",
				changeHandler: "myChangeHandler"
			};

			//Act
			var instance = new ChangeTypeMetadata(mParam);

			//Assert
			assert.equal(instance.getName(), "ABC");
			assert.equal(instance.getChangeHandler(), "myChangeHandler");
		});

		QUnit.test("constructor - shall log error messages for missing mandatory parameters", function(assert) {
			var Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");

			//Arrange
			var errorLogStub = sinon.stub(Log, "error");

			//Act
			/*eslint-disable no-new*/
			new ChangeTypeMetadata({});
			/*eslint-enable no-new*/

			//Assert
			sinon.assert.calledTwice(errorLogStub);
			errorLogStub.restore();
		});

		QUnit.test("constructor - all params and their getter", function(assert) {
			//Arrange
			var mParam = {
				name: "ABC",
				changeHandler: "myChangeHandler",
				labelKey: "myLabelKey",
				tooltipKey: "myTooltipKey",
				iconKey: "myIconKey",
				sortIndex: 5
			};

			//Act
			var instance = new ChangeTypeMetadata(mParam);

			//Assert
			assert.equal(instance.getName(), "ABC");
			assert.equal(instance.getChangeHandler(), "myChangeHandler");
			assert.equal(instance.getLabel(), "myLabelKey");
			assert.equal(instance.getTooltip(), "myTooltipKey");
			assert.equal(instance.getIcon(), "myIconKey");
			assert.equal(instance.getSortIndex(), 5);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
