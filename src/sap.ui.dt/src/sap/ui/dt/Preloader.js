/*!
 * ${copyright}
 */

 /*global Promise */

// Provides object sap.ui.dt.Preloader.
sap.ui.define([
	"sap/ui/core/Element"
],
function(Element) {
	"use strict";

	/**
	 * Class for Preloader.
	 * 
	 * @class
	 * Preloader for DT metadata
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.Preloader
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Preloader = {};

	Preloader.load = function(aClasses) {
		var aQueue = [];
		aClasses.forEach(function(vClass) {
			var oClass = vClass;
			if (typeof oClass === "string") {
				oClass = jQuery.sap.getObject(oClass);
			}
			if (oClass && oClass.getMetadata) {
				var oMetadata = oClass.getMetadata();
				if (oMetadata.loadDesignTime) {
					aQueue.push(oMetadata.loadDesignTime());
				}
			}
		});
		return Promise.all(aQueue);
	};

	Preloader.loadLibraries = function(aLibNames) {
		var aControlsToLoad = [];
		aLibNames.forEach(function(sLibName) {
			var mLib = jQuery.sap.getObject(sLibName);
			for (var sClassName in mLib) {
				if (mLib.hasOwnProperty(sClassName)) {
					aControlsToLoad.push(sLibName + "." + sClassName);
				}
			}	
		});
		return this.load(aControlsToLoad);
	};

	Preloader.loadAllLibraries = function() {
		var aLibrariesToLoad = [];
		var mLibs = sap.ui.getCore().getLoadedLibraries();
		for (var sLib in mLibs) {
			if (mLibs.hasOwnProperty(sLib)) {
				aLibrariesToLoad.push(sLib);
			}
		}
		return this.loadLibraries(aLibrariesToLoad);
	};

	return Preloader;
}, /* bExport= */ true);
