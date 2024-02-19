/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/VBox",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function(
	Button,
	Title,
	VBox,
	DesignTime,
	OverlayRegistry,
	ObjectPageDynamicHeaderTitle,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Basic functionality", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			this.oButton = new Button({text: "foo"});
			this.oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [this.oButton]
			});
			this.oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "bar"})]
			});
			this.oSection = new ObjectPageSection("section", {
				visible: false,
				subSections: [this.oSubSection]
			});
			this.oSection2 = new ObjectPageSection("section2", {
				subSections: [this.oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				height: "600px",
				sections: [this.oSection, this.oSection2],
				headerTitle: new ObjectPageDynamicHeaderTitle({
					heading: new Title({ text: "Title"})
				})
			});
			this.oVBox = new VBox({
				items: [this.oLayout]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},

		afterEach() {
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	}, () => {
		QUnit.test("Check overlay positions after invisible section is made visible", function(assert) {
			const fnDone = assert.async();
			const oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
			const oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);

			const checkPositions = () => {
				assert.ok(this.oSection.getDomRef(), "Section is placed on DOM tree");
				assert.ok(oSectionOverlay.getDomRef(), "Section overlay is placed on the DOM tree");
				assert.deepEqual(
					Math.ceil(oSectionOverlay.getDomRef().getBoundingClientRect().top),
					Math.ceil(this.oSection.getDomRef().getBoundingClientRect().top),
					"top position of the Section overlay is correct"
				);
				assert.deepEqual(
					Math.ceil(oSectionOverlay.getDomRef().getBoundingClientRect().left),
					Math.ceil(this.oSection.getDomRef().getBoundingClientRect().left),
					"left position of the Section overlay is correct"
				);
				assert.deepEqual(
					Math.ceil(oButtonOverlay.getDomRef().getBoundingClientRect().top),
					Math.ceil(this.oButton.getDomRef().getBoundingClientRect().top),
					"top position of the Button overlay is correct"
				);
				assert.deepEqual(
					Math.ceil(oButtonOverlay.getDomRef().getBoundingClientRect().left),
					Math.ceil(this.oButton.getDomRef().getBoundingClientRect().left),
					"left position of the Button overlay is correct"
				);
				fnDone();
			};

			this.oDesignTime.attachEventOnce("synced", () => {
				oSectionOverlay.attachEventOnce("geometryChanged", checkPositions);
				assert.ok(true, "DesignTime synced after Section was set to visible");
			});

			this.oSection.setVisible(true);
		});
	});

	QUnit.done(() => {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
