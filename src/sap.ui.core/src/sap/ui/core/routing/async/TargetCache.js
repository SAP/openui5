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
		 * @private
		 */
		_getObjectWithGlobalId : function (oOptions, sType, bNoPromise, oInfo) {
			var that = this,
				vPromiseOrObject,
				sName,
				oInstanceCache,
				aWrittenIds = [];

			oInfo = oInfo || {};

			function fnCreateObjectAsync() {
				switch (sType) {
					case "View":
						oOptions.viewName = oOptions.name;
						delete oOptions.name;
						if (bNoPromise) {
							// deprecated legacy branch via Router#getView - keep!
							return sap.ui.view(oOptions);
						} else {
							return View.create(oOptions);
						}
						break;
					case "Component":
						// create the RouterHashChanger for the component which is going to be created
						var oRouterHashChanger = that._createRouterHashChanger(oInfo.prefix);
						if (oRouterHashChanger) {
							oOptions.settings = oOptions.settings || {};
							// put the RouterHashChanger as a private property to the Component constructor
							oOptions.settings._routerHashChanger = oRouterHashChanger;
						}

						return Component.create(oOptions);
					default:
						// do nothing
				}
			}

			function afterLoaded(oObject) {
				if (that._oCache) { // the TargetCache may already be destroyed
					aWrittenIds.forEach(function(sId) {
						oInstanceCache[sId] = oObject;
					});

					if (oInfo.afterCreate) {
						oInfo.afterCreate(oObject);
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

			sName = oOptions.name;
			this._checkName(sName, sType);

			oInstanceCache = this._oCache[sType.toLowerCase()][sName];
			vPromiseOrObject = oInstanceCache && oInstanceCache[oOptions.id];

			if (vPromiseOrObject) {
				return vPromiseOrObject;
			}

			if (this._oComponent) {
				vPromiseOrObject = this._oComponent.runAsOwner(fnCreateObjectAsync);
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

		_getViewWithGlobalId : function (oOptions) {
			if (oOptions && !oOptions.name) {
				oOptions.name = oOptions.viewName;
			}
			return this._getObjectWithGlobalId(oOptions, "View", true /* no promise */);
		},

		_getComponentWithGlobalId : function(oOptions, oInfo) {
			return this._getObjectWithGlobalId(oOptions, "Component", false /* use promise */, oInfo);
		},

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
