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
				sName;

			function fnCreateObjectAsync() {
				switch (sType) {
					case "View":
						oOptions.viewName = oOptions.name;
						delete oOptions.name;
						if (bNoPromise) {
							return sap.ui.view(oOptions);
						} else {
							return sap.ui.view(oOptions).loaded();
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
					that._oCache[sType.toLowerCase()][sName] = oObject;
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
			vPromiseOrObject = this._oCache[sType.toLowerCase()][sName];


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

			this._oCache[sType.toLowerCase()][sName] = vPromiseOrObject;

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
