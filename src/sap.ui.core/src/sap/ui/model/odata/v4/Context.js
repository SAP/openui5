/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.Context
sap.ui.define([
	"./lib/_Helper",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Context"
], function (_Helper, Log, SyncPromise, BaseContext) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.Context",
		// generation counter to distinguish old from new
		iGenerationCounter = 0,
		oModule,
		// index of virtual context used for auto-$expand/$select
		iVIRTUAL = -9007199254740991/*Number.MIN_SAFE_INTEGER*/,
		/**
		 * @alias sap.ui.model.odata.v4.Context
		 * @author SAP SE
		 * @class Implementation of an OData V4 model's context.
		 *
		 *   The context is a pointer to model data as returned by a query from a
		 *   {@link sap.ui.model.odata.v4.ODataContextBinding} or a
		 *   {@link sap.ui.model.odata.v4.ODataListBinding}. Contexts are always and only
		 *   created by such bindings. A context for a context binding points to the complete query
		 *   result. A context for a list binding points to one specific entry in the binding's
		 *   collection. A property binding does not have a context, you can access its value via
		 *   {@link sap.ui.model.odata.v4.ODataPropertyBinding#getValue}.
		 *
		 *   Applications can access model data only via a context, either synchronously with the
		 *   risk that the values are not available yet ({@link #getProperty} and
		 *   {@link #getObject}) or asynchronously ({@link #requestProperty} and
		 *   {@link #requestObject}).
		 *
		 *   Context instances are immutable except for their indexes.
		 * @extends sap.ui.model.Context
		 * @hideconstructor
		 * @public
		 * @since 1.39.0
		 * @version ${version}
		 */
		Context = BaseContext.extend("sap.ui.model.odata.v4.Context", {
				constructor : constructor
			});

	/*
	 * Fetches and formats the primitive value at the given path.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext The context
	 * @param {string} sPath The requested path, absolute or relative to this context
	 * @param {boolean} [bExternalFormat]
	 *   If <code>true</code>, the value is returned in external format using a UI5 type for the
	 *   given property path that formats corresponding to the property's EDM type and constraints.
	 * @param {boolean} [bCached]
	 *   Whether to return cached values only and not trigger a request
	 * @returns {sap.ui.base.SyncPromise} a promise on the formatted value
	 */
	function fetchPrimitiveValue(oContext, sPath, bExternalFormat, bCached) {
		var oError,
			aPromises = [oContext.fetchValue(sPath, null, bCached)],
			sResolvedPath = oContext.oModel.resolve(sPath, oContext);

		if (bExternalFormat) {
			aPromises.push(
				oContext.oModel.getMetaModel().fetchUI5Type(sResolvedPath));
		}
		return SyncPromise.all(aPromises).then(function (aResults) {
			var oType = aResults[1],
				vValue = aResults[0];

			if (vValue && typeof vValue === "object") {
				oError = new Error("Accessed value is not primitive: " + sResolvedPath);
				oError.isNotPrimitive = true;
				throw oError;
			}
			return bExternalFormat ? oType.formatValue(vValue, "string") : vValue;
		});
	}

	//*********************************************************************************************
	// Context
	//*********************************************************************************************

	/**
	 * Do <strong>NOT</strong> call this private constructor. In the OData V4 model you cannot
	 * create contexts at will: retrieve them from a binding or a view element instead.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The model
	 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding} oBinding
	 *   A binding that belongs to the model
	 * @param {string} sPath
	 *   An absolute path without trailing slash
	 * @param {number} [iIndex]
	 *   Index of item (within the collection addressed by <code>sPath</code>) represented
	 *   by this context; used by list bindings, not context bindings
	 * @param {sap.ui.base.SyncPromise} [oCreatePromise]
	 *   A promise which is resolved with the created entity when the POST request has been
	 *   successfully sent and the entity has been marked as non-transient; used as base for
	 *   {@link #created}
	 * @param {number} [iGeneration=0]
	 *   The unique number for this context's generation, which can be retrieved via
	 *   {@link #getGeneration}
	 * @param {boolean} [bInactive]
	 *   Whether this context is inactive and will only be sent to the server after the first
	 *   property update
	 * @throws {Error}
	 *   If an invalid path is given
	 */
	function constructor(oModel, oBinding, sPath, iIndex, oCreatePromise, iGeneration,
			bInactive) {
		if (sPath[0] !== "/") {
			throw new Error("Not an absolute path: " + sPath);
		}
		if (sPath.endsWith("/")) {
			throw new Error("Unsupported trailing slash: " + sPath);
		}
		BaseContext.call(this, oModel, sPath);
		this.oBinding = oBinding;
		this.oCreatedPromise = oCreatePromise
			// ensure to return a promise that is resolved w/o data
			&& Promise.resolve(oCreatePromise).then(function () {});
		this.oSyncCreatePromise = oCreatePromise;
		this.iGeneration = iGeneration || 0;
		this.bInactive = bInactive || undefined; // be in sync with the annotation
		this.iIndex = iIndex;
		this.bKeepAlive = false;
		this.fnOnBeforeDestroy = undefined;
	}

	/**
	 * Deletes the OData entity this context points to.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the DELETE request; w/o a lock, no DELETE is sent.
	 *   For a transient entity, the lock is ignored (use NULL)!
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding. W/o a lock, this is ignored.
	 * @param {boolean} [bDoNotRequestCount]
	 *   Whether not to request the new count from the server; useful in case of
	 *   {@link #replaceWith} where it is known that the count remains unchanged; w/o a lock this
	 *   should be true
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error}
	 *   If the cache promise for this binding is not yet fulfilled, or if the cache is shared
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.Context#delete
	 */
	Context.prototype._delete = function (oGroupLock, oETagEntity, bDoNotRequestCount) {
		var that = this;

		if (!oGroupLock) {
			return this.oBinding._delete(null, "n/a", this, null, true);
		}
		return this.fetchCanonicalPath().then(function (sCanonicalPath) {
			return that.oBinding._delete(oGroupLock, sCanonicalPath.slice(1), that, oETagEntity,
				bDoNotRequestCount);
		});
	};

	/**
	 * Adjusts this context's path by replacing the given transient predicate with the given
	 * predicate. Recursively adjusts all child bindings.
	 *
	 * @param {string} sTransientPredicate
	 *   The transient predicate to be replaced
	 * @param {string} sPredicate
	 *   The new predicate
	 * @param {function} [fnPathChanged]
	 *   A function called with the old and the new path
	 *
	 * @private
	 */
	Context.prototype.adjustPredicate = function (sTransientPredicate, sPredicate, fnPathChanged) {
		var sTransientPath = this.sPath;

		this.sPath = sTransientPath.replace(sTransientPredicate, sPredicate);
		if (fnPathChanged) {
			fnPathChanged(sTransientPath, this.sPath);
		}
		this.oModel.getDependentBindings(this).forEach(function (oDependentBinding) {
			oDependentBinding.adjustPredicate(sTransientPredicate, sPredicate);
		});
	};

	/**
	 * Updates all dependent bindings of this context.
	 *
	 * @private
	 */
	Context.prototype.checkUpdate = function () {
		this.oModel.getDependentBindings(this).forEach(function (oDependentBinding) {
			oDependentBinding.checkUpdate();
		});
	};

	/**
	 * Updates all dependent bindings of this context.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the update is finished
	 * @private
	 */
	Context.prototype.checkUpdateInternal = function () {
		return SyncPromise.all(
			this.oModel.getDependentBindings(this).map(function (oDependentBinding) {
				return oDependentBinding.checkUpdateInternal();
			})
		);
	};

	/**
	 * Collapses the group node that this context points to.
	 *
	 * @throws {Error}
	 *   If the context points to a node that is not expandable, already collapsed, or
	 *   is a grand total.
	 *
	 * @public
	 * @see #expand
	 * @see #isExpanded
	 * @since 1.83.0
	 */
	Context.prototype.collapse = function () {
		switch (this.getProperty("@$ui5.node.level") === 0 ? undefined : this.isExpanded()) {
			case true:
				this.oBinding.collapse(this);
				break;
			case false:
				throw new Error("Already collapsed: " + this);
			default:
				throw new Error("Not expandable: " + this);
		}
	};

	/**
	 * Returns a promise that is resolved without data when the entity represented by this context
	 * has been created in the back end and all selected properties of this entity are available.
	 * Expanded navigation properties are only available if the context's binding is refreshable.
	 * {@link sap.ui.model.odata.v4.ODataContextBinding#refresh} and
	 * {@link sap.ui.model.odata.v4.ODataListBinding#refresh} describe which bindings are
	 * refreshable.
	 *
	 * As long as the promise is not yet resolved or rejected, the entity represented by this
	 * context is transient.
	 *
	 * Once the promise is resolved, {@link #getPath} returns a path including the key predicate
	 * of the new entity. This requires that all key properties are available.
	 *
	 * @returns {Promise}
	 *   A promise that is resolved without data when the entity represented by this context has
	 *   been created in the back end. It is rejected with an <code>Error</code> instance where
	 *   <code>oError.canceled === true</code> if the transient entity is deleted before it is
	 *   created in the back end, for example via {@link sap.ui.model.odata.v4.Context#delete},
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#resetChanges} or
	 *   {@link sap.ui.model.odata.v4.ODataModel#resetChanges}. It is rejected with an
	 *   <code>Error</code> instance without <code>oError.canceled</code> if loading of $metadata
	 *   fails. Returns <code>undefined</code> if the context has not been created using
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#create}.
	 *
	 * @public
	 * @since 1.43.0
	 */
	Context.prototype.created = function () {
		return this.oCreatedPromise;
	};

	/**
	 * Deletes the OData entity this context points to.
	 *
	 * The context must not be used anymore after successful deletion.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the DELETE request; if not specified, the update group ID for
	 *   the context's binding is used, see {@link #getUpdateGroupId}; the resulting group ID must
	 *   not have {@link sap.ui.model.odata.v4.SubmitMode.API}. Since 1.81, if this context is
	 *   transient (see {@link #isTransient}), no group ID needs to be specified. Since 1.98.0, you
	 *   can use <code>null</code> to prevent the DELETE request in case of a kept-alive context
	 *   that is not in the collection and of which you know that it does not exist on the server
	 *   anymore (for example, a draft after activation).
	 * @param {boolean} [bDoNotRequestCount]
	 *   Whether not to request the new count from the server; useful in case of
	 *   {@link #replaceWith} where it is known that the count remains unchanged (since 1.97.0).
	 *   Since 1.98.0, this is implied if a <code>null</code> group ID is used.
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure, e.g. if the given context does not point
	 *   to an entity, if it is not part of a list binding, if there are pending changes for the
	 *   context's binding, if the resulting group ID has SubmitMode.API, or if the deletion on the
	 *   server fails.
	 *   <p>
	 *   The error instance is flagged with <code>isConcurrentModification</code> in case a
	 *   concurrent modification (e.g. by another user) of the entity between loading and deletion
	 *   has been detected; this should be shown to the user who needs to decide whether to try
	 *   deletion again. If the entity does not exist, we assume it has already been deleted by
	 *   someone else and report success.
	 * @throws {Error} If the given group ID is invalid, if this context's root binding is
	 *   suspended, or if this context is not transient (see {@link #isTransient}) and has pending
	 *   changes (see {@link #hasPendingChanges}), or if a <code>null</code> group ID is used with
	 *   a context which is not kept-alive (see {@link #isKeepAlive}) or is still in the collection
	 *   (has an index, see {@link #getIndex})
	 *
	 * @function
	 * @public
	 * @since 1.41.0
	 */
	Context.prototype.delete = function (sGroupId, bDoNotRequestCount/*, bRejectIfNotFound*/) {
		var oGroupLock = null,
			oModel = this.oModel,
			that = this;

		this.oBinding.checkSuspended();
		if (this.isTransient()) {
			sGroupId = null;
		} else if (this.hasPendingChanges()) {
			throw new Error("Cannot delete due to pending changes");
		} else if (sGroupId === null) {
			if (!(this.bKeepAlive && this.iIndex === undefined)) {
				throw new Error("Cannot delete " + this);
			}
		}
		if (sGroupId === null) {
			bDoNotRequestCount = true;
		} else {
			oModel.checkGroupId(sGroupId);
			oGroupLock = this.oBinding.lockGroup(sGroupId, true, true);
			sGroupId = oGroupLock.getGroupId();
			if (this.oModel.isApiGroup(sGroupId)) {
				throw new Error("Illegal update group ID: " + sGroupId);
			}
		}

		return this._delete(oGroupLock, /*oETagEntity*/null, bDoNotRequestCount).then(function () {
			var sResourcePathPrefix = that.sPath.slice(1);

			// Messages have been updated via _Cache#_delete; "that" is already destroyed; remove
			// all dependent caches in all bindings
			oModel.getAllBindings().forEach(function (oBinding) {
				oBinding.removeCachesAndMessages(sResourcePathPrefix, true);
			});
		}).catch(function (oError) {
			if (oGroupLock) {
				oGroupLock.unlock(true);
			}
			oModel.reportError("Failed to delete " + that, sClassName, oError);
			throw oError;
		});
	};

	/**
	 * Destroys this context, that is, it removes this context from all dependent bindings and drops
	 * references to binding and model, so that the context cannot be used anymore; it keeps path
	 * and index for debugging purposes.
	 *
	 * @public
	 * @see sap.ui.base.Object#destroy
	 * @since 1.41.0
	 */
	// @override sap.ui.base.Object#destroy
	Context.prototype.destroy = function () {
		var fnOnBeforeDestroy = this.fnOnBeforeDestroy;

		if (fnOnBeforeDestroy) {
			// avoid second call through a destroy inside the callback
			this.fnOnBeforeDestroy = undefined;
			fnOnBeforeDestroy();
		}
		this.oModel.getDependentBindings(this).forEach(function (oDependentBinding) {
			oDependentBinding.setContext(undefined);
		});
		this.oBinding = undefined;
		this.oCreatedPromise = undefined;
		this.oSyncCreatePromise = undefined;
		this.bInactive = undefined;
		this.bKeepAlive = undefined;
		// When removing oModel, ManagedObject#getBindingContext does not return the destroyed
		// context although the control still refers to it
		this.oModel = undefined;
		BaseContext.prototype.destroy.call(this);
	};

	/**
	 * Sets the new current value and updates the cache.
	 *
	 * @param {string} sPath
	 *   A path relative to this context
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the PATCH request; without a lock, no PATCH is sent
	 * @param {boolean} [bSkipRetry]
	 *   Whether to skip retries of failed PATCH requests and instead fail accordingly, but still
	 *   fire "patchSent" and "patchCompleted" events
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure, for example if the annotation belongs to
	 *   the read-only namespace "@$ui5.*"
	 *
	 * @private
	 */
	Context.prototype.doSetProperty = function (sPath, vValue, oGroupLock, bSkipRetry) {
		var oMetaModel = this.oModel.getMetaModel(),
			oPromise,
			oValue,
			that = this;

		if (oGroupLock && this.isTransient() && !this.isInactive()) {
			oValue = this.getValue();
			oPromise = oValue && _Helper.getPrivateAnnotation(oValue, "transient");
			if (oPromise instanceof Promise) {
				oGroupLock.unlock();
				oGroupLock = oGroupLock.getUnlockedCopy();
				this.doSetProperty(sPath, vValue, null, true) // early UI update
					.catch(this.oModel.getReporter());

				return oPromise.then(function (bSuccess) {
					// in case of success, wait until creation is completed because context path's
					// key predicate is adjusted
					return bSuccess && that.created();
				}).then(function () {
					return that.doSetProperty(sPath, vValue, oGroupLock, bSkipRetry);
				});
			}
		}
		if (this.oModel.bAutoExpandSelect) {
			sPath = oMetaModel.getReducedPath(
				this.oModel.resolve(sPath, this),
				this.oBinding.getBaseForPathReduction());
		}
		return this.withCache(function (oCache, sCachePath, oBinding) {
			return oBinding.doSetProperty(sCachePath, vValue, oGroupLock)
				|| oMetaModel.fetchUpdateData(sPath, that, !oGroupLock).then(function (oResult) {
					var sEntityPath = _Helper.getRelativePath(oResult.entityPath,
							oBinding.oReturnValueContext
								? oBinding.oReturnValueContext.getPath()
								: oBinding.getResolvedPath()),
						// If a PATCH is merged into a POST request, firePatchSent is not called,
						// thus don't call firePatchCompleted
						bFirePatchCompleted = false;

					/*
					 * Error callback to report the given error and fire "patchCompleted"
					 * accordingly.
					 *
					 * @param {Error} oError
					 */
					function errorCallback(oError) {
						that.oModel.reportError(
							"Failed to update path " + that.oModel.resolve(sPath, that),
							sClassName, oError);
						firePatchCompleted(false);
					}

					/*
					 * Fire "patchCompleted" according to the given success flag, if needed.
					 *
					 * @param {boolean} bSuccess
					 */
					function firePatchCompleted(bSuccess) {
						if (bFirePatchCompleted) {
							oBinding.firePatchCompleted(bSuccess);
							bFirePatchCompleted = false;
						}
					}

					/*
					 * Fire "patchSent" and remember to later fire "patchCompleted".
					 */
					function patchSent() {
						bFirePatchCompleted = true;
						oBinding.firePatchSent();
					}

					if (!oGroupLock) {
						return oCache.setProperty(oResult.propertyPath, vValue, sEntityPath);
					}

					if (that.isInactive()) {
						oBinding.fireCreateActivate(that);
						that.bInactive = false;
					}

					// if request is canceled fnPatchSent and fnErrorCallback are not called and
					// returned Promise is rejected -> no patch events
					return oCache.update(oGroupLock, oResult.propertyPath, vValue,
						bSkipRetry ? undefined : errorCallback, oResult.editUrl, sEntityPath,
						oMetaModel.getUnitOrCurrencyPath(that.oModel.resolve(sPath, that)),
						oBinding.isPatchWithoutSideEffects(), patchSent, that.isKeepAlive.bind(that)
					).then(function () {
						firePatchCompleted(true);
					}, function (oError) {
						firePatchCompleted(false);
						throw oError;
					});
			});
		}, sPath, /*bSync*/false, /*bWithOrWithoutCache*/true);
	};

	/**
	 * Expands the group node that this context points to.
	 *
	 * @throws {Error}
	 *   If the context points to a node that is not expandable or already expanded
	 *
	 * @public
	 * @see #collapse
	 * @see #isExpanded
	 * @since 1.77.0
	 */
	Context.prototype.expand = function () {
		var that = this;

		switch (this.isExpanded()) {
			case false:
				this.oBinding.expand(this).catch(function (oError) {
					that.oModel.reportError("Failed to expand " + that, sClassName, oError);
				});
				break;
			case true:
				throw new Error("Already expanded: " + this);
			default:
				throw new Error("Not expandable: " + this);
		}
	};

	/**
	 * Returns a promise for the "canonical path" of the entity for this context.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the canonical path (e.g. "/SalesOrderList('0500000000')")
	 *   in case of success, or rejected with an instance of <code>Error</code> in case of failure,
	 *   e.g. if the given context does not point to an entity
	 *
	 * @private
	 */
	Context.prototype.fetchCanonicalPath = function () {
		return this.oModel.getMetaModel().fetchCanonicalPath(this);
	};

	/**
	 * Delegates to the <code>fetchValue</code> method of this context's binding which requests
	 * the value for the given path. A relative path is assumed to be relative to this context and
	 * is reduced before accessing the cache if the model uses autoExpandSelect.
	 *
	 * @param {string} [sPath]
	 *   A path (absolute or relative to this context)
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} [oListener]
	 *   A property binding which registers itself as listener at the cache
	 * @param {boolean} [bCached]
	 *   Whether to return cached values only and not trigger a request
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the binding's <code>fetchValue</code> call; it is rejected
	 *   in case cached values are asked for, but not found
	 *
	 * @private
	 */
	Context.prototype.fetchValue = function (sPath, oListener, bCached) {
		var oBinding = this.oBinding;

		if (this.iIndex === iVIRTUAL) {
			return SyncPromise.resolve(); // no cache access for virtual contexts
		}
		if (oBinding.getHeaderContext && oBinding.getHeaderContext() === this) {
			if (sPath && sPath.startsWith(this.sPath)) {
				sPath = sPath.slice(this.sPath.length + 1);
			}
			if (!sPath) {
				return oBinding.fetchValue(this.sPath, oListener, bCached)
					.then(function (aElements) {
						return {$count : aElements.$count};
					});
			} else if (sPath !== "$count") {
				throw new Error("Invalid header path: " + sPath);
			}
		}
		if (!sPath || sPath[0] !== "/") {
			// Create an absolute path based on the context's path and reduce it. This is only
			// necessary for data access via Context APIs, bindings already use absolute paths.
			sPath = this.oModel.resolve(sPath, this);
			if (this.oModel.bAutoExpandSelect) {
				sPath = this.oModel.getMetaModel()
					.getReducedPath(sPath, this.oBinding.getBaseForPathReduction());
			}
		}
		return this.oBinding.fetchValue(sPath, oListener, bCached);
	};

	/**
	 * Returns the binding this context belongs to.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding}
	 *   The context's binding
	 *
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getBinding = function () {
		return this.oBinding;
	};

	/**
	 * Returns the "canonical path" of the entity for this context.
	 * According to "4.3.1 Canonical URL" of the specification "OData Version 4.0 Part 2: URL
	 * Conventions", this is the "name of the entity set associated with the entity followed by the
	 * key predicate identifying the entity within the collection".
	 * Use the canonical path in {@link sap.ui.core.Element#bindElement} to create an element
	 * binding.
	 * Note: For a transient context (see {@link #isTransient}) a wrong path is returned unless all
	 * key properties are available within the initial data.
	 *
	 * @returns {string}
	 *   The canonical path (e.g. "/SalesOrderList('0500000000')")
	 * @throws {Error}
	 *   If the canonical path cannot be determined yet or in case of failure, e.g. if the given
	 *   context does not point to an entity
	 *
	 * @function
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getCanonicalPath = _Helper.createGetMethod("fetchCanonicalPath", true);

	/**
	 * Returns the unique number of this context's generation, or <code>0</code> if it does not
	 * belong to any specific generation. This number can be inherited from a parent binding.
	 *
	 * @param {boolean} [bOnlyLocal]
	 *   Whether the local generation w/o inheritance is returned
	 * @returns {number}
	 *   The unique number of this context's generation, or <code>0</code>
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.Context.createNewContext
	 * @see #setNewGeneration
	 */
	Context.prototype.getGeneration = function (bOnlyLocal) {
		if (this.iGeneration || bOnlyLocal) {
			return this.iGeneration;
		}
		return this.oBinding.getGeneration();
	};

	/**
	 * Returns the group ID of the context's binding that is used for read requests. See
	 * {@link sap.ui.model.odata.v4.ODataListBinding#getGroupId} and
	 * {@link sap.ui.model.odata.v4.ODataContextBinding#getGroupId}.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @public
	 * @since 1.81.0
	 */
	Context.prototype.getGroupId = function () {
		return this.oBinding.getGroupId();
	};

	/**
	 * Returns the context's index within the binding's collection. The return value changes when a
	 * new entity is added via {@link sap.ui.model.odata.v4.ODataListBinding#create} without
	 * <code>bAtEnd</code>, and when a context representing a created entity is deleted again.
	 *
	 * @returns {number|undefined}
	 *   The context's index within the binding's collection. It is <code>undefined</code> if
	 *   <ul>
	 *     <li> it does not belong to a list binding,
	 *     <li> it is kept alive (see {@link #isKeepAlive}), but not in the collection currently.
	 *   </ul>
	 *
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getIndex = function () {
		if (this.iIndex === undefined) {
			return undefined;
		}
		if (this.oBinding.isFirstCreateAtEnd()) {
			if (this.iIndex < 0) { // this does not include undefined for a kept-alive context
				return this.oBinding.bLengthFinal
					? this.oBinding.iMaxLength - this.iIndex - 1
					: -this.iIndex - 1;
			}
			return this.iIndex;
		}
		return this.getModelIndex();
	};

	/**
	 * Returns the model index, which is the context's index in the binding's collection. This
	 * differs from the view index if entities have been created at the end. Internally such
	 * contexts still are kept at the start of the collection. For this reason the return value
	 * changes if a new entity is added via {@link sap.ui.model.odata.v4.ODataListBinding#create}
	 * or deleted again.
	 *
	 * @returns {number}
	 *   The context's index within the binding's collection. It is <code>undefined</code> if
	 *   <ul>
	 *     <li> it does not belong to a list binding,
	 *     <li> it is kept alive (see {@link #isKeepAlive}), but not in the collection currently.
	 *   </ul>
	 *
	 * @private
	 */
	Context.prototype.getModelIndex = function () {
		if (this.iIndex !== undefined && this.oBinding.iCreatedContexts) {
			return this.iIndex + this.oBinding.iCreatedContexts;
		}
		return this.iIndex;
	};

	/**
	 * Returns the value for the given path relative to this context. The function allows access to
	 * the complete data the context points to (if <code>sPath</code> is "") or any part thereof.
	 * The data is a JSON structure as described in
	 * <a
	 * href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">
	 * "OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue}.
	 *
	 * Returns <code>undefined</code> if the data is not (yet) available; no request is triggered.
	 * Use {@link #requestObject} for asynchronous access.
	 *
	 * The header context of a list binding only delivers <code>$count</code> (wrapped in an object
	 * if <code>sPath</code> is "").
	 *
	 * @param {string} [sPath=""]
	 *   A path relative to this context
	 * @returns {any}
	 *   The requested value
	 * @throws {Error}
	 *   If the context's root binding is suspended or if the context is a header context and the
	 *   path is neither empty nor "$count".
	 *
	 * @public
	 * @see sap.ui.model.Context#getObject
	 * @since 1.39.0
	 */
	// @override sap.ui.model.Context#getObject
	Context.prototype.getObject = function (sPath) {
		return _Helper.publicClone(this.getValue(sPath));
	};

	/**
	 * Returns the property value for the given path relative to this context. The path is expected
	 * to point to a structural property with primitive type. Returns <code>undefined</code>
	 * if the data is not (yet) available; no request is triggered. Use {@link #requestProperty}
	 * for asynchronous access.
	 *
	 * @param {string} sPath
	 *   A path relative to this context
	 * @param {boolean} [bExternalFormat]
	 *   If <code>true</code>, the value is returned in external format using a UI5 type for the
	 *   given property path that formats corresponding to the property's EDM type and constraints.
	 *   If the type is not yet available, <code>undefined</code> is returned.
	 * @returns {any}
	 *   The requested property value
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the context's root binding is suspended,
	 *     <li> the value is not primitive,
	 *     <li> or the context is a header context and the path is not "$count"
	 *   </ul>
	 *
	 * @public
	 * @see sap.ui.model.Context#getProperty
	 * @see sap.ui.model.odata.v4.ODataMetaModel#requestUI5Type
	 * @since 1.39.0
	 */
	// @override sap.ui.model.Context#getProperty
	Context.prototype.getProperty = function (sPath, bExternalFormat) {
		var oError, oSyncPromise;

		this.oBinding.checkSuspended();
		oSyncPromise = fetchPrimitiveValue(this, sPath, bExternalFormat, true);

		if (oSyncPromise.isRejected()) {
			oSyncPromise.caught();
			oError = oSyncPromise.getResult();
			if (oError.isNotPrimitive) {
				throw oError;
			} else if (!oError.$cached) {
				// Note: errors due to data requests have already been logged
				Log.warning(oError.message, sPath, sClassName);
			}
		}
		return oSyncPromise.isFulfilled() ? oSyncPromise.getResult() : undefined;
	};

	/**
	 * Returns the query options from the associated binding for the given path.
	 *
	 * @param {string} sPath
	 *   The relative path for which the query options are requested
	 * @returns {object}
	 *   The query options from the associated binding (live reference, no clone!)
	 *
	 * @private
	 */
	Context.prototype.getQueryOptionsForPath = function (sPath) {
		return this.oBinding.getQueryOptionsForPath(sPath);
	};

	/**
	 * Returns the group ID of the context's binding that is used for update requests. See
	 * {@link sap.ui.model.odata.v4.ODataListBinding#getUpdateGroupId} and
	 * {@link sap.ui.model.odata.v4.ODataContextBinding#getUpdateGroupId}.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @public
	 * @since 1.81.0
	 */
	Context.prototype.getUpdateGroupId = function () {
		return this.oBinding.getUpdateGroupId();
	};

	/**
	 * Returns the value for the given path relative to this context. The function allows access to
	 * the complete data the context points to (if <code>sPath</code> is "") or any part thereof.
	 * The data is a JSON structure as described in
	 * <a
	 * href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">
	 * "OData JSON Format Version 4.0"</a>.
	 * Note that the function returns the cache instance. Do not modify the result, use
	 * {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue} instead.
	 *
	 * Returns <code>undefined</code> if the data is not (yet) available; no request is triggered.
	 *
	 * @param {string} [sPath=""]
	 *   A path relative to this context
	 * @returns {any}
	 *   The requested value
	 * @throws {Error}
	 *   If the context's root binding is suspended
	 *
	 * @private
	 */
	Context.prototype.getValue = function (sPath) {
		var oSyncPromise,
			that = this;

		this.oBinding.checkSuspended();
		oSyncPromise = this.fetchValue(sPath, null, true)
			.catch(function (oError) {
				if (!oError.$cached) {
					that.oModel.reportError("Unexpected error", sClassName, oError);
				}
			});

		if (oSyncPromise.isFulfilled()) {
			return oSyncPromise.getResult();
		}
	};

	/**
	 * Returns whether there are pending changes for bindings dependent on this context, or for
	 * unresolved bindings (see {@link sap.ui.model.Binding#isResolved}) which were dependent on
	 * this context at the time the pending change was created. This includes the context itself
	 * being {@link #isTransient transient}. Since 1.98.0, {@link #isInactive inactive} contexts are
	 * ignored.
	 *
	 * @returns {boolean}
	 *   Whether there are pending changes
	 *
	 * @public
	 * @since 1.53.0
	 */
	Context.prototype.hasPendingChanges = function () {
		return this.isTransient()
			|| this.oModel.getDependentBindings(this).some(function (oDependentBinding) {
				return oDependentBinding.hasPendingChanges();
			})
			|| this.oModel.withUnresolvedBindings("hasPendingChangesInCaches", this.sPath.slice(1));
	};

	/**
	 * Tells whether the group node that this context points to is expanded.
	 *
	 * @returns {boolean|undefined}
	 *   Whether the group node that this context points to is expanded, or <code>undefined</code>
	 *   if the node is not expandable
	 *
	 * @public
	 * @see #collapse
	 * @see #expand
	 * @since 1.77.0
	 */
	Context.prototype.isExpanded = function () {
		return this.getProperty("@$ui5.node.isExpanded");
	};

	/**
	 * Returns whether this context is inactive. The result of this function can also be accessed
	 * via instance annotation "@$ui5.context.isInactive" at the entity.
	 *
	 * @returns {boolean} <code>true</code> if this context is inactive, <code>false</code> if it
	 *   was created in an inactive state and has been activated, and <code>undefined</code>
	 *   otherwise.
	 *
	 * @public
	 * @see #isTransient
	 * @see sap.ui.model.odata.v4.ODataListBinding#create
	 * @see sap.ui.model.odata.v4.ODataListBinding#event:createActivate
	 * @since 1.98.0
	 */
	Context.prototype.isInactive = function () {
		return this.bInactive;
	};

	/**
	 * Returns whether this context is kept alive.
	 *
	 * @returns {boolean} <code>true</code> if this context is kept alive
	 *
	 * @public
	 * @see #setKeepAlive
	 * @since 1.81.0
	 */
	Context.prototype.isKeepAlive = function () {
		return this.bKeepAlive;
	};

	/**
	 * For a context created using {@link sap.ui.model.odata.v4.ODataListBinding#create}, the
	 * method returns <code>true</code> if the context is transient, meaning that the promise
	 * returned by {@link #created} is not yet resolved or rejected, and returns <code>false</code>
	 * if the context is not transient. The result of this function can also be accessed via
	 * instance annotation "@$ui5.context.isTransient" at the entity.
	 *
	 * @returns {boolean}
	 *   Whether this context is transient if it is created using
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#create}; <code>undefined</code> if it is not
	 *   created using {@link sap.ui.model.odata.v4.ODataListBinding#create}
	 *
	 * @public
	 * @see #isInactive
	 * @since 1.43.0
	 */
	Context.prototype.isTransient = function () {
		return this.oSyncCreatePromise && this.oSyncCreatePromise.isPending();
	};

	/**
	 * Patches the context data with the given patch data.
	 *
	 * @param {object} oData
	 *   The data to patch with
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolve without a result when the patch is done.
	 *
	 * @private
	 */
	Context.prototype.patch = function (oData) {
		return this.withCache(function (oCache, sPath) {
			oCache.patch(sPath, oData);
		}, "");
	};

	/**
	 * Refreshes the single entity represented by this context. Use {@link #requestRefresh} if you
	 * want to wait for the refresh.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the refresh; if not specified, the group ID for the context's
	 *   binding is used, see {@link #getGroupId}.
	 * @param {boolean} [bAllowRemoval]
	 *   If the context belongs to a list binding, the parameter allows the list binding to remove
	 *   the context from the list binding's collection because the entity does not match the
	 *   binding's filter anymore, see {@link sap.ui.model.odata.v4.ODataListBinding#filter};
	 *   a removed context is destroyed, see {@link #destroy}. If the context belongs to a context
	 *   binding, the parameter must not be used.
	 *   Supported since 1.55.0
	 *
	 *   Since 1.84.0, if this context is kept alive (see {@link #isKeepAlive}), it is only
	 *   destroyed if the corresponding entity does no longer exist in the back end. In this case,
	 *   the <code>fnOnBeforeDestroy</code> callback passed with {@link #setKeepAlive}) is called.
	 * @throws {Error}
	 *   If the group ID is not valid, if this context has pending changes or does not represent a
	 *   single entity (see {@link sap.ui.model.odata.v4.ODataListBinding#getHeaderContext}), if the
	 *   binding is not refreshable, if its root binding is suspended, or if the parameter
	 *   <code>bAllowRemoval</code> is set for a context belonging to a context binding.
	 *
	 * @public
	 * @since 1.53.0
	 */
	Context.prototype.refresh
		= function (sGroupId, bAllowRemoval) { // eslint-disable-line no-unused-vars
		this.requestRefresh.apply(this, arguments).catch(this.oModel.getReporter());
	};

	/**
	 * Refreshes all dependent bindings with the given parameters and waits for them to have
	 * finished.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix which is used to delete the dependent caches and corresponding
	 *   messages; may be "" but not <code>undefined</code>
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 * @param {boolean} [bCheckUpdate]
	 *   If <code>true</code>, a property binding is expected to check for updates
	 * @param {boolean} [bKeepCacheOnError]
	 *   If <code>true</code>, the binding data remains unchanged if the refresh fails
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving when all dependent bindings are refreshed; it is rejected
	 *   when the refresh fails; the promise is resolved immediately on a suspended binding
	 * @throws {Error}
	 *   If the binding's root binding is suspended and a group ID different from the binding's
	 *   group ID is given
	 *
	 * @private
	 */
	Context.prototype.refreshDependentBindings = function (sResourcePathPrefix, sGroupId,
			bCheckUpdate, bKeepCacheOnError) {
		return SyncPromise.all(
			this.oModel.getDependentBindings(this).map(function (oDependentBinding) {
				return oDependentBinding.refreshInternal(sResourcePathPrefix, sGroupId,
					bCheckUpdate, bKeepCacheOnError);
			})
		);
	};

	/**
	 * Replaces this context with the given other context "in situ", that is, at the index it
	 * currently has in its list binding's collection. You probably want to delete this context
	 * afterwards without requesting the new count from the server, see the
	 * <code>bDoNotRequestCount</code> parameter of {@link #delete}.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oOtherContext - The other context
	 * @throws {Error} If
	 *   <ul>
	 *     <li> this context's root binding is suspended,
	 *     <li> this context is transient (see {@link #isTransient}),
	 *     <li> the given other context does not belong to the same list binding as this context, or
	 *       is already in the collection (has an index, see {@link #getIndex}).
	 *   </ul>
	 *
	 * @public
	 * @since 1.97.0
	 */
	Context.prototype.replaceWith = function (oOtherContext) {
		var oElement;

		this.oBinding.checkSuspended();
		if (this.isTransient()) {
			throw new Error("Cannot replace " + this);
		}
		if (oOtherContext.oBinding !== this.oBinding || oOtherContext.iIndex !== undefined) {
			throw new Error("Cannot replace with " + oOtherContext);
		}
		oElement = oOtherContext.getValue();
		this.oBinding.doReplaceWith(this, oElement,
			_Helper.getPrivateAnnotation(oElement, "predicate"));
	};

	/**
	 * Returns a promise for the "canonical path" of the entity for this context.
	 * According to "4.3.1 Canonical URL" of the specification "OData Version 4.0 Part 2: URL
	 * Conventions", this is the "name of the entity set associated with the entity followed by the
	 * key predicate identifying the entity within the collection".
	 * Use the canonical path in {@link sap.ui.core.Element#bindElement} to create an element
	 * binding.
	 * Note: For a transient context (see {@link #isTransient}) a wrong path is returned unless all
	 * key properties are available within the initial data.
	 *
	 * @returns {Promise}
	 *   A promise which is resolved with the canonical path (e.g. "/SalesOrderList('0500000000')")
	 *   in case of success, or rejected with an instance of <code>Error</code> in case of failure,
	 *   e.g. if the given context does not point to an entity
	 *
	 * @function
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.requestCanonicalPath = _Helper.createRequestMethod("fetchCanonicalPath");

	/**
	 * Returns a promise on the value for the given path relative to this context. The function
	 * allows access to the complete data the context points to (if <code>sPath</code> is "") or
	 * any part thereof. The data is a JSON structure as described in
	 * <a
	 * href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">
	 * "OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.Context#setProperty}.
	 *
	 * The header context of a list binding only delivers <code>$count</code> (wrapped in an object
	 * if <code>sPath</code> is "").
	 *
	 * If you want {@link #requestObject} to read fresh data, call {@link #refresh} first.
	 *
	 * @param {string} [sPath=""]
	 *   A path relative to this context
	 * @returns {Promise}
	 *   A promise on the requested value; it is rejected if the context is a header context and the
	 *   path is neither empty nor "$count".
	 * @throws {Error}
	 *   If the context's root binding is suspended
	 *
	 * @public
	 * @see #getBinding
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @since 1.39.0
	 */
	Context.prototype.requestObject = function (sPath) {
		this.oBinding.checkSuspended();

		return Promise.resolve(this.fetchValue(sPath)).then(_Helper.publicClone);
	};

	/**
	 * Returns a promise on the property value for the given path relative to this context. The path
	 * is expected to point to a structural property with primitive type.
	 * Since 1.81.1 it is possible to request more than one property. Property values that are not
	 * cached yet are requested from the back end.
	 *
	 * @param {string|string[]} [vPath]
	 *   One or multiple paths relative to this context
	 * @param {boolean} [bExternalFormat]
	 *   If <code>true</code>, the values are returned in external format using UI5 types for the
	 *   given property paths that format corresponding to the properties' EDM types and constraints
	 * @returns {Promise}
	 *   A promise on the requested value or values; it is rejected if a value is not primitive or
	 *   if the context is a header context and a path is not "$count"
	 * @throws {Error}
	 *   If the context's root binding is suspended
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataMetaModel#requestUI5Type
	 * @since 1.39.0
	 */
	Context.prototype.requestProperty = function (vPath, bExternalFormat) {
		var aPaths = Array.isArray(vPath) ? vPath : [vPath],
			that = this;

		this.oBinding.checkSuspended();

		return Promise.all(aPaths.map(function (sPath) {
			return that.oBinding.fetchIfChildCanUseCache(that, sPath, SyncPromise.resolve({}))
				.then(function (sReducedPath) {
					if (sReducedPath) {
						return fetchPrimitiveValue(that, sReducedPath, bExternalFormat);
					}

					Log.error("Not a valid property path: " + sPath, undefined, sClassName);
					// return undefined;
				});
		})).then(function (aValues) {
			return Array.isArray(vPath) ? aValues : aValues[0];
		});
	};

	/**
	 * Refreshes the single entity represented by this context and returns a promise to wait for it.
	 * See {@link #refresh} for details. Use {@link #refresh} if you do not need the promise.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used
	 * @param {boolean} [bAllowRemoval]
	 *   Allows to remove the context
	 * @returns {Promise}
	 *   A promise which resolves without a defined result when the refresh is finished and rejects
	 *   with an instance of <code>Error</code> if the refresh failed
	 * @throws {Error}
	 *   See {@link #refresh} for details
	 *
	 * @public
	 * @since 1.87.0
	 */
	Context.prototype.requestRefresh = function (sGroupId, bAllowRemoval) {
		var oPromise;

		this.oModel.checkGroupId(sGroupId);
		this.oBinding.checkSuspended();
		if (this.hasPendingChanges()) {
			throw new Error("Cannot refresh entity due to pending changes: " + this);
		}

		if (this.oBinding.refreshSingle) {
			oPromise = this.oBinding.refreshSingle(this, this.oBinding.lockGroup(sGroupId, true),
				bAllowRemoval);
		} else {
			if (arguments.length > 1) {
				throw new Error("Unsupported parameter bAllowRemoval: " + bAllowRemoval);
			}

			oPromise = this.oBinding.refreshReturnValueContext(this, sGroupId)
				|| this.oBinding.requestRefresh(sGroupId);
		}
		this.oModel.withUnresolvedBindings("removeCachesAndMessages", this.sPath.slice(1));

		return Promise.resolve(oPromise).then(function () {
			// return undefined
		});
	};

	/**
	 * Loads side effects for this context using the given
	 * "14.5.11 Expression edm:NavigationPropertyPath" or "14.5.13 Expression edm:PropertyPath"
	 * objects. Use this method to explicitly load side effects in case implicit loading is switched
	 * off via the binding-specific parameter <code>$$patchWithoutSideEffects</code>. The method
	 * can be called on
	 * <ul>
	 *   <li> the bound context of a context binding,
	 *   <li> the return value context of an operation binding,
	 *   <li> a context of a list binding representing a single entity,
	 *   <li> the header context of a list binding; side effects are loaded for the whole binding in
	 *     this case.
	 * </ul>
	 * Key predicates must be available in this context's path. Avoid
	 * navigation properties as part of a binding's $select system query option as they may trigger
	 * pointless requests. There must be only context bindings between this context and its first
	 * ancestor binding which uses own data service requests.
	 *
	 * If the first ancestor binding has an empty path, it is a context binding. In this case, we
	 * look for the farthest ancestor binding with the following characteristics: It uses own data
	 * service requests, it can be reached via a sequence of only empty paths, and it is actually
	 * being used. This way, side effects are loaded also for siblings of that first ancestor
	 * binding which show the same data, but useless requests are avoided.
	 *
	 * By default, the request uses the update group ID for this context's binding; this way, it can
	 * easily be part of the same batch request as the corresponding update. <b>Caution:</b> If a
	 * dependent binding uses a different update group ID, it may lose its pending changes. The same
	 * will happen if a different group ID is provided, and the side effects affect properties for
	 * which there are pending changes.
	 *
	 * All failed updates or creates for the group ID are repeated within the same batch request.
	 * If the group ID has submit mode {@link sap.ui.model.odata.v4.SubmitMode.Auto} and there are
	 * currently running updates or creates this method first waits for them to be processed.
	 *
	 * The events 'dataRequested' and 'dataReceived' are not fired. Whatever should happen in the
	 * event handler attached to...
	 * <ul>
	 *   <li> 'dataRequested', can instead be done before calling {@link #requestSideEffects}.
	 *   <li> 'dataReceived', can instead be done once the <code>oPromise</code> returned by
	 *     {@link #requestSideEffects} fulfills or rejects (using
	 *     <code>oPromise.then(function () {...}, function () {...})</code>).
	 * </ul>
	 *
	 * @param {object[]|string[]} aPathExpressions
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" objects describing which properties need to be
	 *   loaded because they may have changed due to side effects of a previous update, for example
	 *   <code>[{$PropertyPath : "TEAM_ID"}, {$NavigationPropertyPath : "EMPLOYEE_2_MANAGER"},
	 *   {$PropertyPath : "EMPLOYEE_2_TEAM/Team_Id"}]</code>. An empty navigation property path
	 *   means that the whole entity may have changed, including its navigation properties. Since
	 *   1.75, a property path may end with a "*" segment to indicate that all structural properties
	 *   may have changed, but no navigation properties (unless listed explicitly), for example
	 *   <code>[{$PropertyPath : "*"}, {$NavigationPropertyPath : "EMPLOYEE_2_MANAGER"}]</code> or
	 *   <code>[{$PropertyPath : "EMPLOYEE_2_MANAGER/*"}]</code>.
	 *
	 *   Since 1.82.0 absolute paths are supported. Absolute paths must start with the entity
	 *   container (example "/com.sap.gateway.default.iwbep.tea_busi.v0001.Container/TEAMS") of the
	 *   service. All (navigation) properties in the complete model matching such an absolute path
	 *   are updated. Since 1.85.0, "14.4.11 Expression edm:String" is accepted as well.
	 * @param {string} [sGroupId]
	 *   The group ID to be used (since 1.69.0); if not specified, the update group ID for the
	 *   context's binding is used, see {@link #getUpdateGroupId}. If a different group ID is
	 *   specified, make sure that {@link #requestSideEffects} is called after the corresponding
	 *   updates have been successfully processed by the server and that there are no pending
	 *   changes for the affected properties.
	 * @returns {Promise}
	 *   Promise resolved with <code>undefined</code>, or rejected with an error if loading of side
	 *   effects fails. Use it to set fields affected by side effects to read-only before
	 *   {@link #requestSideEffects} and make them editable again when the promise resolves; in the
	 *   error handler, you can repeat the loading of side effects.
	 * @throws {Error} If
	 *   <ul>
	 *     <li> metadata has not yet been loaded
	 *     <li> <code>aPathExpressions</code> contains objects other than
	 *       "14.4.11 Expression edm:String", "14.5.11 Expression edm:NavigationPropertyPath" or
	 *       "14.5.13 Expression edm:PropertyPath"
	 *     <li> a path contains a "*", except for a property path as its sole or last segment
	 *     <li> this context is not supported
	 *     <li> the root binding of this context's binding is suspended (see {@link #getBinding} and
	 *       {@link sap.ui.model.odata.v4.ODataContextBinding#getRootBinding},
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#getRootBinding}, or
	 *       {@link sap.ui.model.odata.v4.ODataPropertyBinding#getRootBinding}, and
	 *       {@link sap.ui.model.Binding#isSuspended})
	 *     <li> this context is transient (see {@link #isTransient})
	 *     <li> the binding of this context is unresolved (see
	 *       {@link sap.ui.model.Binding#isResolved})
	 *     <li> the group ID is invalid
	 *     <li> a <code>$PropertyPath</code> has been requested which contains a navigation
	 *       property that was changed on the server and now targets a different entity
	 *       (since 1.79.0)
	 *     <li> the binding of this context has "$$aggregation" (see
	 *       {@link sap.ui.model.odata.v4.ODataModel#bindList}) and the context is not the header
	 *       context
	 *   </ul>
	 * @public
	 * @see sap.ui.model.odata.v4.ODataContextBinding#execute
	 * @see sap.ui.model.odata.v4.ODataContextBinding#getBoundContext
	 * @see sap.ui.model.odata.v4.ODataListBinding#getHeaderContext
	 * @see sap.ui.model.odata.v4.ODataModel#bindContext
	 * @since 1.61.0
	 */
	Context.prototype.requestSideEffects = function (aPathExpressions, sGroupId) {
		var sEntityContainer,
			oMetaModel = this.oModel.getMetaModel(),
			aPathsForBinding = [],
			aPathsForModel = [],
			oRootBinding,
			sRootPath,
			that = this;

		/*
		 * Tells whether the given property path is OK.
		 *
		 * @param {string} sPropertyPath
		 * @returns {boolean}
		 */
		function isPropertyPath(sPropertyPath) {
			if (!sPropertyPath) {
				return false;
			}
			if (sPropertyPath === "*") {
				return true;
			}
			if (sPropertyPath.endsWith("/*")) {
				sPropertyPath = sPropertyPath.slice(0, -2);
			}
			return !sPropertyPath.includes("*");
		}

		this.oBinding.checkSuspended();
		this.oModel.checkGroupId(sGroupId);
		if (this.isTransient()) {
			throw new Error("Unsupported context: " + this);
		}
		if (!aPathExpressions || !aPathExpressions.length) {
			throw new Error("Missing edm:(Navigation)PropertyPath expressions");
		}
		// Fail fast with a specific error for unresolved bindings
		if (!this.oBinding.isResolved()) {
			throw new Error("Cannot request side effects of unresolved binding's context: " + this);
		}
		sEntityContainer = oMetaModel.getObject("/$EntityContainer");
		if (!sEntityContainer) {
			throw new Error("Missing metadata");
		}

		sEntityContainer = "/" + sEntityContainer + "/";
		aPathExpressions.map(function (vPath) {
			if (vPath && typeof vPath === "object") {
				if (isPropertyPath(vPath.$PropertyPath)) {
					return vPath.$PropertyPath;
				}
				if (typeof vPath.$NavigationPropertyPath === "string"
						&& !vPath.$NavigationPropertyPath.includes("*")) {
					return vPath.$NavigationPropertyPath;
				}
			} else if (typeof vPath === "string" && (!vPath || isPropertyPath(vPath))) {
				return vPath;
			}
			throw new Error("Not an edm:(Navigation)PropertyPath expression: "
				+ JSON.stringify(vPath));
		}).forEach(function (sPath) {
			if (sPath[0] === "/") {
				if (!sPath.startsWith(sEntityContainer)) {
					throw new Error("Path must start with '" + sEntityContainer + "': " + sPath);
				}
				aPathsForModel.push(sPath.slice(sEntityContainer.length - 1));
			} else {
				aPathsForBinding.push(sPath);
			}
		});

		oRootBinding = this.oBinding.getRootBinding();
		sRootPath = oRootBinding.getResolvedPath();
		aPathsForBinding = aPathsForBinding.reduce(function (aPaths0, sPath) {
			return aPaths0.concat(oMetaModel.getAllPathReductions(
				_Helper.buildPath(that.getPath(), sPath), sRootPath));
		}, []);
		aPathsForBinding = _Helper.filterPaths(aPathsForModel, aPathsForBinding);

		sGroupId = sGroupId || this.getUpdateGroupId();

		return Promise.resolve(
			SyncPromise.resolve(
				this.oModel.isAutoGroup(sGroupId)
					&& this.oModel.oRequestor.waitForRunningChangeRequests(sGroupId)
						.then(function () {
							that.oModel.oRequestor.relocateAll("$parked." + sGroupId, sGroupId);
						})
			).then(function () {
				return SyncPromise.all([
					that.oModel.requestSideEffects(sGroupId, aPathsForModel),
					// ensure that this is called synchronously when there are no running change
					// requests (otherwise bubbling up might fail due to temporarily missing caches)
					that.requestSideEffectsInternal(aPathsForBinding, sGroupId)
				]);
			})
		).then(function () {
			// return undefined;
		});
	};

	/**
	 * Finds the context to request side effects with, checks whether the given paths are relative
	 * to this context and delegates them either to this context's binding or the binding's parent
	 * context.
	 *
	 * @param {string[]} aAbsolutePaths
	 *   The absolute paths to request side effects for
	 * @param {string} sGroupId
	 *   The effective group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result, or rejecting with an error if loading of side
	 *   effects fails, or <code>undefined</code> if there is nothing to do
	 *
	 * @private
	 */
	Context.prototype.requestSideEffectsInternal = function (aAbsolutePaths, sGroupId) {
		var that = this,
			oBinding,
			oCandidate = /*consistent-this*/that,
			oContext,
			aOwnPaths = [],
			oParentContext,
			aParentPaths = [],
			sPath,
			aPromises = [];

		if (!aAbsolutePaths.length) {
			return undefined; // nothing to do
		}

		for (;;) {
			oBinding = oCandidate.getBinding();
			sPath = oBinding.getPath();
			oParentContext = oBinding.getContext();
			if (oBinding.oCache && (!oContext || oBinding.oCache.hasChangeListeners())) {
				oContext = oCandidate; // active binding with own cache is a good target
			}
			if (oContext && sPath) {
				// if we already have a good target, bubble further up through empty path only
				break;
			}
			if (!oBinding.getBoundContext) {
				throw new Error("Not a context binding: " + oBinding);
			}
			oCandidate = oParentContext;
		}

		oBinding = oContext.getBinding();

		aAbsolutePaths.forEach(function (sAbsolutePath) {
			var sRelativePath = _Helper.getRelativePath(sAbsolutePath, oContext.getPath());

			if (sRelativePath === undefined) {
				// reduced path is not relative to this context -> delegate up
				aParentPaths.push(sAbsolutePath);
			} else {
				aOwnPaths.push(sRelativePath);
			}
		});

		if (aParentPaths.length) {
			// Note: it is important to first delegate up, because that might refresh oBinding!
			aPromises.push(
				oBinding.getContext().requestSideEffectsInternal(aParentPaths, sGroupId));
		}

		if (aOwnPaths.length && oBinding.oCache !== undefined) {
			// only if oBinding not being refreshed already...
			aPromises.push(oBinding.requestSideEffects(sGroupId, aOwnPaths, oContext));
		}

		return SyncPromise.all(aPromises);
	};

	/**
	 * Sets the <code>bKeepAlive</code> flag of this content to <code>false</code> without
	 * touching the callback function <code>fnOnBeforeDestroy</code>.
	 *
	 * @private
	 */
	Context.prototype.resetKeepAlive = function () {
		this.bKeepAlive = false;
	};

	/**
	 * Sets a new unique number for this context's generation, just like
	 * {@link sap.ui.model.odata.v4.Context.createNewContext} does for a new context.
	 *
	 * @private
	 * @see #getGeneration
	 */
	Context.prototype.setNewGeneration = function () {
		iGenerationCounter += 1;
		this.iGeneration = iGenerationCounter;
	};

	/**
	 * Sets this context's <code>keepAlive</code> attribute. If <code>true</code> the context is
	 * kept alive even when it is removed from its binding's collection, for example if a filter is
	 * applied and the entity represented by this context does not match the filter criteria.
	 *
	 * Normally, a context's lifecycle is managed implicitly. It is created once it is needed and
	 * destroyed if it is not needed anymore, for example, because it is no longer part of its list
	 * binding's collection. It is thus unsafe to keep a reference to a context instance which is
	 * not explicitly kept alive. Once a context is not kept alive anymore, the implicit lifecycle
	 * management again takes control and destroys the context if it is no longer needed.
	 *
	 * @param {boolean} bKeepAlive
	 *   Whether to keep the context alive
	 * @param {function} [fnOnBeforeDestroy]
	 *   Callback function that is executed once for a kept-alive context just before it is
	 *   destroyed, see {@link #destroy}. Supported since 1.84.0
	 * @param {boolean} [bRequestMessages]
	 *   Whether to request messages for this entity. Only used if <code>bKeepAlive</code> is
	 *   <code>true</code>. Determines the messages property from the annotation
	 *   "com.sap.vocabularies.Common.v1.Messages" at the entity type. If found, the binding keeps
	 *   requesting messages until it is destroyed. Otherwise an error is logged in the console and
	 *   no messages are requested. Supported since 1.92.0
	 * @throws {Error} If
	 *   <ul>
	 *     <li> this context is not a list binding's context,
	 *     <li> it is the header context,
	 *     <li> it is transient,
	 *     <li> it does not point to an entity,
	 *     <li> a key property of the entity has not been requested,
	 *     <li> the list binding is relative and does not use the <code>$$ownRequest</code>
	 *       parameter (see {@link sap.ui.model.odata.v4.ODataModel#bindList}),
	 *     <li> the list binding uses or inherits the <code>$$sharedRequest</code> parameter
	 *       (see {@link sap.ui.model.odata.v4.ODataModel#bindList}),
	 *     <li> the list binding uses data aggregation
	 *       (see {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}),
	 *     <li> messages are requested, but the model does not use the <code>autoExpandSelect</code>
	 *       parameter.
	 *   </ul>
	 *
	 * @public
	 * @see #isKeepAlive
	 * @since 1.81.0
	 */
	Context.prototype.setKeepAlive = function (bKeepAlive, fnOnBeforeDestroy, bRequestMessages) {
		var that = this;

		if (this.isTransient()) {
			throw new Error("Unsupported transient context " + this);
		}
		this.oModel.getPredicateIndex(this.sPath);
		this.oBinding.checkKeepAlive(this);

		if (bKeepAlive && bRequestMessages) {
			if (!this.oModel.bAutoExpandSelect) {
				throw new Error("Missing parameter autoExpandSelect at model");
			}
			this.bKeepAlive = bKeepAlive; // must be set before calling fetchIfChildCanUseCache
			this.oModel.getMetaModel().fetchObject(
				_Helper.getMetaPath(this.sPath) + "/@com.sap.vocabularies.Common.v1.Messages/$Path"
			).then(function (sMessagesPath) {
				if (!sMessagesPath) {
					throw new Error("Missing @com.sap.vocabularies.Common.v1.Messages");
				}
				return that.oBinding.fetchIfChildCanUseCache(that, sMessagesPath, {});
			}).then(function (sReducedPath) {
				return that.fetchValue(sReducedPath);
			}).catch(this.oModel.getReporter());
		}

		this.bKeepAlive = bKeepAlive;
		this.fnOnBeforeDestroy = bKeepAlive ? fnOnBeforeDestroy : undefined;
	};

	/**
	 * Sets a new value for the property identified by the given path. The path is relative to this
	 * context and is expected to point to a structural property with primitive type or, since
	 * 1.85.0, to an instance annotation.
	 *
	 * @param {string} sPath
	 *   A path relative to this context
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the PATCH request; if not specified, the update group ID for
	 *   the context's binding is used, see {@link #getUpdateGroupId}. Since 1.74.0, you can use
	 *   <code>null</code> to prevent the PATCH request.
	 * @param {boolean} [bRetry]
	 *   Since 1.85.0, if <code>true</code> the property is not reset if the PATCH request failed.
	 *   It contributes to the pending changes instead (see
	 *   {@link sap.ui.model.odata.v4.ODataModel#hasPendingChanges},
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding#hasPendingChanges} and
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#hasPendingChanges}) and can be reset via the
	 *   corresponding <code>resetChanges</code> methods.
	 *
	 *   The PATCH is automatically repeated with the next call of
	 *   {@link sap.ui.model.odata.v4.ODataModel#submitBatch} if the group ID has
	 *   {@link sap.ui.model.odata.v4.SubmitMode.API}. Otherwise it is repeated when the property is
	 *   modified again.
	 *
	 *   Each time the PATCH request is sent to the server, a 'patchSent' event is fired on the
	 *   binding sending the request. When the response for this request is received, a
	 *   'patchCompleted' with a boolean parameter 'success' is fired.
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure, for example if the annotation belongs to
	 *   the read-only namespace "@$ui5.*". With <code>bRetry</code> it is only rejected with an
	 *   <code>Error</code> instance where <code>oError.canceled === true</code> when the property
	 *   has been reset via the methods
	 *   <ul>
	 *     <li> {@link sap.ui.model.odata.v4.ODataModel#resetChanges}
	 *     <li> {@link sap.ui.model.odata.v4.ODataContextBinding#resetChanges} or
	 *     <li> {@link sap.ui.model.odata.v4.ODataListBinding#resetChanges}.
	 *   </ul>
	 * @throws {Error}
	 *   If the binding's root binding is suspended, for invalid group IDs, or if the new value is
	 *   not primitive
	 *
	 * @public
	 * @see #getProperty
	 * @see sap.ui.model.odata.v4.ODataContextBinding#event:patchSent
	 * @see sap.ui.model.odata.v4.ODataContextBinding#event:patchCompleted
	 * @see sap.ui.model.odata.v4.ODataListBinding#event:patchSent
	 * @see sap.ui.model.odata.v4.ODataListBinding#event:patchCompleted
	 * @since 1.67.0
	 */
	Context.prototype.setProperty = function (sPath, vValue, sGroupId, bRetry) {
		var oGroupLock = null,
			that = this;

		this.oBinding.checkSuspended();
		if (typeof vValue === "function" || (vValue && typeof vValue === "object")) {
			throw new Error("Not a primitive value");
		}
		if (sGroupId !== null) {
			this.oModel.checkGroupId(sGroupId);
			oGroupLock = this.oBinding.lockGroup(sGroupId, true, true);
		}

		return Promise.resolve(this.doSetProperty(sPath, vValue, oGroupLock, !bRetry))
			.catch(function (oError) {
				if (oGroupLock) {
					oGroupLock.unlock(true);
				}
				that.oModel.reportError("Failed to update path " + that.oModel.resolve(sPath, that),
					sClassName, oError);
				throw oError;
			});
	};

	/**
	 * Returns a string representation of this object including the binding path.
	 *
	 * @return {string} A string description of this binding
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.toString = function () {
		var sIndex = "";

		if (this.iIndex !== undefined) {
			sIndex = "[" + this.iIndex + (this.isTransient() ? "|transient" : "") + "]";
		}
		return this.sPath + sIndex;
	};

	/**
	 * Calls the given processor with the cache containing this context's data, with the path
	 * relative to the cache and with the cache-owning binding. Adjusts the path if the cache is
	 * owned by a parent binding.
	 *
	 * @param {function} fnProcessor The processor
	 * @param {string} sPath The path; either relative to the context or absolute containing
	 *   the cache's request path (it will become absolute when forwarding the request to the
	 *   parent binding)
	 * @param {boolean} [bSync] Whether to use the synchronously available cache
	 * @param {boolean} [bWithOrWithoutCache] Whether to call the processor even without a cache
	 *   (currently implemented for operation bindings only)
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved with either the result of
	 *   the processor or <code>undefined</code> if there is no cache for this binding, or if the
	 *   cache determination is not yet completed
	 */
	Context.prototype.withCache = function (fnProcessor, sPath, bSync, bWithOrWithoutCache) {
		if (this.iIndex === iVIRTUAL) {
			return SyncPromise.resolve(); // no cache access for virtual contexts
		}
		return this.oBinding.withCache(fnProcessor, this.oModel.resolve(sPath, this), bSync,
			bWithOrWithoutCache);
	};

	oModule = {
		/**
		 * Creates a context for an OData V4 model which does not belong to any specific generation,
		 * that is {@link #getGeneration} returns <code>0</code>.
		 *
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel
		 *   The model
		 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding} oBinding
		 *   A binding that belongs to the model
		 * @param {string} sPath
		 *   An absolute path without trailing slash
		 * @param {number} [iIndex]
		 *   Index of item represented by this context, used by list bindings, not context bindings
		 * @param {sap.ui.base.SyncPromise} [oCreatePromise]
		 *   A promise which is resolved with the created entity when the POST request has been
		 *   successfully sent and the entity has been marked as non-transient; used as base for
		 *   {@link #created}
		 * @param {boolean} [bInactive]
		 *   Whether this context is inactive and will only be sent to the server after the first
		 *   property update
		 * @returns {sap.ui.model.odata.v4.Context}
		 *   A context for an OData V4 model
		 * @throws {Error}
		 *   If an invalid path is given
		 *
		 * @private
		 */
		create : function (oModel, oBinding, sPath, iIndex, oCreatePromise, bInactive) {
			return new Context(oModel, oBinding, sPath, iIndex, oCreatePromise, 0, bInactive);
		},

		/**
		 * Creates a for an OData V4 model which belongs to a new generation. A unique number for
		 * that generation is generated and can be retrieved via {@link #getGeneration}.
		 *
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel
		 *   The model
		 * @param {sap.ui.model.odata.v4.ODataContextBinding} oBinding
		 *   A binding that belongs to the model
		 * @param {string} sPath
		 *   An absolute path without trailing slash
		 * @returns {sap.ui.model.odata.v4.Context}
		 *   A context for an OData V4 model
		 * @throws {Error}
		 *   If an invalid path is given
		 *
		 * @private
		 */
		createNewContext : function (oModel, oBinding, sPath) {
			iGenerationCounter += 1;

			return new Context(oModel, oBinding, sPath, undefined, undefined, iGenerationCounter);
		}
	};

	/*
	 * Index of virtual context used for auto-$expand/$select.
	 */
	Object.defineProperty(oModule, "VIRTUAL", {value : iVIRTUAL});

	return oModule;
}, /* bExport= */ false);
