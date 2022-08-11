/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Available <code>Illustration</code> types for the {@link sap.f.IllustratedMessage} control.
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
		 */
		NoTasksV1: "sapIllus-NoTasks_v1",

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
		 * "Add Column" illustration type.
		 * @public
		 */
		AddColumn: "sapIllus-AddColumn",

		/**
		 * "Add People" illustration type.
		 * @public
		 */
		AddPeople: "sapIllus-AddPeople",

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
		 */
		EmptyCalendar: "sapIllus-EmptyCalendar",

		/**
		 * "Empty List" illustration type.
		 * @public
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
		 */
		ErrorScreen: "sapIllus-ErrorScreen",

		/**
		 * "Filter Table" illustration type.
		 * @public
		 */
		FilterTable: "sapIllus-FilterTable",

		/**
		 * "Group Table" illustration type.
		 * @public
		 */
		GroupTable: "sapIllus-GroupTable",

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
		 */
		ReloadScreen: "sapIllus-ReloadScreen",

		/**
		 * "Resize Column" illustration type.
		 * @public
		 */
		ResizeColumn: "sapIllus-ResizeColumn",

		/**
		 * "Search Earth" illustration type.
		 * @public
		 */
		SearchEarth: "sapIllus-SearchEarth",

		/**
		 * "Search Folder" illustration type.
		 * @public
		 */
		SearchFolder: "sapIllus-SearchFolder",

		/**
		 * "Simple Balloon" illustration type.
		 * @public
		 */
		SimpleBalloon: "sapIllus-SimpleBalloon",

		/**
		 * "Simple Bell" illustration type.
		 * @public
		 */
		SimpleBell: "sapIllus-SimpleBell",

		/**
		 * "Simple Calendar" illustration type.
		 * @public
		 */
		SimpleCalendar: "sapIllus-SimpleCalendar",

		/**
		 * "Simple CheckMark" illustration type.
		 * @public
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
		 */
		SimpleEmptyDoc: "sapIllus-SimpleEmptyDoc",

		/**
		 * "Simple Empty List" illustration type.
		 * @public
		 */
		SimpleEmptyList: "sapIllus-SimpleEmptyList",

		/**
		 * "Simple Error" illustration type.
		 * @public
		 */
		SimpleError: "sapIllus-SimpleError",

		/**
		 * "Simple Magnifier" illustration type.
		 * @public
		 */
		SimpleMagnifier: "sapIllus-SimpleMagnifier",

		/**
		 * "Simple Mail" illustration type.
		 * @public
		 */
		SimpleMail: "sapIllus-SimpleMail",

		/**
		 * "Simple No Saved Items" illustration type.
		 * @public
		 */
		SimpleNoSavedItems: "sapIllus-SimpleNoSavedItems",

		/**
		 * "Simple Not Found Magnifier" illustration type.
		 * @public
		 */
		SimpleNotFoundMagnifier: "sapIllus-SimpleNotFoundMagnifier",

		/**
		 * "Simple Reload" illustration type.
		 * @public
		 */
		SimpleReload: "sapIllus-SimpleReload",

		/**
		 * "Simple Task" illustration type.
		 * @public
		 */
		SimpleTask: "sapIllus-SimpleTask",

		/**
		 * "Sleeping Bell" illustration type.
		 * @public
		 */
		SleepingBell: "sapIllus-SleepingBell",

		/**
		 * "Sort Column" illustration type.
		 * @public
		 */
		SortColumn: "sapIllus-SortColumn",

		/**
		 * "Success Balloon" illustration type.
		 * @public
		 */
		SuccessBalloon: "sapIllus-SuccessBalloon",

		/**
		 * "Success CheckMark" illustration type.
		 * @public
		 */
		SuccessCheckMark: "sapIllus-SuccessCheckMark",

		/**
		 * "Success HighFive" illustration type.
		 * @public
		 */
		SuccessHighFive: "sapIllus-SuccessHighFive",

		/**
		 * "Success Screen" illustration type.
		 * @public
		 */
		SuccessScreen: "sapIllus-SuccessScreen",

		/**
		 * "Tent" illustration type.
		 * @public
		 */
		Tent: "sapIllus-Tent",

		/**
		 * "Upload Collection" illustration type.
		 * @public
		 */
		UploadCollection: "sapIllus-UploadCollection"

	};

	return IllustratedMessageType;
});

