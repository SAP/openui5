/*!
 * ${copyright}
 */

// Provides the real core class sap.ui.core.Core of SAPUI5
sap.ui.define([
	"./AnimationMode",
	"./ControlBehavior",
	"./ElementRegistry",
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
	"sap/base/util/Deferred",
	"sap/base/util/Version",
	"sap/ui/Device",
	"sap/ui/Global",
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
		Deferred,
		Version,
		Device,
		Global,
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

		/**
		 * The Core version, e.g. '1.127.0'
		 * @name sap.ui.core.Core.version
		 * @final
		 * @type {string}
		 * @static
		 * @since 1.127
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.test
		 */
		const sVersion = "${version}";

		/**
		 * The buildinfo.
		 * @typedef {object} sap.ui.core.Core.BuildInfo
		 * @property {string} buildtime the build timestamp, e.g. '20240625091308'
		 * @since 1.127
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.test
		 */

		/**
		 * The buildinfo, containing a build timestamp.
		 * @name sap.ui.core.Core.buildinfo
		 * @final
		 * @type {sap.ui.core.Core.BuildInfo}
		 * @static
		 * @since 1.127
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.test
		 */
		const oBuildinfo = Object.assign({}, Global.buildinfo);
		// freeze since it is exposed as a property on the Core and must not be changed at runtime
		// (refer to Core#getInterface)
		Object.freeze(oBuildinfo);

		// getComputedStyle polyfill + syncXHR fix for firefox
		if (Device.browser.firefox) {
			getComputedStyleFix();
			if (Device.browser.version < 129) {
				// Firefox fixes the issue from its version 129. See
				// https://bugzilla.mozilla.org/show_bug.cgi?id=697151
				// https://wpt.fyi/results/xhr/send-sync-blocks-async.htm?label=experimental&label=master&aligned
				syncXHRFix();
			}
		}

		if (BaseConfig.get({
			name: "sapUiNoConflict",
			type: BaseConfig.Type.Boolean,
			freeze: true
		})){
			jQuery.noConflict();
		}

		// set LogLevel
		const sLogLevel = BaseConfig.get({
			name: "sapUiLogLevel",
			type: BaseConfig.Type.String,
			defaultValue: undefined,
			external: true
		});

		if (sLogLevel) {
			Log.setLevel(Log.Level[sLogLevel.toUpperCase()] || parseInt(sLogLevel));
		} else if (!globalThis["sap-ui-optimized"]) {
			Log.setLevel(Log.Level.DEBUG);
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
		 * @class Singleton Core instance of the SAP UI Library.
		 *
		 * The module export of <code>sap/ui/core/Core</code> is <b>not</b> a class, but the singleton Core instance itself.
		 * The <code>sap.ui.core.Core</code> class itself must not be instantiated, except by the framework itself.
		*
		 * The Core provides a {@link #ready ready function} to execute code after the Core was booted.
		 *
		 * Example:
		 * <pre>
		 *
		 *   sap.ui.require(["sap/ui/core/Core"], async function(Core) {
		 *
		 *     // Usage of a callback function
		 *     Core.ready(function() {
		 *       ...
		 *     });
		 *
		 *     // Usage of Core.ready() as a Promise
		 *     await Core.ready();
		 *     ...
		 *   });
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

			metadata : {}

		});

		/*
		 * Overwrite getInterface so that we can add the version info as a property
		 * to the Core.
		 */
		Core.prototype.getInterface = function() {
			const oCoreInterface = BaseObject.prototype.getInterface.call(this);
			Object.defineProperties(oCoreInterface, {
				"version": {
					value: sVersion
				},
				"buildinfo": {
					value: oBuildinfo
				}
			});
			return oCoreInterface;
		};

		/**
		 * Map of event names and ids, that are provided by this class
		 * @private
		 */
		Core.M_EVENTS = {ControlEvent: "ControlEvent", UIUpdated: "UIUpdated", ThemeChanged: "ThemeChanged", ThemeScopingChanged: "themeScopingChanged", LocalizationChanged: "localizationChanged",
				LibraryChanged : "libraryChanged",
				ValidationError : "validationError", ParseError : "parseError", FormatError : "formatError", ValidationSuccess : "validationSuccess"};

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

			// add FieldHelpEndpoint to list of modules
			this.aModules.push("sap/ui/core/boot/FieldHelpEndpoint");

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
			if (!sWaitForTheme) {
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
			// chain ready to be the first one that is executed
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
		 * Attach to 'applied' event of theming in order to keep existing core event 'ThemeChanged' stable
		 */
		Theming.attachApplied(function(oEvent) {
			// notify the listeners via a control event
			_oEventProvider && _oEventProvider.fireEvent(Core.M_EVENTS.ThemeChanged, BaseEvent.getParameters(oEvent));
		});

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

		/**
		 * Returns a Promise that resolves if the Core is initialized.
		 * Additionally, a callback function can be passed, for use cases where using Promises is not an option.
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