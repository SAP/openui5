/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {

		_getViewWithGlobalId : function (oOptions) {
			function fnCreateView() {
				return sap.ui.view(oOptions);
			}

			if (!oOptions) {
				jQuery.sap.log.error("the oOptions parameter of getView is mandatory", this);
			}

			var oView,
				sViewName = oOptions.viewName;

			this._checkViewName(sViewName);
			oView = this._oViews[sViewName];

			if (oView) {
				return oView;
			}

			if (this._oComponent) {
				oView = this._oComponent.runAsOwner(fnCreateView);
			} else {
				oView = fnCreateView();
			}

			this._oViews[sViewName] = oView;

			this.fireCreated({
				view: oView,
				viewOptions: oOptions
			});

			return oView;
		}
	};
});
