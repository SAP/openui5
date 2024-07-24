/*!
 * ${copyright}
 */
/*eslint-disable max-len */
/**
 * OData-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.odata.v2
 * @public
 */

//Provides class sap.ui.model.odata.v2.ODataModel
sap.ui.define([
	"./_CreatedContextsCache",
	"./Context",
	"./ODataAnnotations",
	"./ODataContextBinding",
	"./ODataListBinding",
	"./ODataTreeBinding",
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/security/encodeURL",
	"sap/base/util/deepEqual",
	"sap/base/util/deepExtend",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/base/util/uid",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageParser",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/Supportability",
	"sap/ui/model/_Helper",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Model",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/odata/ODataPropertyBinding",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/UpdateMethod",
	"sap/ui/thirdparty/datajs",
	"sap/ui/thirdparty/URI",
	"sap/ui/util/isCrossOriginURL"
], function(_CreatedContextsCache, Context, ODataAnnotations, ODataContextBinding, ODataListBinding, ODataTreeBinding,
		assert, Log, Localization, encodeURL, deepEqual, deepExtend, each, extend, isEmptyObject, isPlainObject, merge,
		uid, SyncPromise, Messaging, Message, MessageParser, MessageType, Supportability, _Helper, BindingMode,
		BaseContext, FilterProcessor, Model, CountMode, MessageScope, ODataMetadata, ODataMetaModel, ODataMessageParser,
		ODataPropertyBinding, ODataUtils, OperationMode, UpdateMethod, OData, URI, isCrossOriginURL
) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v2.ODataModel",
		aDeepCreateParametersAllowlist = ["context", "properties"],
		mMessageType2Severity = {},
		aRequestSideEffectsParametersAllowList = ["groupId", "urlParameters"];

	mMessageType2Severity[MessageType.Error] = 0;
	mMessageType2Severity[MessageType.Warning] = 1;
	mMessageType2Severity[MessageType.Success] = 2;
	mMessageType2Severity[MessageType.Information] = 3;
	mMessageType2Severity[MessageType.None] = 4;

	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {string|object} vServiceUrl
	 *   Base URI of the service to request data from; additional URL parameters appended here will
	 *   be appended to every request. If you pass an object, it will be interpreted as the
	 *   parameter object (second parameter). Then <code>mParameters.serviceUrl</code> becomes a
	 *   mandatory parameter.
	 * @param {object} [mParameters]
	 *   Map which contains the following parameter properties:
	 * @param {string|string[]} [mParameters.annotationURI]
	 *   The URL (or an array of URLs) from which the annotation metadata should be loaded
	 * @param {string[]} [mParameters.bindableResponseHeaders=null]
	 *   Set this array to make custom response headers bindable via the entity's
	 *   "__metadata/headers" property
	 * @param {boolean} [mParameters.canonicalRequests=false]
	 *   Whether the model tries to calculate canonical URLs to request the data.
	 *
	 *   <b>For example:</b> An application displays the details of a sales order in a form with an
	 *   absolute binding path <code>/SalesOrderSet("1")</code>. The form embeds a table for the
	 *   sales order line items with a relative binding path <code>ToLineItems</code>. If the user
	 *   selects a sales order line item (e.g. Item "10"), the details of this sales order line item
	 *   are displayed in another form, which also contains a table for the sales order line item's
	 *   schedules with a relative binding path <code>ToSchedules</code>.
	 *
	 *   If the <code>canonicalRequests</code> parameter has the default value <code>false</code>,
	 *   then the OData model would request the data for the sales order line item's details form
	 *   with the following requests:<pre>
	 *   GET /&lt;serviceUrl&gt;/SalesOrderSet("1")/ToLineItems(SalesOrderID="1",ItemPosition="10")
	 *   GET /&lt;serviceUrl&gt;/SalesOrderSet("1")/ToLineItems(SalesOrderID="1",ItemPosition="10")/ToSchedules</pre>
	 *
	 *   Some back-end implementations do not support more than one navigation property in the
	 *   resource URL. In this case, set the <code>canonicalRequests</code> parameter to
	 *   <code>true</code>. The OData model then converts the long resource URLs to canonical URLs
	 *   and requests the data for the sales order line item's details form with the following
	 *   requests:<pre>
	 *   GET /&lt;serviceUrl&gt;/SalesOrderLineItemsSet(SalesOrderID="1",ItemPosition="10")
	 *   GET /&lt;serviceUrl&gt;/SalesOrderLineItemsSet(SalesOrderID="1",ItemPosition="10")/ToSchedules</pre>
	 * @param {sap.ui.model.BindingMode} [mParameters.defaultBindingMode=OneWay]
	 *   Sets the default binding mode for the model
	 * @param {sap.ui.model.odata.CountMode} [mParameters.defaultCountMode=Request]
	 *   Sets the default count mode for the model
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.defaultOperationMode=Default]
	 *   Sets the default operation mode for the model
	 * @param {sap.ui.model.odata.UpdateMethod} [mParameters.defaultUpdateMethod=Merge]
	 *   Default update method which is used for all update requests
	 * @param {boolean} [mParameters.disableHeadRequestForToken=false]
	 *   Set this flag to <code>true</code> if your service does not support <code>HEAD</code>
	 *   requests for fetching the service document (and thus the security token) to avoid sending a
	 *   <code>HEAD</code>-request before falling back to <code>GET</code>
	 * @param {boolean} [mParameters.disableSoftStateHeader=false]
	 *   Set this flag to <code>true</code> if you don´t want to start a new soft state session with
	 *   context ID (<code>SID</code>) through header mechanism. This is useful if you want to share
	 *   a <code>SID</code> between different browser windows
	 * @param {boolean} [mParameters.earlyTokenRequest=false]
	 *   Whether the security token is requested at the earliest convenience, if parameter
	 *   <code>tokenHandling</code> is <code>true</code>; supported since 1.79.0.
	 * @param {Object<string,string>} [mParameters.headers]
	 *   Map of custom headers (name/value pairs) like {"myHeader":"myHeaderValue",...}
	 * @param {boolean} [mParameters.ignoreAnnotationsFromMetadata]
	 *   Whether to ignore all annotations from service metadata, so that they are not available as V4 annotations
	 *   in this model's metamodel; see {@link #getMetaModel}. Only annotations from annotation files are loaded;
	 *   see the <code>annotationURI</code> parameter. Supported since 1.121.0
	 * @param {boolean} [mParameters.json=true]
	 *   If set to <code>true</code>, request payloads will be JSON, XML for <code>false</code>
	 * @param {boolean} [mParameters.loadAnnotationsJoined]
	 *   Whether the <code>metadataLoaded</code> event will be fired only after all annotations have
	 *   been loaded as well
	 * @param {string}[mParameters.maxDataServiceVersion='2.0']
	 *   Please use the following string format e.g. '2.0' or '3.0'. OData version supported by the
	 *   ODataModel: '2.0'
	 * @param {Object<string,string>} [mParameters.metadataNamespaces]
	 *   Map of namespace aliases (alias => URI) that can be used in metadata binding paths; each
	 *   alias is mapped to a corresponding namespace URI; when an alias is used in a metadata
	 *   binding path, it addresses a metadata extension that belongs to the corresponding namespace
	 *   URI; if <code>metadataNamespaces</code> is not given, the following default mappings will
	 *   be used:
	 *   <ul>
	 *   <li><code>"sap": "sap:"http://www.sap.com/Protocols/SAPData"</code></li>
	 *   <li><code>"m": "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"</code></li>
	 *   <li><code>"": "http://schemas.microsoft.com/ado/2007/06/edmx</code></li>
	 *   </ul>
	 * @param {Object<string,string>} [mParameters.metadataUrlParams]
	 *   Map of URL parameters for metadata requests - only attached to a <code>$metadata</code>
	 *   request
	 * @param {boolean} [mParameters.persistTechnicalMessages]
	 *   Whether technical messages should always be treated as persistent, since 1.83.0
	 * @param {boolean} [mParameters.preliminaryContext=false]
	 *   Whether a preliminary context will be created/used by a binding. When set to
	 *   <code>true</code>, the model can bundle the OData calls for dependent bindings into fewer
	 *   $batch requests. For more information, see
	 *   {@link topic:6c47b2b39db9404582994070ec3d57a2#loio62149734b5c24507868e722fe87a75db Optimizing Dependent Bindings}
	 * @param {boolean} [mParameters.refreshAfterChange=true]
	 *   Enable/disable automatic refresh after change operations
	 * @param {boolean} [mParameters.sequentializeRequests=false]
	 *   Whether to sequentialize all requests, needed in case the service cannot handle parallel
	 *   requests
	 * @param {string} [mParameters.serviceUrl]
	 *   Base URI of the service to request data from; this property is mandatory when the first
	 *   method parameter <code>serviceUrl</code> is omitted, but ignored otherwise
	 * @param {Object<string,string>} [mParameters.serviceUrlParams]
	 *   Map of URL parameters (name/value pairs) - these parameters will be attached to all
	 *   requests, except for the <code>$metadata</code> request
	 * @param {boolean|"skipServerCache"} [mParameters.tokenHandling=true]
	 *   Enable/disable security token handling. If the "skipServerCache" string value is provided, the security token
	 *   is not cached with the server as key in order to avoid failing $batch requests when accessing services running
	 *   on different back-end systems behind a reverse proxy (since 1.119).<br>
	 *   Use this option only if the system landscape is known.
	 * @param {boolean} [mParameters.tokenHandlingForGet=false]
	 *   Send security token for GET requests in case read access logging is activated for the OData
	 *   Service in the backend.
	 * @param {boolean} [mParameters.useBatch=true]
	 *   Whether all requests should be sent in batch requests
	 * @param {boolean} [mParameters.withCredentials=false]
	 *   If set to <code>true</code>, the user credentials are included in a cross-origin request. <b>Note:</b> This
	 *   only works if all requests are asynchronous.
	 * @param {string} [mParameters.password]
	 *   <b>Deprecated</b> for security reasons. Use strong server side authentication instead.
	 *   Password for the service.
	 * @param {boolean} [mParameters.skipMetadataAnnotationParsing]
	 *   <b>Deprecated</b> This parameter does not prevent creation of annotations from the metadata
	 *   document in this model's metamodel.
	 *   Whether to skip the automated loading of annotations from the metadata document. Loading
	 *   annotations from metadata does not have any effects (except the lost performance by
	 *   invoking the parser) if there are no annotations inside the metadata document
	 * @param {string} [mParameters.user]
	 *   <b>Deprecated</b> for security reasons. Use strong server side authentication instead.
	 *   UserID for the service.
	 *
	 * @class
	 * Model implementation based on the OData protocol.
	 *
	 * See chapter {@link topic:6c47b2b39db9404582994070ec3d57a2 OData V2 Model} for a general
	 * introduction.
	 *
	 * This model is not prepared to be inherited from.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataModel
	 * @extends sap.ui.model.Model
	 * @since 1.24.0
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v2.ODataModel", /** @lends sap.ui.model.odata.v2.ODataModel.prototype */ {

		constructor : function(vServiceUrl, mParameters) {
			Model.apply(this, arguments);
			var sUser,
				sPassword,
				mHeaders,
				vTokenHandling,
				bWithCredentials,
				sMaxDataServiceVersion,
				bUseBatch,
				bRefreshAfterChange,
				sAnnotationURI,
				bLoadAnnotationsJoined,
				sDefaultCountMode,
				bPreliminaryContext,
				sDefaultBindingMode,
				sDefaultOperationMode,
				mMetadataNamespaces,
				mServiceUrlParams,
				mMetadataUrlParams,
				bJSON,
				oMessageParser,
				bSkipMetadataAnnotationParsing,
				sDefaultUpdateMethod,
				bDisableHeadRequestForToken,
				bSequentializeRequests,
				bDisableSoftStateHeader,
				aBindableResponseHeaders,
				sWarmupUrl,
				bCanonicalRequests,
				bTokenHandlingForGet,
				bEarlyTokenRequest,
				bPersistTechnicalMessages,
				bIgnoreAnnotationsFromMetadata,
				that = this;

			if (typeof (vServiceUrl) === "object") {
				mParameters = vServiceUrl;
				this.sServiceUrl = mParameters.serviceUrl;
			} else {
				this.sServiceUrl = vServiceUrl;
			}

			// Creates a parameters map to be used for the instantiation of the code list model,
			// based on this OData model's parameters
			this.mCodeListModelParams = this.createCodeListModelParameters(mParameters);

			if (mParameters) {
				sUser = mParameters.user;
				sPassword = mParameters.password;
				mHeaders = mParameters.headers;
				vTokenHandling = mParameters.tokenHandling;
				bWithCredentials = mParameters.withCredentials;
				sMaxDataServiceVersion = mParameters.maxDataServiceVersion;
				bUseBatch = mParameters.useBatch;
				bRefreshAfterChange = mParameters.refreshAfterChange;
				sAnnotationURI = mParameters.annotationURI;
				bLoadAnnotationsJoined = mParameters.loadAnnotationsJoined;
				sDefaultBindingMode = mParameters.defaultBindingMode;
				sDefaultCountMode = mParameters.defaultCountMode;
				bPreliminaryContext = mParameters.preliminaryContext;
				sDefaultOperationMode = mParameters.defaultOperationMode;
				mMetadataNamespaces = mParameters.metadataNamespaces;
				mServiceUrlParams = mParameters.serviceUrlParams;
				mMetadataUrlParams = mParameters.metadataUrlParams;
				bJSON = mParameters.json;
				oMessageParser = mParameters.messageParser;
				bSkipMetadataAnnotationParsing = mParameters.skipMetadataAnnotationParsing;
				sDefaultUpdateMethod = mParameters.defaultUpdateMethod;
				bDisableHeadRequestForToken = mParameters.disableHeadRequestForToken;
				bSequentializeRequests = mParameters.sequentializeRequests;
				bDisableSoftStateHeader = mParameters.disableSoftStateHeader;
				aBindableResponseHeaders = mParameters.bindableResponseHeaders;
				sWarmupUrl = mParameters.warmupUrl;
				bCanonicalRequests = mParameters.canonicalRequests;
				bTokenHandlingForGet = mParameters.tokenHandlingForGet;
				bEarlyTokenRequest = mParameters.earlyTokenRequest;
				bPersistTechnicalMessages = mParameters.persistTechnicalMessages;
				bIgnoreAnnotationsFromMetadata = mParameters.ignoreAnnotationsFromMetadata;
			}

			/* Path cache to avoid multiple expensive resolve operations
			 * this.mPathCache =
			 * {
			 *		'aBindingPath': {
			 *			canonicalPath : 'The canonicalPath'
			 *		}
			 * }
			 */
			this.mPathCache = {};
			this.mInvalidatedPaths = {};
			this.bCanonicalRequests = !!bCanonicalRequests;
			this.bTokenHandlingForGet = !!bTokenHandlingForGet;
			this.sMessageScope = MessageScope.RequestedObjects;
			this.sWarmupUrl = sWarmupUrl;
			this.bWarmup = !!sWarmupUrl;
			this.mSupportedBindingModes = {"OneWay": true, "OneTime": true, "TwoWay":true};
			this.mUnsupportedFilterOperators = {"Any": true, "All": true};
			this.sDefaultBindingMode = sDefaultBindingMode || BindingMode.OneWay;
			this.bIsMessageScopeSupported = false;
			this.iPendingDeferredRequests = 0;

			this.bJSON = bJSON !== false;
			this.aPendingRequestHandles = [];
			this.aCallAfterUpdate = [];
			this.mRequests = {};
			this.mDeferredRequests = {};
			this.mChangedEntities = {};
			this.mChangeHandles = {};
			this.mDeferredGroups = {};
			this.mLaunderingState = {};
			this.sDefaultUpdateMethod = sDefaultUpdateMethod || UpdateMethod.Merge;

			this.bTokenHandling = vTokenHandling !== false;
			this.bWithCredentials = bWithCredentials === true;
			this.bUseBatch = bUseBatch !== false;
			this.bRefreshAfterChange = bRefreshAfterChange !== false;
			this.sMaxDataServiceVersion = sMaxDataServiceVersion;
			this.bLoadAnnotationsJoined = bLoadAnnotationsJoined !== false;
			this.sAnnotationURI = sAnnotationURI;
			this.sDefaultCountMode = sDefaultCountMode || CountMode.Request;
			this.sDefaultOperationMode = sDefaultOperationMode || OperationMode.Default;
			this.sMetadataLoadEvent = null;
			this.oMetadataFailedEvent = null;
			this.sRefreshGroupId = undefined;
			this.bIncludeInCurrentBatch = false;
			this.bSkipMetadataAnnotationParsing = !!bSkipMetadataAnnotationParsing;
			this.bDisableHeadRequestForToken = !!bDisableHeadRequestForToken;
			this.bSequentializeRequests = !!bSequentializeRequests;
			this.bDisableSoftStateHeader = !!bDisableSoftStateHeader;
			this.aBindableResponseHeaders = aBindableResponseHeaders ? aBindableResponseHeaders : null;
			this.bPreliminaryContext = bPreliminaryContext || false;
			this.mMetadataUrlParams = mMetadataUrlParams || {};
			this.mChangedEntities4checkUpdate = {};
			this.bPersistTechnicalMessages = bPersistTechnicalMessages === undefined
				? undefined : !!bPersistTechnicalMessages;
			this.oCreatedContextsCache = new _CreatedContextsCache();
			// a list of functions to be called to clean up expanded lists when the side effects
			// have been processed
			this.aSideEffectCleanUpFunctions = [];
			// a set of group IDs for which the "sap-messages" header must be "transientOnly" for
			// all create and change requests, which were caused by #createEntry or #setProperty
			this.oTransitionMessagesOnlyGroups = new Set();
			// whether annotations from metadata are ignored
			this.bIgnoreAnnotationsFromMetadata = !!bIgnoreAnnotationsFromMetadata;

			if (oMessageParser) {
				oMessageParser.setProcessor(this);
			}
			this.oMessageParser = oMessageParser;

			//collect internal changes in a deferred group as default
			this.setDeferredGroups(["changes"]);
			this.setChangeGroups({"*":{groupId: "changes"}});

			this.oData = {};
			this.oMetadata = null;
			this.oAnnotations = null;
			this.aUrlParams = [];
			this.fnRetryAfter = null;
			this.oRetryAfterError = null;
			this.pRetryAfter = null;

			// for sequentialized requests, keep a promise of the last request
			this.pSequentialRequestCompleted = Promise.resolve();

			// Promise for request chaining
			this.pReadyForRequest = Promise.resolve();

			// determine the service base url and the url parameters
			var aUrlParts = this.sServiceUrl.split("?");
			if (aUrlParts.length > 1) {
				this.sServiceUrl = aUrlParts[0];
				if (aUrlParts[1]) {
					this.aUrlParams.push(aUrlParts[1]);
				}
			}
			// Remove trailing slash (if any)
			this.sServiceUrl = this.sServiceUrl.replace(/\/$/, "");

			// store user and password
			this.sUser = sUser;
			this.sPassword = sPassword;

			if (Supportability.isStatisticsEnabled()) {
				// add statistics parameter to every request (supported only on Gateway servers)
				this.aUrlParams.push("sap-statistics=true");
			}

			this.oHeaders = {};
			this.setHeaders(mHeaders);

			if (!this.bDisableSoftStateHeader) {
				this.oHeaders["sap-contextid-accept"] = "header";
				this.mCustomHeaders["sap-contextid-accept"] = "header";
			}
			//use warmup url if provided
			this.sMetadataUrl = this.sWarmupUrl || this._createMetadataUrl("/$metadata");
			this.oSharedServerData = vTokenHandling === "skipServerCache"
				? undefined // server cache for security tokens is not used
				: ODataModel._getSharedData("server", this._getServerUrl());
			this.oSharedServiceData = ODataModel._getSharedData("service", this.sServiceUrl);
			this.oSharedMetaData = ODataModel._getSharedData("meta", this.sMetadataUrl);

			this.bUseCache = this._cacheSupported(this.sMetadataUrl);

			if (!this.oSharedMetaData.oMetadata || this.oSharedMetaData.oMetadata.bFailed) {
				//create Metadata object
				this.oMetadata = new ODataMetadata(this.sMetadataUrl, {
					async: true,
					cacheKey: this.bUseCache ? this.sMetadataUrl : undefined,
					user: this.sUser,
					password: this.sPassword,
					headers: this.mCustomHeaders,
					namespaces: mMetadataNamespaces,
					withCredentials: this.bWithCredentials
				});
				//no caching in warmup scenario
				if (!this.bWarmup) {
					this.oSharedMetaData.oMetadata = this.oMetadata;
				}
			} else {
				this.oMetadata = this.oSharedMetaData.oMetadata;
			}

			this.oAnnotations = new ODataAnnotations(this.oMetadata, {
				source: this.sAnnotationURI,
				skipMetadata: this.bSkipMetadataAnnotationParsing || this.bIgnoreAnnotationsFromMetadata,
				headers: this.mCustomHeaders,
				combineEvents: true,
				cacheKey: this._getAnnotationCacheKey(this.sMetadataUrl),
				useCache: this.bUseCache
			});
			if (!this.bDisableSoftStateHeader) {
				delete this.mCustomHeaders["sap-contextid-accept"];
			}
			this.oAnnotations.attachAllFailed(this.onAnnotationsFailed, this);
			this.oAnnotations.attachSomeLoaded(this.onAnnotationsLoaded, this);
			this.pAnnotationsLoaded = this.oAnnotations.loaded();

			if (mServiceUrlParams) {
				// new URL params used -> add to ones from sServiceUrl
				// do this after the Metadata request is created to not put the serviceUrlParams on this one
				this.aUrlParams = this.aUrlParams.concat(ODataUtils._createUrlParamsArray(mServiceUrlParams));
			}

			this.onMetadataFailed = function(oEvent) {
				that.fireMetadataFailed(oEvent.getParameters());
			};

			if (!this.oMetadata.isLoaded()) {
				this.oMetadata.attachFailed(this.onMetadataFailed);
			}

			this.oMetadata.loaded().then(function() {
				that._initializeMetadata();
			});

			// set the header for the accepted content types
			if (this.bJSON) {
				if (this.sMaxDataServiceVersion === "3.0") {
					this.oHeaders["Accept"] = "application/json;odata=fullmetadata";
				} else {
					this.oHeaders["Accept"] = "application/json";
				}
			} else {
				this.oHeaders["Accept"] = "application/atom+xml,application/atomsvc+xml,application/xml";
			}

			// If a cached token for the service is already available, use it. If no service token
			// is known yet, but a token for the same server, set the service token and use it.
			// This prevents services having different tokens to override each other token with every
			// request to the server.
			if (this.bTokenHandling) {
				if (this.oSharedServiceData.securityToken) {
					this.oHeaders["x-csrf-token"] = this.oSharedServiceData.securityToken;
				} else if (this.oSharedServerData && this.oSharedServerData.securityToken) {
					this.oSharedServiceData.securityToken = this.oSharedServerData.securityToken;
					this.oHeaders["x-csrf-token"] = this.oSharedServiceData.securityToken;
				}
				if (bEarlyTokenRequest) {
					this.securityTokenAvailable();
				}
			}
			this.oHeaders["Accept-Language"] = Localization.getLanguageTag().toString();

			// set version to 2.0 because 1.0 does not support e.g. skip/top, inlinecount...
			// states the version of the Open Data Protocol used by the client to generate the request.
			this.oHeaders["DataServiceVersion"] = "2.0";
			// the max version number the client can accept in a response
			this.oHeaders["MaxDataServiceVersion"] = "2.0";
			if (this.sMaxDataServiceVersion) {
				this.oHeaders["MaxDataServiceVersion"] = this.sMaxDataServiceVersion;
			}

			// "XMLHttpRequest" indicates that a data request is performed.
			// Gets only applied to non-crossOrigin requests because cross origin requests could
			// result in unwanted preflight requests if this header is set.
			// This behaviour is in sync with jQuery.ajax which is used by OData V4.
			if (!this.mCustomHeaders["X-Requested-With"] && !isCrossOriginURL(this.sServiceUrl)) {
				this.oHeaders["X-Requested-With"] = "XMLHttpRequest";
			}
		},
		metadata : {}
	});

	//
	ODataModel.M_EVENTS = {

			/**
			 * Event is fired if the metadata document was successfully loaded
			 */
			MetadataLoaded: "metadataLoaded",

			/**
			 * Event is fired if the metadata document has failed to load
			 */
			MetadataFailed: "metadataFailed",

			/**
			 * Event is fired if the annotations document was successfully loaded
			 */
			AnnotationsLoaded: "annotationsLoaded",

			/**
			 * Event is fired if the annotations document has failed to load
			 */
			AnnotationsFailed: "annotationsFailed",

			/**
			 * Depending on the model implementation a RequestFailed should be fired if a batch request to a backend failed.
			 * Contains the parameters:
			 * message, statusCode, statusText and responseText
			 *
			 */
			BatchRequestFailed : "batchRequestFailed",

			/**
			 * Depending on the model implementation a RequestSent should be fired when a batch request to a backend is sent.
			 * Contains Parameters: url, type, async
			 *
			 */
			BatchRequestSent : "batchRequestSent",

			/**
			 * Depending on the model implementation a RequestCompleted should be fired when a batch request to a backend is completed regardless if the request failed or succeeded.
			 * Contains Parameters: url, type, async, success, errorobject
			 *
			 */
			BatchRequestCompleted : "batchRequestCompleted"
	};

	/**
	 * Fired, when the metadata document was successfully loaded.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#metadataLoaded
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.metadata The parsed metadata
	 * @public
	 */

	/**
	 * Fired, when the metadata document has failed to load.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#metadataFailed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.metadata The parsed metadata
	 * @param {string} oEvent.getParameters.message A text that describes the failure.
	 * @param {string} oEvent.getParameters.statusCode HTTP status code returned by the request (if available)
	 * @param {string} oEvent.getParameters.statusText The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} oEvent.getParameters.responseText Response that has been received for the request, as a text string
	 * @param {object} oEvent.getParameters.response The response object - empty object if no response
	 * @public
	 */

	/**
	 * Fired, when the annotations document was successfully loaded. If there are more than one annotation documents loaded then this
	 * event is fired if at least one document was successfully loaded. Event is fired only once for all annotation documents.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#annotationsLoaded
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source[]} oEvent.getParameters.result An array consisting of one or several annotation sources and/or errors containing a source property and error details.
	 * @public
	 */

	/**
	 * Fired, when the annotations document failed to loaded. Event is fired only once for all annotation documents.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#annotationsFailed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {Error[]} oEvent.getParameters.result An array of Errors
	 * @public
	 */

	// document event again, as parameters differ from sap.ui.model.Model#event:requestFailed
	/**
	 * Fired, when data retrieval from a backend failed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#requestFailed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters

	 * @param {string} oEvent.getParameters.ID The request ID
	 * @param {string} oEvent.getParameters.url The URL which is sent to the backend
	 * @param {string} oEvent.getParameters.method The HTTP method
	 * @param {Object<string,string>} oEvent.getParameters.headers The request headers
	 * @param {boolean} oEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} oEvent.getParameters.success Request was successful or not
	 * @param {object} oEvent.getParameters.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @public
	 */

	// document event again, as parameters differ from sap.ui.model.Model#event:requestSent
	/**
	 * Fired, after a request has been sent to a backend.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#requestSent
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.ID The request ID
	 * @param {string} oEvent.getParameters.url The URL which is sent to the backend
	 * @param {string} oEvent.getParameters.method The HTTP method
	 * @param {Object<string,string>} oEvent.getParameters.headers The request headers
	 * @param {boolean} oEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 *
	 * @public
	 */

	// document event again, as parameters differ from sap.ui.model.Model#event:requestCompleted
	/**
	 * Fired, after a request has been completed (includes receiving a response),
	 * no matter whether the request succeeded or not.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#requestCompleted
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.ID The request ID
	 * @param {string} oEvent.getParameters.url The URL which is sent to the backend
	 * @param {string} oEvent.getParameters.method The HTTP method
	 * @param {Object<string,string>} oEvent.getParameters.headers The request headers
	 * @param {boolean} oEvent.getParameters.success Request was successful or not
	 * @param {boolean} oEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {object} oEvent.getParameters.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @public
	 */


	/**
	 * Fired, when a batch request failed.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#batchRequestFailed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters

	 * @param {string} oEvent.getParameters.ID The request ID
	 * @param {string} oEvent.getParameters.url The URL which is sent to the backend
	 * @param {string} oEvent.getParameters.method The HTTP method
	 * @param {Object<string,string>} oEvent.getParameters.headers The request headers
	 * @param {boolean} oEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} oEvent.getParameters.success Request was successful or not
	 * @param {object} oEvent.getParameters.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @param {array} oEvent.getParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:batchRequestFailed batchRequestFailed} event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachBatchRequestFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("batchRequestFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:batchRequestFailed batchRequestFailed} event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachBatchRequestFailed = function(fnFunction, oListener) {
		this.detachEvent("batchRequestFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:batchRequestFailed batchRequestFailed} to attached listeners.
	 *
	 * @param {object} oParameters Parameters to pass along with the event
	 * @param {string} oParameters.ID The request ID
	 * @param {string} oParameters.url The URL which is sent to the backend
	 * @param {string} oParameters.method The HTTP method
	 * @param {Object<string,string>} oParameters.headers The request headers
	 * @param {boolean} oParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} oParameters.success Request was successful or not
	 * @param {object} oParameters.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @param {array} oParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: URL, method, headers, response object
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireBatchRequestFailed = function(oParameters) {
		this.fireEvent("batchRequestFailed", oParameters);
		return this;
	};


	/**
	 * Fired after a request has been sent to a backend.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#batchRequestSent
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.url The URL which is sent to the backend
	 * @param {string} [oEvent.getParameters.type] The type of the request (if available)
	 * @param {boolean} [oEvent.getParameters.async] If the request is synchronous or asynchronous (if available)
	 * @param {array} oEvent.getParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:batchRequestSent batchRequestSent} event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachBatchRequestSent = function(oData, fnFunction, oListener) {
		this.attachEvent("batchRequestSent", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:batchRequestSent batchRequestSent} event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachBatchRequestSent = function(fnFunction, oListener) {
		this.detachEvent("batchRequestSent", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:batchRequestSent batchRequestSent} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.url] The URL which is sent to the backend.
	 * @param {string} [oParameters.type] The type of the request (if available)
	 * @param {boolean} [oParameters.async] If the request is synchronous or asynchronous (if available)
	 * @param {array} oParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireBatchRequestSent = function(oParameters) {
		this.fireEvent("batchRequestSent", oParameters);
		return this;
	};

	/**
	 * Fired after a request has been completed (includes receiving a response),
	 * no matter whether the request succeeded or not.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#batchRequestCompleted
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.ID The request ID
	 * @param {string} oEvent.getParameters.url The URL which is sent to the backend
	 * @param {string} oEvent.getParameters.method The HTTP method
	 * @param {Object<string,string>} oEvent.getParameters.headers The request headers
	 * @param {boolean} oEvent.getParameters.success Request was successful or not
	 * @param {boolean} oEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {array} oEvent.getParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @param {object} oEvent.getParameters.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:batchRequestCompleted batchRequestCompleted} event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachBatchRequestCompleted = function(oData, fnFunction, oListener) {
		this.attachEvent("batchRequestCompleted", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:batchRequestCompleted batchRequestCompleted} event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachBatchRequestCompleted = function(fnFunction, oListener) {
		this.detachEvent("batchRequestCompleted", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:batchRequestCompleted batchRequestCompleted} to attached listeners.
	 *
	 * @param {object} oParameters parameters to add to the fired event
	 * @param {string} oParameters.ID The request ID
	 * @param {string} oParameters.url The URL which is sent to the backend
	 * @param {string} oParameters.method The HTTP method
	 * @param {Object<string,string>} oParameters.headers The request headers
	 * @param {boolean} oParameters.success Request was successful or not
	 * @param {boolean} oParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {array} oParameters.requests Array of embedded requests ($batch) - empty array for non batch requests.
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @param {object} oParameters.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireBatchRequestCompleted = function(oParameters) {
		this.fireEvent("batchRequestCompleted", oParameters);
		return this;
	};

	// Keep a map of shared data, which is shared across different model instances on the same server,
	// OData service or metadata URL
	ODataModel.mSharedData = {
		server: {},
		service: {},
		meta: {}
	};

	/**
	 * Get the shared data for the section and the key. If it doesn't exist yet, an empty shared
	 * data object is created and stored under the section and the key.
	 *
	 * @param {string} sSection The data section
	 * @param {string} sKey A key in the section
	 * @returns {object} The shared data
	 *
	 * @private
	 */
	ODataModel._getSharedData = function(sSection, sKey) {
		var oSharedData = this.mSharedData[sSection][sKey];
		if (!oSharedData) {
			oSharedData = {};
			this.mSharedData[sSection][sKey] = oSharedData;
		}
		return oSharedData;
	};

	/**
	 * @private
	 */
	ODataModel.prototype._initializeMetadata = function() {

		if (this.bDestroyed) {
			// Don't fire any events for resolving promises on Models that have already been destroyed
			return;
		}

		//check message scope
		this.bIsMessageScopeSupported = this.oMetadata._isMessageScopeSupported();

		var fnFire = function() {
			this.fireMetadataLoaded({
				metadata: this.oMetadata
			});
			Log.debug(this + " - metadataloaded fired");
		}.bind(this);

		this.initialize();

		if (this.bLoadAnnotationsJoined) {
			this.oAnnotations.loaded().then(fnFire, this.fireMetadataFailed.bind(this));
		} else {
			fnFire();
		}
	};



	/**
	 * Fires event {@link #event:annotationsLoaded annotationsLoaded} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {sap.ui.model.odata.v2.ODataAnnotations} [oParameters.annotations] The annotations object
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireAnnotationsLoaded = function(oParameters) {
		this.fireEvent("annotationsLoaded", oParameters);
		return this;
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the <code>annotationsLoaded</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachAnnotationsLoaded = function(oData, fnFunction, oListener) {
		this.attachEvent("annotationsLoaded", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>annotationsLoaded</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachAnnotationsLoaded = function(fnFunction, oListener) {
		this.detachEvent("annotationsLoaded", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:annotationsFailed annotationsFailed} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.message] A text that describes the failure
	 * @param {string} [oParameters.statusCode] HTTP status code returned by the request (if available)
	 * @param {string} [oParameters.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [oParameters.responseText] Response that has been received for the request, as a text string
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireAnnotationsFailed = function(oParameters) {
		this.fireEvent("annotationsFailed", oParameters);
		Log.debug(this + " - annotationsfailed fired");
		return this;
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the <code>annotationsFailed</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachAnnotationsFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("annotationsFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>annotationsFailed</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachAnnotationsFailed = function(fnFunction, oListener) {
		this.detachEvent("annotationsFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:metadataLoaded metadataLoaded} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {sap.ui.model.odata.ODataMetadata} [oParameters.metadata]  the metadata object.
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireMetadataLoaded = function(oParameters) {
		this.fireEvent("metadataLoaded", oParameters);
		return this;
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the <code>metadataLoaded</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachMetadataLoaded = function(oData, fnFunction, oListener) {
		this.attachEvent("metadataLoaded", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>metadataLoaded</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachMetadataLoaded = function(fnFunction, oListener) {
		this.detachEvent("metadataLoaded", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:metadataFailed metadataFailed} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.message]  A text that describes the failure.
	 * @param {string} [oParameters.statusCode]  HTTP status code returned by the request (if available)
	 * @param {string} [oParameters.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [oParameters.responseText] Response that has been received for the request ,as a text string
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireMetadataFailed = function(oParameters) {
		this.fireEvent("metadataFailed", oParameters);
		return this;
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the <code>metadataFailed</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.v2.ODataModel</code> itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachMetadataFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("metadataFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>metadataFailed</code> event of this
	 * <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachMetadataFailed = function(fnFunction, oListener) {
		this.detachEvent("metadataFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * Creates the EventInfo Object for request sent/completed/failed
	 * @param {object} oRequest The request object
	 * @param {object} oResponse The response/error object
	 * @param {object} aBatchRequests Array of batch requests
	 * @returns {object} oEventInfo The EventInfo object
	 * @private
	 */
	ODataModel.prototype._createEventInfo = function(oRequest, oResponse, aBatchRequests) {
		var oInnerResponse, oBatchRequest,
			oEventInfo = {};

		oEventInfo.url = oRequest.requestUri;
		oEventInfo.method = oRequest.method;
		oEventInfo.async = oRequest.async;
		oEventInfo.headers = oRequest.headers;
		//in batch case list inner requests
		if (aBatchRequests) {
			oEventInfo.requests = [];
			for (var i = 0; i < aBatchRequests.length; i++) {
				oBatchRequest = {};
				//changeSets
				if (Array.isArray(aBatchRequests[i])) {
					var aChangeSet = aBatchRequests[i];
					for (var j = 0; j < aChangeSet.length; j++) {
						oRequest = aChangeSet[j].request;
						oInnerResponse = aBatchRequests[i][j].response;
						oBatchRequest = {};
						oBatchRequest.url = oRequest.requestUri;
						oBatchRequest.method = oRequest.method;
						oBatchRequest.headers = oRequest.headers;
						if (oInnerResponse) {
							oBatchRequest.response = {};
							if (oRequest._aborted) {
								oBatchRequest.success = false;
								oBatchRequest.response.statusCode = 0;
								oBatchRequest.response.statusText = "abort";
							} else {
								oBatchRequest.success = true;
								if (oInnerResponse.message) {
									oBatchRequest.response.message = oInnerResponse.message;
									oInnerResponse = oInnerResponse.response;
									oBatchRequest.response.responseText = oInnerResponse.body;
									oBatchRequest.success = false;
								}
								oBatchRequest.response.headers = oInnerResponse.headers;
								oBatchRequest.response.statusCode = oInnerResponse.statusCode;
								oBatchRequest.response.statusText = oInnerResponse.statusText;
							}
						}
						oEventInfo.requests.push(oBatchRequest);
					}
				} else {
					oRequest = aBatchRequests[i].request;
					oInnerResponse = aBatchRequests[i].response;
					oBatchRequest.url = oRequest.requestUri;
					oBatchRequest.method = oRequest.method;
					oBatchRequest.headers = oRequest.headers;
					if (oInnerResponse) {
						oBatchRequest.response = {};
						if (oRequest._aborted) {
							oBatchRequest.success = false;
							oBatchRequest.response.statusCode = 0;
							oBatchRequest.response.statusText = "abort";
						} else {
							oBatchRequest.success = true;
							if (oInnerResponse.message) {
								oBatchRequest.response.message = oInnerResponse.message;
								oInnerResponse = oInnerResponse.response;
								oBatchRequest.response.responseText = oInnerResponse.body;
								oBatchRequest.success = false;
							}
							oBatchRequest.response.headers = oInnerResponse.headers;
							oBatchRequest.response.statusCode = oInnerResponse.statusCode;
							oBatchRequest.response.statusText = oInnerResponse.statusText;
						}
					}
					oEventInfo.requests.push(oBatchRequest);
				}
			}
		}
		if (oResponse) {
			oEventInfo.response = {};
			oEventInfo.success = true;
			if (oResponse.message) {
				oEventInfo.response.message = oResponse.message;
				oEventInfo.success = false;
			}
			if (oResponse.response) {
				// oResponse is response object
				oResponse = oResponse.response;
			}
			//in case of aborted requests there is no further info
			if (oResponse && oResponse.statusCode != undefined) {
				oEventInfo.response.headers = oResponse.headers;
				oEventInfo.response.statusCode = oResponse.statusCode;
				oEventInfo.response.statusText = oResponse.statusText;
				oEventInfo.response.responseText = oResponse.body !== undefined ? oResponse.body : oResponse.responseText;
				if (oResponse.expandAfterCreateFailed) {
					oEventInfo.response.expandAfterCreateFailed = true;
				}
				if (oResponse.expandAfterFunctionCallFailed) {
					oEventInfo.response.expandAfterFunctionCallFailed = true;
				}
			}
		}
		oEventInfo.ID = oRequest.requestID;
		return oEventInfo;
	};

	/**
	 * Create a request ID
	 *
	 * @returns {string} A request ID
	 * @private
	 */
	ODataModel.prototype._createRequestID = function () {
		var sRequestID;

		sRequestID = uid();
		return sRequestID;
	};

	/**
	 * Extracts the server base URL from the service URL
	 * @returns {string} The server base URL
	 * @private
	 */
	ODataModel.prototype._getServerUrl = function() {
		var oServiceURI, sURI;
		oServiceURI = new URI(this.sServiceUrl).absoluteTo(document.baseURI);
		sURI = new URI("/").absoluteTo(oServiceURI).toString();
		return sURI;
	};

	/**
	 * Creates a $metadata request URL.
	 * @param {string} sUrl The metadata url
	 * @returns {string} The request URL
	 * @private
	 */
	ODataModel.prototype._createMetadataUrl = function(sUrl) {
		if (sUrl.indexOf(this.sServiceUrl) == -1) {
			if (!sUrl.startsWith("/")) {
				sUrl = "/" + sUrl;
			}
			sUrl = this.sServiceUrl + sUrl;
		}

		var mAllParams = Object.assign({}, this.mMetadataUrlParams);
		const oURLSearchParams = new URL(sUrl, "https://localhost").searchParams;
		for (const [sKey] of oURLSearchParams) {
			mAllParams[sKey] = oURLSearchParams.get(sKey);
		}
		var aMetadataUrlParams = ODataUtils._createUrlParamsArray(mAllParams);
		var aUrlParts = sUrl.split("?");
		if (aUrlParts.length > 1) {
			sUrl = aUrlParts[0];
		}
		return this._addUrlParams(sUrl, aMetadataUrlParams);
	};

	/**
	 * Adds the passed URL parameters to the given <code>sUrl</code> to request data. Data URL
	 * parameters stored at this model are also added.
	 *
	 * @param {string} sUrl The metadata url
	 * @param {string[]} aUrlParams An array of url params
	 * @returns {string} The request URL
	 *
	 * @private
	 */
	ODataModel.prototype._addUrlParams = function(sUrl, aUrlParams) {
		var aAllUrlParams = [];

		if (this.aUrlParams) {
			aAllUrlParams = aAllUrlParams.concat(this.aUrlParams);
		}
		if (aUrlParams) {
			aAllUrlParams = aAllUrlParams.concat(aUrlParams);
		}
		if (aAllUrlParams.length > 0) {
			sUrl += "?" + aAllUrlParams.join("&");
		}
		return sUrl;
	};

	/**
	 * Creates a request URL with binding path and context.
	 * @param {string} sPath Binding path
	 * @param {object} [oContext] Binding context
	 * @param {array} [aUrlParams] URL parameters
	 * @param {boolean} [bBatch] For requests nested in a batch, a relative URI will be created
	 * @returns {string} The request URL
	 * @private
	 */
	ODataModel.prototype._createRequestUrl = function(sPath, oContext, aUrlParams, bBatch) {
		return this._createRequestUrlWithNormalizedPath(this._normalizePath(sPath, oContext), aUrlParams, bBatch);
	};

	/**
	 * Creates a request URL with normalized absolute binding path.
	 * @param {string} sNormalizedPath normalized binding path
	 * @param {array} [aUrlParams] URL parameters
	 * @param {boolean} [bBatch] For requests nested in a batch, a relative URI will be created
	 * @returns {string} The request URL
	 * @private
	 */
	ODataModel.prototype._createRequestUrlWithNormalizedPath = function(sNormalizedPath, aUrlParams, bBatch) {
		var sUrl = "";
		if (!bBatch) {
			sUrl = this.sServiceUrl + sNormalizedPath;
		} else {
			sUrl = sNormalizedPath.substr(sNormalizedPath.indexOf('/') + 1);
		}

		return this._addUrlParams(sUrl, aUrlParams);
	};

	/**
	 * Imports the given data to the internal storage.
	 *
	 * Nested entries are processed recursively, moved to the canonical location and referenced from the parent entry.
	 * keys are collected in a map for updating bindings
	 *
	 * @param {object} oData Data that should be imported
	 * @param {map} mChangedEntities Map of changed entities
	 * @param {object} oResponse Response where the data came from
	 * @param {object} oRequest The request object
	 * @param {string} [sPath] The path to the data
	 * @param {string} [sDeepPath] The deep path to the data
	 * @param {string} [sKey] The cache key to the data if known
	 * @param {boolean} [bFunctionImport] Whether the imported data is for a function import
	 *   response; recursive calls to this method importing entities within the function response
	 *   do not set this flag.
	 * @param {string} [sPathFromCanonicalParent] The path concatenated from the canonical path of
	 *   the parent and the navigation property when importing data for a 0..1 navigation
	 *   property via a recursive call to this method
	 * @param {boolean} [bSideEffects]
	 *   Whether the data to import results from a side-effects request
	 * @return {string|string[]} Key of imported data or array of keys in case of nested entries
	 * @private
	 */
	ODataModel.prototype._importData = function(oData, mChangedEntities, oResponse, oRequest, sPath,
			sDeepPath, sKey, bFunctionImport, sPathFromCanonicalParent, bSideEffects) {
		var that = this,
			aList, oResult, oEntry, oCurrentEntry;
			sPath = sPath || "";
			sKey = sKey || "";

		if (oData.results && Array.isArray(oData.results)) {
			aList = [];
			each(oData.results, function(i, entry) {
				var sKey = that._getKey(entry);
				sKey = that._importData(entry, mChangedEntities, oResponse, /*oRequest*/undefined,
					sPath.substr(0, sPath.lastIndexOf("/")), sDeepPath, sKey,
					/*bFunctionImport*/undefined, /*sPathFromCanonicalParent*/undefined,
					bSideEffects);
				if (sKey) {
					aList.push(sKey);
				}
			});
			return aList;
		} else {
			// data is single entity
			if (sKey) {
				sPath =  "/" + sKey;
				sDeepPath += sKey.substr(sKey.indexOf("(")); /*e.g. SalesOrder(123)/ToLineItems + (345)*/
			} else {
				sKey = this._getKey(oData);
			}
			if (!sKey) {
				return sKey;
			}

			// If entry does not exist yet or existing entry is invalid, set received data as new entry
			oEntry = this._getEntity(sKey);
			oCurrentEntry = oEntry;
			if (!oEntry || (oEntry.__metadata && oEntry.__metadata.invalid)) {
				if (!oCurrentEntry){
					oCurrentEntry = oData;
				}
				oEntry = oData;
				sKey = this._addEntity(oEntry);
			}

			// Add response headers to the metadata so they can be accessed via "__metadata/headers/" binding path
			if (this.aBindableResponseHeaders) {
				var mHeaders = {};

				for (var sHeader in oResponse.headers) {
					var sLowerKey = sHeader.toLowerCase();
					if (this.aBindableResponseHeaders.indexOf(sLowerKey) > -1) {
						mHeaders[sLowerKey] = oResponse.headers[sHeader];
					}
				}

				if (!isEmptyObject(mHeaders)) {
					if (!oData.__metadata) {
						oData.__metadata = {};
					}
					oData.__metadata.headers = mHeaders;
				}
			}

			each(oData, function(sName, oProperty) {
				if (oProperty && (oProperty.__metadata && oProperty.__metadata.uri || oProperty.results) && !oProperty.__deferred) {
					var sNewPath = sPath + "/" + sName;
					var sNewDeepPath = sDeepPath + "/" + sName;

					oResult = that._importData(oProperty, mChangedEntities, oResponse,
						/*oRequest*/undefined, sNewPath, sNewDeepPath, undefined, false,
						"/" + sKey + "/" + sName, bSideEffects);
					if (Array.isArray(oResult)) {
						oEntry[sName] = {__list: oResult};
						if (bSideEffects) {
							oEntry[sName].__list.sideEffects = true;
							that.aSideEffectCleanUpFunctions.push(function () {
									// maybe check oEntry[sName].__list.sideEffects before deleting
									// the navigation property; this can happen if an
									// ODataModel#read is triggered with an expand of the same
									// "to N" navigation property as requested with
									// ODataModel#requestSideEffects; see BLI CPOUI5MODELS-656
									delete oEntry[sName];
								});
						}
					} else {
						if (oCurrentEntry[sName] && oCurrentEntry[sName].__ref) {
							if (oCurrentEntry[sName].__ref !== oResult) {
								that.mInvalidatedPaths[sPath.substr(sPath.lastIndexOf("(")) + "/" + sName] = "/" + oResult;
							}
						}
						oEntry[sName] = { __ref: oResult };
					}
				} else if (!oProperty || !oProperty.__deferred) { //do not store deferred navprops
					//'null' is a valid value for navigation properties (e.g. if no entity is assigned). We need to invalidate the path cache
					if (oCurrentEntry[sName] && oProperty === null) {
						that.mInvalidatedPaths[sPath.substr(sPath.lastIndexOf("(")) + "/" + sName] = null;
					}
					oEntry[sName] = oProperty;
				}
			});
			//if we detect a preliminary context we need to set preliminary false and flag for update
			if (this.hasContext("/" + sKey) && this.getContext("/" + sKey).isPreliminary()) {
				var oExistingContext = this.getContext("/" + sKey);
				oExistingContext.setUpdated(true);
				this.callAfterUpdate(function() {
					oExistingContext.setUpdated(false);
				});
				oExistingContext.setPreliminary(false);
			}
			if (oRequest && oRequest.created && oRequest.key) {
				this._cleanupAfterCreate(oRequest, sKey);
			}
			this._updateChangedEntity(sKey, oEntry);
			mChangedEntities[sKey] = true;

			// if no path information available use the key. This should be the case for create/callFunction
			sPath = sPath || '/' + sKey;
			sDeepPath = sDeepPath || sPath;

			var sCanonicalPath = this.resolveFromCache(sDeepPath);
			// Prevents writing invalid entries into cache, like /Product(1) : /Product(2).
			// This could occur, when a navigation target changes on the server and the old target was resolved from cache before invalidation.
            if (sCanonicalPath === "/" + sKey || (sCanonicalPath && sCanonicalPath.split("/").length > 2)) {
				// try to resolve/cache paths containing multiple nav properties like
	            // "SalesOrderItem(123)/ToProduct/ToSupplier" => Product(123)/ToSupplier
                this._writePathCache(sCanonicalPath, "/" + sKey, bFunctionImport);
            }

			this._writePathCache(sPath, "/" + sKey, bFunctionImport);
			this._writePathCache(sDeepPath, "/" + sKey, bFunctionImport,
				/*bUpdateShortenedPaths*/true);
			if (sPathFromCanonicalParent) {
				this._writePathCache(sPathFromCanonicalParent, "/" + sKey, bFunctionImport);
			}

			return sKey;
		}
	};

	/**
	 * Writes a new entry into the canonical path cache mapping the given path to the given
	 * canonical path. As a path consisting of one segment only is canonical, the path itself is
	 * written as value in this case instead of the given canonical path; an exception to this
	 * are function imports: they have a one segment path, but the canonical path addresses the
	 * function import response.
	 *
	 * @param {string} sPath The absolute path that is used as cache key
	 * @param {string} sCanonicalPath The canonical path addressing the same resource
	 * @param {boolean} [bFunctionImport] Whether <code>sPath</code> points to a function import
	 * @param {boolean} [bUpdateShortenedPaths] Whether to update entries for "shortened paths" in
	 *   case <code>sPath</code> is a deep path; a shortened path is the canonical path for a prefix
	 *   of a deep path concatenated with the corresponding deep path suffix
	 * @private
	 */
	ODataModel.prototype._writePathCache = function(sPath, sCanonicalPath, bFunctionImport,
			bUpdateShortenedPaths) {
		var sCacheKey, oCacheKeyEntry, sPathPrefix, oPathPrefixEntry, aSegments, iSegments;

		if (sPath && sCanonicalPath){
			if (!this.mPathCache[sPath]) {
				this.mPathCache[sPath] = {};
			}
			// path with one segment => path is canonical unless it is a function import
			if (!bFunctionImport && sPath.lastIndexOf("/") === 0) {
				sCanonicalPath = sPath;
			}
			this.mPathCache[sPath].canonicalPath = sCanonicalPath;

			if (bUpdateShortenedPaths) {
				aSegments = sPath.split("/");
				// start with deep path prefixes consisting of at least two non-empty segments plus
				// the empty segment at the beginning (that is 3) and update all existing path cache
				// entries having the canonical path of the path prefix plus the corresponding deep
				// path suffix as key
				for (iSegments = 3; iSegments < aSegments.length; iSegments += 1) {
					sPathPrefix = aSegments.slice(0, iSegments).join("/");
					oPathPrefixEntry = this.mPathCache[sPathPrefix];
					if (oPathPrefixEntry) {
						sCacheKey = oPathPrefixEntry.canonicalPath
							+ sPath.slice(sPathPrefix.length);
						oCacheKeyEntry = this.mPathCache[sCacheKey];
						if (oCacheKeyEntry) {
							oCacheKeyEntry.canonicalPath = sCanonicalPath;
						}
					}
				}
			}
		}
	};

	/**
	 * Remove references of navigation properties created in importData function
	 *
	 * @param {object} oData Entry that contains references
	 * @returns {object} oData entry
	 * @private
	 */
	ODataModel.prototype._removeReferences = function(oData){
		var that = this, aList;
		if (!oData) {
			return oData;
		}
		if (oData.results) {
			aList = [];
			each(oData.results, function(i, entry) {
				aList.push(that._removeReferences(entry));
			});
			return aList;
		} else {
			each(oData, function(sPropName, oCurrentEntry) {
				if (oCurrentEntry) {
					if (oCurrentEntry["__ref"] || oCurrentEntry["__list"]) {
						delete oData[sPropName];
					}
				}
			});
			return oData;
		}
	};

	/**
	 * Restore reference entries of navigation properties created in <code>importData</code> function.
	 *
	 * @param {object} oData Entry which references should be restored
	 * @param {object} [mVisitedEntries] Map of entries which already have been visited and included
	 * @returns {object} oData entry
	 * @private
	 */
	ODataModel.prototype._restoreReferences = function(oData, mVisitedEntries){
		var that = this,
		sKey,
		oChildEntry,
		aResults;

		function getEntry(sKey) {
			var oChildEntry = mVisitedEntries[sKey];
			if (!oChildEntry) {
				oChildEntry = that._getObject("/" + sKey);
				assert(oChildEntry, "ODataModel inconsistent: " + sKey + " not found!");
				if (oChildEntry) {
					oChildEntry = merge({}, oChildEntry);
					mVisitedEntries[sKey] = oChildEntry;
					// check recursively for found child entries
					that._restoreReferences(oChildEntry, mVisitedEntries);
				}
			}
			return oChildEntry;
		}

		if (!mVisitedEntries) {
			mVisitedEntries = {};
		}

		each(oData, function(sPropName, oCurrentEntry) {
			if (oCurrentEntry) {
				if (oCurrentEntry.__ref) {
					sKey = oCurrentEntry.__ref;
					oChildEntry = getEntry(sKey);
					if (oChildEntry) {
						oData[sPropName] = oChildEntry;
					}
					delete oCurrentEntry.__ref;
				} else if (oCurrentEntry.__list) {
					aResults = [];
					each(oCurrentEntry.__list, function(i, sKey) {
						oChildEntry = getEntry(sKey);
						if (oChildEntry) {
							aResults.push(oChildEntry);
						}
					});
					delete oCurrentEntry.__list;
					oCurrentEntry.results = aResults;
				}
			}
		});
		return oData;
	};

	/**
	 * Removes all existing data from the model.
	 * @private
	 */
	ODataModel.prototype.removeData = function(){
		this.oData = {};
	};

	/**
	 * Initialize the model.
	 *
	 * This will call <code>initialize</code> on all existing bindings. This is done if metadata is loaded asynchronously.
	 *
	 * @private
	 */
	ODataModel.prototype.initialize = function() {
		// Call initialize on all bindings in case metadata was not available when they were created
		var aBindings = this.getBindings();
		aBindings.forEach(function(oBinding) {
			oBinding.initialize();
		});
	};

	/**
	 * Invalidate the model data.
	 *
	 * Mark all entries in the model cache as invalid. Next time a context or list is bound
	 * (binding), the respective entries will be detected as invalid and will be refreshed from the
	 * server.
	 *
	 * To refresh all model data use {@link sap.ui.model.odata.v2.ODataModel#refresh}
	 *
	 * @param {function} [fnCheckEntry]
	 *   A function which can be used to restrict invalidation to specific entries, gets the entity
	 *   key and object as parameters and should return true for entities to invalidate.
	 * @public
	 * @since 1.52.1
	 */
	ODataModel.prototype.invalidate = function(fnCheckEntry) {
		var oEntry;
		for (var sKey in this.oData) {
			oEntry = this.oData[sKey];
			if (!fnCheckEntry || fnCheckEntry(sKey, oEntry)) {
				oEntry.__metadata.invalid = true;
			}
		}
	};

	/**
	 * Invalidate a single entry in the model data.
	 *
	 * Mark the selected entry in the model cache as invalid. Next time a context binding or list binding is done,
	 * the entry will be detected as invalid and will be refreshed from the server.
	 *
	 * @param {string|sap.ui.model.Context} vEntry the reference to the entry, either by key, absolute path or context object
	 * @public
	 * @since 1.52.1
	 */
	ODataModel.prototype.invalidateEntry = function(vEntry) {
		var oEntry;
		if (typeof vEntry === "string") {
			if (vEntry.indexOf("/") === 0) {
				oEntry = this._getObject(vEntry);
			} else {
				oEntry = this.oData[vEntry];
			}
		} else if (vEntry instanceof BaseContext) {
			oEntry = this._getObject(vEntry.getPath());
		}
		if (oEntry && oEntry.__metadata) {
			oEntry.__metadata.invalid = true;
		}
	};

	/**
	 * Invalidate all entries of the given entity type in the model data.
	 *
	 * Mark entries of the provided entity type in the model cache as invalid. Next time a context
	 * binding or list binding is done, the entry will be detected as invalid and will be refreshed
	 * from the server.
	 *
	 * @param {string} sEntityType
	 *   The qualified name of the entity type. A qualified name consists of two parts separated by
	 *   a dot. The first part is the namespace of the schema in which the entity type is defined,
	 *   such as "NorthwindModel". The second part is the entity type name such as "Customer". This
	 *   results in a qualified name such as "NorthwindModel.Customer". The qualified name can be
	 *   found in the data sent from the server in JSON format under <code>__metadata.type</code> or
	 *   in XML format in the <code>term</code> attribute of the entity's <code>category</code> tag.
	 * @public
	 * @since 1.52.1
	 */
	ODataModel.prototype.invalidateEntityType = function(sEntityType) {
		var oEntry;
		for (var sKey in this.oData) {
			oEntry = this.oData[sKey];
			if (oEntry.__metadata.type === sEntityType) {
				oEntry.__metadata.invalid = true;
			}
		}
	};

	/**
	 * Refresh the model.
	 *
	 * This will reload all data stored in the model.
	 * This will check all bindings for updated data and update the controls if data has been changed.
	 *
	 * Note: In contrast to an individual Binding refresh, the model refresh ignores Binding-specific parameters/queries.
	 *
	 * @param {boolean} [bForceUpdate=false] Force update of controls
	 * @param {boolean} [bRemoveData=false] If set to <code>true</code> then the model data will be removed/cleared.
	 * 					Please note that the data might not be there when calling e.g. <code>getProperty</code> too early before the refresh call returned.
	 * @param {string} [sGroupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 *
	 * @public
	 */
	ODataModel.prototype.refresh = function(bForceUpdate, bRemoveData, sGroupId) {
		if (typeof bForceUpdate === "string") {
			sGroupId = bForceUpdate;
			bForceUpdate = false;
			bRemoveData = false;
		}

		// Call refresh on all bindings instead of checkUpdate to properly reset cached data in bindings
		if (bRemoveData) {
			this.removeData();
		}
		this._refresh(bForceUpdate, sGroupId);
	};

	/**
	 * @param {boolean} [bForceUpdate=false] Force update of bindings
	 * @param {string} [sGroupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {map} mChangedEntities Map of changed entities
	 * @param {map} mEntityTypes Map of changed entity types
	 * @private
	 */
	ODataModel.prototype._refresh = function(bForceUpdate, sGroupId, mChangedEntities, mEntityTypes) {
		// Call refresh on all bindings instead of checkUpdate to properly reset cached data in bindings
		var aBindings = this.getBindings();
		//the refresh calls read synchronous; we use this.sRefreshGroupId in this case
		this.sRefreshGroupId = sGroupId;
		aBindings.forEach(function(oBinding) {
			oBinding._refresh(bForceUpdate, mChangedEntities, mEntityTypes);
		});
		this.sRefreshGroupId = undefined;
	};

	/**
	 * Calls {@link sap.ui.model.Binding#checkUpdate} on all active bindings of this model like
	 * {@link sap.ui.model.Model#checkUpdate}. Additionally, multiple asynchronous calls to this
	 * function lead to a single synchronous call where <code>mChangedEntities</code> is the union
	 * of all <code>mChangedEntities</Code> from the asynchronous calls.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   The parameter <code>bForceUpdate</code> for the <code>checkUpdate</code> call on the
	 *   bindings
	 * @param {boolean} bAsync
	 *   Whether this function is called in a new task via <code>setTimeout</code>
	 * @param {map} mChangedEntities
	 *   Map of changed entities
	 * @param {boolean} bMetaModelOnly
	 *   Whether to only update metamodel bindings
	 * @private
	 */
	ODataModel.prototype.checkUpdate = function(bForceUpdate, bAsync, mChangedEntities, bMetaModelOnly) {
		if (bAsync) {
			this.bForceUpdate = this.bForceUpdate || bForceUpdate;
			Object.assign(this.mChangedEntities4checkUpdate, mChangedEntities);
			if (!this.sUpdateTimer) {
				this.sUpdateTimer = setTimeout(function() {
					this.checkUpdate(this.bForceUpdate, false, this.mChangedEntities4checkUpdate);
				}.bind(this), 0);
			}
			return;
		}
		bForceUpdate = this.bForceUpdate || bForceUpdate;
		if (this.sUpdateTimer) {
			clearTimeout(this.sUpdateTimer);
			this.sUpdateTimer = null;
			this.bForceUpdate = undefined;
			this.mChangedEntities4checkUpdate = {};
		}
		var aBindings = this.getBindings();
		aBindings.forEach(function(oBinding) {
			if (!bMetaModelOnly || this.isMetaModelPath(oBinding.getPath())) {
				oBinding.checkUpdate(bForceUpdate, mChangedEntities);
			}
		}.bind(this));
		this._processAfterUpdate();
	};

	/**
	 * Iterates the registered bindings of this model instance and lets them check their data state.
	 *
	 * @param {object} mLaunderingState Map of paths to check against
	 * @private
	 */
	ODataModel.prototype.checkDataState = function(mLaunderingState) {
		var aBindings = this.getBindings();
		aBindings.forEach(function(oBinding) {
			if (oBinding.checkDataState) {
				oBinding.checkDataState(mLaunderingState);
			}
		});
	};

	/**
	 * Creates a new property binding for this model.
	 *
	 * @param {string} sPath Path pointing to the property that should be bound;
	 *                 either an absolute path or a path relative to a given <code>oContext</code>
	 * @param {object} [oContext] A context object for the new binding
	 * @param {Object<string,any>} [mParameters] Map of optional parameters for the binding
	 * @param {boolean} [mParameters.ignoreMessages]
	 *   Whether this binding does not propagate model messages to the control; supported since
	 *   1.82.0. Some composite types like {@link sap.ui.model.type.Currency} automatically ignore
	 *   model messages for some of their parts depending on their format options; setting this
	 *   parameter to <code>true</code> or <code>false</code> overrules the automatism of the type
	 *
	 *   For example, a binding for a currency code is used in a composite binding for rendering the
	 *   proper number of decimals, but the currency code is not displayed in the attached control.
	 *   In that case, messages for the currency code shall not be displayed at that control, only
	 *   messages for the amount
	 * @param {boolean} [mParameters.useUndefinedIfUnresolved]
	 *   Whether the value of the created property binding is <code>undefined</code> if it is
	 *   unresolved; if not set, its value is <code>null</code>. Supported since 1.100.0
	 * @returns {sap.ui.model.PropertyBinding} The new property binding
	 *
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @see #getProperty
	 */
	ODataModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new ODataPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Creates a new list binding for this model.
	 *
	 * @param {string} sPath The binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path.
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
	 *   The sorters used initially; call {@link sap.ui.model.odata.v2.ODataListBinding#sort} to replace them
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call
	 *   {@link sap.ui.model.odata.v2.ODataListBinding#filter} to replace them
	 * @param {object} [mParameters] A map which contains additional parameters for the binding.
	 * @param {sap.ui.model.odata.CountMode} [mParameters.countMode]
	 *   Defines the count mode of the binding; if not specified, the default count mode of the
	 *   <code>oModel</code> is applied.
	 * @param {string} [mParameters.createdEntitiesKey=""]
	 *   A key used in combination with the resolved path of the binding to identify the entities
	 *   created by the binding's {@link #create} method.
	 *
	 *   <b>Note:</b> Different controls or control aggregation bindings to the same collection must
	 *   have different <code>createdEntitiesKey</code> values.
	 * @param {Object<string,string>} [mParameters.custom]
	 *   An optional map of custom query parameters. Custom parameters must not start with
	 *   <code>$</code>.
	 * @param {string} [mParameters.expand]
	 *   Value for the OData <code>$expand</code> query option parameter which is included in the
	 *   data request after URL encoding of the given value.
	 * @param {boolean} [mParameters.faultTolerant]
	 *   Turns on the fault tolerance mode, data is not reset if a back-end request returns an
	 *   error.
	 * @param {string} [mParameters.groupId]
	 *   The group id to be used for requests originating from the binding
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode of the binding
	 * @param {string} [mParameters.select]
	 *   Value for the OData <code>$select</code> query option parameter which is included in the
	 *   data request after URL encoding of the given value.
	 * @param {boolean} [mParameters.transitionMessagesOnly]
	 *   Whether the list binding only requests transition messages from the back end. If messages
	 *   for entities of this collection need to be updated, use
	 *   {@link sap.ui.model.odata.v2.ODataModel#read} on the parent entity corresponding to the
	 *   list binding's context, with the parameter <code>updateAggregatedMessages</code> set to
	 *   <code>true</code>.
	 * @param {boolean} [mParameters.usePreliminaryContext]
	 *   Whether a preliminary context is used. When set to <code>true</code>, the model can
	 *   bundle the OData calls for dependent bindings into fewer $batch requests. For more
	 *   information, see
	 *   {@link topic:6c47b2b39db9404582994070ec3d57a2#loio62149734b5c24507868e722fe87a75db
	 *   Optimizing Dependent Bindings}.
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead. Sets the batch group id to be used for
	 *   requests originating from the binding.
	 * @param {int} [mParameters.threshold]
	 *   Deprecated since 1.102.0, as {@link sap.ui.model.odata.OperationMode.Auto} is deprecated;
	 *   the threshold that defines how many entries should be fetched at least by the binding if
	 *   <code>operationMode</code> is set to <code>Auto</code>.
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>aFilters</code> together with other filters
	 * @returns {sap.ui.model.odata.v2.ODataListBinding} The new list binding
	 * @see sap.ui.model.Model.prototype.bindList
	 * @public
	 */
	ODataModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new ODataListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	/**
	 * Creates a new tree binding for this model.
	 *
	 * <h3>Hierarchy Annotations</h3>
	 * To use the v2.ODataTreeBinding with an OData service which exposes hierarchy annotations, see
	 * the <b>"SAP Annotations for OData Version 2.0"</b> specification. The required property
	 * annotations as well as accepted / default values are documented in this specification.
	 *
	 * Services which include the <code>hierarchy-node-descendant-count-for</code> annotation and
	 * expose the data points sorted in a depth-first, pre-order manner, can use an optimized
	 * auto-expand feature by specifying the <code>numberOfExpandedLevels</code> in the binding
	 * parameters. This will pre-expand the hierarchy to the given number of levels, with only a
	 * single initial OData request.
	 *
	 * For services without the <code>hierarchy-node-descendant-count-for</code> annotation, the
	 * <code>numberOfExpandedLevels</code> property is not supported and deprecated.
	 *
	 * <h3>Operation Modes</h3>
	 * For a full definition and explanation of all OData binding operation modes, see
	 * {@link sap.ui.model.odata.OperationMode}.
	 *
	 * <h4>OperationMode.Server</h4>
	 * Filtering on the <code>ODataTreeBinding</code> is only supported with filters of type
	 * {@link sap.ui.model.FilterType.Application}. Be aware that this applies
	 * only to filters which do not prevent the creation of a hierarchy. So filtering on a property
	 * (e.g. a "Customer") is fine, as long as the application ensures that the responses from the
	 * back end are sufficient to create a valid hierarchy on the client. Subsequent paging requests
	 * for sibling and child nodes must also return responses, since the filters are sent with every
	 * request. Using control-defined filters (see {@link sap.ui.model.FilterType.Control}) via the
	 * {@link #filter} function is not supported for the operation mode <code>Server</code>.
	 *
	 * <h4>OperationMode.Client and OperationMode.Auto</h4>
	 * The ODataTreeBinding supports control-defined filters only in operation modes
	 * <code>Client</code> and <code>Auto</code>. With these operation modes, the filters and
	 * sorters are applied on the client, like for the
	 * {@link sap.ui.model.odata.v2.ODataListBinding}.
	 *
	 * The operation modes <code>Client</code> and <code>Auto</code> are only supported for services
	 * which expose the hierarchy annotations mentioned above, but do <b>not</b> expose the
	 * <code>hierarchy-node-descendant-count-for</code> annotation. Services with hierarchy
	 * annotations including the <code>hierarchy-node-descendant-count-for</code> annotation, do
	 * <b>not</b> support the operation modes <code>Client</code> and <code>Auto</code>.
	 * <b>Note:</b> {@link sap.ui.model.odata.OperationMode.Auto} is deprecated since 1.102.0.
	 *
	 * @param {string} sPath
	 *   The binding path, either absolute or relative to a given <code>oContext</code>
	 * @param {sap.ui.model.Context} [oContext]
	 *   The parent context which is required as base for a relative path
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [vFilters=[]]
	 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call
	 *   {@link sap.ui.model.odata.v2.ODataTreeBinding#filter} to replace them; depending on the operation mode, there
	 *   are restrictions for using filters; see above
	 * @param {object} [mParameters]
	 *   Map of binding parameters
	 * @param {boolean} [mParameters.transitionMessagesOnly=false]
	 *   Whether the tree binding only requests transition messages from the back end. If messages
	 *   for entities of this collection need to be updated, use
	 *   {@link sap.ui.model.odata.v2.ODataModel#read} on the parent entity corresponding to the
	 *   tree binding's context, with the parameter <code>updateAggregatedMessages</code> set to
	 *   <code>true</code>.
	 * @param {object} [mParameters.treeAnnotationProperties]
	 *   The mapping between data properties and the hierarchy used to visualize the tree, if not
	 *   provided by the service's metadata. For the correct metadata annotations, check the
	 *   "SAP Annotations for OData Version 2.0" specification
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyLevelFor]
	 *   The property name in the same type holding the hierarchy level information; the type of the
	 *   referenced property has to be an integer type
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeFor]
	 *   The property name in the same type holding the hierarchy node id
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyParentNodeFor]
	 *   The property name in the same type holding the parent node id
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyDrillStateFor]
	 *   The property name in the same type holding the drill state for the node; the referenced
	 *   property may have the values "collapsed", "expanded" or "leaf"
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor]
	 *   The property name in the same type holding the descendant count for the node; the type of
	 *   the referenced property has to be an integer type
	 * @param {number} [mParameters.numberOfExpandedLevels=0]
	 *   The number of levels that are auto-expanded initially. Setting this property might lead to
	 *   multiple back-end requests. The auto-expand feature is <b>deprecated for services without
	 *   the <code>hierarchy-node-descendant-count-for</code> annotation</b>
	 * @param {number} [mParameters.rootLevel=0]
	 *   The level of the topmost tree nodes
	 * @param {string} [mParameters.groupId]
	 *   The group id to be used for requests originating from this binding
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode for this binding; defaults to the model's default operation mode if not
	 *   specified. {@link sap.ui.model.odata.OperationMode.Auto OperationMode.Auto} is only
	 *   supported for services which expose the hierarchy annotations, yet do <b>NOT</b> expose the
	 *   <code>hierarchy-node-descendant-count-for</code> annotation.
	 *   <b>Note:</b> {@link sap.ui.model.odata.OperationMode.Auto} is deprecated since 1.102.0.
	 * @param {number} [mParameters.threshold]
	 *   Deprecated since 1.102.0, as {@link sap.ui.model.odata.OperationMode.Auto} is deprecated;
	 *   the threshold that defines how many entries should be fetched at least by the binding if
	 *   <code>operationMode</code> is set to <code>Auto</code>
	 * @param {boolean} [mParameters.useServersideApplicationFilters]
	 *   Deprecated since 1.102.0, as {@link sap.ui.model.odata.OperationMode.Auto} is deprecated;
	 *   whether <code>$filter</code> statements should be used for the <code>$count</code> /
	 *   <code>$inlinecount</code> requests and for the data request if the operation mode is
	 *   {@link sap.ui.model.odata.OperationMode.Auto OperationMode.Auto}. Use this feature only
	 *   if your back end supports pre-filtering the tree and is capable of responding with
	 *   a complete tree hierarchy, including all inner nodes. To construct the hierarchy on the
	 *   client, it is mandatory that all filter matches include their complete parent chain up to
	 *   the root level. If {@link sap.ui.model.odata.OperationMode.Client OperationMode.Client} is
	 *   used, the complete collection without filters is requested; filters are applied on the
	 *   client side.
	 * @param {any} [mParameters.treeState]
	 *   A tree state handle can be given to the <code>ODataTreeBinding</code> when two conditions
	 *   are met: <ul>
	 *   <li>The binding is running in {@link sap.ui.model.odata.OperationMode.Client
	 *     OperationMode.Client}, and</li>
	 *   <li>the {@link sap.ui.table.TreeTable} is used.</li>
	 *   </ul>
	 *   The feature is only available when using the {@link sap.ui.table.TreeTable}. The tree
	 *   state handle will contain all necessary information to expand the tree to the given state.
	 *
	 *   This feature is not supported if
	 *   {@link sap.ui.model.odata.OperationMode.Server OperationMode.Server} or
	 *   {@link sap.ui.model.odata.OperationMode.Auto OperationMode.Auto} is used.
	 *  @param {sap.ui.model.odata.CountMode} [mParameters.countMode]
	 *    Defines the count mode of this binding; if not specified, the default count mode of the
	 *    binding's model is applied. The resulting count mode must not be
	 *    {@link sap.ui.model.odata.CountMode.None}.
	 *  @param {boolean} [mParameters.usePreliminaryContext]
	 *    Whether a preliminary context is used; defaults to the value of the parameter
	 *    <code>preliminaryContext</code> given on construction of the binding's model, see
	 *    {@link sap.ui.model.odata.v2.ODataModel}
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead. Sets the batch group id to be used
	 *   for requests originating from this binding
	 * @param {object} [mParameters.navigation]
	 *   A map describing the navigation properties between entity sets, which is used for
	 *   constructing and paging the tree. Keys in this object are entity names, whereas the values
	 *   name the navigation properties.
	 *
	 *   <b>Deprecated: since 1.44</b> The use of navigation properties to build up the hierarchy
	 *   structure is deprecated. It is recommended to use the hierarchy annotations mentioned above
	 *   instead.
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [vSorters=[]]
	 *   The sorters used initially; call {@link sap.ui.model.odata.v2.ODataTreeBinding#sort} to replace them
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>vFilters</code> together with other filters
	 *
	 * @returns {sap.ui.model.odata.v2.ODataTreeBinding}
	 *   The new tree binding
	 * @public
	 * @see {@link http://www.sap.com/protocols/SAPData
	 *   "SAP Annotations for OData Version 2.0" Specification}
	 */
	ODataModel.prototype.bindTree = function(sPath, oContext, vFilters, mParameters, vSorters) {
		var oBinding = new ODataTreeBinding(this, sPath, oContext, vFilters, mParameters, vSorters);
		return oBinding;
	};

	/**
	 * Creates a binding context for the given path.
	 *
	 * If the data of the context is not yet available, it can not be created, but first the
	 * entity needs to be fetched from the server asynchronously. In case no callback function
	 * is provided, the request will not be triggered.
	 *
	 * If a callback function is given, the created binding context for a fetched entity is passed as argument to the given callback function.
	 *
	 * @see sap.ui.model.Model.prototype.createBindingContext
	 * @param {string} sPath Binding path
	 * @param {object} [oContext] Binding context
	 * @param {object} [mParameters] Map which contains additional parameters for the binding
	 * @param {string} [mParameters.expand] Value for the OData <code>$expand</code> query parameter which should be included in the request
	 * @param {string} [mParameters.select] Value for the OData <code>$select</code> query parameter which should be included in the request
	 * @param {boolean} [mParameters.createPreliminaryContext]
	 *   Whether a preliminary context will be created. When set to <code>true</code>, the model
	 *   can bundle the OData calls for dependent bindings into fewer $batch requests. For more
	 *   information, see
	 *   {@link topic:6c47b2b39db9404582994070ec3d57a2#loio62149734b5c24507868e722fe87a75db Optimizing Dependent Bindings}
	 * @param {Object<string,string>} [mParameters.custom] Optional map of custom query parameters, names of custom parameters must not start with <code>$</code>.
	 * @param {function} [fnCallBack]
	 *   The function to be called when the context has been created. The parameter of the callback
	 *   function is the newly created binding context, an instance of
	 *   {@link sap.ui.model.odata.v2.Context}.
	 * @param {boolean} [bReload] Whether to reload data
	 * @return {sap.ui.model.odata.v2.Context|undefined}
	 *   The created binding context, only if the data is already available and the binding context
	 *   could be created synchronously; <code>undefined</code> otherwise
	 * @public
	 */
	ODataModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack, bReload) {
		var bCanonical, sCanonicalPath, sCustomParams, sDeepPath, sGroupId, bIsRelative,
			oNewContext, aParams, sResolvedPath,
			that = this;

		// optional parameter handling
		if (oContext !== null && typeof oContext === "object"
				&& !(oContext instanceof BaseContext)) {
			bReload = fnCallBack;
			fnCallBack = mParameters;
			mParameters = oContext;
			oContext = undefined;
		}
		if (typeof oContext == "function") {
			bReload = mParameters;
			fnCallBack = oContext;
			mParameters = undefined;
			oContext = undefined;
		}
		if (typeof oContext == "boolean") {
			bReload = oContext;
			fnCallBack = undefined;
			mParameters = undefined;
			oContext = undefined;
		}
		if (typeof mParameters == "function") {
			bReload = fnCallBack;
			fnCallBack = mParameters;
			mParameters = undefined;
		}
		if (typeof mParameters == "boolean") {
			bReload = mParameters;
			fnCallBack = undefined;
			mParameters = undefined;
		}
		if (typeof fnCallBack == "boolean") {
			bReload = fnCallBack;
			fnCallBack = undefined;
		}

		if (mParameters){
			bCanonical = mParameters.canonicalRequest;
		}
		bCanonical = this._isCanonicalRequestNeeded(bCanonical);

		// if path cannot be resolved, call the callback function and return null
		sResolvedPath = this.resolve(sPath, oContext, bCanonical);
		if (!sResolvedPath && bCanonical) {
			sResolvedPath = this.resolve(sPath, oContext);
		}
		sDeepPath = this.resolveDeep(sPath, oContext);

		if (!sResolvedPath) {
			if (fnCallBack) {
				fnCallBack(null);
			}
			return null;
		}

		// try to resolve path, send a request to the server if data is not available yet
		// if we have set reload=true in mParameters we send the request even if the data is available
		// if reload has explicitly been set to either true or false, we do not need to check again
		if (bReload === undefined) {
			bReload = this._isReloadNeeded(sResolvedPath, mParameters);
		}

		if (!bReload) {
			sCanonicalPath = this.resolve(sPath, oContext, true);
			if (sCanonicalPath) {
				oNewContext = this.getContext(sCanonicalPath, sDeepPath);
			} else {
				oNewContext = null;
			}
			if (fnCallBack) {
				fnCallBack(oNewContext);
			}
			return oNewContext;
		}

		function handleSuccess(oData) {
			var sKey = oData ? that._getKey(oData) : null,
				bLink = !(sPath === "" || sPath.indexOf("/") > 0),
				oRef = null,
				sContextPath, oEntity;

			oNewContext = null;

			if (sKey) {
				oNewContext = that.getContext('/' + sKey, sDeepPath);
				oRef = {__ref: sKey};
			}
			/* in case of sPath == "" or a deep path (entity(1)/entities) we
			   should not link the Entity */
			if (oContext && bIsRelative && bLink) {
				sContextPath = oContext.getPath();
				// remove starting slash
				sContextPath = sContextPath.substr(1);
				// when model is refreshed, parent entity might not be available yet
				oEntity = that._getEntity(sContextPath);
				if (oEntity) {
					oEntity[sPath] = oRef;
				}
			}
			fnCallBack(oNewContext);
		}

		function handleError(oError) {
			var oEntity;
			if (oError.statusCode == '404' && oContext && bIsRelative) {
				var sContextPath = oContext.getPath();
				// remove starting slash
				sContextPath = sContextPath.substr(1);
				// when model is refreshed, parent entity might not be available yet
				oEntity = that._getEntity(sContextPath);
				if (oEntity) {
					oEntity[sPath] = {__ref: null};
				}
			}
			fnCallBack(null); // error - notify to recreate contexts
		}

		if (fnCallBack) {
			bIsRelative = !sPath.startsWith("/");
			aParams = [];
			sCustomParams = this.createCustomParams(mParameters);
			if (sCustomParams) {
				aParams.push(sCustomParams);
			}
			if (mParameters && (mParameters.batchGroupId || mParameters.groupId)) {
				sGroupId = mParameters.groupId || mParameters.batchGroupId;
			}
			this.read(sPath, {
				canonicalRequest : bCanonical,
				context : oContext,
				error : handleError,
				groupId : sGroupId,
				success : handleSuccess,
				updateAggregatedMessages : true,
				urlParameters : aParams
			});
		}

		if (mParameters && mParameters.createPreliminaryContext) {
			sResolvedPath = this.resolve(sPath, oContext, bCanonical);
			if (!sResolvedPath && bCanonical) {
				sResolvedPath = this.resolve(sPath, oContext);
			}

			oNewContext = this.getContext(sResolvedPath, sDeepPath);
			return oNewContext;
		}

		return undefined;
	};

	/**
	 * Updates an existing context with a new path and deep path. This is used for contexts with
	 * a temporary, non-canonical path, which is replaced once the canonical path is known, without
	 * creating a new context instance.
	 *
	 * @param {sap.ui.model.Context} oContext The context
	 * @param {string} sPath The new path for the context
	 * @param {string} [sDeepPath]
	 *   If set, the new deep path for the context; if not set, the context's deep path is not
	 *   updated
	 *
	 * @private
	 */
	ODataModel.prototype._updateContext = function(oContext, sPath, sDeepPath) {
		oContext.sPath = sPath;
		if (sDeepPath !== undefined) {
			oContext.sDeepPath = sDeepPath;
		}
		this.mContexts[sPath] = oContext;
	};

	/**
	 * Splits a select or expand option by comma into separate entries and then by slash into path segments
	 *
	 * @param {string} sEntries The select or expand entries string
	 * @return {array} An array containing arrays of entry path segments
	 * @private
	 */
	ODataModel.prototype._splitEntries = function(sEntries) {
		return sEntries.replace(/\s/g, "").split(',').map(function(sEntry) {
			return sEntry.split("/");
		});
	};

	/**
	 * Filter select properties for selects applying to the current entity (remove deep selects)
	 * and filter/expand according to metadata properties
	 *
	 * @param {array} aSelect The select entries
	 * @param {array} aEntityProps The metadata properties array
	 * @return {array} Array of own select properties
	 * @private
	 */
	ODataModel.prototype._filterOwnSelect = function(aSelect, aEntityProps) {
		var aOwnSelect, aOwnProps;
		if (!aEntityProps) {
			return [];
		}
		// Create array of property names from metadata
		aOwnProps = aEntityProps.map(function(oProperty) {
			return oProperty.name;
		});
		// Filter select for own entries
		aOwnSelect = aSelect.filter(function(aSegments) {
			// Only entries with a single segment
			return aSegments.length === 1;
		}).map(function(aSegments) {
			// Map to contained strings
			return aSegments[0];
		});
		if (aSelect.length === 0 || aOwnSelect.indexOf("*") !== -1 || aOwnSelect.indexOf("**") !== -1) {
			// If no select options are defined or the star is contained,
			// use all existing properties from the metadata
			return aOwnProps;
		} else {
			// Otherwise filter for own properties only
			return aOwnSelect.filter(function(sSelect) {
				return aOwnProps.indexOf(sSelect) !== -1;
			});
		}
	};

	/**
	 * Filter expand properties for expand applying to the current entity (remove deep expands)
	 * and remove expands not covered by the select entries
	 *
	 * @param {Array.<string[]>} aExpand Own expand entries as string arrays
	 * @param {Array.<string[]>} aSelect Own select entries as string arrays
	 * @returns {string[]} Array of own expand properties
	 *
	 * @private
	 */
	ODataModel.prototype._filterOwnExpand = function(aExpand, aSelect) {
		return aExpand.map(function(aSegments) {
			// The first segment of all entries
			return aSegments[0];
		}).filter(function(sValue, iIndex, aEntries) {
			// Filter for unique entries
			return aEntries.indexOf(sValue) === iIndex;
		}).filter(function(sValue) {
			// Keep selected entries only
			return aSelect.length === 0 ||
				aSelect.some(function(aSegments) {
					return aSegments.indexOf(sValue) === 0 ||
						aSegments.indexOf("**") === 0;
				});
		});
	};

	/**
	 * Filter select properties belonging to the given navigation property
	 *
	 * @param {array} aEntries The select entries as segment arrays
	 * @param {string} sNavProp Navigation property to filter with
	 * @returns {array} Array of select properties reachable by the given nav property;
	 *   only the portion of the path after the navigation property is returned
	 *   or "**" if the select property equals the navigation property
	 *
	 * @private
	 */
	ODataModel.prototype._filterSelectByNavProp = function(aEntries, sNavProp) {
		return aEntries.filter(function(aSegments) {
			// Entries with more than one segment starting with given nav path
			return aSegments[0] === sNavProp;
		}).map(function(aSegments) {
			// Remove first segment from the path. If a navigation property was
			// the last segment, all of its properties are selected
			return aSegments.length > 1 ? aSegments.slice(1) : ["**"];
		});
	};

	/**
	 * Filter expand properties belonging to the given navigation property.
	 *
	 * @param {array} aEntries Select entries as segment arrays
	 * @param {string} sNavProp Navigation property to filter with
	 * @returns {array} Array of expand properties reachable by the given navigation property;
	 *   only the portion of the path after the navigation property is returned
	 * @private
	 */
	ODataModel.prototype._filterExpandByNavProp = function(aEntries, sNavProp) {
		return aEntries.filter(function(aSegments) {
			// Entries with more than one segment starting with given nav path
			return aSegments.length > 1 && aSegments[0] === sNavProp;
		}).map(function(aSegments) {
			// Remove first segment from the path
			return aSegments.slice(1);
		});
	};

	/**
	 * Checks if data based on select, expand parameters is already loaded or not.
	 * In case it couldn't be found we should reload the data so we return true.
	 *
	 * @param {string} sPath Entity path
	 * @param {map} [mParameters] Map of parameters
	 * @returns {boolean} Whether a reload is needed
	 * @private
	 */
	ODataModel.prototype._isReloadNeeded = function(sPath, mParameters) {

		var that = this,
			oMetadata = this.oMetadata,
			oEntityType,
			aExpand = [], aSelect = [];

		if (!this.oMetadata.isLoaded()) {
			return true;
		}
		var bCanonical;
		if (mParameters) {
			bCanonical = mParameters.canonicalRequest;
		}
		bCanonical = this._isCanonicalRequestNeeded(bCanonical);
		if (bCanonical) {
			sPath = this.resolve(sPath, undefined, bCanonical) || sPath;
		}
		var oEntity = this._getObject(sPath);
		oEntityType = this.oMetadata._getEntityTypeByPath(sPath);

		// Created entities should never be reloaded, as they do not exist on
		// the server yet
		if (this._isCreatedEntity(oEntity)) {
			return false;
		}

		function checkReloadNeeded(oEntityType, oEntity, aSelect, aExpand) {
			var sExpand, i, vNavData, oNavEntity, oNavEntityType,
				aNavExpand, aNavSelect, aOwnExpand, aOwnSelect, sSelect;

			// if no entity type could be found we decide not to reload
			if (!oEntityType) {
				return false;
			}
			// if entity is null, no reload is needed
			if (oEntity === null) {
				return false;
			}
			// no data --> reload needed
			if (!oEntity) {
				return true;
			}
			// check for invalid flag
			if (oEntity.__metadata && oEntity.__metadata.invalid) {
				return true;
			}

			// check select properties
			aOwnSelect = that._filterOwnSelect(aSelect, oEntityType.property);
			for (i = 0; i < aOwnSelect.length; i++) {
				sSelect = aOwnSelect[i];
				if (oEntity[sSelect] === undefined) {
					return true;
				}
			}

			// check expanded entities
			aOwnExpand = that._filterOwnExpand(aExpand, aSelect);
			for (i = 0; i < aOwnExpand.length; i++) {
				sExpand = aOwnExpand[i];
				vNavData = oEntity[sExpand];

				// if nav property is null, no further checks are required
				if (vNavData === null) {
					continue;
				}

				// if nav property is undefined or deferred, it needs to be loaded
				if (vNavData === undefined || vNavData.__deferred) {
					return true;
				}

				// get entity type and filter expand/select for this expanded entity
				oNavEntityType = oMetadata._getEntityTypeByNavProperty(oEntityType, sExpand);
				aNavSelect = that._filterSelectByNavProp(aSelect, sExpand);
				aNavExpand = that._filterExpandByNavProp(aExpand, sExpand);

				// expanded entities need to be checked recursively for nested expand/select
				if (vNavData.__ref) {
					oNavEntity = that._getEntity(vNavData.__ref);
					if (checkReloadNeeded(oNavEntityType, oNavEntity, aNavSelect, aNavExpand)) {
						return true;
					}
				}
				if (vNavData.__list) {
					for (var j = 0; j < vNavData.__list.length; j++) {
						oNavEntity = that._getEntity(vNavData.__list[j]);
						if (checkReloadNeeded(oNavEntityType, oNavEntity, aNavSelect, aNavExpand)) {
							return true;
						}
					}
				}
			}

			return false;
		}

		if (mParameters) {
			if (mParameters.select) {
				aSelect = this._splitEntries(mParameters.select);
			}
			if (mParameters.expand) {
				aExpand = this._splitEntries(mParameters.expand);
			}
		}

		return checkReloadNeeded(oEntityType, oEntity, aSelect, aExpand);

	};

	/**
	 * Create URL parameters from custom parameters
	 *
	 * @param {map} mParameters Map of custom parameters
	 * @returns {string} sCustomParameters & joined parameters
	 * @private
	 */
	ODataModel.prototype.createCustomParams = function(mParameters) {
		var aCustomParams = [],
		mCustomQueryOptions,
		mSupportedParams = {
				expand: true,
				select: true
		};
		for (var sName in mParameters) {
			if (sName in mSupportedParams) {
				aCustomParams.push("$" + sName + "=" + encodeURL(mParameters[sName]));
			}
			if (sName === "custom") {
				mCustomQueryOptions = mParameters[sName];
				for (sName in mCustomQueryOptions) {
					if (sName.indexOf("$") === 0) {
						Log.warning(this + " - Trying to set OData parameter '" + sName + "' as custom query option!");
					} else if (typeof mCustomQueryOptions[sName] === 'string') {
						aCustomParams.push(sName + "=" + encodeURL(mCustomQueryOptions[sName]));
					} else {
						aCustomParams.push(sName);
					}
				}
			}
		}
		return aCustomParams.join("&");
	};

	/**
	 * Creates a context binding for this model.
	 *
	 * @param {string} sPath The binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path.
	 * @param {object} [mParameters] A map which contains additional parameters for the binding.
	 * @param {boolean} [mParameters.createPreliminaryContext]
	 *   Whether a preliminary context is created
	 * @param {Object<string,string>} [mParameters.custom]
	 *   An optional map of custom query parameters. Custom parameters must not start with
	 *   <code>$</code>.
	 * @param {string} [mParameters.expand]
	 *   Value for the OData <code>$expand</code> query option parameter which is included in the
	 *   request after URL encoding of the given value.
	 * @param {string} [mParameters.groupId]
	 *   The group id to be used for requests originating from the binding
	 * @param {string} [mParameters.select]
	 *   Value for the OData <code>$select</code> query option parameter which is included in the
	 *   request after URL encoding of the given value.
	 * @param {boolean} [mParameters.usePreliminaryContext]
	 *   Whether a preliminary context is used. When set to <code>true</code>, the model can bundle
	 *   the OData calls for dependent bindings into fewer $batch requests. For more information,
	 *   see {@link topic:6c47b2b39db9404582994070ec3d57a2#loio62149734b5c24507868e722fe87a75db
	 *   Optimizing Dependent Bindings}.
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead. Sets the batch group id to be used for
	 *   requests originating from the binding.
	 * @returns {sap.ui.model.odata.v2.ODataContextBinding} The new context binding
	 * @see sap.ui.model.Model.prototype.bindContext
	 * @public
	 */
	ODataModel.prototype.bindContext = function(sPath, oContext, mParameters) {
		var oBinding = new ODataContextBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Sets the default mode how to retrieve the item count for a collection in this model.
	 *
	 * The count can be determined in the following ways
	 * <ul>
	 * <li>by sending a separate <code>$count</code> request</li>
	 * <li>by adding parameter <code>$inlinecount=allpages</code> to one or all data requests</li>
	 * <li>a combination of the previous two</li>
	 * <li>not at all (questions about the size of the collection can't be answered then)</li>
	 * </ul>
	 * See {@link sap.ui.model.odata.CountMode} for all enumeration values and more details.
	 *
	 * Note that a call to this method does not modify the count mode for existing list bindings,
	 * only bindings that are created afterwards will use the new mode when no mode is defined at their creation.
	 *
	 * If no default count mode is set for an <code>ODataModel</code> (v2), the mode <code>Request</code> will be used.
	 *
	 * @param {sap.ui.model.odata.CountMode} sCountMode The new default count mode for this model
	 * @since 1.20
	 * @public
	 */
	ODataModel.prototype.setDefaultCountMode = function(sCountMode) {
		this.sDefaultCountMode = sCountMode;
	};

	/**
	 * Returns the default count mode for retrieving the count of collections
	 *
	 * @returns {sap.ui.model.odata.CountMode} Returns the default count mode for this model
	 * @since 1.20
	 * @public
	 */
	ODataModel.prototype.getDefaultCountMode = function() {
		return this.sDefaultCountMode;
	};

	/**
	 * Adds an entity to the internal cache
	 *
	 * @param {object} oEntity The entity object
	 * @return {string} The normalized entity key
	 * @private
	 */
	ODataModel.prototype._addEntity = function(oEntity) {
		var sKey = this._getKey(oEntity);
		this.oData[sKey] = oEntity;
		return sKey;
	};

	/**
	 * Removes an entity from the internal cache, also removes related changed entity and context
	 *
	 * @param {string} sKey The entity key
	 * @private
	 */
	ODataModel.prototype._removeEntity = function(sKey) {
		sKey = sKey && ODataUtils._normalizeKey(sKey);
		delete this.oData[sKey];
		delete this.mChangedEntities[sKey];
		delete this.mContexts["/" + sKey];
	};

	/**
	 * Returns an entity from the internal cache
	 *
	 * @param {string} sKey The entity key
	 * @return {object} the entity object
	 * @private
	 */
	ODataModel.prototype._getEntity = function(sKey) {
		var oEntity = this.oData[sKey];
		if (!oEntity) {
			sKey = sKey && ODataUtils._normalizeKey(sKey);
			oEntity = this.oData[sKey];
		}
		return oEntity;
	};

	/**
	 * Returns the key part from the given the canonical entry URI, model context or data object or
	 * <code>undefined</code> when the <code>vValue</code> can't be interpreted.
	 *
	 * @param {string|object|sap.ui.model.Context} vValue The canonical entry URI, the context or entry object
	 * @returns {string} Key of the entry
	 * @private
	 */
	ODataModel.prototype._getKey = function(vValue) {
		var sKey, sURI;
		if (vValue instanceof BaseContext) {
			sKey = vValue.getPath().substr(1);
		} else if (vValue && vValue.__metadata && vValue.__metadata.uri) {
			sURI = vValue.__metadata.uri;
			sKey = sURI.substr(sURI.lastIndexOf("/") + 1);
		} else if (typeof vValue === 'string') {
			sKey = vValue.substr(vValue.lastIndexOf("/") + 1);
		}
		if (!this.oData[sKey]) {
			sKey = sKey && ODataUtils._normalizeKey(sKey);
		}
		return sKey;
	};

	/**
	 * Returns the key part for the given the canonical entry URI, model context or data object or
	 * <code>undefined</code> when the <code>vValue</code> can't be interpreted.
	 *
	 * @param {string|object|sap.ui.model.Context} vValue The canonical entry URI, the context or entry object
	 * @returns {string|undefined} Key of the entry or <code>undefined</code>
	 * @public
	 */
	ODataModel.prototype.getKey = function(vValue) {
		return this._getKey(vValue);
	};

	/**
	 * Creates the key from the given collection name and property map.
	 *
	 * Please make sure that the metadata document is loaded before using this function.
	 *
	 * @param {string} sCollection Name of the collection
	 * @param {object} oKeyProperties Object containing at least all the key properties of the entity type
	 * @returns {string} Key of the entry
	 * @public
	 */
	ODataModel.prototype.createKey = function(sCollection, oKeyProperties) {
		var oEntityType = this.oMetadata._getEntityTypeByPath(sCollection),
		sKey = sCollection,
		that = this,
		//aKeys,
		sName,
		oProperty;
		assert(oEntityType, "Could not find entity type of collection \"" + sCollection + "\" in service metadata!");
		sKey += "(";
		if (oEntityType.key.propertyRef.length === 1) {
			sName = oEntityType.key.propertyRef[0].name;
			assert(sName in oKeyProperties, "Key property \"" + sName + "\" is missing in object!");
			oProperty = this.oMetadata._getPropertyMetadata(oEntityType, sName);
			sKey += encodeURIComponent(ODataUtils.formatValue(oKeyProperties[sName], oProperty.type));
		} else {
			each(oEntityType.key.propertyRef, function(i, oPropertyRef) {
				if (i > 0) {
					sKey += ",";
				}
				sName = oPropertyRef.name;
				assert(sName in oKeyProperties, "Key property \"" + sName + "\" is missing in object!");
				oProperty = that.oMetadata._getPropertyMetadata(oEntityType, sName);
				sKey += sName;
				sKey += "=";
				sKey += encodeURIComponent(ODataUtils.formatValue(oKeyProperties[sName], oProperty.type));
			});
		}
		sKey += ")";
		return sKey;
	};

	/**
	 * Returns the value for the property with the given <code>sPath</code>.
	 * Since 1.100, a path starting with &quot;@$ui5.&quot; which represents an instance annotation
	 * is supported. The following instance annotations are allowed; they return information on the
	 * given <code>oContext<code>, which must be set and be an
	 * {@link sap.ui.model.odata.v2.Context}:
	 * <ul>
	 *   <li><code>@$ui5.context.isInactive</code>: The return value of
	 *     {@link sap.ui.model.odata.v2.Context#isInactive}</li>
	 *   <li><code>@$ui5.context.isTransient</code>: The return value of
	 *     {@link sap.ui.model.odata.v2.Context#isTransient}</li>
	 * </ul>
	 *
	 * @param {string} sPath Path/name of the property
	 * @param {object} [oContext] Context if available to access the property value
	 * @param {boolean} [bIncludeExpandEntries=false]
	 *   Deprecated, use {@link #getObject} function with 'select' and 'expand' parameters instead.
	 *   Whether entities for navigation properties of this property which have been read via
	 *   <code>$expand</code> are part of the return value.
	 * @returns {any} Value of the property
	 * @throws {Error}
	 *   If the instance annotation is not supported
	 *
	 * @public
	 */
	ODataModel.prototype.getProperty = function(sPath, oContext, bIncludeExpandEntries) {
		var oValue = this._getObject(sPath, oContext);

		// same behavior as before
		if (!bIncludeExpandEntries) {
			return oValue;
		}
		// if value is a plain value and not an object we return directly
		if (!isPlainObject(oValue)) {
			return oValue;
		}

		// do a value copy or the changes to that value will be modified in the model as well (reference)
		oValue = merge({}, oValue);

		if (bIncludeExpandEntries === true) {
			// include expand entries
			return this._restoreReferences(oValue);
		} else {
			// remove expanded references
			return this._removeReferences(oValue);
		}
	};

	/**
	 * Returns a JSON object that is a copy of the entity data referenced by the given
	 * <code>sPath</code> and <code>oContext</code>. It does not load any data and may not return
	 * all requested data if it is not available.
	 *
	 * With the <code>mParameters.select</code> parameter it is possible to specify comma-separated
	 * property or navigation property names which should be included in the result object. This
	 * works like the OData <code>$select</code> URL parameter. With the
	 * <code>mParameters.expand</code> parameter it is possible to specify comma-separated
	 * navigation property names which should be included inline in the result object. This works
	 * like the OData <code>$expand</code> parameter.
	 *
	 * <b>Note:</b> <code>mParameters.expand</code> can only be used if the corresponding navigation
	 * properties have been read via {@link sap.ui.model.odata.v2.ODataModel#read} using the OData
	 * <code>$expand</code> URL parameter. If a navigation property has not been read via the OData
	 * <code>$expand</code> URL parameter, it is left out in the result. Keep in mind that
	 * navigation properties referencing a collection are usually not loaded via the OData
	 * <code>$expand</code> URL parameter but directly via its navigation property.
	 *
	 * <b>Note:</b> If <code>mParameters.select</code> is not specified, the returned object may
	 * contain model-internal attributes. This may lead to problems when submitting this data to the
	 * service for an update or create operation. To get a copy of the entity without internal
	 * attributes, use <code>{select: "*"}</code> instead.
	 *
	 * <b>Note:</b> If <code>mParameters.select</code> is given and not all selected properties are
	 * available, this method returns <code>undefined</code> instead of incomplete data.
	 *
	 * <b>Note:</b> If <code>mParameters.select</code> is not given, all properties and navigation
	 * properties available on the client are returned.
	 *
	 * Example:<br>
	 * With <code>mParameters</code> given as
	 * <code>{select: "Products/ProductName, Products", expand:"Products"}</code> no properties of
	 * the entity itself are returned, but only the <code>ProductName</code> property of the
	 * <code>Products</code> navigation property. If <code>Products/ProductName</code> has not been
	 * loaded before, <code>undefined</code> is returned.
	 *
	 *
	 * @param {string} sPath
	 *   The path referencing the object
	 * @param {sap.ui.model.Context} [oContext]
	 *   The optional context which is used with the <code>sPath</code> to reference the object.
	 * @param {object} [mParameters]
	 *   Map of parameters
	 * @param {string} [mParameters.select]
	 *   Comma-separated list of properties or paths to properties to select
	 * @param {string} [mParameters.expand]
	 *   Comma-separated list of navigation properties or paths to navigation properties to expand
	 * @ui5-omissible-params oContext
	 * @returns {any|undefined}
	 *   The value for the given path and context or <code>undefined</code> if data or entity type
	 *   cannot be found or if not all selected properties are available
	 *
	 * @public
	 */
	ODataModel.prototype.getObject = function(sPath, oContext, mParameters) {
		// Fallback for optional parameters
		if (isPlainObject(oContext)) {
			mParameters = oContext;
			oContext = undefined;
		}

		var that = this,
			sResolvedPath = this.resolve(sPath, oContext),
			oValue = this._getObject(sResolvedPath),
			oEntityType = this.oMetadata._getEntityTypeByPath(sResolvedPath),
			aExpand = [], aSelect = [];

		// If path does not point to an entity, just return the value
		if (!oEntityType || !isPlainObject(oValue) || !oValue.__metadata || !oValue.__metadata.uri) {
			return oValue;
		}

		// If no select/expand parameters are given, return a clone of the entity (for compatibility)
		if (!mParameters || !(mParameters.select || mParameters.expand)) {
			return merge({}, oValue);
		}

		function getRequestedData(oEntityType, oValue, aSelect, aExpand) {
			var sExpand, i,vNavData, oNavEntityType, aNavExpand, oNavObject, aNavSelect, oNavValue,
				aOwnExpand, aOwnNavSelect, aOwnPropSelect, aResultProps, oResultValue, sSelect;

			// if no value we return undefined
			if (!oValue) {
				return undefined;
			}
			// if no entity type could be found we decide to return no data
			if (!oEntityType) {
				return undefined;
			}
			// check select properties
			aOwnPropSelect = that._filterOwnSelect(aSelect, oEntityType.property);
			// copy selected properties
			oResultValue = {};
			for (i = 0; i < aOwnPropSelect.length; i++) {
				sSelect = aOwnPropSelect[i];
				if (oValue[sSelect] !== undefined || oValue.__metadata.created) {
					oResultValue[sSelect] = oValue[sSelect];
				} else {
					Log.fatal("No data loaded for select property: " + sSelect + " of entry: " + that.getKey(oValue));
					return undefined;
				}
			}
			// add metadata
			if (oValue.__metadata) {
				oResultValue.__metadata = oValue.__metadata;
			}

			// check expanded entities
			aOwnExpand = that._filterOwnExpand(aExpand, aSelect);
			for (i = 0; i < aOwnExpand.length; i++) {
				sExpand = aOwnExpand[i];
				vNavData = oValue[sExpand];

				// get entity type and filter expand/select for this expanded entity
				oNavEntityType = that.oMetadata._getEntityTypeByNavProperty(oEntityType, sExpand);
				aNavSelect = that._filterSelectByNavProp(aSelect, sExpand);
				aNavExpand = that._filterExpandByNavProp(aExpand, sExpand);

				// expanded entities need to be checked recursively for nested expand/select
				if (vNavData && vNavData.__ref) {
					oNavObject = that._getObject("/" + vNavData.__ref);
					oNavValue = getRequestedData(oNavEntityType, oNavObject, aNavSelect, aNavExpand);
					if (oNavValue !== undefined) {
						oResultValue[sExpand] = oNavValue;
					} else {
						Log.fatal("No data loaded for expand property: " + sExpand + " of entry: " + that.getKey(oNavValue));
						return undefined;
					}
				}
				if (vNavData && vNavData.__list) {
					aResultProps = [];
					for (var j = 0; j < vNavData.__list.length; j++) {
						oNavObject = that._getObject("/" + vNavData.__list[j]);
						oNavValue = getRequestedData(oNavEntityType, oNavObject, aNavSelect, aNavExpand);
						if (oNavValue !== undefined) {
							aResultProps.push(oNavValue);
						} else {
							Log.fatal("No data loaded for expand property: " + sExpand + " of entry: " + that.getKey(oNavValue));
							return undefined;
						}
					}
					oResultValue[sExpand] = aResultProps;
				}
			}
			// create _deferred entries for all not expanded nav properties
			aOwnNavSelect = that._filterOwnSelect(aSelect, oEntityType.navigationProperty);
			for (var k = 0; k < aOwnNavSelect.length; k++) {
				sExpand = aOwnNavSelect[k];
				if (aOwnExpand.indexOf(sExpand) === -1) {
					var sUri = oResultValue.__metadata.uri + "/" + sExpand;
					oResultValue[sExpand] = { __deferred: { uri: sUri } };
				}
			}

			return oResultValue;
		}

		if (mParameters.select) {
			aSelect = this._splitEntries(mParameters.select);
		}
		if (mParameters.expand) {
			aExpand = this._splitEntries(mParameters.expand);
		}

		oValue = getRequestedData(oEntityType, oValue, aSelect, aExpand);

		return oValue;
	};

	/**
	 * Returns the value of the entity or entity property referenced by the given <code>sPath</code>
	 * and <code>oContext</code>.
	 *
	 * @param {string} sPath
	 *   Binding path
	 * @param {object} [oContext]
	 *   Binding context
	 * @param {boolean} [bOriginalValue]
	 *   Whether to return the original value read from the server even if changes where made
	 * @param {boolean} [bUseUndefinedIfUnresolved]
	 *   Whether to return <code>undefined</code> if the given path and context do not yield a
	 *   resolved path; if not set, the method returns <code>null</code>
	 * @returns {any} vValue
	 *   Value for the given path/context
	 * @throws {Error}
	 *   If the instance annotation is not supported
	 *
	 * @private
	 */
	ODataModel.prototype._getObject = function(sPath, oContext, bOriginalValue,
			bUseUndefinedIfUnresolved) {
		var oChangedNode, oCodeListPromise, sCodeListTerm, sDataPath, sKey, oMetaContext,
			oMetaModel, sMetaPath, oOrigNode, sResolvedPath, iSeparator,
			vUnresolvedDefault = bUseUndefinedIfUnresolved ? undefined : null;
		let oNode = vUnresolvedDefault;

		sResolvedPath = this.resolve(sPath, oContext, this.bCanonicalRequests);
		if (!sResolvedPath && this.bCanonicalRequests) {
			sResolvedPath = this.resolve(sPath, oContext);
		}
		if (!sResolvedPath) {
			return oNode;
		}
		if (sPath && sPath.startsWith("@$ui5.")) {
			return this._getInstanceAnnotationValue(sPath, oContext);
		}
		//check for metadata path
		if (this._isMetadataPath(sResolvedPath)) {
			if (this.oMetadata && this.oMetadata.isLoaded())  {
				if (this.isMetaModelPath(sResolvedPath)) {
					// Metadata binding resolved by ODataMetaModel
					oMetaModel = this.getMetaModel();
					sCodeListTerm = ODataMetaModel.getCodeListTerm(sResolvedPath);
					if (sCodeListTerm) {
						oCodeListPromise = oMetaModel.fetchCodeList(sCodeListTerm);
						if (oCodeListPromise.isFulfilled()) {
							return oCodeListPromise.getResult();
						}
						if (oCodeListPromise.isRejected()) {
							// if the code list promise rejects we rely on error logging in
							// ODataMetaModel#fetchCodeList
							oCodeListPromise.caught();
						}
						return undefined;
					}
					if (!this.bMetaModelLoaded) {
						return null;
					}
					iSeparator = sResolvedPath.indexOf('/##');
					sDataPath = sResolvedPath.substr(0, iSeparator);
					sMetaPath = sResolvedPath.substr(iSeparator + 3);
					oMetaContext = oMetaModel.getMetaContext(sDataPath);
					oNode = oMetaModel.getProperty(sMetaPath, oMetaContext);
				} else {
					// Metadata binding resolved by ODataMetadata
					oNode = this.oMetadata._getAnnotation(sResolvedPath);
				}
			} else if (ODataMetaModel.getCodeListTerm(sResolvedPath)) {
				return undefined;
			}
		} else {
			// doesn't make any sense, but used to work
			if (sResolvedPath === "/") {
				return this.oData;
			}
			var aParts = sResolvedPath.split("/"),
			iIndex = 0;
			// absolute path starting with slash
			sKey = aParts[1];
			aParts.splice(0,2);

			oChangedNode = this.mChangedEntities[sKey];
			oOrigNode = this._getEntity(sKey);
			oNode = bOriginalValue ? oOrigNode : oChangedNode || oOrigNode;
			while (oNode && aParts[iIndex]) {
				var bHasChange = oChangedNode && oChangedNode.hasOwnProperty(aParts[iIndex]);
				oChangedNode = oChangedNode && oChangedNode[aParts[iIndex]];
				oOrigNode = oOrigNode && oOrigNode[aParts[iIndex]];
				oNode = bOriginalValue || !bHasChange ? oOrigNode : oChangedNode;
				if (oNode) {
					if (oNode.__ref) {
						oChangedNode = this.mChangedEntities[oNode.__ref];
						oOrigNode =  this._getEntity(oNode.__ref);
						oNode =  bOriginalValue ? oOrigNode : oChangedNode || oOrigNode;
					} else if (oNode.__list) {
						oNode = oNode.__list;
					} else if (oNode.__deferred) {
						// set to undefined and not to null because navigation properties can have a null value
						oNode = undefined;
					}
				}
				iIndex++;
			}
		}
		// if we have a changed Entity/complex type we need to extend it with the backend data
		if (isPlainObject(oChangedNode)) {
			oNode =  bOriginalValue ? oOrigNode : merge({}, oOrigNode, oChangedNode);
		}
		return oNode;
	};

	/**
	 * Gets the instance annotation value for the given path corresponding to the instance
	 * annotation and the given context. The following instance annotations are supported:
	 * <ul>
	 *   <li><code>@$ui5.context.isInactive</code></li>
	 *   <li><code>@$ui5.context.isTransient</code></li>
	 * </ul>
	 *
	 * @param {string} sPath Binding path
	 * @param {sap.ui.model.odata.v2.Context} oContext Binding context
	 * @returns {any} The result of the processed instance annotation
	 * @throws {Error} If the instance annotation is not supported
	 *
	 * @private
	 */
	ODataModel.prototype._getInstanceAnnotationValue = function (sPath, oContext) {
		if (sPath === "@$ui5.context.isInactive") {
			return oContext.isInactive();
		}
		if (sPath === "@$ui5.context.isTransient") {
			return oContext.isTransient();
		}
		throw new Error("Unsupported instance annotation: " + sPath);
	};

	/**
	 * Update the security token, if token handling is enabled and token is not available yet
	 * @private
	 */
	ODataModel.prototype.updateSecurityToken = function() {
		if (this.bTokenHandling) {
			if (!this.oSharedServiceData.securityToken) {
				this.refreshSecurityToken();
			}
			// Update header every time, in case security token was changed by other model
			// Check bTokenHandling again, as refreshSecurityToken() might disable token handling
			if (this.bTokenHandling) {
				this.oHeaders["x-csrf-token"] = this.oSharedServiceData.securityToken;
			}
		}
	};

	/**
	 * Clears the security token, as well from the service data as from the headers object
	 * @private
	 */
	ODataModel.prototype.resetSecurityToken = function() {
		delete this.oSharedServiceData.securityToken;
		delete this.oHeaders["x-csrf-token"];
		delete this.pSecurityToken;
	};

	/**
	 * Returns a promise, which will resolve with the security token as soon as it is available.
	 *
	 * @returns {Promise} A promise on the security token
	 *
	 * @public
	 */
	ODataModel.prototype.securityTokenAvailable = function() {
		if (!this.pSecurityToken) {
			if (this.oSharedServiceData.securityToken) {
				this.pSecurityToken = Promise.resolve(this.oSharedServiceData.securityToken);
			} else {
				this.pSecurityToken = new Promise(function(resolve, reject) {
					this.refreshSecurityToken(function() {
						resolve(this.oSharedServiceData.securityToken);
					}.bind(this),function(){
						reject();
					}, true);
				}.bind(this));
			}
		}
		return this.pSecurityToken;
	};

	/**
	 * Refresh XSRF token by performing a GET request against the service root URL.
	 *
	 * @param {function} [fnSuccess] Callback function which is called when the data has
	 *            					 been successfully retrieved.
	 * @param {function} [fnError] Callback function which is called when the request failed. The handler can have the parameter: oError which contains
	 *  additional error information.
	 * @param {boolean} [bAsync=false] Whether the request should be sent asynchronously
	 * @returns {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.refreshSecurityToken = function(fnSuccess, fnError, bAsync) {
		var oRequest, sToken,
			mTokenRequest = {
				abort: function() {
					this.request.abort();
				}
			},
			sUrl = this._createRequestUrlWithNormalizedPath("/"),
			that = this;

		function handleSuccess(oData, oResponse) {
			if (oResponse) {
				sToken = that._getHeader("x-csrf-token", oResponse.headers);
				that._setSessionContextIdHeader(that._getHeader("sap-contextid", oResponse.headers));
				if (sToken) {
					if (that.oSharedServerData) {
						that.oSharedServerData.securityToken = sToken;
					}
					that.oSharedServiceData.securityToken = sToken;
					that.pSecurityToken = Promise.resolve(sToken);
					// For compatibility with applications, that are using getHeaders() to retrieve the current
					// security token additionally keep it in the oHeaders object
					that.oHeaders["x-csrf-token"] = sToken;
				} else {
					// Disable token handling, if service does not return tokens
					that.resetSecurityToken();
					that.bTokenHandling = false;
				}
			}

			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
		}

		function handleGetError(oError) {
			// Disable token handling, if token request returns an error
			that.resetSecurityToken();
			that.bTokenHandling = false;
			that._handleError(oError, oRequest);

			if (fnError) {
				fnError(oError);
			}
		}

		function handleHeadError(oError) {
			// Disable token handling, if token request returns an error
			mTokenRequest.request = requestToken("GET", handleGetError);
		}

		function requestToken(sRequestType, fnError) {
			// trigger a read to the service url to fetch the token
			oRequest = that._createRequest(sUrl, "", sRequestType,
				that._getHeaders(undefined, true), null, null, !!bAsync);
			oRequest.headers["x-csrf-token"] = "Fetch";
			return that._request(oRequest, handleSuccess, fnError, undefined, undefined, that.getServiceMetadata());
		}


		// Initially try method "HEAD", error handler falls back to "GET" unless the flag forbids HEAD request
		if (this.bDisableHeadRequestForToken) {
			mTokenRequest.request = requestToken("GET", handleGetError);
		} else {
			mTokenRequest.request = requestToken("HEAD", handleHeadError);
		}
		return mTokenRequest;

	};

	/**
	 * Checks for a 503 HTTP "Retry-After" error response. Invokes the "Retry-After" handler if registered
	 * and remembers the <code>pRetryAfter</code> returned by the handler. Repeats the failed request once
	 * the promise resolves, or calls the given error handler once the promise rejects.
	 *
	 * @param {object} oRequest The request object
	 * @param {object} oErrorResponse The error response from the back end
	 * @param {function} fnSuccess The success callback function
	 * @param {function} fnError The error callback function
	 * @returns {boolean} Whether it is a 503 "Retry-After" error response and the error is processed
	 *   by the "Retry-After" handler
	 * @private
	 */
	ODataModel.prototype.checkAndProcessRetryAfterError = function(oRequest, oErrorResponse, fnSuccess, fnError) {
		if (oErrorResponse.response?.statusCode === 503
			&& this._getHeader("retry-after", oErrorResponse.response.headers)
			&& this.fnRetryAfter
			&& !this.bSequentializeRequests) {
			if (!this.pRetryAfter) {
				this.oRetryAfterError = this.createRetryAfterError(oErrorResponse);
				this.pRetryAfter = this.fnRetryAfter(this.oRetryAfterError);
			}
			this.pRetryAfter.then(() => {
				this.pRetryAfter = this.oRetryAfterError = null;
				this._submitRequest(oRequest, fnSuccess, fnError);
			}, (oReason) => {
				this.pRetryAfter = null; // this.oRetryAfterError must not be reset!
				this.onRetryAfterRejected(fnError, oErrorResponse, oReason);
			});
			return true;
		}
		return false;
	};

	/**
	 * Creates an {@link module:sap/ui/model/odata/v2/RetryAfterError} for a 503 "Retry-After" error response.
	 *
	 * @param {object} oErrorResponse The 503 "Retry-After" error response from the back end
	 * @returns {module:sap/ui/model/odata/v2/RetryAfterError} The created "Retry-After" error object
	 * @private
	 */
	ODataModel.prototype.createRetryAfterError = function (oErrorResponse) {
		const oError = new Error(oErrorResponse.message);
		const sRetryAfter = this._getHeader("retry-after", oErrorResponse.response.headers);
		const iRetryAfter = parseInt(sRetryAfter);
		oError.retryAfter
			= new Date(Number.isNaN(iRetryAfter) ? sRetryAfter : Date.now() + iRetryAfter * 1000);
		return oError;
	};

	/**
	 * Reject handler for <code>this.pRetryAfter</code>.
	 *
	 * If the given <code>oReason</code> and <code>this.oRetryAfterError</code> originally passed to the "Retry-after"
	 * handler are the same, then the <code>fnError</code> callback is called with <code>oErrorResponse</code> and
	 * <code>this.oRetryAfterError</code> is logged and reported to the message model. Otherwise the given
	 * <code>oReason</code> is only logged.
	 * Note:
	 * An undefined <code>oErrorResponse</code> results from those requests that are NOT sent out at all because
	 * they were just registered for an already existing <code>this.pRetryAfter</code> in order to be send out
	 * later on once the promise will be resolved. In case the promise is rejected, the inline error response here
	 * passed to <code>fnError</code> ensures that nothing is reported/logged but further error processing happens
	 * (e.g. call error callback).
	 *
	 * @param {function} fnError The error callback function
	 * @param {object} [oErrorResponse] The 503 "Retry-After" error response from the back end
	 * @param {Error} [oReason] The <code>Error</code> reason the promise was rejected with
	 * @private
	 */
	ODataModel.prototype.onRetryAfterRejected = function(fnError, oErrorResponse, oReason) {
		const sReason = oReason?.message
			? "Retry-After handler rejected with: " + oReason.message
			: "Retry-After handler rejected w/o reason";
		if (oErrorResponse && this.oRetryAfterError !== oReason) {
			oErrorResponse.$ownReason = true;
			Log.error(sReason, oReason.stack, sClassName);
		}
		fnError(oErrorResponse || {$ownReason : true, message : sReason});
	};

	/**
	 * Submit changes from the request queue (queue can currently have only one request).
	 *
	 * @param {object} oRequest The request object
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Error callback function
	 * @returns {object} request handle
	 * @private
	 */
	ODataModel.prototype._submitRequest = function(oRequest, fnSuccess, fnError){
		var that = this, oHandler, oRequestHandle, bAborted, pRequestCompleted, fnResolveCompleted;

		//Create promise to track when this request is completed
		pRequestCompleted = new Promise(function(resolve, reject) {
			fnResolveCompleted = resolve;
		});

		function handleSuccess(oData, oResponse) {
			//if batch the responses are handled by the batch success handler
			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
			that.aSideEffectCleanUpFunctions.forEach(function (fnCleanUp) {
				fnCleanUp();
			});
			that.aSideEffectCleanUpFunctions = [];
			fnResolveCompleted();
		}

		function handleError(oError) {

			// If error is a 403 with XSRF token "Required" reset the token and retry sending request
			if (that.bTokenHandling && oError.response) {
				var sToken = that._getHeader("x-csrf-token", oError.response.headers);
				if (!oRequest.bTokenReset && oError.response.statusCode == '403' && sToken && sToken.toLowerCase() === "required") {
					that.resetSecurityToken();
					oRequest.bTokenReset = true;
					submitWithToken();
					return;
				}
			}
			if (that.checkAndProcessRetryAfterError(oRequest, oError, fnSuccess, fnError)) {
				return;
			}

			if (fnError) {
				fnError(oError);
			}
			// no need to clean up side-effects expands as no data was imported
			fnResolveCompleted();
		}

		function readyForRequest(oRequest) {
			if (that.bTokenHandling && (oRequest.method !== "GET" || that.bTokenHandlingForGet)) {
				that.pReadyForRequest = that.securityTokenAvailable();
			}
			return that.pReadyForRequest;
		}

		function submitWithToken() {
			// Make sure requests not requiring a security token don't send one.
			if (that.bTokenHandling) {
				delete oRequest.headers["x-csrf-token"];
			}
			// request token only if we have change operations or batch requests
			// token needs to be set directly on request headers, as request is already created
			readyForRequest(oRequest).then(function(sToken) {
				// Check bTokenHandling again, as updating the token might disable token handling
				if (that.bTokenHandling && (oRequest.method !== "GET" || that.bTokenHandlingForGet)) {
					oRequest.headers["x-csrf-token"] = sToken;
				}
				submit();
			}, function() {
				submit();
			});
		}

		function fireEvent(sType, oRequest, oError) {
			var oEventInfo,
				aRequests = oRequest.eventInfo.requests;
			if (aRequests) {
				each(aRequests, function(i, oRequest) {
					if (Array.isArray(oRequest)) {
						oRequest.forEach(function(oRequest) {
							each(oRequest.parts, function(i, oPart) {
								oEventInfo = that._createEventInfo(oRequest.request, oPart.fnError);
								that["fireRequest" + sType](oEventInfo);
							});
						});
					} else if (oRequest.parts) {
						each(oRequest.parts, function(i, oPart) {
							oEventInfo = that._createEventInfo(oRequest.request, oPart.fnError);
							that["fireRequest" + sType](oEventInfo);
						});
					} else {
						oEventInfo = that._createEventInfo(oRequest.request, oRequest.fnError);
						that["fireRequest" + sType](oEventInfo);
					}
				});
				if (oRequest.eventInfo.batch){
					oEventInfo = that._createEventInfo(oRequest, oError, aRequests);
					that["fireBatchRequest" + sType](oEventInfo);
				}
			}
		}

		function submit() {
			if (that.sSessionContextId) {
				oRequest.headers["sap-contextid"] = that.sSessionContextId;
			}
			oRequestHandle = that._request(oRequest, handleSuccess, handleError, oHandler, undefined, that.getServiceMetadata());
			if (oRequest.eventInfo) {
				fireEvent("Sent", oRequest, null);
				delete oRequest.eventInfo;
			}
			if (bAborted && oRequestHandle) {
				oRequestHandle.abort();
			}
		}

		if (this.pRetryAfter) {
			this.pRetryAfter.then(() => {
				this._submitRequest(oRequest, fnSuccess, fnError);
			}, (oReason) => {
				this.onRetryAfterRejected(fnError, undefined, oReason);
			});
		} else {
			//handler only needed for $batch; datajs gets the handler from the accept header
			oHandler = that._getODataHandler(oRequest.requestUri);

			// If requests are serialized, chain it to the current request, otherwise just submit
			if (this.bSequentializeRequests) {
				this.pSequentialRequestCompleted.then(function() {
					submitWithToken();
				});
				this.pSequentialRequestCompleted = pRequestCompleted;
			} else {
				submitWithToken();
			}
		}

		return {
			abort: function() {
				if (oRequestHandle) {
					oRequestHandle.abort();
				}
				bAborted = true;
			}
		};
	};

	/**
	 * Sets the new context session ID (SID).
	 *
	 * This SID will be send in the header of every following OData request in order to reuse the same OData Service session.
	 *
	 * @param {string} sSessionContextId New session context ID
	 * @private
	 */
	ODataModel.prototype._setSessionContextIdHeader = function(sSessionContextId) {
		if (sSessionContextId){
			this.sSessionContextId = sSessionContextId;
		}
	};

	/**
	 * Submit of a single request.
	 *
	 * @param {object} oRequest The request object
	 * @returns {object} Handle for the request, providing at least an <code>abort</code> method
	 * @private
	 */
	ODataModel.prototype._submitSingleRequest = function(oRequest) {
		var that = this,
			oRequestHandle,
			mChangeEntities = {},
			mGetEntities = {},
			mEntityTypes = {};

		function handleSuccess(oData, oResponse) {
			// If there is a 200 response which does not contain valid data, this should be treated as an error.
			// This may happen in case of SAML session expiration.
			if (oData === undefined && oResponse.statusCode === 200) {
				handleError({
					message: "Response did not contain a valid OData result",
					response: oResponse
				});
				return;
			}

			function successWrapper(oData, oResponse) {
				for (var i = 0; i < oRequest.parts.length; i++) {
					if (oRequest.parts[i].request._aborted){
						that._processAborted(oRequest.parts[i].request, oResponse);
					} else if (oRequest.parts[i].fnSuccess) {
						oRequest.parts[i].fnSuccess(oData, oResponse);
					}
				}
				if (oRequest.request.requestUri.indexOf("$count") === -1) {
					that.checkUpdate(false, false, mGetEntities);
					if (oRequest.bRefreshAfterChange){
						that._refresh(false, undefined, mChangeEntities, mEntityTypes);
					}
				}
			}

			that._processSuccess(oRequest.request, oResponse, successWrapper, mGetEntities, mChangeEntities, mEntityTypes);
			that._invalidatePathCache();
			that._setSessionContextIdHeader(that._getHeader("sap-contextid", oResponse.headers));
		}

		function handleError(oError) {
			var i;

			if (oError.message == "Request aborted") {
				for (i = 0; i < oRequest.parts.length; i++){
					that._processAborted(oRequest.parts[i].request, oError);
				}
			} else {
				for (i = 0; i < oRequest.parts.length; i++) {
					that._processError(oRequest.parts[i].request, oError, oRequest.parts[i].fnError);
				}
			}

			that._processAfterUpdate();
		}

		oRequest.request.eventInfo = {
				requests: oRequest.parts,
				batch: false
		};
		oRequestHandle =  this._submitRequest(oRequest.request, handleSuccess, handleError);

		return oRequestHandle;
	};

	/**
	 * Submit of a batch request.
	 *
	 * @param {object} oBatchRequest The batch request object
	 * @param {array} aRequests Array of requests; defines the order of requests in the batch
	 * @param {function} fnSuccess Success callback function
	 * @param {fnError} fnError Error callback function
	 * @returns {object} Handle for the batch request, providing at least an <code>abort</code> method
	 * @private
	 */
	ODataModel.prototype._submitBatchRequest = function(oBatchRequest, aRequests, fnSuccess, fnError) {
		var that = this,
			mChangeEntities = {},
			mContentID2KeyAndDeepPath = {},
			mGetEntities = {},
			mEntityTypes = {};

		function processResponse(oRequest, oResponse, bAborted) {
			var sContentID, sEntityKey, i;

			for (i = 0; i < oRequest.parts.length; i++) {
				var sOriginalDeepPath, sOriginalUri;

				if (bAborted || oRequest.parts[i].request._aborted) {
					that._processAborted(oRequest.parts[i].request, oResponse);
				} else if (oResponse.message) {
					that._processError(oRequest.parts[i].request, oResponse, oRequest.parts[i].fnError);
				} else {
					if (oRequest.request.contentID) {
						sContentID = oRequest.request.contentID;
						if (oRequest.request.created || oRequest.request.functionMetadata) {
							sEntityKey = that._getKey(oResponse.data);

							mContentID2KeyAndDeepPath[sContentID] = {
								key : sEntityKey,
								functionImport : !!oRequest.request.functionMetadata,
								deepPath : oRequest.request.deepPath.replace(
									"('" + sContentID + "')",
										sEntityKey.slice(sEntityKey.indexOf("(")))
							};
						} else {
							// creation request must have been successful -> map entry exists
							sEntityKey = mContentID2KeyAndDeepPath[sContentID].key;
							if (mContentID2KeyAndDeepPath[sContentID].functionImport) {
								sOriginalDeepPath = oRequest.request.deepPath;
								sOriginalUri = oRequest.request.requestUri;
							}
							oRequest.request.requestUri =
								oRequest.request.requestUri.replace("$" + sContentID, sEntityKey);
							oRequest.request.deepPath =
								mContentID2KeyAndDeepPath[sContentID].deepPath;
						}
					}

					that._processSuccess(oRequest.parts[i].request, oResponse,
						oRequest.parts[i].fnSuccess, mGetEntities, mChangeEntities, mEntityTypes,
						/*bBatch*/false, /*aRequests*/undefined, mContentID2KeyAndDeepPath);

					if (sOriginalUri) {
						// restore original values for potential retry of function import
						oRequest.request.deepPath = sOriginalDeepPath;
						oRequest.request.requestUri = sOriginalUri;
					}
				}
			}
		}

		function handleSuccess(oData, oBatchResponse) {
			// If there is a 200 response which does not contain valid data, this should be treated as an error.
			// This may happen in case of SAML session expiration.
			if (oData === undefined && oBatchResponse.statusCode === 200) {
				handleError({
					message: "Response did not contain a valid OData batch result",
					response: oBatchResponse
				});
				return;
			}

			var oResponse, oRequestObject, aChangeResponses,
				aBatchResponses = oData.__batchResponses;

			if (aBatchResponses) {
				var i,j;
				for (i = 0; i < aBatchResponses.length; i++) {
					oResponse = aBatchResponses[i];

					if (Array.isArray(aRequests[i])) {
						//changeSet failed
						if (oResponse.message) {
							for (j = 0; j < aRequests[i].length; j++) {
								// ensure that messages are reported for each request in a changeset
								// as we cannot assign the error to a specific request
								oResponse.$reported = false;
								oRequestObject = aRequests[i][j];
								processResponse(oRequestObject, oResponse);
								oRequestObject.response = oResponse;
							}
						} else {
							aChangeResponses = oResponse.__changeResponses;
							for (j = 0; j < aChangeResponses.length; j++) {
								var oChangeResponse = aChangeResponses[j];
								oRequestObject = aRequests[i][j];
								processResponse(oRequestObject, oChangeResponse);
								oRequestObject.response = oChangeResponse;
							}
						}
					} else {
						oRequestObject = aRequests[i];
						processResponse(oRequestObject, oResponse);
						oRequestObject.response = oResponse;
					}
				}
				that._invalidatePathCache();
				that.checkUpdate(false, false, mGetEntities);
			}

			that._processSuccess(oBatchRequest, oBatchResponse, fnSuccess, mGetEntities, mChangeEntities, mEntityTypes, true, aRequests);
			that._setSessionContextIdHeader(that._getHeader("sap-contextid", oBatchResponse.headers));
		}

		function handleError(oError) {
			var bAborted = oError.message == "Request aborted";

			oError.$reported = true; // avoid that individual requests log the error
			// Call processError for all contained requests first
			each(aRequests, function(i, oRequest) {
				if (Array.isArray(oRequest)) {
					oRequest.forEach(function(oRequest) {
						processResponse(oRequest, oError, bAborted);
					});
				} else {
					processResponse(oRequest, oError, bAborted);
				}
			});

			that._processAfterUpdate();

			if (bAborted) {
				that._processAborted(oBatchRequest, oError, true);
			} else {
				// ensure that the error is reported for the complete $batch, except for those rejected with own reason
				oError.$reported = oError.$ownReason || false;
				that._processError(oBatchRequest, oError, fnError, true, aRequests);
			}
		}

		oBatchRequest.eventInfo = {
				requests: aRequests,
				batch: true
		};
		var oBatchRequestHandle = this._submitRequest(oBatchRequest, handleSuccess, handleError);

		function callAbortHandler(oRequest) {
			var fnError;
			for (var i = 0; i < oRequest.parts.length; i++) {
				fnError = oRequest.parts[i].fnError;
				if (!oRequest.parts[i].request._aborted && fnError) {
					fnError(ODataModel._createAbortedError());
				}
			}
		}

		var oRequestHandle = {
			abort: function(bSuppressErrorHandlerCall) {
				each(aRequests, function(i, oRequest) {
					if (Array.isArray(oRequest)) {
						oRequest.forEach(function(oRequest) {
							callAbortHandler(oRequest);
						});
					} else {
						callAbortHandler(oRequest);
					}
				});
				if (fnError && !bSuppressErrorHandlerCall) {
					fnError(ODataModel._createAbortedError());
				}
				oBatchRequestHandle.abort();
			}
		};

		return oRequestHandle;
	};


	/**
	 * If canonical path changes were detected, all canonical path cache entries are checked for up-to-dateness.
	 * @private
	 */

	ODataModel.prototype._invalidatePathCache = function(){
		var that = this, iIndex;
		if (Object.keys(this.mInvalidatedPaths).length > 0){
			Object.keys(this.mPathCache).forEach(function(sKey){
				// Search for matching key and navigation property, e.g.: (key=123)/ToProduct
				for (var sUpdateKey in that.mInvalidatedPaths) {
					iIndex = sKey.indexOf(sUpdateKey);
					if (iIndex > -1) {
						if (iIndex + sUpdateKey.length !== sKey.length) {
							var sEnd = sKey.substr(iIndex + sUpdateKey.length);
							that.mPathCache[sKey].canonicalPath = that.mInvalidatedPaths[sUpdateKey] === null ? null : that.mInvalidatedPaths[sUpdateKey] + sEnd;
						} else {
							that.mPathCache[sKey].canonicalPath = that.mInvalidatedPaths[sUpdateKey];
						}
					}
				}
			});
		}
		this.mInvalidatedPaths = {};
	};

	/**
	 * Create a batch request object.
	 *
	 * @param {array} aBatchRequests Array of request objects
	 * @returns {object} The request object for the batch
	 * @private
	 */
	ODataModel.prototype._createBatchRequest = function(aBatchRequests) {
		var sUrl, oRequest,
		oChangeHeader = {},
		oPayload = {},
		bCancelOnClose = true;

		oPayload.__batchRequests = aBatchRequests;


		// If one requests leads to data changes at the back-end side, the canceling of the batch request must be prevented.
		for (var sIndex in aBatchRequests) {
			if (aBatchRequests[sIndex] && aBatchRequests[sIndex].__changeRequests ||
				aBatchRequests[sIndex] && aBatchRequests[sIndex].headers && !aBatchRequests[sIndex].headers['sap-cancel-on-close']) {
				bCancelOnClose = false;
				break;
			}
		}
		sUrl = this.sServiceUrl	+ "/$batch";


		if (this.aUrlParams.length > 0) {
			sUrl += "?" + this.aUrlParams.join("&");
		}

		extend(oChangeHeader, this.mCustomHeaders, this.oHeaders);

		// Set Accept header for $batch requests
		oChangeHeader["Accept"] = "multipart/mixed";

		// reset
		delete oChangeHeader["Content-Type"];

		oChangeHeader['sap-cancel-on-close'] = bCancelOnClose;

		oRequest = {
				headers : oChangeHeader,
				requestUri : sUrl,
				method : "POST",
				data : oPayload,
				user: this.sUser,
				password: this.sPassword,
				async: true
		};

		oRequest.withCredentials = this.bWithCredentials;

		return oRequest;
	};

	/**
	 * Abort internal requests such as created via two-way binding changes or created entries.
	 *
	 * @param {string} sGroupId ID of the group that should be searched for the request
	 * @param {object} [mParameters]
	 * Map which contains the following parameter properties:
	 * @param {string} [mParameters.requestKey] Request key used to find the requests, which needs to aborted.
	 * @param {string} [mParameters.path] Path used to find the requests, which needs to be aborted.
	 * @private
	 */
	ODataModel.prototype.abortInternalRequest = function(sGroupId, mParameters) {
		var mRequests = this.mRequests;
		var sRequestKey, sPath;
		if (mParameters){
			sRequestKey = mParameters.requestKey;
			sPath = mParameters.path;
		}

		if (sGroupId in this.mDeferredGroups) {
			mRequests = this.mDeferredRequests;
		}

		var abortRequest = function(oRequest){
			for (var i = 0; i < oRequest.parts.length; i++) {
				oRequest.parts[i].requestHandle.abort();
			}
		};

		var oRequestGroup = mRequests[sGroupId];

		if (oRequestGroup) {
			if (sRequestKey in oRequestGroup.map){
				abortRequest(oRequestGroup.map[sRequestKey]);
			} else if (sPath){
				each(oRequestGroup.map, function(sRequestKey, oRequest){
					if (sRequestKey.indexOf(sPath) >= 0){
						abortRequest(oRequest);
					}
				});
			} else if (sGroupId && !mParameters){
				each(oRequestGroup.map, function(sKey, oRequest){
					abortRequest(oRequest);
				});
			}
		}
	};

	/**
	 * Push request to internal request queue.
	 *
	 * @param {map} mRequests Request queue
	 * @param {string} sGroupId ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [sChangeSetId] The changeSet Id
	 * @param {object} oRequest The request
	 * @param {function} fnSuccess The success callback function
	 * @param {function} fnError The error callback function
	 * @param {object} requestHandle Handle for the requests
	 * @param {boolean} bRefreshAfterChange Enable/Disable updates of all bindings after change operations for the given requests
	 * @private
	 */
	ODataModel.prototype._pushToRequestQueue = function(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError, requestHandle, bRefreshAfterChange) {
		var oGroupEntry,
			oRequestGroup = mRequests[sGroupId],
			sRequestKey = oRequest.key ? oRequest.key : oRequest.method + ":" + oRequest.requestUri;

		//ignore requests in warmup scenario
		if (this.bWarmup) {
			return;
		}
		//create request group if it does not exist
		if (!oRequestGroup) {
			oRequestGroup = {};
			oRequestGroup.map = {};
			oRequestGroup.requests = [];
			mRequests[sGroupId] = oRequestGroup;
		}

		//'combine' only GET and internal create&change requests.
		if (sRequestKey in oRequestGroup.map && (oRequest.key || oRequest.method === 'GET')) {
			oGroupEntry = oRequestGroup.map[sRequestKey];
			var oStoredRequest = oGroupEntry.request;
			oRequest.deepPath = oStoredRequest.deepPath;
			if (oGroupEntry.bRefreshAfterChange === undefined) { // If not already defined, overwrite with new flag
				oGroupEntry.bRefreshAfterChange = bRefreshAfterChange;
			}

			if (!oRequest.key) {
				oGroupEntry.parts.push({
					request:	oRequest,
					fnSuccess:	fnSuccess,
					fnError:	fnError,
					requestHandle:	requestHandle
				});
			}

			if (oRequest.method === "GET") {
				//delete data if any. Could happen for GET Function imports
				delete oStoredRequest.data;
			} else {
				oStoredRequest.method = oRequest.method;
				oStoredRequest.headers = oRequest.headers;
				oStoredRequest.data = oRequest.data;
				oStoredRequest.sideEffects = oRequest.sideEffects;

				if (oRequest.method === "PUT") {
					// if stored request was a MERGE before (created by setProperty) but is now sent via PUT
					// (by submitChanges) the merge header must be removed
					delete oStoredRequest.headers["x-http-method"];
				}
				// if request is already aborted we should delete the aborted flag
				if (oStoredRequest._aborted) {
					delete oStoredRequest._aborted;
				}
			}

			if (oStoredRequest.functionMetadata) {
				// function imports need to replace the requestUri
				oStoredRequest.requestUri = oRequest.requestUri;
				// function imports need to update the functionTarget in case the function
				// parameters are changed before submitting
				oStoredRequest.functionTarget = oRequest.functionTarget;
			}
		} else {
			oGroupEntry = {
				request: oRequest,
				bRefreshAfterChange: bRefreshAfterChange,
				parts: [{
					request:	oRequest,
					fnSuccess:	fnSuccess,
					fnError:	fnError,
					requestHandle: 	requestHandle
				}]
			};
			if (oRequest.method === "GET") {
				oRequestGroup.requests.push(oGroupEntry);
			} else {
				if (!oRequestGroup.changes) {
					oRequestGroup.changes = {};
				}
				var oChangeGroup = oRequestGroup.changes[sChangeSetId];
				if (!oChangeGroup) {
					oChangeGroup = [];
					oRequestGroup.changes[sChangeSetId] = oChangeGroup;
				}
				oGroupEntry.changeSetId = sChangeSetId;
				oChangeGroup.push(oGroupEntry);
			}
			oRequestGroup.map[sRequestKey] = oGroupEntry;
		}
	};

	/**
	 * Collects all entities or entity types that shall be refreshed
	 *
	 * @param {object} oGroup The batchGroup
	 * @param {map} mChangedEntities A map containing the changed entities of the batchGroup
	 * @param {map} mEntityTypes A map containing the changed EntityTypes
	 *
	 * @private
	 */
	ODataModel.prototype._collectChangedEntities = function(oGroup, mChangedEntities, mEntityTypes) {
		var that = this;

		if (oGroup.changes) {
			each(oGroup.changes, function(sChangeSetId, aChangeSet){
				for (var i = 0; i < aChangeSet.length; i++) {
					if (aChangeSet[i].bRefreshAfterChange) {
						var oRequest = aChangeSet[i].request,
							sPath = "/" + oRequest.requestUri.split("?")[0],
							oObject, sKey;
						if (oRequest.method === "POST" || oRequest.method === "DELETE") {
							var oEntityMetadata = that.oMetadata._getEntityTypeByPath(sPath);
							if (oEntityMetadata) {
								mEntityTypes[oEntityMetadata.entityType] = true;
							}
						} else {
							oObject = that._getObject(sPath);
							if (oObject) {
								sKey = that._getKey(oObject);
							} else if (sPath.lastIndexOf("/") === 0) {
								sKey = that._getKey(sPath);
							}
							if (sKey) {
								mChangedEntities[sKey] = true;
							}
						}
					}
				}
			});
		}
	};

	/**
	 * Request queue processing.
	 *
	 * @param {map} mRequests Request queue
	 * @param {string} sGroupId ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Error callback function
	 * @param {string} [mChangeHeaders]
	 *   The map of headers to add to each change request within the $batch requests created
	 * @returns {object|array} oRequestHandle The request handle: array if multiple requests are sent
	 * @private
	 */
	ODataModel.prototype._processRequestQueue = function(mRequests, sGroupId, fnSuccess, fnError, mChangeHeaders){
		var that = this, sPath,
			aRequestHandles = [];

		function checkAbort(oRequest, oWrappedBatchRequestHandle) {
			for (var i = 0; i < oRequest.parts.length; i++) {
				var oPart = oRequest.parts[i];
				if (oPart.request._aborted) {
					that._processAborted(oRequest.request, null);
					oRequest.parts.splice(i,1);
					i--;
				} else if (oWrappedBatchRequestHandle){
					oPart.request._handle = oWrappedBatchRequestHandle;
					oWrappedBatchRequestHandle.iRelevantRequests++;
				}
			}
		}

		function wrapRequestHandle() {
			return {
				iRelevantRequests : 0,
				oRequestHandle: {},
				abort: function() {
					this.iRelevantRequests--;
					if (this.iRelevantRequests === 0 && this.oRequestHandle) {
						this.oRequestHandle.abort(true);
						if (fnSuccess) {
							fnSuccess({}, undefined);
						}
					}
				}
			};
		}

		if (this.bUseBatch) {
			//auto refresh for batch / for single requests we refresh after the request was successful
			each(mRequests, function(sRequestGroupId, oRequestGroup) {
				if (sRequestGroupId === sGroupId || !sGroupId) {
					var mChangedEntities = {},
						mEntityTypes = {};
					that._collectChangedEntities(oRequestGroup, mChangedEntities, mEntityTypes);

					if (Object.keys(mChangedEntities).length || Object.keys(mEntityTypes).length) {
						that.bIncludeInCurrentBatch = true;
						that._refresh(false, sRequestGroupId, mChangedEntities, mEntityTypes);
						that.bIncludeInCurrentBatch = false;
					}
				}
			});
			each(mRequests, function(sRequestGroupId, oRequestGroup) {
				if (sRequestGroupId === sGroupId || !sGroupId) {
					var aReadRequests = [], aBatchGroup = [], oChangeSet, aChanges;
					var oWrappedBatchRequestHandle = wrapRequestHandle();
					if (oRequestGroup.changes) {
						each(oRequestGroup.changes, function(sChangeSetId, aChangeSet) {
							var oCurrentRequest, i, oRequestInfo;

							oChangeSet = {__changeRequests:[]};
							aChanges = [];
							for (i = 0; i < aChangeSet.length; i++) {
								oCurrentRequest = aChangeSet[i].request;
								_Helper.extend(oCurrentRequest.headers, mChangeHeaders);
								//increase laundering
								sPath = '/' + that.getKey(oCurrentRequest.data);
								that.increaseLaundering(sPath, oCurrentRequest.data);
								checkAbort(aChangeSet[i], oWrappedBatchRequestHandle);
								if (aChangeSet[i].parts.length > 0) {
									that.removeInternalMetadata(oCurrentRequest.data);
									oChangeSet.__changeRequests.push(oCurrentRequest);

									if (oCurrentRequest.expandRequest) {
										// for created entities there is always exactly one part
										oRequestInfo = aChangeSet[i].parts[0];
										that._pushToRequestQueue(mRequests, sRequestGroupId,
											undefined, oCurrentRequest.expandRequest,
											oRequestInfo.fnSuccess, oRequestInfo.fnError,
											oRequestInfo.requestHandle, false);
									}
									aChanges.push(aChangeSet[i]);
								}
							}
							if (oChangeSet.__changeRequests && oChangeSet.__changeRequests.length > 0) {
								aReadRequests.push(oChangeSet);
								aBatchGroup.push(aChanges);
							}
						});
					}
					if (oRequestGroup.requests) {
						var aRequests = oRequestGroup.requests;

						for (var i = 0; i < aRequests.length; i++) {
							checkAbort(aRequests[i], oWrappedBatchRequestHandle);
							if (aRequests[i].parts.length > 0) {
								aReadRequests.push(aRequests[i].request);
								aBatchGroup.push(aRequests[i]);
							}
						}
					}
					if (aReadRequests.length > 0) {
						var oBatchRequest = that._createBatchRequest(aReadRequests);
						oWrappedBatchRequestHandle.oRequestHandle = that._submitBatchRequest(oBatchRequest, aBatchGroup, fnSuccess, fnError);
						aRequestHandles.push(oWrappedBatchRequestHandle.oRequestHandle);
					}
					delete mRequests[sRequestGroupId];
				}
			});
		} else  {
			each(mRequests, function(sRequestGroupId, oRequestGroup) {
				if (sRequestGroupId === sGroupId || !sGroupId) {
					if (oRequestGroup.changes) {
						each(oRequestGroup.changes, function(sChangeSetId, aChangeSet){
							for (var i = 0; i < aChangeSet.length; i++) {
								var oWrappedSingleRequestHandle = wrapRequestHandle();
								//increase laundering
								sPath = '/' + that.getKey(aChangeSet[i].request.data);
								that.increaseLaundering(sPath, aChangeSet[i].request.data);
								checkAbort(aChangeSet[i], oWrappedSingleRequestHandle);
								if (aChangeSet[i].parts.length > 0) {
									that.removeInternalMetadata(aChangeSet[i].request.data);
									oWrappedSingleRequestHandle.oRequestHandle = that._submitSingleRequest(aChangeSet[i]);
									aRequestHandles.push(oWrappedSingleRequestHandle.oRequestHandle);
								}
							}
						});
					}
					if (oRequestGroup.requests) {
						var aRequests = oRequestGroup.requests;
						for (var i = 0; i < aRequests.length; i++) {
							var oWrappedSingleRequestHandle = wrapRequestHandle();
							checkAbort(aRequests[i], oWrappedSingleRequestHandle);
							if (aRequests[i].parts.length > 0) {
								oWrappedSingleRequestHandle.oRequestHandle =
									that._submitSingleRequest(aRequests[i]);
								aRequestHandles.push(oWrappedSingleRequestHandle.oRequestHandle);
							}
						}
					}
					delete mRequests[sRequestGroupId];
				}
			});
		}
		this.checkDataState(this.mLaunderingState);
		return aRequestHandles.length == 1 ? aRequestHandles[0] : aRequestHandles;
	};

	/**
	 * Process request queue asynchronously.
	 *
	 * @param {map} mRequestQueue The request queue to process
	 * @private
	 */
	ODataModel.prototype._processRequestQueueAsync = function(mRequestQueue) {
		var that = this;
		if (!this.pCallAsync) {
			this.pCallAsync = this.oMetadata.loaded().then(function() {
				return Promise.resolve().then(function() {
					that._processRequestQueue(mRequestQueue);
					that.pCallAsync = undefined;
				});
			});
		}
	};

	/**
	 * Process request response for successful requests.
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {function} fnSuccess The success callback function
	 * @param {map} mGetEntities Map of read entities
	 * @param {map} mChangeEntities Map of changed entities
	 * @param {map} mEntityTypes Map of changed entityTypes
	 * @param {boolean} bBatch Process success for single/batch request
	 * @param {array} aRequests Array of request; represents the order of requests in the batch
	 * @param {Object<string,object>} [mContentID2KeyAndDeepPath]
	 *   Maps a content ID to an object containing the properties <code>key</code> representing the
	 *   entity key in the OData cache, and <code>deepPath</code> representing the deep path for
	 *   that entity
	 * @returns {boolean} bSuccess Processed successfully
	 * @private
	 */
	ODataModel.prototype._processSuccess = function(oRequest, oResponse, fnSuccess, mGetEntities,
			mChangeEntities, mEntityTypes, bBatch, aRequests, mContentID2KeyAndDeepPath) {
		var sCanonicalPath, bContent, sDeepPath, oEntity, oEntityType, sHeadersLocation,
			oImportData, bIsFunction, sNormalizedPath, aParts, sPath, iPos, sUri,
			mLocalChangeEntities = {},
			mLocalGetEntities = {},
			oResultData = oResponse.data,
			that = this;

		if (!bBatch) {
			bContent = !["204", "205"].includes(String(oResponse.statusCode));

			sUri = oRequest.requestUri;
			sPath = sUri.replace(this.sServiceUrl,"");
			//in batch requests all paths are relative
			if (!sPath.startsWith('/')) {
				sPath = '/' + sPath;
			}

			// In order to retrieve the EntityType, the path should be normalized (URL parameters should be removed)
			sNormalizedPath = this._normalizePath(sPath);
			oEntityType = this.oMetadata._getEntityTypeByPath(sNormalizedPath);

			// FunctionImports shouldn't be resolved canonical
			bIsFunction = oEntityType && oEntityType.isFunction;
			sPath = this._normalizePath(sPath, undefined, !bIsFunction);

			// decrease laundering
			this.decreaseLaundering(sPath, oRequest.data);
			this._decreaseDeferredRequestCount(oRequest);

			// update deep path of function import
			if (oRequest.functionMetadata) {
				if (oResponse.headers && oResponse.headers.location) {
					sHeadersLocation = oResponse.headers.location;
					iPos = sHeadersLocation.lastIndexOf(this.sServiceUrl);
					if (iPos > -1) {
						sCanonicalPath = ODataUtils._normalizeKey(
							sHeadersLocation.slice(iPos + this.sServiceUrl.length));
						if (oRequest.functionTarget === sCanonicalPath) {
							sDeepPath = this.getDeepPathForCanonicalPath(sCanonicalPath);
							if (sDeepPath) {
								oRequest.deepPath = sDeepPath;
							}
						}
						oRequest.functionTarget = sCanonicalPath;
					}
				}
				if (oRequest.adjustDeepPath) {
					oRequest.deepPath = oRequest.adjustDeepPath({
						deepPath : sDeepPath || oRequest.functionTarget,
						response : merge({}, oResponse)
					});
				} else if (!sDeepPath) {
					if (!sHeadersLocation) {
						sDeepPath = this.getDeepPathForCanonicalPath(oRequest.functionTarget);
					}
					oRequest.deepPath = sDeepPath || oRequest.functionTarget;
				}
				if (mContentID2KeyAndDeepPath && oRequest.contentID) {
					mContentID2KeyAndDeepPath[oRequest.contentID].deepPath = oRequest.deepPath;
				}
			}

			// no data available
			if (bContent && oResultData === undefined && oResponse) {
				// Parse error messages from the back-end
				this._parseResponse(oResponse, oRequest);

				Log.fatal(this + " - No data was retrieved by service: '" + oResponse.requestUri + "'");
				that.fireRequestCompleted({url : oResponse.requestUri, type : "GET", async : oResponse.async,
					info: "Accept headers:" + this.oHeaders["Accept"], infoObject : {acceptHeaders: this.oHeaders["Accept"]},  success: false});
				return false;
			}

			// broken implementations need this
			if (oResultData && !oResultData.__metadata && oResultData.results && !Array.isArray(oResultData.results)) {
				oResultData = oResultData.results;
			}

			// adding the result data to the data object
			if (!oResponse._imported && oResultData && (Array.isArray(oResultData) || typeof oResultData == 'object')) {
				//need a deep data copy for import
				oImportData = merge({}, oResultData);
				if (oRequest.key || oRequest.created) {
					that._importData(oImportData, mLocalGetEntities, oResponse, oRequest,
						/*sPath*/undefined, /*sDeepPath*/undefined, /*sKey*/undefined, bIsFunction,
						/*sPathFromCanonicalParent*/undefined, oRequest.sideEffects);
				} else {
					that._importData(oImportData, mLocalGetEntities, oResponse, oRequest, sPath,
						oRequest.deepPath, /*sKey*/undefined, bIsFunction,
						/*sPathFromCanonicalParent*/undefined, oRequest.sideEffects);
				}
				oResponse._imported = true;
			}

			oEntity = this._getEntity(oRequest.key);
			if (oEntity && oEntity.__metadata.created
					&& oEntity.__metadata.created.functionImport) {
				var aResults = [];
				var oResult = oEntity["$result"];
				if (oResult && oResult.__list) {
					each(mLocalGetEntities, function(sKey) {
						aResults.push(sKey);
					});
					oResult.__list = aResults;
				} else if (oResult && oResult.__ref){
					//there should be only 1 entity in mLocalGetEntities
					each(mLocalGetEntities, function(sKey) {
						oResult.__ref = sKey;
					});
				}
			}

			//get change entities for update/remove
			if (!bContent) {
				aParts = sPath.split("/");
				if (aParts[1]) {
					mLocalChangeEntities[aParts[1]] = oRequest;
					//cleanup of this.mChangedEntities; use only the actual response key
					this._updateChangedEntity(aParts[1], oRequest.data);
				}
				//for delete requests delete data in model (exclude $links)
				if (oRequest.method === "DELETE" && aParts[2] !== "$links") {
					this._removeEntity(aParts[1]);
				}
			}
			// remove temporary entity for entity creation and function import
			if (bContent && oRequest.method === "POST" || oRequest.functionMetadata) {
				if (oEntityType) {
					mEntityTypes[oEntityType.entityType] = true;
				}
				if (oRequest.key) {
					if (oRequest.created) {
						this._removeEntity(oRequest.key);
					} else {
						// do not call _removeEntity after successful function import call as
						// _removeEntity would delete also the cached object which would cause that
						// the path to $result cannot be resolved any more; delete only the entry in
						// changed entities to avoid pending changes
						delete this.mChangedEntities[oRequest.key];
					}
				}
			}

			// Parse messages from the back-end only if not yet reported
			if (!oResponse.$reported) {
				this._parseResponse(oResponse, oRequest, mLocalGetEntities, mLocalChangeEntities);
				oResponse.$reported = true;
			}

			// Add the Get and Change entities from this request to the main ones (which differ in case of batch requests)
			extend(mGetEntities, mLocalGetEntities);
			extend(mChangeEntities, mLocalChangeEntities);

			this._updateETag(oRequest, oResponse);
		}

		if (fnSuccess) {
			fnSuccess(oResultData, oResponse);
		}

		var oEventInfo = this._createEventInfo(oRequest, oResponse, aRequests);
		if (bBatch) {
			this.fireBatchRequestCompleted(oEventInfo);
		} else {
			this.fireRequestCompleted(oEventInfo);
		}

		return true;
	};

	/**
	 * Creates a new <code>mChangedEntities</code> entry for the <code>sKey</code> for the just
	 * created entity and takes all changes which have been made after this create has been
	 * submitted.
	 *
	 * @param {object} oRequest
	 *   The request object for a created entity
	 * @param {string} sKey
	 *   The key of the created entity
	 *
	 * @private
	 */
	ODataModel.prototype._cleanupAfterCreate = function (oRequest, sKey) {
		var oChangedEntity, aNavProps, sProperty,
			oContext = this.getContext("/" + oRequest.key),
			sDeepPath = oRequest.deepPath,
			oEntity = this._getEntity(sKey);

		if (oContext.isTransient() && sDeepPath.endsWith(")")) {
			oRequest.deepPath = sDeepPath.slice(0, sDeepPath.lastIndexOf("("))
				+ sKey.slice(sKey.indexOf("("));
		}
		this._updateContext(oContext, '/' + sKey, oRequest.deepPath);
		oContext.setUpdated(true);
		this.callAfterUpdate(function() {
			oContext.setUpdated(false);
		});
		delete oEntity.__metadata.created;
		// before deleting the old entity copy and update the changes
		oChangedEntity = this.mChangedEntities[oRequest.key];
		if (oChangedEntity) {
			aNavProps = this.oMetadata._getNavigationPropertyNames(
				this.oMetadata._getEntityTypeByPath(sKey));
			oChangedEntity = _Helper.merge({}, oChangedEntity);
			oChangedEntity.__metadata = _Helper.merge({}, oEntity.__metadata);
			oChangedEntity.__metadata.deepPath = oRequest.deepPath;
			for (sProperty in oRequest.data) {
				if (_Helper.deepEqual(oRequest.data[sProperty], oChangedEntity[sProperty])
						|| aNavProps.includes(sProperty)) {
					delete oChangedEntity[sProperty];
				}
			}
			this.mChangedEntities[sKey] = oChangedEntity;
			// cleanup also further POST request for the just created entity
			this.abortInternalRequest(this._resolveGroup(oRequest.key).groupId,
				{requestKey: oRequest.key});
		} // else case may happen if ODataModel#create is called which does not use the cache
	};

	/**
	 * Process request response for failed requests.
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {function} fnError The error callback function
	 * @param {boolean} bBatch Process success for single/batch request
	 * @param {array} aRequests Array of requests; represents the order of requests in the batch
	 * @private
	 */
	ODataModel.prototype._processError = function(oRequest, oResponse, fnError, bBatch, aRequests) {
		var oError, sPath;

		if (oRequest.functionMetadata) {
			oRequest.deepPath = oRequest.functionTarget;
		}

		oError = this._handleError(oResponse, oRequest);

		if (!bBatch) {
			// decrease laundering
			sPath = '/' + this.getKey(oRequest.data);
			this.decreaseLaundering(sPath, oRequest.data);
			this._decreaseDeferredRequestCount(oRequest);
		}

		if (fnError) {
			fnError(oError);
		}

		var oEventInfo = this._createEventInfo(oRequest, oError, aRequests);
		if (bBatch) {
			this.fireBatchRequestCompleted(oEventInfo);
			this.fireBatchRequestFailed(oEventInfo);
		} else {
			this.fireRequestCompleted(oEventInfo);
			this.fireRequestFailed(oEventInfo);
		}

	};

	/**
	 * Process request response for aborted requests.
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {boolean} bBatch Process success for single/batch request
	 * @private
	 */
	ODataModel.prototype._processAborted = function (oRequest, oResponse, bBatch) {
		var oEventInfo, sPath;

		if (!bBatch) {
			// decrease laundering
			sPath = '/' + this.getKey(oRequest.data);
			this.decreaseLaundering(sPath, oRequest.data);
			this._decreaseDeferredRequestCount(oRequest);
		}
		// If no response is contained, request was never sent and completes event can be omitted
		if (oResponse) {
			oEventInfo = this._createEventInfo(oRequest, ODataModel._createAbortedError());
			oEventInfo.success = false;
			if (bBatch) {
				this.fireBatchRequestCompleted(oEventInfo);
			} else {
				this.fireRequestCompleted(oEventInfo);
			}
		}
	};

	/**
	 * Process handlers registered for execution after update.
	 *
	 * @private
	 */
	ODataModel.prototype._processAfterUpdate = function() {
		var aCallAfterUpdate = this.aCallAfterUpdate;
		this.aCallAfterUpdate = [];
		for (var i = 0; i < aCallAfterUpdate.length; i++) {
			aCallAfterUpdate[i]();
		}
	};

	/**
	 * Process a two-way binding change.
	 *
	 * @param {string} sKey
	 *   Key of the entity to change
	 * @param {object} oData
	 *   The entry data
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} [sUpdateMethod]
	 *   Sets <code>MERGE/PUT</code> method, defaults to <code>MERGE</code> if not provided
	 * @returns {object}
	 *   The request object
	 *
	 * @private
	 */
	ODataModel.prototype._processChange = function(sKey, oData, sGroupId, sUpdateMethod) {
		var sContentID, oContext, oCreated, sDeepPath, oEntityType, sETag, oExpandRequest,
			bFunctionImport, mHeaders, sMethod, oPayload, oRequest, oUnModifiedEntry,
			sUrl, aUrlParams,
			sEntityPath = "/" + sKey,
			that = this;

		// delete expand properties = navigation properties
		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);

		if (!sUpdateMethod) {
			sUpdateMethod = this.sDefaultUpdateMethod;
		}

		// use #_getObject to receive the complete shadow cache entity (existing entity + current
		// changes); merge oData into the latest shadow cache entity to ensure that the given
		// changes are included (shadow cache could have been changed in the meanwhile)
		oPayload = merge({}, this._getObject(sEntityPath), oData);
		sDeepPath = oPayload.__metadata.deepPath;
		oCreated = oPayload.__metadata.created;

		if (oCreated) {
			sMethod = oCreated.method ? oCreated.method : "POST";
			sKey = oCreated.key;
			oExpandRequest = oCreated.expandRequest;
			sContentID = oCreated.contentID;
			bFunctionImport = oCreated.functionImport;
			if (bFunctionImport) {
				// update request url params with changed data from payload
				oCreated.urlParameters = this._createFunctionImportParameters(oCreated.key, sMethod, oPayload);
				// clear data
				oPayload = undefined;
			} else {
				//delete the uri flag when a new entity was created, since the uri for the create request is generated and does not point to a valid resource
				delete oPayload.__metadata['uri'];
			}
		} else if (sUpdateMethod === "MERGE") {
			sMethod = "MERGE";
			// get original unmodified entry for diff
			oUnModifiedEntry = this._getEntity(sKey);
		} else {
			sMethod = "PUT";
		}

		// remove metadata, navigation properties to reduce payload
		if (oPayload && oPayload.__metadata) {
			for (var n in oPayload.__metadata) {
				if (n !== 'type' && n !== 'uri' && n !== 'etag' && n !== 'content_type' && n !== 'media_src') {
					delete oPayload.__metadata[n];
				}
			}
		}

		// delete nav props
		if (oPayload && oEntityType) {
			var aNavProps = this.oMetadata._getNavigationPropertyNames(oEntityType);
			aNavProps.forEach(function(sNavPropName) {
				delete oPayload[sNavPropName];
			});
		}

		if (sMethod === "MERGE" && oEntityType && oUnModifiedEntry) {
			each(oPayload, function(sPropName, oPropValue) {
				if (sPropName !== '__metadata') {
					// remove unmodified properties and keep only modified properties for delta MERGE
					if (deepEqual(oUnModifiedEntry[sPropName], oPropValue) && !that.isLaundering('/' + sKey + '/' + sPropName)) {
						delete oPayload[sPropName];
					}
				}
			});
			// check if we have unit properties which were changed and if yes sent the associated unit prop also.
			var sPath = "/" + sKey, sUnitNameProp;
			each(oPayload, function(sPropName, oPropValue) {
				if (sPropName !== '__metadata') {
					sUnitNameProp = that.getProperty(sPath + "/" + sPropName + "/#@sap:unit");
					if (sUnitNameProp) {
						// set unit property only if it wasn't modified. Otherwise it should already exist on the payload.
						if (oPayload[sUnitNameProp] === undefined) {
							oPayload[sUnitNameProp] = oUnModifiedEntry[sUnitNameProp];
						}
					}
				}
			});
			// ensure to take the latest ETag
			if (oUnModifiedEntry.__metadata.etag) {
				oPayload.__metadata.etag = oUnModifiedEntry.__metadata.etag;
			}
		}

		// remove any yet existing references which should already have been deleted
		oPayload = this._removeReferences(oPayload);

		//get additional request info for created entries
		aUrlParams = oCreated && oCreated.urlParameters ? ODataUtils._createUrlParamsArray(oCreated.urlParameters) : undefined;
		mHeaders = oCreated ? this._getHeaders(oCreated.headers) : this._getHeaders();
		if (!bFunctionImport && this._isTransitionMessagesOnly(sGroupId)) {
			mHeaders["sap-messages"] = "transientOnly";
		}
		sETag = oCreated && oCreated.eTag ? oCreated.eTag : this.getETag(oPayload);

		sUrl = this._createRequestUrl('/' + sKey, null, aUrlParams, this.bUseBatch);

		oContext = this.getContext(sEntityPath);
		oRequest = this._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oPayload, sETag,
			undefined, true, oContext.hasSubContexts());

		if (oCreated) {
			// for createEntry requests we need to flag request again
			if (oExpandRequest) {
				oRequest.expandRequest = oExpandRequest;
				oRequest.contentID = sContentID;
			}
			// for callFunction requests we need to store the updated functionTarget
			if (bFunctionImport) {
				oRequest.functionTarget = this.oMetadata._getCanonicalPathOfFunctionImport(
					oCreated.functionMetadata, oCreated.urlParameters);
				oRequest.functionMetadata = oCreated.functionMetadata;
			} else {
				oRequest.created = true;
				this._addSubEntitiesToPayload(oContext, oPayload);
			}
		}

		if (this.bUseBatch) {
			oRequest.requestUri = oRequest.requestUri.replace(this.sServiceUrl + '/','');
		}

		return oRequest;
	};

	/**
	 * Resolves batch group settings based on a given entity key or a given resolved path to an
	 * entity.
	 *
	 * @param {string} sKeyOrPath
	 *   The entity key or the resolved path to an entity
	 * @returns {object}
	 *   Batch group info containing <code>groupId</code> and <code>changeSetId</code>
	 *
	 * @private
	 */
	ODataModel.prototype._resolveGroup = function(sKeyOrPath) {
		var oChangeGroup, sChangeSetId, mCreated, oData, oEntityType, sGroupId,
			sPath = sKeyOrPath.startsWith("/") ? sKeyOrPath : ("/" + sKeyOrPath);

		oData = this._getObject(sPath);
		mCreated = oData && oData.__metadata && oData.__metadata.created;
		//for created entries the group information is retrieved from the params
		if (mCreated) {
			return {groupId: mCreated.groupId, changeSetId: mCreated.changeSetId};
		}

		//resolve groupId/changeSetId
		oEntityType = this.oMetadata._getEntityTypeByPath(sPath);
		if (this.mChangeGroups[oEntityType.name]) {
			oChangeGroup = this.mChangeGroups[oEntityType.name];
			sGroupId = oChangeGroup.groupId;
			sChangeSetId = oChangeGroup.single ? uid() : oChangeGroup.changeSetId;
		} else if (this.mChangeGroups['*']) {
			oChangeGroup = this.mChangeGroups['*'];
			sGroupId = oChangeGroup.groupId;
			sChangeSetId = oChangeGroup.single ? uid() : oChangeGroup.changeSetId;
		}

		return {groupId: sGroupId, changeSetId: sChangeSetId};
	};

	/**
	 * Handle ETag.
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @private
	 */
	ODataModel.prototype._updateETag = function(oRequest, oResponse) {
		var sUrl, oEntry, sETag;

		// refresh ETag from response directly. We can not wait for the refresh.
		sUrl = oRequest.requestUri.replace(this.sServiceUrl + '/', '');
		if (!sUrl.startsWith("/")) {
			sUrl = "/" + sUrl;
		}
		oEntry = this._getObject(sUrl.split("?")[0], undefined, true);
		sETag = this._getHeader("etag", oResponse.headers);
		if (oEntry && oEntry.__metadata && sETag){
			oEntry.__metadata.etag = sETag;
		}
	};

	/**
	 * Error handling for requests.
	 *
	 * @param {object} oError The error object
	 * @param {object} [oRequest]
	 *   The request object
	 *   Note: This parameter is mandatory iff the given error object represents a response to a failed request.
	 * @param {string} [sReportingClassName] The name of the reporting class
	 * @returns {map} A map of error information
	 * @private
	 */
	ODataModel.prototype._handleError = function(oError, oRequest, sReportingClassName) {
		var sToken,
			mParameters = {message : oError.message};

		if (oError.response) {
			if (!oError.$reported) {
				// Parse messages from the back-end
				this._parseResponse(oError.response, oRequest);

				if (this.bTokenHandling) {
					// if XSRFToken is not valid we get 403 with the x-csrf-token header : Required.
					// a new token will be fetched in the refresh afterwards.
					sToken = this._getHeader("x-csrf-token", oError.response.headers);
					if (oError.response.statusCode == '403' && sToken
							&& sToken.toLowerCase() === "required") {
						this.resetSecurityToken();
					}
				}
			}
			mParameters.statusCode = oError.response.statusCode;
			mParameters.statusText = oError.response.statusText;
			mParameters.headers = oError.response.headers;
			mParameters.responseText = oError.response.body;
		} else if (!oError.$reported) {
			Log.error("The following problem occurred: " + oError.message, oError.stack,
				sReportingClassName || sClassName);
		}
		oError.$reported = true;

		return mParameters;
	};

	/**
	 * Returns a function to be used as a SyncPromise catch handler in order to report not yet reported errors.
	 *
	 * @param {string} sReportingClassName
	 *   The name of the reporting class
	 * @returns {function(Error)}
	 *   A catch handler function expecting an <code>Error</code> instance
	 *
	 * @private
	 */
	ODataModel.prototype.getReporter = function (sReportingClassName) {
		var that = this;

		return function (oError) {
			that._handleError(oError, undefined, sReportingClassName);
		};
	};

	ODataModel.prototype._getODataHandler = function(sUrl) {
		if (sUrl.indexOf("$batch") > -1) {
			return OData.batchHandler;
		} else if (sUrl.indexOf("$count") > -1) {
			return undefined;
		} else if (this.bJSON) {
			return OData.jsonHandler;
		} else {
			return OData.atomHandler;
		}
	};

	/**
	 * Returns the ETag for a given binding path/context or data object.
	 *
	 * @param {string} [sPath] The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @param {object} [oEntity] The entity data
	 *
	 * @returns {string|null} The found ETag (or <code>null</code> if none could be found)
	 * @public
	 */
	ODataModel.prototype.getETag = function(sPath, oContext, oEntity) {
		if (typeof sPath == "object") {
			oEntity = sPath;
			sPath = "";
		}
		return this._getETag(sPath, oContext, oEntity);
	};

	/**
	 * Returns the ETag for a given URL, binding path/context or data object.
	 *
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @param {object} [oData] The entry data
	 *
	 * @returns {string} The found ETag (or <code>null</code> if none could be found)
	 * @private
	 */
	ODataModel.prototype._getETag = function(sPath, oContext, oData) {
		if (!oData || !oData.__metadata) {
			oData = this._getObject(sPath, oContext);
		}
		if (oData && oData.__metadata) {
			return oData.__metadata.etag;
		}
		return null;
	};

	/**
	 * Force the update on the server of an entity by setting its ETag to '*'.
	 *
	 * ETag handling must be active so the force update will work.
	 * @param {string} sKey The key to an Entity e.g.: Customer(4711)
	 * @public
	 */
	ODataModel.prototype.forceEntityUpdate = function(sKey) {
		var oData = this.mChangedEntities[sKey];
		if (oData && oData.__metadata) {
			oData.__metadata.etag = '*';
		} else {
			Log.error(this + " - Entity with key " + sKey + " does not exist or has no change");
		}
	};

	/**
	 * Creation of a request object
	 *
	 * @param {string} sUrl The request URL
	 * @param {string} sDeepPath The deep path
	 * @param {string} sMethod The request method
	 * @param {map} [mHeaders] A map of headers
	 * @param {object} [oData] The data for this request
	 * @param {string} [sETag] The ETag
	 * @param {boolean} [bAsync] Async request
	 * @param {boolean} [bUpdateAggregatedMessages]
	 *   Whether messages for child entities belonging to the same business object as the requested
	 *   or changed resources are updated. It is considered only if
	 *   {@link sap.ui.model.odata.MessageScope.BusinessObject} is set and if the OData service
	 *   supports message scope.
	 * @param {boolean} [bSideEffects]
	 *   Whether the request is to read side effects
	 * @return {object} Request object
	 * @private
	 */
	ODataModel.prototype._createRequest = function(sUrl, sDeepPath, sMethod, mHeaders, oData, sETag,
			bAsync, bUpdateAggregatedMessages, bSideEffects) {
		var oRequest;

		bAsync = bAsync !== false;

		if (sETag && sMethod !== "GET") {
			mHeaders["If-Match"] = sETag;
		}

		/* make sure to set content type header for POST/PUT requests when using JSON
		 * format to prevent datajs to add "odata=verbose" to the content-type header
		 * may be removed as later gateway versions support this */
		if (!mHeaders["Content-Type"] && sMethod !== "DELETE" && sMethod !== "GET") {
			if (this.bJSON) {
				mHeaders["Content-Type"] = "application/json";
			} else {
				mHeaders["Content-Type"] = "application/atom+xml";
			}
		}

		// Set Accept header for $count requests
		if (sUrl.indexOf("$count") > -1) {
			mHeaders["Accept"] = "text/plain, */*;q=0.5";
		}

		if (sMethod === "MERGE" && !this.bUseBatch) {
			mHeaders["x-http-method"] = "MERGE";
			sMethod = "POST";
		}

		if (this.sMessageScope === MessageScope.BusinessObject
				&& mHeaders["sap-messages"] !== "transientOnly") {
			if (this.bIsMessageScopeSupported) {
				mHeaders["sap-message-scope"] = this.sMessageScope;
			} else {
				Log.error("Message scope 'sap.ui.model.odata.MessageScope.BusinessObject' is not"
					+ " supported by the service: " + this.sServiceUrl, undefined, sClassName);
			}
		}

		bUpdateAggregatedMessages = bUpdateAggregatedMessages
			&& this.sMessageScope === MessageScope.BusinessObject
			&& this.bIsMessageScopeSupported;

		if (this.bUseBatch && sMethod !== "GET" && sMethod !== "HEAD" && !mHeaders["Content-ID"]) {
			mHeaders["Content-ID"] = uid();
		}

		oRequest = {
			async : bAsync,
			deepPath : sDeepPath,
			headers : mHeaders,
			method : sMethod,
			password : this.sPassword,
			requestUri : sUrl,
			updateAggregatedMessages : bUpdateAggregatedMessages,
			user : this.sUser
		};
		if (bSideEffects) {
			oRequest.sideEffects = true;
		}
		if (oData) {
			oRequest.data = oData;
		}

		if (this.bWithCredentials) {
			oRequest.withCredentials = this.bWithCredentials;
		}

		oRequest.requestID = this._createRequestID();

		return oRequest;
	};

	/**
	 * Executes the passed process request method when the metadata is available, takes care of
	 * properly wrapping the response handler to allow request abortion, and processes the request
	 * queue asynchronously.
	 *
	 * @param {function} fnProcessRequest
	 *   Function to prepare the request and add it to the request queue; it is called with the
	 *   request handle object returned by {@link #_processRequest}
	 * @param {function} [fnError]
	 *   Error callback which is called when the request is aborted
	 * @param {boolean} [bDeferred]
	 *   Whether the request belongs to a deferred group
	 * @returns {object}
	 *   A request handle object which has an <code>abort</code> function to abort the current
	 *   request
	 * @private
	 */
	ODataModel.prototype._processRequest = function (fnProcessRequest, fnError, bDeferred) {
		var oRequest, oRequestHandle,
			bAborted = false,
			that = this;

		if (this.bWarmup) {
			return {abort : function () {}};
		}

		if (bDeferred) {
			this.iPendingDeferredRequests += 1;
		}
		oRequestHandle = {
				abort : function () {
					if (bDeferred && !bAborted){
						// Since in some scenarios no request object was created yet, the counter is
						// decreased manually
						that.iPendingDeferredRequests -= 1;
					}
					// Call error handler synchronously
					if (!bAborted && fnError) {
						fnError(ODataModel._createAbortedError());
					}
					if (oRequest) {
						oRequest._aborted = true;
						if (oRequest._handle) {
							oRequest._handle.abort();
						}
					}
					bAborted = true;
				}
		};
		this.oMetadata.loaded().then(function () {
			oRequest = fnProcessRequest(oRequestHandle);
			if (oRequest) {
				oRequest.deferred = !!bDeferred;
			}
			that._processRequestQueueAsync(that.mRequests);
			if (bAborted) {
				oRequestHandle.abort();
			}
		});

		return oRequestHandle;
	};

	/**
	 * Trigger a <code>PUT/MERGE</code> request to the OData service that was specified in the model constructor.
	 *
	 * The update method used is defined by the global <code>defaultUpdateMethod</code> parameter which is
	 * <code>sap.ui.model.odata.UpdateMethod.Merge</code> by default. Please note that deep updates are not
	 * supported and may not work. These should be done separately and directly on the corresponding entry.
	 *
	 * @param {string} sPath A string containing the path to the data that should be updated.
	 *   The path is concatenated to the sServiceUrl which was specified
	 *   in the model constructor.
	 * @param {object} oData Data of the entry that should be updated.
	 * @param {object} [mParameters] Optional, can contain the following attributes:
	 * @param {object} [mParameters.context] If specified the sPath has to be is relative to the path given with the context.
	 * @param {function} [mParameters.success] A callback function which is called when the data has been successfully updated.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 *   The handler can have the parameter <code>oError</code> which contains additional error information.
	 *   If the <code>PUT/MERGE</code> request has been aborted, the error has an <code>aborted</code> flag set to
	 *   <code>true</code>.
	 * @param {string} [mParameters.eTag] If specified, the <code>If-Match</code> header will be set to this ETag.
	 *   Caution: This feature in not officially supported as using asynchronous requests can lead
	 *   to data inconsistencies. If you decide to use this feature nevertheless, you have to make
	 *   sure that the request is completed before the data is processed any further.
	 * @param {Object<string,string>} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {Object<string,string>} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation.
	 *   See {@link #setRefreshAfterChange}. If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.update = function(sPath, oData, mParameters) {
		var fnSuccess, fnError, oRequest, sUrl, oContext, sETag,
			aUrlParams, sGroupId, sChangeSetId,
			mUrlParams, mHeaders, sMethod, mRequests, bRefreshAfterChange,
			bDeferred, that = this, sNormalizedPath, sDeepPath, bCanonical;

		if (mParameters) {
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
			bRefreshAfterChange = mParameters.refreshAfterChange;
			bCanonical = mParameters.canonicalRequest;
			// ensure merge parameter backwards compatibility
			if (mParameters.merge !== undefined) {
				sMethod =  mParameters.merge ? "MERGE" : "PUT";
			}
		}

		bCanonical = this._isCanonicalRequestNeeded(bCanonical);
		bDeferred = sGroupId in that.mDeferredGroups;

		bRefreshAfterChange = this._getRefreshAfterChange(bRefreshAfterChange, sGroupId);

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = sMethod ? sMethod : this.sDefaultUpdateMethod;
		sETag = sETag || this._getETag(sPath, oContext, oData);

		sNormalizedPath = this._normalizePath(sPath, oContext, bCanonical);
		sDeepPath = this.resolveDeep(sPath, oContext);

		return this._processRequest(function(requestHandle) {
			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oData, sETag);

			mRequests = that.mRequests;
			if (bDeferred) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError, requestHandle, bRefreshAfterChange);

			return oRequest;
		}, fnError, bDeferred);

	};

	/**
	 * Trigger a <code>POST</code> request to the OData service that was specified in the model
	 * constructor; see
	 * {@link topic:6c47b2b39db9404582994070ec3d57a2#loio4c4cd99af9b14e08bb72470cc7cabff4 Creating
	 * Entities documentation} for comprehensive information on the topic.
	 *
	 * <b>Note:</b> This function does not support a "deep create" scenario. Use
	 * {@link #createEntry} or {@link sap.ui.model.odata.v2.ODataListBinding#create} instead.
	 *
	 * @param {string} sPath A string containing the path to the collection where an entry
	 *   should be created. The path is concatenated to the service URL
	 *   which was specified in the model constructor.
	 * @param {object} oData Data of the entry that should be created.
	 * @param {object} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified , <code>sPath</code> has to be relative to the path given with the context.
	 * @param {function} [mParameters.success] A callback function which is called when the data has
	 *   been successfully retrieved. The handler can have the
	 *   following parameters: <code>oData</code> and <code>response</code>. The <code>oData</code> parameter contains the data of the newly created entry if it is provided by the backend.
	 *   The <code>response</code> parameter contains information about the response of the request.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 *   The handler can have the parameter <code>oError</code> which contains additional error information.
	 *   If the <code>POST</code> request has been aborted, the error has an <code>aborted</code> flag set to
	 *   <code>true</code>.
	 * @param {Object<string,string>} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {Object<string,string>} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation.
	 *   See {@link #setRefreshAfterChange}. If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.create = function(sPath, oData, mParameters) {
		var oRequest, sUrl, oEntityMetadata,
			oContext, fnSuccess, fnError, mUrlParams, mRequests,
			mHeaders, aUrlParams, sGroupId, sMethod, sChangeSetId, bRefreshAfterChange,
			bDeferred, that = this, sNormalizedPath, sDeepPath, bCanonical;

		// The object parameter syntax has been used.
		if (mParameters) {
			oContext   = mParameters.context;
			mUrlParams = mParameters.urlParameters;
			fnSuccess  = mParameters.success;
			fnError    = mParameters.error;
			sGroupId	= mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId	= mParameters.changeSetId;
			mHeaders	= mParameters.headers;
			bRefreshAfterChange = mParameters.refreshAfterChange;
			bCanonical = mParameters.canonicalRequest;
		}

		bCanonical = this._isCanonicalRequestNeeded(bCanonical);

		bRefreshAfterChange = this._getRefreshAfterChange(bRefreshAfterChange, sGroupId);

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = "POST";

		bDeferred = sGroupId in that.mDeferredGroups;

		sNormalizedPath = that._normalizePath(sPath, oContext, bCanonical);
		sDeepPath = this.resolveDeep(sPath, oContext);

		return this._processRequest(function(requestHandle) {
			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oData);
			oRequest.created = true;

			oEntityMetadata = that.oMetadata._getEntityTypeByPath(sNormalizedPath);
			oRequest.entityTypes = {};
			if (oEntityMetadata) {
				oRequest.entityTypes[oEntityMetadata.entityType] = true;
			}

			mRequests = that.mRequests;
			if (bDeferred) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError, requestHandle, bRefreshAfterChange);

			return oRequest;
		}, fnError, bDeferred);
	};

	/**
	 * Trigger a <code>DELETE</code> request to the OData service that was specified in the model
	 * constructor.
	 *
	 * @param {string} sPath
	 *   A string containing the path to the data that should be removed. The path is concatenated
	 *   to the service URL which was specified in the model constructor.
	 * @param {object} [mParameters]
	 *   Optional, can contain the following attributes:
	 * @param {object} [mParameters.context]
	 *   If specified, <code>sPath</code> has to be relative to the path given with the context.
	 * @param {function} [mParameters.success]
	 *   A callback function which is called when the data has been successfully retrieved. The
	 *   handler can have the following parameters: <code>oData</code> and <code>response</code>.
	 * @param {function} [mParameters.error]
	 *   A callback function which is called when the request failed. The handler can have the
	 *   parameter: <code>oError</code> which contains additional error information.
	 *   If the <code>DELETE</code> request has been aborted, the error has an <code>aborted</code> flag set to
	 *   <code>true</code>.
	 * @param {string} [mParameters.eTag]
	 *   If specified, the <code>If-Match</code> header will be set to this ETag.
	 * @param {Object<string,string>} [mParameters.urlParameters]
	 *   A map containing the parameters that will be passed as query strings
	 * @param {Object<string,string>} [mParameters.headers]
	 *   A map of headers for this request
	 * @param {string} [mParameters.batchGroupId]
	 *   Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId]
	 *   ID of a request group; requests belonging to the same group will be bundled in one batch
	 *   request
	 * @param {string} [mParameters.changeSetId]
	 *   ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange]
	 *   Since 1.46; defines whether to update all bindings after submitting this change operation,
	 *   see {@link #setRefreshAfterChange}. If given, this overrules the model-wide
	 *   <code>refreshAfterChange</code> flag for this operation only.
	 *
	 * @return {object} An object which has an <code>abort</code> function to abort the current
	 *   request.
	 *
	 * @public
	 */
	ODataModel.prototype.remove = function(sPath, mParameters) {
		var sChangeSetId, oContext, oContextToRemove, sDeepPath, bDeferred, fnError, sETag,
			sGroupId, mHeaders, sKey, sMethod, sNormalizedPath, bRefreshAfterChange, oRequest,
			mRequests, fnSuccess, sUrl, aUrlParams, mUrlParams,
			bCanonical = this.bCanonicalRequests,
			that = this;

		if (mParameters) {
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext = mParameters.context;
			fnSuccess = mParameters.success;
			fnError = mParameters.error;
			sETag = mParameters.eTag;
			mHeaders = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
			bRefreshAfterChange = mParameters.refreshAfterChange;
			bCanonical = mParameters.canonicalRequest;
		}

		bCanonical = this._isCanonicalRequestNeeded(bCanonical);

		bRefreshAfterChange = this._getRefreshAfterChange(bRefreshAfterChange, sGroupId);

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = "DELETE";
		sETag = sETag || this._getETag(sPath, oContext);

		bDeferred = sGroupId in that.mDeferredGroups;

		sNormalizedPath = this._normalizePath(sPath, oContext, bCanonical);
		sDeepPath = this.resolveDeep(sPath, oContext);

		function handleSuccess(oData, oResponse) {
			that._removeEntity(sKey);
			if (oContextToRemove && oContextToRemove.isTransient() === false) {
				that.oCreatedContextsCache.findAndRemoveContext(oContextToRemove);
			}
			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
		}

		return this._processRequest(function(requestHandle) {
			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams,
				that.bUseBatch);
			sKey = sUrl.substr(sUrl.lastIndexOf('/') + 1);
			//remove query params if any
			sKey = sKey.split("?")[0];
			oContextToRemove = that.mContexts["/" + sKey];

			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, undefined, sETag,
				undefined, true);

			mRequests = that.mRequests;
			if (bDeferred) {
				mRequests = that.mDeferredRequests;
			}

			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, handleSuccess,
				fnError, requestHandle, bRefreshAfterChange);

			return oRequest;
		}, fnError, bDeferred);
	};

	/**
	 * Triggers a request for the given function import.
	 *
	 * If the return type of the function import is either an entity type or a collection of an
	 * entity type, then this OData model's cache is updated with the values of the returned
	 * entities. Otherwise they are ignored, and the <code>response</code> can be processed in the
	 * <code>success</code> callback.
	 *
	 * The <code>contextCreated</code> property of the returned object is a function that returns a
	 * Promise which resolves with an <code>sap.ui.model.odata.v2.Context</code>. This context can
	 * be used to modify the function import parameter values and to bind the function call's result.
	 * Changes of a parameter value via that context after the function import has been processed
	 * lead to another function call with the modified parameters. Changed function import
	 * parameters are considered as pending changes, see {@link #hasPendingChanges} or
	 * {@link #getPendingChanges}, and can be reset via {@link #resetChanges}. If the function
	 * import returns an entity or a collection of entities, the <code>$result</code> property
	 * relative to that context can be used to bind the result to a control, see
	 * {@link topic:6c47b2b39db9404582994070ec3d57a2#loio6cb8d585ed594ee4b447b5b560f292a4 Binding of
	 * Function Import Parameters}.
	 *
	 * @param {string} sFunctionName
	 *   The name of the function import starting with a slash, for example <code>/Activate</code>.
	 * @param {object} [mParameters]
	 *   The parameter map containing any of the following properties:
	 * @param {function} [mParameters.adjustDeepPath]
	 *   Defines a callback function to adjust the deep path for the resulting entity of the
	 *   function import call; since 1.82. The deep path of an entity is the resolved path relative
	 *   to the parent contexts of the binding in the UI hierarchy. For example, for a
	 *   <code>ToBusinessPartner</code> relative context binding with a
	 *   <code>/SalesOrder('42')</code> parent context, the resulting deep path for the
	 *   <code>BusinessPartner</code> is <code>/SalesOrder('42')/ToBusinessPartner</code>. This deep
	 *   path is used to properly assign messages and show them correctly on the UI.
	 *
	 *   The callback function returns a <code>string</code> with the deep path for the entity
	 *   returned by the function import and gets the parameter map <code>mParameters</code>
	 *   containing the following properties:
	 *   <ul>
	 *     <li><code>{string} mParameters.deepPath</code>: The deep path of the resulting entity,
	 *       as far as the framework is able to determine from the metadata and the OData response
	 *       </li>
	 *     <li><code>{object} mParameters.response</code>: A copy of the OData response object</li>
	 *   </ul>
	 * @param {string} [mParameters.changeSetId]
	 *   ID of the <code>ChangeSet</code> that this request belongs to
	 * @param {function} [mParameters.error]
	 *   A callback function which is called when the request failed. The handler can have the
	 *   parameter: <code>oError</code> which contains additional error information.
	 *   If the request has been aborted, the error has an <code>aborted</code> flag set to <code>true</code>.
	 * @param {string} [mParameters.eTag]
	 *   If the function import changes an entity, the ETag for this entity can be passed with this
	 *   parameter
	 * @param {string} [mParameters.expand]
	 *   A comma-separated list of navigation properties to be expanded for the entity returned by
	 *   the function import; since 1.83.0.<br />
	 *   The navigation properties are requested with an additional GET request in the same
	 *   <code>$batch</code> request as the POST request for the function import. The given
	 *   <code>mParameters.headers</code> are not considered in the GET request.<br />
	 *   <strong>Note:</strong> The following prerequisites must be fulfilled:
	 *   <ul>
	 *     <li>batch mode must be enabled; see constructor parameter <code>useBatch</code>,</li>
	 *     <li>the HTTP method used for the function import is "POST",</li>
	 *     <li>the function import returns a single entity,</li>
	 *     <li>the back-end service must support the "Content-ID" header,</li>
	 *     <li>the back end must allow GET requests relative to this content ID outside the
	 *       changeset within the <code>$batch</code> request.</li>
	 *   </ul>
	 *   The success and error callback functions are called only once, even if there are two
	 *   requests in the <code>$batch</code> related to a single call of {@link #callFunction}.
	 *   <ul>
	 *     <li>If both requests succeed, the success callback is called with the merged data of the
	 *       POST and the GET request and with the response of the POST request.</li>
	 *     <li>If the POST request fails, the GET request also fails. In that case the error
	 *       callback is called with the error response of the POST request.</li>
	 *     <li>If the POST request succeeds but the GET request for the navigation properties fails,
	 *       the success callback is called with the data and the response of the POST request. The
	 *       response object of the success callback call and the response parameter of the
	 *       corresponding <code>requestFailed</code> and <code>requestCompleted</code> events have
	 *       an additional property <code>expandAfterFunctionCallFailed</code> set to
	 *       <code>true</code>.</li>
	 *   </ul>
	 * @param {string} [mParameters.groupId]
	 *   ID of a request group; requests belonging to the same group are bundled in one batch
	 *   request
	 * @param {Object<string,string>} [mParameters.headers]
	 *   A map of headers for this request
	 * @param {string} [mParameters.method='GET']
	 *   The HTTP method used for the function import call as specified in the metadata definition
	 *   of the function import
	 * @param {boolean} [mParameters.refreshAfterChange]
	 *   Defines whether to update all bindings after submitting this change operation; since 1.46.
	 *   See {@link #setRefreshAfterChange}. If given, this overrules the model-wide
	 *   <code>refreshAfterChange</code> flag for this operation only.
	 * @param {function} [mParameters.success]
	 *   A callback function which is called when the data has been successfully retrieved; the
	 *   handler can have the following parameters: <code>oData</code> and <code>response</code>.
	 * @param {Object<string,any>} [mParameters.urlParameters]
	 *   Maps the function import parameter name as specified in the function import's metadata to
	 *   its value; the value is formatted based on the parameter's type as specified in the metadata
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated - use <code>groupId</code> instead</b>
	 *
	 * @return {object}
	 *   An object which has a <code>contextCreated</code> function that returns a
	 *   <code>Promise</code>. This resolves with the created {@link sap.ui.model.Context}. In
	 *   addition it has an <code>abort</code> function to abort the current request. The Promise
	 *   returned by <code>contextCreated</code> is rejected if the function name cannot be found
	 *   in the metadata or if the parameter <code>expand</code> is used and the function does not
	 *   return a single entity.
	 *
	 * @throws {Error}
	 *   If the <code>expand</code> parameter is used and either the batch mode is disabled, or the
	 *   HTTP method is not "POST"
	 *
	 * @public
	 */
	ODataModel.prototype.callFunction = function (sFunctionName, mParameters) {
		var sChangeSetId, pContextCreated, fnError, sETag, sExpand, sGroupId, mHeaders, sMethod,
			bRefreshAfterChange, fnReject, oRequestHandle, fnResolve, fnSuccess, mUrlParams,
			that = this;

		if (!sFunctionName.startsWith("/")) {
			Log.fatal("callFunction: sFunctionName has to be absolute, but the given '"
				+ sFunctionName + "' is not absolute", this, sClassName);
			return undefined;
		}

		mParameters = mParameters || {};
		sChangeSetId = mParameters.changeSetId;
		fnError = mParameters.error;
		sETag = mParameters.eTag;
		sExpand = mParameters.expand;
		sGroupId = mParameters.groupId || mParameters.batchGroupId;
		mHeaders = mParameters.headers;
		sMethod = mParameters.method || "GET";
		bRefreshAfterChange = mParameters.refreshAfterChange;
		fnSuccess = mParameters.success;
		mUrlParams = Object.assign({}, mParameters.urlParameters);

		if (sExpand) {
			if (!this.bUseBatch) {
				throw new Error("Use 'expand' parameter only with 'useBatch' set to 'true'");
			}
			if (sMethod !== "POST") {
				throw new Error("Use 'expand' parameter only with HTTP method 'POST'");
			}
		}

		bRefreshAfterChange = this._getRefreshAfterChange(bRefreshAfterChange, sGroupId);
		pContextCreated = new Promise(function(resolve, reject) {
			fnResolve = resolve;
			fnReject = reject;
		});
		oRequestHandle = this._processRequest(function (requestHandle) {
			var oContext, oExpandRequest, oFunctionMetadata, oFunctionResponse, oFunctionResult,
				sKey, oRequest, mRequests, sUID, sUrl, aUrlParams,
				oData = {},
				fnErrorFromParameters = fnError,
				bFunctionFailed = false,
				fnSuccessFromParameters = fnSuccess;

			function resetFunctionCallData() { // cleanup to allow retriggering function calls
				oFunctionResult = undefined;
				oFunctionResponse = undefined;
				bFunctionFailed = false;
			}

			oFunctionMetadata = that.oMetadata._getFunctionImportMetadata(sFunctionName, sMethod);
			if (!oFunctionMetadata) {
				Log.error("Function '" + sFunctionName + "' not found in the metadata", that,
					sClassName);
				fnReject();
				return undefined;
			}
			if (oFunctionMetadata.entitySet || oFunctionMetadata.entitySetPath) {
				oData.$result = {__list : []};
				if (oFunctionMetadata.returnType
						&& !oFunctionMetadata.returnType.startsWith("Collection")) {
					oData.$result = {__ref : {}};
				}
			}
			if (sExpand && (!oData.$result || !oData.$result.__ref)) {
				fnReject(new Error("Use 'expand' parameter only for functions returning a single"
					+ " entity"));
				return undefined;
			}
			if (oFunctionMetadata.parameter != null) {
				oFunctionMetadata.parameter.forEach(function (oParam) {
					if (mUrlParams[oParam.name] !== undefined) {
						oData[oParam.name] = mUrlParams[oParam.name];
						mUrlParams[oParam.name] = ODataUtils.formatValue(mUrlParams[oParam.name],
							oParam.type);
					} else {
						oData[oParam.name] = undefined;
						Log.warning("No value given for parameter '" + oParam.name
							+ "' of function import '" + sFunctionName + "'", that, sClassName);
					}
				});
			}
			sUID = uid();
			if (sExpand) {
				mHeaders = Object.assign({}, mHeaders, {
					"Content-ID" : sUID,
					// skip state messages for the POST, they are requested by the following GET
					"sap-messages" : "transientOnly"
				});
				fnSuccess = function (oData, oFunctionResponse0) {
					if (!oFunctionResult) {
						// successful function call, wait for GET
						oFunctionResult = oData;
						oFunctionResponse = oFunctionResponse0;
						return;
					}
					// successful GET after successful function call -> call success handler with
					// merged data; successful GET after a failed function call cannot occur
					if (fnSuccessFromParameters) {
						oData = Object.assign({}, oFunctionResult, oData);
						fnSuccessFromParameters(oData, oFunctionResponse);
					}
					resetFunctionCallData();
				};
				fnError = function (oError) {
					if (oFunctionResult) {
						// failed GET after successful function call -> call success handler with
						// the data of the function call request and mark the response with
						// expandAfterFunctionCallFailed=true
						oFunctionResponse.expandAfterFunctionCallFailed = true;
						oError.expandAfterFunctionCallFailed = true;
						Log.error("Function '" + sFunctionName + "' was called successfully, but"
							+ " expansion of navigation properties (" + sExpand + ") failed",
							oError, sClassName);
						if (fnSuccessFromParameters) {
							fnSuccessFromParameters(oFunctionResult, oFunctionResponse);
						}
						resetFunctionCallData();
						return;
					}
					if (!bFunctionFailed) {
						// failed function call -> remember to skip the following failed GET and
						// call the error handler
						bFunctionFailed = true;
						if (fnErrorFromParameters) {
							fnErrorFromParameters(oError);
						}
					} else {
						// failed GET after a failed function call -> mark the error response with
						// expandAfterFunctionCallFailed=true that it can be passed to requestFailed
						// and requestCompleted event handlers
						oError.expandAfterFunctionCallFailed = true;
						resetFunctionCallData();
					}
				};
			}
			oData.__metadata = {
				uri : that.sServiceUrl + sFunctionName + "('" + sUID + "')",
				created : {
					changeSetId : sChangeSetId,
					error : fnError,
					eTag : sETag,
					functionImport : true,
					groupId : sGroupId,
					headers : Object.assign({}, mHeaders),
					key : sFunctionName.substring(1),
					method : sMethod,
					success : fnSuccess
				},
				deepPath : sFunctionName
			};

			sKey = that._addEntity(oData);
			oContext = that.getContext("/" + sKey);
			that._writePathCache("/" + sKey, "/" + sKey);
			fnResolve(oContext);
			aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
			sUrl = that._createRequestUrlWithNormalizedPath(sFunctionName, aUrlParams,
				that.bUseBatch);
			oRequest = that._createRequest(sUrl, sFunctionName, sMethod, that._getHeaders(mHeaders),
				undefined, sETag, undefined, true);
			oRequest.adjustDeepPath = mParameters.adjustDeepPath;
			oRequest.functionMetadata = oFunctionMetadata;
			oData.__metadata.created.functionMetadata = oFunctionMetadata;
			oRequest.functionTarget = that.oMetadata._getCanonicalPathOfFunctionImport(
				oFunctionMetadata, mUrlParams);
			oRequest.key = sKey;
			if (sExpand) {
				oExpandRequest = that._createRequest("$" + sUID + "?"
						+ ODataUtils._encodeURLParameters({$expand : sExpand, $select : sExpand}),
					"/$" + sUID, "GET", that._getHeaders(undefined, true), undefined, undefined,
					undefined, true);
				oExpandRequest.contentID = sUID;
				oRequest.expandRequest = oExpandRequest;
				oRequest.contentID = sUID;
				oData.__metadata.created.expandRequest = oExpandRequest;
				oData.__metadata.created.contentID = oExpandRequest.contentID;
			}

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess,
				fnError, requestHandle, bRefreshAfterChange);

			return oRequest;
		}, fnError);

		oRequestHandle.contextCreated = function() {
			return pContextCreated;
		};

		return oRequestHandle;
	};

	ODataModel.prototype._createFunctionImportParameters = function(sFunctionName, sMethod, mParams) {
		var mUrlParams = deepExtend({}, mParams);
		delete mUrlParams.__metadata;
		delete mUrlParams["$result"];
		var oFunctionMetadata = this.oMetadata._getFunctionImportMetadata(sFunctionName, sMethod);
		assert(oFunctionMetadata,
			this + ": Function " + sFunctionName + " not found in the metadata !");
		if (!oFunctionMetadata) {
			return undefined;
		}

		if (oFunctionMetadata.parameter != null) {
			each(oFunctionMetadata.parameter, function (iIndex, oParam) {
				if (mUrlParams && mUrlParams[oParam.name] !== undefined) {
					mUrlParams[oParam.name] =
						ODataUtils.formatValue(mUrlParams[oParam.name], oParam.type);
				}
			});
		}

		return mUrlParams;
	};

	/**
	 * Gets the absolute path to the resource for the given path and context.
	 *
	 * @param {boolean} bShortenPath
	 *   Whether to shorten the resource path so that it contains at most one navigation property
	 * @param {string} sDeepPath
	 *   An absolute deep path; used if resource path has to be shortened
	 * @param {string} sPath
	 *   An absolute path or a path relative to the given context; if the path contains a query
	 *   string, the query string is ignored
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context; considered only in case the path is relative
	 * @return {string}
	 *   The absolute path to the resource for the given path and context
	 *
	 * @private
	 */
	ODataModel.prototype._getResourcePath = function (bShortenPath, sDeepPath, sPath, oContext) {
		var sLastNavigationProperty, sPathBefore, mSplitPath, sResolvedPath;

		if (!bShortenPath) {
			return this.resolve(sPath, oContext);
		}

		mSplitPath = this.oMetadata._splitByLastNavigationProperty(sDeepPath);
		sPathBefore = mSplitPath.pathBeforeLastNavigationProperty;
		sLastNavigationProperty = mSplitPath.lastNavigationProperty;

		if (sLastNavigationProperty.includes("(") && mSplitPath.addressable) {
			sResolvedPath = this.resolve(sPathBefore + sLastNavigationProperty, undefined, true);
			if (sResolvedPath) {
				return sResolvedPath + mSplitPath.pathAfterLastNavigationProperty;
			}
		}

		sResolvedPath = this.resolve(sPathBefore, undefined, true) || sPathBefore;

		return sResolvedPath + sLastNavigationProperty + mSplitPath.pathAfterLastNavigationProperty;
	};

	/**
	 * Trigger a <code>GET</code> request to the OData service that was specified in the model constructor.
	 *
	 * The data will be stored in the model. The requested data is returned with the response.
	 *
	 * @param {string} sPath
	 *   An absolute path or a path relative to the context given in
	 *   <code>mParameters.context</code>; if the path contains a query string, the query string is
	 *   ignored, use <code>mParameters.urlParameters</code> instead
	 * @param {object} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified, <code>sPath</code> has to be relative to the path
	 *   given with the context.
	 * @param {Object<string,string>} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {sap.ui.model.Filter[]} [mParameters.filters] An array of filters to be included in the request URL
	 * @param {sap.ui.model.Sorter[]} [mParameters.sorters] An array of sorters to be included in the request URL
	 * @param {function} [mParameters.success] A callback function which is called when the data has
	 *   been successfully retrieved. The handler can have the
	 *   following parameters: <code>oData</code> and <code>response</code>. The <code>oData</code> parameter contains the data of the retrieved data.
	 *   The <code>response</code> parameter contains further information about the response of the request.
	 * @param {function} [mParameters.error] A callback function which is called when the request
	 *   failed. The handler can have the parameter: <code>oError</code> which contains additional error information.
	 *   If the <code>GET</code> request has been aborted, the error has an <code>aborted</code> flag set to
	 *   <code>true</code>.
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {boolean} [mParameters.updateAggregatedMessages]
	 *   Whether messages for child entities belonging to the same business object as the requested
	 *   or changed resources are updated. It is considered only if
	 *   {@link sap.ui.model.odata.MessageScope.BusinessObject} is set using
	 *   {@link #setMessageScope} and if the OData service supports message scope.
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.read = function(sPath, mParameters) {
		return this._read(sPath, mParameters);
	};

	/**
	 * Triggers a <code>GET</code> request to the OData service.
	 *
	 * @param {string} sPath
	 *   The path as specified in {@link #read}
	 * @param {object} [mParameters]
	 *   The parameters as specified in {@link #read}
	 * @param {boolean} [bSideEffects]
	 *   Whether to read data as side effects
	 * @return {object}
	 *   An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @private
	 */
	ODataModel.prototype._read = function(sPath, mParameters, bSideEffects) {
	   var bCanonical, oContext, fnError, aFilters, sGroupId, mHeaders, sMethod, oRequest,
		   aSorters, fnSuccess, bUpdateAggregatedMessages, aUrlParams, mUrlParams,
		   that = this;

	   if (mParameters) {
		   bCanonical = mParameters.canonicalRequest;
		   oContext = mParameters.context;
		   fnError = mParameters.error;
		   aFilters = mParameters.filters;
		   sGroupId = mParameters.groupId || mParameters.batchGroupId;
		   mHeaders = mParameters.headers;
		   aSorters = mParameters.sorters;
		   fnSuccess = mParameters.success;
		   bUpdateAggregatedMessages = mParameters.updateAggregatedMessages;
		   mUrlParams = mParameters.urlParameters;
	   }
	   bCanonical = this._isCanonicalRequestNeeded(bCanonical);

	   if (sPath && sPath.indexOf('?') !== -1) {
		   sPath = sPath.slice(0, sPath.indexOf('?'));
	   }

	   //if the read is triggered via a refresh we should use the refreshGroupId instead
	   if (this.sRefreshGroupId) {
		   sGroupId = this.sRefreshGroupId;
	   }

	   aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

	   mHeaders = this._getHeaders(mHeaders, true);

	   sMethod = "GET";

	   var oRequestHandle = {
		   abort: function() {
			   if (oRequest) {
				   oRequest._aborted = true;
			   }
		   }
	   };

	   function createReadRequest(requestHandle) {
		   var oEntityType, oFilter, sFilterParams, mRequests, sSorterParams, sUrl,
			   sDeepPath = that.resolveDeep(sPath, oContext),
			   sResourcePath = that._getResourcePath(bCanonical, sDeepPath, sPath, oContext);

		   // Add filter/sorter to URL parameters
		   sSorterParams = ODataUtils.createSortParams(aSorters);
		   if (sSorterParams) {
			   aUrlParams.push(sSorterParams);
		   }

		   oEntityType = that.oMetadata._getEntityTypeByPath(sResourcePath);

		   oFilter = FilterProcessor.groupFilters(aFilters);
		   sFilterParams = ODataUtils.createFilterParams(oFilter, that.oMetadata, oEntityType);
		   if (sFilterParams) {
			   aUrlParams.push(sFilterParams);
		   }

		   sUrl = that._createRequestUrlWithNormalizedPath(sResourcePath, aUrlParams,
			   that.bUseBatch);
		   oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, null, /*sETag*/undefined,
			   undefined, bUpdateAggregatedMessages, bSideEffects);

		   mRequests = that.mRequests;
		   if (sGroupId in that.mDeferredGroups) {
			   mRequests = that.mDeferredRequests;
		   }
		   that._pushToRequestQueue(mRequests, sGroupId, null, oRequest, fnSuccess, fnError, requestHandle, false);

		   return oRequest;
	   }

	   // In case we are in batch mode and are processing refreshes before sending changes to the server,
	   // the request must be processed synchronously to be contained in the same batch as the changes
	   if (this.bUseBatch && this.bIncludeInCurrentBatch) {
		   oRequest = createReadRequest(oRequestHandle);
		   return oRequestHandle;
	   } else {
		   return this._processRequest(createReadRequest, fnError);
	   }
   };

	/**
	 * Requests side effects for the entity referred to by the given context using a GET request
	 * with the given URL parameters, esp. <code>$expand</code> and <code>$select</code>, which
	 * represent the paths affected by side effects on the entity. List bindings which are affected
	 * by the given <code>$expand</code>, and are using custom parameters or filters/sorters in
	 * <code>OperationMode.Server</code> are refreshed with additional GET requests within the same
	 * batch request.
	 *
	 * @param {sap.ui.model.odata.v2.Context} oContext
	 *   The context referring to the entity to read side effects for
	 * @param {object} [mParameters]
	 *   A map of parameters as specified for {@link sap.ui.model.odata.v2.ODataModel#read}, where
	 *   only the following subset of these is supported. The <code>updateAggregatedMessages</code>
	 *   parameter is immutably set to <code>true</code>.
	 * @param {string} [mParameters.groupId]
	 *   The ID of a request group
	 * @param {Object<string,string>} [mParameters.urlParameters]
	 *   URL parameters for the side-effects request as a map from a URL parameter name to its
	 *   string value including <code>$expand</code> and <code>$select</code>
	 * @returns {Promise<Array<sap.ui.model.odata.v2.ODataListBinding>>}
	 *   The promise on the outcome of the side-effects request; resolves with the array of affected
	 *   list bindings if the request is processed successfully, or rejects with an error object if
	 *   the request fails
	 * @throws {Error}
	 *   If the given parameters map contains any other parameter than those documented above
	 *
	 * @private
	 * @see sap.ui.model.odata.v2.ODataModel#read
	 * @ui5-restricted sap.suite.ui.generic
	 */
	ODataModel.prototype.requestSideEffects = function (oContext, mParameters) {
		var sParameterKey,
			that = this;

		mParameters = mParameters || {};
		for (sParameterKey in mParameters) {
			if (!aRequestSideEffectsParametersAllowList.includes(sParameterKey)) {
				throw new Error("Parameter '" + sParameterKey + "' is not supported");
			}
		}

		return new Promise(function (resolve, reject) {
			var oAffectedEntityTypes = new Set(),
				aAffectedListBindings = [],
				sExpands = mParameters.urlParameters && mParameters.urlParameters["$expand"];

			that._read("", {
					// pass context to keep deep path information for message handling
					context : oContext,
					error : reject,
					groupId : mParameters.groupId,
					success : function (/*oData, oResponse*/) {
						resolve(aAffectedListBindings);
					},
					updateAggregatedMessages : true,
					urlParameters : mParameters.urlParameters
				}, true);

			if (sExpands) {
				sExpands.split(",").forEach(function (sExpand) {
					var oEntityType = that.oMetadata._getEntityTypeByPath(
							that.resolve(sExpand, oContext));

					oAffectedEntityTypes.add(oEntityType);
				});
				that.getBindings().forEach(function (oBinding) {
					if (oBinding.isA("sap.ui.model.odata.v2.ODataListBinding")) {
						if (oBinding._refreshForSideEffects(oAffectedEntityTypes, mParameters.groupId)) {
							aAffectedListBindings.push(oBinding);
						}
					}
				});
			}
		});
	};

	/**
	 * Return the parsed XML metadata as a Javascript object.
	 *
	 * Please note that the metadata is loaded asynchronously and this function might return
	 * <code>undefined</code> because the metadata has not been loaded yet.
	 * In this case attach to the <code>metadataLoaded</code> event to get notified when the
	 * metadata is available and then call this function.
	 *
	 * @return {Object|undefined} Metadata object
	 * @public
	 */
	ODataModel.prototype.getServiceMetadata = function() {
		if (this.oMetadata && this.oMetadata.isLoaded()) {
			return this.oMetadata.getServiceMetadata();
		}

		return undefined;
	};

	/**
	 * Returns a promise for the loaded state of the metadata.
	 *
	 * The metadata needs to be loaded prior to performing OData calls.
	 * Chaining to the returned promise ensures that all required parameters have been loaded, e.g.
	 * the security token, see {@link #getSecurityToken}.
	 *
	 * The returned promise depends on the optional parameter <code>bRejectOnFailure</code>.
	 *
	 * <code>bRejectOnFailure=false</code>:
	 * The promise won't get rejected in case the metadata or annotation loading failed but is
	 * only resolved if
	 * <ol>
	 * <li>the metadata are loaded successfully,</li>
	 * <li>the annotations are processed, provided the model parameter
	 * <code>loadAnnotationsJoined</code> has been set.</li>
	 * </ol>
	 * Use this promise for delaying OData calls until all required information is available, i.e.
	 * this promise is resolved.
	 *
	 * <code>bRejectOnFailure=true</code>:
	 * Since 1.79, the parameter <code>bRejectOnFailure</code> allows to request a promise that is
	 * rejected when one of the following fails:
	 * <ul>
	 * <li>the loading of the metadata,</li>
	 * <li>the loading of the annotations, provided the model parameter
	 * <code>loadAnnotationsJoined</code> has been set.</li>
	 * </ul>
	 * The promise is fulfilled upon successful loading of both. This promise can be used to start
	 * processing OData calls when it is fulfilled and to display an error message when it is
	 * rejected. See also the example below.
	 *
	 * If the method <code>refreshMetadata</code> is called after the returned promise is already
	 * resolved or rejected, you should use the promise returned by <code>refreshMetadata</code>
	 * to get information about the refreshed state.
	 *
	 * @example
	 * var oModel  = this.oModel, // v2.ODataModel
	 *     that = this;
	 * oModel.metadataLoaded(true).then(
	 *     function () {
	 *         // model is ready now
	 *         oModel.createKey("PERSON", {"ID" : 4711, "TASK_GUID": "myguid"});
	 *     },
	 *     function () {
	 *         // Display error information so that the user knows that the application does not work.
	 *         that.navigateToErrorPage();
	 *     });
	 *
	 * @param {boolean} [bRejectOnFailure=false]
	 *   Determines since 1.79 whether the returned promise is rejected when the initial loading
	 *   of the metadata fails. In case the model parameter <code>loadAnnotationsJoined</code> is
	 *   set, the returned promise fails also if loading the annotations fails.
	 *
	 * @returns {Promise} A promise on metadata loaded state
	 *
	 * @public
	 * @since 1.30
	 */
	ODataModel.prototype.metadataLoaded = function (bRejectOnFailure) {
		var pMetadataLoaded = this.oMetadata.loaded(bRejectOnFailure);
		if (this.bLoadAnnotationsJoined) {
			// In case the metadata promise can be rejected, the resulting promise will also fail
			// if the annotation loading failed.
			if (bRejectOnFailure) {
				return Promise.all([pMetadataLoaded, this.pAnnotationsLoaded]);
			}
			// In case annotations are loaded "joined" with metadata, delay the metadata promise
			// until annotations are either loaded or failed.
			var fnChainMetadataLoaded = function() {
				return pMetadataLoaded;
			};

			return this.pAnnotationsLoaded.then(fnChainMetadataLoaded, fnChainMetadataLoaded);
		} else {
			return pMetadataLoaded;
		}
	};

	/**
	 * Returns a promise that resolves with an array containing information about the initially
	 * loaded annotations.
	 *
	 * <b>Important</b>: This covers the annotations that were given to the model constructor, not
	 * the ones that might have been added later on using the protected API method
	 * {@link #addAnnotationUrl}. In order to get information about those, the event
	 * <code>annotationsLoaded</code> can be used.
	 *
	 * @returns {Promise}
	 *   A promise that resolves with an array containing information about the initially loaded
	 *   annotations
	 *
	 * @public
	 * @since 1.42
	 */
	ODataModel.prototype.annotationsLoaded = function() {
		return this.pAnnotationsLoaded;
	};

	/**
	 * Checks whether metadata loading has failed in the past.
	 *
	 * @public
	 * @returns {boolean} Whether metadata request has failed
	 *
	 * @since 1.38
	 */
	ODataModel.prototype.isMetadataLoadingFailed = function() {
		return this.oMetadata.isFailed();
	};

	/**
	 * Return the annotation object. Please note that the metadata is loaded asynchronously and this function might return undefined because the
	 * metadata has not been loaded yet.
	 * In this case attach to the <code>annotationsLoaded</code> event to get notified when the annotations are available and then call this function.
	 *
	 * @return {object} Metadata object
	 * @public
	 */
	ODataModel.prototype.getServiceAnnotations = function() {
		var mAnnotations = this.oAnnotations.getData();
		return isEmptyObject(mAnnotations) ? null : mAnnotations;
	};

	ODataModel.prototype.onAnnotationsFailed = function(oEvent) {
		this.fireAnnotationsFailed(oEvent.getParameters());
	};

	ODataModel.prototype.onAnnotationsLoaded = function(oEvent) {
		this.fireAnnotationsLoaded(oEvent.getParameters());
	};

	/**
	 * Adds (a) new URL(s) whose content should be parsed as OData annotations, which are then merged into the annotations object
	 * which can be retrieved by calling the {@link #getServiceAnnotations}-method. If a <code>$metadata</code> URL is passed,
	 * the data will also be merged into the metadata object, which can be reached by calling the {@link #getServiceMetadata} method.
	 *
	 * @param {string|string[]} vUrl - Either one URL as string or an array of URL strings
	 * @return {Promise} The Promise to load the given URL(s), resolved if all URLs have been loaded, rejected if at least one fails to load.
	 * 					 If this promise resolves it returns an object with the following properties:
	 * 					 <code>annotations</code>: The annotation object
	 * 					 <code>entitySets</code>: An array of EntitySet objects containing the newly merged EntitySets from a <code>$metadata</code> requests.
	 * 								 The structure is the same as in the metadata object reached by the <code>getServiceMetadata()</code> method.
	 * 								 For non-<code>$metadata</code> requests the array will be empty.
	 *
	 * @protected
	 */
	ODataModel.prototype.addAnnotationUrl = function(vUrl) {
		var aUrls = [].concat(vUrl),
			aMetadataUrls = [],
			aAnnotationUrls = [],
			aEntitySets = [],
			that = this;

		aUrls.forEach(function(sUrl) {
			var iIndex = sUrl.indexOf("$metadata");
			if (iIndex >= 0) {
				sUrl = that._createMetadataUrl(sUrl);
				aMetadataUrls.push(sUrl);
			} else {
				aAnnotationUrls.push(sUrl);
			}
		});

		return this.oMetadata._addUrl(aMetadataUrls).then(function(aParams) {
			return Promise.all(aParams.map(function(oParam) {
				aEntitySets = aEntitySets.concat(oParam.entitySets);
				return that.oAnnotations.addSource({
					type: "xml",
					data: oParam["metadataString"]
				});
			}));
		}).then(function() {
			return that.oAnnotations.addSource(aAnnotationUrls);
		}).then(function(oParam) {
			return {
				annotations: that.oAnnotations.getData(),
				entitySets: aEntitySets
			};
		});
	};

	/**
	 * Adds new XML content to be parsed for OData annotations, which are then merged into the annotations object which
	 * can be retrieved by calling the {@link #getServiceAnnotations}-method.
	 *
	 * @param {string} sXMLContent - The string that should be parsed as annotation XML
	 * @param {boolean} [bSuppressEvents=false] - Whether not to fire annotationsLoaded event on the annotationParser
	 * @return {Promise} The Promise to parse the given XML-String, resolved if parsed without errors, rejected if errors occur
	 * @protected
	 */
	ODataModel.prototype.addAnnotationXML = function(sXMLContent, bSuppressEvents) {
		return this.oAnnotations.addSource({
			type: "xml",
			data: sXMLContent
		});
	};

	/**
	 * Submits the collected changes which were collected by the {@link #setProperty} method and other deferred requests.
	 *
	 * The update method is defined by the global <code>defaultUpdateMethod</code> parameter which is
	 * <code>sap.ui.model.odata.UpdateMethod.Merge</code> by default. In case of a <code>sap.ui.model.odata.UpdateMethod.Merge</code>
	 * request only the changed properties will be updated.
	 * If a URI with a <code>$expand</code> query option was used then the expand entries will be removed from the collected changes.
	 * Changes to this entries should be done on the entry itself. So no deep updates are supported.
	 *
	 * <b>Important</b>: The success/error handler will only be called if batch support is enabled. If multiple batch groups are submitted the handlers will be called for every batch group.
	 * If there are no changes/requests or all contained requests are aborted before a batch request returns, the success handler will be called with an empty response object.
	 * If the abort method on the return object is called, all contained batch requests will be aborted and the error handler will be called for each of them.
	 *
	 * @param {object} [mParameters] A map which contains the following parameter properties:
	 * @param {string} [mParameters.groupId] Defines the group that should be submitted. If not specified, all deferred groups will be submitted. Requests belonging to the same group will be bundled in one batch request.
	 * @param {function} [mParameters.success] A callback function which is called when the data has been successfully updated. The handler can have the following parameters: <code>oData</code>. <code>oData</code> contains the
	 * parsed response data as a Javascript object. The batch response is in the <code>__batchResponses</code> property which may contain further <code>__changeResponses</code> in an array depending on the amount of changes
	 * and change sets of the actual batch request which was sent to the backend.
	 * The changeResponses contain the actual response of that change set in the <code>response</code> property.
	 * For each change set there is also a <code>__changeResponse</code> property.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 *   The handler can have the parameter: <code>oError</code> which contains additional error information.
	 *   If all contained requests have been aborted, the error has an <code>aborted</code> flag set to
	 *   <code>true</code>.
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead
	 * @param {boolean} [mParameters.merge]
	 *   <b>Deprecated</b> since 1.38.0; use the <code>defaultUpdateMethod</code> constructor parameter instead.
	 *   If unset, the update method is determined from the <code>defaultUpdateMethod</code> constructor parameter.
	 *   If <code>true</code>, <code>sap.ui.model.odata.UpdateMethod.Merge</code> is used for update operations;
	 *   if set to <code>false</code>, <code>sap.ui.model.odata.UpdateMethod.Put</code> is used.
	 * @return {object} An object which has an <code>abort</code> function to abort the current request or requests
	 *
	 * @public
	 */
	ODataModel.prototype.submitChanges = function(mParameters) {
		return this.submitChangesWithChangeHeaders(mParameters && {
			batchGroupId : mParameters.batchGroupId,
			error : mParameters.error,
			groupId : mParameters.groupId,
			merge : mParameters.merge,
			success : mParameters.success
		});
	};

	/**
	 * Submits all deferred requests just like {@link #submitChanges} but in addition adds the given headers to
	 * all requests in the $batch request(s).
	 *
	 * @param {object} [mParameters]
	 *   A map of parameters
	 * @param {Object<string,string>} [mParameters.changeHeaders]
	 *   The map of headers to add to each change (i.e. non-GET) request within the $batch; ignored if $batch is not
	 *   used
	 * @param {function} [mParameters.error]
	 *   A callback function which is called when the request failed
	 * @param {string} [mParameters.groupId]
	 *   The group to be submitted; if not given, all deferred groups are submitted
	 * @param {function} [mParameters.success]
	 *   A callback function which is called when the request has been successful
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead
	 * @param {boolean} [mParameters.merge]
	 *   <b>Deprecated</b> since 1.38.0; whether the update method <code>sap.ui.model.odata.UpdateMethod.Merge</code>
	 *   is used
	 * @returns {object}
	 *   An object which has an <code>abort</code> function
	 * @throws {Error}
	 *   If the given headers contain one of the following private headers managed by the ODataModel:
	 *   accept, accept-language, maxdataserviceversion, dataserviceversion, x-csrf-token, sap-contextid-accept,
	 *   sap-contextid
	 *
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 */
	ODataModel.prototype.submitChangesWithChangeHeaders = function(mParameters) {
		var mChangedEntities, fnError, sGroupId, sMethod, sPrivateHeader, oRequestHandle, vRequestHandleInternal,
			fnSuccess,
			bAborted = false,
			bRefreshAfterChange = this.bRefreshAfterChange,
			that = this;

		mParameters = mParameters || {};
		sGroupId = mParameters.groupId || mParameters.batchGroupId;
		fnSuccess = mParameters.success;
		fnError = mParameters.error;
		// ensure merge parameter backwards compatibility
		if (mParameters.merge !== undefined) {
			sMethod =  mParameters.merge ? "MERGE" : "PUT";
		}
		sPrivateHeader = Object.keys(mParameters.changeHeaders || {}).find(function (sHeader) {
			return that._isHeaderPrivate(sHeader);
		});
		if (sPrivateHeader) {
			throw new Error("Must not use private header: " + sPrivateHeader);
		}

		this.getBindings().forEach(function (oBinding) {
			if (oBinding._submitChanges) {
				var fnOldSuccess = fnSuccess || function () {},
					mParameters0 = {groupId : sGroupId};

				oBinding._submitChanges(mParameters0);
				if (mParameters0.success) {
					fnSuccess = function () {
						fnOldSuccess.apply(null, arguments);
						mParameters0.success.apply(null, arguments);
					};
				}
			}
		});

		if (sGroupId && !this.mDeferredGroups[sGroupId]) {
			Log.fatal(this + " submitChanges: \"" + sGroupId + "\" is not a deferred group!");
		}

		mChangedEntities = merge({}, that.mChangedEntities);

		this.oMetadata.loaded().then(function() {
			var oChange, aChanges, sChangeSetId, i, sRequestGroupId, oRequestGroup;

			each(mChangedEntities, function(sKey, oData) {
				var oCreatedInfo, oRequest, oRequestHandle0,
					oContext = that.getContext("/" + sKey),
					oGroupInfo = that._resolveGroup(sKey);

				if (oContext.hasTransientParent() || oContext.isInactive()) {
					return;
				}

				if (oGroupInfo.groupId === sGroupId || !sGroupId) {
					oRequest = that._processChange(sKey, oData, oGroupInfo.groupId, sMethod);
					oRequest.key = sKey;
					//get params for created entries: could contain success/error handler
					oCreatedInfo = oData.__metadata && oData.__metadata.created
						? oData.__metadata.created
						: {};
					oRequestHandle0 = {
						abort: function() {
							oRequest._aborted = true;
						}
					};
					if (oGroupInfo.groupId in that.mDeferredGroups) {
						that._pushToRequestQueue(that.mDeferredRequests, oGroupInfo.groupId,
							oGroupInfo.changeSetId, oRequest, oCreatedInfo.success,
							oCreatedInfo.error, oRequestHandle0,
							oCreatedInfo.refreshAfterChange === undefined
								? bRefreshAfterChange
								: oCreatedInfo.refreshAfterChange);
					}
				}
			});

			// Set undefined refreshAfterChange flags
			// If undefined => overwrite with current global refreshAfterChange state
			for (sRequestGroupId in that.mDeferredRequests) {
				oRequestGroup = that.mDeferredRequests[sRequestGroupId];
				for (sChangeSetId in oRequestGroup.changes) {
					aChanges = oRequestGroup.changes[sChangeSetId];
					for (i = aChanges.length - 1; i >= 0; i--) {
						oChange = aChanges[i];
						if (oChange.bRefreshAfterChange === undefined) {
							oChange.bRefreshAfterChange = bRefreshAfterChange;
						}
					}
				}
			}

			vRequestHandleInternal = that._processRequestQueue(that.mDeferredRequests, sGroupId, fnSuccess, fnError,
				mParameters.changeHeaders);
			if (bAborted) {
				oRequestHandle.abort();
			}
			//call success handler even no changes were submitted
			if (Array.isArray(vRequestHandleInternal) && vRequestHandleInternal.length == 0 && fnSuccess) {
				fnSuccess({}, undefined);
			}
		});

		oRequestHandle = {
			abort: function() {
				if (vRequestHandleInternal) {
					if (Array.isArray(vRequestHandleInternal)) {
						vRequestHandleInternal.forEach(function(oRequestHandle) {
							oRequestHandle.abort();
						});
					} else {
						vRequestHandleInternal.abort();
					}
				} else {
					bAborted = true;
				}
			}
		};

		return oRequestHandle;
	};

	/**
	 * Updates the object in the shadow cache containing the pending user input and the object in
	 * the model cache with the given data for the entity with the given key. If all changes for
	 * that entity are processed the object is removed from the shadow cache.
	 *
	 * @param {string} [sEntityKey] The key for the entity to be updated
	 * @param {object} [oData] The new data for the entity
	 *
	 * @private
	 */
	ODataModel.prototype._updateChangedEntity = function(sEntityKey, oData) {
		var oChangedEntry, sDeepPath, oEntityType, oEntry, oNavPropRefInfo, sRootPath,
			that = this;

		function updateChangedEntities(oOriginalObject, oChangedObject, sCurPath) {
			each(oChangedObject,function(sKey) {
				var sActPath = sCurPath + '/' + sKey;
				if (isPlainObject(oChangedObject[sKey]) && isPlainObject(oOriginalObject[sKey])) {
					updateChangedEntities(oOriginalObject[sKey], oChangedObject[sKey], sActPath);
					if (isEmptyObject(oChangedObject[sKey])) {
						delete oChangedObject[sKey];
					}
				} else if (sCurPath.endsWith("__metadata")
						|| deepEqual(oChangedObject[sKey], oOriginalObject[sKey])
							&& !that.isLaundering(sActPath)) {
					delete oChangedObject[sKey];
					// When current object is the entity itself check for matching navigation
					// property in changed entity data and take care of it as well
					if (sCurPath === sRootPath) {
						oEntityType = that.oMetadata._getEntityTypeByPath(sRootPath);
						oNavPropRefInfo = oEntityType &&
							that.oMetadata._getNavPropertyRefInfo(oEntityType, sKey);
						if (oNavPropRefInfo && oChangedObject[oNavPropRefInfo.name]) {
							// if the nav prop related to the matching property is also set, set it
							// on original entry and remove it from changed entity
							oOriginalObject[oNavPropRefInfo.name] =
								oChangedObject[oNavPropRefInfo.name];
							delete oChangedObject[oNavPropRefInfo.name];
						}
					}
				}
			});
		}
		if (sEntityKey in that.mChangedEntities) {
			oEntry = that._getObject('/' + sEntityKey, null, true);
			oChangedEntry = that._getObject('/' + sEntityKey);
			merge(oEntry, oData);
			sRootPath = '/' + sEntityKey;
			sDeepPath = that.removeInternalMetadata(oChangedEntry).deepPath;
			updateChangedEntities(oEntry, oChangedEntry, sRootPath);
			if (isEmptyObject(oChangedEntry)) {
				delete that.mChangedEntities[sEntityKey];
				that.abortInternalRequest(that._resolveGroup(sEntityKey).groupId,
					{requestKey: sEntityKey});
			} else {
				that.mChangedEntities[sEntityKey] = oChangedEntry;
				oChangedEntry.__metadata = {deepPath: sDeepPath};
				extend(oChangedEntry.__metadata, oEntry.__metadata);
			}
		}
	};

	/**
	 * Discards the changes for the given entity key, that means aborts internal requests, removes
	 * the changes from the shadow cache, and removes all messages for that entity.
	 *
	 * If <code>bDeleteEntity</code> is set, remove the entity also from the data cache and the
	 * corresponding context from the contexts cache and from the created contexts cache if the
	 * entity has been created via {@link sap.ui.model.odata.v2.ODataListBinding#create}.
	 *
	 * @param {string} sKey
	 *   The entity key
	 * @param {boolean} [bDeleteEntity=false]
	 *   Whether to delete the entity also from the data cache and the created contexts cache
	 * @returns {Promise}
	 *   Resolves when all changes have been discarded
	 * @private
	 */
	ODataModel.prototype._discardEntityChanges = function (sKey, bDeleteEntity) {
		var oContext, oCreated,
			// determine group synchronously otherwise #_resolveGroup might return a different group
			// if for example the entity has been deleted already
			sGroupId = this._resolveGroup(sKey).groupId,
			pMetaDataLoaded = this.oMetadata.loaded(),
			that = this;

		pMetaDataLoaded.then(function () {
			that.abortInternalRequest(sGroupId, {requestKey : sKey});
		});
		if (bDeleteEntity) {
			oContext = this.getContext("/" + sKey);
			oContext.removeFromTransientParent();
			// remove context synchronously from the list of created contexts to avoid a temporary
			// empty table row
			this.oCreatedContextsCache.findAndRemoveContext(oContext);
			// remember created information before it is deleted in #_removeEntity
			oCreated = this.mChangedEntities[sKey]
				&& this.mChangedEntities[sKey].__metadata.created;
			this._removeEntity(sKey);
			if (oCreated && oCreated.abort) {
				oCreated.abort(ODataModel._createAbortedError());
			}
		} else {
			delete this.mChangedEntities[sKey];
		}
		Messaging.removeMessages(this.getMessagesByEntity(sKey, /*bExcludePersistent*/true));

		return pMetaDataLoaded;
	};

	/**
	 * Resets pending changes and aborts corresponding requests.
	 *
	 * By default, only changes triggered through {@link #createEntry} or {@link #setProperty}, and
	 * tree hierarchy changes are taken into account. If <code>bAll</code> is set, also deferred
	 * requests triggered through {@link #create}, {@link #update} or {@link #remove} are taken
	 * into account.
	 *
	 * With a given <code>aPath</code> only specified entities are reset. Note that tree hierarchy
	 * changes are only affected if a given path is equal to the tree binding's resolved binding
	 * path.
	 *
	 * If <code>bDeleteCreatedEntities</code> is set, the entity is completely removed, provided it
	 * has been created by one of the following methods:
	 * <ul>
	 *   <li>{@link #createEntry}, provided it is not yet persisted in the back end
	 *      and is active (see {@link sap.ui.model.odata.v2.Context#isInactive}),</li>
	 *   <li>{@link #callFunction}.</li>
	 * </ul>
	 *
	 * @param {string[]} [aPath]
	 *   Paths to be reset; if no array is passed, all changes are reset
	 * @param {boolean} [bAll=false]
	 *   Whether also deferred requests are taken into account so that they are aborted
	 * @param {boolean} [bDeleteCreatedEntities=false]
	 *   Whether to delete the entities created via {@link #createEntry} or {@link #callFunction};
	 *   since 1.95.0
	 * @returns {Promise}
	 *   Resolves when all regarded changes have been reset.
	 *
	 * @public
	 * @see #getPendingChanges
	 * @see #hasPendingChanges
	 */
	ODataModel.prototype.resetChanges = function (aPath, bAll, bDeleteCreatedEntities) {
		return this._resetChanges(aPath, bAll, bDeleteCreatedEntities);
	};

	/**
	 * Resets pending changes and aborts corresponding requests as specified by {@link #resetChanges}, but does not
	 * enforce a control update after resetting the changes.
	 *
	 * @param {string[]} [aPath]
	 *   Paths to be reset; if no array is passed, all changes are reset
	 * @param {boolean} [bAll=false]
	 *   Whether also deferred requests are taken into account so that they are aborted
	 * @param {boolean} [bDeleteCreatedEntities=false]
	 *   Whether to delete the entities created via {@link #createEntry} or {@link #callFunction};
	 *   since 1.95.0
	 * @returns {Promise}
	 *   Resolves when all regarded changes have been reset.
	 *
	 * @private
	 * @since 1.125.0
	 * @ui5-restricted sap.ui.comp.smartmultiinput
	 */
	ODataModel.prototype.resetChangesWithoutUpdate = function (aPath, bAll, bDeleteCreatedEntities) {
		return this._resetChanges(aPath, bAll, bDeleteCreatedEntities, false);
	};

	/**
	 * Resets pending changes and aborts corresponding requests as specified by {@link #resetChanges}, but in addition
	 * allows to specify whether to enforce a control update after resetting the changes.
	 *
	 * @param {string[]} [aPath]
	 *   Paths to be reset; if no array is passed, all changes are reset
	 * @param {boolean} [bAll=false]
	 *   Whether also deferred requests are taken into account so that they are aborted
	 * @param {boolean} [bDeleteCreatedEntities=false]
	 *   Whether to delete the entities created via {@link #createEntry} or {@link #callFunction};
	 *   since 1.95.0
	 * @param {boolean} [bForceUpdate=true]
	 *   Whether to enforce a control update after resetting the changes
	 * @returns {Promise}
	 *   Resolves when all regarded changes have been reset.
	 *
	 * @private
	 */
	ODataModel.prototype._resetChanges = function (aPath, bAll, bDeleteCreatedEntities, bForceUpdate) {
		var aRemoveKeys,
			pMetaDataLoaded = this.oMetadata.loaded(),
			aRemoveRootKeys = [],
			that = this;

		if (bAll) {
			pMetaDataLoaded.then(function () {
				each(that.mDeferredGroups, function (sGroupId) {
					if (aPath) {
						aPath.forEach(function(sPath) {
							that.abortInternalRequest(sGroupId, {path : sPath.substring(1)});
						});
					} else {
						that.abortInternalRequest(sGroupId);
					}
				});
			});
		}
		if (aPath) {
			each(aPath, function (iIndex, sPath) {
				var oChangedEntity, i, sKey, sLastSegment, aPathSegments,
					oEntityInfo = {};

				if (that.getEntityByPath(sPath, null, oEntityInfo)) {
					aPathSegments = oEntityInfo.propertyPath.split("/");
					sLastSegment = aPathSegments[aPathSegments.length - 1];
					sKey = oEntityInfo.key;
					oChangedEntity = that.mChangedEntities[sKey];
					if (oChangedEntity) {
						// follow path to the object containing the property to reset
						for (i = 0; i < aPathSegments.length - 1; i += 1) {
							if (oChangedEntity && oChangedEntity.hasOwnProperty(aPathSegments[i])) {
								oChangedEntity = oChangedEntity[aPathSegments[i]];
							} else {
								// path may point to a property of a complex type and complex type
								// might not be set; there is no property to reset
								oChangedEntity = undefined;
								break;
							}
						}
						if (oChangedEntity && oChangedEntity.hasOwnProperty(sLastSegment)) {
							delete oChangedEntity[sLastSegment];
						}
						oChangedEntity = that.mChangedEntities[sKey];
						if (ODataModel._isChangedEntityEmpty(oChangedEntity)
								|| !oEntityInfo.propertyPath) {
							aRemoveRootKeys.push(sKey);
						}
					}
				}
			});
			aRemoveKeys = aRemoveRootKeys;
			aRemoveRootKeys.forEach(function (sKey) {
				aRemoveKeys = aRemoveKeys.concat(
					that.getContext("/" + sKey).getSubContextsAsKey(/*bRecursive*/true));
			});
			(new Set(aRemoveKeys)).forEach(function (sKey) {
				that._discardEntityChanges(sKey,
					that.mChangedEntities[sKey].__metadata.created && bDeleteCreatedEntities);
			});
		} else {
			each(this.mChangedEntities, function (sKey, oChangedEntity) {
				var bDeleteEntity = that.getContext("/" + sKey).isInactive()
						? false // inactive entities are not removed, but only changes are reset
						: oChangedEntity.__metadata.created && bDeleteCreatedEntities;

				that._discardEntityChanges(sKey, bDeleteEntity);
			});
		}
		this.getBindings().forEach(function (oBinding) {
			if (oBinding._resetChanges) {
				oBinding._resetChanges(aPath);
			}
		});
		this.checkUpdate(bForceUpdate === undefined ? true : bForceUpdate);

		return pMetaDataLoaded;
	};

	/**
	 * Sets a new value for the given property <code>sPath</code> in the model.
	 *
	 * If the <code>changeBatchGroup</code> for the changed entity type is set to
	 * {@link #setDeferredGroups deferred}, changes could be submitted with {@link #submitChanges}.
	 * Otherwise the change will be submitted directly.
	 *
	 * @param {string} sPath
	 *   Path of the property to set
	 * @param {any} oValue
	 *   Value to set the property to
	 * @param {sap.ui.model.Context} [oContext=null]
	 *   The context which will be used to set the property
	 * @param {boolean} [bAsyncUpdate]
	 *   Whether to update other bindings dependent on this property asynchronously
	 * @returns {boolean}
	 *   <code>true</code> if the value was set correctly and <code>false</code> if errors occurred
	 *   like the entry was not found or another entry was already updated.
	 * @throws {Error}
	 *   If setting a value for an instance annotation starting with &quot;@$ui5&quot;
	 * @public
	 */
	ODataModel.prototype.setProperty = function(sPath, oValue, oContext, bAsyncUpdate) {
		var oContextToActivate, oChangeObject, bCreated, sDeepPath, oEntityMetadata, oEntityType,
			oEntry, sGroupId, oGroupInfo, bIsNavPropExpanded, sKey, mKeys, oNavPropRefInfo, oOriginalEntry,
			oOriginalValue, mParams, aParts, sPropertyPath, oRef, bRefreshAfterChange, oRequest,
			mRequests, oRequestHandle, oRequestQueueingPromise, sResolvedPath,
			mChangedEntities = {},
			oEntityInfo = {},
			bFunction = false,
			that = this;

		function updateChangedEntities(oOriginalObject, oChangedObject) {
			each(oChangedObject,function(sKey) {
				if (isPlainObject(oChangedObject[sKey]) && isPlainObject(oOriginalObject[sKey])) {
					updateChangedEntities(oOriginalObject[sKey], oChangedObject[sKey]);
					if (isEmptyObject(oChangedObject[sKey])) {
						delete oChangedObject[sKey];
					}
				} else if (deepEqual(oChangedObject[sKey], oOriginalObject[sKey])) {
					delete oChangedObject[sKey];
				}
			});
		}

		sResolvedPath = this.resolve(sPath, oContext);
		sDeepPath = this.resolveDeep(sPath, oContext);

		oEntry = this.getEntityByPath(sResolvedPath, null, oEntityInfo);

		if (!oEntry) {
			return false;
		}

		sPropertyPath = sResolvedPath.substring(sResolvedPath.lastIndexOf("/") + 1);
		if (sPropertyPath.startsWith("@$ui5.")) {
			throw new Error("Setting a value for an instance annotation starting with '@$ui5' is "
				+ "not allowed: " + sPropertyPath);
		}
		sKey = oEntityInfo.key;
		oOriginalEntry = this._getObject('/' + sKey, null, true);
		oOriginalValue = this._getObject(sPath, oContext, true);

		bFunction = oOriginalEntry.__metadata.created && oOriginalEntry.__metadata.created.functionImport;

		//clone property
		if (!this.mChangedEntities[sKey]) {
			oEntityMetadata = oEntry.__metadata;
			oEntry = {};
			oEntry.__metadata = Object.assign({}, oEntityMetadata);
			if (!bFunction && oEntityInfo.propertyPath.length > 0) {
				var iIndex = sDeepPath.lastIndexOf(oEntityInfo.propertyPath);
				oEntry.__metadata.deepPath = sDeepPath.substring(0, iIndex - 1);
			}
			this.mChangedEntities[sKey] = oEntry;
		}

		oChangeObject = this.mChangedEntities[sKey];

		// if property is not available check if it is a complex type and update it
		aParts = oEntityInfo.propertyPath.split("/");
		for (var i = 0; i < aParts.length - 1; i++) {
			if (!oChangeObject.hasOwnProperty(aParts[i])) {
				oChangeObject[aParts[i]] = {};
			}
			oChangeObject = oChangeObject[aParts[i]];
		}

		// Update property value on change object
		oChangeObject[sPropertyPath] = _Helper.isPlainObject(oValue)
			? _Helper.merge({}, oValue)
			: oValue;

		if (oContext && oContext.hasTransientParent && oContext.hasTransientParent()) {
			mChangedEntities[sKey] = true;
			this.checkUpdate(false, bAsyncUpdate, mChangedEntities);
			return true;
		}

		// If property is key property of ReferentialConstraint, also update the corresponding
		// navigation property
		oEntityType = this.oMetadata._getEntityTypeByPath(oEntityInfo.key);
		oNavPropRefInfo = oEntityType && this.oMetadata._getNavPropertyRefInfo(oEntityType, sPropertyPath);
		bIsNavPropExpanded = oNavPropRefInfo && oOriginalEntry[oNavPropRefInfo.name] && oOriginalEntry[oNavPropRefInfo.name].__ref;
		if (bIsNavPropExpanded && oNavPropRefInfo.keys.length === 1
			// only if the referenced entity has exactly 1 key we can update the reference; more
			// keys are not yet supported; for draft enabled entities not all key properties are
			// maintained as referential constraints
			&& this.oMetadata._getEntityTypeByPath(oNavPropRefInfo.entitySet).key.propertyRef.length === 1) {
			if (oValue === null) {
				oRef = null;
			} else {
				mKeys = {};
				oNavPropRefInfo.keys.forEach(function(sName) {
					mKeys[sName] = oEntry[sName] !== undefined ? oEntry[sName] : oOriginalEntry[sName];
				});
				mKeys[oNavPropRefInfo.keys[0]] = oValue;
				oRef = this.createKey(oNavPropRefInfo.entitySet, mKeys);
			}
			oChangeObject[oNavPropRefInfo.name] = { __ref: oRef };
		}

		oRequestQueueingPromise = this.oMetadata.loaded();
		if (oEntry.__metadata.created && !bFunction) {
			oContextToActivate = this.oCreatedContextsCache.findCreatedContext(sResolvedPath);
			if (oContextToActivate && oContextToActivate.isInactive()) {
				oContextToActivate.startActivation();
				oRequestQueueingPromise = Promise.all([oRequestQueueingPromise, oContextToActivate.fetchActivated()]);
			}
		}

		//reset clone if oValue equals the original value
		if (deepEqual(oValue, oOriginalValue) && !this.isLaundering('/' + sKey) && !bFunction) {
			//delete metadata to check if object has changes
			oEntityMetadata = this.mChangedEntities[sKey].__metadata;
			bCreated = oEntityMetadata && oEntityMetadata.created;
			delete this.mChangedEntities[sKey].__metadata;
			// check for 'empty' complex types objects and delete it - not for created entities
			if (!bCreated) {
				updateChangedEntities(oOriginalEntry, this.mChangedEntities[sKey]);
			}
			if (isEmptyObject(this.mChangedEntities[sKey])) {
				delete this.mChangedEntities[sKey];
				mChangedEntities[sKey] = true;
				this.checkUpdate(false, bAsyncUpdate, mChangedEntities);

				oRequestQueueingPromise.then(function() {
					//setProperty with no change does not create a request the first time so no handle exists
					that.abortInternalRequest(that._resolveGroup(sKey).groupId, {requestKey: sKey});
				});
				return true;
			}
			this.mChangedEntities[sKey].__metadata = oEntityMetadata;
		}

		oGroupInfo = this._resolveGroup(sKey);
		sGroupId = oGroupInfo.groupId;

		mRequests = this.mRequests;

		if (sGroupId in this.mDeferredGroups) {
			mRequests = this.mDeferredRequests;
		}
		oRequest = this._processChange(sKey, this._getObject('/' + sKey), sGroupId);
		oRequest.key = sKey;
		//get params for created entries: could contain success/error handler
		mParams = oChangeObject.__metadata && oChangeObject.__metadata.created ? oChangeObject.__metadata.created : {};

		bRefreshAfterChange = this._getRefreshAfterChange(undefined, sGroupId);

		oRequestQueueingPromise.then(function () {
			oRequestHandle = {
				abort: function() {
					oRequest._aborted = true;
				}
			};
			that._pushToRequestQueue(mRequests, sGroupId, oGroupInfo.changeSetId, oRequest,
				mParams.success, mParams.error, oRequestHandle, bRefreshAfterChange);
			that._processRequestQueueAsync(that.mRequests);
		});

		mChangedEntities[sKey] = true;
		this.checkUpdate(false, bAsyncUpdate, mChangedEntities);
		return true;
	};

	ODataModel.prototype._isHeaderPrivate = function(sHeaderName) {
		// case sensitive check needed to make sure private headers cannot be overridden by difference in the upper/lower case (e.g. accept and Accept).
		switch (sHeaderName.toLowerCase()) {
			case "accept":
			case "accept-language":
			case "maxdataserviceversion":
			case "dataserviceversion":
				return true;
			case "x-csrf-token":
				return this.bTokenHandling;
			case "sap-contextid-accept":
			case "sap-contextid":
				return !this.bDisableSoftStateHeader;
			default:
				return false;
		}
	};

	/**
	 * Set custom headers which are provided in a key/value map.
	 *
	 * These headers are used for requests against the OData backend.
	 * Private headers which are set in the ODataModel cannot be modified.
	 * These private headers are: <code>accept, accept-language, x-csrf-token, MaxDataServiceVersion, DataServiceVersion</code>.
	 *
	 * To remove these custom headers simply set the <code>mHeaders</code> parameter to null.
	 * Please also note that when calling this method again, all previous custom headers
	 * are removed unless they are specified again in the <code>mHeaders</code> parameter.
	 *
	 * @param {object} mHeaders The header name/value map.
	 * @public
	 */
	ODataModel.prototype.setHeaders = function(mHeaders) {
		var mCheckedHeaders = {},
		that = this;
		this.mCustomHeaders = {};

		if (mHeaders) {
			each(mHeaders, function(sHeaderName, sHeaderValue){
				// case sensitive check needed to make sure private headers cannot be overridden by difference in the upper/lower case (e.g. accept and Accept).
				if (that._isHeaderPrivate(sHeaderName)){
					Log.warning(this + " - modifying private header: '" + sHeaderName + "' not allowed!");
				} else {
					mCheckedHeaders[sHeaderName] = sHeaderValue;
				}
			});
			this.mCustomHeaders = mCheckedHeaders;
		}

		// Custom set headers should also be used when requesting annotations, but do not instantiate annotations just for this
		if (this.oAnnotations) {
			this.oAnnotations.setHeaders(this.mCustomHeaders);
		}
	};

	ODataModel.prototype._getHeaders = function(mHeaders, bCancelOnClose) {

		var mCheckedHeaders = {},
		that = this;
		if (mHeaders) {
			each(mHeaders, function(sHeaderName, sHeaderValue){
				// case sensitive check needed to make sure private headers cannot be overridden by difference in the upper/lower case (e.g. accept and Accept).
				if (that._isHeaderPrivate(sHeaderName)){
					Log.warning(this + " - modifying private header: '" + sHeaderName + "' not allowed!");
				} else {
					mCheckedHeaders[sHeaderName] = sHeaderValue;
				}
			});
		}
		//The 'sap-cancel-on-close' header marks the OData request as cancelable. This helps to save resources at the back-end.
		return extend({'sap-cancel-on-close': !!bCancelOnClose}, this.mCustomHeaders, mCheckedHeaders, this.oHeaders);
	};

	/**
	 * Returns all headers and custom headers which are stored in this OData model.
	 *
	 * @return {object} The header map
	 * @public
	 */
	ODataModel.prototype.getHeaders = function() {
		return extend({}, this.mCustomHeaders, this.oHeaders);
	};

	/**
	 * Searches the specified headers map for the specified header name and returns the found header value
	 * @param {string} sHeader The header
	 * @param {Object<string,string>} mHeaders The map of headers
	 * @returns {string} The value of the header
	 */
	ODataModel.prototype._getHeader = function(sHeader, mHeaders) {
		var sHeaderName;
		for (sHeaderName in mHeaders) {
			if (sHeaderName.toLowerCase() === sHeader.toLowerCase()) {
				return mHeaders[sHeaderName];
			}
		}
		return null;
	};

	/**
	 * Checks if there exist pending changes in the model.
	 *
	 * By default, only client data changes triggered through {@link #createEntry} or
	 * {@link #setProperty}, and tree hierarchy changes are taken into account.
	 *
	 * If <code>bAll</code> is set to <code>true</code>, also deferred requests triggered through
	 * {@link #create}, {@link #update}, and {@link #remove} are taken into account.
	 *
	 * @param {boolean}[bAll=false] If set to true, deferred requests are also taken into account.
	 * @returns {boolean} <code>true</code> if there are pending changes, <code>false</code> otherwise.
	 *
	 * @public
	 * @see #getPendingChanges
	 * @see #resetChanges
	 */
	ODataModel.prototype.hasPendingChanges = function(bAll) {
		var bChangedEntities,
			aChangedEntityKeys = Object.keys(this.mChangedEntities);

		bChangedEntities = this.getBindings().some(function (oBinding) {
			return oBinding._hasPendingChanges && oBinding._hasPendingChanges(aChangedEntityKeys);
		});
		bChangedEntities = bChangedEntities || aChangedEntityKeys.length > 0;

		if (!bChangedEntities && bAll) {
			bChangedEntities = this.iPendingDeferredRequests > 0;
		}

		return bChangedEntities;
	};

	/**
	 * Checks if there are pending requests, either ongoing or sequential.
	 * @return {boolean} Whether there are pending requests
	 * @public
	 */
	ODataModel.prototype.hasPendingRequests = function() {
		return this.aPendingRequestHandles.length > 0;
	};

	/**
	 * Returns the pending changes in this model.
	 *
	 * Only changes triggered through {@link #createEntry} or {@link #setProperty}, and tree hierarchy changes are
	 * taken into account. Changes are returned as a map from the changed entity's key to an object containing the
	 * changed properties. A node removed from a tree hierarchy has the empty object as value in this map; all other
	 * pending entity deletions are not contained in the map.
	 *
	 * @returns {Object<string,object>} The map of pending changes
	 *
	 * @public
	 * @see #hasPendingChanges
	 * @see #resetChanges
	 */
	ODataModel.prototype.getPendingChanges = function() {
		var sChangedEntityKey,
			mChangedEntities = _Helper.merge({}, this.mChangedEntities);

		this.getBindings().forEach(function (oBinding) {
			if (oBinding._getPendingChanges) {
				_Helper.merge(mChangedEntities, oBinding._getPendingChanges());
			}
		});
		for (sChangedEntityKey in mChangedEntities) {
			if (!mChangedEntities[sChangedEntityKey]) {
				delete mChangedEntities[sChangedEntityKey];
			}
		}

		return mChangedEntities;
	};

	/**
	 * Update all bindings.
	 *
	 * @param {boolean} [bForceUpdate=false] If set to <code>false</code>, an update will only be done when the value of a binding changed.
	 * @public
	 */
	ODataModel.prototype.updateBindings = function(bForceUpdate) {
		this.checkUpdate(bForceUpdate);
	};

	/**
	 * Enable/Disable security token handling.
	 * @param {boolean} [bTokenHandling=true] Whether to use token handling or not
	 * @public
	 */
	ODataModel.prototype.setTokenHandlingEnabled  = function(bTokenHandling) {
		this.bTokenHandling = bTokenHandling;
	};

	/**
	 * Enable or disable batch mode for future requests.
	 *
	 * @param {boolean} [bUseBatch=false] Whether the requests should be encapsulated in a batch request
	 * @public
	 */
	ODataModel.prototype.setUseBatch  = function(bUseBatch) {
		this.bUseBatch = bUseBatch;
	};

	/**
	 * Formats a JavaScript value according to the given
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * EDM type</a>.
	 *
	 * @param {any} vValue The value to format
	 * @param {string} sType The EDM type (e.g. Edm.Decimal)
	 * @return {string} The formatted value
	 */
	ODataModel.prototype.formatValue = function(vValue, sType) {
		return ODataUtils.formatValue(vValue, sType);
	};

	/**
	 * Creates a new entry object which is described by the metadata of the entity type of the
	 * specified <code>sPath</code> Name. A context object is returned which can be used to bind
	 * against the newly created object. See
	 * {@link topic:6c47b2b39db9404582994070ec3d57a2#loio4c4cd99af9b14e08bb72470cc7cabff4 Creating
	 * Entities documentation} for comprehensive information on the topic.
	 *
	 * For each created entry a request is created and stored in a request queue.
	 * The request queue can be submitted by calling {@link #submitChanges}. As long as the context
	 * is transient (see {@link sap.ui.model.odata.v2.Context#isTransient}),
	 * {@link sap.ui.model.odata.v2.ODataModel#resetChanges} with the
	 * <code>bDeleteCreatedEntities</code> parameter set to <code>true</code> can be used to delete
	 * the created entity again.
	 *
	 * If the creation of the entity on the server failed, it is repeated automatically.
	 *
	 * The optional parameter <code>mParameters.properties</code> can be used as follows:
	 * <ul>
	 *   <li><code>properties</code> could be an array containing the property names which should be
	 *     included in the new entry. Other properties defined in the entity type won't be included.
	 *   </li>
	 *   <li><code>properties</code> could be an object which includes the desired properties and
	 *     the corresponding values which should be used for the created entry. </li>
	 * </ul>
	 * If <code>properties</code> is not specified, all properties in the entity type will be
	 * included in the created entry.
	 *
	 * If there are no values specified, the properties will have <code>undefined</code> values.
	 *
	 * The <code>properties</code> can be modified via property bindings relative to the returned
	 * context instance.
	 *
	 * The parameter <code>expand</code> is supported since 1.78.0. If this parameter is set, the
	 * given navigation properties are expanded automatically with the same $batch request in which
	 * the POST request for the creation is contained. Ensure that the batch mode is used and the
	 * back-end service supports GET requests relative to a content ID outside the changeset.
	 * The success and error callback functions are called only once, even if there are two requests
	 * in the <code>$batch</code> related to a single call of {@link #createEntry}:
	 * <ul>
	 *   <li>a POST request for creating an entity,</li>
	 *   <li>a GET request for requesting the navigation properties for the just created entity.
	 *   </li>
	 * </ul>
	 * The following outcomes are possible:
	 * <ul>
	 *   <li>If both requests succeed, the success handler is called with the merged data of the
	 *     POST and the GET request and with the response of the POST request.</li>
	 *   <li>If the POST request fails, the GET request also fails. In that case the error callback
	 *     handler is called with the error response of the POST request.</li>
	 *   <li>If the POST request succeeds but the GET request for the navigation properties fails,
	 *     the success handler is called with the data and the response of the POST request. The
	 *     response object of the success handler call and the response parameter of the
	 *     corresponding <code>requestFailed</code> and <code>requestCompleted</code> events have an
	 *     additional property <code>expandAfterCreateFailed</code> set to <code>true</code>.
	 *   </li>
	 * </ul>
	 *
	 * Note: If a server requires a property in the request, you must supply this property in the
	 * initial data, for example if the server requires a unit for an amount. This also applies if
	 * this property has a default value.
	 *
	 * Note: Deep create is only supported since 1.108.0, where "deep create" means creation of a
	 * sub-entity for a navigation property of a transient, not yet persisted root entity. Before
	 * 1.108.0, the sub-entity had to be created after the transient entity had been saved
	 * successfully in the back-end system. Since 1.108.0, a deep create is triggered when
	 * the <code>sPath</code> parameter is a navigation property for the entity type associated with
	 * the transient context given in <code>mParameters.context</code>. The payload of the OData
	 * request to create the root entity then contains its sub-entities. On creation of a
	 * sub-entity, only the <code>sPath</code>, <code>mParameters.context</code> and
	 * <code>mParameters.properties</code> method parameters are allowed;
	 * the context given in <code>mParameters.context</code> must not be inactive.
	 *
	 * @param {string} sPath
	 *   The path to the EntitySet
	 * @param {object} mParameters
	 *   A map of the following parameters:
	 * @param {string} [mParameters.batchGroupId]
	 *   Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.changeSetId]
	 *   The ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {sap.ui.model.Context} [mParameters.context]
	 *   The binding context
	 * @param {function} [mParameters.created]
	 *   The callback function that is called after the metadata of the service is loaded and the
	 *   {@link sap.ui.model.odata.v2.Context} instance for the newly created entry is available;
	 *   The {@link sap.ui.model.odata.v2.Context} instance for the newly created entry is passed as
	 *   the first and only parameter.
	 * @param {function} [mParameters.error]
	 *   The error callback function
	 * @param {string} [mParameters.expand]
	 *   A comma-separated list of navigation properties to be expanded for the newly created
	 *   entity; since 1.78.0.<br />
	 *   The navigation properties are requested with an additional GET request in the same
	 *   <code>$batch</code> request as the POST request for the entity creation; the given
	 *   <code>mParameters.headers</code> are not considered in the GET request.<br />
	 *   <strong>Note:</strong> The following prerequisites must be fulfilled:
	 *   <ul>
	 *     <li>batch mode must be enabled; see constructor parameter <code>useBatch</code>,</li>
	 *     <li>the back-end service must support the "Content-ID" header,</li>
	 *     <li>the back end must allow GET requests relative to this content ID outside the
	 *       changeset within the <code>$batch</code> request.</li>
	 *   </ul>
	 * @param {string} [mParameters.groupId]
	 *   The ID of a request group; requests belonging to the same group will be bundled in one
	 *   batch request
	 * @param {Object<string,string>} [mParameters.headers]
	 *   A map of headers
	 * @param {boolean} [mParameters.inactive]
	 *   Whether the created context is inactive. An inactive context will only be sent to the
	 *   server after the first property update. From then on it behaves like any other created
	 *   context. Supported since 1.98.0
	 * @param {object|string[]} [mParameters.properties]
	 *   The initial values of the entry, or an array that specifies a list of property names to be
	 *   initialized with <code>undefined</code>; <b>Note:</b> Passing a list of property names is
	 *   deprecated since 1.120; pass the initial values as an object instead
	 * @param {boolean} [mParameters.refreshAfterChange]
	 *   Whether to update all bindings after submitting this change operation, see
	 *   {@link #setRefreshAfterChange}; if given, this overrules the model-wide
	 *   <code>refreshAfterChange</code> flag for this operation only; since 1.46
	 * @param {function} [mParameters.success]
	 *   The success callback function
	 * @param {Object<string,string>} [mParameters.urlParameters]
	 *   A map of URL parameters
	 *
	 * @return {sap.ui.model.odata.v2.Context|undefined}
	 *   An OData V2 context object that points to the newly created entry; or
	 *   <code>undefined</code> if the service metadata are not yet loaded or if a
	 *   <code>created</code> callback parameter is given
	 * @throws {Error}
	 *   If:
	 *   <ul>
	 *     <li>The <code>expand</code> parameter is used but the batch mode is disabled, or
	 *     <li>in the case of a deep create:
	 *     <ul>
	 *       <li>If an unsupported parameter is used, or
	 *       <li>the <code>sPath</code> parameter is either no navigation property or a navigation
	 *         property with single cardinality for the entity type associated with the given
	 *         <code>mParameters.context</code>, or
	 *       <li><code>mParameters.context</code> is inactive.
	 *     </ul>
	 *   </ul>
	 *
	 * @public
	 */
	ODataModel.prototype.createEntry = function (sPath, mParameters) {
		var bCanonical, sChangeSetId, oContext, fnCreated, pCreate, fnCreatedPromiseResolve,
			bDeepCreate, sDeepPath, oEntityMetadata, fnError, sExpand, sGroupId, mHeaders,
			bInactive, bIsCollection, sKey, sNormalizedPath, vProperties, bRefreshAfterChange,
			oRequest, mRequests, fnSuccess, sUrl, aUrlParams, mUrlParams,
			oEntity = {},
			sMethod = "POST",
			that = this;

		function addEntityToCacheAndCreateContext(oTransientParent) {
			sKey = that._addEntity(merge({}, oEntity));
			if (!bInactive) {
				that.mChangedEntities[sKey] = oEntity;
			}
			return that.getContext("/" + sKey, sDeepPath, pCreate, bInactive, oTransientParent);
		}

		function checkDeepCreatePreconditions() {
			var oSrcEntityType;

			if (bDeepCreate) {
				oSrcEntityType = that.oMetadata._getEntityTypeByPath(oContext.getPath());
				if (!that.oMetadata._getNavigationPropertyNames(oSrcEntityType).includes(sPath)) {
					throw new Error("Cannot create entity; path '" + sPath
						+ "' is not a navigation property of '" + oSrcEntityType.name + "'");
				}
				if (!bIsCollection) {
					throw new Error("Cannot create entity; deep create on navigation property '"
					+ sPath + "' with single cardinality is not supported");
				}
			}
		}

		function create() {
			var oCreateData, oCreatedContext, oCreateResponse, oEntitySetMetadata, sEntityType,
				sEntityUri, mExpandHeaders, oExpandRequest, oGroupInfo, oParentEntity,
				bTransitionMessagesOnly, sUID,
				bCreateFailed = false,
				fnErrorFromParameters = fnError,
				fnSuccessFromParameters = fnSuccess;

			bCanonical = that._isCanonicalRequestNeeded(bCanonical);
			mHeaders = Object.assign({}, mHeaders);
			aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
			if (!sPath.startsWith("/") && !oContext) {
				sPath = "/" + sPath;
			}
			sNormalizedPath = that._normalizePath(sPath, oContext, bCanonical);
			sDeepPath = that.resolveDeep(sPath, oContext);
			bIsCollection = that.oMetadata._isCollection(sDeepPath);
			checkDeepCreatePreconditions();
			oEntityMetadata = that.oMetadata._getEntityTypeByPath(sNormalizedPath);
			if (!oEntityMetadata) {
				assert(oEntityMetadata, "No Metadata for collection " + sNormalizedPath + " found");
				return undefined;
			}
			oEntity = bDeepCreate ? {} : that.getForeignKeysFromReferentialConstraints(sNormalizedPath);
			if (typeof vProperties === "object" && !Array.isArray(vProperties)) {
				oEntity = merge(oEntity, vProperties);
			}
			sEntityType = oEntityMetadata.entityType;
			oEntitySetMetadata = that.oMetadata._getEntitySetByType(oEntityMetadata);
			sUID = uid();
			sKey = oEntitySetMetadata.name + "('" + sUID + "')";
			sEntityUri = that.sServiceUrl + '/' + sKey;
			if (bIsCollection) {
				sDeepPath = sDeepPath + "('" + sUID + "')";
			}
			if (bDeepCreate) {
				oParentEntity = that._getObject(oContext.getPath());
				sChangeSetId = oParentEntity.__metadata.created.changeSetId;
				sGroupId = oParentEntity.__metadata.created.groupId;
				oEntity.__metadata = {
					type : sEntityType,
					uri : sEntityUri,
					created : {
						changeSetId : sChangeSetId,
						groupId : sGroupId
					}
				};
				oCreatedContext = addEntityToCacheAndCreateContext(oContext);
				oContext.addSubContext(sPath, oCreatedContext, bIsCollection);

				return oCreatedContext;
			}
			if (sExpand) {
				mHeaders["Content-ID"] = sUID;
				fnSuccess = function (oData, oCreateResponse0) {
					if (!oCreateData) {
						// successful POST, wait for GET
						oCreateData = oData;
						oCreateResponse = oCreateResponse0;
						return;
					}
					// successful GET after successful POST -> call success handler with merged data
					// successful GET after a failed POST cannot occur
					if (fnSuccessFromParameters) {
						oData = Object.assign({}, oCreateData, oData);
						fnSuccessFromParameters(oData, oCreateResponse);
					}
					fnCreatedPromiseResolve();
				};
				fnError = function (oError) {
					if (oCreateData) {
						// failed GET after successful POST -> call success handler with the data of
						// the POST request and mark the response with expandAfterCreateFailed=true
						oCreateResponse.expandAfterCreateFailed = true;
						oError.expandAfterCreateFailed = true;
						Log.error("Entity creation was successful but expansion of navigation"
							+ " properties failed", oError, sClassName);
						if (fnSuccessFromParameters) {
							fnSuccessFromParameters(oCreateData, oCreateResponse);
						}
						fnCreatedPromiseResolve();

						return;
					}
					if (!bCreateFailed) {
						// failed POST -> remember to skip the following failed GET and call the
						// error handler
						bCreateFailed = true;
						if (fnErrorFromParameters) {
							fnErrorFromParameters(oError);
						}
					} else {
						// failed GET after a failed POST -> mark the error response with
						// expandAfterCreateFailed=true that it can be passed to requestFailed and
						// requestCompleted event handlers
						oError.expandAfterCreateFailed = true;
						// reset flag, handlers may be called again when retrying the create
						bCreateFailed = false;
					}
				};
			} else {
				fnSuccess = function (oData, oCreateResponse) {
					if (fnSuccessFromParameters) {
						fnSuccessFromParameters(oData, oCreateResponse);
					}
					fnCreatedPromiseResolve();
				};
			}
			// fallback to groups as defined in mChangeGroups; using path is OK as we don't have an
			// entity yet and the entity type can be derived from the path to determine the group ID
			oGroupInfo = that._resolveGroup(sNormalizedPath);
			sGroupId = sGroupId || oGroupInfo.groupId;
			sChangeSetId = sChangeSetId || oGroupInfo.changeSetId;
			bRefreshAfterChange = that._getRefreshAfterChange(bRefreshAfterChange, sGroupId);
			bTransitionMessagesOnly = that._isTransitionMessagesOnly(sGroupId);
			if (bTransitionMessagesOnly || sExpand) {
				mHeaders["sap-messages"] = "transientOnly";
			}
			oEntity.__metadata = {
				type : sEntityType,
				uri : sEntityUri,
				created : {
					changeSetId : sChangeSetId,
					error : fnError,
					groupId : sGroupId,
					headers : mHeaders,
					key : sNormalizedPath.substring(1), //store path for later POST
					refreshAfterChange : bRefreshAfterChange,
					success : fnSuccess,
					urlParameters : mUrlParams
				},
				deepPath : sDeepPath
			};
			pCreate = new SyncPromise(function (resolve, reject) {
				fnCreatedPromiseResolve = function () {
					if (!that.oCreatedContextsCache.getCacheInfo(oCreatedContext)) {
						// If ODataModel#createEntry is called by ODataListBinding#create, the
						// created context is added to the created contexts cache and has to keep
						// the create promise until the context gets removed from the cache, see
						// sap.ui.model.odata.v2._CreatedContextsCache#removePersistedContexts.
						// If the context is not in the cache ODataModel#createEntry has been called
						// directly and the create promise has to be reset after successful
						// creation.
						oCreatedContext.resetCreatedPromise();
					}
					if (oCreatedContext.hasSubContexts()) {
						// _processSuccess already removes this entity change, therefore one must
						// not call resetChanges with oCreatedContext.getPath()
						that.resetChanges(oCreatedContext.getSubContextsAsPath(), undefined, true);
					}
					resolve();
				};
				oEntity.__metadata.created.abort = reject;
			});
			pCreate.catch(function () {
				// avoid uncaught in promise if the caller of #createEntry does not use the promise
			});
			oCreatedContext = addEntityToCacheAndCreateContext();
			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oEntity);

			if (sExpand) {
				mExpandHeaders = that._getHeaders(undefined, true);
				if (bTransitionMessagesOnly) {
					mExpandHeaders["sap-messages"] = "transientOnly";
				}
				oExpandRequest = that._createRequest("$" + sUID + "?"
						+ ODataUtils._encodeURLParameters({$expand : sExpand, $select : sExpand}),
					"/$" + sUID, "GET", mExpandHeaders, null, undefined, undefined, true);
				oExpandRequest.contentID = sUID;
				oRequest.expandRequest = oExpandRequest;
				oRequest.contentID = sUID;
				oEntity.__metadata.created.expandRequest = oExpandRequest;
				oEntity.__metadata.created.contentID = sUID;
			}

			oRequest.key = sKey;
			oRequest.created = true;

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}

			that.oMetadata.loaded().then(function () {
				oCreatedContext.fetchActivated().then(function () {
					var oRequestHandle = {
							abort: function() {
								if (oRequest) {
									oRequest._aborted = true;
									if (oRequest.expandRequest) {
										oRequest.expandRequest._aborted = true;
									}
								}
							}
						};
					that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess,
						fnError, oRequestHandle, bRefreshAfterChange);
					that._processRequestQueueAsync(that.mRequests);
				});
			});

			return oCreatedContext;
		}

		if (mParameters) {
			vProperties = mParameters.properties;
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			fnCreated = mParameters.created;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
			bRefreshAfterChange = mParameters.refreshAfterChange;
			bCanonical = mParameters.canonicalRequest;
			sExpand = mParameters.expand;
			bInactive = mParameters.inactive;
		}
		if (sExpand && !this.bUseBatch) {
			throw new Error("The 'expand' parameter is only supported if batch mode is used");
		}

		bDeepCreate = oContext && oContext.isTransient && oContext.isTransient();
		if (bDeepCreate) {
			Object.keys(mParameters).forEach(function (sParameterKey) {
				if (!aDeepCreateParametersAllowlist.includes(sParameterKey)) {
					throw new Error("deep create, unsupported parameter: " + sParameterKey);
				}
			});
			if (oContext.isInactive()) {
				throw new Error("deep create, context must not be inactive");
			}
		}

		// If no callback function is provided context must be returned synchronously
		if (fnCreated) {
			this.oMetadata.loaded().then(function() {
				fnCreated(create());
			});
		} else if (this.oMetadata.isLoaded()) {
			return create();
		} else {
			Log.error("Tried to use createEntry without created-callback, before metadata is "
				+ "available!");
		}

		return undefined;
	};

	/**
	 * Gets an object with the values for the foreign keys defined by referential constraints for the given path.
	 *
	 * @param {string} sNormalizedPath
	 *   The absolute normalized path to create an entity, see {@link #_normalizePath}
	 * @returns {Object<string, any>}
	 *   An object containing the values from the parent entity for the properties defined in the association's
	 *   referential constraints; if there are no referential constraints defined an empty object is returned
	 * @private
	 */
	ODataModel.prototype.getForeignKeysFromReferentialConstraints = function (sNormalizedPath) {
		const mSplitPath = this.oMetadata._splitByLastNavigationProperty(sNormalizedPath);

		if (mSplitPath.lastNavigationProperty) {
			// check referential constraints
			const oParentEntityType = this.oMetadata._getEntityTypeByName(mSplitPath.pathBeforeLastNavigationProperty);
			const mSource2TargetProperty = this.oMetadata._getReferentialConstraintsMapping(oParentEntityType,
				mSplitPath.lastNavigationProperty.slice(1));
			const oData = this._getObject(mSplitPath.pathBeforeLastNavigationProperty);
			if (oData) {
				return Object.keys(mSource2TargetProperty).reduce((oResult, sSourcePropertyName) => {
					if (oData[sSourcePropertyName]) {
						oResult[mSource2TargetProperty[sSourcePropertyName]] = oData[sSourcePropertyName];
					}
					return oResult;
				}, {});
			}
		}
		return {};
	};
	/**
	 * Returns whether the given entity has been created using createEntry.
	 * @param {object} oEntity The entity to check
	 * @returns {boolean} Returns whether the entity is created
	 * @private
	 */
	ODataModel.prototype._isCreatedEntity = function(oEntity) {
		return !!(oEntity && oEntity.__metadata && oEntity.__metadata.created);
	};

	/**
	 * Remove URL params from path and make path absolute if not already
	 *
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @param {boolean} bCanonical Whether the binding path should be resolved canonical or not
	 * @returns {string} The resolved path
	 * @private
	 */
	ODataModel.prototype._normalizePath = function(sPath, oContext, bCanonical) {
		// remove query params from path if any
		if (sPath && sPath.indexOf('?') !== -1 ) {
			sPath = sPath.substr(0, sPath.indexOf('?'));
		}
		if (!oContext && !sPath.startsWith("/")) {
			Log.fatal(this + " path " + sPath + " must be absolute if no Context is set");
		}
		return this.resolve(sPath, oContext, bCanonical) || this.resolve(sPath, oContext);
	};

	/**
	 * Whether all affected bindings are refreshed after a change operation.
	 *
	 * This flag can be overruled on request level by providing the <code>refreshAfterChange</code>
	 * parameter to the corresponding function (for example {@link #update}).
	 *
	 * @returns {boolean} Whether to automatically refresh after changes
	 * @public
	 * @since 1.46.0
	 */
	ODataModel.prototype.getRefreshAfterChange = function () {
		return this.bRefreshAfterChange;
	};

	/**
	 * Defines whether all affected bindings are refreshed after a change operation.
	 *
	 * This flag can be overruled on request level by providing the <code>refreshAfterChange</code>
	 * parameter to the corresponding function (for example {@link #update}).
	 *
	 * @param {boolean} bRefreshAfterChange Whether to automatically refresh after changes
	 * @public
	 * @since 1.16.3
	 */
	ODataModel.prototype.setRefreshAfterChange = function (bRefreshAfterChange) {
		this.bRefreshAfterChange = bRefreshAfterChange;
	};

	/**
	 * The error object passed to the retry after callback.
	 *
	 * @typedef {Error} module:sap/ui/model/odata/v2/RetryAfterError
	 *
	 * @property {string} message Error message returned by the 503 HTTP status response
	 * @property {Date} retryAfter The earliest point in time the request may be repeated
	 *
	 * @private
	 * @ui5-restricted sap.suite.ui.generic.template
	 * @since 1.127.0
	 */

	/**
	 * Sets a "Retry-After" handler, which is called when an OData request fails with HTTP status
	 * 503 (Service Unavailable) and the response has a "Retry-After" header.
	 *
	 * The handler is called with an <code>Error</code> having a property <code>retryAfter</code> of
	 * type <code>Date</code>, which is the earliest point in time when the request should be
	 * repeated. The handler has to return a promise. With this promise, you can control the
	 * repetition of all pending requests including the failed HTTP request. If the promise is
	 * resolved, the requests are repeated; if it is rejected, the requests are not repeated. If it
	 * is rejected with the same <code>Error</code> reason as previously passed to the handler, then
	 * this reason is reported to the message model.
	 *
	 * @param {function(module:sap/ui/model/odata/v2/RetryAfterError):Promise<undefined>} fnRetryAfter
	 *   A "Retry-After" handler
	 *
	 * @private
	 * @ui5-restricted sap.suite.ui.generic.template
	 * @since 1.127.0
	 */
	ODataModel.prototype.setRetryAfterHandler = function (fnRetryAfter) {
		this.fnRetryAfter = fnRetryAfter;
	};

	/**
	 * Checks if the given path points to a list or to a single entry
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @returns {boolean} Whether path points to a list
	 * @private
	 */
	ODataModel.prototype.isList = function(sPath, oContext) {
		sPath = this.resolve(sPath, oContext);
		return sPath && sPath.substr(sPath.lastIndexOf("/")).indexOf("(") === -1;
	};

	/**
	 * Determines if a given binding path is a metadata path
	 *
	 * @param {string} sPath Resolved binding path
	 * @returns {boolean} bIsMetadataPath True if binding path is a metadata path starting with '/#'
	 *
	 */
	ODataModel.prototype._isMetadataPath = function(sPath) {
		var bIsMetadataPath = false;
		if (sPath && sPath.indexOf('/#') > -1)  {
			bIsMetadataPath = true;
		}
		return bIsMetadataPath;
	};

	/**
	 * Checks if path points to a metamodel property.
	 *
	 * @param {string} sPath The binding path
	 * @returns {boolean} Whether path points to a metamodel property
	 * @private
	 */
	ODataModel.prototype.isMetaModelPath = function(sPath) {
		return sPath.indexOf("##") == 0 || sPath.indexOf("/##") > -1;
	};

	/**
	 * Wraps the OData.request method and keeps track of pending requests.
	 *
	 * @param {object} oRequest The request object
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Error callback function
	 * @param {object} oHandler The request handler object
	 * @param {object} oHttpClient The HttpClient object
	 * @param {object} oMetadata The metadata object
	 * @returns {object} The request handle
	 * @private
	 */
	ODataModel.prototype._request = function(oRequest, fnSuccess, fnError, oHandler, oHttpClient, oMetadata) {
		var oRequestHandle;

		if (this.bDestroyed) {
			return {
				abort: function() {}
			};
		}

		var that = this;

		function wrapHandler(fn) {
			return function() {
				// request finished, remove request handle from pending request array
				if (that.aPendingRequestHandles){
					var iIndex = that.aPendingRequestHandles.indexOf(oRequestHandle);
					if (iIndex > -1) {
						that.aPendingRequestHandles.splice(iIndex, 1);
					}
				}

				// call original handler method
				if (!(oRequestHandle && oRequestHandle.bSuppressErrorHandlerCall)) {
					fn.apply(this, arguments);
				}
			};
		}

		// create request with wrapped handlers
		oRequestHandle = OData.request(
				oRequest,
				wrapHandler(fnSuccess || OData.defaultSuccess),
				wrapHandler(fnError || OData.defaultError),
				oHandler,
				oHttpClient,
				oMetadata
		);

		// add request handle to array and return it (only for async requests)
		if (oRequest.async !== false) {
			this.aPendingRequestHandles.push(oRequestHandle);
		}

		return oRequestHandle;
	};

	/**
	 * @see sap.ui.model.Model.prototype.destroy
	 * @public
	 */
	ODataModel.prototype.destroy = function() {
		this.bDestroyed = true;

		Model.prototype.destroy.apply(this, arguments);

		// Abort pending requests
		if (this.aPendingRequestHandles) {
			for (var i = this.aPendingRequestHandles.length - 1; i >= 0; i--) {
				var oRequestHandle = this.aPendingRequestHandles[i];
				if (oRequestHandle && oRequestHandle.abort) {
					oRequestHandle.bSuppressErrorHandlerCall = true;
					oRequestHandle.abort();
				}
			}
			delete this.aPendingRequestHandles;
		}
		if (this.sMetadataLoadEvent) {
			clearTimeout(this.sMetadataLoadEvent);
		}
		if (this.oMetadataFailedEvent) {
			clearTimeout(this.oMetadataFailedEvent);
		}

		if (this.oMetadata) {
			this.oMetadata.detachFailed(this.onMetadataFailed);
			// Only destroy metadata, if request is still running and no other models
			// are registered to it
			if (!this.oMetadata.isLoaded() && !this.oMetadata.hasListeners("loaded")) {
				this.oMetadata.destroy();
				delete this.oSharedMetaData.oMetadata;
			}
			delete this.oMetadata;
			delete this.pMetadataLoaded;
		}

		if (this.oMetaModel) {
			this.oMetaModel.destroy();
			delete this.oMetaModel;
		}

		if (this.oAnnotations) {
			this.oAnnotations.detachSomeLoaded(this.onAnnotationsLoaded);
			this.oAnnotations.detachAllFailed(this.onAnnotationsFailed);

			this.oAnnotations.destroy();
			delete this.oAnnotations;
			delete this.pAnnotationsLoaded;
		}

		if (this.oMessageParser) {
			this.oMessageParser.destroy();
			delete this.oMessageParser;
		}
	};

	/**
	 * Setting request groups as deferred. <b>Note:</b> This will overwrite existing deferred
	 * groups, including the default deferred group "changes".
	 *
	 * Requests that belong to a deferred group will be sent by explicitly calling
	 * {@link #submitChanges}.
	 *
	 * @param {array} aGroupIds The array of deferred group IDs; the default is: <code>["changes"]</code>
	 * @public
	 */
	ODataModel.prototype.setDeferredGroups = function(aGroupIds) {
		var that = this;
		this.mDeferredGroups = {};
		each(aGroupIds, function(iIndex,sGroupId){
			that.mDeferredGroups[sGroupId] = sGroupId;
		});
	};

	/**
	 * Returns the array of group IDs that are set as deferred.
	 *
	 * @returns {array} aGroupIds The array of deferred group IDs
	 * @public
	 */
	ODataModel.prototype.getDeferredGroups = function() {
		return Object.keys(this.mDeferredGroups);
	};

	/**
	 * Definition of groups per entity type for two-way binding changes. <b>Note:</b> This will overwrite the existing
	 * change group definition, including the default <code>{"*":{groupId: "changes"}}</code>.
	 *
	 * @param {Object<string,sap.ui.model.odata.v2.ODataModel.ChangeGroupDefinition>} mGroups
	 *   Maps an entity name to the definition of the batch group for two-way binding changes; use "*" as entity name to
	 *   define a default for all entities not contained in the map
	 * @public
	 */
	ODataModel.prototype.setChangeGroups = function(mGroups) {
		this.mChangeGroups = mGroups;
	};

	/**
	 * Returns the definition of groups per entity type for two-way binding changes
	 * @returns {Object<string,sap.ui.model.odata.v2.ODataModel.ChangeGroupDefinition>}
	 *   Definition of groups for two-way binding changes, keyed by entity names.
	 * @public
	 */
	ODataModel.prototype.getChangeGroups = function() {
		return this.mChangeGroups;
	};

	/**
	 * Sets the {@link sap.ui.core.message.MessageParser} that is invoked upon every back-end request.
	 *
	 * This message parser analyzes the response and notifies {@link module:sap/ui/core/Messaging} about added and deleted messages.
	 *
	 * @param {object|null} [oParser] The {@link sap.ui.core.message.MessageParser} instance that parses the responses and adds messages to {@link module:sap/ui/core/Messaging}
	 * @return {this} Model instance for method chaining
	 */
	ODataModel.prototype.setMessageParser = function(oParser) {
		if (!(oParser instanceof MessageParser)) {
			Log.error("Given MessageParser is not of type sap.ui.core.message.MessageParser");
			return this;
		}
		oParser.setProcessor(this);
		this.oMessageParser = oParser;
		return this;
	};

	/**
	 * Gives the back-end response to the <code>MessageParser</code> in case there is one attached.
	 *
	 * @param {object} oResponse The response
	 * @param {object} oRequest The request
	 * @param {object} mGetEntities New entities from the response
	 * @param {object} mChangeEntities Changed entities from the response
	 *
	 * @private
	 */
	ODataModel.prototype._parseResponse = function(oResponse, oRequest, mGetEntities,
			mChangeEntities) {
		try {
			if (!this.oMessageParser) {
				this.oMessageParser = new ODataMessageParser(this.sServiceUrl, this.oMetadata,
					!!this.bPersistTechnicalMessages);
				this.oMessageParser.setProcessor(this);
			}
			// Parse response and delegate messages to the set message parser
			this.oMessageParser.parse(oResponse, oRequest, mGetEntities, mChangeEntities,
				this.bIsMessageScopeSupported);
		} catch (ex) {
			Log.error("Error parsing OData messages: " + ex);
		}
	};

	/**
	 * Register function calls that should be called after an update (e.g. calling <code>dataReceived</code> event of a binding)
	 * @param {function} oFunction The callback function
	 * @private
	 */
	ODataModel.prototype.callAfterUpdate = function(oFunction) {
		this.aCallAfterUpdate.push(oFunction);
	};

	/**
	 * Returns an instance of an OData meta model which offers a unified access to both OData V2
	 * metadata and V4 annotations. It uses the existing {@link sap.ui.model.odata.ODataMetadata}
	 * as a foundation and merges V4 annotations from the existing
	 * {@link sap.ui.model.odata.v2.ODataAnnotations} directly into the corresponding model element.
	 *
	 * <b>BEWARE:</b> Access to this OData meta model will fail before the promise returned by
	 * {@link sap.ui.model.odata.ODataMetaModel#loaded loaded} has been resolved!
	 *
	 * @public
	 * @returns {sap.ui.model.odata.ODataMetaModel} The meta model for this <code>ODataModel</code>
	 */
	ODataModel.prototype.getMetaModel = function() {
		var that = this;
		if (!this.oMetaModel) {
			this.oMetaModel = new ODataMetaModel(this.oMetadata, this.oAnnotations, this);
			// Call checkUpdate when metamodel has been loaded to update metamodel bindings
			this.oMetaModel.loaded().then(function() {
				that.bMetaModelLoaded = true;
				// Update metamodel bindings only
				that.checkUpdate(false, false, null, true);
			}, function (oError) {
				var sMessage = oError.message,
					sDetails;

				if (!sMessage && oError.xmlDoc && oError.xmlDoc.parseError) {
					sMessage = oError.xmlDoc.parseError.reason;
					sDetails = oError.xmlDoc.parseError.srcText;
				}
				Log.error("error in ODataMetaModel.loaded(): " + sMessage, sDetails, sClassName);
			});
		}
		return this.oMetaModel;
	};

	/**
	 * Returns the original value for the property with the given path and context.
	 * The original value is the value that was last responded by the server.
	 *
	 * @param {string} sPath The path/name of the property
	 * @param {object} [oContext] The context if available to access the property value
	 * @returns {any} the value of the property
	 * @public
	 */
	ODataModel.prototype.getOriginalProperty = function(sPath, oContext) {
		return this._getObject(sPath, oContext, true);
	};

	/**
	 * Returns the nearest entity of a path relative to the given context.
	 *
	 * Additional entity information will be passed back to the given <code>oEntityInfo</code> object if
	 * a nearest entity exists.
	 *
	 * @param {string} sPath path to an entity
	 * @param {sap.ui.model.Context} [oContext] Context to resolve a relative path against
	 * @param {object} [oEntityInfo] Object that will receive information about the nearest entity
	 * @param {string} [oEntityInfo.key] The key of the entity
	 * @param {string} [oEntityInfo.propertyPath] The property path within the entity
	 * @return {object} The nearest entity object or <code>null</code> if no entity can be resolved
	 */
	ODataModel.prototype.getEntityByPath = function(sPath, oContext, oEntityInfo) {
		var sKey,
			sResolvedPath = Model.prototype.resolve.call(this,sPath, oContext);

		if (!sResolvedPath) {
			return null;
		}
		var aParts = sResolvedPath.split("/"),
			oEntity = null,
			aPropertyPath = [];
		while (aParts.length > 0)  {
			var sEntryPath = aParts.join("/"),
				oObject = this._getObject(sEntryPath);
			if (isPlainObject(oObject)) {
				sKey = this._getKey(oObject);
				if (sKey) {
					oEntity = oObject;
					break;
				}
			}
			aPropertyPath.unshift(aParts.pop());
		}
		if (oEntity) {
			oEntityInfo.propertyPath = aPropertyPath.join("/");
			oEntityInfo.key = sKey;
			return oEntity;
		}
		return null;
	};

	/**
	 * Check canonical path cache for possible shorter representations of the given path.
	 *
	 * @param {string} sPath Path, which is checked.
	 * @return {string|undefined} A shorter path or undefined.
	 *
	 * @example
	 * sPath = a(1)/b(2)/toC/ToD
	 * 1. Try to match this path.
	 * 2. If no matching cache entry was found, iteratively try to match the path shorten by one segment:
	 *  a) a(1)/b(2)/toC
	 *  b) a(1)/b(2)
	 * 	...
	 * 3. If a matching cache entry was found, recursively check also this new path for shorter matches.
	 *  E.g. following entry found in cache: "a(1)/b(2)" => "f(123)"
	 *	a) f(123)/toC/ToD
	 *  b) f(123)/toC
	 * 	...
	 * @private
	 */

	ODataModel.prototype.resolveFromCache = function(sPath){
		if (!this.mPathCache){
			return undefined;
		}

		var sStartingPath,
			sEndingPathPart = "",
			sCanonicalPath,
			sNextMatch,
			iIndex;

		sCanonicalPath = this.mPathCache[sPath] ? this.mPathCache[sPath].canonicalPath : undefined;
		if (sPath && sCanonicalPath !== sPath) {
			sStartingPath = sCanonicalPath || sPath;
			if (!sCanonicalPath) {
				iIndex = sStartingPath.lastIndexOf("/");
				sEndingPathPart = sStartingPath.substr(iIndex);
				sStartingPath = sStartingPath.substr(0, iIndex);
			}
			sNextMatch = this.resolveFromCache(sStartingPath);

			if (sNextMatch && sNextMatch !== sStartingPath) {
				sCanonicalPath = sNextMatch + sEndingPathPart;
			}
		}
		return sCanonicalPath;
	};

	/**
	 * Resolve the path relative to the given context.
	 *
	 * In addition to {@link sap.ui.model.Model#resolve resolve} a
	 * canonical path can be resolved that will not contain navigation properties.
	 *
	 * @param {string} sPath Path to resolve
	 * @param {sap.ui.model.Context} [oContext] Context to resolve a relative path against
	 * @param {boolean} [bCanonical] If true the canonical path is returned
	 * @return {string} Resolved path, canonical path or undefined
	 */
	ODataModel.prototype.resolve = function(sPath, oContext, bCanonical) {
		var sResolvedPath = Model.prototype.resolve.call(this, sPath, oContext);

		if (sResolvedPath && !this._isMetadataPath(sResolvedPath) && bCanonical) {
			var sCanonicalPath = this.resolveFromCache(sResolvedPath);
			if (!sCanonicalPath){
				//Use metadata to calc canonical path
				sCanonicalPath = this.oMetadata._calculateCanonicalPath(sResolvedPath);
				sCanonicalPath = this.resolveFromCache(sCanonicalPath) || sCanonicalPath;
			}

			this._writePathCache(sResolvedPath, sCanonicalPath);
			return sCanonicalPath;
		}
		return sResolvedPath;
	};

	/**
	 * Resolve the path relative to the given context. If the context contains a parent path
	 * (deepPath), we resolve with this deepPath instead the canonical one.
	 *
	 * @param {string} sPath Path to resolve
	 * @param {sap.ui.model.Context} [oContext] Context to resolve a relative path against
	 * @return {string} Resolved path, canonical path or undefined
	 * @private
	 */
	ODataModel.prototype.resolveDeep = function(sPath, oContext) {
		var sResolvedPath = Model.prototype.resolve.call(this, sPath, oContext);
		if (sPath && !sPath.startsWith("/")) {
			// if sPath is relative we resolve with the deep path of the context - else the path is absolute already
			sResolvedPath = oContext ? oContext.sDeepPath + '/' + sPath : sResolvedPath;
		}
		if (sPath === ""){
			sResolvedPath = oContext ? oContext.sDeepPath : sResolvedPath;
		}

		return sResolvedPath;
	};

	/**
	 * Returns whether a given path relative to the given contexts is in laundering state.
	 *
	 * If data is sent to the server, the data state becomes laundering until the
	 * data was accepted or rejected.
	 *
	 * @param {string} sPath Path to resolve
	 * @param {sap.ui.model.Context} [oContext] Context to resolve a relative path against
	 * @returns {boolean} <code>true</code> if the data in this path is laundering
	 */
	ODataModel.prototype.isLaundering = function(sPath, oContext) {
		var sResolvedPath = this.resolve(sPath, oContext);
		return (sResolvedPath in this.mLaunderingState) && this.mLaunderingState[sResolvedPath] > 0;
	};

	/**
	 * Increases laundering state for a canonical path.
	 * @param {string} sPath The canonical path
	 * @param {object} oChangedEntity The changed entity
	 * @private
	 */
	ODataModel.prototype.increaseLaundering = function(sPath, oChangedEntity) {
		if (!isPlainObject(oChangedEntity)) {
			return;
		}
		for (var n in oChangedEntity) {
			if (n === "__metadata") {
				continue;
			}
			var  oObject = oChangedEntity[n];
			if (isPlainObject(oObject)) {
				this.increaseLaundering(sPath + "/" + n, oObject);
			} else {
				var sTargetPath = sPath + "/" + n;
				if (!(sTargetPath in this.mLaunderingState)) {
					this.mLaunderingState[sTargetPath] = 0;
				}
				this.mLaunderingState[sTargetPath]++;
			}
		}
		if (!(sPath in this.mLaunderingState)) {
			this.mLaunderingState[sPath] = 0;
		}
		this.mLaunderingState[sPath]++;
	};

	/**
	 * Decrease one laundering state for the given canonical path.
	 * @param {string} sPath The canonical path
	 * @param {object} oChangedEntity The changed entity
	 * @private
	 */
	ODataModel.prototype.decreaseLaundering = function(sPath, oChangedEntity) {
		if (!isPlainObject(oChangedEntity)) {
			return;
		}
		for (var n in oChangedEntity) {
			if (n === "__metadata") {
				continue;
			}
			var oObject = oChangedEntity[n],
				sTargetPath = sPath + "/" + n;
			if (isPlainObject(oObject)) {
				this.decreaseLaundering(sTargetPath, oObject);
			} else if (sTargetPath in this.mLaunderingState) {
				this.mLaunderingState[sTargetPath]--;
				if (this.mLaunderingState[sTargetPath] === 0) {
					delete this.mLaunderingState[sTargetPath];
				}
			}
		}
		this.mLaunderingState[sPath]--;
		if (this.mLaunderingState[sPath] === 0) {
			delete this.mLaunderingState[sPath];
		}
	};

	/**
	 * Returns bRefreshAfterChange value for a change operation based on
	 * <code>refreshAfterChange</code> parameter and global <code>bRefreshAfterChange</code> flag
	 * state.
	 *
	 * @param {boolean} bRefreshAfterChange
	 *   Value of the <code>refreshAfterChange</code> parameter of any change operation (for example
	 *   {@link #update})
	 * @param {string} sGroupId
	 *   ID of the request group
	 * @returns {boolean}
	 *   Whether to refresh after change
	 *
	 * @private
	*/
	ODataModel.prototype._getRefreshAfterChange = function(bRefreshAfterChange, sGroupId) {
		// If no bRefreshAfterChange parameter is given given and the request group is not deferred,
		// use the global flag
		if (bRefreshAfterChange === undefined && !(sGroupId in this.mDeferredGroups)) {
			return this.bRefreshAfterChange;
		}
		return bRefreshAfterChange;
	};

	/**
	 * Get all messages for an entity path.
	 *
	 * @param {string} sEntity The entity path or key
	 * @param {boolean} bExcludePersistent Whether persistent messages should be exluded
	 * @returns {object[]|undefined} The messages for the entity
	 * @private
	 */
	ODataModel.prototype.getMessagesByEntity = function(sEntity, bExcludePersistent) {
		var sEntityPath = sEntity,
			aMessages = [],
			sPath;

		function filterMessages(aMessages) {
			var aFilteredMessages = [];
			for (var i = 0; i < aMessages.length; i++) {
				if (!bExcludePersistent || (bExcludePersistent && !aMessages[i].persistent)) {
					aFilteredMessages.push(aMessages[i]);
				}
			}
			return aFilteredMessages;
		}
		//normalize Key
		if (!sEntityPath.startsWith('/')) {
			sEntityPath = '/' + sEntityPath;
		}
		if (this.mMessages) {
			for (sPath in this.mMessages) {
				if (typeof sEntityPath == "string" && sEntityPath.length > 0 && sPath.startsWith(sEntityPath)) {
					aMessages = aMessages.concat(filterMessages(this.mMessages[sPath]));
				}
			}
			return aMessages;
		}
		return null;
	};

	/**
	 * Check if Caching is supported. All URLs must at least provide a 'sap-context-token' query
	 * parameter or a valid cache buster token segment.
	 *
	 * @param {string} sMetadataUrl The metadata URL
	 * @returns {boolean} Whether caching is supported
	 *
	 * @private
	 */
	ODataModel.prototype._cacheSupported = function(sMetadataUrl) {
		var cacheBusterToken = /\/~[\w\-]+~[A-Z0-9]?/;
		var aUrls = [sMetadataUrl];
		//check urls for sap-context-token and cachebuster token
		if (this.sAnnotationURI) {
			if (!Array.isArray(this.sAnnotationURI)) {
				this.sAnnotationURI = [this.sAnnotationURI];
			}
			aUrls = aUrls.concat(this.sAnnotationURI);
		}

		// check for context-token
		aUrls = aUrls.filter(function(sUrl) {
			return sUrl.indexOf("sap-context-token") === -1;
		});
		// check for cache buster token
		aUrls = aUrls.filter(function(sUrl) {
			return !cacheBusterToken.test(sUrl);
		});
		return aUrls.length === 0 ? true : false;
	};

	/**
	 * Create cache key for annotations.
	 *
	 * @param {string} sMetadataUrl The metadata URL
	 * @returns {string} The cache key
	 *
	 * @private
	 */
	ODataModel.prototype._getAnnotationCacheKey = function(sMetadataUrl) {
		var bIgnoreAnnotationsFromMetadata =
				this.bSkipMetadataAnnotationParsing || this.bIgnoreAnnotationsFromMetadata,
			sCacheKey;

		if (this.bUseCache) {
			if (!bIgnoreAnnotationsFromMetadata) {
				sCacheKey = sMetadataUrl + "#annotations";
			}

			if (this.sAnnotationURI) {
				if (!Array.isArray(this.sAnnotationURI)) {
					this.sAnnotationURI = [this.sAnnotationURI];
				}
				this.sAnnotationURI = this.sAnnotationURI.map(function(sUrl) {
					return sUrl + "#annotations";
				});
				sCacheKey = bIgnoreAnnotationsFromMetadata
					? this.sAnnotationURI.join("_")
					: sCacheKey + "_" + this.sAnnotationURI.join("_");
			}
		}
		return sCacheKey;
	};

	/**
	 * Whether the canonical requests calculation is switched on, see the
	 * <code>canonicalRequests</code> parameter of the model constructor.
	 *
	 * @return {boolean} Whether the canonical requests calculation is switched on
	 *
	 * @public
	 */
	ODataModel.prototype.canonicalRequestsEnabled = function() {
		return this.bCanonicalRequests;
	};

	/**
	 * Decreases the internal deferred request counter, if the request is/was deferred.
	 *
	 * @param {object} oRequest The completed request
	 */
	ODataModel.prototype._decreaseDeferredRequestCount = function(oRequest){
		if (oRequest.deferred){
			this.iPendingDeferredRequests--;
		}
	};

	/**
	 * Enable/Disable canonical requests calculation. When enabled, a given
	 * resource path will be shortened as much as possible.
	 *
	 * @param {boolean} bCanonicalRequests Enable/disable canonical request calculation
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 */
	ODataModel.prototype.enableCanonicalRequests = function(bCanonicalRequests) {
		this.bCanonicalRequests = !!bCanonicalRequests;
	};

	/**
	 * Returns this model's message scope.
	 *
	 * @returns {sap.ui.model.odata.MessageScope} The message scope
	 *
	 * @public
	 * @see sap.ui.model.odata.MessageScope
	 * @since 1.76.0
	 */
	ODataModel.prototype.getMessageScope = function () {
		return this.sMessageScope;
	};

	/**
	 * Sets this model's message scope.
	 *
	 * @param {sap.ui.model.odata.MessageScope} sMessageScope The message scope
	 * @throws {Error} If an unsupported message scope is provided
	 *
	 * @public
	 * @see sap.ui.model.odata.MessageScope
	 * @since 1.76.0
	 */
	ODataModel.prototype.setMessageScope = function (sMessageScope) {
		if (sMessageScope !== MessageScope.RequestedObjects
				&& sMessageScope !== MessageScope.BusinessObject) {
			throw new Error("Unsupported message scope: " + sMessageScope);
		}
		this.sMessageScope = sMessageScope;
	};

	/**
	 * Checks whether the service has set the OData V2 annotation "message-scope-supported" on the
	 * <code>EntityContainer</code> with the value <code>true</code>. This is a a precondition for
	 * the setting of {@link sap.ui.model.odata.MessageScope.BusinessObject} via
	 * {@link #setMessageScope}.
	 *
	 * @returns {Promise} A promise resolving with <code>true</code> if the OData V2 annotation
	 *   "message-scope-supported" on the <code>EntityContainer</code> is set to <code>true</code>
	 *
	 * @public
	 * @see sap.ui.model.odata.MessageScope
	 * @since 1.76.0
	 */
	ODataModel.prototype.messageScopeSupported = function () {
		var that = this;

		return this.metadataLoaded().then(function() {
				return that.bIsMessageScopeSupported;
			});
	};

	/**
	 * Gets or creates the OData V2 context for the given path; the returned context is cached by
	 * this path. Enriches the context with the given deep path. In case the context is created, the
	 * parameters <code>oCreatePromise</code> and <code>bInactive</code> are used for the creation.
	 *
	 * @param {string} sPath
	 *   The absolute path
	 * @param {string} [sDeepPath]
	 *   The absolute deep path representing the same data as the given <code>sPath</code>
	 * @param {sap.ui.base.SyncPromise} [oCreatePromise]
	 *   A created promise as specified in the constructor of {@link sap.ui.model.odata.v2.Context}
	 * @param {boolean} [bInactive]
	 *   Whether the created context is inactive
	 * @param {sap.ui.model.odata.v2.Context} [oTransientParent]
	 *   The transient parent context
	 * @returns {sap.ui.model.odata.v2.Context}
	 *   The ODate V2 context for the given path
	 * @private
	 */
	ODataModel.prototype.getContext = function (sPath, sDeepPath, oCreatePromise, bInactive,
			oTransientParent) {
		var oContext = this.mContexts[sPath];

		if (!oContext) {
			oContext = this.mContexts[sPath]
				= new Context(this, sPath, sDeepPath, oCreatePromise, bInactive, oTransientParent);
		} else {
			oContext.setDeepPath(sDeepPath || oContext.getDeepPath() || sPath);
		}

		return oContext;
	};

	/**
	 * Check if a Context already exists for the model
	 * @param {string} [sPath] The path to check
	 * @returns {boolean} True if a context for the given path exists
	 * @private
	 */
	ODataModel.prototype.hasContext = function(sPath){
		return this.mContexts[sPath];
	};

	/**
	 * Removes model internal metadata information from the given entity. This information is not
	 * known and sometimes not accepted by the back-end.
	 *
	 * @param {object} [oEntityData] The entity data
	 * @returns {map} Map containing the removed information for the "root" entity; the internal
	 *   information is however also removed from entities contained in navigation properties
	 * @private
	 */
	ODataModel.prototype.removeInternalMetadata = function (oEntityData) {
		var sCreated, sDeepPath, bInvalid, sKey, vValue;

		if (oEntityData && oEntityData.__metadata) {
			sCreated = oEntityData.__metadata.created;
			sDeepPath = oEntityData.__metadata.deepPath;
			bInvalid = oEntityData.__metadata.invalid;
			delete oEntityData.__metadata.created;
			delete oEntityData.__metadata.deepPath;
			delete oEntityData.__metadata.invalid;
		}
		for (sKey in oEntityData) {
			vValue = oEntityData[sKey];
			if (Array.isArray(vValue)) { // ..n navigation property value
				vValue.forEach(ODataModel.prototype.removeInternalMetadata);
			} else if (typeof vValue === "object") { // ..1 navigation property
				ODataModel.prototype.removeInternalMetadata(vValue);
			}
		}
		return {created: sCreated, deepPath: sDeepPath, invalid : bInvalid};
	};

	/**
	 * Checks whether canonical requests are necessary.
	 * @param {boolean} [bCanonicalRequest]
	 *   Is regarded with priority when checking whether canonical requests are required
	 *
	 * @returns {boolean} Whether canonical requests are necessary
	 */
	ODataModel.prototype._isCanonicalRequestNeeded = function(bCanonicalRequest){
		if (bCanonicalRequest !== undefined){
			return !!bCanonicalRequest;
		} else {
			return !!this.bCanonicalRequests;
		}
	};

	/**
	 * Returns an array of messages for the given message target matching the given resolved binding
	 * path prefix. Use <code>fullTarget</code> to determine whether a message matches the resolved
	 * binding path prefix.
	 *
	 * @param {string} sMessagePath
	 *   The messages target used as key in <code>this.mMessages</code>
	 * @param {string} sPathPrefix
	 *   The resolved binding path prefix
	 * @returns {sap.ui.core.message.Message[]}
	 *   The matching message objects, or an empty array, if no messages match.
	 *
	 * @private
	 */
	// @override
	ODataModel.prototype.filterMatchingMessages = function (sMessagePath, sPathPrefix) {
		var that = this;

		return this.mMessages[sMessagePath].filter(function (oMessage) {
			return that.isMessageMatching(oMessage, sPathPrefix);
		});
	};

	/*
	 * Returns whether one of the given message object's full targets starts with the given resolved
	 * binding path prefix.
	 *
	 * @param {sap.ui.core.message.Message} oMessage
	 *   The message object to be checked
	 * @param {string} sPathPrefix
	 *   The resolved binding path prefix
	 * @returns {boolean}
	 *   Whether one of the given message object's full targets starts with the given resolved
	 *   binding path prefix
	 *
	 * @private
	 */
	ODataModel.prototype.isMessageMatching = function (oMessage, sPathPrefix) {
		var iPrefixLength = sPathPrefix.length;

		return oMessage.aFullTargets.some(function (sFullTarget) {
			return sFullTarget === sPathPrefix
				|| sFullTarget.startsWith(sPathPrefix)
					&& (sPathPrefix === "/"
						|| sFullTarget[iPrefixLength] === "/"
						|| sFullTarget[iPrefixLength] === "(");
		});
	};

	// @override
	// @public
	// @see sap.ui.model.Model#getMessages
	// @since 1.76.0
	ODataModel.prototype.getMessages = function (oContext) {
		return this.getMessagesByPath(oContext.sDeepPath, /*bPrefixMatch*/true)
			.sort(Message.compare);
	};

	/**
	 * Returns the deep path for the given canonical path. Only ODataContextBindings and
	 * ODataListBindings are considered while calculating the deep path.
	 *
	 * @param {string} sCanonicalPath
	 *   The canonical path addressing an entity, for example "/SalesOrderSet('42')"
	 * @returns {string}
	 *   The deep path for the given canonical path; <code>undefined</code> if the deep path cannot
	 *   be determined, which may happen if there are different deep paths referencing the same
	 *   entity or if there is no binding referencing the entity
	 * @private
	 */
	ODataModel.prototype.getDeepPathForCanonicalPath = function (sCanonicalPath) {
		var oCurrentBinding, sCurrentCanonicalPath, sCurrentDeepPath, sDeepPath, aFilteredBindings,
			i, n,
			sKeyPredicate = sCanonicalPath.slice(sCanonicalPath.indexOf("("));

		aFilteredBindings = this.aBindings.filter(function (oBinding) {
			return (oBinding instanceof ODataContextBinding || oBinding instanceof ODataListBinding)
				&& oBinding.isResolved();
		});

		for (i = 0, n = aFilteredBindings.length; i < n; i += 1) {
			oCurrentBinding = aFilteredBindings[i];
			sCurrentDeepPath = this.resolveDeep(oCurrentBinding instanceof ODataListBinding
					? oCurrentBinding.sPath + sKeyPredicate
					: oCurrentBinding.sPath,
				oCurrentBinding.oContext);
			sCurrentCanonicalPath = this.resolveFromCache(sCurrentDeepPath);

			if (sCurrentCanonicalPath === sCanonicalPath) {
				if (sDeepPath && sDeepPath !== sCurrentDeepPath) {
					return undefined; // multiple deep paths for the same canonical path
				}
				sDeepPath = sCurrentDeepPath;
			}
		}

		return sDeepPath;
	};

	/**
	 * Gets the flag whether technical messages should always be treated as persistent.
	 *
	 * @returns {boolean} Whether technical messages should always be treated as persistent
	 *
	 * @private
	 * @since 1.84.0
	 * @ui5-restricted sap.suite.ui.generic.template
	 */
	ODataModel.prototype.getPersistTechnicalMessages = function () {
		return this.bPersistTechnicalMessages;
	};

	/**
	 * Sets the flag whether technical messages should always be treated as persistent. Works only
	 * with {@link sap.ui.model.odata.ODataMessageParser}.
	 *
	 * @param {boolean} bPersistTechnicalMessages
	 *   Whether technical messages should always be treated as persistent
	 *
	 * @private
	 * @since 1.84.0
	 * @ui5-restricted sap.suite.ui.generic.template
	 */
	ODataModel.prototype.setPersistTechnicalMessages = function (bPersistTechnicalMessages) {
		bPersistTechnicalMessages = !!bPersistTechnicalMessages;
		if (this.bPersistTechnicalMessages === bPersistTechnicalMessages) {
			return;
		}
		if (this.bPersistTechnicalMessages !== undefined) {
			Log.warning("The flag whether technical messages should always be treated as persistent"
				+ " has been overwritten to " + bPersistTechnicalMessages, undefined, sClassName);
		}
		this.bPersistTechnicalMessages = bPersistTechnicalMessages;
		if (this.oMessageParser) {
			this.oMessageParser._setPersistTechnicalMessages(bPersistTechnicalMessages);
		}
	};

	/**
	 * Creates the parameters map to be used for the instantiation of the code list model, based on
	 * the parameters of this OData model.
	 *
	 * @param {Object<string,any>} [mParameters]
	 *   The original <code>mParameters</code> map which was passed into the constructor of this
	 *   OData model instance
	 * @returns {Object<string,any>}
	 *   The parameters that can be used to instantiate the related code list model to this OData
	 *   model instance
	 *
	 * @private
	 */
	ODataModel.prototype.createCodeListModelParameters = function (mParameters) {
		mParameters = mParameters || {};

		return {
			defaultCountMode : CountMode.None,
			disableSoftStateHeader : true,
			headers : mParameters.headers && Object.assign({}, mParameters.headers),
			json : mParameters.json,
			metadataUrlParams : mParameters.metadataUrlParams
				&& Object.assign({}, mParameters.metadataUrlParams),
			persistTechnicalMessages : mParameters.persistTechnicalMessages,
			serviceUrl : this.sServiceUrl,
			serviceUrlParams : mParameters.serviceUrlParams
				&& Object.assign({}, mParameters.serviceUrlParams),
			tokenHandling : false,
			useBatch : false,
			warmupUrl : mParameters.warmupUrl
		};
	};

	/**
	 * Gets the map of parameters that are required to instantiate a code list model for this OData
	 * model.
	 *
	 * @returns {Object<string,any>} The parameter map used to instantiate the code list model
	 *
	 * @private
	 * @see #createCodeListModelParameters
	 */
	ODataModel.prototype.getCodeListModelParameters = function () {
		return this.mCodeListModelParams;
	};

	/**
	 * Gets the URL to this OData service's metadata document as created by
	 * {@link #_createMetadataUrl} in the constructor.
	 *
	 * @returns {string} The metadata URL
	 *
	 * @private
	 */
	ODataModel.prototype.getMetadataUrl = function () {
		return this.sMetadataUrl;
	};

	/**
	 * Creates an error object for an aborted request.
	 *
	 * @returns {object} An error object for an aborted request
	 * @private
	 */
	ODataModel._createAbortedError = function () {
		return {
			aborted : true,
			headers : {},
			message : "Request aborted",
			responseText : "",
			statusCode : 0,
			statusText : "abort"
		};
	};

	/**
	 * Gets the cache for contexts of entities created via
	 * {@link sap.ui.model.odata.v2.ODataListBinding#create}.
	 *
	 * @returns {sap.ui.model.odata.v2._CreatedContextsCache} The created entities cache
	 *
	 * @private
	 */
	ODataModel.prototype._getCreatedContextsCache = function () {
		return this.oCreatedContextsCache;
	};

	/**
	 * Checks whether the given object does not contain any other property than a "__metadata"
	 * property.
	 *
	 * @param {object} oEntity
	 *   A changed entity object, see ODataModel#mChangedEntities
	 * @returns {boolean}
	 *   Whether the given entity is empty
	 *
	 * @private
	 */
	ODataModel._isChangedEntityEmpty = function (oEntity) {
		return Object.keys(oEntity).every(function (sKey) {
			return sKey === "__metadata";
		});
	};

	/**
	 * Adds the sub-entities contained in the given root context to the given request payload
	 * object.
	 *
	 * @param {sap.ui.model.odata.v2.Context} oRootContext
	 *   The root context which may have sub-entities
	 * @param {object} oPayload
	 *   The object representing the root context in the payload for the creation POST request
	 *
	 * @private
	 */
	ODataModel.prototype._addSubEntitiesToPayload = function (oRootContext, oPayload) {
		var i, sNavProperty, vSubContexts, oSubEntity,
			mSubContexts = oRootContext.getSubContexts(),
			that = this;

		function getEntityData(oContext) {
			var oEntity = _Helper.merge({}, that._getObject(oContext.getPath()));

			delete oEntity.__metadata;

			return oEntity;
		}

		for (sNavProperty in mSubContexts) {
			vSubContexts = mSubContexts[sNavProperty];
			if (Array.isArray(vSubContexts)) {
				oPayload[sNavProperty] = [];
				for (i = 0; i < vSubContexts.length; i += 1) {
					oSubEntity = getEntityData(vSubContexts[i]);
					oPayload[sNavProperty].push(oSubEntity);
					this._addSubEntitiesToPayload(vSubContexts[i], oSubEntity);
				}
			} else {
				oSubEntity = getEntityData(vSubContexts);
				oPayload[sNavProperty] = oSubEntity;
				this._addSubEntitiesToPayload(vSubContexts, oSubEntity);
			}
		}
	};

	/**
	 * Checks whether the <code>sap-messages</code> header must be set to <code>transientOnly</code>
	 * for all create and change requests belonging to the given group, which were caused by
	 * {@link #createEntry} or {@link #setProperty}.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {boolean}
	 *   Whether changes belonging to the given group only request transition messages from the
	 *   back end
	 *
	 * @private
	 */
	ODataModel.prototype._isTransitionMessagesOnly = function (sGroupId) {
		return this.oTransitionMessagesOnlyGroups.has(sGroupId);
	};

	/**
	 * Sets the <code>sap-messages</code> header to <code>transientOnly</code> for all create and
	 * change requests belonging to the given group, which were caused by {@link #createEntry} or
	 * {@link #setProperty}.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} bTransitionMessagesOnly
	 *   Whether changes belonging to the given group only request transition messages from the
	 *   back end
	 *
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 * @since 1.112.0
	 */
	ODataModel.prototype.setTransitionMessagesOnlyForGroup = function (sGroupId, bTransitionMessagesOnly) {
		var sOperation = bTransitionMessagesOnly ? "add" : "delete";

		this.oTransitionMessagesOnlyGroups[sOperation](sGroupId);
	};

	return ODataModel;
});
