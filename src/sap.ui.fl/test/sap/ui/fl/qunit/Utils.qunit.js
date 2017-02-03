jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.layout.HorizontalLayout");
jQuery.sap.require("sap.m.Button");

(function (Utils, HorizontalLayout, VerticalLayout, Button) {

	var sandbox = sinon.sandbox.create();

	var aControls = [];
	QUnit.module("sap.ui.fl.Utils", {
		beforeEach: function () {
		},
		afterEach: function () {
			aControls.forEach(function (oControl) {
				oControl.destroy();
			})
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
		var oGetComponentIdForControlStub = this.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = this.stub(Utils, "_getComponent").returns(oComponentMock);

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
		var oGetComponentIdForControlStub = this.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = this.stub(Utils, "_getComponent").returns(oComponentMock);

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
		var oGetComponentIdForControlStub = this.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = this.stub(Utils, "_getComponent").returns(oSmartTemplateCompMock);

		assert.equal(Utils.getComponentClassName(oControl), sAppVariantName);

		assert.ok(oGetComponentIdForControlStub.called);
		assert.ok(oGetComponentStub.called);

		oGetComponentIdForControlStub.restore();
		oGetComponentStub.restore();
	});


	QUnit.test("getCurrentLayer shall return sap-ui-layer parameter", function (assert) {
		var oUriParams = {
			mParams: {
				"sap-ui-layer": [
					"VENDOR"
				]
			}
		};
		var getUriParametersStub = this.stub(Utils, "_getUriParameters").returns(oUriParams);
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
		var getUriParametersStub = this.stub(Utils, "_getUriParameters").returns(oUriParams);
		var sLayer = Utils.getCurrentLayer(true);
		assert.equal(sLayer, "USER");
		assert.ok(true);
		getUriParametersStub.restore();
	});

	QUnit.test("getCurrentLayer shall return default CUSTOMER layer ", function (assert) {
		var oUriParams = {
			mParams: {}
		};
		var getUriParametersStub = this.stub(Utils, "_getUriParameters").returns(oUriParams);
		var sLayer = Utils.getCurrentLayer(false);
		assert.equal(sLayer, "CUSTOMER");
		assert.ok(true);
		getUriParametersStub.restore();
	});

	QUnit.test("doesSharedVariantRequirePackageCustomer", function (assert) {
		var bDoesSharedVariantRequirePackage;
		this.stub(Utils, "getCurrentLayer").returns("CUSTOMER");

		// Call CUT
		bDoesSharedVariantRequirePackage = Utils.doesSharedVariantRequirePackage();

		assert.strictEqual(bDoesSharedVariantRequirePackage, false);
		Utils.getCurrentLayer.restore();
	});

	QUnit.test("doesSharedVariantRequirePackageCustomerBase", function (assert) {
		var bDoesSharedVariantRequirePackage;
		this.stub(Utils, "getCurrentLayer").returns("CUSTOMER_BASE");

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
		var getUriParametersStub = this.stub(Utils, "_getUriParameters").returns(oUriParams);
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
		this.stub(Utils, "_getOwnerIdForControl").returns('Rumpelstilzchen');
		// Call CUT
		sComponentId = Utils._getComponentIdForControl(null);
		assert.equal(sComponentId, 'Rumpelstilzchen');
		Utils._getOwnerIdForControl.restore();
	});

	QUnit.test("_getComponentIdForControl shall walk up the control tree until it finds a component id", function (assert) {
		var sComponentId, oControl1, oControl2, oControl3, f_getOwnerIdForControl;
		oControl1 = {};
		oControl2 = {
			getParent: this.stub().returns(oControl1)
		};
		oControl3 = {
			getParent: this.stub().returns(oControl2)
		};

		f_getOwnerIdForControl = this.stub(Utils, "_getOwnerIdForControl");
		f_getOwnerIdForControl.withArgs(oControl3).returns("");
		f_getOwnerIdForControl.withArgs(oControl2).returns("");
		f_getOwnerIdForControl.withArgs(oControl1).returns("sodimunk");

		// Call CUT
		sComponentId = Utils._getComponentIdForControl(oControl3);

		assert.equal(sComponentId, 'sodimunk');
		sinon.assert.calledThrice(f_getOwnerIdForControl);
		Utils._getOwnerIdForControl.restore();
	});

	QUnit.test("_getComponentIdForControl shall stop walking up the control tree after 100 iterations", function (assert) {
		var sComponentId, aControls, i, f_getOwnerIdForControl, previous;
		aControls = [];
		for (i = 0; i < 200; i++) {
			previous = (i >= 1) ? aControls[i - 1] : null;
			(function (previous, i) {
				aControls[i] = {
					getParent: function () {
						return previous
					}
				}
			})(previous, i);
		}

		f_getOwnerIdForControl = this.stub(Utils, "_getOwnerIdForControl").returns("");

		// Call CUT
		sComponentId = Utils._getComponentIdForControl(aControls[199]);

		assert.strictEqual(sComponentId, '');
		sinon.assert.callCount(f_getOwnerIdForControl, 100);
		f_getOwnerIdForControl.restore();
	});

	QUnit.test("_getComponentName shall return the component name for a component", function (assert) {
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
		var sComponentName = Utils._getComponentName(oComponent);
		assert.equal(sComponentName, 'testcomponent.Component');

		// 2. check that .Component is added if the actual component name has no .Component suffix
		oMetadata._sComponentName = 'testcomponent';
		sComponentName = Utils._getComponentName(oComponent);
		assert.equal(sComponentName, 'testcomponent.Component');

		//Commented out since method _getComponentName is always called from getComponentClassName and this method already includes the check for smart templates.
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
		 sComponentName = Utils._getComponentName(oComponent);
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
		fStub = this.stub(Utils, "_getXSRFTokenFromModel").returns("abc");

		// Call CUT
		sXSRFToken = Utils.getXSRFTokenFromControl(oControl);

		assert.strictEqual(sXSRFToken, 'abc');
		fStub.restore();
	});

	QUnit.test("_getXSRFTokenFromModel shall return an empty string if the retrieval failed", function (assert) {
		var oModel, sXSRFToken, fStub;
		oModel = {};

		// Call CUT
		sXSRFToken = Utils._getXSRFTokenFromModel(oModel);

		assert.strictEqual(sXSRFToken, '');
	});

	QUnit.test("_getXSRFTokenFromModel shall return the XSRF Token from the OData model", function (assert) {
		var oModel, sXSRFToken, fStub;
		oModel = {
			getHeaders: function () {
				return {
					"x-csrf-token": "gungalord"
				}
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
		var getUriParametersStub = this.stub(Utils, "_getUriParameters").returns(oUriParams);
		var bIsHotfix = Utils.isHotfixMode();
		assert.strictEqual(bIsHotfix, true);
		getUriParametersStub.restore();
	});

	QUnit.test("isHotfixMode shall return false if there is no hotfix url parameter", function (assert) {
		var oUriParams = {
			mParams: {}
		};
		var getUriParametersStub = this.stub(Utils, "_getUriParameters").returns(oUriParams);
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
		var oGetComponentIdForControlStub = this.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = this.stub(Utils, "_getComponent").returns(oComponentMock);

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
		var oGetComponentIdForControlStub = this.stub(Utils, "_getComponentIdForControl").returns("testId");
		var oGetComponentStub = this.stub(Utils, "_getComponent").returns(oComponentMock);

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

	QUnit.test("getAppComponentForControl can determine the smart template special case", function () {
		var oComponent = new sap.ui.core.UIComponent();
		var oAppComponent = new sap.ui.core.UIComponent();
		oComponent.getAppComponent = function () {
			return oAppComponent;
		};

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oAppComponent);
	});

	QUnit.test("getAppComponentForControl can determine that the passed control is already the app component", function () {
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

	QUnit.test("getAppComponentForControl can determine the OVP special case", function () {
		var oComponent = new sap.ui.core.UIComponent();
		var oAppComponent = new sap.ui.core.UIComponent();
		oComponent.oComponentData = {appComponent: oAppComponent};

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oAppComponent);
	});

	QUnit.test("getAppComponentForControl returns the component if no Manifest is available", function () {
		var oComponent = new sap.ui.core.UIComponent();

		var oDeterminedAppComponent = Utils.getAppComponentForControl(oComponent);

		assert.equal(oDeterminedAppComponent, oComponent);
	});

	QUnit.test("getAppComponentForControl searches further for the app component if the passed component is not of the type application", function () {
		var oComponent = new sap.ui.core.UIComponent();
		var oParentComponent = {};
		var oSapAppEntry = {
			type: "definitelyNotAnApplication"
		};

		oComponent.getManifestEntry = function (sParameter) {
			return sParameter === "sap.app" ? oSapAppEntry : undefined;
		};

		var fnOriginal = Utils.getAppComponentForControl;
		var bCalled = false;

		var oStub = this.stub(Utils, "getAppComponentForControl");
		var oGetComponentForControlStub = this.stub(Utils, "_getComponentForControl").returns(oParentComponent);

		var oDeterminedAppComponent = Utils._getAppComponentForComponent(oComponent);

		assert.ok(oStub.calledOnce, "the function was called once");
		assert.equal(oStub.firstCall.args[0], oParentComponent, "the function was called with the parent component the first time");
	});

	QUnit.test("getAppComponentForControl returns the component if the passed component is of the type application", function () {
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
				}
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

			var oGetComponentForControlStub = this.stub(Utils, "_getComponentForControl").onFirstCall().returns(oComponentMockComp).onSecondCall().returns(oComponentMockApp);

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

		var oGetComponentForControlStub = this.stub(Utils, "_getComponentForControl").onFirstCall().returns(oComponentMockComp).onSecondCall().returns(null);

		assert.equal(Utils.getComponentClassName(oControl), "", "Check that empty string is returned.");

		oGetComponentForControlStub.stub.restore();
	});

	QUnit.module("checkControlId and hasLocalIdSuffix", {
		beforeEach: function () {
			this.oComponent = new sap.ui.core.UIComponent();
			this.oControlWithGeneratedId = new sap.m.Button();
			this.oControlWithPrefix = new sap.m.Button(this.oComponent.createId("myButton"));
			this.oControlWithoutPrefix = new sap.m.Button("myButtonWithoutAppPrefix");
		},

		afterEach: function () {
			this.oComponent.destroy();
			this.oControlWithGeneratedId.destroy();
			this.oControlWithPrefix.destroy();
			this.oControlWithoutPrefix.destroy();
		}
	});

	QUnit.test("checkControlId shall return false if the id was generated", function (assert) {
		assert.equal(Utils.checkControlId(this.oControlWithGeneratedId, this.oComponent), false);
	});

	QUnit.test("checkControlId shall throw an error if the id was generated", function (assert) {
		var spyLog = this.spy(jQuery.sap.log, "warning");
		Utils.checkControlId(this.oControlWithGeneratedId, this.oComponent);
		assert.ok(spyLog.calledOnce);
	});

	QUnit.test("checkControlId does not throw an error if the id was generated but the logging was suppressed", function (assert) {
		var spyLog = this.spy(jQuery.sap.log, "warning");
		Utils.checkControlId(this.oControlWithGeneratedId, this.oComponent, true);
		assert.equal(spyLog.callCount, 0);
	});

	QUnit.test("checkControlId shall return true if control id was not generated", function (assert) {
		assert.equal(Utils.checkControlId(this.oControlWithPrefix, this.oComponent), true);
	});

	QUnit.test("checkControlId shall return true if the id is a stable Id not containing the ComponentId", function (assert) {
		assert.equal(Utils.checkControlId(this.oControlWithoutPrefix, this.oComponent), true);
	});

	QUnit.test("hasLocalIdSuffix can determine that a control has a local id", function(assert) {
		assert.ok(Utils.hasLocalIdSuffix(this.oControlWithPrefix, this.oComponent));
	});

	QUnit.test("hasLocalIdSuffix can determine that a control has no local id", function(assert) {
		assert.notOk(Utils.hasLocalIdSuffix(this.oControlWithoutPrefix, this.oComponent));
	});

	QUnit.test("hasLocalIdSuffix returns false if no app component can be found", function(assert) {
		assert.notOk(Utils.hasLocalIdSuffix(this.oControlWithoutPrefix, this.oComponent));
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
			sandbox.stub(Utils, "_getComponentName").returns(this.sComponentName);
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

}(sap.ui.fl.Utils, sap.ui.layout.HorizontalLayout, sap.ui.layout.VerticalLayout, sap.m.Button));
