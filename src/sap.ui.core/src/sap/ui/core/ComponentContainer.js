/*!
 * ${copyright}
 */

// Provides control sap.ui.core.ComponentContainer.
sap.ui.define(['sap/ui/base/ManagedObject', './Control', './Component', './Core', './library'],
	function(ManagedObject, Control, Component, Core, library) {
	"use strict";


	var ComponentLifecycle = library.ComponentLifecycle;


	/**
	 * Constructor for a new ComponentContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Component Container
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
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
			 * Flag whether the component should be created sync (default) or async.
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
			 * Flag, whether to autoprefix the id of the nested Component or not. If
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
			usage : {type : "string", defaultValue : null}

		},
		associations : {

			/**
			 * The component displayed in this ComponentContainer.
			 */
			component : {type : "sap.ui.core.UIComponent", multiple : false}
		}
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
				oComponentContainer.propagateProperties();
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
	 * support the ID prefixing of the component
	 */
	ComponentContainer.prototype.applySettings = function(mSettings, oScope) {
		if (mSettings && mSettings.autoPrefixId === true && mSettings.settings && mSettings.settings.id) {
			mSettings.settings.id = this.getId() + "-" + mSettings.settings.id;
		}
		Control.prototype.applySettings.apply(this, arguments);
	};


	/*
	 * Helper to create the settings object for the Component Factory or the
	 * createComponent function.
	 */
	function createComponentConfig(oComponentContainer) {
		var sName = oComponentContainer.getName();
		var sUsage = oComponentContainer.getUsage();
		var mConfig = {
			name: sName ? sName : undefined,
			usage: sUsage ? sUsage : undefined,
			async: oComponentContainer.getAsync(),
			url: oComponentContainer.getUrl(),
			handleValidation: oComponentContainer.getHandleValidation(),
			settings: oComponentContainer.getSettings()
		};
		return mConfig;
	}


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
			sName = this.getName();
		if (!oComponent && (sUsage || sName)) {
			// determine the owner component
			var oOwnerComponent = Component.getOwnerComponentFor(this),
				mConfig = createComponentConfig(this);
			// create the component instance
			if (!oOwnerComponent) {
				oComponent = sap.ui.component(mConfig);
			} else {
				oComponent = oOwnerComponent._createComponent(mConfig);
			}
			// check whether it is needed to delay to set the component or not
			if (oComponent instanceof Promise) {
				oComponent.then(function(oComponent) {
					// set the component and invalidate to ensure a re-rendering!
					this.setComponent(oComponent);
				}.bind(this));
			} else {
				this.setComponent(oComponent, true);
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
			Control.prototype.propagateProperties.apply(this, arguments);
		}
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
