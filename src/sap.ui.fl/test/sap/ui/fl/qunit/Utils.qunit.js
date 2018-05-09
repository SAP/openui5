/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/Utils',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/layout/HorizontalLayout',
	'sap/m/Button',
	'sap/ui/thirdparty/hasher',
	// should be last:
	'sap/ui/thirdparty/sinon'
],
function(
	Utils,
	VerticalLayout,
	HorizontalLayout,
	Button,
	hasher,
	sinon
){
	"use strict";
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var aControls = [];
	QUnit.module("sap.ui.fl.Utils", {
		beforeEach: function () {
		},
		afterEach: function () {
			aControls.forEach(function (oControl) {
				oControl.destroy();
			});
			sandbox.restore();
		}
	});

	QUnit.test("sap.ui.fl.Utils", function (assert) {
		var oInstance = Utils;
		assert.ok(oInstance);
	});

	QUnit.test("getComponentClassName shall return an empty string if the control does not belong to a SAPUI5 component", function (assert) {
		var sComponent = Utils.getComponentClassName({});
		assert.strictEqual(sComponent, "");
	});

	QUnit.test("getComponentClassName shall return the component id", function (assert) {
		var sComponentName = "testName.Component";
		var oControl = {};
		var oComponentMock = {
			getMetadata: function () {
				return {
					getName: function () {
						return sComponentName;
					}
				};
			},
			getManifestEntry: function (sEntryKey) {
				return sEntryKey === "sap.ui5" ? {} : undefined;
			}
		};
		var oGetComponentIdForControlStub = sandbox.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = sandbox.stub(Utils, "_getComponent").returns(oComponentMock);

		assert.equal(Utils.getComponentClassName(oControl), sComponentName);

		assert.ok(oGetComponentIdForControlStub.called);
		assert.ok(oGetComponentStub.called);

		oGetComponentIdForControlStub.restore();
		oGetComponentStub.restore();
	});

	QUnit.test("getComponentClassName shall return the variant id instead if it is filled instead of the component id", function (assert) {
		var sComponentName = "testName.Component";
		var sAppVariantName = "myTestVariant";
		var oControl = {};
		var oComponentMock = {
			getMetadata: function () {
				return {
					getName: function () {
						return sComponentName;
					},
					getEntry: function (sEntryKey) {
						return sEntryKey === "sap.ui5" ? {} : undefined;
					}
				};
			},
			getComponentData: function () {
				return {
					startupParameters: {
						"sap-app-id": [
							sAppVariantName
						]
					}
				};
			}
		};
		var oGetComponentIdForControlStub = sandbox.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = sandbox.stub(Utils, "_getComponent").returns(oComponentMock);

		assert.equal(Utils.getComponentClassName(oControl), sAppVariantName);

		assert.ok(oGetComponentIdForControlStub.called);
		assert.ok(oGetComponentStub.called);

		oGetComponentIdForControlStub.restore();
		oGetComponentStub.restore();
	});

	QUnit.test("smartTemplating case: getComponentClassName shall return the variant id instead if it is filled instead of the component id", function (assert) {
		var sComponentName = "testName.Component";
		var sAppVariantName = "myTestVariant";
		var oControl = {};

		var oComponentMock = {
			getMetadata: function () {
				return {
					getName: function () {
						return sComponentName;
					},
					getEntry: function (sEntryKey) {
						return sEntryKey === "sap.ui5" ? {} : undefined;
					}
				};
			},
			getComponentData: function () {
				return {
					startupParameters: {
						"sap-app-id": [
							sAppVariantName
						]
					}
				};
			}
		};
		var oSmartTemplateCompMock = {
			getAppComponent: function () {
				return oComponentMock;
			}
		};
		var oGetComponentIdForControlStub = sandbox.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = sandbox.stub(Utils, "_getComponent").returns(oSmartTemplateCompMock);

		assert.equal(Utils.getComponentClassName(oControl), sAppVariantName);

		assert.ok(oGetComponentIdForControlStub.called);
		assert.ok(oGetComponentStub.called);

		oGetComponentIdForControlStub.restore();
		oGetComponentStub.restore();
	});

	QUnit.test("isVariantByStartupParameter can detect a variant by the startup parameter", function (assert) {

		sandbox.stub(Utils, "getAppComponentForControl").returns({});
		sandbox.stub(Utils, "_getComponentStartUpParameter").returns("someId");

		var bIsStartupParameterBasedVariant = Utils.isVariantByStartupParameter({});

		assert.ok(bIsStartupParameterBasedVariant, "the variant was detected");
	});

	QUnit.test("isVariantByStartupParameter returns false if no variant by the startup parameter is present", function (assert) {

		sandbox.stub(Utils, "getAppComponentForControl").returns({});
		sandbox.stub(Utils, "_getComponentStartUpParameter").returns();

		var bIsStartupParameterBasedVariant = Utils.isVariantByStartupParameter({});

		assert.ok(!bIsStartupParameterBasedVariant);
	});

	QUnit.test("getCurrentLayer shall return sap-ui-layer parameter", function (assert) {
		var oUriParams = {
			mParams: {
				"sap-ui-layer": [
					"VENDOR"
				]
			}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		var sLayer = Utils.getCurrentLayer();
		assert.equal(sLayer, "VENDOR");
		getUriParametersStub.restore();
	});

	QUnit.test("getCurrentLayer shall return USER layer if endUser flag is set ", function (assert) {
		var oUriParams = {
			mParams: {
				"sap-ui-layer": [
					"VENDOR"
				]
			}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		var sLayer = Utils.getCurrentLayer(true);
		assert.equal(sLayer, "USER");
		assert.ok(true);
		getUriParametersStub.restore();
	});

	QUnit.test("getCurrentLayer shall return default CUSTOMER layer ", function (assert) {
		var oUriParams = {
			mParams: {}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		var sLayer = Utils.getCurrentLayer(false);
		assert.equal(sLayer, "CUSTOMER");
		assert.ok(true);
		getUriParametersStub.restore();
	});

	QUnit.test("isLayerAboveCurrentLayer shall return a layer comparision between current (CUSTOMER) and passed layers", function (assert) {
		var oUriParams = {
			mParams: {
				"sap-ui-layer": [
					"CUSTOMER"
				]
			}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		assert.equal(Utils.isLayerAboveCurrentLayer(""), -1, "then with VENDOR layer -1 is returned");
		assert.equal(Utils.isLayerAboveCurrentLayer("VENDOR"), -1, "then with VENDOR layer -1 is returned");
		assert.equal(Utils.isLayerAboveCurrentLayer("CUSTOMER"), 0, "then with CUSTOMER layer 0 is returned");
		assert.equal(Utils.isLayerAboveCurrentLayer("USER"), 1, "then with USER layer 1 is returned");

		getUriParametersStub.restore();
	});

	QUnit.test("doesSharedVariantRequirePackageCustomer", function (assert) {
		var bDoesSharedVariantRequirePackage;
		sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER");

		// Call CUT
		bDoesSharedVariantRequirePackage = Utils.doesSharedVariantRequirePackage();

		assert.strictEqual(bDoesSharedVariantRequirePackage, false);
		Utils.getCurrentLayer.restore();
	});

	QUnit.test("doesSharedVariantRequirePackageCustomerBase", function (assert) {
		var bDoesSharedVariantRequirePackage;
		sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER_BASE");

		// Call CUT
		bDoesSharedVariantRequirePackage = Utils.doesSharedVariantRequirePackage();

		assert.strictEqual(bDoesSharedVariantRequirePackage, true);
		Utils.getCurrentLayer.restore();
	});

	QUnit.test("getClient", function (assert) {
		var oUriParams = {
			mParams: {
				"sap-client": [
					"123"
				]
			}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		var sClient = Utils.getClient();
		assert.equal(sClient, "123");
		assert.ok(true);
		getUriParametersStub.restore();
	});

	QUnit.test("convertBrowserLanguageToISO639_1 shall return the ISO 639-1 language of a RFC4646 language", function (assert) {
		assert.equal(Utils.convertBrowserLanguageToISO639_1("en-us"), 'EN');
		assert.equal(Utils.convertBrowserLanguageToISO639_1("de"), 'DE');
		assert.equal(Utils.convertBrowserLanguageToISO639_1(""), '');
		assert.equal(Utils.convertBrowserLanguageToISO639_1("hkjhkashik"), '');
	});

	QUnit.test("_getComponentIdForControl shall return the result of getOwnerIdForControl", function (assert) {
		var sComponentId;
		sandbox.stub(Utils, "_getOwnerIdForControl").returns('Rumpelstilzchen');
		// Call CUT
		sComponentId = Utils._getComponentIdForControl(null);
		assert.equal(sComponentId, 'Rumpelstilzchen');
		Utils._getOwnerIdForControl.restore();
	});

	QUnit.test("_getComponentIdForControl shall walk up the control tree until it finds a component id", function (assert) {
		var sComponentId, oControl1, oControl2, oControl3, fnGetOwnerIdForControl;
		oControl1 = {};
		oControl2 = {
			getParent: sandbox.stub().returns(oControl1)
		};
		oControl3 = {
			getParent: sandbox.stub().returns(oControl2)
		};

		fnGetOwnerIdForControl = sandbox.stub(Utils, "_getOwnerIdForControl");
		fnGetOwnerIdForControl.withArgs(oControl3).returns("");
		fnGetOwnerIdForControl.withArgs(oControl2).returns("");
		fnGetOwnerIdForControl.withArgs(oControl1).returns("sodimunk");

		// Call CUT
		sComponentId = Utils._getComponentIdForControl(oControl3);

		assert.equal(sComponentId, 'sodimunk');
		sinon.assert.calledThrice(fnGetOwnerIdForControl);
		Utils._getOwnerIdForControl.restore();
	});

	QUnit.test("_getComponentIdForControl shall stop walking up the control tree after 100 iterations", function (assert) {
		var sComponentId, aControls, i, fnGetOwnerIdForControl, previous;
		aControls = [];
		/*eslint-disable no-loop-func */
		 for (i = 0; i < 200; i++) {
			previous = (i >= 1) ? aControls[i - 1] : null;
			(function (previous, i) {
				aControls[i] = {
					getParent: function () {
						return previous;
					}
				};
			})(previous, i);
		}
		/*eslint-enable no-loop-func */

		fnGetOwnerIdForControl = sandbox.stub(Utils, "_getOwnerIdForControl").returns("");

		// Call CUT
		sComponentId = Utils._getComponentIdForControl(aControls[199]);

		assert.strictEqual(sComponentId, '');
		sinon.assert.callCount(fnGetOwnerIdForControl, 100);
		fnGetOwnerIdForControl.restore();
	});

	QUnit.test("getComponentName shall return the component name for a component", function (assert) {
		var oMetadata = {
			_sComponentName: 'testcomponent.Component',
			getName: function () {
				return this._sComponentName;
			},
			getEntry: function (sEntryKey) {
				return sEntryKey === "sap.ui5" ? {} : undefined;
			}
		};
		var oComponent = {
			getMetadata: function () {
				return oMetadata;
			}
		};
		// 1. simple check
		var sComponentName = Utils.getComponentName(oComponent);
		assert.equal(sComponentName, 'testcomponent.Component');

		// 2. check that .Component is added if the actual component name has no .Component suffix
		oMetadata._sComponentName = 'testcomponent';
		sComponentName = Utils.getComponentName(oComponent);
		assert.equal(sComponentName, 'testcomponent.Component');

		//Commented out since method getComponentName is always called from getComponentClassName and this method already includes the check for smart templates.
		// 3. check that in case of a smart templating component the app component is retrieved
		/*var oAppCompMetadata = {
		 _sComponentName: 'app.testcomponent.Component',
		 getName: function() {
		 return this._sComponentName;
		 }
		 };
		 var oAppComponent = {
		 getMetadata: function() {
		 return oAppCompMetadata;
		 }
		 };
		 oComponent.getAppComponent = function() {
		 return oAppComponent;
		 };
		 sComponentName = Utils.getComponentName(oComponent);
		 assert.equal(sComponentName, 'app.testcomponent.Component');*/
	});

	QUnit.test("getXSRFTokenFromControl shall return an empty string if retrieval failes", function (assert) {
		var oControl, sXSRFToken;
		oControl = {};

		// Call CUT
		sXSRFToken = Utils.getXSRFTokenFromControl(oControl);

		assert.strictEqual(sXSRFToken, '');
	});

	QUnit.test("getXSRFTokenFromControl shall return the XSRF Token from the Control's OData model", function (assert) {
		var oControl, sXSRFToken, fStub;
		oControl = {
			getModel: function () {
			}
		};
		fStub = sandbox.stub(Utils, "_getXSRFTokenFromModel").returns("abc");

		// Call CUT
		sXSRFToken = Utils.getXSRFTokenFromControl(oControl);

		assert.strictEqual(sXSRFToken, 'abc');
		fStub.restore();
	});

	QUnit.test("_getXSRFTokenFromModel shall return an empty string if the retrieval failed", function (assert) {
		var oModel, sXSRFToken;
		oModel = {};

		// Call CUT
		sXSRFToken = Utils._getXSRFTokenFromModel(oModel);

		assert.strictEqual(sXSRFToken, '');
	});

	QUnit.test("_getXSRFTokenFromModel shall return the XSRF Token from the OData model", function (assert) {
		var oModel, sXSRFToken;
		oModel = {
			getHeaders: function () {
				return {
					"x-csrf-token": "gungalord"
				};
			}
		};

		// Call CUT
		sXSRFToken = Utils._getXSRFTokenFromModel(oModel);

		assert.strictEqual(sXSRFToken, 'gungalord');
	});

	QUnit.test("isBinding shall return false if the property is null", function (assert) {
		var oPropertyValue = null;
		var bIsBinding = Utils.isBinding(oPropertyValue);
		assert.strictEqual(bIsBinding, false);
	});

	QUnit.test("isBinding shall return false if the property is not a string", function (assert) {
		var oPropertyValue = {
			mParams: {}
		};
		var bIsBinding = Utils.isBinding(oPropertyValue);
		assert.strictEqual(bIsBinding, false);
	});

	QUnit.test("isBinding shall return false if the property is a string which does not represent a binding", function (assert) {
		var sPropertyValue = "test";
		var bIsBinding = Utils.isBinding(sPropertyValue);
		assert.strictEqual(bIsBinding, false);
	});

	QUnit.test("isBinding shall return true if the property is a string which does represent a binding", function (assert) {
		var sPropertyValue = "{i18n>test}";
		var bIsBinding = Utils.isBinding(sPropertyValue);
		assert.strictEqual(bIsBinding, true);
	});

	QUnit.test("Utils.isHotfixMode shall return the hotfix url parameter", function (assert) {
		var oUriParams = {
			mParams: {
				"hotfix": [
					"true"
				]
			}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		var bIsHotfix = Utils.isHotfixMode();
		assert.strictEqual(bIsHotfix, true);
		getUriParametersStub.restore();
	});

	QUnit.test("isHotfixMode shall return false if there is no hotfix url parameter", function (assert) {
		var oUriParams = {
			mParams: {}
		};
		var getUriParametersStub = sandbox.stub(Utils, "_getUriParameters").returns(oUriParams);
		var bIsHotfix = Utils.isHotfixMode();
		assert.strictEqual(bIsHotfix, false);
		getUriParametersStub.restore();
	});

	QUnit.test("Utils.log shall call jQuery.sap.log.warning once", function (assert) {
		// PREPARE
		var spyLog = sinon.spy(jQuery.sap.log, "warning");

		// CUT
		Utils.log.warning("");

		// ASSERTIONS
		assert.equal(spyLog.callCount, 1);

		// RESTORE
		spyLog.restore();
	});

	QUnit.test("log shall call jQuery.sap.log.error once", function (assert) {
		// PREPARE
		var spyLog = sinon.spy(jQuery.sap.log, "error");

		// CUT
		Utils.log.error("");

		// ASSERTIONS
		assert.equal(spyLog.callCount, 1);

		// RESTORE
		spyLog.restore();
	});

	QUnit.test("log shall call jQuery.sap.log.debug once", function (assert) {
		// PREPARE
		var spyLog = sinon.spy(jQuery.sap.log, "debug");

		// CUT
		Utils.log.debug("");

		// ASSERTIONS
		assert.equal(spyLog.callCount, 1);

		// RESTORE
		spyLog.restore();
	});

	QUnit.test('getFirstAncestorOfControlWithControlType', function (assert) {
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

	QUnit.test('hasControlAncestorWithId shall return true if the control itself is the ancestor', function (assert) {
		var button = new Button('button1'), bHasAncestor;
		aControls.push(button);

		bHasAncestor = Utils.hasControlAncestorWithId('button1', 'button1');
		assert.strictEqual(bHasAncestor, true);
	});

	QUnit.test("hasControlAncestorWithId shall return true if the control's parent is the ancestor", function (assert) {
		var hLayout, button, bHasAncestor;
		hLayout = new HorizontalLayout('hLayout');
		button = new Button('button1');
		hLayout.addContent(button);
		aControls.push(hLayout);

		bHasAncestor = Utils.hasControlAncestorWithId('button1', 'hLayout');
		assert.strictEqual(bHasAncestor, true);
	});

	QUnit.test("hasControlAncestorWithId shall return true if the control has the specified ancestor", function (assert) {
		var hLayout1, hLayout2, button, bHasAncestor;
		hLayout1 = new HorizontalLayout('hLayout1');
		hLayout2 = new HorizontalLayout('hLayout2');
		button = new Button('button');
		hLayout1.addContent(button);
		hLayout2.addContent(hLayout1);
		aControls.push(hLayout2);

		bHasAncestor = Utils.hasControlAncestorWithId('button', 'hLayout2');

		assert.strictEqual(bHasAncestor, true);
	});

	QUnit.test("hasControlAncestorWithId shall return false if the control does not have the specified ancestor", function (assert) {
		var hLayout, button, bHasAncestor;
		hLayout = new HorizontalLayout('hLayout');
		button = new Button('button');
		aControls.push(hLayout, button);

		bHasAncestor = Utils.hasControlAncestorWithId('button', 'hLayout');
		assert.strictEqual(bHasAncestor, false);
	});

	QUnit.test("getAppDescriptor shall return NULL if the control does not belong to a SAPUI5 component", function (assert) {
		var oAppDescriptor;

		// Call CUT
		oAppDescriptor = Utils.getAppDescriptor({});
		assert.strictEqual(oAppDescriptor, null);
	});

	QUnit.test("getAppDescriptor shall return the an appDescriptor instance", function (assert) {
		var oAppDescriptor = {
			"id": "sap.ui.smartFormOData",
			getEntry: function (sEntryKey) {
				return sEntryKey === "sap.ui5" ? {} : undefined;
			}
		};
		var oControl = {};
		var oComponentMock = {
			getMetadata: function () {
				return {
					getManifest: function () {
						return oAppDescriptor;
					}
				};
			}
		};
		var oGetComponentIdForControlStub = sandbox.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = sandbox.stub(Utils, "_getComponent").returns(oComponentMock);

		// Call CUT
		assert.equal(Utils.getAppDescriptor(oControl), oAppDescriptor);

		assert.ok(oGetComponentIdForControlStub.called);
		assert.ok(oGetComponentStub.called);

		oGetComponentIdForControlStub.restore();
		oGetComponentStub.restore();
	});

	QUnit.test("getSiteID shall return NULL if no valid UI5 control is filled in", function (assert) {
		var sSiteId;

		// Call CUT
		sSiteId = Utils.getSiteId({});
		assert.strictEqual(sSiteId, null);
	});

	QUnit.test("getSiteID shall return a siteId", function (assert) {
		var sSiteId = 'dummyId4711';
		var oControl = {};
		var oComponentMock = {
			getComponentData: function () {
				return {
					startupParameters: {
						//"scopeId": [
						"hcpApplicationId": [
							sSiteId, 'dummyId4712'
						]
					}
				};
			}
		};
		var oGetComponentIdForControlStub = sandbox.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = sandbox.stub(Utils, "_getComponent").returns(oComponentMock);

		// Call CUT
		assert.equal(Utils.getSiteId(oControl), sSiteId);

		assert.ok(oGetComponentIdForControlStub.called);
		assert.ok(oGetComponentStub.called);

		oGetComponentIdForControlStub.restore();
		oGetComponentStub.restore();
	});

	QUnit.test("encodes a string into ascii", function (assert) {
		var string = "Hallo Welt!";
		var expectedString = "72,97,108,108,111,32,87,101,108,116,33";

		var encodedString = Utils.stringToAscii(string);

		assert.equal(encodedString, expectedString);
	});

	QUnit.test("decodes ascii into a string", function (assert) {
		var string = "72,97,108,108,111,32,87,101,108,116,33";
		var expectedString = "Hallo Welt!";

		var decodedString = Utils.asciiToString(string);

		assert.equal(decodedString, expectedString);
	});

	QUnit.test("getAppComponentForControl can determine the smart template special case", function (assert) {
		var oComponent = new sap.ui.core.UIComponent();
		var oAppComponent = new sap.ui.core.UIComponent();
		oComponent.getAppComponent = function () {
			return oAppComponent;
		};

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oAppComponent);
	});

	QUnit.test("getAppComponentForControl can determine that the passed control is already the app component", function (assert) {
		var oComponent = new sap.ui.core.UIComponent({
			manifest: {
				"sap.app": {
					type: "application"
				}
			}
		});

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oComponent);
	});

	QUnit.test("getAppComponentForControl can determine the OVP special case", function (assert) {
		var oComponent = new sap.ui.core.UIComponent();
		var oAppComponent = new sap.ui.core.UIComponent();
		oComponent.oComponentData = {appComponent: oAppComponent};

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oAppComponent);
	});

	QUnit.test("getAppComponentForControl returns the component if no Manifest is available", function (assert) {
		var oComponent = new sap.ui.core.UIComponent();

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oComponent);
	});

	QUnit.test("getAppComponentForControl searches further for the app component if the passed component is not of the type application", function (assert) {
		var oComponent = new sap.ui.core.UIComponent();
		var oParentComponent = {};
		var oSapAppEntry = {
			type: "definitelyNotAnApplication"
		};

		oComponent.getManifestEntry = function (sParameter) {
			return sParameter === "sap.app" ? oSapAppEntry : undefined;
		};

		var oStub = sandbox.stub(Utils, "getAppComponentForControl");
		sandbox.stub(Utils, "_getComponentForControl").returns(oParentComponent);

		Utils._getAppComponentForComponent(oComponent);

		assert.ok(oStub.calledOnce, "the function was called once");
		assert.equal(oStub.firstCall.args[0], oParentComponent, "the function was called with the parent component the first time");
	});

	QUnit.test("getAppComponentForControl returns the component if the passed component is of the type application", function (assert) {
		var oComponent = new sap.ui.core.UIComponent();
		var oSapAppEntry = {
			type: "application"
		};

		oComponent.getManifestEntry = function (sParameter) {
			return sParameter === "sap.app" ? oSapAppEntry : undefined;
		};

		var oDeterminedAppComponent = Utils._getAppComponentForComponent(oComponent);

		assert.equal(oDeterminedAppComponent, oComponent);
	});

	QUnit.test("getComponentClassName shall return the next component of type 'application' in the hierarchy", function (assert) {
		var sComponentNameApp = "testName.ComponentApp";
		var sComponentNameComp = "testName.ComponentComp";
		var oControl = {};

		var oComponentMockComp = {
			getMetadata: function () {
				return {
					getName: function () {
						return sComponentNameComp;
					},
					getEntry: function (sEntryKey) {
						return sEntryKey === "sap.ui5" ? {} : undefined;
					}
				};
			},
			getManifestEntry: function () {
				return {
					type: "component"
				};
			}
		};

		var oComponentMockApp = {
			getMetadata: function () {
				return {
					getName: function () {
						return sComponentNameApp;
					},
					getEntry: function (sEntryKey) {
						return sEntryKey === "sap.ui5" ? {} : undefined;
					}
				};
			},
			getManifestEntry: function (sEntryKey) {
				return sEntryKey === "type" ? {
					type: "application"
				} : undefined;
			}
		};

			var oGetComponentForControlStub = sandbox.stub(Utils, "_getComponentForControl").onFirstCall().returns(oComponentMockComp).onSecondCall().returns(oComponentMockApp);

		assert.equal(Utils.getComponentClassName(oControl), sComponentNameApp, "Check that the type of the component is 'application'");

		oGetComponentForControlStub.stub.restore();
	});

	QUnit.test("getComponentClassName does not find component of type 'application' in the hierarchy", function (assert) {
		var sComponentNameComp = "testName.ComponentComp";
		var oControl = {};

		var oComponentMockComp = {
			getMetadata: function () {
				return {
					getName: function () {
						return sComponentNameComp;
					}
				};
			},
			getManifestEntry: function (sEntryKey) {
				return sEntryKey === "sap.app" ? {
					type: "component"
				} : undefined;
			}
		};

		var oGetComponentForControlStub = sandbox.stub(Utils, "_getComponentForControl").onFirstCall().returns(oComponentMockComp).onSecondCall().returns(null);

		assert.equal(Utils.getComponentClassName(oControl), "", "Check that empty string is returned.");

		oGetComponentForControlStub.stub.restore();
	});

	QUnit.module("get/set URL Technical Parameter values", {

		beforeEach : function(){
			this.originalUShell = sap.ushell;
		},

		afterEach : function(){
			sap.ushell = this.originalUShell;
			sandbox.restore();
		}

	});

	QUnit.test("when calling 'getTechnicalParametersForComponent' with a Component containing a valid URL parameter", function(assert){
		var mParameters = {
			"first-tech-parameter" : ["value1, value2"],
			"second-tech-parameter" : ["value3"]
		};

		var oComponentMock = {
			getComponentData: function(){
				return {
					technicalParameters: mParameters
				};
			}
		};

		assert.deepEqual(Utils.getTechnicalParametersForComponent(oComponentMock),
			mParameters,
			"then the function returns the variant reference in the URL parameter");
	});

	QUnit.test("when calling 'getTechnicalParametersForComponent' with technical parameters not existing", function(assert){
		var oComponentMock = {
			getComponentData: function(){
				return {
					technicalParameters: {}
				};
			}
		};

		assert.deepEqual(Utils.getTechnicalParametersForComponent(oComponentMock),
			{},
			"then the function returns the variant reference in the URL parameter");
	});

	QUnit.test("when calling 'getTechnicalParametersForComponent' with an invalid component", function(assert){
		var oComponentMock = {};
		assert.notOk(Utils.getTechnicalParametersForComponent(oComponentMock), "then the function returns undefined");
	});

	QUnit.test("when calling 'setTechnicalURLParameterValues' with a component, parameter name and some values", function(assert){
		var oMockedURLParser = {
			getHash : function(){
				return "";
			},
			parseShellHash : function(sHash){
				return {
					semanticObject : "Action",
					action : "somestring",
					params : {
						"sap-ui-fl-max-layer" : ["CUSTOMER"]
					}
				};
			},
			constructShellHash : function(oParsedHash){
				assert.equal(hasher.changed.active, false, "then the 'active' flag of the hasher is first set to false (to avoid navigation)");
				assert.deepEqual(oParsedHash.params["sap-ui-fl-max-layer"][0], "CUSTOMER", "then the previous parameters are still present for the hash");
				assert.deepEqual(oParsedHash.params["testParameter"][0], "testValue", "then the new parameter is properly added to the hash");
				assert.deepEqual(oParsedHash.params["testParameter"][1], "testValue2", "then the new parameter is properly added to the hash");
				return "hashValue";
			}
		};

		var oMockComponent = {
			oComponentData : {
				technicalParameters: {}
			},
			getComponentData : function () {
				return this.oComponentData;
			}
		};

		// this overrides the ushell globally => it gets restored in afterEach
		sap.ushell = jQuery.extend(sap.ushell, {
			Container : {
				getService : function() {
					return oMockedURLParser;
				}
			}
		});

		var oReplaceHashSpy = sandbox.spy(hasher, "replaceHash");

		Utils.setTechnicalURLParameterValues(oMockComponent, "testParameter", ["testValue", "testValue2"]);

		assert.equal(oReplaceHashSpy.calledWith("hashValue"), true, "then the 'replaceHash' function of the hasher is called with the right parameter");
		assert.equal(hasher.changed.active, true, "then the 'active' flag of the hasher is restored to true");
		assert.equal(oMockComponent.getComponentData().technicalParameters["testParameter"][0], "testValue", "then the new parameter is properly added to the technical parameter");
		assert.equal(oMockComponent.getComponentData().technicalParameters["testParameter"][1], "testValue2", "then the new parameter is properly added to the technical parameter");
	});

	QUnit.test("when calling 'setTechnicalURLParameterValues' with an invalid component, parameter name and some values", function(assert){
		var oMockedURLParser = {
			getHash : function(){
				return "";
			},
			parseShellHash : function(sHash){
				return {
					semanticObject : "Action",
					action : "somestring",
					params : {
						"sap-ui-fl-max-layer" : ["CUSTOMER"]
					}
				};
			},
			constructShellHash : function(oParsedHash){
				assert.equal(hasher.changed.active, false, "then the 'active' flag of the hasher is first set to false (to avoid navigation)");
				assert.deepEqual(oParsedHash.params["sap-ui-fl-max-layer"][0], "CUSTOMER", "then the previous parameters are still present for the hash");
				assert.deepEqual(oParsedHash.params["testParameter"][0], "testValue", "then the new parameter is properly added to the hash");
				assert.deepEqual(oParsedHash.params["testParameter"][1], "testValue2", "then the new parameter is properly added to the hash");
				return "hashValue";
			}
		};

		// this overrides the ushell globally => it gets restored in afterEach
		sap.ushell = jQuery.extend(sap.ushell, {
			Container : {
				getService : function() {
					return oMockedURLParser;
				}
			}
		});
		sandbox.stub(Utils.log, "error");
		Utils.setTechnicalURLParameterValues({}, "testParameter", ["testValue", "testValue2"]);

		assert.ok(Utils.log.error.calledWith("Component instance not provided, so technical parameters in component data would remain unchanged"), "then error produced as component is invalid");
		assert.equal(hasher.changed.active, true, "then the 'active' flag of the hasher is restored to true");
	});

	QUnit.test("when calling 'setTechnicalURLParameterValues' with a component, parameter name (having previously existing values) and no values", function(assert){
		var oMockedURLParser = {
			getHash : function(){
				return "";
			},
			parseShellHash : function(sHash){
				return {
					semanticObject : "Action",
					action : "somestring",
					params : {
						"sap-ui-fl-max-layer" : ["CUSTOMER"],
						"testParameter" : ["testValue", "testValue2"]
					}
				};
			},
			constructShellHash : function(oParsedHash){
				assert.equal(hasher.changed.active, false, "then the 'active' flag of the hasher is first set to false (to avoid navigation)");
				assert.deepEqual(oParsedHash.params["sap-ui-fl-max-layer"][0], "CUSTOMER", "then the previous parameters are still present for the hash");
				assert.notOk(oParsedHash.params["testParameter"], "then the parameter name no longer exists for the hash");
				return "hashValue";
			}
		};

		var oMockComponent = {
			oComponentData : {
				technicalParameters: {
					"testParameter" : ["testValue", "testValue2"]
				}
			},
			getComponentData : function () {
				return this.oComponentData;
			}
		};

		// this overrides the ushell globally => it gets restored in afterEach
		sap.ushell = jQuery.extend(sap.ushell, {
			Container : {
				getService : function() {
					return oMockedURLParser;
				}
			}
		});
		assert.equal(oMockComponent.getComponentData().technicalParameters["testParameter"].length, 2, "then initially the parameter exists in technical parameters with 2 values");
		Utils.setTechnicalURLParameterValues(oMockComponent, "testParameter", []);
		assert.notOk(oMockComponent.getComponentData().technicalParameters["testParameter"], "then the parameter no longer exists as a technical parameter");
		assert.equal(hasher.changed.active, true, "then the 'active' flag of the hasher is restored to true");
	});

	QUnit.test("createNamespace returns correct namespace for changes of app descriptor", function(assert) {
		var oPropertyBag = {
			reference : "sap.account.appname.Component"
		};
		var sNamespace = "apps/sap.account.appname/changes/";
		assert.equal(Utils.createNamespace(oPropertyBag, "changes"), sNamespace);
	});

	QUnit.test("createNamespace returns correct namespace for changes of app variant", function(assert) {
		var oPropertyBag = {
			reference : "sap.account.appname.id_1471874653135_11"
		};
		var sNamespace = "apps/sap.account.appname.id_1471874653135_11/changes/";
		assert.equal(Utils.createNamespace(oPropertyBag, "changes"), sNamespace);
	});


	QUnit.module("Utils.isApplicationVariant", {
		beforeEach: function () {
			this.sComponentName = "componentName";
			this.sAppVariantId = "variantId";

			this.oComponent = new sap.ui.core.UIComponent();
			this.oStubbedManifestEntryUi5 = {/*no appVariantId */};
			sandbox.stub(this.oComponent, "getManifestEntry").returns(this.oStubbedManifestEntryUi5);

			this.oComponentOfVariant = new sap.ui.core.UIComponent();
			this.oStubbedManifestEntryUi5WithVariantId = {
				"appVariantId": this.sAppVariantId
			};
			sandbox.stub(this.oComponentOfVariant, "getManifestEntry").returns(this.oStubbedManifestEntryUi5WithVariantId);
			sandbox.stub(Utils, "getComponentName").returns(this.sComponentName);
		},

		afterEach: function () {
			this.oComponent.destroy();
			this.oComponentOfVariant.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("can determine a component which is not a variant", function (assert) {
		sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
		assert.equal(this.sComponentName, Utils.getComponentClassName(this.oComponent));
	});

	QUnit.test("can determine a variant", function (assert) {
		sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponentOfVariant);
		assert.equal(this.sAppVariantId, Utils.getComponentClassName(this.oComponentOfVariant));
	});

	QUnit.test("can determine a component which is not a variant", function (assert) {
		sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
		assert.notOk(Utils.isApplicationVariant(this.oComponent));
	});

	QUnit.test("can determine a variant", function (assert) {
		sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponentOfVariant);
		assert.ok(Utils.isApplicationVariant(this.oComponentOfVariant));
	});

	QUnit.test("isApplication returns false if there is no manifest", function (assert) {
		assert.notOk(Utils.isApplication());
	});

	QUnit.test("isApplication returns false if there is no manifest['sap.app']", function (assert) {

		var oManifest = {
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.notOk(Utils.isApplication(oManifest));
	});

	QUnit.test("isApplication returns false if there is no manifest['sap.app'].type", function (assert) {

		var oManifest = {
			"sap.app": {
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.notOk(Utils.isApplication(oManifest));
	});

	QUnit.test("isApplication returns false if the manifest type is not 'application'", function (assert) {

		var oManifest = {
			"sap.app": {
				"type": "component"
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.notOk(Utils.isApplication(oManifest));
	});

	QUnit.test("isApplication returns true if the manifest type is 'application'", function (assert) {

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.ok(Utils.isApplication(oManifest));
	});

	QUnit.test("getFlexReference returns the variantId if it exists", function (assert) {

		var sAppVariantId = "appVariantId";
		var sComponentName = "componentName";
		var sAppId = "appId";
		var oManifest = {
			"sap.app": {
				"type": "application",
				"id": sAppId
			},
			"sap.ui5": {
				"appVariantId": sAppVariantId,
				"componentName": sComponentName
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.equal(Utils.getFlexReference(oManifest), sAppVariantId);
	});


	QUnit.module("Utils.isDebugEnabled", {
		beforeEach: function () {
			this.sWindowSapUiDebug = window["sap-ui-debug"];
		},
		afterEach: function () {
			window["sap-ui-debug"] = this.sWindowSapUiDebug;
			sandbox.restore();
		}
	});


	QUnit.test("can determine the general debug settings", function (assert) {
		var oConfig = sap.ui.getCore().getConfiguration();
		sandbox.stub(oConfig, "getDebug").returns(true);

		assert.ok(Utils.isDebugEnabled(), "the debugging is detected");
	});

	QUnit.test("can determine the fl library debugging is set as the only library", function (assert) {
		var oConfig = sap.ui.getCore().getConfiguration();
		sandbox.stub(oConfig, "getDebug").returns(false);
		window["sap-ui-debug"] = "sap.ui.fl";

		assert.ok(Utils.isDebugEnabled(), "the debugging is detected");
	});

	QUnit.test("can determine the fl library debugging is set as part of other libraries", function (assert) {
		var oConfig = sap.ui.getCore().getConfiguration();
		sandbox.stub(oConfig, "getDebug").returns(false);
		window["sap-ui-debug"] = "sap.ui.core,sap.m,sap.ui.fl,sap.ui.rta";

		assert.ok(Utils.isDebugEnabled(), "the debugging is detected");
	});

	QUnit.test("can determine no 'sap.ui.fl'-library debugging is set", function (assert) {
		var oConfig = sap.ui.getCore().getConfiguration();
		sandbox.stub(oConfig, "getDebug").returns(false);
		window["sap-ui-debug"] = "sap.ui.rta, sap.m";
		assert.ok(!Utils.isDebugEnabled(), "no debugging is detected");
	});

	QUnit.test("can determine no library debugging is set", function (assert) {
		var oConfig = sap.ui.getCore().getConfiguration();
		sandbox.stub(oConfig, "getDebug").returns(false);
		window["sap-ui-debug"] = "";
		assert.ok(!Utils.isDebugEnabled(), "no debugging is detected");
	});


	QUnit.module("Utils.getFlexReference", {
		beforeEach: function () {
		},

		afterEach: function () {
		}
	});

	QUnit.test("getFlexReference returns the componentName if it exists and variantId does not exist", function (assert) {

		var sComponentName = "componentName";
		var sAppId = "appId";
		var oManifest = {
			"sap.app": {
				"type": "application",
				"id": sAppId
			},
			"sap.ui5": {
				"componentName": sComponentName
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.equal(Utils.getFlexReference(oManifest), sComponentName + ".Component");
	});

	QUnit.test("getFlexReference returns the appId if neither the variantId nor the componentName exist", function (assert) {

		var sAppId = "appId";
		var oManifest = {
			"sap.app": {
				"type": "application",
				"id": sAppId
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.equal(Utils.getFlexReference(oManifest), sAppId + ".Component");
	});

	QUnit.test("getFlexReference returns the value from getComponentName function if neither the sap.ui5.variantId nor the sap.ui5.componentName exist and sap.app.id is at design time", function (assert) {

		var sAppId = Utils.APP_ID_AT_DESIGN_TIME;
		var sComName = "comName";
		var oManifest = {
			"sap.app": {
				"type": "application",
				"id": sAppId
			},
			getEntry: function (key) {
				return this[key];
			},
			getComponentName: function(){
				return sComName;
			}
		};

		assert.equal(Utils.getFlexReference(oManifest), sComName + ".Component");
	});

	QUnit.test("isCustomerDependentLayer", function(assert) {
		assert.ok(Utils.isCustomerDependentLayer("CUSTOMER"), "'CUSTOMER' layer is detected as customer dependent");
		assert.ok(Utils.isCustomerDependentLayer("CUSTOMER_BASE"), "'CUSTOMER_BASE' layer is detected as customer dependent");
		assert.strictEqual(Utils.isCustomerDependentLayer("VENDOR"), false, "'VENDOR' layer is detected as not customer dependent layer");
	});

	QUnit.test("getAppVersionFromManifest returns the application version from manifest", function (assert) {

		var sAppVersion = "1.2.3";
		var oManifestJson = {
			"sap.app": {
				applicationVersion : {
					version : sAppVersion
				}
			}
		};
		var oManifest = {
			"sap.app": {
				applicationVersion : {
					version : sAppVersion
				}
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		assert.equal(Utils.getAppVersionFromManifest(oManifest), sAppVersion, "if the manifest object was passed");
		assert.equal(Utils.getAppVersionFromManifest(oManifestJson), sAppVersion, "if the manifest json data was passed");
		assert.equal(Utils.getAppVersionFromManifest(), "", "if nothing was passed, return empty string");
	});

	QUnit.module("Utils.execPromiseQueueSequentially", {
		beforeEach: function (assert) {
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

			this.aPromisesWithoutReject = [this.fnPromise1, this.fnPromise2, this.fnPromise3];
			this.aPromisesWithReject = [this.fnPromise1, this.fnPromise4];
			this.aPromisesWithObj = [{}, this.fnPromise1];
			this.aPromisesResolveAfterReject = [this.fnPromise4, this.fnPromise1];

			this.fnExecPromiseQueueSpy = sandbox.spy(Utils, "execPromiseQueueSequentially");
			sandbox.spyLog = sandbox.spy(jQuery.sap.log, "error");
		},

		afterEach: function () {
			sandbox.restore();
		}
	});

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
		Utils.execPromiseQueueSequentially(this.aPromisesWithoutReject).then( function() {
			assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 4, "then execPromiseQueueSequentially called four times");
			sinon.assert.callOrder(this.fnPromise1, this.fnPromise2, this.fnPromise3);
			assert.strictEqual(sandbox.spyLog.callCount, 0, "then error log not called");
			done();
		}.bind(this));
	});

	QUnit.test("when called with an array containing resolved, rejected and rejected without return promises", function(assert) {
		return Utils.execPromiseQueueSequentially(this.aPromisesWithReject).then( function() {
			assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
			sinon.assert.callOrder(this.fnPromise1, this.fnPromise4);
			assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once inside catch block, for the rejected promise without return");
		}.bind(this));
	});

	QUnit.test("when called with an array containing an object and a promise", function(assert) {
		return Utils.execPromiseQueueSequentially(this.aPromisesWithObj).then( function() {
			assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
			sinon.assert.callOrder(this.fnPromise1);
			assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once, as one element (object) was not a function");
		}.bind(this));
	});

	QUnit.test("when called with an array containing a rejected followed by a resolved promise", function(assert) {
		return Utils.execPromiseQueueSequentially(this.aPromisesResolveAfterReject).then( function() {
			assert.strictEqual(this.fnExecPromiseQueueSpy.callCount, 3, "then execPromiseQueueSequentially called three times");
			sinon.assert.callOrder(this.fnPromise4, this.fnPromise1);
			assert.strictEqual(sandbox.spyLog.callCount, 1, "then error log called once inside catch block, for the rejected promise without return");
		}.bind(this));
	});

	QUnit.module("Utils.FakePromise", {
		beforeEach: function (assert) {
		},

		afterEach: function () {
		}
	});

	[42, undefined, {then : 42}, {then : function () {}}]
	.forEach(function (vResult) {
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
			.then(function(vValue) {
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

	QUnit.test("when 'then' method throws an exception", function(assert) {
		new Utils.FakePromise()
		.then(function() {
			throw new Error("Error");
		})
		.then(function(vValue) {
			assert.notOk(true, "then the 'then' method shouldn't be called");
		})
		.catch(function(vError) {
			assert.strictEqual(vError.name, "Error", "then the error parameter is passed to the 'catch' method");
		});
	});

	QUnit.module("Utils.getChangeFromChangesMap", {
		beforeEach: function() {
			this.oChange1 = {
				getId: function () {
					return "fileNameChange1";
				}
			};
			this.oChange2 = {
				getId: function () {
					return "fileNameChange2";
				}
			};
			this.oChange3 = {
				getId: function () {
					return "fileNameChange3";
				}
			};
			this.oChange4 = {
				getId: function () {
					return "fileNameChange4";
				}
			};
			this.mChanges = {
				"c1": [this.oChange1, this.oChange2, this.oChange4],
				"c2": [this.oChange3]
			};
		}
	});

	QUnit.test("when called with existing Change keys", function(assert) {
		assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange1.getId()), this.oChange1, "then the correct change is returned");
		assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange2.getId()), this.oChange2, "then the correct change is returned");
		assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange3.getId()), this.oChange3, "then the correct change is returned");
		assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange4.getId()), this.oChange4, "then the correct change is returned");
	});

	QUnit.test("when called with not existing Change keys", function(assert) {
		assert.equal(Utils.getChangeFromChangesMap(this.mChanges, this.oChange1.getId() + "foo"), undefined, "then no change is returned");
	});

	QUnit.module("Utils.buildLrepRootNamespace", {
		beforeEach: function() {
			this.sErrorText = "Error in sap.ui.fl.Utils#buildLrepRootNamespace: ";
			this.sNoBaseIdErrorText = "Error in sap.ui.fl.Utils#buildLrepRootNamespace: for every scenario you need a base ID";
		}
	}, function() {
		QUnit.test("scenario APP_VARIANT: AppVariant", function(assert) {
			this.sErrorText += "in an app variant scenario you additionaly need a project ID";
			var sLrepRootNamespace = "apps/baseId/appVariants/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", "APP_VARIANT", "projectId"), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", "APP_VARIANT", "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for app variants throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", "APP_VARIANT", "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for app variants throws an error"
			);
		});

		QUnit.test("scenario " + sap.ui.fl.Scenario.AdaptationProject + ": Customer adapts existing app", function(assert) {
			this.sErrorText += "in a adaptation project scenario you additionaly need a project ID";
			var sLrepRootNamespace = "apps/baseId/adapt/projectId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", sap.ui.fl.Scenario.AdaptationProject, "projectId"), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", sap.ui.fl.Scenario.AdaptationProject, "projectId");},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for customer adaptations throws an error"
			);
			assert.throws(
				function() {Utils.buildLrepRootNamespace("baseId", sap.ui.fl.Scenario.AdaptationProject, "");},
				Error(this.sErrorText),
				"without project id calling 'buildLrepRootNamespace' for customer adaptations throws an error"
			);
		});

		QUnit.test("scenario " + sap.ui.fl.Scenario.FioriElementsFromScratch + ": Customer adapts new Fiori elements app", function(assert) {
			var sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", sap.ui.fl.Scenario.FioriElementsFromScratch), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", sap.ui.fl.Scenario.FioriElementsFromScratch);},
				Error(this.sNoBaseIdErrorText),
				"without base id calling 'buildLrepRootNamespace' for adaptations on a new app throws an error"
			);
		});

		QUnit.test("scenario " + sap.ui.fl.Scenario.UiAdaptation + ": Customer adapts existing app using RTA", function(assert) {
			var sLrepRootNamespace = "apps/baseId/";
			assert.equal(Utils.buildLrepRootNamespace("baseId", sap.ui.fl.Scenario.UiAdaptation), sLrepRootNamespace, "then the root namespace got build correctly");
			assert.throws(
				function() {Utils.buildLrepRootNamespace("", sap.ui.fl.Scenario.UiAdaptation);},
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
});
