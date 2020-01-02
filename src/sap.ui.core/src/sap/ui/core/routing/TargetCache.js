/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/EventProvider',
	'sap/ui/core/routing/async/TargetCache',
	'sap/ui/core/routing/sync/TargetCache',
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function (
		EventProvider,
		asyncCache,
		syncCache,
		assert,
		Log,
		jQuery
	) {
		"use strict";

		/**
		 * Instantiates a cache repository that creates and caches views and components which are loaded by {@link sap.u.core.routing.Targets}.
		 *
		 * If it is destroyed, all the views and components which it created are destroyed. If the views or components are still being loaded,
		 * they will be destroyed after they are loaded.
		 *
		 * This class is currectly private and shouldn't be used out of the sap.ui.core.routing scope.
		 *
		 * @class
		 * @extends sap.ui.base.EventProvider
		 * @private
		 * @param {object} [oOptions]
		 * @param {sap.ui.core.UIComponent} [oOptions.component] the owner of all the views that will be created by this Instance.
		 * @param {boolean} [oOptions.async=true] Whether the views and components which are created through this class are loaded asyncly.
		 * This option can be set only when TargetCache is used standalone without the involvement of a Router.
		 * Otherwise the async option is inherited from the Router.
		 * @alias sap.ui.core.routing.TargetCache
		 */
		var TargetCache = EventProvider.extend("sap.ui.core.routing.TargetCache", /** @lends sap.ui.core.routing.TargetCache.prototype */ {

			constructor : function (oOptions) {
				if (!oOptions) {
					oOptions = {};
				}

				this._oCache = {
					view: {},
					component: {}
				};

				this._oComponent = oOptions.component;
				if (this._oComponent) {
					assert(this._oComponent.isA("sap.ui.core.UIComponent"), this + ' - the component passed to the constructor needs to be an instance of UIComponent');
				}

				EventProvider.apply(this, arguments);

				this.async = oOptions.async;
				if (this.async === undefined) {
					// make the default value for async to true
					this.async = true;
				}

				var CacheStub = this.async ? asyncCache : syncCache;

				for (var fn in CacheStub) {
					this[fn] = CacheStub[fn];
				}
			},

			metadata : {
				publicMethods: ["get", "set"]
			},

			/**
			 * Returns a cached view or component, for a given name. If it does not exist yet, it will create the view or component with the provided options.
			 * If you provide a "id" in the "oOptions", it will be prefixed with the id of the component.
			 *
			 * @param {object} oOptions see {@link sap.ui.core.mvc.View.create} or {@link sap.ui.core.Component.create} for the documentation.
			 * @param {string} oOptions.name If you do not use setView please see {@link sap.ui.core.mvc.View.create} or {@link sap.ui.core.Component.create} for the documentation.
			 * This is used as a key in the cache of the view or component instance. If you want to retrieve a view or a component that has been given an alternative name in {@link #set},
			 * you need to provide the same name here and you can skip all the other options.
			 * @param {string} [oOptions.id] The id you pass into the options will be prefixed with the id of the component you pass into the constructor.
			 * So you can retrieve the view later by calling the {@link sap.ui.core.UIComponent#byId} function of the UIComponent.
			 * @param {string} sType whether the object is a "View" or "Component". Views and components are stored separately in the cache. This means that a view and a component instance
			 * could be stored under the same name.
			 * @return {Promise} A promise that is resolved when the view or component is loaded. The view or component instance will be passed to the resolve function.
			 * @private
			 */
			get : function (oOptions, sType) {
				var oObject;

				try {
					if (sType === "Component" && !this.async) {
						Log.error("sap.ui.core.routing.Target doesn't support loading component in synchronous mode, please switch routing to async");
						throw new Error("sap.ui.core.routing.Target doesn't support loading component in synchronous mode, please switch routing to async");
					}

					if (!oOptions) {
						Log.error("the oOptions parameter of getObject is mandatory", this);
						throw new Error("the oOptions parameter of getObject is mandatory");
					}

					oObject = this._get(oOptions, sType);
				} catch (e) {
					return Promise.reject(e);
				}

				if (oObject instanceof Promise) {
					return oObject;
				} else if (oObject.isA("sap.ui.core.mvc.View")) {
					return oObject.loaded();
				} else {
					return Promise.resolve(oObject);
				}
			},

			/**
			 * Adds or overwrites a view or a component in the TargetCache. The given object is cached under its name and the 'undefined' key.
			 *
			 * If the third parameter is set to null or undefined, the previous cache view or component under the same name isn't managed by the TargetCache instance.
			 * The lifecycle (for example the destroy) of the view or component instance should be maintained by additional code.
			 *
			 *
			 * @param {string} sName Name of the view or component, may differ from the actual name of the oObject parameter provided, since you can retrieve this view or component per {@link #.getObject}.
			 * @param {string} sType whether the object is a "View" or "Component". Views and components are stored separately in the cache. This means that a view and a component instance
			 * could be stored under the same name.
			 * @param {sap.ui.core.mvc.View|sap.ui.core.UIComponent|null|undefined} oObject the view or component instance
			 * @return {sap.ui.core.routing.TargetCache} this for chaining.
			 * @private
			 */
			set : function (sName, sType, oObject) {
				var oInstanceCache;

				this._checkName(sName, sType);
				assert(sType === "View" || sType === "Component", "sType must be either 'View' or 'Component'");

				oInstanceCache = this._oCache[sType.toLowerCase()][sName];

				if (!oInstanceCache) {
					oInstanceCache = this._oCache[sType.toLowerCase()][sName] = {};
				}

				oInstanceCache[undefined] = oObject;

				return this;
			},

			/**
			 * Destroys all the views and components created by this instance.
			 *
			 * @returns {sap.ui.core.routing.TargetCache} this for chaining.
			 */
			destroy : function () {
				EventProvider.prototype.destroy.apply(this);

				if (this.bIsDestroyed) {
					return this;
				}

				function destroyObject(oObject) {
					if (oObject && oObject.destroy) {
						oObject.destroy();
					}
				}

				Object.keys(this._oCache).forEach(function (sType) {
					var oTypeCache = this._oCache[sType];
					Object.keys(oTypeCache).forEach(function (sKey) {
						var oInstanceCache = oTypeCache[sKey];
						Object.keys(oInstanceCache).forEach(function(sId) {
							var vObject = oInstanceCache[sId];
							if (vObject instanceof Promise) { // if the promise isn't replaced by the real object yet
								// wait until the promise resolves to destroy the object
								vObject.then(destroyObject);
							} else {
								destroyObject(vObject);
							}
						});
					});
				}.bind(this));

				this._oCache = undefined;
				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * If a view or component is created the event will be fired.
			 * It will not be fired, if a view or component was read from the cache.
			 *
			 * @name sap.ui.core.routing.TargetCache#created
			 * @event
			 * @param {sap.ui.base.Event} oEvent refer to {@link sap.ui.base.EventProvider} for details about getSource and getParameters
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {sap.ui.core.mvc.View|sap.ui.core.UIComponent} oEvent.getParameters.object the instance of the created view.
			 * @param {string} oEvent.getParameters.type whether it's a "View" or "Component"
			 * @param {object} oEvent.getParameters.options The options passed to {@link sap.ui.core.mvc.View.create} or {@link sap.ui.core.Component.create}
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:created created} event of this
			 * <code>sap.ui.core.routing.TargetCache</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.TargetCache</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler
			 *            along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>sap.ui.core.routing.TargetCache</code> itself
			 *
			 * @returns {sap.ui.core.routing.TargetCache} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachCreated : function(oData, fnFunction, oListener) {
				return this.attachEvent("created", oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:created created} event of this
			 * <code>sap.ui.core.routing.TargetCache</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.TargetCache} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachCreated : function(fnFunction, oListener) {
				return this.detachEvent("created", fnFunction, oListener);
			},

			/**
			 * Fires event {@link #event:created created} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 * @returns {sap.ui.core.routing.TargetCache} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 */
			fireCreated : function(oParameters) {
				return this.fireEvent("created", oParameters);
			},

			/*
			 * Privates
			 */

			_get : function (oOptions, sType, bGlobalId, oInfo) {
				var oObject;
				switch (sType) {
					case "View":
						oObject = this._getView(oOptions, bGlobalId);
						break;
					case "Component":
						oObject = this._getComponent(oOptions, bGlobalId, oInfo);
						break;
					default:
						throw Error("The given sType: " + sType + " isn't supported by TargetCache.getObject");
				}
				return oObject;
			},

			/**
			 * Hook for retrieving views synchronous way since Targets and router are not doing this yet
			 * @param {object} oOptions The options to determine the view
			 * @param {boolean} bGlobalId True, if a global id should be generated
			 * @returns {*} the view
			 * @private
			 */
			_getView : function (oOptions, bGlobalId) {
				if (!bGlobalId) {
					oOptions = this._createId(oOptions);
				}

				return this._getViewWithGlobalId(oOptions);
			},

			_getComponent : function (oOptions, bGlobalId, oInfo) {
				if (!bGlobalId) {
					oOptions = this._createId(oOptions);
				}

				return this._getComponentWithGlobalId(oOptions, oInfo);
			},

			_createId: function (oOptions) {
				if (this._oComponent && oOptions.id) {
					oOptions = jQuery.extend({}, oOptions, { id : this._oComponent.createId(oOptions.id) });
				}
				return oOptions;
			},

			/**
			 * hook for the deprecated property viewId on the route, will not prefix the id with the component
			 *
			 * @name sap.ui.core.routing.TargetCache#_getViewWithGlobalId
			 * @returns {*}
			 * @private
			 */

			/**
			 * @param {string} sName logs an error if it is empty or undefined
			 * @param {string} sType whether it's a 'View' or 'Component'
			 * @private
			 */
			_checkName : function (sName, sType) {

				if (!sName) {
					var sMessage = "A name for the " + sType.toLowerCase() + " has to be defined";
					Log.error(sMessage, this);
					throw Error(sMessage);
				}

			}
		});

		return TargetCache;

	});
