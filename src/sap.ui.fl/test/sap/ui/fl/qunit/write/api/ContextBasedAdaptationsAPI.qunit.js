/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function (
	Version,
	ContextBasedAdaptationsAPI,
	Storage,
	Versions,
	Settings,
	Layer,
	Utils,
	ManifestUtils,
	Control,
	JSONModel,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

	function stubSettings(sandbox) {
		sandbox.stub(Settings, "getInstance").resolves({
			isContextBasedAdaptationEnabled: function () {
				return true;
			},
			isSystemWithTransports: function () {
				return false;
			}
		});
		sandbox.stub(Utils, "createDefaultFileName").returns("someFileName");
	}

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.control;
			ContextBasedAdaptationsAPI.create(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			ContextBasedAdaptationsAPI.create(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when no contextBasedAdaptation is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.contextBasedAdaptation;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			ContextBasedAdaptationsAPI.create(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when a control and a layer were provided and a draft exists", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return Version.Number.Draft;
				}
			});
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function (sResult) {
				var oArgs = oPublishStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObject, { id: "someFileName" }, "then the correct flexObject is used");
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
				assert.equal(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.equal(sResult, "Success", "the context-based adaptation is created");
			});
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return 1;
				}
			});
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function (sResult) {
				var oArgs = oPublishStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObject, { id: "someFileName" }, "then the correct flexObject is used");
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
				assert.equal(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.equal(sResult, "Success", "the context-based adaptation is created");
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.reorder is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				parameters: {
					priorities: ["", "", "", ""]
				}
			};
			stubSettings(sandbox);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.control;
			ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when no priorities list is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.parameters;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No valid priority list was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when control and layer and prorities list are provided", function (assert) {
			var done = assert.async();
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "reorder").resolves("Success");
			ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).then(function (sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
				assert.equal(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.equal(sResult, "Success", "then the reorder was succesfull");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.load is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.control;
			ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			var done = assert.async();
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				done();
			});
		});

		QUnit.test("when control and layer is provided and context-based adaptation response is returned", function (assert) {
			var done = assert.async();
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			var aAdaptations = {
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022"
					}
				]
			};
			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves(aAdaptations);
			ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function (sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.version, 1, "then correct version is used");
				assert.equal(oArgs.reference, "com.sap.test.app", "the correct reference is used");
				assert.ok(sResult instanceof JSONModel, "the correct response type is returned");
				assert.equal(sResult.getData().adaptations.length, 2, "the correct data length is returned");
				assert.deepEqual(sResult.getData(), aAdaptations, "then the correct data is returned");
				done();
			});
		});

		QUnit.test("when control and layer is provided and an empty response is returned", function (assert) {
			var done = assert.async();
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves();
			ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function (sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.version, 1, "then the correct version is used");
				assert.equal(oArgs.reference, "com.sap.test.app", "then correct reference is used");
				assert.ok(sResult instanceof JSONModel, "the correct response type is returned");
				assert.equal(sResult.getData().adaptations.length, 0, "then the correct data length is returned");
				assert.deepEqual(sResult.getData(), {adaptations: []}, "then the correct data is returned");
				done();
			});
		});
	});
});
