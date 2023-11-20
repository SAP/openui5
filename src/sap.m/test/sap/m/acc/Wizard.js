sap.ui.define([
	"sap/m/WizardStep",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/TextArea",
	"sap/m/Wizard"
], function(WizardStep, MText, VerticalLayout, Label, Input, TextArea, Wizard) {
	"use strict";

	var step1 = new WizardStep("firstStep", {
		validated: false,
		title: "User credentials",
		icon: "sap-icon://permission",
		content: [
			new MText({
				text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget turpis quis felis luctus consectetur. Nulla eros sem, tincidunt sit amet ipsum at, laoreet fringilla risus. Curabitur tempus arcu sit amet volutpat gravida. Sed blandit leo vel lectus tempus, ac laoreet dui tempus. Curabitur placerat orci a faucibus rutrum. Praesent mattis ante vel enim posuere, a luctus lacus posuere. Aliquam imperdiet leo sit amet auctor vestibulum. Nunc consequat, turpis faucibus porttitor eleifend, nisi eros auctor est, in ultricies magna elit in quam. Phasellus risus felis, cursus at libero sed, consequat tristique lectus. Nullam quis eros diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce dignissim turpis quis elit finibus elementum. Fusce aliquet enim ante. Morbi vitae turpis urna."
			}),
			new VerticalLayout({
				content: [
					new Label({
						text: "User name",
						labelFor: "nameInput"
					}),
					new Input("nameInput", {
						required: true,
						liveChange: function (oEvent) {
							var val = oEvent.getParameter("value");
							if (val.length > 3) {
								oWizard.validateStep(step1);
							} else {
								oWizard.invalidateStep(step1);
							}
						},
						change: function (oEvent) {
							var val = oEvent.getParameter("value");
							if (val.length <= 3) {
								oWizard.discardProgress(step1);
							}
						}
					})
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}),
		step2 = new WizardStep({
			validated: true,
			title: "Personal information",
			icon: "sap-icon://person-placeholder",
			content: [
				new MText({
					text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
				})
			]
		}),
		step3 = new WizardStep({
			validated: false,
			title: "Payment details",
			icon: "sap-icon://simple-payment",
			content: [
				new Label({
					labelFor: "wizardTextArea",
					text: "Comment:"
				}),
				new TextArea({
					id: "wizardTextArea",
					placeholder: "Please add your comment",
					rows: 6,
					maxLength: 255,
					width: "100%",
					required: true,
					liveChange: function (oEvent) {
						var val = oEvent.getParameter("value");
						if (val.length > 3) {
							oWizard.validateStep(step3);
						} else {
							oWizard.invalidateStep(step3);
						}
					},
					change: function (oEvent) {
						var val = oEvent.getParameter("value");
						if (val.length <= 3) {
							oWizard.discardProgress(step3);
						}
					}
				})
			]
		}),
		oWizard = new Wizard({
			width: "100%",
			showNextButton: true,
			steps: [step1, step2, step3]
		}).placeAt("content");
});
