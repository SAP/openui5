/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define([
	'../base/ManagedObject',
	'./Component',
	'./library',
	'./UIComponentMetadata',
	'./mvc/Controller',
	'./mvc/View',
	"sap/base/util/ObjectPath",
	"sap/base/Log"
],
	function(
		ManagedObject,
		Component,
		library,
		UIComponentMetadata,
		Controller,
		View,
		ObjectPath,
		Log
	) {
	"use strict";

	// shortcut for enum(s)
	var ViewType = library.mvc.ViewType;


	/**
	 * Creates and initializes a new UIComponent with the given <code>sId</code> and
	 * settings.
	 *
	 * The set of allowed entries in the <code>mSettings</code> object depends on
	 * the concrete subclass and is described there. See {@link sap.ui.core.Component}
	 * for a general description of this argument.
	 *
	 * @param {string}
	 *            [sId] Optional ID for the new control; generated automatically if
	 *            no non-empty ID is given; Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> will be given or not
	 * @param {object}
	 *            [mSettings] Optional map/JSON-object with initial settings for the
	 *            new component instance
	 *
	 * @class Base Class for UIComponent.
	 *
	 * If you are extending a UIComponent make sure you read the {@link #.extend} documentation since the metadata is special.
	 *
	 * @public
	 * @extends sap.ui.core.Component
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.UIComponent
	 * @since 1.9.2
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UIComponent = Component.extend("sap.ui.core.UIComponent", /** @lends sap.ui.core.UIComponent.prototype */

	{
		constructor : function(sId, mSettings) {

			var bCreated = false;
			try {
				if (typeof sId !== "string") {
					mSettings = sId;
					sId = undefined;
				}

				// save the _routerHashChanger for the creation of Router
				if (mSettings && mSettings.hasOwnProperty("_routerHashChanger")) {
					this._oRouterHashChanger = mSettings._routerHashChanger;
					delete mSettings._routerHashChanger;
				}

				if (mSettings && mSettings.hasOwnProperty("_propagateTitle")){
					this._bRoutingPropagateTitle = mSettings._propagateTitle;
					delete mSettings._propagateTitle;
				}

				Component.apply(this, arguments);
				bCreated = true;
			} finally {
				if (!bCreated) {
					this._destroyCreatedInstances();
				}
			}

		},

		metadata : {
			"abstract": true,
			rootView : null, // the rootView to open (view name as string or view configuration object)
			publicMethods: [ "render" ],
			aggregations: {
				/**
				 * The root control of the UIComponent.
				 *
				 * The root control should be created inside the function {@link sap.ui.core.UIComponent#createContent}.
				 */
				"rootControl": { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
			},
			designtime: "sap/ui/core/designtime/UIComponent.designtime",
			routing: {
			}
			//autoDestroy: false // TODO: destroy component when view should be destroyed (not implemented yet!)
		}

	}, /* Metadata constructor */ UIComponentMetadata);

	/**
	 * An object containing the routing-relevant configurations, routes, targets, config.
	 *
	 * <h3>Example for a config:</h3>
	 *
	 * <pre>
	 *     routing: {
	 *         "routes": {
	 *             "welcome": {
	 *                 // If the URL has no hash e.g.: index.html or index.html# , this route will be matched.
	 *                 "pattern": "",
	 *                 // Displays the target called "welcome" specified in metadata.routing.targets.welcome.
	 *                 "target": "welcome"
	 *             }
	 *             "product": {
	 *                 "pattern": "Product/{id}",
	 *                 "target": "product"
	 *             }
	 *         }
	 *         // Default values for targets
	 *         "config": {
	 *             // For a detailed documentation of these parameters have a look at the sap.ui.core.routing.Targets documentation
	 *             "viewType": "XML",
	 *             "controlId": "App",
	 *             "controlAggregation": "pages",
	 *             "viewNamespace": "myApplication.namespace",
	 *             // If you are using the mobile library, you have to use an sap.m.Router, to get support for
	 *             // the controls sap.m.App, sap.m.SplitApp, sap.m.NavContainer and sap.m.SplitContainer.
	 *             "routerClass": "sap.m.routing.Router"
	 *             // What happens if no route matches the hash?
	 *             "bypassed": {
	 *                 // the not found target gets displayed
	 *                 "target": "notFound"
	 *             }
	 *         }
	 *         "targets": {
	 *             "welcome": {
	 *                 // Referenced by the route "welcome"
	 *                 "viewName": "Welcome",
	 *                 "viewLevel": 0
	 *             },
	 *             "product": {
	 *                 // Referenced by the route "Product"
	 *                 "viewName": "Product",
	 *                 "viewLevel": 1
	 *             }
	 *             "notFound": {
	 *                 // Referenced by the bypassed section of the config
	 *                 "viewName": "NotFound"
	 *             }
	 *         }
	 *     }
	 *
	 * </pre>
	 *
	 * @property {object} [routes]
	 * An object containing the routes that should be added to the router. See {@link sap.ui.core.routing.Route}
	 * for the allowed properties.
	 *
	 * @property {object} [targets]
	 * Since 1.28.1. An object containing the targets that will be available for the router and the <code>Targets</code>
	 * instance. See {@link sap.ui.core.routing.Targets} for the allowed values.
	 *
	 * @property {object} [config]
	 * Since 1.16. An object containing default values used for routes and targets.
	 * See {@link sap.ui.core.routing.Router#constructor} and {@link sap.ui.core.routing.Targets} for more documentation.
	 *
	 * @property {string|function} [config.routerClass="sap.ui.core.routing.Router"]
	 * Since 1.20. The qualified name (in dot notation) or the constructor of the router class that should be used for the
	 * component's router. If you are using an own router extension, it has to be required before the constructor of the
	 * component is invoked. If you use <code>sap.m.routing.Router</code>, the component will automatically create an
	 * {@link sap.m.routing.Targets} instance. If you pass a function, it has to be the constructor of a class
	 * that extends a router.
	 *
	 * @property {string|function} [config.targetsClass="sap.ui.core.routing.Targets"]
	 * Since 1.28.1. The qualified name (in dot notation) or the constructor of the <code>Targets</code> class that
	 * should be used by the component's router. If you are using an own <code>Targets</code> extension, it has to be
	 * required before the constructor of the component is invoked. If you define routes in your routing section, this
	 * parameter will be ignored and the <code>Targets</code> instance of the router will be taken, see
	 * {@lint #sap.ui.core.routing.Router#getTargets}.
	 *
	 * @property {string} [config.rootView]
	 * By default, the root view will be set to the ID of the view returned by the {@link sap.ui.core.UIComponent#getRootView}
	 * function. You should not set this parameter if you create a view with the UIComponent.
	 *
	 * @typedef sap.ui.core.UIComponent.RoutingMetadata
	 * @public
	 */

	/**
	 * Creates a new subclass of class <code>sap.ui.core.UIComponent</code> with name
	 * <code>sClassName</code> and enriches it with the information contained in <code>oClassInfo</code>.
	 * <code>oClassInfo</code> might contain the same kind of information as described in
	 * {@link sap.ui.core.Component.extend}.
	 *
	 * @param {string} sClassName
	 *            Qualified name of the newly created class
	 * @param {object} [oClassInfo]
	 *            Object literal with information about the class
	 * @param {object} [oClassInfo.metadata]
	 *            See {@link sap.ui.core.Element.extend} for the values allowed in every extend.
	 * @param {sap.ui.core.UIComponent.RoutingMetadata} [oClassInfo.metadata.routing]
	 *            Since 1.16. An object containing the routing-relevant configurations, routes, targets, config.
	 *
	 *            After creating a component instance, you can retrieve the router with {@link #getRouter}
	 *            to register a callback to be notified when routes have matched etc. You can also retrieve
	 *            targets with {@link #getTargets} to display views without changing the hash.
	 *
	 *            <b>Note: Configuring the routing in the metadata in the source code is deprecated.
	 *            Better create an application descriptor (manifest.json) instead for your component.</b>
	 *
	 * @param {function} [FNMetaImpl=sap.ui.core.ComponentMetadata]
	 *            Constructor function for the metadata object. If not given, it defaults to an
	 *            internal subclass of <code>sap.ui.core.ComponentMetadata</code>.
	 * @name sap.ui.core.UIComponent.extend
	 * @function
	 * @public
	 */

	/**
	 * Callback handler which will be executed once a new Component instance is initialized.
	 *
	 * Example usage:
	 * <pre>
	 * sap.ui.require(['sap/ui/core/UIComponent'], function(UIComponent) {
	 *   UIComponent._fnOnInstanceInitialized = function(oComponent) {
	 *     // do some logic with the Component
	 *   }
	 * });
	 * </pre>
	 *
	 * <b>ATTENTION:</b> This hook must only be used by Fiori 2.0 adapter.
	 *
	 * @private
	 * @ui5-restricted sap.ushell
	 * @since 1.37.0
	 */
	UIComponent._fnOnInstanceInitialized = null;

	/**
	 * Callback handler which will be executed when a Component instance is destroyed.
	 *
	 * Example usage:
	 * <pre>
	 * sap.ui.require(['sap/ui/core/UIComponent'], function(UIComponent) {
	 *   UIComponent._fnOnInstanceDestroy = function(oComponent) {
	 *     // do some logic with the Component
	 *   }
	 * });
	 * </pre>
	 *
	 * <b>ATTENTION:</b> This hook must only be used by Fiori 2.0 adapter.
	 *
	 * @private
	 * @ui5-restricted sap.ushell
	 * @since 1.40
	 */
	UIComponent._fnOnInstanceDestroy = null;

	/**
	 * Initializes the component instance after creation.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework while the constructor of a Component is executed.
	 *
	 * Subclasses of <code>UIComponent</code> should override this hook to implement any necessary
	 * initialization. <b>When overriding this function make sure to invoke the
	 * <code>init</code> function of the <code>UIComponent</code> as well!</b>
	 *
	 * @protected
	 */
	UIComponent.prototype.init = function() {

		var that = this;
		var oPreprocessors = {};

		// when auto prefixing is enabled we add the prefix
		if (this.getAutoPrefixId()) {
			oPreprocessors.id = function(sId) {
				return that.createId(sId);
			};
		}

		// create the routing
		// extend the metadata config, so that the metadata object cannot be modified afterwards
		var oRoutingManifestEntry = this._getManifestEntry("/sap.ui5/routing", true) || {},
			oRoutingConfig = oRoutingManifestEntry.config || {},
			vRoutes = oRoutingManifestEntry.routes;

		// create the router for the component instance
		if (vRoutes) {
			var Router = sap.ui.requireSync("sap/ui/core/routing/Router");
			var fnRouterConstructor = getConstructorFunctionFor(this._getRouterClassName() || Router);
			this._oRouter = new fnRouterConstructor(vRoutes, oRoutingConfig, this, oRoutingManifestEntry.targets, this._oRouterHashChanger);
			this._oTargets = this._oRouter.getTargets();
			this._oViews = this._oRouter.getViews();
		} else if (oRoutingManifestEntry.targets) {
			var Targets = sap.ui.requireSync("sap/ui/core/routing/Targets");
			var Views = sap.ui.requireSync("sap/ui/core/routing/Views");
			this._oViews = new Views({
				component: this
			});
			var fnTargetsConstructor = getConstructorFunctionFor(oRoutingConfig.targetsClass || Targets);
			this._oTargets = new fnTargetsConstructor({
				targets: oRoutingManifestEntry.targets,
				config: oRoutingConfig,
				views: this._oViews
			});
		}

		// create the content
		this.runAsOwner(function() {
			ManagedObject.runWithPreprocessors(function() {
				that.setAggregation("rootControl", that.createContent());
			}, oPreprocessors);
		});

		// only for root "views" we automatically define the target parent
		var oRootControl = this.getRootControl();
		if (oRootControl instanceof View) {
			if (oRoutingConfig.targetParent === undefined) {
				oRoutingConfig.targetParent = oRootControl.getId();
			}
			if (this._oTargets) {
				this._oTargets._setRootViewId(oRootControl.getId());
			}
		}

		// notify Component initialization callback handler
		if (typeof UIComponent._fnOnInstanceInitialized === "function") {
			UIComponent._fnOnInstanceInitialized(this);
		}

	};

	function getConstructorFunctionFor (vRoutingObjectConstructor) {
		var fnConstructor;
		if (typeof vRoutingObjectConstructor === "string") {
			fnConstructor = ObjectPath.get(vRoutingObjectConstructor);
			if (!fnConstructor) {
				Log.error("The specified class for router or targets '" + vRoutingObjectConstructor + "' is undefined.", this);
			}
		} else {
			fnConstructor = vRoutingObjectConstructor;
		}

		return fnConstructor;
	}

	/*
	 * Destruction of the UIComponent
	 */
	UIComponent.prototype.destroy = function() {

		// notify Component destruction callback handler
		if (typeof UIComponent._fnOnInstanceDestroy === "function") {
			UIComponent._fnOnInstanceDestroy(this);
		}
		// destroy the router
		this._destroyCreatedInstances();
		// make sure that the component is destroyed properly
		Component.prototype.destroy.apply(this, arguments);
	};

	UIComponent.prototype._destroyCreatedInstances = function () {
		if (this._oRouter) { // destroy the router
			// the _oTargets and _oViews will be destroyed
			// internally in the _oRouter
			this._oRouter.destroy();
			delete this._oRouter;
		} else { // if _oTargets and _oViews are created without
			// a Router, they need to be destroyed here
			if (this._oTargets) {
				this._oTargets.destroy();
				this._oTargets = null;
			}

			if (this._oViews) {
				this._oViews.destroy();
				this._oViews = null;
			}
		}

	};

	/**
	 * Returns the reference to the router instance.
	 *
	 * The passed controller or view has to be created in the context of a UIComponent to return the router
	 * instance. Otherwise this function will return undefined.
	 * You may define the routerClass property in the config section of the routing to make the Component create your router extension.
	 *
	 * Example:
	 * <pre>
	 * routing: {
	 * 	config: {
	 * 		routerClass : myAppNamespace.MyRouterClass
	 * 		...
	 * }
	 * ...
	 * </pre>
	 * @param {sap.ui.core.mvc.View|sap.ui.core.mvc.Controller} oControllerOrView either a view or controller
	 * @return {sap.ui.core.routing.Router} the router instance
	 * @since 1.16.1
	 * @public
	 */
	UIComponent.getRouterFor = function(oControllerOrView) {
		var oView = oControllerOrView;
		if (oView instanceof Controller) {
			oView = oView.getView();
		}
		if (oView instanceof View) {
			var oComponent = Component.getOwnerComponentFor(oView);

			if (oComponent) {
				return oComponent.getRouter();
			} else {
				return undefined;
			}
		}
	};

	/**
	 * Returns the reference to the router instance which has been created by
	 * the UIComponent once the routes in the routing metadata has been defined.
	 * @since 1.16.1
	 * @return {sap.ui.core.routing.Router} the router instance
	 * @public
	 */
	UIComponent.prototype.getRouter = function() {
		return this._oRouter;
	};


	/**
	 * Returns the reference to the Targets instance which has been created by
	 * the UIComponent once the targets in the routing metadata has been defined.
	 * If routes have been defined, it will be the Targets instance created and used by the router.
	 * @since 1.28
	 * @return {sap.ui.core.routing.Targets} the targets instance
	 * @public
	 */
	UIComponent.prototype.getTargets = function() {
		return this._oTargets;
	};

	/**
	 * A method to be implemented by UIComponents, returning the flag whether to prefix
	 * the IDs of controls automatically or not if the controls are created inside
	 * the {@link sap.ui.core.UIComponent#createContent} function. By default this
	 * feature is not activated.
	 *
	 * You can overwrite this function and return <code>true</code> to activate the automatic
	 * prefixing. In addition the default behavior can be configured in the manifest
	 * by specifying the entry <code>sap.ui5/autoPrefixId</code>.
	 *
	 * @since 1.15.1
	 * @return {boolean} true, if the Controls IDs should be prefixed automatically
	 * @protected
	 */
	UIComponent.prototype.getAutoPrefixId = function() {
		return !!this.getManifestObject().getEntry("/sap.ui5/autoPrefixId");
	};

	/**
	 * Returns an element by its ID in the context of the component.
	 *
	 * @param {string} sId Component local ID of the element
	 * @return {sap.ui.core.Element} element by its ID or <code>undefined</code>
	 * @public
	 */
	UIComponent.prototype.byId = function(sId) {
		return sap.ui.getCore().byId(this.createId(sId));
	};

	/**
	 * Convert the given component local element ID to a globally unique ID
	 * by prefixing it with the component ID.
	 *
	 * @param {string} sId Component local ID of the element
	 * @return {string} prefixed id
	 * @public
	 */
	UIComponent.prototype.createId = function(sId) {
		if (!this.isPrefixedId(sId)) {
			// components have 3 dashes as separator, views 2 and controls/elements 1
			sId = this.getId() + "---" + sId;
		}
		return sId;
	};

	/**
	 * Returns the local ID of an element by removing the component ID prefix or
	 * <code>null</code> if the ID does not contain a prefix.
	 *
	 * @param {string} sId Prefixed ID
	 * @return {string} ID without prefix or <code>null</code>
	 * @public
	 * @since 1.39.0
	 */
	UIComponent.prototype.getLocalId = function(sId) {
		var sPrefix = this.getId() + "---";
		return (sId && sId.indexOf(sPrefix) === 0) ? sId.slice(sPrefix.length) : null;
	};

	/**
	 * Checks whether the given ID already contains this component's ID prefix
	 *
	 * @param {string} sId ID that is checked for the prefix
	 * @return {boolean} whether the ID is already prefixed
	 */
	UIComponent.prototype.isPrefixedId = function(sId) {
		return !!(sId && sId.indexOf(this.getId() + "---") === 0);
	};

	/**
	 * Hook method to create the content (UI Control Tree) of this component.
	 *
	 * The default implementation in this class reads the name (and optionally type) of a root view from the
	 * descriptor for this component (path <code>/sap.ui5/rootView</code>) or, for backward compatibility,
	 * just the name from static component metadata (property <code>rootView</code>). When no type is specified,
	 * it defaults to XML. The method then calls the {@link sap.ui.view view factory} to instantiate the root
	 * view and returns the result.
	 *
	 * When there is no root view configuration, <code>null</code> will be returned.
	 *
	 * This method can be overwritten by subclasses if the default implementation doesn't fit their needs.
	 * Subclasses are not limited to views as return type but may return any control, but only a single control
	 * (can be the root of a larger control tree, however).
	 *
	 * @returns {sap.ui.core.mvc.View|sap.ui.core.Control} Root control of the UI tree or <code>null</code> if none is configured
	 * @throws {Error} When the root view configuration could not be interpreted; subclasses might throw errors also for other reasons
	 * @public
	 */
	UIComponent.prototype.createContent = function() {
		var oRootView = this._getManifestEntry("/sap.ui5/rootView", true);
		if (oRootView && typeof oRootView === "string") {
			// This is a duplication of the logic in UIComponentMetadata#_convertLegacyMetadata
			// to convert the string into a configuration object for the view factory in
			// case of the manifest first approach.
			// !This should be kept in sync with the UIComponentMetadata functionality!
			return View._legacyCreate({
				viewName: oRootView,
				type: ViewType.XML
			});
		} else if (oRootView && typeof oRootView === "object") {
			// make sure to prefix the ID of the rootView
			if (oRootView.id) {
				oRootView.id = this.createId(oRootView.id);
			}
			// for now the processing mode is always set to "sequential" for XMLViews
			if (oRootView.async && oRootView.type === ViewType.XML) {
				oRootView.processingMode = "sequential";
			}
			return View._legacyCreate(oRootView);
		} else if (oRootView) {
			throw new Error("Configuration option 'rootView' of component '" + this.getMetadata().getName() + "' is invalid! 'rootView' must be type of string or object!");
		}
		return null;
	};

	/**
	 * Returns the content of {@link sap.ui.core.UIComponent#createContent}.
	 * If you specified a <code>rootView</code> in your metadata or in the descriptor file (manifest.json),
	 * you will get the instance of the root view.
	 * This getter will only return something if the {@link sap.ui.core.UIComponent#init} function was invoked.
	 * If <code>createContent</code> is not implemented, and there is no root view, it will return <code>null</code>. Here is an example:
	 *     <pre>
	 *          var MyExtension = UIComponent.extend("my.Component", {
	 *               metadata: {
	 *                    rootView: "my.View"
	 *               },
	 *               init: function () {
	 *                    this.getRootControl(); // returns null
	 *                    UIComponent.prototype.init.apply(this, arguments);
	 *                    this.getRootControl(); // returns the view "my.View"
	 *               }
	 *          });
	 *     </pre>
	 * @protected
	 * @since 1.44.0
	 * @returns {sap.ui.core.Control} the control created by {@link sap.ui.core.UIComponent#createContent}
	 */
	UIComponent.prototype.getRootControl = function() {
		return this.getAggregation("rootControl");
	};

	/**
	 * Renders the root control of the UIComponent.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager a RenderManager instance
	 * @public
	 */
	UIComponent.prototype.render = function(oRenderManager) {
		var oControl = this.getRootControl();
		if (oControl && oRenderManager) {
			oRenderManager.renderControl(oControl);
		}
	};

	/**
	 * Returns the reference to the UIArea of the container.
	 *
	 * @return {sap.ui.core.UIArea} reference to the UIArea of the container
	 * @public
	 */
	UIComponent.prototype.getUIArea = function() {
		return (this.oContainer ? this.oContainer.getUIArea() : null);
	};

	/**
	 * @see sap.ui.base.EventProvider#getEventingParent
	 * @protected
	 */
	UIComponent.prototype.getEventingParent = function() {
		return this.getUIArea();
	};

	/**
	 * Sets the reference to the ComponentContainer - later required for the
	 * determination of the UIArea for the UIComponent.
	 *
	 * @param {sap.ui.core.ComponentContainer} oContainer reference to a ComponentContainer
	 * @return {sap.ui.core.UIComponent} reference to this instance to allow method chaining
	 * @public
	 */
	UIComponent.prototype.setContainer = function(oContainer) {
		this.oContainer = oContainer;
		if (oContainer) {
			this._applyContextualSettings(oContainer._getContextualSettings());
		} else {
			this._oContextualSettings = ManagedObject._defaultContextualSettings;
			if (!this._bIsBeingDestroyed) {
				setTimeout(function() {
					// if object is being destroyed or container is set again (move) no propagation is needed
					if (!this.oContainer) {
						this._propagateContextualSettings();
					}
				}.bind(this), 0);
			}
		}
		return this;
	};

	/**
	 * Function is called when the rendering of the ComponentContainer is started.
	 *
	 * Applications must not call this hook method directly, it is called from ComponentContainer.
	 *
	 * Subclasses of UIComponent override this hook to implement any necessary actions before the rendering.
	 *
	 * @protected
	 */
	UIComponent.prototype.onBeforeRendering = function() {};

	/**
	 * Function is called when the rendering of the ComponentContainer is completed.
	 *
	 * Applications must not call this hook method directly, it is called from ComponentContainer.
	 *
	 * Subclasses of UIComponent override this hook to implement any necessary actions after the rendering.
	 *
	 * @protected
	 */
	UIComponent.prototype.onAfterRendering = function() {};

	/**
	 * Determines the router class name by checking the "routing" configuration manifest entry.
	 * Override to change the criteria for determining the router class.
	 * @private
	 * @ui5-restricted sap.suite.ui.generic.template
	 * @returns {string|undefined} Name of the router class to be used, or <code>undefined</code> for the default router.
	 */
	UIComponent.prototype._getRouterClassName = function() {
		var oRoutingManifestEntry = this._getManifestEntry("/sap.ui5/routing", true) || {},
			oRoutingConfig = oRoutingManifestEntry.config || {};

		return oRoutingConfig.routerClass;
	};

	return UIComponent;

});
