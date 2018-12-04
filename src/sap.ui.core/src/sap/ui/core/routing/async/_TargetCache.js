/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/Component"
], function(View, Component) {
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
		_getObjectWithGlobalId : function (oOptions, sType, bNoPromise) {
			var that = this,
				vPromiseOrObject,
				sName,
				oInstanceCache,
				aWrittenIds = [];

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

		_getComponentWithGlobalId : function(oOptions) {
			return this._getObjectWithGlobalId(oOptions, "Component");
		}
	};
});
