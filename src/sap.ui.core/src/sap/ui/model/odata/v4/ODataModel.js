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
	"sap/ui/model/Model",
	"sap/ui/thirdparty/URI",
	"./lib/_MetadataRequestor",
	"./lib/_Requestor",
	"./_ODataHelper",
	"./ODataContextBinding",
	"./ODataListBinding",
	"./ODataMetaModel",
	"./ODataPropertyBinding"
], function(jQuery, Model, URI, MetadataRequestor, Requestor, Helper, ODataContextBinding,
		ODataListBinding, ODataMetaModel, ODataPropertyBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		// /TEAMS[2];root=0/Name or /TEAMS('4711');root=0/Name
		rRootBindingPath = /^\/.+(?:(?:\[(\d+)\])|(?:\(.+\)));root=(\d+)(?:\/(.+))?$/;

	/**
	 * Throws an error for a not yet implemented method with the given name called by the SAPUI5
	 * framework. The error message includes the arguments to the method call.
	 * @param {string} sMethodName The method name
	 * @param {object} args The arguments passed to this method when called by SAPUI5
	 */
	function notImplemented(sMethodName, args) {
		var sArgs;

		try {
			sArgs = JSON.stringify(args);
		} catch (e) {
			sArgs = "JSON.stringify error for arguments "  + String(args);
		}
		throw new Error("Not implemented method v4.ODataModel." + sMethodName
			+ " called with arguments " + sArgs);
	}

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
	 * @throws {Error} If the given service root URL does not end with a forward slash or if
	 *   OData system query options or parameter aliases are specified as parameters
	 *
	 * @class Model implementation for OData v4.
	 *
	 * @author SAP SE
	 * @alias sap.ui.model.odata.v4.ODataModel
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
					this.mUriParameters = Helper.buildQueryOptions(jQuery.extend({},
						oUri.query(true), mParameters && mParameters.serviceUrlParams));
					this.sServiceUrl = oUri.query("").toString();

					this.oMetaModel = new ODataMetaModel(
						MetadataRequestor.create(mHeaders, this.mUriParameters),
						this.sServiceUrl + "$metadata");
					this.oRequestor = Requestor.create(this.sServiceUrl, mHeaders,
						this.mUriParameters);
					this.aRoots = [];
				}
			});

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
	 *   The binding path in the model
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
	 * @public
	 */
	ODataModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		var oContextBinding = new ODataContextBinding(this, sPath, oContext, this.aRoots.length,
				mParameters);

		this.aRoots.push(oContextBinding);
		return oContextBinding;
	};

	/**
	 * Creates a new list binding for the given path and optional context which must
	 * resolve to an absolute OData path for an entity set.
	 *
	 * @param {string} sPath
	 *   The binding path in the model
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
	 * @return {sap.ui.model.odata.v4.ODataListBinding}
	 *   The list binding
	 * @throws {Error} When disallowed OData query options are provided
	 * @public
	 */
	ODataModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
		var oListBinding = new ODataListBinding(this, sPath, oContext, this.aRoots.length,
				mParameters);

		this.aRoots.push(oListBinding);
		return oListBinding;
	};

	/**
	 * Creates a new property binding for the given path. This binding is inactive and will not
	 * know the property value initially. You have to call {@link sap.ui.model.Binding#initialize
	 * initialize()} to get it updated asynchronously and register a change listener at the binding
	 * to be informed when the value is available.
	 *
	 * @param {string} sPath
	 *   The binding path in the model
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
	 * @public
	 */
	ODataModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataPropertyBinding(this, sPath, oContext, mParameters);
	};

	ODataModel.prototype.bindTree = function () {
		notImplemented("bindTree", arguments);
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

	ODataModel.prototype.createBindingContext = function () {
		notImplemented("createBindingContext", arguments);
	};

	ODataModel.prototype.destroyBindingContext = function () {
		notImplemented("destroyBindingContext", arguments);
	};

	/**
	 * Returns the meta model for this ODataModel
	 *
	 * @returns {sap.ui.model.odata.v4.ODataMetaModel}
	 *   The meta model for this ODataModel
	 * @public
	 */
	ODataModel.prototype.getMetaModel = function () {
		return this.oMetaModel;
	};

	ODataModel.prototype.getProperty = function () {
		notImplemented("getProperty", arguments);
	};

	/**
	 * Triggers a GET request to this model's OData service. The data will be stored in the model.
	 *
	 * @param {string} sPath
	 *   An absolute data binding path to the data which should be retrieved
	 * @param {boolean} [bAllowObjectAccess=false]
	 *   Whether access to whole objects is allowed
	 * @returns {Promise}
	 *   A promise to be resolved when the OData request is finished, providing a data object
	 *   just like the OData v4 JSON format, e.g. <code>{"value" : "foo"}</code> for simple
	 *   properties, <code>{"value" : [...]}</code> for collections and
	 *   <code>{"foo" : "bar", ...}</code> for objects
	 *
	 * @protected
	 */
	ODataModel.prototype.read = function (sPath, bAllowObjectAccess) {
		var that = this;

		if (sPath[0] !== "/") {
			throw new Error("Not an absolute data binding path: " + sPath);
		}

		return new Promise(function (fnResolve, fnReject) {
			var aMatches = rRootBindingPath.exec(sPath);

			if (aMatches) { // use list binding to retrieve the value
				that.aRoots[Number(aMatches[2])]
					.readValue(aMatches[3], bAllowObjectAccess, Number(aMatches[1]))
					.then(function (oValue) {
						// property access: wrap property value just like OData does
						fnResolve(typeof oValue === "object" && !Array.isArray(oValue)
							? oValue
							: {value : oValue});
					}, function (oError) {
						fnReject(oError);
					});
				return;
			}
		});
	};

	/**
	 * Refreshes the model by calling refresh on all bindings which have a change event handler
	 * attached. <code>bForceUpdate</code> has to be <code>true</code>.
	 * If <code>bForceUpdate</code> is not given or <code>false</code>, an error is thrown.
	 *
	 * @param {boolean} bForceUpdate
	 *   The parameter <code>bForceUpdate</code> has to be <code>true</code>.
	 * @throws {Error} When <code>bForceUpdate</code> is not given or <code>false</code>
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataPropertyBinding#refresh
	 */
	ODataModel.prototype.refresh = function (bForceUpdate) {
		if (!bForceUpdate) {
			throw new Error("Falsy values for bForceUpdate are not supported");
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
	 * @public
	 */
	ODataModel.prototype.remove = function (oContext) {
		var sPath = oContext.getPath(),
			that = this;

		return Promise.all([
			this.read(sPath + "/@odata.etag"),
			this.getMetaModel().requestCanonicalUrl("", sPath, this.read.bind(this))
		]).then(function (aValues) {
			var sEtag = aValues[0].value,
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
	 */
	ODataModel.prototype.requestCanonicalPath = function (oEntityContext) {
		jQuery.sap.assert(oEntityContext.getModel() === this,
				"oEntityContext must belong to this model");
		return this.getMetaModel()
			.requestCanonicalUrl("/", oEntityContext.getPath(), this.read.bind(this));
	};

	return ODataModel;

}, /* bExport= */ true);
