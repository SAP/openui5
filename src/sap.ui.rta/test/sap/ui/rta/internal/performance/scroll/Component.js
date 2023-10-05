sap.ui.define([
	"dt/performance/PerformanceTestUtil",
	"rta/performance/RtaPerformanceTestUtil",
	"sap/m/Panel",
	"sap/ui/core/UIComponent",
	"sap/ui/layout/VerticalLayout",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/Core",
	"sap/ui/core/Element"
], function(
	DtPerformanceTestUtil,
	RtaPerformanceTestUtil,
	Panel,
	UIComponent,
	VerticalLayout,
	ObjectPageHeader,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	oCore,
	Element
) {
	"use strict";

	return UIComponent.extend("rta.performance.scroll.Component", {
		metadata: {
			manifest: "json"
		},

		onAfterRendering() {
			window.fnResolve(RtaPerformanceTestUtil.startRta(Element.registry.get("opLayout")));
		},

		createContent() {
			var oHeaderLayout = new Panel("layout-header");
			DtPerformanceTestUtil.addMixedControlsTo(oHeaderLayout, 1, 10, true /* visible */);
			DtPerformanceTestUtil.addMixedControlsTo(oHeaderLayout, 11, 20, false /* invisible */);

			var oFirstSectionPanel = new VerticalLayout("panel1");
			DtPerformanceTestUtil.addMixedControlsTo(oFirstSectionPanel, 21, 30, true /* visible */);
			DtPerformanceTestUtil.addMixedControlsTo(oFirstSectionPanel, 31, 40, false /* invisible */);

			var oSecondSectionPanel = new VerticalLayout("panel2");
			DtPerformanceTestUtil.addMixedControlsTo(oSecondSectionPanel, 41, 60, true /* visible */);
			DtPerformanceTestUtil.addMixedControlsTo(oSecondSectionPanel, 61, 80, false /* invisible */);

			var oObjectPageLayout = new ObjectPageLayout("opLayout", {
				headerTitle: new ObjectPageHeader("opHeader", {
					objectTitle: "RtaPerformance",
					objectSubtitle: "ScrollTest"
				}),
				headerContent: oHeaderLayout,
				sections: [
					new ObjectPageSection("opSection1", {
						title: "section1",
						subSections: [
							new ObjectPageSubSection("opSubSection1", {
								title: "subsection1",
								blocks: [oFirstSectionPanel]
							})
						]
					}),
					new ObjectPageSection("opSection2", {
						title: "section2",
						subSections: [
							new ObjectPageSubSection("opSubSection2", {
								title: "subsection2",
								blocks: [oSecondSectionPanel]
							})
						]
					})
				]
			});
			return oObjectPageLayout;
		}
	});
});
