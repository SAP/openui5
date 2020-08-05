/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.m.routing.Targets in async mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * @private
		 */
		_display: function () {
			var iViewLevel,
				sName;

			// don't remember previous displays
			this._oLastDisplayedTarget = null;

			var oPromise = this._super._display.apply(this, arguments);

			return oPromise.then(function(oViewInfo) {
				// maybe a wrong name was provided then there is no last displayed target
				if (this._oLastDisplayedTarget) {
					iViewLevel = this._getViewLevel(this._oLastDisplayedTarget);
					sName = this._oLastDisplayedTarget._oOptions._name;
				}

				this._oTargetHandler.navigate({
					viewLevel: iViewLevel,
					navigationIdentifier: sName,
					askHistory: true
				});

				return oViewInfo;
			}.bind(this));
		},

		/**
		 * @private
		 */
		_displaySingleTarget: function(oTargetInfo) {
			var oTarget = this.getTarget(oTargetInfo.name);

			return this._super._displaySingleTarget.apply(this, arguments).then(function(oViewInfo){
				if (oTarget) {
					this._oLastDisplayedTarget = oTarget;
				}
				return oViewInfo;
			}.bind(this));
		}
	};
}, /* bExport= */ true);
