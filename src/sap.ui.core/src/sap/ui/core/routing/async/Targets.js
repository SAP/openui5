/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/Log"], function(Log) {
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
		 * @param {string|string[]|object|object[]} vTargets the key of the target as specified in the {@link #constructor}. To display multiple targets you may also pass an array of keys. If the target(s) represents a sap.ui.core.UIComponent, a prefix for its Router is needed. You can set this parameter with an object which has the 'name' property set with the key of the target and the 'prefix' property set with the prefix for the UIComponent's router. To display multiple component targets, you man also pass an array of objects.
		 * @param {object} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @param {string} [sTitleTarget] the name of the target from which the title option is taken for firing the {@link sap.ui.core.routing.Targets#event:titleChanged titleChanged} event
		 * @private
		 * @returns {Promise} resolving with {{name: *, view: *, control: *}|undefined} for every vTargets, object for single, array for multiple
		 */
		display : function (vTargets, vData, sTitleTarget) {
			var oSequencePromise = Promise.resolve();
			return this._display(vTargets, vData, sTitleTarget, oSequencePromise);
		},

		/**
		 * Hook to distinguish between the router and an application calling this
		 *
		 * @param {string|string[]|object|object[]} vTargets targets or single target to be displayed
		 * @param {object} vData  an object that will be passed to the display event in the data property. If the
				target has parents, the data will also be passed to them.
		 * @param {string} sTitleTarget the name of the target from which the title option is taken for firing the {@link sap.ui.core.routing.Targets#event:titleChanged titleChanged} event
		 * @param {Promise} oSequencePromise the promise for chaining
		 * @return {Promise} resolving with {{name: *, view: *, control: *}|undefined} for every vTargets, object for single, array for multiple
		 *
		 * @private
		 */
		_display : function (vTargets, vData, sTitleTarget, oSequencePromise) {
			var that = this,
				aViewInfos = [];

			if (!Array.isArray(vTargets)) {
				vTargets = [vTargets];
			}

			this._attachTitleChanged(vTargets, sTitleTarget);

			return this._alignTargetsInfo(vTargets).reduce(function(oPromise, oTargetInfo) {
				var oTargetCreateInfo = {
					prefix: oTargetInfo.prefix
				};

				// gather view infos while processing Promise chain
				return that._displaySingleTarget(oTargetInfo, vData, oPromise, oTargetCreateInfo).then(function(oViewInfo) {
					oViewInfo = oViewInfo || {};
					oViewInfo.targetInfo = oTargetInfo;
					aViewInfos.push(oViewInfo);
				});
			}, oSequencePromise).then(function() {
				return aViewInfos;
			});
		},

		/**
		 * Displays a single target
		 *
		 * @param {object} oTargetInfo the object containing information (e.g. name) about the single target
		 * @param {any} vData an object that will be passed to the display event in the data property.
		 * @param {Promise} oSequencePromise the promise which for chaining
		 * @param {object} [oTargetCreateInfo] the object which contains extra information for the creation of the target
		 * @param {function} [oTargetCreateInfo.afterCreate] the function which is called after a target View/Component is instantiated
		 * @param {string} [oTargetCreateInfo.prefix] the prefix which will be used by the RouterHashChanger of the target
		 * @returns {Promise} Resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it rejects with error information
		 * @private
		 */
		_displaySingleTarget : function (oTargetInfo, vData, oSequencePromise, oTargetCreateInfo) {
			var sName = oTargetInfo.name,
				oTarget = this.getTarget(sName);

			if (oTarget !== undefined) {
				return oTarget._display(vData, oSequencePromise, oTargetCreateInfo);
			} else {
				var sErrorMessage = "The target with the name \"" + sName + "\" does not exist!";
				Log.error(sErrorMessage, this);
				return Promise.resolve({
					name: sName,
					error: sErrorMessage
				});
			}
		}
	};
});
