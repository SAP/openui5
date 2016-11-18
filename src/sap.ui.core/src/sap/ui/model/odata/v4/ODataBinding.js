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
	 * Checks whether there are pending changes. The function is called in three different
	 * situations:
	 * 1. From the binding itself using _hasPendingChanges(true): Check the cache or the context,
	 *    then ask the children using _hasPendingChanges(false)
	 * 2. From the parent binding using _hasPendingChanges(false): Check the cache, then ask the
	 *    children using _hasPendingChanges(false)
	 * 3. From a child binding (via the context) using _hasPendingChanges(undefined, sPath):
	 *    Check the cache or the context using the (extended) path
	 *
	 * @param {boolean} bAskParent
	 *   If <code>true</code>, ask the parent using the relative path, too; this is only
	 *   relevant if there is no path
	 * @param {string} [sPath]
	 *   The path; if it is defined, only the parent is asked using the relative path
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @private
	 */
	ODataBinding.prototype._hasPendingChanges = function (bAskParent, sPath) {
		var bResult;

		if (sPath !== undefined) {
			// We are asked from a child for a certain path -> only check own cache or context
			if (this.oCache) {
				return this.oCache.hasPendingChanges(sPath);
			}
			if (this.oContext && this.oContext.hasPendingChanges) {
				return this.oContext.hasPendingChanges(_Helper.buildPath(this.sPath, sPath));
			}
			return false;
		}
		if (this.oCache) {
			bResult = this.oCache.hasPendingChanges("");
		} else if (bAskParent && this.oContext && this.oContext.hasPendingChanges) {
			bResult = this.oContext.hasPendingChanges(this.sPath);
		}
		if (bResult) {
			return bResult;
		}
		return this.oModel.getDependentBindings(this).some(function (oDependent) {
			return oDependent._hasPendingChanges(false);
		});
	};

	/**
	 * Resets all pending changes of the binding and possible all dependent bindings. The
	 * function is called in three different situations:
	 * 1. From the binding itself using _resetChanges(true): Reset the cache or the context,
	 *    then the children using _resetChanges(false)
	 * 2. From the parent binding using _resetChanges(false): Reset the cache, then the children
	 *    using _resetChanges(false)
	 * 3. From a child binding (via the context) using _resetChanges(undefined, sPath):
	 *    Reset the cache or the context using the (extended) path
	 *
	 * @param {boolean} bAskParent
	 *   If <code>true</code>, reset in the parent binding using this binding's relative path;
	 *   this is only relevant if there is no path given
	 * @param {string} [sPath]
	 *   The path; if it is defined, only the parent is asked to reset using the relative path
	 *
	 * @private
	 */
	ODataBinding.prototype._resetChanges = function (bAskParent, sPath) {
		if (sPath !== undefined) {
			// We are asked from a child for a certain path -> only reset own cache or context
			if (this.oCache) {
				this.oCache.resetChanges(sPath);
			} else if (this.oContext && this.oContext.resetChanges) {
				this.oContext.resetChanges(_Helper.buildPath(this.sPath, sPath));
			}
			return;
		}
		if (this.oCache) {
			this.oCache.resetChanges("");
		} else if (bAskParent && this.oContext && this.oContext.resetChanges) {
			this.oContext.resetChanges(this.sPath);
		}
		this.oModel.getDependentBindings(this).forEach(function (oDependentBinding) {
			oDependentBinding._resetChanges(false);
		});
	};

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
