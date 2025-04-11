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
	  * "Empty Planning Calendar" illustration type.
	  * @public
	  */
	 EmptyPlanningCalendar: "sapIllus-EmptyPlanningCalendar",

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
	  * "Sign Out" illustration type.
	  * @public
	  */
	 SignOut: "sapIllus-SignOut",

	 /**
	  * "Simple Connection" illustration type.
	  * @public
	  */
	 SimpleConnection: "sapIllus-SimpleConnection",

	 /**
	  * "Survey" illustration type.
	  * @public
	  */
	 Survey: "sapIllus-Survey",

	 /**
	  * Empty illustration type. Do not use
	  * @private
	  */
	 Empty: "sapIllus-Empty",

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
	 KeyTask: "sapIllus-KeyTask"
	};

	DataType.registerEnum("sap.m.IllustratedMessageType", IllustratedMessageType);

	return IllustratedMessageType;
});

