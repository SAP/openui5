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
	"./ODataContextBinding",
	"./ODataListBinding",
	"./ODataMetaModel",
	"./ODataPropertyBinding",
	"./SubmitMode",
	"./lib/_GroupLock",
	"./lib/_Helper",
	"./lib/_MetadataRequestor",
	"./lib/_Parser",
	"./lib/_Requestor",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/library",
	"sap/ui/core/message/Message",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI"
], function (ODataContextBinding, ODataListBinding, ODataMetaModel, ODataPropertyBinding,
		SubmitMode, _GroupLock, _Helper, _MetadataRequestor, _Parser, _Requestor, assert, Log,
		SyncPromise, coreLibrary, Message, BindingMode, BaseContext, Model, OperationMode, jQuery,
		URI) {
	"use strict";

	var rApplicationGroupID = /^\w+$/,
		sClassName = "sap.ui.model.odata.v4.ODataModel",
		// system query options allowed within a $expand query option
		aExpandQueryOptions = ["$count", "$expand", "$filter", "$levels", "$orderby", "$search",
			"$select"],
		rGroupID = /^(\$auto(\.\w+)?|\$direct|\w+)$/,
		MessageType = coreLibrary.MessageType,
		aMessageTypes = [
			undefined,
			MessageType.Success,
			MessageType.Information,
			MessageType.Warning,
			MessageType.Error
		],
		mSupportedEvents = {
			messageChange : true,
			sessionTimeout : true
		},
		mSupportedParameters = {
			annotationURI : true,
			autoExpandSelect : true,
			earlyRequests : true,
			groupId : true,
			groupProperties : true,
			httpHeaders : true,
			odataVersion : true,
			operationMode : true,
			serviceUrl : true,
			supportReferences : true,
			synchronizationMode : true,
			updateGroupId : true
		},
		// system query options allowed in mParameters
		aSystemQueryOptions = ["$apply", "$count", "$expand", "$filter", "$orderby", "$search",
			"$select"],
		// valid header values: non-empty, only US-ASCII, no control chars
		rValidHeader = /^[ -~]+$/;

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
	 * @param {boolean} [mParameters.earlyRequests=false]
	 *   Whether the following is requested at the earliest convenience:
	 *   <ul>
	 *   <li> root $metadata document and annotation files;
	 *   <li> the security token.
	 *   </ul>
	 *   Note: The root $metadata document and annotation files are just requested but not yet
	 *   converted from XML to JSON unless really needed.
	 *   Supported since 1.53.0
	 *   <b>BEWARE:</b> The default value may change to <code>true</code> in later releases.
	 * @param {string} [mParameters.groupId="$auto"]
	 *   Controls the model's use of batch requests: '$auto' bundles requests from the model in a
	 *   batch request which is sent automatically before rendering; '$direct' sends requests
	 *   directly without batch; other values result in an error
	 * @param {object} [mParameters.groupProperties]
	 *   Controls the use of batch requests for application groups. A map of application
	 *   group IDs having an object with exactly one property <code>submit</code>. Valid values are
	 *   'API', 'Auto', 'Direct' see {@link sap.ui.model.odata.v4.SubmitMode}.
	 *   Supported since 1.51.0
	 * @param {object} [mParameters.httpHeaders]
	 *   Map of HTTP header names to their values, see {@link #changeHttpHeaders}
	 * @param {string} [mParameters.odataVersion="4.0"]
	 *   The version of the OData service. Supported values are "2.0" and "4.0".
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
	 *   The group ID that is used for update requests. If no update group ID is specified, <code>
	 *   mParameters.groupId</code> is used. Valid update group IDs are <code>undefined</code>,
	 *   '$auto', '$direct' or an application group ID.
	 * @throws {Error} If an unsupported synchronization mode is given, if the given service root
	 *   URL does not end with a forward slash, if an unsupported parameter is given, if OData
	 *   system query options or parameter aliases are specified as parameters, if an invalid group
	 *   ID or update group ID is given, if the given operation mode is not supported, if an
	 *   annotation file cannot be merged into the service metadata, if an unsupported value for
	 *   <code>odataVersion</code> is given.
	 *
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @author SAP SE
	 * @class Model implementation for OData V4.
	 *
	 *   Every resource path (relative to the service root URL, no query options) according to
	 *   "4 Resource Path" in specification "OData Version 4.0 Part 2: URL Conventions" is
	 *   a valid data binding path within this model if a leading slash is added; for example
	 *   "/" + "SalesOrderList('A%2FB%26C')" to access an entity instance with key "A/B&C". Note
	 *   that appropriate URI encoding is necessary, see the example of
	 *   {@link sap.ui.model.odata.v4.ODataUtils.formatLiteral}. "4.5.1 Addressing Actions" needs an
	 *   operation binding, see {@link sap.ui.model.odata.v4.ODataContextBinding}.
	 *
	 *   Note that the OData V4 model has its own {@link sap.ui.model.odata.v4.Context} class.
	 *   Bindings which are relative to such a V4 context depend on their corresponding parent
	 *   binding and do not access data with their own service requests unless parameters are
	 *   provided.
	 *
	 *   <b>Group IDs</b> control the model's use of batch requests. Valid group IDs are:
	 *   <ul>
	 *   <li><b>$auto</b> and <b>$auto.*</b>: Bundles requests from the model in a batch request
	 *   which is sent automatically before rendering. You can use different '$auto.*' group IDs to
	 *   use different batch requests. The suffix may be any non-empty string consisting of
	 *   alphanumeric characters from the basic Latin alphabet, including the underscore. The submit
	 *   mode for these group IDs is always {@link sap.ui.model.odata.v4.SubmitMode#Auto}.
	 *   </li>
	 *   <li><b>$direct</b>: Sends requests directly without batch. The submit mode for this group
	 *   ID is always {@link sap.ui.model.odata.v4.SubmitMode#Direct}.
	 *   </li>
	 *   <li>An application group ID, which is a non-empty string consisting of alphanumeric
	 *   characters from the basic Latin alphabet, including the underscore. By default, an
	 *   application group has the submit mode {@link sap.ui.model.odata.v4.SubmitMode#API}. It is
	 *   possible to use a different submit mode; for details see
	 *   <code>mParameters.groupProperties</code>.
	 *   </li>
	 *   </ul>
	 *
	 * @extends sap.ui.model.Model
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel",
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */
			{
				constructor : function (mParameters) {
					var sGroupId,
						oGroupProperties,
						sLanguageTag = sap.ui.getCore().getConfiguration().getLanguageTag(),
						sODataVersion,
						sParameter,
						sServiceUrl,
						oUri,
						that = this;

					// do not pass any parameters to Model
					Model.call(this);

					if (!mParameters || mParameters.synchronizationMode !== "None") {
						throw new Error("Synchronization mode must be 'None'");
					}
					sODataVersion = mParameters.odataVersion || "4.0";
					this.sODataVersion = sODataVersion;
					if (sODataVersion !== "4.0" && sODataVersion !== "2.0") {
						throw new Error("Unsupported value for parameter odataVersion: "
							+ sODataVersion);
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
					this.mGroupProperties = {};
					for (sGroupId in mParameters.groupProperties) {
						that.checkGroupId(sGroupId, true);
						oGroupProperties = mParameters.groupProperties[sGroupId];
						if (typeof oGroupProperties !== "object"
								|| Object.keys(oGroupProperties).length !== 1
								|| !(oGroupProperties.submit in SubmitMode)) {
							throw new Error("Group '" + sGroupId + "' has invalid properties: '"
								+ oGroupProperties + "'");
						}
					}
					this.mGroupProperties = jQuery.extend({
							"$auto" : {submit : SubmitMode.Auto},
							"$direct" : {submit : SubmitMode.Direct}
						}, mParameters.groupProperties);
					if (mParameters.autoExpandSelect !== undefined
							&& typeof mParameters.autoExpandSelect !== "boolean") {
						throw new Error("Value for autoExpandSelect must be true or false");
					}
					this.bAutoExpandSelect = mParameters.autoExpandSelect === true;

					this.mHeaders = {"Accept-Language" : sLanguageTag};
					this.mMetadataHeaders = {"Accept-Language" : sLanguageTag};

					// BEWARE: do not share mHeaders between _MetadataRequestor and _Requestor!
					this.oMetaModel = new ODataMetaModel(
						_MetadataRequestor.create(this.mMetadataHeaders, sODataVersion,
							this.mUriParameters),
						this.sServiceUrl + "$metadata", mParameters.annotationURI, this,
						mParameters.supportReferences);
					this.oRequestor = _Requestor.create(this.sServiceUrl, {
							fetchEntityContainer :
								this.oMetaModel.fetchEntityContainer.bind(this.oMetaModel),
							fetchMetadata : this.oMetaModel.fetchObject.bind(this.oMetaModel),
							fireSessionTimeout : function () {
								that.fireEvent("sessionTimeout");
							},
							getGroupProperty : this.getGroupProperty.bind(this),
							onCreateGroup : function (sGroupId) {
								if (that.isAutoGroup(sGroupId)) {
									sap.ui.getCore().addPrerenderingTask(
										that._submitBatch.bind(that, sGroupId, true));
								}
							},
							reportBoundMessages : this.reportBoundMessages.bind(this),
							reportUnboundMessages : this.reportUnboundMessages.bind(this)
						}, this.mHeaders, this.mUriParameters, sODataVersion);
					this.changeHttpHeaders(mParameters.httpHeaders);
					if (mParameters.earlyRequests) {
						this.oMetaModel.fetchEntityContainer(true);
						this.initializeSecurityToken();
					}

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
	 * Submits the requests associated with this group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} [bCatch=false]
	 *   Whether the returned promise always resolves and never rejects
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails. Use <code>bCatch</code> to catch
	 *   that error and make the promise resolve with <code>undefined</code> instead.
	 *
	 * @private
	 */
	ODataModel.prototype._submitBatch = function (sGroupId, bCatch) {
		var that = this;

		return this.oRequestor.submitBatch(sGroupId).catch(function (oError) {
			that.reportError("$batch failed", sClassName, oError);
			if (!bCatch) {
				throw oError;
			}
		});
	};

	/**
	 * The 'parseError' event is not supported by this model.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataModel#parseError
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'propertyChange' event is not supported by this model.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataModel#propertyChange
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'requestCompleted' event is not supported by this model.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataModel#requestCompleted
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'requestFailed' event is not supported by this model.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataModel#requestFailed
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'requestSent' event is not supported by this model.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataModel#requestSent
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'sessionTimeout' event is fired when the server has created a session for the model and
	 * this session ran into a timeout due to inactivity.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataModel#sessionTimeout
	 * @public
	 * @since 1.66.0
	 */

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
	 * Attach event handler <code>fnFunction</code> to the 'sessionTimeout' event of this model.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {sap.ui.model.odata.v4.ODataModel} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataModel.prototype.attachSessionTimeout = function (fnFunction, oListener) {
		return this.attachEvent("sessionTimeout", fnFunction, oListener);
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
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters as specified
	 *   below.
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via
	 *   {@link #createBindingContext}.
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
	 * @param {boolean} [mParameters.$$canonicalPath]
	 *   Whether a binding relative to a {@link sap.ui.model.odata.v4.Context} uses the canonical
	 *   path computed from its context's path for data service requests; only the value
	 *   <code>true</code> is allowed.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {boolean} [mParameters.$$inheritExpandSelect]
	 *   For operation bindings only: Whether $expand and $select from the parent binding are used
	 *   in the request sent on {@link #execute}. If set to <code>true</code>, the binding must not
	 *   set the $expand or $select parameter itself, the operation must be bound, and the return
	 *   value and the binding parameter must belong to the same entity set.
	 * @param {boolean} [mParameters.$$ownRequest]
	 *   Whether the binding always uses an own service request to read its data; only the value
	 *   <code>true</code> is allowed.
	 * @param {boolean} [mParameters.$$patchWithoutSideEffects]
	 *   Whether implicit loading of side effects via PATCH requests is switched off; only the value
	 *   <code>true</code> is allowed. This requires the service to return an ETag header even for
	 *   "204 No Content" responses (for example, if the "return=minimal" preference is used). If
	 *   not specified, the value of the parent binding is used.
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
	 *   "OData Version 4.0 Part 2: URL Conventions" or binding-specific parameters as specified
	 *   below.
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via {@link #createBindingContext}
	 *   or if it has sorters or filters.
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
	 * @param {object} [mParameters.$$aggregation]
	 *   An object holding the information needed for data aggregation, see
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation} for details.
	 * @param {boolean} [mParameters.$$canonicalPath]
	 *   Whether a binding relative to a {@link sap.ui.model.odata.v4.Context} uses the canonical
	 *   path computed from its context's path for data service requests; only the value
	 *   <code>true</code> is allowed.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {boolean} [mParameters.$$patchWithoutSideEffects]
	 *   Whether implicit loading of side effects via PATCH requests is switched off; only the value
	 *   <code>true</code> is allowed. This requires the service to return an ETag header even for
	 *   "204 No Content" responses (for example, if the "return=minimal" preference is used). If
	 *   not specified, the value of the parent binding is used.
	 * @param {boolean} [mParameters.$$ownRequest]
	 *   Whether the binding always uses an own service request to read its data; only the value
	 *   <code>true</code> is allowed.
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
	 * It is possible to create a property binding pointing to metadata. A '##' in the
	 * binding's path is recognized as a separator and splits it into two parts.
	 * The part before the separator is resolved with the binding's context and the result is
	 * transformed into a metadata context (see
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#getMetaContext}). The part following the
	 * separator is then interpreted relative to this metadata context, even if it starts with
	 * a '/'; a trailing '/' is allowed here, see
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestObject} for the effect it has.
	 *
	 * If the target type specified in the corresponding control property's binding info is "any"
	 * and the binding is relative or points to metadata, the binding may have an object value;
	 * in this case and unless the binding refers to an action advertisement the binding's mode must
	 * be {@link sap.ui.model.BindingMode.OneTime}.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty. Must not end with a '/' unless the
	 *   binding points to metadata.
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameter "$$groupId".
	 *   All "5.2 Custom Query Options" are allowed except for those with a name starting with
	 *   "sap-". All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: The binding only creates its own data service request if it is absolute or if it is
	 *   relative to a context created via {@link #createBindingContext}. The binding parameters are
	 *   ignored in case the binding creates no own data service request or in case the binding
	 *   points to metadata.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {boolean} [mParameters.$$noPatch]
	 *   Whether changing the value of this property binding is not causing a PATCH request. Only
	 *   the value <code>true</code> is allowed.
	 * @returns {sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   The property binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided or in case the binding's value is an object
	 *   and the preconditions specified above are not fulfilled
	 *
	 * @public
	 * @see sap.ui.base.ManagedObject#bindProperty
	 * @see sap.ui.model.Model#bindProperty
	 * @see sap.ui.model.PropertyBinding#setType
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
	 * Constructs a map of query options from the given binding parameters.
	 * Parameters starting with '$$' indicate binding-specific parameters, which must not be part
	 * of a back-end query; they are ignored and not added to the map.
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
			} else if (sOptionName === "$count") {
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
	 * Changes the HTTP headers used for data and metadata requests sent by this model.
	 *
	 * If batch requests are used, the headers will be set for the batch itself, as well as for the
	 * individual requests within the batch. The headers are changed according to the given map of
	 * headers: Headers with an <code>undefined</code> value are removed, the other headers are set,
	 * and missing headers remain unchanged. The following headers must not be used:
	 * <ul>
	 * <li> OData V4 requests headers as specified in "8.1 Common Headers" and
	 *   "8.2 Request Headers" of the specification "OData Version 4.0 Part 1: Protocol"
	 * <li> OData V2 request headers as specified in "2.2.5 HTTP Header Fields" of the specification
	 *   "OData Version 2 v10.1"
	 * <li> The headers "Content-Id" and "Content-Transfer-Encoding"
	 * <li> The header "SAP-ContextId"
	 * </ul>
	 * Note: The "X-CSRF-Token" header will not be used for metadata requests.
	 *
	 * If not <code>undefined</code>, a header value must conform to the following rules:
	 * <ul>
	 *   <li> It must be a non-empty string.
	 *   <li> It must be completely in the US-ASCII character set.
	 *   <li> It must not contain control characters.
	 * </ul>
	 *
	 * @param {object} [mHeaders]
	 *   Map of HTTP header names to their values
	 * @throws {Error}
	 *   If <code>mHeaders</code> contains unsupported headers, the same header occurs more than
	 *   once, a header value is invalid, or there are open requests.
	 *
	 * @public
	 * @since 1.71.0
	 */
	ODataModel.prototype.changeHttpHeaders = function (mHeaders) {
		var oHeaderCopy,
			sHeaderName,
			mHeadersCopy = {},
			sHeaderValue,
			sKey;

		this.oRequestor.checkHeaderNames(mHeaders);
		for (sKey in mHeaders) {
			sHeaderName = sKey.toLowerCase();
			sHeaderValue = mHeaders[sKey];
			if (mHeadersCopy[sHeaderName]) {
				throw new Error("Duplicate header " + sKey);
			} else if (!(typeof sHeaderValue === "string" && rValidHeader.test(sHeaderValue)
					|| sHeaderValue === undefined)) {
				throw new Error("Unsupported value for header '" + sKey + "': " + sHeaderValue);
			} else {
				if (sHeaderName === "x-csrf-token") {
					sKey = "X-CSRF-Token";
				}
				mHeadersCopy[sHeaderName] = {key : sKey, value: sHeaderValue};
			}
		}
		this.oRequestor.checkForOpenRequests();

		for (sKey in this.mHeaders) {
			sHeaderName = sKey.toLowerCase();
			oHeaderCopy = mHeadersCopy[sHeaderName];
			if (oHeaderCopy) {
				delete this.mHeaders[sKey];
				delete this.mMetadataHeaders[sKey];
				if (oHeaderCopy.value !== undefined) {
					this.mHeaders[oHeaderCopy.key] = oHeaderCopy.value;
					this.mMetadataHeaders[oHeaderCopy.key] = oHeaderCopy.value;
				}
				delete mHeadersCopy[sHeaderName];
			}
		}

		for (sKey in mHeadersCopy) {
			oHeaderCopy = mHeadersCopy[sKey];
			if (oHeaderCopy.value !== undefined) {
				this.mHeaders[oHeaderCopy.key] = oHeaderCopy.value;
				if (sKey !== "x-csrf-token") {
					this.mMetadataHeaders[oHeaderCopy.key] = oHeaderCopy.value;
				}
			}
		}
	};

	/**
	 * Checks whether the given group ID is valid (see {@link #checkGroupId}) and does not have
	 * {@link sap.ui.model.odata.v4.SubmitMode.Direct}.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @throws {Error}
	 *   For invalid group IDs, or group IDs with {@link sap.ui.model.odata.v4.SubmitMode.Direct}
	 *
	 * @private
	 */
	ODataModel.prototype.checkBatchGroupId = function (sGroupId) {
		this.checkGroupId(sGroupId);
		if (this.isDirectGroup(sGroupId)) {
			throw new Error("Group ID does not use batch requests: " + sGroupId);
		}
	};

	/**
	 * Checks whether the given group ID is valid, which means it is either undefined, '$auto',
	 * '$auto.*', '$direct' or an application group ID as specified in
	 * {@link sap.ui.model.odata.v4.ODataModel}.
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
	 * It is possible to create binding contexts pointing to metadata.  A '##' is recognized
	 * as separator in the resolved path and splits it into two parts; note that '#' may also be
	 * used as separator but is deprecated since 1.51.
	 * The part before the separator is transformed into a metadata context (see
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#getMetaContext}). The part following the
	 * separator is then interpreted relative to this metadata context, even if it starts with
	 * a '/'; a trailing '/' is allowed here, see
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestObject} for the effect it has.
	 *
	 * A binding path may also point to an operation advertisement which is addressed with
	 * '#<namespace>.<operation>' and is part of the data payload, not the metadata. The metadata
	 * of an operation can be addressed via '##' as described above.
	 *
	 * Examples:
	 * <ul>
	 * <li><code>/Products('42')/Name##@com.sap.vocabularies.Common.v1.Label</code>
	 *   points to the "Label" annotation of the "Name" property of the entity set "Products".
	 * <li><code>/##Products/Name@com.sap.vocabularies.Common.v1.Label</code> has no data path part
	 *   and thus starts at the metadata root. It also points to the "Label" annotation of the
	 *   "Name" property of the entity set "Products".
	 * <li><code>/Products##/</code>
	 *   points to the entity type (note the trailing '/') of the entity set "Products".
	 * <li><code>/EMPLOYEES('1')/##com.sap.Action</code>
	 *   points to the metadata of an action bound to the entity set "EMPLOYEES".
	 * <li><code>/EMPLOYEES('1')/#com.sap.Action</code>
	 *   does not point to metadata, but to the action advertisement.
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

		/**
		 * Checks if the given meta path contains a dot in its first segment.
		 *
		 * @param {string} sMetaPath The meta path
		 * @returns {boolean} Whether the given meta path contains a dot in its first segment
		 */
		function startsWithQualifiedName(sMetaPath) {
			var iDotPos = sMetaPath.indexOf("."),
				iSlashPos = sMetaPath.indexOf("/");

			return iDotPos > 0 && (iSlashPos < 0 || iDotPos < iSlashPos);
		}

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
			if (sMetaPath[0] === "#") {
				sMetaPath = sMetaPath.slice(1);
			} else if (sDataPath.length > 1 && sMetaPath[0] !== "@"
					&& startsWithQualifiedName(sMetaPath)) { // action advertisement
				return new BaseContext(this, sResolvedPath);
			}
			if (sMetaPath[0] === "/") {
				sMetaPath = "." + sMetaPath;
			}
			oMetaContext = this.oMetaModel.getMetaContext(sDataPath);
			return this.oMetaModel.createBindingContext(sMetaPath, oMetaContext);
		}

		return new BaseContext(this, sResolvedPath);
	};

	/**
	 * Destroys this model, its requestor and its meta model.
	 *
	 * @public
	 * @see sap.ui.model.Model#destroy
	 * @since 1.38.0
	 */
	// @override
	ODataModel.prototype.destroy = function () {
		this.oMetaModel.destroy();
		this.oRequestor.destroy();
		this.mHeaders = undefined;
		this.mMetadataHeaders = undefined;
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
	 * Detach event handler <code>fnFunction</code> from the 'sessionTimeout' event of this model.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {sap.ui.model.odata.v4.ODataModel} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataModel.prototype.detachSessionTimeout = function (fnFunction, oListener) {
		return this.detachEvent("sessionTimeout", fnFunction, oListener);
	};

	/**
	 * Returns the model's bindings.
	 *
	 * @returns {sap.ui.model.Binding[]}
	 *   A copy of an array with all bindings, or an empty array if there are no bindings
	 *
	 * @public
	 * @since 1.73.0
	 */
	ODataModel.prototype.getAllBindings = function () {
		return this.aAllBindings.slice();
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
	 * @returns {sap.ui.model.Binding[]}
	 *   A list of all dependent bindings, never <code>null</code>
	 *
	 * @private
	 */
	ODataModel.prototype.getDependentBindings = function (oParent) {
		return this.aAllBindings.filter(function (oBinding) {
			var oContext = oBinding.getContext();

			return oBinding.isRelative()
				&& (oContext === oParent
						|| oContext && oContext.getBinding && oContext.getBinding() === oParent);
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
	 * Returns a group property value.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyName
	 *   The group property in question
	 * @returns {string}
	 *   The group property value
	 * @throws {Error} If the name of the group property is not 'submit'
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 */
	ODataModel.prototype.getGroupProperty = function (sGroupId, sPropertyName) {
		switch (sPropertyName) {
			case "submit":
				if (sGroupId.startsWith("$auto.")) {
					return SubmitMode.Auto;
				}
				return this.mGroupProperties[sGroupId]
					? this.mGroupProperties[sGroupId].submit
					: SubmitMode.API;
			default:
				throw new Error("Unsupported group property: '" + sPropertyName + "'");
		}
	};

	/**
	 * Returns a map of HTTP headers used for data and metadata requests.
	 *
	 * @returns {object}
	 *   The map of HTTP headers
	 *
	 * @public
	 * @since 1.71
	 */
	ODataModel.prototype.getHttpHeaders = function () {
		var mHeadersCopy = Object.assign({}, this.mHeaders);

		delete mHeadersCopy["SAP-ContextId"];
		if (mHeadersCopy["X-CSRF-Token"] === null) { // no security token available
			delete mHeadersCopy["X-CSRF-Token"];
		}

		return mHeadersCopy;
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
	 * Returns the version of the OData service.
	 *
	 * @returns {string}
	 *   The version of the OData service
	 *
	 * @public
	 * @since 1.49.0
	 */
	// @override
	ODataModel.prototype.getODataVersion = function () {
		return this.sODataVersion;
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
	 * @param {string} [sGroupId]
	 *   A group ID as specified in {@link sap.ui.model.odata.v4.ODataModel}, except group IDs
	 *   having {@link sap.ui.model.odata.v4.SubmitMode.Direct}; if specified, only pending changes
	 *   related to that group ID are considered (since 1.70.0)
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 * @throws {Error}
	 *   If the given group ID is invalid, or has {@link sap.ui.model.odata.v4.SubmitMode.Direct}
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataModel.prototype.hasPendingChanges = function (sGroupId) {
		if (sGroupId !== undefined) {
			this.checkBatchGroupId(sGroupId);
			if (this.isAutoGroup(sGroupId)
					&& this.oRequestor.hasPendingChanges("$parked." + sGroupId)) {
				return true;
			}
		}

		return this.oRequestor.hasPendingChanges(sGroupId);
	};

	/**
	 * Initializes the security token used by this model's requestor.
	 *
	 * @private
	 */
	ODataModel.prototype.initializeSecurityToken = function () {
		// a failure is not logged, only the failed request for the service document appears
		this.oRequestor.refreshSecurityToken().catch(function () {});
	};

	/**
	 * Determines whether the given group ID uses mode {@link sap.ui.model.odata.v4.SubmitMode.Auto}
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {boolean|undefined} Whether it is an auto group
	 *
	 * @private
	 */
	ODataModel.prototype.isAutoGroup = function (sGroupId) {
		return this.getGroupProperty(sGroupId, "submit") === SubmitMode.Auto;
	};

	/**
	 * Determines whether the given group ID uses mode
	 * {@link sap.ui.model.odata.v4.SubmitMode.Direct}
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {boolean|undefined} Whether it is a direct group
	 *
	 * @private
	 */
	ODataModel.prototype.isDirectGroup = function (sGroupId) {
		return this.getGroupProperty(sGroupId, "submit") === SubmitMode.Direct;
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
	 * Creates a lock for a group. {@link sap.ui.model.odata.v4._Requestor#submitBatch} has to wait
	 * until all locks for <code>sGroupId</code> are unlocked. Delegates to
	 * {@link sap.ui.model.odata.v4.lib._Requestor#lockGroup}.
	 *
	 * The goal of such a lock is to allow using an API that creates a request in a batch group and
	 * immediately calling {@link #submitBatch} for this group. In such cases that request has to be
	 * sent with the batch request triggered by {@link #submitBatch}, even if that request is
	 * created later asynchronously. To achieve this, the API function creates a lock that blocks
	 * the batch request until that request is created.
	 *
	 * For performance reasons it is possible to create a group lock that actually doesn't lock. All
	 * non-API functions use this group lock instead of the group ID so that a lock is possible. But
	 * not in every case a lock is necessary and suitable.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {object} oOwner
	 *   The lock's owner for debugging
	 * @param {boolean} [bLocked]
	 *   Whether the created lock is locked
	 * @param {boolean} [bModifying]
	 *   Whether the reason for the group lock is a modifying request
	 * @param {function} [fnCancel]
	 *   Function that is called when the group lock is canceled
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 *
	 * @private
	 */
	ODataModel.prototype.lockGroup = function (sGroupId, oOwner, bLocked, bModifying, fnCancel) {
		return this.oRequestor.lockGroup(sGroupId, oOwner, bLocked, bModifying, fnCancel);
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
	 *   The group ID to be used for refresh; valid values are <code>undefined</code>, '$auto',
	 *   '$auto.*', '$direct' or application group IDs as specified in
	 *   {@link sap.ui.model.odata.v4.ODataModel}. It is ignored for suspended bindings, because
	 *   resume uses the binding's group ID
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

		// Note: getBindings() returns an array that contains all bindings with change listeners (owned by Model)
		this.getBindings().forEach(function (oBinding) {
			if (oBinding.isRoot()) {
				// ignore the group ID for suspended bindings to avoid mismatches and errors; they
				// refresh via resume with their own group ID anyway
				oBinding.refresh(oBinding.isSuspended() ? undefined : sGroupId);
			}
		});
	};

	/**
	 * Reports the given bound OData messages by firing a <code>messageChange</code> event with
	 * the new messages.
	 *
	 * @param {string} sResourcePath
	 *   The resource path of the cache that saw the messages
	 * @param {object} mPathToODataMessages
	 *   Maps a cache-relative path with key predicates or indices to an array of messages with the
	 *   following properties. Each message is passed to the "technicalDetails" (see
	 *   _Helper.createTechnicalDetails). Currently the "technicalDetails" only contain an attribute
	 *   named "originalMessage" that contains the message that is received from back-end.
	 *   {string} code
	 *     The error code
	 *   {string} [longtextUrl]
	 *     The absolute URL for the message's long text
	 *   {string} message
	 *     The message text
	 *   {number} numericSeverity
	 *     The numeric message severity (1 for "success", 2 for "info", 3 for "warning" and 4 for
	 *     "error")
	 *   {string} target
	 *     The target for the message; if relative the reported target path is a concatenation of
	 *     the resource path, the cache-relative path and this property
	 *   {boolean} [technical]
	 *     Whether the message is reported as <code>technical</code> (supplied by #reportError)
	 *   {boolean} [transition]
	 *     Whether the message is reported as <code>persistent=true</code> and therefore needs to be
	 *     managed by the application
	 *   {object} [@$ui5.originalMessage]
	 *     The original message object supplied by #reportError. In case this is supplied it is used
	 *     in _Helper.createTechnicalDetails to create the "originalMessage" property
	 * @param {string[]} [aCachePaths]
	 *    An array of cache-relative paths of the entities for which non-persistent messages have to
	 *    be removed; if the array is not given, all entities are affected
	 *
	 * @private
	 */
	ODataModel.prototype.reportBoundMessages = function (sResourcePath, mPathToODataMessages,
			aCachePaths) {
		var sDataBindingPath = "/" + sResourcePath,
			aNewMessages = [],
			aOldMessages = [],
			that = this;

		Object.keys(mPathToODataMessages).forEach(function (sCachePath) {
			mPathToODataMessages[sCachePath].forEach(function (oRawMessage) {
				var sTarget = oRawMessage.target[0] === "/"
						? oRawMessage.target
						: _Helper.buildPath(sDataBindingPath, sCachePath, oRawMessage.target);

				aNewMessages.push(new Message({
					code : oRawMessage.code,
					descriptionUrl : oRawMessage.longtextUrl || undefined,
					message : oRawMessage.message,
					persistent : oRawMessage.transition,
					processor : that,
					target : sTarget,
					technical : oRawMessage.technical,
					technicalDetails : _Helper.createTechnicalDetails(oRawMessage),
					type : aMessageTypes[oRawMessage.numericSeverity] || MessageType.None
				}));
			});
		});
		(aCachePaths || [""]).forEach(function (sCachePath) {
			var sPath = _Helper.buildPath(sDataBindingPath, sCachePath);

			Object.keys(that.mMessages || {}).forEach(function (sMessageTarget) {
				if (sMessageTarget === sPath
						|| sMessageTarget.startsWith(sPath + "/")
						|| sMessageTarget.startsWith(sPath + "(")) {
					aOldMessages = aOldMessages.concat(
						that.mMessages[sMessageTarget].filter(function (oMessage) {
							return !oMessage.persistent;
						}));
				}
			});
		});
		if (aNewMessages.length || aOldMessages.length) {
			this.fireMessageChange({newMessages : aNewMessages, oldMessages : aOldMessages});
		}
	};

	/**
	 * Reports a technical error by firing a <code>messageChange</code> event with a new message and
	 * logging the error to the console. Takes care that the error is only reported once via the
	 * <code>messageChange</code> event. Existing messages remain untouched.
	 *
	 * @param {string} sLogMessage
	 *   The message to write to the console log
	 * @param {string} sReportingClassName
	 *   The name of the class reporting the error
	 * @param {Error} oError
	 *   The error
	 * @param {boolean|string} [oError.canceled]
	 *   A boolean value indicates whether the error is not reported but just logged to the
	 *   console with level DEBUG; example: errors caused by cancellation of backend requests.
	 *   For the string value "noDebugLog", the method does nothing; example: errors caused by
	 *   suspended bindings.
	 * @param {object} [oError.error]
	 *   An error response as sent from the OData server
	 * @param {object[]} [oError.error.details]
	 *   A list of detail messages sent from the OData server. These messages are reported, too.
	 * @param {string} [oError.requestUrl]
	 *   The request URL of the failed OData request, added by the requestor; it is required to
	 *   resolve a longtextUrl.
	 * @param {string} [oError.resourcePath]
	 *   The resource path by which the resource causing the error has originally been requested;
	 *   since a request can fail before reaching the server this may be set even if there is no
	 *   error property; it is required to resolve a longtextUrl or a target.
	 *
	 * @private
	 */
	ODataModel.prototype.reportError = function (sLogMessage, sReportingClassName, oError) {
		var aBoundMessages = [],
			sDetails,
			sResourcePath,
			aUnboundMessages = [];

		/*
		 * Clones the message object taking all relevant properties, converts the annotations for
		 * numeric severity and longtext to the corresponding properties and adds it to one of the
		 * arrays to be reported later.
		 * @param {object} oMessage The message
		 * @param {number} [iNumericSeverity] The numeric severity
		 * @param {boolean} [bTechnical] Whether the message is reported as technical
		 */
		function addMessage(oMessage, iNumericSeverity, bTechnical) {
			var oReportMessage = {
					code : oMessage.code,
					message : oMessage.message,
					numericSeverity : iNumericSeverity,
					technical : bTechnical || oMessage.technical,
					// use "@$ui5." prefix to overcome name collisions with instance annotations
					// returned from back-end.
					"@$ui5.originalMessage" : oMessage
				};

			Object.keys(oMessage).forEach(function (sProperty) {
				if (sProperty[0] === '@') {
					if (sProperty.endsWith(".numericSeverity")) {
						oReportMessage.numericSeverity = oMessage[sProperty];
					} else if (sProperty.endsWith(".longtextUrl") && oError.requestUrl
							&& sResourcePath) {
						oReportMessage.longtextUrl =
							_Helper.makeAbsolute(oMessage[sProperty], oError.requestUrl);
					}
				}
			});

			if (typeof oMessage.target !== "string") {
				aUnboundMessages.push(oReportMessage);
			} else if (oMessage.target[0] === "$" || !sResourcePath) {
				// target for the bound message is a system query option or cannot be resolved
				// -> report as unbound message
				oReportMessage.message = oMessage.target + ": " + oReportMessage.message;
				aUnboundMessages.push(oReportMessage);
			} else {
				oReportMessage.target = oMessage.target;
				oReportMessage.transition = true;
				aBoundMessages.push(oReportMessage);
			}
		}

		if (oError.canceled === "noDebugLog") {
			return;
		}

		sDetails = oError.stack || oError.message;
		if (sDetails.indexOf(oError.message) < 0) {
			sDetails = oError.message + "\n" + oError.stack;
		}

		if (oError.canceled) {
			Log.debug(sLogMessage, sDetails, sReportingClassName);
			return;
		}

		Log.error(sLogMessage, sDetails, sReportingClassName);
		if (oError.$reported) {
			return;
		}
		oError.$reported = true;

		if (oError.error) {
			sResourcePath = oError.resourcePath && oError.resourcePath.split("?")[0];
			addMessage(oError.error, 4 /* Error */, true);
			if (oError.error.details) {
				oError.error.details.forEach(function (oMessage) {
					addMessage(oMessage);
				});
			}
			if (aBoundMessages.length) {
				this.reportBoundMessages(sResourcePath, {"" : aBoundMessages}, []);
			}
		} else {
			addMessage(oError, 4 /* Error */, true);
		}

		this.reportUnboundMessages(sResourcePath, aUnboundMessages);
	};

	/**
	 * Reports the given unbound OData messages by firing a <code>messageChange</code> event with
	 * the new messages.
	 *
	 * @param {string} [sResourcePath]
	 *   The resource path of the request whose response contained the messages. If it is
	 *   <code>undefined</code> the message's long text URL cannot be determined.
	 * @param {object[]} [aMessages]
	 *   The array of messages as contained in the <code>sap-messages</code> response header with
	 *   the following properties. Each message is passed to the "technicalDetails" (see
	 *   _Helper.createTechnicalDetails). Currently the "technicalDetails" only contain an attribute
	 *   named "originalMessage" that contains the message that is received from back-end.
	 *   {string} code
	 *     The error code
	 *   {string} [longtextUrl]
	 *     The absolute URL for the message's long text
	 *   {string} message
	 *     The message text
	 *   {number} numericSeverity
	 *     The numeric message severity (1 for "success", 2 for "info", 3 for "warning" and 4 for
	 *     "error")
	 *   {boolean} [technical]
	 *     Whether the message is reported as <code>technical</code> (supplied by #reportError)
	 *   {object} [@$ui5.originalMessage]
	 *     The original message object supplied by #reportError. In case this is supplied it is used
	 *     in _Helper.createTechnicalDetails to create the "originalMessage" property
	 *
	 * @private
	 */
	ODataModel.prototype.reportUnboundMessages = function (sResourcePath, aMessages) {
		var that = this;

		if (aMessages && aMessages.length) {
			this.fireMessageChange({
				newMessages : aMessages.map(function (oMessage) {
					var sMessageLongTextUrl = oMessage.longtextUrl;

					return new Message({
						code : oMessage.code,
						descriptionUrl : sMessageLongTextUrl && sResourcePath
							? _Helper.makeAbsolute(sMessageLongTextUrl,
								that.sServiceUrl + sResourcePath)
							: undefined,
						message : oMessage.message,
						persistent : true,
						processor : that,
						target : "",
						technical : oMessage.technical,
						technicalDetails : _Helper.createTechnicalDetails(oMessage),
						type : aMessageTypes[oMessage.numericSeverity] || MessageType.None
					});
				})
			});
		}
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
		assert(oEntityContext.getModel() === this, "oEntityContext must belong to this model");
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
	 *   A valid group ID as specified in {@link sap.ui.model.odata.v4.ODataModel}. If it is
	 *   <code>undefined</code>, the model's <code>updateGroupId</code> is used. Note that the
	 *   default <code>updateGroupId</code> is '$auto', which is valid here since 1.67.0.
	 * @throws {Error}
	 *   If the given group ID is not a valid group ID, or has
	 *   {@link sap.ui.model.odata.v4.SubmitMode.Direct} (since 1.67.0,
	 *   {@link sap.ui.model.odata.v4.SubmitMode.Auto} is allowed), or if change requests for the
	 *   given group ID are running.
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor.
	 * @since 1.39.0
	 */
	ODataModel.prototype.resetChanges = function (sGroupId) {
		sGroupId = sGroupId || this.sUpdateGroupId;
		this.checkBatchGroupId(sGroupId);

		if (this.isAutoGroup(sGroupId)) {
			this.oRequestor.cancelChanges("$parked." + sGroupId);
		}
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
	 * @param {string} [sPath=""]
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

		if (sPath && sPath[0] === "/") {
			sResolvedPath = sPath;
		} else if (oContext) {
			sResolvedPath = oContext.getPath();
			if (sPath) {
				if (sResolvedPath.slice(-1) !== "/") {
					sResolvedPath += "/";
				}
				sResolvedPath += sPath;
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
	 * Submits the requests associated with the given group ID in one batch request. Requests from
	 * subsequent calls to this method for the same group ID may be combined in one batch request
	 * using separate change sets. For group IDs with {@link sap.ui.model.odata.v4.SubmitMode.Auto},
	 * only a single change set is used; this method is useful to repeat failed updates or creates
	 * (see {@link sap.ui.model.odata.v4.ODataListBinding#create}) together with all other requests
	 * for the given group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   A valid group ID as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 * @throws {Error}
	 *   If the given group ID is not a valid group ID or has
	 *   {@link sap.ui.model.odata.v4.SubmitMode.Direct}
	 *   (since 1.67.0, {@link sap.ui.model.odata.v4.SubmitMode.Auto} is allowed)
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.submitBatch = function (sGroupId) {
		var that = this;

		this.checkBatchGroupId(sGroupId);
		if (this.isAutoGroup(sGroupId)) {
			this.oRequestor.relocateAll("$parked." + sGroupId, sGroupId);
		} else {
			this.oRequestor.addChangeSet(sGroupId);
		}

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

	/**
	 * Iterates over this model's unresolved bindings and calls the function with the given name on
	 * each unresolved binding, passing the given parameter. Iteration stops if a function call on
	 * some unresolved binding returns a truthy value.
	 *
	 * @param {string} sCallbackName
	 *   The name of the function to be called on unresolved bindings; the function is called with
	 *   the given parameter
	 * @param {any} vParameter
	 *   Any parameter to be used as the only argument for the callback function
	 * @returns {boolean}
	 *   <code>true</code> if for one unresolved binding the function call returned a truthy value
	 *
	 * @private
	 */
	ODataModel.prototype.withUnresolvedBindings = function (sCallbackName, vParameter) {
		return this.aAllBindings.filter(function (oBinding) {
			return oBinding.isRelative() && !oBinding.getContext();
		}).some(function (oBinding) {
			return oBinding[sCallbackName](vParameter);
		});
	};

	return ODataModel;
});