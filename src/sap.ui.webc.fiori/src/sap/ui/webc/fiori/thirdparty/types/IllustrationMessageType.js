sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.fiori.types.IllustrationMessageType.prototype
   * @public
   */
  const IllustrationMessageTypes = {
    /**
     * "Before Search" illustration type.
     * @public
     * @type {BeforeSearch}
     */
    BeforeSearch: "BeforeSearch",
    /**
     * "No Activities" illustration type.
     * @public
     * @type {NoActivities}
     */
    NoActivities: "NoActivities",
    /**
     * "No Data" illustration type.
     * @public
     * @type {NoData}
     */
    NoData: "NoData",
    /**
     * "No Email" illustration type.
     * @public
     * @type {NoMail}
     */
    NoMail: "NoMail",
    /**
     * "No Email v1" illustration type.
     * @public
     * @type {NoMail_v1}
     */
    NoMail_v1: "NoMail_v1",
    /**
     * "No Entries" illustration type.
     * @public
     * @type {NoEntries}
     */
    NoEntries: "NoEntries",
    /**
     * "No Notifications" illustration type.
     * @public
     * @type {NoNotifications}
     */
    NoNotifications: "NoNotifications",
    /**
     * "No Saved Items" illustration type.
     * @public
     * @type {NoSavedItems}
     */
    NoSavedItems: "NoSavedItems",
    /**
     * "No Saved Items v1" illustration type.
     * @public
     * @type {NoSavedItems_v1}
     */
    NoSavedItems_v1: "NoSavedItems_v1",
    /**
     * "No Search Results" illustration type.
     * @public
     * @type {NoSearchResults}
     */
    NoSearchResults: "NoSearchResults",
    /**
     * "No Tasks" illustration type.
     * @public
     * @type {NoTasks}
     */
    NoTasks: "NoTasks",
    /**
     * "No Tasks v1" illustration type.
     * @public
     * @type {NoTasks_v1}
     */
    NoTasks_v1: "NoTasks_v1",
    /**
     * "Unable To Load" illustration type.
     * @public
     * @type {UnableToLoad}
     */
    UnableToLoad: "UnableToLoad",
    /**
     * "Unable To Load Image" illustration type.
     * @public
     * @type {UnableToLoadImage}
     */
    UnableToLoadImage: "UnableToLoadImage",
    /**
     * "Unable To Upload" illustration type.
     * @public
     * @type {UnableToUpload}
     */
    UnableToUpload: "UnableToUpload",
    /**
     * "Add Column" illustration type.
     * @public
     * @type {AddColumn}
     */
    AddColumn: "AddColumn",
    /**
     * "Add People" illustration type.
     * @public
     * @type {AddPeople}
     */
    AddPeople: "AddPeople",
    /**
     * "Balloon Sky" illustration type.
     * @public
     * @type {BalloonSky}
     */
    BalloonSky: "BalloonSky",
    /**
     * "Connection" illustration type.
     * @public
     * @type {Connection}
     */
    Connection: "Connection",
    /**
     * "Empty Calendar" illustration type.
     * @public
     * @type {EmptyCalendar}
     */
    EmptyCalendar: "EmptyCalendar",
    /**
     * "Empty List" illustration type.
     * @public
     * @type {EmptyList}
     */
    EmptyList: "EmptyList",
    /**
     * "Empty Planning Calendar" illustration type.
     * @public
     * @type {EmptyPlanningCalendar}
     */
    EmptyPlanningCalendar: "EmptyPlanningCalendar",
    /**
     * "Error Screen" illustration type.
     * @public
     * @type {ErrorScreen}
     */
    ErrorScreen: "ErrorScreen",
    /**
     * "Filter Table" illustration type.
     * @public
     * @type {FilterTable}
     */
    FilterTable: "FilterTable",
    /**
     * "Group Table" illustration type.
     * @public
     * @type {GroupTable}
     */
    GroupTable: "GroupTable",
    /**
     * "No Filter Results" illustration type.
     * @public
     * @type {NoFilterResults}
     */
    NoFilterResults: "NoFilterResults",
    /**
     * "Page Not Found" illustration type.
     * @public
     * @type {PageNotFound}
     */
    PageNotFound: "PageNotFound",
    /**
     * "Reload Screen" illustration type.
     * @public
     * @type {ReloadScreen}
     */
    ReloadScreen: "ReloadScreen",
    /**
     * "Resize Column" illustration type.
     * @public
     * @type {ResizeColumn}
     */
    ResizeColumn: "ResizeColumn",
    /**
     * "Search Earth" illustration type.
     * @public
     * @type {SearchEarth}
     */
    SearchEarth: "SearchEarth",
    /**
     * "Search Folder" illustration type.
     * @public
     * @type {SearchFolder}
     */
    SearchFolder: "SearchFolder",
    /**
     * "Simple Balloon" illustration type.
     * @public
     * @type {SimpleBalloon}
     */
    SimpleBalloon: "SimpleBalloon",
    /**
     * "Simple Bell" illustration type.
     * @public
     * @type {SimpleBell}
     */
    SimpleBell: "SimpleBell",
    /**
     * "Simple Calendar" illustration type.
     * @public
     * @type {SimpleCalendar}
     */
    SimpleCalendar: "SimpleCalendar",
    /**
     * "Simple CheckMark" illustration type.
     * @public
     * @type {SimpleCheckMark}
     */
    SimpleCheckMark: "SimpleCheckMark",
    /**
     * "Simple Connection" illustration type.
     * @public
     * @type {SimpleConnection}
     */
    SimpleConnection: "SimpleConnection",
    /**
     * "Simple Empty Doc" illustration type.
     * @public
     * @type {SimpleEmptyDoc}
     */
    SimpleEmptyDoc: "SimpleEmptyDoc",
    /**
     * "Simple Empty List" illustration type.
     * @public
     * @type {SimpleEmptyList}
     */
    SimpleEmptyList: "SimpleEmptyList",
    /**
     * "Simple Error" illustration type.
     * @public
     * @type {SimpleError}
     */
    SimpleError: "SimpleError",
    /**
     * "Simple Magnifier" illustration type.
     * @public
     * @type {SimpleMagnifier}
     */
    SimpleMagnifier: "SimpleMagnifier",
    /**
     * "Simple Mail" illustration type.
     * @public
     * @type {SimpleMail}
     */
    SimpleMail: "SimpleMail",
    /**
     * "Simple No Saved Items" illustration type.
     * @public
     * @type {SimpleNoSavedItems}
     */
    SimpleNoSavedItems: "SimpleNoSavedItems",
    /**
     * "Simple Not Found Magnifier" illustration type.
     * @public
     * @type {SimpleNotFoundMagnifier}
     */
    SimpleNotFoundMagnifier: "SimpleNotFoundMagnifier",
    /**
     * "Simple Reload" illustration type.
     * @public
     * @type {SimpleReload}
     */
    SimpleReload: "SimpleReload",
    /**
     * "Simple Task" illustration type.
     * @public
     * @type {SimpleTask}
     */
    SimpleTask: "SimpleTask",
    /**
     * "Sleeping Bell" illustration type.
     * @public
     * @type {SleepingBell}
     */
    SleepingBell: "SleepingBell",
    /**
     * "Sort Column" illustration type.
     * @public
     * @type {SortColumn}
     */
    SortColumn: "SortColumn",
    /**
     * "Success Balloon" illustration type.
     * @public
     * @type {SuccessBalloon}
     */
    SuccessBalloon: "SuccessBalloon",
    /**
     * "Success CheckMark" illustration type.
     * @public
     * @type {SuccessCheckMark}
     */
    SuccessCheckMark: "SuccessCheckMark",
    /**
     * "Success HighFive" illustration type.
     * @public
     * @type {SuccessHighFive}
     */
    SuccessHighFive: "SuccessHighFive",
    /**
     * "Success Screen" illustration type.
     * @public
     * @type {SuccessScreen}
     */
    SuccessScreen: "SuccessScreen",
    /**
     * "Tent" illustration type.
     * @public
     * @type {Tent}
     */
    Tent: "Tent",
    /**
     * "Upload Collection" illustration type.
     * @public
     * @type {UploadCollection}
     */
    UploadCollection: "UploadCollection",
    /**
    * "TntChartArea" illustration type.
    * @public
    * @type {TntChartArea}
    */
    TntChartArea: "TntChartArea",
    /**
    * "TntChartArea2" illustration type.
    * @public
    * @type {TntChartArea2}
    */
    TntChartArea2: "TntChartArea2",
    /**
    * "TntChartBar" illustration type.
    * @public
    * @type {TntChartBar}
    */
    TntChartBar: "TntChartBar",
    /**
    * "TntChartBPMNFlow" illustration type.
    * @public
    * @type {TntChartBPMNFlow}
    */
    TntChartBPMNFlow: "TntChartBPMNFlow",
    /**
    * "TntChartBullet" illustration type.
    * @public
    * @type {TntChartBullet}
    */
    TntChartBullet: "TntChartBullet",
    /**
    * "TntChartDoughnut" illustration type.
    * @public
    * @type {TntChartDoughnut}
    */
    TntChartDoughnut: "TntChartDoughnut",
    /**
    * "TntChartFlow" illustration type.
    * @public
    * @type {TntChartFlow}
    */
    TntChartFlow: "TntChartFlow",
    /**
    * "TntChartGantt" illustration type.
    * @public
    * @type {TntChartGantt}
    */
    TntChartGantt: "TntChartGantt",
    /**
    * "TntChartOrg" illustration type.
    * @public
    * @type {TntChartOrg}
    */
    TntChartOrg: "TntChartOrg",
    /**
    * "TntChartPie" illustration type.
    * @public
    * @type {TntChartPie}
    */
    TntChartPie: "TntChartPie",
    /**
    * "TntCodePlaceholder" illustration type.
    * @public
    * @type {TntCodePlaceholder}
    */
    TntCodePlaceholder: "TntCodePlaceholder",
    /**
    * "TntCompany" illustration type.
    * @public
    * @type {TntCompany}
    */
    TntCompany: "TntCompany",
    /**
    * "TntComponents" illustration type.
    * @public
    * @type {TntComponents}
    */
    TntComponents: "TntComponents",
    /**
    * "TntExternalLink" illustration type.
    * @public
    * @type {TntExternalLink}
    */
    TntExternalLink: "TntExternalLink",
    /**
    * "TntFaceID" illustration type.
    * @public
    * @type {TntFaceID}
    */
    TntFaceID: "TntFaceID",
    /**
    * "TntFingerprint" illustration type.
    * @public
    * @type {TntFingerprint}
    */
    TntFingerprint: "TntFingerprint",
    /**
    * "TntLock" illustration type.
    * @public
    * @type {TntLock}
    */
    TntLock: "TntLock",
    /**
    * "TntMission" illustration type.
    * @public
    * @type {TntMission}
    */
    TntMission: "TntMission",
    /**
    * "TntNoApplications" illustration type.
    * @public
    * @type {TntNoApplications}
    */
    TntNoApplications: "TntNoApplications",
    /**
    * "TntNoFlows" illustration type.
    * @public
    * @type {TntNoFlows}
    */
    TntNoFlows: "TntNoFlows",
    /**
    * "TntNoUsers" illustration type.
    * @public
    * @type {TntNoUsers}
    */
    TntNoUsers: "TntNoUsers",
    /**
    * "TntRadar" illustration type.
    * @public
    * @type {TntRadar}
    */
    TntRadar: "TntRadar",
    /**
    * "TntSecrets" illustration type.
    * @public
    * @type {TntSecrets}
    */
    TntSecrets: "TntSecrets",
    /**
    * "TntServices" illustration type.
    * @public
    * @type {TntServices}
    */
    TntServices: "TntServices",
    /**
    * "TntSessionExpired" illustration type.
    * @public
    * @type {TntSessionExpired}
    */
    TntSessionExpired: "TntSessionExpired",
    /**
    * "TntSessionExpiring" illustration type.
    * @public
    * @type {TntSessionExpiring}
    */
    TntSessionExpiring: "TntSessionExpiring",
    /**
    * "TntSuccess" illustration type.
    * @public
    * @type {TntSuccess}
    */
    TntSuccess: "TntSuccess",
    /**
    * "TntSuccessfulAuth" illustration type.
    * @public
    * @type {TntSuccessfulAuth}
    */
    TntSuccessfulAuth: "TntSuccessfulAuth",
    /**
    * "TntSystems" illustration type.
    * @public
    * @type {TntSystems}
    */
    TntSystems: "TntSystems",
    /**
    * "TntTeams" illustration type.
    * @public
    * @type {TntTeams}
    */
    TntTeams: "TntTeams",
    /**
    * "TntTools" illustration type.
    * @public
    * @type {TntTools}
    */
    TntTools: "TntTools",
    /**
    * "TntUnableToLoad" illustration type.
    * @public
    * @type {TntUnableToLoad}
    */
    TntUnableToLoad: "TntUnableToLoad",
    /**
    * "TntUnlock" illustration type.
    * @public
    * @type {TntUnlock}
    */
    TntUnlock: "TntUnlock",
    /**
    * "TntUnsuccessfulAuth" illustration type.
    * @public
    * @type {TntUnsuccessfulAuth}
    */
    TntUnsuccessfulAuth: "TntUnsuccessfulAuth",
    /**
    * "TntUser2" illustration type.
    * @public
    * @type {TntUser2}
    */
    TntUser2: "TntUser2"
  };

  /**
   * @class
   * Different illustration types of Illustrated Message.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.IllustrationMessageType
   * @public
   * @enum {string}
   */
  class IllustrationMessageType extends _DataType.default {
    static isValid(value) {
      return !!IllustrationMessageTypes[value];
    }
  }
  IllustrationMessageType.generateTypeAccessors(IllustrationMessageTypes);
  var _default = IllustrationMessageType;
  _exports.default = _default;
});