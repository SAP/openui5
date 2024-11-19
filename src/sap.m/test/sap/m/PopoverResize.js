sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Element",
	"sap/m/App",
	"sap/m/Label",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/Popover",
	"sap/m/Bar",
	"sap/m/OverflowToolbar",
	"sap/m/library",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/m/Switch"
], function(
	Localization,
	SimpleForm,
	Element,
	App,
	Label,
	ToolbarSpacer,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	Page,
	VBox,
	Popover,
	Bar,
	OverflowToolbar,
	mLibrary,
	FlexBox,
	Text,
	Switch
) {
	"use strict";

	const popover = new Popover("popover", {
		title: "Popover Popover Popover Popover",
		placement: mLibrary.PlacementType.Top,
		content: [
			new Text({
				text: "This is a Popover control. Popover is a dialog that appears on top of the content and must be closed by user interaction. It can contain any kind of content. This is a Popover control. Popover is a dialog that appears on top of the content and must be closed by user interaction. It can contain any kind of content. "
			})
		],
		contentWidth: "200px",
		contentHeight: "100px",
		resizable: true,
		initialFocus: "closeBtn",
		footer: new OverflowToolbar({
			content: [
				new ToolbarSpacer(),
				new Button({
					text: "Button 1"
				}),
				new Button({
					text: "Button 2"
				}),
				new Button("closeBtn", {
					text: "Close",
					press: () => {
						popover.close();
					}
				})
			]
		})
	});

	const simpleForm = new SimpleForm({
		editable: true,
		content: [
			new Label({
				text: "Placement"
			}),
			new SegmentedButton({
				items: [
					new SegmentedButtonItem("top", { text: "Top", key: "Top" }),
					new SegmentedButtonItem("right", { text: "Right", key: "Right" }),
					new SegmentedButtonItem("bottom", { text: "Bottom", key: "Bottom" }),
					new SegmentedButtonItem("left", { text: "Left", key: "Left" })
				],
				selectionChange: (event) => {
					popover.setPlacement(event.getSource().getSelectedKey());
				}
			}),
			new Label({
				text: "Offset X"
			}),
			new SegmentedButton({
				items: [
					new SegmentedButtonItem("offsetX0", { text: "0", key: "0" }),
					new SegmentedButtonItem("offsetX100", { text: "100", key: "100" }),
					new SegmentedButtonItem("offsetXM100", { text: "-100", key: "-100" })
				],
				selectionChange: (event) => {
					popover.setOffsetX(parseInt(event.getSource().getSelectedKey()));
				}
			}),
			new Label({
				text: "Offset Y"
			}),
			new SegmentedButton({
				items: [
					new SegmentedButtonItem("offsetY0", { text: "0", key: "0" }),
					new SegmentedButtonItem("offsetY50", { text: "50", key: "50" }),
					new SegmentedButtonItem("offsetYM50", { text: "-50", key: "-50" })
				],
				selectionChange: (event) => {
					popover.setOffsetY(parseInt(event.getSource().getSelectedKey()));
				}
			}),
			new Label({
				text: "Opener Horizontal Alignment"
			}),
			new SegmentedButton({
				selectedKey: "Center",
				items: [
					new SegmentedButtonItem("openerStart", { text: "Start", key: "Start" }),
					new SegmentedButtonItem("openerCenter", { text: "Center", key: "Center" }),
					new SegmentedButtonItem("openerEnd", { text: "End", key: "End" })
				],
				selectionChange: (event) => {
					Element.getElementById("flexBox").setJustifyContent(event.getSource().getSelectedKey());
				}
			}),
			new Label({
				text: "Show Arrow"
			}),
			new Switch("showArrow", {
				state: true,
				customTextOn: "On",
				customTextOff: "Off",
				change: function (event) {
					popover.setShowArrow(event.getParameter("state"));
				}
			}),
			new Switch("rtl", {
				state: false,
				customTextOn: "RTL",
				customTextOff: "LTR",
				change: function (event) {
					Localization.setRTL(event.getParameter("state"));
				}
			})
		]
	});

	const vBox = new VBox({
		height: "100%",
		renderType: mLibrary.FlexRendertype.Bare,
		items: [
			simpleForm,
			new FlexBox("flexBox", {
				height: "100%",
				renderType: mLibrary.FlexRendertype.Bare,
				justifyContent: mLibrary.FlexJustifyContent.Center,
				alignItems: mLibrary.FlexAlignItems.Center,
				items: [
					new Button("btnOpen", {
						text: "Open Popover",
						press: function () {
							popover.openBy(this);
						}
					})
				]
			})
		]
	});

	const popoverResizePage = new Page("popoverResizePage", {
		title: "Popover Resize",
		content: [
			vBox
		],
		footer: new Bar()
	});

	const app = new App("myApp", {
		initialPage: "popoverResizePage"
	});
	app.addPage(popoverResizePage);
	app.placeAt("body");
});
