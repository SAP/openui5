sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different illustration types of Illustrated Message.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.IllustrationMessageType
   */
  var IllustrationMessageType;
  (function (IllustrationMessageType) {
    /**
     * "Before Search" illustration type.
     * @public
     * @type {BeforeSearch}
     */
    IllustrationMessageType["BeforeSearch"] = "BeforeSearch";
    /**
     * "No Activities" illustration type.
     * @public
     * @type {NoActivities}
     */
    IllustrationMessageType["NoActivities"] = "NoActivities";
    /**
     * "No Columns Set" illustration type.
     * @public
     * @type {NoColumnsSet}
     */
    IllustrationMessageType["NoColumnsSet"] = "NoColumnsSet";
    /**
     * "No Data" illustration type.
     * @public
     * @type {NoData}
     */
    IllustrationMessageType["NoData"] = "NoData";
    /**
     * "No Email" illustration type.
     * @public
     * @type {NoMail}
     */
    IllustrationMessageType["NoMail"] = "NoMail";
    /**
     * "No Email v1" illustration type.
     * @public
     * @type {NoMail_v1}
     */
    IllustrationMessageType["NoMail_v1"] = "NoMail_v1";
    /**
     * "No Entries" illustration type.
     * @public
     * @type {NoEntries}
     */
    IllustrationMessageType["NoEntries"] = "NoEntries";
    /**
     * "No Notifications" illustration type.
     * @public
     * @type {NoNotifications}
     */
    IllustrationMessageType["NoNotifications"] = "NoNotifications";
    /**
     * "No Saved Items" illustration type.
     * @public
     * @type {NoSavedItems}
     */
    IllustrationMessageType["NoSavedItems"] = "NoSavedItems";
    /**
     * "No Saved Items v1" illustration type.
     * @public
     * @type {NoSavedItems_v1}
     */
    IllustrationMessageType["NoSavedItems_v1"] = "NoSavedItems_v1";
    /**
     * "No Search Results" illustration type.
     * @public
     * @type {NoSearchResults}
     */
    IllustrationMessageType["NoSearchResults"] = "NoSearchResults";
    /**
     * "No Tasks" illustration type.
     * @public
     * @type {NoTasks}
     */
    IllustrationMessageType["NoTasks"] = "NoTasks";
    /**
     * "No Tasks v1" illustration type.
     * @public
     * @type {NoTasks_v1}
     */
    IllustrationMessageType["NoTasks_v1"] = "NoTasks_v1";
    /**
     * "No Dimensions Set" illustration type.
     * @public
     * @type {NoDimensionsSet}
     */
    IllustrationMessageType["NoDimensionsSet"] = "NoDimensionsSet";
    /**
     * "Unable To Load" illustration type.
     * @public
     * @type {UnableToLoad}
     */
    IllustrationMessageType["UnableToLoad"] = "UnableToLoad";
    /**
     * "Unable To Load Image" illustration type.
     * @public
     * @type {UnableToLoadImage}
     */
    IllustrationMessageType["UnableToLoadImage"] = "UnableToLoadImage";
    /**
     * "Unable To Upload" illustration type.
     * @public
     * @type {UnableToUpload}
     */
    IllustrationMessageType["UnableToUpload"] = "UnableToUpload";
    /**
     * "Upload To Cloud" illustration type.
     * @public
     * @type {UploadToCloud}
     */
    IllustrationMessageType["UploadToCloud"] = "UploadToCloud";
    /**
     * "Add Column" illustration type.
     * @public
     * @type {AddColumn}
     */
    IllustrationMessageType["AddColumn"] = "AddColumn";
    /**
     * "Add People" illustration type.
     * @public
     * @type {AddPeople}
     */
    IllustrationMessageType["AddPeople"] = "AddPeople";
    /**
     * "Add Dimensions" illustration type.
     * @public
     * @type {AddDimensions}
     */
    IllustrationMessageType["AddDimensions"] = "AddDimensions";
    /**
     * "Balloon Sky" illustration type.
     * @public
     * @type {BalloonSky}
     */
    IllustrationMessageType["BalloonSky"] = "BalloonSky";
    /**
     * "Connection" illustration type.
     * @public
     * @type {Connection}
     */
    IllustrationMessageType["Connection"] = "Connection";
    /**
     * "Empty Calendar" illustration type.
     * @public
     * @type {EmptyCalendar}
     */
    IllustrationMessageType["EmptyCalendar"] = "EmptyCalendar";
    /**
     * "Empty List" illustration type.
     * @public
     * @type {EmptyList}
     */
    IllustrationMessageType["EmptyList"] = "EmptyList";
    /**
     * "Empty Planning Calendar" illustration type.
     * @public
     * @type {EmptyPlanningCalendar}
     */
    IllustrationMessageType["EmptyPlanningCalendar"] = "EmptyPlanningCalendar";
    /**
     * "Error Screen" illustration type.
     * @public
     * @type {ErrorScreen}
     */
    IllustrationMessageType["ErrorScreen"] = "ErrorScreen";
    /**
     * "Filter Table" illustration type.
     * @public
     * @type {FilterTable}
     */
    IllustrationMessageType["FilterTable"] = "FilterTable";
    /**
     * "Group Table" illustration type.
     * @public
     * @type {GroupTable}
     */
    IllustrationMessageType["GroupTable"] = "GroupTable";
    /**
     * "No Filter Results" illustration type.
     * @public
     * @type {NoFilterResults}
     */
    IllustrationMessageType["NoFilterResults"] = "NoFilterResults";
    /**
     * "Page Not Found" illustration type.
     * @public
     * @type {PageNotFound}
     */
    IllustrationMessageType["PageNotFound"] = "PageNotFound";
    /**
     * "Reload Screen" illustration type.
     * @public
     * @type {ReloadScreen}
     */
    IllustrationMessageType["ReloadScreen"] = "ReloadScreen";
    /**
     * "Resize Column" illustration type.
     * @public
     * @type {ResizeColumn}
     */
    IllustrationMessageType["ResizeColumn"] = "ResizeColumn";
    /**
     * "Search Earth" illustration type.
     * @public
     * @type {SearchEarth}
     */
    IllustrationMessageType["SearchEarth"] = "SearchEarth";
    /**
     * "Search Folder" illustration type.
     * @public
     * @type {SearchFolder}
     */
    IllustrationMessageType["SearchFolder"] = "SearchFolder";
    /**
     * "Simple Balloon" illustration type.
     * @public
     * @type {SimpleBalloon}
     */
    IllustrationMessageType["SimpleBalloon"] = "SimpleBalloon";
    /**
     * "Simple Bell" illustration type.
     * @public
     * @type {SimpleBell}
     */
    IllustrationMessageType["SimpleBell"] = "SimpleBell";
    /**
     * "Simple Calendar" illustration type.
     * @public
     * @type {SimpleCalendar}
     */
    IllustrationMessageType["SimpleCalendar"] = "SimpleCalendar";
    /**
     * "Simple CheckMark" illustration type.
     * @public
     * @type {SimpleCheckMark}
     */
    IllustrationMessageType["SimpleCheckMark"] = "SimpleCheckMark";
    /**
     * "Simple Connection" illustration type.
     * @public
     * @type {SimpleConnection}
     */
    IllustrationMessageType["SimpleConnection"] = "SimpleConnection";
    /**
     * "Simple Empty Doc" illustration type.
     * @public
     * @type {SimpleEmptyDoc}
     */
    IllustrationMessageType["SimpleEmptyDoc"] = "SimpleEmptyDoc";
    /**
     * "Simple Empty List" illustration type.
     * @public
     * @type {SimpleEmptyList}
     */
    IllustrationMessageType["SimpleEmptyList"] = "SimpleEmptyList";
    /**
     * "Simple Error" illustration type.
     * @public
     * @type {SimpleError}
     */
    IllustrationMessageType["SimpleError"] = "SimpleError";
    /**
     * "Simple Magnifier" illustration type.
     * @public
     * @type {SimpleMagnifier}
     */
    IllustrationMessageType["SimpleMagnifier"] = "SimpleMagnifier";
    /**
     * "Simple Mail" illustration type.
     * @public
     * @type {SimpleMail}
     */
    IllustrationMessageType["SimpleMail"] = "SimpleMail";
    /**
     * "Simple No Saved Items" illustration type.
     * @public
     * @type {SimpleNoSavedItems}
     */
    IllustrationMessageType["SimpleNoSavedItems"] = "SimpleNoSavedItems";
    /**
     * "Simple Not Found Magnifier" illustration type.
     * @public
     * @type {SimpleNotFoundMagnifier}
     */
    IllustrationMessageType["SimpleNotFoundMagnifier"] = "SimpleNotFoundMagnifier";
    /**
     * "Simple Reload" illustration type.
     * @public
     * @type {SimpleReload}
     */
    IllustrationMessageType["SimpleReload"] = "SimpleReload";
    /**
     * "Simple Task" illustration type.
     * @public
     * @type {SimpleTask}
     */
    IllustrationMessageType["SimpleTask"] = "SimpleTask";
    /**
     * "Sleeping Bell" illustration type.
     * @public
     * @type {SleepingBell}
     */
    IllustrationMessageType["SleepingBell"] = "SleepingBell";
    /**
     * "Sort Column" illustration type.
     * @public
     * @type {SortColumn}
     */
    IllustrationMessageType["SortColumn"] = "SortColumn";
    /**
     * "Success Balloon" illustration type.
     * @public
     * @type {SuccessBalloon}
     */
    IllustrationMessageType["SuccessBalloon"] = "SuccessBalloon";
    /**
     * "Success CheckMark" illustration type.
     * @public
     * @type {SuccessCheckMark}
     */
    IllustrationMessageType["SuccessCheckMark"] = "SuccessCheckMark";
    /**
     * "Success HighFive" illustration type.
     * @public
     * @type {SuccessHighFive}
     */
    IllustrationMessageType["SuccessHighFive"] = "SuccessHighFive";
    /**
     * "Success Screen" illustration type.
     * @public
     * @type {SuccessScreen}
     */
    IllustrationMessageType["SuccessScreen"] = "SuccessScreen";
    /**
     * "Survey" illustration type.
     * @public
     * @type {Survey}
     */
    IllustrationMessageType["Survey"] = "Survey";
    /**
     * "Tent" illustration type.
     * @public
     * @type {Tent}
     */
    IllustrationMessageType["Tent"] = "Tent";
    /**
     * "Upload Collection" illustration type.
     * @public
     * @type {UploadCollection}
     */
    IllustrationMessageType["UploadCollection"] = "UploadCollection";
    /**
    * "TntChartArea" illustration type.
    * @public
    * @type {TntChartArea}
    */
    IllustrationMessageType["TntChartArea"] = "TntChartArea";
    /**
    * "TntChartArea2" illustration type.
    * @public
    * @type {TntChartArea2}
    */
    IllustrationMessageType["TntChartArea2"] = "TntChartArea2";
    /**
    * "TntChartBar" illustration type.
    * @public
    * @type {TntChartBar}
    */
    IllustrationMessageType["TntChartBar"] = "TntChartBar";
    /**
    * "TntChartBPMNFlow" illustration type.
    * @public
    * @type {TntChartBPMNFlow}
    */
    IllustrationMessageType["TntChartBPMNFlow"] = "TntChartBPMNFlow";
    /**
    * "TntChartBullet" illustration type.
    * @public
    * @type {TntChartBullet}
    */
    IllustrationMessageType["TntChartBullet"] = "TntChartBullet";
    /**
    * "TntChartDoughnut" illustration type.
    * @public
    * @type {TntChartDoughnut}
    */
    IllustrationMessageType["TntChartDoughnut"] = "TntChartDoughnut";
    /**
    * "TntChartFlow" illustration type.
    * @public
    * @type {TntChartFlow}
    */
    IllustrationMessageType["TntChartFlow"] = "TntChartFlow";
    /**
    * "TntChartGantt" illustration type.
    * @public
    * @type {TntChartGantt}
    */
    IllustrationMessageType["TntChartGantt"] = "TntChartGantt";
    /**
    * "TntChartOrg" illustration type.
    * @public
    * @type {TntChartOrg}
    */
    IllustrationMessageType["TntChartOrg"] = "TntChartOrg";
    /**
    * "TntChartPie" illustration type.
    * @public
    * @type {TntChartPie}
    */
    IllustrationMessageType["TntChartPie"] = "TntChartPie";
    /**
    * "TntCodePlaceholder" illustration type.
    * @public
    * @type {TntCodePlaceholder}
    */
    IllustrationMessageType["TntCodePlaceholder"] = "TntCodePlaceholder";
    /**
    * "TntCompany" illustration type.
    * @public
    * @type {TntCompany}
    */
    IllustrationMessageType["TntCompany"] = "TntCompany";
    /**
    * "TntComponents" illustration type.
    * @public
    * @type {TntComponents}
    */
    IllustrationMessageType["TntComponents"] = "TntComponents";
    /**
    * "TntExternalLink" illustration type.
    * @public
    * @type {TntExternalLink}
    */
    IllustrationMessageType["TntExternalLink"] = "TntExternalLink";
    /**
    * "TntFaceID" illustration type.
    * @public
    * @type {TntFaceID}
    */
    IllustrationMessageType["TntFaceID"] = "TntFaceID";
    /**
    * "TntFingerprint" illustration type.
    * @public
    * @type {TntFingerprint}
    */
    IllustrationMessageType["TntFingerprint"] = "TntFingerprint";
    /**
    * "TntLock" illustration type.
    * @public
    * @type {TntLock}
    */
    IllustrationMessageType["TntLock"] = "TntLock";
    /**
    * "TntMission" illustration type.
    * @public
    * @type {TntMission}
    */
    IllustrationMessageType["TntMission"] = "TntMission";
    /**
    * "TntNoApplications" illustration type.
    * @public
    * @type {TntNoApplications}
    */
    IllustrationMessageType["TntNoApplications"] = "TntNoApplications";
    /**
    * "TntNoFlows" illustration type.
    * @public
    * @type {TntNoFlows}
    */
    IllustrationMessageType["TntNoFlows"] = "TntNoFlows";
    /**
    * "TntNoUsers" illustration type.
    * @public
    * @type {TntNoUsers}
    */
    IllustrationMessageType["TntNoUsers"] = "TntNoUsers";
    /**
    * "TntRadar" illustration type.
    * @public
    * @type {TntRadar}
    */
    IllustrationMessageType["TntRadar"] = "TntRadar";
    /**
    * "TntSecrets" illustration type.
    * @public
    * @type {TntSecrets}
    */
    IllustrationMessageType["TntSecrets"] = "TntSecrets";
    /**
    * "TntServices" illustration type.
    * @public
    * @type {TntServices}
    */
    IllustrationMessageType["TntServices"] = "TntServices";
    /**
    * "TntSessionExpired" illustration type.
    * @public
    * @type {TntSessionExpired}
    */
    IllustrationMessageType["TntSessionExpired"] = "TntSessionExpired";
    /**
    * "TntSessionExpiring" illustration type.
    * @public
    * @type {TntSessionExpiring}
    */
    IllustrationMessageType["TntSessionExpiring"] = "TntSessionExpiring";
    /**
    * "TntSuccess" illustration type.
    * @public
    * @type {TntSuccess}
    */
    IllustrationMessageType["TntSuccess"] = "TntSuccess";
    /**
    * "TntSuccessfulAuth" illustration type.
    * @public
    * @type {TntSuccessfulAuth}
    */
    IllustrationMessageType["TntSuccessfulAuth"] = "TntSuccessfulAuth";
    /**
    * "TntSystems" illustration type.
    * @public
    * @type {TntSystems}
    */
    IllustrationMessageType["TntSystems"] = "TntSystems";
    /**
    * "TntTeams" illustration type.
    * @public
    * @type {TntTeams}
    */
    IllustrationMessageType["TntTeams"] = "TntTeams";
    /**
    * "TntTools" illustration type.
    * @public
    * @type {TntTools}
    */
    IllustrationMessageType["TntTools"] = "TntTools";
    /**
    * "TntUnableToLoad" illustration type.
    * @public
    * @type {TntUnableToLoad}
    */
    IllustrationMessageType["TntUnableToLoad"] = "TntUnableToLoad";
    /**
    * "TntUnlock" illustration type.
    * @public
    * @type {TntUnlock}
    */
    IllustrationMessageType["TntUnlock"] = "TntUnlock";
    /**
    * "TntUnsuccessfulAuth" illustration type.
    * @public
    * @type {TntUnsuccessfulAuth}
    */
    IllustrationMessageType["TntUnsuccessfulAuth"] = "TntUnsuccessfulAuth";
    /**
    * "TntUser2" illustration type.
    * @public
    * @type {TntUser2}
    */
    IllustrationMessageType["TntUser2"] = "TntUser2";
  })(IllustrationMessageType || (IllustrationMessageType = {}));
  var _default = IllustrationMessageType;
  _exports.default = _default;
});