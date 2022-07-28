/*!
 * ${copyright}
 */

sap.ui.define(['sap/base/util/LoaderExtensions'], function (LoaderExtensions) {
	"use strict";

	/**
	 * @alias module:sap/ui/VersionInfo
	 * @namespace
	 * @since 1.56.0
	 * @public
	 */
	var VersionInfo = {};

	/**
	 * Loads the version info asynchronously from resource "sap-ui-version.json".
	 *
	 * By default, the returned promise will resolve with the whole version info file's content.
	 * If a library name is specified in the options, then the promise will resolve with the
	 * version info for that library only or with <code>undefined</code>, if the named library
	 * is not listed in the version info file.
	 *
	 * If loading the version info file fails, the promise will be rejected with the corresponding
	 * error.
	 *
	 * @param {object} [mOptions] Map of options
	 * @param {string} [mOptions.library] Name of a library (e.g. "sap.ui.core")
	 * @returns {Promise<object|undefined>}
	 *    A promise which resolves with the full version info or with the library specific version
	 *    info or <code>undefined</code> if the library is not listed; if an error occurred during
	 *    loading, then the promise is rejected.
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
	 * Extracted from the loaded version info.
	 */
	var mKnownLibs;

	/**
	 * Mapping of component names to it's dependencies.
	 * Extracted from the loaded version info.
	 */
	var mKnownComponents;

	function updateVersionInfo(oNewVersionInfo) {
		// Persist the info object
		oVersionInfo = oNewVersionInfo;
		// reset known libs and components
		mKnownLibs = null;
		mKnownComponents = null;
	}

	Object.defineProperty(sap.ui, "versioninfo", {
		configurable: true,
		enumerable: true,
		get: function() {
			return oVersionInfo;
		},
		set: function(oNewVersionInfo) {
			updateVersionInfo(oNewVersionInfo);
		}
	});

	/**
	 * Version retrieval. Used by {@link sap.ui.getVersionInfo} and {@link module:sap/ui/VersionInfo.load}
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

		if (!oVersionInfo) {
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

			var fnHandleSuccess = function(oNewVersionInfo) {
				// Remove the stored Promise as the version info is now cached.
				// This allows reloading the file by clearing "sap.ui.versioninfo"
				// (however this is not documented and therefore not supported).
				oVersionInfoPromise = null;

				// "LoaderExtensions.loadResource" returns "null" in case of an error when
				// "failOnError" is set to "false". In this case the won't be persisted
				// and undefined will be returned.
				if (oNewVersionInfo === null) {
					return undefined;
				}

				updateVersionInfo(oNewVersionInfo);

				// Calling the function again with the same arguments will return the
				// cached value from the loaded version info.
				return VersionInfo._load(mOptions);
			};
			var fnHandleError = function(oError) {
				// Remove the stored Promise as the version info couldn't be loaded
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
				var aLibs = oVersionInfo.libraries;
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
				oResult = oVersionInfo;
			}

			return mOptions.async ? Promise.resolve(oResult) : oResult;
		}
	};

	/**
	 * Transforms the loaded version info to an easier consumable map.
	 */
	function transformVersionInfo() {
		if (oVersionInfo){
			// get the transitive dependencies of the given libs from the loaded version info
			// only do this once if mKnownLibs is not created yet
			if (oVersionInfo.libraries && !mKnownLibs) {
				// flatten dependency lists for all libs
				mKnownLibs = {};
				oVersionInfo.libraries.forEach(function(oLib, i) {
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
			if (oVersionInfo.components && !mKnownComponents) {
				mKnownComponents = {};

				Object.keys(oVersionInfo.components).forEach(function(sComponentName) {
					var oComponentInfo = oVersionInfo.components[sComponentName];

					mKnownComponents[sComponentName] = {
						library: oComponentInfo.library,
						hasOwnPreload: oComponentInfo.hasOwnPreload || false,
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
	}

	/**
	 * Gets all additional transitive dependencies for the given list of libraries.
	 * Returns a new array.
	 * @param {string[]} aLibraries a list of libraries for which the transitive
	 * dependencies will be extracted from the loaded version info
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
	 * If the given component is part of the version-info, an object with library and dependency information is returned.
	 *
	 * The object has three properties:
	 * <ul>
	 * <li><code>library</code> contains the name of the library which contains the component implementation</li>
	 * <li><code>dependencies</code> is an array with all transitive dependencies of the component</li>
	 * <li><code>hasOwnPreload</code> is a boolean indicating whether the component has its own Component-preload bundle</li>
	 * </ul>
	 *
	 * @param {string} sComponentName the component name
	 * @returns {{library: string, hasOwnPreload: boolean, dependencies: string[]}|undefined}
	 *    An info object containing the located library and all transitive dependencies for the given component
	 *    or <code>undefined</code> if the component is not part of the version-info.
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
