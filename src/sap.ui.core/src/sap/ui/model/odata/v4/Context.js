/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"./lib/_Helper",
	"./lib/_SyncPromise"
], function (BaseContext, _ODataHelper, _Helper, _SyncPromise) {
	"use strict";

	/*
	 * Clones the object.
	 */
	function clone(o) {
		return o && JSON.parse(JSON.stringify(o));
	}

	/*
	 * Fetches and formats the primitive value at the given path.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext The context
	 * @param {string} sPath The requested path
	 * @param {boolean} [bExternalFormat=false]
	 *   If <code>true</code>, the value is returned in external format using a UI5 type for the
	 *   given property path that formats corresponding to the property's EDM type and constraints.
	 * @returns {SyncPromise} a promise on the formatted value
	 */
	function fetchPrimitiveValue(oContext, sPath, bExternalFormat) {
		var oError,
			aPromises = [oContext.fetchValue(sPath)],
			sResolvedPath = oContext.getPath(sPath);

		if (bExternalFormat) {
			aPromises.push(
				oContext.oModel.getMetaModel().fetchUI5Type(sResolvedPath));
		}
		return _SyncPromise.all(aPromises).then(function (aResults) {
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
	 * @param {Promise} [oCreatePromise]
	 *   Promise returned by {@link #created}
	 *
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
	 *   Applications can access model data only via a context, either synchronously with the risk
	 *   that the values are not available yet ({@link #getProperty} and {@link #getObject}) or
	 *   asynchronously ({@link #requestProperty} and {@link #requestObject}).
	 *
	 *   Context instances are immutable.
	 * @extends sap.ui.model.Context
	 * @public
	 * @since 1.39.0
	 * @version ${version}
	 */
	var Context = BaseContext.extend("sap.ui.model.odata.v4.Context", {
			constructor : function (oModel, oBinding, sPath, iIndex, oCreatePromise) {
				BaseContext.call(this, oModel, sPath);
				this.oBinding = oBinding;
				this.oCreatePromise = oCreatePromise
					// ensure to return a promise that is resolved w/o data
					&& Promise.resolve(oCreatePromise).then(function () {});
				this.oSyncCreatePromise = oCreatePromise && _SyncPromise.resolve(oCreatePromise);
				this.iIndex = iIndex;
			}
		});

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
	 * Returns a promise that is resolved without data when the entity represented by this context
	 * has been created in the backend. As long as it is not yet resolved or rejected the entity
	 * represented by this context is transient.
	 *
	 * @returns {Promise}
	 *   A promise that is resolved without data when the entity represented by this context has
	 *   been created in the backend. Returns <code>undefined</code> if the context has not been
	 *   created using {@link sap.ui.model.odata.v4.ODataListBinding#create}.
	 *
	 * @public
	 * @since 1.43.0
	 */
	Context.prototype.created = function () {
		return this.oCreatePromise;
	};

	/**
	 * Deletes the OData entity this context points to. The context must be part of a context
	 * binding with an empty path or be part of a list binding.
	 *
	 * The context must not be used anymore after successful deletion.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the DELETE request; if not specified, the update group ID for
	 *   the context's binding is used, see {@link sap.ui.model.odata.v4.ODataModel#bindContext}
	 *   and {@link sap.ui.model.odata.v4.ODataModel#bindList}; the resulting group ID must be
	 *   '$auto' or '$direct'
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure, e.g. if the given context does not point
	 *   to an entity, if it is not part of a list binding, if there are pending changes for the
	 *   context's binding, if the resulting group ID is neither '$auto' nor '$direct', or if the
	 *   deletion on the server fails.
	 *   <p>
	 *   The error instance is flagged with <code>isConcurrentModification</code> in case a
	 *   concurrent modification (e.g. by another user) of the entity between loading and deletion
	 *   has been detected; this should be shown to the user who needs to decide whether to try
	 *   deletion again. If the entity does not exist, we assume it has already been deleted by
	 *   someone else and report success.
	 *
	 * @function
	 * @name sap.ui.model.odata.v4.Context#delete
	 * @public
	 * @since 1.41.0
	 */
	Context.prototype["delete"] = function (sGroupId) {
		var that = this;

		if (this.isTransient()) {
			return that.oBinding._delete(sGroupId, "n/a", that);
		}
		return this.requestCanonicalPath().then(function (sCanonicalPath) {
			return that.oBinding._delete(sGroupId, sCanonicalPath.slice(1), that);
		});
	};

	/**
	 * Deregisters the given change listener.
	 *
	 * @param {string} sPath
	 *   The path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} oListener
	 *   The change listener
	 *
	 * @private
	 */
	Context.prototype.deregisterChange = function (sPath, oListener) {
		this.oBinding.deregisterChange(sPath, oListener, this.iIndex);
	};

	/**
	 * Destroys this context, that is, it removes this context from all dependent bindings and drops
	 * references to binding and model, so that the context cannot be used anymore; it keeps path
	 * and index for debugging purposes.
	 *
	 * @public
	 * @see sap.ui.model.Context#destroy
	 * @since 1.41.0
	 */
	// @override
	Context.prototype.destroy = function () {
		this.oModel.getDependentBindings(this).forEach(function (oDependentBinding) {
			oDependentBinding.setContext(undefined);
		});
		this.oBinding = undefined;
		this.oModel = undefined;
		BaseContext.prototype.destroy.apply(this);
	};

	/**
	 * Delegates to the <code>fetchAbsoluteValue</code> method of this context's binding which
	 * requests the value for the given absolute path including the query string as maintained by
	 * that binding.
	 *
	 * @param {string} sPath
	 *   An absolute path including a query string
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the binding's <code>fetchAbsoluteValue</code> call
	 *
	 * @private
	 */
	Context.prototype.fetchAbsoluteValue = function (sPath) {
		return this.oBinding.fetchAbsoluteValue(sPath);
	};

	/**
	 * Returns a promise for the "canonical path" of the entity for this context.
	 *
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the canonical path (e.g. "/EMPLOYEES(ID='1')") in case of
	 *   success, or rejected with an instance of <code>Error</code> in case of failure, e.g. if
	 *   the given context does not point to an entity
	 *
	 * @private
	 */
	Context.prototype.fetchCanonicalPath = function () {
		return this.oModel.getMetaModel().fetchCanonicalPath(this);
	};

	/**
	 * Delegates to the <code>fetchValue</code> method of this context's binding which requests
	 * the value for the given path, relative to this context, as maintained by that binding.
	 *
	 * @param {string} [sPath]
	 *   A relative path within the JSON structure
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} [oListener]
	 *   A property binding which registers itself as listener at the cache
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the binding's <code>fetchValue</code> call
	 *
	 * @private
	 */
	Context.prototype.fetchValue = function (sPath, oListener) {
		return this.oBinding.fetchValue(sPath || "", oListener, this.iIndex);
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
	 *   The canonical path (e.g. "/EMPLOYEES(ID='1')")
	 * @throws {Error}
	 *   If the canonical path cannot be determined yet or in case of failure, e.g. if the given
	 *   context does not point to an entity
	 *
	 * @function
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getCanonicalPath = _SyncPromise.createGetMethod("fetchCanonicalPath", true);

	/**
	 * Returns the group ID of the context's binding that is used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	Context.prototype.getGroupId = function () {
		return this.oBinding.getGroupId();
	};

	/**
	 * Returns the context's index within the binding's collection. The return value changes if a
	 * new entity is added via {@link sap.ui.model.odata.v4.ODataListBinding#create} or deleted
	 * again.
	 *
	 * @returns {number}
	 *   The context's index within the binding's collection or <code>undefined</code> if the
	 *   context does not belong to a list binding.
	 *
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getIndex = function () {
		if (this.oBinding.aContexts && this.oBinding.aContexts[-1]) {
			return this.iIndex + 1;
		}
		return this.iIndex;
	};

	/**
	 * Returns the value for the given path relative to this context. The function allows access to
	 * the complete data the context points to (if <code>sPath</code> is "") or any part thereof.
	 * The data is a JSON structure as described in
	 * <a href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">
	 * "OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue}.
	 *
	 * Returns <code>undefined</code> if the data is not (yet) available. Use
	 * {@link #requestObject} for asynchronous access.
	 *
	 * @param {string} [sPath=""]
	 *   A relative path within the JSON structure
	 * @returns {any}
	 *   The requested value
	 *
	 * @public
	 * @see sap.ui.model.Context#getObject
	 * @since 1.39.0
	 */
	// @override
	Context.prototype.getObject = function (sPath) {
		var oSyncPromise = this.fetchValue(sPath);

		if (!oSyncPromise.isFulfilled()) {
			return undefined;
		}
		return clone(oSyncPromise.getResult());
	};

	/**
	 * Returns the property value for the given path relative to this context. The path is expected
	 * to point to a structural property with primitive type. Returns <code>undefined</code>
	 * if the data is not (yet) available. Use {@link #requestProperty} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   A relative path within the JSON structure
	 * @param {boolean} [bExternalFormat=false]
	 *   If <code>true</code>, the value is returned in external format using a UI5 type for the
	 *   given property path that formats corresponding to the property's EDM type and constraints.
	 *   If the type is not yet available, <code>undefined</code> is returned.
	 * @returns {any}
	 *   The requested property value
	 * @throws {Error}
	 *   If the value is not primitive
	 *
	 * @public
	 * @see sap.ui.model.Context#getProperty
	 * @see sap.ui.model.odata.v4.ODataMetaModel#requestUI5Type
	 * @since 1.39.0
	 */
	// @override
	Context.prototype.getProperty = function (sPath, bExternalFormat) {
		var oError,
			oSyncPromise = fetchPrimitiveValue(this, sPath, bExternalFormat);

		if (oSyncPromise.isRejected()) {
			oError = oSyncPromise.getResult();
			if (oError.isNotPrimitive) {
				throw oError;
			}
		}
		return oSyncPromise.isFulfilled() ? oSyncPromise.getResult() : undefined;
	};

	/**
	 * Returns the query options for the given path from the associated binding.
	 *
	 * @param {string} sPath
	 *   The path for which the query options are requested
	 * @returns {object}
	 *   The query options from the associated binding for the given path
	 *
	 * @private
	 */
	Context.prototype.getQueryOptions = function (sPath) {
		return _ODataHelper.getQueryOptions(this.oBinding, sPath);
	};

	/**
	 * Returns the group ID of the context's binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	Context.prototype.getUpdateGroupId = function () {
		return this.oBinding.getUpdateGroupId();
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 *
	 * @private
	 */
	Context.prototype.hasPendingChanges = function (sPath) {
		// since we send a path, bAskParent is not needed and set to undefined
		return _ODataHelper.hasPendingChanges(this.oBinding, undefined,
			_Helper.buildPath(this.iIndex, sPath));
	};

	/**
	 * Returns <code>true</code> if this context is transient, which means that the promise returned
	 * by {@link #created} is not yet resolved or rejected.
	 *
	 * @returns {boolean}
	 *   Whether this context is transient
	 *
	 * @public
	 * @since 1.43.0
	 */
	Context.prototype.isTransient = function () {
		var oSyncCreatePromise = this.oSyncCreatePromise;

		return oSyncCreatePromise && (oSyncCreatePromise.getResult() === oSyncCreatePromise);
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
	 *   A promise which is resolved with the canonical path (e.g. "/EMPLOYEES(ID='1')") in case of
	 *   success, or rejected with an instance of <code>Error</code> in case of failure, e.g. if
	 *   the given context does not point to an entity
	 *
	 * @function
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.requestCanonicalPath = _SyncPromise.createRequestMethod("fetchCanonicalPath");

	/**
	 * Returns a promise on the value for the given path relative to this context. The function
	 * allows access to the complete data the context points to (if <code>sPath</code> is "") or
	 * any part thereof. The data is a JSON structure as described in
	 * <a href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">
	 * "OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue}.
	 *
	 * If you want {@link #requestObject} to read fresh data, call
	 * <code>oContext.getBinding().refresh()</code> first.
	 *
	 * @param {string} [sPath=""]
	 *   A relative path within the JSON structure
	 * @returns {Promise}
	 *   A promise on the requested value
	 *
	 * @public
	 * @see #getBinding
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @since 1.39.0
	 */
	Context.prototype.requestObject = function (sPath) {
		return Promise.resolve(this.fetchValue(sPath)).then(function (vResult) {
			return clone(vResult);
		});
	};

	/**
	 * Returns a promise on the property value for the given path relative to this context. The path
	 * is expected to point to a structural property with primitive type.
	 *
	 * @param {string} [sPath]
	 *   A relative path within the JSON structure
	 * @param {boolean} [bExternalFormat=false]
	 *   If <code>true</code>, the value is returned in external format using a UI5 type for the
	 *   given property path that formats corresponding to the property's EDM type and constraints.
	 * @returns {Promise}
	 *   A promise on the requested value; it is rejected if the value is not primitive
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataMetaModel#requestUI5Type
	 * @since 1.39.0
	 */
	Context.prototype.requestProperty = function (sPath, bExternalFormat) {
		return Promise.resolve(fetchPrimitiveValue(this, sPath, bExternalFormat));
	};

	/**
	 * Resets all pending changes for a given <code>sPath</code>.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 *
	 * @private
	 */
	Context.prototype.resetChanges = function (sPath) {
		// since we send a path, bAskParent is not needed and set to undefined
		_ODataHelper.resetChanges(this.oBinding, undefined, _Helper.buildPath(this.iIndex, sPath));
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
	 * Delegates to the <code>updateValue</code> method of this context's binding which updates the
	 * value for the given path, relative to this context, as maintained by that binding.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for this update call.
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} [sEditUrl]
	 *   The edit URL corresponding to the entity to be updated
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the binding's <code>updateValue</code> call
	 *
	 * @private
	 */
	Context.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl, sPath) {
		var that = this;

		sPath = _Helper.buildPath(this.iIndex, sPath);

		if (this.isTransient()) {
			// Note: must not be falsy, otherwise a parent context would insert its own edit URL
			sEditUrl = "n/a";
		}
		if (sEditUrl) {
			return this.oBinding.updateValue(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
		}

		return this.requestCanonicalPath().then(function (sEditUrl) {
			return that.oBinding.updateValue(sGroupId, sPropertyName, vValue, sEditUrl.slice(1),
				sPath);
		});
	};

	return {
		/**
		 * Creates a context for an OData V4 model.
		 *
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel
		 *   The model
		 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding} oBinding
		 *   A binding that belongs to the model
		 * @param {string} sPath
		 *   An absolute path without trailing slash
		 * @param {number} [iIndex]
		 *   Index of item represented by this context, used by list bindings, not context bindings
		 * @param {Promise} [oCreatePromise]
		 *   Promise returned by {@link #created}
		 * @returns {sap.ui.model.odata.v4.Context}
		 *   A context for an OData V4 model
		 * @throws {Error}
		 *   If an invalid path is given
		 *
		 * @private
		 */
		create : function (oModel, oBinding, sPath, iIndex, oCreatePromise) {
			if (sPath[0] !== "/") {
				throw new Error("Not an absolute path: " + sPath);
			}
			if (sPath.slice(-1) === "/") {
				throw new Error("Unsupported trailing slash: " + sPath);
			}
			return new Context(oModel, oBinding, sPath, iIndex, oCreatePromise);
		}
	};
}, /* bExport= */ false);
