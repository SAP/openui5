/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.View.
sap.ui.define([
	"sap/base/assert",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Control",
	"sap/ui/base/DesignTime",
	"sap/ui/core/Element",
	"./Controller",
	"./ViewRenderer",
	"./ViewType"
], function(
	assert,
	future,
	Log,
	extend,
	isEmptyObject,
	merge,
	ManagedObject,
	Control,
	DesignTime,
	Element,
	Controller,
	ViewRenderer,
	ViewType
) {
	"use strict";


	/**
	 * @namespace
	 * @name sap.ui.core.mvc
	 * @public
	 */

	/**
	 * Constructor for a new <code>View</code>.
	 *
	 * As <code>View</code> is an abstract base class for views, applications should not call the constructor,
	 * but rather use one of the view factories instead, e.g. {@link #.create View.create}, to create an instance
	 * of a concrete subclass (e.g. <code>XMLView</code>).
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
	 * <h3>View Definition</h3>
	 * A view can be defined by {@link sap.ui.core.mvc.View.extend extending} this class and implementing
	 * the {@link #createContent} method. The method must return one or many root controls that will be
	 * rendered as content of the view.
	 *
	 * Views that are defined that way are referred to as <b>typed views</b>, as each view definition is
	 * represented by its own class (type). See {@link topic:e6bb33d076dc4f23be50c082c271b9f0 Typed Views} for further information.
	 *
	 * <b>Example:</b> Defining a typed view (module 'myapp/views/MainView.js')
	 * <pre>
	 *   // view definition
	 *   sap.ui.define([
	 *     "sap/ui/core/mvc/View",
	 *     "sap/m/Panel"
	 *   ], function(View, Panel) {
	 *
	 *     return View.extend("myapp.views.MainView", {
	 *
	 *       // define, which controller to use
	 *       getControllerName: function() {
	 *         return "myapp.controller.Main";
	 *       },
	 *
	 *       // whether the ID of content controls should be prefixed automatically with the view's ID
	 *       getAutoPrefixId: function() {
	 *         return true; // default is false
	 *       }
	 *
	 *       // create view content and return the root control(s)
	 *       // or a Promise resolving with the control(s).
	 *       createContent: function() {
	 *         return new Promise(function(res, rej) {
	 *             res(new Panel({...}));
	 *         }).catch(function(err) {
	 *             rej(err);
	 *         });
	 *       }
	 *     });
	 *   });
	 * </pre>
	 *
	 * <h3>View Instantiation</h3>
	 * The preferred way of instantiating a typed view is via the generic factory {@link sap.ui.core.mvc.View.create
	 * View.create}.
	 *
	 * When the <code>viewName</code> starts with prefix <code>"module:"</code>, the remainder of the name
	 * is assumed to be the name of a module that exports a typed view (a subclass of <code>View</code>).
	 * The module name must use the same syntax as for <code>sap.ui.define/sap.ui.require</code>
	 * (slash-separated name without '.js' suffix).
	 *
	 * <b>Example:</b> Instantiating a typed view with <code>View.create</code>
	 * <pre>
	 *   View.create({
	 *     viewName: "module:myapp/views/MainView"
	 *   }).then(oView) {
	 *     oView.placeAt("content");
	 *   });
	 * </pre>
	 *
	 * A typed view can also be instantiated by calling its constructor without any arguments:
	 * <pre>
	 *   sap.ui.require(["myapp/views/MainView"], function(MainView) {
	 *     new MainView().placeAt("content");
	 *   });
	 * </pre>
	 *
	 *
	 * <h3>Other Methods</h3>
	 * Besides <code>createContent</code>, there are two other methods that a view can implement:
	 * Method {@link #getControllerName getControllerName} defines the name of the controller that should
	 * be instantiated and used for the view. The name must be in class name notation (dot notation),
	 * without the <code>".controller"</code> suffix. The suffix will be added by the framework when
	 * loading the module containing the controller.
	 *
	 * {@link #getAutoPrefixId getAutoPrefixId} defines whether the IDs of controls created during
	 * the execution of <code>createContent</code> will be prefixed with the ID of the view automatically.
	 * The default implementation of this method returns <code>false</code>.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.mvc.View
	 * @abstract
	 */
	var View = Control.extend("sap.ui.core.mvc.View", /** @lends sap.ui.core.mvc.View.prototype */ {
		metadata : {
			interfaces: [
				"sap.ui.core.IDScope"
			],
			"abstract": true,
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
			defaultAggregation: "content",
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
		},
		renderer: ViewRenderer
	});

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
		 * @return {object} oPreprocessorImpl
		 * @private
		 */
	function initPreprocessor(oPreprocessor) {
		var oPreprocessorImpl;

		if (typeof oPreprocessor.preprocessor === "string") {
			var sPreprocessorName = oPreprocessor.preprocessor.replace(/\./g, "/");
			return new Promise(function(resolve, reject) {
			   sap.ui.require([sPreprocessorName], function(oPreprocessorImpl) {
				   resolve(oPreprocessorImpl);
			   }, reject);
		   });
		} else if (typeof oPreprocessor.preprocessor === "function" && !oPreprocessor.preprocessor.process) {
			oPreprocessorImpl = {
				process: oPreprocessor.preprocessor
			};
		} else {
			oPreprocessorImpl = oPreprocessor.preprocessor;
		}

		return Promise.resolve(oPreprocessorImpl);
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
				return Object.assign({}, oProcessor);
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
				aPreprocessors.unshift(extend(aLocalPreprocessors[i], oOnDemandPreprocessor));
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
		oView.mPreprocessors = Object.assign({}, mSettings.preprocessors);
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
		var connectToView = function (oController) {
			oThis.oController = oController;
			oController.oView = oThis;
		};

		if (!DesignTime.isControllerCodeDeactivated()) {
			// only set when used internally
			var oController = mSettings.controller,
				sName = oController && typeof oController.getMetadata === "function" && oController.getMetadata().getName();

			if (!oController && oThis.getControllerName) {
				oThis.bControllerIsViewManaged = true;
				// get optional default controller name
				var defaultController = oThis.getControllerName();
				if (defaultController) {
					// check for controller replacement
					var Component = sap.ui.require("sap/ui/core/Component");
					if (Component) {
						var sControllerReplacement = Component.getCustomizing(oThis, {
							type: "sap.ui.controllerReplacements",
							name: defaultController
						});
						if (sControllerReplacement) {
							defaultController = typeof sControllerReplacement === "string" ? sControllerReplacement : sControllerReplacement.controllerName;
						}
					}
					oController = Controller.create({name: defaultController, _viewId: oThis.sId});
				}
			} else if (oController) {
				oThis.bControllerIsViewManaged = false;
				// if passed controller is not extended yet we need to do it.
				var sOwnerId = ManagedObject._sOwnerId;
				if (!oController._isExtended()) {
					oController = Controller.applyExtensions(oController, sName, sOwnerId, oThis.sId, true);
				} else {
					oController = Promise.resolve(oController);
				}
			}

			if (oController) {
				if (!oThis.oAsyncState) {
					throw new Error("The view " + oThis.sViewName + " runs in sync mode and therefore cannot use async controller extensions!");
				}
				return oController.then(connectToView);
			}
		} else {
			const oController = Object.assign(new Controller(), { "_sap.ui.core.mvc.EmptyControllerImpl": true });
			return Promise.resolve(oController).then(connectToView);
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

		mSettings = mSettings || {};

		// if preprocessors available and this != XMLView
		assert(!mSettings.preprocessors || this.getMetadata().getName().indexOf("XMLView"), "Preprocessors only available for XMLView");

		// init View with constructor settings
		// (e.g. parse XML or identify default controller)
		// make user specific data available during view instantiation
		this.oViewData = mSettings.viewData;
		// remember the name of this View
		this.sViewName = mSettings.viewName;

		// typed views are prefixed with "module:" and contains slashes
		if (this.sViewName && this.sViewName.startsWith("module:")) {
			this.sViewName = this.sViewName.slice(7).replace(/\//g, ".");
		}

		var that = this;

		initPreprocessorQueues(this, mSettings);

		// create a Promise that represents the view initialization state
		if (mSettings.async) {
			initAsyncState(this);
		}

		// view modifications
		// check if there are custom properties configured for this view, and only if there are, create a settings preprocessor applying these
		var Component = sap.ui.require("sap/ui/core/Component");
		if (Component) {
			var mCustomSettings = Component.getCustomizing(this, {
				type: "sap.ui.viewModifications",
				name: this.sViewName
			});

			if (!isEmptyObject(mCustomSettings)) {
				// NOTE:
				// nested views do not inherit the preprocessor settings function from the parent
				// controls within fragments however do inherit the settings function from the containing view (see Fragment#init)
				this._fnSettingsPreprocessor = function(mSettings) {
					var sId = this.getId();
					if (sId) {
						if (that.isPrefixedId(sId)) {
							sId = sId.substring((that.getId() + "--").length);
						}
						var oCustomSetting = Object.assign({}, mCustomSettings[sId]);
						if (oCustomSetting) {
							// only 'visible' property can be customized
							for (var sProperty in oCustomSetting) {
								if (sProperty !== "visible") {
									future.warningThrows(`Customizing: property '${sProperty}' of control '${sId}' in View '${that.sViewName}' cannot be customized, only 'visible' can.`, { suffix: "Property will be ignored" });
									delete oCustomSetting[sProperty];
								}
							}
							Log.info("Customizing: custom value for property 'visible' of control '" + sId + "' in View '" + that.sViewName + "' applied: " + oCustomSetting.visible);
							mSettings = extend(mSettings, oCustomSetting); // override original property initialization with customized property values
						}
					}
				};
			}
		}

		/**
				 * @private
				 */
		var fnPropagateOwner = function(fnCallback) {
			assert(typeof fnCallback === "function", "fn must be a function");
			var oOwnerComponent = Component && Component.getOwnerComponentFor(that);
			if (oOwnerComponent) {
				// special treatment when component loading is async but instance creation is sync
				that.fnScopedRunWithOwner = that.fnScopedRunWithOwner || function(fnCallbackToBeScoped) {
					return oOwnerComponent.runAsOwner(fnCallbackToBeScoped);
				};
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

		var fnFireOnControllerConnected = function (mSettings) {
			if (that.onControllerConnected) {
				return that.onControllerConnected(that.oController, mSettings);
			}
		};

		if (mSettings.async) {
			// async processing starts here
			this.oAsyncState.promise = this.initViewSettings(mSettings)
				.then(function() {
					return fnPropagateOwner(createAndConnectController.bind(null, that, mSettings), true);
				})
				.then(function() {
					return fnPropagateOwner(fnFireOnControllerConnected.bind(null, mSettings), true);
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
			fnFireOnControllerConnected(mSettings);
			fnAttachControllerToViewEvents(this);

			this.runPreprocessor("controls", this, true);
			this.fireAfterInit();
		}
	};

	/**
	 * Returns the view's Controller instance or null for a controller-less View.
	 *
	 * @return {sap.ui.core.mvc.Controller} Controller of this view.
	 * @public
	 */
	View.prototype.getController = function() {
		return this.oController;
	};

	/**
	 * Returns an element by its ID in the context of this view.
	 *
	 * This method expects a view-local ID of an element (the same as e.g. defined in the *.view.xml
	 * of an XMLView). For a search with a global ID (the value returned by <code>oElement.getId()</code>)
	 * you should rather use {@link sap.ui.core.Element#getElementById Element.getElementById}.
	 *
	 * @param {string} sId View local ID of the element
	 * @return {sap.ui.core.Element|undefined} Element by its ID or <code>undefined</code>
	 * @public
	 */
	View.prototype.byId = function(sId) {
		return Element.getElementById(this.createId(sId));
	};

	/**
	 * Convert the given view local element ID to a globally unique ID
	 * by prefixing it with the view ID.
	 *
	 * @param {string} sId View local ID of the element
	 * @returns {string} prefixed id
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
	 * @returns {string|null} ID without prefix or <code>null</code>
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
	 * @returns {boolean} Whether the ID is already prefixed
	 */
	View.prototype.isPrefixedId = function(sId) {
		return !!(sId && sId.indexOf(this.getId() + "--") === 0);
	};

	/**
	 * Returns user specific data object.
	 *
	 * @returns {object} viewData
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
		if (this.oController && this.bControllerIsViewManaged) {
			this.oController.destroy();
			delete this.oController;
		}
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
	 * @returns {{name: string, componentId: string, id: string, caller: string, sync: boolean}} Info object for the view
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

	function onDemandPreprocessorExists(sViewType, sType) {
		return View._mPreprocessors[sViewType][sType].some(function(oPreprocessor) {
			return !!oPreprocessor._onDemand;
		});
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
	 * @since 1.30
	 * @static
	 * @param {string} sType
	 * 		the type of content to be processed
	 * @param {string|function(Object, sap.ui.core.mvc.View.Preprocessor.ViewInfo, object)} vPreprocessor
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
			if (bOnDemand && onDemandPreprocessorExists(sViewType, sType)) {
				future.errorThrows("Registration for \"" + sType + "\" failed, only one on-demand-preprocessor allowed", this.getMetadata().getName());
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
			future.errorThrows("Registration for \"" + sType + "\" failed, no preprocessor specified",  this.getMetadata().getName());
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
	 * When the <code>viewName</code> starts with prefix <code>"module:"</code>, the remainder of the name
	 * is assumed to be the name of a module that exports a typed view (subclass of <code>View</code>).
	 * The module name must use the same syntax as for <code>sap.ui.define/sap.ui.require</code>
	 * (slash-separated name).
	 *
	 * @example <caption>Create an Instance of a typed view</caption>
	 *   View.create({
	 *      viewName:'module:myapp/views/Main'
	 *   });
	 *
	 * @example <caption>Create an Instance of a non-typed view</caption>
	 *   View.create({
	 *      type: 'JS',
	 *      viewName:'myapp.views.Detail'
	 *   });
	 *
	 * See also the API references for the specific view factories:
	 * <ul>
	 * <li>{@link sap.ui.core.mvc.XMLView.create}</li>
	 * <li>{@link sap.ui.core.mvc.JSONView.create} (deprecated)</li>
	 * <li>{@link sap.ui.core.mvc.HTMLView.create} (deprecated)</li>
	 * </ul>
	 *
	 * @param {object} oOptions
	 *     Options for the view instantiation. Can contain any settings that are documented for the
	 *     {@link sap.ui.core.mvc.View}; specialized view types could bring in additional settings.
	 * @param {string} [oOptions.id]
	 *     Specifies an ID for the View instance. If no ID is given, one will be generated
	 * @param {string} [oOptions.viewName]
	 *     Name of the view resource in module name notation (dot-separated, without suffix); either
	 *     <code>viewName</code> or <code>definition</code> must be given. A <code>viewName</code>
	 *     can be given in the form <code>module:my/views/Main</code> to load a typed view.
	 * @param {any} [oOptions.definition]
	 *     The view definition. Only supported for XML and HTML views. See also {@link sap.ui.core.mvc.XMLView.create}
	 *     and {@link sap.ui.core.mvc.HTMLView.create} (deprecated) for more information.
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
			oOwnerComponent = Component.getComponentById(ManagedObject._sOwnerId);
		}

		function createView() {
			return viewFactory(mParameters.id, mParameters, mParameters.type).loaded();
		}

		return new Promise(function(resolve, reject) {
			 var sViewClass = View._getViewClassName(mParameters);
			 sap.ui.require([sViewClass], function(ViewClass){
				 resolve(ViewClass);
			 }, reject);
		})
		.then(function(ViewClass) {
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
	 * @function
	 */
	View._create = viewFactory;

	/**
	 * The old sap.ui.view implementation
	 *
	 * @param {string} sId id of the newly created view, only allowed for instance creation
	 * @param {string|object} [vView] the view name or view configuration object
	 * @param {sap.ui.core.mvc.ViewType} [sType] Specifies what kind of view will be instantiated. All valid
	 * view types are listed in the enumeration {@link sap.ui.core.mvc.ViewType}
	 * @returns {sap.ui.core.mvc.View} the created view instance
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
		// get current owner component
		var Component = sap.ui.require("sap/ui/core/Component");

		if (Component && ManagedObject._sOwnerId) {
			var customViewConfig = Component.getCustomizing(ManagedObject._sOwnerId, {
				type: "sap.ui.viewReplacements",
				name: oView.viewName
			});
			if (customViewConfig) {
				// make sure that "async=true" will not be overriden
				delete customViewConfig.async;

				Log.info("Customizing: View replacement for view '" + oView.viewName + "' found and applied: " + customViewConfig.viewName + " (type: " + customViewConfig.type + ")");
				extend(oView, customViewConfig);
			} else {
				Log.debug("Customizing: no View replacement found for view '" + oView.viewName + "'.");
			}
		}

		var sViewClass = View._getViewClassName(oView);
		view = createView(sViewClass, oView);
		return view;
	}

	/**
	 * Extract the class name from the given view settings object
	 *
	 * @param {object} oViewSettings Settings object as given to the view factory
	 * @param {boolean} [bSkipLog=false] Whether to skip the logging
	 * @returns {string|undefined} Name of the view class (in sap.ui.define syntax)
	 * @private
	 */
	View._getViewClassName = function(oViewSettings, bSkipLog) {
		var sViewClass = View._getModuleName(oViewSettings);

		// view creation
		if (sViewClass) {
			if (oViewSettings.type && !bSkipLog) {
				Log.error("When using the view factory, the 'type' setting must be omitted for typed views. When embedding typed views in XML, don't use the <JSView> tag, use the <View> tag instead.");
			}
			return sViewClass;
		}
		if (!oViewSettings.type) {
			throw new Error("No view type specified.");
		}

		if (oViewSettings.type === ViewType.XML) {
			return 'sap/ui/core/mvc/XMLView';
		}

		// unknown view type
		if (!sViewClass) {
			throw new Error("Unknown view type " + oViewSettings.type + " specified.");
		}

		return sViewClass;
	};

	function createView(sViewClass, oViewSettings) {
		var ViewClass = sap.ui.require(sViewClass);
		if (!ViewClass) {
			future.warningThrows(`The view class '${sViewClass}' needs to be required before an instance of the view can be created.`);
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
	 * @return {Promise<sap.ui.core.mvc.View>} resolves with the complete view instance, rejects with any thrown error
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
	 * Extract module name from viewName property.
	 *
	 * @param {object} mSettings Settings as given to the view factory
	 * @returns {string|undefined} Name of the module (in sap.ui.define syntax) from which to load the view definition.
	 * @private
	 */
	View._getModuleName = function(mSettings) {
		var sModuleName;
		if (mSettings.viewName && mSettings.viewName.startsWith("module:")) {
			sModuleName = mSettings.viewName.slice(7);
		}
		return sModuleName;
	};

	/**
	 * Interface for Preprocessor implementations that can be hooked in the view life cycle.
	 *
	 * There are two possibilities to use the preprocessor. It can be either passed to the view via the mSettings.preprocessors object
	 * where it is the executed only for this instance, or by the registerPreprocessor method of the view type. Currently this is
	 * available only for XMLViews (as of version 1.30).
	 *
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
	 * Information about the view that is processed by the preprocessor
	 *
	 * @typedef {object} sap.ui.core.mvc.View.Preprocessor.ViewInfo
	 * @property {string} id the ID of the view
	 * @property {string} name the name of the view
	 * @property {string} componentId the ID of the owning Component of the view
	 * @property {string} caller
	 * 		identifies the caller of this preprocessor; basis for log or exception messages
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
	 * @param {Object} vSource the source to be processed
	 * @param {sap.ui.core.mvc.View.Preprocessor.ViewInfo}
	 * 		oViewInfo identification information about the calling instance
	 * @param {object} [mSettings]
	 * 		settings object containing the settings provided with the preprocessor
	 * @return {Object|Promise<Object>}
	 * 		the processed resource or a promise which resolves with the processed resource
	 */

	/**
	 * Cache key provider method that can be implemented by a preprocessor.
	 *
	 * This method  should be used to invalidate a cache on the currently preprocessed view. Therefore, a Promise needs
	 * to be passed which resolves with the according cache key increment.
	 *
	 * <strong>Note:</strong> Caching is only available for XMLViews! Some parts of the feature are still experimental,
	 * For further information see {@link sap.ui.core.mvc.XMLView.create XMLView.create}
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
	 * @return {string|Promise<string>} String or Promise resolving with a string
	 */

	/**
	 * A method to be implemented by typed <code>View</code>s, returning the view UI.
	 *
	 * While for declarative view types like <code>XMLView</code> or <code>JSONView</code> (deprecated) the user interface definition
	 * is declared in a separate file, <code>View</code>s programmatically constructs the UI. This happens in the
	 * <code>createContent</code> method, which every <code>View</code> needs to implement. The view implementation
	 * can construct the complete UI in this method, or only return the root control and create the remainder of the UI
	 * lazily later on.
	 *
	 * @param {sap.ui.core.mvc.Controller} oController The controller of the view
	 * @returns {sap.ui.core.Control|sap.ui.core.Control[]|Promise<sap.ui.core.Control|sap.ui.core.Control[]>} A control or array of controls representing the view user interface or a Promise resolving with a control or an array of controls.
	 * @public
	 * @name sap.ui.core.mvc.View#createContent
	 * @function
	 */

	/**
	* A method to be implemented by typed views, returning the flag whether to prefix the IDs of controls
	* automatically or not, if the controls are created inside the {@link sap.ui.core.mvc.View#createContent}
	* function. By default this feature is not activated.
	*
	* You can overwrite this function and return <code>true</code> to activate the automatic prefixing.
	*
	* <b>Note</b>: Auto-prefixing is only available for synchronous content creation. For asynchronous content creation use {@link #createId} instead, to prefix the IDs programmatically.
	*
	* @since 1.88
	* @returns {boolean} Whether the control IDs should be prefixed automatically
	* @protected
	*/
	View.prototype.getAutoPrefixId = function() {
		return false;
	};

	View.prototype.onControllerConnected = function(oController, mSettings) {
		if (!this.createContent && typeof this.createContent !== 'function') {
			return;
		}

		var mPreprocessorSettings = {
			// when auto prefixing is enabled, we add the prefix
			id: this.getAutoPrefixId() ? this.createId.bind(this) : undefined,
			settings: this._fnSettingsPreprocessor
		};

		return ManagedObject.runWithPreprocessors(function() {
			var vContent = this.createContent(oController);
			if (mSettings.async) {
				vContent = Promise.resolve(vContent);
				return vContent.then(function(vContent) {
					this.applySettings({
						content : vContent
					});
				}.bind(this));
			} else if (vContent instanceof Promise) {
				throw new Error("An asynchronous view (createContent) cannot be instantiated synchronously. Affected view: '" + this.getMetadata().getName() + "'.");
			} else {
				this.applySettings({
					content : vContent
				});
			}
		}.bind(this), mPreprocessorSettings);
	};

	/**
		 * @private
		 */
	View.prototype.initViewSettings = function(mSettings) {
		// check if renderer exists, otherwise default it
		if (!this.getMetadata()._oRenderer) {
			this.getMetadata().getRenderer = function() {
				return View.getMetadata().getRenderer();
			};
			this.getMetadata().getRendererName = function() {
				return View.getMetadata().getRendererName();
			};
		}
		return Promise.resolve();
	};

	return View;
});