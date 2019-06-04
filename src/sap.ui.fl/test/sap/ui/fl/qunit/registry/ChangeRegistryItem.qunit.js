/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/registry/ChangeRegistryItem",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	ChangeRegistryItem,
	sinon
) {
	"use strict";

	QUnit.module("sap.ui.fl.registry.ChangeRegistryItem", {
	}, function() {
		QUnit.test("constructor - required params and their getter", function(assert) {
			//Arrange
			var oMetadataObject = {name: "myChangeTypeMetadata"};
			var mParam = {
				changeTypeMetadata: oMetadataObject,
				controlType: "sap.ui.fl.DummyControl"
			};

			//Act
			var instance = new ChangeRegistryItem(mParam);

			//Assert
			assert.deepEqual(instance.getChangeTypeMetadata(), oMetadataObject);
			assert.equal(instance.getControlType(), "sap.ui.fl.DummyControl");
		});

		QUnit.test("constructor - exception on required params missing", function(assert) {
			var Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");

			//Arrange
			var errorLogSpy = sinon.spy(Log, "error");

			//Act
			/*eslint-disable no-new*/
			new ChangeRegistryItem({});
			/*eslint-enable no-new*/

			//Assert
			assert.ok(errorLogSpy.calledTwice);
		});

		QUnit.test("constructor - all params and their getter", function(assert) {
			//Arrange
			var mParam = {
				changeTypeMetadata: {name: "myChangeTypeMetadata"},
				controlType: "sap.ui.fl.DummyControl",
				permittedRoles: {
					keyuser: ["myChange1", "myChange2"],
					enduser: ["myChange2"]
				},
				dragTargets: ["myTarget1", "myTarget2"]
			};

			//Act
			var instance = new ChangeRegistryItem(mParam);

			//Assert
			assert.deepEqual(instance.getChangeTypeMetadata(), mParam.changeTypeMetadata);
			assert.equal(instance.getControlType(), mParam.controlType);
			assert.deepEqual(instance.getPermittedRoles(), mParam.permittedRoles);
			assert.deepEqual(instance.getDragTargets(), mParam.dragTargets);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
