/*!
 * ${copyright}
 */

// Provides the real core class sap.ui.core.Core of SAPUI5
sap.ui.define([
	"./AnimationMode",
	"./ControlBehavior",
	"./ElementRegistry",
	"./ElementMetadata",
	"./Lib",
	"./Rendering",
	"./RenderManager",
	"./UIArea",
	"./Supportability",
	"./Theming",
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Event",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/util/Deferred",
	"sap/base/util/Version",
	"sap/ui/Device",
	"sap/ui/VersionInfo",
	"sap/ui/base/EventProvider",
	"sap/ui/base/Object",
	"sap/ui/base/syncXHRFix",
	"sap/ui/core/support/Hotkeys",
	"sap/ui/core/util/_LocalizationHelper",
	"sap/ui/dom/getComputedStyleFix",
	"sap/ui/performance/Measurement",
	"sap/ui/performance/trace/initTraces",
	"sap/ui/security/FrameOptions",
	"sap/ui/security/Security",
	"sap/ui/test/RecorderHotkeyListener",
	"sap/ui/thirdparty/jquery",
	// side effect: activates paste event fix
	"sap/ui/events/PasteEventFix",
	// side effect: install event simulation
	"sap/ui/events/jquery/EventSimulation",
	// side effect: make global URI available
	"sap/ui/thirdparty/URI",
	// side effect: jQuery.fn.position
	"sap/ui/thirdparty/jqueryui/jquery-ui-position"
],
	function(
		AnimationMode,
		ControlBehavior,
		ElementRegistry,
		ElementMetadata,
		Library,
		Rendering,
		RenderManager,
		UIArea,
		Supportability,
		Theming,
		assert,
		BaseConfig,
		BaseEvent,
		Log,
		Formatting,
		Localization,
		Deferred,
		Version,
		Device,
		VersionInfo,
		EventProvider,
		BaseObject,
		syncXHRFix,
		Hotkeys,
		_LocalizationHelper,
		getComputedStyleFix,
		Measurement,
		initTraces,
		FrameOptions,
		Security,
		RecorderHotkeyListener,
		jQuery
		/* jQuery.sap, PasteEventFix, EventSimulation, URI, jquery-ui-position */
	) {
		"use strict";

		var oCore;

		// getComputedStyle polyfill + syncXHR fix for firefox
		if ( Device.browser.firefox ) {
			getComputedStyleFix();
			syncXHRFix();
		}

		if (BaseConfig.get({
			name: "sapUiNoConflict",
			type: BaseConfig.Type.Boolean,
			freeze: true
		})){
			jQuery.noConflict();
		}


		const oJQVersion = Version(jQuery.fn.jquery);
		if ( oJQVersion.compareTo("3.6.0") != 0 ) {
			// if the loaded jQuery version isn't SAPUI5's default version -> notify
			// the application
			Log.warning("SAPUI5's default jQuery version is 3.6.0; current version is " + jQuery.fn.jquery + ". Please note that we only support version 3.6.0.");
		}

		sap.ui.loader._.logger = Log.getLogger("sap.ui.ModuleSystem",
			BaseConfig.get({
				name: "sapUiXxDebugModuleLoading",
				type: BaseConfig.Type.Boolean,
				external: true,
				freeze: true
			}) ? Log.Level.DEBUG : Math.min(Log.getLevel(), Log.Level.INFO));

		//init Hotkeys for support tools
		Hotkeys.init();
		RecorderHotkeyListener.init();

		// Initialize SAP Passport or FESR
		initTraces();

		/**
		 * EventProvider instance, EventProvider is no longer extended
		 * @private
		 */
		var _oEventProvider;

		/**
		 * Execute configured init module
		 */
		var _executeInitModule = function() {
			var vOnInit = BaseConfig.get({
				name: "sapUiOnInit",
				type: (vValue) => {
					if (typeof vValue === "string" || typeof vValue === "function") {
						return vValue;
					} else {
						throw new TypeError("unsupported value");
					}
				}
			});
			if (vOnInit) {
				if (typeof vOnInit === "string") {
					// determine onInit being a module name prefixed via module or a global name
					var aResult = /^module\:((?:[_$.\-a-zA-Z0-9]+\/)*[_$.\-a-zA-Z0-9]+)$/.exec(vOnInit);
					if (aResult && aResult[1]) {
						// ensure that the require is done async and the Core is finally booted!
						setTimeout(sap.ui.require.bind(null, [aResult[1]]), 0);
					} else if (typeof globalThis[vOnInit] === "function") {
						globalThis[vOnInit]();
					} else {
						throw Error("Invalid init module " + vOnInit + " provided via config option 'sapUiOnInit'");
					}
				} else {
					vOnInit();
				}
			}
		};

		/**
		 * Returns the waiting behavior for the initial theme loading.
		 * Possible values are:
		 * <ul>
		 * <li>undefined (default):
		 *     By default neither the initialization of the SAPUI5 Core nor the first rendering
		 *     wait for the configured theme to be loaded.
		 * </li>
		 * <li>"rendering":
		 *      The first (initial) rendering of the application will be delayed until the theme
		 *      has been loaded and applied (until Core.isThemeApplied()).
		 *      Helps to avoid FOUC (flash of unstyled content).
		 * </li>
		 * <li>"init":
		 *      Same as "rendering", but additionally delays the init event of theSAPUI5 Core until
		 *      the configured theme has been loaded. Application code that waits for this event can
		 *      then rely on the theming information to be present,
		 *      e.g. for calling sap.ui.core.theming.Parameters.get
		 * </li>
		 * </ul>
		 *
		 * @returns {string} the configured waiting behavior for the initial theme loading
		 */
		function getWaitForTheme() {
			var sWaitForTheme = BaseConfig.get({name: "sapUiXxWaitForTheme", type: BaseConfig.Type.String, external: true}).toLowerCase();

			if (sWaitForTheme === "true" ) {
				sWaitForTheme = "rendering";
			}
			if ( sWaitForTheme !== "rendering" && sWaitForTheme !== "init" ) {
				// invalid value or false from legacy boolean setting
				sWaitForTheme = undefined;
			}

			return sWaitForTheme;
		}

		function ui5ToRJS(sName) {
			if ( /^jquery\.sap\./.test(sName) ) {
				return sName;
			}
			return sName.replace(/\./g, "/");
		}

		/*
		 * Internal class that can help to synchronize a set of asynchronous tasks.
		 * Each task must be registered in the sync point by calling startTask with
		 * an (purely informative) title. The returned value must be used in a later
		 * call to finishTask.
		 * When finishTask has been called for all tasks that have been started,
		 * the fnCallback will be fired.
		 * When a timeout is given and reached, the callback is called at that
		 * time, no matter whether all tasks have been finished or not.
		 */
		var SyncPoint = function (sName, fnCallback) {
			var aTasks = [],
				iOpenTasks = 0,
				iFailures = 0;

			this.startTask = function(sTitle) {
				var iId = aTasks.length;
				aTasks[iId] = { name : sTitle, finished : false };
				iOpenTasks++;
				return iId;
			};

			this.finishTask = function(iId, bSuccess) {
				if ( !aTasks[iId] || aTasks[iId].finished ) {
					throw new Error("trying to finish non existing or already finished task");
				}
				aTasks[iId].finished = true;
				iOpenTasks--;
				if ( bSuccess === false ) {
					iFailures++;
				}
				if ( iOpenTasks === 0 ) {
					Log.info("Sync point '" + sName + "' finished (tasks:" + aTasks.length + ", open:" + iOpenTasks + ", failures:" + iFailures + ")");
					finish();
				}
			};

			function finish() {
				if ( fnCallback ) {
					fnCallback(iOpenTasks, iFailures);
				}
				fnCallback = null;
			}

			Log.info("Sync point '" + sName + "' created");
		};

		/**
		 * @class Core Class of the SAP UI Library.
		 *
		 * This class boots the Core framework and makes it available for the application
		 * by requiring <code>sap.ui.core.Core</code>.
		 *
		 * The Core provides a {@link #ready ready function} to execute code after the core was booted.
		 *
		 * Example:
		 * <pre>
		 *
		 *   oCore.ready(function() {
		 *       ...
		 *   });
		 *
		 *   await oCore.ready();
		 *   ...
		 *
		 * </pre>
		 *
		 * @extends sap.ui.base.Object
		 * @final
		 * @author SAP SE
		 * @version ${version}
		 * @alias sap.ui.core.Core
		 * @public
		 * @hideconstructor
		 */
		var Core = BaseObject.extend("sap.ui.core.Core", /** @lends sap.ui.core.Core.prototype */ {
			constructor : function() {
				BaseObject.call(this);

				var that = this,
					METHOD = "sap.ui.core.Core";

				// when a Core instance has been created before, don't create another one
				if (oCore) {
					Log.error("Only the framework must create an instance of sap/ui/core/Core." +
							  " To get access to its functionality, require sap/ui/core/Core," +
							  " and use the module export directly without using 'new'.");
					return oCore;
				}

				_oEventProvider = new EventProvider();

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
				 * Whether the core is ready
				 * @private
				 */
				this.bReady = false;

				/**
				 * Available plugins in the order of registration.
				 * @private
				 */
				this.aPlugins = [];

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

				Object.defineProperty(this, "mElements", {
					get: function() {
						Log.error("oCore.mElements was a private member and has been removed. Use one of the methods in sap.ui.core.ElementRegistry instead");
						return ElementRegistry.all(); // this is a very costly snapshot!
					},
					configurable: false
				});

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
					"template": {}
				};

				/**
				 * Ready Promise
				 * @private
				 */
				this.pReady = new Deferred();

				/**
				 * Whether the legacy library has to be loaded.
				 * @private
				 */
				this.bInitLegacyLib = false;

				Log.info("Creating Core",null,METHOD);

				Measurement.start("coreComplete", "Core.js - complete");
				Measurement.start("coreBoot", "Core.js - boot");
				Measurement.start("coreInit", "Core.js - init");

				// freeze Config
				var GlobalConfigurationProvider = sap.ui.require("sap/base/config/GlobalConfigurationProvider");
				GlobalConfigurationProvider.freeze();

				// register resourceRoots
				const paths = {};
				const oResourceRoots = BaseConfig.get({
					name: "sapUiResourceRoots",
					type: BaseConfig.Type.MergedObject
				}) ?? {};
				for (const n in oResourceRoots) {
					paths[ui5ToRJS(n)] = oResourceRoots[n] || ".";
				}
				sap.ui.loader.config({paths: paths});

				// initialize frameOptions script (anti-clickjacking, etc.)
				var oFrameOptionsConfig = BaseConfig.get({
					name: "sapUiFrameOptionsConfig",
					type: BaseConfig.Type.Object
				});
				oFrameOptionsConfig.mode = Security.getFrameOptions();
				oFrameOptionsConfig.allowlistService = Security.getAllowlistService();
				this.oFrameOptions = new FrameOptions(oFrameOptionsConfig);

				// let Element and Component get friend access to the respective register/deregister methods
				this._grantFriendAccess();

				// handle libraries & modules
				this.aModules = BaseConfig.get({
					name: "sapUiModules",
					type: BaseConfig.Type.StringArray
				}) ?? [];
				this.aLibs = BaseConfig.get({
					name: "sapUiLibs",
					type: BaseConfig.Type.StringArray
				}) ?? [];

				// as modules could also contain libraries move it to aLibs!
				this.aModules = this.aModules.filter((module) => {
					const m = module.match(/^(.*)\.library$/);
					if (m) {
						this.aLibs.push(m[1]);
					} else {
						return module;
					}
				});

				// enforce the core library as the first loaded module
				var i = this.aLibs.indexOf("sap.ui.core");
				if ( i != 0 ) {
					if ( i > 0 ) {
						this.aLibs.splice(i,1);
					}
					this.aLibs.unshift("sap.ui.core");
				}

				var sPreloadMode = Library.getPreloadMode();
				// This flag controls the core initialization flow.
				// We can switch to async when an async preload is used or the ui5loader
				// is in async mode. The latter might also happen for debug scenarios
				// where no preload is used at all.
				var bAsync = sPreloadMode === "async" || sap.ui.loader.config().async;

				// adding the following classList is done here for compatibility reasons
				document.documentElement.classList.add("sapUiTheme-" + Theming.getTheme());
				Log.info("Declared theme " + Theming.getTheme(), null, METHOD);

				Log.info("Declared modules: " + this.aModules, METHOD);

				Log.info("Declared libraries: " + this.aLibs, METHOD);

				_LocalizationHelper.init();

				this._setupBrowser();

				this._setupOS();

				this._setupAnimation();


				// create accessor to the Core API early so that initLibrary and others can use it
				// sync point 1 synchronizes document ready and rest of UI5 boot
				var oSyncPoint1 = new SyncPoint("UI5 Document Ready", function(iOpenTasks, iFailures) {
					that.init();
				});
				var iDocumentReadyTask = oSyncPoint1.startTask("document.ready");
				var iCoreBootTask = oSyncPoint1.startTask("preload and boot");

				var fnContentLoadedCallback = function() {
					Log.trace("document is ready");
					oSyncPoint1.finishTask(iDocumentReadyTask);
					document.removeEventListener("DOMContentLoaded", fnContentLoadedCallback);
				};

				// immediately execute callback if the ready state is already 'complete'
				if (document.readyState !== "loading") {
					fnContentLoadedCallback();
				} else {
					// task 1 is to wait for document.ready
					document.addEventListener("DOMContentLoaded", fnContentLoadedCallback);
				}

				// sync point 2 synchronizes all library preloads and the end of the bootstrap script
				var oSyncPoint2 = new SyncPoint("UI5 Core Preloads and Bootstrap Script", function(iOpenTasks, iFailures) {
					Log.trace("Core loaded: open=" + iOpenTasks + ", failures=" + iFailures);
					that._boot(bAsync, function() {
						oSyncPoint1.finishTask(iCoreBootTask);
						Measurement.end("coreBoot");
					});
				});

				// a helper task to prevent the premature completion of oSyncPoint2
				var iCreateTasksTask = oSyncPoint2.startTask("create sp2 tasks task");

				// load the version info file in case of a custom theme to determine
				// the distribution version which should be provided in library.css requests.
				if (Library.getVersionedLibCss()) {
					var iVersionInfoTask = oSyncPoint2.startTask("load version info");

					var fnCallback = function(oVersionInfo) {
						if (oVersionInfo) {
							Log.trace("Loaded \"sap-ui-version.json\".");
						} else {
							Log.error("Could not load \"sap-ui-version.json\".");
						}
						oSyncPoint2.finishTask(iVersionInfoTask);
					};

					// use async mode if library preload is async
					if ( bAsync ) {
						VersionInfo.load().then(fnCallback, function(oError) {
							Log.error("Unexpected error when loading \"sap-ui-version.json\": " + oError);
							oSyncPoint2.finishTask(iVersionInfoTask);
						});
					} else {
						fnCallback(sap.ui.getVersionInfo({ async: bAsync, failOnError: false })); // legacy-relevant: sync path
					}
				}

				this._polyfillFlexbox();

				// when the bootstrap script has finished, it calls require("sap/ui/core/Core").boot()
				var iBootstrapScriptTask = oSyncPoint2.startTask("bootstrap script");
				this.boot = function() {
					if (this.bBooted) {
						return;
					}
					this.bBooted = true;
					postConstructorTasks.call(this);
					oSyncPoint2.finishTask(iBootstrapScriptTask);
				};

				function postConstructorTasks() {
					// when a boot task is configured, add it to syncpoint2
					var fnCustomBootTask = BaseConfig.get({
						name: "sapUiXxBootTask",
						type: BaseConfig.Type.Function
					});
					if ( fnCustomBootTask ) {
						var iCustomBootTask = oSyncPoint2.startTask("custom boot task");
						fnCustomBootTask( function(bSuccess) {
							oSyncPoint2.finishTask(iCustomBootTask, typeof bSuccess === "undefined" || bSuccess === true );
						});
					}

					if ( sPreloadMode === "sync" || sPreloadMode === "async" ) {
						var pLibraryPreloaded = Library._load(that.aLibs, {
							sync: !bAsync,
							preloadOnly: true
						});

						if ( bAsync ) {
							var iPreloadLibrariesTask = oSyncPoint2.startTask("preload bootstrap libraries");
							pLibraryPreloaded.then(function() {
								oSyncPoint2.finishTask(iPreloadLibrariesTask);
							}, function() {
								oSyncPoint2.finishTask(iPreloadLibrariesTask, false);
							});
						}
					}

					// initializes the application cachebuster mechanism if configured
					var aACBConfig = BaseConfig.get({
						name: "sapUiAppCacheBuster",
						type: BaseConfig.Type.StringArray,
						external: true,
						freeze: true
					});
					if (aACBConfig && aACBConfig.length > 0) {
						if ( bAsync ) {
							var iLoadACBTask = oSyncPoint2.startTask("require AppCachebuster");
							sap.ui.require(["sap/ui/core/AppCacheBuster"], function(AppCacheBuster) {
								AppCacheBuster.boot(oSyncPoint2, aACBConfig);
								// finish the task only after ACB had a chance to create its own task(s)
								oSyncPoint2.finishTask(iLoadACBTask);
							});
						}
					}

					// Initialize support info stack
					if (Supportability.getSupportSettings() !== null) {
						var iSupportInfoTask = oSyncPoint2.startTask("support info script");

						var fnCallbackSupportBootstrapInfo = function(Support, Bootstrap) {
							Support.initializeSupportMode(Supportability.getSupportSettings(), bAsync);

							Bootstrap.initSupportRules(Supportability.getSupportSettings());

							oSyncPoint2.finishTask(iSupportInfoTask);
						};

						if (bAsync) {
							sap.ui.require(["sap/ui/core/support/Support", "sap/ui/support/Bootstrap"], fnCallbackSupportBootstrapInfo, function (oError) {
								Log.error("Could not load support mode modules:", oError);
							});
						}
					}

					// Initialize test tools
					if (Supportability.getTestRecorderSettings() !== null) {
						var iTestRecorderTask = oSyncPoint2.startTask("test recorder script");

						var fnCallbackTestRecorder = function (Bootstrap) {
							Bootstrap.init(Supportability.getTestRecorderSettings());
							oSyncPoint2.finishTask(iTestRecorderTask);
						};

						if (bAsync) {
							sap.ui.require([
								"sap/ui/testrecorder/Bootstrap"
							], fnCallbackTestRecorder, function (oError) {
								Log.error("Could not load test recorder:", oError);
							});
						}
					}

					oSyncPoint2.finishTask(iCreateTasksTask);
				}
			},

			metadata : {
				// while this list contains mostly public methods,
				// a set of private API is exposed for sap.ui.core restricted usage
				publicMethods: [
					// @public
					//  - Ready Promise
					"ready",

					// @private, @ui5-restricted sap.ui.core
					//  - Init
					"boot",

					// @deprecated
					"getConfiguration",
					"isMobile",
					//  - Init & Plugins
					"isInitialized","attachInit",
					"lock", "unlock","isLocked",
					"attachInitEvent",
					"registerPlugin","unregisterPlugin",
					//  - Application/Root-Component
					"setRoot",
					"getRootComponent", "getApplication",
					//  - legacy registries & factories
					"getControl", "getComponent", "getTemplate",
					"createComponent",
					//  - Control dev.
					"getCurrentFocusedControlId",
					"getEventBus",
					"byId",
					"attachIntervalTimer", "detachIntervalTimer",
					"getElementById", "byFieldGroupId",
					//  - Libraries
					"getLoadedLibraries", "loadLibrary", "initLibrary",
					"getLibraryResourceBundle",
					"attachLibraryChanged", "detachLibraryChanged",
					"loadLibraries",
					//  - Models & Messaging
					"setModel", "getModel", "hasModel",
					"getMessageManager",
					//  - Events
					"attachEvent","detachEvent",
					"attachControlEvent", "detachControlEvent",
					"attachParseError", "detachParseError",
					"attachValidationError", "detachValidationError",
					"attachFormatError", "detachFormatError",
					"attachValidationSuccess", "detachValidationSuccess",
					"attachLocalizationChanged", "detachLocalizationChanged",
					"fireFormatError", "fireValidationSuccess", "fireValidationError", "fireParseError",
					//  - UIArea & Rendering
					"getStaticAreaRef",
					"isStaticAreaRef",
					"createRenderManager",
					"createUIArea", "getUIArea", "getUIDirty", "applyChanges",
					"getRenderManager",
					"addPrerenderingTask",
					//  - Theming
					"applyTheme","setThemeRoot","attachThemeChanged","detachThemeChanged",
					"isThemeApplied",
					"notifyContentDensityChanged",
					"attachThemeScopingChanged","detachThemeScopingChanged","fireThemeScopingChanged",
					"includeLibraryTheme"
				]
			}

		});

		/**
		 * Map of event names and ids, that are provided by this class
		 * @private
		 */
		Core.M_EVENTS = {ControlEvent: "ControlEvent", UIUpdated: "UIUpdated", ThemeChanged: "ThemeChanged", ThemeScopingChanged: "themeScopingChanged", LocalizationChanged: "localizationChanged",
				LibraryChanged : "libraryChanged",
				ValidationError : "validationError", ParseError : "parseError", FormatError : "formatError", ValidationSuccess : "validationSuccess"};

		/**
		 * The core allows some friend components to register/deregister themselves
		 * @private
		 */
		Core.prototype._grantFriendAccess = function() {
			// grant ElementMetadata "friend" access to Core for registration
			ElementMetadata.prototype.register = function(oMetadata) {
				Library._registerElement(oMetadata);
			};
		};

		/**
		 * Set the body's browser-related attributes.
		 * @private
		 */
		Core.prototype._setupBrowser = function() {
			var METHOD = "sap.ui.core.Core";

			//set the browser for CSS attribute selectors. do not move this to the onload function because Safari does not
			//use the classes
			var html = document.documentElement;

			var b = Device.browser;
			var id = b.name;

			if (id) {
				if (id === b.BROWSER.SAFARI && b.mobile) {
					id = "m" + id;
				}
				id = id + (b.version === -1 ? "" : Math.floor(b.version));
				html.dataset.sapUiBrowser = id;
				Log.debug("Browser-Id: " + id, null, METHOD);
			}
		};

		/**
		 * Set the body's OS-related attribute and CSS class
		 * @private
		 */
		Core.prototype._setupOS = function() {
			var html = document.documentElement;

			html.dataset.sapUiOs = Device.os.name + Device.os.versionStr;

			var osCSS = null;
			switch (Device.os.name) {
				case Device.os.OS.IOS:
					osCSS = "sap-ios";
					break;
				case Device.os.OS.ANDROID:
					osCSS = "sap-android";
					break;
			}
			if (osCSS) {
				html.classList.add(osCSS);
			}
		};

		/**
		 * Set the body's Animation-related attribute and configures jQuery animations accordingly.
		 * @private
		 */
		Core.prototype._setupAnimation = function() {
			function adaptAnimationMode() {
				var html = document.documentElement;
				var sAnimationMode = ControlBehavior.getAnimationMode();
				html.dataset.sapUiAnimationMode = sAnimationMode;
				var bAnimation = (sAnimationMode !== AnimationMode.minimal && sAnimationMode !== AnimationMode.none);
				html.dataset.sapUiAnimation = bAnimation ? "on" : "off";
				if (typeof jQuery !== "undefined") {
					jQuery.fx.off = !bAnimation;
				}
			}
			ControlBehavior.attachChange(function(oEvent) {
				if (oEvent.animationMode) {
					adaptAnimationMode();
				}
			});
			adaptAnimationMode();
		};

		/**
		 * Initializes the jQuery.support.useFlexBoxPolyfill property
		 * @private
		 */
		Core.prototype._polyfillFlexbox = function() {};

		/**
		 * Boots the core and injects the necessary CSS and JavaScript files for the library.
		 * Applications shouldn't call this method. It is automatically called by the bootstrap scripts (e.g. sap-ui-core.js)
		 *
		 * @param {boolean} bAsync - Flag if modules should be loaded asynchronously
		 * @param {function} fnCallback - Callback after modules have been loaded
		 * @returns {undefined|Promise}
		 * @private
		 */
		Core.prototype._boot = function(bAsync, fnCallback) {
			// add CalendarClass to list of modules
			this.aModules.push("sap/ui/core/date/" + Formatting.getCalendarType());

			// load all modules now
			if ( bAsync ) {
				return this._requireModulesAsync().then(function() {
					fnCallback();
				});
			}

			Log.warning("Modules and libraries declared via bootstrap-configuration are loaded synchronously. Set preload configuration to" +
				" 'async' or switch to asynchronous bootstrap to prevent these requests.", "SyncXHR", null, function() {
				return {
					type: "SyncXHR",
					name: "legacy-module"
				};
			});

			this.aLibs.forEach( function(lib) {
				Library._load(lib, {
					sync: true
				});
			});

			fnCallback();
		};

		Core.prototype._requireModulesAsync = function() {
			var aModules = [];

			this.aModules.forEach(function(sModule) {
				// data-sap-ui-modules might contain legacy jquery.sap.* modules
				aModules.push(/^jquery\.sap\./.test(sModule) ? sModule : sModule.replace(/\./g, "/"));
			});

			// TODO: require libs and modules in parallel or define a sequence?
			return Promise.all([
				Library._load(this.aLibs),
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
		 * @deprecated since 1.119. Please use {@link module:sap/ui/core/Theming.setTheme Theming.setTheme} instead.
		 * @public
		 */
		Core.prototype.applyTheme = function(sThemeName, sThemeBaseUrl) {
			assert(typeof sThemeName === "string", "sThemeName must be a string");
			assert(typeof sThemeBaseUrl === "string" || typeof sThemeBaseUrl === "undefined", "sThemeBaseUrl must be a string or undefined");

			if (sThemeBaseUrl) {
				Theming.setThemeRoot(sThemeName, sThemeBaseUrl);
			}
			Theming.setTheme(sThemeName);
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
		 * This will cause the Belize theme to be loaded from the UI5 location for all standard libraries.
		 * Resources for styling the <code>my.own.library</code> controls will be loaded from the configured
		 * location:
		 * <pre>
		 *   https://sdk.openui5.org/resources/sap/ui/core/themes/sap_belize/library.css
		 *   https://sdk.openui5.org/resources/sap/ui/layout/themes/sap_belize/library.css
		 *   https://sdk.openui5.org/resources/sap/m/themes/sap_belize/library.css
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
		 * @param {boolean} [bForceUpdate=false] Force updating URLs of currently loaded theme
		 * @return {this} the Core, to allow method chaining
		 * @since 1.10
		 * @deprecated since 1.119
		 * @public
		 */
		Core.prototype.setThemeRoot = function(sThemeName, aLibraryNames, sThemeBaseUrl, bForceUpdate) {
			if (typeof aLibraryNames === "string") {
				bForceUpdate = sThemeBaseUrl;
				sThemeBaseUrl  = aLibraryNames;
				aLibraryNames = undefined;
			}
			Theming.setThemeRoot(sThemeName, sThemeBaseUrl, aLibraryNames, bForceUpdate);
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

			// provide core for event handling and UIArea creation
			UIArea.setCore(this);

			var METHOD = "sap.ui.core.Core.init()";

			Log.info("Initializing",null,METHOD);

			Measurement.end("coreInit");

			var sWaitForTheme = getWaitForTheme();

			// If there is no waitForTheme or ThemeManager is already available and theme is loaded render directly sync
			if (this.isThemeApplied() || !sWaitForTheme) {
				this._executeInitialization();
			} else {
				Rendering.suspend();


				if (sWaitForTheme === "rendering") {
					Rendering.notifyInteractionStep();
					this._executeInitialization();
					Rendering.getLogger().debug("delay initial rendering until theme has been loaded");
					Theming.attachAppliedOnce(function() {
						Rendering.resume("after theme has been loaded");
					});
				} else if (sWaitForTheme === "init") {
					Rendering.getLogger().debug("delay init event and initial rendering until theme has been loaded");
					Rendering.notifyInteractionStep();
					Theming.attachAppliedOnce(function() {
						this._executeInitialization();
						Rendering.resume("after theme has been loaded");
					}.bind(this));
				}
			}
		};

		Core.prototype._executeInitialization = function() {
			// chain ready to be the firstone that is executed
			var METHOD = "sap.ui.core.Core.init()"; // Because it's only used from init
			if (this.bInitialized) {
				return;
			}
			this.bInitialized = true;
			Log.info("Initialized",null,METHOD);

			// start the plugins
			Log.info("Starting Plugins",null,METHOD);
			this.startPlugins();
			Log.info("Plugins started",null,METHOD);

			_executeInitModule();
			this.pReady.resolve();
			this.bReady = true;
		};

		/**
		 * Returns true if the Core has already been initialized. This means that instances
		 * of RenderManager etc. do already exist and the init event has already been fired
		 * (and will not be fired again).
		 *
		 * @return {boolean} whether the Core has already been initialized
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.core.Core.ready Core.ready} instead.
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
		 * @deprecated since 1.119: Please use {@link module:sap/ui/core/Theming.attachApplied Theming.attachApplied} instead.
		 * @public
		 */
		Core.prototype.isThemeApplied = function() {
			var bApplied = false;
			function fnCheckApplied() {
				bApplied = true;
			}
			// if theme is applied fnCheckApplied is called sync
			Theming.attachAppliedOnce(fnCheckApplied);
			return bApplied;
		};

		/**
		 * Attach to 'applied' event of theming in order to keep existing core event 'ThemeChanged' stable
		 */
		Theming.attachApplied(function(oEvent) {
			// notify the listeners via a control event
			_oEventProvider && _oEventProvider.fireEvent(Core.M_EVENTS.ThemeChanged, BaseEvent.getParameters(oEvent));
		});

		/**
		 * Retrieves a resource bundle for the given library and locale.
		 *
		 * If only one argument is given, it is assumed to be the libraryName. The locale
		 * then falls back to the current {@link module:sap/base/i18n/Localization.getLanguage session locale}.
		 * If no argument is given, the library also falls back to a default: "sap.ui.core".
		 *
		 * <h3>Configuration via App Descriptor</h3>
		 * When the App Descriptor for the library is available without further request (manifest.json
		 * has been preloaded) and when the App Descriptor is at least of version 1.9.0 or higher, then
		 * this method will evaluate the App Descriptor entry <code>"sap.ui5" / "library" / "i18n"</code>.
		 * <ul>
		 * <li>When the entry is <code>true</code>, a bundle with the default name "messagebundle.properties"
		 * will be loaded</li>
		 * <li>If it is a string, then that string will be used as name of the bundle</li>
		 * <li>If it is <code>false</code>, no bundle will be loaded and the result will be
		 *     <code>undefined</code></li>
		 * </ul>
		 *
		 * <h3>Caching</h3>
		 * Once a resource bundle for a library has been loaded, it will be cached by this method.
		 * Further calls for the same library and locale won't create new requests, but return the already
		 * loaded bundle. There's therefore no need for control code to cache the returned bundle for a longer
		 * period of time. Not further caching the result also prevents stale texts after a locale change.
		 *
		 * <h3>Asynchronous Loading</h3>
		 * The asynchronous variant of {@link #loadLibrary} will evaluate the same descriptor entry as
		 * described above. If it is not <code>false</code>, loading the main resource bundle of the
		 * library will become a subtask of the asynchronous loading of the library.
		 *
		 * Due to this preload of the main bundle and the caching behavior of this method, controls in
		 * such a library still can use the synchronous variant of <code>getLibraryResourceBundle</code>
		 * in their API, behavior and rendering code. Only when the bundle is needed at module execution
		 * time (by top level code in a control module), then the asynchronous variant of this method
		 * should be preferred.
		 *
		 * @param {string} [sLibraryName='sap.ui.core'] Name of the library to retrieve the bundle for
		 * @param {string} [sLocale] Locale to retrieve the resource bundle for
		 * @param {boolean} [bAsync=false] Whether the resource bundle is loaded asynchronously
		 * @ui5-omissible-params sLocale
		 * @returns {module:sap/base/i18n/ResourceBundle|undefined|Promise<module:sap/base/i18n/ResourceBundle|undefined>} The best matching resource bundle for the given
		 *   parameters or <code>undefined</code>; in asynchronous case a Promise on that bundle is returned
		 * @public
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Lib.getResourceBundleFor Lib.getResourceBundleFor} instead.
		 */
		Core.prototype.getLibraryResourceBundle = function(sLibraryName, sLocale, bAsync) {
			if (typeof sLibraryName === "boolean") {
				bAsync = sLibraryName;
				sLibraryName = undefined;
				sLocale = undefined;
			}

			if (typeof sLocale === "boolean") {
				bAsync = sLocale;
				sLocale = undefined;
			}

			assert((sLibraryName === undefined && sLocale === undefined) || typeof sLibraryName === "string", "sLibraryName must be a string or there is no argument given at all");
			assert(sLocale === undefined || typeof sLocale === "string", "sLocale must be a string or omitted");

			sLibraryName = sLibraryName || "sap.ui.core";
			var oLib = Library._get(sLibraryName || "sap.ui.core", true /* bCreate */);
			return oLib._loadResourceBundle(sLocale, !bAsync);
		};

		/**
		* Attaches event handler <code>fnFunction</code> to the {@link #event:ThemeChanged ThemeChanged} event
		* of this <code>sap.ui.core.Core</code>.
		*
		* When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
		* if specified, otherwise it will be bound to a dummy event provider object.
		*
		* @param {function}
		*            fnFunction The function to be called, when the event occurs
		* @param {object}
		*            [oListener] Context object to call the event handler with. Defaults to a dummy event
		*            provider object
		* @public
		* @deprecated since 1.118. See {@link module:sap/ui/core/Theming.attachApplied Theming.attachApplied} instead.
		*/
		Core.prototype.attachThemeChanged = function(fnFunction, oListener) {
			// preparation for letting the "themeChanged" event be forwarded from the ThemeManager to the Core
			_oEventProvider.attachEvent(Core.M_EVENTS.ThemeChanged, fnFunction, oListener);
		};

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:ThemeChanged ThemeChanged} event
		 * of this <code>sap.ui.core.Core</code>.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The function to be called, when the event occurs
		 * @param {object}
		 *            [oListener] Object on which the given function had to be called.
		 * @public
		 * @deprecated since 1.118. See {@link module:sap/ui/core/Theming.detachApplied Theming#detachApplied} instead.
		 */
		Core.prototype.detachThemeChanged = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.ThemeChanged, fnFunction, oListener);
		};

		Core.prototype.attachThemeScopingChanged = function(fnFunction, oListener) {
			_oEventProvider.attachEvent(Core.M_EVENTS.ThemeScopingChanged, fnFunction, oListener);
		};

		Core.prototype.detachThemeScopingChanged = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.ThemeScopingChanged, fnFunction, oListener);
		};

		Theming.attachThemeScopingChanged(function(oEvent) {
			_oEventProvider.fireEvent(Core.M_EVENTS.ThemeScopingChanged, BaseEvent.getParameters(oEvent));
		});

		Library.attachLibraryChanged(function(oEvent) {
			// notify registered Core listeners
			_oEventProvider.fireEvent(Core.M_EVENTS.LibraryChanged, oEvent.getParameters());
		});

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
				Log.error("adding object \"" + sType + "\" with duplicate id '" + sId + "'");
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
		 * Returns the registered object for the given ID, if any.
		 *
		 * @param {string} sType Stereotype of the object to retrieve
		 * @param {sap.ui.core.ID|null|undefined} sId ID of the object to retrieve
		 * @returns {sap.ui.base.ManagedObject|undefined} Object of the given type and with the given ID or undefined
		 * @private
		 */
		Core.prototype.getObject = function(sType, sId) {
			assert(sId == null || typeof sId === "string", "sId must be a string when defined");
			assert(this.mObjects[sType] !== undefined, "sType must be a supported stereotype");
			return sId == null ? undefined : this.mObjects[sType] && this.mObjects[sType][sId];
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
		 * Friendly function to access the provider from outside the core.
		 *
		 * This is needed for UIArea to set the core as the top level eventing parent.
		 *
		 * @returns {*}
		 * @private
		 */
		Core.prototype._getEventProvider = function() {
			return _oEventProvider;
		};

		/** Returns a Promise that resolves if the Core is initialized.
		 *
		 * @param {function():void} [fnReady] If the Core is ready the function will be called immediately, otherwise when the ready Promise resolves.
		 * @returns {Promise<undefined>} The ready promise
		 * @since 1.118.0
		 * @public
		 */
		Core.prototype.ready = function(fnReady) {
			if (fnReady) {
				if (this.bReady) {
					fnReady();
				} else {
					this.pReady.promise.then(fnReady);
				}
			}
			return this.pReady.promise;
		};

		Core.prototype.destroy = function() {
			RenderManager.detachPreserveContent(this._preserveHandler);
			_oEventProvider.destroy();
			BaseObject.prototype.destroy.call(this);
		};

		/**
		 * @name sap.ui.core.CorePlugin
		 * @interface Contract for plugins that want to extend the core runtime
		 */

		/**
		 * Called by the Core after it has been initialized.
		 *
		 * If a plugin is added to the core after its initialization, then
		 * this method is called during registration of the plugin.
		 *
		 * Implementing this method is optional for a plugin.
		 *
		 * @name sap.ui.core.CorePlugin.prototype.startPlugin
		 * @param {sap.ui.core.Core} oCore Reference to the core
		 * @param {boolean} bOnInit Whether the hook is called during Core.init() or later
		 * @function
		 */

		/**
		 * Called by the Core when it is shutdown or when a plugin is
		 * deregistered from the core.
		 *
		 * Implementing this method is optional for a plugin.
		 *
		 * @name sap.ui.core.CorePlugin.prototype.stopPlugin
		 * @param {sap.ui.core.Core} oCore Reference to the core
		 * @function
		 */


		/*
		 * Create a new (the only) instance of the Core and return it's interface as module value.
		 *
		 * Do not export the module value under the global name!
		 *
		 * Note that the Core = EventProvider.extend() call above already exposes sap.ui.core.Core.
		 * This is needed for backward compatibility reason, in case some other code tries to enhance
		 * the core prototype. Once global names are switched off, such extension scenarios are
		 * no longer supported.
		 */
		oCore = new Core().getInterface();
		return oCore;
	});