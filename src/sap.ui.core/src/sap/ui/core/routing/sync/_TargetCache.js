/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/mvc/View"], function(Log, View) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Views in sync mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * @private
		 */
		_getObjectWithGlobalId : function (oOptions) {
			function fnCreateView() {
				oOptions.viewName = oOptions.name;
				delete oOptions.name;
				return View._legacyCreate(oOptions);
			}

			var oView,
				sViewName = oOptions.name;

			this._checkName(sViewName, "View");
			oView = this._oCache.view[sViewName];

			if (oView) {
				return oView;
			}

			if (this._oComponent) {
				oView = this._oComponent.runAsOwner(fnCreateView);
			} else {
				oView = fnCreateView();
			}

			this._oCache.view[sViewName] = oView;

			this.fireCreated({
				object: oView,
				type: "View",
				options: oOptions
			});

			return oView;
		},

		_getViewWithGlobalId : function (oOptions) {
			if (oOptions && !oOptions.name) {
				oOptions.name = oOptions.viewName;
			}
			return this._getObjectWithGlobalId(oOptions);
		}
	};
});