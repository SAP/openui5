/*!
 * ${copyright}
 */
sap.ui.define(
	["sap/ui/mdc/util/PromiseCache"],
	(PromiseCache) => {
		"use strict";
		/**
		 * Enhances a given control prototype with a management mechanism for lifecycle related promises.
		 * Calling any of the enhanced methods after control exit will result in a no-op.
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @alias sap.ui.mdc.mixin.PromiseMixin
		 * @namespace
		 * @since 1.85.0
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 *
		 * @borrows sap.ui.mdc.util.PromiseCache.add as addPromise
		 * @borrows sap.ui.mdc.util.PromiseCache.remove as removePromise
		 * @borrows sap.ui.mdc.util.PromiseCache.resolve as resolvePromise
		 * @borrows sap.ui.mdc.util.PromiseCache.reject as rejectPromise
		 * @borrows sap.ui.mdc.util.PromiseCache.retrieve as retrievePromise
		 * @borrows sap.ui.mdc.util.PromiseCache.retrieveMany as retrievePromises
		 */
		const PromiseMixin = {};
		PromiseMixin.addPromise = function(sName, fnCreate) {
			return this.promiseCache.add(sName, fnCreate);
		};
		PromiseMixin.cancelPromise = function(sName, oReason) {
			return this.promiseCache.cancel(sName, oReason);
		};
		PromiseMixin.retrievePromise = function(sName, fnCreate) {
			return this.promiseCache.retrieve(sName, fnCreate);
		};
		PromiseMixin.retrievePromises = function() {
			return this.promiseCache.retrieveMany(...arguments);
		};
		PromiseMixin.removePromise = function(sName) {
			return this.promiseCache.remove(sName);
		};
		PromiseMixin.resolvePromise = function(sName, oValue) {
			return this.promiseCache.resolve(sName, oValue);
		};
		PromiseMixin.rejectPromise = function(sName, oValue) {
			return this.promiseCache.reject(sName, oValue);
		};
		/**
		 * Provides cleanup functionality for the controls promise cache
		 *
		 * @private
		 * @param {function} fnExit Existing exit callback function
		 * @returns {function} Returns a thunk applicable to a control prototype, wrapping an existing exit method
		 */
		PromiseMixin.exit = function(fnExit) {
			return function() {
				if (this.promiseCache) {
					this.promiseCache.destroy();
					this.promiseCache = null;
				}
				if (fnExit) {
					fnExit.apply(this, arguments);
				}
			};
		};
		return function() {
			const _noop = function(fnMethod) {
				return function() {
					if (this.bIsDestroyed) {
						return undefined;
					}
					if (!this.promiseCache) {
						this.promiseCache = new PromiseCache();
					}
					return fnMethod.apply(this, arguments);
				};
			};
			this._addPromise = _noop(PromiseMixin.addPromise);
			this._cancelPromise = _noop(PromiseMixin.cancelPromise);
			this._removePromise = _noop(PromiseMixin.removePromise);
			this._resolvePromise = _noop(PromiseMixin.resolvePromise);
			this._rejectPromise = _noop(PromiseMixin.rejectPromise);
			this._retrievePromise = _noop(PromiseMixin.retrievePromise);
			this._retrievePromises = _noop(PromiseMixin.retrievePromises);
			this.exit = PromiseMixin.exit(this.exit);
		};
	}
);