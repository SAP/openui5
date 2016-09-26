jQuery.sap.require("sap.ui.fl.registry.ChangeRegistryItem");

(function(ChangeRegistryItem) {

	module("sap.ui.fl.registry.ChangeRegistryItem", {
		setup: function() {
		},
		teardown: function() {
		}
	});

	test("constructor - required params and their getter", function() {
		//Arrange
		var oMetadataObject = {name: "myChangeTypeMetadata"};
		var mParam = {
			changeTypeMetadata: oMetadataObject,
			controlType: "sap.ui.fl.DummyControl"
		};

		//Act
		var instance = new ChangeRegistryItem(mParam);

		//Assert
		deepEqual(instance.getChangeTypeMetadata(), oMetadataObject);
		equal(instance.getControlType(), "sap.ui.fl.DummyControl");

	});

	test("constructor - exception on required params missing", function() {
		//Arrange
		var errorLogSpy = sinon.spy(jQuery.sap.log, "error");

		//Act
		var instance = new ChangeRegistryItem({});

		//Assert
		ok(errorLogSpy.calledTwice);

	});

	test("constructor - all params and their getter", function() {
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
		deepEqual(instance.getChangeTypeMetadata(), mParam.changeTypeMetadata);
		equal(instance.getControlType(), mParam.controlType);
		deepEqual(instance.getPermittedRoles(), mParam.permittedRoles);
		deepEqual(instance.getDragTargets(), mParam.dragTargets);
	});

}(sap.ui.fl.registry.ChangeRegistryItem));
