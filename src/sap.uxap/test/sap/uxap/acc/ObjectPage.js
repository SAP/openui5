sap.ui.define([
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/ObjectAttribute",
	"sap/ui/core/InvisibleText",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageHeaderActionButton",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection"
], function(Label, Link, ObjectAttribute, InvisibleText, ObjectPageHeader, ObjectPageHeaderActionButton, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection) {
	"use strict";

	new InvisibleText("phone-inv-text", {text: "Phone"}).toStatic();

	new ObjectPageLayout({
		showEditHeaderButton: true,
		headerTitle:
			new ObjectPageHeader({
				isObjectTitleAlwaysVisible: true,
				showPlaceholder: true,
				isObjectIconAlwaysVisible: true,
				objectTitle:"Denise Smith",
				objectSubtitle: "Web developer",
				actions: [
					new ObjectPageHeaderActionButton({ icon: "sap-icon://pull-down", tooltip: "show section", type: "Emphasized"}),
					new ObjectPageHeaderActionButton({ icon: "sap-icon://show", tooltip: "show state", type: "Emphasized"})
				]
			}),
		headerContent:[
			new Label({text:"Hello! I am Denise and I use UxAP", wrapping: true}),
			new ObjectAttribute({
				title: "Phone",
				customContent: new Link({text: "+33 6 4512 5158", ariaLabelledBy: ["phone-inv-text"] }),
				active: true
			})
			],
		sections: [
			new ObjectPageSection({
				title:"Goals plan",
				subSections: new ObjectPageSubSection({
					blocks: new Label({text: "Block1" })
				})
			}),
			new ObjectPageSection({
				title:"Employment",
				subSections: new ObjectPageSubSection({
					blocks: new Label({text: "Block2" }),
					moreBlocks: new Label({text: "Another block" })
				})
			}),
			new ObjectPageSection({
				title:"Personal",
				subSections: new ObjectPageSubSection({
					blocks: new Label({text: "Block3" })
				})
			})
		]
	}).placeAt('content');
});
