/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Targets in async mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {
		/**
		 * Creates a view and puts it in an aggregation of the specified control.
		 *
		 * @param {string|string[]} vTargets the key of the target as specified in the {@link #constructor}. To display multiple targets you may also pass an array of keys.
		 * @param {any} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @private
		 * @returns {Promise} resolving with {{name: *, view: *, control: *}|undefined} for every vTargets, object for single, array for multiple
		 */
		display : function (vTargets, vData) {
			var oSequencePromise = Promise.resolve();
			return this._display(vTargets, vData, oSequencePromise);
		},

		/**
		 * hook to distinguish between the router and an application calling this
		 * @param {array|object} vTargets targets or single target to be displayed
		 * @param {object} vData  an object that will be passed to the display event in the data property. If the
				target has parents, the data will also be passed to them.
		 * @param {*} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @return {Promise} resolving with {{name: *, view: *, control: *}|undefined} for every vTargets, object for single, array for multiple
		 *
		 * @private
		 */
		_display : function (vTargets, vData, oSequencePromise) {
			var that = this,
				aViewInfos = [];

			if (!jQuery.isArray(vTargets)) {
				vTargets = [vTargets];
			}

			return vTargets.reduce(function(oPromise, sTarget) {
				// gather view infos while processing Promise chain
				return that._displaySingleTarget(sTarget, vData, oPromise).then(function(oViewInfo) {
					aViewInfos.push(oViewInfo);
				});
			}, oSequencePromise).then(function() {
				return aViewInfos;
			});
		},

		/**
		 *
		 * @param sName name of the single target
		 * @param vData event data
		 * @private
		 */
		_displaySingleTarget : function (sName, vData, oSequencePromise) {
			var oTarget = this.getTarget(sName);

			if (oTarget !== undefined) {
				return oTarget._display(vData, oSequencePromise);
			} else {
				var sErrorMessage = "The target with the name \"" + sName + "\" does not exist!";
				jQuery.sap.log.error(sErrorMessage, this);
				return Promise.resolve({
					name: sName,
					error: sErrorMessage
				});
			}
		}
	};
});
