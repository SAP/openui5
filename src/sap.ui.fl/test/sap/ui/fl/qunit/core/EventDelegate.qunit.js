jQuery.sap.require("sap.ui.fl.core.EventDelegate");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

(function(EventDelegate, ChangeRegistry) {

	module("sap.ui.fl.core.EventDelegate", {
		setup: function() {
		},
		teardown: function() {
		}
	});

	test("constructor - required parameters", function() {
		//Arrange
		var oControl = {name: "ThisShouldBeASAPUI5Control"};
		var oSupportedRegistryItems = {"labelChange": "myLabelChange", "visibility": "myVisibilityChange"};
		var spyLog = sinon.spy(jQuery.sap.log, "error");
		//Act
		var instance = new EventDelegate(oControl, oSupportedRegistryItems);

		//Assert
		deepEqual(instance._oControl, oControl);
		deepEqual(instance._oSupportedRegistryItems, oSupportedRegistryItems);
		equal(spyLog.callCount, 0);
		spyLog.restore();
	});

	test("constructor - without required parameters, errors should be logged", function() {
		//Arrange
		var spyLog = sinon.spy(jQuery.sap.log, "error");
		//Act
		var instance = new EventDelegate();

		//Assert
		equal(spyLog.callCount, 2);
		spyLog.restore();
	});

	test("registerControl - register control first time", function() {
		//Arrange
		var oSupportedRegistryItems = {"labelChange": "myLabelChange", "visibility": "myVisibilityChange"};
		var registerExplicitStub = sinon.stub(EventDelegate, "registerExplicitChanges");
		var oControl = {
			aDelegates: []
		};
		//Act
		EventDelegate.registerControl(oControl);
		//Assert
		sinon.assert.called(registerExplicitStub);
		registerExplicitStub.restore();
	});

	test("registerControl - register control, already registered", function() {
		//Arrange
		var oSupportedRegistryItems = {"labelChange": "myLabelChange", "visibility": "myVisibilityChange"};
		var registerExplicitStub = sinon.stub(EventDelegate, "registerExplicitChanges");
		var oControl = {
			aDelegates: [
				{
					oDelegate: {
						getType: function() {
							return "Flexibility"
						}
					}
				}
			]
		};
		//Act
		EventDelegate.registerControl(oControl);
		//Assert
		sinon.assert.notCalled(registerExplicitStub);
		registerExplicitStub.restore();
	});

	test("registerExplicitChanges - register control when changetypes available", function() {
		//Arrange
		var oSupportedRegistryItems = {"labelChange": "myLabelChange", "visibility": "myVisibilityChange"};
		var changeRegSpy = sinon.spy(ChangeRegistry, "getInstance");
		var changeRegGetRegItemsStub = sinon.stub(ChangeRegistry.prototype, "getRegistryItems").returns(oSupportedRegistryItems);
		var addEventDelegateStub = sinon.stub();
		var oControl = {
			getMetadata: function() {
				return {
					getElementName: function() {
						return "My.Control.Name";
					}
				}
			},
			addEventDelegate: addEventDelegateStub
		};

		//Act
		EventDelegate.registerExplicitChanges(oControl);

		//Assert
		sinon.assert.called(changeRegSpy);
		sinon.assert.called(changeRegGetRegItemsStub);
		sinon.assert.called(addEventDelegateStub);
		changeRegSpy.restore();
		changeRegGetRegItemsStub.restore();
	});

	test("registerExplicitChanges - don't register control when no change types", function() {
		//Arrange
		var oSupportedRegistryItems = {};
		var changeRegSpy = sinon.spy(ChangeRegistry, "getInstance");
		var changeRegGetRegItemsStub = sinon.stub(ChangeRegistry.prototype, "getRegistryItems").returns(oSupportedRegistryItems);
		var addEventDelegateStub = sinon.stub();
		var oControl = {
			getMetadata: function() {
				return {
					getElementName: function() {
						return "My.Control.Name";
					}
				}
			},
			addEventDelegate: addEventDelegateStub
		};

		//Act
		EventDelegate.registerExplicitChanges(oControl);

		//Assert
		sinon.assert.called(changeRegSpy);
		sinon.assert.called(changeRegGetRegItemsStub);
		sinon.assert.notCalled(addEventDelegateStub);
		changeRegSpy.restore();
		changeRegGetRegItemsStub.restore();
	});

}(sap.ui.fl.core.EventDelegate, sap.ui.fl.registry.ChangeRegistry));
