/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define(['jquery.sap.global', './Component', './UIComponentMetadata', './mvc/View'],
	function(jQuery, Component, UIComponentMetadata, View) {
	"use strict";


	/**
	 * Creates and initializes a new UI component with the given <code>sId</code> and
	 * settings.
	 * 
	 * The set of allowed entries in the <code>mSettings</code> object depends on
	 * the concrete subclass and is described there. See {@link sap.ui.core.Component}
	 * for a general description of this argument.
	 * 
	 * @param {string}
	 *            [sId] optional id for the new control; generated automatically if
	 *            no non-empty id is given Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> will be given or not!
	 * @param {object}
	 *            [mSettings] optional map/JSON-object with initial settings for the
	 *            new component instance
	 * @public
	 * 
	 * @class Base Class for UI Component.
	 * @extends sap.ui.core.Component
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @name sap.ui.core.UIComponent
	 * @since 1.9.2
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UIComponent = Component.extend("sap.ui.core.UIComponent", /** @lends sap.ui.core.UIComponent.prototype */
	
	{
		constructor : function(sId, mSettings) {
	
			try {
				Component.apply(this, arguments);
			} catch (e) {
				if (this._oRouter) {
					this._oRouter.destroy();
				}
				throw e;
			}
	
		},
	
		metadata : {
			"abstract": true,
			rootView : null, // the rootView to open (view name as string or view configuration object)
			publicMethods: [ "render" ],
			aggregations: {
				/**
				 * The root Control of the UIComponent. 
				 * 
				 * The root control should be created inside the function {@link sap.ui.core.UIComponent#createContent}.
				 */
				"rootControl": { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
			},
			routing: {
				/*
				config: { // default values for routing
					routerClass : myAppNamespace.MyRouterClass
					viewType : "XML",
					viewPath: "NavigationWithoutMasterDetailPattern.view",
					targetParent: "myViewId",
					targetControl: "app",
					targetAggregation: "pages",
					clearTarget: false
				},
				*/
				/*
				routes: [ // contains routing configuration objects
					{
						name : "myRouteName1",
						pattern : "FirstView/{from}",
						view : "myViewId"
					},
				]
				*/
			}
			//autoDestroy: false // TODO: destroy component when view should be destroyed (not implemented yet!)
		}
	
	}, /* Metadata constructor */ UIComponentMetadata);
	
	/**
	 * Initializes the Component instance after creation.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework while the constructor of an Component is executed.
	 *
	 * Subclasses of Component should override this hook to implement any necessary
	 * initialization. <b>When overriding this function make sure to invoke the
	 * init function of the UIComponent as well!</b> 
	 *
	 * @function
	 * @name sap.ui.core.Component.prototype.init
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
		var oMetadata = this.getMetadata();
		// extend the metadata config, so that the metadata object cannot be modified afterwards
		var oRoutingConfig = jQuery.extend({}, oMetadata.getRoutingConfig());
		var aRoutes = oMetadata.getRoutes();
	
		// create the router for the component instance
		if (aRoutes) {
			jQuery.sap.require("sap.ui.core.routing.Router");
			var fnRouterConstructor = oRoutingConfig.routerClass || sap.ui.core.routing.Router;
			if (typeof fnRouterConstructor === "string") {
				fnRouterConstructor = jQuery.sap.getObject(fnRouterConstructor);
			}
			
			this._oRouter = new fnRouterConstructor(aRoutes, oRoutingConfig, this);
		}
	
		// create the content
		sap.ui.base.ManagedObject.runWithOwner(function() {
			sap.ui.base.ManagedObject.runWithPreprocessors(function() {
				that.setAggregation("rootControl", that.createContent());
			}, oPreprocessors);
		}, this);
	
		// only for root "views" we automatically define the target parent
		var oRootControl = this.getAggregation("rootControl");
		if (oRootControl instanceof View) {
			if (oRoutingConfig.targetParent === undefined) {
				oRoutingConfig.targetParent = oRootControl.getId();
			}
		}
	};
	
	/*
	 * Destruction of the UIComponent
	 * @name sap.ui.core.UIComponent#destroy
	 * @function
	 */
	UIComponent.prototype.destroy = function() {
		// destroy the router
		if (this._oRouter) {
			this._oRouter.destroy();
			delete this._oRouter;
		}
		// make sure that the component is destroyed properly
		Component.prototype.destroy.apply(this, arguments);
	};
	
	/**
	 * Returns the reference to the router instance. The passed controller or view
	 * have to be created in the context of a UIComponent to return the router 
	 * instance. Otherwise this function will return undefined.
	 * You may define the routerClass property in the config section of the routing to make the Component create your router extension.
	 * eg: 
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
	 * @name sap.ui.core.UIComponent.getRouterFor
	 * @function
	 */
	UIComponent.getRouterFor = function(oControllerOrView) {
		var oView = oControllerOrView;
		if (oView instanceof sap.ui.core.mvc.Controller) {
			oView = oView.getView();
		}
		if (oView instanceof View) {
			var sOwner = Component.getOwnerIdFor(oView),
				oComponent = sap.ui.component(sOwner);
			
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
	 * @name sap.ui.core.UIComponent#getRouter
	 * @function
	 */
	UIComponent.prototype.getRouter = function() {
		return this._oRouter;
	};
	
	/**
	 * A method to be implemented by UIComponents, returning the flag whether to prefix 
	 * the IDs of controls automatically or not if the controls are created inside
	 * the {@link sap.ui.core.UIComponent#createContent} function. By default this 
	 * feature is not activated. 
	 * 
	 * You can overwrite this function and return true to activate the automatic
	 * prefixing.
	 * 
	 * @since 1.15.1
	 * @return {boolean} true, if the controls IDs should be prefixed automatically
	 * @protected
	 * @name sap.ui.core.UIComponent#getAutoPrefixId
	 * @function
	 */
	UIComponent.prototype.getAutoPrefixId = function() {
		return false;
	};
	
	/**
	 * Returns an Element by its id in the context of the Component
	 *
	 * @param {string} sId
	 * @return {sap.ui.core.Element} Element by its id
	 * @public
	 * @name sap.ui.core.UIComponent#byId
	 * @function
	 */
	UIComponent.prototype.byId = function(sId) {
		return sap.ui.getCore().byId(this.createId(sId));
	};
	
	/**
	 * Creates an id for an Element prefixed with the component id
	 *
	 * @param {string} sId
	 * @return {string} prefixed id
	 * @public
	 * @name sap.ui.core.UIComponent#createId
	 * @function
	 */
	UIComponent.prototype.createId = function(sId) {
		if (!this.isPrefixedId(sId)) {
			// components have 3 dashes as separator, views 2 and controls/elements 1
			sId = this.getId() + "---" + sId;
		}
		return sId;
	};
	
	/**
	 * Checks whether the given ID is already prefixed with this View's ID
	 *
	 * @param {string} potentially prefixed id
	 * @return whether the ID is already prefixed
	 * @name sap.ui.core.UIComponent#isPrefixedId
	 * @function
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
	 * @name sap.ui.core.UIComponent#createContent
	 * @function
	 */
	UIComponent.prototype.createContent = function() {
		var oRootView = this.getMetadata().getRootView();
		if (oRootView) {
			return sap.ui.view(oRootView);
		}
		return null;
	};
	
	/**
	 * Renders the the root control of the UIComponent.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager a RenderManager instance
	 * @public
	 * @name sap.ui.core.UIComponent#render
	 * @function
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
	 * @name sap.ui.core.UIComponent#getUIArea
	 * @function
	 */
	UIComponent.prototype.getUIArea = function() {
		return (this.oContainer ? this.oContainer.getUIArea() : null);
	};
	
	/**
	 * @see sap.ui.base.EventProvider#getEventingParent
	 * @protected
	 * @name sap.ui.core.UIComponent#getEventingParent
	 * @function
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
	 * @name sap.ui.core.UIComponent#setContainer
	 * @function
	 */
	UIComponent.prototype.setContainer = function(oContainer) {
		this.oContainer = oContainer;
		return this;
	};
	
	/**
	 * Function is called when the rendering of the Component Container is started.
	 *
	 * Applications must not call this hook method directly, it is called from ComponentContainer.
	 *
	 * Subclasses of UIComponent override this hook to implement any necessary actions before the rendering.
	 *
	 * @function
	 * @name sap.ui.core.UIComponent.prototype.onBeforeRendering
	 * @protected
	 */
	UIComponent.prototype.onBeforeRendering = function() {};
	
	/**
	 * Function is called when the rendering of the Component Container is completed.
	 *
	 * Applications must not call this hook method directly, it is called from ComponentContainer.
	 *
	 * Subclasses of UIComponent override this hook to implement any necessary actions after the rendering.
	 *
	 * @function
	 * @name sap.ui.core.UIComponent.prototype.onAfterRendering
	 * @protected
	 */
	UIComponent.prototype.onAfterRendering = function() {};
	

	return UIComponent;

}, /* bExport= */ true);
