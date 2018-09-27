/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Core"
], function (Log, oCore) {
	"use strict";

	QUnit.module("Setters");

	var oLibraries,
		aExcludedLibraries;

	// Exclude libraries - we need this to exclude libraries that will not be tested at this point in time
	aExcludedLibraries = [
		"sap.ui.core",
		"sap.ui.codeeditor", // can't be loaded async
		"sap.ui.export",
		"sap.ui.ux3",
		"sap.ui.table",
		"sap.ui.suite",
		"sap.ui.dt",
		"sap.uxap",
		"sap.ui.demokit",
		"sap.ui.commons",
		"sap.viz",
		"sap.chart",
		"sap.me",
		"sap.suite.ui.microchart",
		"sap.suite.ui.commons",
		"sap.ui.comp",
		"sap.ui.composite",
		"sap.ui.rta",
		"sap.uiext.inbox",
		"sap.service.visualization",
		"sap.ushell.ui",
		"sap.ca.ui",
		"sap.msap.tnt",
		"sap.apf",
		"sap.ca.scfld.md",
		"sap.collaboration",
		"sap.fiori",
		"sap.gantt",
		"sap.gantt.config",
		"sap.landvisz",
		"sap.makit",
		"sap.ndc",
		"sap.ui.generic.app",
		"sap.ui.fl",
		"sap.ovp",
		"sap.portal.ui5",
		"sap.rules.ui",
		"sap.suite.ui.generic.template",
		"sap.ui.generic.template",
		"sap.ui.richtexteditor",
		"sap.ui.vbm",
		"sap.ui.vtm",
		"sap.ui.vk",
		"sap.fiori",
		"sap.ushell",
		"sap.ui.dev",
		"sap.ui.dev2",
		"sap.ui.mdc",
		"sap.ui.support",
		"sap.diagram",
		"sap.zen.crosstab",
		"sap.zen.dsh",
		"sap.zen.commons",
		"sap.fe",
		"sap.fileviewer"
	];

	oLibraries = getLibraries(aExcludedLibraries);

	// Create tests for all loaded libraries
	Object.keys(oLibraries).forEach(function(sLibName) {

		if (aExcludedLibraries.indexOf(sLibName) === -1) {

			var oLibrary = oLibraries[sLibName];

			// Mind here we need a concatenated copy of the original array`s!!!
			var aClasses = oLibrary.controls.concat(oLibrary.elements.slice());

			QUnit.test("All control and element setters should return correct context in library " + sLibName, function (fnAssert) {
				// Test all classes from list
				return Promise.all(
					aClasses.map(function(sClassName) {
						return loadClass(sClassName).then(function(FNClass) {
							assertAllSettersForClass(FNClass, fnAssert);
						});
					})
				);
			});

		}

	});

	/**
	 * Asynchronously loads the module for the class with the given name and returns the export of that module
	 * @param {string} sClassName name of the class to load
	 */
	function loadClass(sClassName) {
		var sModuleName = sClassName.replace(/\./g, "/");
		return new Promise(function(resolve, reject) {
			sap.ui.require([sModuleName], function(FNClass) {
				resolve(FNClass);
			}, reject);
		});
	}

	/**
	 * Creates assertions for all setters of the given class
	 * @param {string} sClassName class to be tested
	 * @param {function} fnAssert QUnit assert
	 */
	function assertAllSettersForClass(oClass, fnAssert) {
		var oMetadata = oClass.getMetadata(),
			sClassName = oMetadata.getName(),
			oControl,
			oProperties,
			oProperty,
			sPropertyName,
			sSetterName,
			oValue,
			sName,
			bDateInName;

		// Abstract classes should not be tested on their own
		if (oMetadata.isAbstract()) {
			return;
		}

		try {
			oControl = new oClass();
		} catch (e) {
			fnAssert.ok(false, "Failed to init class " + sClassName + " without parameters with exception: " + e);
			return;
		}

		oProperties = oMetadata.getAllProperties();

		for (sPropertyName in oProperties) {
			if (oProperties.hasOwnProperty(sPropertyName)) {
				oProperty = oProperties[sPropertyName];

				// Get the name of the setter.
				// We access this private property only to be able to display more meaningful
				// info in the test message
				sSetterName = oProperty._sMutator;

				// Get the value of the property
				oValue = oProperty.get(oControl);

				// Assert
				try {
					fnAssert.ok(oControl === oProperty.set(oControl, oValue),
							sClassName + "." + sSetterName + "() should always return <this>");
				} catch (e) {
					// If the setter fails we have a special scenario where date may be required
					// but as there is no type "date" in our metadata API we need to identify it here
					// and provide a JavaScript Date so we can test the setter
					sName = oProperty.name;
					bDateInName = sName.indexOf("Date", sName.length - 4) !== -1 || sName.substring(0, 4) === "date";
					if ((sName === "date" || bDateInName) && oProperty.type === "object") {
						fnAssert.ok(oControl === oProperty.set(oControl, new Date()),
								sClassName + "." + sSetterName + "({js date}) should always return <this>");
					} else {
						// If the setter fails for some reason called with the value from get collected before that
						// we need to fail with a meaningful error.
						fnAssert.ok(false, "Setter " + sClassName + "." + sSetterName + "(" + oValue + ") fails when called " +
								"with value received from get with exception: " + e);
					}
				}
			}
		}

	}

	/**
	 * Returns libraries object containing all loaded libraries and their controls
	 * @param {Array} aExcludedLibraries - list of libraries to exclude
	 * @returns {object} libraries object
	 */
	function getLibraries (aExcludedLibraries) {
		var oLibraries = oCore.getLoadedLibraries(),
			sInfoLibName,
			bNewLibrary,
			oInfo,
			i;

		// Maybe libraries have been added, so discover what is available in order to also test them.
		oInfo = sap.ui.getVersionInfo();
		for (i = 0; i < oInfo.libraries.length; i++) {
			sInfoLibName = oInfo.libraries[i].name;
			if (aExcludedLibraries.indexOf(sInfoLibName) === -1 && !oLibraries[sInfoLibName]) {
				Log.info("Libary '" + sInfoLibName + "' is not loaded!");
				try {
					oCore.loadLibrary(sInfoLibName);
					bNewLibrary = true;
				} catch (e) {
					// not a control lib? This happens for e.g. "themelib_sap_bluecrystal"...
				}
			}
		}

		// Renew the libraries object if new libraries are added
		if (bNewLibrary) {
			oLibraries = oCore.getLoadedLibraries();
		}

		return oLibraries;
	}

});
