/*!
 * ${copyright}
 */

/**
 * Model and related classes like bindings for OData V4.
 *
 * <b>Note:</b> Smart controls (<code>sap.ui.comp</code> library) do not support the SAPUI5 OData V4
 * model. Also controls such as {@link sap.ui.table.TreeTable} and
 * {@link sap.ui.table.AnalyticalTable} are not supported together with the SAPUI5 OData V4 model.
 * The interface for applications has been changed for easier and more efficient use of the model.
 * For a summary of these changes, see
 * {@link topic:abd4d7c7548d4c29ab8364d3904a6d74 Changes Compared to OData V2 Model}.
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
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Messaging",
	"sap/ui/core/Rendering",
	"sap/ui/core/Supportability",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/thirdparty/URI"
], function(ODataContextBinding, ODataListBinding, ODataMetaModel, ODataPropertyBinding, SubmitMode, _GroupLock, _Helper, _MetadataRequestor, _Parser, _Requestor, Log, Localization, SyncPromise, Messaging, Rendering, Supportability, CacheManager, Message, MessageType, BindingMode, BaseContext, Model, OperationMode, URI) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		// system query options allowed within a $expand query option
		aExpandQueryOptions = ["$count", "$expand", "$filter", "$levels", "$orderby", "$search",
			"$select"],
		// binding-specific parameters allowed in getKeepAliveContext
		aGetKeepAliveParameters = ["$$groupId", "$$patchWithoutSideEffects", "$$updateGroupId"],
		aMessageTypes = [
			undefined,
			MessageType.Success,
			MessageType.Information,
			MessageType.Warning,
			MessageType.Error
		],
		mSupportedEvents = {
			dataReceived : true,
			dataRequested : true,
			messageChange : true,
			propertyChange : true,
			sessionTimeout : true
		},
		mSupportedParameters = {
			annotationURI : true,
			autoExpandSelect : true,
			earlyRequests : true,
			groupId : true,
			groupProperties : true,
			httpHeaders : true,
			ignoreAnnotationsFromMetadata : true,
			metadataUrlParams : true,
			odataVersion : true,
			operationMode : true,
			serviceUrl : true,
			sharedRequests : true,
			supportReferences : true,
			updateGroupId : true,
			withCredentials : true
		},
		// system query options allowed in mParameters
		aSystemQueryOptions = ["$apply", "$count", "$expand", "$filter", "$orderby", "$search",
			"$select"],
		// valid header values: non-empty, only US-ASCII, no control chars
		rValidHeader = /^[ -~]+$/,
		/**
		 * Constructor for a new ODataModel.
		 *
		 * @param {object} mParameters
		 *   The parameters
		 * @param {string|string[]} [mParameters.annotationURI]
		 *   The URL (or an array of URLs) from which the annotation metadata are loaded.
		 *   The annotation files are merged into the service metadata in the given order (last one
		 *   wins). The same annotations are overwritten; if an annotation file contains other
		 *   elements (like a type definition) that are already merged, an error is thrown.
		 *   Supported since 1.41.0
		 * @param {boolean} [mParameters.autoExpandSelect]
		 *   Whether the OData model's bindings automatically generate $select and $expand system
		 *   query options from the binding hierarchy. Note: Dynamic changes to the binding
		 *   hierarchy are not supported. This parameter is supported since 1.47.0, and since 1.75.0
		 *   it also enables property paths containing navigation properties in
		 *   <code>$select</code>.
		 * @param {boolean} [mParameters.earlyRequests]
		 *   Whether the following is requested at the earliest convenience:
		 *   <ul>
		 *     <li> root $metadata document and annotation files;
		 *     <li> the security token.
		 *   </ul>
		 *   Note: The root $metadata document and annotation files are just requested but not yet
		 *   converted from XML to JSON unless really needed.
		 *   Supported since 1.53.0.
		 *   <b>BEWARE:</b> The default value may change to <code>true</code> in later releases.
		 *   You may also set {@link topic:26ba6a5c1e5c417f8b21cce1411dba2c Manifest Model Preload}
		 *   in order to further speed up the start of a UI5 component.
		 * @param {string} [mParameters.groupId="$auto"]
		 *   Controls the model's use of batch requests: '$auto' bundles requests from the model in
		 *   a batch request which is sent automatically before rendering; '$direct' sends requests
		 *   directly without batch; other values result in an error
		 * @param {object} [mParameters.groupProperties]
		 *   Controls the use of batch requests for application groups. A map of application
		 *   group IDs having an object with exactly one property <code>submit</code>. Valid values
		 *   are 'API', 'Auto', 'Direct' see {@link sap.ui.model.odata.v4.SubmitMode}. Supported
		 *   since 1.51.0
		 * @param {object} [mParameters.httpHeaders]
		 *   Map of HTTP header names to their values, see {@link #changeHttpHeaders}
		 * @param {boolean} [mParameters.ignoreAnnotationsFromMetadata]
		 *   Whether to ignore all annotations from service metadata and "cross-service references";
		 *   only the value <code>true</code> is allowed. Only annotations from annotation files
		 *   (see parameter "annotationURI") are loaded. This parameter is not inherited by value
		 *   list models. Supported since 1.121.0
		 * @param {object} [mParameters.metadataUrlParams]
		 *   Additional map of URL parameters used specifically for $metadata requests. Note that
		 *   "sap-context-token" applies only to the service's root $metadata, but not to
		 *   "cross-service references". Supported since 1.81.0
		 * @param {string} [mParameters.odataVersion="4.0"]
		 *   The version of the OData service. Supported values are "2.0" and "4.0".
		 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
		 *   The operation mode for filtering and sorting. Since 1.39.0, the operation mode
		 *   {@link sap.ui.model.odata.OperationMode.Server} is supported. All other operation modes
		 *   including <code>undefined</code> lead to an error if 'vFilters' or 'vSorters' are given
		 *   or if {@link sap.ui.model.odata.v4.ODataListBinding#filter} or
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} is called.
		 * @param {string} mParameters.serviceUrl
		 *   Root URL of the service to request data from. The path part of the URL must end with a
		 *   forward slash according to OData V4 specification ABNF, rule "serviceRoot". You may
		 *   append OData custom query options to the service root URL separated with a "?", for
		 *   example "/MyService/?custom=foo". See specification <a href=
		 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html#_Custom_Query_Options"
		 *   >"OData Version 4.0 Part 2: URL Conventions", "5.2 Custom Query Options"</a>. OData
		 *   system query options and OData parameter aliases lead to an error.
		 * @param {boolean} [mParameters.sharedRequests]
		 *   Whether all list bindings for the same resource path share their data, so that it is
		 *   requested only once; only the value <code>true</code> is allowed; see parameter
		 *   "$$sharedRequest" of {@link #bindList}. Additionally,
		 *   {@link sap.ui.model.BindingMode.OneWay} becomes the default binding mode and
		 *   {@link sap.ui.model.BindingMode.TwoWay} is forbidden. Note: This makes all bindings
		 *   read-only, so it may be especially useful for value list models. Supported since 1.80.0
		 * @param {boolean} [mParameters.supportReferences=true]
		 *   Whether <code>&lt;edmx:Reference></code> and <code>&lt;edmx:Include></code> directives
		 *   are supported in order to load schemas on demand from other $metadata documents and
		 *   include them into the current service ("cross-service references").
		 * @param {string} [mParameters.updateGroupId]
		 *   The group ID that is used for update requests. If no update group ID is specified,
		 *   <code>mParameters.groupId</code> is used. Valid update group IDs are
		 *   <code>undefined</code>, '$auto', '$auto.*', '$direct' or an application group ID.
		 * @param {boolean} [mParameters.withCredentials]
		 *   Whether the XMLHttpRequest is called with <code>withCredentials</code>, so that user
		 *   credentials are included in cross-origin requests by the browser (since 1.120.0)
		 * @throws {Error} If the given service
		 *   root URL does not end with a forward slash, if an unsupported parameter is given, if
		 *   OData system query options or parameter aliases are specified as parameters, if an
		 *   invalid group ID or update group ID is given, if the given operation mode is not
		 *   supported, if an annotation file cannot be merged into the service metadata, if an
		 *   unsupported value for <code>odataVersion</code> is given.
		 *
		 * @alias sap.ui.model.odata.v4.ODataModel
		 * @author SAP SE
		 * @class Model implementation for OData V4.
		 *
		 *   This model is not prepared to be inherited from.
		 *
		 *   Every resource path (relative to the service root URL, no query options) according to
		 *   <a href=
		 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html#resource-pathurl4"
		 *   >"4 Resource Path"</a> in specification "OData Version 4.0 Part 2: URL Conventions" is
		 *   a valid data binding path within this model if a leading slash is added; for example
		 *   "/" + "SalesOrderList('A%2FB%26C')" to access an entity instance with key "A/B&C". Note
		 *   that appropriate URI encoding is necessary, see the example of
		 *   {@link sap.ui.model.odata.v4.ODataUtils.formatLiteral}. "4.5.1 Addressing Actions"
		 *   needs an operation binding, see {@link sap.ui.model.odata.v4.ODataContextBinding}.
		 *
		 *   Note that the OData V4 model has its own {@link sap.ui.model.odata.v4.Context} class.
		 *   Bindings which are relative to such a V4 context depend on their corresponding parent
		 *   binding and do not access data with their own service requests unless parameters are
		 *   provided.
		 *
		 *   <b>Group IDs</b> control the model's use of batch requests. Valid group IDs are:
		 *   <ul>
		 *     <li> <b>$auto</b> and <b>$auto.*</b>: Bundles requests from the model in a batch
		 *       request which is sent automatically before rendering. You can use different
		 *       '$auto.*' group IDs to use different batch requests. The suffix may be any
		 *       non-empty string consisting of alphanumeric characters from the basic Latin
		 *       alphabet, including the underscore. The submit mode for these group IDs is always
		 *       {@link sap.ui.model.odata.v4.SubmitMode#Auto}.
		 *     <li> <b>$direct</b>: Sends requests directly without batch. The submit mode for this
		 *       group ID is always {@link sap.ui.model.odata.v4.SubmitMode#Direct}.
		 *     <li> An application group ID, which is a non-empty string consisting of alphanumeric
		 *       characters from the basic Latin alphabet, including the underscore. By default, an
		 *       application group has the submit mode {@link sap.ui.model.odata.v4.SubmitMode#API}.
		 *       It is possible to use a different submit mode; for details see
		 *       <code>mParameters.groupProperties</code>.
		 *   </ul>
		 *
		 * @extends sap.ui.model.Model
		 * @public
		 * @since 1.37.0
		 * @version ${version}
		 */
		ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel",
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */{
				constructor : constructor
			});

	//*********************************************************************************************
	// ODataModel
	//*********************************************************************************************

	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {object} mParameters
	 *   The parameters
	 * @throws {Error} If the given service root
	 *   URL does not end with a forward slash, if an unsupported parameter is given, if OData
	 *   system query options or parameter aliases are specified as parameters, if an invalid group
	 *   ID or update group ID is given, if the given operation mode is not supported, if an
	 *   annotation file cannot be merged into the service metadata, if an unsupported value for
	 *   <code>odataVersion</code> is given.
	 */
	function constructor(mParameters = {}) {
		var oGroupProperties,
			sLanguageTag = Localization.getLanguageTag().toString(),
			sODataVersion,
			sParameter,
			mQueryParams,
			sServiceUrl,
			oUri,
			mUriParameters,
			that = this;

		// do not pass any parameters to Model
		Model.call(this);

		sODataVersion = mParameters.odataVersion || "4.0";
		this.sODataVersion = sODataVersion;
		if (sODataVersion !== "4.0" && sODataVersion !== "2.0") {
			throw new Error("Unsupported value for parameter odataVersion: " + sODataVersion);
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
		if (mParameters.operationMode && mParameters.operationMode !== OperationMode.Server) {
			throw new Error("Unsupported operation mode: "
				+ mParameters.operationMode);
		}
		this.sOperationMode = mParameters.operationMode;
		// Note: strict checking for model's URI parameters, but "sap-*" is allowed
		mUriParameters = this.buildQueryOptions(oUri.query(true), false, true);
		// BEWARE: these are shared across all bindings!
		this.mUriParameters = mUriParameters;
		if (Supportability.isStatisticsEnabled()) {
			// Note: this way, "sap-statistics" is not sent within $batch
			mUriParameters = Object.assign({"sap-statistics" : true}, mUriParameters);
		}
		this.sServiceUrl = oUri.query("").toString();
		this.sGroupId = mParameters.groupId;
		if (this.sGroupId === undefined) {
			this.sGroupId = "$auto";
		}
		if (this.sGroupId !== "$auto" && this.sGroupId !== "$direct") {
			throw new Error("Group ID must be '$auto' or '$direct'");
		}
		_Helper.checkGroupId(mParameters.updateGroupId, false, false, "Invalid update group ID: ");
		this.sUpdateGroupId = mParameters.updateGroupId || this.getGroupId();
		this.mGroupProperties = {};
		for (const sGroupId in mParameters.groupProperties) {
			_Helper.checkGroupId(sGroupId, true);
			oGroupProperties = mParameters.groupProperties[sGroupId];
			if (typeof oGroupProperties !== "object"
					|| Object.keys(oGroupProperties).length !== 1
					|| !(oGroupProperties.submit in SubmitMode)) {
				throw new Error("Group '" + sGroupId + "' has invalid properties: '"
					+ oGroupProperties + "'");
			}
		}
		this.mGroupProperties = _Helper.clone(mParameters.groupProperties) || {};
		this.mGroupProperties.$auto = {submit : SubmitMode.Auto};
		this.mGroupProperties.$direct = {submit : SubmitMode.Direct};
		if (mParameters.autoExpandSelect !== undefined
				&& typeof mParameters.autoExpandSelect !== "boolean") {
			throw new Error("Value for autoExpandSelect must be true or false");
		}
		this.bAutoExpandSelect = mParameters.autoExpandSelect === true;
		if ("sharedRequests" in mParameters && mParameters.sharedRequests !== true) {
			throw new Error("Value for sharedRequests must be true");
		}
		this.bSharedRequests = mParameters.sharedRequests === true;
		this.bIgnoreETag = false;
		if ("ignoreAnnotationsFromMetadata" in mParameters
			&& mParameters.ignoreAnnotationsFromMetadata !== true) {
			throw new Error("Value for ignoreAnnotationsFromMetadata must be true");
		}

		// BEWARE: do not share mHeaders between _MetadataRequestor and _Requestor!
		this.mHeaders = {"Accept-Language" : sLanguageTag};
		this.mMetadataHeaders = {"Accept-Language" : sLanguageTag};

		mQueryParams = Object.assign({}, mUriParameters, mParameters.metadataUrlParams);
		this.oMetaModel = new ODataMetaModel(
			_MetadataRequestor.create(this.mMetadataHeaders, sODataVersion,
				mParameters.ignoreAnnotationsFromMetadata, mQueryParams,
				mParameters.withCredentials),
			this.sServiceUrl + "$metadata", mParameters.annotationURI, this,
			mParameters.supportReferences, mQueryParams["sap-language"]);
		this.oInterface = {
			fetchEntityContainer : this.oMetaModel.fetchEntityContainer.bind(this.oMetaModel),
			fetchMetadata : this.oMetaModel.fetchObject.bind(this.oMetaModel),
			fireDataReceived : this.fireDataReceived.bind(this),
			fireDataRequested : this.fireDataRequested.bind(this),
			fireSessionTimeout : function () {
				that.fireEvent("sessionTimeout");
			},
			getGroupProperty : this.getGroupProperty.bind(this),
			getMessagesByPath : this.getMessagesByPath.bind(this),
			getOptimisticBatchEnabler : this.getOptimisticBatchEnabler.bind(this),
			getReporter : this.getReporter.bind(this),
			isIgnoreETag : function () {
				return that.bIgnoreETag;
			},
			onCreateGroup : function (sGroupId) {
				if (that.isAutoGroup(sGroupId)) {
					that.addPrerenderingTask(that._submitBatch.bind(that, sGroupId, true));
				}
			},
			onHttpResponse : function (mHeaders) {
				const fnHttpListener = that.fnHttpListener; // avoid "this" when calling
				fnHttpListener?.({responseHeaders : mHeaders});
			},
			reportStateMessages : this.reportStateMessages.bind(this),
			reportTransitionMessages : this.reportTransitionMessages.bind(this),
			updateMessages : function (aOldMessages, aNewMessages) {
				Messaging.updateMessages(aOldMessages, aNewMessages);
			}
		};
		this.oRequestor = _Requestor.create(this.sServiceUrl, this.oInterface, this.mHeaders,
			mUriParameters, sODataVersion, mParameters.withCredentials);
		this.changeHttpHeaders(mParameters.httpHeaders);
		this.bEarlyRequests = mParameters.earlyRequests;
		if (this.bEarlyRequests) {
			this.oMetaModel.fetchEntityContainer(true);
			this.initializeSecurityToken();
			this.oRequestor.sendOptimisticBatch();
		}

		this.aAllBindings = [];
		this.oAnnotationChangePromise = null; // @see #_requestAnnotationChanges
		// The bindings holding keep-alive contexts without a $$getKeepAlive binding
		this.mKeepAliveBindingsByPath = {};
		this.mSupportedBindingModes = {
			OneTime : true,
			OneWay : true
		};
		if (mParameters.sharedRequests) {
			this.sDefaultBindingMode = BindingMode.OneWay;
		} else {
			this.sDefaultBindingMode = BindingMode.TwoWay;
			this.mSupportedBindingModes.TwoWay = true;
		}
		this.aPrerenderingTasks = null; // @see #addPrerenderingTask
		this.fnHttpListener = null;
		this.fnOptimisticBatchEnabler = null;
		// maps the path to the error for the next dataReceived event
		this.mPath2DataReceivedError = {};
		// maps a path to the difference between fireDataRequested and fireDataReceived calls, to
		// ensure the events are respectively fired once for a GET request
		this.mPath2DataRequestedCount = {};
	}

	/**
	 * Requests changes to annotations.
	 *
	 * @returns {Promise<Array<object>>|sap.ui.base.SyncPromise<undefined>}
	 *   A promise resolving with an optional array of change objects defining a metamodel path and
	 *   a value to be set for that path
	 *
	 * @private
	 * @see #setAnnotationChangePromise
	 */
	ODataModel.prototype._requestAnnotationChanges = function () {
		this.oAnnotationChangePromise ??= SyncPromise.resolve(); // now it's too late for the setter

		return this.oAnnotationChangePromise;
	};

	/**
	 * Submits the requests associated with this group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} [bCatch]
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
	 * The 'dataReceived' event is fired when the back-end data has been received on the client. It
	 * is only fired for GET requests and is to be used by applications to process an error. For
	 * each 'dataRequested' event, a 'dataReceived' event is fired.
	 *
	 * If a back-end request is successful, the event has almost no parameters. For compatibility
	 * with {@link sap.ui.model.Binding#event:dataReceived 'dataReceived'}, an event parameter
	 * <code>data : {}</code> is provided: "In error cases it will be undefined", but otherwise it
	 * is not. For additional property requests, the absolute path to the entity is also available.
	 *
	 * The 'dataReceived' event can be initiated by a binding or by additional property requests for
	 * an entity that already has been requested. Events initiated by a binding may be bubbled up to
	 * the model, while events initiated by additional property requests are fired directly by the
	 * model.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter. If multiple requests are processed within a single $batch
	 * (or even a single change set), the order of 'dataReceived' events is not guaranteed. For
	 * requests which are not processed because a previous request failed, <code>error.cause</code>
	 * points to the root cause error - you should either ignore those events, or unwrap the error
	 * to access the root cause immediately. For additional property requests, the absolute path to
	 * the entity is also available.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {object} [oEvent.getParameters.data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oEvent.getParameters.error]
	 *   The error object if a back-end request failed.
	 * @param {string} [oEvent.getParameters.path]
	 *   The absolute path to the entity which caused the event. The path is only provided for
	 *   additional property requests; for other requests it is <code>undefined</code>.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#dataReceived
	 * @public
	 * @see sap.ui.model.odata.v4.ODataContextBinding#event:dataReceived
	 * @see sap.ui.model.odata.v4.ODataListBinding#event:dataReceived
	 * @see sap.ui.model.odata.v4.ODataModel#event:dataRequested
	 * @since 1.106.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is only fired for GET requests. For each 'dataRequested' event, a 'dataReceived' event is
	 * fired.
	 *
	 * For additional property requests, the absolute path to the entity is available as an event
	 * parameter.
	 *
	 * The 'dataRequested' event can be initiated by a binding or by additional property requests
	 * for an entity that already has been requested.
	 * Events initiated by a binding may be bubbled up to the model, while events initiated by
	 * additional property requests are fired directly by the model. Every GET request caused by
	 * additional properties is causing one 'dataRequested' event.
	 *
	 * There are two kinds of requests leading to such an event:
	 * <ul>
	 *   <li> When a binding requests initial data, or a list binding requests data for additional
	 *     rows, the event is fired at the binding and may be bubbled up to the model. This includes
	 *     refreshes except those initiated by
	 *     {@link sap.ui.model.odata.v4.Context#requestSideEffects}.
	 *   <li> For additional property requests for an entity that already has been requested, the
	 *     event is only fired at the model.
	 * </ul>
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {string} [oEvent.getParameters.path]
	 *   The absolute path to the entity which caused the event. The path is only provided for
	 *   additional property requests; for other requests it is <code>undefined</code>.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#dataRequested
	 * @public
	 * @see sap.ui.model.odata.v4.ODataContextBinding#event:dataRequested
	 * @see sap.ui.model.odata.v4.ODataListBinding#event:dataRequested
	 * @see sap.ui.model.odata.v4.ODataModel#event:dataReceived
	 * @since 1.106.0
	 */

	/**
	 * The 'parseError' event is not supported by this model.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#parseError
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The <code>propertyChange</code> event is fired whenever one of this model's property bindings
	 * successfully {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue changes its value}
	 * due to {@link sap.ui.model.BindingMode.TwoWay two-way} data binding. This does not apply to
	 * {@link sap.ui.model.odata.v4.Context#setProperty} which represents controller code changes,
	 * not user input.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.Context} [oEvent.getParameters.context]
	 *   The property binding's {@link sap.ui.model.Binding#getContext context}, if available
	 * @param {string} oEvent.getParameters.path
	 *   The property binding's {@link sap.ui.model.Binding#getPath path}
	 * @param {Promise<void>} [oEvent.getParameters.promise]
	 *   A promise on the outcome of the PATCH request, much like
	 *   {@link sap.ui.model.odata.v4.Context#setProperty} provides it for
	 *   <code>bRetry === true</code>; missing in case there is no PATCH
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the property change: always <code>sap.ui.model.ChangeReason.Binding</code>
	 * @param {string} oEvent.getParameters.resolvedPath
	 *   The property binding's {@link sap.ui.model.Binding#getResolvedPath resolved path}
	 * @param {any} oEvent.getParameters.value
	 *   The property binding's new
	 *   {@link sap.ui.model.odata.v4.ODataPropertyBinding#getValue value}
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#propertyChange
	 * @public
	 * @see sap.ui.model.Model#propertyChange
	 * @since 1.110.0
	 */

	/**
	 * The 'requestCompleted' event is not supported by this model.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#requestCompleted
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'requestFailed' event is not supported by this model.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#requestFailed
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'requestSent' event is not supported by this model.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#requestSent
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'sessionTimeout' event is fired when the server has created a session for the model and
	 * this session ran into a timeout due to inactivity.
	 *
	 * @event sap.ui.model.odata.v4.ODataModel#sessionTimeout
	 * @public
	 * @since 1.66.0
	 */

	/**
	 * Adds a task that is guaranteed to run once, just before the next rendering without initiating
	 * a rendering request. A watchdog ensures that the task is run soon, even if no rendering
	 * occurs.
	 *
	 * @param {function} fnPrerenderingTask
	 *   A function that is called before the rendering
	 * @param {boolean} [bFirst]
	 *   Whether the task should become the first one, not the last one
	 * @private
	 */
	ODataModel.prototype.addPrerenderingTask = function (fnPrerenderingTask, bFirst) {
		var fnRunTasks, iTimeoutId,
			that = this;

		function runTasks(aTasks) {
			clearTimeout(iTimeoutId);
			while (aTasks.length) {
				aTasks.shift()();
			}
			if (that.aPrerenderingTasks === aTasks) {
				that.aPrerenderingTasks = null;
			}
		}

		if (!this.aPrerenderingTasks) {
			this.aPrerenderingTasks = [];
			fnRunTasks = runTasks.bind(null, this.aPrerenderingTasks);
			Rendering.addPrerenderingTask(fnRunTasks);
			// Add a watchdog to run the tasks in case there is no rendering. Ensure that the task
			// runs after all setTimeout(0) tasks scheduled from within the current task, even those
			// that were scheduled afterwards. A simple setTimeout(n) with n > 0 is not sufficient
			// because this doesn't help if the current task runs very long.
			iTimeoutId = setTimeout(function () {
				iTimeoutId = setTimeout(fnRunTasks, 0);
			}, 0);
		}
		if (bFirst) {
			this.aPrerenderingTasks.unshift(fnPrerenderingTask);
		} else {
			this.aPrerenderingTasks.push(fnPrerenderingTask);
		}
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'dataReceived' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.106.0
	 */
	ODataModel.prototype.attachDataReceived = function (fnFunction, oListener) {
		return this.attachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'dataRequested' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.106.0
	 */
	ODataModel.prototype.attachDataRequested = function (fnFunction, oListener) {
		return this.attachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * See {@link sap.ui.base.EventProvider#attachEvent}
	 *
	 * @param {string} sEventId The identifier of the event to listen for
	 * @param {object} [_oData]
	 * @param {function} [_fnFunction]
	 * @param {object} [_oListener]
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @see sap.ui.base.EventProvider#attachEvent
	 * @since 1.37.0
	 */
	// @override sap.ui.base.EventProvider#attachEvent
	ODataModel.prototype.attachEvent = function (sEventId, _oData, _fnFunction, _oListener) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId + "': v4.ODataModel#attachEvent");
		}
		return Model.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'sessionTimeout' event of this model.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
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
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in <a href=
	 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html"
	 *   >"OData Version 4.0 Part 2: URL Conventions"</a> or the binding-specific parameters as
	 *   specified below.
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via
	 *   {@link #createBindingContext}.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *     <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *       (unless starting with "sap-valid-")
	 *     <li> The $count, $expand, $filter, $levels, $orderby, $search and $select
	 *       "5.1 System Query Options"; OData V4 only allows $count, $filter, $levels, $orderby and
	 *       $search inside resource paths that identify a collection. In our case here, this means
	 *       you can only use them inside $expand.
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string|object} [mParameters.$expand]
	 *   The value for the "5.1.2 System Query Option $expand" or an object which determines that
	 *   value. The object is a map from expand path to expand options, where the options are again
	 *   maps of system query options, typically with string values. $count can also be given as a
	 *   <code>boolean</code> value, $expand can recursively be given as a map, $levels can also be
	 *   given as a <code>number</code> value, and $select can also be given as an array (but
	 *   without navigation paths). An empty map can also be given as <code>null</code> or
	 *   <code>true</code>. See also {@link topic:1ab4f62de6ab467096a2a98b363a1373 Parameters}.
	 * @param {string|string[]} [mParameters.$select]
	 *   A comma separated list or an array of items which determine the value for the
	 *   "5.1.3 System Query Option $select". Since 1.75.0, when using the "autoExpandSelect" model
	 *   parameter (see {@link sap.ui.model.odata.v4.ODataModel#constructor}), paths with navigation
	 *   properties can be included and will contribute to the "5.1.2 System Query Option $expand".
	 * @param {boolean} [mParameters.$$canonicalPath]
	 *   Whether a binding relative to an {@link sap.ui.model.odata.v4.Context} uses the canonical
	 *   path computed from its context's path for data service requests; only the value
	 *   <code>true</code> is allowed.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests initiated by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {boolean} [mParameters.$$inheritExpandSelect]
	 *   For operation bindings only: Whether $expand and $select from the parent binding are used
	 *   in the request sent on {@link sap.ui.model.odata.v4.ODataContextBinding#invoke}. If set to
	 *   <code>true</code>, the binding must not set the $expand itself, the operation must be
	 *   bound, and the return value and the binding parameter must belong to the same entity set.
	 * @param {boolean} [mParameters.$$ownRequest]
	 *   Whether the binding always uses an own service request to read its data; only the value
	 *   <code>true</code> is allowed.
	 * @param {boolean} [mParameters.$$patchWithoutSideEffects]
	 *   Whether implicit loading of side effects via PATCH requests is switched off; only the value
	 *   <code>true</code> is allowed. This sets the preference "return=minimal" and requires the
	 *   service to return an ETag header for "204 No Content" responses. If not specified, the
	 *   value of the parent binding is used.
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests initiated by this binding;
	 *   if not specified, either the parent binding's update group ID (if the binding is relative)
	 *   or the model's update group ID is used, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   The context binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided, for example if the binding parameter
	 *   $$inheritExpandSelect is set to <code>true</code> and the binding is no operation binding
	 *   or the binding has the parameter $expand.
	 *
	 * @public
	 * @see sap.ui.model.Model#bindContext
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#bindContext
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
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [vSorters=[]]
	 *   The dynamic sorters to be used initially. Call
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} to replace them. Static sorters, as
	 *   defined in the '$orderby' binding parameter, are always applied after the dynamic sorters.
	 *   Supported since 1.39.0.
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [vFilters=[]]
	 *   The dynamic {@link sap.ui.model.FilterType.Application application} filters to be used
	 *   initially. Call {@link sap.ui.model.odata.v4.ODataListBinding#filter} to replace them.
	 *   Static filters, as defined in the '$filter' binding parameter, are always combined with the
	 *   dynamic filters using a logical <code>AND</code>.
	 *   Supported since 1.39.0.
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in <a href=
	 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html"
	 *   >"OData Version 4.0 Part 2: URL Conventions"</a> or binding-specific parameters as
	 *   specified below.
	 *   Note: The binding creates its own data service request if it is absolute or if it has any
	 *   parameters or if it is relative and has a context created via {@link #createBindingContext}
	 *   or if it has sorters or filters.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *     <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *       (unless starting with "sap-valid-")
	 *     <li> The $apply, $count, $expand, $filter, $levels, $orderby, $search, and $select
	 *       "5.1 System Query Options"; OData V4 only allows $levels inside $expand.
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string} [mParameters.$apply]
	 *   The value for the "3 System Query Option $apply" (see also
	 *   <a href="https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>) as an alternative to
	 *   <code>$$aggregation</code>
	 * @param {string|boolean} [mParameters.$count]
	 *   The value for the "5.1.6 System Query Option $count", useful for creation at the end and
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#getCount}
	 * @param {string|object} [mParameters.$expand]
	 *   The value for the "5.1.2 System Query Option $expand" or an object which determines that
	 *   value. The object is a map from expand path to expand options, where the options are again
	 *   maps of system query options, typically with string values. $count can also be given as a
	 *   <code>boolean</code> value, $expand can recursively be given as a map, $levels can also be
	 *   given as a <code>number</code> value, and $select can also be given as an array (but
	 *   without navigation paths). An empty map can also be given as <code>null</code> or
	 *   <code>true</code>. See also {@link topic:1ab4f62de6ab467096a2a98b363a1373 Parameters}.
	 * @param {string} [mParameters.$filter]
	 *   The value for the "5.1.1 System Query Option $filter" used in addition to
	 *   <code>vFilters</code>
	 * @param {string|number} [mParameters.$orderby]
	 *   The value for the "5.1.4 System Query Option $orderby" used in addition to
	 *   <code>vSorters</code>
	 * @param {string} [mParameters.$search]
	 *   The value for the "5.1.7 System Query Option $search"; see also
	 *   <code>oAggregation.search</code> at
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation} and the note there!
	 * @param {string|string[]} [mParameters.$select]
	 *   A comma separated list or an array of items which determine the value for the
	 *   "5.1.3 System Query Option $select". Since 1.75.0, when using the "autoExpandSelect" model
	 *   parameter (see {@link sap.ui.model.odata.v4.ODataModel#constructor}), paths with navigation
	 *   properties can be included and will contribute to the "5.1.2 System Query Option $expand".
	 * @param {object} [mParameters.$$aggregation]
	 *   An object holding the information needed for data aggregation, see
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation} for details.
	 * @param {boolean} [mParameters.$$canonicalPath]
	 *   Whether a binding relative to an {@link sap.ui.model.odata.v4.Context} uses the canonical
	 *   path computed from its context's path for data service requests; only the value
	 *   <code>true</code> is allowed.
	 * @param {boolean} [mParameters.$$clearSelectionOnFilter]
	 *   Whether the selection state of the list binding is cleared when a filter is changed; this
	 *   includes dynamic filters, '$filter', '$search', and <code>$$aggregation.search</code>.
	 *   Supported since 1.120.13.
	 * @param {boolean} [mParameters.$$getKeepAliveContext]
	 *   Whether this binding is considered for a match when {@link #getKeepAliveContext} is called;
	 *   only the value <code>true</code> is allowed. Must not be combined with <code>$apply</code>,
	 *   <code>$$aggregation</code>, <code>$$canonicalPath</code>, or <code>$$sharedRequest</code>.
	 *   If the binding is relative, <code>$$ownRequest</code> must be set as well. Supported since
	 *   1.99.0; since 1.113.0 it can be combined with <code>$$aggregation</code> for a recursive
	 *   hierarchy.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests initiated by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.$$operationMode]
	 *   The operation mode for filtering and sorting with the model's operation mode as default.
	 *   Since 1.39.0, the operation mode {@link sap.ui.model.odata.OperationMode.Server} is
	 *   supported. All other operation modes including <code>undefined</code> lead to an error if
	 *   'vFilters' or 'vSorters' are given or if
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#filter} or
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} is called.
	 * @param {boolean} [mParameters.$$patchWithoutSideEffects]
	 *   Whether implicit loading of side effects via PATCH requests is switched off; only the value
	 *   <code>true</code> is allowed. This sets the preference "return=minimal" and requires the
	 *   service to return an ETag header for "204 No Content" responses. If not specified, the
	 *   value of the parent binding is used.
	 * @param {boolean} [mParameters.$$ownRequest]
	 *   Whether the binding always uses an own service request to read its data; only the value
	 *   <code>true</code> is allowed.
	 * @param {boolean} [mParameters.$$sharedRequest]
	 *   Whether multiple bindings for the same resource path share the data, so that it is
	 *   requested only once.
	 *   This parameter can be inherited from the model's parameter "sharedRequests", see
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}. Supported since 1.80.0
	 *   <b>Note:</b> These bindings are read-only, so they may be especially useful for value
	 *   lists; state messages (since 1.108.0) and the following APIs are <b>not</b> allowed
	 *   <ul>
	 *     <li> for the list binding itself:
	 *       <ul>
	 *         <li> {@link sap.ui.model.odata.v4.ODataListBinding#create}
	 *         <li> {@link sap.ui.model.odata.v4.ODataListBinding#getKeepAliveContext} or
	 *           {@link #getKeepAliveContext} as far as it affects such a list binding
	 *         <li> {@link sap.ui.model.odata.v4.ODataListBinding#resetChanges}
	 *       </ul>
	 *     <li> for the {@link sap.ui.model.odata.v4.ODataListBinding#getHeaderContext header
	 *       context} of a list binding:
	 *       <ul>
	 *         <li> {@link sap.ui.model.odata.v4.Context#requestSideEffects}
	 *       </ul>
	 *     <li> for the context of a list binding representing a single entity:
	 *       <ul>
	 *         <li> {@link sap.ui.model.odata.v4.Context#delete}
	 *         <li> {@link sap.ui.model.odata.v4.Context#refresh}
	 *         <li> {@link sap.ui.model.odata.v4.Context#replaceWith}
	 *         <li> {@link sap.ui.model.odata.v4.Context#requestSideEffects}
	 *         <li> {@link sap.ui.model.odata.v4.Context#setKeepAlive}
	 *         <li> {@link sap.ui.model.odata.v4.Context#setProperty}
	 *         <li> invoking a bound operation using <code>bReplaceWithRVC</code>, see
	 *           {@link sap.ui.model.odata.v4.ODataContextBinding#invoke}
	 *       </ul>
	 *     <li> for a dependent property binding of the list binding:
	 *       <ul>
	 *         <li> {@link sap.ui.model.odata.v4.ODataPropertyBinding#setValue}
	 *       </ul>
	 *   </ul>
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests initiated by this binding;
	 *   if not specified, either the parent binding's update group ID (if the binding is relative)
	 *   or the model's update group ID is used,
	 *   see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   The list binding
	 * @throws {Error} If
	 *   <ul>
	 *     <li> disallowed binding parameters are provided,
	 *     <li> an unsupported operation mode is used,
	 *     <li> the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *       <code>vFilters</code> together with other filters,
	 *     <li> {@link sap.ui.model.Filter.NONE} is combined with <code>$$aggregation</code>
	 *   </ul>
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
	 * a '/'; see {@link sap.ui.model.odata.v4.ODataMetaModel#requestObject} for more details.
	 *
	 * If the target type specified in the corresponding control property's binding info is "any"
	 * and the binding is relative or points to metadata, the binding may have an object value;
	 * in this case and unless the binding refers to an action advertisement the binding's mode must
	 * be {@link sap.ui.model.BindingMode.OneTime}. {@link sap.ui.model.BindingMode.OneWay OneWay}
	 * is also supported (@experimental as of version 1.126.0) for complex types and collections
	 * thereof; for entity types, use {@link #bindContext} instead.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in <a href=
	 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html"
	 *   >"OData Version 4.0 Part 2: URL Conventions"</a> or the binding-specific parameters as
	 *   specified below. The following OData query options are allowed:
	 *   <ul>
	 *     <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *       (unless starting with "sap-valid-")
	 *     <li> The $apply, $filter, and $search "5.1 System Query Options" if the path ends with a
	 *       "$count" segment.
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: The binding only creates its own data service request if it is absolute or if it is
	 *   relative to a context created via {@link #createBindingContext}. The binding parameters are
	 *   ignored in case the binding creates no own data service request or in case the binding
	 *   points to metadata.
	 * @param {string} [mParameters.$apply]
	 *   The value for the "3 System Query Option $apply" (see also
	 *   <a href="https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>), if the path ends with a "$count" segment
	 * @param {string} [mParameters.$filter]
	 *   The value for the "5.1.1 System Query Option $filter", if the path ends with a "$count"
	 *   segment
	 * @param {string} [mParameters.$search]
	 *   The value for the "5.1.7 System Query Option $search", if the path ends with a "$count"
	 *   segment
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests initiated by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {boolean} [mParameters.$$ignoreMessages]
	 *   Whether this binding does not propagate model messages to the control; supported since
	 *   1.82.0. Some composite types like {@link sap.ui.model.odata.type.Currency} or
	 *   {@link sap.ui.model.odata.type.Unit} automatically ignore messages for some of their parts
	 *   depending on their format options; setting this parameter to <code>true</code> or
	 *   <code>false</code> overrules the automatism of the type.
	 *
	 *   For example, a binding for a currency code is used in a composite binding for rendering the
	 *   proper number of decimals, but the currency code is not displayed in the attached control.
	 *   In that case, messages for the currency code shall not be displayed at that control, only
	 *   messages for the amount.
	 * @param {boolean} [mParameters.$$noPatch]
	 *   Whether changing the value of this property binding is not causing a PATCH request; only
	 *   the value <code>true</code> is allowed.
	 * @param {any} [mParameters.scope]
	 *   The scope for {@link sap.ui.model.odata.v4.ODataMetaModel#requestObject} if it is an
	 *   object; a custom query option otherwise
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
	 * Method not supported, use {@link #bindList} with <code>mParameters.$$aggregation</code>
	 * instead.
	 *
	 * @param {string} _sPath
	 * @param {sap.ui.model.Context} [_oContext]
	 * @param {sap.ui.model.Filter[]} [_aFilters]
	 * @param {object} [_mParameters]
	 * @param {sap.ui.model.Sorter[]} [_aSorters]
	 * @returns {sap.ui.model.TreeBinding}
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#bindTree
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#bindTree
	ODataModel.prototype.bindTree = function (_sPath, _oContext, _aFilters, _mParameters,
			_aSorters) {
		throw new Error("Unsupported operation: v4.ODataModel#bindTree");
	};

	/**
	 * Constructs a map of query options from the given binding parameters.
	 * Parameters starting with '$$' indicate binding-specific parameters, which must not be part
	 * of a back-end query; they are ignored and not added to the map.
	 * The following query options are disallowed:
	 * <ul>
	 *   <li> System query options (key starts with "$"), unless
	 *     <code>bSystemQueryOptionsAllowed</code> is set
	 *   <li> Parameter aliases (key starts with "@")
	 *   <li> Custom query options starting with "sap-" (unless starting with "sap-valid-"), unless
	 *     <code>bSapAllowed</code> is set
	 * </ul>
	 *
	 * @param {object} [mParameters={}]
	 *   Map of binding parameters
	 * @param {boolean} [bSystemQueryOptionsAllowed]
	 *   Whether system query options are allowed
	 * @param {boolean} [bSapAllowed]
	 *   Whether custom query options starting with "sap-" are allowed (Note: "sap-valid-" is always
	 *   allowed)
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
			mTransformedOptions = Object.assign({}, mParameters); // shallow clone

		/*
		 * Parses the query options for the given option name "sOptionName" in the given map of
		 * query options "mOptions" to an object if necessary.
		 * Validates if the given query option name is allowed.
		 *
		 * @param {object} mOptions Map of query options by name
		 * @param {string} sOptionName Name of the query option
		 * @param {string[]} aAllowed The allowed system query options
		 * @throws {error} If the given query option name is not allowed
		 */
		function parseAndValidateSystemQueryOption(mOptions, sOptionName, aAllowed) {
			var sExpandOptionName,
				mExpandOptions,
				sExpandPath,
				vValue = mOptions[sOptionName];

			if (!bSystemQueryOptionsAllowed || !aAllowed.includes(sOptionName)) {
					throw new Error("System query option " + sOptionName + " is not supported");
			}
			if ((sOptionName === "$expand" || sOptionName === "$select")
					&& typeof vValue === "string") {
				vValue = _Parser.parseSystemQueryOption(sOptionName + "=" + vValue)[sOptionName];
				mOptions[sOptionName] = vValue;
			}
			if (sOptionName === "$expand") {
				vValue = mOptions[sOptionName] = _Helper.clone(vValue); // deep clone needed!
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
				if (typeof vValue === "boolean") {
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
				if (sParameterName.startsWith("$$")) { // binding-specific parameter
					delete mTransformedOptions[sParameterName];
				} else if (sParameterName[0] === "@") { // OData parameter alias
					throw new Error("Parameter " + sParameterName + " is not supported");
				} else if (sParameterName[0] === "$") { // OData system query option
					parseAndValidateSystemQueryOption(mTransformedOptions, sParameterName,
						aSystemQueryOptions);
				// else: OData custom query option
				} else if (!bSapAllowed && sParameterName.startsWith("sap-")
						&& !sParameterName.startsWith("sap-valid-")) {
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
	 *   <li> OData V4 requests headers as specified in <a href=
	 *     "https://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Common_Headers"
	 *     >"8.1 Common Headers"</a> and "8.2 Request Headers" of the specification "OData Version
	 *     4.0 Part 1: Protocol"
	 *   <li> OData V2 request headers as specified in "2.2.5 HTTP Header Fields" of the
	 *     specification "OData Version 2 v10.1"
	 *   <li> The headers "Content-Id" and "Content-Transfer-Encoding"
	 *   <li> The header "SAP-ContextId"
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
	 * @param {Object<string|undefined>} [mHeaders]
	 *   Map of HTTP header names to their values
	 * @throws {Error}
	 *   If <code>mHeaders</code> contains unsupported headers, the same header occurs more than
	 *   once, a header value is invalid, or there are open requests.
	 *
	 * @public
	 * @see #getHttpHeaders
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
				mHeadersCopy[sHeaderName] = {key : sKey, value : sHeaderValue};
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
		_Helper.checkGroupId(sGroupId);
		if (this.isDirectGroup(sGroupId)) {
			throw new Error("Group ID does not use batch requests: " + sGroupId);
		}
	};

	/**
	 * Clears the session context represented by the "SAP-ContextId" header.
	 *
	 * @private
	 * @since 1.111.0
	 * @ui5-restricted sap.fe
	 */
	ODataModel.prototype.clearSessionContext = function () {
		this.oRequestor.clearSessionContext();
	};

	/**
	 * Creates a binding context for the given path. A relative path can only be resolved if a
	 * context is provided.
	 * Note: The parameters <code>mParameters</code>, <code>fnCallBack</code>, and
	 * <code>bReload</code> from {@link sap.ui.model.Model#createBindingContext} are not supported.
	 *
	 * It is possible to create binding contexts pointing to metadata. A '##' is recognized
	 * as separator in the resolved path and splits it into two parts; note that '#' may also be
	 * used as separator but is <b>deprecated</b> since 1.51.
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
	 *   <li> <code>/Products('42')/Name##@com.sap.vocabularies.Common.v1.Label</code>
	 *     points to the "Label" annotation of the "Name" property of the entity set "Products".
	 *   <li> <code>/##Products/Name@com.sap.vocabularies.Common.v1.Label</code> has no data path
	 *     part and thus starts at the metadata root. It also points to the "Label" annotation of
	 *     the "Name" property of the entity set "Products".
	 *   <li> <code>/Products##/</code>
	 *     points to the entity type (note the trailing '/') of the entity set "Products".
	 *   <li> <code>/EMPLOYEES('1')/##com.sap.Action</code>
	 *     points to the metadata of an action bound to the entity set "EMPLOYEES".
	 *   <li> <code>/EMPLOYEES('1')/#com.sap.Action</code>
	 *     does not point to metadata, but to the action advertisement.
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
	 *   if the given context is an {@link sap.ui.model.odata.v4.Context}
	 *
	 * @public
	 * @see sap.ui.model.Model#createBindingContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.createBindingContext = function (sPath, oContext) {
		var sDataPath,
			oMetaContext,
			sResolvedPath,
			iSeparator;

		/*
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

		iSeparator = sResolvedPath.indexOf("#");
		if (iSeparator >= 0) {
			sDataPath = sResolvedPath.slice(0, iSeparator);
			let sMetaPath = sResolvedPath.slice(iSeparator + 1);
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
	 * Creates an {@link sap.ui.core.message.Message} from a given "raw" message object. For a
	 * bound message, targets are resolved if they are not yet resolved. A message is called a bound
	 * message if is has a target, even if it is empty.
	 *
	 * @param {object} oRawMessage
	 *   The raw message
	 * @param {string} [oRawMessage.code]
	 *   The error code
	 * @param {string} [oRawMessage.longtextUrl]
	 *   The message longtext URL; can be relative to the given <code>sResourcePath</code>
	 * @param {string} [oRawMessage.message]
	 *   The message text
	 * @param {number} [oRawMessage.numericSeverity]
	 *   The numeric message severity
	 * @param {string} [oRawMessage.target]
	 *   The message target; can be relative to the <code>sResourcePath</code> plus
	 *   <code>sCachePath</code>
	 * @param {string[]} [oRawMessage.additionalTargets]
	 *   Array of additional targets with the same meaning as <code>target</code>
	 * @param {boolean} [oRawMessage.technical]
	 *   Whether the message is reported as <code>technical</code>
	 * @param {boolean} [oRawMessage.transition]
	 *   Whether the message is a transition message and not a state message. Unbound messages
	 *   cannot be state messages
	 * @param {object} [oRawMessage.@$ui5.error]
	 *   The original error instance
	 * @param {object} [oRawMessage.@$ui5.originalMessage]
	 *   The original message object which is used to create the technical details
	 * @param {string} [sResourcePath]
	 *   The resource path of the cache that saw the messages; used to resolve the targets and
	 *   the longtext URL
	 * @param {string} [sCachePath]
	 *   The cache-relative path to the entity; used to resolve the targets
	 * @param {object} [oOriginalMessage=oRawMessage]
	 *   The original message object which is used to create the technical details
	 * @returns {sap.ui.core.message.Message}
	 *   The created UI5 message object
	 *
	 * @private
	 */
	// eslint-disable-next-line valid-jsdoc -- .@$ui5. is not understood properly
	ODataModel.prototype.createUI5Message = function (oRawMessage, sResourcePath, sCachePath,
			oOriginalMessage = oRawMessage) {
		var bIsBound = typeof oRawMessage.target === "string",
			sMessageLongtextUrl = oRawMessage.longtextUrl,
			aTargets,
			that = this;

		function resolveTarget(sTarget) {
			return that.normalizeMessageTarget(sTarget[0] === "/"
				? sTarget
				: _Helper.buildPath("/" + sResourcePath, sCachePath, sTarget));
		}

		if (bIsBound) {
			sResourcePath &&= sResourcePath.split("?")[0]; // remove query string
			aTargets = [resolveTarget(oRawMessage.target)];
			if (oRawMessage.additionalTargets) {
				oRawMessage.additionalTargets.forEach(function (sTarget) {
					aTargets.push(resolveTarget(sTarget));
				});
			}
		}
		if (sMessageLongtextUrl && sResourcePath) {
			sMessageLongtextUrl = _Helper.makeAbsolute(sMessageLongtextUrl,
				this.sServiceUrl + sResourcePath);
		}

		return new Message({
			code : oRawMessage.code,
			descriptionUrl : sMessageLongtextUrl || undefined,
			message : oRawMessage.message,
			persistent : !bIsBound || oRawMessage.transition,
			processor : this,
			// Note: "" instead of undefined makes filtering easier (agreement with FE!)
			target : bIsBound ? aTargets : "",
			technical : oRawMessage.technical,
			technicalDetails : _Helper.createTechnicalDetails(oOriginalMessage),
			type : aMessageTypes[oRawMessage.numericSeverity] || MessageType.None
		});
	};

	/**
	 * Deletes the entity with the given canonical path on the server and in all bindings. Pending
	 * changes in contexts for this entity or in dependents thereof are canceled.
	 *
	 * Deleting in the bindings is only possible if the given path is a canonical path, and all
	 * paths follow these rules in addition to the OData 4.0 specification:
	 * <ul>
	 *   <li> Key properties are ordered just as in the metadata,
	 *   <li> for single key properties, the name of the key is omitted,
	 *   <li> for collection-valued navigation properties, all keys are present,
	 *   <li> the key-value pairs are encoded via encodeURIComponent.
	 * </ul>
	 *
	 * @param {string|sap.ui.model.odata.v4.Context} vCanonicalPath
	 *   The canonical path of the entity to delete, starting with a '/'; since 1.115.0, a context
	 *   instance can be given to determine both the path and ETag used for deletion on the server,
	 *   but no bindings are affected and {@link sap.ui.model.odata.v4.Context#delete} should be
	 *   used with a <code>null</code> group ID to clean up on the client side later
	 * @param {string} [sGroupId]
	 *   The group ID that is used for the DELETE request; if not specified, the model's
	 *   {@link #getUpdateGroupId update group ID} is used; the resulting group ID must not have
	 *   {@link sap.ui.model.odata.v4.SubmitMode.API}. You can use the '$single' group ID to send a
	 *   DELETE request as fast as possible; it will be wrapped in a batch request as for a '$auto'
	 *   group (since 1.121.0).
	 * @param {boolean} [bRejectIfNotFound]
	 *   If <code>true</code>, deletion fails if the entity does not exist (HTTP status code 404 or
	 *   412 due to the <code>If-Match: *</code> header); otherwise we assume that it has already
	 *   been deleted by someone else and report success
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result when the delete succeeded, or rejected
	 *   with an instance of Error otherwise. In the latter case the HTTP status code of the
	 *   response is given in the error's property <code>status</code>.
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the path does not start with a '/',
	 *     <li> the given group ID is invalid,
	 *     <li> the resulting group ID has {@link sap.ui.model.odata.v4.SubmitMode.API}.
	 *   </ul>
	 *
	 * @public
	 * @since 1.103.0
	 */
	ODataModel.prototype.delete = function (vCanonicalPath, sGroupId, bRejectIfNotFound) {
		var bInAllBindings,
			oPromise,
			that = this;

		if (typeof vCanonicalPath === "string") {
			if (vCanonicalPath[0] !== "/") {
				throw new Error("Invalid path: " + vCanonicalPath);
			}
			bInAllBindings = true;
			oPromise = Promise.resolve([vCanonicalPath, "*"]);
		} else {
			oPromise = Promise.all([
				vCanonicalPath.fetchCanonicalPath(),
				vCanonicalPath.fetchValue("@odata.etag", /*oListener*/null, /*bCached*/true)
			]);
		}
		_Helper.checkGroupId(sGroupId, false, true);
		sGroupId ??= this.getUpdateGroupId();
		if (this.isApiGroup(sGroupId)) {
			throw new Error("Illegal update group ID: " + sGroupId);
		}

		return oPromise.then(function (aResults) {
			return that.oRequestor.request("DELETE",
					aResults[0].slice(1) + _Helper.buildQuery(that.mUriParameters),
					that.lockGroup(sGroupId, that, true, true),
					{"If-Match" : aResults[1]}
			).catch(function (oError) {
				if (bRejectIfNotFound
						|| !(oError.status === 404 || bInAllBindings && oError.status === 412)) {
					that.reportError("Failed to delete " + aResults[0], sClassName, oError);
					throw oError;
				} // else: map 404/412 to 204
			}).then(function () {
				if (bInAllBindings) {
					that.aAllBindings.forEach(function (oBinding) {
						oBinding.onDelete(vCanonicalPath);
					});
				}
			});
		});
	};

	/**
	 * Destroys this model, its requestor and its meta model.
	 *
	 * @public
	 * @see sap.ui.model.Model#destroy
	 * @since 1.38.0
	 */
	// @override sap.ui.model.Model#destroy
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
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#destroyBindingContext
	ODataModel.prototype.destroyBindingContext = function () {
		throw new Error("Unsupported operation: v4.ODataModel#destroyBindingContext");
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'dataReceived' event of this model.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.106.0
	 */
	ODataModel.prototype.detachDataReceived = function (fnFunction, oListener) {
		return this.detachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'dataRequested' event of this model.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.106.0
	 */
	ODataModel.prototype.detachDataRequested = function (fnFunction, oListener) {
		return this.detachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'sessionTimeout' event of this model.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataModel.prototype.detachSessionTimeout = function (fnFunction, oListener) {
		return this.detachEvent("sessionTimeout", fnFunction, oListener);
	};

	/**
	 * Requests the metadata for the given meta path and calculates the key predicate by taking the
	 * key properties from the given entity instance.
	 *
	 * @param {string} sMetaPath
	 *   An absolute metadata path to the entity set
	 * @param {object} oEntity
	 *   The entity instance with the key property values
	 * @returns {sap.ui.base.SyncPromise<string|undefined>}
	 *   A promise that gets resolved with the proper URI encoded key predicate, for example
	 *   "(Sector='A%2FB%26C',ID='42')" or "('42')", or <code>undefined</code>, if at least one key
	 *   property is undefined. It gets rejected if the metadata cannot be fetched or in case the
	 *   entity has no key properties according to metadata.
	 *
	 * @private
	 * @see #requestKeyPredicate
	 */
	ODataModel.prototype.fetchKeyPredicate = function (sMetaPath, oEntity) {
		var mTypeForMetaPath = {};

		return this.oRequestor.fetchType(mTypeForMetaPath, sMetaPath).then(function () {
			return _Helper.getKeyPredicate(oEntity, sMetaPath, mTypeForMetaPath);
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.Model#filterMatchingMessages
	 */
	ODataModel.prototype.filterMatchingMessages = function (sMessageTarget, sPathPrefix) {
		return _Helper.hasPathPrefix(sMessageTarget, sPathPrefix)
			? this.mMessages[sMessageTarget]
			: [];
	};

	/**
	 * Fires a 'dataReceived' event. This function is only called for additional property requests
	 * for an entity that already has been requested. Bubbling up from a binding goes directly to
	 * fireEvent.
	 *
	 * @param {Error} [oError]
	 *   The error if an additional property request failed
	 * @param {string} [sPath]
	 *   The absolute path to the entity
	 *
	 * @private
	 */
	ODataModel.prototype.fireDataReceived = function (oError, sPath) {
		if (!(sPath in this.mPath2DataRequestedCount)) {
			throw new Error("Received more data than requested");
		}
		this.mPath2DataRequestedCount[sPath] -= 1;
		// first error wins
		this.mPath2DataReceivedError[sPath] ??= oError;
		if (this.mPath2DataRequestedCount[sPath] === 0) {
			this.fireEvent("dataReceived", this.mPath2DataReceivedError[sPath]
				? {error : this.mPath2DataReceivedError[sPath], path : sPath}
				: {data : {}, path : sPath});
			delete this.mPath2DataReceivedError[sPath];
			delete this.mPath2DataRequestedCount[sPath];
		}
	};

	/**
	 * Fires a 'dataRequested' event. This function is only called for additional property requests
	 * for an entity that already has been requested. Bubbling up from a binding goes directly to
	 * fireEvent.
	 *
	 *  @param {string} [sPath]
	 *   The absolute path to the entity
	 *
	 * @private
	 */
	ODataModel.prototype.fireDataRequested = function (sPath) {
		if (sPath in this.mPath2DataRequestedCount) {
			this.mPath2DataRequestedCount[sPath] += 1;
		} else {
			this.mPath2DataRequestedCount[sPath] = 1;
			this.fireEvent("dataRequested", {path : sPath});
		}
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
	 */
	// @override sap.ui.model.Model#getContext
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
	 * @since 1.122.0
	 * @ui5-restricted sap.fe
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
				if (sGroupId === "$single") {
					return "Single";
				}
				return this.mGroupProperties[sGroupId]
					? this.mGroupProperties[sGroupId].submit
					: SubmitMode.API;
			default:
				throw new Error("Unsupported group property: '" + sPropertyName + "'");
		}
	};

	/**
	 * Returns a map of HTTP headers used for data and metadata requests. While the "X-CSRF-Token"
	 * header is not used for metadata requests, it is still included here if available. The
	 * "SAP-ContextId" header is only included if requested explicitly (@since 1.86.0).
	 *
	 * @param {boolean} [bIncludeContextId]
	 *   Whether to include the "SAP-ContextId" header (@since 1.86.0)
	 * @returns {Object<string>}
	 *   The map of HTTP headers
	 *
	 * @public
	 * @see #changeHttpHeaders
	 * @since 1.71
	 */
	ODataModel.prototype.getHttpHeaders = function (bIncludeContextId) {
		var mHeadersCopy = Object.assign({}, this.mHeaders);

		if (!bIncludeContextId) {
			delete mHeadersCopy["SAP-ContextId"];
		}
		if (mHeadersCopy["X-CSRF-Token"] === null) { // no security token available
			delete mHeadersCopy["X-CSRF-Token"];
		}

		return mHeadersCopy;
	};

	/**
	 * Returns a context with the given path belonging to a matching list binding that has been
	 * marked with <code>$$getKeepAliveContext</code> (see {@link #bindList}). If such a matching
	 * binding can be found, a context is returned and kept alive (see
	 * {@link sap.ui.model.odata.v4.ODataListBinding#getKeepAliveContext}). Since 1.100.0 a
	 * temporary binding is used if no such binding could be found. If such a binding is created or
	 * resolved later, the context and its data are transferred to it, and the temporary binding is
	 * destroyed again.
	 *
	 * A <code>$$getKeepAliveContext</code> binding matches if its resolved binding path is the
	 * collection path of the context. If the context is created using a temporary binding and the
	 * parameters of the <code>$$getKeepAliveContext</code> binding differ from the given
	 * <code>mParameters</code> (except <code>$$groupId</code> which is especially used for the
	 * context), that binding later runs into an error when trying to read data.
	 *
	 * <b>Note</b>: The context received by this function may change its
	 * {@link sap.ui.model.odata.v4.Context#getBinding binding} during its lifetime.
	 *
	 * @param {string} sPath
	 *   A list context path to an entity, see also {@link #requestKeyPredicate}
	 * @param {boolean} [bRequestMessages]
	 *   Whether to request messages for the context's entity
	 * @param {object} [mParameters]
	 *   Parameters for the context or the temporary binding; supported since 1.100.0. All custom
	 *   query options and the following binding-specific parameters for a list binding may be given
	 *   (see {@link #bindList} for details).
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID used for read requests for the context's entity or its properties. If not
	 *   given, the model's {@link #getGroupId group ID} is used
	 * @param {boolean} [mParameters.$$patchWithoutSideEffects]
	 *   Whether implicit loading of side effects via PATCH requests is switched off
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests initiated by the context's binding
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The kept-alive context
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the model does not use the <code>autoExpandSelect</code> parameter,
	 *     <li> an invalid parameter was supplied,
	 *     <li> the path is not a list context path to an entity,
	 *     <li> multiple list bindings with <code>$$getKeepAliveContext</code> match,
	 *     <li> a suspended binding already having contexts matches, or
	 *     <li> {@link sap.ui.model.odata.v4.Context#setKeepAlive} fails
	 *   </ul>
	 *
	 * @public
	 * @since 1.99.0
	 */
	ODataModel.prototype.getKeepAliveContext = function (sPath, bRequestMessages,
			mParameters = {}) {
		var oListBinding,
			aListBindings,
			sListPath;

		if (!this.bAutoExpandSelect) {
			throw new Error("Missing parameter autoExpandSelect");
		}
		if (sPath[0] !== "/") {
			throw new Error("Not a list context path to an entity: " + sPath);
		}
		// Only excess parameters are rejected here; the correctness is checked by ODLB
		Object.keys(mParameters).forEach(function (sParameter) {
			if (sParameter.startsWith("sap-") && !sParameter.startsWith("sap-valid-")
					|| sParameter[0] === "$" && !aGetKeepAliveParameters.includes(sParameter)) {
				throw new Error("Invalid parameter: " + sParameter);
			}
		});
		sListPath = sPath.slice(0, _Helper.getPredicateIndex(sPath));
		oListBinding = this.mKeepAliveBindingsByPath[sListPath];
		if (!oListBinding) {
			aListBindings = this.aAllBindings.filter(function (oBinding) {
				if (oBinding.mParameters && oBinding.mParameters.$$getKeepAliveContext) {
					oBinding.removeCachesAndMessages(sListPath.slice(1), true);
				}
				return oBinding.isKeepAliveBindingFor && oBinding.isKeepAliveBindingFor(sListPath);
			});
			if (aListBindings.length > 1) {
				throw new Error("Multiple bindings with $$getKeepAliveContext for: " + sPath);
			}
			oListBinding = aListBindings[0];
			if (!oListBinding) {
				oListBinding = this.bindList(sListPath, undefined, undefined, undefined,
					mParameters);
				this.mKeepAliveBindingsByPath[sListPath] = oListBinding;
			}
		}

		return oListBinding.getKeepAliveContext(sPath, bRequestMessages, mParameters.$$groupId);
	};

	/**
	 * Takes the metadata for the given meta path and calculates the key predicate by taking the key
	 * properties from the given entity instance.
	 *
	 * @param {string} sMetaPath
	 *   An absolute metadata path to an entity set
	 * @param {object} oEntity
	 *   The entity instance with the key property values
	 * @returns {string|undefined}
	 *   The proper URI-encoded key predicate, for example "(Sector='A%2FB%26C',ID='42')" or
	 *   "('42')", or <code>undefined</code> if at least one key property is undefined.
	 * @throws {Error}
	 *   If the key predicate cannot be determined synchronously
	 *   (due to a pending metadata request), or if the metadata could not be fetched.
	 *
	 * @function
	 * @public
	 * @see #requestKeyPredicate
	 * @since 1.107.0
	 */
	ODataModel.prototype.getKeyPredicate = _Helper.createGetMethod("fetchKeyPredicate", true);

	/**
	 * Returns messages of this model associated with the given context, that is messages belonging
	 * to the object referred to by this context or a child object of that object. The messages are
	 * sorted by their {@link sap.ui.core.message.Message#getType type} according to the type's
	 * severity in a way that messages with highest severity come first.
	 *
	 * @param {sap.ui.model.Context} oContext The context to retrieve messages for
	 * @returns {sap.ui.core.message.Message[]}
	 *   The messages associated with this context sorted by severity; empty array in case no
	 *   messages exist
	 *
	 * @public
	 * @see sap.ui.model.Model#getMessages
	 * @since 1.85.0
	 */
	// @override sap.ui.model.Model#getMessages
	ODataModel.prototype.getMessages = function (oContext) {
		return this.getMessagesByPath(oContext.getPath(), /*bPrefixMatch*/true)
			.sort(Message.compare);
	};

	/**
	 * Returns the meta model for this ODataModel.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataMetaModel}
	 *   The meta model for this ODataModel
	 *
	 * @public
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#getMetaModel
	ODataModel.prototype.getMetaModel = function () {
		return this.oMetaModel;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#getObject
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
	ODataModel.prototype.getODataVersion = function () {
		return this.sODataVersion;
	};

	/**
	 * Getter for the optimistic batch enabler callback function; see
	 * {@link #setOptimisticBatchEnabler}.
	 *
	 *
	 * @returns {function(string)}
	 *   The optimistic batch enabler callback function
	 *
	 * @private
	 * @since 1.100.0
	 * @ui5-restricted sap.fe
	 */
	ODataModel.prototype.getOptimisticBatchEnabler = function () {
		return this.fnOptimisticBatchEnabler;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#getOriginalProperty
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
	 * Returns a function to be used as a Promise catch handler in order to report not yet reported
	 * errors.
	 *
	 * @returns {function(Error)}
	 *   A catch handler function expecting an <code>Error</code> instance. This function will call
	 *   {@link #reportError} if the error has not been reported yet
	 *
	 * @private
	 */
	ODataModel.prototype.getReporter = function () {
		var that = this;

		return function (oError) {
			if (!oError.$reported) {
				that.reportError(oError.message, sClassName, oError);
			}
		};
	};

	/**
	 * Returns this model's root URL of the service to request data from (as defined by the
	 * "serviceUrl" model parameter, see {@link sap.ui.model.odata.v4.ODataModel#constructor}),
	 * without query options.
	 *
	 * @returns {string} The service URL
	 *
	 * @public
	 * @since 1.107.0
	 */
	ODataModel.prototype.getServiceUrl = function () {
		return this.sServiceUrl;
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
	 * Returns <code>true</code> if there are pending changes, which can be updates, created
	 * entities (see {@link sap.ui.model.odata.v4.ODataListBinding#create}) or entity deletions
	 * (see {@link sap.ui.model.odata.v4.Context#delete}) that have not yet been successfully sent
	 * to the server. Those changes can be either sent via {@link #submitBatch} or reset via
	 * {@link #resetChanges}. Since 1.98.0,
	 * {@link sap.ui.model.odata.v4.Context#isInactive inactive} contexts are ignored, even when
	 * their {@link sap.ui.model.odata.v4.ODataListBinding#event:createActivate activation} has been
	 * prevented.
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
	 * Determines whether the given group ID uses mode {@link sap.ui.model.odata.v4.SubmitMode.API}
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {boolean|undefined} Whether it is an API group
	 *
	 * @private
	 */
	ODataModel.prototype.isApiGroup = function (sGroupId) {
		return this.getGroupProperty(sGroupId, "submit") === SubmitMode.API;
	};

	/**
	 * Determines whether the given group ID uses mode {@link sap.ui.model.odata.v4.SubmitMode.Auto}
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {boolean} Whether it is an auto group
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
	 * @returns {boolean} Whether it is a direct group
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
	 * Creates a lock for the given group ID. Even an automatic {@link #submitBatch} has to wait
	 * until all such locks are unlocked. The goal of such a lock is to wait with automatic PATCH
	 * requests initiated by user input until an event handler is called and runs an action.
	 *
	 * @param {string} sGroupId
	 *   A group ID
	 * @returns {object}
	 *   The group lock (with methods <code>isLocked</code> and <code>unlock</code>)
	 * @throws {Error}
	 *   If the given group does not have {@link sap.ui.model.odata.v4.SubmitMode.Auto}
	 *
	 * @private
	 * @since 1.115.0
	 * @ui5-restricted sap.fe
	 */
	ODataModel.prototype.lock = function (sGroupId) {
		var oGroupLock;

		if (!this.isAutoGroup(sGroupId)) {
			throw new Error("Group ID does not use automatic batch requests: " + sGroupId);
		}

		oGroupLock = this.lockGroup(sGroupId, this, true);

		return {
			isLocked : function () {
				return oGroupLock.isLocked();
			},
			unlock : function () {
				oGroupLock.unlock();
			}
		};
	};

	/**
	 * Creates a lock for a group. {@link sap.ui.model.odata.v4._Requestor#submitBatch} has to wait
	 * until all locks for <code>sGroupId</code> are unlocked. Delegates to
	 * {@link sap.ui.model.odata.v4.lib._Requestor#lockGroup}.
	 *
	 * The goal of such a lock is to allow using an API that creates a request in a batch group and
	 * immediately calling {@link #submitBatch} for this group. In such cases that request has to be
	 * sent with the batch request initiated by {@link #submitBatch}, even if that request is
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
	 * Normalizes the key predicates of a message's target using the sort order from the metadata,
	 * including proper URI encoding, e.g. "(Sector='A%2FB%26C',ID='42')" or "('42')".
	 *
	 * @param {string} sTarget
	 *   The message target
	 * @returns {string}
	 *   The normalized message target
	 *
	 * @private
	 */
	ODataModel.prototype.normalizeMessageTarget = function (sTarget) {
		var sCandidate,
			bFailed,
			sMetaPath = "",
			that = this;

		if (sTarget.includes("$uid=")) {
			// target containing a transient path is ignored
			return sTarget;
		}
		sCandidate = sTarget.split("/").map(function (sSegment) {
			var sCollectionName,
				iBracketIndex = sSegment.indexOf("("),
				aParts,
				mProperties,
				oType;

			/*
			 * Normalizes the value for the given alias.
			 * @param {string} sAlias
			 *   The property name/alias
			 * @returns {string|undefined}
			 *   The normalized value
			 */
			function getNormalizedValue(sAlias) {
				if (sAlias in mProperties) {
					return encodeURIComponent(decodeURIComponent(mProperties[sAlias]));
				}
				bFailed = true;
			}

			if (iBracketIndex < 0) {
				sMetaPath = _Helper.buildPath(sMetaPath, sSegment);
				return sSegment;
			}

			sCollectionName = sSegment.slice(0, iBracketIndex);
			sMetaPath = _Helper.buildPath(sMetaPath, sCollectionName);
			mProperties = _Parser.parseKeyPredicate(sSegment.slice(iBracketIndex));

			if ("" in mProperties) {
				return sCollectionName + "(" + getNormalizedValue("") + ")";
			}

			// could be async, but normally in this state we should already have
			// loaded the needed metadata
			oType = that.oMetaModel.getObject("/" + sMetaPath + "/");

			if (!(oType && oType.$Key)) {
				bFailed = true;
				return sSegment;
			}

			aParts = oType.$Key.map(function (sAlias) {
				var sValue = getNormalizedValue(sAlias);

				return oType.$Key.length > 1
					? sAlias + "=" + sValue
					: sValue;
			});

			return sCollectionName + "(" + aParts.join(",") + ")";
		}).join("/");

		return bFailed ? sTarget : sCandidate;
	};

	/**
	 * Refreshes the model by calling refresh on all bindings which have a change event handler
	 * attached.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request initiated by
	 * the last call determines the model's data; it is <b>independent</b> of the order of calls to
	 * {@link #submitBatch} with the given group ID.
	 *
	 * If there are pending changes, an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call {@link #submitBatch} to submit the
	 * changes or {@link #resetChanges} to reset the changes before calling {@link #refresh}.
	 *
	 * @param {string|boolean} [sGroupId]
	 *   The group ID to be used for refresh; valid values are <code>undefined</code>, '$auto',
	 *   '$auto.*', '$direct' or application group IDs as specified in
	 *   {@link sap.ui.model.odata.v4.ODataModel}. It is ignored for suspended bindings, because
	 *   resume uses the binding's group ID. A value of type boolean is not
	 *   accepted and an error will be thrown (a forced refresh is not supported).
	 * @throws {Error}
	 *   If the given group ID is invalid or if there are pending changes, see
	 *   {@link #hasPendingChanges}.
	 *   If a value of type boolean is given.
	 *
	 * @public
	 * @see sap.ui.model.Model#refresh
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataPropertyBinding#refresh
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#refresh
	ODataModel.prototype.refresh = function (sGroupId) {
		if (typeof sGroupId === "boolean") {
			throw new Error("Unsupported parameter bForceUpdate");
		}
		_Helper.checkGroupId(sGroupId);

		// Note: getBindings() returns an array that contains all bindings with change listeners
		// (owned by Model)
		this.getBindings().forEach(function (oBinding) {
			if (oBinding.isRoot()) {
				// ignore the group ID for suspended bindings to avoid mismatches and errors; they
				// refresh via resume with their own group ID anyway
				oBinding.refresh(oBinding.isSuspended() ? undefined : sGroupId);
			}
		});
	};

	/**
	 * Returns and releases the temporary keep-alive binding for the given path.
	 *
	 * @param {string} sPath - The path
	 * @returns {sap.ui.model.odata.v4.ODataListBinding|undefined}
	 *   The binding or <code>undefined</code> if there is none
	 *
	 * @private
	 */
	ODataModel.prototype.releaseKeepAliveBinding = function (sPath) {
		var oBinding = this.mKeepAliveBindingsByPath[sPath];

		if (oBinding) {
			delete this.mKeepAliveBindingsByPath[sPath];
			return oBinding;
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
	 *   The error, for example created by {@link sap.ui.model.odata.v4.lib._Helper.createError}
	 * @param {boolean|string} [oError.canceled]
	 *   A boolean value indicates whether the error is not reported but just logged to the
	 *   console with level DEBUG; example: errors caused by cancellation of back-end requests.
	 *   For the string value "noDebugLog", the method does nothing; example: errors caused by
	 *   suspended bindings.
	 * @param {object} [oError.error]
	 *   An error response as sent from the OData server
	 * @param {object[]} [oError.error.details]
	 *   A list of detail messages sent from the OData server. These messages are reported, too.
	 * @param {boolean} [oError.error.$ignoreTopLevel]
	 *   Whether <code>oError.error</code> itself is not reported, but only the
	 *   <code>oError.error.details</code>.
	 * @param {string} [oError.requestUrl]
	 *   The absolute request URL of the failed OData request; required to resolve a long text URL.
	 * @param {string} [oError.resourcePath]
	 *   The resource path by which the resource causing the error has originally been requested;
	 *   required to resolve a target.
	 *
	 * @private
	 */
	ODataModel.prototype.reportError = function (sLogMessage, sReportingClassName, oError) {
		var sDetails;

		if (oError.canceled === "noDebugLog") {
			return;
		}

		sDetails = oError.stack.includes(oError.message)
			? oError.stack
			: oError.message + "\n" + oError.stack;

		if (oError.canceled) {
			Log.debug(sLogMessage, sDetails, sReportingClassName);
			return;
		}

		Log.error(sLogMessage, sDetails, sReportingClassName);
		if (oError.$reported) {
			return;
		}
		oError.$reported = true;

		this.reportTransitionMessages(_Helper.extractMessages(oError), oError.resourcePath);
	};

	/**
	 * Reports the given OData state messages by firing a <code>messageChange</code> event with
	 * the new messages.
	 *
	 * Note that this method may also report transition messages that have been transported via the
	 * messages property of an entity.
	 *
	 * @param {string} sResourcePath
	 *   The resource path of the cache that saw the messages; used to resolve the targets and
	 *   the longtext URL
	 * @param {object} mPathToODataMessages
	 *   Maps a cache-relative path with key predicates or indices to an array of messages suitable
	 *   for {@link #createUI5Message}
	 * @param {string[]} [aCachePaths]
	 *   An array of cache-relative paths of the entities for which non-persistent messages have to
	 *   be removed; if the array is not given, all entities are affected
	 *
	 * @private
	 */
	ODataModel.prototype.reportStateMessages = function (sResourcePath, mPathToODataMessages,
			aCachePaths) {
		var sDataBindingPath = "/" + sResourcePath,
			aNewMessages = [],
			aOldMessages = [],
			that = this;

		Object.keys(mPathToODataMessages).forEach(function (sCachePath) {
			mPathToODataMessages[sCachePath].forEach(function (oRawMessage) {
				aNewMessages.push(that.createUI5Message(oRawMessage, sResourcePath, sCachePath));
			});
		});
		(aCachePaths || [""]).forEach(function (sCachePath) {
			var sPath = _Helper.buildPath(sDataBindingPath, sCachePath);

			Object.keys(that.mMessages).forEach(function (sMessageTarget) {
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
			Messaging.updateMessages(aOldMessages, aNewMessages);
		}
	};

	/**
	 * Reports the given OData transition messages by firing a <code>messageChange</code> event with
	 * the new messages. Takes care of adjusting message targets for bound operations' binding
	 * parameters.
	 *
	 * @param {object[]} aMessages
	 *   An array of messages suitable for {@link #createUI5Message}
	 * @param {string} [sResourcePath]
	 *   The resource path of the cache that saw the messages; used to resolve the longtext URL and
	 *   for adjusting a message target in case it is an operation parameter, except the binding
	 *   parameter
	 *
	 * @private
	 */
	ODataModel.prototype.reportTransitionMessages = function (aMessages, sResourcePath) {
		var oOperationMetadata;

		if (!aMessages.length) {
			return;
		}

		if (sResourcePath) {
			const oMetaModel = this.getMetaModel();
			sResourcePath = sResourcePath.split("?")[0]; // remove query string
			const sMetaPath = "/" + _Helper.getMetaPath(sResourcePath);
			const vMetadata = oMetaModel.getObject(sMetaPath);
			if (Array.isArray(vMetadata)) {
				// normally, ODCB#_invoke has already checked that there is exactly one overload;
				// in rare case w/o #invoke, such a check is missing
				oOperationMetadata = oMetaModel.getObject(sMetaPath + "/@$ui5.overload/0");
				sResourcePath = sResourcePath.slice(0, sResourcePath.lastIndexOf("/"));
			}
		}

		Messaging.updateMessages(undefined, aMessages.map((oMessage) => {
			const oOriginalMessage = oMessage;
			if (oOperationMetadata) {
				oMessage = _Helper.clone(oMessage);
				_Helper.adjustTargets(oMessage, oOperationMetadata);
			}
			oMessage.transition = true;

			return this.createUI5Message(oMessage, sResourcePath, undefined, oOriginalMessage);
		}));
	};

	/**
	 * Requests the metadata for the given meta path and calculates the key predicate by taking the
	 * key properties from the given entity instance.
	 *
	 * @param {string} sMetaPath
	 *   An absolute metadata path to the entity set
	 * @param {object} oEntity
	 *   The entity instance with the key property values
	 * @returns {Promise<string|undefined>}
	 *   A promise that gets resolved with the proper URI-encoded key predicate, for example
	 *   "(Sector='A%2FB%26C',ID='42')" or "('42')", or <code>undefined</code> if at least one key
	 *   property is undefined. It gets rejected if the metadata cannot be fetched, or in case the
	 *   entity has no key properties according to the metadata.
	 *
	 * @function
	 * @public
	 * @see #getKeyPredicate
	 * @since 1.107.0
	 */
	ODataModel.prototype.requestKeyPredicate = _Helper.createRequestMethod("fetchKeyPredicate");

	/**
	 * Requests side effects for the given paths on all affected root bindings.
	 *
	 * @param {string} sGroupId
	 *   The effective group ID
	 * @param {string[]} aAbsolutePaths
	 *   The absolute paths to request side effects for; each path must not start with the fully
	 *   qualified container name.
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   A promise which is resolved without a defined result, or rejected with an error if loading
	 *   of side effects fails, or <code>undefined</code> if there is nothing to do
	 *
	 * @private
	 */
	ODataModel.prototype.requestSideEffects = function (sGroupId, aAbsolutePaths) {
		if (!aAbsolutePaths.length) {
			return undefined; // nothing to do
		}

		return SyncPromise.all(
			this.aAllBindings.filter(function (oBinding) {
				return oBinding.isRoot();
			}).map(function (oRootBinding) {
				return oRootBinding.requestAbsoluteSideEffects(sGroupId, aAbsolutePaths);
			})
		);
	};

	/**
	 * Resets all property changes, created entities, and entity deletions associated with the given
	 * group ID which have not been successfully submitted via {@link #submitBatch}. Resets also
	 * invalid user input for the same group ID and (since 1.111.0) inactive contexts which had
	 * their activation prevented (see {@link sap.ui.model.odata.v4.Context#isInactive}). This
	 * function does not reset the invocation of OData operations
	 * (see {@link sap.ui.model.odata.v4.ODataContextBinding#invoke}).
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
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 * @see #hasPendingChanges
	 * @since 1.39.0
	 */
	ODataModel.prototype.resetChanges = function (sGroupId) {
		sGroupId ??= this.sUpdateGroupId;
		this.checkBatchGroupId(sGroupId);

		if (this.isAutoGroup(sGroupId)) {
			this.oRequestor.cancelChanges("$parked." + sGroupId);
			this.oRequestor.cancelChanges("$inactive." + sGroupId, true);
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
	 * @returns {string|undefined}
	 *   Resolved path or <code>undefined</code>
	 *
	 * @private
	 */
	// @override sap.ui.model.Model#resolve
	ODataModel.prototype.resolve = function (sPath, oContext) {
		var sResolvedPath;

		if (sPath && sPath[0] === "/") {
			sResolvedPath = sPath;
		} else if (oContext) {
			sResolvedPath = oContext.getPath();
			if (sPath) {
				if (!sResolvedPath.endsWith("/")) {
					sResolvedPath += "/";
				}
				sResolvedPath += sPath;
			}
		}

		if (sResolvedPath
				&& sResolvedPath !== "/"
				&& sResolvedPath[sResolvedPath.length - 1] === "/"
				&& !sResolvedPath.includes("#")) {
			sResolvedPath = sResolvedPath.slice(0, sResolvedPath.length - 1);
		}

		return sResolvedPath;
	};

	/**
	 * Sets a promise resolving with changes which are applied to all annotations loaded by this
	 * model, either as part of service metadata or from annotation files given via parameter
	 * "annotationURI" (see {@link #constructor}).
	 *
	 * @param {Promise<Array<object>>} oAnnotationChangePromise
	 *   A promise resolving with an array of change objects defining a metamodel path (pointing to
	 *   an annotation) and a value to be set for that annotation
	 * @throws {Error}
	 *   In case the promise is set too late or has already been set
	 *
	 * @private
	 * @since 1.127.0
	 * @ui5-restricted sap.ui.fl
	 */
	ODataModel.prototype.setAnnotationChangePromise = function (oAnnotationChangePromise) {
		if (this.oAnnotationChangePromise) {
			throw Error("Too late");
		}
		this.oAnnotationChangePromise = oAnnotationChangePromise;
	};

	/**
	 * Sets a listener for HTTP responses which is called every time with the full set of headers
	 * received.
	 *
	 * @param {function(object)} fnListener
	 *   A function which is called with an object containing the following properties. This
	 *   function must never fail!
	 *   <ul>
	 *     <li> <code>responseHeaders</code> A map from HTTP response header names (in all lower
	 *       case) to their string values. Of course, "Set-Cookie" is not available here.
	 *   </ul>
	 *
	 * @private
	 * @see #changeHttpHeaders
	 * @since 1.126.0
	 * @ui5-restricted sap.payroll
	 */
	ODataModel.prototype.setHttpListener = function (fnListener) {
		this.fnHttpListener = fnListener;
	};

	/**
	 * Tells whether an entity's ETag should be actively ignored (If-Match:*) for PATCH requests.
	 * Ignored if there is no ETag. Decided at the point in time when the PATCH is actually being
	 * sent.
	 *
	 * @param {boolean} bIgnoreETag - Whether an entity's ETag should be actively ignored
	 *
	 * @private
	 * @since 1.110.0
	 * @ui5-restricted sap.fe
	 */
	ODataModel.prototype.setIgnoreETag = function (bIgnoreETag) {
		this.bIgnoreETag = bIgnoreETag;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Model#setLegacySyntax
	ODataModel.prototype.setLegacySyntax = function () {
		throw new Error("Unsupported operation: v4.ODataModel#setLegacySyntax");
	};

	/**
	 * Setter for the optimistic batch enabler callback function. Setting this callback activates
	 * the optimistic batch feature. Via the callback the optimistic batch behavior can be enabled
	 * or disabled by returning either a boolean or a promise resolving with a boolean.
	 * As its first argument the callback gets the <code>window.location.href</code> at the point in
	 * time when the OData model is instantiated.
	 *
	 * If the callback returns or resolves with <code>true</code>, the OData model remembers the
	 * first sent $batch request. With the next model instantiation for the same key, this
	 * remembered $batch request will be sent at the earliest point in time in order to have the
	 * response already available when the first $batch request is initiated from the UI or the
	 * binding. If the returned promise is rejected, this error will be reported and the optimistic
	 * batch will be disabled.
	 *
	 * There are several preconditions on the usage of this API:
	 * <ul>
	 *   <li> Optimistic batch handling requires the "earlyRequests" model parameter; see
	 *     {@link sap.ui.model.odata.v4.ODataModel#constructor},
	 *   <li> the setter has to be called before the first $batch request is sent,
	 *   <li> the setter may only be called once for an OData model,
	 *   <li> the callback has to return a boolean, or a <code>Promise</code> resolving with a
	 *     boolean
	 *   <li> the callback is not called if the first $batch request is modifying, means that it
	 *     contains not only GET requests.
	 * </ul>
	 *
	 * @param {function(string):Promise<boolean>|boolean} fnOptimisticBatchEnabler
	 *   The optimistic batch enabler callback controlling whether optimistic batch should be used
	 * @throws {Error} If
	 * <ul>
	 *   <li> the earlyRequests model parameter is not set,
	 *   <li> the setter is called after a non-optimistic batch is sent,
	 *   <li> the given <code>fnOptimisticBatchEnabler</code> parameter is not a function
	 *   <li> the setter is called more than once
	 * </ul>
	 *
	 * @private
	 * @see #cleanUpOptimisticBatch
	 * @since 1.100.0
	 * @ui5-restricted sap.fe
	 */
	ODataModel.prototype.setOptimisticBatchEnabler = function (fnOptimisticBatchEnabler) {
		if (!this.bEarlyRequests) {
			throw new Error("The earlyRequests model parameter is not set");
		}
		if (this.oRequestor.isBatchSent()) {
			throw new Error("The setter is called after a non-optimistic batch is sent");
		}
		if (typeof fnOptimisticBatchEnabler !== "function") {
			throw new Error("The given fnOptimisticBatchEnabler parameter is not a function");
		}
		if (this.fnOptimisticBatchEnabler) {
			throw new Error("The setter is called more than once");
		}

		this.fnOptimisticBatchEnabler = fnOptimisticBatchEnabler;
	};

	/**
	 * Submits the requests associated with the given group ID in one batch request. Requests from
	 * subsequent calls to this method for the same group ID may be combined in one batch request
	 * using separate change sets. For group IDs with {@link sap.ui.model.odata.v4.SubmitMode.Auto},
	 * this method is useful to repeat failed updates or creates (see
	 * {@link sap.ui.model.odata.v4.ODataListBinding#create}) together with all other requests for
	 * the given group ID in one batch request.
	 *
	 * {@link #resetChanges} can be used to reset all pending changes instead. After that, or when
	 * the promise returned by this method is fulfilled, {@link #hasPendingChanges} will not report
	 * pending changes anymore.
	 *
	 * @param {string} sGroupId
	 *   A valid group ID as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result on the outcome of the HTTP request, or
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
		}
		this.oRequestor.addChangeSet(sGroupId);

		return new Promise(function (resolve) {
			that.addPrerenderingTask(function () {
				resolve(that._submitBatch(sGroupId));
			});
		});
	};

	/**
	 * Returns a string representation of this object including the service URL.
	 *
	 * @returns {string} A string description of this model
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.toString = function () {
		return sClassName + ": " + this.sServiceUrl;
	};

	/**
	 * Waits until the temporary keep-alive binding matching the given binding has created its
	 * cache, if required and there is such a binding.
	 *
	 * @param {sap.ui.model.odata.v4.ODataBinding} oBinding
	 *   The binding that possibly needs the cache of a temporary keep-alive binding
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result when that cache is available
	 *
	 * @private
	 */
	ODataModel.prototype.waitForKeepAliveBinding = function (oBinding) {
		if (oBinding.mParameters?.$$getKeepAliveContext) {
			// $$canonicalPath is not allowed, binding path and resource path are (almost) identical
			const oTemporaryBinding = this.mKeepAliveBindingsByPath[oBinding.getResolvedPath()];
			if (oTemporaryBinding) {
				return oTemporaryBinding.oCachePromise;
			}
		}
		return SyncPromise.resolve();
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
			return !oBinding.isResolved();
		}).some(function (oBinding) {
			return oBinding[sCallbackName](vParameter);
		});
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Cleans up the optimistic batch cache to a given point in time.
	 *
	 * @param {Date} [dOlderThan]
	 *   The point in time from which on older cache entries are deleted. If not supplied, all
	 *   optimistic batch entries are deleted.
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result, or rejected with an error if
	 *   deletion fails.
	 *
	 * @private
	 * @see #setOptimisticBatchEnabler
	 * @since 1.102.0
	 * @ui5-restricted sap.fe
	 */
	ODataModel.cleanUpOptimisticBatch = function (dOlderThan) {
		return CacheManager.delWithFilters({
			olderThan : dOlderThan,
			prefix : "sap.ui.model.odata.v4.optimisticBatch:"
		});
	};

	return ODataModel;
});
