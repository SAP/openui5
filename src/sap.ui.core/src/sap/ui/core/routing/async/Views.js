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
			var oView, sViewName;

			if (!oOptions) {
				jQuery.sap.log.error("the oOptions parameter of getView is mandatory", this);
			} else {
				if (oOptions.async === undefined) {
					oOptions.async = true;
				}
				sViewName = oOptions.viewName;
				this._checkViewName(sViewName);
				oView = this._oViews[sViewName];
			}

			if (oView) {
				return oView;
			}

			if (this._oComponent) {
				oView = this._oComponent.runAsOwner(fnCreateView);
			} else {
				oView = fnCreateView();
			}

			this._oViews[sViewName] = oView;

			oView.loaded().then(function(oView) {
				this.fireCreated({
					view: oView,
					viewOptions: oOptions
				});
			}.bind(this));

			return oView;
		}
	};
});
