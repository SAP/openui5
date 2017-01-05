/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.ODataBinding for classes extending sap.ui.model.Binding
sap.ui.define([
	"./lib/_Helper"
], function (_Helper) {
	"use strict";

	/**
	 * A mixin for all OData V4 bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataBinding() {}

	/**
	 * Returns the group ID of the binding that is used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	ODataBinding.prototype.getGroupId = function () {
		return this.sGroupId
			|| (this.bRelative && this.oContext && this.oContext.getGroupId
					&& this.oContext.getGroupId())
			|| this.oModel.getGroupId();
	};

	/**
	 * Returns the group ID of the binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @private
	 */
	ODataBinding.prototype.getUpdateGroupId = function () {
		return this.sUpdateGroupId
			|| (this.bRelative && this.oContext && this.oContext.getUpdateGroupId
					&& this.oContext.getUpdateGroupId())
			|| this.oModel.getUpdateGroupId();
	};

	/**
	 * Returns <code>true</code> if this binding or its dependent bindings have pending changes,
	 * meaning updates that have not yet been successfully sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataBinding.prototype.hasPendingChanges = function () {
		return this.hasPendingChangesForPath("") || this.hasPendingChangesInDependents();
	};

	/**
	 * Checks whether there are pending changes for the given path in the binding's cache (which may
	 * be inherited from the parent).
	 *
	 * @param {string} sPath
	 *   The path
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes for the path
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesForPath = function (sPath) {
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			// No pending changes because create and update are not allowed
			return false;
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			return oCache.hasPendingChangesForPath(sPath);
		}
		if (this.oContext && this.oContext.hasPendingChangesForPath) {
			return this.oContext.hasPendingChangesForPath(_Helper.buildPath(this.sPath, sPath));
		}
		return false;
	};

	/**
	 * Checks whether any of the dependent bindings has pending changes.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesInDependents = function () {
		return this.oModel.getDependentBindings(this).some(function (oDependent) {
			var oCache;

			if (!oDependent.oCachePromise.isFulfilled()) {
				// No pending changes because create and update are not allowed
				return false;
			}

			oCache = oDependent.oCachePromise.getResult();
			return oCache && oCache.hasPendingChangesForPath("")
				|| oDependent.hasPendingChangesInDependents();
		});
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#isInitial
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#isInitial
	ODataBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: isInitial");
	};

	/**
	 * Checks whether the binding can be refreshed. Only bindings which are not relative to a V4
	 * context can be refreshed.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding can be refreshed
	 *
	 * @private
	 */
	ODataBinding.prototype.isRefreshable = function () {
		return !this.bRelative || this.oContext && !this.oContext.getBinding;
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 *
	 * Refresh is supported for bindings which are not relative to a
	 * {@link sap.ui.model.odata.v4.Context}.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request triggered by
	 * the last call determines the binding's data; it is <b>independent</b> of the order of calls
	 * to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given group ID.
	 *
	 * If there are pending changes, an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #refresh}.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the group ID for this binding is
	 *   used.
	 *
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If the given group ID is invalid, the binding has pending changes or refresh on this
	 *   binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @see #hasPendingChanges
	 * @see #resetChanges
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#refresh
	ODataBinding.prototype.refresh = function (sGroupId) {
		if (!this.isRefreshable()) {
			throw new Error("Refresh on this binding is not supported");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot refresh due to pending changes");
		}
		this.oModel.checkGroupId(sGroupId);

		// The actual refresh is specific to the binding and is implemented in each binding class.
		this.refreshInternal(sGroupId);
	};

	/**
	 * Refreshes the binding. The refresh method itself only performs some validation checks and
	 * forwards to this method doing the actual work. Interaction between contexts also runs via
	 * these internal methods.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 * @private
	 */

	/**
	 * Resets all pending changes of this binding, see {@link #hasPendingChanges}.
	 *
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @public
	 * @since 1.40.1
	 */
	ODataBinding.prototype.resetChanges = function () {
		this.resetChangesForPath("");
		this.resetChangesInDependents();
	};

	/**
	 * Resets pending changes for the given path in the binding's cache (which may be inherited from
	 * the parent).
	 *
	 * @param {string} sPath
	 *   The path
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetChangesForPath = function (sPath) {
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			// No pending changes because create and update are not allowed
			return;
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			oCache.resetChangesForPath(sPath);
		} else if (this.oContext && this.oContext.resetChangesForPath) {
			this.oContext.resetChangesForPath(_Helper.buildPath(this.sPath, sPath));
		}
	};

	/**
	 * Resets pending changes in all dependent bindings.
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetChangesInDependents = function () {
		this.oModel.getDependentBindings(this).forEach(function (oDependent) {
			var oCache;

			if (!oDependent.oCachePromise.isFulfilled()) {
				// No pending changes because create and update are not allowed
				return;
			}

			oCache = oDependent.oCachePromise.getResult();
			if (oCache) {
				oCache.resetChangesForPath("");
			}
			oDependent.resetChangesInDependents();
		});
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#resume
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#resume
	ODataBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: resume");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#suspend
	ODataBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: suspend");
	};

	return function (oPrototype) {
		jQuery.extend(oPrototype, ODataBinding.prototype);
	};

}, /* bExport= */ false);
