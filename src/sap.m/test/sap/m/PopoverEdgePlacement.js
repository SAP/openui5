sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/Input",
	"sap/m/StandardListItem",
	"sap/m/Select",
	"sap/m/Bar",
	"sap/ui/core/Item",
	"sap/m/library",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/CheckBox",
	"sap/base/i18n/Localization"
], function (
	JSONModel,
	App,
	Page,
	Popover,
	Button,
	List,
	Input,
	StandardListItem,
	Select,
	Bar,
	Item,
	mLibrary,
	HBox,
	VBox,
	CheckBox,
	Localization
) {
	"use strict";

	const data = [];

	for (let i = 0; i < 100; i++) {
		data.push({
			title: `Title ${i}`,
			description: `Description ${i}`.repeat(10),
			icon: "sap-icon://employee",
			iconInset: false,
			type: "Navigation"
		});
	}

	const oItemTemplate = new StandardListItem({
		title: "{title}",
		description: "{description}",
		icon: "{icon}",
		iconInset: "{iconInset}",
		type: "{type}"
	});
	const oList = new List();

	function bindListData (data, itemTemplate, list) {
		var oModel = new JSONModel();

		oModel.setData(data);
		list.setModel(oModel);
		list.bindAggregation("items", "/", itemTemplate);
	}

	bindListData(data, oItemTemplate, oList);

	const footer = new Bar();
	const oPopover = new Popover({
		showArrow: false,
		placement: mLibrary.PlacementType.Auto,
		footer: footer,
		content: [
			oList
		]
	});

	footer.addContentRight(
		new Button({
			text: "Close",
			press: function () {
				oPopover.close();
			}
		})
	);

	const oPlacementSelect = new Select("placementSelect", {
		selectedKey: oPopover.getPlacement(),
		items: Object.keys(mLibrary.PlacementType).map((sPlacement) => {
			return new Item({
				key: sPlacement,
				text: sPlacement
			});
		}),
		change: function (oEvent) {
			oPopover.setPlacement(oEvent.getParameter("selectedItem").getKey());
		}
	});

	const oShowArrowCb = new CheckBox({
		text: "Show Arrow",
		selected: oPopover.getShowArrow(),
		select: function (oEvent) {
			oPopover.setShowArrow(oEvent.getParameter("selected"));
		}
	});

	const oRtlCb = new CheckBox({
		text: "RTL",
		selected: Localization.getRTL(),
		select: function (oEvent) {
			Localization.setRTL(oEvent.getParameter("selected"));
		}
	});

	new App({
		initialPage: "page1",
		pages: [
			new Page("page1", {
				showHeader: false,
				content: [
					new HBox({
						justifyContent: "SpaceBetween",
						alignItems: "Center",
						height: "100%",
						items: [
							new Input("inputLeftEdge", {
								showValueHelp: true,
								placeholder: "1. Open Popover",
								valueHelpRequest: function () {
									oPopover.openBy(this);
								}
							}),
							new VBox({
								height: "100%",
								justifyContent: "SpaceBetween",
								items: [
									new Input("inputTopEdge", {
										showValueHelp: true,
										placeholder: "2. Open Popover",
										valueHelpRequest: function () {
											oPopover.openBy(this);
										}
									}),
									new VBox({
										items: [
											oPlacementSelect,
											oShowArrowCb,
											oRtlCb
										]
									}),
									new Input("inputBottomEdge", {
										showValueHelp: true,
										placeholder: "3. Open Popover",
										valueHelpRequest: function () {
											oPopover.openBy(this);
										}
									})
								]
							}),
							new Input("inputRightEdge", {
								showValueHelp: true,
								placeholder: "4. Open Popover",
								valueHelpRequest: function () {
									oPopover.openBy(this);
								}
							})
						]
					})
				]
			}).addStyleClass("sapUiContentPadding")
		]
	}).placeAt("body");
});
