/*!
 * ${copyright}
 */

sap.ui.define(['sap/base/util/LoaderExtensions'], function (LoaderExtensions) {
	"use strict";

	/**
	 * @alias sap.ui.VersionInfo
	 * @namespace
	 * @public
	 */
	var VersionInfo = {};

	/**
	 * Loads the version info file (resources/sap-ui-version.json) asynchronously and returns a Promise.
	 * The returned Promise resolves with the version info files content.
	 *
	 * If a library name is specified then the version info of the individual library will be retrieved.
	 *
	 * In case of the version info file is not available an error will occur when calling this function.
	 *
	 * @param {object} mOptions an object map (see below)
	 * @param {string} mOptions.library name of the library (e.g. "sap.ui.core")
	 * @return {Promise} a Promise which resolves with one of these values:
	 *                   the full version info,
	 *                   the library specific one,
	 *                   undefined if library is not listed or there was an error during loading.
	 * @since 1.56.0
	 * @public
	 * @static
	 */
	VersionInfo.load = function (mOptions) {
		mOptions = mOptions || {};
		mOptions.async = true;
		return VersionInfo._load(mOptions);
	};

	/**
	 * Stores the loading Promise for "sap-ui-version.json".
	 * @see sap.ui.getVersionInfo
	 * @private
	 */
	var oVersionInfoPromise = null;

	var oVersionInfo;

	/**
	 * Mapping of library name to it's dependencies.
	 * Extracted from sap.ui.versioninfo.
	 */
	var mKnownLibs;

	/**
	 * Mapping of component names to it's dependencies.
	 * Extracted from sap.ui.versioninfo.
	 */
	var mKnownComponents;

	Object.defineProperty(sap.ui, "versioninfo", {
		configurable: true,
		enumerable: true,
		get: function() {
			return oVersionInfo;
		},
		set: function(oNewVersionInfo) {
			oVersionInfo = oNewVersionInfo;

			// reset known libs and components
			mKnownLibs = null;
			mKnownComponents = null;
		}
	});

	/**
	 * Version retrieval. Used by {@link sap.ui.getVersionInfo} and {@link sap.ui.VersionInfo.load}
	 *
	 * @param {string|object} [mOptions] name of the library (e.g. "sap.ui.core") or an object map (see below)
	 * @param {boolean} [mOptions.library] name of the library (e.g. "sap.ui.core")
	 * @param {boolean} [mOptions.async=false] whether "sap-ui-version.json" should be loaded asynchronously
	 * @param {boolean} [mOptions.failOnError=true] whether to propagate load errors or not (not relevant for async loading)
	 * @return {object|undefined|Promise} the full version info, the library specific one,
	 *                                    undefined (if library is not listed or there was an error and "failOnError" is set to "false")
	 *                                    or a Promise which resolves with one of them
	 * @private
	 * @static
	 */
	VersionInfo._load = function(mOptions) {

		// Check for no parameter / library name as string
		if (typeof mOptions !== "object") {
			mOptions = {
				library: mOptions
			};
		}

		// Cast "async" to boolean (defaults to false)
		mOptions.async = mOptions.async === true;

		// Cast "failOnError" to boolean (defaults to true)
		mOptions.failOnError = mOptions.failOnError !== false;

		if (!sap.ui.versioninfo) {
			// Load and cache the versioninfo

			// When async is enabled and the file is currently being loaded
			// return the promise and make sure the requested options are passed.
			// This is to prevent returning the full object as requested in a
			// first call (which created this promise) to the one requested just a
			// single lib in a second call (which re-uses this same promise) or vice versa.
			if (mOptions.async && oVersionInfoPromise instanceof Promise) {
				return oVersionInfoPromise.then(function() {
					return VersionInfo._load(mOptions);
				});
			}

			var fnHandleSuccess = function(oVersionInfo) {
				// Remove the stored Promise as the versioninfo is now cached.
				// This allows reloading the file by clearing "sap.ui.versioninfo"
				// (however this is not documented and therefore not supported).
				oVersionInfoPromise = null;

				// "LoaderExtensions.loadResource" returns "null" in case of an error when
				// "failOnError" is set to "false". In this case the won't be persisted
				// and undefined will be returned.
				if (oVersionInfo === null) {
					return undefined;
				}

				// Persist the info object to return it in subsequent calls
				sap.ui.versioninfo = oVersionInfo;


				// Calling the function again with the same arguments will return the
				// cached value from "sap.ui.versioninfo".
				return VersionInfo._load(mOptions);
			};
			var fnHandleError = function(oError) {
				// Remove the stored Promise as the versioninfo couldn't be loaded
				// and should be requested again the next time.
				oVersionInfoPromise = null;

				// Re-throw the error to give it to the user
				throw oError;
			};

			var vReturn = LoaderExtensions.loadResource("sap-ui-version.json", {
				async: mOptions.async,

				// "failOnError" only applies for sync mode, async should always fail (reject)
				failOnError: mOptions.async || mOptions.failOnError
			});

			if (vReturn instanceof Promise) {
				oVersionInfoPromise = vReturn;
				return vReturn.then(fnHandleSuccess, fnHandleError);
			} else {
				return fnHandleSuccess(vReturn);
			}

		} else {
			// Return the cached versioninfo

			var oResult;
			if (typeof mOptions.library !== "undefined") {
				// Find the version of the individual library
				var aLibs = sap.ui.versioninfo.libraries;
				if (aLibs) {
					for (var i = 0, l = aLibs.length; i < l; i++) {
						if (aLibs[i].name === mOptions.library) {
							oResult = aLibs[i];
							break;
						}
					}
				}
			} else {
				// Return the full version info
				oResult = sap.ui.versioninfo;
			}

			return mOptions.async ? Promise.resolve(oResult) : oResult;
		}
	};

	/**
	 * Transforms the sap.ui.versioninfo to an easier consumable map.
	 */
	function transformVersionInfo() {

		// get the transitive dependencies of the given libs from the sap.ui.versioninfo
		// only do this once if mKnownLibs is not created yet
		if (sap.ui.versioninfo && sap.ui.versioninfo.libraries && !mKnownLibs) {
			// flatten dependency lists for all libs
			mKnownLibs = {};
			sap.ui.versioninfo.libraries.forEach(function(oLib, i) {
				mKnownLibs[oLib.name] = {};

				var mDeps = oLib.manifestHints && oLib.manifestHints.dependencies &&
							oLib.manifestHints.dependencies.libs;
				for (var sDep in mDeps) {
					if (!mDeps[sDep].lazy) {
						mKnownLibs[oLib.name][sDep] = true;
					}
				}
			});
		}

		// get transitive dependencies for a component
		if (sap.ui.versioninfo && sap.ui.versioninfo.components && !mKnownComponents) {
			mKnownComponents = {};

			Object.keys(sap.ui.versioninfo.components).forEach(function(sComponentName) {
				var oComponentInfo = sap.ui.versioninfo.components[sComponentName];

				mKnownComponents[sComponentName] = {
					library: oComponentInfo.library,
					dependencies: []
				};

				var mDeps = oComponentInfo.manifestHints && oComponentInfo.manifestHints.dependencies &&
							oComponentInfo.manifestHints.dependencies.libs;
				for (var sDep in mDeps) {
					if (!mDeps[sDep].lazy) {
						mKnownComponents[sComponentName].dependencies.push(sDep);
					}
				}
			});
		}
	}

	/**
	 * Gets all additional transitive dependencies for the given list of libraries.
	 * Returns a new array.
	 * @param {string[]} aLibraries a list of libraries for which the transitive
	 * dependencies will be extracted from the sap.ui.versioninfo
	 * @returns {string[]} the list of all transitive dependencies for the given initial
	 * list of libraries
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	VersionInfo._getTransitiveDependencyForLibraries = function(aLibraries) {

		transformVersionInfo();

		if (mKnownLibs) {
			var mClosure = aLibraries.reduce(function(all, lib) {
				all[lib] = true;
				return Object.assign(all, mKnownLibs[lib]);
			}, {});
			aLibraries = Object.keys(mClosure);
		}

		return aLibraries;
	};

	/**
	 * If the given component is part of the version-info, an array with all transitive dependencies is returned.
	 * The dependency list includes the library in which the component itself is contained.
	 * @param {string} sComponentName the component name
	 * @returns {Array<{library:string,dependencies:Array<string>}>} list of the located library and all transitive dependencies for the given component
	 *    or undefined if the component is not part of the version-info. Each object has two properties: "library" and "dependencies".
	 *    The property "library" contains the name of the library which contains the component implementation.
	 *    The property "dependencies" is an array with all transitive dependencies of the component.
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	VersionInfo._getTransitiveDependencyForComponent = function(sComponentName) {
		transformVersionInfo();

		if (mKnownComponents) {
			return mKnownComponents[sComponentName];
		}
	};

	return VersionInfo;
});
