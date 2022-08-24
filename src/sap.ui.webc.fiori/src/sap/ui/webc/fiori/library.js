/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.webc.fiori
 */
sap.ui.define([
		"sap/ui/webc/common/library",
		"./thirdparty/Assets",
		"./library.config"
	], // library dependency
	function(commonLibrary) {

		"use strict";

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
		var thisLib = sap.ui.getCore().initLibrary({
			name: "sap.ui.webc.fiori",
			version: "${version}",
			dependencies: ["sap.ui.core", "sap.ui.webc.common"],
			noLibraryCSS: true,
			designtime: "sap/ui/webc/main/designtime/library.designtime",
			interfaces: [
				"sap.ui.webc.fiori.IBar",
				"sap.ui.webc.fiori.IFilterItem",
				"sap.ui.webc.fiori.IFilterItemOption",
				"sap.ui.webc.fiori.IMediaGalleryItem",
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
				"sap.ui.webc.fiori.IllustrationMessageSize",
				"sap.ui.webc.fiori.IllustrationMessageType",
				"sap.ui.webc.fiori.MediaGalleryItemLayout",
				"sap.ui.webc.fiori.MediaGalleryLayout",
				"sap.ui.webc.fiori.MediaGalleryMenuHorizontalAlign",
				"sap.ui.webc.fiori.MediaGalleryMenuVerticalAlign",
				"sap.ui.webc.fiori.PageBackgroundDesign",
				"sap.ui.webc.fiori.SideContentFallDown",
				"sap.ui.webc.fiori.SideContentPosition",
				"sap.ui.webc.fiori.SideContentVisibility",
				"sap.ui.webc.fiori.TimelineLayout",
				"sap.ui.webc.fiori.UploadState"
			],
			controls: [
				"sap.ui.webc.fiori.Bar",
				"sap.ui.webc.fiori.BarcodeScannerDialog",
				"sap.ui.webc.fiori.DynamicSideContent",
				"sap.ui.webc.fiori.FilterItem",
				"sap.ui.webc.fiori.FilterItemOption",
				"sap.ui.webc.fiori.FlexibleColumnLayout",
				"sap.ui.webc.fiori.IllustratedMessage",
				"sap.ui.webc.fiori.MediaGallery",
				"sap.ui.webc.fiori.MediaGalleryItem",
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
			extensions: {
				flChangeHandlers: {
					"sap.ui.webc.fiori.NotificationListItem": {
						"hideControl": "default",
						"unhideControl": "default",
						"moveControls": "default"
					},
					"sap.ui.webc.fiori.Page": {
						"moveControls": "default"
					},
					"sap.ui.webc.fiori.SideNavigation": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.fiori.SideNavigationItem": "sap/ui/webc/fiori/flexibility/SideNavigationItem",
					"sap.ui.webc.fiori.SideNavigationSubItem": "sap/ui/webc/fiori/flexibility/SideNavigationSubItem",
					"sap.ui.webc.fiori.UploadCollection": {
						"hideControl": "default",
						"unhideControl": "default",
						"moveControls": "default"
					},
					"sap.ui.webc.fiori.UploadCollectionItem": "sap/ui/webc/fiori/flexibility/UploadCollectionItem"
				}
			}
		});

		/**
		 * Interface for components that may be slotted inside <code>ui5-page</code> as header and footer.
		 *
		 * @name sap.ui.webc.fiori.IBar
		 * @interface
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-view-settings-dialog</code> as filter items
		 *
		 * @name sap.ui.webc.fiori.IFilterItem
		 * @interface
		 * @public
		 * @since 1.97.0
		 * @experimental Since 1.97.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-filter-item</code> as values
		 *
		 * @name sap.ui.webc.fiori.IFilterItemOption
		 * @interface
		 * @public
		 * @since 1.97.0
		 * @experimental Since 1.97.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that can be slotted inside <code>ui5-media-gallery</code> as items.
		 *
		 * @name sap.ui.webc.fiori.IMediaGalleryItem
		 * @interface
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted as an action inside <code>ui5-li-notification</code> and <code>ui5-li-notification-group</code>
		 *
		 * @name sap.ui.webc.fiori.INotificationAction
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a notification list
		 *
		 * @name sap.ui.webc.fiori.INotificationListItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-product-switch</code> as items
		 *
		 * @name sap.ui.webc.fiori.IProductSwitchItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-shellbar</code> as items
		 *
		 * @name sap.ui.webc.fiori.IShellBarItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-side-navigation</code> as items
		 *
		 * @name sap.ui.webc.fiori.ISideNavigationItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-side-navigation-item</code> as sub-items
		 *
		 * @name sap.ui.webc.fiori.ISideNavigationSubItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-view-settings-dialog</code> as sort items
		 *
		 * @name sap.ui.webc.fiori.ISortItem
		 * @interface
		 * @public
		 * @since 1.97.0
		 * @experimental Since 1.97.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-timeline</code> as items
		 *
		 * @name sap.ui.webc.fiori.ITimelineItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-upload-collection</code> as items
		 *
		 * @name sap.ui.webc.fiori.IUploadCollectionItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-wizard</code> as wizard steps
		 *
		 * @name sap.ui.webc.fiori.IWizardStep
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Different types of Bar.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
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

Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail-detail.
				 * @public
				 */
			ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",

			/**
				 * Desktop: 25/50/25 Start, Mid (expanded) and End columns are displayed Tablet: 0/67/33 Mid (expanded) and End columns are displayed, Start is accessible by a layout arrow Phone: -/-/100 only the End column is displayed

Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail.
				 * @public
				 */
			ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",

			/**
				 * Desktop: 33/67/0 Start and Mid (expanded) columns are displayed, End is accessible by a layout arrow Tablet: 33/67/0 Start and Mid (expanded) columns are displayed, End is accessible by a layout arrow Phone: -/-/100 only the End column is displayed

Use to display the list and detail pages when the user should focus on the detail. The detail-detail is still loaded and easily accessible with a layout arrow.
				 * @public
				 */
			ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",

			/**
				 * Desktop: 67/33/0 Start (expanded) and Mid columns are displayed, End is accessible by layout arrows Tablet: 67/33/0 Start (expanded) and Mid columns are displayed, End is accessible by layout arrows Phone: -/-/100 only the End column is displayed

Use to display the list and detail pages when the user should focus on the list. The detail-detail is still loaded and easily accessible with layout arrows.
				 * @public
				 */
			ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",

			/**
				 * Desktop: 33/67/- Start and Mid (expanded) columns are displayed Tablet: 33/67/- Start and Mid (expanded) columns are displayed Phone: -/100/- only the Mid column is displayed

Use to display both a list and a detail page when the user should focus on the detail page.
				 * @public
				 */
			TwoColumnsMidExpanded: "TwoColumnsMidExpanded",

			/**
				 * Desktop: 67/33/- Start (expanded) and Mid columns are displayed Tablet: 67/33/- Start (expanded) and Mid columns are displayed Phone: -/100/- only the Mid column is displayed

Use to display both a list and a detail page when the user should focus on the list page.
				 * @public
				 */
			TwoColumnsStartExpanded: "TwoColumnsStartExpanded"
		};


		/**
		 * Different types of IllustrationMessageSize.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.106.0
		 * @experimental Since 1.106.0 This API is experimental and might change significantly.
		 */
		thisLib.IllustrationMessageSize = {

			/**
				 * Automatically decides the <code>Illustration</code> size (<code>Base</code>, <code>Spot</code>, <code>Dialog</code>, or <code>Scene</code>) depending on the <code>IllustratedMessage</code> container width.

<b>Note:</b> <code>Auto</code> is the only option where the illustration size is changed according to the available container width. If any other <code>IllustratedMessageSize</code> is chosen, it remains until changed by the app developer.
				 * @public
				 */
			Auto: "Auto",

			/**
				 * Base <code>Illustration</code> size (XS breakpoint). Suitable for cards (two columns).

<b>Note:</b> When <code>Base</code> is in use, no illustration is displayed.
				 * @public
				 */
			Base: "Base",

			/**
			 * Dialog <code>Illustration</code> size (M breakpoint). Suitable for dialogs.
			 * @public
			 */
			Dialog: "Dialog",

			/**
			 * Scene <code>Illustration</code> size (L breakpoint). Suitable for a <code>Page</code> or a table.
			 * @public
			 */
			Scene: "Scene",

			/**
			 * Spot <code>Illustration</code> size (S breakpoint). Suitable for cards (four columns).
			 * @public
			 */
			Spot: "Spot"
		};


		/**
		 * Different illustration types of Illustrated Message.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.95.0
		 * @experimental Since 1.95.0 This API is experimental and might change significantly.
		 */
		thisLib.IllustrationMessageType = {

			/**
			 * "Add Column" illustration type.
			 * @public
			 */
			AddColumn: "AddColumn",

			/**
			 * "Add People" illustration type.
			 * @public
			 */
			AddPeople: "AddPeople",

			/**
			 * "Balloon Sky" illustration type.
			 * @public
			 */
			BalloonSky: "BalloonSky",

			/**
			 * "Before Search" illustration type.
			 * @public
			 */
			BeforeSearch: "BeforeSearch",

			/**
			 * "Connection" illustration type.
			 * @public
			 */
			Connection: "Connection",

			/**
			 * "Empty Calendar" illustration type.
			 * @public
			 */
			EmptyCalendar: "EmptyCalendar",

			/**
			 * "Empty List" illustration type.
			 * @public
			 */
			EmptyList: "EmptyList",

			/**
			 * "Empty Planning Calendar" illustration type.
			 * @public
			 */
			EmptyPlanningCalendar: "EmptyPlanningCalendar",

			/**
			 * "Error Screen" illustration type.
			 * @public
			 */
			ErrorScreen: "ErrorScreen",

			/**
			 * "Filter Table" illustration type.
			 * @public
			 */
			FilterTable: "FilterTable",

			/**
			 * "Group Table" illustration type.
			 * @public
			 */
			GroupTable: "GroupTable",

			/**
			 * "No Activities" illustration type.
			 * @public
			 */
			NoActivities: "NoActivities",

			/**
			 * "No Data" illustration type.
			 * @public
			 */
			NoData: "NoData",

			/**
			 * "No Entries" illustration type.
			 * @public
			 */
			NoEntries: "NoEntries",

			/**
			 * "No Filter Results" illustration type.
			 * @public
			 */
			NoFilterResults: "NoFilterResults",

			/**
			 * "No Email" illustration type.
			 * @public
			 */
			NoMail: "NoMail",

			/**
			 * "No Email v1" illustration type.
			 * @public
			 */
			NoMail_v1: "NoMail_v1",

			/**
			 * "No Notifications" illustration type.
			 * @public
			 */
			NoNotifications: "NoNotifications",

			/**
			 * "No Saved Items" illustration type.
			 * @public
			 */
			NoSavedItems: "NoSavedItems",

			/**
			 * "No Saved Items v1" illustration type.
			 * @public
			 */
			NoSavedItems_v1: "NoSavedItems_v1",

			/**
			 * "No Search Results" illustration type.
			 * @public
			 */
			NoSearchResults: "NoSearchResults",

			/**
			 * "No Tasks" illustration type.
			 * @public
			 */
			NoTasks: "NoTasks",

			/**
			 * "No Tasks v1" illustration type.
			 * @public
			 */
			NoTasks_v1: "NoTasks_v1",

			/**
			 * "Page Not Found" illustration type.
			 * @public
			 */
			PageNotFound: "PageNotFound",

			/**
			 * "Reload Screen" illustration type.
			 * @public
			 */
			ReloadScreen: "ReloadScreen",

			/**
			 * "Resize Column" illustration type.
			 * @public
			 */
			ResizeColumn: "ResizeColumn",

			/**
			 * "Search Earth" illustration type.
			 * @public
			 */
			SearchEarth: "SearchEarth",

			/**
			 * "Search Folder" illustration type.
			 * @public
			 */
			SearchFolder: "SearchFolder",

			/**
			 * "Simple Balloon" illustration type.
			 * @public
			 */
			SimpleBalloon: "SimpleBalloon",

			/**
			 * "Simple Bell" illustration type.
			 * @public
			 */
			SimpleBell: "SimpleBell",

			/**
			 * "Simple Calendar" illustration type.
			 * @public
			 */
			SimpleCalendar: "SimpleCalendar",

			/**
			 * "Simple CheckMark" illustration type.
			 * @public
			 */
			SimpleCheckMark: "SimpleCheckMark",

			/**
			 * "Simple Connection" illustration type.
			 * @public
			 */
			SimpleConnection: "SimpleConnection",

			/**
			 * "Simple Empty Doc" illustration type.
			 * @public
			 */
			SimpleEmptyDoc: "SimpleEmptyDoc",

			/**
			 * "Simple Empty List" illustration type.
			 * @public
			 */
			SimpleEmptyList: "SimpleEmptyList",

			/**
			 * "Simple Error" illustration type.
			 * @public
			 */
			SimpleError: "SimpleError",

			/**
			 * "Simple Magnifier" illustration type.
			 * @public
			 */
			SimpleMagnifier: "SimpleMagnifier",

			/**
			 * "Simple Mail" illustration type.
			 * @public
			 */
			SimpleMail: "SimpleMail",

			/**
			 * "Simple No Saved Items" illustration type.
			 * @public
			 */
			SimpleNoSavedItems: "SimpleNoSavedItems",

			/**
			 * "Simple Not Found Magnifier" illustration type.
			 * @public
			 */
			SimpleNotFoundMagnifier: "SimpleNotFoundMagnifier",

			/**
			 * "Simple Reload" illustration type.
			 * @public
			 */
			SimpleReload: "SimpleReload",

			/**
			 * "Simple Task" illustration type.
			 * @public
			 */
			SimpleTask: "SimpleTask",

			/**
			 * "Sleeping Bell" illustration type.
			 * @public
			 */
			SleepingBell: "SleepingBell",

			/**
			 * "Sort Column" illustration type.
			 * @public
			 */
			SortColumn: "SortColumn",

			/**
			 * "Success Balloon" illustration type.
			 * @public
			 */
			SuccessBalloon: "SuccessBalloon",

			/**
			 * "Success CheckMark" illustration type.
			 * @public
			 */
			SuccessCheckMark: "SuccessCheckMark",

			/**
			 * "Success HighFive" illustration type.
			 * @public
			 */
			SuccessHighFive: "SuccessHighFive",

			/**
			 * "Success Screen" illustration type.
			 * @public
			 */
			SuccessScreen: "SuccessScreen",

			/**
			 * "Tent" illustration type.
			 * @public
			 */
			Tent: "Tent",

			/**
			 * "TntChartArea" illustration type.
			 * @public
			 */
			TntChartArea: "TntChartArea",

			/**
			 * "TntChartArea2" illustration type.
			 * @public
			 */
			TntChartArea2: "TntChartArea2",

			/**
			 * "TntChartBar" illustration type.
			 * @public
			 */
			TntChartBar: "TntChartBar",

			/**
			 * "TntChartBPMNFlow" illustration type.
			 * @public
			 */
			TntChartBPMNFlow: "TntChartBPMNFlow",

			/**
			 * "TntChartBullet" illustration type.
			 * @public
			 */
			TntChartBullet: "TntChartBullet",

			/**
			 * "TntChartDoughnut" illustration type.
			 * @public
			 */
			TntChartDoughnut: "TntChartDoughnut",

			/**
			 * "TntChartFlow" illustration type.
			 * @public
			 */
			TntChartFlow: "TntChartFlow",

			/**
			 * "TntChartGantt" illustration type.
			 * @public
			 */
			TntChartGantt: "TntChartGantt",

			/**
			 * "TntChartOrg" illustration type.
			 * @public
			 */
			TntChartOrg: "TntChartOrg",

			/**
			 * "TntChartPie" illustration type.
			 * @public
			 */
			TntChartPie: "TntChartPie",

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
			 * "TntComponents" illustration type.
			 * @public
			 */
			TntComponents: "TntComponents",

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
			 * "TntSecrets" illustration type.
			 * @public
			 */
			TntSecrets: "TntSecrets",

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
			 * "TntSystems" illustration type.
			 * @public
			 */
			TntSystems: "TntSystems",

			/**
			 * "TntTeams" illustration type.
			 * @public
			 */
			TntTeams: "TntTeams",

			/**
			 * "TntTools" illustration type.
			 * @public
			 */
			TntTools: "TntTools",

			/**
			 * "TntUnableToLoad" illustration type.
			 * @public
			 */
			TntUnableToLoad: "TntUnableToLoad",

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
			 * "TntUser2" illustration type.
			 * @public
			 */
			TntUser2: "TntUser2",

			/**
			 * "Unable To Load" illustration type.
			 * @public
			 */
			UnableToLoad: "UnableToLoad",

			/**
			 * "Unable To Load Image" illustration type.
			 * @public
			 */
			UnableToLoadImage: "UnableToLoadImage",

			/**
			 * "Unable To Upload" illustration type.
			 * @public
			 */
			UnableToUpload: "UnableToUpload",

			/**
			 * "Upload Collection" illustration type.
			 * @public
			 */
			UploadCollection: "UploadCollection"
		};


		/**
		 * Defines the layout of the content displayed in the <code>ui5-media-gallery-item</code>.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.MediaGalleryItemLayout = {

			/**
			 * Recommended to use when the item contains an image.<br> When a thumbnail is selected, it makes the corresponding enlarged content appear in a square display area.
			 * @public
			 */
			Square: "Square",

			/**
			 * Recommended to use when the item contains video content.<br> When a thumbnail is selected, it makes the corresponding enlarged content appear in a wide display area (stretched to fill all of the available width) for optimal user experiance.
			 * @public
			 */
			Wide: "Wide"
		};


		/**
		 * Defines the layout type of the thumbnails list of the <code>ui5-media-gallery</code> component.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.MediaGalleryLayout = {

			/**
			 * The layout is determined automatically.
			 * @public
			 */
			Auto: "Auto",

			/**
			 * Displays the layout as a horizontal split between the thumbnails list and the selected image.
			 * @public
			 */
			Horizontal: "Horizontal",

			/**
			 * Displays the layout as a vertical split between the thumbnails list and the selected image.
			 * @public
			 */
			Vertical: "Vertical"
		};


		/**
		 * Defines the horizontal alignment of the thumbnails menu of the <code>ui5-media-gallery</code> component.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.MediaGalleryMenuHorizontalAlign = {

			/**
			 * Displays the menu on the left side of the target.
			 * @public
			 */
			Left: "Left",

			/**
			 * Displays the menu on the right side of the target.
			 * @public
			 */
			Right: "Right"
		};


		/**
		 * Types for the vertical alignment of the thumbnails menu of the <code>ui5-media-gallery</code> component.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.MediaGalleryMenuVerticalAlign = {

			/**
			 * Displays the menu at the bottom of the reference control.
			 * @public
			 */
			Bottom: "Bottom",

			/**
			 * Displays the menu at the top of the reference control.
			 * @public
			 */
			Top: "Top"
		};


		/**
		 * undefined
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
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
		 * SideContent FallDown options.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.SideContentFallDown = {

			/**
			 * Side content falls down on breakpoints below L
			 * @public
			 */
			BelowL: "BelowL",

			/**
			 * Side content falls down on breakpoints below M
			 * @public
			 */
			BelowM: "BelowM",

			/**
			 * Side content falls down on breakpoints below XL
			 * @public
			 */
			BelowXL: "BelowXL",

			/**
			 * Side content falls down on breakpoint M and the minimum width for the side content
			 * @public
			 */
			OnMinimumWidth: "OnMinimumWidth"
		};


		/**
		 * Side Content position options.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.SideContentPosition = {

			/**
			 * The side content is on the right side of the main container in left-to-right mode and on the left side in right-to-left mode.
			 * @public
			 */
			End: "End",

			/**
			 * The side content is on the left side of the main container in left-to-right mode and on the right side in right-to-left mode.
			 * @public
			 */
			Start: "Start"
		};


		/**
		 * Side Content visibility options.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.SideContentVisibility = {

			/**
			 * Show the side content on any breakpoint
			 * @public
			 */
			AlwaysShow: "AlwaysShow",

			/**
			 * Don't show the side content on any breakpoints
			 * @public
			 */
			NeverShow: "NeverShow",

			/**
			 * Show the side content on XL breakpoint
			 * @public
			 */
			ShowAboveL: "ShowAboveL",

			/**
			 * Show the side content on L and XL breakpoints
			 * @public
			 */
			ShowAboveM: "ShowAboveM",

			/**
			 * Show the side content on M, L and XL breakpoints
			 * @public
			 */
			ShowAboveS: "ShowAboveS"
		};


		/**
		 * Different types of Timeline.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
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

		return thisLib;

	});