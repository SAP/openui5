/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/m/p13n/Engine"
	],
	(Engine) => {
		"use strict";

		/**
		 * Enhances a given control prototype with consolidated handling for adaptation.
		 *
		 * The following methods are available:
		 *
		 * <ul>
		 * <li><code>getEngine</code> - Provides access to the adaptation engine singleton instance.</li>
		 * <li><code>retrieveInbuiltFilter</code> - Provides access to the AdaptationFilterBar initialization</li>
		 * <li><code>getInbuiltFilter</code> - Returns the AdaptationFilterBar instance, if available.</li>

		 * <li><code>getAdaptationConfigAttribute</code> - Returns an adaptationConfig attribute.</li>
		 * </ul>
		 *
		 * Additionally, the following methods are wrapped:
		 *
		 * <ul>
		 * <li><code>exit</code></li>
		 * </ul>
		 *
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @alias sap.ui.mdc.mixin.AdaptationMixin
		 * @namespace
		 * @since 1.82.0
		 * @private
		 * @ui5-restricted sap.ui.mdc
		*/
		const AdaptationMixin = {};

		AdaptationMixin.getEngine = function() {
			return Engine.getInstance();
		};

		/**
		 * Hook which is executed after a chain of changes has been processed by a changehandler.
		 * <b>Note</b>: This hook will be executed whenever a change is applied or reverted, e.g:
		 * <ul>
		 * <li><code>variant appliance</code></li>
		 * <li><code>enduser personalization</code></li>
		 * <li><code>reset triggered</code></li>
		 * </ul>
		 *
		 */
		AdaptationMixin._onModifications = function() {
			//
		};

		/**
		 * Returns a promise after the Control#_onModifications hook has been fulfilled which may return a promise.
		 *
		 * @returns {Promise} Resolves with a list of changes (may be empty list) after all control updates have been considered
		 */
		AdaptationMixin.awaitPendingModification = function() {
			const pPendingModification = this._pPendingModification || Promise.resolve();
			const aChangesProcessed = Engine.getInstance().getTrace(this);

			return pPendingModification.then(() => {
				return aChangesProcessed;
			});
		};

		/**
		 * Initializes the <code>AdaptationFilterBar</code> used for inbuilt filtering.
		 *
		 * @private
		 * @returns {Promise} Returns a promise resolving in the <code>AdaptationFilterBar</code> instance
		 */
		AdaptationMixin.retrieveInbuiltFilter = function() {
			if (!this._oInbuiltFilterPromise) {
				this._oInbuiltFilterPromise = new Promise((resolve, reject) => {
					sap.ui.require(["sap/ui/mdc/filterbar/p13n/AdaptationFilterBar"], (AdaptationFilterBar) => {

						if (this.bIsDestroyed) {
							reject("exit");
							return;
						}

						if (!this._oP13nFilter) {
							//create instance of 'AdaptationFilterBar'
							this._oP13nFilter = new AdaptationFilterBar(this.getId() + "-p13nFilter", {
								adaptationControl: this,
								filterConditions: this.getFilterConditions()
							});

							if (this._registerInnerFilter) {
								this._registerInnerFilter.call(this, this._oP13nFilter);
							}

							this.addDependent(this._oP13nFilter);

							resolve(this._oP13nFilter);
						} else {
							resolve(this._oP13nFilter);
						}
					});
				});
			}
			return this._oInbuiltFilterPromise;
		};

		/**
		 * Triggers a validation of the control by calling <code>validateState</code>, which is implemented in the control delegate.
		 *
		 * @param {Object} oTheoreticalState The theoretical state to be validated; see also {@link sap.ui.mdc.p13n.StateUtil StateUtil}
		 * @param {string} [sKey] The name of the control to be validated
		 *
		 * @returns {object} The value returned by {@link module:sap/ui/mdc/AggregationBaseDelegate.validateState validateState}
		 */
		AdaptationMixin.validateState = function(oTheoreticalState, sKey) {
			if (this.getControlDelegate().validateState instanceof Function) {
				return this.getControlDelegate().validateState(this, oTheoreticalState, sKey);
			}
		};

		AdaptationMixin.getInbuiltFilter = function() {
			return this._oP13nFilter;
		};

		/**
		 * Provides cleanup functionality for possible created adaptation related entities
		 *
		 * @private
		 * @param {function} fnExit Existing exit callback function
		 * @returns {function} Returns a thunk applicable to a control prototype, wrapping an existing exit method
		 */
		AdaptationMixin.exit = function(fnExit) {
			return function() {
				if (this._oP13nFilter) {
					this._oP13nFilter.destroy();
					this._oP13nFilter = null;
				}

				if (this._oInbuiltFilterPromise) {
					this._oInbuiltFilterPromise = null;
				}

				if (fnExit) {
					fnExit.apply(this, arguments);
				}
			};
		};

		// Needed for unit testing as flex is not available
		AdaptationMixin._getWaitForChangesPromise = function() {
			const oEngine = this.getEngine && this.getEngine();
			if (!oEngine) {
				throw "Engine instance not found.";
			}
			return oEngine.waitForChanges(this);
		};

		return function() {
			this.retrieveInbuiltFilter = AdaptationMixin.retrieveInbuiltFilter;
			this.getInbuiltFilter = AdaptationMixin.getInbuiltFilter;
			this.validateState = AdaptationMixin.validateState;
			this._onModifications = AdaptationMixin._onModifications;
			this.awaitPendingModification = AdaptationMixin.awaitPendingModification;
			this._getWaitForChangesPromise = AdaptationMixin._getWaitForChangesPromise;
			this.getEngine = AdaptationMixin.getEngine;
			this.exit = AdaptationMixin.exit(this.exit);
		};
	}
);