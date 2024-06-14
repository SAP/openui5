/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function (DataType) {
	"use strict";

	/**
	 * Available TNT <code>Illustration</code> types for the {@link sap.m.IllustratedMessage} control.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.tnt.IllustratedMessageType
	 * @since 1.121
	 */
	var IllustratedMessageType = {

		/**
		 * "Avatar" illustration type.
		 * @public
		 */
		Avatar: "tnt-Avatar",

		/**
		 * "Calculator" illustration type.
		 * @public
		 */
		Calculator: "tnt-Calculator",

		/**
		 * "ChartArea" illustration type.
		 * @public
		 */
		ChartArea: "tnt-ChartArea",

		/**
		 * "ChartArea2" illustration type.
		 * @public
		 */
		ChartArea2: "tnt-ChartArea2",

		/**
		 * "ChartBar" illustration type.
		 * @public
		 */
		ChartBar: "tnt-ChartBar",

		/**
		 * "ChartBPMNFlow" illustration type.
		 * @public
		 */
		ChartBPMNFlow: "tnt-ChartBPMNFlow",

		/**
		 * "ChartBullet" illustration type.
		 * @public
		 */
		ChartBullet: "tnt-ChartBullet",

		/**
		 * "ChartDoughnut" illustration type.
		 * @public
		 */
		ChartDoughnut: "tnt-ChartDoughnut",

		/**
		 * "ChartFlow" illustration type.
		 * @public
		 */
		ChartFlow: "tnt-ChartFlow",

		/**
		 * "ChartGantt" illustration type.
		 * @public
		 */
		ChartGantt: "tnt-ChartGantt",

		/**
		 * "ChartOrg" illustration type.
		 * @public
		 */
		ChartOrg: "tnt-ChartOrg",

		/**
		 * "ChartPie" illustration type.
		 * @public
		 */
		ChartPie: "tnt-ChartPie",

		/**
		 * "CodePlaceholder" illustration type.
		 * @public
		 */
		CodePlaceholder: "tnt-CodePlaceholder",

		/**
		 * "Company" illustration type.
		 * @public
		 */
		Company: "tnt-Company",

		/**
		 * "Compass" illustration type.
		 * @public
		 */
		Compass: "tnt-Compass",

		/**
		 * "Components" illustration type.
		 * @public
		 */
		Components: "tnt-Components",

		/**
		 * "Dialog" illustration type.
		 * @public
		 */
		Dialog: "tnt-Dialog",

		/**
		 * "ExternalLink" illustration type.
		 * @public
		 */
		ExternalLink: "tnt-ExternalLink",

		/**
		 * "FaceID" illustration type.
		 * @public
		 */
		FaceID: "tnt-FaceID",

		/**
		 * "Fingerprint" illustration type.
		 * @public
		 */
		Fingerprint: "tnt-Fingerprint",

		/**
		 * "Handshake" illustration type.
		 * @public
		 */
		Handshake: "tnt-Handshake",

		/**
		 * "Help" illustration type.
		 * @public
		 */
		Help: "tnt-Help",

		/**
		 * "Lock" illustration type.
		 * @public
		 */
		Lock: "tnt-Lock",

		/**
		 * "Mission" illustration type.
		 * @public
		 */
		Mission: "tnt-Mission",

		/**
		 * "MissionFailed" illustration type.
		 * @public
		 */
		MissionFailed: "tnt-MissionFailed",

		/**
		 * "NoApplications" illustration type.
		 * @public
		 */
		NoApplications: "tnt-NoApplications",

		/**
		 * "NoFlows" illustration type.
		 * @public
		 */
		NoFlows: "tnt-NoFlows",

		/**
		 * "NoUsers" illustration type.
		 * @public
		 */
		NoUsers: "tnt-NoUsers",

		/**
		 * "Radar" illustration type.
		 * @public
		 */
		Radar: "tnt-Radar",

		/**
		 * "RoadMap" illustration type.
		 * @public
		 */
		RoadMap: "tnt-RoadMap",

		/**
		 * "Secrets" illustration type.
		 * @public
		 */
		Secrets: "tnt-Secrets",

		/**
		 * "Services" illustration type.
		 * @public
		 */
		Services: "tnt-Services",

		/**
		 * "SessionExpired" illustration type.
		 * @public
		 */
		SessionExpired: "tnt-SessionExpired",

		/**
		 * "SessionExpiring" illustration type.
		 * @public
		 */
		SessionExpiring: "tnt-SessionExpiring",

		/**
		 * "Settings" illustration type.
		 * @public
		 */
		Settings: "tnt-Settings",

		/**
		 * "Success" illustration type.
		 * @public
		 */
		Success: "tnt-Success",

		/**
		 * "SuccessfulAuth" illustration type.
		 * @public
		 */
		SuccessfulAuth: "tnt-SuccessfulAuth",

		/**
		 * "Systems" illustration type.
		 * @public
		 */
		Systems: "tnt-Systems",

		/**
		 * "Teams" illustration type.
		 * @public
		 */
		Teams: "tnt-Teams",

		/**
		 * "Tools" illustration type.
		 * @public
		 */
		Tools: "tnt-Tools",

		/**
		 * "Tutorials" illustration type.
		 * @public
		 */
		Tutorials: "tnt-Tutorials",

		/**
		 * "UnableToLoad" illustration type.
		 * @public
		 */
		UnableToLoad: "tnt-UnableToLoad",

		/**
		 * "Unlock" illustration type.
		 * @public
		 */
		Unlock: "tnt-Unlock",

		/**
		 * "UnsuccessfulAuth" illustration type.
		 * @public
		 */
		UnsuccessfulAuth: "tnt-UnsuccessfulAuth",

		/**
		 * "User2" illustration type.
		 * @public
		 */
		User2: "tnt-User2"
	};

	DataType.registerEnum("sap.tnt.IllustratedMessageType", IllustratedMessageType);

	return IllustratedMessageType;
});

