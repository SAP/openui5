/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/Context"
], function (Context) {
	"use strict";

	/**
	 * @class Implementation of an OData v4 model's context.
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
	 * @public
	 * @throws {Error}
	 */
	_Context.prototype.getObject = function () {
		throw new Error("No synchronous access to data");
	};

	/**
	 * Cannot access data synchronously, use {@link #requestValue} instead.
	 *
	 * @public
	 * @throws {Error}
	 */
	_Context.prototype.getProperty = function () {
		throw new Error("No synchronous access to data");
	};

	/**
	 * Delegates to this context's binding <code>requestValue</code> method which requests the
	 * value for the given path, relative to this context, as maintained by that binding.
	 *
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the binding's <code>requestValue</code> call
	 * @public
	 */
	_Context.prototype.requestValue = function (sPath) {
		return this.oBinding.requestValue(sPath, this.iIndex);
	};

	return {
		/**
		 * Creates a context for an OData v4 model.
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
		 *   A context for an OData v4 model
		 * @throws {Error}
		 *   If an invalid path is given
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
