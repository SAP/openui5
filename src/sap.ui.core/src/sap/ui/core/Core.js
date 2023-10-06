/*!
 * ${copyright}
 */

// Provides the real core class sap.ui.core.Core of SAPUI5
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/Device',
	'sap/ui/base/EventProvider',
	'sap/ui/base/Interface',
	'sap/ui/base/Object',
	'sap/ui/base/ManagedObject',
	'./AnimationMode',
	'./Component',
	'./Configuration',
	'./Element',
	'./ElementMetadata',
	'./Lib',
	'./Rendering',
	'./RenderManager',
	'./ControlBehavior',
	'./UIArea',
	'./Messaging',
	'./StaticArea',
	"sap/ui/core/Supportability",
	"sap/ui/core/Theming",
	"sap/base/Log",
	"sap/ui/performance/Measurement",
	"sap/ui/security/FrameOptions",
	"sap/ui/security/Security",
	"sap/base/assert",
	"sap/base/util/Deferred",
	"sap/base/util/ObjectPath",
	'sap/ui/performance/trace/initTraces',
	'sap/base/util/isEmptyObject',
	'sap/base/util/each',
	'sap/ui/VersionInfo',
	'sap/base/config',
	'sap/base/Event',
	'sap/ui/events/jquery/EventSimulation'
],
	function(
		jQuery,
		Device,
		EventProvider,
		Interface,
		BaseObject,
		ManagedObject,
		AnimationMode,
		Component,
		Configuration,
		Element,
		ElementMetadata,
		Library,
		Rendering,
		RenderManager,
		ControlBehavior,
		UIArea,
		Messaging,
		StaticArea,
		Supportability,
		Theming,
		Log,
		Measurement,
		FrameOptions,
		Security,
		assert,
		Deferred,
		ObjectPath,
		initTraces,
		isEmptyObject,
		each,
		VersionInfo,
		BaseConfig,
		BaseEvent
		/* ,EventSimulation */
	) {
		"use strict";

		var oCore;

		// Initialize SAP Passport or FESR
		initTraces();

		/**
		 * EventProvider instance, EventProvider is no longer extended
		 * @private
		 */
		var _oEventProvider;

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
						Log.error("oCore.mElements was a private member and has been removed. Use one of the methods in sap.ui.core.Element.registry instead");
						return Element.registry.all(); // this is a very costly snapshot!
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
				 * The instance of the root component (defined in the configuration {@link sap.ui.core.Configuration#getRootComponent})
				 * @private
				 */
				this.oRootComponent = null;

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
				Configuration.setCore(this);

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

				// handle modules
				var aModules = this.aModules = Configuration.getValue("modules");
				if ( Supportability.isDebugModeEnabled() ) {
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
				if (BaseConfig.get({name: "sapUiXxLesssupport", type: BaseConfig.Type.Boolean}) && aModules.indexOf("sap.ui.core.plugin.LessSupport") == -1) {
					Log.info("Including LessSupport into declared modules");
					aModules.push("sap.ui.core.plugin.LessSupport");
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

				Log.info("Declared modules: " + aModules, METHOD);

				this._setupContentDirection();

				this._setupBrowser();

				this._setupOS();

				this._setupLang();

				this._setupAnimation();

				// create accessor to the Core API early so that initLibrary and others can use it
				/**
				 * Retrieve the {@link sap.ui.core.Core SAPUI5 Core} instance for the current window.
				 * @returns {sap.ui.core.Core} the API of the current SAPUI5 Core instance.
				 * @public
				 * @function
				 * @ui5-global-only
				 */
				sap.ui.getCore = function() {
					return that.getInterface();
				};

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
						// determine set of libraries
						var aLibs = that.aModules.reduce(function(aResult, sModule) {
							var iPos = sModule.search(/\.library$/);
							if ( iPos >= 0 ) {
								aResult.push(sModule.slice(0, iPos));
							}
							return aResult;
						}, []);

						var pLibraryPreloaded = Library._load(aLibs, {
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
						} else {
							Log.warning("Synchronous loading of Support mode. Set preload configuration to 'async' or switch to asynchronous bootstrap to prevent these synchronous request.", "SyncXHR", null, function() {
								return {
									type: "SyncXHR",
									name: "support-mode"
								};
							});
							fnCallbackSupportBootstrapInfo(
								sap.ui.requireSync("sap/ui/core/support/Support"), // legacy-relevant: Synchronous path
								sap.ui.requireSync("sap/ui/support/Bootstrap") // legacy-relevant: Synchronous path
							);
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
						} else {
							Log.warning("Synchronous loading of Test recorder mode. Set preload configuration to 'async' or switch to asynchronous bootstrap to prevent these synchronous request.", "SyncXHR", null, function() {
								return {
									type: "SyncXHR",
									name: "test-recorder-mode"
								};
							});
							fnCallbackTestRecorder(
								sap.ui.requireSync("sap/ui/testrecorder/Bootstrap") // legacy-relevant: Synchronous preloading
							);
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
					//  - Init
					"getConfiguration",

					// @private, @ui5-restricted sap.ui.core
					//  - Init
					"boot",
					//  - Ready Promise
					"ready",

					// @deprecated
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
		 * Set the document's dir property
		 * @private
		 */
		Core.prototype._setupContentDirection = function() {
			var METHOD = "sap.ui.core.Core",
				sDir = Configuration.getRTL() ? "rtl" : "ltr";

			document.documentElement.setAttribute("dir", sDir); // webkit does not allow setting document.dir before the body exists
			Log.info("Content direction set to '" + sDir + "'",null,METHOD);
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
		 * Set the body's lang attribute and attach the localization change event
		 * @private
		 */
		Core.prototype._setupLang = function() {
			var html = document.documentElement;

			// append the lang info to the document (required for ARIA support)
			var fnUpdateLangAttr = function() {
				var oLocale = Configuration.getLocale();
				oLocale ? html.setAttribute("lang", oLocale.toString()) : html.removeAttribute("lang");
			};
			fnUpdateLangAttr.call(this);

			// listen to localization change event to update the lang info
			this.attachLocalizationChanged(fnUpdateLangAttr, this);
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
			this.aModules.push("sap/ui/core/date/" + Configuration.getCalendarType());

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

			this.aModules.forEach( function(mod) {
				var m = mod.match(/^(.*)\.library$/);
				if ( m ) {
					Library._load(m[1], {
						sync: true
					});
				} else {
					// data-sap-ui-modules might contain legacy jquery.sap.* modules
					sap.ui.requireSync( /^jquery\.sap\./.test(mod) ?  mod : mod.replace(/\./g, "/")); // legacy-relevant: Sync loading of modules and libraries
				}
			});

			fnCallback();
		};

		Core.prototype._requireModulesAsync = function() {
			var aLibs = [],
				aModules = [];

			this.aModules.forEach(function(sModule) {
				var m = sModule.match(/^(.*)\.library$/);
				if (m) {
					aLibs.push(m[1]);
				} else {
					// data-sap-ui-modules might contain legacy jquery.sap.* modules
					aModules.push(/^jquery\.sap\./.test(sModule) ? sModule : sModule.replace(/\./g, "/"));
				}
			});

			// TODO: require libs and modules in parallel or define a sequence?
			return Promise.all([
				Library._load(aLibs),
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

			this._setBodyAccessibilityRole();

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

		Core.prototype._executeOnInit = function() {
			var vOnInit = BaseConfig.get({
				name: "sapUiOnInit",
				type: BaseConfig.Type.Code,
				defaultValue: BaseConfig.get({
					name: "sapUiEvtOninit",
					type: BaseConfig.Type.Code
				})
			});

			// execute a configured init hook
			if ( vOnInit ) {
				if ( typeof vOnInit === "function" ) {
					vOnInit();
				} else if (typeof vOnInit === "string") {
					// determine onInit being a module name prefixed via module or a global name
					var aResult = /^module\:((?:[_$.\-a-zA-Z0-9]+\/)*[_$.\-a-zA-Z0-9]+)$/.exec(vOnInit);
					if (aResult && aResult[1]) {
						// ensure that the require is done async and the Core is finally booted!
						setTimeout(sap.ui.require.bind(sap.ui, [aResult[1]]), 0);
					} else {
						// lookup the name specified in onInit and try to call the function directly
						var fn = ObjectPath.get(vOnInit);
						if (typeof fn === "function") {
							fn();
						} else {
							Log.warning("[Deprecated] Do not use inline JavaScript code with the oninit attribute."
								+ " Use the module:... syntax or the name of a global function");
							/*
							 * In contrast to eval(), window.eval() executes the given string
							 * in the global context, without closure variables.
							 * See http://www.ecma-international.org/ecma-262/5.1/#sec-10.4.2
							 */
							// eslint-disable-next-line no-eval
							window.eval(vOnInit);  // csp-ignore-legacy-api
						}
					}
				}
			}
		};

		Core.prototype._setBodyAccessibilityRole = function() {
			var body = document.body;

			//Add ARIA role 'application'
			if (Configuration.getAccessibility() && Configuration.getAutoAriaBodyRole() && !body.getAttribute("role")) {
				body.setAttribute("role", "application");
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

			this._executeOnInit();
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
		 * Registers a given function that is executed after the framework has been initialized.
		 *
		 * The given function will either be called as soon as the framework has been initialized
		 * or, if it has been initialized already, it will be called immediately.
		 *
		 * More information about the initialization process and the steps it consists of can be found
		 * in the documentation topic "{@link topic:91f2c9076f4d1014b6dd926db0e91070 Initialization Process}".
		 *
		 * @param {function} fnFunction Function to be after initialization of the framework
		 * @public
		 * @since 1.13.2
		 * @deprecated since 1.118. Please use {@link sap.ui.core.Core.ready Core.ready} instead.
		 */
		Core.prototype.attachInit = function (fnFunction) {
			assert(typeof fnFunction === "function", "fnFunction must be a function");
			this.ready(fnFunction);
		};

		/**
		 * Locks the Core. No browser events are dispatched to the controls.
		 *
		 * Lock should be called before and after the DOM is modified for rendering, roundtrips...
		 * Exceptions might be the case for asynchronous UI behavior
		 * @public
		 * @deprecated since 1.118
		 */
		Core.prototype.lock = function () {
			this.bLocked = true;
			UIArea.registry.forEach((oUiArea) => {
				oUiArea.lock();
			});
		};

		/**
		 * Unlocks the Core.
		 *
		 * Browser events are dispatched to the controls again after this method is called.
		 * @public
		 * @deprecated since 1.118
		 */
		Core.prototype.unlock = function () {
			this.bLocked = false;
			UIArea.registry.forEach((oUiArea) => {
				oUiArea.unlock();
			});
		};

		/**
		 * Returns the locked state of the <code>sap.ui.core.Core</code>
		 * @return {boolean} locked state
		 * @public
		 * @deprecated since 1.118
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
			return Configuration;
		};

		/**
		 * Returns a new instance of the RenderManager for exclusive use by the caller.
		 *
		 * The caller must take care to destroy the render manager when it is no longer needed.
		 * Calling this method before the Core has been {@link #isInitialized initialized},
		 * is not recommended.
		 *
		 * @return {sap.ui.core.RenderManager} New instance of the RenderManager
		 * @deprecated Since 1.119
		 * @public
		 */
		Core.prototype.createRenderManager = function() {
			assert(this.isInitialized(), "A RenderManager should be created only after the Core has been initialized");
			var oRm = new RenderManager();
			return oRm.getInterface();
		};

		/**
		 * Returns the Id of the control/element currently in focus.
		 * @return {string} the Id of the control/element currently in focus.
		 * @public
		 * @deprecated since 1.119.
		 * Please use {@link sap.ui.core.Element.getActiveElement Element.getActiveElement} to get
		 * the currently focused element. You can then retrieve the ID of that element with
		 * {@link sap.ui.core.Element#getId Element#getId}. Please be aware,
		 * {@link sap.ui.core.Element.getActiveElement Element.getActiveElement} can return 'undefined'.
		 */
		Core.prototype.getCurrentFocusedControlId = function() {
			if (!this.isInitialized()) {
				throw new Error("Core must be initialized");
			}
			return Element.getActiveElement()?.getId() || null;
		};

		/**
		 * Loads the given library and its dependencies and makes its content available to the application.
		 *
		 *
		 * <h3>What it does</h3>
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
		 *   sap.ui.loader.config({
		 *     paths: {
		 *       "lib/with/slashes": vUrl
		 *     }
		 *   });
		 * </pre>
		 *
		 * When the given library has been loaded already, no further action will be taken, especially, a given
		 * URL will not be registered! In the case of asynchronous loading, a Promise will be returned, but will be
		 * resolved immediately.
		 *
		 *
		 * <h3>When to use</h3>
		 *
		 * For applications that follow the best practices and use components with component descriptors (manifest.json),
		 * the framework will load all declared mandatory libraries and their dependencies automatically before instantiating
		 * the application component.
		 *
		 * The same is true for libraries that are listed in the bootstrap configuration (e.g. with the attribute
		 * <code>data-sap-ui-libs</code>). They will be loaded before the <code>init</code> event of the UI5 Core is fired.
		 *
		 * Only when an app declares a library to be a lazy library dependency or when code does not use descriptors at all,
		 * then an explicit call to <code>loadLibrary</code> becomes necessary. The call should be made before artifacts
		 * (controls, elements, types, helpers, modules etc.) from the library are used or required. This allows the framework
		 * to optimize access to those artifacts.
		 *
		 * For example, when an app uses a heavy-weight charting library that shouldn't be loaded during startup, it can
		 * declare it as "lazy" and load it just before it loads and displays a view that uses the charting library:
		 * <pre>
		 *   sap.ui.getCore().loadLibrary("heavy.charting", {async: true})
		 *     .then(function() {
		 *       View.create({
		 *         name: "myapp.views.HeavyChartingView",
		 *         type: ViewType.XML
		 *       });
		 *     });
		 * </pre>
		 *
		 * @param {string} sLibrary Name of the library to load
		 * @param {string|boolean|object} [vUrl] URL to load the library from or the async flag or a complex configuration object
		 * @param {boolean} [vUrl.async] Whether to load the library asynchronously
		 * @param {string} [vUrl.url] URL to load the library from
		 * @returns {sap.ui.core.LibraryInfo|Promise<sap.ui.core.LibraryInfo>} An info object for the library
		 *  (sync) or a Promise on it (async).
		 * @public
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Lib.load Lib.load} instead.
		 */
		Core.prototype.loadLibrary = function(sLibrary, vUrl) {
			var mLibConfig = {
				name: sLibrary
			};

			var mOptions = {
				sync: true
			};

			if (typeof vUrl === "boolean") {
				mOptions.sync = !vUrl;
			} else if (typeof vUrl === "string") {
				mLibConfig.url = vUrl;
			} else if (typeof vUrl === "object") {
				mOptions.sync = !vUrl.async;
				mLibConfig.url = vUrl.url;
			}

			var vLoaded = Library._load(mLibConfig, mOptions);

			if (!mOptions.sync) {
				return vLoaded.then(function(aLibs) {
					return aLibs[0];
				});
			} else {
				return vLoaded[0];
			}
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
		 * @param {boolean} [mOptions.preloadOnly=false] whether to preload the libraries only (default is to
		 *  require them as well)
		 * @returns {Promise<Array<sap.ui.core.LibraryInfo>>|undefined} returns a Promise in async mode, otherwise
		 *  <code>undefined</code>
		 *
		 * @experimental Since 1.27.0 This API is not mature yet and might be changed or removed completely.
		 * Productive code should not use it, except code that is delivered as part of UI5.
		 * @private
		 * @ui5-restricted sap.ui.core,sap.ushell
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Lib.load Lib.load} instead.
		 */
		Core.prototype.loadLibraries = function(aLibraries, mOptions) {
			mOptions = Object.assign({
				async: true
			}, mOptions);

			mOptions.sync = !mOptions.async;

			var pLoaded = Library._load(aLibraries, mOptions);

			if (!mOptions.sync) {
				return pLoaded;
			} else {
				return undefined;
			}
		};

		/**
		 * Info object for the library
		 *
		 * @typedef {object} sap.ui.core.LibraryInfo
		 * @public
		 *
		 * @property {string} version Version of the library
		 * @property {string} [name] Name of the library; when given it must match the name by which the library has been loaded
		 * @property {string[]} [dependencies=[]] List of libraries that this library depends on; names are in dot
		 *  notation (e.g. "sap.ui.core")
		 * @property {string[]} [types=[]] List of names of types that this library provides; names are in dot notation
		 *  (e.g. "sap.ui.core.CSSSize")
		 * @property {string[]} [interfaces=[]] List of names of interface types that this library provides; names are
		 *  in dot notation (e.g. "sap.ui.core.PopupInterface")
		 * @property {string[]} [controls=[]] Names of control types that this library provides; names are in dot
		 *  notation (e.g. "sap.ui.core.ComponentContainer")
		 * @property {string[]} [elements=[]] Names of element types that this library provides (excluding controls);
		 *  names are in dot notation (e.g. "sap.ui.core.Item")
		 * @property {boolean} [noLibraryCSS=false] Indicates whether the library doesn't provide/use theming.  When set
		 *  to true, no library.css will be loaded for this library
		 * @property {Object<string,any>} [extensions] Potential extensions of the library metadata; structure not defined by the
		 *  UI5 core framework.
		 */

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
		 * @param {sap.ui.core.LibraryInfo} oLibInfo Info object for the library
		 * @return {object|undefined} As of version 1.101; returns the library namespace, based on the given library name. Returns 'undefined' if no library name is provided.
		 * @public
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Lib.init Lib.init} instead.
		 */
		Core.prototype.initLibrary = function(oLibInfo) {
			assert(typeof oLibInfo === 'string' || typeof oLibInfo === 'object', "oLibInfo must be a string or object");

			var bLegacyMode = typeof oLibInfo === 'string';
			if ( bLegacyMode ) {
				oLibInfo = { name : oLibInfo };
			}

			var sLibName = oLibInfo.name,
				METHOD =  "sap.ui.core.Core.initLibrary()";

			if ( bLegacyMode ) {
				Log.error("[Deprecated] library " + sLibName + " uses old fashioned initLibrary() call (rebuild with newest generator)");
			}

			if (!sLibName) {
				Log.error("A library name must be provided.", null, METHOD);
				return;
			}

			var oLib = Library._get(sLibName);

			if (oLib && oLib.isSettingsEnhanced()) {
				return ObjectPath.get(sLibName);
			}

			return Library.init(oLibInfo);
		};

		/**
		 * Includes a library theme into the current page (if a variant is specified it
		 * will include the variant library theme)
		 * @param {string} sLibName the name of the UI library
		 * @param {string} [sVariant] the variant to include (optional)
		 * @param {string} [sQuery] to be used only by the Core
		 * @public
		 * @deprecated since 1.119
		 */
		Core.prototype.includeLibraryTheme = function(sLibName, sVariant, sQuery) {
			var oLib = Library._get(sLibName, true /* bCreate */);
			oLib._includeTheme(sVariant, sQuery);
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
		 * @return {Object<string,Object>} Map of library info objects keyed by the library names.
		 * @public
		 * @deprecated since 1.119
		 */
		Core.prototype.getLoadedLibraries = function() {
			return Library.all();
		};

		/**
		 * Retrieves a resource bundle for the given library and locale.
		 *
		 * If only one argument is given, it is assumed to be the libraryName. The locale
		 * then falls back to the current {@link sap.ui.core.Configuration#getLanguage session locale}.
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

		// ---- UIArea and Rendering -------------------------------------------------------------------------------------

		function placeControlAt(oDomRef, oControl) {
			assert(typeof oDomRef === "string" || typeof oDomRef === "object", "oDomRef must be a string or object");
			assert(oControl instanceof Interface || BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be a Control or Interface");

			if (oControl) {
				oControl.placeAt(oDomRef, "only");
			}
		}

		/**
			 * Creates a new {@link sap.ui.core.UIArea UIArea}.
			 *
			 * @param {string|Element} oDomRef a DOM Element or ID string of the UIArea
			 * @return {sap.ui.core.UIArea} a new UIArea
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
		Core.prototype.createUIArea = function(oDomRef) {
			if (typeof oDomRef === "string" && oDomRef === StaticArea.STATIC_UIAREA_ID) {
				return StaticArea.getUIArea();
			}
			return UIArea.create(oDomRef);
		};

		/**
		 * Returns <code>true</code> if there are any pending rendering tasks or when
		 * such rendering tasks are currently being executed.
		 *
		 * @return {boolean} true if there are pending (or executing) rendering tasks.
		 * @public
		 * @deprecated since 1.118
		 */
		Core.prototype.getUIDirty = function() {
			return Rendering.isPending();
		};

		/**
		 * Triggers a realignment of controls
		 *
		 * This method should be called after changing the cozy/compact CSS class of a DOM element at runtime,
		 *  for example at the <code>&lt;body&gt;</code> tag.
		 *  Controls can listen to the themeChanged event to realign their appearance after changing the theme.
		 *  Changing the cozy/compact CSS class should then also be handled as a theme change.
		 *  In more simple scenarios where the cozy/compact CSS class is added to a DOM element which contains only a few controls
		 *  it might not be necessary to trigger the realigment of all controls placed in the DOM,
		 *  for example changing the cozy/compact CSS class at a single control
		 * @public
		 * @function
		 * @deprecated since 1.119. Please use {@link module:sap/ui/core/Theming.notifyContentDensityChanged Theming.notifyContentDensityChanged} instead.
		 */
		Core.prototype.notifyContentDensityChanged = Theming.notifyContentDensityChanged;

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
		* @deprecated since 1.118. See {@link sap.ui.core.Theming#attachApplied Theming#attachApplied} instead.
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
		 * @deprecated since 1.118. See {@link sap.ui.core.Theming#detachApplied Theming#detachApplied} instead.
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

		/**
		 * Register a listener for the {@link #event:localizationChanged localizationChanged} event.
		 *
		 * When called, the context of the listener (its <code>this</code>) will be bound to <code>oListener</code>
		 * if specified, otherwise it will be bound to a dummy event provider object.
		 *
		 * @param {function} fnFunction Callback to be called when the event occurs
		 * @param {object} [oListener] Context object to call the function on
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.base.i18n.Localization#attachChange Localization#attachChange} instead.
		 */
		Core.prototype.attachLocalizationChanged = function(fnFunction, oListener) {
			_oEventProvider.attachEvent(Core.M_EVENTS.LocalizationChanged, fnFunction, oListener);
		};

		/**
		 * Unregister a listener from the {@link #event:localizationChanged localizationChanged} event.
		 *
		 * The listener will only be unregistered if the same function/context combination
		 * is given as in the call to <code>attachLocalizationListener</code>.
		 *
		 * @param {function} fnFunction Callback to be deregistered
		 * @param {object} [oListener] Context object on which the given function had to be called
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.base.i18n.Localization#detachChange Localization#detachChange} instead.
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

			Log.info("localization settings changed: " + Object.keys(mChanges).join(","), null, "sap.ui.core.Core");

			/*
			 * Notify models that are able to handle a localization change
			 */
			each(this.oModels, function (prop, oModel) {
				if (oModel && oModel._handleLocalizationChange) {
					oModel._handleLocalizationChange();
				}
			});

			/*
			 * Notify all UIAreas, Components, Elements to first update their models (phase 1)
			 * and then to update their bindings and corresponding data types (phase 2)
			 */
			function notifyAll(iPhase) {
				UIArea.registry.forEach(function(oUIArea) {
					fnAdapt.call(oUIArea, iPhase);
				});
				Component.registry.forEach(function(oComponent) {
					fnAdapt.call(oComponent, iPhase);
				});
				Element.registry.forEach(function(oElement) {
					fnAdapt.call(oElement, iPhase);
				});
			}

			notifyAll.call(this,1);
			notifyAll.call(this,2);

			// special handling for changes of the RTL mode
			if ( mChanges.rtl != undefined ) {
				// update the dir attribute of the document
				document.documentElement.setAttribute("dir", mChanges.rtl ? "rtl" : "ltr");

				// invalidate all UIAreas
				UIArea.registry.forEach(function(oUIArea) {
					oUIArea.invalidate();
				});
				Log.info("RTL mode " + mChanges.rtl ? "activated" : "deactivated");
			}

			// notify Elements via a pseudo browser event (onlocalizationChanged, note the lower case 'l')
			Element.registry.forEach(function(oElement) {
				oElement._handleEvent(oBrowserEvent);
			});

			// notify registered Core listeners
			_oEventProvider.fireEvent(sEventId, {changes : mChanges});
		};

		/**
		 * Register a listener for the {@link sap.ui.core.Core#event:libraryChanged} event.
		 *
		 * @param {function} fnFunction Callback to be called when the <code>libraryChanged</code> event is fired
		 * @param {object} [oListener] Optional context object to call the callback on
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.support
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Lib.attachLibraryChanged Lib.attachLibraryChanged} instead.
		 */
		Core.prototype.attachLibraryChanged = function(fnFunction, oListener) {
			_oEventProvider.attachEvent(Core.M_EVENTS.LibraryChanged, fnFunction, oListener);
		};

		/**
		 * Unregister a listener from the {@link sap.ui.core.Core#event:libraryChanged} event.
		 *
		 * @param {function} fnFunction function to unregister
		 * @param {object} [oListener] context object given during registration
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.support
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Lib.detachLibraryChanged Lib.detachLibraryChanged} instead.
		 */
		Core.prototype.detachLibraryChanged = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.LibraryChanged, fnFunction, oListener);
		};

		Library.attachLibraryChanged(function(oEvent) {
			// notify registered Core listeners
			_oEventProvider.fireEvent(Core.M_EVENTS.LibraryChanged, oEvent.getParameters());
		});

		/**
		 * Enforces an immediate update of the visible UI (aka "rendering").
		 *
		 * In general, applications and Controls should avoid calling this method and
		 * instead let the framework manage any necessary rendering.
		 * @public
		 * @deprecated since 1.118
		 */
		Core.prototype.applyChanges = function() {
			Rendering.renderPendingUIUpdates("forced by applyChanges");
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
		 * Returns the registered element with the given ID, if any.
		 *
		 * The ID must be the globally unique ID of an element, the same as returned by <code>oElement.getId()</code>.
		 *
		 * When the element has been created from a declarative source (e.g. XMLView), that source might have used
		 * a shorter, non-unique local ID. A search for such a local ID cannot be executed with this method.
		 * It can only be executed on the corresponding scope (e.g. on an XMLView instance), by using the
		 * {@link sap.ui.core.mvc.View#byId View#byId} method of that scope.
		 *
		 * @param {sap.ui.core.ID|null|undefined} sId ID of the element to search for
		 * @returns {sap.ui.core.Element|undefined} Element with the given ID or <code>undefined</code>
		 * @public
		 * @function
		 * @deprecated Since 1.119. Please use {@link sap.ui.core.Element.getElementById Element.getElementById} instead.
		 */
		Core.prototype.byId = Element.getElementById;

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
		 * Returns the static, hidden area DOM element belonging to this core instance.
		 *
		 * It can be used e.g. for hiding elements like Popups, Shadow, Blocklayer etc.
		 *
		 * If it is not yet available, a DIV is created and appended to the body.
		 *
		 * @return {Element} the static, hidden area DOM element belonging to this core instance.
		 * @throws {Error} an Error if the document is not yet ready
		 * @public
		 * @deprecated since 1.119.0. Please use {@link module:sap/ui/core/StaticArea.getDomRef StaticArea.getDomRef} instead.
		 */
		Core.prototype.getStaticAreaRef = function() {
			return StaticArea.getDomRef();
		};

		/**
		 * Checks whether the given DOM element is the root of the static area.
		 *
		 * @param {Element} oDomRef DOM element to check
		 * @returns {boolean} Whether the given DOM element is the root of the static area
		 * @protected
		 * @deprecated since 1.119.0. Please use {@link module:sap/ui/core/StaticArea.contains StaticArea.contains} instead.
		 */
		Core.prototype.isStaticAreaRef = function(oDomRef) {
			return StaticArea.getDomRef() === oDomRef;
		};

		/**
		 * Registers a listener for control events.
		 *
		 * When called, the context of the listener (its <code>this</code>) will be bound to <code>oListener</code>
		 * if specified, otherwise it will be bound to a dummy event provider object.
		 *
		 * @param {function} fnFunction Callback to be called for each control event
		 * @param {object} [oListener] Optional context object to call the callback on
		 * @public
		 * @deprecated Since 1.119
		 */
		Core.prototype.attachControlEvent = function(fnFunction, oListener) {
			_oEventProvider.attachEvent(Core.M_EVENTS.ControlEvent, fnFunction, oListener);
		};

		/**
		 * Unregisters a listener for control events.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function} fnFunction Function to unregister
		 * @param {object} [oListener] Context object on which the given function had to be called
		 * @public
		 * @deprecated Since 1.119
		 */
		Core.prototype.detachControlEvent = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.ControlEvent, fnFunction, oListener);
		};

		/**
		 * Notifies the listeners that an event on a control occurs.
		 *
		 * @param {object} oParameters Parameters to pass along with the event, e.g. <code>{ browserEvent: jQuery.Event }</code>
		 * @private
		 * @deprecated Since 1.119
		 */
		Core.prototype.fireControlEvent = function(oParameters) {
			_oEventProvider.fireEvent(Core.M_EVENTS.ControlEvent, oParameters);
		};

		/**
			 * Registers a Plugin to the <code>sap.ui.core.Core</code>, which lifecycle
			 * will be managed (start and stop).
			 *
			 * Plugin object need to implement two methods:
			 * <ul>
			 *   <li><code>startPlugin(oCore)</code>: will be invoked, when the Plugin
			 *       should start (as parameter the reference to the Core will be provided</li>
			 *   <li><code>stopPlugin()</code>: will be invoked, when the Plugin should stop</li>
			 * </ul>
			 *
			 * @param {object} oPlugin reference to a Plugin object
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
		Core.prototype.registerPlugin = function(oPlugin) {
			assert(typeof oPlugin === "object", "oPlugin must be an object");

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
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
		Core.prototype.unregisterPlugin = function(oPlugin) {
			assert(typeof oPlugin === "object", "oPlugin must be an object");

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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#setModel ManagedObject#setModel} instead.
		 */
		Core.prototype.setModel = function(oModel, sName) {
			assert(oModel == null || BaseObject.isA(oModel, 'sap.ui.model.Model'), "oModel must be an instance of sap.ui.model.Model, null or undefined");
			assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
			var that = this,
				oProperties;

			if (!oModel && this.oModels[sName]) {
				delete this.oModels[sName];
				if (isEmptyObject(that.oModels) && isEmptyObject(that.oBindingContexts)) {
					oProperties = ManagedObject._oEmptyPropagatedProperties;
				} else {
					oProperties = {
						oModels: Object.assign({}, that.oModels),
						oBindingContexts: {},
						aPropagationListeners: []
					};
				}
				// propagate Models to all UI areas

				UIArea.registry.forEach(function (oUIArea){
					if (oModel != oUIArea.getModel(sName)) {
						oUIArea._propagateProperties(sName, oUIArea, oProperties, false, sName);
					}
				});
			} else if (oModel && oModel !== this.oModels[sName] ) {
				this.oModels[sName] = oModel;
				// propagate Models to all UI areas
				UIArea.registry.forEach(function (oUIArea){
					if (oModel != oUIArea.getModel(sName)) {
						var oProperties = {
							oModels: Object.assign({}, this.oModels),
							oBindingContexts: {},
							aPropagationListeners: []
						};
						oUIArea._propagateProperties(sName, oUIArea, oProperties, false, sName);
					}
				}.bind(this));
			} //else nothing to do
			return this;
		};

		/**
		 * Returns the <code>Messaging</code> module.
		 *
		 * @return {module:sap/ui/core/Messaging}
		 * @public
		 * @since 1.33.0
		 * @deprecated since 1.118. Please use {@link module:sap/ui/core/Messaging Messaging} instead.
		 */
		Core.prototype.getMessageManager = function() {
			return Messaging;
		};

		/**
		 * Returns a list of all controls with a field group ID.
		 * See {@link sap.ui.core.Control#checkFieldGroupIds Control.prototype.checkFieldGroupIds} for a description of the
		 * <code>vFieldGroupIds</code> parameter.
		 *
		 * @param {string|string[]} [vFieldGroupIds] ID of the field group or an array of field group IDs to match
		 * @return {sap.ui.core.Control[]} The list of controls with matching field group IDs
		 * @public
		 * @deprecated As of version 1.118, use {@link sap.ui.core.Control#getControlsByFieldGroup Control.prototype.getControlsByFieldGroup} instead.

		 */
		Core.prototype.byFieldGroupId = function(vFieldGroupIds) {
			return Element.registry.filter(function(oElement) {
				return oElement.isA("sap.ui.core.Control") && oElement.checkFieldGroupIds(vFieldGroupIds);
			});
		};

		/**
		 * Get the model with the given model name.
		 *
		 * The name can be omitted to reference the default model or it must be a non-empty string.
		 *
		 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
		 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
		 *
		 * @param {string} [sName] name of the model to be retrieved
		 * @return {sap.ui.model.Model} oModel
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#getModel ManagedObject#getModel} instead.
		 */
		Core.prototype.getModel = function(sName) {
			assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
			return this.oModels[sName];
		};

		/**
		 * Check if a Model is set to the core
		 * @return {boolean} true or false
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#hasModel ManagedObject#hasModel} instead.
		 */
		Core.prototype.hasModel = function() {
			return !isEmptyObject(this.oModels);
		};

		/**
		 * Returns the event bus.
		 * @return {sap.ui.core.EventBus} the event bus
		 * @since 1.8.0
		 * @public
		 * @deprecated since 1.119.0. Please use {@link sap.ui.core.EventBus.getInstance EventBus.getInstance} for global usage instead.
		 * Creating an own local instance is the preferred usage.
		 */
		Core.prototype.getEventBus = function() {
			if (!this.oEventBus) {
				var EventBus = sap.ui.require('sap/ui/core/EventBus');
				if (!EventBus) {
					Log.warning("Synchronous loading of EventBus. Ensure that 'sap/ui/core/EventBus' module is loaded" +
						" before this function is called.", "SyncXHR", null, function() {
						return {
							type: "SyncXHR",
							name: "core-eventbus"
						};
					});
					EventBus = sap.ui.requireSync('sap/ui/core/EventBus'); // legacy-relevant: fallback for missing dependency
				}
				var oEventBus = this.oEventBus = EventBus.getInstance();
				this._preserveHandler = function(event) {
					// for compatibility reasons
					oEventBus.publish("sap.ui", "__preserveContent", {domNode: event.domNode});
				};
				RenderManager.attachPreserveContent(this._preserveHandler);
			}
			return this.oEventBus;
		};

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:validationError validationError} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * When called, the context of the listener (its <code>this</code>) will be bound to <code>oListener</code>
		 * if specified, otherwise it will be bound to a dummy event provider object.
		 *
		 * Please note that this event is a bubbling event and may already be canceled before reaching the core.
		 *
		 * @param {object}
		 *            [oData] An application-specific payload object that will be passed to the event handler
		 *            along with the event object when firing the event
		 * @param {function}
		 *            fnFunction The function to be called, when the event occurs
		 * @param {object}
		 *            [oListener] Context object to call the event handler with. Defaults to a dummy event
		 *            provider object
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#attachValidationError ManagedObject#attachValidationError} instead.
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
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:validationError validationError} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The callback function to unregister
		 * @param {object}
		 *            [oListener] Context object on which the given function had to be called
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#detachValidationError ManagedObject#detachValidationError} instead.
		 */
		Core.prototype.detachValidationError = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.ValidationError, fnFunction, oListener);
			return this;
		};

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:parseError parseError} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * When called, the context of the listener (its <code>this</code>) will be bound to <code>oListener</code>
		 * if specified, otherwise it will be bound to a dummy event provider object.
		 *
		 * Please note that this event is a bubbling event and may already be canceled before reaching the core.
		 *
		 * @param {object}
		 *            [oData] An application-specific payload object that will be passed to the event handler
		 *            along with the event object when firing the event
		 * @param {function}
		 *            fnFunction The function to be called, when the event occurs
		 * @param {object}
		 *            [oListener] Context object to call the event handler with. Defaults to a dummy event
		 *            provider object
		 *
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#attachParseError ManagedObject#attachParseError} instead.
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
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:parseError parseError} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The callback function to unregister.
		 * @param {object}
		 *            [oListener] Context object on which the given function had to be called
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#detachParseError ManagedObject#detachParseError} instead.
		 */
		Core.prototype.detachParseError = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.ParseError, fnFunction, oListener);
			return this;
		};

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:formatError formatError} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * When called, the context of the listener (its <code>this</code>) will be bound to <code>oListener</code>
		 * if specified, otherwise it will be bound to a dummy event provider object.
		 *
		 * Please note that this event is a bubbling event and may already be canceled before reaching the core.
		 *
		 * @param {object}
		 *            [oData] An object that will be passed to the handler along with the event object when the event is fired
		 * @param {function}
		 *            fnFunction The function to be called, when the event occurs
		 * @param {object}
		 *            [oListener] Context object to call the event handler with. Defaults to a dummy event
		 *            provider object
		 *
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#attachFormatError ManagedObject#attachFormatError} instead.
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
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:formatError formatError} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The callback function to unregister
		 * @param {object}
		 *            [oListener] Context object on which the given function had to be called
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#detachFormatError ManagedObject#detachFormatError} instead.
		 */
		Core.prototype.detachFormatError = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.FormatError, fnFunction, oListener);
			return this;
		};

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:validationSuccess validationSuccess} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * When called, the context of the listener (its <code>this</code>) will be bound to <code>oListener</code>
		 * if specified, otherwise it will be bound to a dummy event provider object.
		 *
		 * Please note that this event is a bubbling event and may already be canceled before reaching the core.
		 *
		 * @param {object}
		 *            [oData] The object, that should be passed along with the event-object when firing the event
		 * @param {function}
		 *            fnFunction The function to be called, when the event occurs
		 * @param {object}
		 *            [oListener] Context object to call the event handler with. Defaults to a dummy event
		 *            provider object
		 *
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#attachValidationSuccess ManagedObject#attachValidationSuccess} instead.
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
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:validationSuccess validationSuccess} event
		 * of <code>sap.ui.core.Core</code>.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The function to be called, when the event occurs
		 * @param {object}
		 *            [oListener] Context object on which the given function had to be called
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#detachValidationSuccess ManagedObject#detachValidationSuccess} instead.
		 */
		Core.prototype.detachValidationSuccess = function(fnFunction, oListener) {
			_oEventProvider.detachEvent(Core.M_EVENTS.ValidationSuccess, fnFunction, oListener);
			return this;
		};


		/**
		 * Fires event {@link #event:parseError parseError} to attached listeners.
		 *
		 * @param {object} [oParameters] Parameters to pass along with the event.
		 * @param {sap.ui.core.Element} oParameters.element Element where the parse error occurred
		 * @param {string} oParameters.property Name of the property of the element where the parse error occurred
		 * @param {sap.ui.model.Type} oParameters.type Type of the property
		 * @param {object} oParameters.newValue Value of the property which was entered when the parse error occurred
		 * @param {object} oParameters.oldValue Value of the property which was present before a new value was entered (before the parse error)
		 * @param {object} oParameters.exception Exception object which occurred and has more information about the parse error
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @protected
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#fireParseError ManagedObject#fireParseError} instead.
		 */
		Core.prototype.fireParseError = function(oParameters) {
			_oEventProvider.fireEvent(Core.M_EVENTS.ParseError, oParameters);
			return this;
		};

		/**
		 * Fires event {@link #event:validationError validationError} to attached listeners.
		 *
		 * @param {object} [oParameters] Parameters to pass along with the event.
		 * @param {sap.ui.core.Element} oParameters.element The Element where the validation error occurred
		 * @param {string} oParameters.property Property name of the element where the validation error occurred
		 * @param {sap.ui.model.Type} oParameters.type Type of the property
		 * @param {object} oParameters.newValue Value of the property which was entered when the validation error occurred
		 * @param {object} oParameters.oldValue Value of the property which was present before a new value was entered (before the validation error)
		 * @param {object} oParameters.exception Exception object which occurred and has more information about the validation error
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @protected
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#fireValidationError ManagedObject.fireValidationError} instead.
		 */
		Core.prototype.fireValidationError = function(oParameters) {
			_oEventProvider.fireEvent(Core.M_EVENTS.ValidationError, oParameters);
			return this;
		};

		/**
		 * Fires event {@link #event:formatError formatError} to attached listeners.
		 *
		 * @param {object} [oParameters] Parameters to pass along with the event.
		 * @param {sap.ui.core.Element} oParameters.element Element where the format error occurred
		 * @param {string} oParameters.property Name of the property of the element where the format error occurred
		 * @param {sap.ui.model.Type} oParameters.type Type of the property
		 * @param {any} oParameters.newValue Value of the property which was entered when the format error occurred
		 * @param {any} oParameters.oldValue Value of the property which was present before a new value was entered (before the format error)
		 * @param {object} oParameters.exception Exception object which occurred and has more information about the format error
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @protected
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#fireFormatError ManagedObject#fireFormatError} instead.
		 */
		Core.prototype.fireFormatError = function(oParameters) {
			_oEventProvider.fireEvent(Core.M_EVENTS.FormatError, oParameters);
			return this;
		};

		/**
		 * Fires event {@link #event:validationSuccess validationSuccess} to attached listeners.
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
		 * @param {object} [oParameters] Parameters to pass along with the event
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @protected
		 * @deprecated since 1.118. Please use {@link sap.ui.base.ManagedObject#fireValidationSuccess ManagedObject#fireValidationSuccess} instead.
		 */
		Core.prototype.fireValidationSuccess = function(oParameters) {
			_oEventProvider.fireEvent(Core.M_EVENTS.ValidationSuccess, oParameters);
			return this;
		};

		/**
		 * Check if the script is running on mobile
		 * @return {boolean} true or false
		 * @deprecated As of version 1.118, use {@link sap.ui.Device.browser.mobile Device.browser.mobile} instead.
		 * @public
		 */
		Core.prototype.isMobile = function() {
			return Device.browser.mobile;
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

		/**
		 * Adds a task that is guaranteed to run once, just before the next rendering. A rendering
		 * request is not triggered.
		 *
		 * @param {function} fnPrerenderingTask
		 *   A function that is called before the rendering
		 * @param {boolean} [bFirst=false]
		 *   Whether the task should become the first one, not the last one
		 * @private
		 * @deprecated since 1.118: Please use {@link sap.ui.core.Rendering.addPrerenderingTask Rendering.addPrerenderingTask} instead.
		 * @ui5-restricted sap.ui.model.odata.v4
		 */
		Core.prototype.addPrerenderingTask = function (fnPrerenderingTask, bFirst) {
			Rendering.addPrerenderingTask(fnPrerenderingTask, bFirst);
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