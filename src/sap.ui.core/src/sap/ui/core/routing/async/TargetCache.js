/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/Component",
	"sap/ui/core/routing/HashChanger"
], function(View, Component, HashChanger) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.TargetCache in async mode
	 * @private
	 * @experimental
	 * @since 1.58
	 */
	return {

		/**
				 * Determines the object with the given <code>oOptions</code>, <code>sType</code> and <code>oTargetCreateInfo</code>
				 *
				 * @param {object} oOptions The options of the desired object
				 * @param {string} sType The type of the desired object, e.g. 'View', 'Component', etc.
				 * @param {object} oTargetCreateInfo The object which contains extra information for the creation of the target
				 * @param {boolean} [bSynchronousCreate] When <code>true</code> the <code>View._create</code> is used for creating
				 *  the view instance synchronously. In all other cases the asynchronous <code>View.create</code> factory is used.
				 * @returns {Promise | object} The desired object, if the object already exists in the cache, if not the promise is returned
				 * @private
				 */
		_getObjectWithGlobalId : function (oOptions, sType, oTargetCreateInfo, _bSynchronousCreate, bNoCreate) {
			var that = this,
				vPromiseOrObject,
				sName,
				oInstanceCache,
				oOwnerComponent = this._oComponent,
				aWrittenIds = [];

			oTargetCreateInfo = oTargetCreateInfo || {};

			function fnCreateObjectAsync() {
				switch (sType) {
					case "View":
						oOptions.viewName = oOptions.name;
						delete oOptions.name;
						{
							return View.create(oOptions);
						}
					case "Component":
						oOptions.settings = oOptions.settings || {};

						// forward info, if parent component expects title propagation
						oOptions.settings._propagateTitle = oTargetCreateInfo.propagateTitle;

						// create the RouterHashChanger for the component which is going to be created
						var oRouterHashChanger = that._createRouterHashChanger(oTargetCreateInfo.prefix);
						if (oRouterHashChanger) {
							// put the RouterHashChanger as a private property to the Component constructor
							oOptions.settings._routerHashChanger = oRouterHashChanger;
						}

						if (oOptions.usage) {
							return oOwnerComponent.createComponent(oOptions);
						} else {
							return Component.create(oOptions);
						}
					default:
						// do nothing
				}
			}

			function afterLoaded(oObject) {
				if (that._oCache) { // the TargetCache may already be destroyed
					aWrittenIds.forEach(function(sId) {
						oInstanceCache[sId] = oObject;
					});

					if (oTargetCreateInfo.afterCreate) {
						oTargetCreateInfo.afterCreate(oObject);
					}

					that.fireCreated({
						object: oObject,
						type: sType,
						options: oOptions
					});
				}

				return oObject;
			}

			if (oOptions.async === undefined) {
				oOptions.async = true;
			}

			sName = oOptions.usage || oOptions.name;
			this._checkName(sName, sType);

			oInstanceCache = this._oCache[sType.toLowerCase()][sName];

			vPromiseOrObject = oInstanceCache && oInstanceCache[oOptions.id];

			if (bNoCreate || vPromiseOrObject) {
				return vPromiseOrObject;
			}

			if (oOwnerComponent) {
				vPromiseOrObject = oOwnerComponent.runAsOwner(fnCreateObjectAsync);

				if (vPromiseOrObject instanceof Promise) {
					oOwnerComponent.registerForDestroy(vPromiseOrObject);
				}
			} else {
				vPromiseOrObject = fnCreateObjectAsync();
			}

			if (vPromiseOrObject instanceof Promise) {
				vPromiseOrObject = vPromiseOrObject.then(afterLoaded);
			} else {
				vPromiseOrObject.loaded().then(afterLoaded);
			}

			if (!oInstanceCache) {
				oInstanceCache = this._oCache[sType.toLowerCase()][sName] = {};
				// save the object also to the undefined key if this is the first object created for its class
				oInstanceCache[undefined] = vPromiseOrObject;
				aWrittenIds.push(undefined);
			}

			if (oOptions.id !== undefined) {
				oInstanceCache[oOptions.id] = vPromiseOrObject;
				aWrittenIds.push(oOptions.id);
			}

			return vPromiseOrObject;
		},

		/**
				 * Determines the view with the given <code>oOptions</code>
				 *
				 * @param {object} oOptions The options of the desired object
				 * @param {boolean} [bSynchronousCreate] When <code>true</code> the <code>View._create</code> is used for creating
				 *  the view instance synchronously. In all other cases the asynchronous <code>View.create</code> factory is used.
				 * @returns {Promise | object} The desired object, if the object already exists in the cache, if not the promise is returned
				 * @private
				 */
		_getViewWithGlobalId : function (oOptions, _bSynchronousCreate, bNoCreate) {
			if (oOptions && !oOptions.name) {
				oOptions.name = oOptions.viewName;
			}
			return this._getObjectWithGlobalId(oOptions, "View", undefined, false, bNoCreate);
		},

		/**
		 * Determines the component with the given <code>oOptions</code> and <code>oTargetCreateInfo</code>
		 *
		 * @param {object} oOptions The options of the desired object
		 * @param {object} oTargetCreateInfo The object which contains extra information for the creation of the target
		 * @returns {Promise | object} The desired object, if the object already exists in the cache, if not the promise is returned
		 * @private
		 */
		_getComponentWithGlobalId : function(oOptions, oTargetCreateInfo, bNoCreate) {
			return this._getObjectWithGlobalId(oOptions, "Component", oTargetCreateInfo, bNoCreate);
		},

		/**
		 * Creates a new hash changer for the nested component
		 *
		 * @param {string} [sPrefix] The prefix of the target
		 * @returns {sap.ui.core.routing.HashChanger} The created sub hash changer, if creation was not possible the hash changer of the current component is returned
		 * @private
		 */
		_createRouterHashChanger: function(sPrefix) {
			var oRouterHashChanger;

			var oRouter = this._oComponent && this._oComponent.getRouter();
			if (oRouter) {
				oRouterHashChanger = oRouter.getHashChanger();
				if (oRouterHashChanger && sPrefix) {
					oRouterHashChanger = oRouterHashChanger.createSubHashChanger(sPrefix);
				}
			}
			// default to the root RouterHashChanger
			return oRouterHashChanger || HashChanger.getInstance().createRouterHashChanger();
		}
	};
});
