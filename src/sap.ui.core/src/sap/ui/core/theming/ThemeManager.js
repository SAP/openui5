/*!
 * ${copyright}
 */

// Provides class sap.ui.core.theming.ThemeManager
sap.ui.define([
	"sap/base/assert",
	"sap/base/Eventing",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/base/OwnStatics",
	"sap/ui/VersionInfo",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper",
	"sap/ui/dom/includeStylesheet"
], function(
	assert,
	Eventing,
	Log,
	Localization,
	OwnStatics,
	VersionInfo,
	Theming,
	ThemeHelper,
	includeStylesheet
) {
	"use strict";

	const CUSTOM_CSS_CHECK = /\.sapUiThemeDesignerCustomCss/i;
	const MODULE_NAME = "sap.ui.core.theming.ThemeManager";
	const CUSTOM_ID = "sap-ui-core-customcss";
	const THEME_PREFIX = "sap-ui-theme-";
	const LINK_ID_REGGEX_STRING = `^${THEME_PREFIX}(.*)`;
	const LINK_ID_CHECK = new RegExp(LINK_ID_REGGEX_STRING);

	const oEventing = new Eventing();
	const mAllLoadedLibraries = new Map();
	const { attachChange, registerThemeManager, getThemePath } = OwnStatics.get(Theming);

	let CORE_VERSION;

	let pAllCssRequests = Promise.resolve();
	let _customCSSAdded = false;
	let _themeCheckedForCustom = null;
	let _sFallbackThemeFromMetadata = null;
	let _sFallbackThemeFromThemeRoot = null;
	let sUi5Version;
	let mAllDistLibraries;

	function isVersionInfoNeeded() {
		const theme = Theming.getTheme();
		return !ThemeHelper.isStandardTheme(theme) && Theming.getThemeRoot(theme);
	}
	// UI5 version is only needed in case a theming service is active but we always add it to the request
	// therefore request it as early as possible
	const versionInfoLoaded = VersionInfo.load().then((oVersionInfo) => {
		sUi5Version = oVersionInfo.version;
		mAllDistLibraries = new Set(oVersionInfo.libraries.map((library) => library.name));
	}, (e) => {
		if (isVersionInfoNeeded()) {
			Log.error("UI5 theming lifecycle requires valid version information when a theming service is active. Please check why the version info could not be loaded in this system.", e, MODULE_NAME);
		}
	});

	/**
	 * The ThemeManager is responsible for managing and applying themes within the application.
	 * It handles the addition and updating of library CSS, including custom CSS if needed. It also
	 * detects and deals with UI5 relevant library CSS added to the DOM for preloading and includes
	 * them into the lifecycle. Additionally, it notifies subscribers after a theme has been applied,
	 * regardless of whether the theme was applied successfully or not.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias sap.ui.core.theming.ThemeManager
	 */
	const ThemeManager = {
		/**
		* Wether theme is already loaded or not
		* @private
		* @ui5-restricted sap.ui.core
		*/
		themeLoaded: true
	};

	/**
	 * Helper functions
	 */

	/**
	 * Retrieves the library info object for theming.
	 *
	 * If the library info object does not exist yet, it will be created and stored.
	 * Otherwise, the existing object is returned.
	 *
	 * @param {object} libInfo - The library info configuration.
	 * @param {string} libInfo.libName - The name of the library.
	 * @param {string} [libInfo.fileName] - Optional file name for the CSS file.
	 * @returns {object} The library info object with theming metadata and helper methods.
	 */
	function getLibraryInfo(libInfo) {
		/**
		 * Creates a new library info object for theming purposes.
		 *
		 * The returned object contains metadata and helper methods for managing the theme CSS of a UI5 library,
		 * including its ID, name, link ID, CSS link element, loading state, and file name.
		 * It also provides a method to generate the correct CSS URL for the library, considering RTL mode,
		 * and versioning.
		 *
		 * If the ID matches the custom CSS ID, the file name and library name are set accordingly.
		 * The link ID and CSS link element are automatically determined.
		 *
		 * @param {object} libInfo - The library info configuration.
		 * @param {string} libInfo.id - The unique ID for the library info object.
		 * @param {string} libInfo.libName - The name of the library.
		 * @param {string} [libInfo.fileName] - Optional file name for the CSS file.
		 * @returns {object} The library info object with theming metadata and helper methods.
		 */
		function createLibraryInfoObject(libInfo) {
			const oLibInfoTemplate = {
				id: "",
				libName: "",
				linkId: "",
				cssLinkElement: null,
				cssLoaded: null,
				failed: false,
				customCss: false,
				fileName: "library",
				themeFallback: false,
				getUrl: function({sTheme = Theming.getTheme(), bAsync = false} = {}) {
					const buildUrl = () => {
						/**
						 * Custom libs which are not part of the DIST layer have no custom theme
						 * except they provide it as part of the library (no themeroots for the custom library)
						 */
						if (mAllDistLibraries && !mAllDistLibraries.has(this.libName) &&
							!ThemeHelper.isStandardTheme(sTheme) && Theming.getThemeRoot(sTheme, this.libName)) {
							sTheme = _sFallbackThemeFromMetadata || _sFallbackThemeFromThemeRoot;
							if (!sTheme) {
								this.failed = true;
								return undefined;
							}
						}
						const sCssBasePath = new URL(getThemePath(this.libName, sTheme), document.baseURI).toString();
						let sCssPath;

						/*
						* Create the library file name.
						* By specifying a library name containing a colon (":") you can specify
						* the file name of the CSS file to include (ignoring RTL).
						*/
						const iIdx = this.libName.indexOf(":");
						if (this.libName && iIdx == -1) {
							sCssPath = `${sCssBasePath}${this.fileName}${Localization.getRTL() ? "-RTL" : ""}.css`;
						} else {
							sCssPath = `${sCssBasePath}${this.libName.substring(iIdx + 1)}.css`;
						}
						// Create a link tag and set the URL as href in order to ensure AppCacheBuster handling.
						// AppCacheBuster ID is added to the href by defineProperty for the "href" property of
						// HTMLLinkElement in AppCacheBuster.js
						// Note: Considered to use AppCacheBuster.js#convertURL for adding the AppCachebuster ID
						//       but there would be a dependency to AppCacheBuster as trade-off
						const oTmpLink = document.createElement("link");
						oTmpLink.href = `${sCssPath}${`?sap-ui-dist-version=${sUi5Version || CORE_VERSION || ""}`}`;
						return oTmpLink.href;
					};
					if (bAsync) {
						return versionInfoLoaded.then(buildUrl);
					} else {
						return buildUrl();
					}
				}
			};

			const newLibInfo = Object.assign(oLibInfoTemplate, libInfo);

			if (newLibInfo.id === CUSTOM_ID) {
				newLibInfo.fileName = "custom";
				newLibInfo.libName = "sap.ui.core";
			}

			newLibInfo.linkId = `${newLibInfo.id === CUSTOM_ID ? "" : THEME_PREFIX}${newLibInfo.id}`;
			newLibInfo.cssLinkElement ??= document.querySelector(`link[id='${newLibInfo.linkId}']`);

			return newLibInfo;
		}

		libInfo.id ??= libInfo.libName;

		if (!mAllLoadedLibraries.has(libInfo.id)) {
			libInfo = createLibraryInfoObject(libInfo);
			mAllLoadedLibraries.set(libInfo.id, libInfo);
		} else {
			libInfo = mAllLoadedLibraries.get(libInfo.id);
		}

		return libInfo;
	}

	/**
	 * Includes a library theme into the current page
	 * @param {string} libraryInfo the library info object
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	function includeLibraryTheme(libraryInfo) {
		const { libName, version } = libraryInfo;
		assert(typeof libName === "string", "libName must be a string");

		if (libName === "sap.ui.core") {
			CORE_VERSION = version;
		}

		if (!mAllLoadedLibraries.has(libName)) {
			const oLibInfo = getLibraryInfo({
				libName
			});

			updateThemeUrl({
				libInfo: oLibInfo,
				suppressFOUC: true
			});

			// if parameters have been used, update them with the new style sheet
			sap.ui.require("sap/ui/core/theming/Parameters")?._addLibraryTheme(oLibInfo.id);
		}
	}

	/**
	 * Adds or updates the CSS link element for the specified library info object and theme.
	 *
	 * If a link element for the library already exists, this function compares the current stylesheet URL
	 * with the new one for the given theme and determines whether an update is necessary.
	 * If the URLs differ, it loads the new stylesheet, manages the loading state, handles FOUC (Flash of Unstyled Content) markers,
	 * and updates the internal state accordingly. The function also triggers theme lifecycle events such as success, failure,
	 * and completion, and manages the global themeLoaded flag.
	 *
	 * Additionally, the function adds the CSS loading promise to the collection of all requested CSS promises,
	 * ensuring that the themeApplied event is fired only after all CSS files have finished loading.
	 *
	 * @param {object} params - Parameters for updating the theme URL.
	 * @param {object} params.libInfo - The library info object containing theming metadata.
	 * @param {string} params.theme - The name of the theme to apply.
	 * @param {boolean} params.suppressFOUC - Whether to suppress Flash of Unstyled Content (FOUC) handling.
	 */
	function updateThemeUrl({libInfo, theme, suppressFOUC}) {
		if (suppressFOUC) {
			pAllCssRequests = Promise.resolve();
			ThemeManager.themeLoaded = false;
			Log.debug(`Register theme change for library ${libInfo.id}`, undefined, MODULE_NAME);
		}
		if (!sUi5Version && isVersionInfoNeeded()) {
			Log.error("[FUTURE FATAL] UI5 theming lifecycle requires valid version information when a theming service is active. Please check why the version info could not be loaded in this system.", undefined, MODULE_NAME);
		}
		// Compare the link including the UI5 version only if it is already available; otherwise, compare the link without the version to prevent unnecessary requests.
		const sOldUrl = sUi5Version ? libInfo.cssLinkElement?.getAttribute("href") : libInfo.cssLinkElement?.getAttribute("href").replace(/\?.*/, "");
		const sUrl = libInfo.getUrl({sTheme: theme});
		if (!sUrl || sOldUrl !== sUrl) {
			libInfo.finishedLoading = false;
			libInfo.failed = false;
			libInfo.cssLoaded ??= Promise.resolve();
			libInfo.cssLoaded.aborted = true;
			if (suppressFOUC) {
				// Only add stylesheet in case there is no existing stylesheet or the href is different
				// use the special FOUC handling for initially existing stylesheets
				// to ensure that they are not just replaced when using the
				// includeStyleSheet API and to be removed later
				fnAddFoucmarker(libInfo.linkId);
			}
			const pCssLoaded = libInfo.getUrl({sTheme: theme, bAsync: true}).then((sUrl) => {
				Log.debug(`Add new CSS for library ${libInfo.id} with URL: ${sUrl}`, undefined, MODULE_NAME);
				// 'sUrl' may be 'undefined' if we need to wait for the fallback theme. In this case,
				// only a link element is added to the DOM to preserve the correct CSS order.
				// This prevents other library themes - which do not require waiting for a fallback -
				// from being added before the fallback theme.
				return includeStylesheet({
					url: sUrl,
					id: libInfo.linkId
				});
			});

			if (libInfo.cssLoaded) {
				libInfo.cssLoaded.aborted = true;
			}

			libInfo.cssLoaded = pCssLoaded.finally(function() {
				if (!libInfo.cssLoaded.aborted) {
					libInfo.finishedLoading = true;
					document.querySelector(`link[data-sap-ui-foucmarker='${libInfo.linkId}']`)?.remove();
					libInfo.cssLinkElement = document.getElementById(`${libInfo.linkId}`);
					Log.debug(`New stylesheet loaded and old stylesheet removed for library: ${libInfo.id}`, undefined, MODULE_NAME);
				}
			}).then(function() {
				if (!libInfo.cssLoaded.aborted) {
					handleThemeSucceeded(libInfo.id);
				}
			}).catch(function() {
				if (!libInfo.cssLoaded.aborted) {
					handleThemeFailed(libInfo.id);
				}
			}).finally(function() {
				if (!libInfo.cssLoaded.aborted) {
					handleThemeFinished(libInfo.id);
					pAllCssRequests = Promise.allSettled([...mAllLoadedLibraries.values()].map((libInfo) => libInfo.cssLoaded));
					pAllCssRequests.finally(function() {
						if (this === pAllCssRequests) {
							Log.debug("Theme change finished", undefined, MODULE_NAME);
							// Even if suppressFOUC is not set, we must fire the event if themeLoaded was previously set to false,
							// because this indicates that at least one theme change was caused by a theming-relevant trigger.
							if (suppressFOUC || !ThemeManager.themeLoaded) {
								ThemeManager.themeLoaded = true;
								oEventing.fireEvent("applied", {
									theme: Theming.getTheme()
								});
							}
						}
					}.bind(pAllCssRequests));
				}
			});
		}
	}

	/**
	 * Updates all existing CSS link elements to reflect the provided theme.
	 *
	 * This function iterates over all loaded library info objects and updates their CSS link elements
	 * to ensure they point to the correct theme resources. It guarantees that all CSS links are up-to-date
	 * with respect to the given theme, RTL mode, SAP UI5 distribution version, and theme roots.
	 *
	 * @param {string} themeName - The name of the theme to apply.
	 * @param {boolean} suppressFOUC - Whether to suppress Flash of Unstyled Content (FOUC) handling.
	 */
	function updateThemeUrls(themeName, suppressFOUC) {
		for (const [, libInfo] of mAllLoadedLibraries) {
			updateThemeUrl({libInfo, themeName, suppressFOUC});
		}
	}

	/**
	 * Handles post-processing after a CSS request for a library has finished loading and was not aborted.
	 *
	 * This function checks if custom CSS needs to be added or updated for the current theme and performs the necessary actions.
	 * It also attempts to derive a fallback theme from the theme root if the requested theme could not be loaded,
	 * and applies the fallback theme for the affected library if available.
	 *
	 * @param {string} libId - The ID of the library whose CSS request has finished.
	 */
	function handleThemeFinished(libId) {
		const sThemeName = Theming.getTheme();
		const oLibThemingInfo = mAllLoadedLibraries.get(libId);
		ThemeHelper.reset();

		if (!_customCSSAdded || _themeCheckedForCustom != sThemeName) {
			if (!ThemeHelper.isStandardTheme(sThemeName) && checkCustom(libId)) {
				const oCustomLibInfo = getLibraryInfo({
					id: CUSTOM_ID
				});
				updateThemeUrl({
					libInfo: oCustomLibInfo,
					suppressFOUC: true
				});
				_customCSSAdded = true;
				_themeCheckedForCustom = sThemeName;
				Log.debug("Delivered custom CSS needs to be loaded, Theme not yet applied", undefined, MODULE_NAME);
			} else if (_customCSSAdded) {
				// remove stylesheet once the particular class is not available (e.g. after theme switch)
				// check for custom theme was not successful, so we need to make sure there are no custom style sheets attached
				document.querySelector(`LINK[id='${CUSTOM_ID}']`)?.remove();
				mAllLoadedLibraries.delete(CUSTOM_ID);
				Log.debug("Custom CSS removed", undefined, MODULE_NAME);
				_customCSSAdded = false;
			}
		}

		// Only retrieve the fallback theme once per ThemeManager cycle
		if (!_sFallbackThemeFromThemeRoot) {
			const sThemeRoot = Theming.getThemeRoot(sThemeName, libId);
			if (sThemeRoot) {
				const rBaseTheme = /~v=[^\/]+\(([a-zA-Z0-9_]+)\)/;
				// base theme should be matched in the first capturing group
				_sFallbackThemeFromThemeRoot = rBaseTheme.exec(sThemeRoot)?.[1];

				// pass derived fallback theme through our default theme handling
				// in case the fallback theme is not supported anymore, we fall up to the latest default theme
				if (_sFallbackThemeFromThemeRoot) {
					_sFallbackThemeFromThemeRoot = ThemeHelper.validateAndFallbackTheme(_sFallbackThemeFromThemeRoot);
				}
			}
		}

		const sFallbackTheme = _sFallbackThemeFromMetadata || _sFallbackThemeFromThemeRoot;
		if (sFallbackTheme) {
			for (const [sLibId, oLib] of mAllLoadedLibraries) {
				if (oLib.failed) {
					Log.warning(`Custom theme '${sThemeName}' could not be loaded for library '${sLibId}'. Falling back to its base theme '${sFallbackTheme}'.`, undefined, MODULE_NAME);

					// Change the URL to load the fallback theme
					updateThemeUrl({
						libInfo: oLib,
						theme: sFallbackTheme,
						suppressFOUC: true
					});

					// remember the lib to prevent doing the fallback multiple times
					// (if the fallback also can't be loaded)
					oLibThemingInfo.themeFallback = true;
				}
			}
		}
	}

	/**
	 * Handles post-processing after a CSS request for a library has successfully finished loading and was not aborted.
	 *
	 * This function attempts to derive a fallback theme from the theme metadata if the requested theme could not be loaded.
	 * The fallback theme is determined from the "Extends" property in the theme metadata.
	 *
	 * @param {string} libId - The ID of the library whose CSS request has successfully finished.
	 */
	function handleThemeSucceeded(libId) {
		if (!_sFallbackThemeFromMetadata) {
			const oThemeMetaData = ThemeHelper.getMetadata(libId);
			if (oThemeMetaData && oThemeMetaData.Extends && oThemeMetaData.Extends[0]) {
				_sFallbackThemeFromMetadata = oThemeMetaData.Extends[0];
			}
		}
	}

	/**
	 * Handles post-processing after a CSS request for a library has failed and was not aborted.
	 *
	 * This function detects whether the fallback theme should be requested for the library,
	 * based on the current theme and the loading state of the CSS link element.
	 *
	 * @param {string} libId - The ID of the library whose CSS request has failed.
	 */
	function handleThemeFailed(libId) {
		const oLibThemingInfo = getLibraryInfo({id: libId});
		oLibThemingInfo.cssLinkElement = document.getElementById(`${THEME_PREFIX}${libId}`);
		// Collect all libs that failed to load and no fallback has been applied, yet.
		// The fallback relies on custom theme metadata, so it is not done for standard themes
		if (!ThemeHelper.isStandardTheme(Theming.getTheme()) && !oLibThemingInfo.themeFallback) {
			// Check for error marker (data-sap-ui-ready=false) and that there are no rules
			// to be sure the stylesheet couldn't be loaded at all.
			// E.g. in case an @import within the stylesheet fails, the error marker will
			// also be set, but in this case no fallback should be done as there is a (broken) theme
			if (oLibThemingInfo.cssLinkElement && !(oLibThemingInfo.cssLinkElement.sheet && hasSheetCssRules(oLibThemingInfo.cssLinkElement.sheet))) {
				oLibThemingInfo.failed = true;
			}
		}
	}

	/**
	 * checks if a particular class is available
	 *
	 * @param {string} lib The library name
	 * @returns {boolean} Wether lib has custom css or not
	 */
	function checkCustom(lib) {

		const cssFile = window.document.getElementById(`${THEME_PREFIX}${lib}`);

		if (!cssFile) {
			return false;
		}

		/*
		Check if custom.css indication rule is applied to <link> element
		The rule looks like this:

			link[id^="sap-ui-theme-"]::after

		Selector is to apply it to the <link> elements.
		*/
		const style = window.getComputedStyle(cssFile, ':after');
		let content = style ? style.getPropertyValue('content') : null;

		if (content && content !== "none") {
			try {

				// Strip surrounding quotes (single or double depending on browser)
				if (content[0] === "'" || content[0] === '"') {
					content = content.substring(1, content.length - 1);
				}

				// Cast to boolean (returns true if string equals "true", otherwise false)
				return content === "true";

			} catch (e) {
				throw new Error("Custom check: Error parsing JSON string for custom.css indication.", {
					cause: e
				});
			}
		}

		//***********************************
		// Fallback legacy customcss check
		//***********************************

		/*
		 * checks if a particular class is available at the beginning of the stylesheet
		*/

		const aRules = cssFile.sheet ? safeAccessSheetCssRules(cssFile.sheet) : null;

		if (!aRules || aRules.length === 0) {
			Log.warning(`Custom check: Failed retrieving a CSS rule from stylesheet ${lib}`, undefined, MODULE_NAME);
			return false;
		}

		// we should now have some rule name ==> try to match against custom check
		for (let i = 0; (i < 2 && i < aRules.length) ; i++) {
			if (CUSTOM_CSS_CHECK.test(aRules[i].selectorText)) {
				return true;
			}
		}

		return false;
	}

	// helper to add the FOUC marker to the CSS for the given id
	function fnAddFoucmarker(sLinkId) {
		const oLink = document.getElementById(sLinkId);
		if (oLink) {
			oLink.dataset.sapUiFoucmarker = sLinkId;
		}
	}

	/**
	 * Applies the theme with the given name (by loading the respective style sheets, which does not disrupt the application).
	 *
	 * By default, the theme files are expected to be located at path relative to the respective control library ([libraryLocation]/themes/[themeName]).
	 *
	 * Different locations can be configured by using the method setThemePath().
	 * sThemeBaseUrl is a single URL to specify the default location of all theme files. This URL is the base folder below which the control library folders
	 * are located. E.g. if the CSS files are not located relative to the root location of UI5, but instead they are at locations like
	 *    http://my.server/myapp/resources/sap/ui/core/themes/my_theme/library.css
	 * then the URL that needs to be given is:
	 *    http://my.server/myapp/resources
	 * All theme resources are then loaded from below this folder - except if for a certain library a different location has been registered.
	 *
	 * If the theme resources are not all either below this base location or  with their respective libraries, then setThemePath must be
	 * used to configure individual locations.
	 * @param {object} oTheme Theme object containing the old and the new theme
	 * @param {string} oTheme.new Name of the new theme
	 * @param {string} oTheme.old Name of the previous theme
	 */
	function applyTheme(oTheme) {
		const html = document.documentElement;
		const sTheme = oTheme.new;

		for (const [, oLibInfo] of mAllLoadedLibraries) {
			delete oLibInfo.themeFallback;
		}
		_sFallbackThemeFromMetadata = _sFallbackThemeFromThemeRoot = null;

		Log.debug(`ThemeManager: Theme changed from ${oTheme.old} to ${sTheme}`, undefined, MODULE_NAME);
		updateThemeUrls(sTheme, /* bSuppressFOUC */ true);

		// modify the <html> tag's CSS class with the theme name
		html.classList.remove(`sapUiTheme-${oTheme.old}`);
		html.classList.add(`sapUiTheme-${sTheme}`);
	}

	// Collect all UI5 relevant CSS files which have been added upfront
	// and add them to UI5 theming lifecycle
	document.querySelectorAll(`link[id^=${THEME_PREFIX}]`).forEach(function(cssLinkElement) {
		let bPreloadedCssReady = true;
		const sLinkId = cssLinkElement.getAttribute("id");
		const [,libName] = sLinkId.match(LINK_ID_CHECK);
		const oLibInfo = getLibraryInfo({
			libName,
			linkId: sLinkId
		});

		Log.info(`Preloaded CSS for library ${libName})} detected: ${cssLinkElement.href}`, undefined, MODULE_NAME);

		const { promise: cssLoaded, resolve, reject} = Promise.withResolvers();
		const handleDataSapUiReady = function(bError) {
			oLibInfo.finishedLoading = true;
			if (bError) {
				reject();
			} else {
				resolve();
			}
		};

		try {
			bPreloadedCssReady = !!(cssLinkElement.sheet?.href === cssLinkElement.href && cssLinkElement.sheet?.cssRules);
			if (!bPreloadedCssReady) {
				ThemeManager.themeLoaded = bPreloadedCssReady;
				cssLinkElement.addEventListener("load", (oEvent) => {
					handleDataSapUiReady(oEvent.type === "error");
				});
			} else {
				handleDataSapUiReady(!(cssLinkElement.sheet.cssRules.length > 0));
			}
			oLibInfo.cssLoaded = cssLoaded;
		} catch (e) {
			// If the stylesheet is cross-origin and throws a security error, we can't verify directly
			Log.info("Could not detect ready state of preloaded CSS. Request stylesheet again to verify the response status", undefined, MODULE_NAME);

			ThemeManager.themeLoaded = false;

			updateThemeUrl({
				libInfo: oLibInfo,
				suppressFOUC: true
			});
		}
	});

	function safeAccessSheetCssRules(sheet) {
		try {
			return sheet.cssRules;
		} catch (e) {
			// Firefox throws a SecurityError or InvalidAccessError if "sheet.cssRules"
			// is accessed on a stylesheet with 404 response code.
			// Most browsers also throw when accessing from a different origin (CORS).
			return null;
		}
	}

	function hasSheetCssRules(sheet) {
		const aCssRules = safeAccessSheetCssRules(sheet);
		return !!aCssRules && aCssRules.length > 0;
	}

	// set CSS class for the theme name
	document.documentElement.classList.add("sapUiTheme-" + Theming.getTheme());
	Log.info(`Declared theme ${Theming.getTheme()}`, undefined, MODULE_NAME);

	attachChange(function(oEvent) {
		var mThemeRoots = oEvent.themeRoots;
		var oTheme = oEvent.theme;
		var oLib = oEvent.library;
		if (mThemeRoots && mThemeRoots.forceUpdate) {
			updateThemeUrls(Theming.getTheme());
		}
		if (oTheme) {
			applyTheme(oTheme);
		}
		if (oLib) {
			includeLibraryTheme(oLib);
		}
	});

	// handle RTL changes
	Localization.attachChange(function(oEvent){
		const bRTL = oEvent.rtl;
		if (bRTL !== undefined) {
			updateThemeUrls(Theming.getTheme());
		}
	});

	registerThemeManager(ThemeManager, (fireApplied) => {
		oEventing.attachEvent("applied", fireApplied);
	});

	OwnStatics.set(ThemeManager, {
		/**
		 * Returns libraryInfoObject
		 *
		 * @param {string} libInfoId The ID of the libraryInfo object
		 * @returns {Map<string, object>|object|undefined} A map with all available libraryInfoObjects, a specific libraryInfoObject
		 *                                                 or undefined in case a specific libraryInfoObject was requested but does not exists
		 * @private
		 * @ui5-restricted sap.ui.core.theming.Parameters
		 */
		getAllLibraryInfoObjects: (libInfoId) => {
			if (libInfoId) {
				return mAllLoadedLibraries.get(libInfoId);
			}
			const mAllInfoObjects = new Map(mAllLoadedLibraries);
			mAllInfoObjects.delete(CUSTOM_ID);
			return mAllInfoObjects;
		}
	});

	return ThemeManager;
});
