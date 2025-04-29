/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Available <code>Illustration</code> types for the {@link sap.m.IllustratedMessage} control.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.IllustratedMessageType
	 * @since 1.98
	 */
	var IllustratedMessageType = {

		/**
		 * "Before Search" illustration type.
		 * @public
		 */
		BeforeSearch: "sapIllus-BeforeSearch",

		/**
		 * "No Activities" illustration type.
		 * @public
		 */
		NoActivities: "sapIllus-NoActivities",

		/**
		 * "No Data" illustration type.
		 * @public
		 */
		NoData: "sapIllus-NoData",

		/**
		 * "No Email" illustration type.
		 * @public
		 */
		NoMail: "sapIllus-NoMail",

		/**
		 * "No Email v1" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoMail}
		 */
		NoMailV1: "sapIllus-NoMail_v1",

		/**
		 * "No Entries" illustration type.
		 * @public
		 */
		NoEntries: "sapIllus-NoEntries",

		/**
		 * "No Notifications" illustration type.
		 * @public
		 */
		NoNotifications: "sapIllus-NoNotifications",

		/**
		 * "No Saved Items" illustration type.
		 * @public
		 */
		NoSavedItems: "sapIllus-NoSavedItems",

		/**
		 * "No Saved Items v1" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoSavedItems}
		 */
		NoSavedItemsV1: "sapIllus-NoSavedItems_v1",

		/**
		 * "No Search Results" illustration type.
		 * @public
		 */
		NoSearchResults: "sapIllus-NoSearchResults",

		/**
		 * "No Tasks" illustration type.
		 * @public
		 */
		NoTasks: "sapIllus-NoTasks",

		/**
		 * "No Tasks v1" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoTasks}
		 */
		NoTasksV1: "sapIllus-NoTasks_v1",

		/**
		 * "No Dimensions Set" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoChartData}
		 */
		NoDimensionsSet: "sapIllus-NoDimensionsSet",

		/**
		 * "No Columns Set" illustration type.
		 * @public
		 */
		NoColumnsSet: "sapIllus-NoColumnsSet",

		/**
		 * "Unable To Load" illustration type.
		 * @public
		 */
		UnableToLoad: "sapIllus-UnableToLoad",

		/**
		 * "Unable To Load Image" illustration type.
		 * @public
		 */
		UnableToLoadImage: "sapIllus-UnableToLoadImage",

		/**
		 * "Unable To Upload" illustration type.
		 * @public
		 */
		UnableToUpload: "sapIllus-UnableToUpload",

		/**
		 * "Upload To Cloud" illustration type.
		 * @public
		 */
		UploadToCloud: "sapIllus-UploadToCloud",

		/**
		 * "Add Column" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.AddingColumns}
		 */
		AddColumn: "sapIllus-AddColumn",

		/**
		 * "Add People" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.AddPeopleToCalendar}
		 */
		AddPeople: "sapIllus-AddPeople",

		/**
		 * "Add Dimensions" illustration type.
		 * @public
		 */
		AddDimensions: "sapIllus-AddDimensions",

		/**
		 * "Balloon Sky" illustration type.
		 * @public
		 */
		BalloonSky: "sapIllus-BalloonSky",

		/**
		 * "Connection" illustration type.
		 * @public
		 */
		Connection: "sapIllus-Connection",

		/**
		 * "Empty Calendar" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoActivities}
		 */
		EmptyCalendar: "sapIllus-EmptyCalendar",

		/**
		 * "Empty List" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoEntries}
		 */
		EmptyList: "sapIllus-EmptyList",

		/**
		 * "Empty Planning Calendar" illustration type.
		 * @public
		 */
		EmptyPlanningCalendar: "sapIllus-EmptyPlanningCalendar",

		/**
		 * "Error Screen" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.UnableToUpload}
		 */
		ErrorScreen: "sapIllus-ErrorScreen",

		/**
		 * "Filter Table" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.FilteringColumns}
		 */
		FilterTable: "sapIllus-FilterTable",

		/**
		 * "Group Table" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.GroupingColumns}
		 */
		GroupTable: "sapIllus-GroupTable",

		/**
		 * "New Mail" illustration type.
		 * @public
		 */
		NewMail: "sapIllus-NewMail",

		/**
		 * "No Filter Results" illustration type.
		 * @public
		 */
		NoFilterResults: "sapIllus-NoFilterResults",

		/**
		 * "Page Not Found" illustration type.
		 * @public
		 */
		PageNotFound: "sapIllus-PageNotFound",

		/**
		 * "Reload Screen" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.UnableToLoad}
		 */
		ReloadScreen: "sapIllus-ReloadScreen",

		/**
		 * "Resize Column" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.ResizingColumns}
		 */
		ResizeColumn: "sapIllus-ResizeColumn",

		/**
		 * "Search Earth" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.BeforeSearch}
		 */
		SearchEarth: "sapIllus-SearchEarth",

		/**
		 * "Search Folder" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoSearchResults}
		 */
		SearchFolder: "sapIllus-SearchFolder",

		/**
		 * "Sign Out" illustration type.
		 * @public
		 */
		SignOut: "sapIllus-SignOut",

		/**
		 * "Simple Balloon" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.ReceiveAppreciation}
		 */
		SimpleBalloon: "sapIllus-SimpleBalloon",

		/**
		 * "Simple Bell" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoNotifications}
		 */
		SimpleBell: "sapIllus-SimpleBell",

		/**
		 * "Simple Calendar" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoActivities}
		 */
		SimpleCalendar: "sapIllus-SimpleCalendar",

		/**
		 * "Simple CheckMark" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.KeyTask}
		 */
		SimpleCheckMark: "sapIllus-SimpleCheckMark",

		/**
		 * "Simple Connection" illustration type.
		 * @public
		 */
		SimpleConnection: "sapIllus-SimpleConnection",

		/**
		 * "Simple Empty Doc" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoData}
		 */
		SimpleEmptyDoc: "sapIllus-SimpleEmptyDoc",

		/**
		 * "Simple Empty List" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoEntries}
		 */
		SimpleEmptyList: "sapIllus-SimpleEmptyList",

		/**
		 * "Simple Error" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.UnableToUpload}
		 */
		SimpleError: "sapIllus-SimpleError",

		/**
		 * "Simple Magnifier" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.BeforeSearch}
		 */
		SimpleMagnifier: "sapIllus-SimpleMagnifier",

		/**
		 * "Simple Mail" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoMail}
		 */
		SimpleMail: "sapIllus-SimpleMail",

		/**
		 * "Simple No Saved Items" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoSavedItems}
		 */
		SimpleNoSavedItems: "sapIllus-SimpleNoSavedItems",

		/**
		 * "Simple Not Found Magnifier" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoSearchResults}
		 */
		SimpleNotFoundMagnifier: "sapIllus-SimpleNotFoundMagnifier",

		/**
		 * "Simple Reload" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.UnableToLoad}
		 */
		SimpleReload: "sapIllus-SimpleReload",

		/**
		 * "Simple Task" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoTasks}
		 */
		SimpleTask: "sapIllus-SimpleTask",

		/**
		 * "Sleeping Bell" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoNotifications}
		 */
		SleepingBell: "sapIllus-SleepingBell",

		/**
		 * "Sort Column" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.SortingColumns}
		 */
		SortColumn: "sapIllus-SortColumn",

		/**
		 * "Success Balloon" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.ReceiveAppreciation}
		 */
		SuccessBalloon: "sapIllus-SuccessBalloon",

		/**
		 * "Success CheckMark" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.KeyTask}
		 */
		SuccessCheckMark: "sapIllus-SuccessCheckMark",

		/**
		 * "Success HighFive" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.ReceiveAppreciation}
		 */
		SuccessHighFive: "sapIllus-SuccessHighFive",

		/**
		 * "Success Screen" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.KeyTask}
		 */
		SuccessScreen: "sapIllus-SuccessScreen",

		/**
		 * "Survey" illustration type.
		 * @public
		 */
		Survey: "sapIllus-Survey",

		/**
		 * "Tent" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.NoData}
		 */
		Tent: "sapIllus-Tent",

		/**
		 * "No Chart Data" illustration type.
		 * @public
		 */
		NoChartData: "sapIllus-NoChartData",

		/**
		 * "Adding Columns" illustration type.
		 * @public
		 */
		AddingColumns: "sapIllus-AddingColumns",

		/**
		 * "Add People To Calendar" illustration type.
		 * @public
		 */
		AddPeopleToCalendar: "sapIllus-AddPeopleToCalendar",

		/**
		 * "Filtering Columns" illustration type.
		 * @public
		 */
		FilteringColumns: "sapIllus-FilteringColumns",

		/**
		 * "Grouping Columns" illustration type.
		 * @public
		 */
		GroupingColumns: "sapIllus-GroupingColumns",

		/**
		 * "Resizing Columns" illustration type.
		 * @public
		 */
		ResizingColumns: "sapIllus-ResizingColumns",

		/**
		 * "Sorting Columns" illustration type.
		 * @public
		 */
		SortingColumns: "sapIllus-SortingColumns",

		/**
		 * "Receive Appreciation" illustration type.
		 * @public
		 */
		ReceiveAppreciation: "sapIllus-ReceiveAppreciation",

		/**
		 * "Drag Files To Upload" illustration type.
		 * @public
		 */
		DragFilesToUpload: "sapIllus-DragFilesToUpload",

		/**
		 * "User has signed up for an application" illustration type.
		 * @public
		 */
		UserHasSignedUp: "sapIllus-UserHasSignedUp",

		/**
		 * "Achievement" illustration type.
		 * @public
		 */
		Achievement: "sapIllus-Achievement",

		/**
		 * "KeyTask" illustration type.
		 * @public
		 */
		KeyTask: "sapIllus-KeyTask",

		/**
		 * "Upload Collection" illustration type.
		 * @public
		 * @deprecated As of version 1.135, replaced by {@link sap.m.IllustratedMessageType.DragFilesToUpload}
		 */
		UploadCollection: "sapIllus-UploadCollection"

	};

	DataType.registerEnum("sap.m.IllustratedMessageType", IllustratedMessageType);

	return IllustratedMessageType;
});

