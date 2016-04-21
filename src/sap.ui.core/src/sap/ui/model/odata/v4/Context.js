/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/Context"
], function (BaseContext) {
	"use strict";

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
	 * Returns the context's list index within the binding.
	 *
	 * @returns {number}
	 *   The context's list index within the binding or <code>undefined</code> if the context does
	 *   not belong to a list binding.
	 *
	 * @public
	 * @since 1.39.0
	 */
	Context.prototype.getIndex = function () {
		return this.iIndex;
	};

	/**
	 * Cannot access data synchronously, use {@link #requestValue} instead.
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Context#getObject
	 * @since 1.39.0
	 */
	// @override
	Context.prototype.getObject = function () {
		throw new Error("No synchronous access to data");
	};

	/**
	 * Cannot access data synchronously, use {@link #requestValue} instead.
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Context#getProperty
	 * @since 1.39.0
	 */
	// @override
	Context.prototype.getProperty = function () {
		throw new Error("No synchronous access to data");
	};

	/**
	 * Delegates to the <code>requestValue</code> method of this context's binding which requests
	 * the value for the given path, relative to this context, as maintained by that binding.
	 *
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the binding's <code>requestValue</code> call
	 *
	 * @private
	 */
	Context.prototype.requestValue = function (sPath) {
		return this.oBinding.requestValue(sPath, this.iIndex);
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
