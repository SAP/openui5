/*!
 * ${copyright}
 */

// Provides the real core class sap.ui.core.Core of SAPUI5
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/ui/Global',
		'sap/ui/base/BindingParser', 'sap/ui/base/DataType', 'sap/ui/base/EventProvider', 'sap/ui/base/Interface', 'sap/ui/base/Object', 'sap/ui/base/ManagedObject',
		'./Component', './Configuration', './Control', './Element', './ElementMetadata', './FocusHandler',
		'./RenderManager', './ResizeHandler', './ThemeCheck', './UIArea', './message/MessageManager',
		'jquery.sap.act', 'jquery.sap.dom', 'jquery.sap.events', 'jquery.sap.mobile', 'jquery.sap.properties', 'jquery.sap.resources', 'jquery.sap.script', 'jquery.sap.sjax'],
	function(jQuery, Device, Global,
		BindingParser, DataType, EventProvider, Interface, BaseObject, ManagedObject,
		Component, Configuration, Control, Element, ElementMetadata, FocusHandler,
		RenderManager, ResizeHandler, ThemeCheck, UIArea, MessageManager
		/* , jQuerySapAct, jQuerySapDom, jQuerySapEvents, jQuerySapMobile, jQuerySapProperties, jQuerySapResources, jQuerySapScript, jQuerySapSjax */) {

	"use strict";

	/*global Promise */

	function lazyInstanceof(o, sModule) {
		var FNClass = sap.ui.require(sModule);
		return typeof FNClass === 'function' && (o instanceof FNClass);
	}

	// share the rendering log with the UIArea
	var oRenderLog = UIArea._oRenderLog;

	/**
	 * Set of libraries that have been loaded and initialized already.
	 * This is maintained separately from Core.mLibraries to protect it against
	 * modification from the outside (objects in mLibraries are currently exposed
	 * by getLoadedLibraries())
	 */
	var mLoadedLibraries = {};

	/**
	 * Bookkeeping for the preloading of libraries.
	 *
	 * Might contain an object for each library (keyed by the library name).
	 * While the preload is pending for a library, the object has a property preload = true.
	 * In any case, the object contains a promise that fulfills / rejects when the preload
	 * fulfills / rejects.
	 * @private
	 */
	var mLibraryPreloadBundles = {};

	/**
	 * EventProvider instance, EventProvider is no longer extended
	 * @private
	 */
	var _oEventProvider;

	/**
	 * @class Core Class of the SAP UI Library.
	 *
	 * This class boots the Core framework and makes it available for the application
	 * via method <code>sap.ui.getCore()</code>.
	 *
	 * Example:
	 * <pre>
	 *
	 *   var oCore = sap.ui.getCore();
	 *
	 * </pre>
	 *
	 * With methods of the Core framework you can {@link #attachInit execute code} after the framework has been initialized.
	 * It provides access to the {@link #getConfiguration configuration} and exposes events that
	 * an application or a control can register to (e.g. {@link #event:localizationChanged localizationChanged},
	 * {@link #event:parseError parseError}, {@link #event:validationError validationError},
	 * {@link #event:formatError formatError}, {@link #event:validationSuccess validationSuccess}).
	 *
	 * Example:
	 * <pre>
	 *
	 *   oCore.attachInit(function() {
	 *     if ( oCore.getConfiguration().getRTL() ) {
	 *       ...
	 *     }
	 *   });
	 *
	 *   oCore.attachLocalizationChanged(function(oEvent) {
	 *     ...
	 *   });
	 *
	 * </pre>
	 *
	 * @extends sap.ui.base.Object
	 * @final
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @alias sap.ui.core.Core
	 * @public
	 */
	var Core = BaseObject.extend("sap.ui.core.Core", /** @lends sap.ui.core.Core.prototype */ {
		constructor : function() {

			//make this class only available once
			if (sap.ui.getCore && sap.ui.getCore()) {
				return sap.ui.getCore();
			}

			var that = this,
				log = jQuery.sap.log,
				METHOD = "sap.ui.core.Core";

			BaseObject.call(this);

			_oEventProvider = new EventProvider();

			// Generate all functions from EventProvider for backward compatibility
			["attachEvent", "detachEvent", "getEventingParent"].forEach(function(sFuncName) {
				Core.prototype[sFuncName] = _oEventProvider[sFuncName].bind(_oEventProvider);
			});

			/**
			 * Whether the core has been booted
			 * @private
			 */
			this.bBooted = false;

			/**
			 * Whether the core has been initialized
			 * @private
			 */
			this.bInitialized = false;

			/**
			 * Whether the dom is ready (document.ready)
			 * @private
			 */
			this.bDomReady = false;

			/**
			 * Available plugins in the order of registration.
			 * @private
			 */
			this.aPlugins = [];

			/**
			 * Collection of loaded or adhoc created libraries, keyed by their name.
			 * @private
			 */
			this.mLibraries = {};

			/**
			 * Already loaded resource bundles keyed by library and locale.
			 * @private
			 * @see sap.ui.core.Core.getLibraryResourceBundle
			 */
			this.mResourceBundles = {};

			/**
			 * Currently created UIAreas keyed by their id.
			 * @private
			 * @todo FIXME how can a UI area ever be removed?
			 */
			this.mUIAreas = {};

			/**
			 * Default model used for databinding
			 * @private
			 */
			this.oModels = {};

			/**
			 * The event bus (initialized lazily)
			 * @private
			 */
			this.oEventBus = null;

			/**
			 * Map of of created Elements keyed by their id.
			 *
			 * Each element registers itself in its constructor and deregisters itself in its
			 * destroy method.
			 *
			 * @private
			 * @todo get rid of this collection as it represents a candidate for memory leaks
			 */
			this.mElements = {};

			/**
			 * Map of of created objects structured by their type which contains a map
			 * containing the created objects keyed by their type.
			 *
			 * Each object registers itself in its constructor and deregisters itself in its
			 * destroy method.
			 *
			 * @private
			 * @todo get rid of this collection as it represents a candidate for memory leaks
			 */
			this.mObjects = {
				"component": {},
				"template": {}
			};

			/**
			 * The instance of the root component (defined in the configuration {@link sap.ui.core.Configuration#getRootComponent})
			 * @private
			 */
			this.oRootComponent = null;

			/**
			 * Ordered collection of initEvent listeners
			 * Moved here (before boot()) so that the libraries can be registered for lazy load!!
			 * @private
			 */
			this.aInitListeners = [];

			/**
			 * Whether the legacy library has to be loaded.
			 * @private
			 */
			this.bInitLegacyLib = false;

			/**
			 * The ID of a timer that will execute the next rendering.
			 *
			 * A non-falsy value indicates that a timer exists already, or at least that no
			 * new timer needs to be created as. During the boot phase, this member is set
			 * to the special value <code>this</code> which is non-falsy and which should never
			 * represent a valid timer ID (no chance of misinterpretation).
			 */
			this._sRerenderTimer = this;

			/**
			 * Tasks that are called just before the rendering starts.
			 * @private
			 */
			this.aPrerenderingTasks = [];

			log.info("Creating Core",null,METHOD);

			jQuery.sap.measure.start("coreComplete", "Core.js - complete");
			jQuery.sap.measure.start("coreBoot", "Core.js - boot");
			jQuery.sap.measure.start("coreInit", "Core.js - init");

			/**
			 * Object holding the interpreted configuration
			 * Initialized from the global "sap-ui-config" object and from Url parameters
			 * @private
			 */
			this.oConfiguration = new Configuration(this);

			// initialize frameOptions script (anti-clickjacking, etc.)
			var oFrameOptionsConfig = this.oConfiguration["frameOptionsConfig"] || {};
			oFrameOptionsConfig.mode = this.oConfiguration.getFrameOptions();
			oFrameOptionsConfig.whitelistService = this.oConfiguration.getWhitelistService();
			this.oFrameOptions = new jQuery.sap.FrameOptions(oFrameOptionsConfig);

			// enable complex bindings if configured
			if ( this.oConfiguration["bindingSyntax"] === "complex" ) {
				ManagedObject.bindingParser = BindingParser.complexParser;
			}
			// switch bindingParser to designTime mode if configured
			if (this.oConfiguration["xx-designMode"] == true ) {
				BindingParser._keepBindingStrings = true;
			}

			// let Element and Component get friend access to the respective register/deregister methods
			this._grantFriendAccess();

			// handle modules
			var aModules = this.oConfiguration.modules;
			if ( this.oConfiguration.getDebug() ) {
				// add debug module if configured
				aModules.unshift("sap.ui.debug.DebugEnv");
			}
			// enforce the core library as the first loaded module
			var i = aModules.indexOf("sap.ui.core.library");
			if ( i != 0 ) {
				if ( i > 0 ) {
					aModules.splice(i,1);
				}
				aModules.unshift("sap.ui.core.library");
			}

			// enable LessSupport if specified in configuration
			if (this.oConfiguration["xx-lesssupport"] && aModules.indexOf("sap.ui.core.plugin.LessSupport") == -1) {
				log.info("Including LessSupport into declared modules");
				aModules.push("sap.ui.core.plugin.LessSupport");
			}

			// determine preload mode (e.g. resolve default or auto)
			var sPreloadMode = this.oConfiguration.preload;
			// if debug sources are requested, then the preload feature must be deactivated
			if ( window["sap-ui-debug"] === true ) {
				sPreloadMode = "";
			}
			// when the preload mode is 'auto', it will be set to 'sync' for optimized sources
			if ( sPreloadMode === "auto" ) {
				sPreloadMode = (window["sap-ui-optimized"] && !this.oConfiguration['xx-loadAllMode']) ? "sync" : "";
			}
			// write back the determined mode for later evaluation (e.g. loadLibrary)
			this.oConfiguration.preload = sPreloadMode;

			var bAsync = sPreloadMode === "async";

			// evaluate configuration for library preload file types
			this.oConfiguration['xx-libraryPreloadFiles'].forEach(function(v){
				var fields = String(v).trim().split(/\s*:\s*/),
					name = fields[0],
					fileType = fields[1];
				if ( fields.length === 1 ) {
					fileType = name;
					name = '';
				}
				if ( /^(?:none|js|json|both)$/.test(fileType) ) {
					mLibraryPreloadFileTypes[name] = fileType;
				}
			});

			log.info("Declared modules: " + aModules, METHOD);

			this._setupThemes();

			this._setupContentDirection();

			var $html = jQuery("html");

			this._setupBrowser($html);

			this._setupOS($html);

			this._setupLang($html);

			this._setupAnimation($html);

			// create accessor to the Core API early so that initLibrary and others can use it
			/**
			 * Retrieve the {@link sap.ui.core.Core SAPUI5 Core} instance for the current window.
			 * @returns {sap.ui.core.Core} the API of the current SAPUI5 Core instance.
			 * @public
			 * @function
			 */
			sap.ui.getCore = jQuery.sap.getter(this.getInterface());

			// create the RenderManager so it can be used already
			this.oRenderManager = new RenderManager();

			// sync point 1 synchronizes document ready and rest of UI5 boot
			var oSyncPoint1 = jQuery.sap.syncPoint("UI5 Document Ready", function(iOpenTasks, iFailures) {
				that.bDomReady = true;
				that.init();
			});
			var iDocumentReadyTask = oSyncPoint1.startTask("document.ready");
			var iCoreBootTask = oSyncPoint1.startTask("preload and boot");

			// task 1 is to wait for document.ready
			jQuery(function() {
				log.trace("document is ready");
				oSyncPoint1.finishTask(iDocumentReadyTask);
			});

			// sync point 2 synchronizes all library preloads and the end of the bootstrap script
			var oSyncPoint2 = jQuery.sap.syncPoint("UI5 Core Preloads and Bootstrap Script", function(iOpenTasks, iFailures) {
				log.trace("Core loaded: open=" + iOpenTasks + ", failures=" + iFailures);
				that._boot(bAsync, function() {
					oSyncPoint1.finishTask(iCoreBootTask);
					jQuery.sap.measure.end("coreBoot");
				});
			});

			// a helper task to prevent the premature completion of oSyncPoint2
			var iCreateTasksTask = oSyncPoint2.startTask("create sp2 tasks task");

			// load the version info file in case of a custom theme to determine
			// the distribution version which should be provided in library.css requests.
			if (this.oConfiguration["versionedLibCss"]) {
				var iVersionInfoTask = oSyncPoint2.startTask("load version info");

				var fnCallback = function(oVersionInfo) {
					if (oVersionInfo) {
						log.trace("Loaded \"sap-ui-version.json\".");
					} else {
						log.error("Could not load \"sap-ui-version.json\".");
					}
					oSyncPoint2.finishTask(iVersionInfoTask);
				};

				// only use async mode if library preload is async
				var vReturn = sap.ui.getVersionInfo({ async: bAsync, failOnError: false });
				if (vReturn instanceof Promise) {
					vReturn.then(fnCallback, function(oError) {
						// this should only happen when there is a script error as "failOnError=false"
						// prevents throwing a loading error (e.g. HTTP 404)
						log.error("Unexpected error when loading \"sap-ui-version.json\": " + oError);
						oSyncPoint2.finishTask(iVersionInfoTask);
					});
				} else {
					fnCallback(vReturn);
				}
			}

			// when a boot task is configured, add it to syncpoint2
			var fnCustomBootTask = this.oConfiguration["xx-bootTask"];
			if ( fnCustomBootTask ) {
				var iCustomBootTask = oSyncPoint2.startTask("custom boot task");
				fnCustomBootTask( function(bSuccess) {
					oSyncPoint2.finishTask(iCustomBootTask, typeof bSuccess === "undefined" || bSuccess === true );
				});
			}

			this._polyfillFlexbox();

			// when the bootstrap script has finished, it calls sap.ui.getCore().boot()
			var iBootstrapScriptTask = oSyncPoint2.startTask("bootstrap script");
			this.boot = function() {
				if (this.bBooted) {
					return;
				}
				this.bBooted = true;
				oSyncPoint2.finishTask(iBootstrapScriptTask);
			};

			if ( sPreloadMode === "sync" || sPreloadMode === "async" ) {
				// determine set of libraries
				var aLibs = aModules.reduce(function(aResult, sModule) {
					var iPos = sModule.search(/\.library$/);
					if ( iPos >= 0 ) {
						aResult.push(sModule.slice(0, iPos));
					}
					return aResult;
				}, []);

				var preloaded = this.loadLibraries(aLibs, {
					async: bAsync,
					preloadOnly: true
				});
				if ( bAsync ) {
					var iPreloadLibrariesTask = oSyncPoint2.startTask("preload bootstrap libraries");
					preloaded.then(function() {
						oSyncPoint2.finishTask(iPreloadLibrariesTask);
					}, function() {
						oSyncPoint2.finishTask(iPreloadLibrariesTask, false);
					});
				}
			}

			// initializes the application cachebuster mechanism if configured
			var aACBConfig = this.oConfiguration.getAppCacheBuster();
			if (aACBConfig && aACBConfig.length > 0) {
				var AppCacheBuster = sap.ui.requireSync('sap/ui/core/AppCacheBuster');
				AppCacheBuster.boot(oSyncPoint2);
			}

			// Initialize support info stack
			if (this.oConfiguration.getSupportMode() !== null) {
				var iSupportInfoTask = oSyncPoint2.startTask("support info script");

				var fnCallbackBootstrap = function(Bootstrap) {
					Bootstrap.initSupportRules(that.oConfiguration.getSupportMode());

					oSyncPoint2.finishTask(iSupportInfoTask);
				};

				var fnCallbackSupportInfo = function(Support) {
					Support.initializeSupportMode(that.oConfiguration.getSupportMode(), bAsync);

					if (bAsync) {
						sap.ui.require(["sap/ui/support/Bootstrap"], fnCallbackBootstrap);
					} else {
						fnCallbackBootstrap(sap.ui.requireSync("sap/ui/support/Bootstrap"));
					}
				};

				if (bAsync) {
					sap.ui.require(["sap/ui/core/support/Support"], fnCallbackSupportInfo);
				} else {
					fnCallbackSupportInfo(sap.ui.requireSync("sap/ui/core/support/Support"));
				}
			}

			oSyncPoint2.finishTask(iCreateTasksTask);
		},

		metadata : {
			publicMethods: ["boot", "isInitialized","isThemeApplied","attachInitEvent","attachInit","getRenderManager","createRenderManager",
							 "getConfiguration", "setRoot", "createUIArea", "getUIArea", "getUIDirty", "getElementById",
							 "getCurrentFocusedControlId", "getControl", "getComponent", "getTemplate", "lock", "unlock","isLocked",
							 "attachEvent","detachEvent","applyChanges", "getEventBus",
							 "applyTheme","setThemeRoot","attachThemeChanged","detachThemeChanged","getStaticAreaRef",
							 "attachThemeScopingChanged","detachThemeScopingChanged","fireThemeScopingChanged",
							 "registerPlugin","unregisterPlugin","getLibraryResourceBundle", "byId",
							 "getLoadedLibraries", "loadLibrary", "loadLibraries", "initLibrary",
							 "includeLibraryTheme", "setModel", "getModel", "hasModel", "isMobile",
							 "attachControlEvent", "detachControlEvent", "attachIntervalTimer", "detachIntervalTimer",
							 "attachParseError", "detachParseError", "fireParseError",
							 "attachValidationError", "detachValidationError", "fireValidationError",
							 "attachFormatError", "detachFormatError", "fireFormatError",
							 "attachValidationSuccess", "detachValidationSuccess", "fireValidationSuccess",
							 "attachLocalizationChanged", "detachLocalizationChanged",
							 "attachLibraryChanged", "detachLibraryChanged",
							 "isStaticAreaRef", "createComponent", "getRootComponent", "getApplication",
							 "setMessageManager", "getMessageManager","byFieldGroupId",
							 "addPrerenderingTask"]
		}

	});

	/**
	 * Map of event names and ids, that are provided by this class
	 * @private
	 */
	Core.M_EVENTS = {ControlEvent: "ControlEvent", UIUpdated: "UIUpdated", ThemeChanged: "ThemeChanged", ThemeScopingChanged: "themeScopingChanged", LocalizationChanged: "localizationChanged",
			LibraryChanged : "libraryChanged",
			ValidationError : "validationError", ParseError : "parseError", FormatError : "formatError", ValidationSuccess : "validationSuccess"};


	// Id of the static UIArea
	var STATIC_UIAREA_ID = "sap-ui-static";

	/**
	 * The core allows some friend components to register/deregister themselves
	 * @private
	 */
	Core.prototype._grantFriendAccess = function() {
		var that = this;

		// grant ElementMetadata "friend" access to Core for registration
		ElementMetadata.prototype.register = function(oMetadata) {
			that.registerElementClass(oMetadata);
		};
		// grant Element "friend" access to Core for (de-)registration
		Element.prototype.register = function() {
			that.registerElement(this);
		};
		Element.prototype.deregister = function() {
			that.deregisterElement(this);
		};

		// grant Element "friend" access to Core / FocusHandler to update the given elements focus info
		Element._updateFocusInfo = function(oElement) {
			if (that.oFocusHandler) {
				that.oFocusHandler.updateControlFocusInfo(oElement);
			}
		};

		// grant Component "friend" access to Core for (de-)registration
		Component.prototype.register = function() {
			that.registerObject(this);
		};
		Component.prototype.deregister = function() {
			var sComponentId = this.sId;
			for (var sElementId in that.mElements) {
				var oElement = that.mElements[sElementId];
				if ( oElement._sapui_candidateForDestroy && oElement._sOwnerId === sComponentId && !oElement.getParent() ) {
					jQuery.sap.log.debug("destroying dangling template " + oElement + " when destroying the owner component");
					oElement.destroy();
				}
			}
			that.deregisterObject(this);
		};

	};

	/**
	 * Initializes the window "sap-ui-config" property, sets theme roots, initializes sTheme, sets theme css classes
	 * @private
	 */
	Core.prototype._setupThemes = function() {
		var log = jQuery.sap.log,
			METHOD = "sap.ui.core.Core";

		var oCfgData = window["sap-ui-config"];
		// Configuration might have a themeRoot, if so integrate it in themeroots
		if ( this.oConfiguration.themeRoot ) {
			oCfgData = oCfgData || {};
			oCfgData.themeroots = oCfgData.themeroots || {};
			oCfgData.themeroots[this.oConfiguration.getTheme()] = this.oConfiguration.themeRoot;
		}
		if (oCfgData) {
			// read themeRoots configuration
			if (oCfgData.themeroots) {
				for (var themeName in oCfgData.themeroots) {
					var themeRoot = oCfgData.themeroots[themeName];
					if (typeof themeRoot === "string") {
						this.setThemeRoot(themeName, themeRoot);
					} else {
						for (var lib in themeRoot) {
							if (lib.length > 0) {
								this.setThemeRoot(themeName, [lib], themeRoot[lib]);
							} else {
								this.setThemeRoot(themeName, themeRoot[lib]);
							}
						}
					}
				}
			}
		}

		// set CSS class for the theme name
		this.sTheme = this.oConfiguration.getTheme();
		jQuery(document.documentElement).addClass("sapUiTheme-" + this.sTheme);
		log.info("Declared theme " + this.sTheme,null,METHOD);
	};

	/**
	 * Set the document's dir property
	 * @private
	 */
	Core.prototype._setupContentDirection = function() {
		var log = jQuery.sap.log,
			METHOD = "sap.ui.core.Core",
			sDir = this.oConfiguration.getRTL() ? "rtl" : "ltr";

		jQuery(document.documentElement).attr("dir", sDir); // webkit does not allow setting document.dir before the body exists
		log.info("Content direction set to '" + sDir + "'",null,METHOD);
	};

	/**
	 * Set the body's browser-related attributes and and jQuery.browser properties
	 * @param $html - jQuery wrapped html object
	 * @private
	 */
	Core.prototype._setupBrowser = function($html) {
		var log = jQuery.sap.log,
			METHOD = "sap.ui.core.Core";

		//set the browser for css attribute selectors. do not move this to the onload function because sf and ie do not
		//use the classes
		$html = $html || jQuery("html");

		var b = Device.browser;
		var id = b.name;

		if (id === b.BROWSER.CHROME) {
			jQuery.browser.safari = false;
			jQuery.browser.chrome = true;
		} else if (id === b.BROWSER.SAFARI) {
			jQuery.browser.safari = true;
			jQuery.browser.chrome = false;
			if (b.mobile) {
				id = "m" + id;
			}
		}

		if (id) {
			jQuery.browser.fVersion = b.version;
			jQuery.browser.mobile = b.mobile;

			id = id + (b.version === -1 ? "" : Math.floor(b.version));
			$html.attr("data-sap-ui-browser", id);
			log.debug("Browser-Id: " + id, null, METHOD);
		}
	};

	/**
	 * Set the body's OS-related attribute and css class
	 * @param $html - jQuery wrapped html object
	 * @private
	 */
	Core.prototype._setupOS = function($html) {
		$html = $html || jQuery("html");

		$html.attr("data-sap-ui-os", Device.os.name + Device.os.versionStr);
		var osCSS = null;
		switch (Device.os.name) {
			case Device.os.OS.IOS:
				osCSS = "sap-ios";
				break;
			case Device.os.OS.ANDROID:
				osCSS = "sap-android";
				break;
			case Device.os.OS.BLACKBERRY:
				osCSS = "sap-bb";
				break;
			case Device.os.OS.WINDOWS_PHONE:
				osCSS = "sap-winphone";
				break;
		}
		if (osCSS) {
			$html.addClass(osCSS);
		}
	};

	/**
	 * Set the body's lang attribute and attach the localization change event
	 * @param $html - jQuery wrapped html object
	 * @private
	 */
	Core.prototype._setupLang = function($html) {
		$html = $html || jQuery("html");

		// append the lang info to the document (required for ARIA support)
		var fnUpdateLangAttr = function() {
			var oLocale = this.oConfiguration.getLocale();
			if (oLocale) {
				$html.attr("lang", oLocale.toString());
			} else {
				$html.removeAttr("lang");
			}
		};
		fnUpdateLangAttr.call(this);

		// listen to localization change event to update the lang info
		this.attachLocalizationChanged(fnUpdateLangAttr, this);
	};

	/**
	 * Set the body's Animation-related attribute and configures jQuery accordingly.
	 * @param $html - jQuery wrapped html object
	 * @private
	 */
	Core.prototype._setupAnimation = function($html) {
		$html = $html || jQuery("html");

		var bAnimation = this.oConfiguration.getAnimation();
		$html.attr("data-sap-ui-animation", bAnimation ? "on" : "off");
		jQuery.fx.off = !bAnimation;
	};

	/**
	 * Initializes the jQuery.support.useFlexBoxPolyfill property
	 * @private
	 */
	Core.prototype._polyfillFlexbox = function() {
		/**
		 * Whether the current browser needs a polyfill as a fallback for flex box support
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.useFlexBoxPolyfill
		 * @since 1.12.0
		 * @deprecated since version 1.16.0
		 *
		 * For backwards compatibility we can't remove the deprecated flexbox polyfill.
		 * However, if the compatibility version is 1.16 or higher then the polyfill
		 * should not be used.
		 */
		var useFlexBoxPolyfillCompatVersion = new jQuery.sap.Version(this.oConfiguration.getCompatibilityVersion("flexBoxPolyfill"));

		// Always false if version is >= 1.16
		if (useFlexBoxPolyfillCompatVersion.compareTo("1.16") >= 0) {
			jQuery.support.useFlexBoxPolyfill = false;
		} else if (!jQuery.support.flexBoxLayout && !jQuery.support.newFlexBoxLayout && !jQuery.support.ie10FlexBoxLayout) {
			jQuery.support.useFlexBoxPolyfill = true;
		} else {
			jQuery.support.useFlexBoxPolyfill = false;
		}
	};

	/**
	 * Boots the core and injects the necessary css and js files for the library.
	 * Applications shouldn't call this method. It is automatically called by the bootstrap scripts (e.g. sap-ui-core.js)
	 *
	 * @private
	 */
	Core.prototype._boot = function(bAsync, fnCallback) {

		// if a list of preloaded library CSS is configured, request a merged CSS (if application did not already do it)
		var aCSSLibs = this.oConfiguration['preloadLibCss'];
		if (aCSSLibs && aCSSLibs.length > 0 && !aCSSLibs.appManaged) {
			this.includeLibraryTheme("sap-ui-merged", undefined, "?l=" + aCSSLibs.join(","));
		}

		// load all modules now
		if ( bAsync ) {
			return this._requireModulesAsync().then(function() {
				fnCallback();
			});
		}

		var that = this;
		this.oConfiguration.modules.forEach( function(mod) {
			var m = mod.match(/^(.*)\.library$/);
			if ( m ) {
				that.loadLibrary(m[1]);
			} else {
				jQuery.sap.require( mod );
			}
		});

		fnCallback();
	};

	Core.prototype._requireModulesAsync = function() {

		var aLibs = [],
			aModules = [];

		this.oConfiguration.modules.forEach(function(sModule) {
			var m = sModule.match(/^(.*)\.library$/);
			if ( m ) {
				aLibs.push( m[1] );
			} else {
				aModules.push( jQuery.sap.getResourceName( sModule ) );
			}
		});

		// TODO: require libs and modules in parallel or define a sequence?
		return Promise.all([
			this.loadLibraries(aLibs),
			new Promise(function(resolve) {
				sap.ui.require(aModules, function() {
					resolve(Array.prototype.slice.call(arguments));
				});
			})
		]);

	};

	/**
	 * Applies the theme with the given name (by loading the respective style sheets, which does not disrupt the application).
	 *
	 * By default, the theme files are expected to be located at path relative to the respective control library ([libraryLocation]/themes/[themeName]).
	 * Different locations can be configured by using the method setThemePath() or by using the second parameter "sThemeBaseUrl" of applyTheme().
	 * Usage of this second parameter is a shorthand for setThemePath and internally calls setThemePath, so the theme location is then known.
	 *
	 * sThemeBaseUrl is a single URL to specify the default location of all theme files. This URL is the base folder below which the control library folders
	 * are located. E.g. if the CSS files are not located relative to the root location of UI5, but instead they are at locations like
	 *    http://my.server/myapp/resources/sap/ui/core/themes/my_theme/library.css
	 * then the URL that needs to be given is:
	 *    http://my.server/myapp/resources
	 * All theme resources are then loaded from below this folder - except if for a certain library a different location has been registered.
	 *
	 * If the theme resources are not all either below this base location or  with their respective libraries, then setThemePath must be
	 * used to configure individual locations.
	 *
	 * @param {string} sThemeName the name of the theme to be loaded
	 * @param {string} [sThemeBaseUrl] the (optional) base location of the theme
	 * @public
	 */
	Core.prototype.applyTheme = function(sThemeName, sThemeBaseUrl) {
		jQuery.sap.assert(typeof sThemeName === "string", "sThemeName must be a string");
		jQuery.sap.assert(typeof sThemeBaseUrl === "string" || typeof sThemeBaseUrl === "undefined", "sThemeBaseUrl must be a string or undefined");

		sThemeName = this.oConfiguration._normalizeTheme(sThemeName, sThemeBaseUrl);

		if (sThemeBaseUrl) {
			this.setThemeRoot(sThemeName, sThemeBaseUrl);
		}

		// only apply the theme if it is different from the active one
		if (sThemeName && this.sTheme != sThemeName) {
			var sCurrentTheme = this.sTheme;

			this._updateThemeUrls(sThemeName);
			this.sTheme = sThemeName;
			this.oConfiguration._setTheme(sThemeName);

			// modify the <html> tag's CSS class with the theme name
			jQuery(document.documentElement).removeClass("sapUiTheme-" + sCurrentTheme).addClass("sapUiTheme-" + sThemeName);

			// notify the listeners
			if ( this.oThemeCheck ) {
				this.oThemeCheck.fireThemeChangedEvent(false);
			}
		}
	};

	// modify style sheet URLs to point to the given theme, using the current RTL mode
	Core.prototype._updateThemeUrls = function(sThemeName) {
		var that = this,
		sRTL = this.oConfiguration.getRTL() ? "-RTL" : "";
		// select "our" stylesheets
		jQuery("link[id^=sap-ui-theme-]").each(function() {
			var sLibName = this.id.slice(13), // length of "sap-ui-theme-"
				sLibFileName = this.href.slice(this.href.lastIndexOf("/") + 1),
				sStandardLibFilePrefix = "library",
				sHref,
				pos;

			// handle 'variants'
			if ((pos = sLibName.indexOf("-[")) > 0) { // assumes that "-[" does not occur as part of a library name
				sStandardLibFilePrefix += sLibName.slice(pos + 2, -1); // 2=length of "-]"
				sLibName = sLibName.slice(0, pos);
			}

			// try to distinguish "our" library css from custom css included with the ':' notation in includeLibraryTheme
			if ( sLibFileName === (sStandardLibFilePrefix + ".css") || sLibFileName === (sStandardLibFilePrefix + "-RTL.css") ) {
				sLibFileName = sStandardLibFilePrefix + sRTL + ".css";
			}

			sHref = that._getThemePath(sLibName, sThemeName) + sLibFileName;
			if ( sHref != this.href ) {
				// Replace the current <link> tag with a new one.
				// Changing "this.href" would also trigger loading the new stylesheet but
				// the load/error handlers would not get called which causes issues with the ThemeCheck
				// as the "data-sap-ui-ready" attribute won't be set.
				jQuery.sap.includeStyleSheet(sHref, this.id);
			}
		});
	};

	/**
	 * Makes sure to register the correct module path for the given library and theme
	 * in case a themeRoot has been defined.
	 *
	 * @param {string} sLibName Library name (dot separated)
	 * @param {string} sThemeName Theme name
	 * @private
	 */
	Core.prototype._ensureThemeRoot = function(sLibName, sThemeName) {
		if (this._mThemeRoots) {
			var path =  this._mThemeRoots[sThemeName + " " + sLibName] || this._mThemeRoots[sThemeName];
			// check whether for this combination (theme+lib) a URL is registered or for this theme a default location is registered
			if (path) {
				path = path + sLibName.replace(/\./g, "/") + "/themes/" + sThemeName + "/";
				jQuery.sap.registerModulePath(sLibName + ".themes." + sThemeName, path);
			}
		}
	};

	/**
	 * Returns the URL of the folder in which the CSS file for the given theme and the given library is located.
	 *
	 * @param {string} sLibName Library name (dot separated)
	 * @param {string} sThemeName Theme name
	 * @returns {string} module path URL (ends with a slash)
	 * @private
	 */
	Core.prototype._getThemePath = function(sLibName, sThemeName) {

		// make sure to register correct theme module path in case themeRoots are defined
		this._ensureThemeRoot(sLibName, sThemeName);

		// use the library location as theme location
		return jQuery.sap.getModulePath(sLibName + ".themes." + sThemeName, "/");
	};


	/**
	 * Defines the root directory from below which UI5 should load the theme with the given name.
	 * Optionally allows restricting the setting to parts of a theme covering specific control libraries.
	 *
	 * Example:
	 * <pre>
	 *   sap.ui.getCore().setThemeRoot("my_theme", "https://mythemeserver.com/allThemes");
	 *   sap.ui.getCore().applyTheme("my_theme");
	 * </pre>
	 *
	 * will cause the following file to be loaded (assuming that the bootstrap is configured to load
	 *  libraries <code>sap.m</code> and <code>sap.ui.layout</code>):
	 * <pre>
	 *   https://mythemeserver.com/allThemes/sap/ui/core/themes/my_theme/library.css
	 *   https://mythemeserver.com/allThemes/sap/ui/layout/themes/my_theme/library.css
	 *   https://mythemeserver.com/allThemes/sap/m/themes/my_theme/library.css
	 * </pre>
	 *
	 * If parts of the theme are at different locations (e.g. because you provide a standard theme
	 * like "sap_belize" for a custom control library and this self-made part of the standard theme is at a
	 * different location than the UI5 resources), you can also specify for which control libraries the setting
	 * should be used, by giving an array with the names of the respective control libraries as second parameter:
	 * <pre>
	 *   sap.ui.getCore().setThemeRoot("sap_belize", ["my.own.library"], "https://mythemeserver.com/allThemes");
	 * </pre>
	 *
	 * This will cause the Belize theme to be loaded from the UI5 location for all standard libs.
	 * Resources for styling the <code>my.own.library</code> controls will be loaded from the configured
	 * location:
	 * <pre>
	 *   https://openui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize/library.css
	 *   https://openui5.hana.ondemand.com/resources/sap/ui/layout/themes/sap_belize/library.css
	 *   https://openui5.hana.ondemand.com/resources/sap/m/themes/sap_belize/library.css
	 *   https://mythemeserver.com/allThemes/my/own/library/themes/sap_belize/library.css
	 * </pre>
	 *
	 * If the custom theme should be loaded initially (via bootstrap attribute), the <code>themeRoots</code>
	 * property of the <code>window["sap-ui-config"]</code> object must be used instead of calling
	 * <code>sap.ui.getCore().setThemeRoot(...)</code> in order to configure the theme location early enough.
	 *
	 * @param {string} sThemeName Name of the theme for which to configure the location
	 * @param {string[]} [aLibraryNames] Optional library names to which the configuration should be restricted
	 * @param {string} sThemeBaseUrl Base URL below which the CSS file(s) will be loaded from
	 * @return {sap.ui.core.Core} the Core, to allow method chaining
	 * @since 1.10
	 * @public
	 */
	Core.prototype.setThemeRoot = function(sThemeName, aLibraryNames, sThemeBaseUrl) {
		jQuery.sap.assert(typeof sThemeName === "string", "sThemeName must be a string");
		jQuery.sap.assert((Array.isArray(aLibraryNames) && typeof sThemeBaseUrl === "string") || (typeof aLibraryNames === "string" && sThemeBaseUrl === undefined), "either the second parameter must be a string (and the third is undefined), or it must be an array and the third parameter is a string");

		if (!this._mThemeRoots) {
			this._mThemeRoots = {};
		}

		// normalize parameters
		if (sThemeBaseUrl === undefined) {
			sThemeBaseUrl = aLibraryNames;
			aLibraryNames = undefined;
		}
		sThemeBaseUrl = sThemeBaseUrl + (sThemeBaseUrl.slice( -1) == "/" ? "" : "/");

		if (aLibraryNames) {
			// registration of URL for several libraries
			for (var i = 0; i < aLibraryNames.length; i++) {
				var lib = aLibraryNames[i];
				this._mThemeRoots[sThemeName + " " + lib] = sThemeBaseUrl;
			}

		} else {
			// registration of theme default base URL
			this._mThemeRoots[sThemeName] = sThemeBaseUrl;
		}

		return this;
	};


	/**
	 * Initializes the Core after the initial page was loaded
	 * @private
	 */
	Core.prototype.init = function() {

		if (this.bInitialized) {
			return;
		}

		var log = jQuery.sap.log,
			METHOD = "sap.ui.core.Core.init()";

		// ensure that the core is booted now (e.g. loadAllMode)
		this.boot();

		log.info("Initializing",null,METHOD);

		this.oFocusHandler = new FocusHandler(document.body, this);
		this.oRenderManager._setFocusHandler(this.oFocusHandler); //Let the RenderManager know the FocusHandler
		this.oResizeHandler = new ResizeHandler(this);
		this.oThemeCheck = new ThemeCheck(this);

		log.info("Initialized",null,METHOD);
		jQuery.sap.measure.end("coreInit");

		this.bInitialized = true;

		// start the plugins
		log.info("Starting Plugins",null,METHOD);
		this.startPlugins();
		log.info("Plugins started",null,METHOD);

		this._createUIAreas();

		this.oThemeCheck.fireThemeChangedEvent(true);

		this._executeOnInit();

		this._setupRootComponent();

		this._setBodyAccessibilityRole();

		this._executeInitListeners();

		if ( this.isThemeApplied() || !this.oConfiguration['xx-waitForTheme'] ) {
			this.renderPendingUIUpdates("during Core init"); // directly render without setTimeout, so rendering is guaranteed to be finished when init() ends
		} else {
			oRenderLog.debug("delay initial rendering until theme has been loaded");
			_oEventProvider.attachEventOnce(Core.M_EVENTS.ThemeChanged, function() {
				setTimeout(
					this.renderPendingUIUpdates.bind(this, "after theme has been loaded"),
					Device.browser.safari ? 50 : 0
				);
			}, this);
		}

		jQuery.sap.measure.end("coreComplete");
	};

	Core.prototype._createUIAreas = function() {
		var oConfig = this.oConfiguration;

		// create any pre-configured UIAreas
		//	if ( oConfig.areas && oConfig.areas.length > 0 ) {
		if ( oConfig.areas ) {
			// log.warning("deprecated config option '(data-sap-ui-)areas' used.");
			for (var i = 0, l = oConfig.areas.length; i < l; i++) {
				this.createUIArea(oConfig.areas[i]);
			}
			oConfig.areas = undefined;
		}
	};

	Core.prototype._executeOnInit = function() {
		var oConfig = this.oConfiguration;

		// execute a configured init hook
		if ( oConfig.onInit ) {
			if ( typeof oConfig.onInit === "function" ) {
				oConfig.onInit();
			} else {
				// DO NOT USE jQuery.globalEval as it executes async in FF!
				jQuery.sap.globalEval(oConfig.onInit);
			}
			oConfig.onInit = undefined;
		}
	};

	Core.prototype._setupRootComponent = function() {
		var log = jQuery.sap.log,
			METHOD = "sap.ui.core.Core.init()",
			oConfig = this.oConfiguration;

		// load the root component
		var sRootComponent = oConfig.getRootComponent();
		if (sRootComponent) {

			log.info("Loading Root Component: " + sRootComponent,null,METHOD);
			var oComponent = sap.ui.component({
				name: sRootComponent
			});
			this.oRootComponent = oComponent;

			var sRootNode = oConfig["xx-rootComponentNode"];
			if (sRootNode && lazyInstanceof(oComponent, 'sap/ui/core/UIComponent')) {
				var oRootNode = jQuery.sap.domById(sRootNode);
				if (oRootNode) {
					log.info("Creating ComponentContainer for Root Component: " + sRootComponent,null,METHOD);
					var ComponentContainer = sap.ui.requireSync('sap/ui/core/ComponentContainer'),
						oContainer = new ComponentContainer({
						component: oComponent,
						propagateModel: true /* TODO: is this a configuration or do this by default? right now it behaves like the application */
					});
					oContainer.placeAt(oRootNode);
				}
			}

		} else {

			// DEPRECATED LEGACY CODE: load the application (TODO: remove when Application is removed!)
			var sApplication = oConfig.getApplication();
			if (sApplication) {

				log.warning("The configuration 'application' is deprecated. Please use the configuration 'component' instead! Please migrate from sap.ui.app.Application to sap.ui.core.Component.");
				log.info("Loading Application: " + sApplication,null,METHOD);
				jQuery.sap.require(sApplication);
				var oClass = jQuery.sap.getObject(sApplication);
				jQuery.sap.assert(oClass !== undefined, "The specified application \"" + sApplication + "\" could not be found!");
				var oApplication = new oClass();
				jQuery.sap.assert(lazyInstanceof(oApplication, 'sap/ui/app/Application'), "The specified application \"" + sApplication + "\" must be an instance of sap.ui.app.Application!");

			}

		}
	};

	Core.prototype._setBodyAccessibilityRole = function() {
		var oConfig = this.oConfiguration;

		//Add ARIA role 'application'
		var $body = jQuery("body");
		if (oConfig.getAccessibility() && oConfig.getAutoAriaBodyRole() && !$body.attr("role")) {
			$body.attr("role", "application");
		}
	};

	Core.prototype._executeInitListeners = function() {
		var log = jQuery.sap.log,
			METHOD = "sap.ui.core.Core.init()";

		// make sure that we have no concurrent modifications on the init listeners
		var aCallbacks = this.aInitListeners;
		// reset the init listener so that we are aware the listeners are already
		// executed and the initialization phase is over / follow up registration
		// would then immediately call the init event handler
		this.aInitListeners = undefined;

		// execute registered init event handlers
		if (aCallbacks && aCallbacks.length > 0) {
			// execute the callbacks
			log.info("Fire Loaded Event",null,METHOD);
			aCallbacks.forEach(function(fn) {
				fn();
			});
		}
	};

	/**
	 * Returns true if the Core has already been initialized. This means that instances
	 * of RenderManager etc. do already exist and the init event has already been fired
	 * (and will not be fired again).
	 *
	 * @return {boolean} whether the Core has already been initialized
	 * @public
	 */
	Core.prototype.isInitialized = function () {
		return this.bInitialized;
	};

	/**
	 * Returns true, if the styles of the current theme are already applied, false otherwise.
	 *
	 * This function must not be used before the init event of the Core.
	 * If the styles are not yet applied a theme changed event will follow when the styles will be applied.
	 *
	 * @return {boolean} whether the styles of the current theme are already applied
	 * @public
	 */
	Core.prototype.isThemeApplied = function () {
		return ThemeCheck.themeLoaded;
	};

	/**
	 * Registers a given function that is executed after the framework has been initialized.
	 *
	 * The method is executed only once and only if the framework has not been initialized already.
	 * This could be checked by calling {@link #isInitialized}, but in most cases it is more convenient to
	 * use {@link #attachInit} instead. This guarantees that the given function is executed exactly once,
	 * independent of the state of the framework.
	 *
	 * @param {function} fnFunction Function that is called after initialization of the framework
	 * @public
	 * @deprecated since 1.13.2 Register with the more convenient {@link #attachInit} function instead
	 */
	Core.prototype.attachInitEvent = function (fnFunction) {
		jQuery.sap.assert(typeof fnFunction === "function", "fnFunction must be a function");
		if (this.aInitListeners) {
			this.aInitListeners.push(fnFunction);
		}
	};

	/**
	 * Registers a given function that is executed after the framework has been initialized.
	 *
	 * The given function will either be called as soon as the framework has been initialized
	 * or, if it has been initialized already, it will be called immediately.
	 *
	 * @param {function} fnFunction Function to be after initialization of the framework
	 * @public
	 * @since 1.13.2
	 */
	Core.prototype.attachInit = function (fnFunction) {
		jQuery.sap.assert(typeof fnFunction === "function", "fnFunction must be a function");
		if (this.aInitListeners) {
			this.aInitListeners.push(fnFunction);
		} else {
			fnFunction();
		}
	};

	/**
	 * Locks the Core. No browser events are dispatched to the controls.
	 *
	 * Lock should be called before and after the dom is modified for rendering, roundtrips...
	 * Exceptions might be the case for asynchronous UI behavior
	 * @public
	 */
	Core.prototype.lock = function () {
		// TODO clarify it the documentation is really (stil?) true
		this.bLocked = true;
	};

	/**
	 * Unlocks the Core.
	 *
	 * Browser events are dispatched to the controls again after this method is called.
	 * @public
	 */
	Core.prototype.unlock = function () {
		this.bLocked = false;
	};

	/**
	 * Returns the locked state of the <code>sap.ui.core.Core</code>
	 * @return {boolean} locked state
	 * @public
	 */
	Core.prototype.isLocked = function () {
		return this.bLocked;
	};

	/**
	 * Returns the Configuration of the Core.
	 *
	 * @return {sap.ui.core.Configuration} the Configuration of the current Core.
	 * @public
	 */
	Core.prototype.getConfiguration = function () {
		return this.oConfiguration;
	};

	/**
	 * @public
	 * @deprecated Since version 0.15.0. Replaced by <code>createRenderManager()</code>
	 */
	Core.prototype.getRenderManager = function() {
		return this.createRenderManager(); //this.oRenderManager;
	};

	/**
	 * Returns a new instance of the RenderManager for exclusive use by the caller.
	 *
	 * The caller must take care to destroy the render manager when it is no longer needed.
	 * Calling this method before the Core has been {@link #isInitialized initialized},
	 * is not recommended.
	 *
	 * @return {sap.ui.core.RenderManager} New instance of the RenderManager
	 * @public
	 */
	Core.prototype.createRenderManager = function() {
		jQuery.sap.assert(this.isInitialized(), "A RenderManager should be created only after the Core has been initialized");
		var oRm = new RenderManager();
		oRm._setFocusHandler(this.oFocusHandler); //Let the RenderManager know the FocusHandler
		return oRm.getInterface();
	};

	/**
	 * Returns the Id of the control/element currently in focus.
	 * @return {string} the Id of the control/element currently in focus.
	 * @public
	 */
	Core.prototype.getCurrentFocusedControlId = function() {
		if (!this.isInitialized()) {
			throw new Error("Core must be initialized");
		}
		return this.oFocusHandler.getCurrentFocusedControlId();
	};

	/**
	 * Configured type of preload file per library.
	 * The empty name represents the default for all libraries not explicitly listed.
	 *
	 * A type can be one of
	 * - 'none' (do not preload),
	 * - 'js' (preload JS file),
	 * - 'json' (preload a json file)
	 * or 'both (try js first, then 'json')
	 *
	 * @private
	 */
	var mLibraryPreloadFileTypes = {};

	function evalLibConfig(lib) {

		jQuery.sap.assert(
			typeof lib === 'string' && lib ||
			typeof lib === 'object' && typeof lib.name === 'string' && lib.name && (lib.json == null || typeof lib.json === 'boolean'),
			"lib must be a non-empty string or an object with at least a non-empty 'name' property and an optional (boolean) property 'json'" );

		var fileTypeSupportedByLib = 'both';
		if ( typeof lib === 'object' ) {
			if ( lib.json === true ) {
				fileTypeSupportedByLib = 'json';
			} else if ( lib.json === false ) {
				fileTypeSupportedByLib = 'js';
			}
			lib = lib.name;
		}

		// decide between supported and configured preload file types
		var fileType = mLibraryPreloadFileTypes[lib] || mLibraryPreloadFileTypes[''] || 'both';
		if ( fileType === 'both' ) {
			// if the configured file type is 'both', the supported type always wins
			fileType = fileTypeSupportedByLib;
		} else if ( fileType !== fileTypeSupportedByLib && fileTypeSupportedByLib !== 'both' ) {
			// if the configured and the supported file type are not equal and the library doesn't support 'both',
			// then there is no compromise -> 'none'
			fileType = 'none';
		}

		return {
			name: lib,
			fileType: fileType
		};

	}

	/**
	 * Preloads a library asynchronously.
	 *
	 * @param {string|object} libConfig Name of the library to preload or settings object describing library
	 * @param {string} [libConfig.name] Name of the library to preload
	 * @param {boolean|undefined} [libConfig.json] Whether library supports only json (<code>true<true>) or only JS (<code>false<code>)
	 *                               or whether both should be tried (undefined)
	 * @returns {Promise} A promise to be fulfilled when the lib has been preloaded
	 * @private
	 */
	function preloadLibraryAsync(libConfig) {

		libConfig = evalLibConfig(libConfig);

		var lib = libConfig.name,
			fileType = libConfig.fileType,
			libPackage = lib.replace(/\./g, '/');

		if ( fileType === 'none' || jQuery.sap.isResourceLoaded(libPackage + '/library.js') ) {
			return Promise.resolve(true);
		}

		var libInfo = mLibraryPreloadBundles[lib] || (mLibraryPreloadBundles[lib] = { });

		// return any existing promise (either lib is currently loading or has been loaded)
		if ( libInfo.promise ) {
			return libInfo.promise;
		}

		// otherwise mark as pending
		libInfo.pending = true;
		libInfo.async = true;

		// first preload code, resolves with list of dependencies (or undefined)
		var p;
		if ( fileType !== 'json' /* 'js' or 'both', not forced to JSON */ ) {
			var sPreloadModule = libPackage + '/library-preload.js';
			p = jQuery.sap._loadJSResourceAsync(sPreloadModule).then(
					function() {
						return dependenciesFromManifest(lib);
					},
					function(e) {
						// loading library-preload.js failed, might be an old style lib with a library-preload.json only.
						// with json === false, this fallback can be suppressed
						if ( fileType !== 'js' /* 'both' */ ) {
							jQuery.sap.log.error("failed to load '" + sPreloadModule + "' (" + (e && e.message || e) + "), falling back to library-preload.json");
							return loadJSONAsync(lib);
						}
						// ignore other errors
					}
				);
		} else {
			p = loadJSONAsync(lib);
		}

		// load dependencies, if there are any
		libInfo.promise = p.then(function(dependencies) {
			if ( dependencies && dependencies.length ) {
				return Promise.all(dependencies.map(preloadLibraryAsync)).then(function() {
					libInfo.pending = false;
				});
			}
			libInfo.pending = false;
		});

		// return resulting promise
		return libInfo.promise;

	}

	function dependenciesFromManifest(lib) {

		var manifestModule = lib.replace(/\./g, '/') + '/manifest.json';

		if ( jQuery.sap.isResourceLoaded(manifestModule) ) {

			var manifest = jQuery.sap.loadResource(manifestModule, {
					dataType: 'json',
					async: false, // always sync as we are sure to load from preload cache
					failOnError: false
				});

			var libs = manifest && manifest["sap.ui5"] && manifest["sap.ui5"].dependencies && manifest["sap.ui5"].dependencies.libs;
			if ( libs ) {
				// convert manifest map to array, inject name
				return Object.keys(libs).reduce(function(result, dep) {
					if ( !libs[dep].lazy ) {
						result.push(dep);
					}
					return result;
				}, []);
			}

		}

		// return undefined
	}

	function loadJSONAsync(lib) {
		var sURL = jQuery.sap.getModulePath(lib + ".library-preload", ".json");

		return Promise.resolve(jQuery.ajax({
			dataType : "json",
			url : sURL
		})).then(
			function(data) {
				if ( data ) {
					data.url = sURL;
					jQuery.sap.registerPreloadedModules(data);
					var dependencies = data.dependencies;
					if ( Array.isArray(dependencies) ) {
						// remove .library-preload suffix from dependencies
						dependencies = dependencies.map(function(dep) {
							return dep.replace(/\.library-preload$/, '');
						});
					}
					return dependencies;
				}
			},
			function(xhr, textStatus, error) {
				jQuery.sap.log.error("failed to load '" + sURL + "': " + (error || textStatus));
			}
		);

	}


	/**
	 * Preloads a library synchronously.
	 *
	 * @param {string|object} libConfig Name of the library to preload or settings object describing library.
	 * @param {string} [libConfig.name] Name of the library to preload
	 * @param {boolean|undefined} [libConfig.json] Whether lib supports only json (<code>true<true>) or only JS (<code>false<code>)
	 *                               or whether both should be tried (undefined)
	 * @private
	 */
	function preloadLibrarySync(libConfig) {

		libConfig = evalLibConfig(libConfig);

		var lib = libConfig.name,
			fileType = libConfig.fileType,
			libPackage = lib.replace(/\./g, '/');

		if ( fileType === 'none' || jQuery.sap.isResourceLoaded(libPackage + '/library.js') ) {
			return;
		}

		var libInfo = mLibraryPreloadBundles[lib] || (mLibraryPreloadBundles[lib] = { });

		// already preloaded?
		if ( libInfo.pending === false ) {
			return;
		}

		// currently loading
		if ( libInfo.pending ) {
			if ( libInfo.async ) {
				jQuery.sap.log.warning("request to load " + lib + " synchronously while async loading is pending; this causes a duplicate request and should be avoided by caller");
				// fall through and preload synchronously
			} else {
				// sync cycle -> ignore nested call (would nevertheless be a dependency cycle)
				jQuery.sap.log.warning("request to load " + lib + " synchronously while sync loading is pending (cycle, ignored)");
				return;
			}
		}

		libInfo.pending = true;
		libInfo.async = false;

		var resolve;
		libInfo.promise = new Promise(function(_resolve, _reject) {
			resolve = _resolve;
		});

		var dependencies;
		if ( fileType !== 'json' /* 'js' or 'both', not forced to JSON */ ) {
			var sPreloadModule = libPackage + '/library-preload';
			try {
				sap.ui.requireSync(sPreloadModule);
				dependencies = dependenciesFromManifest(lib);
			} catch (e) {
				jQuery.sap.log.error("failed to load '" + sPreloadModule + "' (" + (e && e.message || e) + ")");
				if ( e && e.loadError && fileType !== 'js' ) {
					dependencies = loadJSONSync(lib);
				} // ignore other errors (preload shouldn't fail)
			}
		} else {
			dependencies = loadJSONSync(lib);
		}

		if ( dependencies && dependencies.length ) {
			dependencies.forEach(preloadLibrarySync);
		}

		libInfo.pending = false;
		resolve();

	}

	function loadJSONSync(lib) {
		var sURL = jQuery.sap.getModulePath(lib + ".library-preload", ".json");
		var dependencies;

		jQuery.ajax({
			dataType : "json",
			async: false,
			url : sURL,
			success: function(data) {
				if ( data ) {
					data.url = sURL;
					jQuery.sap.registerPreloadedModules(data);
					dependencies = data.dependencies;
				}
			},
			error: function(xhr, textStatus, error) {
				jQuery.sap.log.error("failed to load '" + sURL + "': " + (error || textStatus));
			}
		});

		if ( Array.isArray(dependencies) ) {
			// remove .library-preload suffix from dependencies
			dependencies = dependencies.map(function(dep) {
				return dep.replace(/\.library-preload$/, '');
			});
		}
		return dependencies;
	}

	/**
	 * Loads the given library and its dependencies and makes it available to the application.
	 *
	 * When library preloads are not suppressed for the given library, then a library-preload bundle
	 * will be loaded for it. By default, the bundle will be loaded synchronously (for compatibility
	 * reasons). Only when the optional parameter <code>vUrl</code> is given as <code>true</code> or as
	 * a configuration object with a property of <code>async:true</code>, then the bundle will be loaded
	 * asynchronously and a <code>Promise</code> will be returned (preferred usage).
	 *
	 * After preloading the bundle, dependency information from the bundle is evaluated and any
	 * missing libraries are also preloaded.
	 *
	 * Only then the library entry module (named <code><i>your/lib</i>/library.js</code>) will be required
	 * and executed. The module is supposed to call <code>sap.ui.getCore().initLibrary(...)</code>
	 * providing the framework with additional metadata about the library, e.g. its version, the set of contained
	 * enums, types, interfaces, controls and elements and whether the library requires CSS. If the library
	 * requires CSS, a &lt;link&gt; will be added to the page referring to the corresponding <code>library.css</code>
	 * stylesheet for the library and the current theme.
	 *
	 * When the optional parameter <code>vUrl</code> is given as a string or when a configuration object is given
	 * with a non-empty, string-valued property <code>url</code>, then that URL will be registered for the
	 * namespace of the library and all resources will be loaded from that location. This is convenience for
	 * a call like
	 * <pre>
	 *   jQuery.sap.registerModulePath(sLibrary, vUrl); // or vUrl.url resp.
	 * </pre>
	 *
	 * When the given library has been loaded already, no further action will be taken, especially, a given
	 * URL will not be registered! In the case of asynchronous loading, a Promise will be returned, but will be
	 * resolved immediately.
	 *
	 * @param {string} sLibrary name of the library to load
	 * @param {string|boolean|object} [vUrl] URL to load the library from or the async flag or a complex configuration object
	 * @param {string} [vUrl.url] URL to load the library from
	 * @param {boolean} [vUrl.async] Whether to load the library asynchronously
	 * @returns {Object|Promise} An info object for the library (sync) or a Promise (async)
	 * @public
	 */
	Core.prototype.loadLibrary = function(sLibrary, vUrl) {
		jQuery.sap.assert(typeof sLibrary === "string", "sLibrary must be a string");
		jQuery.sap.assert(vUrl === undefined ||
			typeof vUrl === 'boolean' ||
			typeof vUrl === 'string' ||
			typeof vUrl === 'object' && (vUrl.url == null || vUrl.url === 'string') && (vUrl.async == null || typeof vUrl.async === 'boolean'),
			"sUrl must be empty or a string or an object with an optional property 'url' of type string and an optional boolean property 'async'");

		if ( typeof vUrl === 'boolean' ) {
			vUrl = { async: vUrl };
		}
		if ( typeof vUrl === 'object' ) {
			if ( vUrl.async ) {
				if ( vUrl.url && mLibraryPreloadBundles[sLibrary] == null ) { // only if lib has not been loaded yet
					jQuery.sap.registerModulePath(sLibrary, vUrl.url);
				}
				return this.loadLibraries([sLibrary]);
			}
			vUrl = vUrl.url;
		}

		// load libraries only once
		if ( !mLoadedLibraries[sLibrary] ) {

			var sModule = sLibrary + ".library",
				sAllInOneModule;

			// if a sUrl is given, redirect access to it
			if ( vUrl ) {
				jQuery.sap.registerModulePath(sLibrary, vUrl);
			}

			// optimization: in all-in-one mode we are loading all modules of the lib in a single file
			if ( this.oConfiguration['xx-loadAllMode'] && !jQuery.sap.isDeclared(sModule) ) {
				sAllInOneModule = sModule + "-all";
				jQuery.sap.log.debug("load all-in-one file " + sAllInOneModule);
				jQuery.sap.require(sAllInOneModule);
			} else if ( this.oConfiguration.preload === 'sync' || this.oConfiguration.preload === 'async' ) {
				preloadLibrarySync(sLibrary);
			}

			// require the library module (which in turn will call initLibrary())
			jQuery.sap.require(sModule);

			// check for legacy code
			if ( !mLoadedLibraries[sLibrary] ) {
				jQuery.sap.log.warning("library " + sLibrary + " didn't initialize itself");
				this.initLibrary(sLibrary); // TODO redundant to generated initLibrary call....
			}

			if ( this.oThemeCheck && this.isInitialized() ) {
				this.oThemeCheck.fireThemeChangedEvent(true);
			}

		}

		// Note: return parameter is undocumented by intention! Structure of lib info might change
		return this.mLibraries[sLibrary];
	};

	/**
	 * Loads a set of libraries, preferably asynchronously.
	 *
	 * The module loading is still synchronous, so if a library loads additional modules besides
	 * its library.js file, those modules might be loaded synchronously by the library.js
	 * The async loading is only supported by the means of the library-preload.js(on) files, so if a
	 * library doesn't provide a preload or when the preload is deactivated (configuration, debug mode)
	 * then this API falls back to synchronous loading. However, the contract (Promise) remains valid
	 * and a Promise will be returned if async is specified - even when the real loading
	 * is done synchronously.
	 *
	 * @param {string[]} aLibraries set of libraries that should be loaded
	 * @param {object} [mOptions] configuration options
	 * @param {boolean} [mOptions.async=true] whether to load the libraries async (default)
	 * @param {boolean} [mOptions.preloadOnly=false] whether to preload the libraries only (default is to require them as well)
	 * @returns {Promise|undefined} returns a Promise in async mode, otherwise <code>undefined</code>
	 *
	 * @experimental Since 1.27.0 This API is not mature yet and might be changed or removed completely.
	 * Productive code should not use it, except code that is delivered as part of UI5.
	 * @private
	 * @sap-restricted sap.ui.core,sap.ushell
	 */
	Core.prototype.loadLibraries = function(aLibraries, mOptions) {

		jQuery.sap.assert(Array.isArray(aLibraries), "aLibraries must be an array");

		// default values for options
		mOptions = jQuery.extend({ async : true, preloadOnly : false }, mOptions);

		var that = this,
			bPreload = this.oConfiguration.preload === 'sync' || this.oConfiguration.preload === 'async',
			bAsync = mOptions.async,
			bRequire = !mOptions.preloadOnly;

		function getLibraryModuleNames() {
			return aLibraries.map(function(vLibraryName) {
				if ( typeof vLibraryName === 'object' ) {
					vLibraryName = vLibraryName.name;
				}
				return vLibraryName.replace(/\./g, "/") + "/library";
			});
		}

		function triggerThemeCheck() {
			if ( that.oThemeCheck && that.isInitialized() ) {
				that.oThemeCheck.fireThemeChangedEvent(true);
			}
		}

		function requireLibsAsync() {
			return new Promise(function(resolve, reject) {
				sap.ui.require(getLibraryModuleNames(), function() {
					triggerThemeCheck();
					resolve();
				});
			});
		}

		function requireLibsSync() {
			getLibraryModuleNames().forEach(sap.ui.requireSync);
			triggerThemeCheck();
		}

		if ( bAsync ) {

			var preloaded = bPreload ? Promise.all(aLibraries.map(preloadLibraryAsync)) : Promise.resolve(true);
			return bRequire ? preloaded.then(requireLibsAsync) : preloaded;

		} else {

			if ( bPreload ) {
				aLibraries.forEach(preloadLibrarySync);
			}
			if ( bRequire ) {
				requireLibsSync();
			}

		}

	};

	/**
	 * Creates a component with the provided id and settings.
	 *
	 * When the optional parameter <code>sUrl</code> is given, then all request for resources of the
	 * library will be redirected to the given Url. This is convenience for a call to
	 * <pre>
	 *   jQuery.sap.registerModulePath(sName, sUrl);
	 * </pre>
	 *
	 * @param {string|object} vComponent name of the component to import or object containing all needed parameters
	 * @param {string} [vComponent.name] name of the component to import
	 * @param {string} [vComponent.url] URL to load the component from
	 * @param {string} [vComponent.id] ID for the component instance
	 * @param {object} [vComponent.settings] settings object for the component
	 * @param {string} [vComponent.componentData] user specific data which is available during the whole lifecycle of the component
	 * @param {string} [sUrl] the URL to load the component from
	 * @param {string} [sId] the ID for the component instance
	 * @param {object} [mSettings] the settings object for the component
	 * @public
	 */
	Core.prototype.createComponent = function(vComponent, sUrl, sId, mSettings) {

		// convert the parameters into a configuration object
		if (typeof vComponent === "string") {
			vComponent = {
				name: vComponent,
				url: sUrl
			};
			// parameter fallback (analog to ManagedObject)
			if (typeof sId === "object") {
				vComponent.settings = sId;
			} else {
				vComponent.id = sId;
				vComponent.settings = mSettings;
			}
		}

		// use the factory function
		return sap.ui.component(vComponent);

	};

	/**
	 * Returns the instance of the root component (if exists).
	 *
	 * @return {sap.ui.core.Component} instance of the current root component
	 * @public
	 */
	Core.prototype.getRootComponent = function() {
		return this.oRootComponent;
	};

	/**
	 * Provides the framework with information about a library.
	 *
	 * This method is intended to be called exactly once while the main module of a library
	 * (its <code>library.js</code> module) is executing, typically at its begin. The single
	 * parameter <code>oLibInfo</code> is an info object that describes the content of the library.
	 *
	 * When the <code>oLibInfo</code> has been processed, a normalized version of it will be kept
	 * and will be returned as library information in later calls to {@link #getLoadedLibraries}.
	 * Finally, <code>initLibrary</code> fires (the currently private) {@link #event:LibraryChanged}
	 * event with operation 'add' for the newly loaded library.
	 *
	 *
	 * <h3>Side Effects</h3>
	 *
	 * While analyzing the <code>oLibInfo</code>, the framework takes some additional actions:
	 *
	 * <ul>
	 * <li>If the info object contains a list of <code>interfaces</code>, they will be registered
	 * with the {@link sap.ui.base.DataType} class to make them available as aggregation types
	 * in managed objects.</li>
	 *
	 * <li>If the object contains a list of <code>controls</code> or <code>elements</code>,
	 * {@link sap.ui.lazyRequire lazy stubs} will be created for their constructor as well as for
	 * their static <code>extend</code> and <code>getMetadata</code> methods.<br>
	 * <b>Note:</b> Future versions might abandon the concept of lazy stubs as it requires synchronous
	 * XMLHttpRequests which have been deprecated (see {@link http://xhr.spec.whatwg.org}). To be on the
	 * safe side, productive applications should always require any modules that they directly depend on.</li>
	 *
	 * <li>With the <code>noLibraryCSS</code> property, the library can be marked as 'theming-free'.
	 * Otherwise, the framework will add a &lt;link&gt; tag to the page's head, pointing to the library's
	 * theme-specific stylesheet. The creation of such a &lt;link&gt; tag can be suppressed with the
	 * {@link sap.ui.core.Configuration global configuration option} <code>preloadLibCss</code>.
	 * It can contain a list of library names for which no stylesheet should be included.
	 * This is e.g. useful when an application merges the CSS for multiple libraries and already
	 * loaded the resulting stylesheet.</li>
	 *
	 * <li>If a list of library <code>dependencies</code> is specified in the info object, those
	 * libraries will be loaded synchronously by <code>initLibrary</code>.<br>
	 * <b>Note:</b> Dependencies between libraries don't have to be modeled as AMD dependencies.
	 * Only when enums or types from an additional library are used in the coding of the
	 * <code>library.js</code> module, the library should be additionally listed in the AMD dependencies.</li>
	 * </ul>
	 *
	 * Last but not least, higher layer frameworks might want to include their own metadata for libraries.
	 * The property <code>extensions</code> might contain such additional metadata. Its structure is not defined
	 * by the framework, but it is strongly suggested that each extension only occupies a single property
	 * in the <code>extensions</code> object and that the name of that property contains some namespace
	 * information (e.g. library name that introduces the feature) to avoid conflicts with other extensions.
	 * The framework won't touch the content of <code>extensions</code> but will make it available
	 * in the library info objects returned by {@link #getLoadedLibraries}.
	 *
	 *
	 * <h3>Relationship to Descriptor for Libraries (manifest.json)</h3>
	 *
	 * The information contained in <code>oLibInfo</code> is partially redundant to the content of the descriptor
	 * for the same library (its <code>manifest.json</code> file). Future versions of UI5 might ignore the information
	 * provided in <code>oLibInfo</code> and might evaluate the descriptor file instead. Library developers therefore
	 * should keep the information in both files in sync.
	 *
	 * When the <code>manifest.json</code> is generated from the <code>.library</code> file (which is the default
	 * for UI5 libraries built with Maven), then the content of the <code>.library</code> and <code>library.js</code>
	 * files must be kept in sync.
	 *
	 * @param {object} oLibInfo Info object for the library
	 * @param {string} [oLibInfo.name] Name of the library; when given it must match the name by which the library has been loaded
	 * @param {string} oLibInfo.version Version of the library
	 * @param {string[]} [oLibInfo.dependencies=[]] List of libraries that this library depends on; names are in dot notation (e.g. "sap.ui.core")
	 * @param {string[]} [oLibInfo.types=[]] List of names of types that this library provides; names are in dot notation (e.g. "sap.ui.core.CSSSize")
	 * @param {string[]} [oLibInfo.interfaces=[]] List of names of interface types that this library provides; names are in dot notation (e.g. "sap.ui.core.PopupInterface")
	 * @param {string[]} [oLibInfo.controls=[]] Names of control types that this library provides; names are in dot notation (e.g. "sap.ui.core.ComponentContainer")
	 * @param {string[]} [oLibInfo.elements=[]] Names of element types that this library provides (excluding controls); names are in dot notation (e.g. "sap.ui.core.Item")
	 * @param {boolean} [oLibInfo.noLibraryCSS=false] Indicates whether the library doesn't provide / use theming.
	 *                        When set to true, no library.css will be loaded for this library
	 * @param {object} [oLibInfo.extensions] Potential extensions of the library metadata; structure not defined by the UI5 core framework.
	 * @public
	 */
	Core.prototype.initLibrary = function(oLibInfo) {
		jQuery.sap.assert(typeof oLibInfo === 'string' || typeof oLibInfo === 'object', "oLibInfo must be a string or object");

		var bLegacyMode = typeof oLibInfo === 'string';
		if ( bLegacyMode ) {
			oLibInfo = { name : oLibInfo };
		}

		var sLibName = oLibInfo.name,
			log = jQuery.sap.log,
			METHOD =  "sap.ui.core.Core.initLibrary()";

		if ( bLegacyMode ) {
			log.warning("[Deprecated] library " + sLibName + " uses old fashioned initLibrary() call (rebuild with newest generator)");
		}

		if ( !sLibName || mLoadedLibraries[sLibName] ) {
			return;
		}

		log.debug("Analyzing Library " + sLibName, null, METHOD);

		// Set 'loaded' marker
		mLoadedLibraries[sLibName] = true;

		function extend(oLibrary, oInfo) {

			var sKey, vValue;

			for ( sKey in oInfo ) {
				vValue = oInfo[sKey];

				// don't copy undefined values
				if ( vValue !== undefined ) {

					if ( Array.isArray(oLibrary[sKey]) ) {
						// concat array typed values
						if ( oLibrary[sKey].length === 0 ) {
							oLibrary[sKey] = vValue;
						} else {
							oLibrary[sKey] = jQuery.sap.unique(oLibrary[sKey].concat(vValue));
						}
					} else if ( oLibrary[sKey] === undefined ) {
						// only set values for properties that are still undefined
						oLibrary[sKey] = vValue;
					} else if ( sKey != "name" ) {
						// ignore other values (silently ignore "name")
						jQuery.sap.log.warning("library info setting ignored: " + sKey + "=" + vValue);
					}
				}
			}

			return oLibrary;
		}

		// ensure namespace
		jQuery.sap.getObject(sLibName, 0);

		// Create lib info object or merge with existing 'adhoc' library
		this.mLibraries[sLibName] = oLibInfo = extend(this.mLibraries[sLibName] || {
			name : sLibName,
			dependencies : [],
			types : [],
			interfaces : [],
			controls: [],
			elements : []
		}, oLibInfo);

		// this code could be moved to a separate "legacy support" module
		function readLibInfoFromProperties() {

			// read library properties
			var oProperties = jQuery.sap.properties({url : sap.ui.resource(sLibName, "library.properties")});

			// version info
			oLibInfo.version = oProperties.getProperty(sLibName + "[version]");

			// dependencies
			var sDepInfo = oProperties.getProperty(sLibName + "[dependencies]");
			log.debug("Required Libraries: " + sDepInfo, null, METHOD);
			oLibInfo.dependencies = (sDepInfo && sDepInfo.split(/[,;| ]/)) || [];

			// collect types, controls and elements
			var aKeys = oProperties.getKeys(),
			  rPattern = /(.+)\.(type|interface|control|element)$/,
			  aMatch;
			for (var j = 0; j < aKeys.length; j++) {
				var sEntityPath = oProperties.getProperty(aKeys[j]);
				if ( (aMatch = sEntityPath.match(rPattern)) !== null ) {
					oLibInfo[aMatch[2] + "s"].push(aKeys[j]);
				}
			}
		}

		// (legacy) if only a string was given, read the library.properties instead
		if ( bLegacyMode ) {
			readLibInfoFromProperties();
		}

		// resolve dependencies
		for (var i = 0; i < oLibInfo.dependencies.length; i++) {
			var sDepLib = oLibInfo.dependencies[i];
			log.debug("resolve Dependencies to " + sDepLib, null, METHOD);
			if ( mLoadedLibraries[sDepLib] !== true ) {
				log.warning("Dependency from " + sLibName + " to " + sDepLib + " has not been resolved by library itself", null, METHOD);
				this.loadLibrary(sDepLib);
			}
		}

		// register interface types
		DataType.registerInterfaceTypes(oLibInfo.interfaces);

		// Declare a module for each (non-builtin) simple type
		// Only needed for backward compatibility: some code 'requires' such types although they never have been modules on their own
		for (var i = 0; i < oLibInfo.types.length; i++) {
			if ( !/^(any|boolean|float|int|string|object|void)$/.test(oLibInfo.types[i]) ) {
				jQuery.sap.declare(oLibInfo.types[i]);
			}
		}

		// create lazy imports for all controls and elements
		var aElements = oLibInfo.controls.concat(oLibInfo.elements);
		for (var i = 0; i < aElements.length; i++) {
			sap.ui.lazyRequire(aElements[i], "new extend getMetadata"); // TODO don't create an 'extend' stub for final classes
		}

		// include the library theme, but only if it has not been suppressed in library metadata or by configuration
		if ( !oLibInfo.noLibraryCSS) {

			// ensure to register correct library theme module path even when "preloadLibCss" prevents
			// including the library theme as controls might use it to calculate theme-specific URLs
			this._ensureThemeRoot(sLibName, this.sTheme);

			// also ensure correct theme root for the library's base theme which might be relevant in some cases
			// (e.g. IconPool which includes font files from sap.ui.core base theme)
			this._ensureThemeRoot(sLibName, "base");

			if (this.oConfiguration['preloadLibCss'].indexOf(sLibName) < 0) {
				// check for configured query parameters and use them
				var sQuery = this._getLibraryCssQueryParams(oLibInfo);

				this.includeLibraryTheme(sLibName, undefined, sQuery);
			}
		}

		// expose some legacy names
		oLibInfo.sName = oLibInfo.name;
		oLibInfo.aControls = oLibInfo.controls;

		// load and execute the library.js script
		if ( !jQuery.sap.isDeclared(sLibName + ".library") ) {
			// TODO redundant to generated require calls
			log.warning("Library Module " + sLibName + ".library" + " not loaded automatically", null, METHOD);
			jQuery.sap.require(sLibName + ".library");
		}

		this.fireLibraryChanged({name : sLibName, stereotype : "library", operation: "add", metadata : oLibInfo});

	};

	/**
	 * Includes a library theme into the current page (if a variant is specified it
	 * will include the variant library theme)
	 * @param {string} sLibName the name of the UI library
	 * @param {string} [sVariant] the variant to include (optional)
	 * @param {string} [sQuery] to be used only by the Core
	 * @public
	 */
	Core.prototype.includeLibraryTheme = function(sLibName, sVariant, sQuery) {
		jQuery.sap.assert(typeof sLibName === "string", "sLibName must be a string");
		jQuery.sap.assert(sVariant === undefined || typeof sVariant === "string", "sVariant must be a string or undefined");

		/*
		 * by specifiying a library name containing a colon (":") you can specify
		 * the file name of the CSS file to include (ignoring RTL)
		 */

		// include the stylesheet for the library (except for "classic" and "legacy" lib)
		if ((sLibName != "sap.ui.legacy") && (sLibName != "sap.ui.classic")) {

			// no variant?
			if (!sVariant) {
				sVariant = "";
			}

			// determine RTL
			var sRtl = (this.oConfiguration.getRTL() ? "-RTL" : "");

			// create the library file name
			var sLibFileName,
				sLibId = sLibName + (sVariant.length > 0 ? "-[" + sVariant + "]" : sVariant);
			if (sLibName && sLibName.indexOf(":") == -1) {
				sLibFileName = "library" + sVariant + sRtl;
			} else {
				sLibFileName = sLibName.substring(sLibName.indexOf(":") + 1) + sVariant;
				sLibName = sLibName.substring(0, sLibName.indexOf(":"));
			}

			// log and include
			var cssPathAndName = this._getThemePath(sLibName, this.sTheme) + sLibFileName + ".css" + (sQuery ? sQuery : "");
			jQuery.sap.log.info("Including " + cssPathAndName + " -  sap.ui.core.Core.includeLibraryTheme()");
			jQuery.sap.includeStyleSheet(cssPathAndName, "sap-ui-theme-" + sLibId);

			// if parameters have been used, update them with the new style sheet
			var Parameters = sap.ui.require("sap/ui/core/theming/Parameters");
			if (Parameters) {
				Parameters._addLibraryTheme(sLibId, cssPathAndName);
			}
		}

	};

	/**
	 * Returns a string containing query parameters for theme specific files.
	 *
	 * Used in Core#initLibrary and ThemeCheck#checkStyle.
	 *
	 * @param {object} oLibInfo Library info object (containing a "version" property)
	 * @return {string|undefined} query parameters or undefined if "versionedLibCss" config is "false"
	 * @private
	 */
	Core.prototype._getLibraryCssQueryParams = function(oLibInfo) {
		var sQuery;
		if (this.oConfiguration["versionedLibCss"] && oLibInfo) {
			sQuery = "?version=" + oLibInfo.version;

			// distribution version may not be available (will be loaded in Core constructor syncpoint2)
			if (Global.versioninfo) {
				sQuery += "&sap-ui-dist-version=" + Global.versioninfo.version;
			}
		}
		return sQuery;
	};

	/**
	 * Returns a map of library info objects for all currently loaded libraries,
	 * keyed by their names.
	 *
	 * The structure of the library info objects matches the structure of the info object
	 * that the {@link #initLibrary} method expects. Only property names documented with
	 * <code>initLibrary</code> should be accessed, any additional properties might change or
	 * disappear in future. When a property does not exists, its default value (as documented
	 * with <code>initLibrary</code>) should be assumed.
	 *
	 * <b>Note:</b> The returned info objects must not be modified. They might be a living
	 * copy of the internal data (for efficiency reasons) and the framework is not prepared
	 * to handle modifications to these objects.
	 *
	 * @return {map} Map of library info objects keyed by the library names.
	 * @public
	 */
	Core.prototype.getLoadedLibraries = function() {
		return jQuery.extend({}, this.mLibraries);
	};

	/**
	 * Retrieves a resource bundle for the given library and locale.
	 *
	 * If only one argument is given, it is assumed to be the libraryName. The locale
	 * then falls back to the current {@link sap.ui.core.Configuration#getLanguage session locale}.
	 * If no argument is given, the library also falls back to a default: "sap.ui.core".
	 *
	 * @param {string} [sLibraryName='sap.ui.core'] name of the library to retrieve the bundle for
	 * @param {string} [sLocale] locale to retrieve the resource bundle for
	 * @return {jQuery.sap.util.ResourceBundle} the best matching resource bundle for the given parameters or undefined
	 * @public
	 */
	Core.prototype.getLibraryResourceBundle = function(sLibraryName, sLocale) {
		jQuery.sap.assert((sLibraryName === undefined && sLocale === undefined) || typeof sLibraryName === "string", "sLibraryName must be a string or there is no argument given at all");
		jQuery.sap.assert(sLocale === undefined || typeof sLocale === "string", "sLocale must be a string or omitted");

		// TODO move implementation together with similar stuff to a new class "UILibrary"?
		sLibraryName = sLibraryName || "sap.ui.core";
		sLocale = sLocale || this.getConfiguration().getLanguage();
		var sKey = sLibraryName + "/" + sLocale;
		if (!this.mResourceBundles[sKey]) {
			var sURL = sap.ui.resource(sLibraryName, 'messagebundle.properties');
			this.mResourceBundles[sKey] = jQuery.sap.resources({url : sURL, locale : sLocale});
		}
		return this.mResourceBundles[sKey];
	};

	// ---- UIArea and Rendering -------------------------------------------------------------------------------------

	/**
	 * Implicitly creates a new <code>UIArea</code> (or reuses an exiting one) for the given DOM reference and
	 * adds the given control reference to the UIAreas content (existing content will be removed).
	 *
	 * @param {string|Element} oDomRef a DOM Element or Id (string) of the UIArea
	 * @param {sap.ui.base.Interface | sap.ui.core.Control}
	 *            oControl the Control that should be the added to the <code>UIArea</code>.
	 * @public
	 * @deprecated Use function <code>oControl.placeAt(oDomRef, "only")</code> of <code>sap.ui.core.Control</code> instead.
	 */
	Core.prototype.setRoot = function(oDomRef, oControl) {
		jQuery.sap.assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");
		jQuery.sap.assert(oControl instanceof Interface || oControl instanceof Control, "oControl must be a Control or Interface");

		if (oControl) {
			oControl.placeAt(oDomRef, "only");
		}
	};

	/**
	 * Creates a new sap.ui.core.UIArea.
	 *
	 * @param {string|Element} oDomRef a DOM Element or ID string of the UIArea
	 * @return {sap.ui.core.UIArea} a new UIArea
	 * @public
	 * @deprecated Use <code>setRoot()</code> instead!
	 */
	Core.prototype.createUIArea = function(oDomRef) {
		var that = this;
		jQuery.sap.assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");

		if (!oDomRef) {
			throw new Error("oDomRef must not be null");
		}

		// oDomRef might be (and actually IS in most cases!) a string (the ID of a DOM element)
		if (typeof (oDomRef) === "string") {
			var id = oDomRef;

			if (id == STATIC_UIAREA_ID) {
				oDomRef = this.getStaticAreaRef();
			} else {
				oDomRef = jQuery.sap.domById(oDomRef);
				if (!oDomRef) {
					throw new Error("DOM element with ID '" + id + "' not found in page, but application tries to insert content.");
				}
			}
		}

		// if the domref does not have an ID or empty ID => generate one
		if (!oDomRef.id || oDomRef.id.length == 0) {
			oDomRef.id = jQuery.sap.uid();
		}

		// create a new or fetch an existing UIArea
		var sId = oDomRef.id;
		if (!this.mUIAreas[sId]) {
			this.mUIAreas[sId] = new UIArea(this, oDomRef);
			if (!jQuery.isEmptyObject(this.oModels)) {
				var oProperties = {
					oModels: jQuery.extend({}, this.oModels),
					oBindingContexts: {},
					aPropagationListeners: []
				};
				that.mUIAreas[sId]._propagateProperties(true, that.mUIAreas[sId], oProperties, true);
			}
		} else {
			// this should solve the issue of 'recreation' of a UIArea
			// e.g. via setRoot with a new domRef
			this.mUIAreas[sId].setRootNode(oDomRef);
		}
		return this.mUIAreas[sId];
	};

	/**
	 * Returns a UIArea if the given ID/Element belongs to one.
	 *
	 * @public
	 * @param {string|Element} o a DOM Element or ID string of the UIArea
	 * @return {sap.ui.core.UIArea} a UIArea with a given id or dom ref.
	 */
	Core.prototype.getUIArea = function(o) {
		jQuery.sap.assert(typeof o === "string" || typeof o === "object", "o must be a string or object");

		var sId = "";
		if (typeof (o) == "string") {
			sId = o;
		} else {
			sId = o.id;
		}

		if (sId) {
			return this.mUIAreas[sId];
		}

		return null;
	};

	/**
	 * Informs the core about a UIArea that just became invalid.
	 *
	 * The core might use this information to minimize the set of
	 * re-rendered UIAreas. But for the time being it just registers
	 * a timer to trigger a re-rendering after the current event
	 * has been processed.
	 *
	 * @param {sap.ui.core.UIArea} oUIArea UIArea that just became invalid
	 * @private
	 */
	Core.prototype.addInvalidatedUIArea = function(oUIArea) {
		if ( !this._sRerenderTimer ) {
			oRenderLog.debug("Registering timer for delayed re-rendering");
			this._sRerenderTimer = jQuery.sap.delayedCall(0,this,"renderPendingUIUpdates"); // decoupled for collecting several invalidations into one redraw
		}
	};

	Core.MAX_RENDERING_ITERATIONS = 20;

	/**
	 * Asks all UIAreas to execute any pending rendering tasks.
	 *
	 * The execution of rendering tasks might require multiple iterations
	 * until either no more rendering tasks are produced or until
	 * MAX_RENDERING_ITERATIONS are reached.
	 *
	 * With a value of MAX_RENDERING_ITERATIONS=0 the loop can be avoided
	 * and the remaining tasks are executed after another timeout.
	 *
	 * @private
	 */
	Core.prototype.renderPendingUIUpdates = function(sCaller) {

		// start performance measurement
		oRenderLog.debug("Render pending UI updates: start (" + (sCaller || "by timer" ) + ")");

		jQuery.sap.measure.start("renderPendingUIUpdates","Render pending UI updates in all UIAreas");

		var bUIUpdated = false,
			bLooped = Core.MAX_RENDERING_ITERATIONS > 0,
			iLoopCount = 0;

		this._bRendering = true;

		do {

			if ( bLooped ) {
				// try to detect long running ('endless') rendering loops
				iLoopCount++;
				// if we run another iteration despite the tracking mode, we complain ourselves
				if ( iLoopCount > Core.MAX_RENDERING_ITERATIONS ) {
					this._bRendering = false;
					throw new Error("Rendering has been re-started too many times (" + iLoopCount + "). Add URL parameter sap-ui-xx-debugRendering=true for a detailed analysis.");
				}

				if ( iLoopCount > 1 ) {
					oRenderLog.debug("Render pending UI updates: iteration " + iLoopCount);
				}
			}

			// clear a pending timer so that the next call to re-render will create a new timer
			if (this._sRerenderTimer) {
				if ( this._sRerenderTimer !== this ) { // 'this' is used as a marker for a delayed initial rendering, no timer to cleanup then
					jQuery.sap.clearDelayedCall(this._sRerenderTimer); // explicitly stop the timer, as this call might be a synchronous call (applyChanges) while still a timer is running
				}
				this._sRerenderTimer = undefined;
			}

			this.runPrerenderingTasks();

			// avoid 'concurrent modifications' as IE8 can't handle them
			var mUIAreas = this.mUIAreas;
			for (var sId in mUIAreas) {
				bUIUpdated = mUIAreas[sId].rerender() || bUIUpdated;
			}

		} while ( bLooped && this._sRerenderTimer ); // iterate if there are new rendering tasks

		this._bRendering = false;

		// TODO: Provide information on what actually was re-rendered...
		if (bUIUpdated) {
			this.fireUIUpdated();
		}

		oRenderLog.debug("Render pending UI updates: finished");

		// end performance measurement
		jQuery.sap.measure.end("renderPendingUIUpdates");
	};


	/**
	 * Returns <code>true</code> if there are any pending rendering tasks or when
	 * such rendering tasks are currently being executed.
	 *
	 * @return {boolean} true if there are pending (or executing) rendering tasks.
	 * @public
	 */
	Core.prototype.getUIDirty = function() {
		return !!(this._sRerenderTimer || this._bRendering);
	};

	/**
	 * @name sap.ui.core.Core#UIUpdated
	 * @event
	 * @private
	 * @function
	 */

	Core.prototype.attachUIUpdated = function(fnFunction, oListener) {
		_oEventProvider.attachEvent(Core.M_EVENTS.UIUpdated, fnFunction, oListener);
	};

	Core.prototype.detachUIUpdated = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.UIUpdated, fnFunction, oListener);
	};

	Core.prototype.fireUIUpdated = function(mParameters) {
		_oEventProvider.fireEvent(Core.M_EVENTS.UIUpdated, mParameters);
	};

	/**
	 * Fired after a theme has been applied.
	 *
	 * More precisely, this event is fired when any of the following conditions is met:
	 * <ul>
	 *   <li>the initially configured theme has been applied after core init</li>
	 *   <li>the theme has been changed and is now applied (see {@link #applyTheme})</li>
	 *   <li>a library has been loaded dynamically after core init (e.g. with
	 *       <code>sap.ui.getCore().loadLibrary(...)</code> and the current theme
	 *       has been applied for it</li>
	 * </ul>
	 *
	 * @name sap.ui.core.Core#ThemeChanged
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.theme Theme name
	 * @public
	 */

	 /**
	 * Attach event-handler <code>fnFunction</code> to the <code>ThemeChanged</code> event of this <code>sap.ui.core.Core</code>.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function.
	 * @public
	 */
	Core.prototype.attachThemeChanged = function(fnFunction, oListener) {
		_oEventProvider.attachEvent(Core.M_EVENTS.ThemeChanged, fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the <code>ThemeChanged</code> event of this <code>sap.ui.core.Core</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            [oListener] Object on which the given function had to be called.
	 * @public
	 */
	Core.prototype.detachThemeChanged = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.ThemeChanged, fnFunction, oListener);
	};

	/**
	 * Fire event <code>ThemeChanged</code> to attached listeners.
	 *
	 * @param {object} [mParameters] Parameters to pass along with the event
	 * @param {object} [mParameters.theme] Theme name
	 * @protected
	 */
	Core.prototype.fireThemeChanged = function(mParameters) {
		jQuery.sap.scrollbarSize(true);

		// special hook for resetting theming parameters before the controls get
		// notified (lightweight coupling to static Parameters module)
		var Parameters = sap.ui.require("sap/ui/core/theming/Parameters");
		if (Parameters) {
			Parameters.reset(/* bOnlyWhenNecessary= */ true);
		}

		// notify all elements/controls via a pseudo browser event
		var sEventId = Core.M_EVENTS.ThemeChanged;
		var oEvent = jQuery.Event(sEventId);
		oEvent.theme = mParameters ? mParameters.theme : null;
		jQuery.each(this.mElements, function(sId, oElement) {
			oElement._handleEvent(oEvent);
		});

		jQuery.sap.act.refresh();

		// notify the listeners via a control event
		_oEventProvider.fireEvent(sEventId, mParameters);
	};

	/**
	 * Fired when a scope class has been added or removed on a control/element
	 * by using the custom style class API <code>addStyleClass</code>,
	 * <code>removeStyleClass</code> or <code>toggleStyleClass</code>.
	 *
	 * Scope classes are defined by the library theme parameters coming from the
	 * current theme.
	 *
	 * <b>Note:</b> The event will only be fired after the
	 * <code>sap.ui.core.theming.Parameters</code> module has been loaded.
	 * By default this is not the case.
	 *
	 * @name sap.ui.core.Core#themeScopingChanged
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string[]} oEvent.getParameters.scopes Array of the CSS scope classes
	 * @param {boolean} oEvent.getParameters.added Whether the class has been added or removed
	 * @param {sap.ui.core.Element} oEvent.getParameters.element Element instance on which the scope change happened
	 */

	Core.prototype.attachThemeScopingChanged = function(fnFunction, oListener) {
		_oEventProvider.attachEvent(Core.M_EVENTS.ThemeScopingChanged, fnFunction, oListener);
	};

	Core.prototype.detachThemeScopingChanged = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.ThemeScopingChanged, fnFunction, oListener);
	};

	Core.prototype.fireThemeScopingChanged = function(mParameters) {
		_oEventProvider.fireEvent(Core.M_EVENTS.ThemeScopingChanged, mParameters);
	};

	/**
	 * Fired when any of the localization relevant configuration settings has changed
	 * (e.g. language, rtl, formatLocale, datePattern, timePattern, numberSymbol, legacy formats).
	 *
	 * The parameter <code>changes</code> contains additional information about the change.
	 * It is a plain object that can contain one or more of the following properties
	 * <ul>
	 *   <li>language - the language setting has changed</li>
	 *   <li>rtl - the character orientation mode (aka 'LTR/RTL mode') has changed</li>
	 *   <li>formatLocale - the format locale has changed</li>
	 * </ul>
	 * (there might be other, currently undocumented settings)
	 *
	 * The value for each property will be the new corresponding setting.
	 *
	 * @name sap.ui.core.Core#localizationChanged
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {object} oEvent.getParameters.changes a map of the changed localization properties
	 * @public
	 */

	/**
	 * Register a listener for the <code>localizationChanged</code> event.
	 *
	 * @param {function} fnFunction callback to be called
	 * @param {object} oListener context object to cal lthe function on.
	 * @public
	 */
	Core.prototype.attachLocalizationChanged = function(fnFunction, oListener) {
		_oEventProvider.attachEvent(Core.M_EVENTS.LocalizationChanged, fnFunction, oListener);
	};

	/**
	 * Unregister a listener from the <code>localizationChanged</code> event.
	 *
	 * The listener will only be unregistered if the same function/context combination
	 * is given as in the call to <code>attachLocalizationListener</code>.
	 *
	 * @param {function} fnFunction callback to be deregistered
	 * @param {object} oListener context object given in a previous call to attachLocalizationChanged.
	 * @public
	 */
	Core.prototype.detachLocalizationChanged = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.LocalizationChanged, fnFunction, oListener);
	};

	/**
	 * @private
	 */
	Core.prototype.fireLocalizationChanged = function(mChanges) {
		var sEventId = Core.M_EVENTS.LocalizationChanged,
			oBrowserEvent = jQuery.Event(sEventId, {changes : mChanges}),
			fnAdapt = ManagedObject._handleLocalizationChange;

		jQuery.sap.log.info("localization settings changed: " + Object.keys(mChanges).join(","), null, "sap.ui.core.Core");

		/*
		 * Notify models that are able to handle a localization change
		 */
		jQuery.each(this.oModels, function(sName, oModel) {
			if ( oModel && oModel._handleLocalizationChange ) {
				oModel._handleLocalizationChange();
			}
		});

		/*
		 * Notify all UIAreas, Components, Elements to first update their models (phase 1)
		 * and then to update their bindings and corresponding data types (phase 2)
		 */
		function notifyAll(iPhase) {
			jQuery.each(this.mUIAreas, function() {
				fnAdapt.call(this, iPhase);
			});
			jQuery.each(this.mObjects["component"], function() {
				fnAdapt.call(this, iPhase);
			});
			jQuery.each(this.mElements, function() {
				fnAdapt.call(this, iPhase);
			});
		}

		notifyAll.call(this,1);
		notifyAll.call(this,2);

		// special handling for changes of the RTL mode
		if ( mChanges.rtl != undefined ) {
			// update the dir attribute of the document
			jQuery(document.documentElement).attr("dir", mChanges.rtl ? "rtl" : "ltr");
			// modify style sheet URLs
			this._updateThemeUrls(this.sTheme);
			// invalidate all UIAreas
			jQuery.each(this.mUIAreas, function() {
				this.invalidate();
			});
			jQuery.sap.log.info("RTL mode " + mChanges.rtl ? "activated" : "deactivated");
		}

		// notify Elements via a pseudo browser event (onlocalizationChanged, note the lower case 'l')
		jQuery.each(this.mElements, function(sId, oElement) {
			this._handleEvent(oBrowserEvent);
		});

		// notify registered Core listeners
		_oEventProvider.fireEvent(sEventId, {changes : mChanges});
	};

	/**
	 * Fired when the set of controls, elements etc. for a library has changed
	 * or when the set of libraries has changed.
	 *
	 * Note: while the parameters of this event could already describe <i>any</i> type of change,
	 * the set of reported changes is currently restricted to the addition of libraries,
	 * controls and elements. Future implementations might extend the set of reported
	 * changes. Therefore applications should already check the operation and stereotype
	 * parameters.
	 *
	 * @name sap.ui.core.Core#libraryChanged
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.name name of the newly added entity
	 * @param {string} [oEvent.getParameters.stereotype] stereotype of the newly added entity type ("control", "element")
	 * @param {string} [oEvent.getParameters.operation] type of operation ("add")
	 * @param {sap.ui.base.Metadata|object} [oEvent.getParameters.metadata] metadata for the added entity type.
	 *         Either an instance of sap.ui.core.ElementMetadata if it is a Control or Element, or a library info object
	 *         if it is a library. Note that the API of all metadata objects is not public yet and might change.
	 */

	/**
	 * Register a listener for the {@link sap.ui.core.Core#event:libraryChanged} event.
	 */
	Core.prototype.attachLibraryChanged = function(fnFunction, oListener) {
		_oEventProvider.attachEvent(Core.M_EVENTS.LibraryChanged, fnFunction, oListener);
	};

	/**
	 * Unregister a listener from the {@link sap.ui.core.Core#event:libraryChanged} event.
	 */
	Core.prototype.detachLibraryChanged = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.LibraryChanged, fnFunction, oListener);
	};

	/**
	 * @private
	 */
	Core.prototype.fireLibraryChanged = function(oParams) {
		// notify registered Core listeners
		_oEventProvider.fireEvent(Core.M_EVENTS.LibraryChanged, oParams);
	};

	/**
	 * Enforces an immediate update of the visible UI (aka "rendering").
	 *
	 * In general, applications should avoid calling this method and
	 * instead let the framework manage any necessary rendering.
	 * @public
	 */
	Core.prototype.applyChanges = function() {
		this.renderPendingUIUpdates("forced by applyChanges");
	};

	/**
	 * @private
	 */
	Core.prototype.registerElementClass = function(oMetadata) {
		var sName = oMetadata.getName(),
			sLibraryName = oMetadata.getLibraryName() || "",
			oLibrary = this.mLibraries[sLibraryName],
			sCategory = Control.prototype.isPrototypeOf(oMetadata.getClass().prototype) ? 'controls' : 'elements';

		// if library has not been loaded yet, create empty 'adhoc' library
		// don't set 'loaded' marker, so it might be loaded later
		if ( !oLibrary ) {

			// ensure namespace
			jQuery.sap.getObject(sLibraryName, 0);

			oLibrary = this.mLibraries[sLibraryName] = {
				name: sLibraryName,
				dependencies : [],
				types : [],
				interfaces : [],
				controls: [],
				elements : []
			};
		}

		if ( oLibrary[sCategory].indexOf(sName) < 0 ) {

			// add class to corresponding category in library ('elements' or 'controls')
			oLibrary[sCategory].push(sName);

			jQuery.sap.log.debug("Class " + oMetadata.getName() + " registered for library " + oMetadata.getLibraryName());
			this.fireLibraryChanged({name : oMetadata.getName(), stereotype : oMetadata.getStereotype(), operation: "add", metadata : oMetadata});
		}
	};

	/**
	 * Registers the given element. Must be called once during construction.
	 * @param {sap.ui.core.Element} oElement
	 * @private
	 */
	Core.prototype.registerElement = function(oElement) {

		var sId = oElement.getId(),
			oldElement = this.mElements[sId];

		if ( oldElement && oldElement !== oElement ) {
			if ( oldElement._sapui_candidateForDestroy ) {
				jQuery.sap.log.debug("destroying dangling template " + oldElement + " when creating new object with same ID");
				oldElement.destroy();
			} else {
				// duplicate ID detected => fail or at least log a warning
				if (this.oConfiguration.getNoDuplicateIds()) {
					jQuery.sap.log.error("adding element with duplicate id '" + sId + "'");
					throw new Error("Error: adding element with duplicate id '" + sId + "'");
				} else {
					jQuery.sap.log.warning("adding element with duplicate id '" + sId + "'");
				}
			}
		}

		this.mElements[sId] = oElement;

	};

	/**
	 * Deregisters the given element. Must be called once during destruction.
	 * @param {sap.ui.core.Element} oElement
	 * @private
	 */
	Core.prototype.deregisterElement = function(oElement) {
		delete this.mElements[oElement.getId()];
	};

	/**
	 * Registers the given object. Must be called once during construction.
	 * @param {sap.ui.base.ManagedObject} oObject the object instance
	 * @private
	 */
	Core.prototype.registerObject = function(oObject) {
		var sId = oObject.getId(),
			sType = oObject.getMetadata().getStereotype(),
			oldObject = this.getObject(sType, sId);

		if ( oldObject && oldObject !== oObject ) {
			jQuery.sap.log.error("adding object \"" + sType + "\" with duplicate id '" + sId + "'");
			throw new Error("Error: adding object \"" + sType + "\" with duplicate id '" + sId + "'");
		}

		this.mObjects[sType][sId] = oObject;
	};

	/**
	 * Deregisters the given object. Must be called once during destruction.
	 * @param {sap.ui.base.ManagedObject} oObject the object instance
	 * @private
	 */
	Core.prototype.deregisterObject = function(oObject) {
		var sId = oObject.getId(),
		  sType = oObject.getMetadata().getStereotype();
		delete this.mObjects[sType][sId];
	};


	/**
	 * Returns the registered element for the given id, if any.
	 * @param {string} sId
	 * @return {sap.ui.core.Element} the element for the given id
	 * @public
	 */
	Core.prototype.byId = function(sId) {
		jQuery.sap.assert(sId == null || typeof sId === "string", "sId must be a string when defined");
		// allow null, as this occurs frequently and it is easier to check whether there is a control in the end than
		// first checking whether there is an ID and then checking for a control

		/*
		// test alternative implementation
		function findById(sId, mUIAreas) {
			function _find(oControl) {
				if ( !oControl )
					return undefined;
				if ( oControl.getId() === sId ) {
					return oControl;
				}
				for (var n in oControl.mAggregations) {
					var a = oControl.mAggregations[n];
					if ( Array.isArray(a) ) {
						for (var i=0; i<a.length; i++) {
							var r = _find(a[i]);
							if ( r ) return r;
						}
					} else if ( a instanceof sap.ui.core.Element ) {
						var r = _find(a[i]);
						if ( r ) return r;
					}
				}
				return undefined;
			}

			//var t0=new Date().getTime();
			var r=undefined;
			for (var n in mUIAreas) {
				r=_find(mUIAreas[n].getRootControl()); //TODO: Adapt to mUIAreas[n].getContent
				if ( r ) break;
			}
			//var t1=new Date().getTime();
			//t=t+(t1-t0);
			return r;
		}

		if ( findById(sId, this.mUIAreas) !== this.mElements[sId] ) {
			jQuery.sap.log.error("failed to resolve " + sId + " (" + this.mElements[sId] + ")");
		}
		*/
		return sId == null ? undefined : this.mElements[sId];
	};

	/**
	 * Returns the registered element for the given ID, if any.
	 * @param {string} sId
	 * @return {sap.ui.core.Element} the element for the given id
	 * @deprecated use <code>sap.ui.core.Core.byId</code> instead!
	 * @function
	 * @public
	 */
	Core.prototype.getControl = Core.prototype.byId;

	/**
	 * Returns the registered element for the given ID, if any.
	 * @param {string} sId
	 * @return {sap.ui.core.Element} the element for the given id
	 * @deprecated use <code>sap.ui.core.Core.byId</code> instead!
	 * @function
	 * @public
	 */
	Core.prototype.getElementById = Core.prototype.byId;

	/**
	 * Returns the registered object for the given id, if any.
	 * @param {string} sType
	 * @param {string} sId
	 * @return {sap.ui.core.Component} the component for the given id
	 * @private
	 */
	Core.prototype.getObject = function(sType, sId) {
		jQuery.sap.assert(sId == null || typeof sId === "string", "sId must be a string when defined");
		jQuery.sap.assert(this.mObjects[sType] !== undefined, "sType must be a supported stereotype");
		return sId == null ? undefined : this.mObjects[sType] && this.mObjects[sType][sId];
	};

	/**
	 * Returns the registered component for the given id, if any.
	 * @param {string} sId
	 * @return {sap.ui.core.Component} the component for the given id
	 * @public
	 */
	Core.prototype.getComponent = function(sId) {
		return this.getObject("component", sId);
	};

	/**
	 * Returns the registered template for the given id, if any.
	 * @param {string} sId
	 * @return {sap.ui.core.Component} the template for the given id
	 * @public
	 * @deprecated Since 1.29.1 Require 'sap/ui/core/tmpl/Template' and use {@link sap.ui.core.tmpl.Template.byId Template.byId} instead.
	 */
	Core.prototype.getTemplate = function(sId) {
		var Template = sap.ui.requireSync('sap/ui/core/tmpl/Template');
		return Template.byId(sId);
	};

	/**
	 * Returns the static, hidden area DOM element belonging to this core instance.
	 *
	 * It can be used e.g. for hiding elements like Popups, Shadow, Blocklayer etc.
	 *
	 * If it is not yet available, a DIV is created and appended to the body.
	 *
	 * @return {Element} the static, hidden area DOM element belonging to this core instance.
	 * @throws {Error} an Error if the document is not yet ready
	 * @public
	 */
	Core.prototype.getStaticAreaRef = function() {
		var oStatic = jQuery.sap.domById(STATIC_UIAREA_ID);
		if (!oStatic) {
			if (!this.bDomReady) {
				throw new Error("DOM is not ready yet. Static UIArea cannot be created.");
			}

			var oAttributes = {id:STATIC_UIAREA_ID};

			if (jQuery("body").attr("role") != "application") {
				// Only set ARIA application role if not available on html body (see configuration entry "autoAriaBodyRole")
				oAttributes.role = "application";
			}

			var leftRight = this.getConfiguration().getRTL() ? "right" : "left";
			oStatic = jQuery("<DIV/>", oAttributes).css({
				"height"   : "0",
				"width"    : "0",
				"overflow" : "hidden",
				"float"    : leftRight
			}).prependTo(document.body)[0];

			// TODO Check whether this is sufficient
			this.createUIArea(oStatic).bInitial = false;
		}
		return oStatic;
	};

	/**
	 * Used to find out whether a certain DOM element is the static area
	 *
	 * @param {object} oDomRef
	 * @return {boolean} whether the given DomRef is the StaticAreaRef
	 * @protected
	 */
	Core.prototype.isStaticAreaRef = function(oDomRef) {
		return oDomRef && (oDomRef.id === STATIC_UIAREA_ID);
	};

	/**
	 * Interval for central interval timer.
	 * @private
	 */
	Core._I_INTERVAL = 200;

	/**
	 * Obsolete but kept for backward compatibility.
	 * Note that the ResizeHandler has been required above, so we can access it here.
	 * @private
	 * @name sap.ui.core.ResizeHandler#I_INTERVAL
	 */
	ResizeHandler.prototype.I_INTERVAL = Core._I_INTERVAL;

	/**
	 * Registers a listener to the central interval timer.
	 *
	 * @param {function} fnFunction callback to be called periodically
	 * @param {object} [oListener] optional context object to call the callback on.
	 * @since 1.16.0
	 * @public
	 */
	Core.prototype.attachIntervalTimer = function(fnFunction, oListener) {
		if (!this.oTimedTrigger) {
			var IntervalTrigger = sap.ui.requireSync("sap/ui/core/IntervalTrigger");
			this.oTimedTrigger = new IntervalTrigger(Core._I_INTERVAL);
		}
		this.oTimedTrigger.addListener(fnFunction, oListener);
	};

	/**
	 * Unregisters a listener for the central interval timer.
	 *
	 * A listener will only be unregistered if the same function/context combination
	 * is given as in the attachIntervalTimer call.
	 *
	 * @param {function} fnFunction function to unregister
	 * @param {object} [oListener] context object given during registration
	 * @since 1.16.0
	 * @public
	 */
	Core.prototype.detachIntervalTimer = function(fnFunction, oListener) {
		if (this.oTimedTrigger) {
			this.oTimedTrigger.removeListener(fnFunction, oListener);
		}
	};

	/**
	 * Registers a listener for control events.
	 *
	 * @param {function} fnFunction callback to be called for each control event
	 * @param {object} [oListener] optional context object to call the callback on.
	 * @public
	 */
	Core.prototype.attachControlEvent = function(fnFunction, oListener) {
		_oEventProvider.attachEvent(Core.M_EVENTS.ControlEvent, fnFunction, oListener);
	};

	/**
	 * Unregisters a listener for control events.
	 *
	 * A listener will only be unregistered if the same function/context combination
	 * is given as in the attachControlEvent call.
	 *
	 * @param {function} fnFunction function to unregister
	 * @param {object} [oListener] context object given during registration
	 * @public
	 */
	Core.prototype.detachControlEvent = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.ControlEvent, fnFunction, oListener);
	};

	/**
	 * Notifies the listeners that an event on a control occurs
	 * @param {map} mParameters { browserEvent: jQuery.EventObject }
	 * @private
	 */
	Core.prototype.fireControlEvent = function(mParameters) {
		_oEventProvider.fireEvent(Core.M_EVENTS.ControlEvent, mParameters);
	};

	/**
	 * Handles a control event and forwards it to the registered control event listeners.
	 *
	 * @param {jQuery.Event} oEvent control event
	 * @param {string} sUIAreaId id of the UIArea that received the event
	 * @private
	 */
	Core.prototype._handleControlEvent = function(/**event*/oEvent, sUiAreaId) {
		// Create a copy of the event
		var oEventClone = jQuery.Event(oEvent.type);
		jQuery.extend(oEventClone, oEvent);
		oEventClone.originalEvent = undefined;

		this.fireControlEvent({"browserEvent": oEventClone, "uiArea": sUiAreaId});
	};


	/**
	 * Returns the instance of the application (if exists).
	 *
	 * @return {sap.ui.app.Application} instance of the current application
	 * @public
	 * @deprecated Since 1.15.1. The Component class is enhanced to take care about the Application code.
	 */
	Core.prototype.getApplication = function() {
		/* eslint-disable no-undef */
		return sap.ui.getApplication && sap.ui.getApplication();
		/* eslint-enable no-undef */
	};

	/**
	 * Registers a Plugin to the <code>sap.ui.core.Core</code>, which lifecycle
	 * will be managed (start and stop).
	 * <br/>
	 * Plugin object need to implement two methods:
	 * <ul>
	 *   <li><code>startPlugin(oCore)</code>: will be invoked, when the Plugin
	 *       should start (as parameter the reference to the Core will be provided</li>
	 *   <li><code>stopPlugin()</code>: will be invoked, when the Plugin should stop</li>
	 * </ul>
	 *
	 * @param {object} oPlugin reference to a Plugin object
	 * @public
	 */
	Core.prototype.registerPlugin = function(oPlugin) {
		jQuery.sap.assert(typeof oPlugin === "object", "oPlugin must be an object");

		// check for a valid plugin
		if (!oPlugin) {
			return;
		}

		// check if the plugin is already registered
		// if yes, the exit this function
		for (var i = 0, l = this.aPlugins.length; i < l; i++) {
			if (this.aPlugins[i] === oPlugin) {
				return;
			}
		}

		// register the plugin (keep the plugin in the plugin array)
		this.aPlugins.push(oPlugin);

		// if the Core is initialized also start the plugin
		if (this.bInitialized && oPlugin && oPlugin.startPlugin) {
			oPlugin.startPlugin(this);
		}

	};

	/**
	 * Unregisters a Plugin out of the <code>sap.ui.core.Core</code>
	 *
	 * @param {object} oPlugin reference to a Plugin object
	 * @public
	 */
	Core.prototype.unregisterPlugin = function(oPlugin) {
		jQuery.sap.assert(typeof oPlugin === "object", "oPlugin must be an object");

		// check for a valid plugin
		if (!oPlugin) {
			return;
		}

		// check if the plugin is already registered
		var iPluginIndex = -1;
		for (var i = this.aPlugins.length; i--; i >= 0) {
			if (this.aPlugins[i] === oPlugin) {
				iPluginIndex = i;
				break;
			}
		}

		// plugin was not registered!
		if (iPluginIndex == -1) {
			return;
		}

		// stop the plugin
		if (this.bInitialized && oPlugin && oPlugin.stopPlugin) {
			oPlugin.stopPlugin(this);
		}

		// remove the plugin
		this.aPlugins.splice(iPluginIndex, 1);

	};

	/**
	 * Internal method to start all registered plugins
	 * @private
	 */
	Core.prototype.startPlugins = function() {
		for (var i = 0, l = this.aPlugins.length; i < l; i++) {
			var oPlugin = this.aPlugins[i];
			if (oPlugin && oPlugin.startPlugin) {
				oPlugin.startPlugin(this, /* onInit*/ true);
			}
		}
	};

	/**
	 * Internal method to stop all registered plugins
	 * @private
	 */
	Core.prototype.stopPlugins = function() {
		for (var i = 0, l = this.aPlugins.length; i < l; i++) {
			var oPlugin = this.aPlugins[i];
			if (oPlugin && oPlugin.stopPlugin) {
				oPlugin.stopPlugin(this);
			}
		}
	};

	/**
	 * Sets or unsets a model for the given model name.
	 *
	 * The <code>sName</code> must either be <code>undefined</code> (or omitted) or a non-empty string.
	 * When the name is omitted, the default model is set/unset.
	 *
	 * When <code>oModel</code> is <code>null</code> or <code>undefined</code>, a previously set model
	 * with that name is removed from the Core.
	 *
	 * Any change (new model, removed model) is propagated to all existing UIAreas and their descendants
	 * as long as a descendant doesn't have its own model set for the given name.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * @param {sap.ui.model.Model} oModel the model to be set or <code>null</code> or <code>undefined</code>
	 * @param {string} [sName] the name of the model or <code>undefined</code>
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.setModel = function(oModel, sName) {
		jQuery.sap.assert(oModel == null || lazyInstanceof(oModel, 'sap/ui/model/Model'), "oModel must be an instance of sap.ui.model.Model, null or undefined");
		jQuery.sap.assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
		var that = this,
			oProperties;

		if (!oModel && this.oModels[sName]) {
			delete this.oModels[sName];
			if (jQuery.isEmptyObject(that.oModels) && jQuery.isEmptyObject(that.oBindingContexts)) {
				oProperties = ManagedObject._oEmptyPropagatedProperties;
			} else {
				oProperties = {
					oModels: jQuery.extend({}, that.oModels),
					oBindingContexts: {},
					aPropagationListeners: []
				};
			}
			// propagate Models to all UI areas
			jQuery.each(this.mUIAreas, function (i, oUIArea){
				if (oModel != oUIArea.getModel(sName)) {
					oUIArea._propagateProperties(sName, oUIArea, oProperties, false, sName);
				}
			});
		} else if (oModel && oModel !== this.oModels[sName] ) {
			this.oModels[sName] = oModel;
			// propagate Models to all UI areas
			jQuery.each(this.mUIAreas, function (i, oUIArea){
				if (oModel != oUIArea.getModel(sName)) {
					var oProperties = {
						oModels: jQuery.extend({}, that.oModels),
						oBindingContexts: {},
						aPropagationListeners: []
					};
					oUIArea._propagateProperties(sName, oUIArea, oProperties, false, sName);
				}
			});
		} //else nothing to do
		return this;
	};

	Core.prototype.setMessageManager = function(oMessageManager) {
		this.oMessageManager = oMessageManager;
	};

	/**
	 * Returns the active <code>MessageManager</code> instance.
	 *
	 * @return {sap.ui.core.message.MessageManager}
	 * @public
	 * @since 1.33.0
	 */
	Core.prototype.getMessageManager = function() {
		if (!this.oMessageManager) {
			this.oMessageManager = new MessageManager();
		}
		return this.oMessageManager;
	};

	/**
	 * Returns a list of all controls with a field group ID.
	 * See {@link sap.ui.core.Control#checkFieldGroupIds Control.prototype.checkFieldGroupIds} for a description of the
	 * <code>vFieldGroupIds</code> parameter.
	 *
	 * @param {string|string[]} [vFieldGroupIds] ID of the field group or an array of field group IDs to match
	 * @return {sap.ui.core.Control[]} The list of controls with matching field group IDs
	 * @public
	 */
	Core.prototype.byFieldGroupId = function(vFieldGroupIds) {
		var aResult = [];
		for (var n in this.mElements) {
			var oElement = this.mElements[n];
			if (oElement instanceof Control && oElement.checkFieldGroupIds(vFieldGroupIds)) {
				aResult.push(oElement);
			}
		}
		return aResult;
	};

	/**
	 * Get the model with the given model name.
	 *
	 * The name can be omitted to reference the default model or it must be a non-empty string.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * @param {string|undefined} [sName] name of the model to be retrieved
	 * @return {sap.ui.model.Model} oModel
	 * @public
	 */
	Core.prototype.getModel = function(sName) {
		jQuery.sap.assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
		return this.oModels[sName];
	};

	/**
	 * Check if a Model is set to the core
	 * @return {boolean} true or false
	 * @public
	 */
	Core.prototype.hasModel = function() {
		return !jQuery.isEmptyObject(this.oModels);
	};

	/**
	 * Returns the event bus.
	 * @return {sap.ui.core.EventBus} the event bus
	 * @since 1.8.0
	 * @public
	 */
	Core.prototype.getEventBus = function() {
		if (!this.oEventBus) {
			var EventBus = sap.ui.requireSync('sap/ui/core/EventBus');
			this.oEventBus = new EventBus();
		}
		return this.oEventBus;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'validationError' event of <code>sap.ui.core.Core</code>.<br/>
	 * Please note that this event is a bubbling event and may already be canceled before reaching the core.<br/>
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, this Model is used.
	 *
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.attachValidationError = function(oData, fnFunction, oListener) {
		if (typeof (oData) === "function") {
			oListener = fnFunction;
			fnFunction = oData;
			oData = undefined;
		}
		_oEventProvider.attachEvent(Core.M_EVENTS.ValidationError, oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'validationError' event of <code>sap.ui.core.Core</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The callback function to unregister
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.detachValidationError = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.ValidationError, fnFunction, oListener);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'parseError' event of <code>sap.ui.core.Core</code>.<br/>
	 * Please note that this event is a bubbling event and may already be canceled before reaching the core.<br/>
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, this Model is used.
	 *
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.attachParseError = function(oData, fnFunction, oListener) {
		if (typeof (oData) === "function") {
			oListener = fnFunction;
			fnFunction = oData;
			oData = undefined;
		}
		_oEventProvider.attachEvent(Core.M_EVENTS.ParseError, oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'parseError' event of <code>sap.ui.core.Core</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The callback function to unregister.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.detachParseError = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.ParseError, fnFunction, oListener);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'formatError' event of <code>sap.ui.core.Core</code>.<br/>
	 * Please note that this event is a bubbling event and may already be canceled before reaching the core.<br/>
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, this Model is used.
	 *
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.attachFormatError = function(oData, fnFunction, oListener) {
		if (typeof (oData) === "function") {
			oListener = fnFunction;
			fnFunction = oData;
			oData = undefined;
		}
		_oEventProvider.attachEvent(Core.M_EVENTS.FormatError, oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'formatError' event of <code>sap.ui.core.Core</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The callback function to unregister
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.detachFormatError = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.FormatError, fnFunction, oListener);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'validationSuccess' event of <code>sap.ui.core.Core</code>.<br/>
	 * Please note that this event is a bubbling event and may already be canceled before reaching the core.<br/>
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, this Model is used.
	 *
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.attachValidationSuccess = function(oData, fnFunction, oListener) {
		if (typeof (oData) === "function") {
			oListener = fnFunction;
			fnFunction = oData;
			oData = undefined;
		}
		_oEventProvider.attachEvent(Core.M_EVENTS.ValidationSuccess, oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'validationSuccess' event of <code>sap.ui.core.Core</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @public
	 */
	Core.prototype.detachValidationSuccess = function(fnFunction, oListener) {
		_oEventProvider.detachEvent(Core.M_EVENTS.ValidationSuccess, fnFunction, oListener);
		return this;
	};


	/**
	 * Fire event parseError to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
	 * <li>'property' of type <code>string</code> </li>
	 * <li>'type' of type <code>string</code> </li>
	 * <li>'newValue' of type <code>object</code> </li>
	 * <li>'oldValue' of type <code>object</code> </li>
	 * <li>'exception' of type <code>object</code> </li>
	 * </ul>
	 *
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @protected
	 */
	Core.prototype.fireParseError = function(mArguments) {
		_oEventProvider.fireEvent(Core.M_EVENTS.ParseError, mArguments);
		return this;
	};

	/**
	 * The 'parseError' event is fired when input parsing fails.
	 *
	 * @name sap.ui.core.Core#parseError
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the parse error occurred
	 * @param {string} oControlEvent.getParameters.property The property name of the element where the parse error occurred
	 * @param {sap.ui.model.Type} oControlEvent.getParameters.type The type of the property
	 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the parse error occurred
	 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the parse error)
	 * @param {object} oControlEvent.getParameters.exception The exception object which occurred and has more information about the parse error
	 * @public
	 */

	/**
	 * Fire event validationError to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
	 * <li>'property' of type <code>string</code> </li>
	 * <li>'type' of type <code>string</code> </li>
	 * <li>'newValue' of type <code>object</code> </li>
	 * <li>'oldValue' of type <code>object</code> </li>
	 * <li>'exception' of type <code>object</code> </li>
	 * </ul>
	 *
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @protected
	 */
	Core.prototype.fireValidationError = function(mArguments) {
		_oEventProvider.fireEvent(Core.M_EVENTS.ValidationError, mArguments);
		return this;
	};

	/**
	 * The 'validationError' event is fired when validation of the input fails.
	 *
	 * @name sap.ui.core.Core#validationError
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the validation error occurred
	 * @param {string} oControlEvent.getParameters.property The property name of the element where the validation error occurred
	 * @param {sap.ui.model.Type} oControlEvent.getParameters.type The type of the property
	 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the validation error occurred
	 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the validation error)
	 * @param {object} oControlEvent.getParameters.exception The exception object which occurred and has more information about the validation error
	 * @public
	 */

	/**
	 * Fire event formatError to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
	 * <li>'property' of type <code>string</code> </li>
	 * <li>'type' of type <code>string</code> </li>
	 * <li>'newValue' of type <code>object</code> </li>
	 * <li>'oldValue' of type <code>object</code> </li>
	 * <li>'exception' of type <code>object</code> </li>
	 * </ul>
	 *
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @protected
	 */
	Core.prototype.fireFormatError = function(mArguments) {
		_oEventProvider.fireEvent(Core.M_EVENTS.FormatError, mArguments);
		return this;
	};

	/**
	 * The 'formatError' event is fired when a value formatting fails. This can happen when a value stored in the model cannot be formatted to be displayed in an element property.
	 *
	 * @name sap.ui.core.Core#formatError
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the format error occurred
	 * @param {string} oControlEvent.getParameters.property The property name of the element where the format error occurred
	 * @param {sap.ui.model.Type} oControlEvent.getParameters.type The type of the property
	 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the format error occurred
	 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the format error)
	 * @param {object} oControlEvent.getParameters.exception The exception object which occurred and has more information about the format error
	 * @public
	 */

	/**
	 * Fire event validationSuccess to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'element' of type <code>sap.ui.core.Element</code> </li>
	 * <li>'property' of type <code>string</code> </li>
	 * <li>'type' of type <code>string</code> </li>
	 * <li>'newValue' of type <code>object</code> </li>
	 * <li>'oldValue' of type <code>object</code> </li>
	 * </ul>
	 *
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @return {sap.ui.core.Core} <code>this</code> to allow method chaining
	 * @protected
	 */
	Core.prototype.fireValidationSuccess = function(mArguments) {
		_oEventProvider.fireEvent(Core.M_EVENTS.ValidationSuccess, mArguments);
		return this;
	};

	/**
	 * The 'validationSuccess' event is fired when a value validation was successfully completed.
	 *
	 * @name sap.ui.core.Core#validationSuccess
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {sap.ui.core.Element} oControlEvent.getParameters.element The Element where the successful validation occurred
	 * @param {string} oControlEvent.getParameters.property The property name of the element where the successfull validation occurred
	 * @param {sap.ui.model.Type} oControlEvent.getParameters.type The type of the property
	 * @param {object} oControlEvent.getParameters.newValue The value of the property which was entered when the validation occurred
	 * @param {object} oControlEvent.getParameters.oldValue The value of the property which was present before a new value was entered (before the validation)
	 * @public
	 */

	/**
	 * Check if the script is running on mobile
	 * @return {boolean} true or false
	 * @public
	 */
	Core.prototype.isMobile = function() {
		return Device.browser.mobile;
	};

	/**
	 * Friendly function to access the provider from outside the core
	 * This is needed for UIArea to set the core as the top level eventing parent
	 * @returns {*}
	 * @private
	 */
	Core.prototype._getEventProvider = function() {
		return _oEventProvider;
	};

	/**
	 * Adds a task that is guaranteed to run once, just before the next rendering. Triggers a
	 * rendering request, so that this happens as soon as possible.
	 *
	 * @param {function} fnPrerenderingTask
	 *   A function that is called before the rendering
	 * @param {boolean} [bFirst=false]
	 *   Whether the task should become the first one, not the last one
	 * @private
	 */
	Core.prototype.addPrerenderingTask = function (fnPrerenderingTask, bFirst) {
		if (bFirst) {
			this.aPrerenderingTasks.unshift(fnPrerenderingTask);
		} else {
			this.aPrerenderingTasks.push(fnPrerenderingTask);
		}
		this.addInvalidatedUIArea(); // to trigger rendering
	};

	/**
	 * Runs all prerendering tasks and resets the list.
	 * @private
	 */
	Core.prototype.runPrerenderingTasks = function () {
		var aTasks = this.aPrerenderingTasks.slice();

		this.aPrerenderingTasks = [];
		aTasks.forEach(function (fnPrerenderingTask) {
			fnPrerenderingTask();
		});
	};

	Core.prototype.destroy = function() {
		this.oFocusHandler.destroy();
		_oEventProvider.destroy();
		BaseObject.prototype.destroy.call(this);
	};

	/**
	 * @name sap.ui.core.CorePlugin
	 * @interface Contract for plugins that want to extend the core runtime
	 */

	/**
	 * Called by the Core after it has been initialized.
	 * If a plugin is added to the core after its initialization, then
	 * this method is called during registration of the plugin.
	 *
	 * Implementing this method is optional for a plugin.
	 *
	 * @name sap.ui.core.CorePlugin.prototype.startPlugin
	 * @param {sap.ui.core.Core} oCore reference to the core
	 * @param {boolean} bOnInit whether the hook is called during Core.init() or later
	 * @function
	 */

	/**
	 * Called by the Core when it is shutdown or when a plugin is
	 * deregistered from the core.
	 *
	 * Implementing this method is optional for a plugin.
	 *
	 * @name sap.ui.core.CorePlugin.prototype.stopPlugin
	 * @param {sap.ui.core.Core} oCore reference to the core
	 * @function
	 */


	/**
	 * Displays the control tree with the given root inside the area of the given
	 * DOM reference (or inside the DOM node with the given ID) or in the given Control.
	 *
	 * Example:
	 * <pre>
	 *   &lt;div id="SAPUI5UiArea">&lt;/div>
	 *   &lt;script>
	 *     var oRoot = new sap.ui.commons.Label();
	 *     oRoot.setText("Hello world!");
	 *     sap.ui.setRoot("SAPUI5UiArea", oRoot);
	 *   &lt;/script>
	 * </pre>
	 * <p>
	 *
	 * This is a shortcut for <code>sap.ui.getCore().setRoot()</code>.
	 *
	 * Internally, if a string is given that does not identify a UIArea or a control
	 * then implicitly a new <code>UIArea</code> is created for the given DOM reference
	 * and the given control is added.
	 *
	 * @param {string|Element|sap.ui.core.Control} oDomRef a DOM Element or Id String of the UIArea
	 * @param {sap.ui.base.Interface | sap.ui.core.Control}
	 *            oControl the Control that should be added to the <code>UIArea</code>.
	 * @public
	 * @deprecated Use function <code>placeAt</code> of <code>sap.ui.core.Control</code> instead.
	 */
	sap.ui.setRoot = function(oDomRef, oControl) {
		jQuery.sap.assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");
		jQuery.sap.assert(oControl instanceof Interface || oControl instanceof Control, "oControl must be a Control or Interface");

		sap.ui.getCore().setRoot(oDomRef, oControl);
	};


	/*
	 * Create a new (the only) instance of the Core and return it's interface as module value.
	 *
	 * Do not export the module value under the global name!
	 *
	 * Note that the Core = EventProvider.extend() call above already exposes sap.ui.core.Core.
	 * This is needed for backward compatibility reason, in case some other code tries to enhance
	 * the core prototype. Once global names are switched off, such extension scnearios are
	 * no longer supported.
	 */
	return new Core().getInterface();

});
