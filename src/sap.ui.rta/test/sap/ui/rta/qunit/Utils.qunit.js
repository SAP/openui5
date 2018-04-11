/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'jquery.sap.global',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/rta/Utils',
	'sap/ui/fl/fieldExt/Access',
	'sap/ui/core/ComponentContainer',
	'sap/m/Label',
	'sap/m/Button',
	'sap/m/Input',
	'sap/ui/layout/form/FormElement',
	'sap/ui/layout/form/SimpleForm',
	'sap/ui/layout/VerticalLayout',
	'sap/uxap/ObjectPageSection',
	'sap/uxap/ObjectPageSubSection',
	'sap/uxap/ObjectPageLayout',
	'sap/uxap/ObjectPageSubSectionLayout',
	'sap/ui/core/Title',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/SmartForm',
	'sap/ui/thirdparty/sinon'
],
function(
	jQuery,
	DesignTime,
	ElementOverlay,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	OverlayUtil,
	Utils,
	Access,
	ComponentContainer,
	Label,
	Button,
	Input,
	FormElement,
	SimpleForm,
	VerticalLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageLayout,
	ObjectPageSubSectionLayout,
	Title,
	Group,
	GroupElement,
	SmartForm,
	sinon
) {
	'use strict';
	QUnit.start();

	var oCompCont = new ComponentContainer().placeAt("test-view");
	var oComp;
	//Create component in init method so that the mockserver is already up. Otherwise the
	//binding does not work.
	sap.ui.getCore().attachInit(function(){
		oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.test",
			id : "Comp1",
			settings : {
				componentData : {
					"showAdaptButton" : true
				}
			}
		});

		oCompCont.setComponent(oComp);
		var oView = sap.ui.getCore().byId("Comp1---idMain1");
		oView.getModel().refresh(true);
	});

	// will render only if SAPUI5 core init is done.
	sap.ui.getCore().applyChanges();

	QUnit.module("Given that a SmartForm with OData Binding is given...", {
	});

	QUnit.test("when getBoundEntityType is called for ", function(assert) {
		//ensure core init with its first rendering is done
		var done = assert.async();
		var fnExecuteTests = function () {
			var oGroupElementWithBinding = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");
			var oGroupElementWithOneUnboundField = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.BoundButton");
			var oGroupElementWithNoBinding = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.BoundButton34");
			var oGroupWithBindingElements = sap.ui.getCore().byId("Comp1---idMain1--Reversal");
			var oGroupWithNoBindingElements = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");

			assert.equal(Utils.getBoundEntityType(oGroupElementWithBinding).name, "Header", "a field with binding then finds the entity type");
			assert.equal(Utils.getBoundEntityType(oGroupElementWithOneUnboundField).name, "Header", "a field with partial binding then finds the entity type");
			assert.equal(Utils.getBoundEntityType(oGroupElementWithNoBinding).name, "Header", "a field no binding then finds the entity type");
			assert.equal(Utils.getBoundEntityType(oGroupWithBindingElements).name, "Header", "a group with binding then finds the entity type");
			assert.equal(Utils.getBoundEntityType(oGroupWithNoBindingElements).name, "Header", "a group no binding then finds the entity type");

			done();
		};

		var oView = sap.ui.getCore().byId("Comp1---idMain1");
		oView.getModel().getMetaModel().loaded().then(function () {
			fnExecuteTests();
		});
	});

	QUnit.module("Extensibility isServiceUpToDate", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();

			this.STUB_EXTENSIBILITY_BUSINESS_CTXT = {
				BusinessContexts : ["some context"],
				ServiceName : "servive name",
				ServiceVersion : "some dummy ServiceVersion"
			};
		},
		afterEach : function(assert) {
			this.sandbox.restore();
		}
	});

	QUnit.test("Given extensibility disabled in the system when isServiceUpToDate is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(false));

		var isServiceOutdatedStub = this.sandbox.stub(Access, "isServiceOutdated");
		var oAnything = {};

		return Utils.isServiceUpToDate(oAnything).then(function(){
			assert.equal(isServiceOutdatedStub.callCount, 0, "then service is not asked to be invalid");
		});

	});

	QUnit.test("Given extensibility enabled and an unbound control when isServiceUpToDate is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		var isServiceOutdatedStub = this.sandbox.stub(Access, "isServiceOutdated");
		var oUnboundControl = new Button({text: "unbound"});

		return Utils.isServiceUpToDate(oUnboundControl).then(function(){
			assert.equal(isServiceOutdatedStub.callCount, 0, "then service is not asked to be invalid");
		});
	});

	QUnit.test("Given extensibility enabled and a bound control and a not outdated service when isServiceUpToDate is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		var isServiceOutdatedStub = this.sandbox.stub(Access, "isServiceOutdated").returns(false);
		var setServiceValidStub = this.sandbox.stub(Access, "setServiceValid");

		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		return Utils.isServiceUpToDate(oBoundControl).then(function(){
			assert.ok(true, "then the service is recognized as up to date");
			assert.equal(isServiceOutdatedStub.callCount, 1, "then service is asked to be invalid");
			assert.equal(setServiceValidStub.callCount, 0, "then service is not unneccessarily set to be valid");
		});

	});

	QUnit.test("Given extensibility enabled and a bound control and an outdated service when isServiceUpToDate is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		this.sandbox.stub(Access, "isServiceOutdated").returns(true);
		var setServiceValidStub = this.sandbox.stub(Access, "setServiceValid");

		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		sap.ui.getCore().getEventBus().subscribe("sap.ui.core.UnrecoverableClientStateCorruption","RequestReload", function(){
			assert.ok(true, "then the UI refresh is requested");
		});
		return Utils.isServiceUpToDate(oBoundControl).then(function(){
			assert.ok(false, "then the service should be recognized as outdated");
		}).catch(function() {
			assert.ok(true, "then the service is recognized as outdated date");
			assert.equal(setServiceValidStub.callCount, 1, "then service is set to be valid again");
		});
	});

	QUnit.test("Given extensibility disabled when isCustomFieldAvailable is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(false));

		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		return Utils.isCustomFieldAvailable(oBoundControl).then(function(vResult){
			assert.strictEqual(vResult, false, "then custom fields is disabled");
		});
	});

	QUnit.test("Given extensibility enabled and a custom field enabled bound control when isCustomFieldAvailable is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		this.sandbox.stub(Access, "getBusinessContexts").returns(
				Promise.resolve(JSON.parse(JSON.stringify(this.STUB_EXTENSIBILITY_BUSINESS_CTXT))));
		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		var that = this;
		return Utils.isCustomFieldAvailable(oBoundControl).then(function(vResult){
			var mExpectedResult = JSON.parse(JSON.stringify(that.STUB_EXTENSIBILITY_BUSINESS_CTXT));
			mExpectedResult.EntityType = "Header";
			assert.deepEqual(vResult, mExpectedResult, "then extensibility business context is enriched with the bound entity type");
		});
	});

	QUnit.test("Given extensibility enabled and unbound control when isCustomFieldAvailable is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));

		return Utils.isCustomFieldAvailable(new Button()).then(function(vResult){
			assert.strictEqual(vResult, false, "then custom fields is disabled");
		});
	});

	QUnit.test("Given extensibility enabled and non custom field enabled bound control when isCustomFieldAvailable is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		this.sandbox.stub(Access, "getBusinessContexts").returns(Promise.resolve());
		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		return Utils.isCustomFieldAvailable(oBoundControl).then(function(vResult){
			assert.strictEqual(vResult, false, "then custom fields is disabled");
		});
	});

	QUnit.test("Given extensibility enabled and custom field logic rejects call when isCustomFieldAvailable is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		this.sandbox.stub(Access, "getBusinessContexts").returns(
				Promise.reject(new Error("some simulated error"))
		);
		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		return Utils.isCustomFieldAvailable(oBoundControl).then(function(vResult){
			assert.strictEqual(vResult, false, "then custom fields is disabled");
		});
	});

	QUnit.test("Given extensibility enabled and custom field logic throws error when isCustomFieldAvailable is called", function(assert) {
		this.sandbox.stub(Utils, "isExtensibilityEnabledInSystem").returns(Promise.resolve(true));
		this.sandbox.stub(Access, "getBusinessContexts").throws(new Error("some simulated error"));
		var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");

		return Utils.isCustomFieldAvailable(oBoundControl).then(function(vResult){
			assert.strictEqual(vResult, false, "then custom fields is disabled");
		});
	});

	QUnit.module("Given that the ObjectPage with overlays is given...", {
		beforeEach : function(assert) {

			//	ObjectPageLayout
			//		ObjectPageSection1
			//			ObjectPageSubSection1
			//				Label1
			//			ObjectPageSubSection2
			//				Label2
			//			ObjectPageSubSection3
			//				Label3

			this.sandbox = sinon.sandbox.create();

			this.oLabel1 = new Label({text: "Label1" });
			this.oLabel2 = new Label({text: "Label2" });
			this.oLabel3 = new Label({text: "Label3" });
			this.oObjectPageSubSection1 = new ObjectPageSubSection({
				title: "objectpageSubSection1",
				blocks: this.oLabel1
			});
			this.oObjectPageSubSection2 = new ObjectPageSubSection({
				title: "objectpageSubSection2",
				blocks: this.oLabel2
			});
			this.oObjectPageSubSection3 = new ObjectPageSubSection({
				title: "objectpageSubSection3",
				blocks: this.oLabel3
			});
			this.oObjectPageSection1 = new ObjectPageSection({
				title:"Personal",
				subSections: [
					this.oObjectPageSubSection1,
					this.oObjectPageSubSection2,
					this.oObjectPageSubSection3
				]
			});
			this.oObjectPageLayout = new ObjectPageLayout({
				subSectionLayout: ObjectPageSubSectionLayout.TitleOnLeft,
				sections: [this.oObjectPageSection1]
			});
			this.oObjectPageLayout.placeAt('test-view');
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oObjectPageLayout
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oObjectPageSection1Overlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);
				this.oObjectPageSubSection1Overlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection1);
				this.oObjectPageSubSection2Overlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection2);
				this.oObjectPageSubSection3Overlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection3);
				this.oLabel1Overlay = OverlayRegistry.getOverlay(this.oLabel1);
				done();
			}.bind(this));
		},

		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oDesignTime.destroy();
			this.sandbox.restore();
		}
	});

	QUnit.test("when DesignTime is created and getFocusableParentOverlay is called", function(assert) {
		this.oObjectPageSection1Overlay.setSelectable(true);
		var oOverlay = Utils.getFocusableParentOverlay(this.oLabel1Overlay);
		assert.strictEqual(oOverlay, this.oObjectPageSection1Overlay,
			"with oLabel1Overlay then oObjectPageSection1Overlay is returned");

		oOverlay = Utils.getFocusableParentOverlay(this.oObjectPageSection1Overlay);
		assert.strictEqual(oOverlay, undefined,
			"with oObjectPageSection1Overlay then 'undefined' is returned because no more selectable parents available");

		oOverlay = Utils.getFocusableParentOverlay();
		assert.strictEqual(oOverlay, undefined,
			"without parameter then 'undefined' is returned");
	});

	QUnit.test("when DesignTime is created and getFirstFocusableDescendantOverlay is called", function(assert) {
		var getFirstDescendantByCondition = this.sandbox.stub(OverlayUtil,
			"getFirstDescendantByCondition").returns(this.oLabel1Overlay);
		var oOverlay = Utils.getFirstFocusableDescendantOverlay(this.oObjectPageSection1Overlay);
		assert.equal(getFirstDescendantByCondition.callCount, 1,
			"then OverlayUtil.getFirstDescendantByCondition function is called once");
		assert.strictEqual(oOverlay, this.oLabel1Overlay,
			"then oLabel1Overlay is returned");
	});

	QUnit.test("when DesignTime is created and getNextFocusableSiblingOverlay is called", function(assert) {
		var getNextSiblingOverlay = this.sandbox.stub(OverlayUtil, "getNextSiblingOverlay")
			.onFirstCall().returns(this.oObjectPageSubSection2Overlay)
			.onSecondCall().returns(this.oObjectPageSubSection3Overlay);
		this.oObjectPageSubSection3Overlay.setSelectable(true);
		var oOverlay = Utils.getNextFocusableSiblingOverlay(this.oObjectPageSubSection1Overlay);
		assert.equal(getNextSiblingOverlay.stub.callCount, 2,
			"then OverlayUtil.getNextSiblingOverlay function is called twice");
		assert.strictEqual(oOverlay, this.oObjectPageSubSection3Overlay,
			"when oObjectPageSubSection1Overlay parameter set then oObjectPageSubSection3Overlay is returned");
	});

	QUnit.test("when DesignTime is created and getPreviousFocusableSiblingOverlay is called", function(assert) {
		var getPreviousSiblingOverlay = this.sandbox.stub(OverlayUtil, "getPreviousSiblingOverlay")
			.onFirstCall().returns(this.oObjectPageSubSection2Overlay)
			.onSecondCall().returns(this.oObjectPageSubSection1Overlay);
		this.oObjectPageSubSection1Overlay.setSelectable(true);
		var oOverlay = Utils.getPreviousFocusableSiblingOverlay(this.oObjectPageSubSection3Overlay);
		assert.equal(getPreviousSiblingOverlay.stub.callCount, 2,
			"then OverlayUtil.getPreviousSiblingOverlay function is called twice");
		assert.strictEqual(oOverlay, this.oObjectPageSubSection1Overlay,
			"when oObjectPageSubSection3Overlay parameter set then oObjectPageSubSection1Overlay is returned");
	});

	// -------------------------- Tests that don't need the runtimeAuthoring page --------------------------

	QUnit.module("Given some dom elements in and out of viewport...", {
		beforeEach: function(assert) {
			if (oCompCont) {
				oCompCont.destroy();
			}

			this.$insideDom = jQuery('<input/>').appendTo('#test-view');
			this.$outsideDom = jQuery('<button/>').appendTo('#test-view');

			this.$insideDom.css("margin-bottom", jQuery("#test-view").get(0).clientHeight);
			this.$insideDom.css("margin-right", jQuery("#test-view").get(0).clientWidth);
			this.$insideDom.css("margin-top", "10px");
		},
		afterEach: function(assert) {
			this.$insideDom.remove();
			this.$outsideDom.remove();
		}
	});

	QUnit.test("when isElementInViewport is called from inside viewport", function(assert) {
		assert.ok(Utils.isElementInViewport(this.$insideDom), "then the function returns true");
		assert.ok(Utils.isElementInViewport(this.$insideDom.get(0)), "then the function returns true");
	});

	QUnit.test("when isElementInViewport is called from outside viewport", function(assert) {
		assert.notOk(Utils.isElementInViewport(this.$outsideDom), "then the function returns false");
		assert.notOk(Utils.isElementInViewport(this.$outsideDom.get(0)), "then the function returns false");
	});

	QUnit.module("Given a sinon sandbox...", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();
		},
		afterEach : function(assert) {
			this.sandbox.restore();
		}
	});

	QUnit.test("when setRtaStyleClassName is called", function(assert) {
		var sExpectedStyleClass = "sapContrast sapContrastPlus";
		Utils._sRtaStyleClassName = "";

		Utils.setRtaStyleClassName("Invalid Layer");
		assert.equal(Utils.getRtaStyleClassName(), "", "then the StyleClass is not set");

		Utils.setRtaStyleClassName("CUSTOMER");
		assert.equal(Utils.getRtaStyleClassName(), sExpectedStyleClass, "then the StyleClass is set");

		Utils.setRtaStyleClassName("USER");
		assert.equal(Utils.getRtaStyleClassName(), "", "then the StyleClass is reset");

		Utils.setRtaStyleClassName("VENDOR");
		assert.equal(Utils.getRtaStyleClassName(), sExpectedStyleClass, "then the StyleClass is set");
	});

	QUnit.module("Given two generic objects...", {
		beforeEach : function(){

			this.oObject1 = {
				function11 : function(){
					return "function11Object1";
				},
				function12 : function(){}
			};

			this.oObject2 = {
				function21 : function(){},
				function11 : function(){
					return "function11Object2";
				}
			};
		}
	});

	QUnit.test("when extendWith is called with a customizer function that always returns true", function(assert){
		var fnCustomizer = function(){
			return true;
		};

		assert.notOk(this.oObject1.function21, "then the object does not have function21");
		Utils.extendWith(this.oObject1, this.oObject2, fnCustomizer);
		assert.ok(this.oObject1.function21, "then the object has been extended to include function21");
		assert.equal(this.oObject1.function11(), "function11Object2", "then function11 from Object2 is now in Object1");
	});

	QUnit.test("when extendWith is called with a customizer function that always returns false", function(assert){
		var fnCustomizer = function(){
			return false;
		};

		var oObject1Before = this.oObject1;
		Utils.extendWith(this.oObject1, this.oObject2, fnCustomizer);
		assert.deepEqual(oObject1Before, this.oObject1, "then the Object was not modified");
	});

	QUnit.test("when mergeWith is called with a customizer function", function(assert){
		var fnCustomizer = function(vDestinationValue, vSourceValue, sProperty, mDestination, mSource){
			return function(){ return "mergedProperty"; };
		};

		assert.equal(this.oObject1.function11(), "function11Object1", "at first the function returns 'function11Object1'");
		Utils.mergeWith(this.oObject1, this.oObject2, fnCustomizer);
		assert.equal(this.oObject1.function11(), "mergedProperty", "then the merged function returns 'mergedProperty'");
	});

	QUnit.test("when omit is called with an object and some properties", function(assert){
		var oSourceObject = {'a' : 1, 'b' : 2, 'c' : 3, 'd' : 4};

		assert.deepEqual(Utils.omit(oSourceObject, ['b', 'd']), {'a' : 1, 'c' : 3}, "then a new object is returned without the properties");
	});

	QUnit.test("when omit is called with an object containing a property with undefined value and the other properties are removed", function(assert){
		var oSourceObject = {'a' : 1, 'b' : undefined, 'c' : 3};

		assert.deepEqual(Utils.omit(oSourceObject, ['a', 'c']), {'b' : undefined}, "then the new object returned has only the property that has undefined value");
	});

	QUnit.test("when omit is called with a deep object and some properties", function(assert){
		var oSourceObject = {'a' : 1, 'b' : { 'd': 4, 'e': 5 }, 'c' : 3};
		var oNewObject = Utils.omit(oSourceObject, ['a', 'c', 'd']);

		assert.deepEqual(oNewObject, {'b' : { 'd': 4, 'e': 5 }},  "then a new object is returned without the properties");

		oSourceObject.b = 0;
		assert.deepEqual(oNewObject.b, { 'd': 4, 'e': 5 }, "then modifying the old object does not change the new object");
	});

	QUnit.done(function() {
		jQuery("#test-view").hide();
	});
});