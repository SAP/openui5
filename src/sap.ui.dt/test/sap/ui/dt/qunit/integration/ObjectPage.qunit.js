/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/VBox",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function(
	Button,
	VBox,
	DesignTime,
	OverlayRegistry,
	ObjectPageHeader,
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
				headerTitle: new ObjectPageHeader({
					objectTitle: "Title"
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

			oSectionOverlay.attachEventOnce("geometryChanged", () => {
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
			});

			this.oSection.setVisible(true);
		});
	});

	QUnit.done(() => {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
