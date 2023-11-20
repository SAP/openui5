sap.ui.define([
	"sap/m/semantic/EditAction",
	"sap/m/semantic/AddAction",
	"sap/m/semantic/SortAction",
	"sap/m/semantic/FilterAction",
	"sap/m/semantic/GroupAction",
	"sap/m/semantic/FlagAction",
	"sap/m/semantic/FavoriteAction",
	"sap/m/semantic/SendEmailAction",
	"sap/m/semantic/SendMessageAction",
	"sap/m/semantic/DiscussInJamAction",
	"sap/m/semantic/ShareInJamAction",
	"sap/m/semantic/PrintAction",
	"sap/m/semantic/MultiSelectAction",
	"sap/m/semantic/MasterPage",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/ui/core/library",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/semantic/DetailPage",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/SplitContainer",
	"sap/m/App"
], function(
	EditAction,
	AddAction,
	SortAction,
	FilterAction,
	GroupAction,
	FlagAction,
	FavoriteAction,
	SendEmailAction,
	SendMessageAction,
	DiscussInJamAction,
	ShareInJamAction,
	PrintAction,
	MultiSelectAction,
	MasterPage,
	PageAccessibleLandmarkInfo,
	coreLibrary,
	List,
	StandardListItem,
	DetailPage,
	SimpleForm,
	layoutLibrary,
	Title,
	Label,
	MText,
	SplitContainer,
	App
) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	// shortcut for sap.ui.core.AccessibleLandmarkRole
	var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

	var oMaster = new MasterPage("masterPage", {
		landmarkInfo: new PageAccessibleLandmarkInfo({
			headerRole: AccessibleLandmarkRole.Banner,
			headerLabel: "Header label from LandmarkInfo",
			subHeaderRole: AccessibleLandmarkRole.Banner,
			subHeaderLabel: "SubHeader label from LandmarkInfo",
			rootRole: AccessibleLandmarkRole.Region,
			rootLabel: "Root label from LandmarkInfo",
			contentRole: AccessibleLandmarkRole.Main,
			contentLabel: "Content label from LandmarkInfo",
			footerRole: AccessibleLandmarkRole.Banner,
			footerLabel: "Footer label from LandmarkInfo"
		}),
		title:"Master Test page",
		titleLevel: "H1",
		showNavButton: true,
		addAction: new AddAction(),
		sort: new SortAction(),
		filter: new FilterAction(),
		group: new GroupAction(),
		multiSelectAction: new MultiSelectAction(),
		content: [
			new List({
				ariaLabelledBy: "masterPage-title",
				items: [new StandardListItem({
					title : "John Doe",
					description : "Employee Record"
				})]
			})
		]
	});

	var oDetail = new DetailPage("detailPage", {
		title:"Detail Test page",
		titleLevel: "H2",
		editAction: new EditAction(),
		flagAction: new FlagAction(),
		favoriteAction: new FavoriteAction(),
		sendEmailAction: new SendEmailAction(),
		sendMessageAction: new SendMessageAction(),
		discussInJamAction: new DiscussInJamAction(),
		shareInJamAction: new ShareInJamAction(),
		printAction: new PrintAction(),
		content: [
			new SimpleForm({
				layout: SimpleFormLayout.ColumnLayout,
				columnsL: 1,
				columnsM: 1,
				content: [
					new Title({text:"Detailed Info", level: "H3"}),
					new Label({text: "Name"}),
					new MText({text: "John Doe"}),
					new Label({text: "Job Title"}),
					new MText({text: "Developer"}),
					new Label({text: "Job Grade"}),
					new MText({text: "Senior"})
				]
			})
		]
	});

	var oSplitContainer = new SplitContainer({
		masterPages: [oMaster],
		detailPages: [oDetail]
	});

	oMaster.attachEvent("navButtonPress", function () {
		oSplitContainer.hideMaster();
	});

	new App("myApp", {
		pages: [oSplitContainer]

	}).placeAt("body");
});
