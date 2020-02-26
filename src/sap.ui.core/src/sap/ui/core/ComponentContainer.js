/*!
 * ${copyright}
 */

// Provides control sap.ui.core.ComponentContainer.
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'./Control',
	'./Component',
	'./Core',
	'./library',
	"./ComponentContainerRenderer",
	"sap/base/Log"
],
	function(
		ManagedObject,
		Control,
		Component,
		Core,
		library,
		ComponentContainerRenderer,
		Log
	) {
	"use strict";


	var ComponentLifecycle = library.ComponentLifecycle;


	/**
	 * Constructor for a new ComponentContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Container that embeds a <code>sap/ui/core/UIComponent</code> in a control tree.
	 *
	 * <b>Concerning asynchronous component loading:</b>
	 *
	 * To activate a fully asynchronous loading behavior of components and their dependencies,
	 * the property <code>async</code> needs to be set to <code>true</code> and
	 * the <code>manifest</code> property needs to be set to a 'truthy' value, e.g. <code>true</code> or a URL to the manifest location.
	 * If both options are correctly set, the component factory will load and evaluate the component manifest first.
	 * In this way, the additional dependencies of the Component are already known before the Component preload/controller is loaded.
	 * Both the component preload/controller and the additional dependencies can thus be loaded asynchronously and in parallel.
	 *
	 * Sample usage of the ComponentContainer:
	 *
	 * <pre>
	 *     &lt;!-- inside XML view -->
	 *     ...
	 *     &lt;core:ComponentContainer
	 *         usage="someComponent"
	 *         manifest="true"
	 *         async="true"
	 *     />
	 * </pre>
	 *
	 * See also {@link sap.ui.core.ComponentSupport}.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.ComponentContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ComponentContainer = Control.extend("sap.ui.core.ComponentContainer", /** @lends sap.ui.core.ComponentContainer.prototype */ { metadata : {

		library : "sap.ui.core",
		properties : {

			/**
			 * Component name, the package where the component is contained. This property can only be applied initially.
			 */
			name : {type : "string", defaultValue : null},

			/**
			 * The URL of the component. This property can only be applied initially.
			 */
			url : {type : "sap.ui.core.URI", defaultValue : null},

			/**
			 * Flag whether the component should be created sync (default) or async. The default
			 * will be async when initially the property <code>manifest</code> is set to a truthy
			 * value and for the property <code>async</code> no value has been specified.
			 * This property can only be applied initially.
			 */
			async : {type : "boolean", defaultValue : false},

			/**
			 * Enable/disable validation handling by MessageManager for this component.
			 * The resulting Messages will be propagated to the controls.
			 * This property can only be applied initially.
			 */
			handleValidation : {type : "boolean", defaultValue : false},

			/**
			 * The settings object passed to the component when created. This property can only be applied initially.
			 */
			settings : {type : "object", defaultValue : null},

			/**
			 * Defines whether binding information is propagated to the component.
			 */
			propagateModel : {type : "boolean", defaultValue : false},

			/**
			 * Container width in CSS size
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Container height in CSS size
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Lifecycle behavior for the Component associated by the <code>ComponentContainer</code>.
			 * The default behavior is <code>Legacy</code>. This  means that the <code>ComponentContainer</code>
			 * takes care that the Component is destroyed when the <code>ComponentContainer</code> is destroyed,
			 * but it is <b>not</b> destroyed when a new Component is associated.
			 * If you use the <code>usage</code> property to create the Component,
			 * the default behavior is <code>Container</code>. This means that
			 * the Component is destroyed when the <code>ComponentContainer</code> is destroyed or a new
			 * Component is associated.
			 * This property must only be applied before a component instance is created.
			 */
			lifecycle : {type : "sap.ui.core.ComponentLifecycle", defaultValue : ComponentLifecycle.Legacy},

			/**
			 * Flag, whether to auto-prefix the ID of the nested Component or not. If
			 * this property is set to true the ID of the Component will be prefixed
			 * with the ID of the ComponentContainer followed by a single dash.
			 * This property can only be applied initially.
			 */
			autoPrefixId : {type : "boolean", defaultValue: false},

			/**
			 * The component usage. If the ComponentContainer is used inside a
			 * Component, this Component can define a usage which will be used for creating
			 * the Component.
			 * This property can only be applied initially.
			 */
			usage : {type : "string", defaultValue : null},

			/**
			 * Controls when and from where to load the manifest for the Component.
			 * When set to any truthy value, the manifest will be loaded asynchronously by default
			 * and evaluated before the Component controller, if it is set to a falsy value
			 * other than <code>undefined</code>, the manifest will be loaded after the controller.
			 * A non-empty string value will be interpreted as the URL location from where to load the manifest.
			 * A non-null object value will be interpreted as manifest content.
			 * This property can only be applied initially.
			 */
			manifest: {type : "any" /* type: "string|boolean|object" */, defaultValue : null}

		},
		associations : {

			/**
			 * The component displayed in this ComponentContainer.
			 */
			component : {type : "sap.ui.core.UIComponent", multiple : false}
		},
		events : {

			/**
			 * Fired when the component instance has been created by the
			 * ComponentContainer.
			 * @since 1.50
			 */
			componentCreated : {
				parameters : {
					/**
					 * Reference to the created component instance
					 */
					component : { type: "sap.ui.core.UIComponent" }
				}
			},
			/**
			 * Fired when the creation of the component instance has failed.
			 * @since 1.60
			 */
			componentFailed : {
				parameters : {
					/**
					 * The reason object as returned by the component promise
					 */
					reason : { type: "object" }
				}
			}
		},
		designtime: "sap/ui/core/designtime/ComponentContainer.designtime"
	}});


	/*
	 * Helper function to set the new Component of the container.
	 */
	function setContainerComponent(oComponentContainer, vComponent, bSuppressInvalidate, bDestroyOldComponent) {
		// find the reference to the current component and to the old component
		var oComponent = typeof vComponent === "string" ? Core.getComponent(vComponent) : vComponent;
		var oOldComponent = oComponentContainer.getComponentInstance();
		// if there is no difference between the old and the new component just skip this setter
		if (oOldComponent !== oComponent) {
			// unlink the old component from the container
			if (oOldComponent) {
				oOldComponent.setContainer(undefined);
				if (bDestroyOldComponent) {
					oOldComponent.destroy();
				} else {
					// cleanup the propagated properties in case of not destroying the component
					oComponentContainer._propagateProperties(true, oOldComponent, ManagedObject._oEmptyPropagatedProperties, true);
				}
			}
			// set the new component
			oComponentContainer.setAssociation("component", oComponent, bSuppressInvalidate);
			// cross link the new component and propagate the properties (models)
			oComponent = oComponentContainer.getComponentInstance();
			if (oComponent) {
				oComponent.setContainer(oComponentContainer);
				oComponentContainer.propagateProperties(true); //propagate all
			}
		}
	}


	/**
	 * Returns the real component instance which is associated with the container.
	 * @return {sap.ui.core.UIComponent} the component instance
	 */
	ComponentContainer.prototype.getComponentInstance = function () {
		var sComponentId = this.getComponent();
		return sComponentId && Core.getComponent(sComponentId);
	};


	/**
	 * Sets the component of the container. Depending on the ComponentContainer's
	 * lifecycle this might destroy the old associated Component.
	 *
	 * Once the component is associated with the container the cross connection
	 * to the component will be set and the models will be propagated if defined.
	 * If the <code>usage</code> property is set the ComponentLifecycle is processed like a "Container" lifecycle.
	 *
	 * @param {string|sap.ui.core.UIComponent} vComponent ID of an element which becomes the new target of this component association. Alternatively, an element instance may be given.
	 * @return {sap.ui.core.ComponentContainer} the reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ComponentContainer.prototype.setComponent = function(vComponent, bSuppressInvalidate) {
		setContainerComponent(this, vComponent, bSuppressInvalidate,
			this.getLifecycle() === ComponentLifecycle.Container
			|| (typeof this.getUsage() === "string" && this.getUsage() && this.getLifecycle() === ComponentLifecycle.Legacy)
		);
		return this;
	};


	/*
	 * overrule and adopt initial values
	 */
	ComponentContainer.prototype.applySettings = function(mSettings, oScope) {
		if (mSettings) {
			// The "manifest" property has type "any" to be able to handle string|boolean|object.
			// When using the ComponentContainer in a declarative way (e.g. XMLView), boolean values
			// are passed as string. Therefore this type conversion needs to be done manually.
			// As this use-case is only relevant initially the handling is done in "applySettings"
			// instead of overriding "setManifest".
			if (mSettings.manifest === "true" || mSettings.manifest === "false") {
				mSettings.manifest = mSettings.manifest === "true";
			}

			// a truthy value for the manifest property will set the property
			// async to true if not provided initially
			if (mSettings.manifest && mSettings.async === undefined) {
				mSettings.async = true;
			}
		}
		Control.prototype.applySettings.apply(this, arguments);
	};

	/*
	 * Helper to create the settings object for the Component Factory or the
	 * createComponent function.
	 */
	function createComponentConfig(oComponentContainer) {
		var sName = oComponentContainer.getName();
		var vManifest = oComponentContainer.getManifest();
		var sUrl = oComponentContainer.getUrl();
		var mSettings = oComponentContainer.getSettings();
		var mConfig = {
			name: sName ? sName : undefined,
			manifest: vManifest !== null ? vManifest : false,
			async: oComponentContainer.getAsync(),
			url: sUrl ? sUrl : undefined,
			handleValidation: oComponentContainer.getHandleValidation(),
			settings: mSettings !== null ? mSettings : undefined
		};
		return mConfig;
	}

	/**
	 * Private helper to create the component instance based on the
	 * configuration of the Component Container
	 * @return {Promise|sap.ui.core.Component} a Promise for async and for sync scenarios a Component instance
	 * @private
	 */
	ComponentContainer.prototype._createComponent = function() {
		// determine the owner component
		var oOwnerComponent = Component.getOwnerComponentFor(this),
			sUsageId = this.getUsage(),
			mConfig = createComponentConfig(this);

		// First, enhance the config object with "usage" definition from manifest
		if (sUsageId) {
			if (oOwnerComponent) {
				mConfig = oOwnerComponent._enhanceWithUsageConfig(sUsageId, mConfig);
			} else {
				Log.error("ComponentContainer \"" + this.getId() + "\" does have a \"usage\", but no owner component!");
			}
		}

		// Then, prefix component ID with the container ID, as the ID might come from
		// the usage configuration in the manifest
		if (this.getAutoPrefixId()) {
			if (mConfig.id) {
				mConfig.id = this.getId() + "-" + mConfig.id;
			}
			if (mConfig.settings && mConfig.settings.id) {
				mConfig.settings.id = this.getId() + "-" + mConfig.settings.id;
			}
		}

		// Finally, create the component instance
		return Component._createComponent(mConfig, oOwnerComponent);
	};

	/*
	 * delegate the onBeforeRendering to the component instance
	 */
	ComponentContainer.prototype.onBeforeRendering = function() {

		// check if we have already a valid component instance
		// in this case we skip the component creation via props
		// ==> not in applySettings to make sure that components are lazy instantiated,
		//     e.g. in case of invisible containers the component will not be created
		//     immediately in the constructor.
		var oComponent = this.getComponentInstance(),
			sUsage = this.getUsage(),
			sName = this.getName(),
			sManifest = this.getManifest();
		if (!this._oComponentPromise && !oComponent && (sUsage || sName || sManifest)) {
			// create the component instance with the local configuration
			oComponent = this._createComponent();
			// check whether it is needed to delay to set the component or not
			if (oComponent instanceof Promise) {
				this._oComponentPromise = oComponent;
				oComponent.then(function(oComponent) {
					delete this._oComponentPromise;
					// set the component and invalidate to ensure a re-rendering!
					this.setComponent(oComponent);
					// notify listeners that a new component instance has been created
					this.fireComponentCreated({
						component: oComponent
					});
				}.bind(this), function(oReason) {
					delete this._oComponentPromise;
					this.fireComponentFailed({
						reason: oReason
					});
					Log.error("Failed to load component for container " + this.getId() + ". Reason: " + oReason);
				}.bind(this));
			} else if (oComponent) {
				this.setComponent(oComponent, true);
				// notify listeners that a new component instance has been created
				this.fireComponentCreated({
					component: oComponent
				});
			} else {
				this.fireComponentFailed({
					reason: new Error("The component could not be created.")
				});
			}
		}

		// delegate the onBeforeRendering to the component instance
		if (oComponent && oComponent.onBeforeRendering) {
			oComponent.onBeforeRendering();
		}

	};

	/*
	 * delegate the onAfterRendering to the component instance
	 */
	ComponentContainer.prototype.onAfterRendering = function() {
		var oComponent = this.getComponentInstance();
		if (oComponent && oComponent.onAfterRendering) {
			oComponent.onAfterRendering();
		}
	};


	/*
	 * once the container is destroyed we remove the reference to the container
	 * in the component and destroy the component unless its lifecycle is managed
	 * by the application.
	 */
	ComponentContainer.prototype.exit = function() {
		setContainerComponent(this, undefined, true,
			this.getLifecycle() !== ComponentLifecycle.Application);
	};


	/*
	 * overridden to support property propagation to the associated component
	 */
	ComponentContainer.prototype.propagateProperties = function (vName) {
		var oComponent = this.getComponentInstance();
		if (oComponent && this.getPropagateModel()) {
			this._propagateProperties(vName, oComponent);
		}
		Control.prototype.propagateProperties.apply(this, arguments);
	};

	/*
	 * overridden to support contextual settings propagation to the associated component
	 * no need to call the parent prototype method as there are no aggregations to propagate to
	 */
	ComponentContainer.prototype._propagateContextualSettings = function () {
		var oComponent = this.getComponentInstance();
		if (oComponent) {
			oComponent._applyContextualSettings(this._getContextualSettings());
		}
	};

	return ComponentContainer;

});