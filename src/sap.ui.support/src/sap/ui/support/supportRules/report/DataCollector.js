/*!
 * ${copyright}
 */

/**
 * Provides methods for information retrieval from the core.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/core/support/ToolsAPI", "sap/ui/thirdparty/URI"],
	function (jQuery, ToolsAPI, URI) {
	"use strict";

	/**
	 * The DataCollector collects information.
	 */
	var DataCollector = function(oCore) {
		this._oCore = oCore;

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
			this._oSupportAssistantInfo.versionAsString = jQuery.sap.escapeHTML(oVersion.version || "");
			this._oSupportAssistantInfo.versionAsString += " (built at " + jQuery.sap.escapeHTML(oVersion.buildTimestamp || "");
			this._oSupportAssistantInfo.versionAsString += ", last change " + jQuery.sap.escapeHTML(oVersion.scmRevision || "") + ")";
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
	 * @returns {Array} All loaded manifest.json files.
	 */
	DataCollector.prototype.getAppInfo = function() {
		var appInfos = [];
		for (var componentName in this._oCore.mObjects.component) {
			var component = this._oCore.mObjects.component[componentName];
			var sapApp = component.getMetadata().getManifestEntry('sap.app');
			appInfos.push(sapApp);
		}
		return appInfos;
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
		var aModules = jQuery.sap.getAllDeclaredModules();
		var aResults = [];
		for (var i = 0; i < aModules.length; i++) {
			aResults.push({
				moduleName : aModules[i],
				relativePath: jQuery.sap.getResourcePath(aModules[i]),
				absolutePath: URI(jQuery.sap.getResourcePath(aModules[i])).absoluteTo(document.location.origin + document.location.pathname).toString()
			});
		}
		oTechData.resourcePaths = aResults;

		//add theme paths
		var mLibraries = this._oCore.getLoadedLibraries();
		aResults = [];
		for (var n in mLibraries) {
			var sPath = this._oCore._getThemePath(n, this._oCore.oConfiguration.theme);
			aResults.push({
				theme : this._oCore.oConfiguration.theme,
				library: n,
				relativePath: sPath,
				absolutePath: URI(sPath).absoluteTo(document.location.origin + document.location.pathname).toString()
			});
		}
		oTechData.themePaths = aResults;

		//add SAPUI5 version object
		try {
			oTechData.sapUi5Version = {
				version: sap.ui.getVersionInfo(),
				path: sap.ui.resource("", "sap-ui-version.json")
			};
		} catch (ex) {
			oTechData.sapUi5Version = null;
		}

		return oTechData;
	};

	return DataCollector;
}, true);
