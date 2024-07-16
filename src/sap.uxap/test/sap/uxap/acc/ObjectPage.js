sap.ui.define([
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Button",
	"sap/ui/core/InvisibleText",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/ObjectAttribute"
], function(HBox, VBox, Title, Label, Link, Button, InvisibleText, ObjectPageLayout, ObjectPageDynamicHeaderTitle, ObjectPageSection, ObjectPageSubSection, ObjectAttribute) {
	"use strict";

	new InvisibleText("phone-inv-text", { text: "Phone" }).toStatic();

	new ObjectPageLayout({
		headerTitle: new ObjectPageDynamicHeaderTitle({
			expandedHeading: [
				new HBox({
					items: [
						new undefined/*Avatar*/({ displayShape: "Square" }).addStyleClass("sapUiTinyMarginEnd"),
						new VBox({
							items: [
								new Title({ text: "Denise Smith", level: "H1" }),
								new Label({ text: "Web developer" })
							]
						})
					]
				})
			],
			snappedHeading: [
				new VBox({
					items: [
						new Title({ text: "Denise Smith", level: "H1" }),
						new Label({ text: "Web developer" })
					]
				})
			],
			actions: [
				new Button({ text: "Edit", type: "Emphasized", icon: "sap-icon://edit", tooltip: "Edit" }),
				new Button({ text: "Delete", type: "Transparent", icon: "sap-icon://delete", tooltip: "Delete" }),
				new Button({ text: "Copy", type: "Transparent", icon: "sap-icon://copy", tooltip: "Copy" }),
				new Button({ type: "Transparent", icon: "sap-icon://share", tooltip: "Share" })
			]
		}),
		headerContent: [
			new Label({ text: "Hello! I am Denise and I use UxAP", wrapping: true }),
			new ObjectAttribute({
				title: "Phone",
				customContent: new Link({ text: "+33 6 4512 5158", ariaLabelledBy: ["phone-inv-text"] }),
				active: true
			})
		],
		sections: [
			new ObjectPageSection({
				title: "Goals plan",
				subSections: new ObjectPageSubSection({
					blocks: new Label({ text: "Block1" })
				})
			}),
			new ObjectPageSection({
				title: "Employment",
				subSections: new ObjectPageSubSection({
					blocks: new Label({ text: "Block2" }),
					moreBlocks: new Label({ text: "Another block" })
				})
			}),
			new ObjectPageSection({
				title: "Personal",
				subSections: new ObjectPageSubSection({
					blocks: new Label({ text: "Block3" })
				})
			})
		]
	}).placeAt('content');
});
