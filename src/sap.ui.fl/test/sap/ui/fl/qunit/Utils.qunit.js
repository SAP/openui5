/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Scenario",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/base/util/UriParameters",
	"sap/ui/core/Manifest",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	FlVariant,
	Utils,
	Change,
	Layer,
	Scenario,
	VerticalLayout,
	HorizontalLayout,
	Button,
	Component,
	UIComponent,
	Log,
	isEmptyObject,
	UriParameters,
	Manifest,
	_omit,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var aControls = [];

	QUnit.module("sap.ui.fl.Utils", {
		beforeEach: function() {},
		afterEach: function() {
			aControls.forEach(function(oControl) {
				oControl.destroy();
			});
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isVariantByStartupParameter can detect a variant by the startup parameter", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns({});
			sandbox.stub(Utils, "_getComponentStartUpParameter").returns("someId");

			var bIsStartupParameterBasedVariant = Utils.isVariantByStartupParameter({});

			assert.ok(bIsStartupParameterBasedVariant, "the variant was detected");
		});

		QUnit.test("isVariantByStartupParameter returns false if no variant by the startup parameter is present", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns({});
			sandbox.stub(Utils, "_getComponentStartUpParameter").returns();

			var bIsStartupParameterBasedVariant = Utils.isVariantByStartupParameter({});

			assert.ok(!bIsStartupParameterBasedVariant);
		});

		QUnit.test("getClient", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-client").returns("123");
			var sClient = Utils.getClient();
			assert.equal(sClient, "123");
		});

		QUnit.test("convertBrowserLanguageToISO639_1 shall return the ISO 639-1 language of a RFC4646 language", function(assert) {
			assert.equal(Utils.convertBrowserLanguageToISO639_1("en-us"), 'EN');
			assert.equal(Utils.convertBrowserLanguageToISO639_1("de"), 'DE');
			assert.equal(Utils.convertBrowserLanguageToISO639_1(""), '');
			assert.equal(Utils.convertBrowserLanguageToISO639_1("hkjhkashik"), '');
		});

		QUnit.test("_getComponentIdForControl shall return the result of getOwnerIdForControl", function(assert) {
			var sComponentId;
			sandbox.stub(Utils, "_getOwnerIdForControl").returns('Rumpelstilzchen');
			sComponentId = Utils._getComponentIdForControl(null);
			assert.equal(sComponentId, 'Rumpelstilzchen');
		});

		QUnit.test("_getComponentIdForControl shall walk up the control tree until it finds a component id", function(assert) {
			var oControl1 = {};
			var oControl2 = {
				getParent: sandbox.stub().returns(oControl1)
			};
			var oControl3 = {
				getParent: sandbox.stub().returns(oControl2)
			};

			var fnGetOwnerIdForControl = sandbox.stub(Utils, "_getOwnerIdForControl");
			fnGetOwnerIdForControl.withArgs(oControl3).returns("");
			fnGetOwnerIdForControl.withArgs(oControl2).returns("");
			fnGetOwnerIdForControl.withArgs(oControl1).returns("sodimunk");

			var sComponentId = Utils._getComponentIdForControl(oControl3);

			assert.equal(sComponentId, 'sodimunk');
			assert.equal(fnGetOwnerIdForControl.callCount, 3);
		});

		QUnit.test("_getComponentIdForControl shall return an empty string if component id is not found without any errors", function(assert) {
			var oButton = new Button();
			var oLayout = new VerticalLayout({
				content: [
					oButton
				]
			});
			var spyConsole = sandbox.spy(console, "assert");
			assert.strictEqual(Utils._getComponentIdForControl(oButton), "");
			assert.ok(spyConsole.notCalled);
			oLayout.destroy();
		});

		QUnit.test("isBinding shall return false if the property is null", function(assert) {
			var oPropertyValue = null;
			var bIsBinding = Utils.isBinding(oPropertyValue);
			assert.strictEqual(bIsBinding, false);
		});

		QUnit.test("isBinding shall return false if the property is a string which does not represent a binding", function(assert) {
			var sPropertyValue = "test";
			var bIsBinding = Utils.isBinding(sPropertyValue);
			assert.strictEqual(bIsBinding, false);
		});

		QUnit.test("isBinding shall return true if the property is a string which does represent a binding", function(assert) {
			var sPropertyValue = "{i18n>test}";
			var bIsBinding = Utils.isBinding(sPropertyValue);
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

		QUnit.test("Utils.isHotfixMode shall return the hotfix url parameter", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("hotfix").returns("true");
			var bIsHotfix = Utils.isHotfixMode();
			assert.strictEqual(bIsHotfix, true);
		});

		QUnit.test("isHotfixMode shall return false if there is no hotfix url parameter", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs("hotfix").returns("null");
			var bIsHotfix = Utils.isHotfixMode();
			assert.strictEqual(bIsHotfix, false);
		});

		QUnit.test('getFirstAncestorOfControlWithControlType', function(assert) {
			var button1 = new Button('button1');
			var hLayout1 = new HorizontalLayout('hLayout1');
			var hLayout2 = new HorizontalLayout('hLayout2');
			var vLayout1 = new VerticalLayout('vLayout1');
			var vLayout2 = new VerticalLayout('vLayout2');
			vLayout2.addContent(button1);
			hLayout2.addContent(vLayout2);
			vLayout1.addContent(hLayout2);
			hLayout1.addContent(vLayout1);
			// hL1-vL1-hL2-vL2-b1
			aControls.push(hLayout1);

			var ancestorControlOfType = Utils.getFirstAncestorOfControlWithControlType(button1, HorizontalLayout);

			assert.strictEqual(hLayout2, ancestorControlOfType);

			ancestorControlOfType = Utils.getFirstAncestorOfControlWithControlType(button1, Button);

			assert.strictEqual(button1, ancestorControlOfType);
		});

		QUnit.test("getAppDescriptor shall return NULL if the control does not belong to a SAPUI5 component", function(assert) {
			var oAppDescriptor;

			oAppDescriptor = Utils.getAppDescriptor({});
			assert.strictEqual(oAppDescriptor, null);
		});

		QUnit.test("getAppDescriptor shall return the an appDescriptor instance", function(assert) {
			var oAppDescriptor = {
				id: "sap.ui.smartFormOData",
				getEntry: function(sEntryKey) {
					return sEntryKey === "sap.ui5" ? {} : undefined;
				}
			};
			var oControl = {};
			var oComponentMock = {
				getMetadata: function() {
					return {
						getManifest: function() {
							return oAppDescriptor;
						}
					};
				}
			};
			var oGetComponentIdForControlStub = sandbox.stub(Utils, "_getComponentIdForControl").returns("testId");
			var oGetComponentStub = sandbox.stub(Utils, "_getComponent").returns(oComponentMock);

			assert.equal(Utils.getAppDescriptor(oControl), oAppDescriptor);

			assert.ok(oGetComponentIdForControlStub.called);
			assert.ok(oGetComponentStub.called);
		});

		QUnit.test("encodes a string into ascii", function(assert) {
			var string = "Hallo Welt!";
			var expectedString = "72,97,108,108,111,32,87,101,108,116,33";

			var encodedString = Utils.stringToAscii(string);

			assert.equal(encodedString, expectedString);
		});

		QUnit.test("decodes ascii into a string", function(assert) {
			var string = "72,97,108,108,111,32,87,101,108,116,33";
			var expectedString = "Hallo Welt!";

			var decodedString = Utils.asciiToString(string);

			assert.equal(decodedString, expectedString);
		});

		QUnit.test("getAppComponentForControl can determine the smart template special case", function(assert) {
			var oComponent = new UIComponent();
			var oAppComponent = new UIComponent();
			oComponent.getAppComponent = function() {
				return oAppComponent;
			};

			var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oAppComponent);
		});

		QUnit.test("getAppComponentForControl can determine that the passed control is already the app component", function(assert) {
			var oComponent = new UIComponent({
				manifest: {
					"sap.app": {
						type: "application"
					}
				}
			});

			var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oComponent);
		});

		QUnit.test("getAppComponentForControl can determine the OVP special case", function(assert) {
			var oComponent = new UIComponent();
			var oAppComponent = new UIComponent();
			oComponent.oComponentData = {appComponent: oAppComponent};

			var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oAppComponent);
		});

		QUnit.test("getAppComponentForControl returns the component if no Manifest is available", function(assert) {
			var oComponent = new UIComponent();

			var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

			assert.equal(oDeterminedAppComponent, oComponent);
		});

		QUnit.test("getAppComponentForControl searches further for the app component if the passed component is not of the type application", function(assert) {
			var oComponent = new UIComponent();
			oComponent.getAppComponent = function() {
				return "something is not an appComponent";
			};
			var oParentComponent = {};
			var oSapAppEntry = {
				type: "definitelyNotAnApplication"
			};

			oComponent.getManifestEntry = function(sParameter) {
				return sParameter === "sap.app" ? oSapAppEntry : undefined;
			};

			var oStub = sandbox.stub(Utils, "getAppComponentForControl");
			sandbox.stub(Utils, "_getComponentForControl").returns(oParentComponent);

			Utils._getAppComponentForComponent(oComponent);

			assert.ok(oStub.calledOnce, "the function was called once");
			assert.equal(oStub.firstCall.args[0], oParentComponent, "the function was called with the parent component the first time");
		});

		QUnit.test("getAppDescriptorComponentObjectForControl calls getAppComponentForControl and returns a modified object", function(assert) {
			var oComponent = new sap.ui.core.UIComponent();

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var oAppDescriptorComponent = Utils.getAppDescriptorComponentObjectForControl(oComponent);
			assert.equal(oAppDescriptorComponent.name, "sap.ui.core", "the component name is correct");
		});

		QUnit.test("indexOfObject with array containing object", function(assert) {
			var oObject = {a: 1, b: 2, c: 3};
			var aArray = [{a: 4, b: 5, c: 6}, {a: 1, b: 2, c: 3}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), 1, "the function returns the correct index");

			aArray = [{a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}, {b: 2, c: 3, a: 1}];
			assert.equal(Utils.indexOfObject(aArray, oObject), 2, "the function returns the correct index");
		});

		QUnit.test("indexOfObject with array not containing object", function(assert) {
			var oObject = {a: 1, b: 2, c: 3};
			var aArray = [{b: 2, c: 3}, {a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), -1, "the function returns the correct index");

			oObject = {1: 1, b: 2};
			aArray = [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), -1, "the function returns the correct index");
		});

		QUnit.test("indexOfObject with array containing null or undefined objects", function(assert) {
			var oObject = {a: undefined, b: 2, c: 3};
			var aArray = [undefined, {a: 4, b: 5, c: 6}, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), -1, "the function returns the correct index (not found)");

			oObject = undefined;
			aArray = [{a: 1, b: 2, c: 3}, undefined, {a: 7, b: 8, c: 9}];
			assert.equal(Utils.indexOfObject(aArray, oObject), 1, "the function returns the correct index");
		});
	});

	QUnit.module("get/set URL Technical Parameter values", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'getParsedURLHash' with a ushell container", function(assert) {
			var oParameters = {
				params: {
					"sap-ui-fl-max-layer": [Layer.CUSTOMER]
				}
			};

			var oURLParsingService = {
				getHash: function() {
					return "";
				},
				parseShellHash: function() {
					return oParameters;
				}
			};

			assert.deepEqual(Utils.getParsedURLHash(oURLParsingService), oParameters, "then the url parameters calculated from the url are received");
		});

		QUnit.test("when calling 'getParsedURLHash' with a ushell container and a URL which cannot be parsed properly", function(assert) {
			var oURLParsingService = {
				getHash: function() {},
				parseShellHash: function() {}
			};

			assert.ok(isEmptyObject(Utils.getParsedURLHash(oURLParsingService)), "then an empty object is received");
		});

		QUnit.test("when calling 'getParsedURLHash' without a ushell container", function(assert) {
			assert.ok(isEmptyObject(Utils.getParsedURLHash()), "then no url parameters are received");
		});

		QUnit.test("createNamespace returns correct namespace for changes of app descriptor", function(assert) {
			var oPropertyBag = {
				reference: "sap.account.appname.Component"
			};
			var sNamespace = "apps/sap.account.appname/changes/";
			assert.equal(Utils.createNamespace(oPropertyBag, "changes"), sNamespace);
		});

		QUnit.test("createNamespace returns correct namespace for changes of app variant", function(assert) {
			var oPropertyBag = {
				reference: "sap.account.appname.id_1471874653135_11"
			};
			var sNamespace = "apps/sap.account.appname.id_1471874653135_11/changes/";
			assert.equal(Utils.createNamespace(oPropertyBag, "changes"), sNamespace);
		});

		QUnit.test("when isChangeRelatedToVariants is called with a control variant change", function(assert) {
			[
				new FlVariant({
					fileName: "variant0"
				}),
				new Change({
					fileType: "ctrl_variant_change",
					fileName: "change0"
				}),
				new Change({
					fileType: "ctrl_variant_management_change",
					fileName: "change1"
				}),
				new Change({
					fileType: "change",
					fileName: "change2",
					variantReference: "variant0"
				})
			].forEach(function(oChange) {
				assert.ok(Utils.isChangeRelatedToVariants(oChange), "then for change type " + oChange.getFileType() + " true was returned");
			});
		});
	});

	QUnit.module("Utils.isApplication", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("can handle null and empty manifest", function(assert) {
			var oManifest = new Manifest();
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
		before: function() {
			this.oComponent = new Component();
			this.oManifest = this.oComponent.getManifestObject();
		},
		afterEach: function() {
			sandbox.restore();
		},
		after: function() {
			this.oComponent.destroy();
		}
	}, function() {
		[
			{name: "isApplicationComponent", type: "application"},
			{name: "isEmbeddedComponent", type: "component"}
		].forEach(function(oFunction) {
			QUnit.test("when Utils." + oFunction.name + " is called and there is no manifest", function(assert) {
				assert.notOk(Utils[oFunction.name](), "then false is returned");
			});

			QUnit.test("when Utils." + oFunction.name + " is called and the manifest has no getEntry method", function(assert) {
				assert.notOk(Utils[oFunction.name]({}), "then false is returned");
			});

			QUnit.test("when Utils." + oFunction.name + " is called and there is no manifest['sap.app']", function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
					.returns({});

				assert.notOk(Utils[oFunction.name](this.oComponent), "then false is returned");
			});

			QUnit.test("when Utils." + oFunction.name + " is called and there is no manifest['sap.app'].type", function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
					.callThrough()
					.withArgs("sap.app")
					.returns({});

				assert.notOk(Utils[oFunction.name](this.oComponent), "then false is returned");
			});

			QUnit.test("when Utils." + oFunction.name + " is called and manifest type is not '" + oFunction.type + "'", function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
					.callThrough()
					.withArgs("sap.app")
					.returns({
						type: "random"
					});

				assert.notOk(Utils[oFunction.name](this.oComponent), "then false is returned");
			});

			QUnit.test("when Utils." + oFunction.name + " is called and manifest type is '" + oFunction.type + "'", function(assert) {
				sandbox.stub(this.oManifest, "getEntry")
					.callThrough()
					.withArgs("sap.app")
					.returns({
						type: oFunction.type
					});

				assert.ok(Utils[oFunction.name](this.oComponent), "then true is returned");
			});
		});
	});

	QUnit.module("Utils.execPromiseQueueSequentially", {
		beforeEach: function() {
			var fnResolve = function() {
				return Promise.resolve();
			};
			var fnReject = function() {
				return Promise.reject();
			};

			//Resolved promises
			this.fnPromise1 = sandbox.stub().returns(new Utils.FakePromise());
			this.fnPromise2 = sandbox.stub().returns(fnResolve());
			this.fnPromise3 = sandbox.stub().returns(fnResolve());

			//Rejected promise without return
			this.fnPromise4 = sandbox.stub().returns(fnReject());

			// Failed promise execution
			this.fnPromise5 = function() {throw new Error("promise can't be executed");};

			this.aPromisesWithoutReject = [this.fnPromise1, this.fnPromise2, this.fnPromise3];
			this.aPromisesWithReject = [this.fnPromise1, this.fnPromise4];
			this.aPromisesWithObj = [{}, this.fnPromise1];
			this.aPromisesResolveAfterReject = [this.fnPromise4, this.fnPromise1];
			this.aPromisesWithFailedExecution = [this.fnPromise1, this.fnPromise5];

			this.fnExecPromiseQueueSpy = sandbox.spy(Utils, "execPromiseQueueSequentially");
			sandbox.spyLog = sandbox.spy(Log, "error");
		},

		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with a empty array and async 'false' as parameters", function(assert) {
			var vResult = Utils.execPromiseQueueSequentially([], false, false);
			assert.ok(vResult instanceof Utils.FakePromise, "then synchronous FakePromise is retured");
		});

		QUnit.test("when called with a empty array and async 'true' as parameters", function(assert) {
			var vResult = Utils.execPromiseQueueSequentially([], false, true);
			assert.ok(vResult instanceof Promise, "then asynchronous Promise is retured");
			return vResult;
		});

		QUnit.test("when called with 'async and sync' promises array as parameter", function(assert) {
			var vResult = Utils.execPromiseQueueSequentially([this.fnPromise2, this.fnPromise1]);
			assert.ok(vResult instanceof Promise, "then asynchronous Promise is retured");
			return vResult;
		});

		QUnit.test("when called with 'sync and async' promises array as parameter", function(assert) {
			var vResult = Utils.execPromiseQueueSequentially([this.fnPromise1, this.fnPromise2]);
			assert.ok(vResult instanceof Promise, "then asynchronous Promise is retured");
			return vResult;
		});

		QUnit.test("when called with a resolved promises array as parameter", function(assert) {
			var done = assert.async();
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
				sinon.assert.callOrder(this.fnPromise1, this.fnPromise4);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once inside catch block, for the rejected promise without return");
			}.bind(this));
		});

		QUnit.test("when called with an array containing an object and a promise", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithObj).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise1);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as one element (object) was not a function");
			}.bind(this));
		});

		QUnit.test("when called with an array containing a rejected followed by a resolved promise", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesResolveAfterReject).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise4, this.fnPromise1);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once inside catch block, for the rejected promise without return");
			}.bind(this));
		});

		QUnit.test("when called with an array containing a resolved promise and a failing promise execution", function(assert) {
			return Utils.execPromiseQueueSequentially(this.aPromisesWithFailedExecution).then(function() {
				assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
				sinon.assert.callOrder(this.fnPromise1);
				assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as the promise execution throwed an error");
			}.bind(this));
		});
	});

	QUnit.module("Given a Utils.FakePromise", {
		beforeEach: function() {},
		afterEach: function() {}
	}, function() {
		QUnit.test("when chaining 'then' and 'catch' functions", function(assert) {
			new Utils.FakePromise(1)
			.then(function(vResult) {
				assert.strictEqual(vResult, 1, "then the parameter is passed to the 'then' method");
				return vResult + 1;
			})
			.then(function(vResult) {
				assert.strictEqual(vResult, 2, "then the parameter is passed to the 'then' method");
				return Utils.notAvailable(vResult);
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.catch(function(oError) {
				assert.notEqual(oError.message.indexOf("notAvailable"), -1, "then the error object is passed to the 'catch' method");
				return 3;
			})
			.then(function(vResult) {
				assert.strictEqual(vResult, 3, "then the parameter is passed to the 'then' method");
			});
		});

		[42, undefined, {then: 42}, {then: function() {}}]
			.forEach(function(vResult) {
				QUnit.test("when instanciated with " + vResult + " value as parameter", function(assert) {
					var oFakePromise = new Utils.FakePromise(vResult)
						.then(function(vValue) {
							assert.strictEqual(vValue, vResult, "then the parameter is passed to the 'then' method");
						});
					assert.ok(oFakePromise instanceof Utils.FakePromise, "then the FakePromise returns itself");
				});

				QUnit.test("when instanciated with " + vResult + " error value as second parameter", function(assert) {
					vResult = vResult || "undefined";
					var oFakePromise = new Utils.FakePromise(undefined, vResult)
						.then(function() {
							assert.notOk(true, "then the 'then' method shouldn't be called");
						})
						.catch(function(vError) {
							assert.strictEqual(vError, vResult, "then the error parameter is passed to the 'catch' method");
						});
					assert.ok(oFakePromise instanceof Utils.FakePromise, "then the FakePromise returns itself");
				});
			});

		QUnit.test("when instanciated with Promise.resolved() value as parameter", function(assert) {
			var oFakePromise = new Utils.FakePromise(Promise.resolve(42));
			assert.ok(oFakePromise instanceof Promise, "then the FakePromise returns Promise");
		});

		QUnit.test("when 'then' method returns Promise", function(assert) {
			var oPromise = new Utils.FakePromise()
			.then(function() {
				return Promise.resolve();
			});
			assert.ok(oPromise instanceof Promise, "then the returned value of the 'then' method is a Promise");
		});

		QUnit.test("when 'catch' method returns Promise", function(assert) {
			var oPromise = new Utils.FakePromise(undefined, true)
			.catch(function() {
				return Promise.resolve();
			});
			assert.ok(oPromise instanceof Promise, "then the returned value of the 'catch' method is a Promise");
		});

		QUnit.test("when instanciated with Utils.FakePromise as parameter", function(assert) {
			var oFakePromise = new Utils.FakePromise(new Utils.FakePromise());
			assert.ok(oFakePromise instanceof Utils.FakePromise, "then the FakePromise returns Utils.FakePromise");
		});

		QUnit.test("when instanciated with successful Utils.FakePromise as parameter", function(assert) {
			var sInitialValue = "42";
			new Utils.FakePromise(new Utils.FakePromise(sInitialValue))
			.then(function(sValue) {
				assert.strictEqual(sValue, sInitialValue, "then the value is passed to the following then function");
			});
		});

		QUnit.test("when instanciated with faulty Utils.FakePromise as parameter", function(assert) {
			var sInitialErrorValue = "42";
			new Utils.FakePromise(new Utils.FakePromise(undefined, sInitialErrorValue))
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.catch(function(sErrorValue) {
				assert.strictEqual(sErrorValue, sInitialErrorValue, "then the value is passed to the following CATCH function");
			});
		});

		QUnit.test("when 'then' method returns Utils.FakePromise", function(assert) {
			var oPromise = new Utils.FakePromise()
			.then(function() {
				return new Utils.FakePromise();
			});
			assert.ok(oPromise instanceof Utils.FakePromise, "then the returned value of the 'then' method is a Utils.FakePromise");
		});

		QUnit.test("when 'then' method returns Utils.FakePromise with success value", function(assert) {
			var sInitialValue = "42";
			var oPromise = new Utils.FakePromise()
			.then(function() {
				return new Utils.FakePromise(sInitialValue);
			})
			.then(function(sValue) {
				assert.strictEqual(sValue, sInitialValue, "then correct success value is passed to the following THEN function");
			});
			assert.ok(oPromise instanceof Utils.FakePromise, "then the returned value of the 'then' method is a Utils.FakePromise");
		});

		QUnit.test("when 'then' method returns Utils.FakePromise with rejected value", function(assert) {
			var sInitialErrorValue = "42";
			new Utils.FakePromise()
			.then(function() {
				return new Utils.FakePromise(undefined, sInitialErrorValue);
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.catch(function(sErrorMessage) {
				assert.strictEqual(sErrorMessage, sInitialErrorValue, "then correct error value is passed to the following CATCH function");
			});
		});

		QUnit.test("when 'catch' method returns Utils.FakePromise", function(assert) {
			var oPromise = new Utils.FakePromise(undefined, true)
			.catch(function() {
				return new Utils.FakePromise();
			});
			assert.ok(oPromise instanceof Utils.FakePromise, "then the returned value of the 'catch' method is a Utils.FakePromise");
		});

		QUnit.test("when 'catch' method returns Utils.FakePromise with success value", function(assert) {
			var sInitialValue = "42";
			new Utils.FakePromise(undefined, true)
			.catch(function() {
				return new Utils.FakePromise(sInitialValue);
			})
			.then(function(sValue) {
				assert.strictEqual(sValue, sInitialValue, "then correct success value is passed to the following THEN function");
			})
			.catch(function() {
				assert.notOk(true, "then the 'catch' method shouldn't be called afterwards");
			});
		});

		QUnit.test("when 'catch' method returns Utils.FakePromise with rejected value", function(assert) {
			var sInitialErrorValue = "42";
			new Utils.FakePromise(undefined, true)
			.catch(function() {
				return new Utils.FakePromise(undefined, sInitialErrorValue);
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.catch(function(sErrorValue) {
				assert.strictEqual(sErrorValue, sInitialErrorValue, "then correct error value is passed to the following CATCH function");
			});
		});

		QUnit.test("when 'then' method throws an exception", function(assert) {
			var sInitialErrorValue1 = "Error";
			var sInitialErrorValue2 = "Error";
			new Utils.FakePromise()
			.then(function() {
				throw new Error(sInitialErrorValue1);
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.catch(function(oErrorValue) {
				assert.strictEqual(oErrorValue.name, sInitialErrorValue1, "then the correct error parameter is passed to the 'catch' method");
				throw new Error(sInitialErrorValue2);
			})
			.then(function() {
				assert.notOk(true, "then the second 'then' method shouldn't be called");
			})
			.catch(function(oErrorValue) {
				assert.strictEqual(oErrorValue.name, sInitialErrorValue2, "then the correct error parameter is passed to the second 'catch' method");
			});
		});

		QUnit.test("when complex scenario with exception with chained FakePromises", function(assert) {
			var sInitialErrorValue1 = "Error1";

			new Utils.FakePromise(undefined, new Error(sInitialErrorValue1))
			.catch(function(oErrorValue) {
				var aWrongType = "should be an array";
				assert.strictEqual(oErrorValue.message, sInitialErrorValue1, "then the correct error parameter is passed to the 'catch' method");
				// provoke exception
				aWrongType.some(function() {});
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.catch(function(oErrorValue) {
				assert.ok(oErrorValue.message.includes("some"), "then the error was caught and communicated properly");
			});
		});

		QUnit.test("when complex scenario with nested FakePromises and an exception", function(assert) {
			new Utils.FakePromise()
			.then(function() {
				return new Utils.FakePromise();
			})
			.then(function() {
				// provoke exception
				"should be an array".some(function() {});
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method shouldn't be called");
			})
			.then(function() {
				assert.notOk(true, "then the 'then' method in the root chain also shouldn't be called");
			})
			.catch(function(oErrorValue) {
				assert.ok(oErrorValue.message.includes("some"), "then the error was caught and communicated properly");
			});
		});

		QUnit.test("when FakePromise nested into a Promise and PromiseIdentifier is passed", function(assert) {
			var oInitialValue = "42";
			var oPromise = Promise.resolve(oInitialValue)
			.then(function(oValue, sPromiseIdentifier) {
				var oInnerPromise = new Utils.FakePromise(oValue, undefined, sPromiseIdentifier)
					.then(function(oValue, oInnerPromiseIdentifier) {
						assert.strictEqual(oValue, oInitialValue, "then the inner 'then' method gets the right value");
						assert.strictEqual(oInnerPromiseIdentifier, undefined, "then the inner 'then' method do not get the FakePromiseIdentifier");
					});
				assert.ok(oInnerPromise instanceof Promise, "then the nested FakePromise returns a native Promise");
			});
			assert.ok(oPromise instanceof Promise, "then the returned value is a native Promise");
			return oPromise;
		});

		QUnit.test("when FakePromise nested into a FakePromise and PromiseIdentifier is passed", function(assert) {
			var oInitialValue = "42";
			var oPromise = new Utils.FakePromise(oInitialValue)
				.then(function(oValue, sPromiseIdentifier) {
					var oInnerPromise = new Utils.FakePromise(oValue, undefined, sPromiseIdentifier)
						.then(function(oValue, oInnerPromiseIdentifier) {
							assert.strictEqual(oValue, oInitialValue, "then the inner 'then' method gets the right value");
							assert.strictEqual(oInnerPromiseIdentifier, Utils.FakePromise.fakePromiseIdentifier,
								"then the inner 'then' method gets the FakePromiseIdentifier");
						});
					assert.ok(oInnerPromise instanceof Utils.FakePromise, "then the nested FakePromise returns a FakePromise");
				});
			assert.ok(oPromise instanceof Utils.FakePromise, "then the returned value is a FakePromise");
			return oPromise;
		});

		QUnit.test("when complex scenario with FakePromise into a Promise", function(assert) {
			return Promise.resolve()
				.then(function(oValue, sPromiseIdentifier) {
					return new Utils.FakePromise(oValue, undefined, sPromiseIdentifier);
				})
				.then(function() {
					// provoke exception
					"should be an array".some(function() {});
				})
				.then(function() {
					assert.notOk(true, "then the 'then' method shouldn't be called");
				})
				.then(function() {
					assert.notOk(true, "then the 'then' method in the root chain also shouldn't be called");
				})
				.catch(function(oErrorValue) {
					assert.ok(oErrorValue.message.includes("some"), "then the error was caught and communicated properly");
				})
				.then(function() {
					//Return rejected FakePromise to native to ensure it settles
					return new Utils.FakePromise(undefined, new Error("some error"));
				})
				.then(function() {
					assert.notOk(true, "then the 'then' method in the root chain also shouldn't be called");
				})
				.catch(function(oErrorValue) {
					assert.ok(oErrorValue.message.includes("some"), "then the error was caught and communicated properly");
				});
		});

		QUnit.test("when a thenable is returned from FakePromise.then", function(assert) {
			var oPromise = new Utils.FakePromise()
				.then(function() {
					return {
						then: function() {}
					};
				});

			assert.notOk(oPromise instanceof Utils.FakePromise, "then the returned value is not wrapped in another FakePromise");
		});
	});

	QUnit.module("Utils.getChangeFromChangesMap", {
		beforeEach: function() {
			this.oChange1 = {
				getId: function() {
					return "fileNameChange1";
				}
			};
			this.oChange2 = {
				getId: function() {
					return "fileNameChange2";
				}
			};
			this.oChange3 = {
				getId: function() {
					return "fileNameChange3";
				}
			};
			this.oChange4 = {
				getId: function() {
					return "fileNameChange4";
				}
			};
			this.mChanges = {
				c1: [this.oChange1, this.oChange2, this.oChange4],
				c2: [this.oChange3]
			};
		},
		afterEach: function() {}
	}, function() {
		QUnit.test("when called with existing Change keys", function(assert) {
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange1.getId()), this.oChange1, "then the correct change is returned");
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange2.getId()), this.oChange2, "then the correct change is returned");
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange3.getId()), this.oChange3, "then the correct change is returned");
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange4.getId()), this.oChange4, "then the correct change is returned");
		});

		QUnit.test("when called with not existing Change keys", function(assert) {
			assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange1.getId() + "foo"), undefined, "then no change is returned");
		});
	});

	QUnit.module("Utils.buildLrepRootNamespace", {
		beforeEach: function() {
			this.sErrorText = "Error in sap.ui.fl.Utils#buildLrepRootNamespace: ";
			this.sNoBaseIdErrorText = "Error in sap.ui.fl.Utils#buildLrepRootNamespace: for every scenario you need a base ID";
		},
		afterEach: function() {}
	}, function() {
		QUnit.test("scenario " + Scenario.VersionedAppVariant + ": New VersionedAppVariant", function(assert) {
			this.sErrorText += "in a versioned app variant scenario you additionally need a project ID";
			var sLrepRootNamespace = "apps/baseId/appVariants/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.VersionedAppVariant, "projectId"), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.VersionedAppVariant, "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for app variants throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", Scenario.VersionedAppVariant, "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for app variants throws an error"
			);
		});

		QUnit.test("scenario " + Scenario.AppVariant + ": New AppVariant", function(assert) {
			this.sErrorText += "in an app variant scenario you additionally need a project ID";
			var sLrepRootNamespace = "apps/baseId/appVariants/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.AppVariant, "projectId"), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.AppVariant, "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for app variants throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", Scenario.AppVariant, "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for app variants throws an error"
			);
		});

		QUnit.test("scenario " + Scenario.AdaptationProject + ": Customer adapts existing app", function(assert) {
			this.sErrorText += "in a adaptation project scenario you additionally need a project ID";
			var sLrepRootNamespace = "apps/baseId/adapt/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.AdaptationProject, "projectId"), sLrepRootNamespace, "then the root namespace got build correctly");
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

		QUnit.test("scenario " + Scenario.FioriElementsFromScratch + ": Customer adapts new Fiori elements app", function(assert) {
			var sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.FioriElementsFromScratch), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.FioriElementsFromScratch);},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for adaptations on a new app throws an error"
			);
		});

		QUnit.test("scenario " + Scenario.UiAdaptation + ": Customer adapts existing app using RTA", function(assert) {
			var sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", Scenario.UiAdaptation), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", Scenario.UiAdaptation);},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for adaptations on a new app throws an error"
			);
		});

		QUnit.test("no scenario specified", function(assert) {
			var sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId"), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for no specific scenario throws an error"
			);
		});
	});

	QUnit.module("Utils.normalizeReference", {
		beforeEach: function() {},
		afterEach: function() {}
	}, function() {
		QUnit.test("when called with an empty reference", function(assert) {
			assert.equal(Utils.normalizeReference(""), "", "then return empty string");
		});

		QUnit.test("when called reference without .Component", function(assert) {
			assert.equal(Utils.normalizeReference("reference"), "reference", "then return same string");
		});

		QUnit.test("when called reference with .Component", function(assert) {
			assert.equal(Utils.normalizeReference("reference.Component"), "reference", "then return string without .Component");
		});

		QUnit.test("when called reference with ONLY .Component in the middel", function(assert) {
			assert.equal(Utils.normalizeReference("reference.Component.x"), "reference.Component.x", "then the string is returned");
		});

		QUnit.test("when called reference with .Component in the middel", function(assert) {
			assert.equal(Utils.normalizeReference("test.Component.reference.Component"), "test.Component.reference", "then return string without .Component at the end");
		});
	});

	QUnit.module("_hasParameterAndValue is called", {
		before: function() {
			this.sParameterName = "parameterName";
			this.sParameterValue = "parameterValue";
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("parameter name doesnt exist", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs(this.sParameterName).returns(null);
			var bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, false, "the function returns false");
		});

		QUnit.test("parameter value empty string", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs(this.sParameterName).returns("");
			var bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, false, "the function returns false");
		});

		QUnit.test("parameter value not equal", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs(this.sParameterName).returns("notEqual");
			var bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, false, "the function returns false");
		});

		QUnit.test("parameter value is equal", function(assert) {
			sandbox.stub(UriParameters.prototype, "get").withArgs(this.sParameterName).returns(this.sParameterValue);
			var bResult = Utils.hasParameterAndValue(this.sParameterName, this.sParameterValue);
			assert.equal(bResult, true, "the function returns true");
		});
	});

	QUnit.module("handleUrlParameter is called", {
		before: function() {
			this.sParameterName = "parameterName";
			this.sParameterValue = "parameterValue";
			this.sSearchParameter = this.sParameterName + "=" + this.sParameterValue;
			this.sAnotherParameter = "test=true";
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with hasUrlParameterWithValue is true", function(assert) {
			var sUrl = "?" + this.sSearchParameter;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			var bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, "", "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is true and another parameter", function(assert) {
			var sUrl = "?" + this.sAnotherParameter + "&" + this.sSearchParameter;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			var bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, "?" + this.sAnotherParameter, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is true and another parameter at the end", function(assert) {
			var sUrl = "?" + this.sSearchParameter + "&" + this.sAnotherParameter;
			sandbox.stub(Utils, "hasParameterAndValue").returns(true);
			var bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, "?" + this.sAnotherParameter, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is false", function(assert) {
			var sUrl = "";
			sandbox.stub(Utils, "hasParameterAndValue").returns(false);
			var bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, "?" + this.sSearchParameter, "no change in the url");
		});

		QUnit.test("with hasUrlParameterWithValue is false and another parameter", function(assert) {
			var sUrl = "?" + this.sAnotherParameter;
			sandbox.stub(Utils, "hasParameterAndValue").returns(false);
			var bResult = Utils.handleUrlParameters(sUrl, this.sParameterName, this.sParameterValue);
			assert.equal(bResult, "?" + this.sAnotherParameter + "&" + this.sSearchParameter, "no change in the url");
		});
	});

	QUnit.module("Utils.getUShellService", {
		beforeEach: function() {
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync: function(sServiceName) {
					switch (sServiceName) {
						case "validService":
							return Promise.resolve("validServiceResult");
						default:
							return Promise.reject(new Error("Not available service: " + sServiceName));
					}
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with empty parameter", function(assert) {
			return Utils.getUShellService()
				.then(function (oUShellService) {
					assert.notOk(oUShellService, "then the method resolves to undefined");
				});
		});

		QUnit.test("with ushell container is not available", function(assert) {
			Utils.getUshellContainer.restore();
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			return Utils.getUShellService("validService")
				.then(function (oUShellService) {
					assert.strictEqual(oUShellService, undefined, "then the method resolves undefined");
				});
		});

		QUnit.test("with invalid service", function(assert) {
			return Utils.getUShellService("invalid-service")
				.catch(function (vError) {
					assert.ok(vError.message.indexOf("Not available service: ") > -1, "then the promise rejects");
				});
		});

		QUnit.test("with valid service", function(assert) {
			return Utils.getUShellService("validService")
				.then(function (oUShellService) {
					assert.strictEqual(oUShellService, "validServiceResult", "then the expected service is returned");
				});
		});
	});

	QUnit.module("Utils.getUShellServices", {
		beforeEach: function() {
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync: function(sServiceName) {
					switch (sServiceName) {
						case "validService1":
							return Promise.resolve("validService1Result");
						case "validService2":
							return Promise.resolve("validService2Result");
						case "validService3":
							return Promise.resolve("validService3Result");
						default:
							return Promise.reject(new Error("Invalid service: " + sServiceName));
					}
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with empty services list", function(assert) {
			return Utils.getUShellServices([])
				.then(function (mUshellServices) {
					assert.ok(isEmptyObject(mUshellServices), "then the returned services map is empty");
				});
		});

		QUnit.test("with ushell container is not available", function(assert) {
			Utils.getUshellContainer.restore();
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			return Utils.getUShellServices([])
				.then(function (mUshellServices) {
					assert.ok(isEmptyObject(mUshellServices), "then the returned services map is empty");
					return Utils.getUShellServices(["validService1"]);
				})
				.then(function (mUshellServices) {
					assert.strictEqual(mUshellServices["validService1"], undefined, "then the expected service is available with key only in the returned map");
				});
		});

		QUnit.test("with invalid service", function(assert) {
			return Utils.getUShellServices(["invalid-service"])
				.catch(function (oError) {
					assert.ok(oError.message.indexOf("Invalid service: ") > -1, "then the promise is rejected");
				});
		});

		QUnit.test("with valid services list", function(assert) {
			return Utils.getUShellServices(["validService1", "validService2", "validService3"])
				.then(function (mUshellServices) {
					assert.strictEqual(mUshellServices["validService1"], "validService1Result", "then the expected service is available in the returned map");
					assert.strictEqual(mUshellServices["validService2"], "validService2Result", "then the expected service is available in the returned map");
					assert.strictEqual(mUshellServices["validService3"], "validService3Result", "then the expected service is available in the returned map");
				});
		});
	});

	QUnit.done(function() {
		jQuery('#qunit-fixture').hide();
	});
});
