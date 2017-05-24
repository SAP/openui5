/*!
 * ${copyright}
 */

/**
 * Model and related classes like bindings for OData V4.
 *
 * @name sap.ui.model.odata.v4
 * @namespace
 * @public
 * @since 1.37.0
 */

//Provides class sap.ui.model.odata.v4.ODataModel
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/message/Message",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/thirdparty/URI",
	"./lib/_MetadataRequestor",
	"./lib/_Requestor",
	"./lib/_Parser",
	"./ODataContextBinding",
	"./ODataListBinding",
	"./ODataMetaModel",
	"./ODataPropertyBinding"
], function (jQuery, Message, BindingMode, BaseContext, Model, OperationMode, URI,
		_MetadataRequestor, _Requestor, _Parser, ODataContextBinding, ODataListBinding,
		ODataMetaModel, ODataPropertyBinding) {

	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		rApplicationGroupID = /^\w+$/,
		rGroupID = /^(\$auto|\$direct|\w+)$/,
		mSupportedEvents = {
			messageChange : true
		},
		mSupportedParameters = {
			annotationURI : true,
			autoExpandSelect : true,
			groupId : true,
			operationMode : true,
			serviceUrl : true,
			supportReferences : true,
			synchronizationMode : true,
			updateGroupId : true
		},
		// system query options allowed in mParameters
		aSystemQueryOptions = ["$apply", "$count", "$expand", "$filter", "$orderby", "$search",
			"$select"],
		// system query options allowed within a $expand query option
		aExpandQueryOptions = ["$count", "$expand", "$filter", "$levels", "$orderby", "$search",
			"$select"];

	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {object} mParameters
	 *   The parameters
	 * @param {string|string[]} [mParameters.annotationURI]
	 *   The URL (or an array of URLs) from which the annotation metadata are loaded.
	 *   The annotation files are merged into the service metadata in the given order (last one
	 *   wins). The same annotations are overwritten; if an annotation file contains other elements
	 *   (like a type definition) that are already merged, an error is thrown.
	 *   Supported since 1.41.0
	 * @param {boolean} [mParameters.autoExpandSelect=false]
	 *   Whether the OData model's bindings automatically generate $select and $expand system query
	 *   options from the binding hierarchy.
	 *   Note: Dynamic changes to the binding hierarchy are not supported.
	 *   Supported since 1.47.0
	 * @param {string} [mParameters.groupId="$auto"]
	 *   Controls the model's use of batch requests: '$auto' bundles requests from the model in a
	 *   batch request which is sent automatically before rendering; '$direct' sends requests
	 *   directly without batch; other values result in an error
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode for sorting and filtering with the model's operation mode as default.
	 *   Since 1.39.0, the operation mode {@link sap.ui.model.odata.OperationMode.Server} is
	 *   supported. All other operation modes including <code>undefined</code> lead to an error if
	 *   'vFilters' or 'vSorters' are given or if {@link #filter} or {@link #sort} is called.
	 * @param {string} mParameters.serviceUrl
	 *   Root URL of the service to request data from. The path part of the URL must end with a
	 *   forward slash according to OData V4 specification ABNF, rule "serviceRoot". You may append
	 *   OData custom query options to the service root URL separated with a "?", for example
	 *   "/MyService/?custom=foo".
	 *   See specification "OData Version 4.0 Part 2: URL Conventions", "5.2 Custom Query Options".
	 *   OData system query options and OData parameter aliases lead to an error.
	 * @param {boolean} [mParameters.supportReferences=true]
	 *   Whether <code>&lt;edmx:Reference></code> and <code>&lt;edmx:Include></code> directives are
	 *   supported in order to load schemas on demand from other $metadata documents and include
	 *   them into the current service ("cross-service references").
	 * @param {string} mParameters.synchronizationMode
	 *   Controls synchronization between different bindings which refer to the same data for the
	 *   case data changes in one binding. Must be set to 'None' which means bindings are not
	 *   synchronized at all; all other values are not supported and lead to an error.
	 * @param {string} [mParameters.updateGroupId]
	 *   The group ID that is used for update requests. If no update group ID is specified,
	 *   <code>mParameters.groupId</code> is used. Valid update group IDs are <code>undefined<code>,
	 *   '$auto', '$direct' or an application group ID, which is a non-empty string consisting of
	 *   alphanumeric characters from the basic Latin alphabet, including the underscore.
	 * @throws {Error} If an unsupported synchronization mode is given, if the given service root
	 *   URL does not end with a forward slash, if an unsupported parameter is given, if OData
	 *   system query options or parameter aliases are specified as parameters, if an invalid group
	 *   ID or update group ID is given, if the given operation mode is not supported, if an
	 *   annotation file cannot be merged into the service metadata.
	 *
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @author SAP SE
	 * @class Model implementation for OData V4.
	 *
	 *   Every resource path (relative to the service root URL, no query options) according to
	 *   "4 Resource Path" in specification "OData Version 4.0 Part 2: URL Conventions" is
	 *   a valid data binding path within this model if a leading slash is added; for example
	 *   "/" + "SalesOrderList('A%2FB%26C')" to access an entity instance with key "A/B&C". Note
	 *   that appropriate URI encoding is necessary. "4.5.1 Addressing Actions" needs an operation
	 *   binding, see {@link sap.ui.model.odata.v4.ODataContextBinding}.
	 *
	 *   Note that the OData V4 model has its own {@link sap.ui.model.odata.v4.Context} class.
	 *   Bindings which are relative to such a V4 context depend on their corresponding parent
	 *   binding and do not access data with their own service requests unless parameters are
	 *   provided.
	 *
	 *   The model does not support any public events; attaching an event handler leads to an error.
	 * @extends sap.ui.model.Model
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel",
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */
			{
				constructor : function (mParameters) {
					var mHeaders = {
							"Accept-Language" : sap.ui.getCore().getConfiguration().getLanguageTag()
						},
						sParameter,
						sServiceUrl,
						oUri,
						that = this;

					// do not pass any parameters to Model
					Model.apply(this);

					if (!mParameters || mParameters.synchronizationMode !== "None") {
						throw new Error("Synchronization mode must be 'None'");
					}
					for (sParameter in mParameters) {
						if (!(sParameter in mSupportedParameters)) {
							throw new Error("Unsupported parameter: " + sParameter);
						}
					}
					sServiceUrl = mParameters.serviceUrl;
					if (!sServiceUrl) {
						throw new Error("Missing service root URL");
					}
					oUri = new URI(sServiceUrl);
					if (oUri.path()[oUri.path().length - 1] !== "/") {
						throw new Error("Service root URL must end with '/'");
					}
					if (mParameters.operationMode
							&& mParameters.operationMode !== OperationMode.Server) {
						throw new Error("Unsupported operation mode: "
							+ mParameters.operationMode);
					}
					this.sOperationMode = mParameters.operationMode;
					// Note: strict checking for model's URI parameters, but "sap-*" is allowed
					this.mUriParameters = this.buildQueryOptions(oUri.query(true), false, true);
					this.sServiceUrl = oUri.query("").toString();
					this.sGroupId = mParameters.groupId;
					if (this.sGroupId === undefined) {
						this.sGroupId = "$auto";
					}
					if (this.sGroupId !== "$auto" && this.sGroupId !== "$direct") {
						throw new Error("Group ID must be '$auto' or '$direct'");
					}
					this.checkGroupId(mParameters.updateGroupId, false,
						"Invalid update group ID: ");
					this.sUpdateGroupId = mParameters.updateGroupId || this.getGroupId();
					if (mParameters.autoExpandSelect !== undefined
							&& typeof mParameters.autoExpandSelect !== "boolean") {
						throw new Error("Value for autoExpandSelect must be true or false");
					}
					this.bAutoExpandSelect = mParameters.autoExpandSelect === true;

					this.oMetaModel = new ODataMetaModel(
						_MetadataRequestor.create(mHeaders, this.mUriParameters),
						this.sServiceUrl + "$metadata", mParameters.annotationURI, this,
						mParameters.supportReferences);
					this.oRequestor = _Requestor.create(this.sServiceUrl, mHeaders,
						this.mUriParameters, function (sGroupId) {
							if (sGroupId === "$auto") {
								sap.ui.getCore().addPrerenderingTask(
									that._submitBatch.bind(that, sGroupId));
							}
						});

					this.aAllBindings = [];
					this.sDefaultBindingMode = BindingMode.TwoWay;
					this.mSupportedBindingModes = {
						OneTime : true,
						OneWay : true,
						TwoWay : true
					};
				}
			});

	/**
	 * Submits the requests associated with the given group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 *
	 * @private
	 */
	ODataModel.prototype._submitBatch = function (sGroupId) {
		return this.oRequestor.submitBatch(sGroupId)
			["catch"](function (oError) {
				jQuery.sap.log.error("$batch failed", oError.message, sClassName);
				throw oError;
			});
	};

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
	 * Creates a new context binding for the given path, context and parameters.
	 *
	 * This binding is inactive and will not know the bound context initially. You have to call
	 * {@link sap.ui.model.Binding#initialize} to get it updated asynchronously and register a
	 * change listener at the binding to be informed when the bound context is available.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters "$$groupId"
	 *   and "$$updateGroupId".
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via
	 *   {@link ODataModel#createBindingContext}.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $count, $expand, $filter, $levels, $orderby, $search and $select
	 *   "5.1 System Query Options"; OData V4 only allows $count, $filter, $levels, $orderby and
	 *   $search inside resource paths that identify a collection. In our case here, this means you
	 *   can only use them inside $expand.
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link #submitBatch}.
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests triggered by this binding;
	 *   if not specified, either the parent binding's update group ID (if the binding is relative)
	 *   or the model's update group ID is used, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   The context binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @public
	 * @see sap.ui.model.Model#bindContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ODataContextBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Callback function for all V4 bindings to add themselves to their model.
	 *
	 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataPropertyBinding} oBinding
	 *   A context, list, or property binding
	 *
	 * @private
	 */
	ODataModel.prototype.bindingCreated = function (oBinding) {
		this.aAllBindings.push(oBinding);
	};

	/**
	 * Callback function for all V4 bindings to remove themselves from their model.
	 *
	 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataPropertyBinding} oBinding
	 *   A context, list, or property binding
	 * @throws {Error}
	 *   If a binding is removed twice or without adding.
	 *
	 * @private
	 */
	ODataModel.prototype.bindingDestroyed = function (oBinding) {
		var iIndex = this.aAllBindings.indexOf(oBinding);

		if (iIndex < 0) {
			throw new Error("Unknown " + oBinding);
		}
		this.aAllBindings.splice(iIndex, 1);
	};

	/**
	 * Creates a new list binding for the given path and optional context which must
	 * resolve to an absolute OData path for an entity set.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used initially. Call
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} to replace them. Static sorters, as
	 *   defined in the '$orderby' binding parameter, are always executed after the dynamic sorters.
	 *   Supported since 1.39.0.
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [vFilters]
	 *   The dynamic application filters to be used initially. Call
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#filter} to replace them. Static filters, as
	 *   defined in the '$filter' binding parameter, are always combined with the dynamic filters
	 *   using a logical <code>AND</code>.
	 *   Supported since 1.39.0.
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters "$$groupId"
	 *   and "$$updateGroupId".
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via
	 *   {@link ODataModel#createBindingContext} or if it has sorters or filters.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $apply, $count, $expand, $filter, $levels, $orderby, $search, and $select
	 *   "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode for sorting. Since 1.39.0, the operation mode
	 *   {@link sap.ui.model.odata.OperationMode.Server} is supported. All other operation modes
	 *   including <code>undefined</code> lead to an error if 'vSorters' are given or if
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} is called.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link #submitBatch}.
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests triggered by this binding;
	 *   if not specified, either the parent binding's update group ID (if the binding is relative)
	 *   or the model's update group ID is used,
	 *   see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   The list binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided or an unsupported operation mode is used
	 *
	 * @public
	 * @see sap.ui.model.Model#bindList
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindList = function (sPath, oContext, vSorters, vFilters, mParameters) {
		return new ODataListBinding(this, sPath, oContext, vSorters, vFilters, mParameters);
	};

	/**
	 * Creates a new property binding for the given path. This binding is inactive and will not
	 * know the property value initially. You have to call {@link sap.ui.model.Binding#initialize}
	 * to get it updated asynchronously and register a change listener at the binding to be informed
	 * when the value is available.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameter "$$groupId".
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via
	 *   {@link ODataModel#createBindingContext}.
	 *   All "5.2 Custom Query Options" are allowed except for those with a name starting with
	 *   "sap-". All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link #submitBatch}.
	 * @returns {sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   The property binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
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
	 * Returns the map of binding-specific parameters from the given map. "Binding-specific"
	 * parameters are those with a key starting with '$$', i.e. OData query options provided as
	 * binding parameters are not contained in the map. The following parameters and parameter
	 * values are supported, if the parameter is contained in the given 'aAllowed' parameter:
	 * <ul>
	 * <li> '$$groupId' with allowed values as specified in {@link #checkGroupId}
	 * <li> '$$updateGroupId' with allowed values as specified in {@link #checkGroupId}
	 * <li> '$$operationMode' with value {@link sap.ui.model.odata.OperationMode.Server}
	 * </ul>
	 *
	 * @param {object} mParameters
	 *   The map of binding parameters
	 * @param {string[]} aAllowed
	 *   The array of allowed binding parameters
	 * @returns {object}
	 *   The map of binding-specific parameters
	 * @throws {Error}
	 *   For unsupported parameters or parameter values
	 *
	 * @private
	 */
	ODataModel.prototype.buildBindingParameters = function (mParameters, aAllowed) {
		var mResult = {},
			that = this;

		if (mParameters) {
			Object.keys(mParameters).forEach(function (sKey) {
				var sValue = mParameters[sKey];

				if (sKey.indexOf("$$") !== 0) {
					return;
				}
				if (!aAllowed || aAllowed.indexOf(sKey) < 0) {
					throw new Error("Unsupported binding parameter: " + sKey);
				}

				if (sKey === "$$groupId" || sKey === "$$updateGroupId") {
					that.checkGroupId(sValue, false,
						"Unsupported value for binding parameter '" + sKey + "': ");
				} else if (sKey === "$$operationMode") {
					if (sValue !== OperationMode.Server) {
						throw new Error("Unsupported operation mode: " + sValue);
					}
				}

				mResult[sKey] = sValue;
			});
		}
		return mResult;
	};

	/**
	 * Constructs a map of query options from the given binding parameters.
	 * Parameters starting with '$$' indicate binding-specific parameters, which must not be part
	 * of a back end query; they are ignored and not added to the map.
	 * The following query options are disallowed:
	 * <ul>
	 * <li> System query options (key starts with "$"), unless
	 * <code>bSystemQueryOptionsAllowed</code> is set
	 * <li> Parameter aliases (key starts with "@")
	 * <li> Custom query options starting with "sap-", unless <code>bSapAllowed</code> is set
	 * </ul>
	 *
	 * @param {object} [mParameters={}]
	 *   Map of binding parameters
	 * @param {boolean} [bSystemQueryOptionsAllowed=false]
	 *   Whether system query options are allowed
	 * @param {boolean} [bSapAllowed=false]
	 *   Whether custom query options starting with "sap-" are allowed
	 * @throws {Error}
	 *   If disallowed OData query options are provided
	 * @returns {object}
	 *   The map of query options
	 *
	 * @private
	 */
	ODataModel.prototype.buildQueryOptions = function (mParameters, bSystemQueryOptionsAllowed,
			bSapAllowed) {
		var sParameterName,
			mTransformedOptions = jQuery.extend(true, {}, mParameters);

		/**
		 * Parses the query options for the given option name "sOptionName" in the given map of
		 * query options "mOptions" to an object if necessary.
		 * Validates if the given query option name is allowed.
		 *
		 * @param {object} mOptions Map of query options by name
		 * @param {string} sOptionName Name of the query option
		 * @param {string[]} aAllowed The allowed system query options
		 * @throws {error} If the given query option name is not allowed
		 */
		function parseAndValidateSystemQueryOption (mOptions, sOptionName, aAllowed) {
			var sExpandOptionName,
				mExpandOptions,
				sExpandPath,
				vValue = mOptions[sOptionName];

			if (!bSystemQueryOptionsAllowed || aAllowed.indexOf(sOptionName) < 0) {
					throw new Error("System query option " + sOptionName + " is not supported");
			}
			if ((sOptionName === "$expand" || sOptionName === "$select")
					&& typeof vValue === "string") {
				vValue = _Parser.parseSystemQueryOption(sOptionName + "=" + vValue)[sOptionName];
				mOptions[sOptionName] = vValue;
			}
			if (sOptionName === "$expand") {
				for (sExpandPath in vValue) {
					mExpandOptions = vValue[sExpandPath];
					if (mExpandOptions === null || typeof mExpandOptions !== "object") {
						// normalize empty expand options to {}
						mExpandOptions = vValue[sExpandPath] = {};
					}
					for (sExpandOptionName in mExpandOptions) {
						parseAndValidateSystemQueryOption(mExpandOptions, sExpandOptionName,
							aExpandQueryOptions);
					}
				}
			} else if (sOptionName === "$count" ) {
				if (typeof vValue  === "boolean") {
					if (!vValue) {
						delete mOptions.$count;
					}
				} else {
					switch (typeof vValue === "string" && vValue.toLowerCase()) {
						case "false":
							delete mOptions.$count;
							break;
						case "true":
							mOptions.$count = true;
							break;
						default:
							throw new Error("Invalid value for $count: " + vValue);
					}
				}
			}
		}

		if (mParameters) {
			for (sParameterName in mParameters) {
				if (sParameterName.indexOf("$$") === 0) { // binding-specific parameter
					delete mTransformedOptions[sParameterName];
				} else if (sParameterName[0] === "@") { // OData parameter alias
					throw new Error("Parameter " + sParameterName + " is not supported");
				} else if (sParameterName[0] === "$") { // OData system query option
					parseAndValidateSystemQueryOption(mTransformedOptions, sParameterName,
						aSystemQueryOptions);
				// OData custom query option
				} else if (!bSapAllowed && sParameterName.indexOf("sap-") === 0) {
					throw new Error("Custom query option " + sParameterName + " is not supported");
				}
			}
		}
		return mTransformedOptions;
	};

	/**
	 * Checks whether the given group ID is valid, which means it is either undefined, '$auto',
	 * '$direct' or an application group ID, which is a non-empty string consisting of
	 * alphanumeric characters from the basic Latin alphabet, including the underscore.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} [bApplicationGroup]
	 *   Whether only an application group ID is considered valid
	 * @param {string} [sErrorMessage]
	 *   The error message to be used if group ID is not valid; the group ID will be appended
	 * @throws {Error}
	 *   For invalid group IDs
	 *
	 * @private
	 */
	ODataModel.prototype.checkGroupId = function (sGroupId, bApplicationGroup, sErrorMessage) {
		if (!bApplicationGroup && sGroupId === undefined
				|| typeof sGroupId === "string"
					&& (bApplicationGroup ? rApplicationGroupID : rGroupID).test(sGroupId)) {
			return;
		}
		throw new Error((sErrorMessage || "Invalid group ID: ") + sGroupId);
	};

	/**
	 * Creates a binding context for the given path. A relative path can only be resolved if a
	 * context is provided.
	 * Note: The parameters <code>mParameters</code>, <code>fnCallBack</code>, and
	 * <code>bReload</code> from {@link sap.ui.model.Model#createBindingContext} are not supported.
	 *
	 * It is possible to create binding contexts pointing to metadata.  A '#' in the resolved path
	 * splits it into two parts: The part before '#' is transformed into a metadata context (see
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#getMetaContext}). The part following '#' is then
	 * interpreted relative to this metadata context, even if it starts with a '/'; a trailing '/'
	 * is allowed here, see {@link sap.ui.model.odata.v4.ODataMetaModel#requestObject} for the
	 * effect it has.
	 *
	 * Examples:
	 * <ul>
	 * <li><code>/Products('42')/Name#@com.sap.vocabularies.Common.v1.Label</code>
	 *   points to the "Label" annotation of the "Name" property of the entity set "Products".
	 * <li><code>/#Products/Name@com.sap.vocabularies.Common.v1.Label</code> has no data path part
	 *   and thus starts at the metadata root. It also points to the "Label" annotation of the
	 *   "Name" property of the entity set "Products".
	 * <li><code>/Products#/</code>
	 *   points to the entity type (note the trailing '/') of the entity set "Products".
	 * </ul>
	 *
	 * @param {string} sPath
	 *   The binding path, may be relative to the provided context
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @returns {sap.ui.model.Context}
	 *   The binding context with the resolved path and the model instance
	 * @throws {Error}
	 *   If a relative path is provided without a context or in case of unsupported parameters or
	 *   if the given context is a {@link sap.ui.model.odata.v4.Context}
	 *
	 * @public
	 * @see sap.ui.model.Model#createBindingContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.createBindingContext = function (sPath, oContext) {
		var sDataPath,
			oMetaContext,
			sMetaPath,
			sResolvedPath,
			iSeparator;

		if (arguments.length > 2) {
			throw new Error("Only the parameters sPath and oContext are supported");
		}
		if (oContext && oContext.getBinding) {
			throw new Error("Unsupported type: oContext must be of type sap.ui.model.Context, "
				+ "but was sap.ui.model.odata.v4.Context");
		}
		sResolvedPath = this.resolve(sPath, oContext);
		if (sResolvedPath === undefined) {
			throw new Error("Cannot create binding context from relative path '" + sPath
				+ "' without context");
		}

		iSeparator = sResolvedPath.indexOf('#');
		if (iSeparator >= 0) {
			sDataPath = sResolvedPath.slice(0, iSeparator);
			sMetaPath = sResolvedPath.slice(iSeparator + 1);
			if (sMetaPath[0] === "/") {
				sMetaPath = "." + sMetaPath;
			}
			oMetaContext = this.oMetaModel.getMetaContext(sDataPath);
			return this.oMetaModel.createBindingContext(sMetaPath, oMetaContext);
		}

		return new BaseContext(this, sResolvedPath);
	};

	/**
	 * Destroys this model and its meta model.
	 *
	 * @public
	 * @see sap.ui.model.Model#destroy
	 * @since 1.38.0
	 */
	// @override
	ODataModel.prototype.destroy = function () {
		this.oMetaModel.destroy();
		return Model.prototype.destroy.apply(this, arguments);
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
	 * Returns all bindings which are relative to the given parent context or to a context created
	 * by the given parent binding.
	 *
	 * @param {sap.ui.model.Binding|sap.ui.model.Context} oParent
	 *   The parent binding or context
	 * @param {boolean} bSkipCreatedEntities
	 *   Whether to skip bindings with a context that has been created by ODataListBinding#create
	 * @returns {sap.ui.model.Binding[]}
	 *   A list of all dependent bindings, never <code>null</code>
	 *
	 * @private
	 */
	ODataModel.prototype.getDependentBindings = function (oParent, bSkipCreatedEntities) {
		return this.aAllBindings.filter(function (oBinding) {
			var oContext = oBinding.getContext();

			return oBinding.isRelative()
				&& !(bSkipCreatedEntities && oContext && oContext.created && oContext.created())
				&& (oContext === oParent
						|| oContext && oContext.getBinding && oContext.getBinding() === oParent
					);
		});
	};

	/**
	 * Returns the model's group ID.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 * @since 1.41.0
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
	 * @see sap.ui.model.Model#getObject
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.getObject = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getObject");
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
	 * Returns the model's update group ID.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 * @since 1.41.0
	 */
	ODataModel.prototype.getUpdateGroupId = function () {
		return this.sUpdateGroupId;
	};

	/**
	 * Returns <code>true</code> if there are pending changes, meaning updates or created entities
	 * (see {@link sap.ui.model.odata.v4.ODataListBinding#create}) that have not yet been
	 * successfully sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataModel.prototype.hasPendingChanges = function () {
		return this.oRequestor.hasPendingChanges();
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @private
	 * @see sap.ui.model.Model#isList
	 */
	ODataModel.prototype.isList = function () {
		throw new Error("Unsupported operation: v4.ODataModel#isList");
	};

	/**
	 * Refreshes the model by calling refresh on all bindings which have a change event handler
	 * attached.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request triggered by
	 * the last call determines the model's data; it is <b>independent</b> of the order of calls to
	 * {@link #submitBatch} with the given group ID.
	 *
	 * If there are pending changes, an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call {@link #submitBatch} to submit the
	 * changes or {@link #resetChanges} to reset the changes before calling {@link #refresh}.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; valid values are <code>undefined</code>,
	 *   '$auto', '$direct' or application group IDs as specified in {@link #submitBatch}
	 * @throws {Error}
	 *   If the given group ID is invalid or if there are pending changes, see
	 *   {@link #hasPendingChanges}
	 *
	 * @public
	 * @see sap.ui.model.Model#refresh
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataPropertyBinding#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.refresh = function (sGroupId) {
		this.checkGroupId(sGroupId);

		this.aBindings.slice().forEach(function (oBinding) {
			if (oBinding.isRefreshable()) {
				oBinding.refresh(sGroupId);
			}
		});
	};

	/**
	 * Reports a technical error by adding a message to the MessageManager and logging the error to
	 * the console. Takes care that the error is only added once to the MessageManager.
	 * Errors caused by cancellation of backend requests are not reported but just logged to the
	 * console with level DEBUG.
	 *
	 * @param {string} sLogMessage
	 *   The message to write to the console log
	 * @param {string} sReportingClassName
	 *   The name of the class reporting the error
	 * @param {Error} oError
	 *   The error
	 *
	 * @private
	 */
	ODataModel.prototype.reportError = function (sLogMessage, sReportingClassName, oError) {
		var sDetails = oError.stack || oError.message;

		if (sDetails.indexOf(oError.message) < 0) {
			sDetails = oError.message + "\n" + oError.stack;
		}

		if (oError.canceled) {
			jQuery.sap.log.debug(sLogMessage, sDetails, sReportingClassName);
			return;
		}

		jQuery.sap.log.error(sLogMessage, sDetails, sReportingClassName);
		if (oError.$reported) {
			return;
		}
		oError.$reported = true;
		sap.ui.getCore().getMessageManager().addMessages(new Message({
			message : oError.message,
			processor : this,
			technical : true,
			type : "Error"
		}));
	};

	/**
	 * Returns a promise for the "canonical path" of the entity for the given context.
	 * According to "4.3.1 Canonical URL" of the specification "OData Version 4.0 Part 2: URL
	 * Conventions", this is the "name of the entity set associated with the entity followed by the
	 * key predicate identifying the entity within the collection".
	 * Use the canonical path in {@link sap.ui.core.Element#bindElement} to create an element
	 * binding.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oEntityContext
	 *   A context in this model which must point to a non-contained OData entity
	 * @returns {Promise}
	 *   A promise which is resolved with the canonical path (e.g. "/SalesOrderList('0500000000')")
	 *   in case of success, or rejected with an instance of <code>Error</code> in case of failure,
	 *   e.g. when the given context does not point to an entity
	 *
	 * @deprecated since 1.39.0
	 *   Use {@link sap.ui.model.odata.v4.Context#requestCanonicalPath} instead.
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.requestCanonicalPath = function (oEntityContext) {
		jQuery.sap.assert(oEntityContext.getModel() === this,
				"oEntityContext must belong to this model");
		return oEntityContext.requestCanonicalPath();
	};

	/**
	 * Resets all property changes and created entities associated with the given group ID which
	 * have not been successfully submitted via {@link #submitBatch}. Resets also invalid user
	 * input for the same group ID. This function does not reset the deletion of entities
	 * (see {@link sap.ui.model.odata.v4.Context#delete}) and the execution of OData operations
	 * (see {@link sap.ui.model.odata.v4.ODataContextBinding#execute}).
	 *
	 * @param {string} [sGroupId]
	 *   The application group ID, which is a non-empty string consisting of alphanumeric
	 *   characters from the basic Latin alphabet, including the underscore. If it is
	 *   <code>undefined</code>, the model's <code>updateGroupId</code> is used. Note that the
	 *   default <code>updateGroupId</code> is '$auto', which is invalid here.
	 * @throws {Error}
	 *   If the given group ID is not an application group ID or if change requests for the given
	 *   group ID are running.
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor.
	 * @since 1.39.0
	 */
	ODataModel.prototype.resetChanges = function (sGroupId) {
		sGroupId = sGroupId || this.sUpdateGroupId;
		this.checkGroupId(sGroupId, true);

		this.oRequestor.cancelChanges(sGroupId);
		this.aAllBindings.forEach(function (oBinding) {
			if (sGroupId === oBinding.getUpdateGroupId()) {
				oBinding.resetInvalidDataState();
			}
		});
	};

	/**
	 * Resolves the given path relative to the given context. Without a context, a relative path
	 * cannot be resolved and <code>undefined</code> is returned. An absolute path is returned
	 * unchanged. A relative path is appended to the context's path separated by a forward slash
	 * ("/"). The resulting path does not end with a forward slash unless it contains the hash ("#")
	 * character used to branch (see {@link #createBindingContext}) into metadata; see
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestObject} for the effect of a trailing
	 * slash.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the data model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {string}
	 *   Resolved path or <code>undefined</code>
	 *
	 * @private
	 * @see sap.ui.model.Model#resolve
	 */
	// @override
	ODataModel.prototype.resolve = function (sPath, oContext) {
		var sResolvedPath;

		if (sPath[0] === "/") {
			sResolvedPath = sPath;
		} else if (oContext) {
			if (sPath) {
				if (oContext.getPath().slice(-1) === "/") {
					sResolvedPath = oContext.getPath() + sPath;
				} else {
					sResolvedPath = oContext.getPath() + "/" + sPath;
				}
			} else {
				sResolvedPath = oContext.getPath();
			}
		}

		if (sResolvedPath
				&& sResolvedPath !== "/"
				&& sResolvedPath[sResolvedPath.length - 1] === "/"
				&& sResolvedPath.indexOf("#") < 0) {
			sResolvedPath = sResolvedPath.slice(0, sResolvedPath.length - 1);
		}

		return sResolvedPath;
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

	/**
	 * Submits the requests associated with the given application group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The application group ID, which is a non-empty string consisting of alphanumeric
	 *   characters from the basic Latin alphabet, including the underscore.
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 * @throws {Error}
	 *   If the given group ID is not an application group ID
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.submitBatch = function (sGroupId) {
		var that = this;

		this.checkGroupId(sGroupId, true);

		return new Promise(function (resolve) {
			sap.ui.getCore().addPrerenderingTask(function () {
				resolve(that._submitBatch(sGroupId));
			});
		});
	};

	/**
	 * Returns a string representation of this object including the service URL.
	 *
	 * @return {string} A string description of this model
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.toString = function () {
		return sClassName + ": " + this.sServiceUrl;
	};

	return ODataModel;
}, /* bExport= */ true);
