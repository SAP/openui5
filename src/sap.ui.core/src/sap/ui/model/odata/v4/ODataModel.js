/*!
 * ${copyright}
 */

/**
 * Model and related classes like bindings for OData v4.
 *
 * @namespace
 * @name sap.ui.model.odata.v4
 * @public
 */

//Provides class sap.ui.model.odata.v4.ODataModel
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Model",
	"sap/ui/thirdparty/URI",
	"./_ODataHelper",
	"./lib/_MetadataRequestor",
	"./lib/_Requestor",
	"./ODataContextBinding",
	"./ODataListBinding",
	"./ODataMetaModel",
	"./ODataPropertyBinding"
], function(jQuery, BindingMode, Model, URI, _ODataHelper, _MetadataRequestor, _Requestor,
		ODataContextBinding, ODataListBinding, ODataMetaModel, ODataPropertyBinding) {

	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		mSupportedEvents = {
			messageChange : true
		};

	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {string} [sServiceUrl]
	 *   Root URL of the service to request data from; it is required, but may also be given via
	 *   <code>mParameters.serviceUrl</code>. Must end with a forward slash according to OData v4
	 *   specification ABNF, rule "serviceRoot" unless you append OData custom query options
	 *   to the service root URL separated with a "?", e.g. "/MyService/?custom=foo". See parameter
	 *   <code>mParameters.serviceUrlParams</code> for details on custom query options.
	 * @param {object} [mParameters]
	 *   The parameters
	 * @param {string} [mParameters.defaultGroup]
	 *   Set to '$direct' to send requests directly, i.e. without batch
	 * @param {string} [mParameters.serviceUrl]
	 *   Root URL of the service to request data from as specified for the parameter
	 *   <code>sServiceUrl</code>; only used if the parameter <code>sServiceUrl</code> has not been
	 *   given
	 * @param {object} [mParameters.serviceUrlParams]
	 *   Map of OData custom query options to be used in each data service request for this model,
	 *   see specification "OData Version 4.0 Part 2: URL Conventions", "5.2 Custom Query Options".
	 *   OData system query options
	 *   and OData parameter aliases lead to an error.
	 *   Query options from this map overwrite query options with the same name specified via the
	 *   <code>sServiceUrl</code> parameter.
	 * @throws {Error} If the given service root URL does not end with a forward slash, if
	 *   OData system query options or parameter aliases are specified as parameters or if a
	 *   default group different from '$direct' is given
	 *
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @author SAP SE
	 * @class Model implementation for OData v4.
	 *   An event handler can only be attached to this model for the following event:
	 *   'messageChange', see {@link sap.ui.core.messages.MessageProcessor#messageChange
	 *   messageChange}.
	 *   For other events, an error is thrown.
	 * @extends sap.ui.model.Model
	 * @public
	 * @version ${version}
	 */
	var ODataModel = Model.extend(sClassName,
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */
			{
				constructor : function (sServiceUrl, mParameters) {
					var mHeaders = {
							"Accept-Language" : sap.ui.getCore().getConfiguration().getLanguageTag()
						},
						oUri;

					// do not pass any parameters to Model
					Model.apply(this);

					if (typeof sServiceUrl === "object") {
						mParameters = sServiceUrl;
						sServiceUrl = mParameters.serviceUrl;
					}
					if (!sServiceUrl) {
						throw new Error("Missing service root URL");
					}
					oUri = new URI(sServiceUrl);
					if (oUri.path()[oUri.path().length - 1] !== "/") {
						throw new Error("Service root URL must end with '/'");
					}
					this._sQuery = oUri.search(); //return query part with leading "?"
					this.mUriParameters = _ODataHelper.buildQueryOptions(jQuery.extend({},
						oUri.query(true), mParameters && mParameters.serviceUrlParams));
					this.sServiceUrl = oUri.query("").toString();
					this.sGroupId = mParameters && mParameters.defaultGroup;
					// map sGroupId to corresponding parameter value for _Requestor#request
					if (this.sGroupId === undefined) {
						this.sGroupId = "";
					} else if (this.sGroupId === "$direct") {
						this.sGroupId = undefined;
					} else {
						throw new Error("Default service group must be '$direct'");
					}

					this.oMetaModel = new ODataMetaModel(
						_MetadataRequestor.create(mHeaders, this.mUriParameters),
						this.sServiceUrl + "$metadata");
					this.oRequestor = _Requestor.create(this.sServiceUrl, mHeaders,
						this.mUriParameters);
					this.mDataRequestedCallbacks = {};
					this.sDefaultBindingMode = BindingMode.TwoWay;
					this.mSupportedBindingModes = {
						OneTime : true,
						OneWay : true,
						TwoWay : true
					};
				}
			});

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataModel.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataModel#attachEvent");
		}
		return Model.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Informs the model that a request has been added to the given group.
	 *
	 * @param {string} sGroupId
	 *   ID of the batch group which should be sent as an OData batch request
	 * @param {function} fnBatchRequestSent
	 *   a function that is called synchronously after the batch request has been sent
	 *
	 * @private
	 */
	ODataModel.prototype.dataRequested = function (sGroupId, fnBatchRequestSent) {
		var that = this,
			aCallbacks = this.mDataRequestedCallbacks[sGroupId];

		if (sGroupId === undefined) {
			fnBatchRequestSent();
			return;
		}

		if (aCallbacks) {
			aCallbacks.push(fnBatchRequestSent);
		} else {
			aCallbacks = this.mDataRequestedCallbacks[sGroupId] = [fnBatchRequestSent];
			sap.ui.getCore().addPrerenderingTask(function () {
				delete that.mDataRequestedCallbacks[sGroupId];
				that.oRequestor.submitBatch(sGroupId);
				aCallbacks.forEach(function (fnCallback) {
					fnCallback();
				});
			});
		}
	};

	/**
	 * Creates a new context binding for the given path and context. The key value pairs from the
	 * given parameters map combined with the query options provided in the
	 * {@link sap.ui.model.odata.v4.ODataModel model constructor} are used as OData query options in
	 * each data service request. Query options specified for the binding overwrite model query
	 * options.
	 *
	 * This binding is inactive and will not know the bound context initially.
	 * You have to call {@link sap.ui.model.Binding#initialize initialize()} to get it updated
	 * asynchronously and register a change listener at the binding to be informed when the bound
	 * context is available.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of OData query options as specified in "OData Version 4.0 Part 2: URL Conventions".
	 *   The following query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   The context binding
	 * @throws {Error} When disallowed OData query options are provided
	 *
	 * @public
	 * @see sap.ui.model.Model#bindContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ODataContextBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Creates a new list binding for the given path and optional context which must
	 * resolve to an absolute OData path for an entity set.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter[]} [aSorters]
	 *   Initial sort order
	 * @param {sap.ui.model.Filter[]} [aFilters]
	 *   Predefined filters
	 * @param {object} [mParameters]
	 *   Map of OData query options as specified in "OData Version 4.0 Part 2: URL Conventions".
	 *   The following query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   The list binding
	 * @throws {Error} When disallowed OData query options are provided
	 *
	 * @public
	 * @see sap.ui.model.Model#bindList
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
		if (aFilters) {
			throw new Error("Unsupported operation: v4.ODataModel#bindList, "
					+ "aSorters parameter must not be set");
		}
		if (aSorters) {
			throw new Error("Unsupported operation: v4.ODataModel#bindList, "
				+ "aFilters parameter must not be set");
		}
		return new ODataListBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Creates a new property binding for the given path. This binding is inactive and will not
	 * know the property value initially. You have to call {@link sap.ui.model.Binding#initialize
	 * initialize()} to get it updated asynchronously and register a change listener at the binding
	 * to be informed when the value is available.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of OData query options where only "5.2 Custom Query Options" are allowed (see
	 *   specification "OData Version 4.0 Part 2: URL Conventions"), except for those with a name
	 *   starting with "sap-". All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @returns {sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   The property binding
	 * @throws {Error} When parameters are provided
	 *
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#bindTree
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindTree = function () {
		throw new Error("Unsupported operation: v4.ODataModel#bindTree");
	};

	/**
	 * Creates a new entity from the given data in the collection pointed to by the given path.
	 *
	 * @param {string} sPath
	 *   An absolute data binding path pointing to an entity set, e.g. "/EMPLOYEES"
	 * @param {object} oEntityData
	 *   The new entity's properties, e.g.
	 *   <code>{"ID" : "1", "AGE" : 52, "ENTRYDATE" : "1977-07-24", "Is_Manager" : false}</code>
	 * @returns {Promise}
	 *   A promise which is resolved with the server's response data in case of success, or
	 *   rejected with an instance of <code>Error</code> in case of failure
	 *
	 * @private
	 */
	ODataModel.prototype.create = function (sPath, oEntityData) {
		var sResourcePath = sPath.slice(1) + this._sQuery;

		return this.oRequestor.request("POST", sResourcePath, undefined, null, oEntityData);
	};

	/**
	 * Cannot create contexts at this model at will; retrieve them from a binding instead.
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#createBindingContext
	 * @see sap.ui.model.odata.v4.ODataContextBinding#getBoundContext
	 * @see sap.ui.model.odata.v4.ODataListBinding#getCurrentContexts
	 * @since 1.37.0
	 */
	ODataModel.prototype.createBindingContext = function () {
		throw new Error("Unsupported operation: v4.ODataModel#createBindingContext");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#destroyBindingContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.destroyBindingContext = function () {
		throw new Error("Unsupported operation: v4.ODataModel#destroyBindingContext");
	};

	/**
	 * Cannot get a shared context for a path. Contexts are created by bindings instead and there
	 * may be multiple contexts for the same path.
	 *
	 * @throws {Error}
	 *
	 * @private
	 * @see sap.ui.model.Model#getContext
	 */
	// @override
	ODataModel.prototype.getContext = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getContext");
	};

	/**
	 * Returns the model's group ID as needed by
	 * {@link sap.ui.model.odata.v4.lib._Requestor#request}.
	 *
	 * @returns {string}
	 *   The group id
	 *
	 * @private
	 */
	ODataModel.prototype.getGroupId = function () {
		return this.sGroupId;
	};

	/**
	 * Returns the meta model for this ODataModel.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataMetaModel}
	 *   The meta model for this ODataModel
	 *
	 * @public
	 * @see sap.ui.model.Model#getMetaModel
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.getMetaModel = function () {
		return this.oMetaModel;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getOriginalProperty
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.getOriginalProperty = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getOriginalProperty");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getProperty
	 * @since 1.37.0
	 */
	ODataModel.prototype.getProperty = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getProperty");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#isList
	 * @since 1.37.0
	 */
	ODataModel.prototype.isList = function () {
		throw new Error("Unsupported operation: v4.ODataModel#isList");
	};

	/**
	 * Refreshes the model by calling refresh on all bindings which have a change event handler
	 * attached. <code>bForceUpdate</code> has to be <code>true</code>.
	 * If <code>bForceUpdate</code> is not <code>true</code> or <code>sGroupId</code> is set, an
	 * error is thrown.
	 *
	 * @param {boolean} bForceUpdate
	 *   The parameter <code>bForceUpdate</code> has to be <code>true</code>.
	 * @param {string} [sGroupId]
	 *   The parameter <code>sGroupId</code> is not supported.
	 * @throws {Error} When <code>bForceUpdate</code> is not <code>true</code> or
	 *   <code>sGroupId</code> is set or refresh on this binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Model#refresh
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataPropertyBinding#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.refresh = function (bForceUpdate, sGroupId) {
		if (bForceUpdate !== true) {
			throw new Error("Unsupported operation: v4.ODataModel#refresh, "
					+ "bForceUpdate must be true");
		}
		if (sGroupId !== undefined) {
			throw new Error("Unsupported operation: v4.ODataModel#refresh, "
				+ "sGroupId parameter must not be set");
		}
		this.aBindings.slice().forEach(function (oBinding) {
			if (oBinding.oCache) { // relative bindings have no cache and cannot be refreshed
				oBinding.refresh(bForceUpdate);
			}
		});
	};

	/**
	 * Removes the entity with the given context from the service, using the currently known
	 * entity tag ("ETag") value.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   A context in the data model pointing to an entity. It MUST be related to some list
	 *   binding's context because you can only remove data from the model which has been read
	 *   into the model before.
	 * @returns {Promise}
	 *   A promise which is resolved in case of success, or rejected with an instance of
	 *   <code>Error</code> in case of failure. The error instance is flagged with
	 *   <code>isConcurrentModification</code> in case a concurrent modification (e.g. by another
	 *   user) of the entity between loading and removal has been detected; this should be shown
	 *   to the user who needs to decide whether to try removal again. If the entity does not exist,
	 *   we assume it has already been deleted by someone else and report success.
	 *
	 * @private
	 */
	ODataModel.prototype.remove = function (oContext) {
		var sPath = oContext.getPath(),
			that = this;

		return Promise.all([
			oContext.requestValue("@odata.etag"),
			this.oMetaModel.requestCanonicalUrl("", sPath, oContext)
		]).then(function (aValues) {
			var sEtag = aValues[0],
				sResourcePath = aValues[1] + that._sQuery; // "canonical path" w/o service URL

			return that.oRequestor.request("DELETE", sResourcePath, undefined, {"If-Match" : sEtag})
				["catch"](function (oError) {
					if (oError.status === 404) {
						return; // map 404 to 200, i.e. resolve if already deleted
					}
					throw oError;
				});
		});
	};

	/**
	 * Returns a promise for the "canonical path" of the entity for the given context.
	 * According to "4.3.1 Canonical URL" of the specification "OData Version 4.0 Part 2: URL
	 * Conventions", this is the "name of the entity set associated with the entity followed by the
	 * key predicate identifying the entity within the collection".
	 * Use the canonical path in {@link sap.ui.core.Element#bindElement} to create an element
	 * binding.
	 *
	 * @param {sap.ui.model.Context} oEntityContext
	 *   A context in this model which must point to a non-contained OData entity
	 * @returns {Promise}
	 *   A promise which is resolved with the canonical path (e.g. "/EMPLOYEES(ID='1')") in case of
	 *   success, or rejected with an instance of <code>Error</code> in case of failure, e.g. when
	 *   the given context does not point to an entity
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.requestCanonicalPath = function (oEntityContext) {
		jQuery.sap.assert(oEntityContext.getModel() === this,
				"oEntityContext must belong to this model");
		return this.oMetaModel
			.requestCanonicalUrl("/", oEntityContext.getPath(), oEntityContext);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#setLegacySyntax
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.setLegacySyntax = function () {
		throw new Error("Unsupported operation: v4.ODataModel#setLegacySyntax");
	};

	return ODataModel;

}, /* bExport= */ true);
