/*!
 * ${copyright}
 */

/**
 * Provides methods for information retrieval from the core.
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/VersionInfo",
	"sap/base/util/LoaderExtensions",
	"sap/base/security/encodeXML",
	"sap/ui/core/Component",
	"sap/ui/core/Configuration",
	"sap/ui/core/theming/ThemeManager",
	"sap/ui/core/support/ToolsAPI",
	"sap/ui/thirdparty/URI"
],
	function (Core, VersionInfo, LoaderExtensions, encodeXML, Component, Configuration, ThemeManager, ToolsAPI, URI) {
	"use strict";

	/**
	 * The DataCollector collects information.
	 */
	var DataCollector = function() {
		// Set default
		this._oSupportAssistantInfo = {
			location: "",
			version: {},
			versionAsString: ""
		};
	};

	/**
	 * Setter for Support Assistant location
	 *
	 * @public
	 * @param {string} sLocation the location the Support Assistant is loaded from
	 */
	DataCollector.prototype.setSupportAssistantLocation = function (sLocation) {
		this._oSupportAssistantInfo.location = sLocation;
	};

	/**
	 * Setter for Support Assistant version
	 *
	 * @public
	 * @param {Object} oVersion version of the Support Assistant
	 */
	DataCollector.prototype.setSupportAssistantVersion = function (oVersion) {
		this._oSupportAssistantInfo.version = oVersion;
		this._oSupportAssistantInfo.versionAsString = "not available";

		if (oVersion) {
			this._oSupportAssistantInfo.versionAsString = encodeXML(oVersion.version || "");
			this._oSupportAssistantInfo.versionAsString += " (built at " + encodeXML(oVersion.buildTimestamp || "");
			this._oSupportAssistantInfo.versionAsString += ", last change " + encodeXML(oVersion.scmRevision || "") + ")";
		}
	};

	/**
	 * Getter for Support Assistant information
	 *
	 * @public
	 * @returns {Object} Information about the Support Assistant
	 */
	DataCollector.prototype.getSupportAssistantInfo = function() {
		return this._oSupportAssistantInfo;
	};

	/**
	 * @returns {object[]} All 'sap.app' and 'sap.fiori' entries from all loaded manifest.json files.
	 */
	DataCollector.prototype.getAppInfo = function() {
		var aAppInfos = [];
		Component.registry.forEach(function(oComponent) {
			var oSapApp = oComponent.getManifestEntry("sap.app"),
				oSapFiori = oComponent.getManifestEntry("sap.fiori");

			if (oSapApp) {
				aAppInfos.push(oSapApp);
			}

			if (oSapFiori) {
				aAppInfos.push(oSapFiori);
			}
		});
		return aAppInfos;
	};

	/**
	 * Retrieves all technical information. Reused from diagnostics tools.
	 * @returns {Object}
	 */
	DataCollector.prototype.getTechInfoJSON = function() {
		var oCfg = ToolsAPI.getFrameworkInformation();
		var oTechData = {
			sapUi5Version: null,
			version: oCfg.commonInformation.version,
			build: oCfg.commonInformation.buildTime,
			change: oCfg.commonInformation.lastChange,
			jquery: oCfg.commonInformation.jquery,
			useragent: oCfg.commonInformation.userAgent,
			docmode: oCfg.commonInformation.documentMode,
			debug: oCfg.commonInformation.debugMode,
			bootconfig: oCfg.configurationBootstrap,
			config:  oCfg.configurationComputed,
			libraries: oCfg.libraries,
			loadedLibraries: oCfg.loadedLibraries,
			modules: oCfg.loadedModules,
			uriparams: oCfg.URLParameters,
			appurl: oCfg.commonInformation.applicationHREF,
			title: oCfg.commonInformation.documentTitle,
			statistics: oCfg.commonInformation.statistics,
			resourcePaths: [],
			themePaths : [],
			locationsearch: document.location.search,
			locationhash: document.location.hash,
			supportAssistant: this._oSupportAssistantInfo
		};

		//add absolute paths for resources
		var aModules = LoaderExtensions.getAllRequiredModules();
		var aResults = [];
		for (var i = 0; i < aModules.length; i++) {
			aResults.push({
				moduleName : aModules[i],
				relativePath: sap.ui.require.toUrl(aModules[i]),
				absolutePath: URI(sap.ui.require.toUrl(aModules[i])).absoluteTo(document.location.origin + document.location.pathname).toString()
			});
		}
		oTechData.resourcePaths = aResults;

		//add theme paths
		var mLibraries = Core.getLoadedLibraries();
		aResults = [];
		for (var n in mLibraries) {
			if (n === "") {
				// Ignoring "unnamed" libraries.
				// This might happen when a control without namespace is defined
				// (e.g. "MyControl" instead of "com.example.MyControl").
				continue;
			}
			var sPath = ThemeManager._getThemePath(n, Configuration.getTheme());
			aResults.push({
				theme : Configuration.getTheme(),
				library: n,
				relativePath: sPath,
				absolutePath: URI(sPath).absoluteTo(document.location.origin + document.location.pathname).toString()
			});
		}
		oTechData.themePaths = aResults;

		return VersionInfo.load().then(function (oVersionInfo) {
			// add SAPUI5 version object
			oTechData.sapUi5Version = {
				version: oVersionInfo,
				path: sap.ui.require.toUrl("sap-ui-version.json")
			};

			return oTechData;
		});
	};

	return DataCollector;
}, true);
