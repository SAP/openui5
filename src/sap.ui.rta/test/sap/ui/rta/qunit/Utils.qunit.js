/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/util/restricted/_omit",
	"sap/m/Button",
	"sap/m/Label",
	"sap/ui/core/Control",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/BindingsExtractor",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/uxap/library",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection"
], function(
	RtaQunitUtils,
	_omit,
	Button,
	Label,
	Control,
	DesignTime,
	OverlayRegistry,
	OverlayUtil,
	FieldExtensibility,
	Layer,
	FlexUtils,
	BindingsExtractor,
	Utils,
	jQuery,
	sinon,
	uxapLibrary,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection
) {
	"use strict";

	// shortcut for sap.uxap.ObjectPageSubSectionLayout
	var ObjectPageSubSectionLayout = uxapLibrary.ObjectPageSubSectionLayout;

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a test app...", {
		before: function() {
			this.oCompContPromise = RtaQunitUtils.renderRuntimeAuthoringAppAt("qunit-fixture");
			return this.oCompContPromise.then(function() {
				this.oView = sap.ui.getCore().byId("Comp1---idMain1");
				this.oView.getModel().refresh(true);
				sap.ui.getCore().applyChanges();
				return this.oView.getModel().getMetaModel().loaded();
			}.bind(this));
		},
		after: function() {
			this.oView.destroy();
			this.oCompContPromise = undefined;
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("Given extensibility disabled in the system when isServiceUpToDate is called", function(assert) {
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(false);

			var isServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated");
			var oAnything = {};

			return Utils.isServiceUpToDate(oAnything).then(function() {
				assert.equal(isServiceOutdatedStub.callCount, 0, "then service is not asked to be invalid");
			});
		});

		QUnit.test("Given extensibility enabled and an unbound control when isServiceUpToDate is called", function(assert) {
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			var isServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated");
			var oUnboundControl = new Button({text: "unbound"});

			return Utils.isServiceUpToDate(oUnboundControl).then(function() {
				assert.equal(isServiceOutdatedStub.callCount, 0, "then service is not asked to be invalid");
			});
		});

		QUnit.test("Given extensibility enabled and a bound control and a not outdated service when isServiceUpToDate is called", function(assert) {
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			var isServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(false);
			var oSetServiceValidStub = sandbox.stub(FieldExtensibility, "setServiceValid");

			var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.ExpirationDate");

			return Utils.isServiceUpToDate(oBoundControl).then(function() {
				assert.ok(true, "then the service is recognized as up to date");
				assert.equal(isServiceOutdatedStub.callCount, 1, "then service is asked to be invalid");
				assert.equal(oSetServiceValidStub.callCount, 0, "then service is not unneccessarily set to be valid");
			});
		});

		QUnit.test("Given extensibility enabled and a bound control without serviceurl on model when 'isServiceUpToDate' is called", function(assert) {
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			var isServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(false);
			var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.ExpirationDate");
			var oBoundModel = oBoundControl.getModel();
			var sServiceUrl = oBoundModel.sServiceUrl;
			delete oBoundModel.sServiceUrl;
			return Utils.isServiceUpToDate(oBoundControl).then(function() {
				assert.ok(true, "then the service is recognized as up to date");
				assert.equal(isServiceOutdatedStub.callCount, 0, "then service is asked to be invalid");
				oBoundModel.sServiceUrl = sServiceUrl;
			});
		});

		QUnit.test("Given extensibility enabled and a bound control and an outdated service when isServiceUpToDate is called", function(assert) {
			assert.expect(2);
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(true);
			var oSetServiceValidStub = sandbox.stub(FieldExtensibility, "setServiceValid");

			var oBoundControl = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.ExpirationDate");

			sap.ui.getCore().getEventBus().subscribe("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", function() {
				assert.ok(true, "then the UI refresh is requested");
			});
			return Utils.isServiceUpToDate(oBoundControl).then(function() {
				assert.equal(oSetServiceValidStub.callCount, 1, "then service is set to be valid again");
			});
		});
	});

	// -------------------------- Tests that don't need the runtimeAuthoring page --------------------------
	QUnit.module("Given that the ObjectPage with overlays is given...", {
		beforeEach: function(assert) {
			//	ObjectPageLayout
			//		ObjectPageSection1
			//			ObjectPageSubSection1
			//				Label1
			//			ObjectPageSubSection2
			//				Label2
			//			ObjectPageSubSection3
			//				Label3

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
				title: "Personal",
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
			this.oObjectPageLayout.placeAt("qunit-fixture");
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

		afterEach: function () {
			this.oObjectPageLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
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
			var getFirstDescendantByCondition = sandbox.stub(OverlayUtil,
				"getFirstDescendantByCondition").returns(this.oLabel1Overlay);
			var oOverlay = Utils.getFirstFocusableDescendantOverlay(this.oObjectPageSection1Overlay);
			assert.equal(getFirstDescendantByCondition.callCount, 1,
				"then OverlayUtil.getFirstDescendantByCondition function is called once");
			assert.strictEqual(oOverlay, this.oLabel1Overlay,
				"then oLabel1Overlay is returned");
		});

		QUnit.test("when DesignTime is created and getLastFocusableDescendantOverlay is called", function(assert) {
			var getLastDescendantByCondition = sandbox.stub(OverlayUtil,
				"getLastDescendantByCondition").returns(this.oLabel3Overlay);
			var oOverlay = Utils.getLastFocusableDescendantOverlay(this.oObjectPageSection1Overlay);
			assert.equal(getLastDescendantByCondition.callCount, 1,
				"then OverlayUtil.getLastDescendantByCondition function is called once");
			assert.strictEqual(oOverlay, this.oLabel3Overlay,
				"then oLabel3Overlay is returned");
		});

		QUnit.test("when DesignTime is created and getNextFocusableSiblingOverlay is called", function(assert) {
			var getNextSiblingOverlay = sandbox.stub(OverlayUtil, "getNextSiblingOverlay")
				.onFirstCall().returns(this.oObjectPageSubSection2Overlay)
				.onSecondCall().returns(this.oObjectPageSubSection3Overlay);
			this.oObjectPageSubSection3Overlay.setSelectable(true);
			var oOverlay = Utils.getNextFocusableSiblingOverlay(this.oObjectPageSubSection1Overlay);
			assert.equal(getNextSiblingOverlay.callCount, 2,
				"then OverlayUtil.getNextSiblingOverlay function is called twice");
			assert.strictEqual(oOverlay, this.oObjectPageSubSection3Overlay,
				"when oObjectPageSubSection1Overlay parameter set then oObjectPageSubSection3Overlay is returned");
		});

		QUnit.test("when DesignTime is created and getPreviousFocusableSiblingOverlay is called", function(assert) {
			var getPreviousSiblingOverlay = sandbox.stub(OverlayUtil, "getPreviousSiblingOverlay")
				.onFirstCall().returns(this.oObjectPageSubSection2Overlay)
				.onSecondCall().returns(this.oObjectPageSubSection1Overlay);
			this.oObjectPageSubSection1Overlay.setSelectable(true);
			var oOverlay = Utils.getPreviousFocusableSiblingOverlay(this.oObjectPageSubSection3Overlay);
			assert.equal(getPreviousSiblingOverlay.callCount, 2,
				"then OverlayUtil.getPreviousSiblingOverlay function is called twice");
			assert.strictEqual(oOverlay, this.oObjectPageSubSection1Overlay,
				"when oObjectPageSubSection3Overlay parameter set then oObjectPageSubSection1Overlay is returned");
		});
	});


	QUnit.module("Given an ObjectPageLayout with Overlays created, but all except for the button overlays are not selectable", {
		beforeEach: function(assert) {
			var fnDone = assert.async();

			//		Layout0
			//			Section0
			//				SubSection0
			//					Button0
			//			Section1
			//				SubSection1
			//					Button1
			//					Button4 -- different aggregation, but invisible
			//					Button2 -- different Aggregation
			//				SubSection2
			//					Button3

			this.oButton0 = new Button("button0", {text: "button0"});
			this.oButton1 = new Button("button1", {text: "button1"});
			this.oButton2 = new Button("button2", {text: "button2"});
			this.oButton3 = new Button("button3", {text: "button3"});
			this.oButton4 = new Button("button4", {text: "button4"});
			this.oSubSection0 = new ObjectPageSubSection("subsection0", {
				blocks: [this.oButton0]
			});
			this.oSubSection1 = new ObjectPageSubSection("subsection1", {
				blocks: [this.oButton1],
				moreBlocks: [this.oButton4],
				actions: [this.oButton2]
			});
			this.oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [this.oButton3]
			});
			this.oSection0 = new ObjectPageSection("section0", {
				subSections: [this.oSubSection0]
			});
			this.oSection1 = new ObjectPageSection("section1", {
				subSections: [this.oSubSection1, this.oSubSection2]
			});
			this.oLayout0 = new ObjectPageLayout("layout0", {
				sections: [this.oSection0, this.oSection1]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout0]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay0 = OverlayRegistry.getOverlay(this.oLayout0);
				this.oSectionOverlay0 = OverlayRegistry.getOverlay(this.oSection0);
				this.oSectionOverlay1 = OverlayRegistry.getOverlay(this.oSection1);
				this.oSubSectionOverlay0 = OverlayRegistry.getOverlay(this.oSubSection0);
				this.oSubSectionOverlay1 = OverlayRegistry.getOverlay(this.oSubSection1);
				this.oSubSectionOverlay2 = OverlayRegistry.getOverlay(this.oSubSection2);
				this.oButtonOverlay0 = OverlayRegistry.getOverlay(this.oButton0);
				this.oButtonOverlay1 = OverlayRegistry.getOverlay(this.oButton1);
				this.oButtonOverlay2 = OverlayRegistry.getOverlay(this.oButton2);
				this.oButtonOverlay3 = OverlayRegistry.getOverlay(this.oButton3);
				this.oButtonOverlay4 = OverlayRegistry.getOverlay(this.oButton4);
				this.oLayoutOverlay0.setSelectable(false);
				this.oSectionOverlay0.setSelectable(false);
				this.oSectionOverlay1.setSelectable(false);
				this.oSubSectionOverlay0.setSelectable(false);
				this.oSubSectionOverlay1.setSelectable(false);
				this.oSubSectionOverlay2.setSelectable(false);
				this.oButtonOverlay0.setSelectable(true);
				this.oButtonOverlay1.setSelectable(true);
				this.oButtonOverlay2.setSelectable(true);
				this.oButtonOverlay3.setSelectable(true);
				this.oButtonOverlay4.setSelectable(true);
				fnDone();
			}.bind(this));
		},
		afterEach: function () {
			this.oLayout0.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when the function for the next or previous sibling overlay is called", function(assert) {
			assert.equal(Utils.getNextFocusableSiblingOverlay(this.oButtonOverlay1).getId(), this.oButtonOverlay2.getId(), "the next sibling gets selected in another aggregation");
			assert.equal(Utils.getNextFocusableSiblingOverlay(this.oButtonOverlay0).getId(), this.oButtonOverlay1.getId(), "the next sibling gets selected in same aggregation with another parent");
			assert.equal(Utils.getNextFocusableSiblingOverlay(this.oButtonOverlay2).getId(), this.oButtonOverlay3.getId(), "the next sibling gets selected in another aggregation with another parent");
			assert.equal(Utils.getNextFocusableSiblingOverlay(this.oButtonOverlay3), undefined, "the last overlay has no next sibling");
			assert.equal(Utils.getPreviousFocusableSiblingOverlay(this.oButtonOverlay2).getId(), this.oButtonOverlay1.getId(), "the previous sibling gets selected in another aggregation");
			assert.equal(Utils.getPreviousFocusableSiblingOverlay(this.oButtonOverlay1).getId(), this.oButtonOverlay0.getId(), "the previous sibling gets selected in same aggregation with another parent");
			assert.equal(Utils.getPreviousFocusableSiblingOverlay(this.oButtonOverlay3).getId(), this.oButtonOverlay2.getId(), "the next sibling gets selected in another aggregation with another parent");
			assert.equal(Utils.getPreviousFocusableSiblingOverlay(this.oButtonOverlay0), undefined, "the first overlay has no previous sibling");
		});
	});

	QUnit.module("Given some dom elements in and out of viewport...", {
		beforeEach: function() {
			this.$insideDom = jQuery("<input>").appendTo("#qunit-fixture");
			this.$outsideDom = jQuery("<button></button>").appendTo("#qunit-fixture");

			this.$insideDom.css("margin-bottom", jQuery("#qunit-fixture").get(0).clientHeight);
			this.$insideDom.css("margin-right", jQuery("#qunit-fixture").get(0).clientWidth);
			this.$insideDom.css("margin-top", "10px");
		},
		afterEach: function() {
			this.$insideDom.remove();
			this.$outsideDom.remove();
		}
	}, function () {
		QUnit.test("when isElementInViewport is called from inside viewport", function(assert) {
			assert.ok(Utils.isElementInViewport(this.$insideDom), "then the function returns true");
			assert.ok(Utils.isElementInViewport(this.$insideDom.get(0)), "then the function returns true");
		});

		QUnit.test("when isElementInViewport is called from outside viewport", function(assert) {
			assert.notOk(Utils.isElementInViewport(this.$outsideDom), "then the function returns false");
			assert.notOk(Utils.isElementInViewport(this.$outsideDom.get(0)), "then the function returns false");
		});
	});

	QUnit.module("setRtaStyleClassName", function () {
		QUnit.test("when setRtaStyleClassName is called", function(assert) {
			var sExpectedStyleClass = "sapUiRTABorder";
			Utils._sRtaStyleClassName = "";

			Utils.setRtaStyleClassName("Invalid Layer");
			assert.equal(Utils.getRtaStyleClassName(), "", "then the StyleClass is not set");

			Utils.setRtaStyleClassName(Layer.CUSTOMER);
			assert.equal(Utils.getRtaStyleClassName(), sExpectedStyleClass, "then the StyleClass is set");

			Utils.setRtaStyleClassName(Layer.USER);
			assert.equal(Utils.getRtaStyleClassName(), "", "then the StyleClass is reset");

			Utils.setRtaStyleClassName(Layer.VENDOR);
			assert.equal(Utils.getRtaStyleClassName(), sExpectedStyleClass, "then the StyleClass is set");
		});
	});

	QUnit.module("openRemoveConfirmationDialog", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the dialog gets closed", function(assert) {
			var done = assert.async();
			Utils.openRemoveConfirmationDialog()
			.then(function(bResult) {
				assert.notOk(jQuery(".sapUiRtaConfirmationDialog").get(0), "the dialog was destroyed");
				assert.equal(bResult, true, "the function resolves with 'true' as result");
				done();
			});

			setTimeout(function() {
				assert.ok(jQuery(".sapUiRtaConfirmationDialog").get(0), "the dialog is available");
				sap.ui.getCore().byId(jQuery(".sapUiRtaConfirmationDialogRemoveButton")[0].id).firePress();
			}, 100);
		});

		QUnit.test("when the dialog gets cancelled", function(assert) {
			var done = assert.async();
			Utils.openRemoveConfirmationDialog()
			.then(function(bResult) {
				assert.notOk(jQuery(".sapUiRtaConfirmationDialog").get(0), "the dialog was destroyed");
				assert.equal(bResult, false, "the function resolves with 'false' as result");
				done();
			});

			setTimeout(function() {
				assert.ok(jQuery(".sapUiRtaConfirmationDialog").get(0), "the dialog is available");
				sap.ui.getCore().byId(jQuery(".sapUiRtaConfirmationDialogCancelButton")[0].id).firePress();
			}, 100);
		});
	});

	QUnit.module("Given two generic objects...", {
		beforeEach: function() {
			this.oObject1 = {
				function11: function() {
					return "function11Object1";
				},
				function12: function() {}
			};

			this.oObject2 = {
				function21: function() {},
				function11: function() {
					return "function11Object2";
				}
			};
		}
	}, function () {
		QUnit.test("when extendWith is called with a customizer function that always returns true", function(assert) {
			var fnCustomizer = function() {
				return true;
			};

			assert.notOk(this.oObject1.function21, "then the object does not have function21");
			Utils.extendWith(this.oObject1, this.oObject2, fnCustomizer);
			assert.ok(this.oObject1.function21, "then the object has been extended to include function21");
			assert.equal(this.oObject1.function11(), "function11Object2", "then function11 from Object2 is now in Object1");
		});

		QUnit.test("when extendWith is called with a customizer function that always returns false", function(assert) {
			var fnCustomizer = function() {
				return false;
			};

			var oObject1Before = this.oObject1;
			Utils.extendWith(this.oObject1, this.oObject2, fnCustomizer);
			assert.deepEqual(oObject1Before, this.oObject1, "then the Object was not modified");
		});
	});

	// One model with EntityType01 and EntityType02 (default) + one i18n model ("i18n")
	QUnit.module("Given a complex test view with oData Model...", {
		beforeEach: function() {
			this.oSource = new Label({text: "Label1" });
			this.oTarget = new Label({text: "Label2" });
		},

		afterEach: function () {
			this.oSource.destroy();
			this.oTarget.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("Given checkSourceTargetBindingCompatibility is called with source control without bindings", function(assert) {
			var sBindingContextPath = "/fakeBindingContext";
			var mBindingsCollection = {
				bindingPaths: [],
				bindingContextPaths: [sBindingContextPath]
			};
			sandbox.stub(BindingsExtractor, "collectBindingPaths")
				.callThrough()
				.withArgs(this.oSource, undefined)
				.returns(mBindingsCollection);
			sandbox.stub(BindingsExtractor, "getBindingContextPath")
				.withArgs(this.oSource).returns(sBindingContextPath)
				.withArgs(this.oTarget).returns(sBindingContextPath);
			assert.strictEqual(
				Utils.checkSourceTargetBindingCompatibility(this.oSource, this.oTarget), true,
				"then bindings are compatible");
		});

		QUnit.test("Given checkSourceTargetBindingCompatibility is called with compatible controls", function(assert) {
			var sBindingContextPath = "/fakeBindingContext";
			var mBindingsCollection = {
				bindingPaths: ["fakeBindingProperty"],
				bindingContextPaths: [sBindingContextPath]
			};
			sandbox.stub(BindingsExtractor, "collectBindingPaths")
				.callThrough()
				.withArgs(this.oSource, undefined)
				.returns(mBindingsCollection);
			sandbox.stub(BindingsExtractor, "getBindingContextPath")
				.withArgs(this.oSource).returns(sBindingContextPath)
				.withArgs(this.oTarget).returns(sBindingContextPath);
			assert.strictEqual(
				Utils.checkSourceTargetBindingCompatibility(this.oSource, this.oTarget), true,
				"then bindings are compatible");
		});

		QUnit.test("Given checkSourceTargetBindingCompatibility is called with incompatible controls", function(assert) {
			var	sBindingContextPath = "/fakeBindingContext";
			var mBindingsCollection = {
				bindingPaths: ["fakeBindingProperty"],
				bindingContextPaths: [sBindingContextPath]
			};
			sandbox.stub(BindingsExtractor, "collectBindingPaths")
				.callThrough()
				.withArgs(this.oSource, undefined)
				.returns(mBindingsCollection);
			sandbox.stub(BindingsExtractor, "getBindingContextPath")
				.withArgs(this.oSource).returns(sBindingContextPath)
				.withArgs(this.oTarget).returns(undefined);
			assert.strictEqual(
				Utils.checkSourceTargetBindingCompatibility(this.oSource, this.oTarget), false,
				"then bindings are not compatible");
		});
	});

	QUnit.module("doIfAllControlsAreAvailable", function() {
		QUnit.test("all controls are available", function(assert) {
			var done = assert.async();
			var oControl = new Control();
			var oControl2 = new Control();
			Utils.doIfAllControlsAreAvailable([oControl, oControl2], function() {
				assert.ok(true, "the function is called");
				done();
			});
		});

		QUnit.test("one controls is not available", function(assert) {
			var oControl = new Control();
			var oControl2 = new Control();
			oControl2.destroy();
			var vResult = Utils.doIfAllControlsAreAvailable([oControl, oControl2], function() {
				assert.ok(false, "should not go here");
			});
			assert.equal(vResult, undefined, "the function returns undefined");
		});
	});

	QUnit.module("Given stubbed fiori renderer available", {
		beforeEach: function () {
			this.oRenderer = {
				getRootControl: function() {
					return {
						getOUnifiedShell: function() {
							return {
								getHeader: function() {
									return { id: "mockedRenderer" };
								}
							};
						}
					};
				}
			};
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getRenderer: function () {
					return this.oRenderer;
				}.bind(this)
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'getFiori2Renderer' is called", function(assert) {
			assert.deepEqual(Utils.getFiori2Renderer(), this.oRenderer, "then the renderer is returned");
		});

		QUnit.test("when 'isOriginalFioriToolbarAccessible' is called", function(assert) {
			assert.ok(Utils.isOriginalFioriToolbarAccessible(), "then the function returns 'true'");
		});
	});

	QUnit.module("Given stubbed but invalid fiori renderer available", {
		beforeEach: function () {
			this.oRenderer = { id: "mockedInvalidRenderer" };
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getRenderer: function () {
					return this.oRenderer;
				}.bind(this)
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'getFiori2Renderer' is called", function(assert) {
			assert.deepEqual(Utils.getFiori2Renderer(), this.oRenderer, "then invalid renderer is returned");
		});

		QUnit.test("when 'isOriginalFioriToolbarAccessible' is called", function(assert) {
			assert.notOk(Utils.isOriginalFioriToolbarAccessible(), "then the function returns 'false'");
		});
	});

	QUnit.module("Given fiori renderer is not available", {
		beforeEach: function () {
			sandbox.stub(FlexUtils, "getUshellContainer").returns({ id: "mockedContainer" });
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'getFiori2Renderer' is called", function(assert) {
			assert.strictEqual(Utils.getFiori2Renderer(), undefined, "then 'undefined' is returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
