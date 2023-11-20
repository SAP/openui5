/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v2.Context
sap.ui.define([
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Context",
	"sap/ui/model/_Helper"
], function (SyncPromise, BaseContext, _Helper) {
	"use strict";

	var aDeleteParametersAllowList = ["changeSetId", "groupId", "refreshAfterChange"];

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
	 *   {@link sap.ui.model.odata.v2.ODataListBinding#create}; ignored if the parameter
	 *   <code>oTransientParent</code> is given.
	 *
	 *   When the entity represented by this context has been successfully persisted in the back
	 *   end, the given promise resolves.
	 *
	 *   When the entity is deleted before it has been persisted in the back end via
	 *   {@link sap.ui.model.odata.v2.ODataModel#resetChanges} with the
	 *   <code>bDeleteCreatedEntities</code> parameter set to <code>true</code>, the given promise
	 *   rejects with an object <code>oError</code> containing the error information, where
	 *   <code>oError.aborted === true</code>.
	 * @param {boolean} [bInactive]
	 *   Whether the created context is inactive
	 * @param {boolean} [oTransientParent]
	 *   The transient parent context of this created context for the case of deep-create; if given,
	 *   the created promise of the parent context is also used for this context.
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
			constructor : function (oModel, sPath, sDeepPath, oCreatePromise, bInactive,
					oTransientParent) {
				var that = this;

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
				this.oSyncCreatePromise = oTransientParent
					? oTransientParent.oSyncCreatePromise
					: oCreatePromise;
				// whether the context is updated, e.g. path changed from a preliminary path to the
				// canonical one
				this.bUpdated = false;
				// whether the context is inactive
				this.bInactive = !!bInactive;
				// the function to start activation of this context (which may be prevented by apps)
				this.fnStartActivation = undefined;
				// the promise on activation start of this context
				this.oStartActivationPromise = bInactive
					? new SyncPromise(function (resolve) {
						that.fnStartActivation = resolve;
					})
					: SyncPromise.resolve();
				// the function to activate this context
				this.fnActivate = undefined;
				// the promise on activation of this context
				this.oActivatedPromise = bInactive
					? new SyncPromise(function (resolve) {
						that.fnActivate = resolve;
					})
					: SyncPromise.resolve();
				// for a transient context, maps navigation property name to (array of)
				// sub-context(s) for deep create
				this.mSubContexts = undefined;
				this.oTransientParent = oTransientParent;
			}
		});

	/**
	 * Adds the given transient context as sub-context to this transient context under the given
	 * navigation property.
	 *
	 * @param {string} sNavProperty The name of the navigation property
	 * @param {sap.ui.model.odata.v2.Context} oSubContext The sub-context to be added
	 * @param {boolean} bIsCollection Whether the navigation property is a collection
	 *
	 * @private
	 */
	Context.prototype.addSubContext = function (sNavProperty, oSubContext, bIsCollection) {
		this.mSubContexts = this.mSubContexts || {};
		if (bIsCollection) {
			this.mSubContexts[sNavProperty] = this.mSubContexts[sNavProperty] || [];
			this.mSubContexts[sNavProperty].push(oSubContext);
		} else {
			this.mSubContexts[sNavProperty] = oSubContext;
		}
	};

	/**
	 * Cancels activation of this inactive context. A new activation promise is created.
	 *
	 * @private
	 */
	Context.prototype.cancelActivation = function () {
		var that = this;

		this.oStartActivationPromise = new SyncPromise(function (resolve) {
			that.fnStartActivation = resolve;
		});
	};

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
	 * If the context has been created via {@link sap.ui.model.odata.v2.ODataModel#createEntry} and
	 * the entity for this context has been stored in the back end, {@link #created} returns
	 * <code>undefined</code>.
	 *
	 * @returns {Promise<any|undefined>|undefined}
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
	 * Deletes the OData entity this context points to. Persisted contexts are only removed from the UI after their
	 * successful deletion in the back end. In this case, the <code>Promise</code> returned by this method is only
	 * resolved when the back-end request has been successful.
	 * <b>Example:</b> A persisted entry in a table control is deleted by this method. It remains visible on the UI and
	 * only disappears upon successful deletion in the back end.
	 * <b>Note:</b> The context must not be used anymore after successful deletion.
	 *
	 * @param {object} [mParameters]
	 *   For a persistent context, a map of parameters as specified for
	 *   {@link sap.ui.model.odata.v2.ODataModel#remove}, except that the <code>groupId</code> and
	 *   <code>changeSetId</code> parameters default to the values set via
	 *   {@link sap.ui.model.odata.v2.ODataModel#setChangeGroups} for the type of the entity to be
	 *   deleted.
	 * @param {string} [mParameters.groupId]
	 *   ID of a request group; requests belonging to the same group will be bundled in one batch
	 *   request. If not provided, the <code>groupId</code> defined for the type of the entity to be
	 *   deleted is used.
	 * @param {string} [mParameters.changeSetId]
	 *   ID of the <code>ChangeSet</code> that this request should belong to. If not provided, the
	 *   <code>changeSetId</code> defined for the type of the entity to be deleted is used.
	 * @param {boolean} [mParameters.refreshAfterChange]
	 *   Defines whether to update all bindings after submitting this change operation,
	 *   see {@link #setRefreshAfterChange}. If given, this overrules the model-wide
	 *   <code>refreshAfterChange</code> flag for this operation only.
	 * @returns {Promise<undefined>} A promise resolving with <code>undefined</code> in case of
	 *   successful deletion or rejecting with an error in case the deletion failed. If the <code>DELETE</code> request
	 *   has been aborted, the error has an <code>aborted</code> flag set to <code>true</code>.
	 * @throws {Error}
	 *   If the given parameter map contains any other parameter than those documented above in case
	 *   of a persistent context
	 *
	 * @public
	 * @since 1.101
	 */
	Context.prototype.delete = function (mParameters) {
		var sParameterKey,
			oModel = this.getModel(),
			that = this;

		mParameters = mParameters || {};
		for (sParameterKey in mParameters) {
			if (!aDeleteParametersAllowList.includes(sParameterKey)) {
				throw new Error("Parameter '" + sParameterKey + "' is not supported");
			}
		}

		if (this.isInactive()) {
			oModel._discardEntityChanges(oModel._getKey(this), true);
			oModel.checkUpdate();

			return Promise.resolve();
		} else if (this.isTransient()) {
			return oModel.resetChanges([this.getPath()], /*bAll=abort deferred requests*/false,
				/*bDeleteCreatedEntities*/true);
		}

		return new Promise(function (resolve, reject) {
			var oGroupInfo = oModel._resolveGroup(that.getPath());

			oModel.remove("",
				_Helper.merge({
					changeSetId : oGroupInfo.changeSetId,
					context : that,
					error : reject,
					groupId : oGroupInfo.groupId,
					success : function () {
						resolve();
					}
				}, mParameters));
		});
	};

	/**
	 * Returns the promise which resolves with <code>undefined</code> on activation of this context
	 * or if this context is already active; the promise never rejects.
	 *
	 * @returns {sap.ui.base.SyncPromise} The promise on activation of this context
	 *
	 * @private
	 */
	Context.prototype.fetchActivated = function () {
		return this.oActivatedPromise;
	};

	/**
	 * Returns the promise which resolves with <code>undefined</code> when activation of this context is started
	 * or if this context is already active; the promise never rejects.
	 *
	 * @returns {sap.ui.base.SyncPromise} The promise on activation start of this context
	 *
	 * @private
	 */
	Context.prototype.fetchActivationStarted = function () {
		return this.oStartActivationPromise;
	};

	/**
	 * Finishes activation of this context.
	 *
	 * @private
	 */
	Context.prototype.finishActivation = function () {
		this.bInactive = false;
		if (this.fnActivate) {
			this.fnActivate();
		}
	};

	/**
	 * Gets the absolute deep path including all intermediate paths of the binding hierarchy. This
	 * path is used to compute the full target of messages.
	 *
	 * @returns {string} The deep path
	 * @private
	 */
	Context.prototype.getDeepPath = function () {
		return this.sDeepPath;
	};

	/**
	 * Gets the map of sub-contexts for a deep create.
	 *
	 * @returns {Object<string,sap.ui.model.odata.v2.Context|sap.ui.model.odata.v2.Context[]>}
	 *   The map of sub-contexts
	 *
	 * @private
	 */
	Context.prototype.getSubContexts = function () {
		return this.mSubContexts;
	};

	/**
	 * Gets a flat array of the sub-contexts map for a deep create.
	 *
	 * @param {boolean} [bRecursive] Whether to recursively collect all deep sub-contexts
	 * @returns {sap.ui.model.odata.v2.Context[]} The array of sub-contexts
	 *
	 * @private
	 */
	Context.prototype.getSubContextsArray = function (bRecursive) {
		var sNavProperty, vSubContexts,
			aSubContexts = [];

		function collectContexts(oSubContext) {
			aSubContexts.push(oSubContext);
			if (bRecursive) {
				aSubContexts = aSubContexts.concat(oSubContext.getSubContextsArray(bRecursive));
			}
		}

		for (sNavProperty in this.mSubContexts) {
			vSubContexts = this.mSubContexts[sNavProperty];
			if (Array.isArray(vSubContexts)) {
				vSubContexts.forEach(collectContexts);
			} else {
				collectContexts(vSubContexts);
			}
		}

		return aSubContexts;
	};

	/**
	 * Gets an array of keys to the sub-contexts for a deep create.
	 *
	 * @param {boolean} [bRecursive] Whether to recursively collect all deep sub-context keys
	 * @returns {string[]} The array of sub-context keys
	 *
	 * @private
	 */
	Context.prototype.getSubContextsAsKey = function (bRecursive) {
		return this.getSubContextsArray(bRecursive).map(function (oContext) {
			return oContext.getPath().slice(1);
		});
	};

	/**
	 * Gets an array of paths to the sub-contexts for a deep create.
	 *
	 * @param {boolean} [bRecursive] Whether to recursively collect all deep sub-context paths
	 * @returns {string[]} The array of sub-context paths
	 *
	 * @private
	 */
	Context.prototype.getSubContextsAsPath = function (bRecursive) {
		return this.getSubContextsArray(bRecursive).map(function (oContext) {
			return oContext.getPath();
		});
	};

	/**
	 * Whether this context has changed, which means it has been updated or a refresh of dependent
	 * bindings needs to be enforced.
	 *
	 * @returns {boolean} Whether this context has changed
	 * @private
	 * @see sap.ui.model.odata.v2.Context#isUpdated
	 * @see sap.ui.model.odata.v2.Context#isRefreshForced
	 */
	Context.prototype.hasChanged = function () {
		return this.bUpdated || this.bForceRefresh;
	};

	/**
	 * Returns whether this context has at least one sub-context.
	 *
	 * @returns {boolean} Whether this context has at least one sub-context
	 *
	 * @private
	 */
	Context.prototype.hasSubContexts = function () {
		return !!this.mSubContexts;
	};

	/**
	 * Returns whether this context has a transient parent context.
	 *
	 * @returns {boolean} Whether this context has a transient parent context
	 *
	 * @private
	 */
	Context.prototype.hasTransientParent = function () {
		return !!this.oTransientParent;
	};

	/**
	 * Returns whether this context is inactive. An inactive context will not be sent to the
	 * server until it is activated. From then on it behaves like any other created context.
	 * The result of this function can also be accessed via the "@$ui5.context.isInactive" instance
	 * annotation at the entity, see {@link sap.ui.model.odata.v2.ODataModel#getProperty} for details.
	 *
	 * @returns {boolean} Whether this context is inactive
	 *
	 * @public
	 * @see sap.ui.model.odata.v2.ODataListBinding#create
	 * @see sap.ui.model.odata.v2.ODataModel#createEntry
	 * @since 1.98.0
	 */
	Context.prototype.isInactive = function () {
		return this.bInactive;
	};

	/**
	 * Whether this context's path may be used to create the request URL for dependent bindings even
	 * if no data has been loaded for the context's entity. This can be used by dependent bindings
	 * to send their requests in parallel to the request of the context binding.
	 *
	 * @returns {boolean} Whether this context is preliminary
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
	 * @returns {boolean} Whether dependent bindings need to be refreshed
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
	 * the back end. The result of this function can also be accessed via the
	 * "@$ui5.context.isTransient" instance annotation at the entity, see
	 * {@link sap.ui.model.odata.v2.ODataModel#getProperty} for details.
	 *
	 * @returns {boolean|undefined}
	 *   <ul>
	 *   <li><code>true</code>: if the context has been created via
	 *     {@link sap.ui.model.odata.v2.ODataModel#createEntry} or
	 *     {@link sap.ui.model.odata.v2.ODataListBinding#create} and is not yet persisted in the
	 *     back end,</li>
	 *   <li><code>false</code>: if the context has been created via
	 *     {@link sap.ui.model.odata.v2.ODataListBinding#create}, data has been successfully
	 *     persisted in the back end and the data is still displayed in the area of the inline
	 *     creation rows, and</li>
	 *   <li><code>undefined</code>: otherwise</li>
	 *   </ul>
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
	 * @returns {boolean} Whether the context is updated
	 * @private
	 */
	Context.prototype.isUpdated = function () {
		return this.bUpdated;
	};

	/**
	 * Removes this context from its transient parent.
	 *
	 * @private
	 */
	Context.prototype.removeFromTransientParent = function () {
		if (this.oTransientParent) {
			this.oTransientParent.removeSubContext(this);
			delete this.oTransientParent;
		}
	};

	/**
	 * Removes the given sub-context from this context.
	 *
	 * @param {sap.ui.model.odata.v2.Context} oSubContext The context to remove
	 *
	 * @private
	 */
	Context.prototype.removeSubContext = function (oSubContext) {
		var iIndex, sNavProperty, vSubContexts;

		for (sNavProperty in this.mSubContexts) {
			vSubContexts = this.mSubContexts[sNavProperty];
			if (Array.isArray(vSubContexts)) {
				iIndex = vSubContexts.indexOf(oSubContext);
				if (iIndex > -1) {
					vSubContexts.splice(iIndex, 1);
				}
				if (!vSubContexts.length) {
					delete this.mSubContexts[sNavProperty];
				}
			} else if (vSubContexts === oSubContext) {
				delete this.mSubContexts[sNavProperty];
			}
		}
		if (this.mSubContexts && !Object.keys(this.mSubContexts).length) {
			this.mSubContexts = undefined;
		}
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

	/**
	 * Starts activation of this inactive context. The promise returned by {@link #fetchActivationStarted}
	 * is resolved.
	 *
	 * @private
	 */
	Context.prototype.startActivation = function () {
		if (this.fnStartActivation) {
			this.fnStartActivation();
		}
	};

	return Context;
});