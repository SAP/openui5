/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	ManifestUtils,
	FlexUtils,
	FlexControllerFactory,
	ManagedObject,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
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

			assert.equal(ChangesController.getFlexControllerInstance(oSelector), sReturnValue, "then the correct values were returned");
		});

		QUnit.test("when getFlexControllerInstance is called with a managed object instance", function(assert) {
			var oManagedObject = new ManagedObject();

			setMethodStub([FlexControllerFactory, "createForControl"], [oManagedObject], sReturnValue);

			assert.equal(ChangesController.getFlexControllerInstance(oManagedObject), sReturnValue, "then the correct values were returned");
			oManagedObject.destroy();
		});

		QUnit.test("when getFlexControllerInstance is called with a component name", function(assert) {
			var sComponentName = "componentName";

			setMethodStub([FlexControllerFactory, "create"], [sComponentName], sReturnValue);

			assert.equal(ChangesController.getFlexControllerInstance(sComponentName), sReturnValue, "then the correct values were returned");
		});

		QUnit.test("when getDescriptorFlexControllerInstance is called with a selector object", function(assert) {
			var oSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: {
					id: "appComponent"
				}
			};
			var sAppId = "descriptorPersistenceName";

			setMethodStub([FlexUtils, "getAppDescriptor"], {}, oSelector.appComponent);
			setMethodStub([ManifestUtils, "getAppIdFromManifest"], [oSelector.appComponent], sAppId);
			setMethodStub([FlexControllerFactory, "create"], [sAppId], sReturnValue);

			assert.equal(ChangesController.getDescriptorFlexControllerInstance(oSelector), sReturnValue, "then the correct values were returned");
		});

		QUnit.test("when getDescriptorFlexControllerInstance is called with a managed object instance", function(assert) {
			var oManagedObject = new ManagedObject();
			var sAppId = "descriptorPersistenceName";
			var oAppComponent = {
				id: "appComponent"
			};

			setMethodStub([FlexUtils, "getAppDescriptor"], {}, oAppComponent);
			setMethodStub([ManifestUtils, "getAppIdFromManifest"], [oAppComponent], sAppId);
			setMethodStub([FlexControllerFactory, "create"], [sAppId], sReturnValue);

			assert.equal(ChangesController.getDescriptorFlexControllerInstance(oManagedObject), sReturnValue, "then the correct values were returned");
			oManagedObject.destroy();
		});

		QUnit.test("when getAppComponentForSelector is called with a selector", function(assert) {
			var oAppComponent = {
				id: "appComponent"
			};
			var oSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: oAppComponent
			};

			setMethodStub([FlexUtils, "getAppComponentForControl"], [oSelector.appComponent], sReturnValue);

			assert.deepEqual(ChangesController.getAppComponentForSelector(oSelector), oAppComponent, "then the correct values were returned");
		});

		QUnit.test("when getAppComponentForSelector is called with a managed object", function(assert) {
			var oManagedObject = new ManagedObject();

			setMethodStub([FlexUtils, "getAppComponentForControl"], [oManagedObject], sReturnValue);

			assert.equal(ChangesController.getAppComponentForSelector(oManagedObject), sReturnValue, "then the correct values were returned");
			oManagedObject.destroy();
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
