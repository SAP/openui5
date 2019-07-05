/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	ChangesWriteAPI,
	FlexUtils,
	FlexControllerFactory,
	ManagedObject,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReturnValue = "returnValue";
	function setMethodStub(aStubArgs, aArguments, vReturnValue) {
		var fnPersistenceStub = sandbox.stub.apply(sandbox, aStubArgs);
		fnPersistenceStub
			.withArgs.apply(fnPersistenceStub, aArguments)
			.returns(vReturnValue);
		return fnPersistenceStub;
	}

	QUnit.module("Given ChangesController", {
		beforeEach: function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getFlexControllerInstance is called with a selector object", function(assert) {
			var oSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: {
					id: "appComponent"
				}
			};

			setMethodStub([FlexControllerFactory, "createForControl"], [oSelector.appComponent], sReturnValue);

			assert.ok(ChangesController.getFlexControllerInstance(oSelector), sReturnValue, "then the flex persistence was called with the correct parameters");
		});

		QUnit.test("when getFlexControllerInstance is called with a managed object instance", function(assert) {
			var oManagedObject = new ManagedObject();

			setMethodStub([FlexControllerFactory, "createForControl"], [oManagedObject], sReturnValue);

			assert.ok(ChangesController.getFlexControllerInstance(oManagedObject), sReturnValue, "then the flex persistence was called with the correct parameters");
			oManagedObject.destroy();
		});

		QUnit.test("when getFlexControllerInstance is called with a component name and app version", function(assert) {
			var sComponentName = "componentName";
			var sAppVersion = "1.2.3";

			setMethodStub([FlexControllerFactory, "create"], [sComponentName, sAppVersion], sReturnValue);

			assert.ok(ChangesController.getFlexControllerInstance(sComponentName, sAppVersion), sReturnValue, "then the flex persistence was called with the correct parameters");
		});

		QUnit.test("when getDescriptorFlexControllerInstance is called with a selector object", function(assert) {
			var oSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: {
					id: "appComponent"
				}
			};
			var oMockDescriptorFlexController = {
				name: "descriptorPersistenceName",
				version: "1.2.3"
			};

			setMethodStub([FlexUtils, "getAppDescriptorComponentObjectForControl"], [oSelector.appComponent], oMockDescriptorFlexController);
			setMethodStub([FlexControllerFactory, "create"], [oMockDescriptorFlexController.name, oMockDescriptorFlexController.version], sReturnValue);

			assert.ok(ChangesController.getDescriptorFlexControllerInstance(oSelector), sReturnValue, "then the flex persistence was called with the correct parameters");
		});

		QUnit.test("when getDescriptorFlexControllerInstance is called with a managed object instance", function(assert) {
			var oManagedObject = new ManagedObject();
			var oMockDescriptorFlexController = {
				name: "descriptorPersistenceName",
				version: "1.2.3"
			};

			setMethodStub([FlexUtils, "getAppDescriptorComponentObjectForControl"], [oManagedObject], oMockDescriptorFlexController);
			setMethodStub([FlexControllerFactory, "create"], [oMockDescriptorFlexController.name, oMockDescriptorFlexController.version], sReturnValue);

			assert.ok(ChangesController.getDescriptorFlexControllerInstance(oManagedObject), sReturnValue, "then the flex persistence was called with the correct parameters");
			oManagedObject.destroy();
		});

		QUnit.test("when getAppComponentForSelector is called with a selector", function(assert) {
			var oSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: {
					id: "appComponent"
				}
			};

			setMethodStub([FlexUtils, "getAppComponentForControl"], [oSelector.appComponent], sReturnValue);

			assert.ok(ChangesController.getAppComponentForSelector(oSelector), sReturnValue, "then the flex persistence was called with the correct parameters");
		});

		QUnit.test("when getAppComponentForSelector is called with a managed object", function(assert) {
			var oManagedObject = new ManagedObject();

			setMethodStub([FlexUtils, "getAppComponentForControl"], [oManagedObject], sReturnValue);

			assert.ok(ChangesController.getAppComponentForSelector(oManagedObject), sReturnValue, "then the flex persistence was called with the correct parameters");
			oManagedObject.destroy();
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
