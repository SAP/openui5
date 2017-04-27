/*global QUnit,sinon*/

jQuery.sap.require("sap.ui.fl.core.EventDelegate");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

(function(EventDelegate, ChangeRegistry) {
	"use strict";

	QUnit.module("sap.ui.fl.core.EventDelegate", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("constructor - required parameters", function(assert) {
		//Arrange
		var oControl = {name: "ThisShouldBeASAPUI5Control"};
		var oSupportedRegistryItems = {"labelChange": "myLabelChange", "visibility": "myVisibilityChange"};
		var spyLog = sinon.spy(jQuery.sap.log, "error");
		//Act
		var instance = new EventDelegate(oControl, oSupportedRegistryItems);

		//Assert
		assert.deepEqual(instance._oControl, oControl);
		assert.deepEqual(instance._oSupportedRegistryItems, oSupportedRegistryItems);
		assert.equal(spyLog.callCount, 0);
		spyLog.restore();
	});

	QUnit.test("constructor - without required parameters, errors should be logged", function(assert) {
		//Arrange
		var spyLog = sinon.spy(jQuery.sap.log, "error");
		//Act

		/*eslint-disable no-new*/
		new EventDelegate();
		/*eslint-enable no-new*/

		//Assert
		assert.equal(spyLog.callCount, 2);
		spyLog.restore();
	});

	QUnit.test("registerControl - register control first time", function(assert) {
		//Arrange
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

	QUnit.test("registerControl - register control, already registered", function(assert) {
		//Arrange
		var registerExplicitStub = sinon.stub(EventDelegate, "registerExplicitChanges");
		var oControl = {
			aDelegates: [
				{
					oDelegate: {
						getType: function() {
							return "Flexibility";
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

	QUnit.test("registerExplicitChanges - register control when changetypes available", function(assert) {
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
				};
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

	QUnit.test("registerExplicitChanges - don't register control when no change types", function(assert) {
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
				};
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
