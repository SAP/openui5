/*global QUnit,sinon*/

jQuery.sap.require("sap.ui.fl.registry.ChangeRegistryItem");

(function(ChangeRegistryItem) {
	"use strict";

	QUnit.module("sap.ui.fl.registry.ChangeRegistryItem", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

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
		//Arrange
		var errorLogSpy = sinon.spy(jQuery.sap.log, "error");

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

}(sap.ui.fl.registry.ChangeRegistryItem));
