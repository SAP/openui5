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
		before() {
			// Place qunit-fixture on top of the page and make it large to avoid unexpected scrollbars
			document.getElementById("qunit-fixture").style.top = "0";
			document.getElementById("qunit-fixture").style.left = "0";
			document.getElementById("qunit-fixture").style.width = "1200px";
			document.getElementById("qunit-fixture").style.height = "800px";
		},

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
				height: "800px",
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
				// Collect the values before outputing results so the changes in the DOM do not affect the results
				const iSectionOverlayTop = Math.ceil(this.oSection.getDomRef().getBoundingClientRect().top);
				const iSectionTop = Math.ceil(oSectionOverlay.getDomRef().getBoundingClientRect().top);
				const iSectionOverlayLeft = Math.ceil(oSectionOverlay.getDomRef().getBoundingClientRect().left);
				const iSectionLeft = Math.ceil(this.oSection.getDomRef().getBoundingClientRect().left);
				const iButtonOverlayLeft = Math.ceil(oButtonOverlay.getDomRef().getBoundingClientRect().left);
				const iButtonLeft = Math.ceil(this.oButton.getDomRef().getBoundingClientRect().left);
				const iButtonOverlayTop = Math.ceil(oButtonOverlay.getDomRef().getBoundingClientRect().top);
				const iButtonTop = Math.ceil(this.oButton.getDomRef().getBoundingClientRect().top);
				assert.ok(this.oSection.getDomRef(), "Section is placed on DOM tree");
				assert.ok(oSectionOverlay.getDomRef(), "Section overlay is placed on the DOM tree");
				assert.deepEqual(
					iSectionOverlayTop,
					iSectionTop,
					"top position of the Section overlay is correct"
				);
				assert.deepEqual(
					iSectionOverlayLeft,
					iSectionLeft,
					"left position of the Section overlay is correct"
				);
				assert.deepEqual(
					iButtonOverlayTop,
					iButtonTop,
					"top position of the Button overlay is correct"
				);
				assert.deepEqual(
					iButtonOverlayLeft,
					iButtonLeft,
					"left position of the Button overlay is correct"
				);
				fnDone();
			};

			const runAssertions = () => {
				if (this.oLayout._hasOngoingScrollToSection()) {
					// The timeout is to ensure that all scrolling is done before checking the positions
					setTimeout(runAssertions, 500);
				} else {
					checkPositions();
				}
			};

			this.oDesignTime.attachEventOnce("synced", () => {
				oSectionOverlay.attachEventOnce("geometryChanged", runAssertions);
			});

			this.oSection.setVisible(true);
		});
	});

	QUnit.done(() => {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
