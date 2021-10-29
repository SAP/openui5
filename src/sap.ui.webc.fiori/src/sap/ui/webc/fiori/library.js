/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.webc.fiori
 */
sap.ui.define([
		"sap/ui/webc/common/library",
		"sap/ui/webc/common/thirdparty/base/CSP",
		"./thirdparty/Assets"
	], // library dependency
	function(commonLibrary, CSP) {

		"use strict";

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "sap.ui.webc.fiori",
			version: "${version}",
			dependencies: ["sap.ui.core", "sap.ui.webc.common"],
			noLibraryCSS: true,
			designtime: "sap/ui/webc/main/designtime/library.designtime",
			interfaces: [
				"sap.ui.webc.fiori.IFilterItem",
				"sap.ui.webc.fiori.IFilterItemOption",
				"sap.ui.webc.fiori.INotificationAction",
				"sap.ui.webc.fiori.INotificationListItem",
				"sap.ui.webc.fiori.IProductSwitchItem",
				"sap.ui.webc.fiori.IShellBarItem",
				"sap.ui.webc.fiori.ISideNavigationItem",
				"sap.ui.webc.fiori.ISideNavigationSubItem",
				"sap.ui.webc.fiori.ISortItem",
				"sap.ui.webc.fiori.ITimelineItem",
				"sap.ui.webc.fiori.IUploadCollectionItem",
				"sap.ui.webc.fiori.IWizardStep"
			],
			types: [
				"sap.ui.webc.fiori.BarDesign",
				"sap.ui.webc.fiori.FCLLayout",
				"sap.ui.webc.fiori.IllustrationMessageType",
				"sap.ui.webc.fiori.PageBackgroundDesign",
				"sap.ui.webc.fiori.TimelineLayout",
				"sap.ui.webc.fiori.UploadState"
			],
			controls: [
				"sap.ui.webc.fiori.Bar",
				"sap.ui.webc.fiori.BarcodeScannerDialog",
				"sap.ui.webc.fiori.FilterItem",
				"sap.ui.webc.fiori.FilterItemOption",
				"sap.ui.webc.fiori.FlexibleColumnLayout",
				"sap.ui.webc.fiori.IllustratedMessage",
				"sap.ui.webc.fiori.NotificationAction",
				"sap.ui.webc.fiori.NotificationListGroupItem",
				"sap.ui.webc.fiori.NotificationListItem",
				"sap.ui.webc.fiori.Page",
				"sap.ui.webc.fiori.ProductSwitch",
				"sap.ui.webc.fiori.ProductSwitchItem",
				"sap.ui.webc.fiori.ShellBar",
				"sap.ui.webc.fiori.ShellBarItem",
				"sap.ui.webc.fiori.SideNavigation",
				"sap.ui.webc.fiori.SideNavigationItem",
				"sap.ui.webc.fiori.SideNavigationSubItem",
				"sap.ui.webc.fiori.SortItem",
				"sap.ui.webc.fiori.Timeline",
				"sap.ui.webc.fiori.TimelineItem",
				"sap.ui.webc.fiori.UploadCollection",
				"sap.ui.webc.fiori.UploadCollectionItem",
				"sap.ui.webc.fiori.ViewSettingsDialog",
				"sap.ui.webc.fiori.Wizard",
				"sap.ui.webc.fiori.WizardStep"
			],
			elements: [],
			extensions: {}
		});

		/**
		 * SAPUI5 library with controls based on UI5 Web Components
		 *
		 * @namespace
		 * @alias sap.ui.webc.fiori
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		var thisLib = sap.ui.webc.fiori;


		/**
		 * Interface for components that may be slotted inside <code>ui5-view-settings-dialog</code> as filter items
		 *
		 * @name sap.ui.webc.fiori.IFilterItem
		 * @interface
		 * @public
		 * @since 1.97.0
		 * @experimental Since 1.97.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-filter-item</code> as values
		 *
		 * @name sap.ui.webc.fiori.IFilterItemOption
		 * @interface
		 * @public
		 * @since 1.97.0
		 * @experimental Since 1.97.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted as an action inside <code>ui5-li-notification</code> and <code>ui5-li-notification-group</code>
		 *
		 * @name sap.ui.webc.fiori.INotificationAction
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside a notification list
		 *
		 * @name sap.ui.webc.fiori.INotificationListItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-product-switch</code> as items
		 *
		 * @name sap.ui.webc.fiori.IProductSwitchItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-shellbar</code> as items
		 *
		 * @name sap.ui.webc.fiori.IShellBarItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-side-navigation</code> as items
		 *
		 * @name sap.ui.webc.fiori.ISideNavigationItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-side-navigation-item</code> as sub-items
		 *
		 * @name sap.ui.webc.fiori.ISideNavigationSubItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-view-settings-dialog</code> as sort items
		 *
		 * @name sap.ui.webc.fiori.ISortItem
		 * @interface
		 * @public
		 * @since 1.97.0
		 * @experimental Since 1.97.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-timeline</code> as items
		 *
		 * @name sap.ui.webc.fiori.ITimelineItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-upload-collection</code> as items
		 *
		 * @name sap.ui.webc.fiori.IUploadCollectionItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-wizard</code> as wizard steps
		 *
		 * @name sap.ui.webc.fiori.IWizardStep
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Different types of Bar.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.BarDesign = {

			/**
			 * Floating Footer type - there is visible border on all sides
			 * @public
			 */
			FloatingFooter: "FloatingFooter",

			/**
			 * Footer type
			 * @public
			 */
			Footer: "Footer",

			/**
			 * Default type
			 * @public
			 */
			Header: "Header",

			/**
			 * Subheader type
			 * @public
			 */
			Subheader: "Subheader"
		};


		/**
		 * undefined
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.FCLLayout = {

			/**
				 * Desktop: -/-/100 only the End column is displayed Tablet: -/-/100 only the End column is displayed Phone: -/-/100 only the End column is displayed

Use to display a detail-detail page only, when the user should focus entirely on it.
				 * @public
				 */
			EndColumnFullScreen: "EndColumnFullScreen",

			/**
				 * Desktop: -/100/- only the Mid column is displayed Tablet: -/100/- only the Mid column is displayed Phone: -/100/- only the Mid column is displayed

Use to display a detail page only, when the user should focus entirely on it.
				 * @public
				 */
			MidColumnFullScreen: "MidColumnFullScreen",

			/**
			 * The layout will display 1 column.
			 * @public
			 */
			OneColumn: "OneColumn",

			/**
				 * Desktop: 25/25/50 Start, Mid and End (expanded) columns are displayed Tablet: 0/33/67 Mid and End (expanded) columns are displayed, Start is accessible by layout arrows Phone: -/-/100 (only the End column is displayed)

Use to display all three pages (master, detail, detail-detail) when the user should focus on the detail-detail.
				 * @public
				 */
			ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",

			/**
				 * Desktop: 25/50/25 Start, Mid (expanded) and End columns are displayed Tablet: 0/67/33 Mid (expanded) and End columns are displayed, Start is accessible by a layout arrow Phone: -/-/100 only the End column is displayed

Use to display all three pages (master, detail, detail-detail) when the user should focus on the detail.
				 * @public
				 */
			ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",

			/**
				 * Desktop: 33/67/0 Start and Mid (expanded) columns are displayed, End is accessible by a layout arrow Tablet: 33/67/0 Start and Mid (expanded) columns are displayed, End is accessible by a layout arrow Phone: -/-/100 only the End column is displayed

Use to display the master and detail pages when the user should focus on the detail. The detail-detail is still loaded and easily accessible with a layout arrow.
				 * @public
				 */
			ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",

			/**
				 * Desktop: 67/33/0 Start (expanded) and Mid columns are displayed, End is accessible by layout arrows Tablet: 67/33/0 Start (expanded) and Mid columns are displayed, End is accessible by layout arrows Phone: -/-/100 only the End column is displayed

Use to display the master and detail pages when the user should focus on the master. The detail-detail is still loaded and easily accessible with layout arrows.
				 * @public
				 */
			ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",

			/**
				 * Desktop: 33/67/- Start and Mid (expanded) columns are displayed Tablet: 33/67/- Start and Mid (expanded) columns are displayed Phone: -/100/- only the Mid column is displayed

Use to display both a master and a detail page when the user should focus on the detail page.
				 * @public
				 */
			TwoColumnsMidExpanded: "TwoColumnsMidExpanded",

			/**
				 * Desktop: 67/33/- Start (expanded) and Mid columns are displayed Tablet: 67/33/- Start (expanded) and Mid columns are displayed Phone: -/100/- only the Mid column is displayed

Use to display both a master and a detail page when the user should focus on the master page.
				 * @public
				 */
			TwoColumnsStartExpanded: "TwoColumnsStartExpanded"
		};


		/**
		 * Different illustration types of Illustrated Message.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.95.0
		 * @experimental Since 1.95.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.IllustrationMessageType = {

			/**
			 * "BeforeSearch" illustration type.
			 * @public
			 */
			BeforeSearch: "BeforeSearch",

			/**
			 * "NoActivities" illustration type.
			 * @public
			 */
			NoActivities: "NoActivities",

			/**
			 * "NoData" illustration type.
			 * @public
			 */
			NoData: "NoData",

			/**
			 * "NoEntries" illustration type.
			 * @public
			 */
			NoEntries: "NoEntries",

			/**
			 * "NoMail" illustration type.
			 * @public
			 */
			NoMail: "NoMail",

			/**
			 * "NoNotifications" illustration type.
			 * @public
			 */
			NoNotifications: "NoNotifications",

			/**
			 * "NoSavedItems" illustration type.
			 * @public
			 */
			NoSavedItems: "NoSavedItems",

			/**
			 * "NoSearchResults" illustration type.
			 * @public
			 */
			NoSearchResults: "NoSearchResults",

			/**
			 * "NoTasks" illustration type.
			 * @public
			 */
			NoTasks: "NoTasks",

			/**
			 * "TntCodePlaceholder" illustration type.
			 * @public
			 */
			TntCodePlaceholder: "TntCodePlaceholder",

			/**
			 * "TntCompany" illustration type.
			 * @public
			 */
			TntCompany: "TntCompany",

			/**
			 * "TntExternalLink" illustration type.
			 * @public
			 */
			TntExternalLink: "TntExternalLink",

			/**
			 * "TntFaceID" illustration type.
			 * @public
			 */
			TntFaceID: "TntFaceID",

			/**
			 * "TntFingerprint" illustration type.
			 * @public
			 */
			TntFingerprint: "TntFingerprint",

			/**
			 * "TntLock" illustration type.
			 * @public
			 */
			TntLock: "TntLock",

			/**
			 * "TntMission" illustration type.
			 * @public
			 */
			TntMission: "TntMission",

			/**
			 * "TntNoApplications" illustration type.
			 * @public
			 */
			TntNoApplications: "TntNoApplications",

			/**
			 * "TntNoFlows" illustration type.
			 * @public
			 */
			TntNoFlows: "TntNoFlows",

			/**
			 * "TntNoUsers" illustration type.
			 * @public
			 */
			TntNoUsers: "TntNoUsers",

			/**
			 * "TntRadar" illustration type.
			 * @public
			 */
			TntRadar: "TntRadar",

			/**
			 * "TntServices" illustration type.
			 * @public
			 */
			TntServices: "TntServices",

			/**
			 * "TntSessionExpired" illustration type.
			 * @public
			 */
			TntSessionExpired: "TntSessionExpired",

			/**
			 * "TntSessionExpiring" illustration type.
			 * @public
			 */
			TntSessionExpiring: "TntSessionExpiring",

			/**
			 * "TntSuccess" illustration type.
			 * @public
			 */
			TntSuccess: "TntSuccess",

			/**
			 * "TntSuccessfulAuth" illustration type.
			 * @public
			 */
			TntSuccessfulAuth: "TntSuccessfulAuth",

			/**
			 * "TntUnlock" illustration type.
			 * @public
			 */
			TntUnlock: "TntUnlock",

			/**
			 * "TntUnsuccessfulAuth" illustration type.
			 * @public
			 */
			TntUnsuccessfulAuth: "TntUnsuccessfulAuth",

			/**
			 * "UnableToLoad" illustration type.
			 * @public
			 */
			UnableToLoad: "UnableToLoad",

			/**
			 * "UnableToUpload" illustration type.
			 * @public
			 */
			UnableToUpload: "UnableToUpload"
		};


		/**
		 * undefined
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.PageBackgroundDesign = {

			/**
			 * Page background color when a List is set as the Page content.
			 * @public
			 */
			List: "List",

			/**
			 * A solid background color dependent on the theme.
			 * @public
			 */
			Solid: "Solid",

			/**
			 * Transparent background for the page.
			 * @public
			 */
			Transparent: "Transparent"
		};


		/**
		 * Different types of Timeline.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.TimelineLayout = {

			/**
			 * Horizontal layout
			 * @public
			 */
			Horizontal: "Horizontal",

			/**
			 * Vertical layout Default type
			 * @public
			 */
			Vertical: "Vertical"
		};


		/**
		 * undefined
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.UploadState = {

			/**
			 * The file has been uploaded successfully.
			 * @public
			 */
			Complete: "Complete",

			/**
			 * The file cannot be uploaded due to an error.
			 * @public
			 */
			Error: "Error",

			/**
			 * The file is awaiting an explicit command to start being uploaded.
			 * @public
			 */
			Ready: "Ready",

			/**
			 * The file is currently being uploaded.
			 * @public
			 */
			Uploading: "Uploading"
		};

		CSP.setPackageCSSRoot("@ui5/webcomponents-fiori", sap.ui.require.toUrl("sap/ui/webc/fiori/thirdparty/css/"));

		return thisLib;

	});
