/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/VBox",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/qunit/TestUtil",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Remove",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	VBox,
	DesignTime,
	ElementOverlay,
	OverlayRegistry,
	OverlayUtil,
	TestUtil,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	RemovePlugin,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given that an Overlay is created for a control", {
		async beforeEach(assert) {
			//	Layout2
			//		Layout1
			//			Layout0
			//				Button01
			//				Button02
			//		Button21
			//		Layout3
			//			Button31

			this.oButton01 = new Button("button01", {
				text: "Button01"
			});
			this.oButton02 = new Button("button02", {
				text: "Button02"
			});
			this.oLayout0 = new VerticalLayout("layout00", {
				content: [
					this.oButton01, this.oButton02
				]
			});
			this.oLayout1 = new VerticalLayout("layout01", {
				content: [
					this.oLayout0
				]
			});
			this.oButton21 = new Button("button21", {
				text: "Button21"
			});
			this.oButton31 = new Button("button31", {
				text: "Button31"
			});
			this.oLayout3 = new VerticalLayout("layout03", {
				content: [
					this.oButton31
				]
			});
			this.oLayout2 = new VerticalLayout("layout02", {
				content: [
					this.oLayout1,
					this.oButton21,
					this.oLayout3
				]
			});
			this.oLayout2.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout2]
			});

			const fnDone = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay01 = OverlayRegistry.getOverlay(this.oButton01);
				this.oButtonOverlay02 = OverlayRegistry.getOverlay(this.oButton02);
				this.oLayoutOverlay0 = OverlayRegistry.getOverlay(this.oLayout0);
				this.oLayoutOverlay1 = OverlayRegistry.getOverlay(this.oLayout1);
				this.oButtonOverlay21 = OverlayRegistry.getOverlay(this.oButton21);
				this.oLayoutOverlay3 = OverlayRegistry.getOverlay(this.oLayout3);
				this.oButtonOverlay31 = OverlayRegistry.getOverlay(this.oButton31);
				this.oLayoutOverlay2 = OverlayRegistry.getOverlay(this.oLayout2);
				fnDone();
			}, this);
		},
		afterEach() {
			this.oLayout2.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when Overlays are created and the getAllChildOverlays function is called", function(assert) {
			let aChildOverlays = OverlayUtil.getAllChildOverlays(this.oLayoutOverlay0);
			assert.strictEqual(aChildOverlays.length, 2, "oLayoutOverlay0 has 2 children");

			aChildOverlays = OverlayUtil.getAllChildOverlays(this.oLayoutOverlay1);
			assert.strictEqual(aChildOverlays.length, 1, "oLayoutOverlay1 has 1 child");

			aChildOverlays = OverlayUtil.getAllChildOverlays(this.oButtonOverlay01);
			assert.strictEqual(aChildOverlays.length, 0, "oButtonOverlay01 has no children");

			aChildOverlays = OverlayUtil.getAllChildOverlays(undefined);
			assert.strictEqual(Array.isArray(aChildOverlays), true, "undefined as function-parameter returns an empty array");
			assert.strictEqual(aChildOverlays.length, 0, "undefined as function-parameter has no children");
		});

		QUnit.test("when Overlays are created and the getFirstDescendantByCondition function is called", function(assert) {
			const aSelectableOverlays = [
				this.oButtonOverlay01,
				this.oButtonOverlay02,
				this.oButtonOverlay21
			];
			const fnCondition = function(oOverlay) {
				return aSelectableOverlays.indexOf(oOverlay) >= 0;
			};

			let oChildOverlay = OverlayUtil.getFirstDescendantByCondition(this.oLayoutOverlay0, fnCondition);
			assert.strictEqual(
				oChildOverlay, this.oButtonOverlay01, "oLayoutOverlay0 -> oButtonOverlay01 is the first overlay which fulfill the condition"
			);

			oChildOverlay = OverlayUtil.getFirstDescendantByCondition(this.oLayoutOverlay2, fnCondition);
			assert.strictEqual(
				oChildOverlay, this.oButtonOverlay01, "oLayoutOverlay2 -> oButtonOverlay01 is the first overlay which fulfill the condition"
			);

			oChildOverlay = OverlayUtil.getFirstDescendantByCondition(this.oButtonOverlay01, fnCondition);
			assert.strictEqual(oChildOverlay, undefined, "oButtonOverlay01 has no children and returns 'undefined'");

			oChildOverlay = OverlayUtil.getFirstDescendantByCondition(this.oLayoutOverlay3, fnCondition);
			assert.strictEqual(oChildOverlay, undefined, "oLayoutOverlay3 children do not fulfill the condition and returns 'undefined'");

			oChildOverlay = OverlayUtil.getFirstDescendantByCondition(undefined, fnCondition);
			assert.strictEqual(oChildOverlay, undefined, "and overlay-parameter is 'undefined' -> returns 'undefined'");

			assert.throws(function() { OverlayUtil.getFirstDescendantByCondition(this.oLayoutOverlay0); },
				/expected condition is 'undefined' or not a function/,
				"and function-parameter is 'undefined' -> throws error");
		});

		QUnit.test("when Overlays are created and the getLastDescendantByCondition function is called", function(assert) {
			const aSelectableOverlays = [
				this.oButtonOverlay01,
				this.oButtonOverlay02,
				this.oButtonOverlay21
			];
			const fnCondition = function(oOverlay) {
				return aSelectableOverlays.indexOf(oOverlay) >= 0;
			};

			let oChildOverlay = OverlayUtil.getLastDescendantByCondition(this.oLayoutOverlay0, fnCondition);
			assert.strictEqual(
				oChildOverlay, this.oButtonOverlay02, "oLayoutOverlay0 -> oButtonOverlay02 is the last overlay which fulfill the condition"
			);

			oChildOverlay = OverlayUtil.getLastDescendantByCondition(this.oLayoutOverlay2, fnCondition);
			assert.strictEqual(
				oChildOverlay, this.oButtonOverlay21, "oLayoutOverlay2 -> oButtonOverlay21 is the last overlay which fulfill the condition"
			);

			oChildOverlay = OverlayUtil.getLastDescendantByCondition(this.oButtonOverlay01, fnCondition);
			assert.strictEqual(oChildOverlay, undefined, "oButtonOverlay01 has no children and returns 'undefined'");

			oChildOverlay = OverlayUtil.getLastDescendantByCondition(this.oLayoutOverlay3, fnCondition);
			assert.strictEqual(oChildOverlay, undefined, "oLayoutOverlay3 children do not fulfill the condition and returns 'undefined'");

			oChildOverlay = OverlayUtil.getLastDescendantByCondition(undefined, fnCondition);
			assert.strictEqual(oChildOverlay, undefined, "and overlay-parameter is 'undefined' -> returns 'undefined'");

			assert.throws(function() { OverlayUtil.getLastDescendantByCondition(this.oLayoutOverlay0); },
				/expected condition is 'undefined' or not a function/,
				"and function-parameter is 'undefined' -> throws error");
		});

		QUnit.test("when getParentInformation is requested for a control with a parent ", function(assert) {
			const oParentInformation = OverlayUtil.getParentInformation(this.oButtonOverlay01);

			assert.strictEqual(!!oParentInformation, true, "then parent information is returned");
			assert.strictEqual(oParentInformation.parent, this.oLayout0, "parent is correct");
			assert.strictEqual(oParentInformation.aggregation, "content", "aggregation name is correct");
			assert.strictEqual(oParentInformation.index, 0, "index in aggregation is correct");
		});

		QUnit.test("when getParentInformation is requested for a control with no parent ", function(assert) {
			const oButton = new Button();
			const oOverlay = new ElementOverlay({ element: oButton });

			const oParentInformation = OverlayUtil.getParentInformation(oOverlay);

			assert.strictEqual(!!oParentInformation, true, "then parent information is returned");
			assert.strictEqual(oParentInformation.parent, null, "parent is undefined");
			assert.strictEqual(oParentInformation.aggregation, "", "aggregation is empty string");
			assert.strictEqual(oParentInformation.index, -1, "index in aggregation is -1");

			oButton.destroy();
		});

		QUnit.test("when getAggregation is called and Element is not part of the aggregation", function(assert) {
			const oButton = new Button();
			const nPosition = OverlayUtil.getIndexInAggregation(oButton, this.oLayout0, "content");
			assert.strictEqual(nPosition, -1, "then it returns -1");
			oButton.destroy();
		});

		QUnit.test("when getAggregation is called and Element is part of the aggregation and all other Elements have Overlays", function(assert) {
			const oButton = new Button();
			this.oLayout0.addContent(oButton);
			const nPosition = OverlayUtil.getIndexInAggregation(oButton, this.oLayout0, "content");
			assert.strictEqual(nPosition, 2, "then it returns the correct index position");
			oButton.destroy();
		});

		QUnit.test("when getAggregation is called and Element is part of the aggregation and not all other Elements have Overlays", function(assert) {
			const oButton = new Button();
			this.oLayout0.addContent(oButton);
			// remove Overlay from Button01
			OverlayRegistry.deregister(OverlayRegistry.getOverlay(this.oButton01));
			const nPosition = OverlayUtil.getIndexInAggregation(oButton, this.oLayout0, "content");
			assert.strictEqual(nPosition, 1, "then it returns the correct index position");
			oButton.destroy();
		});

		QUnit.test("when findAllOverlaysInContainer is called", function(assert) {
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay01).length, 3, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oLayoutOverlay0).length, 2, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oLayoutOverlay1).length, 4, "then it returns the correct overlays"
			);
		});

		// This is the case in VisualEditor
		QUnit.test("when findAllOverlaysInContainer is called and the relevant container overlay was destroyed", function(assert) {
			this.oLayoutOverlay0.destroy();
			assert.strictEqual(OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay01).length, 0, "then it returns an empty array");
		});

		QUnit.test("when getFirstMovableParentOverlay is called on the button and both the button and layout1 are movable", function(assert) {
			this.oLayoutOverlay1.setMovable(true);
			this.oButtonOverlay01.setMovable(true);
			assert.strictEqual(
				OverlayUtil.getFirstMovableParentOverlay(this.oButtonOverlay01),
				this.oLayoutOverlay1,
				"then the movable layout1 is found"
			);
		});
	});

	QUnit.module("Given a VBox with an ObjectPageLayout with Overlays created", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			//	VBox0
			//		Layout0
			//			Section0
			//				SubSection0
			//					Button0
			//					Button1
			//			Section1
			//				SubSection1
			//					Button2
			//					Button3
			//					Button8 -- different Aggregation
			//				SubSection2
			//					Button4 RelevantContainer: Section1
			//					Button5
			//					VBox1 RelevantContainer: oSubSection2
			//						VBox2 RelevantContainer: oSubSection2
			//							Button6 RelevantContainer: oSubSection2
			//							Button7 RelevantContainer: oSubSection2

			this.oButton0 = new Button("button0", { text: "button0" });
			this.oButton1 = new Button("button1", { text: "button1" });
			this.oButton2 = new Button("button2", { text: "button2" });
			this.oButton3 = new Button("button3", { text: "button3" });
			this.oButton4 = new Button("button4", { text: "button4" });
			this.oButton5 = new Button("button5", { text: "button5" });
			this.oButton6 = new Button("button6", { text: "button6" });
			this.oButton7 = new Button("button7", { text: "button7" });
			this.oButton8 = new Button("button8", { text: "button8" });
			this.oVBox2 = new VBox("VBox2", {
				items: [this.oButton6, this.oButton7]
			});
			this.oVBox1 = new VBox("VBox1", {
				items: [this.oVBox2]
			});
			this.oSubSection0 = new ObjectPageSubSection("subsection0", {
				blocks: [this.oButton0, this.oButton1]
			});
			this.oSubSection1 = new ObjectPageSubSection("subsection1", {
				blocks: [this.oButton2, this.oButton3],
				moreBlocks: [this.oButton8]
			});
			this.oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [this.oButton4, this.oButton5, this.oVBox1]
			});
			this.oSection0 = new ObjectPageSection("section0", {
				subSections: [this.oSubSection0]
			});
			this.oSection1 = new ObjectPageSection("section1", {
				subSections: [this.oSubSection1, this.oSubSection2]
			});
			this.oLayout0 = new ObjectPageLayout("layout0", {
				sections: [this.oSection0, this.oSection1]
			});
			this.oVBox0 = new VBox("VBox", {
				items: [this.oLayout0]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox0]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVBoxOverlay0 = OverlayRegistry.getOverlay(this.oVBox0);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				this.oVBoxOverlay2 = OverlayRegistry.getOverlay(this.oVBox2);
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
				this.oButtonOverlay6 = OverlayRegistry.getOverlay(this.oButton6);
				this.oButtonOverlay7 = OverlayRegistry.getOverlay(this.oButton7);
				this.oButtonOverlay8 = OverlayRegistry.getOverlay(this.oButton8);

				sandbox.stub(this.oButtonOverlay4, "getRelevantContainer").returns(this.oSection1);
				sandbox.stub(this.oButtonOverlay6, "getRelevantContainer").returns(this.oSubSection2);
				sandbox.stub(this.oButtonOverlay7, "getRelevantContainer").returns(this.oSubSection2);
				sandbox.stub(this.oVBoxOverlay1, "getRelevantContainer").returns(this.oSubSection2);
				sandbox.stub(this.oVBoxOverlay2, "getRelevantContainer").returns(this.oSubSection2);

				fnDone();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oVBox0.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when findAllOverlaysInContainer is called", function(assert) {
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oVBoxOverlay0).length, 2, "then it returns the correct overlays"
			);

			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oLayoutOverlay0).length, 2, "then it returns the correct overlays"
			);

			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oSectionOverlay0).length, 3, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oSectionOverlay1).length, 3, "then it returns the correct overlays"
			);

			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oSubSectionOverlay0).length, 2, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oSubSectionOverlay1).length, 4, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oSubSectionOverlay2).length, 4, "then it returns the correct overlays"
			);

			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay0).length, 3, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay2).length, 3, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay4).length, 8, "then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay6).length, 7, "then it returns the correct overlays"
			);
			this.oButtonOverlay4.destroyDesignTimeMetadata();
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay6).length,
				6,
				"then the overlay without DT Metadata is not returned"
			);
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay8).length, 2, "then it returns the correct overlays");
			this.oSubSectionOverlay1.destroyDesignTimeMetadata();
			assert.strictEqual(
				OverlayUtil.findAllOverlaysInContainer(this.oButtonOverlay8).length,
				1,
				"then the overlay without DT Metadata is not returned"
			);
		});

		QUnit.test("when findAllSiblingOverlaysInContainer is called", function(assert) {
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oVBoxOverlay0, this.oVBoxOverlay0).length,
				0,
				"then it returns no overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oLayoutOverlay0, this.oVBoxOverlay0).length,
				1,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oSectionOverlay0, this.oLayoutOverlay0).length,
				2,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oSubSectionOverlay0, this.oSectionOverlay0).length,
				1,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oSubSectionOverlay1, this.oSectionOverlay1).length,
				2,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay0, this.oSubSectionOverlay0).length,
				2,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay2, this.oSubSectionOverlay1).length,
				2,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay4, this.oSectionOverlay1).length,
				5,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay6, this.oSubSectionOverlay2).length,
				2,
				"then it returns the correct overlays"
			);
			this.oButtonOverlay7.destroyDesignTimeMetadata();
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay6, this.oSubSectionOverlay2).length,
				1,
				"then the overlay without DT Metadata is not returned"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay8, this.oSubSectionOverlay1).length,
				1,
				"then it returns the correct overlays"
			);
			assert.strictEqual(
				OverlayUtil.findAllSiblingOverlaysInContainer(this.oButtonOverlay8, this.oSubSectionOverlay1).length,
				1,
				"then it returns the correct overlays"
			);
		});

		QUnit.test("when setOrResetFirstParentMovable is called", function(assert) {
			this.oSubSectionOverlay0.setMovable(true);
			assert.strictEqual(this.oSubSectionOverlay0.getMovable(), true, "the overlay is movable before the function has been called");
			OverlayUtil.setFirstParentMovable(this.oButtonOverlay0, false);
			assert.strictEqual(
				this.oSubSectionOverlay0.getMovable(),
				false,
				"the overlay is not movable after the function has been called with 'false'"
			);
			OverlayUtil.setFirstParentMovable(this.oButtonOverlay0, true);
			assert.strictEqual(
				this.oSubSectionOverlay0.getMovable(),
				true,
				"the overlay is movable after the function has been called with 'true'"
			);
		});

		QUnit.test("when findAllUniqueAggregationOverlaysInContainer is called", function(assert) {
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oVBoxOverlay0, this.oVBoxOverlay0).length, 0, "then it returns no overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oLayoutOverlay0, this.oVBoxOverlay0).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oSectionOverlay0, this.oLayoutOverlay0).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oSubSectionOverlay0, this.oSectionOverlay0).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oSubSectionOverlay1, this.oSectionOverlay1).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oButtonOverlay0, this.oSubSectionOverlay0).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oButtonOverlay2, this.oSubSectionOverlay1).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oButtonOverlay4, this.oSectionOverlay1).length, 2, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oButtonOverlay6, this.oSubSectionOverlay2).length, 1, "then it returns the correct overlays"
			);
			assert.strictEqual(OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oButtonOverlay8, this.oSubSectionOverlay1).length, 1, "then it returns the correct overlays"
			);
		});

		QUnit.test("when findAllUniqueAggregationOverlaysInContainer is called with siblings sharing the same aggregation, it deduplicates to one entry", function(assert) {
			// oButton0 and oButton1 are both in oSubSection0.blocks — two siblings, one aggregation overlay
			const aResult = OverlayUtil.findAllUniqueAggregationOverlaysInContainer(
				this.oButtonOverlay0, this.oSubSectionOverlay0
			);
			assert.strictEqual(aResult.length, 1, "two siblings in the same aggregation collapse to one aggregation overlay");
			assert.strictEqual(
				aResult[0],
				this.oButtonOverlay1.getParentAggregationOverlay(),
				"the returned aggregation overlay is the shared parent aggregation overlay"
			);
		});

		QUnit.test("when isInTargetZoneAggregation is called", function(assert) {
			assert.strictEqual(
				OverlayUtil.isInTargetZoneAggregation(this.oButtonOverlay0), false, "then it returns false if Targetzone is false"
			);
			this.oButtonOverlay0.getParent().setTargetZone(true);
			assert.strictEqual(
				OverlayUtil.isInTargetZoneAggregation(this.oButtonOverlay0), true, "then it returns true if Targetzone is true"
			);
			assert.strictEqual(
				OverlayUtil.isInTargetZoneAggregation(this.oVBoxOverlay0),
				false,
				"then it returns false if Element has no Parentaggregation"
			);
		});

		QUnit.test("when getNextSiblingOverlay function is called", function(assert) {
			let oNextSiblingOverlay = OverlayUtil.getNextSiblingOverlay(this.oVBoxOverlay0);
			assert.strictEqual(oNextSiblingOverlay, undefined, "oVBoxOverlay0 -> undefined");

			oNextSiblingOverlay = OverlayUtil.getNextSiblingOverlay(this.oSectionOverlay0);
			assert.strictEqual(oNextSiblingOverlay, this.oSectionOverlay1, "oSectionOverlay0 ->oSectionOverlay1");

			oNextSiblingOverlay = OverlayUtil.getNextSiblingOverlay(this.oButtonOverlay3);
			assert.strictEqual(oNextSiblingOverlay, this.oButtonOverlay8, "oButtonOverlay3 -> oButtonOverlay8");

			// call getNextSiblingOverlay without an Overlay
			assert.strictEqual(OverlayUtil.getNextSiblingOverlay(), undefined, "() -> undefined");
		});

		QUnit.test("when getPreviousSiblingOverlay function is called", function(assert) {
			let oPreviousSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(this.oVBoxOverlay0);
			assert.strictEqual(oPreviousSiblingOverlay, undefined, "oVBoxOverlay0 -> undefined");

			oPreviousSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(this.oButtonOverlay1);
			assert.strictEqual(oPreviousSiblingOverlay, this.oButtonOverlay0, "oButtonOverlay1 -> oButtonOverlay0");

			oPreviousSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(this.oButtonOverlay8);
			assert.strictEqual(oPreviousSiblingOverlay, this.oButtonOverlay3, "oButtonOverlay8 -> oButtonOverlay3");

			// call getPreviousSiblingOverlay without an Overlay
			assert.strictEqual(OverlayUtil.getPreviousSiblingOverlay(), undefined, "() -> undefined");
		});

		QUnit.test("when iterateOverlayElementTree function is called", function(assert) {
			const oSpy = sandbox.spy();
			OverlayUtil.iterateOverlayElementTree(this.oVBoxOverlay0, oSpy);
			assert.strictEqual(oSpy.callCount, 23, "callback was called 23 times for oVBoxOverlay0");
			oSpy.reset();
			OverlayUtil.iterateOverlayElementTree(this.oSectionOverlay0, oSpy);
			assert.strictEqual(oSpy.callCount, 4, "callback was called 4 times for oSectionOverlay0");
			assert.strictEqual(oSpy.args.length, 4, "number of Arguments is correct");
			assert.strictEqual(oSpy.args[0][0], this.oSectionOverlay0, "first Argument for oSectionOverlay0 is correct");
			assert.strictEqual(oSpy.args[1][0], this.oSubSectionOverlay0, "second Argument for oSectionOverlay0 is correct");
		});
	});

	function createGeometryObject(iWidth, iHeight, iLeft, iTop, bVisible) {
		return {
			size: {
				width: iWidth,
				height: iHeight
			},
			position: {
				left: iLeft,
				top: iTop
			},
			visible: bVisible
		};
	}

	QUnit.module("Given some geometry objects", {}, function() {
		QUnit.test("when getGeometry is called with different overlays", function(assert) {
			const oGeometry0 = createGeometryObject(20, 100, 5, 100, true);
			const oGeometry1 = createGeometryObject(200, 200, 6, 300, true);
			const oGeometry2 = createGeometryObject(0, 0, 0, 0, true);
			const oGeometry3 = createGeometryObject(0, 0, 0, 0, false);

			assert.deepEqual(
				OverlayUtil.getGeometry([oGeometry0, oGeometry1, oGeometry2, oGeometry3]),
				createGeometryObject(206, 500, 0, 0, true),
				"the geometry was correctly calculated"
			);
			assert.deepEqual(
				OverlayUtil.getGeometry([oGeometry0, oGeometry1, oGeometry2]),
				createGeometryObject(206, 500, 0, 0, true),
				"the geometry was correctly calculated"
			);
			assert.deepEqual(
				OverlayUtil.getGeometry([oGeometry0, oGeometry1, oGeometry3]),
				createGeometryObject(201, 400, 5, 100, true),
				"the geometry was correctly calculated"
			);
			assert.deepEqual(
				OverlayUtil.getGeometry([oGeometry0]),
				oGeometry0,
				"the Geometry is the same"
			);
			assert.deepEqual(
				OverlayUtil.getGeometry([oGeometry2]),
				oGeometry2,
				"the Geometry is the same"
			);
			assert.deepEqual(
				OverlayUtil.getGeometry([oGeometry3]),
				undefined,
				"nothing is returned because it's invisible"
			);
		});
	});

	QUnit.module("getClosestBoundControl() - Given is a list with bounded items", {
		async beforeEach(assert) {
			const fnDone = assert.async();
			this.oHorizontalLayout = await TestUtil.createListWithBoundItems();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oHorizontalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oHorizontalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when overlay that is part of the binding aggregation template is given", function(assert) {
			const oSelectedOverlay = OverlayRegistry.getOverlay("boundListItem-btn");
			const mAggregationBindingStack = OverlayUtil.getClosestBoundControl(oSelectedOverlay);
			const oClosestBoundOverlay = OverlayRegistry.getOverlay(mAggregationBindingStack.overlayId);
			assert.strictEqual(oClosestBoundOverlay.getElement().getId(), "boundlist", "then the closest bounded overlay could be found");
			assert.strictEqual(
				mAggregationBindingStack.aggregation,
				"items",
				"then the closest bounded overlay could be found for the correct aggregation"
			);
			assert.strictEqual(
				mAggregationBindingStack.stack.length, 2, "then the stack to the closest bounded overlay includes 3 info objects"
			);
			const mFirstStackObject = mAggregationBindingStack.stack.pop();
			assert.deepEqual(mFirstStackObject, {
				overlayId: OverlayRegistry.getOverlay("boundListItem").getId(),
				aggregation: "items",
				index: 0,
				boundary: true
			},	"then the stack is valid");
		});

		QUnit.test("when overlay that is part of the binding aggregation cloned item is given", function(assert) {
			const oSelectedOverlay = OverlayRegistry.getOverlay("boundListItem-btn-boundlist-0");
			const mAggregationBindingStack = OverlayUtil.getClosestBoundControl(oSelectedOverlay);
			const oClosestBoundOverlay = OverlayRegistry.getOverlay(mAggregationBindingStack.overlayId);
			assert.strictEqual(oClosestBoundOverlay.getElement().getId(), "boundlist", "then the closest bounded overlay could be found");
			assert.strictEqual(
				mAggregationBindingStack.aggregation, "items", "then the closest bounded overlay could be found for the correct aggregation"
			);
			assert.strictEqual(
				mAggregationBindingStack.stack.length, 2, "then the stack to the closest bounded overlay includes 3 info objects"
			);
			const mFirstStackObject = mAggregationBindingStack.stack.pop();
			assert.deepEqual(mFirstStackObject, {
				overlayId: OverlayRegistry.getOverlay("boundListItem-boundlist-0").getId(),
				aggregation: "items",
				index: 0,
				boundary: true
			}, "then the stack is valid");
		});

		QUnit.test("when overlay that does not belong to a binding aggregation is given", function(assert) {
			const oSelectedOverlay = OverlayRegistry.getOverlay("item1-btn");
			const mAggregationBindingStack = OverlayUtil.getClosestBoundControl(oSelectedOverlay);
			assert.strictEqual(mAggregationBindingStack.overlayId, undefined, "then the closest bounded overlay id is empty (not found)");
			assert.strictEqual(
				mAggregationBindingStack.aggregation, undefined, "then no aggregation available as no closest bounded overlay was found"
			);
			assert.strictEqual(
				mAggregationBindingStack.stack.length, 4, "then the stack to the stack includes the whole path to the root element"
			);
		});
	});

	QUnit.module("Given that canBeRemovedFromAggregationOnRemove is called", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oLayout = new VerticalLayout({
				content: [this.oButton1, this.oButton2, this.oButton3]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when element has no parent", function(assert) {
			sandbox.stub(this.oButton1Overlay, "getElement").returns({
				getParent() {
					return undefined;
				}
			});
			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove([this.oButton1Overlay], this.oDesignTime),
				false,
				"then it returns false"
			);
		});

		QUnit.test("when element is not the last visible element in aggregation", function(assert) {
			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove([this.oButton1Overlay], this.oDesignTime),
				true,
				"then it returns true"
			);
		});

		QUnit.test("when multiple elements are selected but not all visible elements", function(assert) {
			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove([this.oButton1Overlay, this.oButton2Overlay], this.oDesignTime),
				true,
				"then it returns true"
			);
		});

		QUnit.test("when element is the last visible element and removeLastElement is not defined", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove([this.oButton1Overlay], this.oDesignTime),
				false,
				"then it returns false because removeLastElement is not allowed by default"
			);
		});

		QUnit.test("when element is the last visible element and removeLastElement is true", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			const oRemovePlugin = {
				isA(sType) {
					return sType === "sap.ui.rta.plugin.Remove";
				},
				getAction() {
					return {
						removeLastElement: true
					};
				},
				destroy() {}
			};

			sandbox.stub(this.oDesignTime, "getPlugins").returns([oRemovePlugin]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove([this.oButton1Overlay], this.oDesignTime),
				true,
				"then it returns true because removeLastElement is allowed"
			);
		});

		QUnit.test("when element is the last visible element and removeLastElement is false", function(assert) {
			// Make button2 and button3 invisible
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			// Create a mock Remove plugin
			const oRemovePlugin = {
				isA(sType) {
					return sType === "sap.ui.rta.plugin.Remove";
				},
				getAction() {
					return {
						removeLastElement: false
					};
				},
				destroy() {}
			};

			sandbox.stub(this.oDesignTime, "getPlugins").returns([oRemovePlugin]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove([this.oButton1Overlay], this.oDesignTime),
				false,
				"then it returns false because removeLastElement is not allowed"
			);
		});

		QUnit.test("when all visible elements are selected and removeLastElement is true", function(assert) {
			// Create a mock Remove plugin
			const oRemovePlugin = {
				isA(sType) {
					return sType === "sap.ui.rta.plugin.Remove";
				},
				getAction() {
					return {
						removeLastElement: true
					};
				},
				destroy() {}
			};

			sandbox.stub(this.oDesignTime, "getPlugins").returns([oRemovePlugin]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnRemove(
					[this.oButton1Overlay, this.oButton2Overlay, this.oButton3Overlay],
					this.oDesignTime
				),
				true,
				"then it returns true because removeLastElement is allowed"
			);
		});
	});

	QUnit.module("Given that canBeRemovedFromAggregationOnMove is called", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oLayout = new VerticalLayout({
				content: [this.oButton1, this.oButton2, this.oButton3]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when element is not the last visible element in aggregation", function(assert) {
			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(this.oButton1Overlay, this.oDesignTime),
				true,
				"then it returns true"
			);
		});

		QUnit.test("when element is the last visible element and removeLastElement is not defined", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(this.oButton1Overlay, this.oDesignTime),
				false,
				"then it returns false because removeLastElement defaults to false"
			);
		});

		QUnit.test("when element is the last visible element and removeLastElement is true", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			const oRemovePlugin = {
				isA(sType) {
					return sType === "sap.ui.rta.plugin.Remove";
				},
				getAction() {
					return {
						removeLastElement: true
					};
				},
				destroy() {}
			};

			sandbox.stub(this.oDesignTime, "getPlugins").returns([oRemovePlugin]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(this.oButton1Overlay, this.oDesignTime),
				true,
				"then it returns true because removeLastElement is allowed"
			);
		});

		QUnit.test("when element is the last visible element and removeLastElement is false", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			const oRemovePlugin = {
				isA(sType) {
					return sType === "sap.ui.rta.plugin.Remove";
				},
				getAction() {
					return {
						removeLastElement: false
					};
				},
				destroy() {}
			};

			sandbox.stub(this.oDesignTime, "getPlugins").returns([oRemovePlugin]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(this.oButton1Overlay, this.oDesignTime),
				false,
				"then it returns false because removeLastElement is not allowed"
			);
		});

		QUnit.test("when there are multiple visible elements", function(assert) {
			const oRemovePlugin = {
				isA(sType) {
					return sType === "sap.ui.rta.plugin.Remove";
				},
				getAction() {
					return {
						removeLastElement: false
					};
				},
				destroy() {}
			};

			sandbox.stub(this.oDesignTime, "getPlugins").returns([oRemovePlugin]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(this.oButton1Overlay, this.oDesignTime),
				true,
				"then it returns true regardless of removeLastElement setting"
			);
		});

		QUnit.test("when no Remove plugin is available", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);

			sandbox.stub(this.oDesignTime, "getPlugins").returns([]);

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(this.oButton1Overlay, this.oDesignTime),
				false,
				"then it returns false when no Remove plugin is found"
			);
		});

		QUnit.test("when the element has no parent", function(assert) {
			const oOrphanButton = new Button("orphanButton");
			const oOverlayStub = {
				getElement() {
					return oOrphanButton;
				}
			};

			assert.strictEqual(
				OverlayUtil.canBeRemovedFromAggregationOnMove(oOverlayStub, this.oDesignTime),
				false,
				"then it returns false without throwing"
			);

			oOrphanButton.destroy();
		});
	});

	QUnit.module("Given that updateLastElementRemovability is called", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oLayout = new VerticalLayout({
				content: [this.oButton1, this.oButton2, this.oButton3]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			const oCommandFactory = new CommandFactory();
			this.oRemovePlugin = new RemovePlugin({ commandFactory: oCommandFactory	});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oRemovePlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			this.oRemovePlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when removing an element and one visible element remains", function(assert) {
			this.oButton3.setVisible(false);
			const oSetLastElementMovableSpy = sandbox.spy(this.oButton1Overlay, "setLastElementMovable");

			OverlayUtil.updateLastElementRemovability({
				element: this.oButton2,
				parentElement: this.oLayout,
				aggregationName: "content",
				type: "remove",
				designTime: this.oDesignTime
			});

			assert.strictEqual(oSetLastElementMovableSpy.calledOnce, true, "then setLastElementMovable was called once");
			assert.strictEqual(
				oSetLastElementMovableSpy.calledWith(false),
				true,
				"then setLastElementMovable was called with false (removal is not allowed)"
			);
		});

		QUnit.test("when adding an element and one visible element remains", function(assert) {
			this.oButton3.setVisible(false);
			const oSetLastElementMovableSpy = sandbox.spy(this.oButton1Overlay, "setLastElementMovable");

			OverlayUtil.updateLastElementRemovability({
				element: this.oButton2,
				parentElement: this.oLayout,
				aggregationName: "content",
				type: "add",
				designTime: this.oDesignTime
			});

			assert.strictEqual(oSetLastElementMovableSpy.calledOnce, true, "then setLastElementMovable was called once");
			assert.strictEqual(
				oSetLastElementMovableSpy.calledWith(true),
				true,
				"then setLastElementMovable was called with true for add type"
			);
		});

		QUnit.test("when removing an element and multiple visible elements remain", function(assert) {
			const oSetLastElementMovableSpy1 = sandbox.spy(this.oButton1Overlay, "setLastElementMovable");
			const oSetLastElementMovableSpy2 = sandbox.spy(this.oButton2Overlay, "setLastElementMovable");

			OverlayUtil.updateLastElementRemovability({
				element: this.oButton3,
				parentElement: this.oLayout,
				aggregationName: "content",
				type: "remove",
				designTime: this.oDesignTime
			});

			assert.strictEqual(oSetLastElementMovableSpy1.called, false, "then setLastElementMovable was not called on button1");
			assert.strictEqual(oSetLastElementMovableSpy2.called, false, "then setLastElementMovable was not called on button2");
		});

		QUnit.test("when removing an element and no visible elements remain", function(assert) {
			this.oButton2.setVisible(false);
			this.oButton3.setVisible(false);
			const oSetLastElementMovableSpy = sandbox.spy(this.oButton1Overlay, "setLastElementMovable");

			OverlayUtil.updateLastElementRemovability({
				element: this.oButton1,
				parentElement: this.oLayout,
				aggregationName: "content",
				type: "remove",
				designTime: this.oDesignTime
			});

			assert.strictEqual(oSetLastElementMovableSpy.called, false, "then setLastElementMovable was not called");
		});

		QUnit.test("when removing an element with removeLastElement set to false and one visible element remains", function(assert) {
			this.oButton3.setVisible(false);

			sandbox.stub(this.oRemovePlugin, "getAction").returns({ removeLastElement: false });

			const oSetLastElementMovableSpy = sandbox.spy(this.oButton1Overlay, "setLastElementMovable");

			OverlayUtil.updateLastElementRemovability({
				element: this.oButton2,
				parentElement: this.oLayout,
				aggregationName: "content",
				type: "remove",
				designTime: this.oDesignTime
			});

			assert.strictEqual(oSetLastElementMovableSpy.calledOnce, true, "then setLastElementMovable was called once");
			assert.strictEqual(
				oSetLastElementMovableSpy.calledWith(false),
				true,
				"then setLastElementMovable was called with false (removal is not allowed)"
			);
		});

		QUnit.test("when removing an element with removeLastElement set to true and one visible element remains", function(assert) {
			this.oButton3.setVisible(false);

			sandbox.stub(this.oRemovePlugin, "getAction").returns({ removeLastElement: true });

			const oSetLastElementMovableSpy = sandbox.spy(this.oButton1Overlay, "setLastElementMovable");

			OverlayUtil.updateLastElementRemovability({
				element: this.oButton2,
				parentElement: this.oLayout,
				aggregationName: "content",
				type: "remove",
				designTime: this.oDesignTime
			});

			assert.strictEqual(oSetLastElementMovableSpy.calledOnce, true, "then setLastElementMovable was called once");
			assert.strictEqual(
				oSetLastElementMovableSpy.calledWith(true),
				true,
				"then setLastElementMovable was called with true (removal is allowed)"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});