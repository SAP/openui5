/*!
 * ${copyright}
 */
sap.ui.define([
	"./TargetCache",
	"sap/base/util/UriParameters",
	"sap/base/Log"
],
	function(TargetCache, UriParameters, Log) {
		"use strict";

		/**
		 * Instantiates a view repository that creates and caches views. If it is destroyed, all the Views it created are destroyed.
		 * Usually you do not have to create instances of this class, it is used by the {@link sap.ui.core.routing.Router}.
		 * If you are using {@link sap.ui.core.routing.Targets} without using a {@link sap.ui.core.UIComponent} you have to create an instance of this class.
		 * They will create an instance on their own, or if they are used with a {@link sap.ui.core.UIComponent} they will share the same instance of Views.
		 *
		 * @class
		 * @extends sap.ui.base.EventProvider
		 * @public
		 * @since 1.28.1
		 * @param {object} [oOptions]
		 * @param {sap.ui.core.UIComponent} [oOptions.component] the owner of all the views that will be created by this Instance.
		 * @param {boolean} [oOptions.async=false] @since 1.34 Whether the views which are created through this Views are loaded asyncly. This option can be set only when the Views
		 * is used standalone without the involvement of a Router. Otherwise the async option is inherited from the Router.
		 * @alias sap.ui.core.routing.Views
		 */
		var Views = TargetCache.extend("sap.ui.core.routing.Views", /** @lends sap.ui.core.routing.Views.prototype */ {
			metadata: {
				publicMethods: ["getView", "setView"]
			},

			constructor: function (oOptions) {
				if (!oOptions) {
					oOptions = {};
				}

				// temporarily: for checking the url param
				function checkUrl() {
					if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
						Log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "TargetCache");
						return true;
					}
					return false;
				}

				// set the default target loading mode to sync for compatibility reasons
				// temporarily: set the default value depending on the url parameter "sap-ui-xx-asyncRouting"
				if (oOptions.async === undefined) {
					oOptions.async = checkUrl();
				}

				TargetCache.apply(this, [oOptions]);
			},

			/**
			 * Returns a cached view, for a given name. If it does not exist yet, it will create the view with the provided options.
			 * If you provide a viewId, it will be prefixed with the viewId of the component.
			 *
			 * @param {object} oOptions see {@link sap.ui.view} for the documentation.
			 * The viewId you pass into the options will be prefixed with the id of the component you pass into the constructor.
			 * So you can retrieve the view later by calling the {@link sap.ui.core.UIComponent#byId} function of the UIComponent.
			 *
			 * @param {string} oOptions.viewName If you do not use setView please see {@link sap.ui.view} for the documentation. This is used as a key in the cache of the Views instance. If you want to retrieve a view that has been given an alternative name in {@link #setView} you need to provide the same name here and you can skip all the other viewOptions.
			 * @return {Promise} A promise that is resolved when the view is loaded {@link sap.ui.core.mvc.View#loaded}. The view instance will be passed to the promise.
			 * @public
			 */
			getView: function(oOptions) {
				return this.get(oOptions, "View");
			},

			/**
			 * Adds or overwrites a view in the cache of the Views instance. The viewName serves as a key for caching.
			 *
			 * If the second parameter is set to null or undefined, the previous cache view under the same name isn't managed by the Views instance.
			 * The lifecycle (for example the destroy of the view) of the view instance should be maintained by additional code.
			 *
			 *
			 * @param {string} sViewName Name of the view, may differ from the actual viewName of the oView parameter provided, since you can retrieve this view per {@link #.getView}.
			 * @param {sap.ui.core.mvc.View|null|undefined} oView the view instance
			 * @return {sap.ui.core.routing.Views} this for chaining.
			 * @public
			 */
			setView: function (sViewName, oView) {
				return this.set(sViewName, "View", oView);
			},

			/**
			 * If a view is created, the event will be fired.
			 * It will not be fired, if a view was read from the cache of the Views object.
			 *
			 * @name sap.ui.core.routing.Views#created
			 * @event
			 * @param {sap.ui.base.Event} oEvent refer to {@link sap.ui.base.EventProvider} for details about getSource and getParameters
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {sap.ui.core.mvc.View} oEvent.getParameters.view the instance of the created view.
			 * @param {object} oEvent.getParameters.viewOptions The view options passed to {@link sap.ui.view}
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:created created} event of this
			 * <code>sap.ui.core.routing.Views</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Views</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler
			 *            along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>sap.ui.core.routing.Views</code> itself
			 *
			 * @returns {sap.ui.core.routing.Views} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:created created} event of this
			 * <code>sap.ui.core.routing.Views</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Views} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */

			/**
			 * Fires event {@link #event:created created} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 * @returns {sap.ui.core.routing.Views} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 */
			fireCreated: function (oParameters) {
				if (oParameters) {
					oParameters.view = oParameters.object;
					oParameters.viewOptions = oParameters.options;
				}
				return this.fireEvent("created", oParameters);
			}
		});

		return Views;

	});
