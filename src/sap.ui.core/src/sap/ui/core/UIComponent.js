/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define(['jquery.sap.global', '../base/ManagedObject', './Component', './UIComponentMetadata', './mvc/View'],
	function(jQuery, ManagedObject, Component, UIComponentMetadata, View) {
	"use strict";


	/**
	 * Base Class for UIComponent.
	 *
	 * If you are extending an UIComponent make sure you read the {@link #.extend} documentation since the metadata is special.
	 *
	 * @class
	 * Creates and initializes a new UIComponent with the given <code>sId</code> and
	 * settings.
	 *
	 * The set of allowed entries in the <code>mSettings</code> object depends on
	 * the concrete subclass and is described there. See {@link sap.ui.core.Component}
	 * for a general description of this argument.
	 *
	 * @param {string}
	 *            [sId] Optional ID for the new control; generated automatically if
	 *            no non-empty ID is given Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> will be given or not!
	 * @param {object}
	 *            [mSettings] optional map/JSON-object with initial settings for the
	 *            new component instance
	 * @public
	 *
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

			try {
				Component.apply(this, arguments);
			} catch (e) {
				this._destroyCreatedInstances();
				throw e;
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
			routing: {
			}
			//autoDestroy: false // TODO: destroy component when view should be destroyed (not implemented yet!)
		}

	}, /* Metadata constructor */ UIComponentMetadata);

	/**
	 * Creates a new subclass of class <code>sap.ui.core.UIComponent</code> with name 
	 * <code>sClassName</code> and enriches it with the information contained in <code>oClassInfo</code>.
	 * <code>oClassInfo</code> might contain the same kind of information as described in 
	 * {@link sap.ui.core.Element.html#.extend}.
	 *
	 * @alias {sap.ui.core.UIComponent.extend}
	 * @public
	 * @param {string} sClassName Name of the class to be created
	 *
	 * @param {object} [oClassInfo] Object literal with information about the class
	 *
	 * @param {object} [oClassInfo.metadata] See {@link sap.ui.core.Element.html#.extend} for the values allowed in every extend.
	 *
	 * @param {object} [oClassInfo.metadata.routing]
	 * @since 1.16
	 * An object containing he routing-relevant configurations, routes, targets, config
	 * <b>Example for a config:</b><br/>
	 * <pre>
	 * <code>
	 * metadata : {
	 *     "routing": {
	 *         "routes": {
	 *             "welcome": {
	 *                 // If the url has no hash e.g.: index.html or index.html# , this route will be matched.
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
	 *             // If you are using the mobile library, you have to use a sap.m.Router, to get support for 
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
	 * }
	 * </code>
	 * </pre>
	 *
	 * Later you can retrieve the Router with {@link #getRouter} to register on callbacks when routes have matched. You can also retrieve Targets with {@link #getTargets} to display views without changing the hash.
	 *
	 * @param {object} [oClassInfo.metadata.routing.routes]
	 * @since 1.16
	 * An object containing the routes that should be added to the Router. See {@link sap.ui.core.routing.Route} for the allowed properties.
	 *
	 * @param {object} [oClassInfo.metadata.routing.targets]
	 * @since 1.28.1
	 * An object containing the targets that will be available for the router and the Targets instance.
	 * Read {@link sap.ui.core.routing.Targets} for the allowed values.
	 *
	 * @param {object} [oClassInfo.metadata.routing.config]
	 * @since 1.16
	 * An object containing default values used for routes and targets.
	 * See {@link sap.ui.core.routing.Router#constructor} and {@link sap.ui.core.routing.Targets} for more documentation.
	 *
	 * @param {string|function} [oClassInfo.metadata.routing.config.routerClass] Default: "sap.ui.core.routing.Router".
	 * @since 1.20
	 * The namespace of the router that is used in the component.
	 * If you are using an own router extension, it has to be required before the constructor of the component is invoked.
	 * If you use "sap.m.routing.Router" the component will automatically create a {@link sap.m.routing.Targets} instance.
	 * If you pass a function, it has to be a constructor function extending a router.
	 *
	 * @param {string|function} [oClassInfo.metadata.routing.config.targetsClass]
	 * @since 1.28.1
	 * default: "sap.ui.core.routing.Targets".
	 * The namespace of the targets that are used in the component.
	 * If you are using an own Targets extension, it has to be required before the constructor of the component is invoked.
	 * If you define routes in your routing section, this parameter will be ignored and the Targets instance of the router will be taken see {@lint #sap.ui.core.routing.Router#getTargets}.
	 *
	 *
	 * @param {string} [oClassInfo.metadata.routing.config.rootView]
	 * By default the rootView will be set to the ID of the view returned by the {@link #getRootView} function.
	 * You should not set this parameter if you create a view with the UIComponent.
	 *
	 * @param {function} [FNMetaImpl} Constructor function for the metadata object. If not given, it defaults to {@link sap.ui.core.ElementMetadata}.
	 */

	/**
	 * Initializes the Component instance after creation.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework while the constructor of a Component is executed.
	 *
	 * Subclasses of Component should override this hook to implement any necessary
	 * initialization. <b>When overriding this function make sure to invoke the
	 * init function of the UIComponent as well!</b>
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
		var oMetadata = this.getMetadata(),
			// extend the metadata config, so that the metadata object cannot be modified afterwards
			oRoutingManifestEntry = oMetadata._getRoutingSection() || {},
			oRoutingConfig = oRoutingManifestEntry.config || {},
			vRoutes = oRoutingManifestEntry.routes;

		// create the router for the component instance
		if (vRoutes) {
			jQuery.sap.require("sap.ui.core.routing.Router");
			var fnRouterConstructor = getConstructorFunctionFor(oRoutingConfig.routerClass || sap.ui.core.routing.Router);
			this._oRouter = new fnRouterConstructor(vRoutes, oRoutingConfig, this, oRoutingManifestEntry.targets);
			this._oTargets = this._oRouter.getTargets();
			this._oViews = this._oRouter.getViews();
		} else if (oRoutingManifestEntry.targets) {
			jQuery.sap.require("sap.ui.core.routing.Targets");
			jQuery.sap.require("sap.ui.core.routing.Views");
			this._oViews = new sap.ui.core.routing.Views({
				component: this
			});
			var fnTargetsConstructor = getConstructorFunctionFor(oRoutingConfig.targetsClass || sap.ui.core.routing.Targets);
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
		var oRootControl = this.getAggregation("rootControl");
		if (oRootControl instanceof View) {
			if (oRoutingConfig.targetParent === undefined) {
				oRoutingConfig.targetParent = oRootControl.getId();
			}
			if (this._oTargets) {
				this._oTargets._setRootViewId(oRootControl.getId());
			}
		}
	};

	function getConstructorFunctionFor (vRoutingObjectConstructor) {
		var fnConstructor;
		if (typeof vRoutingObjectConstructor === "string") {
			fnConstructor = jQuery.sap.getObject(vRoutingObjectConstructor);
			if (!fnConstructor) {
				jQuery.sap.log.error("The specified class for router or targets '" + vRoutingObjectConstructor + "' is undefined.", this);
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
		// destroy the router
		this._destroyCreatedInstances();
		// make sure that the component is destroyed properly
		Component.prototype.destroy.apply(this, arguments);
	};

	UIComponent.prototype._destroyCreatedInstances = function () {
		// destroy the router
		if (this._oRouter) {
			this._oRouter.destroy();
			delete this._oRouter;
		}

		if (this._oTargets) {
			this._oTargets.destroy();
			this._oTargets = null;
		}

		if (this._oViews) {
			this._oViews.destroy();
			this._oViews = null;
		}
	};

	/**
	 * Returns the reference to the router instance. The passed controller or view
	 * has to be created in the context of a UIComponent to return the router
	 * instance. Otherwise this function will return undefined.
	 * You may define the routerClass property in the config section of the routing to make the Component create your router extension.
	 * Example:
	 * routing: {
	 * 	config: {
	 * 		routerClass : myAppNamespace.MyRouterClass
	 * 		...
	 * }
	 * ...
	 * @param {sap.ui.core.mvc.View|sap.ui.core.mvc.Controller} oControllerOrView either a view or controller
	 * @return {sap.ui.core.routing.Router} the router instance
	 * @since 1.16.1
	 * @public
	 */
	UIComponent.getRouterFor = function(oControllerOrView) {
		var oView = oControllerOrView;
		if (oView instanceof sap.ui.core.mvc.Controller) {
			oView = oView.getView();
		}
		if (oView instanceof View) {
			var oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);

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
	 * prefixing.
	 *
	 * @since 1.15.1
	 * @return {boolean} true, if the Controls IDs should be prefixed automatically
	 * @protected
	 */
	UIComponent.prototype.getAutoPrefixId = function() {
		return false;
	};

	/**
	 * Returns an element by its ID in the context of the Component
	 *
	 * @param {string} sId
	 * @return {sap.ui.core.Element} Element by its id
	 * @public
	 */
	UIComponent.prototype.byId = function(sId) {
		return sap.ui.getCore().byId(this.createId(sId));
	};

	/**
	 * Creates an ID for an element prefixed with the Component ID
	 *
	 * @param {string} sId
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
	 * Checks whether the given ID is already prefixed with this view's ID
	 *
	 * @param {string} potentially prefixed id
	 * @return whether the ID is already prefixed
	 */
	UIComponent.prototype.isPrefixedId = function(sId) {
		return (sId && sId.indexOf(this.getId() + "---") === 0);
	};

	/**
	 * The method to create the Content (UI Control Tree) of the Component.
	 * This method has to be overwritten in the implementation of the component
	 * if the root view is not declared in the component metadata.
	 *
	 * @public
	 */
	UIComponent.prototype.createContent = function() {
		var oRootView = this.getMetadata().getRootView();
		if (oRootView && typeof oRootView === "string") {
			// This is a duplication of the logic in UIComponentMetadata#_convertLegacyMetadata
			// to convert the string into a configuration object for the view factory in
			// case of the manifest first approach.
			// !This should be kept in sync with the UIComponentMetadata functionality!
			return sap.ui.view({
				viewName: oRootView,
				type: sap.ui.core.mvc.ViewType.XML
			});
		} else if (oRootView) {
			return sap.ui.view(oRootView);
		}
		return null;
	};

	/**
	 * Renders the the root control of the UIComponent.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager a RenderManager instance
	 * @public
	 */
	UIComponent.prototype.render = function(oRenderManager) {
		var oControl = this.getAggregation("rootControl");
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


	return UIComponent;

});
