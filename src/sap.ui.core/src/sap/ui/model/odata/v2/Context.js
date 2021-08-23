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
			constructor : function (oModel, sPath, sDeepPath) {
				BaseContext.call(this, oModel, sPath);
				// whether this context references a newly created transient entity; supported
				// values are:
				// - undefined: entity has not been created on client side,
				// - true: created on the client but not yet persisted in the back end,
				// - false: created on the client and persisted in the back end
				this.bCreated = undefined;
				// the absolute path including all intermediate paths of the binding hierarchy;
				// used to compute the full target of messages
				this.sDeepPath = sDeepPath || sPath;
				// whether dependent bindings need to be refreshed
				this.bForceRefresh = false;
				// whether this context's path may be used to create the request URL for dependent
				// bindings even if no data has been loaded for the context's entity
				this.bPreliminary = false;
				// whether the context is updated, e.g. path changed from a preliminary path to the
				// canonical one
				this.bUpdated = false;
			}
		});


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
	Context.prototype.hasChanged = function() {
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
	 * For a context created using {@link sap.ui.model.odata.v2.ODataModel#createEntry}, the method
	 * returns <code>true</code> if the context is transient or <code>false</code> if the context is
	 * not transient. A transient context represents an entity created on the client which has not
	 * been persisted in the back end.
	 *
	 * @returns {boolean}
	 *   Whether this context is transient if it has been created using
	 *   {@link sap.ui.model.odata.v2.ODataModel#createEntry}; returns <code>undefined</code> if the
	 *   context has not been created using {@link sap.ui.model.odata.v2.ODataModel#createEntry}
	 *
	 * @public
	 * @since 1.94.0
	 */
	Context.prototype.isTransient = function () {
		return this.bCreated;
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