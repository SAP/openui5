// Note: the HTML page 'SideNavigationGroups.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/Device",
	"sap/tnt/SideNavigation",
	"sap/tnt/NavigationList",
	"sap/tnt/NavigationListItem",
	"sap/tnt/NavigationListGroup",
	"sap/tnt/ToolPage",
	"sap/tnt/ToolHeader",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/library",
	"sap/m/Title",
	"sap/m/Image",
	"sap/m/OverflowToolbar"
], (Device, SideNavigation, NavigationList, NavigationListItem, NavigationListGroup,
	ToolPage, ToolHeader, Button, CheckBox, mLibrary, Title, Image, OverflowToolbar) => {
	"use strict";

	const ButtonType = mLibrary.ButtonType;
	const OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;
	const OverflowToolbarLayoutData = mLibrary.OverflowToolbarLayoutData;

	const oSN = new SideNavigation("SN", {
		item: new NavigationList("NL", {
			items: [
				new NavigationListItem({ text: "Home", icon: "sap-icon://home" }),
				new NavigationListGroup({
					text: "New",
					items: [
						new NavigationListItem({ text: "Cards", icon: "sap-icon://card" }),
						new NavigationListItem({ text: "Building", icon: "sap-icon://building" }),
					]
				}),
				new NavigationListGroup({
					text: "Recently used with a long overflowing title",
					items: [
						new NavigationListItem({ text: "Example", icon: "sap-icon://example" }),
						new NavigationListItem({ text: "Heatmap Chart", icon: "sap-icon://heatmap-chart" }),
						new NavigationListItem({
							text: "Machine",
							icon: "sap-icon://machine",
							items: [
								new NavigationListItem({ text: "Supply Chain" }),
								new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", text: "External Link", icon: "sap-icon://attachment" }),
								new NavigationListItem({ text: "Schematics" }),
							]
						}),
					]
				}),
				new NavigationListItem({ text: "People", icon: "sap-icon://people-connected" }),
				new NavigationListItem({ text: "Overview Chart", icon: "sap-icon://overview-chart" }),
				new NavigationListItem({ text: "Managing My Area", icon: "sap-icon://kpi-managing-my-area" }),
				new NavigationListItem({ text: "Curriculum", icon: "sap-icon://curriculum" }),
				new NavigationListItem({ text: "Flight", icon: "sap-icon://flight" }),
				new NavigationListItem({ text: "Radar Chart", icon: "sap-icon://multiple-radar-chart" }),
				new NavigationListItem({ text: "Lateness", icon: "sap-icon://lateness" }),
				new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", text: "External Link", icon: "sap-icon://attachment" }),

				new NavigationListItem({ text: "Map", icon: "sap-icon://map-2" }),
				new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", text: "External Link", icon: "sap-icon://attachment" }),

				new NavigationListItem({ text: "Nutrition Activity", icon: "sap-icon://nutrition-activity" }),
				new NavigationListItem({ text: "Box", icon: "sap-icon://sap-box", }),
				new NavigationListItem({ text: "Pool", icon: "sap-icon://pool" }),
				new NavigationListGroup({
					text: "Restricted",
					enabled: false,
					items: [
						new NavigationListItem({ text: "Scissors", icon: "sap-icon://scissors" }),
						new NavigationListItem({ text: "Running", icon: "sap-icon://physical-activity" }),
					]
				}),
				new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", text: "External Link", icon: "sap-icon://attachment" }),
				new NavigationListItem({ text: "Passenger Train", icon: "sap-icon://passenger-train" }),
				new NavigationListItem({
					text: "Mileage",
					icon: "sap-icon://mileage",
					items: [
						new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", text: "External Link", icon: "sap-icon://attachment" }),
						new NavigationListItem({ text: "Driven" }),
						new NavigationListItem({ text: "Walked" }),
						new NavigationListItem({ selectable: false, href: "https://sap.com", text: "No Target Link", icon: "sap-icon://attachment" }),

					]
				}),
			]
		}),
		fixedItem: new NavigationList({
			items: [
				new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", text: "External Link", icon: "sap-icon://attachment" }),
				new NavigationListItem({ selectable: true, text: "Bar Chart", icon: "sap-icon://bar-chart" }),
				new NavigationListItem({ selectable: false, text: "Compare", icon: "sap-icon://compare" }),
			]
		})
	});

	const oToggleExpandedButton = new Button("toggleExpanded", {
		icon: "sap-icon://menu2",
		tooltip: "Menu",
		type: ButtonType.Transparent,
		press: function () {
			const bExpanded = oTP.getSideExpanded();
			this.setTooltip(bExpanded ? "Large Size Navigation" : "Small Size Navigation");
			oTP.setSideExpanded(!bExpanded);
		},
		layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow })
	});

	const oDensityCheckBox = new CheckBox("density", {
		selected: document.body.classList.contains("sapUiSizeCompact"),
		text: "Compact Mode",
		select: (oEvent) => {
			document.body.classList.toggle("sapUiSizeCompact", oEvent.getParameter("selected"));
		},
		layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow })
	});

	const oTH = new ToolHeader("TH", {
		content: [
			oToggleExpandedButton,
			new Image({
				src: "./images/SAP_Logo.png",
				tooltip: "SAP logo",
				decorative: false,
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow })
			}),
			new Title({
				id: "headerTitle",
				text: "ToolPage with SideNavigation with Groups",
				wrapping: false
			}),
		]
	});

	const sRange = Device.media.getCurrentRange("StdExt").name;
	if (["Phone", "Tablet"].some(el => el === sRange)) {
		oToggleExpandedButton.setTooltip("Large Size Navigation");
	}

	const oTP = new ToolPage({
		header: oTH,
		sideContent: oSN,
		mainContents: oDensityCheckBox,
	}).placeAt("body");
});