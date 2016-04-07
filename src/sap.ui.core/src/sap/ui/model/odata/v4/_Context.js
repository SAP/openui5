/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/Context"
], function (Context) {
	"use strict";

	/**
	 * @class Implementation of an OData V4 model's context.
	 *
	 * @alias sap.ui.model.odata.v4._Context
	 * @author SAP SE
	 * @extends sap.ui.model.Context
	 * @private
	 * @version ${version}
	 */
	var _Context = Context.extend("sap.ui.model.odata.v4._Context", {
			/**
			 * Do <strong>NOT</strong> call this private constructor for a new
			 * <code>_Context</code>, but rather use
			 * {@link sap.ui.model.odata.v4._Context.create create} instead.
			 *
			 * @param {sap.ui.model.odata.v4.ODataModel} oModel
			 *   The model
			 * @param {sap.ui.model.Binding} oBinding
			 *   A binding that belongs to the model
			 * @param {string} sPath
			 *   An absolute path without trailing slash
			 * @param {number} [iIndex]
			 *   Index of item (within the collection addressed by <code>sPath</code>) represented
			 *   by this context; used by list bindings, not context bindings
			 *
			 * @private
			 */
			constructor : function (oModel, oBinding, sPath, iIndex) {
				Context.call(this, oModel, sPath);
				this.oBinding = oBinding;
				this.iIndex = iIndex;
			}
		});

	/**
	 * Cannot access data synchronously, use {@link #requestValue} instead.
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Context#getObject
	 * @since 1.37.0
	 */
	// @override
	_Context.prototype.getObject = function () {
		throw new Error("No synchronous access to data");
	};

	/**
	 * Cannot access data synchronously, use {@link #requestValue} instead.
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Context#getProperty
	 * @since 1.37.0
	 */
	// @override
	_Context.prototype.getProperty = function () {
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
	 * @public
	 * @since 1.37.0
	 */
	_Context.prototype.requestValue = function (sPath) {
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
	_Context.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl, sPath) {
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
	 * @since 1.37.0
	 */
	_Context.prototype.toString = function () {
		return this.iIndex === undefined ? this.sPath : this.sPath + "[" + this.iIndex + "]";
	};

	return {
		/**
		 * Creates a context for an OData V4 model.
		 *
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel
		 *   The model
		 * @param {sap.ui.model.Binding} oBinding
		 *   A binding that belongs to the model
		 * @param {string} sPath
		 *   An absolute path without trailing slash
		 * @param {number} [iIndex]
		 *   Index of item represented by this context, used by list bindings, not context bindings
		 * @returns {sap.ui.model.Context}
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
			return new _Context(oModel, oBinding, sPath, iIndex);
		}
	};
}, /* bExport= */ false);
