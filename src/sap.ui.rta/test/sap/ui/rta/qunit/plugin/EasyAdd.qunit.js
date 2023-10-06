/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/EasyAdd",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Core"
], function(
	DesignTime,
	CommandFactory,
	EasyAdd,
	AdditionalElementsPlugin,
	OverlayRegistry,
	ObjectPageSection,
	ObjectPageLayout,
	ObjectPageSubSection,
	VBox,
	Button,
	QUnitUtils,
	sinon,
	RtaQunitUtils,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	QUnit.module("Given a designTime and EasyAdd plugin are instantiated", {
		beforeEach(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new EasyAdd({
				commandFactory: new CommandFactory()
			});

			//	VBox
			//		OPLayout
			//			OPSection
			//				OPSubSection
			//					Button
			//			OPSection2 (invisible)
			//				OPSubSection
			//					Button
			this.oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"})]
			});
			this.oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "def"})]
			});
			this.oSection = new ObjectPageSection("section", {
				subSections: [this.oSubSection]
			});
			this.oSection2 = new ObjectPageSection("section2", {
				visible: false,
				subSections: [this.oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				sections: [this.oSection, this.oSection2]
			});
			this.oVBox = new VBox({
				items: [this.oLayout]
			}).placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox],
				plugins: [this.oEasyAddPlugin]
			});

			this.oShowAvailableElementsSpy = sandbox.spy(AdditionalElementsPlugin.prototype, "showAvailableElements");

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				this.oSectionOverlay2 = OverlayRegistry.getOverlay(this.oSection2);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used on the Layout", function(assert) {
			var done = assert.async();

			var oButton = oCore.byId(`${this.oLayoutOverlay.getId()}-AddButton`);
			assert.ok(oButton.getVisible(), "then the Add-Button of the Layout is displayed");

			this.oEasyAddPlugin.getDialog().attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.oShowAvailableElementsSpy.callCount, 1, "then showAvailableElements was called");
				assert.ok(this.oShowAvailableElementsSpy.calledWith(false, "sections", [this.oLayoutOverlay], 0, "Sections"), "then showAvailableElements was called with the right parameters");
				assert.equal(this.oEasyAddPlugin.getDialog().getTitle(), "Available Content: Sections", "then the title is set");
				this.oEasyAddPlugin.getDialog()._cancelDialog();
				done();
			}.bind(this));
			QUnitUtils.triggerEvent("tap", oButton.getDomRef());
		});

		QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used on the Section", function(assert) {
			var done = assert.async();
			var oButton = oCore.byId(`${this.oSectionOverlay.getId()}-AddButton`);
			assert.ok(oButton.getVisible(), "then the Add-Button of the Layout is displayed");

			this.oEasyAddPlugin.getDialog().attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.oShowAvailableElementsSpy.callCount, 1, "then showAvailableElements was called");
				assert.ok(this.oShowAvailableElementsSpy.calledWith(true, "sections", [this.oSectionOverlay], undefined, "Sections"), "then showAvailableElements was called with the right parameters");
				assert.equal(this.oEasyAddPlugin.getDialog().getTitle(), "Available Content: Sections", "then the title is set");
				this.oEasyAddPlugin.getDialog()._cancelDialog();
				done();
			}.bind(this));
			QUnitUtils.triggerEvent("tap", oButton.getDomRef());
		});

		QUnit.test("when the second section gets added and removed", function(assert) {
			var oButton = oCore.byId(`${this.oLayoutOverlay.getId()}-AddButton`);
			var oButton2 = oCore.byId(`${this.oSectionOverlay.getId()}-AddButton`);

			assert.ok(oButton.getVisible(), "then the Add-Button on the layout is still there");
			assert.ok(oButton.getEnabled(), "then the Button is enabled");
			assert.ok(oButton2.getVisible(), "then the Add-Button is displayed");
			assert.ok(oButton2.getEnabled(), "then the Button is enabled");

			var oVisibleStub = sandbox.stub(this.oSectionOverlay2, "isVisible").returns(true);
			this.oSectionOverlay2.attachEventOnce("geometryChanged", function() {
				assert.ok(oButton.getVisible(), "then the Add-Button on the layout is still there");
				assert.notOk(oButton.getEnabled(), "then the Button is disabled");
				assert.ok(oButton2.getVisible(), "then the Add-Button is displayed");
				assert.notOk(oButton2.getEnabled(), "then the Button is disabled");

				this.oSectionOverlay2.attachEventOnce("geometryChanged", function() {
					assert.ok(oButton.getVisible(), "then the Add-Button on the layout is still there");
					assert.ok(oButton.getEnabled(), "then the Button is enabled");
					assert.ok(oButton2.getVisible(), "then the Add-Button is displayed");
					assert.ok(oButton2.getEnabled(), "then the Button is enabled");
				});
				oVisibleStub.restore();
				sandbox.stub(this.oSectionOverlay2, "isVisible").returns(false);
				this.oSection2.setVisible(false);
				oCore.applyChanges();
			}.bind(this));
			this.oSection2.setVisible(true);
			oCore.applyChanges();
		});

		QUnit.test("when the overlay for the section and layout get deregistered", function(assert) {
			var oSuperDeregisterSpy = sandbox.spy(AdditionalElementsPlugin.prototype, "deregisterElementOverlay");
			var sControlStyleClass = "sapUiRtaMarginBottom";
			assert.ok(this.oSection.hasStyleClass(sControlStyleClass), "initially the style class got set on the section");

			this.oEasyAddPlugin.deregisterElementOverlay(this.oSectionOverlay);
			assert.ok(this.oSectionOverlay._oAddButton.bIsDestroyed, "after deregistering, the easy add button got destroyed");
			assert.notOk(this.oSection.hasStyleClass(sControlStyleClass), "and the style class got deleted");
			assert.strictEqual(oSuperDeregisterSpy.callCount, 1, "the super class was called");

			sControlStyleClass = "sapUiRtaPaddingTop";
			assert.ok(this.oLayout.getDomRef().querySelector("[id*='sectionsContainer']").classList.contains(sControlStyleClass), "initially the style class got set on the layout");

			this.oEasyAddPlugin.deregisterElementOverlay(this.oLayoutOverlay);
			assert.ok(this.oLayoutOverlay._oAddButton.bIsDestroyed, "after deregistering, the easy add button got destroyed");
			assert.notOk(this.oLayout.getDomRef().querySelector("[id*='sectionsContainer']").classList.contains(sControlStyleClass), "and the style class got deleted");
			assert.strictEqual(oSuperDeregisterSpy.callCount, 2, "the super class was called");
		});
	});

	QUnit.module("Given a designTime and EasyAdd plugin are instantiated", {
		beforeEach(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new EasyAdd({
				commandFactory: new CommandFactory()
			});

			this.oLayout = new ObjectPageLayout("layout", {});
			this.oVBox = new VBox({
				items: [this.oLayout]
			}).placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox],
				plugins: [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the ObjectPageLayout has no Sections initially", function(assert) {
			var oButton = oCore.byId(`${this.oLayoutOverlay.getId()}-AddButton`);
			assert.ok(oButton.getVisible(), "then the Add-Button is displayed on the layout");
			assert.notOk(oButton.getEnabled(), "then the Add-Button is disabled");
		});
	});

	QUnit.module("Given a designTime and AddPlugin plugin are instantiated with a OP without stableID", {
		beforeEach(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new EasyAdd({
				commandFactory: new CommandFactory()
			});

			this.oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"})]
			});
			this.oSection = new ObjectPageSection({
				subSections: [this.oSubSection]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				sections: [this.oSection]
			}).placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used", function(assert) {
			var oButton = oCore.byId(`${this.oSectionOverlay.getId()}-AddButton`);
			assert.notOk(oButton, "then the Add-Button is not displayed");
		});
	});

	QUnit.done(function() {
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});