/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v2.Context
sap.ui.define([
	"sap/ui/model/Context"
], function (BaseContext) {
	"use strict";

	/**
	 * Do <strong>NOT</strong> call this private constructor.
	 *
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel
	 *   The OData V2 model
	 * @param {string} sPath
	 *   An absolute path without trailing slash, for example "/Products(1)/ToSupplier"
	 * @param {string} [sDeepPath=sPath]
	 *   The absolute deep path including all intermediate paths of the binding hierarchy
	 * @param {sap.ui.base.SyncPromise} [oCreatePromise]
	 *   A sync promise that is given when this context has been created by
	 *   {@link sap.ui.model.odata.v2.ODataModel#createEntry} or
	 *   {@link sap.ui.model.odata.v2.ODataListBinding#create}.
	 *
	 *   When the entity represented by this context has been successfully persisted in the back
	 *   end, the given promise resolves.
	 *
	 *   When the entity is deleted before it has been persisted in the back end via
	 *   {@link sap.ui.model.odata.v2.ODataModel#resetChanges} with the
	 *   <code>bDeleteCreatedEntities</code> parameter set to <code>true</code>, the given promise
	 *   rejects with an object <code>oError</code> containing the error information, where
	 *   <code>oError.aborted === true</code>.
	 * @alias sap.ui.model.odata.v2.Context
	 * @author SAP SE
	 * @class Implementation of an OData V2 model's context.
	 *
	 *   The context is a pointer to model data. A context for a context binding points to the
	 *   complete query result. A context for a list binding points to one specific entry in the
	 *   binding's collection.
	 *
	 *   A context for the OData V2 model cannot be created at will, it has to be retrieved via:
	 *   <ul>
	 *     <li>an OData binding</li>
	 *     <li>a view element</li>
	 *     <li>{@link sap.ui.model.odata.v2.ODataListBinding#create}</li>
	 *     <li>{@link sap.ui.model.odata.v2.ODataModel#callFunction}</li>
	 *     <li>{@link sap.ui.model.odata.v2.ODataModel#createBindingContext}</li>
	 *     <li>{@link sap.ui.model.odata.v2.ODataModel#createEntry}</li>
	 *   </ul>
	 *
	 * @extends sap.ui.model.Context
	 * @hideconstructor
	 * @public
	 * @since 1.93.0
	 * @version ${version}
	 */
	var Context = BaseContext.extend("sap.ui.model.odata.v2.Context", {
			constructor : function (oModel, sPath, sDeepPath, oCreatePromise) {
				BaseContext.call(this, oModel, sPath);
				// Promise returned by #created for a context of a newly created entity which
				// resolves when the entity is persisted or rejects if the creation is aborted; set
				// it lazily to avoid "Uncaught (in promise)" errors
				this.oCreatePromise = undefined;
				// the absolute path including all intermediate paths of the binding hierarchy;
				// used to compute the full target of messages
				this.sDeepPath = sDeepPath || sPath;
				// whether dependent bindings need to be refreshed
				this.bForceRefresh = false;
				// whether this context's path may be used to create the request URL for dependent
				// bindings even if no data has been loaded for the context's entity
				this.bPreliminary = false;
				// SyncPromise for a context created via
				// sap.ui.model.odata.v2.ODataModel#createEntry; used internally to detect
				// synchronously whether the promise is already fulfilled
				this.oSyncCreatePromise = oCreatePromise;
				// whether the context is updated, e.g. path changed from a preliminary path to the
				// canonical one
				this.bUpdated = false;
			}
		});

	/**
	 * Returns a promise on the creation state of this context if it has been created via
	 * {@link sap.ui.model.odata.v2.ODataModel#createEntry} or
	 * {@link sap.ui.model.odata.v2.ODataListBinding#create}; otherwise returns
	 * <code>undefined</code>.
	 *
	 * As long as the promise is not yet resolved or rejected, the entity represented by this
	 * context is transient.
	 *
	 * Once the promise is resolved, the entity for this context is stored in the back end and
	 * {@link #getPath} returns a path including the key predicate of the new entity.
	 *
	 * If the context has been created via {@link sap.ui.model.odata.v2.ODataListBinding#create} and
	 * the entity for this context has been stored in the back end, {@link #created} returns
	 * <code>undefined</code> after the data has been re-read from the back end and inserted at the
	 * right position based on the list binding's filters and sorters.
	 *
	 * @returns {Promise}
	 *   A promise for a context which has been created via
	 *   {@link sap.ui.model.odata.v2.ODataModel#createEntry} or
	 *   {@link sap.ui.model.odata.v2.ODataListBinding#create}, otherwise <code>undefined</code>.
	 *
	 *   When the entity represented by this context has been persisted in the back end, the promise
	 *   resolves without data.
	 *
	 *   When the entity is deleted before it has been persisted in the back end via
	 *   {@link sap.ui.model.odata.v2.ODataModel#resetChanges} with the
	 *   <code>bDeleteCreatedEntities</code> parameter set to <code>true</code>, the promise rejects
	 *   with an object <code>oError</code> containing the error information, where
	 *   <code>oError.aborted === true</code>.
	 *
	 * @public
	 * @since 1.96.0
	 */
	Context.prototype.created = function () {
		if (this.oSyncCreatePromise && !this.oCreatePromise) {
			// ensure to return a promise that is resolved w/o data
			this.oCreatePromise = Promise.resolve(this.oSyncCreatePromise).then(function () {});
		}

		return this.oCreatePromise;
	};

	/**
	 * Gets the absolute deep path including all intermediate paths of the binding hierarchy. This
	 * path is used to compute the full target of messages.
	 *
	 * @return {string} The deep path
	 * @private
	 */
	Context.prototype.getDeepPath = function () {
		return this.sDeepPath;
	};

	/**
	 * Whether this context has changed, which means it has been updated or a refresh of dependent
	 * bindings needs to be enforced.
	 *
	 * @return {boolean} Whether this context has changed
	 * @private
	 * @see sap.ui.model.odata.v2.Context#isUpdated
	 * @see sap.ui.model.odata.v2.Context#isRefreshForced
	 */
	Context.prototype.hasChanged = function () {
		return this.bUpdated || this.bForceRefresh;
	};

	/**
	 * Whether this context's path may be used to create the request URL for dependent bindings even
	 * if no data has been loaded for the context's entity. This can be used by dependent bindings
	 * to send their requests in parallel to the request of the context binding.
	 *
	 * @return {boolean} Whether this context is preliminary
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 */
	Context.prototype.isPreliminary = function () {
		return this.bPreliminary;
	};

	/**
	 * Whether dependent bindings of this context need to be refreshed, when the context is
	 * propagated.
	 *
	 * @return {boolean} Whether dependent bindings need to be refreshed
	 * @private
	 */
	Context.prototype.isRefreshForced = function () {
		return this.bForceRefresh;
	};

	/**
	 * For a context created using {@link sap.ui.model.odata.v2.ODataModel#createEntry} or
	 * {@link sap.ui.model.odata.v2.ODataListBinding#create}, the method returns <code>true</code>
	 * if the context is transient or <code>false</code> if the context is not transient. A
	 * transient context represents an entity created on the client which has not been persisted in
	 * the back end.
	 *
	 * @returns {boolean}
	 *   Whether this context is transient if it has been created using
	 *   {@link sap.ui.model.odata.v2.ODataModel#createEntry} or
	 *   {@link sap.ui.model.odata.v2.ODataListBinding#create}; returns <code>undefined</code>
	 *   otherwise
	 *
	 * @public
	 * @since 1.94.0
	 */
	Context.prototype.isTransient = function () {
		return this.oSyncCreatePromise && this.oSyncCreatePromise.isPending();
	};

	/**
	 * Whether this context was updated. For example the path changed from a preliminary path to the
	 * canonical one.
	 *
	 * @return {boolean} Whether the context is updated
	 * @private
	 */
	Context.prototype.isUpdated = function () {
		return this.bUpdated;
	};

	/**
	 * Resets the created promise to indicate that the entity has been re-read from the back end.
	 *
	 * @private
	 */
	Context.prototype.resetCreatedPromise = function () {
		this.oCreatePromise = undefined;
		this.oSyncCreatePromise = undefined;
	};

	/**
	 * Sets the absolute deep path; see {@link #getDeepPath} for details.
	 *
	 * @param {string} sDeepPath The absolute deep path
	 * @private
	 */
	Context.prototype.setDeepPath = function (sDeepPath) {
		this.sDeepPath = sDeepPath;
	};

	/**
	 * Sets whether dependent bindings need to be refreshed; see {@link #isRefreshForced} for
	 * details.
	 *
	 * @param {boolean} bForceRefresh Whether dependent bindings need to be refreshed
	 * @private
	 */
	Context.prototype.setForceRefresh = function (bForceRefresh) {
		this.bForceRefresh = bForceRefresh;
	};

	/**
	 * Sets whether this context is preliminary; see {@link #isPreliminary} for details.
	 *
	 * @param {boolean} bPreliminary Whether this context is preliminary
	 * @private
	 */
	Context.prototype.setPreliminary = function (bPreliminary) {
		this.bPreliminary = bPreliminary;
	};

	/**
	 * Sets whether this context was updated; see {@link #isUpdated} for details.
	 *
	 * @param {boolean} bUpdated Whether this context is updated
	 * @private
	 */
	Context.prototype.setUpdated = function (bUpdated) {
		this.bUpdated = bUpdated;
	};

	return Context;
}, /* bExport= */ false);