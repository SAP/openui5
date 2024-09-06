sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/m/App",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/layout/library",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/util/Mobile"
], function(
	Localization,
	App,
	Input,
	Label,
	Button,
	Page,
	Select,
	Switch,
	MText,
	Toolbar,
	Element,
	Item,
	layoutLibrary,
	VerticalLayout,
	SimpleForm,
	JSONModel,
	ResourceModel,
	Mobile
) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	Mobile.init({preventScroll : false});
	var oModel = new JSONModel({
		"globalRequired": false
	});
	var oResourceModel = new ResourceModel({
		bundleUrl: "label/i18n/i18n.properties"
	});
	var sLabelWidth = "100%";
	var oVL = new VerticalLayout("oVL", {
		content:[
			new Label({
				required: "{/globalRequired}",
				text: "Label with text set:",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl1", {
				required: "{/globalRequired}",
				text:'mobile standard label '
			}),

			new Label("lbl2", {
				required: true,
				text:'required label'
			}),

			new Label({
				required: "{/globalRequired}",
				text: "Label with design property set: ",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl3", {
				required: "{/globalRequired}",
				text: "mobile bold label",
				design: "Bold"
			}),

			new Label({
				required: "{/globalRequired}",
				text: "Label with textDirection property set:",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl4", {
				required: "{/globalRequired}",
				text: "mobile LTR label",
				textDirection: "LTR",
				width: sLabelWidth
			}),

			new Label("lbl5", {
				required: "{/globalRequired}",
				text: "mobile RTL label",
				textDirection: "RTL",
				width: sLabelWidth
			}),

			new Label("lbl6", {
				required: "{/globalRequired}",
				text: "mobile Inherit label",
				textDirection: "Inherit",
				width: sLabelWidth
			}),

			new Label({
				required: "{/globalRequired}",
				text: "Label with textAlign property set:",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl7", {
				required: "{/globalRequired}",
				text: "mobile begin label",
				width: sLabelWidth,
				textAlign: "Begin"
			}),

			new Label("lbl8", {
				required: "{/globalRequired}",
				text: "mobile center label",
				width: sLabelWidth,
				textAlign: "Center"
			}),

			new Label("lbl9", {
				required: "{/globalRequired}",
				text: "mobile end label",
				width: sLabelWidth,
				textAlign: "End"
			}),

			new Label("lbl10", {
				required: "{/globalRequired}",
				text: "mobile left label",
				width: sLabelWidth,
				textAlign: "Left"
			}),

			new Label("lbl11", {
				required: "{/globalRequired}",
				text: "mobile right label",
				width: sLabelWidth,
				textAlign: "Right"
			}),

			new Label({
				required: "{/globalRequired}",
				text: "Label with no text:",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl12", {
				required: "{/globalRequired}",
				text: ""
			}),

			new Label({
				required: "{/globalRequired}",
				text: "Label with width property set:",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl13", {
				required: "{/globalRequired}",
				text: "mobile label with width set to 250px with loooooooooooooooooooooooooooooooong content",
				width: "250px"
			}),
			new Label({
				required: "{/globalRequired}",
				text: "Label with fixed width and required and showColon properties set:",
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lblcolonrequired", {
				required: true,
				showColon: true,
				text: "Profit Center Hierarchy for Elimination",
				width: "239px"
			}),
			new Label({
				required: "{/globalRequired}",
				text: 'Label with displayOnly property set to "true":',
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl8a", {
				required: "{/globalRequired}",
				text: "mobile label in display mode",
				displayOnly: true
			}),
			new Label({
				required: "{/globalRequired}",
				text: 'Label with wrappingType property set to "Hyphenated":',
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),

			new Label("lbl14", {
				required: "{/globalRequired}",
				text: 'mobile label with loooooooooooooooooooooooooooooooong words, wrappingType property set to "Hyphenated" and wrapping set to "true"',
				width: "100px",
				wrapping: true,
				wrappingType: "Hyphenated"
			})
		]
	});

	var oVL2 = new VerticalLayout("oVL2", {
		content:[
			new MText("heading", {
				text: '\n Below are examples for testing the right-to-left special cases such as numerals, phone numbers, etc. To switch the page direction to right-to-left, please paste the following parameter at the end of the URL -> &sap-ui-rtl=true'
			}),
			new Label({
				required: "{/globalRequired}",
				text: "Default behavior:",
				width: '100%',
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),
			new Label({
				required: "{/globalRequired}",
				text: '(012) 345 678',
				width: '100%'
			}),
			new Label({
				required: "{/globalRequired}",
				text: 'LTR content direction, wrong default alignment:',
				width: '100%',
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),
			new Label({
				required: "{/globalRequired}",
				text: '(012) 345 678',
				textDirection: 'LTR',
				width: '100%'
			}),
			new Label({
				required: "{/globalRequired}",
				text: 'LTR content direction, right alignment:',
				width: '100%',
				wrapping: true,
				wrappingType: "Normal",
				design: "Bold"
			}),
			new Label({
				required: "{/globalRequired}",
				text: '(012) 345 678',
				textDirection: 'LTR',
				textAlign: 'Right',
				width: '100%'
			}),
			new Label("truncatedRequiredLabel", {
				text: "Simple Label Simple LabelSimple LabelSimple LabelSimple",
				width: "200px",
				required: "{/globalRequired}"
			}),
			new Label("requiredLabelWithColon", {
				text: "Label with colon",
				width: "100%",
				showColon: true,
				required: "{/globalRequired}"
			})
		]
	});

	var oVL3 = new VerticalLayout({
		id: "oVL3",
		content: [
			new Label({text: "textDirection=Inherit", wrapping: true, wrappingType: "Normal", design: "Bold"}),
			new Label({
				required: "{/globalRequired}",
				text: "\u05DB\u05DE\u05D4 \u05E9\u05E4\u05D5\u05EA \u05D0\u05EA\u05D4 \u05DE\u05D3\u05D1\u05E8? English \u05D5\u05E2\u05D1\u05E8\u05D9\u05EA.",
				textDirection: "Inherit"
			}),
			new Label({
				required: "{/globalRequired}",
				text: "Do you speak any RTL languages? \u05DB\u05DF \u05D0\u05E0\u05D9 \u05DB\u05DF.",
				textDirection: "Inherit"
			}),

			new Label({text: "textDirection=LTR", wrapping: true, wrappingType: "Normal", design: "Bold"}),
			new Label({
				required: "{/globalRequired}",
				text: "\u05DB\u05DE\u05D4 \u05E9\u05E4\u05D5\u05EA \u05D0\u05EA\u05D4 \u05DE\u05D3\u05D1\u05E8? English \u05D5\u05E2\u05D1\u05E8\u05D9\u05EA.",
				textDirection: "LTR"
			}),
			new Label({
				required: "{/globalRequired}",
				text: "Do you speak any RTL languages? \u05DB\u05DF \u05D0\u05E0\u05D9 \u05DB\u05DF.",
				textDirection: "LTR"
			}),

			new Label({text: "textDirection=RTL", wrapping: true, wrappingType: "Normal", design: "Bold"}),
			new Label({
				required: "{/globalRequired}",
				text: "\u05DB\u05DE\u05D4 \u05E9\u05E4\u05D5\u05EA \u05D0\u05EA\u05D4 \u05DE\u05D3\u05D1\u05E8? English \u05D5\u05E2\u05D1\u05E8\u05D9\u05EA.",
				textDirection: "RTL"
			}),
			new Label({
				required: "{/globalRequired}",
				text: "Do you speak any RTL languages? \u05DB\u05DF \u05D0\u05E0\u05D9 \u05DB\u05DF.",
				textDirection: "RTL"
			})
		]
	});

	var oVL4 = new VerticalLayout({
		id: "oVL4",
		width: "100%",
		content: [
			new Label({text: "truncation + colon", wrapping: true, wrappingType: "Normal", design: "Bold"}),
			new Label({text: "{i18n>longLabel}", showColon: true, width: "100px"}),
			new Label({text: "{i18n>longLabel}", showColon: true, width: "140px"}),
			new Label({text: "truncation + colon (resizing)", wrapping: true, wrappingType: "Normal", design: "Bold"}),
			new Label({id: "labelToResize", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi velit orci, sollicitudin nec cursus quis, pellentesque id neque", showColon: true}),
			new Button({id: "resizeBtn", text: "resize upper label to 260px", press: function () {
				Element.getElementById("labelToResize").setWidth("260px");
			}}),
			new Label({text: "truncation + colon + asterisk", wrapping: true, wrappingType: "Normal", design: "Bold"}),
			new Label({text: "{i18n>longLabel}", showColon: true, required: true, width: "100px"}),
			new Label({text: "{i18n>longLabel}", showColon: true, required: true, width: "140px"})
		]
	});

	var sf = new SimpleForm("simpleForm", {
		layout: SimpleFormLayout.ResponsiveGridLayout,
		editable: true,
		title: "Simple Form - ResponsiveGridLayout",
		content:[
			new Label("requiredTruncated", { text:"{i18n>longLabel}", required: true }),
			new Input(),
			new Label("truncated", { text:"{i18n>longLabel}" }),
			new Input(),
			new Label("requiredOnly", { text:"{i18n>simpleLabel}", required: true }),
			new Input(),
			new Label("requiredTruncatedNoWrap", { text:"{i18n>longLabel}", required: "{/globalRequired}", wrapping: false }),
			new Input()
		]
	});

	var sf2 = new SimpleForm("simpleForm2", {
		width: "300px",
		layout: SimpleFormLayout.ResponsiveGridLayout,
		editable: true,
		title: "Small Simple Form - ResponsiveGridLayout",
		content:[
			new Label("requiredTruncated2", { text:"{i18n>longLabel}", required: true }),
			new Input(),
			new Label("truncated2", { text:"{i18n>longLabel}", required: "{/globalRequired}" }),
			new Input(),
			new Label("requiredOnly2", {  text:"{i18n>simpleLabel}", required: true }),
			new Input(),
			new Label("requiredTruncatedNoWrap2", { text:"{i18n>longLabel}", required: "{/globalRequired}", wrapping: false }),
			new Input(),
			new Label({text:"'*' and ':' should NOT go on new line alone", required: true}),
			new Input()
		]
	});

	var oVL5 = new VerticalLayout({
		id: "oVL5",
		width: "130px",
		content: [
			new Label("reqLabelParentWidth", {text:"Lorem ipsum dolor sit amet, Lorem ipsum dolor sit amet", required:true}),
			new Label("reqColonLabelParentWidth", {text: "Lorem ipsum dolor sit amet, Lorem ipsum dolor sit amet", required:true, showColon: true})
		]
	});

	var oPage = new Page("myPage", {
		title: "sap.m.Label Test Page",
		subHeader: new Toolbar({
			content: [
				new Switch("requiredSwitch", {
					state: false,
					customTextOn: "*",
					customTextOff: "No *",
					change: function (oEvent) {
						oModel.setProperty("/globalRequired", oEvent.getParameter("state"));
					}
				}),
				new Switch("RTLSwitch", {
					state: false,
					customTextOn: "RTL",
					customTextOff: "LTR",
					change: function (oEvent) {
						Localization.setRTL(oEvent.getParameter("state"));
					}
				}),
				new Switch("cozySwitch",{
					state: false,
					customTextOn: "COZ",
					customTextOff: "COM",
					change: function() {
						document.body.classList.toggle("sapUiSizeCompact");
					}
				}),
				new Label("localeSelectLbl", {
					text: "Locale"
				}),
				new Select("localeSelect", {
					items: [
							new Item({
							key: "en",
							text: "en"
						}),

						new Item({
							key: "fr",
							text: "fr"
						}),

						new Item({
							key: "zh-CN",
							text: "zh-CN (Simplified Chinese)"
						}),

						new Item({
							key: "zh-TW",
							text: "zh-TW (Traditional Chinese)"
						}),

						new Item({
							key: "zh-Hans",
							text: "zh-Hans (Simplified Chinese)"
						}),

						new Item({
							key: "zh-Hant",
							text: "zh-Hant (Traditional Chinese)"
						})
					],
					ariaLabelledBy: "localeSelectLbl",
					change: function (oEvent) {
						var sLanguage = oEvent.getParameter("selectedItem").getKey();
						Localization.setLanguage(sLanguage);
						oPage.invalidate();
					}
				})
			]
		}),
		content: [
			new VerticalLayout({
				width: "100%",
				content: [
					oVL,
					oVL2,
					oVL3,
					oVL4,
					oVL5,
					sf, sf2
				]
			})
		]
	});

	oPage.addContent(new Label({text:"Simple Label Simple LabelSimple LabelSimple LabelSimple LabelSimple Label", required: true, wrapping: false}));
	oPage.addContent(new Label({text:"Simple Label Simple LabelSimple LabelSimple LabelSimple LabelSimple Label", required: true, wrapping: false}));

	var oApp = new App("myApp", {
		initialPage:"myPage"
	});
	oApp.addPage(oPage);

	oApp.setModel(oModel);
	oApp.setModel(oResourceModel, "i18n");

	oApp.placeAt("body");
});
