sap.ui.define([
	"./DynamicPageUtility",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/library",
	"sap/m/Link",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Wizard",
	"sap/m/WizardStep",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/layout/form/SimpleForm"
], function(oDynamicPageUtil, App, Button, CheckBox, Input, mobileLibrary, Link, MessageToast, Page, Select, Text, TextArea, Wizard, WizardStep, Element, Item, SimpleForm) {
	"use strict";

	var checkStep4 = function () {
		var bSelected1 = Element.getElementById("cBox1").getSelected(),
			bSelected2 = Element.getElementById("cBox2").getSelected(),
			bSelected3 = Element.getElementById("cBox3").getSelected(),
			bSelected4 = Element.getElementById("cBox4").getSelected(),
			bSelected5 = Element.getElementById("cBox5").getSelected();

		if (   (bSelected1 && bSelected2 && !bSelected5)
			|| (bSelected3 && !bSelected4)
			|| (bSelected4 && bSelected2 && bSelected1)) {
			oWizard.validateStep(oStep4);
		}
	};

	var oStep1 = new WizardStep({
		validated: false,
		title: "User credentials",
		icon: "sap-icon://permission",
		complete: function () {
			MessageToast.show("First step is complete");
		},
		content: [
			new Text({
				text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget turpis quis felis luctus consectetur. Nulla eros sem, tincidunt sit amet ipsum at, laoreet fringilla risus. Curabitur tempus arcu sit amet volutpat gravida. Sed blandit leo vel lectus tempus, ac laoreet dui tempus. Curabitur placerat orci a faucibus rutrum. Praesent mattis ante vel enim posuere, a luctus lacus posuere. Aliquam imperdiet leo sit amet auctor vestibulum. Nunc consequat, turpis faucibus porttitor eleifend, nisi eros auctor est, in ultricies magna elit in quam. Phasellus risus felis, cursus at libero sed, consequat tristique lectus. Nullam quis eros diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce dignissim turpis quis elit finibus elementum. Fusce aliquet enim ante. Morbi vitae turpis urna."
			}),
			new SimpleForm({
				maxContainerCols: 2,
				editable: true,
				content: [
					oDynamicPageUtil.getLabel("User name", "nameInput"),
					new Input("nameInput", {
						liveChange: function (oEvent) {
							var val = oEvent.getParameter("value");
							if (val.length > 8) {
								oWizard.validateStep(oStep1);
							} else {
								oWizard.invalidateStep(oStep1);
							}
						}
					}),
					oDynamicPageUtil.getLabel("E-mail"),
					new Input(),
					oDynamicPageUtil.getLabel("Male"),
					new CheckBox("maleIndicator"),
					oDynamicPageUtil.getLabel("Password"),
					new Input({
						type: "Password"
					}),
					oDynamicPageUtil.getLabel("Repeat Password"),
					new Input({
						type: "Password"
					})
				]
			})
		]
	});
	var oStep2 = new WizardStep({
		validated: true,
		title: "Personal information",
		icon: "sap-icon://person-placeholder",
		content: [
			new Text({
				text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
			})
		]
	});
	var oStep3 = new WizardStep({
		validated: true,
		title: "Payment details",
		icon: "sap-icon://simple-payment",
		content: [
			new SimpleForm({
				maxContainerCols: 2,
				editable: true,
				content: [
					oDynamicPageUtil.getLabel('sap.m.Select'),
					new Select({
						name: "select-name0",
						items: [
							new Item({
								key: "0",
								text: "item 0"
							}),
							new Item({
								key: "1",
								text: "item 1"
							}),
							new Item({
								key: "2",
								text: "item 2 is a little long"
							}),
							new Item({
								key: "3",
								text: "item 3"
							})
						]
					}),
					oDynamicPageUtil.getLabel('sap.m.Link'),
					new Link({
						text: 'SAP Germany',
						href: 'http://www.sap.com',
						target: '_blank'
					}),
					oDynamicPageUtil.getLabel('sap.m.TextArea'),
					new TextArea({
						placeholder: "Please add your comment",
						rows: 6,
						maxLength: 255,
						width: "100%"
					})
				]
			})
		]
	});
	var oStep4 = new WizardStep({
		validated: false,
		title: "Credit card information",
		icon: "sap-icon://credit-card",
		activate: function () {
			MessageToast.show("Credit card information step activated");
		},
		content: [
			new SimpleForm({
				maxContainerCols: 2,
				editable: true,
				content: [
					oDynamicPageUtil.getLabel("CC Number"),
					new Input(),
					oDynamicPageUtil.getLabel("Verification code"),
					new Input(),
					oDynamicPageUtil.getLabel("Lorem ipsum"),
					new CheckBox("cBox1", {
						text: "Ilbris",
						select: checkStep4
					}),
					new CheckBox("cBox2", {
						text: "Mohaseed",
						select: checkStep4
					}),
					new CheckBox("cBox3", {
						text: "Jukka",
						select: checkStep4
					}),
					new CheckBox("cBox4", {
						text: "Valvet",
						select: checkStep4
					}),
					new CheckBox("cBox5", {
						text: "Beerendes",
						select: checkStep4
					})
				]
			})
		]
	});
	var oStep5 = new WizardStep({
		validated: true,
		title: "Card contents",
		icon: "sap-icon://bar-code",
		content: [
			oDynamicPageUtil.getLabel("CC Number"),
			new Input(),
			oDynamicPageUtil.getLabel("Verification code"),
			new Input(),
			oDynamicPageUtil.getLabel("Lorem ipsum"),
			new CheckBox({
				text: "Ilbris"
			}),
			new CheckBox({
				text: "Mohaseed"
			}),
			new CheckBox({
				text: "Jukka"
			}),
			new CheckBox({
				text: "Valvet"
			}),
			new CheckBox({
				text: "Beerendes"
			})
		]
	});
	var oStep6 = new WizardStep({
		title: "Finishing touches",
		icon: "sap-icon://detail-view",
		validated: false,
		content: [
			new Text({
				text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
			}),
			new Button({
				text: "Verify final step",
				press: function () {
					oWizard.validateStep(oStep6);
				}
			}),
			new Button({
				text: "Discard progress",
				press: function () {
					oWizard.discardProgress(oStep1);
				}
			})
		]
	});

	var oWizard = new Wizard({
		width: "100%",
		showNextButton: true,
		complete: function () {
			MessageToast.show("Process finished");
		},
		steps: [oStep1, oStep2, oStep3, oStep4, oStep5, oStep6]
	});


	var fnToggleFooter = function () {
		oPage.setShowFooter(!oPage.getShowFooter());
	};

	var oToggleFooterButton = new Button({
		text: "Toggle footer",
		press: fnToggleFooter
	});

	var oTitle = oDynamicPageUtil.getTitle(oToggleFooterButton);
	var oHeader = oDynamicPageUtil.getHeader();
	var oFooter = oDynamicPageUtil.getFooter();

	oWizard.addStyleClass("sapUiResponsivePadding--content");
	oWizard.addStyleClass("sapUiResponsivePadding--header");

	var oPage = oDynamicPageUtil.getDynamicPageWithStickyHeader(false, oTitle, oHeader, oWizard, oFooter, oWizard);
	// Leaves the Wizard to handle the scroll
	oPage.setFitContent(true);
	oPage.setHeaderExpanded(false);
	// Makes the Wizard take 100% of the DynamicPage's width.
	oPage.addStyleClass("sapUiNoContentPadding");


	var oApp = new App();
	oApp.addPage(oPage).placeAt("body");
});
