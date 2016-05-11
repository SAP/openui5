/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.View.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/core/Control', 'sap/ui/core/mvc/Controller', 'sap/ui/core/library'],
	function(jQuery, ManagedObject, Control, Controller, library) {
	"use strict";


	// shortcut for enum(s)
	var ViewType = library.mvc.ViewType;

	/**
	 * @namespace
	 * @name sap.ui.core.mvc
	 * @public
	 */

	/**
	 * Constructor for a new View.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class A base class for Views.
	 *
	 * Introduces the relationship to a Controller, some basic visual appearance settings like width and height
	 * and provides lifecycle events.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.core.mvc.View
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var View = Control.extend("sap.ui.core.mvc.View", /** @lends sap.ui.core.mvc.View.prototype */ { metadata : {

		library : "sap.ui.core",
		properties : {

			/**
			 * The width
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

			/**
			 * The height
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Name of the View
			 */
			viewName : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Whether the CSS display should be set to "block".
			 * Set this to "true" if the default display "inline-block" causes a vertical scrollbar with Views that are set to 100% height.
			 * Do not set this to "true" if you want to display other content in the same HTML parent on either side of the View (setting to "true" may push that other content to the next/previous line).
			 */
			displayBlock : {type : "boolean", group : "Appearance", defaultValue : false}
		},
		aggregations : {

			/**
			 * Child Controls of the view
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		},
		events : {

			/**
			 * Fired when the View has parsed the UI description and instantiated the contained controls (/control tree).
			 */
			afterInit : {},

			/**
			 * Fired when the view has received the request to destroy itself, but before it has destroyed anything.
			 */
			beforeExit : {},

			/**
			 * Fired when the View has been (re-)rendered and its HTML is present in the DOM.
			 */
			afterRendering : {},

			/**
			 * Fired before this View is re-rendered. Use to unbind event handlers from HTML elements etc.
			 */
			beforeRendering : {}
		},
		specialSettings : {

			/**
			 * Controller instance to use for this view.
			 */
			controller : true,

			/**
			 * Name of the controller class to use for this view.
			 * If given, it overrides the same information in the view definition (XML, HTML).
			 */
			controllerName : true,

			/**
			 * Preprocessors that the view can use before constructing the view.
			 */
			preprocessors : true,

			/**
			 * (module) Name of a resource bundle that should be loaded for this view
			 */
			resourceBundleName : true,

			/**
			 * URL of a resource bundle that should be loaded for this view
			 */
			resourceBundleUrl : true,

			/**
			 * Locale that should be used to load a resourcebundle for thisview
			 */
			resourceBundleLocale : true,

			/**
			 * Model name under which the resource bundle should be stored.
			 */
			resourceBundleAlias : true,

			/**
			 * Type of the view
			 */
			type : true,

			/**
			 * A view definition
			 */
			viewContent : true,

			/**
			 * Additional configuration data that should be given to the view at construction time
			 * and which will be available early, even before model data or other constructor settings are applied.
			 */
			viewData : true,

			/**
			 * Determines initialization mode of the view
			 * @type {Boolean}
			 * @since 1.30
			 */
			async : {
				type : "boolean",
				defaultValue : false
			}
		}
	}});

	/**
	 * Global map of preprocessors with view types and source types as keys,
	 * e.g. _mPreprocessors[sViewType][sSourceType]
	 *
	 * @private
	 */
	View._mPreprocessors = {};

	// align object structure to internal preprocessor format to be able to store internal settings without conflicts
	// external: { preprocessor: ("my.Preprocessor" || function), settings: {everythingElse: ... , ...} }
	// internal: { _settings:{ preprocessor: ("my.Preprocessor" || function), settings: {everythingElse: ... , ...}}, _internalFoo: "bar"}
	function alignPreprocessorStructure(oView, sType) {
		for (var i = 0, l = oView.mPreprocessors[sType].length; i < l; i++) {
			oView.mPreprocessors[sType][i]._settings = {};
			for (var sProp in oView.mPreprocessors[sType][i]) {
				// copy all relevant settings to the internal settings object which gets passed to the preprocessor function
				if (sProp.indexOf("_") !== 0) {
					oView.mPreprocessors[sType][i]._settings[sProp] = oView.mPreprocessors[sType][i][sProp];
				}
			}
		}
	}

	// create internal registry by converting single declarations to array, for compatibility
	function initLocalPreprocessorsRegistry(oView, mSettings) {
		if (mSettings.preprocessors) {
			// shallow copy to avoid issues when manipulating the internal object structure
			oView.mPreprocessors = jQuery.extend({}, mSettings.preprocessors);
			for (var sType in oView.mPreprocessors) {
				if (!Array.isArray(oView.mPreprocessors[sType])) {
					oView.mPreprocessors[sType] = [oView.mPreprocessors[sType]];
				}
				alignPreprocessorStructure(oView, sType);
			}
		}
	}

	function initAsyncState(oView) {
		oView.oAsyncState = {};
		oView.oAsyncState.promise = new Promise(function(fnResolve, fnReject) {
			oView.oAsyncState.complete = function() {
				if (!oView.oAsyncState.error) {
					fnResolve(oView);
				} else {
					fnReject(oView.oAsyncState.error);
				}
			};
		});
	}

	/**
	* Initialize the View and connect (create if no instance is given) the Controller
	*
	* @param {object} mSettings settings for the view
	* @param {object.string} mSettings.viewData view data
	* @param {object.string} mSettings.viewName view name
	* @param {object.boolean} [mSettings.async] set the view to load a view resource asynchronously
	* @private
	*/
	View.prototype._initCompositeSupport = function(mSettings) {
		// if preprocessors available and this != XMLView
		jQuery.sap.assert(!mSettings.preprocessors || this.getMetadata().getName().indexOf("XMLView"), "Preprocessors only available for XMLView");

		// init View with constructor settings
		// (e.g. parse XML or identify default controller)
		// make user specific data available during view instantiation
		this.oViewData = mSettings.viewData;
		// remember the name of this View
		this.sViewName = mSettings.viewName;

		var that = this;

		initLocalPreprocessorsRegistry(this, mSettings);

		// create a Promise that represents the view initialization state
		if (mSettings.async) {
			initAsyncState(this);
		}

		//check if there are custom properties configured for this view, and only if there are, create a settings preprocessor applying these
		var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration');
		if (CustomizingConfiguration && CustomizingConfiguration.hasCustomProperties(this.sViewName, this)) {
			this._fnSettingsPreprocessor = function(mSettings) {
				var sId = this.getId();
				if (CustomizingConfiguration && sId) {
					if (that.isPrefixedId(sId)) {
						sId = sId.substring((that.getId() + "--").length);
					}
					var mCustomSettings = CustomizingConfiguration.getCustomProperties(that.sViewName, sId, that);
					if (mCustomSettings) {
						mSettings = jQuery.extend(mSettings, mCustomSettings); // override original property initialization with customized property values
					}
				}
			};
		}

		var fnPropagateOwner = function(fn) {
			jQuery.sap.assert(typeof fn === "function", "fn must be a function");

			var Component = sap.ui.require("sap/ui/core/Component");
			var oOwnerComponent = Component && Component.getOwnerComponentFor(that);
			if (oOwnerComponent) {
				return oOwnerComponent.runAsOwner(fn);
			} else {
				return fn.call();
			}
		};

		var fnInitController = function() {
			var oPromise = createAndConnectController(that, mSettings);
			if (oPromise instanceof Promise) {
				return oPromise.then(function() {
					// the controller is connected now => notify the view implementations
					if (that.onControllerConnected) {
						// make sure that in case of async callback for controller
						// creation the owner is propagated properly
						fnPropagateOwner(function() {
							that.onControllerConnected(that.oController);
						});
					}
				});
			} else {
				// the controller is connected now => notify the view implementations
				if (that.onControllerConnected) {
					that.onControllerConnected(that.oController);
				}
			}
		};

		if (this.initViewSettings) {
			if (mSettings.async) {
				this.initViewSettings(mSettings)
					.then(function() {
						return fnPropagateOwner(fnInitController);
					})
					.then(function() {
						return that.runPreprocessor("controls", that);
					})
					.then(function() {
						fnPropagateOwner(that.fireAfterInit.bind(that));
						// resolve/reject the #loaded Promise
						that.oAsyncState.complete();
					});
			} else {
				this.initViewSettings(mSettings);
				fnInitController();
				this.runPreprocessor("controls", this, true);
				this.fireAfterInit();
			}
		}
	};

	/**
	 * Returns the view's Controller instance or null for a controller-less View.
	 *
	 * @return {object} Controller of this view.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	View.prototype.getController = function() {
		return this.oController;
	};

	/**
	 * Returns an Element by its id in the context of the View.
	 *
	 * @param {string} sId view local Id of the Element
	 * @return {sap.ui.core.Element} Element by its id or undefined
	 * @public
	 */
	View.prototype.byId = function(sId) {
		return sap.ui.getCore().byId(this.createId(sId));
	};

	/**
	 * Convert the given view local Element id to a globally unique id
	 * by prefixing it with the view Id.
	 *
	 * @param {string} sId view local Id of the Element
	 * @return {string} prefixed id
	 * @public
	 */
	View.prototype.createId = function(sId) {
		if (!this.isPrefixedId(sId)) {
			// views have 2 dashes as separator, components 3 and controls/elements 1
			sId = this.getId() + "--" + sId;
		}
		return sId;
	};

	/**
	* Checks whether the given ID is already prefixed with this View's ID
	*
	* @param {string} potentially prefixed id
	* @return {boolean} whether the ID is already prefixed
	*/
	View.prototype.isPrefixedId = function(sId) {
		return !!(sId && sId.indexOf(this.getId() + "--") === 0);
	};

	/**
	* Creates and connects the controller if the controller is not given in the
	* mSettings
	*
	* @param {sap.ui.core.mvc.XMLView} the instance of the view that should be processed
	* @param {object} [mSettings]
	* @param {object.controller} [mSettings.controller] the controller of the view instance
	* @private
	*/
	var createAndConnectController = function(oThis, mSettings) {

		if (!sap.ui.getCore().getConfiguration().getControllerCodeDeactivated()) {
			// only set when used internally
			var oController = mSettings.controller,
			    sName = oController && typeof oController.getMetadata === "function" && oController.getMetadata().getName();

			if (!oController && oThis.getControllerName) {
				// get optional default controller name
				var defaultController = oThis.getControllerName();
				if (defaultController) {
					// check for controller replacement
					var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration');
					var sControllerReplacement = CustomizingConfiguration && CustomizingConfiguration.getControllerReplacement(defaultController, ManagedObject._sOwnerId);
					if (sControllerReplacement) {
						defaultController = typeof sControllerReplacement === "string" ? sControllerReplacement : sControllerReplacement.controllerName;
					}
					// create controller
					oController = sap.ui.controller(defaultController);
					sName = defaultController;
				}
			}

			if ( oController ) {
				oController = Controller.extendIfRequired(oController, sName, oThis.oAsyncState);
				if (oController instanceof Promise) {
					if (!oThis.oAsyncState) {
						throw new Error("The view " + oThis.sViewName + " runs in sync mode and therefore cannot use async controller extensions!");
					}
					return oController.then(function(oController) {
						oThis.oController = oController;
						// connect controller
						oController.connectToView(oThis);
					});
				} else {
					oThis.oController = oController;
					// connect controller
					oController.connectToView(oThis);
				}
			}

		} else {
			oThis.oController = {};
		}
	};

	/**
	 * Returns user specific data object
	 *
	 * @return {object} viewData
	 * @public
	 */
	View.prototype.getViewData = function() {
		return this.oViewData;
	};

	function deleteAsyncState() {
		this.oAsyncState = null;
	}

	/**
	 * exit hook
	 *
	 * @private
	 */
	View.prototype.exit = function() {
		this.fireBeforeExit();
		this.oController = null;
		if (this.oAsyncState) {
			var fnDelete = deleteAsyncState.bind(this);
			// async state needs to be kept until completed
			this.oAsyncState.promise.then(fnDelete, fnDelete);
		}
	};

	/**
	 * onAfterRendering hook
	 *
	 * @private
	 */
	View.prototype.onAfterRendering = function() {
		this.fireAfterRendering();
	};

	/**
	 * onBeforeRendering hook
	 *
	 * @private
	 */
	View.prototype.onBeforeRendering = function() {
		this.fireBeforeRendering();
	};

	/**
	 * Override clone method to avoid conflict between generic cloning of content
	 * and content creation as defined by the UI5 Model View Controller lifecycle.
	 *
	 * For more details see the development guide section about Model View Controller in UI5.
	 *
	 * @param {string} [sIdSuffix] a suffix to be appended to the cloned element id
	 * @param {string[]} [aLocalIds] an array of local IDs within the cloned hierarchy (internally used)
	 * @return {sap.ui.core.Element} reference to the newly created clone
	 * @protected
	 */
	View.prototype.clone = function(sIdSuffix, aLocalIds) {
		var mSettings = {}, sKey, oClone;
		//Clone properties (only those with non-default value)
		for (sKey in this.mProperties  && !(this.isBound && this.isBound(sKey))) {
			if ( this.mProperties.hasOwnProperty(sKey) ) {
				mSettings[sKey] = this.mProperties[sKey];
			}
		}
		oClone = Control.prototype.clone.call(this, sIdSuffix, aLocalIds, {cloneChildren:false, cloneBindings: true});
		oClone.applySettings(mSettings);
		return oClone;
	};

	function getViewInfo(oView, bSync) {
		return {
			name: oView.sViewName,
			componentId: oView._sOwnerId,
			id: oView.getId(),
			caller: oView + " (" + oView.sViewName + ")",
			sync: !!bSync
		};
	}

	function getFnProcess(oPreprocessor, sType) {
		if (typeof oPreprocessor.preprocessor === "string") {
			// module string given, resolve and retrieve object
			jQuery.sap.require(oPreprocessor.preprocessor);
			// cache it, e.g. for other views
			oPreprocessor.preprocessor = jQuery.sap.getObject(oPreprocessor.preprocessor).process;
		}
		return oPreprocessor.preprocessor;
	}

	// concat preprocessors in the correct order (onDemand -> global -> local)
	function getPreprocessorQueue(aGlobalPreprocessors, aLocalPreprocessors) {
		var i, l, oOnDemandPreprocessor, aPreprocessors = [];
		for (i = 0, l = aGlobalPreprocessors.length; i < l; i++) {
			if (aGlobalPreprocessors[i]._onDemand) {
				// special treatment as the on-demand preprocessor config needs to be extended to its local config
				oOnDemandPreprocessor = aGlobalPreprocessors[i];
			} else {
				aPreprocessors.push(aGlobalPreprocessors[i]);
			}
		}
		for (i = 0, l = aLocalPreprocessors.length; i < l; i++) {
			var bOnDemand = !aLocalPreprocessors[i].preprocessor;
			if (bOnDemand && oOnDemandPreprocessor) {
				// ondemand preprocessor activated - extend the local config
				aPreprocessors.unshift(jQuery.extend(aLocalPreprocessors[i], oOnDemandPreprocessor));
			} else if (!bOnDemand) {
				aPreprocessors.push(aLocalPreprocessors[i]);
			}
		}
		return aPreprocessors;
	}

	/**
	 * Executes preprocessors for a type of source
	 *
	 * @param {string} sType
	 *   the type of preprocessor, e.g. "raw", "xml" or "controls"
	 * @param {object|string|Element} vSource
	 *   the view source as a JSON object, a raw text, an XML document element or a Promise resolving with those
	 * @param {boolean} [bSync]
	 *   describes the view execution, true if sync
	 * @returns {Promise|object|string|element}
	 *   a promise resolving with the processed source or an error | the source when bSync=true
	 * @protected
	 */
	View.prototype.runPreprocessor = function(sType, vSource, bSync) {

		var sViewType = this.getMetadata().getClass()._sType ,
			oViewInfo = getViewInfo(this, bSync),
			aPreprocessors,
			aGlobalPreprocessors = View._mPreprocessors[sViewType] && View._mPreprocessors[sViewType][sType] || [],
			aLocalPreprocessors = this.mPreprocessors && this.mPreprocessors[sType] || [],
			mSettings,
			fnProcess,
			fnAppendPreprocessor,
			pChain;

		aPreprocessors = getPreprocessorQueue(aGlobalPreprocessors, aLocalPreprocessors);
		// in async case we need a promise chain
		if (!bSync) {
			fnAppendPreprocessor = function(vProcessedSource) {
				return fnProcess(vProcessedSource, oViewInfo, mSettings);
			};
			pChain = Promise.resolve(vSource);
		}

		for (var i = 0, l = aPreprocessors.length; i < l; i++) {
			fnProcess = getFnProcess(aPreprocessors[i], sType);
			if (bSync && aPreprocessors[i]._syncSupport === true) {
				// run preprocessor directly in sync mode
				vSource = fnProcess(vSource, oViewInfo, aPreprocessors[i]._settings);
			} else if (!bSync) {
				// append future preprocessor run to promise chain
				mSettings = aPreprocessors[i]._settings;
				pChain = pChain.then(fnAppendPreprocessor);
			} else {
				jQuery.sap.log.debug("Async \"" + sType + "\"-preprocessor was skipped in sync view execution for " + sViewType + "View", this.getId());
			}
		}

		return bSync ? vSource : pChain;
	};

	function initGlobalPreprocessorsRegistry(sType, sViewType) {
		if (!View._mPreprocessors[sViewType]) {
			View._mPreprocessors[sViewType] = {};
		}
		if (!View._mPreprocessors[sViewType][sType]) {
			View._mPreprocessors[sViewType][sType] = [];
		}
	}

	function onDemandPreprocessorExists(oView, sViewType, sType) {
		 View._mPreprocessors[sViewType][sType].forEach(function(oPreprocessor) {
			if (oPreprocessor._onDemand) {
				jQuery.sap.log.error("Registration for \"" + sType + "\" failed, only one on-demand-preprocessor allowed", oView.getMetadata().getName());
				return false;
			}
		});
		return true;
	}

	/**
	 * Register a preprocessor for all views of a specific type.
	 *
	 * The preprocessor can be registered for several stages of view initialization, which are
	 * dependant from the view type, e.g. "raw", "xml" or already initialized "controls". If there is a preprocessor
	 * passed to or activated at the view instance already, that one is used. When several preprocessors are registered
	 * for one hook, it has to be made sure that they do not conflict when beeing processed serially.
	 *
	 * It can be either a module name as string of an implementation of {@link sap.ui.core.mvc.View.Preprocessor} or a
	 * function with a signature according to {@link sap.ui.core.mvc.View.Preprocessor.process}.
	 *
	 * <strong>Note</strong>: Preprocessors only work in async views and will be ignored when the view is instantiated
	 * in sync mode by default, as this could have unexpected side effects. You may override this behaviour by setting the
	 * <code>bSyncSupport</code> flag to <code>true</code>.
	 *
	 * @protected
	 * @static
	 * @param {string} sType
	 * 		the type of content to be processed
	 * @param {string|function} vPreprocessor
	 * 		module path of the preprocessor implementation or a preprocessor function
	 * @param {string} sViewType
	 * 		type of the calling view, e.g. <code>XML</code>
	 * @param {boolean} bSyncSupport
	 * 		declares if the vPreprocessor ensures safe sync processing. This means the preprocessor will be executed
	 * 		also for sync views. Please be aware that any kind of async processing (like Promises, XHR, etc) may
	 * 		break the view initialization and lead to unexpected results.
	 * @param {boolean} [bOnDemand]
	 * 		on-demand preprocessor which enables developers to quickly activate the preprocessor for a view,
	 * 		by setting <code>preprocessors : { xml }</code>, for example. This should be false except for very special
	 * 		cases. There can only be one on-demand preprocessor per content type.
	 * @param {object} [mSettings]
	 * 		optional configuration for preprocessor
	 */
	View.registerPreprocessor = function(sType, vPreprocessor, sViewType, bSyncSupport, bOnDemand, mSettings) {

		// determine optional parameters
		if (typeof bOnDemand !== "boolean") {
			mSettings = bOnDemand;
			bOnDemand = false;
		}
		if (vPreprocessor) {
			initGlobalPreprocessorsRegistry(sType, sViewType);
			if (bOnDemand && !onDemandPreprocessorExists(this, sViewType, sType)) {
				return;
			}
			View._mPreprocessors[sViewType][sType].push({
				preprocessor: vPreprocessor,
				_onDemand: bOnDemand,
				_syncSupport: bSyncSupport,
				_settings: mSettings
			});
			jQuery.sap.log.debug("Registered " + (bOnDemand ? "on-demand-" : "") + "preprocessor for \"" + sType + "\"" +
			(bSyncSupport ? " with syncSupport" : ""), this.getMetadata().getName());
		} else {
			jQuery.sap.log.error("Registration for \"" + sType + "\" failed, no preprocessor specified",  this.getMetadata().getName());
		}
	};

	function isOnDemand(oPreprocessor) {
		return !!oPreprocessor._onDemand;
	}

	/**
	* Checks if any preprocessors are active for the specified type
	*
	* @param {string} sType Type of the preprocessor, e.g. "raw", "xml" or "controls"
	* @returns {boolean} <code>true</code> if a preprocessor is active
	* @protected
	*/
	View.prototype.hasPreprocessor = function(sType) {
		var bHasGlobalPreprocessor, bHasLocalPreprocessor, sViewType;
		sViewType =  this.getMetadata().getClass()._sType;

		// if a local preprocessor is present there is either a local or an on-demand preprocessor active
		bHasLocalPreprocessor = this.mPreprocessors && this.mPreprocessors[sType];
		// global preprocessor may be on-demand, hence we need to check for at least one non on-demand preprocessor
		bHasGlobalPreprocessor = View._mPreprocessors && View._mPreprocessors[sViewType] && View._mPreprocessors[sViewType][sType];
		bHasGlobalPreprocessor = bHasGlobalPreprocessor && !View._mPreprocessors[sViewType][sType].every(isOnDemand);

		return !!(bHasLocalPreprocessor || bHasGlobalPreprocessor);
	};

	/**
	 * An (optional) method to be implemented by Views. When no controller instance is given at View instantiation time
	 * AND this method exists and returns the (package and class) name of a controller, the View tries to load and
	 * instantiate the controller and to connect it to itself.
	 *
	 * @return {string} the name of the controller
	 * @public
	 * @name sap.ui.core.mvc.View#getControllerName
	 * @function
	 */


	/**
	 * Creates a view of the given type, name and with the given id.
	 *
	 * The <code>vView</code> configuration object can have the following properties for the view
	 * instantiation:
	 * <ul>
	 * <li>The ID <code>vView.id</code> specifies an ID for the View instance. If no ID is given,
	 * an ID will be generated.</li>
	 * <li>The view name <code>vView.viewName</code> corresponds to an XML module that can be loaded
	 * via the module system (vView.viewName + suffix ".view.xml")</li>
	 * <li>The controller instance <code>vView.controller</code> must be a valid controller implementation.
	 * The given controller instance overrides the controller defined in the view definition</li>
	 * <li>The view type <code>vView.type</code> specifies what kind of view will be instantiated. All valid
	 * view types are listed in the enumeration sap.ui.core.mvc.ViewType.</li>
	 * <li>The view data <code>vView.viewData</code> can hold user specific data. This data is available
	 * during the whole lifecycle of the view and the controller</li>
	 * <li>The view loading mode <code>vView.async</code> must be a boolean and defines if the view source is loaded
	 * synchronously or asynchronously. In async mode, the view is rendered empty initially, and rerenderd with the
	 * loaded view content.</li>
	 * <li><code>vView.preprocessors</code></li> can hold a map from the specified preprocessor type (e.g. "xml") to an array of
	 * preprocessor configurations; each configuration consists of a <code>preprocessor</code> property (optional when
	 * registered as on-demand preprocessor) and may contain further preprocessor-specific settings. The preprocessor can
	 * be either a module name as string implementation of {@link sap.ui.core.mvc.View.Preprocessor} or a function according to
	 * {@link sap.ui.core.mvc.View.Preprocessor.process}. Do not set properties starting with underscore like <code>_sProperty</code>
	 * property, these are reserved for internal purposes. When several preprocessors are provided for one hook, it has to be made
	 * sure that they do not conflict when beeing processed serially.
	 *
	 * <strong>Note</strong>: These preprocessors are only available to this instance. For global or
	 * on-demand availability use {@link sap.ui.core.mvc.XMLView.registerPreprocessor}.
	 *
	 * <strong>Note</strong>: Please note that preprocessors in general are currently only available
	 * to XMLViews.
	 *
	 * <strong>Note</strong>: Preprocessors only work in async views and will be ignored when the view is instantiated
	 * in sync mode by default, as this could have unexpected side effects. You may override this behaviour by setting the
	 * bSyncSupport flag of the preprocessor to true.
	 *
	 * @param {string} sId id of the newly created view, only allowed for instance creation
	 * @param {string|object} [vView] the view name or view configuration object
	 * @param {boolean} [vView.async] defines how the view source is loaded and rendered later on
	 * @public
	 * @static
	 * @return {sap.ui.core.mvc.View} the created View instance
	 */
	sap.ui.view = function(sId, vView, sType /* used by factory functions */) {
		var view = null, oView = {};

		// if the id is a configuration object or a string
		// and the vView is not defined we shift the parameters
		if (typeof sId === "object" ||
				typeof sId === "string" && vView === undefined) {
			vView = sId;
			sId = undefined;
		}

		// prepare the parameters
		if (vView) {
			if (typeof vView === "string") {
				oView.viewName = vView;
			} else {
				oView = vView;
			}
		}

		// can be removed when generic type checking for special settings is introduced
		jQuery.sap.assert(!oView.async || typeof oView.async === "boolean", "sap.ui.view factory: Special setting async has to be of the type 'boolean'!");

		// apply the id if defined
		if (sId) {
			oView.id = sId;
		}

		// apply the type defined in specialized factory functions
		if (sType) {
			oView.type = sType;
		}

		// view replacement
		var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration');
		if (CustomizingConfiguration) {
			var customViewConfig = CustomizingConfiguration.getViewReplacement(oView.viewName, ManagedObject._sOwnerId);
			if (customViewConfig) {
				jQuery.sap.log.info("Customizing: View replacement for view '" + oView.viewName + "' found and applied: " + customViewConfig.viewName + " (type: " + customViewConfig.type + ")");
				jQuery.extend(oView, customViewConfig);
			} else {
				jQuery.sap.log.debug("Customizing: no View replacement found for view '" + oView.viewName + "'.");
			}
		}

		// view creation
		if (!oView.type) {
			throw new Error("No view type specified.");
		} else if (oView.type === ViewType.JS) {
			var JSView = sap.ui.requireSync('sap/ui/core/mvc/JSView');
			view = new JSView(oView);
		} else if (oView.type === ViewType.JSON) {
			var JSONView = sap.ui.requireSync('sap/ui/core/mvc/JSONView');
			view = new JSONView(oView);
		} else if (oView.type === ViewType.XML) {
			var XMLView = sap.ui.requireSync('sap/ui/core/mvc/XMLView');
			view = new XMLView(oView);
		} else if (oView.type === ViewType.HTML) {
			var HTMLView = sap.ui.requireSync('sap/ui/core/mvc/HTMLView');
			view = new HTMLView(oView);
		} else if (oView.type === ViewType.Template) {
			var TemplateView = sap.ui.requireSync('sap/ui/core/mvc/TemplateView');
			view = new TemplateView(oView);
		} else { // unknown view type
			throw new Error("Unknown view type " + oView.type + " specified.");
		}

		return view;
	};

	/**
	* Creates a Promise representing the state of the view initialization.
	*
	* For views that are loading asynchronously (by setting async=true) this Promise is created by view
	* initialization. Synchronously loading views get wrapped in an immediately resolving Promise.
	*
	* @since 1.30
	* @public
	* @return {Promise} resolves with the complete view instance, reject with any thrown error
	*/
	View.prototype.loaded = function() {
		if (!this.oAsyncState) {
			// resolve immediately with this view instance
			return Promise.resolve(this);
		} else {
			return this.oAsyncState.promise;
		}
	};


	/**
	 * Helper method to resolve an event handler either locally (from a controller) or globally.
	 *
	 * Which contexts are checked for the event handler depends on the syntax of the name:
	 * <ul>
	 * <li><i>relative</i>: names starting with a dot ('.') must specify a handler in
	 *     the controller (example: <code>".myLocalHandler"</code>)</li>
	 * <li><i>absolute</i>: names that contain, but do not start with a dot ('.') are
	 *     always assumed to mean a global handler function. {@link jQuery.sap.getObject}
	 *     will be used to retrieve the function (example: <code>"some.global.handler"</code> )</li>
	 * <li><i>legacy</i>: Names that contain no dot at all are first interpreted as a relative name
	 *     and then - if nothing is found - as an absolute name. This variant is only supported
	 *     for backward compatibility (example: <code>"myHandler"</code>)</li>
	 * </ul>
	 *
	 * The returned settings will always use the given <code>oController</code> as context object ('this')
	 * This should allow the implementation of generic global handlers that might need an easy back link
	 * to the controller/view in which they are currently used (e.g. to call createId/byId). It also makes
	 * the development of global event handlers more consistent with controller local event handlers.
	 *
	 * <strong>Note</strong>: It is not mandatory but improves readability of declarative views when
	 * legacy names are converted to relative names where appropriate.
	 *
	 * @param {string} sName the name to resolve
	 * @param {sap.ui.core.mvc.Controller} oController the controller to use as context
	 * @return {any[]} an array with function and context object, suitable for applySettings.
	 * @private
	 */
	View._resolveEventHandler = function(sName, oController) {

		var fnHandler;

		if (!sap.ui.getCore().getConfiguration().getControllerCodeDeactivated()) {
			switch (sName.indexOf('.')) {
				case 0:
					// starts with a dot, must be a controller local handler
					// usage of jQuery.sap.getObject to allow addressing functions in properties
					fnHandler = oController && jQuery.sap.getObject(sName.slice(1), undefined, oController);
					break;
				case -1:
					// no dot at all: first check for a controller local, then for a global handler
					fnHandler = oController && oController[sName];
					if ( fnHandler != null ) {
						// if the name can be resolved, don't try to find a global handler (even if it is not a function)
						break;
					}
					// falls through
				default:
					fnHandler = jQuery.sap.getObject(sName);
			}
		} else {
			// When design mode is enabled, controller code is not loaded. That is why we stub the handler functions.
			fnHandler = function() {};
		}

		if ( typeof fnHandler === "function" ) {
			// the handler name is set as property on the function to keep this information
			// e.g. for serializers which convert a control tree back to a declarative format
			fnHandler._sapui_handlerName = sName;
			// always attach the handler with the controller as context ('this')
			return [ fnHandler, oController ];
		}

		// return undefined
	};

	/**
	 * Interface for Preprocessor implementations that can be hooked in the view life cycle.
	 *
	 * There are two possibilities to use the preprocessor. It can be either passed to the view via the mSettings.preprocessors object
	 * where it is the executed only for this instance, or by the registerPreprocessor method of the view type. Currently this is
	 * available only for XMLViews (as of version 1.30).
	 *
	 * @see sap.ui.view
	 * @see sap.ui.core.mvc.View.registerPreprocessor (the method is available specialized for view types, so use the following)
	 * @see sap.ui.core.mvc.XMLView.registerPreprocessor
	 *
	 * @author SAP SE
	 * @since 1.30
	 * @interface
	 * @name sap.ui.core.mvc.View.Preprocessor
	 * @public
	 */

	/**
	 * Processing method that must be implemented by a Preprocessor.
	 *
	 * @name sap.ui.core.mvc.View.Preprocessor.process
	 * @function
	 * @public
	 * @static
	 * @abstract
	 * @param {object} vSource the source to be processed
	 * @param {object} oViewInfo identification information about the calling instance
	 * @param {string} oViewInfo.id the id
	 * @param {string} oViewInfo.name the name
	 * @param {string} oViewInfo.componentId the id of the owning Component
	 * @param {string} oViewInfo.caller
	 * 		identifies the caller of this preprocessor; basis for log or exception messages
	 * @param {object} [mSettings]
	 * 		settings object containing the settings provided with the preprocessor
	 * @return {object|Promise}
	 * 		the processed resource or a promise which resolves with the processed resource or an error according to the
	 * 		declared preprocessor sync capability
	 */

	return View;

});
