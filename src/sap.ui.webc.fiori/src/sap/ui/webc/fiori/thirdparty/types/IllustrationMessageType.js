sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const IllustrationMessageTypes = {
		BeforeSearch: "BeforeSearch",
		NoActivities: "NoActivities",
		NoData: "NoData",
		NoMail: "NoMail",
		NoMail_v1: "NoMail_v1",
		NoEntries: "NoEntries",
		NoNotifications: "NoNotifications",
		NoSavedItems: "NoSavedItems",
		NoSavedItems_v1: "NoSavedItems_v1",
		NoSearchResults: "NoSearchResults",
		NoTasks: "NoTasks",
		NoTasks_v1: "NoTasks_v1",
		UnableToLoad: "UnableToLoad",
		UnableToLoadImage: "UnableToLoadImage",
		UnableToUpload: "UnableToUpload",
		AddColumn: "AddColumn",
		AddPeople: "AddPeople",
		BalloonSky: "BalloonSky",
		Connection: "Connection",
		EmptyCalendar: "EmptyCalendar",
		EmptyList: "EmptyList",
		EmptyPlanningCalendar: "EmptyPlanningCalendar",
		ErrorScreen: "ErrorScreen",
		FilterTable: "FilterTable",
		GroupTable: "GroupTable",
		NoFilterResults: "NoFilterResults",
		PageNotFound: "PageNotFound",
		ReloadScreen: "ReloadScreen",
		ResizeColumn: "ResizeColumn",
		SearchEarth: "SearchEarth",
		SearchFolder: "SearchFolder",
		SimpleBalloon: "SimpleBalloon",
		SimpleBell: "SimpleBell",
		SimpleCalendar: "SimpleCalendar",
		SimpleCheckMark: "SimpleCheckMark",
		SimpleConnection: "SimpleConnection",
		SimpleEmptyDoc: "SimpleEmptyDoc",
		SimpleEmptyList: "SimpleEmptyList",
		SimpleError: "SimpleError",
		SimpleMagnifier: "SimpleMagnifier",
		SimpleMail: "SimpleMail",
		SimpleNoSavedItems: "SimpleNoSavedItems",
		SimpleNotFoundMagnifier: "SimpleNotFoundMagnifier",
		SimpleReload: "SimpleReload",
		SimpleTask: "SimpleTask",
		SleepingBell: "SleepingBell",
		SortColumn: "SortColumn",
		SuccessBalloon: "SuccessBalloon",
		SuccessCheckMark: "SuccessCheckMark",
		SuccessHighFive: "SuccessHighFive",
		SuccessScreen: "SuccessScreen",
		Tent: "Tent",
		UploadCollection: "UploadCollection",
		TntCodePlaceholder: "TntCodePlaceholder",
		TntCompany: "TntCompany",
		TntExternalLink: "TntExternalLink",
		TntFaceID: "TntFaceID",
		TntFingerprint: "TntFingerprint",
		TntLock: "TntLock",
		TntMission: "TntMission",
		TntNoApplications: "TntNoApplications",
		TntNoFlows: "TntNoFlows",
		TntNoUsers: "TntNoUsers",
		TntRadar: "TntRadar",
		TntServices: "TntServices",
		TntSessionExpired: "TntSessionExpired",
		TntSessionExpiring: "TntSessionExpiring",
		TntSuccess: "TntSuccess",
		TntSuccessfulAuth: "TntSuccessfulAuth",
		TntUnlock: "TntUnlock",
		TntUnsuccessfulAuth: "TntUnsuccessfulAuth",
	};
	class IllustrationMessageType extends DataType__default {
		static isValid(value) {
			return !!IllustrationMessageTypes[value];
		}
	}
	IllustrationMessageType.generateTypeAccessors(IllustrationMessageTypes);

	return IllustrationMessageType;

});
