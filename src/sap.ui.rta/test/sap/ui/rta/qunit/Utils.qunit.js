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

	//will render only if SAPUI5 core init is done.
	sap.ui.getCore().applyChanges();

	QUnit.module("Given that a SmartForm with OData Binding is given...", {
		beforeEach : function(assert) {
		},
		afterEach : function(assert) {
		}
	});

	QUnit.test("when getLabelForElement is called with a function", function(assert) {
		var oPlainObject =  {};
		var fnFunction = function() {return "functionReturn";};
		assert.equal(Utils.getLabelForElement(oPlainObject, fnFunction), "functionReturn", "then it executes the function");
	});

	QUnit.test("when getLabelForElement is called with a label", function(assert) {
		var oPlainObject = new Label("id", {text: "label"});
		assert.equal(Utils.getLabelForElement(oPlainObject), "label", "then it returns the label (getText())");
	});

	QUnit.test("when getLabelForElement is called with a Button", function(assert) {
		var oButton = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.BoundButton");
		assert.equal(Utils.getLabelForElement(oButton), "One-Bound-Field", "then it returns the label (getLabelText())");
	});

	QUnit.test("when getLabelForElement is called with a Group", function(assert) {
		var oGroupElement = sap.ui.getCore().byId("__group0");
		assert.equal(Utils.getLabelForElement(oGroupElement), "Group without stable Id", "then it returns the label (getLabel())");
	});

	QUnit.test("when getLabelForElement is called with a SimpleForm", function(assert) {
		var oSimpleForm = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");
		assert.equal(Utils.getLabelForElement(oSimpleForm), "SimpleForm with titles", "then it returns the label (getTitle())");
	});

	QUnit.test("when getLabelForElement is called with a Label without text property set", function(assert) {
		var oPlainObject =  new Label("labelId");
		assert.equal(Utils.getLabelForElement(oPlainObject), "labelId", "then it returns the Id (getId())");
	});

	QUnit.test("when getLabelForElement is called with a form element (withouth getLabelText) with Label as control", function(assert) {
		var oFormElementWithLabel =  new FormElement({ label : new Label({text: "label"})});
		assert.equal(Utils.getLabelForElement(oFormElementWithLabel), "label", "then it returns the labels text (getLabel().getText())");
	});

	QUnit.test("when getLabelForElement is called with a component that does not behave like a label", function(assert) {
		var oPlainObject =  {};
		assert.ok(Utils.getLabelForElement(oPlainObject) === undefined, "then it returns undefined");
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

	QUnit.done(function( details ) {
		// If coverage is reuqested, remove the view to not overlap the coverage result
		if (QUnit.config.coverage == true && details.failed === 0) {
			jQuery("#test-view").hide();
			oCompCont.getComponentInstance().destroy();
		}
	});

	QUnit.module("Given that the getRelevantContainerDesigntimeMetadata method is called on an overlay", {
		beforeEach : function(assert) {

			this.oTitle0 = new Title({id : "Title0"});
			this.oLabel0 = new Label({id : "Label0"});
			this.oInput0 = new Input({id : "Input0"});
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("test-view");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var that = this;
			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oSimpleFormOverlay = OverlayRegistry.getOverlay(that.oSimpleForm);
				that.oFormContainerOverlay = OverlayRegistry.getOverlay(that.oFormContainer);
				done();
			});
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has no publicParentAggregationOverlay", function(assert) {
		this.oSimpleFormOverlay.setDesignTimeMetadata({
			actions : {}
		});
		assert.notOk(Utils.getRelevantContainerDesigntimeMetadata(this.oFormContainerOverlay), "then it returns false");
	});

	QUnit.module("Given that the getRelevantContainerDesigntimeMetadata method is called on an overlay", {
		beforeEach : function(assert) {

			this.oSmartGroup = new Group("group");
			this.oSmartForm = new SmartForm("SmartForm", {
				groups : [this.oSmartGroup]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oSmartForm]
			}).placeAt("test-view");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var that = this;
			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oSmartFormOverlay = OverlayRegistry.getOverlay(that.oSmartForm);
				that.oGroupOverlay = OverlayRegistry.getOverlay(that.oSmartGroup);
				done();
			});
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has publicParentAggregationOverlay", function(assert) {
		assert.ok(Utils.getRelevantContainerDesigntimeMetadata(this.oSmartFormOverlay), "then there is a publicParent designtimemetadata");
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

	QUnit.test("when setRtaStyleClassName is called in sap_belize", function(assert) {
		var sExpectedStyleClass = "sapContrast";
		this.sandbox.stub(sap.ui.getCore().getConfiguration(), "getTheme").returns("sap_belize");
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

	QUnit.test("when setRtaStyleClassName is called in sap_belize_plus", function(assert) {
		var sExpectedStyleClass = "sapContrastPlus";
		this.sandbox.stub(sap.ui.getCore().getConfiguration(), "getTheme").returns("sap_belize_plus");
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
});