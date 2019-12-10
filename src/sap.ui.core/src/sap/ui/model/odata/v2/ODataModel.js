/*!
 * ${copyright}
 */

/**
 * OData-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.odata.v2
 * @public
 */

//Provides class sap.ui.model.odata.v2.ODataModel
sap.ui.define([
	'sap/ui/thirdparty/URI',
	'sap/ui/model/BindingMode',
	'sap/ui/model/Context',
	'sap/ui/model/Model',
	'sap/ui/model/odata/v2/ODataAnnotations',
	'sap/ui/model/odata/ODataUtils',
	'sap/ui/model/odata/CountMode',
	'sap/ui/model/odata/UpdateMethod',
	'sap/ui/model/odata/OperationMode',
	'sap/ui/model/odata/MessageScope',
	'./ODataContextBinding',
	'./ODataListBinding',
	'sap/ui/model/odata/ODataMetadata',
	'sap/ui/model/odata/ODataPropertyBinding',
	'./ODataTreeBinding',
	'sap/ui/model/FilterProcessor',
	'sap/ui/model/odata/ODataMetaModel',
	'sap/ui/core/message/MessageParser',
	'sap/ui/model/odata/ODataMessageParser',
	'sap/ui/thirdparty/datajs',
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/uid",
	"sap/base/util/UriParameters",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/base/security/encodeURL",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isPlainObject",
	"sap/base/util/each",
	"sap/base/util/isEmptyObject"
], function(
	URI,
	BindingMode,
	Context,
	Model,
	ODataAnnotations,
	ODataUtils,
	CountMode,
	UpdateMethod,
	OperationMode,
	MessageScope,
	ODataContextBinding,
	ODataListBinding,
	ODataMetadata,
	ODataPropertyBinding,
	ODataTreeBinding,
	FilterProcessor,
	ODataMetaModel,
	MessageParser,
	ODataMessageParser,
	OData,
	Log,
	assert,
	uid,
	UriParameters,
	deepEqual,
	merge,
	encodeURL,
	jQuery,
	isPlainObject,
	each,
	isEmptyObject
) {

	"use strict";


	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {string|object} serviceUrl
	 *            Base URI of the service to request data from; additional URL parameters appended here
	 *            will be appended to every request. If you pass an object it will be interpreted as
	 *            the parameter object (second parameter). Then <code>mParameters.serviceUrl</code>
	 *            becomes a mandatory parameter.
	 * @param {object} [mParameters]
	 *            Map which contains the following parameter properties:
	 * @param {object} [mParameters.serviceUrl]
	 *            Base URI of the service to request data from; this property is mandatory when the
	 *            first method parameter <code>serviceUrl</code> is omitted, but ignored otherwise
	 * @param {boolean} [mParameters.json=true]
	 *            If set to <code>true</code>, request payloads will be JSON, XML for <code>false</code>
	 * @param {string} [mParameters.user] User for the service
	 * @param {string} [mParameters.password] Password for service
	 * @param {map} [mParameters.headers]
	 *            Map of custom headers (name/value pairs) like {"myHeader":"myHeaderValue",...}
	 * @param {boolean} [mParameters.tokenHandling=true] Enable/disable XCSRF-Token handling
	 * @param {boolean} [mParameters.withCredentials]
	 *            Experimental - <code>true</code> when user credentials are to be included in a
	 *            cross-origin request; please note that this only works if all requests are asynchronous
	 * @param {string}[mParameters.maxDataServiceVersion='2.0']
	 *            Please use the following string format e.g. '2.0' or '3.0'.
	 *            OData version supported by the ODataModel: '2.0'
	 * @param {boolean} [mParameters.useBatch=true]
	 *            Whether all requests should be sent in batch requests
	 * @param {boolean} [mParameters.refreshAfterChange=true]
	 *            Enable/disable automatic refresh after change operations
	 * @param {string|string[]} [mParameters.annotationURI]
	 *            The URL (or an array of URLs) from which the annotation metadata should be loaded
	 * @param {boolean} [mParameters.loadAnnotationsJoined]
	 *            Whether the <code>metadataLoaded</code> event will be fired only after all annotations have
	 *            been loaded as well
	 * @param {map} [mParameters.serviceUrlParams]
	 *            Map of URL parameters (name/value pairs) - these parameters will be attached to all requests, except for the <code>$metadata</code> request
	 * @param {map} [mParameters.metadataUrlParams]
	 *            Map of URL parameters for metadata requests - only attached to a <code>$metadata</code> request
	 * @param {sap.ui.model.BindingMode} [mParameters.defaultBindingMode=OneWay]
	 *            Sets the default binding mode for the model
	 * @param {sap.ui.model.odata.CountMode} [mParameters.defaultCountMode=Request]
	 *            Sets the default count mode for the model
	 * @param {boolean} [mParameters.preliminaryContext=false]
	 *            Whether a preliminary Context will be created/used by a binding
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.defaultOperationMode=Default]
	 *            Sets the default operation mode for the model
	 * @param {sap.ui.model.odata.UpdateMethod} [mParameters.defaultUpdateMethod=Merge]
	 *            Default update method which is used for all update requests
	 * @param {Object<string,string>} [mParameters.metadataNamespaces]
	 *            Map of namespace aliases (alias => URI) that can be used in metadata binding paths;
	 *            each alias is mapped to a corresponding namespace URI; when an alias is used
	 *            in a metadata binding path, it addresses a metadata extension that belongs to
	 *            the corresponding namespace URI; if <code>metadataNamespaces</code> is not given,
	 *            the following default mappings will be used:
	 *            <ul>
	 *            <li><code>"sap": "sap:"http://www.sap.com/Protocols/SAPData"</code></li>
	 *            <li><code>  "m": "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"</code></li>
	 *            <li><code>   "": "http://schemas.microsoft.com/ado/2007/06/edmx</code></li>
	 *            </ul>
	 * @param {boolean} [mParameters.skipMetadataAnnotationParsing]
	 *            Whether to skip the automated loading of annotations from the metadata document.
	 *            Loading annotations from metadata does not have any effects (except the lost performance
	 *            by invoking the parser) if there are not annotations inside the metadata document
	 * @param {boolean} [mParameters.disableHeadRequestForToken=false]
	 *            Set this flag to <code>true</code> if your service does not support <code>HEAD</code>
	 *            requests for fetching the service document (and thus the CSRF-token) to avoid sending
	 *            a <code>HEAD</code>-request before falling back to <code>GET</code>
	 * @param {boolean} [mParameters.sequentializeRequests=false]
	 *            Whether to sequentialize all requests, needed in case the service cannot handle parallel requests
	 * @param {boolean} [mParameters.disableSoftStateHeader=false]
	 *            Set this flag to <code>true</code> if you don´t want to start a new soft state session
	 *            with context ID (<code>SID</code>) through header mechanism. This is useful if you want
	 *            to share an <code>SID</code> between different browser windows
	 * @param {string[]} [mParameters.bindableResponseHeaders=null]
	 *            Set this array to make custom response headers bindable via the entity's "__metadata/headers" property
	 * @param {boolean} [mParameters.canonicalRequests=false]
	 *            When setting this flag to <code>true</code> the model tries to calculate a canonical url to the data.
	 * @param {boolean} [mParameters.tokenHandlingForGet=false] Send CSRF token for GET requests in case read access logging is activated for the OData Service in the backend.
	 *
	 * @class
	 * Model implementation based on the OData protocol.
	 *
	 * See chapter {@link topic:6c47b2b39db9404582994070ec3d57a2 OData V2 Model} for a general introduction.
	 *
	 * @example authentication
	 * oModel = new ODataModel(sURL, {
	 *      user : "myuser",
	 *      password : "mypass"
	 * });
	 * // will use the respective authentication token
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

		constructor : function(sServiceUrl, mParameters) {
			Model.apply(this, arguments);

			var sUser,
				sPassword,
				mHeaders,
				bTokenHandling,
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
				that = this;

			if (typeof (sServiceUrl) === "object") {
				mParameters = sServiceUrl;
				sServiceUrl = mParameters.serviceUrl;
			}

			if (mParameters) {
				sUser = mParameters.user;
				sPassword = mParameters.password;
				mHeaders = mParameters.headers;
				bTokenHandling = mParameters.tokenHandling;
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
			}

			/* Path cache to avoid multiple expensive resolve operations
			 * this.mPathCache =
			 * {
			 *		'aBindingPath': {
			 *			canonicalPath: 'The canonicalPath',
			 *			updateKey: 'path relevant for path invalidation'
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

			this.bTokenHandling = bTokenHandling !== false;
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

			if (oMessageParser) {
				oMessageParser.setProcessor(this);
			}
			this.oMessageParser = oMessageParser;

			//collect internal changes in a deferred group as default
			this.sDefaultChangeGroup = "changes";
			this.setDeferredGroups([this.sDefaultChangeGroup]);
			this.setChangeGroups({"*":{groupId: this.sDefaultChangeGroup}});

			this.oData = {};
			this.oMetadata = null;
			this.oAnnotations = null;
			this.aUrlParams = [];

			// for sequentialized requests, keep a promise of the last request
			this.pSequentialRequestCompleted = Promise.resolve();

			// Promise for request chaining
			this.pReadyForRequest = Promise.resolve();

			// determine the service base url and the url parameters
			this.sServiceUrl = sServiceUrl;
			var aUrlParts = sServiceUrl.split("?");
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

			if (sap.ui.getCore().getConfiguration().getStatistics()) {
				// add statistics parameter to every request (supported only on Gateway servers)
				this.aUrlParams.push("sap-statistics=true");
			}

			this.oHeaders = {};
			this.setHeaders(mHeaders);

			if (!this.bDisableSoftStateHeader) {
				this.oHeaders["sap-contextid-accept"] = "header";
				this.mCustomHeaders["sap-contextid-accept"] = "header";
			}
			// Get/create shared data containers
			var sServerUrl = this._getServerUrl();
			//use warmup url if provided
			var sMetadataUrl = this.sWarmupUrl || this._createMetadataUrl("/$metadata");
			this.oSharedServerData = ODataModel._getSharedData("server", sServerUrl);
			this.oSharedServiceData = ODataModel._getSharedData("service", this.sServiceUrl);
			this.oSharedMetaData = ODataModel._getSharedData("meta", sMetadataUrl);

			this.bUseCache = this._cacheSupported(sMetadataUrl);

			if (!this.oSharedMetaData.oMetadata || this.oSharedMetaData.oMetadata.bFailed) {
				//create Metadata object
				this.oMetadata = new ODataMetadata(sMetadataUrl,{
					async: true,
					cacheKey: this.bUseCache ? sMetadataUrl : undefined,
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
				skipMetadata: this.bSkipMetadataAnnotationParsing,
				headers: this.mCustomHeaders,
				combineEvents: true,
				cacheKey: this._getAnnotationCacheKey(sMetadataUrl),
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
				} else if (this.oSharedServerData.securityToken) {
					this.oSharedServiceData.securityToken = this.oSharedServerData.securityToken;
					this.oHeaders["x-csrf-token"] = this.oSharedServiceData.securityToken;
				}
			}
			this.oHeaders["Accept-Language"] = sap.ui.getCore().getConfiguration().getLanguageTag();

			// set version to 2.0 because 1.0 does not support e.g. skip/top, inlinecount...
			// states the version of the Open Data Protocol used by the client to generate the request.
			this.oHeaders["DataServiceVersion"] = "2.0";
			// the max version number the client can accept in a response
			this.oHeaders["MaxDataServiceVersion"] = "2.0";
			if (this.sMaxDataServiceVersion) {
				this.oHeaders["MaxDataServiceVersion"] = this.sMaxDataServiceVersion;
			}

		},
		metadata : {
			publicMethods : ["read", "create", "update", "remove", "submitChanges", "getServiceMetadata", "metadataLoaded",
			                 "hasPendingChanges", "getPendingChanges", "refresh", "refreshMetadata", "resetChanges", "setDefaultCountMode",
			                 "setDefaultBindingMode", "getDefaultBindingMode", "getDefaultCountMode",
			                 "setProperty", "getSecurityToken", "refreshSecurityToken", "setHeaders",
			                 "getHeaders", "setUseBatch", "setDeferredBatchGroups", "getDeferredBatchGroups",
			                 "setChangeBatchGroups", "getChangeBatchGroups"]
		}
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
	 * @param {map} oEvent.getParameters.headers The request headers
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
	 * @param {map} oEvent.getParameters.headers The request headers
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
	 * @param {map} oEvent.getParameters.headers The request headers
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
	 * @param {map} oEvent.getParameters.headers The request headers
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @param {map} oParameters.headers The request headers
	 * @param {boolean} oParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} oParameters.success Request was successful or not
	 * @param {object} oParameters.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @param {array} oParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: URL, method, headers, response object
	 *
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * @param {map} oEvent.getParameters.headers The request headers
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @param {map} oParameters.headers The request headers
	 * @param {boolean} oParameters.success Request was successful or not
	 * @param {boolean} oParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {array} oParameters.requests Array of embedded requests ($batch) - empty array for non batch requests.
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @param {object} oParameters.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 *
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * Refreshes the metadata for this model, for example when the request for metadata has failed.
	 *
	 * <b>Note</b>: Do not use <code>refreshMetadata</code> if the metadata is outdated or should be updated.
	 * 	     This will lead to inconsistent data in the application.
	 *
	 * Returns a new promise which can be resolved or rejected depending on the metadata loading state.
	 *
	 * @returns {Promise} A promise on metadata loaded state or <code>null</code> if metadata is not initialized or currently refreshed.
	 *
	 * @deprecated As of version 1.42.
	 *
	 * @public
	 */
	ODataModel.prototype.refreshMetadata = function(){
		if (this.oMetadata && this.oMetadata.refresh){
			return this.oMetadata.refresh();
		}
	};


	/**
	 * Fires event {@link #event:annotationsLoaded annotationsLoaded} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {sap.ui.model.odata.v2.ODataAnnotations} [oParameters.annotations] The annotations object
	 *
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.model.odata.v2.ODataModel} Reference to <code>this</code> in order to allow method chaining
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
		var oEventInfo = {};

		oEventInfo.url = oRequest.requestUri;
		oEventInfo.method = oRequest.method;
		oEventInfo.async = oRequest.async;
		oEventInfo.headers = oRequest.headers;
		//in batch case list inner requests
		if (aBatchRequests) {
			oEventInfo.requests = [];
			for (var i = 0; i < aBatchRequests.length; i++) {
				var oBatchRequest = {};
				//changeSets
				if (Array.isArray(aBatchRequests[i])) {
					var aChangeSet = aBatchRequests[i];
					for (var j = 0; j < aChangeSet.length; j++) {
						var oRequest = aChangeSet[j].request;
						var oInnerResponse = aBatchRequests[i][j].response;
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
					var oRequest = aBatchRequests[i].request;
					var oInnerResponse = aBatchRequests[i].response;
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

		var oUriParameters = UriParameters.fromURL(sUrl || window.location.href);
		//UriParameters returns an array of values - we use the first one as
		//we assume only one per key should be passed
		var mAllParams = Object.assign({}, this.mMetadataUrlParams);
		Array.from(oUriParameters.keys()).forEach(function(sKey) {
			mAllParams[sKey] = oUriParameters.get(sKey);
		});
		var aMetadataUrlParams = ODataUtils._createUrlParamsArray(mAllParams);
		var aUrlParts = sUrl.split("?");
		if (aUrlParts.length > 1) {
			sUrl = aUrlParts[0];
		}
		return this._addUrlParams(sUrl, aMetadataUrlParams);
	};

	/**
	 * Adds the passed url parameters to the url. If bMeta set to true
	 * also the metadata url params are added. In all other cases the
	 * global defined url parameters are added.
	 *
	 * @param {string} sUrl The metadata url
	 * @param {array} aUrlParams An array of url params
	 * @returns {boolean} Wether consider metadata url params or the not metadata ones
	 * @returns {string} The request URL
	 * @private
	 */
	ODataModel.prototype._addUrlParams = function(sUrl, aUrlParams) {
		var aAllUrlParameters = [];

		if (this.aUrlParams) {
			aAllUrlParameters = aAllUrlParameters.concat(this.aUrlParams);
		}
		if (aUrlParams) {
			aAllUrlParameters = aAllUrlParameters.concat(aUrlParams);
		}
		if (aAllUrlParameters && aAllUrlParameters.length > 0) {
			sUrl += "?" + aAllUrlParameters.join("&");
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
	 * Imports the data form the to the internal storage.
	 *
	 * Nested entries are processed recursively, moved to the canonical location and referenced from the parent entry.
	 * keys are collected in a map for updating bindings
	 *
	 * @param {object} oData Data that should be imported
	 * @param {map} mChangedEntities Map of changed entities
	 * @param {object} oResponse Response where the data came from
	 * @param {string} [sPath] The path to the data
	 * @param {string} [sDeepPath] The deep path to the data
	 * @param {string} [sKey] The cache key to the data if known
	 * @return {string|string[]} Key of imported data or array of keys in case of nested entries
	 * @private
	 */
	ODataModel.prototype._importData = function(oData, mChangedEntities, oResponse, sPath, sDeepPath, sKey) {
		var that = this,
			aList, oResult, oEntry, oCurrentEntry;
			sPath = sPath || "";
			sKey = sKey || "";

		if (oData.results && Array.isArray(oData.results)) {
			aList = [];
			each(oData.results, function(i, entry) {
				var sKey = that._getKey(entry);
				sKey = that._importData(entry, mChangedEntities, oResponse, sPath.substr(0, sPath.lastIndexOf("/")), sDeepPath, sKey);
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

					oResult = that._importData(oProperty, mChangedEntities, oResponse, sNewPath, sNewDeepPath /*, sKey is not available */);
					if (Array.isArray(oResult)) {
						oEntry[sName] = { __list: oResult };
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
			// if we got new data we have to update changed entities
			var oMap = {};
			oMap[sKey] = oEntry;

			//if we detect a preliminary context we need to set preliminary false and flag for update
			if (this.hasContext("/" + sKey) && this.getContext("/" + sKey).isPreliminary()) {
				var oExistingContext = this.getContext("/" + sKey);
				oExistingContext.setUpdated(true);
				oExistingContext.setPreliminary(false);
			}

			this._updateChangedEntities(oMap);
			mChangedEntities[sKey] = true;

			// if no path information available use the key. This should be the case for create/callFunction
			sPath = sPath || '/' + sKey;
			sDeepPath = sDeepPath || sPath;


			var sCanonicalPath = this.resolveFromCache(sDeepPath);
			// Prevents writing invalid entries into cache, like /Product(1) : /Product(2).
			// This could occur, when a navigation target changes on the server and the old target was resolved from cache before invalidation.
            if (sCanonicalPath === "/" + sKey || (sCanonicalPath && sCanonicalPath.split("/").length > 2)) {
				// try to resolve/cache paths containing mutiple nav properties likes "SalesOrderItem(123)/ToProduct/ToSupplier" => Product(123)/ToSupplier
                this._writePathCache(sCanonicalPath, "/" + sKey);
            }

			this._writePathCache(sPath, "/" + sKey);
			this._writePathCache(sDeepPath, "/" + sKey);

			return sKey;
		}
	};

	/**
	 * Writes a new entry into the canonical path cache.
	 *
	 * @param {string} sPath The path is used as cache key.
	 * @param {string} sCanonicalPath The canonical path addressing the same resource.
	 * @private
	 */
	ODataModel.prototype._writePathCache = function(sPath, sCanonicalPath){
		if (sPath && sCanonicalPath/* last condition checks for nav property and parameter like Product(1), Product(2)*/){
			if (!this.mPathCache[sPath]) {
				this.mPathCache[sPath] = {};
			}
			this.mPathCache[sPath].canonicalPath = sCanonicalPath;
			if (!this.mPathCache[sPath].updateKey) {
				this.mPathCache[sPath].updateKey = sPath.substr(sPath.lastIndexOf("("));
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
	 * Mark all entries in the model cache as invalid. Next time a context or list is bound (binding),
	 * the respective entries will be detected as invalid and will be refreshed from the server.
	 *
	 * To refresh all model data use @link sap.ui.model.odata.v2.ODatamModel#refresh
	 *
	 * @param {function} [fnCheckEntry] A function which can be used to restrict invalidation to specific entries,
	 *     gets the entity key and object as parameters and should return true for entities to invalidate.
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
		} else if (vEntry instanceof Context) {
			oEntry = this._getObject(vEntry.getPath());
		}
		if (oEntry && oEntry.__metadata) {
			oEntry.__metadata.invalid = true;
		}
	};

	/**
	 * Invalidate all entries of the given entity type in the model data.
	 *
	 * Mark entries of the provided entity type in the model cache as invalid. Next time a context binding or list binding is done,
	 * the entry will be detected as invalid and will be refreshed from the server.
	 *
	 * @param {string} sEntityType the qualified name of the entity type
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
	 * Private method iterating the registered bindings of this model instance and initiating their check for update
	 *
	 * @param {boolean} bForceUpdate Force update of bindings
	 * @param {boolean} bAsync Asynchronous execution
	 * @param {map} mChangedEntities Map of changed entities
	 * @param {boolean} bMetaModelOnly Update metamodel bindings only
	 * @private
	 */
	ODataModel.prototype.checkUpdate = function(bForceUpdate, bAsync, mChangedEntities, bMetaModelOnly) {
		if (bAsync) {
			if (!this.sUpdateTimer) {
				this.sUpdateTimer = setTimeout(function() {
					this.checkUpdate(bForceUpdate, false, mChangedEntities);
				}.bind(this), 0);
			}
			return;
		}
		if (this.sUpdateTimer) {
			clearTimeout(this.sUpdateTimer);
			this.sUpdateTimer = null;
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
	 * @see sap.ui.model.Model.prototype.bindProperty
	 * @param {string} sPath Path pointing to the property that should be bound;
	 *                 either an absolute path or a path relative to a given <code>oContext</code>
	 * @param {object} [oContext] A context object for the new binding
	 * @param {map} [mParameters] Map of optional parameters for the binding; the ODataModel (v2) currently supports no additional parameters
	 * @returns {sap.ui.model.PropertyBinding} The new property binding
	 * @public
	 */
	ODataModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new ODataPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Creates a new list binding for this model.
	 *
	 * @param {string} sPath Binding path, either absolute or relative to a given <code>oContext</code>
	 * @param {sap.ui.model.Context} [oContext] Binding context referring to this model
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] Initial sort order, can be either a sorter or an array of sorters
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] Predefined filters, can be either a filter or an array of filters
	 * @param {map} [mParameters] Map which contains additional parameters for the binding
	 * @param {string} [mParameters.expand] Value for the OData <code>$expand</code> query parameter which should be included in the request
	 * @param {string} [mParameters.select] Value for the OData <code>$select</code> query parameter which should be included in the request
	 * @param {map} [mParameters.custom] Optional map of custom query parameters (name/value pairs); names of custom parameters must not start with <code>$</code>
	 * @param {sap.ui.model.odata.CountMode} [mParameters.countMode] Count mode for this binding;
	 *           if not specified, the default count mode for this model is used
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode] Operation mode for this binding;
	 *           if not specified, the default operation mode of this model is used
	 * @param {boolean} [mParameters.faultTolerant] Turns on the fault tolerance mode, data is not reset if a backend request returns an error
	 * @param {string} [mParameters.batchGroupId] Sets the batch group ID to be used for requests originating from this binding
	 * @param {int} [mParameters.threshold] Threshold that defines how many entries should be fetched at least
	 *                                      by the binding if <code>operationMode</code> is set to <code>Auto</code>
	 *                                      (See documentation for {@link sap.ui.model.odata.OperationMode.Auto})
	 * @returns {sap.ui.model.ListBinding} The new list binding
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
	 * @see sap.ui.model.Model.prototype.bindTree
	 * @param {string} sPath Binding path, either absolute or relative to a given <code>oContext</code>
	 * @param {sap.ui.model.Context} [oContext] Binding context referring to this model
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] Predefined filters, can be either a filter or an array of filters
	 * @param {map} [mParameters] Map of parameters for the tree binding
	 * @param {object} [mParameters.treeAnnotationProperties] This parameter defines the mapping between data properties and
	 *														the hierarchy used to visualize the tree, if not provided by the services metadata.
	 *														For correct metadata annotation, please check the "SAP Annotations for OData Version 2.0" Specification.
	 * @param {int} [mParameters.treeAnnotationProperties.hierarchyLevelFor] Mapping to the property holding the level information,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeFor] Mapping to the property holding the hierarchy node ID,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyParentNodeFor] Mapping to the property holding the parent node ID,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyDrillStateFor] Mapping to the property holding the drill state for the node,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor] Mapping to the property holding the descendant count for the node.
	 * @param {object} [mParameters.navigation] A map describing the navigation properties between entity sets, which should be used for constructing and paging the tree.
	 * @param {int} [mParameters.numberOfExpandedLevels=0] This property defines the number of levels, which will be expanded initially.
	 *												   Please be aware, that this property leads to multiple backend requests. Default value is 0.
	 * @param {int} [mParameters.rootLevel=0] The root level is the level of the topmost tree nodes, which will be used as an entry point for OData services.
	 *										Conforming to the "SAP Annotations for OData Version 2.0" Specification, the root level must start at 0.
	 *										Default value is therefore 0.
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead: sets the batch group ID to be used for requests originating from this binding
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode] Operation mode for this binding; defaults to the model's default operation mode when not specified
	 * @param {int} [mParameters.threshold] A threshold, which will be used if the operation mode is set to <code>Auto</code>.
	 * 										In case of <code>OperationMode.Auto</code>, the binding tries to fetch (at least) as many entries as the threshold.
	 * 										Also see API documentation for {@link sap.ui.model.odata.OperationMode.Auto}.
	 * @param {boolean} [mParameters.useServersideApplicationFilters] Set this flag if <code>$filter</code> statements should be used for the <code>$count/$inlinecount</code> and data retrieval in the <code>OperationMode.Auto</code>.
	 * 													 Only use this if your backend supports prefiltering the tree and is capable of responding a complete tree hierarchy,
	 * 													 including all inner nodes. To construct the hierarchy on the client, it is mandatory that all filter matches include their complete
	 * 													 parent chain up to the root level.
	 * 													 <code>OperationMode.Client</code> will still request the complete collection without filters, since they will be applied on the client.
	 * @param {boolean} [mParameters.treeState] A tree state handle can be given to the <code>ODataTreeBinding</code> when two conditions are met:
	 * 											 The binding is running in <code>OperationMode.Client</code> AND the <code>sap.ui.table.TreeTable</code> is used.
	 * 											 The feature is only available when using the <code>ODataTreeBindingAdapter</code>, which is automatically applied when using the <code>sap.ui.table.TreeTable</code>.
	 * 											 The tree state handle will contain all necessary information to expand the tree to the given state.
	 * 											 This feature is not supported in <code>OperationMode.Server</code> and <code>OperationMode.Auto</code>.
	 * 											 Please see also the {@link sap.ui.model.odata.ODataTreeBindingAdapter#getCurrentTreeState getCurrentTreeState} function in the
	 * 											 class <code>ODataTreeBindingAdapter</code>.
	 * @param {sap.ui.model.Sorter[]} [aSorters] An array of predefined sorters
	 * @returns {sap.ui.model.TreeBinding} The new tree binding
	 * @public
	 */
	ODataModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters, aSorters) {
		var oBinding = new ODataTreeBinding(this, sPath, oContext, aFilters, mParameters, aSorters);
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
	 * @param {map} [mParameters] Map which contains additional parameters for the binding
	 * @param {string} [mParameters.expand] Value for the OData <code>$expand</code> query parameter which should be included in the request
	 * @param {string} [mParameters.select] Value for the OData <code>$select</code> query parameter which should be included in the request
	 * @param {boolean} [mParameters.preliminaryContext] Whether a preliminary Context will be created
	 * @param {map} [mParameters.custom] Optional map of custom query parameters, names of custom parameters must not start with <code>$</code>.
	 * @param {function} [fnCallBack] Function to be called when context has been created. The parameter of the callback function is the newly created binding context.
	 * @param {boolean} [bReload] Whether to reload data
	 * @return {sap.ui.model.Context} The created binding context, only if the data is already available and the binding context could be created synchronously
	 * @public
	 */
	ODataModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack, bReload) {
		var sResolvedPath,
			sCanonicalPath,
			oNewContext,
			sGroupId,
			sDeepPath,
			that = this, bCanonical;

		// optional parameter handling
		if (oContext !== null && typeof oContext === "object" && !(oContext instanceof sap.ui.model.Context)) {
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
			var bIsRelative = !sPath.startsWith("/");
			if (sResolvedPath) {
				var aParams = [],
				sCustomParams = this.createCustomParams(mParameters);
				if (sCustomParams) {
					aParams.push(sCustomParams);
				}
				if (mParameters && (mParameters.batchGroupId || mParameters.groupId)) {
					sGroupId = mParameters.groupId || mParameters.batchGroupId;
				}
				this.read(sPath, {groupId: sGroupId, urlParameters: aParams, success: handleSuccess, error: handleError, context: oContext, canonicalRequest: bCanonical});
			} else {
				fnCallBack(null); // error - notify to recreate contexts
			}
		}

		if (mParameters && mParameters.createPreliminaryContext) {
			sResolvedPath = this.resolve(sPath, oContext, bCanonical);
			if (!sResolvedPath && bCanonical) {
				sResolvedPath = this.resolve(sPath, oContext);
			}

			oNewContext = this.getContext(sResolvedPath, sDeepPath);
			return oNewContext;
		}

	};

	/**
	 * Updates an existing context with a new path. This is useful for contexts with a temporary, non-canonical path, which should
	 * be replaced once the canonical path is known, without creating a new context instance.
	 *
	 * @param {sap.ui.model.Context} oContext the context
	 * @param {string} sPath the path
	 */
	ODataModel.prototype._updateContext = function(oContext, sPath) {
		if (!sPath.startsWith("/")) {
			throw new Error("Path " + sPath + " must start with a / ");
		}
		oContext.sPath = sPath;
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
	 * @param {string[][]} aExpand Own expand entries as string arrays
	 * @param {string[][]} aSelect Own select entries as string arrays
	 * @returns {string[]} Array of own expand properties
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
			oEntity = this._getObject(sPath),
			aExpand = [], aSelect = [];

		if (!this.oMetadata.isLoaded()) {
			return true;
		}
		oEntityType = this.oMetadata._getEntityTypeByPath(sPath);

		// Created entities should never be reloaded, as they do not exist on
		// the server yet
		if (this._isCreatedEntity(oEntity)) {
			return false;
		}

		function checkReloadNeeded(oEntityType, oEntity, aSelect, aExpand) {
			var aOwnSelect, aOwnExpand,
				vNavData, oNavEntityType, oNavEntity, aNavSelect, aNavExpand,
				sExpand, sSelect;

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
			for (var i = 0; i < aOwnSelect.length; i++) {
				sSelect = aOwnSelect[i];
				if (oEntity[sSelect] === undefined) {
					return true;
				}
			}

			// check expanded entities
			aOwnExpand = that._filterOwnExpand(aExpand, aSelect);
			for (var i = 0; i < aOwnExpand.length; i++) {
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
	 * Creates new context binding for this model.
	 *
	 * @see sap.ui.model.Model.prototype.bindContext
	 * @param {string} sPath Resolved path
	 * @param {sap.ui.model.Context} oContext Context object
	 * @param {map} [mParameters] Map of parameters
	 * @returns {sap.ui.model.ContextBinding} The new context binding
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
		if (vValue instanceof Context) {
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
	 * @returns {string} Key of the entry or <code>undefined</code>
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
	 *
	 * If the path points to a navigation property which has been loaded via <code>$expand</code> then the <code>bIncludeExpandEntries</code>
	 * parameter determines if the navigation property should be included in the returned value or not.
	 * Please note that this currently works for 1..1 navigation properties only.
	 *
	 * @param {string} sPath Path/name of the property
	 * @param {object} [oContext] Context if available to access the property value
	 * @param {boolean} [bIncludeExpandEntries=false] @deprecated Please use {@link #getObject} function with select/expand parameters instead.
	 * This parameter should be set when a URI or custom parameter with a <code>$expand</code> system query option was used to retrieve associated entries embedded/inline.
	 * If true then the <code>getProperty</code> function returns a desired property value/entry and includes the associated expand entries (if any).
	 * Note: A copy and not a reference of the entry will be returned.
	 * @returns {any} Value of the property
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
	 * Returns the JSON object for an entity with the given <code>sPath</code> and optional <code>oContext</code>.
	 *
	 * With the <code>mParameters.select</code> parameter it is possible to specify comma-separated property or navigation property
	 * names which should be included in the result object. This works like the OData <code>$select</code> parameter.
	 * With the <code>mParameters.expand</code> parameter it is possible to specify comma-separated navigation property names
	 * which should be included inline in the result object. This works like the OData <code>$expand</code> parameter.
	 *
	 * This method will return a copy and not a reference of the entity. It does not load any data and may not return all requested
	 * data if it is not available/loaded. If select entries are contained in the parameters and not all selected properties are
	 * available, this method will return <code>undefined</code> instead of incomplete data. If no select entries are defined,
	 * all properties available on the client will be returned.
	 *
	 * Example:<br>
	 * <code>{select: "Products/ProductName, Products", expand:"Products"}</code> will return no properties of the entity itself, but
	 * only the ProductName property of the Products navigation property. If Products/ProductName has not been loaded before, so is not
	 * available on the client, it will return <code>undefined</code>.
	 *
	 * Note:<br>
	 * If <code>mParameters.select</code> is not specified, the returned object could contain model-internal attributes. This may lead to
	 * problems when submitting this data to the service for an update/create operation.
	 * To get a copy of the entity without containing such internal attributes, use <code>{select: "*"}</code> instead.
	 *
	 * @param {string} sPath Path referencing the object
	 * @param {object} [oContext] Context the path should be resolved with, in case it is relative
	 * @param {map} [mParameters] Map of parameters
	 * @param {string} [mParameters.select] Comma-separated list of properties/paths to select
	 * @param {string} [mParameters.expand] Comma-separated list of navigation properties/paths to expand
	 * @returns {any} The value for the given path/context or <code>undefined</code> if data or entity type could not be found or was incomplete
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
			var aOwnExpand, oResultValue,
				aOwnPropSelect, aOwnNavSelect,
				vNavData, oNavEntityType, oNavValue, oNavObject,
				aNavSelect, aNavExpand,
				sExpand, sSelect, aResultProps;

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
			for (var i = 0; i < aOwnPropSelect.length; i++) {
				sSelect = aOwnPropSelect[i];
				if (oValue[sSelect] !== undefined) {
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
			for (var i = 0; i < aOwnExpand.length; i++) {
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
	 * @param {string} sPath Binding path
	 * @param {object} [oContext] Binding context
	 * @param {boolean} [bOriginalValue] Whether to return the original value read from the server even if changes where made
	 * @returns {any} vValue Value for the given path/context
	 * @private
	 */
	ODataModel.prototype._getObject = function(sPath, oContext, bOriginalValue) {
		var oNode = this.isLegacySyntax() ? this.oData : null, oChangedNode, oOrigNode, sResolvedPath,
			iSeparator, sDataPath, sMetaPath, oMetaContext, sKey, oMetaModel;

		sResolvedPath = this.resolve(sPath, oContext, this.bCanonicalRequests);
		if (!sResolvedPath && this.bCanonicalRequests) {
			sResolvedPath = this.resolve(sPath, oContext);
		}

		if (!sResolvedPath) {
			return oNode;
		}

		//check for metadata path
		if (this._isMetadataPath(sResolvedPath)) {
			if (this.oMetadata && this.oMetadata.isLoaded())  {
				if (this.isMetaModelPath(sResolvedPath)) {
					// Metadata binding resolved by ODataMetaModel
					iSeparator = sResolvedPath.indexOf('/##');
					oMetaModel = this.getMetaModel();
					if (!this.bMetaModelLoaded) {
						return null;
					}
					sDataPath = sResolvedPath.substr(0, iSeparator);
					sMetaPath = sResolvedPath.substr(iSeparator + 3);
					oMetaContext = oMetaModel.getMetaContext(sDataPath);
					oNode = oMetaModel.getProperty(sMetaPath, oMetaContext);
				} else {
					// Metadata binding resolved by ODataMetadata
					oNode = this.oMetadata._getAnnotation(sResolvedPath);
				}
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
		//if we have a changed Entity/complex type we need to extend it with the backend data
		if (isPlainObject(oChangedNode)) {
			oNode =  bOriginalValue ? oOrigNode : merge({}, oOrigNode, oChangedNode);
		}
		return oNode;
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
	 * Returns the current security token.
	 *
	 * If the token has not been requested from the server it will be requested first (synchronously).
	 *
	 * @returns {string} The CSRF security token
	 *
	 * @public
	 */
	ODataModel.prototype.getSecurityToken = function() {
		var sToken = this.oSharedServiceData.securityToken;
		if (!sToken) {
			this.refreshSecurityToken();
			sToken = this.oSharedServiceData.securityToken;
		}
		return sToken;
	};

	/**
	 * Returns a promise, which will resolve with the security token as soon as it is available.
	 *
	 * @returns {Promise} A promise on the CSRF security token
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
		var sToken;
		var that = this;
		var sUrl = this._createRequestUrlWithNormalizedPath("/");

		var mTokenRequest = {
			abort: function() {
				this.request.abort();
			}
		};


		function handleSuccess(oData, oResponse) {
			if (oResponse) {
				sToken = that._getHeader("x-csrf-token", oResponse.headers);
				that._setSessionContextIdHeader(that._getHeader("sap-contextid", oResponse.headers));
				if (sToken) {
					that.oSharedServerData.securityToken = sToken;
					that.oSharedServiceData.securityToken = sToken;
					that.pSecurityToken = Promise.resolve(sToken);
					// For compatibility with applications, that are using getHeaders() to retrieve the current
					// CSRF token additionally keep it in the oHeaders object
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
			that._handleError(oError);

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
			var oRequest = that._createRequest(sUrl, "", sRequestType, that._getHeaders(undefined, true), null, null, !!bAsync);
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
	 * Submit changes from the request queue (queue can currently have only one request).
	 *
	 * @param {object} oRequest The request object
	 * @param {function} [fnSuccess] Success callback function
	 * @param {function} [fnError] Error callback function
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

			if (fnError) {
				fnError(oError);
			}
			fnResolveCompleted();
		}

		function readyForRequest(oRequest) {
			if (that.bTokenHandling && (oRequest.method !== "GET" || that.bTokenHandlingForGet)) {
				that.pReadyForRequest = that.securityTokenAvailable();
			}
			return that.pReadyForRequest;
		}

		function submitWithToken() {
			// Make sure requests not requiring a CSRF token don't send one.
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
					} else {
						if (oRequest.parts) {
							each(oRequest.parts, function(i, oPart) {
								oEventInfo = that._createEventInfo(oRequest.request, oPart.fnError);
								that["fireRequest" + sType](oEventInfo);
							});
						} else {
							oEventInfo = that._createEventInfo(oRequest.request, oRequest.fnError);
							that["fireRequest" + sType](oEventInfo);
						}
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
			if (bAborted) {
				oRequestHandle.abort();
			}
		}

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
			if (oError.message == "Request aborted") {
				for (var i = 0; i < oRequest.parts.length; i++){
					that._processAborted(oRequest.parts[i].request, oError);
				}
			} else {
				for (var i = 0; i < oRequest.parts.length; i++) {
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
			mGetEntities = {},
			mEntityTypes = {};

		function processResponse(oRequest, oResponse, bAborted) {
			for (var i = 0; i < oRequest.parts.length; i++) {
				if (bAborted || oRequest.parts[i].request._aborted) {
					that._processAborted(oRequest.parts[i].request, oResponse);
				} else if (oResponse.message) {
					that._processError(oRequest.parts[i].request, oResponse, oRequest.parts[i].fnError);
				} else {
					that._processSuccess(oRequest.parts[i].request, oResponse, oRequest.parts[i].fnSuccess, mGetEntities, mChangeEntities, mEntityTypes);
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

			// Call procesError for all contained requests first
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
					fnError(oAbortedError);
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
					fnError(oAbortedError);
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

		jQuery.extend(oChangeHeader, this.mCustomHeaders, this.oHeaders);

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
	 * @param {string} [mParameters]
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
	 * @param {oRequest} oRequest The request
	 * @param {function} fnSuccess The success callback function
	 * @param {function} fnError The error callback function
	 * @param {object} requestHandle Handle for the requests
	 * @param {boolean} bRefreshAfterChange Enable/Disable updates of all bindings after change operations for the given requests
	 * @private
	 */
	ODataModel.prototype._pushToRequestQueue = function(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError, requestHandle, bRefreshAfterChange) {
		var oRequestGroup = mRequests[sGroupId],
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
			var oGroupEntry = oRequestGroup.map[sRequestKey];
			var oStoredRequest = oGroupEntry.request;
			oRequest.deepPath = oStoredRequest.deepPath;
			if (this.sMessageScope === MessageScope.BusinessObject) {
				oRequest.headers["sap-message-scope"] = oStoredRequest.headers["sap-message-scope"];
			}

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

				// for POST function imports we also need to replace the URI
				oStoredRequest.requestUri = oRequest.requestUri;
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
		} else {
			var oGroupEntry = {
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
	 * @returns {object|array} oRequestHandle The request handle: array if multiple requests are sent
	 * @private
	 */
	ODataModel.prototype._processRequestQueue = function(mRequests, sGroupId, fnSuccess, fnError){
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
						each(oRequestGroup.changes, function(sChangeSetId, aChangeSet){
							oChangeSet = {__changeRequests:[]};
							aChanges = [];
							for (var i = 0; i < aChangeSet.length; i++) {
								//increase laundering
								sPath = '/' + that.getKey(aChangeSet[i].request.data);
								that.increaseLaundering(sPath, aChangeSet[i].request.data);
								checkAbort(aChangeSet[i], oWrappedBatchRequestHandle);
								if (aChangeSet[i].parts.length > 0) {
									that.removeInternalMetadata(aChangeSet[i].request.data);
									oChangeSet.__changeRequests.push(aChangeSet[i].request);
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
	 * @returns {boolean} bSuccess Processed successfully
	 * @private
	 */
	ODataModel.prototype._processSuccess = function(oRequest, oResponse, fnSuccess, mGetEntities, mChangeEntities, mEntityTypes, bBatch, aRequests) {
		var oResultData = oResponse.data, oImportData, bContent, sUri, sPath, aParts, oEntity,
		oEntityMetadata, mLocalGetEntities = {}, mLocalChangeEntities = {}, that = this;

		if (!bBatch) {
			bContent = !(oResponse.statusCode === 204 || oResponse.statusCode === '204');

			sUri = oRequest.requestUri;
			sPath = sUri.replace(this.sServiceUrl,"");
			//in batch requests all paths are relative
			if (!sPath.startsWith('/')) {
				sPath = '/' + sPath;
			}

			// In order to retrieve the EntityType, the path should be normalized (URL parameters should be removed)
			var sNormalizedPath = this._normalizePath(sPath);
			var oEntityType = this.oMetadata._getEntityTypeByPath(sNormalizedPath);

			// FunctionImports shouldn't be resolved canonical
			var bCanonical = oEntityType ? !oEntityType.isFunction : true;
			sPath = this._normalizePath(sPath, undefined, bCanonical);

			// decrease laundering
			this.decreaseLaundering(sPath, oRequest.data);
			this._decreaseDeferredRequestCount(oRequest);

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
					that._importData(oImportData, mLocalGetEntities, oResponse);
				} else {
					that._importData(oImportData, mLocalGetEntities, oResponse, sPath, oRequest.deepPath);
				}
				oResponse._imported = true;
			}

			oEntity = this._getEntity(oRequest.key);
			if (mLocalGetEntities && oEntity && oEntity.__metadata.created && oEntity.__metadata.created.functionImport) {
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
					var oMap = {};
					oMap[aParts[1]] = oRequest.data;
					this._updateChangedEntities(oMap);
				}
				//for delete requests delete data in model (exclude $links)
				if (oRequest.method === "DELETE" && aParts[2] !== "$links") {
					this._removeEntity(aParts[1]);
				}
			}
			//get entityType for creates
			if (bContent && oRequest.method === "POST") {
				oEntityMetadata = this.oMetadata._getEntityTypeByPath(sPath);
				if (oEntityMetadata) {
					mEntityTypes[oEntityMetadata.entityType] = true;
				}
				if (oRequest.key) { // e.g. /myEntity
					// for createEntry entities change context path to new one
					if (oRequest.created) {
						var sKey = this._getKey(oResultData); // e.g. /myEntity-4711
						// rewrite context for new path
						var oContext = this.getContext("/" + oRequest.key);
						oContext.bCreated = false;
						this._updateContext(oContext, '/' + sKey);
						oContext.setUpdated(true);
						// register function to reset updated flag call as callAfterUpdate
						this.callAfterUpdate(function() {
							oContext.setUpdated(false);
						});
						//delete created flag after successful creation
						oEntity = this._getEntity(sKey);
						if (oEntity) {
							delete oEntity.__metadata.created;
						}
					}
					// remove old entity/context for created and function imports
					this._removeEntity(oRequest.key);
				}
			}

			// Parse messages from the back-end
			this._parseResponse(oResponse, oRequest, mLocalGetEntities, mLocalChangeEntities);

			// Add the Get and Change entities from this request to the main ones (which differ in case of batch requests)
			jQuery.extend(mGetEntities, mLocalGetEntities);
			jQuery.extend(mChangeEntities, mLocalChangeEntities);

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
		var sPath, oError = this._handleError(oResponse, oRequest);

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

	var oAbortedError = {
		message: "Request aborted",
		statusCode: 0,
		statusText: "abort",
		headers: {},
		responseText: ""
	};

	/**
	 * Process request response for aborted requests.
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {boolean} bBatch Process success for single/batch request
	 * @private
	 */
	ODataModel.prototype._processAborted = function(oRequest, oResponse, bBatch) {
		var sPath;
		if (!bBatch) {
			// decrease laundering
			sPath = '/' + this.getKey(oRequest.data);
			this.decreaseLaundering(sPath, oRequest.data);
			this._decreaseDeferredRequestCount(oRequest);
		}

		// If no response is contained, request was never sent and completes event can be omitted
		if (oResponse) {
			var oEventInfo = this._createEventInfo(oRequest, oAbortedError);
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
	 * @param {string} sKey Key of the entity to change
	 * @param {object} oData The entry data
	 * @param {boolean} [sUpdateMethod] Sets <code>MERGE/PUT</code> method, defaults to <code>MERGE</code> if not provided
	 * @returns {object} The request object
	 * @private
	 */
	ODataModel.prototype._processChange = function(sKey, oData, sUpdateMethod, sDeepPath) {
		var oPayload, oEntityType, mParams, sMethod, sETag, sUrl, bCreated, mHeaders, aUrlParams, oRequest, oUnModifiedEntry, that = this;

		if (sDeepPath && this.mChangedEntities[sKey] && this.mChangedEntities[sKey].__metadata) {
			// store or update deep path
			this.mChangedEntities[sKey].__metadata.deepPath = sDeepPath;
		} else if (!sDeepPath && this.mChangedEntities[sKey] && this.mChangedEntities[sKey].__metadata && this.mChangedEntities[sKey].__metadata.deepPath){
			// retrieve deep path
			sDeepPath = this.mChangedEntities[sKey].__metadata.deepPath;
		}

		// delete expand properties = navigation properties
		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);

		//default to MERGE
		if (!sUpdateMethod) {
			sUpdateMethod = "MERGE";
		}

		// do a copy of the payload or the changes will be deleted in the model as well (reference)
		oPayload = merge({}, this._getObject('/' + sKey, true), oData);

		if (oData.__metadata && oData.__metadata.created){
			sMethod = oData.__metadata.created.method ? oData.__metadata.created.method : "POST";
			sKey = oData.__metadata.created.key;
			bCreated = true;
			mParams = oData.__metadata.created;
			if (oData.__metadata.created.functionImport){
				// update request url params with changed data from payload
				mParams.urlParameters = this._createFunctionImportParameters(oData.__metadata.created.key, sMethod, oPayload );
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
		}

		// remove any yet existing references which should already have been deleted
		oPayload = this._removeReferences(oPayload);

		//get additional request info for created entries
		aUrlParams = mParams && mParams.urlParameters ? ODataUtils._createUrlParamsArray(mParams.urlParameters) : undefined;
		mHeaders = mParams ? this._getHeaders(mParams.headers) : this._getHeaders();
		sETag = mParams && mParams.eTag ? mParams.eTag : this.getETag(oPayload);

		sUrl = this._createRequestUrl('/' + sKey, null, aUrlParams, this.bUseBatch);

		oRequest = this._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oPayload, sETag);


		//for createEntry requests we need to flag request again
		if (bCreated) {
			oRequest.created = true;
		}

		if (this.bUseBatch) {
			oRequest.requestUri = oRequest.requestUri.replace(this.sServiceUrl + '/','');
		}

		return oRequest;
	};

	/**
	 * Resolves batch group settings for an entity.
	 *
	 * @param {string} sKey Key of the entity
	 * @returns {object} Batch group info
	 * @private
	 */
	ODataModel.prototype._resolveGroup = function(sKey) {
		var oChangeGroup, oEntityType, mParams, sGroupId, sChangeSetId, oData;

		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);
		oData = this._getObject('/' + sKey);
		if (oData) {
			mParams = oData.__metadata.created;
			//for created entries the group information is retrieved from the params
			if (mParams) {
				return {groupId: mParams.groupId, changeSetId: mParams.changeSetId};
			}
		}
		//resolve groupId/changeSetId
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
		oEntry = this._getObject(sUrl.split("?")[0]);
		sETag = this._getHeader("etag", oResponse.headers);
		if (oEntry && oEntry.__metadata && sETag){
			oEntry.__metadata.etag = sETag;
		}
	};

	/**
	 * Error handling for requests.
	 *
	 * @param {object} oError The error object
	 * @param {object} oRequest The request object
	 * @returns {map} A map of error information
	 * @private
	 */
	ODataModel.prototype._handleError = function(oError, oRequest) {
		var mParameters = {}, /* fnHandler, */ sToken;
		var sErrorMsg = "The following problem occurred: " + oError.message;


		mParameters.message = oError.message;
		if (oError.response){
			// Parse messages from the back-end
			this._parseResponse(oError.response, oRequest);

			if (this.bTokenHandling) {
				// if XSRFToken is not valid we get 403 with the x-csrf-token header : Required.
				// a new token will be fetched in the refresh afterwards.
				sToken = this._getHeader("x-csrf-token", oError.response.headers);
				if (oError.response.statusCode == '403' && sToken && sToken.toLowerCase() === "required") {
					this.resetSecurityToken();
				}
			}
			sErrorMsg += oError.response.statusCode + "," +
			oError.response.statusText + "," +
			oError.response.body;
			mParameters.statusCode = oError.response.statusCode;
			mParameters.statusText = oError.response.statusText;
			mParameters.headers = oError.response.headers;
			mParameters.responseText = oError.response.body;
		}
		Log.fatal(sErrorMsg);

		return mParameters;
	};

	/**
	 * Return requested data as object if the data has already been loaded and stored in the model.
	 *
	 * @param {string} sPath A string containing the path to the data object that should be returned.
	 * @param {object} [oContext] The optional context which is used with the <code>sPath</code> to retrieve the requested data.
	 * @param {boolean} [bIncludeExpandEntries=null] This parameter should be set when a URI or custom parameter
	 * with a <code>$expand</code> system query option was used to retrieve associated entries embedded.
	 * If set to <code>true</code> then the <code>getProperty</code> function returns a desired property value or entry and includes the associated expand entries (if any).
	 * If set to <code>false</code> the associated/expanded entry properties are removed and not included in the
	 * desired entry as properties at all. This is useful for performing updates on the base entry only. Note: A copy, not a reference of the entry will be returned.
	 *
	 * @return {object} Object containing the requested data if the path is valid.
	 * @public
	 * @deprecated As of version 1.24, please use {@link #getProperty} instead
	 */
	ODataModel.prototype.getData = function(sPath, oContext, bIncludeExpandEntries) {
		return this.getProperty(sPath, oContext, bIncludeExpandEntries);
	};

	ODataModel.prototype._getODataHandler = function(sUrl) {
		if (sUrl.indexOf("$batch") > -1) {
			return OData.batchHandler;
		} else if (sUrl.indexOf("$count") > -1) {
			return undefined;
		}else if (this.bJSON) {
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
	 * @returns {string} The found ETag (or <code>null</code> if none could be found)
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
	 * @param {string} sMethod The request method
	 * @param {map} [mHeaders] A map of headers
	 * @param {object} [oData] The data for this request
	 * @param {string} [sETag] The ETag
	 * @param {boolean} [bAsync] Async request
	 * @param {boolean} [bRefresh]
	 *   Whether the read request is triggered while refreshing a binding. If message scope is
	 *   <code>sap.ui.model.odata.MessageScope.BusinessObject</code>, all non-persistent messages
	 *   for the requested resources and its child resources are removed.
	 * @return {object} Request object
	 * @private
	 */
	ODataModel.prototype._createRequest = function(sUrl, sDeepPath, sMethod, mHeaders, oData, sETag,
			bAsync, bRefresh) {
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

		// format handling
		if (sMethod === "MERGE" && !this.bUseBatch) {
			mHeaders["x-http-method"] = "MERGE";
			sMethod = "POST";
		}

		// deep path handling
		if (this.sMessageScope === MessageScope.BusinessObject) {
			assert(this.bIsMessageScopeSupported, "MessageScope 'BusinessObject' is not supported by the service");
			mHeaders["sap-message-scope"] = this.sMessageScope;
		}

		var oRequest = {
			headers : mHeaders,
			requestUri : sUrl,
			method : sMethod,
			user: this.sUser,
			password: this.sPassword,
			async: bAsync,
			deepPath: sDeepPath,
			refresh: bRefresh
		};

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
	 * Executes the passed process request method when the metadata is available and takes care
	 * of properly wrapping the response handler and allow request abortion
	 *
	 * @param {function} [fnProcessRequest] Function to prepare the request and add it to the request queue
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 */
	ODataModel.prototype._processRequest = function(fnProcessRequest, fnError, bDeferred) {
		var oRequestHandle, oRequest,
			bAborted = false,
			that = this;

		if (this.bWarmup) {
			return {
				abort: function() {}
			};
		}

		if (bDeferred){
			this.iPendingDeferredRequests++;
		}

		oRequestHandle = {
				abort: function() {
					if (bDeferred && !bAborted){
						// Since in some scenarios no request object was created yet, the counter is decreased manually.
						that.iPendingDeferredRequests--;
					}
					// Call error handler synchronously
					if (!bAborted && fnError) {
						fnError(oAbortedError);
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

		this.oMetadata.loaded().then(function() {

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
	 * 		The path is concatenated to the sServiceUrl which was specified
	 * 		in the model constructor.
	 * @param {object} oData Data of the entry that should be updated.
	 * @param {map} [mParameters] Optional, can contain the following attributes:
	 * @param {object} [mParameters.context] If specified the sPath has to be is relative to the path given with the context.
	 * @param {function} [mParameters.success] A callback function which is called when the data has been successfully updated.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 * 		The handler can have the parameter <code>oError</code> which contains additional error information.
	 * @param {string} [mParameters.eTag] If specified, the <code>If-Match</code> header will be set to this ETag.
	 * 		Caution: This feature in not officially supported as using asynchronous requests can lead
	 * 		to data inconsistencies. If you decide to use this feature nevertheless, you have to make
	 * 		sure that the request is completed before the data is processed any further.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation. See {@link #setRefreshAfterChange}
	           If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 *
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
	 * Trigger a <code>POST</code> request to the OData service that was specified in the model constructor.
	 *
	 * Please note that deep creates are not supported and may not work.
	 *
	 * @param {string} sPath A string containing the path to the collection where an entry
	 *		should be created. The path is concatenated to the service URL
	 *		which was specified in the model constructor.
	 * @param {object} oData Data of the entry that should be created.
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified , <code>sPath</code> has to be relative to the path given with the context.
	 * @param {function} [mParameters.success] A callback function which is called when the data has
	 *		been successfully retrieved. The handler can have the
	 *		following parameters: <code>oData</code> and <code>response</code>. The <code>oData</code> parameter contains the data of the newly created entry if it is provided by the backend.
	 *		The <code>response</code> parameter contains information about the response of the request.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 *		The handler can have the parameter <code>oError</code> which contains additional error information.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation. See {@link #setRefreshAfterChange}
	           If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.create = function(sPath, oData, mParameters) {
		var oRequest, sUrl, oEntityMetadata,
		oContext, fnSuccess, fnError, mUrlParams, mRequests,
		mHeaders, aUrlParams, sEtag, sGroupId, sMethod, sChangeSetId, bRefreshAfterChange,
		bDeferred, that = this, sNormalizedPath, sDeepPath, bCanonical;

		// The object parameter syntax has been used.
		if (mParameters) {
			oContext   = mParameters.context;
			mUrlParams = mParameters.urlParameters;
			fnSuccess  = mParameters.success;
			fnError    = mParameters.error;
			sGroupId	= mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId	= mParameters.changeSetId;
			sEtag		= mParameters.eTag;
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
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oData, sEtag);
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
	 * Trigger a <code>DELETE</code> request to the OData service that was specified in the model constructor.
	 *
	 * @param {string} sPath A string containing the path to the data that should be removed.
	 *		The path is concatenated to the service URL which was specified in the model constructor.
	 * @param {object} [mParameters] Optional, can contain the following attributes:
	 * @param {object} [mParameters.context] If specified, <code>sPath</code> has to be relative to the path given with the context.
	 * @param {function} [mParameters.success] A callback function which is called when the data has been successfully retrieved.
	 *		The handler can have the following parameters: <code>oData</code> and <code>response</code>.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 *		The handler can have the parameter: <code>oError</code> which contains additional error information.
	 * @param {string} [mParameters.eTag] If specified, the <code>If-Match</code> header will be set to this ETag.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation. See {@link #setRefreshAfterChange}
	           If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 *
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.remove = function(sPath, mParameters) {
		var oContext, sKey, fnSuccess, fnError, oRequest, sUrl, sGroupId,
		sChangeSetId, sETag, bRefreshAfterChange,
		mUrlParams, mHeaders, aUrlParams, sMethod, mRequests,
		bDeferred, that = this, sNormalizedPath, sDeepPath, bCanonical = this.bCanonicalRequests;

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
			sKey = sUrl.substr(sUrl.lastIndexOf('/') + 1);
			//remove query params if any
			if (sKey.indexOf('?') !== -1) {
				sKey = sKey.substr(0, sKey.indexOf('?'));
			}
			that._removeEntity(sKey);

			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
		}

		return this._processRequest(function(requestHandle) {
			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, undefined, sETag);

			mRequests = that.mRequests;
			if (bDeferred) {
				mRequests = that.mDeferredRequests;
			}

			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, handleSuccess, fnError, requestHandle, bRefreshAfterChange);

			return oRequest;
		}, fnError, bDeferred);
	};

	/**
	 * Trigger a request to the function import OData service that was specified in the model constructor.
	 *
	 * If the return type of the function import is either an entity type or a collection of an entity type,
	 * then the changes are reflected in the model. Otherwise they are ignored, and the <code>response</code> can
	 * be processed in the <code>success</code> callback.
	 *
	 * @param {string} sFunctionName A string containing the name of the function to call. The name is concatenated to the service URL which was
	 *        specified in the model constructor.
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {string} [mParameters.method='GET'] HTTP method to use for the function call, should match the metadata for the function import
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {function} [mParameters.success] A callback function which is called when the data has been successfully retrieved. The handler can have
	 *        the following parameters: <code>oData</code> and <code>response</code>.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed.
	 *		The handler can have the parameter: <code>oError</code> which contains additional error information.
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.eTag] If the function import changes an entity, the ETag for this entity could be passed with this parameter
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation. See {@link #setRefreshAfterChange}
	           If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 *
	 * @return {object} An object which has a <code>contextCreated</code> function that returns a <code>Promise</code>.
	 *         This resolves with the created {@link sap.ui.model.Context}.
	 *         In addition it has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 *
	 */
	ODataModel.prototype.callFunction = function (sFunctionName, mParameters) {
		var oRequest, sUrl,
			oFunctionMetadata,
			mRequests,
			mUrlParams,
			aUrlParams,
			fnSuccess, fnError,
			sMethod = "GET",
			sGroupId,
			sChangeSetId,
			mHeaders,
			sETag,
			that = this,
			sKey,
			oContext,
			fnResolve,
			fnReject,
			pContextCreated,
			oRequestHandle,
			bRefreshAfterChange,
			oData = {};

		if (mParameters) {
			sGroupId 		= mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId 	= mParameters.changeSetId;
			sMethod			= mParameters.method ? mParameters.method : sMethod;
			mUrlParams		= Object.assign({}, mParameters.urlParameters);
			sETag			= mParameters.eTag;
			fnSuccess		= mParameters.success;
			fnError			= mParameters.error;
			mHeaders		= mParameters.headers;
			bRefreshAfterChange = mParameters.refreshAfterChange;
		}
		bRefreshAfterChange = this._getRefreshAfterChange(bRefreshAfterChange, sGroupId);

		if (!sFunctionName.startsWith("/")) {
			Log.fatal(this + " callFunction: path '" + sFunctionName + "' must be absolute!");
			return;
		}

		mHeaders = this._getHeaders(mHeaders);

		pContextCreated = new Promise(function(resolve, reject) {
			fnResolve = resolve;
			fnReject = reject;
		});

		oRequestHandle = this._processRequest(function(requestHandle) {
			oFunctionMetadata = that.oMetadata._getFunctionImportMetadata(sFunctionName, sMethod);
			assert(oFunctionMetadata, that + ": Function " + sFunctionName + " not found in the metadata !");
			if (!oFunctionMetadata) {
				fnReject();
				return;
			}
			/* 	check returnType and create $results navprop
				we do not create $result when primitive/complex types will be returned */
			var bReturnsEntity = oFunctionMetadata.entitySet || oFunctionMetadata.entitySetPath;
			// default: $result is a collection of entities
			if (bReturnsEntity) {
				oData.$result = {__list: []};
				// single entry?
				if (oFunctionMetadata.returnType && oFunctionMetadata.returnType.indexOf("Collection") == -1) {
					oData.$result = {__ref: {}};
				}
			}
			if (oFunctionMetadata.parameter != null) {
				each(oFunctionMetadata.parameter, function (iIndex, oParam) {
					oData[oParam.name] = that._createPropertyValue(oParam.type);
					if (mUrlParams && mUrlParams[oParam.name] !== undefined) {
						oData[oParam.name] = mUrlParams[oParam.name];
						mUrlParams[oParam.name] = ODataUtils.formatValue(mUrlParams[oParam.name], oParam.type);
					} else {
						Log.warning(that + " - No value for parameter '" + oParam.name + "' found!'");
					}
				});
			}
			// add entry to model data
			// remove starting / for key only
			sKey = sFunctionName.substring(1) + "('" + uid() + "')";
			oData.__metadata = {uri: that.sServiceUrl + '/' + sKey, created: {
				key: sFunctionName.substring(1),
				success: fnSuccess,
				error: fnError,
				headers: mHeaders,
				method: sMethod,
				groupId: sGroupId,
				changeSetId: sChangeSetId,
				eTag: sETag,
				functionImport: true
			}};

			sKey = that._addEntity(oData);
			oContext = that.getContext("/" + sKey);
			that._writePathCache("/" + sKey, "/" + sKey);
			fnResolve(oContext);

			aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

			sUrl = that._createRequestUrlWithNormalizedPath(sFunctionName, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, that.resolveDeep(sFunctionName, oContext), sMethod, mHeaders, undefined, sETag);
			oRequest.key = sKey;

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError, requestHandle, bRefreshAfterChange);

			return oRequest;
		}, fnError);

		oRequestHandle.contextCreated = function() {
			return pContextCreated;
		};

		return oRequestHandle;
	};

	ODataModel.prototype._createFunctionImportParameters = function(sFunctionName, sMethod, mParams) {
		var mUrlParams = jQuery.extend(true, {}, mParams);
		delete mUrlParams.__metadata;
		delete mUrlParams["$result"];
		var oFunctionMetadata = this.oMetadata._getFunctionImportMetadata(sFunctionName, sMethod);
		assert(oFunctionMetadata, this + ": Function " + sFunctionName + " not found in the metadata !");
		if (!oFunctionMetadata) {
			return;
		}

		if (oFunctionMetadata.parameter != null) {
			each(oFunctionMetadata.parameter, function (iIndex, oParam) {
				if (mUrlParams && mUrlParams[oParam.name] !== undefined) {
					mUrlParams[oParam.name] = ODataUtils.formatValue(mUrlParams[oParam.name], oParam.type);
				}
			});
		}
		return mUrlParams;
	};

	/**
	 * Trigger a <code>GET</code> request to the OData service that was specified in the model constructor.
	 *
	 * The data will be stored in the model. The requested data is returned with the response.
	 *
	 * @param {string} sPath A string containing the path to the data which should
	 *		be retrieved. The path is concatenated to the service URL
	 *		which was specified in the model constructor.
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified, <code>sPath</code> has to be relative to the path
	 * 		given with the context.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {sap.ui.model.Filter[]} [mParameters.filters] An array of filters to be included in the request URL
	 * @param {sap.ui.model.Sorter[]} [mParameters.sorters] An array of sorters to be included in the request URL
	 * @param {function} [mParameters.success] A callback function which is called when the data has
	 *		been successfully retrieved. The handler can have the
	 *		following parameters: <code>oData</code> and <code>response</code>. The <code>oData</code> parameter contains the data of the retrieved data.
	 *		The <code>response</code> parameter contains further information about the response of the request.
	 * @param {function} [mParameters.error] A callback function which is called when the request
	 * 		failed. The handler can have the parameter: <code>oError</code> which contains additional error information.
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {boolean} [mParameters._refresh] Private parameter for internal usage
	 *
	 * @return {object} An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.read = function(sPath, mParameters) {
		var sDeepPath, oEntityType, sETag, oFilter, sFilterParams, sMethod, sNormalizedPath,
			sNormalizedTempPath, oRequest, mRequests, sSorterParams, sUrl, aUrlParams,
			bCanonical, oContext, fnError, aFilters, sGroupId, mHeaders, bRefresh, aSorters,
			fnSuccess, mUrlParams,
			that = this;


		if (mParameters) {
			/* Whether the read request is triggered while refreshing a binding. If message scope is
			 * <code>sap.ui.model.odata.MessageScope.BusinessObject</code>, then all non-persistent
			 * messages for the requested resources and its child resources are removed. See
			 * {@link sap.ui.model.odata.ODataMessageParser#_propagateMessages}
			 */
			bRefresh = mParameters._refresh;
			bCanonical = mParameters.canonicalRequest;
			oContext = mParameters.context;
			fnError = mParameters.error;
			aFilters = mParameters.filters;
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			mHeaders = mParameters.headers;
			aSorters = mParameters.sorters;
			fnSuccess = mParameters.success;
			mUrlParams = mParameters.urlParameters;
		}
		bCanonical = this._isCanonicalRequestNeeded(bCanonical);

		//if the read is triggered via a refresh we should use the refreshGroupId instead
		if (this.sRefreshGroupId) {
			sGroupId = this.sRefreshGroupId;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		mHeaders = this._getHeaders(mHeaders, true);

		sMethod = "GET";
		sETag = this._getETag(sPath, oContext);

		var oRequestHandle = {
			abort: function() {
				if (oRequest) {
					oRequest._aborted = true;
				}
			}
		};

		var sTempPath = sPath;
		var iIndex = sPath.indexOf("$count");
		// check if we have a manual count request with filters. Then we have to manually adjust the path.
		if (iIndex !== -1) {
			sTempPath = sPath.substring(0, iIndex - 1);
		}
		sNormalizedTempPath = this._normalizePath(sTempPath, oContext, bCanonical);

		sNormalizedPath = this._normalizePath(sPath, oContext, bCanonical);
		sDeepPath = this.resolveDeep(sPath, oContext);



		function createReadRequest(requestHandle) {
			// Add filter/sorter to URL parameters
			sSorterParams = ODataUtils.createSortParams(aSorters);
			if (sSorterParams) {
				aUrlParams.push(sSorterParams);
			}

			oEntityType = that.oMetadata._getEntityTypeByPath(sNormalizedTempPath);
			oFilter = FilterProcessor.groupFilters(aFilters);
			sFilterParams = ODataUtils.createFilterParams(oFilter, that.oMetadata, oEntityType);
			if (sFilterParams) {
				aUrlParams.push(sFilterParams);
			}

			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, null, sETag,
				undefined, bRefresh);

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
	 * Return the parsed XML metadata as a Javascript object.
	 *
	 * Please note that the metadata is loaded asynchronously and this function might return undefined because the
	 * metadata has not been loaded yet.
	 * In this case attach to the <code>metadataLoaded</code> event to get notified when the metadata is available and then call this function.
	 *
	 * @return {Object} Metadata object
	 * @public
	 */
	ODataModel.prototype.getServiceMetadata = function() {
		if (this.oMetadata && this.oMetadata.isLoaded()) {
			return this.oMetadata.getServiceMetadata();
		}
	};

	/**
	 * Returns a promise for the loaded state of the metadata.
	 *
	 * The promise won't get rejected in case the metadata loading failed but is only resolved if the metadata is loaded successfully.
	 * If <code>refreshMetadata</code> function is called after this promise is already resolved you should rely on the promise returned by
	 * <code>refreshMetadata</code> to get information about the refreshed metadata loaded state.
	 *
	 * The Metadata needs to be loaded prior to performing OData calls.
	 * Chaining to the returned promise ensures that all required parameters have been loaded, e.g. authentication token.
	 *
	 * @example
	 * var oModel  = this.oModel; // v2.ODataModel
	 * oModel.metadataLoaded().then(function() {
	 *      // model is ready now
	 *      oModel.createKey("PERSON", {"ID" : 4711, "TASK_GUID": "myguid"});
	 * });
	 *
	 *
	 * @public
	 * @returns {Promise} A promise on metadata loaded state
	 *
	 * @since 1.30
	 */
	ODataModel.prototype.metadataLoaded = function() {
		var pMetadataLoaded = this.oMetadata.loaded();
		if (this.bLoadAnnotationsJoined) {
			// In case annotations are loaded "joined" with metadata, delay the metadata promise until annotations are
			// either loaded or failed
			var fnChainMetadataLoaded = function() {
				return pMetadataLoaded;
			};

			return this.pAnnotationsLoaded.then(fnChainMetadataLoaded, fnChainMetadataLoaded);
		} else {
			return pMetadataLoaded;
		}
	};

	/**
	 * Returns a promise that resolves with an array containing information about the initially loaded annotations.
	 *
	 * <b>Important</b>: This covers the annotations that were given to the model constructor, not the ones that might have
	 * been added later on using the protected API method {@link #addAnnotationUrl}. In order to get information about those,
	 * the event <code>annotationsLoaded</code> can be used.
	 *
	 * @returns {Promise} A promise to load the annotation URLs that were given to the model on instantiation
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
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] Defines the group that should be submitted. If not specified, all deferred groups will be submitted. Requests belonging to the same group will be bundled in one batch request.
	 * @param {function} [mParameters.success] A callback function which is called when the data has been successfully updated. The handler can have the following parameters: <code>oData</code>. <code>oData</code> contains the
	 * parsed response data as a Javascript object. The batch response is in the <code>__batchResponses</code> property which may contain further <code>__changeResponses</code> in an array depending on the amount of changes
	 * and change sets of the actual batch request which was sent to the backend.
	 * The changeResponses contain the actual response of that change set in the <code>response</code> property.
	 * For each change set there is also a <code>__changeResponse</code> property.
	 * @param {function} [mParameters.error] A callback function which is called when the request failed. The handler can have the parameter: <code>oError</code> which contains additional error information
	 * @return {object} An object which has an <code>abort</code> function to abort the current request or requests
	 *
	 * @public
	 */
	ODataModel.prototype.submitChanges = function(mParameters) {
		var oRequest, sGroupId, oGroupInfo, fnSuccess, fnError,
			oRequestHandle, vRequestHandleInternal,
			bAborted = false, sMethod, mChangedEntities,
			bRefreshAfterChange = this.bRefreshAfterChange,
			mParams,
			that = this;

		if (mParameters) {
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			fnSuccess =	mParameters.success;
			fnError = mParameters.error;
			// ensure merge parameter backwards compatibility
			if (mParameters.merge !== undefined) {
				sMethod =  mParameters.merge ? "MERGE" : "PUT";
			}
		}

		if (sGroupId && !this.mDeferredGroups[sGroupId]) {
			Log.fatal(this + " submitChanges: \"" + sGroupId + "\" is not a deferred group!");
		}

		mChangedEntities = merge({}, that.mChangedEntities);

		this.oMetadata.loaded().then(function() {
			each(mChangedEntities, function(sKey, oData) {
				oGroupInfo = that._resolveGroup(sKey);
				if (oGroupInfo.groupId === sGroupId || !sGroupId) {
					oRequest = that._processChange(sKey, oData, sMethod || that.sDefaultUpdateMethod);
					oRequest.key = sKey;
					//get params for created entries: could contain success/error handler
					mParams = oData.__metadata && oData.__metadata.created ? oData.__metadata.created : {};
					var oRequestHandle = {
						abort: function() {
							oRequest._aborted = true;
						}
					};
					if (oGroupInfo.groupId in that.mDeferredGroups) {
						that._pushToRequestQueue(that.mDeferredRequests, oGroupInfo.groupId, oGroupInfo.changeSetId,
							oRequest, mParams.success, mParams.error, oRequestHandle, bRefreshAfterChange);
					}
				}
			});

			// Set undefined refreshAfterChange flags
			// If undefined => overwrite with current global refreshAfterChange state
			var sRequestGroupId, sChangeSetId, oRequestGroup, aChanges, oChange, i;
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

			vRequestHandleInternal = that._processRequestQueue(that.mDeferredRequests, sGroupId, fnSuccess, fnError);
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

	/*
	 * updateChangedEntities
	 * @private
	 * @param {map} mChangedEntities Map of changedEntities
	 */
	ODataModel.prototype._updateChangedEntities = function(mChangedEntities) {
		var that = this, sRootPath, oEntityType, oNavPropRefInfo;

		function updateChangedEntities(oOriginalObject, oChangedObject, sCurPath) {
			each(oChangedObject,function(sKey) {
				var sActPath = sCurPath + '/' + sKey;
				if (isPlainObject(oChangedObject[sKey]) && isPlainObject(oOriginalObject[sKey])) {
					updateChangedEntities(oOriginalObject[sKey], oChangedObject[sKey], sActPath);
					if (isEmptyObject(oChangedObject[sKey])) {
						delete oChangedObject[sKey];
					}
				} else if (deepEqual(oChangedObject[sKey], oOriginalObject[sKey]) && !that.isLaundering(sActPath)) {
					delete oChangedObject[sKey];
					// When current object is the entity itself check for matching navigation property in changed
					// entity data and take care of it as well
					if (sCurPath === sRootPath) {
						oEntityType = that.oMetadata._getEntityTypeByPath(sRootPath);
						oNavPropRefInfo = oEntityType && that.oMetadata._getNavPropertyRefInfo(oEntityType, sKey);
						if (oNavPropRefInfo && oChangedObject[oNavPropRefInfo.name]) {
							// if the nav prop related to the matching property is also set, set it on original
							// entry and remove from changed entity
							oOriginalObject[oNavPropRefInfo.name] = oChangedObject[oNavPropRefInfo.name];
							delete oChangedObject[oNavPropRefInfo.name];
						}
					}
				}
			});
		}

		each(mChangedEntities, function(sKey, oData) {
			if (sKey in that.mChangedEntities) {
				var oEntry = that._getObject('/' + sKey, null, true);
				var oChangedEntry = that._getObject('/' + sKey);

				merge(oEntry, oData);

				sRootPath = '/' + sKey;

				var sDeepPath = that.removeInternalMetadata(oChangedEntry).deepPath;
				updateChangedEntities(oEntry, oChangedEntry, sRootPath);

				if (isEmptyObject(oChangedEntry)) {
					delete that.mChangedEntities[sKey];
					that.abortInternalRequest(that._resolveGroup(sKey).groupId, {requestKey: sKey});
				} else {
					that.mChangedEntities[sKey] = oChangedEntry;
					oChangedEntry.__metadata = {deepPath: sDeepPath};
					jQuery.extend(oChangedEntry.__metadata, oEntry.__metadata);
				}
			}
		});
	};

	/**
	 * Resets changes that have been collected.
	 *
	 * By default, only client data changes triggered through:
	 * {@link #createEntry}
	 * {@link #setProperty}
	 * are taken into account.
	 *
	 * If <code>bAll</code> is set to <code>true</code>, also deferred requests triggered through:
	 * {@link #create}
	 * {@link #update}
	 * {@link #remove}
	 * are taken into account.
	 *
	 * @param {array} [aPath] 	Array of paths that should be reset.
	 * 							If no array is passed, all changes will be reset.
	 * @param {boolean}[bAll=false] If set to true, also deferred requests are taken into account.
	 * @returns {Promise} Resolves when all regarded changes have been reseted.
	 * @public
	 */
	ODataModel.prototype.resetChanges = function(aPath, bAll) {
		var that = this, aParts, oEntityInfo = {}, oChangeObject, oEntityMetadata;

		if (bAll) {
			if (aPath) {
				aPath.forEach(function(sPath){
					that.oMetadata.loaded().then(function () {
						each(that.mDeferredGroups, function (sGroupId) {
							that.abortInternalRequest(sGroupId, {path: sPath.substring(1)});
						});
					});
				});
			} else {
				this.oMetadata.loaded().then(function () {
					each(that.mDeferredGroups, function (sGroupId) {
						that.abortInternalRequest(sGroupId);
					});
				});
			}
		}
		if (aPath) {
			each(aPath, function (iIndex, sPath) {
				that.getEntityByPath(sPath, null, oEntityInfo);
				if (oEntityInfo && oEntityInfo.propertyPath !== undefined){
					aParts = oEntityInfo.propertyPath.split("/");
					var sKey = oEntityInfo.key;
					oChangeObject = that.mChangedEntities[sKey];
					for (var i = 0; i < aParts.length - 1; i++) {
						if (oChangeObject.hasOwnProperty(aParts[i])) {
							oChangeObject = oChangeObject[aParts[i]];
						} else {
							oChangeObject = undefined;
						}
					}

					if (oChangeObject) {
						delete oChangeObject[aParts[aParts.length - 1]];
					}

					if (that.mChangedEntities[sKey]) {
						//delete metadata to check if object has changes
						oEntityMetadata = that.mChangedEntities[sKey].__metadata;
						delete that.mChangedEntities[sKey].__metadata;
						if (isEmptyObject(that.mChangedEntities[sKey]) || !oEntityInfo.propertyPath) {
							that.oMetadata.loaded().then(function () {
								that.abortInternalRequest(that._resolveGroup(sKey).groupId, {requestKey: sKey});
							});
							delete that.mChangedEntities[sKey];
							//cleanup Messages for created Entry
							sap.ui.getCore().getMessageManager().removeMessages(that.getMessagesByEntity(sKey, true));
						} else {
							that.mChangedEntities[sKey].__metadata = oEntityMetadata;
						}
					} else {
						Log.warning(that + " - resetChanges: " + sPath + " is not changed");
					}
				}
			});
		} else {
			each(this.mChangedEntities, function (sKey, oObject) {
				that.oMetadata.loaded().then(function () {
					that.abortInternalRequest(that._resolveGroup(sKey).groupId, {requestKey: sKey});
				});
				delete that.mChangedEntities[sKey];
				//cleanup Messages for created Entry
				sap.ui.getCore().getMessageManager().removeMessages(that.getMessagesByEntity(sKey, true));
			});

		}
		this.checkUpdate(true);

		return this.oMetadata.loaded();
	};

	/**
	 * Sets a new value for the given property <code>sPath</code> in the model.
	 *
	 * If the <code>changeBatchGroup</code> for the changed entity type is set to {@link #setDeferredGroups deferred},
	 * changes could be submitted with {@link #submitChanges}. Otherwise the change will be submitted directly.
	 *
	 * @param {string}  sPath Path of the property to set
	 * @param {any}     oValue Value to set the property to
	 * @param {sap.ui.model.Context} [oContext=null] The context which will be used to set the property
	 * @param {boolean} [bAsyncUpdate] Whether to update other bindings dependent on this property asynchronously
	 * @return {boolean} <code>true</code> if the value was set correctly and <code>false</code> if errors occurred
	 *                   like the entry was not found or another entry was already updated.
	 * @public
	 */
	ODataModel.prototype.setProperty = function(sPath, oValue, oContext, bAsyncUpdate) {

		var oOriginalValue, sPropertyPath, mRequests, oRequest, oOriginalEntry, oEntry,
			sResolvedPath, aParts,	sKey, oGroupInfo, oRequestHandle, oEntityMetadata,
			mChangedEntities = {}, oEntityInfo = {}, mParams, oChangeObject, bRefreshAfterChange,
			bFunction = false, that = this, bCreated,
			oEntityType, oNavPropRefInfo, bIsNavPropExpanded, mKeys, oRef, sDeepPath;

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
		sKey = oEntityInfo.key;
		oOriginalEntry = this._getObject('/' + sKey, null, true);
		oOriginalValue = this._getObject(sPath, oContext, true);

		//clone property
		if (!this.mChangedEntities[sKey]) {
			oEntityMetadata = oEntry.__metadata;
			oEntry = {};
			oEntry.__metadata = Object.assign({}, oEntityMetadata);
			if (oEntityInfo.propertyPath.length > 0){
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

		bFunction = oOriginalEntry.__metadata.created && oOriginalEntry.__metadata.created.functionImport;

		// Update property value on change object
		oChangeObject[sPropertyPath] = oValue;

		// If property is key property of ReferentialConstraint, also update the corresponding
		// navigation property
		oEntityType = this.oMetadata._getEntityTypeByPath(oEntityInfo.key);
		oNavPropRefInfo = oEntityType && this.oMetadata._getNavPropertyRefInfo(oEntityType, sPropertyPath);
		bIsNavPropExpanded = oNavPropRefInfo && oOriginalEntry[oNavPropRefInfo.name] && oOriginalEntry[oNavPropRefInfo.name].__ref;
		if (bIsNavPropExpanded && oNavPropRefInfo.keys.length === 1) {
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

				that.oMetadata.loaded().then(function() {
					//setProperty with no change does not create a request the first time so no handle exists
					that.abortInternalRequest(that._resolveGroup(sKey).groupId, {requestKey: sKey});
				});
				return true;
			}
			this.mChangedEntities[sKey].__metadata = oEntityMetadata;
		}

		oGroupInfo = this._resolveGroup(sKey);

		mRequests = this.mRequests;

		if (oGroupInfo.groupId in this.mDeferredGroups) {
			mRequests = this.mDeferredRequests;
			oRequest = this._processChange(sKey, {__metadata : oEntry.__metadata}, this.sDefaultUpdateMethod);
		} else {
			oRequest = this._processChange(sKey, this._getObject('/' + sKey), this.sDefaultUpdateMethod);
		}
		oRequest.key = sKey;
		//get params for created entries: could contain success/error handler
		mParams = oChangeObject.__metadata && oChangeObject.__metadata.created ? oChangeObject.__metadata.created : {};

		bRefreshAfterChange = this._getRefreshAfterChange(undefined, oGroupInfo.groupId);

		this.oMetadata.loaded().then(function() {
			oRequestHandle = {
				abort: function() {
					oRequest._aborted = true;
				}
			};
			that._pushToRequestQueue(mRequests, oGroupInfo.groupId,
				oGroupInfo.changeSetId, oRequest, mParams.success, mParams.error, oRequestHandle, bRefreshAfterChange);
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
		return jQuery.extend({'sap-cancel-on-close': !!bCancelOnClose}, this.mCustomHeaders, mCheckedHeaders, this.oHeaders);
	};

	/**
	 * Returns all headers and custom headers which are stored in this OData model.
	 *
	 * @return {object} The header map
	 * @public
	 */
	ODataModel.prototype.getHeaders = function() {
		return jQuery.extend({}, this.mCustomHeaders, this.oHeaders);
	};

	/**
	 * Searches the specified headers map for the specified header name and returns the found header value
	 * @param {string} sHeader The header
	 * @param {map} mHeaders The map of headers
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
	 * By default, only client data changes triggered through:
	 * {@link #createEntry}
	 * {@link #setProperty}
	 * are taken into account.
	 *
	 * If <code>bAll</code> is set to <code>true</code>, also deferred requests triggered through:
	 * {@link #create}
	 * {@link #update}
	 * {@link #remove}
	 * are taken into account.
	 *
	 * @param {boolean}[bAll=false] If set to true, deferred requests are also taken into account.
	 * @return {boolean} <code>true</code> if there are pending changes, <code>false</code> otherwise.
	 * @public
	 */
	ODataModel.prototype.hasPendingChanges = function(bAll) {
		var bChangedEntities = !isEmptyObject(this.mChangedEntities);

		if (bAll){
			bChangedEntities = bChangedEntities || this.iPendingDeferredRequests > 0;
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
	 * Returns the changed properties of all changed entities in a map which are still pending.
	 * The key is the string name of the entity and the value is an object which contains the changed properties.
	 *
	 * In contrast to the two related functions {@link #hasPendingChanges} and {@link #resetChanges}, only
	 * client data changes are supported.
	 *
	 * @return {map} the pending changes in a map
	 * @public
	 */
	ODataModel.prototype.getPendingChanges = function() {
		return merge({}, this.mChangedEntities);
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
	 * Enable/Disable XCSRF-Token handling.
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
	 * Deletes a created entry from the request queue and from the model.
	 * @param {sap.ui.model.Context} oContext The context object pointing to the created entry
	 * @public
	 */
	ODataModel.prototype.deleteCreatedEntry = function(oContext) {
		var that = this, sKey, sGroupId;
		if (oContext) {
			var sKey = oContext.getPath().substr(1);
			sGroupId = this._resolveGroup(sKey).groupId;
			that.oMetadata.loaded().then(function() {
				that.abortInternalRequest(sGroupId, {requestKey: sKey});
			});
			that._removeEntity(sKey);
			//cleanup Messages for created Entry
			sap.ui.getCore().getMessageManager().removeMessages(this.getMessagesByEntity(oContext.getPath(), true));
		}
	};

	/**
	 * Creates a new entry object which is described by the metadata of the entity type of the
	 * specified <code>sPath</code> Name. A context object is returned which can be used to bind
	 * against the newly created object.
	 *
	 * For each created entry a request is created and stored in a request queue.
	 * The request queue can be submitted by calling {@link #submitChanges}. To delete a created
	 * entry from the request queue call {@link #deleteCreatedEntry}.
	 *
	 * The optional parameter <code>mParameters.properties</code> can be used as follows:
	 * <ul>
	 *   <li><code>properties</code> could be an array containing the property names which should be included
	 *     in the new entry. Other properties defined in the entity type won't be included. </li>
	 *   <li><code>properties</code> could be an object which includes the desired properties and the
	 *     corresponding values which should be used for the created entry. </li>
	 * </ul>
	 * If <code>properties</code> is not specified, all properties in the entity type will be included in the
	 * created entry.
	 *
	 * If there are no values specified, the properties will have <code>undefined</code> values.
	 *
	 * Please note that deep creates (including data defined by navigation properties) are not supported.
	 *
	 * @param {string} sPath Name of the path to the EntitySet
	 * @param {map} mParameters A map of the following parameters:
	 * @param {array|object} [mParameters.properties] An array that specifies a set of properties or the entry
	 * @param {string} [mParameters.batchGroupId] Deprecated - use <code>groupId</code> instead
	 * @param {string} [mParameters.groupId] ID of a request group; requests belonging to the same group will be bundled in one batch request
	 * @param {string} [mParameters.changeSetId] ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {sap.ui.model.Context} [mParameters.context] The binding context
	 * @param {function} [mParameters.success] The success callback function
	 * @param {function} [mParameters.error] The error callback function
	 * @param {map} [mParameters.headers] A map of headers
	 * @param {map} [mParameters.urlParameters] A map of URL parameters
	 * @param {boolean} [mParameters.refreshAfterChange] Since 1.46; defines whether to update all bindings after submitting this change operation. See {@link #setRefreshAfterChange}
	           If given, this overrules the model-wide <code>refreshAfterChange</code> flag for this operation only.
	 *
	 * @return {sap.ui.model.Context} A Context object that points to the new created entry.
	 * @public
	 */
	ODataModel.prototype.createEntry = function(sPath, mParameters) {
		var fnSuccess, fnError, oRequest, sUrl, sETag, oContext,
			sKey, aUrlParams, sGroupId, sChangeSetId, bRefreshAfterChange,
			mUrlParams, mHeaders, mRequests, vProperties, oEntity = {},
			fnCreated,
			sMethod = "POST",
			that = this, sDeepPath, sNormalizedPath, bCanonical;

		if (mParameters) {
			vProperties = mParameters.properties;
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			fnCreated = mParameters.created;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
			bRefreshAfterChange = mParameters.refreshAfterChange;
			bCanonical = mParameters.canonicalRequest;
		}
		bCanonical = this._isCanonicalRequestNeeded(bCanonical);

		mHeaders = mHeaders || {};

		bRefreshAfterChange = this._getRefreshAfterChange(bRefreshAfterChange, sGroupId);

		sGroupId = sGroupId ? sGroupId : this.sDefaultChangeGroup;
		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		var oRequestHandle = {
			abort: function() {
				if (oRequest) {
					oRequest._aborted = true;
				}
			}
		};

		if (!sPath.startsWith("/") && !oContext) {
			sPath = "/" + sPath;
		}

		sNormalizedPath = that._normalizePath(sPath, oContext, bCanonical);
		sDeepPath = that.resolveDeep(sPath, oContext);

		function create() {
			var oCreatedContext;

			var oEntityMetadata = that.oMetadata._getEntityTypeByPath(sNormalizedPath);
			if (!oEntityMetadata) {

				assert(oEntityMetadata, "No Metadata for collection " + sNormalizedPath + " found");
				return undefined;
			}
			if (typeof vProperties === "object" && !Array.isArray(vProperties)) {
				oEntity = merge({}, vProperties);
			} else {
				for (var i = 0; i < oEntityMetadata.property.length; i++) {
					var oPropertyMetadata = oEntityMetadata.property[i];

					var bPropertyInArray = (vProperties ? vProperties.indexOf(oPropertyMetadata.name) : -1) > -1;
					if (!vProperties || bPropertyInArray)  {
						oEntity[oPropertyMetadata.name] = that._createPropertyValue(oPropertyMetadata.type);
						if (bPropertyInArray) {
							vProperties.splice(vProperties.indexOf(oPropertyMetadata.name),1);
						}
					}
				}
				if (vProperties) {
					assert(vProperties.length === 0, "No metadata for the following properties found: " + vProperties.join(","));
				}
			}
			//get EntitySet metadata for data storage
			var oEntitySetMetadata = that.oMetadata._getEntitySetByType(oEntityMetadata);
			var sUiD = "('" + uid() + "')";
			sKey = oEntitySetMetadata.name + sUiD;


			if (sDeepPath && that.oMetadata._isCollection(sDeepPath)){
				sDeepPath = sDeepPath + sUiD;
			}

			oEntity.__metadata = {
				type: "" + oEntityMetadata.entityType,
				uri: that.sServiceUrl + '/' + sKey,
				created: {//store path for later POST
					key: sNormalizedPath.substring(1),
					success: fnSuccess,
					error: fnError,
					headers: mHeaders,
					urlParameters: mUrlParams,
					groupId: sGroupId,
					changeSetId: sChangeSetId,
					eTag: sETag
				},
				deepPath: sDeepPath
			};

			sKey = that._addEntity(merge({}, oEntity));
			that.mChangedEntities[sKey] = oEntity;

			sUrl = that._createRequestUrlWithNormalizedPath(sNormalizedPath, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sDeepPath, sMethod, mHeaders, oEntity, sETag);

			oCreatedContext = that.getContext("/" + sKey, sDeepPath); // context wants a path
			oCreatedContext.bCreated = true;

			oRequest.key = sKey;
			oRequest.created = true;

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}

			that.oMetadata.loaded().then(function() {
				that._pushToRequestQueue(mRequests, sGroupId,
					sChangeSetId, oRequest, fnSuccess, fnError, oRequestHandle, bRefreshAfterChange);
				that._processRequestQueueAsync(that.mRequests);
			});
			return oCreatedContext;
		}

		// If no callback function is provided context must be returned synchronously
		if (fnCreated) {
			this.oMetadata.loaded().then(function() {
				fnCreated(create());
			});
		} else if (this.oMetadata.isLoaded()) {
			return create();
		} else {
			Log.error("Tried to use createEntry without created-callback, before metadata is available!");
		}
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
	 * Return value for a property. This can also be a ComplexType property.
	 *
	 * @param {string} sType Fully qualified name of a type
	 * @returns {any} The property value
	 * @private
	 */
	ODataModel.prototype._createPropertyValue = function(sType) {
		var oTypeInfo = this.oMetadata._splitName(sType); // name, namespace
		var sNamespace = oTypeInfo.namespace;
		var sTypeName = oTypeInfo.name;
		if (sNamespace.toUpperCase() !== 'EDM') {
			var oComplexType = {};
			var oComplexTypeMetadata = this.oMetadata._getObjectMetadata("complexType",sTypeName,sNamespace);
			assert(oComplexTypeMetadata, "Complex type " + sType + " not found in the metadata !");
			for (var i = 0; i < oComplexTypeMetadata.property.length; i++) {
				var oPropertyMetadata = oComplexTypeMetadata.property[i];
				oComplexType[oPropertyMetadata.name] = this._createPropertyValue(oPropertyMetadata.type);
			}
			return oComplexType;
		} else {
			return this._getDefaultPropertyValue(sTypeName,sNamespace);
		}
	};

	/**
	 * Returns the default value for a property.
	 * @param {string} sType The property type
	 * @param {string} sNamespace The property namespace
	 * @returns {string} Returns <code>undefined</code>
	 * @private
	 */
	ODataModel.prototype._getDefaultPropertyValue = function(sType, sNamespace) {
		return undefined;
	};

	/**
	 * Remove URL params from path and make path absolute if not already
	 *
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @param {boolean} Whether the binding path should be resolved canonical or not
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
	 * @returns {boolean} bRefreshAfterChange Whether to automatically refresh after changes
	 * @public
	 * @since 1.46.0
	 */
	ODataModel.prototype.getRefreshAfterChange = function() {
		return this.bRefreshAfterChange;
	};

	/**
	 * Defines whether all bindings are updated after a change operation.
	 *
	 * This flag can be overruled on request level by providing the <code>refreshAfterChange</code>
	 * parameter to the corresponding function (for example {@link #update}).
	 *
	 * @param {boolean} bRefreshAfterChange Whether to automatically refresh after changes
	 * @public
	 * @since 1.16.3
	 */
	ODataModel.prototype.setRefreshAfterChange = function(bRefreshAfterChange) {
		this.bRefreshAfterChange = bRefreshAfterChange;
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

	};

	/**
	 * Setting batch groups as deferred.
	 *
	 * Requests that belong to a deferred batch group have to be sent by explicitly calling {@link #submitChanges}.
	 *
	 * @param {array} aGroupIds Array of batch group IDs that should be set as deferred
	 * @deprecated Since 1.32 use {@link #setDeferredGroups} instead
	 * @public
	 */
	ODataModel.prototype.setDeferredBatchGroups = function(aGroupIds) {
		this.setDeferredGroups(aGroupIds);
	};

	/**
	 * Setting request groups as deferred.
	 *
	 * Requests that belong to a deferred group will be sent by explicitly calling {@link #submitChanges}.
	 *
	 * @param {array} aGroupIds Array of group IDs that should be set as deferred
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
	 * Returns the array of batch group IDs that are set as deferred
	 *
	 * @returns {array} aGroupIds The array of deferred batch group IDs
	 * @deprecated Since 1.32 use {@link #getDeferredGroups} instead
	 * @public
	 */
	ODataModel.prototype.getDeferredBatchGroups = function() {
		return this.getDeferredGroups();
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
	 * Definition of batch groups per entity type for two-way binding changes.
	 *
	 * @param {map} mGroups A map containing the definition of batch groups for two-way binding changes. The map has the
	 * following format:
	 * <pre>
	 * {
	 *   "EntityTypeName": {
	 *     batchGroupId: "ID",
	 *     [changeSetId: "ID",]
	 *     [single: true/false,]
	 *   }
	 * }
	 * </pre>
	 * <ul>
	 * <li><code>batchGroupId</code>: Defines the batch group for changes of the defined <i>EntityTypeName</i></li>
	 * <li><code>changeSetId</code>: ID of a <code>ChangeSet</code> which bundles the changes for the entity type.</li>
	 * <li><code>single</code>: Defines if every change will get an own change set (defaults to <code>true</code>)</li>
	 * </ul>
	 * @deprecated Since 1.32 Use {@link #setChangeGroups} instead
	 * @public
	 */
	ODataModel.prototype.setChangeBatchGroups = function(mGroups) {
		each(mGroups, function(sEntityName, oGroup) {
			oGroup.groupId = oGroup.batchGroupId;
		});
		this.setChangeGroups(mGroups);
	};

	/**
	 * Definition of groups per entity type for two-way binding changes.
	 *
	 * @param {map} mGroups A map containing the definition of batch groups for two-way binding changes. The map has the
	 * following format:
	 * <pre>
	 * {
	 *   "EntityTypeName": {
	 *     groupId: "ID",
	 *     [changeSetId: "ID",]
	 *     [single: true/false,]
	 *   }
	 * }
	 * </pre>
	 * <ul>
	 * <li><code>groupId</code>: Defines the group for changes of the defined <i>EntityTypeName</i></li>
	 * <li><code>changeSetId</code>: ID of a <code>ChangeSet</code> which bundles the changes for the entity type.</li>
	 * <li><code>single</code>: Defines if every change will get an own change set (defaults to <code>true</code>)</li>
	 * </ul>
	 * @public
	 */
	ODataModel.prototype.setChangeGroups = function(mGroups) {
		this.mChangeGroups = mGroups;
	};

	/**
	 * Returns the definition of batch groups per entity type for two-way binding changes
	 * @returns {map} Definition of batch groups for two-way binding changes
	 * @deprecated Since 1.36 use {@link #getChangeGroups} instead
	 * @public
	 */
	ODataModel.prototype.getChangeBatchGroups = function() {
		return this.getChangeGroups();
	};

	/**
	 * Returns the definition of groups per entity type for two-way binding changes
	 * @returns {map} mChangeGroups Definition of groups for two-way binding changes
	 * @public
	 */
	ODataModel.prototype.getChangeGroups = function() {
		return this.mChangeGroups;
	};

	/**
	 * Sets the <code>MessageParser</code> that is invoked upon every back-end request.
	 *
	 * This message parser analyzes the response and notifies the <code>MessageManager</code> about added and deleted messages.
	 *
	 * @param {object|null} [oParser] The <code>MessageParser</code> instance that parses the responses and adds messages to the <code>MessageManager</code>
	 * @return {sap.ui.model.odata.v2.ODataModel} Model instance for method chaining
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
	 * @private
	 */
	ODataModel.prototype._parseResponse = function(oResponse, oRequest, mGetEntities, mChangeEntities) {
		try {
			if (!this.oMessageParser) {
				this.oMessageParser = new ODataMessageParser(this.sServiceUrl, this.oMetadata);
				this.oMessageParser.setProcessor(this);
			}
			// Parse response and delegate messages to the set message parser
			this.oMessageParser.parse(oResponse, oRequest, mGetEntities, mChangeEntities, this.bIsMessageScopeSupported);
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
			this.oMetaModel = new ODataMetaModel(this.oMetadata, this.oAnnotations, {
				addAnnotationUrl : this.addAnnotationUrl.bind(this),
				annotationsLoadedPromise : this.pAnnotationsLoaded
			});
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
				Log.error("error in ODataMetaModel.loaded(): " + sMessage, sDetails,
					"sap.ui.model.odata.v2.ODataModel");
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
	 * @param {sap.ui.core.Context} [oContext] Context to resolve a relative path against
	 * @param {object} [oEntityInfo] Object that will receive information about the nearest entity
	 * @param {string} [oEntityInfo.key] The key of the entity
	 * @param {string} [oEntityInfo.propertyPath] The property path within the entity
	 * @return {object} The nearest entity object or <code>null</code> if no entity can be resolved
	 */
	ODataModel.prototype.getEntityByPath = function(sPath, oContext, oEntityInfo) {
		var sResolvedPath = Model.prototype.resolve.call(this,sPath, oContext);
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
				var sKey = this._getKey(oObject);
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
	 * @param {sap.ui.core.Context} [oContext] Context to resolve a relative path against
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
	 * @param {sap.ui.core.Context} [oContext] Context to resolve a relative path against
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
	 * @param {sap.ui.core.Context} [oContext] Context to resolve a relative path against
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
		if (!oChangedEntity) {
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
		if (!oChangedEntity) {
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
			} else {
				if (sTargetPath in this.mLaunderingState) {
					this.mLaunderingState[sTargetPath]--;
					if (this.mLaunderingState[sTargetPath] === 0) {
						delete this.mLaunderingState[sTargetPath];
					}
				}
			}
		}
		this.mLaunderingState[sPath]--;
		if (this.mLaunderingState[sPath] === 0) {
			delete this.mLaunderingState[sPath];
		}
	};

	/**
	 * Returns bRefreshAfterChange value for a change operation based on refreshAfterChange parameter and global bRefreshAfterChange flag state
	 *
	 * @param {boolean} bRefreshAfterChange Value of the <code>refreshAfterChange</code> parameter of any change operation (for example {@link #update})
	 * @param {string} sGroupId ID of the request group
	 * @private
	*/
	ODataModel.prototype._getRefreshAfterChange = function(bRefreshAfterChange, sGroupId) {
		// If no bRefreshAfterChange parameter is given given and the request group is not deferred, use the global flag
		if (bRefreshAfterChange === undefined && !(sGroupId in this.mDeferredGroups)) {
			return this.bRefreshAfterChange;
		}
		return bRefreshAfterChange;
	};

	/**
	 * Get all messages for an entity path.
	 *
	 * @param {string} sEntity The entity path or key
	 * @param {boolean} bExcludePersistent If set true persitent flagged messages are excluded.
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
	 * Check if Caching is supported. All urls must at least provide a 'sap-context-token' query parameter
	 * or a valid cache buster token segment.
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
	 * create cache key for annotations
	 *
	 * @private
	 */
	ODataModel.prototype._getAnnotationCacheKey = function(sMetadataUrl) {
		var sCacheKey;

		if (this.bUseCache) {
			if (!this.bSkipMetadataAnnotationParsing) {
				sCacheKey = sMetadataUrl + "#annotations";
			}

			if (this.sAnnotationURI) {
				if (!Array.isArray(this.sAnnotationURI)) {
					this.sAnnotationURI = [this.sAnnotationURI];
				}
				this.sAnnotationURI = this.sAnnotationURI.map(function(sUrl) {
					return sUrl + "#annotations";
				});
				sCacheKey = this.bSkipMetadataAnnotationParsing ? this.sAnnotationURI.join("_") : sCacheKey + "_" + this.sAnnotationURI.join("_");
			}
		}
		return sCacheKey;
	};

	/**
	 * Check whether the canonical requests calculation is switched on.
	 * See 'canonicalRequests' parameter of the model constructor.
	 *
	 * @return {boolean} Canonical requests calculation switched on/off
	 *
	 * @public
	 */
	ODataModel.prototype.canonicalRequestsEnabled = function() {
		return this.bCanonicalRequests;
	};

	/**
	 * Decreases the internal deferred request counter, if the request is/was deferred.
	 *
	 * @param {oRequest} Request, which was completed.
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
	 * Sets the MessageScope
	 * @param {sap.ui.model.odata.MessageScope} sMessageScope The MessageScope
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 */
	ODataModel.prototype.setMessageScope = function(sMessageScope) {
		this.sMessageScope = sMessageScope;
	};

	/**
	 * Check whether the MessageScope is supported.
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 * @returns {Promise}
	 */
	ODataModel.prototype.messageScopeSupported = function() {
		var that = this;
		return this.metadataLoaded()
			.then(function() {
				return that.bIsMessageScopeSupported;
			});
	};

	/**
	 * Enriches the context with the deep path information.
	 * @param {string} context path
	 * @param {string} [sDeepPath=sPath] context deep path
	 * @returns {sap.ui.model.Context} Enriched context
	 * @private
	 */
	ODataModel.prototype.getContext = function(sPath, sDeepPath){
		var oContext = Model.prototype.getContext.apply(this, arguments);
		if (sDeepPath){ // define or override
			oContext.sDeepPath = sDeepPath;
		} else if (!sDeepPath && !oContext.sDeepPath){ // set default value
			oContext.sDeepPath = sPath;
		}
		return oContext;
	};

	/**
	 * Check if a Context already exists for the model
	 * @param {string} [sPath] The path to check
	 * @returns {boolean} True if COntext for the given path exists
	 * @private
	 */
	ODataModel.prototype.hasContext = function(sPath){
		return this.mContexts[sPath];
	};

	/**
	 * Removes model internal metadata information, which is not known to the back-end.
	 * @param {object} entity data
	 * @returns {map} Map containing the removed information
	 * @private
	 */

	ODataModel.prototype.removeInternalMetadata = function(oEntityData){
		var sCreated, sDeepPath;
		if (oEntityData && oEntityData.__metadata) {
			sCreated = oEntityData.__metadata.created;
			sDeepPath = oEntityData.__metadata.deepPath;
			delete oEntityData.__metadata.created;
			delete oEntityData.__metadata.deepPath;
		}
		return {created: sCreated, deepPath: sDeepPath};
	};

	/**
	 * Checks whether canonical requests are necessary.
	 * @param {boolean} [bCanonicalRequest] is regarded with priority when checking whether canonical requests are required.
	 */
	ODataModel.prototype._isCanonicalRequestNeeded = function(bCanonicalRequest){
		if (bCanonicalRequest !== undefined){
			return !!bCanonicalRequest;
		} else {
			return !!this.bCanonicalRequests;
		}
	};

	return ODataModel;
});
