/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.View.
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/core/Control',
	'sap/ui/core/mvc/Controller',
	'sap/base/util/merge',
	'sap/ui/core/library',
	"./ViewRenderer",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(
		ManagedObject,
		Control,
		Controller,
		merge,
		library,
		ViewRenderer,
		assert,
		Log,
		jQuery
	) {
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
	 * Applications should not call the constructor directly, but use one of the view factories instead,
	 * e.g. {@link #.create View.create}.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class A base class for Views.
	 *
	 * Introduces the relationship to a Controller, some basic visual appearance settings like width and height,
	 * and provides lifecycle events.
	 *
	 * Views form an ID scope for the elements and controls in their content. They can prefix the IDs of
	 * elements either automatically (e.g. XMLView) or programmatically (using {@link #createId}).
	 * With method {@link #byId}, elements or controls can be found with their view-local ID.
	 * Also see {@link topic:91f28be26f4d1014b6dd926db0e91070 "Support for Unique IDs"} in the documentation.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.mvc.View
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var View = Control.extend("sap.ui.core.mvc.View", /** @lends sap.ui.core.mvc.View.prototype */ { metadata : {

		interfaces: [
			"sap.ui.core.IDScope"
		],
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
			controller : 'sap.ui.core.mvc.Controller',

			/**
			 * Name of the controller class to use for this view.
			 * If given, it overrides the same information in the view definition (XML, HTML).
			 */
			controllerName : 'string',

			/**
			 * Preprocessors that the view can use before constructing the view.
			 */
			preprocessors : 'Object',

			/**
			 * (module) Name of a resource bundle that should be loaded for this view
			 */
			resourceBundleName : 'string',

			/**
			 * URL of a resource bundle that should be loaded for this view
			 */
			resourceBundleUrl : 'sap.ui.core.URI',

			/**
			 * Locale that should be used to load a resource bundle for this view
			 */
			resourceBundleLocale : 'string', // should be something like 'languageTag'

			/**
			 * Model name under which the resource bundle should be stored.
			 */
			resourceBundleAlias : 'string',

			/**
			 * Type of the view
			 */
			type : 'string',

			/**
			 * A view definition
			 */
			definition : 'any',

			/**
			 * Deprecated as of 1.56: Use <code>definition</code> instead.
			 */
			viewContent : {
				type: 'any',
				deprecated: true
			},

			/**
			 * Additional configuration data that should be given to the view at construction time
			 * and which will be available early, even before model data or other constructor settings are applied.
			 */
			viewData : 'any',

			/**
			 * Determines initialization mode of the view
			 * @since 1.30
			 */
			async : {
				type : "boolean",
				defaultValue : false
			}
		},
		designtime: "sap/ui/core/designtime/mvc/View.designtime"
	}});

	/**
	 * Global map of preprocessors with view types and source types as keys,
	 * e.g. _mPreprocessors[sViewType][sSourceType]
	 *
	 * @private
	 */
	View._mPreprocessors = {};

	/**
	 * align object structure to internal preprocessor format to be able to store internal settings without conflicts
	 * external view: { preprocessor: ("my.Preprocessor" || function), settings: {everythingElse: ... , ...} }
	 * internal view: { _settings:{ preprocessor: ("my.Preprocessor" || function), settings: {everythingElse: ... , ...}}, _internalFoo: "bar"}
	 *
	 * @param {sap.ui.core.mvc.View.Preprocessor} oPreprocessor Preprocessor config object
	 * @private
	 */
	function alignPreprocessorStructure(oPreprocessor) {
		oPreprocessor._settings = {};
		for (var sProp in oPreprocessor) {
			// copy all relevant settings to the internal settings object which gets passed to the preprocessor function
			if (sProp.indexOf("_") !== 0) {
				oPreprocessor._settings[sProp] = oPreprocessor[sProp];
			}
		}
	}

	/**
	 * resolves either the module dependency or the function which was passed to settings to the internal
	 * preprocessor config object
	 *
	 * @param {object} oPreprocessor Preprocessor config object
	 * @param {boolean} bAsync Whether processing is async or not
	 * @return {object} oPreprocessorImpl
	 * @private
	 */
	function initPreprocessor(oPreprocessor, bAsync) {
		var oPreprocessorImpl;

		if (typeof oPreprocessor.preprocessor === "string") {
			var sPreprocessorName = oPreprocessor.preprocessor.replace(/\./g, "/");
			// module string given, resolve and retrieve object
			if (bAsync) {
				 return new Promise(function(resolve, reject) {
					sap.ui.require([sPreprocessorName], function(oPreprocessorImpl) {
						resolve(oPreprocessorImpl);
					});
				});
			} else {
				return sap.ui.requireSync(sPreprocessorName);
			}
		} else if (typeof oPreprocessor.preprocessor === "function" && !oPreprocessor.preprocessor.process) {
			oPreprocessorImpl = {
				process: oPreprocessor.preprocessor
			};
		} else {
			oPreprocessorImpl = oPreprocessor.preprocessor;
		}

		if (bAsync) {
			return Promise.resolve(oPreprocessorImpl);
		} else {
			return oPreprocessorImpl;
		}
	}

	/**
	 * enqueue preprocessors per type in the correct order (onDemand -> global -> local)
	 *
	 * @param {string} sViewType Type of the view
	 * @param {string} sType type of the preprocessor for the specified viewType.
	 * @returns {object} aPreprocessors The preprocessor queue
	 * @private
	 */
	function getPreprocessorQueue(sViewType, sType) {
		var aLocalPreprocessors = this.mPreprocessors[sType] || [],
			aGlobalPreprocessors = [],
			i, l, oOnDemandPreprocessor, aPreprocessors = [];

		//clone static preprocessor settings
		if (View._mPreprocessors[sViewType] && View._mPreprocessors[sViewType][sType]) {
			aGlobalPreprocessors = View._mPreprocessors[sViewType][sType].map(function(oProcessor) {
				return jQuery.extend({}, oProcessor);
			});
		}

		for (i = 0, l = aGlobalPreprocessors.length; i < l; i++) {
			if (aGlobalPreprocessors[i]._onDemand) {
				// special treatment as the on-demand preprocessor needs its local activation
				oOnDemandPreprocessor = aGlobalPreprocessors[i];
			} else {
				aPreprocessors.push(aGlobalPreprocessors[i]);
			}
		}
		for (i = 0, l = aLocalPreprocessors.length; i < l; i++) {
			var bIsOnDemand = !aLocalPreprocessors[i].preprocessor;
			if (bIsOnDemand && oOnDemandPreprocessor) {
				// ondemand preprocessor activated - extend the local config
				aPreprocessors.unshift(jQuery.extend(aLocalPreprocessors[i], oOnDemandPreprocessor));
			} else if (!bIsOnDemand) {
				aPreprocessors.push(aLocalPreprocessors[i]);
			}
		}
		return aPreprocessors;
	}

	/**
	 * init internal registry and convert single declarations to array, for compatibility
	 *
	 * @param {sap.ui.core.mvc.View} oView This view instance
	 * @param {object} mSettings Settings for the view
	 * @private
	 */
	function initPreprocessorQueues(oView, mSettings) {
		var oViewClass = oView.getMetadata().getClass();

		function resolvePreprocessors(oPreprocessor) {
			oPreprocessor.preprocessor = initPreprocessor(oPreprocessor, mSettings.async);
		}

		// shallow copy to avoid issues when manipulating the internal object structure
		oView.mPreprocessors = jQuery.extend({}, mSettings.preprocessors);
		for (var _sType in oViewClass.PreprocessorType) {
			// build the array structure
			var sType = oViewClass.PreprocessorType[_sType];
			if (oView.mPreprocessors[sType] && !Array.isArray(oView.mPreprocessors[sType])) {
				oView.mPreprocessors[sType] = [oView.mPreprocessors[sType]];
			} else if (!oView.mPreprocessors[sType]) {
				oView.mPreprocessors[sType] = [];
			}
			oView.mPreprocessors[sType].forEach(alignPreprocessorStructure);
			oView.mPreprocessors[sType] = getPreprocessorQueue.call(oView, oViewClass._sType, sType);
			oView.mPreprocessors[sType].forEach(resolvePreprocessors);
		}
	}

	function initAsyncState(oView) {
		oView.oAsyncState = {};
		oView.oAsyncState.promise = null;
	}

	/**
	 * Creates and connects the controller if the controller is not given in the
	 * mSettings
	 *
	 * @param {sap.ui.core.mvc.XMLView} oThis the instance of the view that should be processed
	 * @param {object} [mSettings] Settings
	 * @returns {Promise|undefined} A promise for asynchronous or undefined for synchronous controllers
	 * @throws {Error}
	 * @private
	 */
	var createAndConnectController = function(oThis, mSettings) {

		if (!sap.ui.getCore().getConfiguration().getControllerCodeDeactivated()) {
			// only set when used internally
			var oController = mSettings.controller,
				sName = oController && typeof oController.getMetadata === "function" && oController.getMetadata().getName(),
				bAsync = mSettings.async;

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
					if (bAsync) {
						oController = Controller.create({name: defaultController});
					} else {
						oController = sap.ui.controller(defaultController, true /* oControllerImpl = true: do not extend controller inside factory; happens below (potentially async)! */);
					}
				}
			} else if (oController) {
				// if passed controller is not extended yet we need to do it.
				var sOwnerId = ManagedObject._sOwnerId;
				if (!oController._isExtended()) {
					if (bAsync) {
						oController = Controller.extendByCustomizing(oController, sName, bAsync)
							.then(function(oController) {
								return Controller.extendByProvider(oController, sName, sOwnerId, bAsync);
							});
					} else {
						oController = Controller.extendByCustomizing(oController, sName, bAsync);
						oController = Controller.extendByProvider(oController, sName, sOwnerId, bAsync);
					}
				} else if (bAsync) {
					oController = Promise.resolve(oController);
				}
			}

			if ( oController ) {
				var connectToView = function(oController) {
					oThis.oController = oController;
					oController.oView = oThis;
				};

				if (bAsync) {
					if (!oThis.oAsyncState) {
						throw new Error("The view " + oThis.sViewName + " runs in sync mode and therefore cannot use async controller extensions!");
					}
					return oController.then(connectToView);
				} else {
					connectToView(oController);
				}
			}
		} else {
			sap.ui.controller("sap.ui.core.mvc.EmptyControllerImpl", {"_sap.ui.core.mvc.EmptyControllerImpl":true});
			oThis.oController = sap.ui.controller("sap.ui.core.mvc.EmptyControllerImpl");
		}
	};

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
		assert(!mSettings.preprocessors || this.getMetadata().getName().indexOf("XMLView"), "Preprocessors only available for XMLView");

		// init View with constructor settings
		// (e.g. parse XML or identify default controller)
		// make user specific data available during view instantiation
		this.oViewData = mSettings.viewData;
		// remember the name of this View
		this.sViewName = mSettings.viewName;

		var that = this;

		initPreprocessorQueues(this, mSettings);

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

		var fnPropagateOwner = function(fnCallback, bAsync) {
			assert(typeof fnCallback === "function", "fn must be a function");

			var Component = sap.ui.require("sap/ui/core/Component");
			var oOwnerComponent = Component && Component.getOwnerComponentFor(that);
			if (oOwnerComponent) {
				if (bAsync) {
					// special treatment when component loading is async but instance creation is sync
					that.fnScopedRunWithOwner = that.fnScopedRunWithOwner || function(fnCallbackToBeScoped) {
						return oOwnerComponent.runAsOwner(fnCallbackToBeScoped);
					};
				}
				return oOwnerComponent.runAsOwner(fnCallback);
			}

			return fnCallback();
		};

		var fnAttachControllerToViewEvents = function(oView) {
			if (oView.oController && oView.oController.connectToView) {
				// Controller#connectToView does not only connect View and Controller,
				// it also attaches the Controller to the View's lifecycle events
				return oView.oController.connectToView(oView);
			}
		};

		var fnFireOnControllerConnected = function () {
			if (that.onControllerConnected) {
				return that.onControllerConnected(that.oController);
			}
		};

		if (this.initViewSettings) {
			if (mSettings.async) {
				// async processing starts here
				this.oAsyncState.promise = this.initViewSettings(mSettings)
					.then(function() {
						return fnPropagateOwner(createAndConnectController.bind(null, that, mSettings), true);
					})
					.then(function() {
						return fnPropagateOwner(fnFireOnControllerConnected, true);
					})
					.then(function() {
						// attach after controller and control tree are fully initialized
						return fnAttachControllerToViewEvents(that);
					})
					.then(function() {
						return that.runPreprocessor("controls", that, false);
					})
					.then(function() {
						return fnPropagateOwner(that.fireAfterInit.bind(that), true);
					})
					.then(function() {
						// async processing ends by resolving with the view
						return that;
					})
					.catch(function(e) {
						// deregister an erroneous instance from the Core's Elements registry
						// in sync Views this is done automatically by the ManagedObject constructor
						this.deregister();
						throw e;
					}.bind(this));
			} else {
				this.initViewSettings(mSettings);
				createAndConnectController(this, mSettings);
				fnFireOnControllerConnected();
				fnAttachControllerToViewEvents(this);

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
	 * Returns an element by its ID in the context of this view.
	 *
	 * This method expects a view-local ID of an element (the same as e.g. defined in the *.view.xml
	 * of an XMLView). For a search with a global ID (the value returned by <code>oElement.getId()</code>)
	 * you should rather use {@link sap.ui.core.Core#byId sap.ui.getCore().byId()}.
	 *
	 * @param {string} sId View local ID of the element
	 * @return {sap.ui.core.Element} Element by its ID or <code>undefined</code>
	 * @public
	 */
	View.prototype.byId = function(sId) {
		return sap.ui.getCore().byId(this.createId(sId));
	};

	/**
	 * Convert the given view local element ID to a globally unique ID
	 * by prefixing it with the view ID.
	 *
	 * @param {string} sId View local ID of the element
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
	 * Returns the local ID of an element by removing the view ID prefix or
	 * <code>null</code> if the ID does not contain a prefix.
	 *
	 * @param {string} sId Prefixed ID
	 * @return {string} ID without prefix or <code>null</code>
	 * @public
	 * @since 1.39.0
	 */
	View.prototype.getLocalId = function(sId) {
		var sPrefix = this.getId() + "--";
		return (sId && sId.indexOf(sPrefix) === 0) ? sId.slice(sPrefix.length) : null;
	};

	/**
	 * Checks whether the given ID already contains this view's ID prefix
	 *
	 * @param {string} sId ID that is checked for the prefix
	 * @return {boolean} whether the ID is already prefixed
	 */
	View.prototype.isPrefixedId = function(sId) {
		return !!(sId && sId.indexOf(this.getId() + "--") === 0);
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
		delete this.oController;
		delete this.oPreprocessorInfo;
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
	 * Creates a clone of this view.
	 *
	 * Overrides the clone method to avoid conflicts between generic cloning of the content aggregation
	 * and content creation as defined by the UI5 Model View Controller lifecycle.
	 *
	 * For more details see the {@link topic:a575619e25c2487f904bae71764e2350 View Cloning} section in
	 * the documentation.
	 *
	 * @param {string} [sIdSuffix] Suffix to be appended to the cloned element IDs
	 * @param {string[]} [aLocalIds] Array of local IDs within the cloned hierarchy (internally used)
	 * @returns {sap.ui.core.mvc.View} Reference to the newly created clone
	 * @public
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

		// If one of the clones event listeners is the template controller, change it to the views new controller
		// This prevents the cloned view from firing events on the template views controller
		var sEvent, aEventListeners, j;
		for (sEvent in oClone.mEventRegistry) {
			// ManagedObject already cloned mEventRegistry over to the new object, so we'll work on that
			aEventListeners = oClone.mEventRegistry[sEvent];

			for (j = aEventListeners.length - 1; j >= 0; j--) {
				if (aEventListeners[j].oListener === this.getController()) {
					aEventListeners[j] = {
						oListener: oClone.getController(),
						fFunction: aEventListeners[j].fFunction,
						oData: aEventListeners[j].oData
					};
				}
			}
		}

		oClone.applySettings(mSettings);

		return oClone;
	};

	/**
	 * Returns the preprocessors for this view instance.
	 *
	 * @returns {Object<string,sap.ui.core.mvc.View.Preprocessor[]>} A map containing the view preprocessors, keyed by their type
	 *
	 * @private
	 */
	View.prototype.getPreprocessors = function() {
		return this.mPreprocessors;
	};

	/**
	 * Returns the info object which is also passed to the preprocessors
	 * @see sap.ui.core.mvc.View.Preprocessor.process
	 *
	 * @param {boolean} bSync Describes the view execution, true if sync
	 * @returns {object} Info object for the view
	 *
	 * @protected
	 */
	View.prototype.getPreprocessorInfo = function(bSync) {
		if (!this.oPreprocessorInfo) {
			this.oPreprocessorInfo = {
				name: this.sViewName,
				componentId: this._sOwnerId,
				id: this.getId(),
				caller: this + " (" + this.sViewName + ")",
				sync: !!bSync
			};
		}
		if (View._supportInfo) {
			this.oPreprocessorInfo._supportInfo = View._supportInfo;
		}
		return this.oPreprocessorInfo;
	};

	/**
	 * Executes preprocessors for a type of source
	 *
	 * @param {string} sType
	 *   the type of preprocessor, e.g. "raw", "xml" or "controls"
	 * @param {object|string|Element} vSource
	 *   the view source as a JSON object, a raw text, an XML document element or a Promise resolving with those
	 * @param {boolean} [bSync]
	 *   describes the view execution, true if sync
	 * @returns {Promise|object|string|Element}
	 *   a promise resolving with the processed source or an error | the source when bSync=true
	 * @protected
	 */
	View.prototype.runPreprocessor = function(sType, vSource, bSync) {

		var oViewInfo = this.getPreprocessorInfo(bSync),
			aPreprocessors = this.mPreprocessors && this.mPreprocessors[sType] || [],
			fnProcess,
			fnAppendPreprocessor,
			pChain;

		// in async case we need a promise chain
		if (!bSync) {
			fnAppendPreprocessor = function (oViewInfo, oPreprocessor) {
				// the Promise's success handler with bound oViewInfo and mSettings
				return function(vSource) {
					return oPreprocessor.preprocessor
						.then(function(oPreprocessorImpl) {
							return oPreprocessorImpl.process(vSource, oViewInfo, oPreprocessor._settings);
						});
				};
			};
			pChain = Promise.resolve(vSource);
		}

		for (var i = 0, l = aPreprocessors.length; i < l; i++) {
			if (bSync && aPreprocessors[i]._syncSupport === true) {
				fnProcess = aPreprocessors[i].preprocessor.process;
				// run preprocessor directly in sync mode
				vSource = fnProcess(vSource, oViewInfo, aPreprocessors[i]._settings);
			} else if (!bSync) {
				// append future preprocessor run to promise chain
				pChain = pChain.then(fnAppendPreprocessor(oViewInfo, aPreprocessors[i]));
			} else {
				Log.debug("Async \"" + sType + "\"-preprocessor was skipped in sync view execution for " +
					this.getMetadata().getClass()._sType + "View", this.getId());
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
				Log.error("Registration for \"" + sType + "\" failed, only one on-demand-preprocessor allowed", oView.getMetadata().getName());
				return false;
			}
		});
		return true;
	}

	/**
	 * Register a preprocessor for all views of a specific type.
	 *
	 * The preprocessor can be registered for several stages of view initialization, which are
	 * dependent on the view type, e.g. "raw", "xml" or already initialized "controls". If there is a preprocessor
	 * passed to or activated at the view instance already, that one is used. When several preprocessors are registered
	 * for one hook, it has to be made sure that they do not conflict when being processed serially.
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
			Log.debug("Registered " + (bOnDemand ? "on-demand-" : "") + "preprocessor for \"" + sType + "\"" +
			(bSyncSupport ? " with syncSupport" : ""), this.getMetadata().getName());
		} else {
			Log.error("Registration for \"" + sType + "\" failed, no preprocessor specified",  this.getMetadata().getName());
		}
	};

	/**
	* Checks if any preprocessors are active for the specified type
	*
	* @param {string} sType Type of the preprocessor, e.g. "raw", "xml" or "controls"
	* @returns {boolean} <code>true</code> if a preprocessor is active
	* @protected
	*/
	View.prototype.hasPreprocessor = function(sType) {
		return !!this.mPreprocessors[sType].length;
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
	 * Creates a view of the given type, name and with the given ID.
	 *
	 * If the option <code>viewName</code> is given, the corresponding view module is loaded if needed.
	 *
	 * See also the API references for the specific view factories:
	 * <ul>
	 * <li>{@link sap.ui.core.mvc.XMLView.create}</li>
	 * <li>{@link sap.ui.core.mvc.JSView.create}</li>
	 * <li>{@link sap.ui.core.mvc.JSONView.create}</li>
	 * <li>{@link sap.ui.core.mvc.HTMLView.create}</li>
	 * </ul>
	 *
	 * @param {object} oOptions
	 *     Options for the view instantiation. Can contain any settings that are documented for the
	 *     {@link sap.ui.core.mvc.View}; specialized view types could bring in additional settings.
	 * @param {string} [oOptions.id]
	 *     Specifies an ID for the View instance. If no ID is given, one will be generated
	 * @param {string} [oOptions.viewName]
	 *     Name of the view resource in module name notation (dot-separated, without suffix); either
	 *     <code>viewName</code> or <code>definition</code> must be given
	 * @param {any} [oOptions.definition]
	 *     The view definition. Only supported for XML and HTML views. See also {@link sap.ui.core.mvc.XMLView.create}
	 *     and {@link sap.ui.core.mvc.HTMLView.create} for more information
	 * @param {sap.ui.core.mvc.ViewType} [oOptions.type]
	 *     Specifies what kind of view will be instantiated. All valid view types are listed in the enumeration
	 *     {@link sap.ui.core.mvc.ViewType}.
	 * @param {any} [oOptions.viewData]
	 *     A general purpose data bag, which is under full control of the caller. It can be retrieved with the
	 *     {@link sap.ui.core.mvc.View#getViewData} method during the whole lifecycle of the view and controller.
	 *     In contrast to data propagated from the parent control (e.g. models, binding contexts),
	 *     <code>viewData</code> can already be accessed at construction time, e.g. in the <code>onInit</code> hook of
	 *     the controller. Propagated data can only be accessed after the view has been added to the control hierarchy.
	 * @param {object} [oOptions.preprocessors]
	 *     Can hold a map from the specified preprocessor type (e.g. "xml") to an array of preprocessor configurations;
	 *     each configuration consists of a <code>preprocessor</code> property (optional when registered as on-demand
	 *     preprocessor) and may contain further preprocessor-specific settings. The preprocessor can be either a module
	 *     name as string implementation of {@link sap.ui.core.mvc.View.Preprocessor} or a function according to
	 *     {@link sap.ui.core.mvc.View.Preprocessor.process}. Do not set properties starting with underscore like
	 *     <code>_sProperty</code> property, these are reserved for internal purposes. When several preprocessors are
	 *     provided for one hook, it has to be made sure that they do not conflict when being processed serially.
	 *
	 *     <strong>Note</strong>: These preprocessors are only available to this instance. For global or
	 *     on-demand availability use {@link sap.ui.core.mvc.XMLView.registerPreprocessor}.
	 *     <strong>Note</strong>: Please note that preprocessors in general are currently only available to XMLViews
	 * @param {sap.ui.core.mvc.Controller} [oOptions.controller]
	 *     Controller instance to be used for this view. The given controller instance overrides the controller defined
	 *     in the view definition. Sharing a controller instance between multiple views is not supported.
	 * @public
	 * @static
	 * @since 1.56.0
	 * @returns {Promise<sap.ui.core.mvc.View>} A Promise which resolves with the created View instance
	 */
	View.create = function(oOptions) {
		var mParameters = merge({}, oOptions);
		mParameters.async = true;
		mParameters.viewContent = mParameters.definition;

		// Get current owner component to create the View with the proper owner
		// This is required as the viewFactory is called async
		var Component = sap.ui.require("sap/ui/core/Component");
		var oOwnerComponent;
		if (Component && ManagedObject._sOwnerId) {
			oOwnerComponent = Component.get(ManagedObject._sOwnerId);
		}

		function createView() {
			return viewFactory(mParameters.id, mParameters, mParameters.type).loaded();
		}

		return new Promise(function(resolve, reject) {
			 var sViewClass = getViewClassName(mParameters);
			 sap.ui.require([sViewClass], function(ViewClass){
				 resolve(ViewClass);
			 }, function(oError) {
				 reject(oError);
			 });
		})
		.then(function(ViewClass) {
			// Activate the asynchronous processing for XMLViews
			if (ViewClass.getMetadata().isA("sap.ui.core.mvc.XMLView")) {
				mParameters.processingMode = "sequential";
			}

			if (oOwnerComponent) {
				return oOwnerComponent.runAsOwner(createView);
			} else {
				return createView();
			}
		});
	};

	/**
	 * Used to bypass the public APIs returning a Promise.
	 * Some internal use-cases need the View instance synchronously instead of the wrapping Promises
	 * of the [...]View.create() factories: e.g. root-view creation in sap/ui/core/UIComponent
	 * Internally, the views might still be loaded and processed asynchronously.
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @see {sap.ui.view}
	 */
	View._legacyCreate = viewFactory;

	/**
	 * Creates a view of the given type, name and with the given ID.
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
	 * synchronously or asynchronously. In async mode, the view is rendered empty initially, and re-rendered with the
	 * loaded view content.</li>
	 * <li><code>vView.preprocessors</code></li> can hold a map from the specified preprocessor type (e.g. "xml") to an array of
	 * preprocessor configurations; each configuration consists of a <code>preprocessor</code> property (optional when
	 * registered as on-demand preprocessor) and may contain further preprocessor-specific settings. The preprocessor can
	 * be either a module name as string implementation of {@link sap.ui.core.mvc.View.Preprocessor} or a function according to
	 * {@link sap.ui.core.mvc.View.Preprocessor.process}. Do not set properties starting with underscore like <code>_sProperty</code>
	 * property, these are reserved for internal purposes. When several preprocessors are provided for one hook, it has to be made
	 * sure that they do not conflict when being processed serially.
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
	 * @param {sap.ui.core.mvc.ViewType} sType Specifies what kind of view will be instantiated. All valid
	 * view types are listed in the enumeration  {@link sap.ui.core.mvc.ViewType}.
	 * @param {boolean} [vView.async] defines how the view source is loaded and rendered later on
	 * @public
	 * @static
	 * @deprecated since 1.56: Use {@link sap.ui.core.mvc.View.create View.create} instead
	 * @return {sap.ui.core.mvc.View} the created View instance
	 */
	sap.ui.view = function(sId, vView, sType /* used by factory functions */) {
		var fnLogDeprecation = function(sMethod) {
			// get the viewname for logging
			var sName = "";
			if (typeof sId == "object") {
				sName = sId.viewName;
			}
			sName = sName || (vView && vView.name);

			Log[sMethod](
				"Do not use deprecated view factory functions (" + sName + ")." +
				"Use the static create function on the view module instead: [XML|JS|HTML|JSON|]View.create().",
				"sap.ui.view",
				null,
				function () {
					return {
						type: "sap.ui.view",
						name: sName
					};
				}
			);
		};

		if (vView && vView.async) {
			fnLogDeprecation("info");
		} else {
			fnLogDeprecation("warning");
		}
		return viewFactory(sId, vView, sType);
	};

	/*
	 * The old sap.ui.view implementation
	 *
	 * @private
	 */
	function viewFactory(sId, vView, sType) {
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
		assert(!oView.async || typeof oView.async === "boolean", "sap.ui.view factory: Special setting async has to be of the type 'boolean'!");

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
				Log.info("Customizing: View replacement for view '" + oView.viewName + "' found and applied: " + customViewConfig.viewName + " (type: " + customViewConfig.type + ")");
				jQuery.extend(oView, customViewConfig);
			} else {
				Log.debug("Customizing: no View replacement found for view '" + oView.viewName + "'.");
			}
		}

		var sViewClass = getViewClassName(oView);
		view = createView(sViewClass, oView);
		return view;
	}

	function getViewClassName(oViewSettings) {
		var sViewClass;

		// view creation
		if (!oViewSettings.type) {
			throw new Error("No view type specified.");
		} else if (oViewSettings.type === ViewType.JS) {
			sViewClass = 'sap/ui/core/mvc/JSView';
		} else if (oViewSettings.type === ViewType.JSON) {
			sViewClass = 'sap/ui/core/mvc/JSONView';
		} else if (oViewSettings.type === ViewType.XML) {
			sViewClass = 'sap/ui/core/mvc/XMLView';
		} else if (oViewSettings.type === ViewType.HTML) {
			sViewClass = 'sap/ui/core/mvc/HTMLView';
		} else if (oViewSettings.type === ViewType.Template) {
			sViewClass = 'sap/ui/core/mvc/TemplateView';
		} else { // unknown view type
			throw new Error("Unknown view type " + oViewSettings.type + " specified.");
		}

		return sViewClass;
	}

	function createView(sViewClass, oViewSettings) {
		var ViewClass = sap.ui.require(sViewClass);
		if (!ViewClass) {
			ViewClass = sap.ui.requireSync(sViewClass);
			if (oViewSettings.async) {
				//not supported
				Log.warning("sap.ui.view was called without requiring the according view class.");
			}
		}
		return new ViewClass(oViewSettings);
	}

	/**
	* Returns a Promise representing the state of the view initialization.
	*
	* For views that are loading asynchronously (by setting async=true) this Promise is created by view
	* initialization. Synchronously loading views get wrapped in an immediately resolving Promise.
	*
	* @since 1.30
	* @public
	* @deprecated since 1.66: Use {@link sap.ui.core.mvc.View.create View.create} instead
	* @return {Promise} resolves with the complete view instance, reject with any thrown error
	*/
	View.prototype.loaded = function() {
		if (this.oAsyncState && this.oAsyncState.promise) {
			return this.oAsyncState.promise;
		} else {
			// resolve immediately with this view instance
			return Promise.resolve(this);
		}
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

	/**
	 * Cache key provider method that can be implemented by a preprocessor.
	 *
	 * This method  should be used to invalidate a cache on the currently preprocessed view. Therefore, a Promise needs
	 * to be passed which resolves with the according cache key increment.
	 *
	 * <strong>Note:</strong> Caching is only available for XMLViews! Some parts of the feature are still experimental,
	 * For further information see {@link sap.ui.xmlview}
	 *
	 * @name sap.ui.core.mvc.View.Preprocessor.getCacheKey
	 * @function
	 * @public
	 * @static
	 * @abstract
	 * @since 1.40
	 * @param {object} oViewInfo identification information about the calling instance
	 * @param {string} oViewInfo.id ID
	 * @param {string} oViewInfo.name Name
	 * @param {string} oViewInfo.componentId ID of the owning Component
	 * @return {string|Promise} String or Promise resolving with a string
	 */

	return View;

});