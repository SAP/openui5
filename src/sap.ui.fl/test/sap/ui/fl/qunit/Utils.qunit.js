/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/isEmptyObject",
	"sap/base/Log",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Scenario",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Manifest",
	"sap/ui/core/mvc/View",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Localization,
	isEmptyObject,
	Log,
	Utils,
	Layer,
	Scenario,
	VerticalLayout,
	HorizontalLayout,
	Button,
	Component,
	UIComponent,
	Manifest,
	View,
	_omit,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const aControls = [];

	QUnit.module("sap.ui.fl.Utils", {
		beforeEach() {},
		afterEach() {
			aControls.forEach(function(oControl) {
				oControl.destroy();
			});
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isVariantByStartupParameter can detect a variant by the startup parameter", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns({
				getComponentData() {
					return {
						startupParameters: {
							"sap-app-id": ["someId"]
						}
					};
				}
			});

			const bIsStartupParameterBasedVariant = Utils.isVariantByStartupParameter({});

			assert.equal(bIsStartupParameterBasedVariant, true, "the variant was detected");
		});

		QUnit.test("isVariantByStartupParameter returns false if no variant by the startup parameter is present", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns({
				getComponentData() {
					return {
						startupParameters: {
							"some-other-param": ["test"]
						}
					};
				}
			});

			const bIsStartupParameterBasedVariant = Utils.isVariantByStartupParameter({});

			assert.equal(bIsStartupParameterBasedVariant, false, "the entity is not a variant");
		});

		QUnit.test("getClient", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-client").returns("123");
			const sClient = Utils.getClient();
			assert.equal(sClient, "123");
		});

		QUnit.test("getCurrentLanguage shall return the ISO 639-1 language of a RFC4646 language", function(assert) {
			const oGetLanguageStub = sandbox.stub(Localization, "getLanguage").returns("en-US");
			assert.equal(Utils.getCurrentLanguage("en-us"), "EN");
			oGetLanguageStub.returns("de");
			assert.equal(Utils.getCurrentLanguage("de"), "DE");
			oGetLanguageStub.returns("");
			assert.equal(Utils.getCurrentLanguage(""), "");
			oGetLanguageStub.returns("hkjhkashik");
			assert.equal(Utils.getCurrentLanguage("hkjhkashik"), "");
		});

		QUnit.test("isBinding shall return false if the property is null", function(assert) {
			const oPropertyValue = null;
			const bIsBinding = Utils.isBinding(oPropertyValue);
			assert.strictEqual(bIsBinding, false);
		});

		QUnit.test("isBinding shall return false if the property is a string which does not represent a binding", function(assert) {
			const sPropertyValue = "test";
			const bIsBinding = Utils.isBinding(sPropertyValue);
			assert.strictEqual(bIsBinding, false);
		});

		QUnit.test("isBinding shall return true if the property is a string which does represent a binding", function(assert) {
			const sPropertyValue = "{i18n>test}";
			const bIsBinding = Utils.isBinding(sPropertyValue);
			assert.strictEqual(bIsBinding, true);
		});

		QUnit.test("when isBinding is called with binding objects", function(assert) {
			assert.ok(
				Utils.isBinding({
					path: "some/binding/path"
				}),
				"then the check succeeds for regular bindings"
			);

			assert.ok(
				Utils.isBinding({
					parts: [{
						path: "path/of/part"
					}]
				}),
				"then the check succeeds for binding objects containing multiple parts"
			);
		});

		QUnit.test("when isBinding is called with non-binding objects", function(assert) {
			assert.notOk(
				Utils.isBinding({
					someProperty: "someValue"
				}),
				"then the check fails for regular objects"
			);

			assert.notOk(
				Utils.isBinding({
					path: "i/pretend/to/be/a/binding",
					ui5object: true
				}),
				"then the check fails for ui5objects that look like bindings"
			);
		});

		QUnit.test("getViewForControl called with a view", function(assert) {
			const oView = new View("view1");
			assert.strictEqual(Utils.getViewForControl(oView), oView);
		});

		QUnit.test("getViewForControl called with a control containing a view", function(assert) {
			const button1 = new Button("button1");
			const oView = new View("view2");
			const hLayout1 = new HorizontalLayout("hLayout1");
			const vLayout1 = new VerticalLayout("vLayout1");
			oView.addContent(button1);
			oView.addContent(hLayout1);
			hLayout1.addContent(vLayout1);
			/*
				view
				- button1
				- hLayout1
				  - vLayout1
			 */
			assert.strictEqual(Utils.getViewForControl(oView), oView);
		});

		QUnit.test("getAppDescriptor shall return undefined if the control does not belong to a SAPUI5 component", function(assert) {
			const oAppDescriptor = Utils.getAppDescriptor({});
			assert.strictEqual(oAppDescriptor, undefined);
		});

		QUnit.test("getAppDescriptor shall return the an appDescriptor instance", function(assert) {
			const oAppDescriptor = {
				id: "sap.ui.smartFormOData",
				getEntry(sEntryKey) {
					return sEntryKey === "sap.ui5" ? {} : undefined;
				}
			};
			const oControl = {};
			const oComponentMock = {
				getMetadata() {
					return {
						getManifestObject() {
							return {
								getJson() {
									return oAppDescriptor;
								}
							};
						}
					};
				}
			};
			sandbox.stub(Component, "getOwnerIdFor").returns("testId");
			sandbox.stub(Component, "getComponentById").returns(oComponentMock);

			assert.equal(Utils.getAppDescriptor(oControl), oAppDescriptor);
		});

		QUnit.test("getAppComponentForControl can determine the smart template special case", function(assert) {
			const oComponent = new UIComponent();
			const oAppComponent = new UIComponent();
			oComponent.getAppComponent = function() {
				return oAppComponent;
			};

			const oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oAppComponent);
		});

		QUnit.test("getAppComponentForControl can determine that the passed control is already the app component", function(assert) {
			const oComponent = new UIComponent({
				manifest: {
					"sap.app": {
						type: "application"
					}
				}
			});

			const oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oComponent);
		});

		QUnit.test("getAppComponentForControl can determine the OVP special case", function(assert) {
			const oComponent = new UIComponent();
			const oAppComponent = new UIComponent();
			oComponent.oComponentData = {appComponent: oAppComponent};

			const oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oAppComponent);
		});

		QUnit.test("getAppComponentForControl returns the component if no Manifest is available", function(assert) {
			const oComponent = new UIComponent();

			const oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oComponent);
		});

		QUnit.test("getAppComponentForControl searches further for the app component if the passed component is not of the type application", function(assert) {
			const oComponent = new UIComponent();
			oComponent.getAppComponent = function() {
				return "something is not an appComponent";
			};
			const oParentComponent = {};
			const oSapAppEntry = {
				type: "definitelyNotAnApplication"
			};

			oComponent.getManifestEntry = function(sParameter) {
				return sParameter === "sap.app" ? oSapAppEntry : undefined;
			};

			sandbox.stub(Utils, "getComponentForControl").returns(oParentComponent);

			assert.equal(Utils.getAppComponentForControl(oComponent), oParentComponent);
		});

		QUnit.test("indexOfObject with array containing object", function(assert) {
			const oObject = {a: 1, b: 2, c: 3};
			let aArray = [{a: 4, b: 5, c: 6}, {a: 1, b: 2, c: 3}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), 1, "the function returns the correct index");

			aArray = [{a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}, {b: 2, c: 3, a: 1}];
			assert.equal(Utils.indexOfObject(aArray, oObject), 2, "the function returns the correct index");
		});

		QUnit.test("indexOfObject with array not containing object", function(assert) {
			let oObject = {a: 1, b: 2, c: 3};
			let aArray = [{b: 2, c: 3}, {a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), -1, "the function returns the correct index");

			oObject = {1: 1, b: 2};
			aArray = [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), -1, "the function returns the correct index");
		});

		QUnit.test("indexOfObject with array containing null or undefined objects", function(assert) {
			let oObject = {a: undefined, b: 2, c: 3};
			let aArray = [undefined, {a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), -1, "the function returns the correct index (not found)");

			oObject = undefined;
			aArray = [{a: 1, b: 2, c: 3}, undefined, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), 1, "the function returns the correct index");
		});
	});

	QUnit.module("get/set URL Technical Parameter values", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'getParsedURLHash' with a ushell container", function(assert) {
			const oParameters = {
				params: {
					"sap-ui-fl-max-layer": [Layer.CUSTOMER]
				}
			};

			const oURLParsingService = {
				getHash() {
					return "";
				},
				parseShellHash() {
					return oParameters;
				}
			};

			assert.deepEqual(Utils.getParsedURLHash(oURLParsingService), oParameters,
				"then the url parameters calculated from the url are received");
		});

		QUnit.test("when calling 'getParsedURLHash' with a ushell container and a URL which cannot be parsed properly", function(assert) {
			const oURLParsingService = {
				getHash() {},
				parseShellHash() {}
			};

			assert.ok(isEmptyObject(Utils.getParsedURLHash(oURLParsingService)), "then an empty object is received");
		});

		QUnit.test("when calling 'getParsedURLHash' without a ushell container", function(assert) {
			assert.ok(isEmptyObject(Utils.getParsedURLHash()), "then no url parameters are received");
		});

		QUnit.test("createNamespace returns correct namespace for changes of app descriptor", function(assert) {
			const oPropertyBag = {
				reference: "sap.account.appname.Component"
			};
			const sNamespace = "apps/sap.account.appname/changes/";
			assert.equal(Utils.createNamespace(oPropertyBag, "changes"), sNamespace);
		});

		QUnit.test("createNamespace returns correct namespace for changes of app variant", function(assert) {
			const oPropertyBag = {
				reference: "sap.account.appname.id_1471874653135_11"
			};
			const sNamespace = "apps/sap.account.appname.id_1471874653135_11/changes/";
			assert.equal(Utils.createNamespace(oPropertyBag, "changes"), sNamespace);
		});
	});

	QUnit.module("Utils.isApplication", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("can handle null and empty manifest", function(assert) {
			const oManifest = new Manifest();
			sandbox.stub(oManifest, "getEntry").returns({});
			assert.equal(false, Utils.isApplication(this.oManifest));
			assert.equal(false, Utils.isApplication(null, true));
			assert.equal(false, Utils.isApplication(this.oManifest));
			assert.equal(false, Utils.isApplication({}, true));
		});

		QUnit.test("can handle corrupt manifest", function(assert) {
			assert.equal(false, Utils.isApplication({"sap.app": {id: "id"}}, true), "false if no type node in sap.app");
			assert.equal(false, Utils.isApplication({"sap.ui5": {dependencies: {libs: 1}}}, true), "false if no sap.app node");
		});

		QUnit.test("can determine if manifest is of type application", function(assert) {
			assert.equal(true, Utils.isApplication({"sap.app": {type: "application"}}, true));
			assert.equal(true, Utils.isApplication({"sap.app": {type: "application"}}, true));
			assert.equal(false, Utils.isApplication({"sap.app": {type: "component"}}, true));
		});
	});

	QUnit.module("Utils.isApplicationComponent and Utils.isEmbeddedComponent", {
		before() {
			this.oComponent = new Component();
			this.oManifest = this.oComponent.getManifestObject();
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			this.oComponent.destroy();
		}
	}, function() {
		["isApplicationComponent", "isEmbeddedComponent"]
		.forEach(function(sFunctionName) {
			QUnit.test(`when Utils.${sFunctionName} is called and there is no manifest`, function(assert) {
				assert.notOk(Utils[sFunctionName](), "then false is returned");
			});

			QUnit.test(`when Utils.${sFunctionName} is called and the manifest has no getEntry method`, function(assert) {
				assert.notOk(Utils[sFunctionName]({}), "then false is returned");
			});

			QUnit.test(`when Utils.${sFunctionName} is called and there is no manifest['sap.app']`, function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
				.returns({});

				assert.notOk(Utils[sFunctionName](this.oComponent), "then false is returned");
			});

			QUnit.test(`when Utils.${sFunctionName} is called and there is no manifest['sap.app'].type`, function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
				.callThrough()
				.withArgs("sap.app")
				.returns({});

				assert.notOk(Utils[sFunctionName](this.oComponent), "then false is returned");
			});

			QUnit.test(`when Utils.${sFunctionName} is called and manifest type is incorrect`, function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
				.callThrough()
				.withArgs("sap.app")
				.returns({
					type: "random"
				});

				assert.notOk(Utils[sFunctionName](this.oComponent), "then false is returned");
			});
		});

		QUnit.test("when Utils.isApplicationComponent is called and manifest type is 'application'", function(assert) {
			sandbox.stub(this.oManifest, "getEntry")
			.callThrough()
			.withArgs("sap.app")
			.returns({
				type: "application"
			});

			assert.ok(Utils.isApplicationComponent(this.oComponent), "then true is returned");
		});

		QUnit.test("when Utils.isEmbeddedComponent is called and manifest type is 'component'", function(assert) {
			const oParentComponent = new (UIComponent.extend("component", {
				metadata: {
					manifest: {
						"sap.app": {
							type: "application"
						}
					}
				}
			}))();

			sandbox.stub(Utils, "getAppComponentForControl")
			.callThrough()
			.withArgs(this.oComponent)
			.returns(oParentComponent);

			sandbox.stub(this.oManifest, "getEntry")
			.callThrough()
			.withArgs("sap.app")
			.returns({
				type: "component"
			});

			assert.ok(Utils.isEmbeddedComponent(this.oComponent), "then true is returned");
		});

		QUnit.test("when the embedded component is not the child of an app component", function(assert) {
			sandbox.stub(this.oManifest, "getEntry")
			.callThrough()
			.withArgs("sap.app")
			.returns({
				type: "component"
			});

			assert.notOk(Utils.isEmbeddedComponent(this.oComponent), "then false is returned");
		});
	});

	QUnit.module("Utils.execPromiseQueueSequentially", {
		beforeEach() {
			const fnResolve = function() {
				return Promise.resolve();
			};
			const fnReject = function() {
				return Promise.reject();
			};

			// Resolved promises
			this.fnPromise1 = sandbox.stub().returns((Utils.FakePromise ? new Utils.FakePromise() : Promise.resolve()));
			this.fnPromise2 = sandbox.stub().returns(fnResolve());
			this.fnPromise3 = sandbox.stub().returns(fnResolve());

			// Rejected promise without return
			this.fnPromise4 = sandbox.stub().returns(fnReject());

			// Failed promise execution
			this.fnPromise5 = function() {throw new Error("promise can't be executed");};

			this.aPromisesWithoutReject = [this.fnPromise1, this.fnPromise2, this.fnPromise3];
			this.aPromisesWithReject = [this.fnPromise2, this.fnPromise4];
			this.aPromisesWithObj = [{}, this.fnPromise2];
			this.aPromisesResolveAfterReject = [this.fnPromise4, this.fnPromise1];
			this.aPromisesWithFailedExecution = [this.fnPromise2, this.fnPromise5];

			this.fnExecPromiseQueueSpy = sandbox.spy(Utils, "execPromiseQueueSequentially");
			sandbox.spyLog = sandbox.spy(Log, "error");
		},

		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with a empty array and async 'true' as parameters", function(assert) {
			const vResult = Utils.execPromiseQueueSequentially([], false, true);
			assert.ok(vResult instanceof Promise, "then asynchronous Promise is retured");
			return vResult;
		});

		QUnit.test("when called with a resolved promises array as parameter", function(assert) {
			const done = assert.async();
			Utils.execPromiseQueueSequentially(this.aPromisesWithoutReject).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 4, "then execPromiseQueueSequentially called four times");
				sinon.assert.callOrder(this.fnPromise1, this.fnPromise2, this.fnPromise3);
				assert.strictEqual(sandbox.spyLog.callCount, 0, "then error log not called");
				done();
			}.bind(this));
		});

		QUnit.test("when called with an array containing resolved, rejected and rejected without return promises", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithReject).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise2, this.fnPromise4);
				assert.strictEqual(sandbox.spyLog.callCount, 1,
					"then error log called once inside catch block, for the rejected promise without return");
			}.bind(this));
		});

		QUnit.test("when called with an array containing an object and a promise", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithObj).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise2);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as one element (object) was not a function");
			}.bind(this));
		});

		QUnit.test("when called with an array containing a rejected followed by a resolved promise", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesResolveAfterReject).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise4, this.fnPromise1);
				assert.strictEqual(sandbox.spyLog.callCount, 1,
					"then error log called once inside catch block, for the rejected promise without return");
			}.bind(this));
		});

		QUnit.test("when called with an array containing a resolved promise and a failing promise execution", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithFailedExecution).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise2);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as the promise execution throwed an error");
			}.bind(this));
		});

		QUnit.test("failing promise with bThrowError = true", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithFailedExecution, true).catch(function(oError) {
				assert.strictEqual(
					oError.message,
					"Error during execPromiseQueueSequentially processing occurred: promise can't be executed",
					"then the error message is the one from the failing promise execution"
				);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as the promise execution throwed an error");
			});
		});

		QUnit.test("failing promise execution with bThrowError and bSupressAdditionalErrorMessage = true", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithFailedExecution, true, false, true).catch(function(oError) {
				assert.strictEqual(
					oError.message,
					"promise can't be executed",
					"then the error message is only the one from the failing promise execution"
				);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as the promise execution throwed an error");
			});
		});
	});

	QUnit.module("Utils.getChangeFromChangesMap", {
		beforeEach() {
			this.oChange1 = {
				getId() {
					return "fileNameChange1";
				}
			};
			this.oChange2 = {
				getId() {
					return "fileNameChange2";
				}
			};
			this.oChange3 = {
				getId() {
					return "fileNameChange3";
				}
			};
			this.oChange4 = {
				getId() {
					return "fileNameChange4";
				}
			};
			this.mChanges = {
				c1: [this.oChange1, this.oChange2, this.oChange4],
				c2: [this.oChange3]
			};
		},
		afterEach() {}
	}, function() {
		QUnit.test("when called with existing Change keys", function(assert) {
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange1.getId()), this.oChange1,
				"then the correct change is returned");
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange2.getId()), this.oChange2,
				"then the correct change is returned");
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange3.getId()), this.oChange3,
				"then the correct change is returned");
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange4.getId()), this.oChange4,
				"then the correct change is returned");
		});

		QUnit.test("when called with not existing Change keys", function(assert) {
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, `${this.oChange1.getId()}foo`), undefined,
				"then no change is returned");
		});
	});

	QUnit.module("Utils.buildLrepRootNamespace", {
		beforeEach() {
			this.sErrorText = "Error in sap.ui.fl.Utils#buildLrepRootNamespace: ";
			this.sNoBaseIdErrorText = "Error in sap.ui.fl.Utils#buildLrepRootNamespace: for every scenario you need a base ID";
		},
		afterEach() {}
	}, function() {
		QUnit.test(`scenario ${Scenario.VersionedAppVariant}: New VersionedAppVariant`, function(assert) {
			this.sErrorText += "in the VERSIONED_APP_VARIANT scenario you additionally need a project ID";
			const sLrepRootNamespace = "apps/baseId/appVariants/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.VersionedAppVariant, "projectId"), sLrepRootNamespace,
				"then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.VersionedAppVariant, "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for VERSIONED_APP_VARIANT throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", Scenario.VersionedAppVariant, "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for VERSIONED_APP_VARIANT throws an error"
			);
		});

		QUnit.test(`scenario ${Scenario.AppVariant}: New AppVariant`, function(assert) {
			this.sErrorText += "in the APP_VARIANT scenario you additionally need a project ID";
			const sLrepRootNamespace = "apps/baseId/appVariants/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.AppVariant, "projectId"), sLrepRootNamespace,
				"then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.AppVariant, "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for APP_VARIANT throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", Scenario.AppVariant, "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for APP_VARIANT throws an error"
			);
		});

		QUnit.test(`scenario ${Scenario.AdaptationProject}: Customer adapts existing app`, function(assert) {
			this.sErrorText += "in the ADAPTATION_PROJECT scenario you additionally need a project ID";
			const sLrepRootNamespace = "apps/baseId/adapt/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.AdaptationProject, "projectId"), sLrepRootNamespace,
				"then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.AdaptationProject, "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for customer adaptations throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", Scenario.AdaptationProject, "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for customer adaptations throws an error"
			);
		});

		QUnit.test(`scenario ${Scenario.FioriElementsFromScratch}: Customer adapts new Fiori elements app`, function(assert) {
			const sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.FioriElementsFromScratch), sLrepRootNamespace,
				"then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.FioriElementsFromScratch);},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for adaptations on a new app throws an error"
			);
		});

		QUnit.test(`scenario ${Scenario.UiAdaptation}: Customer adapts existing app using RTA`, function(assert) {
			const sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.UiAdaptation), sLrepRootNamespace,
				"then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.UiAdaptation);},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for adaptations on a new app throws an error"
			);
		});

		QUnit.test("no scenario specified", function(assert) {
			const sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId"), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for no specific scenario throws an error"
			);
		});
	});

	QUnit.module("_hasParameterAndValue is called", {
		before() {
			this.sParameterName = "parameterName";
			this.sParameterValue = "parameterValue";
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("parameter name doesnt exist", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs(this.sParameterName).returns(null);
			const bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, false, "the function returns false");
		});

		QUnit.test("parameter value empty string", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs(this.sParameterName).returns("");
			const bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, false, "the function returns false");
		});

		QUnit.test("parameter value not equal", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs(this.sParameterName).returns("notEqual");
			const bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, false, "the function returns false");
		});

		QUnit.test("parameter value is equal", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").withArgs(this.sParameterName).returns(this.sParameterValue);
			const bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, true, "the function returns true");
		});
	});

	QUnit.module("handleUrlParameter is called", {
		before() {
			this.sParameterName = "parameterName";
			this.sParameterValue = "parameterValue";
			this.sSearchParameter = `${this.sParameterName}=${this.sParameterValue}`;
			this.sAnotherParameter = "test=true";
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with hasUrlParameterWithValue is true", function(assert) {
			const sUrl = `?${this.sSearchParameter}`;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			const bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, "", "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is true and another parameter", function(assert) {
			const sUrl = `?${this.sAnotherParameter}&${this.sSearchParameter}`;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			const bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, `?${this.sAnotherParameter}`, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is true and another parameter at the end", function(assert) {
			const sUrl = `?${this.sSearchParameter}&${this.sAnotherParameter}`;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			const bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, `?${this.sAnotherParameter}`, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is false", function(assert) {
			const sUrl = "";
			sandbox.stub(Utils, "hasParameterAndValue").returns(false);
			const bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, `?${this.sSearchParameter}`, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is false and another parameter", function(assert) {
			const sUrl = `?${this.sAnotherParameter}`;
			sandbox.stub(Utils, "hasParameterAndValue").returns(false);
			const bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, `?${this.sAnotherParameter}&${this.sSearchParameter}`, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is false and two another parameters at the end", function(assert) {
			const sUrl = `?${this.sAnotherParameter}&${this.sAnotherParameter}`;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			const bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, `?${this.sAnotherParameter}&${this.sAnotherParameter}`, "no change in the url");
		});
	});

	QUnit.module("Utils.getUShellContainer", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when ushell is not loaded", function(assert) {
			assert.notOk(Utils.getUshellContainer(), "then no container is returned");
		});
		QUnit.test("when ushell loaded but not yet bootstrapped", function(assert) {
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: "sap/ushell/Container",
					stub: {
						isInitialized() {
							return false;
						}
					}
				}
			]);
			assert.notOk(Utils.getUshellContainer(), "then no container is returned");
		});
		QUnit.test("when ushell loaded and bootstrapped", function(assert) {
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: "sap/ushell/Container",
					stub: {
						isInitialized() {
							return true;
						}
					}
				}
			]);
			assert.ok(Utils.getUshellContainer(), "then container is returned");
		});
	});

	QUnit.module("Utils.getUShellService", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync(sServiceName) {
					switch (sServiceName) {
						case "validService":
							return Promise.resolve("validServiceResult");
						default:
							return Promise.reject(new Error(`Not available service: ${sServiceName}`));
					}
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with empty parameter", function(assert) {
			return Utils.getUShellService()
			.then(function(oUShellService) {
				assert.notOk(oUShellService, "then the method resolves to undefined");
			});
		});

		QUnit.test("with ushell container is not available", function(assert) {
			Utils.getUshellContainer.restore();
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			return Utils.getUShellService("validService")
			.then(function(oUShellService) {
				assert.strictEqual(oUShellService, undefined, "then the method resolves undefined");
			});
		});

		QUnit.test("with invalid service", function(assert) {
			return Utils.getUShellService("invalid-service")
			.catch(function(vError) {
				assert.ok(vError.message.indexOf("Not available service: ") > -1, "then the promise rejects");
			});
		});

		QUnit.test("with valid service", function(assert) {
			return Utils.getUShellService("validService")
			.then(function(oUShellService) {
				assert.strictEqual(oUShellService, "validServiceResult", "then the expected service is returned");
			});
		});
	});

	QUnit.module("Utils.getUShellServices", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync(sServiceName) {
					switch (sServiceName) {
						case "validService1":
							return Promise.resolve("validService1Result");
						case "validService2":
							return Promise.resolve("validService2Result");
						case "validService3":
							return Promise.resolve("validService3Result");
						default:
							return Promise.reject(new Error(`Invalid service: ${sServiceName}`));
					}
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with empty services list", function(assert) {
			return Utils.getUShellServices([])
			.then(function(mUshellServices) {
				assert.ok(isEmptyObject(mUshellServices), "then the returned services map is empty");
			});
		});

		QUnit.test("with ushell container is not available", function(assert) {
			Utils.getUshellContainer.restore();
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			return Utils.getUShellServices([])
			.then(function(mUshellServices) {
				assert.ok(isEmptyObject(mUshellServices), "then the returned services map is empty");
				return Utils.getUShellServices(["validService1"]);
			})
			.then(function(mUshellServices) {
				assert.strictEqual(mUshellServices.validService1, undefined,
					"then the expected service is available with key only in the returned map");
			});
		});

		QUnit.test("with invalid service", function(assert) {
			return Utils.getUShellServices(["invalid-service"])
			.catch(function(oError) {
				assert.ok(oError.message.indexOf("Invalid service: ") > -1, "then the promise is rejected");
			});
		});

		QUnit.test("with valid services list", function(assert) {
			return Utils.getUShellServices(["validService1", "validService2", "validService3"])
			.then(function(mUshellServices) {
				assert.strictEqual(mUshellServices.validService1, "validService1Result",
					"then the expected service is available in the returned map");
				assert.strictEqual(mUshellServices.validService2, "validService2Result",
					"then the expected service is available in the returned map");
				assert.strictEqual(mUshellServices.validService3, "validService3Result",
					"then the expected service is available in the returned map");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
