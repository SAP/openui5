/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/Context",
	"./lib/_SyncPromise"
], function (BaseContext, _SyncPromise) {
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
	 * Do <strong>NOT</strong> call this private constructor for a new <code>Context</code>. In the
	 * OData V4 model you cannot create contexts at will: retrieve them from a binding or a view
	 * element instead.
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
	 *
	 * @alias sap.ui.model.odata.v4.Context
	 * @author SAP SE
	 * @class Implementation of an OData V4 model's context.
	 *
	 *   The context is a pointer to model data as returned by a query from a
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding context binding} or a
	 *   {@link sap.ui.model.odata.v4.ODataListBinding list binding}. Contexts are always and only
	 *   created by such bindings. A context for a context binding points to the complete query
	 *   result. A context for a list binding points to one specific entry in the binding's
	 *   collection. A property binding does not have a context, you can access its value via
	 *   {@link sap.ui.model.odata.v4.ODataPropertyBinding#getValue getValue}.
	 *
	 *   Applications can access model data only via a context, either synchronously with the risk
	 *   that the values are not available yet ({@link #getProperty} and {@link #getObject}) or
	 *   asynchronously ({@link #requestProperty} and {@link #requestObject}).
	 * @extends sap.ui.model.Context
	 * @public
	 * @version ${version}
	 */
	var Context = BaseContext.extend("sap.ui.model.odata.v4.Context", {
			constructor : function (oModel, oBinding, sPath, iIndex) {
				BaseContext.call(this, oModel, sPath);
				this.oBinding = oBinding;
				this.iIndex = iIndex;
			}
		});

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
	 * Returns the context's index within the binding's collection.
	 *
	 * @returns {number}
	 *   The context's index within the binding's collection or <code>undefined</code> if the
	 *   context does not belong to a list binding.
	 *
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getIndex = function () {
		return this.iIndex;
	};

	/**
	 * Returns the value for the given path relative to this context. The function allows access to
	 * the complete data the context points to (when <code>sPath</code> is "") or any part thereof.
	 * The data is a JSON structure as described in
	 * <a href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">"OData JSON Format Version 4.0"</a>.
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
	 * Delegates to the <code>fetchValue</code> method of this context's binding which requests
	 * the value for the given path, relative to this context, as maintained by that binding.
	 *
	 * @param {string} [sPath]
	 *   A relative path within the JSON structure
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the binding's <code>requestValue</code> call
	 *
	 * @private
	 */
	Context.prototype.fetchValue = function (sPath) {
		return this.oBinding.fetchValue(sPath, this.iIndex);
	};

	/**
	 * Returns a promise on the value for the given path relative to this context. The function
	 * allows access to the complete data the context points to (when <code>sPath</code> is "") or
	 * any part thereof. The data is a JSON structure as described in
	 * <a href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">"OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue}.
	 *
	 * @param {string} [sPath=""]
	 *   A relative path within the JSON structure
	 * @returns {Promise}
	 *   A promise on the requested value
	 *
	 * @public
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

		if (this.iIndex !== undefined) {
			sPath = this.iIndex + (sPath ? "/" + sPath : "");
		}

		if (sEditUrl) {
			return this.oBinding.updateValue(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
		}

		return this.oModel.requestCanonicalPath(this).then(function (sEditUrl) {
			return that.oBinding.updateValue(sGroupId, sPropertyName, vValue, sEditUrl.slice(1),
				sPath);
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
		return this.iIndex === undefined ? this.sPath : this.sPath + "[" + this.iIndex + "]";
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
		 * @returns {sap.ui.model.odata.v4.Context}
		 *   A context for an OData V4 model
		 * @throws {Error}
		 *   If an invalid path is given
		 *
		 * @private
		 */
		create : function (oModel, oBinding, sPath, iIndex) {
			if (sPath[0] !== "/") {
				throw new Error("Not an absolute path: " + sPath);
			}
			if (sPath.slice(-1) === "/") {
				throw new Error("Unsupported trailing slash: " + sPath);
			}
			return new Context(oModel, oBinding, sPath, iIndex);
		}
	};
}, /* bExport= */ false);
