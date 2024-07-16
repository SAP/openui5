sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Link",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/SplitApp",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/Device",
	"sap/ui/layout/BlockLayout",
	"sap/ui/layout/BlockLayoutCell",
	"sap/ui/layout/BlockLayoutRow",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library"
], function(App, Button, CheckBox, DatePicker, Input, Label, mobileLibrary, Link, List, Page, Select, SplitApp, StandardListItem, Text, TextArea, Element, Icon, Item, Title, Device, BlockLayout, BlockLayoutCell, BlockLayoutRow, SimpleForm, layoutLibrary) {
	"use strict";

	var BackgroundDesign = layoutLibrary.BackgroundDesign;
	var InputType = mobileLibrary.InputType;
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	var sTextLorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.";

	var fnCreateForm = function () {
		return new SimpleForm({
			editable: true,
			backgroundDesign: BackgroundDesign.Transparent,
			layout: SimpleFormLayout.GridLayout,
			content: [
				new Title({ // this starts a new group
					text: "Editable Form"
				}),
				new Label({
					text: 'sap.m.Input'
				}),
				new Input({
					type: InputType.Text,
					placeholder: 'Enter Name ...'
				}),
				new Label({
					text: 'sap.m.CheckBox'
				}),
				new CheckBox({
					selected: true
				}),
				new Label({
					text: 'sap.m.Select'
				}),
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
				new Label({
					text: 'sap.m.Link'
				}),
				new Link({
					text: 'SAP Germany',
					target: 'http://www.sap.com'
				}),
				new Label({
					text: 'sap.m.TextArea'
				}),
				new TextArea({
					placeholder: "Please add your comment",
					rows: 6,
					maxLength: 255,
					width: "100%"
				}),
				new Label({
					text: 'Short sap.m.Text'
				}),
				new Text({
					text: '69190 Walldorf'
				}),
				new Label({
					text: 'Long sap.m.Text'
				}),
				new Text({
					text: '69190 Walldorf, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt' +
					' eu felis. In hac habitasse platea dictumst. 69190 Walldorf, Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
					' Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst.'
				})
			]
		});
	};

	var fnCreateCell = function (width, title, content, alignment, titleLink) {
		content = content || new Text({
					text: sTextLorem
				});
		width = width || 0;
		return new BlockLayoutCell({
			content: content,
			width: width,
			title: title,
			titleAlignment: alignment,
			titleLink: titleLink
		});
	};

	var fnCreateBlockLayout = function (sBackground, sText) {
		var oCell1 = fnCreateCell(1),
				oCell2 = fnCreateCell(1, "An Icon", new Icon({src: "sap-icon://arrow-right"})),
				oCell3 = fnCreateCell(1, "Tomato Heading", [
					new Text({text: sText.substr(0, 20)})
				], "Center"),
				oCell4 = fnCreateCell(3, null, fnCreateForm(), null, new Link({text:"Test link", href:"http://www.sap.com"}));

		return new BlockLayout({
			id: "layout-" + sBackground.toLowerCase(),
			background: sBackground,
			content: [
				new BlockLayoutRow({
					content: [
						fnCreateCell(1, "Green is good for u"),
						oCell4
					],
					accentCells: [oCell4]
				}),
				new BlockLayoutRow({
					content: [
						oCell1,
						oCell2,
						fnCreateCell(2, "Custom", null, "Right", new Link({text:"Custom - test link", href:"http://www.sap.com"}))
					],
					accentCells: [oCell1, oCell2]
				}),
				new BlockLayoutRow({
					content: [
						fnCreateCell(1, null, new Text({text: sText + sText})),
						oCell3,
						fnCreateCell(1, null, null, null, new Link({text:"Test link", href:"http://www.sap.com"})),
						fnCreateCell(1, "<Escaped?>")
					],
					accentCells: [oCell3]
				}),
				new BlockLayoutRow({
					scrollable: true,
					content: [
						fnCreateCell(null, null, new Text({text: sText + sText})),
						fnCreateCell(null, "Scrolling Row Heading", null,null, new Text({text:"Test text - should not be visualized"})),
						fnCreateCell(),
						fnCreateCell(),
						fnCreateCell(),
						fnCreateCell()
					]
				}),
				new BlockLayoutRow({
					content: fnCreateCell(1)
				}),
				new BlockLayoutRow({
					content: fnCreateCell(1)
				}),
				new BlockLayoutRow({
					content: fnCreateCell(1)
				}),
				new BlockLayoutRow({
					content: fnCreateCell(1)
				})
			]
		});
	};

	var fnCreatePage = function (sBackground, oBlockLayout) {
		return new Page("area-" + sBackground.toLowerCase(), {
			title: sBackground + " BlockLayout",
			showNavButton: Device.system.phone,
			navButtonText: "Back",
			navButtonPress: function () {
				Element.getElementById("block-layout-demo").backDetail();
			},
			content: [oBlockLayout]
		});
	};

	var fnCreateListItem = function (sBackground) {
		return new StandardListItem({
			id: "navigate-to-" + sBackground.toLowerCase(),
			title: sBackground + " BlockLayout",
			type: "Active",
			press: function () {
				Element.getElementById("block-layout-demo").toDetail("area-" + sBackground.toLowerCase());
			}
		});
	};

	var aLayoutTypes = ["Default", "Light", "Accent", "Dashboard"];

	var aMasterPageItems = [],
			aDetailPages = [];

	aLayoutTypes.forEach(function (sLayoutType) {
		aMasterPageItems.push(fnCreateListItem(sLayoutType));
		aDetailPages.push(fnCreatePage(sLayoutType, fnCreateBlockLayout(sLayoutType, sTextLorem)));
	});

	new SplitApp({
		id: "block-layout-demo",
		masterPages: [new Page({
			title: "Navigation",
			content: [new List({items: aMasterPageItems})]
		})],
		detailPages: aDetailPages
	}).placeAt("content");
});